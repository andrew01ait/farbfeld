// Device-local presentation only; never part of a shared game's rules or identity.
export const THEMES=Object.freeze([
 Object.freeze({id:'classic',name:'Standard',symbol:'✳',detail:'Das vertraute Farbfeld',headline:''}),
 Object.freeze({id:'halloween',name:'Halloween',symbol:'🎃',detail:'Kürbisorange und sanftes Violett',headline:'Zeit für <em>gespenstisch gute Würfe.</em>'}),
 Object.freeze({id:'christmas',name:'Weihnachten',symbol:'🎄',detail:'Tannengrün und festliches Rot',headline:'Mach es dir gemütlich. <em>Noch eine Runde?</em>'}),
 Object.freeze({id:'ducks',name:'Quietschenten',symbol:'duck',detail:'Gelbe Enten im hellblauen Bad',headline:'Quietschvergnügt <em>zum nächsten Wurf.</em>'}),
 Object.freeze({id:'dogs',name:'Hunde',symbol:'paw',detail:'Eine Pfote in warmen Naturtönen',headline:'Auf die Pfoten. <em>Fertig. Würfeln!</em>'}),
 Object.freeze({id:'birthday',name:'Geburtstag',symbol:'🎈',detail:'Bunte Ballons und festliches Rosa',headline:'Heute feiern wir <em>jeden guten Wurf.</em>'}),
]);
export const themeFor=id=>THEMES.find(theme=>theme.id===id)||THEMES[0];
export function themeSymbol(theme){const asset=theme.id==='ducks'?'ducky':theme.id==='dogs'?'paw':null;return asset?'<img src="/game/'+asset+'.svg" alt="" width="48" height="48">':theme.symbol;}
export const themeMark=id=>themeFor(id).id==='classic'?'×':themeSymbol(themeFor(id));
export const themeHeadline=id=>themeFor(id).headline||'Ein Wurf.<br>Viele <em>Möglichkeiten.</em>';
