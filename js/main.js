// ==========================================
// ⚡ TOOLMASTER TITANIUM V39 PRO - MASTER JS
// ==========================================

const App = {
    version: 'V39 Pro Stable',
    
    init: function() {
        this.loadTheme();
        this.addSearchListener();
        
        // Loader remove karein
        const loader = document.getElementById('loading-overlay');
        if(loader) setTimeout(() => loader.classList.add('hidden'), 500);
    },

    // --- SMART NAVIGATION (Fixed Tool Opening) ---
    navigateTo: function(viewId) {
        const homePage = document.getElementById('home-page');
        const toolContainer = document.getElementById('tool-container');

        if (!homePage || !toolContainer) return;

        if (viewId === 'home-page') {
            toolContainer.classList.add('hidden');
            homePage.classList.remove('hidden');
        } 
        else {
            const toolElement = document.getElementById(viewId);
            
            if (toolElement) {
                homePage.classList.add('hidden');
                toolContainer.classList.remove('hidden');
                
                // Saare workspace workspace ko clean reset karein
                document.querySelectorAll('.tool-workspace').forEach(el => {
                    el.style.display = 'none';
                    el.classList.remove('active');
                });
                
                // Sirf target tool ko show karein
                toolElement.style.display = 'block';
                setTimeout(() => toolElement.classList.add('active'), 50);
            } else {
                alert("Error: Tool element not found in HTML!");
            }
        }
    },

    // --- THEME ENGINE ---
    toggleTheme: function() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('tm_theme', isDark ? 'dark' : 'light');
    },

    loadTheme: function() {
        const saved = localStorage.getItem('tm_theme');
        if(saved === 'dark') document.body.classList.add('dark-mode');
    },

    // --- UNIQUE SEARCH ENGINE (Working) ---
    addSearchListener: function() {
        const searchInput = document.getElementById('search-bar');
        if(searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase().trim();
                document.querySelectorAll('.t-card').forEach(card => {
                    const title = card.querySelector('h4').innerText.toLowerCase();
                    card.style.display = title.includes(term) ? 'flex' : 'none';
                });
            });
        }
    }
};

// Global Exports for HTML
window.openTool = (id) => App.navigateTo(id);
window.showHome = () => App.navigateTo('home-page');
window.toggleTheme = () => App.toggleTheme();

document.addEventListener('DOMContentLoaded', () => App.init());
