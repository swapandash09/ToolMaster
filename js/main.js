// ==========================================
// ⚡ TOOLMASTER V39 - FINAL FIXED JS
// ==========================================

const App = {
    version: 'V39 Pro',

    init: function() {
        console.log("System Ready");
        this.loadTheme();
        this.setupSearch();

        // LOADER FIX
        const loader = document.getElementById('loading-overlay');
        if(loader) {
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.classList.add('hidden'); // Class add karke hide karein
                    loader.style.display = 'none';
                }, 500);
            }, 800);
        }
    },

    // --- 1. NAVIGATION (THE FIX) ---
    navigateTo: function(viewId) {
        const homePage = document.getElementById('home-page');
        const toolContainer = document.getElementById('tool-container');

        if (!homePage || !toolContainer) return;

        // SCENARIO 1: GO HOME
        if (viewId === 'home-page') {
            // Tools chupao
            toolContainer.classList.add('hidden');
            
            // Home dikhao
            homePage.classList.remove('hidden');
            
            window.scrollTo(0, 0);
            this.updateSidebar('home');
        } 
        // SCENARIO 2: OPEN TOOL
        else {
            const toolElement = document.getElementById(viewId);
            
            if (toolElement) {
                // 1. Home ko chupao (Add hidden)
                homePage.classList.add('hidden');
                
                // 2. Tool Container ko dikhao (Remove hidden)
                toolContainer.classList.remove('hidden');

                // 3. Pehle SAARE tools ko band karo (Reset)
                document.querySelectorAll('.tool-workspace').forEach(el => {
                    el.classList.add('hidden'); // Important: Hidden wapas lagao
                    el.classList.remove('active');
                });

                // 4. Target Tool ko dikhao (Remove hidden)
                // YAHAN FIX HAI: Hidden hatana zaroori hai
                toolElement.classList.remove('hidden');
                
                // Animation ke liye active class
                setTimeout(() => {
                    toolElement.classList.add('active');
                }, 10);

                this.updateSidebar(viewId);
                window.scrollTo(0, 0);

            } else {
                console.error(`Error: Tool ID "${viewId}" HTML mein nahi mila.`);
                this.showToast("Tool Under Construction 🛠️", "info");
            }
        }
    },

    // --- 2. SIDEBAR SYNC ---
    updateSidebar: function(activeId) {
        document.querySelectorAll('.side-nav li, .mobile-nav .nav-item').forEach(li => {
            li.classList.remove('active');
            const clickAttr = li.getAttribute('onclick');
            if (activeId === 'home' && clickAttr && clickAttr.includes('showHome')) {
                li.classList.add('active');
            } else if (clickAttr && clickAttr.includes(activeId)) {
                li.classList.add('active');
            }
        });
    },

    // --- 3. THEME ENGINE ---
    toggleTheme: function() {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('tm_theme', isLight ? 'light' : 'dark');
    },

    loadTheme: function() {
        const saved = localStorage.getItem('tm_theme');
        if(saved === 'light') document.body.classList.add('light-mode');
    },

    // --- 4. SEARCH ---
    setupSearch: function() {
        const searchInput = document.getElementById('search-bar');
        if(searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase().trim();
                document.querySelectorAll('.t-card').forEach(card => {
                    const title = card.querySelector('h4').innerText.toLowerCase();
                    const desc = card.querySelector('p')?.innerText.toLowerCase() || "";
                    if(title.includes(term) || desc.includes(term)) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        }
    },

    // --- 5. TOAST ---
    showToast: function(msg, type = 'success') {
        let container = document.getElementById('toast-container');
        if(!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        const icon = type === 'error' ? 'ri-error-warning-fill' : 'ri-checkbox-circle-fill';
        const color = type === 'error' ? '#ef4444' : '#10b981';
        toast.innerHTML = `<i class="${icon}" style="color:${color}"></i> <span>${msg}</span>`;
        container.appendChild(toast);
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

document.addEventListener('DOMContentLoaded', () => App.init());
