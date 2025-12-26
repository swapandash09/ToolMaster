// ==========================================
// 📊 EXCEL TO PDF ENGINE (TITANIUM V40)
// ==========================================

console.log("Excel Engine V40: Loaded");

// --- 1. FILE HANDLER & PREVIEW GENERATOR ---
const excelInput = document.getElementById('excel-input');
if(excelInput) {
    excelInput.addEventListener('change', (e) => {
        if(!e.target.files.length) return;

        // Show Global Loader
        if(typeof loader === 'function') loader(true);
        if(typeof showToast === 'function') showToast("Reading Excel File...", "info");
        
        const reader = new FileReader();
        reader.readAsArrayBuffer(e.target.files[0]);
        
        reader.onload = (ev) => {
            try {
                const data = new Uint8Array(ev.target.result);
                // Read workbook with cell styles enabled
                const workbook = XLSX.read(data, {type:'array', cellStyles: true});
                
                // Get the first sheet
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                
                // Convert to HTML Table
                const html = XLSX.utils.sheet_to_html(sheet, { id:'excel-table', editable:false });
                
                // Inject into preview container
                const container = document.getElementById('excel-preview-container');
                if(container) {
                    container.innerHTML = html;
                    
                    // --- STYLE THE TABLE FOR PREVIEW ---
                    const table = container.querySelector('table');
                    if(table) {
                        table.style.width = '100%';
                        table.style.borderCollapse = 'collapse';
                        table.style.fontFamily = 'Arial, sans-serif';
                        table.style.fontSize = '12px';
                        
                        // Style headers and cells
                        table.querySelectorAll('td, th').forEach(cell => {
                            cell.style.padding = "8px 12px";
                            cell.style.border = "1px solid #e2e8f0";
                            cell.style.textAlign = "left";
                            cell.style.color = "#333";
                        });
                        
                        // Header specific style
                        table.querySelectorAll('tr:first-child td').forEach(head => {
                            head.style.backgroundColor = "#f8fafc";
                            head.style.fontWeight = "bold";
                            head.style.color = "#0f172a";
                        });
                    }
                }
                if(typeof showToast === 'function') showToast("Excel Loaded Successfully!", "success");
            } catch (error) {
                console.error(error);
                if(typeof showToast === 'function') showToast("Error reading Excel file", "error");
            } finally {
                // Hide Loader
                if(typeof loader === 'function') loader(false);
            }
        };
    });
}

// --- 2. PDF GENERATION (SMART FIT ENGINE) ---
window.generateUltraHDPDF = () => {
    const el = document.getElementById('excel-table');
    if(!el) {
        if(typeof showToast === 'function') showToast("Please upload an Excel file first!", "error");
        return;
    }
    
    if(typeof loader === 'function') loader(true);
    if(typeof showToast === 'function') showToast("Generating PDF... Please wait", "info");

    // --- CONFIGURATION ---
    const useBorder = document.getElementById('pdf-border') ? document.getElementById('pdf-border').checked : true;
    const orientInput = document.getElementById('pdf-orient') ? document.getElementById('pdf-orient').value : 'auto';
    
    // Auto-detect orientation based on column count (Approximate logic)
    // If table is very wide (>8 cols), force landscape
    const colCount = el.rows[0]?.cells.length || 0;
    const finalOrientation = orientInput === 'auto' ? (colCount > 8 ? 'landscape' : 'portrait') : orientInput;

    // --- CLONE & PREPARE FOR PRINT ---
    // We clone the table to style it specifically for PDF without messing up the preview
    const clone = el.cloneNode(true);
    
    // PDF Styling (Black & White, High Contrast)
    clone.style.width = '100%'; 
    clone.style.background = '#ffffff';
    clone.style.color = '#000000';
    clone.style.fontFamily = 'Arial, sans-serif';
    clone.style.borderCollapse = 'collapse';

    clone.querySelectorAll('td, th').forEach(td => {
        td.style.color = '#000000';
        td.style.fontSize = colCount > 10 ? '9px' : '11px'; // Auto-shrink font for wide tables
        td.style.padding = '6px';
        td.style.border = useBorder ? "1px solid #444" : "none"; 
        td.style.whiteSpace = 'normal'; // Allow wrapping
        td.style.wordBreak = 'break-word';
    });

    // Create invisible wrapper
    const wrapper = document.createElement('div');
    // Set fixed width to simulate A4 paper pixels (approx) to ensure consistent rendering
    const a4Width = finalOrientation === 'portrait' ? 790 : 1120;
    wrapper.style.width = `${a4Width}px`;
    wrapper.style.background = '#ffffff';
    wrapper.style.padding = '20px';
    wrapper.style.position = 'absolute';
    wrapper.style.left = '-9999px'; // Hide off-screen
    wrapper.style.top = '0';
    
    // Add Branding Header (Optional)
    const header = document.createElement('div');
    header.innerHTML = `<h3 style="margin-bottom:15px; font-family:sans-serif; color:#333;">Excel Export</h3>`;
    wrapper.appendChild(header);
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    // --- HTML2PDF CONFIG ---
    const opt = {
        margin: [10, 10, 10, 10], // mm
        filename: `Excel_Export_${new Date().getTime()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 }, // JPEG is faster for documents
        html2canvas: { 
            scale: 3, // 3x Quality (Sharp Text)
            useCORS: true, 
            letterRendering: true,
            scrollY: 0,
            windowWidth: a4Width // Crucial for correct layout
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: finalOrientation 
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } // Try not to cut rows
    };

    // --- GENERATE ---
    // We use a small timeout to let the DOM render the off-screen element
    setTimeout(() => {
        html2pdf().set(opt).from(wrapper).save().then(() => {
            // Cleanup
            document.body.removeChild(wrapper);
            if(typeof loader === 'function') loader(false);
            if(typeof showToast === 'function') showToast("PDF Downloaded Successfully!", "success");
        }).catch(err => {
            console.error("PDF Gen Error:", err);
            document.body.removeChild(wrapper);
            if(typeof loader === 'function') loader(false);
            if(typeof showToast === 'function') showToast("Conversion Failed. Try fewer rows.", "error");
        });
    }, 500);
};
