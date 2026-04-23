const express = require('express');
const leadController = require('../Controllers/lead-controller');
const { requireAuth } = require('../Middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.get('/', leadController.list);
router.get('/:id', leadController.getById);
router.get('/:id/activity', leadController.getActivity);
router.post('/', leadController.create);
router.patch('/:id', leadController.update);
router.delete('/:id', leadController.remove);
router.post('/:id/comments', leadController.addComment);

module.exports = router;

