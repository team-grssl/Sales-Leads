const settingsService = require('../utils/services/settings-service');

async function getSettings(req, res, next) {
  try {
    res.json(await settingsService.getSettings());
  } catch (error) {
    next(error);
  }
}

async function updateSettings(req, res, next) {
  try {
    res.json(await settingsService.updateSettings(req.user, req.body || {}));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSettings,
  updateSettings
};


