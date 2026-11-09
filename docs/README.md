# Farbfeld documentation

<!-- farbfeld-version: 1.17.0 -->

## Neu 1.17.0: Bonusfelder, Random und gemeinsame Minen

Drei geheime **Bonusfelder** vergeben je +2 an alle ersten Finder desselben Wurfs; Bekanntgabe erst nach der gemeinsamen Wertung, Punkte bleiben trotz Minen erhalten. **Random** erzeugt bei jedem neuen Start ein gemeinsames, gespeichert fortsetzbares Brett. Die optionale **Mine** trifft ein gewähltes Zielfeld bei allen aktiven Gegnern, einmal pro Person für insgesamt fünf Punkte. Die Explosion dauert drei Sekunden; Schadensmarkierungen bleiben bis Ende des nächsten Wurfs. Leere Ziele verursachen beim jeweiligen Gegner keinerlei Schaden.

**Partie verlassen** gibt sofort einen einmaligen Verlaufseintrag mit −10 Punkten und Niederlage. Die anderen spielen weiter; die letzte aktive Person gewinnt sofort. Im Internet wandert die Gastgeberrolle weiter. Offline bleibt das ursprüngliche Gastgeber-Handy als Zuschauer und Verbindung geöffnet; Verbindungsverlust pausiert sicher, ohne neue Autorität zu erfinden. Alle beteiligten Apps für neue Regeln auf 1.17.0 aktualisieren. [Bonusfelder](bonus-fields.md) · [Minen](mines.md) · [Random](random-board.md) · [Aussteigen](leaving.md).



## Neu 1.16.0: Offline-Testprotokoll und optionale Computer-Minen

Ein freiwilliges lokales A/B-Testprotokoll hilft bei Offline-Kopplung und Spielabgleich; es ist aus Einstellungen und Kopplungsdialogen exportierbar. [Testanleitung und Datenschema](offline-diagnostics.md). Die neue Startoption **Minenangriff testen** wurde in 1.16.0 zunächst gegen den Computer erprobt; ab 1.17.0 gilt sie für alle Mehrspielerarten: gegnerischer Farbabschluss schaltet einen einmaligen Angriff für fünf Punkte frei. Ein leeres Zielfeld ist ein vollständiger Fehlschlag ohne Nachbarschaden. [Regeln, verdeckte Zielwahl und Wertung](mines.md).


Client 1.17.0. The application interface and most feature guides are in German; repository setup instructions are in English.

| Topic | Guide |
|---|---|
| Bonusfelder, Gleichstand und dauerhafte Punkte | [Bonusfelder](bonus-fields.md) |
| Random und gemeinsame gespeicherte Pläne | [Random](random-board.md) |
| Ausstieg, Gastgeber, letzte Person und Verlauf | [Verlassen](leaving.md) |
| Contributor instructions | [Contributing](../CONTRIBUTING.md) |
| Hosted source and GitHub workflow | [Source workflow](source-workflow.md) |
| Setup and deployment | [Deployment](../deployment.md) |
| Architecture | [Architecture](architecture.md) |
| Game and transport flows | [Flows](flows.md) |
| Internet rooms | [Internet rooms](internet-rooms.md) |
| Offline direct multiplayer | [Offline multiplayer](offline-multiplayer.md) |
| Computer opponents | [Computer](computer.md) |
| Notifications | [Notifications](notifications.md) |
| Room presence and retention | [Room status](room-status.md) |
| Statistics | [Statistics](statistics.md) |
| Reactions | [Reactions](reactions.md) |
| Version compatibility | [Versions](versions.md) |
| Responsive checks | [Responsive QA](responsive-qa.md) |
| Public source snapshot | [Publication](publication.md) |

The repository includes automated rules, API, concurrency, storage, compatibility and PWA/Push regression tests. A passing mock/local transport test does not certify real Android presentation, battery behavior or Hotspot/WebRTC interoperability. Historical private screenshots and operational delivery logs are excluded.
