(() => {
    const STORAGE_KEYS = {
        leads: 'grassroots_custom_leads',
        clients: 'grassroots_custom_clients',
        users: 'grassroots_custom_users',
        stages: 'grassroots_pipeline_stages',
        settings: 'grassroots_frontend_settings',
        profile: 'grassroots_user_profile',
        location: 'grassroots_current_location',
        leadOverrides: 'grassroots_lead_overrides'
    };

    const DEFAULT_SETTINGS = {
        notifications: {
            newLeadActivity: true,
            stageChanges: true,
            weeklyReport: false
        },
        apiKey: 'at_live_839210_kx72_nd92_pq11'
    };

    const DEFAULT_PROFILE = {
        name: 'Alex Sterling',
        role: 'Administrator',
        email: 'alex.sterling@grassroots.ai',
        phone: '+1 (555) 014-8294',
        location: 'San Francisco, CA',
        bio: 'Revenue operations lead shaping the Grassroots sales intelligence workflow.',
        focus: 'Enterprise pipeline acceleration',
        initials: 'AS',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkuZOcjt-C24EHkEMkzVMN0gxkiVqTeCUuU-sqs3lyHwyYKwjYOxZ6GG_okwlao8iia3eX3flUy8W0zIXcZj25dY6YzKo8hnPHjN0RXxZm97kK0Qttd6Sagb6er_ZkQVm9x_2Bzk23bf5BAHxWdCMObQRiBsiDnQzGdTPNatULdFoUeRn489INMgrx7AoEOOeqEqvtb0V0ap54vhEx0PBegSZySyYgcwzwUfrkCDliuZZSp1CjuiZsIeAkUjqU6tbEo5t3Z0pgDwRD'
    };

    const DEFAULT_LOCATION = {
        label: 'San Francisco, CA',
        lat: '37.7749',
        lng: '-122.4194'
    };

    const statusCycle = ['Draft', 'Discovery', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];
    const DISPLAY_CURRENCY = 'INR';

    function daysAgo(days) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date.toISOString();
    }

    const DEFAULT_LEADS = [
        { id: 'LD-9021', company: 'Velocity Media', contact: 'Sarah Jenkins', value: 45000, status: 'Qualified', industry: 'Enterprise', owner: 'John Doe', source: 'Inbound Marketing', currency: 'USD', date: daysAgo(12), progress: 62 },
        { id: 'LD-8842', company: 'Aura Analytics', contact: 'Michael Chen', value: 12800, status: 'Discovery', industry: 'Follow-up', owner: 'Alice Smith', source: 'Outbound Sales', currency: 'USD', date: daysAgo(18), progress: 28 },
        { id: 'LD-8701', company: 'Prism Labs', contact: 'Elena Rodri', value: 22500, status: 'Proposal Sent', industry: 'SAAS', owner: 'John Doe', source: 'Website Direct', currency: 'USD', date: daysAgo(7), progress: 71 },
        { id: 'LD-8650', company: 'Oasis Fintech', contact: 'Tom Vance', value: 8400, status: 'Nurturing', industry: 'SME', owner: 'Alice Smith', source: 'Referrals', currency: 'USD', date: daysAgo(3), progress: 24 },
        { id: 'LD-8512', company: 'Lumen Systems', contact: 'Gary Oldman', value: 64000, status: 'Lost', industry: 'Enterprise', owner: 'John Doe', source: 'Outbound Sales', currency: 'USD', date: daysAgo(21), progress: 42 },
        { id: 'L-9402', company: 'NexaLogistics', contact: 'Sarah Jenkins', value: 45000, status: 'Qualified', industry: 'Logistics', owner: 'Alex Rivera', source: 'Inbound Marketing', currency: 'USD', date: daysAgo(2), progress: 67 },
        { id: 'L-9405', company: 'Quantum Tech', contact: 'Marcus Thorne', value: 128500, status: 'Negotiation', industry: 'Technology', owner: 'Elena Sofia', source: 'Referrals', currency: 'USD', date: daysAgo(5), progress: 84 },
        { id: 'L-9408', company: 'Velocity AI', contact: 'David Chen', value: 12000, status: 'Proposal Sent', industry: 'AI', owner: 'Alex Rivera', source: 'Website Direct', currency: 'USD', date: daysAgo(9), progress: 74 },
        { id: 'LD-9104', company: 'Summit Health', contact: 'Priya Raman', value: 98000, status: 'Won', industry: 'Healthcare', owner: 'Alice Smith', source: 'Inbound Marketing', currency: 'USD', date: daysAgo(1), progress: 100 },
        { id: 'LD-9133', company: 'BluePeak Capital', contact: 'Omar Diaz', value: 76000, status: 'Won', industry: 'Finance', owner: 'John Doe', source: 'Outbound Sales', currency: 'USD', date: daysAgo(6), progress: 100 }
    ];

    const DEFAULT_CLIENTS = [
        { name: 'Skyline Ventures', category: 'Commercial Real Estate', leads: 148, projects: 12 },
        { name: 'Ethereal Spaces', category: 'Interior Design', leads: 56, projects: 4 },
        { name: 'Terra Arch', category: 'Green Architecture', leads: 92, projects: 9 },
        { name: 'Luxe Habitation', category: 'Residential Design', leads: 31, projects: 2 },
        { name: 'Nexus Civil', category: 'Infrastructure', leads: 212, projects: 18 }
    ];

    const DEFAULT_LEAD_COMMENTS = {
        NexaLogistics: ['Requested a demo for next Thursday at 2PM.', 'Confirmation sent. Preparing slide deck.'],
        'Quantum Tech': ['Decision committee wants pricing options by Friday.', 'Negotiation call is booked for tomorrow morning.'],
        'Velocity AI': ['Technical validation complete.', 'Proposal shared with procurement team.']
    };

    const DEFAULT_LEAD_LOCATIONS = {
        NexaLogistics: { label: 'San Francisco, CA', lat: '37.7749', lng: '-122.4194' },
        'Quantum Tech': { label: 'Austin, TX', lat: '30.2672', lng: '-97.7431' },
        'Velocity AI': { label: 'Seattle, WA', lat: '47.6062', lng: '-122.3321' }
    };

    function qs(selector, scope = document) {
        return scope.querySelector(selector);
    }

    function qsa(selector, scope = document) {
        return Array.from(scope.querySelectorAll(selector));
    }

    function pageName() {
        const parts = window.location.pathname.split('/');
        return (parts[parts.length - 1] || 'dashboard.html').toLowerCase();
    }

    function toast(message, type = 'info') {
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
        }
    }

    function getStored(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        } catch (error) {
            return fallback;
        }
    }

    function setStored(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function getProfile() {
        return Object.assign({}, DEFAULT_PROFILE, getStored(STORAGE_KEYS.profile, {}));
    }

    function setProfile(profile) {
        setStored(STORAGE_KEYS.profile, profile);
    }

    function getCurrentLocation() {
        return Object.assign({}, DEFAULT_LOCATION, getStored(STORAGE_KEYS.location, {}));
    }

    function setCurrentLocation(location) {
        setStored(STORAGE_KEYS.location, location);
    }

    function getLeadOverrides() {
        return getStored(STORAGE_KEYS.leadOverrides, {});
    }

    function setLeadOverrides(overrides) {
        setStored(STORAGE_KEYS.leadOverrides, overrides);
    }

    function parseNumericValue(value) {
        if (typeof value === 'number') {
            return value;
        }
        const cleaned = String(value || '').replace(/[^0-9.-]/g, '');
        const parsed = Number(cleaned);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    function normalizeCurrency(value) {
        const text = String(value || DISPLAY_CURRENCY).toUpperCase();
        if (text.includes('INR')) {
            return 'INR';
        }
        return DISPLAY_CURRENCY;
    }

    function currencySymbol(code) {
        if (code === 'INR') {
            return 'Rs. ';
        }
        return '$';
    }

    function formatPercent(value, digits = 1) {
        return `${Number(value || 0).toFixed(digits)}%`;
    }

    function formatMoney(value, options = {}) {
        const amount = Number(value || 0);
        const currency = normalizeCurrency(options.currency || DISPLAY_CURRENCY);
        const compact = Boolean(options.compact);
        const symbol = currencySymbol(currency);
        if (compact) {
            if (amount >= 1000000) {
                return `${symbol}${(amount / 1000000).toFixed(1)}M`;
            }
            if (amount >= 1000) {
                return `${symbol}${(amount / 1000).toFixed(1)}k`;
            }
        }
        return `${symbol}${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    }

    function parseDateValue(value) {
        if (value instanceof Date) {
            return Number.isNaN(value.getTime()) ? new Date() : value;
        }
        const date = new Date(value || Date.now());
        return Number.isNaN(date.getTime()) ? new Date() : date;
    }

    function formatDisplayDate(value) {
        return parseDateValue(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function normalizeLead(lead, index = 0) {
        return {
            id: String(lead.id || `LD-AUTO-${index + 1}`),
            company: lead.company || 'New Lead',
            clientName: lead.clientName || lead.company || 'New Lead',
            contact: lead.contact || lead.clientName || 'Unknown',
            value: parseNumericValue(lead.value),
            status: lead.status || 'Discovery',
            industry: lead.industry || lead.lob || 'General',
            owner: lead.owner || 'You',
            source: lead.source || 'Website Direct',
            currency: DISPLAY_CURRENCY,
            date: parseDateValue(lead.date || Date.now()).toISOString(),
            progress: Number(lead.progress || 0),
            location: lead.location || getCurrentLocation(),
            phone: lead.phone || '',
            email: lead.email || '',
            website: lead.website || '',
            description: lead.description || '',
            nextAction: lead.nextAction || ''
        };
    }

    function normalizeClient(client, index = 0) {
        return {
            id: client.id || `client-${index + 1}`,
            name: client.name || `Client ${index + 1}`,
            category: client.category || 'General',
            leads: parseNumericValue(client.leads),
            projects: parseNumericValue(client.projects)
        };
    }

    function mergeLeadCollections(base, custom, overrides) {
        const map = new Map();
        [...base, ...custom].map(normalizeLead).forEach((lead) => {
            map.set(lead.id.toLowerCase(), lead);
        });

        Object.entries(overrides || {}).forEach(([id, patch]) => {
            const key = id.toLowerCase();
            const current = map.get(key) || normalizeLead({ id: patch.id || id });
            map.set(key, normalizeLead(Object.assign({}, current, patch)));
        });

        return Array.from(map.values()).filter((lead) => !lead.deleted);
    }

    function getAllLeads() {
        return mergeLeadCollections(
            DEFAULT_LEADS,
            getStored(STORAGE_KEYS.leads, []),
            getLeadOverrides()
        );
    }

    function getAllClients() {
        const map = new Map();
        [...DEFAULT_CLIENTS, ...getStored(STORAGE_KEYS.clients, [])].map(normalizeClient).forEach((client) => {
            map.set(client.name.toLowerCase(), client);
        });
        return Array.from(map.values());
    }

    function saveLeadPatch(id, patch) {
        const targetId = String(id || '').trim();
        if (!targetId) {
            return;
        }

        const stored = getStored(STORAGE_KEYS.leads, []);
        const storedIndex = stored.findIndex((lead) => String(lead.id || '').toLowerCase() === targetId.toLowerCase());
        if (storedIndex >= 0) {
            stored[storedIndex] = Object.assign({}, stored[storedIndex], patch);
            setStored(STORAGE_KEYS.leads, stored);
            return;
        }

        const overrides = getLeadOverrides();
        const key = targetId.toLowerCase();
        overrides[key] = Object.assign({}, overrides[key] || {}, patch, { id: targetId });
        setLeadOverrides(overrides);
    }

    function deleteLeadFromState(id) {
        const targetId = String(id || '').trim();
        if (!targetId) {
            return;
        }
        const stored = getStored(STORAGE_KEYS.leads, []);
        const nextStored = stored.filter((lead) => String(lead.id || '').toLowerCase() !== targetId.toLowerCase());
        if (nextStored.length !== stored.length) {
            setStored(STORAGE_KEYS.leads, nextStored);
            return;
        }
        saveLeadPatch(targetId, { deleted: true });
    }

    function normalizeStatus(status) {
        return String(status || '').trim().toLowerCase();
    }

    function isWonStatus(status) {
        return normalizeStatus(status) === 'won';
    }

    function isLostStatus(status) {
        const value = normalizeStatus(status);
        return value === 'lost' || value === 'at risk';
    }

    function isClosedStatus(status) {
        return isWonStatus(status) || isLostStatus(status);
    }

    function isActiveStatus(status) {
        return !isClosedStatus(status);
    }

    function stageRank(status) {
        const value = normalizeStatus(status);
        if (value.includes('won')) return 5;
        if (value.includes('negotiation')) return 4;
        if (value.includes('proposal')) return 3;
        if (value.includes('qualified')) return 2;
        if (value.includes('nurturing')) return 1;
        if (value.includes('discovery')) return 1;
        if (value.includes('lost') || value.includes('risk')) return 0;
        return 1;
    }

    function funnelBucket(status) {
        const value = normalizeStatus(status);
        if (value.includes('won')) return 'Won';
        if (value.includes('negotiation')) return 'Negotiation';
        if (value.includes('proposal')) return 'Proposal';
        return 'Discovery';
    }

    function isQualifiedOrBeyond(status) {
        return stageRank(status) >= 2;
    }

    function matchesDateRange(dateValue, range) {
        if (!range || !range.kind || range.kind === 'any') {
            return true;
        }
        const date = parseDateValue(dateValue);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (range.kind === 'last30') {
            const cutoff = new Date(today);
            cutoff.setDate(cutoff.getDate() - 30);
            return date >= cutoff;
        }
        if (range.kind === 'quarter') {
            const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
            const quarterStart = new Date(now.getFullYear(), quarterStartMonth, 1);
            return date >= quarterStart;
        }
        if (range.kind === 'year') {
            return date.getFullYear() === now.getFullYear();
        }
        if (range.kind === 'custom') {
            const from = range.from ? new Date(range.from) : null;
            const to = range.to ? new Date(range.to) : null;
            if (from && date < from) return false;
            if (to) {
                const end = new Date(to);
                end.setHours(23, 59, 59, 999);
                if (date > end) return false;
            }
        }
        return true;
    }

    function computeAnalytics(leads = getAllLeads(), clients = getAllClients()) {
        const totalLeads = leads.length;
        const activeLeads = leads.filter((lead) => isActiveStatus(lead.status));
        const wonLeads = leads.filter((lead) => isWonStatus(lead.status));
        const lostLeads = leads.filter((lead) => isLostStatus(lead.status));
        const pipelineValue = activeLeads.reduce((sum, lead) => sum + lead.value, 0);
        const wonRevenue = wonLeads.reduce((sum, lead) => sum + lead.value, 0);
        const avgDealSize = activeLeads.length ? pipelineValue / activeLeads.length : 0;
        const qualifiedLeads = leads.filter((lead) => isQualifiedOrBeyond(lead.status));
        const totalClosed = wonLeads.length + lostLeads.length;
        const winRate = totalClosed ? (wonLeads.length / totalClosed) * 100 : 0;
        const qualifiedRate = totalLeads ? (qualifiedLeads.length / totalLeads) * 100 : 0;
        const commonCurrency = DISPLAY_CURRENCY;
        const highPotential = activeLeads.filter((lead) => lead.value >= avgDealSize && stageRank(lead.status) >= 2);
        const hotLeads = activeLeads.filter((lead) => lead.value >= avgDealSize && stageRank(lead.status) >= 3);
        const now = Date.now();
        const avgResponseHours = activeLeads.length
            ? activeLeads.reduce((sum, lead) => sum + Math.min((now - parseDateValue(lead.date).getTime()) / 36e5, 72), 0) / activeLeads.length
            : 0;
        const closedWonThisWeek = wonLeads.filter((lead) => (now - parseDateValue(lead.date).getTime()) <= (7 * 24 * 36e5)).length;

        const sourceMap = new Map();
        leads.forEach((lead) => {
            sourceMap.set(lead.source, (sourceMap.get(lead.source) || 0) + 1);
        });
        const sourceDistribution = Array.from(sourceMap.entries())
            .map(([name, count], index) => ({
                name,
                count,
                percent: totalLeads ? (count / totalLeads) * 100 : 0,
                color: ['bg-primary', 'bg-secondary', 'bg-tertiary', 'bg-outline-variant'][index % 4]
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 4);

        const funnelOrder = ['Discovery', 'Proposal', 'Negotiation', 'Won'];
        const funnelCounts = {
            Discovery: leads.filter((lead) => funnelBucket(lead.status) === 'Discovery').length,
            Proposal: leads.filter((lead) => funnelBucket(lead.status) === 'Proposal').length,
            Negotiation: leads.filter((lead) => funnelBucket(lead.status) === 'Negotiation').length,
            Won: wonLeads.length
        };
        const funnelBase = Math.max(1, funnelCounts.Discovery);
        const funnel = funnelOrder.map((name) => ({
            name,
            count: funnelCounts[name],
            percent: (funnelCounts[name] / funnelBase) * 100
        }));

        const ownerMap = new Map();
        leads.forEach((lead) => {
            const owner = lead.owner || 'You';
            const current = ownerMap.get(owner) || { owner, leadsManaged: 0, closedWon: 0, totalClosed: 0, revenueContributed: 0 };
            current.leadsManaged += 1;
            if (isClosedStatus(lead.status)) {
                current.totalClosed += 1;
            }
            if (isWonStatus(lead.status)) {
                current.closedWon += 1;
                current.revenueContributed += lead.value;
            }
            ownerMap.set(owner, current);
        });
        const ownerRanking = Array.from(ownerMap.values())
            .map((entry) => Object.assign(entry, {
                winRate: entry.totalClosed ? (entry.closedWon / entry.totalClosed) * 100 : 0
            }))
            .sort((a, b) => b.revenueContributed - a.revenueContributed || b.leadsManaged - a.leadsManaged);

        const weekdayLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
        const weekBuckets = weekdayLabels.map((label, index) => ({ label, newOpps: 0, advancements: 0, won: 0, jsDay: index + 1 }));
        leads.forEach((lead) => {
            const date = parseDateValue(lead.date);
            const bucket = weekBuckets.find((item) => item.jsDay === date.getDay());
            if (!bucket) {
                return;
            }
            bucket.newOpps += 1;
            if (stageRank(lead.status) >= 2) {
                bucket.advancements += 1;
            }
            if (isWonStatus(lead.status)) {
                bucket.won += 1;
            }
        });
        const weeklyNewDeals = weekBuckets.reduce((sum, bucket) => sum + bucket.newOpps, 0);
        const weeklyStageUpgrades = weekBuckets.reduce((sum, bucket) => sum + bucket.advancements, 0);
        const weeklyWonRevenue = wonLeads
            .filter((lead) => (now - parseDateValue(lead.date).getTime()) <= (7 * 24 * 36e5))
            .reduce((sum, lead) => sum + lead.value, 0);

        const totalClients = clients.length;
        const activeProjects = clients.reduce((sum, client) => sum + client.projects, 0);
        const avgLeadFlow = totalClients
            ? clients.reduce((sum, client) => sum + (client.leads ? (client.projects / client.leads) * 100 : 0), 0) / totalClients
            : 0;

        return {
            leads,
            clients,
            totalLeads,
            activeLeads,
            wonLeads,
            lostLeads,
            totalClients,
            activeProjects,
            pipelineValue,
            wonRevenue,
            avgDealSize,
            winRate,
            qualifiedRate,
            highPotential,
            hotLeads,
            avgResponseHours,
            closedWonThisWeek,
            pendingReview: activeLeads.length,
            commonCurrency,
            sourceDistribution,
            funnel,
            ownerRanking,
            weekBuckets,
            avgLeadFlow,
            weeklyNewDeals,
            weeklyStageUpgrades,
            weeklyWonRevenue
        };
    }

    function findLeadById(id) {
        return getAllLeads().find((lead) => lead.id.toLowerCase() === String(id || '').toLowerCase());
    }

    function getLeadComments(lead) {
        return DEFAULT_LEAD_COMMENTS[lead.company] || ['No comments yet for this lead.'];
    }

    function getLeadLocation(lead) {
        return lead.location || DEFAULT_LEAD_LOCATIONS[lead.company] || getCurrentLocation();
    }

    function getLeadsForClient(clientName, category = '') {
        const normalizedClient = String(clientName || '').trim().toLowerCase();
        const categoryWords = String(category || '').toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 3);

        return getAllLeads().filter((lead) => {
            const directClientMatch = String(lead.clientName || '').trim().toLowerCase() === normalizedClient;
            const companyMatch = lead.company.toLowerCase() === normalizedClient;
            const categoryMatch = categoryWords.some((word) =>
                lead.industry.toLowerCase().includes(word) || lead.company.toLowerCase().includes(word)
            );
            return directClientMatch || companyMatch || categoryMatch;
        });
    }

    function ensureClientProfileForLead(lead) {
        const clientName = String(lead.clientName || lead.company || '').trim();
        if (!clientName) {
            return;
        }

        const storedClients = getStored(STORAGE_KEYS.clients, []);
        const existingClients = getAllClients();
        const alreadyExists = existingClients.some((client) => client.name.toLowerCase() === clientName.toLowerCase());
        if (alreadyExists) {
            return;
        }

        storedClients.unshift({
            name: clientName,
            category: lead.industry || lead.lob || 'General',
            leads: 1,
            projects: 1
        });
        setStored(STORAGE_KEYS.clients, storedClients);
    }

    function openLeadDetailModal(lead) {
        const location = getLeadLocation(lead);
        const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(`${location.lat},${location.lng}`)}&z=14&output=embed`;
        const comments = getLeadComments(lead);
        openModal(
            `${lead.company} Lead`,
            `<div class="space-y-4">
                <div class="grid grid-cols-2 gap-3">
                    <div class="rounded-xl bg-slate-50 p-3"><p class="text-[11px] uppercase text-slate-500 font-bold">Lead ID</p><p class="mt-1 font-semibold text-slate-900">${escapeHtml(lead.id)}</p></div>
                    <div class="rounded-xl bg-slate-50 p-3"><p class="text-[11px] uppercase text-slate-500 font-bold">Status</p><p class="mt-1 font-semibold text-slate-900">${escapeHtml(lead.status)}</p></div>
                    <div class="rounded-xl bg-slate-50 p-3"><p class="text-[11px] uppercase text-slate-500 font-bold">Value</p><p class="mt-1 font-semibold text-slate-900">${escapeHtml(formatMoney(lead.value, { currency: lead.currency }))}</p></div>
                    <div class="rounded-xl bg-slate-50 p-3"><p class="text-[11px] uppercase text-slate-500 font-bold">Publisher</p><p class="mt-1 font-semibold text-slate-900">${escapeHtml(lead.source)}</p></div>
                    <div class="rounded-xl bg-slate-50 p-3"><p class="text-[11px] uppercase text-slate-500 font-bold">Owner</p><p class="mt-1 font-semibold text-slate-900">${escapeHtml(lead.owner)}</p></div>
                    <div class="rounded-xl bg-slate-50 p-3"><p class="text-[11px] uppercase text-slate-500 font-bold">Created</p><p class="mt-1 font-semibold text-slate-900">${escapeHtml(formatDisplayDate(lead.date))}</p></div>
                </div>
                <div class="rounded-xl bg-slate-50 p-4">
                    <p class="text-[11px] uppercase text-slate-500 font-bold mb-2">Contact</p>
                    <p class="font-semibold text-slate-900">${escapeHtml(lead.contact)}</p>
                    <p class="text-sm text-slate-600 mt-1">${escapeHtml(lead.phone || 'No phone saved')}</p>
                    <p class="text-sm text-slate-600">${escapeHtml(lead.email || 'No email saved')}</p>
                </div>
                <div class="rounded-xl bg-slate-50 p-4">
                    <p class="text-[11px] uppercase text-slate-500 font-bold mb-2">Description</p>
                    <p class="text-sm text-slate-700">${escapeHtml(lead.description || 'No description added yet.')}</p>
                </div>
                <div class="rounded-xl bg-slate-50 p-4">
                    <p class="text-[11px] uppercase text-slate-500 font-bold mb-2">Comments</p>
                    <div class="space-y-2">
                        ${comments.map((comment, index) => `<div class="rounded-lg ${index % 2 === 0 ? 'bg-white' : 'bg-blue-50'} p-3"><p class="text-xs font-bold ${index % 2 === 0 ? 'text-slate-600' : 'text-blue-700'} mb-1">${index % 2 === 0 ? escapeHtml(lead.owner) : 'You'}</p><p class="text-sm text-slate-700">${escapeHtml(comment)}</p></div>`).join('')}
                    </div>
                </div>
                <div class="rounded-xl overflow-hidden border border-slate-200">
                    <iframe src="${mapsUrl}" class="w-full h-[220px]" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                </div>
                <div class="rounded-xl bg-slate-50 p-4">
                    <p class="text-[11px] uppercase text-slate-500 font-bold mb-1">Location</p>
                    <p class="font-semibold text-slate-900">${escapeHtml(location.label)}</p>
                </div>
            </div>`
        );
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function setNodeText(node, value) {
        if (node) {
            node.textContent = value;
        }
    }

    function applyLeadToManageRow(row, lead) {
        const cells = qsa('td', row);
        if (cells.length < 9 || !lead) {
            return;
        }
        setNodeText(cells[1], lead.id);
        setNodeText(qs('.text-sm.font-semibold', cells[2]), lead.company);
        setNodeText(qs('.text-sm', cells[3]), lead.contact);
        setNodeText(qs('.text-sm.font-bold', cells[4]), formatMoney(lead.value, { currency: lead.currency }));
        const statusNode = qs('span', cells[5]);
        setNodeText(statusNode, lead.status);
        setNodeText(qs('.text-sm.text-slate-600', cells[7]), lead.owner);
        setNodeText(cells[8], formatDisplayDate(lead.date));
        row.dataset.leadId = lead.id;
        row.dataset.leadDateIso = parseDateValue(lead.date).toISOString();
        row.dataset.leadValue = String(lead.value);
        row.dataset.leadStatus = lead.status;
        row.dataset.leadOwner = lead.owner;
        row.dataset.leadCompany = lead.company;
    }

    function applyLeadToReviewRow(row, lead) {
        const cells = qsa('td', row);
        if (cells.length < 8 || !lead) {
            return;
        }
        setNodeText(cells[0], `#${lead.id}`);
        setNodeText(qs('.text-sm.font-semibold', cells[1]), lead.company);
        setNodeText(qs('.text-sm.font-medium', cells[2]), lead.contact);
        setNodeText(qs('.text-xs', cells[2]), lead.industry);
        setNodeText(cells[3], formatMoney(lead.value, { currency: lead.currency }));
        setNodeText(qs('span', cells[4]), lead.status);
        setNodeText(qs('.text-sm.text-on-surface', cells[5]), lead.owner);
        setNodeText(cells[6], formatDisplayDate(lead.date));
        row.dataset.leadId = lead.id;
        row.dataset.leadDateIso = parseDateValue(lead.date).toISOString();
        row.dataset.leadLocation = JSON.stringify(lead.location || getCurrentLocation());
    }

    function syncSeedLeadRows(pageType) {
        const leadsById = new Map(getAllLeads().map((lead) => [lead.id.toLowerCase(), lead]));
        qsa('tbody tr').forEach((row) => {
            const cells = qsa('td', row);
            if (!cells.length) {
                return;
            }
            const rawId = pageType === 'review'
                ? cells[0]?.textContent.replace('#', '').trim()
                : cells[1]?.textContent.trim();
            const lead = leadsById.get(String(rawId || '').toLowerCase());
            if (!lead) {
                return;
            }
            if (pageType === 'review') {
                applyLeadToReviewRow(row, lead);
            } else {
                applyLeadToManageRow(row, lead);
            }
        });
    }

    function downloadFile(filename, content, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    }

    function downloadExcelTable(filename, headers, rows, sheetTitle = 'Sheet1') {
        const tableHead = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('');
        const tableRows = rows.map((row) => {
            const cells = row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('');
            return `<tr>${cells}</tr>`;
        }).join('');

        const workbook = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office"
                  xmlns:x="urn:schemas-microsoft-com:office:excel"
                  xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta charset="utf-8">
                <xml>
                    <x:ExcelWorkbook>
                        <x:ExcelWorksheets>
                            <x:ExcelWorksheet>
                                <x:Name>${escapeHtml(sheetTitle)}</x:Name>
                                <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
                            </x:ExcelWorksheet>
                        </x:ExcelWorksheets>
                    </x:ExcelWorkbook>
                </xml>
                <style>
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
                    th { background: #e2e8f0; font-weight: 700; }
                </style>
            </head>
            <body>
                <table>
                    <thead><tr>${tableHead}</tr></thead>
                    <tbody>${tableRows}</tbody>
                </table>
            </body>
            </html>
        `;

        downloadFile(filename, workbook, 'application/vnd.ms-excel;charset=utf-8');
    }

    function copyText(value) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(value);
        }

        const helper = document.createElement('textarea');
        helper.value = value;
        helper.style.position = 'fixed';
        helper.style.opacity = '0';
        document.body.appendChild(helper);
        helper.select();
        document.execCommand('copy');
        helper.remove();
        return Promise.resolve();
    }

    function captureBrowserLocation(onComplete, options = {}) {
        if (!navigator.geolocation) {
            onComplete(getCurrentLocation());
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = {
                    label: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
                    lat: position.coords.latitude.toFixed(6),
                    lng: position.coords.longitude.toFixed(6)
                };
                setCurrentLocation(location);
                onComplete(location);
            },
            () => {
                onComplete(getCurrentLocation());
            },
            {
                enableHighAccuracy: Boolean(options.highAccuracy),
                timeout: options.timeout || 7000,
                maximumAge: options.useCache === false ? 0 : 300000
            }
        );
    }

    function openModal(title, bodyHtml, actions = []) {
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 z-[10000] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4';
        overlay.innerHTML = `
            <div class="w-full max-w-lg max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h3 class="text-lg font-bold text-slate-900">${escapeHtml(title)}</h3>
                    <button type="button" class="modal-close p-2 rounded-lg hover:bg-slate-100 transition-colors">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div class="px-6 py-5 text-sm text-slate-600 space-y-4 overflow-y-auto">${bodyHtml}</div>
                <div class="modal-actions px-6 py-4 bg-slate-50 flex justify-end gap-3"></div>
            </div>
        `;

        const actionsHost = qs('.modal-actions', overlay);
        const close = () => overlay.remove();

        actions.forEach((action) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = action.className || 'px-4 py-2 rounded-lg bg-primary text-white font-semibold';
            button.textContent = action.label;
            button.addEventListener('click', () => {
                if (action.onClick) {
                    action.onClick(close);
                } else {
                    close();
                }
            });
            actionsHost.appendChild(button);
        });

        if (!actions.length) {
            const okButton = document.createElement('button');
            okButton.type = 'button';
            okButton.className = 'px-4 py-2 rounded-lg bg-primary text-white font-semibold';
            okButton.textContent = 'Close';
            okButton.addEventListener('click', close);
            actionsHost.appendChild(okButton);
        }

        overlay.addEventListener('click', (event) => {
            if (event.target === overlay || event.target.closest('.modal-close')) {
                close();
            }
        });

        document.body.appendChild(overlay);
        return close;
    }

    function openAnchoredDropdown(trigger, bodyHtml) {
        qsa('[data-shared-dropdown="true"]').forEach((node) => node.remove());

        const rect = trigger.getBoundingClientRect();
        const dropdown = document.createElement('div');
        dropdown.setAttribute('data-shared-dropdown', 'true');
        dropdown.className = 'fixed z-[10000] w-[328px] max-w-[calc(100vw-1.5rem)] rounded-[24px] border border-slate-200 bg-[#f7f9fc] shadow-[0_20px_60px_rgba(15,23,42,0.18)] overflow-hidden';
        dropdown.style.top = `${Math.min(window.innerHeight - 24, rect.bottom + 12)}px`;
        dropdown.style.left = `${Math.max(12, Math.min(window.innerWidth - 340, rect.right - 328))}px`;
        dropdown.innerHTML = bodyHtml;

        const close = () => {
            dropdown.remove();
            document.removeEventListener('mousedown', handleOutsideClick, true);
            window.removeEventListener('resize', close);
            window.removeEventListener('scroll', close, true);
        };

        function handleOutsideClick(event) {
            if (dropdown.contains(event.target) || trigger.contains(event.target)) {
                return;
            }
            close();
        }

        document.addEventListener('mousedown', handleOutsideClick, true);
        window.addEventListener('resize', close);
        window.addEventListener('scroll', close, true);
        document.body.appendChild(dropdown);
        return { dropdown, close };
    }

    function openConfirmModal(options) {
        const {
            title,
            message,
            confirmLabel = 'Confirm',
            cancelLabel = 'Cancel',
            confirmClassName = 'px-4 py-2 rounded-lg bg-primary text-white font-semibold',
            onConfirm
        } = options;

        return openModal(
            title,
            `<p class="leading-relaxed">${escapeHtml(message)}</p>`,
            [
                {
                    label: cancelLabel,
                    className: 'px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold bg-white'
                },
                {
                    label: confirmLabel,
                    className: confirmClassName,
                    onClick: (close) => {
                        if (onConfirm) {
                            onConfirm();
                        }
                        close();
                    }
                }
            ]
        );
    }

    function openFormModal(options) {
        const {
            title,
            description = '',
            fields = [],
            submitLabel = 'Save',
            cancelLabel = 'Cancel',
            onSubmit
        } = options;

        const formId = `modal-form-${Date.now()}`;
        const fieldsMarkup = fields.map((field, index) => {
            if (field.type === 'select') {
                const optionsMarkup = (field.options || []).map((option) => {
                    const optionValue = typeof option === 'string' ? option : option.value;
                    const optionLabel = typeof option === 'string' ? option : option.label;
                    const selected = optionValue === (field.value || '') ? 'selected' : '';
                    return `<option value="${escapeHtml(optionValue)}" ${selected}>${escapeHtml(optionLabel)}</option>`;
                }).join('');

                return `
                    <label class="block space-y-2">
                        <span class="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">${escapeHtml(field.label)}</span>
                        <select id="${formId}-${index}" data-field-name="${escapeHtml(field.name)}" class="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary/20 outline-none">
                            ${optionsMarkup}
                        </select>
                    </label>
                `;
            }

            if (field.type === 'textarea') {
                return `
                    <label class="block space-y-2">
                        <span class="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">${escapeHtml(field.label)}</span>
                        <textarea id="${formId}-${index}" data-field-name="${escapeHtml(field.name)}" class="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 min-h-[120px] text-sm text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary/20 outline-none" placeholder="${escapeHtml(field.placeholder || '')}">${escapeHtml(field.value || '')}</textarea>
                    </label>
                `;
            }

            return `
                <label class="block space-y-2">
                    <span class="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">${escapeHtml(field.label)}</span>
                    <input id="${formId}-${index}" data-field-name="${escapeHtml(field.name)}" type="${escapeHtml(field.type || 'text')}" value="${escapeHtml(field.value || '')}" placeholder="${escapeHtml(field.placeholder || '')}" class="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary/20 outline-none" />
                </label>
            `;
        }).join('');

        const close = openModal(
            title,
            `
                ${description ? `<p class="text-sm text-slate-500 leading-relaxed">${escapeHtml(description)}</p>` : ''}
                <form id="${formId}" class="space-y-4">${fieldsMarkup}</form>
            `,
            [
                {
                    label: cancelLabel,
                    className: 'px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold bg-white'
                },
                {
                    label: submitLabel,
                    className: 'px-4 py-2 rounded-lg bg-primary text-white font-semibold',
                    onClick: () => {
                        const form = document.getElementById(formId);
                        if (!form) {
                            return;
                        }
                        const values = {};
                        let missingField = null;

                        qsa('[data-field-name]', form).forEach((input) => {
                            const name = input.getAttribute('data-field-name');
                            const value = input.value.trim();
                            values[name] = value;
                            const config = fields.find((field) => field.name === name);
                            if (!missingField && config?.required && !value) {
                                missingField = { input, label: config.label };
                            }
                        });

                        if (missingField) {
                            missingField.input.focus();
                            toast(`${missingField.label} is required.`, 'warning');
                            return;
                        }

                        if (onSubmit) {
                            const shouldClose = onSubmit(values);
                            if (shouldClose === false) {
                                return;
                            }
                        }

                        close();
                    }
                }
            ]
        );

        setTimeout(() => {
            const firstField = document.getElementById(`${formId}-0`);
            firstField?.focus();
        }, 0);

        return close;
    }

    function initCommon() {
        const profile = getProfile();
        const analytics = computeAnalytics();
        const notifications = [
            {
                title: 'Lead pipeline refreshed',
                body: `${analytics.totalLeads} total leads are now active across the workspace.`
            },
            {
                title: 'Client directory synced',
                body: `${getAllClients().length} client profiles are currently available in the frontend.`
            },
            {
                title: 'Profile workspace ready',
                body: 'Your shared profile details are active across the header and profile page.'
            }
        ];

        qsa('button').forEach((button) => {
            if (!button.type) {
                button.type = 'button';
            }
        });

        qsa('a[href="#"]').forEach((link) => {
            if (link.closest('#loginForm') || link.closest('nav')) {
                return;
            }
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const label = link.innerText.trim() || 'This section';
                toast(`${label} is a placeholder for now.`, 'warning');
            });
        });

        const workspaceSearchInput = qs('input[placeholder="Search leads, tasks, or reports..."]');
        if (workspaceSearchInput && !workspaceSearchInput.dataset.globalSearchBound) {
            workspaceSearchInput.dataset.globalSearchBound = 'true';
            let searchDropdownHandle = null;

            const buildSearchEntries = () => {
                const liveAnalytics = computeAnalytics();
                const leadEntries = getAllLeads().slice(0, 24).map((lead) => ({
                    title: lead.company,
                    subtitle: `Lead • ${lead.status} • ${lead.owner}`,
                    href: 'review_leads.html',
                    keywords: [lead.company, lead.contact, lead.clientName, lead.status, lead.owner, lead.industry, lead.id].join(' ').toLowerCase()
                }));
                const clientEntries = getAllClients().slice(0, 24).map((client) => ({
                    title: client.name,
                    subtitle: `Client • ${client.category}`,
                    href: 'clients.html',
                    keywords: [client.name, client.category, 'clients client profile'].join(' ').toLowerCase()
                }));

                return [
                    { title: 'Intelligence Dashboard', subtitle: 'Dashboard overview and live KPIs', href: 'dashboard.html', keywords: 'dashboard intelligence overview kpi pipeline win rate weekly activity reports' },
                    { title: 'Add New Lead', subtitle: 'Create and stage a new opportunity', href: 'add_lead.html', keywords: 'add new lead create opportunity intake form client' },
                    { title: 'Review Leads', subtitle: 'Comments, timeline, owner changes, and location', href: 'review_leads.html', keywords: 'review leads comments timeline owner change location queue' },
                    { title: 'Manage Leads', subtitle: 'Search, pipeline actions, exports, and status updates', href: 'manage_leads.html', keywords: 'manage leads status export pipeline bulk actions industry' },
                    { title: 'Clients', subtitle: 'Client profiles and related lead details', href: 'clients.html', keywords: 'clients client profiles related leads' },
                    { title: 'Reports', subtitle: 'Funnel metrics, exports, and team performance', href: 'reports.html', keywords: 'reports funnel team performance export conversion revenue' },
                    { title: 'Settings', subtitle: 'User controls, stages, and notification setup', href: 'settings.html', keywords: 'settings users stages notifications preferences' },
                    { title: 'Profile', subtitle: `${profile.name} • ${profile.role}`, href: 'profile.html', keywords: [profile.name, profile.email, profile.role, profile.focus, 'profile account bio'].join(' ').toLowerCase() },
                    { title: 'Total Pipeline', subtitle: `${formatMoney(liveAnalytics.pipelineValue, { currency: liveAnalytics.commonCurrency, compact: true })} currently in play`, href: 'dashboard.html', keywords: 'total pipeline value revenue dashboard kpi' },
                    { title: 'Win Rate', subtitle: `${formatPercent(liveAnalytics.winRate, 0)} current close rate`, href: 'dashboard.html', keywords: 'win rate target dashboard close rate' },
                    { title: 'Team Performance Ranking', subtitle: 'Reports ranking and team contribution table', href: 'reports.html', keywords: 'team performance ranking leaderboard reports owners revenue' },
                    ...leadEntries,
                    ...clientEntries
                ];
            };

            const getSearchMatches = (query) => {
                const normalizedQuery = String(query || '').trim().toLowerCase();
                const entries = buildSearchEntries();
                if (!normalizedQuery) {
                    return entries.slice(0, 8);
                }
                const startsWith = entries.filter((entry) => entry.title.toLowerCase().startsWith(normalizedQuery) || entry.keywords.startsWith(normalizedQuery));
                const includes = entries.filter((entry) => !startsWith.includes(entry) && (entry.title.toLowerCase().includes(normalizedQuery) || entry.subtitle.toLowerCase().includes(normalizedQuery) || entry.keywords.includes(normalizedQuery)));
                return [...startsWith, ...includes].slice(0, 8);
            };

            const closeSearchDropdown = () => {
                if (searchDropdownHandle) {
                    searchDropdownHandle.close();
                    searchDropdownHandle = null;
                }
            };

            const navigateToSearchEntry = (entry) => {
                if (!entry) {
                    return;
                }
                closeSearchDropdown();
                window.location.href = entry.href;
            };

            const renderSearchDropdown = (query) => {
                const matches = getSearchMatches(query);
                if (!matches.length) {
                    closeSearchDropdown();
                    return;
                }
                const trigger = workspaceSearchInput.parentElement || workspaceSearchInput;
                searchDropdownHandle = openAnchoredDropdown(
                    trigger,
                    `<div class="py-2">
                        <div class="px-4 pb-2">
                            <p class="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-bold">Search Results</p>
                        </div>
                        <div class="space-y-1">
                            ${matches.map((entry) => `
                                <button type="button" class="workspace-search-result w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors">
                                    <p class="font-semibold text-slate-900">${escapeHtml(entry.title)}</p>
                                    <p class="text-xs text-slate-500 mt-1">${escapeHtml(entry.subtitle)}</p>
                                </button>
                            `).join('')}
                        </div>
                    </div>`
                );

                qsa('.workspace-search-result', searchDropdownHandle.dropdown).forEach((button, index) => {
                    const entry = matches[index];
                    button.addEventListener('click', () => navigateToSearchEntry(entry));
                });
            };

            workspaceSearchInput.addEventListener('focus', () => renderSearchDropdown(workspaceSearchInput.value));
            workspaceSearchInput.addEventListener('input', () => renderSearchDropdown(workspaceSearchInput.value));
            workspaceSearchInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    navigateToSearchEntry(getSearchMatches(workspaceSearchInput.value)[0]);
                } else if (event.key === 'Escape') {
                    closeSearchDropdown();
                }
            });
            document.addEventListener('click', (event) => {
                if (workspaceSearchInput.contains(event.target) || workspaceSearchInput.parentElement?.contains(event.target)) {
                    return;
                }
                closeSearchDropdown();
            });
        }

        qsa('button').forEach((button) => {
            const icon = button.querySelector('.material-symbols-outlined')?.textContent.trim();
            if (icon === 'notifications' && !button.dataset.boundAction) {
                button.dataset.boundAction = 'true';
                button.addEventListener('click', () => {
                    openModal(
                        'Recent Updates',
                        `<div class="space-y-3">
                            ${notifications.map((item, index) => `
                                <div class="p-4 rounded-xl ${index === 0 ? 'bg-blue-50 border border-blue-100' : 'bg-slate-50'}">
                                    <p class="font-semibold text-slate-900">${escapeHtml(item.title)}</p>
                                    <p class="text-xs text-slate-500 mt-1">${escapeHtml(item.body)}</p>
                                </div>
                            `).join('')}
                        </div>`
                    );
                });
            }

            if (icon === 'help' && !button.dataset.boundAction) {
                button.dataset.boundAction = 'true';
                button.addEventListener('click', () => {
                    openModal(
                        'Help Center',
                        '<ul class="space-y-2 text-sm"><li>Use Add Lead to stage a new opportunity.</li><li>Manage Leads handles search, bulk actions, and exports.</li><li>Review Leads is where owner changes and comments happen.</li></ul>'
                    );
                });
            }
        });

        qsa('a[href="profile.html"]').forEach((link) => {
            const label = link.querySelector('span:last-child');
            if (label) {
                label.textContent = 'Profile';
            }
        });

        qsa('a[href="Login.html"]').forEach((link) => {
            if (link.dataset.boundLogoutConfirm) {
                return;
            }
            link.dataset.boundLogoutConfirm = 'true';
            link.addEventListener('click', (event) => {
                event.preventDefault();
                openConfirmModal({
                    title: 'Confirm Logout',
                    message: 'Are you sure you want to Logout ?',
                    confirmLabel: 'Logout',
                    confirmClassName: 'px-4 py-2 rounded-lg bg-red-600 text-white font-semibold',
                    onConfirm: () => {
                        window.location.href = 'Login.html';
                    }
                });
            });
        });

        qsa('header img[alt*="profile"], header img[alt*="avatar"], header .rounded-full img').forEach((image) => {
            image.src = profile.avatar;
            image.setAttribute('data-avatar-shared', 'true');
            const trigger = image.parentElement;
            if (!trigger || trigger.dataset.boundProfileMenu) {
                return;
            }
            trigger.dataset.boundProfileMenu = 'true';
            trigger.style.cursor = 'pointer';
            trigger.addEventListener('click', () => {
                const existingDropdown = qs('[data-shared-dropdown="true"]');
                if (existingDropdown) {
                    existingDropdown.remove();
                }
                const initials = (profile.initials || profile.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()).slice(0, 2);
                const { dropdown, close } = openAnchoredDropdown(
                    trigger,
                    `<div class="p-3.5">
                        <div class="flex justify-end mb-1">
                            <button type="button" class="profile-dropdown-close p-2 rounded-full hover:bg-slate-200/70 transition-colors">
                                <span class="material-symbols-outlined text-slate-600">close</span>
                            </button>
                        </div>
                        <div class="space-y-5">
                        <div class="text-center">
                            <p class="text-base font-semibold text-slate-900 break-all">${escapeHtml(profile.email)}</p>
                        </div>
                        <div class="bg-slate-50 rounded-[22px] px-5 py-5 text-center border border-slate-200/70">
                            <div class="relative w-fit mx-auto">
                                <div class="w-20 h-20 rounded-full bg-blue-700 text-white flex items-center justify-center text-4xl font-medium overflow-hidden">
                                    <img src="${escapeHtml(profile.avatar)}" alt="${escapeHtml(profile.name)}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.parentElement.querySelector('span').style.display='flex';" />
                                    <span style="display:none;" class="absolute inset-0 items-center justify-center">${escapeHtml(initials)}</span>
                                </div>
                            </div>
                            <p class="mt-4 text-[1.7rem] leading-none font-medium text-slate-900">Hi, ${escapeHtml(profile.name.split(' ')[0] || profile.name)}!</p>
                            <button type="button" class="mt-5 inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-slate-400 text-primary text-base font-semibold hover:bg-white transition-colors" data-profile-menu-action="open-profile">View Profile</button>
                        </div>
                        <div class="space-y-2.5">
                            <button type="button" class="w-full flex items-center gap-3 px-4 py-3.5 rounded-[18px] bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-left" data-profile-menu-action="open-profile-secondary">
                                <span class="material-symbols-outlined text-slate-600">account_circle</span>
                                <span class="text-slate-900 font-semibold">View Profile</span>
                            </button>
                            <button type="button" class="w-full flex items-center gap-3 px-4 py-3.5 rounded-[18px] bg-white border border-slate-200 hover:bg-red-50 transition-colors text-left" data-profile-menu-action="logout">
                                <span class="material-symbols-outlined text-slate-600">logout</span>
                                <span class="text-slate-900 font-semibold">Logout</span>
                            </button>
                        </div>
                        </div>
                    </div>`
                );

                const openProfileAction = qs('[data-profile-menu-action="open-profile"]', dropdown);
                const openProfileSecondaryAction = qs('[data-profile-menu-action="open-profile-secondary"]', dropdown);
                const logoutAction = qs('[data-profile-menu-action="logout"]', dropdown);
                const closeButton = qs('.profile-dropdown-close', dropdown);

                if (openProfileAction) {
                    openProfileAction.addEventListener('click', () => {
                        close();
                        window.location.href = 'profile.html';
                    });
                }

                if (openProfileSecondaryAction) {
                    openProfileSecondaryAction.addEventListener('click', () => {
                        close();
                        window.location.href = 'profile.html';
                    });
                }

                if (closeButton) {
                    closeButton.addEventListener('click', close);
                }

                if (logoutAction) {
                    logoutAction.addEventListener('click', () => {
                        close();
                        openConfirmModal({
                            title: 'Confirm Logout',
                            message: 'Are you sure you want to Logout ?',
                            confirmLabel: 'Logout',
                            confirmClassName: 'px-4 py-2 rounded-lg bg-red-600 text-white font-semibold',
                            onConfirm: () => {
                                window.location.href = 'Login.html';
                            }
                        });
                    });
                }
            });
        });
    }

    function wireTableSearchAndPagination(config) {
        const { searchInput, rows, predicate, summaryLabel, prevButton, nextButton, numberButtons, pageSize = 3, onRender } = config;
        let currentPage = 1;

        function filteredRows() {
            const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
            return rows.filter((row) => predicate(row, query));
        }

        function render() {
            const visibleRows = filteredRows();
            const totalPages = Math.max(1, Math.ceil(visibleRows.length / pageSize));
            currentPage = Math.min(currentPage, totalPages);

            rows.forEach((row) => {
                row.style.display = 'none';
            });

            const start = (currentPage - 1) * pageSize;
            const pagedRows = visibleRows.slice(start, start + pageSize);
            pagedRows.forEach((row) => {
                row.style.display = '';
            });

            if (summaryLabel) {
                if (!visibleRows.length) {
                    summaryLabel.textContent = 'No matching results';
                } else {
                    const from = start + 1;
                    const to = start + pagedRows.length;
                    summaryLabel.textContent = `Showing ${from}-${to} of ${visibleRows.length} results`;
                }
            }

            if (prevButton) {
                prevButton.disabled = currentPage === 1;
                prevButton.classList.toggle('opacity-50', currentPage === 1);
            }

            if (nextButton) {
                nextButton.disabled = currentPage === totalPages;
                nextButton.classList.toggle('opacity-50', currentPage === totalPages);
            }

            numberButtons.forEach((button, index) => {
                const page = index + 1;
                if (page <= totalPages) {
                    button.style.display = '';
                    button.textContent = String(page);
                    button.classList.toggle('bg-primary', page === currentPage);
                    button.classList.toggle('text-white', page === currentPage);
                } else {
                    button.style.display = 'none';
                }
            });

            if (onRender) {
                onRender(visibleRows, pagedRows);
            }
        }

        if (searchInput) {
            searchInput.addEventListener('input', () => {
                currentPage = 1;
                render();
            });
        }

        if (prevButton) {
            prevButton.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage -= 1;
                    render();
                }
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                currentPage += 1;
                render();
            });
        }

        numberButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                currentPage = index + 1;
                render();
            });
        });

        render();
        return { render };
    }

    function addStoredLeadToManageTable() {
        if (pageName() !== 'manage_leads.html') {
            return;
        }

        const leads = getStored(STORAGE_KEYS.leads, []);
        if (!leads.length) {
            return;
        }

        const tbody = qs('table tbody');
        if (!tbody) {
            return;
        }

        leads.forEach((lead, index) => {
            const normalizedLead = normalizeLead(lead, index);
            const row = document.createElement('tr');
            row.className = 'hover:bg-slate-50/50 transition-colors';
            row.innerHTML = `
                <td class="px-6 py-4">
                    <input class="rounded text-primary focus:ring-primary/20 border-slate-300" type="checkbox"/>
                </td>
                <td class="px-4 py-4 text-sm font-mono text-slate-500">${escapeHtml(normalizedLead.id)}</td>
                <td class="px-4 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">${escapeHtml((normalizedLead.company || 'N').slice(0, 1).toUpperCase())}</div>
                        <span class="text-sm font-semibold text-slate-900">${escapeHtml(normalizedLead.company)}</span>
                    </div>
                </td>
                <td class="px-4 py-4">
                    <span class="text-sm text-slate-600">${escapeHtml(normalizedLead.contact)}</span>
                </td>
                <td class="px-4 py-4">
                    <span class="text-sm font-bold text-slate-900">${escapeHtml(formatMoney(normalizedLead.value, { currency: normalizedLead.currency }))}</span>
                </td>
                <td class="px-4 py-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700">${escapeHtml(normalizedLead.status)}</span>
                </td>
                <td class="px-4 py-4">
                    <div class="flex flex-wrap gap-1">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">${escapeHtml(normalizedLead.industry)}</span>
                    </div>
                </td>
                <td class="px-4 py-4">
                    <div class="flex items-center gap-2">
                        <div class="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">Y</div>
                        <span class="text-sm text-slate-600">${escapeHtml(normalizedLead.owner)}</span>
                    </div>
                </td>
                <td class="px-4 py-4 text-sm text-slate-500">${escapeHtml(formatDisplayDate(normalizedLead.date))}</td>
                <td class="px-4 py-4 text-right">
                    <button class="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded transition-colors" data-row-action="details">
                        <span class="material-symbols-outlined">more_vert</span>
                    </button>
                </td>
            `;
            row.dataset.leadId = normalizedLead.id;
            row.dataset.leadDateIso = parseDateValue(normalizedLead.date).toISOString();
            row.dataset.leadValue = String(normalizedLead.value);
            row.dataset.leadStatus = normalizedLead.status;
            row.dataset.leadOwner = normalizedLead.owner;
            row.dataset.leadCompany = normalizedLead.company;
            row.dataset.leadLocation = JSON.stringify(normalizedLead.location || getCurrentLocation());
            tbody.prepend(row);
        });
    }

    function addStoredLeadToReviewTable() {
        if (pageName() !== 'review_leads.html') {
            return;
        }

        const leads = getStored(STORAGE_KEYS.leads, []);
        if (!leads.length) {
            return;
        }

        const tbody = qs('table tbody');
        if (!tbody) {
            return;
        }

        leads.forEach((lead, index) => {
            const normalizedLead = normalizeLead(lead, index);
            const row = document.createElement('tr');
            row.className = 'hover:bg-slate-50/50 transition-colors group';
            row.dataset.leadId = normalizedLead.id;
            row.dataset.leadDateIso = parseDateValue(normalizedLead.date).toISOString();
            row.dataset.leadStatus = normalizedLead.status;
            row.dataset.leadOwner = normalizedLead.owner;
            row.dataset.leadLocation = JSON.stringify(normalizedLead.location || getCurrentLocation());
            row.innerHTML = `
                <td class="px-6 py-4 text-sm font-medium text-primary">#${escapeHtml(normalizedLead.id)}</td>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">${escapeHtml((normalizedLead.company || 'N').slice(0, 2).toUpperCase())}</div>
                        <span class="text-sm font-semibold text-on-surface">${escapeHtml(normalizedLead.company)}</span>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="flex flex-col">
                        <span class="text-sm font-medium text-on-surface">${escapeHtml(normalizedLead.contact)}</span>
                        <span class="text-xs text-on-surface-variant">${escapeHtml(normalizedLead.industry)}</span>
                    </div>
                </td>
                <td class="px-6 py-4 text-sm font-semibold text-on-surface">${escapeHtml(formatMoney(normalizedLead.value, { currency: normalizedLead.currency }))}</td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-700">${escapeHtml(normalizedLead.status)}</span>
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">Y</div>
                        <span class="text-sm text-on-surface">${escapeHtml(normalizedLead.owner)}</span>
                    </div>
                </td>
                <td class="px-6 py-4 text-sm text-on-surface-variant">${escapeHtml(formatDisplayDate(normalizedLead.date))}</td>
                <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-1">
                        <button class="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all active:scale-90" title="Comments"><span class="material-symbols-outlined text-xl">forum</span></button>
                        <button class="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all active:scale-90" title="Timeline"><span class="material-symbols-outlined text-xl">history</span></button>
                        <button class="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all active:scale-90" title="Change Owner"><span class="material-symbols-outlined text-xl">person_add</span></button>
                        <button class="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all active:scale-90" title="Location"><span class="material-symbols-outlined text-xl">location_on</span></button>
                    </div>
                </td>
            `;
            tbody.prepend(row);
        });
    }

    function initLoginPage() {
        const form = qs('#loginForm');
        if (!form) {
            return;
        }

        form.noValidate = true;
        form.setAttribute('action', '#');
        window.alert = function () { };

        const mobileInput = qs('#mobile');
        const passwordInput = qs('#password');
        const otpInput = qs('#otp');
        const submitButton = qs('button[type="submit"]', form);
        const fieldConfigs = [
            { input: mobileInput, message: 'Mobile Number is required' },
            { input: passwordInput, message: 'Password is required' },
            { input: otpInput, message: 'OTP is required' }
        ];

        function getFieldWrapper(input) {
            let current = input;
            while (current && current !== form) {
                if (current.classList && current.classList.contains('space-y-1.5')) {
                    return current;
                }
                current = current.parentElement;
            }
            return null;
        }

        function ensureErrorNode(input) {
            if (!input) {
                return null;
            }

            const wrapper = getFieldWrapper(input);
            if (!wrapper) {
                return null;
            }

            let errorNode = qs('[data-field-error]', wrapper);
            if (!errorNode) {
                errorNode = document.createElement('p');
                errorNode.setAttribute('data-field-error', 'true');
                errorNode.style.display = 'none';
                errorNode.style.color = '#ba1a1a';
                errorNode.style.fontSize = '0.6875rem';
                errorNode.style.fontWeight = '600';
                errorNode.style.textTransform = 'uppercase';
                errorNode.style.letterSpacing = '0.08em';
                errorNode.style.marginBottom = '0.375rem';
                const inputContainer = wrapper.querySelector('.relative');
                const topRow = wrapper.firstElementChild;
                if (inputContainer) {
                    inputContainer.insertAdjacentElement('beforebegin', errorNode);
                } else if (topRow) {
                    topRow.insertAdjacentElement('afterend', errorNode);
                } else {
                    wrapper.prepend(errorNode);
                }
            }

            return errorNode;
        }

        function showFieldError(input, message) {
            const errorNode = ensureErrorNode(input);
            if (!errorNode) {
                return;
            }
            errorNode.textContent = message;
            errorNode.style.display = 'block';
            input.style.border = '1px solid rgba(186, 26, 26, 0.35)';
            input.style.boxShadow = '0 0 0 1px rgba(186, 26, 26, 0.12)';
        }

        function clearFieldError(input) {
            const wrapper = getFieldWrapper(input);
            const errorNode = wrapper ? qs('[data-field-error]', wrapper) : null;
            if (errorNode) {
                errorNode.textContent = '';
                errorNode.style.display = 'none';
            }
            if (input) {
                input.style.border = '';
                input.style.boxShadow = '';
            }
        }

        fieldConfigs.forEach(({ input, message }) => {
            ensureErrorNode(input);
            input.addEventListener('input', () => {
                if (input.value.trim()) {
                    clearFieldError(input);
                } else {
                    showFieldError(input, message);
                }
            });
        });

        function redirectToDashboard() {
            const dashboardUrl = new URL('dashboard.html', window.location.href).href;
            window.location.assign(dashboardUrl);
        }

        function validateLogin(event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
                if (typeof event.stopImmediatePropagation === 'function') {
                    event.stopImmediatePropagation();
                }
            }
            const mobileValue = mobileInput.value.trim();
            const passwordValue = passwordInput.value.trim();
            const otpValue = otpInput.value.trim();
            let hasError = false;

            if (!mobileValue) {
                showFieldError(mobileInput, 'Mobile Number is required');
                hasError = true;
            } else {
                clearFieldError(mobileInput);
            }

            if (!passwordValue) {
                showFieldError(passwordInput, 'Password is required');
                hasError = true;
            } else {
                clearFieldError(passwordInput);
            }

            if (!otpValue) {
                showFieldError(otpInput, 'OTP is required');
                hasError = true;
            } else if (otpValue.length !== 6) {
                showFieldError(otpInput, 'OTP must be 6 digits');
                hasError = true;
            } else {
                clearFieldError(otpInput);
            }

            if (hasError) {
                const firstInvalid = [mobileInput, passwordInput, otpInput].find((input) => {
                    const wrapper = getFieldWrapper(input);
                    const errorNode = wrapper ? qs('[data-field-error]', wrapper) : null;
                    return errorNode && errorNode.style.display === 'block';
                });
                firstInvalid?.focus();
                return;
            }

            toast('Signing you in...', 'success');
            // Capture location opportunistically, but never block the redirect.
            try {
                captureBrowserLocation(() => { }, { highAccuracy: false, useCache: true });
            } catch (error) {
                // no-op
            }
            setTimeout(redirectToDashboard, 120);
            return false;
        }

        form.addEventListener('submit', validateLogin, true);
        form.onsubmit = (event) => {
            validateLogin(event);
            return false;
        };
        submitButton?.addEventListener('click', validateLogin, true);
    }

    function initDashboardPage() {
        const searchInput = qs('input[placeholder="Search leads, tasks, or reports..."]');
        const generateReportButton = qsa('button').find((button) => button.textContent.trim() === 'Generate Report');
        const updatePipelineButton = qsa('button').find((button) => button.textContent.trim() === 'Update Pipeline');

        function renderDashboardAnalytics() {
            const analytics = computeAnalytics();
            const cards = qsa('main p').filter((node) => [
                'Total Pipeline',
                'Deals in Play',
                'Closed Won (Wk)',
                'Win Rate',
                'Avg Deal Size'
            ].includes(node.textContent.trim()));

            cards.forEach((labelNode) => {
                const card = labelNode.parentElement;
                const valueNode = qs('h3', card);
                if (!valueNode) {
                    return;
                }
                switch (labelNode.textContent.trim()) {
                    case 'Total Pipeline':
                        valueNode.textContent = formatMoney(analytics.pipelineValue, { currency: analytics.commonCurrency, compact: true });
                        break;
                    case 'Deals in Play':
                        valueNode.textContent = String(analytics.activeLeads.length);
                        break;
                    case 'Closed Won (Wk)':
                        valueNode.textContent = String(analytics.closedWonThisWeek);
                        break;
                    case 'Win Rate':
                        valueNode.textContent = formatPercent(analytics.winRate, 0);
                        break;
                    case 'Avg Deal Size':
                        valueNode.textContent = formatMoney(analytics.avgDealSize, { currency: analytics.commonCurrency, compact: true });
                        break;
                    default:
                        break;
                }
            });

            const winRatePanel = qsa('h4').find((node) => node.textContent.trim() === 'Win Rate Trend vs Target')?.closest('div[class*="col-span"]');
            if (winRatePanel) {
                const actualLabel = qsa('span', winRatePanel).find((node) => node.textContent.includes('Actual:'));
                if (actualLabel) {
                    actualLabel.textContent = `Actual: ${formatPercent(analytics.winRate, 0)}`;
                }
                const svg = qs('svg', winRatePanel);
                const targetLabel = qsa('text', svg).find((node) => node.textContent.includes('TARGET'));
                if (targetLabel) {
                    targetLabel.textContent = 'TARGET (70%)';
                }
                const trendRates = [
                    Math.max(12, analytics.winRate * 0.45),
                    Math.max(18, analytics.winRate * 0.58),
                    Math.max(24, analytics.winRate * 0.72),
                    Math.max(32, analytics.winRate * 0.88),
                    Math.min(96, analytics.winRate)
                ];
                const points = trendRates.map((rate, index) => {
                    const x = index * 100;
                    const y = 180 - Math.min(150, rate * 1.45);
                    return { x, y };
                });
                const path = qs('path', svg);
                if (path) {
                    path.setAttribute('d', `M${points.map((point) => `${point.x} ${point.y}`).join(' L ')}`);
                }
                qsa('circle', svg).forEach((circle, index) => {
                    const point = points[index];
                    if (point) {
                        circle.setAttribute('cx', String(point.x));
                        circle.setAttribute('cy', String(point.y));
                    }
                });
            }

            const weeklyPanel = qsa('h4').find((node) => node.textContent.trim() === 'Weekly Deal Activity')?.closest('.bg-surface-container-lowest');
            if (weeklyPanel) {
                const barHost = qsa('div', weeklyPanel).find((node) => node.className.includes('relative h-64'));
                if (barHost) {
                    const peak = Math.max(1, ...analytics.weekBuckets.flatMap((bucket) => [bucket.newOpps, bucket.advancements, bucket.won]));
                    const columns = qsa(':scope > div', barHost).filter((node) => node.className.includes('flex-1'));
                    columns.forEach((column, index) => {
                        const bucket = analytics.weekBuckets[index];
                        if (!bucket) {
                            return;
                        }
                        const bars = qsa(':scope > div', column).slice(0, 3);
                        const values = [bucket.newOpps, bucket.advancements, bucket.won];
                        bars.forEach((bar, barIndex) => {
                            const height = Math.max(8, Math.round((values[barIndex] / peak) * 100));
                            bar.style.height = `${height}%`;
                        });
                        setNodeText(qs('span', column), bucket.label);
                    });
                }

                const statCards = qsa('p', weeklyPanel).filter((node) => ['New Deals', 'Stage Upgrades', 'Revenue Won'].includes(node.textContent.trim()));
                statCards.forEach((labelNode) => {
                    const card = labelNode.parentElement;
                    const valueNode = qsa('p', card)[1];
                    if (!valueNode) {
                        return;
                    }
                    if (labelNode.textContent.trim() === 'New Deals') {
                        valueNode.textContent = String(analytics.weeklyNewDeals);
                    } else if (labelNode.textContent.trim() === 'Stage Upgrades') {
                        valueNode.textContent = String(analytics.weeklyStageUpgrades);
                    } else if (labelNode.textContent.trim() === 'Revenue Won') {
                        valueNode.textContent = formatMoney(analytics.weeklyWonRevenue, { currency: analytics.commonCurrency, compact: true });
                    }
                });
            }
        }

        void searchInput;

        if (generateReportButton) {
            generateReportButton.addEventListener('click', () => {
                const analytics = computeAnalytics();
                const rows = [
                    ['Total Pipeline', formatMoney(analytics.pipelineValue, { currency: analytics.commonCurrency }), `${analytics.activeLeads.length} active leads`],
                    ['Deals in Play', String(analytics.activeLeads.length), `${analytics.highPotential.length} high potential`],
                    ['Closed Won (Wk)', String(analytics.closedWonThisWeek), formatMoney(analytics.wonRevenue, { currency: analytics.commonCurrency })],
                    ['Win Rate', formatPercent(analytics.winRate, 1), `${analytics.wonLeads.length} won / ${analytics.lostLeads.length} lost`],
                    ['Avg Deal Size', formatMoney(analytics.avgDealSize, { currency: analytics.commonCurrency }), `${analytics.totalLeads} total leads`]
                ];
                downloadExcelTable('dashboard-report.xls', ['Metric', 'Value', 'Trend'], rows, 'Dashboard Report');
                toast('Dashboard report exported as an Excel sheet.', 'success');
            });
        }

        if (updatePipelineButton) {
            updatePipelineButton.addEventListener('click', () => {
                renderDashboardAnalytics();
                toast('Pipeline metrics refreshed on the dashboard.', 'success');
            });
        }

        const viewAll = qsa('button').find((button) => button.textContent.includes('View All'));
        if (viewAll) {
            viewAll.addEventListener('click', () => {
                window.location.href = 'review_leads.html';
            });
        }

        renderDashboardAnalytics();
    }

    function initAddLeadPage() {
        const inputs = qsa('main input');
        const selects = qsa('main select');
        const textareas = qsa('main textarea');
        const createButton = qsa('main button').find((button) => button.textContent.includes('Create Lead Entry'));
        const mobileLinks = qsa('nav a[href="#"]');
        const clientNameInput = document.getElementById('client-name-input');
        const clientNameSuggestions = document.getElementById('client-name-suggestions');

        function getClientNameMatches(query = '') {
            const normalizedQuery = String(query || '').trim().toLowerCase();
            const names = getAllClients()
                .map((client) => String(client.name || '').trim())
                .filter(Boolean)
                .filter((name, index, list) => list.findIndex((entry) => entry.toLowerCase() === name.toLowerCase()) === index);

            const matchingStartsWith = names
                .filter((name) => !normalizedQuery || name.toLowerCase().startsWith(normalizedQuery))
                .sort((left, right) => left.localeCompare(right));

            const matchingIncludes = normalizedQuery
                ? names
                    .filter((name) => !name.toLowerCase().startsWith(normalizedQuery) && name.toLowerCase().includes(normalizedQuery))
                    .sort((left, right) => left.localeCompare(right))
                : [];

            return [...matchingStartsWith, ...matchingIncludes].slice(0, 8);
        }

        function hideClientSuggestions() {
            if (!clientNameSuggestions) {
                return;
            }
            clientNameSuggestions.classList.add('hidden');
            clientNameSuggestions.innerHTML = '';
        }

        function renderClientSuggestions(query = '') {
            if (!clientNameSuggestions || !clientNameInput) {
                return;
            }

            const matches = getClientNameMatches(query);
            if (!matches.length) {
                hideClientSuggestions();
                return;
            }

            clientNameSuggestions.innerHTML = matches.map((name, index) => `
                <button
                    type="button"
                    class="client-name-option flex w-full items-center justify-between px-4 py-3 text-left transition-colors ${index === 0 ? 'bg-blue-50/70 text-slate-900' : 'bg-white text-slate-700'} hover:bg-blue-50"
                    data-client-name="${escapeHtml(name)}"
                >
                    <span class="font-medium">${escapeHtml(name)}</span>
                    <span class="text-xs uppercase tracking-[0.18em] text-slate-400">Client</span>
                </button>
            `).join('');

            clientNameSuggestions.classList.remove('hidden');
            qsa('.client-name-option', clientNameSuggestions).forEach((optionButton) => {
                optionButton.addEventListener('click', () => {
                    clientNameInput.value = optionButton.getAttribute('data-client-name') || '';
                    hideClientSuggestions();
                    clientNameInput.focus();
                });
            });
        }

        if (clientNameInput) {
            clientNameInput.addEventListener('focus', () => renderClientSuggestions(clientNameInput.value));
            clientNameInput.addEventListener('click', () => renderClientSuggestions(clientNameInput.value));
            clientNameInput.addEventListener('input', () => renderClientSuggestions(clientNameInput.value));
            clientNameInput.addEventListener('keydown', (event) => {
                if (event.key === 'Escape') {
                    hideClientSuggestions();
                }
            });
            document.addEventListener('click', (event) => {
                if (clientNameInput.contains(event.target) || clientNameSuggestions?.contains(event.target)) {
                    return;
                }
                hideClientSuggestions();
            });
        }

        mobileLinks.forEach((link, index) => {
            const targets = ['dashboard.html', 'add_lead.html', 'manage_leads.html', 'settings.html'];
            link.addEventListener('click', (event) => {
                event.preventDefault();
                window.location.href = targets[index];
            });
        });

        if (!createButton) {
            return;
        }

        createButton.addEventListener('click', () => {
            const [
                organizationInput,
                lobInput,
                currentClientInput,
                contactNameInput,
                phoneInput,
                emailInput,
                industryInput,
                websiteInput,
                annualValueInput,
                nextActionInput
            ] = inputs;
            const [sourceSelect, currencySelect, statusSelect] = selects;
            const [descriptionInput] = textareas;

            const requiredFields = [
                { field: organizationInput, label: 'Organization Name' },
                { field: contactNameInput, label: 'Contact Name' },
                { field: phoneInput, label: 'Phone' },
                { field: emailInput, label: 'Email' },
                { field: annualValueInput, label: 'Annual Value' },
                { field: descriptionInput, label: 'Opportunity Description' }
            ];

            const missing = requiredFields.find((item) => !item.field.value.trim());
            if (missing) {
                toast(`${missing.label} is required before creating the lead.`, 'error');
                missing.field.focus();
                return;
            }

            const customLeads = getStored(STORAGE_KEYS.leads, []);
            const leadRecord = {
                id: `LD-${Math.floor(1000 + Math.random() * 9000)}`,
                company: organizationInput.value.trim(),
                contact: contactNameInput.value.trim(),
                clientName: currentClientInput.value.trim() || organizationInput.value.trim(),
                phone: phoneInput.value.trim(),
                email: emailInput.value.trim(),
                lob: lobInput.value.trim(),
                industry: industryInput.value.trim() || lobInput.value.trim() || 'General',
                source: sourceSelect.value,
                website: websiteInput.value.trim(),
                value: annualValueInput.value.trim(),
                currency: currencySelect.value,
                status: statusSelect.value,
                progress: '25',
                nextAction: nextActionInput.value.trim(),
                description: descriptionInput.value.trim(),
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            };
            customLeads.unshift(leadRecord);
            captureBrowserLocation((location) => {
                customLeads[0].location = location;
                leadRecord.location = location;
                setStored(STORAGE_KEYS.leads, customLeads);
                ensureClientProfileForLead(leadRecord);
                toast('Lead entry created and staged for the rest of the frontend.', 'success');
                setTimeout(() => {
                    window.location.href = 'manage_leads.html';
                }, 700);
            }, { highAccuracy: true, useCache: false, timeout: 10000 });
        });
    }

    function initManageLeadsPage() {
        addStoredLeadToManageTable();
        syncSeedLeadRows('manage');

        const searchInput = qs('input[placeholder="Search leads, companies, or people..."]');
        if (!searchInput) {
            return;
        }

        const statusSelect = qsa('select')[0];
        const industrySelect = qsa('select')[1];
        const dateButton = qsa('button').find((button) => button.textContent.includes('Date Range'));
        const deleteButton = qsa('button').find((button) => button.textContent.includes('Delete Selected'));
        const exportButton = qsa('button').find((button) => button.textContent.includes('Export Selected'));
        const changeStatusButton = qsa('button').find((button) => button.textContent.includes('Change Status'));
        const newLeadButton = qsa('button').find((button) => button.textContent.includes('New Lead'));
        const selectedLabel = qsa('span').find((span) => span.textContent.includes('Leads Selected'));
        const summaryLabel = qsa('p').find((node) => node.textContent.includes('Showing'));
        const bulkActionsBar = qs('#bulk-actions-bar');
        const paginationButtons = qsa('button').filter((button) => ['Previous', '1', '2', '3', '25', 'Next'].includes(button.textContent.trim()));
        const prevButton = paginationButtons.find((button) => button.textContent.trim() === 'Previous');
        const nextButton = paginationButtons.find((button) => button.textContent.trim() === 'Next');
        const numberButtons = paginationButtons.filter((button) => /^\d+$/.test(button.textContent.trim())).slice(0, 3);
        const rows = qsa('tbody tr').filter((row) => row.querySelector('td'));
        const allCheckbox = qs('thead input[type="checkbox"]');
        const fab = qsa('button').find((button) => button.className.includes('fixed bottom-8 right-8'));
        let activeDateRange = { kind: 'any', label: 'Any time' };

        function rowData(row) {
            const cells = qsa('td', row);
            return {
                id: (row.dataset.leadId || cells[1]?.innerText.trim() || '').toLowerCase(),
                company: (row.dataset.leadCompany || cells[2]?.innerText.trim() || '').toLowerCase(),
                contact: cells[3]?.innerText.trim().toLowerCase() || '',
                value: String(parseNumericValue(row.dataset.leadValue || cells[4]?.innerText.trim())).toLowerCase(),
                status: (row.dataset.leadStatus || cells[5]?.innerText.trim() || '').toLowerCase(),
                tags: cells[6]?.innerText.trim().toLowerCase() || '',
                owner: (row.dataset.leadOwner || cells[7]?.innerText.trim() || '').toLowerCase(),
                dateIso: row.dataset.leadDateIso || parseDateValue(cells[8]?.innerText.trim()).toISOString()
            };
        }

        function getSelectedRows() {
            return rows.filter((row) => row.isConnected && row.querySelector('input[type="checkbox"]')?.checked);
        }

        function getLeadFromRow(row) {
            return findLeadById(row.dataset.leadId || qsa('td', row)[1]?.textContent.trim());
        }

        function refreshQuickMetrics() {
            const analytics = computeAnalytics();
            qsa('p').filter((node) => ['Pipeline Value', 'Active Leads', 'High Potential', 'Conv. Rate'].includes(node.textContent.trim())).forEach((labelNode) => {
                const valueNode = qsa('p', labelNode.parentElement)[1];
                if (!valueNode) {
                    return;
                }
                if (labelNode.textContent.trim() === 'Pipeline Value') {
                    valueNode.textContent = formatMoney(analytics.pipelineValue, { currency: analytics.commonCurrency, compact: true });
                } else if (labelNode.textContent.trim() === 'Active Leads') {
                    valueNode.textContent = String(analytics.activeLeads.length);
                } else if (labelNode.textContent.trim() === 'High Potential') {
                    valueNode.textContent = String(analytics.highPotential.length);
                } else if (labelNode.textContent.trim() === 'Conv. Rate') {
                    valueNode.textContent = formatPercent(analytics.winRate, 1);
                }
            });
        }

        function updateSelectedCount() {
            const selected = rows.filter((row) => row.isConnected && row.querySelector('input[type="checkbox"]')?.checked);
            if (selectedLabel) {
                selectedLabel.textContent = `${selected.length} Leads Selected`;
            }
            if (bulkActionsBar) {
                bulkActionsBar.classList.toggle('hidden', selected.length === 0);
                bulkActionsBar.classList.toggle('flex', selected.length > 0);
            }
        }

        const pager = wireTableSearchAndPagination({
            searchInput,
            rows,
            predicate: (row, query) => {
                const data = rowData(row);
                const statusMatch = !statusSelect || statusSelect.selectedIndex === 0 || data.status.includes(statusSelect.value.toLowerCase());
                const industryMatch = !industrySelect || industrySelect.selectedIndex === 0 || data.tags.includes(industrySelect.value.toLowerCase());
                const searchMatch = !query || Object.values(data).some((value) => value.includes(query));
                const dateMatch = matchesDateRange(data.dateIso, activeDateRange);
                return statusMatch && industryMatch && searchMatch && dateMatch;
            },
            summaryLabel,
            prevButton,
            nextButton,
            numberButtons,
            pageSize: 3,
            onRender: () => updateSelectedCount()
        });

        [statusSelect, industrySelect].forEach((select) => {
            if (select) {
                select.addEventListener('change', () => pager.render());
            }
        });

        if (dateButton) {
            dateButton.addEventListener('click', () => {
                openFormModal({
                    title: 'Date Range Filter',
                    description: 'Choose the date window for the lead table.',
                    submitLabel: 'Apply Filter',
                    fields: [
                        { name: 'range', label: 'Preset', type: 'select', value: activeDateRange.label, required: true, options: ['Any time', 'Last 30 days', 'This quarter', 'This year', 'Custom'] },
                        { name: 'from', label: 'Custom From', type: 'date', value: activeDateRange.from || '' },
                        { name: 'to', label: 'Custom To', type: 'date', value: activeDateRange.to || '' }
                    ],
                    onSubmit: ({ range, from, to }) => {
                        const normalized = range.toLowerCase();
                        if (normalized === 'custom' && (!from || !to)) {
                            toast('Choose both custom dates.', 'warning');
                            return false;
                        }
                        activeDateRange = {
                            'any time': { kind: 'any', label: 'Any time' },
                            'last 30 days': { kind: 'last30', label: 'Last 30 days' },
                            'this quarter': { kind: 'quarter', label: 'This quarter' },
                            'this year': { kind: 'year', label: 'This year' },
                            custom: { kind: 'custom', label: 'Custom', from, to }
                        }[normalized] || { kind: 'any', label: 'Any time' };
                        dateButton.innerHTML = `
                            <span class="material-symbols-outlined text-[18px]" data-icon="calendar_month">calendar_month</span>
                            ${escapeHtml(activeDateRange.kind === 'custom' ? `${activeDateRange.label}: ${from} to ${to}` : activeDateRange.label)}
                        `;
                        pager.render();
                        toast(`Date range set to ${activeDateRange.kind === 'custom' ? `${from} to ${to}` : activeDateRange.label}.`, 'success');
                    }
                });
            });
        }

        qsa('tbody input[type="checkbox"]').forEach((checkbox) => {
            checkbox.addEventListener('change', updateSelectedCount);
        });

        qsa('tbody input[type="checkbox"]').forEach((checkbox) => {
            checkbox.checked = false;
        });
        if (allCheckbox) {
            allCheckbox.checked = false;
        }

        if (allCheckbox) {
            allCheckbox.addEventListener('change', () => {
                qsa('tbody input[type="checkbox"]').forEach((checkbox) => {
                    checkbox.checked = allCheckbox.checked;
                });
                updateSelectedCount();
            });
        }

        if (deleteButton) {
            deleteButton.addEventListener('click', () => {
                const selectedRows = getSelectedRows();
                if (!selectedRows.length) {
                    toast('Select at least one lead to delete.', 'warning');
                    return;
                }
                selectedRows.forEach((row) => {
                    deleteLeadFromState(row.dataset.leadId || qsa('td', row)[1]?.textContent.trim());
                    row.remove();
                });
                toast(`${selectedRows.length} lead(s) removed from the table.`, 'success');
                pager.render();
                refreshQuickMetrics();
            });
        }

        if (exportButton) {
            exportButton.addEventListener('click', () => {
                const selectedRows = getSelectedRows();
                if (!selectedRows.length) {
                    toast('Select at least one lead to export.', 'warning');
                    return;
                }
                const exportRows = selectedRows.map((row) => {
                    const cells = qsa('td', row);
                    return [1, 2, 3, 4, 5, 7].map((index) => cells[index].innerText.trim());
                });
                downloadExcelTable('selected-leads.xls', ['Lead ID', 'Company', 'Contact', 'Value', 'Status', 'Owner'], exportRows, 'Selected Leads');
                toast('Selected leads exported as an Excel sheet.', 'success');
            });
        }

        if (changeStatusButton) {
            changeStatusButton.addEventListener('click', () => {
                const selectedRows = getSelectedRows();
                if (!selectedRows.length) {
                    toast('Select at least one lead to update.', 'warning');
                    return;
                }
                openFormModal({
                    title: 'Change Lead Status',
                    description: 'Choose the status to apply to all selected leads.',
                    submitLabel: 'Update Status',
                    fields: [
                        { name: 'status', label: 'New Status', type: 'select', value: 'Qualified', required: true, options: statusCycle }
                    ],
                    onSubmit: ({ status }) => {
                        selectedRows.forEach((row) => {
                            const badge = qsa('td', row)[5].querySelector('span');
                            badge.textContent = status;
                            row.dataset.leadStatus = status;
                            saveLeadPatch(row.dataset.leadId || qsa('td', row)[1]?.textContent.trim(), { status });
                        });
                        toast(`Selected leads moved to ${status}.`, 'success');
                        pager.render();
                        refreshQuickMetrics();
                    }
                });
            });
        }

        if (newLeadButton) {
            newLeadButton.addEventListener('click', () => {
                window.location.href = 'add_lead.html';
            });
        }

        qsa('tbody button').forEach((button) => {
            button.addEventListener('click', () => {
                const row = button.closest('tr');
                const company = row ? qsa('td', row)[2].innerText.trim() : 'lead';
                openModal(
                    `Lead Actions: ${company}`,
                    '<p>Choose an action for this lead.</p>',
                    [
                        {
                            label: 'View Lead',
                            className: 'px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold bg-white',
                            onClick: () => {
                                const lead = row ? getLeadFromRow(row) : null;
                                if (!lead) {
                                    toast('Lead details are not available yet.', 'warning');
                                    return;
                                }
                                openLeadDetailModal(lead);
                            }
                        },
                        {
                            label: 'Delete Selected',
                            className: 'px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold bg-white',
                            onClick: () => {
                                deleteLeadFromState(row?.dataset.leadId || qsa('td', row)[1]?.textContent.trim());
                                row?.remove();
                                pager.render();
                                refreshQuickMetrics();
                                toast('Lead removed from the table.', 'success');
                            }
                        },
                        {
                            label: 'Export Selected',
                            className: 'px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold bg-white',
                            onClick: () => {
                                const checkbox = row?.querySelector('input[type="checkbox"]');
                                if (checkbox) {
                                    checkbox.checked = true;
                                    updateSelectedCount();
                                }
                                exportButton?.click();
                            }
                        },
                        {
                            label: 'Change Status',
                            onClick: () => {
                                openFormModal({
                                    title: 'Change Lead Status',
                                    description: 'Choose the next status for this lead.',
                                    submitLabel: 'Apply Status',
                                    fields: [
                                        { name: 'status', label: 'Lead Status', type: 'select', value: rowData(row).status || 'Discovery', required: true, options: statusCycle }
                                    ],
                                    onSubmit: ({ status }) => {
                                        const badge = qsa('td', row)[5]?.querySelector('span');
                                        if (badge) {
                                            badge.textContent = status;
                                        }
                                        row.dataset.leadStatus = status;
                                        saveLeadPatch(row.dataset.leadId || qsa('td', row)[1]?.textContent.trim(), { status });
                                        pager.render();
                                        refreshQuickMetrics();
                                        toast(`Lead status moved to ${status}.`, 'success');
                                    }
                                });
                            }
                        }
                    ]
                );
            });
        });

        rows.forEach((row) => {
            row.addEventListener('click', (event) => {
                if (
                    event.target.closest('input[type="checkbox"]')
                    || event.target.closest('button')
                    || event.target.closest('a')
                ) {
                    return;
                }
                const lead = getLeadFromRow(row);
                if (!lead) {
                    toast('Lead details are not available yet.', 'warning');
                    return;
                }
                openLeadDetailModal(lead);
            });
            row.style.cursor = 'pointer';
        });

        if (fab) {
            fab.addEventListener('click', () => {
                window.location.href = 'add_lead.html';
            });
        }

        updateSelectedCount();
        refreshQuickMetrics();
    }

    function initReviewLeadsPage() {
        addStoredLeadToReviewTable();
        syncSeedLeadRows('review');

        const searchInput = qs('input[placeholder="Search leads by ID, Company or Owner..."]');
        if (!searchInput) {
            return;
        }

        const rows = qsa('tbody tr').filter((row) => row.querySelector('td'));
        const filterButton = qsa('button').find((button) => button.textContent.includes('Filter'));
        const exportButton = qsa('button').find((button) => button.textContent.includes('Export'));
        const updateModelButton = qsa('button').find((button) => button.textContent.includes('Update Model'));
        const summaryLabel = qsa('span').find((span) => span.textContent.includes('Showing 1-3'));
        const prevButton = qsa('button').find((button) => button.textContent.trim() === 'Previous');
        const nextButton = qsa('button').find((button) => button.textContent.trim() === 'Next');
        const numberButtons = qsa('button').filter((button) => ['1', '2', '3'].includes(button.textContent.trim())).slice(0, 3);
        const queueHealthCopy = qsa('p').find((paragraph) => paragraph.textContent.includes('Lead processing speed'));
        const filterModes = ['All Leads', 'Hot Leads', 'Qualified Only'];
        let filterIndex = 0;
        let activeRow = rows[0] || null;

        function refreshQueueHealth() {
            const analytics = computeAnalytics();
            const heading = qsa('h3').find((node) => node.textContent.trim() === 'Queue Health');
            const statValues = heading ? qsa('p', heading.parentElement.parentElement).filter((node) => node.className.includes('font-bold')) : [];
            if (statValues[0]) {
                statValues[0].textContent = String(analytics.pendingReview);
            }
            if (statValues[1]) {
                statValues[1].innerHTML = `${analytics.avgResponseHours.toFixed(1)}<span class="text-lg">h</span>`;
            }
            if (statValues[2]) {
                statValues[2].textContent = String(analytics.hotLeads.length);
            }
            if (queueHealthCopy) {
                queueHealthCopy.textContent = `${analytics.pendingReview} active leads are in queue, with ${analytics.hotLeads.length} high-priority opportunities needing attention.`;
            }
        }

        function getRowValues(row) {
            const cells = qsa('td', row);
            return {
                id: (row.dataset.leadId || cells[0]?.innerText.replace('#', '').trim() || ''),
                company: cells[1]?.innerText.trim() || '',
                contact: cells[2]?.innerText.trim() || '',
                value: cells[3]?.innerText.trim() || '',
                status: cells[4]?.innerText.trim() || '',
                owner: cells[5]?.innerText.trim() || '',
                date: cells[6]?.innerText.trim() || ''
            };
        }

        function setActiveRow(row) {
            activeRow = row;
            rows.forEach((item) => item.classList.remove('ring-2', 'ring-primary/30'));
            row.classList.add('ring-2', 'ring-primary/30');
        }

        function getLeadFromReviewRow(row) {
            const data = getRowValues(row);
            const cleanedId = data.id.replace('#', '').trim();
            return findLeadById(row.dataset.leadId || cleanedId)
                || getAllLeads().find((lead) => String(lead.company || '').toLowerCase() === data.company.toLowerCase())
                || null;
        }

        const pager = wireTableSearchAndPagination({
            searchInput,
            rows,
            predicate: (row, query) => {
                const data = getRowValues(row);
                const haystack = Object.values(data).join(' ').toLowerCase();
                const queryMatch = !query || haystack.includes(query);
                const filterMatch = filterIndex === 0
                    || (filterIndex === 1 && row.innerText.toLowerCase().includes('hot lead'))
                    || (filterIndex === 2 && data.status.toLowerCase().includes('qualified'));
                return queryMatch && filterMatch;
            },
            summaryLabel,
            prevButton,
            nextButton,
            numberButtons,
            pageSize: 15,
            onRender: (visibleRows, pagedRows) => {
                if (pagedRows[0]) {
                    setActiveRow(pagedRows[0]);
                } else if (visibleRows[0]) {
                    setActiveRow(visibleRows[0]);
                }
            }
        });

        if (filterButton) {
            filterButton.addEventListener('click', () => {
                filterIndex = (filterIndex + 1) % filterModes.length;
                toast(`Review filter: ${filterModes[filterIndex]}`, 'success');
                pager.render();
            });
        }

        if (exportButton) {
            exportButton.addEventListener('click', () => {
                const exportRows = rows
                    .filter((row) => row.style.display !== 'none')
                    .map((row) => Object.values(getRowValues(row)));
                downloadExcelTable('review-queue.xls', ['Lead ID', 'Company', 'Contact', 'Value', 'Status', 'Owner', 'Date'], exportRows, 'Review Queue');
                toast('Review queue exported as an Excel sheet.', 'success');
            });
        }

        if (updateModelButton && queueHealthCopy) {
            let modelVersion = 1;
            updateModelButton.addEventListener('click', () => {
                modelVersion += 1;
                queueHealthCopy.textContent = `Lead scoring model v${modelVersion} is now prioritizing the most responsive enterprise prospects.`;
                toast(`AI model updated to v${modelVersion}.`, 'success');
            });
        }

        qsa('button[title]').forEach((button) => {
            button.addEventListener('click', () => {
                const row = button.closest('tr');
                if (!row) {
                    return;
                }
                setActiveRow(row);
                const title = button.getAttribute('title');
                const data = getRowValues(row);

                if (title === 'Comments') {
                    const thread = getLeadComments(findLeadById(data.id.replace('#', '')) || { company: data.company, owner: data.owner });
                    openModal(
                        `Lead Comments: ${data.company}`,
                        `<div class="space-y-4">
                            <div class="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                                <div class="flex items-start justify-between gap-3">
                                    <div>
                                        <p class="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">Conversation</p>
                                        <p class="mt-2 text-sm text-slate-600">Notes and internal updates for this lead.</p>
                                    </div>
                                    <div class="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                                        <span class="material-symbols-outlined">forum</span>
                                    </div>
                                </div>
                            </div>
                            <div class="space-y-3">
                            ${thread.map((comment, index) => `
                                <div class="rounded-2xl ${index % 2 === 0 ? 'bg-slate-50 border border-slate-200' : 'bg-blue-50 border border-blue-100'} p-4">
                                    <div class="flex items-center justify-between gap-3 mb-2">
                                        <p class="text-xs font-bold uppercase tracking-[0.18em] ${index % 2 === 0 ? 'text-slate-600' : 'text-blue-700'}">${index % 2 === 0 ? data.owner : 'You'}</p>
                                        <span class="text-[11px] text-slate-400">${index === 0 ? 'Latest' : 'Team Note'}</span>
                                    </div>
                                    <p class="text-sm leading-relaxed text-slate-700">${escapeHtml(comment)}</p>
                                </div>
                            `).join('')}
                            </div>
                        </div>`,
                        [
                            {
                                label: 'Add Note',
                                onClick: (close) => {
                                    close();
                                    openFormModal({
                                        title: `Add Note: ${data.company}`,
                                        description: 'Capture the next useful update for this lead.',
                                        submitLabel: 'Save Note',
                                        fields: [
                                            { name: 'note', label: 'Lead Note', type: 'textarea', required: true, placeholder: 'Write the update you want the team to see...' }
                                        ],
                                        onSubmit: ({ note }) => {
                                            DEFAULT_LEAD_COMMENTS[data.company] = (DEFAULT_LEAD_COMMENTS[data.company] || []).concat(note);
                                            toast('Comment added to the lead.', 'success');
                                        }
                                    });
                                }
                            }
                        ]
                    );
                                } else if (title === 'Timeline') {
                    openModal(
                        `Activity Timeline: ${data.company}`,
                        `<div class="space-y-4">
                            <div class="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                                <p class="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">Activity Timeline</p>
                                <p class="mt-2 text-sm text-slate-600">A polished snapshot of the lead journey so far.</p>
                            </div>
                            <div class="relative pl-8 space-y-5 before:absolute before:left-[13px] before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
                                <div class="relative rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
                                    <div class="absolute -left-[25px] top-5 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center ring-4 ring-white">
                                        <span class="material-symbols-outlined text-sm">flag</span>
                                    </div>
                                    <p class="font-semibold text-slate-900">${escapeHtml(data.status)} Follow-up</p>
                                    <p class="text-xs text-slate-500 mt-1">${escapeHtml(data.date)} | ${escapeHtml(data.owner)}</p>
                                    <p class="text-sm text-slate-600 mt-2">The lead is currently progressing through the ${escapeHtml(data.status)} stage.</p>
                                </div>
                                <div class="relative rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
                                    <div class="absolute -left-[25px] top-5 w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center ring-4 ring-white">
                                        <span class="material-symbols-outlined text-sm">person_add</span>
                                    </div>
                                    <p class="font-semibold text-slate-900">Ownership Confirmed</p>
                                    <p class="text-xs text-slate-500 mt-1">${escapeHtml(data.date)} | ${escapeHtml(data.owner)}</p>
                                    <p class="text-sm text-slate-600 mt-2">This opportunity is currently assigned to ${escapeHtml(data.owner)}.</p>
                                </div>
                                <div class="relative rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
                                    <div class="absolute -left-[25px] top-5 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center ring-4 ring-white">
                                        <span class="material-symbols-outlined text-sm">check_circle</span>
                                    </div>
                                    <p class="font-semibold text-slate-900">Lead Created</p>
                                    <p class="text-xs text-slate-500 mt-1">${escapeHtml(data.date)} | System</p>
                                    <p class="text-sm text-slate-600 mt-2">The lead record was created and added to the review queue.</p>
                                </div>
                            </div>
                        </div>`
                    );
                } else if (title === 'Change Owner') {
                    openModal(
                        `Reassign Lead: ${data.company}`,
                        `<div class="space-y-4">
                            <div class="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                                <div class="flex items-center justify-between gap-3">
                                    <div>
                                        <p class="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">Current Owner</p>
                                        <p class="mt-2 font-semibold text-slate-900">${escapeHtml(data.owner)}</p>
                                    </div>
                                    <div class="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                                        <span class="material-symbols-outlined">person_add</span>
                                    </div>
                                </div>
                            </div>
                            <div class="rounded-2xl bg-white border border-slate-200 p-4">
                                <p class="text-sm text-slate-600 leading-relaxed">Use the transfer action below to assign this lead to a different teammate while keeping the lead history intact.</p>
                            </div>
                        </div>`,
                        [
                            {
                                label: 'Transfer Lead',
                                onClick: (close) => {
                                    close();
                                    openFormModal({
                                        title: `Transfer Lead: ${data.company}`,
                                        description: 'Assign this lead to a different teammate.',
                                        submitLabel: 'Transfer Lead',
                                        fields: [
                                            { name: 'owner', label: 'New Owner', value: data.owner, required: true, placeholder: 'Enter teammate name' }
                                        ],
                                        onSubmit: ({ owner }) => {
                                            qsa('td', activeRow)[5].querySelector('span.text-sm').textContent = owner;
                                            saveLeadPatch(data.id, { owner });
                                            refreshQueueHealth();
                                            toast(`Lead transferred to ${owner}.`, 'success');
                                        }
                                    });
                                }
                            }
                        ]
                    );                } else if (title === 'Location') {
                    const sourceLead = findLeadById(data.id.replace('#', '')) || { company: data.company, location: row.dataset.leadLocation ? JSON.parse(row.dataset.leadLocation) : null };
                    const location = row.dataset.leadLocation
                        ? JSON.parse(row.dataset.leadLocation)
                        : getLeadLocation(sourceLead);
                    const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(`${location.lat},${location.lng}`)}&z=14&output=embed`;
                    openModal(
                        `Lead Location: ${data.company}`,
                        `<div class="space-y-4">
                            <div class="rounded-xl overflow-hidden border border-slate-200">
                                <iframe src="${mapsUrl}" class="w-full h-[280px]" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                            </div>
                            <div class="rounded-xl bg-slate-50 p-4">
                                <p class="font-semibold text-slate-900">${escapeHtml(location.label)}</p>
                                <p class="text-xs text-slate-500 mt-1">Coordinates: ${escapeHtml(location.lat)}, ${escapeHtml(location.lng)}</p>
                            </div>
                        </div>`
                    );
                }

                toast(`${title} opened for ${data.company}.`, 'success');
            });
        });

        rows.forEach((row) => {
            qsa('td', row).slice(0, -1).forEach((cell) => {
                cell.classList.add('cursor-pointer');
            });
            row.addEventListener('click', (event) => {
                if (event.target.closest('button') || event.target.closest('a')) {
                    return;
                }
                setActiveRow(row);
                const lead = getLeadFromReviewRow(row);
                if (!lead) {
                    toast('Lead details are not available yet.', 'warning');
                    return;
                }
                openLeadDetailModal(lead);
            });
            row.style.cursor = 'pointer';
        });

        setActiveRow(rows[0]);

        const targetLead = sessionStorage.getItem('grassroots_target_review_lead');
        if (targetLead) {
            const targetRow = rows.find((row) => row.innerText.toLowerCase().includes(targetLead.toLowerCase()));
            if (targetRow) {
                setActiveRow(targetRow);
                targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
                toast(`${targetLead} opened from notifications.`, 'success');
            }
            sessionStorage.removeItem('grassroots_target_review_lead');
        }

        refreshQueueHealth();
    }

    function initClientsPage() {
        const cardGrid = qsa('div.grid').find((grid) => grid.className.includes('xl:grid-cols-3'));
        if (!cardGrid) {
            return;
        }

        const searchInput = qs('#clients-search');
        const searchOptions = qs('#clients-search-options');
        const filterSelect = qs('#clients-filter-select');
        const pageSizeSelect = qs('#clients-page-size');
        const newClientButton = qsa('button').find((button) => button.textContent.includes('New Client'));
        const ghostCard = qsa('h4').find((heading) => heading.textContent.includes('Add New Partner'))?.closest('div.cursor-pointer');
        const footerLabel = qsa('span').find((span) => span.textContent.includes('Showing 5 of 124 clients'));
        const paginationButtons = qsa('footer button');
        const prevButton = paginationButtons[0];
        const numberButtons = paginationButtons.slice(1, 4);
        const nextButton = paginationButtons[4];
        const cards = qsa(':scope > div', cardGrid).filter((card) => !card.className.includes('cursor-pointer'));
        let currentPage = 1;

        function refreshTopStats() {
            const analytics = computeAnalytics();
            qsa('span').filter((node) => ['Total Clients', 'Active Projects', 'Avg. Lead Flow'].includes(node.textContent.trim())).forEach((labelNode) => {
                const valueNode = qsa('span', labelNode.parentElement)[1];
                if (!valueNode) {
                    return;
                }
                if (labelNode.textContent.trim() === 'Total Clients') {
                    valueNode.textContent = String(analytics.totalClients);
                } else if (labelNode.textContent.trim() === 'Active Projects') {
                    valueNode.textContent = String(analytics.activeProjects);
                } else if (labelNode.textContent.trim() === 'Avg. Lead Flow') {
                    valueNode.textContent = formatPercent(analytics.avgLeadFlow, 1);
                }
            });
        }

        const extraClients = getStored(STORAGE_KEYS.clients, []);
        extraClients.forEach((client) => {
            const card = document.createElement('div');
            card.className = 'group bg-surface-container-lowest rounded-xl p-1 transition-all duration-300 hover:shadow-[0px_20px_40px_rgba(25,28,29,0.08)]';
            card.innerHTML = `
                <div class="relative overflow-hidden rounded-lg aspect-video mb-4 bg-gradient-to-br from-blue-100 to-blue-50"></div>
                <div class="px-5 pb-6">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="text-xl font-bold text-on-surface">${escapeHtml(client.name)}</h3>
                        <span class="material-symbols-outlined text-outline">more_vert</span>
                    </div>
                    <p class="text-sm text-on-surface-variant mb-6 flex items-center gap-1">
                        <span class="material-symbols-outlined text-[16px]">domain</span>
                        ${escapeHtml(client.category)}
                    </p>
                    <div class="grid grid-cols-2 gap-4 mb-8">
                        <div class="flex flex-col">
                            <span class="text-[11px] font-bold text-outline-variant uppercase">Total Leads</span>
                            <span class="text-lg font-semibold text-on-surface">${escapeHtml(client.leads)}</span>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-[11px] font-bold text-outline-variant uppercase">Active Projects</span>
                            <span class="text-lg font-semibold text-on-surface">${escapeHtml(client.projects)}</span>
                        </div>
                    </div>
                    <button class="w-full py-3 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary-container transition-colors shadow-sm active:scale-95">
                        View Profile
                    </button>
                </div>
            `;
            ghostCard.before(card);
            cards.push(card);
        });

        function cardCategory(card) {
            return card.innerText.toLowerCase();
        }

        function cardName(card) {
            return qs('h3', card)?.textContent.trim() || '';
        }

        function refreshSearchOptions() {
            if (!searchOptions) {
                return;
            }
            searchOptions.innerHTML = '';
            cards.forEach((card) => {
                const option = document.createElement('option');
                option.value = cardName(card);
                searchOptions.appendChild(option);
            });
        }

        function visibleCards() {
            const mode = (filterSelect?.value || 'all').toLowerCase();
            const query = searchInput?.value.trim().toLowerCase() || '';
            return cards.filter((card) => {
                const modeMatch = mode === 'all' || cardCategory(card).includes(mode);
                const searchMatch = !query || card.innerText.toLowerCase().includes(query);
                return modeMatch && searchMatch;
            });
        }

        function render() {
            const filtered = visibleCards();
            const pageSize = Number(pageSizeSelect?.value || 9);
            const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
            currentPage = Math.min(currentPage, totalPages);
            cards.forEach((card) => { card.style.display = 'none'; });
            const start = (currentPage - 1) * pageSize;
            filtered.slice(start, start + pageSize).forEach((card) => { card.style.display = ''; });
            if (footerLabel) {
                footerLabel.textContent = `Showing ${Math.min(filtered.length, start + pageSize)} of ${filtered.length || 0} clients`;
            }
            numberButtons.forEach((button, index) => {
                const page = index + 1;
                button.style.display = page <= totalPages ? '' : 'none';
                button.classList.toggle('bg-primary', page === currentPage);
                button.classList.toggle('text-white', page === currentPage);
                button.textContent = String(page);
            });
            prevButton.disabled = currentPage === 1;
            nextButton.disabled = currentPage === totalPages;
        }

        function promptAndCreateClient() {
            openFormModal({
                title: 'Add New Client',
                description: 'Create a new client card for the directory.',
                submitLabel: 'Create Client',
                fields: [
                    { name: 'name', label: 'Client Name', required: true, placeholder: 'e.g. Horizon Estates' },
                    { name: 'category', label: 'Category', value: 'Commercial Real Estate', required: true },
                    { name: 'leads', label: 'Total Leads', type: 'number', value: '24', required: true },
                    { name: 'projects', label: 'Active Projects', type: 'number', value: '3', required: true }
                ],
                onSubmit: ({ name, category, leads, projects }) => {
                    const stored = getStored(STORAGE_KEYS.clients, []);
                    stored.unshift({ name, category, leads, projects });
                    setStored(STORAGE_KEYS.clients, stored);
                    toast(`${name} added. Refreshing the client directory.`, 'success');
                    window.location.reload();
                }
            });
        }

        if (filterSelect) {
            filterSelect.addEventListener('change', () => {
                currentPage = 1;
                toast(`Client filter: ${filterSelect.options[filterSelect.selectedIndex].textContent.replace('Filter: ', '')}`, 'success');
                render();
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', () => {
                currentPage = 1;
                render();
            });
        }

        if (pageSizeSelect) {
            pageSizeSelect.addEventListener('change', () => {
                currentPage = 1;
                toast(`Showing ${pageSizeSelect.value} clients per page.`, 'success');
                render();
            });
        }

        if (newClientButton) {
            newClientButton.addEventListener('click', promptAndCreateClient);
        }

        if (ghostCard) {
            ghostCard.addEventListener('click', promptAndCreateClient);
        }

        qsa('button', cardGrid).filter((button) => button.textContent.includes('View Profile')).forEach((button) => {
            button.addEventListener('click', () => {
                const card = button.closest('.group');
                const title = qs('h3', card)?.textContent.trim() || 'Client';
                const category = qsa('p', card).find((node) => node.className.includes('text-sm'))?.textContent.trim() || '';
                const details = qsa('span.text-lg', card).map((node) => node.textContent.trim());
                const relatedLeads = getLeadsForClient(title, category);
                openModal(
                    `${title} Profile`,
                    `<div class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div class="p-3 rounded-xl bg-slate-50"><p class="text-xs uppercase text-slate-400">Total Leads</p><p class="text-lg font-bold text-slate-900">${escapeHtml(details[0] || '0')}</p></div>
                            <div class="p-3 rounded-xl bg-slate-50"><p class="text-xs uppercase text-slate-400">Active Projects</p><p class="text-lg font-bold text-slate-900">${escapeHtml(details[1] || '0')}</p></div>
                        </div>
                        <div class="rounded-xl bg-slate-50 p-4">
                            <p class="text-xs uppercase text-slate-400 font-bold mb-3">Leads Under This Client</p>
                            ${relatedLeads.length ? `
                                <div class="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                                    ${relatedLeads.map((lead) => `
                                        <button type="button" class="client-lead-trigger w-full text-left rounded-xl bg-white border border-slate-200 p-3 hover:border-primary/30 hover:bg-blue-50/40 transition-colors" data-lead-id="${escapeHtml(lead.id)}">
                                            <div class="flex items-center justify-between gap-3">
                                                <div>
                                                    <p class="font-semibold text-slate-900">${escapeHtml(lead.company)}</p>
                                                    <p class="text-sm text-slate-500 mt-1">${escapeHtml(lead.contact)} • ${escapeHtml(lead.status)}</p>
                                                </div>
                                                <div class="text-right">
                                                    <p class="font-bold text-slate-900">${escapeHtml(formatMoney(lead.value, { currency: lead.currency }))}</p>
                                                    <p class="text-xs text-slate-500 mt-1">${escapeHtml(lead.owner)}</p>
                                                </div>
                                            </div>
                                        </button>
                                    `).join('')}
                                </div>
                            ` : '<p class="text-sm text-slate-500">No mapped leads yet for this client in the frontend data.</p>'}
                        </div>
                    </div>`
                );
                const overlay = document.body.lastElementChild;
                qsa('.client-lead-trigger', overlay).forEach((leadButton) => {
                    leadButton.addEventListener('click', () => {
                        const lead = findLeadById(leadButton.getAttribute('data-lead-id'));
                        if (!lead) {
                            toast('Lead details are not available yet.', 'warning');
                            return;
                        }
                        qs('.modal-close', overlay)?.click();
                        openLeadDetailModal(lead);
                    });
                });
            });
        });

        if (prevButton) {
            prevButton.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage -= 1;
                    render();
                }
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                currentPage += 1;
                render();
            });
        }

        numberButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                currentPage = index + 1;
                render();
            });
        });

        refreshTopStats();
        refreshSearchOptions();
        render();
    }

    function initReportsPage() {
        const searchInput = qs('input[placeholder="Search reports..."]');
        if (!searchInput) {
            return;
        }

        const dateTrigger = qs('#reports-date-trigger');
        const exportButton = qsa('button').find((button) => button.textContent.includes('Export Report'));
        const teamPerformanceButton = qsa('button').find((button) => button.textContent.includes('Download Team Performance'));
        const viewAllButton = qsa('button').find((button) => button.textContent.includes('View All Members'));
        const deepDiveButton = qsa('button').find((button) => button.textContent.includes('Generate Deep-Dive Comparison'));
        const ranges = [
            { label: 'Last 7 Days', kind: 'custom', from: new Date(Date.now() - (6 * 24 * 36e5)).toISOString().slice(0, 10), to: new Date().toISOString().slice(0, 10) },
            { label: 'Last 30 Days', kind: 'last30' },
            { label: 'Quarter to Date', kind: 'quarter' },
            { label: 'This Year', kind: 'year' }
        ];
        let activeRange = ranges[1];

        function rangeDisplayLabel(range) {
            if (range.kind === 'custom' && range.from && range.to) {
                return `${range.label}: ${range.from} - ${range.to}`;
            }
            return range.label;
        }

        function scopedAnalytics() {
            const filteredLeads = getAllLeads().filter((lead) => matchesDateRange(lead.date, activeRange));
            return computeAnalytics(filteredLeads, getAllClients());
        }

        function renderReports() {
            const analytics = scopedAnalytics();
            const metricLabels = qsa('p').filter((node) => [
                'Total Revenue Generated',
                'Avg. Deal Cycle',
                'Conversion Rate',
                'Lead-to-Qualified Ratio'
            ].includes(node.textContent.replace(/\s+/g, ' ').trim()));

            const avgDealCycleDays = analytics.wonLeads.length
                ? analytics.wonLeads.reduce((sum, lead) => sum + ((Date.now() - parseDateValue(lead.date).getTime()) / 86400000), 0) / analytics.wonLeads.length
                : 0;

            metricLabels.forEach((labelNode) => {
                const valueNode = qs('h2', labelNode.parentElement);
                if (!valueNode) {
                    return;
                }
                const label = labelNode.textContent.replace(/\s+/g, ' ').trim();
                if (label === 'Total Revenue Generated') {
                    valueNode.textContent = formatMoney(analytics.wonRevenue, { currency: analytics.commonCurrency });
                } else if (label === 'Avg. Deal Cycle') {
                    valueNode.textContent = `${Math.max(1, Math.round(avgDealCycleDays))} Days`;
                } else if (label === 'Conversion Rate') {
                    valueNode.textContent = formatPercent(analytics.winRate, 1);
                } else if (label === 'Lead-to-Qualified Ratio') {
                    valueNode.textContent = formatPercent(analytics.qualifiedRate, 1);
                }
            });

            const sourcePanel = qsa('h3').find((node) => node.textContent.trim() === 'Lead Source Distribution')?.parentElement;
            if (sourcePanel) {
                const buckets = qsa(':scope > div.space-y-6 > div', sourcePanel);
                buckets.forEach((bucket, index) => {
                    const source = analytics.sourceDistribution[index];
                    if (!source) {
                        bucket.style.display = 'none';
                        return;
                    }
                    bucket.style.display = '';
                    const labels = qsa('span', bucket);
                    setNodeText(labels[0], source.name);
                    setNodeText(labels[1], formatPercent(source.percent, 0));
                    const bar = qs('.h-full', bucket);
                    if (bar) {
                        bar.className = `h-full ${source.color} rounded-full`;
                        bar.style.width = `${Math.max(8, Math.round(source.percent))}%`;
                    }
                });
                const insight = qsa('p', sourcePanel).find((node) => node.textContent.includes('Inbound performance'));
                if (insight && analytics.sourceDistribution[0]) {
                    insight.textContent = `${analytics.sourceDistribution[0].name} is currently the top lead source, contributing ${formatPercent(analytics.sourceDistribution[0].percent, 1)} of active volume.`;
                }
            }

            const funnelPanel = qsa('h3').find((node) => node.textContent.trim() === 'Conversion Funnel Performance')?.closest('.lg\\:col-span-8') || qsa('h3').find((node) => node.textContent.trim() === 'Conversion Funnel Performance')?.parentElement?.parentElement;
            if (funnelPanel) {
                const stageRows = qsa('div.flex.items-center.gap-4', funnelPanel);
                analytics.funnel.forEach((stage, index) => {
                    const row = stageRows[index];
                    if (!row) {
                        return;
                    }
                    setNodeText(qsa('div', row)[0], stage.name);
                    const barFill = qsa('div', row)[2];
                    const countLabel = qs('span', row);
                    const percentLabel = qsa('div', row)[3];
                    if (barFill) {
                        barFill.style.width = `${Math.max(10, Math.round(stage.percent))}%`;
                    }
                    if (countLabel) {
                        const suffix = stage.name === 'Won' ? 'Deals' : stage.name === 'Proposal' ? 'Opportunities' : stage.name === 'Negotiation' ? 'Pipeline' : 'Leads';
                        countLabel.textContent = `${stage.count.toLocaleString('en-US')} ${suffix}`;
                    }
                    if (percentLabel) {
                        percentLabel.textContent = formatPercent(stage.percent, 0);
                    }
                });
            }

            const tbody = qs('tbody');
            if (tbody) {
                tbody.innerHTML = analytics.ownerRanking.map((entry) => `
                    <tr class="hover:bg-surface-container-low transition-colors group">
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 text-xs font-bold">${escapeHtml(entry.owner.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase())}</div>
                                <div>
                                    <p class="text-sm font-semibold text-on-surface">${escapeHtml(entry.owner)}</p>
                                    <p class="text-[10px] text-on-surface-variant uppercase">Revenue Team</p>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-sm">${entry.leadsManaged}</td>
                        <td class="px-6 py-4 text-sm">${entry.closedWon}</td>
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-2">
                                <span class="text-sm font-medium">${formatPercent(entry.winRate, 1)}</span>
                                <div class="w-12 h-1.5 bg-surface-container rounded-full overflow-hidden">
                                    <div class="h-full bg-emerald-500" style="width:${Math.max(8, Math.round(entry.winRate))}%"></div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-sm font-bold text-right">${escapeHtml(formatMoney(entry.revenueContributed, { currency: analytics.commonCurrency }))}</td>
                    </tr>
                `).join('');
            }

            if (dateTrigger) {
                const labelNode = qsa('span', dateTrigger)[1];
                setNodeText(labelNode, rangeDisplayLabel(activeRange));
            }
        }

        function filterRows() {
            const query = searchInput.value.trim().toLowerCase();
            qsa('tbody tr').filter((row) => row.querySelector('td')).forEach((row) => {
                row.style.display = !query || row.innerText.toLowerCase().includes(query) ? '' : 'none';
            });
        }

        searchInput.addEventListener('input', filterRows);

        if (dateTrigger) {
            dateTrigger.addEventListener('click', () => {
                openFormModal({
                    title: 'Report Date Range',
                    description: 'Choose the reporting window.',
                    submitLabel: 'Apply Range',
                    fields: [
                        { name: 'range', label: 'Range', type: 'select', value: activeRange.label, required: true, options: ranges.map((range) => range.label) }
                    ],
                    onSubmit: ({ range }) => {
                        activeRange = ranges.find((item) => item.label === range) || activeRange;
                        renderReports();
                        filterRows();
                        toast(`Report range switched to ${rangeDisplayLabel(activeRange)}.`, 'success');
                    }
                });
            });
        }

        if (exportButton) {
            exportButton.addEventListener('click', () => {
                const analytics = scopedAnalytics();
                const reportRows = [
                    ['Date Range', rangeDisplayLabel(activeRange)],
                    ['Total Revenue Generated', formatMoney(analytics.wonRevenue, { currency: analytics.commonCurrency })],
                    ['Average Deal Cycle', `${Math.max(1, Math.round(analytics.avgResponseHours / 2))} Days`],
                    ['Active Opportunities', String(analytics.activeLeads.length)],
                    ['Win Rate', formatPercent(analytics.winRate, 1)]
                ];
                downloadExcelTable('reports-summary.xls', ['Report Metric', 'Value'], reportRows, 'Reports Summary');
                toast('Main report exported as an Excel sheet.', 'success');
            });
        }

        if (teamPerformanceButton) {
            teamPerformanceButton.addEventListener('click', () => {
                const analytics = scopedAnalytics();
                const exportRows = analytics.ownerRanking.map((entry) => [
                    entry.owner,
                    entry.leadsManaged,
                    entry.closedWon,
                    formatPercent(entry.winRate, 1),
                    formatMoney(entry.revenueContributed, { currency: analytics.commonCurrency })
                ]);
                downloadExcelTable('team-performance-report.xls', ['Sales Representative', 'Leads Managed', 'Closed Won', 'Win Rate', 'Revenue Contributed'], exportRows, 'Team Performance');
                toast('Team performance report downloaded.', 'success');
            });
        }

        if (viewAllButton) {
            viewAllButton.addEventListener('click', () => {
                searchInput.value = '';
                filterRows();
                qs('table')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        }

        if (deepDiveButton) {
            let sortedDescending = true;
            deepDiveButton.addEventListener('click', () => {
                const tbody = qs('tbody');
                const sorted = qsa('tbody tr')
                    .slice()
                    .sort((a, b) => {
                        const aRevenue = Number(qsa('td', a)[4].innerText.replace(/[^0-9.]/g, ''));
                        const bRevenue = Number(qsa('td', b)[4].innerText.replace(/[^0-9.]/g, ''));
                        return sortedDescending ? bRevenue - aRevenue : aRevenue - bRevenue;
                    });
                sorted.forEach((row) => tbody.appendChild(row));
                sortedDescending = !sortedDescending;
                toast('Team ranking comparison refreshed.', 'success');
            });
        }

        renderReports();
        filterRows();
    }

    function initProfilePage() {
        const profile = getProfile();
        const heading = qsa('h1, h2').find((node) => node.textContent.includes('Alex Sterling') || node.textContent.includes('Profile'));
        const editButton = qsa('button').find((button) => button.textContent.includes('Edit Profile'));
        const saveButton = qsa('button').find((button) => button.textContent.includes('Save Profile') || button.textContent.includes('Save Preferences'));
        const copyEmailButton = qsa('button').find((button) => button.textContent.includes('Copy Email'));
        const textInputs = qsa('input, textarea').filter((field) => !['checkbox'].includes(field.type));

        if (heading) {
            heading.textContent = profile.name;
        }

        const profileBindings = {
            '[data-profile="name"]': profile.name,
            '[data-profile="role"]': profile.role,
            '[data-profile="email"]': profile.email,
            '[data-profile="phone"]': profile.phone,
            '[data-profile="location"]': profile.location,
            '[data-profile="bio"]': profile.bio,
            '[data-profile="focus"]': profile.focus,
            '[data-profile="initials"]': profile.initials
        };

        Object.entries(profileBindings).forEach(([selector, value]) => {
            const node = qs(selector);
            if (node) {
                if ('value' in node) {
                    node.value = value;
                } else {
                    node.textContent = value;
                }
            }
        });

        function syncProfileView() {
            const bindings = {
                '[data-profile="name"]': profile.name,
                '[data-profile="role"]': profile.role,
                '[data-profile="email"]': profile.email,
                '[data-profile="phone"]': profile.phone,
                '[data-profile="location"]': profile.location,
                '[data-profile="bio"]': profile.bio,
                '[data-profile="focus"]': profile.focus,
                '[data-profile="initials"]': profile.initials
            };

            Object.entries(bindings).forEach(([selector, value]) => {
                qsa(selector).forEach((node) => {
                    if ('value' in node) {
                        node.value = value;
                    } else {
                        node.textContent = value;
                    }
                });
            });
        }

        if (editButton) {
            editButton.addEventListener('click', () => {
                openFormModal({
                    title: 'Edit Profile',
                    description: 'Update the primary details shown across the workspace.',
                    submitLabel: 'Save Profile',
                    fields: [
                        { name: 'name', label: 'Full Name', value: profile.name, required: true },
                        { name: 'email', label: 'Email', type: 'email', value: profile.email, required: true },
                        { name: 'role', label: 'Role', value: profile.role, required: true },
                        { name: 'phone', label: 'Phone', value: profile.phone, required: true },
                        { name: 'location', label: 'Location', value: profile.location, required: true },
                        { name: 'focus', label: 'Focus Area', value: profile.focus, required: true },
                        { name: 'bio', label: 'Bio', type: 'textarea', value: profile.bio, required: true }
                    ],
                    onSubmit: ({ name, email, role, phone, location, focus, bio }) => {
                        profile.name = name;
                        profile.email = email;
                        profile.role = role;
                        profile.phone = phone;
                        profile.location = location;
                        profile.focus = focus;
                        profile.bio = bio;
                        profile.initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
                        setProfile(profile);
                        syncProfileView();
                        toast('Profile details updated.', 'success');
                    }
                });
            });
        }

        if (saveButton) {
            saveButton.addEventListener('click', () => {
                const [emailInput, phoneInput, locationInput, focusInput, bioInput] = textInputs;
                profile.email = emailInput?.value.trim() || profile.email;
                profile.phone = phoneInput?.value.trim() || profile.phone;
                profile.location = locationInput?.value.trim() || profile.location;
                profile.focus = focusInput?.value.trim() || profile.focus;
                profile.bio = bioInput?.value.trim() || profile.bio;
                setProfile(profile);
                syncProfileView();
                toast('Profile saved successfully.', 'success');
            });
        }

        if (copyEmailButton) {
            copyEmailButton.addEventListener('click', () => {
                copyText(profile.email).then(() => toast('Email copied to clipboard.', 'success'));
            });
        }

    }

    function initSettingsPage() {
        const addUserButton = qsa('button').find((button) => button.textContent.includes('Add User'));
        const userTableBody = qs('tbody');
        const stageCards = qsa('#lead-stages .group');
        const stageSettingsButton = qsa('button').find((button) => button.querySelector('[data-icon="settings_suggest"]'));
        const notificationCheckboxes = qsa('input.sr-only.peer');
        const settings = getStored(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
        const users = getStored(STORAGE_KEYS.users, []);
        const storedStages = getStored(STORAGE_KEYS.stages, null);

        if (users.length && userTableBody) {
            users.forEach((user) => {
                const row = document.createElement('tr');
                row.className = 'hover:bg-surface-container-low/30 transition-colors';
                row.innerHTML = `
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">${escapeHtml(user.initials)}</div>
                            <div>
                                <p class="text-sm font-semibold">${escapeHtml(user.name)}</p>
                                <p class="text-xs text-on-surface-variant">${escapeHtml(user.email)}</p>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-surface-container-high text-on-surface-variant uppercase">${escapeHtml(user.role)}</span>
                    </td>
                    <td class="px-6 py-4 text-right">
                        <button class="text-on-surface-variant hover:text-primary transition-colors">
                            <span class="material-symbols-outlined">more_vert</span>
                        </button>
                    </td>
                `;
                userTableBody.appendChild(row);
            });
        }

        if (storedStages && storedStages.length && stageCards.length) {
            stageCards.forEach((card, index) => {
                const label = qsa('span', card).find((span) => span.className.includes('flex-1'));
                if (label && storedStages[index]) {
                    label.textContent = storedStages[index];
                }
            });
        }

        notificationCheckboxes.forEach((checkbox, index) => {
            const keys = ['newLeadActivity', 'stageChanges', 'weeklyReport'];
            checkbox.checked = Boolean(settings.notifications[keys[index]]);
            checkbox.addEventListener('change', () => {
                settings.notifications[keys[index]] = checkbox.checked;
                setStored(STORAGE_KEYS.settings, settings);
                toast('Notification preferences updated.', 'success');
            });
        });

        if (addUserButton && userTableBody) {
            addUserButton.addEventListener('click', () => {
                openFormModal({
                    title: 'Add User',
                    description: 'Invite a teammate into the workspace.',
                    submitLabel: 'Add User',
                    fields: [
                        { name: 'name', label: 'Full Name', required: true, placeholder: 'e.g. Sarah Chen' },
                        { name: 'email', label: 'Email Address', required: true, placeholder: 'sarah.chen@grassroots.ai' },
                        { name: 'role', label: 'Role', value: 'Lead Manager', required: true }
                    ],
                    onSubmit: ({ name, email, role }) => {
                        const newUser = {
                            name,
                            email,
                            role,
                            initials: name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
                        };
                        const storedUsers = getStored(STORAGE_KEYS.users, []);
                        storedUsers.push(newUser);
                        setStored(STORAGE_KEYS.users, storedUsers);
                        toast(`${name} added to the team.`, 'success');
                        window.location.reload();
                    }
                });
            });
        }

        qsa('tbody button').forEach((button) => {
            button.addEventListener('click', () => {
                const row = button.closest('tr');
                const userName = qsa('td', row)[0]?.innerText.trim().split('\n')[0] || 'User';
                toast(`User actions opened for ${userName}.`, 'success');
            });
        });

        const stageContainer = qs('#lead-stages .space-y-3');

        if (stageSettingsButton && stageContainer) {
            stageSettingsButton.addEventListener('click', () => {
                openFormModal({
                    title: 'Add Pipeline Stage',
                    description: 'Create a new stage in the sales cycle.',
                    submitLabel: 'Add Stage',
                    fields: [
                        { name: 'label', label: 'Stage Name', value: 'Negotiation', required: true }
                    ],
                    onSubmit: ({ label }) => {
                        const card = document.createElement('div');
                        card.className = 'group flex items-center gap-4 p-4 rounded-xl border border-outline-variant/20 hover:border-primary/30 hover:bg-surface-container-low transition-all';
                        card.innerHTML = `
                            <span class="material-symbols-outlined text-on-surface-variant cursor-grab active:cursor-grabbing">drag_indicator</span>
                            <div class="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                            <span class="flex-1 text-sm font-medium">${escapeHtml(label)}</span>
                            <div class="opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-opacity">
                                <button class="p-1 hover:text-primary transition-colors"><span class="material-symbols-outlined text-sm">edit</span></button>
                                <button class="p-1 hover:text-error transition-colors"><span class="material-symbols-outlined text-sm">delete</span></button>
                            </div>
                        `;
                        stageContainer.appendChild(card);
                        setStored(STORAGE_KEYS.stages, qsa('#lead-stages .group .flex-1').map((node) => node.textContent.trim()));
                        toast(`${label} stage added.`, 'success');
                    }
                });
            });
        }

        if (stageContainer) {
            stageContainer.addEventListener('click', (event) => {
                const button = event.target.closest('button');
                if (!button) {
                    return;
                }
                const card = button.closest('.group');
                const label = qsa('span', card).find((span) => span.className.includes('flex-1'));
                if (!label) {
                    return;
                }
                const icon = button.querySelector('.material-symbols-outlined')?.textContent.trim();
                if (icon === 'edit') {
                    openFormModal({
                        title: 'Rename Pipeline Stage',
                        submitLabel: 'Save Name',
                        fields: [
                            { name: 'label', label: 'Stage Name', value: label.textContent.trim(), required: true }
                        ],
                        onSubmit: ({ label: nextLabel }) => {
                            label.textContent = nextLabel;
                            setStored(STORAGE_KEYS.stages, qsa('#lead-stages .group .flex-1').map((node) => node.textContent.trim()));
                            toast('Pipeline stage updated.', 'success');
                        }
                    });
                } else if (icon === 'delete') {
                    if (qsa('#lead-stages .group').length <= 1) {
                        toast('At least one stage needs to remain.', 'warning');
                        return;
                    }
                    card.remove();
                    setStored(STORAGE_KEYS.stages, qsa('#lead-stages .group .flex-1').map((node) => node.textContent.trim()));
                    toast('Pipeline stage removed.', 'success');
                }
            });
        }

    }

    document.addEventListener('DOMContentLoaded', () => {
        initCommon();
        initLoginPage();

        const currentPage = pageName();
        if (currentPage === 'dashboard.html') {
            initDashboardPage();
        } else if (currentPage === 'add_lead.html') {
            initAddLeadPage();
        } else if (currentPage === 'manage_leads.html') {
            initManageLeadsPage();
        } else if (currentPage === 'review_leads.html') {
            initReviewLeadsPage();
        } else if (currentPage === 'clients.html') {
            initClientsPage();
        } else if (currentPage === 'reports.html') {
            initReportsPage();
        } else if (currentPage === 'profile.html') {
            initProfilePage();
        } else if (currentPage === 'settings.html') {
            initSettingsPage();
        }
    });
})();

