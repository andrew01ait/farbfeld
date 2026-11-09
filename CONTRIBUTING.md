# Contributing to Farbfeld

<!-- farbfeld-version: 1.17.1 -->

Read [AGENTS.md](AGENTS.md), the [documentation index](docs/README.md) and the [source workflow](docs/source-workflow.md) before changing the project. The game interface is German; repository setup and contributor instructions are English, while detailed feature guides may remain German.

## Prepare a change

Follow [README.md](README.md) and [deployment.md](deployment.md) for dependencies, local database migrations and startup. Keep the pinned package manager and lockfile. Work on a focused branch and explain the user-visible problem, resulting behavior and verification in the pull request.

Use the shared rule engine. Preserve existing game/save compatibility, concealed information boundaries, no-account play, mobile layouts and opt-in notification rules. Do not use production rooms, player credentials, personal backups or real device subscriptions as fixtures. Push tests use synthetic/generated data and local/mock receivers.

## Checks

Run the checks relevant to the change. Before gameplay, transport, storage or notification changes are published, run:

```bash
node --test tests/*.test.mjs
node tests/rooms.integration.mjs
node tests/pairing.integration.mjs
node node_modules/typescript/bin/tsc --noEmit
node scripts/check-release.mjs
corepack pnpm build
```

Documentation-only changes need the documentation/version/link guard and a review of the instructions against the source. When build configuration changes, also verify the portable build and documented local setup. For layout changes, use the [responsive QA matrix](docs/responsive-qa.md); record actual rendered and physical-device coverage separately.

A mock provider acceptance, browser display request (`shown`) and registered notification tap are different observations. None alone proves that a person read a notification. A passing simulated transport test does not certify Android background behavior or physical Hotspot/WebRTC interoperability.

## Documentation and releases

Update the current explanations together with the code. [The source workflow](docs/source-workflow.md) maps changes to the guides that must be maintained in both the hosted source and the GitHub publication. Keep public documentation free of private operational evidence.

For an application release, run `node scripts/release.mjs <new-version>`, complete its changelog entry, update the meaning of the guides and run the checks. The release helper and documentation guard share the required-document list, so contributor/publication/workflow guides receive version markers too. A source-publication or documentation-only update does not require an application version bump or a production deployment.

Migrations are additive. Preserve historical SQL, snapshots and journal entries; add and inspect a new migration when a schema change is needed. Explain compatibility and rollback implications in the change description.

## Publishing and licensing

A GitHub commit does not deploy the existing hosted Farbfeld instance. Deployments, runtime settings and data stay under the documented hosting workflow. No automatic source synchronization or deployment is configured by this initial publication.

A project-wide license has not been chosen. Preserve all existing third-party license/provenance notices and obtain the owner's decision before adding a project license. Public repository visibility is not a license grant.
