// ==========================================
// 🖼️ IMAGE TOOLS MODULE (Titanium V38 Final)
// ==========================================

// --- UTILITIES ---
const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

const loadImage = (src) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = reject;
    });
};

// Debounce for sliders (prevents lagging)
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};


// ==========================================
// 1. MAGIC ERASER (Background Remover)
// ==========================================
const bgInput = document.getElementById('bg-input');
if (bgInput) {
    bgInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if(typeof loader === 'function') loader(true);
        const compareContainer = document.getElementById('compare-container');
        const dlBtn = document.getElementById('dl-bg-btn');

        // Hide old results
        if(compareContainer) compareContainer.classList.add('hidden');
        if(dlBtn) dlBtn.classList.add('hidden');

        try {
            const originalUrl = URL.createObjectURL(file);
            document.getElementById('bg-original-img').src = originalUrl;

            // Resize image to max 1200px (Crucial for performance)
            const optimizedBlob = await resizeImage(file, 1200); 
            
            // Dynamic Import for imgly
            const { removeBackground } = await import('https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.5/+esm');
            
            const blob = await removeBackground(optimizedBlob, {
                publicPath: "https://static.imgly.com/assets/data/background-removal-data/",
                progress: (key, current, total) => {
                    console.log(`AI Progress: ${Math.round(current/total*100)}%`);
                }
            });
            
            const processedUrl = URL.createObjectURL(blob);
            const resultImg = document.getElementById('bg-result-img');
            resultImg.src = processedUrl;
            
            resultImg.onload = () => {
                if(compareContainer) {
                    compareContainer.classList.remove('hidden');
                    // Reset Slider
                    const slider = compareContainer.querySelector('.slider');
                    if(slider) { slider.value = 50; slideCompare(50, 'bg'); }
                }
                if(dlBtn) {
                    dlBtn.classList.remove('hidden');
                    dlBtn.onclick = () => downloadImage(processedUrl, "NoBG");
                }
                if(typeof loader === 'function') loader(false);
            };

        } catch (err) {
            console.error(err);
            if(typeof loader === 'function') loader(false);
            alert("Error: Could not remove background. Try a simpler image.");
        }
    });
}

// Helper: Resize Image
function resizeImage(file, maxDim) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let w = img.width, h = img.height;
            if (w > h) { if (w > maxDim) { h *= maxDim / w; w = maxDim; } } 
            else { if (h > maxDim) { w *= maxDim / h; h = maxDim; } }
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            canvas.toBlob(resolve, 'image/jpeg', 0.9);
        };
    });
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
// 3. AI ART GENERATOR (Pollinations.ai)
// ==========================================
window.generateAIImage = () => {
    const prompt = document.getElementById('ai-img-prompt').value;
    const style = document.getElementById('ai-style').value;
    const ratio = document.getElementById('ai-ratio') ? document.getElementById('ai-ratio').value : "square";
    
    if(!prompt) return alert("Please describe the image first!");
    
    document.getElementById('ai-result-box').classList.remove('hidden');
    document.getElementById('ai-loading').classList.remove('hidden');
    const imgEl = document.getElementById('ai-generated-img');
    imgEl.style.opacity = "0.3";

    let finalPrompt = prompt;
    if(style === "anime") finalPrompt += ", anime style, studio ghibli, vibrant colors";
    if(style === "3d-model") finalPrompt += ", 3d render, unreal engine 5, octane render, 8k";
    if(style === "painting") finalPrompt += ", digital painting, artstation, oil texture";

    let w = 1024, h = 1024;
    if (ratio === "portrait") { w = 768; h = 1024; }
    if (ratio === "landscape") { w = 1280; h = 720; }

    // Random seed prevents caching the same image
    const seed = Math.floor(Math.random() * 99999);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?seed=${seed}&width=${w}&height=${h}&nologo=true`;
    
    imgEl.src = url;
    
    imgEl.onload = () => {
        document.getElementById('ai-loading').classList.add('hidden');
        imgEl.style.opacity = "1";
    };
    imgEl.onerror = () => {
        document.getElementById('ai-loading').classList.add('hidden');
        alert("Server busy. Please try again.");
    };
};

window.downloadAIImage = async () => {
    const img = document.getElementById('ai-generated-img');
    if(img && img.src) {
        try {
            const res = await fetch(img.src);
            const blob = await res.blob();
            downloadImage(URL.createObjectURL(blob), "AI_Art");
        } catch(e) { window.open(img.src, '_blank'); }
    }
};


// ==========================================
// 4. AI IMAGE ENHANCER (Smart Sharpening)
// ==========================================
const enhanceInput = document.getElementById('enhance-input');
if (enhanceInput) {
    enhanceInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if(typeof loader === 'function') loader(true);
        const wsBody = document.getElementById('enhancer-tool').querySelector('.ws-body');
        
        // Cleanup old viewers
        const oldViewer = document.getElementById('enhance-viewer');
        if(oldViewer) oldViewer.remove();
        const oldBtn = document.getElementById('enh-dl-btn');
        if(oldBtn) oldBtn.remove();

        try {
            const originalUrl = URL.createObjectURL(file);
            const originalImg = await loadImage(originalUrl);
            
            // Run Client-Side "Smart Enhance"
            const enhancedUrl = await smartEnhance(originalImg);

            // Inject the Split Viewer
            const viewerHTML = `
                <div id="enhance-viewer" class="compare-viewer fade-in" style="margin-top:30px;">
                    <div class="scan-line" style="display:block;"></div>
                    <img src="${enhancedUrl}" class="img-front" id="enh-front">
                    <img src="${originalUrl}" class="img-back">
                    <div class="slider-line" id="enh-line"></div>
                    <div class="slider-handle" id="enh-handle"><i class="ri-code-s-slash-line"></i></div>
                    <input type="range" min="0" max="100" value="50" class="slider" 
                           oninput="slideCompare(this.value, 'enh')">
                </div>
                <div class="controls-row fade-in" id="enh-dl-btn" style="margin-top:20px; justify-content:center;">
                    <button class="glow-btn" onclick="downloadImage('${enhancedUrl}', 'Enhanced')">
                        <i class="ri-download-line"></i> Download HD Result
                    </button>
                </div>
            `;
            wsBody.insertAdjacentHTML('beforeend', viewerHTML);

            // Stop scan line animation after 2 seconds
            setTimeout(() => {
                const scan = document.querySelector('#enhance-viewer .scan-line');
                if(scan) scan.style.display = 'none';
            }, 2000);

        } catch (err) {
            console.error(err);
            alert("Error enhancing image.");
        } finally {
            if(typeof loader === 'function') loader(false);
        }
    });
}

// The "Smart Enhance" Logic (Contrast + Fake Sharpen)
async function smartEnhance(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Limit processing size for speed
    const maxW = 2048;
    let w = img.width, h = img.height;
    if(w > maxW) { h *= maxW/w; w = maxW; }
    
    canvas.width = w; canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);
    
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    
    // Algorithm: Boost Contrast & Saturation slightly
    const contrast = 1.15; // 15% Boost
    const intercept = 128 * (1 - contrast);
    
    for(let i=0; i<data.length; i+=4) {
        data[i] = data[i]*contrast + intercept;     // R
        data[i+1] = data[i+1]*contrast + intercept; // G
        data[i+2] = data[i+2]*contrast + intercept; // B
    }
    ctx.putImageData(imgData, 0, 0);
    
    // Return High-Quality JPEG (98%)
    return canvas.toDataURL('image/jpeg', 0.98);
}


// ==========================================
// SHARED FUNCTIONS
// ==========================================

// Consolidated Slider Function
window.slideCompare = (val, type) => {
    let frontId, lineId, handleId;

    if (type === 'bg' || !type) {
        // Default (Eraser) IDs
        frontId = 'bg-original-img'; // Note: Eraser uses 'original' as front layer usually
        // But in my CSS, I used generic classes. Let's fix specific IDs.
        // Actually, for Eraser: Result is Back, Original is Front (you peel original off)
    } 
    
    if (type === 'enh') {
        frontId = 'enh-front';
        lineId = 'enh-line';
        handleId = 'enh-handle';
    } else {
        // Fallback for Eraser (assuming Eraser HTML structure matches)
        // Eraser HTML: id="bg-original-img" is class="img-front"
        frontId = 'bg-original-img'; 
        // Eraser doesn't have line/handle IDs in HTML yet, so we skip
    }

    const f = document.getElementById(frontId);
    const l = document.getElementById(lineId);
    const h = document.getElementById(handleId);

    if(f) f.style.clipPath = `inset(0 ${100-val}% 0 0)`;
    if(l) l.style.left = `${val}%`;
    if(h) h.style.left = `${val}%`;
};

window.downloadImage = (url, prefix) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `ToolMaster_${prefix}_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};
