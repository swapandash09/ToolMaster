// ==========================================
// ⚡ TOOLMASTER TITANIUM V39 - CORE LOGIC
// ==========================================

const App = {
    version: 'V39 Pro',
    currentPage: 'home-page',
    
    init: function() {
        console.log(`%c ToolMaster ${this.version} %c Initialized `, 
        'background:#6366f1; color:white; padding:4px; border-radius:4px;', 
        'color:#6366f1;');
        
        this.loadTheme();
        this.setupNavigation();
        this.addGlobalListeners();
        
        // Remove Loader
        setTimeout(() => document.getElementById('loading-overlay')?.classList.add('hidden'), 500);
    },

    // --- 1. SMART NAVIGATION ROUTER ---
    navigateTo: function(viewId) {
        // 1. Hide Current
        const current = document.getElementById(this.currentPage);
        if(current) current.classList.add('hidden');
        
        // 2. Determine Next View (Tool vs Home)
        let next = document.getElementById(viewId);
        
        // If viewId is a tool workspace (e.g., 'resume-tool') and not found in main nav logic
        if(!next && viewId.includes('-tool')) {
            document.getElementById('tool-container').classList.remove('hidden');
            document.getElementById('home-page').classList.add('hidden');
            
            // Hide all workspaces first
            document.querySelectorAll('.tool-workspace').forEach(el => el.classList.add('hidden'));
            
            // Show specific tool
            next = document.getElementById(viewId);
            if(next) {
                next.classList.remove('hidden');
                // Scroll to top
                document.querySelector('.content-area').scrollTop = 0;
            } else {
                this.showToast("Error: Tool not found!", "error");
                this.goHome();
                return;
            }
        } else {
            // It's a main page like 'home-page'
            document.getElementById('tool-container').classList.add('hidden');
            if(next) next.classList.remove('hidden');
        }

        this.currentPage = viewId;
        this.updateSidebar(viewId);
    },

    goHome: function() {
        this.navigateTo('home-page');
    },

    updateSidebar: function(id) {
        document.querySelectorAll('.side-nav li').forEach(li => li.classList.remove('active'));
        // Logic to highlight sidebar based on ID would go here if IDs matched 1:1
    },

    // --- 2. THEME ENGINE ---
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

    // --- 3. SEARCH & FILTER ---
    filterTools: function(query) {
        const term = query.toLowerCase();
        const cards = document.querySelectorAll('.t-card');
        
        cards.forEach(card => {
            const title = card.querySelector('h4').innerText.toLowerCase();
            const desc = card.querySelector('p').innerText.toLowerCase();
            
            if(title.includes(term) || desc.includes(term)) {
                card.style.display = 'flex';
                card.classList.add('fade-in');
            } else {
                card.style.display = 'none';
            }
        });
    },

    // --- 4. TOAST NOTIFICATION SYSTEM (V39 STACKABLE) ---
    showToast: function(msg, type = 'success') {
        const container = document.getElementById('toast-container');
        if(!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type} slide-up`;
        
        let icon = 'ri-checkbox-circle-fill';
        if(type === 'error') icon = 'ri-error-warning-fill';
        if(type === 'info') icon = 'ri-information-fill';

        toast.innerHTML = `<i class="${icon}"></i> <span>${msg}</span>`;
        
        // Styling via JS for simplicity if CSS missing
        toast.style.cssText = `
            background: rgba(20,20,25,0.9); backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1); color: white;
            padding: 12px 20px; border-radius: 50px; margin-top: 10px;
            display: flex; align-items: center; gap: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5); font-size: 0.9rem;
            min-width: 250px;
        `;
        if(type === 'error') toast.style.borderColor = '#ef4444';
        
        container.appendChild(toast);

        // Remove after 3s
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // --- 5. GLOBAL LISTENERS ---
    addGlobalListeners: function() {
        // Search Bar
        const search = document.getElementById('search-bar');
        if(search) search.addEventListener('input', (e) => this.filterTools(e.target.value));

        // Keyboard Shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+K for Search
            if((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                search?.focus();
            }
        });
    }
};

// --- GLOBAL EXPORTS (For HTML onclicks) ---
window.showHome = () => App.goHome();
window.openTool = (id) => App.navigateTo(id);
window.toggleTheme = () => App.toggleTheme();
window.showToast = (m, t) => App.showToast(m, t);
window.filterTools = () => {}; // Handled by listener, empty fn for legacy HTML support
window.loader = (show) => {
    const el = document.getElementById('loading-overlay');
    if(el) show ? el.classList.remove('hidden') : el.classList.add('hidden');
};

// Initialize
document.addEventListener('DOMContentLoaded', () => App.init());
