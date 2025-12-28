// ==========================================
// 📄 RESUME BUILDER - TITANIUM V53 ENGINE
// ==========================================

console.log("Resume V53: Executive Pro Online");

let resumeData = {
    profileImage: "", font: "font-sans", theme: "theme-blue",
    name: "", title: "", email: "", phone: "", address: "",
    summary: "",
    company: "", role: "", dates: "", jobdesc: "",
    projTitle: "", projDesc: "", languages: "",
    degree: "", school: "", eduYear: "", skills: "",
    scaleFactor: 1
};

// --- 1. SMART PREVIEW (Auto-Zoom) ---
function autoScalePreview() {
    const container = document.getElementById('preview-container');
    const wrapper = document.getElementById('scale-wrapper');
    if(!container || !wrapper) return;

    const paperWidth = 794; 
    const containerWidth = container.offsetWidth - 40; 
    let scale = containerWidth / paperWidth;
    
    if(scale > 1.2) scale = 1.2;
    if(scale < 0.25) scale = 0.25;

    wrapper.style.transform = `scale(${scale})`;
}
window.addEventListener('resize', autoScalePreview);
window.addEventListener('toolOpened', (e) => {
    if(e.detail.toolId === 'resume-tool') setTimeout(autoScalePreview, 100);
});

// --- 2. RENDERER (Live Update) ---
function updateResume() {
    const ids = [
        'name', 'title', 'email', 'phone', 'address',
        'company', 'role', 'dates', 'job-desc',
        'proj-title', 'proj-desc', 'skills', 'languages',
        'degree', 'school', 'edu-year', 'summary'
    ];

    ids.forEach(key => {
        const el = document.getElementById('in-' + key);
        if(el) resumeData[key.replace('-', '')] = el.value; // Remove dash for key
    });
    
    // Manual Fixes for CamelCase
    resumeData.projTitle = document.getElementById('in-proj-title').value;
    resumeData.projDesc = document.getElementById('in-proj-desc').value;
    resumeData.eduYear = document.getElementById('in-edu-year').value;
    resumeData.jobdesc = document.getElementById('in-job-desc').value;

    renderResume();
}

function renderResume() {
    const paper = document.getElementById('resume-preview');
    if(!paper) return;

    // Apply Theme
    paper.className = `resume-paper ${resumeData.theme} ${resumeData.font}`;
    paper.style.fontSize = `${14 * resumeData.scaleFactor}px`;

    // Helpers
    const set = (id, val, fb) => {
        document.getElementById(id).innerText = val || fb || "";
    };

    set('res-name', resumeData.name, "YOUR NAME");
    set('res-title', resumeData.title, "PROFESSIONAL TITLE");
    set('res-summary', resumeData.summary, "Professional summary goes here...");

    // Contact Icons
    const cBox = document.getElementById('res-contact-box');
    let h = '';
    if(resumeData.phone) h += `<div><i class="ri-phone-fill"></i> ${resumeData.phone}</div>`;
    if(resumeData.email) h += `<div><i class="ri-mail-fill"></i> ${resumeData.email}</div>`;
    if(resumeData.address) h += `<div><i class="ri-map-pin-fill"></i> ${resumeData.address}</div>`;
    cBox.innerHTML = h;

    // Skills
    const sBox = document.getElementById('res-skills');
    if(resumeData.skills) {
        sBox.innerHTML = resumeData.skills.split(',').map(s => `<span>${s.trim()}</span>`).join('');
    } else {
        sBox.innerHTML = `<span>Skill 1</span><span>Skill 2</span>`;
    }

    // Experience
    set('res-company', resumeData.company, "Company Name");
    set('res-role', resumeData.role, "Role");
    set('res-dates', resumeData.dates, "2023 - Present");
    
    // Auto-Bullet Formatting
    const jobEl = document.getElementById('res-job-desc');
    if(resumeData.jobdesc) {
        jobEl.innerHTML = resumeData.jobdesc.replace(/\n/g, '<br>');
    } else {
        jobEl.innerHTML = "• Responsibility 1<br>• Responsibility 2";
    }

    // Education
    const eduSec = document.getElementById('res-edu-section');
    if(resumeData.degree || resumeData.school) {
        eduSec.style.display = 'block';
        set('res-degree', resumeData.degree);
        set('res-school', resumeData.school);
        set('res-edu-year', resumeData.eduYear);
    } else {
        set('res-degree', "Degree Name");
        set('res-school', "University");
        set('res-edu-year', "Year");
    }

    // Photo
    const pBox = document.getElementById('res-photo-container');
    const pImg = document.getElementById('res-photo-img');
    if(resumeData.profileImage) {
        pBox.style.display = 'block';
        pImg.src = resumeData.profileImage;
    }
}

// --- 3. AI WRITER (Smart Summary) ---
window.generateAISummary = () => {
    const title = document.getElementById('in-title').value;
    if(!title) return showToast("Enter a Job Title first!", "error");
    
    loader(true, "AI WRITING...");
    
    setTimeout(() => {
        const templates = [
            `Highly motivated ${title} with a proven track record of delivering results. Skilled in strategic planning and driving efficiency in fast-paced environments.`,
            `Experienced ${title} dedicated to optimizing processes and achieving business goals. Strong leader with expertise in modern industry standards.`,
            `Creative ${title} with a passion for innovation. Proven ability to collaborate with teams and deliver high-quality solutions.`
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
                loader(false);
                showToast("Summary Written!", "success");
            }
        }
        type();
    }, 1000);
};

// --- 4. 4K PDF EXPORT ---
window.downloadResumePDF = () => {
    loader(true, "RENDERING 4K PDF...");
    const element = document.getElementById('resume-preview');
    const clone = element.cloneNode(true);
    
    // A4 Dimensions
    const w = 794; const h = 1123;
    
    const container = document.createElement('div');
    container.style.position = 'fixed'; container.style.top = '-10000px';
    container.appendChild(clone);
    document.body.appendChild(container);

    const opt = {
        margin: 0,
        filename: `${resumeData.name || 'Resume'}_CV_V53.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        enableLinks: true,
        html2canvas: { scale: 4, useCORS: true, scrollY: 0, windowWidth: w, windowHeight: h },
        jsPDF: { unit: 'px', format: [w, h], orientation: 'portrait' }
    };

    html2pdf().set(opt).from(clone).save().then(() => {
        document.body.removeChild(container);
        loader(false);
        showToast("PDF Downloaded!", "success");
    });
};

// Utils
function handleProfilePhoto(input) {
    if(input.files && input.files[0]) {
        const r = new FileReader();
        r.onload = e => { 
            resumeData.profileImage = e.target.result; 
            renderResume();
            document.getElementById('photo-preview-box').innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        };
        r.readAsDataURL(input.files[0]);
    }
}

function clearResume() {
    if(confirm("Reset all fields?")) {
        document.querySelectorAll('#resume-tool input, #resume-tool textarea').forEach(i => i.value = '');
        resumeData = { scaleFactor: 1, theme: "theme-blue", font: "font-sans" };
        updateResume();
    }
}

function fitToOnePage() {
    const paper = document.getElementById('resume-preview');
    resumeData.scaleFactor = 1; renderResume();
    let loops = 0;
    while(paper.scrollHeight > 1118 && loops < 50) {
        resumeData.scaleFactor -= 0.01; renderResume();
        loops++;
    }
    showToast(loops > 0 ? `Shrunk by ${loops}%` : "Perfect Fit!", "success");
}
