// ==========================================
// 💧 TOOLMASTER TITANIUM V46 - LIQUID CORE
// ==========================================

const App = {
    version: 'V46 Liquid',
    
    init: function() {
        console.log(`%c ${this.version} %c Smooth System Online `, 
            'background:#6366f1; color:white; border-radius:4px;', 'color:#6366f1; font-weight:bold;');
        
        this.loadTheme();
        this.setupSearch();
        this.setupRouter();
        
        // 🚀 SMOOTH LAUNCH
        window.addEventListener('load', () => {
            const loader = document.getElementById('loading-overlay');
            if(loader) {
                loader.style.opacity = '0';
                setTimeout(() => loader.style.display = 'none', 600);
            }
            this.navigateTo('home-page', false, true); // Instant load
        });
    },

    // --- 1. LIQUID NAVIGATION ENGINE ---
    navigateTo: function(viewId, addToHistory = true, instant = false) {
        const home = document.getElementById('home-page');
        const toolsContainer = document.getElementById('tool-container');
        
        if(!home || !toolsContainer) return;

        // 1. Lifecycle Cleanup
        if(this.currentView && this.currentView !== 'home-page') {
            window.dispatchEvent(new CustomEvent('toolClosed'));
        }

        // 2. History
        if (addToHistory) {
            history.pushState({ viewId }, "", `#${viewId.replace('-tool', '')}`);
        }
        this.currentView = viewId;

        const isGoingHome = viewId === 'home-page' || viewId === '';

        // --- INSTANT MODE (Initial Load) ---
        if(instant) {
            if(isGoingHome) {
                this._setVisible(home);
                this._setHidden(toolsContainer);
            } else {
                const tool = document.getElementById(viewId);
                if(tool) {
                    this._setHidden(home);
                    this._setVisible(toolsContainer);
                    this._showTool(viewId);
                }
            }
            return;
        }

        // --- ANIMATED MODE ---
        if (isGoingHome) {
            // Tools Exit -> Home Enter
            this._animateSwitch(toolsContainer, home, () => {
                this.resetSearch();
                document.title = "ToolMaster - Dashboard";
                this.updateSidebar('home');
            });
        } else {
            const toolEl = document.getElementById(viewId);
            if (!toolEl) return this.navigateTo('home-page', false);

            // Home Exit -> Tools Enter
            this._animateSwitch(home, toolsContainer, () => {
                // Hide other tools immediately
                document.querySelectorAll('.tool-workspace').forEach(el => el.classList.add('hidden'));
                
                // Show specific tool
                toolEl.classList.remove('hidden');
                
                // Trigger Tool Load Animation
                toolEl.style.opacity = '0';
                toolEl.style.transform = 'translateY(20px)';
                requestAnimationFrame(() => {
                    toolEl.style.transition = 'all 0.4s ease';
                    toolEl.style.opacity = '1';
                    toolEl.style.transform = 'translateY(0)';
                });

                window.dispatchEvent(new CustomEvent('toolOpened', { detail: { toolId: viewId } }));
                
                const title = toolEl.querySelector('h2')?.innerText || "Tool";
                document.title = `ToolMaster - ${title}`;
                this.updateSidebar(viewId);
            });
        }
    },

    // --- ANIMATION HELPER (The Magic) ---
    _animateSwitch: function(elementOut, elementIn, callback) {
        // 1. Lock Interaction
        document.body.style.pointerEvents = 'none';

        // 2. Animate OUT
        elementOut.classList.remove('view-enter');
        elementOut.classList.add('view-exit');

        setTimeout(() => {
            // 3. Hide Old
            elementOut.classList.add('force-gone'); // display: none
            
            // 4. Prepare New
            elementIn.classList.remove('force-gone'); // display: block
            elementIn.classList.add('view-exit'); // Start slightly off-screen
            
            // Run Logic (Show specific tool etc.)
            if(callback) callback();

            // 5. Animate IN (Double RAF for browser paint)
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    elementIn.classList.remove('view-exit');
                    elementIn.classList.add('view-enter');
                    
                    // Unlock Interaction
                    setTimeout(() => {
                        document.body.style.pointerEvents = 'all';
                    }, 400);
                });
            });

        }, 300); // Wait for exit animation (300ms)
    },

    // Simple Helpers
    _setVisible: function(el) {
        el.classList.remove('force-gone', 'hidden', 'view-exit');
        el.classList.add('view-enter');
        el.style.display = 'block';
    },
    _setHidden: function(el) {
        el.classList.add('force-gone', 'view-exit');
        el.classList.remove('view-enter');
        el.style.display = 'none';
    },
    _showTool: function(id) {
        document.querySelectorAll('.tool-workspace').forEach(el => el.classList.add('hidden'));
        const t = document.getElementById(id);
        if(t) t.classList.remove('hidden');
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
