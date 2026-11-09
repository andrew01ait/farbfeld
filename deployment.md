# Development and deployment

<!-- farbfeld-version: 1.16.0 -->

## Release 1.16.0

Offline-Testprotokoll und optionale Minenvariante für neue Computerpartien. Keine SQL-Migration oder neue Laufzeitkonfiguration. Beide neuen Clientmodule werden atomar mitgecacht (38 Offline-Dateien). Installierte PWAs über **Auf Updates prüfen → Aktualisieren** übernehmen, anschließend **Offline bereit** abwarten. Alte Spiele ohne Minenfeld bleiben Standardpartien; Minenstände benötigen mindestens 1.16.0. Diagnoseexporte sind getrennt vom Spielstand-Backup. Funktions-/Datengrenzen: [Offline-Diagnose](docs/offline-diagnostics.md), [Minen](docs/mines.md).

339 automatisierte Tests, Raum- und Kopplungs-API-Integration, TypeScript und Dokumentationsguard erfolgreich. Lokale Browserprüfung: tatsächlicher JSON-Download, Erhalt der Aufzeichnung nach Neuladen, Stopp; Minentreffer mit Bonus-/Sternkorrektur und Übertragung frei werdender Erstboni und vollständiger Fehlschlag mit unverändertem Gegnerstand. Beide neuen Dialoge bei zwölf Handy-/Tablet-/Desktop-Größen ohne horizontalen Seitenüberlauf; Koordinaten-/Diagnosefelder mindestens 44 CSS-Pixel hoch. Keine neue Migration, kein Produktivspiel und kein Test-Push. Physische Zwei-Handy-/Hotspot-Abnahme und Minenbalance bleiben eigene Testschritte.


This public repository contains a source snapshot, not production database contents or production hosting credentials. It is not wired to deploy the existing hosted Farbfeld installation.

## Local setup

Install the pinned dependencies using pnpm 11.25.0 on Node.js 24, then apply all pending migrations:

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm exec wrangler d1 migrations apply DB --local --config wrangler.local.jsonc
corepack pnpm dev
```

`wrangler.local.jsonc` contains only the local development binding. Its placeholder database ID matches the Vite development configuration. Migrations are additive; do not edit historical SQL files, snapshots or journal entries. Data and local tool state belong under ignored paths such as `.wrangler/` and `.sites-runtime/`.

Run the checks in [README.md](README.md) before publishing a changed application. `pnpm build` emits the Worker build under `dist/server/` and browser assets under `dist/client/`; generated deployment configuration is a starting point, not production credentials.

## Hosting your own instance

Use your own Cloudflare account/resources or an equivalent compatible runtime. Create a separate D1 database, bind it as `DB`, configure the generated Worker plus its static assets, and apply the migrations from `drizzle/` to that database. Keep instance-specific IDs in an ignored configuration file such as `wrangler.production.jsonc`. Review paths in generated configuration before moving it to another directory.

Farbfeld itself does not require ChatGPT login. The source includes general starter support for optional authentication/connectors; these are not required by the game. Do not treat starter mock authentication as production authorization. Room and notification access use their own device/player credentials.

The stable PWA manifest identity and existing storage keys matter when updating the same installed instance. Use a separate origin for a new independent instance. Do not import live rooms, personal backups, push subscriptions, player tokens or the old instance's database as demo data.

## Optional Web Push

Configure these values as private runtime settings for your own instance:

- `FARBFELD_VAPID_PUBLIC_KEY`
- `FARBFELD_VAPID_PRIVATE_KEY`
- `FARBFELD_VAPID_SUBJECT`

Only the public VAPID key is returned by the public configuration API. The private key belongs in the hosting provider's secret store. The `.dev.vars.example` template is for optional local configuration and contains no usable credentials.

Users opt in on their own devices. Preserve silent defaults, foreground suppression, global minute limit, event deduplication, current-game checks and bounded retries. Provider acceptance, browser display requests and recorded taps are different observations.

The fixed maintenance endpoint accepts an empty JSON object and resumes only already-persisted valid work. This repository does not include the original installation's recurring automation. An independent operator must arrange their own maintenance calls if needed; normal game actions also resume due work. No arbitrary recipient or free-text push API is exposed.

## Publication snapshot

Application version: 1.15.0. The original source had 309 automated tests and both API integrations verified before the snapshot. Publication verification is recorded in [docs/publication.md](docs/publication.md). Private operational notes and screenshots are omitted from this public repository.

## Source and documentation publication

The GitHub source and the existing hosted deployment have separate histories and publishing paths. Follow [the source/documentation workflow](docs/source-workflow.md) and [publication record](docs/publication.md) when transferring changes. Keep shared guides current in both sources, preserve environment-specific configuration, and run the documentation/version/link check. A documentation-only source update does not change the live application version or justify a new production deployment.
