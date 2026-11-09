import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {DatabaseSync} from 'node:sqlite';
import {pathToFileURL} from 'node:url';
test('Push-Wartung erlaubt nur die leere feste Aktion, begrenzt Aufrufe und persistiert den Lauf ohne Nachricht',async t=>{
 const sql=new DatabaseSync(':memory:');t.after(()=>sql.close());for(const file of fs.readdirSync('drizzle').filter(name=>name.endsWith('.sql')).sort())sql.exec(fs.readFileSync('drizzle/'+file,'utf8'));
 const DB={prepare(query){let args=[];return {bind(...v){args=v;return this;},async first(){return sql.prepare(query).get(...args)||null;},async all(){return {results:sql.prepare(query).all(...args)};},async run(){return {meta:{changes:Number(sql.prepare(query).run(...args).changes)}};}};}};
 globalThis.__pushMaintenanceTest={DB,FARBFELD_VAPID_PUBLIC_KEY:'configured-public',FARBFELD_VAPID_PRIVATE_KEY:'configured-private',FARBFELD_VAPID_SUBJECT:'https://farbfeld.test'};
 const source=fs.readFileSync('app/api/notifications/maintenance/route.ts','utf8').replace("import {env} from 'cloudflare:workers';",'const env=globalThis.__pushMaintenanceTest;').replace('../../../../lib/notifications.js',pathToFileURL(process.cwd()+'/lib/notifications.js').href);
 const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
 const api=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
 const call=(body='{}',headers={})=>api.POST(new Request('https://farbfeld.test/api/notifications/maintenance',{method:'POST',headers:{'Content-Type':'application/json',...headers},body}));
 assert.equal((await call('{}',{Origin:'https://evil.test'})).status,403);assert.equal((await call('{}',{'Content-Type':'text/plain'})).status,415);assert.equal((await call('{"recipient":"other"}')).status,400);
 assert.equal((await (await api.GET()).json()).lastSweepAt,null);
 const result=await (await call()).json();assert.equal(result.ok,true);assert.equal(result.processed,0);assert.equal((await (await api.GET()).json()).lastSweepAt,result.lastSweepAt);
 assert.equal((await (await call()).json()).skipped,true);assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM notification_dispatches').get().n,0);
});
