const motionFrame = document.querySelector(".hero-frame");
const motionReplay = motionFrame.querySelector(".hero-replay");
const motionUrl = new URL(document.URL);
console.info("[林達片頭 0/2] 輸入（絕對 URL）", [
  motionUrl.href,
  new URL("motion.css", motionUrl).href,
  new URL("motion.js", motionUrl).href,
  motionFrame.querySelector("img").src,
].join("\n"));
console.info("[林達片頭 0/2] 輸出（頁面內更新，無輸出檔案）", new URL("#hero-title", motionUrl).href);

console.info("[林達片頭 1/2] 初始化動畫重播");
if (typeof motionFrame.getAnimations === "function") {
  motionReplay.addEventListener("click", () => {
    for (const animation of motionFrame.getAnimations({ subtree: true })) {
      animation.currentTime = 0;
      animation.play();
    }
    console.info("[林達片頭] 已重播動畫。");
  });
  motionReplay.hidden = false;
}
console.info("[林達片頭 2/2] 片頭就緒");
