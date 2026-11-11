# Offline-Testprotokoll für zwei Handys

<!-- farbfeld-version: 1.19.3 -->

## Hotspot-Rückmeldung 11. November 2026

Zusätzlich zur bestätigten Wiederkopplung hat der Nutzer zwei offline befindliche Handys über einen direkten WLAN-Hotspot gekoppelt und eine Direktpartie erstellt, ohne Internet. Die genaue installierte Version wurde nicht genannt. Dies bestätigt Kopplung/Erstellen in diesem konkreten Aufbau; vollständige Partie, Hintergrundbetrieb und zuverlässige automatische Erholung nach jedem Netzabbruch sind getrennte Prüfschritte. Die neue lokale Verwerfen-Option und der Beitrittsdialog werden gesondert geprüft.


## Nutzerrückmeldung 11. November 2026

Auf OnePlus Open/7T konnte eine bestehende Partie erneut gekoppelt werden. WLAN-Abschalten wurde als Verbindungsverlust erkannt; einmal konnte die Partie unmittelbar fortgesetzt werden, einmal war Wiederkopplung nötig. Die genaue installierte Version und neue Diagnoseberichte wurden nicht angegeben. Dies bestätigt vorhandene Wiederaufnahme, keine Garantie automatischer Erholung bei jedem Abbruch. Hotspot ohne Internet bleibt offen. Zusätzlich gemeldet: wartende Person sah Würfel erst nach der ersten Auswahl; 1.19.2 korrigiert die Anzeige bereits vorhandener öffentlicher Würfeldaten. Physische Abnahme dieser Anzeige steht separat aus.


## Recovery diagnostics 1.17.4

The bounded local-address fallback is logged as candidate-fallback without addresses or SDP. Find the test recorder under Einstellungen → Hilfe & Diagnose → Offline-Testprotokoll; it also stays available in pairing screens. Preserve both reports before starting a new numbered test. Device checks distinguish usable fallback candidates from full collection completion.

Das lokale Testprotokoll hilft, Gerätevorbereitung, QR-Kopplung, tatsächlichen Verbindungsaufbau und Spielabgleich getrennt zu untersuchen. Es repariert eine Verbindung nicht selbst und ist kein Nachweis physischer Android-/Hotspot-Kompatibilität. Die bisherige **Offline-Verbindung prüfen → Prüfergebnis kopieren** bleibt als separater Einzelgerätetest erhalten.

## Kurzer Testlauf

1. Beide PWAs aktualisieren und **Offline bereit** abwarten. Eine App-Ansicht pro Handy verwenden. Modelle, Betriebssystem- und Browserversionen gesondert notieren; die automatische Browserangabe ist nur eine grobe Erkennung, keine vollständige Geräteauskunft.
2. **Einstellungen → Hilfe & Diagnose → Offline-Testprotokoll** öffnen. Derselbe Zugang steht in den Offline-Kopplungsdialogen, auch bei einem Fehler. Auf einem Handy **A**, auf dem anderen **B** wählen, auf beiden dieselbe **Testnummer** und dieselbe Netzbeschreibung einstellen. „Hotspot von A“ bezeichnet den Netzgeber, nicht automatisch den Spielgastgeber.
3. Auf beiden **Aufzeichnung starten**. Zur Kopplung zurückkehren, A erstellt die Partie, B scannt das Angebot und A die Antwort. Beide Apps offen lassen. Genauen letzten erfolgreichen Schritt und Fehlermeldung notieren.
4. Bei Erfolg Classic mit offenen Punkten starten und drei Runden spielen. Würfel, Runde, aktive Person, bestätigte Züge und Punkte vergleichen.
5. Bei Erfolg im normalen WLAN mit einem Hotspot ohne mobile Daten wiederholen. Wenn es scheitert, zunächst bei gleichem Hotspot nur die Spielgastgeberrolle tauschen. Netzgeber und Spielgastgeber sind getrennte Variablen. Wiederverbindung/kurzer Hintergrundaufenthalt erst danach separat prüfen.
6. Nach Erfolg oder Fehler auf jedem Handy **Aufzeichnung stoppen** und **Bericht als JSON exportieren** wählen. Beide Dateien zusammen mit der Testbeschreibung teilen. Der alternative Knopf **Bericht kopieren** kopiert denselben JSON-Inhalt; bei fehlendem Clipboard-Zugriff erscheint ein manuell kopierbares Textfeld. Aktuelle Verbindungsstatistiken werden beim Export nach Möglichkeit zusätzlich gelesen; bereits geschlossene Kanäle können keine solchen Werte mehr liefern.

Ein leerer Browser-Berechtigungsstatus oder eine nicht unterstützte Statistik allein ist kein Verbindungsfehler. Ein erfolgreicher Einzelgerätetest bestätigt keine Verbindung zwischen beiden Handys. Den tatsächlichen Kanalzustand und Verlauf prüfen; ein Internet-/onLine-Hinweis ersetzt dies nicht.

## Inhalt und Grenzen

Die Aufzeichnung ist standardmäßig aus und ausschließlich lokal unter `farbfeld.direct.diagnostics.v1`, getrennt von Spielständen und Backups. Sie hält höchstens 300 Ereignisse und läuft höchstens 30 Minuten. Ältere Ereignisse werden mit einem Zähler begrenzt. Das Ende wird beim nächsten Ereignis/Zugriff erkannt, ohne zusätzlichen Hintergrundtimer. Der Bericht bleibt nach Stoppen oder Neuladen verfügbar und wird spätestens beim nächsten Zugriff mehr als 24 Stunden nach Teststart gelöscht. „Neuen Test starten“ ersetzt nur das alte Protokoll. „Nur Protokoll löschen“ lässt Spiele, Präferenzen, Raumzugänge und Direktzugänge unverändert.

Ereignisse enthalten feste Kategorien für QR-Fortschritt, Angebot/Antwort, RTC-/ICE-/Datenkanalzustände, Authentifizierungs-/Spielabgleich, Nachrichtenart, angeforderte Aktion, Spielrevision/Runde, Pause/Wiederherstellung und Sichtbarkeit. Das Empfangen einer Nachricht bedeutet noch nicht, dass die Aktion akzeptiert wurde; bestätigte Revisionen und Bereitschaft stehen separat im Verlauf. Die Protokollierung verändert keine Regeln, Würfel, Spielaktionen, Verbindungskonfiguration oder Protokollversion.

Alle exportierten Daten werden über eine feste Positivliste projiziert. Keine Namen, Punkte, Kreuze/Spielblätter, Spiel-/Raum-/Sitzungskennungen, Zugangsschlüssel, SDP, QR-Inhalte, ICE-Passwörter, IP-Adressen, Ports, mDNS-Namen, SSIDs, Roh-Nachrichten, freien Notizen oder rohen Fehlertexte. Lokale Kandidaten erscheinen nur als Anzahl/UDP-Anzahl und mDNS-Boolean. Optional verfügbare Verbindungsstatistiken enthalten ausgewählte Zustände, Kandidatentyp/Protokoll, Übertragungszähler und Laufzeit. Sie werden nur bei ausdrücklichem Export mit kurzer Frist gelesen, nicht periodisch gesammelt. Es gibt keinen automatischen Upload, Push oder zusätzlichen Netzwerk-Poller.

Fehler beim Diagnose-Speichern oder beim Statistiklesen dürfen eine Partie nicht pausieren. Bei blockiertem/vollen Speicher bleibt das aktuelle Protokoll im Arbeitsspeicher exportierbar; nach App-Schließen kann es fehlen. Ein entsprechender Hinweis erscheint im Dialog. Aufzeichnung und Export bleiben freiwillig.

## Exportformat

Format `farbfeld-offline-diagnostics`, Schema 1. Felder: `appVersion`, gemeinsamer Exportzeitpunkt (`exportedAt` in UTC und menschenlesbar `exportedAtVienna`), grobe Browser-/Plattformangabe, PWA-/HTTPS-Status, `storageAvailable`, `capture` mit A/B/Testnummer/Netz/Start/Ende/begrenzten Ereignissen, aktuelle bereinigte `session`-Metadaten und `connections`.

Dateiname: `YYYYMMDD_Farbfeld_OfflineDiagnose_A_Test1.json` bzw. B. Das Präfix stammt aus dem lokalen Kalenderdatum derselben Date-Instanz wie `exportedAt`. A/B und Testnummer werden vom Nutzer ausgewählt; sie sind keine Personen- oder Geräteidentität. Zwei Berichte werden anhand dieser Angaben, Zeitpunkten und Revisionen verglichen. Geräteuhren können voneinander abweichen; deshalb zusätzlich Ereignisfolge und Revisionen beachten.

## Prüfung

Regressionen decken Opt-in, Eingabegrenzen, Positivlisten auch nach manipuliertem lokalen Diagnoseinhalt, Geheimnis-/Adressausschluss, Zeit-/Größenbegrenzung, Stoppen/Löschen/Neuladen, Speicherfehler, Statistikfehler/-timeout, verspäteten Export nach neuem Test und Unveränderlichkeit des Spielstands ab. Zwei simulierte Session-Clients prüfen QR-Kopplung, Revisionen und Wiederherstellung ohne Signalisierungs-HTTP. Der reale `DirectConnection`-Adapter wird mit einer instrumentierten RTC-Schnittstelle geprüft. Gerenderte Browserprüfung und physische Tests mit zwei Android-Handys sind zusätzliche, getrennt zu dokumentierende Nachweise.
