// ==========================================
// ⚡ TOOLMASTER TITANIUM V39 PRO - MASTER JS
// ==========================================

const App = {
    version: 'V39 Pro Stable',
    currentPage: 'home-page',
    
    init: function() {
        this.loadTheme(); // LocalStorage se saved theme load karega
        this.addGlobalListeners(); // Unique Search aur Shortcuts enable karega
        
        // Initial Loader Handling
        const loader = document.getElementById('loading-overlay');
        if(loader) {
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => loader.classList.add('hidden'), 500);
            }, 600);
        }
    },

    // --- 1. CORE NAVIGATION (Desktop & Mobile Friendly) ---
    navigateTo: function(viewId) {
        const homePage = document.getElementById('home-page');
        const toolContainer = document.getElementById('tool-container');

        if (!homePage || !toolContainer) return;

        if (viewId === 'home-page') {
            toolContainer.classList.add('hidden');
            homePage.classList.remove('hidden');
            homePage.classList.add('fade-in');
            this.currentPage = 'home-page';
        } 
        else {
            const toolElement = document.getElementById(viewId);
            
            if (toolElement) {
                homePage.classList.add('hidden');
                toolContainer.classList.remove('hidden');
                
                // Sabhi active tools ko clean reset karein taaki UI overlap na ho
                document.querySelectorAll('.tool-workspace').forEach(el => {
                    el.style.display = 'none';
                    el.classList.remove('active', 'slide-up');
                });
                
                toolElement.style.display = 'block';
                
                // Hardware-accelerated animation trigger
                setTimeout(() => {
                    toolElement.classList.add('active', 'slide-up');
                }, 50);
                
                this.currentPage = viewId;
                
                // Scroll to top for better mobile UX
                const contentArea = document.querySelector('.content-area');
                if (contentArea) contentArea.scrollTop = 0;
            } else {
                this.showToast("Tool not found!", "error");
            }
        }
        this.updateSidebar(viewId);
    },

    // --- 2. UNIQUE SEARCH ENGINE (Mobile Friendly & Smart) ---
    addGlobalListeners: function() {
        const searchInput = document.getElementById('search-bar');
        if(searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase().trim();
                const cards = document.querySelectorAll('.t-card');
                let foundAny = false;

                cards.forEach(card => {
                    const title = card.querySelector('h4').innerText.toLowerCase();
                    const desc = card.querySelector('p')?.innerText.toLowerCase() || "";
                    // Smart Keyword detection (Adding metadata attribute can improve this)
                    const tags = card.getAttribute('data-tags')?.toLowerCase() || "";

                    // Unique Search Match Logic
                    if (title.includes(term) || desc.includes(term) || tags.includes(term)) {
                        card.style.display = 'flex'; // Box design layout maintain karein
                        card.classList.add('fade-in');
                        foundAny = true;
                    } else {
                        card.style.display = 'none';
                    }
                });

                // Agar koi result na mile toh user ko feedback de sakte hain
                if(!foundAny && term.length > 0) {
                    console.log("No results found for: " + term);
                }
            });
        }

        // Shortcut: Ctrl+K to focus search
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInput?.focus();
            }
        });
    },

    // --- 3. THEME & UI UTILITIES ---
    updateSidebar: function(viewId) {
        document.querySelectorAll('.side-nav li, .mobile-nav .nav-item').forEach(li => {
            li.classList.remove('active');
            const action = li.getAttribute('onclick');
            if (action && action.includes(viewId)) {
                li.classList.add('active');
            }
        });
    },

    toggleTheme: function() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('tm_theme', isDark ? 'dark' : 'light');
        this.showToast(isDark ? "Dark Theme Active" : "Light Theme Active", "info");
    },

    loadTheme: function() {
        const saved = localStorage.getItem('tm_theme');
        if(saved === 'dark') document.body.classList.add('dark-mode');
    },

    showToast: function(msg, type = 'success') {
        const container = document.getElementById('toast-container');
        if(!container) return;
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} fade-in`;
        toast.innerHTML = `<span>${msg}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }
};

// --- UNIVERSAL SLIDER SYNC ---
window.slideCompare = (val, type) => {
    const prefix = type === 'enh' ? 'enh' : 'bg';
    const front = document.getElementById(`${prefix}-front`) || document.getElementById('bg-original-img');
    const line = document.getElementById(`${prefix}-line`);
    const handle = document.getElementById(`${prefix}-handle`);
    if (front) front.style.clipPath = `inset(0 ${100 - val}% 0 0)`;
    if (line) line.style.left = `${val}%`;
    if (handle) handle.style.left = `${val}%`;
};

// Global Exports
window.showHome = () => App.navigateTo('home-page');
window.openTool = (id) => App.navigateTo(id);
window.toggleTheme = () => App.toggleTheme();

document.addEventListener('DOMContentLoaded', () => App.init());
