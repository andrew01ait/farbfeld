import {setupOptionHTML,setupOptionIcon,featureHeading,placementGridHTML,placementSetupHTML,playGameBanner} from './variant-ui.js';
import {hiddenMinesEnabled} from './variants.js';
import {boardFor} from './boards.js';
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
import {BOARD,COLS,LABELS,MINE_COST,MINE_COVERAGE_CELLS,minesEnabled,mineCoverageEnabled,mineCharges,mineAttackCount,mineTargetView,mineBlasts,damageBlasts,mineBlastTargets,blastNeighbors,canUseMine} from './engine.js';
export const MINE_ANIMATION_MS=3000;
const AIRSTRIKE_IMPACT_MS=1450;
// Keep the historical export and wire names for saved games and older peers.
export const mineIcon=setupOptionIcon('mines');
export const groundMineIcon=setupOptionIcon('hiddenMines');
const coordinate=i=>COLS[i%15]+(Math.floor(i/15)+1);
export function hiddenMineSetupHtml(g,slot=0,own=0,{available=true,headerAction=''}={}){
 if(g?.status!=='playing'||!g.variants?.hiddenMines||g.variants.hiddenMines.ready[own])return '';
 const h=g.variants.hiddenMines,positions=h.positions[own],selected=positions[slot],layout=boardFor(g,own);
 const choices='<div class="placement-choices" style="--placement-count:'+positions.length+'" role="group" aria-label="Mine wählen">'+positions.map((i,k)=>'<button class="outline-btn placement-choice" data-action="hidden-mine-slot" data-i="'+k+'" aria-pressed="'+(slot===k)+'">'+groundMineIcon+'<strong>Mine '+(k+1)+'</strong><small>'+coordinate(i)+'</small></button>').join('')+'</div>';
 const grid=placementGridHTML(layout,'Deine Minen · '+g.players[own].name,(color,i)=>{const placed=positions.indexOf(i);return '<button class="mine-cell'+(placed>=0?' hidden-mine-placed':'')+(i===selected?' mine-selected':'')+'" style="--cell:var(--'+color+')" data-action="hidden-mine-place" data-i="'+i+'" aria-label="'+coordinate(i)+', '+LABELS[color]+(placed>=0?', Mine '+(placed+1):'')+'" aria-pressed="'+(i===selected)+'">'+(placed>=0?groundMineIcon+'<b>'+(placed+1)+'</b>':layout.stars.includes(i)?'☆':'')+'</button>';});
 const controls='<div class="placement-coordinates mine-coordinates"><label for="hidden-mine-column">Spalte<select class="outline-btn" id="hidden-mine-column">'+[...COLS].map((c,i)=>'<option value="'+i+'"'+(selected%15===i?' selected':'')+'>'+c+'</option>').join('')+'</select></label><label for="hidden-mine-row">Zeile<select class="outline-btn" id="hidden-mine-row">'+Array.from({length:7},(_,i)=>'<option value="'+i+'"'+(Math.floor(selected/15)===i?' selected':'')+'>'+(i+1)+'</option>').join('')+'</select></label></div><button class="outline-btn placement-position" data-action="hidden-mine-coordinate">Mine '+(slot+1)+' hier platzieren</button><button class="outline-btn placement-random" data-action="hidden-mine-random">↻ Zufällig verteilen</button>';
 return placementSetupHTML({kind:'hidden-mine',eyebrow:'VERSTECKTE MINEN'+(g.variants.battleship?' · SCHRITT 2 VON 2':''),title:positions.length===1?'Deine Mine auslegen.':'Deine Minen auslegen.',intro:'Wähle ein Feld für jede Mine. Nur deine Gegner können deine Minen auslösen.',legend:'Geheime Minen auslegen',choices,grid,controls,rule:'Einmalige Explosion wie beim Luftangriff. Getroffene Kreuze und Punkte werden neu berechnet. Die Explosion kostet keine Punkte.',confirm:'<button class="primary placement-confirm" data-action="hidden-mine-ready">'+groundMineIcon+(positions.length===1?'Mine bestätigen':'Minen bestätigen')+'</button>',available,headerAction});
}
// The user may see how many crosses their mine removed in concealed play.
// Read only that aggregate there; never copy or inspect foreign coordinates.
export function hiddenMineReports(g,own=0){
 if(!hiddenMinesEnabled(g)||!g.players[own])return [];
 const concealed=g.hiddenScores&&g.status!=='finished';
 return g.variants.hiddenMines.blasts.flatMap(b=>mineBlastTargets(b).filter(t=>t.pid===own||b.by===own).map(t=>({id:b.id,round:b.round,by:b.by,pid:t.pid,removed:t.removed??t.cells.length,...(!concealed?{target:b.target,cells:[...t.cells]}:{})})));
}
export function hiddenMineStatusHtml(g,own=0,{open=false,damage=null}={}){
 if(!hiddenMinesEnabled(g))return '';
 const h=g.variants.hiddenMines,left=h.triggered[own].filter(x=>!x).length,reports=hiddenMineReports(g,own),found=new Set(reports.filter(r=>r.by!==own&&r.pid===own&&(r.removed||!g.hiddenScores||g.status==='finished')).map(r=>r.id)).size,last=reports.at(-1),name=pid=>pid===own?'Du':g.players[pid]?.name||'Mitspieler';
 const detail=left+'/'+h.positions[own].length+' scharf · '+(damage?damage.cells.length+' '+(damage.cells.length===1?'Feld':'Felder')+' markiert':last?name(last.pid)+': '+last.removed+' entfernt':found+' ausgelöst');
 const history=reports.length?'<ol class="hidden-mine-history" aria-label="Minenberichte">'+[...reports].reverse().map(r=>'<li><div class="hidden-mine-outcome"><strong>'+esc(r.by===own?'Deine Mine → '+name(r.pid):'Gegnerische Mine → '+name(r.pid))+'</strong><b>'+r.removed+' '+(r.removed===1?'Kreuz':'Kreuze')+' entfernt</b></div><p>Wurf '+r.round+(r.target!==undefined?' · Ausgelöst auf '+coordinate(r.target):' · Position verdeckt')+'</p>'+(r.cells?'<p class="hidden-mine-cells">'+(r.cells.length?'Entfernt: '+r.cells.map(coordinate).join(', '):'Kein Schaden')+'</p>':'')+'</li>').join('')+'</ol>':'';
 return '<details id="hidden-mine-panel" class="feature-panel hidden-mine-status" aria-label="Versteckte Minen"'+(open?' open':'')+'><summary class="feature-summary">'+featureHeading('hiddenMines','Versteckte Minen',detail,{fold:true})+'</summary>'+mineDamageSummaryHtml(damage)+'<div class="hidden-mine-details"><p><strong>'+left+'/'+h.positions[own].length+' eigene Minen scharf</strong><br>'+found+' gegnerische '+(found===1?'Mine':'Minen')+' ausgelöst. Eigene Minen sind für dich sicher.</p>'+history+'</div></details>';
}
export const mineLostMark='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M7 12h10"/></svg>';
export function mineSetupHtml(enabled=false){return setupOptionHTML({id:'mine-enabled',type:'mines',title:'Luftangriff',description:'Bis zu zwei je Person · je −5 Punkte · trifft alle Gegner.',checked:enabled,className:'mine-setup'});}
const mineStateIcons={left:'<path d="m6 6 12 12M18 6 6 18"/>',locked:'<path d="M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5z"/>',ready:'<path d="m5 12 4 4L19 6"/>',used:'<circle cx="12" cy="12" r="9"/><path d="m5 5 14 14"/>'};
const mineStateIcon=kind=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+mineStateIcons[kind]+'</svg>';
const mineChargeLabel=reason=>reason==='coverage'?MINE_COVERAGE_CELLS+' Felder':'Farbabschluss';
export function mineControlsHtml(game,{highlight=false,own=0,available=true,damage=null}={}){
 if(!minesEnabled(game)||game.status!=='playing'&&!damage)return '';
 const playing=game.status==='playing',expanded=mineCoverageEnabled(game),concealed=game.hiddenScores&&playing;
 const charges=pid=>mineCharges(game,pid).filter(charge=>!concealed||pid===own||charge.reason==='color'||charge.used);
 const state=pid=>game.players[pid].left?'left':charges(pid).some(charge=>charge.unlocked&&!charge.used)?'ready':charges(pid).every(charge=>charge.used)?'used':'locked';
 const ready=playing&&state(own)==='ready',labels={left:'ausgestiegen',locked:'gesperrt',ready:'bereit – jetzt freigeschaltet',used:'bereits eingesetzt'};
 const chip=(label,kind,title,ownChip=false)=>'<span class="mine-state mine-state-'+kind+(ownChip&&kind==='ready'?' mine-ready-badge':'')+'" title="'+esc(title+': '+labels[kind])+'" aria-label="'+esc(title+': '+labels[kind])+'"><b>'+esc(label)+'</b>'+mineStateIcon(kind)+'</span>';
 const ownStatus=expanded&&!game.players[own].left?charges(own).map(charge=>chip(charge.reason==='color'?'Farbe':mineChargeLabel(charge.reason),charge.used?'used':charge.unlocked?'ready':'locked',mineChargeLabel(charge.reason),true)).join(''):chip({left:'Ausgestiegen',locked:'Gesperrt',ready:'Bereit',used:'Verbraucht'}[state(own)],state(own),'Dein Luftangriff',true);
 const opponents=game.players.map((p,pid)=>pid===own?'':chip(p.name,state(pid),p.name)).join('');
 const spent=mineAttackCount(game,own),reward=concealed||!spent?null:'−'+spent*MINE_COST;
 const attack=mineBlasts(game).findLast(b=>b.by===own),count=attack&&!concealed?mineBlastTargets(attack).reduce((n,t)=>n+t.cells.length,0):null;
 const onAttackReport=damage?.by===own&&count===damage.cells.length;
 const target=Number.isInteger(attack?.target)?' · '+coordinate(attack.target):'';
 const last=attack?'<p class="mine-last-attack"><strong>Dein Angriff'+target+'</strong><span>'+(concealed?'Ergebnis verdeckt':count?removedCrosses(count)+(game.players.length>2?' insgesamt':''):'Kein Treffer')+(Number.isSafeInteger(attack.round)?' · Wurf '+attack.round:'')+'</span>'+(onAttackReport?mineMarkerDetailsHtml(damage):'')+'</p>':'';
 const status=playing?'<span class="mine-status-states"><span class="mine-own-states" role="group" aria-label="Deine Freischaltungen">'+ownStatus+'</span><span class="mine-state-list" role="group" aria-label="Freischaltungen der Mitspielenden" tabindex="0">'+opponents+'</span></span>':'';
 const action=ready?'<div class="mine-status-action"><button class="primary mine-aim" data-action="mine-aim"'+(available&&canUseMine(game,own)?'':' disabled')+' aria-label="Luftangriffsziel wählen, fünf Punkte Einsatz">Ziel wählen</button></div>':'';

 return '<section class="mine-controls mine-status-card'+(ready?' mine-ready':'')+(ready&&highlight?' mine-new':'')+'" aria-label="Luftangriff"><div class="feature-heading">'+featureHeading('mines','Luftangriff','',{reward,extra:status})+'</div>'+action+last+(onAttackReport?'':mineDamageSummaryHtml(damage))+'</section>';
}
export function mineLobbyHtml(enabled,host,action,available=true,missing=[],coverage=true){return '<section class="hidden-option"><span class="setup-icon" aria-hidden="true">'+setupOptionIcon('mines')+'</span><div class="setup-copy"><strong>Luftangriff '+(enabled?'aktiviert':'ausgeschaltet')+'</strong><p>'+(coverage?'Bis zu zwei je Person':'Einmal je Person')+' · je −5 Punkte · ein Zielfeld gegen alle Gegner.</p>'+(!available?'<p class="board-help">'+(missing.length?esc(missing.join(', '))+': ':'')+'Alle Apps benötigen Version 1.17.0 oder neuer.</p>':!coverage?'<p class="board-help">Für die zweite Freischaltung brauchen alle Apps Farbfeld 1.33.0.</p>':'')+'</div>'+(host?'<button class="toggle '+(enabled?'on':'')+'" role="switch" aria-label="Luftangriff" aria-checked="'+enabled+'" data-action="'+action+'"'+(available||enabled?'':' disabled')+'></button>':'')+'</section>';}

export function mineHelpHtml(game){
 const unlock=(!game||mineCoverageEnabled(game))?`
  <p>Du kannst bis zu zwei Luftangriffe einsetzen. Jede Bedingung schaltet einmal einen Angriff frei.</p>
  <ul class="mine-help-unlocks">
   <li><b>Farbe</b> – Ein Gegner hat alle Felder einer Farbe angekreuzt. Der Abschluss zählt bei der gemeinsamen Wertung des Wurfs.</li>
   <li><b>${mineChargeLabel('coverage')}</b> – Ein Gegner hat nach einem bestätigten Zug mindestens ${MINE_COVERAGE_CELLS} von ${BOARD.length} Feldern angekreuzt.${hiddenMinesEnabled(game)?' Ausgelöste Minen werden vorher ausgewertet.':''}</li>
  </ul>`:'<p>In dieser Partie hat jede Person einen Luftangriff. Er wird frei, sobald der Farbabschluss eines Gegners bei der gemeinsamen Wertung des Wurfs zählt.</p>';
 const states=[['locked','Gesperrt'],['ready','Bereit'],['used','Verbraucht']].map(([kind,label])=>'<li class="mine-state mine-state-'+kind+'">'+mineStateIcon(kind)+label+'</li>').join('');
 return `<div class="mine-help-content">
  <section><h3>Wann ist ein Angriff bereit?</h3>${unlock}<ul class="mine-help-states" aria-label="Status der Freischaltungen">${states}</ul></section>
  <section><h3>Ziel wählen und angreifen</h3>
   <p>Tippe während deiner Auswahl auf <b>Ziel wählen</b>. Dieselbe Koordinate gilt für alle aktiven Gegner. Bei einem Treffer verschwinden das Kreuz im Zielfeld und bis zu fünf Kreuze in Nachbarfeldern, auch diagonal. Ein leeres Ziel verursacht keinen Schaden.</p>
   <p>Jeder Angriff kostet <b>${MINE_COST} Punkte</b>, auch wenn du niemanden triffst. Danach kannst du deinen Zug wie gewohnt bestätigen.</p>
  </section>
  <section><h3>Wertung und Markierungen</h3>
   <p>Betroffene Farb- und Spaltenboni werden neu berechnet. Ein entfernter Stern zählt wieder −2 Punkte. Bestätigte Schätze, Schiffsboni und Aufträge behalten ihre Wertung.</p>
   <p>Rot gestrichelte Ränder zeigen entfernte Kreuze bis zum Ende des nächsten Wurfs. Wieder angekreuzte Felder erhalten einen grünen Rand.${game?.hiddenScores?' Bei verdeckten Punkten siehst du den Schaden auf deinem eigenen Brett.':''}</p>
  </section>
 </div>`;
}
export function mineTargetHtml(game,target=null,own=0,charge=null){
 const view=mineTargetView(game,own);if(!view)return '';
 const valid=Number.isInteger(target)&&target>=0&&target<105,col=valid?target%15:null,row=valid?Math.floor(target/15):null,coordinate=valid?COLS[col]+(row+1):null,knownEmpty=valid&&!view.hidden&&!view.shared&&!view.cells[target].marked,near=new Set(valid&&!knownEmpty?blastNeighbors(target):[]),opponents=game.players.filter((p,i)=>i!==own&&!p.left).length;
 const heading=view.shared?(opponents===1?'Ein gegnerisches Blatt':'Ein Ziel für alle '+opponents+' Gegner'):view.hidden?'Blindes Zielraster':'Gegnerisches Spielfeld';
 return '<section class="mine-targeting"><p class="mine-target-intro">'+(mineCoverageEnabled(game)&&charge?'<strong>'+mineChargeLabel(charge)+'</strong> · ':'')+(view.hidden?'Wähle ein Feld. Gegnerische Kreuze bleiben verborgen.':'Tippe auf dein Ziel oder wähle seine Koordinaten.')+'</p><div class="mine-target-layout"><div class="mine-target-map"><div class="mine-map-heading"><strong>'+heading+'</strong><span>Spalte A–O · Zeile 1–7</span></div><div class="mine-map-scroll" tabindex="0" aria-label="Zielraster seitlich verschieben"><div class="mine-grid" role="group" aria-label="'+(view.hidden||view.shared?'Zielraster ohne gegnerische Kreuze':'Gegnerblatt zur Zielwahl')+'"><span aria-hidden="true"></span>'+[...COLS].map(c=>'<span class="mine-col-label" aria-hidden="true">'+c+'</span>').join('')+
  view.cells.map(cell=>{const at=COLS[cell.index%15]+(Math.floor(cell.index/15)+1);return (cell.index%15===0?'<span class="mine-row-label" aria-hidden="true">'+(Math.floor(cell.index/15)+1)+'</span>':'')+'<button class="mine-cell'+(cell.marked?' mine-marked':'')+(cell.index===target?' mine-selected':near.has(cell.index)?' mine-near':'')+'" style="--cell:var(--'+cell.color+')" data-action="mine-target" data-i="'+cell.index+'" aria-pressed="'+(cell.index===target)+'" aria-label="Ziel '+at+', '+LABELS[cell.color]+(!view.hidden&&cell.marked?', angekreuzt':'')+(cell.index===target?', gewähltes Ziel':near.has(cell.index)?', mögliches Nachbarfeld':'')+'">'+(cell.index===target?'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="6"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/></svg>':cell.marked?'×':cell.star?'☆':'')+'</button>';}).join('')+'</div></div><p class="mine-map-key"><i aria-hidden="true"></i> Umrandetes Umfeld: mögliche Nachbarfelder.</p></div><div class="mine-target-settings"><div class="mine-coordinates"><label for="mine-column">Spalte<select class="outline-btn" id="mine-column"><option value="">A–O</option>'+[...COLS].map((c,i)=>'<option value="'+i+'"'+(col===i?' selected':'')+'>'+c+'</option>').join('')+'</select></label><label for="mine-row">Zeile<select class="outline-btn" id="mine-row"><option value="">1–7</option>'+Array.from({length:7},(_,i)=>'<option value="'+i+'"'+(row===i?' selected':'')+'>'+(i+1)+'</option>').join('')+'</select></label></div><div class="mine-target-label" role="status"><strong>'+(coordinate?'Ziel '+coordinate:'Noch kein Ziel')+'</strong><span>'+(knownEmpty?'Leeres Ziel · kein Schaden':view.shared?(opponents===1?'Ein Gegner':'Alle '+opponents+' Gegner'):view.hidden?'Ergebnis bleibt verdeckt':'Ein gegnerisches Blatt')+' · dein Blatt bleibt intakt</span></div><p class="mine-target-summary"><b>Treffer:</b> Ziel + 3–5 belegte Nachbarn. <b>Leer:</b> kein Schaden.</p><details class="mine-rule-details"><summary>So wirkt der Angriff</summary><p>Jeder Angriff kostet fünf Punkte, auch bei einem leeren Ziel. Nur bei belegtem Zielfeld werden zusätzlich bis zu fünf belegte Nachbarn entfernt, auch diagonal. Sind weniger als drei belegt, nur diese. Betroffene Spalten-/Farbboni werden neu verteilt; entfernte Sterne zählen wieder negativ. Bestätigte Bonusfunde, Schüsse, Versenkungen und Aufträge bleiben erhalten. Dein normaler Zug bleibt frei.</p></details></div></div><div class="mine-target-actions"><button class="outline-btn" data-action="close-modal">Abbrechen</button><button class="primary" data-action="mine-confirm"'+(!valid?' disabled':'')+'>'+mineIcon+(coordinate?coordinate+' angreifen':'Ziel wählen')+' · −'+MINE_COST+' P</button></div></section>';
}
export function mineDamage(game,pid,own){
 if(!minesEnabled(game)&&!hiddenMinesEnabled(game)||game.hiddenScores&&game.status!=='finished'&&pid!==own)return null;
 const active=damageBlasts(game).filter(b=>Number.isSafeInteger(b.round)&&game.round>=b.round&&game.round<=b.round+1).flatMap(b=>mineBlastTargets(b).filter(t=>t.pid===pid&&t.cells?.length).map(t=>({cells:t.cells,untilRound:b.round+1,kind:b.kind,by:b.by})));
 if(!active.length)return null;
 const summarize=blasts=>{
  if(!blasts.length)return null;
  const cells=[...new Set(blasts.flatMap(b=>b.cells))];
  const deadlines=blasts.map(b=>b.untilRound),untilRound=Math.max(...deadlines);
  return {cells,untilRound,staggered:deadlines.some(round=>round!==untilRound),recovered:cells.filter(i=>game.players[pid]?.marks?.[i]).length,by:blasts.length===1?blasts[0].by:null};
 };
 const airstrike=summarize(active.filter(b=>b.kind!=='hidden')),hidden=summarize(active.filter(b=>b.kind==='hidden'));
 return {cells:[...new Set(active.flatMap(b=>b.cells))],label:airstrike&&hidden?'Angriffsschaden':hidden?'Versteckte Mine':'Luftangriff',airstrike,hidden};
}
const removedCrosses=count=>count+' '+(count===1?'Kreuz':'Kreuze')+' entfernt';
function mineMarkerDetailsHtml({recovered,untilRound,staggered}){
 return '<span class="mine-marker-duration">'+(recovered?recovered+' wieder angekreuzt · ':'')+(staggered?'Letzte Markierung bis Ende von Wurf ':'Markiert bis Ende von Wurf ')+untilRound+'</span>';
}
function mineDamageSummaryHtml(damage){
 return damage?'<p class="mine-damage-summary" role="status"><strong>Auf diesem Spielfeld · '+removedCrosses(damage.cells.length)+'</strong>'+mineMarkerDetailsHtml(damage)+'</p>':'';
}
// A single confirmed move can hit both mines. Render both centres and the union
// of actual removals, without double-counting or reading concealed damage.
export function mineEffect(blasts,{own=0,concealed=false}={}){
 if(!blasts?.length)return null;const last=blasts.at(-1);
 if(blasts.length===1||blasts.some(b=>b.kind!=='hidden'||b.turn!==last.turn||b.by!==last.by))return last;
 const victims=new Map();for(const b of blasts)for(const t of mineBlastTargets(b).filter(t=>!concealed||t.pid===own)){const cells=victims.get(t.pid)||new Set();t.cells.forEach(i=>cells.add(i));victims.set(t.pid,cells);}
 return {...last,target:blasts[0].target,impactTargets:blasts.map(b=>b.target),triggerCount:blasts.length,targets:[...victims].map(([pid,cells])=>({pid,cells:[...cells]}))};
}
function revealImpact(anchor,cells,{board,noticeHost,environment}){
 const scroll=anchor.closest?.('.board-scroll');
 if(!scroll){anchor.scrollIntoView?.({block:'center',inline:'center',behavior:'instant'});return;}

 const viewport=environment.visualViewport,left=viewport?.offsetLeft??0,top=viewport?.offsetTop??0;
 const right=left+(viewport?.width??environment.innerWidth),bottom=top+(viewport?.height??environment.innerHeight);
 const pane=scroll.getBoundingClientRect(),tray=board.querySelector('.dice-card.choosing');
 const fixedTray=tray&&environment.getComputedStyle(tray).position==='fixed';
 const banner=noticeHost.querySelector?.(':scope > .game-event-banner');
 const clearTop=Math.max(top,banner?.getBoundingClientRect().bottom??top)+8;
 const clearBottom=Math.min(bottom,fixedTray?tray.getBoundingClientRect().top:bottom)-8;
 const clearLeft=Math.max(left,pane.left)+8,clearRight=Math.min(right,pane.right)-8;
 const target=anchor.getBoundingClientRect(),rects=cells.map(({cell})=>cell.getBoundingClientRect());
 const area={
  left:Math.min(...rects.map(rect=>rect.left)),right:Math.max(...rects.map(rect=>rect.right)),
  top:Math.min(...rects.map(rect=>rect.top)),bottom:Math.max(...rects.map(rect=>rect.bottom))
 };
 // Keep the whole damage area in view when it fits at the current zoom.
 const horizontal=area.right-area.left<=clearRight-clearLeft?area:target;
 const vertical=area.bottom-area.top<=clearBottom-clearTop?area:target;
 const pan=horizontal.left<clearLeft||horizontal.right>clearRight;
 const advance=vertical.top<clearTop||vertical.bottom>clearBottom;
 if(!pan&&!advance)return;

 // Scroll the grid and the page together. The vertical margins centre the
 // hit in the space between the fixed banner and the dice tray.
 const previous=anchor.style.scrollMargin;
 anchor.style.scrollMargin=[
  advance?target.top-vertical.top+clearTop-top:0,
  pan?horizontal.right-target.right:0,
  advance?vertical.bottom-target.bottom+bottom-clearBottom:0,
  pan?target.left-horizontal.left:0
 ].map(value=>value+'px').join(' ');
 anchor.scrollIntoView({block:advance?'center':'nearest',inline:pan?'center':'nearest',behavior:'instant'});
 anchor.style.scrollMargin=previous;
}
export function playMineBlast({by=0,target,targetPid,targets,cells,kind,impactTargets,triggerCount=1,ownPid=0,concealed=false,attacker='',root,noticeHost,scroll=true,messages=[]}={},environment=globalThis){
 const document=environment.document;if(!document)return;
 const board=root??document;
 for(const old of board.querySelectorAll?.('.mine-cell-effect')??[])old.remove();
 const reduced=environment.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 const victims=(targets??(Number.isInteger(targetPid)?[{pid:targetPid,cells:cells??[]}]:[])).filter(t=>!concealed||t.pid===ownPid),visible=victims.filter(t=>board.querySelector('[data-player-board="'+t.pid+'"]'));
 const victim=visible[0],removed=victim?.cells.length??0,coordinate=kind==='hidden'&&concealed?'':(impactTargets??[target]).filter(i=>Number.isInteger(i)&&i>=0&&i<105).map(i=>COLS[i%15]+(Math.floor(i/15)+1)).join(' + ');
 const ground=kind==='hidden',centres=new Set(impactTargets??(Number.isInteger(target)?[target]:[]));
 const title=(ground?(triggerCount>1?triggerCount+' Minen ausgelöst':by===ownPid?'Deine Mine ausgelöst':attacker?'Mine von '+attacker:'Mine ausgelöst'):by===ownPid?'Dein Luftangriff':attacker?'Luftangriff von '+attacker:'Luftangriff')+(coordinate?' · '+coordinate:'');
 const detail=ground&&by===ownPid&&!victim?'Bericht unter „Versteckte Minen“':by===ownPid&&concealed?'Ergebnis bleibt verdeckt':victim?removed?(removed===1?'1 Kreuz entfernt':removed+' Kreuze entfernt'):'Leeres Ziel · kein Schaden':'Angriff bestätigt';
 const stopBanner=playGameBanner([{type:ground?'hiddenMines':'mines',title,detail},...messages],{host:noticeHost,environment});
 const decorations=[];
 for(const t of visible){
  const at=Number.isInteger(target)?target:t.cells[0];
  const indices=[...new Set([...centres,...(Number.isInteger(at)?[at]:[]),...t.cells])];
  const impactCells=indices.map(index=>({index,cell:board.querySelector('[data-player-board="'+t.pid+'"] [data-i="'+index+'"]')})).filter(({cell})=>cell);
  const anchor=(impactCells.find(({index})=>index===at)??impactCells[0])?.cell;
  if(scroll&&anchor)revealImpact(anchor,impactCells,{board,noticeHost:noticeHost??document.body,environment});
  if(reduced)continue;
  for(const {index,cell} of impactCells){
   const hit=t.cells.includes(index),centre=centres.has(index)||index===at,part=document.createElement('span');part.className='mine-cell-effect'+(ground?' ground-mine-effect':'')+(centre?' mine-impact-centre':'')+(!hit?' mine-impact-miss':'');part.setAttribute('aria-hidden','true');
   if(!ground)part.setAttribute('style','--airstrike-impact:'+AIRSTRIKE_IMPACT_MS+'ms');
   part.innerHTML=(centre&&!ground?'<span class="airstrike-flight">'+mineIcon+'</span><i class="airstrike-drop"></i>':'')+'<svg viewBox="0 0 100 100">'+(ground&&centre?'<path class="ground-flash" d="M50 18 56 35 73 27 65 44 84 50 65 56 73 73 56 65 50 84 44 65 27 73 35 56 18 50 35 44 27 27 44 35Z"/><circle class="ground-core" cx="50" cy="50" r="10"/>'+Array.from({length:8},(_,k)=>'<path class="ground-fragment" style="--fragment-angle:'+k*45+'deg" d="M46.5 23h7L50 9Z"/>').join(''):'')+'<circle class="mine-impact-wave" cx="50" cy="50" r="32"/>'+(centre?'<circle class="mine-impact-echo" cx="50" cy="50" r="32"/>':'')+(hit?'<path class="mine-impact-cross" d="m35 35 30 30m0-30L35 65"/>':'')+'</svg>';
   cell.append?.(part);decorations.push(part);
   if(hit)cell.animate?.([{filter:'brightness(1)'},{filter:'brightness(1.5)',offset:.3},{filter:'brightness(1)'}],{duration:1200,delay:ground?(centre?0:120):AIRSTRIKE_IMPACT_MS+(centre?0:180),easing:'ease-out'});
  }
 }
 const clearEffects=()=>decorations.forEach(part=>part.remove());
 const timer=decorations.length?(environment.setTimeout?.bind(environment)??setTimeout)(clearEffects,MINE_ANIMATION_MS):null;
 return ()=>{stopBanner?.();if(timer!==null)(environment.clearTimeout?.bind(environment)??clearTimeout)(timer);clearEffects();};
}
