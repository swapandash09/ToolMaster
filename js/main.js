// ==========================================
// 💧 TOOLMASTER TITANIUM V46 - LIQUID ENGINE (FIXED)
// ==========================================

const App = {
    version: 'V46 Liquid Stable',
    config: {
        animTime: 400 // Matches CSS transition 0.4s
    },
    state: {
        currentView: 'home-page',
        debounce: null
    },
    
    init: function() {
        console.log(`%c ${this.version} %c Systems Nominal `, 
            'background:#6366f1; color:white; border-radius:4px;', 'color:#6366f1; font-weight:bold;');
        
        this.loadTheme();
        this.setupSearch();
        this.setupRouter();
        
        // 🚀 SAFE LAUNCH SEQUENCE
        window.addEventListener('load', () => {
            const loader = document.getElementById('loading-overlay');
            if(loader) {
                loader.style.opacity = '0';
                setTimeout(() => loader.style.display = 'none', 600);
            }
            // Force clean entry
            this.navigateTo('home-page', false, true); 
        });
    },

    // --- 1. INTELLIGENT NAVIGATION ENGINE ---
    navigateTo: function(viewId, addToHistory = true, instant = false) {
        const home = document.getElementById('home-page');
        const toolsContainer = document.getElementById('tool-container');
        
        if(!home || !toolsContainer) return;
        if(viewId === this.state.currentView && !instant) return;

        // 1. Manage History
        if (addToHistory) {
            history.pushState({ viewId }, "", `#${viewId.replace('-tool', '')}`);
        }

        // 2. Lifecycle Cleanup (Stop Cameras, etc.)
        if(this.state.currentView !== 'home-page') {
            window.dispatchEvent(new CustomEvent('toolClosed', { detail: { toolId: this.state.currentView } }));
        }

        const prevView = this.state.currentView;
        this.state.currentView = viewId;
        const isGoingHome = viewId === 'home-page';
        const wasHome = prevView === 'home-page' || prevView === '';

        // --- INSTANT MODE (Initial Load) ---
        if(instant) {
            if(isGoingHome) {
                this._showEl(home); this._hideEl(toolsContainer);
            } else {
                this._hideEl(home); this._showEl(toolsContainer);
                this._activateTool(viewId);
            }
            this.updateSidebar(viewId);
            return;
        }

        // --- ANIMATED MODE ---
        
        // SCENARIO A: Tool -> Tool (Direct Switch)
        if (!isGoingHome && !wasHome) {
            const oldTool = document.getElementById(prevView);
            const newTool = document.getElementById(viewId);
            
            // Cross-fade tools directly
            this._animateSwitch(oldTool, newTool, () => {
                this._activateTool(viewId, true); // true = skip hiding others (handled by anim)
            });
        }
        
        // SCENARIO B: Home <-> Tool (Major Switch)
        else {
            const outEl = isGoingHome ? toolsContainer : home;
            const inEl = isGoingHome ? home : toolsContainer;

            this._animateSwitch(outEl, inEl, () => {
                if(isGoingHome) {
                    this.resetSearch();
                    document.title = "ToolMaster - Dashboard";
                } else {
                    this._activateTool(viewId);
                }
            });
        }
        
        this.updateSidebar(viewId);
    },

    // --- HELPER: TOOL ACTIVATOR ---
    _activateTool: function(toolId, skipHide = false) {
        // Ensure container is visible
        const container = document.getElementById('tool-container');
        container.classList.remove('hidden', 'force-gone');
        container.style.display = 'block';
        container.style.opacity = '1';

        // Manage Workspaces
        if(!skipHide) {
            document.querySelectorAll('.tool-workspace').forEach(el => {
                el.classList.add('hidden');
                el.style.display = 'none';
            });
        }

        // Show Target
        const target = document.getElementById(toolId);
        if(target) {
            target.classList.remove('hidden');
            target.style.display = 'block';
            
            // Trigger internal layout resize (fixes Resume/Canvas size)
            window.dispatchEvent(new CustomEvent('toolOpened', { detail: { toolId: toolId } }));
            
            const title = target.querySelector('h2')?.innerText || "Tool";
            document.title = `ToolMaster - ${title}`;
        }
        window.scrollTo(0, 0);
    },

    // --- ANIMATION CORE (THE LIQUID EFFECT) ---
    _animateSwitch: function(elementOut, elementIn, callback) {
        if(!elementOut || !elementIn) { if(callback) callback(); return; }

        // 1. Lock UI
        document.body.style.pointerEvents = 'none';

        // 2. Animate OUT
        elementOut.classList.remove('view-enter');
        elementOut.classList.add('view-exit');

        // 3. Wait for CSS Transition (Synced)
        setTimeout(() => {
            // Hide Old
            this._hideEl(elementOut);
            elementOut.classList.remove('view-exit'); // Reset class

            // Prepare New (Start Hidden)
            this._showEl(elementIn); // Applies display:block
            elementIn.classList.add('view-exit'); // Move off-screen
            
            // Run Logic
            if(callback) callback();

            // 4. Animate IN (Double RAF for Browser Paint)
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    elementIn.classList.remove('view-exit');
                    elementIn.classList.add('view-enter');
                    
                    // Unlock UI
                    setTimeout(() => {
                        document.body.style.pointerEvents = 'all';
                    }, this.config.animTime);
                });
            });

        }, this.config.animTime - 50); // Slight overlap for speed
    },

    // Simple helpers to enforce CSS states
    _showEl: function(el) {
        if(!el) return;
        el.classList.remove('hidden', 'force-gone');
        el.style.display = 'block';
    },
    _hideEl: function(el) {
        if(!el) return;
        el.classList.add('hidden', 'force-gone');
        el.style.display = 'none';
    },

    // --- 2. ROUTER & SIDEBAR ---
    setupRouter: function() {
        window.addEventListener('popstate', (e) => {
            this.navigateTo(e.state?.viewId || 'home-page', false);
        });
        const hash = window.location.hash.substring(1);
        if(hash && document.getElementById(hash + '-tool')) {
            this.navigateTo(hash + '-tool', false, true);
        }
    },

    updateSidebar: function(id) {
        document.querySelectorAll('.side-nav li, .mobile-nav .nav-item').forEach(li => {
            li.classList.remove('active');
            const action = li.getAttribute('onclick') || li.getAttribute('href') || "";
            if((id === 'home-page' && (action.includes('showHome') || action === '#')) || 
               (id !== 'home-page' && action.includes(id))) {
                li.classList.add('active');
            }
        });
    },

    // --- 3. UTILS ---
    toggleTheme: function() {
        document.body.classList.toggle('light-mode');
        localStorage.setItem('tm_theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
        window.dispatchEvent(new Event('themeChanged'));
    },
    loadTheme: function() {
        if(localStorage.getItem('tm_theme') === 'light') document.body.classList.add('light-mode');
    },
    setupSearch: function() {
        const bar = document.getElementById('search-bar');
        if(bar) bar.addEventListener('input', (e) => this.filterTools(e.target.value.toLowerCase()));
    },
    resetSearch: function() {
        const bar = document.getElementById('search-bar');
        if(bar) { bar.value = ''; this.filterTools(''); }
    },
    filterTools: function(term) {
        document.querySelectorAll('.t-card').forEach(card => {
            card.style.display = card.innerText.toLowerCase().includes(term) ? 'flex' : 'none';
        });
        document.querySelectorAll('.category-block').forEach(cat => {
            cat.style.display = cat.querySelectorAll('.t-card[style="display: flex;"]').length ? 'block' : 'none';
        });
    },
    setupShortcuts: function() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.navigateTo('home-page');
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.navigateTo('home-page');
                setTimeout(() => document.getElementById('search-bar')?.focus(), 100);
            }
        });
    },
    showToast: function(msg, type='success') {
        let box = document.getElementById('toast-container');
        if(!box) { box = document.createElement('div'); box.id = 'toast-container'; document.body.appendChild(box); }
        const t = document.createElement('div'); t.className = `toast toast-${type}`; t.innerHTML = `<span>${msg}</span>`;
        box.appendChild(t);
        requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translateY(0)'; });
        setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
    }
};

// EXPORTS
window.App = App;
window.showHome = () => App.navigateTo('home-page');
window.openTool = (id) => App.navigateTo(id);
window.toggleTheme = () => App.toggleTheme();
window.showToast = (m,t) => App.showToast(m,t);
window.loader = (show) => { const l = document.getElementById('loading-overlay'); if(l) l.style.display = show ? 'flex' : 'none'; };

document.addEventListener('DOMContentLoaded', () => App.init());
