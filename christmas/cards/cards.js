const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const cards = [...document.querySelectorAll('.fan-card')];
const stage = document.querySelector('.fan-stage');
const scroller = document.querySelector('.fan-scroller');
const dialog = document.querySelector('.reading-dialog');
const flight = document.querySelector('.flight-card');
const sheet = document.querySelector('.reading-sheet');
const content = document.querySelector('.reading-content');
const closeButton = document.querySelector('.close-reading');
const replay = document.querySelector('.replay-button');
let phase = 'ready';
let selected = null;
let returnFocus = null;
let epoch = 0;
let fanAnimations = [];
let openingAnimation = null;
let frontCard = null;
let drawingCard = null;
let drawingAnimation = null;
let drawingPromise = null;

function layoutFan() {
  const radius = Math.max(180,(stage.clientWidth-cards[0].offsetWidth*1.8));
  cards.forEach((card,index)=>{
    const angle = (index-2.5)*12;
    const rad = angle*Math.PI/180;
    card.style.setProperty('--x',`${radius*Math.sin(rad)}px`);
    card.style.setProperty('--y',`${radius*(1-Math.cos(rad))}px`);
    card.style.setProperty('--angle',`${angle}deg`);
    card.dataset.radius = radius;
    card.dataset.angle = angle;
    card.style.zIndex = card===frontCard ? 40 : 10+Math.round((3-Math.abs(index-2.5))*2);
  });
}

function playFan() {
  if(phase!=='ready'||drawingCard) return;
  fanAnimations.forEach(animation=>animation.cancel());
  layoutFan();
  if (reduced.matches) { replay.disabled=false; return; }
  replay.disabled=true;
  fanAnimations=cards.map((card,index)=>{
    const radius=Number(card.dataset.radius);
    const end=Number(card.dataset.angle);
    const frames=Array.from({length:15},(_,step)=>{
      const p=step/14;
      const angle=end*p;
      const rad=angle*Math.PI/180;
      const x=radius*Math.sin(rad);
      const y=radius*(1-Math.cos(rad))+(1-p)*140;
      return {transform:`translate(-50%,-50%) translate3d(${x}px,${y}px,0) rotate(${angle}deg) scale(${0.86+0.14*p})`,opacity:Math.min(1,p*4),offset:p};
    });
    return card.animate(frames,{duration:1450,delay:index*65,easing:'cubic-bezier(.18,.7,.2,1)',fill:'backwards'});
  });
  Promise.allSettled(fanAnimations.map(animation=>animation.finished)).then(()=>{replay.disabled=false;});
}

async function bringToFront(card) {
  if(drawingPromise) await drawingPromise;
  if(frontCard===card) return;
  drawingCard=card;
  replay.disabled=true;
  const promote=()=>{frontCard=card;layoutFan();};
  drawingPromise=(async()=>{
    if(reduced.matches){promote();return;}
    const base=getComputedStyle(card).transform;
    const lifted=`translateY(-${Math.round(card.offsetHeight*.65+48)}px) ${base}`;
    // Keep the old stacking order while drawing out; change it only at the apex.
    drawingAnimation=card.animate([{transform:base},{transform:lifted}],{duration:380,easing:'cubic-bezier(.3,0,.3,1)',fill:'forwards'});
    try{await drawingAnimation.finished;}catch{return;}
    promote();
    drawingAnimation.cancel();
    drawingAnimation=card.animate([{transform:lifted},{transform:base}],{duration:420,easing:'cubic-bezier(.2,.65,.2,1)'});
    try{await drawingAnimation.finished;}catch{}
  })();
  try{await drawingPromise;}finally{
    drawingAnimation?.cancel();drawingAnimation=null;drawingCard=null;drawingPromise=null;
    replay.disabled=false;
  }
}

function fillYear(card) {
  const template=document.getElementById(`content-${card.dataset.year}`);
  content.replaceChildren(template.content.cloneNode(true));
  dialog.style.setProperty('--primary',card.style.getPropertyValue('--primary'));
  dialog.style.setProperty('--secondary',card.style.getPropertyValue('--secondary'));
  flight.style.setProperty('--primary',card.style.getPropertyValue('--primary'));
  flight.style.setProperty('--secondary',card.style.getPropertyValue('--secondary'));
  document.getElementById('reading-title').textContent=card.dataset.year;
  document.querySelector('.reading-counter').textContent=`${Number(card.dataset.index)+1} / ${cards.length}`;
  document.querySelector('.previous-year').disabled=card===cards[0];
  document.querySelector('.next-year').disabled=card===cards.at(-1);
  document.querySelector('.reading-scroll').scrollTop=0;
}

function finishOpen() {
  flight.classList.add('flight-finished');
  sheet.classList.add('sheet-active');
  phase='reading';
  closeButton.focus({preventScroll:true});
}

async function openYear(card,trigger=card) {
  if (phase!=='ready') return;
  const mine=++epoch;
  phase='opening';selected=card;returnFocus=trigger;
  fanAnimations.forEach(animation=>{try{animation.finish();}catch{animation.cancel();}});
  await bringToFront(card);
  if(mine!==epoch) return;
  const rect=card.getBoundingClientRect();
  const width=card.offsetWidth;
  const height=card.offsetHeight;
  const startX=rect.left+rect.width/2-width/2;
  const startY=rect.top+rect.height/2-height/2;
  const endX=(window.innerWidth-width)/2;
  const endY=(window.innerHeight-height)/2;
  fillYear(card);
  flight.innerHTML=card.innerHTML;
  flight.style.width=`${width}px`;flight.style.height=`${height}px`;
  flight.style.transform=`translate3d(${endX}px,${endY}px,0)`;
  flight.classList.remove('flight-finished');
  sheet.classList.remove('sheet-active');
  card.classList.add('selected');
  document.body.classList.add('reading-open');
  dialog.showModal();
  if(reduced.matches){finishOpen();return;}
  const midpointX=(startX+endX)/2;
  const midpointY=Math.min(startY,endY)-45;
  openingAnimation=flight.animate([
    {transform:`translate3d(${startX}px,${startY}px,0) rotate(${card.dataset.angle}deg)`,opacity:1},
    {transform:`translate3d(${midpointX}px,${midpointY}px,0) rotate(${Number(card.dataset.angle)*0.28}deg) scale(1.04)`,offset:.58,opacity:1},
    {transform:`translate3d(${endX}px,${endY}px,0) rotate(0deg)`,opacity:1},
  ],{duration:640,easing:'cubic-bezier(.22,.74,.2,1)'});
  try{await openingAnimation.finished;}catch{return;}
  if(mine===epoch&&dialog.open) finishOpen();
}

function resetReading() {
  epoch++;
  openingAnimation?.cancel();
  selected?.classList.remove('selected');
  sheet.classList.remove('sheet-active','sheet-closing','content-switching');
  flight.classList.add('flight-finished');
  document.body.classList.remove('reading-open');
  phase='ready';
  if(returnFocus?.isConnected) returnFocus.focus({preventScroll:true});
}

async function closeReading() {
  if(!dialog.open||phase==='closing') return;
  phase='closing';epoch++;openingAnimation?.cancel();
  sheet.classList.add('sheet-closing');
  flight.classList.add('flight-finished');
  if(!reduced.matches) {
    try{await sheet.animate([{opacity:getComputedStyle(sheet).opacity},{opacity:0,transform:'translate(-50%,-48%) scale(.98)'}],{duration:200,easing:'ease-in',fill:'forwards'}).finished;}catch{}
    sheet.getAnimations().forEach(animation=>animation.cancel());
  }
  dialog.close();
}

async function switchYear(step) {
  if(phase!=='reading') return;
  const next=cards[Number(selected.dataset.index)+step];
  if(!next) return;
  phase='switching';const mine=++epoch;
  if(!reduced.matches) {
    try{await content.animate([{opacity:1},{opacity:0}],{duration:120}).finished;}catch{return;}
  }
  if(mine!==epoch||!dialog.open) return;
  selected.classList.remove('selected');selected=next;selected.classList.add('selected');fillYear(next);
  if(!reduced.matches) content.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:330,easing:'ease-out'});
  phase='reading';
}

cards.forEach(card=>card.addEventListener('click',()=>openYear(card)));
cards.forEach(card=>{
  card.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'&&phase==='ready'&&!replay.disabled) void bringToFront(card);});
  card.addEventListener('focus',()=>{if(phase==='ready'&&!replay.disabled) void bringToFront(card);});
});
document.querySelectorAll('[data-open-year]').forEach(button=>button.addEventListener('click',()=>openYear(cards.find(card=>card.dataset.year===button.dataset.openYear),button)));
closeButton.addEventListener('click',closeReading);
dialog.addEventListener('cancel',event=>{event.preventDefault();closeReading();});
dialog.addEventListener('click',event=>{if(event.target===dialog) closeReading();});
dialog.addEventListener('close',resetReading);
document.querySelector('.previous-year').addEventListener('click',()=>switchYear(-1));
document.querySelector('.next-year').addEventListener('click',()=>switchYear(1));
replay.addEventListener('click',playFan);
window.addEventListener('resize',()=>{
  drawingAnimation?.finish();
  fanAnimations.forEach(animation=>animation.cancel());layoutFan();replay.disabled=false;
  if(dialog.open&&phase==='opening'){epoch++;openingAnimation?.cancel();finishOpen();}
});
reduced.addEventListener('change',()=>{
  if(reduced.matches) drawingAnimation?.finish();
  if(reduced.matches){fanAnimations.forEach(animation=>animation.cancel());replay.disabled=false;if(dialog.open&&phase==='opening'){epoch++;openingAnimation?.cancel();finishOpen();}}
});
layoutFan();
scroller.scrollLeft=(stage.offsetWidth-scroller.clientWidth)/2;
playFan();
