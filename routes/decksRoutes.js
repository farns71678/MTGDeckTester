const { requireAuth } = require('../middleware/authMiddleware');
const { Router } = require('express');
const router = Router();

router.get("/decks", requireAuth, (req, res) => {
  res.render('decks');
});

router.get("/decks/style.css", (req, res) => {
  res.sendFile("./decks/style.css", { root: __dirname });
});

router.get("/decks/app.js", (req, res) => {
  res.sendFile("./decks/app.js", { root: __dirname });
});

module.exports = router;