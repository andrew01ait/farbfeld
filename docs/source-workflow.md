# Source and documentation workflow

<!-- farbfeld-version: 1.19.1 -->

## Review 1.19.0

Die Raumübersicht bleibt eine reine Anzeige-/Indexergänzung; neue Spielmechaniken werden nicht umgesetzt. Gemeinsamer Code und generische Dokumentation werden separat als geprüfter Änderungsvorschlag vorbereitet. PR #1 mit Client 1.18.0 wurde bereits ausdrücklich freigegeben und übernommen. Keine automatische Synchronisierung oder Freigabe weiterer Main-Änderungen daraus ableiten.


## Entwurf für die laufende Änderung

Die Änderungen an Direktnamen und Spielaktionen werden mit der bereits geprüften 1.17.4-Korrektur im bestehenden Draft-PR #1 zur Durchsicht zusammengeführt. Ein GitHub-Draft ist ein Codeänderungsvorschlag; die App-Veröffentlichung ist davon unabhängig. Den öffentlichen Standardbranch erst nach ausdrücklicher Freigabe übernehmen.

## Shared UI maintenance

Keep `docs/ui-design.md`, the shared status tokens and the concise German copy aligned in both sources. Validate combined multiplayer start/recovery and hidden-value rendering before publishing a UI revision. Native Sites deployment and the public GitHub update remain separate verified operations.

Farbfeld has a hosted source repository and a separate public [GitHub repository](https://github.com/andrew01ait/farbfeld). Keep their application behavior and shared technical guides aligned through reviewed changes. Their Git histories are separate; commit identifiers are not interchangeable.

## Responsibilities

| Location | Responsibility |
|---|---|
| Hosted source repository | Source used for the existing hosted application, its instance configuration, internal maintenance instructions and dated operational evidence |
| GitHub repository | Reviewable public source, generic configuration examples, local setup, contributor guidance, migrations, tests and public feature/architecture documentation |
| Hosting runtime | Private settings, VAPID private key and live D1 data; these are not copied into source publications |

The initial publication is a source snapshot of application version 1.15.0. GitHub pushes do not automatically update the hosted source or deploy the existing application. No recurring synchronization or GitHub deployment workflow is installed by this publication.

## Keep a change aligned

1. Identify which source is being edited and read its contributor/maintenance instructions.
2. Make the focused implementation and documentation change. Preserve each environment's manifest, bindings, local state and private settings.
3. Run the relevant checks and distinguish local/mock tests, rendered browser checks and physical-device evidence.
4. Review the corresponding change for the other source. Transfer implementation and appropriate shared guides, preserving the public generic configuration and internal instance configuration. Do not replace either entire checkout with the other.
5. Review the public file list before publication. Exclude private hosting identifiers, original private Git history, environment files, subscriptions, tokens, live databases, personal backups, private screenshots and operational delivery logs. Use fictional fixture identities and generated keys.
6. Publish the reviewed GitHub change through an authorized connection. Record its application version and actual public commit in the internal publication record. Check that the remote tree matches the intended files and modes.
7. Deploy the hosted application only through its normal, separately requested hosting workflow. Record the built source and saved/deployed version accurately; a GitHub commit alone is not proof of what is live.

When a change begins on GitHub, review and apply the corresponding implementation and shared-guide changes to the hosted source before its next release. When it begins in the hosted source, prepare and review the public copy. Never copy secrets or private operational notes as part of either direction.

## Documentation map

| Change | Guides to maintain |
|---|---|
| User-visible feature, installation or setup | [README](../README.md), [documentation index](README.md), relevant feature guide and [changelog](../CHANGELOG.md) |
| Components, storage, transport or user flow | [Architecture](architecture.md), [flows](flows.md), [versions/compatibility](versions.md) |
| Internet-room lifecycle, authorization or retention | [Internet rooms](internet-rooms.md), [room status](room-status.md), architecture and flows |
| Notifications, delivery or retry behavior | [Notifications](notifications.md), architecture, flows, versions and the relevant deployment/operational notes |
| Computer behavior, boards or scoring | [Computer](computer.md), architecture, flows and compatibility; keep the shared engine authoritative |
| UI, zoom, themes or reactions | Relevant feature guide and [responsive QA](responsive-qa.md), including actual coverage and remaining limits |
| Build, deployment, source publication or contributor process | [Deployment](../deployment.md), [contributing](../CONTRIBUTING.md), this workflow, [publication record](publication.md) and [AGENTS.md](../AGENTS.md) |

Shared guides describe the same implemented behavior. Internal notes may additionally hold private instance details and dated operational findings. Public guides describe reusable setup without those details. Current instructions must remain accurate even when historical release entries are retained.

## Version and evidence rules

`public/version.json` and the documented application version refer to the application, not to a hosting save counter or a Git commit. Use the release helper for a changed application version. Documentation-only/source-export changes can retain the current application version (1.15.0 for this initial snapshot), with their date and scope recorded separately.

`node scripts/check-release.mjs` verifies required documents, version markers, local document links, current changelog and offline-file consistency. The release helper uses the same required-document list. These checks cannot determine whether prose is factually current; reviewers still compare the guides with the implementation.

The public [publication record](publication.md) records the verification and excluded material. The internal version records the public commit and host-specific handling. Passing automated tests does not establish physical-device behavior. Provider acceptance, browser display requests, notification taps and user-reported visibility must remain separate evidence.
