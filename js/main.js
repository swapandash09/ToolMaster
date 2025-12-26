// ==========================================
// ⚡ TOOLMASTER TITANIUM V39 PRO - FINAL JS
// ==========================================

const App = {
    version: 'V39 Pro Stable',
    currentPage: 'home-page',
    
    init: function() {
        console.log(`%c ToolMaster ${this.version} %c Ready `, 
        'background:#6366f1; color:white; padding:2px 5px; border-radius:4px;', 
        'color:#6366f1; font-weight:bold;');
        
        this.loadTheme(); // LocalStorage se saved theme load karega
        this.addGlobalListeners(); // Search bar aur keyboard shortcuts enable karega
        
        // Loader Handling
        const loader = document.getElementById('loading-overlay');
        if(loader) {
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => loader.classList.add('hidden'), 500);
            }, 600);
        }
    },

    // --- 1. SMART NAVIGATION (Responsive Fix) ---
    navigateTo: function(viewId) {
        const homePage = document.getElementById('home-page');
        const toolContainer = document.getElementById('tool-container');

        if (!homePage || !toolContainer) return;

        // Mobile par smooth transition ke liye scroll reset karein
        const contentArea = document.querySelector('.content-area');
        if (contentArea) contentArea.scrollTop = 0;

        if (viewId === 'home-page') {
            toolContainer.classList.add('hidden');
            homePage.classList.remove('hidden');
            homePage.classList.add('fade-in');
            this.currentPage = 'home-page';
        } 
        else {
            const toolElement = document.getElementById(viewId);
            
            if (toolElement) {
                homePage.classList.add('hidden');
                toolContainer.classList.remove('hidden');
                
                // Saare tools ko clean reset karein taaki UI overlap na ho
                document.querySelectorAll('.tool-workspace').forEach(el => {
                    el.style.display = 'none';
                    el.classList.remove('active', 'slide-up');
                });
                
                toolElement.style.display = 'block';
                
                // Delay for GPU-accelerated animation smoothness
                setTimeout(() => {
                    toolElement.classList.add('active', 'slide-up');
                }, 50);
                
                this.currentPage = viewId;
            } else {
                this.showToast("Error: Tool not found!", "error");
            }
        }
        this.updateSidebar(viewId);
    },

    // --- 2. THEME & SIDEBAR SYNC ---
    updateSidebar: function(viewId) {
        document.querySelectorAll('.side-nav li, .mobile-nav .nav-item').forEach(li => {
            li.classList.remove('active');
            const action = li.getAttribute('onclick');
            if (action && action.includes(viewId)) {
                li.classList.add('active');
            }
        });
    },

    toggleTheme: function() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('tm_theme', isDark ? 'dark' : 'light');
        this.showToast(isDark ? "Dark Theme Active" : "Light Theme Active", "info");
    },

    loadTheme: function() {
        const saved = localStorage.getItem('tm_theme');
        if(saved === 'dark') {
            document.body.classList.add('dark-mode');
        }
    },

    // --- 3. MOBILE FRIENDLY SEARCH (Fixed) ---
    addGlobalListeners: function() {
        const search = document.getElementById('search-bar');
        if(search) {
            search.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase().trim();
                
                document.querySelectorAll('.t-card').forEach(card => {
                    const title = card.querySelector('h4').innerText.toLowerCase();
                    const desc = card.querySelector('p')?.innerText.toLowerCase() || "";
                    
                    // Flex display maintain karein dashboard layout ke liye
                    if (title.includes(term) || desc.includes(term)) {
                        card.style.display = 'flex';
                        card.classList.add('fade-in');
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        }

        // Desktop Shortcut: Ctrl+K focus search
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                search?.focus();
            }
        });
    },

    // --- 4. TOAST NOTIFICATIONS ---
    showToast: function(msg, type = 'success') {
        const container = document.getElementById('toast-container');
        if(!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type} fade-in`;
        
        toast.style.cssText = `
            background: rgba(15, 15, 20, 0.95); backdrop-filter: blur(15px);
            border: 1px solid ${type === 'error' ? '#ef4444' : 'rgba(255,255,255,0.1)'};
            color: white; padding: 12px 24px; border-radius: 50px; margin-top: 10px;
            display: flex; align-items: center; gap: 12px; min-width: 280px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.5); z-index: 9999;
        `;

        toast.innerHTML = `<span>${msg}</span>`;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }
};

// --- UNIVERSAL SLIDER (Mobile Touch Optimized) ---
window.slideCompare = (val, type) => {
    const prefix = type === 'enh' ? 'enh' : 'bg';
    const front = document.getElementById(`${prefix}-front`) || document.getElementById('bg-original-img');
    const line = document.getElementById(`${prefix}-line`);
    const handle = document.getElementById(`${prefix}-handle`);

    if(front) front.style.clipPath = `inset(0 ${100 - val}% 0 0)`;
    if(line) line.style.left = `${val}%`;
    if(handle) handle.style.left = `${val}%`;
};

// Global Exports
window.showHome = () => App.navigateTo('home-page');
window.openTool = (id) => App.navigateTo(id);
window.toggleTheme = () => App.toggleTheme();

document.addEventListener('DOMContentLoaded', () => App.init());
