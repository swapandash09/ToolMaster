/* ==========================================
   ⚡ TITANIUM V83 - QUANTUM CORE (STABLE)
   ========================================== */

const App = {
    version: 'V83 Quantum',
    config: {
        animDuration: 300,
        debounceTime: 50
    },
    state: {
        currentView: 'home-page',
        isAnimating: false,
        theme: localStorage.getItem('tm_theme') || 'dark',
        searchIndex: []
    },
    ui: {},

    // --- 1. SYSTEM BOOT ---
    init: function() {
        console.log(`%c Titanium ${this.version} [System Online] `, "background: #000; color: #0f0; padding: 5px; border-radius: 4px; border: 1px solid #0f0;");
        
        this.cacheDOM();
        this.loadTheme();
        this.indexTools();
        this.setupRouter();
        this.setupSearch();
        this.setupGlobalEvents();

        // Boot Sequence
        window.addEventListener('load', () => {
            if(this.ui.loader) {
                this.ui.loader.style.opacity = '0';
                setTimeout(() => this.ui.loader.style.display = 'none', 500);
            }
            // Deep Linking (URL Hash Recovery)
            const hash = window.location.hash.substring(1);
            if(hash) this.navigateTo(hash + '-tool', false, true);
        });
    },

    cacheDOM: function() {
        this.ui = {
            home: document.getElementById('home-view') || document.getElementById('home-page'),
            toolsContainer: document.getElementById('tool-container'),
            searchBar: document.getElementById('search-bar'),
            loader: document.getElementById('loading-overlay'),
            toastBox: document.getElementById('toast-container'),
            cards: document.querySelectorAll('.t-card'),
            sidebar: document.querySelector('.desktop-sidebar')
        };
    },

    // --- 2. INTELLIGENT SEARCH (Command Palette Style) ---
    indexTools: function() {
        this.state.searchIndex = Array.from(this.ui.cards).map(card => ({
            el: card,
            title: (card.querySelector('h4')?.innerText || "").toLowerCase(),
            desc: (card.querySelector('p')?.innerText || "").toLowerCase(),
            action: card.getAttribute('onclick')
        }));
    },

    setupSearch: function() {
        if(!this.ui.searchBar) return;

        const performSearch = (term) => {
            const results = this.state.searchIndex.filter(item => 
                item.title.includes(term) || item.desc.includes(term)
            );

            // Hide/Show Logic
            this.state.searchIndex.forEach(item => {
                const isMatch = results.includes(item);
                item.el.style.display = isMatch ? 'flex' : 'none';
                if(isMatch) item.el.style.animation = 'fadeIn 0.3s ease forwards';
            });

            // Update Category Visibility
            document.querySelectorAll('.category-block').forEach(cat => {
                const visibleCards = cat.querySelectorAll('.t-card[style="display: flex;"]');
                cat.style.display = visibleCards.length > 0 ? 'block' : 'none';
            });
        };

        this.ui.searchBar.addEventListener('input', (e) => {
            performSearch(e.target.value.toLowerCase().trim());
        });
    },

    // --- 3. NAVIGATION ENGINE (GPU Optimized) ---
    navigateTo: function(viewId, addToHistory = true, instant = false) {
        // ID Sanitization (Handles both 'resume' and 'resume-tool')
        if(!viewId.endsWith('-tool') && viewId !== 'home-page' && viewId !== 'home') {
            viewId += '-tool';
        }
        if(viewId === 'home') viewId = 'home-page';

        const targetEl = document.getElementById(viewId);
        if ((!this.ui.home || !this.ui.toolsContainer) && !targetEl) return;

        // Prevent Re-navigation
        if (this.state.currentView === viewId) return;

        // History
        if (addToHistory) {
            const slug = viewId === 'home-page' ? '' : `#${viewId.replace('-tool', '')}`;
            history.pushState({ viewId }, "", slug || window.location.pathname);
        }

        const isGoingHome = viewId === 'home-page';
        
        // Prepare Views
        this.ui.home.classList.toggle('hidden', !isGoingHome);
        this.ui.toolsContainer.classList.toggle('hidden', isGoingHome);

        // Tool Visibility Logic
        if (!isGoingHome) {
            document.querySelectorAll('.tool-workspace').forEach(el => {
                el.classList.add('hidden');
                el.classList.remove('active-tool');
            });
            if(targetEl) {
                targetEl.classList.remove('hidden');
                targetEl.classList.add('active-tool'); // Triggers CSS transitions
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } else {
            document.title = "Titanium - Dashboard";
        }

        this.state.currentView = viewId;
        this.updateSidebar(viewId);
    },

    // --- 4. UI HELPERS ---
    updateSidebar: function(id) {
        const cleanId = id.replace('-tool', '').replace('-page', '');
        document.querySelectorAll('.side-nav li').forEach(li => {
            li.classList.remove('active');
            if(li.getAttribute('onclick')?.includes(cleanId)) li.classList.add('active');
        });
    },

    toggleTheme: function() {
        document.body.classList.toggle('light');
        this.state.theme = document.body.classList.contains('light') ? 'light' : 'dark';
        localStorage.setItem('tm_theme', this.state.theme);
        this.showToast(this.state.theme === 'light' ? "Light Mode Active ☀️" : "Dark Mode Active 🌙");
    },

    loadTheme: function() {
        if(this.state.theme === 'light') document.body.classList.add('light');
    },

    showToast: function(msg, type='normal') {
        if(!this.ui.toastBox) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = type === 'error' 
            ? `<i class="ri-error-warning-fill"></i> ${msg}` 
            : `<i class="ri-check-circle-fill"></i> ${msg}`;
        
        this.ui.toastBox.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    setupGlobalEvents: function() {
        // Back Button
        window.addEventListener('popstate', (e) => {
            this.navigateTo(e.state?.viewId || 'home-page', false);
        });
        
        // Keyboard Shortcuts
        document.addEventListener('keydown', (e) => {
            if((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.ui.searchBar?.focus();
            }
            if(e.key === 'Escape') this.navigateTo('home-page');
        });
    }
};

// --- 5. INTEGRATED TOOL LOGIC (V83 Refined) ---

const ToolLogic = {
    // Real Crypto Password Generator
    genPass: () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
        const length = 16;
        let pass = "";
        const randomValues = new Uint32Array(length);
        window.crypto.getRandomValues(randomValues);
        
        for(let i=0; i<length; i++) {
            pass += chars[randomValues[i] % chars.length];
        }
        
        const out = document.getElementById('generated-pass');
        const bar = document.getElementById('pass-strength');
        
        if(out) {
            out.innerText = pass;
            out.classList.add('fade-in');
            setTimeout(()=>out.classList.remove('fade-in'), 300);
        }
        if(bar) {
            bar.style.width = "100%";
            bar.style.background = "#10b981";
        }
    },

    // Magic Eraser Background Helper
    changeBg: (el, color) => {
        document.querySelectorAll('.bg-dot').forEach(d => d.classList.remove('active'));
        if(el) el.classList.add('active');
        const img = document.getElementById('bg-removed'); // V82 ID
        if(img) {
            img.style.backgroundImage = 'none';
            img.style.background = color;
        }
    },

    custBg: (input) => {
        if(input.files && input.files[0]) {
            const r = new FileReader();
            r.onload = e => {
                const img = document.getElementById('bg-removed'); // V82 ID
                if(img) img.style.background = `url(${e.target.result}) center/cover no-repeat`;
            };
            r.readAsDataURL(input.files[0]);
        }
    },

    // Real Text-to-Speech (Web API)
    speakText: () => {
        const text = document.getElementById('tts-input')?.value;
        if(!text) return App.showToast("Please enter text first", "error");

        window.speechSynthesis.cancel(); // Stop previous
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Get controls
        const rate = document.getElementById('tts-rate')?.value || 1;
        const pitch = document.getElementById('tts-pitch')?.value || 1;
        
        utterance.rate = rate;
        utterance.pitch = pitch;
        
        utterance.onstart = () => App.showToast("Speaking... 🔊");
        utterance.onerror = () => App.showToast("TTS Error", "error");
        
        window.speechSynthesis.speak(utterance);
    },

    // Binary Converter
    analyzeBinary: () => {
        const input = document.getElementById('bin-input');
        const preview = document.getElementById('bin-preview');
        if(!input || !preview) return;

        const val = input.value;
        // Auto-detect mode (Binary to Text OR Text to Binary)
        if(/^[01\s]+$/.test(val)) {
            // Binary to Text
            try {
                preview.innerText = val.split(' ').map(bin => String.fromCharCode(parseInt(bin, 2))).join('');
            } catch(e) { preview.innerText = "Invalid Binary"; }
        } else {
            // Text to Binary
            preview.innerText = val.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
        }
    }
};

// --- GLOBAL BRIDGE (Connecting HTML to JS) ---
window.App = App;
window.showHome = () => App.navigateTo('home-page');
window.openTool = (id) => App.navigateTo(id);
window.toggleTheme = () => App.toggleTheme();

// Tool Bridge
window.generatePass = ToolLogic.genPass;
window.copyPass = () => {
    const el = document.getElementById('generated-pass');
    if(el) {
        navigator.clipboard.writeText(el.innerText);
        App.showToast("Password Copied! 🔒", "success");
    }
};
window.changeBg = ToolLogic.changeBg;
window.handleCustomBg = ToolLogic.custBg;
window.speakText = ToolLogic.speakText;
window.analyzeBinary = ToolLogic.analyzeBinary;

// Compression Display Update
window.updateCompression = () => {
    const sl = document.getElementById('comp-quality');
    const d = document.getElementById('comp-val-display');
    if(sl && d) d.innerText = Math.round(sl.value * 100) + "%";
};

// Start System
App.init();
