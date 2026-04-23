const { hasDatabase } = require('../../db');
const { initModels } = require('../../Models');
const { toPlainOwnerTarget } = require('../../Models/owner-target.model');

async function getAll() {
  if (!hasDatabase()) {
    return [];
  }

  const { OwnerTarget } = initModels();
  return (await OwnerTarget.findAll({
    order: [['ownerName', 'ASC'], ['financialYear', 'ASC'], ['periodType', 'ASC'], ['periodKey', 'ASC']]
  })).map(toPlainOwnerTarget);
}

async function findById(id) {
  if (!hasDatabase()) {
    return null;
  }

  const { OwnerTarget } = initModels();
  return toPlainOwnerTarget(await OwnerTarget.findByPk(id));
}

async function upsert(target) {
  if (!hasDatabase()) {
    return target;
  }

  const { OwnerTarget } = initModels();
  await OwnerTarget.upsert(target);
  return target;
}

module.exports = {
  getAll,
  findById,
  upsert
};
