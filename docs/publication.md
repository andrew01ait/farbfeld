# Public source snapshot

<!-- farbfeld-version: 1.15.0 -->

The initial GitHub source snapshot is based on Farbfeld 1.15.0. It includes application code, public artwork/icons, all additive schema migrations, dependency lockfile, tests and technical guides. It starts a separate public history.

Private screenshot evidence, original hosting project identifiers, deployment access and operational notes are omitted. Runtime databases, room/player credentials, real push subscriptions, personal backups, local tool caches and environment files are not part of this repository. Example test identities are synthetic; cryptographic fixtures generate their keys during the test.

The generic `.openai/hosting.json` binding declaration remains because the included build configuration reads it. It contains no original project identity. `.dev.vars.example` and `wrangler.local.jsonc` are public configuration examples. Configure a separate hosting environment if deploying your own instance.

A project-wide license has not been chosen. Third-party license and provenance notices are preserved.

## Verification — 9 November 2026

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
