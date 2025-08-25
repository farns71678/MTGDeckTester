const { Router } = require('express');
const { checkUser } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');

const router = Router();

router.get('/signup', checkUser,  authController.signup_get);
router.post('/signup', authController.signup_post);
router.get('/login', checkUser, authController.login_get);
router.post('/login', authController.login_post);
router.get('/logout', authController.logout_get);

module.exports = router;