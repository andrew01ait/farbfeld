const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
import {COLS,LABELS,MINE_COST,minesEnabled,canUseMine,mineTargetView,mineBlasts,mineBlastTargets} from './engine.js';
export const MINE_ANIMATION_MS=3000;
export const mineIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2" stroke-linecap="round"/><circle cx="12" cy="12" r="6" fill="currentColor"/><circle cx="10" cy="10" r="1.4" fill="var(--card,#fff)" stroke="none"/></svg>';
export function mineSetupHtml(enabled=false){return '<label class="mine-setup"><input type="checkbox" id="mine-enabled"'+(enabled?' checked':'')+'><span><strong>Minenangriff</strong><small>Einmal je Person · −5 Punkte · trifft alle Gegner.</small></span></label>';}
const mineStateIcons={left:'<path d="m6 6 12 12M18 6 6 18"/>',locked:'<path d="M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5z"/>',ready:'<path d="m5 12 4 4L19 6"/>',used:'<circle cx="12" cy="12" r="9"/><path d="m5 5 14 14"/>'};
export function mineControlsHtml(game,{highlight=false,own=0,available=true}={}){
 if(!minesEnabled(game)||game.status!=='playing')return '';
 const state=pid=>game.players[pid].left?'left':game.mines.used[pid]?'used':game.mines.unlocked[pid]?'ready':'locked',ready=state(own)==='ready',labels={left:'ausgestiegen',locked:'gesperrt – ein Farbabschluss des Gegners schaltet sie frei',ready:'bereit – jetzt freigeschaltet',used:'bereits eingesetzt'};
 const chip=(pid,label)=>'<span class="mine-state mine-state-'+state(pid)+(pid===own&&ready?' mine-ready-badge':'')+'" title="'+esc((pid===own?'Deine Mine: ':game.players[pid].name+': ')+labels[state(pid)])+'" aria-label="'+esc((pid===own?'Deine Mine: ':game.players[pid].name+': ')+labels[state(pid)])+'"><b>'+esc(label)+'</b><svg viewBox="0 0 24 24" aria-hidden="true">'+mineStateIcons[state(pid)]+'</svg></span>';
 return '<section class="mine-controls'+(ready?' mine-ready has-mine-action':'')+(ready&&highlight?' mine-new':'')+'" aria-label="Minenangriff"><span class="mine-feature-icon" aria-hidden="true">'+mineIcon+'</span><div class="mine-state-list">'+[own,...game.players.map((_,i)=>i).filter(i=>i!==own)].map(i=>chip(i,i===own?{left:'Ausgestiegen',locked:'Gesperrt',ready:'Bereit',used:'Verbraucht'}[state(own)]:game.players[i].name)).join('')+'</div>'+(ready?'<button class="primary mine-aim" data-action="mine-aim"'+(available&&canUseMine(game,own)?'':' disabled')+' aria-label="Mine einsetzen, fünf Punkte Einsatz">Zünden · −'+MINE_COST+'</button>':'')+'<button class="mine-help" data-action="mine-help" aria-label="Minen-Regeln anzeigen" title="Minen-Regeln">?</button></section>';
}
export function mineLobbyHtml(enabled,host,action,available=true,missing=[]){return '<section class="hidden-option"><div><strong>Minen '+(enabled?'aktiviert':'ausgeschaltet')+'</strong><p>Einmal je Person · −5 Punkte · ein Zielfeld gegen alle Gegner.</p>'+(!available?'<p class="board-help">'+(missing.length?esc(missing.join(', '))+': ':'')+'Alle Apps benötigen Version 1.17.0 oder neuer.</p>':'')+'</div>'+(host?'<button class="toggle '+(enabled?'on':'')+'" role="switch" aria-label="Minenangriff" aria-checked="'+enabled+'" data-action="'+action+'"'+(available||enabled?'':' disabled')+'></button>':'')+'</section>';}

export function mineHelpHtml(){return '<p>Ein Farbabschluss schaltet die Minen aller anderen frei. Ein Angriff trifft alle Gegner am gewählten Zielfeld; dein Blatt bleibt intakt. Jede Person hat eine Mine für fünf Punkte.</p><ul class="mine-aim-rules"><li>Schloss: noch gesperrt.</li><li>Grünes Häkchen: bereit – vor deinem normalen Zug einsetzen.</li><li>Durchgestrichener Kreis: bereits eingesetzt.</li></ul><p>Auch ein leeres Ziel verbraucht Mine und Einsatz. Bonusfeld-Punkte bleiben erhalten.</p>';}
export function mineTargetHtml(game,target=null,own=0){
 const view=mineTargetView(game,own);if(!view)return '';
 const valid=Number.isInteger(target)&&target>=0&&target<105,col=valid?target%15:null,row=valid?Math.floor(target/15):null;
 return '<p class="mine-aim-instruction"><strong>'+(view.shared?'Wähle ein Zielfeld für alle Gegner.':view.hidden?'Wähle blind ein Feld. Gegnerische Kreuze bleiben verborgen.':'Wähle ein Feld auf dem gegnerischen Blatt.')+'</strong></p>'+
  '<ul class="mine-aim-rules"><li><b>Treffer je Gegner:</b> Zielfeld und 3–5 belegte Nachbarn weg.</li><li><b>Leeres Ziel:</b> kein Schaden, auch nicht an Nachbarn.</li><li><b>Kosten:</b> immer 5 Punkte · einmal pro Partie.</li></ul>'+
  '<details class="mine-rule-details"><summary>Regeln im Detail</summary><p>Nachbarn zählen auch diagonal. Sind weniger belegt, werden nur diese entfernt. Betroffene Spalten-/Farbboni werden neu verteilt; offene Sterne zählen wieder negativ. Bonusfeld-Punkte bleiben erhalten. Dein normaler Zug bleibt frei. Auch ein Fehlschlag verbraucht die Mine und fünf Punkte.</p></details>'+
  '<div class="mine-coordinates"><label for="mine-column">Spalte<select class="outline-btn" id="mine-column"><option value="">Bitte wählen</option>'+[...COLS].map((c,i)=>'<option value="'+i+'"'+(col===i?' selected':'')+'>'+c+'</option>').join('')+'</select></label><label for="mine-row">Zeile<select class="outline-btn" id="mine-row"><option value="">Bitte wählen</option>'+Array.from({length:7},(_,i)=>'<option value="'+i+'"'+(row===i?' selected':'')+'>'+(i+1)+'</option>').join('')+'</select></label></div>'+
  '<p class="direct-note">Spalte und Zeile wählen oder ein Feld antippen.</p><div class="mine-grid" role="group" aria-label="'+(view.hidden||view.shared?'Zielraster ohne gegnerische Kreuze':'Gegnerblatt zur Zielwahl')+'">'+
  [...COLS].map(c=>'<span class="mine-col-label">'+c+'</span>').join('')+
  view.cells.map(cell=>{const coordinate=COLS[cell.index%15]+(Math.floor(cell.index/15)+1);return '<button class="mine-cell'+(cell.marked?' mine-marked':'')+(cell.index===target?' mine-selected':'')+'" style="--cell:var(--'+cell.color+')" data-action="mine-target" data-i="'+cell.index+'" aria-pressed="'+(cell.index===target)+'" aria-label="Ziel '+coordinate+', '+LABELS[cell.color]+(!view.hidden&&cell.marked?', angekreuzt':'')+'">'+(cell.marked?'×':cell.star?'☆':'')+'</button>';}).join('')+'</div>'+
  '<p class="mine-target-label" role="status">'+(valid?'Gewähltes Ziel: '+COLS[col]+(row+1):'Noch kein Ziel gewählt.')+'</p><button class="primary" data-action="mine-confirm"'+(!valid?' disabled':'')+'>'+mineIcon+'Mine zünden · −'+MINE_COST+' P</button><button class="outline-btn" data-action="close-modal">Zurück ohne Einsatz</button>';
}
export function mineDamage(game,pid,own){
 if(!minesEnabled(game)||game.hiddenScores&&game.status!=='finished'&&pid!==own)return null;
 const active=mineBlasts(game).filter(b=>Number.isSafeInteger(b.round)&&game.round>=b.round&&game.round<=b.round+1).flatMap(b=>mineBlastTargets(b).filter(t=>t.pid===pid&&t.cells.length).map(t=>({cells:t.cells,untilRound:b.round+1})));
 return active.length?{cells:[...new Set(active.flatMap(b=>b.cells))],untilRound:Math.max(...active.map(b=>b.untilRound)),attacks:active.length}:null;
}
export function mineDamageHtml(damage){return damage?'<p class="mine-damage-note" role="status"><strong>Minen-Schaden · '+damage.cells.length+' Kreuze entfernt</strong><span>Rot gestrichelt: verlorene Kreuze. Markierungen bleiben je Angriff bis Ende des nächsten Wurfs. Grün gestrichelt: inzwischen neu gefüllt.</span></p>':'';}
export function playMineBlast({by=0,targetPid,targets,ownPid=0}={},environment=globalThis){
 const document=environment.document;if(!document)return;
 document.querySelector('.mine-explosion')?.remove();
 const effect=document.createElement('div');effect.className='mine-explosion';effect.setAttribute('role','status');
 effect.innerHTML='<div class="mine-burst"><span class="mine-boom">'+mineIcon+'</span>'+Array.from({length:8},(_,i)=>'<i style="--angle:'+(i*45)+'deg"></i>').join('')+'<strong>'+(by===ownPid?'Deine Mine':'Gegner-Mine')+'</strong></div>';
 document.body.append(effect);
 const reduced=environment.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 // Put actual visible damage on screen before the slower effect; hidden victim boards are absent.
 document.querySelector('.board .mine-damaged')?.scrollIntoView?.({block:'center',inline:'center',behavior:reduced?'instant':'smooth'});
 if(!reduced)for(const victim of (targets?.map(t=>t.pid)??(Number.isInteger(targetPid)?[targetPid]:[])))for(const cell of document.querySelectorAll?.('[data-player-board="'+victim+'"] .mine-damaged')??[])cell.animate?.([{filter:'brightness(2)',boxShadow:'inset 0 0 0 4px #fff'},{filter:'brightness(1.1)',boxShadow:'inset 0 0 0 3px #a34f3d'},{filter:'brightness(1)',boxShadow:'inset 0 0 0 2px #a34f3d'}],{duration:2800,easing:'ease-out'});
 (environment.setTimeout??setTimeout)(()=>effect.remove(),MINE_ANIMATION_MS);

}
