const { Router } = require('express');
const router = Router();

router.get("/", (req, res) => {
  res.sendFile(__dirname + "/create/index.html");
});

router.get("/app.js", (req, res) => {
  res.sendFile(__dirname + "/create/app.js");
});

router.get("/styles.css", (req, res) => {
  res.sendFile(__dirname + "/create/styles.css");
});

module.exports = router;