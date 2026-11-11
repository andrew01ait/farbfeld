import {ownTurnKey} from './view-state.js';
export const ROOM_BOOK_KEY='farbfeld.rooms.v1',LEGACY_ROOM_KEY='farbfeld.room.v1',MAX_SAVED_ROOMS=50;
const codeOK=code=>typeof code==='string'&&/^[A-Z2-9]{8}$/.test(code);
const clone=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));
function summary(value){
 if(!value||typeof value!=='object')return null;
 const result={access:['ok','missing','denied','unknown'].includes(value.access)?value.access:'unknown',checkedAt:Number.isSafeInteger(value.checkedAt)?value.checkedAt:0};
 for(const key of ['version','round','lastUsedAt','cleanupAt'])if(Number.isSafeInteger(value[key])&&value[key]>=0)result[key]=value[key];
 if(Number.isInteger(value.memberCount)&&value.memberCount>=1&&value.memberCount<=6)result.memberCount=value.memberCount;
 if(result.access==='ok'&&Array.isArray(value.participants))result.participants=value.participants.slice(0,6).filter(p=>p&&typeof p.name==='string'&&p.name.trim()&&p.name.length<=24).map(p=>({name:p.name.trim(),host:p.host===true}));
 if(['playing','finished','lobby'].includes(value.gameStatus))result.gameStatus=value.gameStatus;
 result.cleanupDue=value.cleanupDue===true;
 if(value.turn&&['turn','waiting','lobby','finished','unknown'].includes(value.turn.kind)&&typeof value.turn.text==='string')result.turn={kind:value.turn.kind,text:value.turn.text.slice(0,240),button:typeof value.turn.button==='string'?value.turn.button.slice(0,30):'Öffnen'};
 return result;
}
function session(value){
 if(!value||!codeOK(value.code)||typeof value.token!=='string'||!value.token||value.token.length>128||typeof value.playerId!=='string'||!value.playerId||value.playerId.length>128)return null;
 return {code:value.code,token:value.token,playerId:value.playerId,roomName:typeof value.roomName==='string'?value.roomName.slice(0,48):'',lastOpenedAt:Number.isSafeInteger(value.lastOpenedAt)?value.lastOpenedAt:0,summary:summary(value.summary)};
}
export class RoomBook{
 constructor({storage,now=Date.now}={}){this.now=now;this.dirty=false;this.memory={version:1,rooms:[],forgotten:[]};try{this.storage=storage===undefined?globalThis.localStorage:storage;}catch{this.storage=null;}}
 read(){
  if(this.dirty)return clone(this.memory);
  let value,legacy;try{value=JSON.parse(this.storage?.getItem(ROOM_BOOK_KEY)||'null');}catch{}try{legacy=session(JSON.parse(this.storage?.getItem(LEGACY_ROOM_KEY)||'null'));}catch{}
  const rooms=new Map();for(const item of Array.isArray(value?.rooms)?value.rooms:[]){const clean=session(item);if(clean)rooms.set(clean.code,clean);}
  const forgotten=Array.isArray(value?.forgotten)?value.forgotten.filter(codeOK).slice(-100):[];
  if(legacy&&!rooms.has(legacy.code)&&!forgotten.includes(legacy.code))rooms.set(legacy.code,legacy);
  return {version:1,rooms:[...rooms.values()],forgotten};
 }
 write(value){this.memory=clone(value);try{if(!this.storage)throw Error();this.storage.setItem(ROOM_BOOK_KEY,JSON.stringify(value));this.dirty=false;return true;}catch{this.dirty=true;return false;}}
 entries(){return this.read().rooms.sort((a,b)=>b.lastOpenedAt-a.lastOpenedAt||a.code.localeCompare(b.code));}
 get(code){return this.entries().find(room=>room.code===code)||null;}
 active(){let legacy;try{legacy=JSON.parse(this.storage?.getItem(LEGACY_ROOM_KEY)||'null');}catch{}return legacy&&this.get(legacy.code)||this.entries()[0]||null;}
 save(value,{opened=false,activate=false}={}){
  const clean=session(value);if(!clean)throw Error('Dieser Raumzugang ist ungültig.');
  const root=this.read(),index=root.rooms.findIndex(room=>room.code===clean.code);if(index<0&&root.rooms.length>=MAX_SAVED_ROOMS)throw Error('Auf diesem Gerät sind bereits 50 Räume gespeichert. Entferne zuerst einen alten Zugang.');
  const previous=index<0?null:root.rooms[index];clean.lastOpenedAt=opened?this.now():value.lastOpenedAt??previous?.lastOpenedAt??0;if(!value.summary)clean.summary=previous?.token===clean.token?previous.summary:null;
  if(index<0)root.rooms.push(clean);else root.rooms[index]=clean;root.forgotten=root.forgotten.filter(code=>code!==clean.code);
  let saved=this.write(root);if(activate){try{this.storage?.setItem(LEGACY_ROOM_KEY,JSON.stringify(clean));}catch{saved=false;}}
  return saved;
 }
 update(code,token,data){
  const root=this.read(),entry=root.rooms.find(room=>room.code===code&&room.token===token);if(!entry)return false;
  const previous=JSON.stringify(entry);if(typeof data.roomName==='string')entry.roomName=data.roomName.slice(0,48);const checkedAt=entry.summary?.checkedAt||0;entry.summary=summary({...entry.summary,...data,checkedAt:checkedAt>0&&this.now()-checkedAt<30000?checkedAt:this.now()});if(JSON.stringify(entry)===previous)return true;
  return this.write(root);
 }
 remove(code){
  const root=this.read();root.rooms=root.rooms.filter(room=>room.code!==code);root.forgotten=[...root.forgotten.filter(item=>item!==code),code].slice(-100);
  let saved=this.write(root);try{const legacy=JSON.parse(this.storage?.getItem(LEGACY_ROOM_KEY)||'null');if(legacy?.code===code)this.storage.removeItem(LEGACY_ROOM_KEY);}catch{saved=false;}return saved;
 }
}
// Room switches retain a local draft, but never apply it to a later turn/game.
export class RoomDrafts{
 constructor(){this.values=new Map();}
 save(code,game,pid,choice,cells){if(!game||pid<0)return;this.values.set(code,{key:ownTurnKey(game,pid),choice:clone(choice),cells:[...cells]});}
 restore(code,game,pid){const value=this.values.get(code);if(!value||!game||pid<0||value.key!==ownTurnKey(game,pid)){this.values.delete(code);return null;}return clone(value);}
 clear(code){this.values.delete(code);}
}

// One bounded home preview and a local, searchable overview share the same order.
export const SAVED_GAME_PREVIEW_LIMIT=3,SAVED_GAME_PAGE_SIZE=10;
function sortedSavedGames(entries){return [...entries].sort((a,b)=>Number(b.needsAction===true)-Number(a.needsAction===true)||(b.lastOpenedAt||0)-(a.lastOpenedAt||0)||a.key.localeCompare(b.key));}
export function savedGamesPreview(entries){return sortedSavedGames(entries).slice(0,SAVED_GAME_PREVIEW_LIMIT);}
export function filterSavedGames(entries,{filter='all',query='',page=0}={}){
 const search=String(query??'').trim().toLocaleLowerCase('de'),filtered=sortedSavedGames(entries).filter(e=>(!['online','offline'].includes(filter)||e.mode===filter)&&(!search||e.searchText.toLocaleLowerCase('de').includes(search)));
 const total=filtered.length,pages=Math.max(1,Math.ceil(total/SAVED_GAME_PAGE_SIZE)),current=Math.max(0,Math.min(pages-1,Number.isSafeInteger(page)?page:0)),offset=current*SAVED_GAME_PAGE_SIZE;
 return {entries:filtered.slice(offset,offset+SAVED_GAME_PAGE_SIZE),total,pages,page:current,start:total?offset+1:0,end:Math.min(total,offset+SAVED_GAME_PAGE_SIZE)};
}
