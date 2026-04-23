const express = require('express');
const settingsController = require('../Controllers/settings-controller');
const { requireAuth } = require('../Middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.get('/', settingsController.getSettings);
router.patch('/', settingsController.updateSettings);

module.exports = router;

