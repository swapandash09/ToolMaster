// ==========================================
// 📄 RESUME BUILDER - TITANIUM V51 (4K ENGINE)
// ==========================================

let resumeData = {
    // Identity
    profileImage: "", font: "font-sans", theme: "theme-blue",
    name: "", title: "", email: "", phone: "", address: "",
    // Socials
    linkedin: "", github: "",
    // Content
    summary: "",
    company: "", role: "", dates: "", jobdesc: "",
    // Projects & Langs
    projTitle: "", projDesc: "", languages: "",
    // Education & Skills
    degree: "", school: "", eduYear: "", skills: "",
    // Config
    scaleFactor: 1 // For One-Page Fit
};

// --- 1. SMART PREVIEW SCALER ---
function autoScalePreview() {
    const container = document.getElementById('preview-container');
    const wrapper = document.getElementById('scale-wrapper');
    if(!container || !wrapper) return;

    // Standard A4 Ratio
    const paperWidth = 794; 
    const containerWidth = container.offsetWidth - 40; // Padding buffer
    
    let scale = containerWidth / paperWidth;
    if(scale > 1.2) scale = 1.2; 
    if(scale < 0.3) scale = 0.3;

    wrapper.style.transform = `scale(${scale})`;
}

window.addEventListener('resize', autoScalePreview);
window.addEventListener('toolOpened', (e) => {
    if(e.detail.toolId === 'resume-tool') setTimeout(autoScalePreview, 200);
});

// --- 2. DATA HANDLER ---
function updateResume() {
    // Map inputs to data
    const ids = [
        'in-font', 'in-name', 'in-title', 'in-email', 'in-phone', 'in-address',
        'in-linkedin', 'in-github', 'in-company', 'in-role', 'in-dates', 'in-job-desc',
        'in-proj-title', 'in-proj-desc', 'in-languages', 'in-degree', 'in-school',
        'in-edu-year', 'in-skills', 'in-summary'
    ];
    
    // Auto-update state
    ids.forEach(id => {
        const key = id.replace('in-', '').replace(/-([a-z])/g, g => g[1].toUpperCase()); // camelCase
        const el = document.getElementById(id);
        if(el) resumeData[key] = el.value;
    });

    renderResume();
}

// --- 3. RENDER ENGINE ---
function renderResume() {
    const paper = document.getElementById('resume-preview');
    if(!paper) return;

    // Apply Styles
    paper.className = `resume-paper ${resumeData.theme} ${resumeData.font}`;
    paper.style.fontSize = `${14 * resumeData.scaleFactor}px`; // Smart Scaling

    // Helper: Safe Set Text
    const set = (id, val) => {
        const el = document.getElementById(id);
        if(el) el.innerText = val;
    };

    // Header
    set('res-name', resumeData.name || "YOUR NAME");
    set('res-title', resumeData.title || "PROFESSIONAL TITLE");

    // Sidebar: Contact
    const cBox = document.getElementById('res-contact-box');
    if(cBox) {
        let h = '';
        if(resumeData.phone) h += `<div><i class="ri-phone-fill"></i> ${resumeData.phone}</div>`;
        if(resumeData.email) h += `<div><i class="ri-mail-fill"></i> ${resumeData.email}</div>`;
        if(resumeData.address) h += `<div><i class="ri-map-pin-fill"></i> ${resumeData.address}</div>`;
        if(resumeData.linkedin) h += `<div><i class="ri-linkedin-box-fill"></i> ${resumeData.linkedin}</div>`;
        if(resumeData.github) h += `<div><i class="ri-github-fill"></i> ${resumeData.github}</div>`;
        cBox.innerHTML = h;
    }

    // Skills
    const sk = document.getElementById('res-skills');
    if(sk) {
        sk.innerHTML = resumeData.skills.split(',').map(s => s.trim() ? `<span class="tag">${s.trim()}</span>` : '').join('');
    }

    // Languages
    const langSec = document.getElementById('res-lang-section');
    if(langSec) {
        if(resumeData.languages) {
            langSec.style.display = 'block';
            document.getElementById('res-languages').innerText = resumeData.languages;
        } else {
            langSec.style.display = 'none';
        }
    }

    // Main Content
    set('res-summary', resumeData.summary || "Professional summary goes here...");
    
    // Experience
    set('res-company', resumeData.company || "Company Name");
    set('res-role', resumeData.role || "Role");
    set('res-dates', resumeData.dates || "Dates");
    const job = document.getElementById('res-job-desc');
    if(job) job.innerHTML = resumeData.jobDesc ? resumeData.jobDesc.replace(/\n/g, '<br>') : "Responsibilities...";

    // Projects
    const projSec = document.getElementById('res-proj-section');
    if(projSec) {
        if(resumeData.projTitle) {
            projSec.style.display = 'block';
            set('res-proj-title', resumeData.projTitle);
            document.getElementById('res-proj-desc').innerHTML = resumeData.projDesc ? resumeData.projDesc.replace(/\n/g, '<br>') : "";
        } else {
            projSec.style.display = 'none';
        }
    }

    // Education
    const eduSec = document.getElementById('res-edu-section');
    if(eduSec) {
        if(resumeData.degree) {
            eduSec.style.display = 'block';
            set('res-degree', resumeData.degree);
            set('res-school', resumeData.school);
            set('res-edu-year', resumeData.eduYear);
        } else {
            eduSec.style.display = 'none';
        }
    }

    // Profile Photo
    const pBox = document.getElementById('res-photo-container');
    if(pBox) {
        pBox.style.display = resumeData.profileImage ? 'block' : 'none';
        if(resumeData.profileImage) document.getElementById('res-photo-img').src = resumeData.profileImage;
    }
}

// --- 4. ONE-PAGE FIT SYSTEM ---
function fitToOnePage() {
    const paper = document.getElementById('resume-preview');
    // Reset
    resumeData.scaleFactor = 1;
    renderResume();

    // Check Height (A4 Height in px approx 1122)
    const maxHeight = 1115; // slightly less for margin safety
    let iterations = 0;

    // Loop until it fits or gets too small
    while(paper.scrollHeight > maxHeight && iterations < 20) {
        resumeData.scaleFactor -= 0.02; // Reduce by 2%
        renderResume();
        iterations++;
    }

    if(iterations > 0) showToast(`Fitted to page (Scale: ${Math.round(resumeData.scaleFactor * 100)}%)`, "success");
    else showToast("Already fits on one page!", "info");
}

// --- 5. 4K PDF EXPORT ---
function downloadResumePDF() {
    const element = document.getElementById('resume-preview');
    if(typeof loader === 'function') loader(true, "RENDERING 4K PDF...");

    const safeName = (resumeData.name || 'Resume').replace(/[^a-z0-9]/gi, '_');

    // 1. Create a clone for rendering (High Res)
    const clone = element.cloneNode(true);
    
    // Force A4 dimensions on clone
    const a4Width = 794; 
    const a4Height = 1123; 
    
    // Setup isolated container
    const container = document.createElement('div');
    container.style.position = 'fixed'; 
    container.style.top = '-10000px'; 
    container.style.left = '-10000px';
    container.appendChild(clone);
    document.body.appendChild(container);

    // 2. Configure 4K Settings
    const opt = {
        margin: 0,
        filename: `${safeName}_CV_4K.pdf`,
        image: { type: 'jpeg', quality: 1.0 }, // Max Quality
        enableLinks: true,
        html2canvas: { 
            scale: 4, // 4x Resolution (approx 3200px wide)
            useCORS: true, 
            letterRendering: true,
            scrollY: 0,
            windowWidth: a4Width,
            windowHeight: a4Height
        },
        jsPDF: { unit: 'px', format: [a4Width, a4Height], orientation: 'portrait' }
    };

    // 3. Generate
    html2pdf().set(opt).from(clone).save().then(() => {
        document.body.removeChild(container);
        if(typeof loader === 'function') loader(false);
        if(typeof showToast === 'function') showToast("4K Resume Downloaded!", "success");
    }).catch(err => {
        console.error(err);
        document.body.removeChild(container);
        if(typeof loader === 'function') loader(false);
        if(typeof showToast === 'function') showToast("Export Failed", "error");
    });
}

// --- UTILS ---
function handleProfilePhoto(input) {
    if(input.files && input.files[0]) {
        const r = new FileReader();
        r.onload = e => { 
            resumeData.profileImage = e.target.result; 
            renderResume(); 
            // Update UI preview
            const box = document.getElementById('photo-preview-box');
            if(box) box.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        };
        r.readAsDataURL(input.files[0]);
    }
}

function setThemeColor(c) { 
    resumeData.theme = `theme-${c}`; 
    document.querySelectorAll('.c-dot').forEach(d => d.classList.remove('active'));
    renderResume(); 
}

function clearResume() {
    if(confirm("Clear all data?")) {
        resumeData.scaleFactor = 1;
        document.querySelectorAll('input, textarea').forEach(i => i.value = '');
        updateResume();
    }
}
