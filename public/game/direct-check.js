import {LAN_RTC_CONFIG,waitForIce} from './direct-connection.js';
import {checkQrCodec} from './qr.js';

const aborted=signal=>{if(signal?.aborted)throw Error('Die Prüfung wurde abgebrochen.');};
async function permission(navigator,names){
  if(!navigator?.permissions?.query)return 'unknown';
  for(const name of names){
    let timer;
    try{
      const value=await Promise.race([navigator.permissions.query({name}),new Promise(resolve=>{timer=setTimeout(()=>resolve(null),1500);})]);
      if(['granted','prompt','denied'].includes(value?.state))return value.state;
    }catch{}finally{clearTimeout(timer);}
  }
  return 'unknown';
}
export function candidateSummary(sdp=''){
  const lines=String(sdp).split(/\r?\n/).filter(line=>line.startsWith('a=candidate:')&&/\btyp host\b/.test(line));
  return {count:lines.length,udp:lines.filter(line=>/\budp\b/i.test(line)).length,mdns:lines.some(line=>/\.local\b/.test(line))};
}
// This intentionally opens no camera, fetches no URL, and never changes an
// existing DirectSession. A disposable RTC offer checks this device only.
export async function inspectOfflineSetup({version,offlineInfo={},environment=globalThis,Peer=environment.RTCPeerConnection,signal=null,iceTimeout=20000,qrCheck=checkQrCodec,onProgress=()=>{}}={}){
  const rows=[],result={version,rows,candidates:null};
  const add=(id,label,state,detail)=>{rows.push({id,label,state,detail});onProgress({...result,rows:[...rows]});};
  aborted(signal);
  add('secure','Sichere App-Adresse',environment.isSecureContext?'ok':'error',environment.isSecureContext?'HTTPS ist aktiv.':'Bitte Farbfeld über die öffentliche HTTPS-Adresse in Chrome öffnen.');
  add('cache','Offline-Dateien',offlineInfo.ready?'ok':'warning',offlineInfo.ready?'Vollständiger Cache einschließlich QR-Generator und Scanner bestätigt.':'Noch nicht für diese App-Version bestätigt. Mit Internet in den Einstellungen auf Updates prüfen und „Offline bereit“ abwarten.');
  add('camera','Kamera-Unterstützung',environment.navigator?.mediaDevices?.getUserMedia?'ok':'warning',environment.navigator?.mediaDevices?.getUserMedia?'Vorhanden. Für das Anzeigen eigener QR-Codes wird keine Kamera benötigt.':'Hier nicht verfügbar. Verbindungsdaten können stattdessen kopiert und eingefügt werden.');
  try{qrCheck();add('qr','QR-Erzeugung und Decoder','ok','Lokale Bibliotheken erzeugen und lesen ein Testbild ohne Internet.');}catch{add('qr','QR-Erzeugung und Decoder','error','Der Selbsttest ist fehlgeschlagen. Bitte die App mit Internet aktualisieren; Kopplungscode oder Verbindungsdaten bleiben als Alternative.');}
  const [camera,network]=await Promise.all([permission(environment.navigator,['camera']),permission(environment.navigator,['local-network','local-network-access'])]);
  aborted(signal);
  add('camera-permission','Kamera-Freigabe',camera==='denied'?'warning':'info',camera==='denied'?'In Chrome blockiert. Beim Website-Symbol → Berechtigungen → Kamera erlauben; nur zum Scannen nötig.':camera==='granted'?'Bereits erlaubt.':camera==='prompt'?'Wird erst beim Starten des Scanners angefragt.':'Vom Browser nicht abfragbar. Erst der Kamerastart prüft die Freigabe.');
  add('network-permission','Lokaler Netzwerkzugriff',network==='denied'?'warning':'info',network==='denied'?'Als blockiert gemeldet. In den Website-Berechtigungen prüfen. Welche Verbindungsarten diese Freigabe brauchen, hängt von Chrome ab.':network==='granted'?'Als erlaubt gemeldet; das bestätigt noch keine Verbindung zum anderen Handy.':network==='prompt'?'Falls Chrome nach lokalem Netzwerkzugriff fragt, für die Direktpartie erlauben.':'Keine abfragbare Freigabe. Das ist je nach Browser normal; entscheidend ist der Verbindungstest.');
  if(!Peer){add('rtc','Lokale Verbindungsdaten','error','WebRTC fehlt. Bitte aktuelles Chrome auf Android verwenden.');return result;}
  let pc,channel;
  add('rtc','Lokale Verbindungsdaten','checking','Netzwerkadressen werden gesammelt, höchstens 20 Sekunden. Dafür ist keine Kamera-Freigabe nötig.');
  try{
    aborted(signal);pc=new Peer({...LAN_RTC_CONFIG,iceServers:[]});channel=pc.createDataChannel('farbfeld-check',{ordered:true});
    await pc.setLocalDescription(await pc.createOffer());aborted(signal);
    const description=await waitForIce(pc,iceTimeout,signal);aborted(signal);
    result.candidates=candidateSummary(description.sdp);
    const fallback=pc.iceGatheringState!=='complete',row=rows.find(row=>row.id==='rtc');row.state=fallback?'warning':'ok';row.detail=result.candidates.count+' lokale Adresse(n) erhalten'+(result.candidates.mdns?' · teilweise als geschützter .local-Name':'')+'. '+(fallback?'Adresssuche bleibt offen; vorhandene lokale UDP-Adressen werden verwendet. ':'')+'Angebot und QR können vorbereitet werden.';
  }catch(error){
    aborted(signal);const row=rows.find(row=>row.id==='rtc');row.state='error';
    row.detail=/keine lokale Netzwerkadresse/i.test(error.message)?'Der Browser liefert keine lokale Netzwerkadresse. Deshalb kann noch kein nutzbarer Angebots-QR entstehen. WLAN/Hotspot, VPN und Chrome-Berechtigungen prüfen; danach erneut versuchen.':'Lokale Verbindungsdaten konnten nicht vollständig gesammelt werden. WLAN/Hotspot und Chrome-Berechtigungen prüfen; danach erneut versuchen.';
  }finally{channel?.close();pc?.close();}
  return result;
}
export function offlineCheckReport(result){
  return ['Farbfeld Offline-Prüfung · v'+result.version,...result.rows.map(row=>row.label+': '+row.state+' · '+row.detail),'Kandidaten: '+(result.candidates?JSON.stringify(result.candidates):'nicht verfügbar'),'Dies prüft ein Gerät. Verbindung zu einem zweiten Handy noch nicht bestätigt.'].join('\n');
}
