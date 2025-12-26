// ==========================================
// ⚡ TOOLMASTER TITANIUM V40 (STABLE CORE)
// ==========================================

const App = {
    version: 'V40 Pro',
    
    init: function() {
        console.log(`%c ToolMaster ${this.version} %c System Online `, 
            'background:#000; color:#fff; padding:4px; border-radius:4px;', 
            'color:#6366f1; font-weight:bold;');

        this.loadTheme();
        this.addGlobalListeners();

        // FAILSAFE: Force loader removal after 800ms to prevent infinite loading screen
        setTimeout(() => {
            const loader = document.getElementById('loading-overlay');
            if(loader) {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.style.display = 'none'; // Force removal
                    loader.classList.add('hidden');
                }, 500);
            }
        }, 800);
    },

    // --- 1. NAVIGATION SYSTEM (BLACK SCREEN FIX) ---
    navigateTo: function(viewId) {
        const homePage = document.getElementById('home-page');
        const toolContainer = document.getElementById('tool-container');

        // Validation: If core elements are missing, stop immediately
        if (!homePage || !toolContainer) {
            console.error("Critical Error: Core DOM elements missing.");
            return;
        }

        // SCENARIO 1: GOING HOME
        if (viewId === 'home-page') {
            toolContainer.classList.add('hidden'); // Hide tools
            toolContainer.style.display = 'none';  // Double ensure hidden
            
            homePage.classList.remove('hidden');   // Show home
            homePage.style.display = 'block';      // Force display
            homePage.classList.add('fade-in');
            
            this.resetSidebar();
        } 
        // SCENARIO 2: OPENING A TOOL
        else {
            const toolElement = document.getElementById(viewId);
            
            // Safety Fallback: If tool ID doesn't exist, go home instead of black screen
            if (!toolElement) {
                this.showToast(`Error: Tool "${viewId}" unavailable.`, 'error');
                this.navigateTo('home-page');
                return;
            }

            homePage.classList.add('hidden');
            homePage.style.display = 'none';

            toolContainer.classList.remove('hidden');
            toolContainer.style.display = 'block';

            // Hide all other tools first
            document.querySelectorAll('.tool-workspace').forEach(el => {
                el.style.display = 'none';
                el.classList.remove('active');
            });

            // Show target tool
            toolElement.style.display = 'block';
            
            // Small delay to allow CSS transition to catch the 'display:block'
            setTimeout(() => {
                toolElement.classList.add('active');
            }, 10);

            // Scroll to top
            const content = document.querySelector('.content-area');
            if(content) content.scrollTop = 0;

            this.updateSidebar(viewId);
        }
    },

    // --- 2. SIDEBAR LOGIC ---
    updateSidebar: function(activeId) {
        // Remove active class from all
        document.querySelectorAll('.side-nav li').forEach(li => li.classList.remove('active'));
        
        // Add active class to clicked item (if it exists)
        // Checks for onclick attributes containing the ID
        const activeLink = document.querySelector(`.side-nav li[onclick*="'${activeId}'"]`);
        if(activeLink) activeLink.classList.add('active');
    },

    resetSidebar: function() {
        document.querySelectorAll('.side-nav li').forEach(li => li.classList.remove('active'));
        // Activate the first item (Dashboard)
        const dash = document.querySelector('.side-nav li:first-child');
        if(dash) dash.classList.add('active');
    },

    // --- 3. THEME ENGINE ---
    toggleTheme: function() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('tm_theme', isDark ? 'dark' : 'light');
        this.showToast(isDark ? "Dark Theme Active" : "Light Theme Active", "info");
    },

    loadTheme: function() {
        const saved = localStorage.getItem('tm_theme');
        if (saved === 'dark') document.body.classList.add('dark-mode');
    },

    // --- 4. SEARCH ENGINE (Layout Safe) ---
    addGlobalListeners: function() {
        const search = document.getElementById('search-bar');
        if (search) {
            search.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase().trim();
                document.querySelectorAll('.t-card').forEach(card => {
                    const title = card.querySelector('h4').innerText.toLowerCase();
                    // Use flex for matches, none for non-matches
                    card.style.display = title.includes(term) ? 'flex' : 'none';
                });
            });
        }

        // Ctrl+K Shortcut
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                search?.focus();
            }
        });
    },

    // --- 5. TOAST NOTIFICATIONS ---
    showToast: function(msg, type = 'success') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type} fade-in`;
        
        // Icons based on type
        const iconMap = {
            success: 'ri-checkbox-circle-fill',
            error: 'ri-error-warning-fill',
            info: 'ri-information-fill'
        };
        const icon = iconMap[type] || iconMap.success;

        toast.innerHTML = `<i class="${icon}"></i><span>${msg}</span>`;
        container.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// --- GLOBAL EXPORTS ---
window.showHome = () => App.navigateTo('home-page');
window.openTool = (id) => App.navigateTo(id);
window.toggleTheme = () => App.toggleTheme();
window.showToast = (m, t) => App.showToast(m, t);
window.loader = (state) => {
    const l = document.getElementById('loading-overlay');
    if(l) l.style.display = state ? 'flex' : 'none';
};

// Initialize
document.addEventListener('DOMContentLoaded', () => App.init());
