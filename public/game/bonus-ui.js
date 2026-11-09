import {bonusFieldsEnabled,bonusAwards,BONUS_POINTS} from './bonus-fields.js';
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const gift='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11v10h16V11M3 7h18v4H3zM12 7v14M12 7C5 7 5 1 8 2c3 0 4 5 4 5Zm0 0c7 0 7-6 4-5-3 0-4 5-4 5Z"/></svg>';
const rules='Drei geheime Felder · je +2 Punkte. Erster Trefferwurf gewinnt, bei Gleichstand alle. Minenfest.';
export function bonusSetupHtml(enabled=false){return '<label class="bonus-setup"><input type="checkbox" id="bonus-fields"'+(enabled?' checked':'')+'><span><strong>Bonusfelder</strong><small>'+rules+'</small></span></label>';}
export function bonusOptionHtml(enabled,host,action,available=true,missing=[]){
 return '<section class="bonus-option hidden-option"><div><strong>Bonusfelder '+(enabled?'aktiviert':'ausgeschaltet')+'</strong><p>'+rules+'</p>'+(!available?'<p class="bonus-update-note">'+(missing.length?esc(missing.join(', '))+': ':'')+'Bitte Farbfeld 1.17.0 oder neuer öffnen und den Raum erneut aufrufen.</p>':'')+'</div>'+(host?'<button class="toggle '+(enabled?'on':'')+'" role="switch" aria-label="Bonusfelder" aria-checked="'+enabled+'" data-action="'+action+'"'+(available||enabled?'':' disabled')+'></button>':'')+'</section>';
}
export function bonusAnnouncement(game,award){
 const names=award.winners.map(pid=>game.players[pid]?.name||'Mitspieler').join(' & ');
 return names+(award.winners.length>1?' haben':' hat')+' ein Bonusfeld gefunden'+(game.hiddenScores&&game.status!=='finished'?'':award.winners.length>1?' · je +'+BONUS_POINTS+' Punkte':' · +'+BONUS_POINTS+' Punkte')+'.';
}
export function bonusStatusHtml(game){
 if(!bonusFieldsEnabled(game))return '';
 const awards=bonusAwards(game).sort((a,b)=>a.round-b.round||a.slot-b.slot);
 const latest=awards.at(-1),summary=latest&&(latest.winners.length>2?(latest.winners.length===game.players.length?'Alle '+latest.winners.length+' Personen':latest.winners.length+' Personen')+' haben ein Bonusfeld gefunden'+(game.hiddenScores&&game.status!=='finished'?'':' · je +2 Punkte')+'.':bonusAnnouncement(game,latest));
 return '<section class="bonus-panel" aria-label="Bonusfelder"><div class="bonus-panel-title">'+gift+'<strong>Bonusfelder</strong><span>'+awards.length+' von 3 entdeckt</span></div>'+(awards.length?'<p>'+esc(summary)+'</p><details><summary>Entdeckungen ansehen</summary><ul>'+awards.map(award=>'<li>'+esc(bonusAnnouncement(game,award))+' <small>Wurf '+award.round+'</small></li>').join('')+'</ul></details>':'<p>Drei Felder sind versteckt. Die Entdeckung wird nach allen Zügen des Wurfs bekanntgegeben.</p>')+'</section>';
}
