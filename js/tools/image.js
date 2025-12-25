// ==========================================
// 🖼️ IMAGE TOOLS MODULE (FINAL STABLE VERSION)
// ==========================================

// --- 1. MAGIC ERASER (BACKGROUND REMOVER) ---
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

        // Show Original (Preview)
        const originalPreview = document.getElementById('bg-original-img');
        if(originalPreview) originalPreview.src = URL.createObjectURL(file);

        try {
            // STEP 1: Optimize Image (Resize if too big to prevent crash)
            // Shrink to max 1500px width/height
            const optimizedBlob = await resizeImage(file, 1500); 

            // STEP 2: Load AI Library
            const { removeBackground } = await import('https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.5/+esm');

            // STEP 3: Config (Force CDN for Models)
            const config = {
                publicPath: "https://static.imgly.com/assets/data/background-removal-data/",
                progress: (key, current, total) => {
                    console.log(`Downloading AI: ${Math.round((current / total) * 100)}%`);
                }
            };

            // STEP 4: Process Optimized Image
            const blob = await removeBackground(optimizedBlob, config);
            const processedUrl = URL.createObjectURL(blob);

            // Update Result UI
            const resultImg = document.getElementById('bg-result-img');
            if(resultImg) resultImg.src = processedUrl;

            // Show Slider & Download
            if(compareContainer) {
                compareContainer.classList.remove('hidden');
                const slider = document.querySelector('.slider');
                if(slider) { 
                    slider.value = 50; 
                    slideCompare(50); // Reset position
                }
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
                    if(typeof showToast === 'function') showToast("Downloaded Successfully!", "success");
                };
            }

            if(typeof showToast === 'function') showToast("Background Removed!", "success");

        } catch (err) {
            console.error("AI Error:", err);
            let msg = "Error: Could not process image.";
            if(err.message && err.message.includes("fetch")) msg = "Network Error: Models failed to load.";
            if(typeof showToast === 'function') showToast(msg, "error");
        } finally {
            if(typeof loader === 'function') loader(false);
        }
    });
}

// Helper: Smart Image Resizer (Prevents Browser Crash)
function resizeImage(file, maxDimension) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Calculate new size keeping aspect ratio
            if (width > height) {
                if (width > maxDimension) {
                    height *= maxDimension / width;
                    width = maxDimension;
                }
            } else {
                if (height > maxDimension) {
                    width *= maxDimension / height;
                    height = maxDimension;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Convert back to Blob (JPEG for speed)
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg', 0.9);
        };
        img.onerror = reject;
    });
}

// Slider Logic for Magic Eraser
window.slideCompare = (val) => {
    const frontImg = document.getElementById('bg-original-img');
    if (frontImg) {
        frontImg.style.clipPath = `inset(0 ${100 - val}% 0 0)`;
    }
};


// --- 2. IMAGE COMPRESSOR (LIVE PREVIEW) ---
window.liveCompress = () => {
    const input = document.getElementById('img-input');
    if(!input || !input.files[0]) return showToast("Select an image first.", "error");
    
    if(typeof loader === 'function') loader(true);
    
    const quality = parseFloat(document.getElementById('quality').value);
    const file = input.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            // Compress
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            
            // Show Preview
            const previewImg = document.getElementById('comp-prev');
            if(previewImg) {
                previewImg.src = compressedDataUrl;
                
                // Click to Download
                previewImg.onclick = () => {
                     const a = document.createElement('a');
                     a.href = compressedDataUrl;
                     a.download = `Compressed_${Date.now()}.jpg`;
                     a.click();
                };
            }
            
            // Calculate Stats
            const originalSize = (file.size / 1024).toFixed(2); // KB
            // Base64 length approx size calculation
            const compressedSize = (Math.round((compressedDataUrl.length - 22) * 3 / 4) / 1024).toFixed(2); 
            
            if(typeof showToast === 'function') showToast(`Compressed: ${originalSize}KB → ${compressedSize}KB`, "success");
            if(typeof loader === 'function') loader(false);
        };
    };
    reader.readAsDataURL(file);
}


// --- 3. PHOTO TO QR CODE (WITH DOWNLOAD) ---
const qrInput = document.getElementById('qr-img-input');
const genQrBtn = document.getElementById('gen-qr-btn');

if (qrInput && genQrBtn) {
    genQrBtn.onclick = () => {
        if(!qrInput.files.length) return showToast("Select an image first.", "error");
        
        if(typeof loader === 'function') loader(true);
        const formData = new FormData();
        formData.append("image", qrInput.files[0]);
        
        // Free ImgBB API Key
        const API_KEY = '6d207e02198a847aa98d0a2a901485a5'; 
        
        fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(result => {
            if(result.success) {
                const url = result.data.url;
                const qrContainer = document.getElementById('qrcode');
                
                if(qrContainer) {
                    qrContainer.innerHTML = ""; // Clear old QR
                    
                    // Generate QR
                    new QRCode(qrContainer, {
                        text: url,
                        width: 150,
                        height: 150,
                        colorDark : "#000000",
                        colorLight : "#ffffff",
                        correctLevel : QRCode.CorrectLevel.H
                    });
                    
                    // Add Download Button
                    setTimeout(() => {
                        const qrImg = qrContainer.querySelector('img');
                        if(qrImg) {
                            const dlBtn = document.createElement('button');
                            dlBtn.innerText = "Download QR";
                            dlBtn.className = "glow-btn small";
                            dlBtn.style.marginTop = "15px";
                            dlBtn.onclick = () => {
                                const a = document.createElement('a');
                                a.href = qrImg.src;
                                a.download = "Photo_QR.png";
                                a.click();
                            };
                            qrContainer.appendChild(dlBtn);
                        }
                    }, 500);
                }

                if(typeof showToast === 'function') showToast("QR Code Generated!", "success");
            } else {
                if(typeof showToast === 'function') showToast("Upload Failed. Try smaller image.", "error");
            }
        })
        .catch(err => {
            console.error(err);
            if(typeof showToast === 'function') showToast("Network Error.", "error");
        })
        .finally(() => {
            if(typeof loader === 'function') loader(false);
        });
    };
}
