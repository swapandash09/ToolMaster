// ==========================================
// ⚡ TOOLMASTER V39 - FINAL LOGIC FIX
// ==========================================

const App = {
    init: function() {
        console.log("System Initialized");
        this.loadTheme();
        
        // Loader ko safe remove karein
        const loader = document.getElementById('loading-overlay');
        if(loader) {
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => loader.style.display = 'none', 500);
            }, 500);
        }
    },

    // --- NAVIGATION (Crash Proof) ---
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

                // Saare tools reset karein
                document.querySelectorAll('.tool-workspace').forEach(el => el.style.display = 'none');
                
                // Target tool dikhayein
                toolElement.style.display = 'block';
            }
        }
    },

    // --- THEME TOGGLE (Black Screen Fix) ---
    toggleTheme: function() {
        // Sirf class toggle karein, koi animation delay nahi
        document.body.classList.toggle('light-mode');
        
        // Save preference
        const isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('tm_theme', isLight ? 'light' : 'dark');
    },

    loadTheme: function() {
        const saved = localStorage.getItem('tm_theme');
        if(saved === 'light') document.body.classList.add('light-mode');
    }
};

// Global Exports
window.openTool = (id) => App.navigateTo(id);
window.showHome = () => App.navigateTo('home-page');
window.toggleTheme = () => App.toggleTheme();

document.addEventListener('DOMContentLoaded', () => App.init());
