# Versionen und Kompatibilität

<!-- farbfeld-version: 1.17.4 -->

## Compatibility 1.17.4

Normal PWA update on all phones. Existing direct game/backup schema 1, protocol 2 and capabilities remain unchanged; 40 offline assets. Re-pair the saved match after reload. No migration or runtime secret change.

## Kompatibilität 1.17.3

Farbabschlüsse bleiben mit Spielername und Farbe während der gesamten Partie sichtbar, auch nach weiteren Würfen, Blattwechsel und Wiederaufnahme. Die Anzeige liest alle gespeicherten bestätigten Abschlüsse ohne Rundengrenze. Minen entfernen verlorene Abschlüsse und aktualisieren übertragene Farbprämien bereits in der gemeinsamen Engine; die Karten übernehmen diesen aktuellen Stand. Im verdeckten Spiel bleiben Prämienwerte und fremde Blätter verborgen. Kein zusätzlicher Timer, Push, Datenabruf oder neues Speicherformat.

## Kompatibilität 1.17.2

Darstellung, kurze deutsche Hinweise und klare Regelwahl vor dem Mehrspielerstart. Keine neue Fähigkeit, Migration, Abhängigkeit oder Speicherform; weiterhin Schema 1, Direktprotokoll 2 und 40 Offline-Dateien. Minen, Bonusfelder und Random bleiben an tatsächlich bestätigte Fähigkeiten ab 1.17.0 gebunden. Bei Raumspielen auf beiden/allen Handys aktualisieren und den Raum erneut öffnen. Nur das eigene Blatt bleibt im verdeckten Spiel während der Partie sichtbar; auch eigene Punkte erst am Ende.

## Kompatibilität 1.17.1

Layout-/Symbolkorrektur, unveränderte Spielregeln, Schema 1, Direktprotokoll 2, Fähigkeiten und 40 Offline-Dateien. Keine Migration oder neue Konfiguration. Installierte Apps regulär aktualisieren; begonnene Partien bleiben erhalten.

## Neu 1.17.0: Bonusfelder, Random und gemeinsame Minen

Drei geheime **Bonusfelder** vergeben je +2 an alle ersten Finder desselben Wurfs; Bekanntgabe erst nach der gemeinsamen Wertung, Punkte bleiben trotz Minen erhalten. **Random** erzeugt bei jedem neuen Start ein gemeinsames, gespeichert fortsetzbares Brett. Die optionale **Mine** trifft ein gewähltes Zielfeld bei allen aktiven Gegnern, einmal pro Person für insgesamt fünf Punkte. Die Explosion dauert drei Sekunden; Schadensmarkierungen bleiben bis Ende des nächsten Wurfs. Leere Ziele verursachen beim jeweiligen Gegner keinerlei Schaden.

**Partie verlassen** gibt sofort einen einmaligen Verlaufseintrag mit −10 Punkten und Niederlage. Die anderen spielen weiter; die letzte aktive Person gewinnt sofort. Im Internet wandert die Gastgeberrolle weiter. Offline bleibt das ursprüngliche Gastgeber-Handy als Zuschauer und Verbindung geöffnet; Verbindungsverlust pausiert sicher, ohne neue Autorität zu erfinden. Alle beteiligten Apps für neue Regeln auf 1.17.0 aktualisieren. [Bonusfelder](bonus-fields.md) · [Minen](mines.md) · [Random](random-board.md) · [Aussteigen](leaving.md).



## Neu 1.16.0: Offline-Testprotokoll und optionale Computer-Minen

Ein freiwilliges lokales A/B-Testprotokoll hilft bei Offline-Kopplung und Spielabgleich; es ist aus Einstellungen und Kopplungsdialogen exportierbar. [Testanleitung und Datenschema](offline-diagnostics.md). Die neue Startoption **Minenangriff testen** wurde in 1.16.0 zunächst gegen den Computer erprobt; ab 1.17.0 gilt sie für alle Mehrspielerarten: gegnerischer Farbabschluss schaltet einen einmaligen Angriff für fünf Punkte frei. Ein leeres Zielfeld ist ein vollständiger Fehlschlag ohne Nachbarschaden. [Regeln, verdeckte Zielwahl und Wertung](mines.md).


## Kompatibilität 1.15.0

Neue Internet-Push-Art `kind:rematch`, Ereignis `gameId:rematch`, Schema 1 mit unveränderten Gerätezugängen. Der aktive Worker muss `rematch-push-v1` melden. Additive Migration `0009_unique_stryfe.sql` ergänzt `rematch_ready INTEGER NOT NULL DEFAULT 0`; bestehende Worker bleiben bei Zug/Spielende. Neu: optionale Eventprüfung beim authentifizierten Status-GET. Reguläres PWA-Update auf beiden Geräten plus einmaliges Öffnen genügt. Weiterhin 36 Offline-Dateien, Spiel-/Backupschema 1, Direktprotokoll 2 und unveränderte VAPID-Secrets.

1.14.0 ergänzt additive Migration 0008, eigene Versandhistorie und das optionale Push-Feld dispatchAttempt. Schema 1 und alte Worker bleiben kompatibel; alte Quittungen ohne attempt gehören zum ersten Versuch. Neue Anzeige-/Prüfkorrekturen erfordern das normale PWA-Update. Kein neues Geheimnis, unveränderte 36 Offline-Dateien.

## Kompatibilität 1.13.0

`computerDifficulty` (easy/medium/hard) ist ein optionales Feld bestehender lokaler Computerpartien, Schema 1. Fehlend bedeutet alte Stärke Leicht; neue Partien verwenden standardmäßig Mittel. Die optionale Gerätepräferenz wird mit bisherigen Einstellungen exportiert. Unbekannte Stufen in importierten Computerpartien werden als ungültig abgewiesen. Ältere Clients kennen die neuen Strategien nicht; für deren Nutzung auf 1.13.0 aktualisieren. Räume, Regelengine, Direktprotokoll 2 und 36 Offline-Dateien bleiben unverändert. Keine Migration oder neuen Secrets.

## Kompatibilität 1.12.5

Neue JSON-Dateinamen: `YYYYMMDD_Farbfeld_Spielstand.json` mit lokalem Kalenderdatum. Backup-/Spielschema 1, Dateninhalt, Import, Datenbank und Direktprotokoll bleiben unverändert. Weiterhin 36 Offline-Dateien. Bestehende Sicherungen benötigen keine Umbenennung oder Konvertierung. Reguläres PWA-Update genügt.

## Kompatibilität 1.12.4

36 Offline-Dateien, unverändertes Push-Schema 1 und unveränderte Datenbank. Client und Worker gemeinsam aktualisieren, um Hintergrundstarts vor dem vorzeitigen Schließen ungelesener Hinweise zu schützen. Der neue Worker schützt auch `clear` von alten Clients. Keine Rotation von VAPID, keine Neuinstallation oder Migration. Die Diagnose unterscheidet Browser-Anzeigeanforderung von tatsächlicher sichtbarer Android-Ausgabe.

Die aktuelle maschinenlesbare Code-Version steht in [public/version.json](../public/version.json), alle Releases im [CHANGELOG](../CHANGELOG.md). Ein Sites-Speicherversionszähler ist nicht die Clientversion: Er identifiziert das gespeicherte Quell-/Build-Artefakt; die Clientversion versioniert die Offline-App.

| Gegenstand | Vertrag |
| --- | --- |
| Client | aktuell 1.17.4; semantische Version, Benachrichtigungen ab 1.7.0 |
| Direktprotokoll | 2, Gruppenunterstützung ab 1.4.0 |
| Lokale Spiele / Backup | Schema bzw. Backupversion 1 |
| Direkt-Speicher | `farbfeld.direct.v1`, Schema 1 |
| Neue Bretter / Reaktionen | zusätzliche Fähigkeiten ab 1.6.0; 👍/😲 benötigen `reactions-extra-v1` ab 1.12.0 auf Empfängern und Direkt-Gastgeber |
| Verdeckte Variante | Fähigkeit `hidden-scores-v1`; eigene Punkte ebenfalls verborgen ab 1.5.2 |
| Geräteprofil | ab 1.8.0, `farbfeld.stats.v1`, Schema 1; optionales `statistics` in bisherigen Backups |
| Internet-Raumname / Besetzung | ab 1.8.0; optionale JSON-Metadaten und hostautorisierte Lobby-Aktion, keine SQL-Migration |
| Update-Banner | ab 1.8.0 automatische Vordergrundprüfung, vollständig geladener Cache, freiwilliges Neuladen |
| Benachrichtigungen | Schema 1; automatische Raum-Pushs bis 24 Stunden, lokale/explizite Tests 60 Sekunden, eigener IndexedDB-Speicher |
| Manifest | ID `/play.html`, Start `/play`, Scope `/` |
| Internet-Raumregister | `farbfeld.rooms.v1`, kompatibler Auswahlzeiger `farbfeld.room.v1` |
| Datenbank | additive Drizzle-Migrationen bis 0009; zuletzt Workerfähigkeit `notification_devices.rematch_ready`, davor Zustell-Outbox/Verlauf 0008 |

Alte Spielstände ohne `boardId` sind Classic. Neue Bretter werden in Multiplayer nur mit entsprechend fähigen Clients gestartet; keine stillschweigende Umdeutung auf Classic. Direktnachrichten alter Protokolle erhalten eine verständliche Updatehilfe. Benachrichtigungen benötigen kein neues Spielprotokoll und ändern die Raum-Zugversion nicht.

Alte Internet-Räume ohne `roomName` zeigen den Standardnamen. Neue Antworten ergänzen `roomName` und `boardUpdateNeeded`; ältere Clients dürfen diese Felder ignorieren. `farbfeld.room.v1` bleibt unter demselben Schlüssel mit optionalem Namen erhalten. Eine Umbenennung erhöht die Raumversion, verändert aber nicht die Engine oder die Zugreihenfolge; abgelehnte veraltete Aktionen müssen mit dem aktuellen Stand wiederholt werden. Nur Mitglieder ohne laufende Partie können entfernt werden. Der alte Zugang eines entfernten Mitglieds ist sofort ungültig.

Ab 1.8.1 werden vorhandene Statistikeinträge nach Menschen, Computer und Solo getrennt ausgewertet; das Datenformat bleibt unverändert. Gegnerdetails werden aus denselben Einträgen berechnet, es entstehen keine neuen Konten, Identitäten oder Netzwerkdaten.

Neue Ergebnisse ergänzen `ownPid`; alte Einträge bleiben lesbar. Statistikmigration nutzt nur eindeutige Altzuordnungen, und Import führt Ergebnis-IDs ohne Doppelzählung zusammen. Die serverseitige Engine und ihre Speicherformate ändern sich nicht.

Ab 1.8.2 aktualisiert der Server die explizite Fähigkeitsmeldung bei jedem authentifizierten Raumabruf, falls sie vom gespeicherten Stand abweicht. Das greift auch für bestehende Clients ab 1.6.0/1.7.0, die diesen Header bereits senden, und für ältere Räume ohne neue Erstellung. Der neue Client verbessert den Hinweis und ergänzt „Raum neu prüfen“. Keine SQL-Migration; die Raumversion steigt nur bei geänderten Fähigkeiten.

Die automatische Updateprüfung selbst benötigt zunächst den neuen Client. Wer noch eine ältere PWA offen hat, aktualisiert für diesen Versionswechsel einmal über Einstellungen. Danach reicht der Banner; keine Deinstallation. Geräte-/Hotspot- und native Update-Abnahme bleiben getrennt von automatisierten und simulierten Browserprüfungen.

Ab 1.9.0 sind Präsenzdaten eine zusätzliche optionale GET-Eigenschaft; ältere Clients ignorieren sie. Die Daten liegen getrennt vom Spielstand. Neue Clients cachen ein zusätzliches Modul (33 Dateien). `lastActionAt`, `skipAvailableAt` und hostbezogenes `canSkip` sind zusätzliche Raum-Metadaten. Die 24-Stunden-Sperre gilt serverseitig auch für alte Oberflächen. Die Startkarte fragt nur bei bekannter laufender Partie automatisch weiter ab. Persönliche Ergebnisse verwenden auch beim Heimabruf die Mitglieds-ID.

Version 1.9.2 trennt das feste Farbfeld-Logo von den saisonalen Symbolen. Die vorhandene Offline-Datei `/icon.svg` wird wiederverwendet; weiterhin 33 Dateien, Schema 1 und Direktprotokoll 2. Keine Datenmigration oder neuen Abhängigkeiten. Installierte Apps erhalten die Korrektur über den normalen Updateweg.

Version 1.9.3 korrigiert asynchrone Push-Raumzuordnungen und ergänzt eine manuelle Statusprüfung. Die bestehende authentifizierte Statusantwort erhält nur optionale Diagnosefelder; alte Worker bleiben kompatibel. Push-Schema 1, Gültigkeit 60 Sekunden, Minutenlimit, Speicherformate, 33 Offline-Dateien und VAPID-Schlüssel bleiben erhalten. Keine Migration, neuen Abhängigkeiten oder zusätzlichen Poll-Timer. Höhere Web-Push-Zustellpriorität gilt nur für die unveränderten erlaubten Ereignisse.

Version 1.9.4 korrigiert nur die Darstellung der Raumkarte und ihre Statusaktualisierung. Weiterhin 33 Offline-Dateien; keine neue Fähigkeit, SQL-Migration, Abhängigkeit, API-Änderung oder zusätzlicher Timer. Bestehende Räume und installierte Spielstände bleiben kompatibel.

Version 1.9.5 ergänzt die Raumkarten-Korrektur um vollständige Namen im Spielkopf, kompakte Bestätigungszeilen und das Ausblenden gesperrter Würfel nach bestätigten Netzwerkzügen. Regeln, Zugzustände, Speicherschlüssel, Transport und 33 Offline-Dateien bleiben unverändert. Keine Migration oder zusätzliche API-Aufrufe.

## Releasepflege

1. `node scripts/release.mjs <neue-version>` ausführen. Es führt Clientversion, Manifest-Metadatum, Paketversion, `version.json` und Dokumentationsmarker nach und legt einen neuen Changelog-Abschnitt an.
2. Den neuen Changelog-Abschnitt ausfüllen, aktuelle Dokumentation inhaltlich aktualisieren und neue Offline-Dateien prüfen. Der erzeugte Platzhalter darf nicht veröffentlicht werden.
3. `npm run check:docs` prüfen: alle Pflichtunterlagen, Versionsgleichheit, Changelog-Eintrag, Assetzahl und lokale Dokumentlinks.
4. Relevante Tests/TypeScript ausführen und über [deployment.md](../deployment.md) veröffentlichen. Der Framework-Build führt die Dokumentationsprüfung automatisch vor dem Build aus.

Die Prüfung erkennt fehlende Dateien und inkonsistente Metadaten. Sie kann nicht entscheiden, ob jede Erklärung fachlich aktuell ist; diese Inhaltsprüfung ist gemäß [AGENTS.md](../AGENTS.md) Teil jeder Änderung.

Version 1.9.6 reduziert die Höhe der Startseiten-Raumkarte: Öffnen-Pfeil rechts statt separatem Button darunter, kleinere Abstände und weiterhin lesbare Raumdaten. Die Schaltfläche bleibt zugänglich beschriftet. Weiterhin 33 Offline-Dateien, unveränderte Speicherformate, API und Benachrichtigungen; keine Migration.

Version 1.9.7 ergänzt in der kompakten Raumkarte die bereits geladene Mitgliederzahl neben dem Code, direkt unter dem Namen. Im laufenden Spielraum gehören Name und unmittelbar folgende Metazeile nun zur selben Überschriftengruppe; die Zeile bleibt auch im Querformat sichtbar. Ohne geladene Liste bleibt die Zahl zunächst weg. Keine API-, Schema-, Cachelisten- oder Timeränderung.

Version 1.9.8 verlängert ausschließlich Server-Push beim Dienst auf bis zu 24 Stunden. Schema 1 ergänzt optional `deliveryExpiresAt`; das bisherige `expiresAt` bleibt eine Minute, damit ältere Worker sofortige Meldungen weiterhin anzeigen können. Die längere Frist benötigt den aktualisierten Worker. Direkte lokale Hinweise, Opt-in, Vordergrundsperre, Minutenlimit, Tag, Deduplizierung, Speicher- und Datenbankschemas bleiben unverändert. Weiterhin 33 Cache-Dateien; kein zusätzliches Polling, keine neue Bibliothek oder Migration.

Version 1.9.9 korrigiert leere Bereiche im Handy-Spielkopf mit gemeinsamer Titelzeile und voll genutzter Steuerungszeile. Die neue Responsive-Prüfanleitung gehört zur versionsgeprüften Dokumentation. 33 Offline-Dateien, alle Speicher-/Transportformate und Benachrichtigungen bleiben unverändert; keine neue Abhängigkeit oder Migration.

Version 1.9.10 korrigiert schrumpfende Würfelbereiche im niedrigen Querformat durch normalen Fluss und gemeinsames Scrollen der rechten Box. Kurzer Hinweis, vollständige Hilfe über **i**. Unverändert 33 Offline-Dateien, Speicher-/Transportformate, Regeln und Push; keine neue Abhängigkeit oder Migration.

Die Reaktionskorrektur in 1.9.10 ergänzt `senderId` in bestehenden Ereignissen und einen lokalen Anzeigecursor `farbfeld.reactions.seen.v1`. Featurekennung `reactions-v1` und SQL-Schema bleiben kompatibel; ältere Empfänger blenden den ersten Abruf weiterhin aus und müssen für den Fix aktualisieren. Der Server liefert nur die neueste passende Reaktion je Absender bis zu 24 Stunden zurück. Keine Änderung an Zug-/Backupformaten, 33 Offline-Dateien, Push oder Polling; Direktreaktionen bleiben live.

Version 1.10.0 ergänzt optionale Reaktionsfelder `scale` (1–2,5) und `motion` (`fly`, `bounce`, `loop`). Feature `reactions-v1`, Direktprotokoll 2, Spiel-/Backupschema 1, Push und 33 Offline-Dateien bleiben erhalten. Additive Migration 0005 ergänzt zwei Spalten in `room_reactions` mit Normalgrößen-/Flugdefaults. Alte Clients/Worker bleiben kompatibel; für Haltegeste und vollständige Effekte alle beteiligten Apps aktualisieren. Keine neuen Abhängigkeiten, Secrets oder Bindings.

1.10.1 ersetzt die Klick-Abhängigkeit beim Emoji-Loslassen durch direkte Pointer-/Tastaturaktivierung mit Schutz vor Folge-Klicks. Keine Änderung an Nutzdaten, Features, Protokollen, Schemata, 33 Cache-Dateien oder Server; Sender aktualisieren. Bestehende Raum-/Direktpartner empfangen unverändert.

1.10.2: Internet-Räume ohne automatische Ablaufzeit. Bestehende Zeilen mit alter sieben Tage nach Erstellung gesetzter Frist bleiben erreichbar. `rooms.expires_at` bleibt unverändert im Schema, neue Räume schreiben 0; keine Migration oder Backfill. Spiel-/Backupschema 1, Direktprotokoll 2 und Featurekennungen unverändert; 33 Cache-Dateien. Neue Clients korrigieren den bisherigen 404-Text. Ältere Server wenden ihre Frist wieder an und würden neue Räume mit Wert 0 sperren; für einen Rollback ausschließlich eine Version mit dieser Korrektur verwenden.

1.11.0 führt `farbfeld.rooms.v1` für mehrere Gerätezugänge ein; der einzelne `farbfeld.room.v1`-Eintrag wird übernommen und als Auswahlzeiger erhalten. Keine Raumtokens in Schema-1-Backups. Migration 0006 ergänzt eine Nutzungszeitspalte mit konstantem Default 0, zwei Tabellen und passende Indizes. Historische Migrationen bleiben unverändert. Bestehende Räume erhalten bei der ersten Erfassung durch die Bereinigung eine volle Schonfrist; neue Räume setzen 14 Tage nach letzter echter Nutzung. Kein Zugangsfilter anhand dieses Termins.

API-Ergänzungen: `open`, kompakter `index` für maximal 50 eigene Zugänge, Notification-`bind-rooms` und raumspezifisches `status`. Meldungsschema 1 und Direktprotokoll 2 unverändert; Worker-`seen-list` neu. Ältere Clients können ihre einzelne Raumansicht weiter nutzen; mehrere Räume und zielraumspezifische Push-Prüfung benötigen das Update. Ein Server-Rollback vor 1.11.0 unterstützt die neuen Endpunkte nicht; nur entsprechend kompatibel reparierte Versionen einsetzen. PWA: 34 atomar gecachte Dateien, einschließlich `room-book.js`; keine neue CDN-Abhängigkeit.

1.11.1 korrigiert ausschließlich den Server-Push-Transport und seine Regression/Fehlerklassen. `manual` statt des in workerd ungültigen `error`-Redirect-Modus; 3xx bleibt gesperrt. Push-Schema 1, API, Spiel-/Backupschema 1, Direktprotokoll 2, Migrationen und 34 Offline-Dateien bleiben erhalten. Der Serverfix benötigt keine erneute Anmeldung, Subscription oder VAPID-Rotation; normale Aktualisierung bietet Client 1.11.1 an. Vor 1.11.1 wieder veröffentlichte Sender mit `redirect: "error"` würden den Fehler erneut einführen.

1.11.2 ergänzt additive Migration 0007 (`notification_devices.delivery`, nullable) sowie authentifizierte Notification-Aktionen `test-push` und `receipt`. Status-GET enthält ausschließlich projizierte letzte Diagnose und eine kurzlebige persönliche Testfreigabe. Normale Pushs behalten Schema 1; explizite Tests verwenden `kind:test, mode:test` mit 60-Sekunden-Frist und benötigen die neue Workerfähigkeit `push-test-v1`. Gerätegeheimnisse und Subscriptions bleiben gültig; keine Schlüsselrotation oder Neuinstallation. Spiel-/Backupschema 1, Direktprotokoll 2, 34 Offline-Dateien und bisherige API-Aktionen erhalten.

Prüfstand 1.11.2 am 05.11.2026: `physicalAndroidPushVerified:true` mit explizitem Scope `internet-self-test`, Nutzerbestätigung und gespeicherter Gerätequittung. `automaticBackgroundTurnVerified:false` kennzeichnet den noch offenen Hintergrund-Zugtest. Reine Evidenzkorrektur ohne neue Clientfunktionen oder geänderte Benachrichtigungsregeln; Versionsnummer bleibt 1.11.2.

1.12.0: Hunde/Pfote und Geburtstag/Ballon ergänzen bestehende lokale Design-IDs; alte Backups bleiben gültig. Das lokale Designmodul ist im Cache enthalten (35 Dateien). Keine SQL-Migration oder Änderung von Spiel-/Push-Schema und Direktprotokoll. Explizite Tonwahl erlaubt ersetzende neue Hinweise; kein zusätzlicher Versand.

1.12.1: Kompakterer Startseitenabstand und zweifarbige Überschriften. Reine Darstellung; Offline-Dateizahl, Speicherformate, Server-API und Protokolle unverändert.

1.12.2: Eine lokale braune Einzelpfote ersetzt das Hunde-Emoji. 36 atomare Offline-Dateien inklusive `paw.svg`; alle Speicherformate, Protokolle und Server-APIs unverändert.

1.12.3: Lokale und Offline-Direktpartien werden oben nach Internet-Räumen und vor dem Hero angeordnet. Keine Änderung an Speicherung, Protokollen, Server-API oder den 36 Offline-Dateien.


## Datenformat 1.17.0

Spiel-/Backupschema 1 und Direktprotokoll 2 bleiben erhalten. Neue optionale Felder: geheime Bonuszustände, gespeichertes Random-Layout, Minen-Abschlussrunden/Angriffsliste und Spielerflags `left`, `forfeit: -10`, `leftRound`. Netzwerkprojektionen entfernen geheime Bonuskoordinaten und Minenregister, verdeckte Gegnerblätter bleiben verborgen. Neue Regeln erfordern bestätigte Fähigkeiten `bonus-fields-v1`, `random-board-v1`, `mines-v1`, `leave-game-v1`; Altstände ohne die jeweilige Option funktionieren weiter. 40 atomare Offline-Dateien, keine Migration oder Secrets. Ausstiegsstatistiken können verborgene unbekannte Gegnerwerte enthalten.
