// ==========================================
// ⚡ V39 PRO - MASTER ROUTER (UPGRADED)
// ==========================================

const App = {
    version: 'V39 Pro',
    currentPage: 'home-page',

    init: function() {
        console.log(`%c ${this.version} %c Online `, 
            'background:#6366f1; color:white; padding:2px 5px; border-radius:4px;', 
            'color:#6366f1; font-weight:bold;');
            
        this.loadTheme();       // 1. Load saved theme
        this.setupSearch();     // 2. Initialize Search
        this.addShortcuts();    // 3. Add Keyboard Shortcuts

        // Hide loader smooth
        const loader = document.getElementById('loading-overlay');
        if(loader) {
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => loader.classList.add('hidden'), 500);
            }, 500);
        }
    },

    // --- NAVIGATION ENGINE ---
    navigateTo: function(viewId) {
        const homePage = document.getElementById('home-page');
        const toolContainer = document.getElementById('tool-container');

        if (!homePage || !toolContainer) return;

        // Scroll to top
        const contentArea = document.querySelector('.content-area');
        if (contentArea) contentArea.scrollTop = 0;

        if (viewId === 'home-page') {
            toolContainer.classList.add('hidden');
            homePage.classList.remove('hidden');
            homePage.classList.add('fade-in');
            this.updateSidebar('home');
        } 
        else {
            const toolElement = document.getElementById(viewId);
            
            if (toolElement) {
                // 1. Hide Home
                homePage.classList.add('hidden');
                
                // 2. Show Container
                toolContainer.classList.remove('hidden');
                
                // 3. Reset all workspaces (Fix overlap issues)
                document.querySelectorAll('.tool-workspace').forEach(el => {
                    el.style.display = 'none'; // Force hide
                    el.classList.remove('active');
                });
                
                // 4. Activate specific tool
                toolElement.style.display = 'block';
                setTimeout(() => {
                    toolElement.classList.add('active');
                }, 50);

                this.updateSidebar(viewId);
            } else {
                console.error("Error: Tool " + viewId + " not found!");
            }
        }
    },

    // --- SIDEBAR SYNC ---
    updateSidebar: function(id) {
        document.querySelectorAll('.side-nav li').forEach(li => {
            li.classList.remove('active');
            // Check if onclick contains the ID
            const action = li.getAttribute('onclick');
            if(action && action.includes(id)) {
                li.classList.add('active');
            }
        });
    },

    // --- THEME ENGINE (With Memory) ---
    toggleTheme: function() {
        document.body.classList.toggle('light-mode');
        
        // Save preference
        const isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('tm_theme', isLight ? 'light' : 'dark');
    },

    loadTheme: function() {
        const saved = localStorage.getItem('tm_theme');
        if(saved === 'light') {
            document.body.classList.add('light-mode');
        }
    },

    // --- SEARCH ENGINE ---
    setupSearch: function() {
        const searchInput = document.getElementById('search-bar');
        
        if(searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase().trim();
                const cards = document.querySelectorAll('.t-card'); // Target your tool cards

                cards.forEach(card => {
                    const title = card.querySelector('h4')?.innerText.toLowerCase() || "";
                    const desc = card.querySelector('p')?.innerText.toLowerCase() || "";

                    // Check if title or description matches
                    if(title.includes(term) || desc.includes(term)) {
                        card.style.display = 'flex'; // Keep flex layout
                        card.classList.remove('hidden');
                        card.classList.add('fade-in');
                    } else {
                        card.style.display = 'none';
                        card.classList.add('hidden');
                    }
                });
            });
        }
    },

    // --- SHORTCUTS ---
    addShortcuts: function() {
        document.addEventListener('keydown', (e) => {
            // Ctrl + K to Search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const search = document.getElementById('search-bar');
                if(search) search.focus();
            }
        });
    }
};

// Global Listeners (Exposed to HTML)
window.openTool = (id) => App.navigateTo(id);
window.showHome = () => App.navigateTo('home-page');
window.toggleTheme = () => App.toggleTheme();

// Start System
document.addEventListener('DOMContentLoaded', () => App.init());
