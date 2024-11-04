const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', authController.getLogin);
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/signup', authController.getSignup);
router.post('/signup', authController.postSignup);
router.get('/logout', authController.logout);
router.get('/dashboard', isAuthenticated, authController.getDashboard);

module.exports = router;