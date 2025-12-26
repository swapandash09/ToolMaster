// EXCEL TO PDF LOGIC (Ultra HD Quality Fix)

const excelInput = document.getElementById('excel-input');
if(excelInput) {
    excelInput.addEventListener('change', (e) => {
        // Show loader
        if(typeof loader === 'function') loader(true);
        
        const reader = new FileReader();
        reader.readAsArrayBuffer(e.target.files[0]);
        
        reader.onload = (ev) => {
            const data = new Uint8Array(ev.target.result);
            const workbook = XLSX.read(data, {type:'array', cellStyles: true});
            
            // Get first sheet
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            
            // Convert to HTML
            const html = XLSX.utils.sheet_to_html(sheet, { id:'excel-table' });
            
            // Inject into preview container
            const container = document.getElementById('excel-preview-container');
            if(container) {
                container.innerHTML = html;
                // Add internal padding to cells for better look
                container.querySelectorAll('td, th').forEach(cell => {
                    cell.style.padding = "4px 8px";
                    cell.style.border = "1px solid #ccc";
                });
            }
            
            // Hide loader
            if(typeof loader === 'function') loader(false);
        };
    });
}

window.generateUltraHDPDF = () => {
    const el = document.getElementById('excel-table');
    if(!el) return alert("Please Upload Excel file first.");
    
    if(typeof loader === 'function') loader(true);

    // 1. Create a Clone for High-Res Rendering
    const clone = el.cloneNode(true);
    const useBorder = document.getElementById('pdf-border') ? document.getElementById('pdf-border').checked : true;
    const orient = document.getElementById('pdf-orient') ? document.getElementById('pdf-orient').value : 'landscape';
    const orientationVal = orient === 'auto' ? 'landscape' : orient;

    // 2. FORCE STYLING (Black Text on White Background)
    clone.style.width = '100%'; 
    clone.style.background = '#ffffff';
    clone.style.color = '#000000';
    clone.style.fontFamily = 'Arial, sans-serif'; // Clean font for PDF

    // Apply strict styling to cells
    clone.querySelectorAll('td, th').forEach(td => {
        td.style.color = '#000000';
        td.style.fontSize = '11px'; // Slightly larger for clarity
        td.style.padding = '5px';
        td.style.border = useBorder ? "1px solid #000000" : "none"; // Black borders
        td.style.whiteSpace = 'normal';
        td.style.wordBreak = 'break-word';
    });

    // 3. Create a temporary wrapper for the clone
    const wrapper = document.createElement('div');
    // Set width based on A4 width to ensure fit
    wrapper.style.width = (orientationVal === 'portrait' ? 750 : 1050) + 'px';
    wrapper.style.background = '#ffffff';
    wrapper.style.padding = '20px';
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    // 4. PDF CONFIGURATION (The Quality Fix)
    const opt = {
        margin: [5, 5, 5, 5],
        filename: 'ToolMaster_UltraHD.pdf',
        // USE PNG instead of JPEG for text sharpness
        image: { type: 'png', quality: 1.0 }, 
        html2canvas: { 
            scale: 4, // 4x Resolution (Ultra HD)
            useCORS: true, 
            letterRendering: true, // Better text rendering
            backgroundColor: '#ffffff'
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: orientationVal }
    };

    // 5. Generate
    html2pdf().set(opt).from(wrapper).save().then(() => {
        document.body.removeChild(wrapper);
        if(typeof loader === 'function') loader(false);
        // Trigger confetti if function exists
        if(typeof triggerConfetti === 'function') triggerConfetti();
        if(typeof showToast === 'function') showToast("PDF Downloaded (Ultra HD)");
    }).catch(err => {
        console.error(err);
        document.body.removeChild(wrapper);
        if(typeof loader === 'function') loader(false);
        alert("Error generating PDF");
    });
} Good work but little upgrades and extra row jo zarurat na ho cut out kar de
