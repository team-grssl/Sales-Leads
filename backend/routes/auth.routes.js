const express = require('express');
const authController = require('../Controllers/auth-controller');
const { requireAuth } = require('../Middleware/auth');

const router = express.Router();

router.post('/login', authController.login);
router.get('/me', requireAuth, authController.me);
router.post('/logout', requireAuth, authController.logout);

module.exports = router;

