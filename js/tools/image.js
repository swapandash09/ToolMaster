// ==========================================
// 🖼️ IMAGE TOOLS MODULE (TITANIUM V37)
// ==========================================

// --- 1. MAGIC ERASER (BACKGROUND REMOVER) ---
const bgInput = document.getElementById('bg-input');

if (bgInput) {
    bgInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if(typeof loader === 'function') loader(true);
        const compareContainer = document.getElementById('compare-container');
        const dlBtn = document.getElementById('dl-bg-btn');
        
        if(compareContainer) compareContainer.classList.add('hidden');
        if(dlBtn) dlBtn.classList.add('hidden');

        const originalPreview = document.getElementById('bg-original-img');
        if(originalPreview) originalPreview.src = URL.createObjectURL(file);

        try {
            const optimizedBlob = await resizeImage(file, 1500); 
            const { removeBackground } = await import('https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.5/+esm');
            
            const config = {
                publicPath: "https://static.imgly.com/assets/data/background-removal-data/",
                progress: (key, current, total) => console.log(`AI Loading: ${Math.round((current / total) * 100)}%`)
            };

            const blob = await removeBackground(optimizedBlob, config);
            const processedUrl = URL.createObjectURL(blob);

            const resultImg = document.getElementById('bg-result-img');
            if(resultImg) resultImg.src = processedUrl;

            if(compareContainer) {
                compareContainer.classList.remove('hidden');
                slideCompare(50);
            }

            if(dlBtn) {
                dlBtn.classList.remove('hidden');
                dlBtn.onclick = () => {
                    const a = document.createElement('a');
                    a.href = processedUrl;
                    a.download = `NoBG_${Date.now()}.png`;
                    a.click();
                };
            }
            if(typeof showToast === 'function') showToast("Background Removed!", "success");

        } catch (err) {
            console.error("AI Error:", err);
            if(typeof showToast === 'function') showToast("Error: Could not process image.", "error");
        } finally {
            if(typeof loader === 'function') loader(false);
        }
    });
}

function resizeImage(file, maxDimension) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width; let height = img.height;
            if (width > height) { if (width > maxDimension) { height *= maxDimension / width; width = maxDimension; } } 
            else { if (height > maxDimension) { width *= maxDimension / height; height = maxDimension; } }
            canvas.width = width; canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9);
        };
        img.onerror = reject;
    });
}

window.slideCompare = (val) => {
    const frontImg = document.getElementById('bg-original-img');
    if (frontImg) frontImg.style.clipPath = `inset(0 ${100 - val}% 0 0)`;
};


// --- 2. IMAGE COMPRESSOR ---
const imgInput = document.getElementById('img-input');
if (imgInput) {
    imgInput.addEventListener('change', () => {
        if (imgInput.files.length > 0) {
            document.getElementById('comp-controls')?.classList.remove('hidden');
            liveCompress();
        }
    });

    window.liveCompress = () => {
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
                const compressedDataUrl = canvas.toDataURL('image/jpeg', parseFloat(qualityVal));
                
                const previewImg = document.getElementById('comp-prev');
                if(previewImg) previewImg.src = compressedDataUrl;

                const origKB = (file.size / 1024);
                const compKB = (compressedDataUrl.length - 22) * 3 / 4 / 1024;
                let savedPercent = 0;
                if(origKB > compKB) savedPercent = Math.round(((origKB - compKB) / origKB) * 100);

                const origEl = document.getElementById('orig-size');
                const compEl = document.getElementById('comp-size');
                const badge = document.getElementById('save-badge');
                if(origEl) origEl.innerText = origKB.toFixed(1) + " KB";
                if(compEl) compEl.innerText = compKB.toFixed(1) + " KB";
                if(badge) {
                    badge.innerText = savedPercent > 0 ? `-${savedPercent}%` : "+0%";
                    badge.style.background = savedPercent > 0 ? "#10b981" : "#ef4444";
                }

                const dlBtn = document.getElementById('dl-comp-btn');
                if(dlBtn) {
                    dlBtn.onclick = () => {
                        const a = document.createElement('a');
                        a.href = compressedDataUrl;
                        a.download = `Compressed_${Date.now()}.jpg`;
                        a.click();
                        if(typeof showToast === 'function') showToast("Saved!", "success");
                    };
                }
            };
        };
    };
}


// --- 3. NEW: AI IMAGE GENERATOR (REPLACES QR) ---
window.generateAIImage = () => {
    const prompt = document.getElementById('ai-img-prompt').value;
    const style = document.getElementById('ai-style').value;
    
    if(!prompt) return showToast("Please describe the image first!", "error");
    
    // UI Update
    const resultBox = document.getElementById('ai-result-box');
    const loadingText = document.getElementById('ai-loading');
    const imgElement = document.getElementById('ai-generated-img');
    
    resultBox.classList.remove('hidden');
    loadingText.classList.remove('hidden');
    imgElement.style.opacity = "0.3";
    
    // Construct Prompt with Style
    let finalPrompt = prompt;
    if(style === "anime") finalPrompt += ", anime style, vibrant colors, studio ghibli";
    if(style === "3d-model") finalPrompt += ", 3d render, unreal engine 5, octane render, 8k";
    if(style === "painting") finalPrompt += ", digital painting, artstation, concept art";
    
    // Use Pollinations.ai API (Free, No Key)
    const encodedPrompt = encodeURIComponent(finalPrompt);
    const seed = Math.floor(Math.random() * 10000); // Randomize every time
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${seed}&width=1024&height=1024&nologo=true`;
    
    imgElement.src = url;
    
    imgElement.onload = () => {
        loadingText.classList.add('hidden');
        imgElement.style.opacity = "1";
        showToast("Image Generated!", "success");
    };
    
    imgElement.onerror = () => {
        loadingText.classList.add('hidden');
        showToast("Generation Failed. Try a simpler prompt.", "error");
    };
}

window.downloadAIImage = () => {
    const img = document.getElementById('ai-generated-img');
    if(img && img.src) {
        // Create a temporary link to force download
        fetch(img.src)
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `AI_Art_${Date.now()}.jpg`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            });
    }
                }
