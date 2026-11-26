import {boardFor} from './boards.js';
import {resultComparison,colorCompletionText} from './game-info.js';
import {ABILITIES,OBJECTIVE_POOL,abilityCharges,variantsEnabled,hiddenMinesEnabled,objectiveProgress,shipPoints,objectivePoints} from './variants.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const COLS='ABCDEFGHIJKLMNO',LABELS={g:'Grün',y:'Gelb',b:'Blau',p:'Pink',o:'Orange'};
const coord=i=>COLS[i%15]+(Math.floor(i/15)+1),hidden=g=>!!g.hiddenScores&&g.status!=='finished';
const missMark='<svg class="battle-miss-mark" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="4"/></svg>';
const shipHitMark='<svg class="ship-hit-mark" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="m8 8 8 8m0-8-8 8"/></svg>';
const optionPaths={
 columns:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 3v18m6-18v18M4 9h16M4 15h16"/>',
 colors:'<circle cx="8" cy="8" r="4"/><circle cx="16" cy="8" r="4"/><circle cx="8" cy="16" r="4"/><circle cx="16" cy="16" r="4"/>',
 jokers:'<circle cx="12" cy="12" r="9"/><path d="M12 6v7m0 4h.01"/>',
 stars:'<path d="m12 2 3 6.5 7 .8-5.2 4.8 1.5 7-6.3-3.5L5.7 21l1.5-6.9L2 9.3l7-.8L12 2Z"/>',
 result:'<path d="M7 3h10v6a5 5 0 0 1-10 0V3Zm0 2H3v2a5 5 0 0 0 5 5m9-7h4v2a5 5 0 0 1-5 5M12 14v5m-5 2h10M9 19h6"/>',
 hidden:'<path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.5 5.4A11 11 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.4 4.1M6.1 6.1A20 20 0 0 0 2 12s4 7 10 7a12 12 0 0 0 5-1.2"/>',
 mines:'<path d="M12 3c-1 0-1.5 1.2-1.5 2.5V9L3 14v2l7.5-2v4L8 20v1l4-1 4 1v-1l-2.5-2v-4L21 16v-2l-7.5-5V5.5C13.5 4.2 13 3 12 3Z"/>',
 hiddenMines:'<circle cx="12" cy="13" r="6"/><path d="M12 3v4M3 13h3m12 0h3M5.6 6.6l2.2 2.2m8.4 8.4 2.2 2.2M18.4 6.6l-2.2 2.2m-8.4 8.4-2.2 2.2M12 19v3"/><circle cx="10" cy="11" r="1"/>',
 bonus:'<path d="M4 11v10h16V11M3 7h18v4H3zM12 7v14M12 7C5 7 5 1 8 2c3 0 4 5 4 5Zm0 0c7 0 7-6 4-5-3 0-4 5-4 5Z"/>',
 battleship:'<circle cx="12" cy="4" r="2"/><path d="M12 6v16M8 10h8M4 13v1a8 8 0 0 0 16 0v-1M4 13l3 3m13-3-3 3"/>',
 discovery:'<circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6 6-2Z"/><path d="m10 10 4 4"/>',
 objectives:'<path d="M5 22V3m0 1c5-4 9 4 14 0v11c-5 4-9-4-14 0"/>',
 shuffle:'<path d="M3 6h3c5 0 7 12 12 12h3m-4-4 4 4-4 4M3 18h3c2 0 4-3 6-6s4-6 6-6h3m-4-4 4 4-4 4"/>',
};
export const setupOptionIcon=type=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+(optionPaths[type]||optionPaths.discovery)+'</svg>';
export const GAME_BANNER_MS=6000;
export function colorCompletionBanner(events){
 if(!events.length)return null;
 if(events.length===1){
  const [event]=events;
  return {type:'colors',color:event.color,title:colorCompletionText(event,{withPoints:false}),detail:event.points===undefined?'':'+'+event.points+' Punkte'};
 }
 const colors=[...new Set(events.map(event=>event.color))];
 return {type:'colors',color:colors.length===1?colors[0]:null,title:events.length+' Farbabschlüsse',detail:colors.map(color=>LABELS[color]).join(' · ')};
}
export function playGameBanner(messages,{host,environment=globalThis}={}){
 const doc=environment.document;
 if(!doc||!messages.length)return;
 const container=host??doc.body;
 container.querySelector?.(':scope > .game-event-banner')?.remove();
 const banner=doc.createElement('div');
 banner.className='game-event-banner';
 banner.setAttribute('role','status');
 banner.setAttribute('aria-live','polite');
 banner.setAttribute('style','--game-banner-duration:'+GAME_BANNER_MS+'ms');
 banner.innerHTML=messages.map(({type,title,detail,color})=>{
  const icon=type==='colors'&&Object.hasOwn(LABELS,color)?`<span class="color-dot game-event-color" data-color="${color}" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg></span>`:setupOptionIcon(type);
  return `<div class="game-event-message" data-kind="${esc(type)}">${icon}<span><strong>${esc(title)}</strong>${detail?`<small>${esc(detail)}</small>`:''}</span></div>`;
 }).join('');
 container.append(banner);
 const timer=(environment.setTimeout?.bind(environment)??setTimeout)(()=>banner.remove(),GAME_BANNER_MS);
 return ()=>{(environment.clearTimeout?.bind(environment)??clearTimeout)(timer);banner.remove();};
}
// Keep one native checkbox and one complete label. The visible indicator is
// decorative, so pointer, keyboard and screen-reader behavior remain native.
export function setupOptionHTML({id,type,title,description,checked=false,disabled=false,className=''}){
 return '<label class="setup-option '+esc(className)+'"><input type="checkbox" id="'+esc(id)+'" aria-labelledby="'+esc(id)+'-label" aria-describedby="'+esc(id)+'-description"'+(checked?' checked':'')+(disabled?' disabled':'')+'><span class="setup-icon" aria-hidden="true">'+setupOptionIcon(type)+'</span><span class="setup-copy"><strong id="'+esc(id)+'-label">'+esc(title)+'</strong><small id="'+esc(id)+'-description">'+esc(description)+'</small></span><span class="setup-check" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="m3 8 3 3 7-7"/></svg></span></label>';
}
const rules=[
 ['battleship','Schiffsboni','Genau zwei Personen, fünf Schiffe. Kleine Schiffe bringen mehr Punkte – nur vollständig versenkt.'],
 ['hiddenMines','Versteckte Minen','Vor dem ersten Wurf auslegen. Je zwei Minen bei 2–3 Personen, je eine bei 4–6. Nur Gegner lösen sie aus.'],
 ['discovery','Entdeckermodus','Sechs sichtbare Fundorte. Wer zuerst bestätigt, erhält die Fähigkeit.'],
 ['objectives','Öffentliche Aufträge','Drei zufällige Ziele aus '+OBJECTIVE_POOL.length+' · Spalten, Sterne und eine Farbe. Für alle gleich.'],
 ['shuffle','Farben neu mischen','Alle fünf Runden freie Farben mischen – zusammenhängende Gruppen bleiben erhalten.'],
];
export function variantSetupHTML(g,{players=2}={}){return '<fieldset class="variant-picker"><legend>Varianten</legend><p class="caption">Einzeln oder kombiniert ausprobieren.</p>'+rules.map(([id,title,description])=>setupOptionHTML({id:'variant-'+id,type:id,title,description,checked:(id!=='battleship'||players===2)&&variantsEnabled(g)&&!!g.variants[id==='shuffle'?'mixing':id],disabled:id==='battleship'&&players!==2,className:'variant-option'})).join('')+'</fieldset>';}
export const readVariantOptions=doc=>Object.fromEntries(rules.map(([id])=>{const option=doc.querySelector('#variant-'+id);return [id,option?.checked===true&&!option.disabled];}));
export function variantLobbyHTML(options={}, {host=false,enabled=true,supported=false,hiddenMinesSupported=false,players=2,missing=[],missingHiddenMines=[],context='room',paired=true}={}){
 return '<fieldset class="variant-lobby"><legend>Varianten</legend>'+(!paired?'<p class="caption">Zuerst alle Handys koppeln, dann Varianten wählen.</p>':!supported?'<p class="caption">'+(missing.length?esc(missing.join(', '))+' · ':'')+'Bitte Farbfeld 1.21.0 oder neuer öffnen und den Raum erneut aufrufen.</p>':'')+rules.map(([key,title,description])=>{
  const on=options[key]===true,available=enabled&&paired&&(on||supported&&(key!=='hiddenMines'||hiddenMinesSupported)&&(key!=='battleship'||players===2));
  const update=key==='hiddenMines'&&paired&&!hiddenMinesSupported?'<p class="caption">'+(missingHiddenMines.length?esc(missingHiddenMines.join(', '))+' · ':'')+'Versteckte Minen benötigen Farbfeld 1.25.0 auf allen Handys.</p>':'';
  return '<section class="hidden-option variant-lobby-option"><span class="setup-icon" aria-hidden="true">'+setupOptionIcon(key)+'</span><div class="setup-copy"><strong>'+title+' · '+(on?'aktiviert':'ausgeschaltet')+'</strong><p>'+description+'</p>'+update+'</div>'+(host?'<button class="toggle '+(on?'on':'')+'" role="switch" aria-label="'+title+'" aria-checked="'+on+'" data-action="'+context+'-variant" data-variant="'+key+'"'+(available?'':' disabled')+'></button>':'')+'</section>';
 }).join('')+'</fieldset>';
}
export function shipSVG(size=3,vertical=false){const hull='<path d="M4 19 15 29h88l13-10H4Z" fill="currentColor"/><path d="M25 18V9h'+Math.max(14,size*11)+'v9M64 18V5h13v13M72 5V1h3v4" fill="currentColor"/><path d="M12 31h96" stroke="currentColor" stroke-width="2"/>';return '<svg class="ship-silhouette'+(vertical?' vertical':'')+'" viewBox="'+(vertical?'0 0 32 120':'0 0 120 32')+'" aria-hidden="true">'+(vertical?'<g transform="translate(32 0) rotate(90)">'+hull+'</g>':hull)+'</svg>';}
// Fleet and mine preparation share the same map, toolbar and confirmation layout.
export function placementGridHTML(layout,label,cellHTML){
 return '<div class="placement-map mine-target-map"><div class="mine-map-heading"><strong>'+esc(label)+'</strong><span>Spalte A–O · Zeile 1–7</span></div><div class="placement-map-tools" role="group" aria-label="Aufstellraster vergrößern oder einpassen"><button class="outline-btn" data-action="placement-zoom-out" aria-label="Aufstellraster verkleinern">−</button><output data-placement-zoom aria-label="Aufstellraster-Zoom">100%</output><button class="outline-btn" data-action="placement-zoom-in" aria-label="Aufstellraster vergrößern">+</button><button class="outline-btn" data-action="placement-fit" aria-label="Ganzes Aufstellraster einpassen">↔ Einpassen</button></div><div class="placement-scroll mine-map-scroll" tabindex="0" aria-label="Aufstellraster verschieben, mit zwei Fingern zoomen"><div class="placement-grid mine-grid" role="group" aria-label="'+esc(label)+'"><span aria-hidden="true"></span>'+[...COLS].map(c=>'<span class="mine-col-label" aria-hidden="true">'+c+'</span>').join('')+layout.cells.map((color,i)=>(i%15===0?'<span class="mine-row-label" aria-hidden="true">'+(Math.floor(i/15)+1)+'</span>':'')+cellHTML(color,i)).join('')+'</div></div><p class="placement-map-hint">Zwei Finger zum Zoomen · Einpassen zeigt alle Felder.</p></div>';
}
function preparationNavigation(headerAction){
 const back='<button class="text-btn" data-action="home">← Zur Startseite</button>';
 return headerAction?'<div class="placement-nav">'+back+headerAction+'</div>':back;
}
export function placementSetupHTML({kind,eyebrow,title,intro,legend,choices,grid,controls,rule,confirm,available=true,notice='',headerAction=''}){
 return '<section class="'+kind+'-setup placement-setup">'+preparationNavigation(headerAction)+'<span class="eyebrow">'+esc(eyebrow)+' · VORBEREITUNG</span><h1>'+esc(title)+'</h1><p class="placement-intro">'+esc(intro)+'</p><fieldset class="placement-editor fleet-editor"'+(available?'':' disabled')+'><legend class="visually-hidden">'+esc(legend)+'</legend>'+choices+'<div class="placement-layout">'+grid+'<div class="placement-settings">'+controls+'</div></div><p class="placement-rule">'+esc(rule)+'</p>'+confirm+'</fieldset>'+notice+'<button class="text-btn" data-action="abort-game">Partie verlassen</button></section>';
}
export function preparationWaitingHTML(g,own=0,headerAction=''){
 const v=g.variants,waiting=g.players.filter((p,i)=>i!==own&&!p.left&&(v.battleship&&!v.battleship.ready[i]||v.hiddenMines&&!v.hiddenMines.ready[i])).map(p=>p.name);
 return '<section class="fleet-setup fleet-waiting">'+preparationNavigation(headerAction)+'<h1>Deine Vorbereitung ist fertig.</h1><p>'+esc(waiting.join(', '))+(waiting.length===1?' bereitet noch vor.':' bereiten noch vor.')+' Sobald alle fertig sind, beginnt der erste Wurf.</p><button class="outline-btn" data-action="abort-game">Partie verlassen</button></section>';
}
export function fleetSetupHTML(g,{selected=4,vertical=false,own=0,available=true,headerAction=''}={}){
 const b=g.variants.battleship;
 if(b.ready[own])return preparationWaitingHTML(g,own,headerAction);
 const layout=boardFor(g,own),fleet=b.fleets[own],ship=fleet[selected];
 const choices='<div class="placement-choices fleet-choices" style="--placement-count:5" role="group" aria-label="Schiff wählen">'+fleet.map((cells,i)=>'<button data-action="fleet-ship" data-i="'+i+'" class="outline-btn placement-choice'+(selected===i?' chosen':'')+'" aria-pressed="'+(selected===i)+'">'+shipSVG(i+1)+'<strong>'+(i+1)+' '+(i?'Felder':'Feld')+'</strong><small>+'+(5-i)+' P · '+coord(cells[0])+'</small></button>').join('')+'</div>';
 const grid=placementGridHTML(layout,'Deine Flotte · '+g.players[own].name,(color,i)=>{const n=fleet.findIndex(a=>a.includes(i));return '<button data-action="fleet-place" data-i="'+i+'" style="--cell:var(--'+color+')" class="mine-cell'+(n>=0?' fleet-occupied':'')+(n===selected?' mine-selected':'')+'" aria-pressed="'+(n===selected)+'" aria-label="'+coord(i)+', '+LABELS[color]+(n>=0?', Schiff mit '+(n+1)+' '+(n===0?'Feld':'Feldern'):'')+'">'+(n>=0?n+1:layout.stars.includes(i)?'☆':'')+'</button>';});
 const controls='<button class="outline-btn placement-rotate" data-action="fleet-rotate">↶ '+(vertical?'Senkrecht':'Waagrecht')+'</button><div class="placement-coordinates mine-coordinates"><label for="fleet-column">Spalte<select class="outline-btn" id="fleet-column">'+[...COLS].map((c,i)=>'<option value="'+i+'"'+(ship[0]%15===i?' selected':'')+'>'+c+'</option>').join('')+'</select></label><label for="fleet-row">Zeile<select class="outline-btn" id="fleet-row">'+Array.from({length:7},(_,r)=>'<option value="'+r+'"'+(Math.floor(ship[0]/15)===r?' selected':'')+'>'+(r+1)+'</option>').join('')+'</select></label></div><button class="outline-btn placement-position" data-action="fleet-place-position">Schiff '+(selected+1)+' hier platzieren</button><button class="outline-btn placement-random" data-action="fleet-random">↻ Zufällig verteilen</button>';
 const withMines=hiddenMinesEnabled(g);
 return placementSetupHTML({kind:'fleet',eyebrow:'SCHIFFSBONI'+(withMines?' · SCHRITT 1 VON 2':''),title:'Deine Flotte auslegen.',intro:'Wähle ein Schiff und tippe auf seinen Anfang. Die Schiffe dürfen sich berühren.',legend:'Eigene Flotte aufstellen',choices,grid,controls,rule:'Fünf Schiffe mit 1 bis 5 Feldern. Deine Flotte bleibt '+g.players[1-own].name+' verborgen.',confirm:'<button class="primary placement-confirm" data-action="fleet-ready">'+setupOptionIcon('battleship')+(withMines?'Flotte bestätigen und Minen auslegen':'Flotte bestätigen')+'</button>',available,headerAction,notice:!available?'<p class="caption">'+(g.mode==='direct'?'Wieder verbinden, um weiter aufzustellen.':'Aktion wird gespeichert …')+'</p>':''});
}
function ownShip(g,pid,i,own){if(!variantsEnabled(g)||!g.variants.battleship||pid!==own&&g.status!=='finished')return -1;return g.variants.battleship.fleets[pid]?.findIndex(s=>s.includes(i))??-1;}
export function cellVariantLabel(g,pid,i,own=0){
 if(!variantsEnabled(g))return '';let text='',ship=ownShip(g,pid,i,own);
 if(ship>=0)text+=', eigenes Schiff '+(ship+1)+' '+(ship===0?'Feld':'Felder')+(!hidden(g)&&g.variants.battleship.shots[1-pid][i]===2?', getroffen':'');
 if(pid===own&&hiddenMinesEnabled(g)&&g.variants.hiddenMines.positions[own].some((at,k)=>at===i&&!g.variants.hiddenMines.triggered[own][k]))text+=', eigene versteckte Mine, für dich ungefährlich';
 const f=g.variants.discovery?.fields.find(f=>f.index===i);if(f)text+=', '+ABILITIES.find(a=>a.id===f.type).name+(f.owner===null?', noch sammelbar':', bereits gefunden von '+g.players[f.owner].name);return text;
}
export function cellVariantHTML(g,pid,i,own=0){
 if(!variantsEnabled(g))return '';let html='',ship=ownShip(g,pid,i,own);
 if(ship>=0){const hit=!hidden(g)&&g.variants.battleship.shots[1-pid][i]===2;html+='<span class="own-ship '+(hit?'ship-hit':'')+'" aria-hidden="true">'+(hit?shipHitMark:'')+'</span>';}
 if(pid===own&&hiddenMinesEnabled(g)&&g.variants.hiddenMines.positions[own].some((at,k)=>at===i&&!g.variants.hiddenMines.triggered[own][k]))html+='<span class="own-mine-badge" aria-hidden="true">'+setupOptionIcon('hiddenMines')+'</span>';
 const f=g.variants.discovery?.fields.find(f=>f.index===i);if(f)html+='<span class="discovery-badge '+(f.owner===null?'unclaimed':f.owner===pid?'claimed-own':'claimed-other')+'" aria-hidden="true">'+(f.owner===null?ABILITIES.find(a=>a.id===f.type).symbol:f.owner===pid?'✓':'⊘')+'</span>';return html;
}
const featureChevron='<svg class="feature-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
export function featureHeading(type,title,detail,{reward=null,fold=false,extra=''}={}){
 const progress=detail||extra?'<span class="feature-meta">'+(detail?'<span class="feature-status">'+esc(detail)+'</span>':'')+extra+'</span>':'';
 const helpAction=type==='mines'?'mine-help':type==='bonus'?'bonus-help':fold?'variant-help':null;
 return '<span class="status-icon '+(type==='mines'?'mine-feature-icon':'')+'" aria-hidden="true">'+setupOptionIcon(type)+'</span><span class="feature-copy"><strong>'+esc(title)+'</strong></span>'+(reward===null?'':'<b class="feature-reward '+(String(reward).startsWith('−')?'feature-deduction':'')+'" aria-label="'+esc(title+': '+reward+' Punkte')+'">'+esc(reward)+'<span class="feature-point-unit">P</span></b>')+(helpAction?'<button class="feature-help" data-action="'+helpAction+'" data-help="'+esc(type)+'" aria-label="'+esc(title+'-Regeln anzeigen')+'">?</button>':'')+(fold?featureChevron:'')+progress;
}

export function discoveryPanelHTML(g,pid=0){
 if(!variantsEnabled(g)||!g.variants.discovery)return '';
 const fields=g.variants.discovery.fields,remaining=fields.filter(f=>f.owner===null).length,ready=ABILITIES.reduce((n,a)=>n+abilityCharges(g,pid,a.id).length,0),all=ABILITIES.reduce((n,a)=>n+abilityCharges(g,pid,a.id,{readyOnly:false}).length,0);
 const detail=remaining+'/6 Fundorte offen · '+ready+' bereit'+(all>ready?' · '+(all-ready)+' später':'');
 return '<section class="feature-panel discovery-panel" aria-label="Entdeckermodus"><div class="feature-heading">'+featureHeading('discovery','Entdeckermodus',detail)+'<button class="feature-help" data-action="variant-help" data-help="discovery" aria-label="Entdeckermodus-Regeln anzeigen">?</button></div></section>';
}
export function mixingPanelHTML(g){
 if(!variantsEnabled(g)||!g.variants.mixing)return '';const mixing=g.variants.mixing,count=5-(g.round-1)%5,next=(Math.floor((g.round-1)/5)+1)*5;
 const detail=g.status==='finished'?'Beendet · keine weitere Mischung':'In '+count+' '+(count===1?'Runde':'Runden')+' · nach Runde '+next;
 return '<section class="feature-panel mixing-panel" aria-label="Farben neu mischen"><div class="feature-heading">'+featureHeading('shuffle','Farben neu mischen',detail)+'<button class="feature-help" data-action="variant-help" data-help="mixing" aria-label="Farben-neu-mischen-Regeln anzeigen">?</button></div>'+(mixing.lastRound?'<p class="feature-note">Zuletzt nach Runde '+mixing.lastRound+'</p>':'')+'</section>';
}
// Retained for older callers; the current game renders each feature separately.
export function variantStatusHTML(g){return discoveryPanelHTML(g)+mixingPanelHTML(g);}
export function variantHelpHTML(g,{only=null}={}){
 if(!variantsEnabled(g))return '';const v=only&&['battleship','hiddenMines','discovery','objectives','mixing'].includes(only)?{[only]:g.variants[only]}:g.variants;
 return (v.hiddenMines?'<h3>Versteckte Minen</h3><p>Vor dem ersten Wurf legt jede Person geheime Minen aus. Bei zwei oder drei Personen sind es zwei Minen pro Person, ab vier Personen eine. Bestätigt jemand ein Kreuz auf einem gegnerischen Minenfeld, explodiert die Mine einmalig auf den Blättern aller aktiven Gegner der Person, die sie gelegt hat. Eigene Minen sind für dich ungefährlich. Die Explosion entfernt das getroffene Kreuz und bis zu fünf belegte Nachbarn wie beim Luftangriff. Es gibt keinen zusätzlichen Punkte-Einsatz. Normale Spalten-, Farb- und Sternpunkte werden neu berechnet; bestätigte Funde, Schüsse und Aufträge bleiben erhalten. Luftangriffe lösen keine Minen aus. Neue Minen gibt es erst in der nächsten Partie.</p><p>Rot gestrichelte Felder zeigen entfernte Kreuze. Grün durchgezogene Ränder markieren wieder angekreuzte Felder.</p>':'')+(v.battleship?'<h3>Schiffsboni</h3><p>Jedes bestätigte neue Kreuz greift dieselbe Koordinate beim Gegner an. Treffer bleiben erhalten. Erst vollständig versenkte Schiffe bringen Punkte: 1/2/3/4/5 Felder → 5/4/3/2/1 Punkte. Es gelten das normale Spielende und die normale Farbfeld-Wertung.</p>':'')+(v.discovery?'<h3>Entdecken &amp; Fähigkeiten</h3><p>Sechs sichtbare Fundorte, je zwei pro Fähigkeit. Der erste bestätigte Fund ist exklusiv; das Feld bleibt für den Gegner normal spielbar. Eine Ladung ist ab der nächsten Runde nutzbar und wird erst beim Bestätigen verbraucht. Höchstens eine Fähigkeit pro Zug, mehrere Ladungen sind sammelbar.</p><p>✳ Freie Farbwahl ersetzt die gewählte Farbe ohne Farb-Jokerkosten, die Zahl bleibt gleich. ±1 verändert die gewählte Zahl innerhalb 1–5. +1 ergänzt ein freies Feld beliebiger Farbe direkt neben deiner neuen normalen Gruppe.</p>':'')+(v.objectives?'<h3>Öffentliche Aufträge</h3><p>Drei gemeinsame Ziele im Wettlauf. Zuerst erfüllt: 5 Punkte, später: 2. In derselben ersten Runde erhalten alle 5. Fristen gelten einschließlich der genannten Runde; die Wertung erfolgt nach allen Zügen.</p><p>Jede neue Partie zieht drei unterschiedliche Aufträge aus '+OBJECTIVE_POOL.length+' Möglichkeiten: einen Spalten-, einen Stern- und einen Farbauftrag. Einer gilt bis Wurf 12, einer bis Wurf 20, einer bis Spielende. Die Ziele werden für alle gemeinsam gespeichert. Laufende Partien behalten ihre bisherigen Aufträge.</p>'+objectivePoolHelpHTML():'')+(v.mixing?'<h3>Farben neu mischen</h3><p>Nach den Runden 5, 10, 15 usw. werden auf jedem Blatt nur die freien Farben gemischt. Zusammenhängende freie Gruppen bleiben erhalten; einzelne Felder sind erlaubt. Kleinere Inseln können größere Gruppen bilden. Farbanzahlen, belegte Felder, Sterne, Fundorte und Schiffspositionen bleiben erhalten. Die Blätter können danach unterschiedlich aussehen. Am Spielende wird nicht mehr gemischt.</p>':'')+(g.mines?.enabled?'<h3>Zusammen mit Luftangriff</h3><p>Luftangriffe entfernen normale Kreuze und können Spalten-, Farb- und Sternpunkte verändern. Bestätigte Schiffstreffer, Versenkungen, Funde und erfüllte Aufträge bleiben erhalten. Erneutes Ankreuzen belohnt sie nicht nochmals. Ein Luftangriff zählt nicht als Runde.</p>':'');
}
export function abilitiesHTML(g,pid,choice,can){
 if(!variantsEnabled(g)||!g.variants.discovery)return '';
 return '<div class="ability-controls" role="group" aria-label="Entdeckte Fähigkeiten">'+ABILITIES.map(a=>{const ready=abilityCharges(g,pid,a.id).length,all=abilityCharges(g,pid,a.id,{readyOnly:false}).length;return '<button class="ability-button '+(choice.ability===a.id?'chosen':'')+'" data-action="variant-ability" data-type="'+a.id+'" aria-pressed="'+(choice.ability===a.id)+'" aria-label="'+a.name+': '+ready+' verfügbar'+(all>ready?', '+(all-ready)+' ab nächster Runde':'')+'" '+(!can||!ready?'disabled':'')+'><span aria-hidden="true">'+a.symbol+'</span><strong>'+({color:'Farbwahl',number:'Zahl ±1',extra:'Zusatzfeld'}[a.id])+'</strong><small>'+ready+(all>ready?' (+'+(all-ready)+')':'')+'</small></button>';}).join('')+'</div>'+(choice.ability==='number'?'<div class="ability-delta" role="group" aria-label="Zahl anpassen">'+[-1,1].map(n=>'<button class="outline-btn '+(choice.delta===n?'chosen':'')+'" data-action="variant-delta" data-n="'+n+'" aria-pressed="'+(choice.delta===n)+'">'+(n===1?'+1':'−1')+'</button>').join('')+'</div>':'')+(choice.ability?'<p class="ability-note">'+({color:'Wähle unten eine beliebige Farbe.',number:'Die endgültige Zahl muss zwischen 1 und 5 liegen.',extra:'Erst die normale Gruppe, dann ein angrenzendes freies Zusatzfeld wählen.'}[choice.ability])+'</p>':'');
}
export const objectiveLabel=t=>t.type==='columns'?t.target+' vollständige '+(t.target===1?'Spalte':'Spalten'):t.type==='stars'?t.target+' Sterne ankreuzen':t.target+' Felder in '+LABELS[t.color];
function objectivePoolHelpHTML(){return '<details class="objective-catalog"><summary>Alle '+OBJECTIVE_POOL.length+' Aufträge ansehen</summary><ul>'+OBJECTIVE_POOL.map(t=>'<li>'+objectiveLabel(t)+' · '+(t.deadline===null?'bis Spielende':'bis Wurf '+t.deadline)+'</li>').join('')+'</ul></details>';}
export function objectiveValidity(g,t){
 if(g.status==='finished')return {rounds:0,label:'Partie beendet',short:'Beendet'};
 if(t.deadline===null)return {rounds:null,label:'Bis Spielende',short:'Bis Spielende'};
 const rounds=Math.max(0,t.deadline-g.round+1);
 return {rounds,label:rounds===0?'Frist abgelaufen · Runde '+t.deadline:rounds===1?'Letzte gültige Runde · Runde '+t.deadline:'Noch '+rounds+' Runden · bis Runde '+t.deadline,short:rounds===0?'Abgelaufen':rounds===1?'Letzte Runde':'Noch '+rounds+' Runden'};
}
export function objectivesHTML(g,pid=0,{open=false}={}){
 if(!variantsEnabled(g)||!g.variants.objectives)return '';
 const tasks=g.variants.objectives.tasks.map(t=>{
  const done=t.claims[pid]!==null,pending=t.pending[pid]!==null;
  const value=done||pending?t.target:Math.min(t.target,objectiveProgress(g,pid,t));
  return {t,done,pending,value,validity:objectiveValidity(g,t)};
 });
 const completed=tasks.filter(({done,pending})=>done||pending).length;
 const deadlines='<span class="objective-deadlines" aria-label="Dein Auftragsfortschritt und die Fristen">'+tasks.map(({t,done,pending,value,validity})=>{
  const achieved=done||pending,expired=validity.rounds===0;
  const unit=t.type==='columns'?(t.target===1?'Spalte':'Spalten'):t.type==='stars'?(t.target===1?'Stern':'Sterne'):LABELS[t.color];
  const title=objectiveLabel(t)+' · '+value+' von '+t.target+' · '+validity.label+(achieved?' · erfüllt':'');
  return '<span class="objective-deadline '+(achieved?'achieved':expired?'expired':'')+'" title="'+esc(title)+'"><b>'+(achieved?'✓ ':'')+value+'/'+t.target+' '+esc(unit)+'</b><small>'+esc(achieved&&expired&&g.status!=='finished'?'Frist beendet':validity.short)+'</small></span>';
 }).join('')+'</span>';
 const cards=tasks.map(({t,done,pending,value,validity})=>{
  const expired=!done&&!pending&&t.deadline!==null&&validity.rounds===0;
  const names=t.claims.flatMap((r,i)=>r!==null?[esc(g.players[i].name)+' · Runde '+r]:[]);
  return '<section class="objective '+(done||pending?'achieved':expired?'expired':'')+'"><strong>'+objectiveLabel(t)+'</strong><p class="objective-validity">'+esc(done&&validity.rounds===0&&g.status!=='finished'?validity.label.replace('Frist abgelaufen','Frist beendet'):validity.label)+'</p><div class="objective-progress" role="progressbar" aria-label="'+objectiveLabel(t)+'" aria-valuemin="0" aria-valuemax="'+t.target+'" aria-valuenow="'+value+'"><i style="width:'+value/t.target*100+'%"></i></div><div><b>'+value+'/'+t.target+'</b><span>'+(done?'✓ Erfüllt'+(hidden(g)?'':' · +'+(t.claims[pid]===t.firstRound?5:2)+' Punkte'):pending?'✓ Bestätigt · Wertung nach der Runde':expired?'Frist abgelaufen':t.deadline===null?'Bis Spielende':'Bis einschließlich Runde '+t.deadline)+'</span></div>'+(names.length?'<small>'+names.join(' · ')+'</small>':'')+'</section>';
 }).join('');
 return '<details id="objectives-panel" class="feature-panel objectives-panel" aria-label="Öffentliche Aufträge" '+(open?'open':'')+'><summary class="feature-summary">'+featureHeading('objectives','Öffentliche Aufträge',completed+'/3 erfüllt',{reward:hidden(g)?null:'+'+objectivePoints(g,pid),fold:true,extra:deadlines})+'</summary><p class="objective-rules">'+(hidden(g)?'Punkte werden am Spielende aufgedeckt.':'Wettlauf: zuerst 5, später 2 Punkte. Gleiche erste Runde: alle 5.')+'</p><div class="objectives-grid">'+cards+'</div></details>';
}
export function battleTargetGridHTML(shots,{wrecks=new Set(),final=new Set()}={}){
 return '<div class="battle-target-grid" role="group" aria-label="Bestätigte Angriffe auf die gegnerische Flotte"><span aria-hidden="true"></span>'+[...COLS].map(c=>'<span class="battle-col" aria-hidden="true">'+c+'</span>').join('')+shots.map((s,i)=>(i%15===0?'<span class="battle-row" aria-hidden="true">'+(Math.floor(i/15)+1)+'</span>':'')+'<span data-shot="'+i+'" class="battle-target '+(wrecks.has(i)?'sunk':s===2?'hit':s===1?'water':final.has(i)?'revealed':'unknown')+'" role="img" aria-label="'+coord(i)+': '+(wrecks.has(i)?'Schiff versenkt':s===2?'Treffer':s===1?'Fehlschuss (Wasser)':final.has(i)?'Schiff, nicht getroffen':'noch nicht angegriffen')+'">'+(wrecks.has(i)?'⚓':s===2?shipHitMark:s===1?missMark:final.has(i)?'▰':'')+'</span>').join('')+'</div>';
}
export function battlePanelHTML(g,{open=false,own=0}={}){
 if(!variantsEnabled(g)||!g.variants.battleship)return '';const b=g.variants.battleship,shots=b.shots[own],wrecks=new Set(b.revealed[own].flat()),sunk=b.sunk[own].filter(Boolean).length,volley=b.lastVolley?.by===own?b.lastVolley:null;
 // Fleet coordinates are read only after the game; playing target maps contain
 // exclusively the human's confirmed public shot results.
 const final=g.status==='finished'?new Set(b.fleets[1-own].flat()):new Set();
 return '<details id="battle-map" class="feature-panel battle-panel" aria-label="Schiffsboni" '+(open?'open':'')+'><summary class="feature-summary">'+featureHeading('battleship','Schiffsboni',shots.filter(s=>s===2).length+' Treffer · '+sunk+'/5 versenkt',{reward:hidden(g)?null:'+'+shipPoints(g,own),fold:true})+'</summary><div class="battle-details"><p class="battle-last" role="status">'+(volley?.sunk.length?'Versenkt! '+volley.sunk.length+' '+(volley.sunk.length===1?'Schiff':'Schiffe')+(hidden(g)?'':' · +'+volley.sunk.reduce((n,s)=>n+s.points,0)+' Punkte'):volley?.results.some(r=>r.hit)?'Treffer bestätigt. Weiter geht’s!':'Jedes bestätigte Kreuz greift dieselbe Koordinate an.')+'</p><div class="battle-map-view"><div class="battle-map-tools" role="group" aria-label="Schusskarte vergrößern oder verkleinern"><button class="outline-btn" data-action="battle-zoom-out" aria-label="Schusskarte verkleinern">−</button><output data-shot-zoom aria-label="Schusskarten-Zoom">100%</output><button class="outline-btn" data-action="battle-zoom-in" aria-label="Schusskarte vergrößern">+</button><button class="outline-btn" data-action="battle-fit" aria-label="Ganze Schusskarte einpassen">↔ Einpassen</button></div><div class="battle-scroll" tabindex="0" aria-label="Deine Schusskarte – mit zwei Fingern zoomen und seitlich verschieben">'+battleTargetGridHTML(shots,{wrecks,final})+'</div><p class="battle-map-hint">Zwei Finger: zoomen · Einpassen: die ganze Karte.</p></div><div class="battle-legend"><span>'+missMark+' Fehlschuss (Wasser)</span><span>✹ Treffer</span><span>⚓ Versenkt</span></div><div class="battle-own"><span>'+ (hidden(g)?'Gegnerische Schüsse bleiben verdeckt.':'Deine Flotte: '+b.shots[1-own].filter(s=>s===2).length+' Treffer · '+b.sunk[1-own].filter(Boolean).length+'/5 versenkt')+'</span><button class="text-btn" data-action="battle-own">Zum eigenen Feld ↑</button></div></div></details>';
}
export function scoreBreakdownHTML(s){
 if(!s||s.hidden||s.left)return '';
 const parts=[['columns','Spalten',s.columns,false],['colors','Farben',s.colors,false],['jokers','Joker',s.jokers,false],['stars','Offene Sterne',s.penalty,true]];
 if(s.bonus!==undefined)parts.push(['bonus','Schatzsuche',s.bonus,false]);
 if(s.shipBonus!==undefined)parts.push(['battleship','Schiffsboni',s.shipBonus,false]);
 if(s.objectiveBonus!==undefined)parts.push(['objectives','Aufträge',s.objectiveBonus,false]);
 if(s.mineCost)parts.push(['mines','Luftangriff',s.mineCost,true]);
 return '<dl class="score-breakdown" aria-label="Punkteberechnung">'+parts.map(([type,label,value,negative])=>'<div class="score-part '+(negative?'deduction':'reward')+'"><dt><span class="score-part-icon" aria-hidden="true">'+setupOptionIcon(type)+'</span><span>'+label+'</span></dt><dd data-points="'+(negative?-value:value)+'">'+(negative?'−':'+')+value+'</dd></div>').join('')+'</dl>';
}
export function variantScoresHTML(s){return (s.shipBonus!==undefined?'<div>Schiffsboni<b>+'+s.shipBonus+'</b></div>':'')+(s.objectiveBonus!==undefined?'<div>Aufträge<b>+'+s.objectiveBonus+'</b></div>':'');}
export function resultComparisonHTML(g,own,selected){
 const data=resultComparison(g,own,selected);if(!data||g.players.length<2)return '';
 const participantLabel=(p,i)=>p.name+((p.name.trim().toLocaleLowerCase('de')==='du'||g.players.filter(q=>q.name===p.name).length>1)?' · Person '+(i+1):''),selectedName=participantLabel(g.players[selected],selected);
 const value=n=>n===null?'–':n<0?'−'+Math.abs(n):String(n),delta=n=>n===null?'–':n>0?'+'+n:value(n);
 const row=(r,total=false)=>'<tr'+(total?' class="comparison-total"':'')+'><th scope="row">'+(total?'Gesamt':'<span class="comparison-icon" aria-hidden="true">'+setupOptionIcon(r.type)+'</span>')+esc(r.label||'')+'</th><td>'+value(r.own)+'</td><td>'+value(r.selected)+'</td><td class="result-delta '+(r.delta>0?'positive':r.delta<0?'negative':'')+'">'+delta(r.delta)+'</td></tr>';
 return '<section class="result-comparison" aria-label="Punktevergleich"><h3>Punkte vergleichen</h3><fieldset class="result-player-picker"><legend>Vergleichen mit</legend>'+g.players.flatMap((p,i)=>i===own?[]:['<button type="button" class="outline-btn" data-action="result-compare" data-i="'+i+'" aria-pressed="'+(i===selected)+'">'+esc(participantLabel(p,i))+'</button>']).join('')+'</fieldset><table class="result-comparison-table"><caption>Du'+(data.ownName==='Du'?'':' · '+esc(data.ownName))+' und '+esc(selectedName)+'</caption><thead><tr><th scope="col">Kategorie</th><th scope="col">Du</th><th scope="col">'+esc(selectedName)+'</th><th scope="col" aria-label="Differenz: gewählte Person minus du">Δ</th></tr></thead><tbody>'+data.rows.map(r=>row(r)).join('')+row(data.total,true)+'</tbody></table><p class="comparison-note">Differenz = '+esc(selectedName)+' minus du. Positive Werte bedeuten mehr Punkte für '+esc(selectedName)+'.</p>'+(data.ownLeft||data.selectedLeft?'<p class="comparison-note">Ausgestiegen: fest −10 Punkte. Die regulären Kategorien werden für diese Person nicht gewertet.</p>':'')+'</section>';
}
export function shipSunkBanner(game,volley,own){
 if(!volley||hidden(game)&&volley.by!==own||!volley.sunk.length)return null;
 const count=volley.sunk.length,points=volley.sunk.reduce((sum,ship)=>sum+ship.points,0);
 const title=count===1?'Schiff versenkt':count+' Schiffe versenkt';
 const detail=[volley.by===own?'Dein Angriff':'Angriff von '+game.players[volley.by].name,count===1?'Schiffslänge '+volley.sunk[0].cells.length:'',hidden(game)?'':'+'+points+' Punkte'].filter(Boolean).join(' · ');
 return {type:'battleship',title,detail};
}
export function playVariantEffects(g,{volley=null,mix=false,own=0,document:doc=globalThis.document,root=doc,scroll=true,reducedMotion=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false}={}){
 if(!root||!doc||!variantsEnabled(g))return 0;let duration=0;
 const animate=(element,frames,options,cleanup=element)=>{if(element.animate)element.animate(frames,options).finished.catch(()=>{}).then(()=>cleanup.remove());else setTimeout(()=>cleanup.remove(),options.duration);};
 // A concealed opponent volley must not query, scroll to or animate its locations.
 if(volley&&(!hidden(g)||volley.by===own)){
  const gridRoot=root.querySelector(volley.by===own?'.battle-target-grid':'[data-player-board="'+own+'"]'),selector=i=>volley.by===own?'[data-shot="'+i+'"]':'[data-action="cell"][data-i="'+i+'"]';
  const first=volley.results.find(r=>r.hit)||volley.results[0];if(scroll&&gridRoot&&first)gridRoot.querySelector(selector(first.index))?.scrollIntoView({block:'center',inline:'center',behavior:'instant'});
  if(gridRoot){
   const place=(index,kind,content,frames,ms)=>{const cell=gridRoot.querySelector(selector(index));if(!cell)return;const effect=doc.createElement('span');effect.className='battle-cell-effect '+kind;effect.setAttribute('aria-hidden','true');effect.innerHTML=content;cell.append(effect);animate(effect,frames,{duration:ms,easing:'ease-out'});};
   const hit='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 8 8 8m0-8-8 8"/></svg>',water='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/></svg>';
   const pulse=reducedMotion?[{opacity:1},{opacity:0}]:[{transform:'scale(.65)',opacity:0},{transform:'scale(1)',opacity:1,offset:.35},{transform:'scale(1.08)',opacity:0}];
   for(const r of volley.results)place(r.index,r.hit?'hit-effect':'water-effect',r.hit?hit:water,pulse,reducedMotion?180:650);
   duration=reducedMotion?180:700;
   const sunk='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M7 12h10m-8 3 3 3 3-3M12 6v12"/></svg>';
   for(const ship of volley.sunk){
    for(const i of ship.cells)place(i,'sunk-effect',sunk,reducedMotion?[{opacity:1},{opacity:0}]:[{opacity:0,transform:'scale(.7)'},{opacity:1,transform:'scale(1)',offset:.2},{opacity:1,transform:'scale(.9)',offset:.65},{opacity:0,transform:'scale(.7)'}],reducedMotion?350:1550);
    const cell=gridRoot.querySelector(selector(ship.cells[0])),grid=cell?.parentElement;
    if(grid){const first=Math.min(...ship.cells),vertical=ship.cells.length>1&&Math.abs(ship.cells[1]-ship.cells[0])===15,effect=doc.createElement('span');effect.className='battle-sinking-ship'+(vertical?' vertical-ship':'');effect.setAttribute('aria-hidden','true');effect.style.gridColumn=(first%15+(grid.classList?.contains?.('numbered-board')||grid.classList?.contains?.('battle-target-grid')?2:1))+' / span '+(vertical?1:ship.cells.length);effect.style.gridRow=(Math.floor(first/15)+2)+' / span '+(vertical?ship.cells.length:1);effect.innerHTML='<span class="sinking-hull">'+shipSVG(ship.cells.length,vertical)+'</span>';grid.append(effect);const hull=effect.firstElementChild;animate(hull,reducedMotion?[{opacity:1},{opacity:0}]:[{transform:'translateY(-10%)',opacity:0},{transform:'translateY(0)',opacity:1,offset:.18},{transform:'translateY(30%) rotate('+ (vertical?3:8)+'deg)',opacity:.85,offset:.65},{transform:'translateY(110%) rotate('+(vertical?6:15)+'deg) scale(.8)',opacity:0}],{duration:reducedMotion?350:1550,easing:'ease-in'},effect);}
    duration=reducedMotion?350:1600;
   }
  }
 }
 if(mix){const pid=Number(root.querySelector('[data-player-board]')?.dataset.playerBoard??0);for(const i of g.variants.mixing.changed[pid]||[]){const el=root.querySelector('[data-player-board="'+pid+'"] [data-i="'+i+'"]');el?.animate?.(reducedMotion?[{opacity:.4},{opacity:1}]:[{opacity:.2,transform:'scale(.8)'},{opacity:1,transform:'scale(1)'}],{duration:reducedMotion?180:600,delay:duration+(reducedMotion?0:i%15*15)});}duration+=reducedMotion?180:850;}
 return duration;
}
