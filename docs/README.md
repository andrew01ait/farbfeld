# Farbfeld documentation

<!-- farbfeld-version: 1.19.1 -->

## Oberfläche in Client 1.19.1

Raumkarten sind auf Startseite und in Alle Räume schlanker: neutrale Spielfläche, gemeinsame Metazeile und kleine Aktionen. Teilnehmer-/Gastgeberanzeige und Such-/Filter-/Prioritätsmodell bleiben erhalten. 44 relevante Regressionen, TypeScript und 124 gerenderte Ansichten geprüft; physische Handyabnahme separat. Nachweise im [QA-Protokoll](responsive-qa.md), Gestaltung in [UI-Design](ui-design.md).


## Übersicht 1.19.0

Startvorschau mit drei Partien, Online-/Offline-Kennzeichnung, Teilnehmernamen und Gastgeber, vollständige lokale Suche/Filter/Seiten in Alle Räume. 418 Regressionen, API-Integrationen, TypeScript und 80 gerenderte Ansichten; physische Abnahme separat. Siehe [Raumstatus](room-status.md), [Abläufe](flows.md), [Gestaltung](ui-design.md) und [QA](responsive-qa.md).


## Direktnamen 1.18.0

Benannte Direktpartien mit hostgesteuerter Erstellung/Umbenennung und eigenständiger Metadatenrevision. 411 Regressionen, beide API-Integrationen, TypeScript und 112 gerenderte Ansichten geprüft; physische Abnahme separat. Startkarte nur zum Öffnen; Beenden im Spiel erklärt das gemeinsame Verlassen. Details: [Offline-Mehrspieler](offline-multiplayer.md), [Abläufe](flows.md), [Gestaltung](ui-design.md), [Verlassen](leaving.md).

## Client 1.18.0: direct recovery and UI

Bounded Android candidate fallback, correct manual-QR timeout handling, compact direct match/session layouts and grouped settings. See [offline multiplayer](offline-multiplayer.md), [diagnostics](offline-diagnostics.md), [UI design](ui-design.md) and [responsive validation](responsive-qa.md).

## Neu 1.17.3: Dauerhafte Farbabschlusskarten

Farbabschlüsse bleiben mit Spielername und Farbe während der gesamten Partie sichtbar, auch nach weiteren Würfen, Blattwechsel und Wiederaufnahme. Die Anzeige liest alle gespeicherten bestätigten Abschlüsse ohne Rundengrenze. Minen entfernen verlorene Abschlüsse und aktualisieren übertragene Farbprämien bereits in der gemeinsamen Engine; die Karten übernehmen diesen aktuellen Stand. Im verdeckten Spiel bleiben Prämienwerte und fremde Blätter verborgen. Kein zusätzlicher Timer, Push, Datenabruf oder neues Speicherformat.

Prüfstand: **10.11.2026 · Client 1.17.4**. Automatisierte und gerenderte Prüfungen werden im [Prüfumfang](responsive-qa.md) getrennt ausgewiesen.

## Neu 1.17.2: Gemeinsame Statusgestaltung und Mehrspieler-Start

Kurze Bonuskarte mit aufklappbarem Verlauf, korrektes **Du hast**, neutrale Flächen mit sparsamen Zustandsakzenten und präzise Verdeckungsbeschreibung. [UI-Gestaltung](ui-design.md) erklärt Oberflächen, Symbole, Zugänglichkeit und verdeckte Werte. Neue Ein-Handy-, Direkt- und Internetpartien unterstützen die Kombination von Minen, Bonusfeldern und Random; nur der Gastgeber wählt Netzwerkregeln und alle Clients bestätigen ihre Fähigkeiten. 395 Regressionen einschließlich kombinierter Zwei-/Sechserpartien, Wiederverbindung und Datenschutz.

## Neu 1.17.1: Lesbare Brettwahl und Minenleiste

Auf Handys stehen die vier Bretter in einem Zwei-mal-zwei-Raster mit vollständigen Vorschauen und sichtbaren Namen; breite Ansichten behalten vier Spalten. Die Minenleiste zeigt ein festes Minesweeper-Symbol und **Gesperrt**, **Bereit** oder **Verbraucht**. Helle neutrale/grüne Zustände, getrennt scrollbare Gruppennamen und große Hilfe-/Aktionsflächen halten sie kompakt. Update regulär über **Auf Updates prüfen → Aktualisieren**. Spielregeln und gespeicherte Partien bleiben unverändert.





## Neu 1.17.0: Bonusfelder, Random und gemeinsame Minen

Drei geheime **Bonusfelder** vergeben je +2 an alle ersten Finder desselben Wurfs; Bekanntgabe erst nach der gemeinsamen Wertung, Punkte bleiben trotz Minen erhalten. **Random** erzeugt bei jedem neuen Start ein gemeinsames, gespeichert fortsetzbares Brett. Die optionale **Mine** trifft ein gewähltes Zielfeld bei allen aktiven Gegnern, einmal pro Person für insgesamt fünf Punkte. Die Explosion dauert drei Sekunden; Schadensmarkierungen bleiben bis Ende des nächsten Wurfs. Leere Ziele verursachen beim jeweiligen Gegner keinerlei Schaden.

**Partie verlassen** gibt sofort einen einmaligen Verlaufseintrag mit −10 Punkten und Niederlage. Die anderen spielen weiter; die letzte aktive Person gewinnt sofort. Im Internet wandert die Gastgeberrolle weiter. Offline bleibt das ursprüngliche Gastgeber-Handy als Zuschauer und Verbindung geöffnet; Verbindungsverlust pausiert sicher, ohne neue Autorität zu erfinden. Alle beteiligten Apps für neue Regeln auf 1.17.0 aktualisieren. [Bonusfelder](bonus-fields.md) · [Minen](mines.md) · [Random](random-board.md) · [Aussteigen](leaving.md).



## Neu 1.16.0: Offline-Testprotokoll und optionale Computer-Minen

Ein freiwilliges lokales A/B-Testprotokoll hilft bei Offline-Kopplung und Spielabgleich; es ist aus Einstellungen und Kopplungsdialogen exportierbar. [Testanleitung und Datenschema](offline-diagnostics.md). Die neue Startoption **Minenangriff testen** wurde in 1.16.0 zunächst gegen den Computer erprobt; ab 1.17.0 gilt sie für alle Mehrspielerarten: gegnerischer Farbabschluss schaltet einen einmaligen Angriff für fünf Punkte frei. Ein leeres Zielfeld ist ein vollständiger Fehlschlag ohne Nachbarschaden. [Regeln, verdeckte Zielwahl und Wertung](mines.md).


Client 1.17.3. The application interface and most feature guides are in German; repository setup instructions are in English.

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
