// ==========================================
// 📄 PDF ENGINE - TITANIUM V52 STABLE
// ==========================================

console.log("PDF Engine V52: Stable Core Online");

// --- 1. PDF TO EXCEL (Smart Semantic Extraction) ---
window.convertPDFtoExcel = async () => {
    const input = document.getElementById('pdf-to-ex-input');
    if (!input || !input.files.length) return showToast("Select a PDF file first.", "error");
    
    if(typeof loader === 'function') loader(true, "INITIALIZING QUANTUM CORE...");
    
    try {
        const fileReader = new FileReader();
        fileReader.onload = async function() {
            const typedArray = new Uint8Array(this.result);
            
            // Init PDF.js
            const pdf = await pdfjsLib.getDocument(typedArray).promise;
            const wb = XLSX.utils.book_new(); 
            let totalItemsProcessed = 0;
            
            for (let i = 1; i <= pdf.numPages; i++) {
                if(typeof loader === 'function') loader(true, `ANALYZING PAGE ${i}/${pdf.numPages}...`);
                
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                
                // Check if page is scanned (Image based)
                if (content.items.length === 0) {
                    console.warn(`Page ${i} appears to be empty or scanned.`);
                    continue;
                }
                totalItemsProcessed += content.items.length;

                // --- V52 SMART ROW GROUPING ---
                const rows = {};
                const Y_TOLERANCE = 5; // Increased slightly for better line detection
                
                content.items.forEach(item => {
                    const y = Math.round(item.transform[5]); // Round Y for better grouping
                    const x = item.transform[4];
                    
                    // Find existing row within tolerance
                    let matchedY = Object.keys(rows).find(key => Math.abs(key - y) < Y_TOLERANCE);
                    
                    if (!matchedY) {
                        matchedY = y;
                        rows[matchedY] = [];
                    }
                    rows[matchedY].push({ x: x, text: item.str });
                });

                // Sort Rows (Top to Bottom) - PDF coords: 0,0 is bottom-left usually, but transform[5] handles it
                const sortedY = Object.keys(rows).sort((a,b) => b - a); 
                
                const sheetData = [];
                sortedY.forEach(y => {
                    // Sort Columns (Left to Right)
                    const rowItems = rows[y].sort((a,b) => a.x - b.x);
                    const rowText = rowItems.map(item => item.text.trim()).filter(t => t.length > 0);
                    if(rowText.length > 0) sheetData.push(rowText);
                });

                if(sheetData.length > 0) {
                    const ws = XLSX.utils.aoa_to_sheet(sheetData);
                    XLSX.utils.book_append_sheet(wb, ws, `Page_${i}`);
                }
            }
            
            if (totalItemsProcessed === 0) {
                showToast("Warning: This PDF seems to be scanned (Images only). No text found.", "error");
            } else {
                XLSX.writeFile(wb, `Titanium_Export_${Date.now()}.xlsx`);
                showToast("Excel Extraction Complete!", "success");
            }
            
            if(typeof loader === 'function') loader(false);
        };
        fileReader.readAsArrayBuffer(input.files[0]);

    } catch(e) { 
        console.error("PDF-Excel Error:", e);
        showToast("Extraction Failed. Is file valid?", "error"); 
        if(typeof loader === 'function') loader(false); 
    }
};

// --- 2. JPG TO PDF (Auto-Rotate & Fit) ---
window.convertJpgToPdf = () => {
    const input = document.getElementById('jpg-input');
    if (!input || !input.files.length) return showToast("Select images first.", "error");
    
    if(typeof loader === 'function') loader(true, "COMPOSING PDF...");
    
    const doc = new window.jspdf.jsPDF({
        orientation: 'p', 
        unit: 'mm', 
        format: 'a4',
        compress: true 
    });
    
    const files = Array.from(input.files);
    
    const processImage = (index) => {
        if (index >= files.length) {
            doc.save(`Titanium_Binder_${Date.now()}.pdf`);
            if(typeof loader === 'function') loader(false);
            if(typeof showToast === 'function') showToast("PDF Created Successfully!", "success");
            return;
        }

        if(typeof loader === 'function') loader(true, `PROCESSING IMAGE ${index + 1}/${files.length}`);

        const file = files[index];
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            
            img.onload = () => {
                const isLandscape = img.width > img.height;
                
                if (index > 0) doc.addPage();
                
                doc.setPage(index + 1);
                if (isLandscape) {
                    doc.deletePage(index + 1); 
                    doc.addPage('a4', 'landscape');
                }
                
                const pageWidth = doc.internal.pageSize.getWidth(); 
                const pageHeight = doc.internal.pageSize.getHeight(); 
                
                const margin = 10; 
                const maxW = pageWidth - (margin * 2);
                const maxH = pageHeight - (margin * 2);

                const imgRatio = img.width / img.height;
                const pageRatio = maxW / maxH;

                let finalW, finalH;

                if (imgRatio > pageRatio) {
                    finalW = maxW;
                    finalH = maxW / imgRatio;
                } else {
                    finalH = maxH;
                    finalW = maxH * imgRatio;
                }

                const x = (pageWidth - finalW) / 2;
                const y = (pageHeight - finalH) / 2;

                // Use 'FAST' compression for speed
                doc.addImage(img, 'JPEG', x, y, finalW, finalH, undefined, 'FAST');
                
                // Memory Cleanup
                img.src = ""; 
                processImage(index + 1);
            };
        };
        reader.readAsDataURL(file);
    };

    processImage(0);
};

// --- 3. PDF TO JPG (4K Render) ---
window.convertPdfToJpg = async () => {
    // Detect Input ID dynamically (handles duplicates)
    const input = document.getElementById('pdf-jpg-input') || document.getElementById('pdf-to-ex-input');
    const grid = document.getElementById('image-grid-preview') || document.getElementById('jpg-preview-grid'); 
    
    // Explicit ID check for "JPG to PDF" tool if separate
    const targetGrid = document.querySelector('#jpg-pdf-tool .ws-body');

    if (!input || !input.files.length) return showToast("Select a PDF file.", "error");
    
    if(typeof loader === 'function') loader(true, "STARTING RENDER ENGINE...");
    
    // Create grid if missing
    let displayGrid = grid;
    if(!displayGrid && targetGrid) {
        displayGrid = document.createElement('div');
        displayGrid.className = 'image-grid-preview';
        targetGrid.appendChild(displayGrid);
    }
    if(displayGrid) displayGrid.innerHTML = ''; 

    try {
        const fileReader = new FileReader();
        fileReader.onload = async function() {
            const typedArray = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument(typedArray).promise;
            
            for (let i = 1; i <= pdf.numPages; i++) {
                if(typeof loader === 'function') loader(true, `RENDERING 4K PAGE ${i}/${pdf.numPages}`);
                
                const page = await pdf.getPage(i);
                
                // Scale 2.5 is balanced for 4K / Performance
                const viewport = page.getViewport({ scale: 2.5 });
                
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                
                await page.render({ 
                    canvasContext: canvas.getContext('2d'), 
                    viewport: viewport 
                }).promise;
                
                canvas.toBlob((blob) => {
                    const imgUrl = URL.createObjectURL(blob);
                    
                    if(displayGrid) {
                        const card = document.createElement('div');
                        card.className = 'img-card fade-in';
                        
                        card.innerHTML = `
                            <img src="${imgUrl}" alt="Page ${i}">
                            <a href="${imgUrl}" download="Page_${i}_HD.jpg" class="glow-btn" style="margin-top:5px; padding:8px; font-size:0.8rem; width:100%; text-align:center;">
                                <i class="ri-download-line"></i> SAVE HD
                            </a>
                        `;
                        displayGrid.appendChild(card);
                    }
                }, 'image/jpeg', 0.9);
            }
            
            if(typeof loader === 'function') loader(false);
            showToast(`Rendered ${pdf.numPages} Pages`, "success");
        };
        fileReader.readAsArrayBuffer(input.files[0]);
    } catch(e) {
        if(typeof loader === 'function') loader(false);
        showToast("Render Error. File might be corrupted.", "error");
        console.error(e);
    }
};
