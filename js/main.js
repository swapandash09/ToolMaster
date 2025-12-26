// ==========================================
// ⚡ TOOLMASTER TITANIUM V39 - MATCHING JS
// ==========================================

const App = {
    version: 'V39 Pro',

    init: function() {
        console.log("System Initialized");
        this.loadTheme();
        this.setupSearch();

        // 1. LOADER REMOVAL (Fast & Smooth)
        const loader = document.getElementById('loading-overlay');
        if(loader) {
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.style.display = 'none'; // Force remove
                }, 500);
            }, 800);
        }
    },

    // --- 2. NAVIGATION SYSTEM (Fixed for New IDs) ---
    navigateTo: function(viewId) {
        const homePage = document.getElementById('home-page');
        const toolContainer = document.getElementById('tool-container');

        // Critical Safety Check
        if (!homePage || !toolContainer) {
            console.error("Critical Error: Main containers missing in HTML.");
            return;
        }

        // SCENARIO A: GO HOME
        if (viewId === 'home-page') {
            toolContainer.classList.add('hidden');
            homePage.classList.remove('hidden');
            
            // Scroll reset
            window.scrollTo(0, 0);
            this.updateSidebar('home');
        } 
        // SCENARIO B: OPEN TOOL
        else {
            const toolElement = document.getElementById(viewId);
            
            if (toolElement) {
                homePage.classList.add('hidden');
                toolContainer.classList.remove('hidden');

                // Step 1: Hide ALL other tools first (Clean Slate)
                document.querySelectorAll('.tool-workspace').forEach(el => {
                    el.classList.add('hidden');
                    el.classList.remove('active');
                });

                // Step 2: Show Target Tool
                toolElement.classList.remove('hidden');
                
                // Animation Delay
                setTimeout(() => {
                    toolElement.classList.add('active');
                }, 50);

                // Sidebar Active State Sync
                this.updateSidebar(viewId);
                
                // Scroll Top
                const content = document.querySelector('.content-area');
                if(content) content.scrollTop = 0;

            } else {
                this.showToast(`Error: Tool ID "${viewId}" not found.`, 'error');
                console.error(`ID "${viewId}" HTML mein nahi mila.`);
            }
        }
    },

    // --- 3. SIDEBAR SYNC ---
    updateSidebar: function(activeId) {
        // Remove active class from all items
        document.querySelectorAll('.side-nav li, .mobile-nav .nav-item').forEach(li => {
            li.classList.remove('active');
            
            // Logic to check if this button opens the active tool
            const clickAttr = li.getAttribute('onclick');
            if (activeId === 'home' && clickAttr && clickAttr.includes('showHome')) {
                li.classList.add('active');
            } else if (clickAttr && clickAttr.includes(activeId)) {
                li.classList.add('active');
            }
        });
    },

    // --- 4. THEME ENGINE ---
    toggleTheme: function() {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('tm_theme', isLight ? 'light' : 'dark');
        this.showToast(isLight ? "Light Mode Active" : "Dark Mode Active", "info");
    },

    loadTheme: function() {
        const saved = localStorage.getItem('tm_theme');
        if(saved === 'light') document.body.classList.add('light-mode');
    },

    // --- 5. SEARCH ENGINE (Real-time Filter) ---
    setupSearch: function() {
        const searchInput = document.getElementById('search-bar');
        if(searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase().trim();
                
                // Filter Cards
                document.querySelectorAll('.t-card').forEach(card => {
                    const title = card.querySelector('h4').innerText.toLowerCase();
                    const desc = card.querySelector('p')?.innerText.toLowerCase() || "";
                    
                    if(title.includes(term) || desc.includes(term)) {
                        card.style.display = 'flex'; // Show matched
                    } else {
                        card.style.display = 'none'; // Hide unmatched
                    }
                });
            });

            // Shortcut Ctrl+K
            document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                    e.preventDefault();
                    searchInput.focus();
                }
            });
        }
    },

    // --- 6. TOAST NOTIFICATIONS ---
    showToast: function(msg, type = 'success') {
        let container = document.getElementById('toast-container');
        if(!container) return; // HTML mein div hona chahiye

        const toast = document.createElement('div');
        toast.className = 'toast';
        
        // Icon Logic
        const icon = type === 'error' ? 'ri-error-warning-fill' : 'ri-checkbox-circle-fill';
        const color = type === 'error' ? '#ef4444' : '#10b981';

        toast.innerHTML = `<i class="${icon}" style="color:${color}"></i> <span>${msg}</span>`;
        container.appendChild(toast);

        // Auto Remove
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// --- 7. SLIDER LOGIC (For Magic Eraser Tool) ---
window.slideCompare = (val) => {
    const container = document.getElementById('compare-container');
    if(!container) return;
    
    // HTML mein IDs check karein: bg-original-img (front)
    const frontImg = document.getElementById('bg-original-img');
    
    if(frontImg) {
        frontImg.style.clipPath = `inset(0 ${100 - val}% 0 0)`;
    }
};

// --- GLOBAL EXPORTS (HTML OnClick Support) ---
window.showHome = () => App.navigateTo('home-page');
window.openTool = (id) => App.navigateTo(id);
window.toggleTheme = () => App.toggleTheme();
window.showToast = (m, t) => App.showToast(m, t);

// START APP
document.addEventListener('DOMContentLoaded', () => App.init());
