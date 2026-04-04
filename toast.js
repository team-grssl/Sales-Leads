document.addEventListener('DOMContentLoaded', () => {
    let toastContainer = document.getElementById('toast-container');

    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none';
        document.body.appendChild(toastContainer);
    }

    window.showToast = function (message, type = 'info') {
        const toast = document.createElement('div');

        let bgClass = 'bg-slate-800 text-white';
        let icon = 'notifications';

        if (type === 'success') {
            bgClass = 'bg-emerald-600 text-white';
            icon = 'check_circle';
        } else if (type === 'error') {
            bgClass = 'bg-red-600 text-white';
            icon = 'error';
        } else if (type === 'warning') {
            bgClass = 'bg-amber-500 text-white';
            icon = 'warning';
        }

        toast.className = `flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-sm font-medium transform transition-all duration-300 translate-y-8 opacity-0 pointer-events-auto ${bgClass}`;
        toast.innerHTML = `
            <span class="material-symbols-outlined text-lg">${icon}</span>
            <span>${message}</span>
        `;

        toastContainer.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.remove('translate-y-8', 'opacity-0');
        });

        setTimeout(() => {
            toast.classList.add('translate-y-8', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };
});
