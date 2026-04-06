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
                <a class="sidebar-link flex items-center gap-3 px-3 py-2 text-sm font-medium font-inter rounded-lg transition-all duration-200 cursor-pointer" href="dashboard.html">
                    <span class="material-symbols-outlined" data-icon="dashboard">dashboard</span>
                    <span>Dashboard</span>
                </a>
                <a class="sidebar-link flex items-center gap-3 px-3 py-2 text-sm font-medium font-inter rounded-lg transition-all duration-200 cursor-pointer" href="owner_leads.html">
                    <span class="material-symbols-outlined" data-icon="supervisor_account">supervisor_account</span>
                    <span>Owner Leads</span>
                </a>
                <a class="sidebar-link flex items-center gap-3 px-3 py-2 text-sm font-medium font-inter rounded-lg transition-all duration-200 cursor-pointer" href="add_lead.html">
                    <span class="material-symbols-outlined" data-icon="add_circle">add_circle</span>
                    <span>Add New Lead</span>
                </a>
                <a class="sidebar-link flex items-center gap-3 px-3 py-2 text-sm font-medium font-inter rounded-lg transition-all duration-200 cursor-pointer" href="review_leads.html">
                    <span class="material-symbols-outlined" data-icon="rate_review">rate_review</span>
                    <span>Review Leads</span>
                </a>
                <a class="sidebar-link flex items-center gap-3 px-3 py-2 text-sm font-medium font-inter rounded-lg transition-all duration-200 cursor-pointer" href="manage_leads.html">
                    <span class="material-symbols-outlined" data-icon="view_list">view_list</span>
                    <span>Manage Leads</span>
                </a>
                <a class="sidebar-link flex items-center gap-3 px-3 py-2 text-sm font-medium font-inter rounded-lg transition-all duration-200 cursor-pointer" href="clients.html">
                    <span class="material-symbols-outlined" data-icon="group">group</span>
                    <span>Clients</span>
                </a>
                <a class="sidebar-link flex items-center gap-3 px-3 py-2 text-sm font-medium font-inter rounded-lg transition-all duration-200 cursor-pointer" href="reports.html">
                    <span class="material-symbols-outlined" data-icon="assessment">assessment</span>
                    <span>Reports</span>
                </a>
                <a class="sidebar-link flex items-center gap-3 px-3 py-2 text-sm font-medium font-inter rounded-lg transition-all duration-200 cursor-pointer" href="settings.html">
                    <span class="material-symbols-outlined" data-icon="settings">settings</span>
                    <span>Settings</span>
                </a>
            </nav>
            <div class="mt-auto pt-6 border-t border-slate-200/50 space-y-1">
                <a class="sidebar-link flex items-center gap-3 px-3 py-2 text-sm font-medium font-inter rounded-lg transition-all duration-200 cursor-pointer" href="profile.html">
                    <span class="material-symbols-outlined" data-icon="account_circle">account_circle</span>
                    <span>Profile</span>
                </a>
                <a class="sidebar-link flex items-center gap-3 px-3 py-2 text-sm font-medium font-inter rounded-lg transition-all duration-200 text-error cursor-pointer hover:bg-red-50" href="Login.html">
                    <span class="material-symbols-outlined" data-icon="logout">logout</span>
                    <span>Logout</span>
                </a>
            </div>
        </aside>
        `;

        // Apply dynamic active styling based on the active-page attribute
        const links = this.querySelectorAll('.sidebar-link');

        links.forEach(link => {
            const href = link.getAttribute('href');

            // Standard inactive classes
            const inactiveClasses = ['text-slate-500', 'dark:text-slate-400', 'hover:text-slate-900', 'hover:translate-x-1'];
            // Standard active classes
            const activeClasses = ['text-blue-600', 'dark:text-blue-400', 'bg-white', 'dark:bg-slate-900', 'shadow-sm'];

            // Skip special treatment for logout text color, but give it hover effect
            if (href === 'Login.html') {
                link.classList.add('text-slate-500'); // the text-error handles color red
                return;
            }

            if (href === activePage) {
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
