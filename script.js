// ==========================================
// 🚀 TOOLMASTER V35.0 - APEX AI FINAL CODE
// ==========================================

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
const IMGBB_KEY = '6d207e02198a847aa98d0a2a901485a5'; 
let originalImageBase64 = null; 
let processedBg = null; 
let recognition = null; 
let isListening = false;
const synth = window.speechSynthesis;
let voices = [];

// === CORE UTILS ===
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
    document.getElementById('theme-icon').className = document.body.classList.contains('light-mode') ? 'ri-sun-line' : 'ri-moon-line';
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
window.closePrivacy = () => document.getElementById('privacy-modal').classList.add('hidden');

// --- DRAG & DROP HANDLING ---
document.querySelectorAll('.upload-box').forEach(zone => {
    zone.addEventListener('click', () => zone.querySelector('input').click());
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.style.borderColor = "var(--primary)"; zone.style.background = "rgba(99,102,241,0.1)"; });
    zone.addEventListener('dragleave', (e) => { e.preventDefault(); zone.style.borderColor = "var(--border)"; zone.style.background = "transparent"; });
    zone.addEventListener('drop', (e) => {
        e.preventDefault(); zone.style.borderColor = "var(--border)"; zone.style.background = "transparent";
        const input = zone.querySelector('input'); input.files = e.dataTransfer.files;
        input.dispatchEvent(new Event('change'));
    });
});

// 1. EXCEL TO PDF (SMART A4 FIT)
const excelInput = document.getElementById('excel-input');
if(excelInput) {
    excelInput.addEventListener('change', (e) => {
        const file = e.target.files[0]; if(!file) return;
        loader(true, "AI Parsing...");
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = (ev) => {
            try {
                const data = new Uint8Array(ev.target.result);
                excelWorkbook = XLSX.read(data, {type:'array', cellStyles: true});
                const sheet = excelWorkbook.Sheets[excelWorkbook.SheetNames[0]];
                document.getElementById('excel-preview-container').innerHTML = XLSX.utils.sheet_to_html(sheet, { id:'excel-table' });
                showToast("Excel Loaded", "success");
            } catch(e) { showToast("Error Loading Excel", "error"); } finally { loader(false); }
        };
    });
}
window.generateUltraHDPDF = () => {
    const element = document.getElementById('excel-table'); if(!element) return showToast("Upload Excel First", "error");
    loader(true, "Optimizing Layout...");
    const clone = element.cloneNode(true); clone.style.width = '100%'; clone.style.background = 'white';
    const orient = document.getElementById('pdf-orient').value === 'auto' ? 'landscape' : document.getElementById('pdf-orient').value;
    const maxWidth = orient === 'portrait' ? 700 : 1000;
    clone.querySelectorAll('td, th').forEach(td => { td.style.fontSize = '10px'; td.style.padding = '4px'; td.style.border = "1px solid #333"; });
    const wrapper = document.createElement('div'); wrapper.style.padding = '20px'; wrapper.style.width = maxWidth + 'px'; wrapper.appendChild(clone); document.body.appendChild(wrapper);
    html2pdf().set({ margin: 5, filename: 'ToolMaster_Fit.pdf', image: { type: 'jpeg', quality: 1.0 }, html2canvas: { scale: 3, useCORS: true }, jsPDF: { unit: 'mm', format: 'a4', orientation: orient } })
    .from(wrapper).save().then(() => { document.body.removeChild(wrapper); loader(false); triggerConfetti(); });
}

// 2. TEXT TO SPEECH (NEW)
function populateVoices() {
    voices = synth.getVoices();
    const select = document.getElementById('voice-select'); select.innerHTML = '';
    voices.forEach((voice, i) => { const option = document.createElement('option'); option.textContent = `${voice.name} (${voice.lang})`; option.value = i; select.appendChild(option); });
}
populateVoices(); if (speechSynthesis.onvoiceschanged !== undefined) { speechSynthesis.onvoiceschanged = populateVoices; }
window.speakText = () => {
    if (synth.speaking) return;
    const text = document.getElementById('tts-input').value;
    if (text !== '') {
        const utterThis = new SpeechSynthesisUtterance(text);
        utterThis.voice = voices[document.getElementById('voice-select').value];
        utterThis.rate = document.getElementById('rate').value;
        utterThis.onstart = () => { document.querySelector('#text-speech-tool .action-btn').innerHTML = '<i class="ri-volume-vibrate-line"></i> Speaking...'; };
        utterThis.onend = () => { document.querySelector('#text-speech-tool .action-btn').innerHTML = '<i class="ri-play-fill"></i> Play Audio'; };
        synth.speak(utterThis);
    } else showToast("Enter text first", "error");
}
window.stopSpeech = () => { if(synth.speaking) { synth.cancel(); document.querySelector('#text-speech-tool .action-btn').innerHTML = '<i class="ri-play-fill"></i> Play Audio'; } }

// 3. MAGIC ERASER
const bgInput = document.getElementById('bg-input');
if(bgInput) {
    bgInput.addEventListener('change', async (e) => {
        const file = e.target.files[0]; if(!file) return;
        document.getElementById('bg-empty-state').classList.add('hidden'); document.getElementById('bg-processing').classList.remove('hidden');
        const img = new Image(); img.src = URL.createObjectURL(file);
        img.onload = async () => {
            document.getElementById('bg-original-img').src = img.src;
            try {
                const { removeBackground } = await import('https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.5/+esm');
                const blob = await removeBackground(img.src); processedBg = URL.createObjectURL(blob);
                document.getElementById('bg-result-img').src = processedBg;
                document.getElementById('compare-container').classList.remove('hidden'); document.getElementById('dl-bg-btn').disabled = false;
                initSlider(); showToast("Background Removed!", "success");
            } catch(err) { showToast("Processing Failed", "error"); } finally { document.getElementById('bg-processing').classList.add('hidden'); }
        };
    });
}
window.changeBg = (c) => { document.getElementById('bg-result-layer').style.background = c; document.querySelectorAll('.color-btn').forEach(b=>b.classList.remove('active')); if(event.target.classList.contains('color-btn')) event.target.classList.add('active'); };
document.getElementById('dl-bg-btn').onclick = () => { const a=document.createElement('a'); a.href=processedBg; a.download='NoBG.png'; a.click(); };
function initSlider() {
    const box = document.getElementById('compare-container'), overlay = document.getElementById('bg-overlay-layer'), handle = document.getElementById('slider-handle');
    function update(p) { p = Math.max(0, Math.min(100, p)); overlay.style.clipPath = `inset(0 ${100-p}% 0 0)`; handle.style.left = p+"%"; }
    box.onmousemove = (e) => update(((e.clientX - box.getBoundingClientRect().left) / box.getBoundingClientRect().width) * 100);
    box.ontouchmove = (e) => { e.preventDefault(); update(((e.touches[0].clientX - box.getBoundingClientRect().left) / box.getBoundingClientRect().width) * 100); };
}

// 4. PDF TO EXCEL (SMART ROW SORT)
window.convertPDFtoExcel = async () => {
    const input = document.getElementById('pdf-to-ex-input'); if(!input.files.length) return showToast("Select PDF", "error");
    loader(true, "Analyzing Rows...");
    try {
        const fileReader = new FileReader();
        fileReader.onload = async function() {
            const pdf = await pdfjsLib.getDocument(new Uint8Array(this.result)).promise;
            const wb = XLSX.utils.book_new();
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i); const content = await page.getTextContent();
                const rows = {};
                content.items.forEach(item => { const y = Math.round(item.transform[5] / 10) * 10; if(!rows[y]) rows[y] = []; rows[y].push({ x: item.transform[4], text: item.str }); });
                const sortedY = Object.keys(rows).sort((a,b) => b - a);
                const sheetData = [];
                sortedY.forEach(y => { const rowItems = rows[y].sort((a,b) => a.x - b.x); sheetData.push(rowItems.map(item => item.text)); });
                const ws = XLSX.utils.aoa_to_sheet(sheetData); XLSX.utils.book_append_sheet(wb, ws, `Page_${i}`);
            }
            XLSX.writeFile(wb, "ToolMaster_Data.xlsx"); showToast("Excel Created!", "success");
        };
        fileReader.readAsArrayBuffer(input.files[0]);
    } catch(e) { showToast("Error", "error"); } finally { loader(false); }
}

// 5. COMPRESSOR
const imgInput = document.getElementById('img-input');
if(imgInput) {
    imgInput.addEventListener('change', (e) => {
        const file = e.target.files[0]; if(!file) return;
        const reader = new FileReader(); reader.onload = (ev) => { originalImageBase64 = ev.target.result; const img = new Image(); img.src = originalImageBase64; img.onload = () => { document.getElementById('orig-prev').src = originalImageBase64; document.getElementById('orig-size-display').innerText = formatBytes(file.size); liveCompress(); }; }; reader.readAsDataURL(file);
    });
}
window.liveCompress = () => {
    if (!originalImageBase64) return;
    const quality = parseFloat(document.getElementById('quality').value); document.getElementById('q-val').innerText = Math.round(quality*100) + "%";
    const img = new Image(); img.src = originalImageBase64;
    img.onload = () => {
        const canvas = document.createElement('canvas'); canvas.width = img.width; canvas.height = img.height; canvas.getContext('2d').drawImage(img, 0, 0);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        const size = Math.round((compressedDataUrl.length - 23) * 3 / 4);
        document.getElementById('comp-prev').src = compressedDataUrl; document.getElementById('comp-size-display').innerText = formatBytes(size);
        document.getElementById('dl-img-btn').disabled = false;
        document.getElementById('dl-img-btn').onclick = () => { const a = document.createElement('a'); a.href = compressedDataUrl; a.download = 'compressed.jpg'; a.click(); };
    };
}

// 6. PDF TO JPG
window.convertPdfToJpg = async () => {
    const input = document.getElementById('pdf-jpg-input'); if (!input.files.length) return showToast("Select PDF", "error");
    loader(true, "Rendering...");
    const reader = new FileReader(); reader.onload = async function() {
        const pdf = await pdfjsLib.getDocument(new Uint8Array(this.result)).promise;
        const container = document.getElementById('jpg-preview-grid'); container.innerHTML = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i); const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas'); canvas.height = viewport.height; canvas.width = viewport.width;
            await page.render({ canvasContext: canvas.getContext('2d'), viewport: viewport }).promise;
            const imgUrl = canvas.toDataURL('image/jpeg');
            const div = document.createElement('div'); div.className = "img-card"; div.innerHTML = `<img src="${imgUrl}"><a href="${imgUrl}" download="Page_${i}.jpg" class="dl-btn">Download</a>`;
            container.appendChild(div);
        }
        loader(false);
    }; reader.readAsArrayBuffer(input.files[0]);
}

// 7. JPG TO PDF
window.convertJpgToPdf = () => {
    const input = document.getElementById('jpg-input'); if (!input.files.length) return showToast("Select Images", "error");
    loader(true, "Merging...");
    const doc = new window.jspdf.jsPDF(); let processed = 0;
    Array.from(input.files).forEach((file, index) => {
        const reader = new FileReader(); reader.onload = (e) => {
            const img = new Image(); img.src = e.target.result;
            img.onload = () => {
                if (index > 0) doc.addPage();
                const ratio = img.width / img.height; let w = doc.internal.pageSize.getWidth() - 20; let h = w / ratio;
                if (h > doc.internal.pageSize.getHeight() - 20) { h = doc.internal.pageSize.getHeight() - 20; w = h * ratio; }
                doc.addImage(img, 'JPEG', 10, 10, w, h); processed++;
                if(processed === input.files.length) { doc.save('Images.pdf'); loader(false); }
            };
        }; reader.readAsDataURL(file);
    });
}

// 8. QR CODE
const qrInput = document.getElementById('qr-img-input');
if(qrInput) qrInput.addEventListener('change', () => document.getElementById('gen-qr-btn').disabled = false);
document.getElementById('gen-qr-btn').onclick = () => {
    document.getElementById('qr-loading').classList.remove('hidden');
    const formData = new FormData(); formData.append("image", qrInput.files[0]);
    fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: 'POST', body: formData })
    .then(res => res.json()).then(result => {
        if(result.success) {
            const url = result.data.url; document.getElementById('img-share-link').value = url;
            document.getElementById('qrcode').innerHTML = ""; new QRCode(document.getElementById("qrcode"), { text: url, width: 150, height: 150 });
            document.getElementById('qr-empty').classList.add('hidden'); document.getElementById('qr-result-box').classList.remove('hidden');
        } else showToast("Upload Failed", "error");
    }).finally(() => document.getElementById('qr-loading').classList.add('hidden'));
};
window.copyLink = () => { navigator.clipboard.writeText(document.getElementById("img-share-link").value); showToast("Copied!", "success"); }

// 9. SPEECH TO TEXT
window.toggleSpeech = () => {
    if (!('webkitSpeechRecognition' in window)) return showToast("Use Chrome Browser", "error");
    if (isListening) { recognition.stop(); return; }
    recognition = new webkitSpeechRecognition(); recognition.lang = document.getElementById('speech-lang').value; recognition.continuous = true; recognition.interimResults = true;
    recognition.onstart = () => { isListening = true; document.getElementById('mic-btn').classList.add('listening'); document.getElementById('mic-status').innerText = "Listening..."; };
    recognition.onend = () => { isListening = false; document.getElementById('mic-btn').classList.remove('listening'); document.getElementById('mic-status').innerText = "Click Mic"; };
    recognition.onresult = (e) => { let t = ''; for (let i = e.resultIndex; i < e.results.length; ++i) t += e.results[i][0].transcript; document.getElementById('speech-output').value = t; };
    recognition.start();
};
window.copySpeech = () => { navigator.clipboard.writeText(document.getElementById('speech-output').value); showToast("Copied", "success"); }
window.saveTextAsDoc = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([document.getElementById('speech-output').value], { type: "text/plain" })); a.download = "Speech.txt"; a.click(); }

// 10. RESUME BUILDER
window.updateResume = (field, value) => {
    if (field === 'skills') {
        const container = document.getElementById('res-skills'); container.innerHTML = '';
        value.split(',').forEach(skill => { if(skill.trim()) { const t=document.createElement('span'); t.className='skill-tag'; t.innerText=skill.trim(); container.appendChild(t); }});
    } else { const el = document.getElementById(`res-${field}`); if(el) el.innerText = value || (field === 'name' ? 'Your Name' : ''); }
}
window.downloadResumePDF = () => {
    loader(true, "Building Resume...");
    html2pdf().set({ margin: 0, filename: 'Resume.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4' } })
    .from(document.getElementById('resume-preview')).save().then(() => { loader(false); triggerConfetti(); });
}

// 11. PASSWORD
window.generatePass = () => {
    const len = document.getElementById('pass-len').value; const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    const array = new Uint32Array(len); window.crypto.getRandomValues(array);
    let pass = ""; for (let i = 0; i < len; i++) pass += charset[array[i] % charset.length];
    document.getElementById('generated-pass').innerText = pass;
}
window.copyPass = () => { navigator.clipboard.writeText(document.getElementById('generated-pass').innerText); showToast("Copied", "success"); }

function formatBytes(bytes) { if(bytes===0) return '0 Bytes'; const k=1024, sizes=['Bytes','KB','MB']; const i=Math.floor(Math.log(bytes)/Math.log(k)); return parseFloat((bytes/Math.pow(k,i)).toFixed(2)) + ' ' + sizes[i]; }
