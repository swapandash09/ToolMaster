// ==========================================
// ⚡ TOOLMASTER TITANIUM V39 PRO - COMPLETE MASTER JS
// ==========================================

const App = {
    version: 'V39 Pro Final',
    
    // --- INITIALIZATION ---
    init: function() {
        console.log(`%c ToolMaster ${this.version} %c Ready `, 
        'background:#6366f1; color:white; padding:2px 5px; border-radius:4px;', 
        'color:#6366f1; font-weight:bold;');
        
        this.loadTheme();       // Theme load karega
        this.addGlobalListeners(); // Search aur Shortcuts enable karega
        
        // Loader Handling (Black Screen Fix)
        const loader = document.getElementById('loading-overlay');
        if(loader) {
            // 600ms baad loader hata dega
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => loader.classList.add('hidden'), 500);
            }, 600);
        }
    },

    // --- 1. SMART NAVIGATION SYSTEM (Black Screen Fixed) ---
    navigateTo: function(viewId) {
        const homePage = document.getElementById('home-page');
        const toolContainer = document.getElementById('tool-container');

        // Safety Check: Agar HTML elements nahi mile toh rok dega
        if (!homePage || !toolContainer) {
            console.error("Critical: Home or Tool Container missing in HTML");
            return;
        }

        // SCENARIO 1: GO TO HOME
        if (viewId === 'home-page') {
            toolContainer.classList.add('hidden'); // Tools chupao
            homePage.classList.remove('hidden');   // Home dikhao
            homePage.classList.add('fade-in');     // Animation
            
            // Scroll reset
            const content = document.querySelector('.content-area');
            if(content) content.scrollTop = 0;
        } 
        // SCENARIO 2: OPEN A TOOL
        else {
            const toolElement = document.getElementById(viewId);
            
            if (toolElement) {
                homePage.classList.add('hidden');       // Home chupao
                toolContainer.classList.remove('hidden'); // Tool container dikhao
                
                // Pehle saare tools ko band karo (Reset)
                document.querySelectorAll('.tool-workspace').forEach(el => {
                    el.style.display = 'none';
                    el.classList.remove('active', 'slide-up');
                });
                
                // Ab sirf target tool ko open karo
                toolElement.style.display = 'block'; 
                
                // Animation trigger (Smoothness ke liye delay)
                setTimeout(() => {
                    toolElement.classList.add('active', 'slide-up');
                }, 50);
                
                // Scroll top par le jao
                const content = document.querySelector('.content-area');
                if(content) content.scrollTop = 0;
                
            } else {
                this.showToast("Error: Tool ID not found!", "error");
            }
        }
        this.updateSidebar(viewId);
    },

    // --- 2. SIDEBAR SYNC (Desktop & Mobile) ---
    updateSidebar: function(viewId) {
        // Saare active classes hatao
        document.querySelectorAll('.side-nav li, .mobile-nav .nav-item').forEach(li => {
            li.classList.remove('active');
            
            // Check karo agar ye button wahi tool kholta hai
            const action = li.getAttribute('onclick');
            if (action && action.includes(viewId)) {
                li.classList.add('active');
            }
        });
    },

    // --- 3. THEME ENGINE (Light/Dark) ---
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

    // --- 4. UNIQUE SEARCH ENGINE (Title + Description) ---
    addGlobalListeners: function() {
        const searchInput = document.getElementById('search-bar');
        
        if(searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase().trim();
                
                document.querySelectorAll('.t-card').forEach(card => {
                    // Tool ka naam aur description scan karo
                    const title = card.querySelector('h4').innerText.toLowerCase();
                    const desc = card.querySelector('p')?.innerText.toLowerCase() || "";
                    
                    // Match hone par dikhao, warna chupao
                    if (title.includes(term) || desc.includes(term)) {
                        card.style.display = 'flex'; // Box layout maintain rahega
                        card.classList.add('fade-in');
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        }

        // Desktop Shortcut: Ctrl+K
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInput?.focus();
            }
        });
    },

    // --- 5. TOAST NOTIFICATIONS (Popup Messages) ---
    showToast: function(msg, type = 'success') {
        let container = document.getElementById('toast-container');
        if(!container) {
            // Agar container nahi hai toh banao
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        // Icons set karo
        const icon = type === 'error' ? 'ri-error-warning-fill' : 
                     type === 'info' ? 'ri-information-fill' : 'ri-checkbox-circle-fill';

        toast.innerHTML = `<i class="${icon}"></i> <span>${msg}</span>`;
        container.appendChild(toast);
        
        // 3 second baad hata do
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }
};

// --- 6. UNIVERSAL SLIDER LOGIC (For Image Tools) ---
window.slideCompare = (val, type) => {
    // Determine tool type (Enhancer vs Eraser)
    const prefix = type === 'enh' ? 'enh' : 'bg';
    
    // Elements dhundo
    const front = document.getElementById(`${prefix}-front`) || document.getElementById('bg-original-img');
    const line = document.getElementById(`${prefix}-line`);
    const handle = document.getElementById(`${prefix}-handle`);

    // CSS update karo
    if(front) front.style.clipPath = `inset(0 ${100 - val}% 0 0)`;
    if(line) line.style.left = `${val}%`;
    if(handle) handle.style.left = `${val}%`;
};

// --- GLOBAL EXPORTS (HTML ke liye zaruri) ---
window.showHome = () => App.navigateTo('home-page');
window.openTool = (id) => App.navigateTo(id);
window.toggleTheme = () => App.toggleTheme();
window.showToast = (m, t) => App.showToast(m, t);

// App Start Karo
document.addEventListener('DOMContentLoaded', () => App.init());
