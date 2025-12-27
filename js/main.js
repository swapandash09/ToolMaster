// ==========================================
// ⚡ TOOLMASTER TITANIUM V42 - CORE ENGINE
// ==========================================

const App = {
    version: 'V42 Ultimate',
    state: {
        currentView: 'home-page',
        history: [],
        isLoading: false
    },

    init: function() {
        // console.clear();
        console.log(`%c ${this.version} %c System Online `, 
            'background:#6366f1; color:white; padding: 3px 6px; border-radius: 4px; font-weight:bold;', 
            'color:#6366f1; font-weight:bold; font-family:sans-serif;');
        
        this.loadTheme();
        this.setupSearch();
        this.setupShortcuts();
        this.setupRouter(); // Enable Browser Back Button

        // 🚀 SMOOTH LAUNCH SEQUENCE
        window.addEventListener('load', () => {
            const loader = document.getElementById('loading-overlay');
            if(loader) {
                setTimeout(() => {
                    loader.style.opacity = '0';
                    loader.style.transform = 'scale(1.1)'; // Subtle zoom out
                    setTimeout(() => {
                        loader.style.display = 'none';
                        document.body.classList.add('app-loaded'); // Trigger CSS animations
                    }, 500);
                }, 400); // Faster load feel
            }
        });
    },

    // --- 1. ADVANCED ROUTING & NAVIGATION ---
    navigateTo: function(viewId, addToHistory = true) {
        if(this.state.isLoading) return; // Prevent spam clicks
        
        const homePage = document.getElementById('home-page');
        const toolContainer = document.getElementById('tool-container');
        
        if (!homePage || !toolContainer) return;

        // Save State for Back Button
        if (addToHistory && viewId !== this.state.currentView) {
            history.pushState({ viewId }, "", `#${viewId.replace('-tool', '')}`);
        }
        this.state.currentView = viewId;

        // SCENARIO 1: GO HOME
        if (viewId === 'home-page' || viewId === '') {
            // Animation Out
            if(!toolContainer.classList.contains('hidden')) {
                toolContainer.style.opacity = '0';
                toolContainer.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    toolContainer.classList.add('hidden');
                    homePage.classList.remove('hidden');
                    // Animation In
                    requestAnimationFrame(() => {
                        homePage.style.opacity = '1';
                        homePage.style.transform = 'translateY(0)';
                    });
                }, 300);
            } else {
                // Initial Load
                homePage.classList.remove('hidden');
            }
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
            document.title = "ToolMaster Titanium - Dashboard";
            this.updateSidebar('home');

            // Clear Search
            const search = document.getElementById('search-bar');
            if(search) { search.value = ''; this.filterTools(''); }
        } 
        // SCENARIO 2: OPEN TOOL
        else {
            const toolElement = document.getElementById(viewId);
            
            if (toolElement) {
                // Animation Swap
                homePage.style.opacity = '0';
                homePage.style.transform = 'scale(0.98)';
                
                setTimeout(() => {
                    homePage.classList.add('hidden');
                    toolContainer.classList.remove('hidden');
                    
                    // Reset Transition Props
                    toolContainer.style.opacity = '0';
                    toolContainer.style.transform = 'translateY(10px)';

                    // Reset all workspaces
                    document.querySelectorAll('.tool-workspace').forEach(el => {
                        el.classList.add('hidden');
                        el.style.display = 'none'; // Force layout reset
                    });

                    // Activate Target
                    toolElement.classList.remove('hidden');
                    toolElement.style.display = 'block';
                    
                    // Smooth Fade In
                    requestAnimationFrame(() => {
                        toolContainer.style.transition = 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
                        toolContainer.style.opacity = '1';
                        toolContainer.style.transform = 'translateY(0)';
                    });

                    this.updateSidebar(viewId);
                    window.scrollTo(0, 0);

                    // ⚡ DISPATCH EVENT (Crucial for Resume/Charts)
                    setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('toolOpened', { detail: { toolId: viewId } }));
                    }, 100);

                    // Update Title
                    const toolName = toolElement.querySelector('h2')?.innerText || "Tool";
                    document.title = `ToolMaster - ${toolName}`;

                }, 200); // Fast transition

            } else {
                this.showToast(`Tool "${viewId}" module missing.`, "error");
                this.navigateTo('home-page', false);
            }
        }
    },

    setupRouter: function() {
        // Handle Browser Back/Forward Buttons
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.viewId) {
                this.navigateTo(event.state.viewId, false);
            } else {
                this.navigateTo('home-page', false);
            }
        });

        // Handle Initial Hash Load (e.g. site.com/#resume)
        const hash = window.location.hash.substring(1);
        if(hash) {
            const toolId = hash.includes('-tool') ? hash : hash + '-tool';
            if(document.getElementById(toolId)) this.navigateTo(toolId, false);
        }
    },

    // --- 2. SIDEBAR & NAV SYNC ---
    updateSidebar: function(activeId) {
        document.querySelectorAll('.side-nav li, .mobile-nav .nav-item').forEach(li => {
            li.classList.remove('active');
            
            // Safe attribute check
            const onClick = li.getAttribute('onclick') || "";
            const href = li.getAttribute('href') || "";
            
            // Match Logic
            const isHome = activeId === 'home-page';
            const matchesHome = isHome && (onClick.includes('showHome') || href === '#');
            const matchesTool = !isHome && (onClick.includes(activeId) || href.includes(activeId));

            if (matchesHome || matchesTool) {
                li.classList.add('active');
                // Add tiny bounce effect
                li.style.transform = 'scale(0.95)';
                setTimeout(() => li.style.transform = '', 150);
            }
        });
    },

    // --- 3. THEME ENGINE (Zero Flash) ---
    toggleTheme: function() {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('tm_theme', isLight ? 'light' : 'dark');
        
        // Dispatch event for charts/canvas tools to redraw colors
        window.dispatchEvent(new Event('themeChanged'));
        
        this.showToast(isLight ? "Light Mode Active ☀️" : "Dark Mode Active 🌙", "info");
    },

    loadTheme: function() {
        const saved = localStorage.getItem('tm_theme');
        if (saved === 'light') document.body.classList.add('light-mode');
    },

    // --- 4. SMART SEARCH (Debounced) ---
    setupSearch: function() {
        const searchInput = document.getElementById('search-bar');
        if(!searchInput) return;

        let timeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                this.filterTools(e.target.value.toLowerCase().trim());
            }, 50); // 50ms debounce for performance
        });
    },

    filterTools: function(term) {
        const cards = document.querySelectorAll('.t-card');
        let found = 0;

        cards.forEach(card => {
            const title = card.querySelector('h4')?.innerText.toLowerCase() || "";
            const desc = card.querySelector('p')?.innerText.toLowerCase() || "";
            const matches = title.includes(term) || desc.includes(term);
            
            if(matches) {
                card.style.display = 'flex';
                // Trigger reflow for staggered animation
                card.style.animation = 'none';
                card.offsetHeight; 
                card.style.animation = 'fadeIn 0.4s ease forwards';
                found++;
            } else {
                card.style.display = 'none';
            }
        });

        // Show "No Results" message if needed
        // (You can add a hidden div in HTML with id 'no-results' to toggle here)
    },

    // --- 5. GLOBAL SHORTCUTS ---
    setupShortcuts: function() {
        document.addEventListener('keydown', (e) => {
            // Ctrl + K = Search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if(document.getElementById('home-page').classList.contains('hidden')) {
                    this.navigateTo('home-page');
                }
                setTimeout(() => document.getElementById('search-bar')?.focus(), 150);
            }
            // Esc = Home / Close Modal
            if (e.key === 'Escape') {
                this.navigateTo('home-page');
                // Also close any active modals if you implement them
            }
            // Ctrl + Shift + L = Toggle Theme
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    },

    // --- 6. ADVANCED TOASTS (Stackable) ---
    showToast: function(msg, type = 'success') {
        let container = document.getElementById('toast-container');
        if(!container) {
            // Create container if missing
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: 'ri-checkbox-circle-fill',
            error: 'ri-error-warning-fill',
            info: 'ri-information-fill',
            loading: 'ri-loader-4-line'
        };
        
        // Modern Glass Style injected directly or via CSS
        toast.innerHTML = `
            <div class="toast-content">
                <i class="${icons[type] || icons.success} ${type === 'loading' ? 'spin' : ''}"></i>
                <span>${msg}</span>
            </div>
            <div class="toast-progress"></div>
        `;
        
        container.appendChild(toast);

        // Slide In Animation
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        });

        // Auto Dismiss
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-20px) scale(0.9)';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }
};

// --- GLOBAL EXPORTS ---
window.App = App;
window.showHome = () => App.navigateTo('home-page');
window.openTool = (id) => App.navigateTo(id);
window.toggleTheme = () => App.toggleTheme();
window.showToast = (m, t) => App.showToast(m, t);

// --- GLOBAL LOADER API ---
window.loader = (show, text = "PROCESSING...") => {
    const l = document.getElementById('loading-overlay');
    if(!l) return;
    
    const p = l.querySelector('p');
    
    if(show) {
        l.style.display = 'flex';
        l.style.opacity = '0';
        if(p) p.innerText = text;
        
        requestAnimationFrame(() => {
            l.style.opacity = '1';
            l.style.backdropFilter = 'blur(10px)'; // Heavy blur for focus
        });
    } else {
        l.style.opacity = '0';
        l.style.backdropFilter = 'blur(0px)';
        setTimeout(() => l.style.display = 'none', 300);
    }
};

// --- ERROR GUARD (Prevents app crash) ---
window.onerror = function(message, source, lineno, colno, error) {
    console.error("Titanium Core Error:", error);
    App.showToast("System Error. Check console.", "error");
    // Only return true if you want to suppress the default browser error
    return false; 
};

// Start Engines
document.addEventListener('DOMContentLoaded', () => App.init());
