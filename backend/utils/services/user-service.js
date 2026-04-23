const userRepository = require('../repositories/user-repository');
const leadRepository = require('../repositories/lead-repository');
const { normalizeStatus } = require('../lead-helpers');
const { requireFields, ensureEmail, ensurePhone } = require('../validation');
const { isAdmin, isSelfOrAdmin } = require('../authorization');
const { sanitizeUser, mergeUser } = require('../../Models/user.model');

function forbiddenUserReadError() {
  const error = new Error('You are not allowed to view this user data.');
  error.status = 403;
  return error;
}

async function list(actor) {
  if (!isAdmin(actor)) {
    throw forbiddenUserReadError();
  }
  return (await userRepository.getAll()).map(sanitizeUser);
}

async function withAnalytics(actor) {
  if (!isAdmin(actor)) {
    throw forbiddenUserReadError();
  }
  const leads = await leadRepository.getAll();
  return (await list(actor)).map((user) => {
    const owned = leads.filter((lead) => String(lead.owner || '').toLowerCase() === user.name.toLowerCase());
    const won = owned.filter((lead) => normalizeStatus(lead.status) === 'deal won');
    const closed = owned.filter((lead) => ['deal won', 'deal lost'].includes(normalizeStatus(lead.status)));
    return {
      ...user,
      analytics: {
        totalLeads: owned.length,
        totalValue: owned.reduce((sum, lead) => sum + Number(lead.value || 0), 0),
        wonDeals: won.length,
        winRate: closed.length ? (won.length / closed.length) * 100 : 0
      }
    };
  });
}

async function getById(actor, id) {
  const user = (await userRepository.getAll()).find((entry) => entry.id === id);
  if (!user) {
    const error = new Error('User not found.');
    error.status = 404;
    throw error;
  }
  if (!isSelfOrAdmin(actor, user)) {
    throw forbiddenUserReadError();
  }
  return sanitizeUser(user);
}

async function updateProfile(actor, payload) {
  requireFields({ name: payload.name || actor?.name }, ['name']);
  ensureEmail(payload.email || actor?.email);
  ensurePhone(payload.phone || actor?.phone || '');
  const users = await userRepository.getAll();
  const index = users.findIndex((entry) => entry.id === actor.id);
  if (index === -1) {
    const error = new Error('User not found.');
    error.status = 404;
    throw error;
  }
  users[index] = mergeUser(users[index], payload);
  await userRepository.upsert(users[index]);
  return sanitizeUser(users[index]);
}

async function updateUser(actor, id, payload) {
  if (!isAdmin(actor)) {
    const error = new Error('Only administrators can update other users.');
    error.status = 403;
    throw error;
  }
  const users = await userRepository.getAll();
  const index = users.findIndex((entry) => entry.id === id);
  if (index === -1) {
    const error = new Error('User not found.');
    error.status = 404;
    throw error;
  }
  requireFields({ name: payload.name || users[index].name }, ['name']);
  ensureEmail(payload.email || users[index].email);
  users[index] = mergeUser(users[index], payload);
  await userRepository.upsert(users[index]);
  return sanitizeUser(users[index]);
}

module.exports = {
  list,
  withAnalytics,
  getById,
  updateProfile,
  updateUser
};


