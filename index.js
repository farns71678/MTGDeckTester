const express = require("express");
const proxy = require("express-http-proxy");
const url = require("url");
const app = express();
const port = 3000;

// Web navigation

app.get("/", (req, res) => {
  //res.send('Hello, world!');
  res.sendFile(__dirname + "/home/index.html");
});

app.get("/create", (req, res) => {
  res.sendFile(__dirname + "/create/index.html");
});

app.get("/create/app.js", (req, res) => {
  res.sendFile(__dirname + "/create/app.js");
});

app.get("/create/styles.css", (req, res) => {
  res.sendFile(__dirname + "/create/styles.css");
});

app.get("/decks", (req, res) => {
  res.send("My decks");
});

const scryfallImageProxy = proxy("https://cards.scryfall.io/", {
  proxyReqPathResolver: (req) => url.parse(req.baseUrl).path,
});

const scryfallSearchProxy = proxy("https://api.scryfall.com/", {
  proxyReqPathResolver: (req) =>
    url.parse(req.baseUrl).path + url.parse(req.baseUrl).search,
});

app.use("/png/*", scryfallImageProxy);

app.use("/cards/*", scryfallSearchProxy);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
