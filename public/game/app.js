import {bonusSetupHtml,bonusOptionHtml,bonusStatusHtml,bonusAnnouncement} from './bonus-ui.js';
import {BONUS_FEATURE,bonusFieldsEnabled,bonusAwards,validBonusState} from './bonus-fields.js';
import {mineSetupHtml,mineControlsHtml,mineTargetHtml,playMineBlast,mineDamage,mineDamageHtml,MINE_ANIMATION_MS,mineHelpHtml,mineLobbyHtml} from './mine-ui.js';
import {THEMES,themeSymbol,themeMark,themeHeadline} from './themes.js';
import {BOARD,COLORS,LABELS,SHAPES,STARS,FIRST,LATER,COLS,createGame,availableDice,canAct,resolveChoice,validateCells,applyMove,rollGame,score,rankings,findMove,neighbors,minesEnabled,validMineState,canUseMine,applyMineAttack,MINE_FEATURE,mineBlasts,mineBlastTargets,LEAVE_FEATURE,leaveGame,validLeavingState,FORFEIT_SCORE} from './engine.js';
import {nextLocalPlayer,mayInspect,playerRole,turnDescription,moveFeedback,ownTurnKey} from './view-state.js';
import {HUMAN,COMPUTER,COMPUTER_LEVELS,validComputerDifficulty,computerDifficulty,computerLevel,changeComputerDifficulty,createComputerGame,needsComputerTurn,stepComputer} from './computer.js';
import {BoardView} from './board-view.js';
import {createPwa,APP_VERSION} from './pwa.js';
import {DirectDiagnostics} from './direct-diagnostics.js';
import {DirectSession} from './direct.js';
import {DirectUi,directStatus} from './direct-ui.js';
import {DIRECT_KEY} from './direct-game.js';
import {isHidden,isScoreHidden,scoreBreakdown,columnStatus,colorAnnouncements,colorCompletionText,HIDDEN_FEATURE} from './game-info.js';
import {BOARD_CHOICES as BOARDS,BOARD_FEATURE,RANDOM_BOARD_FEATURE,validGameBoard,boardFor,validBoardId} from './boards.js';
import {REACTIONS,REACTION_FEATURE,REACTION_EXTRA_FEATURE,REACTION_INTERVAL,VersionTapCounter,ReactionOverlay,bindReactionPress,pickReactionMotion} from './reactions.js';
import {GameNotifications,describePushDelivery} from './notifications.js';
import {mergeStats,summarizeStats,summarizeOpponent,statsCategory,validStats} from './stats.js';
import {RoomBook,RoomDrafts,MAX_SAVED_ROOMS,savedGamesPreview,filterSavedGames} from './room-book.js';
import {RoomConnectionState,connectionLabels,directPlayerStatus,homeRoomStatus,roomPollDelay,RoomPollScheduler} from './room-status.js';
const CLIENT_FEATURES=[HIDDEN_FEATURE,BOARD_FEATURE,REACTION_FEATURE,REACTION_EXTRA_FEATURE,BONUS_FEATURE,RANDOM_BOARD_FEATURE,MINE_FEATURE,LEAVE_FEATURE];
const versionTaps=new VersionTapCounter(),reactionOverlay=new ReactionOverlay();
let reactionSentAt=-Infinity,lastReactionMotion='',reactionSending=false;
bindReactionPress(document,{onSend:sendPressedEmoji});
const $=s=>document.querySelector(s),app=$('#app'),dialog=$('#dialog');
const newId=()=>Array.from(crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,'0')).join('');
const roomBook=new RoomBook(),roomDrafts=new RoomDrafts();
const KEY='farbfeld.game.v1',ROOMKEY='farbfeld.room.v1',PREFKEY='farbfeld.prefs.v1',HISTORYKEY='farbfeld.history.v1',STATSKEY='farbfeld.stats.v1';
function read(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}}
const prefs={patterns:false,haptics:true,theme:'classic',boardId:'classic',computerDifficulty:'medium',reactionsUnlocked:false,...read(PREFKEY,{})};
if(!THEMES.some(theme=>theme.id===prefs.theme))prefs.theme='classic';
if(!validBoardId(prefs.boardId))prefs.boardId='classic';
if(!validComputerDifficulty(prefs.computerDifficulty))prefs.computerDifficulty='medium';
function applyTheme(){document.documentElement.dataset.theme=prefs.theme;}
applyTheme();
let local=read(KEY,null),room=roomBook.active(),roomState=null,screen='home',viewPid=0,inspectPid=null,handover=false,busy=false,selection=[],choice={ci:null,ni:null,color:null,count:null},offlineReady=false,saveFailed=false,networkError='',animateRoll=false,polling=false,roomAnnounced='',roomAccessDenied=false;
let history=read(HISTORYKEY,[]),toastTimer;
let statistics=mergeStats(read(STATSKEY,null),history);
persist(STATSKEY,statistics);
let colorNoticeGame='',seenColorNotices=new Set(),bonusNoticeGame='',seenBonusNotices=new Set();
const boardView=new BoardView(),roomConnection=new RoomConnectionState();
let roomPollFailures=0,roomProgressKey='',roomProgressAt=performance.now(),roomEpoch=0,roomIndexChecked=false,roomIndexAttemptAt=-Infinity,savedRoomsMarkup='';
const roomSnapshots=new Map();
const roomPoller=new RoomPollScheduler({run:pollRoom,delay:()=>{
 if(document.hidden||navigator.onLine===false||busy||polling||!['home','room'].includes(screen))return null;
 if(screen==='home'){const entries=roomBook.entries();if(!entries.length||roomIndexChecked&&!entries.some(entry=>entry.summary?.access==='ok'&&entry.summary?.gameStatus==='playing'))return null;return roomPollFailures?Math.min(120000,60000*2**Math.min(roomPollFailures-1,1)):60000;}
 return !room||roomAccessDenied?null:roomPollDelay({visible:true,online:true,screen,game:roomState?.game,playerId:room.playerId,failures:roomPollFailures,idleFor:performance.now()-roomProgressAt,busy:false});
}});

function noteRoomProgress(game){const key=room?.code+':'+(game?[game.gameId,game.round,game.phase,game.active,game.submitted.join(',')].join(':'):'lobby');if(key!==roomProgressKey){roomProgressKey=key;roomProgressAt=performance.now();}}

let discardDirectRequest=null,abortRequest=null,pendingLeave=null,selectionNotice=null,choiceObserver=null,choiceFrame=0,computerTimer=0,nextComputerHidden=false,nextComputerBoard='classic',nextComputerDifficulty='medium',nextComputerMines=false,nextComputerBonus=false,nextSoloBonus=false,mineRequest=null,computerNotBefore=0,mineNoticeGame='',mineWasUnlocked=false,mineUnlockedSeen=new Set(),mineReadyUntil=0,mineBlastGame='',seenMineBlasts=new Set(),computerLevelGameId=null,nextSoloBoard='classic';
let dismissedUpdate='',pwa,pwaInfo={status:'checking',message:'Offline-Dateien werden geprüft …'};
const notifications=new GameNotifications({onChange:()=>refreshNotificationPanel(),onOpen:value=>openNotificationGame(value)});
const paths={trash:'M3 6h18M8 6V3h8v3M5 6l1 15h12l1-15M10 10v7m4-7v7',chart:'M4 3v18h17M8 16v-5m5 5V6m5 10v-7',computer:'M6 5h12a2 2 0 0 1 2 2v9H4V7a2 2 0 0 1 2-2M2 20h20M9 9h.01M15 9h.01M9 13h6',help:'M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4m0 4h.01 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',download:'M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5',solo:'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M5 21v-2a7 7 0 0 1 14 0v2',users:'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M3 21v-3a6 6 0 0 1 12 0v3M17 5a3 3 0 0 1 0 6m2 10v-3a6 6 0 0 0-3-5',wifi:'M3 8a15 15 0 0 1 18 0M6 12a10 10 0 0 1 12 0m-9 4a5 5 0 0 1 6 0m-3 4h.01',check:'m5 12 4 4L19 6',shield:'M12 3 3 7v6c0 5 9 9 9 9s9-4 9-9V7l-9-4m-4 9 3 3 5-6',dice:'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4M8 8h.01M16 16h.01M16 8h.01M8 16h.01M12 12h.01',arrow:'M5 12h14m-5-5 5 5-5 5',refresh:'M20 7v5h-5m5 0a8 8 0 1 0-2 6',undo:'M9 5 4 10l5 5M4 10h9a6 6 0 0 1 0 12',bulb:'M9 18h6m-6 3h6M8 14a6 6 0 1 1 8 0l-1 3H9l-1-3',settings:'M4 7h16M4 17h16M8 4v6m8 4v6',share:'M12 16V3m-5 5 5-5 5 5M5 13v8h14v-8',clock:'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',close:'m6 6 12 12M18 6 6 18',copy:'M8 8h12v13H8zM16 8V3H3v13h5',edit:'m16 3 5 5-12 12-6 1 1-6L16 3m-2 2 5 5',eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12m13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0'};
const icon=(name,cls='')=>`<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name]||paths.dice}"/></svg>`;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const logo=()=>'<img class="brand-icon" src="/icon.svg" alt="" aria-hidden="true" width="36" height="36">';
function persist(key,data){try{localStorage.setItem(key,JSON.stringify(data));return true;}catch{saveFailed=true;toast('Der Gerätespeicher ist voll. Bitte exportiere deinen Spielstand.');return false;}}
function saveLocal(){persist(KEY,local);}
function toast(msg){clearTimeout(toastTimer);$('#toast').textContent=msg;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),4000);}
function vibrate(){if(prefs.haptics&&navigator.vibrate)navigator.vibrate(12);}
function resetSelection(){selectionNotice=null;selection=[];choice={ci:null,ni:null,color:null,count:null};}
const currentGame=()=>screen==='room'?roomState?.game:screen==='direct'?direct.snapshot?.game:local;
function myPid(g){if(g.mode==='computer')return HUMAN;if(screen==='direct')return direct.pid;return screen==='room'?g.players.findIndex(p=>p.id===room?.playerId):g.mode==='local'&&g.status==='playing'?nextLocalPlayer(g):viewPid;}
function displayedPid(g){return inspectPid??myPid(g);}
function writable(g,pid){if(screen==='direct'&&(!direct.ready||direct.pending||pid!==direct.pid))return false;return (g.mode!=='computer'||pid===HUMAN)&&!handover&&canAct(g,pid)&&(screen!=='room'||g.players[pid].id===room?.playerId)&&(g.mode!=='local'||pid===nextLocalPlayer(g))&&inspectPid===null;}
function currentMoveFeedback(g,pid){
 const base=moveFeedback(g,pid,choice,selection);if(!base)return null;
 if(busy)return {...base,tone:'info',title:'Dein Zug wird gespeichert …',detail:'Bitte warte auf die Bestätigung.'};
 return selectionNotice?{...base,...selectionNotice}:base;
}
function feedbackHTML(value){
 if(!value)return '';
 const symbol=value.tone==='success'?'✓':value.tone==='error'||value.tone==='warning'?'!':'i';
 const compact=value.code==='dice'&&value.tone==='info'?'Farbe + Zahl wählen.':value.title;
 const detail=value.code==='dice'&&value.tone==='info'?'Würfel antippen, dann Felder markieren.':value.detail.split('. ')[0].replace(/\.$/,'')+'.';
 return '<div id="move-feedback" class="move-feedback '+value.tone+'" role="status" aria-live="polite" aria-atomic="true"><span class="feedback-symbol" aria-hidden="true">'+symbol+'</span><div class="feedback-copy"><strong><span class="feedback-full">'+esc(value.title)+'</span><span class="feedback-compact">'+esc(compact)+'</span></strong><p class="feedback-full">'+esc(value.detail)+'</p><p class="feedback-compact">'+esc(detail)+'</p></div><button class="feedback-help" data-action="move-help" aria-label="Vollständigen Hinweis anzeigen" title="Vollständigen Hinweis anzeigen">i</button></div>';
}
function selectionMessage(title,detail){selectionNotice={tone:'warning',title,detail};vibrate();render();}
function syncChoicePanel(){
 const shell=$('.app-shell'),card=$('.dice-card.choosing');if(!shell)return;
 const fixed=card&&getComputedStyle(card).position==='fixed';
 shell.style.setProperty('--choice-panel-space',fixed?Math.ceil(card.getBoundingClientRect().height+24)+'px':'0px');
 const side=$('.side-area');if(side){const viewport=window.visualViewport;const bottom=viewport?viewport.offsetTop+viewport.height:window.innerHeight;shell.style.setProperty('--side-area-height',Math.max(100,bottom-side.getBoundingClientRect().top-8)+'px');}
}
function scheduleChoicePanel(){cancelAnimationFrame(choiceFrame);choiceFrame=requestAnimationFrame(()=>{syncChoicePanel();boardView.measure(false);});}
window.addEventListener('resize',scheduleChoicePanel);
function header(){return `<header class="topbar"><div class="brand"><button class="brand-home" data-action="home" aria-label="Farbfeld Startseite">${logo()}</button><span class="brand-copy"><button class="brand-home brand-title" data-action="home">Farbfeld</button><button class="app-version" data-action="version-tap" aria-label="App-Version ${APP_VERSION}">v${APP_VERSION}</button></span></div><div class="header-actions"><button class="soft-btn" data-action="install" aria-label="App installieren">${icon('download')}<span class="install-label">App installieren</span></button><button class="icon-btn" data-action="share-game" aria-label="Spiel teilen" title="Spiel teilen">${icon('share')}</button><button class="icon-btn" data-action="rules" aria-label="Spielregeln">${icon('help')}</button><button class="icon-btn" data-action="settings" aria-label="Einstellungen">${icon('settings')}</button></div></header>`;}
function updateNotice(){
 const visible=pwaInfo.status==='update'&&pwaInfo.availableVersion!==dismissedUpdate;
 return '<div id="app-update" class="app-update" role="status" aria-live="polite" '+(visible?'':'hidden')+'>'+(visible?'<span><strong>Farbfeld '+esc(pwaInfo.availableVersion)+' ist bereit.</strong><small>Bestätigte Züge bleiben gespeichert.</small></span><button data-action="reload-app">Jetzt aktualisieren '+icon('refresh')+'</button><button class="update-later" data-action="dismiss-update" aria-label="Update später durchführen">Später</button>':'')+'</div>';
}
function miniBoard(){const sample=[7,22,37,52,53,54,39,38,23,8,9,10,24,25,36];return `<div class="hero-art" aria-hidden="true"><div class="spark">✳</div><div class="mini-sheet"><div class="mini-head"><span>DEIN NÄCHSTER GUTER ZUG.</span><span>✦</span></div><div class="mini-grid">${BOARD.map((c,i)=>`<div class="mini-cell" style="background:var(--${c})">${sample.includes(i)?'×':STARS.includes(i)?'☆':''}</div>`).join('')}</div><div class="mini-bottom"><span>FARBEN SAMMELN. FREUDE WÜRFELN.</span><span>+5</span></div></div><div class="art-dice"><div class="art-die color">✳</div><div class="art-die">4</div></div></div>`;}
const savedRoomsView={filter:'all',query:'',page:0};
function participantsHTML(participants=[]){
 const people=participants.filter(p=>p?.name);if(!people.length)return '';
 return '<p class="room-participants" aria-label="Mitspielende">'+people.map(p=>p.host?'<strong class="room-host" title="Gastgeber" aria-label="'+esc(p.name+', Gastgeber')+'">'+esc(p.name)+' <span aria-hidden="true">♛</span></strong>':esc(p.name)).join(', ')+'</p>';
}
function savedGameModeHTML(mode){
 const titles={room:'Internet-Raum',direct:'Direktpartie über WLAN/Hotspot',local:'Partie auf diesem Handy'};
 return '<span class="saved-game-mode" data-game-mode="'+(mode==='room'?'online':'offline')+'" title="'+titles[mode]+'">'+(mode==='room'?'Online':'Offline')+'</span>';
}
function savedGameMetaHTML(mode,text){return '<p class="room-card-meta">'+savedGameModeHTML(mode)+'<span aria-hidden="true"> · </span><span>'+esc(text)+'</span></p>';}
function home(){const best=history.filter(h=>h.mode==='solo').reduce((a,h)=>Math.max(a,h.score),-Infinity);return `${savedRoomsHTML()}<div class="hero"><div class="hero-copy"><div class="pill"><i class="dot"></i> KLEINES SPIEL. GROSSE MÖGLICHKEITEN.</div><h1 class="${prefs.theme==='classic'?'':'theme-headline'}">${themeHeadline(prefs.theme)}</h1><p>Wähle deine Würfel. Verbinde die Farben.<br>Und mach aus kleinen Kreuzen große Punkte.</p></div>${miniBoard()}</div><div class="mode-heading"><span class="eyebrow">WIE MÖCHTEST DU SPIELEN?</span><button class="outline-btn stats-entry" data-action="profile" aria-label="Profil und Statistik öffnen">${icon('chart')}Statistik</button></div><div class="mode-grid"><button class="mode-card solo" data-action="solo"><span class="mode-icon">${icon('solo')}</span><h3>Nur du.</h3><p>30 Würfe. Dein Spielfeld.<br>Wie viel holst du raus?</p><span class="arrow">↗</span></button><button class="mode-card computer" data-action="computer"><span class="mode-icon">${icon('computer')}</span><h3>Gegen den Computer.</h3><p>Du gegen einen automatischen Gegner.<br>Ein Handy. Auch offline.</p><span class="arrow">↗</span></button><button class="mode-card" data-action="together"><span class="mode-icon">${icon('users')}</span><h3>Zusammen.</h3><p>2–6 Personen. Ein Handy<br>oder ein Gerät pro Person.</p><span class="arrow">↗</span></button></div>${history.length?`<div class="home-stats"><span><b>${history.length}</b> Partien gespielt</span>${best!==-Infinity?`<span><b>${best}</b> Solo-Bestwert</span>`:''}</div>`:''}<div class="feature-row"><span>${icon('wifi')}${offlineReady?'Offline bereit':pwaInfo.status==='checking'?'Offline vorbereiten':'Offline prüfen'}</span><span>${icon('check')}Automatisch gespeichert</span><span>${icon('shield')}Ohne Werbung</span></div><footer class="footer"><span>Eine persönliche Umsetzung nach „Noch mal!“<br>Spielidee: Inka & Markus Brand · Schmidt Spiele</span><button data-action="about">Über das Spiel ↗</button></footer>`;}
function roomHomeStatus(entry=room){
 const data=entry?.summary;
 if(data?.access==='missing')return {kind:'unknown',text:'Nicht mehr vorhanden · Zugang entfernen oder neuen Raum erstellen',button:'Öffnen'};
 if(data?.access==='denied')return {kind:'unknown',text:'Gespeicherten Spielerzugang prüfen',button:'Öffnen'};
 if(navigator.onLine===false)return {kind:'unknown',text:'Offline · Zum Öffnen Internet verbinden',button:'Öffnen'};
 if(!data?.checkedAt)return {kind:'unknown',text:'Zugstatus wird geprüft …',button:'Öffnen'};
 if(Date.now()-data.checkedAt>90000)return {kind:'unknown',text:'Zuletzt: '+(data.turn?.text||'Status unbekannt'),button:'Öffnen'};
 return data.turn||{kind:'unknown',text:'Status wird geprüft …',button:'Öffnen'};
}
function roomTurnHTML(value){
 if(value.kind!=='turn')return esc(value.text);
 const [title,detail]=value.text.split(' · ');
 return '<span class="room-turn-title">'+esc(title)+'</span> <span class="room-turn-detail">'+esc(detail||'')+'</span>';
}
function roomHomeMeta(entry=room){const count=entry?.summary?.memberCount;return entry.code+(count?' · '+count+(count===1?' Person':' Personen'):'');}
function roomResumeHTML(entry=room,manage=false){
 const value=roomHomeStatus(entry),due=entry.summary?.cleanupAt&&entry.summary.cleanupAt<=Date.now()&&entry.summary.access==='ok';
 return '<article class="resume room-resume '+(value.kind==='turn'?'your-turn':'')+'" data-room-card="'+entry.code+'"><div class="room-resume-info"><strong>'+esc(entry.roomName||'Dein Spielraum')+'</strong>'+savedGameMetaHTML('room',roomHomeMeta(entry))+participantsHTML(entry.summary?.participants)+'<div class="room-resume-status" data-room-turn role="status">'+roomTurnHTML(value)+'</div>'+(due?'<small class="room-cleanup-warning">14 Tage inaktiv · Öffnen, solange noch vorhanden</small>':'')+'</div><div class="room-card-actions"><button class="icon-btn room-open" data-action="open-saved-room" data-code="'+entry.code+'" aria-label="'+esc((entry.roomName||'Spielraum')+' '+entry.code+' öffnen')+'" title="Spielraum öffnen"><span class="visually-hidden" data-room-open>'+value.button+'</span>'+icon('arrow')+'</button>'+(manage?'<button class="icon-btn room-remove" aria-label="'+esc('Zugang zu '+(entry.roomName||entry.code)+' auf diesem Gerät entfernen')+'" title="Zugang entfernen" data-action="forget-saved-room" data-code="'+entry.code+'">'+icon('trash')+'</button>':'')+'</div></article>';
}
function savedGameItems(){
 const items=roomBook.entries().map(entry=>({key:'room:'+entry.code,kind:'room',mode:'online',entry,lastOpenedAt:entry.lastOpenedAt,needsAction:roomHomeStatus(entry).kind==='turn',searchText:[entry.roomName,entry.code,...(entry.summary?.participants||[]).map(p=>p.name)].join(' ')}));
 if(local?.status==='playing'){
  const pid=local.mode==='local'?nextLocalPlayer(local):0;
  items.push({key:'local',kind:'local',mode:'offline',needsAction:!!local.players[pid]&&!local.players[pid].left&&(canAct(local,pid)||local.phase==='roll'&&local.active===pid),searchText:[local.mode==='solo'?'Solo':local.mode==='computer'?'Computer':'Ein Handy',...local.players.map(p=>p.name)].join(' ')});
 }
 if(direct.saved){const g=direct.snapshot.game;items.push({key:'direct',kind:'direct',mode:'offline',needsAction:!!g&&direct.ready&&!direct.pending&&!g.players[direct.pid]?.left&&(canAct(g,direct.pid)||g.status==='playing'&&g.phase==='roll'&&g.active===direct.pid),searchText:[direct.snapshot.roomName||'Direktpartie',...direct.snapshot.members.map(p=>p.name)].join(' ')});}
 return items;
}
function localResumeHTML(){
 const title=local.mode==='solo'?'Deine Solo-Partie.':local.mode==='computer'?'Gegen den Computer.':'Gemeinsam an einem Handy.';
 const detail=(local.mode==='computer'?'Computer · '+computerLevel(local).label:local.mode==='solo'?'Solo':local.players.length+' Personen')+' · Wurf '+local.round;
 return '<article class="resume local-resume"><div class="room-resume-info"><strong>'+title+'</strong>'+savedGameMetaHTML('local',detail)+participantsHTML(local.players.map(p=>({name:p.name,host:false})))+'<small>'+(isScoreHidden(local)?'Verdeckter Punktestand':score(local.players[0],local).total+' Punkte')+'</small></div><div class="room-card-actions"><button class="icon-btn room-open" data-action="continue" aria-label="Gespeicherte '+(local.mode==='solo'?'Solo-Partie':local.mode==='computer'?'Computerpartie':'Ein-Handy-Partie')+' öffnen">'+icon('arrow')+'</button></div></article>';
}
function savedGameCardHTML(item,manage=false){return item.kind==='room'?roomResumeHTML(item.entry,manage):item.kind==='direct'?directResumeHTML():localResumeHTML();}
function savedRoomsHTML(){
 const items=savedGameItems();if(!items.length)return '<section id="saved-rooms"></section>';
 const preview=savedGamesPreview(items),otherTurns=items.filter(e=>e.needsAction).length-preview.filter(e=>e.needsAction).length;
 return '<section id="saved-rooms" class="saved-rooms" aria-label="Gespeicherte Partien und Spielräume"><div class="saved-rooms-heading"><h2>Deine Räume <small>'+items.length+'</small></h2><button class="text-btn" data-action="manage-rooms">Alle Räume</button><button class="outline-btn" data-action="room-setup" aria-label="Raum hinzufügen" title="Raum hinzufügen">'+icon('users')+'<span class="saved-room-add-label">Raum hinzufügen</span></button></div><div class="saved-room-list">'+preview.map(item=>savedGameCardHTML(item)).join('')+'</div>'+(otherTurns?'<p class="saved-rooms-other-turns" role="status">Weitere '+otherTurns+' '+(otherTurns===1?'Partie wartet':'Partien warten')+' auf deinen Zug.</p>':'')+(items.length>preview.length?'<button class="outline-btn saved-rooms-more" data-action="manage-rooms">Alle '+items.length+' Partien anzeigen</button>':'')+'</section>';
}
function roomManagerResultsHTML(){
 const result=filterSavedGames(savedGameItems(),savedRoomsView);savedRoomsView.page=result.page;
 return '<p class="room-list-count" role="status">'+(result.total?result.start+'–'+result.end+' von '+result.total+' '+(result.total===1?'Partie':'Partien'):'Keine passenden Partien.')+'</p><div class="saved-room-list room-manager-list">'+result.entries.map(item=>savedGameCardHTML(item,true)).join('')+'</div>'+(result.pages>1?'<nav class="room-list-pages" aria-label="Seiten der gespeicherten Partien"><button class="outline-btn" data-action="rooms-page-prev" '+(result.page===0?'disabled':'')+'>Zurück</button><span aria-label="Seite '+(result.page+1)+' von '+result.pages+'">'+(result.page+1)+' / '+result.pages+'</span><button class="outline-btn" data-action="rooms-page-next" '+(result.page===result.pages-1?'disabled':'')+'>Weiter</button></nav>':'');
}
function refreshRoomManagerResults(){
 const slot=$('#room-manager-results');if(!dialog.open||dialog.dataset.panel!=='rooms'||!slot)return;
 slot.innerHTML=roomManagerResultsHTML();const items=savedGameItems();
 dialog.querySelectorAll('[data-action="rooms-filter"]').forEach(button=>{button.setAttribute('aria-pressed',String(button.dataset.filter===savedRoomsView.filter));const count=items.filter(e=>button.dataset.filter==='all'||e.mode===button.dataset.filter).length;button.textContent=({all:'Alle',online:'Online',offline:'Offline'})[button.dataset.filter]+' ('+count+')';});
}
function roomManager(){
 const items=savedGameItems();
 openModal('Alle Räume.', '<label for="room-list-search">Räume suchen</label><input id="room-list-search" type="search" maxlength="80" autocomplete="off" value="'+esc(savedRoomsView.query)+'" placeholder="Name, Code oder Person"><div class="room-list-filters" role="group" aria-label="Spielmodus filtern">'+[['all','Alle'],['online','Online'],['offline','Offline']].map(([filter,label])=>'<button class="outline-btn" data-action="rooms-filter" data-filter="'+filter+'" aria-pressed="'+(savedRoomsView.filter===filter)+'">'+label+' ('+items.filter(e=>filter==='all'||e.mode===filter).length+')</button>').join('')+'</div><div id="room-manager-results">'+roomManagerResultsHTML()+'</div><div class="room-list-actions"><button class="outline-btn" data-action="refresh-saved-rooms">Status aktualisieren</button><button class="outline-btn" data-action="room-setup">Neuer Internet-Raum</button></div><details class="room-list-help"><summary>Hinweise</summary><p>Internet-Räume können nach 14 Tagen ohne Öffnen oder Spielaktion bereinigt werden. Gespeicherte Offline-Partien bleiben auf diesem Gerät.</p></details>','rooms');
}
function rememberRoomDraft(){if(screen==='room'&&roomState?.game&&room)roomDrafts.save(room.code+':'+room.playerId,roomState.game,myPid(roomState.game),choice,selection);}
function rememberRoomSnapshot(data,session=room){
 if(!session)return;
 const pid=data.game?.players.findIndex(player=>player.id===session.playerId)??-1;
 roomSnapshots.set(session.code+':'+session.playerId,data);
 const previous=roomBook.get(session.code);if(previous?.token!==session.token)return;
 if(!roomBook.update(session.code,session.token,{access:'ok',roomName:data.roomName||'',memberCount:data.members?.length,participants:data.members?.map(m=>({name:m.name,host:m.id===data.hostId})),gameStatus:data.game?.status||'lobby',round:data.game?.round||0,version:data.version,turn:homeRoomStatus(data.game,session.playerId),...(data.cleanupAt!==undefined?{cleanupAt:data.cleanupAt,lastUsedAt:data.lastUsedAt,cleanupDue:data.cleanupDue}:{})}))toast('Der Raumzugang konnte nicht auf diesem Gerät gespeichert werden.');
 if(room?.code===session.code&&room.token===session.token)room.roomName=data.roomName||'';
}
async function openSavedRoom(code){
 if(busy){toast('Bitte kurz auf die Bestätigung warten.');return;}
 const session=roomBook.get(code);if(!session){roomSetup();$('#room-code').value=code||'';return;}
 rememberRoomDraft();roomEpoch++;roomPoller.stop();room={...session};roomState=session.summary?.access==='ok'?roomSnapshots.get(code+':'+session.playerId)||null:null;roomConnection.clear();roomAccessDenied=false;networkError='';roomPollFailures=0;roomAnnounced='';resetSelection();inspectPid=null;handover=false;screen='room';closeModal();
 if(!roomBook.save(session,{activate:true,opened:true}))toast('Der Raumzugang ist nur vorübergehend gespeichert.');
 const epoch=roomEpoch;busy=true;render(true);window.scrollTo(0,0);
 if(navigator.onLine===false){networkError='Du bist offline. Zum Öffnen und Erneuern dieses Spielraums brauchst du Internet.';busy=false;render();return;}
 try{
  const data=await api('open',{},session);if(epoch!==roomEpoch)return;
  roomState=data;roomAnnounced=session.token;roomConnection.receive(session.code,data.presence);rememberRoomSnapshot(data,session);noteRoomProgress(data.game);
  const pid=data.game?.players.findIndex(player=>player.id===session.playerId)??-1,draft=roomDrafts.restore(code+':'+session.playerId,data.game,pid);if(draft){choice=draft.choice;selection=draft.cells;}
  if(data.game)recordResult(data.game);
  reactionOverlay.receiveRoom(data.reactions||[],session.code+':'+(data.game?.gameId||'')+':'+session.playerId);
 }catch(error){if(epoch!==roomEpoch)return;roomConnection.fail(code);networkError=error.status?error.message:'Der Spielraum ist gerade nicht erreichbar. Bitte prüfe deine Internetverbindung.';if(error.status===403||error.status===404){roomAccessDenied=true;roomState=null;roomBook.update(code,session.token,{access:error.status===404?'missing':'denied'});}toast(networkError);}
 finally{if(epoch===roomEpoch){busy=false;render(true);}}
}
async function pollSavedRooms(force=false){
 if(polling||busy||document.hidden||navigator.onLine===false||screen!=='home'&&!(force&&dialog.open&&dialog.dataset.panel==='rooms'))return;
 if(!force&&Date.now()-roomIndexAttemptAt<60000)return;
 const sessions=roomBook.entries().slice(0,MAX_SAVED_ROOMS);if(!sessions.length)return;
 polling=true;roomIndexAttemptAt=Date.now();roomPoller.stop();const epoch=roomEpoch,activeCode=room?.code;
 try{
  const data=await api('index',{rooms:sessions.map(entry=>({code:entry.code,token:entry.token})),activeCode},null);
  for(const item of data.rooms||[]){const session=sessions.find(entry=>entry.code===item.code),stored=roomBook.get(item.code);if(!session||stored?.token!==session.token||stored.summary?.version>item.version)continue;roomBook.update(item.code,session.token,item);if(item.result)recordRoomSummaryResult(item.result);}
  if(screen==='home')notifications.seeRooms(data.rooms||[]);
  roomIndexChecked=true;roomPollFailures=0;
  if(screen==='home'&&epoch===roomEpoch){if(data.reactionRoom===activeCode)reactionOverlay.receiveRoom(data.reactions||[],activeCode+':'+(data.reactionGameId||'')+':'+data.reactionPlayerId);refreshSavedRooms();}
 }catch{roomPollFailures++;if(screen==='home')refreshSavedRooms();}
 finally{polling=false;roomPoller.refresh();}
}
function refreshSavedRooms(){const container=$('#saved-rooms');if(container&&screen==='home'){const markup=savedRoomsHTML();if(markup!==savedRoomsMarkup){container.outerHTML=markup;savedRoomsMarkup=markup;}}refreshRoomManagerResults();}
function requestForgetRoom(code){
 if(!roomBook.get(code))return;
 openModal('Raum ausblenden?','<p>Nur der gespeicherte Zugang zu diesem Raum wird auf diesem Gerät entfernt. Andere gespeicherte Räume bleiben erhalten. Ohne diesen Zugang kannst du in eine laufende Partie nicht wieder einsteigen.</p><button class="primary" data-action="confirm-forget-room" data-code="'+code+'">Raum auf diesem Gerät entfernen</button><button class="outline-btn" data-action="manage-rooms">Zurück zu den Räumen</button>');
}
function connectionInfo(pid){
 const state=screen==='room'?roomConnection.status(room?.code,roomState?.members[pid]?.id,room?.playerId):screen==='direct'?directPlayerStatus(direct.manager,pid):null;
 return state?{state,label:connectionLabels[state]}:null;
}
function connectionIndicator(pid){
 const value=connectionInfo(pid);if(!value)return '';
 return '<span id="player-connection-'+pid+'" class="connection-indicator '+value.state+'" data-player-connection="'+pid+'" data-state="'+value.state+'" title="'+value.label+'"><span class="visually-hidden">'+value.label+'</span></span>';
}
function refreshRoomIndicators(){
 app.querySelectorAll('[data-player-connection]').forEach(element=>{
  const value=connectionInfo(Number(element.dataset.playerConnection));if(!value||element.dataset.state===value.state)return;
  element.className='connection-indicator '+value.state;element.dataset.state=value.state;element.title=value.label;element.querySelector('span').textContent=value.label;
 });
 if(screen==='home')refreshSavedRooms();
 const slot=app.querySelector('[data-host-skip]');if(slot){const allowed=!!roomState?.canSkip;if(slot.dataset.hostSkip!==String(allowed)){slot.dataset.hostSkip=String(allowed);slot.innerHTML=allowed?'<button class="text-btn" data-action="host-skip" style="width:100%">Fehlende Person überspringen …</button>':'';}}
}
function directResumeHTML(){
 const title=direct.snapshot.roomName||(direct.snapshot.lastAbort&&!direct.snapshot.game?'Eure Direktverbindung.':'Deine Direktpartie wartet.');
 const detail=direct.snapshot.members.length+' Handys · '+(direct.snapshot.game?'Wurf '+direct.snapshot.game.round:direct.snapshot.lastAbort?'Keine Partie aktiv':'Kopplung fortsetzen');
 return '<article class="resume direct-resume"><div class="direct-resume-info"><strong>'+esc(title)+'</strong>'+savedGameMetaHTML('direct',detail)+participantsHTML(direct.snapshot.members.map((m,i)=>({name:m.name,host:i===0})))+'<small>'+esc(directStatus(direct))+'</small></div><div class="room-card-actions"><button class="icon-btn room-open" data-action="direct-resume" aria-label="Gespeicherte Direktpartie öffnen">'+icon('arrow')+'</button></div></article>';
}
function renameDirectRoom(){
 if(!direct.saved||direct.pid!==0){toast('Nur der Gastgeber kann die Direktpartie umbenennen.');return;}
 openModal('Name der Direktpartie.', '<label for="direct-rename-name">Name der Direktpartie</label><input id="direct-rename-name" maxlength="48" value="'+esc(direct.snapshot.roomName||'')+'" placeholder="z. B. Unsere Würfelrunde"><p class="input-help">Bis zu 48 Zeichen. Ein leerer Name verwendet die Standardüberschrift. Deine aktuelle Auswahl bleibt erhalten.</p><button class="primary" data-action="save-direct-name">Namen speichern</button><button class="outline-btn" data-action="close-modal">Zurück zur Partie</button>','direct-name');
 $('#direct-rename-name').focus();
}
function saveDirectRoomName(){
 try{direct.renameRoom($('#direct-rename-name')?.value??'');closeModal();toast('Name der Direktpartie gespeichert.');}catch(error){toast(error.message);}
}
function cancellationNotice(value){return value?'<div class="cancel-notice" role="status"><strong>Partie abgebrochen.</strong><span>'+esc(value.by)+' hat die Partie beendet. Sie wird nicht gewertet. Ihr könnt eine neue Partie starten.</span></div>':'';}
function directLobbyHTML(){
  const members=direct.snapshot?.members||[],host=direct.pid===0,online=direct.online;
  if(!direct.snapshot)return '<section class="lobby direct-lobby"><h1>Direktverbindung vorbereiten.</h1><p>Noch kein lokaler Spielerraum erstellt.</p></section>';
  return '<section class="lobby direct-lobby">'+cancellationNotice(direct.snapshot?.lastAbort)+'<span class="eyebrow">OFFLINE – MEHRERE HANDYS · 2–6 PERSONEN</span><h1 class="room-lobby-title">'+esc(direct.snapshot.roomName||'Euer direktes Spiel.')+'</h1>'+(host?'<button class="text-btn room-rename" data-action="rename-direct">'+icon('edit')+'Name der Direktpartie ändern</button>':'')+'<p class="direct-status">'+esc(directStatus(direct))+'</p><div class="lobby-players">'+members.map((m,i)=>'<div class="'+(online.includes(i)?'peer-online':'peer-offline')+'"><span class="avatar">'+esc((m.name||'?')[0])+'</span><strong>'+esc(m.name||'Person '+(i+1)+' fehlt noch')+connectionIndicator(i)+'</strong><small>'+((i===0?'Gastgeber':'Mitspieler')+(i===direct.pid?' · Du':''))+' · '+(online.includes(i)?'Verbunden':'Noch nicht verbunden')+'</small>'+(host&&i>0&&!online.includes(i)?'<button class="text-btn" data-action="direct-reconnect-member" data-pid="'+i+'">'+(m.name?'Erneut koppeln':'Einladen')+'</button>':'')+'</div>').join('')+'</div>'+(host&&!direct.ready?'<p class="caption">Nach dem Koppeln: Spielbrett, Minen und Bonusfelder wählen.</p>':'')+boardPicker(direct.snapshot.boardId||'classic','direct',host&&direct.ready&&!direct.pending,direct.manager?.supportsBoards!==false,direct.manager?.supportsRandomBoard!==false)+hiddenOptionHTML(!!direct.snapshot.hiddenScores,host,'direct-hidden',direct.ready)+mineLobbyHtml(direct.snapshot.mines===true,host&&direct.ready,'direct-mines',direct.manager?.supportsMines!==false)+bonusOptionHtml(direct.snapshot.bonusFields===true,host&&direct.ready,'direct-bonus',direct.manager?.supportsBonusFields!==false)+(host?'<div class="direct-lobby-actions"><button class="primary" data-action="direct-start" '+(direct.ready?'':'disabled')+'>Mit '+members.length+' Personen starten</button>'+(members.length<6?'<button class="outline-btn" data-action="direct-invite">Weitere Person einladen</button>':'<p>Alle sechs Plätze sind belegt.</p>')+'</div><p class="caption">Erst alle Mitspielenden koppeln, dann starten. Pro Person einmal Angebot und Antwort austauschen oder einen eigenen Kopplungscode verwenden.</p>':'<p>Der Gastgeber lädt die Gruppe ein und startet die Partie, sobald alle verbunden sind.</p>')+(!direct.ready&&(host||!online.includes(direct.pid))?'<button class="outline-btn" data-action="'+(direct.pairing?'direct-show-pair':'direct-resume')+'">'+(direct.pairing?'QR-Kopplung zeigen':host?'Fehlendes Handy koppeln':'Mit Gastgeber erneut koppeln')+'</button>':!direct.ready?'<p>Dein Handy ist verbunden. Warte, bis die fehlenden Handys gekoppelt sind.</p>':'')+'<div class="info-box">Alle Handys im gleichen WLAN oder Hotspot. Nach der Kopplung braucht die Partie kein Internet. Fehlt eine Verbindung, pausiert die gesamte Gruppe; bestätigte Züge bleiben auf jedem Handy gespeichert. Der Gastgeber hält seine App während der Partie offen.</div><button class="outline-btn" data-action="direct-disconnect">Verbindungen schließen · Spielstand behalten</button><button class="outline-btn danger-btn" data-action="direct-discard">'+(direct.snapshot?.game?.status==='playing'?'Direktpartie verlassen':'Direktzugang entfernen')+'</button></section>';
}
function directConnectionHTML(){
 const waiting=direct.pid!==0&&direct.online.includes(direct.pid)&&!direct.ready;
 if(direct.ready)return '<details class="direct-connection is-connected"><summary><i class="dot" aria-hidden="true"></i><span>'+esc(directStatus(direct))+'</span><span class="connection-chevron" aria-hidden="true">⌄</span></summary><div class="direct-connection-details"><p>'+(direct.pending?'Dein Zug wird bestätigt.':'Würfe und Züge werden direkt im WLAN/Hotspot übertragen. Beide Apps geöffnet lassen.')+'</p><button class="outline-btn" data-action="direct-disconnect">Verbindung trennen · Spielstand behalten</button></div></details>';
 return '<div class="direct-connection is-paused" role="status"><span><strong><i class="dot" aria-hidden="true"></i>'+esc(directStatus(direct))+'</strong><small>'+(waiting?'Dein Handy ist verbunden. Der Gastgeber koppelt die fehlenden Handys.':'Bestätigte Züge bleiben gespeichert.')+'</small></span>'+(waiting?'':'<button data-action="'+(direct.pairing?'direct-show-pair':'direct-resume')+'">'+(direct.pairing?'QR zeigen':'Neu koppeln')+'</button>')+'</div>';
}
function markSymbol(){return themeMark(prefs.theme);}
function hiddenSetup(checked=false){return '<label class="hidden-choice"><input type="checkbox" id="hidden-scores" '+(checked?'checked':'')+'><span><strong>Verdeckter Punktestand</strong><small>Nur dein Blatt sichtbar · alle Punkte erst am Spielende.</small></span></label>';}
function hiddenOptionHTML(enabled,host,action,available=true){return '<div class="hidden-option"><div><strong>'+(enabled?'Verdeckter Punktestand':'Offener Punktestand')+'</strong><p>'+(enabled?'Nur dein Blatt ist sichtbar. Gegnerblätter und alle Punkte erst am Spielende.':'Ihr könnt Blätter und Punkte während der Partie ansehen.')+'</p></div>'+(host?'<button class="toggle '+(enabled?'on':'')+'" role="switch" aria-label="Verdeckter Punktestand" aria-checked="'+enabled+'" data-action="'+action+'" '+(available?'':'disabled')+'></button>':'')+'</div>';}
function scoreCardsHTML(g){
 const own=myPid(g);
 return '<p class="score-help">'+(isScoreHidden(g)?'Verdeckte Partie: Alle Punktestände und Aufschlüsselungen werden erst am Spielende aufgedeckt.':'Alle bestätigten Punkte. Neue Spalten und Farben werden nach dem gemeinsamen Wurf gewertet.')+'</p>'+g.players.map((player,pid)=>{
  const s=scoreBreakdown(g,pid,own);if(s?.left)return '<section class="score-card"><h3>'+esc(s.name)+'</h3><b>−10 Punkte</b><p>Partie freiwillig verlassen.</p></section>';if(!s)return '<section class="score-card hidden-score"><h3>'+esc(player.name)+(pid===own&&player.name!=='Du'?' · Du':'')+'</h3><b>Verdeckt</b><p>'+(pid===own?'Dein Punktestand wird am Spielende aufgedeckt.':'Spielblatt und Punkte werden am Spielende aufgedeckt.')+'</p></section>';
  return '<section class="score-card"><div class="score-card-head"><h3>'+esc(s.name)+(pid===own&&s.name!=='Du'?' · Du':'')+'</h3><b>'+s.total+' <small>Punkte</small></b></div><div class="result-details"><div>Spalten<b>+'+s.columns+'</b></div><div>Farben<b>+'+s.colors+'</b></div><div>Joker<b>+'+s.jokers+'</b></div><div>Offene Sterne<b>−'+s.penalty+'</b></div>'+(s.bonus!==undefined?'<div class="bonus-score">Bonusfelder<b>+'+s.bonus+'</b></div>':'')+(s.mineCost?'<div class="mine-cost">Minen-Einsatz<b>−'+s.mineCost+'</b></div>':'')+'</div><p class="score-formula">'+s.columns+' + '+s.colors+' + '+s.jokers+(s.bonus!==undefined?' + '+s.bonus:'')+' − '+s.penalty+(s.mineCost?' − '+s.mineCost:'')+' = <strong>'+s.total+'</strong> · '+s.stars+' offene Sterne</p><details><summary>Spalten und Farben im Detail</summary><div class="score-columns">'+s.columnDetails.map(c=>'<span class="'+(c.points!==null?'earned':'')+'">'+c.column+'<b>'+(c.points===null?'–':'+'+c.points)+'</b></span>').join('')+'</div><div class="score-colors">'+s.colorDetails.map(c=>'<span><i class="color-dot" data-color="'+c.color+'"></i>'+LABELS[c.color]+': <b>'+(c.points===null?'offen':'+'+c.points)+'</b></span>').join('')+'</div></details></section>';
 }).join('');
}
function reactionMenu(){
 const g=currentGame();if(!prefs.reactionsUnlocked||!g||g.players.length<2)return;
 const own=myPid(g),others=g.players.map((p,i)=>({name:p.name,pid:i})).filter(p=>p.pid!==own);
 const note=screen==='room'?'Live oder beim nächsten Öffnen (max. 24 Stunden). Je Person bleibt die neueste Reaktion.':'Kurz über den Bildschirm – der Spielzug bleibt erhalten.';
 openModal('Eine kleine Botschaft.',(others.length>1?'<label for="reaction-target">An wen?</label><select id="reaction-target" class="outline-btn"><option value="all">Alle anderen</option>'+others.map(p=>'<option value="'+p.pid+'">'+esc(p.name)+'</option>').join('')+'</select>':'<p>An '+esc(others[0].name)+'</p>')+'<p id="reaction-press-help">Tippen oder gedrückt halten für größere Emojis.</p><div class="reaction-options">'+REACTIONS.map(item=>'<button data-action="reaction-send" data-emoji="'+item.id+'" aria-label="'+item.label+' senden" aria-describedby="reaction-press-help"><span class="reaction-symbol">'+item.symbol+'</span><small class="reaction-charge" aria-hidden="true">1×</small></button>').join('')+'</div><p class="direct-note">'+note+'</p>','reactions');
}
async function sendPressedEmoji(button,charge){
 if(reactionSending)return;
 reactionSending=true;
 const buttons=[...dialog.querySelectorAll('[data-action="reaction-send"]')];buttons.forEach(item=>item.disabled=true);
 try{toast('Reaktion wird gesendet …');await sendEmoji(button.dataset.emoji,charge);}
 catch(error){toast(error.message||'Reaktion konnte nicht gesendet werden.');}
 finally{reactionSending=false;buttons.forEach(item=>item.disabled=false);}
}
async function sendEmoji(emoji,{scale=1}={}){
 const g=currentGame();if(!prefs.reactionsUnlocked||!g)return;
 if(Date.now()-reactionSentAt<REACTION_INTERVAL){toast('Einen kurzen Moment bis zur nächsten Reaktion warten.');return;}
 const target=$('#reaction-target')?.value||'all',to=target==='all'?'all':Number(target),own=myPid(g),id=newId();
 const motion=pickReactionMotion(lastReactionMotion);
 if(screen==='room')await api('reaction',{emoji,to,scale,motion,actionId:id,gameId:g.gameId});
 else if(screen==='direct')direct.manager.sendReaction(emoji,to,{scale,motion});
 else reactionOverlay.receive({id,emoji,scale,motion,name:g.players[own].name});
 reactionSentAt=Date.now();lastReactionMotion=motion;closeModal();toast('Reaktion gesendet.');
}
function scores(){const g=currentGame();if(!g||handover)return;openModal('Punkte im Überblick.','<div class="score-content">'+scoreCardsHTML(g)+'</div>','scores');}
function completionsHTML(g){
 const events=colorAnnouncements(g,myPid(g));if(!events.length)return '';
 return '<div class="color-notices" role="status" aria-label="Abgeschlossene Farben">'+events.map(e=>'<span class="completion-item"><span class="status-icon" aria-hidden="true"><i class="color-dot" data-color="'+e.color+'"></i></span><span class="completion-copy">'+esc(colorCompletionText(e,{withPoints:false}))+'</span>'+(e.points!==undefined?'<b class="status-score" aria-label="'+e.points+' Punkte">+'+e.points+'</b>':'')+'</span>').join('')+'</div>';
}
function announceColors(g){
 const id=g?.gameId||'';if(!id)return;
 const events=colorAnnouncements(g,myPid(g));
 if(colorNoticeGame!==id){colorNoticeGame=id;seenColorNotices=new Set(events.map(e=>e.id));return;}
 const fresh=events.filter(e=>!seenColorNotices.has(e.id));events.forEach(e=>seenColorNotices.add(e.id));
 if(fresh.length)toast(fresh.map(e=>colorCompletionText(e)+'.').join(' '));
}
function announceBonusFields(g){
 const id=g?.gameId||'';if(!id)return;
 const awards=bonusAwards(g),key=award=>award.slot+':'+award.round;
 if(bonusNoticeGame!==id){bonusNoticeGame=id;seenBonusNotices=new Set(awards.map(key));return;}
 const fresh=awards.filter(award=>!seenBonusNotices.has(key(award)));awards.forEach(award=>seenBonusNotices.add(key(award)));
 if(fresh.length)toast(fresh.map(award=>'Bonusfeld · '+bonusAnnouncement(g,award)).join(' '));
}
function announceMineReady(g){
 const id=g?.gameId||'',own=myPid(g),unlocked=minesEnabled(g)&&g.mines.unlocked[own];
 if(mineNoticeGame!==id){mineNoticeGame=id;mineUnlockedSeen=new Set(minesEnabled(g)?g.mines.unlocked.flatMap((ready,i)=>ready?[i]:[]):[]);mineReadyUntil=0;return;}
 if(unlocked&&!mineUnlockedSeen.has(own)&&!g.mines.used[own]&&!g.players[own].left){mineUnlockedSeen.add(own);mineReadyUntil=performance.now()+5000;toast('Mine bereit! Eine andere Person hat eine Farbe abgeschlossen. Deine Mine ist jetzt freigeschaltet.');}
}

function boardHTML(g,pid){
  const damage=mineDamage(g,pid,myPid(g)),damaged=new Set(damage?.cells||[]);
  const p=g.players[pid],can=writable(g,pid),feedback=can?currentMoveFeedback(g,pid):null,pointsHidden=isScoreHidden(g),layout=boardFor(g),BOARD=layout.cells,STARS=layout.stars;
  const res=choice.ci!==null&&choice.ni!==null?resolveChoice(g,pid,{...choice}):null;
  const color=res&&!res.error?res.color:null;
  return `<div class="board-card ${can?'':'board-readonly'}">
    <div class="section-line"><span class="eyebrow">${pid===myPid(g)?'DEIN SPIELFELD':g.mode==='computer'?'COMPUTER-SPIELFELD':esc(p.name.toUpperCase())+'S SPIELFELD'}<small class="board-name">${layout.name}</small></span>
      <div class="board-tools" role="group" aria-label="Spielfeld vergrößern oder verkleinern">
        <button data-action="zoom-out" aria-label="Spielfeld verkleinern">−</button><output id="board-zoom-value" aria-label="Spielfeld-Zoom">${boardView.percent}%</output><button data-action="zoom-in" aria-label="Spielfeld vergrößern">+</button><button class="fit-board" data-action="board-fit" aria-label="Ganzes Spielfeld einpassen">↔ <span>Einpassen</span></button>${prefs.reactionsUnlocked&&g.players.length>1?'<button class="reaction-launch" data-action="reaction-menu" aria-label="Emoji senden" title="Emoji senden">☺</button>':''}
      </div>
    </div>
    ${mineDamageHtml(damage)}<div class="board-scroll" id="board-scroll" aria-label="Spielfeld – seitlich wischen, mit zwei Fingern zoomen">
      <div class="board" data-player-board="${pid}" role="group" aria-label="Spielfeld mit 15 Spalten und 7 Zeilen" ${can?'aria-describedby="move-feedback"':''}>
        ${[...COLS].map((c,i)=>`<div class="col-label ${i===7?'center':''} ${columnStatus(g,pid,i).complete?'completed':columnStatus(g,pid,i).pending?'pending-column':''}" title="${columnStatus(g,pid,i).complete?'Spalte '+c+' abgeschlossen'+(pointsHidden?' · Punkte verdeckt':' · '+columnStatus(g,pid,i).points+' Punkte'):columnStatus(g,pid,i).pending?'Spalte vollständig · Wertung nach allen Zügen':'Spalte '+c}" ${i===7?'aria-label="Spalte H, Startspalte"':''}><span class="col-letter">${c}</span>${i===7?'<span class="start-arrow" aria-hidden="true">↓</span>':''}</div>`).join('')}
        ${BOARD.map((c,i)=>{const marked=p.marks[i],sel=selection.includes(i)&&can,isStar=STARS.includes(i);
          const playable=can&&!marked&&(!color||color===c)&&(i%15===7||neighbors(i).some(j=>p.marks[j]||selection.includes(j)));
          return `<button class="cell ${marked?'marked':''} ${sel?'selected':''} ${sel&&feedback?.invalid?'selection-invalid':''} ${playable?'playable':''} ${color&&c!==color&&!marked?'muted':''} ${p.lastMove.includes(i)&&marked?'last':''} ${damaged.has(i)?'mine-damaged'+(marked?' mine-recovered':''):''}" data-color="${c}" data-action="cell" data-i="${i}" style="--cell:var(--${c})" aria-label="${COLS[i%15]}${Math.floor(i/15)+1}, ${LABELS[c]}${isStar?', Stern':''}${marked?', angekreuzt':''}${damaged.has(i)?marked?', nach Mine wieder gefüllt':', Minen-Schaden, Kreuz entfernt':''}" aria-pressed="${sel}" ${sel&&feedback?.invalid?'aria-invalid="true"':''} ${!can||marked?'disabled':''}>${isStar?'<span class="star">☆</span>':prefs.patterns?`<span class="pattern">${SHAPES[c]}</span>`:''}${damaged.has(i)&&!marked?'<span class="mine-ghost" aria-hidden="true">×</span>':''}${marked?'<span class="cell-stamp" aria-hidden="true">'+markSymbol()+'</span>':''}</button>`;
        }).join('')}
        ${FIRST.map((n,c)=>{const status=columnStatus(g,pid,c);return `<div class="col-score ${status.complete?'complete':status.pending?'pending-column':''}" aria-label="Spalte ${COLS[c]}: ${status.complete?(pointsHidden?'abgeschlossen, Punkte verdeckt':status.points+' Punkte erhalten'):status.pending?'vollständig, Wertung nach allen Zügen':'noch offen'}"><span class="high ${g.columnClaims[c]!==null&&!status.first?'claimed':''} ${status.complete&&status.first?'earned':''}">${n}</span><span class="${status.later?'earned':''}">${LATER[c]}</span></div>`;}).join('')}
      </div>
    </div>
    <div class="board-hint"><span>Zwei Finger: nur das Spielfeld zoomen · ↔ Einpassen</span><em>Start in H · ☆ = −2 offen</em></div>
  </div>
  <div class="color-progress" aria-label="Farbfortschritt und Farbpunkte">${COLORS.map(c=>{
    const n=p.marks.filter((x,i)=>x&&BOARD[i]===c).length,points=p.colors[c],pending=n===21&&points===null;
    const label=pointsHidden?(points!==null?'✓':pending?'…':'•••'):points!==null?`+${points} P`:pending?'…':g.colorClaims[c]===null?'5/3 P':'3 P';
    const title=pointsHidden?`${LABELS[c]}: ${n} von 21 Feldern. Farbpunkte werden am Spielende aufgedeckt.`:points!==null?`${LABELS[c]}: ${points} Farbpunkte erhalten.`:pending?`${LABELS[c]} vollständig. Wertung nach allen Zügen dieses Wurfs.`:`${LABELS[c]}: ${n} von 21 Feldern. Zuerst 5 Punkte, danach 3 Punkte.`;
    return `<div class="color-item ${points!==null?'color-complete':''}" title="${title}" aria-label="${title}"><div class="color-name"><span class="color-dot" data-color="${c}"></span><span class="color-label">${LABELS[c]}</span></div><b>${n}<small style="font-size:8px;font-weight:400;color:#919c85">/21</small></b><span class="color-award ${points!==null?'earned':''}">${label}</span><div class="bar" style="--cell:var(--${c})"><i style="width:${n/21*100}%"></i></div></div>`;
  }).join('')}</div>`;
}
function diceHTML(g,pid){const p=g.players[pid],can=writable(g,pid),mine=g.mode==='computer'?g.active===HUMAN:screen==='direct'?g.active===direct.pid:screen!=='room'||g.players[g.active].id===room?.playerId;
if(screen==='direct'&&(!direct.ready||direct.pending))return `<div class="dice-card"><span class="eyebrow">${direct.pending?'BESTÄTIGUNG ABWARTEN':'PARTIE PAUSIERT'}</span><h2>${direct.pending?'Dein Zug wird übertragen.':direct.pid!==0&&direct.online.includes(direct.pid)?'Warte auf fehlende Handys.':'Verbindung wiederherstellen.'}</h2><p class="caption">${direct.pending?'Der Gastgeber bestätigt deinen Zug. Bei einer Unterbrechung wird er beim Abgleich höchstens einmal ausgeführt.':'Bestätigte Züge bleiben gespeichert. Alle Apps offen lassen; falls nötig das fehlende Handy erneut koppeln, um genau diese Partie fortzusetzen.'}</p>${!direct.ready&&(direct.pid===0||!direct.online.includes(direct.pid))?'<button class="primary" data-action="direct-resume">Erneut koppeln</button>':''}</div>`;
if(g.status==='finished')return `<div class="dice-card"><span class="eyebrow">DEIN NÄCHSTER WURF WARTET</span><h2>Noch eine Runde?</h2><p class="caption">Jede Partie beginnt mit denselben Chancen – und neuen Möglichkeiten.</p><button class="primary" data-action="rematch" ${screen==='direct'&&direct.pid!==0?'disabled':''}>${icon('refresh')}${screen==='direct'&&direct.pid!==0?'Gastgeber startet die nächste Partie':'Noch einmal spielen'}</button><button class="outline-btn" data-action="home" style="width:100%;margin-top:10px">Zur Startseite</button></div>`;
if(g.players[pid].left&&g.status==='playing')return '<div class="dice-card"><span class="eyebrow">AUSGESTIEGEN · −10 PUNKTE</span><h2>Du schaust zu.</h2><p class="caption">'+(screen==='direct'&&direct.pid===0?'Bitte dieses Gastgeber-Handy geöffnet lassen, damit die anderen weiterspielen können.':'Dein Ergebnis steht im Verlauf. Die anderen spielen weiter.')+'</p></div>';
if(handover&&screen!=='room')return '';
if(inspectPid!==null)return `<div class="dice-card inspection-card"><span class="eyebrow">NUR ANSEHEN</span><h2>${g.mode==='computer'?'Computer-Spielfeld':esc(p.name)+'s Spielfeld'}</h2><p class="caption">Hier kannst du keine Züge machen. Dein eigener Zug und der Spielstand bleiben unverändert.</p><button class="primary" data-action="my-board">Zu meinem Spielfeld</button></div>`;
if(['room','direct'].includes(g.mode)&&g.phase==='choose'&&g.submitted.includes(pid))return '';
if(screen==='direct'&&g.phase==='choose'&&!canAct(g,pid))return '';
if(g.mode==='computer'&&needsComputerTurn(g))return `<div class="dice-card computer-thinking" role="status"><span class="eyebrow">COMPUTER AM ZUG</span><h2>${g.phase==='roll'?'Der Computer würfelt.':'Der Computer wählt.'}</h2><p class="caption">${g.phase==='roll'?'Der nächste gemeinsame Wurf wird gewürfelt.':'Er setzt seine Kreuze automatisch. Danach bist du wieder dran.'}</p><span class="computer-dots" aria-hidden="true">● ● ●</span><p class="caption">Du kannst sein Spielfeld oben über „Computer“ ansehen.</p></div>`;
if(g.phase==='roll')return `<div class="dice-card"><span class="eyebrow">${g.mode==='solo'?'DEIN NÄCHSTER ZUG':g.mode==='computer'&&g.active===HUMAN?'DU WÜRFELST':esc(g.players[g.active].name.toUpperCase())+' WÜRFELT'}</span><h2>${g.mode==='solo'?'Ein guter Wurf?':'Die nächste Runde.'}</h2><p class="caption">${mine?'Einmal würfeln. Eine Farbe und eine Zahl wählen. Deine Möglichkeiten entdecken.':'Warte, bis '+esc(g.players[g.active].name)+' gewürfelt hat.'}</p><div class="dice-row" aria-hidden="true"><div class="die color" style="--cell:var(--g)">✳</div><div class="die">?</div></div><button class="primary" data-action="roll" ${!mine||busy?'disabled':''}>${icon('dice')}${busy?'Würfelt …':'Würfeln'}</button><div class="joker-track" aria-label="${p.jokers} Joker übrig">${Array.from({length:8},(_,i)=>`<span class="${i>=p.jokers?'used':''}">!</span>`).join('')}</div></div>`;
const d=availableDice(g,pid),cval=g.dice.colors[choice.ci],nval=g.dice.numbers[choice.ni];
const affordJokers=Number(cval==='*')+Number(nval==='?')<=p.jokers,feedback=can?currentMoveFeedback(g,pid):null,valid=can&&feedback?.valid;
const submitted=g.submitted.includes(pid),waiting=g.players.filter((x,i)=>!g.submitted.includes(i));
const colors=g.dice.colors.map((c,i)=>{const available=d.colors.some(x=>x.index===i);return `<button class="die color ${choice.ci===i&&can?'is-selected':''} ${available?'':'removed'}" style="--cell:${c==='*'?'#eee9dc':`var(--${c})`}" data-action="color-die" data-i="${i}" aria-label="${c==='*'?'Farbjoker':LABELS[c]}${available?'':', von aktiver Person gewählt'}" aria-pressed="${choice.ci===i}" ${!can||!available?'disabled':''}>${c==='*'?'✳':SHAPES[c]}</button>`;}).join('');
const numbers=g.dice.numbers.map((n,i)=>{const available=d.numbers.some(x=>x.index===i);return `<button class="die ${choice.ni===i&&can?'is-selected':''} ${available?'':'removed'}" data-action="number-die" data-i="${i}" aria-label="${n==='?'?'Zahlenjoker':n+' Felder'}${available?'':', von aktiver Person gewählt'}" aria-pressed="${choice.ni===i}" ${!can||!available?'disabled':''}>${n}</button>`;}).join('');
const colorJoker=can&&affordJokers&&cval==='*'?`<div class="joker-picks" aria-label="Farbjoker wählen">${COLORS.map(c=>`<button data-action="joker-color" data-c="${c}" class="${choice.color===c?'chosen':''}" style="--cell:var(--${c})" aria-label="${LABELS[c]}">${SHAPES[c]}</button>`).join('')}</div>`:'';
const numberJoker=can&&affordJokers&&nval==='?'?`<div class="joker-picks" aria-label="Zahlenjoker wählen">${[1,2,3,4,5].map(n=>`<button data-action="joker-number" data-n="${n}" class="${choice.count===n?'chosen':''}" aria-label="${n} Felder">${n}</button>`).join('')}</div>`:'';
return `<div class="dice-card choosing ${!can?'waiting':''} ${animateRoll?'roll-animation':''}">
 <div class="choice-heading"><span class="eyebrow">${can?'1. WÜRFEL WÄHLEN · 2. FELDER ANTIPPEN':submitted?'DEIN ZUG IST GESPEICHERT':'GEMEINSAMER WURF'}</span><h2>${can?'Du hast die Wahl.':submitted?'Gut gemacht.':'Noch einen Moment.'}</h2><p class="caption">${can?'Kombiniere eine Farbe mit einer Zahl.':submitted?'Warten auf '+waiting.map(p=>esc(p.name)).join(', ')+'.':esc(g.players[g.active].name)+' wählt zuerst eine Kombination.'}</p></div>
 <div class="choice-options"><div class="dice-groups"><div class="dice-set"><div class="dice-label">Eine Farbe</div><div class="dice-row">${colors}</div>${colorJoker}</div><div class="dice-set"><div class="dice-label">Eine Zahl</div><div class="dice-row">${numbers}</div>${numberJoker}</div></div></div>
 <div class="choice-controls">${feedbackHTML(feedback)}${can?`<div class="actions"><button class="outline-btn ${feedback?.noMove?'pass-recommended':''}" data-action="pass" ${busy?'disabled':''}>Passen</button><button class="primary" data-action="confirm" aria-describedby="move-feedback" ${!valid||busy?'disabled':''}>${icon('check')}${busy?'Speichert …':'Bestätigen'}</button></div><div class="minor-actions"><button class="text-btn" data-action="clear" ${!selection.length?'disabled':''}>${icon('undo')}Auswahl löschen</button><button class="text-btn" data-action="hint" ${feedback?.noMove?'disabled':''}>${icon('bulb')}Tipp</button></div>`:''}<div class="joker-track" aria-label="${p.jokers} Joker übrig">${Array.from({length:8},(_,i)=>`<span class="${i>=p.jokers?'used':''}">!</span>`).join('')}</div>${g.mode!=='solo'?`<div class="turn-note">${g.round<=3?'In den ersten 3 Würfen dürfen alle aus allen Würfeln wählen.':g.chosen?'Die beiden herausgenommenen Würfel sind für die anderen gesperrt.':'Passt die aktive Person, bleiben alle Würfel für die anderen verfügbar.'}</div>`:''}</div></div>`;
}
function resultHTML(g){const ranks=rankings(g),solo=g.mode==='solo',p=g.players[displayedPid(g)],s=score(p,g),top=ranks[0],winners=ranks.filter(p=>!p.left&&p.total===top.total&&p.jokers===top.jokers);const label=s.total>=33?'Stark gespielt!':s.total>=21?'Das kann sich sehen lassen.':s.total>=9?'Jedes Kreuz zählt.':s.total>=0?'Da geht noch was.':'Die nächste Runde wird besser.';return `<section class="finish-panel"><span class="eyebrow">${g.finishReason==='last-player'?'LETZTE PERSON GEWINNT':'PARTIE GESCHAFFT'} · ${g.round} ${g.round===1?'WURF':'WÜRFE'}</span><h2>${solo?label:g.mode==='computer'&&winners.length===1&&winners[0].index===HUMAN?'Du gewinnst!':winners.map(p=>esc(p.name)).join(' & ')+(winners.length>1?' gewinnen!':' gewinnt!')}</h2>${solo?`<div class="big-score">${s.total}</div><p>Punkte auf deinem Farbfeld</p>`:ranks.map((p,i)=>`<div class="result-row ${winners.includes(p)?'winner':''}"><span>${i+1}. ${esc(p.name)}${winners.includes(p)?' ✦':''}</span><span>${p.left?'Ausgestiegen · −10 Punkte':p.total+' Punkte · '+p.jokers+' !'}</span></div>`).join('')}${s.left?'<p class="info-box">Partie freiwillig verlassen · −10 Punkte im Verlauf.</p>':`<div class="result-details"><div>Spalten<b>+${s.columns}</b></div><div>Farben<b>+${s.colors}</b></div><div>Joker<b>+${s.jokers}</b></div><div>Offene Sterne<b>−${s.penalty}</b></div>${s.bonus!==undefined?'<div class="bonus-score">Bonusfelder<b>+'+s.bonus+'</b></div>':''}${s.mineCost?'<div class="mine-cost">Minen-Einsatz<b>−'+s.mineCost+'</b></div>':''}</div>`}<button class="primary" data-action="share-result">${icon('share')}Ergebnis teilen</button></section>`;}
function gameHTML(g){
  const pid=displayedPid(g),p=g.players[pid]??g.players[0],s=score(p,g),own=myPid(g),pointsHidden=isScoreHidden(g);
  const passing=handover&&g.mode==='local'&&g.status==='playing';
  const turn=turnDescription(g,own);
  const confirmed=g.status==='playing'&&['room','direct'].includes(g.mode)&&g.phase==='choose'&&!g.players[own]?.left&&g.submitted.includes(own);
  const turnTitle=confirmed?'Dein Zug ✓':turn?.title;
  const turnDetail=confirmed?(turn.indices.length>2?turn.indices.length+' Personen sind noch dran':turn.indices.map(i=>g.players[i].name).join(', ')+(turn.indices.length===1?' ist dran':' sind dran')):turn?.detail;
  const title=g.mode==='computer'?'Du gegen Computer.':g.mode==='solo'?'Dein Farbfeld.':screen==='room'?roomState?.roomName||'Euer Spielraum.':screen==='direct'?direct.snapshot.roomName||'Eure Direktpartie.':'Eure Partie.';
  const networked=screen==='room'||screen==='direct';
  const headingRow=networked?'room-heading-row':g.mode==='computer'?'computer-heading-row':'';
  const controlLabel=networked?'room-control-label':g.mode==='computer'?'computer-control-label':'';
  const subtitle=g.mode==='computer'?'Computer · '+computerLevel(g).label+' · offline':g.mode==='solo'?'Solo · Ein Wurf nach dem anderen.':screen==='room'?`Raum ${esc(room.code)} · ${g.players.length} Personen`:screen==='direct'?g.players.length+' Handys · WLAN/Hotspot':`Ein Handy · ${g.players.length} Personen`;
  const stats=`<div class="score-strip"><button class="stat score-stat" data-action="scores" aria-label="Punkteaufschlüsselung öffnen"><div><label>Punkte</label><small>${g.players.length>1?esc(p.name):'aktueller Stand'}</small></div><b>${pointsHidden?'•••':s.total}</b></button><div class="stat"><div><label>Joker</label><small>noch übrig</small></div><b>${s.jokers}<small>/8</small></b></div><div class="stat"><div><label>Sterne</label><small>noch offen</small></div><b>${s.stars}</b></div></div>`;
  return `<div class="game-chrome ${networked?'room-game-chrome':''}"><div class="game-top ${networked?'room-game-top':g.mode==='computer'?'computer-game-top':''}">${headingRow?'<div class="'+headingRow+'">':''}<button class="icon-btn back" data-action="home" aria-label="Zur Startseite">‹</button><div class="game-heading"><h1 ${networked?'class="room-game-title"':''}>${screen==='room'&&roomState?.hostId===room.playerId?'<button data-action="rename-room" aria-label="Raumnamen ändern: '+esc(title)+'" title="Raumnamen ändern" '+(busy?'disabled':'')+'><span>'+esc(title)+'</span>'+icon('edit')+'</button>':screen==='direct'&&direct.pid===0?'<button data-action="rename-direct" aria-label="Name der Direktpartie ändern: '+esc(title)+'" title="Name der Direktpartie ändern"><span>'+esc(title)+'</span>'+icon('edit')+'</button>':g.mode==='computer'&&g.status==='playing'?'<button class="computer-title" data-action="computer-level" aria-label="Computer-Stärke ändern, aktuell '+computerLevel(g).label+'" title="Computer-Stärke ändern"><span>'+esc(title)+'</span>'+icon('settings')+'</button>':esc(title)}</h1><button class="game-version" data-action="version-tap" aria-label="App-Version ${APP_VERSION}">v${APP_VERSION}</button><p>${subtitle}</p></div>${headingRow?'</div>':''}<span class="landscape-score">${pointsHidden?'Punktestand verdeckt':s.total+' P · Farben +'+s.colors} · ${s.jokers} ! · ${s.stars} ☆</span><div class="round-badge"><span>WURF<br>${g.mode==='solo'?'VON 30':'AKTUELL'}</span><b>${g.round.toString().padStart(2,'0')}</b></div><button class="icon-btn score-open" data-action="scores" aria-label="Punkteübersicht öffnen" title="Punkteübersicht" ${passing?'disabled':''}>Σ${controlLabel?'<span class="'+controlLabel+'">Punkte</span>':''}</button><button class="icon-btn game-share" data-action="${screen==='room'?'share-room':'share-game'}" aria-label="Spiel teilen" title="Spiel teilen">${icon('share')}</button>${g.status==='playing'&&!g.players[myPid(g)]?.left?'<button class="icon-btn abort-game-btn" data-action="abort-game" aria-label="Partie verlassen" title="Partie verlassen">×'+(controlLabel?'<span class="'+controlLabel+'">Beenden</span>':'')+'</button>':''}</div>
  ${screen==='direct'?directConnectionHTML():''}
  ${g.mode==='solo'?`<div class="progress-track"><i style="width:${(g.round-1+(g.status==='finished'?1:0))/30*100}%"></i></div>`:`<div class="players" aria-label="Spieler und Zugstatus">${g.players.map((q,i)=>{
    const locked=!mayInspect(g,i,own),role=playerRole(g,i),concealed=pointsHidden||isHidden(g,i,passing?-1:own);
    const takingTurn=g.mode==='local'?i===nextLocalPlayer(g):turn?.indices.includes(i);
    return `<button class="player-chip ${takingTurn&&g.status==='playing'?'is-turn':''} ${pid===i?'viewed':''}" data-action="view-player" data-i="${i}" ${(screen==='room'||screen==='direct')?'aria-describedby="player-connection-'+i+'"':''} aria-label="${esc(q.name)}: ${role}${concealed?'. Punktestand verdeckt.':locked?'. Spielerwechsel erfolgt automatisch.':'. Spielfeld ansehen.'}" ${locked?'disabled':''} ${takingTurn&&g.status==='playing'?'aria-current="step"':''}><span class="avatar">${esc(q.name[0].toUpperCase())}</span><span class="player-name"><span class="player-label">${esc(q.name)}${g.mode==='computer'&&i===COMPUTER?' · '+computerLevel(g).label:''}${connectionIndicator(i)}</span><small>${esc(role)}</small></span><b>${concealed?'•••':score(q,g).total}</b></button>`;
  }).join('')}</div>`}
  ${turn&&!passing&&g.mode!=='solo'?`<div class="turn-status ${confirmed?'turn-saved':''}" role="status" aria-label="${esc(turn.title+'. '+turn.detail)}">${confirmed?'':'<i class="dot" aria-hidden="true"></i>'}<strong>${esc(turnTitle)}</strong><span>${esc(turnDetail)}</span></div>`:''}
  </div>${inspectPid!==null?`<div class="inspection-note">Du siehst ${g.mode==='computer'?'das Computer-Spielfeld':esc(p.name)+'s Spielfeld'}. <button class="text-btn" data-action="my-board">Zu meinem Spielfeld →</button></div>`:''}
  <div class="color-notices-wide">${completionsHTML(g)}</div>${saveFailed?'<div class="connection-banner save-error">Automatisches Speichern ist nicht möglich. Exportiere deinen Spielstand in den Einstellungen.</div>':''}
  ${mineControlsHtml(g,{own:myPid(g),available:!busy&&!handover&&(screen!=='direct'||direct.ready&&!direct.pending),highlight:performance.now()<mineReadyUntil})}${bonusStatusHtml(g)}
  ${screen==='room'&&networkError?`<div class="connection-banner">${esc(networkError)}</div>`:''}
  ${passing?`<section class="handover" aria-label="Handy weitergeben"><span class="eyebrow">HANDY WEITERGEBEN</span><h2>${p.name.trim().toLocaleLowerCase('de')==='du'?'Du bist dran.':'Weiter mit '+esc(p.name)+'.'}</h2><p>${g.phase==='roll'?'Du würfelst als Nächstes.':'Du wählst jetzt deine Würfel und Felder.'}</p><button class="primary" data-action="handover">Spiel übernehmen ${icon('arrow')}</button></section>`:
  `<div class="game-layout"><div class="play-area">${g.status==='finished'?resultHTML(g):stats}${boardHTML(g,pid)}</div><aside class="side-area"><div class="side-completions">${completionsHTML(g)}</div>${diceHTML(g,pid)}${g.mode==='computer'?computerMoveHTML(g):''}<div class="side-note"><b>Ein kleiner Gedanke für deinen nächsten Zug.</b><br>Offene Sterne kosten je 2 Punkte. Eine vollständige Randspalte bringt dir bis zu 5.</div>${screen==='room'&&roomState?.hostId===room?.playerId&&g.phase==='choose'&&g.status==='playing'?`<div data-host-skip="${!!roomState?.canSkip}">${roomState?.canSkip?'<button class="text-btn" data-action="host-skip" style="width:100%">Fehlende Person überspringen …</button>':''}</div>`:''}</aside></div>`}
  <div class="game-footer"><span class="status-dot" style="justify-content:center"><i class="dot"></i>${screen==='direct'?esc(directStatus(direct)):screen==='room'?networkError?'Verbindung zum Spielraum unterbrochen':roomConnection.fresh(room.code)?'Mit Spielraum synchronisiert · Internet erforderlich':'Verbindung wird geprüft':saveFailed?'Speichern eingeschränkt':offlineReady?'Automatisch gespeichert · Offline bereit':'Automatisch gespeichert · Offline-Status in Einstellungen'} · v${APP_VERSION}</span></div>`;
}
function lobbyHTML(){if(!roomState)return `<div class="lobby"><span class="eyebrow">SPIELRAUM ${esc(room?.code)}</span><h1>${roomAccessDenied?'Raumzugang beendet.':networkError?'Verbindung unterbrochen.':'Einen Moment …'}</h1><p>${esc(networkError||'Dein Spielraum wird geladen.')}</p><button class="primary" data-action="${roomAccessDenied?'room-setup':'reconnect'}">${roomAccessDenied?'Mit Raumcode beitreten':'Erneut verbinden'}</button><button class="text-btn" data-action="forget-room">Raum auf diesem Gerät verlassen</button></div>`;const host=roomState.hostId===room.playerId;return `<section class="lobby">${cancellationNotice(roomState.lastAbort)}<span class="pill"><i class="dot"></i> EUER GEMEINSAMER SPIELRAUM</span><h1 class="room-lobby-title">${roomState.roomName?esc(roomState.roomName):'Gute Gesellschaft.<br>Gute Würfe.'}</h1>${host?'<button class="text-btn room-rename" data-action="rename-room" '+(busy?'disabled':'')+'>'+icon('edit')+'Raumnamen ändern</button>':''}<p>Teile diesen Code mit deinen Mitspielenden.</p><button class="room-code" data-action="copy-code" aria-label="Raumcode kopieren">${esc(room.code)}</button><p>Zum Kopieren antippen · Internet erforderlich · ${roomState.members.length}/6 Personen</p><p class="room-members-help">Wiederverwendbar · Bereinigung nach 14 Tagen ohne Öffnen oder Aktion. Die Besetzung lässt sich vor dem Start und zwischen zwei Partien ändern.</p><div class="people">${roomState.members.map(m=>`<div class="person"><span class="avatar">${esc(m.name[0].toUpperCase())}</span>${esc(m.name)}${connectionIndicator(roomState.members.indexOf(m))}<small>${m.id===roomState.hostId?'Gastgeber':m.id===room.playerId?'Du':'Mit dabei'}</small>${host&&m.id!==roomState.hostId?'<button class="text-btn room-member-remove" data-action="remove-room-member" data-member-id="'+esc(m.id)+'" aria-label="'+esc(m.name)+' aus dem Raum entfernen" '+(busy?'disabled':'')+'>Entfernen</button>':''}</div>`).join('')}${roomState.members.length<2?'<div class="empty">Noch wartet dein nächster Lieblingsgegner.</div>':''}</div>${roomBoardNotice(host)}${boardPicker(roomState.boardId||'classic','room',host&&!busy,roomState.supportsBoards!==false,roomState.supportsRandomBoard!==false,roomState.randomUpdateNeeded||[])}${hiddenOptionHTML(!!roomState.hiddenScores,host,'room-hidden')}${mineLobbyHtml(roomState.mines===true,host&&!busy,'room-mines',roomState.supportsMines!==false,roomState.mineUpdateNeeded||[])}${bonusOptionHtml(roomState.bonusFields===true,host&&!busy,'room-bonus',roomState.supportsBonusFields!==false,roomState.bonusUpdateNeeded||[])}${networkError?`<div class="connection-banner">${esc(networkError)}</div>`:''}${host?`<button class="primary" data-action="start-room" ${busy||roomState.members.length<2?'disabled':''}>${icon('dice')}Partie starten</button>`:`<p>Die Partie startet, sobald der Gastgeber bereit ist.</p>`}<div class="lobby-actions"><button class="outline-btn" data-action="share-room">${icon('share')}Einladen</button><button class="outline-btn" data-action="forget-room">Raum ausblenden</button></div><div class="info-box">Teile den Farbfeld-Link und diesen Raumcode. Farbfeld benötigt keinen Account.</div></section>`;}
function roomBoardNotice(host){
 const missing=roomState.boardUpdateNeeded||[];
 if(roomState.supportsBoards===false)return '<div class="room-board-notice needs-update" role="status"><strong>Spielbrett-Unterstützung noch nicht bestätigt.</strong><p>'+(missing.length?'<b>'+esc(missing.join(', '))+'</b>: Bitte diesen Raum auf dem jeweiligen Handy':'Bitte den Raum auf allen Handys')+' öffnen und kurz im Vordergrund lassen. Auch ältere Räume prüfen die Unterstützung automatisch neu.</p><p>Falls nötig: Einstellungen → Auf Updates prüfen → Aktualisieren. Zusätzliche Bretter benötigen mindestens Version 1.6.0.</p><button class="outline-btn" data-action="refresh-room" '+(busy?'disabled':'')+'>'+icon('refresh')+'Raum neu prüfen</button></div>';
 return '<p class="board-help">'+(host?'Wähle Spielbrett und Zusatzregeln vor jeder Partie. Danach „Partie starten“ antippen.':'Der Gastgeber wählt Spielbrett und Zusatzregeln vor jeder Partie.')+'</p>';
}
function render(center=false){
  if(!room||!['home','room'].includes(screen))reactionOverlay.receiveRoom([],'');
  const previous=boardView.snapshot(),oldFocus=document.activeElement?.dataset?.action,oldI=document.activeElement?.dataset?.i;
  const g=currentGame();if(g)observeLeave(g);const freshMines=g?observeMineBlasts(g):[];
  const awaiting=g&&['room','direct'].includes(screen)&&g.status==='playing'&&g.phase==='choose'&&inspectPid===null&&g.submitted.includes(myPid(g));
  if(g){if(inspectPid!==null&&!mayInspect(g,inspectPid,myPid(g)))inspectPid=null;announceColors(g);announceBonusFields(g);announceMineReady(g);}
  app.innerHTML=`<div class="app-shell ${awaiting?'awaiting-game':''} ${g&&screen!=='home'?'game-screen':''} ${g?.mode==='computer'?'computer-game':''} ${g?.players.length>1?'compact-game':''} ${g?.phase==='choose'&&screen!=='home'&&!handover&&inspectPid===null?'choosing-game':''}">${header()}${updateNotice()}${screen==='home'?home():g?gameHTML(g):screen==='direct'?directLobbyHTML():lobbyHTML()}</div>`;
  if(screen==='home')savedRoomsMarkup=savedRoomsHTML();
  const players=$('.players'),taking=players?.querySelector('.viewed.is-turn')||players?.querySelector('.is-turn');
  if(players&&taking){const strip=players.getBoundingClientRect(),chip=taking.getBoundingClientRect();if(chip.left<strip.left||chip.right>strip.right)players.scrollLeft+=chip.left-strip.left;}
  syncChoicePanel();
  boardView.attach($('#board-scroll'),$('#board-scroll .board'),{center,previous});
  choiceObserver?.disconnect();
  if(typeof ResizeObserver!=='undefined'){choiceObserver??=new ResizeObserver(scheduleChoicePanel);const card=$('.dice-card.choosing');if(card)choiceObserver.observe(card);}
  if(oldFocus==='cell'&&oldI!==undefined){const el=app.querySelector(`[data-action="cell"][data-i="${oldI}"]`);if(el&&!el.disabled)el.focus({preventScroll:true});}
  animateRoll=false;
  if(dialog.open&&dialog.dataset.panel==='scores'){if(g){const content=dialog.querySelector('.score-content'),expanded=[...content.querySelectorAll('details')].map(e=>e.open),top=dialog.scrollTop;content.innerHTML=scoreCardsHTML(g);content.querySelectorAll('details').forEach((e,i)=>e.open=!!expanded[i]);dialog.scrollTop=top;}else closeModal();}
  if(dialog.open&&dialog.dataset.panel==='mine-target'){const confirm=dialog.querySelector('[data-action="mine-confirm"]');if(confirm)confirm.disabled=busy||screen==='direct'&&!!direct.pending||!Number.isInteger(mineRequest?.target);}
  if(freshMines.length)playMineBlast({...freshMines.at(-1),ownPid:myPid(g)});
  scheduleComputer();
  syncNotificationContext();
  roomPoller.refresh();
}
function syncNotificationContext(){
 const directMode=screen==='direct'||screen==='home'&&direct.ready;
 const game=directMode?direct.snapshot?.game:['room','home'].includes(screen)?roomState?.game:null;
 const pid=directMode?direct.pid:game?.players.findIndex(player=>player.id===room?.playerId);
 notifications.setRooms(roomBook.entries());
 const access=room&&roomBook.get(room.code)?.summary?.access;
 notifications.setContext(!directMode&&!roomAccessDenied&&!['missing','denied'].includes(access)&&['room','home'].includes(screen)?room:null,game,pid,!directMode||direct.ready);
}
function openNotificationGame(value){
 if(value.mode==='room'){
  openSavedRoom(value.code).catch(error=>toast(error.message));
 }else if(value.mode==='direct'&&direct.saved){if(screen!=='direct')resetSelection();closeModal();screen='direct';inspectPid=null;handover=false;render();}
}
function notificationBody(){
 const state=notifications.state,enabled=state.enabled&&notifications.permission==='granted',blocked=notifications.permission==='denied',unavailable=!notifications.supported;
 const target=notifications.room,linked=target&&notifications.bound===target.code+':'+target.playerId,checked=notifications.connection;
 const groupCount=notifications.boundRoomCodes.length;
 const bindingDetail=groupCount>1?groupCount+' gespeicherte Spielräume für Hinweise verbunden.':target?(linked?'Mit Spielraum '+target.code+' verbunden.':'Die Zuordnung zum Spielraum wird noch bestätigt.'):'Noch kein Internet-Spielraum zugeordnet. Öffne deinen gespeicherten Raum oder tritt einem Raum bei.';
 const checkDetail=checked?'<div class="notification-rules" role="status"><strong>Zuordnung geprüft</strong><p>'+esc(checked.code?(checked.hasRoomAccess?'Mit Spielraum '+checked.code+' verbunden.':'Der Zugang zu diesem Spielraum ist nicht mehr gültig. Bitte den Raum öffnen.'):'Kein Internet-Spielraum zugeordnet.')+'</p><p>Solange Farbfeld sichtbar ist, erscheinen keine automatischen Spielhinweise.'+(checked.notice?' Bereits sichtbare Spielhinweise werden später nicht nachgemeldet.':' Der nächste Hinweis entsteht bei einer neuen eigenen Spielgelegenheit, beim Spielende oder beim Start einer Revanche.')+'</p></div>':'';
 const delivery=notifications.delivery,deliveryText=describePushDelivery(delivery);
 const deliveryDetail=deliveryText?'<div class="notification-rules" role="status"><strong>'+({test:'Internet-Test',turn:'Automatischer Zughinweis',finished:'Automatisches Spielende',rematch:'Revanche gestartet'}[delivery.kind]||'Letzter Internet-Push')+'</strong><p class="notification-at">'+esc(new Date(delivery.at).toLocaleString('de-AT',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}))+'</p><p>'+esc(deliveryText.title)+'</p><p>'+esc(deliveryText.detail)+'</p></div>':'';
 const historyDetail=notifications.history.length?'<details class="notification-rules"><summary>Letzte Zustellversuche ('+notifications.history.length+')</summary><ol>'+notifications.history.map(item=>{const info=describePushDelivery(item);return '<li><strong>'+({turn:'Dein Zug',finished:'Spielende',rematch:'Revanche gestartet',test:'Internet-Test'}[item.kind]||'Hinweis')+'</strong> · '+esc(new Date(item.at).toLocaleString('de-AT'))+'<p>'+esc(info?.title||'Status unbekannt')+(item.attempt?' · Versuch '+item.attempt+' von 4':'')+'</p></li>';}).join('')+'</ol><p>Nur dieses Gerät. Eine Browserquittung bestätigt kein menschliches Lesen.</p></details>':'';
 const status=unavailable?'Hier nicht verfügbar':blocked?'In Chrome blockiert':enabled?'Aktiviert · '+(state.sound?'Geräteton erlaubt':'Lautlos'):'Ausgeschaltet';
 const detail=unavailable?'Öffne die installierte Farbfeld-App oder die HTTPS-Adresse in Chrome auf Android.':blocked?'Öffne in Chrome die Website-Einstellungen für Farbfeld und erlaube dort Benachrichtigungen.':enabled?(state.pushReady&&!notifications.error?'Internet-Push ist eingerichtet. '+bindingDetail:'Lokale Hinweise sind aktiviert. Internet-Push wird bei verfügbarer Verbindung vorbereitet.'):'Du entscheidest, ob Farbfeld dich außerhalb der App erinnern darf.';
 return '<div class="install-status '+(enabled?'ready':'pending')+'"><strong>'+status+'</strong><p>'+detail+'</p></div><div class="notification-rules"><strong>Wenige, passende Hinweise</strong><ul><li>Dein Zug, das Spielende und eine neu gestartete Revanche.</li><li>Keine Meldung, solange Farbfeld sichtbar ist.</li><li>Bereits gesehene Züge werden nicht nachträglich gemeldet.</li><li>Höchstens ein Hinweis pro Minute, keine wiederholten Erinnerungen.</li><li>Neue Hinweise ersetzen den bisherigen Eintrag.</li><li>Keine Punkte, Spielblätter oder Namen auf dem Sperrbildschirm.</li></ul></div>'+(notifications.error?'<p class="notification-note">'+esc(notifications.error)+'</p>':'')+(enabled?'<button class="outline-btn" data-action="notification-disable" '+(notifications.busy?'disabled':'')+'>Benachrichtigungen ausschalten</button><div class="settings-row"><span>Ton und Vibration<small>Auch bei neuen Zügen · sonst bleiben Hinweise lautlos.</small></span><button class="toggle '+(state.sound?'on':'')+'" role="switch" aria-label="Ton und Vibration für Benachrichtigungen" aria-checked="'+state.sound+'" data-action="notification-sound" '+(notifications.busy?'disabled':'')+'></button></div><button class="outline-btn" data-action="notification-test" '+(notifications.busy?'disabled':'')+'>Geräteanzeige testen</button><p class="notification-note">Dieser Test prüft nur die Anzeige auf deinem Gerät, nicht den Serverversand. Auch der Test zählt zum Minutenlimit.</p><button class="outline-btn" data-action="notification-push-test" '+(notifications.busy?'disabled':'')+'>Internet-Push testen</button><p class="notification-note">Ein Test über Server und Push-Dienst, auch bei geöffneter App. Höchstens einmal pro Minute.</p>'+deliveryDetail+historyDetail+'<button class="outline-btn" data-action="notification-check" '+(notifications.busy?'disabled':'')+'>Push-Status prüfen</button>'+checkDetail+(!state.pushReady||notifications.error?'<button class="text-btn" data-action="notification-retry" '+(notifications.busy?'disabled':'')+'>Internet-Push erneut verbinden</button>':''):'<button class="primary" data-action="notification-enable" '+(unavailable||blocked||notifications.busy?'disabled':'')+'>'+(notifications.busy?'Wird eingerichtet …':'Benachrichtigungen aktivieren')+'</button>')+'<p class="notification-note">Internet-Spielräume können dich auch bei geschlossener App erinnern. Im Offline-Direktmodus sind Hinweise nur möglich, solange Android die App und die Verbindung weiter ausführt. Solo, Computer und „Ein Handy“ erhalten keine Spielhinweise.</p>';
}
function notificationSettings(){openModal('Benachrichtigungen.','<div id="notification-settings">'+notificationBody()+'</div>','notifications');}
function refreshNotificationPanel(){const content=$('#notification-settings');if(dialog.open&&dialog.dataset.panel==='notifications'&&content)content.innerHTML=notificationBody();}
async function notificationAction(action){
 if(notifications.busy)return;notifications.busy=true;refreshNotificationPanel();
 try{
  if(action==='notification-enable'){await notifications.enable();syncNotificationContext();toast('Benachrichtigungen aktiviert. Standardmäßig lautlos.');}
  else if(action==='notification-disable'){await notifications.disable();toast('Benachrichtigungen ausgeschaltet.');}
  else if(action==='notification-sound')await notifications.setSound(!notifications.state.sound);
  else if(action==='notification-retry')await notifications.retry();
  else if(action==='notification-check'){await notifications.checkConnection();toast('Push-Status geprüft. Es wurde keine Testnachricht verschickt.');}
  else if(action==='notification-push-test'){const delivery=await notifications.testPush();toast(describePushDelivery(delivery)?.title||'Internet-Test gestartet.');}
  else if(action==='notification-test'){const result=await notifications.test();toast(result.shown?'Beispielbenachrichtigung angezeigt.':'Höchstens eine Benachrichtigung pro Minute. Bitte kurz warten.');}
 }catch(error){toast(error.message);}
 finally{notifications.busy=false;refreshNotificationPanel();}
}
function computerMoveHTML(g){
 if(isHidden(g,COMPUTER,HUMAN))return '';
 const move=g.log.findLast(entry=>entry.player==='Computer');if(!move)return '';
 return '<div class="computer-last-move"><strong>Letzter Computerzug · Wurf '+move.round+'</strong><span>'+(move.pass?'Gepasst · keine Joker verbraucht':move.count+' '+(move.count===1?'Feld':'Felder')+' in '+LABELS[move.color])+'</span></div>';
}
function scheduleComputer(){
 clearTimeout(computerTimer);
 if(screen!=='game'||dialog.open||document.hidden||!needsComputerTurn(local))return;
 const expected=local;
 computerTimer=setTimeout(()=>{
  if(screen!=='game'||dialog.open||document.hidden||local!==expected||!needsComputerTurn(local))return;
  local=stepComputer(local);viewPid=HUMAN;handover=false;resetSelection();saveLocal();recordResult(local);render();
 },Math.max(700,computerNotBefore-performance.now()));
}
function difficultyPicker(value){return '<div class="computer-difficulty"><label for="computer-difficulty">Computer-Stärke</label><select id="computer-difficulty" class="outline-btn">'+COMPUTER_LEVELS.map(level=>'<option value="'+level.id+'" '+(level.id===value?'selected':'')+'>'+level.label+'</option>').join('')+'</select><p class="caption" id="computer-difficulty-help">'+COMPUTER_LEVELS.find(level=>level.id===value).description+'</p></div>';}
function openComputerLevel(){if(currentGame()?.mode!=='computer'||local.status!=='playing')return;computerLevelGameId=local.gameId;openModal('Computer-Stärke.',difficultyPicker(computerDifficulty(local))+'<button class="primary" data-action="apply-computer-level">Stärke übernehmen</button>','computer-level');}
function applyComputerLevel(){if(currentGame()?.mode!=='computer'||local.gameId!==computerLevelGameId||local.status!=='playing'){closeModal();return;}const level=$('#computer-difficulty')?.value;if(!validComputerDifficulty(level))return;local=changeComputerDifficulty(local,level);prefs.computerDifficulty=level;persist(PREFKEY,prefs);saveLocal();closeModal();render();toast('Computer spielt jetzt '+computerLevel(local).label+'.');}
function setupComputer(){
 nextComputerHidden=false;nextComputerDifficulty=local?.mode==='computer'?computerDifficulty(local):prefs.computerDifficulty;
 openModal('Du gegen den Computer.',`<p>Du beginnst. Ihr spielt mit demselben Wurf auf eigenen Blättern. Ein Handy, auch offline.</p>${difficultyPicker(nextComputerDifficulty)}${boardPicker(prefs.boardId)}${hiddenSetup(local?.mode==='computer'&&!!local.hiddenScores)}${mineSetupHtml(minesEnabled(local))}${bonusSetupHtml(local?.mode==='computer'&&bonusFieldsEnabled(local))}<button class="primary" data-action="start-computer">${icon('computer')}Gegen Computer starten</button>`,'computer-setup');
}
function startComputer(force=false){
 if(!force){nextComputerHidden=!!$('#hidden-scores')?.checked;nextComputerBoard=readBoardChoice();nextComputerDifficulty=$('#computer-difficulty')?.value||'medium';nextComputerMines=$('#mine-enabled')?.checked===true;nextComputerBonus=$('#bonus-fields')?.checked===true;}
 if(!force&&!confirmNew('computer'))return;
 rememberBoard(nextComputerBoard);prefs.computerDifficulty=nextComputerDifficulty;persist(PREFKEY,prefs);local=createComputerGame(nextComputerHidden,nextComputerBoard,nextComputerDifficulty,nextComputerMines,nextComputerBonus);local.gameId=newId();screen='game';viewPid=HUMAN;inspectPid=null;handover=false;resetSelection();saveLocal();closeModal();render(true);window.scrollTo(0,0);
}
function openMineTarget(){
 const g=currentGame(),own=g&&myPid(g);if(!g||!canUseMine(g,own)||busy||handover||screen==='direct'&&(!direct.ready||direct.pending)){toast('Die Mine ist während deiner eigenen Auswahl nach einem fremden Farbabschluss verfügbar.');return;}
 mineRequest={gameId:g.gameId,turn:g.turn,target:null};openModal('Minenangriff.',mineTargetHtml(g,null,own),'mine-target');
}
function selectMineTarget(target){
 const g=currentGame(),own=g&&myPid(g);if(!mineRequest||!g||g.gameId!==mineRequest.gameId||g.turn!==mineRequest.turn||!canUseMine(g,own)||!Number.isInteger(target)||target<0||target>=105)return;
 mineRequest.target=target;const scroll=dialog.scrollTop;openModal('Minenangriff.',mineTargetHtml(g,target,own),'mine-target');dialog.scrollTop=scroll;
}
async function confirmMine(){
 const g=currentGame(),own=g&&myPid(g);if(busy||screen==='direct'&&direct.pending)return;
 if(!mineRequest||!g||g.gameId!==mineRequest.gameId||g.turn!==mineRequest.turn||!canUseMine(g,own)){mineRequest=null;closeModal();toast('Die Spielsituation hat sich geändert. Bitte das Ziel neu wählen.');return;}
 const target=mineRequest.target;if(!Number.isInteger(target))return;
 if(screen==='room'){await roomAction('mine',{target,gameId:g.gameId,round:g.round});return;}
 if(screen==='direct'){directAction('mine',{target});return;}
 const next=applyMineAttack(g,own,target);if(!persist(KEY,next))return;local=next;render();toast('Mine eingesetzt · fünf Punkte Einsatz. Dein normaler Zug bleibt erhalten.');
}
function observeMineBlasts(g){
 const id=g?.gameId||'',blasts=mineBlasts(g),key=b=>b.by+':'+b.turn;
 if(mineBlastGame!==id){mineBlastGame=id;seenMineBlasts=new Set(blasts.map(key));return [];}
 const fresh=blasts.filter(b=>!seenMineBlasts.has(key(b)));blasts.forEach(b=>seenMineBlasts.add(key(b)));if(!fresh.length||!['game','room','direct'].includes(screen))return [];
 const own=myPid(g),ownAttack=fresh.findLast(b=>b.by===own);
 if(ownAttack){const target=mineBlastTargets(ownAttack).find(t=>t.cells.length)||mineBlastTargets(ownAttack)[0];if(target&&!isHidden(g,target.pid,own))inspectPid=target.pid;if(mineRequest?.gameId===id){mineRequest=null;if(dialog.dataset.panel==='mine-target')closeModal();}}
 else if(fresh.some(b=>mineBlastTargets(b).some(t=>t.pid===own&&t.cells.length)))inspectPid=null;
 computerNotBefore=performance.now()+MINE_ANIMATION_MS;return fresh;
}

function openModal(title,content,panel=''){dialog.dataset.panel=panel;dialog.innerHTML=`<div class="modal"><div class="modal-head"><div><h2>${title}</h2><button class="modal-version" data-action="version-tap">Farbfeld v${APP_VERSION}</button></div><button class="icon-btn" data-action="close-modal" aria-label="Schließen">×</button></div>${content}</div>`;if(!dialog.open)dialog.showModal();}
function closeModal(){directUi?.stop();dialog.close();}
function requestDiscardDirect(){
  const g=direct.snapshot?.game;if(g?.status==='playing'){if(g.players[direct.pid]?.left){openModal('Partie läuft weiter.', '<p>Du bist bereits ausgestiegen. '+(direct.pid===0?'Bitte dieses Gastgeber-Handy bis zum Spielende geöffnet lassen. Die anderen benötigen es als Verbindung.':'Die anderen spielen weiter. Du kannst diese App schließen.')+'</p><button class="primary" data-action="close-modal">Verstanden</button>');return;}screen='direct';requestLeaveGame();return;}
  directUi.cancelUi();
  discardDirectRequest={generation:direct.generation,sessionId:direct.snapshot?.sessionId??null,gameId:direct.snapshot?.game?.gameId??null};
  const playing=direct.snapshot?.game?.status==='playing';
  openModal('Direktpartie abbrechen?', '<p>'+(playing?'Die gespeicherte Direktpartie und der Gerätezugang werden auf diesem Handy entfernt. Sie können danach hier nicht fortgesetzt werden.':'Die wartende Kopplung und der gespeicherte Direktzugang werden auf diesem Handy entfernt. Danach kannst du eine neue Direktpartie erstellen oder beitreten.')+'</p><p>Die Verbindung wird geschlossen. Die anderen Handys behalten ihren gespeicherten Spielstand.</p><button class="primary danger-btn" data-action="confirm-discard-direct">Ja, Direktpartie abbrechen</button><button class="outline-btn" data-action="close-modal">Zurück</button>','discard-direct');
}
function confirmDiscardDirect(){
  const request=discardDirectRequest;if(!request)return;
  if(request.generation!==direct.generation||request.sessionId!==(direct.snapshot?.sessionId??null)||request.gameId!==(direct.snapshot?.game?.gameId??null)){requestDiscardDirect();return;}
  directUi.cancelUi();direct.forget();discardDirectRequest=null;screen='home';inspectPid=null;handover=false;resetSelection();closeModal();render();window.scrollTo(0,0);toast('Direktpartie abgebrochen. Du kannst neu starten.');
}
function requestLeaveGame(){
 const g=currentGame(),pid=g&&myPid(g);if(g?.status!=='playing'||!g.players[pid]||g.players[pid].left){toast('Du nimmst an keiner laufenden Partie teil.');return;}
 const mode=screen==='room'?'room':screen==='direct'?'direct':'local',supported=mode==='room'?roomState.supportsLeave!==false:mode==='direct'?direct.ready&&direct.manager?.supportsLeave!==false:true;
 if(!supported){openModal('Partie verlassen.', '<p>Damit die anderen weiterspielen können, bitte alle aktiven Apps auf Version 1.17.0 oder neuer aktualisieren und die Verbindung wiederherstellen.</p><button class="primary" data-action="close-modal">Zurück zur Partie</button>');return;}
 abortRequest={kind:'leave',mode,gameId:g.gameId,pid};
 openModal('Partie verlassen?', '<p><strong>'+esc(g.players[pid].name)+' erhält −10 Punkte und eine Niederlage im Verlauf.</strong> Die anderen spielen weiter. Bleibt nur eine Person übrig, gewinnt sie sofort.</p>'+(mode==='direct'&&direct.pid===0&&g.players.filter(p=>!p.left).length>2?'<div class="info-box">Dieses Handy bleibt als Gastgeber die Verbindung zwischen den anderen. Bitte Farbfeld hier geöffnet lassen, bis die Partie beendet ist. Du schaust nur noch zu.</div>':'')+'<button class="primary danger-btn" data-action="confirm-abort-game">Verlassen · −10 Punkte</button><button class="outline-btn" data-action="close-modal">Zurück zur Partie</button>','leave-game');
}
async function confirmLeaveGame(){
 const request=abortRequest,g=currentGame();if(!request||request.kind!=='leave'||g?.gameId!==request.gameId||g.status!=='playing'||g.players[request.pid]?.left){abortRequest=null;closeModal();return;}
 pendingLeave={...request};
 if(request.mode==='room'){if(!await roomAction('leave',{gameId:g.gameId}))pendingLeave=null;return;}
 if(request.mode==='direct'){try{direct.act('leave');}catch(error){pendingLeave=null;toast(error.message);}return;}
 const next=leaveGame(g,request.pid);if(!persist(KEY,next)){pendingLeave=null;return;}recordResult(next,request.pid);if(next.status==='finished'&&next.mode==='local')recordResult(next);local=next;render();
}
function observeLeave(g){
 if(!pendingLeave||g.gameId!==pendingLeave.gameId||!g.players[pendingLeave.pid]?.left)return;
 const request=pendingLeave;pendingLeave=null;abortRequest=null;recordResult(g,request.pid);resetSelection();inspectPid=null;closeModal();
 if(request.mode==='local'&&g.mode==='local'){viewPid=g.active;handover=g.status==='playing';}
 else {screen=request.mode==='direct'&&direct.pid===0&&g.status==='playing'?'direct':'home';handover=false;}
 toast('Partie verlassen · −10 Punkte im Verlauf.');
}
function requestAbortGame(){
  const current=currentGame();if(current?.players.length>1){requestLeaveGame();return;}
  const g=currentGame();if(g?.status!=='playing'){toast('Es läuft keine Partie.');return;}
  const mode=screen==='room'?'room':screen==='direct'?'direct':'local';
  const localOnly=mode==='direct'&&(!direct.ready||!direct.snapshot.capabilities?.includes('abort-v1'));
  abortRequest={mode,gameId:g.gameId,localOnly};
  const message=localOnly?'Die Direktpartie wird nur auf diesem Handy verworfen. Das andere Handy behält seinen Stand. Ein gemeinsamer Abbruch benötigt eine Verbindung und aktuelle Apps.':mode==='local'?'Der laufende Spielstand wird verworfen und kann danach nicht fortgesetzt werden.':'Die laufende Partie wird für alle Mitspielenden beendet. Danach könnt ihr im selben Spielraum eine neue Partie starten.';
  openModal('Partie wirklich abbrechen?', '<p>'+message+'</p><p>Die abgebrochene Partie wird nicht als Ergebnis gewertet.</p><button class="primary danger-btn" data-action="confirm-abort-game">'+(localOnly?'Auf diesem Handy beenden':'Ja, Partie abbrechen')+'</button><button class="outline-btn" data-action="close-modal">Zurück zur Partie</button>','abort-game');
}
async function confirmAbortGame(){
  if(busy||!abortRequest)return;if(abortRequest.kind==='leave'){await confirmLeaveGame();return;}const request=abortRequest,g=currentGame();
  if(g?.status!=='playing'||g.gameId!==request.gameId){abortRequest=null;closeModal();toast('Diese Partie wurde inzwischen beendet oder ersetzt.');return;}
  try{
    if(request.mode==='room'){if(!await roomAction('abort'))return;}
    else if(request.mode==='direct'){
      if(request.localOnly){directUi.cancelUi();direct.forget();screen='home';}
      else direct.act('abort');
    }else{
      if(!persist(KEY,null))return;local=null;screen='home';toast('Partie abgebrochen.');
    }
    abortRequest=null;resetSelection();inspectPid=null;handover=false;closeModal();render();window.scrollTo(0,0);
  }catch(error){toast(error.message);}
}
function confirmNew(callback){if(local?.status==='playing'){openModal('Neue Partie?',`<p>Deine laufende Partie auf diesem Gerät wird ersetzt. Du kannst sie vorher über die Einstellungen exportieren.</p><button class="primary" data-action="replace-${callback}">Neue Partie starten</button><button class="outline-btn" data-action="close-modal">Zurück zur laufenden Partie</button>`);return false;}return true;}
function rememberBoard(id){prefs.boardId=id;persist(PREFKEY,prefs);}
function readBoardChoice(){return $('#dialog input[data-board-choice]:checked')?.value||prefs.boardId||'classic';}
function boardPicker(selected='classic',context='start',enabled=true,customAllowed=true,randomAllowed=true,randomMissing=[]){
 const selectedBoard=BOARDS.find(b=>b.id===selected)||BOARDS[0];
 return '<fieldset class="board-picker"><legend>Spielbrett</legend><div class="board-options">'+BOARDS.map(board=>'<label class="board-option"><input type="radio" name="board-'+context+'" data-board-choice="'+context+'" aria-describedby="board-description-'+context+'" value="'+board.id+'" '+(board.id===selected?'checked':'')+' '+(!enabled||board.id!=='classic'&&!customAllowed||board.id==='random'&&!randomAllowed?'disabled':'')+'><span class="board-preview'+(board.id==='random'?' board-random':'')+'" aria-hidden="true">'+(board.id==='random'?icon('dice'):board.cells.map((color,i)=>'<i style="--cell:var(--'+color+')">'+(board.stars.includes(i)?'•':'')+'</i>').join(''))+'</span><span class="board-option-copy"><strong>'+board.name+'</strong></span></label>').join('')+'</div><p class="board-choice-description" id="board-description-'+context+'">'+esc(selectedBoard.description)+'</p>'+(!customAllowed?'<p class="board-help">Für neue Bretter müssen alle Apps Version 1.6.0 oder neuer öffnen.</p>':'')+(!randomAllowed?'<p class="board-help">'+(randomMissing.length?esc(randomMissing.join(', '))+': ':'')+'Random benötigt Version 1.17.0 oder neuer auf allen Handys. Bitte den Raum erneut öffnen.</p>':'')+'</fieldset>';
}

function setupSolo(){openModal('Dein nächstes Farbfeld.', '<p>30 Würfe auf deinem gewählten Spielbrett.</p>'+boardPicker(prefs.boardId)+bonusSetupHtml(local?.mode==='solo'&&bonusFieldsEnabled(local))+'<button class="primary" data-action="start-solo">Solo starten</button>','solo-setup');}
function startSolo(force=false){if(!force){nextSoloBoard=readBoardChoice();nextSoloBonus=$('#bonus-fields')?.checked===true;}if(!force&&!confirmNew('solo'))return;rememberBoard(nextSoloBoard);local=createGame(['Du'],'solo',[],{boardId:nextSoloBoard,bonusFields:nextSoloBonus});local.gameId=newId();screen='game';viewPid=0;inspectPid=null;handover=false;resetSelection();saveLocal();closeModal();render(true);window.scrollTo(0,0);}
function setupLocal(){const previous=local?.mode==='local'&&local.status==='finished'?local.players.map(p=>p.name):[],count=previous.length||2;openModal('Alle an einem Handy.',`<p>Ihr spielt reihum mit demselben Wurf. Nach jedem Zug gebt ihr das Handy weiter. Funktioniert auch offline.</p><form data-form="local"><label for="player-count">Wie viele seid ihr?</label><select id="player-count" class="outline-btn" style="width:100%">${[2,3,4,5,6].map(n=>`<option value="${n}" ${n===count?'selected':''}>${n} Personen</option>`).join('')}</select><div id="name-fields">${localNames(count,previous)}</div>${boardPicker(prefs.boardId)}${hiddenSetup(!!previous.length&&!!local.hiddenScores)}${mineSetupHtml(!!previous.length&&minesEnabled(local))}${bonusSetupHtml(!!previous.length&&bonusFieldsEnabled(local))}<button class="primary" type="submit">${icon('dice')}Gemeinsam starten</button></form>`);}
function localNames(count,names=[]){return Array.from({length:count},(_,i)=>`<label for="name-${i}">Person ${i+1}</label><input id="name-${i}" name="name-${i}" maxlength="24" value="${esc(names[i]||(i===0?'Du':'Person '+(i+1)))}" required autocomplete="off">`).join('');}
function together(){openModal('Am besten gemeinsam.',`<p>Wählt, wie ihr euer Farbfeld teilen möchtet.</p><button class="mode-option" data-action="direct-entry"><span>⌁</span><span><strong>Offline – mehrere Handys</strong><small>2–6 Personen · WLAN/Hotspot · jedes Handy einmal koppeln</small></span><span class="option-arrow">→</span></button><button class="mode-option" data-action="local-setup"><span>☏</span><span><strong>Ein Handy weitergeben</strong><small>2–6 Personen · komplett offline spielbar</small></span><span class="option-arrow">→</span></button><button class="mode-option" data-action="room-setup"><span>⌘</span><span><strong>Internet – Spielraum</strong><small>2–6 Personen · Server synchronisiert die Partie</small></span><span class="option-arrow">→</span></button><div class="info-box">Beim Direktmodus spielt jede Person am eigenen Handy. Internet wird nur für die optionale Raumcode-Kopplung gebraucht. Bluetooth ist dafür nicht nötig.</div>`);}
function roomSetup(){openModal('Internet – Spielraum',`<p>Mehrere Räume, mehrere Partien parallel. Deine Raumzugänge bleiben auf diesem Gerät gespeichert.</p><p class="caption">Der Gastgeber wählt Spielbrett, Minen und Bonusfelder vor dem Start im Raum.</p><button class="text-btn" data-action="manage-rooms">Gespeicherte Räume öffnen</button><label for="room-name">Dein Name</label><input id="room-name" maxlength="24" placeholder="z. B. Robin" value="${esc(prefs.name||'')}" autocomplete="given-name"><label for="room-title-create">Name des Spielraums (optional)</label><input id="room-title-create" maxlength="48" placeholder="z. B. Sonntagsrunde" autocomplete="off"><p class="input-help">Nur beim Erstellen · bis zu 48 Zeichen. Beigetreten wird weiterhin mit dem Raumcode.</p><button class="primary" data-action="create-room" ${busy?'disabled':''}>${icon('users')}Spielraum erstellen</button><div style="text-align:center;font-size:10px;color:#8e977f;margin-top:18px">ODER EINEM SPIEL BEITRETEN</div><label for="room-code">Raumcode</label><input id="room-code" class="code-input" maxlength="8" placeholder="8 Zeichen" value="${esc(new URL(location.href).searchParams.get('room')||room?.code||'')}" autocomplete="off"><button class="outline-btn" data-action="join-room" ${busy?'disabled':''}>Beitreten ${icon('arrow')}</button><div class="info-box">Teile den Farbfeld-Link und den Raumcode. Farbfeld benötigt keinen Account. Für diesen Spielraum brauchen alle Internet.</div>`);}
function renameRoom(){
 if(screen!=='room'||!roomState||roomState.hostId!==room.playerId)return;
 openModal('Euer Raumname.', '<form data-form="room-title"><p>Alle im Raum sehen denselben Namen. Der Raumcode <strong>'+esc(room.code)+'</strong> und die laufende Partie bleiben erhalten.</p><label for="room-title">Name des Spielraums</label><input id="room-title" maxlength="48" value="'+esc(roomState.roomName||'')+'" placeholder="z. B. Sonntagsrunde" autocomplete="off"><p class="input-help">Bis zu 48 Zeichen. Leer lassen, um den Standardnamen zu verwenden.</p><button class="primary" type="submit">Namen speichern</button><button class="outline-btn" type="button" data-action="close-modal">Abbrechen</button></form>','room-title');
 $('#room-title').focus();
}
function rememberRoomName(data){rememberRoomSnapshot(data);}
function rules(){openModal('Einfach losspielen.',`<p>Nach den Grundregeln von „Noch mal!“ – im eigenen Farbfeld-Design.</p><div class="rule"><span class="rule-number">1</span><div><h3>Wähle Farbe + Zahl.</h3><p>Würfle einmal. Kombiniere einen Farbwürfel mit einem Zahlenwürfel. Du kreuzt genau diese Anzahl Kästchen in dieser Farbe an.</p></div></div><div class="rule"><span class="rule-number">2</span><div><h3>In der Mitte geht’s los.</h3><p>Deine ersten Kreuze berühren Spalte H. Danach grenzt jeder neue, in sich verbundene Bereich an bestehende Kreuze – oder startet erneut in H. Nur waagrecht und senkrecht zählt.</p></div></div><div class="rule"><span class="rule-number">3</span><div><h3>Gut verbunden.</h3><p>Alle neuen Kreuze eines Zuges müssen untereinander zusammenhängen. Die Zahl lässt sich nicht auf getrennte Gruppen aufteilen. Maximal 5 Kästchen pro Zug.</p></div></div><div class="rule"><span class="rule-number">4</span><div><h3>Joker bewusst einsetzen.</h3><p>✳ steht für eine beliebige Farbe; ? für 1 bis 5 Felder. Jeder gewählte Jokerwürfel kostet einen deiner 8 Joker. Zwei Jokerwürfel kosten zwei. Übrige Joker zählen je +1.</p></div></div><div class="rule"><span class="rule-number">5</span><div><h3>Volle Spalten. Volle Farben.</h3><p>Eine vollständige Spalte bringt den Wert darunter: die erste Person den oberen, spätere den unteren. Sind mehrere im selben Wurf zuerst fertig, erhalten alle den oberen Wert. Alle 21 Kästchen einer Farbe bringen zuerst +5, später +3. Jeder offene Stern kostet −2.</p></div></div><div class="rule"><span class="rule-number">6</span><div><h3>Solo, Computer oder gemeinsam.</h3><p>Solo: 2 Farb- und 2 Zahlenwürfel, genau 30 Würfe. Gemeinsam: 3 + 3 Würfel. Ab dem 4. Wurf sind die 2 gewählten Würfel der aktiven Person für die anderen gesperrt; die übrigen sind mehrfach nutzbar. Passt die aktive Person, bleiben alle verfügbar. Nach dem Wurf mit der zweiten vollständigen Farbe einer Person endet das Spiel. Gegen den Computer gelten dieselben Mehrspielerregeln; er führt seine Züge automatisch aus.</p></div></div><div class="info-box">Passen ist jederzeit erlaubt und kostet keine Joker. Bei Punktegleichstand gewinnt, wer mehr Joker übrig hat. Bleibt auch das gleich, teilen sich diese Personen den Sieg.</div><div class="source-links">Spielidee: Inka & Markus Brand · Verlag: Schmidt Spiele. Diese persönliche Umsetzung ist keine offizielle Verlags-App.<a href="https://www.schmidtspiele.de/files/Produkte/4/49327%20-%20Noch%20mal!/49327_Noch_Mal_DE.pdf" target="_blank" rel="noopener">Original-Spielanleitung als PDF ↗</a><a href="https://www.schmidtspiele.de/details/produkt/noch-mal-.html" target="_blank" rel="noopener">Das Originalspiel beim Verlag ↗</a><a href="/game/vendor/qrcode-LICENSE.txt" target="_blank" rel="noopener">QR-Generator · MIT-Lizenz ↗</a><a href="/game/vendor/jsqr-LICENSE.txt" target="_blank" rel="noopener">QR-Scanner · Apache-2.0-Lizenz ↗</a></div>`);}
function themeOptions(){return '<section class="theme-settings"><h3>Dein Design</h3><p>Nur auf diesem Gerät · auch offline gespeichert</p><div class="theme-options" role="group" aria-label="Design auswählen">'+THEMES.map(theme=>'<button class="theme-option" data-action="set-theme" data-theme="'+theme.id+'" aria-pressed="'+(prefs.theme===theme.id)+'" aria-label="'+theme.name+' · '+theme.detail+'" title="'+theme.detail+'"><span class="theme-sample '+theme.id+'" aria-hidden="true">'+themeSymbol(theme)+'</span><strong>'+theme.name+'</strong><span class="theme-check" aria-hidden="true">'+(prefs.theme===theme.id?'✓':'')+'</span></button>').join('')+'</div></section>';}
function settings(){
  openModal('Ganz dein Spiel.',`${currentGame()?.mode==='computer'&&local.status==='playing'?'<div class="settings-row"><span>Computer-Stärke<small>'+computerLevel(local).label+'</small></span><button class="text-btn" data-action="computer-level">Ändern →</button></div>':''}${themeOptions()}<div class="settings-row"><span>Farbmuster anzeigen<br><small style="color:#8d967f">Zusätzliche Symbole auf den Kästchen</small></span><button class="toggle ${prefs.patterns?'on':''}" role="switch" aria-label="Farbmuster anzeigen" aria-checked="${prefs.patterns}" data-action="toggle-patterns"></button></div><div class="settings-row"><span>Vibration beim Antippen</span><button class="toggle ${prefs.haptics?'on':''}" role="switch" aria-label="Vibration" aria-checked="${prefs.haptics}" data-action="toggle-haptics"></button></div>
  <div class="settings-row"><span>Profil & Statistik<small>Mit anderen · Computer · Solo</small></span><button class="text-btn" data-action="profile">Ansehen →</button></div><div class="settings-row notification-entry"><span>Benachrichtigungen<small>Dein Zug · Spielende · Revanche · ${notifications.state.enabled&&notifications.permission==='granted'?'Aktiviert':'Ausgeschaltet'}</small></span><button class="text-btn" data-action="notification-settings">Einrichten →</button></div>
  <div class="settings-row"><span>App-Version</span><button class="version-value" data-action="version-tap">${APP_VERSION}</button></div><div class="install-status ${offlineReady?'ready':'pending'}"><strong>${pwaInfo.recovery?'Neue App-Adresse öffnen':pwaInfo.status==='error'?'Update nicht möglich':offlineReady?'Offline bereit ✓':pwaInfo.status==='checking'?'Offline wird vorbereitet …':pwaInfo.status==='update'?'Neue Version bereit':'Offline prüfen'}</strong><p>${esc(pwaInfo.message)}</p></div><button class="outline-btn" data-action="offline-check">Auf Updates prüfen</button><p class="update-help">Mit Internet prüfen, dann gegebenenfalls „Aktualisieren“ wählen. Die App bleibt installiert und deine bestätigten Züge bleiben gespeichert. Offline nutzt du die zuletzt geladene Version.</p>
  ${pwaInfo.status==='update'?'<button class="primary" data-action="reload-app">Aktualisieren</button>':''}
  <details class="settings-section"><summary>Installation & Spielstände</summary><div><button class="outline-btn" data-action="install">${icon('download')}Auf dem Handy installieren</button><button class="outline-btn" data-action="export">${icon('download')}Lokale Spielstände exportieren</button><button class="outline-btn" data-action="import">Spielstände importieren</button><input type="file" id="import-file" accept=".json,application/json" hidden><div class="info-box">Solo, Computer und „Ein Handy“ speichern auf diesem Gerät und sind im Export enthalten. Direktpartien speichern bestätigte Stände auf beiden Handys; sie werden über „Direktpartie fortsetzen“ wieder geöffnet. Für Internet-Spielräume liegt der gemeinsame Stand auf dem Server. Exportdateien enthalten keine Raum-Zugangsschlüssel.</div></div></details><details class="settings-section"><summary>Hilfe & Diagnose${directDiagnostics.state()?.enabled?' · Aufzeichnung läuft':''}</summary><div><div class="settings-row"><span>Offline-Testprotokoll<small>Für Tests mit zwei Handys · lokal und freiwillig</small></span><button class="text-btn" data-action="direct-diagnostics">Öffnen →</button></div><button class="outline-btn" data-action="direct-check">Offline-Verbindung prüfen</button><button class="text-btn" data-action="app-recovery">Hilfe beim App-Umzug</button></div></details>`,'settings');
}
const PROFILE_MODES=[{id:'people',label:'Mit anderen',icon:'users'},{id:'computer',label:'Computer',icon:'computer'},{id:'solo',label:'Solo',icon:'solo'}];
function profile(category='people'){
 const mode=PROFILE_MODES.find(item=>item.id===category)||PROFILE_MODES[0];category=mode.id;
 const stats=summarizeStats(statistics,category),number=value=>value===null?'–':value.toLocaleString('de-AT');
 const metric=(label,value)=>'<div><dt>'+label+'</dt><dd>'+number(value)+'</dd></div>';
 const totals=category==='solo'?metric('Partien',stats.played)+metric('Bestwert',stats.best)+metric('Ø Punkte',stats.average):metric('Partien',stats.played)+metric('Siege',stats.wins)+metric('Verloren',stats.losses);
 const metrics=category==='solo'||!stats.played?'':'<dl class="profile-metrics">'+metric('Bestwert',stats.best)+metric('Ø Punkte',stats.average)+metric('Serie aktuell',stats.currentStreak)+metric('Beste Serie',stats.longestStreak)+(stats.sharedWins?metric('Geteilte Siege',stats.sharedWins):'')+'</dl>';
 const opponents=category==='people'&&stats.opponents.length?'<section class="profile-opponents"><h3>Gegnerbilanz <small>Namen antippen</small></h3><div class="opponent-table"><table><caption class="visually-hidden">Direkter Vergleich gegen jede Person</caption><thead><tr><th scope="col">Gegner</th><th scope="col">Siege</th><th scope="col">Remis</th><th scope="col"><abbr title="Niederlagen">Verl.</abbr></th></tr></thead><tbody>'+stats.opponents.map(other=>'<tr><th scope="row"><button class="opponent-link" data-action="opponent-profile" data-opponent="'+esc(other.name)+'" data-category="'+category+'" aria-label="Bilanz gegen '+esc(other.name)+' öffnen">'+esc(other.name)+'<span aria-hidden="true">›</span></button></th><td>'+other.wins+'</td><td>'+other.draws+'</td><td>'+other.losses+'</td></tr>').join('')+'</tbody></table></div></section>':'';
 const empty=!stats.played?'<p class="profile-empty">'+(category==='people'?'Noch keine Partie mit anderen.':category==='computer'?'Noch keine Computerpartie.':'Noch keine Solopartie.')+'</p>':'';
 openModal('Deine Statistik.','<div class="profile-intro"><span class="avatar" aria-hidden="true">'+esc((prefs.name||'Du')[0].toUpperCase())+'</span><strong>'+esc(prefs.name||'Du')+'</strong><span>Auf diesem Gerät</span></div><div class="profile-filters" role="group" aria-label="Statistik auswählen">'+PROFILE_MODES.map(item=>'<button data-action="profile-mode" data-category="'+item.id+'" aria-pressed="'+(item.id===category)+'">'+icon(item.icon)+item.label+'</button>').join('')+'</div><section class="profile-content" aria-label="Statistik: '+mode.label+'"><dl class="profile-totals">'+totals+'</dl>'+metrics+empty+(stats.unknown?'<p class="profile-unknown">'+stats.unknown+' ältere Ergebnisse ohne eindeutige Zuordnung.</p>':'')+opponents+'</section><div class="profile-footer"><button class="outline-btn" data-action="history" data-category="'+category+'">'+icon('clock')+'Ergebnisse '+icon('arrow')+'</button><details class="profile-help"><summary>Zur Wertung</summary><ul><li>Nur fertige Partien. Mit anderen, Computer und Solo zählen getrennt – auch Serien und Bestwerte.</li><li>Geteilte Siege zählen mit. Bei Punktegleichstand entscheiden die übrigen Joker. Ein Handy: Es zählt die erste Person.</li><li>Gegnerbilanz je Person nach Name; in Gruppen unabhängig vom Gesamtsieg. Gleiche Namen werden zusammengefasst.</li><li>Ältere Ergebnisse ohne eindeutige eigene Rolle zählen als Partie, aber nicht als Sieg oder Gegnervergleich; sie unterbrechen die Serie.</li><li>Nur auf diesem Gerät gespeichert, auch über 100 Partien hinaus. Einstellungen → Lokale Spielstände exportieren sichert die Statistik.</li></ul></details></div>','profile');
 dialog.scrollTop=0;
}
function opponentProfile(name,category='people'){
 category=category==='computer'?'computer':'people';
 const stats=summarizeOpponent(statistics,name,category),number=value=>value===null?'–':value.toLocaleString('de-AT');
 const metric=(label,value)=>'<div><dt>'+label+'</dt><dd>'+number(value)+'</dd></div>';
 const outcomes={win:'Sieg',draw:'Remis',loss:'Niederlage'};
 openModal('Du gegen '+esc(stats.name)+'.','<button class="text-btn history-back" data-action="profile-mode" data-category="'+category+'">← Zur Statistik</button><dl class="profile-totals">'+metric('Siege',stats.wins)+metric('Remis',stats.draws)+metric('Verloren',stats.losses)+'</dl><dl class="profile-metrics">'+metric('Begegnungen',stats.played)+metric('Siegquote',stats.winRate===null?null:stats.winRate+' %')+metric('Serie aktuell',stats.currentStreak)+metric('Beste Serie',stats.longestStreak)+metric('Dein Bestwert',stats.best)+metric('Dein Ø',stats.average)+'</dl><section class="opponent-recent"><h3>Letzte Duelle</h3>'+stats.recent.map(entry=>'<div class="duel-row"><span><strong>'+outcomes[entry.outcome]+'</strong><small>'+new Date(entry.date).toLocaleDateString('de-AT')+' · '+esc(boardFor(entry.boardId).name)+'</small></span><span><b>'+number(entry.score)+' : '+(entry.opponentScore===null?'verdeckt':number(entry.opponentScore))+'</b><small>Joker '+entry.jokers+' : '+entry.opponentJokers+'</small></span></div>').join('')+'</section><details class="profile-help"><summary>Zur Wertung</summary><p>Direkter Vergleich: zuerst Punkte, dann Joker. Deine Werte stehen links. Serien zählen nur Siege gegen diesen Namen; Remis unterbricht. In Gruppen zählt jedes Duell einzeln. Gleiche Namen werden zusammengefasst, Computer separat. Ältere Partien ohne eindeutige eigene Rolle fehlen hier.</p></details>','opponent-profile');
 dialog.scrollTop=0;
}

function resultHistory(category){
 const mode=PROFILE_MODES.find(item=>item.id===category),entries=mode?history.filter(game=>statsCategory(game.mode)===category):history;
 openModal(mode?'Ergebnisse · '+mode.label:'Deine Ergebnisse.',(mode?'<button class="text-btn history-back" data-action="profile-mode" data-category="'+category+'">← Zur Statistik</button>':'')+(entries.length?entries.map(h=>`<div class="history-card"><div><strong>${h.forfeit?'Ausgestiegen · '+esc(h.players[h.ownPid]?.name||''):h.mode==='solo'?'Solo':h.mode==='computer'?'Gegen den Computer':h.mode==='local'?'An einem Handy':h.mode==='direct'?'Direkt – mehrere Handys':'Im Spielraum'}</strong><p>${new Date(h.date).toLocaleDateString('de-AT')} · ${h.rounds} Würfe · ${boardFor(h.boardId).name}</p></div><b>${h.score}</b></div>`).join(''):'<p>Noch keine abgeschlossene Partie.</p>'));
 dialog.scrollTop=0;
}
function recordResult(g,requestedPid=null){
 const pid=requestedPid??(g.mode==='direct'?direct.pid:g.mode==='room'?g.players.findIndex(p=>p.id===room?.playerId):g.mode==='local'&&g.players[0].left?g.players.findIndex(p=>!p.left):0);if(pid<0||!g.players[pid])return;
 const forfeit=!!g.players[pid].left;if(g.status!=='finished'&&!forfeit)return;
 const base=g.gameId||room?.code+'-'+g.log[0]?.round+'-'+g.turn,id=forfeit&&g.mode==='local'?base+':left:'+pid:base;if(history.some(h=>h.id===id))return;
 const players=g.players.map((p,i)=>forfeit&&g.hiddenScores&&g.status!=='finished'&&i!==pid?{name:p.name,hidden:true,...(p.left?{left:true}:{})}:{name:p.name,total:score(p,g).total,jokers:p.jokers,...(p.left?{left:true}:{})});
 history.unshift({id,date:new Date().toISOString(),mode:g.mode,players,score:forfeit?FORFEIT_SCORE:score(g.players[pid],g).total,ownPid:pid,rounds:g.round,boardId:boardFor(g).id,...(forfeit?{forfeit:true}:{})});statistics=mergeStats(statistics,[history[0]]);persist(STATSKEY,statistics);history=history.slice(0,100);persist(HISTORYKEY,history);
}
function recordRoomSummaryResult(result){
 if(!result||typeof result.id!=='string'||history.some(item=>item.id===result.id)||result.mode!=='room'||!Array.isArray(result.players)||!Number.isInteger(result.ownPid)||!result.players[result.ownPid])return;
 history.unshift(result);statistics=mergeStats(statistics,[result]);persist(STATSKEY,statistics);history=history.slice(0,100);persist(HISTORYKEY,history);
}
async function roomRequest(url,options){
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
 try{const res=await fetch(url,{...options,signal:controller.signal});let data;try{data=await res.json();}catch{throw Error('Farbfeld ist gerade nicht erreichbar. Bitte prüfe deine Internetverbindung.');}return {res,data};}
 catch(error){if(controller.signal.aborted)throw Error('Der Spielraum antwortet zu langsam. Bitte versuche es erneut.');throw error;}
 finally{clearTimeout(timeout);}
}
async function api(action,extra={},session=room){
 const {res,data}=await roomRequest('/api/rooms',{method:'POST',headers:{'Content-Type':'application/json',...(session?.token?{'X-Player-Token':session.token}:{})},body:JSON.stringify({action,code:session?.code,version:session?.code===room?.code?roomState?.version:undefined,features:CLIENT_FEATURES,...extra})});
 if(!res.ok)throw Object.assign(Error(data.error||'Verbindung fehlgeschlagen.'),{status:res.status});return data;
}
async function roomAction(action,extra={}){
  if(busy)return false;busy=true;render();let success=false;
  try{const next=await api(action,extra);networkError='';roomConnection.acknowledge(room.code);roomPollFailures=0;roomState=next;noteRoomProgress(next.game);rememberRoomName(next);reactionOverlay.receiveRoom([],room.code+':'+(next.game?.gameId||'')+':'+room.playerId);if(!['rename','mine'].includes(action)){resetSelection();inspectPid=null;}if(roomState.game)recordResult(roomState.game);success=true;}
  catch(error){toast(error.message);}
  finally{busy=false;if(!success)await pollRoom();render(action!=='rename');}
  return success;
}
async function pollRoom(){
 if(screen==='home')return pollSavedRooms();
 if(!room||roomAccessDenied||polling||busy||document.hidden||navigator.onLine===false||!['room','home'].includes(screen))return;
 roomPoller.stop();
 const session=room,epoch=roomEpoch;polling=true;let announced=false;
 const current=()=>epoch===roomEpoch&&room?.code===session.code&&room?.token===session.token;
 try{
  let data;
  if(roomAnnounced!==session.token){data=await api('open',{},session);if(!current())return;roomAnnounced=session.token;announced=true;}
  else{const response=await roomRequest('/api/rooms?code='+encodeURIComponent(session.code),{headers:{'X-Player-Token':session.token,'X-Farbfeld-Features':CLIENT_FEATURES.join(',')},cache:'no-store'});if(!current())return;if(!response.res.ok)throw Object.assign(Error(response.data.error||'Spielraum nicht erreichbar.'),{status:response.res.status});data=response.data;}
  roomConnection.receive(session.code,data.presence);roomPollFailures=0;noteRoomProgress(data.game);rememberRoomSnapshot(data,session);
  if(['home','room'].includes(screen))reactionOverlay.receiveRoom(data.reactions||[],session.code+':'+(data.game?.gameId||'')+':'+session.playerId);
  const changed=announced||data.version!==roomState?.version,hadError=!!networkError;
  networkError='';
  if(changed){
   const newTurn=roomState?.game?.round!==data.game?.round||roomState?.game?.gameId!==data.game?.gameId;
   roomState=data;
   if(newTurn){resetSelection();inspectPid=null;}
   if(data.game)recordResult(data.game);
   render(newTurn);
  }else{
   roomState.canSkip=data.canSkip;roomState.skipAvailableAt=data.skipAvailableAt;
   if(hadError)render();else refreshRoomIndicators();
  }
  if(dialog.open&&dialog.dataset.panel==='skip'&&!data.canSkip)closeModal();
 }catch(error){
  if(!current())return;roomConnection.fail(session.code);roomPollFailures++;
  if(error.status===403||error.status===404){roomAccessDenied=true;roomState=null;roomBook.update(session.code,session.token,{access:error.status===404?'missing':'denied'});networkError=error.status===404?'Dieser Raum wurde nicht gefunden. Bitte prüfe den Raumcode.':'Dein Zugang zu diesem Raum ist nicht mehr gültig. Du kannst mit dem Raumcode erneut beitreten.';render();return;}
  const text=navigator.onLine?'Verbindung wird wiederhergestellt. Bestätigte Züge bleiben gespeichert.':'Du bist offline. Für den Spielraum brauchst du Internet.';
  if(networkError!==text){networkError=text;render();}else refreshRoomIndicators();
 }finally{polling=false;roomPoller.refresh();}
}

async function submitMove(pass=false){const g=currentGame();if(!g)return;const pid=myPid(g);if(busy||!writable(g,pid))return;const move=pass?{pass:true}:{...choice,cells:selection};if(screen==='direct'){directAction('move',{move});return;}if(screen==='room'){await roomAction('move',{move});return;}try{const next=applyMove(g,pid,move);local=next;resetSelection();inspectPid=null;recordResult(local);if(local.status==='playing'){viewPid=local.mode==='computer'?HUMAN:nextLocalPlayer(local);handover=local.mode==='local';}saveLocal();vibrate();render(true);}catch(e){toast(e.message);}}
function appRecovery(){openModal('Zur aktuellen App wechseln.',`<p>Die alte Adresse mit „rubybread8193“ leitet jetzt zu „endruuu“ weiter. Android kann eine dort installierte alte PWA nicht über diese Weiterleitung aktualisieren.</p><div class="rule"><span class="rule-number">1</span><div><h3>Alte App sichern.</h3><p>Die alte App ohne Internet öffnen. Unter Einstellungen → Lokale Spielstände exportieren die Sicherung herunterladen. Sie enthält Solo, Computer, Ein-Handy-Partien, Ergebnisliste und Design.</p></div></div><div class="rule"><span class="rule-number">2</span><div><h3>Aktuelle Adresse in Chrome öffnen.</h3><p>Mit Internet die aktuelle Adresse öffnen und „Offline bereit“ abwarten. Dann im Chrome-Menü ⋮ „App installieren“ wählen.</p></div></div><div class="rule"><span class="rule-number">3</span><div><h3>Sicherung übernehmen.</h3><p>In der neuen App unten „Spielstände importieren“ wählen. Die alte Installation erst nach erfolgreicher Übernahme entfernen.</p></div></div><a class="primary recovery-link" href="https://farbfeld-andrew.endruuu.chatgpt.site/play" target="_blank" rel="noopener">Aktuelle Adresse öffnen ↗</a><button class="outline-btn" data-action="import">Spielstände importieren</button><input type="file" id="import-file" accept=".json,application/json" hidden><div class="info-box">Alte Direktpartien und Raumzugänge sind nicht im lokalen Export enthalten. Sie lassen sich über diese Datei nicht auf eine andere Webadresse übertragen. Die alte App behält ihre gespeicherten Daten; ein automatischer Zugriff von der neuen Adresse ist nicht möglich.</div>`,'recovery');}
function installationModal(){
  const info=pwaInfo,status=info.status==='ready'?'Offline bereit ✓':info.status==='checking'?'Offline wird vorbereitet …':info.status==='update'?'Neue Version verfügbar':'Offline noch nicht bereit';
  openModal('Farbfeld als App.',`<div class="install-status ${info.status==='ready'?'ready':'pending'}"><strong>${status}</strong><p>${esc(info.message)}</p></div>
  ${info.status==='update'?'<button class="primary" data-action="reload-app">Aktualisieren</button>':''}
  ${info.status!=='ready'?'<button class="outline-btn" data-action="offline-check">Offline-Dateien erneut prüfen</button>':''}
  ${pwa?.state.prompt?`<button class="primary" data-action="install" ${offlineReady?'':'disabled'}>Jetzt als App installieren</button>`:`<div class="rule"><span class="rule-number">1</span><div><h3>In Chrome auf Android öffnen.</h3><p>Öffne den öffentlichen Farbfeld-Link in der normalen Chrome-Ansicht und lade die App einmal vollständig online.</p></div></div><div class="rule"><span class="rule-number">2</span><div><h3>App installieren.</h3><p>Wenn „Offline bereit“ erscheint, tippe hier auf „App installieren“ oder wähle im Chrome-Menü ⋮ „App installieren“. Eine Verknüpfung allein bestätigt die Installation nicht.</p></div></div>`}
  <div class="info-box">Solo, „Gegen den Computer“, „Ein Handy“ und „Offline – mehrere Handys“ funktionieren offline. Der Direktmodus braucht ein gemeinsames WLAN/Hotspot. Internet-Spielräume benötigen Internet. Deine laufende Partie bleibt beim Aktualisieren gespeichert.</div><p class="version-label">Farbfeld ${APP_VERSION}</p>`,'install');
}
async function install(){
  if(pwa?.state.installed){toast(offlineReady?'Farbfeld ist als App geöffnet und offline bereit.':'Farbfeld ist als App geöffnet. Bitte prüfe den Offline-Download.');if(!offlineReady)installationModal();return;}
  if(pwa?.state.prompt&&offlineReady){const outcome=await pwa.install();if(outcome==='accepted')toast('Farbfeld wird als App installiert.');return;}
  installationModal();
}
async function share(text,title='Farbfeld',url=null){const copied=url?text+'\n'+url:text;try{if(navigator.share)await navigator.share({title,text,...(url?{url}:{})});else await copy(copied);}catch(error){if(error.name!=='AbortError')await copy(copied);}}
async function copy(text){try{await navigator.clipboard.writeText(text);toast('In die Zwischenablage kopiert.');}catch{openModal('Zum Kopieren.',`<p>Markiere und kopiere den Text:</p><textarea readonly style="width:100%;min-height:120px;border:1px solid #d7dfcb;padding:12px;border-radius:10px">${esc(text)}</textarea>`);}}
function exportData(){
 const now=new Date(),date=[String(now.getFullYear()).padStart(4,'0'),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('');
 const data={format:'farbfeld-backup',version:1,exportedAt:now.toISOString(),game:local,prefs,history,statistics};
 const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');
 a.href=url;a.download=date+'_Farbfeld_Spielstand.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Dein Spielstand wird heruntergeladen.');
}
function validGame(g){return g===null||g&&validLeavingState(g)&&validMineState(g)&&validBonusState(g)&&validGameBoard(g)&&g.schema===1&&['solo','local','computer'].includes(g.mode)&&Array.isArray(g.players)&&(g.mode!=='computer'||g.players.length===2&&(g.computerDifficulty===undefined||validComputerDifficulty(g.computerDifficulty)))&&g.players.length>=1&&g.players.length<=6&&Number.isInteger(g.round)&&g.round>=1&&g.round<=100000&&['roll','choose','finished'].includes(g.phase)&&g.players.every(p=>typeof p.name==='string'&&p.name.length<=24&&p.marks?.length===105&&p.marks.every(x=>typeof x==='boolean')&&Number.isInteger(p.jokers)&&p.jokers>=0&&p.jokers<=8&&p.columns?.length===15&&p.columns.every(x=>x===null||Number.isInteger(x)&&x>=0&&x<=5)&&COLORS.every(c=>p.colors?.[c]===null||[3,5].includes(p.colors?.[c])))&&Array.isArray(g.columnClaims)&&g.columnClaims.length===15&&g.colorClaims&&Array.isArray(g.submitted)&&g.submitted.every(i=>Number.isInteger(i)&&i>=0&&i<g.players.length)&&Number.isInteger(g.active)&&g.active>=0&&g.active<g.players.length&&Array.isArray(g.log)&&(g.phase!=='choose'||g.dice&&Array.isArray(g.dice.colors)&&g.dice.colors.every(c=>[...COLORS,'*'].includes(c))&&Array.isArray(g.dice.numbers)&&g.dice.numbers.every(n=>[1,2,3,4,5,'?'].includes(n)));}
if(!validGame(local)){local=null;try{localStorage.removeItem(KEY);}catch{}toast('Ein beschädigter Spielstand konnte nicht geladen werden.');}

let directUi,directRevision='';
let diagnosticStorage;try{diagnosticStorage=localStorage;}catch{}
const directDiagnostics=new DirectDiagnostics({version:APP_VERSION,storage:diagnosticStorage});
document.addEventListener('visibilitychange',()=>directDiagnostics.lifecycle(document.hidden?'background':'foreground'));
window.addEventListener('pagehide',()=>directDiagnostics.lifecycle('pagehide'));
const direct=new DirectSession({diagnostics:directDiagnostics,saved:read(DIRECT_KEY,null),version:APP_VERSION,save:record=>{if(!persist(DIRECT_KEY,record))throw Error('Speichern fehlgeschlagen.');},onError:toast,onReaction:event=>reactionOverlay.receive(event),onChange:()=>{
  const revision=ownTurnKey(direct.snapshot?.game,direct.pid);
  if(revision!==directRevision){directRevision=revision;if(screen==='direct'){resetSelection();inspectPid=null;}}
  if(direct.snapshot?.game)recordResult(direct.snapshot.game);
  if(screen==='direct'||screen==='home')render();
  directUi?.sync();
}});
directUi=new DirectUi(direct,{modal:openModal,close:closeModal,toast,enter:()=>{if(screen!=='direct')resetSelection();screen='direct';inspectPid=null;handover=false;render(true);},name:()=>prefs.name||'',discard:requestDiscardDirect,offlineInfo:()=>({ready:offlineReady})});
dialog.addEventListener('close',()=>{directUi.stop();scheduleComputer();});
function directAction(action,extra={}){try{direct.act(action,extra);vibrate();render();}catch(error){toast(error.message);}}
document.addEventListener('input',event=>{if(event.target.id==='room-list-search'){savedRoomsView.query=event.target.value.slice(0,80);savedRoomsView.page=0;refreshRoomManagerResults();}});
document.addEventListener('click',event=>{if(!event.target.closest('[data-action="version-tap"]'))versionTaps.reset();},true);
document.addEventListener('click',async event=>{const btn=event.target.closest('[data-action]');if(!btn||btn.disabled)return;const action=btn.dataset.action,g=currentGame();if(action==='version-tap'){if(!prefs.reactionsUnlocked&&versionTaps.tap(performance.now())){prefs.reactionsUnlocked=true;persist(PREFKEY,prefs);toast('Emoji-Reaktionen freigeschaltet ☺');render();}return;}try{if(await directUi.handle(action,btn))return;switch(action){
case 'home':rememberRoomDraft();screen='home';inspectPid=null;handover=false;resetSelection();render();window.scrollTo(0,0);if(roomBook.entries().length)pollRoom();break;
case 'close-modal':closeModal();break;
case 'solo':setupSolo();break;
case 'start-solo':startSolo();break;
case 'replace-solo':startSolo(true);break;
case 'computer':setupComputer();break;
case 'computer-level':openComputerLevel();break;
case 'apply-computer-level':applyComputerLevel();break;
case 'start-computer':startComputer();break;
case 'replace-computer':startComputer(true);break;
case 'continue':if(!local)break;screen='game';viewPid=local.mode==='computer'?HUMAN:nextLocalPlayer(local);if(viewPid<0)viewPid=0;inspectPid=null;handover=local.mode==='local';resetSelection();render(true);window.scrollTo(0,0);break;
case 'together':together();break;
case 'local-setup':if(confirmNew('local'))setupLocal();break;
case 'replace-local':setupLocal();break;
case 'room-setup':roomSetup();break;
case 'manage-rooms':savedRoomsView.page=0;roomManager();if(screen==='home')await pollSavedRooms();refreshRoomManagerResults();break;
case 'rooms-filter':savedRoomsView.filter=['all','online','offline'].includes(btn.dataset.filter)?btn.dataset.filter:'all';savedRoomsView.page=0;refreshRoomManagerResults();break;
case 'rooms-page-prev':savedRoomsView.page--;refreshRoomManagerResults();break;
case 'rooms-page-next':savedRoomsView.page++;refreshRoomManagerResults();break;
case 'refresh-saved-rooms':await pollSavedRooms(true);refreshRoomManagerResults();break;
case 'open-saved-room':await openSavedRoom(btn.dataset.code);break;
case 'forget-saved-room':requestForgetRoom(btn.dataset.code);break;
case 'rules':rules();break;
case 'about':rules();break;
case 'settings':settings();break;
case 'notification-settings':notificationSettings();break;
case 'notification-enable':case 'notification-disable':case 'notification-sound':case 'notification-test':case 'notification-retry':case 'notification-check':case 'notification-push-test':await notificationAction(action);break;
case 'scores':scores();break;
case 'mine-help':openModal('Deine Mine.',mineHelpHtml(),'mine-help');break;
case 'mine-aim':openMineTarget();break;
case 'mine-target':selectMineTarget(Number(btn.dataset.i));break;
case 'mine-confirm':await confirmMine();break;
case 'move-help':{const value=currentMoveFeedback(g,myPid(g));if(value)openModal(value.title,'<p>'+esc(value.detail)+'</p>');}break;
case 'reaction-menu':reactionMenu();break;
case 'app-recovery':appRecovery();break;
case 'rename-room':renameRoom();break;
case 'rename-direct':renameDirectRoom();break;
case 'save-direct-name':saveDirectRoomName();break;
case 'remove-room-member':{const member=roomState?.members.find(m=>m.id===btn.dataset.memberId);if(!member||roomState.hostId!==room.playerId)break;openModal('Person aus dem Raum entfernen?','<p>'+esc(member.name)+' verliert den bisherigen Zugang zu diesem Raum. Mit dem Raumcode kann die Person später erneut beitreten.</p><button class="primary" data-action="confirm-remove-room-member" data-member-id="'+esc(member.id)+'">'+esc(member.name)+' entfernen</button><button class="outline-btn" data-action="close-modal">Abbrechen</button>');break;}
case 'confirm-remove-room-member':if(await roomAction('remove',{memberId:btn.dataset.memberId})){closeModal();toast('Person aus dem Raum entfernt.');}break;
case 'room-mines':await roomAction('options',{mines:!roomState.mines});break;
case 'room-bonus':await roomAction('options',{bonusFields:!roomState.bonusFields});break;
case 'room-hidden':await roomAction('options',{hiddenScores:!roomState.hiddenScores});break;
case 'share-game':await share('Lust auf eine Runde Farbfeld?','Farbfeld – das Würfelspiel',location.origin+'/play');break;
case 'abort-game':requestAbortGame();break;
case 'confirm-abort-game':await confirmAbortGame();break;
case 'confirm-discard-direct':confirmDiscardDirect();break;
case 'set-theme':{const theme=THEMES.find(item=>item.id===btn.dataset.theme);if(!theme)break;prefs.theme=theme.id;applyTheme();persist(PREFKEY,prefs);render();settings();dialog.querySelector('[data-theme="'+theme.id+'"]')?.focus({preventScroll:true});toast('Design: '+theme.name);break;}
case 'toggle-patterns':prefs.patterns=!prefs.patterns;persist(PREFKEY,prefs);settings();render();break;
case 'toggle-haptics':prefs.haptics=!prefs.haptics;persist(PREFKEY,prefs);settings();vibrate();break;
case 'install':await install();break;
case 'offline-check':await pwa.check(true);if(dialog.open&&dialog.dataset.panel==='install')installationModal();else if(dialog.open&&dialog.dataset.panel==='settings')settings();break;
case 'dismiss-update':dismissedUpdate=pwaInfo.availableVersion;render();break;
case 'reload-app':if(selection.length||screen==='direct'&&direct.snapshot?.game?.status==='playing'){openModal('App aktualisieren?',`<p>Deine noch nicht bestätigte Auswahl wird verworfen. Bereits bestätigte Züge bleiben gespeichert.</p>${screen==='direct'?'<p>Die Direktverbindung wird beim Neuladen getrennt. Danach jedes betroffene Handy wieder mit dem Gastgeber koppeln und die gespeicherte Partie fortsetzen.</p>':''}<button class="primary" data-action="confirm-reload">Aktualisieren</button><button class="outline-btn" data-action="close-modal">Zur Auswahl zurück</button>`);}else location.reload();break;
case 'confirm-reload':location.reload();break;
case 'roll':if(!g||busy||inspectPid!==null||g.mode==='computer'&&g.active!==HUMAN)break;if(screen==='direct')directAction('roll');else if(screen==='room')await roomAction('roll');else{local=rollGame(g);resetSelection();saveLocal();animateRoll=true;render();vibrate();}break;
case 'handover':handover=false;render(true);break;
case 'color-die':selectionNotice=null;choice.ci=Number(btn.dataset.i);choice.color=null;selection=[];vibrate();render();break;
case 'number-die':selectionNotice=null;choice.ni=Number(btn.dataset.i);choice.count=null;selection=[];vibrate();render();break;
case 'joker-color':selectionNotice=null;choice.color=btn.dataset.c;selection=[];render();break;
case 'joker-number':selectionNotice=null;choice.count=Number(btn.dataset.n);selection=[];render();break;
case 'cell':{
 if(!g||busy)break;const pid=displayedPid(g);if(!writable(g,pid))break;
 if(choice.ci===null||choice.ni===null){selectionMessage('Wähle zuerst deine Würfel.','Tippe eine Farbe und eine Zahl an. Danach wählst du die Felder.');break;}
 const c=resolveChoice(g,pid,choice);if(c.error){selectionMessage('Die Kombination ist noch nicht vollständig.',c.error);break;}
 const i=Number(btn.dataset.i);selectionNotice=null;
 if(selection.includes(i))selection=selection.filter(x=>x!==i);
 else{
  if(boardFor(g).cells[i]!==c.color){selectionMessage('Dieses Feld hat die falsche Farbe.','Gewählt ist '+LABELS[c.color]+'. Tippe auf freie Felder in dieser Farbe.');break;}
  if(selection.length>=c.count){selectionMessage('Du hast bereits '+c.count+' '+(c.count===1?'Feld':'Felder')+' gewählt.','Tippe ein gewähltes Feld an, um es zu entfernen und deine Auswahl zu ändern.');break;}
  selection.push(i);
 }
 vibrate();render();break;
}
case 'clear':resetSelection();render();break;
case 'confirm':await submitMove(false);break;
case 'pass':if(selection.length){openModal('Diesen Wurf passen?',`<p>Deine aktuelle Auswahl wird verworfen. Du verbrauchst keine Joker.</p><button class="primary" data-action="confirm-pass">Ja, passen</button><button class="outline-btn" data-action="close-modal">Zurück zu meiner Auswahl</button>`);}else await submitMove(true);break;
case 'confirm-pass':closeModal();await submitMove(true);break;
case 'hint':{selectionNotice=null;const pid=myPid(g);if(!writable(g,pid))break;const hint=findMove(g,pid);if(hint){choice={ci:hint.ci,ni:hint.ni,color:hint.color,count:hint.count};selection=hint.cells;render();const first=selection[0],bs=$('#board-scroll');if(bs){const cell=app.querySelector(`[data-action="cell"][data-i="${first}"]`);if(cell)bs.scrollLeft=cell.offsetLeft-bs.offsetLeft-bs.clientWidth/2+cell.clientWidth/2;}}else selectionMessage('Mit diesem Wurf ist kein Zug möglich.','Tippe auf „Passen“. Du verbrauchst dabei keine Joker.');break;}
case 'overview':case 'board-fit':boardView.fit();break;
case 'zoom-out':boardView.zoom(boardView.scale/1.2);break;
case 'zoom-in':boardView.zoom(boardView.scale*1.2);break;
case 'view-player':{const i=Number(btn.dataset.i);if(!mayInspect(g,i,myPid(g))){toast('Der Spielerwechsel erfolgt nach dem Zug automatisch.');break;}if(i===myPid(g))inspectPid=null;else inspectPid=i;resetSelection();render(true);break;}
case 'my-board':inspectPid=null;render(true);break;
case 'rematch':if(screen==='direct'){directAction('rematch');}else if(screen==='room'){if(roomState.hostId!==room.playerId){toast('Der Gastgeber startet die nächste Partie.');break;}await roomAction('rematch');}else if(g.mode==='solo')setupSolo();else if(g.mode==='computer')setupComputer();else setupLocal();window.scrollTo(0,0);break;
case 'share-result':{const ranks=rankings(g);share('Mein Farbfeld-Ergebnis: '+(g.mode==='solo'?score(g.players[0],g).total+' Punkte in 30 Würfen.':ranks.map(p=>p.name+': '+p.total+' Punkte').join(' · '))+' 🎲');break;}
case 'profile':profile();break;
case 'opponent-profile':opponentProfile(btn.dataset.opponent,btn.dataset.category);break;
case 'profile-mode':profile(btn.dataset.category);dialog.querySelector('.profile-filters [aria-pressed="true"]').focus({preventScroll:true});break;
case 'history':resultHistory(btn.dataset.category);break;
case 'export':exportData();break;
case 'import':$('#import-file')?.click();break;
case 'create-room':case 'join-room':{if(busy)break;const name=$('#room-name').value.trim(),code=$('#room-code').value.trim().toUpperCase();if(!name){toast('Bitte gib deinen Namen ein.');$('#room-name').focus();break;}if(action==='join-room'&&!/^[A-Z2-9]{8}$/.test(code)){toast('Bitte gib den 8-stelligen Raumcode ein.');break;}busy=true;btn.disabled=true;btn.textContent='Verbindet …';try{if(roomBook.entries().length>=MAX_SAVED_ROOMS&&(action==='create-room'||!roomBook.get(code)))throw Error('Auf diesem Gerät sind bereits 50 Räume gespeichert. Entferne zuerst einen alten Zugang.');const data=await api(action==='create-room'?'create':'join',{name,...(action==='join-room'?{code}:{roomName:$('#room-title-create').value})},action==='join-room'?roomBook.get(code):null);rememberRoomDraft();roomEpoch++;room={code:data.code,token:data.token,playerId:data.playerId,roomName:data.roomName||''};if(!roomBook.save(room,{activate:true,opened:true}))toast('Der Raumzugang konnte nicht dauerhaft gespeichert werden.');rememberRoomSnapshot(data);prefs.name=name;persist(PREFKEY,prefs);roomState=data;roomConnection.acknowledge(room.code);roomPollFailures=0;noteRoomProgress(data.game);roomAccessDenied=false;roomAnnounced=room.token;screen='room';networkError='';closeModal();resetSelection();render(true);window.scrollTo(0,0);}catch(e){toast(e.message);btn.disabled=false;btn.textContent=action==='create-room'?'Spielraum erstellen':'Beitreten';}finally{busy=false;if(screen==='room'){render();pollRoom();}}break;}
case 'refresh-room':btn.disabled=true;await pollRoom();if(btn.isConnected)btn.disabled=false;break;
case 'reconnect':if(room)await openSavedRoom(room.code);break;
case 'copy-code':await copy(room.code);break;
case 'share-room':await share(`Spiel mit mir Farbfeld!${roomState?.roomName?' '+roomState.roomName:room.roomName?' '+room.roomName:''}\nRaumcode: ${room.code}\n${location.origin}/play?room=${room.code}\nFarbfeld benötigt keinen Account. Für diesen Internet-Spielraum brauchst du Internet.`);break;
case 'start-room':await roomAction('start');break;
case 'forget-room':if(room)requestForgetRoom(room.code);break;
case 'confirm-forget-room':{const code=btn.dataset.code||room?.code;if(!code)break;const removed=roomBook.get(code);if(removed)roomDrafts.clear(code+':'+removed.playerId);for(const key of roomSnapshots.keys())if(key.startsWith(code+':'))roomSnapshots.delete(key);if(!roomBook.remove(code))toast('Der Zugang konnte auf diesem Gerät nicht dauerhaft entfernt werden.');if(room?.code===code){roomEpoch++;room=null;roomState=null;roomConnection.clear();roomAccessDenied=false;networkError='';resetSelection();}screen='home';closeModal();render();pollRoom();break;}
case 'host-skip':{if(screen!=='room'||roomState?.hostId!==room?.playerId||!roomState?.canSkip)break;const missing=g.players.map((p,i)=>({p,i})).filter(({i})=>!g.submitted.includes(i)&&(i===g.active||g.submitted.includes(g.active)));openModal('Eine Person überspringen.',`<p>Seit mindestens 24 Stunden gab es keine Spielaktion. Als Raumersteller kannst du einen fehlenden Zug als „Passen“ werten. Danach beginnt die Wartezeit erneut.</p>${missing.map(({p,i})=>`<button class="outline-btn" data-action="skip-person" data-i="${i}">${esc(p.name)} passt diesen Wurf</button>`).join('')}`,'skip');break;}
case 'skip-person':if(roomState?.hostId!==room?.playerId||!roomState?.canSkip)break;closeModal();await roomAction('skip',{pid:Number(btn.dataset.i)});break;
}}catch(e){toast(e.message||'Das hat nicht geklappt. Bitte versuche es erneut.');}});
document.addEventListener('change',async e=>{if(['mine-column','mine-row'].includes(e.target.id)){const col=$('#mine-column')?.value,row=$('#mine-row')?.value;if(col!==''&&row!=='')selectMineTarget(Number(row)*15+Number(col));return;}if(e.target.id==='computer-difficulty'){const level=COMPUTER_LEVELS.find(item=>item.id===e.target.value);if(level&&$('#computer-difficulty-help'))$('#computer-difficulty-help').textContent=level.description;return;}if(e.target.matches('[data-board-choice]')){const description=e.target.closest('.board-picker')?.querySelector('.board-choice-description');if(description)description.textContent=BOARDS.find(b=>b.id===e.target.value)?.description||'';const context=e.target.dataset.boardChoice;if(context==='room')await roomAction('options',{boardId:e.target.value});else if(context==='direct')directAction('options',{boardId:e.target.value});return;}if(e.target.id==='player-count'){const previous=Array.from($('#name-fields').querySelectorAll('input')).map(el=>el.value);$('#name-fields').innerHTML=localNames(Number(e.target.value));$('#name-fields').querySelectorAll('input').forEach((el,i)=>{if(previous[i])el.value=previous[i];});}if(e.target.id==='import-file'){const file=e.target.files?.[0];if(!file)return;try{if(file.size>10e6)throw Error('Die Datei ist zu groß.');const data=JSON.parse(await file.text());if(data.format!=='farbfeld-backup'||data.version!==1||!validGame(data.game)||!Array.isArray(data.history)||data.statistics!==undefined&&!validStats(data.statistics))throw Error('Das ist kein gültiger Farbfeld-Spielstand.');const imported=JSON.stringify(data);openModal('Spielstand wiederherstellen?',`<p>Die lokale Partie und Ergebnisliste werden durch den gewählten Export ersetzt. Statistiken werden ohne doppelte Partien zusammengeführt.</p><button class="primary" data-action="confirm-import">Wiederherstellen</button><button class="outline-btn" data-action="close-modal">Abbrechen</button>`);dialog.querySelector('[data-action="confirm-import"]').addEventListener('click',()=>{const d=JSON.parse(imported);local=d.game;history=d.history.filter(h=>Number.isFinite(h.score)&&typeof h.date==='string'&&Array.isArray(h.players)&&Number.isInteger(h.rounds)).slice(0,100);statistics=mergeStats(mergeStats(statistics,d.statistics?.games||[]),history);persist(STATSKEY,statistics);if(typeof d.prefs?.name==='string')prefs.name=d.prefs.name.slice(0,24);prefs.patterns=!!d.prefs?.patterns;prefs.haptics=d.prefs?.haptics!==false;prefs.theme=THEMES.some(theme=>theme.id===d.prefs?.theme)?d.prefs.theme:'classic';if(validComputerDifficulty(d.prefs?.computerDifficulty))prefs.computerDifficulty=d.prefs.computerDifficulty;applyTheme();saveLocal();persist(HISTORYKEY,history);persist(PREFKEY,prefs);screen='home';closeModal();render();toast('Dein Spielstand ist wiederhergestellt.');},{once:true});}catch(err){toast(err.message||'Die Datei konnte nicht gelesen werden.');}}});
document.addEventListener('submit',async event=>{const form=event.target;if(form.dataset.form==='room-title'){event.preventDefault();if(busy)return;const submit=form.querySelector('[type=submit]');submit.disabled=true;const saved=await roomAction('rename',{roomName:form.querySelector('#room-title').value});if(saved){closeModal();toast('Raumname gespeichert.');}else submit.disabled=false;return;}if(form.dataset.form==='local'){event.preventDefault();const names=Array.from(form.querySelectorAll('#name-fields input')).map(el=>el.value.trim()).filter(Boolean);if(names.length<2)return;const boardId=readBoardChoice();rememberBoard(boardId);local=createGame(names,'local',[],{hiddenScores:!!$('#hidden-scores')?.checked,boardId,bonusFields:$('#bonus-fields')?.checked===true,mines:$('#mine-enabled')?.checked===true});local.gameId=newId();viewPid=0;inspectPid=null;handover=true;screen='game';resetSelection();saveLocal();closeModal();render(true);window.scrollTo(0,0);}});
window.addEventListener('online',()=>{if(['room','home'].includes(screen)&&room)pollRoom();});window.addEventListener('offline',()=>{if(['room','home'].includes(screen)&&room){roomConnection.fail(room.code);roomPoller.stop();networkError='Du bist offline. Für den Spielraum brauchst du Internet.';render();}else if(screen==='direct')toast(direct.ready?'Internet getrennt. Eure Direktpartie läuft im WLAN/Hotspot weiter.':'Kein Internet. Die QR-Kopplung bleibt im gemeinsamen WLAN/Hotspot möglich.');else toast('Du bist offline. Deine lokale Partie läuft weiter.');});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&screen==='room')roomAnnounced='';syncNotificationContext();notifications.visibility();roomPoller.refresh();if(!document.hidden&&['room','home'].includes(screen)&&roomBook.entries().length){refreshRoomIndicators();pollRoom();}scheduleComputer();});
window.addEventListener('pagehide',()=>{roomPoller.stop();if(notifications.state.enabled&&notifications.state.pushReady)notifications.request('presence',{visible:false},true).catch(()=>{});});
window.addEventListener('online',()=>notifications.retry().catch(()=>{}));
setInterval(()=>{if(!document.hidden)notifications.sync().catch(()=>{});},20000);

render();
pwa=createPwa(info=>{
  const updateChanged=(pwaInfo.status==='update')!==(info.status==='update')||pwaInfo.availableVersion!==info.availableVersion;
  pwaInfo=info;offlineReady=info.offlineReady===true||info.status==='ready';
  if(offlineReady)notifications.init();
  if(dialog.open&&dialog.dataset.panel==='install')installationModal();
  else if(dialog.open&&dialog.dataset.panel==='settings')settings();
  if(screen==='home'||updateChanged)render();
  else{const footer=$('.game-footer .status-dot');if(footer&&screen!=='room'&&screen!=='direct')footer.innerHTML=`<i class="dot"></i>Automatisch gespeichert · ${offlineReady?'Offline bereit':info.status==='checking'?'Offline wird vorbereitet':'Offline-Status in Einstellungen'} · v${APP_VERSION}`;}
},()=>toast('Farbfeld ist als App installiert. Viel Spaß!'));
pwa.check();
const invite=new URL(location.href).searchParams.get('room');if(invite){if(roomBook.get(invite.toUpperCase()))openSavedRoom(invite.toUpperCase());else roomSetup();}

if(new URL(location.href).searchParams.get('umzug')==='1')appRecovery();

if(new URL(location.href).searchParams.has('direct')&&direct.saved){screen='direct';render();}

if(roomBook.entries().length&&screen==='home')pollRoom();

window.addEventListener('storage',event=>{if(event.key==='farbfeld.rooms.v1'&&screen==='home'){refreshSavedRooms();notifications.setRooms(roomBook.entries());roomPoller.refresh();}});
