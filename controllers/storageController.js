const Deck = require('../models/Deck');
const { isURL } = require('validator');
const constants = require('../constants');

const validString = (str) => {
    return str != null && str != undefined && str.trim().length > 0;
}

const verifyDeckInfo = (deck, info) => {
    if (info.public != null && info.public != undefined) deck.public = info.public;
    if (validString(info.name)) deck.name = info.name;
    if (validString(info.description)) deck.description = info.description;
    if (isURL(info.backgroundUrl)) deck.backgroundUrl = info.backgroundUrl;
    if (info.format >= 0 && info.format < constants.formats.length) deck.format = info.format;
}

module.exports.createDeck = async (req, res) => {
    const { cards, format, public, name, description, backgroundUrl } = req.body;
    let deck = { cards };
    if (cards.length == 0) res.status(411).send("Deck must contain cards. ");
    verifyDeckInfo(deck, { format, public, name, description, backgroundUrl });
    deck.owner = req.locals.user._id;
    try {
        const doc = await Deck.create(deck);
        req.locals.user.decks.push(doc._id);
        await user.save();
    }
    catch (err) {
        res.status(500).send("Error saving deck");
    }
    res.send('successful');
}

module.exports.saveDeck = async (req, res) => {
    const info = { _id, cards, format, public, name, description, backgroundUrl } = req.body;
    let saveObj = { _id: info._id, cards: info.cards };
    if (info.cards.length == 0) res.status(411).send("Deck must contain cards. ");
    verifyDeckInfo(saveObj, info);

    try {
        if (req.locals.user != null && req.locals.user != undefined) {
            const deck = await Deck.findOne({ _id: info._id });
            if (deck.owner == req.locals.user._id) await deck.save();
            else res.status(401).send("You do not own this deck. ");
        }
        else {
            res.status(500).send("Unable to save the document. Make sure you are logged in. ");
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Unable to save the document. ");
    }
    res.send("success");
};

module.exports.deleteDeck = async (req, res) => {
    const { _id } = req.body;

    try {
        if (req.locals.user != undefined && req.locals.user != null) {
            if (req.locals.user.decks.includes(_id)) await Deck.deleteOne({ _id });
            else res.status(401).send("You do not own this deck. ");
        }
        else {
            res.status(500).send("Unable to save the document. Make sure you are logged in. ");
        }
    }
    catch (err) {
        res.status(500).send("Unable to delete document. ");
    }
    res.send("success");
};

module.exports.deckInfo = async (req, res) => {
    const _id = req.query._id;

    try {
        const deck = await Deck.findOne({ _id });
        if (deck.private != undefined && deck.private != null && deck.private == true) {
            if (req.locals.user == null || (req.locals.user != null && req.locals.user._id != deck.owner))
                res.status(401).send("You do not have permission to view this deck. ");
            else res.send(JSON.stringify(deck));
        }
        res.send(JSON.stringify(deck));
    }
    catch (err) {
        res.status(500).send("Unable to retreive deck. ");
    }
}