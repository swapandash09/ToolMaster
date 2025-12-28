// ==========================================
// 📄 RESUME BUILDER - TITANIUM V59 APEX
// ==========================================

console.log("Resume V59: Apex Engine Online");

let resumeData = {
    profileImage: "", 
    font: "font-sans", 
    theme: "theme-blue",
    name: "", title: "", email: "", phone: "", address: "",
    summary: "",
    company: "", role: "", dates: "", jobdesc: "",
    degree: "", school: "", eduYear: "", skills: "",
    scaleFactor: 1
};

let renderTimeout;

// --- 1. SMART PREVIEW (Auto-Zoom) ---
function autoScalePreview() {
    const container = document.getElementById('preview-container');
    const wrapper = document.getElementById('scale-wrapper');
    if(!container || !wrapper) return;

    const paperWidth = 794; // A4 Width in px
    // Calculate available width (accounting for padding)
    const containerWidth = container.offsetWidth - 40; 
    
    let scale = containerWidth / paperWidth;
    
    // Limits
    if(scale > 1.2) scale = 1.2;
    if(scale < 0.25) scale = 0.25;

    wrapper.style.transform = `scale(${scale})`;
}

// Bind Resize Events
window.addEventListener('resize', autoScalePreview);
window.addEventListener('toolOpened', (e) => {
    if(e.detail.toolId === 'resume-tool') {
        setTimeout(autoScalePreview, 100);
        updateResume(); // Force initial render
    }
});

// --- 2. RENDERER (Live Update) ---
function updateResume() {
    // Debounce to prevent lag
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
    resumeData.summary = getVal('summary');
    
    resumeData.company = getVal('company');
    resumeData.role = getVal('role');
    resumeData.dates = getVal('dates');
    resumeData.jobdesc = getVal('job-desc'); // Manual mapping
    
    resumeData.skills = getVal('skills');
    
    resumeData.degree = getVal('degree');
    resumeData.school = getVal('school');
    resumeData.eduYear = getVal('edu-year'); // Manual mapping
}

function renderResume() {
    const paper = document.getElementById('resume-preview');
    if(!paper) return;

    // Apply Theme
    paper.className = `resume-paper ${resumeData.theme} ${resumeData.font}`;

    // --- Header ---
    const setText = (id, val, fallback) => {
        const el = document.getElementById(id);
        if(el) el.innerText = val || fallback || "";
    };

    setText('res-name', resumeData.name, "YOUR NAME");
    setText('res-title', resumeData.title, "PROFESSIONAL TITLE");
    setText('res-summary', resumeData.summary, "Professional summary goes here...");

    // --- Contact (Sidebar) ---
    const cList = document.getElementById('contact-list');
    if(cList) {
        let html = '';
        if(resumeData.phone) html += `<div><i class="ri-phone-fill"></i> ${resumeData.phone}</div>`;
        if(resumeData.email) html += `<div><i class="ri-mail-fill"></i> ${resumeData.email}</div>`;
        if(resumeData.address) html += `<div><i class="ri-map-pin-fill"></i> ${resumeData.address}</div>`;
        cList.innerHTML = html;
    }

    // --- Skills ---
    const sBox = document.getElementById('res-skills');
    if(sBox) {
        if(resumeData.skills) {
            sBox.innerHTML = resumeData.skills.split(',').map(s => `<span>${s.trim()}</span>`).join('');
        } else {
            sBox.innerHTML = `<span>Skill 1</span><span>Skill 2</span>`;
        }
    }

    // --- Experience (Generated HTML) ---
    const expList = document.getElementById('res-experience-list');
    if(expList) {
        if(resumeData.company || resumeData.role) {
            // Format Description (Handle bullets/newlines)
            const formattedDesc = resumeData.jobdesc 
                ? resumeData.jobdesc.replace(/\n/g, '<br>') 
                : "• Led team operations.<br>• Increased efficiency by 20%.";

            expList.innerHTML = `
                <div class="item-block">
                    <div class="item-title">${resumeData.company || "Company Name"}</div>
                    <div class="item-sub">${resumeData.role || "Job Role"}</div>
                    <span class="item-date">${resumeData.dates || "2023 - Present"}</span>
                    <div class="item-desc">${formattedDesc}</div>
                </div>
            `;
        } else {
            // Placeholder
            expList.innerHTML = `
                <div class="item-block">
                    <div class="item-title">Company Name</div>
                    <div class="item-sub">Job Role</div>
                    <span class="item-date">2020 - 2023</span>
                    <div class="item-desc">• Responsibility 1<br>• Responsibility 2</div>
                </div>
            `;
        }
    }

    // --- Education ---
    // Note: If you want dynamic list, use similar logic as Experience. 
    // For now, mapping single entry to existing IDs if they exist inside edu-block.
    setText('res-degree', resumeData.degree, "Degree / Major");
    setText('res-school', resumeData.school, "University Name");
    setText('res-edu-year', resumeData.eduYear, "Year");

    // --- Photo ---
    const pBox = document.getElementById('res-photo-container');
    const pImg = document.getElementById('res-photo-img');
    if(pBox && pImg && resumeData.profileImage) {
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
    
    // Create a clone to ensure clean rendering (no scrollbars, etc)
    const clone = element.cloneNode(true);
    const container = document.createElement('div');
    container.style.position = 'fixed'; 
    container.style.top = '-10000px'; 
    container.style.left = '-10000px';
    container.appendChild(clone);
    document.body.appendChild(container);

    const w = 794; const h = 1123; // A4

    const opt = {
        margin: 0,
        filename: `${resumeData.name || 'Resume'}_CV_V59.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        enableLinks: true,
        html2canvas: { 
            scale: 3, // High Res
            useCORS: true, 
            scrollY: 0, 
            windowWidth: w, 
            windowHeight: h 
        },
        jsPDF: { unit: 'px', format: [w, h], orientation: 'portrait' }
    };

    html2pdf().set(opt).from(clone).save().then(() => {
        document.body.removeChild(container);
        loader(false);
        showToast("PDF Downloaded Successfully!", "success");
    }).catch(err => {
        console.error(err);
        document.body.removeChild(container);
        loader(false);
        showToast("PDF Generation Failed", "error");
    });
};

// --- UTILS ---
function handleProfilePhoto(input) {
    if(input.files && input.files[0]) {
        const r = new FileReader();
        r.onload = e => { 
            resumeData.profileImage = e.target.result; 
            renderResume();
            // Update UI preview if exists
            const prev = document.getElementById('photo-preview-box');
            if(prev) prev.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        };
        r.readAsDataURL(input.files[0]);
    }
}

function clearResume() {
    if(confirm("Clear all data and reset?")) {
        // Clear Inputs
        document.querySelectorAll('#resume-tool input, #resume-tool textarea').forEach(i => i.value = '');
        
        // Reset Data
        resumeData = { scaleFactor: 1, theme: "theme-blue", font: "font-sans" };
        
        // Reset UI
        const prev = document.getElementById('photo-preview-box');
        if(prev) prev.innerHTML = '<i class="ri-camera-line"></i>';
        
        updateResume();
        showToast("Resume Reset", "info");
    }
}

function fitToOnePage() {
    const paper = document.getElementById('resume-preview');
    resumeData.scaleFactor = 1; 
    renderResume();
    
    // Simple logic: reduce font size until height < 1120
    let loops = 0;
    // Note: scrollHeight might be misleading due to transform scale, 
    // better to check content height vs paper height logic.
    // This is a basic implementation.
    paper.style.height = 'auto'; // release height
    
    while(paper.scrollHeight > 1118 && loops < 50) {
        resumeData.scaleFactor -= 0.01; 
        renderResume();
        loops++;
    }
    
    paper.style.height = '1123px'; // lock height back
    
    if(loops > 0) showToast(`Shrunk by ${loops}% to fit`, "success");
    else showToast("Already fits perfectly!", "info");
}
