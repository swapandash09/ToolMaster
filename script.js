// === INIT ===
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

window.addEventListener('load', () => {
    if('speechSynthesis' in window) {
        let u = new SpeechSynthesisUtterance("Welcome to Tool Master Pro.");
        window.speechSynthesis.speak(u);
    }
});

// === UI ===
function toggleTheme() { 
    document.body.classList.toggle('light-mode'); 
    const icon = document.getElementById('theme-icon');
    icon.className = document.body.classList.contains('light-mode') ? 'ri-moon-line' : 'ri-sun-line';
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

function showHome() { document.querySelectorAll('.tool-workspace').forEach(e=>e.classList.add('hidden')); document.getElementById('home-page').classList.remove('hidden'); window.scrollTo(0,0); }
function openTool(id) { document.getElementById('home-page').classList.add('hidden'); document.querySelectorAll('.tool-workspace').forEach(e=>e.classList.add('hidden')); document.getElementById(id).classList.remove('hidden'); window.scrollTo(0,0); }
function filterTools() { let v=document.getElementById('search-bar').value.toLowerCase(); document.querySelectorAll('.tool-card').forEach(c=>c.style.display=c.innerText.toLowerCase().includes(v)?'flex':'none'); }
document.querySelectorAll('.upload-zone').forEach(d => d.addEventListener('click', () => d.querySelector('input').click()));

// === 1. EXCEL TO PDF ===
let excelWorkbook = null;
const excelInput = document.getElementById('excel-input');
if(excelInput) {
    excelInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = (ev) => {
            try {
                const data = new Uint8Array(ev.target.result);
                excelWorkbook = XLSX.read(data, {type:'array'});
                const sheet = excelWorkbook.Sheets[excelWorkbook.SheetNames[0]];
                document.getElementById('excel-preview-container').innerHTML = XLSX.utils.sheet_to_html(sheet, { id:'excel-table' });
                analyzeExcel(sheet);
                showToast("Excel Loaded", "success");
            } catch(e) { showToast("Invalid File", "error"); }
        };
    });
}
function analyzeExcel(sheet) {
    const json = XLSX.utils.sheet_to_json(sheet, {header:1});
    const list = document.getElementById('excel-stats-list');
    list.innerHTML = "";
    document.getElementById('excel-ai-analysis').classList.remove('hidden');
    if(json.length > 0) {
        const headers = json[0];
        for(let c=0; c<headers.length; c++){
            let sum=0, count=0;
            for(let r=1; r<json.length; r++){
                let v = json[r][c];
                if(typeof v === 'string') v = v.replace(/[^0-9.-]+/g,"");
                if(v && !isNaN(parseFloat(v))) { sum+=parseFloat(v); count++; }
            }
            if(count > 0) list.innerHTML += `<li><strong>${headers[c]}</strong>: ${sum.toLocaleString()}</li>`;
        }
    }
}
function generateUltraHDPDF() {
    if(!excelWorkbook) return showToast("Upload Excel First", "error");
    document.getElementById('loading-overlay').classList.remove('hidden');
    const element = document.getElementById('export-container');
    const orient = document.getElementById('pdf-orient').value;
    const opt = { margin: 5, filename: 'ToolMaster_HD.pdf', image: { type: 'jpeg', quality: 1 }, html2canvas: { scale: 3, useCORS: true }, jsPDF: { unit: 'mm', format: 'a4', orientation: orient } };
    html2pdf().set(opt).from(element).save().then(() => {
        document.getElementById('loading-overlay').classList.add('hidden');
        showToast("PDF Downloaded", "success");
    });
}

// === 2. PDF TO EXCEL ===
async function convertPDFtoExcel() {
    const file = document.getElementById('pdf-to-ex-input').files[0];
    if(!file) return showToast("Select PDF", "error");
    document.getElementById('loading-overlay').classList.remove('hidden');
    const reader = new FileReader();
    reader.onload = async function() {
        try {
            const pdf = await pdfjsLib.getDocument(new Uint8Array(this.result)).promise;
            let data = [];
            for(let i=1; i<=pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                let rows = {};
                textContent.items.forEach(item => {
                    const y = Math.round(item.transform[5]);
                    if(!rows[y]) rows[y] = [];
                    rows[y].push(item.str);
                });
                Object.keys(rows).sort((a,b)=>b-a).forEach(y => data.push(rows[y].join("\t")));
            }
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(data.map(r => r.split("\t")));
            XLSX.utils.book_append_sheet(wb, ws, "PDF_Data");
            XLSX.writeFile(wb, "PDF_Export.xlsx");
            showToast("Extraction Successful", "success");
        } catch(e) { showToast("Extraction Failed", "error"); }
        document.getElementById('loading-overlay').classList.add('hidden');
    };
    reader.readAsArrayBuffer(file);
}

// === 3. IMAGE COMPRESSOR (ACCURATE) ===
document.getElementById('img-input').addEventListener('change', e=>{
    const f=e.target.files[0]; if(!f) return;
    document.getElementById('orig-size-display').innerText = formatBytes(f.size);
    const r=new FileReader();
    r.onload=ev=>{
        const i=new Image(); i.src=ev.target.result;
        i.onload=()=>{
            document.getElementById('orig-prev').src=i.src;
            compressImage(i, 0.8);
        }
    };
    r.readAsDataURL(f);
});
document.getElementById('quality').addEventListener('input', e=>{
    document.getElementById('q-val').innerText = Math.round(e.target.value*100)+"%";
    compressImage(document.getElementById('orig-prev'), e.target.value);
});
function compressImage(img, q) {
    const c=document.createElement('canvas');
    c.width=img.width; c.height=img.height;
    const ctx=c.getContext('2d');
    ctx.drawImage(img,0,0);
    const u=c.toDataURL('image/jpeg', Number(q));
    document.getElementById('comp-prev').src=u;
    
    // Calculate Size
    const head = 'data:image/jpeg;base64,';
    const size = Math.round((u.length - head.length)*3/4);
    document.getElementById('comp-size-display').innerText = formatBytes(size);

    document.getElementById('dl-img-btn').onclick=()=>{
        let a=document.createElement('a'); a.href=u; a.download='compressed.jpg'; a.click(); 
        showToast("Image Downloaded", "success");
    };
}
function formatBytes(bytes) {
    if(bytes===0) return '0 Bytes';
    const k=1024, sizes=['Bytes','KB','MB'];
    const i=Math.floor(Math.log(bytes)/Math.log(k));
    return parseFloat((bytes/Math.pow(k,i)).toFixed(2)) + ' ' + sizes[i];
}

// === 4. SUM ===
function calculateSum() {
    const txt = document.getElementById('sum-input').value;
    const nums = txt.match(/-?\d+(\.\d+)?/g);
    if(!nums) return showToast("No numbers found", "error");
    let s=0, c=0; nums.forEach(n => { s += parseFloat(n); c++; });
    document.getElementById('res-sum').innerText = s.toLocaleString();
    document.getElementById('res-cnt').innerText = c;
    document.getElementById('res-avg').innerText = (s/c).toFixed(2);
    showToast("Calculation Done", "success");
}

// === UTILS ===
const jIn=document.getElementById('jpg-input'); let jFiles=[];
if(jIn) jIn.addEventListener('change',e=>{ jFiles=Array.from(e.target.files); });
async function convertJpgToPdf(){ if(!jFiles.length) return showToast("Select Images", "error"); const {jsPDF}=window.jspdf; const doc=new jsPDF(); for(let i=0;i<jFiles.length;i++){ let d=await new Promise(r=>{let fr=new FileReader();fr.onload=e=>r(e.target.result);fr.readAsDataURL(jFiles[i])}); let p=doc.getImageProperties(d); let w=doc.internal.pageSize.getWidth(); let h=w/(p.width/p.height); if(i>0)doc.addPage(); doc.addImage(d,'JPEG',0,0,w,h); } doc.save("Images.pdf"); showToast("PDF Created", "success"); }
async function mergePdfs(){ const f1=document.getElementById('m-pdf1').files[0], f2=document.getElementById('m-pdf2').files[0]; if(!f1||!f2) return showToast("Select 2 PDFs", "error"); const {PDFDocument}=PDFLib; const p1=await PDFDocument.load(await f1.arrayBuffer()), p2=await PDFDocument.load(await f2.arrayBuffer()), m=await PDFDocument.create(); (await m.copyPages(p1, p1.getPageIndices())).forEach(p=>m.addPage(p)); (await m.copyPages(p2, p2.getPageIndices())).forEach(p=>m.addPage(p)); const b=await m.save(); let l=document.createElement('a'); l.href=URL.createObjectURL(new Blob([b],{type:'application/pdf'})); l.download="merged.pdf"; l.click(); showToast("Merged Successfully", "success"); }

