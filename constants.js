const NodeCache = require('node-cache');
const cardCache = new NodeCache();

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

const formatErrors = [
  "Too few cards",
  "Contains cards not legal in format",
  "Contains too many instances of a card",
  "No commander",
  "No brawler"
];

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

const cardCountMax = (card, format) => {
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
    if (maxMatch != null) {
      for (let i = 0; i < numberStrings.length; i++) {
        if (maxMatch[1].toLowerCase() == numberStrings[i]) return i;
      }
      return -1;
    }
  }
  return formats[format].singleton ? 1 : 4;
}

const scryfallUrl = "https://api.scryfall.com/cards/";

const filterCardData = (card) => {
  return { 
    id: card.id, 
    object: card.object,
    name: card.name, 
    layout: card.layout, 
    image_uris: card.image_uris, 
    mana_cost: card.mana_cost, 
    cmc: card.cmc, 
    type_line: card.type_line, 
    oracle_text: card.oracle_text, 
    power: card.power, 
    toughness: card.toughness, 
    colors: card.colors, 
    color_identity: card.color_identity, 
    keywords: card.keywords, 
    legalities: card.legalities 
  };
}

const colorString = "WUBRG";

module.exports = { formats, formatErrors, cardCountMax, scryfallUrl, cardCache, filterCardData, colorString };