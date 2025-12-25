// ==========================================
// 🖼️ IMAGE TOOLS MODULE (TITANIUM UPGRADE)
// ==========================================

// 1. MAGIC ERASER (BACKGROUND REMOVER - FIXED)
const bgInput = document.getElementById('bg-input');
if(bgInput) {
    bgInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if(!file) return;

        // UI Updates
        loader(true); // Show spinner
        document.getElementById('compare-container').classList.add('hidden');
        document.getElementById('dl-bg-btn').classList.add('hidden');
        
        const img = new Image();
        img.src = URL.createObjectURL(file);
        
        img.onload = async () => {
            // Set Original Image
            document.getElementById('bg-original-img').src = img.src;

            try {
                // Dynamic Import for Performance
                const { removeBackground } = await import('https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.5/+esm');
                
                // CRITICAL FIX: Config to load AI Models from CDN correctly
                // This fixes the issue where background removal stops at 0% or fails
                const config = {
                    publicPath: "https://static.imgly.com/assets/data/background-removal-data/",
                    progress: (key, current, total) => {
                        // Optional: You can update a progress bar here
                        console.log(`Downloading AI Model: ${Math.round((current/total)*100)}%`);
                    }
                };

                // Process Image
                const blob = await removeBackground(img.src, config);
                const processedUrl = URL.createObjectURL(blob);
                
                // Update Result Image
                document.getElementById('bg-result-img').src = processedUrl;
                
                // Show Interface
                document.getElementById('compare-container').classList.remove('hidden');
                const dlBtn = document.getElementById('dl-bg-btn');
                dlBtn.classList.remove('hidden');
                
                // Setup Download Button
                dlBtn.onclick = () => {
                    const a = document.createElement('a');
                    a.href = processedUrl;
                    a.download = 'ToolMaster_NoBG.png';
                    a.click();
                    showToast("Image Downloaded Successfully!");
                };

                // Initialize Slider Position
                document.querySelector('.slider').value = 50;
                slideCompare(50);
                
                showToast("Background Removed Successfully!");

            } catch(err) {
                console.error("BG Removal Error:", err);
                showToast("Error: Could not process image. Try a smaller file.");
            } finally {
                loader(false); // Hide spinner
            }
        };
    });
}

// Function for Slider Comparison logic
window.slideCompare = (val) => {
    const frontImg = document.getElementById('bg-original-img');
    if(frontImg) {
        frontImg.style.clipPath = `inset(0 ${100 - val}% 0 0)`;
    }
}


// 2. IMAGE COMPRESSOR (Live Preview & Size Check)
window.liveCompress = () => {
    const input = document.getElementById('img-input');
    if(!input || !input.files[0]) return showToast("Please upload an image first.");
    
    loader(true);
    
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
            previewImg.src = compressedDataUrl;
            
            // Calculate Size Saving
            const originalSize = file.size / 1024; // KB
            const compressedSize = Math.round((compressedDataUrl.length * 3 / 4) / 1024); // Approx KB
            
            showToast(`Compressed: ${Math.round(originalSize)}KB → ${compressedSize}KB`);
            
            // Enable Download by clicking image or adding a button if you wish
            previewImg.onclick = () => {
                 const a = document.createElement('a');
                 a.href = compressedDataUrl;
                 a.download = `Compressed_${Date.now()}.jpg`;
                 a.click();
                 showToast("Downloaded!");
            };
            
            loader(false);
        };
    };
    reader.readAsDataURL(file);
}


// 3. QR CODE GENERATOR (With Download)
// Using Cloud API to get a URL for the image, then generating QR
const qrInput = document.getElementById('qr-img-input');

if(qrInput) {
    document.getElementById('gen-qr-btn').onclick = () => {
        if(!qrInput.files.length) return showToast("Select an image first.");
        
        loader(true);
        const formData = new FormData();
        formData.append("image", qrInput.files[0]);
        
        // Use ImgBB for hosting (Free Key)
        // Note: For production, use your own backend or API key
        const IMGBB_KEY = '6d207e02198a847aa98d0a2a901485a5'; 
        
        fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(result => {
            if(result.success) {
                const url = result.data.url;
                const qrContainer = document.getElementById('qrcode');
                qrContainer.innerHTML = ""; // Clear old QR
                
                // Generate QR
                new QRCode(qrContainer, {
                    text: url,
                    width: 150,
                    height: 150
                });
                
                // Add Download Button for QR
                setTimeout(() => {
                    const qrImg = qrContainer.querySelector('img');
                    if(qrImg) {
                        const dlBtn = document.createElement('button');
                        dlBtn.innerText = "Download QR";
                        dlBtn.className = "glow-btn small";
                        dlBtn.style.marginTop = "10px";
                        dlBtn.onclick = () => {
                            const a = document.createElement('a');
                            a.href = qrImg.src;
                            a.download = "Photo_QR.png";
                            a.click();
                        };
                        qrContainer.appendChild(dlBtn);
                    }
                }, 500);

                showToast("QR Code Generated!");
            } else {
                showToast("Upload Failed. Try a smaller image.");
            }
        })
        .catch(err => {
            console.error(err);
            showToast("Network Error.");
        })
        .finally(() => loader(false));
    };
}
