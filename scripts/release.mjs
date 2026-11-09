import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {DOCUMENTS} from './check-release.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),version=process.argv[2];
if(!/^\d+\.\d+\.\d+$/.test(version||''))throw Error('Aufruf: node scripts/release.mjs <neue-version>');
const read=file=>fs.readFileSync(path.join(root,file),'utf8'),write=(file,contents)=>fs.writeFileSync(path.join(root,file),contents);
const metadata=JSON.parse(read('public/version.json')),previous=metadata.version;
write('public/game/pwa.js',read('public/game/pwa.js').replace(/APP_VERSION='[^']+'/,"APP_VERSION='"+version+"'"));
write('public/sw.js',read('public/sw.js').replace(/const VERSION='[^']+'/,"const VERSION='"+version+"'"));
write('public/play.html',read('public/play.html').replace(/data-farbfeld-app="[^"]+"/,'data-farbfeld-app="'+version+'"'));
const pkg=JSON.parse(read('package.json'));pkg.version=version;write('package.json',JSON.stringify(pkg,null,2)+'\n');
const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Vienna',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
metadata.version=version;if(previous!==version)metadata.releaseDate=date;
metadata.offlineAssetCount=JSON.parse(read('public/sw.js').match(/const FILES=(\[.*?\]);/s)[1].replaceAll("'",'"')).length;
write('public/version.json',JSON.stringify(metadata,null,2)+'\n');
for(const file of DOCUMENTS){
 let contents=read(file).replace(/<!-- farbfeld-version: [^>]+ -->/,'<!-- farbfeld-version: '+version+' -->');
 if(file==='README.md')contents=contents.replace(/\[Version \d+\.\d+\.\d+\]/,'[Version '+version+']').replace(/PWA enthält \d+ atomar/,'PWA enthält '+metadata.offlineAssetCount+' atomar');
 if(file==='docs/README.md')contents=contents.replace(/Client \d+\.\d+\.\d+/,'Client '+version);
 if(file==='docs/architecture.md')contents=contents.replace(/\| \d+ statische Dateien \|/,'| '+metadata.offlineAssetCount+' statische Dateien |');
 if(file==='CHANGELOG.md'&&!new RegExp('^## '+version.replaceAll('.','\\.')+'\\b','m').test(contents))contents=contents.replace(/(<!-- farbfeld-version: [^>]+ -->\n)/,'$1\n## '+version+' – '+date+'\n\nRELEASE_NOTES_REQUIRED: Änderungen, Prüfung und verbleibende Grenzen eintragen.\n');
 write(file,contents);
}
console.log('Version '+version+' vorbereitet. Dokumentationsinhalt und Changelog prüfen; anschließend npm run check:docs.');
