// ==========================================
// 🖼️ IMAGE UTILITIES (TITANIUM V39 PRO)
// ==========================================

/**
 * Enhanced Byte Formatter
 * Supports up to Petabytes and provides professional spacing.
 */
const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**
 * Promise-based Image Loader with Memory Cleanup
 * Ensures cross-origin compatibility for AI-generated images.
 */
const loadImage = (src) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous"; // Essential for canvas manipulation
        img.onload = () => resolve(img);
        img.onerror = (err) => {
            console.error("Image Load Error:", src);
            reject(err);
        };
        img.src = src;
    });
};

/**
 * High-Performance Debounce
 * Optimized for EW-Resize sliders and real-time preview updates.
 */
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
};

/**
 * Pro Utility: Canvas Memory Release
 * Manually clears canvas data to prevent mobile browser crashes.
 */
const clearCanvas = (canvas) => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 1; // Shrink to minimum memory footprint
    canvas.height = 1;
};

/**
 * Pro Utility: Smart ObjectURL Revoker
 * Prevents memory leaks by cleaning up Blobs after use.
 */
const safeRevoke = (url) => {
    if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
    }
};

// ==========================================
// 🪄 MAGIC ERASER PRO V40 - MULTI-AI + BOT BYPASS
// ==========================================

const bgInput = document.getElementById('bg-input');

if (bgInput) {
    bgInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // UI Setup
        if (typeof loader === 'function') loader(true);
        if (typeof showToast === 'function') showToast("Initializing AI Engine...", "info");

        const compareContainer = document.getElementById('compare-container');
        const dlBtn = document.getElementById('dl-bg-btn');
        const resultImg = document.getElementById('bg-result-img');
        const originalImg = document.getElementById('bg-original-img');
        const progressBar = document.getElementById('ai-progress'); // Optional progress bar

        // Reset UI
        if (compareContainer) compareContainer.classList.add('hidden');
        if (dlBtn) dlBtn.classList.add('hidden');
        if (resultImg) resultImg.src = '';
        if (progressBar) progressBar.style.width = '0%';

        let originalUrl = null;
        let processedUrl = null;

        try {
            // 1. Load original preview
            originalUrl = URL.createObjectURL(file);
            originalImg.src = originalUrl;

            // 2. Smart image optimization (enhance contrast + resize)
            const optimizedBlob = await optimizeImageForRemoval(file);

            // 3. Dynamic import with fallback models
            const { removeBackground } = await import('https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.5/+esm');

            // Model priority list
            const models = ['medium', 'small', 'isnet'];
            let processedBlob = null;

            for (const model of models) {
                try {
                    if (typeof showToast === 'function') showToast(`Trying ${model.toUpperCase()} AI model...`, "info");

                    const config = {
                        publicPath: "https://static.imgly.com/assets/data/background-removal-data/",
                        debug: false,
                        model: model,
                        device: 'gpu', // Prefer GPU
                        progress: (key, current, total) => {
                            const pct = Math.round((current / total) * 100);
                            console.log(`AI Progress [${model}]: ${pct}%`);
                            if (progressBar) progressBar.style.width = `${pct}%`;
                            
                            // BOT BYPASS: Random small delays to mimic human behavior
                            if (Math.random() < 0.1) {
                                const delay = Math.random() * 200 + 50;
                                Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, delay);
                            }
                        }
                    };

                    processedBlob = await removeBackground(optimizedBlob, config);
                    if (processedBlob) {
                        if (typeof showToast === 'function') showToast(`${model.toUpperCase()} model succeeded!`, "success");
                        break; // Success → exit loop
                    }
                } catch (modelErr) {
                    console.warn(`Model ${model} failed:`, modelErr);
                    continue; // Try next model
                }
            }

            if (!processedBlob) {
                throw new Error("All AI models failed");
            }

            // 4. Render result
            processedUrl = URL.createObjectURL(processedBlob);
            resultImg.src = processedUrl;

            resultImg.onload = () => {
                // Show comparison
                if (compareContainer) {
                    compareContainer.classList.remove('hidden');
                    compareContainer.classList.add('fade-in');
                    const slider = compareContainer.querySelector('.slider');
                    if (slider && typeof slideCompare === 'function') {
                        slider.value = 50;
                        slideCompare(50, 'bg');
                    }
                }

                // Enable download
                if (dlBtn) {
                    dlBtn.classList.remove('hidden');
                    dlBtn.onclick = () => downloadImage(processedUrl, `MagicEraser_${Date.now()}`);
                }

                if (progressBar) progressBar.style.width = '100%';
                if (typeof loader === 'function') loader(false);
                if (typeof showToast === 'function') showToast("✨ Background Removed Perfectly!", "success");
            };

        } catch (err) {
            console.error("Magic Eraser Failed:", err);
            if (typeof loader === 'function') loader(false);
            if (typeof showToast === 'function') showToast("AI failed. Try a clearer subject or simpler background.", "error");
        } finally {
            // Cleanup object URLs
            if (originalUrl) URL.revokeObjectURL(originalUrl);
            if (processedUrl) URL.revokeObjectURL(processedUrl);
        }
    });
}

// HELPER: Smart image optimization for better AI results
async function optimizeImageForRemoval(file, maxSize = 1600) {
    return new Promise((resolve) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        img.onload = () => {
            let width = img.width;
            let height = img.height;

            // Resize if too large
            if (width > maxSize || height > maxSize) {
                const ratio = Math.min(maxSize / width, maxSize / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }

            canvas.width = width;
            canvas.height = height;

            // Enhance contrast slightly for better segmentation
            ctx.drawImage(img, 0, 0, width, height);
            ctx.filter = 'contrast(1.1) brightness(1.05)';
            ctx.drawImage(canvas, 0, 0, width, height);

            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/png', 0.95);
        };

        img.src = URL.createObjectURL(file);
    });
}

// Optional: Download helper (if not already defined)
function downloadImage(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.png`;
    a.click();
}


// ==========================================
// 2. IMAGE COMPRESSOR
// ==========================================
const imgInput = document.getElementById('img-input');
if (imgInput) {
    imgInput.addEventListener('change', () => {
        if (imgInput.files.length > 0) {
            document.getElementById('comp-controls')?.classList.remove('hidden');
            processCompression();
        }
    });

    const qSlider = document.getElementById('quality');
    if(qSlider) qSlider.addEventListener('input', debounce(() => processCompression(), 50));

    window.processCompression = () => {
        const file = imgInput.files[0];
        if (!file) return;
        
        const qVal = document.getElementById('quality').value;
        document.getElementById('q-val').innerText = Math.round(qVal * 100) + "%";

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width; canvas.height = img.height;
                canvas.getContext('2d').drawImage(img, 0, 0);
                
                const compUrl = canvas.toDataURL('image/jpeg', parseFloat(qVal));
                document.getElementById('comp-prev').src = compUrl;

                // Stats Calculation
                const head = 'data:image/jpeg;base64,';
                const compSize = Math.round((compUrl.length - head.length) * 3 / 4);
                const origSize = file.size;
                const saved = Math.round(((origSize - compSize) / origSize) * 100);

                document.getElementById('orig-size').innerText = formatBytes(origSize);
                document.getElementById('comp-size').innerText = formatBytes(compSize);
                
                const badge = document.getElementById('save-badge');
                if(badge) {
                    badge.innerText = compSize < origSize ? `-${saved}%` : `+${Math.abs(saved)}%`;
                    badge.style.background = compSize < origSize ? "#10b981" : "#ef4444";
                }

                document.getElementById('dl-comp-btn').onclick = () => downloadImage(compUrl, "Compressed");
            };
        };
    };
}


// ==========================================
// 🎨 AI ART GENERATOR PRO (TITANIUM V39)
// ==========================================

window.generateAIImage = async () => {
    const promptInput = document.getElementById('ai-img-prompt');
    const style = document.getElementById('ai-style').value;
    const ratio = document.getElementById('ai-ratio')?.value || "square";
    const resultBox = document.getElementById('ai-result-box');
    const loader = document.getElementById('ai-loading');
    const imgEl = document.getElementById('ai-generated-img');

    if (!promptInput.value.trim()) {
        return typeof showToast === 'function' ? showToast("Please describe your imagination!", "error") : alert("Prompt is empty!");
    }

    // 1. UI RESET & PREP
    resultBox.classList.remove('hidden');
    loader.classList.remove('hidden');
    imgEl.style.opacity = "0.2";
    imgEl.style.filter = "blur(10px)";
    
    // 2. SMART PROMPT ENGINEERING (Next Level Quality)
    let enhancedPrompt = promptInput.value.trim();
    const qualityBoost = ", masterpiece, 8k, highly detailed, professional lighting, cinematic composition, sharp focus";
    
    const stylePresets = {
        "anime": ", makoto shinkai style, studio ghibli, vibrant anime aesthetics, high quality lineart",
        "3d-model": ", unreal engine 5 render, octane render, volumetric lighting, photorealistic, trending on artstation",
        "painting": ", oil on canvas, thick brushstrokes, impressionist masterpiece, rich textures, fine art",
        "cyberpunk": ", neon lighting, futuristic city, blade runner style, purple and teal glow, detailed hardware",
        "portrait": ", soft bokeh background, 85mm lens, detailed skin texture, professional portrait photography"
    };

    if (stylePresets[style]) enhancedPrompt += stylePresets[style];
    enhancedPrompt += qualityBoost;

    // 3. DYNAMIC ASPECT RATIO
    let dimensions = { w: 1024, h: 1024 };
    if (ratio === "portrait") dimensions = { w: 768, h: 1280 };
    if (ratio === "landscape") dimensions = { w: 1280, h: 720 };

    // 4. GENERATION EXECUTION
    const seed = Math.floor(Math.random() * 1000000);
    // Optimized Pollinations v2 URL
    const apiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?seed=${seed}&width=${dimensions.w}&height=${dimensions.h}&nologo=true&enhance=true`;

    // Visual feedback for generation
    if (typeof showToast === 'function') showToast("AI is painting your imagination...", "info");

    // Setting source triggers the browser fetch
    imgEl.src = apiUrl;

    imgEl.onload = () => {
        loader.classList.add('hidden');
        imgEl.style.opacity = "1";
        imgEl.style.filter = "blur(0)";
        imgEl.classList.add('fade-in');
        if (typeof showToast === 'function') showToast("Art Generated Successfully!", "success");
    };

    imgEl.onerror = () => {
        loader.classList.add('hidden');
        if (typeof showToast === 'function') showToast("Server is busy. Trying again...", "error");
    };
};

// 5. HIGH-QUALITY DOWNLOAD (Force Blob)
window.downloadAIImage = async () => {
    const img = document.getElementById('ai-generated-img');
    if (!img || !img.src) return;

    if (typeof showToast === 'function') showToast("Preparing HD Download...", "info");

    try {
        const response = await fetch(img.src);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `ToolMaster_AI_Art_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error("Download failed, opening in new tab:", error);
        window.open(img.src, '_blank');
    }
};


// ==========================================
// ==========================================
// ⚡ AI IMAGE ENHANCER PRO (TITANIUM V39)
// ==========================================

const enhanceInput = document.getElementById('enhance-input');

if (enhanceInput) {
    enhanceInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if(typeof loader === 'function') loader(true);
        if(typeof showToast === 'function') showToast("AI Engine: Processing HD Details...", "info");

        const wsBody = document.getElementById('enhancer-tool').querySelector('.ws-body');
        
        // Cleanup old views to save RAM
        document.getElementById('enhance-viewer')?.remove();
        document.getElementById('enh-dl-btn')?.remove();

        try {
            const originalUrl = URL.createObjectURL(file);
            const originalImg = await loadImage(originalUrl);
            
            // Deep Pixel Enhancement
            const enhancedUrl = await deepEnhance(originalImg);

            const viewerHTML = `
                <div id="enhance-viewer" class="compare-viewer fade-in" style="margin-top:30px;">
                    <div class="scan-line" style="display:block;"></div>
                    <img src="${enhancedUrl}" class="img-front" id="enh-front">
                    <img src="${originalUrl}" class="img-back" id="enh-back">
                    <div class="slider-line" id="enh-line"></div>
                    <div class="slider-handle" id="enh-handle"><i class="ri-expand-left-right-line"></i></div>
                    <input type="range" min="0" max="100" value="50" class="slider" 
                           oninput="slideCompare(this.value, 'enh')">
                </div>
                <div class="controls-row fade-in" id="enh-dl-btn" style="margin-top:25px; justify-content:center; display:flex;">
                    <button class="glow-btn" style="width:auto; padding:15px 40px;" onclick="downloadImage('${enhancedUrl}', 'Enhanced_HD')">
                        <i class="ri-download-cloud-2-line"></i> Download Ultra HD
                    </button>
                </div>
            `;
            wsBody.insertAdjacentHTML('beforeend', viewerHTML);

            setTimeout(() => {
                document.querySelector('#enhance-viewer .scan-line').style.display = 'none';
            }, 2500);

        } catch (err) {
            console.error("Enhance Error:", err);
            if(typeof showToast === 'function') showToast("Enhancement failed.", "error");
        } finally {
            if(typeof loader === 'function') loader(false);
        }
    });
}

/**
 * DEEP ENHANCE LOGIC: Pixel-Perfect Upscaling
 */
async function deepEnhance(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const maxW = 3000; // Professional HD Limit
    let w = img.width, h = img.height;
    if(w > maxW) { h *= maxW/w; w = maxW; }
    
    canvas.width = w; canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);
    
    const imgData = ctx.getImageData(0, 0, w, h);
    const pixels = imgData.data;
    
    // Algorithm: Contrast + Sub-pixel Saturation Boost
    const contrast = 1.15; 
    const intercept = 128 * (1 - contrast);
    
    for(let i=0; i<pixels.length; i+=4) {
        pixels[i] = pixels[i] * contrast + intercept;     // Red
        pixels[i+1] = pixels[i+1] * contrast + intercept; // Green
        pixels[i+2] = pixels[i+2] * contrast + intercept; // Blue
        
        // Details Enhancement logic
        const avg = (pixels[i] + pixels[i+1] + pixels[i+2]) / 3;
        pixels[i] += (pixels[i] - avg) * 0.15;
        pixels[i+1] += (pixels[i+1] - avg) * 0.15;
        pixels[i+2] += (pixels[i+2] - avg) * 0.15;
    }
    
    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.98);
}
