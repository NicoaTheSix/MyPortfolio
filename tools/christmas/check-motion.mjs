import assert from 'node:assert/strict';
import vm from 'node:vm';
import path from 'node:path';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const source=path.resolve(here,'../../christmas/cards/cards.js');
console.log(`輸入動畫程式：${source}\n輸出：終端機抽離邊界檢查結果（不寫入檔案）`);
const node=()=>({addEventListener(){},classList:{add(){},remove(){}},style:{setProperty(){}},focus(){}});
const tops=[460,380,350,350,380,460];
const heights=[330,300,280,280,300,330];
const cards=tops.map((top,index)=>{
  const card={...node(),dataset:{year:String(2021+index),index:String(index)},offsetWidth:186,offsetHeight:270,lift:0};
  card.getBoundingClientRect=()=>({top:top-card.lift,bottom:top-card.lift+heights[index],left:100+index*100,width:250,height:heights[index]});
  Object.defineProperty(card.style,'zIndex',{get(){return this.layer;},set(value){
    if(value===40){
      const deckTop=Math.min(...cards.filter(c=>c!==card).map(c=>c.getBoundingClientRect().top));
      assert(card.getBoundingClientRect().bottom<=deckTop-24,`${card.dataset.year} 還未完全抽離便置頂：卡片下緣 ${card.getBoundingClientRect().bottom}，牌堆上緣 ${deckTop}`);
    }
    this.layer=value;
  }});
  card.animate=(frames)=>{
    const distance=Number(frames.at(-1).transform?.match(/^translateY\(-([\d.]+)px\)/)?.[1]||0);
    return {finished:Promise.resolve().then(()=>{card.lift=distance;}),cancel(){card.lift=0;},finish(){card.lift=distance;}};
  };
  return card;
});
const reduced={matches:true,addEventListener(){}};
const stage={...node(),clientWidth:900,offsetWidth:900};
const elements=new Map([['.fan-stage',stage],['.fan-scroller',{...node(),clientWidth:900}],['.replay-button',{...node(),disabled:false}]]);
const document={addEventListener(){},querySelectorAll:s=>s==='.fan-card'?cards:[],querySelector:s=>elements.get(s)||node()};
const context=vm.createContext({document,window:{matchMedia:()=>reduced,addEventListener(){}},getComputedStyle:()=>({transform:'matrix(1,0,0,1,0,0)'}),console});
vm.runInContext(await readFile(source,'utf8'),context);
reduced.matches=false;
console.log('[1/2] 使用實際卡片程式與固定旋轉外框尺寸重播抽卡。');
for(let index=0;index<cards.length;index++){
  await vm.runInContext(`bringToFront(cards[${index}])`,context);
  assert.equal(cards[index].style.zIndex,40);
  assert.equal(cards[index].lift,0,'下放後必須回到原位');
}
console.log('[2/2] 六張卡片在切換前層時均已完全高於牌堆，且下放回原位。');

