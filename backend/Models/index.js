const { Sequelize } = require('sequelize');
const { getSequelize } = require('../db');
const { User, defineUserModel } = require('./user.model');
const { Client, defineClientModel } = require('./client.model');
const { Lead, defineLeadModel } = require('./lead.model');
const { Settings, defineSettingsModel } = require('./settings.model');
const { OwnerTarget, defineOwnerTargetModel } = require('./owner-target.model');

let initialized = false;

function initModels() {
  if (initialized) {
    return { Sequelize, User, Client, Lead, Settings, OwnerTarget, sequelize: getSequelize() };
  }

  const sequelize = getSequelize();
  if (!sequelize) {
    return {};
  }

  defineUserModel(sequelize);
  defineClientModel(sequelize);
  defineLeadModel(sequelize);
  defineSettingsModel(sequelize);
  defineOwnerTargetModel(sequelize);

  User.hasMany(Lead, {
    as: 'ownedLeads',
    foreignKey: 'owner',
    sourceKey: 'name',
    constraints: false
  });
  Lead.belongsTo(User, {
    as: 'ownerProfile',
    foreignKey: 'owner',
    targetKey: 'name',
    constraints: false
  });

  Client.hasMany(Lead, {
    as: 'clientLeads',
    foreignKey: 'clientName',
    sourceKey: 'name',
    constraints: false
  });
  Lead.belongsTo(Client, {
    as: 'clientProfile',
    foreignKey: 'clientName',
    targetKey: 'name',
    constraints: false
  });

  User.hasMany(OwnerTarget, {
    as: 'targets',
    foreignKey: 'ownerName',
    sourceKey: 'name',
    constraints: false
  });
  OwnerTarget.belongsTo(User, {
    as: 'ownerProfile',
    foreignKey: 'ownerName',
    targetKey: 'name',
    constraints: false
  });

  initialized = true;
  return { Sequelize, User, Client, Lead, Settings, OwnerTarget, sequelize };
}

module.exports = {
  initModels
};


