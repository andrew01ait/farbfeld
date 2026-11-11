# Emoji-Reaktionen

<!-- farbfeld-version: 1.19.2 -->

## Direktwurf 1.19.2

Würfelvorschau und Reaktionen bleiben unabhängig. Gesten, Empfänger, Kanal und Ereignisversionen unverändert.


## Raumkarten 1.19.1

Die neue Kartendichte und Metazeile ändern keine Reaktionsdaten, Ziele, Transportwege oder Gesten.


## Gespeicherte Raumübersicht

Teilnehmernamen und Gastgeberkennzeichen sind nur Übersichtsdaten. Suche/Filter/Seiten ändern keine Reaktionsadresse, Empfänger oder Anzeige-Cursor. Keine neue Abfrage oder Benachrichtigung.


## Kompatibilität mit Direktnamen

Der gemeinsame Name ändert keine Teilnehmerkennung, Reaktionsadresse oder Direktverbindung. Reaktionen bleiben am bestehenden authentifizierten Kanal und der laufenden Partie gebunden.

## Direct recovery 1.17.4

Compact connection details and re-pairing keep the existing direct player identities and reaction transport. Direct reactions still require the actual live channel. No push or new signaling request.

Revanche-Hinweise ab 1.15.0 betreffen ausschließlich den tatsächlichen Neustart einer Internet-Partie. Reaktionen, Emoji-Flüge und deren Empfängerwahl lösen weiterhin keine Pushs aus; Fähigkeiten und Übertragung der fünf Reaktionen bleiben unverändert.

Zehn aufeinanderfolgende Taps auf die Versionsnummer schalten auf diesem Gerät den **☺-Knopf neben Einpassen** frei. Nur die sendende Person muss freischalten; jede empfangende Person sieht die Reaktion ohne eigenen Senden-Knopf. Auswahl: 😘, 💩, 😂, 👍, 😲. Bei mehreren Gegnern gezielt oder an alle senden. Die Animation dauert ungefähr 3,2 Sekunden; reduzierte Bewegung zeigt das Emoji stationär.

## Zusätzliche Symbole ab 1.12.0

👍 „Daumen hoch“ und 😲 „Staunen“ nutzen dieselben Größen, Bewegungen, Empfänger, Deduplizierung und Haltegesten. Fünf mindestens 44 Pixel breite Knöpfe stehen in einem umbrechenden Dreispaltenraster. Für die zwei neuen Symbole müssen Empfänger sowie ein möglicher Direkt-Gastgeber 1.12.0 mit `reactions-extra-v1` öffnen. Fehlende Bestätigung führt zu einer verständlichen Updatehilfe; die drei bisherigen Reaktionen brauchen weiterhin nur `reactions-v1`. Ein bestehender Raum muss nicht ersetzt werden: normale authentifizierte Abrufe melden die neue Fähigkeit. Die Empfangsanzeige braucht weiterhin keine Freischaltung.

## Internet-Spielraum

Seit 1.9.10 wird die neueste für die empfangende Person bestimmte Reaktion je Absender bis zu **24 Stunden** in derselben Partie bereitgehalten. Sie erscheint auch beim ersten normalen Raumabruf nach Öffnen. Mehrere verpasste Reaktionen derselben Person werden auf ihre neueste verdichtet. Es fliegen höchstens drei zugleich; weitere Absender folgen, wenn Plätze frei werden. Keine Emoji-Pushs und keine zusätzlichen Hintergrundabfragen.

Der lokale Anzeigecursor speichert nach der Anzeige Ereignis-ID, Zeit sowie Raum-/Partie-/Empfänger-/Absenderkennung. Bereits angezeigte Ereignisse bleiben nach einem Neustart stumm. Eine noch versteckte App hakt zurückkehrende Raumantworten nicht ungesehen ab. Bis zu 64 aktuelle Cursor bleiben lokal, ältere/abgelaufene werden entfernt. Keine Namen, Spielzüge oder Zugangsschlüssel; nicht im Spielbackup enthalten. Bei gesperrtem oder vollem Gerätespeicher bleibt nur sitzungslokale Deduplizierung möglich.

Die empfangende App muss mindestens **1.9.10** öffnen. Ältere Versionen verwerfen weiterhin den ersten Abruf. Vor der Korrektur bereits verfallene/gelöschte Reaktionen können nicht nachträglich wiederhergestellt werden. Reaktionen aus anderen Räumen, alten Partien oder nach 24 Stunden werden nicht angezeigt. Eine neue Partie im selben Raum beginnt mit einer neuen Kennung.

## Direktspiel und ein Handy

Der Offline-Direktmodus überträgt Reaktionen weiterhin live über den vorhandenen WebRTC-Kanal. Diese Änderung führt dort keine Server-Warteschlange ein und weckt keine komplett geschlossene App. Beim gemeinsamen Handy bzw. Computer bleibt die lokale Anzeige erhalten. Senden verändert keinen Spielzug oder Punktestand.

## Prüfung

209 Tests einschließlich neuem Server-/Overlay-Schutz bestanden: erster Abruf; eine Stunde Abwesenheit; Neustart; spät eintreffende ältere Ereignisse; getrennte Empfänger; fünf Absender mit höchstens drei Flügen; Verbergen; Raum-/Partiewechsel; 24-Stunden-Grenze; ungültige Werte; Speicherfehler; Versandabstand und idempotente IDs. Raum- und Kopplungs-API-Integrationen sowie TypeScript erfolgreich. Die Abwesenheitszeit wird mit kontrollierter Uhr simuliert; dies ist kein Test auf zwei echten Android-Handys.

## Gedrückt halten, Größe und Bewegung

Ab 1.10.0: Ein kurzer Tap sendet Normalgröße. Beim Halten zeigt der Knopf die wachsende Größe; nach 1,25 Sekunden 1,75-fach, ab 2,5 Sekunden maximal 2,5-fach. Loslassen sendet einmal. Außerhalb loslassen oder das Fenster verbergen bricht ab. Enter/Leertaste funktionieren entsprechend. Die Darstellung passt sehr große Emojis zusätzlich an die verfügbare Bildschirmfläche an.

Die App wählt zwischen geradem Flug, Hüpfen und Looping. Zwei unmittelbar aufeinanderfolgende Sendungen wählen unterschiedliche Bewegungen. Alle Empfänger bekommen dieselbe Größe und Bewegung; im Raum bleibt beides mit der verpassten Reaktion erhalten. Alte Reaktionen ohne Effektdaten bleiben normal. Für den vollständigen Effekt alle Beteiligten auf 1.10.0 aktualisieren; ältere Direkt-Gastgeber können die Zusätze noch ignorieren.

220 Tests sowie Raum-/Kopplungs-API-Integrationen und TypeScript bestanden, einschließlich Pointer-/Tastaturhalten, Obergrenze, Abbruch, einzelner Vorschaukette, Bewegungswechsel, manipulierten Metadaten, spätem Empfang, direkter Weiterleitung und additiver Migration. Die Browserprüfung von 1.9.10 zeigte bereits eine Reaktion beim Öffnen eines zuvor geschlossenen Empfängerfensters und keine Wiederholung bei erneutem Neustart. Das ist eine Prüfung mit eigenen Testzugängen im selben Browser, keine physische Android-Abnahme.

## Veröffentlichte Browserprüfung 1.10.0

Am 4. November 2026 nach dem normalen PWA-Update von 1.9.10 auf 1.10.0 mit zwei eigenen Spielerzugängen geprüft: 2,5 Sekunden gedrückt halten sendet einmalig; ein zuvor geschlossenes Empfängerfenster erhält beim nächsten Öffnen `scale: 2.5`, `motion: fly` und das gewählte Lachen. Nach erneuter Seitenladung und bestätigtem Raumabruf waren keine weiteren Flüge vorhanden. Die neue Anleitung und Auswahl wurden sichtbar geprüft (Browserbild (private QA screenshot omitted)). Eigene Testpartie danach abgebrochen und lokale Raumzugänge entfernt. Kein Zugriff auf bestehende Nutzerpartien.

Die Metadaten wurden während des tatsächlichen Empfangs am sichtbaren DOM geprüft. Ein flüchtiger Flug ließ sich im gespeicherten Browserbild nicht zuverlässig erfassen; das Bild zeigt daher die Auswahl und keine behauptete Momentaufnahme des Fluges. Native Android-Berührung, Handy-/Tablet-Viewport und Hotspot bleiben getrennte offene Geräteprüfungen.

## Touch-Korrektur 1.10.1

Der bisherige Gesture-Controller stellte beim Loslassen nur eine Größe bereit; erst ein nachfolgender Klick leitete den Versand ein. Ein gezielter Regressionstest ohne diesen Folge-Klick reproduzierte ausbleibenden Versand für kurze und lange Touch-Gesten. 1.10.1 sendet direkt auf `pointerup`/`keyup`. Nachfolgende Klicks werden einmal abgefangen, einschließlich auf den Hintergrund umgeleiteter Klicks nach Dialogschluss. Kein zweiter Versand; eine neue Eingabe startet unabhängig. Reine Bedienhilfen-Klicks bleiben unterstützt.

Die App zeigt den laufenden Versand und sperrt parallele Sendungen. Fehler werden angezeigt und die Auswahl wieder freigegeben. Grenzen, Vorschau, Abbrechen, Empfänger, Effekte und Serverregeln bleiben erhalten. 224 Tests sowie Raum-/Kopplungsintegration, JavaScript und TypeScript bestanden. Neue Fälle: kein Folge-Klick, echte Pointer-Capture-Freigabe samt Lost-Capture-Ereignis, nachfolgender/umgeleiteter Klick, frische Eingabe, deaktiviertes/entferntes Element, weitere Finger und Tastatur. Der fehlende Folge-Klick wurde simuliert; die konkrete Android-Ereignisfolge auf dem Nutzerhandy ist damit nicht aufgezeichnet. Physische Android-Abnahme bleibt offen.

Nach Veröffentlichung 1.10.1 im vorhandenen Browser geprüft: normales PWA-Update von 1.10.0; kurzer 80-ms-Klick (empfangen: Kuss, Größe 1,05, Hüpfen); 2,5-Sekunden-Halten (empfangen: Lachen, Größe 2,5, Flug). Jeweils zwei eigene Spielerzugänge, Empfängerfenster während des Versands geschlossen und beim Neustart empfangen. Nach erneutem Empfängerneustart kein weiterer Flug. Eigene Partie danach abgebrochen und lokale Zugänge entfernt. Auswahl in 1.10.1 (private QA screenshot omitted). Das Browserwerkzeug bedient einen Mauszeiger; echte Android-Touch-Ereignisse sind weiterhin nicht geprüft.

1.10.2: Die dauerhafte Raumlebensdauer verlängert keine Emoji-Frist: weiterhin neueste passende Reaktion je Absender, höchstens 24 Stunden und nur in derselben Partie. Keine rückwirkenden Flüge aus alten Partien und keine neue Abfrage.

1.11.0: Reaktionen des ausgewählten Raums werden auch mit der Sammelübersicht beim ersten Startseitenabruf empfangen. Andere Räume behalten ihre Reaktion bis zum Öffnen innerhalb der bestehenden 24 Stunden. Keine gesammelte Flut über alle gespeicherten Räume. Scopes bleiben Raum/Partie/Spieler; Raumwechsel ändern keine bereits gesehenen Ereignisse. Die Bereinigung eines tatsächlich gelöschten Raums entfernt dessen Serverreaktionen.

