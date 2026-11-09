import test from 'node:test';
import assert from 'node:assert/strict';
import {mergeStats,summarizeStats,summarizeOpponent,statsCategory,validStats} from '../public/game/stats.js';
const player=(name,total,jokers=4)=>({name,total,jokers});
const game=(id,players,ownPid=0,mode='room')=>({id:String(id),date:new Date(1700000000000+Number(id)*1000).toISOString(),mode,players,ownPid,score:players[ownPid].total});
test('Profil: Siege, geteilte Siege und Joker-Tiebreak stimmen auch in Gruppen und auf dem Gästehandy',()=>{
 const stats=mergeStats(null,[game(1,[player('Robin',12),player('Bea',14)],1),game(2,[player('Robin',17,3),player('Bea',17,4)],1),game(3,[player('Robin',18),player('Bea',18)],1),game(4,[player('Robin',30),player('Bea',20),player('Alex',10)],1)]);
 const value=summarizeStats(stats);assert.equal(value.wins,3);assert.equal(value.sharedWins,1);assert.equal(value.losses,1);assert.equal(value.played,4);
 assert.deepEqual(value.opponents.find(p=>p.name==='Robin'),{name:'Robin',computer:false,played:4,wins:2,draws:1,losses:1});
 assert.equal(value.opponents.find(p=>p.name==='Alex').wins,1);
});
test('Menschen, Computer und Solo haben getrennte Partien, Siege, Bestwerte, Mittelwerte und Serien',()=>{
 const records=[game(1,[player('Du',8),player('Bea',10)]),game(2,[player('Du',10),player('Bea',8)]),game(3,[player('Du',50)],0,'solo'),game(4,[player('Du',12),player('Computer',12)],0,'computer'),game(5,[player('Du',14),player('Bea',10)]),game(6,[player('Du',8),player('Computer',10)],0,'computer'),game(7,[player('Du',15),player('Bea',10)]),game(8,[player('Du',-5)],0,'solo')];
 const stats=mergeStats(null,records.reverse()),people=summarizeStats(stats),computer=summarizeStats(stats,'computer'),solo=summarizeStats(stats,'solo');
 assert.equal(people.played,4);assert.equal(people.wins,3);assert.equal(people.losses,1);assert.equal(people.longestStreak,3);assert.equal(people.currentStreak,3);assert.equal(people.best,15);assert.equal(people.average,11.8);assert.deepEqual(people.opponents.map(p=>p.name),['Bea']);
 assert.equal(computer.played,2);assert.equal(computer.wins,1);assert.equal(computer.sharedWins,1);assert.equal(computer.losses,1);assert.equal(computer.currentStreak,0);assert.equal(computer.longestStreak,1);assert.equal(computer.best,12);assert.equal(computer.average,10);
 assert.equal(solo.played,2);assert.equal(solo.best,50);assert.equal(solo.average,22.5);assert.equal(solo.wins,0);assert.equal(solo.currentStreak,0);assert.deepEqual(solo.opponents,[]);
 assert.equal(people.played+computer.played+solo.played,records.length);
});
test('Alte Ergebnisse werden übernommen, uneindeutige Gästezuordnung wird nicht geraten',()=>{
 const old=game(1,[player('Robin',10),player('Bea',20)],1);delete old.ownPid;
 const ambiguous=game(2,[player('Robin',20,4),player('Bea',20,3)],1);delete ambiguous.ownPid;
 const stats=mergeStats(null,[old,ambiguous]);assert.equal(stats.games[0].ownPid,1);assert.equal(stats.games[1].ownPid,null);
 const value=summarizeStats(stats);assert.equal(value.played,2);assert.equal(value.wins,1);assert.equal(value.unknown,1);assert.equal(value.currentStreak,0);assert.equal(value.opponents[0].played,1);
});
test('Statistik bleibt über 100 Ergebnisse hinaus erhalten; Import und wiederholte Erfassung zählen nicht doppelt',()=>{
 const records=Array.from({length:120},(_,i)=>game(i+1,[player('Du',20),player('Bea',10)]));
 let stats=mergeStats(null,records);stats=mergeStats(JSON.parse(JSON.stringify(stats)),records.slice(-20));
 assert.equal(stats.games.length,120);assert.equal(summarizeStats(stats).wins,120);assert.equal(summarizeStats(stats).longestStreak,120);assert.equal(validStats(stats),true);
});
test('Gegnernamen werden normalisiert, Computer bleiben von gleichnamigen Menschen getrennt',()=>{
 const stats=mergeStats(null,[game(1,[player('Du',20),player('Bea',10)]),game(2,[player('Du',10),player(' bea ',20)]),game(3,[player('Du',20),player('Computer',10)],0,'computer'),game(4,[player('Du',10),player('Computer',20)])]);
 const rows=summarizeStats(stats).opponents;assert.equal(rows.length,2);assert.equal(rows.find(p=>p.name==='Bea').played,2);assert.equal(rows.filter(p=>p.name==='Computer').length,1);assert.equal(rows.find(p=>p.name==='Computer').computer,false);assert.equal(summarizeStats(stats,'computer').opponents[0].computer,true);
});
test('Statistik enthält nur Ergebnisdaten, keine Spielblätter oder Verbindungszugänge',()=>{
 const input={...game(1,[{...player('Du',20),marks:[true],token:'secret'},player('Bea',10)]),roomToken:'secret',subscription:{endpoint:'private'}};
 const stats=mergeStats(null,[input]);assert.equal(JSON.stringify(stats).includes('secret'),false);assert.equal(JSON.stringify(stats).includes('marks'),false);assert.equal(JSON.stringify(stats).includes('endpoint'),false);
 assert.equal(validStats({schema:1,games:[{...input,score:Infinity}]}),false);assert.equal(validStats({schema:2,games:[]}),false);assert.equal(mergeStats(null,[null,{}]).games.length,0);
});

test('Alle echten Mehrspielermodi gehören nur zu Mit anderen; leere Bereiche bleiben leer',()=>{
 assert.deepEqual(['local','room','direct','computer','solo','unknown'].map(statsCategory),['people','people','people','computer','solo',null]);
 const stats=mergeStats(null,['local','room','direct'].map((mode,i)=>game(i+1,[player('Du',-4),player('Bea',-10)],0,mode)));
 assert.equal(summarizeStats(stats).played,3);assert.equal(summarizeStats(stats).best,-4);
 for(const category of ['computer','solo']){const value=summarizeStats(stats,category);assert.equal(value.played,0);assert.equal(value.best,null);assert.equal(value.average,null);}
 assert.equal(summarizeStats(null).played,0);assert.throws(()=>summarizeStats(stats,'all'),RangeError);
});
test('Gegnerdetail vergleicht eine bestimmte Person unabhängig vom Gruppensieg und von anderen Gegnern',()=>{
 const stats=mergeStats(null,[game(1,[player('Robin',20),player('Bea',15),player('Alex',30)]),game(2,[player('Robin',20,3),player('Bea',20,4)]),game(3,[player('Robin',18),player('Bea',18)]),game(4,[player('Robin',9),player('Alex',15)]),game(5,[player('Robin',17),player(' bea ',10)]),game(6,[player('Robin',30),player('Bea',40)],0,'computer')]);
 const value=summarizeOpponent(stats,'BEA');assert.equal(value.played,4);assert.equal(value.wins,2);assert.equal(value.draws,1);assert.equal(value.losses,1);assert.equal(value.winRate,50);assert.equal(value.currentStreak,1);assert.equal(value.longestStreak,1);assert.equal(value.best,20);assert.equal(value.average,18.8);
 assert.deepEqual(value.recent.map(entry=>entry.outcome),['win','draw','loss','win']);assert.equal(value.recent[2].jokers,3);assert.equal(value.recent[2].opponentJokers,4);
 const row=summarizeStats(stats).opponents.find(p=>p.name==='Bea');for(const key of ['played','wins','draws','losses'])assert.equal(value[key],row[key]);
 assert.equal(summarizeOpponent(stats,'Bea','computer').played,1);assert.equal(summarizeOpponent(stats,'Alex').played,2);
});
test('Gegnerdetail behält Gesamtbilanz über fünf Duelle hinaus und ordnet Gastrolle und Daten chronologisch zu',()=>{
 const records=Array.from({length:7},(_,i)=>game(i+1,[player('Bea',10),player('Robin',20+i)],1));
 const ambiguous=game(8,[player('Bea',20),player('Robin',20)]);delete ambiguous.ownPid;
 const stats=mergeStats(null,[ambiguous,...records.reverse()]),value=summarizeOpponent(stats,'bea');
 assert.equal(value.played,7);assert.equal(value.wins,7);assert.equal(value.currentStreak,7);assert.equal(value.longestStreak,7);assert.equal(value.recent.length,5);assert.equal(value.recent[0].score,26);assert.equal(value.recent[4].score,22);assert.equal(value.average,23);
 const empty=summarizeOpponent(stats,'Unbekannt');assert.equal(empty.played,0);assert.equal(empty.winRate,null);assert.equal(empty.best,null);assert.deepEqual(empty.recent,[]);
});
test('Computer namens Bea bleibt von Bea und gleichen Namen in Gruppen getrennt',()=>{
 const stats=mergeStats(null,[game(1,[player('Du',20),player('Bea',10),player('BEA',30)]),game(2,[player('Du',40),player('Bea',10)],0,'computer')]);
 const value=summarizeOpponent(stats,'Bea');assert.equal(value.played,2);assert.equal(value.wins,1);assert.equal(value.losses,1);assert.equal(value.winRate,50);
 assert.equal(summarizeOpponent(stats,'Bea','computer').wins,1);assert.equal(summarizeOpponent(stats,'Bea','solo').played,0);
});
