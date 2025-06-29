const { Router } = require('express');
const storageController = require('../controllers/storageController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = Router();

router.post('createdeck', requireAuth, storageController.createDeck);
router.post('savedeck', requireAuth, storageController.saveDeck);
router.post('deletedeck', requireAuth, storageController.deleteDeck);
router.get('deckinfo', storageController.deckInfo);

module.exports = router;