const mongoose = require('mongoose');
const { formats, formatErrors, cardCountMax, scryfallUrl, cardCache, filterCardData, colorString } = require('../constants');
const { isURL } = require('validator');

const deckCardSchema = new mongoose.Schema({
    count: {
        type: Number
    },
    commander: {
        type: Boolean
    },
    index: {
        type: Number
    },
    sideboard: {
        type: Number
    },
    scryfallId: {
        type: String,
        required: true
    }
});

const deckSchema = new mongoose.Schema({
    cards: {
        type: [deckCardSchema],
        required: true,
        validate: [(val) => val.length > 0, "Deck must contain cards. "]
    },
    format: {
        type: mongoose.Schema.Types.Int32,
        required: true,
        default: 0,
        validate: [(val) => { return (val < formats.length && val >= 0); }, "Unable to find format."]
    },
    formatErrors: {
        type: [Boolean]
    },
    colors: {
        type: String,
        required: true,
    },
    name: {
        type: String
    },
    description: {
        type: String
    },
    private: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId
    },
    backgroundUrl: {
        type: String
    }
}, { timestamps: true });

const deckCountMax = 256;

// before the deck is saved go through the cards and find the format errors and deck colors
deckSchema.pre('save', async function (next) {

    if (this.public != true && this.public != false) delete this.public;
    if (!this.name || this.name.trim().length == 0) delete this.name;
    if (!this.description) delete this.description;
    if (this.backgroundUrl && !isURL(this.backgroundUrl)) delete this.backgroundUrl;

    // check for deck errors
    if (this.cards.length > deckCountMax) reject(new Error("Deck must contain less than " + deckCountMax + " cards. "));

    next();
});

// fetch card data
async function fetchCardData(id) {
    return await fetch(scryfallUrl + id)
        .then((res) => { 
            if (res.ok) return res.json();
            else return Promise.regect(res);
        })
        .catch((error) => { 
            console.log("Error fetching card data for " + id + ": ", error);
            return { object: "error" }; 
        });
}

async function presaveDeck(deck) {

    if (deck.cards.length == 0) throw new Error("Deck must contain cards. ");

    // check for format
    const format = formats.find(item => item.name == deck.format.toLowerCase().trim());
    if (format) deck.format = formats.indexOf(format);
    else throw new Error("Deck must have a valid format.");

    let deckColors = new Array(5).fill(false); // W, U, B, R, G
    let deckErrors = new Array(formatErrors.length);
    let cardData = new Array(deck.cards.length);
    for (let i = 0; i < deck.cards.length; i++) {
        let data = cardCache.get(deck.cards[i].scryfallId);
        if (data == undefined || data == null || data.object != "card") {
            cardData[i] = fetchCardData(deck.cards[i].scryfallId);
        }
    }
    await Promise.allSettled(cardData).then((results) => { cardData = results.map(result => result.value); });

    for (let i = 0; i < deck.cards.length; i++) {
        if (cardData[i].object == "card") {
            let data = cardData[i];
            let card = deck.cards[i];
            if (cardCache.has(data.id)) cardCache.ttl(data.id, 1800);
            else cardCache.set(data.id, filterCardData(data), 1800);
            // update deck colors
            for (let i = 0; i < 5; i++) {
                if (!deckColors[i] && data.color_identity.includes(colorString[i])) deckColors[i] = true;
            }
            // check if legal in format
            if (!data.legalities[format.name]) deckErrors[2] = true;
            // commander / brawler error checking
            if (card.commander == true) {
                if (!data.type_line.includes("Legendary Creature")) delete card.commander;
            }

            // handle sideboard cards
            /*if (card.sideboard) {
                // remove from main deck
                deck.cards.splice(i, 1);
                // add to sideboard
                if (deck.sideboard == null || deck.sideboard == undefined) deck.sideboard = [];
                deck.sideboard.push(card);
                i--;
            }*/
            
        }
        else {
            // couldn't get card data so don't save card
            console.log(cardData[i]);
            deck.cards[i].remove = true;
        }
    }

    deck.colors = Array.from(colorString).filter((color, index) => deckColors[index]).join("");
    if (deck.colors == "") deck.colors = "C";


    // remove cards where data is unable to be found - make sure to check whether you can connect to the scryfall server
    this.cards = this.cards.filter(card => card.remove == null || card.remove == undefined || card.remove == false);
    if (this.cards.length == 0) throw new Error("Deck must contain cards. ");

    // partner error checking 
    if (format.name == "commander" || format.name == "brawler") {
        let commanders = this.cards.filter(card => card.commander);
        if (commanders.length > 2) {
            //commanders.forEach((card) => { delete card.commander; });
            throw new Error("Deck can only have 2 commanders (partners) at most. ");
        }
        else if (commanders.length == 2) {
            let data = [cardCache.get(commanders[0].scryfallId), cardCache.get(commanders[1].scryfallId)];
            if (commanders[0].keywords.includes("Partner with")) {
                if (!commanders[0].keywords.includes("Partner with " + commanders[1].name)) 
                    throw new Error("Commanders must have partner with each other. ");
            }
            else if (commanders[1].keywords.includes("Partner with")) {
                if (!commanders[1].keywords.includes("Partner with " + commanders[0].name)) 
                    throw new Error("Commanders must have partner with each other. ");
            }
        } 
        else if (commanders.length == 0) {
            if (format.name != "commander") deckErrors[3] = true;
            else if (format.name != "brawler") deckErrors[4] = true;
        }
    }
    
    // check to see if there is the minimum number of cards required in the deck
    if (this.cards.length < format.size) deckErrors[0] = true;

    // see if this.formatError should be created, removed, or modified
    if (deckErrors.includes(true)) {
        this.formatErrors = deckErrors;
    }
    else {
        if (this.formatErrors != null && this.formatErrors != undefined) delete this.formatErrors;
    }

    if (this.cards.length == 0) throw new Error("Deck must contain cards. ");
    
}

const Deck = mongoose.model('deck', deckSchema);

module.exports = { Deck, presaveDeck };