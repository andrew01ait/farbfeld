import qrcode from './vendor/qrcode.js';
import jsQR from './vendor/jsqr.js';
import {directId} from './direct-game.js';
const enc=new TextEncoder(),dec=new TextDecoder();
const MAX_BYTES=100000,CHUNK=650;
const checksum=text=>{let hash=2166136261;for(let i=0;i<text.length;i++){hash^=text.charCodeAt(i);hash=Math.imul(hash,16777619);}return (hash>>>0).toString(16).padStart(8,'0');};
const base64=bytes=>{let text='';for(const byte of bytes)text+=String.fromCharCode(byte);return btoa(text).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');};
const unbase64=text=>Uint8Array.from(atob(text.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0));
async function bytesFromStream(stream){
  const reader=stream.getReader(),parts=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>MAX_BYTES){await reader.cancel();throw Error('Die Verbindungsdaten sind zu groß.');}parts.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.length;}return bytes;
}
export async function encodeQr(value){
  let bytes=enc.encode(JSON.stringify(value)),format='j';if(bytes.length>MAX_BYTES)throw Error('Die Verbindungsdaten sind zu groß.');
  // Compression is an optimization; a broken/partial browser implementation
  // must not prevent otherwise valid local connection data from being shown.
  if(typeof CompressionStream!=='undefined')try{const compressed=await bytesFromStream(new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate')));if(compressed.length<bytes.length){bytes=compressed;format='z';}}catch{}
  const data=format+'.'+base64(bytes),hash=checksum(data),id=directId().replaceAll('-','').slice(0,12),total=Math.ceil(data.length/CHUNK);
  if(total>32)throw Error('Zu viele lokale Netzwerkadressen. Bitte nicht benötigte VPNs und Netzwerkverbindungen ausschalten und erneut koppeln.');
  return Array.from({length:total},(_,i)=>['FF1',id,i+1,total,hash,data.slice(i*CHUNK,(i+1)*CHUNK)].join('|'));
}
export class QrCollector{
  constructor(){this.reset();}
  reset(){this.id=null;this.parts=new Map();this.total=0;this.hash='';}
  async add(text){
    if(typeof text!=='string'||text.length>1200)throw Error('Das ist kein Farbfeld-Verbindungscode.');
    const fields=text.trim().split('|'),[prefix,id,partText,totalText,hash,data]=fields,part=Number(partText),total=Number(totalText);
    if(fields.length!==6||prefix!=='FF1'||!/^[a-f0-9]{12}$/.test(id)||!Number.isInteger(part)||!Number.isInteger(total)||part<1||total<1||total>32||part>total||!/^[a-f0-9]{8}$/.test(hash)||!data)throw Error('Das ist kein vollständiger Farbfeld-Verbindungscode.');
    if(this.id&&this.id!==id)throw Error('Bitte bei den QR-Bildern derselben Kopplung bleiben.');
    if(this.id&&(this.total!==total||this.hash!==hash))throw Error('Die QR-Bilder passen nicht zusammen.');
    this.id=id;this.total=total;this.hash=hash;this.parts.set(part,data);
    if(this.parts.size!==total)return {received:this.parts.size,total,value:null};
    const joined=Array.from({length:total},(_,i)=>this.parts.get(i+1)).join('');
    if(checksum(joined)!==hash)throw Error('Ein QR-Bild wurde nicht richtig gelesen. Bitte erneut scannen.');
    const format=joined.slice(0,2),encoded=joined.slice(2);if(!/^[A-Za-z0-9_-]+$/.test(encoded))throw Error('Die Verbindungsdaten sind beschädigt.');
    let bytes=unbase64(encoded);
    if(format==='z.'){
      if(typeof DecompressionStream==='undefined')throw Error('Bitte Chrome aktualisieren, um diese Kopplung zu lesen.');
      bytes=await bytesFromStream(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate')));
    }else if(format!=='j.')throw Error('Unbekanntes QR-Format. Bitte beide Apps aktualisieren.');
    if(bytes.length>MAX_BYTES)throw Error('Die Verbindungsdaten sind zu groß.');
    return {received:total,total,value:JSON.parse(dec.decode(bytes))};
  }
}
export function qrSvg(text){
  const qr=qrcode(0,'M');qr.addData(text,'Byte');qr.make();return qr.createSvgTag({cellSize:4,margin:16,scalable:false});
}
export function checkQrCodec(){
  const text='FF1|0123456789ab|1|1|00000000|j.'+'aB09_-'.repeat(108),qr=qrcode(0,'M');qr.addData(text,'Byte');qr.make();
  const n=qr.getModuleCount(),scale=3,margin=4,width=(n+margin*2)*scale,rgba=new Uint8ClampedArray(width*width*4).fill(255);
  for(let row=0;row<n;row++)for(let col=0;col<n;col++)if(qr.isDark(row,col))for(let y=0;y<scale;y++)for(let x=0;x<scale;x++){const i=(((row+margin)*scale+y)*width+(col+margin)*scale+x)*4;rgba[i]=rgba[i+1]=rgba[i+2]=0;}
  if(jsQR(rgba,width,width,{inversionAttempts:'dontInvert'})?.data!==text)throw Error('Der lokale QR-Selbsttest ist fehlgeschlagen. Bitte die App mit Internet aktualisieren.');
  return true;
}
export class QrScanner{
  constructor(){this.generation=0;this.stream=null;this.timer=null;}
  stop(){this.generation++;clearTimeout(this.timer);this.stream?.getTracks().forEach(track=>track.stop());this.stream=null;if(this.video)this.video.srcObject=null;}
  async start(video,{onProgress=()=>{},onValue=()=>{},onError=()=>{}}={}){
    this.stop();const generation=this.generation;this.video=video;
    try{
      if(!navigator.mediaDevices?.getUserMedia)throw Error('Die Kamera ist hier nicht verfügbar. Bitte Farbfeld in Chrome öffnen oder Verbindungsdaten einfügen.');
      const stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}}});
      if(generation!==this.generation){stream.getTracks().forEach(track=>track.stop());return;}
      this.stream=stream;video.srcObject=stream;video.muted=true;video.playsInline=true;await video.play();if(generation!==this.generation)return;
      let detector=null;
      if(typeof BarcodeDetector!=='undefined')try{detector=new BarcodeDetector({formats:['qr_code']});}catch{}
      const collector=new QrCollector(),canvas=document.createElement('canvas'),context=canvas.getContext('2d',{willReadFrequently:true});
      const scan=async()=>{
        if(generation!==this.generation)return;
        try{
          let text=null;
          if(video.readyState>=2&&video.videoWidth){
            if(detector){try{text=(await detector.detect(video))[0]?.rawValue;}catch{detector=null;}}
            if(!detector&&!text){const scale=Math.min(1,960/video.videoWidth);canvas.width=Math.round(video.videoWidth*scale);canvas.height=Math.round(video.videoHeight*scale);context.drawImage(video,0,0,canvas.width,canvas.height);const frame=context.getImageData(0,0,canvas.width,canvas.height);text=jsQR(frame.data,frame.width,frame.height,{inversionAttempts:'dontInvert'})?.data;}
          }
          if(generation!==this.generation)return;
          if(text?.startsWith('FF1|')){
            const result=await collector.add(text);if(generation!==this.generation)return;
            onProgress(result.received,result.total);
            if(result.value){this.stop();onValue(result.value);return;}
          }
        }catch(error){onError(error.message);}
        this.timer=setTimeout(scan,170);
      };
      scan();
    }catch(error){
      if(generation!==this.generation)return;
      this.stop();onError(error.name==='NotAllowedError'?'Kamera nicht freigegeben. Bitte die Kameraberechtigung in Chrome erlauben oder Verbindungsdaten einfügen.':error.name==='NotFoundError'?'Keine Kamera gefunden. Du kannst die Verbindungsdaten stattdessen einfügen.':error.message);
    }
  }
}
export async function decodeQrText(text){
  if(typeof text!=='string'||text.length>MAX_BYTES*2)throw Error('Die Verbindungsdaten sind zu groß oder unvollständig.');
  // Also accept the original handshake if generating QR frames failed. The
  // caller still validates its protocol, role, session and description.
  if(text.trim().startsWith('{'))return JSON.parse(text);
  const collector=new QrCollector();let result;
  for(const part of text.trim().split(/\s+/)){if(part)result=await collector.add(part);}
  if(!result?.value)throw Error('Es fehlen noch QR-Teile. Bitte alle Verbindungsdaten zusammen einfügen.');
  return result.value;
}
