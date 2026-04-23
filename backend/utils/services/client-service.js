const clientRepository = require('../repositories/client-repository');
const leadRepository = require('../repositories/lead-repository');
const { requireFields, ensurePositiveNumber } = require('../validation');
const { createClient, mergeClient } = require('../../Models/client.model');

function clientKey(value) {
  return String(value || '').trim().toLowerCase();
}

async function list() {
  const [clients, leads] = await Promise.all([clientRepository.getAll(), leadRepository.getAll()]);
  return clients.map((client) => {
    const clientLeads = leads.filter((lead) => clientKey(lead.clientName || lead.businessUnit || lead.company) === clientKey(client.name));
    return {
      ...client,
      leads: clientLeads.length,
      totalValue: clientLeads.reduce((sum, lead) => sum + Number(lead.value || 0), 0)
    };
  });
}

async function getById(id) {
  const client = await clientRepository.findById(id);
  if (!client) {
    const error = new Error('Client not found.');
    error.status = 404;
    throw error;
  }
  return client;
}

async function create(payload) {
  requireFields(payload, ['name']);
  ensurePositiveNumber(payload.projects, 'projects');
  ensurePositiveNumber(payload.leads, 'leads');
  const clients = await clientRepository.getAll();
  const client = createClient(payload);
  clients.unshift(client);
  await clientRepository.upsert(client);
  return client;
}

async function update(id, payload) {
  const clients = await clientRepository.getAll();
  const index = clients.findIndex((client) => client.id === id);
  if (index === -1) {
    const error = new Error('Client not found.');
    error.status = 404;
    throw error;
  }
  requireFields({ name: payload.name || clients[index].name }, ['name']);
  ensurePositiveNumber(payload.projects, 'projects');
  ensurePositiveNumber(payload.leads, 'leads');
  const next = mergeClient(clients[index], payload);
  clients[index] = next;
  await clientRepository.upsert(next);
  return next;
}

async function getClientLeads(id) {
  const client = await getById(id);
  return (await leadRepository.getAll()).filter((lead) => {
    const leadClient = clientKey(lead.clientName || lead.businessUnit || lead.company);
    return leadClient === clientKey(client.name);
  });
}

module.exports = {
  list,
  getById,
  create,
  update,
  getClientLeads
};


