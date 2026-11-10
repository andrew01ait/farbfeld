# Farbfeld

<!-- farbfeld-version: 1.17.3 -->

## Neu 1.17.3: Farbabschlüsse dauerhaft sichtbar

Farbabschlüsse bleiben mit Spielername und Farbe während der gesamten Partie sichtbar, auch nach weiteren Würfen, Blattwechsel und Wiederaufnahme. Die Anzeige liest alle gespeicherten bestätigten Abschlüsse ohne Rundengrenze. Minen entfernen verlorene Abschlüsse und aktualisieren übertragene Farbprämien bereits in der gemeinsamen Engine; die Karten übernehmen diesen aktuellen Stand. Im verdeckten Spiel bleiben Prämienwerte und fremde Blätter verborgen. Kein zusätzlicher Timer, Push, Datenabruf oder neues Speicherformat.

Installierte Apps über **Einstellungen → Auf Updates prüfen → Aktualisieren** übernehmen. Bestehende Partien bleiben erhalten.

## Neu 1.17.2: Kompakte Hinweise, klare Mehrspieler-Optionen

Farbabschlüsse sagen korrekt **„Du hast Grün abgeschlossen“**. Bonusfelder zeigen nur Symbol, letzte Prämie (z. B. **Du · +2**) und **1/3**; Antippen öffnet den kurzen Wurf-/Gewinnerverlauf. Minen, Bonusfelder, Farbabschlüsse, Punkte und Ergebnis verwenden dieselbe helle Grundfläche; Grün kennzeichnet Bereitschaft/Prämien, Rot tatsächlichen Schaden. [Gestaltungsregeln](docs/ui-design.md).

Minen, Bonusfelder und **Random** lassen sich vor neuen Mehrspielerpartien kombinieren: **Zusammen → Ein Handy weitergeben**, nach der Kopplung in **Offline – mehrere Handys**, oder als Gastgeber im **Internet-Spielraum**. Alle beteiligten Apps müssen die Regeln tatsächlich unterstützen; bei Bedarf aktualisieren und den Raum neu öffnen. **Verdeckter Punktestand** bedeutet: nur dein eigenes Blatt sichtbar, Gegnerblätter und sämtliche Punkte erst am Ende. Laufende Partien behalten ihre Startregeln.

## Neu 1.17.1: Lesbare Brettwahl und Minenleiste

Auf Handys stehen die vier Bretter in einem Zwei-mal-zwei-Raster mit vollständigen Vorschauen und sichtbaren Namen; breite Ansichten behalten vier Spalten. Die Minenleiste zeigt ein festes Minesweeper-Symbol und **Gesperrt**, **Bereit** oder **Verbraucht**. Helle neutrale/grüne Zustände, getrennt scrollbare Gruppennamen und große Hilfe-/Aktionsflächen halten sie kompakt. Update regulär über **Auf Updates prüfen → Aktualisieren**. Spielregeln und gespeicherte Partien bleiben unverändert.





## Neu 1.17.0: Bonusfelder, Random und gemeinsame Minen

Drei geheime **Bonusfelder** vergeben je +2 an alle ersten Finder desselben Wurfs; Bekanntgabe erst nach der gemeinsamen Wertung, Punkte bleiben trotz Minen erhalten. **Random** erzeugt bei jedem neuen Start ein gemeinsames, gespeichert fortsetzbares Brett. Die optionale **Mine** trifft ein gewähltes Zielfeld bei allen aktiven Gegnern, einmal pro Person für insgesamt fünf Punkte. Die Explosion dauert drei Sekunden; Schadensmarkierungen bleiben bis Ende des nächsten Wurfs. Leere Ziele verursachen beim jeweiligen Gegner keinerlei Schaden.

**Partie verlassen** gibt sofort einen einmaligen Verlaufseintrag mit −10 Punkten und Niederlage. Die anderen spielen weiter; die letzte aktive Person gewinnt sofort. Im Internet wandert die Gastgeberrolle weiter. Offline bleibt das ursprüngliche Gastgeber-Handy als Zuschauer und Verbindung geöffnet; Verbindungsverlust pausiert sicher, ohne neue Autorität zu erfinden. Alle beteiligten Apps für neue Regeln auf 1.17.0 aktualisieren. [Bonusfelder](docs/bonus-fields.md) · [Minen](docs/mines.md) · [Random](docs/random-board.md) · [Aussteigen](docs/leaving.md).



## New in 1.16.0

- Optional local A/B diagnostics for offline pairing and synchronization, including JSON download/copy and bounded recovery after reload. See [the two-phone test guide](docs/offline-diagnostics.md).
- Opt-in **Minenangriff testen** when starting a new computer match. One attack per player, five-point cost, blind hidden-board targeting and complete misses on empty targets. See [mine rules and scoring](docs/mines.md). Group mines are supported from 1.17.0.


An installable, offline-ready dice game PWA with solo play, computer opponents, local and online multiplayer, and push notifications.

[Play Farbfeld](https://farbfeld-andrew.endruuu.chatgpt.site/play) · [Version 1.17.3](public/version.json) · [Documentation](docs/README.md)

The game interface is in German. Farbfeld needs no user account. It is an independent implementation of the basic rules of *Noch mal!* by Inka and Markus Brand (Schmidt Spiele), using its own interface and assets; this repository is not an official publisher release.

## Features

- Solo play, computer opponents with three strengths, and shared-device games.
- Internet rooms and local WebRTC multiplayer for up to six players.
- Three boards, six themes, optional concealed scores, and local statistics.
- Installable PWA with offline caching, portrait/landscape layouts and board zoom.
- Opt-in Web Push for your turn, game end, and a newly started Internet rematch. Notifications are silent by default and limited to one per minute.
- Dated JSON backups, persistent room access on each device, and QR-based direct pairing.

This is a clean source snapshot of the 1.15.0 application. It includes the frontend, API/Worker source, database migrations and tests. Private deployment identifiers, runtime secrets, live game/device data, and private QA screenshots are excluded. Synthetic tests use example identities and generated credentials. The original hosted application is managed separately; pushing here does not deploy it.

## Local development

Use Node.js 24 LTS (minimum supported version: 22.13) and pnpm 11.25.0. The SQLite tests use Node's built-in `node:sqlite` module.

```bash
git clone https://github.com/andrew01ait/farbfeld.git
cd farbfeld
corepack pnpm install --frozen-lockfile
corepack pnpm exec wrangler d1 migrations apply DB --local --config wrangler.local.jsonc
corepack pnpm dev
```

If Corepack is unavailable, install pnpm 11.25.0 separately and use `pnpm` in place of `corepack pnpm`. Open the local URL printed by the development server and visit `/play`. Local D1 emulation does not require production database credentials. Apply migrations before exercising Internet-room APIs.

The tracked `.openai/hosting.json` is a generic build binding declaration (`DB`), without a production project identifier. The included framework and build support originated in the Sites starter. A clean clone uses its portable execution profile.

Push is optional. Without VAPID settings, normal gameplay remains available and Internet Push is reported as unconfigured. Copy `.dev.vars.example` to `.dev.vars` to configure your own local VAPID values. Keep the example's variables commented out until real values are available. Never reuse production device subscriptions or import live database rows to test this copy.

## Checks

```bash
corepack pnpm test
corepack pnpm test:integration
corepack pnpm typecheck
corepack pnpm check:docs
corepack pnpm build
```

The tests use synthetic rooms, in-memory/local databases, generated cryptographic keys and local/mock push receivers. They must not send test messages to real players. A successful push-provider response or browser display request is not evidence that a person read a notification.

## Source layout

| Path | Purpose |
|---|---|
| `public/game/` | Game engine, UI, board definitions, computer opponents, QR/WebRTC, statistics and notification client |
| `public/sw.js` | Atomic PWA cache and notification-worker loading |
| `app/api/` | Internet rooms, temporary pairing and notification endpoints |
| `lib/` | Push outbox, presence, room retention and framework support |
| `db/`, `drizzle/` | D1 schema and additive migrations |
| `worker/`, `vite.config.ts` | Vinext/Cloudflare Worker entry and local build configuration |
| `tests/` | Rules, API, storage, PWA, Web Push and compatibility regressions |
| `docs/` | Architecture and feature guides |

The PWA atomically prepares 36 offline assets. <!-- PWA enthält 40 atomar vorbereitete Offline-Dateien. -->

## Deployment

Full online functionality needs a Worker-compatible backend and a D1 database bound as `DB`. Optional Web Push additionally needs your own VAPID keys. GitHub Pages can host static assets but does not run these room/push APIs. See [deployment.md](deployment.md) for the deployment boundary and setup requirements.

## Licensing

A project-wide license has not yet been selected. Public repository visibility alone is not an open-source license grant. Existing third-party notices are retained, including the QR libraries under [public/game/vendor](public/game/vendor/README.md), the stylesheet in `vendor/`, and the build support's own license notice.

## Source publication and contribution

Public source: [andrew01ait/farbfeld](https://github.com/andrew01ait/farbfeld). Read [CONTRIBUTING.md](CONTRIBUTING.md), [the source/documentation workflow](docs/source-workflow.md) and [the publication record](docs/publication.md). Shared technical guides are maintained alongside code; internal operational records and public setup examples have distinct roles. GitHub pushes do not automatically deploy the hosted application.
