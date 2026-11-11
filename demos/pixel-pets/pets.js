const petCategories = [
  { id: "all", label: "全部", color: "#e1edb2" },
  { id: "robot", label: "機器人", color: "#d6e3f7" },
  { id: "creature", label: "小生物", color: "#e5ecc5" },
  { id: "alien", label: "外星人", color: "#e9daf4" },
  { id: "object", label: "實體", color: "#f5e2c2" },
];

// One character per pixel. Dots are transparent and a–c use each pet's own palette.
const petCatalog = [
  ["bolt", "螺絲豆", "robot", 120, ["#52b7c3", "#23788d", "#f0cb52"],
    ".....xx..... .....xc..... ....xxxx.... ...xaaaax... ..xaaaaaax.. .xxbxwxebxx. .xcxwexwwxc. ..xbbaaabx.. ...xbccbx... ..xxbbbbxx.. ..xx....xx.."],
  ["meter", "方格探測員", "robot", 150, ["#a2b2dd", "#636caa", "#f39c77"],
    "..xxxx..x... .xaaaaxxcx.. .xaxxbxbx... .xaweabx.... .xaawxbx.... .xxxxxx..... ..xcacx.xx.. .xxcbcx.xcx. .xaxbbxxx... ...xbbbxx... ..xxx.xxx..."],
  ["windup", "發條叮噹", "robot", 140, ["#f2ad59", "#ab5350", "#f5db9b"],
    ".....xx..... ....xccx.... ..xxxxxxxx.. .xaaaaaaaax. .xaeaaeaabx. .xaawwcaabx. ..xxxxxxxx.. ...xbcbbx.xx ..xxbcbxxxxc ..xaxxxx..xx ....xx.xx..."],
  ["orbit", "巡軌一號", "robot", 170, ["#93b4e1", "#4b519c", "#83e0cd"],
    ".....xx..... ....xccx.... ...xaaaax... xx.xaewax.xx xbxaaweaaxbx xbxbbaaabxbx xbxxbbbbxxbx xx..xccx..xx ....xxxx.... ...xx..xx..."],
  ["moss", "苔蘑仔", "creature", 110, ["#db6c68", "#a13c54", "#ffe5a6"],
    "....xxxx.... ..xxaaaaxx.. .xaacaaacax. .xaacaaaaax. xaaaacaaacax xbbaaaabbbbx .xxxxxxxxxx. ...xcecex... ...xccpcx... ..xxccccxx.. ..xx....xx.."],
  ["frog", "泡泡蛙", "creature", 120, ["#90bc53", "#4e8648", "#f3eaa6"],
    "..xxx..xxx.. .xawexxewax. .xaaaxxaaax. xaaaaaaaaaax xapccccccpax xaccccccccax .xbccccccbx. ..xxbbbbxx.. .xbbxxxxbbx. ..xx....xx.."],
  ["fox", "赤尾球", "creature", 150, ["#ef9852", "#c3543c", "#fff0c7"],
    "..xx....xx.. ..xax..xax.. ..xaaxxaax.. .xaaaaaaaax. .xaceaaecax. .xccccccccx. ..xccxeccx.. ...xxxxxx... ..xbcbbbx.xx .xbbbbbxcccx ..xxbbaaaax. ..xx..xxxx.."],
  ["gill", "粉鰓仔", "creature", 160, ["#ee91a7", "#c6618d", "#ffbdb1"],
    "xx........xx xax......xax .xaxxxxxxax. xaxaaaaaaxax .xxaeaaeaxx. ..xapaaaax.. ..xaacaaax.. ..xbccaabx.. .xxbbbbbbxx. ...xx..xx..."],
  ["saucer", "漂浮豆", "alien", 155, ["#b98ae3", "#6751a5", "#a7e5d0"],
    "....xxxx.... ...xccccx... ..xccwcccx.. ..xcececcx.. .xxccccccxx. xaaaaaaaaaax xabwaawbabax .xbbbbbbbbx. ..xxxxxxxx.. ....x..x...."],
  ["blob", "月面果凍", "alien", 130, ["#7ed0ba", "#377f84", "#e5f3af"],
    ".....xx..... ....xccx.... ...xaaaax... ..xaaaaaax.. ..xaewweax.. .xaaewweaax. .xapcaaaabx. xaaaaccaabbx xbbbbbbbbbbx xx.xx.xx.xxx"],
  ["mars", "火星信差", "alien", 160, ["#b4c96c", "#5b7a48", "#f5d36f"],
    "..xx....xx.. ..xcx..xcx.. ...xaxxax... ..xaaaaaax.. .xaaeaaeaax. .xaaaaaaaax. ..xaccacax.. ...xxxxxx... ..xbccbbcx.. .xxbccccbxx. .x.xbbbbx.x. ...xx..xx..."],
  ["eye", "星雲獨眼", "alien", 175, ["#af8cd9", "#6851a1", "#f8bf72"],
    ".....x...... ....xcx..x.. ...xaaaaxcx. ..xawwwaxxx. .xawweewax.. .xawwwewax.. ..xawwwax... ..xbaaaabx.. .xabbcbbbax. ..xx...xxx.."],
  ["toast", "吐司蹦蹦", "object", 105, ["#d18c50", "#945735", "#f9dda3"],
    "...xxxxxx... ..xaaaaaax.. .xaccwcccax. .xacccccccx. ..xcececax.. ..xcpcpcax.. ..xcccccax.. ..xaccaaax.. ...xxxxxx... ...xx..xx..."],
  ["tape", "卡帶仔", "object", 135, ["#e58c8a", "#ae596b", "#d1e2e9"],
    "..xxxxxxxx.. .xaaaaaaaax. .xcccwccccx. .xcecxceccx. .xcccwccccx. .xaaaaaaaax. .xbbbccbbbx. .xbbbccbbbx. ..xxxxxxxx.. ...xx..xx..."],
  ["plant", "盆栽慢慢", "object", 125, ["#81af64", "#47765e", "#de8765"],
    "......xx.... ..xx.xaax... .xaaxaax.... ..xaxax.xx.. ...xax.xaax. ....xaxax... ..xxxxxxxx.. ..xccccccx.. ...xceecx... ...xccbcx... ...xxxxxx... ....x..x...."],
  ["cup", "茶杯噗噗", "object", 115, ["#8bbdd7", "#4d7f9e", "#cf9e69"],
    "...x..x..... ..x..x...... .xxxxxxxx... .xaccccaxxx. .xaaaaaaxcx. .xaexaeaxcx. .xapaaaaxxx. ..xbbbbx.... ...xxxx..... ..xx..xx...."],
].map(([id, name, category, price, colors, pattern]) => ({
  id, name, category, price, colors, rows: pattern.split(" "),
}));

function makePetCanvas(pet, decorative = false) {
  const canvas = document.createElement("canvas");
  canvas.width = 16;
  canvas.height = 16;
  if (decorative) canvas.setAttribute("aria-hidden", "true");
  else {
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", `${pet.name}的像素角色`);
  }
  const ink = {
    x: "#28324b", e: "#263044", w: "#fff8e3", p: "#f29898",
    a: pet.colors[0], b: pet.colors[1], c: pet.colors[2],
  };
  const context = canvas.getContext("2d");
  const width = Math.max(...pet.rows.map((row) => row.length));
  const left = Math.floor((canvas.width - width) / 2);
  const top = canvas.height - pet.rows.length - 2;
  pet.rows.forEach((row, y) => [...row].forEach((pixel, x) => {
    if (!ink[pixel]) return;
    context.fillStyle = ink[pixel];
    context.fillRect(left + x, top + y, 1, 1);
  }));
  return canvas;
}
