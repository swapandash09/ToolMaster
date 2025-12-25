// PDF TOOLS MODULE

// 1. PDF TO EXCEL (Smart Row Detection)
window.convertPDFtoExcel = async () => {
    const input = document.getElementById('pdf-to-ex-input');
    if (!input.files.length) return showToast("Select PDF File");
    
    loader(true);
    try {
        const fileReader = new FileReader();
        fileReader.onload = async function() {
            const pdf = await pdfjsLib.getDocument(new Uint8Array(this.result)).promise;
            const wb = XLSX.utils.book_new();
            
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                
                // Group by Y position (Rows)
                const rows = {};
                content.items.forEach(item => {
                    const y = Math.round(item.transform[5] / 10) * 10; 
                    if (!rows[y]) rows[y] = [];
                    rows[y].push({ x: item.transform[4], text: item.str });
                });

                // Sort Rows (Top -> Bottom)
                const sortedY = Object.keys(rows).sort((a,b) => b - a);
                
                const sheetData = [];
                sortedY.forEach(y => {
                    // Sort Columns (Left -> Right)
                    const rowItems = rows[y].sort((a,b) => a.x - b.x);
                    sheetData.push(rowItems.map(item => item.text));
                });

                const ws = XLSX.utils.aoa_to_sheet(sheetData);
                XLSX.utils.book_append_sheet(wb, ws, `Page_${i}`);
            }
            
            XLSX.writeFile(wb, "ToolMaster_Data.xlsx");
            showToast("Excel Downloaded!");
        };
        fileReader.readAsArrayBuffer(input.files[0]);
    } catch(e) { 
        showToast("Error parsing PDF"); 
        console.error(e);
    } finally { 
        loader(false); 
    }
}

// 2. JPG TO PDF (Merge Images)
window.convertJpgToPdf = () => {
    // Note: Is tool ka HTML workspace index.html mein add karna hoga agar nahi kiya hai
    const input = document.getElementById('jpg-input'); // Ensure HTML has this ID
    if (!input || !input.files.length) return showToast("Select Images");
    
    loader(true);
    const doc = new window.jspdf.jsPDF();
    let processed = 0;
    
    Array.from(input.files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                if (index > 0) doc.addPage();
                
                // Fit to A4
                const imgRatio = img.width / img.height;
                let w = doc.internal.pageSize.getWidth() - 20;
                let h = w / imgRatio;
                
                if (h > doc.internal.pageSize.getHeight() - 20) {
                    h = doc.internal.pageSize.getHeight() - 20;
                    w = h * imgRatio;
                }
                
                doc.addImage(img, 'JPEG', 10, 10, w, h);
                processed++;
                
                if(processed === input.files.length) {
                    doc.save('Merged_Images.pdf');
                    loader(false);
                    showToast("PDF Merged Successfully!");
                }
            };
        };
        reader.readAsDataURL(file);
    });
}

// 3. PDF TO JPG
window.convertPdfToJpg = async () => {
    // Note: Is tool ka HTML workspace index.html mein add karna hoga
    const input = document.getElementById('pdf-jpg-input'); 
    if (!input || !input.files.length) return showToast("Select PDF");
    
    loader(true);
    const reader = new FileReader();
    reader.onload = async function() {
        const pdf = await pdfjsLib.getDocument(new Uint8Array(this.result)).promise;
        // Simple implementation: Download first page or zip all (simplified here)
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            
            await page.render({ canvasContext: canvas.getContext('2d'), viewport: viewport }).promise;
            
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/jpeg');
            link.download = `Page_${i}.jpg`;
            link.click();
        }
        loader(false);
        showToast("Pages Downloaded!");
    };
    reader.readAsArrayBuffer(input.files[0]);
}
