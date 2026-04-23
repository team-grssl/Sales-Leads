const express = require('express');
const ownerTargetController = require('../Controllers/owner-target-controller');
const { requireAuth } = require('../Middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.get('/', ownerTargetController.list);
router.get('/summary', ownerTargetController.listSummaries);
router.get('/:owner', ownerTargetController.getByOwner);
router.get('/:owner/summary', ownerTargetController.getOwnerSummary);
router.patch('/:id', ownerTargetController.update);

module.exports = router;
