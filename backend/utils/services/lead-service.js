const leadRepository = require('../repositories/lead-repository');
const clientRepository = require('../repositories/client-repository');
const { buildLeadRecord, buildActivityEntry, normalizeLifecycle, normalizeStatus, isClosedStatus } = require('../lead-helpers');
const { inRange } = require('../fiscal');
const { requireFields, ensureEmail, ensurePhone, ensurePositiveNumber, validationError } = require('../validation');
const { canManageLead, canCommentOnLead } = require('../authorization');
const { createLead, mergeLead } = require('../../Models/lead.model');
const { createClient } = require('../../Models/client.model');

function matchesSearch(lead, query) {
  const text = [
    lead.id,
    lead.businessUnit,
    lead.company,
    lead.opportunityName,
    lead.clientName,
    lead.contact,
    lead.email,
    lead.phone,
    lead.owner,
    lead.status,
    lead.lifecycle,
    lead.industry,
    lead.source
  ].join(' ').toLowerCase();
  return text.includes(String(query || '').trim().toLowerCase());
}

function clientKey(value) {
  return String(value || '').trim().toLowerCase();
}

async function list(filters = {}) {
  return (await leadRepository.getAll()).filter((lead) => {
    if (filters.owner && String(lead.owner).toLowerCase() !== String(filters.owner).toLowerCase()) {
      return false;
    }
    if (filters.status && normalizeStatus(lead.status) !== normalizeStatus(filters.status)) {
      return false;
    }
    if (filters.lifecycle && normalizeLifecycle(lead.lifecycle, lead.status).toLowerCase() !== String(filters.lifecycle).toLowerCase()) {
      return false;
    }
    if (filters.clientName && String(lead.clientName || lead.company || '').toLowerCase() !== String(filters.clientName).toLowerCase()) {
      return false;
    }
    if (filters.search && !matchesSearch(lead, filters.search)) {
      return false;
    }
    if ((filters.from || filters.to) && !inRange(lead.date, filters.from, filters.to)) {
      return false;
    }
    return true;
  });
}

async function getById(id) {
  const lead = await leadRepository.findById(id);
  if (!lead) {
    const error = new Error('Lead not found.');
    error.status = 404;
    throw error;
  }
  return lead;
}

async function create(payload, actor) {
  requireFields(payload, ['contact']);
  if (!payload.businessUnit && !payload.company && !payload.clientName) {
    throw validationError('businessUnit or clientName is required.');
  }
  ensureEmail(payload.email);
  ensurePhone(payload.phone);
  ensurePositiveNumber(payload.value, 'value');
  const lead = createLead(payload, actor?.name);
  await leadRepository.upsert(lead);
  const clientName = String(lead.clientName || lead.businessUnit || lead.company || '').trim();
  if (clientName) {
    const clients = await clientRepository.getAll();
    const existingClient = clients.find((client) => String(client.name || '').trim().toLowerCase() === clientName.toLowerCase());
    if (!existingClient) {
      await clientRepository.upsert(createClient({
        name: clientName,
        category: lead.industry || lead.lob || 'General',
        projects: 1,
        leads: 1
      }));
    }
  }
  return lead;
}

async function update(id, patch, actor) {
  const current = await leadRepository.findById(id);
  if (!current) {
    const error = new Error('Lead not found.');
    error.status = 404;
    throw error;
  }
  if (!canManageLead(actor, current)) {
    const error = new Error('You are not allowed to update this lead.');
    error.status = 403;
    throw error;
  }
  ensureEmail(patch.email);
  ensurePhone(patch.phone);
  ensurePositiveNumber(patch.value, 'value');
  if (isClosedStatus(current.status)) {
    const attemptedClosedEdit = ['value', 'contact', 'phone', 'email', 'status', 'owner', 'lifecycle', 'state'].some((field) => field in patch);
    if (attemptedClosedEdit) {
      const error = new Error('Closed leads cannot be edited.');
      error.status = 409;
      throw error;
    }
  }

  const nextActivity = Array.isArray(current.activity) ? current.activity.slice() : [];
  if (patch.status && patch.status !== current.status) {
    nextActivity.push(buildActivityEntry('status_change', `Lead moved to ${patch.status}`, actor?.name, { from: current.status, to: patch.status }));
  }
  const nextLifecycleValue = patch.lifecycle || patch.state;
  if (nextLifecycleValue && normalizeLifecycle(nextLifecycleValue, patch.status || current.status) !== normalizeLifecycle(current.lifecycle, current.status)) {
    nextActivity.push(buildActivityEntry('lifecycle_change', `Lead moved to ${normalizeLifecycle(nextLifecycleValue, patch.status || current.status)}`, actor?.name, { from: current.lifecycle, to: nextLifecycleValue }));
  }
  if (patch.owner && patch.owner !== current.owner) {
    nextActivity.push(buildActivityEntry('owner_change', `Lead reassigned to ${patch.owner}`, actor?.name, { from: current.owner, to: patch.owner }));
  }

  const next = {
    ...mergeLead(current, patch),
    activity: nextActivity
  };
  return leadRepository.updateById(id, next);
}

async function remove(id, actor) {
  const lead = await leadRepository.findById(id);
  if (!lead) {
    const error = new Error('Lead not found.');
    error.status = 404;
    throw error;
  }
  if (!canManageLead(actor, lead)) {
    const error = new Error('You are not allowed to delete this lead.');
    error.status = 403;
    throw error;
  }
  const removedClientKey = clientKey(lead.clientName || lead.businessUnit || lead.company);
  await leadRepository.removeById(id);
  if (!removedClientKey) {
    return;
  }

  const [remainingLeads, clients] = await Promise.all([
    leadRepository.getAll(),
    clientRepository.getAll()
  ]);
  const hasRemainingLeads = remainingLeads.some((item) => clientKey(item.clientName || item.businessUnit || item.company) === removedClientKey);
  if (hasRemainingLeads) {
    return;
  }

  const orphanClient = clients.find((client) => clientKey(client.name) === removedClientKey);
  if (orphanClient) {
    await clientRepository.removeById(orphanClient.id);
  }
}

async function addComment(id, comment, actor) {
  const lead = await leadRepository.findById(id);
  if (!lead) {
    const error = new Error('Lead not found.');
    error.status = 404;
    throw error;
  }
  if (!comment) {
    const error = new Error('Comment is required.');
    error.status = 400;
    throw error;
  }
  if (!canManageLead(actor, lead)) {
    const error = new Error('You are not allowed to comment on this lead.');
    error.status = 403;
    throw error;
  }
  if (!canCommentOnLead(lead)) {
    const error = new Error('Comments are disabled once the lead is closed.');
    error.status = 409;
    throw error;
  }
  const nextComment = {
    id: `COM-${Date.now()}`,
    body: String(comment).trim(),
    author: actor?.name || 'System',
    createdAt: new Date().toISOString()
  };
  const comments = Array.isArray(lead.comments) ? lead.comments.slice() : [];
  comments.push(nextComment);
  await leadRepository.updateById(id, {
    ...lead,
    comments,
    activity: [...(Array.isArray(lead.activity) ? lead.activity : []), buildActivityEntry('comment', 'Comment added', actor?.name, { comment: nextComment.body })]
  });
  return nextComment;
}

async function getActivity(id) {
  const lead = await getById(id);
  return Array.isArray(lead.activity) ? lead.activity : [];
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  addComment,
  getActivity
};


