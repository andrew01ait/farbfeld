import test from 'node:test';
import assert from 'node:assert/strict';
import {waitForIce,DirectConnection} from '../public/game/direct-connection.js';

const udp='v=0\r\na=candidate:1 1 udp 2122260223 192.0.2.1 12345 typ host\r\n';
function gathering(sdp=udp){const pc=new EventTarget();pc.iceGatheringState='gathering';pc.localDescription={type:'offer',sdp};return pc;}

test('Android recovery: usable local UDP candidates produce a fixed QR description even when gathering never completes',async()=>{
 const pc=gathering(),description=await waitForIce(pc,8);
 assert.deepEqual(description,{type:'offer',sdp:udp});
 pc.localDescription.sdp+='a=candidate:late';pc.iceGatheringState='complete';pc.dispatchEvent(new Event('icegatheringstatechange'));
 assert.equal(description.sdp,udp,'later interface changes must not mutate the QR handshake');
});
test('The bounded fallback also works for the guest answer, but rejects absent, relay-only or TCP-only candidates',async()=>{
 const pc=gathering();pc.localDescription.type='answer';assert.equal((await waitForIce(pc,8)).type,'answer');
 for(const sdp of ['v=0','v=0\r\na=candidate:1 1 udp 1 192.0.2.1 12345 typ relay','v=0\r\na=candidate:1 1 tcp 1 192.0.2.1 9 typ host'])await assert.rejects(waitForIce(gathering(sdp),8),/Keine nutzbaren lokalen/);
});
test('Cancellation prevents the fallback and normal gathering completion still finishes immediately',async()=>{
 const pc=gathering(),controller=new AbortController(),pending=waitForIce(pc,100,controller.signal);controller.abort();await assert.rejects(pending,/abgebrochen/);
 const complete=gathering(),result=waitForIce(complete,1000);complete.iceGatheringState='complete';complete.dispatchEvent(new Event('icegatheringstatechange'));assert.equal((await result).sdp,udp);
});
test('The connection timeout does not run while a person is still scanning the return QR',()=>{
 const states=[],connection=new DirectConnection({Peer:class{},onState:s=>states.push(s)});
 try{
  connection.pc={connectionState:'connecting',iceConnectionState:'checking',close(){}};
  connection.update();assert.equal(connection.timer,null);assert.equal(states.at(-1),'connecting');
  connection.answerAccepted=true;connection.update();assert(connection.timer);
 }finally{connection.close(false);}
});
