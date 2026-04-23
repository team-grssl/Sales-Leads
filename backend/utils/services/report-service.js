const leadRepository = require('../repositories/lead-repository');
const { getFiscalYearStart, inRange } = require('../fiscal');
const { normalizeStatus } = require('../lead-helpers');

async function filterLeads(filters = {}) {
  return (await leadRepository.getAll()).filter((lead) => inRange(lead.date, filters.from, filters.to));
}

async function buildSummary(filters = {}) {
  const filtered = await filterLeads(filters);
  const ytdStart = filters.ytdFrom || getFiscalYearStart(filters.to || new Date()).toISOString();
  const ytd = (await leadRepository.getAll()).filter((lead) => inRange(lead.date, ytdStart, filters.to));
  const won = filtered.filter((lead) => normalizeStatus(lead.status) === 'deal won');
  const closed = filtered.filter((lead) => ['deal won', 'deal lost'].includes(normalizeStatus(lead.status)));

  return {
    selectedRange: {
      from: filters.from || null,
      to: filters.to || null,
      totalLeads: filtered.length,
      wonRevenue: won.reduce((sum, lead) => sum + Number(lead.value || 0), 0),
      winRate: closed.length ? (won.length / closed.length) * 100 : 0
    },
    ytd: {
      from: ytdStart,
      to: filters.to || null,
      totalLeads: ytd.length,
      wonRevenue: ytd.filter((lead) => normalizeStatus(lead.status) === 'deal won').reduce((sum, lead) => sum + Number(lead.value || 0), 0)
    }
  };
}

async function buildDashboardSummary(filters = {}) {
  const leads = await filterLeads(filters);
  const activeLeads = leads.filter((lead) => !['deal won', 'deal lost'].includes(normalizeStatus(lead.status)));
  const wonLeads = leads.filter((lead) => normalizeStatus(lead.status) === 'deal won');
  const closedLeads = leads.filter((lead) => ['deal won', 'deal lost'].includes(normalizeStatus(lead.status)));
  const statusBreakdown = leads.reduce((accumulator, lead) => {
    const key = lead.status;
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});

  return {
    totalLeads: leads.length,
    pipelineValue: activeLeads.reduce((sum, lead) => sum + Number(lead.value || 0), 0),
    wonRevenue: wonLeads.reduce((sum, lead) => sum + Number(lead.value || 0), 0),
    winRate: closedLeads.length ? (wonLeads.length / closedLeads.length) * 100 : 0,
    activeLeads: activeLeads.length,
    closedLeads: closedLeads.length,
    statusBreakdown
  };
}

async function buildTeamPerformance(filters = {}) {
  const filtered = await filterLeads(filters);
  const owners = new Map();

  filtered.forEach((lead) => {
    const key = String(lead.owner || 'Unassigned');
    if (!owners.has(key)) {
      owners.set(key, {
        owner: key,
        totalLeads: 0,
        totalValue: 0,
        wonDeals: 0,
        closedDeals: 0
      });
    }
    const entry = owners.get(key);
    entry.totalLeads += 1;
    entry.totalValue += Number(lead.value || 0);
    if (normalizeStatus(lead.status) === 'deal won') {
      entry.wonDeals += 1;
    }
    if (['deal won', 'deal lost'].includes(normalizeStatus(lead.status))) {
      entry.closedDeals += 1;
    }
  });

  return Array.from(owners.values()).map((entry) => ({
    ...entry,
    winRate: entry.closedDeals ? (entry.wonDeals / entry.closedDeals) * 100 : 0
  }));
}

async function buildOwnerReport(owner, filters = {}) {
  const leads = (await filterLeads(filters)).filter((lead) => String(lead.owner || '').toLowerCase() === String(owner || '').toLowerCase());
  const won = leads.filter((lead) => normalizeStatus(lead.status) === 'deal won');
  const closed = leads.filter((lead) => ['deal won', 'deal lost'].includes(normalizeStatus(lead.status)));

  return {
    owner,
    totalLeads: leads.length,
    totalValue: leads.reduce((sum, lead) => sum + Number(lead.value || 0), 0),
    winRate: closed.length ? (won.length / closed.length) * 100 : 0,
    leads
  };
}

module.exports = {
  buildDashboardSummary,
  buildSummary,
  buildTeamPerformance,
  buildOwnerReport
};


