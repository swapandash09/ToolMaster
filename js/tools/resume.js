// ==========================================
// 📄 RESUME BUILDER MODULE (FINAL FIXED)
// ==========================================

let resumeData = {
    name: "", title: "", email: "", phone: "", address: "", website: "",
    summary: "", company: "", dates: "", jobdesc: "", skills: "",
    theme: "theme-blue"
};

// 1. Live Update Logic
function updateResume() {
    // Capture Inputs safely
    resumeData.name = getValue('in-name');
    resumeData.title = getValue('in-title');
    resumeData.email = getValue('in-email');
    resumeData.phone = getValue('in-phone');
    resumeData.address = getValue('in-address');
    resumeData.website = getValue('in-web');
    resumeData.summary = getValue('in-summary');
    resumeData.company = getValue('in-company');
    resumeData.dates = getValue('in-dates');
    resumeData.jobdesc = getValue('in-job-desc');
    resumeData.skills = getValue('in-skills');

    renderResume();
}

function getValue(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
}

function renderResume() {
    // Header
    setText('res-name', resumeData.name || "YOUR NAME");
    setText('res-title', resumeData.title || "PROFESSIONAL TITLE");
    
    // Contact Bar
    const locationHTML = resumeData.address ? `<i class="ri-map-pin-line"></i> ${resumeData.address}` : '';
    const phoneHTML = resumeData.phone ? `<i class="ri-phone-line"></i> ${resumeData.phone}` : '';
    const emailHTML = resumeData.email ? `<i class="ri-mail-line"></i> ${resumeData.email}` : '';
    const webHTML = resumeData.website ? `<i class="ri-global-line"></i> ${resumeData.website}` : '';
    
    const contactBar = document.querySelector('.header-contact');
    if(contactBar) {
        contactBar.innerHTML = `${locationHTML} ${phoneHTML} ${emailHTML} ${webHTML}`;
    }

    // Summary
    setText('res-summary', resumeData.summary || "Your professional profile summary will appear here.");

    // Experience
    setText('res-company', resumeData.company || "Company Name");
    setText('res-dates', resumeData.dates || "2020 - Present");
    
    const jobDescEl = document.getElementById('res-job-desc');
    if(jobDescEl) {
        jobDescEl.innerHTML = resumeData.jobdesc ? resumeData.jobdesc.replace(/\n/g, '<br>') : "• Describe your responsibilities here.";
    }

    // Skills
    const skillsContainer = document.getElementById('res-skills');
    if(skillsContainer) {
        skillsContainer.innerHTML = '';
        if(resumeData.skills) {
            resumeData.skills.split(',').forEach(s => {
                if(s.trim()) {
                    const tag = document.createElement('span');
                    tag.className = 'res-skill-tag';
                    tag.innerText = s.trim();
                    skillsContainer.appendChild(tag);
                }
            });
        } else {
            skillsContainer.innerHTML = '<span class="res-skill-tag">Skill 1</span><span class="res-skill-tag">Skill 2</span>';
        }
    }
}

function setText(id, val) {
    const el = document.getElementById(id);
    if(el) el.innerText = val;
}

// 2. AI SUMMARY GENERATOR
function generateAISummary() {
    const title = getValue('in-title').toLowerCase();
    const box = document.getElementById('in-summary');
    
    if(!title) {
        if(typeof showToast === 'function') showToast("Enter Job Title first!", "error");
        return;
    }
    
    // Simple Logic-based AI
    let aiText = "";
    if(title.includes('developer') || title.includes('coder')) {
        aiText = `Innovative ${title} with a passion for building scalable software solutions. Proficient in modern coding practices and dedicated to optimizing user experience.`;
    } else if (title.includes('designer') || title.includes('artist')) {
        aiText = `Visionary ${title} with a strong eye for aesthetics and user-centered design. Experienced in transforming complex concepts into intuitive designs.`;
    } else if (title.includes('manager') || title.includes('lead')) {
        aiText = `Results-oriented ${title} with extensive experience in leading teams and driving business growth. Skilled in strategic planning and fostering a collaborative culture.`;
    } else {
        aiText = `Dedicated ${title} with a strong work ethic and a commitment to excellence. Eager to leverage skills in a challenging environment.`;
    }

    // Typewriter Animation
    box.value = "";
    let i = 0;
    function typeWriter() {
        if (i < aiText.length) {
            box.value += aiText.charAt(i);
            i++;
            setTimeout(typeWriter, 15);
        } else {
            updateResume();
        }
    }
    typeWriter();
}

// 3. COLOR THEME
function setThemeColor(themeName) {
    const paper = document.getElementById('resume-preview');
    if(!paper) return;
    
    // Remove old themes
    paper.classList.remove('theme-blue', 'theme-green', 'theme-purple', 'theme-gold', 'theme-dark');
    // Add new theme
    paper.classList.add(`theme-${themeName}`);
    resumeData.theme = `theme-${themeName}`;
}

// 4. JSON SAVE & LOAD
function saveResumeJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resumeData));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `Resume_Data_${resumeData.name || 'Draft'}.json`);
    document.body.appendChild(dlAnchorElem);
    dlAnchorElem.click();
    dlAnchorElem.remove();
    if(typeof showToast === 'function') showToast("Data Saved!", "success");
}

function loadResumeJSON(input) {
    const file = input.files[0];
    if(!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            resumeData = JSON.parse(e.target.result);
            // Fill fields
            document.getElementById('in-name').value = resumeData.name || "";
            document.getElementById('in-title').value = resumeData.title || "";
            document.getElementById('in-email').value = resumeData.email || "";
            document.getElementById('in-phone').value = resumeData.phone || "";
            document.getElementById('in-address').value = resumeData.address || "";
            document.getElementById('in-web').value = resumeData.website || "";
            document.getElementById('in-summary').value = resumeData.summary || "";
            document.getElementById('in-company').value = resumeData.company || "";
            document.getElementById('in-dates').value = resumeData.dates || "";
            document.getElementById('in-job-desc').value = resumeData.jobdesc || "";
            document.getElementById('in-skills').value = resumeData.skills || "";
            
            if(resumeData.theme) setThemeColor(resumeData.theme.replace('theme-', ''));
            
            renderResume();
            if(typeof showToast === 'function') showToast("Resume Loaded!", "success");
        } catch(err) {
            if(typeof showToast === 'function') showToast("Invalid JSON File", "error");
        }
    };
    reader.readAsText(file);
}

// 5. PDF DOWNLOAD (FIXED & IMPROVED)
function downloadResumePDF() {
    const element = document.getElementById('resume-preview');
    
    if (!element) {
        if(typeof showToast === 'function') showToast("Error: Resume preview not found.", "error");
        return;
    }

    // Check if library is loaded
    if (typeof html2pdf === 'undefined') {
        alert("Error: PDF Library is missing. Please check your internet connection.");
        return;
    }

    if(typeof loader === 'function') loader(true); // Show Spinner

    const safeName = (resumeData.name || 'My_Resume').replace(/[^a-z0-9]/gi, '_');

    const opt = {
        margin: 0,
        filename: `${safeName}.pdf`,
        image: { type: 'jpeg', quality: 0.98 }, // High quality
        html2canvas: { 
            scale: 2, 
            useCORS: true, // Crucial for images/icons
            scrollY: 0
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save()
        .then(() => {
            if(typeof loader === 'function') loader(false);
            if(typeof showToast === 'function') showToast("Resume Downloaded Successfully!", "success");
        })
        .catch(err => {
            console.error(err);
            if(typeof loader === 'function') loader(false);
            if(typeof showToast === 'function') showToast("Error generating PDF.", "error");
        });
}
