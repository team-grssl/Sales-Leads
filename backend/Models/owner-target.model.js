const { DataTypes, Model } = require('sequelize');

class OwnerTarget extends Model {}

function defineOwnerTargetModel(sequelize) {
  OwnerTarget.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      ownerName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'owner_name'
      },
      financialYear: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'financial_year'
      },
      periodType: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'period_type'
      },
      periodKey: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'period_key'
      },
      targetAmount: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'target_amount'
      }
    },
    {
      sequelize,
      modelName: 'OwnerTarget',
      tableName: 'owner_targets',
      underscored: true,
      timestamps: true
    }
  );

  return OwnerTarget;
}

function toPlainOwnerTarget(target) {
  if (!target) {
    return null;
  }
  const plainTarget = typeof target.get === 'function' ? target.get({ plain: true }) : { ...target };
  return {
    ...plainTarget,
    targetAmount: Number(plainTarget.targetAmount || 0)
  };
}

function createOwnerTarget(input = {}) {
  return {
    id: input.id || `OT-${Date.now()}`,
    ownerName: String(input.ownerName || input.owner || '').trim(),
    financialYear: Number(input.financialYear || new Date().getFullYear()),
    periodType: String(input.periodType || 'year').trim().toLowerCase(),
    periodKey: String(input.periodKey || 'FY').trim().toUpperCase(),
    targetAmount: Number(input.targetAmount || 0)
  };
}

function mergeOwnerTarget(current, patch = {}) {
  const base = toPlainOwnerTarget(current) || {};
  return {
    ...base,
    ...patch,
    ownerName: String(patch.ownerName || patch.owner || base.ownerName || '').trim(),
    financialYear: Number(patch.financialYear ?? base.financialYear ?? new Date().getFullYear()),
    periodType: String(patch.periodType || base.periodType || 'year').trim().toLowerCase(),
    periodKey: String(patch.periodKey || base.periodKey || 'FY').trim().toUpperCase(),
    targetAmount: Number(patch.targetAmount ?? base.targetAmount ?? 0)
  };
}

module.exports = {
  OwnerTarget,
  defineOwnerTargetModel,
  toPlainOwnerTarget,
  createOwnerTarget,
  mergeOwnerTarget
};
