// ==========================================
// 🖼️ IMAGE TOOLS MODULE (TITANIUM V38 - PRO)
// ==========================================

// --- UTILITIES ---
const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Debounce Function (Prevents lagging when sliding sliders)
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};


// --- 1. MAGIC ERASER (BACKGROUND REMOVER AI) ---
const bgInput = document.getElementById('bg-input');

if (bgInput) {
    bgInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // UI Reset
        if(typeof loader === 'function') loader(true);
        const compareContainer = document.getElementById('compare-container');
        const dlBtn = document.getElementById('dl-bg-btn');
        if(compareContainer) compareContainer.classList.add('hidden');
        if(dlBtn) dlBtn.classList.add('hidden');

        // Show Original Preview
        const originalPreview = document.getElementById('bg-original-img');
        if(originalPreview) originalPreview.src = URL.createObjectURL(file);

        try {
            if(typeof showToast === 'function') showToast("Loading AI Model (Approx 40MB)...", "info");

            // 1. Optimize Image before sending to AI (Speeds up processing by 5x)
            const optimizedBlob = await resizeImage(file, 1500); 

            // 2. Dynamic Import (Lazy Load)
            const { removeBackground } = await import('https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.5/+esm');
            
            // 3. Configuration
            const config = {
                publicPath: "https://static.imgly.com/assets/data/background-removal-data/",
                progress: (key, current, total) => {
                    // Optional: You can update a progress bar here
                    console.log(`AI Progress: ${key} - ${Math.round((current / total) * 100)}%`);
                },
                debug: false,
                device: 'gpu' // Tries to use WebGPU/WebGL first
            };

            // 4. Run AI
            const blob = await removeBackground(optimizedBlob, config);
            const processedUrl = URL.createObjectURL(blob);

            // 5. Show Result
            const resultImg = document.getElementById('bg-result-img');
            if(resultImg) {
                resultImg.src = processedUrl;
                resultImg.onload = () => {
                     if(typeof loader === 'function') loader(false);
                }
            }

            // 6. Enable UI
            if(compareContainer) {
                compareContainer.classList.remove('hidden');
                slideCompare(50); // Reset slider to middle
            }

            if(dlBtn) {
                dlBtn.classList.remove('hidden');
                dlBtn.onclick = () => {
                    const a = document.createElement('a');
                    a.href = processedUrl;
                    a.download = `ToolMaster_NoBG_${Date.now()}.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                };
            }
            if(typeof showToast === 'function') showToast("Background Removed Successfully!", "success");

        } catch (err) {
            console.error("AI Engine Error:", err);
            if(typeof loader === 'function') loader(false);
            if(typeof showToast === 'function') showToast("Error: Failed to load AI model. Check internet connection.", "error");
        }
    });
}

// Helper: Resize image to prevent crashing browser memory
function resizeImage(file, maxDimension) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width; let height = img.height;
            
            // Calculate Aspect Ratio
            if (width > height) { 
                if (width > maxDimension) { height *= maxDimension / width; width = maxDimension; } 
            } else { 
                if (height > maxDimension) { width *= maxDimension / height; height = maxDimension; } 
            }
            
            canvas.width = width; canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Return high quality blob
            canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.95);
        };
        img.onerror = reject;
    });
}

// Global Slider Function
window.slideCompare = (val) => {
    const frontImg = document.getElementById('bg-original-img');
    const sliderLine = document.querySelector('.slider-line'); // Ensure you have this in CSS/HTML if you want a visual line
    
    if (frontImg) frontImg.style.clipPath = `inset(0 ${100 - val}% 0 0)`;
    // Optional: Move a slider handle if you have one
    if (sliderLine) sliderLine.style.left = `${val}%`;
};


// --- 2. IMAGE COMPRESSOR (WITH DEBOUNCE & ACCURATE MATH) ---
const imgInput = document.getElementById('img-input');
const qualitySlider = document.getElementById('quality');

if (imgInput) {
    imgInput.addEventListener('change', () => {
        if (imgInput.files.length > 0) {
            document.getElementById('comp-controls')?.classList.remove('hidden');
            processCompression(); // Run immediately on file select
        }
    });

    // Add listener to slider with Debounce (Wait 100ms after sliding stops)
    if(qualitySlider) {
        qualitySlider.addEventListener('input', debounce(() => {
            processCompression();
        }, 100));
    }

    window.processCompression = () => {
        const file = imgInput.files[0];
        if (!file) return;
        
        const qualityVal = document.getElementById('quality').value;
        const qLabel = document.getElementById('q-val');
        if(qLabel) qLabel.innerText = Math.round(qualityVal * 100) + "%";

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width; canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                // Compress
                const compressedDataUrl = canvas.toDataURL('image/jpeg', parseFloat(qualityVal));
                
                // Update Preview
                const previewImg = document.getElementById('comp-prev');
                if(previewImg) previewImg.src = compressedDataUrl;

                // Accurate Size Calculation
                const head = 'data:image/jpeg;base64,';
                const imageSize = Math.round((compressedDataUrl.length - head.length) * 3 / 4);
                
                const origSize = file.size;
                const savedBytes = origSize - imageSize;
                const savedPercent = Math.round((savedBytes / origSize) * 100);

                // Update UI Stats
                const origEl = document.getElementById('orig-size');
                const compEl = document.getElementById('comp-size');
                const badge = document.getElementById('save-badge');
                
                if(origEl) origEl.innerText = formatBytes(origSize);
                if(compEl) compEl.innerText = formatBytes(imageSize);
                
                if(badge) {
                    if (imageSize < origSize) {
                        badge.innerText = `-${savedPercent}%`;
                        badge.style.background = "#10b981"; // Green
                    } else {
                        badge.innerText = `+${Math.abs(savedPercent)}%`;
                        badge.style.background = "#ef4444"; // Red (File got bigger)
                    }
                }

                // Setup Download
                const dlBtn = document.getElementById('dl-comp-btn');
                if(dlBtn) {
                    dlBtn.onclick = () => {
                        const a = document.createElement('a');
                        a.href = compressedDataUrl;
                        a.download = `Compressed_${Date.now()}.jpg`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        if(typeof showToast === 'function') showToast("Image Saved!", "success");
                    };
                }
            };
        };
    };
}


// --- 3. AI IMAGE GENERATOR (UPGRADED: ASPECT RATIO) ---
window.generateAIImage = () => {
    const prompt = document.getElementById('ai-img-prompt').value;
    const style = document.getElementById('ai-style').value;
    
    // Check if aspect ratio dropdown exists, else default to square
    const ratioEl = document.getElementById('ai-ratio'); 
    const ratio = ratioEl ? ratioEl.value : "square"; 
    
    if(!prompt) return showToast("Please describe the image first!", "error");
    
    // UI Update
    const resultBox = document.getElementById('ai-result-box');
    const loadingText = document.getElementById('ai-loading');
    const imgElement = document.getElementById('ai-generated-img');
    
    resultBox.classList.remove('hidden');
    loadingText.classList.remove('hidden');
    imgElement.style.opacity = "0.3";
    
    // 1. Construct Enhanced Prompt
    let finalPrompt = prompt;
    if(style === "anime") finalPrompt += ", anime style, vibrant colors, studio ghibli, detailed";
    if(style === "3d-model") finalPrompt += ", 3d render, unreal engine 5, octane render, 8k, ray tracing";
    if(style === "painting") finalPrompt += ", digital painting, artstation, concept art, oil painting texture";
    if(style === "realistic") finalPrompt += ", photorealistic, 4k, canon eos, cinematic lighting";
    if(style === "cyberpunk") finalPrompt += ", cyberpunk, neon lights, futuristic city, blade runner style";
    
    // 2. Determine Dimensions based on Aspect Ratio
    let width = 1024;
    let height = 1024;
    
    if (ratio === "portrait") { width = 768; height = 1024; }
    if (ratio === "landscape") { width = 1280; height = 720; }

    // 3. API Call (Pollinations.ai)
    const encodedPrompt = encodeURIComponent(finalPrompt);
    const seed = Math.floor(Math.random() * 99999);
    
    // nologo=true removes the watermark
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${seed}&width=${width}&height=${height}&nologo=true&model=flux`;
    
    imgElement.src = url;
    
    imgElement.onload = () => {
        loadingText.classList.add('hidden');
        imgElement.style.opacity = "1";
        showToast("AI Image Generated!", "success");
    };
    
    imgElement.onerror = () => {
        loadingText.classList.add('hidden');
        showToast("Server Busy. Try again in 5 seconds.", "error");
    };
}

window.downloadAIImage = async () => {
    const img = document.getElementById('ai-generated-img');
    if(img && img.src) {
        try {
            if(typeof showToast === 'function') showToast("Preparing Download...", "info");
            
            // Fetch blob to avoid CORS issues
            const response = await fetch(img.src);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `ToolMaster_AI_${Date.now()}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
        } catch (e) {
            console.error(e);
            // Fallback for some browsers
            window.open(img.src, '_blank');
        }
    }
}
