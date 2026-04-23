const ownerTargetRepository = require('../repositories/owner-target-repository');
const leadRepository = require('../repositories/lead-repository');
const userRepository = require('../repositories/user-repository');
const { isAdmin } = require('../authorization');
const { createOwnerTarget, mergeOwnerTarget } = require('../../Models/owner-target.model');
const { getFiscalQuarter, getFiscalQuarterMonths, getFiscalQuarterRange, getFiscalYearNumber, getFiscalYearStart, getFiscalYearEnd, parseDate } = require('../fiscal');
const { normalizeStatus } = require('../lead-helpers');
const { requireFields, ensurePositiveNumber } = require('../validation');

function sameOwner(left, right) {
  return String(left || '').trim().toLowerCase() === String(right || '').trim().toLowerCase();
}

function inDateWindow(value, start, end) {
  const date = parseDate(value);
  return Boolean(date && date >= start && date <= end);
}

function sumWonRevenue(leads) {
  return leads
    .filter((lead) => normalizeStatus(lead.status) === 'deal won')
    .reduce((sum, lead) => sum + Number(lead.value || 0), 0);
}

async function list() {
  return ownerTargetRepository.getAll();
}

async function getByOwner(ownerName, financialYear = getFiscalYearNumber(new Date())) {
  return (await ownerTargetRepository.getAll()).filter((target) =>
    sameOwner(target.ownerName, ownerName) && Number(target.financialYear) === Number(financialYear)
  );
}

async function update(actor, id, payload) {
  if (!isAdmin(actor)) {
    const error = new Error('Only administrators can update owner targets.');
    error.status = 403;
    throw error;
  }

  const current = await ownerTargetRepository.findById(id);
  if (!current) {
    const error = new Error('Owner target not found.');
    error.status = 404;
    throw error;
  }

  requireFields({ ownerName: payload.ownerName || current.ownerName }, ['ownerName']);
  ensurePositiveNumber(payload.targetAmount, 'targetAmount');

  const next = mergeOwnerTarget(current, payload);
  await ownerTargetRepository.upsert(next);
  return next;
}

async function buildOwnerSummary(ownerName, inputDate = new Date()) {
  const date = parseDate(inputDate) || new Date();
  const financialYear = getFiscalYearNumber(date);
  const currentQuarter = getFiscalQuarter(date);
  const quarterRange = getFiscalQuarterRange(date);
  const fiscalStart = getFiscalYearStart(date);
  const fiscalEnd = getFiscalYearEnd(date);

  const [targets, leads] = await Promise.all([
    getByOwner(ownerName, financialYear),
    leadRepository.getAll()
  ]);

  const ownerLeads = leads.filter((lead) => sameOwner(lead.owner, ownerName));
  const fiscalLeads = ownerLeads.filter((lead) => inDateWindow(lead.date, fiscalStart, fiscalEnd));
  const quarterLeads = ownerLeads.filter((lead) => inDateWindow(lead.date, quarterRange.start, quarterRange.end));

  const yearTarget = targets.find((target) => target.periodType === 'year');
  const quarterTarget = targets.find((target) => target.periodType === 'quarter' && String(target.periodKey).toUpperCase() === currentQuarter);

  const yearClosedAmount = sumWonRevenue(fiscalLeads);
  const quarterClosedAmount = sumWonRevenue(quarterLeads);
  const yearTargetAmount = Number(yearTarget?.targetAmount || 0);
  const quarterTargetAmount = Number(quarterTarget?.targetAmount || 0);

  const quarterMonths = getFiscalQuarterMonths(date);
  let actualCumulative = 0;
  const quarterTrend = quarterMonths.map((month, index) => {
    const monthStart = new Date(Date.UTC(month.year, month.month, 1, 0, 0, 0, 0));
    const monthEnd = new Date(Date.UTC(month.year, month.month + 1, 0, 23, 59, 59, 999));
    actualCumulative += sumWonRevenue(ownerLeads.filter((lead) => inDateWindow(lead.date, monthStart, monthEnd)));
    const targetCumulative = quarterTargetAmount ? (quarterTargetAmount * (index + 1)) / quarterMonths.length : 0;
    return {
      label: month.label,
      actualClosedAmount: actualCumulative,
      targetAmount: targetCumulative
    };
  });

  return {
    owner: ownerName,
    financialYear,
    currentQuarter,
    yearTargetAmount,
    yearClosedAmount,
    yearRemainingAmount: Math.max(0, yearTargetAmount - yearClosedAmount),
    quarterTargetAmount,
    quarterClosedAmount,
    quarterRemainingAmount: Math.max(0, quarterTargetAmount - quarterClosedAmount),
    quarterTrend
  };
}

async function buildAllSummaries(inputDate = new Date()) {
  const users = await userRepository.getAll();
  return Promise.all(users.map((user) => buildOwnerSummary(user.name, inputDate)));
}

module.exports = {
  list,
  getByOwner,
  update,
  buildOwnerSummary,
  buildAllSummaries
};
