const { DataTypes, Model } = require('sequelize');

const DEFAULT_SETTINGS = {
  notifications: {
    newLeadActivity: true,
    stageChanges: true,
    weeklyReport: false
  },
  apiKey: 'at_live_839210_kx72_nd92_pq11',
  stages: ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Deal Won', 'Deal Lost']
};

class Settings extends Model {}

function defineSettingsModel(sequelize) {
  Settings.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      notifications: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: DEFAULT_SETTINGS.notifications
      },
      apiKey: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: DEFAULT_SETTINGS.apiKey,
        field: 'api_key'
      },
      stages: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: DEFAULT_SETTINGS.stages
      }
    },
    {
      sequelize,
      modelName: 'Settings',
      tableName: 'settings',
      underscored: true,
      timestamps: true
    }
  );

  return Settings;
}

function toPlainSettings(settings) {
  if (!settings) {
    return null;
  }
  return typeof settings.get === 'function' ? settings.get({ plain: true }) : { ...settings };
}

function mergeSettings(current = {}, patch = {}) {
  const base = toPlainSettings(current) || {};
  return {
    ...DEFAULT_SETTINGS,
    ...base,
    ...patch,
    id: base.id || patch.id || 1,
    notifications: {
      ...DEFAULT_SETTINGS.notifications,
      ...(base.notifications || {}),
      ...(patch.notifications || {})
    },
    stages: Array.isArray(patch.stages)
      ? patch.stages.filter(Boolean)
      : (Array.isArray(base.stages) ? base.stages : DEFAULT_SETTINGS.stages)
  };
}

module.exports = {
  Settings,
  DEFAULT_SETTINGS,
  defineSettingsModel,
  toPlainSettings,
  mergeSettings
};


