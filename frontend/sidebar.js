(() => {
    const AUTH_TOKEN_KEY = 'grassroots_auth_token';
    const SESSION_EXPIRES_KEY = 'grassroots_session_expires_at';
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

    const currentPath = normalizePageKey(window.location.pathname.split('/').pop() || '');
    const isProtectedPage = !['login.html', 'index.html'].includes(currentPath);

    function sessionExpired() {
        const expiresAt = sessionStorage.getItem(SESSION_EXPIRES_KEY) || '';
        return Boolean(expiresAt && Date.parse(expiresAt) <= Date.now());
    }

    function hasToken() {
        return Boolean(sessionStorage.getItem(AUTH_TOKEN_KEY));
    }

    function redirectToLogin() {
        sessionStorage.removeItem(AUTH_TOKEN_KEY);
        sessionStorage.removeItem(SESSION_EXPIRES_KEY);
        sessionStorage.setItem('grassroots_logout_guard', 'true');
        window.location.replace(routePath('Login.html'));
    }

    function enforceProtectedRoute() {
        if (!isProtectedPage) {
            return;
        }
        if (sessionExpired() || !hasToken()) {
            redirectToLogin();
        }
    }

    if (isProtectedPage) {
        enforceProtectedRoute();
        window.addEventListener('pageshow', enforceProtectedRoute);
        window.addEventListener('popstate', enforceProtectedRoute);
        // A no-op unload handler helps prevent the browser from restoring protected
        // pages straight from the back-forward cache after logout.
        window.addEventListener('unload', () => {});
    }
})();

class AppSidebar extends HTMLElement {
    connectedCallback() {
        const activePage = this.getAttribute('active-page');

        this.innerHTML = `
        <aside class="fixed left-0 top-0 h-full w-64 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col h-full p-4 gap-2 shadow-[12px_0_32px_rgba(25,28,29,0.04)] hidden md:flex">
            <div class="px-2 py-6 mb-4">
                <img src="grassroots-logo.svg" alt="Grassroots" class="h-11 w-[220px] max-w-full object-contain object-left mb-1" />
                <p class="text-xs text-slate-500 font-medium">Lead Intelligence</p>
            </div>
            <nav class="flex-1 space-y-1">
                <a class="sidebar-link flex items-center gap-3 px-3 py-2 text-sm font-medium font-inter rounded-lg transition-all duration-200 cursor-pointer" data-route="dashboard" href="${routePath('dashboard.html')}">
                    <span class="material-symbols-outlined" data-icon="dashboard">dashboard</span>
                    <span>Dashboard</span>
                </a>
                <a class="sidebar-link flex items-center gap-3 px-3 py-2 text-sm font-medium font-inter rounded-lg transition-all duration-200 cursor-pointer" data-route="owner-leads" href="${routePath('owner_leads.html')}">
                    <span class="material-symbols-outlined" data-icon="supervisor_account">supervisor_account</span>
                    <span>Owner Leads</span>
                </a>
                <a class="sidebar-link flex items-center gap-3 px-3 py-2 text-sm font-medium font-inter rounded-lg transition-all duration-200 cursor-pointer" data-route="add-lead" href="${routePath('add_lead.html')}">
                    <span class="material-symbols-outlined" data-icon="add_circle">add_circle</span>
                    <span>Add New Lead</span>
                </a>
                <a class="sidebar-link flex items-center gap-3 px-3 py-2 text-sm font-medium font-inter rounded-lg transition-all duration-200 cursor-pointer" data-route="review-leads" href="${routePath('review_leads.html')}">
                    <span class="material-symbols-outlined" data-icon="rate_review">rate_review</span>
                    <span>Review Leads</span>
                </a>
                <a class="sidebar-link flex items-center gap-3 px-3 py-2 text-sm font-medium font-inter rounded-lg transition-all duration-200 cursor-pointer" data-route="manage-leads" href="${routePath('manage_leads.html')}">
                    <span class="material-symbols-outlined" data-icon="view_list">view_list</span>
                    <span>Manage Leads</span>
                </a>
                <a class="sidebar-link flex items-center gap-3 px-3 py-2 text-sm font-medium font-inter rounded-lg transition-all duration-200 cursor-pointer" data-route="clients" href="${routePath('clients.html')}">
                    <span class="material-symbols-outlined" data-icon="group">group</span>
                    <span>Clients</span>
                </a>
                <a class="sidebar-link flex items-center gap-3 px-3 py-2 text-sm font-medium font-inter rounded-lg transition-all duration-200 cursor-pointer" data-route="reports" href="${routePath('reports.html')}">
                    <span class="material-symbols-outlined" data-icon="assessment">assessment</span>
                    <span>Reports</span>
                </a>
            </nav>
            <div class="mt-auto pt-6 border-t border-slate-200/50 space-y-1">
                <a class="sidebar-link flex items-center gap-3 px-3 py-2 text-sm font-medium font-inter rounded-lg transition-all duration-200 cursor-pointer" data-route="profile" href="${routePath('profile.html')}">
                    <span class="material-symbols-outlined" data-icon="account_circle">account_circle</span>
                    <span>Profile</span>
                </a>
                <a class="sidebar-link flex items-center gap-3 px-3 py-2 text-sm font-medium font-inter rounded-lg transition-all duration-200 text-error cursor-pointer hover:bg-red-50" data-route="logout" href="${routePath('Login.html')}">
                    <span class="material-symbols-outlined" data-icon="logout">logout</span>
                    <span>Logout</span>
                </a>
            </div>
        </aside>
        `;

        // Apply dynamic active styling based on the active-page attribute
        const links = this.querySelectorAll('.sidebar-link');

        links.forEach(link => {
            const href = normalizePageKey(link.getAttribute('href'));

            // Standard inactive classes
            const inactiveClasses = ['text-slate-500', 'dark:text-slate-400', 'hover:text-slate-900', 'hover:translate-x-1'];
            // Standard active classes
            const activeClasses = ['text-blue-600', 'dark:text-blue-400', 'bg-white', 'dark:bg-slate-900', 'shadow-sm'];

            // Skip special treatment for logout text color, but give it hover effect
            if (href === 'login.html') {
                link.classList.add('text-slate-500'); // the text-error handles color red
                return;
            }

            if (href === normalizePageKey(activePage)) {
                // Remove inactive styles
                link.classList.remove(...inactiveClasses);
                // Add active styles
                link.classList.add(...activeClasses);
            } else {
                // Ensure inactive styles
                link.classList.add(...inactiveClasses);
                link.classList.remove(...activeClasses);
            }
        });
    }
}

// Define the custom element
customElements.define('app-sidebar', AppSidebar);
