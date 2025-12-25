// ==========================================
// 🖼️ IMAGE TOOLS MODULE (STABLE V36)
// ==========================================

// --- 1. MAGIC ERASER (BACKGROUND REMOVER) ---
const bgInput = document.getElementById('bg-input');

if (bgInput) {
    bgInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // UI Reset
        loader(true);
        const compareContainer = document.getElementById('compare-container');
        const dlBtn = document.getElementById('dl-bg-btn');
        
        if(compareContainer) compareContainer.classList.add('hidden');
        if(dlBtn) dlBtn.classList.add('hidden');

        // Create Object URL
        const imgUrl = URL.createObjectURL(file);
        const originalImg = document.getElementById('bg-original-img');
        if(originalImg) originalImg.src = imgUrl;

        try {
            // 1. Load Library Dynamically (Prevents Page Lag)
            const { removeBackground } = await import('https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.5/+esm');

            // 2. Configuration (CRITICAL FOR STABILITY)
            const config = {
                publicPath: "https://static.imgly.com/assets/data/background-removal-data/", // Fetch models from reliable CDN
                progress: (key, current, total) => {
                    const percent = Math.round((current / total) * 100);
                    // Optional: Show progress in console or toast
                    console.log(`AI Model Loading: ${percent}%`);
                },
                debug: false
            };

            // 3. Process Image
            // Blob conversion helps reduce memory usage
            const blob = await removeBackground(imgUrl, config);
            const processedUrl = URL.createObjectURL(blob);

            // 4. Update UI
            const resultImg = document.getElementById('bg-result-img');
            if(resultImg) resultImg.src = processedUrl;

            if(compareContainer) {
                compareContainer.classList.remove('hidden');
                // Reset slider
                const slider = document.querySelector('.slider');
                if(slider) {
                    slider.value = 50;
                    slideCompare(50);
                }
            }

            if(dlBtn) {
                dlBtn.classList.remove('hidden');
                dlBtn.onclick = () => {
                    const a = document.createElement('a');
                    a.href = processedUrl;
                    a.download = `NoBG_${Date.now()}.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    showToast("Downloaded Successfully!", "success");
                };
            }

            showToast("Background Removed!", "success");

        } catch (err) {
            console.error("BG Removal Error:", err);
            showToast("Error: Check Internet or try smaller image.", "error");
        } finally {
            loader(false);
        }
    });
}

// Slider Logic for Before/After
window.slideCompare = (val) => {
    const frontImg = document.getElementById('bg-original-img');
    if (frontImg) {
        frontImg.style.clipPath = `inset(0 ${100 - val}% 0 0)`;
    }
};


// --- 2. IMAGE COMPRESSOR ---
const imgInput = document.getElementById('img-input');

if(imgInput) {
    window.liveCompress = () => {
        if (!imgInput.files[0]) return showToast("Select an image first.", "error");

        loader(true);
        const file = imgInput.files[0];
        const qualityVal = document.getElementById('quality').value;
        const quality = parseFloat(qualityVal);

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                // Compress logic
                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

                // Update Preview
                const previewImg = document.getElementById('comp-prev');
                if(previewImg) {
                    previewImg.src = compressedDataUrl;
                    previewImg.style.display = "block";
                }

                // Size Calculation
                const originalSize = (file.size / 1024).toFixed(2);
                const compressedSize = (Math.round((compressedDataUrl.length - 22) * 3 / 4) / 1024).toFixed(2);

                showToast(`Saved: ${originalSize}KB → ${compressedSize}KB`, "success");

                // Auto Download Setup (Optional: Or make user click image)
                previewImg.onclick = () => {
                    const a = document.createElement('a');
                    a.href = compressedDataUrl;
                    a.download = `Compressed_${Date.now()}.jpg`;
                    a.click();
                };
                
                loader(false);
            };
        };
        
        reader.onerror = () => {
            loader(false);
            showToast("Error reading file.", "error");
        };
    };
}


// --- 3. PHOTO TO QR CODE (CLOUD API) ---
const qrInput = document.getElementById('qr-img-input');
const genQrBtn = document.getElementById('gen-qr-btn');

if (qrInput && genQrBtn) {
    genQrBtn.onclick = () => {
        if (!qrInput.files.length) return showToast("Select an image first.", "error");

        loader(true);
        const formData = new FormData();
        formData.append("image", qrInput.files[0]);

        // Free API Key (ImgBB) - Replace with your own if this hits limits
        const API_KEY = '6d207e02198a847aa98d0a2a901485a5';

        fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(result => {
            if (result.success) {
                const url = result.data.url;
                const qrContainer = document.getElementById('qrcode');
                
                if(qrContainer) {
                    qrContainer.innerHTML = ""; // Clear previous
                    
                    // Generate QR
                    new QRCode(qrContainer, {
                        text: url,
                        width: 160,
                        height: 160,
                        colorDark : "#000000",
                        colorLight : "#ffffff",
                        correctLevel : QRCode.CorrectLevel.H
                    });

                    // Add a download button below QR
                    setTimeout(() => {
                        const qrImg = qrContainer.querySelector("img");
                        if(qrImg) {
                            const btn = document.createElement("button");
                            btn.innerText = "Download QR";
                            btn.className = "glow-btn small";
                            btn.style.marginTop = "15px";
                            btn.onclick = () => {
                                const a = document.createElement("a");
                                a.href = qrImg.src;
                                a.download = "ScanMe.png";
                                a.click();
                            };
                            qrContainer.appendChild(btn);
                        }
                    }, 500);
                }
                showToast("QR Code Generated!", "success");
            } else {
                showToast("Upload Failed. Image too large?", "error");
            }
        })
        .catch(error => {
            console.error(error);
            showToast("Network Error. Check console.", "error");
        })
        .finally(() => {
            loader(false);
        });
    };
                      }
