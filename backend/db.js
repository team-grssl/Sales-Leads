const { QueryTypes, Sequelize } = require('sequelize');
const { databaseUrl, dbDialect, dbHost, dbPort, dbName, dbUser, dbPassword, frontendDir, autoMigrate } = require('./utils/config');

let sequelize = null;

function hasDatabase() {
  return Boolean(databaseUrl || (dbDialect && dbHost && dbName && dbUser));
}

function requireDatabase() {
  if (!hasDatabase()) {
    throw new Error('Database configuration is required. JSON and file-based fallbacks are disabled.');
  }
}

function getSequelize() {
  requireDatabase();

  if (!sequelize) {
    const options = {
      dialect: dbDialect,
      logging: false,
      define: {
        underscored: true,
        freezeTableName: true
      }
    };

    sequelize = databaseUrl
      ? new Sequelize(databaseUrl, options)
      : new Sequelize(dbName, dbUser, dbPassword, {
          ...options,
          host: dbHost,
          port: dbPort
        });
  }

  return sequelize;
}

async function query(text, params = []) {
  const db = getSequelize();

  const rows = await db.query(text, {
    bind: params,
    type: QueryTypes.SELECT
  });

  return {
    rows,
    rowCount: Array.isArray(rows) ? rows.length : 0
  };
}

async function ensureSchema() {
  const db = getSequelize();

  const { initModels } = require('./Models');
  initModels();

  await db.authenticate();

  const queryInterface = db.getQueryInterface();
  const leadColumns = await queryInterface.describeTable('leads').catch(() => null);
  if (leadColumns) {
    if (!leadColumns.business_unit) {
      await queryInterface.addColumn('leads', 'business_unit', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: ''
      });
      await db.query('UPDATE leads SET business_unit = company WHERE business_unit = "" OR business_unit IS NULL');
    }
    if (!leadColumns.opportunity_name) {
      await queryInterface.addColumn('leads', 'opportunity_name', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: ''
      });
    }
  }

  if (autoMigrate) {
    await db.sync();
  }
}

async function tableCount(tableName) {
  const result = await query(`SELECT COUNT(*) AS count FROM ${tableName}`);
  return Number(result.rows[0]?.count || 0);
}

async function closeDatabase() {
  if (sequelize) {
    await sequelize.close();
    sequelize = null;
  }
}

module.exports = {
  Sequelize,
  frontendDir,
  hasDatabase,
  requireDatabase,
  getSequelize,
  query,
  ensureSchema,
  tableCount,
  closeDatabase
};

