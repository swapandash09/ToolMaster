// ==========================================
// 🔐 SECURITY TOOLS - TITANIUM V51 CORE
// ==========================================

console.log("Security Engine V51: Online");

window.generatePass = () => {
    const display = document.getElementById('generated-pass');
    if(!display) return;

    // 1. Configuration
    const length = document.getElementById('pass-len') ? parseInt(document.getElementById('pass-len').value) : 16;
    const useUpper = document.getElementById('pass-upper') ? document.getElementById('pass-upper').checked : true;
    const useNum = document.getElementById('pass-num') ? document.getElementById('pass-num').checked : true;
    const useSym = document.getElementById('pass-sym') ? document.getElementById('pass-sym').checked : true;

    // 2. Build Charset (Cryptographically Safe)
    const chars = {
        lower: "abcdefghijklmnopqrstuvwxyz",
        upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        num: "0123456789",
        sym: "!@#$%^&*()_+~`|}{[]:;?><,./-="
    };

    let charset = chars.lower;
    if (useUpper) charset += chars.upper;
    if (useNum) charset += chars.num;
    if (useSym) charset += chars.sym;

    // 3. Generate Secure Password
    let password = "";
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
        password += charset[array[i] % charset.length];
    }

    // 4. "Quantum" Decryption Effect (Animation)
    let iteration = 0;
    const originalText = password;
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*";
    
    // Stop any running intervals
    if(display.dataset.interval) clearInterval(display.dataset.interval);

    const interval = setInterval(() => {
        display.innerText = display.innerText
            .split("")
            .map((letter, index) => {
                if (index < iteration) {
                    return originalText[index];
                }
                return letters[Math.floor(Math.random() * 26)];
            })
            .join("");

        if (iteration >= length) {
            clearInterval(interval);
            display.innerText = originalText; // Ensure final accuracy
            calculateStrength(originalText);
        }

        iteration += 1 / 2; // Speed of decryption
    }, 30);
    
    display.dataset.interval = interval;
    
    // Auto-update length label if exists
    const lenLabel = document.getElementById('pass-len-val');
    if(lenLabel) lenLabel.innerText = length;
};

// --- 5. PASSWORD STRENGTH METER ---
function calculateStrength(password) {
    let strength = 0;
    const meter = document.getElementById('pass-strength-bar');
    const label = document.getElementById('pass-strength-text');
    
    if(!meter) return;

    if (password.length > 8) strength += 1;
    if (password.length > 12) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    // Visual Update
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6']; // Red, Orange, Green, Blue
    const labels = ['Weak', 'Moderate', 'Strong', 'Quantum Secure'];
    
    // Clamp
    const idx = Math.min(Math.max(strength - 1, 0), 3);
    const width = Math.min((strength / 5) * 100, 100);

    meter.style.width = `${width}%`;
    meter.style.background = colors[idx];
    meter.style.boxShadow = `0 0 10px ${colors[idx]}`;
    
    if(label) {
        label.innerText = labels[idx];
        label.style.color = colors[idx];
    }
}

// --- 6. CLIPBOARD HANDLER ---
window.copyPass = () => {
    const display = document.getElementById('generated-pass');
    if(!display || display.innerText === 'GENERATING...') return;
    
    navigator.clipboard.writeText(display.innerText).then(() => {
        showToast("Password Copied! 🔐", "success");
        
        // Visual Flash
        const originalColor = display.style.color;
        display.style.color = "#10b981"; // Success Green
        display.style.borderColor = "#10b981";
        setTimeout(() => {
            display.style.color = "";
            display.style.borderColor = "";
        }, 300);
    });
};

// Init on Load (if tool is active)
document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('generated-pass')) window.generatePass();
});
