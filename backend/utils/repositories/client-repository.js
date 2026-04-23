const { hasDatabase } = require('../../db');
const { initModels } = require('../../Models');
const { toPlainClient } = require('../../Models/client.model');

async function getAll() {
  if (!hasDatabase()) {
    throw new Error('Database connection is required for client access.');
  }

  const { Client } = initModels();
  return (await Client.findAll({ order: [['name', 'ASC']] })).map(toPlainClient);
}

async function saveAll(clients) {
  if (!hasDatabase()) {
    throw new Error('Database connection is required for client persistence.');
  }

  const { Client, sequelize } = initModels();
  await sequelize.transaction(async (transaction) => {
    await Client.destroy({ where: {}, truncate: true, transaction });
    for (const client of clients) {
      await Client.upsert(client, { transaction });
    }
  });

  return clients;
}

async function findById(id) {
  if (!hasDatabase()) {
    throw new Error('Database connection is required for client access.');
  }

  const { Client } = initModels();
  return toPlainClient(await Client.findByPk(id));
}

async function upsert(client) {
  if (!hasDatabase()) {
    throw new Error('Database connection is required for client persistence.');
  }

  const { Client } = initModels();
  await Client.upsert(client);
  return client;
}

async function removeById(id) {
  if (!hasDatabase()) {
    throw new Error('Database connection is required for client persistence.');
  }

  const { Client } = initModels();
  await Client.destroy({ where: { id } });
}

module.exports = {
  getAll,
  saveAll,
  findById,
  upsert,
  removeById
};



