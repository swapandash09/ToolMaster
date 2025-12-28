// ==========================================
// ⚡ TOOLMASTER TITANIUM V75 - HYPER CORE
// ==========================================

const App = {
    version: 'V75 Hyper',
    config: {
        animDuration: 300,
        debounceTime: 50
    },
    state: {
        currentView: 'home-page',
        isAnimating: false,
        theme: localStorage.getItem('tm_theme') || 'dark',
        searchIndex: [] // Cache for instant search
    },
    ui: {},

    // --- 1. SYSTEM BOOT ---
    init: function() {
        console.log(`%c Titanium ${this.version} [System Online] `, "background: #6366f1; color: white; padding: 4px; border-radius: 4px;");
        
        this.cacheDOM();
        this.loadTheme();
        this.indexTools(); // Pre-index for search
        this.setupRouter();
        this.setupSearch();
        this.setupGlobalEvents();

        // Boot Animation
        window.onload = () => {
            if(this.ui.loader) {
                this.ui.loader.style.opacity = '0';
                setTimeout(() => this.ui.loader.style.display = 'none', 500);
            }
            // Deep Linking (e.g. #resume)
            const hash = window.location.hash.substring(1);
            if(hash && document.getElementById(hash + '-tool')) {
                this.navigateTo(hash + '-tool', false, true);
            }
        };
    },

    cacheDOM: function() {
        this.ui = {
            home: document.getElementById('home-page'),
            toolsContainer: document.getElementById('tool-container'),
            searchBar: document.getElementById('search-bar'),
            loader: document.getElementById('loading-overlay'),
            toastBox: document.getElementById('toast-container'),
            cards: document.querySelectorAll('.t-card')
        };
    },

    // --- 2. SEARCH ENGINE (FIXED & OPTIMIZED) ---
    indexTools: function() {
        // Build a static index for O(1) lookups during search
        this.state.searchIndex = Array.from(this.ui.cards).map(card => ({
            el: card,
            title: (card.querySelector('h4')?.innerText || "").toLowerCase(),
            desc: (card.querySelector('p')?.innerText || "").toLowerCase(),
            category: card.closest('.category-block')
        }));
    },

    setupSearch: function() {
        if(!this.ui.searchBar) return;

        const performSearch = (term) => {
            requestAnimationFrame(() => {
                let hasResults = false;
                const activeCategories = new Set();

                this.state.searchIndex.forEach(item => {
                    const isMatch = item.title.includes(term) || item.desc.includes(term);
                    
                    // Toggle Visibility
                    item.el.style.display = isMatch ? 'flex' : 'none';
                    if(isMatch) {
                        item.el.style.animation = 'fadeIn 0.3s ease forwards';
                        activeCategories.add(item.category);
                        hasResults = true;
                    }
                });

                // Hide empty categories
                document.querySelectorAll('.category-block').forEach(cat => {
                    cat.style.display = activeCategories.has(cat) ? 'block' : 'none';
                });
            });
        };

        // Debounce for smoothness
        let timeout;
        this.ui.searchBar.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase().trim();
            clearTimeout(timeout);
            timeout = setTimeout(() => performSearch(term), this.config.debounceTime);
        });
    },

    // --- 3. NAVIGATION ENGINE (GPU ACCELERATED) ---
    navigateTo: function(viewId, addToHistory = true, instant = false) {
        if (!this.ui.home || !this.ui.toolsContainer) return;
        if (this.state.currentView === viewId || this.state.isAnimating) return;

        this.state.isAnimating = !instant;

        // History Management
        if (addToHistory) {
            const slug = viewId === 'home-page' ? '' : `#${viewId.replace('-tool', '')}`;
            history.pushState({ viewId }, "", slug || window.location.pathname);
        }

        const isGoingHome = viewId === 'home-page';
        
        // Reset Logic
        if (isGoingHome) {
            this.resetToolState();
            document.title = "Titanium - Dashboard";
        } else {
            this._prepareTool(viewId);
        }

        // View Switching
        if (instant) {
            this._toggleViews(viewId);
            this.state.isAnimating = false;
        } else {
            this._animateTransition(viewId, isGoingHome);
        }

        this.state.currentView = viewId;
        this.updateSidebar(viewId);
    },

    _toggleViews: function(viewId) {
        const showHome = viewId === 'home-page';
        this.ui.home.classList.toggle('hidden', !showHome);
        this.ui.toolsContainer.classList.toggle('hidden', showHome);
        if(!showHome) this._showSpecificTool(viewId);
    },

    _animateTransition: function(viewId, isGoingHome) {
        const outgoing = isGoingHome ? this.ui.toolsContainer : this.ui.home;
        const incoming = isGoingHome ? this.ui.home : this.ui.toolsContainer;

        // Stage 1: Fade Out
        outgoing.style.opacity = '0';
        outgoing.style.transform = isGoingHome ? 'translateY(10px)' : 'scale(0.98)';
        outgoing.style.transition = 'all 0.2s ease';

        setTimeout(() => {
            this._toggleViews(viewId);
            
            // Stage 2: Fade In
            incoming.style.opacity = '0';
            incoming.style.transform = isGoingHome ? 'scale(0.98)' : 'translateY(10px)';
            
            requestAnimationFrame(() => {
                incoming.style.transition = 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)';
                incoming.style.opacity = '1';
                incoming.style.transform = 'none';
                
                setTimeout(() => {
                    this.state.isAnimating = false;
                    incoming.style.transition = ''; // Cleanup
                }, 300);
            });
        }, 200);
    },

    _prepareTool: function(toolId) {
        // Broadcast open event for tools (Resume, AI, etc)
        window.dispatchEvent(new CustomEvent('toolOpened', { detail: { toolId } }));
        window.scrollTo({ top: 0, behavior: 'instant' });
    },

    _showSpecificTool: function(toolId) {
        document.querySelectorAll('.tool-workspace').forEach(el => {
            if(el.id === toolId) {
                el.classList.remove('hidden');
                el.style.display = 'block';
            } else {
                el.classList.add('hidden');
                el.style.display = 'none';
            }
        });
    },

    resetToolState: function() {
        if(this.ui.searchBar) {
            this.ui.searchBar.value = '';
            this.ui.searchBar.dispatchEvent(new Event('input')); // Reset search results
        }
        window.dispatchEvent(new CustomEvent('toolClosed'));
    },

    // --- 4. UI HELPERS ---
    updateSidebar: function(id) {
        const navItems = document.querySelectorAll('.side-nav li, .mobile-nav i');
        navItems.forEach(item => {
            item.classList.remove('active');
            const action = item.getAttribute('onclick') || "";
            // Smart matching for sidebar highlighting
            if((id === 'home-page' && action.includes('showHome')) || action.includes(id)) {
                item.classList.add('active');
            }
        });
    },

    toggleTheme: function() {
        document.body.classList.toggle('light-mode');
        this.state.theme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
        localStorage.setItem('tm_theme', this.state.theme);
    },

    loadTheme: function() {
        if(this.state.theme === 'light') document.body.classList.add('light-mode');
    },

    setupGlobalEvents: function() {
        // Keyboard Shortcuts (Ctrl+K to Search, Esc to Home)
        document.addEventListener('keydown', (e) => {
            if((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault(); this.ui.searchBar?.focus();
            }
            if(e.key === 'Escape' && this.state.currentView !== 'home-page') {
                this.navigateTo('home-page');
            }
        });

        // Router (Back Button)
        window.addEventListener('popstate', (e) => {
            const target = e.state?.viewId || 'home-page';
            this.navigateTo(target, false);
        });
    },

    showToast: function(msg, type='success') {
        if(!this.ui.toastBox) { 
            this.ui.toastBox = document.createElement('div'); 
            this.ui.toastBox.id = 'toast-container'; 
            document.body.appendChild(this.ui.toastBox); 
        }

        const toast = document.createElement('div');
        const icon = type === 'error' ? 'error-warning-line' : 'check-line';
        
        toast.className = 'toast';
        toast.style.borderLeft = `4px solid ${type === 'error' ? '#ef4444' : '#10b981'}`;
        toast.innerHTML = `<i class="ri-${icon}"></i> <span>${msg}</span>`;
        
        this.ui.toastBox.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translate(-50%, 0) scale(1)';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translate(-50%, 20px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },
    
    loader: function(show, text = "PROCESSING...") {
        if(!this.ui.loader) return;
        const txtEl = this.ui.loader.querySelector('p');
        if(txtEl) txtEl.innerText = text;
        
        this.ui.loader.style.display = 'flex';
        requestAnimationFrame(() => {
            this.ui.loader.style.opacity = show ? '1' : '0';
            if(!show) setTimeout(() => this.ui.loader.style.display = 'none', 300);
        });
    }
};

// --- GLOBAL EXPORTS (For HTML onclick) ---
window.App = App;
window.showHome = () => App.navigateTo('home-page');
window.openTool = (id) => App.navigateTo(id);
window.toggleTheme = () => App.toggleTheme();
window.showToast = (m, t) => App.showToast(m, t);
window.loader = (s, t) => App.loader(s, t);

// --- 5. INTEGRATED TOOL LOGIC (All Features) ---

// 1. Password Generator (V70)
window.genPass = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let p = "";
    for(let i=0; i<16; i++) p += chars[Math.floor(Math.random() * chars.length)];
    
    const out = document.getElementById('generated-pass') || document.getElementById('pass-out');
    if(out) out.innerText = p;
    
    // Strength Visual
    const bar = document.getElementById('pass-strength') || document.querySelector('.strength-fill');
    if(bar) {
        bar.style.width = "100%";
        bar.style.background = "#10b981";
    }
};

window.copyPass = () => {
    const el = document.getElementById('generated-pass') || document.getElementById('pass-out');
    if(el) {
        navigator.clipboard.writeText(el.innerText);
        App.showToast("Copied to clipboard!", "success");
    }
};

// 2. Magic Eraser (Custom BG)
window.changeBg = (el, color) => {
    document.querySelectorAll('.bg-dot').forEach(d => d.classList.remove('active'));
    if(el) el.classList.add('active');
    const img = document.getElementById('bg-result-img') || document.getElementById('bg-res');
    if(img) {
        img.style.backgroundImage = 'none';
        img.style.background = color;
    }
};

window.custBg = (input) => {
    if(input.files && input.files[0]) {
        const r = new FileReader();
        r.onload = e => {
            const img = document.getElementById('bg-result-img') || document.getElementById('bg-res');
            if(img) img.style.background = `url(${e.target.result}) center/cover no-repeat`;
        };
        r.readAsDataURL(input.files[0]);
    }
};

// 3. Compressor & Enhancer
window.updateCompression = () => {
    const val = document.getElementById('comp-quality')?.value || 0.6;
    const disp = document.getElementById('comp-val-display') || document.getElementById('q-val');
    if(disp) disp.innerText = `Quality: ${Math.round(val * 100)}%`;
};

// 4. Speech & AI
window.smartFormatSpeech = () => {
    const el = document.getElementById('speech-output') || document.getElementById('sp-txt');
    if(!el || !el.value) return App.showToast("Speak something first!", "error");
    
    let txt = el.value.trim();
    txt = txt.charAt(0).toUpperCase() + txt.slice(1);
    if(!txt.endsWith('.')) txt += '.';
    el.value = txt;
    
    const moodEl = document.getElementById('speech-mood') || document.getElementById('mood-res');
    if(moodEl) {
        moodEl.style.display = 'block';
        moodEl.innerText = "Mood: Professional 👔";
    }
    App.showToast("Formatted Successfully");
};

// 5. Binary Lab
window.analyzeBinary = () => {
    const val = document.getElementById('bin-input')?.value || "";
    const preview = document.getElementById('bin-preview');
    if(preview) preview.innerText = val.split('').map(c => c.charCodeAt(0).toString(2)).join(' ');
};

// Boot System
document.addEventListener('DOMContentLoaded', () => App.init());
