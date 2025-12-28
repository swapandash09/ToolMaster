// ==========================================
// ⚡ TOOLMASTER TITANIUM V58 - ULTIMATE CORE
// ==========================================

const App = {
    version: 'V58 Ultimate',
    config: {
        animDuration: 300,
        ease: 'cubic-bezier(0.2, 0.8, 0.2, 1)'
    },
    state: {
        currentView: 'home-page',
        isAnimating: false,
        theme: localStorage.getItem('tm_theme') || 'dark'
    },
    ui: {}, // DOM Cache

    init: function() {
        console.log(`%c Titanium ${this.version} [System Online] `, "background: #6366f1; color: white; padding: 4px; border-radius: 4px;");
        
        this.cacheDOM();
        this.loadTheme();
        this.setupSearch();
        this.setupRouter();
        this.setupShortcuts();
        this.setupEffects();

        // Initial Tool Check
        if(document.getElementById('generated-pass')) window.generatePass();

        // Remove Loader
        window.addEventListener('load', () => {
            if(this.ui.loader) {
                requestAnimationFrame(() => {
                    this.ui.loader.style.opacity = '0';
                    setTimeout(() => this.ui.loader.style.display = 'none', 500);
                });
            }
            // Hash Navigation (Direct Link Support)
            const hash = window.location.hash.substring(1);
            if(hash && document.getElementById(hash + '-tool')) {
                this.navigateTo(hash + '-tool', false, true);
            }
        });
    },

    cacheDOM: function() {
        this.ui = {
            home: document.getElementById('home-page'),
            toolsContainer: document.getElementById('tool-container'),
            searchBar: document.getElementById('search-bar'),
            loader: document.getElementById('loading-overlay'),
            toastBox: document.getElementById('toast-container')
        };
    },

    // --- 🚀 ZERO-LAG NAVIGATION ENGINE ---
    navigateTo: function(viewId, addToHistory = true, instant = false) {
        if (!this.ui.home || !this.ui.toolsContainer) return;
        if (this.state.currentView === viewId || this.state.isAnimating) return;

        if(!instant) this.state.isAnimating = true;

        // URL History
        if (addToHistory) {
            const slug = viewId === 'home-page' ? '' : `#${viewId.replace('-tool', '')}`;
            history.pushState({ viewId }, "", slug || window.location.pathname);
        }

        const isGoingHome = viewId === 'home-page';
        const outgoing = isGoingHome ? this.ui.toolsContainer : this.ui.home;
        const incoming = isGoingHome ? this.ui.home : this.ui.toolsContainer;

        // Tool Cleanup
        if (isGoingHome) {
            window.dispatchEvent(new CustomEvent('toolClosed', { detail: { toolId: this.state.currentView } }));
            this.resetSearch();
            document.title = "Titanium - Dashboard";
        }

        // --- ANIMATION LOGIC ---
        // 1. Prepare Incoming
        if(!isGoingHome) this._activateTool(viewId);
        
        if (instant) {
            this._swapVisibility(outgoing, incoming);
            this.updateSidebar(viewId);
            this.state.currentView = viewId;
            this.state.isAnimating = false;
            return;
        }

        // GPU Accelerate
        incoming.style.display = 'block';
        incoming.style.opacity = '0';
        incoming.style.transform = isGoingHome ? 'scale(0.95)' : 'translateY(15px)';
        
        requestAnimationFrame(() => {
            // Out Animation
            outgoing.style.transition = `all 0.2s ease`;
            outgoing.style.opacity = '0';
            outgoing.style.transform = isGoingHome ? 'translateY(15px)' : 'scale(0.95)';
            
            // Switch
            setTimeout(() => {
                outgoing.style.display = 'none';
                outgoing.classList.add('hidden');
                outgoing.style.transform = 'none'; // Reset transform

                // In Animation
                requestAnimationFrame(() => {
                    incoming.classList.remove('hidden');
                    incoming.style.transition = `all 0.3s ${this.config.ease}`;
                    incoming.style.opacity = '1';
                    incoming.style.transform = 'none';
                    
                    setTimeout(() => {
                        this.state.isAnimating = false;
                        incoming.style.transition = ''; // Clean inline styles
                    }, this.config.animDuration);
                });
            }, 200);
        });

        this.state.currentView = viewId;
        this.updateSidebar(viewId);
    },

    _swapVisibility: function(outEl, inEl) {
        outEl.classList.add('hidden');
        outEl.style.display = 'none';
        inEl.classList.remove('hidden');
        inEl.style.display = 'block';
    },

    _activateTool: function(toolId) {
        // Hide all workspaces first
        document.querySelectorAll('.tool-workspace').forEach(el => {
            el.classList.add('hidden');
            el.style.display = 'none';
        });

        const target = document.getElementById(toolId);
        if(target) {
            target.classList.remove('hidden');
            target.style.display = 'block';
            
            // Broadcast Event (For Tools to Self-Init)
            window.dispatchEvent(new CustomEvent('toolOpened', { detail: { toolId: toolId } }));
            
            const title = target.querySelector('h2')?.innerText || "Tool";
            document.title = `TM - ${title}`;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    },

    // --- INTERACTIONS ---
    setupEffects: function() {
        // Ripple Effect on Clicks
        document.addEventListener('click', (e) => {
            const target = e.target.closest('.glow-btn, .t-card');
            if (target && !this.state.isAnimating) {
                // Visual feedback only, logic handled by onclick
            }
        });
    },

    setupRouter: function() {
        window.addEventListener('popstate', (e) => {
            const target = e.state?.viewId || 'home-page';
            this.navigateTo(target, false);
        });
    },

    setupShortcuts: function() {
        document.addEventListener('keydown', (e) => {
            if((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.ui.searchBar?.focus();
            }
            if(e.key === 'Escape' && this.state.currentView !== 'home-page') {
                this.navigateTo('home-page');
            }
        });
    },

    updateSidebar: function(id) {
        const navItems = document.querySelectorAll('.side-nav li, .mobile-nav .nav-item');
        navItems.forEach(li => {
            li.classList.remove('active');
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
        this.state.theme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
        localStorage.setItem('tm_theme', this.state.theme);
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: this.state.theme } }));
    },

    loadTheme: function() {
        if(this.state.theme === 'light') document.body.classList.add('light-mode');
    },

    setupSearch: function() {
        if(!this.ui.searchBar) return;
        
        // Debounce to prevent lag while typing
        const debounce = (func, wait) => {
            let timeout;
            return function(...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), wait);
            };
        };

        this.ui.searchBar.addEventListener('input', debounce((e) => {
            const term = e.target.value.toLowerCase().trim();
            const cards = document.querySelectorAll('.t-card');
            
            requestAnimationFrame(() => {
                cards.forEach(card => {
                    const title = card.querySelector('h4')?.innerText.toLowerCase() || "";
                    const desc = card.querySelector('.tc-info p')?.innerText.toLowerCase() || "";
                    
                    if(title.includes(term) || desc.includes(term)) {
                        card.style.display = 'flex';
                        card.style.animation = 'fadeIn 0.3s ease';
                    } else {
                        card.style.display = 'none';
                    }
                });
                
                // Auto-hide empty categories
                document.querySelectorAll('.category-block').forEach(cat => {
                    const visible = cat.querySelectorAll('.t-card[style="display: flex;"]');
                    cat.style.display = visible.length > 0 ? 'block' : 'none';
                });
            });
        }, 100));
    },

    resetSearch: function() {
        if(this.ui.searchBar) { 
            this.ui.searchBar.value = ''; 
            this.ui.searchBar.dispatchEvent(new Event('input'));
        }
    },

    showToast: function(msg, type='success') {
        if(!this.ui.toastBox) { 
            this.ui.toastBox = document.createElement('div'); 
            this.ui.toastBox.id = 'toast-container'; 
            document.body.appendChild(this.ui.toastBox); 
        }

        const toast = document.createElement('div');
        const icon = type === 'error' ? 'error-warning-line' : (type === 'info' ? 'information-line' : 'check-line');
        
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<i class="ri-${icon}"></i> <span>${msg}</span>`;
        this.ui.toastBox.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0) scale(1)';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px) scale(0.95)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },
    
    loader: function(show, text = "PROCESSING...") {
        if(!this.ui.loader) return;
        const txtEl = this.ui.loader.querySelector('p');
        if(txtEl) txtEl.innerText = text;

        if(show) {
            this.ui.loader.style.display = 'flex';
            requestAnimationFrame(() => this.ui.loader.style.opacity = '1');
        } else {
            this.ui.loader.style.opacity = '0';
            setTimeout(() => this.ui.loader.style.display = 'none', 400);
        }
    }
};

// --- GLOBAL EXPORTS ---
window.App = App;
window.showHome = () => App.navigateTo('home-page');
window.openTool = (id) => App.navigateTo(id);
window.toggleTheme = () => App.toggleTheme();
window.showToast = (m, t) => App.showToast(m, t);
window.loader = (s, t) => App.loader(s, t);

// --- INTEGRATED HELPERS (Optimized) ---

// 1. Resume Sync (Debounced)
let resumeTimeout;
window.updateResume = function() {
    clearTimeout(resumeTimeout);
    resumeTimeout = setTimeout(() => {
        // Broadcast for resume.js
        window.dispatchEvent(new CustomEvent('resumeUpdate'));
        
        // Fallback sync logic
        const pTitle = document.getElementById('in-proj-title')?.value;
        const pDesc = document.getElementById('in-proj-desc')?.value;
        const pSec = document.getElementById('res-proj-section');
        if(pSec) {
            if(pTitle || pDesc) {
                pSec.style.display = 'block';
                const pt = document.getElementById('res-proj-title'); if(pt) pt.innerText = pTitle;
                const pd = document.getElementById('res-proj-desc'); if(pd) pd.innerText = pDesc;
            } else { pSec.style.display = 'none'; }
        }
    }, 50); 
};

// 2. Magic Eraser Background Switcher
window.changeBg = function(el, color) {
    document.querySelectorAll('.bg-dot').forEach(d => d.classList.remove('active'));
    el.classList.add('active');
    const img = document.getElementById('bg-result-img');
    if(img) img.style.background = color;
};

// 3. Password Generator (V58)
window.generatePass = () => {
    const display = document.getElementById('generated-pass');
    if(!display) return;

    const length = parseInt(document.getElementById('pass-len')?.value || 16);
    const useUpper = document.getElementById('pass-upper')?.checked;
    const useNum = document.getElementById('pass-num')?.checked;
    const useSym = document.getElementById('pass-sym')?.checked;

    let charset = "abcdefghijklmnopqrstuvwxyz";
    if (useUpper) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (useNum) charset += "0123456789";
    if (useSym) charset += "!@#$%^&*()_+~`|}{[]:;?><,./-=";

    let password = "";
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
        password += charset[array[i] % charset.length];
    }

    display.innerText = password;
    
    // Strength Meter
    let strength = 0;
    if (length > 10) strength++;
    if (useUpper) strength++;
    if (useNum) strength++;
    if (useSym) strength++;
    const width = (strength / 4) * 100;
    const bar = document.getElementById('pass-strength-bar');
    if(bar) {
        bar.style.width = `${width}%`;
        bar.style.background = width < 50 ? '#ef4444' : (width < 80 ? '#f59e0b' : '#10b981');
    }
    
    // Update Label
    const lbl = document.getElementById('pass-len-val');
    if(lbl) lbl.innerText = length;
};

window.copyPass = () => {
    const display = document.getElementById('generated-pass');
    if(!display) return;
    navigator.clipboard.writeText(display.innerText);
    App.showToast("Copied to clipboard!", "success");
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => App.init());
