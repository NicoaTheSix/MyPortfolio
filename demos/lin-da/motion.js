const storyFrame = document.querySelector(".hero-frame");
const storyControls = document.querySelector(".story-controls");
const storyPlay = document.querySelector(".story-play");
const storyShots = [...storyFrame.querySelectorAll(".story-shot")];
const storyImages = storyShots.map((shot) => shot.querySelector("img"));
const storyTitles = [...storyFrame.querySelectorAll("[data-title]")];
const storyChapters = [...document.querySelectorAll(".story-chapters button")];
const storyUrl = new URL(document.URL);

console.info("[林達片頭 0/3] 輸入（絕對 URL）", [
  storyUrl.href,
  new URL("motion.css", storyUrl).href,
  new URL("motion.js", storyUrl).href,
  ...storyImages.map((image) => image.src),
].join("\n"));
console.info("[林達片頭 0/3] 輸出（頁面內更新，無輸出檔案）", new URL("#hero-title", storyUrl).href);

const shotTiming = [
  { duration: 3000, from: "translateY(-4%) scale(1.14)", to: "translateY(4%) scale(1.14)" },
  { duration: 3000, from: "translateX(4%) scale(1.14)", to: "translateX(-4%) scale(1.14)" },
  { duration: 3600, from: "scale(1.035)", to: "scale(1.115)" },
];
const playbackLabels = { ready: "播放片頭", playing: "暫停片頭", paused: "繼續播放", ended: "重播片頭" };
const reducedStoryMotion = matchMedia("(prefers-reduced-motion: reduce)");
const supportsStoryAnimation = typeof storyFrame.animate === "function";
let storyScene = 0;
let storyState = "ready";
let storyTracks = [];

function setStoryState(state) {
  storyState = state;
  storyPlay.textContent = playbackLabels[state];
}

function stopStoryTracks() {
  for (const track of storyTracks) track.cancel();
  storyTracks = [];
}

function showStoryScene(index, outgoing = -1) {
  storyScene = index;
  storyFrame.dataset.scene = String(index);
  storyShots.forEach((shot, position) => {
    const current = position === index;
    shot.dataset.layer = current ? "current" : position === outgoing ? "outgoing" : "";
    if (current) shot.removeAttribute("aria-hidden");
    else shot.setAttribute("aria-hidden", "true");
    if (current) storyChapters[position].setAttribute("aria-current", "step");
    else storyChapters[position].removeAttribute("aria-current");
  });
  console.info(`[林達片頭] 鏡頭 ${index + 1}/${storyShots.length} ${storyChapters[index].textContent}`);
}

function playStoryScene(index, dissolve = false) {
  const outgoing = dissolve ? storyScene : -1;
  stopStoryTracks();
  showStoryScene(index, outgoing);
  setStoryState("playing");

  const { duration, from, to } = shotTiming[index];
  const move = storyImages[index].animate([{ transform: from }, { transform: to }], {
    duration,
    easing: "cubic-bezier(.34, .15, .2, 1)",
    fill: "both",
  });
  storyTracks.push(move);

  if (dissolve) {
    storyTracks.push(storyShots[index].animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 680,
      easing: "ease-in-out",
      fill: "both",
    }));
  }

  const title = storyTitles[index];
  const parts = title.children.length ? [...title.children] : [title];
  parts.forEach((part, position) => {
    storyTracks.push(part.animate([
      { transform: "translateY(54%)", clipPath: "inset(0 0 100% 0)", opacity: 0 },
      { transform: "translateY(0)", clipPath: "inset(0)", opacity: 1 },
    ], {
      duration: 700,
      delay: (dissolve ? 360 : 140) + position * 140,
      easing: "cubic-bezier(.2, .72, .22, 1)",
      fill: "both",
    }));
  });

  move.finished.then(() => {
    if (!storyTracks.includes(move)) return;
    if (index + 1 < storyShots.length) playStoryScene(index + 1, index === 1);
    else setStoryState("ended");
  }, () => {
    // Switching chapters cancels the previous shot.
  });
}

console.info("[林達片頭 1/3] 準備三個鏡頭");
Promise.all(storyImages.map((image) => image.decode())).then(() => {
  console.info("[林達片頭 2/3] 啟用播放、暫停與選鏡頭");
  storyPlay.hidden = !supportsStoryAnimation;
  storyPlay.addEventListener("click", () => {
    if (storyState === "playing") {
      for (const track of storyTracks) track.pause();
      setStoryState("paused");
    } else if (storyState === "paused") {
      for (const track of storyTracks) track.play();
      setStoryState("playing");
    } else {
      playStoryScene(storyState === "ended" ? 0 : storyScene);
    }
  });
  storyChapters.forEach((button, index) => button.addEventListener("click", () => {
    stopStoryTracks();
    showStoryScene(index);
    setStoryState("ready");
  }));
  reducedStoryMotion.addEventListener("change", ({ matches }) => {
    if (!matches) return;
    stopStoryTracks();
    showStoryScene(storyScene);
    setStoryState("ready");
  });
  storyControls.hidden = false;

  console.info("[林達片頭 3/3] 敘事片頭就緒");
  if (supportsStoryAnimation && !reducedStoryMotion.matches) playStoryScene(0);
}, () => {
  console.warn("[林達片頭] 圖片未能完整載入，顯示靜態片頭。");
});
