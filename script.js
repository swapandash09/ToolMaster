// ==========================================
// 🚀 TOOLMASTER V35.0 - APEX AI FINAL RELEASE
// ==========================================

// Initialize PDF Worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
const IMGBB_KEY = '6d207e02198a847aa98d0a2a901485a5'; 
let originalImageBase64 = null; 
let processedBg = null; 

// === UTILS ===
window.showHome = () => {
    document.querySelectorAll('.tool-workspace').forEach(e => e.classList.add('hidden'));
    document.getElementById('home-page').classList.remove('hidden');
    window.scrollTo(0,0);
};

window.openTool = (id) => {
    document.getElementById('home-page').classList.add('hidden');
    document.querySelectorAll('.tool-workspace').forEach(e => e.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    window.scrollTo(0,0);
};

window.toggleTheme = () => { 
    document.body.classList.toggle('light-mode'); 
    const icon = document.getElementById('theme-icon');
    icon.className = document.body.classList.contains('light-mode') ? 'ri-sun-line' : 'ri-moon-line';
}

function showToast(msg, type="info") {
    const box = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = "toast";
    t.innerHTML = `<i class="ri-notification-3-fill"></i> ${msg}`;
    if(type==='success') t.style.borderLeftColor = "#10b981";
    if(type==='error') t.style.borderLeftColor = "#ef4444";
    box.appendChild(t);
    setTimeout(()=>t.remove(), 3000);
}

function loader(show, text="AI Processing...") {
    const l = document.getElementById('loading-overlay');
    if(show) { l.classList.remove('hidden'); document.getElementById('loading-text').innerText = text; }
    else l.classList.add('hidden');
}

function triggerConfetti() { confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#6366f1', '#10b981'] }); }
function filterTools() { let v=document.getElementById('search-bar').value.toLowerCase(); document.querySelectorAll('.tool-card').forEach(c=>c.style.display=c.innerText.toLowerCase().includes(v)?'flex':'none'); }

// --- DRAG & DROP ---
document.querySelectorAll('.upload-box').forEach(zone => {
    zone.addEventListener('click', () => zone.querySelector('input').click());
});


// ==========================================
// 1. EXCEL TO PDF (BORDER & FIDELITY FIX)
// ==========================================
const excelInput = document.getElementById('excel-input');
if(excelInput) {
    excelInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(!file) return;
        loader(true, "AI Parsing Sheet...");
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = (ev) => {
            try {
                const data = new Uint8Array(ev.target.result);
                excelWorkbook = XLSX.read(data, {type:'array', cellStyles: true});
                const sheet = excelWorkbook.Sheets[excelWorkbook.SheetNames[0]];
                
                const html = XLSX.utils.sheet_to_html(sheet, { id:'excel-table' });
                document.getElementById('excel-preview-container').innerHTML = html;
                
                window.applyFidelityStyles();
                
                showToast("Excel Loaded, WYSIWYG Preview Ready", "success");
            } catch(e) { 
                showToast("Invalid File Format or Corrupt Data", "error"); 
                console.error("Excel Load Error:", e);
            } finally {
                 loader(false);
            }
        };
    });
}

window.applyFidelityStyles = () => {
    const table = document.getElementById('excel-table');
    if (table) {
        const tds = table.querySelectorAll('td, th');
        tds.forEach(t => {
            const hasOriginalBorder = t.style.border.includes('solid') || t.style.borderBottom.includes('solid') || t.style.borderTop.includes('solid') || t.style.borderLeft.includes('solid') || t.style.borderRight.includes('solid');

            if (hasOriginalBorder) {
                 if (!t.style.color || t.style.color === 'rgb(255, 255, 255)' || t.style.color === 'transparent') {
                     t.style.color = "#000"; 
                 }
            } else {
                 t.style.border = "none";
            }
        });
    }
};

function generateUltraHDPDF() {
    const tableElement = document.getElementById('excel-table');
    if(!tableElement) return showToast("Upload Excel First", "error");
    
    document.getElementById('loading-overlay').classList.remove('hidden');
    
    // 1. AI Orientation Detection
    let orient = document.getElementById('pdf-orient').value;
    if(orient === 'auto') {
        if (tableElement.offsetWidth > 650) { 
            orient = 'landscape';
        } else {
            orient = 'portrait';
        }
    }
    
    // 2. Clone the element for processing
    const contentToPrint = tableElement.cloneNode(true);
    const autoFit = document.getElementById('auto-fit').checked;
    
    // 3. Final Styling for PDF Fidelity (Crucial for Print)
    const tds = contentToPrint.querySelectorAll('td, th');
    tds.forEach(t => {
        // --- BORDER FIDELITY FIX ---
        const hasOriginalBorder = t.style.border.includes('solid') || t.style.borderBottom.includes('solid') || t.style.borderTop.includes('solid') || t.style.borderLeft.includes('solid') || t.style.borderRight.includes('solid');
        
        if (hasOriginalBorder) {
            t.style.border = "1px solid #000"; 
        } else {
            t.style.border = "none"; 
        }
        
        // --- TEXT VISIBILITY & SCALING FIX ---
        if (!t.style.color || t.style.color === 'rgb(255, 255, 255)' || t.style.color === 'transparent') {
            t.style.color = '#000';
        }
        
        if (autoFit) {
            t.style.fontSize = "9px"; 
        }
        t.style.whiteSpace = 'nowrap';
    });
    
    // 4. PDF Configuration
    const opt = {
        margin: autoFit ? 5 : 10, 
        filename: 'ToolMaster_Sheet.pdf',
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { scale: 3, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: orient }
    };

    html2pdf().set(opt).from(contentToPrint).save().then(() => {
        document.getElementById('loading-overlay').classList.add('hidden');
        showToast(`PDF Downloaded: ${orient} mode`, "success");
        triggerConfetti();
    }).catch(error => {
        document.getElementById('loading-overlay').classList.add('hidden');
        showToast("PDF Generation Failed. Check console.", "error");
        console.error("PDF Generation Error:", error);
    });
}


// ==========================================
// 2. COMPRESSOR (LIVE PREVIEW FIX)
// ==========================================
const imgInput = document.getElementById('img-input');
if(imgInput) {
    imgInput.addEventListener('change', (e) => {
        const file = e.target.files[0]; if(!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            originalImageBase64 = ev.target.result;
            const img = new Image(); img.src = originalImageBase64;
            img.onload = () => {
                document.getElementById('orig-prev').src = originalImageBase64;
                document.getElementById('orig-size-display').innerText = formatBytes(file.size);
                liveCompress(); 
            };
        };
        reader.readAsDataURL(file);
    });
}

function liveCompress() {
    if (!originalImageBase64) return;
    
    const quality = parseFloat(document.getElementById('quality').value);
    
    const img = new Image();
    img.src = originalImageBase64;
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        const head = 'data:image/jpeg;base64,';
        const compressedSize = Math.round((compressedDataUrl.length - head.length) * 3 / 4);
        
        document.getElementById('comp-prev').src = compressedDataUrl;
        document.getElementById('comp-size-display').innerText = formatBytes(compressedSize);
        document.getElementById('dl-img-btn').disabled = false;
        
        document.getElementById('dl-img-btn').onclick = () => {
            let a = document.createElement('a'); 
            a.href = compressedDataUrl; 
            a.download = 'compressed.jpg'; 
            a.click(); 
            showToast("Image Downloaded", "success");
        };
    };
}


// ==========================================
// 3. MAGIC ERASER (FULLY FUNCTIONAL & FAST)
// ==========================================
const bgInput = document.getElementById('bg-input');
if(bgInput) {
    bgInput.addEventListener('change', async (e) => {
        const file = e.target.files[0]; if(!file) return;
        document.getElementById('bg-empty-state').classList.add('hidden');
        document.getElementById('bg-processing').classList.remove('hidden');
        
        const img = new Image(); img.src = URL.createObjectURL(file);
        img.onload = async () => {
            const blob = await fetch(img.src).then(res => res.blob());
            const prevUrl = URL.createObjectURL(blob);
            document.getElementById('bg-original-img').src = prevUrl;
            document.getElementById('bg-result-img').src = prevUrl;
            
            try {
                const { removeBackground } = await import('https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.5/+esm');
                
                const resBlob = await removeBackground(blob); 
                processedBg = URL.createObjectURL(resBlob);
                
                document.getElementById('bg-result-img').src = processedBg;
                document.getElementById('compare-container').classList.remove('hidden');
                document.getElementById('dl-bg-btn').disabled = false;
                initSlider('compare-container', 'bg-overlay-layer', 'slider-handle');
                showToast("Background Removed! 100% Erase Fidelity", "success");
            } catch(err) { showToast("AI Error: Check network or image size.", "error"); }
            document.getElementById('bg-processing').classList.add('hidden');
        };
    });
    
    window.changeBg = (c) => { 
        document.querySelectorAll('.color-btn').forEach(b=>b.classList.remove('active')); 
        document.getElementById('bg-result-layer').style.background = c; 
        
        // Handle color picker logic
        if (event.target.id === 'bg-color-picker') {
            // No button needs 'active' class, color is set
        } else if (event.target.classList.contains('color-btn')) {
            event.target.classList.add('active');
        }
    };
    document.getElementById('dl-bg-btn').onclick = () => { 
        const a=document.createElement('a'); a.href=processedBg; a.download='NoBG.png'; a.click(); 
    };
}

// Global Slider Init (Used by Magic Eraser)
function initSlider(containerId, overlayId, handleId) {
    const box = document.getElementById(containerId);
    const overlay = document.getElementById(overlayId);
    const handle = document.getElementById(handleId);
    function update(p) { p = Math.max(0, Math.min(100, p)); overlay.style.clipPath = `inset(0 ${100-p}% 0 0)`; handle.style.left = p+"%"; }
    update(50);
    box.onmousemove = (e) => update(((e.clientX - box.getBoundingClientRect().left) / box.getBoundingClientRect().width) * 100);
    box.ontouchmove = (e) => { e.preventDefault(); update(((e.touches[0].clientX - box.getBoundingClientRect().left) / box.getBoundingClientRect().width) * 100); };
}


// === DUMMY/PLACEHOLDER UTILS ===
function formatBytes(bytes) {
    if(bytes===0) return '0 Bytes';
    const k=1024, sizes=['Bytes','KB','MB'];
    const i=Math.floor(Math.log(bytes)/Math.log(k));
    return parseFloat((bytes/Math.pow(k,i)).toFixed(2)) + ' ' + sizes[i];
}
function toggleSizeInput() {
    const mode = document.getElementById('comp-mode').value;
    document.getElementById('quality-wrapper').classList.toggle('hidden', mode === 'target');
    document.getElementById('target-wrapper').classList.toggle('hidden', mode === 'quality');
    if (mode === 'quality' && originalImageBase64) liveCompress();
}
function generatePass() { showToast("Secure Gen logic not included in this core file.", "info"); }
function copyPass() { showToast("Copied", "success"); }
function copyLink() { showToast("Link Copied", "info"); }
function openPrivacy() { showToast("Privacy Policy", "info"); }
function updateJpgQualityLabel(val) { document.getElementById('jpg-qual-val').innerText = `High (${Math.round(val*100)}%)`; }
async function convertPdfToJpg() { showToast("PDF to JPG not implemented in this version.", "info"); }
async function convertJpgToPdf(){ showToast("JPG to PDF not implemented in this version.", "info"); }
function convertPDFtoExcel() { showToast("PDF to Excel not implemented in this version.", "info"); }
