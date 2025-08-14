/**
 * Bug List: 
 * Can't import file twice in a row
 * Context menu doesn't follow card on window resize
 * add card input does focus after use
 * 
 * Feature List:
 * Type line fade in multi result & overflow deck name
 * Card details view
 * sin input auto select
 * Stats view
 * Deck color-ed deck name
 * Settings menu
 * Commander / Brawler view
 * Dragable cards (and ordering)
 * Clear error msg
 */

const formats = [
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

const cardTypes = [ "Creature", "Planeswalker", "Enchantment", "Artifact", "Instant", "Sorcery", "Land", "Sideboard"];

let symbolMap = new Map();
let cardMap = new Map();
initSymbolMap(symbolMap);

let formDisabled = false;

$(document).ready(() => {

  fillFormats();
  fitSVGs();
  initCardGroups(cardTypes);

  fitTooltips();

  $("#widget-form").submit(submitForm);
  $(".widget-icon-btn.tooltip-container").on("click", (e) => {
    if (e.target.classList.contains('tooltip-text')) e.stopImmediatePropagation();
  });
  $("#multiple-cards-cancel-btn").on("click", multiResultsCancel);
  $("#card-add-submit").on("click", () => { 
    $("#widget-form>input[type=submit]").click(); 
  });
  $("#widget-upload-btn,#widget-tool-upload").on("click", () => { 
    $("#widget-file-upload").click(); 
  });
  $("#widget-deck-load-btn,#widget-tool-deck-load").on("click", () => { 
    $("#widget-deck-upload").click(); 
  });
  $("#widget-container").on("click", () => { 
    $("#widget-right-click").addClass("hidden"); 
  });
  $("#right-click-delete").on("click", deleteCard);
  $("#widget-file-upload").on("change", importFile);
  $("#widget-export-btn,#widget-tool-export").on("click", exportFile);
  $("#widget-deck-upload").on("change", loadDeck);
  $("#widget-clear-btn,#widget-tool-clear").on("click", removeAll);
  $("#widget-deck-format-input").on("change", updateFormat);
  $("#right-click-sideboard").on("click", addToSideboard);
  $("#right-click-remove-sideboard").on("click", removeFromSideboard);
  $("#context-menu-count-input").on("click", (e) => { e.stopPropagation(); });
  $("#context-menu-count-input").on("keydown", function (e) {
    if (e.key === "Enter") menuUpdateCount(this);
  })
  $("#widget-name-input").on("keydown", function (e) {
    if (e.key === "Enter") e.preventDefault();
  });
  $("#widget-container").on("contextmenu", function () {
    $("#widget-right-click").addClass('hidden');
  });
  $("#widget-tool-stats").on("click", function () {
    $("#widget-stats-container").toggleClass("not-visible");
    $("#widget-deck-display-container").toggleClass("not-visible");
  });
  //$("#widget-name-input").on("input", resizeNameInput);
});

function fitTooltips() {
  $(".tooltip-text.bottom,.tooltip-text.top").each(function () {
    $(this).css({"margin-left": '-' + (this.getBoundingClientRect().width / 2) + 'px'});
  })

  $(".tooltip-text.right,.tooltip-text.left").each(function () {
    $(this).css({"margin-top": '-' + (this.getBoundingClientRect().height / 2) + 'px'});
  });
}

async function submitForm(e) {
  e.preventDefault();
  if (formDisabled) return;

  $("#widget-form-err").html("");

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  let name = data.card.trim().toLowerCase();
  let count = parseInt(data.count);
  if (isNaN(count)) count = 4;
  if (name.length == 0) return;

  // else add card
  formDisabled = true;
  $("#card-add-input")[0].disabled = true;
  $("#widget-form>input[type=submit]")[0].disabled = true;

  let card = await findCard(name);
  if (card == null) {
    // no card found
    console.log("card not found");
    logErr("Card not found");
  }
  else if (card.total_cards == undefined) {
    // one card found
    console.log("one card found");
    if (!addCard(card, count)) {
      logErr("Card already in deck");
    }
    else {
      let cardInput = $("#card-add-input");
      cardInput.val("");
      enableForm();
      cardInput[0].focus();
    }
  }
  else {
    // multiple cards found
    console.log("multiple results");
    handleMultiResults(card, count);
  }
  
  enableForm();
}

function enableForm() {
  formDisabled = false;
  $("#card-add-input")[0].disabled = false;
  $("#widget-form>input[type=submit]")[0].disabled = false;
}

function multiResultsCancel() {
  $("#widget-modal-container").addClass("hidden");
  $("#card-add-input")[0].focus();
}

async function findCard(name) {
  let card = cardMap.get(name);
  if (card == undefined || card == null) {
    card = await fetch('https://api.scryfall.com/cards/search?unique=cards&q=' + name + '&order=released')
            .then((res) => {
              if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
              }
              return res.json();
            })
            .then((data) => {
              if (data.total_cards == 1) return data.data[0];
              return data;
            })
            .catch((err) => {
              console.log(err);
              return null;
            });
    if (card != null && card.total_cards == undefined) {
      cardMap.set(card.name.toLowerCase(), card);
    }
  }
  return card;
}

function addCard(card, count) {
  // check if card is already added
  if (document.querySelector(`.card-group-card[data-name="${card.name.replaceAll("\"", "\\\"")}"]`) != null) {
    return false;
  }
  const type = cardTypes.find(type => card.type_line.includes(type));
  let group = document.getElementById(type.toLowerCase() + "-card-group");
  let addedCard = $(`<div class="card-group-card" data-name="${card.name}">
          <div class="card-group-card-count">${count}</div>
          <div class="card-group-card-name">
            <svg class="fit-text">
              <text>${card.name}</text>
            </svg>
          </div>
          <div class="card-group-card-cost"></div>
        </div>`);
  let cost = null;
  if (card.card_faces == undefined) {
    cost = costStringToArray(card.mana_cost);
  } else {
    cost = costStringToArray(card.card_faces[0].mana_cost);
  }
  cost.forEach((cost) => {
    $(addedCard[0].children[2]).append(`<span class="card-symbol ${symbolMap.get(cost)}">${cost}</span>`);
  });

  // format
  updateCardFormat(addedCard[0], $("#widget-deck-format-input").val());

  // image tooltip
  let tooltip = null;
  if (card.layout == "dfc" || card.layout == "mdfc") {
    tooltip = $(`<div class='img-tooltip hidden' id='img-tooltip-${card.id}'><img src='${card.card_faces[0].image_uris.normal}'><img src='${card.card_faces[1].image_uris.normal}'></div>`);
  }
  else if (card.layout == "split") {
    tooltip = $(`<div class='img-tooltip img-layout-split hidden' id='img-tooltip-${card.id}'><img src='${card.image_uris.normal}'></div>`);
  }
  else if (card.layout == "flip") {
    tooltip = $(`<div class='img-tooltip hidden' id='img-tooltip-${card.id}'><img src='${card.image_uris.normal}'><img class='img-flip' src='${card.image_uris.normal}'></div>`);
  }
  else { // normal layout
    tooltip = $(`<div class='img-tooltip hidden' id='img-tooltip-${card.id}'><img src='${card.image_uris.normal}'></div>`);
  }

  $("#widget-container").append(tooltip);

  addCardEventListeners(addedCard);

  group.children[1].appendChild(addedCard[0]);
  updateDeckCount(true);
  //fitSVG(addedCard[0].children[1].children[0]);
  fitSVGs();
  return true;
}

function addCardEventListeners(el) {
  el.on('contextmenu', cardRightClick);

  el.on('mouseenter', function () {
    const container = $("#widget-deck-flex");
    const vh = container.outerHeight();
    const rect = this.getBoundingClientRect();
    const card = cardMap.get($(this).data('name').toLowerCase());
    let tooltip = $("#img-tooltip-" + card.id);
    const imgRect = tooltip[0].getBoundingClientRect();
    if ((rect.bottom + rect.top) / 2 < vh / 2) {
      // card hover down
      tooltip.css({
        top: rect.bottom + 6,
        left: rect.left + container[0].scrollLeft + rect.width / 2 - imgRect.width / 2
      });
    } else {
      // card hover up
      tooltip.css({
        left: rect.left + container[0].scrollLeft + rect.width / 2 - imgRect.width / 2,
        top: rect.top - (imgRect.height + 6)
      });
    }
    tooltip.removeClass("hidden");
  });

  el.on('mouseleave', function () {
    const card = cardMap.get($(this).data('name').toLowerCase());
    let tooltip = $("#img-tooltip-" + card.id);
    tooltip.css({
      top: '-1000px',
      left: '-1000px'
    });
    tooltip.addClass("hidden");
  });
}

function handleMultiResults(data, count) {
  let resultContainer = $("#multiple-results-container");
  resultContainer.html("");
  //for (let i = 0; i < data.data.length; i++) {
    //let card = data.data[i];
  data.data.forEach((card) => {
    if (card.object != "card") return;
    cardMap.set(card.name.toLowerCase(), card);
    let costArray = null;
    let costHTML = "";
    if (card.card_faces == undefined) {
      costArray = costStringToArray(card.mana_cost);
      costArray.forEach((cost) => { costHTML += `<span class="card-symbol ${symbolMap.get(cost)}">${cost}</span>` });
    } else if (card.card_faces[1].mana_cost == "") {
      costArray = costStringToArray(card.card_faces[0].mana_cost);
      costArray.forEach((cost) => { costHTML += `<span class="card-symbol ${symbolMap.get(cost)}">${cost}</span>` });
    }
    else {
      costArray = [costStringToArray(card.card_faces[0].mana_cost), costStringToArray(card.card_faces[1].mana_cost)];
      costHTML += "<div class='multiline-cost'>"
      costArray[0].forEach((cost) => { costHTML += `<span class="card-symbol ${symbolMap.get(cost)}">${cost}</span>` });
      costHTML += "</div><div class='multiline-cost'>";
      costArray[1].forEach((cost) => { costHTML += `<span class="card-symbol ${symbolMap.get(cost)}">${cost}</span>` });
      costHTML += "</div>";
    }
    const cardItem = $(`<div class="card-result" data-name="${card.name}" data-count=${count}>
          <div class="card-result-text">
            <div class="card-result-name">${card.name}</div>
            <div class="card-result-type-line">${card.type_line}</div>
          </div>
          <div class="card-result-cost">${costHTML}</div>
        </div>`);
    resultContainer.append(cardItem);
  });

  $(".card-result").on("click", function () {
    addCard(cardMap.get($(this).data('name').toLowerCase()), $(this).data('count'));
    const cardInput = $("#card-add-input");
    cardInput.val("");
    cardInput[0].focus();
    $("#widget-modal-container").addClass("hidden");
  });

  $("#widget-modal-container").removeClass("hidden");
}

function cardRightClick(e) {
  e.preventDefault();
  e.stopPropagation();

  $("#context-menu-count-input").val("");

  // sideboard option toggle
  if ($(this).parent().parent().attr('id') == "sideboard-card-group") {
    $("#right-click-sideboard").addClass("hidden");
    $("#right-click-remove-sideboard").removeClass("hidden");
  }
  else {
    $("#right-click-sideboard").removeClass("hidden");
    $("#right-click-remove-sideboard").addClass("hidden");
  }

  $("#context-menu-count-input").attr('placeholder', this.children[0].innerText);

  const menu = $("#widget-right-click");
  const widgetRect = $("#widget-container")[0].getBoundingClientRect();
  menu.removeClass("hidden");
  const rect = menu[0].getBoundingClientRect();
  menu.css({
    "top": e.clientY - (e.clientY + rect.height > widgetRect.height ? rect.height : 0),
    "left": e.clientX,
  });
  menu.data("name", $(this).data("name"));
}

function deleteCard(e) {
  removeCard($(this).parent().data("name"));
}

function removeCard(name) {
  let cards = document.querySelectorAll(`.card-group-card[data-name="${name.replaceAll("\"", "\\\"")}"]`);
  cards.forEach((card) => {
    const data = cardMap.get(name.toLowerCase());
    $('#img-tooltip-' + data.id).remove();
    card.remove();
    updateDeckCount(true);
  });
}

function removeAll() {
  $('.card-group').addClass('hidden');
  $('.card-group-card').remove();
  $('.img-tooltip').remove();
  $('.card-group-count').html('0');
  $("#widget-deck-count").html('0');
}

function importFile(event) {
  const file = event.target.files[0]; // Get the first selected file
  if (file) {
    const reader = new FileReader();

    // Define what happens when the file is read
    reader.onload = async function(e) {
      try {
        try {
          const deck = JSON.parse(e.target.result);
          /*$("#widget-deck-name-input")[0].textContent = deck.name;
          const format = formats.find(item => item.name == deck.format.toLowerCase().trim());
          if (format != null && format != undefined) $("#widget-deck-format-input").val(format.name);*/
          deck.cards.forEach(async (card) => {
            if (card.id != undefined && card.id != null) {
              let res = await fetch("https://api.scryfall.com/cards/" + card.id);
              if (!res.ok) {
                logErr("Unable to load card");
                return;
              }
              let data = await res.json();
              cardMap.set(data.name.toLowerCase(), data);
              addCard(data, (card.count == undefined || isNaN(card.count) ? 1 : card.count));
              if (card.sideboard) {
                addCardToSideboard(card.name);
              }
            }
          });
        }
        catch (err) {
          const content = e.target.result;
          const lines = content.split("\r\n");
          lines.forEach(async (line) => {
            line = line.trim();
            const regex = /((\d)x)?([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
            const match = line.match(regex);
            if (match == null) return;
            let res = await fetch("https://api.scryfall.com/cards/" + match[3]);
            if (!res.ok) {
              logErr("Unable to load card");
              return;
            }
            let data = await res.json();
            cardMap.set(data.name.toLowerCase(), data);
            addCard(data, (match[2] == undefined ? 1 : parseInt(match[2])));
          });
        }
      }
      catch (err) {
        console.log(err);
        logErr('Error loading cards');
      }
    };

    // Read the file as text
    reader.readAsText(file);
  }
}

function loadDeck(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();

    reader.onload = async function (e) {
      try {
        const deck = JSON.parse(e.target.result);
        removeAll();
        $("#widget-name-input")[0].textContent = deck.name;
        const format = formats.find(item => item.name == deck.format.toLowerCase().trim());
        if (format != null && format != undefined) $("#widget-deck-format-input").val(format.name);
        deck.cards.forEach(async (card) => {
          if (card.id != undefined && card.id != null) {
            let res = await fetch("https://api.scryfall.com/cards/" + card.id);
            if (!res.ok) {
              logErr("Unable to load Card");
              return;
            }
            let data = await res.json();
            cardMap.set(data.name.toLowerCase(), data);
            addCard(data, (card.count == undefined || isNaN(card.count) ? 1 : card.count));
            if (card.sideboard) {
              addCardToSideboard(data.name);
            }
          }
        });
      }
      catch (err) {
        console.log(err);
        logErr('Unable to load deck');
      }
    };

    reader.readAsText(file);
  }
}

function exportFile() {
  let deck = {};
  // deck name
  let deckName = $("#widget-name-input").text();
  if (deckName.trim() == "") deckName == "deck";
  else deckName = deckName.trim();
  deck.name = deckName;
  deckName = deckName.replaceAll(" ", "");
  // deck format (only used if there are no other cards)
  deck.format = $("#widget-deck-format-input").val();
  deck.cards = [];
  $(".card-group-card").each(function () {
    const card = cardMap.get($(this).data("name").toLowerCase());
    if (card == null) {
      logErr("Unable to export card");
      return;
    }
    const count = parseInt(this.children[0].innerHTML);
    //content += (count == NaN ? 1 : count) + "x" + card.id + "\r\n";
    deck.cards.push({ count: (count == NaN ? 1 : count), id: card.id, sideboard: (this.parentNode.parentNode.id == "sideboard-card-group")});
  });
  if (deck.cards.length == 0) {
    $("#widget-form-err").html("No cards to export");
    logErr("No cards to export");
    return;
  }
  downloadFile(deckName, JSON.stringify(deck), 'application/json');
}


function updateCardFormat(card, format) {
  const data = cardMap.get($(card).data('name').toLowerCase());
  if (data.legalities[format] == undefined || data.legalities[format] == "not_legal") {
    $(card.children[1]).addClass('card-format-err');
  } else {
    $(card.children[1]).removeClass('card-format-err');
  }
}

function updateFormat () {
  const formatName = $(this).val();
  const format = formats.find(item => item.name == formatName);
  $('.card-group-card').each(function () {
    updateCardFormat(this, formatName);
  });
  $('#widget-deck-min-count').html(format.size);
}

// event handler function (for context menu)
function addToSideboard() {
  const name = $(this).parent().data('name');
  addCardToSideboard(name);
}

// actual funciton
function addCardToSideboard(name) {
  const el = findCardElByName(name);
  $("#sideboard-card-group>.card-group-list").append(el);
  $("#sideboard-card-group").removeClass('hidden');
  updateDeckCount(true);
  //addCardEventListeners($(el));
}

// event handler function (for context menu)
function removeFromSideboard() {
  const name = $(this).parent().data('name');
  removeCardFromSideboard(name);
}

// actual function
function removeCardFromSideboard(name) {
  const el = findCardElByName(name);
  const cardCount = parseInt(el[0].children[0].innerText);
  const card = cardMap.get(name.toLowerCase());
  removeCard(name);
  addCard(card, cardCount);
}

function menuUpdateCount(input) {
  const menu = input.parentNode;
  const val = parseInt(input.value);
  updateCardCount($(menu).data('name'), val);
  $(menu).addClass('hidden');
}

function findCardElByName(name) {
  return $(`.card-group-card[data-name='${name.replaceAll("'", "\\'")}']`);
}

// finally abstracting this to be less buggy (and use less code);
function updateCardCount(name, count) {
  if (isNaN(count)) return;
  const card = findCardElByName(name);
  card[0].children[0].innerHTML = count;
  if (count <= 0) removeCard(name);
  updateDeckCount(true);
}

function updateCardGroupCount(group) {
  const cardList = group.querySelector('.card-group-list');
  let count = 0;
  Array.from(cardList.children).forEach((card) => {
    const cardCount = parseInt(card.children[0].innerText);
    if (!isNaN(cardCount)) count += cardCount;
  });
  const countEl = group.querySelector('.card-group-count');
  countEl.innerText = count;
  if (count <= 0) $(group).addClass('hidden');
  else $(group).removeClass('hidden');

  if (group.id == "sideboard-card-group") {
    if (count > 15) {
      $(countEl).parent().addClass("tooltip-visible");
      fitTooltips();
    }
    else {
      $(countEl).parent().removeClass("tooltip-visible");
    }
  }

  return count;
}

function updateDeckCount(recursive = false) {
  let count = 0;
  $('.card-group').each(function () {
    if (this.id == "sideboard-card-group") {
      updateCardGroupCount(this);
      return;
    }
    if (recursive) count += updateCardGroupCount(this);
    else count += parseInt(this.querySelector('.card-group-count').innerText);
  });
  $("#widget-deck-count").html(count);
  updateStats();
  return count;
}

function updateStats() {
  updateManaCurve();
}

function updateManaCurve() {
  let costs = [];
  $(".card-group-card").each(function () {
    if ($("#sideboard-card-group")[0].contains(this)) return;
    const card = cardMap.get($(this).data('name').toLowerCase());
    if (card.cmc == 0 && card.type_line.includes('Land')) return;
    const count = parseInt(this.children[0].innerText);
    if (isNaN(count)) return;
    let cost = costs.find(item => item.cost == parseInt(card.cmc));
    if (cost == null || cost == undefined) costs.push({cost: parseInt(card.cmc), count: count});
    else cost.count += count;
  });

  let maxCount = 0;
  const rampFlex = $("#widget-ramp-flex");
  for (let i = 0; i < costs.length; i++) {
    if (costs[i].count > maxCount) maxCount = costs[i].count;
    const el = $("#mana-column-" + costs[i].cost);
    if (el.length == 0) {
      const manaColumn = $(`<div id="mana-column-${costs[i].cost}" data-cost="${costs[i].cost}" data-count="${costs[i].count}" class="widget-ramp-column" style="order: ${costs[i].cost};">
            <div class="widget-ramp-bar">
              <div class="mana-column-hover not-visible">${costs[i].count}</div>
            </div>
            <div class="widget-ramp-val">${costs[i].cost}</div>
          </div>`);
      rampFlex.append(manaColumn);
      $(manaColumn[0].children[0]).on("mouseenter", manaBarHover);
      $(manaColumn[0].children[0]).on("mouseleave", manaBarLeave);
    }
    else {
      el.data('count', costs[i].count);
      el[0].querySelector(".mana-column-hover").innerHTML = costs[i].count;
    }
  }


  $(".widget-ramp-column").each(function () {
    const cost = parseInt($(this).data('cost'));
    const costObj = costs.find(item => item.cost == cost);
    if (costObj == null || costObj == undefined) {
      $(this).remove();
    }
    else {
      $(this.children[0]).css({"height": (costObj.count / maxCount * 100) + "%"});
    }
  });

}

function manaBarHover(e) {
  const columnHover = this.querySelector(".mana-column-hover");
  const rect = columnHover.parentNode.getBoundingClientRect();
  if (rect.height < 40) $(columnHover).addClass("overflow");
  else $(columnHover).removeClass("overflow");
  $(columnHover).removeClass("not-visible");
}

function manaBarLeave() {
  const columnHover = this.querySelector(".mana-column-hover");
  $(columnHover).addClass("not-visible");
  /*$(this.querySelector(".mana-column-hover")).addClass("hidden");*/
}

function logErr(err) {
  const errMsg = $(`<div class="widget-err">
    <div class="widget-err-msg">${err}</div>
    <i class="widget-err-close bx bx-x"></i>
  </div>`);
  errMsg.children().eq(1).on('click', function () {
    closeErr(this.parentNode);
  });
  /*let placed = false;
  for (let i = 0; !placed && i < 15; i++) {
    const el = $(`.widget-err[data-index=${i}]`);
    if (el.length == 0) {
      placed = true;
      // box every 40px
      errMsg.attr('data-index', i);
      errMsg.css({'top': i * 40 + 3 + 'px'});
      $("#widget-container").append(errMsg);
      setTimeout(closeErr, 20000, errMsg[0]);
    }
  }*/
  $("#widget-err-container").append(errMsg);
  setTimeout(closeErr, 20000, errMsg[0]);
}

function closeErr(msg) {
  const rect = msg.getBoundingClientRect();
  $(msg).css({'z-index': 0});
  $(msg).animate({
    'margin-top': '-' + rect.height +'px',
    'opacity': 0
  }, 800, function () {
    $(this).remove();
  });
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

function costStringToArray(cost, card) {
  cost = cost.replaceAll("/", "");
  const regex = /{[^}]+}/g;
  const matches = [...cost.matchAll(regex)];
  return matches.map(match => match[0]);
}

function initCardGroups(types) {
  let container = $("#widget-deck-display-container");
  types.forEach((type) => {
    container.append(`<div id="${type.toLowerCase()}-card-group" class="card-group hidden">
      <div class="card-group-header">
        <div class="card-group-title">${type.toUpperCase()}</div>
        <div class="card-group-count-container tooltip-container">
          <div class="card-group-count">0</div>
          ${(type == "Sideboard" ? '<div class="tooltip-text left">Max Count 15</div>' : '')}
        </div>
      </div>
      <div class="card-group-list"></div>
    </div>`);
  })
}

function fillFormats() {
  let dropdown = $("#widget-deck-format-input");
  formats.forEach((format) => {
    dropdown.append(`<option value='${format.name}'>${format.name[0].toUpperCase() + format.name.substring(1)}</option>`);
  })
}

function fitSVGs() {
  const svg = document.querySelectorAll(".fit-text");
  svg.forEach(element => {
    fitSVG(element);
  });
}

function fitSVG(svg) {
    /* Get bounding box of <text> element */
    const bbox = svg.querySelector("text").getBBox();
    const parentBox = svg.parentNode.getBoundingClientRect();
    /* Apply bounding box values to SVG element as viewBox */
    svg.setAttribute("viewBox", [bbox.x, bbox.y, (bbox.width > parentBox.width ? bbox.width : parentBox.width), bbox.height].join(" "));
}

function initSymbolMap(map) {
  let symbols = ["X", "W", "U", "B", "R", "G", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12",
                "WU", "WB", "RW", "GW", "UB", "UR", "GU", "BR", "BG", "RG",
                "WUP", "WBP", "RWP", "GWP", "UBP", "URP", "GUP", "BRP", "BGP", "RGP",
                "2W", "2U", "2B", "2R", "2G", "CW", "CU", "CB", "CR", "CG", 
                "WP", "UP", "BP", "RP", "GP", "S", "C"];
  symbols.forEach((symbol) => {
    map.set("{" + symbol + "}", "card-symbol-" + symbol);
  })
}



























