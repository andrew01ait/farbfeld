# Benachrichtigungen

<!-- farbfeld-version: 1.19.4 -->

## Menüreihenfolge 1.19.4

Im Menü Zusammen steht Internet – Spielraum zuerst, danach Offline – mehrere Handys und Ein Handy weitergeben. Die drei bestehenden Ziele, Beschriftungen und Abläufe bleiben erhalten. Reine DOM-Reihenfolge; keine zusätzliche Anfrage, Spiel-/Push- oder Speicheränderung.


## Direktzugang verwerfen

Die neue gerätelokale Entfernung sendet keine Spiel- oder Push-Nachricht. Internet-Raumbindungen bleiben bestehen; kein neuer Poller.


## Direktwurf 1.19.2

Die passive Wurfvorschau verwendet vorhandene Direktdaten. Keine zusätzliche Push-Nachricht, HTTP-Abfrage oder periodische Aktualisierung.


## Layout 1.19.1

Die schlankeren Raumkarten ändern weder Ereignisse noch Zustellung, Hintergrundverhalten oder Push-Abfragen. Keine zusätzliche Netzwerkaktivität durch Renderer oder CSS.


## Abgrenzung Übersicht 1.19.0

Neue Modus-/Teilnehmeranzeigen und Suche/Filter/Seitennavigation erzeugen keinen Push und keine zusätzlichen Statusabfragen. Bekannte eigene Zuggelegenheiten bestimmen nur die Kartenreihenfolge. Die vorhandenen Benachrichtigungsarten und Deduplizierung bleiben unverändert.


## Abgrenzung 1.18.0

Direktnamen sind lokale Sitzungsmetadaten. Umbenennen und die veränderte Startkarte lösen weder Push noch Erinnerungen oder zusätzliche Statusabfragen aus. Die bereits erlaubten Internet-Ereignisse bleiben unverändert.

## Scope 1.17.4

Local QR recovery and UI only. Push transport, event policy, opt-in, durable jobs and keys remain unchanged. Local gathering recovery does not add a push, reminder or background polling loop.

## Dauerhafte Karten ab 1.17.3

Farbabschlusskarten bleiben während der Partie sichtbar. Der kurze Toast erscheint weiterhin nur bei einem neuen Abschluss; Wiederaufnahme erzeugt keine alten Toasts. Farbe bleibt ein reiner Spielhinweis und erzeugt keinen Push. Verdeckte Prämien bleiben auch in zugänglichen Labels verborgen.

## Visuelle Spielhinweise 1.17.2

Kurze Bonus-/Farbabschlussmeldungen sind ausschließlich sichtbare Spiel-UI. Die neue gemeinsame Gestaltung und Du-Grammatik ändern keine Push-Erlaubnis, Versandart, Wiederholungen oder Quittungsauswertung. Verdeckte Bonus-/Abschlusspunkte bleiben auch im Toast verborgen; Farbe/Bonus erzeugen weiterhin keinen Push.

Ab 1.17.0 erhalten ausgestiegene Personen keine neuen Zug-, End- oder Revanchehinweise für die verlassene Partie. Ein letzter aktiver Sieger kann den bestehenden Endhinweis erhalten. Bonusfelder, Mine und Gastgeberwechsel erzeugen keine neue Push-Art; globale Begrenzung und erneute Prüfung bestehender Ereignisse bleiben erhalten.

## Ereignisse und Zustimmung

Benachrichtigungen werden nur auf ausdrücklichen Wunsch aktiviert und bleiben standardmäßig lautlos. Ein eigener Zug erzeugt einmal eine Gelegenheit für Würfeln und anschließende Auswahl. Nach Spielende gibt es einen neutralen Hinweis. Eine tatsächlich gestartete Internet-Revanche informiert die anderen Teilnehmenden einmal, auch wenn sie noch nicht dran sind. „Noch einmal spielen“ führt erst in die Lobby und verschickt allein noch keinen Hinweis. Joins, Reaktionen, Farben, Spalten, Raumnamen und Tageswechsel erzeugen keine Pushs.

Solange ein Farbfeld-Fenster sichtbar ist, bleiben automatische Hinweise aus. Schon gesehene Gelegenheiten werden nicht später nachgemeldet. Ein globales Minutenlimit und ein gemeinsamer Notification-Tag begrenzen die Menge. Namen, Punkte, Spielblätter und Zugangsdaten gehören nicht in den Sperrbildschirmtext.

## Transporte und Berechtigungen

Internet-Räume verwenden RFC-8291-verschlüsselten, VAPID-signierten Web Push mit `aes128gcm` und hoher Dringlichkeit. Spielaktionen werden vor dem Versand verbindlich gespeichert; Benachrichtigungsfehler dürfen diese Aktionen nicht scheitern lassen. Geräte-/Raumbindungen verlangen den passenden persönlichen Zugang. Mehrere autorisierte Räume teilen dieselbe Geräte-Subscription und globale Grenzen.

Der Browser-Push-Dienst darf einen Hinweis bis zu 24 Stunden vorhalten. Der Worker prüft vor Anzeige den tatsächlichen Raum und das konkrete Ereignis erneut. Erledigte Züge, neue Partien, fehlender Zugang und Fristablauf bleiben still. Alte Schema-1-Worker erhalten das bisherige kurze `expiresAt` zusätzlich; die längere Zustellfrist benötigt ein aktuelles PWA-Update.

Im Offline-Direktmodus kann eine noch laufende WebRTC-Verbindung lokale Hinweise erzeugen. Das hält Android oder den Browser nicht dauerhaft im Hintergrund aktiv. Solo, Computer und Ein-Handy-Partien erhalten keine externen Spielhinweise.

## Revanche ab 1.15.0

Der Host-Rematch merkt die alte Spielkennung, der nächste bestätigte Start erzeugt eine neue Kennung mit `rematchOf`/`rematchBy`. Nur ein aktiver Worker mit `rematch-push-v1` erhält die neue Art; `notification_devices.rematch_ready` beginnt bei 0. Alte Clients behalten ihre eigenen Zug-/Ende-Hinweise. Beide Apps normal aktualisieren und einmal öffnen, ohne neue Berechtigungsanfrage.

Ein eigener Zug hat Vorrang. Die Revanche-Meldung bleibt bis zur ersten eigenen Auswahl in Wurf 1 aktuell. Ein schon angenommener erster Zug ersetzt eine noch vorgemerkte oder verspätet empfangene Startmeldung. Eine schnelle Revanche während des Minutenlimits wird vorgemerkt. Fällige Arbeit wird durch normale Serveraktionen oder einen vom jeweiligen Betreiber eingerichteten Wartungslauf aufgenommen, ohne neuen Clienttimer und ohne Zusage eines Versands exakt nach 60 Sekunden.

## Persistenz, Wiederherstellung und Aufräumen

Die Outbox speichert Aufträge vor der Raumantwort. Bis zu drei kurze unmittelbare Versuche, insgesamt höchstens vier, behandeln vorübergehende Netzwerk-/Zeitfehler, HTTP 429/5xx oder ausdrücklich quittierte Prüf-/Anzeigefehler vor Anzeige. `Retry-After` wird respektiert. Providerannahme ohne Browserquittung wird nicht erneut verschickt.

Vor jedem Versuch werden Mitgliedschaft, Bindung, Opt-in, Endpunkt, Ereignis und Ablauf geprüft. Der Worker prüft die aktuelle Gelegenheit innerhalb eines Push-Ereignisses höchstens zweimal mit je fünf Sekunden Frist. Eine persistente Anzeige-Reservierung sowie vorhandene native Notifications schützen auch über einen Worker-Neustart vor Duplikaten. Fehlgeschlagene Anzeigen verbrauchen das Ereignis/Minutenlimit nicht.

Ein unsichtbarer Start oder eine verspätete `clear`-Nachricht darf keine ungelesene Meldung schließen. Client und Worker prüfen Sichtbarkeit getrennt. Explizites Abschalten darf vorhandene Meldungen schließen.

Der feste Wartungs-POST mit leerem JSON-Objekt kann nur gespeicherte aktuelle Aufträge wiederaufnehmen; er nimmt keine Ziele oder Texte entgegen. Eine globale Minuten-Lease und maximal zwölf Aufträge begrenzen den Lauf. Ein separates GET meldet Bereitschaft und letzten Wartungszeitpunkt. Wiederkehrende Wartung muss für eine eigene Installation separat eingerichtet werden.

## Diagnose

**Geräteanzeige testen** prüft nur die lokale Anzeige. **Internet-Push testen** sendet ausschließlich an die anfragende autorisierte Installation und darf im Vordergrund erscheinen. Tests teilen das Minutenlimit und sind kurz gültig. **Push-Status prüfen** liest den authentifizierten Status samt höchstens zwanzig eigenen Verlaufseinträgen; keine automatische Abfrageschleife.

Unterscheiden:

- **Providerannahme**: Der Push-Dienst hat den Request akzeptiert.
- **Browser-Anzeigeanforderung (`shown`)**: Der Anzeigeaufruf war erfolgreich; kein Nachweis eines sichtbaren Sperrbildschirms oder menschlichen Lesens.
- **Registriertes Antippen**: Die Notification wurde angeklickt; dies ist keine allgemeine Lesebestätigung.

Pro empfangenem Push gibt es höchstens einen begrenzten Quittungs-POST, ohne neue Wiederholungsschleife. Ein fehlgeschlagener Quittungsaufruf verhindert die Anzeige nicht. Diagnoseprojektionen enthalten keine Subscriptions, Endpunkte, Namen, Punkte oder Geheimnisse. Der Verlauf ist pro Gerät begrenzt; Aufträge bleiben nur innerhalb ihrer Gültigkeit versendbar. Geräte-/Raumlöschung entfernt abhängige Einträge.

Die Tests verwenden ausschließlich synthetische Räume, frische Schlüssel und lokale/ersetzte Push-Empfänger. Android-Anzeige, Akkuverwaltung und reale Hintergrundzustellung sind gesondert auf echten Geräten zu prüfen.

## Offline-Testprotokoll und Minen

Das lokale Testprotokoll lädt keine Daten hoch und versendet keine Hinweise. Die optionale Computer-Mine ist eine lokale Spielvariante ohne neue Push-Art oder automatische Nachricht. Offline-Direktverbindungen behalten ihre bisherigen Hintergrundgrenzen.
