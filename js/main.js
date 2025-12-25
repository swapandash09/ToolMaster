// ==========================================
// ⚡ TOOLMASTER TITANIUM V39 (FIXED CORE)
// ==========================================

const App = {
    version: 'V39 Stable',
    currentPage: 'home-page',
    
    init: function() {
        console.log("ToolMaster Initialized");
        this.loadTheme();
        this.addGlobalListeners();
        
        // Loader hatao
        setTimeout(() => {
            const loader = document.getElementById('loading-overlay');
            if(loader) loader.classList.add('hidden');
        }, 500);
    },

    // --- 1. NAVIGATION SYSTEM (FIXED) ---
    navigateTo: function(viewId) {
        // Step 1: Check karo ki user Home pe ja raha hai ya Tool pe
        if (viewId === 'home-page') {
            // Show Home
            document.getElementById('home-page').classList.remove('hidden');
            document.getElementById('home-page').classList.add('fade-in');
            
            // Hide Tool Container
            document.getElementById('tool-container').classList.add('hidden');
            
            this.currentPage = 'home-page';
        } 
        else {
            // User Tool khol raha hai
            const toolElement = document.getElementById(viewId);
            
            if (toolElement) {
                // Hide Home
                document.getElementById('home-page').classList.add('hidden');
                
                // Show Main Container
                document.getElementById('tool-container').classList.remove('hidden');
                
                // Pehle saare tools chhupao (Reset)
                document.querySelectorAll('.tool-workspace').forEach(el => {
                    el.classList.add('hidden');
                });
                
                // Ab sirf selected tool dikhao
                toolElement.classList.remove('hidden');
                toolElement.classList.add('slide-up');
                
                // Scroll to top
                document.querySelector('.content-area').scrollTop = 0;
                
                this.currentPage = viewId;
            } else {
                console.error("Tool Not Found:", viewId);
                this.showToast("Error: Tool ID not found!", "error");
            }
        }
        
        this.updateSidebar(viewId);
    },

    goHome: function() {
        this.navigateTo('home-page');
    },

    updateSidebar: function(id) {
        // Sidebar active state update karo
        document.querySelectorAll('.side-nav li').forEach(li => li.classList.remove('active'));
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

    // --- 3. TOAST NOTIFICATIONS ---
    showToast: function(msg, type = 'success') {
        const container = document.getElementById('toast-container');
        if(!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = 'ri-checkbox-circle-fill';
        if(type === 'error') icon = 'ri-error-warning-fill';
        
        toast.innerHTML = `<i class="${icon}"></i> <span>${msg}</span>`;
        
        // Inline Styles ensure it works even if CSS is broken
        toast.style.cssText = `
            background: rgba(20,20,25,0.95); border: 1px solid rgba(255,255,255,0.1);
            color: white; padding: 12px 20px; border-radius: 50px; margin-top: 10px;
            display: flex; align-items: center; gap: 10px; min-width: 250px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5); animation: slideUp 0.3s ease;
        `;
        if(type === 'error') toast.style.border = '1px solid #ef4444';

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // --- 4. SEARCH FILTER ---
    filterTools: function(val) {
        const term = val.toLowerCase();
        document.querySelectorAll('.t-card').forEach(card => {
            const txt = card.innerText.toLowerCase();
            card.style.display = txt.includes(term) ? 'flex' : 'none';
        });
    },

    addGlobalListeners: function() {
        const search = document.getElementById('search-bar');
        if(search) search.addEventListener('input', (e) => this.filterTools(e.target.value));
    }
};

// --- GLOBAL EXPORTS (HTML ke liye zaroori) ---
window.showHome = () => App.goHome();
window.openTool = (id) => App.navigateTo(id);
window.toggleTheme = () => App.toggleTheme();
window.showToast = (m, t) => App.showToast(m, t);
window.filterTools = () => {}; 
window.loader = (show) => {
    const el = document.getElementById('loading-overlay');
    if(el) show ? el.classList.remove('hidden') : el.classList.add('hidden');
};

// Start App
document.addEventListener('DOMContentLoaded', () => App.init());
