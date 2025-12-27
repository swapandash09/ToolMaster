// ==========================================
// ⚡ TOOLMASTER TITANIUM V44 - STABLE CORE
// ==========================================

const App = {
    version: 'V44 Stable',
    state: {
        currentView: 'home-page',
        isLoading: false
    },
    dom: {}, 

    init: function() {
        console.log(`%c ${this.version} %c System Online `, 
            'background:#10b981; color:white; padding: 3px 6px; border-radius: 4px; font-weight:bold;', 
            'color:#10b981; font-weight:bold;');
        
        this.cacheDOM();
        this.loadTheme();
        this.setupSearch();
        this.setupShortcuts();
        this.setupRouter();

        // 🚀 SAFE LAUNCH SEQUENCE
        window.addEventListener('load', () => {
            const loader = document.getElementById('loading-overlay');
            if(loader) {
                setTimeout(() => {
                    loader.style.opacity = '0';
                    setTimeout(() => {
                        loader.style.display = 'none';
                        document.body.classList.add('app-loaded');
                    }, 500);
                }, 300);
            }
            // Force Home Visibility on Load
            this.navigateTo('home-page', false, true); 
        });
    },

    cacheDOM: function() {
        this.dom = {
            homePage: document.getElementById('home-page'),
            toolContainer: document.getElementById('tool-container'),
            searchBar: document.getElementById('search-bar')
        };
    },

    // --- 1. BULLETPROOF NAVIGATION ---
    navigateTo: function(viewId, addToHistory = true, forceInstant = false) {
        if(this.state.isLoading && !forceInstant) return;
        
        // 1. Lifecycle Cleanup (Stop Cameras/Videos)
        if (this.state.currentView !== 'home-page') {
            window.dispatchEvent(new CustomEvent('toolClosed', { detail: { toolId: this.state.currentView } }));
        }

        // 2. History
        if (addToHistory) {
            history.pushState({ viewId }, "", `#${viewId.replace('-tool', '')}`);
        }
        this.state.currentView = viewId;

        const isGoingHome = viewId === 'home-page';

        // --- INSTANT SWITCH (No Animation - Safety Mode) ---
        if(forceInstant) {
            this._swapViews(viewId);
            return;
        }

        // --- ANIMATED SWITCH ---
        const activeContainer = isGoingHome ? this.dom.toolContainer : this.dom.homePage;
        
        // Step 1: Fade Out Active
        activeContainer.style.opacity = '0';
        activeContainer.style.transform = isGoingHome ? 'translateY(15px)' : 'scale(0.95)';
        
        setTimeout(() => {
            // Step 2: Swap DOM (Hide Old, Show New)
            this._swapViews(viewId);
            
            // Step 3: Fade In New
            const newContainer = isGoingHome ? this.dom.homePage : this.dom.toolContainer;
            
            // Prepare for entry
            newContainer.style.opacity = '0';
            newContainer.style.transform = isGoingHome ? 'scale(0.98)' : 'translateY(15px)';
            
            requestAnimationFrame(() => {
                newContainer.style.transition = 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
                newContainer.style.opacity = '1';
                newContainer.style.transform = 'translateY(0) scale(1)';
            });

        }, 200); // Wait for fade out
    },

    // INTERNAL: Handles CSS Classes (The "Fix")
    _swapViews: function(viewId) {
        window.scrollTo(0, 0);

        if (viewId === 'home-page') {
            // SHOW HOME
            this.dom.toolContainer.classList.add('hidden');
            this.dom.toolContainer.style.display = 'none'; // Force hide
            
            this.dom.homePage.classList.remove('hidden');
            this.dom.homePage.style.display = 'block'; // Force block
            this.dom.homePage.style.opacity = '1'; // Force visible
            
            // Cleanup Search
            if(this.dom.searchBar) { this.dom.searchBar.value = ''; this.filterTools(''); }
            document.title = "ToolMaster Titanium - Dashboard";
            this.updateSidebar('home');

        } else {
            // SHOW TOOL
            const toolElement = document.getElementById(viewId);
            if (!toolElement) {
                this.showToast(`Error: Tool "${viewId}" not found.`, "error");
                return this.navigateTo('home-page', false, true);
            }

            this.dom.homePage.classList.add('hidden');
            this.dom.homePage.style.display = 'none'; // Force hide

            this.dom.toolContainer.classList.remove('hidden');
            this.dom.toolContainer.style.display = 'block'; // Force block
            
            // Hide all workspaces first
            document.querySelectorAll('.tool-workspace').forEach(el => {
                el.classList.add('hidden');
                el.style.display = 'none';
            });
            
            // Show Target Tool
            toolElement.classList.remove('hidden');
            toolElement.style.display = 'block';
            toolElement.style.opacity = '1';

            // Lifecycle Event
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('toolOpened', { detail: { toolId: viewId } }));
            }, 50);

            const name = toolElement.querySelector('h2')?.innerText || "Tool";
            document.title = `ToolMaster - ${name}`;
            this.updateSidebar(viewId);
        }
    },

    // --- 2. BROWSER BACK BUTTON FIX ---
    setupRouter: function() {
        window.addEventListener('popstate', (event) => {
            const target = (event.state && event.state.viewId) ? event.state.viewId : 'home-page';
            // Use Instant Switch for Back Button to prevent glitches
            this.navigateTo(target, false, false);
        });

        // Initial Load Logic
        const hash = window.location.hash.substring(1);
        if(hash) {
            const toolId = hash.includes('-tool') ? hash : hash + '-tool';
            if(document.getElementById(toolId)) this.navigateTo(toolId, false, true);
        }
    },

    // --- 3. SIDEBAR SYNC ---
    updateSidebar: function(activeId) {
        document.querySelectorAll('.side-nav li, .mobile-nav .nav-item').forEach(li => {
            li.classList.remove('active');
            const action = li.getAttribute('onclick') || li.getAttribute('href') || "";
            
            const isHome = activeId === 'home-page';
            if ((isHome && (action.includes('showHome') || action === '#')) ||
                (!isHome && action.includes(activeId))) {
                li.classList.add('active');
            }
        });
    },

    // --- 4. THEME & SEARCH ---
    toggleTheme: function() {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('tm_theme', isLight ? 'light' : 'dark');
        this.showToast(isLight ? "Light Mode Active" : "Dark Mode Active", "info");
    },

    loadTheme: function() {
        if (localStorage.getItem('tm_theme') === 'light') document.body.classList.add('light-mode');
    },

    setupSearch: function() {
        if(!this.dom.searchBar) return;
        this.dom.searchBar.addEventListener('input', (e) => {
            this.filterTools(e.target.value.toLowerCase().trim());
        });
    },

    filterTools: function(term) {
        document.querySelectorAll('.t-card').forEach(card => {
            const txt = card.innerText.toLowerCase();
            card.style.display = txt.includes(term) ? 'flex' : 'none';
        });
        
        // Show/Hide Categories based on visible cards
        document.querySelectorAll('.category-block').forEach(cat => {
            const visible = cat.querySelectorAll('.t-card[style="display: flex;"]');
            cat.style.display = visible.length > 0 ? 'block' : 'none';
        });
    },

    // --- 5. HELPERS ---
    setupShortcuts: function() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.navigateTo('home-page');
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.navigateTo('home-page');
                setTimeout(() => this.dom.searchBar?.focus(), 100);
            }
        });
    },

    showToast: function(msg, type = 'success') {
        let box = document.getElementById('toast-container');
        if(!box) {
            box = document.createElement('div'); box.id = 'toast-container';
            document.body.appendChild(box);
        }
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<div class="toast-content"><span>${msg}</span></div>`;
        box.appendChild(toast);
        
        requestAnimationFrame(() => { toast.style.transform = 'translateY(0)'; toast.style.opacity = '1'; });
        setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
    }
};

// GLOBAL API
window.App = App;
window.showHome = () => App.navigateTo('home-page');
window.openTool = (id) => App.navigateTo(id);
window.toggleTheme = () => App.toggleTheme();
window.showToast = (m, t) => App.showToast(m, t);
window.loader = (show) => {
    const l = document.getElementById('loading-overlay');
    if(l) l.style.display = show ? 'flex' : 'none';
};

document.addEventListener('DOMContentLoaded', () => App.init());
