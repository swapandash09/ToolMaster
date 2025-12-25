// ==========================================
// 🎙️ VOICE TOOLS MODULE (Titanium V39 Pro)
// ==========================================

// --- 1. AI READER (TEXT TO SPEECH) ---
const synth = window.speechSynthesis;
let voices = [];
let isPaused = false;

// Smart Voice Loader (Prioritizes Premium Voices)
function loadVoices() {
    voices = synth.getVoices().sort(function (a, b) {
        const aname = a.name.toUpperCase(), bname = b.name.toUpperCase();
        if ( aname < bname ) return -1;
        if ( aname > bname ) return 1;
        return 0;
    });

    const select = document.getElementById('voice-select');
    if(!select) return;
    
    select.innerHTML = '';
    
    // Group voices by lang for cleaner UI could be added here, 
    // but for now, we filter duplicate-ish names
    voices.forEach((voice, i) => {
        const option = document.createElement('option');
        option.textContent = `${voice.name} (${voice.lang})`;
        option.value = i;
        
        // Auto-select English Google/Microsoft voice if available
        if(voice.default || (voice.lang.includes('en') && voice.name.includes('Google'))) {
            option.selected = true;
        }
        
        select.appendChild(option);
    });
}

// Initial Load
loadVoices();
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
}

window.speakText = () => {
    const btn = document.querySelector('#text-speech-tool .glow-btn');
    const inputArea = document.getElementById('tts-input');
    
    // 1. Handle Pause/Resume
    if (synth.speaking && !synth.paused) {
        synth.pause();
        isPaused = true;
        if(btn) btn.innerHTML = '<i class="ri-play-fill"></i> Resume';
        if(inputArea) inputArea.classList.remove('speaking-active');
        return;
    }
    
    if (isPaused) {
        synth.resume();
        isPaused = false;
        if(btn) btn.innerHTML = '<i class="ri-pause-circle-line"></i> Pause';
        if(inputArea) inputArea.classList.add('speaking-active');
        return;
    }

    // 2. Start New Speech
    const text = inputArea.value;
    if (text === '') return showToast("Please type something to read!", "error");
    
    // Cancel any previous
    synth.cancel();

    const utterThis = new SpeechSynthesisUtterance(text);
    const voiceSelect = document.getElementById('voice-select');
    const rate = document.getElementById('rate');
    
    // Apply Settings
    if(voices[voiceSelect.value]) {
        utterThis.voice = voices[voiceSelect.value];
    }
    utterThis.rate = rate.value || 1;
    utterThis.pitch = 1;

    // Events
    utterThis.onstart = () => {
        if(btn) btn.innerHTML = '<i class="ri-pause-circle-line"></i> Pause';
        if(inputArea) inputArea.classList.add('speaking-active');
        showToast("Reading started...", "info");
    };

    utterThis.onend = () => {
        if(btn) btn.innerHTML = 'Speak';
        if(inputArea) inputArea.classList.remove('speaking-active');
        isPaused = false;
    };

    utterThis.onerror = (e) => {
        console.error(e);
        if(btn) btn.innerHTML = 'Speak';
        if(inputArea) inputArea.classList.remove('speaking-active');
        isPaused = false;
    };
    
    synth.speak(utterThis);
};


// --- 2. DICTATION (SPEECH TO TEXT) ---
let recognition = null;
let isListening = false;
let finalTranscript = ''; // Stores committed text

window.toggleSpeech = () => {
    const btn = document.querySelector('#speech-tool .glow-btn');
    const outputArea = document.getElementById('speech-output');
    
    // Browser Support Check
    if (!('webkitSpeechRecognition' in window)) {
        return showToast("Browser not supported. Please use Google Chrome.", "error");
    }
    
    // STOP LOGIC
    if (isListening) {
        recognition.stop();
        return;
    }
    
    // START LOGIC
    recognition = new webkitSpeechRecognition();
    recognition.lang = document.getElementById('speech-lang').value || 'en-US';
    recognition.continuous = true;  // Keep listening even after pauses
    recognition.interimResults = true; // Show text while speaking
    
    // Preserve existing text in textarea
    finalTranscript = outputArea.value; 
    if(finalTranscript && !finalTranscript.endsWith(' ')) finalTranscript += ' ';

    recognition.onstart = () => {
        isListening = true;
        showToast("Mic Active. Speak now...", "success");
        if(btn) {
            btn.innerHTML = '<i class="ri-stop-circle-line"></i> Stop Listening';
            btn.style.background = "linear-gradient(135deg, #ef4444, #dc2626)"; // Red
        }
        if(outputArea) outputArea.classList.add('mic-active');
    };
    
    recognition.onend = () => {
        isListening = false;
        if(btn) {
            btn.innerHTML = 'Start Listening';
            btn.style.background = ""; // Reset gradient
        }
        if(outputArea) outputArea.classList.remove('mic-active');
        
        // Update final value one last time
        outputArea.value = finalTranscript;
    };
    
    recognition.onresult = (event) => {
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript + ' ';
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        
        // Visual Update: Show Final + Gray Interim Text
        outputArea.value = finalTranscript + interimTranscript;
        
        // Auto-scroll to bottom
        outputArea.scrollTop = outputArea.scrollHeight;
    };
    
    recognition.onerror = (event) => {
        console.error("Speech Error", event.error);
        if(event.error === 'not-allowed') {
            showToast("Microphone access denied.", "error");
        } else {
            showToast("Error: " + event.error, "error");
        }
        stopSpeechUI();
    };
    
    recognition.start();
};

function stopSpeechUI() {
    isListening = false;
    const btn = document.querySelector('#speech-tool .glow-btn');
    const outputArea = document.getElementById('speech-output');
    
    if(btn) {
        btn.innerHTML = 'Start Listening';
        btn.style.background = "";
    }
    if(outputArea) outputArea.classList.remove('mic-active');
        }
