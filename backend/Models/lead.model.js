const { DataTypes, Model } = require('sequelize');
const { buildLeadRecord, normalizeLifecycle } = require('../utils/lead-helpers');

class Lead extends Model {}

function defineLeadModel(sequelize) {
  Lead.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      company: {
        type: DataTypes.STRING,
        allowNull: false
      },
      businessUnit: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'business_unit'
      },
      opportunityName: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '',
        field: 'opportunity_name'
      },
      clientName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'client_name'
      },
      contact: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ''
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ''
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ''
      },
      value: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false,
        defaultValue: 0
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Prospecting'
      },
      lifecycle: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Active'
      },
      industry: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'General'
      },
      lob: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'General'
      },
      owner: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Anitha'
      },
      source: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Website Direct'
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'INR'
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: ''
      },
      location: {
        type: DataTypes.JSON,
        allowNull: true
      },
      nextAction: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '',
        field: 'next_action'
      },
      progress: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 25
      },
      website: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ''
      },
      comments: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
      },
      activity: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
      }
    },
    {
      sequelize,
      modelName: 'Lead',
      tableName: 'leads',
      underscored: true,
      timestamps: true
    }
  );

  return Lead;
}

function toPlainLead(lead) {
  if (!lead) {
    return null;
  }
  const plainLead = typeof lead.get === 'function' ? lead.get({ plain: true }) : { ...lead };
  return {
    ...plainLead,
    businessUnit: plainLead.businessUnit || plainLead.company || '',
    opportunityName: plainLead.opportunityName || '',
    company: plainLead.businessUnit || plainLead.company || '',
    value: Number(plainLead.value || 0),
    progress: Number(plainLead.progress || 0),
    comments: Array.isArray(plainLead.comments) ? plainLead.comments : [],
    activity: Array.isArray(plainLead.activity) ? plainLead.activity : []
  };
}

function createLead(input, actorName) {
  return buildLeadRecord(input, actorName);
}

function mergeLead(current, patch) {
  const base = toPlainLead(current) || {};
  const nextBusinessUnit = Object.prototype.hasOwnProperty.call(patch, 'businessUnit')
    ? patch.businessUnit
    : (Object.prototype.hasOwnProperty.call(patch, 'business_unit')
      ? patch.business_unit
      : (Object.prototype.hasOwnProperty.call(patch, 'company') ? patch.company : base.businessUnit || base.company));
  const nextOpportunityName = Object.prototype.hasOwnProperty.call(patch, 'opportunityName')
    ? patch.opportunityName
    : (Object.prototype.hasOwnProperty.call(patch, 'opportunity_name')
      ? patch.opportunity_name
      : base.opportunityName);
  return {
    ...base,
    ...patch,
    company: String(nextBusinessUnit || '').trim(),
    businessUnit: String(nextBusinessUnit || '').trim(),
    opportunityName: String(nextOpportunityName || '').trim(),
    lifecycle: normalizeLifecycle(patch.lifecycle || patch.state || base.lifecycle, patch.status || base.status)
  };
}

module.exports = {
  Lead,
  defineLeadModel,
  toPlainLead,
  createLead,
  mergeLead
};


