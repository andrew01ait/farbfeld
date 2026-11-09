import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export const DOCUMENTS=['README.md','deployment.md','AGENTS.md','CHANGELOG.md','docs/README.md','docs/architecture.md','docs/flows.md','docs/notifications.md','docs/versions.md','docs/offline-multiplayer.md','docs/internet-rooms.md','docs/statistics.md','docs/room-status.md','docs/responsive-qa.md','docs/reactions.md','docs/computer.md','CONTRIBUTING.md','docs/source-workflow.md','docs/publication.md','docs/offline-diagnostics.md','docs/mines.md','docs/bonus-fields.md','docs/random-board.md','docs/leaving.md','docs/ui-design.md'];
const root=fileURLToPath(new URL('../',import.meta.url));
export function checkRelease(){
 const errors=[],read=file=>fs.readFileSync(path.join(root,file),'utf8');
 let release;try{release=JSON.parse(read('public/version.json'));}catch{return ['public/version.json fehlt oder ist ungültig.'];}
 const version=release.version;if(!/^\d+\.\d+\.\d+$/.test(version))errors.push('Ungültige Clientversion.');
 const versions={
  'package.json':JSON.parse(read('package.json')).version,
  'public/game/pwa.js':read('public/game/pwa.js').match(/APP_VERSION='([^']+)'/)?.[1],
  'public/sw.js':read('public/sw.js').match(/const VERSION='([^']+)'/)?.[1],
  'public/play.html':read('public/play.html').match(/data-farbfeld-app="([^"]+)"/)?.[1],
 };
 for(const [file,value]of Object.entries(versions))if(value!==version)errors.push(file+': Version '+value+' stimmt nicht mit '+version+' überein.');
 const source=read('public/sw.js'),files=JSON.parse(source.match(/const FILES=(\[.*?\]);/s)[1].replaceAll("'",'"'));
 if(files.length!==release.offlineAssetCount)errors.push('Offline-Dateizahl in version.json stimmt nicht.');
 for(const file of files)if(!fs.existsSync(path.join(root,'public',file==='/play'?'play.html':file.slice(1))))errors.push('Offline-Datei fehlt: '+file);
 for(const file of DOCUMENTS){
  if(!fs.existsSync(path.join(root,file))){errors.push('Pflichtdokument fehlt: '+file);continue;}
  const contents=read(file);
  if(!contents.includes('<!-- farbfeld-version: '+version+' -->'))errors.push('Versionsmarker fehlt/veraltet: '+file);
  for(const match of contents.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
   const target=match[1].split('#')[0];if(!target||/^[a-z]+:/i.test(target))continue;
   if(!fs.existsSync(path.resolve(root,path.dirname(file),target)))errors.push('Dokumentlink fehlt: '+file+' → '+target);
  }
 }
 if(errors.some(error=>error.startsWith('Pflichtdokument fehlt:')))return errors;
 const changelog=read('CHANGELOG.md'),escaped=version.replaceAll('.','\\.'),entry=changelog.match(new RegExp('^## (?:Version )?'+escaped+'[^\\n]*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))','m'));
 if(!entry)errors.push('Aktueller Changelog-Eintrag fehlt.');
 else if(!entry[1].trim()||/TBD|RELEASE_NOTES_REQUIRED/.test(entry[1]))errors.push('Neuen Changelog-Eintrag vor dem Release ausfüllen.');
 if(!read('README.md').includes('[Version '+version+']'))errors.push('Versionslink im README ist veraltet.');
 if(!read('docs/README.md').includes('Client '+version))errors.push('Clientversion in der Dokumentationsübersicht ist veraltet.');
 if(!read('README.md').includes('PWA enthält '+files.length+' atomar'))errors.push('Offline-Dateizahl im README ist veraltet.');
 if(!read('docs/architecture.md').includes('| '+files.length+' statische Dateien |'))errors.push('Offline-Dateizahl in Architektur ist veraltet.');
 return errors;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const errors=checkRelease();if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
 else console.log('Farbfeld: Pflichtdokumentation, Clientversionen, Changelog, Offline-Dateien und Dokumentlinks konsistent.');
}
