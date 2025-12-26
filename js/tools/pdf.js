// ==========================================
// 📄 TOOLMASTER TITANIUM V40 - PDF ENGINE
// ==========================================

console.log("PDF Engine V40: Loaded");

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
            const pdf = await pdfjsLib.getDocument(typedArray).promise;
            const wb = XLSX.utils.book_new(); // Create new Workbook
            
            for (let i = 1; i <= pdf.numPages; i++) {
                showToast(`Scanning Page ${i} of ${pdf.numPages}...`, "info");
                
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                
                // --- SMART ROW GROUPING ALGORITHM ---
                // PDF text doesn't have "rows", it has XY coordinates.
                // We group items that are on the roughly same Y-axis (within 8px tolerance).
                const rows = {};
                const Y_TOLERANCE = 8; 
                
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

                // Sort Rows (PDF Y-axis is inverted: Bottom is 0, Top is High)
                // We sort High to Low to get Top-to-Bottom text
                const sortedY = Object.keys(rows).sort((a,b) => b - a); 
                
                const sheetData = [];
                sortedY.forEach(y => {
                    // Sort Columns within the row (Left -> Right)
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
        };
        fileReader.readAsArrayBuffer(input.files[0]);
    } catch(e) { 
        console.error(e);
        showToast("Error: File might be password protected or scanned image.", "error"); 
    } finally { 
        loader(false); 
    }
};

// --- 2. JPG TO PDF (Ultra HD + Auto Rotate) ---
window.convertJpgToPdf = () => {
    const input = document.getElementById('jpg-input');
    if (!input || !input.files.length) return showToast("Select images first.", "error");
    
    loader(true);
    showToast("Processing Images...", "info");
    
    // Initialize jsPDF
    const doc = new window.jspdf.jsPDF({
        orientation: 'p', 
        unit: 'mm', 
        format: 'a4',
        compress: true // Optimization for large files
    });
    
    const files = Array.from(input.files);

    const processImage = (index) => {
        // Base Case: All images processed
        if (index >= files.length) {
            doc.save(`Merged_Images_${new Date().getTime()}.pdf`);
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
                // Add new page for subsequent images
                if (index > 0) doc.addPage();

                // 1. Detect Image Orientation
                const isLandscape = img.width > img.height;
                const pageWidth = doc.internal.pageSize.getWidth();  // A4 Width
                const pageHeight = doc.internal.pageSize.getHeight(); // A4 Height

                // 2. Set PDF Page Orientation to match Image
                doc.setPage(index + 1);
                if (isLandscape) {
                    doc.deletePage(index + 1); 
                    doc.addPage('a4', 'landscape');
                }
                
                // 3. Define Canvas Boundaries
                const currentW = isLandscape ? pageHeight : pageWidth;
                const currentH = isLandscape ? pageWidth : pageHeight;
                
                // 4. Calculate Aspect Ratio Fit with Margins
                const margin = 10; // 10mm margin
                const maxW = currentW - (margin * 2);
                const maxH = currentH - (margin * 2);

                const imgRatio = img.width / img.height;
                const pageRatio = maxW / maxH;

                let finalW, finalH;

                // Fit logic: contain image within margins without stretching
                if (imgRatio > pageRatio) {
                    finalW = maxW;
                    finalH = maxW / imgRatio;
                } else {
                    finalH = maxH;
                    finalW = maxH * imgRatio;
                }

                // 5. Center Image on Page
                const x = (currentW - finalW) / 2;
                const y = (currentH - finalH) / 2;

                // 6. Render
                doc.addImage(img, 'JPEG', x, y, finalW, finalH, undefined, 'SLOW');
                
                // Process next image
                processImage(index + 1);
            };
        };
        reader.readAsDataURL(file);
    };

    // Start Recursion
    processImage(0);
};

// --- 3. PDF TO JPG (300 DPI Print Quality) ---
window.convertPdfToJpg = async () => {
    const input = document.getElementById('pdf-jpg-input');
    const grid = document.getElementById('jpg-preview-grid');
    
    if (!input || !input.files.length) return showToast("Select a PDF file.", "error");
    
    loader(true);
    grid.innerHTML = ''; // Clear previous results

    try {
        const fileReader = new FileReader();
        fileReader.onload = async function() {
            const typedArray = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument(typedArray).promise;
            
            for (let i = 1; i <= pdf.numPages; i++) {
                showToast(`Rendering Page ${i} of ${pdf.numPages} (HD)...`, "info");
                
                const page = await pdf.getPage(i);
                
                // --- ULTRA HD UPGRADE ---
                // Scale 3.0 = 300 DPI (approx). Standard screen is 1.0 (72 DPI).
                const viewport = page.getViewport({ scale: 3.0 });
                
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                
                await page.render({ 
                    canvasContext: canvas.getContext('2d'), 
                    viewport: viewport 
                }).promise;
                
                // Generate Blob (Better memory management than DataURL)
                canvas.toBlob((blob) => {
                    const imgUrl = URL.createObjectURL(blob);
                    
                    const card = document.createElement('div');
                    card.className = 'img-card fade-in';
                    
                    // HTML Structure matching new pdf.css
                    card.innerHTML = `
                        <div style="height:150px; overflow:hidden; border-bottom:1px solid rgba(255,255,255,0.1)">
                            <img src="${imgUrl}" style="width:100%; height:100%; object-fit:cover;" alt="Page ${i}">
                        </div>
                        <a href="${imgUrl}" download="Page_${i}_HD.jpg" class="glow-btn" style="width:100%; margin-top:10px; text-align:center; padding:8px; font-size:0.9rem;">
                            <i class="ri-download-line"></i> Download HD
                        </a>
                    `;
                    grid.appendChild(card);
                }, 'image/jpeg', 0.95); // 95% JPEG Quality
            }
            
            loader(false);
            showToast(`Conversion Complete! ${pdf.numPages} Pages ready.`, "success");
        };
        fileReader.readAsArrayBuffer(input.files[0]);
    } catch(e) {
        loader(false);
        showToast("Error: PDF might be corrupted or password protected.", "error");
        console.error(e);
    }
};
