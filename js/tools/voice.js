// VOICE AI TOOLS

// 1. TEXT TO SPEECH
const synth = window.speechSynthesis;
let voices = [];

function loadVoices() {
    voices = synth.getVoices();
    const select = document.getElementById('voice-select');
    if(!select) return;
    
    select.innerHTML = '';
    voices.forEach((voice, i) => {
        const option = document.createElement('option');
        option.textContent = `${voice.name} (${voice.lang})`;
        option.value = i;
        select.appendChild(option);
    });
}

// Load voices when system is ready
loadVoices();
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
}

window.speakText = () => {
    if (synth.speaking) { synth.cancel(); return; }
    
    const text = document.getElementById('tts-input').value;
    if (text === '') return showToast("Type something first!");
    
    const utterThis = new SpeechSynthesisUtterance(text);
    const voiceSelect = document.getElementById('voice-select');
    const rate = document.getElementById('rate');
    
    utterThis.voice = voices[voiceSelect.value];
    utterThis.rate = rate.value;
    
    utterThis.onstart = () => showToast("Playing Audio...");
    utterThis.onend = () => showToast("Finished");
    
    synth.speak(utterThis);
}

// 2. SPEECH TO TEXT (Voice Typing)
let recognition = null;
let isListening = false;

window.toggleSpeech = () => {
    if (!('webkitSpeechRecognition' in window)) return showToast("Use Chrome Browser");
    
    if (isListening) {
        recognition.stop();
        return;
    }
    
    recognition = new webkitSpeechRecognition();
    recognition.lang = document.getElementById('speech-lang').value;
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onstart = () => {
        isListening = true;
        showToast("Listening... Speak now");
    };
    
    recognition.onend = () => {
        isListening = false;
    };
    
    recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
        }
        document.getElementById('speech-output').value = transcript;
    };
    
    recognition.start();
}
