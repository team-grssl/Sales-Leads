function normalizeStatus(status) {
  return String(status || '').trim().toLowerCase();
}

function isClosedStatus(status) {
  return ['deal won', 'deal lost'].includes(normalizeStatus(status));
}

function normalizeLifecycle(value, fallbackStatus) {
  const lifecycle = String(value || '').trim().toLowerCase();
  if (lifecycle === 'hold') {
    return 'Hold';
  }
  if (lifecycle === 'closed' || isClosedStatus(fallbackStatus)) {
    return 'Closed';
  }
  return 'Active';
}

function normalizeCurrency(value) {
  const raw = String(value || 'INR').trim().toUpperCase();
  if (!raw) {
    return 'INR';
  }
  const code = raw.split(/[^A-Z]/).find((part) => part.length >= 3) || raw.slice(0, 3);
  return code.slice(0, 3) || 'INR';
}

function buildLeadRecord(input = {}, actorName = 'System') {
  const now = new Date().toISOString();
  const status = input.status || 'Prospecting';
  const businessUnit = String(
    input.businessUnit
    || input.business_unit
    || input.company
    || input.clientName
    || input.client_name
    || ''
  ).trim();
  const clientName = String(input.clientName || input.client_name || businessUnit || '').trim();
  const activity = Array.isArray(input.activity) ? input.activity : [
    {
      id: `ACT-${Date.now()}`,
      type: 'created',
      label: 'Lead created',
      actor: actorName,
      createdAt: now
    }
  ];
  return {
    id: input.id || `LD-${Date.now()}`,
    company: businessUnit,
    businessUnit,
    opportunityName: String(input.opportunityName || input.opportunity_name || '').trim(),
    clientName,
    contact: String(input.contact || '').trim(),
    phone: String(input.phone || '').trim(),
    email: String(input.email || '').trim(),
    value: Number(input.value || 0),
    status,
    lifecycle: normalizeLifecycle(input.lifecycle || input.state, status),
    industry: String(input.industry || input.lob || 'General').trim(),
    lob: String(input.lob || input.industry || 'General').trim(),
    owner: String(input.owner || actorName || 'Anitha').trim(),
    source: String(input.source || 'Website Direct').trim(),
    currency: normalizeCurrency(input.currency),
    date: input.date || now,
    description: String(input.description || '').trim(),
    location: input.location || null,
    nextAction: String(input.nextAction || '').trim(),
    progress: Number.isFinite(Number(input.progress)) ? Number(input.progress) : 25,
    website: String(input.website || '').trim(),
    comments: Array.isArray(input.comments) ? input.comments : [],
    activity
  };
}

function buildActivityEntry(type, label, actor, metadata = {}) {
  return {
    id: `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type,
    label,
    actor: actor || 'System',
    createdAt: new Date().toISOString(),
    metadata
  };
}

module.exports = {
  normalizeStatus,
  isClosedStatus,
  normalizeLifecycle,
  normalizeCurrency,
  buildLeadRecord,
  buildActivityEntry
};

