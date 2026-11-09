# Responsive QA

<!-- farbfeld-version: 1.16.0 -->

## Prüfumfang 1.16.0

Neue scrollbare Offline-Diagnose mit A/B-/Test-/Netzauswahl und Export, optionale Computer-Startregel, Minenleiste und blindes Zielraster mit zusätzlichen 44-Pixel-Koordinatenauswahlen.

Gerenderte lokale Vorschau am 09.11.2026: beide neuen Dialoge in allen zwölf unten gelisteten Handy-/Tablet-/Desktop-Größen geprüft; Dokumentbreite entspricht jeweils Scrollbreite, kein horizontaler Seitenüberlauf. Diagnose zusätzlich bei 680×650 und 681×651 geprüft. Koordinatenauswahl 46 Pixel, Diagnosefelder 46–51 Pixel, Mine-zünden-Fläche 52–68 Pixel hoch. Das 15-spaltige Raster ist auf kleinen Handys bewusst fein; die größeren Spalten-/Zeilenauswahlen bieten präzise Bedienung. Dialoge bleiben vertikal scrollbar.

Echter lokaler JSON-Download und Neuladen/Stoppen bestätigt. Neue Computerpartie mit Auswahl an und aus sowie Übernahme nach Ersatzbestätigung geprüft. Synthetischer offener Treffer: Farb-/Spaltenbonus fällt weg, offene Sterne und fünf Punkte Einsatz werden sofort angezeigt. Zusätzlicher Transferfall im Browser: eigene Spalte 2→3 und Farbe 3→5, Gesamt −9→−11 einschließlich fünf Punkten Einsatz; Computer verliert beide Boni. Leeres Ziel neben belegten Feldern: Gegnerübersicht vor/nach exakt gleich, eigene fünf Punkte abgezogen. Verdecktes Raster enthält alle 105 gedruckten Felder und null gegnerische Markierungen; Bestätigung zeigt weder Trefferzahl noch zerstörte Positionen. 339 automatisierte Tests einschließlich sechs kompletter Minenpartien auf allen drei Brettern, beide API-Integrationen und TypeScript bestanden.

Die Vorschau verwendet lokale synthetische Spiele; keine Produktivräume oder Test-Pushs. Das ist keine physische Android-Touch-/WLAN-/Hotspot-, Hintergrund- oder Minenbalance-Abnahme. Die zwei echten Handys werden mit der [A/B-Testanleitung](offline-diagnostics.md) separat geprüft.


## Verbindliche Größen

| Gerät | Hochformat / schmale Ansicht | Querformat / breite Ansicht |
| --- | --- | --- |
| Kleines Handy | 320 × 568 | 568 × 320 |
| Android kompakt | 360 × 800 | 800 × 360 |
| Android typisch | 393 × 851 | 851 × 393 |
| Android groß | 412 × 915 | 915 × 412 |
| Tablet | 768 × 1024 | 1024 × 768 |
| Desktop | 1366 × 768 | 1440 × 900 |

Auch die Übergänge 680/681 Pixel Breite und 650/651 Pixel Höhe prüfen. Schriftvergrößerung auf dem Handy zusätzlich ansehen. Die festen Größen sind Prüfziele und keine Zusage bestimmter Hardwareunterstützung.

## Zustände und sichtbare Kriterien

1. Startseite: Raumkarte mit kurzem und langem Namen, Code und 1/2/6 Personen, eigener Zug, Warten und fehlende Verbindung. Rechter Pfeil erreichbar, keine abgeschnittenen Angaben und keine zusätzliche breite Button-Zeile.
2. Spielkopf: voller 48-Zeichen-Raumname, Code/Personen direkt darunter. Keine unbesetzten Steuerungsflächen. Zurück, Punkte, Teilen und Abbruch erreichbar, soweit in dieser Ansicht vorgesehen; globale Teilen-Aktion bleibt im Hochformat vorhanden.
3. Zwei und sechs Personen: Spielerchips dürfen innerhalb ihrer Liste scrollen; sie dürfen weder Seite noch Steuerung verbreitern. Eigene Rolle, tatsächlich handelnde Personen und Verbindungspunkte bleiben erkennbar.
4. Würfeln, eigene Auswahl und Jokerwahl: Farb-/Zahlenwürfel, Hinweis, Passen und Bestätigen erreichbar. Feste Handy-Würfel überdecken keine dauerhaft unerreichbaren Inhalte; reservierter Platz folgt der tatsächlichen Panelhöhe. Kein horizontaler Seitenüberlauf; bewusstes Scrollen im Brett/Spielerstreifen ist erlaubt.
5. Bestätigter eigener Zug, Fremdblattanzeige, Verbindungsfehler und Spielende: richtige Steuerung, keine leere Abbruchspalte am Ende, keine gesperrten Würfel über dem Blatt während des Wartens.
6. Einpassen und Pinch-Zoom nach Rotation: alle sieben Brettzeilen proportional; keine gequetschten Felder. Solo, Computer, Ein-Handy, Internet-Raum und Direktmodus berücksichtigen. Standard und saisonales Design ansehen.

## Prüfnachweis

Für jede Größe und jeden betroffenen Zustand tatsächliche Methode festhalten: Quelltext-/CSS-Prüfung, gerenderter Browser mit gesetztem Viewport oder physisches Gerät. Ein großer Desktop-Screenshot beweist kein Handy- oder Tablet-Layout. Eine zugeschnittene Aufnahme ändert den CSS-Viewport nicht und gilt nicht als Handytest. Nicht mögliche Prüfungen bleiben ausdrücklich offen; Screenshots mit Größe, Zustand und Version benennen. Testdaten von Nutzerpartien trennen.



Private historical screenshots are omitted from this source snapshot. The publication itself changes no game layout; a copy/export check is not a fresh rendered-device certification.
