const { DataTypes, Model } = require('sequelize');

class Client extends Model {}

function defineClientModel(sequelize) {
  Client.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'General'
      },
      projects: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      leads: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    },
    {
      sequelize,
      modelName: 'Client',
      tableName: 'clients',
      underscored: true,
      timestamps: true
    }
  );

  return Client;
}

function toPlainClient(client) {
  if (!client) {
    return null;
  }
  return typeof client.get === 'function' ? client.get({ plain: true }) : { ...client };
}

function createClient(input = {}) {
  return {
    id: input.id || `CLI-${Date.now()}`,
    name: String(input.name || '').trim(),
    category: String(input.category || 'General').trim(),
    projects: Number(input.projects || 0),
    leads: Number(input.leads || 0)
  };
}

function mergeClient(current, patch = {}) {
  const base = toPlainClient(current) || {};
  return {
    ...base,
    ...patch,
    name: String(patch.name || base.name || '').trim(),
    category: String(patch.category || base.category || 'General').trim(),
    projects: Number(patch.projects ?? base.projects ?? 0),
    leads: Number(patch.leads ?? base.leads ?? 0)
  };
}

module.exports = {
  Client,
  defineClientModel,
  toPlainClient,
  createClient,
  mergeClient
};


