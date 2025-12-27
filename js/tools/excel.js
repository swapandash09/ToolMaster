// ==========================================
// 📊 EXCEL TO PDF ENGINE (TITANIUM V42 - ROBUST)
// ==========================================

console.log("Excel Engine V42: Online");

// --- 1. ROBUST FILE HANDLER & PREVIEW ---
// We wrap this in a function to ensure it runs after DOM load
function initExcelTool() {
    const excelInput = document.getElementById('excel-input');
    
    if(!excelInput) {
        console.warn("Excel Tool: Input element 'excel-input' not found.");
        return;
    }

    // Remove old listeners to prevent duplicates (cloning trick)
    const newExcelInput = excelInput.cloneNode(true);
    excelInput.parentNode.replaceChild(newExcelInput, excelInput);

    newExcelInput.addEventListener('change', async (e) => {
        if(!e.target.files.length) return;

        // CHECK 1: Is the Library Loaded?
        if (typeof XLSX === 'undefined') {
            alert("System Error: SheetJS Library is missing. Please check internet connection or index.html.");
            return;
        }

        const file = e.target.files[0];
        
        // UI Feedback
        if(typeof loader === 'function') loader(true, "PARSING EXCEL...");
        if(typeof showToast === 'function') showToast("Reading Spreadsheet...", "info");
        
        try {
            // Method: ArrayBuffer (Most reliable for modern browsers)
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, {type:'array', cellStyles: true});
            
            // CHECK 2: Does the workbook have sheets?
            if(workbook.SheetNames.length === 0) {
                throw new Error("Excel file appears to be empty.");
            }

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
                
                // CHECK 3: Did a table actually generate?
                if(table) {
                    table.style.width = '100%';
                    table.style.minWidth = '600px'; 
                    table.style.borderCollapse = 'collapse';
                    table.style.fontFamily = "'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
                    table.style.fontSize = '13px';
                    table.style.backgroundColor = '#ffffff';
                    
                    // Header Styling (First Row)
                    const rows = table.querySelectorAll('tr');
                    if(rows.length > 0) {
                        rows[0].style.backgroundColor = '#f8f9fa';
                        rows[0].style.borderBottom = '2px solid #e2e8f0';
                        const headers = rows[0].querySelectorAll('td'); // SheetJS uses td for header often
                        headers.forEach(td => {
                            td.style.fontWeight = '700';
                            td.style.color = '#1e293b';
                            td.style.backgroundColor = '#f1f5f9';
                        });
                    }

                    // Cell Styling
                    table.querySelectorAll('td, th').forEach(cell => {
                        cell.style.padding = "8px 12px";
                        cell.style.border = "1px solid #cbd5e1";
                        cell.style.color = "#334155";
                        cell.style.whiteSpace = "nowrap"; 
                    });
                } else {
                    container.innerHTML = `<div style="padding:20px; text-align:center; color:#ef4444;">Could not render table. The sheet might be empty.</div>`;
                }
                
                // Show File Name in Header (Optional)
                const titleHeader = document.querySelector('#excel-tool h2');
                if(titleHeader) titleHeader.innerText = `Excel: ${file.name}`;
            }
            
            if(typeof showToast === 'function') showToast("Sheet Loaded!", "success");
            
        } catch (error) {
            console.error("Excel Error:", error);
            if(typeof showToast === 'function') showToast("Failed to read file. Is it password protected?", "error");
        } finally {
            if(typeof loader === 'function') loader(false);
            // Clear input so same file can be selected again if needed
            newExcelInput.value = ''; 
        }
    });
}

// Call Init immediately
initExcelTool();


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
    
    // Auto-Detect Orientation
    const colCount = sourceTable.rows[0]?.cells.length || 0;
    if(orientation === 'auto') {
        orientation = colCount > 8 ? 'landscape' : 'portrait';
    }

    try {
        // --- STEP 1: ISOLATION ---
        if(appContainer) appContainer.style.display = 'none';

        const wrapper = document.createElement('div');
        wrapper.id = 'pdf-render-zone';
        
        // A4 Dimensions (Pixels at 96 DPI)
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

        // Clone Table
        const pdfTable = sourceTable.cloneNode(true);
        
        // --- STEP 2: SMART SCALING LOGIC ---
        const baseFontSize = 12;
        let scaleFactor = 1;
        
        const estTableWidth = colCount * 100; 
        const availableWidth = pageWidth - 60; 

        if(estTableWidth > availableWidth) {
            scaleFactor = availableWidth / estTableWidth;
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
            
            // Header Styling Fix
            if(cell.parentElement.rowIndex === 0) {
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
            margin: [10, 10, 10, 10], 
            filename: `Excel_Export_${Date.now()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, 
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
        
        if(typeof showToast === 'function') showToast("PDF Downloaded!", "success");

    } catch (err) {
        console.error("PDF Generation Failed:", err);
        if(typeof showToast === 'function') showToast("Error generating PDF", "error");
    } finally {
        // --- STEP 4: CLEANUP ---
        const renderZone = document.getElementById('pdf-render-zone');
        if(renderZone) document.body.removeChild(renderZone);
        
        if(appContainer) appContainer.style.display = 'flex'; 
        if(typeof loader === 'function') loader(false);
        window.scrollTo(0, 0);
    }
};
