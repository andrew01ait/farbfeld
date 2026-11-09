import {bonusFieldsEnabled,bonusAwards,BONUS_POINTS} from './bonus-fields.js';
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const gift='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11v10h16V11M3 7h18v4H3zM12 7v14M12 7C5 7 5 1 8 2c3 0 4 5 4 5Zm0 0c7 0 7-6 4-5-3 0-4 5-4 5Z"/></svg>';
const rules='Drei geheime Felder · je +2 Punkte. Erster Trefferwurf gewinnt, bei Gleichstand alle. Minenfest.';
export function bonusSetupHtml(enabled=false){return '<label class="bonus-setup"><input type="checkbox" id="bonus-fields"'+(enabled?' checked':'')+'><span><strong>Bonusfelder</strong><small>'+rules+'</small></span></label>';}
export function bonusOptionHtml(enabled,host,action,available=true,missing=[]){
 return '<section class="bonus-option hidden-option"><div><strong>Bonusfelder '+(enabled?'aktiviert':'ausgeschaltet')+'</strong><p>'+rules+'</p>'+(!available?'<p class="bonus-update-note">'+(missing.length?esc(missing.join(', '))+': ':'')+'Bitte Farbfeld 1.17.0 oder neuer öffnen und den Raum erneut aufrufen.</p>':'')+'</div>'+(host?'<button class="toggle '+(enabled?'on':'')+'" role="switch" aria-label="Bonusfelder" aria-checked="'+enabled+'" data-action="'+action+'"'+(available||enabled?'':' disabled')+'></button>':'')+'</section>';
}
function awardView(game,award,compact=false){
 const names=compact&&award.winners.length>2?(award.winners.length===game.players.length?'Alle '+award.winners.length:award.winners.length+' Personen'):award.winners.map(pid=>game.players[pid]?.name||'Mitspieler').join(' & ');
 const points=game.hiddenScores&&game.status!=='finished'?'':(award.winners.length>1?'je ':'')+'+'+BONUS_POINTS;
 return {names,points};
}
export function bonusAnnouncement(game,award){
 const {names,points}=awardView(game,award);return names+(points?' · '+points:'');
}
export function bonusStatusHtml(game){
 if(!bonusFieldsEnabled(game))return '';
 const awards=bonusAwards(game).sort((a,b)=>a.round-b.round||a.slot-b.slot),latest=awards.at(-1),view=latest&&awardView(game,latest,true);
 const count='<span class="bonus-count" aria-label="'+awards.length+' von 3 Bonusfeldern entdeckt">'+awards.length+'/3</span>';
 const icon='<span class="status-icon" aria-hidden="true">'+gift+'</span>';
 const heading=icon+'<span class="bonus-copy"><strong>Bonusfelder</strong><span class="bonus-latest">'+(view?'<span class="bonus-winners">'+esc(view.names)+'</span>'+(view.points?'<span class="bonus-divider" aria-hidden="true">·</span><b class="bonus-reward">'+esc(view.points)+'</b>':''):'<span class="bonus-winners">Noch unentdeckt</span>')+'</span></span>'+count;
 return '<section class="bonus-panel" aria-label="Bonusfelder">'+(latest?'<details><summary class="bonus-summary has-history" aria-label="Bonusfelder: '+awards.length+' von 3 entdeckt. Verlauf anzeigen">'+heading+'<svg class="bonus-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary><ol class="bonus-history" aria-label="Bonusverlauf">'+awards.map(award=>{const item=awardView(game,award);return '<li><small aria-label="Wurf '+award.round+'">W'+award.round+'</small><span class="bonus-history-names">'+esc(item.names)+'</span>'+(item.points?'<b class="bonus-reward">'+esc(item.points)+'</b>':'')+'</li>';}).join('')+'</ol></details>':'<div class="bonus-summary">'+heading+'</div>')+'</section>';
}
