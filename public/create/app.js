/**
 * Feature List:
 *  - Search bar with autocomplete and advanced search options
 *  - Search section with several pages
 *  - Sideboard section
 *  - Connection to database to save decks
 *  - Card group counts
 *  - Auto columns based on screen size
 *  - drag to scroll
 * 
 * Bug List:
 *  - MSEdge image thing messes up hover
 *  - Dragging cards don't have max or min
 *  - If some dude messes with scryfall database, images might not load -> page will not load
 */

let formatOption = null;
let cardContainer = null;
let searchBar = null;
let scryfallBar = null;
let commanderImages = null;
let deckId = "";
if (window.location.pathname.split("/").length >= 3) {
  let parts = window.location.pathname.split("/");
  deckId = parts[2];
}
let formats = [
  { name: "standard", singleton: false, size: 60 },
  { name: "modern", singleton: false, size: 60 },
  { name: "legacy", singleton: false, size: 60 },
  { name: "pauper", singleton: false, size: 60 },
  { name: "vintage", singleton: false, size: 60 },
  { name: "brawl", singleton: true, size: 60 },
  { name: "commander", singleton: true, size: 100 },
  { name: "duel", singleton: false, size: 60 },
  { name: "pioneer", singleton: false, size: 60 },
  { name: "penny", singleton: false, size: 60 },
];

let sheet = document.styleSheets[0];
let rules = sheet.cssRules;
const PROXY_ON = true;

//console.log(rules[rules.length - 1]);

let loadedCards = [];

let deckColors = [];
let colorData = new Map();
let numberStringMap = new Map();
let deckSize = 0;
let currentFormat = formats[0];
let mouseDown = false;
let startX = 0;
let startY = 0;
let newX = 0;
let newY = 0;

let savingData = {
  saving: false,
  callback: null
};

let dragData = {
  grabbedImage: null, // image element
  shiftedImage: false, // whether image has started dragging
  cardData: null,
  source: "",
  dest: "",
  dragStartX: -100,
  dragStartY: -100,
};

colorData.set("W", { name: "white", symbol: "{W}", order: 0 });
colorData.set("U", { name: "blue", symbol: "{U}", order: 1 });
colorData.set("B", { name: "black", symbol: "{B}", order: 2 });
colorData.set("R", { name: "red", symbol: "{R}", order: 3 });
colorData.set("G", { name: "green", symbol: "{G}", order: 4 });
colorData.set("C", { name: "colorless", symbol: "{C}", order: 5 });

const numberStrings = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
  "twenty",
];
for (let i = 0; i < numberStrings.length; i++) {
  numberStringMap.set(numberStrings[i], i);
}

function pathToSelf(url) {
  const obj = new URL(url);
  return obj.pathname + obj.search;
}

$(document).ready(async () => {
  formatOption = document.getElementById("format-option");
  cardContainer = document.querySelector(
    "#card-display-container>#display-flex",
  );
  searchBar = document.getElementById("search-input");
  scryfallBar = document.getElementById("scryfall-input");
  commanderImages = document.querySelectorAll(".commander-display-image");
  
  // formats
  refreshDeckColors();
  refreshDeckCardCount();
  refreshSections();

  $(".card-container.board-card").each((indexed, obj) => {
    let name = $(obj).attr("data-name");
    let card = loadedCards.find((item) => item.name == name);

    if (card != null && card != undefined) {
      deckSize += card.count;
    }
  });

  $("#search-form").submit(function (event) {
    event.preventDefault();
    let searchInput = (scryfallBar.textContent.length > 0 ? scryfallBar.textContent : $(searchBar).val().trim());
    if (searchInput == "" || searchInput == "\\") return;
    $("#search-err").text("");
    $(".search-card").remove();
    $("#no-cards-container").addClass("hidden");
    $("#search-loading-container").removeClass("hidden");
    let searchUrl = null;
    if (PROXY_ON) {
      searchUrl =
        searchInput[0] == "\\"
          ? "../search?unique=cards&q=" +
            searchInput.substr(1) +
            "&order=released"
          : "../search?unique=cards&q=name:" +
            searchInput +
            " f:" + currentFormat.name + "&order=released";
    } else {
      searchUrl =
        searchInput[0] == "\\"
          ? "https://api.scryfall.com/cards/search?unique=cards&q=" +
            searchInput.substr(1) +
            "&order=released"
          : "https://api.scryfall.com/cards/search?unique=cards&q=name:" +
            searchInput +
            " f:" + currentFormat.name + "&order=released";
    }
    console.log(searchUrl);
    $.ajax({
      url: searchUrl,
      type: "GET",
      success: function (cards) {
        $("#search-loading-container").addClass("hidden");
        if (cards.object == "list" && cards.total_cards > 0) {
          cards.data = cards.data.filter(
            (card) =>
              card.legalities != null &&
              card.legalities != undefined &&
              card.legalities[currentFormat.name] != "not_legal",
          );
          if (cards.data.length == 0) {
            //$("#search-err").html("No cards found.");
            $("#no-cards-container").removeClass("hidden");
          }

          cards.data.forEach((card) => {
            if (
              card.object == "card" &&
              card.image_uris != undefined &&
              card.image_uris.normal != undefined &&
              card.image_uris.normal != null &&
              card.legalities != null &&
              card.legalities != undefined &&
              card.legalities[currentFormat.name] != "not_legal"
            ) {
              let searchCardEl = null;
              if (PROXY_ON) {
                searchCardEl = $(
                  "<div class='search-card-wrap' data-name='" + card.name.replaceAll("'", "\\'") + "'><img inert src='" +
                    pathToSelf(card.image_uris.normal) +
                    "' class='search-card'></div>",
                );
              } else {
                searchCardEl = $(
                  "<div class='search-card-wrap' data-name='" + card.name.replaceAll("'", "\\'") + "'><img inert src='" +
                    card.image_uris.normal +
                    "' class='search-card'></div>",
                );
              }

              searchCardEl.on("click", function (event) {
                event.preventDefault();

                let loadedCard = findLoadedCard(card.name);

                if (loadedCard == null || loadedCard == undefined) {
                  let cardMax = cardCountMax(card, false);
                  if (cardMax == -1) card.count = 10;
                  else card.count = cardMax;
                  let foundCard = loadedCards.find(
                    (item) => item.name === card.name,
                  );
                  if (foundCard != null && foundCard != undefined) {
                    foundCard.count = card.count;
                    foundCard.commander = false;
                  } else {
                    loadedCards.push(card);
                  }
                  addCard(card);
                } else if (loadedCard.count <= 0) {
                  let cardMax = cardCountMax(card, false);
                  if (cardMax == -1) card.count = 10;
                  else card.count = cardMax;
                  loadedCard.count = card.count;
                  addCard(card);
                }
              });

              searchCardEl.on("mousedown", function (event) {
                dragData.shiftedImage = false;
                if (!mouseDown) {
                  mouseDown = true;
                  dragData.dragStartX = event.clientX;
                  dragData.dragStartY = event.clientY;
                  //const cardContainer = $(this).parent(".card-container");
                  const dragImage = document.getElementById("drag-image");
                  dragData.grabbedImage = this;
                  dragImage.setAttribute('data-name', card.name);
                  dragImage.setAttribute('src', (PROXY_ON ? pathToSelf(card.image_uris.normal) : card.image_uris.normal));
                  dragData.source = "search";

                  let loadedCard = findLoadedCard(card.name);
                  if (loadedCard) {
                    dragData.cardData = loadedCard;
                  }
                  else {
                    card.count = 0;
                    card.sideboard = 0;
                    dragData.cardData = card;
                  }
                }
              });

              $("#search-section").append(searchCardEl);
            }
          });
        } else {
          //$("#search-err").html("No cards found.");
          $("#no-cards-container").removeClass("hidden");
        }
      },
      error: function (err) {
        $("#search-loading-container").addClass("hidden");
        console.log(err);
        if (err.status == 404) {
          $("#no-cards-container").removeClass("hidden");
        } else {
          $("#search-err").html(
            "There was an error with your request (" +
              err.status +
              "): " +
              err.responseText,
          );
        }
      },
    });
  });

  
  //await loadDeck();
  refreshEvents();
  loadLocalStorage();
  refreshSections();

  //setup background images
  let backgroundUrls = [
    "https://th.bing.com/th/id/OIP.iHqYoRUCtV98zJH7cFU7DgHaEK?rs=1&pid=ImgDetMain",
    "https://images.ctfassets.net/s5n2t79q9icq/ZDZ2qfFsSFpQqosckY37K/45568e4fd4e2867f73981bccd0400a8d/Wallpaper_Monument_to_Endurance_1920x1080.jpg",
    "https://images.ctfassets.net/s5n2t79q9icq/qsUFcCrortyNoazihIuU3/2768ea97dc714d1c64349fc930c2027d/Wallpaper_Rite_of_the_Dragoncaller_1920x1080.jpg",
    "https://images.ctfassets.net/s5n2t79q9icq/7xb7krA8Zh5Z2yKiuh8lpH/2c0ec7ca3d5be4b96de2a7d01de7ad10/Wallpaper_Plains_1920x1080.jpg",
    "https://images.ctfassets.net/s5n2t79q9icq/34FP0kFNE4QKH50BmpTwdD/eed714cf72ce9d22369fdd6c3ca5fc79/Wallpaper_1920x1080_Rome_Vista.png",
    "https://images.ctfassets.net/s5n2t79q9icq/3PIfPHG9E0EUkKa2DqE5DW/a5295e90aa046f1c345e9d1dd8f97ab0/MKM-028_KWLSNFAG6_1920x1080.jpg",
    "https://images.ctfassets.net/s5n2t79q9icq/5jDLvIi57rYL6CQGZo6fNw/8fb3f207c15ecb0683a6c9c6f1236722/Wallpaper_1920x1080_Edgewall_Inn.png",
    "https://images.ctfassets.net/s5n2t79q9icq/MjbLsEkZVR2yT2uXCvsbP/7f86ce40fe6a863309e4a026bae3821a/Wallpaper_1920x1080_Sauron__the_Dark_Lord.png",
    "https://images.ctfassets.net/s5n2t79q9icq/yNcQcHbTSZumOsxYMHOjh/f8bf8d964aea4ae635ac0974f6c6ce63/Wallpaper_1920x1080_Nazg__l.png",
    "https://images.ctfassets.net/s5n2t79q9icq/1cY9lSNa9UR4qCBRjfipyY/851ff7d58ff4100c97de0124aa67c430/Wallpaper_1920x1080_Sunpetal_Grove.png",
    "https://images.ctfassets.net/s5n2t79q9icq/aFlaeeAkf7GlREVeHBgCV/075ab3f2660e401c558630311bbbd1e3/Wallpaper_1920x1080_Fiery_Inscription.png",
    "https://images.ctfassets.net/s5n2t79q9icq/2erBYjEqqWZBrVH8GSAca6/6ac5200a9174fe954bec8b4bd12d5e84/Elesh_Norn_1920x1080_EN.png"
  ];
  let imageContainer = $("#background-image-container");
  backgroundUrls.forEach((url) => {
    imageContainer.append(`<div class="background-image-wrap"><div class="background-img" style="--url:url('${url}');" data-url="${url}"></div></div>`);
  });

  $(".background-img").on("click", (event) => {
    let url = $(event.target).attr("data-url");
    if (url != null && url != undefined && url.length > 0) {
      $("#display-section").css("background-image", "url(" + url + ")");
      $(".background-image-wrap").removeClass("selected");
      $(event.target.parentNode).addClass("selected");
      writeViewLocalStorage();
    }
  });


  $("#format-option").on("change", (event) => {
    event.preventDefault();
    currentFormat = formats.find(
      (item) => item.name == $(event.target).val().toLowerCase(),
    );
    $("#format-collapsed-info").html($(event.target).val().toUpperCase());
    writeInfoLocalStorage();
    refreshDeckFormat();
  });

  $("#deck-name-input").on("input", (event) => {
    writeInfoLocalStorage();
  });

  $("#description-input").on("input", (event) => {
    writeInfoLocalStorage();
  });

  $("#info-collapse-btn>i").on("click", (event) => {
    event.preventDefault();
    toggleInfoSection();
  });

  $(".card-count-btn").on("click", function (event) {
    event.preventDefault();
    const cardContainer = this.closest(".card-container");
    const name = $(cardContainer).attr("data-name");
    const sideboard = cardContainer.classList.contains("sideboard-card")
    if (this.classList.contains("card-count-add")) {
      addOne(name, sideboard);
    }
    else {
      removeOne(name, sideboard);
    }
  });

  $(".card-viewer-close-btn").on("click", (event) => {
    event.preventDefault();
    
    const dialog = $("#card-viewer-container");
    const name = dialog.find("img").attr("alt");
    let card = loadedCards.find((item) => item.name == name);
    let updatedCount = parseInt(
      dialog.find(".card-viewer-count-input").val(),
    );
    let max = cardCountMax(card);
    if (updatedCount >= 0 && (updatedCount <= max || max == -1)) {
      card.count = updatedCount;
      let cardObj = $('.card-container.board-card[data-name="' + name + '"]');
      if (card.count <= 0) {
        removeCard(card, true);
      } else {
        cardObj.find("span.count-span").html(card.count);
      }
      refreshDeckCardCount();
    }

    $("#modal-section").addClass("hidden");
    $("#card-viewer-container").addClass("hidden");
  });

  $("#display-modal-container").on("click", (event) => {
    event.preventDefault();
    let modal = $("#display-modal-container");
    if (modal.css("display") != "none") modal.css("display", "none");
  });

  $("#display-modal-container").on("contextmenu", (event) => {
    event.preventDefault();
    let modal = $("#display-modal-container");
    if (modal.css("display") != "none") modal.css("display", "none");
  });

  $("#image-menu-count-input").on("keydown", function (event) {
    if (event.key == "Enter") {
      let card = findLoadedCard($("#image-menu").attr("data-name"));
      const sideboard = $("#image-menu").attr("data-sideboard") == 'true';
      const ogCount = sideboard ? card.sideboard : card.count;
      if (!card) return;
      let value = parseInt($(this).val());
      if (isNaN(value) || value < 0) {
        $(this).val(ogCount);
        return;
      }
      let max = cardCountMax(card);
      if (value > max && max != -1) $(this).val(ogCount);
      else {
        updateCardCount(card.name, value, sideboard);
      }
      $("#image-menu").click();
    }
  });

  $("#image-menu-plus").on("click", (event) => {
    event.preventDefault();
    let cardName = $("#image-menu").attr("data-name");
    const sideboard = $("#image-menu").attr("data-sideboard") == 'true';
    const cardContainer = $(`.card-container.${sideboard ? "sideboard-card" : "board-card"}[data-name="${cardName}"]`);
    if (cardContainer) {
      addOne(cardName, sideboard);
    }
  });

  $("#image-menu-minus").on("click", (event) => {
    event.preventDefault();
    let cardName = $("#image-menu").attr("data-name");
    const sideboard = $("#image-menu").attr("data-sideboard") == 'true';
    const cardContainer = $(`.card-container.${sideboard ? "sideboard-card" : "board-card"}[data-name="${cardName}"]`);
    if (cardContainer) {
      let count = removeOne(cardName, sideboard);
      if (count <= 0) 
        $("#image-menu").click();
    }
  });

  $("#image-menu-remove").on("click", (event) => {
    event.preventDefault();
    let cardName = $("#image-menu").attr("data-name");
    let card = findLoadedCard(cardName);
    card.count = 0;
    removeCard(card, true);
    console.log(loadedCards);
    refreshDeckCardCount();
  });

  $("#image-menu-commander").on("click", (event) => {
    event.preventDefault();
    if (partnerDisplay() || 
      !(currentFormat.name == "commander" || currentFormat.name == "brawl") ||
      event.target.classList.contains("disabled")
    )
      return;
    let cardName = $(event.target).parent(".card-container").attr("data-name");
    let card = findLoadedCard(cardName);
    if (card != null && card != undefined) {
      let commander = loadedCards.find((item) => item.commander);
      if (commander != null && commander != undefined) {
        commander.commander = false;
        addCard(commander, false);
      }
      card.commander = true;
      removeCard(card);
      $(commanderImages).attr("src", card.image_uris.normal);
      $(commanderImages).attr("data-name", card.name);
      $("#commander-info-container").removeClass("hidden");
    }
    writeCardsLocalStorage();
    refreshSections();
  });

  $("#image-menu-partner").on("click", (event) => {
    event.preventDefault();
    if (partnerDisplay() || 
      !(currentFormat.name == "commander" || currentFormat.name == "brawl") ||
      event.target.classList.contains("disabled")
    )  return;

    let cardName = $("#image-menu").attr("data-name");
    let card = findLoadedCard(cardName);
    if (card != null && card != undefined) {
      card.commander = true;
      removeCard(card);
      let partner = $(".commander-display-image:nth-child(2)");
      partner.attr('src', card.image_uris.normal);
      partner.attr('data-name', card.name);
      partner.removeClass("hidden");
    }
  });

  $("#main-section").on("mousemove", (event) => {
    let dragImage = document.getElementById("drag-image");

    if (mouseDown && dragData.grabbedImage) {
      const cardContainer = $(dragData.grabbedImage.closest(".card-container"));
      const translateY = (event.clientY - dragData.dragStartY);
      const translateX = (event.clientX - dragData.dragStartX);

      if ($(dragData.grabbedImage).hasClass("dragging-thumb")) {
        const top = dragData.grabbedImage.getBoundingClientRect().top;
        const rect = cardContainer[0].getBoundingClientRect();
        const cardGroup = cardContainer.parent(".card-type-container");
        if (rect.bottom + translateY < cardGroup[0].getBoundingClientRect().bottom && rect.top + translateY > cardGroup.find(".card-container:first-of-type")[0].getBoundingClientRect().top) {
          $(dragData.grabbedImage).css(
            "transform",
            "translateY(" + translateY + "px)",
          );
        }
        if (Math.abs(translateY) > 2) {
          $(dragData.grabbedImage).removeClass("card-image-hover");
          $("body").addClass("dragging");
          dragData.shiftedImage = true;
        }

        let under = cardContainer.next().find(".card-image-wrap");
        let over = cardContainer.prev().find(".card-image-wrap");
        let underDiff =
          under.length == 0
            ? null
            : Math.abs(top - under.get(0).getBoundingClientRect().top);
        let overDiff =
          over.length == 0
            ? null
            : Math.abs(top - over.get(0).getBoundingClientRect().top);


        const containerTop = rect.top;
        const dist = (cardGroup.find(".card-container").length <= 1 ? null : 
          Math.abs(cardContainer.next().length > 0 ? containerTop - cardContainer.next()[0].getBoundingClientRect().top : cardContainer.prev()[0].getBoundingClientRect().top - containerTop));

        if (underDiff != null && underDiff < dist * 0.35/*((collapsed && underDiff < 10) || (!collapsed && underDiff < 41))*/) {
          under.parent(".card-container").after(cardContainer);
          $(dragData.grabbedImage).css("transform", "translateY(-" + underDiff + "px)");
          dragData.dragStartY = event.clientY + underDiff;
          dragData.dragStartX = event.clientX;
          writeCardsLocalStorage();
        } else if (overDiff != null && overDiff < dist * 0.35 /*((collapsed && overDiff < 10) || (!collapsed && overDiff < 41))*/) {
          over.parent(".card-container").before(cardContainer);
          $(dragData.grabbedImage).css(
            "transform",
            "translateY(" + 1.5 * overDiff + "px)",
          );
          dragData.dragStartY = event.clientY - overDiff;
          dragData.dragStartX = event.clientX;
          writeCardsLocalStorage();
        }
      }
      else {
        // not restricted drag
        
        if (!dragData.shiftedImage && Math.hypot(translateX, translateY) > 2) {
          $("body").addClass("dragging");
          $(dragData.grabbedImage).removeClass("card-image-hover");
          if (cardContainer) cardContainer.addClass("hidden dragging");
          dragImage.classList.remove("hidden");
          dragData.shiftedImage = true;
          if (dragData.source != 'search') dragData.cardData = findLoadedCard(cardContainer.attr("data-name"));
          dragData.dest = "";
        }
        if (dragData.shiftedImage) {
          const dragRect = dragImage.getBoundingClientRect();
          dragImage.style.left = event.clientX - dragRect.width / 2 + "px";
          dragImage.style.top = event.clientY - dragRect.height / 2 + "px";
        }
      }
    }
  });

  $("#main-section").on("mouseup", (event) => {
    mouseDown = false;
    dragData.dragStartX = -100;
    dragData.dragStartY = -100;
    const cardContainer = $(dragData.grabbedImage).parent(".card-container");
    const dragImage = document.getElementById("drag-image");
    $(dragData.grabbedImage).css("transform", "translateY(0px)");
    $(dragData.grabbedImage).removeClass('dragging-thumb');
    $("body").removeClass("dragging");
    cardContainer.removeClass("hidden dragging");
    dragImage.style.left = "-1000px";
    dragImage.style.top = "-1000px";
    dragData.shiftedImage = false;
    dragData.grabbedImage = null;
    const dest = dragData.dest;
    const src = dragData.source;
    if (dest && dest.length > 0 && src && src != dest) {
      let card = dragData.cardData;
      const name = card.name;
      if (dest == "card-display-container") {
        if (src == "search") {
          $(".search-card-wrap[data-name='" + name.replaceAll("'", "\\'") + "']").click();
        }
        else if (src == "sideboard") {
          if (card.count > 0) {
            card.count += card.sideboard;
            card.sideboard = 0;
            let cardObj = $(`.card-container.board-card[data-name='${name.replaceAll("'", "\\'")}']`);
            cardObj.find("span.count-span").html(card.count);
          }
          else {
            card.count = card.sideboard;
            card.sideboard = 0;
            addCard(card, true);
          }
          cardContainer.remove();
          refreshDeckCardCount();
        }
      }
      else if (dest == "sideboard-section") {
        if (src == "main") {
          if (card.sideboard > 0) {
            card.sideboard += card.count;
            card.count = 0;
            let cardObj = $(`.card-container.sideboard-card[data-name='${name.replaceAll("'", "\\'")}']`);
            cardObj.find("span.count-span").html(card.sideboard);
          }
          else {
            card.sideboard = card.count;
            card.count = 0;
            addCardToSideboard(card);
          }
          cardContainer.remove();
          refreshDeckCardCount();
        }
        else if (src == "search") {
          if (card.sideboard == 0) {
            let cardAdd = cardCountMax(card, false);
            if (cardAdd == -1) cardAdd = 10;
            card.sideboard = cardAdd;
            addCardToSideboard(card);
          }
          else {
            card.sideboard++;
            let cardObj = $(`.card-container.sideboard-card[data-name='${name.replaceAll("'", "\\'")}']`);
            cardObj.find("span.count-span").html(card.sideboard);
          }
        }
      }
      else if (dest == "search-section") {
        if (src == "main") {
          removeCard(card, true);
        }
        else if (src == "sideboard") {
          card.sideboard = 0;
          cardContainer.remove();
        }
      }
    }
    dragData.dest = "";
    dragData.source = "";
    dragData.cardData = null;
    //$("#drag-image").addClass("hidden");
  });

  $(commanderImages).on("contextmenu", commanderContext);

  $("#commander-menu-remove").on("click", (event) => {
    event.preventDefault();
    const cardContainer = $(event.target).find(".card-container")
    let cardName = cardContainer.attr("data-name");
    let card = findLoadedCard(cardName);
    if (!partnerDisplay()) {
      $("#commander-info-container").addClass("hidden");
    }
    else {
      let image = $(`.commander-display-image[data-name='${cardName}']`);
      let order = image.attr("data-order");
      if (order == "0") {
        image.attr("src", $(image[0].nextElementSibling).attr("src"));
        image.attr("data-name", $(image[0].nextElementSibling).attr("data-name"));
      }
      $(".commander-display-image:nth-child(2)").addClass("hidden");
    }
    card.commander = false;
    addCard(card, false);
  });

  $(".dropdown-btn").click((event) => {
    event.preventDefault();
    $("#dropdown-container").toggleClass("focused");
  });

  $(".dropdown-item,#main-section").click((event) => {
    if (
      !$(event.target).hasClass("dropdown-side-view") &&
      !$(event.target.parentNode).hasClass("dropdown-side-view")
    )
      $("#dropdown-container").removeClass("focused");
  });

  $(".dropdown-view").click((event) => dropdownViewToggle(event.target));
  $(".dropdown-view>i").click((event) =>
    dropdownViewToggle(event.target.parentNode),
  );

  $(".dropdown-radio").on("click", (event) => {
    event.preventDefault();
    $(".dropdown-radio").each((i, obj) => {
      $(obj).removeClass("radio-selected");
    });
    $(event.target).addClass("radio-selected");
    $(event.target).parent().parent().removeClass("focused");

    let value = parseInt($(event.target).attr("data-value"));
    $(".display-column").each((i, obj) => {
      if (i < value) $(obj).removeClass("hidden");
      else $(obj).addClass("hidden");
    });
    refreshSections();
    writeViewLocalStorage();
  });

  $(".dropdown-side-view").click((event) => {
    if ($(event.target).hasClass("dropdown-side-view")) {
      $(event.target).toggleClass("focused");
      event.stopPropagation();
    }
  });

  $(".dropdown-side-view>i").click((event) => {
    $(event.target.parentNode).toggleClass("focused");
    event.stopPropagation();
  });

  $("#dropdown-background-btn").on("click", (event) => {
    $("#modal-section").removeClass("hidden");
    $("#settings-container").removeClass("hidden");
  });

  $("#settings-close-btn").on("click", (event) => {
    $("#modal-section").addClass("hidden");
    $("#settings-container").addClass("hidden");
  })

  $(scryfallBar).on("input", (event) => {
    let content = scryfallBar.textContent;
    if (content[0] != "\\") {
      let pos = getCursorPosition(scryfallBar);
      scryfallBar.innerHTML = content;
      if (pos != null) setCursorPosEditable(scryfallBar, pos);
      return;
    }
    else {
      let pos = getCursorPosition(scryfallBar);
      scryfallBar.innerHTML = hylightScryfall(content);
      setCursorPosEditable(scryfallBar, pos);
    }
  });

  $(commanderImages).on("mousemove", (event) => {
    if (partnerDisplay()) {
      let rect = event.target.getBoundingClientRect();
      let x = event.clientX - rect.left;
      let order = $(event.target).attr("data-order");
      let check = 0.65;
      if ((order == "0" && x > check * rect.width) ||
          (order == "1" && x < (1.0 - check) * rect.width)) {
          $(event.target).removeClass("partner-top");
          if (order == "0") $(event.target.nextElementSibling).addClass("partner-top");
          else $(event.target.previousElementSibling).addClass("partner-top");
      }
      else {
        if (!$(event.target).hasClass("partner-top")) {
          $(commanderImages).removeClass("partner-top");
          $(event.target).addClass("partner-top");
        }
      }
    }
  });

  $(".settings-tab").on("click", (event) => {
    $(".settings-tab").removeClass("selected");
    $(".settings-option").removeClass("selected");
    $(event.target).addClass("selected");
    $("#" + "settings-" + event.target.id.substring(13)).addClass("selected");
  });

  document.addEventListener('keydown', (event) => {
    // Check for Ctrl+S (Windows/Linux) or Cmd+S (Mac)
    if ((event.ctrlKey || event.metaKey)) {
      if (event.key === 's') {
        event.preventDefault(); // Prevent browser's save dialog
        saveDeck();
      }
      else if (event.key === 'z') {
        console.log('undo')
      }
      else if (event.key === 'y') {
        console.log('redo');
      }
      else if (event.shiftKey && event.key === 'Z') {
        console.log("redo");
      }
      else if (event.shiftKey && event.key === 'E') {
        exportDeck();
      }
    }
  });

  $("#save-deck-dropdown").on("click", () => {
    saveDeck();
  });
  
  $("#export-deck-dropdown").on("click", () => {
    exportDeck();
  });

  $("#sideboard-tab").on("click", (event) => {
    event.preventDefault();
    $("#sideboard-section").toggleClass("collapsed-view"); 
    $("#sideboard-btn").toggleClass("bx-chevron-down bx-chevron-up");
  });

  $("#drag-image").on("dragstart", (event) => {
    event.preventDefault();
  });

  $(".drag-destination").on("mouseover", function () {
    if (dragData.grabbedImage && dragData.shiftedImage) {
      const dragImage = document.getElementById("drag-image");
      dragData.dest = this.id;
    }
  });

  $(".drag-destination").on("mouseleave", function () {
    if (dragData.grabbedImage && dragData.shiftedImage) {
      const dragImage = document.getElementById("drag-image");
      if (dragData.dest == this.id) dragData.dest = "";
    }
  });

  $("#image-menu-count-row").on("click", (event) => {
    event.stopPropagation();
  });

});
// ^ $(document).ready

function documentLoaded() {
  document.getElementById("preloader").classList.add("finished");
}

// returns true if their are partners on display
function partnerDisplay() {
  return (!$("#commander-info-container").hasClass("hidden") && !$(".commander-display-image:nth-child(2)").hasClass("hidden"));
}

/**
 * Refreshes card image events.
 */
function refreshEvents() {
  let cardImages = $(".card-image-wrap");


  cardImages.off();

  cardImages.on("mousemove", function (event) {
    if (!mouseDown) {
      event.preventDefault();
      const cardContainer = $(this).parent(".card-container");
      if (cardContainer.next().length == 0) return;
      let rect = $(this)[0].getBoundingClientRect();
      const nextRect = cardContainer.next().find(".card-image-wrap")[0].getBoundingClientRect();
      let y = event.clientY - rect.top;
      if (y + rect.top > nextRect.top) {
        $(this).removeClass("card-image-hover");
      }
    }
  });

  cardImages.on("mouseenter", function (event) {
    event.preventDefault();
    if (dragData.grabbedImage == null) {
      this.classList.add("card-image-hover")
    }
  });

  cardImages.on("mouseleave", function (event) {
    event.preventDefault();
    $(this).removeClass("card-image-hover");
  });

  cardImages.on("click", function (event) {
    event.preventDefault();
    if (dragData.shiftedImage) {
      writeCardsLocalStorage();
      return;
    }
    if (this.id == "drag-image") return;
    let obj = $(this);
    const cardContainer = obj.parent(".card-container");
    let card = loadedCards.find(
      (item) => item.name == cardContainer.attr("data-name"),
    );
    $(".card-viewer-image").attr("src", card.image_uris.normal);
    $(".card-viewer-image").attr("alt", card.name);
    $(".card-viewer-count-input").val(card.count);
    $("#modal-section").removeClass("hidden");
    $("#card-viewer-container").removeClass("hidden");
    mouseDown = false;
  });

  cardImages.on("contextmenu", function (event) {
    event.preventDefault();
    let rect = this.getBoundingClientRect();
    let imageMenu = $("#image-menu");
    let commanderMenu = $("#commander-menu");
    const cardContainer = $(this).parent(".card-container");
    commanderMenu.css("left", "-500px");
    commanderMenu.css("top", "-500px");
    imageMenu.css("left", event.offsetX + rect.left);
    imageMenu.css("top", event.offsetY + rect.top);
    imageMenu.attr("data-name", cardContainer.attr("data-name"));
    const sideboard = cardContainer.hasClass("sideboard-card");
    imageMenu.attr("data-sideboard", sideboard);
    $("#display-modal-container").css("display", "block");

    let card = findLoadedCard(cardContainer.attr("data-name"));
    if (card) {
      if (partnerDisplay() && 
        (currentFormat.name != "commander" && currentFormat.name != "brawl") ||
        !(
          card.type_line.includes("Legendary") &&
          card.type_line.includes("Creature")
        )
      ) {
        $("#image-menu-commander").addClass("disabled");
      } else {
        $("#image-menu-commander").removeClass("disabled");
      }
      if ($("#commander-info-container").hasClass("hidden") ||partnerDisplay() 
        || !(currentFormat.name == "commander" || currentFormat.name == "brawl") ||
      !(
        card.type_line.includes("Legendary") &&
        card.type_line.includes("Creature") && 
        card.oracle_text.includes("Partner")
      )) {
        $("#image-menu-partner").addClass("disabled");
      }
      else {
        $("#image-menu-partner").removeClass("disabled");
      }

      imageMenu.find("#image-menu-count-input").val(sideboard ? card.sideboard : card.count);
    }
  });

  // draggable stuff
  cardImages.on("dragstart", (event) => {
    event.preventDefault();
  });

  function startDragging(event) {
    event.stopPropagation();
    dragData.shiftedImage = false;
    if (!mouseDown) {
      mouseDown = true;
      dragData.dragStartX = event.clientX;
      dragData.dragStartY = event.clientY;
      dragData.grabbedImage = this.closest(".card-image-wrap");
      $(dragData.grabbedImage).addClass("dragging-thumb");
      //$("#drag-image").attr("src", $(event.target).attr("src"));
    }
  }

  cardImages.on("mousedown", function (event) {
    dragData.shiftedImage = false;
    if (!mouseDown) {
      mouseDown = true;
      dragData.dragStartX = event.clientX;
      dragData.dragStartY = event.clientY;
      //const cardContainer = $(this).parent(".card-container");
      const dragImage = document.getElementById("drag-image");
      const cardContainer = $(this).parent(".card-container");
      const name = cardContainer.data('name');
      $(dragImage).data("name", name);
      const card = findLoadedCard(name);
      if (card) {
        dragData.grabbedImage = this;
        //dragData.grabbedImage.classList.add("dragging");
        dragImage.setAttribute('data-name', card.name);
        dragImage.setAttribute('src', (PROXY_ON ? pathToSelf(card.image_uris.normal) : card.image_uris.normal));
        if (this.closest("#display-flex")) dragData.source = 'main';
        else if (this.closest("#sideboard-section")) dragData.source = 'sideboard';
        else if (this.closest("#commander-info-container")) dragData.source = 'commander';
      }
    }
  });

  $(".image-thumb-tool").off();
  $(".icon-tool-wrapper").off();

  cardImages.find(".image-thumb-tool").on("mousedown", startDragging);

  cardImages.find(".image-minus-tool").on("click", function (event) {
    event.preventDefault();
    const cardContainer = this.closest(".card-container");
    removeOne($(cardContainer).attr("data-name"), cardContainer.classList.contains("sideboard-card"));
  });
  
  cardImages.find(".image-plus-tool").on("click", function (event) {
    event.preventDefault();
    const cardContainer = this.closest(".card-container");
    addOne($(cardContainer).attr("data-name"), cardContainer.classList.contains("sideboard-card"));
  });

  cardImages.find(".icon-tool-wrapper").on("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
  });

  cardImages.find(".icon-tool-wrapper").on("contextMenu", (event) => {
    event.preventDefault();
    event.stopPropagation();
  });

  
}

$(document).on("keydown", (event) => {
  // select search bar
  let active = document.activeElement;
  let scryfallContent = scryfallBar.textContent.trimStart();
  if (event.key == "\\"|| event.key == "/" && active.tagName.toLowerCase() != "input" && active.id != "scryfall-input") {
    if (scryfallContent != "" || event.key == "/") {
      setCursorPosEditable(scryfallBar, scryfallContent.length);
      $(scryfallBar).focus();
      return false;
    }
    $(scryfallBar).focus();
  }
  if (event.key == "Enter" && active.id == "scryfall-input") {
    // search scryfall
    document.getElementById("search-submit").click();
    return false;
  }
});

// potential colors: #246782, #a71f2a, #521987, #47553c
// at 80 luminosity: #39A2CC, #CC2735, #7C27CC, #AACC91
// at 100 llumen:    #47CBFF, #FF3042, #9B30FF, #D5FFB5

/**
 * Converts a scryfall search string into syntax highlighted HTML. 
 * @param {string} search The scryfall search string. 
 */
function hylightScryfall(search) {
  const syntaxType = {
    any: 0,
    key: 1,
    value: 2,
    kmod: 3,
    vmod: 4,
    quote: 5,
    int: 6,
    regex: 7
  };
  let colors = [
    "#47CBFF", // key
    "#DBE0ED", // modifier (ex: ':', '>', '=' ...)
    "#FF874D", // value-regular
    "#AACC91", // value-quote
    "#9013ED", // value-number
    "#C49FFF"  // regex
  ];
  let ret = "\\";
  let lastChar = "\\";
  let lastType = syntaxType.any;
  let closed = true;
  let index = 1;
  while (index < search.length) {
    let char = search[index];
    if (isAlpha(char)) {
      if (!closed) ret += char;
      else {
        if (char.toLowerCase() == 'o' && lastChar == ' ' && index <= search.length - 3 && search[index + 1].toLowerCase() == 'r' && search[index + 2] == ' ') {
          ret += char + search[index + 1];
          index += 2;
          lastChar == 'r';
          continue;
        }
        else if (lastType == syntaxType.regex) {
          ret += `<span style="color: ${colors[5]}">${char}</span>`;
        }
        else if (lastType == syntaxType.kmod || lastType == syntaxType.any) {
          closed = false;
          lastType = syntaxType.key;
          ret += `<span style="color: ${colors[0]}">${char}`;
        }
        else {
          closed = false;
          lastType = syntaxType.value;
          ret += `<span style="color: ${colors[2]}">${char}`;
        }
      }
    }
    else if (char == '-') {
      if (!closed) ret += char;
      else {
        lastType = syntaxType.kmod;
        ret += char;
      }
    }
    else if (char == '!' || char == '>' || char == '<' || char == '=' || char == ':') {
      if (!closed) {
        if (lastType == syntaxType.key) {
          closed = true;
          lastType = syntaxType.vmod;
          ret += "</span>" + char;
        }
        else ret += char;
      }
      else {
        ret += char;
        lastType = syntaxType.vmod;
      }
    }
    else if (char == '"') {
      if (!closed) {
        if (lastType == syntaxType.regex || (lastType == syntaxType.quote && lastChar == "\\")) {
          ret += char;
        }
        else if (lastType == syntaxType.quote) {
          closed = true;
          ret += '"</span>';
        }
        else {
          closed = false;
          lastType = syntaxType.quote;
          ret += `</span><span style="color: ${colors[3]}">"`;
        }
      }
      else {
        if (lastType == syntaxType.regex) ret += char;
        else {
          closed = false;
          lastType = syntaxType.quote;
          ret += `</span><span style="color: ${colors[3]}">"`;
        }
      }
    }
    else if (char == '/') {
      if (!closed) {
        if (lastType == syntaxType.regex && lastChar != "\\") {
          closed = true;
          ret += "/</span>";
        }
        else ret += char;
      }
      else {
        if (lastType == syntaxType.vmod) {
          closed = false;
          lastType = syntaxType.regex;
          ret += `<span style="color: ${colors[5]}">/`;
        }
        else ret += char;
      }
    }
    else if (char.trim().length == 0) {
      if (!closed) {
        if (lastType == syntaxType.quote || lastType == syntaxType.regex) ret += char;
        else {
          closed = true;
          lastType = syntaxType.any;
          ret += `</span><span style='color: ${colors[1]};'> </span>`;
        }
      }
      else {
        lastType = syntaxType.any;
        ret += `<span style='color: ${colors[1]};'> </span>`;
      }
    }
    else if (char == '(' || char == ')') {
      if (closed) {
        lastType = syntaxType.any;
        ret += char;
      }
      else {
        if (lastType == syntaxType.quote || lastType == syntaxType.regex) ret += char;
        else {
          closed = true;
          lastType = syntaxType.any;
          ret += `</span>${char}`;
        }
      }
    }
    else {
      if (closed && lastType == syntaxType.vmod) {
        closed = false;
        lastType = syntaxType.value;
        ret += `<span style="color: ${colors[2]}">${char}`;
      }
      else ret += char;
    }
    

    lastChar = char;
    index++;
  }
  if (!closed) ret += "</span>";
  return ret;
}

function displaySearchHelp() {
  
}

function isAlpha(char) {
  const code = char.charCodeAt(0);
  return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
}

function isDigit(char) {
  return char >= '0' && char <= '9';
}

function loadLocalStorage() {
  let cards = localStorage.getItem("cards");
  let info = localStorage.getItem("info");
  let view = localStorage.getItem("view");
  if (view != null && view != undefined) {
    view = JSON.parse(view);
    if (view.collapsed != null && view.collapsed == true) {
      toggleInfoSection(false);
    }
    if (view.card_headers != null && view.card_headers == true) {
      $(".card-type-title").addClass("hidden");
      let icon = $(".dropdown-view[data-element='card-type-title']>i");
      icon.removeClass("bxs-show");
      icon.addClass("bxs-hide");
    }
    if (view.add_remove != null && view.add_remove == true) {
      $("#display-flex").addClass("collapsed-view");
      let icon = $(".dropdown-view[data-value='collapsed-view']>i");
      icon.removeClass("bxs-show");
      icon.addClass("bxs-hide");
    }
    if (view.columns != null && view.columns != undefined) {
      $(".dropdown-radio").each((i, obj) => {
        $(obj).removeClass("radio-selected");
      });
      $(`.dropdown-radio[data-value="${view.columns}"]`).addClass(
        "radio-selected",
      );
      $(".display-column").each((i, obj) => {
        if (i < view.columns) $(obj).removeClass("hidden");
        else $(obj).addClass("hidden");
      });
    }
    if (view.background != null && view.background != undefined && view.background.length > 0) {
      $("#display-section").css("background-image", view.background);
      $(".backgroud-image-wrap").removeClass("selected");
      $(".background-img").each((i, obj) => {
        if ($(obj).css("background-image") == view.background) $(obj).addClass('selected');
      });
    }
  }
  if (info != null && info != undefined) {
    info = JSON.parse(info);
    if (info.format != null && info.format != undefined) {
      formatOption.value = info.format;
      refreshDeckFormat();
    }
    if (info.deck_name != null && info.deck_name != undefined)
      $("#deck-name-input").val(info.deck_name);
    if (info.description != null && info.description != undefined)
      $("#description-input").val(info.description);
  }
}

// loadDeck

function writeAllLocalStorage() {
  writeCardsLocalStorage();
  writeInfoLocalStorage();
  writeViewLocalStorage();
}

function writeInfoLocalStorage() {
  localStorage.setItem("info", JSON.stringify(getInfoStorageJSON()));
}

function getInfoStorageJSON() {
  let json = {
    format: currentFormat.name,
    deck_name: $("#deck-name-input").val().trim(),
    description: $("#description-input").val().trim(),
  };
  return json;
}

function writeViewLocalStorage() {
  localStorage.setItem("view", JSON.stringify(getViewStorageJSON()));
}

function getViewStorageJSON() {
  let json = {
    collapsed: $("#info-title").hasClass("hidden"),
    card_headers: $(".card-type-title").hasClass("hidden"),
    add_remove: $("#display-flex").hasClass("collapsed-view"),
    columns: parseInt(
      $(
        "#columns-dropdown>.dropdown-side-content>.dropdown-radio.radio-selected",
      ).attr("data-value"),
    ),
    background: $("#display-section").css("background-image")
  };
  return json;
}

function writeCardsLocalStorage() {
  localStorage.setItem("cards", JSON.stringify(getCardStorageJSON()));
}

/**
 * Returns the JSON object format of the currently loaded cards.
 */
function getCardStorageJSON() {
  let json = { list: [] };
  loadedCards.forEach((card) => {
    let addedCard = {};
    if (
      card.count != null &&
      card.count != undefined &&
      card.count > 0 &&
      card.uri != null &&
      card.uri != undefined
    ) {
      if (card.commander != null && card.commander != undefined)
        addedCard.commander = card.commander;
      else addedCard.commander = false;
      addedCard.count = card.count;
      addedCard.uri = card.uri;
      addedCard.name = card.name;
      addedCard.image_uris = card.image_uris;
      addedCard.color_identity = card.color_identity;
      addedCard.type_line = card.type_line;
      addedCard.oracle_text = card.oracle_text;
      json.list.push(addedCard);
    }
  });
  $(".card-type-container:not(.hidden)").each((index, parent) => {
    $(parent).children().each((i, obj) => {
      if (i != 0) {
        let addedCard = json.list.find(item => item.name.toLowerCase() == $(obj).attr("data-name").toLowerCase());
        if (addedCard != null && addedCard != undefined) addedCard.index = i;
      }
    });
  });
  const maxInteger = Number.MAX_SAFE_INTEGER;
  json.list = json.list.sort((a, b) => (a.index == null || a.index == undefined ? maxInteger : a.index) - (b.index == null || b.index == undefined ? maxInteger : b.index));
  return json;
}

async function saveDeck() {
  if (savingData.saving) {
    if (savingData.callback == null) savingData.callback = saveDeck;
    return;
  }

  let saveCards = loadedCards.filter((card) => (card.count || card.sideboard) && card.id);

  if (saveCards.length == 0) {
    return;
  }
  if (!currentFormat) {
    alert("You must select a format before saving.");
    return;
  }

  let deck = {};
  deck.format = currentFormat.name;
  let nameinput = $("#deck-name-input").val().trim();
  if (!nameinput) nameinput = "Untitled Deck";
  deck.name = nameinput;
  deck.description =  $("#description-input").val().trim();
  deck.cards = [];
  deck._id = deckId;

  saveCards.forEach((card) => {
    let addedCard = {};
    addedCard.scryfallId = card.id;
    addedCard.count = card.count || 0;
    addedCard.sideboard = card.sideboard || 0;
    if (card.commander) addedCard.commander = card.commander || false;
    deck.cards.push(addedCard);
  });

  $("#save-msg").text("Saving deck...");
  savingData.saving = true;
  fetch("/savedeck", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(deck)
  }).then((response) => {
    savingData.saving = false;
    if (!response.ok) {
      response.text().then((text) => {
        alert("There was an error saving your deck: " + text);
        $("#save-msg").text("Unable to save deck");
      });
      return;
    }
    $("#save-msg").text("Deck Saved");
    
  }).catch(error => {
    savingData.saving = false;
    alert("There was an error saving your deck: " + error.message);
    $("#save-msg").text("Unable to save deck");
  });
}

function exportDeck() {
  let exportCards = loadedCards.filter((card) => (card.count || card.sideboard) && card.id);
  let deck = {};
  deck.format = currentFormat.name;
  let nameinput = $("#deck-name-input").val().trim();
  if (!nameinput) nameinput = "Untitled Deck";
  deck.name = nameinput;
  deck.description =  $("#description-input").val().trim();
  deck.cards = [];

  exportCards.forEach((card) => {
    let addedCard = {};
    addedCard.scryfallId = card.id;
    addedCard.count = card.count || 0;
    addedCard.sideboard = card.sideboard || 0;
    if (card.commander) addedCard.commander = card.commander || false;
    deck.cards.push(addedCard);
  });

  downloadFile(deck.name.replaceAll(" ", "_") + ".json", JSON.stringify(deck), "application/json");
}

function downloadFile(filename, text, type) {
  // application/json
  // text/plain
  const blob = new Blob([text], { type: type });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Refreshes deck colors (mainly for UI) based off card out. If no color is present, it will use the colorless mana symbol.
 */
function refreshDeckColors() {
  deckColors = [];

  loadedCards.forEach((card) => {
    if (card && card.count > 0) {
      for (let i = 0; i < card.color_identity.length; i++) {
        if (!deckColors.find((item) => item == card.color_identity[i])) {
          deckColors.push(card.color_identity[i]);
        }
      }
    }
  });

  deckColors = sortColorArray(deckColors);
  if (deckColors.length == 0) deckColors = ["C"];
  $("#color-label").html("");
  $("#color-collapsed-info").html("");
  deckColors.forEach((color) => {
    color = colorData.get(color);
    $("#color-label").append(
      `<div class='card-color card-symbol-${color.symbol[1]}'>${color.symbol}</div>`,
    );
    $("#color-collapsed-info").append(
      `<div class='card-color card-symbol-${color.symbol[1]}'>${color.symbol}</div>`,
    );
  });
}

/**
 * Refreshes the card count based off of the cards out and the format.
 */
function refreshDeckCardCount() {
  let total = 0;
  loadedCards.forEach((card) => {
    let cardMax = cardCountMax(card);
    if (card.count > 0) {
      total +=
        cardMax == -1
          ? card.count
          : card.count > cardMax
            ? cardMax
            : card.count;
    }
  });
  $("#card-count-info").text(total);
  $("#collapsed-count-info").text(total);
}

/**
 * Refreshes the deck format based off of #format-option.
 */
function refreshDeckFormat() {
  let formatName = $("#format-option").val().trim();
  currentFormat = findFormat(formatName);
  $("#format-collapsed-info").html(formatName.toUpperCase());
  $("#count-max-info").text(currentFormat.size);
  $("#collapsed-count-max-info").text(currentFormat.size);
  if (currentFormat.singleton) {
    $(".card-container").each((index, object) => {
      let card = findLoadedCard($(object).attr("data-name"));
      let max = cardCountMax(card);
      if (max == -1 || max > 1) {
        $(object)
          .find(".card-count-column>*:nth-child(n + 2)")
          .css("display", "none");
      } else {
        $(object).find(".card-count-column").addClass("hidden");
      }
    });
    $(".card-container").addClass("singleton-view");
  } else {
    $(".card-count-column>*").css("display", "block");
    $(".card-count-column").removeClass("hidden");
    $(".card-container").removeClass("singleton-view");
  }

  // set or remove commander if visible
  //let commander = loadedCards.find((item) => item.commander);
  let commanders = [];
  loadedCards.forEach((card) => { if (card.commander) commanders.push(card); });
  if (currentFormat.name != "commander" && currentFormat.name != "brawl") {
    if (commanders.length > 0 && !$("#commander-info-container").hasClass("hidden")) {
      $("#commander-info-container").addClass("hidden");
      for (let i = 0; i < commanders.length; i++) addCard(commanders[i], false);
      refreshSections();
    }
  } 
  else {
    if (commanders.length > 0 && $("#commander-info-container").hasClass("hidden")) {
      let children = $("#commander-flex").children();
      if (commanders.length == 1) {
        $(commanderImages).attr("src", commanders[0].image_uris.normal);
        $(commanderImages).attr("data-name", commanders[0].name);
        removeCard(commanders[0]);
      }
      else {
        children.eq(0).attr("src", commanders[0].image_uris.normal);
        children.eq(0).attr("data-name", commanders[0].name);
        removeCard(commanders[0]);
        children.eq(1).attr("src", commanders[1].image_uris.normal);
        children.eq(1).attr("data-name", commanders[1].name);
        removeCard(commanders[1]);
        $("#commander-info-container").removeClass("hidden");
      }
      $("#commander-info-container").removeClass("hidden");
      refreshSections();
    }
  }
  refreshDeckCardCount();
}

function refreshSections() {
  return; // disabled for now
  let heights = [];
  let actualHeightLength = 0;
  $(".display-column>*").each((i, obj) => {
    heights.push({ id: obj.id, height: obj.offsetHeight });
    if (obj.id == "commander-info-container") actualHeightLength += ($(obj).hasClass("hidden") ? 0 : 1);
    else if ($(obj).children().length > 1) actualHeightLength++;
  });

  let str = "";
  heights.forEach((height) => {
    str += height.id + ",";
  });
  let groups = [];
  let len = Math.max(2, Math.min(
    actualHeightLength,
    $(".display-column:not(.hidden)").length,
  ));
  //console.log(actualHeightLength);
  let columns = $(".display-column:not(.hidden)");
  for (let i = 0; i < len; i++) {
    if (i == 0)
      groups.push({ sections: [heights[0].id], total: heights[0].height });
    else if (i == len - 1)
      groups.push({
        sections: [heights[heights.length - 1].id],
        total: heights[heights.length - 1].height,
      });
    else groups.push({ sections: [], total: 0 });
  }
  heights = heights.splice(1, heights.length - 2);
  heights = heights.sort((a, b) => b.height - a.height);
  for (let i = 0; i < heights.length; i++) {
    let min = 0;
    for (let j = 1; j < groups.length; j++) {
      if (groups[j].total < groups[min].total) min = j;
    }
    if (min < groups.length - 1) groups[min].sections.push(heights[i].id);
    else groups[min].sections.unshift(heights[i].id);
    groups[min].total += heights[i].height;
  }
  columns.each((index, obj) => {
    if (index < len) {
      for (let i = 0; i < groups[index].sections.length; i++) {
        obj.appendChild(document.getElementById(groups[index].sections[i]));
      }
    }
  });
}

function dropdownViewToggle(el) {
  let type = $(el).attr("data-type");
  let element = $(el).attr("data-element");
  let icon = $(el).find("i");
  if (type != "toggle") {
    if (icon.hasClass("bxs-show")) {
      $((type == "class" ? "." : "#") + element).addClass("hidden");
      icon.removeClass("bxs-show");
      icon.addClass("bxs-hide");
    } else {
      $((type == "class" ? "." : "#") + element).removeClass("hidden");
      icon.removeClass("bxs-hide");
      icon.addClass("bxs-show");
    }
  } else {
    $(icon).toggleClass("bxs-show");
    $(icon).toggleClass("bxs-hide");
    $(element).toggleClass($(el).attr("data-value"));
  }
  writeViewLocalStorage();
}

/**
 * Returns the maximum amount of cards legal in current deck format, or -1 if there is no limit.
 * @param {object} card loaded card object
 * @param {boolean} legality whether to use the legality of the card in the current format (default <code>true</code>)
 * @returns integer
 */
function cardCountMax(card, legality = true) {
  if (card == null || card == undefined) return -1;
  if (card.name == null || card.name == undefined) return -1;
  let name = card.name.toLowerCase();
  if (
    name == "mountain" ||
    name == "plains" ||
    name == "forest" ||
    name == "swamp" ||
    name == "island" ||
    (card.oracle_text != null &&
      card.oracle_text != undefined &&
      card.oracle_text.includes(
        "A deck can have any number of cards named " + card.name,
      ))
  )
    return -1;
  if (card.oracle_text != null || card.oracle_text != undefined) {
    let maxReg = new RegExp(
      "A deck can have up to ([a-zA-z]+) cards named " + card.name,
      "i",
    );
    let maxMatch = card.oracle_text.match(maxReg);
    if (maxMatch != null) return numberStringMap.get(maxMatch[1].toLowerCase());
  }
  return legality && currentFormat.singleton ? 1 : 4;
}

/**
 * Sorts an array of color objecs
 */
function sortColorArray(arr) {
  return arr.sort((a, b) => colorData.get(a).order - colorData.get(b).order);
}

/**
 * Toggles collapsable info section.
 */
function toggleInfoSection(writeLocal = true) {
  $("#info-title").toggleClass("hidden");
  $("#info-form").toggleClass("hidden");
  $("#collapsed-info").toggleClass("hidden");
  $("#info-section").toggleClass("info-section-collapsed");
  if (writeLocal) writeViewLocalStorage();
}

/**
 * Context menu handler function for commander image.
 */
function commanderContext(event) {
  event.preventDefault();
  let rect = event.target.getBoundingClientRect();
  let imageMenu = $("#image-menu");
  let commanderMenu = $("#commander-menu");
  imageMenu.css("left", "-500px");
  imageMenu.css("top", "-500px");
  commanderMenu.css("left", event.offsetX + rect.left);
  commanderMenu.css("top", event.offsetY + rect.top);
  commanderMenu.attr("data-name", $(event.target).attr("data-name"));
  $("#display-modal-container").css("display", "block");
}

function updateCardCount(name, count, sideboard = false) {
  let card = findLoadedCard(name);
  if (!card) return 0;
  if (sideboard) {
    card.sideboard = count;
    if (card.sideboard == 0) {
      $(`#sideboard-section .card-container[data-name="${card.name.replaceAll('"', '\\"')}"]`).remove();
      return 0;
    }
    $(`#sideboard-section .card-container[data-name="${card.name.replaceAll('"', '\\"')}"]`).each((i, obj) => {
      let countSpan = $(obj).find(".count-span");
      countSpan.text(card.sideboard);
      $(obj).attr("data-count", card.sideboard);
    });
  }
  else {
    card.count = count;
    if (card.count == 0) {
      let obj = $(`#card-display-container .card-container[data-name="${card.name.replaceAll('"', '\\"')}"]`)
      obj.remove();
      let group = obj.parent(".card-type-container");
      if (group.find(".card-container").length == 0) group.addClass("hidden");
      return 0;
    }
    $(`#card-display-container .card-container[data-name="${card.name.replaceAll('"', '\\"')}"]`).each((i, obj) => {
      let countSpan = $(obj).find(".count-span");
      countSpan.text(card.count);
      $(obj).attr("data-count", card.count);
    });
  }
  refreshDeckCardCount();
  refreshDeckColors();
  return sideboard ? card.sideboard : card.count;
}

function addOne(name, sideboard = false) {
  let card = findLoadedCard(name);
  if (!card) return;
  if (sideboard) {
    updateCardCount(name, card.sideboard + 1, true);
  }
  else if (cardCountMax(card) == -1 || card.count < cardCountMax(card)) {
    updateCardCount(name, card.count + 1);
  }
}

// returns new card count;
function removeOne(name, sideboard = false) {
  let card = findLoadedCard(name);
  if (!card) return 0;
  if (sideboard) {
    if (card.sideboard == 0) return 0;
    updateCardCount(name, card.sideboard - 1, true);
    return card.sideboard;
  }
  else {
    if (card.count == 0) return 0;
    updateCardCount(name, card.count - 1);
    return card.count;
  }
}

/**
 * Adds a card to the deck display.
 * Refreshes events and deck format, but not sections. Call <code>refreshSections()</code> after.
 * @param {*} card card object in loadedCards
 */
function addCard(card, refresh = true) {
  let cardAdded =
    $(`<div class="card-container board-card" data-count="${card.count}" data-name="${card.name}" data-scryfall="${card.uri}">
        <div class="card-count-column">
          <div class="card-count">&times;<span class="count-span">${card.count}</span></div>
          <div class="card-count-add card-count-btn">&plus;</div>
          <div class="card-count-remove card-count-btn">&minus;</div>
        </div>
        <div class="card-image-wrap clearfix">
          <img inert src="${(PROXY_ON ? pathToSelf(card.image_uris.normal) : card.image_uris.normal)}" class="card-image">
          <div class="card-image-toolbar">
          <div class="icon-tool-wrapper image-minus-tool"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-dash" viewBox="0 0 16 16">
  <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8"/>
</svg></div>
            <div class="icon-tool-wrapper image-thumb-tool"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-grid-3x2-gap-fill" viewBox="0 0 16 16">
  <path d="M1 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1zM1 9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z"></path>
</svg></div>
            <div class="icon-tool-wrapper image-plus-tool"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">
  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
</svg></div>
          </div>
        </div>
      </div>`);
  //cardAdded.data("count", 4);
  //$(cardContainer).append(cardAdded);
  if (card.type_line.includes("Creature")) {
    $("#creature-display-container").removeClass("hidden");
    $("#creature-display-container").append(cardAdded);
  } else if (card.type_line.includes("Planeswalker")) {
    $("#planeswalker-display-container").removeClass("hidden");
    $("#planeswalker-display-container").append(cardAdded);
  } else if (card.type_line.includes("Artifact")) {
    $("#artifact-display-container").removeClass("hidden");
    $("#artifact-display-container").append(cardAdded);
  } else if (card.type_line.includes("Enchantment")) {
    $("#enchantment-display-container").removeClass("hidden");
    $("#enchantment-display-container").append(cardAdded);
  } else if (card.type_line.includes("Instant")) {
    $("#instant-display-container").removeClass("hidden");
    $("#instant-display-container").append(cardAdded);
  } else if (card.type_line.includes("Sorcery")) {
    $("#sorcery-display-container").removeClass("hidden");
    $("#sorcery-display-container").append(cardAdded);
  } else if (card.type_line.includes("Land")) {
    $("#land-display-container").removeClass("hidden");
    $("#land-display-container").append(cardAdded);
  }

  $(
    `.card-container.board-card[data-name="${card.name}"] .card-count-btn`,
  ).on("click", function (event) {
    event.preventDefault();
    const cardContainer = this.closest(".card-container");
    const name = $(cardContainer).attr("data-name");
    const sideboard = cardContainer.classList.contains("sideboard-card")
    if (this.classList.contains("card-count-add")) {
      addOne(name, sideboard);
    }
    else {
      removeOne(name, sideboard);
    }
  });

  refreshDeckFormat();
  refreshEvents();
  writeCardsLocalStorage();

  if (refresh) {
    refreshDeckColors();
    refreshSections();
  }
}

// card is just a regular card, but with a sideboard: number attribute determining the number of that card in sideboard
function addCardToSideboard(card) {
  let cardAdded =
    $(`<div class="card-container sideboard-card" data-count="${card.sideboard}" data-name="${card.name}" data-scryfall="${card.uri}">
        <div class="card-count-column">
          <div class="card-count">&times;<span class="count-span">${card.sideboard}</span></div>
        </div>
        <div class="card-image-wrap clearfix">
          <img inert src="${(PROXY_ON ? pathToSelf(card.image_uris.normal) : card.image_uris.normal)}" class="card-image">
          <div class="card-image-toolbar">
            <div class="icon-tool-wrapper image-thumb-tool"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-grid-3x2-gap-fill" viewBox="0 0 16 16">
  <path d="M1 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1zM1 9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z"></path>
</svg></div>
          </div>
        </div>
    </div>`);
  $("#sideboard-display-container").append(cardAdded);

  refreshDeckFormat();
  refreshEvents();
  writeCardsLocalStorage();
}

/**
 * Removes a card from the deck display.
 * Does not refresh anything. Call <code>refreshDeckColors()</code> and <code>refreshSections()</code> after.
 */
function removeCard(card, refresh = false) {
  card.count = 0;
  let cardObj = $(`.card-container.board-card[data-name="${card.name}"]`);
  if (cardObj.parent(".card-type-container").find(".card-container").length == 0) {
    cardObj.parent(".card-type-container").addClass("hidden");
  }
  cardObj.remove();
  writeCardsLocalStorage();
  if (refresh) {
    refreshDeckColors();
    refreshSections();
    refreshDeckCardCount();
  }
}

/**
 * Finds currently loaded card object by name. Case insensitive, no trim.
 * @param {*} name name of card
 * @returns card object
 */
function findLoadedCard(name) {
  name = name.toLowerCase();
  return loadedCards.find((item) => item.name.toLowerCase() == name);
}

/**
 * Finds format object from list by name. Case insensitive, no trim.
 * @param {*} name name of format
 * @returns format object
 */
function findFormat(name) {
  name = name.toLowerCase();
  return formats.find((item) => item.name == name);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch((err) => {
    console.error("Failed to copy text: ", err);
  });
}

function getCursorPosition(node) {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const clonedRange = range.cloneRange();
  clonedRange.selectNodeContents(node);
  clonedRange.setEnd(range.endContainer, range.endOffset);
 return clonedRange.toString().length;
}

function createRange(node, targetPosition) {
  let range = document.createRange();
  range.selectNode(node);

  let pos = 0;
  const stack = [node];
  while (stack.length > 0) {
      const current = stack.pop();

      if (current.nodeType === Node.TEXT_NODE) {
          const len = current.textContent.length;
          if (pos + len >= targetPosition) {
              range.setStart(current, targetPosition - pos);
              return range;
          }
          pos += len;
      } else if (current.childNodes && current.childNodes.length > 0) {
          for (let i = current.childNodes.length - 1; i >= 0; i--) {
              stack.push(current.childNodes[i]);
          }
      }
  }

  range.setStart(node, node.childNodes.length);
  return range;
};


function setCursorPosEditable(node, pos) {
  let set = window.getSelection();
  let setpos = createRange(node, pos);
  setpos.collapse(true);
  set.removeAllRanges();
  set.addRange(setpos);
}