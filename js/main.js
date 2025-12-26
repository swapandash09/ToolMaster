// ==========================================
// ⚡ V39 PRO - MASTER ROUTER (FIXED)
// ==========================================

const App = {
    currentPage: 'home-page',

    init: function() {
        console.log("V39 Pro Initialized");
        // Hide loader
        const loader = document.getElementById('loading-overlay');
        if(loader) setTimeout(() => loader.classList.add('hidden'), 500);
    },

    navigateTo: function(viewId) {
        const homePage = document.getElementById('home-page');
        const toolContainer = document.getElementById('tool-container');

        if (viewId === 'home-page') {
            toolContainer.classList.add('hidden');
            homePage.classList.remove('hidden');
            homePage.classList.add('fade-in');
        } 
        else {
            const toolElement = document.getElementById(viewId);
            
            if (toolElement) {
                // 1. Home hide karein
                homePage.classList.add('hidden');
                
                // 2. Container show karein
                toolContainer.classList.remove('hidden');
                
                // 3. Reset all workspaces
                document.querySelectorAll('.tool-workspace').forEach(el => {
                    el.classList.add('hidden');
                    el.classList.remove('active');
                });
                
                // 4. Show selected tool with delay for animation
                toolElement.classList.remove('hidden');
                setTimeout(() => {
                    toolElement.classList.add('active');
                }, 50);
                
                document.querySelector('.content-area').scrollTop = 0;
            } else {
                alert("Error: Tool " + viewId + " not found!");
            }
        }
    }
};

// Global Listeners
window.openTool = (id) => App.navigateTo(id);
window.showHome = () => App.navigateTo('home-page');
window.toggleTheme = () => document.body.classList.toggle('light-mode');

document.addEventListener('DOMContentLoaded', () => App.init());
