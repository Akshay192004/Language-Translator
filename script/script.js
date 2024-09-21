const dropdowns = document.querySelectorAll(".dropdown-container"),
  inputLanguageDropdown = document.querySelector("#input-language"),
  outputLanguageDropdown = document.querySelector("#output-language"),
  inputTextElem = document.querySelector("#input-text"),
  outputTextElem = document.querySelector("#output-text"),
  swapBtn = document.querySelector(".swap-position"),
  uploadDocument = document.querySelector("#upload-document"),
  uploadTitle = document.querySelector("#upload-title"),
  downloadBtn = document.querySelector("#download-btn"),
  darkModeCheckbox = document.getElementById("dark-mode-btn"),
  startRecognitionBtn = document.querySelector("#start-recognition"),
  startSynthesisBtn = document.querySelector("#start-synthesis"),
  voicesDropdown = document.querySelector("#voices");

let recognition;
let synth = window.speechSynthesis;
let voices = [];

// Initialize speech recognition if supported
if ('webkitSpeechRecognition' in window) {
  recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = function(event) {
    inputTextElem.value = event.results[0][0].transcript;
    translate();
  };

  recognition.onerror = function(event) {
    console.error("Speech recognition error", event);
  };
} else {
  alert("Your browser does not support speech recognition.");
}

// Event listener for starting recognition
startRecognitionBtn.addEventListener("click", () => {
  recognition.start();
});

// Function to populate dropdown options
function populateDropdown(dropdown, options) {
  dropdown.querySelector("ul").innerHTML = "";
  options.forEach((option) => {
    const li = document.createElement("li");
    const title = option.name + " (" + option.native + ")";
    li.innerHTML = title;
    li.dataset.value = option.code;
    li.classList.add("option");
    dropdown.querySelector("ul").appendChild(li);
  });
}

// Initial population of dropdowns with languages
populateDropdown(inputLanguageDropdown, languages);
populateDropdown(outputLanguageDropdown, languages);

// Event listeners for dropdowns
dropdowns.forEach((dropdown) => {
  dropdown.addEventListener("click", (e) => {
    dropdown.classList.toggle("active");
  });

  dropdown.querySelectorAll(".option").forEach((item) => {
    item.addEventListener("click", (e) => {
      dropdown.querySelectorAll(".option").forEach((item) => {
        item.classList.remove("active");
      });
      item.classList.add("active");
      const selected = dropdown.querySelector(".selected");
      selected.innerHTML = item.innerHTML;
      selected.dataset.value = item.dataset.value;
      translate();

      // Update recognition language if input language dropdown is changed
      if (dropdown === inputLanguageDropdown) {
        const selectedLanguage = selected.dataset.value;
        if (selectedLanguage !== 'auto') {
          recognition.lang = selectedLanguage;
        } else {
          recognition.lang = 'en-US'; // Default language if auto-detect is selected
        }
      }
    });
  });
});

// Close dropdowns when clicking outside
document.addEventListener("click", (e) => {
  dropdowns.forEach((dropdown) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove("active");
    }
  });
});

// Event listener for swap button to swap languages
swapBtn.addEventListener("click", (e) => {
  const inputLanguage = inputLanguageDropdown.querySelector(".selected");
  const outputLanguage = outputLanguageDropdown.querySelector(".selected");

  const temp = inputLanguage.innerHTML;
  inputLanguage.innerHTML = outputLanguage.innerHTML;
  outputLanguage.innerHTML = temp;

  const tempValue = inputLanguage.dataset.value;
  inputLanguage.dataset.value = outputLanguage.dataset.value;
  outputLanguage.dataset.value = tempValue;

  const tempInputText = inputTextElem.value;
  inputTextElem.value = outputTextElem.value;
  outputTextElem.value = tempInputText;

  translate();
});

// Function to handle text translation
function translate() {
  const inputText = inputTextElem.value;
  const inputLanguage = inputLanguageDropdown.querySelector(".selected").dataset.value;
  const outputLanguage = outputLanguageDropdown.querySelector(".selected").dataset.value;
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${inputLanguage}&tl=${outputLanguage}&dt=t&q=${encodeURI(inputText)}`;

  fetch(url)
    .then((response) => response.json())
    .then((json) => {
      outputTextElem.value = json[0].map((item) => item[0]).join("");
    })
    .catch((error) => {
      console.error(error);
    });
}

// Event listener for input text area to limit characters and trigger translation
inputTextElem.addEventListener("input", (e) => {
  if (inputTextElem.value.length > 5000) {
    inputTextElem.value = inputTextElem.value.slice(0, 5000);
  }
  document.querySelector("#input-chars").innerHTML = inputTextElem.value.length;
  translate();
});

// Event listener for file upload to handle text extraction
uploadDocument.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file.type === "application/pdf" || file.type === "text/plain" || file.type === "application/msword" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    uploadTitle.innerHTML = file.name;
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (e) => {
      inputTextElem.value = e.target.result;
      translate();
    };
  } else {
    alert("Please upload a valid file");
  }
});

// Event listener for download button to download translated text
downloadBtn.addEventListener("click", (e) => {
  const outputText = outputTextElem.value;
  const outputLanguage = outputLanguageDropdown.querySelector(".selected").dataset.value;
  if (outputText) {
    const blob = new Blob([outputText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = `translated-to-${outputLanguage}.txt`;
    a.href = url;
    a.click();
  }
});

// Event listener for dark mode toggle
darkModeCheckbox.addEventListener("change", () => {
  document.body.classList.toggle("dark");
});

// Function to populate voices for speech synthesis
function populateVoices() {
  voices = synth.getVoices();
  voicesDropdown.innerHTML = "";
  voices.forEach((voice, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.innerHTML = `${voice.name} (${voice.lang})`;
    voicesDropdown.appendChild(option);
  });
}

// Initial population of voices dropdown and event listener for voice change
populateVoices();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoices;
}

// Event listener for starting speech synthesis
startSynthesisBtn.addEventListener("click", () => {
  const utterThis = new SpeechSynthesisUtterance(outputTextElem.value);
  const selectedVoice = voices[voicesDropdown.value];
  utterThis.voice = selectedVoice;
  synth.speak(utterThis);
});
