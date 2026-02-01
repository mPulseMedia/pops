const config = window.APP_CONFIG || {};

const transcriptList = document.getElementById("transcriptList");
const interimEl = document.getElementById("interim");
const toggleListenBtn = document.getElementById("toggleListen");
const clearTranscriptBtn = document.getElementById("clearTranscript");
const refreshNowBtn = document.getElementById("refreshNow");
const saveSnapshotBtn = document.getElementById("saveSnapshot");
const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");
const micHintEl = document.getElementById("micHint");
const diagnosticsEl = document.getElementById("diagnostics");

const MAX_TRANSCRIPT_ENTRIES = 1000;
const VISIBLE_TRANSCRIPT_ENTRIES = 15;
const AUTO_RELOAD = config.AUTO_RELOAD !== false;
const RELOAD_INTERVAL_MS = Number(config.RELOAD_INTERVAL_MS) || 2000;

let recognition = null;
let isListening = false;
let micStream = null;

function setStatus(text, active) {
  statusText.textContent = text;
  statusDot.classList.toggle("active", Boolean(active));
}

function setDiagnostics(lines) {
  diagnosticsEl.textContent = lines.filter(Boolean).join("\n");
}

async function requestMicAccess() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return { ok: false, reason: "getUserMedia not supported" };
  }

  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: error?.name || "permission denied" };
  }
}

async function updateDiagnostics() {
  const lines = [
    `URL: ${window.location.href}`,
    `Secure: ${window.isSecureContext ? "yes" : "no"}`,
    `Auto reload: ${AUTO_RELOAD ? "on" : "off"} (${RELOAD_INTERVAL_MS}ms)`,
  ];

  if (navigator.permissions?.query) {
    try {
      const status = await navigator.permissions.query({ name: "microphone" });
      lines.push(`Mic permission: ${status.state}`);
    } catch (error) {
      lines.push("Mic permission: unknown");
    }
  } else {
    lines.push("Mic permission: unknown");
  }

  setDiagnostics(lines);
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function appendTranscript(text) {
  const entry = document.createElement("div");
  entry.className = "transcript-entry";
  entry.dataset.timestamp = new Date().toISOString();

  const time = document.createElement("div");
  time.className = "transcript-time";
  time.textContent = formatTime(new Date());

  const message = document.createElement("div");
  message.textContent = text;

  entry.appendChild(time);
  entry.appendChild(message);
  transcriptList.prepend(entry);

  while (transcriptList.children.length > MAX_TRANSCRIPT_ENTRIES) {
    transcriptList.removeChild(transcriptList.lastChild);
  }

  updateTranscriptVisibility();
}

function updateTranscriptVisibility() {
  const entries = Array.from(transcriptList.children);
  entries.forEach((entry, index) => {
    entry.classList.toggle("is-hidden", index >= VISIBLE_TRANSCRIPT_ENTRIES);
  });
}

function clearTranscript() {
  transcriptList.innerHTML = "";
  interimEl.textContent = "";
}

function handleCommand(text) {
  const lower = text.toLowerCase();
  if (lower.includes("refresh") || lower.includes("reload")) {
    forceReload();
  }
  if (lower.includes("clear")) {
    clearTranscript();
  }
}

function handleFinalResult(text) {
  if (!text.trim()) return;
  appendTranscript(text);
  handleCommand(text);
}

function setupSpeechRecognition() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const isFileProtocol = window.location.protocol === "file:";
  const isSecureContext =
    window.location.protocol === "https:" ||
    window.location.hostname === "localhost";

  if (isFileProtocol) {
    micHintEl.textContent =
      "Mic blocked on file://. Use HTTPS or http://localhost.";
  } else if (!isSecureContext) {
    micHintEl.textContent =
      "Speech recognition requires HTTPS or http://localhost in Chrome.";
  } else {
    micHintEl.textContent = "Mic permission: allow while visiting this site.";
  }

  if (!SpeechRecognition || isFileProtocol) {
    toggleListenBtn.disabled = true;
    setStatus("Speech recognition not supported", false);
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  recognition.onstart = () => {
    setStatus("Listening", true);
    micHintEl.textContent = "Mic active. Speak now.";
    document.body.classList.add("minimal-mode");
  };

  recognition.onend = () => {
    if (isListening) {
      setTimeout(() => recognition.start(), 400);
    } else {
      setStatus("Idle", false);
      document.body.classList.remove("minimal-mode");
    }
  };

  recognition.onerror = (event) => {
    if (event.error === "not-allowed" || event.error === "service-not-allowed") {
      setStatus("Mic blocked", false);
      micHintEl.textContent =
        "Microphone blocked. Allow access in the browser address bar.";
      isListening = false;
      toggleListenBtn.textContent = "Start Listening";
      return;
    }
    if (event.error === "network") {
      setStatus("Mic network error", false);
      return;
    }
    setStatus("Mic error", false);
  };

  recognition.onresult = (event) => {
    let interim = "";
    let finalText = "";

    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalText += transcript;
      } else {
        interim += transcript;
      }
    }

    interimEl.textContent = interim.trim();
    if (finalText.trim()) {
      interimEl.textContent = "";
      handleFinalResult(finalText.trim());
    }
  };
}

function toggleListening() {
  if (!recognition) return;

  isListening = !isListening;
  if (isListening) {
    toggleListenBtn.textContent = "Stop Listening";
    requestMicAccess().then((result) => {
      if (!result.ok) {
        setStatus("Mic blocked", false);
        micHintEl.textContent = `Microphone blocked: ${result.reason}`;
        isListening = false;
        toggleListenBtn.textContent = "Start Listening";
        return;
      }
      recognition.start();
    });
  } else {
    recognition.stop();
    toggleListenBtn.textContent = "Start Listening";
    document.body.classList.remove("minimal-mode");
  }
}

function forceReload() {
  setStatus("Refreshing...", false);
  window.location.reload();
}

function downloadSnapshotHtml() {
  const html = `<!doctype html>\n${document.documentElement.outerHTML}`;
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "saved-index.html";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function startAutoReload() {
  if (!AUTO_RELOAD) return;

  setInterval(() => {
    if (!isListening) {
      window.location.reload();
    }
  }, RELOAD_INTERVAL_MS);
}

toggleListenBtn.addEventListener("click", toggleListening);
clearTranscriptBtn.addEventListener("click", clearTranscript);
refreshNowBtn.addEventListener("click", forceReload);
saveSnapshotBtn.addEventListener("click", downloadSnapshotHtml);

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
    event.preventDefault();
    downloadSnapshotHtml();
  }
});

setupSpeechRecognition();
updateDiagnostics();
startAutoReload();
