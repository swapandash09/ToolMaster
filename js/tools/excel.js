// ==========================================
// 📊 EXCEL ENGINE - TITANIUM V52 STABLE
// ==========================================

console.log("Excel Engine V52: Online");

// --- 1. ROBUST EXCEL PARSER ---
function initExcelTool() {
    const input = document.getElementById('excel-input');
    if(!input) return;

    // 1. Remove old listeners to prevent memory leaks
    const newInput = input.cloneNode(true);
    input.parentNode.replaceChild(newInput, input);

    newInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if(!file) return;

        if (typeof XLSX === 'undefined') {
            if(typeof showToast === 'function') showToast("System Error: SheetJS Library missing.", "error");
            return;
        }

        if(typeof loader === 'function') loader(true, "PARSING SPREADSHEET...");

        try {
            // 2. Read File
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, {type:'array', cellStyles: true});
            
            if(workbook.SheetNames.length === 0) throw new Error("Empty Excel file");

            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            
            // 3. Generate HTML
            const html = XLSX.utils.sheet_to_html(sheet, { id: 'excel-table', editable: false });
            
            const container = document.getElementById('excel-preview-container');
            if(container) {
                container.innerHTML = html;
                
                // 4. Style Enhancement (Visual Preview)
                const table = container.querySelector('table');
                if(table) {
                    table.style.width = '100%';
                    table.style.minWidth = '600px'; 
                    table.style.borderCollapse = 'collapse';
                    table.style.fontFamily = "'Segoe UI', sans-serif";
                    
                    // Force headers to look distinct
                    const headers = table.querySelectorAll('tr:first-child td');
                    headers.forEach(td => {
                        td.style.fontWeight = 'bold';
                        td.style.background = '#f1f5f9';
                        td.style.color = '#1e293b';
                    });

                    // General Cells
                    table.querySelectorAll('td').forEach(td => {
                        td.style.padding = '8px';
                        td.style.border = '1px solid #e2e8f0';
                        td.style.color = '#334155';
                    });
                } else {
                    container.innerHTML = `<div style="padding:40px; text-align:center; opacity:0.6;">Sheet is empty or unreadable.</div>`;
                }
            }
            if(typeof showToast === 'function') showToast("Excel Loaded Successfully!", "success");
        } catch(err) {
            console.error(err);
            if(typeof showToast === 'function') showToast("Failed to read Excel file.", "error");
        } finally {
            if(typeof loader === 'function') loader(false);
            newInput.value = ''; // Reset input
        }
    });
}

// Initialize
initExcelTool();


// --- 2. EXCEL TO PDF (FIXED BLANK ISSUE) ---
window.generateUltraHDPDF = async () => {
    const sourceTable = document.getElementById('excel-table');
    if(!sourceTable) {
        if(typeof showToast === 'function') showToast("Please upload an Excel file first!", "error");
        return;
    }
    
    if(typeof loader === 'function') loader(true, "RENDERING PDF...");

    try {
        // --- V52 UPGRADE: VIRTUAL PRINT LAYER ---
        // This solves the "Blank PDF" issue by creating a visible, white-background
        // container floating above the app, ensuring html2canvas captures it perfectly.
        
        const printArea = document.createElement('div');
        printArea.id = 'print-area-v52';
        
        // Auto-Detect Orientation
        let orientation = document.getElementById('pdf-orient') ? document.getElementById('pdf-orient').value : 'auto';
        const colCount = sourceTable.rows[0]?.cells.length || 0;
        
        if(orientation === 'auto') {
            orientation = colCount > 8 ? 'landscape' : 'portrait';
        }

        // Set dimensions based on A4 @ 96DPI
        const width = orientation === 'landscape' ? 1123 : 794;
        
        printArea.style.position = 'fixed'; // Must be fixed/absolute to appear on top
        printArea.style.top = '0';
        printArea.style.left = '0';
        printArea.style.width = `${width}px`;
        printArea.style.minHeight = '100vh';
        printArea.style.background = '#ffffff'; // Force White Paper
        printArea.style.color = '#000000'; // Force Black Text
        printArea.style.zIndex = '999999';
        printArea.style.padding = '40px';
        printArea.style.boxSizing = 'border-box';
        
        // Add Professional Header
        const date = new Date().toLocaleDateString();
        printArea.innerHTML = `
            <div style="margin-bottom:20px; border-bottom:2px solid #333; padding-bottom:10px; display:flex; justify-content:space-between; align-items:flex-end;">
                <div>
                    <h1 style="color:#000; margin:0; font-family:sans-serif; font-size:24px; text-transform:uppercase;">Spreadsheet Report</h1>
                    <p style="color:#666; margin:5px 0 0 0; font-size:12px;">Generated via ToolMaster Titanium</p>
                </div>
                <span style="font-family:monospace; color:#666; font-size:14px;">${date}</span>
            </div>
        `;
        
        // Clone and Polish Table for Print
        const tableClone = sourceTable.cloneNode(true);
        tableClone.style.width = '100%';
        tableClone.style.borderCollapse = 'collapse';
        tableClone.style.fontSize = colCount > 10 ? '10px' : '12px'; // Smart Font Scaling
        tableClone.style.fontFamily = 'Arial, sans-serif';
        tableClone.style.color = '#000'; // Enforce Black Text
        tableClone.style.background = 'transparent';

        // Fix Borders & Colors for Print
        const useBorder = document.getElementById('pdf-border') ? document.getElementById('pdf-border').checked : true;
        const borderStyle = useBorder ? '1px solid #444' : '1px solid transparent';

        tableClone.querySelectorAll('td, th').forEach(cell => {
            cell.style.border = borderStyle;
            cell.style.padding = '6px 8px';
            cell.style.color = '#000'; // Force black text
            cell.style.backgroundColor = 'transparent'; // Remove dark mode bg
            cell.style.whiteSpace = 'normal'; // Wrap text
            cell.style.wordBreak = 'break-word';
        });

        // Header Row Styling
        const firstRow = tableClone.querySelector('tr');
        if(firstRow) {
            firstRow.style.backgroundColor = '#f0f0f0';
            firstRow.style.borderBottom = '2px solid #000';
            Array.from(firstRow.children).forEach(c => c.style.fontWeight = 'bold');
        }
        
        printArea.appendChild(tableClone);
        document.body.appendChild(printArea);

        // --- RENDER ---
        const opt = {
            margin: [10, 10, 10, 10], // Top, Left, Bottom, Right
            filename: `Excel_Export_${Date.now()}.pdf`,
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: { 
                scale: 2, // 2x Scale for Retina Quality
                useCORS: true,
                scrollY: 0,
                windowWidth: width,
                backgroundColor: '#ffffff' // Explicit White BG
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: orientation 
            }
        };

        await html2pdf().set(opt).from(printArea).save();
        
        if(typeof showToast === 'function') showToast("PDF Downloaded!", "success");

        // Cleanup
        document.body.removeChild(printArea);

    } catch(e) {
        console.error(e);
        if(typeof showToast === 'function') showToast("PDF Generation Failed.", "error");
        
        // Safety Cleanup
        const ghost = document.getElementById('print-area-v52');
        if(ghost) document.body.removeChild(ghost);
    } finally {
        if(typeof loader === 'function') loader(false);
    }
};
