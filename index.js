const express = require("express");
const proxy = require("express-http-proxy");
const mongoose = require("mongoose");
const { createProxyMiddleware } = require("http-proxy-middleware");
const url = require("url");
const authRoutes = require('./routes/authRoutes');
const storageRoutes = require("./routes/storageRoutes");
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');
const app = express();
const port = 3000;

//middleware
//app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser);

// Web navigation

app.set('view engine', 'ejs');

app.get('*', checkUser);

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

app.get("/decks", requireAuth, (req, res) => {
  res.render('decks');
});

app.get("/decks/style.css", (req, res) => {
  res.sendFile("./decks/style.css", { root: __dirname });
});

app.get("/decks/app.js", (req, res) => {
  res.sendFile("./decks/app.js", { root: __dirname });
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


// routes
app.use(authRoutes);
app.use(storageRoutes);

// database connection
//mongodb+srv://farnz71678:88LM1zR8SqcBrOYh@cluster0.patbhdu.mongodb.net/mtg-builder
// //?retryWrites=true&w=majority&appName=Cluster0
const dbURI = 'mongodb+srv://farnz71678:88LM1zR8SqcBrOYh@cluster0.patbhdu.mongodb.net/mtg-builder';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    app.listen(port);
    console.log(`Example app listening on port ${port}`);
  })
  .catch((err) => console.log(err));


/*app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});*/

