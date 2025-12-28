// ==========================================
// ⚡ TOOLMASTER TITANIUM V47 - PERFORMANCE ENGINE
// ==========================================

const App = {
    version: 'V47 Fast',
    config: {
        animTime: 300 // Super Fast 0.3s
    },
    state: {
        currentView: 'home-page'
    },
    
    init: function() {
        console.log("Titanium V47: Optimized Mode");
        this.loadTheme();
        this.setupSearch();
        this.setupRouter();
        
        // Fast Launch
        window.addEventListener('load', () => {
            const loader = document.getElementById('loading-overlay');
            if(loader) {
                loader.style.opacity = '0';
                setTimeout(() => loader.style.display = 'none', 300);
            }
            this.navigateTo('home-page', false, true); 
        });
    },

    // --- FAST NAVIGATION ---
    navigateTo: function(viewId, addToHistory = true, instant = false) {
        const home = document.getElementById('home-page');
        const toolsContainer = document.getElementById('tool-container');
        
        if(!home || !toolsContainer) return;
        if(viewId === this.state.currentView && !instant) return;

        if (addToHistory) {
            history.pushState({ viewId }, "", `#${viewId.replace('-tool', '')}`);
        }

        // Cleanup
        if(this.state.currentView !== 'home-page') {
            window.dispatchEvent(new CustomEvent('toolClosed', { detail: { toolId: this.state.currentView } }));
        }

        const prevView = this.state.currentView;
        this.state.currentView = viewId;
        const isGoingHome = viewId === 'home-page';

        // INSTANT MODE
        if(instant) {
            if(isGoingHome) {
                this._show(home); this._hide(toolsContainer);
            } else {
                this._hide(home); this._show(toolsContainer);
                this._activateTool(viewId);
            }
            this.updateSidebar(viewId);
            return;
        }

        // ANIMATED MODE (Simplified)
        const outEl = isGoingHome ? toolsContainer : home;
        const inEl = isGoingHome ? home : toolsContainer;

        // 1. Hide Old
        outEl.classList.add('view-exit');
        outEl.classList.remove('view-enter');
        outEl.style.opacity = '0';

        setTimeout(() => {
            this._hide(outEl);
            outEl.classList.remove('view-exit');
            outEl.style.opacity = '1'; // Reset for next time

            // 2. Show New
            this._show(inEl);
            if(!isGoingHome) this._activateTool(viewId);
            else {
                this.resetSearch();
                document.title = "ToolMaster - Dashboard";
            }

            inEl.classList.add('view-enter');
            // Force Reflow
            void inEl.offsetWidth; 
            inEl.style.opacity = '1';
            
            // Clean classes after anim
            setTimeout(() => {
                inEl.classList.remove('view-enter');
            }, this.config.animTime);

        }, 200); // Fast 200ms switch

        this.updateSidebar(viewId);
    },

    // --- HELPERS ---
    _activateTool: function(toolId) {
        document.querySelectorAll('.tool-workspace').forEach(el => {
            el.classList.add('hidden');
            el.style.display = 'none';
        });

        const target = document.getElementById(toolId);
        if(target) {
            target.classList.remove('hidden');
            target.style.display = 'block';
            window.dispatchEvent(new CustomEvent('toolOpened', { detail: { toolId: toolId } }));
            
            const title = target.querySelector('h2')?.innerText || "Tool";
            document.title = `ToolMaster - ${title}`;
        }
        window.scrollTo(0, 0);
    },

    _show: function(el) { el.classList.remove('hidden', 'force-gone'); el.style.display = 'block'; },
    _hide: function(el) { el.classList.add('hidden', 'force-gone'); el.style.display = 'none'; },

    // --- OTHER CORE FUNCTIONS ---
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
        // Optimized Filter loop
        const cards = document.getElementsByClassName('t-card');
        for(let i=0; i<cards.length; i++) {
            const card = cards[i];
            const txt = card.innerText.toLowerCase();
            card.style.display = txt.includes(term) ? 'flex' : 'none';
        }
        // Category hiding logic remains same
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
        setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2500);
    }
};

window.App = App;
window.showHome = () => App.navigateTo('home-page');
window.openTool = (id) => App.navigateTo(id);
window.toggleTheme = () => App.toggleTheme();
window.showToast = (m,t) => App.showToast(m,t);
window.loader = (show) => { const l = document.getElementById('loading-overlay'); if(l) l.style.display = show ? 'flex' : 'none'; };

document.addEventListener('DOMContentLoaded', () => App.init());
