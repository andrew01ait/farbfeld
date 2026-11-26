const scrollSurfaces='.board-scroll,.battle-scroll,.mine-map-scroll,.side-area,.players,dialog';
const overlaySurfaces='#toast,.game-event-banner,.reaction-flight';
const frameNodes=roots=>roots.flatMap(root=>[root,...root.querySelectorAll('*')]);
const cssName=key=>key.replace(/[A-Z]/g,letter=>'-'+letter.toLowerCase());

// The browser paints the source scene. Share the DOM from each stable state
// across samples and keep the sampled animation properties and scroll offsets.
export function createFrameCapture(doc,dialog){
 const win=doc.defaultView,keysByEffect=new WeakMap();
 let revision,indices,scrollers,overlays;
 const observer=new MutationObserver(()=>{revision=null;});
 observer.observe(doc.body,{subtree:true,childList:true,attributes:true,characterData:true});
 return {
  capture(rect){
   if(observer.takeRecords().length)revision=null;
   if(!revision){
    const roots=[...doc.body.children].filter(node=>node.id==='app'||node.matches(overlaySurfaces)||node===dialog&&dialog.open);
    const elements=frameNodes(roots);
    indices=new Map(elements.map((element,index)=>[element,index]));
    scrollers=elements.filter(element=>element.matches(scrollSurfaces));
    overlays=elements.filter(element=>element.matches(overlaySurfaces));
    revision=roots.map(root=>root.cloneNode(true));
   }
   const properties=new Map(overlays.map(element=>[element,new Set(['opacity','transform'])]));
   for(const {effect} of doc.getAnimations()){
    const element=effect?.target;
    if(!indices.has(element))continue;
    if(!keysByEffect.has(effect)){
     const keys=effect.getKeyframes().flatMap(keyframe=>Object.keys(keyframe))
      .filter(key=>!['offset','computedOffset','easing','composite'].includes(key)).map(cssName);
     keysByEffect.set(effect,new Set(keys));
    }
    const keys=properties.get(element)??new Set();properties.set(element,keys);
    for(const key of keysByEffect.get(effect))keys.add(key);
   }
   const styles=[...properties].map(([element,keys])=>{
    const computed=win.getComputedStyle(element);
    return [indices.get(element),[...keys].map(key=>[key,computed.getPropertyValue(key)])];
   });
   const offsets=scrollers.map(element=>[indices.get(element),element.scrollLeft,element.scrollTop]);
   return {revision,styles,offsets,rect,width:win.innerWidth,height:win.innerHeight,
    scroll:[win.scrollX,win.scrollY],theme:doc.documentElement.dataset.theme};
  },
  stop(){observer.disconnect();}
 };
}

export function createFramePainter(doc){
 let revision,nodes,originals,overlay,styles=[];
 return frame=>{
  if(frame.revision!==revision){
   overlay?.close();
   revision=frame.revision;
   const copies=revision.map(root=>doc.importNode(root,true));
   originals=frameNodes(revision);nodes=frameNodes(copies);
   doc.body.replaceChildren(...copies);
   overlay=doc.querySelector('dialog[open]');
   if(overlay){overlay.inert=true;overlay.removeAttribute('open');overlay.showModal();}
  }else{
   for(const [index,values] of styles){
    const original=originals[index].style;
    for(const [key] of values)nodes[index].style.setProperty(key,original.getPropertyValue(key),original.getPropertyPriority(key));
   }
  }
  if(frame.theme)doc.documentElement.dataset.theme=frame.theme;
  else delete doc.documentElement.dataset.theme;
  styles=frame.styles;
  for(const [index,values] of styles)for(const [key,value] of values)nodes[index].style.setProperty(key,value,'important');
  doc.defaultView.scrollTo({left:frame.scroll[0],top:frame.scroll[1],behavior:'instant'});
  for(const [index,left,top] of frame.offsets){
   nodes[index].scrollLeft=left;nodes[index].scrollTop=top;
  }
 };
}

export function animationTiming(originalTimes,end,waits=[],ending){
 let before=0,at=0;
 const steps=originalTimes.map((original,index)=>{
  const originalWait=original-before,wait=waits[index]??originalWait;
  before=original;at+=wait;
  return {original,at,wait,originalWait};
 });
 const originalWait=Math.max(0,end-before),wait=ending??originalWait;
 const tail={original:Math.max(before,end),at:at+wait,wait,originalWait};
 return {steps,tail,changed:wait!==originalWait||steps.some(step=>step.wait!==step.originalWait)};
}

export function recordedTime({steps,tail},elapsed){
 let before={original:0,at:0},index=-1;
 for(const step of [...steps,tail]){
  if(elapsed<step.at){
   const fraction=(elapsed-before.at)/(step.at-before.at);
   return {at:before.original+fraction*(step.original-before.original),index};
  }
  before=step;index++;
 }
 return {at:tail.original,index:steps.length-1};
}

export function editedTime({steps,tail},original){
 let before={original:0,at:0};
 for(const step of [...steps,tail]){
  if(original<=step.original){
   if(step.original===before.original)return before.at;
   return before.at+(step.at-before.at)*(original-before.original)/(step.original-before.original);
  }
  before=step;
 }
 return tail.at;
}
