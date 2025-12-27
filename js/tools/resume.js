// ==========================================
// 📄 RESUME BUILDER MODULE (TITANIUM V40 ULTRA)
// ==========================================

let resumeData = {
    // Personal & Header
    profileImage: "", name: "", title: "", 
    email: "", phone: "", address: "", website: "",
    
    // Details
    fathersName: "", nationality: "",

    // Main Content
    summary: "", 
    
    // Experience
    company: "", dates: "", jobdesc: "", 
    
    // Education
    degree: "", school: "", eduYear: "",

    // Skills
    skills: "",
    
    theme: "theme-blue"
};

// --- 1. IMAGE HANDLER (NEW) ---
function handleProfilePhoto(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            resumeData.profileImage = e.target.result; // Store as Base64
            renderResume();
        }
        reader.readAsDataURL(input.files[0]);
    }
}

// --- 2. LIVE UPDATE LOGIC ---
function updateResume() {
    // Basic Info
    resumeData.name = getValue('in-name');
    resumeData.title = getValue('in-title');
    resumeData.email = getValue('in-email');
    resumeData.phone = getValue('in-phone');
    resumeData.address = getValue('in-address');
    resumeData.website = getValue('in-web');
    
    // Personal Details (New)
    resumeData.fathersName = getValue('in-father');
    resumeData.nationality = getValue('in-nation');

    // Content
    resumeData.summary = getValue('in-summary');
    
    // Experience
    resumeData.company = getValue('in-company');
    resumeData.dates = getValue('in-dates');
    resumeData.jobdesc = getValue('in-job-desc');
    
    // Education (New)
    resumeData.degree = getValue('in-degree');
    resumeData.school = getValue('in-school');
    resumeData.eduYear = getValue('in-edu-year');

    // Skills
    resumeData.skills = getValue('in-skills');

    renderResume();
}

function getValue(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
}

// --- 3. RENDER ENGINE (DESIGN UPGRADE) ---
function renderResume() {
    // 1. Profile Photo
    const imgEl = document.getElementById('res-photo-img');
    const imgContainer = document.getElementById('res-photo-container');
    
    if (resumeData.profileImage) {
        imgEl.src = resumeData.profileImage;
        imgContainer.style.display = 'block';
    } else {
        imgContainer.style.display = 'none';
    }

    // 2. Header Name/Title
    setText('res-name', resumeData.name || "YOUR NAME");
    setText('res-title', resumeData.title || "PROFESSIONAL TITLE");
    
    // 3. Contact Info (Sidebar)
    const contactBox = document.getElementById('res-contact-box');
    let contactHTML = "";
    if(resumeData.phone) contactHTML += `<div class="icon-text"><i class="ri-phone-fill"></i> ${resumeData.phone}</div>`;
    if(resumeData.email) contactHTML += `<div class="icon-text"><i class="ri-mail-fill"></i> ${resumeData.email}</div>`;
    if(resumeData.address) contactHTML += `<div class="icon-text"><i class="ri-map-pin-fill"></i> ${resumeData.address}</div>`;
    if(resumeData.website) contactHTML += `<div class="icon-text"><i class="ri-global-line"></i> ${resumeData.website}</div>`;
    if(contactBox) contactBox.innerHTML = contactHTML;

    // 4. Personal Details (Father's Name, etc.)
    const personalBox = document.getElementById('res-personal-box');
    let personalHTML = "";
    if(resumeData.fathersName) personalHTML += `<li><strong>Father's Name:</strong> ${resumeData.fathersName}</li>`;
    if(resumeData.nationality) personalHTML += `<li><strong>Nationality:</strong> ${resumeData.nationality}</li>`;
    
    const personalSection = document.getElementById('res-personal-section');
    if(personalSection) {
        if(personalHTML) {
            personalSection.style.display = 'block';
            personalBox.innerHTML = `<ul>${personalHTML}</ul>`;
        } else {
            personalSection.style.display = 'none';
        }
    }

    // 5. Main Content
    setText('res-summary', resumeData.summary || "Professional summary goes here...");

    // Experience
    setText('res-company', resumeData.company || "Company Name");
    setText('res-dates', resumeData.dates || "2020 - Present");
    const jobDescEl = document.getElementById('res-job-desc');
    if(jobDescEl) jobDescEl.innerHTML = resumeData.jobdesc ? resumeData.jobdesc.replace(/\n/g, '<br>') : "• Describe your responsibilities here.";

    // Education (New)
    const eduSection = document.getElementById('res-edu-section');
    if(resumeData.degree || resumeData.school) {
        eduSection.style.display = 'block';
        setText('res-degree', resumeData.degree || "Degree Name");
        setText('res-school', resumeData.school || "University / School");
        setText('res-edu-year', resumeData.eduYear || "Year");
    } else {
        eduSection.style.display = 'none';
    }

    // Skills
    const skillsContainer = document.getElementById('res-skills');
    if(skillsContainer) {
        skillsContainer.innerHTML = '';
        if(resumeData.skills) {
            resumeData.skills.split(',').forEach(s => {
                if(s.trim()) {
                    const tag = document.createElement('span');
                    tag.className = 'res-skill-pill';
                    tag.innerText = s.trim();
                    skillsContainer.appendChild(tag);
                }
            });
        }
    }
}

function setText(id, val) {
    const el = document.getElementById(id);
    if(el) el.innerText = val;
}

// --- 4. AI & UTILS ---
function generateAISummary() {
    const title = getValue('in-title').toLowerCase();
    const box = document.getElementById('in-summary');
    if(!title) return showToast("Enter Job Title first!", "error");
    
    let aiText = `Experienced ${title} with a proven track record of success. Skilled in problem-solving and dedicated to optimizing results.`;
    
    // Typewriter
    box.value = "";
    let i = 0;
    function typeWriter() {
        if (i < aiText.length) { box.value += aiText.charAt(i); i++; setTimeout(typeWriter, 15); }
        else { updateResume(); }
    }
    typeWriter();
}

function setThemeColor(themeName) {
    const paper = document.getElementById('resume-preview');
    if(!paper) return;
    paper.className = `resume-paper theme-${themeName}`; // Reset classes
    resumeData.theme = `theme-${themeName}`;
}

// --- 5. EXPORT LOGIC ---
function downloadResumePDF() {
    const element = document.getElementById('resume-preview');
    if(typeof loader === 'function') loader(true);

    const safeName = (resumeData.name || 'Resume').replace(/[^a-z0-9]/gi, '_');

    const opt = {
        margin: 0,
        filename: `${safeName}_CV.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0, windowWidth: 1200 }, // Fix for images
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        if(typeof loader === 'function') loader(false);
        if(typeof showToast === 'function') showToast("Resume Saved!", "success");
    });
}

function saveResumeJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resumeData));
    const dl = document.createElement('a');
    dl.href = dataStr;
    dl.download = `Resume_Data.json`;
    dl.click();
}

function loadResumeJSON(input) {
    const file = input.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        resumeData = JSON.parse(e.target.result);
        
        // Fill UI Inputs
        const fields = {
            'in-name': resumeData.name, 'in-title': resumeData.title,
            'in-email': resumeData.email, 'in-phone': resumeData.phone,
            'in-address': resumeData.address, 'in-web': resumeData.website,
            'in-father': resumeData.fathersName, 'in-nation': resumeData.nationality,
            'in-summary': resumeData.summary, 'in-company': resumeData.company,
            'in-dates': resumeData.dates, 'in-job-desc': resumeData.jobdesc,
            'in-degree': resumeData.degree, 'in-school': resumeData.school,
            'in-edu-year': resumeData.eduYear, 'in-skills': resumeData.skills
        };

        for (let id in fields) {
            const el = document.getElementById(id);
            if(el) el.value = fields[id] || "";
        }
        
        renderResume();
        showToast("Resume Loaded!", "success");
    };
    reader.readAsText(file);
}
