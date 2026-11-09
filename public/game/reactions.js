export const REACTION_FEATURE='reactions-v1';
// Additive capability: old clients keep their original three reactions.
export const REACTION_EXTRA_FEATURE='reactions-extra-v1';
export const REACTIONS=Object.freeze([
 Object.freeze({id:'kiss',symbol:'😘',label:'Kuss'}),
 Object.freeze({id:'poop',symbol:'💩',label:'Häufchen'}),
 Object.freeze({id:'laugh',symbol:'😂',label:'Lachen'}),
 Object.freeze({id:'thumbsup',symbol:'👍',label:'Daumen hoch',feature:REACTION_EXTRA_FEATURE}),
 Object.freeze({id:'amazed',symbol:'😲',label:'Staunen',feature:REACTION_EXTRA_FEATURE}),
]);
export const REACTION_TTL=24*60*60*1000;
export const REACTION_INTERVAL=1200;
export const REACTION_SEEN_KEY='farbfeld.reactions.seen.v1';
export const REACTION_MOTIONS=Object.freeze(['fly','bounce','loop']);
export const REACTION_DURATION=3400;
export const REACTION_HOLD_MAX=2500;
export const reactionScale=ms=>Math.round((1+1.5*Math.min(REACTION_HOLD_MAX,Math.max(0,Number.isFinite(ms)?ms:0))/REACTION_HOLD_MAX)*100)/100;
export function reactionEffect(input={}){
 const scale=input.scale??1,motion=input.motion??'fly';
 if(typeof scale!=='number'||!Number.isFinite(scale)||scale<1||scale>2.5||!REACTION_MOTIONS.includes(motion))throw Error('Diese Emoji-Größe oder Bewegung ist nicht verfügbar.');
 return {scale:Math.round(scale*100)/100,motion};
}
export function pickReactionMotion(previous='',random=Math.random){const choices=REACTION_MOTIONS.filter(motion=>motion!==previous);return choices[Math.min(choices.length-1,Math.max(0,Math.floor(random()*choices.length)))];}

// A finished gesture sends directly. Touch browsers need not emit a click after
// release; consume any compatibility click so it cannot send twice or hit below
// a dialog that closed while handling pointerup. A fresh input starts a new turn.
export function bindReactionPress(root,{onSend=()=>{},now=()=>performance.now(),frame=fn=>globalThis.requestAnimationFrame(fn),cancelFrame=id=>globalThis.cancelAnimationFrame(id)}={}){
 let active=null,pendingClick=null,frameId=0;
 const buttonFor=event=>event.target?.closest?.('[data-action="reaction-send"]');
 const inside=(button,event)=>{const r=button.getBoundingClientRect();return event.clientX>=r.left&&event.clientX<=r.right&&event.clientY>=r.top&&event.clientY<=r.bottom;};
 const consume=event=>{event.preventDefault();event.stopImmediatePropagation();};
 const clear=()=>{
  if(frameId)cancelFrame(frameId);frameId=0;const previous=active;active=null;
  if(!previous)return;
  const button=previous.button;button.classList.remove('charging','charge-cancelled');button.style.removeProperty('--charge-preview');button.style.removeProperty('--charge-progress');
  const label=button.querySelector('.reaction-charge');if(label)label.textContent='1×';
  try{if(previous.kind==='pointer'&&button.hasPointerCapture?.(previous.id))button.releasePointerCapture(previous.id);}catch{}
 };
 const finish=cancelled=>{
  if(!active)return;
  const previous=active,button=previous.button,scale=reactionScale(now()-previous.at);
  const send=!cancelled&&previous.inside&&!button.disabled&&button.isConnected!==false&&!root.hidden;
  pendingClick={button,at:now()};clear();
  if(send)onSend(button,{scale});
 };
 const draw=()=>{
  frameId=0;if(!active)return;const progress=Math.min(1,Math.max(0,now()-active.at)/REACTION_HOLD_MAX),button=active.button;
  button.style.setProperty('--charge-preview',String(1+progress*.5));button.style.setProperty('--charge-progress',String(progress));button.classList.toggle('charge-cancelled',!active.inside);
  const label=button.querySelector('.reaction-charge');if(label)label.textContent=active.inside?reactionScale(now()-active.at).toFixed(1).replace('.',',')+'×':'Abbrechen';
  if(progress<1)frameId=frame(draw);
 };
 const start=(button,kind,id)=>{clear();pendingClick=null;active={button,kind,id,at:now(),inside:true};button.classList.add('charging');draw();};
 root.addEventListener('pointerdown',event=>{
  if(event.button!==0||event.isPrimary===false)return;
  pendingClick=null;const button=buttonFor(event);if(!button||button.disabled)return;
  start(button,'pointer',event.pointerId);try{button.setPointerCapture(event.pointerId);}catch{}
 },true);
 root.addEventListener('pointermove',event=>{if(active?.kind==='pointer'&&event.pointerId===active.id){active.inside=inside(active.button,event);if(frameId)cancelFrame(frameId);draw();}},true);
 root.addEventListener('pointerup',event=>{if(active?.kind==='pointer'&&event.pointerId===active.id){active.inside=inside(active.button,event);finish(false);}},true);
 for(const type of ['pointercancel','lostpointercapture'])root.addEventListener(type,event=>{if(active?.kind==='pointer'&&event.pointerId===active.id)finish(true);},true);
 root.addEventListener('click',event=>{
  const button=buttonFor(event);
  if(pendingClick&&now()-pendingClick.at<1500&&(button===pendingClick.button||event.detail>0)){
   pendingClick=null;consume(event);return;
  }
  if(!button||button.disabled)return;
  consume(event);onSend(button,{scale:1});
 },true);
 root.addEventListener('contextmenu',event=>{if(buttonFor(event))event.preventDefault();},true);
 root.addEventListener('keydown',event=>{const button=buttonFor(event);if(!button||button.disabled||!['Enter',' ','Spacebar'].includes(event.key))return;event.preventDefault();if(!event.repeat)start(button,'key',event.key);},true);
 root.addEventListener('keyup',event=>{if(active?.kind==='key'&&event.key===active.id){event.preventDefault();finish(false);}},true);
 const cancel=()=>finish(true);root.addEventListener('close',cancel,true);root.addEventListener('visibilitychange',()=>{if(root.hidden)cancel();});root.defaultView?.addEventListener('blur',cancel);
 return {cancel};
}
export const reactionFor=id=>REACTIONS.find(item=>item.id===id);
export const reactionFeature=id=>reactionFor(id)?.feature||REACTION_FEATURE;
export const validReactionId=id=>typeof id==='string'&&/^[A-Za-z0-9_-]{12,100}$/.test(id);
export function validateReaction(input,members,from){
 if(!reactionFor(input?.emoji))throw Error('Diese Reaktion ist nicht verfügbar.');
 if(input.to!=='all'&&(!Number.isInteger(input.to)||input.to<0||input.to>=members.length||input.to===from))throw Error('Wähle eine andere Person als Empfänger.');
 return {emoji:input.emoji,to:input.to,...reactionEffect(input)};
}
export class VersionTapCounter{
 constructor(){this.reset();}
 reset(){this.count=0;this.last=null;}
 tap(now){if(this.last!==null&&now-this.last>1800)this.reset();this.last=now;this.count++;if(this.count===10){this.reset();return true;}return false;}
}
const newer=(a,b)=>!b||a.at>b.at||a.at===b.at&&a.id>b.id;
// Only small display cursors are saved; never put reactions into game/turn state.
export class RoomReactionInbox{
 constructor({storage,now=Date.now}={}){
  this.now=now;this.records=[];try{this.storage=storage===undefined?globalThis.localStorage:storage;}catch{this.storage=null;}
 }
 valid(row){return row&&typeof row.scope==='string'&&row.scope.length>0&&row.scope.length<=250&&typeof row.senderId==='string'&&row.senderId.length>0&&row.senderId.length<=128&&validReactionId(row.id)&&Number.isSafeInteger(row.at)&&row.at>this.now()-REACTION_TTL&&row.at<=this.now()+10000;}
 read(){
  let stored=[];try{const raw=this.storage?.getItem(REACTION_SEEN_KEY);if(raw&&raw.length<=50000){const value=JSON.parse(raw);if(Array.isArray(value))stored=value;}}catch{}
  const latest=new Map();for(const row of [...this.records,...stored])if(this.valid(row)){const key=JSON.stringify([row.scope,row.senderId]);if(newer(row,latest.get(key)))latest.set(key,row);}
  this.records=[...latest.values()].sort((a,b)=>a.at-b.at).slice(-64);return this.records;
 }
 candidates(events,scope){
  if(typeof scope!=='string'||!scope||scope.length>250)return [];
  const seen=this.read(),latest=new Map();
  for(const event of Array.isArray(events)?events:[]){
   const senderId=typeof event?.senderId==='string'?event.senderId:'legacy:'+event?.id;
   if(!reactionFor(event?.emoji)||!this.valid({...event,scope,senderId}))continue;
   const row={...event,senderId};if(newer(row,latest.get(senderId)))latest.set(senderId,row);
  }
  return [...latest.values()].filter(event=>newer(event,seen.find(row=>row.scope===scope&&row.senderId===event.senderId))).sort((a,b)=>a.at-b.at||(a.id>b.id?1:-1));
 }
 remember(event,scope){
  if(!this.candidates([event],scope).length)return;
  this.records=this.records.filter(row=>row.scope!==scope||row.senderId!==event.senderId);
  this.records.push({scope,senderId:event.senderId,id:event.id,at:event.at});this.records=this.records.sort((a,b)=>a.at-b.at).slice(-64);
  try{this.storage?.setItem(REACTION_SEEN_KEY,JSON.stringify(this.records));}catch{}
 }
}
export class ReactionOverlay{
 constructor({document=globalThis.document,reducedMotion=()=>globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches,storage,now=Date.now,setTimer=(fn,delay)=>globalThis.setTimeout(fn,delay)}={}){
  this.document=document;this.reducedMotion=reducedMotion;this.scope='';this.seen=new Set();this.flights=[];this.roomPending=new Map();this.inbox=new RoomReactionInbox({storage,now});this.setTimer=setTimer;
  document?.addEventListener('visibilitychange',()=>{if(document.hidden){this.flights.forEach(flight=>flight.remove());this.flights=[];}else this.drainRoom();});
 }
 receive(event,seenKey=event?.id){
  const item=reactionFor(event?.emoji);if(!item||typeof event.id!=='string'||this.seen.has(seenKey))return false;
  this.seen.add(seenKey);if(this.seen.size>256)this.seen.delete(this.seen.values().next().value);
  let effect;try{effect=reactionEffect(event);}catch{effect={scale:1,motion:'fly'};}
  const flight=this.document.createElement('div');flight.className='reaction-flight motion-'+effect.motion+(this.reducedMotion()?' reduced-motion':'');flight.setAttribute('aria-hidden','true');
  flight.style?.setProperty('--reaction-scale',String(effect.scale));
  flight.style?.setProperty('--reaction-lane',String(this.flights.length%3));
  const symbol=this.document.createElement('span');symbol.textContent=item.symbol;const label=this.document.createElement('small');label.textContent=String(event.name||'Mitspieler').slice(0,24);flight.append(symbol,label);
  while(this.flights.length>=3)this.flights.shift().remove();this.flights.push(flight);(this.document.querySelector?.('dialog[open]')||this.document.body).append(flight);
  this.setTimer(()=>{flight.remove();this.flights=this.flights.filter(item=>item!==flight);this.drainRoom();},REACTION_DURATION);return true;
 }
 receiveRoom(events,scope){
  if(this.scope!==scope){this.scope=scope;this.roomPending.clear();}
  if(this.document.hidden)return;
  for(const event of this.inbox.candidates(events,scope))if(newer(event,this.roomPending.get(event.senderId)))this.roomPending.set(event.senderId,event);
  this.drainRoom();
 }
 drainRoom(){
  if(this.document.hidden)return;
  for(const event of this.inbox.candidates([...this.roomPending.values()],this.scope)){
   if(this.flights.length>=3)break;
   this.roomPending.delete(event.senderId);
   if(this.receive(event,JSON.stringify([this.scope,event.id])))this.inbox.remember(event,this.scope);
  }
  // A newer read or expired event must not keep a stale pending animation alive.
  const pending=this.inbox.candidates([...this.roomPending.values()],this.scope);this.roomPending=new Map(pending.map(event=>[event.senderId,event]));
 }
}
