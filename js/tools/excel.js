// ==========================================
// 📊 EXCEL TO PDF ENGINE (TITANIUM V43 - QUANTUM)
// ==========================================

console.log("Excel Engine V43: Online");

// --- 1. ROBUST FILE HANDLER & PREVIEW ---
function initExcelTool() {
    const excelInput = document.getElementById('excel-input');
    
    if(!excelInput) {
        console.warn("Excel Tool: Input element 'excel-input' not found.");
        return;
    }

    // 1. Clean Slate: Remove old listeners to prevent duplicates
    const newExcelInput = excelInput.cloneNode(true);
    excelInput.parentNode.replaceChild(newExcelInput, excelInput);

    newExcelInput.addEventListener('change', async (e) => {
        if(!e.target.files.length) return;

        // CHECK: Is the Library Loaded?
        if (typeof XLSX === 'undefined') {
            if(typeof showToast === 'function') showToast("System Error: SheetJS Library missing.", "error");
            return;
        }

        const file = e.target.files[0];
        
        // UI Feedback
        if(typeof loader === 'function') loader(true, "PARSING SPREADSHEET...");
        
        try {
            // Method: ArrayBuffer (Most reliable for modern browsers)
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, {type:'array', cellStyles: true});
            
            if(workbook.SheetNames.length === 0) throw new Error("Excel file is empty.");

            // Get First Sheet
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            
            // Generate HTML Table
            const html = XLSX.utils.sheet_to_html(sheet, { id: 'excel-table', editable: false });
            
            const container = document.getElementById('excel-preview-container');
            if(container) {
                container.innerHTML = html;
                
                // Enhance Table Styling (Real Excel Look)
                const table = container.querySelector('table');
                
                if(table) {
                    table.style.width = '100%';
                    table.style.minWidth = '600px'; 
                    table.style.borderCollapse = 'collapse';
                    table.style.fontFamily = "'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
                    table.style.fontSize = '13px';
                    table.style.backgroundColor = '#ffffff';
                    
                    // Header Styling
                    const rows = table.querySelectorAll('tr');
                    if(rows.length > 0) {
                        const headers = rows[0].querySelectorAll('td'); 
                        headers.forEach(td => {
                            td.style.fontWeight = '700';
                            td.style.color = '#1e293b';
                            td.style.backgroundColor = '#f1f5f9';
                            td.style.borderBottom = '2px solid #cbd5e1';
                        });
                    }

                    // Cell Styling
                    table.querySelectorAll('td, th').forEach(cell => {
                        cell.style.padding = "10px 14px";
                        cell.style.border = "1px solid #e2e8f0";
                        cell.style.color = "#334155";
                        cell.style.whiteSpace = "nowrap"; 
                    });
                } else {
                    container.innerHTML = `<div style="padding:40px; text-align:center; color:#ef4444;">Could not parse table data.</div>`;
                }
                
                // Update Title
                const titleHeader = document.querySelector('#excel-tool h2');
                if(titleHeader) titleHeader.innerText = `Active: ${file.name}`;
            }
            
            if(typeof showToast === 'function') showToast("Sheet Loaded Successfully!", "success");
            
        } catch (error) {
            console.error("Excel Error:", error);
            if(typeof showToast === 'function') showToast("Failed to read file. Is it valid?", "error");
        } finally {
            if(typeof loader === 'function') loader(false);
            newExcelInput.value = ''; // Reset
        }
    });
}

// Initialize immediately
initExcelTool();


// --- 2. PDF GENERATION (SMART SCALING ENGINE) ---
window.generateUltraHDPDF = async () => {
    const sourceTable = document.getElementById('excel-table');
    if(!sourceTable) {
        if(typeof showToast === 'function') showToast("Please upload an Excel file first!", "error");
        return;
    }
    
    if(typeof loader === 'function') loader(true, "RENDERING PDF DOCUMENT...");
    
    // Hide App UI to prevent interference
    const appContainer = document.querySelector('.app-container');
    if(appContainer) appContainer.style.display = 'none';

    try {
        // --- CONFIGURATION ---
        const useBorder = document.getElementById('pdf-border') ? document.getElementById('pdf-border').checked : true;
        let orientation = document.getElementById('pdf-orient') ? document.getElementById('pdf-orient').value : 'auto';
        
        // Auto-Detect Orientation based on column count
        const colCount = sourceTable.rows[0]?.cells.length || 0;
        if(orientation === 'auto') {
            orientation = colCount > 7 ? 'landscape' : 'portrait';
        }

        // --- STEP 1: RENDER ZONE ---
        const wrapper = document.createElement('div');
        wrapper.id = 'pdf-render-zone';
        
        // A4 Dimensions (Pixels at 96 DPI)
        const pageWidth = orientation === 'portrait' ? 794 : 1123;
        
        wrapper.style.width = `${pageWidth}px`;
        wrapper.style.minHeight = '100vh';
        wrapper.style.background = '#ffffff';
        wrapper.style.padding = '40px';
        wrapper.style.margin = '0 auto';
        wrapper.style.position = 'absolute';
        wrapper.style.top = '0'; wrapper.style.left = '0'; wrapper.style.zIndex = '99999';

        // Add Report Header
        const date = new Date().toLocaleDateString();
        wrapper.innerHTML = `
            <div style="margin-bottom: 30px; border-bottom: 2px solid #1e293b; padding-bottom: 15px; display:flex; justify-content:space-between; align-items:flex-end;">
                <div>
                    <h2 style="margin:0; font-family:'Helvetica', sans-serif; color:#1e293b; font-size:24px; text-transform:uppercase; letter-spacing:1px;">Spreadsheet Report</h2>
                    <p style="margin:5px 0 0 0; color:#64748b; font-size:12px;">Generated via ToolMaster Titanium</p>
                </div>
                <span style="font-family:monospace; color:#64748b; font-size:14px;">${date}</span>
            </div>
        `;

        // Clone Table for Manipulation
        const pdfTable = sourceTable.cloneNode(true);
        
        // --- STEP 2: SMART SCALING LOGIC ---
        const baseFontSize = 11;
        let scaleFactor = 1;
        
        // Estimate width needed vs available
        const estTableWidth = colCount * 120; 
        const availableWidth = pageWidth - 80; // minus padding

        if(estTableWidth > availableWidth) {
            scaleFactor = availableWidth / estTableWidth;
            if(scaleFactor < 0.55) scaleFactor = 0.55; // Min readability limit
        }

        const finalFontSize = Math.max(7, Math.floor(baseFontSize * scaleFactor));

        // Apply Print Styles
        pdfTable.style.width = '100%';
        pdfTable.style.borderCollapse = 'collapse';
        pdfTable.style.fontFamily = 'Helvetica, Arial, sans-serif';
        pdfTable.style.fontSize = `${finalFontSize}px`;
        
        pdfTable.querySelectorAll('td, th').forEach(cell => {
            cell.style.border = useBorder ? "1px solid #cbd5e1" : "1px solid transparent";
            cell.style.padding = "8px 10px";
            cell.style.color = "#0f172a";
            cell.style.wordWrap = "break-word";
            
            // Header Styling
            if(cell.parentElement.rowIndex === 0) {
                cell.style.backgroundColor = '#f1f5f9';
                cell.style.fontWeight = 'bold';
                cell.style.borderBottom = '2px solid #94a3b8';
            } else {
                cell.style.backgroundColor = 'transparent';
            }
        });

        wrapper.appendChild(pdfTable);
        document.body.appendChild(wrapper);

        // --- STEP 3: HIGH-RES CAPTURE ---
        const opt = {
            margin: [10, 10, 10, 10], 
            filename: `Titanium_Sheet_${Date.now()}.pdf`,
            image: { type: 'jpeg', quality: 1.0 }, // Max Quality
            html2canvas: { 
                scale: 2, // Retina Scale
                useCORS: true, 
                scrollY: 0,
                windowWidth: pageWidth,
                letterRendering: true 
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: orientation 
            },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        await html2pdf().set(opt).from(wrapper).save();
        
        if(typeof showToast === 'function') showToast("PDF Successfully Exported!", "success");

    } catch (err) {
        console.error("PDF Render Error:", err);
        if(typeof showToast === 'function') showToast("Export Failed. Check console.", "error");
    } finally {
        // --- STEP 4: CLEANUP & RESTORE ---
        const renderZone = document.getElementById('pdf-render-zone');
        if(renderZone) document.body.removeChild(renderZone);
        
        if(appContainer) appContainer.style.display = 'flex'; 
        if(typeof loader === 'function') loader(false);
        window.scrollTo(0, 0);
    }
};
