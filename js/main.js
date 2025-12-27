// ==========================================
// ⚡ TOOLMASTER TITANIUM V41 - CORE ENGINE
// ==========================================

const App = {
    version: 'V41 Ultimate',

    init: function() {
        console.log(`%c ${this.version} %c System Ready `, 
            'background:#6366f1; color:white; padding: 2px 5px; border-radius: 4px;', 
            'color:#6366f1; font-weight:bold;');
        
        this.loadTheme();
        this.setupSearch();
        this.setupShortcuts();

        // SMOOTH LOADER REMOVAL
        const loader = document.getElementById('loading-overlay');
        if(loader) {
            // Wait for everything to settle
            window.addEventListener('load', () => {
                setTimeout(() => {
                    loader.style.opacity = '0';
                    setTimeout(() => {
                        loader.classList.add('hidden');
                        loader.style.display = 'none';
                    }, 500);
                }, 600);
            });
        }
    },

    // --- 1. ADVANCED ROUTING ENGINE ---
    navigateTo: function(viewId) {
        const homePage = document.getElementById('home-page');
        const toolContainer = document.getElementById('tool-container');
        
        if (!homePage || !toolContainer) return;

        // SCENARIO 1: GO HOME
        if (viewId === 'home-page') {
            toolContainer.classList.add('hidden');
            homePage.classList.remove('hidden');
            
            // Reset Scroll & Title
            window.scrollTo({ top: 0, behavior: 'smooth' });
            document.title = "ToolMaster Titanium - Dashboard";
            this.updateSidebar('home');
            
            // Clear Search if active
            const search = document.getElementById('search-bar');
            if(search && search.value) {
                search.value = '';
                this.filterTools(''); 
            }
        } 
        // SCENARIO 2: OPEN TOOL
        else {
            const toolElement = document.getElementById(viewId);
            
            if (toolElement) {
                // 1. Swap Views
                homePage.classList.add('hidden');
                toolContainer.classList.remove('hidden');

                // 2. Reset all workspaces
                document.querySelectorAll('.tool-workspace').forEach(el => {
                    el.classList.add('hidden');
                    el.classList.remove('active');
                });

                // 3. Activate Target
                toolElement.classList.remove('hidden');
                
                // 4. Smooth Transition (Double RAF for CSS repaint)
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        toolElement.classList.add('active');
                    });
                });

                this.updateSidebar(viewId);
                window.scrollTo(0, 0);

                // 5. LIFECYCLE EVENT (Crucial for Resume Scaler)
                // This tells tools like Resume Builder to re-calculate their layout
                window.dispatchEvent(new CustomEvent('toolOpened', { detail: { toolId: viewId } }));

                // Update Title
                const toolName = toolElement.querySelector('h2')?.innerText || "Tool";
                document.title = `ToolMaster - ${toolName}`;

            } else {
                console.warn(`Tool ID "${viewId}" missing in HTML.`);
                this.showToast("Tool coming soon in V42!", "info");
            }
        }
    },

    // --- 2. SIDEBAR & NAV SYNC ---
    updateSidebar: function(activeId) {
        // Sync Desktop Sidebar & Mobile Floating Nav
        document.querySelectorAll('.side-nav li, .mobile-nav .nav-item').forEach(li => {
            li.classList.remove('active');
            const action = li.getAttribute('onclick') || li.getAttribute('href');
            
            if (!action) return;

            // Logic to match button to view
            if (activeId === 'home-page' && (action.includes('showHome') || action === '#')) {
                li.classList.add('active');
            } else if (action.includes(activeId)) {
                li.classList.add('active');
            }
        });
    },

    // --- 3. THEME ENGINE (Zero Flash) ---
    toggleTheme: function() {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('tm_theme', isLight ? 'light' : 'dark');
        this.showToast(isLight ? "Light Mode Active ☀️" : "Dark Mode Active 🌙", "info");
    },

    loadTheme: function() {
        const saved = localStorage.getItem('tm_theme');
        if (saved === 'light') {
            document.body.classList.add('light-mode');
        }
    },

    // --- 4. SMART SEARCH ---
    setupSearch: function() {
        const searchInput = document.getElementById('search-bar');
        if(searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterTools(e.target.value.toLowerCase().trim());
            });
        }
    },

    filterTools: function(term) {
        document.querySelectorAll('.t-card').forEach(card => {
            const title = card.querySelector('h4').innerText.toLowerCase();
            const desc = card.querySelector('p')?.innerText.toLowerCase() || "";
            const matches = title.includes(term) || desc.includes(term);
            
            if(matches) {
                card.style.display = 'flex';
                // Trigger reflow for animation
                card.style.animation = 'none';
                card.offsetHeight; /* trigger reflow */
                card.style.animation = 'fadeIn 0.3s ease';
            } else {
                card.style.display = 'none';
            }
        });
    },

    // --- 5. GLOBAL SHORTCUTS ---
    setupShortcuts: function() {
        document.addEventListener('keydown', (e) => {
            // Ctrl + K = Search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const search = document.getElementById('search-bar');
                if(search) {
                    // Go Home first if not there
                    if(document.getElementById('home-page').classList.contains('hidden')) {
                        this.navigateTo('home-page');
                        setTimeout(() => search.focus(), 100);
                    } else {
                        search.focus();
                    }
                }
            }
            // Esc = Home
            if (e.key === 'Escape') {
                this.navigateTo('home-page');
            }
        });
    },

    // --- 6. TOAST NOTIFICATIONS ---
    showToast: function(msg, type = 'success') {
        let container = document.getElementById('toast-container');
        if(!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        
        const icons = {
            success: 'ri-checkbox-circle-fill',
            error: 'ri-error-warning-fill',
            info: 'ri-information-fill'
        };
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6'
        };

        toast.innerHTML = `<i class="${icons[type] || icons.success}" style="color:${colors[type] || colors.success}"></i> <span>${msg}</span>`;
        container.appendChild(toast);

        // Slide In
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        });

        // Auto Dismiss
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// --- GLOBAL EXPORTS (For HTML & Other Tools) ---
window.App = App;
window.showHome = () => App.navigateTo('home-page');
window.openTool = (id) => App.navigateTo(id);
window.toggleTheme = () => App.toggleTheme();
window.showToast = (m, t) => App.showToast(m, t);

// Global Loader API (Used by Excel/PDF tools)
window.loader = (show) => {
    const l = document.getElementById('loading-overlay');
    if(!l) return;
    
    if(show) {
        l.style.display = 'flex';
        // Reset text
        const p = l.querySelector('p');
        if(p) p.innerText = "PROCESSING...";
        requestAnimationFrame(() => l.style.opacity = '1');
    } else {
        l.style.opacity = '0';
        setTimeout(() => l.style.display = 'none', 300);
    }
};

// Start Engine
document.addEventListener('DOMContentLoaded', () => App.init());

// Fix for Resume Scaler on Open
window.addEventListener('toolOpened', (e) => {
    if(e.detail.toolId === 'resume-tool' && typeof autoScalePreview === 'function') {
        autoScalePreview();
    }
});
