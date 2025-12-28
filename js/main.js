// ==========================================
// ⚡ TOOLMASTER TITANIUM V51 - QUANTUM CORE
// ==========================================

const App = {
    version: 'V51 Quantum',
    config: {
        animDuration: 350, // Perfect balance of speed & smooth
        ease: 'cubic-bezier(0.2, 0.8, 0.2, 1)'
    },
    state: {
        currentView: 'home-page',
        isAnimating: false,
        historyStack: []
    },
    
    init: function() {
        console.log(`%c Titanium ${this.version} Online `, "background: #6366f1; color: white; border-radius: 4px; padding: 4px;");
        
        this.loadTheme();
        this.setupSearch();
        this.setupRouter();
        this.setupShortcuts();
        
        // Quantum Launch Sequence
        window.addEventListener('load', () => {
            const loader = document.getElementById('loading-overlay');
            if(loader) {
                // Ensure fonts/icons loaded before revealing
                requestAnimationFrame(() => {
                    loader.style.opacity = '0';
                    setTimeout(() => loader.style.display = 'none', 400);
                });
            }
            // Check Hash or Go Home
            const hash = window.location.hash.substring(1);
            if(hash && document.getElementById(hash + '-tool')) {
                this.navigateTo(hash + '-tool', false, true);
            } else {
                this.navigateTo('home-page', false, true);
            }
        });
    },

    // --- 🚀 QUANTUM NAVIGATION ENGINE (60FPS) ---
    navigateTo: function(viewId, addToHistory = true, instant = false) {
        const home = document.getElementById('home-page');
        const toolsContainer = document.getElementById('tool-container');
        
        if (!home || !toolsContainer) return;
        if (this.state.currentView === viewId || this.state.isAnimating) return;

        // Prevent Double Clicks
        if(!instant) this.state.isAnimating = true;

        if (addToHistory) {
            const slug = viewId === 'home-page' ? '' : `#${viewId.replace('-tool', '')}`;
            history.pushState({ viewId }, "", slug || window.location.pathname);
        }

        const isGoingHome = viewId === 'home-page';
        const outgoing = isGoingHome ? toolsContainer : home;
        const incoming = isGoingHome ? home : toolsContainer;

        // Cleanup previous tool
        if (isGoingHome) {
            window.dispatchEvent(new CustomEvent('toolClosed', { detail: { toolId: this.state.currentView } }));
            this.resetSearch();
            document.title = "ToolMaster - Dashboard";
        }

        // --- INSTANT SWITCH (No Animation) ---
        if (instant) {
            this._swapVisibility(outgoing, incoming);
            if(!isGoingHome) this._activateTool(viewId);
            this.updateSidebar(viewId);
            this.state.currentView = viewId;
            this.state.isAnimating = false;
            return;
        }

        // --- SMOOTH ANIMATION SWITCH ---
        // 1. Prepare Incoming
        if(!isGoingHome) this._activateTool(viewId);
        incoming.style.display = 'block';
        incoming.style.opacity = '0';
        incoming.style.transform = isGoingHome ? 'scale(0.96)' : 'translateY(20px)';
        
        // 2. Animate Out
        outgoing.style.transition = `opacity 0.2s ease, transform 0.2s ease`;
        outgoing.style.opacity = '0';
        outgoing.style.transform = isGoingHome ? 'translateY(20px)' : 'scale(0.96)';

        setTimeout(() => {
            outgoing.style.display = 'none';
            // Reset transforms for next usage
            outgoing.style.transform = 'none';
            outgoing.classList.add('hidden');

            // 3. Animate In
            requestAnimationFrame(() => {
                incoming.classList.remove('hidden');
                incoming.style.transition = `opacity 0.4s ${this.config.ease}, transform 0.4s ${this.config.ease}`;
                incoming.style.opacity = '1';
                incoming.style.transform = 'none';
                
                // 4. Finish
                setTimeout(() => {
                    this.state.isAnimating = false;
                    // Clear inline styles to let CSS take over
                    incoming.style.transition = '';
                    incoming.style.transform = '';
                    incoming.style.opacity = '';
                }, this.config.animDuration);
            });
        }, 200);

        this.state.currentView = viewId;
        this.updateSidebar(viewId);
    },

    // --- HELPERS ---
    _swapVisibility: function(outEl, inEl) {
        outEl.classList.add('hidden');
        outEl.style.display = 'none';
        inEl.classList.remove('hidden');
        inEl.style.display = 'block';
    },

    _activateTool: function(toolId) {
        // Hide all other workspaces
        document.querySelectorAll('.tool-workspace').forEach(el => {
            el.classList.add('hidden');
            el.style.display = 'none';
        });

        const target = document.getElementById(toolId);
        if(target) {
            target.classList.remove('hidden');
            target.style.display = 'block';
            
            // Animation Reset for Tool Content
            target.style.animation = 'none';
            target.offsetHeight; /* Trigger Reflow */
            target.style.animation = `slideUpFade 0.5s ${this.config.ease} forwards`;

            // Event & Title
            window.dispatchEvent(new CustomEvent('toolOpened', { detail: { toolId: toolId } }));
            const title = target.querySelector('h2')?.innerText || "Tool";
            document.title = `TM - ${title}`;
            
            // Scroll Top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    },

    // --- CORE UTILITIES ---
    setupRouter: function() {
        window.addEventListener('popstate', (e) => {
            const target = e.state?.viewId || 'home-page';
            this.navigateTo(target, false);
        });
    },

    setupShortcuts: function() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K = Search
            if((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const search = document.getElementById('search-bar');
                if(search) { 
                    search.focus(); 
                    // Scroll to top to see search bar
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
            // Esc = Close Tool / Go Home
            if(e.key === 'Escape') {
                if(this.state.currentView !== 'home-page') this.navigateTo('home-page');
            }
        });
    },

    updateSidebar: function(id) {
        document.querySelectorAll('.side-nav li, .mobile-nav .nav-item').forEach(li => {
            li.classList.remove('active');
            // Logic to match nav items with current view
            const action = li.getAttribute('onclick') || "";
            
            if(id === 'home-page') {
                if(action.includes('showHome') || action.includes("home-page")) li.classList.add('active');
            } else {
                if(action.includes(`'${id}'`) || action.includes(`"${id}"`)) li.classList.add('active');
            }
        });
    },

    toggleTheme: function() {
        document.body.classList.toggle('light-mode');
        const theme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
        localStorage.setItem('tm_theme', theme);
        
        // Dispatch event for canvas tools (like particles) to update colors
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    },

    loadTheme: function() {
        const theme = localStorage.getItem('tm_theme');
        if(theme === 'light') document.body.classList.add('light-mode');
    },

    setupSearch: function() {
        const bar = document.getElementById('search-bar');
        if(!bar) return;
        
        bar.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase().trim();
            const cards = document.querySelectorAll('.t-card');
            
            cards.forEach(card => {
                const title = card.querySelector('h4')?.innerText.toLowerCase() || "";
                const desc = card.querySelector('p')?.innerText.toLowerCase() || "";
                
                if(title.includes(term) || desc.includes(term)) {
                    card.style.display = 'flex';
                    // Highlight Animation
                    card.style.animation = 'fadeIn 0.3s ease';
                } else {
                    card.style.display = 'none';
                }
            });

            // Hide empty categories
            document.querySelectorAll('.category-block').forEach(cat => {
                const visibleTools = cat.querySelectorAll('.t-card[style="display: flex;"]');
                cat.style.display = visibleTools.length > 0 ? 'block' : 'none';
            });
        });
    },

    resetSearch: function() {
        const bar = document.getElementById('search-bar');
        if(bar) { 
            bar.value = ''; 
            bar.dispatchEvent(new Event('input')); // Trigger logic to restore all
        }
    },

    // --- ENHANCED TOAST NOTIFICATIONS ---
    showToast: function(msg, type='success') {
        let container = document.getElementById('toast-container');
        if(!container) { 
            container = document.createElement('div'); 
            container.id = 'toast-container'; 
            document.body.appendChild(container); 
        }

        const toast = document.createElement('div');
        
        // Icon selection
        let icon = 'check-line';
        if(type === 'error') icon = 'error-warning-line';
        if(type === 'info') icon = 'information-line';

        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<i class="ri-${icon}"></i> <span>${msg}</span>`;
        
        container.appendChild(toast);

        // Animate In
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0) scale(1)';
        });

        // Auto Remove
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px) scale(0.95)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },
    
    // --- GLOBAL LOADER ---
    loader: function(show, text = "PROCESSING...") {
        const el = document.getElementById('loading-overlay');
        if(!el) return;
        
        const txtEl = el.querySelector('p');
        if(txtEl) txtEl.innerText = text;

        if(show) {
            el.style.display = 'flex';
            // Slight delay to allow display:flex to apply before opacity
            requestAnimationFrame(() => el.style.opacity = '1');
        } else {
            el.style.opacity = '0';
            setTimeout(() => el.style.display = 'none', 400);
        }
    }
};

// --- GLOBAL BINDINGS ---
window.App = App;
window.showHome = () => App.navigateTo('home-page');
window.openTool = (id) => App.navigateTo(id);
window.toggleTheme = () => App.toggleTheme();
window.showToast = (m, t) => App.showToast(m, t);
window.loader = (s, t) => App.loader(s, t);

// Init
document.addEventListener('DOMContentLoaded', () => App.init());
