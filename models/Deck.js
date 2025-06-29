const mongoose = require('mongoose');
const { formats, formatErrors, cardCountMax, scryfallUrl, cardCache, filterCardData, colorString } = require('../constants');

const deckCardSchema = new mongoose.Schema({
    count: {
        type: Number
    },
    commander: {
        type: Boolean
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
        type: String
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
});

// before the deck is saved go through the cards and find the format errors and deck colors
deckSchema.pre('save', async function (next) {
    let deckColors = [false, false, false, false, false];
    let deckErrors = new Array(formatErrors.length);
    let cardData = new Array(this.cards.length);
    for (let i = 0; i < this.cards.length; i++) {
        let data = cardCache.get(this.cards[i].id);
        if (data == undefined || data == null || data.object != "card") {
            cardData[i] = fetchCardData(this.cards[i].id);
        }
    }
    await Promise.all(cardData);
    for (let i = 0; i < this.cards.length; i++) {
        if (cardData[i].object == "card") {
            let data = cardData[i];
            let card = this.cards[i];
            if (cardCache.has(data.id)) cardCache.ttl(data.id, 1800);
            else cardCache.set(data.id, filterCardData(data), 1800);
            // update deck colors
            for (let i = 0; i < 5; i++) {
                if (!deckColors[i] && card.color_identity.includes(colorString[i])) deckColors[i] = true;
            }
            // check if legal in format
            if (!card.legalities.includes(this.format)) deckErrors[2] = true;
            // commander / brawler error checking
            if (card.commander == true) {
                if (!card.type_line.includes("Legendary Creature")) delete card.commander;
            }
        }
        else {
            // couldn't get card data so don't save card
            card.remove = true;
        }
    }

    // remove cards where data is unable to be found - make sure to check whether you can connect to the scryfall server
    this.cards = this.cards.filter(card => card.remove != true);
    if (this.cards.length == 0) return;

    // partner error checking 
    let commanders = this.cards.filter(card => card.commander);
    if (commanders.length > 2) {
        commanders.forEach((card) => { delete card.commander; });
    }
    else if (commanders.length == 2) {
        let data = [cardCache.get(commanders[0].id), cardCache.get(commanders[1].id)];
        if (commanders[0].keywords.includes("Partner with")) {
            if (!commanders[0].keywords.includes("Partner with " + commanders[1].name)) 
                delete commanders[0].commander;
        }
        else if (commanders[1].keywords.includes("Partner with")) {
            if (!commanders[1].keywords.includes("Partner with " + commanders[0].name)) 
                delete commanders[1].commander;
        }
    } 
    else if (commanders.length == 0) {
        if (formats[this.format] != "Commander") deckErrors[3] = true;
        else if (formats[this.format] != "Brawler") deckErrors[4] = true;
    }
    
    // check to see if there is the minimum number of cards required in the deck
    if (this.cards.length < formats[this.format].size) deckErrors[0] = true;

    // see if this.formatError should be created, removed, or modified
    if (deckErrors.includes(true)) {
        this.formatErrors = deckErrors;
    }
    else {
        if (this.formatErrors != null && this.formatErrors != undefined) delete this.formatErrors;
    }

    if (this.cards.length > 0) next();
});

// fetch card data
async function fetchCardData(id) {
    return await fetch(scryfallUrl + id)
        .then((res) => { 
            if (res.ok) return res.json();
            else return Promise.regect(res);
        })
        .catch((error) => { return { object: "error" }; });
}

const Deck = mongoose.model('deck', deckSchema);

module.exports = Deck;