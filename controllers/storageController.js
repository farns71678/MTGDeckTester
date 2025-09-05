const { Deck, presaveDeck } = require('../models/Deck');
const { isURL } = require('validator');
const constants = require('../constants');

const validString = (str) => {
    return str != null && str != undefined && str.trim().length > 0;
}

const verifyDeckInfo = (deck, info) => {
    if (deck.cards.length == 0) throw new Error("Deck must contain cards. ");
    const format = constants.formats.find(item => item.name == info.format.toLowerCase().trim());
    if (format) deck.format = constants.formats.indexOf(format);
    else throw new Error("Deck must have a valid format.");
    if (info.public) deck.public = info.public;
    if (validString(info.name)) deck.name = info.name;
    if (validString(info.description)) deck.description = info.description;
    if (isURL(info.backgroundUrl)) deck.backgroundUrl = info.backgroundUrl;
}

module.exports.createDeck = async (req, res) => {
    let deck = { cards, format, public, name, description, backgroundUrl } = req.body;
    try {
        let user = res.locals.user;
        deck.owner = user._id;
        await presaveDeck(deck);
        let doc = (await Deck.create(deck)).toObject();
        doc.count = getDeckCardTotal(doc);
        await user.updateOne({ $push: { decks: doc._id } });
        res.send(JSON.stringify({ deck: doc, username: user.username}));
    }
    catch (err) {
        console.log(err);
        res.status(411).send("Unable to create deck. Make sure the file format is valid and contains a valid format as well as cards.");
    }
}

module.exports.saveDeck = async (req, res) => {
    const newDeck = { _id, cards, format, public, name, description, sideboard, backgroundUrl } = req.body;

    try {
        const deck = await Deck.findOne({ _id: newDeck._id });
        if (deck.owner == res.locals.user._id) {
            Object.keys(newDeck).forEach(key => {
                if (key != '_id' && newDeck[key] != null) deck[key] = newDeck[key];
            });
            await presaveDeck(deck);
            await deck.save();
        }
        else res.status(401).send("You do not own this deck. ");
        res.send("success");
    }
    catch (err) {
        console.log(err);
        res.status(411).send("Unable to create deck. Make sure the file format is valid and contains a valid format as well as cards.");
    }
};

module.exports.deleteDeck = async (req, res) => {
    const { _id } = req.body;
    const user = res.locals.user;

    try {
        if (user.decks.includes(_id)) {
            await Deck.deleteOne({ _id });
            await user.updateOne({ $pull: { decks: _id } });
        }
        else res.status(401).send("You do not own this deck. ");
    }
    catch (err) {
        console.log("Error deleting deck: ", err.message);
        res.status(500).send("Unable to delete document. ");
    }
    res.send("success");
};

module.exports.deckInfo = async (req, res) => {
    const { _id, retreiveData } = req.query;

    try {
        const deck = await Deck.findOne({ _id }).lean();
        if (deck.private != undefined && deck.private != null && deck.private == true) {
            if (res.locals.user == null || (res.locals.user != null && res.locals.user._id != deck.owner))
                res.status(401).send("You do not have permission to view this deck. ");
            else res.send(JSON.stringify(await parseDeckInfo(deck, retreiveData == 'true')));
        }
        res.send(JSON.stringify(await parseDeckInfo(deck, retreiveData == 'true')));
    }
    catch (err) {
        console.log("Error retreiving deck: ", err.message);
        res.status(500).send("Unable to retreive deck. ");
    }
}

function getDeckCardTotal(deck) {
    let total = 0;
    for (let i = 0; i < deck.cards.length; i++) {
        if (deck.cards[i].sideboard) continue;
        let count = deck.cards[i].count;
        total += (isNaN(count) ? 1 : count);
    }
    return total;
}

module.exports.deckList = async (req, res) => {
    const { user } = res.locals;

    try {
        let decks = [];
        for (let i = 0; i < user.decks.length; i++) {
            const doc = await Deck.findOne({ _id: user.decks[i] }).lean();
            //doc.count = getDeckCardTotal(doc);
            //console.log(doc);
            decks.push({ _id: doc._id, name: doc.name, format: doc.format, formatErrors: doc.formatErrors, colors: doc.colors, description: doc.description, count: getDeckCardTotal(doc), public: doc.public, backgroundUrl: doc.backgroundUrl, updatedAt: doc.updatedAt, createdAt: doc.createdAt  });
        }
        res.send(JSON.stringify({ decks, username: user.username }));
    }
    catch (err) {
        console.log("Error retreiving deck list: ", err.message);
        res.status(500).send("Unable to retreive deck list");
    }
}

async function parseDeckInfo(deck, retrieveData) {
    if (retrieveData) {
        try {
            let promises = [];
            deck.cards.forEach((card, index) => {
                promises.push(fetch(`https://api.scryfall.com/cards/${card.scryfallId}`)
                    .then(res => res.json())
                    .catch(err => { throw new Error("Error fetching card data") }));
            });
            await Promise.allSettled(promises).then((results) => { promises = results.map(result => result.value); });
            for (let i = 0; i < deck.cards.length; i++) {
                deck.cards[i] = { ...deck.cards[i], ...promises[i] };
            }
            return deck;
        }
        catch(err) {
            throw new Error("Error parsing deck");
        }
    }
    return deck;
}