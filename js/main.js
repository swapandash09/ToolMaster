// ==========================================
// ⚡ TOOLMASTER V39 - FINAL STABLE JS
// ==========================================

const App = {
    init: function() {
        console.log("V39 System Ready");
        this.loadTheme();
        this.addSearchListener();

        // Safe Loader Removal
        const loader = document.getElementById('loading-overlay');
        if(loader) {
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => loader.style.display = 'none', 500);
            }, 600);
        }
    },

    // --- NAVIGATION (BLACK SCREEN FIXED) ---
    navigateTo: function(viewId) {
        const homePage = document.getElementById('home-page');
        const toolContainer = document.getElementById('tool-container');

        // Check if critical elements exist
        if (!homePage || !toolContainer) return;

        if (viewId === 'home-page') {
            toolContainer.classList.add('hidden');
            homePage.classList.remove('hidden');
            
            // Scroll reset
            const content = document.querySelector('.content-area');
            if(content) content.scrollTop = 0;
        } 
        else {
            const toolElement = document.getElementById(viewId);
            
            // SAFETY CHECK: Agar tool ID nahi mili, toh Home hide mat karo
            if (toolElement) {
                homePage.classList.add('hidden');       // Hide Home
                toolContainer.classList.remove('hidden'); // Show Container
                
                // Hide all other tools
                document.querySelectorAll('.tool-workspace').forEach(el => {
                    el.style.display = 'none';
                    el.classList.remove('active');
                });

                // Show target tool
                toolElement.style.display = 'block';
                setTimeout(() => toolElement.classList.add('active'), 50);

                // Scroll reset
                const content = document.querySelector('.content-area');
                if(content) content.scrollTop = 0;
            } else {
                console.error(`Error: Tool ID "${viewId}" not found in HTML.`);
                this.showToast("Tool is under maintenance!", "error");
            }
        }
    },

    // --- SEARCH ENGINE ---
    addSearchListener: function() {
        const searchInput = document.getElementById('search-bar');
        if(searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase().trim();
                document.querySelectorAll('.t-card').forEach(card => {
                    const title = card.querySelector('h4').innerText.toLowerCase();
                    const desc = card.querySelector('p') ? card.querySelector('p').innerText.toLowerCase() : "";
                    
                    if (title.includes(term) || desc.includes(term)) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        }
    },

    // --- THEME ENGINE ---
    toggleTheme: function() {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('tm_theme', isLight ? 'light' : 'dark');
    },

    loadTheme: function() {
        const saved = localStorage.getItem('tm_theme');
        if(saved === 'light') document.body.classList.add('light-mode');
    },

    // --- TOAST NOTIFICATIONS ---
    showToast: function(msg, type = 'success') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'toast';
        // Add color based on type
        const iconColor = type === 'error' ? '#ef4444' : '#22c55e';
        const iconClass = type === 'error' ? 'ri-error-warning-fill' : 'ri-checkbox-circle-fill';
        
        toast.innerHTML = `<i class="${iconClass}" style="color:${iconColor}"></i><span>${msg}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// --- GLOBAL EXPORTS ---
window.openTool = (id) => App.navigateTo(id);
window.showHome = () => App.navigateTo('home-page');
window.toggleTheme = () => App.toggleTheme();
window.showToast = (m, t) => App.showToast(m, t);

document.addEventListener('DOMContentLoaded', () => App.init());
