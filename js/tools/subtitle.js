// ==========================================
// 🎬 SUBMASTER AI - TITANIUM V51 QUANTUM ENGINE
// ==========================================

console.log("SubMaster V51: Quantum Core Online");

const SubMaster = {
    recognition: null,
    isRecording: false,
    shouldRestart: false, // For continuous listening loop
    subtitles: [],
    chunkStartTime: null,
    videoEl: null,
    
    // --- 1. INITIALIZATION ---
    init: function() {
        this.videoEl = document.getElementById('main-video');
        this.setupUpload();
        
        // Browser Support Check
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error("Web Speech API not supported");
            if(typeof showToast === 'function') showToast("Browser not supported. Use Chrome/Edge.", "error");
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;

        this.bindEvents();
    },

    // --- 2. VIDEO HANDLER ---
    setupUpload: function() {
        const input = document.getElementById('video-input');
        if(!input) return;

        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Reset
            this.subtitles = [];
            document.getElementById('caption-box').innerHTML = '';
            
            const url = URL.createObjectURL(file);
            this.videoEl.src = url;
            this.videoEl.style.display = 'block';
            
            // Name update (if element exists)
            const lbl = document.getElementById('video-name');
            if(lbl) lbl.innerText = file.name;

            if(typeof showToast === 'function') showToast("Video Loaded. Ready to Listen.", "success");
        });
    },

    // --- 3. SPEECH CORE ---
    bindEvents: function() {
        this.recognition.onstart = () => {
            this.isRecording = true;
            this.updateUI(true);
            this.videoEl.play();
        };

        this.recognition.onend = () => {
            if (this.shouldRestart) {
                // Auto-restart logic for continuous listening
                try { this.recognition.start(); } catch(e) {}
            } else {
                this.isRecording = false;
                this.updateUI(false);
                this.videoEl.pause();
            }
        };

        this.recognition.onresult = (event) => {
            const currentTime = this.videoEl.currentTime;
            
            // Mark start of phrase
            if (this.chunkStartTime === null) this.chunkStartTime = currentTime;

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    const text = event.results[i][0].transcript.trim();
                    const endTime = this.videoEl.currentTime;

                    if (text.length > 0) {
                        const sub = {
                            id: Date.now(),
                            start: this.chunkStartTime,
                            end: endTime,
                            text: text
                        };
                        this.subtitles.push(sub);
                        this.renderCard(sub);
                    }
                    this.chunkStartTime = null; // Reset
                }
            }
        };

        this.recognition.onerror = (e) => {
            if(e.error === 'not-allowed') {
                this.stop();
                alert("Microphone access denied.");
            }
        };
    },

    // --- 4. CONTROLS ---
    toggle: function() {
        if (this.isRecording) this.stop();
        else this.start();
    },

    start: function() {
        if(!this.videoEl.src) {
            if(typeof showToast === 'function') showToast("Upload a video first!", "error");
            return;
        }
        this.shouldRestart = true;
        this.recognition.lang = document.getElementById('speech-lang') ? document.getElementById('speech-lang').value : 'en-US';
        try { this.recognition.start(); } catch(e) {}
    },

    stop: function() {
        this.shouldRestart = false;
        this.recognition.stop();
        this.isRecording = false;
        this.updateUI(false);
    },

    // --- 5. RENDERER (V51 EXECUTIVE STYLE) ---
    renderCard: function(sub) {
        const box = document.getElementById('caption-box');
        
        const div = document.createElement('div');
        div.className = 'sub-card fade-in';
        div.dataset.id = sub.id;
        
        // CSS via JS to ensure V50 Theme Match without extra CSS file
        div.style.background = 'var(--card-hover)';
        div.style.border = '1px solid var(--border)';
        div.style.borderRadius = '8px';
        div.style.padding = '12px';
        div.style.marginBottom = '10px';
        div.style.borderLeft = '3px solid var(--primary)';
        
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:5px; font-size:0.75rem; color:var(--text-muted);">
                <div style="font-family:'JetBrains Mono'; cursor:pointer; color:var(--primary);" title="Click to seek video" onclick="SubMaster.seek(${sub.start})">
                    ${this.fmtTime(sub.start)} <i class="ri-arrow-right-s-line"></i> ${this.fmtTime(sub.end)}
                </div>
                <i class="ri-close-line" onclick="SubMaster.remove(${sub.id})" style="cursor:pointer; color:#ef4444;"></i>
            </div>
            <div contenteditable="true" onblur="SubMaster.updateText(${sub.id}, this.innerText)" 
                 style="color:var(--text); font-size:0.9rem; outline:none;">${sub.text}</div>
        `;

        box.appendChild(div);
        
        // Smart Scroll (Only if near bottom)
        box.scrollTop = box.scrollHeight;
    },

    // --- 6. UTILITIES ---
    seek: function(time) {
        this.videoEl.currentTime = time;
        if(this.videoEl.paused) this.videoEl.play();
    },

    remove: function(id) {
        this.subtitles = this.subtitles.filter(s => s.id !== id);
        const el = document.querySelector(`.sub-card[data-id="${id}"]`);
        if(el) el.remove();
    },

    updateText: function(id, text) {
        const sub = this.subtitles.find(s => s.id === id);
        if(sub) sub.text = text;
    },

    fmtTime: function(s) {
        const date = new Date(s * 1000);
        return date.toISOString().substr(14, 5); // MM:SS
    },

    fmtTimeFull: function(s, sep) {
        const date = new Date(s * 1000);
        const iso = date.toISOString().substr(11, 8); // HH:MM:SS
        const ms = Math.floor((s % 1) * 1000).toString().padStart(3,'0');
        return `${iso}${sep}${ms}`;
    },

    updateUI: function(active) {
        const btn = document.getElementById('btn-start-cap');
        if(!btn) return;
        if(active) {
            btn.innerHTML = '<i class="ri-mic-fill"></i> Listening...';
            btn.style.background = '#ef4444'; // Recording Red
            btn.classList.add('glow-active');
        } else {
            btn.innerHTML = 'Start Captioning';
            btn.style.background = ''; // Revert to CSS default
            btn.classList.remove('glow-active');
        }
    },

    // --- 7. EXPORT ENGINE ---
    download: function(type) {
        if(!this.subtitles.length) return showToast("No captions to export.", "error");
        
        let txt = type === 'vtt' ? "WEBVTT\n\n" : "";
        
        this.subtitles.forEach((s, i) => {
            // SRT uses comma (,), VTT uses dot (.)
            const sep = type === 'vtt' ? '.' : ',';
            const start = this.fmtTimeFull(s.start, sep);
            const end = this.fmtTimeFull(s.end, sep);
            
            if(type === 'srt') {
                txt += `${i+1}\n${start} --> ${end}\n${s.text}\n\n`;
            } else {
                txt += `${start} --> ${end}\n${s.text}\n\n`;
            }
        });

        const blob = new Blob([txt], {type:'text/plain'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Captions_${Date.now()}.${type}`;
        a.click();
        
        if(typeof showToast === 'function') showToast(`Exported .${type.toUpperCase()}`, "success");
    }
};

// Global Bridge
window.SubMaster = SubMaster;
window.startCaptioning = () => SubMaster.toggle();
window.downloadSubtitle = (t) => SubMaster.download(t);

// Init on Load
document.addEventListener('DOMContentLoaded', () => {
    // Check if tool is active or wait
    SubMaster.init();
});
