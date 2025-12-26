// ==========================================
// 📊 EXCEL TO PDF PRO (ULTRA HD & CLEANUP)
// ==========================================

const excelInput = document.getElementById('excel-input');

if(excelInput) {
    excelInput.addEventListener('change', (e) => {
        if(typeof loader === 'function') loader(true);
        
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        
        reader.onload = (ev) => {
            const data = new Uint8Array(ev.target.result);
            const workbook = XLSX.read(data, {type:'array'});
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            
            // 1. CLEANING LOGIC: Convert to JSON first to remove extra empty rows/cols
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
            
            // Filter out rows that are completely empty
            const cleanedData = jsonData.filter(row => row.some(cell => cell.toString().trim() !== ""));
            
            // 2. CONVERT CLEANED DATA TO HTML TABLE
            const newSheet = XLSX.utils.aoa_to_sheet(cleanedData);
            const html = XLSX.utils.sheet_to_html(newSheet, { id:'excel-table' });
            
            const container = document.getElementById('excel-preview-container');
            if(container) {
                container.innerHTML = html;
                // Basic styling for preview
                container.querySelectorAll('td, th').forEach(cell => {
                    cell.style.padding = "10px";
                    cell.style.border = "1px solid var(--border)";
                });
            }
            
            if(typeof loader === 'function') loader(false);
            if(typeof showToast === 'function') showToast("Excel Loaded & Cleaned!", "success");
        };
    });
}

window.generateUltraHDPDF = () => {
    const el = document.getElementById('excel-table');
    if(!el) return (typeof showToast === 'function') ? showToast("Please upload excel first!", "error") : alert("No file.");
    
    if(typeof loader === 'function') loader(true);

    // 1. CLONE & RENDER PREP
    const clone = el.cloneNode(true);
    const useBorder = document.getElementById('pdf-border')?.checked ?? true;
    const orient = document.getElementById('pdf-orient')?.value || 'landscape';
    const orientationVal = orient === 'auto' ? 'landscape' : orient;

    // 2. ULTRA HD STYLING (Force White Background for HD)
    clone.style.width = '100%';
    clone.style.background = '#ffffff';
    clone.style.color = '#000000';
    clone.style.fontFamily = "'Outfit', 'Arial', sans-serif";

    clone.querySelectorAll('td, th').forEach(td => {
        td.style.color = '#000000';
        td.style.fontSize = '12px';
        td.style.padding = '8px';
        td.style.border = useBorder ? "1px solid #333333" : "none";
        td.style.textAlign = 'left';
    });

    // 3. WRAPPER FOR SCALING
    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.left = '-9999px'; // Render off-screen
    wrapper.style.top = '0';
    wrapper.style.width = (orientationVal === 'portrait' ? '794px' : '1123px'); // Exact A4 Pixels
    wrapper.style.padding = '40px';
    wrapper.style.background = '#ffffff';
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    // 4. PDF CONFIG (V39 PRO SETTINGS)
    const opt = {
        margin: [10, 10, 10, 10],
        filename: `Clean_Export_${Date.now()}.pdf`,
        image: { type: 'png', quality: 1.0 }, // PNG keeps text sharp
        html2canvas: { 
            scale: 3, // 3x is sweet spot for HD vs File Size
            useCORS: true, 
            letterRendering: true,
            scrollY: 0,
            windowWidth: (orientationVal === 'portrait' ? 800 : 1200)
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: orientationVal }
    };

    // 5. GENERATE & CLEANUP
    html2pdf().set(opt).from(wrapper).save().then(() => {
        document.body.removeChild(wrapper);
        if(typeof loader === 'function') loader(false);
        if(typeof showToast === 'function') showToast("Ultra HD PDF Saved!");
    }).catch(err => {
        console.error(err);
        if(typeof loader === 'function') loader(false);
        document.body.removeChild(wrapper);
    });
}
