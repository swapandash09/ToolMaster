// ==========================================
// ⚡ TOOLMASTER TITANIUM V39 PRO - MAIN JS
// ==========================================

const App = {
    version: 'V39 Pro Stable',
    currentPage: 'home-page',
    
    init: function() {
        console.log(`ToolMaster ${this.version} Initialized`);
        this.loadTheme();
        this.addGlobalListeners();
        
        // Loader handling
        setTimeout(() => this.loader(false), 500);
    },

    // --- 1. CORE NAVIGATION ROUTER ---
    navigateTo: function(viewId) {
        const homePage = document.getElementById('home-page');
        const toolContainer = document.getElementById('tool-container');

        if (!homePage || !toolContainer) return;

        if (viewId === 'home-page') {
            // SHOW HOME
            toolContainer.classList.add('hidden');
            homePage.classList.remove('hidden');
            homePage.classList.add('fade-in');
            this.currentPage = 'home-page';
        } 
        else {
            // SHOW TOOL
            const toolElement = document.getElementById(viewId);
            
            if (toolElement) {
                homePage.classList.add('hidden');
                toolContainer.classList.remove('hidden');
                
                // Hide all workspaces first
                document.querySelectorAll('.tool-workspace').forEach(el => {
                    el.classList.add('hidden');
                    el.classList.remove('slide-up');
                });
                
                // Show selected tool
                toolElement.classList.remove('hidden');
                toolElement.classList.add('slide-up');
                
                this.currentPage = viewId;
                document.querySelector('.content-area').scrollTop = 0;
            } else {
                this.showToast("Error: Tool not found!", "error");
            }
        }
        this.updateSidebar(viewId);
    },

    goHome: function() { this.navigateTo('home-page'); },

    // --- 2. THEME & UI ---
    updateSidebar: function(viewId) {
        document.querySelectorAll('.side-nav li').forEach(li => {
            li.classList.remove('active');
            if (li.getAttribute('onclick') && li.getAttribute('onclick').includes(viewId)) {
                li.classList.add('active');
            }
        });
    },

    toggleTheme: function() {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('tm_theme', isLight ? 'light' : 'dark');
        this.showToast(isLight ? "Light Mode" : "Dark Mode", "info");
    },

    loadTheme: function() {
        const saved = localStorage.getItem('tm_theme');
        if(saved === 'light') document.body.classList.add('light-mode');
    },

    showToast: function(msg, type = 'success') {
        const container = document.getElementById('toast-container');
        if(!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type} fade-in`;
        toast.innerHTML = `<span>${msg}</span>`;
        
        // Enhanced Styling
        toast.style.cssText = `
            background: rgba(15, 15, 20, 0.9); backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1); color: white;
            padding: 12px 24px; border-radius: 50px; margin-top: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        `;
        if(type === 'error') toast.style.borderColor = '#ef4444';

        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    loader: function(show) {
        const el = document.getElementById('loading-overlay');
        if(el) show ? el.classList.remove('hidden') : el.classList.add('hidden');
    },

    addGlobalListeners: function() {
        const search = document.getElementById('search-bar');
        if(search) {
            search.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                document.querySelectorAll('.t-card').forEach(card => {
                    const txt = card.innerText.toLowerCase();
                    card.style.display = txt.includes(term) ? 'flex' : 'none';
                });
            });
        }
    }
};

// Global Exports
window.showHome = () => App.goHome();
window.openTool = (id) => App.navigateTo(id);
window.toggleTheme = () => App.toggleTheme();
window.loader = (s) => App.loader(s);

document.addEventListener('DOMContentLoaded', () => App.init());
