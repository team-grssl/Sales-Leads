const { hasDatabase } = require('../../db');
const { initModels } = require('../../Models');
const { toPlainUser } = require('../../Models/user.model');

async function getAll() {
  if (!hasDatabase()) {
    throw new Error('Database connection is required for user access.');
  }

  const { User } = initModels();
  return (await User.findAll({ order: [['name', 'ASC']] })).map(toPlainUser);
}

async function findById(id) {
  if (!hasDatabase()) {
    throw new Error('Database connection is required for user access.');
  }

  const { User } = initModels();
  return toPlainUser(await User.findByPk(id));
}

async function findByMobile(mobile) {
  const normalizedMobile = String(mobile || '').replace(/\s+/g, '');

  if (!hasDatabase()) {
    throw new Error('Database connection is required for user access.');
  }

  return (await getAll()).find((user) => String(user.mobile || '').replace(/\s+/g, '') === normalizedMobile) || null;
}

async function findByUsername(username) {
  const normalizedUsername = String(username || '').trim().toLowerCase();
  if (!normalizedUsername) {
    return null;
  }

  return (await getAll()).find((user) => {
    const nameMatch = String(user.name || '').trim().toLowerCase() === normalizedUsername;
    const emailMatch = String(user.email || '').trim().toLowerCase() === normalizedUsername;
    return nameMatch || emailMatch;
  }) || null;
}

async function saveAll(users) {
  if (!hasDatabase()) {
    throw new Error('Database connection is required for user persistence.');
  }

  const { User, sequelize } = initModels();
  await sequelize.transaction(async (transaction) => {
    await User.destroy({ where: {}, truncate: true, transaction });
    for (const user of users) {
      await User.upsert(user, { transaction });
    }
  });

  return users;
}

async function upsert(user) {
  if (!hasDatabase()) {
    throw new Error('Database connection is required for user persistence.');
  }

  const { User } = initModels();
  await User.upsert(user);
  return user;
}

module.exports = {
  getAll,
  findById,
  findByMobile,
  findByUsername,
  saveAll,
  upsert
};



