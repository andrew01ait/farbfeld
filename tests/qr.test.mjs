import test from 'node:test';
import assert from 'node:assert/strict';
import {encodeQr,QrCollector,decodeQrText,QrScanner,qrSvg,checkQrCodec} from '../public/game/qr.js';
import qrcode from '../public/game/vendor/qrcode.js';
import jsQR from '../public/game/vendor/jsqr.js';
const handshake={protocol:1,kind:'offer',sessionId:'session',connectionId:'connection',secret:'a'.repeat(64),description:{type:'offer',sdp:'v=0\r\n'+Array.from({length:25},(_,i)=>'a=candidate:'+i+' 1 udp 2122260223 '+crypto.randomUUID()+'.local '+(35000+i)+' typ host\r\n').join('')}};
test('Lokaler QR-Selbsttest und SVG haben lesbare Bilddaten und feste intrinsische Maße',()=>{
  assert.equal(checkQrCodec(),true);const svg=qrSvg('Farbfeld-Test');
  assert.match(svg,/<svg[^>]+width="\d+px" height="\d+px"/);assert.match(svg,/viewBox="0 0 \d+ \d+"/);
});
test('Defekte optionale Komprimierung verhindert keine QR-Kopplung; Rohdaten bleiben übertragbar',async()=>{
  const previous=globalThis.CompressionStream;
  try{
    globalThis.CompressionStream=class{constructor(){throw Error('partial implementation');}};
    const frames=await encodeQr(handshake);assert.match(frames[0],/\|j\./);
    assert.deepEqual(await decodeQrText(frames.join('\n')),handshake);
    assert.deepEqual(await decodeQrText(JSON.stringify(handshake)),handshake);
    await assert.rejects(decodeQrText('x'.repeat(200001)),/zu groß/);
  }finally{globalThis.CompressionStream=previous;}
});
test('Komprimierte vollständige ICE-Daten: mehrere QR-Bilder, beliebige Reihenfolge, keine wiederholten Teile nötig',async()=>{
  const parts=await encodeQr(handshake);assert(parts.length>1&&parts.length<10);
  const collector=new QrCollector();let result=await collector.add(parts.at(-1));
  assert.equal(result.received,1);result=await collector.add(parts.at(-1));assert.equal(result.received,1);
  for(const part of parts.slice(0,-1).reverse())result=await collector.add(part);
  assert.deepEqual(result.value,handshake);
  assert.deepEqual(await decodeQrText(parts.join('\n')),handshake);
});
test('Beschädigte oder fremde QR-Teile werden nicht als Verbindung übernommen',async()=>{
  const a=await encodeQr(handshake),b=await encodeQr(handshake),collector=new QrCollector();
  await collector.add(a[0]);await assert.rejects(collector.add(b[0]),/derselben Kopplung/);
  const broken=[...a];broken[broken.length-1]=broken.at(-1).slice(0,-1)+(broken.at(-1).endsWith('A')?'B':'A');
  await assert.rejects(decodeQrText(broken.join('\n')),/nicht richtig gelesen/);
  await assert.rejects(decodeQrText(a[0]),/fehlen/);
});
test('QR-Generator und lokal gebündelter Decoder lesen echte Bildpixel aller ICE-Teile',async()=>{
  const parts=await encodeQr(handshake);
  for(const text of parts){
    const qr=qrcode(0,'M');qr.addData(text,'Byte');qr.make();
    const n=qr.getModuleCount(),scale=3,margin=4,width=(n+margin*2)*scale,rgba=new Uint8ClampedArray(width*width*4).fill(255);
    for(let row=0;row<n;row++)for(let col=0;col<n;col++)if(qr.isDark(row,col))for(let y=0;y<scale;y++)for(let x=0;x<scale;x++){const i=(((row+margin)*scale+y)*width+(col+margin)*scale+x)*4;rgba[i]=rgba[i+1]=rgba[i+2]=0;}
    assert.equal(jsQR(rgba,width,width,{inversionAttempts:'dontInvert'})?.data,text);
  }
});
test('Kamera endet nach vollständigem Scan und bei abgebrochener Berechtigungsanfrage',async()=>{
  const descriptors=Object.fromEntries(['navigator','document','BarcodeDetector'].map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
  const parts=await encodeQr({protocol:1,test:'camera'});let index=0,stops=0;
  const stream={getTracks:()=>[{stop(){stops++;}}]},video={srcObject:null,readyState:2,videoWidth:640,videoHeight:480,async play(){}};
  try{
    Object.defineProperty(globalThis,'navigator',{configurable:true,value:{mediaDevices:{async getUserMedia(){return stream;}}}});
    Object.defineProperty(globalThis,'document',{configurable:true,value:{createElement:()=>({getContext:()=>({})})}});
    Object.defineProperty(globalThis,'BarcodeDetector',{configurable:true,value:class{async detect(){return [{rawValue:parts[index++%parts.length]}];}}});
    const scanner=new QrScanner();let resolve;const found=new Promise(r=>resolve=r);
    await scanner.start(video,{onValue:resolve,onError:message=>{throw Error(message);}});
    assert.deepEqual(await found,{protocol:1,test:'camera'});assert.equal(stops,1);assert.equal(video.srcObject,null);
    let grant;globalThis.navigator.mediaDevices.getUserMedia=()=>new Promise(resolve=>{grant=resolve;});
    const pending=scanner.start(video);scanner.stop();grant(stream);await pending;
    assert.equal(stops,2);assert.equal(video.srcObject,null);
    let deny,errors=0;globalThis.navigator.mediaDevices.getUserMedia=()=>new Promise((_,reject)=>{deny=reject;});
    const denied=scanner.start(video,{onError:()=>errors++});scanner.stop();
    globalThis.navigator.mediaDevices.getUserMedia=async()=>stream;video.readyState=0;await scanner.start(video);
    const generation=scanner.generation;deny(Object.assign(Error('late denial'),{name:'NotAllowedError'}));await denied;
    assert.equal(errors,0);assert.equal(scanner.generation,generation);assert.equal(scanner.stream,stream);scanner.stop();
  }finally{for(const [key,descriptor]of Object.entries(descriptors)){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}}
});
