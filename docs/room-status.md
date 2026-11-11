# Raumstatus, Zuganzeige und Wartezeit

<!-- farbfeld-version: 1.19.3 -->

## Lokaler Direktzugang

Verwerfen einer Direktpartie setzt keine Verbindung voraus und entfernt ihre Startkarte erst nach erfolgreicher lokaler Speicherung der Entfernung. Wiederkoppeln bleibt eine separate Möglichkeit zur Fortsetzung. Raum-/Local-/Computerzugänge und deren Status werden nicht gelöscht.


## Direktwurf im Wartestatus

Warten vor der ersten Direktwahl zeigt den tatsächlichen gemeinsamen Wurf als nicht interaktive Vorschau mit Name der aktiven Person. Zugrechte und Verbindungsstatus bleiben getrennt; ein gespeicherter oder pausierter Wurf wird nicht als neue Spielgelegenheit ausgegeben. Internet-Raumdarstellung unverändert.


## Kompakte Statusdarstellung

Modus und aktueller Status bleiben getrennte Informationen: der Modus steht in der Metazeile, der Zug-/Verbindungsstatus darunter. Eigene Spielgelegenheiten erhalten eine feine dunkle Kontur und lesbaren Status statt großer Farbflächen. Keine zusätzlich sichtbare Erklärung der Sortierung; die Priorisierung selbst bleibt unverändert.


## Modus, Namen und begrenzte Startvorschau

Modus und Verbindungsstatus sind getrennt: Online · Internet-Raum, Offline · Direktpartie und Offline · Dieses Handy bleiben unabhängig von Empfang oder Kanalzustand. Höchstens drei Startkarten, bekannte eigene Zuggelegenheiten zuerst; weitere offene Züge als Anzahl. Alle Räume zeigt alle Partien mit lokaler Suche/Modusfilter und zehn Einträgen pro Seite. Die Namensliste stammt aus dem autorisierten Index oder dem eigenen Offline-Stand; fett/♛ markiert den tatsächlichen Host. Alte Caches zeigen bis zur nächsten normalen Antwort keine erfundenen Namen.


## Benannte Direktpartien

Der gemeinsame Name ist kein Verbindungsnachweis. Verbindungspunkte und Neu-koppeln-Zustand kommen weiter vom tatsächlichen Direktkanal. Die Startkarte nennt den gespeicherten Namen, Spielerzahl/Wurf und Verbindungsstatus; sie öffnet nur den vorhandenen Stand.

## Direct status 1.17.4

Compact direct status is above the player strip; expandable details hold Disconnect. Paused games expose re-pairing. Real transport/authenticated state determines connection status, never Internet reachability. Hidden status labels cannot widen the document when their players scroll out of view.

Ausgestiegene werden als **Partie verlassen · −10 Punkte** angezeigt und nicht mehr als am Zug. Die laufende Gruppe behält feste Indizes; Online-Präsenz ist weiterhin getrennt vom freiwilligen Ausstieg. Internet-Gastgeberwechsel ist atomar, Offline-Gastgeber bleibt Relay. [Regeln](leaving.md).

Ein gestarteter Internet-Rematch kann ab 1.15.0 einen einmaligen Hintergrund-Push an die anderen Teilnehmenden auslösen. Das ist kein zusätzlicher Präsenz-/Lobbyabruf; Polling und Pause im Hintergrund bleiben unverändert. Die neue Art verlangt den aktualisierten Worker und verwendet die bestehende Outbox samt konkreter Eventprüfung.

## Neben dem Spielernamen

Internet-Spielräume und Direktpartien zeigen einen kleinen Verbindungsindikator neben dem Namen, auch in der Lobby. Grün bedeutet online/verbunden, Grau offline, eine gestrichelte Kontur noch nicht bestätigt. Der Status ist zusätzlich als Tooltip und für Bildschirmleser beschriftet. Solo, Computer und mehrere Personen an einem Handy erhalten keine erfundenen Netzwerkzustände.

Im Internet-Spielraum bedeutet **Online**, dass das Mitglied kürzlich eine authentifizierte Verbindung zum Raum hatte. Nach 90 Sekunden ohne Rückmeldung gilt es serverseitig als offline. Der nächste Abruf des betrachtenden Handys übernimmt dies; die Anzeige ist keine sofortige WLAN-Messung. Nach Verlust der eigenen Serververbindung wird der eigene Punkt offline, fremde Zustände werden unbekannt. Ein alter grüner Stand bleibt nicht unbegrenzt gültig.

Im Direktmodus stammen die Punkte aus `DirectGame.connected(pid)` und damit aus authentifizierten WebRTC-Verbindungen. Der Ausfall des Internets allein macht eine funktionierende lokale Verbindung nicht grau. Bei pausierter Gruppe bleiben die tatsächlich verbundenen Personen einzeln erkennbar.

## Auf der Startseite

Die Karte des gespeicherten Raums zeigt **Du bist dran · würfeln** oder **Du bist dran · Felder wählen**, sobald die eigene Aktion erlaubt ist. Sie wird hervorgehoben und bietet **Weiterspielen**. Ansonsten nennt sie die wartende/aktive Rolle, bestätigte Züge, Lobby oder Spielende. Ohne frische Serverantwort erscheint kein ungesicherter eigener Zughinweis. Verdeckte Punkte bleiben verborgen.

Ab 1.9.7 folgt direkt unter dem Raumnamen die gemeinsame Zeile **Raumcode · Spielerzahl**. Die Anzahl stammt aus der vorhandenen Mitgliederliste; ohne bestätigte Liste wird vorerst nur der Code gezeigt. Der Status folgt separat: „Du bist dran“ und ein kleiner Zusatz für „würfeln“/„Felder wählen“, jeweils ohne Wortumbruch innerhalb der Phrase. Ein 44 × 44 CSS-Pixel großer Pfeil zum Öffnen/Weiterspielen steht rechts neben diesen Angaben, auch auf dem Handy. Die zusätzliche breite Button-Zeile entfällt; kleinere Abstände reduzieren die Kartenhöhe. Der Pfeil bleibt per Tastatur erreichbar und für Bildschirmleser beschriftet. Lange Namen dürfen umbrechen; Code und Status konkurrieren nicht um dieselbe Textzeile. Unveränderte Statusabfragen ersetzen dieses Markup nicht und erzeugen keine erneute Live-Ankündigung.

Der Heimabruf führt selbst keinen Zug aus. Fertige Spiele werden auch dort mit der eigenen Mitgliedskennung erfasst; das Gästehandy darf dabei nicht zur ersten Person umgedeutet werden. Statistik bleibt lokal und nach Spiel-ID dedupliziert.

## Platz im laufenden Spiel

Ab 1.9.5 bleibt der vollständige Raumname lesbar: Im Hochformat bekommt er eine eigene breite Titelzeile, die Bedienelemente stehen darunter. Ab 1.9.7 stehen Raumcode und Spielerzahl unmittelbar unter dem Titel in derselben Überschriftengruppe. Im kompakten Querformat bleibt diese Metazeile sichtbar; die Gruppe steht über Spielerchips und Bedienelementen. Der ursprüngliche Gastgeber kann weiterhin über den Namen umbenennen; die Versionsnummer bleibt in der sichtbaren Kopfzeile erhalten.

Die Zugmeldung ist eine kleine Statuszeile ohne große Hintergrundbox. Nach bestätigtem eigenem Internet-/Direktzug steht dort **Dein Zug ✓** und wer noch dran ist; bei mehr als zwei wartenden Personen eine kompakte Anzahl. Der vollständige ursprüngliche Text bleibt für Bildschirmleser verfügbar, die Spielerchips zeigen weiterhin die einzelnen Rollen. Im engen Querformat bleiben diese Chips die sichtbare Zuganzeige.

Nach einem bestätigten Netzwerkzug wird das nicht mehr bedienbare Würfelpanel ausgeblendet. Dadurch überdeckt es im Hochformat nicht länger das Blatt; auch der dafür reservierte Leerraum entfällt. Verbindungsfehler, ausstehende Direktbestätigungen, Fremdblätter und das Gastgeberrecht zum Überspringen behalten ihre gesonderten Bedienelemente. Spielregeln und Abrufhäufigkeit bleiben unverändert.

## Fehlende Person überspringen

Ausschließlich der ursprüngliche **Raumersteller/Gastgeber** darf diese Funktion verwenden. Gäste erhalten weder einen Knopf noch eine serverseitige Freigabe. Das gilt auch nach Ablauf der Wartezeit und für manipulierte/ältere Clients.

Die Funktion erscheint erst nach **mindestens 24 Stunden ohne Spielaktion** während einer laufenden Auswahl. Der Server setzt den Zeitpunkt bei Start, Würfeln, bestätigtem Zug/Passen und erfolgreichem Überspringen. Damit liegt die Freigabe stets frühestens 24 Stunden nach dem letzten Zug; ein neuer Wurf kann die Wartezeit zusätzlich neu beginnen lassen. Abrufe, Online-Meldungen, Umbenennen oder App-Neustarts verschieben sie nicht. Jede erfolgreiche Überspring-Aktion zählt als Passen und beginnt die Wartezeit neu. Es gibt keine automatische Ausführung.

Der Server prüft Gastgeberrolle, erwartete Raumversion, Wartezeit und die normale Zugberechtigung der Engine. Ein Knopf aus einer alten oder inzwischen überholten Ansicht umgeht keine Sperre. Für laufende Altpartien ohne Zeitstempel wird beim ersten neuen Abruf einmalig ein Zeitanker gesetzt; die App behauptet keinen rekonstruierten Zeitpunkt eines alten Zuges.

## Akku und Abrufhäufigkeit

Der Online-Status hat keinen eigenen HTTP-Abfragekreis. Die Daten kommen mit den Spielstandabfragen. Es gibt nur einen adaptiven, seriellen Raum-Timer; Rendern/Antippen erzeugt keine zusätzlichen Timer.

| Situation im sichtbaren Client | Automatischer Abstand |
| --- | --- |
| Startseite, bekannte laufende Raum-Partie | 60 Sekunden |
| Startseite ohne laufende Partie | kein Timer; einmal beim Öffnen/Rückkehr bzw. Nutzeraktion |
| Eigener Zug / eigenes Würfeln | 30 Sekunden |
| Warten auf anderen Zug, gerade aktiv | 6 Sekunden |
| Warten seit 30 Sekunden / 2 Minuten / 10 Minuten | 15 / 30 / 60 Sekunden |
| Lobby / Ergebnis im Raum | 15 / 30 Sekunden |
| Verbindungsfehler | 30 / 60 / maximal 120 Sekunden; Startseite mindestens 60 |
| Verborgene App, kein Netz, lokales Spiel oder Direktmodus | keine Raum-HTTP-Abfragen |

Neue Sichtbarkeit, Internet-Rückkehr und explizites Öffnen/Prüfen können sofort einmal abgleichen. Das ist von den periodischen Abständen zu unterscheiden. Ein Raum-Request endet spätestens nach zwölf Sekunden. Präsenz wird pro Mitglied höchstens alle 30 Sekunden in D1 fortgeschrieben; identische Statusabfragen erhöhen keine Spielversion. Inaktive oder ungültige Raumzugänge erzeugen keine endlose schnelle Wiederholung.

Die vorhandene optionale Push-Präsenz ist ein eigener Mechanismus zur Unterdrückung von Benachrichtigungen bei sichtbarer App; sie wird durch diese Statuspunkte weder neu aktiviert noch häufiger abgefragt. Direktverbindungen nutzen ihre bestehenden WebRTC-Heartbeats und keine Status-API. Konkreter Akkuverbrauch wurde nicht auf physischen Handys gemessen.

## Speicherung und Kompatibilität

Migration `0004_curious_young_avengers.sql` ergänzt ausschließlich `room_presence`: Raum, Mitglieds-ID, letzte Rückmeldung und Ablauf. Das Gerät muss seinen vorhandenen Raumzugang vor jedem Statuszugriff nachweisen. Fremde Statuszeilen und Zugangsschlüssel werden nicht ausgeliefert. Alte Räume und ältere Clients bleiben kompatibel; auch ihre normalen authentifizierten Abrufe werden erkannt.

Präsenz ist von Raum-JSON und Zugversion getrennt. Speicherfehler dieser Tabelle lassen Spielzüge weiterhin zu und liefern unbekannten Status. Ablaufzeilen werden beim nächsten erfolgreichen Präsenzschreiben bereinigt; ein Löschen des Raums entfernt die zugehörigen Zeilen. `lastActionAt` liegt als optionales Raum-Metadatum außerhalb der Engine. Spiel-/Backup-Schema und Direktprotokoll bleiben unverändert. Das neue Offline-Modul `room-status.js` wird vollständig lokal gecacht.

## Prüfung

Tests prüfen Zeitablauf und Wiederverbindung einzelner Mitglieder, fehlende Tabelle, Schreibdrossel, unveränderte Zugversionen, WebRTC-Teilgruppen, Rollen/Zugwechsel auf der Startkarte, unbekannte/verdeckte Ansichten, die genaue 24-Stunden-Grenze, ausschließliches Gastgeberrecht, neue Wartezeit nach Aktion sowie Altpartien ohne Zeitanker. Timerprüfungen decken Hintergrundstopp, inaktive Startseite, Fehler-Backoff und wiederholtes Rendern ohne zusätzliche Abfragen ab.

Version 1.9.5: 33 vorhandene Anzeige-/Status-/PWA-Tests und Produktionsbuild bestanden. Auf der veröffentlichten Site mit zwei eigenen Testzugängen geprüft: langer Titel, separate Startkartenzeilen und eigener Auswahlstatus, Bestätigung/Passen, kompakte 22-Pixel-Statuszeile ohne gesperrtes Würfelpanel sowie Rückkehr aktiver Würfel bei einer neuen eigenen Gelegenheit. Die Testpartien wurden abgebrochen und die Testzugänge im Browser ausgeblendet; Nutzerpartien wurden nicht verändert. Startkarte (private QA screenshot omitted) · Spielkopf (private QA screenshot omitted).

Die Live-Prüfung erfolgte im verfügbaren Desktop-Browser. Schmale Hoch-/Querformatansichten konnten in dieser Browserumgebung nicht separat visuell geprüft werden; die responsive CSS-Anordnung ist implementiert, eine echte Android-Abnahme bleibt offen. Die Screenshots sind keine Handy- oder Hardware-Abnahme.

Automatisierte Datenbanktests verwenden die tatsächliche API-Route mit sämtlichen SQL-Migrationen in SQLite. Die neue Migration wurde zusätzlich erfolgreich über den lokalen D1-CLI angewendet. Insgesamt bestehen 185 Regressionstests, einschließlich der korrekten Window-Bindung nativer Timer.

Statuspunkte neben beiden Spielernamen in Version 1.9.1 (private QA screenshot omitted)

Hervorgehobene Startkarte bei eigener Zugberechtigung (private QA screenshot omitted)

Die verwaltete lokale Browser-Vorschau war nicht erreichbar; die spätere Browserprüfung erfolgte auf der veröffentlichten Site mit eigenen Testdaten. Physische Android-/Akku-Abnahme bleibt offen. Aus den bestandenen Timer- und API-Tests folgt keine gemessene Akkulaufzeit.

Eine geschlossene App verlängert keine Vordergrund-Lease. Neue eigene Züge können daher auch nach einer Stunde Abwesenheit per Server-Push gemeldet werden. Ab 1.9.8 gilt beim Push-Dienst eine maximale Zustellfrist von 24 Stunden; aktuelle Rolle und ungelesenes Ereignis werden vor Anzeige erneut geprüft. Dies ändert weder den Online-Punkt noch den adaptiven Abrufplan und führt keine regelmäßigen Erinnerungen ein. [Details](notifications.md).

Version 1.9.7 wurde auf der veröffentlichten Site mit zwei eigenen Testzugängen geprüft: Karten-Metazeile enthält zwei Personen, der rechte Pfeil öffnet den Raum per Enter, seine Fläche misst 44 × 44 CSS-Pixel. Die eigene-Zug-Karte misst bei Desktopbreite rund 97 Pixel Höhe; im Spielkopf beginnt die Metazeile 3 Pixel unter dem Titel. Raumkarte (private QA screenshot omitted) · Spielkopf (private QA screenshot omitted). Diese Desktopprüfung bestätigt kein reales Android-/Querformatgerät.

## Kopfzeile ab 1.9.9

Im Handy-Hochformat stehen Zurück und Titel/Code in einer gemeinsamen oberen Zeile. Darunter teilen sich Wurfzähler, Punkteübersicht und Beenden die gesamte Breite ohne leere Rasterfelder. Die Beschriftungen erleichtern das Erkennen der beiden Aktionen; alle drei Bereiche sind mindestens 44 CSS-Pixel hoch. Nach Spielende teilen sich Wurf und Punkte die Breite. Die bestehende kompakte Querformat-Anordnung bleibt erhalten. Regel- und Zugstatuslogik ändern sich nicht. Jede Layoutänderung folgt der [Handy-/Tablet-/Desktop-Prüfmatrix](responsive-qa.md).

1.9.9: Im separat geprüften Desktop-Browser (1363 × 936) blieben der volle Name, der 3-Pixel-Abstand zur Metazeile, Punkteöffnung per Enter und die Abbruchbestätigung erhalten. Nachweis (private QA screenshot omitted). Dies ist keine Handy-/Tablet- oder Hardwareabnahme; die [Prüfmatrix](responsive-qa.md) nennt die offenen Ansichten.

Die Querformatkorrektur in 1.9.10 hält Würfel, Zughinweis und Bestätigung im normalen Fluss. Bei wenig Höhe scrollt die rechte Box gemeinsam. Die kompakte Wartezeile, Spielerrollen und Netzwerkberechtigungen bleiben unverändert.

Verpasste Emoji-Reaktionen werden ab 1.9.10 mit den ohnehin nötigen Raumantworten verarbeitet, auch nach dem ersten Öffnen. Aufbewahrung und Anzeigecursor verändern weder Präsenzstatus, Zugversion, Überspringfrist noch den adaptiven Timer. [Emoji-Anzeige](reactions.md).

Emoji-Effekte in 1.10.0 verändern weder Zugstatus, Anwesenheit, Spieluhr noch Abrufintervalle. Größere Reaktionen und neue Flugbahnen werden innerhalb der vorhandenen Ereignisse übertragen.

1.10.1: Emoji-Touch-Versand und vorübergehende Eingabesicherung bleiben vollständig von Präsenz und Raumabfragen getrennt. Keine neuen API-Polls, Hintergrund-Timer, Spielversions- oder Uhrenänderungen.

1.10.2: Ein Raum ist unabhängig von Online-Status oder alter `expires_at`-Frist dauerhaft wiederverwendbar. Präsenz speichert einen eigenen Termin sieben Tage nach letzter erfasster Rückmeldung; Online bleibt 90 Sekunden, Schreibabstand 30 Sekunden. Die Bereinigung betrifft nur Präsenz, keine Räume oder Spielstände. Nach Ablauf der Präsenzaufbewahrung erscheint „Unbekannt“ bis zum nächsten echten Abruf. Kein zusätzlicher HTTP-Aufruf oder Keepalive-Timer. Die 24-Stunden-Skip-Uhr hängt weiter ausschließlich von Spielaktionen ab.

## Sammelübersicht und letzte Nutzung ab 1.11.0

Die Startseite zeigt mehrere gespeicherte Räume mit eigenen Zughinweisen; eigene Spielgelegenheiten stehen zuerst. Ein begrenzter Sammelabruf liefert nur kompakte autorisierte Metadaten, keine Blätter oder laufenden Punkte. Höchstens eine automatische Anfrage pro Minute für die gesamte Startseite bei bekannten laufenden Spielen, keine Hintergrund-/Offline-/Idle-Lobby-Schleife. Manuelles „Status aktualisieren“ ist davon getrennt. Der gerade geöffnete Raum verwendet denselben einen adaptiven Scheduler wie zuvor.

Nutzungszeit für die vierzehntägige Bereinigung ist ausdrücklich von Präsenz und dem letzten echten Spielzug für Skip getrennt. Öffnen/Rückkehr und akzeptierte Aktionen verlängern; passive Abfragen, Push und Gerätezustand nicht. Daten, deren Frist nur verstrichen ist, bleiben zugänglich, bis die begrenzte Bereinigung sie tatsächlich entfernt. Andere gespeicherte Zugänge werden durch einen fehlenden/entfernten Raum nicht gesperrt. Legacy-Räume erhalten eine volle Schonfrist.

1.11.2 ergänzt keine periodische Diagnoseabfrage: Der Internet-Test ist eine ausdrückliche Einzelaktion. Ein empfangener Push erzeugt höchstens eine begrenzte Gerätequittung; offene Einstellungen erhalten deren Ergebnis lokal vom Worker, geschlossene Geräte zeigen es später auf manuellen Abruf. Raumindex, Präsenzintervalle und 24-Stunden-Skip-Uhr bleiben unverändert.

