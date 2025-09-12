const express = require("express");
const proxy = require("express-http-proxy");
const mongoose = require("mongoose");
const { createProxyMiddleware } = require("http-proxy-middleware");
const url = require("url");
const routes = require("./routes/exports.js");
const cookieParser = require("cookie-parser");
const { requireAuth, checkUser } = require("./middleware/authMiddleware");
const { Deck, presaveDeck } = require('./models/Deck');
const { parse } = require("path");
const app = express();
const port = 3000;

const USE_DATABASE = true;

//middleware
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

// Web navigation routes

app.set("view engine", "ejs");

if (USE_DATABASE) app.get("*", checkUser);

app.get("/", (req, res) => {
  //res.send('Hello, world!');
  res.sendFile("./home/index.html", { root: __dirname });
});

/*app.get("/images/*", (req, res) => {
  res.sendFile(__dirname + req.path);
});*/

const scryfallImageProxy = proxy("https://cards.scryfall.io/", {
  proxyReqPathResolver: (req) => url.parse(req.baseUrl).path,
});

const scryfallCardProxy = proxy("https://api.scryfall.com/", {
  proxyReqPathResolver: (req) => url.parse(req.baseUrl).path,
  proxyErrorHandler: function(err, res, next) {
    console.log("Error in proxy: ", res);
    next(err);
  },
  proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
    // you can update headers
    console.log("Proxying request to: ", srcReq.url);
    return proxyReqOpts;
  }
});

app.use("/png/*", scryfallImageProxy);
app.use("/normal/*", scryfallImageProxy);
app.use("/art_crop/*", scryfallImageProxy);

app.use("/cards/*", scryfallCardProxy);

/*
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
      proxyRes: (proxyRes, req, res) => {
        console.log(res.statusCode + " " + req.method + " " + req.url + " " + res.statusMessage);
        console.log(res.body);
      },
      error: (err, req, res) => {
        console.log("Error in proxy: ", err);
      }
    },
  })
);
*/

app.get("/search", async (req, res) => {
  try {
    const reqUrl = new URL(req.url, `http://${req.headers.host}`);
    const apiUrl = "https://api.scryfall.com/cards/search" + (reqUrl.search || "");
    console.log(apiUrl);
    let response = await fetch(apiUrl);
    let data = await response.json();
    res.setHeader("Content-Type", "application/json");
    res.writeHead(response.status, "OK", response.headers).end(JSON.stringify(data));
  }
  catch (err) {
    console.log("Error fetching from Scryfall API: ", err);
    res.setHeader("Content-Type", "application/json");
    res.status(500).end("{error: 'Internal Server Error'}");
  }
});

// routes
app.use(routes.authRoutes);
app.use(routes.storageRoutes);

app.get("/decks", requireAuth, checkUser, (req, res) => {
  if (!res.locals.user) return res.redirect("/login");
  res.render("decks", { user: res.locals.user });
});

app.get("/create", checkUser, (req, res) => {
  res.render("create", { user: res.locals.user });
});

app.get("/:username/:deckId", checkUser, (req, res) => {
  const { username, deckId } = req.params;
  if (res.locals.user && res.locals.user.username != username)
    res.render("viewer", { user: res.locals.user, deckId: deckId });
  else if (res.locals.user && res.locals.user.username == username)
    res.render("create", { user: res.locals.user, deckId: deckId });
  else res.render("viewer", { user: null, deckId: deckId });
});

app.get("/view", (req, res) => {
  res.render("viewer");
});

//app.use("/decks", express.static(__dirname + "/decks"));

app.use((req, res) => {
  res.status(404).sendFile("./404.html", { root: __dirname });
});

// database connection
//mongodb+srv://farnz71678:88LM1zR8SqcBrOYh@cluster0.patbhdu.mongodb.net/mtg-builder
// //?retryWrites=true&w=majority&appName=Cluster0
if (USE_DATABASE) {
  const dbURI =
    "mongodb+srv://farnz71678:88LM1zR8SqcBrOYh@cluster0.patbhdu.mongodb.net/mtg-builder";
  mongoose
    .connect(dbURI, { useNewUrlParser: true })
    .then((result) => {
      const server = app.listen(port);
      console.log(server.address());
      console.log(`App listening on port ${port}`);
    })
    .catch((err) => console.log(err));
}

//updateDecks();

if (!USE_DATABASE) {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}

async function updateDecks() {
  const decks = await Deck.find();
  console.log(decks);
  decks.forEach((deck) => {
    deck.cards.forEach((card, index) => {
      if (card.index > 12) {
        card.sideboard = card.count;
        card.count = 0;
      }
    });

    if (deck.sideboard) {
      deck.sideboard.forEach((card) => {
        deck.cards.push({scryfallId: card.scryfallId, count: 0, sideboard: card.count});
      })

      deck.sideboard = undefined;
    }
    deck.save();
  });
}