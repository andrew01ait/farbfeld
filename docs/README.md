# Farbfeld documentation

<!-- farbfeld-version: 1.16.0 -->

## Neu 1.16.0: Offline-Testprotokoll und optionale Computer-Minen

Ein freiwilliges lokales A/B-Testprotokoll hilft bei Offline-Kopplung und Spielabgleich; es ist aus Einstellungen und Kopplungsdialogen exportierbar. [Testanleitung und Datenschema](offline-diagnostics.md). Die neue Startoption **Minenangriff testen** gilt vorerst nur gegen den Computer: gegnerischer Farbabschluss schaltet einen einmaligen Angriff für fünf Punkte frei. Ein leeres Zielfeld ist ein vollständiger Fehlschlag ohne Nachbarschaden. [Regeln, verdeckte Zielwahl und Wertung](mines.md).


Client 1.16.0. The application interface and most feature guides are in German; repository setup instructions are in English.

| Topic | Guide |
|---|---|
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
