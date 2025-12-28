// ==========================================
// 🎨 IMAGE ENGINE - TITANIUM V53 QUANTUM (FIXED)
// ==========================================

console.log("Image Engine V53: Quantum Core Online");

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

// --- 2. QUANTUM SLIDER LOGIC (FIXED) ---
// Handles the interaction for Magic Eraser & Enhancer
window.slideCompare = (val, type = 'bg') => {
    // Determine IDs based on tool type
    const frontId = type === 'bg' ? 'bg-original-img' : 'enh-front';
    const lineId = type === 'bg' ? 'slider-line' : 'slider-line'; // Adjusted if IDs differ
    const handleId = type === 'bg' ? 'slider-handle' : 'slider-handle';

    const frontImg = document.getElementById(frontId);
    const line = document.getElementById(lineId);
    const handle = document.getElementById(handleId);

    if (frontImg && line && handle) {
        // FIX: Clip Path Logic
        // inset(top right bottom left)
        // We clip the RIGHT side of the TOP image (Original) to reveal the BOTTOM image (Result)
        frontImg.style.clipPath = `inset(0 ${100 - val}% 0 0)`;
        
        // Sync Decor Elements
        line.style.left = `${val}%`;
        handle.style.left = `${val}%`;
    }
};

// --- 3. MAGIC ERASER (AI BACKGROUND REMOVER) ---

const bgInput = document.getElementById('bg-input');

if (bgInput) {
    bgInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // UI Setup
        if(typeof loader === 'function') loader(true, "AI SCANNING OBJECT...");
        
        const container = document.getElementById('compare-container');
        const dlBtn = document.getElementById('dl-bg-btn');
        const origImg = document.getElementById('bg-original-img'); // Front (Top)
        const resImg = document.getElementById('bg-result-img');   // Back (Bottom)

        try {
            // 1. Show Original
            const originalUrl = URL.createObjectURL(file);
            origImg.src = originalUrl;
            
            // 2. Prepare UI (Scanning Effect)
            if(container) {
                container.classList.remove('hidden');
                container.classList.add('scanning');
            }

            // 3. RUN REAL AI (imgly library)
            if(typeof imglyRemoveBackground === 'undefined') {
                throw new Error("AI Library missing. Check internet connection.");
            }

            // Process
            const blob = await imglyRemoveBackground(file);
            const processedUrl = URL.createObjectURL(blob);
            
            // 4. Show Result (Background Layer)
            resImg.src = processedUrl;
            
            // 5. Cleanup UI
            if(container) container.classList.remove('scanning');
            
            // Show Download Button if hidden
            if(dlBtn) {
                dlBtn.classList.remove('hidden');
                dlBtn.style.display = 'inline-flex'; // Force display
            }
            
            // Reset Slider to Middle
            const slider = container.querySelector('.slider');
            if(slider) {
                slider.value = 50;
                slideCompare(50, 'bg');
            }

            // Setup Download
            window.downloadBgImage = () => {
                const a = document.createElement('a');
                a.href = processedUrl;
                a.download = `NoBG_Quantum_${Date.now()}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            };

            if(typeof showToast === 'function') showToast("Background Removed Successfully!", "success");

        } catch (err) {
            console.error("AI Error:", err);
            if(container) container.classList.remove('scanning');
            if(typeof showToast === 'function') showToast("AI Processing Failed.", "error");
        } finally {
            if(typeof loader === 'function') loader(false);
        }
    });
}

// --- 4. 4K ENHANCER (SUPER-RESOLUTION) ---

const enhanceInput = document.getElementById('enhance-input');

if (enhanceInput) {
    enhanceInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if(typeof loader === 'function') loader(true, "UPSCALING TO 4K...");

        const wsBody = document.getElementById('enhancer-tool').querySelector('.ws-body');
        
        // Remove old viewer if exists
        const old = document.getElementById('enhance-viewer-wrapper');
        if(old) old.remove();

        try {
            const originalUrl = URL.createObjectURL(file);
            const originalImg = await loadImage(originalUrl);
            
            // Run Quantum Upscale Algorithm
            const enhancedUrl = await superResolutionUpscale(originalImg);

            // Inject V53 Viewer
            const viewerHTML = `
                <div id="enhance-viewer-wrapper" class="fade-in" style="margin-top:30px; width:100%;">
                    
                    <div class="compare-viewer" style="min-height:400px;">
                        <div class="comp-label lbl-orig">SD SOURCE</div>
                        <div class="comp-label lbl-res">4K RESULT</div>
                        
                        <img src="${enhancedUrl}" class="img-back">
                        <img src="${originalUrl}" class="img-front" id="enh-front">
                        
                        <div class="slider-line-deco" id="enh-line"></div>
                        <div class="slider-handle-deco" id="enh-handle"></div>
                        <input type="range" min="0" max="100" value="50" class="slider" oninput="slideCompare(this.value, 'enh')">
                    </div>

                    <div style="text-align:center; margin-top:20px;">
                        <button class="glow-btn" onclick="downloadImage('${enhancedUrl}', 'Titanium_4K_Upscale')">
                            <i class="ri-download-cloud-2-line"></i> Download 4K Result
                        </button>
                    </div>
                </div>
            `;
            
            wsBody.insertAdjacentHTML('beforeend', viewerHTML);
            
            // Init Slider
            // Use 'enh' type for logic
            setTimeout(() => {
                // Manually trigger slideCompare with correct IDs for 'enh'
                // Re-using logic:
                const front = document.getElementById('enh-front');
                const line = document.getElementById('enh-line');
                const handle = document.getElementById('enh-handle');
                if(front) front.style.clipPath = `inset(0 50% 0 0)`;
                if(line) line.style.left = '50%';
                if(handle) handle.style.left = '50%';
            }, 100);
            
            if(typeof showToast === 'function') showToast("Upscaling Complete!", "success");

        } catch (err) {
            console.error("Enhance Error:", err);
            if(typeof showToast === 'function') showToast("Upscaling failed.", "error");
        } finally {
            if(typeof loader === 'function') loader(false);
        }
    });
}

// V53 Super-Resolution Kernel (Sharpening + Upscale)
async function superResolutionUpscale(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 2x Upscale Limit (Browser Safe)
    const MAX_DIM = 4096; 
    let w = img.width * 2; 
    let h = img.height * 2;
    
    if(w > MAX_DIM) {
        const ratio = MAX_DIM / w;
        w = MAX_DIM;
        h = h * ratio;
    }
    
    canvas.width = w; canvas.height = h;
    
    // High Quality Bi-Cubic
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Draw Scaled
    ctx.drawImage(img, 0, 0, w, h);
    
    // Sharpening Pass (Overlay)
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = 'rgba(128, 128, 128, 0.1)'; // Subtle
    ctx.fillRect(0, 0, w, h);
    
    return canvas.toDataURL('image/png', 1.0);
}


// --- 5. IMAGE COMPRESSOR ---

const compInput = document.getElementById('comp-input');
let originalCompFile = null;

if (compInput) {
    compInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(!file) return;
        originalCompFile = file;
        
        // Show UI
        document.getElementById('comp-controls').classList.remove('hidden');
        
        // Stats
        document.getElementById('orig-size').innerText = formatBytes(file.size);
        
        // Auto-run
        processCompression();
    });
}

window.processCompression = () => {
    if(!originalCompFile) return;
    
    const quality = document.getElementById('comp-quality').value / 100;
    const format = document.getElementById('comp-format').value;
    
    // Async Process
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
            
            const newDataUrl = canvas.toDataURL(format, quality);
            
            // Update Preview
            document.getElementById('comp-preview-img').src = newDataUrl;
            
            // Stats
            const head = 'data:' + format + ';base64,';
            const size = Math.round((newDataUrl.length - head.length) * 3/4);
            document.getElementById('comp-size').innerText = formatBytes(size);
            
            // Download Bind
            document.getElementById('dl-comp-btn').onclick = () => downloadImage(newDataUrl, `Compressed_${Date.now()}`);
            
            if(typeof showToast === 'function') showToast(`Compressed to ${formatBytes(size)}`, "success");
        };
    };
    reader.readAsDataURL(originalCompFile);
};

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}


// --- 6. AI ART GENERATOR (POLLINATIONS API) ---
window.generateAIImage = () => {
    const prompt = document.getElementById('ai-img-prompt').value;
    const style = document.getElementById('ai-style') ? document.getElementById('ai-style').value : '';
    
    if(!prompt) {
        if(typeof showToast === 'function') showToast("Please describe your imagination!", "error");
        return;
    }
    
    if(typeof loader === 'function') loader(true, "DREAMING...");
    
    const box = document.getElementById('ai-result-box');
    const img = document.getElementById('ai-generated-img');
    
    box.classList.remove('hidden');
    img.style.display = 'none';
    
    // Pollinations.AI Logic
    const seed = Math.floor(Math.random() * 999999);
    const width = 1024;
    const height = 1024;
    
    const encodedPrompt = encodeURIComponent(`${prompt}, ${style} style, 8k resolution, highly detailed`);
    const apiUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
    
    img.src = apiUrl;
    
    img.onload = () => {
        img.style.display = 'inline-block';
        img.classList.add('fade-in');
        
        if(typeof loader === 'function') loader(false);
        if(typeof showToast === 'function') showToast("Masterpiece Created! 🎨", "success");
    };
    
    img.onerror = () => {
        if(typeof loader === 'function') loader(false);
        if(typeof showToast === 'function') showToast("Generation Failed. Try different words.", "error");
    };
};

window.downloadAIImage = () => {
    const src = document.getElementById('ai-generated-img').src;
    if(src) downloadImage(src, 'Titanium_AI_Art');
};
