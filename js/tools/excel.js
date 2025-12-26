// ==========================================
// 📊 EXCEL TO PDF ENGINE (TITANIUM V40 - ISOLATION FIX)
// ==========================================

console.log("Excel Engine V40: Loaded");

// --- 1. FILE HANDLER & PREVIEW ---
const excelInput = document.getElementById('excel-input');
if(excelInput) {
    excelInput.addEventListener('change', (e) => {
        if(!e.target.files.length) return;

        if(typeof loader === 'function') loader(true);
        if(typeof showToast === 'function') showToast("Reading Excel File...", "info");
        
        const reader = new FileReader();
        reader.readAsArrayBuffer(e.target.files[0]);
        
        reader.onload = (ev) => {
            try {
                const data = new Uint8Array(ev.target.result);
                const workbook = XLSX.read(data, {type:'array', cellStyles: true});
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                
                const html = XLSX.utils.sheet_to_html(sheet, { id:'excel-table', editable:false });
                
                const container = document.getElementById('excel-preview-container');
                if(container) {
                    container.innerHTML = html;
                    
                    // Style Preview Table
                    const table = container.querySelector('table');
                    if(table) {
                        table.style.width = '100%';
                        table.style.borderCollapse = 'collapse';
                        table.style.fontFamily = 'Arial, sans-serif';
                        table.style.fontSize = '12px';
                        
                        table.querySelectorAll('td, th').forEach(cell => {
                            cell.style.padding = "8px 12px";
                            cell.style.border = "1px solid #e2e8f0";
                            cell.style.color = "#333";
                        });
                        
                        table.querySelectorAll('tr:first-child td').forEach(head => {
                            head.style.backgroundColor = "#f8fafc";
                            head.style.fontWeight = "bold";
                        });
                    }
                }
                if(typeof showToast === 'function') showToast("Excel Loaded Successfully!", "success");
            } catch (error) {
                console.error(error);
                if(typeof showToast === 'function') showToast("Error reading file", "error");
            } finally {
                if(typeof loader === 'function') loader(false);
            }
        };
    });
}

// --- 2. PDF GENERATION (ISOLATION MODE - 100% VISIBLE) ---
window.generateUltraHDPDF = () => {
    const el = document.getElementById('excel-table');
    if(!el) {
        if(typeof showToast === 'function') showToast("Please upload an Excel file first!", "error");
        return;
    }
    
    if(typeof loader === 'function') loader(true);
    if(typeof showToast === 'function') showToast("Generating PDF...", "info");

    // --- CONFIG ---
    const useBorder = document.getElementById('pdf-border') ? document.getElementById('pdf-border').checked : true;
    const orientInput = document.getElementById('pdf-orient') ? document.getElementById('pdf-orient').value : 'auto';
    
    // Determine Orientation
    const colCount = el.rows[0]?.cells.length || 0;
    const finalOrientation = orientInput === 'auto' ? (colCount > 7 ? 'landscape' : 'portrait') : orientInput;

    // --- STEP 1: HIDE MAIN APP ---
    // Hum main app ko chupa denge taaki PDF generator ko koi confusion na ho
    const appContainer = document.querySelector('.app-container');
    if(appContainer) appContainer.style.display = 'none';

    // --- STEP 2: CREATE ISOLATED WRAPPER ---
    const clone = el.cloneNode(true);
    
    // Strict Styles for PDF (White Paper, Black Text)
    clone.style.width = '100%'; 
    clone.style.background = '#ffffff';
    clone.style.color = '#000000';
    clone.style.fontFamily = 'Arial, sans-serif';
    clone.style.borderCollapse = 'collapse';

    clone.querySelectorAll('td, th').forEach(td => {
        td.style.color = '#000000';
        td.style.fontSize = colCount > 10 ? '9px' : '11px';
        td.style.padding = '6px';
        td.style.border = useBorder ? "1px solid #000000" : "none"; 
        td.style.whiteSpace = 'normal';
        td.style.wordBreak = 'break-word';
    });

    const wrapper = document.createElement('div');
    const a4Width = finalOrientation === 'portrait' ? 790 : 1120; // Pixels for A4
    
    // Wrapper Style (Full Screen White Overlay)
    wrapper.style.width = `${a4Width}px`;
    wrapper.style.minHeight = '100vh';
    wrapper.style.background = '#ffffff';
    wrapper.style.padding = '20px';
    wrapper.style.margin = '0 auto'; // Center it
    wrapper.style.boxSizing = 'border-box';
    
    // Add Header
    const header = document.createElement('div');
    header.innerHTML = `<h2 style="color:#000; font-family:sans-serif;">Excel Export</h2><hr style="border:0; border-top:1px solid #ccc; margin:10px 0;">`;
    wrapper.appendChild(header);
    wrapper.appendChild(clone);
    
    document.body.appendChild(wrapper);

    // --- STEP 3: CONFIGURE HTML2PDF ---
    const opt = {
        margin: [10, 10, 10, 10],
        filename: `Excel_Export_${new Date().getTime()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2, 
            useCORS: true, 
            scrollY: 0,
            windowWidth: a4Width,
            logging: false
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: finalOrientation 
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // --- STEP 4: GENERATE & RESTORE ---
    // Scroll to top to ensure capture starts from 0
    window.scrollTo(0, 0);

    setTimeout(() => {
        html2pdf().set(opt).from(wrapper).save().then(() => {
            // SUCCESS: Clean up
            document.body.removeChild(wrapper);
            if(appContainer) appContainer.style.display = 'flex'; // App wapas lao
            
            if(typeof loader === 'function') loader(false);
            if(typeof showToast === 'function') showToast("PDF Downloaded Successfully!", "success");
        }).catch(err => {
            // ERROR: Clean up
            console.error("PDF Error:", err);
            document.body.removeChild(wrapper);
            if(appContainer) appContainer.style.display = 'flex'; // App wapas lao
            
            if(typeof loader === 'function') loader(false);
            if(typeof showToast === 'function') showToast("PDF Failed.", "error");
        });
    }, 500); // 500ms delay to allow DOM to paint
};
