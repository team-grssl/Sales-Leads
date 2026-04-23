const settingsRepository = require('../repositories/settings-repository');
const { isAdmin } = require('../authorization');
const { mergeSettings } = require('../../Models/settings.model');

async function getSettings() {
  return mergeSettings(await settingsRepository.get());
}

async function updateSettings(actor, patch) {
  if (!isAdmin(actor)) {
    const error = new Error('Only administrators can update workspace settings.');
    error.status = 403;
    throw error;
  }
  const current = await settingsRepository.get();
  const next = mergeSettings(current, patch);
  await settingsRepository.save(next);
  return next;
}

module.exports = {
  getSettings,
  updateSettings
};


