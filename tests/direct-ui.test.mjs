import test from 'node:test';
import assert from 'node:assert/strict';
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
