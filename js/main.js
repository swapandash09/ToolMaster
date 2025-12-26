// ==========================================
// ⚡ TOOLMASTER TITANIUM V40 (ENHANCED & FIXED CORE)
// ==========================================

const App = {
    version: 'V40 Stable',
    currentPage: 'home-page',

    init: function() {
        console.log(`ToolMaster Titanium ${this.version} Initialized`);
        this.loadTheme();
        this.addGlobalListeners();
        this.updateSidebar(this.currentPage);

        // Smooth loader removal
        setTimeout(() => {
            const loader = document.getElementById('loading-overlay');
            if (loader) {
                loader.classList.add('fade-out');
                setTimeout(() => loader.classList.add('hidden'), 400);
            }
        }, 600);
    },

    // --- 1. NAVIGATION SYSTEM (FULLY FIXED & ENHANCED) ---
    navigateTo: function(viewId) {
        // Prevent unnecessary re-renders
        if (this.currentPage === viewId) return;

        // Hide all main sections first
        document.querySelectorAll('#home-page, #tool-container').forEach(section => {
            section.classList.add('hidden');
        });

        // Reset all tool workspaces
        document.querySelectorAll('.tool-workspace').forEach(ws => {
            ws.classList.add('hidden');
            ws.classList.remove('slide-up');
        });

        if (viewId === 'home-page') {
            // Show Home
            const home = document.getElementById('home-page');
            home.classList.remove('hidden');
            home.classList.add('fade-in');
            this.currentPage = 'home-page';
        } else {
            // Show Tool View
            const toolElement = document.getElementById(viewId);
            if (!toolElement) {
                console.error("Tool Not Found:", viewId);
                this.showToast("Error: Tool not found or ID invalid!", "error");
                this.goHome();
                return;
            }

            // Show tool container
            document.getElementById('tool-container').classList.remove('hidden');

            // Show selected tool
            toolElement.classList.remove('hidden');
            toolElement.classList.add('slide-up');

            // Smooth scroll to top of content area
            const contentArea = document.querySelector('.content-area');
            if (contentArea) contentArea.scrollTop = 0;

            this.currentPage = viewId;
        }

        this.updateSidebar(viewId);
    },

    goHome: function() {
        this.navigateTo('home-page');
    },

    // --- SIDEBAR ACTIVE STATE (NOW FIXED) ---
    updateSidebar: function(activeId) {
        // Clear all active states
        document.querySelectorAll('.side-nav li').forEach(li => {
            li.classList.remove('active');
        });

        // Special case: Home page (no specific li, so clear only)
        if (activeId === 'home-page') {
            // Optionally highlight "Home" if you have a dedicated menu item with data-page="home-page"
            const homeItem = document.querySelector('.side-nav li[data-page="home-page"]');
            if (homeItem) homeItem.classList.add('active');
            return;
        }

        // For tools: match by data-tool attribute
        const activeItem = document.querySelector(`.side-nav li[data-tool="${activeId}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    },

    // --- 2. THEME ENGINE (IMPROVED) ---
    toggleTheme: function() {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('tm_theme', isLight ? 'light' : 'dark');
        this.showToast(isLight ? "☀️ Light Mode Activated" : "🌙 Dark Mode Activated", "info");
    },

    loadTheme: function() {
        const saved = localStorage.getItem('tm_theme');
        if (saved === 'light') {
            document.body.classList.add('light-mode');
        }
    },

    // --- 3. TOAST NOTIFICATIONS (ENHANCED) ---
    showToast: function(msg, type = 'success', duration = 3000) {
        const container = document.getElementById('toast-container') || this.createToastContainer();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
            success: 'ri-checkbox-circle-fill',
            error: 'ri-error Navarro-warning-fill',
            info: 'ri-information-fill',
            warning: 'ri-alert-fill'
        };

        toast.innerHTML = `
            <i class="${icons[type] || icons.success}"></i>
            <span>${msg}</span>
            <div class="toast-progress"></div>
        `;

        // Enhanced styling with progress bar
        toast.style.cssText = `
            background: rgba(20,20,25,0.96); 
            border: 1px solid rgba(255,255,255,0.1);
            color: white; 
            padding: 14px 20px; 
            border-radius: 50px; 
            margin-top: 12px;
            display: flex; 
            align-items: center; 
            gap: 12px; 
            min-width: 280px;
            box-shadow: 0 12px 40px rgba(0,0,0,0.5); 
            animation: slideInRight 0.4s ease;
            position: relative;
            overflow: hidden;
        `;

        if (type === 'error') toast.style.border = '1px solid #ef4444';
        if (type === 'warning') toast.style.border = '1px solid #f97316';

        container.appendChild(toast);

        // Auto-remove with progress animation
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 400);
        }, duration);
    },

    createToastContainer: function() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed; 
            top: 20px; 
            right: 20px; 
            z-index: 10000; 
            display: flex; 
            flex-direction: column; 
            align-items: flex-end;
            gap: 10px;
        `;
        document.body.appendChild(container);
        return container;
    },

    // --- 4. SEARCH FILTER (IMPROVED & CASE-INSENSITIVE) ---
    filterTools: function(val) {
        const term = val.trim().toLowerCase();
        if (!term) {
            document.querySelectorAll('.t-card').forEach(card => {
                card.style.display = 'flex';
                card.classList.remove('hidden');
            });
            return;
        }

        document.querySelectorAll('.t-card').forEach(card => {
            const text = card.textContent || card.innerText || '';
            const matches = text.toLowerCase().includes(term);
            card.style.display = matches ? 'flex' : 'none';
        });
    },

    // --- 5. GLOBAL LISTENERS ---
    addGlobalListeners: function() {
        const search = document.getElementById('search-bar');
        if (search) {
            search.addEventListener('input', (e) => {
                this.filterTools(e.target.value);
            });
        }

        // Optional: Clear search on home navigation
        // You can trigger this via event if needed
    }
};

// --- GLOBAL EXPORTS (FOR HTML ONCLICK) ---
window.showHome = () => App.goHome();
window.openTool = (id) => App.navigateTo(id);
window.toggleTheme = () => App.toggleTheme();
window.showToast = (msg, type) => App.showToast(msg, type);
window.loader = (show = true) => {
    const el = document.getElementById('loading-overlay');
    if (el) {
        if (show) {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    }
};

// Optional: Add keybinding for search focus (Ctrl+K)
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        const search = document.getElementById('search-bar');
        if (search) search.focus();
    }
});

// Start the App
document.addEventListener('DOMContentLoaded', () => App.init());
