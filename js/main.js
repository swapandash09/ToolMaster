// ==========================================
// ⚡ TOOLMASTER TITANIUM V39 PRO - MASTER JS
// ==========================================

const App = {
    version: 'V39 Pro Stable',
    currentPage: 'home-page',
    
    init: function() {
        console.log(`%c ToolMaster ${this.version} %c Ready `, 
        'background:#6366f1; color:white; padding:2px 5px; border-radius:4px;', 
        'color:#6366f1; font-weight:bold;');
        
        this.loadTheme();
        this.addGlobalListeners();
        
        // Initial Loader Handling
        const loader = document.getElementById('loading-overlay');
        if(loader) {
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => loader.classList.add('hidden'), 500);
            }, 600);
        }
    },

    // --- 1. CORE NAVIGATION (Fixed Opening & Jitter) ---
    navigateTo: function(viewId) {
        const homePage = document.getElementById('home-page');
        const toolContainer = document.getElementById('tool-container');

        if (!homePage || !toolContainer) return;

        if (viewId === 'home-page') {
            // Dashboard par vapas jana
            toolContainer.classList.add('hidden');
            homePage.classList.remove('hidden');
            homePage.classList.add('fade-in');
            this.currentPage = 'home-page';
        } 
        else {
            const toolElement = document.getElementById(viewId);
            
            if (toolElement) {
                // Dashboard hide karein
                homePage.classList.add('hidden');
                toolContainer.classList.remove('hidden');
                
                // Sabhi active tools ko clean reset karein taaki black screen na aaye
                document.querySelectorAll('.tool-workspace').forEach(el => {
                    el.style.display = 'none';
                    el.classList.remove('active', 'slide-up');
                });
                
                // Target Tool ko activate karein
                toolElement.style.display = 'block';
                
                // 50ms delay transitions ko smooth banata hai
                setTimeout(() => {
                    toolElement.classList.add('active', 'slide-up');
                }, 50);
                
                this.currentPage = viewId;
                
                // Scroll reset to top
                const contentArea = document.querySelector('.content-area');
                if (contentArea) contentArea.scrollTop = 0;
            } else {
                this.showToast("Error: Tool ID '" + viewId + "' not found!", "error");
            }
        }
        this.updateSidebar(viewId);
    },

    // --- 2. SIDEBAR SYNC ---
    updateSidebar: function(viewId) {
        document.querySelectorAll('.side-nav li').forEach(li => {
            li.classList.remove('active');
            const onclickAttr = li.getAttribute('onclick');
            if (onclickAttr && onclickAttr.includes(viewId)) {
                li.classList.add('active');
            }
        });
    },

    // --- 3. THEME ENGINE ---
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

    // --- 4. TOAST SYSTEM ---
    showToast: function(msg, type = 'success') {
        const container = document.getElementById('toast-container');
        if(!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type} fade-in`;
        
        const icon = type === 'error' ? 'ri-error-warning-fill' : 
                     type === 'info' ? 'ri-information-fill' : 'ri-checkbox-circle-fill';

        toast.innerHTML = `<i class="${icon}"></i> <span>${msg}</span>`;
        
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    },

    // --- 5. SEARCH & SHORTCUTS ---
    addGlobalListeners: function() {
        const search = document.getElementById('search-bar');
        if(search) {
            search.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                document.querySelectorAll('.t-card').forEach(card => {
                    const title = card.querySelector('h4').innerText.toLowerCase();
                    card.style.display = title.includes(term) ? 'flex' : 'none';
                });
            });
        }

        // Ctrl+K Shortcut to Search
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                search?.focus();
            }
        });
    }
};

// --- UNIVERSAL SLIDER SYNC (Fixed Visibility) ---
window.slideCompare = (val, type) => {
    const prefix = type === 'enh' ? 'enh' : 'bg';
    
    // Select elements based on tool type (Enhancer vs Eraser)
    const front = document.getElementById(`${prefix}-front`) || document.getElementById('bg-original-img');
    const line = document.getElementById(`${prefix}-line`);
    const handle = document.getElementById(`${prefix}-handle`);

    if(front) front.style.clipPath = `inset(0 ${100 - val}% 0 0)`;
    if(line) line.style.left = `${val}%`;
    if(handle) handle.style.left = `${val}%`;
};

// --- GLOBAL EXPORTS ---
window.showHome = () => App.navigateTo('home-page');
window.openTool = (id) => App.navigateTo(id);
window.toggleTheme = () => App.toggleTheme();
window.showToast = (m, t) => App.showToast(m, t);

document.addEventListener('DOMContentLoaded', () => App.init());
