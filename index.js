const express = require("express");
const proxy = require("express-http-proxy");
const { createProxyMiddleware } = require("http-proxy-middleware");
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

app.get("/create/storage.json", (req, res) => {
  res.sendFile(__dirname + "/create/storage.json");
});

app.get("/decks", (req, res) => {
  res.send("My decks");
});

app.get("/images/*", (req, res) => {
  res.sendFile(__dirname + req.path);
});

const scryfallImageProxy = proxy("https://cards.scryfall.io/", {
  proxyReqPathResolver: (req) => url.parse(req.baseUrl).path,
});

const scryfallCardProxy = proxy("https://api.scryfall.com/", {
  proxyReqPathResolver: (req) => url.parse(req.baseUrl).path,
});

app.use("/png/*", scryfallImageProxy);
app.use("/normal/*", scryfallImageProxy);

app.use("/cards/*", scryfallCardProxy);

app.use(
  "/search",
  createProxyMiddleware({
    target: "https://api.scryfall.com/cards/search",
    changeOrigin: true,
    pathRewrite: {
      "^/search": "",
    },
    on: {
      proxyReq: (proxyReq, req, res) => {
        console.log("https://api.scryfall.com" + proxyReq.path);
      },
    },
  }),
);

app.use((req, res) => {
  res.status(404).sendFile("./404.html", { root: __dirname });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
