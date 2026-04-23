const { hasDatabase } = require('../../db');
const { initModels } = require('../../Models');
const { toPlainLead } = require('../../Models/lead.model');

async function getAll() {
  if (!hasDatabase()) {
    throw new Error('Database connection is required for lead access.');
  }

  const { Lead } = initModels();
  return (await Lead.findAll({ order: [['date', 'DESC'], ['createdAt', 'DESC']] })).map(toPlainLead);
}

async function saveAll(leads) {
  if (!hasDatabase()) {
    throw new Error('Database connection is required for lead persistence.');
  }

  const { Lead, sequelize } = initModels();
  await sequelize.transaction(async (transaction) => {
    await Lead.destroy({ where: {}, truncate: true, transaction });
    for (const lead of leads) {
      await Lead.upsert(lead, { transaction });
    }
  });

  return leads;
}

async function findById(id) {
  if (!hasDatabase()) {
    throw new Error('Database connection is required for lead access.');
  }

  const { Lead } = initModels();
  return toPlainLead(await Lead.findByPk(id));
}

async function upsert(lead) {
  if (!hasDatabase()) {
    throw new Error('Database connection is required for lead persistence.');
  }

  const { Lead } = initModels();
  await Lead.upsert(lead);
  return lead;
}

async function updateById(id, patch) {
  if (!hasDatabase()) {
    throw new Error('Database connection is required for lead persistence.');
  }

  const { Lead } = initModels();
  const existing = await Lead.findByPk(id);
  if (!existing) {
    return null;
  }
  await existing.update(patch);
  return toPlainLead(existing);
}

async function removeById(id) {
  if (!hasDatabase()) {
    throw new Error('Database connection is required for lead persistence.');
  }

  const { Lead } = initModels();
  await Lead.destroy({ where: { id } });
}

module.exports = {
  getAll,
  saveAll,
  findById,
  upsert,
  updateById,
  removeById
};



