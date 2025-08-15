const { Router } = require('express');
const router = Router();

router.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

router.get("/app.js", (req, res) => {
  res.sendFile(__dirname + "/app.js");
});

router.get("/styles.css", (req, res) => {
  res.sendFile(__dirname + "/styles.css");
});

router.get("/storage.json", (req, res) => {
  res.sendFile(__dirname + "/storage.json");
});

module.exports = router;