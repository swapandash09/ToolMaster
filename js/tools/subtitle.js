// ==========================================
// 🎬 SUBMASTER AI - PRO CAPTIONING (V39)
// ==========================================

let recognition;
let isRecording = false;
let subtitles = []; 
let currentObjectUrl = null;

// --- 1. SMART VIDEO LOADER & CLEANUP ---
const videoInput = document.getElementById('video-input');
const mainVideo = document.getElementById('main-video');

if (videoInput) {
    videoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Purani memory clear karein (Performance Fix)
        if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
        
        currentObjectUrl = URL.createObjectURL(file);
        
        // UI Updates
        if (mainVideo) {
            mainVideo.src = currentObjectUrl;
            mainVideo.style.display = 'block';
            mainVideo.load(); // Force reload video stream
        }

        const videoNameLabel = document.getElementById('video-name');
        if (videoNameLabel) videoNameLabel.innerText = file.name;
        
        // Reset Captions Area
        const box = document.getElementById('caption-box');
        if(box) box.innerHTML = '<div style="text-align:center; padding-top:20px; color:var(--text-muted); opacity:0.6;">Video loaded. Click "Start" to listen.</div>';
        
        subtitles = []; 
        if(typeof showToast === 'function') showToast("Video uploaded successfully!", "success");
    });
}

// --- 2. START CAPTIONING LOGIC ---
window.startCaptioning = function() {
    if (!mainVideo || !mainVideo.src) {
        return (typeof showToast === 'function') ? showToast("Please upload a video first!", "error") : alert("Upload video first!");
    }

    if (!('webkitSpeechRecognition' in window)) {
        return alert("⚠️ Your browser does not support Speech API. Use Google Chrome.");
    }

    // Setup API
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US'; // Isse aap 'hi-IN' bhi kar sakte hain Hindi ke liye

    let currentStartTime = null;

    recognition.onstart = () => {
        isRecording = true;
        const btn = document.getElementById('btn-start-cap');
        if(btn) btn.innerHTML = '<i class="ri-pulse-line ri-spin"></i> Listening...';
        
        mainVideo.play(); 
        if(typeof showToast === 'function') showToast("AI is now listening...", "info");
    };

    recognition.onresult = (event) => {
        const currentTime = mainVideo.currentTime;
        if (currentStartTime === null) currentStartTime = currentTime;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                const text = event.results[i][0].transcript.trim();
                const endTime = mainVideo.currentTime;
                
                if(text.length > 0) {
                    addSubtitleToUI(currentStartTime, endTime, text);
                    subtitles.push({ start: currentStartTime, end: endTime, text: text });
                }
                currentStartTime = null; 
            }
        }
    };

    recognition.onend = () => {
        if (isRecording && !mainVideo.paused && !mainVideo.ended) {
            recognition.start(); // Restart if video is still playing
        } else {
            stopCaptioning();
        }
    };

    recognition.onerror = (err) => {
        console.error("Recognition Error:", err);
        stopCaptioning();
    };

    recognition.start();
};

// --- 3. STOP LOGIC ---
window.stopCaptioning = function() {
    isRecording = false;
    if(mainVideo) mainVideo.pause();
    if (recognition) recognition.stop();
    
    const btn = document.getElementById('btn-start-cap');
    if(btn) btn.innerHTML = '<i class="ri-mic-line"></i> Start Captioning';
};

// --- 4. UI RENDERER ---
function addSubtitleToUI(start, end, text) {
    const box = document.getElementById('caption-box');
    if (!box) return;

    if (box.innerText.includes("Video loaded") || box.innerText.includes("Waiting")) {
        box.innerHTML = ""; 
    }

    const div = document.createElement('div');
    div.style.cssText = "margin-bottom:15px; padding:12px; background:rgba(255,255,255,0.03); border-radius:10px; border-left:4px solid var(--primary);";
    div.className = "fade-in";
    
    div.innerHTML = `
        <div style="color:var(--primary); font-size:0.7rem; font-weight:700; margin-bottom:5px; font-family:var(--font-code);">
            [${formatTime(start)} ➔ ${formatTime(end)}]
        </div>
        <div contenteditable="true" style="color:var(--text); font-size:1rem; outline:none;">
            ${text}
        </div>
    `;
    
    box.appendChild(div);
    box.scrollTop = box.scrollHeight; // Auto-scroll to latest caption
}

// --- 5. FORMATTER ---
function formatTime(seconds) {
    const date = new Date(0);
    date.setSeconds(seconds);
    const time = date.toISOString().substr(11, 8);
    const ms = Math.floor((seconds % 1) * 1000).toString().padStart(3, '0');
    return `${time},${ms}`;
}

// --- 6. DOWNLOAD HANDLER ---
window.downloadSubtitle = function(type) {
    if (subtitles.length === 0) {
        return (typeof showToast === 'function') ? showToast("No captions to download!", "error") : alert("No data!");
    }

    let content = type === 'vtt' ? "WEBVTT\n\n" : "";
    
    subtitles.forEach((sub, index) => {
        if (type === 'srt') {
            content += `${index + 1}\n${formatTime(sub.start)} --> ${formatTime(sub.end)}\n${sub.text}\n\n`;
        } else {
            const s = formatTime(sub.start).replace(',', '.');
            const e = formatTime(sub.end).replace(',', '.');
            content += `${s} --> ${e}\n${sub.text}\n\n`;
        }
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ToolMaster_Subs.${type}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
