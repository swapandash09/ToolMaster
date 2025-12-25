// ==========================================
// 📄 PDF TOOLS MODULE (TITANIUM UPGRADE)
// ==========================================

// 1. PDF TO EXCEL (Smart Extraction with Progress)
window.convertPDFtoExcel = async () => {
    const input = document.getElementById('pdf-to-ex-input');
    if (!input || !input.files.length) return showToast("Please select a PDF file first.");
    
    loader(true); // Show loader
    
    try {
        const fileReader = new FileReader();
        fileReader.onload = async function() {
            const typedArray = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument(typedArray).promise;
            const wb = XLSX.utils.book_new();
            
            // Loop through pages
            for (let i = 1; i <= pdf.numPages; i++) {
                // Update Toast with Progress
                showToast(`Processing Page ${i} of ${pdf.numPages}...`);
                
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                
                // Group text items by Y-coordinate (Rows)
                const rows = {};
                content.items.forEach(item => {
                    // Round Y to nearest 10px to handle slight misalignments
                    const y = Math.round(item.transform[5] / 10) * 10; 
                    if (!rows[y]) rows[y] = [];
                    rows[y].push({ x: item.transform[4], text: item.str });
                });

                // Sort Rows (Top to Bottom)
                // PDF coordinates: (0,0) is bottom-left, so higher Y is top.
                const sortedY = Object.keys(rows).sort((a,b) => b - a);
                
                const sheetData = [];
                sortedY.forEach(y => {
                    // Sort Columns (Left to Right)
                    const rowItems = rows[y].sort((a,b) => a.x - b.x);
                    // Filter empty strings
                    const rowText = rowItems.map(item => item.text).filter(t => t.trim() !== "");
                    if(rowText.length > 0) sheetData.push(rowText);
                });

                if(sheetData.length > 0) {
                    const ws = XLSX.utils.aoa_to_sheet(sheetData);
                    XLSX.utils.book_append_sheet(wb, ws, `Page_${i}`);
                }
            }
            
            XLSX.writeFile(wb, "ToolMaster_Export.xlsx");
            showToast("Excel Downloaded Successfully!");
        };
        fileReader.readAsArrayBuffer(input.files[0]);
    } catch(e) { 
        console.error(e);
        showToast("Error: Could not parse PDF structure."); 
    } finally { 
        loader(false); 
    }
}

// 2. JPG TO PDF (Auto-Orientation & Fit)
window.convertJpgToPdf = () => {
    const input = document.getElementById('jpg-input');
    if (!input || !input.files.length) return showToast("Select images first.");
    
    loader(true);
    
    // Create PDF (Default A4)
    const doc = new window.jspdf.jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    let processedCount = 0;
    const files = Array.from(input.files);

    const processImage = (index) => {
        if (index >= files.length) {
            doc.save('ToolMaster_Images.pdf');
            loader(false);
            showToast("PDF Merged & Downloaded!");
            return;
        }

        const file = files[index];
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            
            img.onload = () => {
                // Add new page if not the first one
                if (index > 0) doc.addPage();

                // Determine Orientation
                const isLandscape = img.width > img.height;
                
                // Set orientation for current page
                doc.setPage(index + 1); // Select current page
                if (isLandscape) {
                    doc.deletePage(index + 1); // Remove default portrait
                    doc.addPage('a4', 'landscape'); // Add landscape
                }

                // Recalculate dimensions based on orientation
                const currentW = isLandscape ? pageHeight : pageWidth; // Swap for landscape
                const currentH = isLandscape ? pageWidth : pageHeight;
                
                // Margin 10mm
                const margin = 10;
                const maxW = currentW - (margin * 2);
                const maxH = currentH - (margin * 2);

                // Smart Fit Logic
                const ratio = Math.min(maxW / img.width, maxH / img.height);
                const printW = img.width * ratio;
                const printH = img.height * ratio;

                // Center Image
                const x = (currentW - printW) / 2;
                const y = (currentH - printH) / 2;

                doc.addImage(img, 'JPEG', x, y, printW, printH, undefined, 'FAST');
                
                // Next
                processImage(index + 1);
            };
        };
        reader.readAsDataURL(file);
    };

    // Start Loop
    processImage(0);
}

// 3. PDF TO JPG (HD Rendering)
window.convertPdfToJpg = async () => {
    const input = document.getElementById('pdf-jpg-input');
    const grid = document.getElementById('jpg-preview-grid');
    
    if (!input || !input.files.length) return showToast("Select a PDF file.");
    
    loader(true);
    grid.innerHTML = ''; // Clear previous results

    try {
        const fileReader = new FileReader();
        fileReader.onload = async function() {
            const typedArray = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument(typedArray).promise;
            
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                
                // Scale 2.0 = HD Quality (Crisp Text)
                const viewport = page.getViewport({ scale: 2.0 });
                
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                
                await page.render({ 
                    canvasContext: canvas.getContext('2d'), 
                    viewport: viewport 
                }).promise;
                
                // Create Card UI
                const imgData = canvas.toDataURL('image/jpeg', 0.9); // 90% Quality JPG
                
                const card = document.createElement('div');
                card.className = 'img-card fade-in';
                card.innerHTML = `
                    <img src="${imgData}" alt="Page ${i}">
                    <a href="${imgData}" download="Page_${i}.jpg" class="dl-btn">
                        <i class="ri-download-line"></i> Download Page ${i}
                    </a>
                `;
                grid.appendChild(card);
            }
            
            loader(false);
            showToast(`Converted ${pdf.numPages} Pages to Images`);
        };
        fileReader.readAsArrayBuffer(input.files[0]);
    } catch(e) {
        loader(false);
        showToast("Error converting PDF");
        console.error(e);
    }
}
