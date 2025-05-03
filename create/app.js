let formatOption = document.getElementById("format-option");
let cardContainer = document.querySelector(
  "#card-display-container>#display-flex",
);
let searchBar = document.getElementById("search-input");
let scryfallBar = document.getElementById("scryfall-input");
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
const PROXY_ON = false;

//console.log(rules[rules.length - 1]);

let loadedCards = [];

let deckColors = [];
let colorData = new Map();
let numberStringMap = new Map();
let deckSize = 0;
let currentFormat = formats[0];
let mouseDown = false;
let dragStartX = -100;
let dragStartY = -100;
let startX = 0;
let startY = 0;
let newX = 0;
let newY = 0;
let grabbedImage = null;
let shifftedImage = false;

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

formats.forEach((format) => {
  formatOption.innerHTML += `<option value="${format.name}">${
    format.name.charAt(0).toUpperCase() + format.name.slice(1)
  }</option>`;
});
$("#format-collapsed-info").html($("#format-option").val().toUpperCase());
refreshDeckColors();
refreshDeckCardCount();
refreshSections();

$(".card-container").each((indexed, obj) => {
  let name = $(obj).attr("data-name");
  let card = loadedCards.find((item) => item.name == name);

  if (card != null && card != undefined) {
    deckSize += card.count;
  }
});

$("#search-form").submit(function (event) {
  event.preventDefault();
  let searchInput = $("#search-input").val().trim();
  if (searchInput == "") return;
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
        : "../search?unique=cards&q=name:/.*" +
          searchInput +
          ".*/ f:" +
          currentFormat.name +
          "&order=released";
  } else {
    searchUrl =
      searchInput[0] == "\\"
        ? "https://api.scryfall.com/cards/search?unique=cards&q=" +
          searchInput.substr(1) +
          "&order=released"
        : "https://api.scryfall.com/cards/search?unique=cards&q=name:/.*" +
          searchInput +
          ".*/ f:" +
          currentFormat.name +
          "&order=released";
  }

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
            let cardEl = null;
            if (PROXY_ON) {
              cardEl = $(
                "<img src='" +
                  pathToSelf(card.image_uris.normal) +
                  "' class='search-card'>",
              );
            } else {
              cardEl = $(
                "<img src='" +
                  card.image_uris.normal +
                  "' class='search-card'>",
              );
            }

            cardEl.on("click", function (event) {
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
                refreshDeckColors();
                refreshSections();
              } else if (loadedCard.count <= 0) {
                let cardMax = cardCountMax(card, false);
                if (cardMax == -1) card.count = 10;
                else card.count = cardMax;
                loadedCard.count = card.count;
                addCard(card);
                refreshDeckColors();
                refreshSections();
              }
            });

            $("#search-section").append(cardEl);
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

function pathToSelf(url) {
  return ".." + url.substr(url.substr(9).indexOf("/") + 9);
}

$(document).ready(() => {
  refreshEvents();
  loadLocalStorage();

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

  $(".card-count-btn").on("click", (event) => {
    event.preventDefault();
    let obj = $(event.target);
    let card = loadedCards.find(
      (item) => item.name == obj.parent().parent().attr("data-name"),
    );
    let updatedCount = (event.target.innerHTML == "+" ? 1 : -1) + card.count;
    card.count = updatedCount;
    if (updatedCount <= 0) {
      removeCard(card);
      refreshDeckColors();
      refreshSections();
    } else {
      obj.parent().find("span.count-span").html(updatedCount);
    }
    refreshDeckCardCount();
  });

  $(".card-viewer-close-btn").on("click", (event) => {
    event.preventDefault();
    // we're here
    let name = $(event.target).parent().parent().find("img").attr("alt");
    let card = loadedCards.find((item) => item.name == name);
    let updatedCount = parseInt(
      $(event.target).parent().find(".card-viewer-count-input").val(),
    );
    let max = cardCountMax(card);
    if (updatedCount >= 0 && (updatedCount <= max || max == -1)) {
      card.count = updatedCount;
      let cardObj = $('.card-container[data-name="' + name + '"]');
      if (card.count <= 0) {
        removeCard(card);
        refreshDeckColors();
        refreshSections();
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

  $("#image-menu-plus").on("click", (event) => {
    event.preventDefault();
    let cardName = $(event.target).parent().attr("data-name");
    let plusBtn = $(
      `.card-container[data-name="${cardName}"]>.card-count-column>.card-count-add`,
    );
    plusBtn.click();
  });

  $("#image-menu-minus").on("click", (event) => {
    event.preventDefault();
    let cardName = $(event.target).parent().attr("data-name");
    let minusBtn = $(
      `.card-container[data-name="${cardName}"]>.card-count-column>.card-count-remove`,
    );
    minusBtn.click();
  });

  $("#image-menu-remove").on("click", (event) => {
    event.preventDefault();
    let cardName = $(event.target).parent().attr("data-name");
    let card = findLoadedCard(cardName);
    card.count = 0;
    removeCard(card);
    console.log(loadedCards);
    refreshDeckCardCount();
    refreshDeckColors();
    refreshSections();
  });

  $("#image-menu-commander").on("click", (event) => {
    event.preventDefault();
    if (
      !(currentFormat.name == "commander" || currentFormat.name == "brawl") ||
      event.target.classList.contains("disabled")
    )
      return;
    let cardName = $(event.target).parent().attr("data-name");
    let card = findLoadedCard(cardName);
    if (card != null && card != undefined) {
      let commander = loadedCards.find((item) => item.commander);
      if (commander != null && commander != undefined) {
        commander.commander = false;
        addCard(commander);
      }
      card.commander = true;
      removeCard(card);
      $(".commander-display-image").attr("src", card.image_uris.normal);
      $(".commander-display-image").attr("data-name", card.name);
      $("#commander-info-container").removeClass("hidden");
    }
    writeCardsLocalStorage();
    refreshSections();
  });

  $("#display-section").on("mousemove", (event) => {
    let dragImage = document.getElementById("drag-image");

    if (mouseDown && grabbedImage != null && grabbedImage != undefined) {
      $(grabbedImage).css(
        "transform",
        "translateY(" + (event.clientY - dragStartY) + "px)",
      );
      if (Math.abs(event.clientY - dragStartY) > 2) {
        $(grabbedImage).removeClass("card-image-hover");
        shifftedImage = true;
      }

      let top = grabbedImage.getBoundingClientRect().top;
      let under = $(grabbedImage).parent().next().children().eq(1);
      let over = $(grabbedImage).parent().prev().children().eq(1);
      let underDiff =
        under.length == 0
          ? null
          : Math.abs(top - under.get(0).getBoundingClientRect().top);
      let overDiff =
        over.length == 0
          ? null
          : Math.abs(top - over.get(0).getBoundingClientRect().top);

      let collapsed = $(grabbedImage).parent().parent().parent().hasClass("collapsed-view") || 
                      $(grabbedImage).parent().hasClass("singleton-view");
      if (underDiff != null && ((collapsed && underDiff < 17) || (!collapsed && underDiff < 41))) {
        under.parent().after($(grabbedImage).parent());
        $(grabbedImage).css("transform", "translateY(-" + underDiff + "px)");
        dragStartY = event.clientY + underDiff;
        dragStartX = event.clientX;
      } else if (overDiff != null && ((collapsed && overDiff < 17) || (!collapsed && overDiff < 41))) {
        over.parent().before($(grabbedImage).parent());
        $(grabbedImage).css(
          "transform",
          "translateY(" + 1.5 * overDiff + "px)",
        );
        dragStartY = event.clientY - overDiff;
        dragStartX = event.clientX;
      }
    }
  });

  $("#display-section").on("mouseup", (event) => {
    console.log("drag stop");
    mouseDown = false;
    dragStartX = -100;
    dragStartY = -100;
    $(grabbedImage).css("transform", "translateY(0px)");
    grabbedImage = null;
    //$("#drag-image").addClass("hidden");
  });

  $(".commander-display-image").on("contextmenu", commanderContext);

  $("#commander-menu-remove").on("click", (event) => {
    event.preventDefault();
    console.log("called");
    let cardName = $(event.target).parent().attr("data-name");
    $("#commander-info-container").addClass("hidden");
    let card = findLoadedCard(cardName);
    card.commander = false;
    addCard(card);
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

  $(searchBar).on("focus", () => {
    scryfallBar.textContent = "";
  });

  $(searchBar).on("input", (event) => {
    let value = searchBar.value;
    if (value.length > 0 && value[0] == "\\")  {
      let pos = searchBar.selectionStart;
      scryfallBar.textContent = value;
      searchBar.value = "";
      let setpos = document.createRange();
      let set = window.getSelection();
      setpos.setStart(scryfallBar.childNodes[0], pos);
      setpos.collapse(true);
      set.removeAllRanges();
      set.addRange(setpos);
      scryfallBar.focus();
    }
  });

  $(scryfallBar).on("input", (event) => {
    let content = scryfallBar.textContent;
    if (content.length == 0) {
      searchBar.value = "";
      searchBar.focus();
      return;
    }
    else if (content[0] != "\\") {
      searchBar.value = content;
      let pos = getCursorPosition(scryfallBar);
      if (pos != null) {
        searchBar.setSelectionRange(pos, pos);
      }
      searchBar.focus();
      return;
    }
    else {
      let pos = getCursorPosition(scryfallBar);
      scryfallBar.innerHTML = hylightScryfall(content);
      setCursorPosEditable(scryfallBar, pos);
    }
  });
});
// ^ $(document).ready

/**
 * Refreshes card image events.
 */
function refreshEvents() {
  let cardImages = $(".card-image");

  cardImages.off();

  cardImages.on("mousemove", (event) => {
    if (!mouseDown) {
      event.preventDefault();
      let rect = event.target.getBoundingClientRect();
      let y = event.clientY - rect.top;
      if (
        ($(event.target.parentNode).hasClass("singleton-view") ||
        $(".display-column").hasClass("collapsed-view")
          ? y >= 39
          : y >= 80) &&
        $(event.target).parent().next().length != 0
      ) {
        $(event.target).removeClass("card-image-hover");
      }
    }
  });

  cardImages.on("mouseenter", (event) => {
    event.preventDefault();
    if (grabbedImage == null) {
      $(event.target).addClass("card-image-hover");
    }
  });

  cardImages.on("mouseleave", (event) => {
    event.preventDefault();
    $(event.target).removeClass("card-image-hover");
  });

  cardImages.on("click", (event) => {
    event.preventDefault();
    if (shifftedImage) {
      writeCardsLocalStorage();
      return;
    }
    if (event.target.id == "drag-image") return;
    let obj = $(event.target);
    let card = loadedCards.find(
      (item) => item.name == obj.parent().attr("data-name"),
    );
    $(".card-viewer-image").attr("src", card.image_uris.png);
    $(".card-viewer-image").attr("alt", card.name);
    $(".card-viewer-count-input").val(card.count);
    $("#modal-section").removeClass("hidden");
    $("#card-viewer-container").removeClass("hidden");
    mouseDown = false;
  });

  cardImages.on("contextmenu", (event) => {
    event.preventDefault();
    let rect = event.target.getBoundingClientRect();
    let imageMenu = $("#image-menu");
    let commanderMenu = $("#commander-menu");
    commanderMenu.css("left", "-500px");
    commanderMenu.css("top", "-500px");
    imageMenu.css("left", event.offsetX + rect.left);
    imageMenu.css("top", event.offsetY + rect.top);
    imageMenu.attr("data-name", $(event.target).parent().attr("data-name"));
    $("#display-modal-container").css("display", "block");

    let card = findLoadedCard($(event.target).parent().attr("data-name"));
    console.log(card.type_line);
    if (card != null && card != undefined) {
      if (
        currentFormat.name != "commander" ||
        !(
          card.type_line.includes("Legendary") &&
          card.type_line.includes("Creature")
        )
      ) {
        $("#image-menu-commander").addClass("disabled");
        console.log("setting disabled");
      } else {
        $("#image-menu-commander").removeClass("disabled");
      }
    }
  });

  // draggable stuff
  cardImages.on("dragstart", (event) => {
    event.preventDefault();
  });

  cardImages.on("mousedown", (event) => {
    shifftedImage = false;
    if (!mouseDown) {
      mouseDown = true;
      dragStartX = event.clientX;
      dragStartY = event.clientY;
      grabbedImage = event.target;
      //$("#drag-image").attr("src", $(event.target).attr("src"));
    }
  });
}

$(document).on("keydown", (event) => {
  // select search bar
  let active = document.activeElement;
  let scryfallContent = scryfallBar.textContent.trimStart();
  if (event.key == "/" && active.tagName.toLowerCase() != "input" && scryfallBar != active) {
    $(searchBar).focus();
    searchBar.select();
    scryfallContent = "";
    return false;
  }
  if (event.key == "\\" && active.tagName.toLowerCase() != "input" && active.id != "scryfall-input") {
    searchBar.value = "";
    if (scryfallContent != "") {
      setCursorPosEditable(scryfallBar, scryfallContent.length);
      $(scryfallBar).focus();
      return false;
    }
    $(scryfallBar).focus();
  }
  if (event.key == "\n" && active.id == "scryfall-input") {
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
      $(".display-column").addClass("collapsed-view");
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
  if (cards == null || cards == undefined) {
    loadedCards = [];
    $.ajax({
      url: "../create/storage.json",
      type: "GET",
      success: (res) => {
        loadedCards = res.list;
        writeCardsLocalStorage();
        loadedCards.forEach((card) => {
          addCard(card);
        });
        refreshDeckFormat();
        refreshSections();
        refreshDeckColors();
        refreshEvents();
      },
      error: (xhr) => {
        alert("There was an error with your request (" +
            xhr.status +
            "): " +
            xhr.responseText);
      }
    });
  }
  else {
    //copyToClipboard(cards);
    loadedCards = JSON.parse(cards).list;
    console.log(loadedCards);
    for (let i = 0; i < loadedCards.length; i++) {
      $.ajax({
        url: PROXY_ON ? pathToSelf(loadedCards[i].uri) : loadedCards[i].uri,
        type: "GET",
        success: function (res) {
          loadedCards[i] = { ...loadedCards[i], ...res };
          if (
            (currentFormat.name == "commander" ||
              currentFormat.name == "brawler") &&
            loadedCards[i].commander != null &&
            loadedCards[i].commander != undefined &&
            loadedCards[i].commander
          ) {
            $(".commander-display-image").attr(
              "src",
              loadedCards[i].image_uris.normal,
            );
            $(".commander-display-image").attr(
              "data-name",
              loadedCards[i].name,
            );
            $("#commander-info-container").removeClass("hidden");
          } else {
            console.log(loadedCards[i].name);
            addCard(loadedCards[i]);
          }
          refreshDeckColors();
          refreshSections();
        },
        error: function (err) {
          console.log(err);
          if (
            (currentFormat.name == "commander" ||
              currentFormat.name == "brawler") &&
            loadedCards[i].commander != null &&
            loadedCards[i].commander != undefined &&
            loadedCards[i].commander
          ) {
            $(".commander-display-image").attr(
              "src",
              loadedCards[i].image_uris.normal,
            );
            $(".commander-display-image").attr(
              "data-name",
              loadedCards[i].name,
            );
            $("#commander-info-container").removeClass("hidden");
          } else {
            addCard(loadedCards[i]);
          }
          refreshDeckColors();
          refreshSections();
        }
      });
    }
  }
}

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
    add_remove: $(".display-column").hasClass("collapsed-view"),
    columns: parseInt(
      $(
        "#columns-dropdown>.dropdown-side-content>.dropdown-radio.radio-selected",
      ).attr("data-value"),
    ),
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
  return json;
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
  let commander = loadedCards.find((item) => item.commander);
  if (currentFormat.name != "commander" && currentFormat.name != "brawl") {
    if (
      commander != null &&
      commander != undefined &&
      !$("#commander-info-container").hasClass("hidden")
    ) {
      $("#commander-info-container").addClass("hidden");
      addCard(commander);
      refreshSections();
    }
  } else {
    if (
      commander != null &&
      commander != undefined &&
      $("#commander-info-container").hasClass("hidden")
    ) {
      $(".commander-display-image").attr("src", commander.image_uris.normal);
      $(".commander-display-image").attr("data-name", commander.name);
      $("#commander-info-container").removeClass("hidden");
      removeCard(commander);
      refreshSections();
    }
  }
  refreshDeckCardCount();
}

function refreshSections() {
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
  let len = Math.max(3, Math.min(
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
    for (let i = 0; i < groups[index].sections.length; i++) {
      obj.appendChild(document.getElementById(groups[index].sections[i]));
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

/**
 * Adds a card to the deck display.
 * Refreshes events and deck format, but not sections. Call <code>refreshSections()</code> after.
 * @param {*} card card object in loadedCards
 */
function addCard(card) {
  let cardAdded =
    $(`<div class="card-container" data-count="${card.count}" data-name="${card.name}" data-scryfall="${card.uri}">
  <div class="card-count-column">
    <div class="card-count">&times;<span class="count-span">${card.count}</span></div>
    <div class="card-count-add card-count-btn">&plus;</div>
    <div class="card-count-remove card-count-btn">&minus;</div>
  </div>
  <img src="${card.image_uris.normal}" class="card-image">
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
    `.card-container[data-name="${card.name}"]>.card-count-column>.card-count-btn`,
  ).on("click", (event) => {
    event.preventDefault();
    let obj = $(event.target);
    let card = loadedCards.find(
      (item) => item.name == obj.parent().parent().attr("data-name"),
    );
    let updatedCount = (event.target.innerHTML == "+" ? 1 : -1) + card.count;
    let cardMax = cardCountMax(card, false);
    if (updatedCount <= 0) {
      card.count = 0;
      removeCard(card);
      refreshDeckColors();
      refreshSections();
    } else if (updatedCount <= cardMax || cardMax == -1) {
      card.count = updatedCount;
      obj.parent().find("span.count-span").html(updatedCount);
    }
    refreshDeckCardCount();
  });

  refreshDeckFormat();
  refreshEvents();
  writeCardsLocalStorage();
}

/**
 * Removes a card from the deck display.
 * Does not refresh anything. Call <code>refreshDeckColors()</code> and <code>refreshSections()</code> after.
 */
function removeCard(card) {
  let cardObj = $(`.card-container[data-name="${card.name}"]`);
  if (cardObj.parent().children().length == 2) {
    cardObj.parent().addClass("hidden");
  }
  cardObj.remove();
  writeCardsLocalStorage();
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