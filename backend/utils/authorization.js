const { isClosedStatus, normalizeLifecycle } = require('./lead-helpers');

function isAdmin(user) {
  return String(user?.role || '').toLowerCase() === 'administrator';
}

function isLeadOwner(user, lead) {
  return String(user?.name || '').trim().toLowerCase() === String(lead?.owner || '').trim().toLowerCase();
}

function isSelfOrAdmin(actor, subject) {
  return isAdmin(actor) || String(actor?.id || '').trim() === String(subject?.id || '').trim();
}

function canManageLead(user, lead) {
  return isAdmin(user) || isLeadOwner(user, lead);
}

function canCommentOnLead(lead) {
  const lifecycle = normalizeLifecycle(lead?.lifecycle, lead?.status);
  return !isClosedStatus(lead?.status) && lifecycle !== 'Closed';
}

module.exports = {
  isAdmin,
  isSelfOrAdmin,
  isLeadOwner,
  canManageLead,
  canCommentOnLead
};

