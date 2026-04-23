const express = require('express');
const authRoutes = require('./auth.routes');
const leadRoutes = require('./leads.routes');
const clientRoutes = require('./clients.routes');
const userRoutes = require('./users.routes');
const reportRoutes = require('./reports.routes');
const settingsRoutes = require('./settings.routes');
const ownerTargetRoutes = require('./owner-targets.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/leads', leadRoutes);
router.use('/clients', clientRoutes);
router.use('/users', userRoutes);
router.use('/reports', reportRoutes);
router.use('/settings', settingsRoutes);
router.use('/owner-targets', ownerTargetRoutes);

module.exports = router;

