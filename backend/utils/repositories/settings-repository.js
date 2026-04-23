const { hasDatabase } = require('../../db');
const { initModels } = require('../../Models');
const { mergeSettings, toPlainSettings } = require('../../Models/settings.model');

async function get() {
  if (!hasDatabase()) {
    throw new Error('Database connection is required for settings access.');
  }

  const { Settings } = initModels();
  const settings = await Settings.findByPk(1);
  return mergeSettings(toPlainSettings(settings));
}

async function save(settings) {
  if (!hasDatabase()) {
    throw new Error('Database connection is required for settings persistence.');
  }

  const { Settings } = initModels();
  const next = mergeSettings(settings);
  await Settings.upsert(next);
  return next;
}

module.exports = {
  get,
  save
};



