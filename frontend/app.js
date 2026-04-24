(() => {
    const STORAGE_KEYS = {
        authToken: 'grassroots_auth_token',
        sessionExpiresAt: 'grassroots_session_expires_at',
        notificationsSeenAt: 'grassroots_notifications_seen_at',
        addLeadDraft: 'grassroots_add_lead_draft'
    };

    const SESSION_FLAGS = {
        logoutGuard: 'grassroots_logout_guard'
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
        name: '',
        role: '',
        email: '',
        phone: '',
        location: '',
        bio: '',
        focus: '',
        initials: '',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkuZOcjt-C24EHkEMkzVMN0gxkiVqTeCUuU-sqs3lyHwyYKwjYOxZ6GG_okwlao8iia3eX3flUy8W0zIXcZj25dY6YzKo8hnPHjN0RXxZm97kK0Qttd6Sagb6er_ZkQVm9x_2Bzk23bf5BAHxWdCMObQRiBsiDnQzGdTPNatULdFoUeRn489INMgrx7AoEOOeqEqvtb0V0ap54vhEx0PBegSZySyYgcwzwUfrkCDliuZZSp1CjuiZsIeAkUjqU6tbEo5t3Z0pgDwRD'
    };

    function buildCorporateAvatar(options = {}) {
        const background = options.background || '#e6eef8';
        const accent = options.accent || '#c9d8ee';
        const shirt = options.shirt || '#345f9d';
        const tie = options.tie || '#1f3f72';
        const skin = options.skin || '#d7a07b';
        const hair = options.hair || '#2c3440';
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Corporate profile avatar">
                <rect width="128" height="128" rx="64" fill="${background}"/>
                <circle cx="64" cy="64" r="56" fill="${accent}" opacity="0.6"/>
                <path d="M31 112c5-20 18-31 33-31s28 11 33 31" fill="${shirt}"/>
                <path d="M56 86h16l-3 17H59z" fill="${tie}"/>
                <path d="M64 78c-13 0-24-11-24-25s11-25 24-25 24 11 24 25-11 25-24 25z" fill="${skin}"/>
                <path d="M40 50c0-18 12-29 24-29s24 11 24 29c-4-6-11-10-18-10-10 0-17 5-22 12-5-1-8-1-8-2z" fill="${hair}"/>
                <circle cx="55" cy="56" r="2.2" fill="#2b211d"/>
                <circle cx="73" cy="56" r="2.2" fill="#2b211d"/>
                <path d="M58 66c3 2 9 2 12 0" fill="none" stroke="#8b5e3c" stroke-width="2.4" stroke-linecap="round"/>
            </svg>
        `;
        return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}`;
    }

    const USER_AVATARS = {
        'anitha': DEFAULT_PROFILE.avatar,
        'sudhir reddy': buildCorporateAvatar({
            background: '#ebf1f7',
            accent: '#c7d7ea',
            shirt: '#315c92',
            tie: '#1e3d6b',
            skin: '#d3a07e',
            hair: '#2a313d'
        }),
        'vijay': buildCorporateAvatar({
            background: '#edf3f8',
            accent: '#d2dff0',
            shirt: '#416d9e',
            tie: '#274a78',
            skin: '#c9926d',
            hair: '#313847'
        }),
        'sukeerthi manohar': buildCorporateAvatar({
            background: '#eef2f7',
            accent: '#d7e1ee',
            shirt: '#365985',
            tie: '#213e64',
            skin: '#cf9a76',
            hair: '#27303b'
        })
    };

    const DEFAULT_LOCATION = {
        label: 'San Francisco, CA',
        lat: '37.7749',
        lng: '-122.4194'
    };

    const statusCycle = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Deal Won', 'Deal Lost'];
    const lifecycleCycle = ['Active', 'Hold'];
    const DISPLAY_CURRENCY = 'INR';
    const PAGE_ROUTES = {
        'index.html': '',
        'login.html': 'login',
        'dashboard.html': 'dashboard',
        'owner_leads.html': 'owner-leads',
        'add_lead.html': 'add-lead',
        'review_leads.html': 'review-leads',
        'manage_leads.html': 'manage-leads',
        'clients.html': 'clients',
        'reports.html': 'reports',
        'profile.html': 'profile'
    };

    function resolveApiBaseUrl() {
        const configuredBase = String(window.GRASSROOTS_CONFIG?.apiBaseUrl || '').trim().replace(/\/$/, '');
        if (configuredBase) {
            return configuredBase.endsWith('/api') ? configuredBase : `${configuredBase}/api`;
        }
        if (window.location.protocol === 'file:') {
            return 'http://localhost:3000/api';
        }
        if (window.location.hostname.endsWith('github.io')) {
            return '';
        }
        return `${window.location.origin}/api`;
    }

    const API_BASE_URL = resolveApiBaseUrl();

    const APP_STATE = {
        leads: null,
        clients: null,
        users: null,
        ownerTargetSummaries: null,
        settings: null,
        profile: { ...DEFAULT_PROFILE },
        currentLocation: { ...DEFAULT_LOCATION },
        hydrated: false
    };

    function daysAgo(days) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date.toISOString();
    }

    const DEFAULT_LEADS = [];

    const DEFAULT_TEAM_USERS = [];

    const DEFAULT_CLIENTS = [];

    const DEFAULT_LEAD_COMMENTS = {};

    const DEFAULT_LEAD_LOCATIONS = {};

    function qs(selector, scope = document) {
        return scope.querySelector(selector);
    }

    function qsa(selector, scope = document) {
        return Array.from(scope.querySelectorAll(selector));
    }

    function cleanRouteEnabled() {
        return ['localhost', '127.0.0.1'].includes(window.location.hostname);
    }

    function normalizePageKey(value) {
        const raw = String(value || '').trim().toLowerCase().replace(/^\/+|\/+$/g, '');
        if (!raw) {
            return 'index.html';
        }
        if (raw.endsWith('.html')) {
            return raw;
        }
        const match = Object.entries(PAGE_ROUTES).find(([, route]) => route === raw);
        return match ? match[0] : `${raw}.html`;
    }

    function routePath(page) {
        const key = normalizePageKey(page);
        const route = PAGE_ROUTES[key];
        if (cleanRouteEnabled() && typeof route === 'string') {
            return route ? `/${route}` : '/';
        }
        return key;
    }

    function pageName() {
        const parts = window.location.pathname.split('/');
        return normalizePageKey(parts[parts.length - 1] || '');
    }

    function toast(message, type = 'info') {
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
        }
    }

    function backendUnavailableMessage() {
        if (!API_BASE_URL) {
            return 'Backend API is not configured for this site yet. Add your deployed backend URL in frontend/config.js.';
        }
        return 'The backend service is unavailable right now. Please try again in a moment.';
    }

    function getStored(_key, fallback) {
        return fallback;
    }

    function setStored(_key, value) {
        return value;
    }

    function getAuthToken() {
        return sessionStorage.getItem(STORAGE_KEYS.authToken) || '';
    }

    function setAuthToken(token) {
        if (token) {
            sessionStorage.setItem(STORAGE_KEYS.authToken, token);
        } else {
            sessionStorage.removeItem(STORAGE_KEYS.authToken);
        }
    }

    function getSessionExpiresAt() {
        return sessionStorage.getItem(STORAGE_KEYS.sessionExpiresAt) || '';
    }

    function setSessionExpiresAt(value) {
        if (value) {
            sessionStorage.setItem(STORAGE_KEYS.sessionExpiresAt, value);
        } else {
            sessionStorage.removeItem(STORAGE_KEYS.sessionExpiresAt);
        }
    }

    function clearAuthState() {
        setAuthToken('');
        setSessionExpiresAt('');
        APP_STATE.hydrated = false;
        APP_STATE.leads = null;
        APP_STATE.clients = null;
        APP_STATE.users = null;
        APP_STATE.ownerTargetSummaries = null;
        APP_STATE.settings = null;
        APP_STATE.profile = { ...DEFAULT_PROFILE };
        APP_STATE.currentLocation = { ...DEFAULT_LOCATION };
        sessionStorage.removeItem('grassroots_target_review_lead');
        clearAddLeadDraft();
        sessionStorage.setItem(SESSION_FLAGS.logoutGuard, 'true');
    }

    function enforceSessionGuard() {
        const currentPage = pageName();
        const isAuthPage = currentPage === 'login.html' || currentPage === 'index.html';
        const sessionExpiresAt = getSessionExpiresAt();

        if (sessionExpiresAt && Date.parse(sessionExpiresAt) <= Date.now()) {
            clearAuthState();
        }

        if (!isAuthPage && !getAuthToken()) {
            window.location.replace(routePath('Login.html'));
            return { allowed: false, currentPage, isAuthPage };
        }

        return { allowed: true, currentPage, isAuthPage };
    }

    function resolveProfileAvatar(user, existingProfile = {}) {
        const normalizedName = String(user?.name || existingProfile.name || '').trim().toLowerCase();
        if (normalizedName && USER_AVATARS[normalizedName]) {
            return USER_AVATARS[normalizedName];
        }

        const explicitAvatar = String(user?.avatar || '').trim();
        if (explicitAvatar) {
            return explicitAvatar;
        }

        return existingProfile.avatar || DEFAULT_PROFILE.avatar;
    }

    function applyProfileFromUser(user, existingProfile = getProfile()) {
        const resolvedName = String(user?.name || existingProfile.name || '').trim();
        return {
            ...DEFAULT_PROFILE,
            ...existingProfile,
            id: user?.id || existingProfile.id,
            name: resolvedName,
            role: user?.role || existingProfile.role || '',
            email: user?.email || existingProfile.email || '',
            phone: user?.phone || existingProfile.phone || '',
            location: user?.location || existingProfile.location || '',
            bio: user?.bio || existingProfile.bio || '',
            focus: user?.focus || existingProfile.focus || '',
            initials: resolvedName
                ? resolvedName.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
                : (existingProfile.initials || ''),
            avatar: resolveProfileAvatar(user, existingProfile)
        };
    }

    async function apiRequest(path, options = {}) {
        if (!API_BASE_URL) {
            throw new Error(backendUnavailableMessage());
        }
        const headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
        const token = getAuthToken();
        if (token && !headers.Authorization) {
            headers.Authorization = 'Bearer ' + token;
        }
        let response;
        try {
            response = await fetch(API_BASE_URL + path, Object.assign({}, options, { headers }));
        } catch (error) {
            throw new Error(backendUnavailableMessage());
        }
        if (!response.ok) {
            const payload = await response.json().catch(() => ({}));
            if (response.status === 401 && path !== '/auth/login') {
                clearAuthState();
                const currentPage = pageName();
                if (!['login.html', 'index.html'].includes(currentPage)) {
                    window.location.replace(routePath('Login.html'));
                }
            }
            throw new Error(payload.message || backendUnavailableMessage());
        }
        if (response.status === 204) {
            return null;
        }
        return response.json();
    }

    async function refreshOwnerTargetSummaries() {
        if (!getAuthToken()) {
            return Array.isArray(APP_STATE.ownerTargetSummaries) ? APP_STATE.ownerTargetSummaries : [];
        }
        try {
            const ownerTargetSummaries = await apiRequest('/owner-targets/summary');
            APP_STATE.ownerTargetSummaries = Array.isArray(ownerTargetSummaries) ? ownerTargetSummaries : [];
        } catch (error) {
            APP_STATE.ownerTargetSummaries = Array.isArray(APP_STATE.ownerTargetSummaries) ? APP_STATE.ownerTargetSummaries : [];
        }
        return APP_STATE.ownerTargetSummaries;
    }

    async function hydrateBackendState() {
        if (APP_STATE.hydrated || !getAuthToken()) {
            return APP_STATE;
        }
        try {
            const [leads, clients, users, ownerTargetSummaries] = await Promise.all([
                apiRequest('/leads').catch(() => []),
                apiRequest('/clients').catch(() => []),
                apiRequest('/users').catch(() => []),
                refreshOwnerTargetSummaries().catch(() => [])
            ]);
            APP_STATE.leads = Array.isArray(leads) ? leads : [];
            APP_STATE.clients = Array.isArray(clients) ? clients : [];
            APP_STATE.users = Array.isArray(users) ? users : [];
            APP_STATE.ownerTargetSummaries = Array.isArray(ownerTargetSummaries) ? ownerTargetSummaries : [];
            APP_STATE.hydrated = true;
            void enrichLeadLocationLabels();
        } catch (error) {
            APP_STATE.hydrated = false;
        }
        return APP_STATE;
    }

    function getProfile() {
        return Object.assign({}, DEFAULT_PROFILE, APP_STATE.profile || {});
    }

    function setProfile(profile) {
        APP_STATE.profile = Object.assign({}, DEFAULT_PROFILE, profile || {});
        return APP_STATE.profile;
    }

    async function syncProfileFromBackend() {
        let profile = getProfile();
        if (!getAuthToken()) {
            return profile;
        }
        try {
            const remoteProfile = await apiRequest('/auth/me');
            profile = applyProfileFromUser(remoteProfile, profile);
            setProfile(profile);
        } catch (error) {
            APP_STATE.profile = profile;
        }
        return profile;
    }

    async function getWorkspaceSettings() {
        const currentSettings = APP_STATE.settings || DEFAULT_SETTINGS;
        if (!getAuthToken()) {
            return currentSettings;
        }
        try {
            const remoteSettings = await apiRequest('/settings');
            const merged = {
                ...DEFAULT_SETTINGS,
                ...currentSettings,
                ...remoteSettings,
                notifications: {
                    ...DEFAULT_SETTINGS.notifications,
                    ...(currentSettings.notifications || {}),
                    ...(remoteSettings.notifications || {})
                },
                stages: Array.isArray(remoteSettings.stages)
                    ? remoteSettings.stages
                    : currentSettings.stages
            };
            APP_STATE.settings = merged;
            return merged;
        } catch (error) {
            return currentSettings;
        }
    }

    async function saveWorkspaceSettings(patch) {
        const current = APP_STATE.settings || await getWorkspaceSettings();
        const next = {
            ...current,
            ...patch,
            notifications: {
                ...(current.notifications || {}),
                ...((patch && patch.notifications) || {})
            },
            stages: Array.isArray(patch?.stages) ? patch.stages : current.stages
        };
        APP_STATE.settings = next;
        try {
            const saved = await apiRequest('/settings', {
                method: 'PATCH',
                body: JSON.stringify(patch)
            });
            const merged = {
                ...next,
                ...saved,
                notifications: {
                    ...(next.notifications || {}),
                    ...((saved && saved.notifications) || {})
                }
            };
            APP_STATE.settings = merged;
            return merged;
        } catch (error) {
            return next;
        }
    }

    function getCurrentLocation() {
        return Object.assign({}, DEFAULT_LOCATION, APP_STATE.currentLocation || {});
    }

    function setCurrentLocation(location) {
        APP_STATE.currentLocation = Object.assign({}, DEFAULT_LOCATION, location || {});
    }

    function getLeadOverrides() {
        return {};
    }

    function setLeadOverrides(overrides) {
        return overrides;
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
        const locale = currency === 'INR' ? 'en-IN' : 'en-US';
        return `${symbol}${amount.toLocaleString(locale, { maximumFractionDigits: 0 })}`;
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

    function formatDateKey(value) {
        const date = parseDateValue(value);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function daysSinceDate(value) {
        const target = parseDateValue(value);
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const startOfTarget = new Date(target);
        startOfTarget.setHours(0, 0, 0, 0);
        return Math.max(0, Math.floor((startOfToday - startOfTarget) / 86400000));
    }

    function looksLikeCoordinateLabel(value) {
        return /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(String(value || '').trim());
    }

    function normalizeLocation(location) {
        const source = location && typeof location === 'object' ? { ...location } : {};
        const lat = source.lat ?? DEFAULT_LOCATION.lat;
        const lng = source.lng ?? DEFAULT_LOCATION.lng;
        const addressParts = [
            source.name,
            source.address,
            source.locality,
            source.city,
            source.state,
            source.country
        ].map((part) => String(part || '').trim()).filter(Boolean);

        let label = String(source.label || '').trim();
        if (!label || looksLikeCoordinateLabel(label)) {
            if (addressParts.length) {
                label = addressParts.join(', ');
            } else if (source.formattedAddress) {
                label = String(source.formattedAddress).trim();
            } else if (source.displayName) {
                label = String(source.displayName).trim();
            }
        }

        if (!label) {
            label = DEFAULT_LOCATION.label;
        }

        return {
            ...DEFAULT_LOCATION,
            ...source,
            lat: String(lat),
            lng: String(lng),
            label
        };
    }

    async function reverseGeocodeLocation(lat, lng) {
        const latitude = Number(lat);
        const longitude = Number(lng);
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || typeof fetch !== 'function') {
            return null;
        }

        try {
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&localityLanguage=en`);
            if (!response.ok) {
                return null;
            }

            const payload = await response.json();
            const locality = String(payload.locality || '').trim();
            const city = String(payload.city || locality).trim();
            const state = String(payload.principalSubdivision || '').trim();
            const country = String(payload.countryName || '').trim();
            const label = [locality || city, state, country].filter(Boolean).join(', ');
            if (!label) {
                return null;
            }

            return {
                label,
                locality: locality || city,
                city: city || locality,
                state,
                country,
                formattedAddress: label
            };
        } catch (error) {
            return null;
        }
    }

    async function reverseGeocodeLocation(lat, lng) {
        const latitude = Number(lat);
        const longitude = Number(lng);
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || typeof fetch !== 'function') {
            return null;
        }

        try {
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&localityLanguage=en`);
            if (!response.ok) {
                return null;
            }

            const payload = await response.json();
            const locality = String(payload.locality || '').trim();
            const city = String(payload.city || locality).trim();
            const state = String(payload.principalSubdivision || '').trim();
            const country = String(payload.countryName || '').trim();
            const label = [locality || city, state, country].filter(Boolean).join(', ');

            if (!label) {
                return null;
            }

            return {
                label,
                locality: locality || city,
                city: city || locality,
                state,
                country,
                formattedAddress: label
            };
        } catch (error) {
            return null;
        }
    }

    function getNotificationsSeenAt() {
        return sessionStorage.getItem(STORAGE_KEYS.notificationsSeenAt) || '';
    }

    function setNotificationsSeenAt(value) {
        if (value) {
            sessionStorage.setItem(STORAGE_KEYS.notificationsSeenAt, value);
        } else {
            sessionStorage.removeItem(STORAGE_KEYS.notificationsSeenAt);
        }
    }

    function getAddLeadDraft() {
        const raw = sessionStorage.getItem(STORAGE_KEYS.addLeadDraft);
        if (!raw) {
            return {};
        }
        try {
            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch (error) {
            return {};
        }
    }

    function setAddLeadDraft(patch = {}) {
        const next = {
            ...getAddLeadDraft(),
            ...patch
        };
        sessionStorage.setItem(STORAGE_KEYS.addLeadDraft, JSON.stringify(next));
        return next;
    }

    function clearAddLeadDraft() {
        sessionStorage.removeItem(STORAGE_KEYS.addLeadDraft);
    }

    function buildIntelligenceFeedMarkup(items, options = {}) {
        const emptyMessage = options.emptyMessage || 'New leads, comments, owner changes, and status updates will show up here.';
        const compact = Boolean(options.compact);
        const containerClass = compact ? 'space-y-3' : 'relative space-y-8 before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100';
        if (!Array.isArray(items) || !items.length) {
            return `
                <div class="${containerClass}">
                    <div class="relative pl-12 flex items-start">
                        <div class="absolute left-0 w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center ring-4 ring-white z-10">
                            <span class="material-symbols-outlined text-white text-sm">info</span>
                        </div>
                        <div class="flex-1">
                            <p class="text-sm font-medium text-slate-900">No recent activity yet</p>
                            <p class="text-xs text-slate-500 mt-1">${escapeHtml(emptyMessage)}</p>
                            <span class="text-[10px] font-bold text-slate-400 mt-2 block uppercase">Waiting for updates</span>
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="${containerClass}">
                ${items.map((item) => {
                    const visuals = activityVisuals(item.type);
                    return `
                        <div class="relative pl-12 flex items-start">
                            <div class="absolute left-0 w-8 h-8 rounded-full ${visuals.bg} flex items-center justify-center ring-4 ring-white z-10">
                                <span class="material-symbols-outlined text-sm ${visuals.iconClass || 'text-white'}">${visuals.icon}</span>
                            </div>
                            <div class="flex-1">
                                <p class="text-sm font-medium text-slate-900">${escapeHtml(item.label)}${item.company ? ` for <span class="text-primary">${escapeHtml(item.company)}</span>` : ''}</p>
                                <p class="text-xs text-slate-500 mt-1">${escapeHtml(item.actor)}${item.metadata?.comment ? ` • ${escapeHtml(item.metadata.comment)}` : ''}</p>
                                <span class="text-[10px] font-bold text-slate-400 mt-2 block uppercase">${escapeHtml(formatRelativeTime(item.createdAt))}</span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    function markNotificationsViewed(items) {
        const latestCreatedAt = Array.isArray(items) && items.length ? items[0].createdAt : new Date().toISOString();
        setNotificationsSeenAt(latestCreatedAt);
    }

    function broadcastActivityChange() {
        window.dispatchEvent(new CustomEvent('grassroots:activity-updated'));
    }

    function normalizeLead(lead, index = 0) {
        const businessUnit = String(lead.businessUnit || lead.business_unit || lead.company || lead.clientName || lead.client_name || `Lead ${index + 1}`).trim();
        const clientName = String(lead.clientName || lead.client_name || businessUnit || `Lead ${index + 1}`).trim();
        const rawStatus = String(lead.status || '').trim();
        const resolvedStatus = statusCycle.includes(rawStatus) ? rawStatus : ({
            'deal won': 'Deal Won',
            'deal lost': 'Deal Lost',
            'negotiation': 'Negotiation',
            'proposal': 'Proposal',
            'qualification': 'Qualification',
            'prospecting': 'Prospecting'
        }[normalizeStatus(rawStatus)] || 'Prospecting');
        const explicitLifecycle = String(lead.lifecycle || lead.state || '').trim();
        const inferredHold = /hold|nurtur/i.test(explicitLifecycle) || /hold|nurtur/i.test(rawStatus);
        const resolvedLifecycle = isClosedStatus(resolvedStatus)
            ? 'Closed'
            : ({ hold: 'Hold', active: 'Active' }[normalizeLifecycle(explicitLifecycle)] || (inferredHold ? 'Hold' : 'Active'));
        const normalizedComments = Array.isArray(lead.comments)
            ? lead.comments.map((comment, commentIndex) => {
                if (typeof comment === 'string') {
                    return {
                        id: `legacy-comment-${index}-${commentIndex}`,
                        body: comment,
                        author: String(lead.owner || 'Team').trim(),
                        createdAt: lead.date || new Date().toISOString()
                    };
                }

                return {
                    id: String(comment.id || `comment-${index}-${commentIndex}`),
                    body: String(comment.body || '').trim(),
                    author: String(comment.author || lead.owner || 'Team').trim(),
                    createdAt: comment.createdAt || lead.date || new Date().toISOString()
                };
            }).filter((comment) => comment.body)
            : [];
        const normalizedActivity = Array.isArray(lead.activity)
            ? lead.activity.map((item, activityIndex) => ({
                id: String(item.id || `activity-${index}-${activityIndex}`),
                type: String(item.type || 'update').trim(),
                label: String(item.label || 'Lead updated').trim(),
                actor: String(item.actor || lead.owner || 'System').trim(),
                createdAt: item.createdAt || lead.date || new Date().toISOString(),
                metadata: item.metadata && typeof item.metadata === 'object' ? { ...item.metadata } : {}
            }))
            : [];
        return {
            id: String(lead.id || `LD-${9000 + index}`),
            businessUnit,
            company: businessUnit,
            opportunityName: String(lead.opportunityName || lead.opportunity_name || '').trim(),
            clientName,
            contact: String(lead.contact || 'Unknown Contact').trim(),
            phone: String(lead.phone || '').trim(),
            email: String(lead.email || '').trim(),
            owner: String(lead.owner || 'Anitha').trim(),
            source: String(lead.source || 'Inbound Marketing').trim(),
            industry: String(lead.industry || lead.lob || 'General').trim(),
            lob: String(lead.lob || lead.industry || 'General').trim(),
            website: String(lead.website || '').trim(),
            value: parseNumericValue(lead.value),
            currency: normalizeCurrency(lead.currency),
            status: resolvedStatus,
            lifecycle: resolvedLifecycle,
            state: resolvedLifecycle,
            progress: Number.isFinite(Number(lead.progress)) ? Number(lead.progress) : 25,
            nextAction: String(lead.nextAction || '').trim(),
            description: String(lead.description || '').trim(),
            publisher: String(lead.publisher || lead.owner || 'Grassroots').trim(),
            date: lead.date || new Date().toISOString(),
            location: lead.location ? normalizeLocation(lead.location) : getLeadLocation(lead),
            comments: normalizedComments,
            activity: normalizedActivity,
            deleted: Boolean(lead.deleted)
        };
    }

    function normalizeClient(client, index = 0) {
        return {
            id: String(client.id || `CL-${100 + index}`),
            name: String(client.name || client.clientName || `Client ${index + 1}`).trim(),
            category: String(client.category || client.industry || 'General').trim(),
            leads: Number(client.leads || 0),
            projects: Number(client.projects || 0)
        };
    }

    function mergeLeadCollections(baseLeads, customLeads, overrides) {
        const merged = new Map();
        [...(baseLeads || []), ...(customLeads || [])].forEach((lead, index) => {
            const normalizedLead = normalizeLead(lead, index);
            const key = normalizedLead.id.toLowerCase();
            const override = overrides && overrides[key] ? overrides[key] : null;
            const finalLead = override ? normalizeLead(Object.assign({}, normalizedLead, override), index) : normalizedLead;
            if (!finalLead.deleted) {
                merged.set(key, finalLead);
            }
        });
        return Array.from(merged.values());
    }

    function getAllLeads() {
        const backendLeads = Array.isArray(APP_STATE.leads) ? APP_STATE.leads : [];
        return mergeLeadCollections(backendLeads);
    }

    function getAllClients() {
        const map = new Map();
        const backendClients = Array.isArray(APP_STATE.clients) ? APP_STATE.clients : [];
        [...backendClients].map(normalizeClient).forEach((client) => {
            map.set(client.name.toLowerCase(), client);
        });
        return Array.from(map.values());
    }

    function getAllUsers() {
        const backendUsers = Array.isArray(APP_STATE.users) ? APP_STATE.users : [];
        return backendUsers;
    }

    function upsertLeadIntoState(lead) {
        if (!lead) {
            return null;
        }

        const normalizedLead = normalizeLead(lead);
        const targetId = String(normalizedLead.id || '').trim().toLowerCase();
        if (!targetId) {
            return normalizedLead;
        }

        if (!Array.isArray(APP_STATE.leads)) {
            APP_STATE.leads = [];
        }

        const leadIndex = APP_STATE.leads.findIndex((item) => String(item.id || '').trim().toLowerCase() === targetId);
        if (leadIndex >= 0) {
            APP_STATE.leads[leadIndex] = normalizedLead;
        } else {
            APP_STATE.leads.unshift(normalizedLead);
        }

        return normalizedLead;
    }

    async function enrichLeadLocationLabels() {
        if (!Array.isArray(APP_STATE.leads) || !APP_STATE.leads.length) {
            return;
        }

        const leadsNeedingLabels = APP_STATE.leads
            .map((lead) => normalizeLead(lead))
            .filter((lead) => lead.location && looksLikeCoordinateLabel(lead.location.label))
            .slice(0, 12);

        for (const lead of leadsNeedingLabels) {
            const resolvedLocation = await reverseGeocodeLocation(lead.location.lat, lead.location.lng);
            if (!resolvedLocation) {
                continue;
            }

            const nextLocation = normalizeLocation({
                ...lead.location,
                ...resolvedLocation
            });
            upsertLeadIntoState({
                ...lead,
                location: nextLocation
            });
            apiRequest(`/leads/${encodeURIComponent(lead.id)}`, {
                method: 'PATCH',
                body: JSON.stringify({ location: nextLocation })
            }).catch(() => null);
        }
    }

    async function enrichLeadLocationLabels() {
        if (!Array.isArray(APP_STATE.leads) || !APP_STATE.leads.length) {
            return;
        }

        const leadsNeedingLocationLabels = APP_STATE.leads
            .map((lead) => normalizeLead(lead))
            .filter((lead) => lead.location && looksLikeCoordinateLabel(lead.location.label))
            .slice(0, 12);

        for (const lead of leadsNeedingLocationLabels) {
            const resolvedLocation = await reverseGeocodeLocation(lead.location.lat, lead.location.lng);
            if (!resolvedLocation) {
                continue;
            }

            const nextLead = {
                ...lead,
                location: normalizeLocation({
                    ...lead.location,
                    ...resolvedLocation
                })
            };
            upsertLeadIntoState(nextLead);
            apiRequest(`/leads/${encodeURIComponent(lead.id)}`, {
                method: 'PATCH',
                body: JSON.stringify({ location: nextLead.location })
            }).catch(() => null);
        }
    }

    function upsertClientIntoState(client) {
        if (!client) {
            return null;
        }

        const normalizedClient = normalizeClient(client);
        const targetName = String(normalizedClient.name || '').trim().toLowerCase();
        if (!targetName) {
            return normalizedClient;
        }

        if (!Array.isArray(APP_STATE.clients)) {
            APP_STATE.clients = [];
        }

        const clientIndex = APP_STATE.clients.findIndex((item) => String(item.name || '').trim().toLowerCase() === targetName);
        if (clientIndex >= 0) {
            APP_STATE.clients[clientIndex] = normalizedClient;
        } else {
            APP_STATE.clients.unshift(normalizedClient);
        }

        return normalizedClient;
    }

    function refreshDashboardIfVisible() {
        if (qs('#dashboard-intelligence-feed') || qs('#dashboard-weekly-lead-chart') || qs('#dashboard-win-rate-chart')) {
            initDashboardPage();
        }
    }

    function refreshOwnerLeadsIfVisible() {
        if (qs('#owner-overview') || qs('#owner-detail')) {
            refreshOwnerTargetSummaries()
                .catch(() => null)
                .finally(() => initOwnerLeadsPage());
        }
    }

    function saveLeadPatch(id, patch) {
        const targetId = String(id || '').trim();
        if (!targetId) {
            return;
        }

        const currentLead = findLeadById(targetId);
        const actorName = getProfile().name || 'System';

        if (Array.isArray(APP_STATE.leads)) {
            const backendIndex = APP_STATE.leads.findIndex((lead) => String(lead.id || '').toLowerCase() === targetId.toLowerCase());
            if (backendIndex >= 0) {
                APP_STATE.leads[backendIndex] = Object.assign({}, APP_STATE.leads[backendIndex], patch);
            }
        }

        if (currentLead) {
            if (patch.status && patch.status !== currentLead.status) {
                appendLeadActivityLocal(targetId, createLeadActivityEntry('status_change', `Lead moved to ${patch.status}`, actorName, { from: currentLead.status, to: patch.status }));
            }
            const currentLifecycle = leadLifecycleLabel(currentLead);
            const nextLifecycle = patch.lifecycle || patch.state;
            if (nextLifecycle && normalizeLifecycle(nextLifecycle) !== normalizeLifecycle(currentLifecycle)) {
                appendLeadActivityLocal(targetId, createLeadActivityEntry('lifecycle_change', `Lead moved to ${leadLifecycleLabel(Object.assign({}, currentLead, patch))}`, actorName, { from: currentLifecycle, to: nextLifecycle }));
            }
            if (patch.owner && patch.owner !== currentLead.owner) {
                appendLeadActivityLocal(targetId, createLeadActivityEntry('owner_change', `Lead reassigned to ${patch.owner}`, actorName, { from: currentLead.owner, to: patch.owner }));
            }
        }

        return apiRequest('/leads/' + encodeURIComponent(targetId), {
            method: 'PATCH',
            body: JSON.stringify(patch)
        }).then(async (updatedLead) => {
            upsertLeadIntoState(updatedLead);
            await refreshOwnerTargetSummaries().catch(() => null);
            refreshDashboardIfVisible();
            refreshOwnerLeadsIfVisible();
            broadcastActivityChange();
            return updatedLead;
        }).catch(() => {
            refreshDashboardIfVisible();
            broadcastActivityChange();
            return null;
        });
    }

    function deleteLeadFromState(id) {
        const targetId = String(id || '').trim();
        if (!targetId) {
            return;
        }

        const removedLead = findLeadById(targetId);
        if (Array.isArray(APP_STATE.leads)) {
            APP_STATE.leads = APP_STATE.leads.filter((lead) => String(lead.id || '').toLowerCase() !== targetId.toLowerCase());
        }

        if (removedLead) {
            const removedClientName = String(removedLead.clientName || removedLead.businessUnit || removedLead.company || '').trim().toLowerCase();
            if (removedClientName && Array.isArray(APP_STATE.clients)) {
                const hasRemainingLeads = getAllLeads().some((lead) => String(lead.clientName || lead.businessUnit || lead.company || '').trim().toLowerCase() === removedClientName);
                if (!hasRemainingLeads) {
                    APP_STATE.clients = APP_STATE.clients.filter((client) => String(client.name || '').trim().toLowerCase() !== removedClientName);
                }
            }
        }

        apiRequest('/leads/' + encodeURIComponent(targetId), {
            method: 'DELETE'
        })
            .then(() => refreshOwnerTargetSummaries().catch(() => null))
            .then(() => refreshOwnerLeadsIfVisible())
            .finally(() => broadcastActivityChange())
            .catch(() => null);
    }

    function normalizeStatus(status) {
        const value = String(status || '').trim().toLowerCase();
        if (!value) return 'prospecting';
        if (value.includes('deal won') || value === 'won') return 'deal won';
        if (value.includes('deal lost') || value === 'lost' || value.includes('at risk')) return 'deal lost';
        if (value.includes('negotiation') || value.includes('hot')) return 'negotiation';
        if (value.includes('proposal') || value.includes('project in transition')) return 'proposal';
        if (value.includes('qualification') || value.includes('warm') || value.includes('qualified')) return 'qualification';
        if (value.includes('prospecting') || value.includes('cold') || value.includes('discovery') || value.includes('draft')) return 'prospecting';
        return value;
    }

    function normalizeLifecycle(value) {
        const normalized = String(value || '').trim().toLowerCase();
        if (normalized.includes('hold')) return 'hold';
        if (normalized.includes('closed')) return 'closed';
        return 'active';
    }

    function isWonStatus(status) {
        return normalizeStatus(status) === 'deal won';
    }

    function isLostStatus(status) {
        return normalizeStatus(status) === 'deal lost';
    }

    function isClosedStatus(status) {
        return isWonStatus(status) || isLostStatus(status);
    }

    function leadLifecycleLabel(lead) {
        if (!lead) {
            return 'Active';
        }
        if (isClosedStatus(lead.status)) {
            return 'Closed';
        }
        return normalizeLifecycle(lead.lifecycle) === 'hold' ? 'Hold' : 'Active';
    }

    function isLeadOpen(lead) {
        return Boolean(lead) && !isClosedStatus(lead.status);
    }

    function isLeadActive(lead) {
        return isLeadOpen(lead) && leadLifecycleLabel(lead) === 'Active';
    }

    function canCommentOnLead(lead) {
        return isLeadOpen(lead);
    }

    function canEditLead(lead, ownerContext = '') {
        if (!isLeadOpen(lead)) {
            return false;
        }
        const profile = getProfile();
        const profileName = String(profile.name || '').trim().toLowerCase();
        const leadOwner = String(lead?.owner || '').trim().toLowerCase();
        const contextOwnerName = String(ownerContext || '').trim().toLowerCase();
        return String(profile.role || '').trim().toLowerCase() === 'administrator'
            || (profileName && profileName === leadOwner)
            || (contextOwnerName && contextOwnerName === leadOwner);
    }

    function createLeadActivityEntry(type, label, actor, metadata = {}) {
        return {
            id: `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            type,
            label,
            actor: actor || getProfile().name || 'System',
            createdAt: new Date().toISOString(),
            metadata
        };
    }

    function appendLeadActivityLocal(id, entry) {
        const targetId = String(id || '').trim().toLowerCase();
        if (!targetId || !entry) {
            return;
        }

        if (Array.isArray(APP_STATE.leads)) {
            const lead = APP_STATE.leads.find((item) => String(item.id || '').toLowerCase() === targetId);
            if (lead) {
                lead.activity = Array.isArray(lead.activity) ? lead.activity.concat(entry) : [entry];
            }
        }

        refreshDashboardIfVisible();
    }

    function stageRank(status) {
        const value = normalizeStatus(status);
        if (value === 'deal won') return 5;
        if (value === 'negotiation') return 4;
        if (value === 'proposal') return 3;
        if (value === 'qualification') return 2;
        if (value === 'prospecting') return 1;
        if (value === 'deal lost') return 0;
        return 1;
    }

    function funnelBucket(status) {
        const value = normalizeStatus(status);
        if (value === 'deal won') return 'Deal Won';
        if (value === 'negotiation') return 'Negotiation';
        if (value === 'proposal') return 'Proposal';
        if (value === 'qualification') return 'Qualification';
        return 'Prospecting';
    }

    function formatRelativeTime(value) {
        const date = parseDateValue(value);
        const diffMs = Date.now() - date.getTime();
        const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));
        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
        return formatDisplayDate(date);
    }

    function activityVisuals(type) {
        const value = String(type || '').toLowerCase();
        if (value === 'created') {
            return { bg: 'bg-primary', icon: 'person_add' };
        }
        if (value === 'comment') {
            return { bg: 'bg-slate-900', icon: 'forum' };
        }
        if (value === 'status_change') {
            return { bg: 'bg-tertiary', icon: 'local_fire_department' };
        }
        if (value === 'owner_change') {
            return { bg: 'bg-blue-100', icon: 'assignment_turned_in', iconClass: 'text-primary' };
        }
        if (value === 'lifecycle_change') {
            return { bg: 'bg-secondary', icon: 'sync_alt' };
        }
        return { bg: 'bg-slate-700', icon: 'bolt' };
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
        const openLeads = leads.filter((lead) => isLeadOpen(lead));
        const activeLeads = openLeads.filter((lead) => isLeadActive(lead));
        const holdLeads = openLeads.filter((lead) => leadLifecycleLabel(lead) === 'Hold');
        const wonLeads = leads.filter((lead) => isWonStatus(lead.status));
        const lostLeads = leads.filter((lead) => isLostStatus(lead.status));
        const pipelineValue = openLeads.reduce((sum, lead) => sum + lead.value, 0);
        const wonRevenue = wonLeads.reduce((sum, lead) => sum + lead.value, 0);
        const avgDealSize = openLeads.length ? pipelineValue / openLeads.length : 0;
        const qualifiedLeads = leads.filter((lead) => isQualifiedOrBeyond(lead.status));
        const totalClosed = wonLeads.length + lostLeads.length;
        const winRate = totalClosed ? (wonLeads.length / totalClosed) * 100 : 0;
        const qualifiedRate = totalLeads ? (qualifiedLeads.length / totalLeads) * 100 : 0;
        const commonCurrency = DISPLAY_CURRENCY;
        const highPotential = openLeads.filter((lead) => lead.value >= avgDealSize && stageRank(lead.status) >= 2);
        const hotLeads = openLeads.filter((lead) => lead.value >= avgDealSize && stageRank(lead.status) >= 3);
        const now = Date.now();
        const avgResponseHours = openLeads.length
            ? openLeads.reduce((sum, lead) => sum + Math.min((now - parseDateValue(lead.date).getTime()) / 36e5, 72), 0) / openLeads.length
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

        const funnelOrder = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Deal Won'];
        const funnelCounts = {
            Prospecting: leads.filter((lead) => funnelBucket(lead.status) === 'Prospecting').length,
            Qualification: leads.filter((lead) => funnelBucket(lead.status) === 'Qualification').length,
            Proposal: leads.filter((lead) => funnelBucket(lead.status) === 'Proposal').length,
            Negotiation: leads.filter((lead) => funnelBucket(lead.status) === 'Negotiation').length,
            'Deal Won': wonLeads.length
        };
        const funnelBase = Math.max(1, funnelCounts.Prospecting);
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
        const weeklyLeadBuckets = weekdayLabels.map((label, index) => ({
            label,
            jsDay: index + 1,
            total: 0,
            prospecting: 0,
            qualification: 0,
            proposal: 0,
            negotiation: 0,
            dealWon: 0,
            dealLost: 0
        }));
        leads.forEach((lead) => {
            const date = parseDateValue(lead.date);
            const bucket = weeklyLeadBuckets.find((item) => item.jsDay === date.getDay());
            if (!bucket) {
                return;
            }
            bucket.total += 1;
            switch (normalizeStatus(lead.status)) {
                case 'prospecting':
                    bucket.prospecting += 1;
                    break;
                case 'qualification':
                    bucket.qualification += 1;
                    break;
                case 'proposal':
                    bucket.proposal += 1;
                    break;
                case 'negotiation':
                    bucket.negotiation += 1;
                    break;
                case 'deal won':
                    bucket.dealWon += 1;
                    break;
                case 'deal lost':
                    bucket.dealLost += 1;
                    break;
                default:
                    bucket.prospecting += 1;
                    break;
            }
        });
        const weeklyUploadedLeads = weeklyLeadBuckets.reduce((sum, bucket) => sum + bucket.total, 0);
        const weeklyOpenLeads = weeklyLeadBuckets.reduce((sum, bucket) => sum + bucket.prospecting + bucket.qualification + bucket.proposal + bucket.negotiation, 0);
        const weeklyClosedLeads = weeklyLeadBuckets.reduce((sum, bucket) => sum + bucket.dealWon + bucket.dealLost, 0);

        const totalClients = clients.length;
        const activeProjects = clients.reduce((sum, client) => sum + client.projects, 0);
        const avgLeadFlow = totalClients
            ? clients.reduce((sum, client) => sum + (client.leads ? (client.projects / client.leads) * 100 : 0), 0) / totalClients
            : 0;

        const recentActivity = leads
            .flatMap((lead) => {
                const activityItems = Array.isArray(lead.activity) ? lead.activity : [];
                return activityItems.map((item) => ({
                    id: item.id || `${lead.id}-${item.createdAt || lead.date}`,
                    type: item.type || 'update',
                    label: item.label || 'Lead updated',
                    actor: item.actor || lead.owner || 'System',
                    createdAt: item.createdAt || lead.date,
                    leadId: lead.id,
                company: lead.businessUnit || lead.company,
                businessUnit: lead.businessUnit || lead.company,
                owner: lead.owner,
                metadata: item.metadata || {}
            }));
            })
            .sort((left, right) => parseDateValue(right.createdAt) - parseDateValue(left.createdAt))
            .slice(0, 6);

        return {
            leads,
            clients,
            totalLeads,
            openLeads,
            activeLeads,
            holdLeads,
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
            pendingReview: openLeads.length,
            commonCurrency,
            sourceDistribution,
            funnel,
            ownerRanking,
            weeklyLeadBuckets,
            avgLeadFlow,
            weeklyUploadedLeads,
            weeklyOpenLeads,
            weeklyClosedLeads,
            recentActivity
        };
    }

    function findLeadById(id) {
        return getAllLeads().find((lead) => lead.id.toLowerCase() === String(id || '').toLowerCase());
    }

    function getLeadComments(lead) {
        const leadComments = Array.isArray(lead?.comments) ? lead.comments : [];
        if (leadComments.length) {
            return leadComments
                .map((comment) => {
                    if (typeof comment === 'string') {
                        return {
                            id: `legacy-${Math.random().toString(36).slice(2, 8)}`,
                            body: comment,
                            author: lead.owner || 'Team',
                            createdAt: lead.date || new Date().toISOString()
                        };
                    }

                    return {
                        id: comment.id || `comment-${Math.random().toString(36).slice(2, 8)}`,
                        body: comment.body || '',
                        author: comment.author || lead.owner || 'Team',
                        createdAt: comment.createdAt || lead.date || new Date().toISOString()
                    };
                })
                .filter((comment) => String(comment.body || '').trim());
        }

        return [];
    }

    function getLeadLocation(lead) {
        return normalizeLocation(lead.location || getCurrentLocation());
    }

    function formatCommentTimestamp(value) {
        if (!value) {
            return 'Just now';
        }
        return formatRelativeTime(value);
    }

    function buildLeadCommentsMarkup(sourceLead) {
        const thread = getLeadComments(sourceLead);
        if (!thread.length) {
            return `
                <div class="rounded-2xl bg-slate-50 border border-slate-200 p-5">
                    <p class="text-sm font-semibold text-slate-900">No notes yet</p>
                    <p class="text-sm text-slate-500 mt-1">The first internal update for this lead will appear here.</p>
                </div>
            `;
        }

        return thread.map((comment, index) => `
            <div class="rounded-2xl ${index % 2 === 0 ? 'bg-slate-50 border border-slate-200' : 'bg-blue-50 border border-blue-100'} p-4">
                <div class="flex items-center justify-between gap-3 mb-2">
                    <div>
                        <p class="text-xs font-bold uppercase tracking-[0.18em] ${index % 2 === 0 ? 'text-slate-600' : 'text-blue-700'}">${escapeHtml(comment.author || sourceLead.owner || 'Team')}</p>
                        <span class="text-[11px] text-slate-400">${escapeHtml(formatCommentTimestamp(comment.createdAt))}</span>
                    </div>
                    <span class="text-[11px] font-semibold ${index === 0 ? 'text-emerald-600' : 'text-slate-400'}">${index === 0 ? 'Latest' : 'Saved Note'}</span>
                </div>
                <p class="text-sm leading-relaxed text-slate-700">${escapeHtml(comment.body || '')}</p>
            </div>
        `).join('');
    }

    function openLeadCommentsModal(sourceLead, companyName = '') {
        const resolvedLead = sourceLead?.id ? (findLeadById(sourceLead.id) || sourceLead) : sourceLead;
        const company = companyName || resolvedLead?.businessUnit || resolvedLead?.company || 'Lead';

        openModal(
            `Lead Comments: ${company}`,
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
                <div class="space-y-3">${buildLeadCommentsMarkup(resolvedLead)}</div>
            </div>`,
            [
                {
                    label: 'Add Note',
                    onClick: (close) => {
                        close();
                        openFormModal({
                            title: `Add Note: ${company}`,
                            description: 'Capture the next useful update for this lead.',
                            submitLabel: 'Save Note',
                            fields: [
                                { name: 'note', label: 'Lead Note', type: 'textarea', required: true, placeholder: 'Write the update you want the team to see...' }
                            ],
                            onSubmit: ({ note }) => {
                                const lead = resolvedLead?.id ? (findLeadById(resolvedLead.id) || resolvedLead) : resolvedLead;
                                const nextComment = {
                                    id: `COM-${Date.now()}`,
                                    body: note,
                                    author: getProfile().name || 'System',
                                    createdAt: new Date().toISOString()
                                };

                                if (lead && lead.id) {
                                    lead.comments = Array.isArray(lead.comments) ? lead.comments.concat(nextComment) : [nextComment];
                                    upsertLeadIntoState(lead);
                                    appendLeadActivityLocal(lead.id, createLeadActivityEntry('comment', 'Comment added', getProfile().name || 'System', { comment: note }));
                                    apiRequest(`/leads/${encodeURIComponent(lead.id)}/comments`, {
                                        method: 'POST',
                                        body: JSON.stringify({ comment: note })
                                    }).catch(() => null);
                                }

                                refreshDashboardIfVisible();
                                broadcastActivityChange();
                                toast('Comment added to the lead.', 'success');
                                setTimeout(() => openLeadCommentsModal(lead || resolvedLead, company), 20);
                            }
                        });
                    }
                }
            ]
        );
    }

    function getLeadsForClient(clientName, category = '') {
        const normalizedClient = String(clientName || '').trim().toLowerCase();
        const categoryWords = String(category || '').toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 3);

        return getAllLeads().filter((lead) => {
            const directClientMatch = String(lead.clientName || '').trim().toLowerCase() === normalizedClient;
            const companyMatch = String(lead.businessUnit || lead.company || '').toLowerCase() === normalizedClient;
            const categoryMatch = categoryWords.some((word) =>
                lead.industry.toLowerCase().includes(word) || String(lead.businessUnit || lead.company || '').toLowerCase().includes(word)
            );
            return directClientMatch || companyMatch || categoryMatch;
        });
    }

    function ensureClientProfileForLead(lead) {
        const clientName = String(lead.clientName || lead.businessUnit || lead.company || '').trim();
        if (!clientName) {
            return;
        }
        const existingClients = getAllClients();
        const alreadyExists = existingClients.some((client) => client.name.toLowerCase() === clientName.toLowerCase());
        if (alreadyExists) {
            return;
        }

        apiRequest('/clients', {
            method: 'POST',
            body: JSON.stringify({
                name: clientName,
                category: lead.industry || lead.lob || 'General',
                leads: 1,
                projects: 1
            })
        })
            .then((client) => upsertClientIntoState(client))
            .catch(() => null);
    }

    function openLeadEditModal(lead, options = {}) {
        if (!canEditLead(lead, options.ownerContext)) {
            toast('Only the lead owner can edit open leads.', 'warning');
            return;
        }

        openFormModal({
            title: `Edit Lead: ${lead.businessUnit || lead.company}`,
            description: 'Update the lead status, total contract value, and contact information for this lead.',
            submitLabel: 'Save Changes',
            fields: [
                {
                    name: 'status',
                    label: 'Lead Status',
                    type: 'select',
                    value: lead.status || 'Prospecting',
                    required: true,
                    options: ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Deal Won', 'Deal Lost']
                },
                { name: 'value', label: 'Total Contract Value', value: String(lead.value || ''), required: true, placeholder: 'Enter contract value' },
                { name: 'contact', label: 'Contact Person', value: lead.contact || '', required: true, placeholder: 'Enter contact person name' },
                { name: 'phone', label: 'Phone Number', value: lead.phone || '', placeholder: 'Enter phone number' },
                { name: 'email', label: 'Email Address', type: 'email', value: lead.email || '', placeholder: 'Enter email address' }
            ],
            onSubmit: ({ status, value, contact, phone, email }) => {
                const patch = {
                    status: String(status || lead.status || 'Prospecting').trim(),
                    value: parseNumericValue(value),
                    contact: String(contact || '').trim(),
                    phone: String(phone || '').trim(),
                    email: String(email || '').trim()
                };
                saveLeadPatch(lead.id, patch);
                if (typeof options.onSave === 'function') {
                    options.onSave(findLeadById(lead.id));
                }
                toast('Lead details updated.', 'success');
            }
        });
    }

    function openLeadDetailModal(lead, options = {}) {
        const location = getLeadLocation(lead);
        const lifecycle = leadLifecycleLabel(lead);
        const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(`${location.lat},${location.lng}`)}&z=14&output=embed`;
        const comments = getLeadComments(lead);
        const actions = [];

        if (canEditLead(lead, options.ownerContext)) {
            actions.push({
                label: 'Edit Lead',
                className: 'px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold bg-white',
                onClick: (close) => {
                    close();
                    openLeadEditModal(lead, options);
                }
            });
        }

        if (isLeadOpen(lead)) {
            actions.push({
                label: lifecycle === 'Hold' ? 'Mark Active' : 'Move to Hold',
                className: 'px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold bg-white',
                onClick: (close) => {
                    const nextLifecycle = lifecycle === 'Hold' ? 'Active' : 'Hold';
                    saveLeadPatch(lead.id, { lifecycle: nextLifecycle });
                    if (typeof options.onSave === 'function') {
                        options.onSave(findLeadById(lead.id));
                    }
                    toast(`Lead moved to ${nextLifecycle}.`, 'success');
                    close();
                }
            });
        }

        openModal(
            `${lead.businessUnit || lead.company} Lead`,
            `<div class="space-y-4">
                <div class="grid grid-cols-2 gap-3">
                    <div class="rounded-xl bg-slate-50 p-3"><p class="text-[11px] uppercase text-slate-500 font-bold">Lead ID</p><p class="mt-1 font-semibold text-slate-900">${escapeHtml(lead.id)}</p></div>
                    <div class="rounded-xl bg-slate-50 p-3"><p class="text-[11px] uppercase text-slate-500 font-bold">Status</p><p class="mt-1 font-semibold text-slate-900">${escapeHtml(lead.status)}</p></div>
                    <div class="rounded-xl bg-slate-50 p-3"><p class="text-[11px] uppercase text-slate-500 font-bold">State</p><p class="mt-1 font-semibold text-slate-900">${escapeHtml(lifecycle)}</p></div>
                    <div class="rounded-xl bg-slate-50 p-3"><p class="text-[11px] uppercase text-slate-500 font-bold">Value</p><p class="mt-1 font-semibold text-slate-900">${escapeHtml(formatMoney(lead.value, { currency: lead.currency }))}</p></div>
                    <div class="rounded-xl bg-slate-50 p-3"><p class="text-[11px] uppercase text-slate-500 font-bold">Publisher</p><p class="mt-1 font-semibold text-slate-900">${escapeHtml(lead.source)}</p></div>
                    <div class="rounded-xl bg-slate-50 p-3"><p class="text-[11px] uppercase text-slate-500 font-bold">Owner</p><p class="mt-1 font-semibold text-slate-900">${escapeHtml(lead.owner)}</p></div>
                    <div class="rounded-xl bg-slate-50 p-3"><p class="text-[11px] uppercase text-slate-500 font-bold">Created</p><p class="mt-1 font-semibold text-slate-900">${escapeHtml(formatDisplayDate(lead.date))}</p></div>
                    <div class="rounded-xl bg-slate-50 p-3"><p class="text-[11px] uppercase text-slate-500 font-bold">Business Unit</p><p class="mt-1 font-semibold text-slate-900">${escapeHtml(lead.businessUnit || lead.company)}</p></div>
                    <div class="rounded-xl bg-slate-50 p-3"><p class="text-[11px] uppercase text-slate-500 font-bold">Opportunity Name</p><p class="mt-1 font-semibold text-slate-900">${escapeHtml(lead.opportunityName || 'Not provided')}</p></div>
                    <div class="rounded-xl bg-slate-50 p-3"><p class="text-[11px] uppercase text-slate-500 font-bold">Industry</p><p class="mt-1 font-semibold text-slate-900">${escapeHtml(lead.industry || lead.lob || 'General')}</p></div>
                    <div class="rounded-xl bg-slate-50 p-3"><p class="text-[11px] uppercase text-slate-500 font-bold">Client</p><p class="mt-1 font-semibold text-slate-900">${escapeHtml(lead.clientName || lead.businessUnit || lead.company)}</p></div>
                </div>
                <div class="rounded-xl bg-slate-50 p-4">
                    <p class="text-[11px] uppercase text-slate-500 font-bold mb-2">Contact Information</p>
                    <p class="font-semibold text-slate-900">${escapeHtml(lead.contact)}</p>
                    <p class="text-sm text-slate-600 mt-1">${escapeHtml(lead.phone || 'No phone saved')}</p>
                    <p class="text-sm text-slate-600">${escapeHtml(lead.email || 'No email saved')}</p>
                </div>
                <div class="rounded-xl bg-slate-50 p-4">
                    <p class="text-[11px] uppercase text-slate-500 font-bold mb-2">Description</p>
                    <p class="text-sm text-slate-700">${escapeHtml(lead.description || 'No description added yet.')}</p>
                </div>
                <div class="rounded-xl bg-slate-50 p-4">
                    <div class="flex items-center justify-between gap-3 mb-2">
                        <p class="text-[11px] uppercase text-slate-500 font-bold">Comments</p>
                        <span class="text-[11px] font-bold uppercase tracking-[0.18em] ${canCommentOnLead(lead) ? 'text-emerald-600' : 'text-slate-400'}">${canCommentOnLead(lead) ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div class="space-y-2">
                        ${comments.length ? comments.map((comment, index) => `
                            <div class="rounded-lg ${index % 2 === 0 ? 'bg-white' : 'bg-blue-50'} p-3">
                                <div class="flex items-center justify-between gap-3 mb-1">
                                    <p class="text-xs font-bold ${index % 2 === 0 ? 'text-slate-600' : 'text-blue-700'}">${escapeHtml(comment.author || lead.owner || 'Team')}</p>
                                    <span class="text-[11px] text-slate-400">${escapeHtml(formatCommentTimestamp(comment.createdAt))}</span>
                                </div>
                                <p class="text-sm text-slate-700">${escapeHtml(comment.body || '')}</p>
                            </div>
                        `).join('') : '<div class="rounded-lg bg-white p-3"><p class="text-sm text-slate-500">No comments saved for this lead yet.</p></div>'}
                    </div>
                </div>
                <div class="rounded-xl overflow-hidden border border-slate-200">
                    <iframe src="${mapsUrl}" class="w-full h-[220px]" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                </div>
                <div class="rounded-xl bg-slate-50 p-4">
                    <p class="text-[11px] uppercase text-slate-500 font-bold mb-1">Location</p>
                    <p class="font-semibold text-slate-900">${escapeHtml(location.label)}</p>
                </div>
            </div>`,
            actions
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

    function statusBadgeClass(status) {
        return ({
            Prospecting: 'bg-amber-50 text-amber-700',
            Qualification: 'bg-sky-50 text-sky-700',
            Proposal: 'bg-indigo-50 text-indigo-700',
            Negotiation: 'bg-purple-50 text-purple-700',
            'Deal Won': 'bg-emerald-50 text-emerald-700',
            'Deal Lost': 'bg-rose-50 text-rose-700'
        }[status] || 'bg-slate-100 text-slate-700');
    }

    function lifecycleBadgeClass(lifecycle) {
        return ({
            Active: 'bg-emerald-50 text-emerald-700',
            Hold: 'bg-slate-100 text-slate-700',
            Closed: 'bg-slate-200 text-slate-600'
        }[lifecycle] || 'bg-slate-100 text-slate-700');
    }

    function ensureLeadLifecycleColumns(pageType) {
        const headerRow = qs('thead tr');
        if (!headerRow) {
            return;
        }

        const headerLabels = qsa('th', headerRow).map((cell) => cell.textContent.trim());
        const targetIndex = pageType === 'review' ? 5 : 6;
        if (!headerLabels.includes('State')) {
            const headerCell = document.createElement('th');
            headerCell.className = pageType === 'review'
                ? 'px-6 py-3 text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-widest'
                : 'px-4 py-4 border-b border-slate-100 text-[11px] uppercase tracking-wider font-bold text-slate-500';
            headerCell.textContent = 'State';
            headerRow.insertBefore(headerCell, qsa('th', headerRow)[targetIndex] || null);
        }

        qsa('tbody tr').forEach((row) => {
            const cells = qsa('td', row);
            const expectedLength = pageType === 'review' ? 9 : 11;
            if (cells.length >= expectedLength) {
                return;
            }
            const cell = document.createElement('td');
            cell.className = pageType === 'review' ? 'px-6 py-4' : 'px-4 py-4';
            cell.innerHTML = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">Active</span>';
            row.insertBefore(cell, cells[targetIndex] || null);
        });
    }

    function applyLeadToManageRow(row, lead) {
        const cells = qsa('td', row);
        if (cells.length < 10 || !lead) {
            return;
        }
        const lifecycle = leadLifecycleLabel(lead);
        setNodeText(cells[1], lead.id);
        setNodeText(qs('.text-sm.font-semibold', cells[2]), lead.company);
        setNodeText(qs('.text-sm', cells[3]), lead.contact);
        setNodeText(qs('.text-sm.font-bold', cells[4]), formatMoney(lead.value, { currency: lead.currency }));
        const statusNode = qs('span', cells[5]);
        setNodeText(statusNode, lead.status);
        statusNode.className = `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${statusBadgeClass(lead.status)}`;
        const lifecycleNode = qs('span', cells[6]);
        setNodeText(lifecycleNode, lifecycle);
        lifecycleNode.className = `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${lifecycleBadgeClass(lifecycle)}`;
        setNodeText(qs('.text-sm.text-slate-600', cells[8]), lead.owner);
        setNodeText(cells[9], formatDisplayDate(lead.date));
        row.dataset.leadId = lead.id;
        row.dataset.leadDateIso = parseDateValue(lead.date).toISOString();
        row.dataset.leadValue = String(lead.value);
        row.dataset.leadStatus = lead.status;
        row.dataset.leadLifecycle = lifecycle;
        row.dataset.leadOwner = lead.owner;
        row.dataset.leadCompany = lead.company;
    }

    function applyLeadToReviewRow(row, lead) {
        const cells = qsa('td', row);
        if (cells.length < 9 || !lead) {
            return;
        }
        const lifecycle = leadLifecycleLabel(lead);
        const leadAgeDays = daysSinceDate(lead.date);
        setNodeText(cells[0], `#${lead.id}`);
        setNodeText(qs('.text-sm.font-semibold', cells[1]), lead.company);
        setNodeText(qs('.text-sm.font-medium', cells[2]), lead.contact);
        setNodeText(qs('.text-xs', cells[2]), lead.industry);
        setNodeText(cells[3], formatMoney(lead.value, { currency: lead.currency }));
        const statusNode = qs('span', cells[4]);
        setNodeText(statusNode, lead.status);
        statusNode.className = `px-2 py-1 rounded-full text-[10px] font-bold uppercase ${statusBadgeClass(lead.status)}`;
        const lifecycleNode = qs('span', cells[5]);
        setNodeText(lifecycleNode, lifecycle);
        lifecycleNode.className = `px-2 py-1 rounded-full text-[10px] font-bold uppercase ${lifecycleBadgeClass(lifecycle)}`;
        setNodeText(qs('.text-sm.text-on-surface', cells[6]), lead.owner);
        setNodeText(cells[7], `${leadAgeDays} days`);
        setNodeText(cells[8], formatDisplayDate(lead.date));
        row.dataset.leadId = lead.id;
        row.dataset.leadDateIso = parseDateValue(lead.date).toISOString();
        row.dataset.leadStatus = lead.status;
        row.dataset.leadLifecycle = lifecycle;
        row.dataset.leadLocation = JSON.stringify(lead.location || getCurrentLocation());
        row.dataset.leadAgeDays = String(leadAgeDays);

        const commentButton = qsa('button[title]', row).find((button) => button.getAttribute('title') === 'Comments');
        if (commentButton) {
            const enabled = canCommentOnLead(lead);
            commentButton.disabled = !enabled;
            commentButton.classList.toggle('opacity-40', !enabled);
            commentButton.classList.toggle('cursor-not-allowed', !enabled);
            commentButton.title = enabled ? 'Comments' : 'Comments disabled for closed leads';
        }
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

    function downloadExcelSections(filename, sections, sheetTitle = 'Sheet1') {
        const tables = sections.map((section) => {
            const heading = section.title ? `<h3 style="margin:0 0 8px 0;font-size:18px;">${escapeHtml(section.title)}</h3>` : '';
            const description = section.description ? `<p style="margin:0 0 12px 0;color:#475569;">${escapeHtml(section.description)}</p>` : '';
            const headers = (section.headers || []).map((header) => `<th>${escapeHtml(header)}</th>`).join('');
            const rows = (section.rows || []).length
                ? section.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')
                : `<tr><td colspan="${Math.max(1, (section.headers || []).length)}">No data available</td></tr>`;
            return `
                <section style="margin-bottom:24px;">
                    ${heading}
                    ${description}
                    <table>
                        <thead><tr>${headers}</tr></thead>
                        <tbody>${rows}</tbody>
                    </table>
                </section>
            `;
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
                    body { font-family: Arial, sans-serif; padding: 16px; }
                    table { border-collapse: collapse; width: 100%; margin-bottom: 12px; }
                    th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
                    th { background: #e2e8f0; font-weight: 700; }
                </style>
            </head>
            <body>${tables}</body>
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
                const baseLocation = {
                    label: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
                    lat: position.coords.latitude.toFixed(6),
                    lng: position.coords.longitude.toFixed(6)
                };
                reverseGeocodeLocation(baseLocation.lat, baseLocation.lng)
                    .then((resolvedLocation) => {
                        const location = normalizeLocation({
                            ...baseLocation,
                            ...(resolvedLocation || {})
                        });
                        setCurrentLocation(location);
                        onComplete(location);
                    })
                    .catch(() => {
                        const location = normalizeLocation(baseLocation);
                        setCurrentLocation(location);
                        onComplete(location);
                    });
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
                    title: lead.businessUnit || lead.company,
                    subtitle: `Lead | ${lead.status} | ${lead.owner}`,
                    href: routePath('review_leads.html'),
                    keywords: [lead.businessUnit || lead.company, lead.opportunityName, lead.contact, lead.clientName, lead.status, lead.owner, lead.industry, lead.id].join(' ').toLowerCase()
                }));
                const clientEntries = getAllClients().slice(0, 24).map((client) => ({
                    title: client.name,
                    subtitle: `Client | ${client.category}`,
                    href: routePath('clients.html'),
                    keywords: [client.name, client.category, 'clients client profile'].join(' ').toLowerCase()
                }));

                return [
                    { title: 'Intelligence Dashboard', subtitle: 'Dashboard overview and live KPIs', href: routePath('dashboard.html'), keywords: 'dashboard intelligence overview kpi pipeline win rate weekly activity reports' },
                    { title: 'Add New Lead', subtitle: 'Create and stage a new opportunity', href: routePath('add_lead.html'), keywords: 'add new lead create opportunity intake form client' },
                    { title: 'Review Leads', subtitle: 'Comments, timeline, owner changes, and location', href: routePath('review_leads.html'), keywords: 'review leads comments timeline owner change location queue' },
                    { title: 'Manage Leads', subtitle: 'Search, pipeline actions, exports, and status updates', href: routePath('manage_leads.html'), keywords: 'manage leads status export pipeline bulk actions industry' },
                    { title: 'Clients', subtitle: 'Client profiles and related lead details', href: routePath('clients.html'), keywords: 'clients client profiles related leads' },
                    { title: 'Reports', subtitle: 'Funnel metrics, exports, and team performance', href: routePath('reports.html'), keywords: 'reports funnel team performance export conversion revenue' },
                    { title: 'Profile', subtitle: `${profile.name} | ${profile.role}`, href: routePath('profile.html'), keywords: [profile.name, profile.email, profile.role, profile.focus, 'profile account bio'].join(' ').toLowerCase() },
                    { title: 'Total Pipeline', subtitle: `${formatMoney(liveAnalytics.pipelineValue, { currency: liveAnalytics.commonCurrency })} currently in play`, href: routePath('dashboard.html'), keywords: 'total pipeline value revenue dashboard kpi' },
                    { title: 'Win Rate', subtitle: `${formatPercent(liveAnalytics.winRate, 0)} current close rate`, href: routePath('dashboard.html'), keywords: 'win rate target dashboard close rate' },
                    { title: 'Team Performance Ranking', subtitle: 'Reports ranking and team contribution table', href: routePath('reports.html'), keywords: 'team performance ranking leaderboard reports owners revenue' },
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

        const renderNotificationButtons = () => {
            const analytics = computeAnalytics();
            const recentItems = analytics.recentActivity.slice(0, 8);
            const seenAt = getNotificationsSeenAt();
            const unreadCount = recentItems.filter((item) => !seenAt || parseDateValue(item.createdAt) > parseDateValue(seenAt)).length;

            qsa('button').forEach((button) => {
                const icon = button.querySelector('.material-symbols-outlined')?.textContent.trim();
                if (icon !== 'notifications') {
                    return;
                }
                button.classList.add('relative');
                qsa('[data-notification-badge]', button).forEach((badge) => badge.remove());
                if (unreadCount > 0) {
                    const badge = document.createElement('span');
                    badge.setAttribute('data-notification-badge', 'true');
                    badge.className = 'absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white';
                    badge.textContent = unreadCount > 99 ? '99+' : String(unreadCount);
                    button.appendChild(badge);
                }
            });
        };

        const openIntelligenceFeedUpdates = () => {
            const analytics = computeAnalytics();
            const recentItems = analytics.recentActivity.slice(0, 8);
            sessionStorage.removeItem('grassroots_open_intelligence_feed');
            markNotificationsViewed(recentItems);
            renderNotificationButtons();
            openModal(
                'Intelligence Feed Updates',
                buildIntelligenceFeedMarkup(recentItems, {
                    compact: true,
                    emptyMessage: 'Recent lead activity will appear here once the team starts updating leads.'
                })
            );
        };

        qsa('button').forEach((button) => {
            const icon = button.querySelector('.material-symbols-outlined')?.textContent.trim();
            if (icon === 'notifications' && !button.dataset.boundAction) {
                button.dataset.boundAction = 'true';
                button.addEventListener('click', openIntelligenceFeedUpdates);
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

        renderNotificationButtons();
        if (!window.__grassrootsNotificationRefreshBound) {
            window.__grassrootsNotificationRefreshBound = true;
            window.addEventListener('grassroots:activity-updated', renderNotificationButtons);
            window.addEventListener('storage', (event) => {
                if ([STORAGE_KEYS.notificationsSeenAt, STORAGE_KEYS.authToken].includes(event.key)) {
                    renderNotificationButtons();
                }
            });
        }

        qsa('a[data-route="profile"]').forEach((link) => {
            const label = link.querySelector('span:last-child');
            if (label) {
                label.textContent = 'Profile';
            }
        });

        qsa('a[data-route="logout"]').forEach((link) => {
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
                    onConfirm: async () => {
                        try {
                            await apiRequest('/auth/logout', { method: 'POST' });
                        } catch (error) {
                            // ignore logout transport issues and clear local session anyway
                        }
                        clearAuthState();
                        window.location.replace(routePath('Login.html'));
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
                        window.location.href = routePath('profile.html');
                    });
                }

                if (openProfileSecondaryAction) {
                    openProfileSecondaryAction.addEventListener('click', () => {
                        close();
                        window.location.href = routePath('profile.html');
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
                            onConfirm: async () => {
                                try {
                                    await apiRequest('/auth/logout', { method: 'POST' });
                                } catch (error) {
                                    // ignore logout transport issues and clear local session anyway
                                  }
                                  clearAuthState();
                                  window.location.replace(routePath('Login.html'));
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
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${statusBadgeClass(normalizedLead.status)}">${escapeHtml(normalizedLead.status)}</span>
                </td>
                <td class="px-4 py-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${lifecycleBadgeClass(leadLifecycleLabel(normalizedLead))}">${escapeHtml(leadLifecycleLabel(normalizedLead))}</span>
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
                    <span class="px-2 py-1 rounded-full text-[10px] font-bold uppercase ${statusBadgeClass(normalizedLead.status)}">${escapeHtml(normalizedLead.status)}</span>
                </td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 rounded-full text-[10px] font-bold uppercase ${lifecycleBadgeClass(leadLifecycleLabel(normalizedLead))}">${escapeHtml(leadLifecycleLabel(normalizedLead))}</span>
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


    function buildManageLeadRow(lead) {
        const normalizedLead = normalizeLead(lead);
        const row = document.createElement('tr');
        row.className = 'hover:bg-slate-50/50 transition-colors';
        row.innerHTML =             '<td class="px-6 py-4">' +
                '<input class="rounded text-primary focus:ring-primary/20 border-slate-300" type="checkbox"/>' +
            '</td>' +
            '<td class="px-4 py-4 text-sm font-mono text-slate-500">' + escapeHtml(normalizedLead.id) + '</td>' +
            '<td class="px-4 py-4"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">' + escapeHtml((normalizedLead.company || 'N').slice(0, 1).toUpperCase()) + '</div><span class="text-sm font-semibold text-slate-900">' + escapeHtml(normalizedLead.company) + '</span></div></td>' +
            '<td class="px-4 py-4"><span class="text-sm text-slate-600">' + escapeHtml(normalizedLead.contact) + '</span></td>' +
            '<td class="px-4 py-4"><span class="text-sm font-bold text-slate-900">' + escapeHtml(formatMoney(normalizedLead.value, { currency: normalizedLead.currency })) + '</span></td>' +
            '<td class="px-4 py-4"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ' + statusBadgeClass(normalizedLead.status) + '">' + escapeHtml(normalizedLead.status) + '</span></td>' +
            '<td class="px-4 py-4"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ' + lifecycleBadgeClass(leadLifecycleLabel(normalizedLead)) + '">' + escapeHtml(leadLifecycleLabel(normalizedLead)) + '</span></td>' +
            '<td class="px-4 py-4"><div class="flex flex-wrap gap-1"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">' + escapeHtml(normalizedLead.industry) + '</span></div></td>' +
            '<td class="px-4 py-4"><div class="flex items-center gap-2"><div class="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">' + escapeHtml(String(normalizedLead.owner || 'U').slice(0, 1).toUpperCase()) + '</div><span class="text-sm text-slate-600">' + escapeHtml(normalizedLead.owner) + '</span></div></td>' +
            '<td class="px-4 py-4 text-sm text-slate-500">' + escapeHtml(formatDisplayDate(normalizedLead.date)) + '</td>' +
            '<td class="px-4 py-4 text-right"><button class="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded transition-colors" data-row-action="details"><span class="material-symbols-outlined">more_vert</span></button></td>';
        row.dataset.leadId = normalizedLead.id;
        row.dataset.leadDateIso = parseDateValue(normalizedLead.date).toISOString();
        row.dataset.leadValue = String(normalizedLead.value);
        row.dataset.leadStatus = normalizedLead.status;
        row.dataset.leadLifecycle = leadLifecycleLabel(normalizedLead);
        row.dataset.leadOwner = normalizedLead.owner;
        row.dataset.leadCompany = normalizedLead.company;
        row.dataset.leadLocation = JSON.stringify(normalizedLead.location || getCurrentLocation());
        return row;
    }

    function rebuildManageLeadTableFromState() {
        if (pageName() !== 'manage_leads.html') {
            return;
        }
        const tbody = qs('table tbody');
        if (!tbody) {
            return;
        }
        const leads = getAllLeads();
        tbody.innerHTML = '';
        if (!leads.length) {
            tbody.innerHTML = '<tr><td colspan="11" class="px-6 py-10 text-center text-sm text-slate-500">No leads available yet.</td></tr>';
            return;
        }
        leads.forEach((lead) => tbody.appendChild(buildManageLeadRow(lead)));
    }

    function buildReviewLeadRow(lead) {
        const normalizedLead = normalizeLead(lead);
        const leadAgeDays = daysSinceDate(normalizedLead.date);
        const row = document.createElement('tr');
        row.className = 'hover:bg-slate-50/50 transition-colors group';
        row.dataset.leadId = normalizedLead.id;
        row.dataset.leadDateIso = parseDateValue(normalizedLead.date).toISOString();
        row.dataset.leadStatus = normalizedLead.status;
        row.dataset.leadLifecycle = leadLifecycleLabel(normalizedLead);
        row.dataset.leadOwner = normalizedLead.owner;
        row.dataset.leadAgeDays = String(leadAgeDays);
        row.dataset.leadLocation = JSON.stringify(normalizedLead.location || getCurrentLocation());
        row.innerHTML =             '<td class="px-6 py-4 text-sm font-medium text-primary">#' + escapeHtml(normalizedLead.id) + '</td>' +
            '<td class="px-6 py-4"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">' + escapeHtml((normalizedLead.company || 'N').slice(0, 2).toUpperCase()) + '</div><span class="text-sm font-semibold text-on-surface">' + escapeHtml(normalizedLead.company) + '</span></div></td>' +
            '<td class="px-6 py-4"><div class="flex flex-col"><span class="text-sm font-medium text-on-surface">' + escapeHtml(normalizedLead.contact) + '</span><span class="text-xs text-on-surface-variant">' + escapeHtml(normalizedLead.industry) + '</span></div></td>' +
            '<td class="px-6 py-4 text-sm font-semibold text-on-surface">' + escapeHtml(formatMoney(normalizedLead.value, { currency: normalizedLead.currency })) + '</td>' +
            '<td class="px-6 py-4"><span class="px-2 py-1 rounded-full text-[10px] font-bold uppercase ' + statusBadgeClass(normalizedLead.status) + '">' + escapeHtml(normalizedLead.status) + '</span></td>' +
            '<td class="px-6 py-4"><span class="px-2 py-1 rounded-full text-[10px] font-bold uppercase ' + lifecycleBadgeClass(leadLifecycleLabel(normalizedLead)) + '">' + escapeHtml(leadLifecycleLabel(normalizedLead)) + '</span></td>' +
            '<td class="px-6 py-4"><div class="flex items-center gap-2"><div class="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">' + escapeHtml(String(normalizedLead.owner || 'U').slice(0, 1).toUpperCase()) + '</div><span class="text-sm text-on-surface">' + escapeHtml(normalizedLead.owner) + '</span></div></td>' +
            '<td class="px-6 py-4 text-sm text-on-surface-variant">' + escapeHtml(`${leadAgeDays} days`) + '</td>' +
            '<td class="px-6 py-4 text-sm text-on-surface-variant">' + escapeHtml(formatDisplayDate(normalizedLead.date)) + '</td>' +
            '<td class="px-6 py-4 text-right"><div class="flex items-center justify-end gap-1"><button class="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all active:scale-90" title="Comments"><span class="material-symbols-outlined text-xl">forum</span></button><button class="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all active:scale-90" title="Timeline"><span class="material-symbols-outlined text-xl">history</span></button><button class="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all active:scale-90" title="Change Owner"><span class="material-symbols-outlined text-xl">person_add</span></button><button class="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all active:scale-90" title="Location"><span class="material-symbols-outlined text-xl">location_on</span></button></div></td>';
        return row;
    }

    function rebuildReviewLeadTableFromState() {
        if (pageName() !== 'review_leads.html') {
            return;
        }
        const tbody = qs('table tbody');
        if (!tbody) {
            return;
        }
        const leads = getAllLeads();
        tbody.innerHTML = '';
        if (!leads.length) {
            tbody.innerHTML = '<tr><td colspan="10" class="px-6 py-10 text-center text-sm text-slate-500">No leads available for review yet.</td></tr>';
            return;
        }
        leads.forEach((lead) => tbody.appendChild(buildReviewLeadRow(lead)));
    }

    function initLoginPage() {
        const form = qs('#loginForm');
        if (!form) {
            return;
        }
        if (!getAuthToken() && sessionStorage.getItem(SESSION_FLAGS.logoutGuard) === 'true') {
            history.pushState(null, '', window.location.href);
            if (!window.__grassrootsLogoutBackGuardBound) {
                window.__grassrootsLogoutBackGuardBound = true;
                window.addEventListener('popstate', () => {
                    if (!getAuthToken() && sessionStorage.getItem(SESSION_FLAGS.logoutGuard) === 'true') {
                        history.pushState(null, '', window.location.href);
                        window.location.replace(routePath('Login.html'));
                    }
                });
            }
        }
        const navigationEntry = performance.getEntriesByType('navigation')[0];
        if (getAuthToken() && navigationEntry && navigationEntry.type === 'back_forward') {
            clearAuthState();
        }
        form.noValidate = true;
        form.setAttribute('action', '#');
        window.alert = function () { };
        const usernameInput = qs('#username');
        const passwordInput = qs('#password');
        const fieldConfigs = [
            { input: usernameInput, message: 'Username is required' },
            { input: passwordInput, message: 'Password is required' }
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
            if (!errorNode || !input) {
                return;
            }
            errorNode.textContent = message;
            errorNode.style.display = 'block';
            input.style.border = '1px solid rgba(186, 26, 26, 0.35)';
            input.style.boxShadow = '0 0 0 1px rgba(186, 26, 26, 0.12)';
        }
        function clearFieldError(input) {
            if (!input) {
                return;
            }
            const wrapper = getFieldWrapper(input);
            const errorNode = wrapper ? qs('[data-field-error]', wrapper) : null;
            if (errorNode) {
                errorNode.textContent = '';
                errorNode.style.display = 'none';
            }
            input.style.border = '';
            input.style.boxShadow = '';
        }
        fieldConfigs.forEach(({ input, message }) => {
            ensureErrorNode(input);
            input?.addEventListener('input', () => {
                if (input.value.trim()) {
                    clearFieldError(input);
                } else {
                    showFieldError(input, message);
                }
            });
        });
        function redirectToDashboard() {
            const dashboardUrl = new URL(routePath('dashboard.html'), window.location.origin).href;
            window.location.replace(dashboardUrl);
        }
        async function validateLogin(event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
                if (typeof event.stopImmediatePropagation === 'function') {
                    event.stopImmediatePropagation();
                }
            }
            const usernameValue = usernameInput.value.trim();
            const passwordValue = passwordInput.value.trim();
            let hasError = false;
            if (!usernameValue) {
                showFieldError(usernameInput, 'Username is required');
                hasError = true;
            } else {
                clearFieldError(usernameInput);
            }
            if (!passwordValue) {
                showFieldError(passwordInput, 'Password is required');
                hasError = true;
            } else {
                clearFieldError(passwordInput);
            }

            if (hasError) {
                const firstInvalid = [usernameInput, passwordInput].find((input) => {
                    const wrapper = getFieldWrapper(input);
                    const errorNode = wrapper ? qs('[data-field-error]', wrapper) : null;
                    return errorNode && errorNode.style.display === 'block';
                });
                firstInvalid?.focus();
                return false;
            }
            try {
                const payload = await apiRequest('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ username: usernameValue, password: passwordValue })
                });
                if (!payload || !payload.token || !payload.user) {
                    throw new Error('Login did not return a valid session.');
                }
                setAuthToken(payload.token);
                setSessionExpiresAt(payload.expiresAt || '');
                setProfile(applyProfileFromUser(payload.user));
                sessionStorage.removeItem(SESSION_FLAGS.logoutGuard);
                toast('Signed in successfully.', 'success');
                APP_STATE.hydrated = false;
                void hydrateBackendState();
                try {
                    captureBrowserLocation(() => { }, { highAccuracy: false, useCache: true });
                } catch (error) {
                    // no-op
                }
                setTimeout(redirectToDashboard, 120);
                return false;
            } catch (error) {
                clearFieldError(passwordInput);
                showFieldError(passwordInput, error.message || 'Username or password is incorrect');
                toast(error.message || 'Unable to sign you in right now.', 'warning');
                return false;
            }
        }
        form.addEventListener('submit', validateLogin);
        const submitButton = qs('button[type="submit"]', form);
        submitButton?.addEventListener('click', validateLogin);
        form.onsubmit = validateLogin;
    }

    function initDashboardPage() {
        const analytics = computeAnalytics();

        const kpiLabels = qsa('p').filter((node) => [
            'Total Pipeline',
            'Deals in Play',
            'Closed Won',
            'Win Rate',
            'Avg Deal Size'
        ].includes(node.textContent.trim()));

        kpiLabels.forEach((labelNode) => {
            const valueNode = qs('.dashboard-kpi-value', labelNode.parentElement);
            if (!valueNode) {
                return;
            }
            const label = labelNode.textContent.trim();
            if (label === 'Total Pipeline') {
                valueNode.textContent = formatMoney(analytics.pipelineValue, { currency: analytics.commonCurrency });
            } else if (label === 'Deals in Play') {
                valueNode.textContent = String(analytics.openLeads.length);
            } else if (label === 'Closed Won') {
                valueNode.textContent = String(analytics.wonLeads.length);
            } else if (label === 'Win Rate') {
                valueNode.textContent = formatPercent(analytics.winRate, 0);
            } else if (label === 'Avg Deal Size') {
                valueNode.textContent = formatMoney(analytics.avgDealSize, { currency: analytics.commonCurrency });
            }
        });

        const trendHost = qs('#dashboard-win-rate-chart');
        const trendActualLabel = qs('#dashboard-win-rate-actual');
        const trendTargetLabel = qs('#dashboard-win-rate-target');

        if (trendHost) {
            const ownerSummaries = (Array.isArray(APP_STATE.ownerTargetSummaries) ? APP_STATE.ownerTargetSummaries : [])
                .map((summary) => ({
                    owner: String(summary.owner || '').trim(),
                    targetAmount: Number(summary.quarterTargetAmount || 0),
                    closedAmount: Number(summary.quarterClosedAmount || 0)
                }))
                .filter((summary) => summary.owner);
            const ownerBars = ownerSummaries.length
                ? ownerSummaries
                : analytics.ownerRanking.map((entry) => ({
                    owner: entry.owner,
                    targetAmount: 0,
                    closedAmount: Number(entry.revenueContributed || 0)
                }));
            const chartWidth = 420;
            const chartHeight = 210;
            const axisLeft = 28;
            const axisRight = 402;
            const axisTop = 20;
            const axisBottom = 162;
            const axisSpan = axisBottom - axisTop;
            const groupWidth = ownerBars.length ? (axisRight - axisLeft) / ownerBars.length : 64;
            const maxAmount = Math.max(1, ...ownerBars.flatMap((entry) => [entry.targetAmount, entry.closedAmount]));
            const scaleY = (value) => axisBottom - ((Math.max(0, Number(value || 0)) / maxAmount) * axisSpan);
            const formatOwnerLabel = (owner) => owner.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || owner.slice(0, 2).toUpperCase();
            const teamTargetAmount = ownerBars.reduce((sum, entry) => sum + entry.targetAmount, 0);
            const teamClosedAmount = ownerBars.reduce((sum, entry) => sum + entry.closedAmount, 0);

            trendHost.innerHTML = `
                <svg class="w-full h-full" preserveAspectRatio="none" viewBox="0 0 ${chartWidth} ${chartHeight}">
                    <line stroke="#CBD5E1" stroke-width="2" x1="${axisLeft}" x2="${axisRight}" y1="${axisBottom}" y2="${axisBottom}"></line>
                    ${ownerBars.map((entry, index) => {
                        const centerX = axisLeft + (groupWidth * index) + (groupWidth / 2);
                        const barWidth = Math.min(20, Math.max(12, (groupWidth - 20) / 2));
                        const targetX = centerX - barWidth - 4;
                        const actualX = centerX + 4;
                        const targetY = scaleY(entry.targetAmount);
                        const actualY = scaleY(entry.closedAmount);
                        const targetHeight = Math.max(0, axisBottom - targetY);
                        const actualHeight = Math.max(0, axisBottom - actualY);
                        return `
                            <rect x="${targetX}" y="${targetY}" width="${barWidth}" height="${targetHeight}" rx="6" fill="#CBD5E1"></rect>
                            <rect x="${actualX}" y="${actualY}" width="${barWidth}" height="${actualHeight}" rx="6" fill="#004AC6"></rect>
                            <text x="${centerX}" y="184" text-anchor="middle" fill="#64748B" font-size="10" font-weight="700">${escapeHtml(formatOwnerLabel(entry.owner))}</text>
                        `;
                    }).join('')}
                </svg>
            `;
            trendHost.setAttribute('title', ownerBars.map((entry) => `${entry.owner}: Closed ${formatMoney(entry.closedAmount, { currency: DISPLAY_CURRENCY })} / Target ${formatMoney(entry.targetAmount, { currency: DISPLAY_CURRENCY })}`).join('\n'));
            if (trendActualLabel) {
                trendActualLabel.textContent = `Team Closed: ${formatMoney(teamClosedAmount, { currency: DISPLAY_CURRENCY })}`;
            }
            if (trendTargetLabel) {
                trendTargetLabel.textContent = `Team Target: ${formatMoney(teamTargetAmount, { currency: DISPLAY_CURRENCY })}`;
            }
        }

        const weeklyChart = qs('#dashboard-weekly-lead-chart');
        if (weeklyChart) {
            const maxTotal = Math.max(1, ...analytics.weeklyLeadBuckets.map((bucket) => bucket.total));
            const chartColors = {
                prospecting: 'bg-amber-400',
                qualification: 'bg-sky-400',
                proposal: 'bg-indigo-400',
                negotiation: 'bg-purple-500',
                dealWon: 'bg-emerald-500',
                dealLost: 'bg-rose-500'
            };
            const statusOrder = ['prospecting', 'qualification', 'proposal', 'negotiation', 'dealWon', 'dealLost'];

            weeklyChart.innerHTML = analytics.weeklyLeadBuckets.map((bucket) => {
                const visibleSegments = statusOrder.filter((key) => bucket[key] > 0);
                const segments = visibleSegments.map((key, index) => {
                    const height = Math.max(6, Math.round((bucket[key] / maxTotal) * 100));
                    const roundedClass = visibleSegments.length === 1
                        ? 'rounded-sm'
                        : index === 0
                            ? 'rounded-t-sm'
                            : index === visibleSegments.length - 1
                                ? 'rounded-b-sm'
                                : '';
                    return `<div class="w-full ${chartColors[key]} ${roundedClass}" style="height:${height}%"></div>`;
                }).join('');

                return `
                    <div class="flex-1 flex flex-col justify-end gap-1 h-full pb-6 min-w-0">
                        ${segments || '<div class="w-full bg-slate-200 rounded-sm" style="height:4%"></div>'}
                        <span class="text-[10px] font-bold text-slate-400 text-center mt-2">${bucket.label}</span>
                    </div>
                `;
            }).join('');
        }

        const weeklyUploaded = qs('#dashboard-weekly-uploaded');
        const weeklyOpen = qs('#dashboard-weekly-open');
        const weeklyClosed = qs('#dashboard-weekly-closed');
        if (weeklyUploaded) {
            weeklyUploaded.textContent = String(analytics.weeklyUploadedLeads);
        }
        if (weeklyOpen) {
            weeklyOpen.textContent = String(analytics.weeklyOpenLeads);
        }
        if (weeklyClosed) {
            weeklyClosed.textContent = String(analytics.weeklyClosedLeads);
        }

        const feedHost = qs('#dashboard-intelligence-feed');
        if (feedHost) {
            feedHost.innerHTML = buildIntelligenceFeedMarkup(analytics.recentActivity);
        }
    }

    function initAddLeadPage() {
        const createButton = qsa('main button').find((button) => button.textContent.includes('Create Lead Entry'));
        const businessUnitHeading = qsa('main h3').find((heading) => heading.textContent.includes('Company Details'));
        const mobileLinks = qsa('nav a[href="#"]');
        const clientNameInput = document.getElementById('client-name-input');
        const clientNameSuggestions = document.getElementById('client-name-suggestions');
        const businessUnitInput = document.getElementById('business-unit-input');
        const lobInput = document.getElementById('lob-input');
        const contactNameInput = document.getElementById('contact-name-input');
        const phoneInput = document.getElementById('contact-phone-input');
        const emailInput = document.getElementById('contact-email-input');
        const industrySelect = document.getElementById('industry-select');
        const industryOtherWrap = document.getElementById('industry-other-wrap');
        const industryOtherInput = document.getElementById('industry-other-input');
        const sourceSelect = document.getElementById('lead-source-select');
        const opportunityNameInput = document.getElementById('opportunity-name-input');
        const descriptionInput = document.getElementById('opportunity-description-input');
        const annualValueInput = document.getElementById('annual-value-input');
        const currencySelect = document.getElementById('currency-select');
        const statusSelect = document.getElementById('lead-status-select');
        const nextActionInput = document.getElementById('next-action-input');

        if (businessUnitHeading) {
            businessUnitHeading.textContent = 'Step 1 - Business Unit Details';
        }

        function syncIndustryOtherField() {
            const showOther = industrySelect && industrySelect.value === 'Other';
            if (industryOtherWrap) {
                industryOtherWrap.classList.toggle('hidden', !showOther);
            }
            if (industryOtherInput && !showOther) {
                industryOtherInput.value = '';
            }
        }

        if (industrySelect) {
            industrySelect.addEventListener('change', syncIndustryOtherField);
            syncIndustryOtherField();
        }

        const draftBindings = [
            ['businessUnit', businessUnitInput],
            ['clientName', clientNameInput],
            ['lob', lobInput],
            ['contact', contactNameInput],
            ['phone', phoneInput],
            ['email', emailInput],
            ['industry', industrySelect],
            ['industryOther', industryOtherInput],
            ['source', sourceSelect],
            ['opportunityName', opportunityNameInput],
            ['description', descriptionInput],
            ['value', annualValueInput],
            ['currency', currencySelect],
            ['status', statusSelect],
            ['nextAction', nextActionInput]
        ];

        function restoreAddLeadDraft() {
            const draft = getAddLeadDraft();
            draftBindings.forEach(([key, field]) => {
                if (!field || !Object.prototype.hasOwnProperty.call(draft, key)) {
                    return;
                }
                field.value = String(draft[key] || '');
            });
            syncIndustryOtherField();
        }

        function persistAddLeadDraft() {
            const nextDraft = {};
            draftBindings.forEach(([key, field]) => {
                if (!field) {
                    return;
                }
                nextDraft[key] = field.value;
            });
            setAddLeadDraft(nextDraft);
        }

        restoreAddLeadDraft();
        draftBindings.forEach(([, field]) => {
            if (!field) {
                return;
            }
            const eventName = field.tagName === 'SELECT' ? 'change' : 'input';
            field.addEventListener(eventName, persistAddLeadDraft);
            if (eventName !== 'change') {
                field.addEventListener('change', persistAddLeadDraft);
            }
        });

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

            clientNameSuggestions.innerHTML = matches.map((name) => `
                <button
                    type="button"
                    class="client-name-option flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                    data-client-name="${escapeHtml(name)}"
                >
                    <span class="font-medium">${escapeHtml(name)}</span>
                    <span class="text-xs uppercase tracking-[0.18em] text-on-surface-variant">Client</span>
                </button>
            `).join('');

            clientNameSuggestions.classList.remove('hidden');
            qsa('.client-name-option', clientNameSuggestions).forEach((optionButton) => {
                optionButton.addEventListener('click', () => {
                    clientNameInput.value = optionButton.getAttribute('data-client-name') || '';
                    persistAddLeadDraft();
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
            const targets = ['dashboard.html', 'add_lead.html', 'manage_leads.html', 'reports.html'];
            link.addEventListener('click', (event) => {
                event.preventDefault();
                window.location.href = routePath(targets[index] || 'dashboard.html');
            });
        });

        if (!createButton) {
            return;
        }

        createButton.addEventListener('click', async () => {
            const organizationInput = businessUnitInput;
            const currentClientInput = clientNameInput;
            const resolvedIndustry = industrySelect?.value === 'Other'
                ? String(industryOtherInput?.value || '').trim()
                : String(industrySelect?.value || '').trim();

            const requiredFields = [
                { field: organizationInput, label: 'Business Unit' },
                { field: contactNameInput, label: 'Contact Name' },
                { field: phoneInput, label: 'Phone' },
                { field: emailInput, label: 'Email' },
                { field: industrySelect, label: 'Industry' },
                { field: opportunityNameInput, label: 'Opportunity Name' },
                { field: annualValueInput, label: 'Annual Value' },
                { field: descriptionInput, label: 'Opportunity Description' }
            ];

            const missing = requiredFields.find((item) => !item.field.value.trim());
            if (missing) {
                toast(`${missing.label} is required before creating the lead.`, 'error');
                missing.field.focus();
                return;
            }

            if (industrySelect?.value === 'Other' && !resolvedIndustry) {
                toast('Other Industry is required before creating the lead.', 'error');
                industryOtherInput?.focus();
                return;
            }

            const leadRecord = {
                id: `LD-${Math.floor(1000 + Math.random() * 9000)}`,
                businessUnit: organizationInput.value.trim(),
                company: organizationInput.value.trim(),
                opportunityName: opportunityNameInput.value.trim(),
                contact: contactNameInput.value.trim(),
                clientName: currentClientInput.value.trim() || organizationInput.value.trim(),
                phone: phoneInput.value.trim(),
                email: emailInput.value.trim(),
                lob: lobInput.value.trim(),
                industry: resolvedIndustry || lobInput.value.trim() || 'General',
                source: sourceSelect.value,
                value: annualValueInput.value.trim(),
                currency: currencySelect.value,
                status: statusSelect.value,
                lifecycle: 'Active',
                progress: '25',
                nextAction: nextActionInput.value.trim(),
                description: descriptionInput.value.trim(),
                date: new Date().toISOString()
            };

            const location = await new Promise((resolve) => {
                captureBrowserLocation(resolve, { highAccuracy: true, useCache: false, timeout: 10000 });
            });
            leadRecord.location = location;

            try {
                const createdLead = await apiRequest('/leads', {
                    method: 'POST',
                    body: JSON.stringify(leadRecord)
                });
                const leadToStore = upsertLeadIntoState(createdLead || leadRecord) || normalizeLead(createdLead || leadRecord);
                await refreshOwnerTargetSummaries().catch(() => null);
                refreshDashboardIfVisible();
                refreshOwnerLeadsIfVisible();

                const existingClient = getAllClients().find((client) => String(client.name || '').trim().toLowerCase() === String(leadToStore.clientName || '').trim().toLowerCase());
                if (!existingClient && leadToStore.clientName) {
                    const createdClient = await apiRequest('/clients', {
                        method: 'POST',
                        body: JSON.stringify({
                            name: leadToStore.clientName,
                            category: leadToStore.industry || leadToStore.lob || 'General',
                            projects: 1,
                            leads: 1
                        })
                    }).catch(() => null);
                    if (createdClient) {
                        upsertClientIntoState(createdClient);
                    }
                }

                ensureClientProfileForLead(leadToStore);
                clearAddLeadDraft();

                toast('Lead entry created successfully.', 'success');
                broadcastActivityChange();
                setTimeout(() => {
                    window.location.href = routePath('manage_leads.html');
                }, 700);
            } catch (error) {
                toast(error.message || 'Lead entry could not be created.', 'error');
            }
        });
    }

    function initManageLeadsPage() {
        ensureLeadLifecycleColumns('manage');
        rebuildManageLeadTableFromState();

        const searchInput = qs('input[placeholder="Search leads, business units, or people..."]');
        if (!searchInput) {
            return;
        }

        const statusSelect = qsa('select')[0];
        const clientSelect = document.getElementById('manage-client-filter');
        const dateButton = qsa('button').find((button) => button.textContent.includes('Date Range'));
        const deleteButton = qsa('button').find((button) => button.textContent.includes('Delete Selected'));
        const exportButton = qsa('button').find((button) => button.textContent.includes('Export Selected'));
        const changeStatusButton = qsa('button').find((button) => button.textContent.includes('Change Status'));
        const newLeadButton = qsa('button').find((button) => button.textContent.includes('New Lead'));
        const selectedLabel = qsa('span').find((span) => span.textContent.includes('Leads Selected'));
        const summaryLabel = qsa('p').find((node) => node.textContent.includes('Showing'));
        const bulkActionsBar = qs('#bulk-actions-bar');
        const paginationButtons = qsa('button').filter((button) => ['Previous', '1', '2', '3', 'Next'].includes(button.textContent.trim()));
        const prevButton = paginationButtons.find((button) => button.textContent.trim() === 'Previous');
        const nextButton = paginationButtons.find((button) => button.textContent.trim() === 'Next');
        const numberButtons = paginationButtons.filter((button) => /^\d+$/.test(button.textContent.trim())).slice(0, 3);
        const rows = qsa('tbody tr').filter((row) => row.querySelector('td'));
        const allCheckbox = qs('thead input[type="checkbox"]');
        const fab = qsa('button').find((button) => button.className.includes('fixed bottom-8 right-8'));
        let activeDateRange = { kind: 'any', label: 'Any time' };

        if (clientSelect) {
            const clientOptions = ['Client: All', ...getAllClients().map((client) => client.name)];
            clientSelect.innerHTML = clientOptions
                .map((name, index) => `<option value="${escapeHtml(name)}"${index === 0 ? ' selected' : ''}>${escapeHtml(name)}</option>`)
                .join('');
        }

        function rowData(row) {
            const cells = qsa('td', row);
            const lead = getLeadFromRow(row);
            return {
                id: (row.dataset.leadId || cells[1]?.innerText.trim() || '').toLowerCase(),
                company: (row.dataset.leadCompany || cells[2]?.innerText.trim() || '').toLowerCase(),
                clientName: String(lead?.clientName || lead?.company || cells[2]?.innerText.trim() || '').toLowerCase(),
                contact: cells[3]?.innerText.trim().toLowerCase() || '',
                value: String(parseNumericValue(row.dataset.leadValue || cells[4]?.innerText.trim())).toLowerCase(),
                status: (row.dataset.leadStatus || cells[5]?.innerText.trim() || '').toLowerCase(),
                lifecycle: (row.dataset.leadLifecycle || cells[6]?.innerText.trim() || '').toLowerCase(),
                tags: cells[7]?.innerText.trim().toLowerCase() || '',
                owner: (row.dataset.leadOwner || cells[8]?.innerText.trim() || '').toLowerCase(),
                dateIso: row.dataset.leadDateIso || parseDateValue(cells[9]?.innerText.trim()).toISOString()
            };
        }

        function getSelectedRows() {
            return rows.filter((row) => row.isConnected && row.querySelector('input[type="checkbox"]')?.checked);
        }

        function getLeadFromRow(row) {
            return findLeadById(row.dataset.leadId || qsa('td', row)[1]?.textContent.trim());
        }

        function refreshRow(row) {
            const refreshedLead = getLeadFromRow(row);
            if (refreshedLead) {
                applyLeadToManageRow(row, refreshedLead);
            }
        }

        function refreshQuickMetrics() {
            const analytics = computeAnalytics();
            qsa('p').filter((node) => ['Pipeline Value', 'Active Leads', 'High Potential', 'Conv. Rate'].includes(node.textContent.trim())).forEach((labelNode) => {
                const valueNode = qsa('p', labelNode.parentElement)[1];
                if (!valueNode) {
                    return;
                }
                if (labelNode.textContent.trim() === 'Pipeline Value') {
                    valueNode.textContent = formatMoney(analytics.pipelineValue, { currency: analytics.commonCurrency });
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
                const clientMatch = !clientSelect || clientSelect.selectedIndex === 0 || data.clientName === clientSelect.value.toLowerCase();
                const searchMatch = !query || Object.values(data).some((value) => value.includes(query));
                const dateMatch = matchesDateRange(data.dateIso, activeDateRange);
                return statusMatch && clientMatch && searchMatch && dateMatch;
            },
            summaryLabel,
            prevButton,
            nextButton,
            numberButtons,
            pageSize: 3,
            onRender: () => updateSelectedCount()
        });

        [statusSelect, clientSelect].forEach((select) => {
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
                    return [1, 2, 3, 4, 5, 6, 8].map((index) => cells[index].innerText.trim());
                });
                downloadExcelTable('selected-leads.xls', ['Lead ID', 'Business Unit', 'Contact', 'Value', 'Status', 'State', 'Owner'], exportRows, 'Selected Leads');
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
                        { name: 'status', label: 'New Status', type: 'select', value: 'Prospecting', required: true, options: statusCycle }
                    ],
                    onSubmit: ({ status }) => {
                        selectedRows.forEach((row) => {
                            saveLeadPatch(row.dataset.leadId || qsa('td', row)[1]?.textContent.trim(), { status });
                            refreshRow(row);
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
                window.location.href = routePath('add_lead.html');
            });
        }

        qsa('tbody button').forEach((button) => {
            button.addEventListener('click', () => {
                const row = button.closest('tr');
                const lead = row ? getLeadFromRow(row) : null;
                const company = lead?.company || (row ? qsa('td', row)[2].innerText.trim() : 'lead');
                const actions = [
                    {
                        label: 'View Lead',
                        className: 'px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold bg-white',
                        onClick: () => {
                            if (!lead) {
                                toast('Lead details are not available yet.', 'warning');
                                return;
                            }
                            openLeadDetailModal(lead, { onSave: () => { refreshRow(row); pager.render(); refreshQuickMetrics(); } });
                        }
                    }
                ];

                if (lead && canEditLead(lead)) {
                    actions.push({
                        label: 'Edit Lead',
                        className: 'px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold bg-white',
                        onClick: () => {
                            openLeadEditModal(lead, { onSave: () => { refreshRow(row); pager.render(); refreshQuickMetrics(); } });
                        }
                    });
                }

                if (lead && isLeadOpen(lead)) {
                    actions.push({
                        label: leadLifecycleLabel(lead) === 'Hold' ? 'Mark Active' : 'Move to Hold',
                        className: 'px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold bg-white',
                        onClick: () => {
                            saveLeadPatch(lead.id, { lifecycle: leadLifecycleLabel(lead) === 'Hold' ? 'Active' : 'Hold' });
                            refreshRow(row);
                            pager.render();
                            refreshQuickMetrics();
                            toast(`Lead moved to ${leadLifecycleLabel(findLeadById(lead.id))}.`, 'success');
                        }
                    });
                }

                actions.push(
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
                                    { name: 'status', label: 'Lead Status', type: 'select', value: lead?.status || 'Prospecting', required: true, options: statusCycle }
                                ],
                                onSubmit: ({ status }) => {
                                    if (!lead) {
                                        return;
                                    }
                                    saveLeadPatch(lead.id, { status });
                                    refreshRow(row);
                                    pager.render();
                                    refreshQuickMetrics();
                                    toast(`Lead status moved to ${status}.`, 'success');
                                }
                            });
                        }
                    }
                );

                const { dropdown, close } = openAnchoredDropdown(
                    button,
                    `<div class="p-3">
                        <div class="px-3 pb-3 border-b border-slate-200">
                            <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Lead Actions</p>
                            <p class="mt-1 text-sm font-semibold text-slate-900">${escapeHtml(company)}</p>
                            <p class="text-xs text-slate-500 mt-1">Choose the next action for this lead.</p>
                        </div>
                        <div class="pt-3 space-y-2" data-manage-actions-menu></div>
                    </div>`
                );

                const actionsHost = qs('[data-manage-actions-menu]', dropdown);
                actions.forEach((action) => {
                    const actionButton = document.createElement('button');
                    actionButton.type = 'button';
                    actionButton.className = 'w-full flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left hover:border-primary/20 hover:bg-slate-50 transition-colors';
                    actionButton.innerHTML = `
                        <div>
                            <p class="text-sm font-semibold text-slate-900">${escapeHtml(action.label)}</p>
                            <p class="text-xs text-slate-500 mt-1">Run this action for the selected lead.</p>
                        </div>
                        <span class="material-symbols-outlined text-slate-400">chevron_right</span>
                    `;
                    actionButton.addEventListener('click', () => {
                        close();
                        if (action.onClick) {
                            action.onClick(() => { });
                        }
                    });
                    actionsHost?.appendChild(actionButton);
                });
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
                openLeadDetailModal(lead, { onSave: () => { refreshRow(row); pager.render(); refreshQuickMetrics(); } });
            });
            row.style.cursor = 'pointer';
        });

        if (fab) {
            fab.addEventListener('click', () => {
                window.location.href = routePath('add_lead.html');
            });
        }

        updateSelectedCount();
        refreshQuickMetrics();
    }

    function initReviewLeadsPage() {
        ensureLeadLifecycleColumns('review');
        rebuildReviewLeadTableFromState();

        const searchInput = qs('input[placeholder="Search leads by ID, Business Unit or Owner..."]');
        if (!searchInput) {
            return;
        }

        const rows = qsa('tbody tr').filter((row) => row.querySelector('td'));
        const filterSelect = qsa('select').find((select) => select.options[0]?.textContent.includes('Filter:'));
        const exportButton = qsa('button').find((button) => button.textContent.includes('Export'));
        const updateModelButton = qsa('button').find((button) => button.textContent.includes('Update Model'));
        const summaryLabel = qsa('span').find((span) => span.textContent.includes('Showing 1-3'));
        const prevButton = qsa('button').find((button) => button.textContent.trim() === 'Previous');
        const nextButton = qsa('button').find((button) => button.textContent.trim() === 'Next');
        const numberButtons = qsa('button').filter((button) => ['1', '2', '3'].includes(button.textContent.trim())).slice(0, 3);
        const queueHealthCopy = qsa('p').find((paragraph) => paragraph.textContent.includes('Lead processing speed'));
        const filterModes = ['All Leads', 'Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Deal Won', 'Deal Lost'];
        let filterIndex = 0;
        let activeRow = rows[0] || null;

        function refreshQueueHealth() {
            const analytics = computeAnalytics();
            const heading = qsa('h3').find((node) => node.textContent.trim() === 'Queue Health');
            const statValues = heading ? qsa('p', heading.parentElement.parentElement).filter((node) => node.className.includes('font-bold')) : [];
            const statLabels = heading ? qsa('p', heading.parentElement.parentElement).filter((node) => node.className.includes('uppercase') && !node.className.includes('font-bold')) : [];
            if (statValues[0]) {
                statValues[0].textContent = String(analytics.pendingReview);
            }
            if (statValues[1]) {
                statValues[1].textContent = String(analytics.hotLeads.length);
            }
            if (statLabels[0]) {
                statLabels[0].textContent = 'Pending Review';
            }
            if (statLabels[1]) {
                statLabels[1].textContent = 'High Priority';
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
                lifecycle: cells[5]?.innerText.trim() || '',
                owner: cells[6]?.innerText.trim() || '',
                ageDays: cells[7]?.innerText.trim() || '',
                date: cells[8]?.innerText.trim() || ''
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
                const selectedMode = filterModes[filterIndex] || 'All Leads';
                const filterMatch = selectedMode === 'All Leads'
                    || normalizeStatus(data.status) === normalizeStatus(selectedMode);
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

        if (filterSelect) {
            filterSelect.addEventListener('change', () => {
                filterIndex = Math.max(0, filterModes.findIndex((mode) => mode.toLowerCase() === filterSelect.value.toLowerCase()));
                pager.render();
            });
        }

        if (exportButton) {
            exportButton.addEventListener('click', () => {
                const exportRows = rows
                    .filter((row) => row.style.display !== 'none')
                    .map((row) => Object.values(getRowValues(row)));
                downloadExcelTable('review-queue.xls', ['Lead ID', 'Business Unit', 'Contact', 'Value', 'Status', 'State', 'Owner', 'Age (Days)', 'Created Date'], exportRows, 'Review Queue');
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
                    const sourceLead = getLeadFromReviewRow(row) || findLeadById(data.id.replace('#', '')) || { company: data.company, owner: data.owner, status: data.status, lifecycle: data.lifecycle };
                    if (!canCommentOnLead(sourceLead)) {
                        toast('Comments are disabled once a lead is won or lost.', 'warning');
                        return;
                    }
                    openLeadCommentsModal(sourceLead, data.company);
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
                                            qsa('td', activeRow)[6].querySelector('span.text-sm').textContent = owner;
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
                openLeadDetailModal(lead, { onSave: () => { applyLeadToReviewRow(row, findLeadById(lead.id)); refreshQueueHealth(); pager.render(); } });
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
        const cardGrid = qs('#clients-grid');
        if (!cardGrid) {
            return;
        }

        const searchInput = qs('#clients-search');
        const searchOptions = qs('#clients-search-options');
        const filterSelect = qs('#clients-filter-select');
        const pageSizeSelect = qs('#clients-page-size');
        const newClientButton = qsa('button').find((button) => button.textContent.includes('New Client'));
        const ghostCard = qs('#add-client-ghost');
        const footerLabel = qs('#clients-footer-summary');
        const prevButton = qs('#clients-prev-button');
        const nextButton = qs('#clients-next-button');
        const numberButtons = qsa('[data-page-slot]');
        let currentPage = 1;
        let cards = [];

        function clientLeads(client) {
            const normalizedName = String(client.name || '').trim().toLowerCase();
            return getAllLeads().filter((lead) => {
                const clientName = String(lead.clientName || '').trim().toLowerCase();
                const companyName = String(lead.company || '').trim().toLowerCase();
                return clientName === normalizedName || companyName === normalizedName;
            });
        }

        function buildClientSnapshot(client) {
            const normalizedClient = normalizeClient(client);
            const relatedLeads = clientLeads(normalizedClient);
            const openLeads = relatedLeads.filter((lead) => isLeadOpen(lead));
            const wonLeads = relatedLeads.filter((lead) => isWonStatus(lead.status));
            const pipelineValue = openLeads.reduce((sum, lead) => sum + Number(lead.value || 0), 0);
            const closedValue = wonLeads.reduce((sum, lead) => sum + Number(lead.value || 0), 0);
            const owners = Array.from(new Set(relatedLeads.map((lead) => String(lead.owner || '').trim()).filter(Boolean)));
            return {
                client: normalizedClient,
                relatedLeads,
                openLeads,
                wonLeads,
                pipelineValue,
                closedValue,
                activeProjects: Number(normalizedClient.projects || openLeads.length),
                totalLeads: relatedLeads.length || Number(normalizedClient.leads || 0),
                owners
            };
        }

        function createClientCard(client) {
            const snapshot = buildClientSnapshot(client);
            const normalizedClient = snapshot.client;
            const initials = normalizedClient.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'CL';
            const card = document.createElement('article');
            card.className = 'client-directory-card group rounded-[24px] border border-slate-200/80 bg-white shadow-[0_12px_28px_rgba(15,23,42,0.05)] overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(15,23,42,0.08)] transition-all cursor-pointer';
            card.dataset.clientName = normalizedClient.name;
            card.dataset.clientCategory = normalizedClient.category;
            card.dataset.totalLeads = String(snapshot.totalLeads);
            card.dataset.activeProjects = String(snapshot.activeProjects);
            card.dataset.pipelineValue = String(snapshot.pipelineValue);
            card.dataset.closedValue = String(snapshot.closedValue);
            card.innerHTML = '<div class="px-6 py-6">' +
                    '<div class="flex items-center justify-between gap-4">' +
                        '<div class="flex min-w-0 items-center gap-4">' +
                            '<div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-blue-50 text-sm font-bold text-primary">' + escapeHtml(initials) + '</div>' +
                            '<div class="min-w-0">' +
                                '<h3 class="truncate text-xl font-bold tracking-tight text-slate-900">' + escapeHtml(normalizedClient.name) + '</h3>' +
                                '<p class="mt-2 text-sm text-slate-500">Active Leads</p>' +
                            '</div>' +
                        '</div>' +
                        '<div class="text-right">' +
                            '<p class="text-3xl font-bold text-slate-900">' + snapshot.openLeads.length + '</p>' +
                        '</div>' +
                    '</div>' +
                '</div>';
            return card;
        }

        function rebuildClientCards() {
            cards = getAllClients().map(createClientCard);
            cardGrid.innerHTML = '';
            cards.forEach((card) => cardGrid.appendChild(card));
            if (ghostCard) {
                cardGrid.appendChild(ghostCard);
            }
        }

        function cardCategory(card) {
            return String(card.dataset.clientCategory || '').toLowerCase();
        }

        function cardName(card) {
            return String(card.dataset.clientName || '').trim();
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
                const cardText = card.innerText.toLowerCase();
                const modeMatch = mode === 'all' || cardCategory(card).includes(mode);
                const searchMatch = !query || cardText.includes(query) || cardName(card).toLowerCase().includes(query);
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
                footerLabel.textContent = 'Showing ' + (filtered.length ? Math.min(filtered.length, start + pageSize) : 0) + ' of ' + (filtered.length || 0) + ' clients';
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
                    { name: 'leads', label: 'Total Leads', type: 'number', value: '0', required: true },
                    { name: 'projects', label: 'Active Projects', type: 'number', value: '0', required: true }
                ],
                onSubmit: async ({ name, category, leads, projects }) => {
                    const newClient = { name, category, leads, projects };
                    try {
                        const savedClient = await apiRequest('/clients', {
                            method: 'POST',
                            body: JSON.stringify(newClient)
                        });
                        APP_STATE.clients = [savedClient, ...(Array.isArray(APP_STATE.clients) ? APP_STATE.clients : [])];
                        rebuildClientCards();
                        refreshTopStats();
                        refreshSearchOptions();
                        currentPage = 1;
                        render();
                        toast(name + ' added to the client directory.', 'success');
                    } catch (error) {
                        toast(error.message || 'Unable to create the client right now.', 'warning');
                        return false;
                    }
                }
            });
        }

        function openClientProfile(clientName, category) {
            const normalizedClient = normalizeClient({ name: clientName, category });
            const snapshot = buildClientSnapshot(normalizedClient);
            openModal(
                normalizedClient.name + ' Profile',
                '<div class="space-y-4">' +
                    '<div class="grid grid-cols-2 gap-4">' +
                        '<div class="p-4 rounded-2xl bg-slate-50"><p class="text-xs uppercase text-slate-400 font-bold">Total Leads</p><p class="mt-3 text-xl font-bold text-slate-900">' + escapeHtml(String(snapshot.totalLeads)) + '</p></div>' +
                        '<div class="p-4 rounded-2xl bg-slate-50"><p class="text-xs uppercase text-slate-400 font-bold">Active Leads</p><p class="mt-3 text-xl font-bold text-slate-900">' + escapeHtml(String(snapshot.openLeads.length)) + '</p></div>' +
                    '</div>' +
                    '<div class="rounded-2xl bg-slate-50 p-4">' +
                        '<p class="text-xs uppercase text-slate-400 font-bold mb-3">Leads Under This Client</p>' +
                        (snapshot.relatedLeads.length ? '<div class="space-y-3 max-h-[320px] overflow-y-auto pr-1">' + snapshot.relatedLeads.map((lead) =>
                            '<button type="button" class="client-lead-trigger w-full text-left rounded-xl bg-white border border-slate-200 p-3 hover:border-primary/30 hover:bg-blue-50/40 transition-colors" data-lead-id="' + escapeHtml(lead.id) + '">' +
                                '<div class="flex items-center justify-between gap-3">' +
                                    '<div><p class="font-semibold text-slate-900">' + escapeHtml(lead.company) + '</p><p class="text-sm text-slate-500 mt-1">' + escapeHtml(lead.contact) + ' | ' + escapeHtml(lead.status) + '</p></div>' +
                                    '<div class="text-right"><p class="font-bold text-slate-900">' + escapeHtml(formatMoney(lead.value, { currency: lead.currency })) + '</p><p class="text-xs text-slate-500 mt-1">' + escapeHtml(lead.owner) + '</p></div>' +
                                '</div>' +
                            '</button>'
                        ).join('') + '</div>' : '<p class="text-sm text-slate-500">No leads are linked to this client yet.</p>') +
                    '</div>' +
                '</div>'
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
        }

        if (filterSelect) {
            filterSelect.addEventListener('change', () => {
                currentPage = 1;
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
                render();
            });
        }

        if (newClientButton) {
            newClientButton.addEventListener('click', promptAndCreateClient);
        }

        if (ghostCard) {
            ghostCard.addEventListener('click', promptAndCreateClient);
        }

        cardGrid.addEventListener('click', (event) => {
            const card = event.target.closest('.client-directory-card');
            if (!card) {
                return;
            }
            openClientProfile(card.dataset.clientName || 'Client', card.dataset.clientCategory || '');
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

        rebuildClientCards();
        refreshTopStats();
        refreshSearchOptions();
        render();
    }

    function initReportsPage() {
        const searchInput = qs('input[placeholder="Search reports..."]');
        if (!searchInput) {
            return;
        }

        if (!window.__grassrootsReportsActivityRefreshBound) {
            window.__grassrootsReportsActivityRefreshBound = true;
            window.addEventListener('grassroots:activity-updated', () => {
                if (pageName() === 'reports.html') {
                    initReportsPage();
                }
            });
        }

        const dateTrigger = qs('#reports-date-trigger');
        const datePanel = qs('#reports-date-panel');
        const dateFilterHost = qs('#reports-date-filter');
        const quarterSelect = qs('#reports-quarter-select');
        const monthSelect = qs('#reports-month-select');
        const yearSelect = qs('#reports-year-select');
        const monthWrap = qs('#reports-month-wrap');
        const yearWrap = qs('#reports-year-wrap');
        const exportButton = qsa('button').find((button) => button.textContent.includes('Export Report'));
        const teamPerformanceButton = qs('#team-performance-download') || qsa('button').find((button) => button.textContent.includes('Download Team Performance'));
        const viewAllButton = qs('#team-performance-view-all') || qsa('button').find((button) => button.textContent.includes('View All Members'));
        const teamSummaryHost = qs('#team-performance-summary');
        const teamTableBody = qs('#team-performance-body') || qs('tbody');
        const ytdSectionHost = qs('#reports-ytd-section');
        const topDealsSectionHost = qs('#reports-top-deals-section');
        const deepDiveButton = qsa('button').find((button) => button.textContent.includes('Generate Deep-Dive Comparison'));
        const fiscalQuarterMap = {
            Q1: { label: 'Quarter 1 (Q1)', shortLabel: 'Q1', months: [{ label: 'April', value: '3' }, { label: 'May', value: '4' }, { label: 'June', value: '5' }] },
            Q2: { label: 'Quarter 2 (Q2)', shortLabel: 'Q2', months: [{ label: 'July', value: '6' }, { label: 'August', value: '7' }, { label: 'September', value: '8' }] },
            Q3: { label: 'Quarter 3 (Q3)', shortLabel: 'Q3', months: [{ label: 'October', value: '9' }, { label: 'November', value: '10' }, { label: 'December', value: '11' }] },
            Q4: { label: 'Quarter 4 (Q4)', shortLabel: 'Q4', months: [{ label: 'January', value: '0' }, { label: 'February', value: '1' }, { label: 'March', value: '2' }] }
        };
        let activeRange = { label: 'All Time', kind: 'any' };

        function rangeDisplayLabel(range) {
            if (range.kind === 'custom' && range.label) {
                return range.label;
            }
            return range.label;
        }

        function populateYearOptions(selectedYear) {
            if (!yearSelect) {
                return;
            }
            const currentYear = new Date().getFullYear();
            const baseYear = Number(selectedYear || currentYear);
            const years = [];
            for (let year = currentYear - 2; year <= currentYear + 3; year += 1) {
                years.push(year);
            }
            if (!years.includes(baseYear)) {
                years.push(baseYear);
                years.sort((left, right) => left - right);
            }
            yearSelect.innerHTML = years.map((year) => '<option value="' + year + '" ' + (year === baseYear ? 'selected' : '') + '>' + year + '</option>').join('');
        }

        function populateMonthOptions(quarterKey) {
            if (!monthSelect) {
                return;
            }
            const quarter = fiscalQuarterMap[quarterKey];
            if (!quarter) {
                monthSelect.innerHTML = '';
                return;
            }
            monthSelect.innerHTML = ['<option value="">All months in ' + quarter.shortLabel + '</option>']
                .concat(quarter.months.map((month) => '<option value="' + month.value + '">' + month.label + '</option>'))
                .join('');
        }

        function applyReportDateSelection() {
            const quarterKey = quarterSelect?.value;
            const selectedYear = Number(yearSelect?.value || new Date().getFullYear());
            if (!quarterKey || !fiscalQuarterMap[quarterKey]) {
                return;
            }

            const quarter = fiscalQuarterMap[quarterKey];
            const selectedMonthValue = monthSelect?.value || '';
            let startMonth = Number(quarter.months[0].value);
            let endMonth = Number(quarter.months[quarter.months.length - 1].value);
            let label = quarter.shortLabel + ' ' + selectedYear;

            if (selectedMonthValue !== '') {
                const monthMeta = quarter.months.find((month) => month.value === selectedMonthValue);
                if (monthMeta) {
                    startMonth = Number(monthMeta.value);
                    endMonth = Number(monthMeta.value);
                    label = quarter.shortLabel + ' | ' + monthMeta.label + ' ' + selectedYear;
                }
            }

            const from = formatDateKey(new Date(selectedYear, startMonth, 1));
            const to = formatDateKey(new Date(selectedYear, endMonth + 1, 0));
            activeRange = {
                kind: 'custom',
                label,
                from,
                to,
                quarterKey,
                selectedYear,
                selectedMonthValue
            };
            renderReports();
            filterRows();
        }

        function scopedAnalytics() {
            const filteredLeads = getAllLeads().filter((lead) => matchesDateRange(lead.date, activeRange));
            return computeAnalytics(filteredLeads, getAllClients());
        }

        function getSelectedRangeLeads() {
            return getAllLeads().filter((lead) => matchesDateRange(lead.date, activeRange));
        }

        function getYtdLeads(activeSelection = activeRange) {
            const ytdRange = getYtdRange(activeSelection);
            return {
                range: ytdRange,
                leads: ytdRange
                    ? getAllLeads().filter((lead) => matchesDateRange(lead.date, { kind: 'custom', from: ytdRange.from, to: ytdRange.to }))
                    : []
            };
        }

        function getYtdRange(activeSelection) {
            const now = new Date();
            const currentFiscalYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
            const hasCustomRange = Boolean(activeSelection?.from && activeSelection?.to);
            const referenceDate = hasCustomRange ? parseDateValue(activeSelection.to) : now;
            const selectedFiscalYear = referenceDate.getMonth() >= 3 ? referenceDate.getFullYear() : referenceDate.getFullYear() - 1;
            const fiscalYear = selectedFiscalYear;
            const from = formatDateKey(new Date(fiscalYear, 3, 1));
            let to = formatDateKey(new Date(now.getFullYear(), now.getMonth() + 1, 0));

            if (activeSelection?.selectedMonthValue !== undefined && activeSelection.selectedMonthValue !== '') {
                const selectedMonth = Number(activeSelection.selectedMonthValue);
                const selectedYear = Number(activeSelection.selectedYear || referenceDate.getFullYear());
                to = formatDateKey(new Date(selectedYear, selectedMonth + 1, 0));
            } else if (hasCustomRange && selectedFiscalYear !== currentFiscalYear) {
                to = activeSelection.to;
            } else if (selectedFiscalYear === currentFiscalYear) {
                to = formatDateKey(new Date(now.getFullYear(), now.getMonth() + 1, 0));
            }

            return {
                from,
                to,
                label: `YTD (${from} to ${to})`
            };
        }

    function buildReportLeadRows(leads) {
        return leads.map((lead) => ([
            lead.id,
            lead.businessUnit || lead.company,
            lead.opportunityName || '',
            lead.clientName || lead.businessUnit || lead.company,
            lead.contact,
            lead.owner,
            lead.status,
                leadLifecycleLabel(lead),
                formatMoney(lead.value, { currency: lead.currency || DISPLAY_CURRENCY }),
                lead.source,
                formatDisplayDate(lead.date)
            ]));
        }

        function buildReportSummaryRows(analytics, rangeLabel) {
            const totalContractValue = analytics.pipelineValue + analytics.wonRevenue + analytics.lostLeads.reduce((sum, lead) => sum + Number(lead.value || 0), 0);
            const avgDealCycleDays = analytics.wonLeads.length
                ? analytics.wonLeads.reduce((sum, lead) => sum + ((Date.now() - parseDateValue(lead.date).getTime()) / 86400000), 0) / analytics.wonLeads.length
                : 0;
            return [
                ['Date Range', rangeLabel],
                ['Total Leads', String(analytics.totalLeads)],
                ['Open Leads', String(analytics.openLeads.length)],
                ['Closed Leads', String(analytics.wonLeads.length + analytics.lostLeads.length)],
                ['Total Contract Value', formatMoney(totalContractValue, { currency: analytics.commonCurrency })],
                ['Won Revenue', formatMoney(analytics.wonRevenue, { currency: analytics.commonCurrency })],
                ['Pipeline Value', formatMoney(analytics.pipelineValue, { currency: analytics.commonCurrency })],
                ['Win Rate', formatPercent(analytics.winRate, 1)],
                ['Lead-to-Warm Ratio', formatPercent(analytics.qualifiedRate, 1)],
                ['Avg. Deal Cycle', `${Math.max(1, Math.round(avgDealCycleDays))} Days`]
            ];
        }

        function reportRangeLabel() {
            return activeRange?.label || 'All Time';
        }

        function renderReports() {
            const analytics = scopedAnalytics();
            const selectedLeads = getSelectedRangeLeads();
            const totalContractValue = selectedLeads.reduce((sum, lead) => sum + Number(lead.value || 0), 0);
            const { range: ytdRange, leads: ytdLeads } = getYtdLeads(activeRange);
            const ytdAnalytics = computeAnalytics(ytdLeads, getAllClients());
            const topWonDeals = ytdLeads
                .filter((lead) => isWonStatus(lead.status))
                .sort((left, right) => Number(right.value || 0) - Number(left.value || 0))
                .slice(0, 10);
            const metricLabels = qsa('p').filter((node) => [
                'Total Contract Value',
                'Avg. Deal Cycle',
                'Conversion Rate',
                'Lead-to-Warm Ratio'
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
                if (label === 'Total Contract Value') {
                    valueNode.textContent = formatMoney(totalContractValue, { currency: analytics.commonCurrency });
                } else if (label === 'Avg. Deal Cycle') {
                    valueNode.textContent = `${Math.max(1, Math.round(avgDealCycleDays))} Days`;
                } else if (label === 'Conversion Rate') {
                    valueNode.textContent = formatPercent(analytics.winRate, 1);
                } else if (label === 'Lead-to-Warm Ratio') {
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
                        const suffix = stage.name === 'Deal Won'
                            ? 'Deals'
                            : stage.name === 'Negotiation'
                                ? 'Priority Leads'
                                : stage.name === 'Proposal'
                                    ? 'Proposals'
                                    : stage.name === 'Qualification'
                                        ? 'Qualified Leads'
                                        : 'Leads';
                        countLabel.textContent = `${stage.count.toLocaleString('en-US')} ${suffix}`;
                    }
                    if (percentLabel) {
                        percentLabel.textContent = formatPercent(stage.percent, 0);
                    }
                });
            }

            if (ytdSectionHost) {
                const ytdClosedLeads = ytdLeads.filter((lead) => isWonStatus(lead.status) || isLostStatus(lead.status));
                const ytdClosedValue = ytdClosedLeads.reduce((sum, lead) => sum + Number(lead.value || 0), 0);
                const ytdWonValue = ytdAnalytics.wonRevenue;
                const ytdLostDeals = ytdClosedLeads.filter((lead) => isLostStatus(lead.status)).length;
                ytdSectionHost.innerHTML = `
                    <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/5 overflow-hidden">
                        <div class="p-6 border-b border-outline-variant/10">
                            <p class="text-xs font-bold uppercase tracking-[0.22em] text-primary">YTD Report</p>
                            <h3 class="mt-2 text-xl font-semibold text-on-surface">Financial Year To Date</h3>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 p-6 bg-slate-50/60 border-b border-outline-variant/10">
                            <div class="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                                <div class="mb-4 flex items-center justify-between">
                                    <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <span class="material-symbols-outlined">assignment_turned_in</span>
                                    </div>
                                </div>
                                <p class="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">YTD Closed Deals</p>
                                <p class="mt-3 text-2xl font-bold text-slate-900">${ytdClosedLeads.length}</p>
                            </div>
                            <div class="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                                <div class="mb-4 flex items-center justify-between">
                                    <div class="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary">
                                        <span class="material-symbols-outlined">payments</span>
                                    </div>
                                </div>
                                <p class="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">YTD Closed Contract Value</p>
                                <p class="mt-3 text-2xl font-bold text-slate-900">${escapeHtml(formatMoney(ytdClosedValue, { currency: ytdAnalytics.commonCurrency }))}</p>
                            </div>
                            <div class="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                                <div class="mb-4 flex items-center justify-between">
                                    <div class="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                                        <span class="material-symbols-outlined">workspace_premium</span>
                                    </div>
                                </div>
                                <p class="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">YTD Won Contract Value</p>
                                <p class="mt-3 text-2xl font-bold text-slate-900">${escapeHtml(formatMoney(ytdWonValue, { currency: ytdAnalytics.commonCurrency }))}</p>
                            </div>
                            <div class="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                                <div class="mb-4 flex items-center justify-between">
                                    <div class="w-10 h-10 rounded-lg bg-primary-fixed-dim/20 flex items-center justify-center text-primary-fixed-dim">
                                        <span class="material-symbols-outlined">analytics</span>
                                    </div>
                                </div>
                                <p class="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">YTD Win Rate</p>
                                <p class="mt-3 text-2xl font-bold text-slate-900">${formatPercent(ytdAnalytics.winRate, 1)}</p>
                            </div>
                        </div>
                    </div>
                `;
            }

            if (topDealsSectionHost) {
                topDealsSectionHost.innerHTML = `
                    <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/5 overflow-hidden">
                        <div class="p-6 border-b border-outline-variant/10 flex items-start justify-between gap-4">
                            <div>
                                <p class="text-xs font-bold uppercase tracking-[0.22em] text-tertiary">Won Deals</p>
                                <h3 class="mt-2 text-xl font-semibold text-on-surface">Top 10 Deals</h3>
                            </div>
                            <div class="rounded-2xl bg-tertiary/10 px-4 py-3 text-right">
                                <p class="text-xs font-bold uppercase tracking-[0.18em] text-tertiary">Won Contract Value</p>
                                <p class="mt-1 text-lg font-bold text-slate-900">${escapeHtml(formatMoney(topWonDeals.reduce((sum, lead) => sum + Number(lead.value || 0), 0), { currency: analytics.commonCurrency }))}</p>
                            </div>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left">
                                <thead>
                                    <tr class="bg-surface-container-low/50">
                                        <th class="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Rank</th>
                                        <th class="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Business Unit</th>
                                        <th class="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Opportunity</th>
                                        <th class="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Client</th>
                                        <th class="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Owner</th>
                                        <th class="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Won Date</th>
                                        <th class="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">Contract Value</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-outline-variant/10">
                                    ${topWonDeals.length ? topWonDeals.map((lead, index) => `
                                        <tr class="hover:bg-surface-container-low transition-colors">
                                            <td class="px-6 py-4 text-sm font-bold text-slate-700">${index + 1}</td>
                                            <td class="px-6 py-4 text-sm font-semibold text-slate-900">${escapeHtml(lead.businessUnit || lead.company)}</td>
                                            <td class="px-6 py-4 text-sm text-slate-600">${escapeHtml(lead.opportunityName || 'Not provided')}</td>
                                            <td class="px-6 py-4 text-sm text-slate-600">${escapeHtml(lead.clientName || lead.businessUnit || lead.company)}</td>
                                            <td class="px-6 py-4 text-sm text-slate-600">${escapeHtml(lead.owner)}</td>
                                            <td class="px-6 py-4 text-sm text-slate-600">${escapeHtml(formatDisplayDate(lead.date))}</td>
                                            <td class="px-6 py-4 text-sm font-bold text-right text-slate-900">${escapeHtml(formatMoney(lead.value, { currency: lead.currency || analytics.commonCurrency }))}</td>
                                        </tr>
                                    `).join('') : `
                                        <tr>
                                            <td colspan="6" class="px-6 py-10 text-center text-sm text-on-surface-variant">No won deals were found in this reporting range yet.</td>
                                        </tr>
                                    `}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            }

            if (teamSummaryHost) {
                const topPerformer = analytics.ownerRanking[0];
                const activeMembers = analytics.ownerRanking.length;
                const totalTeamRevenue = analytics.ownerRanking.reduce((sum, entry) => sum + Number(entry.revenueContributed || 0), 0);
                const averageWinRate = activeMembers
                    ? analytics.ownerRanking.reduce((sum, entry) => sum + Number(entry.winRate || 0), 0) / activeMembers
                    : 0;

                teamSummaryHost.innerHTML = `
                    <div class="rounded-2xl border border-amber-100 bg-white px-5 py-4 shadow-sm">
                        <p class="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Top Performer</p>
                        <p class="mt-3 text-lg font-bold text-slate-900">${escapeHtml(topPerformer?.owner || 'No owner yet')}</p>
                    </div>
                    <div class="rounded-2xl border border-blue-100 bg-white px-5 py-4 shadow-sm">
                        <p class="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Active Members</p>
                        <p class="mt-3 text-lg font-bold text-slate-900">${activeMembers}</p>
                    </div>
                    <div class="rounded-2xl border border-emerald-100 bg-white px-5 py-4 shadow-sm">
                        <p class="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Team Revenue / Avg Win Rate</p>
                        <p class="mt-3 text-lg font-bold text-slate-900">${escapeHtml(formatMoney(totalTeamRevenue, { currency: analytics.commonCurrency }))}</p>
                    </div>
                `;
            }

            if (teamTableBody) {
                teamTableBody.innerHTML = analytics.ownerRanking.length ? analytics.ownerRanking.map((entry, index) => `
                    <tr class="hover:bg-surface-container-low transition-colors group">
                        <td class="px-6 py-4">
                            <span class="inline-flex h-8 w-8 items-center justify-center rounded-full ${index === 0 ? 'bg-amber-100 text-amber-700' : index === 1 ? 'bg-slate-200 text-slate-700' : index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'} text-xs font-bold">${index + 1}</span>
                        </td>
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-700 text-xs font-bold">${escapeHtml(entry.owner.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase())}</div>
                                <div>
                                    <p class="text-sm font-semibold text-on-surface">${escapeHtml(entry.owner)}</p>
                                    <p class="text-[10px] text-on-surface-variant uppercase">${escapeHtml(reportRangeLabel())}</p>
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
                `).join('') : `
                    <tr>
                        <td colspan="6" class="px-6 py-10 text-center text-sm text-on-surface-variant">No team performance data is available for this reporting range yet.</td>
                    </tr>
                `;
            }

        }

        if (quarterSelect) {
            quarterSelect.addEventListener('change', () => {
                const selectedQuarter = quarterSelect.value;
                if (!selectedQuarter || !fiscalQuarterMap[selectedQuarter]) {
                    monthWrap?.classList.add('hidden');
                    yearWrap?.classList.add('hidden');
                    if (monthSelect) {
                        monthSelect.innerHTML = '';
                    }
                    return;
                }
                populateMonthOptions(selectedQuarter);
                populateYearOptions(yearSelect?.value);
                monthWrap?.classList.remove('hidden');
                yearWrap?.classList.remove('hidden');
                applyReportDateSelection();
            });
        }

        if (monthSelect) {
            monthSelect.addEventListener('change', () => {
                applyReportDateSelection();
            });
        }

        if (yearSelect) {
            yearSelect.addEventListener('change', () => {
                applyReportDateSelection();
            });
        }


        if (exportButton) {
            exportButton.addEventListener('click', () => {
                if (!activeRange?.from || !activeRange?.to) {
                    toast('Choose a quarter and year before exporting the report.', 'warning');
                    return;
                }

                const selectedLeads = getSelectedRangeLeads();
                const selectedAnalytics = computeAnalytics(selectedLeads, getAllClients());
                const { range: ytdRange, leads: ytdLeads } = getYtdLeads(activeRange);
                const ytdAnalytics = computeAnalytics(ytdLeads, getAllClients());

                downloadExcelSections(
                    'reports-summary.xls',
                    [
                        {
                            title: 'Selected Period Summary',
                            description: rangeDisplayLabel(activeRange),
                            headers: ['Metric', 'Value'],
                            rows: buildReportSummaryRows(selectedAnalytics, rangeDisplayLabel(activeRange))
                        },
                        {
                            title: 'Selected Period Lead Details',
                            description: `${selectedLeads.length} lead records in the chosen quarter/month selection.`,
                            headers: ['Lead ID', 'Business Unit', 'Opportunity Name', 'Client', 'Contact', 'Owner', 'Status', 'State', 'Value', 'Source', 'Created Date'],
                            rows: buildReportLeadRows(selectedLeads)
                        },
                        {
                            title: 'Financial Year To Date Summary',
                            description: ytdRange ? ytdRange.label : 'YTD range unavailable',
                            headers: ['Metric', 'Value'],
                            rows: buildReportSummaryRows(ytdAnalytics, ytdRange ? ytdRange.label : 'YTD')
                        },
                        {
                            title: 'Financial Year To Date Lead Details',
                            description: `${ytdLeads.length} lead records from the start of the financial year to the selected month.`,
                            headers: ['Lead ID', 'Business Unit', 'Opportunity Name', 'Client', 'Contact', 'Owner', 'Status', 'State', 'Value', 'Source', 'Created Date'],
                            rows: buildReportLeadRows(ytdLeads)
                        }
                    ],
                    'Reports Summary'
                );
                toast('Main report exported with selected period and YTD details.', 'success');
            });
        }

        if (teamPerformanceButton) {
            teamPerformanceButton.addEventListener('click', () => {
                const analytics = scopedAnalytics();
                const exportRows = analytics.ownerRanking.map((entry) => [
                    analytics.ownerRanking.indexOf(entry) + 1,
                    entry.owner,
                    entry.leadsManaged,
                    entry.closedWon,
                    formatPercent(entry.winRate, 1),
                    formatMoney(entry.revenueContributed, { currency: analytics.commonCurrency })
                ]);
                const filenameLabel = reportRangeLabel().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'all-time';
                downloadExcelTable(`team-performance-${filenameLabel}.xls`, ['Rank', 'Sales Representative', 'Leads Managed', 'Closed Won', 'Win Rate', 'Revenue Contributed'], exportRows, 'Team Performance');
                toast('Team performance report downloaded.', 'success');
            });
        }

        if (viewAllButton) {
            viewAllButton.addEventListener('click', () => {
                const analytics = scopedAnalytics();
                openModal(
                    `All Team Members - ${reportRangeLabel()}`,
                    analytics.ownerRanking.length ? `
                        <div class="space-y-3">
                            ${analytics.ownerRanking.map((entry, index) => `
                                <div class="rounded-2xl border border-slate-200 bg-white p-4">
                                    <div class="flex items-start justify-between gap-4">
                                        <div class="flex items-center gap-3">
                                            <span class="inline-flex h-9 w-9 items-center justify-center rounded-full ${index === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'} text-xs font-bold">${index + 1}</span>
                                            <div>
                                                <p class="font-semibold text-slate-900">${escapeHtml(entry.owner)}</p>
                                                <p class="mt-1 text-sm text-slate-500">${entry.leadsManaged} leads managed | ${entry.closedWon} deals won</p>
                                            </div>
                                        </div>
                                        <div class="text-right">
                                            <p class="font-bold text-slate-900">${escapeHtml(formatMoney(entry.revenueContributed, { currency: analytics.commonCurrency }))}</p>
                                            <p class="mt-1 text-sm text-slate-500">${formatPercent(entry.winRate, 1)} win rate</p>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<div class="rounded-2xl bg-slate-50 border border-slate-200 p-5 text-sm text-slate-500">No team members have matching data in this reporting range yet.</div>'
                );
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

    async function initProfilePage() {
        const profile = await syncProfileFromBackend();
        const heading = qs('[data-profile="name"]') || qsa('h1, h2').find((node) => node.textContent.includes('Profile'));
        const editButton = qsa('button').find((button) => button.textContent.includes('Edit Profile'));
        const saveButton = qsa('button').find((button) => button.textContent.includes('Save Profile') || button.textContent.includes('Save Preferences'));
        const copyEmailButton = qsa('button').find((button) => button.textContent.includes('Copy Email'));
        const textInputs = qsa('input, textarea').filter((field) => !['checkbox'].includes(field.type));

        if (heading) {
            heading.textContent = profile.name;
        }

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

        syncProfileView();

        async function persistProfile(nextPatch) {
            Object.assign(profile, nextPatch);
            profile.initials = String(profile.name || '')
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => part[0])
                .join('')
                .toUpperCase();
            setProfile(profile);
            try {
                const remoteProfile = await apiRequest('/users/me', {
                    method: 'PATCH',
                    body: JSON.stringify(nextPatch)
                });
                Object.assign(profile, remoteProfile || {});
                profile.initials = String(profile.name || '')
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join('')
                    .toUpperCase();
                setProfile(profile);
            } catch (error) {
                // local fallback already applied
            }
            syncProfileView();
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
                        persistProfile({ name, email, role, phone, location, focus, bio });
                        toast('Profile details updated.', 'success');
                    }
                });
            });
        }

        if (saveButton) {
            saveButton.addEventListener('click', async () => {
                const [emailInput, phoneInput, locationInput, focusInput, bioInput] = textInputs;
                await persistProfile({
                    email: emailInput?.value.trim() || profile.email,
                    phone: phoneInput?.value.trim() || profile.phone,
                    location: locationInput?.value.trim() || profile.location,
                    focus: focusInput?.value.trim() || profile.focus,
                    bio: bioInput?.value.trim() || profile.bio
                });
                toast('Profile saved successfully.', 'success');
            });
        }

        if (copyEmailButton) {
            copyEmailButton.addEventListener('click', () => {
                copyText(profile.email).then(() => toast('Email copied to clipboard.', 'success'));
            });
        }

    }

    function initOwnerLeadsPage() {
        const overviewHost = document.getElementById('owner-overview');
        const detailHost = document.getElementById('owner-detail');
        if (!overviewHost || !detailHost) {
            return;
        }

        const searchParams = new URLSearchParams(window.location.search);

        function ownerNames() {
            const fromUsers = getAllUsers().map((user) => String(user.name || '').trim()).filter(Boolean);
            const fromSummaries = (Array.isArray(APP_STATE.ownerTargetSummaries) ? APP_STATE.ownerTargetSummaries : []).map((entry) => String(entry.owner || '').trim()).filter(Boolean);
            return Array.from(new Set([...fromUsers, ...fromSummaries]));
        }

        function ownerTargetSummary(owner) {
            const summaries = Array.isArray(APP_STATE.ownerTargetSummaries) ? APP_STATE.ownerTargetSummaries : [];
            return summaries.find((entry) => String(entry.owner || '').trim().toLowerCase() === owner.toLowerCase()) || {
                owner,
                financialYear: new Date().getFullYear(),
                currentQuarter: 'Q1',
                yearTargetAmount: 0,
                yearClosedAmount: 0,
                yearRemainingAmount: 0,
                quarterTargetAmount: 0,
                quarterClosedAmount: 0,
                quarterRemainingAmount: 0,
                quarterTrend: []
            };
        }

        function ownerLeads(owner) {
            return getAllLeads().filter((lead) => String(lead.owner || '').trim().toLowerCase() === owner.toLowerCase());
        }

        function ownerStats(owner) {
            const records = ownerLeads(owner);
            const openLeads = records.filter((lead) => !['deal won', 'deal lost'].includes(normalizeStatus(lead.status)));
            const closedLeads = records.filter((lead) => ['deal won', 'deal lost'].includes(normalizeStatus(lead.status)));
            const closedRevenue = records
                .filter((lead) => normalizeStatus(lead.status) === 'deal won')
                .reduce((sum, lead) => sum + Number(lead.value || 0), 0);
            return {
                owner,
                leads: records,
                totalAmount: records.reduce((sum, lead) => sum + lead.value, 0),
                total: records.length,
                open: openLeads.length,
                closed: closedLeads.length,
                closedRevenue,
                prospecting: records.filter((lead) => normalizeStatus(lead.status) === 'prospecting').length,
                qualification: records.filter((lead) => normalizeStatus(lead.status) === 'qualification').length,
                proposal: records.filter((lead) => normalizeStatus(lead.status) === 'proposal').length,
                negotiation: records.filter((lead) => normalizeStatus(lead.status) === 'negotiation').length,
                hold: records.filter((lead) => leadLifecycleLabel(lead) === 'Hold').length,
                won: records.filter((lead) => normalizeStatus(lead.status) === 'deal won').length,
                lost: records.filter((lead) => normalizeStatus(lead.status) === 'deal lost').length
            };
        }

        function openOwner(owner) {
            const url = new URL(window.location.href);
            url.searchParams.set('owner', owner);
            window.location.href = url.toString();
        }

        function renderOverview() {
            const cards = ownerNames().map((owner) => {
                const stats = ownerStats(owner);
                return `
                    <button type="button" class="owner-overview-card text-left bg-surface-container-lowest rounded-[28px] border border-outline-variant/15 shadow-sm overflow-hidden hover:shadow-[0_18px_36px_rgba(15,23,42,0.12)] transition-all" data-owner-name="${escapeHtml(owner)}">
                        <div class="grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)]">
                            <div class="px-7 py-7 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),transparent_35%),linear-gradient(135deg,#004ac6_0%,#2563eb_65%,#7aa5ff_100%)] text-white">
                                <div class="flex items-start justify-between gap-4">
                                    <div>
                                        <p class="text-[11px] uppercase tracking-[0.24em] text-white/70 font-bold">Lead Owner</p>
                                        <h3 class="mt-3 text-[2rem] leading-tight font-bold">${escapeHtml(owner)}</h3>
                                        <p class="mt-2 text-sm text-white/80">Owner-specific pipeline snapshot and live performance.</p>
                                    </div>
                                    <div class="w-16 h-16 rounded-[20px] bg-white/15 border border-white/20 flex items-center justify-center text-2xl font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">${escapeHtml(owner.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase())}</div>
                                </div>
                                <div class="mt-8 space-y-4">
                                    <div class="rounded-2xl bg-white/10 border border-white/15 px-4 py-4">
                                        <p class="text-[11px] uppercase tracking-[0.18em] text-white/70 font-bold">Total Lead Amount</p>
                                        <p class="mt-2 text-[1.9rem] leading-tight font-bold">${escapeHtml(formatMoney(stats.totalAmount, { currency: DISPLAY_CURRENCY }))}</p>
                                    </div>
                                    <div class="rounded-2xl bg-white/10 border border-white/15 px-4 py-4">
                                        <p class="text-[11px] uppercase tracking-[0.18em] text-white/70 font-bold">Total Leads</p>
                                        <p class="mt-2 text-[1.9rem] leading-tight font-bold">${stats.total}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="p-6 lg:p-7 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]">
                                <div class="flex items-center justify-between mb-5">
                                    <div>
                                        <p class="text-[11px] uppercase tracking-[0.22em] text-slate-400 font-bold">Status Mix</p>
                                        <h4 class="mt-2 text-lg font-bold text-slate-900">Current Lead Distribution</h4>
                                    </div>
                                    <span class="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">Click to open</span>
                                </div>
                                <div class="grid grid-cols-2 xl:grid-cols-3 gap-3.5 text-sm">
                                    <div class="rounded-2xl border border-amber-100 bg-amber-50/80 px-4 py-4"><p class="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">Prospecting</p><p class="mt-3 text-2xl font-bold text-slate-900">${stats.prospecting}</p></div>
                                    <div class="rounded-2xl border border-orange-100 bg-orange-50/80 px-4 py-4"><p class="text-xs font-bold uppercase tracking-[0.16em] text-orange-700">Qualification</p><p class="mt-3 text-2xl font-bold text-slate-900">${stats.qualification}</p></div>
                                    <div class="rounded-2xl border border-red-100 bg-red-50/80 px-4 py-4"><p class="text-xs font-bold uppercase tracking-[0.16em] text-red-700">Negotiation</p><p class="mt-3 text-2xl font-bold text-slate-900">${stats.negotiation}</p></div>
                                    <div class="rounded-2xl border border-blue-100 bg-blue-50/80 px-4 py-4"><p class="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Proposal</p><p class="mt-3 text-2xl font-bold text-slate-900">${stats.proposal}</p></div>
                                    <div class="rounded-2xl border border-slate-200 bg-slate-100/90 px-4 py-4"><p class="text-xs font-bold uppercase tracking-[0.16em] text-slate-700">Hold</p><p class="mt-3 text-2xl font-bold text-slate-900">${stats.hold}</p></div>
                                    <div class="rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-4"><p class="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Won</p><p class="mt-3 text-2xl font-bold text-slate-900">${stats.won}</p></div>
                                </div>
                                <div class="grid grid-cols-1 xl:grid-cols-2 gap-3.5 mt-3.5">
                                    <div class="rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-4"><p class="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Open Leads</p><p class="mt-3 text-xl font-bold text-slate-900">${stats.open}</p></div>
                                    <div class="rounded-2xl border border-violet-100 bg-violet-50/70 px-4 py-4"><p class="text-xs font-bold uppercase tracking-[0.16em] text-violet-700">Closed Leads</p><p class="mt-3 text-xl font-bold text-slate-900">${stats.closed}</p></div>
                                </div>
                            </div>
                        </div>
                    </button>
                `;
            }).join('');

            overviewHost.innerHTML = `
                <div class="flex flex-col gap-4">
                    <div class="flex items-center justify-between">
                        <h3 class="text-xl font-bold">Team Members</h3>                    </div>
                    <div class="grid grid-cols-1 gap-6">${cards}</div>
                </div>
            `;

            qsa('.owner-overview-card', overviewHost).forEach((button) => {
                button.addEventListener('click', () => openOwner(button.getAttribute('data-owner-name') || ''));
            });
        }

        function renderDetail(owner) {
            const stats = ownerStats(owner);
            const targets = ownerTargetSummary(owner);
            let activeFilter = 'All Leads';

            overviewHost.classList.add('hidden');
            detailHost.classList.remove('hidden');

            detailHost.innerHTML = `
                <div class="flex items-center justify-between gap-4">
                    <div>
                        <button type="button" id="owner-back-button" class="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                            <span class="material-symbols-outlined text-base">arrow_back</span>
                            Back to Team Overview
                        </button>
                        <h3 class="mt-4 text-3xl font-bold tracking-tight">${escapeHtml(owner)}</h3>
                        <p class="text-sm text-on-surface-variant mt-2">Analytics and lead list for this owner.</p>
                    </div>
                    <div class="rounded-3xl bg-white px-6 py-5 border border-outline-variant/15 shadow-sm">
                        <p class="text-xs uppercase tracking-[0.18em] text-on-surface-variant font-bold">Total Lead Amount (Rs)</p>
                        <p class="mt-2 text-3xl font-bold">${escapeHtml(formatMoney(stats.totalAmount, { currency: DISPLAY_CURRENCY }))}</p>
                    </div>
                </div>
                <div class="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    <div class="rounded-3xl bg-white p-5 border border-outline-variant/15 shadow-sm"><p class="text-xs uppercase font-bold text-on-surface-variant">Total Leads</p><p class="mt-3 text-3xl font-bold">${stats.total}</p></div>
                    <div class="rounded-3xl bg-amber-50 p-5 border border-amber-100"><p class="text-xs uppercase font-bold text-amber-700">Prospecting</p><p class="mt-3 text-3xl font-bold">${stats.prospecting}</p></div>
                    <div class="rounded-3xl bg-orange-50 p-5 border border-orange-100"><p class="text-xs uppercase font-bold text-orange-700">Qualification</p><p class="mt-3 text-3xl font-bold">${stats.qualification}</p></div>
                    <div class="rounded-3xl bg-red-50 p-5 border border-red-100"><p class="text-xs uppercase font-bold text-red-700">Negotiation</p><p class="mt-3 text-3xl font-bold">${stats.negotiation}</p></div>
                    <div class="rounded-3xl bg-blue-50 p-5 border border-blue-100"><p class="text-xs uppercase font-bold text-blue-700">Proposal</p><p class="mt-3 text-3xl font-bold">${stats.proposal}</p></div>
                    <div class="rounded-3xl bg-slate-100 p-5 border border-slate-200"><p class="text-xs uppercase font-bold text-slate-700">Hold</p><p class="mt-3 text-3xl font-bold">${stats.hold}</p></div>
                    <div class="rounded-3xl bg-emerald-50 p-5 border border-emerald-100"><p class="text-xs uppercase font-bold text-emerald-700">Deal Won</p><p class="mt-3 text-3xl font-bold">${stats.won}</p></div>
                    <div class="rounded-3xl bg-rose-50 p-5 border border-rose-100"><p class="text-xs uppercase font-bold text-rose-700">Deal Lost</p><p class="mt-3 text-3xl font-bold">${stats.lost}</p></div>
                    <div class="rounded-3xl bg-white p-5 border border-outline-variant/15 shadow-sm"><p class="text-xs uppercase font-bold text-on-surface-variant">Closed Revenue</p><p class="mt-3 text-2xl font-bold">${escapeHtml(formatMoney(stats.closedRevenue, { currency: DISPLAY_CURRENCY }))}</p></div>
                </div>
                <div class="grid grid-cols-1 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.85fr)] gap-6">
                    <div class="bg-white rounded-[28px] border border-outline-variant/15 shadow-sm overflow-hidden p-6 lg:p-7">
                        <div class="flex items-start justify-between gap-4 mb-6">
                            <div>
                                <p class="text-[11px] uppercase tracking-[0.22em] text-slate-400 font-bold">Quarter Target Progress</p>
                                <h4 class="mt-2 text-xl font-bold text-slate-900">${escapeHtml(targets.currentQuarter)} Closed Amount vs Target</h4>
                            </div>
                            <div class="text-right">
                                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Current Close</p>
                                <p class="mt-2 text-2xl font-bold text-slate-900">${escapeHtml(formatMoney(targets.quarterClosedAmount, { currency: DISPLAY_CURRENCY }))}</p>
                            </div>
                        </div>
                        <div class="rounded-[24px] bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] border border-outline-variant/10 p-4">
                            <div class="overflow-x-auto">
                                <svg viewBox="0 0 420 190" class="w-full min-w-[340px] h-[220px]" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    ${(() => {
                                        const trendBuckets = Array.isArray(targets.quarterTrend) && targets.quarterTrend.length ? targets.quarterTrend : [{ label: 'Apr', actualClosedAmount: 0, targetAmount: 0 }, { label: 'May', actualClosedAmount: 0, targetAmount: 0 }, { label: 'Jun', actualClosedAmount: 0, targetAmount: 0 }];
                                        const maxValue = Math.max(1, ...trendBuckets.flatMap((bucket) => [Number(bucket.actualClosedAmount || 0), Number(bucket.targetAmount || 0)]));
                                        const axisLeft = 12;
                                        const axisRight = 408;
                                        const axisTop = 18;
                                        const axisBottom = 160;
                                        const axisSpan = axisBottom - axisTop;
                                        const stepX = trendBuckets.length > 1 ? (axisRight - axisLeft) / (trendBuckets.length - 1) : 0;
                                        const targetPoints = trendBuckets.map((bucket, index) => {
                                            const x = axisLeft + (index * stepX);
                                            const y = axisBottom - ((Number(bucket.targetAmount || 0) / maxValue) * axisSpan);
                                            return { x, y, label: bucket.label };
                                        });
                                        const actualPoints = trendBuckets.map((bucket, index) => {
                                            const x = axisLeft + (index * stepX);
                                            const y = axisBottom - ((Number(bucket.actualClosedAmount || 0) / maxValue) * axisSpan);
                                            return { x, y, label: bucket.label };
                                        });
                                        return `
                                            <line x1="${axisLeft}" y1="${axisBottom}" x2="${axisRight}" y2="${axisBottom}" stroke="#CBD5E1" stroke-width="2"/>
                                            <path d="M${targetPoints.map((point) => `${point.x} ${point.y}`).join(' L ')}" stroke="#94A3B8" stroke-width="2" stroke-dasharray="5 5" stroke-linecap="round" stroke-linejoin="round"/>
                                            <path d="M${actualPoints.map((point) => `${point.x} ${point.y}`).join(' L ')}" stroke="#1D4ED8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                                            ${actualPoints.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="5" fill="#1D4ED8"/>`).join('')}
                                            ${targetPoints.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="4" fill="#FFFFFF" stroke="#94A3B8" stroke-width="2"/>`).join('')}
                                            <text x="420" y="24" text-anchor="end" fill="#94A3B8" font-size="11" font-weight="700">${escapeHtml(targets.currentQuarter)} TARGET (${escapeHtml(formatMoney(targets.quarterTargetAmount, { currency: DISPLAY_CURRENCY }))})</text>
                                            <text x="420" y="42" text-anchor="end" fill="#1D4ED8" font-size="11" font-weight="700">CURRENT CLOSED (${escapeHtml(formatMoney(targets.quarterClosedAmount, { currency: DISPLAY_CURRENCY }))})</text>
                                            ${actualPoints.map((point, index) => {
                                                const anchor = index === actualPoints.length - 1 ? 'end' : (index === 0 ? 'start' : 'middle');
                                                return `<text x="${point.x}" y="182" text-anchor="${anchor}" fill="#94A3B8" font-size="11" font-weight="700">${escapeHtml(point.label)}</text>`;
                                            }).join('')}
                                        `;
                                    })()}
                                </svg>
                            </div>
                            <div class="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm">
                                <span class="inline-flex items-center gap-2 font-medium text-slate-700"><span class="h-2.5 w-2.5 rounded-full bg-blue-700"></span>Current Closed: ${escapeHtml(formatMoney(targets.quarterClosedAmount, { currency: DISPLAY_CURRENCY }))}</span>
                                <span class="inline-flex items-center gap-2 font-medium text-slate-400"><span class="h-0.5 w-4 bg-slate-400" style="border-top:2px dashed #94A3B8;"></span>Target: ${escapeHtml(formatMoney(targets.quarterTargetAmount, { currency: DISPLAY_CURRENCY }))}</span>
                            </div>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 gap-4">
                        <div class="rounded-[28px] bg-blue-50 p-5 border border-blue-100 shadow-sm">
                            <p class="text-xs uppercase font-bold tracking-[0.18em] text-blue-700">FY Target Amount</p>
                            <p class="mt-3 text-2xl font-bold text-slate-900">${escapeHtml(formatMoney(targets.yearTargetAmount, { currency: DISPLAY_CURRENCY }))}</p>
                        </div>
                        <div class="rounded-[28px] bg-sky-50 p-5 border border-sky-100 shadow-sm">
                            <p class="text-xs uppercase font-bold tracking-[0.18em] text-sky-700">${escapeHtml(targets.currentQuarter)} Target</p>
                            <p class="mt-3 text-2xl font-bold text-slate-900">${escapeHtml(formatMoney(targets.quarterTargetAmount, { currency: DISPLAY_CURRENCY }))}</p>
                        </div>
                        <div class="rounded-[28px] bg-emerald-50 p-5 border border-emerald-100 shadow-sm">
                            <p class="text-xs uppercase font-bold tracking-[0.18em] text-emerald-700">${escapeHtml(targets.currentQuarter)} Remaining</p>
                            <p class="mt-3 text-2xl font-bold text-slate-900">${escapeHtml(formatMoney(targets.quarterRemainingAmount, { currency: DISPLAY_CURRENCY }))}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-[28px] border border-outline-variant/15 shadow-sm overflow-hidden">
                    <div class="px-6 py-5 border-b border-outline-variant/15 flex items-center justify-between gap-4">
                        <div>
                            <h4 class="text-xl font-bold">Assigned Leads</h4>
                            <p class="text-sm text-on-surface-variant mt-1">Filter this owner's lead list by status.</p>
                        </div>
                        <select id="owner-status-filter" class="min-w-[220px] bg-surface-container-low border-none rounded-2xl px-4 pr-10 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20">
                            <option>All Leads</option>
                            <option>Prospecting</option>
                            <option>Qualification</option>
                            <option>Proposal</option>
                            <option>Negotiation</option>
                            <option>Deal Won</option>
                            <option>Deal Lost</option>
                        </select>
                    </div>
                    <div id="owner-leads-list" class="p-6 space-y-3"></div>
                </div>
            `;

            const listHost = document.getElementById('owner-leads-list');
            const filterSelect = document.getElementById('owner-status-filter');
            const backButton = document.getElementById('owner-back-button');

            function renderLeadList() {
                const visibleLeads = stats.leads.filter((lead) => activeFilter === 'All Leads' || normalizeStatus(lead.status) === normalizeStatus(activeFilter));
                listHost.innerHTML = visibleLeads.length
                    ? visibleLeads.map((lead) => `
                        <button type="button" class="owner-detail-lead w-full text-left rounded-2xl border border-outline-variant/15 bg-surface-container-low p-4 hover:border-primary/30 hover:bg-blue-50/40 transition-colors" data-lead-id="${escapeHtml(lead.id)}">
                            <div class="flex items-start justify-between gap-4">
                                <div>
                                    <p class="font-semibold text-on-surface">${escapeHtml(lead.company)}</p>
                                    <p class="text-sm text-on-surface-variant mt-1">${escapeHtml(lead.contact)} | ${escapeHtml(lead.status)} | ${escapeHtml(leadLifecycleLabel(lead))} | ${escapeHtml(lead.clientName || lead.company)}</p>
                                </div>
                                <div class="text-right">
                                    <p class="font-bold text-on-surface">${escapeHtml(formatMoney(lead.value, { currency: lead.currency }))}</p>
                                    <p class="text-xs text-on-surface-variant mt-1">${escapeHtml(formatDisplayDate(lead.date))}</p>
                                </div>
                            </div>
                        </button>
                    `).join('')
                    : '<div class="rounded-2xl bg-surface-container-low p-4 text-sm text-on-surface-variant">No leads match this filter yet.</div>';

                qsa('.owner-detail-lead', listHost).forEach((button) => {
                    button.addEventListener('click', () => {
                        const lead = findLeadById(button.getAttribute('data-lead-id'));
                        if (!lead) {
                            toast('Lead details are not available yet.', 'warning');
                            return;
                        }
                        openLeadDetailModal(lead, { ownerContext: owner });
                    });
                });
            }

            filterSelect?.addEventListener('change', () => {
                activeFilter = filterSelect.value;
                renderLeadList();
            });

            backButton?.addEventListener('click', () => {
                const url = new URL(window.location.href);
                url.searchParams.delete('owner');
                window.location.href = url.toString();
            });

            renderLeadList();
        }

        const selectedOwner = searchParams.get('owner');
            refreshOwnerTargetSummaries()
            .catch(() => null)
            .finally(() => {
                const owners = ownerNames();
                if (selectedOwner && owners.some((owner) => owner.toLowerCase() === selectedOwner.toLowerCase())) {
                    renderDetail(owners.find((owner) => owner.toLowerCase() === selectedOwner.toLowerCase()) || selectedOwner);
                } else {
                    detailHost.classList.add('hidden');
                    overviewHost.classList.remove('hidden');
                    renderOverview();
                }
            });
    }
    async function initSettingsPage() {
        const userTableBody = qs('tbody');
        const stageCards = qsa('#lead-stages .group');
        const stageSettingsButton = qsa('button').find((button) => button.querySelector('[data-icon="settings_suggest"]'));
        const notificationCheckboxes = qsa('input.sr-only.peer');
        const settings = await getWorkspaceSettings();
        const users = getAllUsers();
        const storedStages = Array.isArray(settings.stages) ? settings.stages : null;

        function getStageLabels() {
            return qsa('#lead-stages .group .flex-1').map((node) => node.textContent.trim()).filter(Boolean);
        }

        async function persistStages() {
            const stages = getStageLabels();
            await saveWorkspaceSettings({ stages });
            return stages;
        }

        if (stageCards.length && Array.isArray(storedStages) && storedStages.length) {
            const normalizedStages = storedStages.filter(Boolean);
            stageCards.forEach((card, index) => {
                const labelNode = qsa('span', card).find((span) => span.className.includes('flex-1'));
                if (labelNode && normalizedStages[index]) {
                    labelNode.textContent = normalizedStages[index];
                }
            });
        }

        if (users.length && userTableBody) {
            userTableBody.innerHTML = '';
            users.forEach((user) => {
                const row = document.createElement('tr');
                row.className = 'hover:bg-surface-container-low/30 transition-colors';
                row.innerHTML = `
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">${escapeHtml(user.initials || String(user.name || '').split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase())}</div>
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

        notificationCheckboxes.forEach((checkbox, index) => {
            const keys = ['newLeadActivity', 'stageChanges', 'weeklyReport'];
            checkbox.checked = Boolean(settings.notifications?.[keys[index]]);
            checkbox.addEventListener('change', async () => {
                settings.notifications[keys[index]] = checkbox.checked;
                await saveWorkspaceSettings({ notifications: settings.notifications });
                toast('Notification preferences updated.', 'success');
            });
        });

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
                        { name: 'label', label: 'Stage Name', value: 'Proposal', required: true }
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
                        persistStages();
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
                            persistStages();
                            toast('Pipeline stage updated.', 'success');
                        }
                    });
                } else if (icon === 'delete') {
                    if (qsa('#lead-stages .group').length <= 1) {
                        toast('At least one stage needs to remain.', 'warning');
                        return;
                    }
                    card.remove();
                    persistStages();
                    toast('Pipeline stage removed.', 'success');
                }
            });
        }
    }

    document.addEventListener('DOMContentLoaded', async () => {
        initLoginPage();

        const guard = enforceSessionGuard();
        if (!guard.allowed) {
            return;
        }
        const { currentPage, isAuthPage } = guard;
        if (cleanRouteEnabled()) {
            const cleanUrl = new URL(routePath(currentPage), window.location.origin);
            cleanUrl.search = window.location.search;
            cleanUrl.hash = window.location.hash;
            if (`${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}` !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
                history.replaceState(null, '', cleanUrl.toString());
            }
        }

        if (!isAuthPage) {
            await hydrateBackendState();
            await syncProfileFromBackend();
            broadcastActivityChange();
        }

        initCommon();

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
        } else if (currentPage === 'owner_leads.html') {
            initOwnerLeadsPage();
        } else if (currentPage === 'profile.html') {
            initProfilePage();
        }
    });

    window.addEventListener('pageshow', async () => {
        const guard = enforceSessionGuard();
        if (!guard.allowed) {
            return;
        }
        const { currentPage, isAuthPage } = guard;
        if (isAuthPage) {
            return;
        }
        APP_STATE.hydrated = false;
        await hydrateBackendState();
        if (currentPage === 'owner_leads.html') {
            initOwnerLeadsPage();
        } else if (currentPage === 'reports.html') {
            initReportsPage();
        }
    });
})();




































































