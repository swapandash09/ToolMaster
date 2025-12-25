// ==========================================
// ⚡ TOOLMASTER TITANIUM V39 PRO (STABLE)
// ==========================================

const App = {
    version: 'V39 Pro Stable',
    currentPage: 'home-page',
    
    init: function() {
        console.log(`%c ToolMaster ${this.version} %c Running `, 
        'background:#6366f1; color:white; padding:4px; border-radius:4px;', 
        'color:#6366f1;');
        
        this.loadTheme();
        this.addGlobalListeners();
        
        // Loader handling
        setTimeout(() => this.loader(false), 600);
    },

    // --- 1. FIXED NAVIGATION SYSTEM ---
    navigateTo: function(viewId) {
        const homePage = document.getElementById('home-page');
        const toolContainer = document.getElementById('tool-container');

        if (!homePage || !toolContainer) {
            console.error("Critical UI elements missing!");
            return;
        }

        // Reset: Hide everything first for a clean transition
        if (viewId === 'home-page') {
            toolContainer.classList.add('hidden');
            homePage.classList.remove('hidden');
            homePage.classList.add('fade-in');
            this.currentPage = 'home-page';
        } 
        else {
            const toolElement = document.getElementById(viewId);
            
            if (toolElement) {
                // Step 1: Hide Home and Show Container
                homePage.classList.add('hidden');
                toolContainer.classList.remove('hidden');
                
                // Step 2: Hide all other tool workspaces
                document.querySelectorAll('.tool-workspace').forEach(el => {
                    el.classList.add('hidden');
                });
                
                // Step 3: Show selected tool with animation
                toolElement.classList.remove('hidden');
                toolElement.classList.add('slide-up');
                
                // Step 4: Scroll content area to top
                const contentArea = document.querySelector('.content-area');
                if (contentArea) contentArea.scrollTop = 0;
                
                this.currentPage = viewId;
            } else {
                this.showToast("Error: Tool ID not found!", "error");
                this.goHome(); // Fallback to home
            }
        }
        
        this.updateSidebar(viewId);
    },

    goHome: function() {
        this.navigateTo('home-page');
    },

    // --- 2. SIDEBAR ACTIVE STATE FIX ---
    updateSidebar: function(viewId) {
        document.querySelectorAll('.side-nav li').forEach(li => {
            li.classList.remove('active');
            // Agar li ka onclick viewId contain karta hai to use active karo
            if (li.getAttribute('onclick') && li.getAttribute('onclick').includes(viewId)) {
                li.classList.add('active');
            }
        });
    },

    // --- 3. THEME ENGINE ---
    toggleTheme: function() {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('tm_theme', isLight ? 'light' : 'dark');
        this.showToast(isLight ? "Light Mode Active" : "Dark Mode Active", "info");
    },

    loadTheme: function() {
        const saved = localStorage.getItem('tm_theme');
        if(saved === 'light') document.body.classList.add('light-mode');
    },

    // --- 4. IMPROVED TOAST SYSTEM ---
    showToast: function(msg, type = 'success') {
        const container = document.getElementById('toast-container');
        if(!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type} slide-up`;
        
        const icon = type === 'error' ? 'ri-error-warning-fill' : 
                     type === 'info' ? 'ri-information-fill' : 'ri-checkbox-circle-fill';
        
        toast.innerHTML = `<i class="${icon}"></i> <span>${msg}</span>`;
        
        // Final V39 Styling logic
        toast.style.cssText = `
            background: rgba(15, 15, 20, 0.9);
            backdrop-filter: blur(10px);
            border: 1px solid ${type === 'error' ? '#ef4444' : 'rgba(255,255,255,0.1)'};
            color: white; padding: 14px 24px; border-radius: 50px; margin-top: 10px;
            display: flex; align-items: center; gap: 12px; min-width: 280px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.5);
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px) scale(0.9)';
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    },

    // --- 5. SMART FILTER ---
    filterTools: function(val) {
        const term = val.toLowerCase();
        document.querySelectorAll('.t-card').forEach(card => {
            const title = card.querySelector('h4').innerText.toLowerCase();
            const desc = card.querySelector('p').innerText.toLowerCase();
            card.style.display = (title.includes(term) || desc.includes(term)) ? 'flex' : 'none';
        });
    },

    addGlobalListeners: function() {
        const search = document.getElementById('search-bar');
        if(search) {
            search.addEventListener('input', (e) => this.filterTools(e.target.value));
            // Add Ctrl+K Shortcut for search
            document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                    e.preventDefault();
                    search.focus();
                }
            });
        }
    },

    loader: function(show) {
        const el = document.getElementById('loading-overlay');
        if(el) {
            if(show) {
                el.classList.remove('hidden');
                el.style.opacity = '1';
            } else {
                el.style.opacity = '0';
                setTimeout(() => el.classList.add('hidden'), 500);
            }
        }
    }
};

// --- GLOBAL EXPORTS ---
window.showHome = () => App.goHome();
window.openTool = (id) => App.navigateTo(id);
window.toggleTheme = () => App.toggleTheme();
window.showToast = (m, t) => App.showToast(m, t);
window.loader = (s) => App.loader(s);

// Launch
document.addEventListener('DOMContentLoaded', () => App.init());
