let formatOption = document.getElementById("format-option");
let cardContainer = document.querySelector(
  "#card-display-container>#display-flex",
);
let searchBar = document.getElementById("search-input");
let formats = [
  {name: "standard", singleton: false},
  {name: "modern", singleton: false},
  {name: "legacy", singleton: false},
  {name: "pauper", singleton: false},
  {name: "vintage", singleton: false},
  {name: "brawl", singleton: false},
  {name: "commander", singleton: true},
  {name: "duel", singleton: false},
  {name: "pioneer", singleton: false},
  {name: "penny", singleton: false},
];
let loadedCards = [
  {
    object: "card",
    id: "bc6ffc1c-575b-4116-83c9-d13b29886c35",
    oracle_id: "0f5a3a09-2f07-4774-9e0f-e99d9a444166",
    multiverse_ids: [680790],
    arena_id: 94079,
    tcgplayer_id: 591055,
    name: "Aurelia, the Warleader",
    count: 4,
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
  },
];

let deckColors = [];
let colorData = new Map();
let numberStringMap = new Map();
let deckSize = 0;
let currentFormat = formats[0];

colorData.set("W", { name: "white", symbol: "{W}", order: 0 });
colorData.set("U", { name: "blue", symbol: "{U}", order: 1 });
colorData.set("B", { name: "black", symbol: "{B}", order: 2 });
colorData.set("R", { name: "red", symbol: "{R}", order: 3 });
colorData.set("G", { name: "green", symbol: "{G}", order: 4 });
colorData.set("C", { name: "colorless", symbol: "{C}", order: 5 });

const numberStrings = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];
for (let i = 0; i < numberStrings.length; i++) {
  numberStringMap.set(numberStrings[i], i);
}

formats.forEach((format) => {
  formatOption.innerHTML += `<option name="${format.name}">${format.name.charAt(0).toUpperCase() + format.name.slice(1)}</option>`;
});
$("#format-collapsed-info").html($("#format-option").val().toUpperCase());
refreshDeckColors();
refreshDeckCardCount();

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
  let searchUrl =
    searchInput[0] == "\\"
      ? "https://api.scryfall.com/cards/search?unique=cards&q=" + searchInput.substr(1) + "&order=released"
      : "https://api.scryfall.com/cards/search?unique=cards&q=name:/.*" +
        searchInput +
        ".*/&order=released";

  $.ajax({
    url: searchUrl,
    type: "GET",
    success: function (cards) {
      if (cards.object == "list" && cards.total_cards > 0) {
        let format = $("#format-option").val().toLowerCase();
        cards.data.forEach((card) => {
          if (
            card.object == "card" &&
            card.image_uris != undefined &&
            card.image_uris.normal != undefined &&
            card.image_uris.normal != null &&
            card.legalities != null &&
            card.legalities != undefined &&
            card.legalities[format] != "not_legal"
          ) {
            let cardEl = $(
              "<img src='" +
                pathToSelf(card.image_uris.normal) +
                "' class='search-card'>",
            );

            cardEl.on("click", function (event) {
              event.preventDefault();

              let added = false;
              $(cardContainer)
                .children()
                .each((i, object) => {
                  $(object)
                    .children()
                    .each((index, element) => {
                      if ($(element).attr("data-name") === card.name)
                        added = true;
                    });
                });

              if (!added) {
                if ($("#format-option").val().toLowerCase() != "commander")
                  card.count = 4;
                else card.count = 1;
                let foundCard = loadedCards.find(
                  (item) => item.name === card.name,
                );
                if (foundCard != null && foundCard != undefined) {
                  foundCard.count = card.count;
                } else {
                  loadedCards.push(card);
                }
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
                  $("#creature-display-container").show();
                  $("#creature-display-container").append(cardAdded);
                } else if (card.type_line.includes("Planeswalker")) {
                  $("#planeswalker-display-container").show();
                  $("#planeswalker-display-container").append(cardAdded);
                } else if (card.type_line.includes("Artifact")) {
                  $("#artifact-display-container").show();
                  $("#artifact-display-container").append(cardAdded);
                } else if (card.type_line.includes("Enchantment")) {
                  $("#enchantment-display-container").show();
                  $("#enchantment-display-container").append(cardAdded);
                } else if (card.type_line.includes("Instant")) {
                  $("#instant-display-container").show();
                  $("#instant-display-container").append(cardAdded);
                } else if (card.type_line.includes("Sorcery")) {
                  $("#sorcery-display-container").show();
                  $("#sorcery-display-container").append(cardAdded);
                } else if (card.type_line.includes("Land")) {
                  $("#land-display-container").show();
                  $("#land-display-container").append(cardAdded);
                }
                refreshDeckColors();
                refreshDeckCardCount();
              }

              refreshEvents();
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
                    obj.parent().parent().parent().css("display", "none");
                  }
                  obj.parent().parent().remove();
                  refreshDeckColors();
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
        $("#search-err").html("No cards found.");
      }
    },
    error: function (err) {
      console.log(err);
      if (err.status == 404) {
        $("#search-err").html("No cards found.");
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

  if (
    localStorage.getItem("info-collapsed") != null &&
    localStorage.getItem("info-collapsed") == "true"
  ) {
    toggleInfoSection();
  }

  $("#format-option").on("change", (event) => {
    event.preventDefault();
    let format = formats.find(item => item.name == $(event.target).val().toLowerCase());
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
      if (obj.parent().parent().parent().children().length == 2) {
        obj.parent().parent().parent().css("display", "none");
      }
      obj.parent().parent().remove();
      refreshDeckColors();
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
    if (
      card.name != "Mountain" &&
      card.name != "Plains" &&
      card.name != "Island" &&
      card.name != "Forest" &&
      card.name != "Swamp" &&
      updatedCount >= 0 &&
      updatedCount <= 4
    ) {
      card.count = updatedCount;
      let cardObj = $('.card-container[data-name="' + name + '"]');
      if (card.count <= 0) {
        if (cardObj.parent().children().length == 2) {
          cardObj.parent().css("display", "none");
        }
        cardObj.remove();
      } else {
        cardObj.find("span.count-span").html(card.count);
      }
      refreshDeckCardCount();
    }

    $("#modal-section").addClass("hidden");
    $("#card-viewer-container").addClass("hidden");
  });
});

function refreshEvents() {
  $(".card-image").off();

  $(".card-image").on("mousemove", (event) => {
    event.preventDefault();
    let rect = event.target.getBoundingClientRect();
    let y = event.clientY - rect.top;
    if (y >= 80 && $(event.target).parent().next().length != 0) {
      $(event.target).removeClass("card-image-hover");
    }
  });

  $(".card-image").on("mouseenter", (event) => {
    event.preventDefault();
    $(event.target).addClass("card-image-hover");
  });

  $(".card-image").on("mouseleave", (event) => {
    event.preventDefault();
    $(event.target).removeClass("card-image-hover");
  });

  $(".card-image").on("click", (event) => {
    event.preventDefault();
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

  $(".card-image").on("contextmenu", (event) => {
    event.preventDefault();
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

/**
 * Refreshes deck colors (mainly for UI) based off card out. If no color is present, it will use the colorless mana symbol. 
 */
function refreshDeckColors() {
  deckColors = [];
  $(".card-container").each((i, obj) => {
    let name = $(obj).attr("data-name");
    let loadedCard = loadedCards.find((item) => item.name === name);
    if (loadedCard && loadedCard.count > 0) {
      for (let i = 0; i < loadedCard.color_identity.length; i++) {
        if (!deckColors.find((item) => item == loadedCard.color_identity[i])) {
          deckColors.push(loadedCard.color_identity[i]);
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
    total += card.count;
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
  if (currentFormat.singleton) {
    $(".card-container").each((index, object) => {
      let card = findLoadedCard($(object).attr('data-name'));
      let max = cardCountMax(card);
      if (max == -1) {
        $(object).find(".card-count-column>*:nth-child(n + 1)").css("display", "none");
      }
      else {
        $(object).find(".card-count-column").css("display", "none");
      }
    });
  }
  else {
    $(".card-count-column>*:nth-child(n + 1)").css("display", "none");
    $(".card-count-column").css("display", "none");
  }
  refreshDeckCardCount();
}

/**
 * Returns the maximum amount of cards legal in current deck format, or -1 if there is none
 * @param {object} card loaded card object
 * @returns integer
 */
function cardCountMax(card) {
  if (card == null || card == undefined) return -1;
  let name = card.name.toLowerCase();
  console.log(name);
  if (name == "mountain" || name == "plains" || name == "forest" || name == "swamp" || name == "island") return -1;
  return (currentFormat.singleton ? 1 : 4);
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
  if ($("#info-title").hasClass("hidden")) {
    localStorage.setItem("info-collapsed", "true");
  } else {
    localStorage.setItem("info-collapsed", "false");
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
  return formats.find(item => item.name == name);
}
