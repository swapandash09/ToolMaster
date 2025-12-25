// --- TITANIUM CORE LOGIC ---

function showHome() {
    document.querySelectorAll('.tool-workspace').forEach(el => el.classList.add('hidden'));
    document.getElementById('home-page').classList.remove('hidden');
    document.querySelectorAll('.nav-menu li').forEach(li => li.classList.remove('active'));
    document.querySelector('.nav-menu li:first-child').classList.add('active');
}

function openTool(id) {
    document.getElementById('home-page').classList.add('hidden');
    document.querySelectorAll('.tool-workspace').forEach(el => el.classList.add('hidden'));
    const tool = document.getElementById(id);
    if(tool) tool.classList.remove('hidden');
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
}

function loader(show) {
    const l = document.getElementById('loading-overlay');
    show ? l.classList.remove('hidden') : l.classList.add('hidden');
}

function filterTools() {
    let input = document.getElementById('search-bar').value.toLowerCase();
    document.querySelectorAll('.tool-card').forEach(card => {
        card.style.display = card.innerText.toLowerCase().includes(input) ? 'flex' : 'none';
    });
}

function showToast(msg) {
    const t = document.getElementById('toast-container');
    const d = document.createElement('div');
    d.style.cssText = "background:var(--card); color:var(--text); padding:12px 20px; margin-top:10px; border-radius:8px; border:1px solid var(--primary); animation:fade 0.3s;";
    d.innerHTML = `<i class="ri-notification-3-fill"></i> ${msg}`;
    t.appendChild(d);
    setTimeout(() => d.remove(), 3000);
}
