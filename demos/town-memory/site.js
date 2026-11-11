const pageUrl = new URL(document.URL);
const pageAsset = (file) => new URL(file, pageUrl).href;
console.info("[杉溪鄉 0/4] 輸入（絕對 URL）", [
  pageUrl.href,
  pageAsset("styles.css"),
  pageAsset("site.js"),
  ...[...document.images].map((image) => image.src),
].join("\n"));
console.info("[杉溪鄉 0/4] 輸出", pageAsset("#chapters"), pageAsset("#notebook"), "瀏覽器本機筆記，手動匯出杉溪鄉-地方記憶.json。");

console.info("[杉溪鄉 1/4] 初始化捲動運鏡");
const cameraFrames = [...document.querySelectorAll("[data-camera]")];
const cameraPreference = matchMedia("(prefers-reduced-motion: reduce)");
const daylight = document.querySelector(".daylight-photo");
const fireflyPhoto = document.querySelector(".firefly-photo");
function markCreekReady() {
  if (daylight.naturalWidth && fireflyPhoto.naturalWidth) {
    daylight.parentElement.dataset.dayReady = "";
  }
}
for (const image of [daylight, fireflyPhoto]) {
  image.addEventListener("load", markCreekReady, { once: true });
}
markCreekReady();
let cameraFrameRequest = 0;

function updateCameraFrames() {
  cameraFrameRequest = 0;
  if (cameraPreference.matches) return;
  const viewport = document.documentElement.clientHeight;
  const progress = cameraFrames.map((frame) => {
    const { top, height } = frame.getBoundingClientRect();
    const position = frame.dataset.camera === "tilt"
      ? -top / height
      : (viewport * .91 - top) / (viewport * .71 + height * .13);
    const bounded = Math.min(1, Math.max(0, position));
    return (bounded * bounded * (3 - 2 * bounded)).toFixed(4);
  });
  cameraFrames.forEach((frame, index) => {
    if (frame.style.getPropertyValue("--camera-progress") !== progress[index]) {
      frame.style.setProperty("--camera-progress", progress[index]);
    }
  });
}

function requestCameraFrame() {
  if (cameraFrameRequest || cameraPreference.matches) return;
  cameraFrameRequest = requestAnimationFrame(updateCameraFrames);
}

function configureCamera() {
  document.body.classList.toggle("camera-ready", !cameraPreference.matches);
  requestCameraFrame();
}

window.addEventListener("scroll", requestCameraFrame, { passive: true });
window.addEventListener("resize", requestCameraFrame);
cameraPreference.addEventListener("change", configureCamera);
configureCamera();

console.info("[杉溪鄉 2/4] 讀取本機筆記");
const storageKey = "nicoa-town-memory-notes-v1";
const fields = ["id", "topic", "title", "context", "memory", "createdAt"];
let storage;
let notes = [];

function readStoredNotes() {
  const saved = JSON.parse(storage.getItem(storageKey) ?? "[]");
  if (!Array.isArray(saved) || !saved.every((note) => note
    && fields.every((field) => typeof note[field] === "string")
    && Number.isFinite(Date.parse(note.createdAt)))) {
    throw new Error("Invalid saved notes");
  }
  return saved;
}

try {
  storage = window.localStorage;
  notes = readStoredNotes();
} catch {
  storage = null;
}

console.info("[杉溪鄉 3/4] 建立筆記介面");
const form = document.querySelector("#memory-form");
const titleInput = document.querySelector("#memory-title");
const memoryInput = document.querySelector("#memory");
const noteStatus = document.querySelector("#note-status");
const noteList = document.querySelector("#notes");
const emptyNotes = document.querySelector("#empty-notes");
const exportButton = document.querySelector("#export-notes");
const noteDate = new Intl.DateTimeFormat("zh-TW", { dateStyle: "medium", timeZone: "Asia/Taipei" });
const storageNotice = "這個瀏覽器目前無法儲存筆記。請在離開頁面前匯出。";

function makeTextElement(tag, className, value) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = value;
  return element;
}

function renderNotes() {
  emptyNotes.hidden = notes.length > 0;
  exportButton.disabled = notes.length === 0;
  noteList.replaceChildren(...notes.map((note) => {
    const item = document.createElement("li");
    const meta = [note.topic, note.context, noteDate.format(new Date(note.createdAt))]
      .filter(Boolean).join("・");
    const remove = makeTextElement("button", "remove-note", "刪除");
    remove.type = "button";
    remove.dataset.noteId = note.id;
    remove.setAttribute("aria-label", `刪除筆記「${note.title}」`);
    item.append(
      makeTextElement("h4", "note-title", note.title),
      makeTextElement("p", "note-meta", meta),
      makeTextElement("p", "note-body", note.memory),
      remove,
    );
    return item;
  }));
}

function updateNotes(change) {
  if (storage) {
    try {
      notes = readStoredNotes();
    } catch {
      storage = null;
    }
  }
  notes = change(notes);
  if (storage) {
    try {
      storage.setItem(storageKey, JSON.stringify(notes));
    } catch {
      storage = null;
    }
  }
  renderNotes();
}

for (const field of [titleInput, memoryInput]) {
  field.addEventListener("input", () => field.setCustomValidity(""));
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  for (const field of [titleInput, memoryInput]) {
    if (!field.value.trim()) {
      field.setCustomValidity("請輸入文字。");
      field.reportValidity();
      return;
    }
  }
  const formData = new FormData(form);
  const note = {
    id: crypto.randomUUID(),
    topic: formData.get("topic"),
    title: titleInput.value.trim(),
    context: formData.get("context").trim(),
    memory: memoryInput.value.trim(),
    createdAt: new Date().toISOString(),
  };
  updateNotes((current) => [note, ...current]);
  form.reset();
  noteStatus.textContent = storage ? "已將筆記存到這個瀏覽器。" : `筆記已加入目前頁面。${storageNotice}`;
  console.info("[杉溪鄉] 已新增一則筆記。");
});

noteList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-note-id]");
  if (!button) return;
  const note = notes.find((item) => item.id === button.dataset.noteId);
  if (!note || !window.confirm(`刪除筆記「${note.title}」？`)) return;
  updateNotes((current) => current.filter((item) => item.id !== note.id));
  noteStatus.textContent = storage ? "已刪除筆記。" : `已從目前頁面移除筆記。${storageNotice}`;
  (notes.length ? exportButton : document.querySelector("#topic")).focus();
});

exportButton.addEventListener("click", () => {
  const payload = JSON.stringify({ township: "杉溪鄉", notes }, null, 2);
  const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "杉溪鄉-地方記憶.json";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  noteStatus.textContent = `已匯出 ${notes.length} 則筆記。`;
  console.info("[杉溪鄉] 已產生筆記匯出檔。");
});

window.addEventListener("storage", (event) => {
  if (!storage || event.key !== storageKey) return;
  try {
    notes = readStoredNotes();
    renderNotes();
  } catch {
    storage = null;
    noteStatus.textContent = storageNotice;
  }
});

renderNotes();
if (!storage) noteStatus.textContent = storageNotice;
document.querySelector(".notebook-panel").hidden = false;
console.info("[杉溪鄉 4/4] 捲動運鏡與記憶筆記就緒");
