# Änderungsprotokoll

<!-- farbfeld-version: 1.17.2 -->

## 1.17.2 – 2026-11-09

Korrekte deutsche Hinweise: Du hast einen Farbabschluss; Du würfelst/wählst/bist in der lokalen Zugzeile. Bonuskarte reduziert auf Symbol, letzte Prämie und Zähler, nativer aufklappbarer Wurf-/Gewinnerverlauf; verdeckte Punkte auch dort und in zugänglichen Labels verborgen. Gemeinsame neutrale Flächen, Konturen und Symbolgrößen für Minen, Bonus, Farbabschluss, Punkte und Ergebnis über alle sechs Designs; Grün für Bereitschaft/Prämien und Rot für Schaden. Verdeckter Modus klar beschrieben: nur eigenes Blatt sichtbar, alle Punkte erst am Ende.

Random, Minen und Bonusfelder für neue Ein-Handy-, Direkt- und Internetpartien gemeinsam geprüft; Gastgeberwahl, vollständige Direktkopplung und tatsächliche Clientfähigkeiten bleiben erhalten. Kopplungsstatus erzeugt keinen falschen Updatehinweis mehr. Keine Spielregel-, Datenbank-, Transport- oder Push-Änderung. 395 automatisierte Regressionen und zusätzliche API-/Typ-/Build-Prüfungen; zwölf gerenderte Größen, alle Mine-Zustände, offene/verdeckte Bonusanzeigen, sechs Designs und kombinierte Mehrspieler-Startoberflächen. Physische Geräteprüfung bleibt separat.

## 1.17.1 – 2026-11-09

Telefon-Brettauswahl korrigiert: Zwei-mal-zwei-Raster statt kollidierender alter Zeilen-/Viererspalten-Regeln. Alle 105 Vorschaufelder und Namen bleiben innerhalb ihrer Kacheln, Random gleich groß mit erkennbaren Würfelpunkten. Vier Spalten auf breiten Ansichten, 44-Pixel-Schließen in Startdialogen. Minenleiste mit eigenem, dauerhaft sichtbarem Minesweeper-Symbol, klaren Statuswörtern und hellen neutralen/grünen Zuständen; Gruppennamen bleiben innerhalb eines gesondert scrollbaren Bereichs. Keine Spielregel-, Speicher-, Netzwerk- oder Push-Änderung. Gerenderte Einzelkachelprüfung und Release-/Offline-Prüfung werden im Layoutnachweis dokumentiert.

## 1.17.0 – 2026-11-09

- Optionale Bonusfelder in allen Startarten: drei zufällig versteckte gemeinsame Felder, je zwei Punkte für alle Treffer im ersten gemeinsamen Trefferwurf. Bekanntgabe erst nach allen Auswahlen, keine Koordinaten oder vorzeitigen Treffer in UI/Netzwerkprojektionen.
- Dauerhafte eigene Bonuswertung, auch nach Minenschaden an bestätigten oder bereits gewerteten Treffern; kein Wiederverdienen, kein Übertragen dieser Prämien. Separate Punktezeile und Ranglisten-/Ergebnis-/Statistikwertung.
- Gastgeberwahl und additive Fähigkeit bonus-fields-v1 für Räume und Direktpartien; alte Apps bleiben bei Standardpartien kompatibel. Computerplanung liest keine geheimen Positionen. 40 atomare Offline-Dateien, keine SQL-Migration oder neue Push-Art.
- Minen auf ausdrücklichen Wunsch für alle Multiplayerarten mit bis zu sechs Personen; ein Zielfeld gegen alle aktiven Gegner, fünf Punkte insgesamt. Chronologische Abschlussregister erhalten korrekte Erstboni und Gleichstände; verborgene Gegnerdaten bleiben geschützt.
- Drei Sekunden Explosion, sichtbare Zellen im Blickfeld und Schadensmarker bis Ende des nächsten Wurfs; Freischalt-Hinweis, kompakte Statusleiste/Anleitung und sauber ausgerichtete kurze Startoptionen.
- Random als vierte Brettwahl: begrenzt erzeugter ausgewogener Plan pro Start, identisch für alle, gespeichert über Wiederaufnahme. Einpassen berücksichtigt Innenabstände und schneidet die rechte Spalte nicht ab.
- Bestätigtes Aussteigen: sofort −10 und Niederlage, Gruppe spielt weiter, letzter aktiver Spieler gewinnt unabhängig vom negativen Rohstand. Internet-Gastgeberwechsel atomar; Offline-Gastgeber bleibt ausdrücklich Zuschauer/Relay, Verlust pausiert sicher und ausgeschiedene Gäste blockieren nicht.
- 390 automatisierte Regressionen bestanden; zwölf echte gerenderte Handy-/Tablet-/Desktop-Größen für Einrichtung, Gruppenansicht und Einpassen ohne Seitenüberlauf. Random-Neuladen, echte lokale Freischaltung, Drei-Sekunden-Effekt, Schaden und fünf aufeinanderfolgende Ausstiege bis zum negativen letzten Sieger im Browser geprüft. Physische Zwei-Handy-/Hotspot- und Balanceprüfung bleibt separat.

## 1.16.0 – 2026-11-09

- Freiwilliges lokales Offline-Testprotokoll für A/B-Handys: QR-/RTC-/Abgleichverlauf, streng bereinigter JSON-/Kopierexport, 300 Einträge/30 Minuten, Neuladen/Stoppen/Löschen und 24-Stunden-Aufbewahrung ohne Upload oder neue Netzwerkabfragen.
- Minenangriff als wählbare neue Computerpartie-Variante: Farbabschluss schaltet die gegnerische Mine frei; einmal je Person, Zusatzaktion, fünf Punkte Einsatz. Belegtes Ziel plus drei bis fünf zufällige belegte Nachbarn; leeres Ziel bewirkt keinerlei Nachbarschaden. Direkte Bonus-/Sternkorrektur, sofortige Übertragung freigewordener Erstboni, blinde verdeckte Zielwahl und einmaliger Computerangriff.
- Verdeckte Zielansicht ohne gegnerische Kreuze/Trefferzahl, Koordinatenauswahl und kurze Explosion mit reduzierter Bewegung. Bestehende Standardspiele und menschliche Mehrspielermodi bleiben kompatibel; kein Minen-Rollout für Menschen. 38 atomare Offline-Dateien, keine Datenbankmigration.
- Dokumentation in interner und öffentlicher Quelle ergänzt. 339 Tests, beide API-Integrationen und TypeScript bestanden; tatsächlicher Diagnoseexport, Neuladen/Stopp, Treffer-/Fehlschlagswertung und zwölf gerenderte Handy-/Tablet-/Desktop-Größen geprüft. Physische Zwei-Handy-/Hotspot-Prüfung und Balance folgen im Computerprototyp.



## 1.15.0 – 2026-11-08

Einmaliger Internet-Push „Revanche gestartet“ für die anderen Teilnehmenden beim bestätigten Start nach Spielende. Lobbyrückkehr allein sendet nichts. Eigene Züge haben Vorrang; globale Minute, Opt-in, Lautlos, Vordergrundsperre und einmalige Ereignisse bleiben erhalten. Schnelle Revanchen werden bis nach dem Minutenlimit gespeichert und über bestehende Serveraktionen/Wartung geprüft. Erledigter erster Zug, Abbruch und Partiewechsel verwerfen alte Startmeldungen.

Additive Migration 0009 und aktive Workerfähigkeit `rematch-push-v1` schützen alte Apps. Beide PWAs regulär aktualisieren und einmal öffnen. Neuer Hinweis im Geräteverlauf. Keine Änderungen an VAPID, Spielregeln oder laufenden Nutzerpartien; keine Test-Pushs an Nutzer.

Automatisierte Abnahme umfasst Entschlüsselung, Autorisierung, alte Worker, Zurück-in-die-Lobby/Start, schnelle und aufgeschobene Revanchen, Vorrang des ersten Zuges, geschlossene/sichtbare Fenster, Klick und Deduplizierung über Neustarts. 309 Tests einschließlich workerd/D1, beide API-Integrationen, TypeScript und Dokumentation bestanden; Migration 0009 auf lokalem D1 geprüft. Verwaltete Vorschau nicht erreichbar; Details in Deployment und Responsive QA. Physische Android-Anzeige der neuen Art noch offen.

## 1.14.0 – 2026-11-08

- Persistierte Versandwarteschlange und auf zwanzig Einträge begrenzter eigener Zustellverlauf. Providerannahme, Versuchszahl, Browserquittung und Antippen getrennt; keine fremden Geräte, Namen, Endpunkte, Schlüssel oder Spielstände in der Diagnose.
- Automatische Hinweise höchstens viermal versuchen: bis zu drei kurze Versuche, Wiederaufnahme unterbrochener/aufgeschobener Arbeit über den festen Wartungsaufruf. Nur Netzfehler, Zeitüberschreitungen, HTTP 429/5xx und ausdrücklich quittierte Prüf-/Anzeigefehler; Retry-After respektiert. Keine Wiederholung allein wegen fehlender Gerätequittung.
- Vor jedem Versuch Raumzugang, aktuellen Zug, Opt-in, Endpunkt und Frist erneut prüfen; abgemeldete, erledigte oder angezeigte Ereignisse bleiben still. Spiele werden vor dem Versand gespeichert; wartende Aufträge werden vor der Antwort persistiert.
- Service Worker prüft bei temporärem Fehler einmal zusätzlich mit jeweils fünf Sekunden Frist. Anzeige reserviert das Ereignis vorübergehend; erst eine erfolgreiche Anzeige verbraucht Ereignis und Minutenlimit. Fehlgeschlagene Anzeige gibt die Reservierung frei. Vorhandene Meldung verhindert Duplikat nach Neustart. Rückkehr in den Vordergrund wird vor der Anzeige erneut berücksichtigt.
- Additive Migration 0008, bestehende VAPID-Schlüssel und Schemata bleiben erhalten; 36 Offline-Dateien. Eigene Geräte-Diagnose nur per ausdrücklichem Push-Status prüfen laden. Physische automatische Android-/Sperrbildschirm-Abnahme weiterhin offen.

- 300 Tests einschließlich echter workerd-/D1-Transportprüfung und realem 503→201-Wiederholungsfall bestanden. Raum- und Kopplungsintegration, TypeScript, Syntax, Dokumentationsguard und Diffprüfung erfolgreich. Die lokale Datenbank war nach Bestandsprüfung leer; alle neun bislang unapplizierten Migrationen wurden einmal lokal angewendet (zwanzig SQL-Anweisungen erfolgreich). Bestehende historische SQL-Dateien unverändert. Gerenderte Handy-/Tablet-Prüfung durch Vorschauverbindung blockiert; physische Android-Abnahme offen.

## 1.13.1 – 2026-11-08

- Computer-Spielkopf im Handy-Hochformat auf zwei Zeilen verteilt: Titel und Stärke-Metadaten erhalten die volle Breite neben Zurück; Wurf, Punkte und Beenden stehen darunter in gleich breiten 44-Pixel-Flächen. „Computer“ wird nicht mitten im Wort getrennt.
- Stärke weiterhin über den Titel oder Einstellungen ändern; bei Spielende füllen Wurf und Punkte die Zeile ohne leere Abbruchspalte. Kompakter Querformat-Spielkopf behält seine Rasterzuordnung.
- Reine Darstellungskorrektur an vorhandenem HTML/CSS; Spielstand, Regeln, Computerstrategie, Push und 36 Offline-Dateien unverändert. Gerenderte Handy-/Tablet-Prüfung aktuell durch nicht erreichbare verwaltete Vorschau blockiert (ERR_CONNECTION_REFUSED); keine physische Android-Abnahme behauptet.

- 30 vorhandene PWA-/Computer-Tests, TypeScript, JavaScript-Syntax, Dokumentationsguard und Diffprüfung bestanden. Keine neue Gameplay-/Netzwerklogik.

## 1.13.0 – 2026-11-08

- Computerstärken Leicht, Mittel und Schwer ergänzt. Neue Partien standardmäßig Mittel; Leicht bleibt die bisherige Strategie. Mittel plant Bonusfortschritt und Joker, Schwer berücksichtigt nächste Zugchancen, öffentliche gegnerische Antworten und Endwertung.
- Stärke vor dem Start oder während der Partie über den Spieltitel/Einstellungen ändern. Würfel, Züge, Kreuze und eigene Auswahl bleiben erhalten. Speicherung/Backup weiter Schema 1; alte Partien ohne Stufenfeld bleiben Leicht.
- Dieselben Würfel, acht Joker und gemeinsame Regeln für alle Stufen. Kein Blick auf zukünftige Würfe oder verdeckte gegnerische Daten, keine API oder zusätzliche Timer. Weiterhin 36 Offline-Dateien.

## 1.12.5 – 2026-11-08

- JSON-Exporte beginnen mit dem lokalen Datum als `YYYYMMDD_` und enthalten den Anwendungsnamen Farbfeld. Spielstand-Sicherungen heißen beispielsweise `20261108_Farbfeld_Spielstand.json`.
- Datum und ISO-Exportzeitpunkt stammen aus derselben Date-Instanz. Import und Backupformat 1 bleiben unverändert; ältere Sicherungen sind weiter verwendbar. Konvention für künftige JSON-Artefakte in AGENTS und aktueller Dokumentation festgehalten.

## 1.12.4 – 2026-11-07

- Ungelesene Benachrichtigungen bleiben bei Start im Hintergrund erhalten. Client prüft Sichtbarkeit, Worker prüft beim Verarbeiten von `clear` tatsächliche sichtbare Fenster; schützt auch alte Clients und verzögerte Aufräumaktionen. Bewusstes Ausschalten räumt weiter auf.
- Diagnose nennt `shown` als erfolgreiche Browser-Anzeigeanforderung, ohne sichtbare Android-Ausgabe oder Lesen zu behaupten. Standardmäßig lautlos, nur eigene Gelegenheit/Spielende, globales Minutenlimit und ein Eintrag bleiben erhalten; keine Reminder oder zusätzlichen API-Schleifen.

## 1.12.3 – 2026-11-07

- Startseite: laufende Solo-, Computer- und Ein-Handy-Partien stehen jetzt direkt unter gespeicherten Internet-Räumen, vor der großen Illustration. Gespeicherte Offline-Direktpartien einschließlich wartender Kopplungen stehen ebenfalls oben.
- Jede Fortsetzen-Karte erscheint genau einmal. Bestehende Spielstände, Fortsetzen-/Abbruchaktionen und die Trennung von Internet-Räumen bleiben erhalten. Keine zusätzlichen Abfragen oder geänderten Speicherformate.

## 1.12.2 – 2026-11-06

- Hunde-Design zeigt eine einzelne braune Pfote mit dunkler Kontur, als lokale SVG-Datei statt plattformabhängigem blauem Pfotenpaar-Emoji. Einheitlich in Designkachel, Startillustration und markierten Spielfeldern.
- Zweifarbige Überschrift, kompakter Abstand, weitere Designs und festes Farbfeld-Logo bleiben. Neue lokale Datei `paw.svg` im atomaren Offline-Cache: 36 Dateien, keine CDN-Abhängigkeit.

## 1.12.1 – 2026-11-06

- Startseite kompakter: Abstand vor „Kleines Spiel. Große Möglichkeiten.“ reduziert, insbesondere unter gespeicherten Räumen (Handy: 20 statt 54 CSS-Pixel aus Karten-Ende bis Hero-Inhalt).
- Zweifarbige Custom-Hauptüberschriften wiederhergestellt: Grundtext in der dunklen Designfarbe, hervorgehobener Teil im Design-Akzent. Hunde nutzt ein gut erkennbares Olivgrün als Akzent. Texte, Illustrationen, festes Farbfeld-Logo und sechs kompakte Designkacheln bleiben erhalten.
- Reine Darstellungskorrektur; 35 Offline-Dateien, keine Änderungen an Regeln, Spielständen, Reaktionen, Push oder Server-API. PWA-/Versions- und TypeScript-Prüfung; visuelle Abnahme und offene mobile Viewports in `docs/responsive-qa.md`.

## 1.12.0 – 2026-11-06

- Zwei zusätzliche gerätelokale Designs: Hunde mit Pfote und Geburtstag mit Ballon, einschließlich umrandeter Spielmarkierungen. Alle bisherigen Designs bleiben; sechs kompakte Kacheln passen in den bisherigen Auswahlbereich.
- Startseite ohne zusätzlichen Design-Banner: Der saisonale Spruch ersetzt die Hauptüberschrift, Motive bleiben in der Illustration, das Farbfeld-Logo bleibt fest.
- Easter-Egg-Auswahl um 👍 und 😲 erweitert, mit bestehender Haltevergrößerung und Flug/Hüpfen/Looping. Additive Empfangsfähigkeit schützt ältere Raum-/Direktclients; die ursprünglichen drei Reaktionen bleiben kompatibel. Fünf Knöpfe umbrechen im Dialog.
- Explizite Tonwahl gilt jetzt auch bei Ersetzen des bisherigen Hinweises. Lautloser Standard, ein Tag, Minutenlimit, Vordergrundsperre und keine Wiederholungen bleiben. Diagnose zeigt Ereignisart und Datum/Uhrzeit statt unbestimmtem „letzter Push“.
- 274 Tests, beide API-Integrationen, TypeScript und Dokumentationsprüfung bestanden. Neue Fälle decken beide Emoji-Transporte, ältere Empfänger, einmaligen späteren Empfang und explizite Tonwahl mit Minutenlimit ab.
- Offline-Cache ergänzt um das lokale Designmodul: 35 Dateien. Keine Datenbankmigration, keine geänderten Speicher-/Spielprotokolle oder VAPID-Schlüssel. Dokumentation mit Prüfumfang aktualisiert; Handy-/Tablet-Viewport- und native Android-Prüfung separat offen.

## 1.11.2 – 2026-11-05

- Dokumentationsaudit: zentrale Übersicht mit aktuellem Prüfumfang, aktuelle Push-Beschriftungen, Mehrraum-Speicher und getrennte Geräte-/Raumfristen nachgeführt. Android-Selbsttest klar von offener Hintergrund-/Hotspot-Abnahme getrennt; Übersicht ist Teil der verpflichtenden Versions-/Linkprüfung. Keine Änderung an Spielablauf oder Clientversion.

- Eigenständiger „Internet-Push testen“-Knopf: authentifizierter Serverversand an ausschließlich die eigene Installation, ohne Raum oder Spielzug. Der lokale Geräteanzeige-Test bleibt getrennt. Expliziter Internet-Test auch bei geöffneter App, kurze Frist und gemeinsames Minutenlimit; keine Wiederholungs-/Poll-Schleife.
- Letzter Transportstatus und eine begrenzte Gerätequittung unterscheiden Vorbereitung/Netz/Provider-Ablehnung, Annahme durch den Push-Dienst und tatsächlichen Anzeigeaufruf bzw. Unterdrückungsgrund. Providerannahme ist kein Zustellbeleg. Quittungen enthalten nur Ereigniskennung und festen Status, keine Namen, Punkte oder Zugangsschlüssel.
- Additive Migration 0007 ergänzt ein optionales Diagnosefeld an bestehenden Geräten; keine VAPID-Rotation oder Neuinstallation. Alte Geräte bleiben kompatibel, der neue Internet-Test verlangt den aktualisierten Worker. Bestehende Raumspiele, Regeln und 34 Offline-Dateien unverändert.

## 1.11.1 – 2026-11-05

- Automatischen Internet-Push repariert: Die Produktionsruntime workerd lehnt `redirect: "error"` bereits vor dem Versand ab. Der Sender verwendet jetzt `manual`; 3xx-Antworten bleiben abgelehnt und werden nicht verfolgt.
- Fehlerprotokolle enthalten zusätzlich ausschließlich fest erlaubte Fehlerklassen; keine Fehlermeldungen, Abonnements oder Schlüssel. Geräteeinrichtung, Minutenlimit, Deduplizierung, Vordergrundsperre und Meldungsschema bleiben unverändert.
- Keine Migration, neuen Secrets oder Berechtigungen. Bestehende Abonnements bleiben gültig. Bereits gelesene oder zuvor verbrauchte Ereignisse werden nicht nachträglich wiederholt; nächste neue eigene Spielgelegenheit außerhalb der sichtbaren App prüfen.

## 1.11.0 – 2026-11-05

- Mehrere Internet-Spielräume mit eigenen gespeicherten Spielerzugängen und parallelen Partien. Alte einzelne Speicherung wird übernommen; kompakte Startkarten mit Zugstatus, „Alle Räume“, Hinzufügen und gezieltem Entfernen. Entwürfe bleiben pro eigener Spielgelegenheit erhalten; verspätete Antworten wechseln keinen Raum.
- Nutzerregel: Bereinigung nach 14 Tagen ohne Öffnen/Rückkehr oder gültige Aktion, einschließlich verlassener laufender Partien. Vorhandene alte Räume können bis zur tatsächlichen Löschung erneuert und fortgesetzt werden. Volle Legacy-Schonfrist, begrenzte globale Cleanup-Transaktionen, unabhängige Spiel-/Skip-Uhr und keine zusätzliche Hintergrundschleife.
- Ein kompakter autorisierter Sammelabruf für gespeicherte Räume; keine Blätter oder verdeckten Punkte. Abgeschlossene Ergebnisse mit richtiger eigener Rolle. Ein bestehender Scheduler, höchstens eine automatische Home-Abfrage pro Minute, kein Timer je Raum.
- Hinweise für mehrere autorisierte Räume mit Zielraumprüfung, gemeinsamer Minutensperre/Tag und gesammelter lokaler Sichtbarkeits-Deduplizierung. Vergessene oder gelöschte Räume verlieren ihre Bindung.

## 1.10.2 – 2026-11-05

- Feste Raumfrist von sieben Tagen nach Erstellung entfernt. Internet-Räume bleiben für laufende und weitere Partien wiederverwendbar, auch wenn ein alter gespeicherter Termin verstrichen ist. Code, Mitglieder, Zugangsschlüssel und Spielstand bleiben erhalten. Keine automatische neue Partie oder Daten-Neuanlage.
- Gerätebindung, Push-Prüfung und Präsenz vom alten Raumtermin getrennt. Präsenz hat eigene sieben Tage Aufbewahrung; Online-Zeit, Schreibdrosselung und Poller bleiben unverändert. Neue Räume speichern 0 im erhaltenen Legacy-Feld; keine Migration oder Zusatzabfrage. Fehlermeldung für fehlende Räume und Lobbyhinweis angepasst.
- Regressionen für gesperrte aktive Altpartie, alte Lobby und neue Raumfrist zunächst gegen den alten Code reproduziert. Prüfungen umfassen vollständiges Spiel, Rematch und jahrelange Wiederverwendung, Authentifizierung, Versionskonflikte, Push-Bindung und Präsenz. 229 Tests, Raum-/Kopplungsintegration, JavaScript, TypeScript, Dokumentationsprüfung und Produktionsbuild bestanden. Produktions-Altpartie authentifiziert vor dem Fix mit 404, danach mit 200 und unveränderter Spielversion geprüft. Zeitgrenzen kontrolliert simuliert; keine neue Browser-/physische Android-Abnahme.

## 1.10.1 – 2026-11-04

- Emoji-Versand direkt beim Loslassen statt abhängig von einem nachfolgenden Browser-Klick. Funktioniert im Regressionstest mit kurzem und langem Touch ohne Klick; Folge-Klicks einschließlich Hintergrund-Retargeting werden abgefangen. Keine Doppelsendung.
- Vorschau, Abbruch und Tastatur bleiben erhalten; Bedienhilfen-Klick ohne Pointer weiterhin unterstützt. Sichtbare Versandrückmeldung und Sperre für parallele Anfragen, Freigabe nach Fehler.
- 224 Tests, Raum-/Kopplungsintegration, JavaScript und TypeScript bestanden. Produktionsbuild und PWA-Update erfolgreich; kurzer und langer Klick mit zwei eigenen Browser-Spielerzugängen bis zum Empfang sowie Neustart ohne Wiederholung geprüft (Auswahl (private QA screenshot omitted)). Fehlender Folge-Klick zunächst gegen alten Code reproduziert. Physische Android-Ereignisfolge und Handy-/Tablet-Abnahme weiterhin offen. Reiner Clientfix, 33 Cache-Dateien, keine neue Migration, API-/Schema-/Push- oder Pollingänderung.

## 1.10.0 – 2026-11-04

- Emoji-Knöpfe unterstützen Gedrückthalten mit Größen-Vorschau: kurzer Tap normal, bis 2,5-fach nach 2,5 Sekunden. Einmaliger Versand beim Loslassen, Abbruch außerhalb/bei Pointerabbruch/Verbergen und Unterstützung für Leertaste/Enter. Keine Versand-Wiederholung oder Hintergrundabfrage.
- Wechselnde Flugbahnen: gerader Flug, Hüpfen und Looping ohne unmittelbare Wiederholung. Größe und Bewegung werden im Raum sowie direkt gemeinsam übertragen; spätere Raumempfänger sehen dieselben Effekte. Reduzierte Bewegung bleibt stationär.
- Additive Migration 0005 ergänzt `scale_percent` und `motion` mit kompatiblen Defaults. Alte Reaktionen bleiben erhalten, alte Clients fallen auf die normale Anzeige zurück. Weiterhin 33 Offline-Dateien, unveränderte Spiel-/Backupformate, Direktprotokoll und Push.

## 1.9.10 – 2026-11-04

- Würfelbox im Handy-Querformat korrigiert: Würfel, Hinweis und Zug-Buttons bleiben im normalen Fluss. Karte und Würfelregion schrumpfen nicht mehr zugunsten einer hohen Hinweisfläche; bei wenig Höhe scrollt die ganze rechte Box.
- Kurzer Hinweistitel und **i** für die vollständige Erklärung statt langer zweiter Textzeile im kompakten Querformat. Doppeltes Informationssymbol bei normalen Hinweisen entfernt; Warn-/Fehlerkennzeichnung bleibt erhalten. Hochformat unverändert.
- Verpasste Raumreaktionen werden beim ersten sichtbaren Abruf angezeigt, statt nach zwölf Sekunden zu verfallen bzw. ungesehen als gesehen zu gelten. Je Absender nur die neueste passende Reaktion, bis zu 24 Stunden innerhalb derselben Partie. Lokale Anzeigecursor verhindern Wiederholung nach Neustart; maximal drei gleichzeitige Flüge, weitere Absender folgen ohne Verdrängen ungesehener Reaktionen.
- Bestehende Tabelle und Featurekennung bleiben erhalten, Ereignisse ergänzen `senderId`. Kein Emoji-Push, zusätzlicher Poll-Timer oder Eingriff in Zugversion/Spieluhr. Empfänger benötigen den aktualisierten Client; bereits früher verfallene Ereignisse bleiben verloren.
- 209 Tests sowie Raum-/Kopplungs-API-Integrationen, JavaScript und TypeScript bestanden. Zwei neue Regressionen reproduzierten das Ausblenden beim ersten Abruf; weitere Tests prüfen einstündige Abwesenheit, Neustart, Grenzen, Empfänger, Duplikate, Speicherfehler und Sechsergruppen. Unverändert 33 Offline-Dateien, Regeln, Zug-/Backupformate und Spielbenachrichtigungen. Visuelle Handy-/Tabletprüfung mangels einstellbarem Viewport und physische Android-Abnahme offen.

## 1.9.9 – 2026-11-04

- Lücke im Handy-Spielkopf entfernt: gemeinsame Zeile für Zurück, vollständigen Raumnamen und Metazeile; darunter drei gleich breite Bereiche für Wurf, Punkte und Beenden. Ohne Beenden am Spielende teilen sich zwei Bereiche die Breite.
- Beschriftete Punkte-/Beenden-Aktionen und mindestens 44 CSS-Pixel hohe Bedienflächen im Handy-Hochformat. Bestehende Desktop-/Tablet- und kompakte Querformat-Anordnung bleibt erhalten.
- Verbindliche Prüfmatrix für typische Handy-, Tablet- und Desktopansichten samt Ausrichtung, Zuständen und ehrlicher Trennung von CSS-Prüfung, Browserdarstellung und echter Geräteprüfung. In Wartungs- und Deploymentanleitung sowie Dokumentationsguard aufgenommen.

## 1.9.8 – 2026-11-04

- Neue Spielhinweise dürfen beim Push-Dienst bis zu 24 Stunden auf ein vorübergehend nicht erreichbares Handy warten, statt nach einer Minute zu verfallen. Neue eigene Züge benötigen auch nach längerer Abwesenheit keinen geöffneten Client oder Hintergrund-Polling.
- Vor der Anzeige weiterhin Zustimmung, Vordergrund, aktuellen Raum/Zug und dauerhafte Deduplizierung prüfen. Ein Hinweis pro Ereignis, gemeinsamer Tag und Minutenlimit bleiben erhalten; keine periodischen Erinnerungen. Lokale Direkt-/Testmeldungen behalten 60 Sekunden Gültigkeit.
- Additives `deliveryExpiresAt` erhält sofortige Zustellung an ältere installierte Schema-1-Worker; die verlängerte Frist benötigt den aktualisierten Worker. Keine Migration, neuen Secrets oder zusätzlichen Cache-Dateien.
- 197 Tests, Raum-/Kopplungs-API-Integrationen, JavaScript, TypeScript und Dokumentationsprüfung bestanden. Neue Regressionen reproduzierten die kurze Zustellfrist und simulieren eine Stunde ohne geöffnetes Fenster, einen Worker-Neustart, verzögerten Transport, inzwischen gelesene/erledigte Züge und alte Worker. Physische Android-Zustellung weiterhin offen. Die konkrete Ursache eines fehlenden Hinweises auf einem Nutzerhandy ist damit nicht abschließend bewiesen.

## 1.9.7 – 2026-11-04

- Raumcode und Spielerzahl stehen auf der Startkarte unmittelbar unter dem Raumnamen in einer gemeinsamen Zeile. Darunter der Status, rechts der kompakte Öffnen-Pfeil aus 1.9.6.
- Auch im laufenden Spielraum stehen Code und Spielerzahl direkt unter dem vollen Raumnamen, als gemeinsame Überschriftengruppe. Im Querformat bleibt die Metazeile sichtbar; die Steuerung erhält eigene Bereiche.
- Anzahl aus der vorhandenen bestätigten Raumantwort, ohne zusätzliche API-Abfrage. Eine noch unbekannte Zahl wird nicht erfunden. Besetzungsänderungen aktualisieren die Karte wie bisher.
- Weiterhin 33 Offline-Dateien, unveränderte Regeln, Speicherformate und Benachrichtigungen. 33 Anzeige-/Status-/PWA-Tests, JavaScript, TypeScript, Dokumentation und Produktionsbuild bestanden. Live mit zwei eigenen Testzugängen: gemeinsamer Metatext, 44-Pixel-Pfeil per Enter, Kartenhöhe rund 97 Pixel und Titel-Metazeilenabstand 3 Pixel bei Desktopbreite. Raumkarte (private QA screenshot omitted) · Spielkopf (private QA screenshot omitted). Schmale Geräteansicht und physische Android-Abnahme offen.

## 1.9.6 – 2026-11-04

- Raumkarte auf der Startseite kompakter: Öffnen-Pfeil immer rechts neben Name, Code und Status, auch auf Handys. Der breite Button darunter entfällt; kleinere Innenabstände und Zeilenabstände sparen weitere Höhe. Lange Namen dürfen weiterhin umbrechen.
- Pfeil mit 44 × 44 CSS-Pixel großer Bedienfläche, Tastaturfokus und zugänglicher Beschriftung für Öffnen/Weiterspielen. Statusaktualisierungen erhalten die kompakte Darstellung und eigene Zughinweise.
- Weiterhin 33 Offline-Dateien; keine Änderung an Spielregeln, API, Timern, Daten oder Benachrichtigungen. 33 vorhandene Anzeige-/Status-/PWA-Tests, JavaScript, TypeScript, Dokumentation und Produktionsbuild bestanden. Physische Android-Abnahme offen.

## 1.9.5 – 2026-11-04

- Raumname im laufenden Spiel vollständig lesbar statt mit Auslassungspunkten gekürzt. Eigene breite Titelzeile im schmalen Hochformat und im kompakten Querformat; Bedienelemente erhalten eigene Bereiche.
- Große Zugstatusbox durch kompakte Zeile ersetzt. Nach Bestätigung beispielsweise „Dein Zug ✓ · Bea ist dran“; vollständige Beschreibung bleibt für Bildschirmleser erhalten, einzelne Spielerrollen bleiben sichtbar.
- Bestätigte Netzwerkzüge zeigen keine gesperrten schwebenden Würfel mehr über dem Spielfeld. Zugehöriger Leerraum entfällt; Fehler-/Bestätigungs- und Fremdblattanzeigen bleiben erhalten.
- Enthält die aufgeräumte Startkarte aus 1.9.4. Weiterhin 33 Offline-Dateien; keine Änderungen an Regeln, API, Zugberechtigung, Backups oder Benachrichtigungen. Prüfung: JavaScript, bestehende Anzeige-/Status-/PWA-Tests, Dokumentation und Produktionsbuild; physische Android-Abnahme offen.

## 1.9.4 – 2026-11-04

- Raumkarte auf der Startseite aufgeräumt: Name, Raumcode und Zugstatus in eigenen Zeilen. „Du bist dran“ und der Aktionszusatz bleiben als zusammengehörige Phrasen erkennbar; kein alleinstehender Trenner am Zeilenende.
- Auf schmalen Ansichten steht der breite Aktionsbutton unter dem Text, auf breiten Ansichten daneben. Lange Namen dürfen umbrechen. Auch Statusaktualisierungen erhalten diese Struktur ohne zusätzliche API-Abfragen oder unnötige Live-Ankündigungen.
- Weiterhin 33 Offline-Dateien; keine Änderung an Regeln, Zugberechtigung, API, Speicherformaten, Benachrichtigungen oder Berechtigungen. Prüfung: JavaScript, vorhandene Status-/PWA-Tests, Dokumentationsprüfung und Produktionsbuild; physische Android-Abnahme offen.

## 1.9.3 – 2026-11-04

- Push-Einrichtung bestätigt nur tatsächlich gebundene Räume; ein Raumwechsel während Registrierung/Binden verwendet den passenden Zugangssnapshot und wird seriell nachgeführt. Keine neue Abfrageschleife. Erfolgreicher Abgleich entfernt alte Verbindungsfehler.
- Einstellungen unterscheiden „Geräteanzeige testen“ vom Server-Push. „Spielraum-Zuordnung prüfen“ bestätigt den tatsächlichen Serverzugang manuell, ohne eine Benachrichtigung zu verschicken. Hinweise erklären Vordergrund-Unterdrückung, fehlende nachträgliche Meldungen und das auch für Tests geltende Minutenlimit.
- Erlaubte Spielhinweise verwenden höhere Web-Push-Zustellpriorität; Ereignisse, lautloser Standard, 60-Sekunden-Gültigkeit, Deduplizierung und Minutenlimit bleiben erhalten. Providerfehler werden ohne personenbezogene Daten, Endpunkte oder Geheimnisse protokolliert; keine automatischen Versandwiederholungen.
- Weiterhin 33 Offline-Dateien, keine Migration, neue Abhängigkeit oder Änderung an VAPID-Schlüsseln. Nutzerpartie während Diagnose nur gelesen. Physische Android-Zustellabnahme bleibt offen.
- Prüfung: 192 Tests einschließlich Registrierungs-/Bindungswechsel, Fehlerbereinigung/Backoff, Ausschalten während Einrichtung, manueller Zuordnung und sicherer Fehlerprotokolle; vollständige API-Partien, Raum-/Kopplungsintegration, TypeScript und Produktionsbuild. Lokale Browser-Vorschau zuletzt nicht erreichbar; physische Android-Zustellung nicht geprüft.

## 1.9.2 – 2026-11-04

- Das Farbfeld-Logo oben links bleibt bei Standard, Halloween, Weihnachten und Quietschenten unverändert. Kopfzeile und Ladeansicht verwenden das bestehende lokale `/icon.svg`; saisonale Logo-Ersetzungen und Umrandungen entfernt.
- Kürbis-, Weihnachtsbaum- und Entensymbole auf dem Spielfeld und in den Designelementen bleiben erhalten. Weiterhin 33 Offline-Dateien, keine neue Abhängigkeit, Datenmigration oder Änderung am Spielablauf.

## 1.9.1 – 2026-11-04

- Browser-Timer werden mit korrektem Window-Empfänger aufgerufen. Dies verhindert „Illegal invocation“ und stellt den adaptiven Abgleich in echten Browsern sicher.
- Nach Erstellen/Beitreten wird die Lobby nach Ende des laufenden Requests wieder freigegeben und einmal direkt abgeglichen. Der adaptive Timer startet anschließend korrekt; Raumsteuerungen bleiben nicht im anfänglichen Busy-Zustand.
- Sämtliche Funktionen aus 1.9.0 enthalten: persönliche Statuspunkte, Zughinweis auf der Startkarte, hostexklusive 24-Stunden-Sperre und adaptive Akkuschonung.

## 1.9.0 – 2026-11-04

- Online-/Offline-/Unbekannt-Indikatoren neben Spielernamen in Spiel und Lobby. Internet-Präsenz ist authentifiziert und von der Zugversion getrennt; Direktstatus verwendet tatsächliche WebRTC-Verbindungen, unabhängig vom Internetstatus.
- Gespeicherte Raumkarte auf der Startseite zeigt „Du bist dran“ zum Würfeln oder Wählen, Warten, Lobby und Ergebnis. Verdeckte Punkte bleiben verborgen; Gaststatistik wird auch beim Heimabruf der richtigen Mitgliedskennung zugeordnet.
- Fehlende Person überspringen ausschließlich für den Raumersteller und frühestens 24 Stunden ohne Spielaktion. Server prüft Rolle, Frist und Zugregeln. Start/Wurf/Zug/Skip setzen die Uhr, Status und Namen nicht. Legacy-Partien erhalten einen sicheren ersten Zeitanker.
- Ein adaptiver Raum-Timer statt starrer 2,5-Sekunden-Abfragen: Hintergrund/offline pausiert, Heimseite nur bei bekannter laufender Partie minütlich, im Spiel 6–60 Sekunden je nach Zug und Inaktivität, Fehler-Backoff bis 120 Sekunden. Keine Extra-API für Statuspunkte; Präsenzschreiben höchstens alle 30 Sekunden; begrenzte Request-Dauer.
- Additive Migration 0004 für `room_presence`, neues lokal gecachtes Statusmodul, insgesamt 33 Offline-Dateien. Keine neuen Secrets, unverändertes Spiel-/Backup-Schema und Direktprotokoll. Eigener Status-/Akku-Leitfaden ergänzt und in die Dokumentationsprüfung aufgenommen.
- Prüfung: 184 Tests, tatsächliche API-Route mit Migrationen/SQLite, Frische-/Timer-/Rollen-/Zeitgrenzen, Raum-/Kopplungsintegration, TypeScript und Build. Neue Migration zusätzlich erfolgreich über den lokalen D1-CLI angewendet. Lokale Browser-Vorschau zuletzt nicht erreichbar; physische Android-/Akku-Messung bleibt offen.

## 1.8.3 – 2026-11-04

- Hinweise in Raum-Lobby, Raumdialog und geteilter Einladung allgemein korrigiert: „Farbfeld benötigt keinen Account.“ Internetanforderung für Internet-Spielräume bleibt verständlich erhalten.
- README, Spielraum-Leitfaden, Arbeitsanweisungen und alle Release-Marker nachgeführt. Reine Textkorrektur, weiterhin 32 Offline-Dateien, keine Änderungen an Regeln, Speicherung, API oder Berechtigungen.
- Prüfung: JavaScript-Syntax, Dokumentations-/Versionsprüfung und Produktionsbuild.

## 1.8.2 – 2026-11-04

- Alte Internet-Räume übernehmen aktuelle Brettfähigkeiten nun bei jedem normalen authentifizierten Abruf. Ein veralteter Mitgliedseintrag blockiert die Auswahl nach dem App-Update nicht dauerhaft; der einmalige `hello`-Aufruf ist nicht mehr erforderlich. Bestehende 1.7.0-Clients mit Fähigkeitsheader profitieren ebenfalls.
- Die Lobby nennt noch unbestätigte Personen, erklärt das Öffnen desselben Raums auf dem jeweiligen Handy und bietet „Raum neu prüfen“. Eine fehlende Bestätigung wird nicht länger pauschal als alte installierte App ausgegeben.
- Nur eigene explizite Fähigkeiten, keine Änderungen bei gleichen Meldungen oder fehlendem Header. Begrenzte CAS-Wiederholung schützt gleichzeitige Züge, Raumänderungen und entfernte Mitglieder. Keine Spiel-/Push-Ereignisse durch Registrierung.
- Weiterhin 32 Offline-Dateien, Schema 1, bestehende Codes und Spielstände, keine Migration/Abhängigkeiten/Runtime-Secrets. Pflichtdokumentation aktualisiert.
- Prüfung: sechs neue API-Regressionen, 170 Tests insgesamt, Raum-/Kopplungsintegration und TypeScript. Normaler authentifizierter Gastabruf ohne `hello` wurde gegen die echte API-Route geprüft. Managed Browser-Vorschau war nicht erreichbar (Verbindung abgelehnt); keine Browser-Abnahme dieses Übergangs. Physische Android-Geräteprüfung bleibt offen.

## 1.8.1 – 2026-11-03

- Statistikseite aufgeräumt: kompakte Kennzahlen, drei Bereiche „Mit anderen“, „Computer“ und „Solo“, eingeklappte Wertungshilfe. Startseite erhält einen kontrastreichen Statistik-Button mit Diagramm-Icon.
- Computerpartien beeinflussen weder Partien/Siege noch Serien, Bestwerte oder Durchschnitte gegen Menschen. Die Ergebnislisten sind ebenfalls getrennt; vorhandene Daten werden ohne Migration neu ausgewertet.
- Gegnernamen öffnen eine eigene Bilanz: direkte Siege/Remis/Niederlagen, Siegquote, aktuelle/längste Siegesserie, eigene Punkte und die letzten fünf Duelle. Punkte und Joker entscheiden; direkte Remis unterbrechen diese Serie. Namenszuordnung bleibt lokal, mehrdeutige alte Rollen werden nicht geraten.
- Weiterhin Schema 1, 32 Offline-Dateien, keine neuen Abhängigkeiten, Datenbanktabellen oder Runtime-Secrets. Dokumentation gemeinsam aktualisiert.

## 1.8.0 – 2026-11-03

- Internet-Spielräume erhalten optionale Namen (48 Zeichen), beim Erstellen und jederzeit durch den Gastgeber änderbar. Code, gespeicherte Zugänge, Spielstand und offene Auswahl bleiben erhalten; Einladung und Wiederaufnahme zeigen den Namen.
- Lobby nennt Gäste mit fehlender Brett-Unterstützung und erklärt Update/erneutes Öffnen. Nach „Noch einmal spielen“ sind Brettwahl und Besetzung im gleichen Raum wieder verfügbar.
- Gastgeber kann Gäste in der Lobby entfernen; laufende Gruppen und Gastgeber selbst sind geschützt. Alte persönliche Zugänge werden ungültig; erneuter Beitritt per Code bleibt möglich.
- Automatische Updateprüfung bei Internet-Rückkehr, Sichtbarwerden und alle fünf Minuten im Vordergrund. Gut erreichbarer Banner mit „Jetzt aktualisieren“/„Später“, kein ungefragtes Neuladen, keine Update-Pushmeldungen. Fertige Updates/Offline-Dateien bleiben bei Netzfehlern verfügbar.
- Geräteprofil mit Siegen/geteilten Siegen, aktueller/längster Serie, Bestwert, Schnitt und direkter Gegnerbilanz nach Namen. Eigene Gastrolle wird gespeichert; uneindeutige alte Ergebnisse werden nicht geraten. Lokaler Ergebnisverlauf über 100 Spiele hinaus, Backups/importierte IDs ohne doppelte Zählung.
- Neues lokal ausgeliefertes Statistikmodul, 32 Offline-Dateien. Keine SQL-Migration, neuen Runtime-Secrets oder neuen externen Offline-Abhängigkeiten. Bestehende Spielstände/Schema, 32 Offline-Dateien, Direktprotokoll, VAPID-Konfiguration und öffentliche App-Adresse bleiben erhalten.
- Pflichtdokumentation und neuer Internet-Spielraum-Leitfaden gemeinsam versioniert; Releaseprüfung umfasst den neuen Leitfaden.
- Prüfung: 160 Regel-/Anzeige-/PWA-/Statistik-/Notification-Tests, Raum-/Kopplungs-API-Integrationen, TypeScript und Build. Browser-QA: zwei getrennte Clients, vollständige lokale Serverpartie (51 Würfe), persönliche Statistiken, gleiche Raumkennung nach neuer Brettwahl und Entfernen/Wiederbeitreten, Erhalt beider offener Auswahlen beim Umbenennen. Update-Banner zusätzlich mit simuliertem fertigen Worker einschließlich Rückfrage und „Später“. Physische Android-/Hotspot-/Push-Abnahme bleibt offen.

## 1.7.1 – 2026-11-02

- Benachrichtigungsinitialisierung beginnt erst, wenn der Offline-Service-Worker bereit ist.
- Erfolgreicher Start entfernt eine überholte Vorbereitungsmeldung; gleichzeitige und wiederholte Initialisierungen sind gesperrt.
- Regressionstest für Wiederholung nach einem noch nicht fertigen ersten Start; physische Android-Abnahme bleibt offen.

## 1.7.0 – 2026-11-02

- Optionale Benachrichtigungen für den eigenen Zug und das Spielende; standardmäßig aus und nach Aktivierung lautlos.
- Internet-Push über bestehende Spielräume, neue geschützte Geräte-Endpunkte, Web-Push-Verschlüsselung und VAPID.
- Keine Hinweise bei sichtbarer App, keine Join-/Emoji-/Farbmeldungen, höchstens ein Hinweis pro Minute und ein gemeinsamer Benachrichtigungseintrag.
- Persistente Deduplizierung, kurze Gültigkeit, Prüfung gegen den aktuellen Raum, Abschalten und Beispielhinweis.
- Offline-Direktmeldungen nur solange App und Verbindung laufen; keine neue Hintergrund-Verbindungszusage.
- 31 Offline-Dateien; vorhandene Spielstände, Schema 1, Publikum und App-Identität bleiben erhalten.
- Neue D1-Migration 0003 ergänzt ausschließlich Benachrichtigungsgeräte und einen Raumindex.
- README, Deployment-Anleitung, AGENTS.md, Architektur, Abläufe, Benachrichtigungen und Versionierung dokumentiert; Versions-/Dokumentationsprüfung vor jedem Build.
- Validierung: bestehende Spieltests/API-Partien, neue Richtlinien-/Worker-/API-Tests, unabhängige Entschlüsselung und Signaturprüfung. Browser-UI mit simuliertem Ausgabekanal und echtem IndexedDB-Speicher. Physische Android-Push-Abnahme offen.

## Frühere Veröffentlichungen

Die folgenden Einträge dokumentieren den jeweiligen damaligen Prüfstand. Versionsnummern, Dateizahlen und Gerätehinweise darin sind historische Angaben.

## Version 1.1.0 – Korrekturen vom 26.10.2026

- Automatisches vollständiges Einpassen aller 15 Spalten im Querformat, zusätzlich begrenzt durch die verfügbare Bildschirmhöhe
- Zwei-Finger-Zoom im Spielfeld mit verankertem Mittelpunkt, ohne die Seite zu zoomen oder versehentlich Züge anzukreuzen; zugängliche +/−- und Einpassen-Tasten
- Genau eine Übergabe pro Personenwechsel; im lokalen Spiel sind andere Spielfelder während der Partie gesperrt. Anzeigen unterscheiden Würfeln, erste Auswahl, weitere Züge und fertige Züge. In Internet-Spielräumen ist die reine Ansicht anderer Felder weiterhin möglich und ausdrücklich gekennzeichnet.
- `crossorigin="use-credentials"` am Manifest-Link für die private Site: Der Produktionsserver lieferte ohne Anmeldung 403 statt des Manifests. Die notwendige Anmelde-Einstellung war zuvor nicht gesetzt.
- Die Produktion leitet `/play.html` mit 307 auf `/play` um. Der alte Offline-Download verwarf jede Weiterleitung und brach deshalb ab. Manifest und Cache verwenden jetzt direkt `/play`; alte Verknüpfungen und die Manifest-ID bleiben kompatibel.
- Credentialed Cache-Download mit Prüfung aller zwölf Dateien und ausdrücklichem Bereitschafts-Handshake; Fehler werden sichtbar und lassen sich erneut prüfen. Ein gespeicherter Cache wird beim Offline-Start ohne Netzwerk-Registrierung verwendet. Updates laden keine noch unbestätigten Züge automatisch neu.

Prüfung: 31 Regel-, Anzeige-, Zoom- und PWA-Tests, einschließlich 200 Solo-Simulationen; vollständiger API-Spielablauf; Browser mit 390×844 und gedrehter 844×390-Ansicht. Synthetische Zwei-Finger-Touch-Events prüfen Zoom und unterdrückte Fehlklicks. Kein physisches Android-Gerät war angeschlossen; der native Chrome-Installationsdialog wurde nicht fernbedient. Bestehende lokale Speicherschlüssel und Spielstandstruktur wurden beibehalten.

## Version 1.1.1 – Einpassen und Startspalte

„Einpassen“ misst bei jedem Antippen die aktuell sichtbare Fläche neu. Die Höhe basiert auf dem Visual Viewport und der aktuellen Position des Spielfelds; bereits weggescrollte Kopfbereiche werden nicht erneut abgezogen. Im Querformat füllt das Raster die verfügbare Breite. Bei knappem Höhenangebot sind Kästchen etwas breiter als hoch, sodass alle sieben Zeilen sichtbar bleiben. Scrollen und Änderungen der Browserleisten aktualisieren die Einpassung bei 100 % automatisch; manuelles Zoomen bleibt erhalten.

H und der Startpfeil sind getrennte Elemente in einer einzeiligen, mit der Spaltenbreite skalierenden Beschriftung. Browserprüfung bei minimalen 30 % in Hoch- und Querformat: Pfeil vollständig innerhalb von H; die H-Kopfzelle hat dieselbe Höhe wie die übrigen Kopfzellen. Prüfung bei 844×390: Rasterbreite 593 px bei 593 px verfügbarer Breite, alle sieben Zeilen innerhalb der sichtbaren Fläche. Lokale Spielstände bleiben unverändert.

Die Farbpunkte sind in 1.1.1 auch im Querformat wieder sichtbar: pro Farbe werden der Fortschritt und die vergebenen +5/+3 Punkte ausdrücklich angezeigt. Noch mögliche Wertungen erscheinen zurückhaltend als 5/3 P beziehungsweise 3 P; ein vollständiger, aber noch nicht gewerteter Abschluss wird bis zum Ende des gemeinsamen Wurfs als ausstehend markiert. Die Querformat-Kopfzeile nennt zusätzlich die Farbpunktesumme. Die Einpassung berücksichtigt die Höhe dieser kompakten Farbleiste. Browserprüfung mit tatsächlichen Engine-Wertungen bestätigt +5 und +3 in Leiste und Summe, ohne den sichtbaren Bildschirmbereich zu überschreiten. Die Mehrspieler-Endbedingung bei zwei vollständigen Farben bleibt unverändert; Solo endet nach 30 Würfen.

## Version 1.2.0 – Direktspiel, Versionsanzeige und Updates

Die aktuell geladene Version steht auf jeder Ansicht direkt bei „Farbfeld“, auf dem kompakten Querformat-Spielfeld unter dem Partietitel. Bei einer bereitstehenden neuen Version erscheint ein Hinweis mit Versionsnummer und „Aktualisieren“. Einstellungen bieten „Auf Updates prüfen“ und erklären die Aktualisierung ohne Deinstallation. Bei wiederhergestellter Internetverbindung wird auch aus dem Zustand „Offline bereit“ erneut auf Updates geprüft. Ein Update lädt eine laufende Partie oder eine unbestätigte Auswahl weiterhin niemals automatisch neu. Lokale Speicherschlüssel und die Manifest-Identität bleiben unverändert.

Eine installierte PWA benötigt für Updates kurz Internet. Bis Version 1.1.1 heißt der Prüfknopf in den Einstellungen „Offline-Dateien erneut prüfen“. Sobald die neue Version bereitsteht, „Neue Version öffnen“ beziehungsweise „Aktualisieren“ wählen; danach kann wieder offline gespielt werden.

Der neue Direktmodus, die Kopplungswege, Speicherung, Fehlerbehandlung und der genaue Prüfstand sind in docs/offline-multiplayer.md dokumentiert. Die Regelengine und die bisherigen Speicherformate bleiben erhalten. Die Direktpartie wird separat unter farbfeld.direct.v1 gespeichert.

## Version 1.2.1 – Partie abbrechen und öffentlich teilen

Während einer laufenden Partie gibt es oben eine ×-Schaltfläche mit dem Namen „Partie abbrechen“; dieselbe Funktion steht in den Einstellungen. Eine Bestätigung erklärt den Umfang. Solo/Ein-Handy werden aus dem aktiven Speicher entfernt. In verbundenen Direktpartien und Internet-Spielräumen kann jede teilnehmende Person die gemeinsame Partie beenden. Beide beziehungsweise alle Geräte wechseln in den Spielraum mit einem Abbruchhinweis. Keine abgebrochene Partie wird als Ergebnis gewertet. Der Gastgeber kann ohne neue Kopplung eine neue Partie starten.

Bei einer unterbrochenen Direktverbindung kann ausdrücklich nur der Stand dieses Handys verworfen werden; das andere Gerät kann dabei nicht benachrichtigt werden. Ältere Gastgeber-Apps ohne Abbruchunterstützung werden erkannt. Das Direktprotokoll und bestehende Speicherformate bleiben kompatibel; der gemeinsame Abbruch benötigt beim Gastgeber Version 1.2.1 oder neuer.

Prüfung: 55 automatisierte Tests bestanden; bestehende Internet-Raum- und Kopplungs-API-Prüfungen bestehen einschließlich Abbruch durch Mitspieler, Berechtigungen, gespeicherter Fortsetzung und Schutz neuer Partien gegen alte Abbruchaktionen. Die realen Android-/Hotspot-Prüfungen des Direkttransports bleiben wie im Prüfbericht offen.

## Version 1.2.2 – Klare Zughinweise, Teilen und Hotspot-Hilfe

- Dauerhaft sichtbare Rückmeldung unmittelbar bei den Würfeln: fehlender Anschluss an H/bestehende Kreuze, getrennte Felder, falsche Anzahl, fehlende Joker, unmögliche Kombination und nicht ergänzbare Auswahl. Ungültig gewählte Felder erhalten eine rote Umrandung mit Ausrufezeichen; gültige vollständige Züge eine grüne Bestätigung.
- Die Prüfung berücksichtigt die tatsächlich verfügbaren Würfel, gewählte Jokerfarbe/-zahl und bereits gewählte Felder. Ist mit dem gesamten Wurf nichts möglich, wird kostenloses Passen hervorgehoben. Noch überbrückbare Teilauswahlen werden nicht fälschlich als unmöglich bezeichnet. Die vorhandenen Regeln bleiben unverändert.
- Der mobile Würfelbereich reserviert seine tatsächliche Höhe; im Querformat bleibt das gesamte Spielfeld eingepasst. Ein langer Würfelbereich kann unabhängig vom Spielfeld gescrollt werden.
- „Spiel teilen“ steht in der Kopfzeile und im kompakten Querformat beim Spiel. Es verwendet das native Teilen-Menü, falls verfügbar, und sonst die Zwischenablage. Geteilt wird ausschließlich der öffentliche App-Link; die bestehende Raum-Einladung bleibt separat.
- Unter „Offline – zwei Handys“ öffnet „Hotspot einrichten – so geht’s“ eine lokal verfügbare Android-Anleitung. Die PWA aktiviert keinen WLAN-Hotspot und behauptet dies auch nicht. Die Rückkehr erhält den eingegebenen Spielernamen.

Prüfung: 65 automatisierte Tests einschließlich unveränderter Regel-, Direkt-, QR- und PWA-Prüfungen bestehen. Spielraum- und Kopplungs-API-Prüfungen bestehen. Handyansichten 360×800, 390×844 und 844×390, dauerhafte Fehlermeldung, gültiger Tipp, kostenloses Passen, Teilen-Fallback und Hotspot-Anleitung wurden im Browser geprüft. Native Android-Teilen-Dialoge und der Hotspot-Betrieb auf echten Geräten sind hier nicht physisch geprüft.

Android-Primärquellen: https://developer.android.com/develop/connectivity/wifi/localonlyhotspot und https://support.google.com/android/answer/9059108?hl=de

## Version 1.3.0 – Computergegner und persönliche Designs

**Gegen den Computer** ist ein eigener Einstieg auf der Startseite. Mensch und Computer haben je ein Blatt, verwenden dieselben 3 Farb- und 3 Zahlenwürfel und wechseln die aktive Rolle. Der Mensch beginnt. Die bestehende Regelengine prüft alle Computerzüge und vergibt Erstboni erst nach beiden Zügen; die Partie endet nach dem Wurf mit zwei abgeschlossenen Farben. Der regelbasierte Gegner verwendet die vorhandene Zugbewertung für Felder, Sterne, Spalten und Jokerkosten. Er benötigt weder KI-Dienst noch Internet und kennt keine künftigen Würfe. Wenn kein Zug möglich ist, passt er kostenlos.

Der Mensch steuert ausschließlich Blatt 0. Das Computerblatt kann mit eindeutiger Kennzeichnung angesehen werden. Würfeln und Züge des Computers laufen in einzeln gespeicherten Schritten automatisch ab. Zeitgeber prüfen den aktuellen unveränderten Spielstand; auf der Startseite, bei offenen Dialogen und in einer versteckten App werden sie pausiert. Nach Neustart über „Weiterspielen“ geht es ohne Handy-Übergabe mit der gespeicherten Rolle weiter. Abbrechen, Ergebnisliste, Ergebnis teilen, Revanche sowie lokaler Export/Import unterstützen diesen Modus. Die bestehenden Speicherschlüssel und alten Solo-/Ein-Handy-Exporte bleiben lesbar.

Unter **Einstellungen → Dein Design** stehen Standard, Halloween, Weihnachten und Quietschenten zur Verfügung. Farben der Oberfläche, Akzente und kleine saisonale Grafiken wechseln sofort. Die fünf Spielfeldfarben behalten ihre Bedeutung. Die Auswahl gilt nur auf dem eigenen Gerät, wird lokal gespeichert und mit den Einstellungen exportiert. Das Entenmotiv ist eine eigene lokal ausgelieferte SVG; saisonale Symbole verwenden die Geräteschrift. Es gibt keine zusätzlichen Netzaufrufe oder CDN-Abhängigkeiten. Das Design ändert weder Regeln noch den Stand anderer Geräte.

Prüfung: **73 Tests**, darunter 20 vollständige Computerpartien, automatische Rollenwechsel, gültige Restwürfel ab Wurf 4, kostenloses Passen, Farbboni +5/+3, vollständiger Abschluss des letzten Wurfs sowie gespeicherte Zwischenstände. Bestehende Regel-, Direkt-, QR-, Anzeige- und PWA-Prüfungen bestanden; beide API-Integrationen und TypeScript-Prüfung erfolgreich. Browser: menschlichen Zug bestätigen, automatische Computerzüge inklusive eigenem Wurf, fremdes Blatt gesperrt, Neustart/Fortsetzen, Ergebnis und Revanche; vier Designs, Wechsel zurück zum Standard, Speicherung nach Neuladen, 360×800 und 390×844 sowie vollständiges Raster im Querformat 844×390. Der interne HTTP-Preview unterstützt keine Service Worker; der Offline-Cache wird deshalb zusätzlich im bestehenden PWA-Test mit den tatsächlichen Dateien geprüft. Kein physisches Android-Gerät angeschlossen.

## Version 1.3.1 – Wartende Direktpartien abbrechen

Ein gespeicherter Direktzugang kann jetzt auch ohne gestartetes Spiel oder erfolgreiche Verbindung entfernt werden. Die Startseitenkarte zeigt „Abbrechen“. „Direktpartie abbrechen“ steht außerdem in der Direktübersicht, den Einstellungen und sämtlichen Kopplungsdialogen bereit: Anleitung, Vorbereitung, QR-Angebot, QR-Antwort, Scanner, Raumcode-Warteansicht und Verbindungsfehler. Eine Bestätigung erklärt, dass ausschließlich die Direktpartie auf diesem Gerät entfernt wird. „Zurück“ behält sie. Ein anderer, separat gespeicherter lokaler Spielstand bleibt erhalten. Der bestehende gemeinsame Abbruch einer bereits laufenden, verbundenen Partie bleibt erhalten.

Nach Bestätigung werden Scanner und QR-Wechsel angehalten, der Direktzugang entfernt, laufende Signalisierungsanfragen abgebrochen, RTC-Verbindungen geschlossen und alte asynchrone Rückmeldungen durch ihre Vorgangskennung verworfen. ICE-Sammlung lässt sich sofort abbrechen. Ein bereits erzeugter eigener Raumcode wird bei erreichbarem Internet geschlossen; ohne Internet gilt weiterhin seine reguläre maximale Gültigkeit von zehn Minuten. Ein verspätet zurückkommender Code wird nicht angezeigt und ebenfalls zum Schließen vorgemerkt. Eine abgebrochene Code-Abfrage oder Antwort darf keinen neuen Gaststand erzeugen. Ein neuer Kopplungsversuch wird nicht durch alte Fehler oder alte Verbindungsereignisse blockiert.

Prüfung: **83 Tests** bestanden, einschließlich sieben zusätzlicher Session-Abbruchfälle, Abbruch bei laufender ICE-Sammlung, erreichbarer Abbruch in allen Kopplungsansichten sowie verworfener alter Oberflächenaktionen. Der Kameratest deckt nun auch verspätete Berechtigungsfehler nach einem neuen Start ab. Internet-Kopplungs-API-Integration und TypeScript-Prüfung erfolgreich. Browser: Abbruch während Vorbereitung, nach Neustart direkt von der Startseitenkarte, „Zurück“ erhält den Stand, Bestätigung entfernt ihn dauerhaft, andere lokale Partie bleibt erhalten; Dialog auf 390×844 und 360×800 ohne horizontalen Überlauf. Keine physischen Android-Geräte angeschlossen.

## Version 1.3.2 – Computer-Spielfeld im Querformat

Auf niedrigen Querformat-Displays wurden die Felder im Computermodus auf wenige Pixel Höhe gestaucht, weil Titel, Spielerliste und Zugbanner zusammen einen großen Teil der Höhe beanspruchten. Im kompakten Querformat stehen Titel, beide Spielerkarten mit aktuellem Zugstatus, Wurfnummer, Teilen und Abbruch nun in einer gemeinsamen Kopfzeile. Der zusätzliche Zugbanner bleibt für Screenreader verfügbar. Die Farbpunkte unter dem Spielfeld und die Rollen auf den Spielerkarten bleiben sichtbar.

Die Höhenberechnung hat im Computermodus zusätzlich eine Untergrenze: Felder bleiben mindestens zwei Drittel so hoch wie breit und bei ausreichender Spaltenbreite mindestens 20 CSS-Pixel hoch. Falls ein noch kleinerer Viewport das nicht vollständig aufnehmen kann, erlaubt die Seite vertikales Scrollen. Andere Spielmodi behalten ihre bisherige Einpassung. Pinch-Zoom, +/− und „Einpassen“ verwenden dieselbe Schutzgrenze; die gesamte Breite aller 15 Spalten bleibt die Grundlage der Übersicht.

Prüfung: **84 Tests** bestanden. Ein Regressionstest bildet die zuvor gemessene sehr geringe verfügbare Höhe ab und prüft den Stauchungsschutz sowie die unveränderte Einpassung der anderen Modi. Browser: Fehler bei 729×293 nachgestellt (5,39 CSS-Pixel Feldhöhe), korrigierte Feldhöhe 20,86 CSS-Pixel; alle sieben Zeilen und die Farbpunkte enden bei 291 von 293 verfügbaren Pixeln, ohne Seitenscrollen. Weitere Querformat-Prüfungen: 844×390 und 915×350 vollständig sichtbar, Hochformat 390×844 weiterhin quadratische Felder. Gültige Auswahl, Bestätigung, automatischer Computerzug, erster Wurf nach Neustart sowie 120-%-Zoom und Rückkehr zu 100 % geprüft. Kein physisches Android-Gerät angeschlossen.

## Version 1.4.0 – Mehrspieler auf bis zu sechs Handys

Die offizielle Anleitung von Schmidt Spiele nennt 1–6 Personen; Farbfeld begrenzt Gruppen entsprechend auf 2–6. Quelle: https://www.schmidtspiele.de/files/Produkte/4/49327%20-%20Noch%20mal!/49327_Noch_Mal_DE.pdf (abgerufen 28.10.2026).

- **Zusammen → Offline – mehrere Handys**: Gastgeber koppelt jede weitere Person einmal in beide Richtungen per QR oder über einen eigenen kurzlebigen Kopplungscode. **Weitere Person einladen** erweitert die Lobby, bis sechs Plätze belegt sind. Eine unangenommene Einladung kann zurückgenommen werden. Die Gruppe steht ab dem Start fest.
- Zuverlässige/geordnete WebRTC-Verbindungen in Sternform: bis zu fünf getrennte Datenkanäle zum Gastgeber, keine Gast-Gast-Kopplung, keine laufenden Signalisierungsaufrufe. Keine neuen externen Dienste oder Dateien.
- Jeder Gast hat einen festen Spielerplatz und eigenen Zugangsschlüssel. Nachrichten werden nur für den authentifizierten Kanal ausgewertet. Host erzeugt Würfe einmal und verteilt bestätigte Stände an alle. Gleichzeitige passive Züge desselben Wurfs sind erlaubt; individuelle Regelprüfung und persistente Aktionskennungen verhindern Mehrfachzüge. Alte Runden und andere Partien bleiben gesperrt.
- Alle Handys pausieren, sobald ein Gruppenmitglied fehlt. Der Gastgeber koppelt gezielt den bisherigen Namen erneut, die übrigen Kanäle bleiben offen. Nach komplettem Neustart wird jeder Gast einmal neu mit demselben Gastgeber gekoppelt. Alle gespeicherten Blätter bleiben erhalten.
- Protokoll 2 erfordert Version 1.4.0 auf allen Handys. Bestehende Zweier-Speicherstände unter farbfeld.direct.v1/schema 1 einschließlich offener Aktionen werden weiter gelesen. Solo, Computer, Ein-Handy und Internet-Räume bleiben erhalten.
- Eigene unbestätigte Auswahl bleibt bei Bestätigungen anderer Spieler und beim Wiederverbinden erhalten. Lobby zeigt jeden Platz, tatsächliche Verbindung und Gesamtzahl; verbundene Gäste werden bei fehlenden anderen Handys zum Warten aufgefordert.
- Internet-Spielräume separat geprüft: sechs Teilnehmer, siebter abgewiesen, Rolle rotiert über alle sechs.

## Version 1.5.0 – Mehrspieler-Anzeige und verdeckte Partien

- Kompakte Querformat-Kopfzeile für alle Mehrspielerarten; jedes Feld bleibt bei 100 % mindestens 20 px hoch bzw. mindestens zwei Drittel seiner Breite. Alle 15 Spalten bilden weiter die Einpassbreite. Bei außergewöhnlich wenig Platz darf die Seite vertikal scrollen. Pinch-Zoom bleibt proportional. Browser-Reproduktion bei 729×293: 20,84 px Zellhöhe und komplette sieben Zeilen inklusive Farbleiste innerhalb 293 px, ohne äußeren horizontalen Scroll.
- **Σ / Punkteübersicht** öffnet eine seitlich einfahrende Übersicht. Pro Person: Spalten, Farben, Joker, offene Sterne, Gesamtformel sowie aufklappbare Einzelspalten/Farben. Internet-Räume synchronisieren bei geöffnetem Panel weiter; aufgeklappte Details, Scrollposition und unbestätigte Feldauswahl bleiben erhalten.
- Farbabschluss erzeugt genau ein deterministisches Ereignis bei der gemeinsamen Rundenwertung. Toast und sichtbarer Hinweis nennen Person/Farbe/Bonus; im Querformat sitzt der Hinweis beim Würfelbereich und nimmt dem Blatt keinen Platz weg.
- **Verdeckter Punktestand** wird vor dem Start gewählt. Gastgeber schaltet die gemeinsame Raum-/Direktoption; lokale/Computer-Spiele bieten einen Start-Schalter. Während der Partie sind fremde Punktestände und Blätter gesperrt. Am Ende werden alle aufgedeckt.
- Die Internet-API und Direkt-Gastnachrichten projizieren jeden laufenden verdeckten Stand pro Spielerrolle: fremde Blätter, Joker und Punktedetails sind nicht enthalten; fremde Zugdetails und Bonusbeträge werden entfernt. Gemeinsame Würfel, Zugstatus und öffentliche Bonusansprüche bleiben für das Spiel verfügbar. Der direkte Gastgeber ist weiterhin die vertrauenswürdige Instanz mit vollständigem Spielstand. Gemeinsame Zusatzoption erfordert entsprechend aktuelle Clients (1.5.0); offene Spiele mit bisherigen Clients bleiben möglich. Keine nachträgliche Änderung der Spielart in einer laufenden Partie.
- Abgeschlossene Spalten erhalten grünen Kopf und grünes Punktefeld, unabhängig vom Erst-/Späterbonus – auch +0 in H. Vollständige, aber noch nicht gemeinsam gewertete Spalten sind gelb gekennzeichnet. Bestehende Punkteberechnung bleibt erhalten.
- Markierte Felder tragen das lokale Design: Standard ×, Halloween 🎃, Weihnachten 🎄, Quietschente als vorhandenes lokales SVG. Sterne/Farben/Regeln bleiben gleich.
- Verständliche Updatefehler statt roher Browser-Fehlermeldungen; vorhandener passender Offline-Cache bleibt bei einem fehlgeschlagenen Update nutzbar. Einstellungen → **Hilfe beim App-Umzug** und /play?umzug=1 erklären den nötigen einmaligen Wechsel von der weitergeleiteten alten Adresse zu https://farbfeld-andrew.endruuu.chatgpt.site/play. Eine bereits blockierte 1.3.2-Installation kann diesen neuen Code nicht automatisch erhalten. Erst dort lokale Solo-/Computer-/Ein-Handy-Daten exportieren, dann neue Adresse installieren und importieren. Alte Direkt-/Raumzugänge sind im bisherigen Export nicht enthalten und werden nicht automatisch übertragen. Cache/Spielstände werden nicht automatisch gelöscht.

## Version 1.5.1 – Konturen und Offline-Prüfung

- Schwarze dünne Kontur für alle Spielfeldmarkierungen; aufgehellte Zellhintergründe statt ausgeblendeter Symbole.
- Frischer Direkteinstieg rendert auch vor dem Erzeugen des ersten Spielstands korrekt. Der bisherige Zugriff auf hiddenScores des Nullzustands brach die QR-Vorbereitung ab; im Browser reproduziert und nach Korrektur erneut geprüft.
- QR-SVG mit intrinsischen Maßen; Fehlerdialog statt leerem Bild; defekte optionale Komprimierung fällt auf unkomprimierte Daten zurück. QR-Fehler verwerfen keine fertigen RTC-Angebote/Antworten: Code- und manuelle Datenalternative bleiben verfügbar.
- Automatische Angebot-/Code-Vorbereitung mit einem Einstiegsknopf. Bestehender Internet-Spielraum bleibt separat und benötigt weiter Internet.
- Lokaler Gerätecheck ohne Kamera-/HTTP-Zugriff prüft Cache, QR-Bildpixel-Codec, Browserfunktionen/Berechtigungen und eine temporäre ICE-Sammlung. Kopierbares Ergebnis enthält keine IP-Adressen/SDP/Zugangsschlüssel. Der Check behauptet keine Verbindung zu einem zweiten Handy.
- 25 Dateien atomar im Offline-Cache. App-Navigation bevorzugt die vollständig gecachte Version; bei scheinbar aktivem WLAN ohne Internet startet die Oberfläche ohne Netz-Wartezeit. Vorhandener Cache wird vor einer langsamen Updateanfrage bestätigt. Bestätigte Züge werden nicht automatisch neu geladen, Speicherformate bleiben erhalten.

## Version 1.5.2 – Auch eigene Punkte verdecken

Bei einer laufenden verdeckten Partie zeigt kein Spieler mehr einen Gesamtpunktestand oder eine Punkteaufschlüsselung, auch nicht den eigenen. Das betrifft Spielerchips, Punktekarte, Querformat-Kurzstand, seitliche Punkteübersicht und die lokale Fortsetzen-Karte einschließlich Computer-Modus. Eigene Farbpunkte werden in Fortschritt und Abschlussmeldungen bis zum Ende ebenfalls nicht beziffert; Spaltenabschlüsse bleiben grün. Das eigene Blatt, Farbfortschritt und die für Züge benötigten Joker bleiben verfügbar. Am Spielende werden alle Punkte und Aufschlüsselungen wie bisher aufgedeckt. Auch bestehende verdeckte Spielstände verwenden diese Anzeige nach dem Update; Datenformat und Wertung bleiben erhalten.

## Version 1.6.0 – Querformat, geheime Reaktionen und Spielbretter

- Im knappen Querformat stehen Farbe und Zahl nebeneinander. Nur der Auswahlbereich scrollt bei sehr wenig Höhe; Passen, Bestätigen und der aktuelle kurze Hinweis bleiben sichtbar. Das Info-Symbol öffnet die vollständige Anleitung. Joker-Auswahl und Farbboni umbrechen kontrolliert, `+3 P` bleibt zusammen. Die Ergebnisansicht ist für niedrige Displays kompakter. Hochformat behält seine feste Zugleiste und erhält einen kompakten Brettwähler.
- Zehn aufeinanderfolgende Taps auf eine Versionsnummer schalten **☺ / Emoji senden** auf diesem Gerät dauerhaft frei. Eine andere Aktion oder mehr als 1,8 Sekunden zwischen Taps unterbricht die Serie. Zur Auswahl stehen ausschließlich **😘, 💩, 😂**. Bei mehr als zwei Personen kann man eine Person oder alle anderen wählen. Empfänger benötigen keine eigene Freischaltung, aber Version 1.6.0. Animationen dauern etwa zwei Sekunden, höchstens drei sind gleichzeitig sichtbar; reduzierte Bewegung wird berücksichtigt.
- Internet-Reaktionen laufen authentifiziert in einer getrennten D1-Tabelle mit Empfängerprüfung, Duplikatkontrolle und mindestens 1,2 Sekunden Abstand. Sie werden höchstens zwölf Sekunden ausgeliefert; alte Einträge werden bei einer weiteren Reaktion bereinigt. Die Zugversion und der verbindliche Spielstand ändern sich nicht. Im Direktmodus verteilt der Gastgeber die Reaktionen unmittelbar über die bestehenden Datenkanäle; kein HTTP und keine neue Kopplung sind nötig. Reaktionen werden nicht als ausstehende Züge oder in Direkt-Spielständen gespeichert.
- **Classic** bleibt exakt das bisherige Originalblatt. **Flusslauf** und **Mosaik** besitzen jeweils 105 Felder, 21 Felder und drei Sterne pro Farbe, einen Stern pro Spalte und zusammenhängende Farbgruppen der Größen 1–6 pro Farbe. Alle fünf Farben sind in H vertreten. Die Varianten ändern Farb- und Sternpositionen, nicht Würfel, Wertung oder Spielende; sie sind keine offiziellen Zusatzblätter. Gleiche Verteilungsregeln sind kein Nachweis identischer strategischer Schwierigkeit.
- Brettauswahl gilt für Solo, Computer, Ein-Handy-, Internet- und Direktpartien. Farberkennung, Vorschläge/Computerzüge, Sterne, Boni und Endwertung verwenden dasselbe gewählte Blatt. Das Brett steht während der Partie fest, wird im Spielkopf/Ergebnisverlauf angezeigt und bleibt im bisherigen Speicher-/Exportformat als optionales `boardId` erhalten. Alte Spielstände ohne Kennung bleiben Classic. Mehrspieler-Varianten benötigen 1.6.0 auf allen Geräten; ältere Clients erhalten eine Updatehilfe. Verdeckte Spiele verbergen weiterhin auch die eigenen Punkte bis zum Ende.
- Append-only D1-Migration `0002_fantastic_hardball.sql` ergänzt ausschließlich `room_reactions` und zwei Indizes. Vorhandene Räume und Speicherschlüssel bleiben erhalten. Die Offline-Liste enthält jetzt 27 lokal ausgelieferte Dateien.

Keine echten Android-Handys verfügbar; die physische QR-/Hotspot-Geräteabnahme bleibt offen.
