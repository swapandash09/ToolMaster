// ==========================================
// ⚡ TOOLMASTER TITANIUM V43 - HYPERION ENGINE
// ==========================================

const App = {
    version: 'V43 Hyperion',
    config: {
        animDuration: 350,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    },
    state: {
        currentView: 'home-page',
        isLoading: false,
        searchDebounce: null
    },
    dom: {}, // Cache frequently used elements

    init: function() {
        // console.clear();
        console.log(`%c ${this.version} %c Core Online `, 
            'background:#6366f1; color:white; padding: 3px 6px; border-radius: 4px; font-weight:bold;', 
            'color:#6366f1; font-weight:bold; font-family:sans-serif;');
        
        this.cacheDOM();
        this.loadTheme();
        this.setupSearch();
        this.setupShortcuts();
        this.setupRouter();

        // 🚀 CINEMATIC LAUNCH
        window.addEventListener('load', () => {
            if (this.dom.loader) {
                // Force GPU layer for smoothness
                this.dom.loader.style.willChange = 'opacity, transform';
                
                setTimeout(() => {
                    this.dom.loader.style.opacity = '0';
                    this.dom.loader.style.transform = 'scale(1.05)'; 
                    this.dom.loader.style.filter = 'blur(10px)'; // Blur out effect
                    
                    setTimeout(() => {
                        this.dom.loader.style.display = 'none';
                        document.body.classList.add('app-ready');
                    }, 500);
                }, 300);
            }
        });
    },

    cacheDOM: function() {
        this.dom = {
            homePage: document.getElementById('home-page'),
            toolContainer: document.getElementById('tool-container'),
            searchBar: document.getElementById('search-bar'),
            loader: document.getElementById('loading-overlay'),
            toastContainer: document.getElementById('toast-container')
        };
    },

    // --- 1. NEXT-GEN ROUTING ENGINE (View Transitions) ---
    navigateTo: function(viewId, addToHistory = true) {
        if(this.state.isLoading || viewId === this.state.currentView) return;

        // 1. Lifecycle: Clean up previous tool
        if (this.state.currentView !== 'home-page') {
            window.dispatchEvent(new CustomEvent('toolClosed', { detail: { toolId: this.state.currentView } }));
        }

        // 2. History Management
        if (addToHistory) {
            history.pushState({ viewId }, "", `#${viewId.replace('-tool', '')}`);
        }
        
        const prevView = this.state.currentView;
        this.state.currentView = viewId;
        const isGoingHome = viewId === 'home-page';

        // 3. THE TRANSITION LOGIC
        // Use Native View Transitions if supported (Chrome/Edge/Arc)
        if (document.startViewTransition && !this.config.reducedMotion) {
            document.startViewTransition(() => {
                this._updateDOMForRoute(viewId, prevView);
            });
        } 
        // Fallback for Safari/Firefox (CSS Transitions)
        else {
            this._fallbackTransition(viewId, isGoingHome);
        }
    },

    // Internal: Actual DOM Swapping
    _updateDOMForRoute: function(viewId, prevView) {
        window.scrollTo({ top: 0 }); // Instant scroll reset

        if (viewId === 'home-page') {
            this.dom.toolContainer.classList.add('hidden');
            this.dom.homePage.classList.remove('hidden');
            
            // Clear Search
            if(this.dom.searchBar) { this.dom.searchBar.value = ''; this.filterTools(''); }
            
            document.title = "ToolMaster Titanium - Dashboard";
            this.updateSidebar('home');
        } else {
            const toolElement = document.getElementById(viewId);
            if (!toolElement) {
                this.showToast(`Module "${viewId}" not installed.`, "error");
                return this.navigateTo('home-page', false);
            }

            this.dom.homePage.classList.add('hidden');
            this.dom.toolContainer.classList.remove('hidden');

            // Hide all other workspaces
            document.querySelectorAll('.tool-workspace').forEach(el => el.classList.add('hidden'));
            
            // Show target
            toolElement.classList.remove('hidden');

            // ⚡ Lifecycle: Initialize new tool
            window.dispatchEvent(new CustomEvent('toolOpened', { detail: { toolId: viewId } }));

            const toolName = toolElement.querySelector('h2')?.innerText || "Tool";
            document.title = `ToolMaster - ${toolName}`;
            this.updateSidebar(viewId);
        }
    },

    // Internal: Fallback Animation (Manual CSS manipulation)
    _fallbackTransition: function(viewId, isGoingHome) {
        const container = isGoingHome ? this.dom.toolContainer : this.dom.homePage;
        
        // 1. Fade Out
        container.style.opacity = '0';
        container.style.transform = isGoingHome ? 'translateY(15px)' : 'scale(0.98)';
        
        setTimeout(() => {
            this._updateDOMForRoute(viewId);
            
            // 2. Fade In New View
            const newContainer = isGoingHome ? this.dom.homePage : this.dom.toolContainer;
            
            // Prepare for entry
            newContainer.style.opacity = '0';
            newContainer.style.transform = isGoingHome ? 'scale(0.98)' : 'translateY(15px)';
            newContainer.style.transition = 'none'; // Prevent lag
            
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    newContainer.style.transition = `all ${this.config.animDuration}ms cubic-bezier(0.2, 0.8, 0.2, 1)`;
                    newContainer.style.opacity = '1';
                    newContainer.style.transform = isGoingHome ? 'scale(1)' : 'translateY(0)';
                });
            });
        }, 200);
    },

    setupRouter: function() {
        window.addEventListener('popstate', (event) => {
            const target = (event.state && event.state.viewId) ? event.state.viewId : 'home-page';
            this.navigateTo(target, false);
        });

        // Handle Deep Links (e.g., #resume-tool)
        const hash = window.location.hash.substring(1);
        if(hash) {
            const toolId = hash.includes('-tool') ? hash : hash + '-tool';
            if(document.getElementById(toolId)) this.navigateTo(toolId, false);
        }
    },

    // --- 2. SIDEBAR STATE SYNC ---
    updateSidebar: function(activeId) {
        document.querySelectorAll('.side-nav li, .mobile-nav .nav-item').forEach(li => {
            const action = li.getAttribute('onclick') || li.getAttribute('href') || "";
            const isTarget = (activeId === 'home-page' && (action.includes('showHome') || action === '#')) ||
                             (activeId !== 'home-page' && action.includes(activeId));
            
            if (isTarget) {
                li.classList.add('active');
                if(!this.config.reducedMotion) {
                    // Micro-interaction bounce
                    li.animate([
                        { transform: 'scale(0.95)' },
                        { transform: 'scale(1.05)' },
                        { transform: 'scale(1)' }
                    ], { duration: 300, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' });
                }
            } else {
                li.classList.remove('active');
            }
        });
    },

    // --- 3. THEME ENGINE (Instant Switch) ---
    toggleTheme: function() {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('tm_theme', isLight ? 'light' : 'dark');
        
        // Notify components (Charts, Canvases need redraws on theme change)
        window.dispatchEvent(new Event('themeChanged'));
        
        this.showToast(isLight ? "Light Mode Active" : "Dark Mode Active", "info");
    },

    loadTheme: function() {
        if (localStorage.getItem('tm_theme') === 'light') document.body.classList.add('light-mode');
    },

    // --- 4. SMART SEARCH (Debounced + Empty State) ---
    setupSearch: function() {
        if(!this.dom.searchBar) return;
        
        this.dom.searchBar.addEventListener('input', (e) => {
            clearTimeout(this.state.searchDebounce);
            this.state.searchDebounce = setTimeout(() => {
                this.filterTools(e.target.value.toLowerCase().trim());
            }, 60); // 60ms debounce (1 frame @ 60fps)
        });
    },

    filterTools: function(term) {
        const cards = document.querySelectorAll('.t-card');
        const categories = document.querySelectorAll('.category-block');
        let totalFound = 0;

        // 1. Filter Cards
        cards.forEach(card => {
            const title = card.querySelector('h4')?.innerText.toLowerCase() || "";
            const desc = card.querySelector('p')?.innerText.toLowerCase() || "";
            const match = title.includes(term) || desc.includes(term);
            
            card.style.display = match ? 'flex' : 'none';
            if(match) {
                card.style.animation = 'fadeIn 0.4s ease forwards';
                totalFound++;
            }
        });

        // 2. Hide Empty Categories
        categories.forEach(cat => {
            const visibleCards = cat.querySelectorAll('.t-card[style="display: flex;"]');
            cat.style.display = visibleCards.length > 0 ? 'block' : 'none';
        });

        // 3. Handle No Results
        const noResId = 'no-results-msg';
        let noResMsg = document.getElementById(noResId);
        
        if(totalFound === 0 && term !== "") {
            if(!noResMsg) {
                noResMsg = document.createElement('div');
                noResMsg.id = noResId;
                noResMsg.style.cssText = "text-align:center; padding:40px; color:var(--text-muted); font-size:1.1rem;";
                noResMsg.innerHTML = `<i class="ri-search-eye-line" style="font-size:3rem; display:block; margin-bottom:10px; opacity:0.5;"></i>No tools found for "${term}"`;
                document.querySelector('.tools-wrapper').appendChild(noResMsg);
            } else {
                noResMsg.innerHTML = `<i class="ri-search-eye-line" style="font-size:3rem; display:block; margin-bottom:10px; opacity:0.5;"></i>No tools found for "${term}"`;
                noResMsg.style.display = 'block';
            }
        } else if (noResMsg) {
            noResMsg.style.display = 'none';
        }
    },

    // --- 5. INTERACTIVE NOTIFICATIONS (Hover Pause) ---
    showToast: function(msg, type = 'success') {
        if(!this.dom.toastContainer) {
            this.dom.toastContainer = document.createElement('div');
            this.dom.toastContainer.id = 'toast-container';
            document.body.appendChild(this.dom.toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = { success: 'ri-check-line', error: 'ri-alert-line', info: 'ri-information-line', loading: 'ri-loader-4-line' };
        
        toast.innerHTML = `
            <div class="toast-content">
                <i class="${icons[type] || icons.success} ${type === 'loading' ? 'spin' : ''}"></i>
                <span>${msg}</span>
            </div>
            <div class="toast-progress"></div>
        `;
        
        this.dom.toastContainer.appendChild(toast);

        // Animation In
        requestAnimationFrame(() => {
            toast.style.transform = 'translateY(0) scale(1)';
            toast.style.opacity = '1';
        });

        // Auto Dismiss Logic with Pause on Hover
        let timeout;
        const startDismiss = () => {
            timeout = setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(-10px) scale(0.95)';
                setTimeout(() => toast.remove(), 350);
            }, 4000);
        };

        toast.addEventListener('mouseenter', () => { clearTimeout(timeout); toast.style.transform = 'scale(1.02)'; });
        toast.addEventListener('mouseleave', () => { toast.style.transform = 'scale(1)'; startDismiss(); });
        
        startDismiss();
    }
};

// --- SHORTCUTS ENGINE ---
const Shortcuts = {
    init() {
        document.addEventListener('keydown', (e) => {
            // Meta key is Cmd on Mac, Ctrl on Windows
            const cmd = e.ctrlKey || e.metaKey;

            // Ctrl + K: Search
            if (cmd && e.key === 'k') {
                e.preventDefault();
                if(App.state.currentView !== 'home-page') App.navigateTo('home-page');
                setTimeout(() => App.dom.searchBar?.focus(), 100);
            }
            // Esc: Home / Blur
            if (e.key === 'Escape') {
                if(document.activeElement === App.dom.searchBar) {
                    App.dom.searchBar.blur();
                } else {
                    App.navigateTo('home-page');
                }
            }
            // Ctrl + / : Toggle Theme
            if (cmd && e.key === '/') {
                e.preventDefault();
                App.toggleTheme();
            }
        });
    }
};

// --- GLOBAL EXPORTS ---
window.App = App;
window.showHome = () => App.navigateTo('home-page');
window.openTool = (id) => App.navigateTo(id);
window.toggleTheme = () => App.toggleTheme();
window.showToast = (m, t) => App.showToast(m, t);

// --- GLOBAL LOADER ---
window.loader = (show, text = "PROCESSING...") => {
    const l = App.dom.loader;
    if(!l) return;
    
    const p = l.querySelector('p');
    if(show) {
        l.style.display = 'flex';
        // Reset state for entry
        l.style.opacity = '0';
        l.style.transform = 'scale(0.95)';
        if(p) p.innerText = text;
        
        requestAnimationFrame(() => {
            l.style.opacity = '1';
            l.style.transform = 'scale(1)';
            l.style.backdropFilter = 'blur(15px)';
        });
    } else {
        l.style.opacity = '0';
        l.style.transform = 'scale(1.05)';
        l.style.backdropFilter = 'blur(0px)';
        setTimeout(() => l.style.display = 'none', 350);
    }
};

// --- ERROR GUARD ---
window.onerror = (msg, src, line, col, error) => {
    console.warn("Titanium Guard Caught:", error);
    App.showToast("An error occurred. Check console.", "error");
    return false;
};

// --- BOOTSTRAP ---
document.addEventListener('DOMContentLoaded', () => {
    App.init();
    Shortcuts.init();
});
