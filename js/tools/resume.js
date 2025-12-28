// ==========================================
// 📄 RESUME BUILDER - TITANIUM V53 EXECUTIVE
// ==========================================

console.log("Resume Engine V53: Executive Core Online");

let resumeData = {
    // Identity
    profileImage: "", font: "font-sans", theme: "theme-blue",
    name: "", title: "", email: "", phone: "", address: "",
    // Content
    summary: "",
    company: "", role: "", dates: "", jobdesc: "",
    // Projects & Langs
    projTitle: "", projDesc: "", languages: "",
    // Education & Skills
    degree: "", school: "", eduYear: "", skills: "",
    // Config
    scaleFactor: 1
};

// --- 1. SMART PREVIEW SCALER (Responsive Zoom) ---
function autoScalePreview() {
    const container = document.getElementById('preview-container');
    const wrapper = document.getElementById('scale-wrapper');
    if(!container || !wrapper) return;

    const paperWidth = 794; // A4 Width px
    const containerWidth = container.offsetWidth - 60; // Padding buffer
    
    let scale = containerWidth / paperWidth;
    // Limits
    if(scale > 1.1) scale = 1.1; 
    if(scale < 0.25) scale = 0.25;

    wrapper.style.transform = `scale(${scale})`;
}

window.addEventListener('resize', autoScalePreview);
window.addEventListener('toolOpened', (e) => {
    if(e.detail.toolId === 'resume-tool') setTimeout(autoScalePreview, 100);
});

// --- 2. DATA BINDING (Real-Time Sync) ---
function updateResume() {
    // Map IDs to Data Keys
    const map = {
        'in-name': 'name', 'in-title': 'title', 
        'in-email': 'email', 'in-phone': 'phone', 'in-address': 'address',
        'in-company': 'company', 'in-role': 'role', 'in-dates': 'dates', 'in-job-desc': 'jobdesc',
        'in-proj-title': 'projTitle', 'in-proj-desc': 'projDesc',
        'in-skills': 'skills', 'in-languages': 'languages',
        'in-degree': 'degree', 'in-school': 'school', 'in-edu-year': 'eduYear',
        'in-summary': 'summary'
    };

    for (const [id, key] of Object.entries(map)) {
        const el = document.getElementById(id);
        if(el) resumeData[key] = el.value;
    }

    renderResume();
}

// --- 3. RENDER ENGINE (Visual Construction) ---
function renderResume() {
    const paper = document.getElementById('resume-preview');
    if(!paper) return;

    // Apply Theme & Font
    paper.className = `resume-paper ${resumeData.theme} ${resumeData.font}`;
    // Font Scaling for Fit
    paper.style.fontSize = `${14 * resumeData.scaleFactor}px`;

    // Helper: Text Injection
    const set = (id, val, fallback = "") => {
        const el = document.getElementById(id);
        if(el) el.innerText = val || fallback;
    };

    // Helper: HTML Injection
    const setHtml = (id, val) => {
        const el = document.getElementById(id);
        if(el) el.innerHTML = val;
    };

    // Header
    set('res-name', resumeData.name, "YOUR NAME");
    set('res-title', resumeData.title, "PROFESSIONAL TITLE");

    // Profile Sidebar (Icon List)
    const cBox = document.getElementById('res-contact-box');
    if(cBox) {
        let h = '';
        // Smart Check: Only show if data exists
        if(resumeData.phone) h += `<div><i class="ri-phone-fill"></i> ${resumeData.phone}</div>`;
        if(resumeData.email) h += `<div><i class="ri-mail-fill"></i> ${resumeData.email}</div>`;
        if(resumeData.address) h += `<div><i class="ri-map-pin-fill"></i> ${resumeData.address}</div>`;
        cBox.innerHTML = h;
    }

    // Skills (Tags)
    const sk = document.getElementById('res-skills');
    if(sk) {
        if(resumeData.skills) {
            sk.innerHTML = resumeData.skills.split(',').map(s => 
                s.trim() ? `<span>${s.trim()}</span>` : ''
            ).join('');
        } else {
            sk.innerHTML = '<span>Skill 1</span><span>Skill 2</span>';
        }
    }

    // Main Content
    set('res-summary', resumeData.summary, "Experienced professional with a proven track record...");
    
    // Experience
    set('res-company', resumeData.company, "Company Name");
    set('res-role', resumeData.role, "Job Role");
    set('res-dates', resumeData.dates, "2020 - Present");
    
    // Smart Description Formatting (Bullets)
    const formatDesc = (text) => {
        if(!text) return "• Responsibility 1\n• Responsibility 2";
        return text.replace(/\n/g, '<br>');
    };
    setHtml('res-job-desc', formatDesc(resumeData.jobdesc));

    // Education
    const eduSec = document.getElementById('res-edu-section');
    if(resumeData.degree || resumeData.school) {
        eduSec.style.display = 'block';
        set('res-degree', resumeData.degree);
        set('res-school', resumeData.school);
        set('res-edu-year', resumeData.eduYear);
    } else {
        // Keep placeholder visible for editing comfort
        set('res-degree', "Degree / Diploma");
        set('res-school', "University Name");
        set('res-edu-year', "2018 - 2022");
    }

    // Profile Photo
    const pImg = document.getElementById('res-photo-img');
    const pBox = document.getElementById('res-photo-container');
    if(pImg && pBox) {
        if(resumeData.profileImage) {
            pImg.src = resumeData.profileImage;
            pBox.style.display = 'block';
        } else {
            // Placeholder Avatar if no image
            pImg.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ccc'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
        }
    }
}

// --- 4. ONE-PAGE FIT ALGORITHM ---
function fitToOnePage() {
    const paper = document.getElementById('resume-preview');
    resumeData.scaleFactor = 1; // Reset
    renderResume();

    const maxHeight = 1118; // Safe printable A4 height
    let loops = 0;

    // Shrink until fit
    while(paper.scrollHeight > maxHeight && loops < 50) {
        resumeData.scaleFactor -= 0.01; 
        renderResume();
        loops++;
    }

    if(loops > 0) showToast(`Optimized! Size reduced by ${loops}%`, "success");
    else showToast("Perfect fit! No adjustment needed.", "info");
}

// --- 5. 4K ULTRA-HD PDF EXPORT ---
function downloadResumePDF() {
    const element = document.getElementById('resume-preview');
    if(typeof loader === 'function') loader(true, "RENDERING 4K PDF...");

    const safeName = (resumeData.name || 'Resume').replace(/[^a-z0-9]/gi, '_');

    // 1. Create High-Fidelity Clone
    const clone = element.cloneNode(true);
    
    // Force A4 Dimensions (Pixels at 96 DPI)
    const a4Width = 794; 
    const a4Height = 1123; 
    
    // Prepare Off-Screen Container
    const container = document.createElement('div');
    container.style.position = 'fixed'; 
    container.style.top = '-10000px'; 
    container.style.left = '-10000px';
    container.appendChild(clone);
    document.body.appendChild(container);

    // 2. Configure V53 Render Engine
    const opt = {
        margin: 0,
        filename: `${safeName}_CV_Executive.pdf`,
        image: { type: 'jpeg', quality: 1.0 }, // Maximum Quality
        enableLinks: true, // Clickable Links
        html2canvas: { 
            scale: 4, // 4x Native Resolution (UHD)
            useCORS: true, 
            letterRendering: true, // Crisper Text
            scrollY: 0,
            windowWidth: a4Width,
            windowHeight: a4Height
        },
        jsPDF: { 
            unit: 'px', 
            format: [a4Width, a4Height], 
            orientation: 'portrait',
            compress: true
        }
    };

    // 3. Execute
    html2pdf().set(opt).from(clone).save().then(() => {
        document.body.removeChild(container);
        if(typeof loader === 'function') loader(false);
        if(typeof showToast === 'function') showToast("4K Resume Saved!", "success");
    }).catch(err => {
        console.error(err);
        document.body.removeChild(container);
        if(typeof loader === 'function') loader(false);
        if(typeof showToast === 'function') showToast("Export Failed", "error");
    });
}

// --- 6. AI WRITER INTEGRATION (RESTORED) ---
window.generateAISummary = () => {
    const title = document.getElementById('in-title').value;
    if(!title) return showToast("Enter Job Title first!", "error");
    
    if(typeof loader === 'function') loader(true, "AI WRITING...");
    
    setTimeout(() => {
        const templates = [
            `Highly motivated ${title} with a proven track record of delivering results. Skilled in strategic planning and driving efficiency in fast-paced environments.`,
            `Experienced ${title} dedicated to optimizing processes and achieving business goals. Strong leader with expertise in modern industry standards.`,
            `Creative and detail-oriented ${title} with a passion for innovation. Proven ability to collaborate with teams and deliver high-quality solutions.`
        ];
        
        const summary = templates[Math.floor(Math.random() * templates.length)];
        
        // Typing Effect
        const el = document.getElementById('in-summary');
        el.value = "";
        let i = 0;
        function type() {
            if(i < summary.length) {
                el.value += summary.charAt(i);
                i++;
                setTimeout(type, 15);
            } else {
                updateResume();
                if(typeof loader === 'function') loader(false);
                showToast("Summary Written!", "success");
            }
        }
        type();
    }, 800);
};

// --- UTILS ---
function handleProfilePhoto(input) {
    if(input.files && input.files[0]) {
        const r = new FileReader();
        r.onload = e => { 
            resumeData.profileImage = e.target.result; 
            renderResume(); 
            // Preview Update
            const box = document.getElementById('photo-preview-box');
            if(box) box.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        };
        r.readAsDataURL(input.files[0]);
    }
}

function clearResume() {
    if(confirm("Reset all data?")) {
        resumeData = { scaleFactor: 1, theme: "theme-blue", font: "font-sans" };
        document.querySelectorAll('#resume-tool input, #resume-tool textarea').forEach(i => i.value = '');
        updateResume();
    }
                              }
