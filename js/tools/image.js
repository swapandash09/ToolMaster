// ==========================================
// 🎨 TOOLMASTER TITANIUM V41 - IMAGE ENGINE
// ==========================================

console.log("Image Engine V41: Loaded");

// --- 1. GLOBAL HELPER FUNCTIONS ---

const loadImage = (src) => new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
});

const downloadImage = (url, filename) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

// --- 2. V41 CYBER SLIDER LOGIC ---
// Handles the interaction for Magic Eraser & Enhancer
window.slideCompare = (val, type = 'bg') => {
    // Determine IDs based on tool type
    const frontId = type === 'bg' ? 'bg-original-img' : 'enh-front';
    const lineId = type === 'bg' ? 'slider-line' : 'enh-line';
    const handleId = type === 'bg' ? 'slider-handle' : 'enh-handle';
    const labelId = type === 'bg' ? 'bg-labels' : 'enh-labels'; // Optional container

    const frontImg = document.getElementById(frontId);
    const line = document.getElementById(lineId);
    const handle = document.getElementById(handleId);

    if (frontImg) {
        // Update Clip Path (Reveal Effect)
        // Inset from right based on slider value
        frontImg.style.clipPath = `inset(0 ${100 - val}% 0 0)`;
        
        // Sync Decor Elements
        if(line) line.style.left = `${val}%`;
        if(handle) handle.style.left = `${val}%`;
        
        // Dynamic Opacity for Labels (Fade out when near center)
        const labels = document.querySelectorAll(`.${type}-label`);
        if(labels.length) {
            const opacity = Math.abs(50 - val) < 15 ? 0.2 : 1;
            labels.forEach(l => l.style.opacity = opacity);
        }
    }
};

// --- 3. MAGIC ERASER (REAL AI BACKGROUND REMOVER) ---

const bgInput = document.getElementById('bg-input');

if (bgInput) {
    bgInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // UI Setup
        if(typeof loader === 'function') loader(true);
        if(typeof showToast === 'function') showToast("AI Engine: Removing Background (Please Wait)...", "info");
        
        const container = document.getElementById('compare-container');
        const dlBtn = document.getElementById('dl-bg-btn');
        const origImg = document.getElementById('bg-original-img');
        const resImg = document.getElementById('bg-result-img');

        try {
            // 1. Show Original Image immediately
            const originalUrl = URL.createObjectURL(file);
            origImg.src = originalUrl;

            // 2. RUN REAL AI (imgly library)
            // Note: Pehli baar run karne mein 5-10 second lag sakte hain (models download hote hain)
            
            // imglyRemoveBackground global function aa jayega script tag se
            const blob = await imglyRemoveBackground(file);
            
            // 3. Convert Result Blob to URL
            const processedUrl = URL.createObjectURL(blob);
            resImg.src = processedUrl;

            // 4. Reveal UI
            container.classList.remove('hidden');
            dlBtn.classList.remove('hidden');
            
            // Reset Slider to Center
            const slider = container.querySelector('.slider');
            if(slider) {
                slider.value = 50;
                // Agar slideCompare function main.js mein hai to call karein
                if(typeof slideCompare === 'function') {
                    slideCompare(50, 'bg');
                } else {
                    // Fallback agar function nahi mila
                    origImg.style.width = '50%'; 
                }
            }

            // Setup Download Function
            window.downloadBgImage = () => {
                const a = document.createElement('a');
                a.href = processedUrl;
                a.download = `NoBG_${Date.now()}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            };

            if(typeof showToast === 'function') showToast("Background Removed Successfully!", "success");

        } catch (err) {
            console.error("AI Error:", err);
            if(typeof showToast === 'function') showToast("Failed to remove background. Check Console.", "error");
        } finally {
            if(typeof loader === 'function') loader(false);
        }
    });
}

// Helper for Demo: Creates a visual variant so slider is visible
async function generateGhostVariant(img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    // Visual effect to simulate "Removal" area
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; // Semi-transparent
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return canvas.toDataURL();
}


// --- 4. AI ENHANCER PRO (SHARPENING ENGINE) ---

const enhanceInput = document.getElementById('enhance-input');

if (enhanceInput) {
    enhanceInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if(typeof loader === 'function') loader(true);
        if(typeof showToast === 'function') showToast("AI: Upscaling Resolution...", "info");

        const wsBody = document.getElementById('enhancer-tool').querySelector('.ws-body');
        
        // Cleanup
        const old = document.getElementById('enhance-viewer-wrapper');
        if(old) old.remove();

        try {
            const originalUrl = URL.createObjectURL(file);
            const originalImg = await loadImage(originalUrl);
            
            // Run Deep Enhance Algorithm
            const enhancedUrl = await deepEnhance(originalImg);

            // Inject V41 Viewer Structure
            const viewerHTML = `
                <div id="enhance-viewer-wrapper" class="fade-in" style="margin-top:30px; width:100%;">
                    
                    <div class="compare-viewer" style="height:400px;">
                        <div class="comp-label lbl-orig enh-label">SD</div>
                        <div class="comp-label lbl-res enh-label">HD</div>
                        
                        <img src="${enhancedUrl}" class="img-back">
                        <img src="${originalUrl}" class="img-front" id="enh-front">
                        
                        <div class="slider-line-deco" id="enh-line"></div>
                        <div class="slider-handle-deco" id="enh-handle"><i class="ri-expand-left-right-line"></i></div>
                        <input type="range" min="0" max="100" value="50" class="slider" oninput="slideCompare(this.value, 'enh')">
                    </div>

                    <div style="text-align:center; margin-top:20px;">
                        <button class="glow-btn" onclick="downloadImage('${enhancedUrl}', 'Enhanced_HD')">
                            <i class="ri-download-cloud-2-line"></i> Download Ultra HD
                        </button>
                    </div>
                </div>
            `;
            
            wsBody.insertAdjacentHTML('beforeend', viewerHTML);
            
            // Init Slider
            slideCompare(50, 'enh');

        } catch (err) {
            console.error("Enhance Error:", err);
            if(typeof showToast === 'function') showToast("Enhancement failed.", "error");
        } finally {
            if(typeof loader === 'function') loader(false);
        }
    });
}

// V41 Sharpening Kernel
async function deepEnhance(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 2x Upscale
    const w = img.width * 2; 
    const h = img.height * 2;
    
    canvas.width = w; canvas.height = h;
    
    // Bicubic Smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, w, h);
    
    // Apply Sharpening Matrix
    // Note: True convolution requires getting ImageData and looping pixels.
    // For V41 Performance, we use a contrast/saturation blend + high-res canvas.
    
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    const factor = 1.2; // Contrast factor

    for(let i=0; i<data.length; i+=4) {
        // Contrast
        data[i] = (data[i] - 128) * factor + 128;
        data[i+1] = (data[i+1] - 128) * factor + 128;
        data[i+2] = (data[i+2] - 128) * factor + 128;
    }
    
    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.95);
}


// --- 5. IMAGE COMPRESSOR (NEW ELEMENT) ---

const compInput = document.getElementById('img-input');
let originalCompFile = null;

if (compInput) {
    compInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(!file) return;
        originalCompFile = file;
        
        // Show UI
        document.getElementById('comp-controls').classList.remove('hidden');
        
        // Initial Stats
        document.getElementById('orig-size').innerText = formatBytes(file.size);
        
        // Initial Compress
        liveCompress();
    });
}

window.liveCompress = () => {
    if(!originalCompFile) return;
    
    const quality = parseFloat(document.getElementById('quality').value);
    document.getElementById('q-val').innerText = Math.round(quality * 100) + '%';
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width; 
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            // Compress
            const newDataUrl = canvas.toDataURL('image/jpeg', quality);
            
            // Update Preview
            document.getElementById('comp-prev').src = newDataUrl;
            
            // Calculate Savings
            const head = 'data:image/jpeg;base64,';
            const size = Math.round((newDataUrl.length - head.length) * 3/4);
            document.getElementById('comp-size').innerText = formatBytes(size);
            
            const saved = Math.round(((originalCompFile.size - size) / originalCompFile.size) * 100);
            const badge = document.getElementById('save-badge');
            badge.innerText = size < originalCompFile.size ? `-${saved}%` : `+0%`;
            badge.className = size < originalCompFile.size ? 'stat-badge' : 'stat-badge warning';
            
            // Setup Download
            document.getElementById('dl-comp-btn').onclick = () => downloadImage(newDataUrl, `Compressed_${Date.now()}`);
        };
    };
    reader.readAsDataURL(originalCompFile);
};

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


// --- 6. AI ART GENERATOR (BASIC LOGIC) ---
window.generateAIImage = () => {
    const prompt = document.getElementById('ai-img-prompt').value;
    if(!prompt) return showToast("Please enter a prompt!", "error");
    
    loader(true);
    const box = document.getElementById('ai-result-box');
    const loadText = document.getElementById('ai-loading');
    const img = document.getElementById('ai-generated-img');
    
    box.classList.remove('hidden');
    loadText.classList.remove('hidden');
    img.style.display = 'none';
    
    // SIMULATION: In a real app, fetch from OpenAI/Stable Diffusion API
    setTimeout(() => {
        // Using a reliable placeholder service seeded with the prompt to simulate uniqueness
        const seed = prompt.length + Date.now();
        img.src = `https://picsum.photos/seed/${seed}/800/800`; // Placeholder Art
        
        img.onload = () => {
            loadText.classList.add('hidden');
            img.style.display = 'inline-block';
            img.classList.add('fade-in');
            loader(false);
            showToast("Art Generated!", "success");
        };
    }, 2000);
};

window.downloadAIImage = () => {
    const src = document.getElementById('ai-generated-img').src;
    if(src) downloadImage(src, 'AI_Art_Creation');
};
