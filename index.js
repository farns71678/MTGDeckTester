const express = require("express");
const proxy = require("express-http-proxy");
const mongoose = require("mongoose");
const { createProxyMiddleware } = require("http-proxy-middleware");
const url = require("url");
const routes = require("./routes/exports.js");
const cookieParser = require("cookie-parser");
const { requireAuth, checkUser } = require("./middleware/authMiddleware");
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
  res.sendFile(__dirname + "/home/index.html");
});

/*app.get("/images/*", (req, res) => {
  res.sendFile(__dirname + req.path);
});*/

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
  })
);

// routes
app.use(routes.authRoutes);
app.use(routes.storageRoutes);

app.get("/decks", requireAuth, checkUser, (req, res) => {
  res.render("decks");
});

app.get("/create", requireAuth, checkUser, (req, res) => {
  res.render("create");
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

if (!USE_DATABASE) {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}
