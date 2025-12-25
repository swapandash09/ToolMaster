// SECURITY TOOLS

window.generatePass = () => {
    const length = document.getElementById('pass-len').value;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    
    // Secure Random Number Gen
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
        password += charset[array[i] % charset.length];
    }
    
    const display = document.getElementById('generated-pass');
    display.innerText = password;
    
    // Auto Copy logic (optional)
    navigator.clipboard.writeText(password);
    showToast("Password Copied to Clipboard!");
}
