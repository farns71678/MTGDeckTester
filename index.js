const express = require("express");
const proxy = require("express-http-proxy");
const mongoose = require("mongoose");
const { createProxyMiddleware } = require("http-proxy-middleware");
const url = require("url");
const routes = require('./routes/exports.js');
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');
const app = express();
const port = 3000;

//middleware
//app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser);

// Web navigation routes

app.set('view engine', 'ejs');

app.get('*', checkUser);

app.get("/", (req, res) => {
  //res.send('Hello, world!');
  res.sendFile(__dirname + "/home/index.html");
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
app.use(routes.authRoutes);
app.use(routes.storageRoutes);
app.use('/create', routes.createRoutes);
app.use('/decks', routes.decksRoutes);
app.use('/viewer', routes.viewerRoutes);
app.use('/account', routes.accountRoutes);

// database connection
//mongodb+srv://farnz71678:88LM1zR8SqcBrOYh@cluster0.patbhdu.mongodb.net/mtg-builder
// //?retryWrites=true&w=majority&appName=Cluster0
const dbURI = 'mongodb+srv://farnz71678:88LM1zR8SqcBrOYh@cluster0.patbhdu.mongodb.net/mtg-builder';
/*mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    app.listen(port);
    console.log(`Example app listening on port ${port}`);
  })
  .catch((err) => console.log(err));*/


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

