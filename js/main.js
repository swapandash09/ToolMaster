// ==========================================
// ⚡ TOOLMASTER TITANIUM V51 - QUANTUM CORE (OPTIMIZED)
// ==========================================

const App = {
    version: 'V51 Quantum',
    config: {
        animDuration: 300, // Faster transitions (ms)
        ease: 'cubic-bezier(0.2, 0.8, 0.2, 1)'
    },
    state: {
        currentView: 'home-page',
        isAnimating: false,
        historyStack: [],
        theme: localStorage.getItem('tm_theme') || 'dark'
    },
    ui: {}, // DOM Cache

    init: function() {
        console.log(`%c Titanium ${this.version} [GPU Accelerated] `, "background: #6366f1; color: white; border-radius: 4px; padding: 4px;");
        
        // 1. Cache Critical Elements
        this.cacheDOM();
        
        // 2. Setup Core
        this.loadTheme();
        this.setupSearch();
        this.setupRouter();
        this.setupShortcuts();
        
        // 3. Init Integrated Tools
        if(document.getElementById('generated-pass')) window.generatePass();

        // 4. Launch Sequence
        window.addEventListener('load', () => {
            // Remove Loader
            if(this.ui.loader) {
                requestAnimationFrame(() => {
                    this.ui.loader.style.opacity = '0';
                    setTimeout(() => this.ui.loader.style.display = 'none', 400);
                });
            }
            
            // Route Handling
            const hash = window.location.hash.substring(1);
            const target = (hash && document.getElementById(hash + '-tool')) ? hash + '-tool' : 'home-page';
            this.navigateTo(target, false, true);
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

    // --- 🚀 QUANTUM NAVIGATION ENGINE (GPU ACCELERATED) ---
    navigateTo: function(viewId, addToHistory = true, instant = false) {
        if (!this.ui.home || !this.ui.toolsContainer) return;
        if (this.state.currentView === viewId || this.state.isAnimating) return;

        // Lock Animation
        if(!instant) this.state.isAnimating = true;

        // History Management
        if (addToHistory) {
            const slug = viewId === 'home-page' ? '' : `#${viewId.replace('-tool', '')}`;
            history.pushState({ viewId }, "", slug || window.location.pathname);
        }

        const isGoingHome = viewId === 'home-page';
        const outgoing = isGoingHome ? this.ui.toolsContainer : this.ui.home;
        const incoming = isGoingHome ? this.ui.home : this.ui.toolsContainer;

        // Cleanup Logic
        if (isGoingHome) {
            window.dispatchEvent(new CustomEvent('toolClosed', { detail: { toolId: this.state.currentView } }));
            this.resetSearch();
            document.title = "ToolMaster - Dashboard";
        }

        // --- INSTANT MODE ---
        if (instant) {
            this._swapVisibility(outgoing, incoming);
            if(!isGoingHome) this._activateTool(viewId);
            this.updateSidebar(viewId);
            this.state.currentView = viewId;
            this.state.isAnimating = false;
            return;
        }

        // --- ANIMATED MODE (GPU) ---
        // 1. Prepare Incoming
        if(!isGoingHome) this._activateTool(viewId);
        incoming.style.display = 'block';
        incoming.style.opacity = '0';
        // use translate3d to force GPU layer promotion
        incoming.style.transform = isGoingHome ? 'scale(0.96) translate3d(0,0,0)' : 'translate3d(0, 20px, 0)';
        
        // 2. Animate Out
        requestAnimationFrame(() => {
            outgoing.style.transition = `opacity 0.2s ease, transform 0.2s ease`;
            outgoing.style.opacity = '0';
            outgoing.style.transform = isGoingHome ? 'translate3d(0, 20px, 0)' : 'scale(0.96) translate3d(0,0,0)';
        });

        // 3. Switch & Animate In
        setTimeout(() => {
            outgoing.style.display = 'none';
            outgoing.style.transform = 'none'; // Reset
            outgoing.classList.add('hidden');

            requestAnimationFrame(() => {
                incoming.classList.remove('hidden');
                incoming.style.transition = `opacity 0.3s ${this.config.ease}, transform 0.3s ${this.config.ease}`;
                incoming.style.opacity = '1';
                incoming.style.transform = 'translate3d(0,0,0)';
                
                // 4. Cleanup
                setTimeout(() => {
                    this.state.isAnimating = false;
                    incoming.style.transition = '';
                    incoming.style.transform = '';
                    incoming.style.opacity = '';
                }, this.config.animDuration);
            });
        }, 200); // Wait for out-animation

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
        // Efficient DOM query: only hide visible workspaces
        const visibleWS = document.querySelectorAll('.tool-workspace:not(.hidden)');
        visibleWS.forEach(el => {
            el.classList.add('hidden');
            el.style.display = 'none';
        });

        const target = document.getElementById(toolId);
        if(target) {
            target.classList.remove('hidden');
            target.style.display = 'block';
            
            // Trigger Reflow for CSS Animation Restart
            target.style.animation = 'none';
            void target.offsetHeight; 
            target.style.animation = `slideUpFade 0.4s ${this.config.ease} forwards`;

            // Setup Tool Context
            window.dispatchEvent(new CustomEvent('toolOpened', { detail: { toolId: toolId } }));
            const title = target.querySelector('h2')?.innerText || "Tool";
            document.title = `TM - ${title}`;
            
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
            // Ctrl+K for Search
            if((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if(this.ui.searchBar) { 
                    this.ui.searchBar.focus(); 
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
            // Esc for Home
            if(e.key === 'Escape' && this.state.currentView !== 'home-page') {
                this.navigateTo('home-page');
            }
        });
    },

    updateSidebar: function(id) {
        // Optimized selector to avoid unnecessary DOM traversal
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

    // --- DEBOUNCED SEARCH ---
    setupSearch: function() {
        if(!this.ui.searchBar) return;
        
        // Debounce Function to prevent lag while typing
        const debounce = (func, wait) => {
            let timeout;
            return function(...args) {
                const context = this;
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(context, args), wait);
            };
        };

        this.ui.searchBar.addEventListener('input', debounce((e) => {
            const term = e.target.value.toLowerCase().trim();
            const cards = document.querySelectorAll('.t-card'); // Get fresh list
            
            // Batch style updates
            requestAnimationFrame(() => {
                cards.forEach(card => {
                    const title = card.querySelector('h4')?.innerText.toLowerCase() || "";
                    const desc = card.querySelector('p')?.innerText.toLowerCase() || "";
                    
                    if(title.includes(term) || desc.includes(term)) {
                        card.style.display = 'flex';
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
        }, 150)); // 150ms delay
    },

    resetSearch: function() {
        if(this.ui.searchBar) { 
            this.ui.searchBar.value = ''; 
            this.ui.searchBar.dispatchEvent(new Event('input'));
        }
    },

    // --- DOM CACHED TOAST ---
    showToast: function(msg, type='success') {
        if(!this.ui.toastBox) { 
            this.ui.toastBox = document.createElement('div'); 
            this.ui.toastBox.id = 'toast-container'; 
            document.body.appendChild(this.ui.toastBox); 
        }

        const toast = document.createElement('div');
        let icon = type === 'error' ? 'error-warning-line' : (type === 'info' ? 'information-line' : 'check-line');

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

// --- GLOBAL BINDINGS ---
window.App = App;
window.showHome = () => App.navigateTo('home-page');
window.openTool = (id) => App.navigateTo(id);
window.toggleTheme = () => App.toggleTheme();
window.showToast = (m, t) => App.showToast(m, t);
window.loader = (s, t) => App.loader(s, t);


// ==========================================
// 🛠️ INTEGRATED HELPERS (Resume, Eraser, Security)
// ==========================================

// 1. RESUME HELPER
const originalUpdate = window.updateResume || function(){};
window.updateResume = function() {
    if(typeof originalUpdate === 'function') originalUpdate();
    
    // Resume Sync Logic
    const pTitle = document.getElementById('in-proj-title')?.value;
    const pDesc = document.getElementById('in-proj-desc')?.value;
    const pSec = document.getElementById('res-proj-section');
    if(pSec && (pTitle || pDesc)) {
        pSec.style.display = 'block';
        const tEl = document.getElementById('res-proj-title'); if(tEl) tEl.innerText = pTitle;
        const dEl = document.getElementById('res-proj-desc'); if(dEl) dEl.innerText = pDesc;
    } else if (pSec) { pSec.style.display = 'none'; }

    const langs = document.getElementById('in-languages')?.value;
    const lSec = document.getElementById('res-lang-section');
    if(lSec && langs) {
        lSec.style.display = 'block';
        const lEl = document.getElementById('res-languages'); if(lEl) lEl.innerText = langs;
    } else if (lSec) { lSec.style.display = 'none'; }
};

// 2. MAGIC ERASER BACKGROUND HELPER
window.changeBg = function(el, color) {
    document.querySelectorAll('.bg-dot').forEach(d => d.classList.remove('active'));
    el.classList.add('active');
    const img = document.getElementById('bg-result-img');
    if(img) img.style.background = color;
};

// 3. SECURITY TOOL (PASSWORD GENERATOR)
window.generatePass = () => {
    const display = document.getElementById('generated-pass');
    if(!display) return;

    const length = document.getElementById('pass-len') ? parseInt(document.getElementById('pass-len').value) : 16;
    const useUpper = document.getElementById('pass-upper') ? document.getElementById('pass-upper').checked : true;
    const useNum = document.getElementById('pass-num') ? document.getElementById('pass-num').checked : true;
    const useSym = document.getElementById('pass-sym') ? document.getElementById('pass-sym').checked : true;

    // Cryptographically Safe Charset
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

    // Matrix Animation
    let iteration = 0;
    const originalText = password;
    const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*";
    
    if(display.dataset.interval) clearInterval(display.dataset.interval);

    const interval = setInterval(() => {
        display.innerText = display.innerText
            .split("").map((letter, index) => {
                if (index < iteration) return originalText[index];
                return randomChars[Math.floor(Math.random() * 26)];
            }).join("");

        if (iteration >= length) {
            clearInterval(interval);
            display.innerText = originalText; 
            calculateStrength(originalText);
        }
        iteration += 1 / 2; 
    }, 30);
    
    display.dataset.interval = interval;
    const lenLabel = document.getElementById('pass-len-val');
    if(lenLabel) lenLabel.innerText = length;
};

function calculateStrength(password) {
    let strength = 0;
    const meter = document.getElementById('pass-strength-bar');
    const label = document.getElementById('pass-strength-text');
    if(!meter) return;

    if (password.length > 8) strength += 1;
    if (password.length > 12) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];
    const labels = ['Weak', 'Moderate', 'Strong', 'Quantum Secure'];
    const idx = Math.min(Math.max(strength - 1, 0), 3);
    const width = Math.min((strength / 5) * 100, 100);

    meter.style.width = `${width}%`;
    meter.style.background = colors[idx];
    if(label) {
        label.innerText = labels[idx];
        label.style.color = colors[idx];
    }
}

window.copyPass = () => {
    const display = document.getElementById('generated-pass');
    if(!display || display.innerText.includes('GENERATING')) return;
    navigator.clipboard.writeText(display.innerText).then(() => {
        App.showToast("Password Copied! 🔐", "success");
        display.style.color = "#10b981"; 
        setTimeout(() => { display.style.color = ""; }, 300);
    });
};

// Init App
document.addEventListener('DOMContentLoaded', () => App.init());
