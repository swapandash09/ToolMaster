// ==========================================
// 📄 PDF ENGINE - TITANIUM V51 QUANTUM
// ==========================================

console.log("PDF Engine V51: Quantum Core Online");

// --- 1. PDF TO EXCEL (QUANTUM ROW ALGORITHM) ---
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
            
            for (let i = 1; i <= pdf.numPages; i++) {
                if(typeof loader === 'function') loader(true, `ANALYZING PAGE ${i}/${pdf.numPages}...`);
                
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                
                // --- V51 SMART ROW GROUPING ---
                const rows = {};
                // Dynamic Tolerance based on page scale usually helps, but fixed 4-6 is stable
                const Y_TOLERANCE = 4; 
                
                content.items.forEach(item => {
                    const y = item.transform[5]; // Y Position
                    const x = item.transform[4]; // X Position
                    
                    // Find existing row within tolerance
                    let matchedY = Object.keys(rows).find(key => Math.abs(key - y) < Y_TOLERANCE);
                    
                    if (!matchedY) {
                        matchedY = y;
                        rows[matchedY] = [];
                    }
                    rows[matchedY].push({ x: x, text: item.str });
                });

                // Sort Rows (Top to Bottom)
                const sortedY = Object.keys(rows).sort((a,b) => b - a); 
                
                const sheetData = [];
                sortedY.forEach(y => {
                    // Sort Columns (Left to Right)
                    const rowItems = rows[y].sort((a,b) => a.x - b.x);
                    // Filter empty strings
                    const rowText = rowItems.map(item => item.text.trim()).filter(t => t.length > 0);
                    if(rowText.length > 0) sheetData.push(rowText);
                });

                if(sheetData.length > 0) {
                    const ws = XLSX.utils.aoa_to_sheet(sheetData);
                    XLSX.utils.book_append_sheet(wb, ws, `Page_${i}`);
                }
            }
            
            // Export
            XLSX.writeFile(wb, `Titanium_Export_${Date.now()}.xlsx`);
            if(typeof showToast === 'function') showToast("Excel Extraction Complete!", "success");
            if(typeof loader === 'function') loader(false);
        };
        fileReader.readAsArrayBuffer(input.files[0]);

    } catch(e) { 
        console.error("PDF-Excel Error:", e);
        if(typeof showToast === 'function') showToast("Extraction Failed. Is file valid?", "error"); 
        if(typeof loader === 'function') loader(false); 
    }
};

// --- 2. JPG TO PDF (SMART ORIENTATION ENGINE) ---
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
                // Determine layout
                const isLandscape = img.width > img.height;
                
                // Add new page (skip first empty page check logic simplified)
                if (index > 0) doc.addPage();
                
                // Configure Page
                doc.setPage(index + 1);
                if (isLandscape) {
                    doc.deletePage(index + 1); 
                    doc.addPage('a4', 'landscape');
                }
                
                const pageWidth = doc.internal.pageSize.getWidth(); 
                const pageHeight = doc.internal.pageSize.getHeight(); 
                
                // Fit Logic (Maintain Aspect Ratio)
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

                // Center
                const x = (pageWidth - finalW) / 2;
                const y = (pageHeight - finalH) / 2;

                doc.addImage(img, 'JPEG', x, y, finalW, finalH, undefined, 'FAST');
                
                // Next
                processImage(index + 1);
            };
        };
        reader.readAsDataURL(file);
    };

    processImage(0);
};

// --- 3. PDF TO JPG (4K RENDER CORE) ---
window.convertPdfToJpg = async () => {
    const input = document.getElementById('pdf-to-ex-input'); // Re-using upload for demo, ensure IDs match in HTML
    const grid = document.getElementById('image-grid-preview'); // Using V51 Grid ID
    
    // Fallback if ID is different (user might be using pdf-jpg-input)
    const altInput = document.getElementById('pdf-jpg-input');
    const finalInput = input || altInput;

    if (!finalInput || !finalInput.files.length) return showToast("Select a PDF file.", "error");
    
    if(typeof loader === 'function') loader(true, "STARTING RENDER ENGINE...");
    if(grid) grid.innerHTML = ''; 

    try {
        const fileReader = new FileReader();
        fileReader.onload = async function() {
            const typedArray = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument(typedArray).promise;
            
            for (let i = 1; i <= pdf.numPages; i++) {
                if(typeof loader === 'function') loader(true, `RENDERING 4K PAGE ${i}/${pdf.numPages}`);
                
                const page = await pdf.getPage(i);
                
                // V51 HIGH-RES SCALE (3.0 = 4K Quality)
                const viewport = page.getViewport({ scale: 3.0 });
                
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                
                await page.render({ 
                    canvasContext: canvas.getContext('2d'), 
                    viewport: viewport 
                }).promise;
                
                canvas.toBlob((blob) => {
                    const imgUrl = URL.createObjectURL(blob);
                    
                    if(grid) {
                        const card = document.createElement('div');
                        card.className = 'img-card fade-in';
                        
                        // V51 Card Structure
                        card.innerHTML = `
                            <img src="${imgUrl}" alt="Page ${i}">
                            <a href="${imgUrl}" download="Page_${i}_4K.jpg" class="glow-btn" style="margin-top:5px; padding:8px; font-size:0.8rem; width:100%; text-align:center;">
                                <i class="ri-download-line"></i> SAVE 4K
                            </a>
                        `;
                        grid.appendChild(card);
                    }
                }, 'image/jpeg', 0.95);
            }
            
            if(typeof loader === 'function') loader(false);
            if(typeof showToast === 'function') showToast(`Rendered ${pdf.numPages} Pages in 4K`, "success");
        };
        fileReader.readAsArrayBuffer(finalInput.files[0]);
    } catch(e) {
        if(typeof loader === 'function') loader(false);
        if(typeof showToast === 'function') showToast("Render Error. File might be corrupted.", "error");
        console.error(e);
    }
};
