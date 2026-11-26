import {animationTiming,recordedTime,editedTime,createFrameCapture,createFramePainter} from './animation-playback.js';

const movingElements=[
 ['banner','Banner oben','body > .game-event-banner',true],
 ['mine-ready','Luftangriff freigeschaltet','.mine-controls.mine-new',true],
 ['airstrike-flight','Anflug','.airstrike-flight'],
 ['airstrike-impact','Einschlag und Druckwelle','.airstrike-drop, .mine-cell-effect:not(.ground-mine-effect) .mine-impact-wave'],
 ['mine-explosion','Bodenexplosion','.ground-flash, .ground-mine-effect .mine-impact-wave'],
 ['ship-hit','Trefferimpuls','.hit-effect'],
 ['ship-miss','Wasserimpuls','.water-effect'],
 ['ship-sinks','Versenkung','.sinking-hull'],
 ['mix-board','Farbwechsel auf dem Brett',null],
 ['roll','Würfelbewegung','.roll-animation .die'],
 ['discovery-cell','Fundort auf dem Brett','.discovery-badge.claimed-own'],
 ['reaction','Emoji-Reaktion','.reaction-flight',true],
];

const updates=[
 ['attack-panel','Luftangriff · Karte','.mine-controls .feature-status'],
 ['mine-panel','Versteckte Minen · Karte','#hidden-mine-panel summary'],
 ['treasure-panel','Schatzsuche · Karte','.bonus-panel .bonus-summary'],
 ['ship-panel','Schiffsboni · Schusskarte','#battle-map summary'],
 ['discovery-panel','Entdeckermodus · Karte','.discovery-panel .feature-status'],
 ['objectives','Öffentliche Aufträge · Karte','#objectives-panel summary'],
 ['mix-panel','Farbmischung · Karte','.mixing-panel .feature-note'],
 ['color-notice','Farbhinweis im Spielbereich','.color-notices'],
 ['aim','Zielauswahl geöffnet','#dialog[open][data-panel=mine-target] .modal-head h2'],
 ['result','Ergebnisdialog geöffnet','#dialog[open][data-panel=finished] .result-heading'],
];

const viewportAreas=[
 ['.game-chrome','Spielkopf'],
 ['.color-notices','Farbhinweis'],
 ['.game-features','Moduskarten'],
 ['#battle-map[open] .battle-scroll','Schusskarte'],
 ['#board-scroll','Spielfeld'],
 ['.dice-card','Würfelbereich'],
 ['.match-result','Endergebnis'],
];
const scrollers=['#board-scroll','#battle-map .battle-scroll','.mine-map-scroll'];
const visibleStates=new Set(['Im Bild','Teilweise im Bild']);
const timed=new Set(['toast','banner','airstrike-flight','airstrike-impact','mine-explosion','ship-hit','ship-miss','ship-sinks','reaction']);
const time=ms=>(ms/1000).toFixed(2).replace('.',',')+' s';
const shortText=element=>(element?.innerText??element?.textContent??'').trim().replace(/\s+/g,' ').slice(0,300);
const coordinate=index=>String.fromCharCode(65+index%15)+(Math.floor(index/15)+1);
const box=(left,top,right,bottom)=>({left,top,right,bottom});
const intersection=(a,b)=>box(Math.max(a.left,b.left),Math.max(a.top,b.top),Math.min(a.right,b.right),Math.min(a.bottom,b.bottom));
const area=r=>Math.max(0,r.right-r.left)*Math.max(0,r.bottom-r.top);
const located=(r,v)=>area(intersection(r,v))>0;
const round=Math.round;

function viewport(){
 const v=window.visualViewport, left=v?.offsetLeft??0,top=v?.offsetTop??0;
 return box(left,top,left+(v?.width??innerWidth),top+(v?.height??innerHeight));
}

function scrollPosition(){
 return [round(window.scrollX),round(window.scrollY),...scrollers.map(selector=>round(document.querySelector(selector)?.scrollLeft??0))];
}

function viewOf(doc,dialog,rect){
 const regions=dialog.open?[shortText(dialog.querySelector('h2'))||'Dialog']:
  viewportAreas.filter(([selector])=>[...doc.querySelectorAll(selector)].some(el=>located(el.getBoundingClientRect(),rect))).map(([,label])=>label);
 return {scroll:scrollPosition(),areas:[...new Set(regions)],pid:doc.querySelector('#app [data-player-board]')?.dataset.playerBoard,
  top:round(window.scrollY+rect.top),bottom:round(window.scrollY+rect.bottom)};
}

const boardName=pid=>pid===undefined?'':' '+(pid==='0'?'Eigenes Brett':'Computerbrett');
function viewLabel(view){
 return [boardName(view.pid).trim(),view.areas.join(' · ')||'Seitenrand','Y '+view.top+'–'+view.bottom+' px',
  ...view.scroll.slice(2).flatMap((value,i)=>value?[['Brett','Schusskarte','Zielkarte'][i]+' '+value+' px seitlich']:[])].filter(Boolean).join(' · ');
}

function visibility(element,rect,dialog,layers){
 if(!element?.isConnected)return {state:'Ausgeblendet'};
 const closed=element.closest('details:not([open])');
 if(closed&&!closed.querySelector(':scope > summary')?.contains(element))return {state:'Zugeklappt'};
 const style=getComputedStyle(element);
 if(style.display==='none'||style.visibility!=='visible'||Number(style.opacity)<.04)return {state:'Ausgeblendet'};
 const bounds=element.getBoundingClientRect();
 const full=area(bounds);
 if(!full)return {state:'Ausgeblendet'};
 let visible=intersection(bounds,rect);
 for(let parent=element.parentElement;parent;parent=parent.parentElement){
  if(parent.matches('.board-scroll,.battle-scroll,.mine-map-scroll,.side-area,dialog')){
   const clip=getComputedStyle(parent);
   if(/(auto|scroll|hidden|clip)/.test(clip.overflowX+' '+clip.overflowY))visible=intersection(visible,parent.getBoundingClientRect());
  }
 }
 if(!area(visible))return {state:'Außerhalb des Bilds'};
 if(dialog.open&&!dialog.contains(element))return {state:'Hinter dem Dialog'};
 for(const [overlay,label] of layers){
  if(overlay.contains(element)||element.contains(overlay)||dialog.contains(element))continue;
  // These fixed layers sit above board and card animations. Banners and toasts
  // themselves need their own stacking order.
  if(element.closest('.game-event-banner,.reaction-flight')||element.id==='toast'&&label!=='Banner')continue;
  const overlap=area(intersection(visible,overlay.getBoundingClientRect()));
  if(overlap>=area(visible)-1)return {state:'Verdeckt durch '+label};
  if(overlap>1)return {state:'Teilweise im Bild',bounds:visible};
 }
 return {state:area(visible)>=full-1?'Im Bild':'Teilweise im Bild',bounds:visible};
}

function layersOf(doc){
 const dice=doc.querySelector('.dice-card.choosing');
 const toast=doc.querySelector('#toast.visible');
 const banner=doc.querySelector('body > .game-event-banner');
 return [[dice&&getComputedStyle(dice).position==='fixed'?dice:null,'Würfelleiste'],
  [toast&&Number(getComputedStyle(toast).opacity)>.25?toast:null,'Toast'],[banner,'Banner']].filter(([element])=>element);
}

function scrollTarget(element){
 const cell=element.closest('[data-shot],[data-action="mine-target"],[data-player-board] [data-i]');
 if(cell){
  const id=Number(cell.dataset.shot??cell.dataset.i);
  if(Number.isInteger(id)&&id>=0&&id<105){
   const place=cell.matches('[data-shot]')?'Schusskarte':cell.matches('[data-action="mine-target"]')?'Zielauswahl':boardName(cell.closest('[data-player-board]')?.dataset.playerBoard).trim();
   return [place,coordinate(id)].filter(Boolean).join(' · ');
  }
 }
 return element.getAttribute('aria-label')||'Spielansicht';
}

function trackPosition(position){
 return [position[1]+' px',...position.slice(2).flatMap((value,i)=>value?[['Brett','Schusskarte','Zielkarte'][i]+' '+value+' px seitlich']:[])].join(' · ');
}

function movementLabel(entry){
 const {from,to,kind,target}=entry.scroll;
 const changed=from.some((n,i)=>Math.abs(n-to[i])>1);
 return [target,kind,changed?trackPosition(from)+' → '+trackPosition(to):'Position unverändert'].filter(Boolean).join(' · ');
}

function movementState({from,to}){
 const y=to[1]-from[1];
 if(Math.abs(y)>1)return Math.abs(y)+' px '+(y>0?'abwärts':'aufwärts');
 return from.some((n,i)=>Math.abs(n-to[i])>1)?'Seitlich gescrollt':'Position unverändert';
}

function statusOf(entry,visibleAt=entry.visibleAt){
 if(visibleAt!==null)return (entry.firstState==='Im Bild'?'Im Bild ab ':'Teilweise im Bild ab ')+time(visibleAt);
 return entry.reason||'';
}

const endingLabel='Zeit nach dem letzten Schritt';
const delaySelector='[data-review-wait],[data-review-tail]';
const delayStep=100;

export function createAnimationReview({frame,workspace,scene,version,gameDialog,replay,escape}){
 const doc=gameDialog.ownerDocument,toast=doc.querySelector('#toast');
 const host=workspace.ownerDocument;
 const hostWindow=host.defaultView;
 const results=workspace.querySelector('.animation-review-events');
 const context=workspace.querySelector('.animation-review-context');
 const timingTools=host.createElement('div');
 timingTools.className='animation-timing';timingTools.hidden=true;
 function delayField(label,kind,description=label){
  const name=escape(description);
  return `<fieldset class="review-delay"><legend>${label}</legend><div class="review-delay-controls">
   <button type="button" class="outline-btn" data-review-adjust="-${delayStep}" aria-label="${name} um ${delayStep} Millisekunden verkürzen">−${delayStep}</button>
   <span class="review-delay-value"><input type="number" min="0" step="1" inputmode="numeric" data-review-${kind} aria-label="${name} in Millisekunden"><span aria-hidden="true">ms</span></span>
   <button type="button" class="outline-btn" data-review-adjust="${delayStep}" aria-label="${name} um ${delayStep} Millisekunden verlängern">+${delayStep}</button>
  </div></fieldset>`;
 }
 timingTools.innerHTML='<div class="animation-review-actions">'+
  '<button type="button" class="primary" data-review-time-play>Mit Zeiten abspielen</button>'+
  '<button type="button" class="outline-btn" data-review-time-reset>Zeiten zurücksetzen</button></div>'+
  delayField(endingLabel,'tail')+
  '<p data-review-total></p>';
 context.after(timingTools);
 const timePlay=timingTools.querySelector('[data-review-time-play]');
 const timeReset=timingTools.querySelector('[data-review-time-reset]');
 const tailInput=timingTools.querySelector('[data-review-tail]');
 const tailField=tailInput.closest('fieldset');
 const timingTotal=timingTools.querySelector('[data-review-total]');
 const recordPlay=workspace.querySelector('[data-review-play]');
 const moment=workspace.querySelector('.animation-review-stage');
 const momentControls=workspace.querySelector('.animation-review-view');
 const caption=momentControls.querySelector('[data-review-caption]');
 let events=[],startedAt=0,start,settings,timer=0,recording=false,baseline,subjects,view,pendingScroll,lastToast,originalScroll,occurrences,inputs;
 let selectedRow=null, fit=null;
 let capture,samples=[],waits=[],ending,frameTick=0,playingTiming=false,activeRow;
 const now=()=>Math.max(0,Math.round(performance.now()-startedAt));
 const timing=()=>animationTiming(events.map(entry=>entry.at),samples.at(-1)?.at??0,waits,ending);
 const observeToast=new MutationObserver(changes=>{
  for(const change of changes){
   const text=[...change.addedNodes].map(node=>node.textContent).join('').trim();
   if(!text)continue;
   if(lastToast){
    lastToast.elements=[];
    lastToast.end='Vom nächsten Toast ersetzt';
    if(lastToast.visibleAt===null)lastToast.reason='Vor dem ersten sichtbaren Bild ersetzt';
   }
   lastToast=add('toast','Toast unten',text,[toast]);
  }
 });

 function add(id,title,detail='',elements=[]){
  const index=(occurrences.get(id)??0)+1;occurrences.set(id,index);
  const entry={id,reference:id+'-'+index,title,detail,elements,at:now(),visibleAt:null,reason:'',frame:null};
  events.push(entry);return entry;
 }

 function trackScroll(target,options){
  if(!target.closest('#app,#dialog'))return null;
  finishScroll();
  const rect=viewport();
  const current=viewOf(doc,gameDialog,rect);
  recordBoard(current);
  view=current;
  readSubjects();
  const entry=add('automatic-scroll','Automatisch scrollen','',[target]);
  entry.triggerView=current;
  entry.scroll={from:current.scroll,to:current.scroll,kind:options?.behavior==='smooth'?'Sanft':'Direkt',target:scrollTarget(target)};
  entry.reason=visibility(target,rect,gameDialog,layersOf(doc)).state;
  pendingScroll=entry;
  return entry;
 }

 function finishScroll(){
  if(!pendingScroll)return;
  const {from,to,resting}=pendingScroll.scroll;
  if(!resting&&from.some((value,i)=>value!==to[i]))pendingScroll.frame=null;
  pendingScroll=null;
 }

 function recordBoard(current){
  if(current.pid===view.pid)return;
  const target=doc.querySelector('#board-scroll');
  const entry=add('board','Brettwechsel',boardName(view.pid).trim()+' → '+boardName(current.pid).trim(),target?[target]:[]);
  entry.triggerView=current;
 }

 function readSubjects(){
  for(const [id,title,selector,readText] of movingElements){
   const elements=selector?[...doc.querySelectorAll(selector)]:scene.id==='mix'?[...new Set(doc.getAnimations()
    .map(animation=>animation.effect?.target).filter(target=>target?.matches?.('[data-player-board] [data-action="cell"]')))]:[];
   const old=subjects.get(id);subjects.set(id,elements[0]);
   if(elements.length&&elements[0]!==old)add(id,title,readText?shortText(elements[0]):'',elements);
  }
  for(const [id,title,selector] of updates){
   const elements=[...doc.querySelectorAll(selector)],first=elements[0],panel=first?.closest('details');
   const opened=panel?(panel.open?'Aufgeklappt':'Zugeklappt'):'';
   const previous=subjects.get(id);
   if(previous?.element===first&&previous?.opened===opened)continue;
   subjects.set(id,{element:first,opened});
   const text=shortText(first?.querySelector('.feature-meta')??first);
   const detail=[opened,text].filter(Boolean).join(' · ');
   if(baseline.get(id)!==detail){
    const hadContent=baseline.get(id);baseline.set(id,detail);
    if(first)add(id,title,detail,elements);
    else if(id==='aim'&&hadContent)add('aim-closed','Zielauswahl geschlossen');
   }
  }
 }

 function sample(final=false){
  if(!recording)return;
  const elapsed=now();
  const rect=viewport(),current=viewOf(doc,gameDialog,rect);
  const moved=view.scroll.some((value,i)=>Math.abs(value-current.scroll[i])>1);
  if(pendingScroll){
   const scroll=pendingScroll.scroll;
   if(scroll.kind==='Sanft'){
    if(scroll.to.some((value,i)=>value!==current.scroll[i])){
     scroll.to=current.scroll;scroll.lastMotion=elapsed;scroll.resting=false;
    }else if(!scroll.resting&&scroll.lastMotion!==undefined&&elapsed-scroll.lastMotion>=160){
     pendingScroll.frame=null;scroll.resting=true;
    }
   }
   if(final||scroll.kind==='Direkt')finishScroll();
  }else if(moved){
   const last=events.at(-1);
   const row=last?.id==='scroll-position'&&elapsed-last.at<250?last:add('scroll-position','Scrollposition geändert');
   row.scroll={from:row.scroll?.from??view.scroll,to:current.scroll,kind:'',target:''};
   row.frame=null;
  }
  recordBoard(current);
  view=current;
  readSubjects();
  const visual=capture.capture(rect);
  samples.push({at:elapsed,visual});
  const overlays=layersOf(doc);
  for(const entry of events){
   const timing=timed.has(entry.id);
   if(entry.frame&&entry.visibleAt!==null&&!timing)continue;
   const candidates=entry.elements.filter(element=>element.isConnected);
   const readings=candidates.map(element=>visibility(element,rect,gameDialog,overlays));
   const states=readings.map(reading=>reading.state);
   const state=states.find(value=>value==='Im Bild')??states.find(value=>visibleStates.has(value))??states.find(value=>value!=='Ausgeblendet')??states[0];
   const visible=visibleStates.has(state);
   if(timing){
    if(visible&&entry.lastVisible!==undefined&&entry.lastVisible===entry.lastSample){
     entry.visibleFor=(entry.visibleFor??0)+Math.min(100,elapsed-entry.lastVisible);
    }
    if(visible)entry.lastVisible=elapsed;
    entry.lastSample=elapsed;
   }
   let firstVisible=false;
   if(visible&&entry.visibleAt===null){
    entry.visibleAt=elapsed;entry.firstState=state;firstVisible=true;
   }else if(state&&entry.visibleAt===null&&(!entry.reason||state!=='Ausgeblendet')){
    entry.reason=state;
   }
   if(!entry.frame||firstVisible){
    entry.frame=visual;entry.view=current;entry.moment=elapsed;entry.triggerView??=current;
    entry.highlights=readings.flatMap(reading=>reading.bounds?[reading.bounds]:[]);
    if(entry.highlights.length&&(entry.id==='aim'||entry.id==='result')){
     entry.highlights=[intersection(gameDialog.getBoundingClientRect(),rect)];
    }
   }
  }
 }

 function begin(initial,prefs){
  startedAt=performance.now();recording=true;start=initial;settings=prefs;events=[];occurrences=new Map();
  samples=[];waits=[];ending=undefined;
  capture=createFrameCapture(doc,gameDialog);
  baseline=new Map(updates.map(([id,,selector])=>{
   const item=doc.querySelector(selector),panel=item?.closest('details');
   return [id,[panel?(panel.open?'Aufgeklappt':'Zugeklappt'):'',shortText(item?.querySelector('.feature-meta')??item)].filter(Boolean).join(' · ')];
  }));
  subjects=new Map();view=viewOf(doc,gameDialog,viewport());pendingScroll=null;lastToast=null;
  add('start','Startansicht');
  observeToast.observe(toast,{childList:true});
  inputs=new AbortController();
  for(const type of ['wheel','touchmove'])doc.addEventListener(type,finishScroll,{capture:true,passive:true,signal:inputs.signal});
  doc.addEventListener('keydown',event=>{
   if(['ArrowDown','ArrowUp','ArrowLeft','ArrowRight','PageDown','PageUp','Home','End',' '].includes(event.key))finishScroll();
  },{capture:true,signal:inputs.signal});
  const prototype=doc.defaultView.Element.prototype;
  originalScroll=prototype.scrollIntoView;
  // Element prototypes are per frame. Only this debug frame and this run are observed.
  prototype.scrollIntoView=function(...args){
   const entry=recording?trackScroll(this,args[0]):null;
   const result=originalScroll.apply(this,args);
   if(entry?.scroll.kind==='Direkt')entry.scroll.to=scrollPosition();
   return result;
  };
  sample();
  timer=setInterval(sample,32);
 }

 function end(){
  if(!recording)return;
  try{sample(true);}finally{
   recording=false;clearInterval(timer);observeToast.disconnect();capture.stop();
   inputs?.abort();
   doc.defaultView.Element.prototype.scrollIntoView=originalScroll;
   for(const entry of events)entry.elements.length=0;
   renderTimeline();
  }
 }

 function rowHTML(entry,i){
  const detail=entry.scroll?movementLabel(entry):entry.detail;
  const status=entry.scroll?movementState(entry.scroll):statusOf(entry);
  const before=viewLabel(entry.triggerView),after=viewLabel(entry.view);
  const duration=entry.visibleFor?'Rund '+time(entry.visibleFor)+' im Bild':'';
  return '<details name="animation-review-event" data-entry="'+i+'"><summary><time data-review-at>'+time(entry.at)+'</time><strong>'+escape(entry.title)+'</strong>'+
   (status?'<span class="review-state" data-review-status>'+escape(status)+'</span>':'')+'</summary><div class="animation-review-detail">'+
   delayField(i?'Abstand zum vorherigen Schritt':'Zeit bis zum ersten Schritt','wait','Zeit vor '+entry.title)+
   '<p data-review-original hidden>Aufnahme · '+time(entry.at)+'</p>'+
   (detail?'<p>'+escape(detail)+'</p>':'')+(entry.scroll&&statusOf(entry)?'<p data-review-scroll-status>Ziel · '+escape(statusOf(entry))+'</p>':'')+(before!==after?'<p>Beim Auslösen · '+escape(before)+'</p>':'')+'<p>'+escape(after)+'</p>'+
   (duration?'<p>'+duration+'</p>':'')+
   (entry.end?'<p>'+escape(entry.end)+'</p>':'')+
   '<div class="animation-review-actions"><button type="button" class="outline-btn" data-review="replay">Bis hier abspielen</button><button type="button" class="outline-btn" data-review="copy">Feedback kopieren</button></div>'+
   '<p role="status" class="review-copy-status"></p></div></details>';
 }

 function renderTimeline(){
  const commands=events.filter(entry=>entry.id==='automatic-scroll').length;
  context.textContent=settings.width+' × '+settings.height+' px · '+(settings.reduced?'Reduzierte Bewegung · ':'')+
   (commands?commands+' automatische '+(commands===1?'Scrollaktion':'Scrollaktionen'):'Kein automatischer Scrollbefehl');
  results.innerHTML=events.map(rowHTML).join('');
  results.parentElement.scrollTop=0;
  timingTools.hidden=false;
  updateTiming(true);
 }

 function updateTiming(fields=false){
  const plan=timing();
  for(const [index,step] of plan.steps.entries()){
   const row=results.children[index],entry=events[index];
   row.querySelector('[data-review-at]').textContent=time(step.at);
   row.querySelector('[data-review-original]').hidden=step.at===step.original;
   if(entry.visibleAt!==null){
    const visible=plan.changed?editedTime(plan,entry.visibleAt):entry.visibleAt;
    const status=row.querySelector(entry.scroll?'[data-review-scroll-status]':'[data-review-status]');
    status.textContent=(entry.scroll?'Ziel · ':'')+statusOf(entry,visible);
   }
   if(fields)row.querySelector('[data-review-wait]').value=step.wait;
  }
  if(selectedRow&&!moment.hidden)caption.textContent='Standbild · '+time(editedTime(plan,events[Number(selectedRow.dataset.entry)].moment));
  if(fields)tailInput.value=plan.tail.wait;
  timingTotal.textContent='Gesamtdauer '+time(plan.tail.at);
  timeReset.disabled=!plan.changed;
 }

 function mountStage(first,title,ready,failed){
  if(!moment.isConnected)return;
  hideMoment();
  const iframe=host.createElement('iframe');
  iframe.title=title;iframe.tabIndex=-1;iframe.setAttribute('aria-hidden','true');
  const aperture=host.createElement('div');
  moment.append(aperture);aperture.append(iframe);
  let current=first;
  const layout=()=>{
   const {left,top,right,bottom}=current.rect,width=right-left,height=bottom-top;
   const scale=Math.min(1,moment.clientWidth/width,moment.clientHeight/height);
   aperture.style.width=width*scale+'px';aperture.style.height=height*scale+'px';
   iframe.style.transform='scale('+scale+')';iframe.style.left=-left*scale+'px';iframe.style.top=-top*scale+'px';
  };
  const shot=iframe.contentDocument;
  shot.documentElement.lang='de';
  shot.body.dataset.animationStill='';
  const draw=createFramePainter(shot);
  const paint=next=>{
   if(iframe.width!==String(next.width))iframe.width=next.width;
   if(iframe.height!==String(next.height))iframe.height=next.height;
   const resized=Object.keys(next.rect).some(key=>next.rect[key]!==current.rect[key]);
   current=next;if(resized)layout();
   draw(next);
  };
  const stylesheet=shot.createElement('link');stylesheet.rel='stylesheet';stylesheet.href=new URL('./style.css',import.meta.url).href;
  stylesheet.addEventListener('load',()=>{
   if(!iframe.isConnected)return;
   moment.hidden=false;frame.inert=true;momentControls.hidden=false;
   fit=new ResizeObserver(layout);fit.observe(moment);layout();
   paint(first);ready(paint,aperture);
  },{once:true});
  stylesheet.addEventListener('error',()=>{
   if(!iframe.isConnected)return;
   hideMoment();failed?.();context.textContent='Die Spielansicht konnte nicht angezeigt werden.';
  },{once:true});
  shot.head.append(stylesheet);
 }

 function showMoment(entry){
  const still=entry.frame;if(!still)return;
  mountStage(still,'Standbild der Spielansicht',(_paint,aperture)=>{
   caption.textContent='Standbild · '+time(editedTime(timing(),entry.moment));
   const {left,top,right,bottom}=still.rect,width=right-left,height=bottom-top;
   const unique=new Set();
   for(const mark of entry.highlights){
    const key=[mark.left,mark.top,mark.right,mark.bottom].map(round).join(',');
    if(unique.has(key))continue;
    unique.add(key);
    const outline=host.createElement('span');
    outline.className='animation-review-highlight';outline.setAttribute('aria-hidden','true');
    outline.style.left=(mark.left-left)/width*100+'%';outline.style.top=(mark.top-top)/height*100+'%';
    outline.style.width=(mark.right-mark.left)/width*100+'%';outline.style.height=(mark.bottom-mark.top)/height*100+'%';
    aperture.append(outline);
   }
  });
 }

 function finishTiming(keepStage=false){
  if(!playingTiming)return;
  playingTiming=false;hostWindow.cancelAnimationFrame(frameTick);
  recordPlay.disabled=false;results.inert=false;tailField.disabled=false;
  timePlay.textContent='Mit Zeiten abspielen';timeReset.disabled=!timing().changed;
  activeRow?.classList.remove('timing-current');activeRow=null;
  if(!keepStage)hideMoment();
 }

 function playTiming(index=null){
  if(playingTiming){finishTiming();return;}
  if(!samples.length||recordPlay.disabled)return;
  const plan=timing(),end=index===null?plan.tail.at:plan.steps[index].at;
  if(index===null&&selectedRow){selectedRow.open=false;selectedRow=null;}
  playingTiming=true;recordPlay.disabled=true;results.inert=true;tailField.disabled=true;timeReset.disabled=true;
  timePlay.textContent='Stopp';
  caption.textContent='Testlauf startet …';
  mountStage(samples[0].visual,'Spielansicht im Testlauf',paint=>{
   const started=hostWindow.performance.now();
   let cursor=0;
   const tick=stamp=>{
    const elapsed=Math.min(end,Math.max(0,stamp-started)),reading=recordedTime(plan,elapsed);
    let next=cursor;
    while(samples[next+1]?.at<=reading.at)next++;
    if(next!==cursor){cursor=next;paint(samples[cursor].visual);}
    const row=results.children[reading.index];
    if(activeRow!==row){
     activeRow?.classList.remove('timing-current');activeRow=row;row?.classList.add('timing-current');
     caption.textContent='Testlauf · '+time(elapsed)+(row?' · '+events[reading.index].title:'');
    }
    if(elapsed<end){frameTick=hostWindow.requestAnimationFrame(tick);return;}
    finishTiming(true);
    if(index===null)caption.textContent='Testlauf beendet · '+time(end);
    else showMoment(events[index]);
   };
   frameTick=hostWindow.requestAnimationFrame(tick);
  },()=>finishTiming());
 }

 function hideMoment(){
  fit?.disconnect();fit=null;
  moment.replaceChildren();moment.hidden=true;momentControls.hidden=true;frame.inert=false;
 }

 function showGame(){
  finishTiming();
  const summary=selectedRow?.querySelector('summary');
  if(selectedRow)selectedRow.open=false;
  selectedRow=null;
  hideMoment();
  summary?.focus({preventScroll:true});
 }

 async function copy(entry,button){
  const scroll=entry.scroll?movementLabel(entry):'';
  const plan=timing();
  const edits=plan.changed?['Testlauf · Abstände in ms',
   ...plan.steps.map((step,index)=>events[index].title+' · '+step.wait+' ms → '+time(step.at)),
   endingLabel+' · '+plan.tail.wait+' ms · Gesamtdauer '+time(plan.tail.at)]:[];
  const report=['Farbfeld '+version+' · '+scene.label,
   entry.title+' · '+entry.reference+' · '+time(entry.at),
   settings.width+' × '+settings.height+' px · '+settings.theme+' · '+(settings.reduced?'Reduzierte Bewegung':'Normale Bewegung'),
   'Startansicht · '+viewLabel(events[0].view),'Beim Auslösen · '+viewLabel(entry.triggerView),'Ansicht am Moment · '+viewLabel(entry.view),
   entry.detail,scroll,statusOf(entry),entry.visibleFor?'Rund '+time(entry.visibleFor)+' im Bild':'',entry.end,...edits,'Änderungswunsch'].filter(Boolean).join('\n');
  const feedback=button.closest('.animation-review-detail').querySelector('.review-copy-status');
  try{
   await navigator.clipboard.writeText(report);feedback.textContent='Kopiert';
  }catch{
   const field=host.createElement('textarea');field.readOnly=true;field.setAttribute('aria-label','Feedback zum Kopieren');field.value=report;
   feedback.replaceChildren(field);field.focus();field.select();
  }
 }

 const delayValue=input=>Number.isSafeInteger(input.valueAsNumber)&&input.valueAsNumber>=0?input.valueAsNumber:undefined;
 function setDelay(input){
  const value=delayValue(input);
  if(value===undefined)return;
  if(input===tailInput)ending=value;
  else waits[Number(input.closest('[data-entry]').dataset.entry)]=value;
  updateTiming();
 }
 workspace.addEventListener('input',event=>{
  if(event.target.matches(delaySelector))setDelay(event.target);
 });
 workspace.addEventListener('change',event=>{
  const input=event.target;
  if(input.matches(delaySelector)&&delayValue(input)===undefined)updateTiming(true);
 });
 workspace.addEventListener('click',event=>{
  const button=event.target.closest('[data-review-adjust]');
  if(!button||playingTiming)return;
  const input=button.closest('.review-delay').querySelector(delaySelector);
  const next=Math.max(0,delayValue(input)+Number(button.dataset.reviewAdjust));
  if(!Number.isSafeInteger(next))return;
  input.value=next;
  setDelay(input);
 });
 timePlay.addEventListener('click',()=>playTiming());
 timeReset.addEventListener('click',()=>{waits=[];ending=undefined;updateTiming(true);});

 results.addEventListener('toggle',event=>{
  const row=event.target;if(!row.matches('details[data-entry]')||results.inert)return;
  if(row.open){
   if(selectedRow&&selectedRow!==row)selectedRow.open=false;
   selectedRow=row;
   showMoment(events[Number(row.dataset.entry)]);
  }else if(row===selectedRow){selectedRow=null;hideMoment();}
 },true);
 results.addEventListener('click',event=>{
  const button=event.target.closest('[data-review]');if(!button)return;
  const index=Number(button.closest('[data-entry]').dataset.entry),entry=events[index];
  if(button.dataset.review==='copy')copy(entry,button);
  if(button.dataset.review==='replay'){
   if(timing().changed)playTiming(index);
   else replay(start,entry);
  }
 });
 momentControls.querySelector('[data-review-live]').addEventListener('click',showGame);
 workspace.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&(!moment.hidden||playingTiming)){event.preventDefault();showGame();}
 });
 window.addEventListener('pagehide',()=>{
  hostWindow.cancelAnimationFrame(frameTick);fit?.disconnect();capture?.stop();
 },{once:true});

 return {
  begin,end,showMoment,
  startPlayback(repeating){
   hideMoment();results.inert=true;timingTools.inert=true;
   if(!repeating){selectedRow=null;results.replaceChildren();timingTools.hidden=true;context.textContent='Die Szene wird aufgezeichnet …';}
  },
  finishPlayback(){results.inert=false;timingTools.inert=false;},
  mark(id,title){if(recording)add(id,title);}
 };
}
