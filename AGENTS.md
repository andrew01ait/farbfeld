# Farbfeld contributor instructions

<!-- farbfeld-version: 1.18.0 -->

## Direct names and contextual leaving

Keep optional direct roomName (normalized, max 48 characters) and roomNameRevision separate from engine/game revisions. Only the original direct host may rename, even while paused; broadcast through the existing authenticated ordered channel and retain the latest metadata across stale states and reconnects. Never reset selection, retry/double a pending move, advance a round, mutate RNG or send Push for renaming. Include the optional name in QR setup; keep protocol 2 and legacy unnamed records valid. Direct home cards offer Open only. In-progress forfeiting stays behind the game Beenden confirmation; access/pairing management remains contextual inside the direct session.

## Direct recovery and layout

Prefer complete gathering, then allow a frozen local-UDP candidate snapshot at the 20-second deadline. Never use absent, relay-only or TCP-only candidates for this fallback. Preserve cancellation, existing match/player identity and no-Internet operation. Start the host connection timeout only after accepting the return answer. Keep direct phone titles on their own row and connection details above players. Keep game exit actions out of Settings, and diagnostics inside Hilfe & Diagnose. Anchor hidden peer-status labels so scrolled peers cannot widen the document.

## Shared status design

- Follow docs/ui-design.md: neutral theme-aware status surfaces and borders, 32-pixel icons, 14-pixel small-card radius. Reserve green accents for readiness/rewards and red for damage/errors. Do not restore large unrelated green/beige bonus/mine/result boxes.
- Keep all confirmed colour completion cards visible for the whole current match; never filter by recent rounds. Reuse saved announcements and the engine’s mine pruning/bonus reassignment. Reload, inspected sheet and orientation changes must retain them; hidden points remain redacted.
- Colour cards and toasts use colorCompletionText after colorAnnouncements has redacted hidden values; use Du hast and named-player hat. Bonus summaries stay compact, with all winner names and rounds available in the native details history. Preserve hiding of own/opponent points in visible text and accessible labels.
- New local/direct/room games expose Random, mines and bonus options. Only the host configures network games; direct requires complete pairing and real capabilities. Do not describe an unpaired device as an outdated client.

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
- Only the current room host may skip a missing participant after at least 24 hours without gameplay. Preserve lobby-only membership changes and old-token invalidation.
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
- Board selectors use two columns through 540 CSS pixels and four above that, with one-column content inside each card. Never restore the old fixed 112-pixel side-by-side preview. Validate all preview cells and the full label inside each card, not just page scroll width. The mine badge stays outside the horizontally scrollable participant list, visible even at 320 pixels; preserve native radio/checkbox access, explicit locked/ready/used text and 44-pixel actions.
- For layout changes use [the responsive QA matrix](docs/responsive-qa.md). Distinguish rendered browser tests and physical-device tests from source review or simulations.
- Preserve third-party license and provenance notices. Do not add a project-wide license without the owner's decision.

## Hosted source and GitHub documentation

- Maintain [CONTRIBUTING.md](CONTRIBUTING.md), [the source workflow](docs/source-workflow.md) and [the publication record](docs/publication.md), together with the existing feature guides. They are included in the release/version/link guard.
- Keep shared technical behavior aligned between the hosted source and GitHub through reviewed changes. Preserve their separate history, environment manifests and public/private documentation boundaries. Do not assume automatic synchronization or deployment.
- A documentation-only/source-publication change keeps the application version and does not by itself release a changed application. Record the actual verification, public commit and separately deployed state without claiming they are identical.

## Offline diagnostics and computer mine variant

- Keep the diagnostic recorder explicitly opt-in, local, bounded to 300 events/30 minutes and expired at next access after 24 hours. Export A/B/test/network enums and strictly allowlisted state facts only; no SDP, candidate addresses, credentials, raw messages/errors, names, scores or sheets. Diagnostic failures must not affect gameplay. No new background/network polling. Maintain docs/offline-diagnostics.md and its privacy/reload/timeout regressions.
- Mines are opt-in for new 2–6-player computer/local/room/direct matches. A single common target attacks every active opponent independently, five points total once per person. A completed colour unlocks the other player's single mine; extra action before normal move, five points even on a miss. An empty centre removes no neighbouring marks. Hits choose three to five occupied eight-way neighbours, clipped to availability. Preserve spent jokers, game/save compatibility and finished games. Transfer the first column/colour bonus to the sole remaining completed holder; if nobody holds it, make the full bonus available again. Re-completion while another holder remains earns the later bonus. Never award pending marks before shared round scoring. Hidden aiming and AI targeting must not read or reveal private opponent marks; animations do not reveal hidden hit counts/positions. Maintain docs/mines.md and regression coverage.

## Rules added in 1.17.0

- Keep the diagnostic recorder explicitly opt-in, local, bounded to 300 events/30 minutes and expired at next access after 24 hours. Export A/B/test/network enums and strictly allowlisted state facts only; no SDP, candidate addresses, credentials, raw messages/errors, names, scores or sheets. Diagnostic failures must not affect gameplay. No new background/network polling. Maintain docs/offline-diagnostics.md and its privacy/reload/timeout regressions.
- Mines are opt-in at new multiplayer creation for 2–6 players in computer/local/room/direct, never solo. The user explicitly approved this wider rollout and chose all opponents. One common target affects every active opponent independently; shooter intact, five points total even if all miss, once per person. Empty centre means no neighbour damage. Use actual mines-v1 capability, authenticated actor/game/round/version and atomic damage/cost. Track completion rounds: earliest surviving active holders (including ties) inherit full bonuses, later holders get lower bonuses, no holder frees a claim. Never award unconfirmed completions early. Bonusfield points/pending hits survive mines. Projections omit completion ledgers and all hidden opponent damage. Keep three-second effects, next-full-round damage indicators, draft preservation, compact UI, ready cue and reduced motion. Maintain docs/mines.md.
- Random is a fourth choice, generated once per new match by authority and stored identically for every player. Preserve 21 cells/colour, group sizes 1–6, all colours in H, 15 stars with one/column and three/colour; bounded generation and strict validation. Reload/reconnect keeps the plan, rematch generates fresh. Require actual random-board-v1 capability. Keep Classic unchanged. Maintain docs/random-board.md.
- Explicit multiplayer leaving is fixed −10 (user-selected), immediate deduplicated history/loss and no further actions, without terminating others. Last active person wins even below −10. Transfer Internet host atomically; prune departed members/tokens only on rematch lobby. Original offline host may forfeit but remains spectator/relay; explain keep-open, pause on relay loss, never fabricate migration. Ignore disconnected departed guests for readiness. Preserve confirmed round contributions/bonuses. Redact hidden opponent history values rather than inventing zero. Require actual leave-game-v1 support and maintain docs/leaving.md.

## Optional hidden bonus fields

- Bonus fields are opt-in only at match creation in every mode. Draw three unique shared coordinates uniformly with secure random, never show locations or inspect them in computer planning. Reserve hits on confirmed normal moves and settle after all players finish the round; every tied first-round finder receives +2 per field. Preserve pending and settled awards across mine damage, reconnects and reloads; never revoke, transfer or repeat those points. Project only settled slot/round/winner awards to all network clients, including open games; no locations or pending winners. Hidden totals remain concealed. Host-only lobby options and actual bonus-fields-v1 capability are required for multiplayer start/resume. Standard schema-1 games remain unchanged. No new Push kind, database migration or background timer. Maintain docs/bonus-fields.md and its rules/projection/recovery/AI tests.
