// ==========================================
// ⚡ TOOLMASTER TITANIUM V40 - FINAL STABLE
// ==========================================

const App = {
    version: 'V40 Final',
    currentPage: 'home-page',

    init: function() {
        console.log(`ToolMaster Titanium ${this.version} Initialized`);
        this.loadTheme();
        this.addGlobalListeners();
        this.updateSidebar('home-page');

        // FORCE SHOW HOME PAGE - PREVENT BLACK SCREEN
        const home = document.getElementById('home-page');
        const toolContainer = document.getElementById('tool-container');
        const loader = document.getElementById('loading-overlay');

        if (home) {
            home.classList.remove('hidden');
            home.style.display = 'block';
            home.style.opacity = '1';
        }
        if (toolContainer) toolContainer.classList.add('hidden');

        setTimeout(() => {
            if (loader) {
                loader.classList.add('hidden');
                loader.style.display = 'none';
            }
        }, 800);
    },

    navigateTo: function(viewId) {
        if (this.currentPage === viewId) return;

        document.querySelectorAll('#home-page, #tool-container').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.tool-workspace').forEach(ws => {
            ws.classList.add('hidden');
            ws.classList.remove('slide-up');
        });

        if (viewId === 'home-page') {
            const home = document.getElementById('home-page');
            home.classList.remove('hidden');
            home.classList.add('fade-in');
            this.currentPage = 'home-page';
        } else {
            const tool = document.getElementById(viewId);
            if (!tool) {
                this.showToast("Tool not found!", "error");
                this.goHome();
                return;
            }
            document.getElementById('tool-container').classList.remove('hidden');
            tool.classList.remove('hidden');
            tool.classList.add('slide-up');
            document.querySelector('.content-area').scrollTop = 0;
            this.currentPage = viewId;
        }
        this.updateSidebar(viewId);
    },

    goHome: function() { this.navigateTo('home-page'); },

    updateSidebar: function(id) {
        document.querySelectorAll('.side-nav li').forEach(li => li.classList.remove('active'));
        if (id === 'home-page') {
            const homeItem = document.querySelector('.side-nav li[data-page="home-page"]');
            if (homeItem) homeItem.classList.add('active');
        } else {
            const item = document.querySelector(`.side-nav li[data-tool="${id}"]`);
            if (item) item.classList.add('active');
        }
    },

    toggleTheme: function() {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('tm_theme', isLight ? 'light' : 'dark');
        this.showToast(isLight ? "☀️ Light Mode" : "🌙 Dark Mode", "info");
    },

    loadTheme: function() {
        if (localStorage.getItem('tm_theme') === 'light') {
            document.body.classList.add('light-mode');
        }
    },

    showToast: function(msg, type = 'success', duration = 3000) {
        const container = document.getElementById('toast-container') || this.createToastContainer();
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        const icons = { success: 'ri-checkbox-circle-fill', error: 'ri-error-warning-fill', info: 'ri-information-fill' };
        toast.innerHTML = `<i class="${icons[type]}"></i><span>${msg}</span><div class="toast-progress"></div>`;
        toast.style.cssText = `background: rgba(20,20,25,0.96); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 14px 20px; border-radius: 50px; margin-top: 12px; display: flex; align-items: center; gap: 12px; min-width: 280px; box-shadow: 0 12px 40px rgba(0,0,0,0.5); animation: slideInRight 0.4s ease; position: relative; overflow: hidden;`;
        if (type === 'error') toast.style.border = '1px solid #ef4444';
        container.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100%)'; setTimeout(() => toast.remove(), 400); }, duration);
    },

    createToastContainer: function() {
        const div = document.createElement('div');
        div.id = 'toast-container';
        div.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000; display: flex; flex-direction: column; align-items: flex-end; gap: 10px;';
        document.body.appendChild(div);
        return div;
    },

    filterTools: function(val) {
        const term = val.trim().toLowerCase();
        document.querySelectorAll('.t-card').forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(term) ? 'flex' : (term ? 'none' : 'flex');
        });
    },

    addGlobalListeners: function() {
        const search = document.getElementById('search-bar');
        if (search) search.addEventListener('input', e => this.filterTools(e.target.value));
    }
};

// Global Functions
window.showHome = () => App.goHome();
window.openTool = (id) => App.navigateTo(id);
window.toggleTheme = () => App.toggleTheme();
window.showToast = (m, t) => App.showToast(m, t);
window.loader = (show = true) => {
    const el = document.getElementById('loading-overlay');
    if (el) el.classList.toggle('hidden', !show);
};

// Ctrl + K for search
document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        document.getElementById('search-bar')?.focus();
    }
});

document.addEventListener('DOMContentLoaded', () => App.init());
