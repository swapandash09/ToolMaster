/* ==========================================
   🎨 IMAGE ENGINE - TITANIUM V54 NEURAL CORE
   ========================================== */

console.log("%c Image Engine V54: Neural Core Online ", "background: #6366f1; color: white; padding: 4px; border-radius: 4px;");

const ImageEngine = {
    
    // --- 1. CORE UTILITIES ---
    
    state: {
        compressFile: null,
        debounceTimer: null
    },

    utils: {
        load: (src) => new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => resolve(img);
            img.onerror = (e) => reject(e);
            img.src = src;
        }),

        download: (url, filename) => {
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        },

        formatBytes: (bytes, decimals = 2) => {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
        },

        // Prevents lag when dragging sliders
        debounce: (func, wait) => {
            return (...args) => {
                clearTimeout(ImageEngine.state.debounceTimer);
                ImageEngine.state.debounceTimer = setTimeout(() => func.apply(this, args), wait);
            };
        }
    },

    // --- 2. UNIVERSAL SLIDER LOGIC ---
    
    /**
     * Handles the Before/After Slider Logic
     * @param {number} val - Slider value (0-100)
     * @param {string} type - 'bg' or 'enh'
     */
    handleSlider: (val, type) => {
        // Dynamic ID selection based on tool type
        const config = {
            'bg':  { front: 'bg-removed',  line: 'bg-line-deco',  handle: 'bg-handle-deco' },
            'enh': { front: 'enh-processed', line: 'enh-line-deco', handle: 'enh-handle-deco' }
        };

        const ids = config[type];
        if (!ids) return;

        const frontImg = document.getElementById(ids.front); // The Top Image
        const line = document.getElementById(ids.line);
        const handle = document.getElementById(ids.handle);

        requestAnimationFrame(() => {
            // 1. Clip the Top Image (The Result) to reveal Bottom Image (Original)
            // inset(top right bottom left) -> We cut from the RIGHT
            if(frontImg) frontImg.style.clipPath = `inset(0 ${100 - val}% 0 0)`;
            
            // 2. Move Decor Elements
            if(line) line.style.left = `${val}%`;
            if(handle) handle.style.left = `${val}%`;
        });
    },

    // --- 3. MAGIC ERASER (BG REMOVAL) ---

    initBgRemover: () => {
        const input = document.getElementById('bg-in');
        if (!input) return;

        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // UI Feedback
            if(typeof loader === 'function') loader(true, "AI ANALYZING SCENE...");
            const editor = document.getElementById('bg-editor');
            
            try {
                // 1. Setup Preview
                const originalUrl = URL.createObjectURL(file);
                document.getElementById('bg-original').src = originalUrl;
                
                // 2. Check for Library
                if (typeof imglyRemoveBackground === 'undefined') {
                    throw new Error("AI Engine (imgly) not loaded. Check internet.");
                }

                // 3. Process
                const blob = await imglyRemoveBackground(file);
                const processedUrl = URL.createObjectURL(blob);
                
                // 4. Update UI
                const resImg = document.getElementById('bg-removed');
                resImg.src = processedUrl;
                resImg.style.clipPath = `inset(0 50% 0 0)`; // Reset Slider
                
                editor.classList.remove('hidden');
                
                // Reset Slider Input
                const slider = editor.querySelector('.slider');
                if(slider) slider.value = 50;

                // Bind Download
                const dlBtn = editor.querySelector('.glow-btn');
                dlBtn.onclick = () => ImageEngine.utils.download(processedUrl, `NoBG_${Date.now()}`);

                if(typeof showToast === 'function') showToast("Background Removed!", "success");

            } catch (err) {
                console.error("BG Removal Error:", err);
                if(typeof showToast === 'function') showToast("AI Failed: " + err.message, "error");
            } finally {
                if(typeof loader === 'function') loader(false);
            }
        });
    },

    // --- 4. 4K ENHANCER (Convolution Sharpening) ---

    initEnhancer: () => {
        const input = document.getElementById('enh-in');
        if (!input) return;

        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if(typeof loader === 'function') loader(true, "UPSCALING PIXELS...");
            const editor = document.getElementById('enh-editor');

            try {
                const originalUrl = URL.createObjectURL(file);
                const imgObj = await ImageEngine.utils.load(originalUrl);
                
                // RUN ADVANCED UPSCALING
                const enhancedUrl = await ImageEngine.processors.smartUpscale(imgObj);

                // Update UI
                document.getElementById('enh-original').src = originalUrl;
                const resImg = document.getElementById('enh-processed');
                resImg.src = enhancedUrl;
                resImg.style.clipPath = `inset(0 50% 0 0)`; // Reset Slider

                editor.classList.remove('hidden');
                
                // Reset Slider
                const slider = editor.querySelector('.slider');
                if(slider) slider.value = 50;

                // Bind Download
                const dlBtn = editor.querySelector('.glow-btn');
                dlBtn.onclick = () => ImageEngine.utils.download(enhancedUrl, `Titanium_4K_${Date.now()}`);

                if(typeof showToast === 'function') showToast("Image Upscaled to 4K", "success");

            } catch (err) {
                console.error("Enhancer Error:", err);
                if(typeof showToast === 'function') showToast("Upscaling Failed.", "error");
            } finally {
                if(typeof loader === 'function') loader(false);
            }
        });
    },

    processors: {
        // High-Quality Upscale + Sharpen Kernel
        smartUpscale: async (img) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Limit to 4K max to prevent crash
            const MAX_DIM = 3840; 
            let w = img.width * 2; 
            let h = img.height * 2;
            
            if(w > MAX_DIM) {
                const ratio = MAX_DIM / w;
                w = MAX_DIM; h = h * ratio;
            }

            canvas.width = w; canvas.height = h;

            // 1. Bi-Cubic Resizing
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, w, h);

            // 2. Convolution Sharpening (The "Magic")
            // This pulls out edges to make it look "Higher Resolution"
            const imageData = ctx.getImageData(0, 0, w, h);
            const sharpened = ImageEngine.processors.applySharpenFilter(imageData);
            ctx.putImageData(sharpened, 0, 0);

            // 3. Slight Contrast Boost
            ctx.globalCompositeOperation = 'overlay';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'; // Brighten slightly
            ctx.fillRect(0, 0, w, h);

            return canvas.toDataURL('image/png', 0.9);
        },

        // Kernel: [0, -1, 0, -1, 5, -1, 0, -1, 0]
        applySharpenFilter: (pixels) => {
            const data = pixels.data;
            const w = pixels.width;
            const h = pixels.height;
            const mix = 0.5; // Strength (0.0 - 1.0)

            // Copy original buffer
            const copy = new Uint8ClampedArray(data);

            for (let y = 1; y < h - 1; y++) {
                for (let x = 1; x < w - 1; x++) {
                    const i = (y * w + x) * 4;
                    
                    // Simple Sharpen Kernel Calculation
                    // Center * 5 - (Up + Down + Left + Right)
                    const r = 5 * copy[i] 
                              - copy[i - w * 4] - copy[i + w * 4] 
                              - copy[i - 4] - copy[i + 4];
                    
                    const g = 5 * copy[i + 1] 
                              - copy[i - w * 4 + 1] - copy[i + w * 4 + 1] 
                              - copy[i - 4 + 1] - copy[i + 4 + 1];
                    
                    const b = 5 * copy[i + 2] 
                              - copy[i - w * 4 + 2] - copy[i + w * 4 + 2] 
                              - copy[i - 4 + 2] - copy[i + 4 + 2];

                    // Blend processed with original
                    data[i]     = data[i] * (1 - mix) + r * mix;
                    data[i + 1] = data[i + 1] * (1 - mix) + g * mix;
                    data[i + 2] = data[i + 2] * (1 - mix) + b * mix;
                }
            }
            return pixels;
        }
    },

    // --- 5. AI ART GENERATOR ---
    
    generateArt: () => {
        const prompt = document.getElementById('art-prompt').value;
        const style = document.getElementById('art-style').value;
        const widthVal = document.getElementById('art-ratio').value;
        
        // Calculate Height based on Ratio
        // 1024 = Square, 768 = Portrait (requires taller height), 1280 = Landscape (requires shorter height)
        let w = parseInt(widthVal);
        let h = w === 1024 ? 1024 : (w === 768 ? 1280 : 720);

        if(!prompt) return alert("Please enter a prompt!");

        const btn = document.querySelector('#ai-art-tool .glow-btn');
        const originalBtnText = btn.innerText;
        btn.innerText = "Dreaming...";
        btn.disabled = true;

        // Using Pollinations AI
        const seed = Math.floor(Math.random() * 10000);
        const encoded = encodeURIComponent(`${prompt}, ${style} style, 8k masterpiece`);
        const url = `https://image.pollinations.ai/prompt/${encoded}?width=${w}&height=${h}&seed=${seed}&nologo=true`;

        const img = document.getElementById('generated-art-img');
        const box = document.getElementById('art-result');

        img.onload = () => {
            btn.innerText = originalBtnText;
            btn.disabled = false;
            box.classList.remove('hidden');
            box.scrollIntoView({ behavior: 'smooth' });
        };
        img.onerror = () => {
            alert("AI Generation failed. Try different words.");
            btn.innerText = originalBtnText;
            btn.disabled = false;
        };
        
        img.src = url;
    }
};

// --- GLOBAL BRIDGE (Needed for HTML 'oninput' events) ---
window.ImageTool = {
    handleBG: (inp) => { /* Event listener handles this now, keeping for legacy safety */ },
    handleEnhance: (inp) => { /* Event listener handles this now */ },
    slideBG: (val) => ImageEngine.handleSlider(val, 'bg'),
    slideEnhance: (val) => ImageEngine.handleSlider(val, 'enh')
};

// --- INITIALIZE ---
document.addEventListener('DOMContentLoaded', () => {
    ImageEngine.initBgRemover();
    ImageEngine.initEnhancer();
});
