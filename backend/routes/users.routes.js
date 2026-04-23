const express = require('express');
const userController = require('../Controllers/user-controller');
const { requireAuth } = require('../Middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.get('/', userController.list);
router.get('/analytics', userController.listWithAnalytics);
router.get('/:id', userController.getById);
router.patch('/me', userController.updateMe);
router.patch('/:id', userController.updateUser);

module.exports = router;

