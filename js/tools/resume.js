// ==========================================
// 📄 RESUME BUILDER - TITANIUM V66 PRO
// ==========================================

console.log("Resume V66: Pro Engine Online");

// 1. STATE MANAGEMENT (With Auto-Save Defaults)
let resumeData = {
    profileImage: "", 
    font: "font-sans", 
    theme: "theme-blue", 
    name: "", title: "", email: "", phone: "", address: "",
    guardian: "", dob: "", languages: "", // Added Languages
    summary: "",
    company: "", role: "", dates: "", jobdesc: "",
    degree: "", school: "", eduYear: "", skills: "",
    scaleFactor: 1
};

let renderTimeout;

// --- 2. INITIALIZATION & AUTO-LOAD ---
document.addEventListener('DOMContentLoaded', () => {
    loadSavedData(); // Restore data on load
});

window.addEventListener('toolOpened', (e) => {
    if(e.detail.toolId === 'resume-tool') {
        setTimeout(autoScalePreview, 100);
        updateResume();
    }
});

window.addEventListener('resize', autoScalePreview);

// --- 3. CORE FUNCTIONS ---

// Theme Switcher
function setTheme(themeName, el) {
    resumeData.theme = themeName;
    
    // UI Visual Update
    if(el) {
        document.querySelectorAll('.theme-dot').forEach(d => {
            d.classList.remove('active');
            d.style.borderColor = 'var(--border)';
            d.style.transform = 'scale(1)';
        });
        el.classList.add('active');
        el.style.borderColor = 'white';
        el.style.transform = 'scale(1.2)';
    }
    
    saveData();
    renderResume();
}

// Data Capture (Reads inputs)
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
    resumeData.languages = getVal('languages'); // New Input

    resumeData.summary = getVal('summary');
    resumeData.company = getVal('company');
    resumeData.role = getVal('role');
    resumeData.dates = getVal('dates');
    resumeData.jobdesc = getVal('job-desc');
    
    resumeData.skills = getVal('skills');
    resumeData.degree = getVal('degree');
    resumeData.school = getVal('school');
    resumeData.eduYear = getVal('edu-year');

    saveData(); // Auto-save on every keystroke
}

// Renderer (Updates HTML)
function renderResume() {
    const paper = document.getElementById('resume-preview');
    if(!paper) return;

    // Apply Theme & Font
    paper.className = `resume-paper ${resumeData.theme} ${resumeData.font}`;

    const setText = (id, val, fb) => {
        const el = document.getElementById(id);
        if(el) el.innerText = val || fb || "";
    };

    setText('res-name', resumeData.name, "YOUR NAME");
    setText('res-title', resumeData.title, "PROFESSIONAL TITLE");
    setText('res-summary', resumeData.summary, "Professional summary goes here...");

    // --- SIDEBAR ---
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

    // Languages (New Section)
    const lBox = document.getElementById('res-languages'); // Needs <div id="res-languages"> in HTML
    const lSec = document.getElementById('lang-section'); // Wrapper
    if(lBox && resumeData.languages) {
        if(lSec) lSec.style.display = 'block';
        lBox.innerHTML = resumeData.languages.split(',').map(l => `<span>${l.trim()}</span>`).join('');
    } else if (lSec) {
        lSec.style.display = 'none';
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

// --- 4. DATA PERSISTENCE (Auto-Save) ---
function saveData() {
    localStorage.setItem('titaniumResumeData', JSON.stringify(resumeData));
}

function loadSavedData() {
    const saved = localStorage.getItem('titaniumResumeData');
    if(saved) {
        resumeData = JSON.parse(saved);
        
        // Restore Inputs
        const setVal = (id, val) => {
            const el = document.getElementById('in-' + id);
            if(el) el.value = val;
        };

        setVal('name', resumeData.name);
        setVal('title', resumeData.title);
        setVal('email', resumeData.email);
        setVal('phone', resumeData.phone);
        setVal('address', resumeData.address);
        setVal('guardian', resumeData.guardian);
        setVal('dob', resumeData.dob);
        setVal('languages', resumeData.languages);
        setVal('summary', resumeData.summary);
        setVal('company', resumeData.company);
        setVal('role', resumeData.role);
        setVal('dates', resumeData.dates);
        setVal('job-desc', resumeData.jobdesc);
        setVal('skills', resumeData.skills);
        setVal('degree', resumeData.degree);
        setVal('school', resumeData.school);
        setVal('edu-year', resumeData.eduYear);

        updateResume();
    }
}

// --- 5. PDF ENGINE (V66: Pixel Perfect) ---
window.downloadResumePDF = async () => {
    loader(true, "RENDERING HD PDF...");
    
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 200)); 

    const element = document.getElementById('resume-preview');
    
    // Create Temporary Container (Off-Screen but Visible to Engine)
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.zIndex = '99999'; 
    container.style.width = '794px'; 
    container.style.background = '#ffffff'; 
    document.body.appendChild(container);

    const clone = element.cloneNode(true);
    clone.style.transform = 'scale(1)'; 
    clone.style.width = '794px';
    clone.style.minHeight = '1123px';
    clone.style.margin = '0';
    
    container.appendChild(clone);

    // Wait for images
    await new Promise(resolve => setTimeout(resolve, 500));

    const opt = {
        margin: 0,
        filename: `${resumeData.name || 'Resume'}_CV.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        enableLinks: true,
        html2canvas: { 
            scale: 2, // High Quality
            useCORS: true, 
            width: 794,
            height: 1123,
            scrollY: 0,
            windowWidth: 794
        },
        jsPDF: { 
            unit: 'px', 
            format: [794, 1123], 
            orientation: 'portrait' 
        }
    };

    try {
        await html2pdf().set(opt).from(clone).save();
        showToast("PDF Downloaded!", "success");
    } catch (err) {
        console.error(err);
        showToast("PDF Failed. Try on Desktop.", "error");
    } finally {
        document.body.removeChild(container); 
        loader(false);
    }
};

// --- UTILS ---
function updateResume() {
    clearTimeout(renderTimeout);
    renderTimeout = setTimeout(() => {
        captureData();
        renderResume();
    }, 50);
}

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

function handleProfilePhoto(input) {
    if(input.files && input.files[0]) {
        const r = new FileReader();
        r.onload = e => { 
            resumeData.profileImage = e.target.result; 
            saveData();
            renderResume();
        };
        r.readAsDataURL(input.files[0]);
    }
}

window.generateAISummary = () => {
    const title = document.getElementById('in-title').value;
    if(!title) return showToast("Enter Job Title first!", "error");
    loader(true, "AI WRITING...");
    
    // Simple Local AI Simulation
    const templates = [
        `Results-oriented ${title} with a proven track record of success. Dedicated to improving efficiency and driving growth.`,
        `Motivated ${title} skilled in problem-solving and collaboration. Ready to leverage skills to contribute to team goals.`,
        `Experienced ${title} with strong technical expertise. Committed to delivering high-quality results in fast-paced environments.`
    ];
    
    setTimeout(() => {
        const summary = templates[Math.floor(Math.random() * templates.length)];
        const el = document.getElementById('in-summary');
        el.value = "";
        let i = 0;
        function type() {
            if(i < summary.length) { el.value += summary.charAt(i); i++; setTimeout(type, 10); } 
            else { updateResume(); loader(false); showToast("Summary Generated", "success"); }
        }
        type();
    }, 800);
};
