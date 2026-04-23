const express = require('express');
const clientController = require('../Controllers/client-controller');
const { requireAuth } = require('../Middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.get('/', clientController.list);
router.get('/:id', clientController.getById);
router.get('/:id/leads', clientController.getLeads);
router.post('/', clientController.create);
router.patch('/:id', clientController.update);

module.exports = router;

