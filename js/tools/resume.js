// ==========================================
// 📄 RESUME BUILDER - FINAL ENGINE (HD & AUTO-FIT)
// ==========================================

let resumeData = {
    profileImage: "", font: "font-sans", theme: "theme-blue",
    name: "", title: "", email: "", phone: "", address: "",
    linkedin: "", github: "",
    summary: "",
    company: "", role: "", dates: "", jobdesc: "",
    degree: "", school: "", eduYear: "",
    skills: ""
};

// --- 1. SMART SCALER (Fixes Mobile Preview) ---
function autoScalePreview() {
    const container = document.getElementById('preview-container');
    const wrapper = document.getElementById('scale-wrapper');
    const paper = document.getElementById('resume-preview');
    
    if(!container || !wrapper || !paper) return;

    // A4 width in px is approx 794.
    const paperWidth = 794; 
    const containerWidth = container.offsetWidth - 30; // 30px padding
    
    let scale = containerWidth / paperWidth;
    
    // Limits
    if(scale > 1) scale = 1; 
    if(scale < 0.25) scale = 0.25;

    wrapper.style.transform = `scale(${scale})`;
}

// Event Listeners for Scaling
window.addEventListener('resize', autoScalePreview);
window.addEventListener('toolOpened', (e) => {
    if(e.detail.toolId === 'resume-tool') setTimeout(autoScalePreview, 100);
});

// --- 2. DATA HANDLER ---
function updateResume() {
    resumeData.font = getValue('in-font');
    resumeData.name = getValue('in-name');
    resumeData.title = getValue('in-title');
    resumeData.email = getValue('in-email');
    resumeData.phone = getValue('in-phone');
    resumeData.address = getValue('in-address');
    
    // Socials
    resumeData.linkedin = getValue('in-linkedin');
    resumeData.github = getValue('in-github');

    // Experience
    resumeData.company = getValue('in-company');
    resumeData.role = getValue('in-role');
    resumeData.dates = getValue('in-dates');
    resumeData.jobdesc = getValue('in-job-desc');
    
    // Education
    resumeData.degree = getValue('in-degree');
    resumeData.school = getValue('in-school');
    resumeData.eduYear = getValue('in-edu-year');
    
    resumeData.skills = getValue('in-skills');

    // Summary
    resumeData.summary = getValue('in-summary');

    renderResume();
}

function getValue(id) { return document.getElementById(id) ? document.getElementById(id).value : ""; }
function setText(id, val) { const el = document.getElementById(id); if(el) el.innerText = val; }

// --- 3. RENDER ENGINE ---
function renderResume() {
    const paper = document.getElementById('resume-preview');
    if(!paper) return;

    // Set Classes
    paper.className = `resume-paper ${resumeData.theme} ${resumeData.font}`;

    // Header
    setText('res-name', resumeData.name || "YOUR NAME");
    setText('res-title', resumeData.title || "PROFESSIONAL TITLE");

    // Contact Sidebar
    const cBox = document.getElementById('res-contact-box');
    let cHTML = "";
    if(resumeData.phone) cHTML += `<div class="icon-text"><i class="ri-phone-fill"></i> ${resumeData.phone}</div>`;
    if(resumeData.email) cHTML += `<div class="icon-text"><i class="ri-mail-fill"></i> ${resumeData.email}</div>`;
    if(resumeData.address) cHTML += `<div class="icon-text"><i class="ri-map-pin-fill"></i> ${resumeData.address}</div>`;
    cBox.innerHTML = cHTML;

    // Socials Sidebar
    const sBox = document.getElementById('res-socials-box');
    const sSec = document.getElementById('res-socials-section');
    let sHTML = "";
    if(resumeData.linkedin) sHTML += `<div class="icon-text"><i class="ri-linkedin-box-fill"></i> ${resumeData.linkedin}</div>`;
    if(resumeData.github) sHTML += `<div class="icon-text"><i class="ri-github-fill"></i> ${resumeData.github}</div>`;
    
    if(sHTML) { sSec.style.display='block'; sBox.innerHTML=sHTML; } else { sSec.style.display='none'; }

    // Summary
    setText('res-summary', resumeData.summary || "Professional summary...");

    // Experience
    setText('res-company', resumeData.company || "Company Name");
    setText('res-role', resumeData.role || "Job Role");
    setText('res-dates', resumeData.dates || "2021 - Present");
    const job = document.getElementById('res-job-desc');
    if(job) job.innerHTML = resumeData.jobdesc ? resumeData.jobdesc.replace(/\n/g, '<br>') : "• Key responsibilities...";

    // Education
    const eduSec = document.getElementById('res-edu-section');
    if(resumeData.degree) {
        eduSec.style.display = 'block';
        setText('res-degree', resumeData.degree);
        setText('res-school', resumeData.school);
        setText('res-edu-year', resumeData.eduYear);
    } else { eduSec.style.display = 'none'; }

    // Skills
    const sk = document.getElementById('res-skills');
    sk.innerHTML = '';
    if(resumeData.skills) {
        resumeData.skills.split(',').forEach(s => {
            if(s.trim()) sk.innerHTML += `<span class="res-skill-pill">${s.trim()}</span>`;
        });
    }

    // Photo
    const pBox = document.getElementById('res-photo-container');
    const pImg = document.getElementById('res-photo-img');
    if(resumeData.profileImage) {
        pBox.style.display = 'block';
        pImg.src = resumeData.profileImage;
    } else { pBox.style.display = 'none'; }
}

// --- 4. UTILS ---
function handleProfilePhoto(input) {
    if(input.files && input.files[0]) {
        const r = new FileReader();
        r.onload = e => { resumeData.profileImage = e.target.result; renderResume(); };
        r.readAsDataURL(input.files[0]);
    }
}

function setThemeColor(c) { resumeData.theme = `theme-${c}`; renderResume(); }

function clearResume() { 
    if(confirm("Reset all data?")) { 
        resumeData = { font: "font-sans", theme: "theme-blue" }; 
        document.querySelectorAll('.editor-panel input, .editor-panel textarea').forEach(i=>i.value='');
        renderResume(); 
    } 
}

function generateAISummary() {
    const title = getValue('in-title') || "Professional";
    const text = `Experienced ${title} with a proven track record of delivering high-quality results. Skilled in strategic planning, problem-solving, and driving operational efficiency in fast-paced environments.`;
    
    // Typewriter effect
    const el = document.getElementById('in-summary');
    el.value = "";
    let i = 0;
    function type() {
        if(i < text.length) { el.value += text.charAt(i); i++; setTimeout(type, 10); }
        else { updateResume(); }
    }
    type();
}

function saveResumeJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resumeData));
    const dl = document.createElement('a');
    dl.href = dataStr;
    dl.download = `Resume_${resumeData.name || 'Data'}.json`;
    dl.click();
}

function loadResumeJSON(input) {
    const file = input.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const d = JSON.parse(e.target.result);
            resumeData = { ...resumeData, ...d };
            
            // Map Back to Inputs
            const map = {
                'in-name': d.name, 'in-title': d.title, 'in-email': d.email,
                'in-phone': d.phone, 'in-address': d.address, 'in-linkedin': d.linkedin,
                'in-github': d.github, 'in-summary': d.summary, 'in-company': d.company,
                'in-role': d.role, 'in-dates': d.dates, 'in-job-desc': d.jobdesc,
                'in-degree': d.degree, 'in-school': d.school, 'in-edu-year': d.eduYear,
                'in-skills': d.skills, 'in-font': d.font
            };
            
            for (let id in map) {
                const el = document.getElementById(id);
                if(el) el.value = map[id] || "";
            }
            
            renderResume();
            if(typeof showToast === 'function') showToast("Resume Loaded!", "success");
        } catch(err) { 
            if(typeof showToast === 'function') showToast("Invalid JSON File", "error"); 
        }
    };
    reader.readAsText(file);
}

// --- 5. PDF EXPORT (HD & SINGLE PAGE FORCE) ---
function downloadResumePDF() {
    const element = document.getElementById('resume-preview');
    if(typeof loader === 'function') loader(true);

    const safeName = (resumeData.name || 'Resume').replace(/[^a-z0-9]/gi, '_');

    // 1. Create Isolation Overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0'; overlay.style.left = '0';
    overlay.style.width = '100vw'; overlay.style.height = '100vh';
    overlay.style.background = '#ffffff';
    overlay.style.zIndex = '9999999';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.overflow = 'hidden'; 
    
    // 2. Clone Resume
    const clone = element.cloneNode(true);
    const a4Width = 794;
    const a4Height = 1122; 

    clone.style.width = `${a4Width}px`;
    clone.style.minHeight = `${a4Height}px`; 
    clone.style.height = 'auto'; 
    clone.style.transform = 'none';
    clone.style.margin = '0';
    clone.style.boxShadow = 'none';
    clone.style.border = 'none';
    
    overlay.appendChild(clone);
    document.body.appendChild(overlay);

    // 3. SMART FIT (Shrink if too long)
    const contentHeight = clone.scrollHeight;
    
    if (contentHeight > a4Height) {
        const scaleFactor = a4Height / contentHeight;
        // Apply shrink to fit 1 page
        clone.style.transformOrigin = 'top left';
        clone.style.transform = `scale(${scaleFactor})`;
        clone.style.width = `${a4Width / scaleFactor}px`; 
        clone.style.height = `${a4Height / scaleFactor}px`; 
        clone.style.overflow = 'hidden';
    }

    // 4. Generate with High Quality (Scale: 4)
    const opt = {
        margin: 0,
        filename: `${safeName}_CV.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 4, // 4x Quality
            useCORS: true, 
            scrollY: 0,
            windowWidth: clone.scrollWidth,
            windowHeight: clone.scrollHeight
        },
        jsPDF: { 
            unit: 'px', 
            format: [794, 1122], 
            orientation: 'portrait',
            hotfixes: ['px_scaling'] 
        }
    };

    html2pdf().set(opt).from(clone).save().then(() => {
        document.body.removeChild(overlay);
        if(typeof loader === 'function') loader(false);
        if(typeof showToast === 'function') showToast("Resume Downloaded!", "success");
    }).catch(err => {
        console.error(err);
        document.body.removeChild(overlay);
        if(typeof loader === 'function') loader(false);
        if(typeof showToast === 'function') showToast("Error generating PDF", "error");
    });
}
