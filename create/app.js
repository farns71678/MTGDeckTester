let formatOption = document.getElementById("format-option");
let cardContainer = document.querySelector(
  "#card-display-container>#display-flex",
);
let searchBar = document.getElementById("search-input");
let formats = [
  { name: "standard", singleton: false },
  { name: "modern", singleton: false },
  { name: "legacy", singleton: false },
  { name: "pauper", singleton: false },
  { name: "vintage", singleton: false },
  { name: "brawl", singleton: true },
  { name: "commander", singleton: true },
  { name: "duel", singleton: false },
  { name: "pioneer", singleton: false },
  { name: "penny", singleton: false },
];

let sheet = document.styleSheets[0];
let rules = sheet.cssRules;
const PROXY_ON = false;

//console.log(rules[rules.length - 1]);

let loadedCards = [
  /*{
    object: "card",
    id: "bc6ffc1c-575b-4116-83c9-d13b29886c35",
    oracle_id: "0f5a3a09-2f07-4774-9e0f-e99d9a444166",
    multiverse_ids: [680790],
    arena_id: 94079,
    tcgplayer_id: 591055,
    name: "Aurelia, the Warleader",
    count: 4,
    commander: true,
    lang: "en",
    released_at: "2024-11-15",
    uri: "https://api.scryfall.com/cards/bc6ffc1c-575b-4116-83c9-d13b29886c35",
    scryfall_uri:
      "https://scryfall.com/card/fdn/651/aurelia-the-warleader?utm_source=api",
    layout: "normal",
    highres_image: true,
    image_status: "highres_scan",
    image_uris: {
      small:
        "https://cards.scryfall.io/small/front/b/c/bc6ffc1c-575b-4116-83c9-d13b29886c35.jpg?1730491066",
      normal:
        "https://cards.scryfall.io/normal/front/b/c/bc6ffc1c-575b-4116-83c9-d13b29886c35.jpg?1730491066",
      large:
        "https://cards.scryfall.io/large/front/b/c/bc6ffc1c-575b-4116-83c9-d13b29886c35.jpg?1730491066",
      png: "https://cards.scryfall.io/png/front/b/c/bc6ffc1c-575b-4116-83c9-d13b29886c35.png?1730491066",
      art_crop:
        "https://cards.scryfall.io/art_crop/front/b/c/bc6ffc1c-575b-4116-83c9-d13b29886c35.jpg?1730491066",
      border_crop:
        "https://cards.scryfall.io/border_crop/front/b/c/bc6ffc1c-575b-4116-83c9-d13b29886c35.jpg?1730491066",
    },
    mana_cost: "{2}{R}{R}{W}{W}",
    cmc: 6.0,
    type_line: "Legendary Creature — Angel",
    oracle_text:
      "Flying, vigilance, haste\nWhenever Aurelia attacks for the first time each turn, untap all creatures you control. After this phase, there is an additional combat phase.",
    power: "3",
    toughness: "4",
    colors: ["R", "W"],
    color_identity: ["R", "W"],
    keywords: ["Flying", "Vigilance", "Haste"],
    legalities: {
      standard: "legal",
      future: "legal",
      historic: "legal",
      timeless: "legal",
      gladiator: "legal",
      pioneer: "legal",
      explorer: "legal",
      modern: "legal",
      legacy: "legal",
      pauper: "not_legal",
      vintage: "legal",
      penny: "legal",
      commander: "legal",
      oathbreaker: "legal",
      standardbrawl: "legal",
      brawl: "legal",
      alchemy: "legal",
      paupercommander: "not_legal",
      duel: "legal",
      oldschool: "not_legal",
      premodern: "not_legal",
      predh: "not_legal",
    },
    games: ["paper", "arena", "mtgo"],
    reserved: false,
    game_changer: false,
    foil: false,
    nonfoil: true,
    finishes: ["nonfoil"],
    oversized: false,
    promo: false,
    reprint: true,
    variation: false,
    set_id: "a7ecb771-d1b6-4dec-8cf5-8d45179f21e0",
    set: "fdn",
    set_name: "Foundations",
    set_type: "core",
    set_uri:
      "https://api.scryfall.com/sets/a7ecb771-d1b6-4dec-8cf5-8d45179f21e0",
    set_search_uri:
      "https://api.scryfall.com/cards/search?order=set&q=e%3Afdn&unique=prints",
    scryfall_set_uri: "https://scryfall.com/sets/fdn?utm_source=api",
    rulings_uri:
      "https://api.scryfall.com/cards/bc6ffc1c-575b-4116-83c9-d13b29886c35/rulings",
    prints_search_uri:
      "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A0f5a3a09-2f07-4774-9e0f-e99d9a444166&unique=prints",
    collector_number: "651",
    digital: false,
    rarity: "mythic",
    flavor_text:
      "Where Razia was aloof and untouchable, Aurelia is on the frontlines, calling for war.",
    card_back_id: "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
    artist: "Slawomir Maniak",
    artist_ids: ["d887bc66-2779-416c-a1ff-d8720242063e"],
    illustration_id: "edc12370-7de5-4bdc-9313-afdbe13c8461",
    border_color: "black",
    frame: "2015",
    frame_effects: ["legendary"],
    security_stamp: "oval",
    full_art: false,
    textless: false,
    booster: false,
    story_spotlight: false,
    promo_types: ["startercollection"],
    edhrec_rank: 865,
    penny_rank: 2685,
    prices: {
      usd: "5.07",
      usd_foil: null,
      usd_etched: null,
      eur: null,
      eur_foil: null,
      tix: null,
    },
    related_uris: {
      gatherer:
        "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=680790&printed=false",
      tcgplayer_infinite_articles:
        "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=infinite&u=https%3A%2F%2Finfinite.tcgplayer.com%2Fsearch%3FcontentMode%3Darticle%26game%3Dmagic%26q%3DAurelia%252C%2Bthe%2BWarleader",
      tcgplayer_infinite_decks:
        "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=infinite&u=https%3A%2F%2Finfinite.tcgplayer.com%2Fsearch%3FcontentMode%3Ddeck%26game%3Dmagic%26q%3DAurelia%252C%2Bthe%2BWarleader",
      edhrec: "https://edhrec.com/route/?cc=Aurelia%2C+the+Warleader",
    },
    purchase_uris: {
      tcgplayer:
        "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F591055%3Fpage%3D1",
      cardmarket:
        "https://www.cardmarket.com/en/Magic/Products/Search?referrer=scryfall&searchString=Aurelia%2C+the+Warleader&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
      cardhoarder:
        "https://www.cardhoarder.com/cards?affiliate_id=scryfall&data%5Bsearch%5D=Aurelia%2C+the+Warleader&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall",
    },
  },*/
];

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

              $(
                `.card-container[data-name="${card.name}"]>.card-count-column>.card-count-btn`,
              ).on("click", (event) => {
                event.preventDefault();
                let obj = $(event.target);
                let card = loadedCards.find(
                  (item) =>
                    item.name == obj.parent().parent().attr("data-name"),
                );
                let updatedCount =
                  (event.target.innerHTML == "+" ? 1 : -1) + card.count;
                card.count = updatedCount;
                if (updatedCount <= 0) {
                  if (obj.parent().parent().parent().children().length == 2) {
                    obj.parent().parent().parent().addClass("hidden");
                  }
                  obj.parent().parent().remove();
                  refreshDeckColors();
                  refreshSections();
                } else {
                  obj.parent().find("span.count-span").html(updatedCount);
                }
                refreshDeckCardCount();
              });
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
    refreshDeckFormat();
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
      currentFormat.name != "commander" ||
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
    refreshSections();
  });

  $("#display-section").on("mousemove", (event) => {
    let dragImage = document.getElementById("drag-image");
    if (
      mouseDown &&
      $(dragImage).hasClass("hidden") &&
      Math.abs(event.clientX - dragStartX) > 3 &&
      Math.abs(event.clientY - dragStartY) > 3
    ) {
      $(dragImage).removeClass("hidden");
    }

    if (mouseDown && !$(dragImage).hasClass("hidden")) {
      let displaySection = document.getElementById("display-section");
      let displayRect = displaySection.getBoundingClientRect();
      let rect = dragImage.getBoundingClientRect();
      let x = event.clientX - rect.width / 2;
      let y = event.clientY - rect.height / 2;
      x =
        x < displayRect.left
          ? displayRect.left
          : x + rect.width - displayRect.left > displayRect.width
            ? displayRect.width + displayRect.left - rect.width
            : x;
      y =
        y < displayRect.top
          ? displayRect.top
          : y + rect.height - displayRect.top > displayRect.height
            ? displayRect.height + displayRect.top - rect.height
            : y;
      $(dragImage).css("left", x + "px");
      $(dragImage).css("top", y + "px");
    }
  });

  $("#display-section").on("mouseup", (event) => {
    console.log("drag stop");
    mouseDown = false;
    dragStartX = -100;
    dragStartY = -100;
    $("#drag-image").addClass("hidden");
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
    $("#dropdown-container").removeClass("focused");
  });

  $(".dropdown-view").click((event) => dropdownViewToggle(event.target));
  $(".dropdown-view>i").click((event) =>
    dropdownViewToggle(event.target.parentNode),
  );
});
// ^ document).ready

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
        (currentFormat.singleton ? y >= 35 : y >= 80) &&
        $(event.target).parent().next().length != 0
      ) {
        $(event.target).removeClass("card-image-hover");
      }
    }
  });

  cardImages.on("mouseenter", (event) => {
    event.preventDefault();
    $(event.target).addClass("card-image-hover");
  });

  cardImages.on("mouseleave", (event) => {
    event.preventDefault();
    $(event.target).removeClass("card-image-hover");
  });

  cardImages.on("click", (event) => {
    event.preventDefault();
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
    console.log("drag start");
    if (!mouseDown) {
      mouseDown = true;
      dragStartX = event.clientX;
      dragStartY = event.clientY;
      $("#drag-image").attr("src", $(event.target).attr("src"));
    }
  });
}

$(document).on("keydown", (event) => {
  // select search bar
  if (
    (event.key == "/" || event.key == "\\") &&
    searchBar != document.activeElement
  ) {
    $(searchBar).focus();
    searchBar.select();
    if (event.key != "\\" || searchBar.value.trim() != "") return false;
  }
});

function loadLocalStorage() {
  let cards = localStorage.getItem("cards");
  let format = localStorage.getItem("format");
  let view = localStorage.getItem("view");
  if (view != null && view != undefined) {
    view = JSON.parse(view);
    if (view.collapsed != null && view.collapsed == true) {
      toggleInfoSection();
    }
    if (view.card_headers != null && view.card_headers == false) {
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
  }
  if (format != null && format != undefined) {
    formatOption.value = format;
    refreshDeckFormat();
  }
  if (cards == null || cards == undefined) loadedCards = [];
  else {
    loadedCards = JSON.parse(cards).list;
    for (let i = 0; i < loadedCards.length; i++) {
      $.ajax({
        url: loadedCards[i].uri,
        type: "GET",
        success: function (res) {
          loadedCards[i] = { ...loadedCards[i], ...res };
          console.log(loadedCards[i]);
          addCard(loadedCards[i]);
          refreshDeckColors();
          refreshSections();
        },
        error: function (err) {
          console.log(err);
        },
      });
    }
  }
}

function writeAllLocalStorage() {
  writeCardsLocalStorage();
  writeFormatLocalStorage();
  writeViewLocalStorage();
}

function writeFormatLocalStorage() {
  localStorage.setItem("format", currentFormat.name);
}

function writeViewLocalStorage() {
  localStorage.setItem("view", JSON.stringify(getViewStorageJSON()));
}

function getViewStorageJSON() {
  let json = {
    collapsed: $("#info-title").hasClass("hidden"),
    card_headers: $(".card-type-title").hasClass("hidden"),
    add_remove: $(".display-column").hasClass("collapsed-view"),
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
  /*$(".card-container").each((i, obj) => {
    let name = $(obj).attr("data-name");
    let loadedCard = loadedCards.find((item) => item.name === name);
    if (loadedCard && loadedCard.count > 0) {
      for (let i = 0; i < loadedCard.color_identity.length; i++) {
        if (!deckColors.find((item) => item == loadedCard.color_identity[i])) {
          deckColors.push(loadedCard.color_identity[i]);
        }
      }
    }
  });*/

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
    if (card.count > 0) {
      total +=
        cardCountMax(card) == -1 || !currentFormat.singleton ? card.count : 1;
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
  if (currentFormat.singleton) {
    $(".card-container").each((index, object) => {
      let card = findLoadedCard($(object).attr("data-name"));
      let max = cardCountMax(card);
      if (max == -1) {
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
  writeFormatLocalStorage();
  refreshDeckCardCount();
}

function refreshSections() {
  let heights = [];
  $(".display-column>*").each((i, obj) => {
    heights.push({ id: obj.id, height: obj.offsetHeight });
  });

  let groups = [
    { sections: [heights[0].id], total: heights[0].height },
    { sections: [], total: 0 },
    {
      sections: [heights[heights.length - 1].id],
      total: heights[heights.length - 1].height,
    },
  ];
  heights = heights.splice(1, heights.length - 2);
  heights = heights.sort((a, b) => b.height - a.height);
  for (let i = 0; i < heights.length; i++) {
    let min = 0;
    for (let j = 1; j < groups.length; j++) {
      if (groups[j].total < groups[min].total) min = j;
    }
    if (min < 2) groups[min].sections.push(heights[i].id);
    else groups[min].sections.unshift(heights[i].id);
    groups[min].total += heights[i].height;
  }
  $(".display-column").each((index, obj) => {
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
}

/**
 * Returns the maximum amount of cards legal in current deck format, or -1 if there is no limit.
 * @param {object} card loaded card object
 * @returns integer
 */
function cardCountMax(card, legality = true) {
  if (card == null || card == undefined) return -1;
  let name = card.name.toLowerCase();
  if (
    name == "mountain" ||
    name == "plains" ||
    name == "forest" ||
    name == "swamp" ||
    name == "island"
  )
    return -1;
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
function toggleInfoSection() {
  $("#info-title").toggleClass("hidden");
  $("#info-form").toggleClass("hidden");
  $("#collapsed-info").toggleClass("hidden");
  $("#info-section").toggleClass("info-section-collapsed");
  writeViewLocalStorage();
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
    $(`<div class="card-container" data-count="4" data-name="${card.name}" data-scryfall="${card.uri}">
  <div class="card-count-column">
    <div class="card-count">&times;<span class="count-span">4</span></div>
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
