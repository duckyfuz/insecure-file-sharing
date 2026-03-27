const UPLOAD_IDLE_LABEL = "upload file";
const UPLOAD_LOADING_LABEL = '<span class="loading"></span>uploading...';
const SAMPLE_FILE_CODE = "4f7a";
const DEFAULT_UPLOAD_AREA_MARKUP = `
  <div class="upload-icon">📤</div>
  <p>drag & drop your file here<br />or click to browse</p>
`;

const uploadArea = document.getElementById("uploadArea");
const fileInput = document.getElementById("fileInput");
const uploadButton = document.getElementById("uploadButton");
const outputDiv = document.getElementById("output");
const fileNameInput = document.getElementById("fileNameInput");
const accessFileButton = document.getElementById("accessFileButton");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");
const progressPercent = document.getElementById("progressPercent");
const progressSize = document.getElementById("progressSize");
const progressSpeed = document.getElementById("progressSpeed");
const prefixInput = document.getElementById("prefixInput");
const prefixPreview = document.getElementById("prefixPreview");
const themeToggle = document.getElementById("themeToggle");
const html = document.documentElement;
const { apiUrl } = window.IFS_CONFIG;

let uploadStartTime = 0;

function preventDefaults(event) {
  event.preventDefault();
  event.stopPropagation();
}

function highlightUploadArea() {
  uploadArea.classList.add("drag-over");
}

function resetUploadAreaMarkup() {
  uploadArea.innerHTML = DEFAULT_UPLOAD_AREA_MARKUP;
}

function unhighlightUploadArea() {
  uploadArea.classList.remove("drag-over");
}

function updatePrefixPreview() {
  const value = prefixInput.value.trim();
  prefixPreview.textContent = value
    ? `${value}-${SAMPLE_FILE_CODE}`
    : SAMPLE_FILE_CODE;
}

function updateUploadButtonState() {
  const hasFile = fileInput.files.length > 0;
  uploadButton.disabled = !hasFile;

  if (hasFile) {
    uploadArea.innerHTML = `<div class="upload-icon">📄</div><p>${fileInput.files[0].name}</p>`;
    return;
  }

  resetUploadAreaMarkup();
}

function handleDrop(event) {
  const { files } = event.dataTransfer;
  if (files.length === 0) {
    return;
  }

  fileInput.files = files;
  updateUploadButtonState();
}

function formatBytes(bytes) {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024));

  return (
    (bytes / Math.pow(1024, unitIndex)).toFixed(unitIndex > 0 ? 1 : 0) +
    " " +
    units[unitIndex]
  );
}

function showProgress() {
  progressContainer.style.display = "block";
  progressBar.style.width = "0%";
  progressPercent.textContent = "0%";
  progressSize.textContent = "";
  progressSpeed.textContent = "";
}

function updateProgress(loaded, total) {
  const percentage = Math.round((loaded / total) * 100);
  progressBar.style.width = `${percentage}%`;
  progressPercent.textContent = `${percentage}%`;
  progressSize.textContent = `${formatBytes(loaded)} / ${formatBytes(total)}`;

  const elapsedSeconds = (Date.now() - uploadStartTime) / 1000;
  if (elapsedSeconds > 0.5) {
    const speed = loaded / elapsedSeconds;
    progressSpeed.textContent = `${formatBytes(speed)}/s`;
  }
}

function hideProgress() {
  progressBar.style.width = "100%";
  progressPercent.textContent = "100%";

  setTimeout(() => {
    progressContainer.style.display = "none";
  }, 1500);
}

function appendLog(message, type = "normal") {
  const div = document.createElement("div");

  if (type === "error") {
    const span = document.createElement("span");
    span.className = "error";
    span.textContent = `⚠️ ${message}`;
    div.appendChild(span);
  } else if (type === "success") {
    div.innerHTML = message;
  } else {
    div.textContent = message;
  }

  outputDiv.appendChild(div);
  outputDiv.scrollTop = outputDiv.scrollHeight;
}

function resetTurnstile() {
  if (window.turnstile) {
    window.turnstile.reset();
  }
}

function showError(message) {
  uploadButton.innerHTML = UPLOAD_IDLE_LABEL;
  updateUploadButtonState();
  appendLog(message, "error");
  resetTurnstile();
}

function resetUploadForm() {
  fileInput.value = "";
  prefixInput.value = "";
  prefixPreview.textContent = SAMPLE_FILE_CODE;
  updateUploadButtonState();
  resetTurnstile();
}

function buildUploadPayload(file) {
  const payload = {
    original_filename: file.name,
    turnstile_token: window.turnstile.getResponse(),
  };

  const customPrefix = prefixInput.value.trim();
  if (customPrefix) {
    payload.custom_prefix = customPrefix;
  }

  return payload;
}

function fetchPresignedUpload(file) {
  return fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildUploadPayload(file)),
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }

    return response.text().then((text) => {
      throw new Error(
        `Error fetching presigned URL (${response.status}): ${
          text || response.statusText
        }`,
      );
    });
  });
}

function uploadToS3(uploadData, file) {
  if (
    !uploadData.upload_url ||
    !uploadData.upload_url.url ||
    !uploadData.upload_url.fields ||
    !uploadData.file_id
  ) {
    throw new Error("Invalid presigned URL data received.");
  }

  const formData = new FormData();
  Object.entries(uploadData.upload_url.fields).forEach(([key, value]) => {
    formData.append(key, value);
  });
  formData.append("file", file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    showProgress();
    uploadStartTime = Date.now();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        updateProgress(event.loaded, event.total);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(uploadData.file_id);
        return;
      }

      reject(
        new Error(
          `Error uploading to S3 (${xhr.status}): ${
            xhr.responseText || xhr.statusText
          }`,
        ),
      );
    };

    xhr.onerror = () => {
      reject(new Error("Network error during upload."));
    };

    xhr.open("POST", uploadData.upload_url.url);
    xhr.send(formData);
  });
}

function uploadFile() {
  uploadButton.disabled = true;
  uploadButton.innerHTML = UPLOAD_LOADING_LABEL;

  const file = fileInput.files[0];
  if (!file) {
    showError("please select a file first.");
    return;
  }

  const maxSize = 500 * 1024 * 1024;
  if (file.size > maxSize) {
    showError("file size exceeds 500MB limit.");
    return;
  }

  if (!window.turnstile.getResponse()) {
    showError("please verify you are human.");
    return;
  }

  appendLog(`🗃️ processing file: ${file.name} (${formatBytes(file.size)})`);

  fetchPresignedUpload(file)
    .then((uploadData) => uploadToS3(uploadData, file))
    .then((fileId) => {
      hideProgress();
      appendLog(
        `🎉 upload successful!\n     access with code: <strong class="success">${fileId}</strong>\n     or at <a href="/${fileId}" target="_blank" rel="noopener noreferrer">${window.location.origin}/${fileId}</a>\n`,
        "success",
      );
      uploadButton.innerHTML = UPLOAD_IDLE_LABEL;
      resetUploadForm();
    })
    .catch((error) => {
      hideProgress();
      showError(`upload failed: ${error.message}`);
    });
}

function updateAccessButtonState() {
  accessFileButton.disabled = fileNameInput.value.trim() === "";
}

function redirectToFile() {
  const fileName = fileNameInput.value.trim();
  if (!fileName) {
    window.alert("Please enter a file hash.");
    return;
  }

  window.location.href = `/${fileName}`;
}

function initializeTheme() {
  const savedTheme = localStorage.getItem("theme");
  html.setAttribute("data-theme", savedTheme === "light" ? "light" : "dark");

  themeToggle.addEventListener("click", () => {
    const currentTheme = html.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  });
}

function initializeEventListeners() {
  prefixInput.addEventListener("input", updatePrefixPreview);
  uploadArea.addEventListener("click", () => fileInput.click());
  uploadArea.addEventListener("drop", handleDrop);
  fileInput.addEventListener("change", updateUploadButtonState);
  uploadButton.addEventListener("click", uploadFile);
  fileNameInput.addEventListener("input", updateAccessButtonState);
  accessFileButton.addEventListener("click", redirectToFile);

  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    uploadArea.addEventListener(eventName, preventDefaults, false);
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    uploadArea.addEventListener(eventName, highlightUploadArea, false);
  });

  ["dragleave", "drop"].forEach((eventName) => {
    uploadArea.addEventListener(eventName, unhighlightUploadArea, false);
  });
}

initializeEventListeners();
updatePrefixPreview();
updateUploadButtonState();
updateAccessButtonState();
initializeTheme();
