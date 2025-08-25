const { Router } = require('express');
const storageController = require('../controllers/storageController');
const { requireAuth, checkUser } = require('../middleware/authMiddleware');

const router = Router();

router.post('/createdeck', requireAuth, checkUser, storageController.createDeck);
router.post('/savedeck', requireAuth, checkUser, storageController.saveDeck);
router.post('/deletedeck', requireAuth, checkUser, storageController.deleteDeck);
router.get('/deckinfo', requireAuth, checkUser, storageController.deckInfo);
router.get('/decklist', requireAuth, checkUser, storageController.deckList);

module.exports = router;