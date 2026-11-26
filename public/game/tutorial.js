import {MINE_COST,MINE_COVERAGE_CELLS} from './engine.js';
import {setupOptionIcon} from './variant-ui.js';

const setup=(clip,title,options='')=>({
 label:'Start',title:'Vor der Partie einschalten',clip,
 text:'Öffne „Gegen den Computer“ oder die Lobby eures Spielraums. Wähle „'+title+'“ vor dem Start. Im Spielraum stellt der Gastgeber die Regel ein.'+(options?' '+options:''),
});

const lessons=[
 {
  id:'grundspiel',title:'Grundspiel',icon:'columns',heading:'Sammle die meisten Punkte',
  goal:'Fülle Spalten und Farben, decke Sterne ab und setze deine Joker gezielt ein. Im Solo versuchst du, in 30 Würfen möglichst viele Punkte zu erzielen.',
  points:'Volle Spalten bringen die Punkte unter der jeweiligen Spalte. Eine volle Farbe bringt zuerst +5, später +3 Punkte. Jeder unbedeckte Stern kostet 2 Punkte. Jeder übrige Joker bringt 1 Punkt.',
  steps:[
   {label:'Starten',title:'Spielart und Brett wählen',clip:'grund-start',text:'Wähle auf der Startseite „Nur du“, „Gegen den Computer“ oder „Zusammen“. Wähle dann ein Brett. Über „Zusammen“ spielt ihr am selben Handy, direkt im WLAN oder in einem Internet-Spielraum.'},
   {label:'Würfeln',title:'Würfel wählen, Felder verbinden',clip:'grundspiel',text:'Wähle einen Farb- und einen Zahlenwürfel. Setze genau so viele Kreuze in dieser Farbe. Die neuen Felder müssen über Kanten verbunden sein und Spalte H oder ein vorhandenes Kreuz berühren. Tippe auf „Bestätigen“.'},
   {label:'Punkte lesen',title:'Spalten, Farben und Spielende',clip:'grund-wertung',text:'Unter den Spalten stehen Erst- und Folgewert. Die Farbkarten darunter zählen deine Kreuze je Farbe. Im Duell und in der Gruppe endet die Partie nach dem Wurf, in dem jemand seine zweite Farbe voll macht. Die höchste Gesamtpunktzahl gewinnt.'},
  ],
  rules:[
   '✳ steht für eine beliebige Farbe, ? für eine Zahl von 1 bis 5. Jeder Jokerwürfel verbraucht einen Joker. Passen kostet keinen.',
   'Erreichen mehrere Personen im selben Wurf zuerst eine Spalte oder Farbe, erhalten alle den Erstwert. Bei Punktegleichstand gewinnt, wer mehr Joker übrig hat. Herrscht weiter Gleichstand, teilen sie sich den Sieg.',
   'Ab Wurf 4 sind die Würfel der aktiven Person für die anderen gesperrt. Passt sie, bleiben alle Würfel zur Auswahl.',
  ],
 },
 {
  id:'luftangriff',title:'Luftangriff',icon:'mines',heading:'Einen Vorsprung aufholen',
  goal:'Wähle ein Zielfeld, an dem du gegnerische Kreuze entfernen und damit bereits gewertete Spalten oder Farben wieder öffnen kannst.',
  points:'Jeder Einsatz kostet '+MINE_COST+' Punkte, auch bei einem Fehlschlag. Mit beiden Freischaltungen kannst du zweimal angreifen und gibst insgesamt '+(2*MINE_COST)+' Punkte aus.',
  steps:[
   setup('luft-start','Luftangriff','Die Zusatzregel ist in Partien mit 2 bis 6 Personen verfügbar.'),
   {label:'Freigabe',title:'Bereite Angriffe im Panel erkennen',clip:'luft-bereit',text:'Ein gewerteter Farbabschluss eines Gegners und '+MINE_COVERAGE_CELLS+' bestätigte Felder auf einem Gegnerbrett geben dir je einen Angriff frei. Das Panel zeigt „Farbabschluss“ und „'+MINE_COVERAGE_CELLS+' Felder“ mit Schloss, Häkchen oder Verbrauchssymbol.'},
   {label:'Angreifen',title:'Ein Ziel vor deinem Zug bestätigen',clip:'luftangriff',text:'Tippe während deiner Würfelauswahl auf „Ziel wählen“. Wähle im Raster oder über Spalte und Zeile ein Feld, im Clip H4. Bestätige den Einsatz für 5 Punkte. Danach steht dein eigener normaler Zug weiter bereit.'},
   {label:'Schaden',title:'Getroffene Felder und Angriff ansehen',clip:'luft-bericht',text:'Im Panel „Luftangriff“ stehen das eigene Ziel und der bestätigte Schaden. Auf dem sichtbaren Brett zeigen rote gestrichelte Ränder entfernte Kreuze, grüne Ränder wieder angekreuzte Felder.'},
  ],
  rules:[
   'Ein Zielfeld gilt für alle aktiven Gegner. Bei einem Treffer verschwinden das Kreuz am Ziel und bis zu fünf belegte Nachbarfelder.',
   'Jede Freischaltung gilt einmal pro Partie. Für die zweite Freischaltung brauchen alle Geräte in einer neuen Internet- oder Direktpartie Version 1.33.0 oder neuer.',
   'In verdeckten Partien bleiben fremde Kreuze und Trefferzahlen verborgen.',
  ],
 },
 {
  id:'minen',title:'Versteckte Minen',icon:'hiddenMines',heading:'Andere auf deine Fallen locken',
  goal:'Verstecke die Minen vor Spielbeginn auf Feldern, die deine Mitspielenden wahrscheinlich ankreuzen, etwa in der Startspalte H oder neben häufig genutzten Sternen.',
  points:'Auslegen und Auslösen kosten keine Punkte. Der Schaden kann gegnerische Farb- oder Spaltenboni aufheben und Sterne wieder freilegen.',
  steps:[
   setup('minen-start','Versteckte Minen','Bei zwei oder drei Personen legst du zwei Minen, ab vier Personen eine.'),
   {label:'Auslegen',title:'Eigene Minen setzen und bestätigen',clip:'minen-auslegen',text:'Wähle „Mine 1“ und tippe auf ihr Feld. Wähle „Mine 2“, falls vorhanden, und ein anderes Feld. Tippe auf „Minen bestätigen“. Mit Schiffsboni bestätigst du zuerst deine Flotte und legst danach gleich deine Minen aus.'},
   {label:'Auslösen',title:'Ein gegnerisches Minenfeld treffen',clip:'minen',text:'Im Beispiel bestätigt ein Kreuz auf H4 eine Mine des Computers. Der Blitz und das Banner zeigen die Explosion auf deinem Brett. Deine eigenen Minen lösen durch deine Kreuze nicht aus.'},
   {label:'Bericht',title:'Scharfe Minen und Schaden nachsehen',clip:'minen-bericht',text:'Öffne „Versteckte Minen“ über den Pfeil. Du siehst, wie viele eigene Minen noch scharf sind und welche Minen Schaden angerichtet haben. Das Panel nennt die entfernten Kreuze, und das Brett markiert die betroffenen Felder.'},
  ],
  rules:[
   'Jede Mine explodiert einmal. Sie wirkt auf derselben Koordinate auf den Brettern aller aktiven Gegner der Person, die sie gelegt hat. Bei belegtem Zentrum können auch Nachbarfelder getroffen werden.',
   'Bereits bestätigte Schiffs-, Schatz- und Auftragsboni bleiben erhalten. Im verdeckten Spiel bleiben fremde Schadenspositionen verborgen.',
  ],
 },
 {
  id:'schiffe',title:'Schiffsboni',icon:'battleship',heading:'Gegnerische Schiffe versenken',
  goal:'Platziere deine Flotte verdeckt und nutze die Schusskarte, um mit normalen Kreuzen die letzten Felder gegnerischer Schiffe zu treffen.',
  points:'Erst das vollständig versenkte Schiff bringt Punkte. Bei einer Länge von 1, 2, 3, 4 oder 5 Feldern erhältst du entsprechend 5, 4, 3, 2 oder 1 Punkt. Zusammen sind 15 Punkte möglich.',
  steps:[
   setup('schiffe-start','Schiffsboni','Ihr spielt genau zu zweit oder gegen den Computer.'),
   {label:'Auslegen',title:'Flotte vor dem ersten Wurf aufstellen',clip:'schiffe-auslegen',text:'Wähle eine Schiffslänge, stelle die Richtung ein und tippe auf das Startfeld des Schiffs. Alle fünf Schiffe liegen schon auf dem Raster und lassen sich verschieben. Tippe auf „Flotte bestätigen“.'},
   {label:'Karte lesen',title:'Treffer auf der Schusskarte finden',clip:'schiffe-karte',text:'Klappe „Schiffsboni“ auf. Der Kreis zeigt Wasser, das rote Symbol einen Treffer und der Anker ein versenktes Schiff. Buchstaben und Zahlen entsprechen deinem eigenen Brett. Im Clip sind G4 und I4 getroffen, dazwischen liegt H4.'},
   {label:'Versenken',title:'Das letzte Schiffsfeld treffen',clip:'schiffe',text:'Bestätige auf deinem eigenen Brett ein Kreuz auf H4. Das Dreierschiff sinkt auf der Schusskarte und du erhältst 3 Punkte.'},
  ],
  rules:[
   'Du hast je ein Schiff der Längen 1 bis 5. Schiffe dürfen sich berühren. Jedes Schiff braucht eigene Felder.',
   'Jedes neu bestätigte Kreuz schießt auf dieselbe Koordinate auf dem Gegnerbrett. Du setzt die Kreuze auf deinem Brett. In verdeckten Partien bleiben gegnerische Schüsse gegen deine Flotte während der Partie verborgen.',
  ],
 },
 {
  id:'schatzsuche',title:'Schatzsuche',icon:'bonus',heading:'Drei geheime Schätze finden',
  goal:'Folge den letzten Warm- und Kalt-Hinweisen und versuche, die Schätze vor den anderen zu finden.',
  points:'Ein Fund bringt +2 Punkte. Wenn du alle drei selbst findest, kommen +3 hinzu. Insgesamt sind 9 Punkte möglich.',
  steps:[
   setup('schatz-start','Schatzsuche','Die drei Schatzfelder werden beim Start vergeben und bleiben verborgen.'),
   {label:'Spur lesen',title:'Hinweis auf dem Brett nutzen',clip:'schatz-spur',text:'Nach dem Bestätigen steht im Panel zum Beispiel „Heiß: H2“. Öffne das Panel für deine letzten fünf Suchzüge. Heiß bedeutet, dass ein offener Schatz einen senkrechten oder waagrechten Schritt von H2 entfernt liegt. Prüfe die benachbarten Felder und plane dort einen gültigen Zug.'},
   {label:'Schatz finden',title:'Schatz treffen und nächsten Hinweis lesen',clip:'schatzsuche',text:'Im Beispiel trifft das Kreuz auf H1 einen Schatz. Nach der Wurfwertung zeigt das Panel ein Häkchen bei deinem Fund und eine Spur zu fünf Spalten, solange ein weiterer Schatz offen ist.'},
  ],
  rules:[
   'Heiß bedeutet 1 Schritt, warm 2–3, kalt mindestens 4. Gezählt wird waagrecht oder senkrecht. Diagonal sind es zwei Schritte.',
   'Am Ende des Wurfs erhalten alle Personen Punkte, die denselben Schatz im selben ersten Wurf gefunden haben. Gefundene Schätze bleiben auch nach einem Angriff gewertet.',
   'Solo gilt die Grundwertung von 2 Punkten je Fund. Die Suchhinweise und der Kettenbonus gehören zur Schatzsuche gegen den Computer und in gemeinsamen Partien.',
  ],
 },
 {
  id:'auftraege',title:'Öffentliche Aufträge',icon:'objectives',heading:'Gemeinsame Ziele früh erfüllen',
  goal:'Richte deine Würfelwahl auf eine bestimmte Farbe, Sterne oder volle Spalten aus. Behalte dabei die Frist und die fehlenden Felder im Blick.',
  points:'Die erste Erfüllung bringt +5 Punkte, spätere Erfüllungen bringen +2. Wer im gleichen ersten Wurf fertig wird, erhält ebenfalls +5. Bei drei Aufgaben sind bis zu 15 Punkte möglich.',
  steps:[
   setup('auftraege-start','Öffentliche Aufträge','Beim Start werden drei Aufgaben für alle Personen gezogen.'),
   {label:'Auftrag lesen',title:'Fortschritt und Frist prüfen',clip:'auftraege-plan',text:'Klappe „Öffentliche Aufträge“ auf. „5/6 Sterne“ bedeutet, dass dir noch ein Stern fehlt. Im Clip liegt der freie Stern auf H1. Direkt beim Fortschritt steht die restliche Frist.'},
   {label:'Erfüllen',title:'Letztes Feld bestätigen und Bonus erhalten',clip:'auftraege',text:'Bestätige H1. Die Karte zeigt den erfüllten Auftrag. Sobald der gemeinsame Wurf gewertet wird, erscheint die Fahne und der Bonus zählt.'},
  ],
  rules:[
   'Ein Auftrag endet nach Wurf 12, einer nach Wurf 20 und einer mit der Partie. Der angegebene Wurf zählt noch.',
   'Der Zähler zeigt deine bestätigten Kreuze. Ein erfüllter Auftrag bleibt gültig, wenn du später Kreuze verlierst.',
  ],
 },
 {
  id:'entdecken',title:'Entdeckermodus',icon:'discovery',heading:'Fähigkeiten sammeln und einsetzen',
  goal:'Erreiche sichtbare Fundorte vor den anderen. Ihre Fähigkeiten helfen dir später, eine passendere Farbe, Zahl oder ein zusätzliches Feld zu wählen.',
  points:'Fundorte geben keine direkten Punkte. Die Fähigkeit hilft dir, durch bessere Züge Spalten, Farben oder Sterne zu vervollständigen.',
  steps:[
   setup('entdecken-start','Entdeckermodus','Auf dem Brett erscheinen sechs sichtbare Fundorte.'),
   {label:'Einsammeln',title:'Fundort mit einem normalen Zug einnehmen',clip:'entdecken',text:'Kreuze H1 mit dem Fundort-Symbol an und bestätige. Auf deinem Brett erscheint ein Häkchen. Die Karte „Entdeckermodus“ zählt den Fund und zeigt, wie viele Fähigkeiten ab dem nächsten Wurf bereit sind.'},
   {label:'Einsetzen',title:'Bereite Fähigkeit in der Würfelauswahl nutzen',clip:'entdecken-nutzen',text:'Im nächsten Wurf steht die Fähigkeit unter den Würfeln. Im Clip ersetzt „Farbwahl“ die gewürfelte Farbe durch Blau. Wähle die neuen Felder und bestätige den Zug, um die Fähigkeit zu verbrauchen.'},
  ],
  rules:[
   'Wer zuerst bestätigt, erhält den Fundort. Die Fähigkeit wird im nächsten Wurf verfügbar. Pro Zug kannst du eine nutzen.',
   'Farbwahl ersetzt einen Farbwürfel. Zahl ±1 passt die Zahl innerhalb 1–5 an. Zusatzfeld ergänzt ein freies Feld, das direkt an deine neue Feldgruppe grenzt.',
  ],
 },
 {
  id:'mischen',title:'Farben neu mischen',icon:'shuffle',heading:'Nach der Mischung neue Wege finden',
  goal:'Nutze die neu angeordneten freien Farbfelder, um nach jeweils fünf Würfen neue Verbindungen für deine Züge zu finden.',
  points:'Das Mischen gibt keine direkten Punkte. Die neue Anordnung kann dir helfen, weitere Spalten, Farben oder Sterne zu vervollständigen.',
  steps:[
   setup('mischen-start','Farben neu mischen','Die Regel läuft automatisch, sobald die Partie begonnen hat.'),
   {label:'Termin lesen',title:'Im Panel auf die nächste Mischung achten',clip:'mischen-termin',text:'„In 1 Runde · nach Runde 5“ zeigt dir, dass nach diesem Wurf die freien Farben neu verteilt werden. Ab Wurf 6 steht im selben Panel „Zuletzt nach Runde 5“ und der nächste Termin.'},
   {label:'Brett prüfen',title:'Neue freie Gruppen nach der Mischung finden',clip:'mischen',text:'Die geänderten freien Felder leuchten auf. Deine Kreuze und ihre Farben bleiben an ihren bisherigen Stellen. Prüfe die neu entstandenen Farbgruppen für den nächsten Zug.'},
  ],
  rules:[
   'Nach jedem fünften Wurf werden gemeinsam gewertete Bretter gemischt, solange die Partie läuft.',
   'Die Anzahl je Farbe bleibt gleich. Freie Gruppen wechseln als zusammenhängende Gruppen ihre Plätze.',
  ],
 },
];

const playIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5v14l11-7z"/></svg>';

export function tutorialHTML(selected){
 const lesson=lessons.find(item=>item.id===selected)??lessons[0];
 const options=lessons.map(({id,title})=>'<option value="'+id+'"'+(id===lesson.id?' selected':'')+'>'+title+'</option>').join('');
 const navigation=lessons.map(({id,title,icon})=>'<button type="button" data-tutorial-topic="'+id+'" aria-pressed="'+(id===lesson.id)+'">'+setupOptionIcon(icon)+title+'</button>').join('');
 return '<div class="tutorial"><nav class="tutorial-nav" aria-label="Themen der Spielanleitung">'+
  '<label for="tutorial-topic">Thema wählen</label><select id="tutorial-topic">'+options+'</select><div class="tutorial-topics">'+navigation+'</div></nav>'+
  '<section class="tutorial-lesson" aria-labelledby="tutorial-heading">'+lessonHTML(lesson)+'</section>'+
  '<button type="button" class="text-btn tutorial-details" data-action="rules-detail">Grundregeln im Detail</button></div>';
}

function lessonHTML(lesson){
 return '<h3 id="tutorial-heading">'+lesson.heading+'</h3><p class="tutorial-intro">'+lesson.goal+'</p>'+
  '<ol class="tutorial-steps" aria-label="Schritte">'+lesson.steps.map(({label},index)=>'<li><button type="button" data-tutorial-step="'+index+'" aria-controls="tutorial-step-content"'+(index===0?' aria-current="step"':'')+'><span>'+(index+1)+'</span>'+label+'</button></li>').join('')+'</ol>'+
  '<div class="tutorial-step-layout"><section id="tutorial-step-content" aria-labelledby="tutorial-step-title">'+stepHTML(lesson,0)+'</section>'+
  '<aside class="tutorial-info" aria-label="Wertung und Regeln"><section class="tutorial-points" aria-labelledby="tutorial-points-title">'+setupOptionIcon('result')+'<div><h4 id="tutorial-points-title">So zählen die Punkte</h4><p>'+lesson.points+'</p></div></section>'+
  '<details class="tutorial-rules"><summary>Regeln im Überblick</summary><ul>'+lesson.rules.map(rule=>'<li>'+rule+'</li>').join('')+'</ul></details></aside></div>';
}

function stepHTML(lesson,index){
 const step=lesson.steps[index],path='/game/tutorial/'+step.clip;
 return '<h4 id="tutorial-step-title" tabindex="-1">'+step.title+'</h4>'+
  '<figure><div class="tutorial-media"><video playsinline preload="metadata" poster="'+path+'.jpg" data-clip="'+path+'.mp4" aria-label="Spielclip – '+step.title+'" aria-describedby="tutorial-caption"></video>'+
  '<button class="tutorial-play" type="button" aria-label="Spielclip abspielen" disabled>'+playIcon+'</button></div>'+
  '<figcaption id="tutorial-caption">'+step.text+'</figcaption><p data-clip-error hidden role="status">Der Spielclip ist gerade nicht verfügbar.</p></figure>'+
  (index+1<lesson.steps.length?'<button type="button" class="outline-btn tutorial-next" data-tutorial-step="'+(index+1)+'" data-tutorial-next aria-label="Weiter: '+lesson.steps[index+1].title+'">Weiter</button>':'');
}

export function mountTutorial(root){
 const controller=new AbortController(),options={signal:controller.signal};
 const select=root.querySelector('#tutorial-topic'),article=root.querySelector('.tutorial-lesson');
 let lesson=lessons.find(item=>item.id===select.value),index=0,cleanup=loadClip(article);
 function chooseTopic(id){
  const next=lessons.find(item=>item.id===id);
  if(!next||next===lesson)return;
  cleanup();
  lesson=next;index=0;select.value=id;
  root.querySelectorAll('[data-tutorial-topic]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.tutorialTopic===id)));
  article.innerHTML=lessonHTML(lesson);
  cleanup=loadClip(article);
  root.scrollTop=0;
 }
 root.addEventListener('click',event=>{
  const button=event.target.closest('button');
  if(!button)return;
  if(button.dataset.tutorialTopic){chooseTopic(button.dataset.tutorialTopic);return;}
  if(button.dataset.tutorialStep===undefined)return;
  const next=Number(button.dataset.tutorialStep);
  if(next===index||!lesson.steps[next])return;
  cleanup();
  index=next;
  article.querySelectorAll('.tutorial-steps button').forEach(item=>{
   if(Number(item.dataset.tutorialStep)===index)item.setAttribute('aria-current','step');
   else item.removeAttribute('aria-current');
  });
  article.querySelector('#tutorial-step-content').innerHTML=stepHTML(lesson,index);
  cleanup=loadClip(article);
  if(button.hasAttribute('data-tutorial-next'))article.querySelector('#tutorial-step-title').focus();
 },options);
 select.addEventListener('change',()=>chooseTopic(select.value),options);
 return ()=>{controller.abort();cleanup();};
}

function loadClip(root){
 const video=root.querySelector('video[data-clip]'),play=root.querySelector('.tutorial-play'),controller=new AbortController();
 const options={signal:controller.signal};
 let source;
 const showError=()=>{play.disabled=true;root.querySelector('[data-clip-error]').hidden=false;};
 video.addEventListener('error',showError,options);
 video.addEventListener('loadedmetadata',()=>{play.disabled=false;},{...options,once:true});
 play.addEventListener('click',()=>{
  video.controls=true;play.hidden=true;video.focus({preventScroll:true});
  video.play().catch(()=>{if(video.error&&!controller.signal.aborted)showError();});
 },options);
 // Read a complete file from the offline cache before native playback seeks within it.
 fetch(video.dataset.clip,options).then(async response=>{
  if(!response.ok||!response.headers.get('Content-Type')?.includes('video/mp4'))throw Error('Spielclip fehlt');
  const clip=await response.blob();
  if(controller.signal.aborted)return;
  source=URL.createObjectURL(clip);
  video.src=source;
 }).catch(()=>{
  if(!controller.signal.aborted)showError();
 });
 return ()=>{
  controller.abort();video.pause();video.removeAttribute('src');video.load();
  if(source)URL.revokeObjectURL(source);
 };
}
