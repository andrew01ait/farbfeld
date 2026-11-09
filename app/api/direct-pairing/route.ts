import { env } from 'cloudflare:workers';
type Pairing={host_token:string;offer:string;answer:string|null;join_token:string|null;expires_at:number};
const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
const code=()=>Array.from(crypto.getRandomValues(new Uint8Array(8)),n=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[n%32]).join('');
const validDescription=(value:any,kind:string)=>[1,2].includes(value?.protocol)&&value.kind===kind&&typeof value.sessionId==='string'&&value.sessionId.length<=80&&typeof value.connectionId==='string'&&value.connectionId.length<=80&&value.description?.type===kind&&typeof value.description.sdp==='string'&&value.description.sdp.length<=60000&&(kind!=='offer'||(value.protocol===1||Number.isInteger(value.pid)&&value.pid>=1&&value.pid<=5)&&typeof value.secret==='string'&&value.secret.length>=32&&value.secret.length<=160);
export async function POST(req:Request){
  try{
    const origin=new URL(req.url).origin;if(req.headers.get('Origin')&&req.headers.get('Origin')!==origin)return json({error:'Ungültige Anfrage.'},403);
    const raw=await req.text();if(raw.length>85000)return json({error:'Verbindungsdaten zu groß.'},413);
    let body:any;try{body=JSON.parse(raw);}catch{return json({error:'Ungültige Verbindungsdaten.'},400);}
    if(!body||typeof body!=='object')return json({error:'Ungültige Anfrage.'},400);
    if(body.action==='create'){
      if(!validDescription(body.offer,'offer'))return json({error:'Das vollständige Verbindungsangebot fehlt.'},400);
      await env.DB!.prepare('DELETE FROM direct_pairings WHERE expires_at <= ?').bind(Date.now()).run();
      const hostToken=crypto.randomUUID()+crypto.randomUUID(),expiresAt=Date.now()+10*60000;
      for(let i=0;i<4;i++){
        const roomCode=code(),result=await env.DB!.prepare('INSERT OR IGNORE INTO direct_pairings (code,host_token,offer,expires_at) VALUES (?,?,?,?)').bind(roomCode,hostToken,JSON.stringify(body.offer),expiresAt).run();
        if(result.meta.changes)return json({code:roomCode,hostToken,expiresAt});
      }
      return json({error:'Bitte erneut einen Code erzeugen.'},503);
    }
    const roomCode=String(body.code||'').toUpperCase();
    if(!/^[A-Z2-9]{8}$/.test(roomCode))return json({error:'Bitte den Raumcode mit 8 Zeichen prüfen.'},400);
    const row=await env.DB!.prepare('SELECT host_token,offer,answer,join_token,expires_at FROM direct_pairings WHERE code = ? AND expires_at > ?').bind(roomCode,Date.now()).first<Pairing>();
    if(!row)return json({error:'Der Kopplungscode ist abgelaufen oder nicht vorhanden. Bitte neuen Code erzeugen oder QR verwenden.'},404);
    if(body.action==='offer')return json({offer:JSON.parse(row.offer),expiresAt:row.expires_at});
    if(body.action==='answer'){
      const offer=JSON.parse(row.offer);
      if(!validDescription(body.answer,'answer')||body.answer.protocol!==offer.protocol||body.answer.sessionId!==offer.sessionId||body.answer.connectionId!==offer.connectionId||typeof body.joinToken!=='string'||body.joinToken.length<20||body.joinToken.length>100)return json({error:'Diese Antwort passt nicht zum Verbindungsangebot.'},400);
      const answer=JSON.stringify(body.answer);
      if(row.answer){return row.join_token===body.joinToken&&row.answer===answer?json({ok:true}):json({error:'Dieser Code wurde bereits von einer anderen Kopplung verwendet.'},409);}
      const updated=await env.DB!.prepare('UPDATE direct_pairings SET answer = ?, join_token = ? WHERE code = ? AND answer IS NULL AND expires_at > ?').bind(answer,body.joinToken,roomCode,Date.now()).run();
      return updated.meta.changes?json({ok:true}):json({error:'Die Kopplung hat sich inzwischen geändert. Bitte erneut versuchen.'},409);
    }
    if(req.headers.get('X-Pairing-Token')!==row.host_token)return json({error:'Nur der Gastgeber kann die Antwort abrufen.'},403);
    if(body.action==='poll')return json({answer:row.answer?JSON.parse(row.answer):null,expiresAt:row.expires_at});
    if(body.action==='close'){await env.DB!.prepare('DELETE FROM direct_pairings WHERE code = ? AND host_token = ?').bind(roomCode,row.host_token).run();return json({ok:true});}
    return json({error:'Unbekannte Kopplungsaktion.'},400);
  }catch{return json({error:'Die Code-Kopplung ist gerade nicht erreichbar. Offline kannst du per QR koppeln.'},503);}
}
