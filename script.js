// === CORE ===
function enterSite() {
    document.getElementById('welcome-overlay').style.display = 'none';
    if('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        let u = new SpeechSynthesisUtterance("Welcome to Tool Master Pro. Developed by Swapan.");
        window.speechSynthesis.speak(u);
    }
}
function toggleTheme() { document.body.classList.toggle('light-mode'); }
function showHome() { document.querySelectorAll('.tool-workspace').forEach(e=>e.classList.add('hidden')); document.getElementById('home-page').classList.remove('hidden'); }
function openTool(id) { document.getElementById('home-page').classList.add('hidden'); document.querySelectorAll('.tool-workspace').forEach(e=>e.classList.add('hidden')); document.getElementById(id).classList.remove('hidden'); }
function filterTools() { let v=document.getElementById('search-bar').value.toLowerCase(); document.querySelectorAll('.card').forEach(c=>c.style.display=c.innerText.toLowerCase().includes(v)?'block':'none'); }
document.querySelectorAll('.upload-area').forEach(d => d.addEventListener('click', () => d.querySelector('input').click()));

// ==========================================
// 📊 EXCEL TO PDF (FIXED: NO LOGO, CLEAN TABLE)
// ==========================================
let excelWorkbook = null;
const excelInput = document.getElementById('excel-input');
if(excelInput) {
    excelInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = (ev) => {
            const data = new Uint8Array(ev.target.result);
            excelWorkbook = XLSX.read(data, {type:'array'});
            
            // Generate HTML
            const sheet = excelWorkbook.Sheets[excelWorkbook.SheetNames[0]];
            // ID 'excel-table' ensures specific styling
            const html = XLSX.utils.sheet_to_html(sheet, { id:'excel-table' });
            document.getElementById('excel-preview-container').innerHTML = html;
            
            // AI Analysis (Display Only)
            analyzeExcel(sheet);
        };
    });
}

function analyzeExcel(sheet) {
    const json = XLSX.utils.sheet_to_json(sheet, {header:1});
    const list = document.getElementById('excel-stats-list');
    list.innerHTML = "";
    document.getElementById('excel-ai-analysis').classList.remove('hidden');
    
    const headers = json[0];
    for(let c=0; c<headers.length; c++){
        let sum=0, count=0, isNum=true;
        for(let r=1; r<json.length; r++){
            let v = json[r][c];
            if(typeof v === 'string') v = v.replace(/[^0-9.-]+/g,"");
            if(v && !isNaN(parseFloat(v))) { sum+=parseFloat(v); count++; }
        }
        if(count > 0 && sum > 0) {
            list.innerHTML += `<li><strong>${headers[c]}:</strong> Total: ${sum.toLocaleString()} | Avg: ${(sum/count).toFixed(2)}</li>`;
        }
    }
}

function generateUltraHDPDF() {
    if(!excelWorkbook) return alert("Upload Excel!");
    document.getElementById('loading-overlay').classList.remove('hidden');
    
    // IMPORTANT: Capture ONLY the preview container, NOT the AI stats
    const element = document.getElementById('export-container');
    const orient = document.getElementById('pdf-orient').value;

    const opt = {
        margin: 5,
        filename: 'Clean_Report.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 3, useCORS: true, letterRendering: true }, // Ultra HD
        jsPDF: { unit: 'mm', format: 'a4', orientation: orient }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        document.getElementById('loading-overlay').classList.add('hidden');
    });
}

// ==========================================
// 🔄 PDF TO EXCEL (WORKING)
// ==========================================
async function convertPDFtoExcel() {
    const file = document.getElementById('pdf-to-ex-input').files[0];
    if(!file) return alert("Select PDF");
    document.getElementById('loading-overlay').classList.remove('hidden');

    const reader = new FileReader();
    reader.onload = async function() {
        const pdf = await pdfjsLib.getDocument(new Uint8Array(this.result)).promise;
        let data = [];

        for(let i=1; i<=pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            
            // Row Grouping Logic
            let rows = {};
            textContent.items.forEach(item => {
                const y = Math.round(item.transform[5]); // Y coordinate
                if(!rows[y]) rows[y] = [];
                rows[y].push(item.str);
            });
            
            // Sort Descending Y (Top to Bottom)
            Object.keys(rows).sort((a,b)=>b-a).forEach(y => {
                data.push(rows[y].join(" \t ")); 
            });
        }

        const wb = XLSX.utils.book_new();
        const wsData = data.map(row => row.split("\t"));
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, "PDF_Data");
        XLSX.writeFile(wb, "PDF_Export.xlsx");
        
        document.getElementById('loading-overlay').classList.add('hidden');
    };
    reader.readAsArrayBuffer(file);
}

// ==========================================
// 🖼️ IMAGE COMPRESSOR (NO CUT)
// ==========================================
document.getElementById('img-input').addEventListener('change', e=>{
    const f=e.target.files[0]; if(!f) return;
    const r=new FileReader();
    r.onload=ev=>{
        const i=new Image(); i.src=ev.target.result;
        i.onload=()=>{
            document.getElementById('orig-prev').src=i.src;
            document.getElementById('comp-prev').src=i.src; 
            compressImage(i, 0.8);
        }
    };
    r.readAsDataURL(f);
});
document.getElementById('quality').addEventListener('input', e=>{
    compressImage(document.getElementById('orig-prev'), e.target.value);
});
function compressImage(img, q) {
    const c=document.createElement('canvas');
    c.width=img.width; c.height=img.height;
    const ctx=c.getContext('2d'); ctx.drawImage(img,0,0);
    
    document.getElementById('dl-img-btn').onclick=()=>{
        const u=c.toDataURL('image/jpeg', Number(q));
        let a=document.createElement('a'); a.href=u; a.download='img.jpg'; a.click();
    };
    // Update Preview
    const u=c.toDataURL('image/jpeg', Number(q));
    document.getElementById('comp-prev').src=u;
}

// ==========================================
// 🧮 SMART SUM
// ==========================================
function calculateSum() {
    const txt = document.getElementById('sum-input').value;
    const nums = txt.match(/-?\d+(\.\d+)?/g);
    if(!nums) return alert("No numbers!");
    let s=0, c=0;
    nums.forEach(n => { s += parseFloat(n); c++; });
    document.getElementById('res-sum').innerText = s.toLocaleString();
    document.getElementById('res-cnt').innerText = c;
    document.getElementById('res-avg').innerText = (s/c).toFixed(2);
}

// ==========================================
// OTHER UTILS
// ==========================================
// JPG PDF
const jIn=document.getElementById('jpg-input'); let jFiles=[];
if(jIn) jIn.addEventListener('change',e=>{ jFiles=Array.from(e.target.files); });
async function convertJpgToPdf(){
    if(!jFiles.length) return alert("Select Images");
    const {jsPDF}=window.jspdf; const doc=new jsPDF();
    for(let i=0;i<jFiles.length;i++){
        let d=await new Promise(r=>{let fr=new FileReader();fr.onload=e=>r(e.target.result);fr.readAsDataURL(jFiles[i])});
        let p=doc.getImageProperties(d);
        let w=doc.internal.pageSize.getWidth(); let h=w/(p.width/p.height);
        if(i>0)doc.addPage(); doc.addImage(d,'JPEG',0,0,w,h);
    }
    doc.save("Photos.pdf");
}
// Merge PDF
async function mergePdfs(){
    const f1=document.getElementById('m-pdf1').files[0], f2=document.getElementById('m-pdf2').files[0];
    if(!f1||!f2) return alert("Select 2 PDFs");
    const {PDFDocument}=PDFLib;
    const p1=await PDFDocument.load(await f1.arrayBuffer()), p2=await PDFDocument.load(await f2.arrayBuffer()), m=await PDFDocument.create();
    (await m.copyPages(p1, p1.getPageIndices())).forEach(p=>m.addPage(p));
    (await m.copyPages(p2, p2.getPageIndices())).forEach(p=>m.addPage(p));
    const b=await m.save();
    let l=document.createElement('a'); l.href=URL.createObjectURL(new Blob([b],{type:'application/pdf'})); l.download="merged.pdf"; l.click();
}
// HTML PDF
document.getElementById('html-input').addEventListener('input',e=>{document.getElementById('html-preview').innerHTML=e.target.value});
function convertHtmlToPdf(){const {jsPDF}=window.jspdf;const doc=new jsPDF(); doc.html(document.getElementById('html-preview'),{callback:d=>d.save('web.pdf'),x:10,y:10,width:180,windowWidth:800});}
// Webcam
let vrec, vchunks=[]; async function startRecording(){ let s=await navigator.mediaDevices.getUserMedia({video:true,audio:true}); document.getElementById('webcam-preview').srcObject=s; vrec=new MediaRecorder(s); vrec.ondataavailable=e=>vchunks.push(e.data); vrec.onstop=()=>{let b=new Blob(vchunks,{type:'video/webm'}); let a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download='video.webm'; a.click(); vchunks=[];}; vrec.start(); }
function stopRecording(){ vrec.stop(); document.getElementById('webcam-preview').srcObject.getTracks().forEach(t=>t.stop()); }
// JSON
function formatJSON(){try{document.getElementById('json-output').value=JSON.stringify(JSON.parse(document.getElementById('json-input').value),null,4)}catch(e){}}
                       
