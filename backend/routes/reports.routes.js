const express = require('express');
const reportController = require('../Controllers/report-controller');
const { requireAuth } = require('../Middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.get('/dashboard', reportController.dashboardSummary);
router.get('/summary', reportController.summary);
router.get('/team-performance', reportController.teamPerformance);
router.get('/owners/:owner', reportController.ownerReport);

module.exports = router;

