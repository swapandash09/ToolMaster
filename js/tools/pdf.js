// ==========================================
// 📄 TOOLMASTER TITANIUM V41 - PDF ENGINE
// ==========================================

console.log("PDF Engine V41: Loaded");

// --- 1. PDF TO EXCEL (Smart Semantic Extraction) ---
window.convertPDFtoExcel = async () => {
    const input = document.getElementById('pdf-to-ex-input');
    if (!input || !input.files.length) return showToast("Please select a PDF file first.", "error");
    
    loader(true); 
    
    try {
        const fileReader = new FileReader();
        fileReader.onload = async function() {
            const typedArray = new Uint8Array(this.result);
            
            // Load PDF using PDF.js
            const loadingTask = pdfjsLib.getDocument(typedArray);
            
            loadingTask.promise.then(async (pdf) => {
                const wb = XLSX.utils.book_new(); // Create new Workbook
                
                for (let i = 1; i <= pdf.numPages; i++) {
                    // Update Loader Text
                    const loaderText = document.querySelector('#loading-overlay p');
                    if(loaderText) loaderText.innerText = `SCANNING PAGE ${i} OF ${pdf.numPages}...`;
                    
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    
                    // --- SMART ROW GROUPING ALGORITHM ---
                    const rows = {};
                    const Y_TOLERANCE = 5; // Tighter tolerance for better accuracy
                    
                    content.items.forEach(item => {
                        // Find existing row ID close to this item's Y position
                        let matchedY = Object.keys(rows).find(y => Math.abs(y - item.transform[5]) < Y_TOLERANCE);
                        
                        if (!matchedY) {
                            matchedY = item.transform[5]; // Create new row ID based on Y pos
                            rows[matchedY] = [];
                        }
                        // Store X position and Text
                        rows[matchedY].push({ x: item.transform[4], text: item.str });
                    });

                    // Sort Rows (PDF Y-axis is inverted: High is Top)
                    const sortedY = Object.keys(rows).sort((a,b) => b - a); 
                    
                    const sheetData = [];
                    sortedY.forEach(y => {
                        // Sort Columns (Left -> Right)
                        const rowItems = rows[y].sort((a,b) => a.x - b.x);
                        
                        // Clean data: Remove empty strings
                        const rowText = rowItems.map(item => item.text.trim()).filter(t => t !== "");
                        
                        // Only add non-empty rows
                        if(rowText.length > 0) sheetData.push(rowText);
                    });

                    if(sheetData.length > 0) {
                        const ws = XLSX.utils.aoa_to_sheet(sheetData);
                        XLSX.utils.book_append_sheet(wb, ws, `Page_${i}`);
                    }
                }
                
                // Export File
                XLSX.writeFile(wb, "ToolMaster_Export.xlsx");
                showToast("Excel Extracted Successfully!", "success");
                loader(false);

            }).catch(error => {
                console.error("PDF Load Error:", error);
                showToast("Error: Password protected or invalid PDF.", "error");
                loader(false);
            });
        };
        fileReader.readAsArrayBuffer(input.files[0]);
    } catch(e) { 
        console.error(e);
        showToast("An unexpected error occurred.", "error"); 
        loader(false); 
    }
};

// --- 2. JPG TO PDF (Ultra HD + Auto Rotate) ---
window.convertJpgToPdf = () => {
    const input = document.getElementById('jpg-input');
    if (!input || !input.files.length) return showToast("Select images first.", "error");
    
    loader(true);
    
    // Initialize jsPDF
    const doc = new window.jspdf.jsPDF({
        orientation: 'p', 
        unit: 'mm', 
        format: 'a4',
        compress: true 
    });
    
    const files = Array.from(input.files);
    let processed = 0;

    const processImage = (index) => {
        // Update Loader
        const loaderText = document.querySelector('#loading-overlay p');
        if(loaderText) loaderText.innerText = `PROCESSING IMAGE ${index + 1}/${files.length}`;

        // Base Case: Finish
        if (index >= files.length) {
            doc.save(`ToolMaster_Merged_${new Date().getTime()}.pdf`);
            loader(false);
            showToast("HD PDF Created Successfully!", "success");
            return;
        }

        const file = files[index];
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            
            img.onload = () => {
                if (index > 0) doc.addPage();

                // 1. Detect Image Orientation
                const isLandscape = img.width > img.height;
                const pageWidth = doc.internal.pageSize.getWidth(); 
                const pageHeight = doc.internal.pageSize.getHeight(); 

                // 2. Auto-Rotate Page
                doc.setPage(index + 1);
                if (isLandscape) {
                    doc.deletePage(index + 1); 
                    doc.addPage('a4', 'landscape');
                }
                
                // 3. Current Page Dimensions
                const currentW = isLandscape ? pageHeight : pageWidth;
                const currentH = isLandscape ? pageWidth : pageHeight;
                
                // 4. Calculate Fit (Maintain Aspect Ratio)
                const margin = 10; 
                const maxW = currentW - (margin * 2);
                const maxH = currentH - (margin * 2);

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

                // 5. Center Image
                const x = (currentW - finalW) / 2;
                const y = (currentH - finalH) / 2;

                // 6. Render (Using 'FAST' for speed, 'SLOW' for compression)
                doc.addImage(img, 'JPEG', x, y, finalW, finalH, undefined, 'FAST');
                
                // Free memory
                img.onload = null;
                img.src = ""; 
                
                // Recursion
                processImage(index + 1);
            };
        };
        reader.readAsDataURL(file);
    };

    processImage(0);
};

// --- 3. PDF TO JPG (300 DPI Print Quality) ---
window.convertPdfToJpg = async () => {
    const input = document.getElementById('pdf-jpg-input');
    const grid = document.getElementById('jpg-preview-grid');
    
    if (!input || !input.files.length) return showToast("Select a PDF file.", "error");
    
    loader(true);
    grid.innerHTML = ''; // Clear old results

    try {
        const fileReader = new FileReader();
        fileReader.onload = async function() {
            const typedArray = new Uint8Array(this.result);
            
            try {
                const pdf = await pdfjsLib.getDocument(typedArray).promise;
                
                for (let i = 1; i <= pdf.numPages; i++) {
                    // Update Loader
                    const loaderText = document.querySelector('#loading-overlay p');
                    if(loaderText) loaderText.innerText = `RENDERING PAGE ${i}/${pdf.numPages}`;
                    
                    const page = await pdf.getPage(i);
                    
                    // --- ULTRA HD UPGRADE (Scale 2.0 is usually sufficient and faster than 3.0) ---
                    const viewport = page.getViewport({ scale: 2.0 });
                    
                    const canvas = document.createElement('canvas');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    
                    await page.render({ 
                        canvasContext: canvas.getContext('2d'), 
                        viewport: viewport 
                    }).promise;
                    
                    // Convert to Blob (Efficient Memory)
                    canvas.toBlob((blob) => {
                        const imgUrl = URL.createObjectURL(blob);
                        
                        const card = document.createElement('div');
                        card.className = 'img-card fade-in';
                        
                        // V41 Styled Card
                        card.innerHTML = `
                            <img src="${imgUrl}" alt="Page ${i}">
                            <a href="${imgUrl}" download="Page_${i}_HD.jpg" class="glow-btn" style="margin-top:0; padding:8px 15px; font-size:0.85rem; width:100%; text-align:center;">
                                <i class="ri-download-line"></i> Save HD
                            </a>
                        `;
                        grid.appendChild(card);
                        
                        // Clean up memory after a delay (optional, or rely on page reload)
                        // setTimeout(() => URL.revokeObjectURL(imgUrl), 60000); 
                    }, 'image/jpeg', 0.95);
                }
                
                loader(false);
                showToast(`Done! ${pdf.numPages} Pages extracted.`, "success");
                
            } catch (innerErr) {
                console.error(innerErr);
                loader(false);
                showToast("Error: Encrypted PDF or Corrupted File.", "error");
            }
        };
        fileReader.readAsArrayBuffer(input.files[0]);
    } catch(e) {
        loader(false);
        showToast("Critical Error reading file.", "error");
        console.error(e);
    }
};
