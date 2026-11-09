export const APP_VERSION='1.17.2';
export const UPDATE_CHECK_INTERVAL=5*60*1000;
function newerVersion(version){
 if(!/^\d+\.\d+\.\d+$/.test(version||''))return false;
 const current=APP_VERSION.split('.').map(Number),next=version.split('.').map(Number);
 for(let i=0;i<3;i++)if(current[i]!==next[i])return next[i]>current[i];
 return false;
}
export function createPwa(onChange=()=>{},onInstalled=()=>{}) {
  const state={status:'checking',message:'Offline-Dateien werden geprüft …',version:APP_VERSION,availableVersion:null,offlineReady:false,recovery:false,installed:matchMedia('(display-mode: standalone)').matches,prompt:null};
  let registration=null,checking=null,lastCheck=-Infinity;
  const publish=()=>onChange({...state});
  function set(status,message){state.status=status;state.message=message;publish();}
  function workerStatus(worker){return new Promise((resolve,reject)=>{
    const channel=new MessageChannel();
    const timer=setTimeout(()=>{channel.port1.close();reject(Error('Der Offline-Speicher antwortet nicht. Bitte erneut prüfen.'));},6000);
    channel.port1.onmessage=e=>{clearTimeout(timer);channel.port1.close();resolve(e.data);};
    worker.postMessage({type:'OFFLINE_STATUS'},[channel.port2]);
  });}
  function activeWorker(reg){return new Promise((resolve,reject)=>{
    const current=reg.installing||reg.waiting;
    if(!current&&reg.active){resolve(reg.active);return;}
    if(!current){reject(Error('Der Offline-Dienst wurde nicht gestartet.'));return;}
    const timer=setTimeout(()=>{current.removeEventListener('statechange',changed);reject(Error('Der Offline-Download dauert länger. Bitte erneut prüfen.'));},20000);
    function changed(){
      if(current.state==='activated'){clearTimeout(timer);current.removeEventListener('statechange',changed);resolve(current);}
      else if(current.state==='redundant'){clearTimeout(timer);current.removeEventListener('statechange',changed);reject(Error('Nicht alle Offline-Dateien konnten geladen werden. Bitte online erneut prüfen.'));}
    }
    current.addEventListener('statechange',changed);changed();
  });}
  async function check(force=false,background=false){
    if(checking)return checking;
    if(background&&(!navigator.onLine||globalThis.document?.hidden||!force&&Date.now()-lastCheck<60000))return;
    lastCheck=Date.now();
    checking=(async()=>{
      if(!window.isSecureContext||!('serviceWorker'in navigator)){set('unsupported','Offline-Installation benötigt HTTPS und einen Browser mit Service-Worker-Unterstützung.');return;}
      try{
        if(!background||!state.offlineReady&&state.status!=='update')set('checking','Offline-Dateien werden geladen und geprüft …');
        const existing=await navigator.serviceWorker.getRegistration('/');
        // A hotspot without Internet may still report onLine=true. Confirm
        // the local worker/cache before attempting a potentially slow update.
        if(existing?.active){
          registration=existing;
          try{
            const saved=await workerStatus(existing.active);
            if(saved.ready){
              state.availableVersion=newerVersion(saved.version)?saved.version:null;state.offlineReady=saved.version===APP_VERSION;state.recovery=false;
              if(state.offlineReady)set('ready','Alle Spieldateien sind auf diesem Gerät offline verfügbar.');
              else if(newerVersion(saved.version))set('update',`Version ${saved.version} ist bereit. Öffne sie mit „Aktualisieren“. Deine bestätigten Züge bleiben gespeichert.`);
              else if(!navigator.onLine)throw Error('Der aktuelle Offline-Download benötigt Internet.');
              if(!navigator.onLine)return;
            }
          }catch{}
        }
        registration=!navigator.onLine&&existing?.active?existing:await navigator.serviceWorker.register('/sw.js',{scope:'/',updateViaCache:'none'});
        if(registration.active&&navigator.onLine)await registration.update();
        const active=await activeWorker(registration);
        const result=await workerStatus(active);
        state.availableVersion=result.ready&&newerVersion(result.version)?result.version:null;
        state.offlineReady=!!result.ready&&result.version===APP_VERSION;state.recovery=false;
        if(result.ready&&result.version===APP_VERSION)set('ready','Alle Spieldateien sind auf diesem Gerät offline verfügbar.');
        else if(result.ready&&newerVersion(result.version))set('update',`Version ${result.version} ist bereit. Öffne sie mit „Aktualisieren“. Deine bestätigten Züge bleiben gespeichert.`);
        else throw Error('Der Offline-Download ist noch nicht vollständig. Bitte erneut prüfen.');
      }catch(error){
        state.recovery=/redirect|behind a redirect/i.test(error?.message||'');
        try{const cached=registration?.active||(await navigator.serviceWorker.getRegistration('/'))?.active;if(cached){const result=await workerStatus(cached);state.offlineReady=!!result.ready&&result.version===APP_VERSION;if(result.ready&&newerVersion(result.version)&&!state.recovery){state.availableVersion=result.version;set('update',`Version ${result.version} ist bereit. Öffne sie mit „Aktualisieren“. Deine bestätigten Züge bleiben gespeichert.`);return;}}}catch{}
        if(background&&state.offlineReady&&!state.recovery){set('ready','Alle Spieldateien sind auf diesem Gerät offline verfügbar.');return;}
        const message=state.recovery?'Diese Installation verwendet eine weitergeleitete alte Adresse. Sichere deine lokalen Spielstände und öffne die aktuelle Adresse über „Hilfe beim App-Umzug“.':/offline|fetch|network|internet/i.test(error?.message||'')?'Das Update konnte nicht geladen werden. Bitte Internet prüfen und erneut versuchen.':'Die Offline-Dateien konnten nicht vollständig geprüft werden. Bitte mit Internet erneut prüfen.';
        set('error',message+(state.offlineReady?' Die bereits geladene Version bleibt offline nutzbar.':''));
      }
    })().finally(()=>{checking=null;});
    return checking;
  }
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();state.prompt=event;publish();});
  window.addEventListener('appinstalled',()=>{state.prompt=null;state.installed=true;publish();onInstalled();});
  navigator.serviceWorker?.addEventListener('controllerchange',()=>{
    // Never reload a turn or an unconfirmed selection automatically.
    if(checking)checking.finally(()=>check(true,true));else check(true,true);
  });
  window.addEventListener('online',()=>check(true,true));
  globalThis.document?.addEventListener('visibilitychange',()=>check(false,true));
  globalThis.setInterval?.(()=>check(false,true),UPDATE_CHECK_INTERVAL);
  return {state,check,async install(){
    if(!state.prompt)return null;
    const prompt=state.prompt;state.prompt=null;publish();
    await prompt.prompt();const result=await prompt.userChoice;return result.outcome;
  }};
}
