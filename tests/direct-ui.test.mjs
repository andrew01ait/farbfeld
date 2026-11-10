import test from 'node:test';
import assert from 'node:assert/strict';
import {DirectDiagnostics} from '../public/game/direct-diagnostics.js';
import {DirectUi} from '../public/game/direct-ui.js';

function fixture(){
 const previousDocument=globalThis.document,previousWindow=globalThis.window;
 globalThis.document={addEventListener(){},querySelector(){return null;}};globalThis.window={addEventListener(){}};
 const panels=[],errors=[];let discard=0,stopped=0;
 const session={saved:null,snapshot:null,pid:0,pairing:null,ready:false};
 const ui=new DirectUi(session,{modal:(title,html,panel)=>panels.push({title,html,panel}),close(){},enter(){},toast:message=>errors.push(message),discard(){discard++;}});
 ui.scanner.stop=()=>stopped++;ui.startScanner=()=>{};ui.paintQr=()=>{};
 return {ui,session,panels,errors,get discard(){return discard;},get stopped(){return stopped;},dispose(){ui.stop();globalThis.document=previousDocument;globalThis.window=previousWindow;}};
}
test('Abbruch steht schon bei Vorbereitung, QR, Scanner, Anleitung und Fehler zur Verfügung',async()=>{
 const f=fixture();try{
  f.ui.entry();f.ui.joinEntry();f.ui.wait();f.ui.showScanner('offer');f.ui.failure('Kein WLAN');f.ui.networkHelp();
  f.session.pairing={kind:'offer',qr:['test'],error:''};f.ui.showPair();
  assert.equal(f.panels.length,7);for(const panel of f.panels)assert.match(panel.html,/data-action="direct-discard">Direktpartie abbrechen/);
  await f.ui.handle('direct-discard');assert.equal(f.discard,1);
 }finally{f.dispose();}
});
test('Abgebrochene Oberflächenaktion meldet keine späten Fehler und blockiert keinen neuen Versuch',async()=>{
 const f=fixture();let rejectOld,resolveNew;
 try{
  const old=f.ui.run(()=>new Promise((_,reject)=>{rejectOld=reject;}));f.ui.cancelUi();
  assert.equal(f.ui.busy,false);assert.equal(f.ui.view,'');assert(f.stopped>0);
  const next=f.ui.run(()=>new Promise(resolve=>{resolveNew=resolve;}));assert.equal(f.ui.busy,true);
  rejectOld(Error('Zu spät'));await old;assert.equal(f.ui.busy,true);assert.deepEqual(f.errors,[]);
  resolveNew();await next;assert.equal(f.ui.busy,false);
 }finally{f.dispose();}
});
test('Ein fehlendes QR-Bild lässt Kopplungscode, Rohdaten und verständlichen Fehler erreichbar',()=>{
 const f=fixture(),area={innerHTML:'',classList:{add(){},remove(){}}},label={textContent:''};
 try{
  f.session.pairing={kind:'offer',qr:[],data:{kind:'offer',test:'raw data'},qrError:'capacity'};f.ui.showPair();
  assert.match(f.panels.at(-1).html,/direct-create-code/);assert.match(f.panels.at(-1).html,/raw data/);
  globalThis.document.querySelector=selector=>selector==='#pair-qr'?area:selector==='#pair-frame-label'?label:null;
  DirectUi.prototype.paintQr.call(f.ui);assert.match(area.innerHTML,/QR-Bild konnte nicht angezeigt/);
  f.session.pairing.qr=['frame'];f.ui.renderQr=()=>{throw Error('SVG failure');};
  DirectUi.prototype.paintQr.call(f.ui);assert.match(label.textContent,/nicht verfügbar/);
 }finally{f.dispose();}
});
test('Adressfehler bleiben sichtbar statt nach einem Toast wieder zu verschwinden',()=>{
 const f=fixture();try{
  f.ui.view='busy';f.session.status='failed';f.session.pairingError='Keine lokale Netzwerkadresse';f.ui.sync();
  assert.equal(f.panels.at(-1).panel,'direct-error');assert.match(f.panels.at(-1).html,/Keine lokale Netzwerkadresse/);
  assert.match(f.panels.at(-1).html,/Offline-Verbindung prüfen/);
 }finally{f.dispose();}
});
test('Automatische Code-Erstellung wartet auf das Angebot und bleibt nach Abbruch gesperrt',async()=>{
 const f=fixture(),calls=[];try{
  f.session.host=async()=>{calls.push('offer');f.session.pairing={kind:'offer'};};f.session.createCode=async()=>calls.push('code');
  await f.ui.handle('direct-create-with-code');assert.deepEqual(calls,['offer','code']);
  calls.length=0;let finish;f.session.host=()=>new Promise(resolve=>{finish=resolve;});
  const running=f.ui.handle('direct-create-with-code');f.ui.cancelUi();finish();await running;
  assert.deepEqual(calls,[]);
 }finally{f.dispose();}
});
test('Ein abgebrochener Gerätecheck öffnet nach verspätetem Ergebnis kein neues Panel',async()=>{
 const f=fixture();let finish;try{
  f.ui.inspect=()=>new Promise(resolve=>{finish=resolve;});
  const running=f.ui.checkSetup(),panels=f.panels.length;f.ui.cancelUi();finish({version:'test',rows:[]});await running;
  assert.equal(f.panels.length,panels);assert.equal(f.ui.checkResult,null);
 }finally{f.dispose();}
});


test('Both phone labels can start, stop, export and clear a report without altering pairing',async()=>{
 for(const device of ['A','B']){
  const f=fixture(),values=new Map(),downloads=[];
  f.session.diagnostics=new DirectDiagnostics({version:'1.16.0',storage:{getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)}});
  f.ui.downloadDiagnostic=(filename,text)=>downloads.push({filename,report:JSON.parse(text)});
  const inputs={'#diagnostic-device':{value:device},'#diagnostic-test':{value:'4'},'#diagnostic-network':{value:'hotspot-a'}};
  globalThis.document.querySelector=selector=>inputs[selector]??null;
  try{
   f.ui.view='pair';f.session.pairing={kind:'offer',qr:['test'],data:{secret:'private-pairing-data'}};
   const pairing=f.session.pairing;
   f.ui.showDiagnostics();assert.match(f.panels.at(-1).html,/Aufzeichnung starten/);assert(!f.panels.at(-1).html.includes('private-pairing-data'));assert(!f.panels.at(-1).html.includes('Direktpartie abbrechen'));
   await f.ui.handle('direct-diagnostics-start');assert.equal(f.session.diagnostics.state().device,device);assert.equal(f.session.diagnostics.state().test,4);
   assert.match(f.panels.at(-1).html,/Aufzeichnung stoppen/);
   await f.ui.handle('direct-diagnostics-export');assert.equal(downloads.length,1);assert.match(downloads[0].filename,new RegExp('_Farbfeld_OfflineDiagnose_'+device+'_Test4\\.json$'));assert.equal(downloads[0].report.capture.network,'hotspot-a');assert.equal(f.session.pairing,pairing);
   await f.ui.handle('direct-diagnostics-stop');assert.equal(f.session.diagnostics.state().enabled,false);
   await f.ui.handle('direct-diagnostics-clear');assert.equal(f.session.diagnostics.state(),null);assert.equal(f.session.pairing,pairing);assert.equal(f.discard,0);
   await f.ui.handle('direct-diagnostics-back');assert.equal(f.ui.view,'pair');assert.equal(f.session.pairing,pairing);
  }finally{f.dispose();}
 }
});
test('Diagnostic controls reject an unnamed phone and stay available on pairing errors',async()=>{
 const f=fixture();f.session.diagnostics=new DirectDiagnostics({version:'1.16.0'});
 try{f.ui.failure('Connection failed');assert.match(f.panels.at(-1).html,/Offline-Testprotokoll/);f.ui.showDiagnostics();await f.ui.handle('direct-diagnostics-start');assert.equal(f.session.diagnostics.state(),null);assert.match(f.errors.at(-1),/Handy A oder B/);}finally{f.dispose();}
});


test('Direct setup keeps the room name distinct from the personal name and passes both to the host',async()=>{
 const f=fixture(),calls=[];try{
  f.ui.entry();assert.match(f.panels.at(-1).html,/id="direct-room-name" maxlength="48"/);
  globalThis.document.querySelector=selector=>selector==='#direct-name'?{value:'Spieler A'}:selector==='#direct-room-name'?{value:'Unsere Runde'}:null;
  f.session.host=async(...args)=>calls.push(args);await f.ui.handle('direct-create');assert.deepEqual(calls,[['Spieler A',false,'Unsere Runde']]);
  f.ui.networkHelp();f.ui.entry(true);assert.match(f.panels.at(-1).html,/value="Unsere Runde"/);
 }finally{f.dispose();}
});
