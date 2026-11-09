# Farbfeld contributor instructions

<!-- farbfeld-version: 1.15.0 -->

This is the public source snapshot for Farbfeld. Keep changes scoped to the requested feature. Do not infer authorization to change or redeploy an existing hosted installation from a change to this repository.

## Product invariants

- Keep Farbfeld an Android-first PWA with German game UI, offline installation and no account requirement.
- Keep the shared engine as the source of game rules. Preserve Classic and both additional boards, deterministic shared rolls, maximum six players, and existing storage/backup compatibility.
- Preserve the six themes, fixed Farbfeld brand icon, board zoom, portrait/landscape controls, reactions and local statistics.
- Computer opponents have easy/medium/hard strengths. Old saves without a strength keep their legacy behavior. Never use concealed opponent sheets or consume gameplay RNG while planning moves.
- Every user-exported JSON filename starts with the local date `YYYYMMDD_`, followed by `Farbfeld` and the artifact name. Do not put room/direct/notification credentials in backups.

## Access, storage and notifications

- Authorize every API action against the actual player/device, room, game and version. Display names are not credentials. Redact concealed scores and other players' sheets.
- Keep independent access to multiple saved rooms, per-room drafts, optimistic concurrency, and 14-day cleanup based on real opening or gameplay. Presence/polling must not prolong retention or reset the 24-hour skip rule.
- Only the room creator may skip a missing participant after at least 24 hours without gameplay. Preserve lobby-only membership changes and old-token invalidation.
- Local direct pairing must not acquire an Internet signaling/STUN/TURN dependency. Do not claim physical Android/Hotspot compatibility based only on simulated tests.
- Keep one adaptive active polling schedule; pause hidden/offline clients and avoid idle lobby loops.
- Push stays opt-in, silent by default, globally limited to one notice per minute and one notification tag. Only own-turn, game-end and explicitly host-started Internet rematch notices are permitted. Visible apps stay quiet. Joins, emojis, colour bonuses and ordinary lobby changes do not trigger Push.
- Keep `rematch-push-v1` worker capability gating, host-confirmed rematch markers and `rematch_ready` migration. Lobby return alone sends nothing. Only other participants receive the rematch start notice; it expires after their first choice in round 1. A pending start notice is replaced by an already accepted first-turn notice.
- Preserve the durable outbox, bounded attempts, deduplication and exact current-event checks. Provider acceptance alone never causes a retry. Background startup must not clear unread notifications.
- Treat `shown` as a successful browser display request, never proof of human reading or an actually visible Android lock-screen notification.
- Keep all secrets in private runtime settings. Use synthetic data, generated keys and local/mock receivers for tests; never send unsolicited test pushes or mutate real games.

## Development and verification

- Preserve the pinned package manager and lockfile. Use the portable profile for clean external clones.
- Never edit historical migrations or metadata snapshots. Generate additive migrations and locally apply only pending ones.
- Keep all version markers and offline cache assets consistent. Use the release script for an application release; a source-only documentation/export correction is not a production deployment.
- Update README, feature guides, changelog, architecture and flows when behavior changes.
- Run `pnpm test`, both API integrations, `pnpm typecheck`, `pnpm check:docs` and the production build for gameplay/network changes.
- For layout changes use [the responsive QA matrix](docs/responsive-qa.md). Distinguish rendered browser tests and physical-device tests from source review or simulations.
- Preserve third-party license and provenance notices. Do not add a project-wide license without the owner's decision.

## Hosted source and GitHub documentation

- Maintain [CONTRIBUTING.md](CONTRIBUTING.md), [the source workflow](docs/source-workflow.md) and [the publication record](docs/publication.md), together with the existing feature guides. They are included in the release/version/link guard.
- Keep shared technical behavior aligned between the hosted source and GitHub through reviewed changes. Preserve their separate history, environment manifests and public/private documentation boundaries. Do not assume automatic synchronization or deployment.
- A documentation-only/source-publication change keeps the application version and does not by itself release a changed application. Record the actual verification, public commit and separately deployed state without claiming they are identical.
