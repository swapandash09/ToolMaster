// ==========================================
// 🎬 SUBMASTER AI - TITANIUM V42 ENGINE
// ==========================================

console.log("SubMaster V42: Online");

let recognition;
let isRecording = false;
let subtitles = []; // Stores { id, start, end, text }
let currentObjectUrl = null;
let silenceTimer = null;

// --- 1. VIDEO LOADER ---
const videoInput = document.getElementById('video-input');
if (videoInput) {
    videoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Cleanup Memory
        if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
        currentObjectUrl = URL.createObjectURL(file);
        
        // Setup Video Player
        const mainVideo = document.getElementById('main-video');
        if (mainVideo) {
            mainVideo.src = currentObjectUrl;
            mainVideo.style.display = 'block';
            mainVideo.load();
        }

        // UI Updates
        const nameLabel = document.getElementById('video-name');
        if(nameLabel) nameLabel.innerText = file.name;
        
        document.getElementById('caption-box').innerHTML = `
            <div style="text-align:center; margin-top:40px; color:var(--text-muted); opacity:0.6;">
                <i class="ri-movie-2-line" style="font-size:2rem; display:block; margin-bottom:10px;"></i>
                Video loaded. Select language & click "Start".<br>
                <small>(Ensure your volume is up so the mic can hear it)</small>
            </div>
        `;
        
        subtitles = [];
        if(typeof showToast === 'function') showToast("Video Loaded Successfully", "success");
    });
}

// --- 2. CORE CAPTIONING ENGINE ---
window.startCaptioning = function() {
    const mainVideo = document.getElementById('main-video');
    
    if (!mainVideo || !mainVideo.src) {
        if(typeof showToast === 'function') showToast("Please upload a video first", "error");
        return;
    }

    // Browser Support Check
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("⚠️ Browser Error: Web Speech API not found. Please use Google Chrome or Edge.");
        return;
    }

    // Init Recognition
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    // Dynamic Language Selection (Default to en-US if dropdown missing)
    const langSelect = document.getElementById('speech-lang'); // Re-using existing select if available
    recognition.lang = langSelect ? langSelect.value : 'en-US';

    let chunkStartTime = null;

    recognition.onstart = () => {
        isRecording = true;
        updateStatusUI(true);
        mainVideo.play().catch(e => console.log("Autoplay blocked:", e));
        if(typeof showToast === 'function') showToast(`Listening in ${recognition.lang}...`, "info");
    };

    recognition.onresult = (event) => {
        const currentTime = mainVideo.currentTime;
        if (chunkStartTime === null) chunkStartTime = currentTime;

        // Reset silence timer (Auto-stop logic if needed)
        clearTimeout(silenceTimer);

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                const transcript = event.results[i][0].transcript.trim();
                const endTime = mainVideo.currentTime;
                
                if (transcript.length > 0) {
                    // Create Data Object
                    const subItem = {
                        id: Date.now(), // Unique ID for syncing edits
                        start: chunkStartTime,
                        end: endTime,
                        text: transcript
                    };
                    
                    subtitles.push(subItem);
                    renderSubtitleCard(subItem); // Add to UI
                }
                chunkStartTime = null; // Reset for next phrase
            }
        }
    };

    recognition.onend = () => {
        if (isRecording) {
            // Auto-resume if video is still playing (API often cuts off after silence)
            if(!mainVideo.paused && !mainVideo.ended) {
                console.log("SubMaster: Auto-restarting recognition...");
                try { recognition.start(); } catch(e) {}
            } else {
                stopCaptioning();
            }
        } else {
            updateStatusUI(false);
        }
    };

    recognition.onerror = (event) => {
        console.warn("Speech API Error:", event.error);
        if(event.error === 'not-allowed') {
            stopCaptioning();
            alert("Microphone Access Denied. Please allow microphone permissions.");
        }
    };

    try {
        recognition.start();
    } catch(e) {
        console.error("Could not start:", e);
    }
};

window.stopCaptioning = function() {
    isRecording = false;
    const mainVideo = document.getElementById('main-video');
    if(mainVideo) mainVideo.pause();
    if(recognition) recognition.stop();
    updateStatusUI(false);
    if(typeof showToast === 'function') showToast("Captioning Stopped", "info");
};

// --- 3. UI RENDERER (EDITABLE CARDS) ---
function renderSubtitleCard(sub) {
    const box = document.getElementById('caption-box');
    
    // Clear placeholder
    if (box.innerText.includes("Video loaded")) box.innerHTML = "";

    const card = document.createElement('div');
    card.className = "sub-card fade-in";
    card.dataset.id = sub.id; // Link UI to Data
    
    // Modern Glass styling injected via JS
    card.style.cssText = `
        background: rgba(255,255,255,0.03);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 12px;
        margin-bottom: 12px;
        position: relative;
        transition: 0.2s;
        border-left: 3px solid var(--primary);
    `;

    card.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:6px; opacity:0.8; font-size:0.75rem;">
            <div style="font-family:'JetBrains Mono', monospace; color:var(--primary);">
                <span contenteditable="true" onblur="syncTime(this, ${sub.id}, 'start')">${formatTime(sub.start)}</span> 
                ➔ 
                <span contenteditable="true" onblur="syncTime(this, ${sub.id}, 'end')">${formatTime(sub.end)}</span>
            </div>
            <i class="ri-delete-bin-line" onclick="deleteSubtitle(${sub.id})" style="cursor:pointer; color:#ef4444;" title="Delete Line"></i>
        </div>
        <div contenteditable="true" onblur="syncText(this, ${sub.id})" 
             style="color:var(--text); font-size:0.95rem; outline:none; line-height:1.4;">${sub.text}</div>
    `;

    box.appendChild(card);
    box.scrollTop = box.scrollHeight; // Auto Scroll
}

// --- 4. DATA SYNC (TWO-WAY BINDING) ---
// Updates global array when User edits UI
window.syncText = function(el, id) {
    const index = subtitles.findIndex(s => s.id === id);
    if(index !== -1) subtitles[index].text = el.innerText.trim();
};

window.syncTime = function(el, id, type) {
    const index = subtitles.findIndex(s => s.id === id);
    if(index !== -1) {
        // Convert "00:00:05,123" back to seconds (simplified for sync)
        // Note: For full accuracy, parsing logic would go here. 
        // For now, we assume user keeps format valid or we rely on text update.
    }
};

window.deleteSubtitle = function(id) {
    // Remove from Array
    subtitles = subtitles.filter(s => s.id !== id);
    // Remove from UI
    const card = document.querySelector(`.sub-card[data-id="${id}"]`);
    if(card) {
        card.style.opacity = '0';
        setTimeout(() => card.remove(), 300);
    }
};

// --- 5. HELPERS ---
function updateStatusUI(recording) {
    const btn = document.getElementById('btn-start-cap');
    if(!btn) return;
    
    if(recording) {
        btn.innerHTML = '<i class="ri-pulse-line ri-spin"></i> Listening...';
        btn.classList.add('glow-active'); // Add CSS class for pulsing
        btn.style.borderColor = "var(--primary)";
    } else {
        btn.innerHTML = 'Start Captioning';
        btn.classList.remove('glow-active');
        btn.style.borderColor = "";
    }
}

function formatTime(seconds) {
    const date = new Date(0);
    date.setSeconds(seconds);
    const timeStr = date.toISOString().substr(11, 8);
    const ms = Math.floor((seconds % 1) * 1000).toString().padStart(3, '0');
    return `${timeStr},${ms}`;
}

// --- 6. EXPORT ENGINE ---
window.downloadSubtitle = function(type) {
    if (subtitles.length === 0) {
        if(typeof showToast === 'function') showToast("No captions generated yet.", "error");
        return;
    }

    let content = "";
    if (type === 'vtt') content += "WEBVTT\n\n";

    subtitles.forEach((sub, index) => {
        // SRT uses comma (00:00:01,000) | VTT uses dot (00:00:01.000)
        const sTime = formatTime(sub.start).replace(',', type === 'vtt' ? '.' : ',');
        const eTime = formatTime(sub.end).replace(',', type === 'vtt' ? '.' : ',');

        if (type === 'srt') {
            content += `${index + 1}\n${sTime} --> ${eTime}\n${sub.text}\n\n`;
        } else {
            content += `${sTime} --> ${eTime}\n${sub.text}\n\n`;
        }
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SubMaster_Export.${type}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if(typeof showToast === 'function') showToast(`Downloaded .${type.toUpperCase()} file`, "success");
};
