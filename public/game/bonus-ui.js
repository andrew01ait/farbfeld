import {setupOptionHTML,setupOptionIcon,featureHeading} from './variant-ui.js';
import {bonusFieldsEnabled,bonusAwards,bonusPoints,BONUS_POINTS,treasureHuntView} from './bonus-fields.js';
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const gift='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11v10h16V11M3 7h18v4H3zM12 7v14M12 7C5 7 5 1 8 2c3 0 4 5 4 5Zm0 0c7 0 7-6 4-5-3 0-4 5-4 5Z"/></svg>';
const rules='Drei geheime Felder · je +2 Punkte. Erster Trefferwurf gewinnt, bei Gleichstand alle. Angriffssicher.';
const huntRules='Drei versteckte Schätze · Warm/kalt nach deinem Zug · ein Fund zeigt die nächste Spur. Alle drei eigenen Funde: Kettenbonus.';
export function bonusSetupHtml(enabled=false,{treasureHunt=false}={}){return setupOptionHTML({id:'bonus-fields',type:'bonus',title:'Schatzsuche',description:treasureHunt?huntRules:rules,checked:enabled,className:'bonus-setup'});}
export function bonusOptionHtml(enabled,host,action,available=true,missing=[],paired=true){
 return '<section class="bonus-option hidden-option"><span class="setup-icon" aria-hidden="true">'+setupOptionIcon('bonus')+'</span><div class="setup-copy"><strong>Schatzsuche '+(enabled?'aktiviert':'ausgeschaltet')+'</strong><p>'+huntRules+'</p>'+(!available&&paired?'<p class="bonus-update-note">'+(missing.length?esc(missing.join(', '))+' · ':'')+'Bitte Farbfeld 1.25.0 oder neuer öffnen und den Raum erneut aufrufen.</p>':'')+'</div>'+(host?'<button class="toggle '+(enabled?'on':'')+'" role="switch" aria-label="Schatzsuche" aria-checked="'+enabled+'" data-action="'+action+'"'+(available||enabled?'':' disabled')+'></button>':'')+'</section>';
}
function awardView(game,award,compact=false){
 const names=compact&&award.winners.length>2?(award.winners.length===game.players.length?'Alle '+award.winners.length:award.winners.length+' Personen'):award.winners.map(pid=>game.players[pid]?.name||'Mitspieler').join(' & ');
 const points=game.hiddenScores&&game.status!=='finished'?'':(award.winners.length>1?'je ':'')+'+'+BONUS_POINTS;
 return {names,points};
}
export function bonusAnnouncement(game,award){
 const {names,points}=awardView(game,award);return names+(points?' · '+points:'');
}
export function bonusStatusHtml(game,{own=0}={}){
 if(!bonusFieldsEnabled(game))return '';
 if(treasureHuntView(game,own))return treasureStatusHtml(game,own);
 const awards=bonusAwards(game).sort((a,b)=>a.round-b.round||a.slot-b.slot),latest=awards.at(-1),view=latest&&awardView(game,latest,true),reward=game.hiddenScores&&game.status!=='finished'?null:'+'+bonusPoints(game,own);
 const detail=awards.length+'/3 entdeckt'+(view?' · '+view.names:' · Noch unentdeckt'),heading=featureHeading('bonus','Schatzsuche',detail,{reward,fold:!!latest});
 return '<section class="bonus-panel" aria-label="Schatzsuche">'+(latest?'<details><summary class="bonus-summary feature-summary has-history" aria-label="'+esc('Schatzsuche: '+(reward===null?'':reward+' Punkte. ')+awards.length+' von 3 entdeckt. Verlauf anzeigen')+'">'+heading+'</summary><ol class="bonus-history" aria-label="Schatzverlauf">'+awards.map(award=>{const item=awardView(game,award);return '<li><small aria-label="Wurf '+award.round+'">W'+award.round+'</small><span class="bonus-history-names">'+esc(item.names)+'</span>'+(item.points?'<b class="bonus-reward">'+esc(item.points)+'</b>':'')+'</li>';}).join('')+'</ol></details>':'<div class="bonus-summary feature-summary">'+heading+'</div>')+'</section>';
}

const warmthNames={cold:'Kalt',warm:'Warm',hot:'Heiß'};
const bands=['links · Spalten A–E','in der Mitte · Spalten F–J','rechts · Spalten K–O'];
const coordinate=i=>String.fromCharCode(65+i%15)+(Math.floor(i/15)+1);
const searchCoordinates=(cells,compact=false)=>{const labels=cells.map(coordinate);return compact&&labels.length>2?labels.slice(0,2).join(', ')+' +'+(labels.length-2):labels.join(', ');};
function treasureReadingHtml(r){
 const references=r.focus?.length?r.focus:r.cells;
 return '<li class="treasure-reading"><span class="treasure-temperature"'+(r.warmth?' data-warmth="'+r.warmth+'"':'')+'>'+esc(r.warmth?warmthNames[r.warmth]+': '+searchCoordinates(references):r.found?'Schatz berührt':'Keine offene Spur')+'</span><span>Suchzug W'+r.round+' · '+r.cells.map(coordinate).join(', ')+(r.found&&r.warmth?' · Schatz berührt':'')+'</span></li>';
}
function treasureStatusHtml(game,own){
 const view=treasureHuntView(game,own);if(!view)return '';
 const concealed=game.hiddenScores&&game.status!=='finished',reward=concealed?null:'+'+bonusPoints(game,own),r=view.reading;
 const references=r?.focus?.length?r.focus:r?.cells||[],temperature=r?.warmth?warmthNames[r.warmth]+': '+searchCoordinates(references,true):'';
 const signal=!view.remaining?'Suche beendet':r?.found&&r.round===game.round&&game.submitted?.includes(own)?'Fund · '+searchCoordinates(r.cells,true):temperature||'Hinweis nach Zug';
 const detail=view.found+'/3 eigene · '+signal;
 const steps=view.treasures.map(t=>{
  const title='Schatz '+(t.slot+1),names=t.winners.map(pid=>game.players[pid]?.name||'Mitspieler').join(' & '),state=t.state==='earned'?'Dein Fund':t.state==='taken'?'Vergeben':'Noch offen';
  return '<span class="treasure-step '+t.state+'" role="listitem"'+(t.state!=='open'?' aria-disabled="true"':'')+' aria-label="'+esc(title+': '+state+(t.state==='taken'?' an '+names:'')+(t.round?' in Wurf '+t.round:''))+'"><span class="treasure-step-title"><span aria-hidden="true">'+(t.state==='earned'?'✓':t.state==='taken'?'×':'◇')+'</span> '+(t.state==='taken'?'<s>'+title+'</s>':title)+'</span><small>'+esc(t.state==='taken'?names:state)+'</small></span>';
 }).join('');
 const reading=view.history.length?'<section class="treasure-search-history" aria-label="Deine letzten fünf Suchzüge"><h3>Deine letzten 5 Suchzüge</h3><ol class="treasure-readings">'+[...view.history].reverse().map(treasureReadingHtml).join('')+'</ol><p class="treasure-history-note">Hinweise gelten für die beim jeweiligen Zug noch offenen Schätze.</p></section>':'';
 const legend=view.history.length||view.remaining?'<p class="treasure-scale"><strong>Heiß: 1 Schritt</strong> · Warm: 2–3 · Kalt: ab 4<br><span>Von den Suchfeldern zählt der kürzeste Weg zum nächsten offenen Schatz, waagrecht oder senkrecht. Diagonal zählt zwei Schritte.</span></p>':'';
 const clue=view.clue&&view.remaining?'<p class="treasure-clue"><b>Nächste Spur:</b> Ein unentdeckter Schatz liegt '+bands[view.clue.band]+'.</p>':'';
 const chain=view.chainReward?(view.found===3?'Schatzkette vollendet'+(concealed?'!':' · +'+view.chainReward+' P zusätzlich!'):view.remaining===0?'Alle Schätze vergeben. Deine Funde bleiben erhalten.':view.treasures.some(t=>t.state==='taken')?'Kettenbonus nicht mehr erreichbar. Deine Funde bleiben erhalten.':'Sammle alle drei Schätze selbst'+(concealed?' für den Kettenbonus.':' für +'+view.chainReward+' P zusätzlich.')):view.remaining===0?'Alle Schätze vergeben. Deine Funde bleiben erhalten.':view.remaining+' '+(view.remaining===1?'Schatz noch offen.':'Schätze noch offen.');
 const awards=bonusAwards(game).sort((a,b)=>a.round-b.round||a.slot-b.slot);
 const history=awards.length?'<ol class="bonus-history" aria-label="Schatzverlauf">'+awards.map(a=>{const v=awardView(game,a);return '<li><small aria-label="Wurf '+a.round+'">W'+a.round+'</small><span class="bonus-history-names">'+esc(v.names)+'</span>'+(v.points?'<b class="bonus-reward">'+esc(v.points)+'</b>':'')+'</li>';}).join('')+'</ol>':'';
 return '<section class="bonus-panel treasure-panel" aria-label="Schatzsuche"><details><summary class="bonus-summary feature-summary has-history" aria-label="'+esc('Schatzsuche: '+(reward===null?'':reward+' Punkte. ')+detail+'. Hinweise und Verlauf anzeigen')+'">'+featureHeading('bonus','Schatzsuche',detail,{reward,fold:true})+'</summary><div class="treasure-details"><div class="treasure-chain" role="list" aria-label="'+view.found+' eigene Funde, '+view.remaining+' Schätze noch offen">'+steps+'</div><p class="treasure-chain-reward">'+chain+'</p>'+clue+reading+(!r&&view.remaining?'<p>Bestätige deinen Zug: Die Nähe deiner neuen Kreuze zu einem offenen Schatz wird gemessen.</p>':'')+legend+'</div>'+history+'</details></section>';
}
export function bonusHelpHtml(game,own=0){
 const view=treasureHuntView(game,own),chain=!!view?.chainReward;
 return (view?'<p>'+(chain?huntRules:'Drei versteckte Schätze · Warm/kalt nach deinem Zug · ein Fund zeigt die nächste Spur.')+'</p><p>Jeder Schatz bringt +2 Punkte. '+(chain?'Wer alle drei selbst findet, erhält einmalig +3 Punkte zusätzlich (insgesamt 9).':'Diese Partie behält ihre bisherige Punktewertung.')+' Alle, die einen Schatz im selben ersten Wurf finden, erhalten die Punkte.</p><p>Die Temperatur bezieht sich auf deine neu bestätigten Kreuze und den nächsten noch verfügbaren Schatz. <b>Heiß</b> = ein Schritt, <b>Warm</b> = zwei bis drei Schritte, <b>Kalt</b> = mindestens vier. Schritte zählen waagrecht oder senkrecht. Ein Fund liefert nach der Wurfwertung eine Spur zu fünf Spalten. Unbestätigte Auswahlen liefern keine Hinweise.</p><p>Die Karte behält deine letzten fünf Suchzüge mit Feldern und damaliger Temperatur. Eigene Funde haben ein Häkchen. Von anderen gefundene Schätze werden durchgestrichen.</p>':'<p>'+rules+'</p>')+'<p>Die genauen Positionen bleiben geheim. Bestätigte Treffer werden nach allen Auswahlen des Wurfs gemeinsam gewertet. Bereits erhaltene Bonuspunkte bleiben auch nach einem Luftangriff oder einer Minenexplosion erhalten.</p>';
}
export function treasureMoveAnnouncement(game,own){
 const view=treasureHuntView(game,own),r=view?.reading;
 if(!r||!view.remaining||!r.found&&!r.warmth)return '';
 return 'Schatzsuche · '+(r.found?'Schatz berührt. Wertung am Wurfende.':warmthNames[r.warmth]+'. Abstand von deinen neuen Kreuzen.');
}
