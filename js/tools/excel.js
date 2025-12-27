
// ==========================================
// 📊 EXCEL TO PDF ENGINE (TITANIUM V42 - SMART FIT)
// ==========================================

console.log("Excel Engine V42: Online");

// --- 1. FILE HANDLER & HD PREVIEW ---
const excelInput = document.getElementById('excel-input');
if(excelInput) {
    excelInput.addEventListener('change', async (e) => {
        if(!e.target.files.length) return;

        const file = e.target.files[0];
        
        // UI Feedback
        if(typeof loader === 'function') loader(true);
        if(typeof showToast === 'function') showToast("Parsing Spreadsheet...", "info");
        
        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, {type:'array', cellStyles: true});
            
            // Get First Sheet
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            
            // Generate HTML Table
            const html = XLSX.utils.sheet_to_html(sheet, { 
                id: 'excel-table', 
                editable: false 
            });
            
            const container = document.getElementById('excel-preview-container');
            if(container) {
                container.innerHTML = html;
                
                // Enhance Table Styling (Make it look like Real Excel)
                const table = container.querySelector('table');
                if(table) {
                    table.style.width = '100%';
                    table.style.minWidth = '600px'; // Prevent squishing
                    table.style.borderCollapse = 'collapse';
                    table.style.fontFamily = "'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
                    table.style.fontSize = '13px';
                    table.style.backgroundColor = '#ffffff';
                    
                    // Header Styling
                    const rows = table.querySelectorAll('tr');
                    if(rows.length > 0) {
                        rows[0].style.backgroundColor = '#f8f9fa';
                        rows[0].style.borderBottom = '2px solid #e2e8f0';
                        rows[0].querySelectorAll('td').forEach(td => {
                            td.style.fontWeight = '700';
                            td.style.color = '#1e293b';
                        });
                    }

                    // Cell Styling
                    table.querySelectorAll('td, th').forEach(cell => {
                        cell.style.padding = "8px 12px";
                        cell.style.border = "1px solid #cbd5e1";
                        cell.style.color = "#334155";
                        cell.style.whiteSpace = "nowrap"; // Prevent ugly wrapping in preview
                    });
                }
                
                // Show File Name in Header
                const title = document.querySelector('#excel-tool h2');
                if(title) title.innerText = `Excel: ${file.name}`;
            }
            if(typeof showToast === 'function') showToast("Sheet Loaded!", "success");
            
        } catch (error) {
            console.error("Excel Error:", error);
            if(typeof showToast === 'function') showToast("Failed to read Excel file", "error");
        } finally {
            if(typeof loader === 'function') loader(false);
        }
    });
}

// --- 2. PDF GENERATION (SMART SCALING ENGINE) ---
window.generateUltraHDPDF = async () => {
    const sourceTable = document.getElementById('excel-table');
    if(!sourceTable) {
        if(typeof showToast === 'function') showToast("Please upload an Excel file first!", "error");
        return;
    }
    
    // UI Feedback
    if(typeof loader === 'function') loader(true, "RENDERING PDF...");
    const appContainer = document.querySelector('.app-container');

    // --- CONFIGURATION ---
    const useBorder = document.getElementById('pdf-border') ? document.getElementById('pdf-border').checked : true;
    let orientation = document.getElementById('pdf-orient') ? document.getElementById('pdf-orient').value : 'auto';
    
    // Auto-Detect Orientation based on column count
    const colCount = sourceTable.rows[0]?.cells.length || 0;
    if(orientation === 'auto') {
        orientation = colCount > 8 ? 'landscape' : 'portrait';
    }

    try {
        // --- STEP 1: ISOLATION (Create Clean Canvas) ---
        // We hide the app and append a temporary white canvas to body
        if(appContainer) appContainer.style.display = 'none';

        const wrapper = document.createElement('div');
        wrapper.id = 'pdf-render-zone';
        
        // A4 Dimensions (Pixels at 96 DPI)
        // Portrait: 794px | Landscape: 1123px
        const pageWidth = orientation === 'portrait' ? 794 : 1123;
        
        wrapper.style.width = `${pageWidth}px`;
        wrapper.style.minHeight = '100vh';
        wrapper.style.background = '#ffffff';
        wrapper.style.padding = '30px';
        wrapper.style.margin = '0 auto';
        wrapper.style.boxSizing = 'border-box';
        wrapper.style.position = 'absolute';
        wrapper.style.top = '0';
        wrapper.style.left = '0';
        wrapper.style.zIndex = '99999';

        // Add Header
        const date = new Date().toLocaleDateString();
        wrapper.innerHTML = `
            <div style="margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; display:flex; justify-content:space-between; align-items:center;">
                <h2 style="margin:0; font-family:sans-serif; color:#000;">Spreadsheet Export</h2>
                <span style="font-family:monospace; color:#555;">${date}</span>
            </div>
        `;

        // Clone Table for PDF
        const pdfTable = sourceTable.cloneNode(true);
        
        // --- STEP 2: SMART SCALING LOGIC ---
        // If table is too wide, we scale the font down instead of cutting it off
        const baseFontSize = 12;
        let scaleFactor = 1;
        
        // Rough estimation: 100px per column
        const estTableWidth = colCount * 100; 
        const availableWidth = pageWidth - 60; // minus padding

        if(estTableWidth > availableWidth) {
            scaleFactor = availableWidth / estTableWidth;
            // Limit minimum scale so it doesn't become microscopic
            if(scaleFactor < 0.6) scaleFactor = 0.6; 
        }

        const finalFontSize = Math.max(8, Math.floor(baseFontSize * scaleFactor));

        // Apply Print Styles
        pdfTable.style.width = '100%';
        pdfTable.style.borderCollapse = 'collapse';
        pdfTable.style.fontFamily = 'Helvetica, Arial, sans-serif';
        pdfTable.style.fontSize = `${finalFontSize}px`;
        
        pdfTable.querySelectorAll('td, th').forEach(cell => {
            cell.style.border = useBorder ? "1px solid #333" : "1px solid transparent";
            cell.style.padding = "6px";
            cell.style.color = "#000";
            cell.style.wordWrap = "break-word";
            // Fix header background for print
            if(cell.tagName === 'TH' || cell.parentElement.rowIndex === 0) {
                cell.style.backgroundColor = '#eee';
                cell.style.fontWeight = 'bold';
            } else {
                cell.style.backgroundColor = 'transparent';
            }
        });

        wrapper.appendChild(pdfTable);
        document.body.appendChild(wrapper);

        // --- STEP 3: HTML2PDF EXECUTION ---
        const opt = {
            margin: [10, 10, 10, 10], // Top, Left, Bottom, Right
            filename: `Excel_Export_${Date.now()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, // High Res
                useCORS: true, 
                scrollY: 0,
                windowWidth: pageWidth,
                // Improves text sharpness
                letterRendering: true 
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: orientation 
            },
            // Prevent page breaks inside rows
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        await html2pdf().set(opt).from(wrapper).save();
        
        if(typeof showToast === 'function') showToast("PDF Downloaded!", "success");

    } catch (err) {
        console.error("PDF Generation Failed:", err);
        if(typeof showToast === 'function') showToast("Error generating PDF", "error");
    } finally {
        // --- STEP 4: CLEANUP & RESTORE ---
        const renderZone = document.getElementById('pdf-render-zone');
        if(renderZone) document.body.removeChild(renderZone);
        
        if(appContainer) appContainer.style.display = 'flex'; // Restore App
        if(typeof loader === 'function') loader(false);
        window.scrollTo(0, 0);
    }
};
