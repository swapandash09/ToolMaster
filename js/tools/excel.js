// ==========================================
// 📊 EXCEL TO PDF ENGINE (TITANIUM V40 - BLANK FIX FINAL)
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
                    
                    // Preview Styling
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

// --- 2. PDF GENERATION (OVERLAY METHOD - 100% VISIBLE) ---
window.generateUltraHDPDF = () => {
    const el = document.getElementById('excel-table');
    if(!el) {
        if(typeof showToast === 'function') showToast("Please upload an Excel file first!", "error");
        return;
    }
    
    // Loader ON
    if(typeof loader === 'function') loader(true);
    if(typeof showToast === 'function') showToast("Preparing PDF Layout...", "info");

    // Scroll to top to prevent cutting
    window.scrollTo(0,0);

    // --- CONFIG ---
    const useBorder = document.getElementById('pdf-border') ? document.getElementById('pdf-border').checked : true;
    const orientInput = document.getElementById('pdf-orient') ? document.getElementById('pdf-orient').value : 'auto';
    
    // Smart Orientation
    const colCount = el.rows[0]?.cells.length || 0;
    const finalOrientation = orientInput === 'auto' ? (colCount > 8 ? 'landscape' : 'portrait') : orientInput;

    // --- CLONE TABLE ---
    const clone = el.cloneNode(true);
    
    // Force Styles for PDF (Black Text on White)
    clone.style.width = '100%'; 
    clone.style.background = '#ffffff';
    clone.style.color = '#000000';
    clone.style.fontFamily = 'Arial, sans-serif';
    clone.style.borderCollapse = 'collapse';

    clone.querySelectorAll('td, th').forEach(td => {
        td.style.color = '#000000';
        td.style.fontSize = colCount > 10 ? '10px' : '12px';
        td.style.padding = '8px';
        td.style.border = useBorder ? "1px solid #000000" : "none"; 
        td.style.whiteSpace = 'normal';
        td.style.wordBreak = 'break-word';
    });

    // --- THE FIX: VISIBLE OVERLAY WRAPPER ---
    // Hum wrapper ko sabse upar (z-index: 999999) layenge taaki html2canvas use pakka dekh sake.
    const wrapper = document.createElement('div');
    const a4Width = finalOrientation === 'portrait' ? 790 : 1120;
    
    // Positioning ON TOP of everything (White Screen Effect)
    wrapper.style.position = 'absolute'; 
    wrapper.style.top = '0';
    wrapper.style.left = '0';
    wrapper.style.width = `${a4Width}px`;
    wrapper.style.minHeight = '100vh';
    wrapper.style.background = '#ffffff'; 
    wrapper.style.zIndex = '999999'; // Highest priority
    wrapper.style.padding = '20px';
    
    // Add Branding
    const header = document.createElement('div');
    header.innerHTML = `<h2 style="margin-bottom:10px; color:#000;">Excel Export</h2><p style="margin-bottom:20px; color:#555; font-size:12px;">Generated by ToolMaster</p>`;
    wrapper.appendChild(header);
    wrapper.appendChild(clone);
    
    document.body.appendChild(wrapper);

    // --- HTML2PDF CONFIG ---
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

    // --- GENERATE ---
    // Thoda delay dete hain taaki DOM render ho jaye
    setTimeout(() => {
        html2pdf().set(opt).from(wrapper).save().then(() => {
            // Success: Remove Wrapper
            document.body.removeChild(wrapper);
            if(typeof loader === 'function') loader(false);
            if(typeof showToast === 'function') showToast("PDF Saved Successfully!", "success");
        }).catch(err => {
            console.error("PDF Error:", err);
            // Error: Remove Wrapper anyway
            if(document.body.contains(wrapper)) document.body.removeChild(wrapper);
            if(typeof loader === 'function') loader(false);
            if(typeof showToast === 'function') showToast("PDF Generation Failed.", "error");
        });
    }, 800); // 800ms delay for stability
};
