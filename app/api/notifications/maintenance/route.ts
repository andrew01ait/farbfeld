import {env} from 'cloudflare:workers';
import {maintainPushOutbox,pushConfigured} from '../../../../lib/notifications.js';
// This endpoint can only recover already-authorized, persisted game events.
// No recipient, payload, room, URL or secret can be supplied by the caller.
export async function POST(req:Request){
 const origin=req.headers.get('Origin');
 if(origin&&origin!==new URL(req.url).origin)return Response.json({error:'origin'},{status:403});
 if(!req.headers.get('Content-Type')?.startsWith('application/json'))return Response.json({error:'format'},{status:415});
 try{
  const body=await req.text();if(body.trim()!=='{}')return Response.json({error:'body'},{status:400});
  if(!pushConfigured(env))return Response.json({error:'unavailable'},{status:503});
  return Response.json(await maintainPushOutbox(env),{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'unavailable'},{status:503});}
}

export async function GET(){
 try{const row=await env.DB!.prepare("SELECT next_run_at FROM room_maintenance WHERE id = 'push-outbox-sweep'").first<{next_run_at:number}>();return Response.json({configured:pushConfigured(env),lastSweepAt:row?.next_run_at||null},{headers:{'Cache-Control':'no-store'}});}
 catch{return Response.json({error:'unavailable'},{status:503});}
}
