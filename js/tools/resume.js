// RESUME BUILDER V2 - JSON SAVE/LOAD

let resumeData = {
    name: "", title: "", phone: "", email: "", summary: "", skills: ""
};

function updateResume() {
    resumeData.name = document.getElementById('in-name').value;
    resumeData.title = document.getElementById('in-title').value;
    resumeData.phone = document.getElementById('in-phone').value;
    resumeData.email = document.getElementById('in-email').value;
    resumeData.summary = document.getElementById('in-summary').value;
    resumeData.skills = document.getElementById('in-skills').value;
    
    renderResume();
}

function renderResume() {
    document.getElementById('res-name').innerText = resumeData.name || "Your Name";
    document.getElementById('res-title').innerText = resumeData.title || "Job Title";
    
    document.getElementById('res-contact').innerHTML = `
        <span>${resumeData.phone}</span> • <span>${resumeData.email}</span>
    `;
    
    document.getElementById('res-summary').innerText = resumeData.summary || "Professional summary goes here...";
    
    const skillsHTML = resumeData.skills.split(',').map(s => s.trim() ? `<span style="background:#eee; padding:2px 6px; margin:2px; display:inline-block; font-size:0.8rem">${s}</span>` : '').join('');
    document.getElementById('res-skills').innerHTML = skillsHTML;
}

// === NEW: SAVE TO JSON ===
function saveResumeJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resumeData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "my_resume_data.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    showToast("Resume Data Saved!");
}

// === NEW: LOAD FROM JSON ===
function loadResumeJSON(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            resumeData = JSON.parse(e.target.result);
            // Fill Inputs
            document.getElementById('in-name').value = resumeData.name;
            document.getElementById('in-title').value = resumeData.title;
            document.getElementById('in-phone').value = resumeData.phone;
            document.getElementById('in-email').value = resumeData.email;
            document.getElementById('in-summary').value = resumeData.summary;
            document.getElementById('in-skills').value = resumeData.skills;
            renderResume();
            showToast("Resume Loaded Successfully!");
        } catch(err) {
            showToast("Invalid JSON File");
        }
    };
    reader.readAsText(file);
}

function downloadResumePDF() {
    const element = document.getElementById('resume-preview');
    html2pdf().set({
        margin: 0, filename: 'My_Resume.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4' }
    }).from(element).save();
}
