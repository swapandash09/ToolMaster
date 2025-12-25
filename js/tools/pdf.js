// ==========================================
// 📄 PDF TOOLS MODULE (TITANIUM HD UPGRADE)
// ==========================================

// 1. PDF TO EXCEL (Smart Semantic Extraction)
window.convertPDFtoExcel = async () => {
    const input = document.getElementById('pdf-to-ex-input');
    if (!input || !input.files.length) return showToast("Please select a PDF file first.");
    
    loader(true); 
    
    try {
        const fileReader = new FileReader();
        fileReader.onload = async function() {
            const typedArray = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument(typedArray).promise;
            const wb = XLSX.utils.book_new();
            
            for (let i = 1; i <= pdf.numPages; i++) {
                showToast(`Scanning Page ${i} of ${pdf.numPages}...`); // UX Update
                
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                
                // --- SMART ROW GROUPING ALGORITHM ---
                const rows = {};
                const Y_TOLERANCE = 8; // Pixels tolerance for "same line" detection
                
                content.items.forEach(item => {
                    // Check if this item belongs to an existing row (within tolerance)
                    let matchedY = Object.keys(rows).find(y => Math.abs(y - item.transform[5]) < Y_TOLERANCE);
                    
                    if (!matchedY) {
                        matchedY = item.transform[5]; // Create new row ID
                        rows[matchedY] = [];
                    }
                    rows[matchedY].push({ x: item.transform[4], text: item.str });
                });

                // Sort Rows (Top -> Bottom)
                const sortedY = Object.keys(rows).sort((a,b) => b - a); // PDF Y is inverted
                
                const sheetData = [];
                sortedY.forEach(y => {
                    // Sort Columns (Left -> Right)
                    const rowItems = rows[y].sort((a,b) => a.x - b.x);
                    
                    // Filter empty garbage
                    const rowText = rowItems.map(item => item.text.trim()).filter(t => t !== "");
                    
                    // Only add if row has data
                    if(rowText.length > 0) sheetData.push(rowText);
                });

                if(sheetData.length > 0) {
                    const ws = XLSX.utils.aoa_to_sheet(sheetData);
                    XLSX.utils.book_append_sheet(wb, ws, `Page_${i}`);
                }
            }
            
            XLSX.writeFile(wb, "ToolMaster_Data_Export.xlsx");
            showToast("Excel Extracted Successfully!");
        };
        fileReader.readAsArrayBuffer(input.files[0]);
    } catch(e) { 
        console.error(e);
        showToast("Error: File is password protected or scanned."); 
    } finally { 
        loader(false); 
    }
}

// 2. JPG TO PDF (Ultra HD + Auto Rotate)
window.convertJpgToPdf = () => {
    const input = document.getElementById('jpg-input');
    if (!input || !input.files.length) return showToast("Select images first.");
    
    loader(true);
    
    // Initialize PDF
    const doc = new window.jspdf.jsPDF({
        orientation: 'p', 
        unit: 'mm', 
        format: 'a4',
        compress: true // Enable compression for huge files
    });
    
    let processedCount = 0;
    const files = Array.from(input.files);

    const processImage = (index) => {
        if (index >= files.length) {
            doc.save(`Merged_Images_${new Date().getTime()}.pdf`);
            loader(false);
            showToast("HD PDF Created Successfully!");
            return;
        }

        const file = files[index];
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            
            img.onload = () => {
                if (index > 0) doc.addPage();

                // 1. Detect Orientation
                const isLandscape = img.width > img.height;
                const pageWidth = doc.internal.pageSize.getWidth();  // 210mm
                const pageHeight = doc.internal.pageSize.getHeight(); // 297mm

                // 2. Set Page Orientation to match Image
                doc.setPage(index + 1);
                if (isLandscape) {
                    doc.deletePage(index + 1); 
                    doc.addPage('a4', 'landscape');
                }
                
                // 3. Current Page Dimensions
                const currentW = isLandscape ? pageHeight : pageWidth;
                const currentH = isLandscape ? pageWidth : pageHeight;
                
                // 4. Calculate Margins & Fit
                const margin = 10; // 10mm border
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

                // 5. Center the image
                const x = (currentW - finalW) / 2;
                const y = (currentH - finalH) / 2;

                // 6. High Quality Render ('SLOW' algorithm is better quality)
                doc.addImage(img, 'JPEG', x, y, finalW, finalH, undefined, 'SLOW');
                
                processImage(index + 1);
            };
        };
        reader.readAsDataURL(file);
    };

    processImage(0);
}

// 3. PDF TO JPG (300 DPI Print Quality)
window.convertPdfToJpg = async () => {
    const input = document.getElementById('pdf-jpg-input');
    const grid = document.getElementById('jpg-preview-grid');
    
    if (!input || !input.files.length) return showToast("Select a PDF file.");
    
    loader(true);
    grid.innerHTML = ''; 

    try {
        const fileReader = new FileReader();
        fileReader.onload = async function() {
            const typedArray = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument(typedArray).promise;
            
            for (let i = 1; i <= pdf.numPages; i++) {
                showToast(`Rendering Page ${i} (HD)...`);
                
                const page = await pdf.getPage(i);
                
                // --- ULTRA HD UPGRADE ---
                // Scale 3.0 = 300 DPI (Standard Print Resolution)
                // Default is 1.0 (72 DPI - Blurry)
                const viewport = page.getViewport({ scale: 3.0 });
                
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                
                await page.render({ 
                    canvasContext: canvas.getContext('2d'), 
                    viewport: viewport 
                }).promise;
                
                // Create Blob URL (Prevents browser crash on large images)
                canvas.toBlob((blob) => {
                    const imgUrl = URL.createObjectURL(blob);
                    
                    const card = document.createElement('div');
                    card.className = 'img-card fade-in';
                    // We display a small preview but download the FULL HD file
                    card.innerHTML = `
                        <div style="height:200px; overflow:hidden; border-bottom:1px solid rgba(255,255,255,0.1)">
                            <img src="${imgUrl}" style="width:100%; object-fit:contain;" alt="Page ${i}">
                        </div>
                        <a href="${imgUrl}" download="Page_${i}_HD.jpg" class="dl-btn">
                            <i class="ri-download-line"></i> Download HD (Page ${i})
                        </a>
                    `;
                    grid.appendChild(card);
                }, 'image/jpeg', 1.0); // 1.0 = 100% Quality (No compression artifacts)
            }
            
            loader(false);
            showToast(`Ready! Converted ${pdf.numPages} Pages.`);
        };
        fileReader.readAsArrayBuffer(input.files[0]);
    } catch(e) {
        loader(false);
        showToast("Error: Ensure PDF is not password protected.");
        console.error(e);
    }
                             }
