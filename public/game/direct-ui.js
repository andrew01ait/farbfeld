import {QrScanner,qrSvg,decodeQrText} from './qr.js';
import {validateHandshake} from './direct-connection.js';
import {inspectOfflineSetup,offlineCheckReport} from './direct-check.js';
function downloadDiagnostic(filename,text){const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const directStatus=session=>{
  if(session.manager?.storageFailed)return 'Speichern nicht möglich · Partie pausiert';
  const members=session.snapshot?.members||[],online=session.online||[];
  if(session.ready)return 'Direkt verbunden · '+members.length+'/'+members.length+' Handys';
  if(session.status==='preparing')return 'Lokale Verbindungsdaten werden gesammelt …';
  if(session.status==='connecting')return 'Direktverbindung wird aufgebaut …';
  if(online.length>1){const missing=members.filter((_,i)=>!online.includes(i)).map((m,i)=>m.name||'weiteres Handy').join(', ');return online.length+'/'+members.length+' Handys verbunden · '+(missing?'Warte auf '+missing:'Abgleich läuft …');}
  if(session.status==='connected')return 'Spielstand wird abgeglichen …';
  if(['failed','disconnected','stalled','closed'].includes(session.status))return 'Verbindung unterbrochen · Partie pausiert';
  return session.pairing?'Einmalige Kopplung läuft':'Noch nicht verbunden · Partie pausiert';
};
export class DirectUi{
  constructor(session,{modal,close,toast,enter,name=()=>'',discard=()=>{},offlineInfo=()=>({}),inspect=inspectOfflineSetup,renderQr=qrSvg,download=downloadDiagnostic}){
    this.downloadDiagnostic=download;this.session=session;this.modal=modal;this.close=close;this.toast=toast;this.enter=enter;this.defaultName=name;
    this.scanner=new QrScanner();this.timer=null;this.view='';this.name='';this.roomName='';this.index=0;this.shownPair=null;this.busy=false;this.revision=0;this.discard=discard;this.offlineInfo=offlineInfo;this.inspect=inspect;this.renderQr=renderQr;this.checkController=null;this.checkResult=null;
    document.addEventListener('visibilitychange',()=>{if(document.hidden)this.stop();});
    window.addEventListener('pagehide',()=>this.stop());
  }
  stop(){this.checkController?.abort();this.checkController=null;this.scanner.stop();clearInterval(this.timer);this.timer=null;const status=document.querySelector('#scan-status');if(status)status.textContent='Kamera angehalten. Zum Fortsetzen „Kamera starten“ wählen.';}
  cancelUi(){this.revision++;this.busy=false;this.view='';this.shownPair=null;this.stop();}
  open(title,html,panel){this.stop();this.modal(title,html+(panel==='direct-diagnostics'?'':'<button class="text-btn" data-action="direct-diagnostics">Offline-Testprotokoll</button><button class="outline-btn danger-btn direct-discard" data-action="direct-discard">Direktpartie abbrechen</button>'),panel);}
  entry(preserveName=false){
    this.view='setup';if(!preserveName){this.name=this.session.saved?.name||this.session.snapshot?.members[this.session.pid]?.name||this.defaultName();this.roomName=this.session.snapshot?.roomName||'';}
    this.open('Offline – mehrere Handys',this.instructions()+'<label for="direct-name">Dein Name</label><input id="direct-name" maxlength="24" autocomplete="given-name" placeholder="z. B. Robin" value="'+esc(this.name)+'"><label for="direct-room-name">Name der Direktpartie <small>(optional)</small></label><input id="direct-room-name" maxlength="48" placeholder="z. B. Unsere Würfelrunde" value="'+esc(this.roomName)+'"><button class="primary" data-action="direct-create">Spiel erstellen</button><button class="outline-btn" data-action="direct-join">Beitreten</button><button class="text-btn" data-action="direct-create-with-code">Mit Internet: Spiel mit Kopplungscode erstellen</button>'+(this.session.saved?'<button class="outline-btn" data-action="direct-resume">Gespeicherte Direktpartie fortsetzen</button>':'')+'<p class="direct-note">Der bestehende Internet-Spielraum bleibt ein eigener Modus. Hier fließen Spielzüge nach der Kopplung direkt zwischen euren Handys. Bis zu sechs Personen können mitspielen.</p>','direct-setup');
  }
  instructions(){return '<div class="direct-instructions"><b>1. WLAN oder Handy-Hotspot</b><p>Alle Handys ins gleiche WLAN bringen. Oder auf einem Handy einen Hotspot aktivieren und die anderen damit verbinden. Mobile Daten können dabei ausgeschaltet bleiben.</p><button class="network-help" data-action="direct-network-help">Hotspot einrichten – so geht’s</button><b>2. Farbfeld auf allen Handys öffnen</b><p>Alle Apps vorher einmal online laden, bis „Offline bereit“ erscheint. Dann klappt auch der Start ohne Internet.</p><b>3. Einmal koppeln, dann spielen</b><p>Der Gastgeber koppelt jedes weitere Handy einmal: Angebot scannen, Antwort zurückscannen. Bis zu sechs Personen spielen mit. Danach werden Würfe, Züge und Punkte automatisch übertragen. Alle Apps während der Partie offen lassen.</p><button class="network-help" data-action="direct-check">Offline-Verbindung prüfen</button></div>';}
  readName(){return document.querySelector('#direct-name')?.value.trim().slice(0,24)||this.name||'Person 2';}
  readRoomName(){return document.querySelector('#direct-room-name')?.value??this.roomName??'';}
  networkHelp(){
    this.networkReturn=this.view==='join'?'join':'setup';this.name=this.readName();this.roomName=this.readRoomName();this.view='network';
    this.open('Ein Handy macht das WLAN.', '<p>Farbfeld kann WLAN und Hotspot nicht selbst einschalten. Du richtest die Verbindung einmal in Android ein.</p><div class="rule"><span class="rule-number">1</span><div><h3>Erstes Handy: Hotspot aktivieren</h3><p>Ziehe die Schnelleinstellungen von oben herunter und halte „Hotspot“ gedrückt. Alternativ in den Android-Einstellungen nach „Hotspot“ suchen. Schalte den persönlichen WLAN-Hotspot ein und merke dir Netzname und Passwort.</p></div></div><div class="rule"><span class="rule-number">2</span><div><h3>Weitere Handys: damit verbinden</h3><p>Öffne die WLAN-Liste, wähle den Hotspot-Namen des ersten Handys und gib dessen Passwort ein. Bei „Kein Internet“ bestätige gegebenenfalls, dass du trotzdem verbunden bleiben möchtest.</p></div></div><div class="rule"><span class="rule-number">3</span><div><h3>Zurück in Farbfeld</h3><p>Alle öffnen Farbfeld. Eine Person erstellt das Spiel, die anderen treten bei. Der Gastgeber tauscht mit jedem Handy einmal Angebot und Antwort per QR aus und wählt danach „Weitere Person einladen“. Während der Partie ist kein weiteres Scannen nötig.</p></div></div><div class="info-box">Habt ihr schon einen WLAN-Router, verbindet einfach alle Handys damit. Ein Gäste-WLAN kann direkte Verbindungen zwischen Geräten sperren.</div><button class="primary" data-action="direct-network-back">Zurück zur Kopplung</button>','direct-network');
  }
  joinEntry(message=''){
    this.view='join';
    this.open('Der Direktpartie beitreten',this.instructions()+(message?'<div class="info-box">'+esc(message)+'</div>':'')+'<label for="direct-name">Dein Name</label><input id="direct-name" maxlength="24" value="'+esc(this.name||this.defaultName())+'"><button class="primary" data-action="direct-scan-offer">Angebots-QR scannen</button><div class="direct-divider">Alternativ · nur für die Kopplung mit Internet</div><label for="direct-code">Kurzer Raumcode</label><input id="direct-code" class="code-input" maxlength="8" autocapitalize="characters" autocomplete="off" placeholder="8 Zeichen"><button class="outline-btn" data-action="direct-join-code">Mit Raumcode koppeln</button><p class="direct-note">Auch beim Raumcode müssen alle im selben WLAN/Hotspot sein. Nach „Direkt verbunden“ wird das Internet nicht mehr gebraucht.</p>','direct-join');
  }
  wait(message='Verbindung wird vorbereitet …'){
    this.view='busy';this.open('Ein kurzer Moment.', '<div class="pair-wait"><span class="pair-spinner" aria-hidden="true"></span><p>'+esc(message)+'</p><p class="direct-note">Der Browser sammelt lokale Netzwerkadressen, höchstens 20 Sekunden. Erst danach erscheint der QR-Code. Dafür brauchst du keine Kamera-Freigabe.</p></div><button class="outline-btn" data-action="direct-check">Offline-Verbindung prüfen</button><button class="outline-btn" data-action="direct-cancel">Zur Partie</button>','direct-wait');
  }
  sync(){
    if(this.view==='diagnostics'){const data=this.session.diagnostics?.state(),el=document.querySelector('#diagnostic-live-state');if(el&&data)el.textContent=(data.enabled?'Aufzeichnung läuft':'Aufzeichnung beendet')+' · '+data.events.length+' Einträge';return;}
    if(this.session.status==='failed'&&this.session.pairingError&&this.view==='busy'){this.failure(this.session.pairingError);return;}
    if(this.session.pairingComplete||this.session.ready){
      if(['pair','scan','busy','waiting'].includes(this.view)&&document.querySelector('#dialog')?.open&&document.querySelector('#dialog')?.dataset.panel.startsWith('direct-')){this.close();this.view='';this.enter();}
      return;
    }
    if(this.session.pairing&&!this.session.pairing.viaCode&&this.session.pairing!==this.shownPair&&['busy','pair'].includes(this.view))this.showPair();
    const status=document.querySelector('#direct-live-status');if(status)status.textContent=directStatus(this.session);
    const error=document.querySelector('#direct-code-error');if(error&&this.session.pairing)error.textContent=this.session.pairing.error||'';
    const code=document.querySelector('#direct-created-code');
    if(code&&this.session.pairing?.code){code.hidden=false;code.querySelector('b').textContent=this.session.pairing.code;}
  }
  showPair(){
    const pair=this.session.pairing;if(!pair){this.entry();return;}
    this.view='pair';this.shownPair=pair;this.index=0;
    const offer=pair.kind==='offer',member=this.session.snapshot?.members[pair.pid],target=member?.name||'Person '+((pair.pid??1)+1);
    this.open(offer?'Einladung für '+target+'.':'Antwort zeigen.','<p>'+(offer?'Auf dem eingeladenen Handy „Beitreten“ und „Angebots-QR scannen“ wählen. Danach hier die Antwort scannen. Diese Einladung gilt für genau eine Person. Weitere Personen lädst du anschließend in der Lobby ein.':'Der Gastgeber scannt jetzt diese Antwort. Danach wird automatisch verbunden.')+'</p><div class="pair-qr" id="pair-qr" aria-label="'+(offer?'Angebots-QR':'Antwort-QR')+'"></div><div class="pair-frame" '+(pair.qr.length?'':'hidden')+'><button class="outline-btn" data-action="direct-prev-qr" aria-label="Vorheriges QR-Bild">‹</button><span id="pair-frame-label"></span><button class="outline-btn" data-action="direct-next-qr" aria-label="Nächstes QR-Bild">›</button></div><p class="direct-note">'+(pair.qr.length>1?'Mehrere QR-Bilder wechseln automatisch. Die Kamera auf alle Bilder richten, bis der Scan vollständig ist. Das gehört nur zur einmaligen Kopplung.':pair.qr.length?'Dieser QR-Code enthält alle lokalen Verbindungsdaten.':'Die Verbindungsdaten sind vorbereitet. Nutze den Kopplungscode mit Internet oder übertrage die Daten unten ohne Kamera.')+'</p><p class="direct-status" id="direct-live-status">'+esc(directStatus(this.session))+'</p>'+(offer?'<button class="primary" data-action="direct-scan-answer">Antwort-QR scannen</button><div class="direct-divider">Optional mit Internet</div><button class="outline-btn" data-action="direct-create-code">Raumcode zum Koppeln erzeugen</button><div id="direct-created-code" class="pair-code" '+(pair.code?'':'hidden')+'><span>10 Minuten gültig · eingeladenes Handy: Beitreten → Raumcode</span><b>'+esc(pair.code||'')+'</b></div><p id="direct-code-error" class="direct-error" role="status">'+esc(pair.error||'')+'</p>':'')+(offer?'<button class="text-btn" data-action="direct-cancel-pair">Einladung zurücknehmen</button>':'')+'<details class="pair-details"><summary>Verbindungsdaten ohne Kamera übertragen</summary><p>Alle Zeilen einmal auf das andere Handy übertragen und dort beim Scanner einfügen.</p><textarea id="direct-qr-text" readonly aria-label="Alle QR-Verbindungsdaten">'+esc(pair.qr.length?pair.qr.join('\n'):JSON.stringify(pair.data))+'</textarea><button class="outline-btn" data-action="direct-copy">Verbindungsdaten kopieren</button></details><button class="text-btn" data-action="direct-check">QR fehlt? Offline-Verbindung prüfen</button><button class="outline-btn" data-action="direct-cancel">Zur Partie</button>','direct-pair');
    this.paintQr();
    if(pair.qr.length>1)this.timer=setInterval(()=>{this.index=(this.index+1)%pair.qr.length;this.paintQr();},1600);
  }
  paintQr(){
    const pair=this.session.pairing,area=document.querySelector('#pair-qr'),label=document.querySelector('#pair-frame-label');
    if(!area||!pair)return;
    try{if(!pair.qr.length)throw Error(pair.qrError||'Kein QR-Bild verfügbar.');area.innerHTML=this.renderQr(pair.qr[this.index]);area.classList.remove('has-error');if(label)label.textContent='QR-Bild '+(this.index+1)+' von '+pair.qr.length;}
    catch{area.classList.add('has-error');area.innerHTML='<strong>QR-Bild konnte nicht angezeigt werden.</strong><p>Die Verbindung ist vorbereitet. Kopplungscode oder Verbindungsdaten unten verwenden.</p>';if(label)label.textContent='QR-Anzeige nicht verfügbar';clearInterval(this.timer);}
  }
  async checkSetup(){
    this.name=this.readName();this.roomName=this.readRoomName();if(this.view!=='check')this.checkReturn=this.view;this.view='check';
    this.open('Offline-Verbindung prüfen.','<div class="pair-wait"><span class="pair-spinner" aria-hidden="true"></span><p>Dieses Handy wird geprüft …</p><p>Die Adresssuche dauert höchstens 20 Sekunden. Die Kamera bleibt ausgeschaltet.</p></div><div id="direct-check-progress" class="direct-check-list" role="status"></div><button class="outline-btn" data-action="direct-check-back">Zurück zur Kopplung</button>','direct-check');
    const controller=this.checkController=new AbortController(),revision=this.revision;
    try{
      const result=await this.inspect({version:this.session.version,offlineInfo:this.offlineInfo(),signal:controller.signal,onProgress:value=>{if(this.checkController===controller){const area=document.querySelector('#direct-check-progress');if(area)area.innerHTML=this.checkRows(value);}}});
      if(controller.signal.aborted||revision!==this.revision||this.checkController!==controller)return;
      try{this.session.diagnostics?.check(result);}catch{}this.checkResult=result;this.showCheck(result);
    }catch{if(!controller.signal.aborted&&revision===this.revision)this.failure('Die Prüfung konnte nicht abgeschlossen werden. Bitte erneut versuchen.');}
  }
  checkRows(result){return result.rows.map(row=>'<div class="check-row '+esc(row.state)+'"><strong><span aria-hidden="true">'+(row.state==='ok'?'✓':row.state==='error'?'!':row.state==='checking'?'…':'i')+'</span>'+esc(row.label)+'</strong><p>'+esc(row.detail)+'</p></div>').join('');}
  showCheck(result){
    let test='';if(result.rows.some(row=>row.id==='qr'&&row.state==='ok'))try{test='<div class="pair-qr qr-test" aria-label="QR-Testbild">'+this.renderQr('Farbfeld QR-Test · v'+result.version)+'</div><p class="direct-note">Siehst du das schwarz-weiße Testbild? Es prüft nur die Darstellung und koppelt keine Handys.</p>';}catch{test='<p class="direct-error">Das QR-Testbild kann hier nicht dargestellt werden.</p>';}
    this.view='check';this.open('Offline-Prüfung auf diesem Handy.',this.checkRows(result)+test+'<div class="info-box">Diese Prüfung bestätigt noch keine Verbindung zu einem zweiten Handy. Farbfeld kann weder den WLAN-Namen auslesen noch Hotspot oder WLAN selbst einschalten. Prüft auf beiden Handys das gleiche Netz. Ein Internet-Spielraum benötigt dagegen durchgehend Internet.</div><button class="outline-btn" data-action="direct-check-copy">Prüfergebnis kopieren</button><button class="outline-btn" data-action="direct-check">Erneut prüfen</button><button class="primary" data-action="direct-check-back">Zurück zur Kopplung</button>','direct-check');
  }
  showScanner(kind,error=''){
    this.view='scan';this.scanKind=kind;
    this.open(kind==='offer'?'Angebot scannen.':'Antwort scannen.','<p>'+(kind==='offer'?'Richte die Kamera auf die QR-Bilder des Gastgeber-Handys.':'Richte die Kamera auf die Antwort-Bilder des eingeladenen Handys.')+'</p><div class="pair-camera"><video id="direct-video" autoplay muted playsinline></video></div><p id="scan-status" class="direct-status" role="status">'+esc(error||'Kamera wird gestartet …')+'</p><button class="outline-btn" data-action="direct-camera-start">Kamera starten</button><details class="pair-details"><summary>Verbindungsdaten stattdessen einfügen</summary><textarea id="direct-paste" placeholder="Alle FF1-Verbindungszeilen hier einfügen" aria-label="Verbindungsdaten einfügen"></textarea><button class="outline-btn" data-action="direct-paste">Verbindungsdaten übernehmen</button></details><button class="outline-btn" data-action="direct-cancel">Zur Partie</button>','direct-scan');
    this.startScanner();
  }
  startScanner(){
    const video=document.querySelector('#direct-video');if(!video)return;
    const revision=this.revision;
    const status=message=>{const el=document.querySelector('#scan-status');if(el)el.textContent=message;};
    this.scanner.start(video,{onProgress:(n,total)=>{this.session.note?.('scan',{kind:this.scanKind,method:'qr',qrRead:n,qrTotal:total});status(n+' von '+total+' QR-Bildern gelesen …');},onValue:value=>{if(revision===this.revision)this.consume(value).catch(error=>{if(revision===this.revision)this.failure(error.message);});},onError:message=>{try{this.session.diagnostics?.error(message);}catch{}status(message);}});
  }
  async consume(value){
    const revision=this.revision;
    this.session.note?.('scan',{kind:this.scanKind,method:'qr'});validateHandshake(value,this.scanKind);this.stop();this.wait('Verbindungsdaten vollständig. Die Handys werden verbunden …');
    if(this.scanKind==='offer')await this.session.join(value,this.name);
    else {await this.session.accept(value);if(revision!==this.revision||this.session.pairingComplete)return;this.view='waiting';this.open('Die Verbindung entsteht.', '<p>Alle Apps offen lassen. Der gespeicherte Spielstand wird gleich abgeglichen.</p><p class="direct-status" id="direct-live-status">'+esc(directStatus(this.session))+'</p><div class="info-box">Falls es nicht klappt: gleiches WLAN/Hotspot prüfen, VPN und Gäste-WLAN mit Geräteisolation vermeiden. Falls Chrome nach lokalem Netzwerkzugriff fragt, diesen erlauben.</div><button class="outline-btn" data-action="direct-show-pair">QR wieder zeigen</button><button class="outline-btn" data-action="direct-cancel">Zur Partie</button>','direct-wait');}
  }
  failure(message){try{this.session.diagnostics?.error(message);}catch{}this.view='error';this.open('Noch keine Direktverbindung.', '<p>'+esc(message)+'</p><div class="info-box">Ein Angebots-QR kann erst nach der lokalen Adresssuche angezeigt werden. Dafür braucht Farbfeld keine Kamera. Alle Handys im gleichen WLAN oder Hotspot lassen. Gäste-WLAN, Geräteisolation oder VPN können direkte Verbindungen verhindern. Falls Chrome nach lokalem Netzwerkzugriff fragt, diesen erlauben. Eure bestätigte Partie bleibt gespeichert.</div><button class="primary" data-action="direct-resume">Kopplung erneut versuchen</button><button class="outline-btn" data-action="direct-check">Offline-Verbindung prüfen</button><button class="outline-btn" data-action="direct-entry">Zur WLAN-Anleitung</button><button class="outline-btn" data-action="direct-cancel">Zur Partie</button>','direct-error');}
  async run(callback){if(this.busy)return;const revision=this.revision;this.busy=true;try{await callback(()=>revision===this.revision);}catch(error){if(revision===this.revision){try{this.session.diagnostics?.error(error);}catch{}this.toast(error.message);if(this.view==='busy')this.failure(error.message);}}finally{if(revision===this.revision)this.busy=false;}}
  async createHost(withCode=false){await this.run(async current=>{this.enter();this.wait(withCode?'Lokales Angebot vorbereiten und Kopplungscode automatisch erzeugen …':'Verbindung wird vorbereitet …');await this.session.host(this.name,false,this.roomName);if(current()&&withCode&&this.session.pairing)await this.session.createCode();});}
  showDiagnostics(){
    if(this.view!=='diagnostics')this.diagnosticReturn=this.view;
    this.name=this.readName();this.roomName=this.readRoomName();this.view='diagnostics';
    const data=this.session.diagnostics?.state(),active=!!data?.enabled,disabled=active?' disabled':'';
    const select=(values,current)=>values.map(([value,label])=>'<option value="'+value+'"'+(value===current?' selected':'')+'>'+label+'</option>').join('');
    const labels={capture:'Aufzeichnung',lifecycle:'App-Sichtbarkeit',pairing:'Kopplung',rtc:'Verbindungszustand',scan:'QR-Scan',session:'Spielabgleich',message:'Nachricht empfangen',action:'Spielaktion',error:'Fehler',check:'Geräteprüfung',stats:'Verbindungswerte'};
    const stages={'started':'gestartet','stopped':'gestoppt','expired':'Zeitlimit erreicht','reload':'App geladen','foreground':'Vordergrund','background':'Hintergrund','pagehide':'App verlassen','candidate-fallback':'Vorhandene lokale Adressen verwenden','offer-start':'Angebot vorbereiten','offer-ready':'Angebot bereit','answer-start':'Antwort vorbereiten','answer-ready':'Antwort bereit','answer-accepted':'Antwort übernommen','pair-complete':'Handys verbunden','pair-cancelled':'Kopplung beendet','restored':'Gespeicherter Stand geladen','disconnect':'Getrennt','heartbeat-stalled':'Verbindung antwortet nicht','heartbeat-recovered':'Verbindung antwortet wieder','code-start':'Kopplungscode vorbereiten','code-ready':'Kopplungscode bereit'};
    const events=(data?.events??[]).slice(-8).reverse();
    this.open('Offline-Testprotokoll.',
      '<p>Auf beiden Handys dieselbe Testnummer wählen, eines als A und das andere als B. Vor der Kopplung starten; danach auf jedem Handy den Bericht exportieren.</p>'+
      '<div class="diagnostic-controls"><label for="diagnostic-device">Dieses Handy<select class="outline-btn" id="diagnostic-device"'+disabled+'>'+select([['','Bitte wählen'],['A','Handy A'],['B','Handy B']],data?.device??'')+'</select></label><label for="diagnostic-test">Testnummer<input id="diagnostic-test" type="number" min="1" max="99" step="1" value="'+(data?.test??1)+'"'+disabled+'></label><label class="diagnostic-network" for="diagnostic-network">Gemeinsames Netz<select class="outline-btn" id="diagnostic-network"'+disabled+'>'+select([['unknown','Nicht angegeben'],['wifi','Gemeinsames WLAN'],['hotspot-a','Hotspot von Handy A'],['hotspot-b','Hotspot von Handy B']],data?.network??'unknown')+'</select></label></div>'+
      '<p id="diagnostic-live-state" role="status">'+(data?(active?'Aufzeichnung läuft':'Aufzeichnung beendet')+' · '+data.events.length+' Einträge'+(data.dropped?' · ältere Einträge begrenzt':''):'Noch kein Testprotokoll vorhanden.')+'</p>'+
      (this.session.diagnostics&&!this.session.diagnostics.storageAvailable?'<p class="direct-error">Das Protokoll kann gerade nicht lokal gespeichert werden. Vor dem Schließen dieser App exportieren.</p>':'')+
      (active?'<button class="outline-btn" data-action="direct-diagnostics-stop">Aufzeichnung stoppen</button>':'<button class="primary" data-action="direct-diagnostics-start">'+(data?'Neuen Test starten':'Aufzeichnung starten')+'</button>')+
      (data?'<button class="outline-btn" data-action="direct-diagnostics-export">Bericht als JSON exportieren</button><button class="text-btn" data-action="direct-diagnostics-copy">Bericht kopieren</button>':'')+
      '<p class="direct-note">Nur auf diesem Gerät. Höchstens 30 Minuten und 300 Einträge; nach 24 Stunden beim nächsten Zugriff gelöscht. Erfasst Kopplung, Verbindungszustände und Spielabgleich. Keine Namen, Spielblätter, Zugangsschlüssel, QR-Inhalte oder Netzwerkadressen. Es wird nichts hochgeladen.</p>'+
      (data?'<details><summary>Letzte Schritte</summary><ol class="diagnostic-events">'+events.map(event=>'<li><time>'+esc(new Date(event.at).toLocaleTimeString('de-AT'))+'</time> '+esc(labels[event.type]||'Test')+(stages[event.stage]?' · '+esc(stages[event.stage]):'')+(event.type==='error'?' · '+esc(event.error||'unknown'):'')+'</li>').join('')+'</ol></details><button class="text-btn" data-action="direct-diagnostics-clear">Nur Protokoll löschen</button><p class="direct-note">Ein neuer Test ersetzt das bisherige Protokoll. Spielstände bleiben erhalten.</p>':'')+
      '<button class="primary" data-action="direct-diagnostics-back">Zurück</button>','direct-diagnostics');
  }
  backDiagnostics(){
    if(this.diagnosticReturn==='scan'&&!this.session.ready&&!this.session.pairingComplete)this.showScanner(this.scanKind);
    else if(this.session.pairing)this.showPair();
    else if(this.diagnosticReturn==='join')this.joinEntry();
    else if(this.diagnosticReturn==='setup')this.entry(true);
    else {this.view='';this.close();}
  }
  async exportDiagnostics(copy=false){
    if(this.exportingDiagnostics)return;this.exportingDiagnostics=true;
    try{
      const file=await this.session.diagnostics?.export(this.session);
      if(this.view!=='diagnostics')return;
      if(!file){this.toast('Bitte zuerst eine Aufzeichnung starten.');return;}
      const text=JSON.stringify(file.report,null,2);
      if(copy){
        try{await navigator.clipboard.writeText(text);this.toast('Testbericht kopiert.');}
        catch{this.open('Testbericht kopieren.','<p>Text markieren und kopieren. Den Bericht von beiden Handys anschließend hier anhängen oder einfügen.</p><textarea class="check-report" readonly aria-label="Offline-Testbericht">'+esc(text)+'</textarea><button class="primary" data-action="direct-diagnostics">Zurück zum Protokoll</button>','direct-diagnostics');}
      }else {this.downloadDiagnostic(file.filename,text);this.toast('Testbericht wird heruntergeladen. Bitte die Datei von beiden Handys anhängen.');}
    }catch{this.toast('Export nicht möglich. Bitte „Bericht kopieren“ versuchen.');}
    finally{this.exportingDiagnostics=false;}
  }
  async handle(action,button=null){
    if(!action.startsWith('direct-'))return false;
    switch(action){
      case 'direct-diagnostics':this.showDiagnostics();break;
      case 'direct-diagnostics-start':{const device=document.querySelector('#diagnostic-device')?.value,test=Number(document.querySelector('#diagnostic-test')?.value),network=document.querySelector('#diagnostic-network')?.value;if(!this.session.diagnostics?.start({device,test,network})){this.toast('Handy A oder B und eine Testnummer von 1 bis 99 wählen.');break;}this.session.recordState?.(true);this.showDiagnostics();break;}
      case 'direct-diagnostics-stop':this.session.diagnostics?.stop();this.showDiagnostics();break;
      case 'direct-diagnostics-clear':this.session.diagnostics?.clear();this.showDiagnostics();break;
      case 'direct-diagnostics-export':await this.exportDiagnostics();break;
      case 'direct-diagnostics-copy':await this.exportDiagnostics(true);break;
      case 'direct-diagnostics-back':this.backDiagnostics();break;
      case 'direct-entry':this.entry();break;
      case 'direct-check':await this.checkSetup();break;
      case 'direct-check-back':this.stop();if(this.session.pairing)this.showPair();else if(this.checkReturn==='join')this.joinEntry();else if(this.session.saved){this.close();this.enter();this.view='';}else this.entry(true);break;
      case 'direct-check-copy':if(this.checkResult){const text=offlineCheckReport(this.checkResult);try{await navigator.clipboard.writeText(text);this.toast('Prüfergebnis kopiert. Keine Spielzugänge oder Netzwerkadressen enthalten.');}catch{this.open('Prüfergebnis kopieren.','<p>Den Text markieren und über das Textmenü kopieren.</p><textarea class="check-report" readonly aria-label="Offline-Prüfergebnis">'+esc(text)+'</textarea><button class="primary" data-action="direct-check-result">Zurück zum Ergebnis</button>','direct-check');}}break;
      case 'direct-check-result':if(this.checkResult)this.showCheck(this.checkResult);break;
      case 'direct-network-help':this.networkHelp();break;
      case 'direct-network-back':if(this.networkReturn==='join')this.joinEntry();else this.entry(true);break;
      case 'direct-create':case 'direct-create-with-code':this.name=this.readName();this.roomName=this.readRoomName();if(this.session.snapshot?.game?.status==='playing'){this.open('Neue Direktpartie?', '<p>Die bisherige Direktpartie auf diesem Gerät wird ersetzt. Solo und „Ein Handy“ bleiben gespeichert.</p><button class="primary" data-action="'+(action==='direct-create-with-code'?'direct-create-code-confirm':'direct-create-confirm')+'">Neue Direktpartie erstellen</button><button class="outline-btn" data-action="direct-resume">Bisherige Partie fortsetzen</button>','direct-confirm');}else await this.createHost(action==='direct-create-with-code');break;
      case 'direct-create-confirm':case 'direct-create-code-confirm':await this.createHost(action==='direct-create-code-confirm');break;
      case 'direct-join':this.name=this.readName();this.joinEntry();break;
      case 'direct-resume':this.enter();if(this.session.ready){this.close();break;}if(this.session.pid===0)await this.run(async()=>{this.wait('Gespeicherte Partie vorbereiten …');await this.session.host('',true);});else{this.name=this.session.saved?.name||this.name;this.joinEntry('Bitte mit dem ursprünglichen Gastgeber erneut koppeln. Dann geht diese gespeicherte Partie weiter.');}break;
      case 'direct-scan-offer':this.name=this.readName();this.showScanner('offer');break;
      case 'direct-scan-answer':this.showScanner('answer');break;
      case 'direct-camera-start':this.startScanner();break;
      case 'direct-show-pair':this.showPair();break;
      case 'direct-create-code':await this.run(async current=>{await this.session.createCode();if(current())this.sync();});break;
      case 'direct-join-code':this.name=this.readName();{const code=document.querySelector('#direct-code')?.value.toUpperCase().replace(/[^A-Z0-9]/g,'');if(code?.length!==8){this.toast('Bitte den Raumcode mit 8 Zeichen eingeben.');break;}await this.run(async current=>{this.enter();this.wait('Angebot wird per Internet ausgetauscht. Danach wird lokal verbunden …');const joined=await this.session.joinCode(code,this.name);if(current()&&joined&&!this.session.pairingComplete){this.view='waiting';this.open('Lokal verbinden.', '<p>Der Raumcode wurde ausgetauscht. Die Verbindung im WLAN/Hotspot wird jetzt aufgebaut.</p><p class="direct-status" id="direct-live-status">'+esc(directStatus(this.session))+'</p><button class="outline-btn" data-action="direct-cancel">Zur Partie</button>','direct-wait');}});}break;
      case 'direct-next-qr':case 'direct-prev-qr':{const n=this.session.pairing?.qr.length;if(n){clearInterval(this.timer);this.index=(this.index+(action==='direct-next-qr'?1:n-1))%n;this.paintQr();}}break;
      case 'direct-paste':await this.run(async current=>{const text=document.querySelector('#direct-paste')?.value;const value=await decodeQrText(text||'');if(current())await this.consume(value);});break;
      case 'direct-copy':{const area=document.querySelector('#direct-qr-text');try{await navigator.clipboard.writeText(area.value);this.toast('Verbindungsdaten kopiert.');}catch{area.focus();area.select();this.toast('Text markiert. Bitte über das Textmenü kopieren.');}}break;
      case 'direct-invite':case 'direct-reconnect-member':await this.run(async()=>{this.enter();this.wait('Einladung vorbereiten …');await this.session.invite(action==='direct-reconnect-member'?Number(button?.dataset.pid):null);});break;
      case 'direct-cancel-pair':this.cancelUi();this.session.cancelPairing();this.close();this.enter();break;
      case 'direct-mines':await this.run(()=>this.session.act('options',{mines:!this.session.snapshot.mines}));break;
      case 'direct-bonus':await this.run(()=>this.session.act('options',{bonusFields:!this.session.snapshot.bonusFields}));break;
      case 'direct-hidden':await this.run(()=>this.session.act('options',{hiddenScores:!this.session.snapshot.hiddenScores}));break;
      case 'direct-start':await this.run(()=>this.session.act('start'));break;
      case 'direct-discard':this.discard();break;
      case 'direct-disconnect':this.cancelUi();this.session.disconnect();this.close();this.enter();break;
      case 'direct-cancel':this.cancelUi();this.close();this.enter();break;
    }
    return true;
  }
}
