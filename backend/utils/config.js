const path = require('path');

const rootDir = path.resolve(__dirname, '..');
require('dotenv').config({ path: path.join(rootDir, '.env'), quiet: true });
const databaseUrl = process.env.DATABASE_URL || '';
const dbDialect = (process.env.DB_DIALECT || (databaseUrl.startsWith('mysql') ? 'mysql' : 'postgres')).toLowerCase();

module.exports = {
  rootDir,
  port: Number(process.env.PORT || 3000),
  jwtSecret: process.env.JWT_SECRET || 'grassroots-dev-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  dataDir: path.join(rootDir, 'data'),
  frontendDir: path.join(rootDir, '..', 'frontend'),
  databaseUrl,
  dbDialect,
  dbHost: process.env.DB_HOST || '127.0.0.1',
  dbPort: Number(process.env.DB_PORT || (dbDialect === 'mysql' ? 3306 : 5432)),
  dbName: process.env.DB_NAME || '',
  dbUser: process.env.DB_USER || '',
  dbPassword: process.env.DB_PASSWORD || '',
  autoMigrate: String(process.env.AUTO_MIGRATE || 'false').toLowerCase() === 'true'
};


