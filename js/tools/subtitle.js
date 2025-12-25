/* ==========================================
   🎬 SUBMASTER AI - REAL TIME CAPTIONING
   ========================================== */

let recognition;
let isRecording = false;
let subtitles = []; // Stores { start, end, text }
let startTime = 0;

// 1. Initialize & Video Handler
const videoInput = document.getElementById('video-input');
if (videoInput) {
    videoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            document.getElementById('main-video').src = url;
            document.getElementById('video-name').innerText = file.name;
            
            // UI Reset
            const box = document.getElementById('caption-box');
            if(box) box.innerHTML = '<div style="text-align:center; padding-top:20px; color:var(--text-muted);">Ready to generate...</div>';
            
            subtitles = []; // Clear old subtitles
        }
    });
}

// 2. Start Logic
window.startCaptioning = function() {
    const video = document.getElementById('main-video');
    
    // API Support Check
    if (!('webkitSpeechRecognition' in window)) {
        alert("⚠️ Your browser does not support Web Speech API. Please use Google Chrome.");
        return;
    }

    if (!video.src) {
        alert("Please upload a video first!");
        return;
    }

    // Setup Speech Recognition
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US'; // Default Language

    let currentStartTime = null;

    recognition.onstart = () => {
        isRecording = true;
        
        // Update Button UI
        const btn = document.getElementById('btn-start-cap');
        if(btn) btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Listening...';
        
        video.play(); // Auto-play video so mic can hear it
    };

    recognition.onresult = (event) => {
        let interimTranscript = '';
        const currentTime = video.currentTime;

        // Capture Start Time for new sentence
        if (currentStartTime === null) currentStartTime = currentTime;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                // Final Sentence Detected
                const text = event.results[i][0].transcript.trim();
                const endTime = video.currentTime;
                
                // Add to UI & Array
                addSubtitleToUI(currentStartTime, endTime, text);
                subtitles.push({ start: currentStartTime, end: endTime, text: text });
                
                currentStartTime = null; // Reset for next sentence
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
    };

    recognition.onend = () => {
        // If video is still playing, restart recognition (Infinite Loop)
        if (isRecording && !video.paused) {
            recognition.start(); 
        } else {
            stopCaptioning();
        }
    };

    recognition.start();
};

// 3. Stop Logic
window.stopCaptioning = function() {
    isRecording = false;
    const video = document.getElementById('main-video');
    video.pause();
    
    if (recognition) recognition.stop();
    
    // Reset UI
    const btn = document.getElementById('btn-start-cap');
    if(btn) btn.innerHTML = '<i class="ri-mic-line"></i> Start Auto-Caption';
};

// 4. UI Helper (Display Subtitles)
function addSubtitleToUI(start, end, text) {
    const box = document.getElementById('caption-box');
    
    // Remove placeholder text
    if (box.innerText.includes("Ready to generate") || box.innerText.includes("Waiting for audio")) {
        box.innerHTML = ""; 
    }

    const sTime = formatTime(start);
    const eTime = formatTime(end);

    const div = document.createElement('div');
    div.style.marginBottom = "12px";
    div.style.padding = "10px";
    div.style.background = "rgba(255,255,255,0.05)";
    div.style.borderRadius = "8px";
    div.style.borderLeft = "3px solid var(--primary)";
    div.className = "fade-in";
    
    div.innerHTML = `
        <span style="color:var(--primary); font-size:0.75rem; font-weight:bold; display:block; margin-bottom:4px;">
            ${sTime} --> ${eTime}
        </span>
        <span contenteditable="true" style="color:var(--text); font-size:0.95rem; line-height:1.4;">
            ${text}
        </span>
    `;
    
    box.appendChild(div);
    box.scrollTop = box.scrollHeight; // Auto scroll to bottom
}

// 5. Time Formatter (Seconds -> 00:00:00,000)
function formatTime(seconds) {
    const date = new Date(0);
    date.setSeconds(seconds);
    const timeString = date.toISOString().substr(11, 8);
    const millis = Math.floor((seconds % 1) * 1000).toString().padStart(3, '0');
    return `${timeString},${millis}`;
}

// 6. Download Function (SRT & VTT)
window.downloadSubtitle = function(type) {
    if (subtitles.length === 0) {
        if(typeof showToast === 'function') showToast("No subtitles generated yet!", "error");
        else alert("No subtitles generated yet!");
        return;
    }

    let content = "";
    
    if (type === 'srt') {
        // SRT Format
        subtitles.forEach((sub, index) => {
            content += `${index + 1}\n`;
            content += `${formatTime(sub.start)} --> ${formatTime(sub.end)}\n`;
            content += `${sub.text}\n\n`;
        });
    } else {
        // VTT Format
        content += "WEBVTT\n\n";
        subtitles.forEach((sub) => {
            content += `${formatTime(sub.start).replace(',', '.')} --> ${formatTime(sub.end).replace(',', '.')}\n`;
            content += `${sub.text}\n\n`;
        });
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ToolMaster_Subtitles.${type}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};
