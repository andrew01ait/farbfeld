# Responsive QA

<!-- farbfeld-version: 1.15.0 -->

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
