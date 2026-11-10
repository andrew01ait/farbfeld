# Public source snapshot

<!-- farbfeld-version: 1.19.0 -->

## Source update 1.17.4

Reviewed local QR recovery, direct game layouts and settings cleanup. Preserve the public generic environment/build setup. Personal diagnostic exports, original screenshots and host-specific operational records are excluded. This commit updates public source and does not itself deploy a hosted instance.

## Update 1.17.3 — 10 November 2026

Persistent in-game participant/colour completion cards replace the one-round display cutoff. Existing saved announcements restore automatically; mine pruning/reassigned rewards and hidden values retain their existing rules. Two renderer regressions verify all five modes, JSON recovery, mine loss/first-bonus transfer and recompletion. The maintained hosted source passed 397 regressions, API integrations, TypeScript and twelve rendered CSS viewport sizes. Public source keeps its generic configuration and excludes instance identifiers, runtime data and private QA images. Hosted deployment and GitHub publication remain separate operations.

## Update 1.17.2 — 9 November 2026

Concise German completion/bonus copy, consistent neutral game surfaces and explicit concealed-board wording. New shared UI guide covers tokens, semantics, accessibility and privacy. Existing Random/mines/bonus options are jointly verified in shared-phone, direct and Internet starts for two/six players, including recovery and concealed projections; host authority and real capability gating remain intact. 395 automated regressions, both API integrations, TypeScript, documentation checks and production builds verify the maintained sources. Twelve responsive sizes, all six themes, mine states, bonus history and finished results rendered in the hosted preview. Transport simulation and physical-device limits are explicit in the QA guide. Private screenshots/instance identifiers remain excluded. GitHub publication and hosted deployment are separate operations; no automatic GitHub deployment is configured.


## Update 1.17.1 — 9 November 2026

Responsive board-selector and in-game mine-bar corrections, including the fixed Minesweeper icon, explicit status words and separate group scrolling. Per-card visual bounds replace page-overflow-only checks. 50 focused mine/group/PWA tests passed, with 20 rendered board-selector sizes and each mine state at all 12 required sizes. No new dependency, migration, asset or gameplay/transport policy; private screenshots and operational records stay in the hosted source.

## Update 1.17.0 — 9 November 2026

Optional hidden bonusfields, a shared persisted Random board, mines against every active opponent and explicit −10-point forfeits with continued play, Internet host succession and last-survivor wins. The original offline host remains spectator/relay; automatic offline authority migration is not implemented. Guides cover rules, privacy, capability checks, recovery and device-testing limits. 390 regressions passed in both sources, with both API integrations, TypeScript, documentation checks and the portable production build. Twelve viewport sizes were rendered. Physical two-phone networking and balance remain separate. Public generic configuration and synthetic identities are preserved. No private screenshots, hosting identifiers, user games, real subscriptions or test Pushes are included.

## Update 1.16.0 — 9 November 2026

The hosted and public sources include the opt-in local A/B offline recorder and the optional computer-only mine variant. The public copy keeps generic hosting configuration and synthetic example identities. New guides: [Offline diagnostics](offline-diagnostics.md) and [Mines](mines.md). No new dependencies or database migrations; no production game actions or test Pushes.

Verification for this update: 339 automated tests, both API integrations, TypeScript, documentation checks and the portable production build passed. Browser checks cover a real diagnostic JSON download, recorder persistence/reload/stop, the new-match switch and replacement confirmation, hit/miss scoring, immediate column/colour first-bonus transfer and concealed targeting. The two new dialogs were rendered at all twelve documented phone/tablet/desktop sizes without page overflow. Physical two-phone networking and mine balance remain separate acceptance steps. Public commits and the hosted deployment are separate operations, as described in the [source workflow](source-workflow.md).


The initial GitHub source snapshot is based on Farbfeld 1.15.0. It includes application code, public artwork/icons, all additive schema migrations, dependency lockfile, tests and technical guides. It starts a separate public history.

Private screenshot evidence, original hosting project identifiers, deployment access and operational notes are omitted. Runtime databases, room/player credentials, real push subscriptions, personal backups, local tool caches and environment files are not part of this repository. Example test identities are synthetic; cryptographic fixtures generate their keys during the test.

The generic `.openai/hosting.json` binding declaration remains because the included build configuration reads it. It contains no original project identity. `.dev.vars.example` and `wrangler.local.jsonc` are public configuration examples. Configure a separate hosting environment if deploying your own instance.

A project-wide license has not been chosen. Third-party license and provenance notices are preserved.

## Initial 1.15.0 verification — 9 November 2026

Checked the public snapshot with Node.js 24.22.1:

- All 309 automated tests passed.
- Internet-room and direct-pairing API integrations passed.
- TypeScript and the documentation/version/offline-asset checks passed.
- The portable production build completed successfully.
- All ten migrations applied successfully to a new local D1 database. Historical migrations and schema snapshots match the original source.
- A clean copy started the development server and returned HTTP 200 for `/play`, `/manifest.webmanifest` and `/version.json`.
- The staged file list was checked for private project identifiers, common credential formats, excluded runtime/database artifacts and omitted private screenshots.

These checks use local, synthetic or mock data. They do not certify rendered phone/tablet layouts, physical local-network interoperability or delivery to a real user's Android phone. No production deployment, real game action or test Push was performed for this publication.

## Documentation maintenance

[CONTRIBUTING.md](../CONTRIBUTING.md) and the [source workflow](source-workflow.md) cover checks, releases, review, hosted/GitHub coordination and the documentation map. Both are mandatory in the version/link guard, together with this publication guide. Internal deployment/operational notes are maintained in the hosted source; public guides keep reusable configuration and exclude private evidence.
