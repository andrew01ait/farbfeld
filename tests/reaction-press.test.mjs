import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {reactionScale,reactionEffect,pickReactionMotion,bindReactionPress,REACTION_MOTIONS,REACTION_HOLD_MAX} from '../public/game/reactions.js';
function gesture(){
 let clock=10000,sequence=0,controller,captured=false;const listeners=new Map(),frames=new Map(),classes=new Set(),styles=new Map(),sends=[],label={textContent:'1×'};
 const button={disabled:false,isConnected:true,closest(){return this;},classList:{add(...items){items.forEach(item=>classes.add(item));},remove(...items){items.forEach(item=>classes.delete(item));},toggle(item,on){on?classes.add(item):classes.delete(item);}},style:{setProperty:(k,v)=>styles.set(k,v),removeProperty:k=>styles.delete(k)},getBoundingClientRect:()=>({left:0,right:78,top:0,bottom:78}),querySelector:()=>label,setPointerCapture(){captured=true;},hasPointerCapture(){return captured;},releasePointerCapture(){captured=false;emit('lostpointercapture');},click(){return emit('click',{detail:0});}};
 const listen=(type,fn)=>{const list=listeners.get(type)||[];list.push(fn);listeners.set(type,list);};
 const root={hidden:false,addEventListener:listen,defaultView:{addEventListener:(type,fn)=>listen('window:'+type,fn)}};
 controller=bindReactionPress(root,{onSend:(button,charge)=>sends.push(charge),now:()=>clock,frame:fn=>{frames.set(++sequence,fn);return sequence;},cancelFrame:id=>frames.delete(id)});
 const emit=(type,extra={})=>{const event={target:button,pointerId:1,pointerType:'touch',button:0,isPrimary:true,clientX:20,clientY:20,detail:1,preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;},...extra};for(const fn of listeners.get(type)||[])fn(event);return event;};
 const flush=()=>{const first=frames.entries().next().value;if(first){frames.delete(first[0]);first[1]();}};
 return {controller,root,button,styles,classes,sends,label,frames,emit,flush,advance:ms=>clock+=ms};
}
test('Touch-Loslassen sendet auch ohne nachfolgendes Klickereignis',()=>{
 for(const duration of [60,2500]){const h=gesture();h.emit('pointerdown',{pointerType:'touch'});h.advance(duration);h.emit('pointerup',{pointerType:'touch'});assert.deepEqual(h.sends,[{scale:reactionScale(duration)}]);}
});
test('Länger halten vergrößert stetig und endet bei 2,5-fach',()=>{
 assert.equal(reactionScale(0),1);assert.equal(reactionScale(1250),1.75);assert.equal(reactionScale(REACTION_HOLD_MAX),2.5);assert.equal(reactionScale(100000),2.5);assert.equal(reactionScale(-100),1);assert.equal(reactionScale(NaN),1);
});
test('Größen und Bewegungen sind begrenzt; alte Nachrichten erhalten Normalgröße',()=>{
 assert.deepEqual(reactionEffect(),{scale:1,motion:'fly'});assert.deepEqual(reactionEffect({scale:2.123,motion:'loop'}),{scale:2.12,motion:'loop'});
 for(const scale of [0,-1,3,Infinity,NaN,'2'])assert.throws(()=>reactionEffect({scale}));assert.throws(()=>reactionEffect({motion:'unlisted'}));
});
test('Aufeinanderfolgende Sendungen wechseln die Bewegung statt dieselbe Bahn zu wiederholen',()=>{
 let previous='';for(let i=0;i<30;i++){const next=pickReactionMotion(previous,()=>i%2?.8:.1);assert(REACTION_MOTIONS.includes(next));assert.notEqual(next,previous);previous=next;}
});
test('Pointer-Halten zeigt Vorschau und erzeugt erst beim Loslassen genau eine Größe',()=>{
 const h=gesture();h.emit('pointerdown');h.advance(1250);h.flush();assert.equal(h.label.textContent,'1,8×');assert.equal(h.sends.length,0);assert(h.classes.has('charging'));
 h.emit('pointerup');assert.deepEqual(h.sends,[{scale:1.75}]);assert(h.emit('click').stopped);assert.equal(h.sends.length,1);assert.equal(h.frames.size,0);assert(!h.classes.has('charging'));
});
test('Pointer-Bewegen vervielfacht keine Animationsschleifen; an der Obergrenze endet die Vorschauarbeit',()=>{
 const h=gesture();h.emit('pointerdown');for(let i=0;i<20;i++)h.emit('pointermove');assert.equal(h.frames.size,1);
 h.advance(10000);h.flush();assert.equal(h.frames.size,0);assert.equal(h.label.textContent,'2,5×');h.emit('pointerup');h.emit('click');assert.equal(h.sends[0].scale,2.5);assert.equal(h.sends.length,1);
});
test('Außerhalb loslassen, Pointerabbruch und Verbergen senden nichts; nächster Tap funktioniert',()=>{
 for(const method of ['outside','cancel','lost','hidden','blur','close']){
  const h=gesture();h.emit('pointerdown');h.advance(2000);
  if(method==='outside'){h.emit('pointermove',{clientX:200});h.emit('pointerup',{clientX:200});}else if(method==='cancel')h.emit('pointercancel');else if(method==='lost')h.emit('lostpointercapture');else if(method==='blur')h.emit('window:blur');else if(method==='close')h.emit('close');else{h.root.hidden=true;h.emit('visibilitychange');}
  h.emit('click');assert.deepEqual(h.sends,[]);assert.equal(h.frames.size,0);
  h.root.hidden=false;h.emit('pointerdown');h.emit('pointerup');h.emit('click');assert.deepEqual(h.sends,[{scale:1}]);
 }
});
test('Leertaste und Enter unterstützen Halten ohne Tastenwiederholungen oder Doppelsendung',()=>{
 for(const key of [' ','Enter']){const h=gesture();assert(h.emit('keydown',{key}).prevented);h.advance(1000);h.emit('keydown',{key,repeat:true});h.advance(1000);assert(h.emit('keyup',{key}).prevented);h.button.click();assert.deepEqual(h.sends,[{scale:2.2}]);assert.equal(h.frames.size,0);}
});
test('Bedienhilfen-Klick ohne Pointerereignisse bleibt ein normaler Tap',()=>{const h=gesture();h.button.click();assert.deepEqual(h.sends,[{scale:1}]);});
test('Ein auf den Hintergrund umgeleiteter Folge-Klick wird ohne zweiten Versand abgefangen',()=>{
 const h=gesture();h.emit('pointerdown');h.advance(2500);h.emit('pointerup');
 const event=h.emit('click',{target:{closest:()=>null}});assert(event.prevented&&event.stopped);assert.deepEqual(h.sends,[{scale:2.5}]);
});
test('Eine neue echte Eingabe wird nicht als Folge-Klick der vorherigen Geste verschluckt',()=>{
 const h=gesture();h.emit('pointerdown');h.emit('pointerup');h.emit('pointerdown');h.advance(1250);h.emit('pointerup');h.emit('click');assert.deepEqual(h.sends,[{scale:1},{scale:1.75}]);
 const outside={closest:()=>null};h.emit('pointerdown',{target:outside});assert(!h.emit('click',{target:outside}).stopped);
});
test('Deaktivierte oder entfernte Knöpfe sowie andere Finger senden nicht',()=>{
 const h=gesture();h.button.disabled=true;h.emit('pointerdown');h.emit('pointerup');h.emit('click');assert.equal(h.sends.length,0);
 h.button.disabled=false;h.emit('pointerdown',{isPrimary:false,pointerId:2});h.emit('pointerup',{pointerId:2});assert.equal(h.sends.length,0);
 h.emit('pointerdown');h.emit('pointerup',{pointerId:2});assert.equal(h.sends.length,0);h.button.isConnected=false;h.emit('pointerup');assert.equal(h.sends.length,0);assert.equal(h.frames.size,0);
});
test('Neue additive Migration erhält alte Reaktionen mit Normalgröße und geradem Flug',()=>{
 const db=new DatabaseSync(':memory:');try{const files=fs.readdirSync('drizzle').filter(file=>file.endsWith('.sql')).sort(),last=files.find(file=>file.startsWith('0005_'));assert(last);
 for(const file of files.slice(0,files.indexOf(last)))db.exec(fs.readFileSync('drizzle/'+file,'utf8'));
 db.prepare('INSERT INTO room_reactions (id,room_code,game_id,sender_id,target_id,emoji,created_at) VALUES(?,?,?,?,?,?,?)').run('old-id','ABCD2345','old-game','host','guest','kiss',100);
 db.exec(fs.readFileSync('drizzle/'+last,'utf8'));const row=db.prepare('SELECT * FROM room_reactions').get();assert.equal(row.scale_percent,100);assert.equal(row.motion,'fly');assert.equal(row.emoji,'kiss');assert.equal(row.created_at,100);
 }finally{db.close();}
});
