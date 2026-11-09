import {COLS,LABELS,MINE_COST,minesEnabled,canUseMine,mineTargetView} from './engine.js';
export const mineIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5 2-2m0 3 3 1m-4-5-1-1M12 7l2-2 3 3-2 2"/><circle cx="10" cy="14" r="7"/></svg>';
export function mineSetupHtml(enabled=false){return '<label class="mine-setup"><input type="checkbox" id="mine-enabled"'+(enabled?' checked':'')+'><span><strong>Minenangriff testen</strong><small>Nur gegen den Computer · einmal je Person · 5 Punkte Einsatz. Ein Farbabschluss schaltet die Mine des Gegners frei.</small></span></label>';}
export function mineControlsHtml(game){
 if(!minesEnabled(game)||game.status!=='playing')return '';
 const own=game.mines.used[0]?'bereits eingesetzt':game.mines.unlocked[0]?'freigeschaltet':'wartet auf Farbabschluss des Computers';
 const other=game.mines.used[1]?'eingesetzt':game.mines.unlocked[1]?'freigeschaltet':'noch gesperrt';
 return '<section class="mine-controls" aria-label="Minenangriff"><div><strong>'+mineIcon+'Deine Mine: '+own+'</strong><small>Computer: '+other+' · Zusatzaktion vor deinem normalen Zug.</small></div><button class="outline-btn" data-action="mine-aim"'+(canUseMine(game,0)?'':' disabled')+'>Ziel wählen · −'+MINE_COST+' P</button></section>';
}
export function mineTargetHtml(game,target=null){
 const view=mineTargetView(game,0);if(!view)return '';
 const valid=Number.isInteger(target)&&target>=0&&target<105,col=valid?target%15:null,row=valid?Math.floor(target/15):null;
 return '<p>'+(view.hidden?'Blindes Zielraster: Die Kreuze des Computers bleiben verborgen.':'Wähle ein Ziel auf dem Computerblatt.')+' Ist das Zielfeld leer, passiert nichts – auch nicht in der Umgebung. Der Einsatz von fünf Punkten und deine einzige Mine sind dann trotzdem verbraucht.</p>'+
  '<p>Bei einem Treffer verschwinden das Zielfeld und zufällig drei bis fünf belegte Nachbarfelder, soweit vorhanden, auch diagonal. Betroffene Spalten-/Farbboni entfallen; offene Sterne zählen wieder negativ. Bleibt deine entsprechende Spalte oder Farbe vollständig, erhältst du dafür den vollen Erstbonus. Dein normaler Zug bleibt erhalten.</p>'+
  '<div class="mine-coordinates"><label for="mine-column">Spalte<select class="outline-btn" id="mine-column"><option value="">Bitte wählen</option>'+[...COLS].map((c,i)=>'<option value="'+i+'"'+(col===i?' selected':'')+'>'+c+'</option>').join('')+'</select></label><label for="mine-row">Zeile<select class="outline-btn" id="mine-row"><option value="">Bitte wählen</option>'+Array.from({length:7},(_,i)=>'<option value="'+i+'"'+(row===i?' selected':'')+'>'+(i+1)+'</option>').join('')+'</select></label></div>'+
  '<p class="direct-note">Tippe im Raster oder wähle Spalte und Zeile mit den Auswahlfeldern.</p><div class="mine-grid" role="group" aria-label="'+(view.hidden?'Blindes Zielraster ohne gegnerische Kreuze':'Computerblatt zur Zielwahl')+'">'+
  [...COLS].map(c=>'<span class="mine-col-label">'+c+'</span>').join('')+
  view.cells.map(cell=>{const coordinate=COLS[cell.index%15]+(Math.floor(cell.index/15)+1);return '<button class="mine-cell'+(cell.marked?' mine-marked':'')+(cell.index===target?' mine-selected':'')+'" style="--cell:var(--'+cell.color+')" data-action="mine-target" data-i="'+cell.index+'" aria-pressed="'+(cell.index===target)+'" aria-label="Ziel '+coordinate+', '+LABELS[cell.color]+(!view.hidden&&cell.marked?', angekreuzt':'')+'">'+(cell.marked?'×':cell.star?'☆':'')+'</button>';}).join('')+'</div>'+
  '<p class="mine-target-label" role="status">'+(valid?'Gewähltes Ziel: '+COLS[col]+(row+1):'Noch kein Ziel gewählt.')+'</p><button class="primary" data-action="mine-confirm"'+(!valid?' disabled':'')+'>'+mineIcon+'Mine zünden · −'+MINE_COST+' Punkte</button><button class="outline-btn" data-action="close-modal">Zurück ohne Einsatz</button>';
}
export function playMineBlast({by=0}={},environment=globalThis){
 const document=environment.document;if(!document)return;
 document.querySelector('.mine-explosion')?.remove();
 const effect=document.createElement('div');effect.className='mine-explosion';effect.setAttribute('role','status');
 effect.innerHTML='<div class="mine-burst"><span class="mine-boom">'+mineIcon+'</span>'+Array.from({length:8},(_,i)=>'<i style="--angle:'+(i*45)+'deg"></i>').join('')+'<strong>'+(by===0?'Deine Mine':'Computer-Mine')+'</strong></div>';
 document.body.append(effect);setTimeout(()=>effect.remove(),950);
}
