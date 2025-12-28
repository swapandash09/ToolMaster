// ==========================================
// 📄 RESUME BUILDER - TITANIUM V65 FINAL
// ==========================================

console.log("Resume V65: Final Engine Online");

let resumeData = {
    profileImage: "", 
    font: "font-sans", 
    theme: "theme-blue", // Default Theme
    name: "", title: "", email: "", phone: "", address: "",
    guardian: "", dob: "",
    summary: "",
    company: "", role: "", dates: "", jobdesc: "",
    degree: "", school: "", eduYear: "", skills: "",
    scaleFactor: 1
};

let renderTimeout;

// --- 1. THEME SWITCHER LOGIC ---
function setTheme(themeName, el) {
    resumeData.theme = themeName;
    
    // UI Update (Visual Selection)
    document.querySelectorAll('.theme-dot').forEach(d => {
        d.classList.remove('active');
        d.style.borderColor = 'var(--border)';
        d.style.transform = 'scale(1)';
    });
    
    // Activate Clicked
    el.classList.add('active');
    el.style.borderColor = 'white';
    el.style.transform = 'scale(1.2)';
    
    // Render
    renderResume();
}

// --- 2. SMART PREVIEW (Auto-Zoom) ---
function autoScalePreview() {
    const container = document.getElementById('preview-container');
    const wrapper = document.getElementById('scale-wrapper');
    if(!container || !wrapper) return;

    const paperWidth = 794; 
    const containerWidth = container.offsetWidth - 40; 
    let scale = containerWidth / paperWidth;
    
    // Limits
    if(scale > 1.2) scale = 1.2;
    if(scale < 0.25) scale = 0.25;

    wrapper.style.transform = `scale(${scale})`;
}

window.addEventListener('resize', autoScalePreview);
window.addEventListener('toolOpened', (e) => {
    if(e.detail.toolId === 'resume-tool') {
        setTimeout(autoScalePreview, 100);
        updateResume();
    }
});

// --- 3. RENDERER (Live Update) ---
function updateResume() {
    clearTimeout(renderTimeout);
    renderTimeout = setTimeout(() => {
        captureData();
        renderResume();
    }, 50);
}

function captureData() {
    const getVal = (id) => {
        const el = document.getElementById('in-' + id);
        return el ? el.value : "";
    };

    resumeData.name = getVal('name');
    resumeData.title = getVal('title');
    resumeData.email = getVal('email');
    resumeData.phone = getVal('phone');
    resumeData.address = getVal('address');
    
    // Personal Details
    resumeData.guardian = getVal('guardian');
    resumeData.dob = getVal('dob');

    resumeData.summary = getVal('summary');
    resumeData.company = getVal('company');
    resumeData.role = getVal('role');
    resumeData.dates = getVal('dates');
    resumeData.jobdesc = getVal('job-desc');
    
    resumeData.skills = getVal('skills');
    resumeData.degree = getVal('degree');
    resumeData.school = getVal('school');
    resumeData.eduYear = getVal('edu-year');
}

function renderResume() {
    const paper = document.getElementById('resume-preview');
    if(!paper) return;

    // Apply Selected Theme
    paper.className = `resume-paper ${resumeData.theme} ${resumeData.font}`;

    const setText = (id, val, fb) => {
        const el = document.getElementById(id);
        if(el) el.innerText = val || fb || "";
    };

    setText('res-name', resumeData.name, "YOUR NAME");
    setText('res-title', resumeData.title, "PROFESSIONAL TITLE");
    setText('res-summary', resumeData.summary, "Professional summary goes here...");

    // --- SIDEBAR (Photo, Contact, Skills) ---
    const cList = document.getElementById('contact-list');
    if(cList) {
        let html = '';
        if(resumeData.phone) html += `<div><i class="ri-phone-fill"></i> ${resumeData.phone}</div>`;
        if(resumeData.email) html += `<div><i class="ri-mail-fill"></i> ${resumeData.email}</div>`;
        if(resumeData.address) html += `<div><i class="ri-map-pin-fill"></i> ${resumeData.address}</div>`;
        
        // Guardian & DOB
        if(resumeData.guardian || resumeData.dob) {
            html += `<div style="margin-top:15px; padding-top:10px; border-top:1px solid rgba(0,0,0,0.1);"></div>`;
            if(resumeData.guardian) html += `<div><i class="ri-user-heart-line"></i> C/O: ${resumeData.guardian}</div>`;
            if(resumeData.dob) html += `<div><i class="ri-calendar-event-line"></i> DOB: ${resumeData.dob}</div>`;
        }
        cList.innerHTML = html;
    }

    // Skills
    const sBox = document.getElementById('res-skills');
    if(sBox) {
        if(resumeData.skills) {
            sBox.innerHTML = resumeData.skills.split(',').map(s => `<span>${s.trim()}</span>`).join('');
        } else {
            sBox.innerHTML = `<span>Skill 1</span><span>Skill 2</span>`;
        }
    }

    // --- MAIN CONTENT ---
    const expList = document.getElementById('res-experience-list');
    if(expList) {
        if(resumeData.company || resumeData.role) {
            const formattedDesc = resumeData.jobdesc ? resumeData.jobdesc.replace(/\n/g, '<br>') : "• Role Description";
            expList.innerHTML = `
                <div class="item-block">
                    <span class="item-date">${resumeData.dates || "Dates"}</span>
                    <div class="item-title">${resumeData.company || "Company"}</div>
                    <div class="item-sub">${resumeData.role || "Role"}</div>
                    <div class="item-desc">${formattedDesc}</div>
                </div>`;
        } else {
            expList.innerHTML = `<div class="item-block"><div class="item-title">Company</div><div class="item-sub">Role</div></div>`;
        }
    }

    setText('res-degree', resumeData.degree, "Degree");
    setText('res-school', resumeData.school, "University");
    setText('res-edu-year', resumeData.eduYear, "Year");

    // Profile Photo
    const pBox = document.getElementById('res-photo-container');
    const pImg = document.getElementById('res-photo-img');
    if(pBox && pImg && resumeData.profileImage) {
        pBox.style.display = 'block';
        pImg.src = resumeData.profileImage;
    }
}

// --- 4. TITANIUM V65: CANVAS-FIRST PDF ENGINE (ZERO CUTOFF) ---
window.downloadResumePDF = async () => {
    loader(true, "GENERATING PDF...");
    
    // 1. Scroll to top (Critical for Mobile)
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 200)); // Wait for scroll to settle

    const element = document.getElementById('resume-preview');
    
    // 2. Create a specific container for the clone
    // We place it absolutely at 0,0 to ensure mobile browser viewport catches it
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.zIndex = '99999'; // On TOP of everything (acting as a temporary overlay)
    container.style.width = '794px';  // A4 Width
    container.style.background = '#ffffff'; // Ensure white background
    container.style.pointerEvents = 'none'; 
    document.body.appendChild(container);

    // 3. Clone and Clean
    const clone = element.cloneNode(true);
    clone.style.transform = 'scale(1)'; // Reset any CSS zoom/scale
    clone.style.width = '794px';
    clone.style.minHeight = '1123px';
    clone.style.margin = '0';
    clone.style.padding = '0';
    clone.style.boxShadow = 'none';
    clone.style.border = 'none';
    
    container.appendChild(clone);

    // 4. Force wait for images in clone to render
    await new Promise(resolve => setTimeout(resolve, 500));

    // 5. HTML2PDF Configuration
    const opt = {
        margin: 0,
        filename: `${resumeData.name || 'Resume'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        enableLinks: true,
        html2canvas: { 
            scale: 2,       // Safe scale for mobile memory (4x can crash phones)
            useCORS: true, 
            width: 794,
            height: 1123,
            scrollY: 0,     // Force top capture
            scrollX: 0,
            windowWidth: 794, // Trick browser into thinking it's desktop width
            windowHeight: 1123
        },
        jsPDF: { 
            unit: 'px', 
            format: [794, 1123], 
            orientation: 'portrait',
            compress: true 
        }
    };

    // 6. Execute
    try {
        await html2pdf().set(opt).from(clone).save();
        showToast("PDF Downloaded!", "success");
    } catch (err) {
        console.error("PDF Fail:", err);
        showToast("PDF Generation Failed", "error");
    } finally {
        document.body.removeChild(container); // Cleanup immediately
        loader(false);
    }
};

// Utils
function handleProfilePhoto(input) {
    if(input.files && input.files[0]) {
        const r = new FileReader();
        r.onload = e => { 
            resumeData.profileImage = e.target.result; 
            renderResume();
        };
        r.readAsDataURL(input.files[0]);
    }
}

// AI Helper
window.generateAISummary = () => {
    const title = document.getElementById('in-title').value;
    if(!title) return showToast("Enter Job Title first!", "error");
    loader(true, "AI WRITING...");
    setTimeout(() => {
        const templates = [
            `Results-oriented ${title} with strong expertise in the industry. Proven track record of improving efficiency.`,
            `Dedicated ${title} with a focus on delivering high-quality results. Skilled in project management.`,
            `Innovative ${title} combining creativity with technical skills. Committed to continuous growth.`
        ];
        const summary = templates[Math.floor(Math.random() * templates.length)];
        const el = document.getElementById('in-summary');
        el.value = "";
        let i = 0;
        function type() {
            if(i < summary.length) { el.value += summary.charAt(i); i++; setTimeout(type, 15); } 
            else { updateResume(); loader(false); }
        }
        type();
    }, 1000);
};
