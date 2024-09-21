const voiceInputBtn = document.getElementById('voice-input-btn');
const voiceInputResults = document.getElementById('voice-input-results');
const inputTextElem = document.getElementById('input-text');

let recognition = null;

// Check browser support and create SpeechRecognition instance
if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = false;
    recognition.interimResults = true;
    
    // Set default language (e.g., English)
    recognition.lang = 'en-US'; // Default language for speech recognition
} else {
    voiceInputBtn.disabled = true;
    voiceInputResults.innerHTML = 'Speech recognition not supported in this browser.';
}

// Function to set recognition.lang dynamically
function setRecognitionLanguage(languageCode) {
    if (recognition) {
        recognition.lang = languageCode;
    }
}

voiceInputBtn.addEventListener('click', () => {
    if (recognition) {
        voiceInputBtn.disabled = true;
        voiceInputResults.innerHTML = 'Listening...';

        recognition.start();

        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');

            inputTextElem.value = transcript;
            translate(); // Call your translation function
        };

        recognition.onend = () => {
            voiceInputBtn.disabled = false;
            voiceInputResults.innerHTML = '';
        };

        recognition.onerror = (event) => {
            voiceInputBtn.disabled = false;
            voiceInputResults.innerHTML = 'Error occurred in recognition: ' + event.error;
        };
    } else {
        voiceInputResults.innerHTML = 'Speech recognition not supported in this browser.';
    }
});
