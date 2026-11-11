# Responsive QA

<!-- farbfeld-version: 1.19.4 -->

## Prüfumfang 1.19.4

Reine Umordnung der drei vorhandenen Zusammen-Schaltflächen: Internet – Spielraum, Offline – mehrere Handys, Ein Handy weitergeben. Keine CSS-/Geometrie-, API-, Speicher- oder Spielregeländerung. JavaScript-Syntax, TypeScript und Dokumentationsguard in beiden Quellen geprüft; Produktionsbuild vor Veröffentlichung. Die letzte vollständige Regression gehört zu 1.19.3 (434 Fälle), sie wird für diese reine Reihenfolgeänderung nicht erneut als neuer Testlauf ausgegeben.

Die verwaltete lokale Vorschau ist aktuell durch Keep Score belegt; die Browseransicht lieferte dessen 404 statt des eigenen Prüfdokuments. Der fremde Preview wurde unverändert gelassen. Deshalb keine neue simulierte Handy-/Tablet-Matrix für diesen Durchgang. Reihenfolge und drei Einstiege werden nach Veröffentlichung im bestehenden Live-Browser geprüft, ohne eine Partie zu starten. Physische Geräteabnahme separat.



## Prüfumfang 1.19.3 — 11. November 2026

Beide Quellen bestanden 434 Regressionen einschließlich des echten DirectSession.forget-Pfads für pausierte Zweier-/Sechserpartien, Gastgeber/Gast, ausstehende Aktionen, verbundene normale −10-Verlassen-Option, veraltete Sitzungs-/Spielbestätigung und Speicherfehler. Die Beitrittsprüfungen erfassen Namensreihenfolge/-Escaping, aufklappbare Code-/Hilfefelder, Zurück mit erhaltenem Namen und gespeicherten lokalen Verwerfen-Zugang. TypeScript, beide API-Integrationen und Dokumentationsguard bestanden; Produktionsbuild wird vor Veröffentlichung geprüft.

150 tatsächliche Browseransichten: neun Beitritts-/Beenden-/Bestätigungszustände in den zwölf verbindlichen Größen plus 380×650, 381×651, 759×800 und 760×800; zusätzlich der Beitritt in allen sechs Designs bei 393×851. Keine horizontale Seiten-/Dialog-/Titel-/Aktionsüberbreite, alle sichtbaren primären/sekundären Textaktionen mindestens 44 Pixel hoch. Neue, gespeicherte und aufgeklappte Codekopplung sowie pausierte Gastgeber/Gäste, Sechser-Gastgeberwarnung und bereits ausgestiegene Person geprüft.

Tatsächlich durchgeklickt: Codealternative öffnen und ungültige achtstellige Eingabe abweisen, Beenden → lokal verwerfen → Zurück mit erhaltener Partie, erneut Beenden → Verwerfen → zusätzliche Bestätigung → Startseite ohne Direktkarte. Der UI-Test verwendet lokale synthetische DirectGame-Zustände und keine Produktivpartie. Unit-Prüfungen verifizieren gespeicherte Entfernung und Fehlerverhalten unabhängig davon; kein erfundener gemeinsamer Ausstieg, Statistik-/RNG-Eingriff oder neuer Transport.

Separates Nutzerfeedback bestätigt nun zusätzlich Kopplung und Erstellen einer Direktpartie auf zwei offline befindlichen OnePlus-Handys im direkten WLAN-Hotspot ohne Internet. Genaue installierte Version nicht angegeben. Vollständige Hotspot-Partie, Hintergrund, zuverlässige automatische Erholung nach jedem Verlust sowie physische Abnahme der neuen Beitritts-/Verwerfen-Oberfläche bleiben eigenständige Prüfschritte.



## Prüfumfang 1.19.2 — 11. November 2026

Beide Quellen bestanden 423 Regressionen einschließlich fünf neuer Fälle mit dem echten DirectGame-Abgleich und dem tatsächlichen Vorschaurenderer. Geprüft wurden zwei/sechs Personen, Gastgeber- und Gastwürfe jeweils vor der ersten Auswahl, offene/verdeckte Blätter, unveränderte Würfel/Revisionen bei unerlaubtem Frühzug, normale Freigabe nach erster Bestätigung sowie Pause, ausstehende Bestätigung, Inspektion und eigener bestätigter Zug. TypeScript und beide Raum-/Kopplungs-API-Integrationen bestanden; Beide Produktionsbuilds und der Dokumentationsguard bestanden.

134 tatsächliche lokale Browseransichten: acht Direktzustände in den zwölf verbindlichen Größen plus 380×650, 381×651, 759×800 und 760×800; zusätzlich wartende Vorschau in allen sechs Designs bei 393×851. Keine horizontale Seiten-/Vorschauüberbreite, sechs sichtbare Würfel nur in den passenden Warteständen, keine interaktive oder schwebende Vorschau. Der tatsächliche UI-Ablauf vor Wurf → Vorschau unmittelbar nach Wurf → drei freigegebene Farbwürfel nach erster Bestätigung → eigener Passzug und nächste Würfelberechtigung wurde durchgeklickt. Der Test verwendet echte DirectGame-Zustandsnachrichten über einen lokalen synthetischen Transport, keine physische WebRTC-Verbindung.

Nutzerfeedback vom 11.11. bestätigt separat die Wiederkopplung einer bestehenden OnePlus-Partie und Verlustdetektion nach WLAN-Abschalten; automatische Erholung gelang einmal direkt, einmal mit neuer Kopplung. Genaue installierte Version nicht angegeben. Neue Vorschau auf beiden Handys und Hotspot ohne Internet bleiben physisch zu prüfen. Keine produktiven Spiele oder Push-Nachrichten für diese Prüfung verändert.



## Prüfumfang 1.19.1 — 11. November 2026

Reine Layout-/Beschriftungsänderung. Beide Quellen bestanden 44 relevante bestehende Regressionen (room-book, room-status, view-state und direct-ui), JavaScript-Syntaxprüfung und TypeScript. Dokumentationsguard und Produktionsbuild werden vor Veröffentlichung erneut geprüft; keine API-, Speicher- oder Spielmechanikänderung.

124 tatsächliche Browseransichten synthetischer lokaler Prüfdaten: sieben Zustände (wenige/viele Partien, Alle Räume, Start-/Gesamtliste mit sechs langen Namen, leer und offline) in allen zwölf verbindlichen Viewports sowie 380×650, 381×651, 759×800 und 760×800; zusätzlich Start-/Gesamtansicht in allen sechs Designs bei 393×851. Kein horizontaler Seiten-/Dialog-/Kartenüberlauf, höchstens drei Startkarten und zehn Gesamteinträge. Vollständige Namen, Gastgeber, Status und neutrale Themenfläche bleiben erhalten, Öffnen/Entfernen mindestens 44×44 Pixel.

Bedienung im Browser: Entfernen-Symbol öffnet die vorhandene Bestätigung; Abbruch behält alle 52 Einträge. Code-Suche findet genau einen Raum; Offline-Filter zeigt lokale und direkte Partie; Weiter wechselt auf Seite 2 von 6. Der Sortier-Erklärungstext entfällt. Die Startkarten messen im Zweier-Test 88 Pixel Höhe. Browserdaten und CSS-Viewports ersetzen keine physische Handyabnahme. Keine Produktivpartie oder Push-Nachricht für diese Prüfung verwendet.



## Prüfumfang 1.19.0

418 Regressionen, beide API-Integrationen und TypeScript bestanden. Neue Fälle prüfen die feste Drei-Karten-Grenze, Zugpriorität, vollständige Pagination über 50 Internet- und zwei Offline-Partien, Namens-/Code-/Personensuche, Filter-/Seitengrenzen sowie begrenzte optionale Teilnehmercaches und den aktuellen Gastgeber nach Rollenwechsel. Der Raumindex gibt Namen/Gastgeberflags nur nach tokenbezogener Autorisierung aus; Blätter, verdeckte Werte und Zugangsdaten bleiben ausgeschlossen. Reine Übersicht ändert weder Spielrevision noch Spielstand.

Gerenderte synthetische lokale Ansichten in allen zwölf verbindlichen Viewports plus 380×650, 381×651, 759×800 und 760×800: jeweils drei gemischte Partien, 52 Partien, Alle Räume, leer und ausschließlich offline (80 Ansichten). Maximal drei Startkarten und zehn Übersichtseinträge, volle Modus-/Teilnehmernamen, kein horizontaler Seiten-/Dialog-/Karten-/Seitennavigationsüberlauf. Suchfeld, Filter, Liste und Seitennavigation bei hohen Viewports getrennt; niedrige Querformate bleiben vollständig scrollbar. Versteckte Öffnen-Texte sind am jeweiligen Knopf verankert und vergrößern den äußeren Dialog nicht.

Tatsächliche UI-Aktionen zusätzlich: Seite 1 → 2, Suche eines Raums außerhalb der Startvorschau, Offline-Filter mit lokaler und direkter Partie, Personenfilter und erhaltener Suchfokus. Im 52-Partien-Fall drei eigene Zuggelegenheiten sichtbar und vier weitere gezählt. Gastgeberanzeige im Browser mit Schriftgewicht 800 und ♛ geprüft. Keine Produktivräume oder Pushs für Tests verwendet. Dies sind Browseransichten lokaler Prüfdaten; physische Handyabnahme bleibt separat. Neue Spielideen aus der begleitenden Recherche wurden nicht implementiert.

## Prüfumfang 1.18.0

411 automatisierte Regressionen, TypeScript sowie Raum-/Kopplungs-API-Integrationen bestanden. Neue Fälle prüfen optionale und alte namenlose Direktstände, Normalisierung/48-Zeichen-Grenze, Gastgeberrecht, gesonderte Namensrevision, unveränderte Würfel/Spielrevision/RNG/eigene Auswahl, ausstehende Zugbestätigungen, veraltete Metadaten, atomaren Speicherfehler und denselben Namen nach Wiederkopplung des gespeicherten Platzes. Kein neuer Signalisierungsaufruf durch Umbenennen.

112 tatsächliche Browser-Renderings synthetischer lokaler Direktstände in den zwölf verbindlichen Größen sowie 680×650 und 681×651: je aktive Zweier-/Sechserpartie, pausierte Sechsergruppe, Gastansicht, Startkarte, Einrichtung, Namensdialog und Beenden-Bestätigung. Keine horizontale Seiten-/Dialog-/Titelüberbreite. Hosttitel mit Stift, Gasttitel ohne Bearbeitungsaktion, Startkarte ohne Verlassen-Menü. Lange Partienamen umbrechen vollständig; eigene Titel-/Steuerzeilen und kompakte Verbindungsdetails bleiben erhalten.

Zusätzlich im Browser tatsächlich Sofa-Runde gespeichert: Wurf 4, Spielrevision 12 und markiertes Feld H1 blieben unverändert. Beenden öffnet den ausdrücklichen −10-/Niederlage-Dialog; bei sechs Personen erklärt der Gastgeberhinweis das benötigte Relay. Getrenntes Namensfeld mit 48 Zeichen und Rückkehr aus der WLAN-Hilfe mit erhaltenem Namen geprüft. Keine produktiven Räume oder Pushs benutzt. Physische Namens-/Wiederkopplungsprüfung auf Android steht separat aus.

## Validation 1.17.4

Shared source: 402 automated regression tests, both API integrations and TypeScript passed. The actual app renderer was exercised in twelve required sizes plus 680×650 and 681×651: connected/paused with two/six players, saved session with two/six players, and settings, totaling 98 rendered synthetic views. No horizontal page/dialog overflow, broken direct-title word, oversized session card or game-exit action in Settings. Connection details expose disconnect. These are browser renderings with synthetic data; physical Android recovery and offline hotspot testing remain separate.

## Prüfumfang 1.17.3

397 Regressionen einschließlich zweier neuer Prüfungen des tatsächlichen Karten-Renderers bestanden. Sie prüfen alle fünf Modi, alte Abschlüsse nach zwölf weiteren Runden und JSON-Wiederaufnahme, verdeckte Prämien, Minenverlust, sofortige Übertragung des Erstbonus und erneuten Abschluss ohne doppelte Karten. Raum-/Kopplungs-API-Integration und TypeScript bestanden.

Synthetische Sechserpartie in der verwalteten Vorschau: alle sechs Farbabschlusskarten aus Wurf 1 bleiben bei Wurf 20 und nach Betätigen von „12 Würfe später“ bei Wurf 32 vorhanden. Alle zwölf verbindlichen CSS-Viewportgrößen wurden gerendert, jeweils sechs sichtbare Karten, keine horizontale Seiten- oder Kartenüberbreite. Lange Spielernamen umbrechen vollständig. Hochformat verwendet die Karten über dem Blatt, kompaktes Querformat dasselbe Karten-Rendering im scrollbaren Seitenpanel.

Verdeckte Partie bei 393×851: Namen und Farben sichtbar, null Prämienwerte oder Punkte-Labels in den Karten. Dies sind real gerenderte eingebettete CSS-Viewports mit lokalen synthetischen Spielständen, keine physischen Handys und keine produktiven Raumaktionen. Spielregeln, Push und Bildschirmsperrverhalten werden nicht geändert. Physische Android-Abnahme bleibt separat.

## Release 1.17.2

Alle zwölf verbindlichen Größen gerendert geprüft: neutraler gemeinsamer Hintergrund von Wurf, Punktkarten, Minen und Bonus; transparente Zugzeile; kein horizontaler Seiten- oder Statuskartenüberlauf. Mine gesperrt/bereit/verbraucht sowie Sechsergruppe mit langen Namen jeweils in zwölf Größen; Symbol 32 Pixel, Hilfe/Zünden 44 Pixel, Leiste 58–60 Pixel. Bonuskarte geschlossen 62 Pixel inklusive Rand, Kopfzeile 60 Pixel; 0/1/3 Entdeckungen und nativer aufklappbarer Verlauf geprüft. Die reduzierte Bewegung bleibt in den vorhandenen Effekten erhalten.

Sechser-Gleichstand bei 320 Pixeln: vollständige Namen umbrechend im Verlauf, keine Karte breiter als der Viewport. Verdeckte Partie: keine Farb-/Bonus-Prämien, auch nicht in Labels; Gegnerknöpfe gesperrt, eigener Punktestand verborgen, eigene Schadensanzeige mit vier markierten Zellen vorhanden. Spielende gibt die Werte wieder frei; Ergebnis in allen zwölf Größen ohne Überlauf und mit neutraler Grundfläche. Alle sechs Designs bei 393×851 auf gemeinsame Flächen geprüft; klassische Brettfarben bleiben unverändert.

Tatsächliche lokale UI-Aktionen: sechs Personen, Random + Minen + Bonusfelder + verdeckte Punkte ausgewählt und gestartet; Übergabe zeigt nur das eigene Blatt. Dieselben Schalter in Direkt- und Internet-Lobby benutzt und gestartet, Random-/Minen-/Bonus-/Verdeckungsstatus im Spiel bestätigt. Direkttransport dabei lokale Protokollsimulation, Internetoberfläche mit ausschließlich lokaler Vorschauantwort; die echten API-/Autoritäts- und Speicherregeln prüfen separate In-Memory-D1-/Direktregressionen für zwei/sechs Personen und Wiederaufnahme. Ältere Direktfähigkeiten sperren Random/Minen/Bonus korrekt. Keine Produktivräume oder Test-Pushs verwendet.

Gerenderte Belege mit synthetischen lokalen Testständen verbleiben in der gehosteten Quelle; keine physischen Handys. Physische Zwei-Handy-/Hotspot- und Balanceabnahme bleiben separat.

## Release 1.17.1

Nutzerscreenshot reproduziert: Bei 393 Pixeln war jede Brettkachel nur 63 Pixel breit, die alte mobile Zeilenregel erzwang jedoch eine 112-Pixel-Vorschau und schob auch den Namen aus der Kachel. Die Prüfung auf Dokumentüberlauf allein erkannte diesen internen Fehler nicht. Jetzt wird jeder Vorschau-/Namensrand sowie jede der 105 Vorschauzellen gegen die jeweilige Kachel geprüft, einschließlich beschriftetem Random und sichtbarem Auswahlzustand.

Alle zwölf verbindlichen Größen plus 420/421 und 540/541 Pixel sowie die vier Kombinationen aus 680/681 Breite und 650/651 Höhe geprüft (20 Ansichten): Seite und Dialog ohne horizontalen Überlauf, alle Kachelinhalte enthalten; zwei Spalten bis 540 Pixel, vier darüber, 44-Pixel-Schließen. Auswahl aller vier Namen aktualisiert die richtige Beschreibung. Solo- und Sechser-Ein-Handy-Startdialog zusätzlich bei 393×851 geprüft; keine Partie gestartet oder vorhandene bestätigt verworfen.

Minenleiste: Gesperrt, Bereit, Verbraucht und Sechsergruppe jeweils in allen zwölf Größen gerendert geprüft. Symbol immer 24×24 innerhalb eines festen 32-Pixel-Feldes, außerhalb der scrollbaren Namen; Höhe 58–60 Pixel, Hilfe 44 Pixel. Zünden bleibt am rechten Rand ohne Überschneidung erreichbar. Keine spielerische Änderung; 50 relevante bestehende Minen-/Gruppen-/PWA-Regressionen bestanden. Synthetische lokale Spielstände, keine Produktivraumaktionen oder zusätzlichen Test-Pushs. Physische Android-Touch-/Hotspot- und Balanceabnahme bleibt separat.


## Release 1.17.0

**390 automatisierte Regressionen** decken die gemeinsame Implementierung ab. Regel-/Direkt-/Raumtests prüfen sechs Gegnerplätze, Miss/Hit je Gegner, unveränderten Schützen, einmalige Kosten, Bonus-Gleichstände, chronologische Erstansprüche, Gastgeberwechsel, letzten negativen Sieger, gleichzeitige/alte Aktionen, Relayverlust und Wiederaufnahme. Raum-/Kopplungs-API und TypeScript bestanden. Kein Produktivspiel und keine Testnachricht an Nutzergeräte.

Gerenderte lokale Vorschau am 09.11.2026: Einrichtung mit vier Brettkacheln und drei ausgerichteten Optionen, Sechsergruppe mit langen Namen, kompakte Minenleiste, verdeckter Ziel-Dialog und Einpassen in **allen zwölf** unten gelisteten Größen geprüft. Dokument-Scrollbreite entspricht jeweils Clientbreite. Checkboxen 22×22; Koordinatenauswahlen 46 Pixel; Zünden 52–68 Pixel hoch. Minenleiste 58–60 Pixel hoch. Einpassen: Scroll-/Clientbreite identisch und rechter Rand der O-Zelle innerhalb der Fläche; etwa bei 393×851 exakt 324/324 statt vorher 328/324. Kleine Felder beim Einpassen sind erwartbar; Zoom/Koordinatenauswahl bleiben verfügbar.

Im Browser bestätigt: echte lokale Computer-Farbvollendung löst Mine-bereit-Hinweis aus; dreisekündige Explosion und sichtbare Schadensmarker, kein gegnerischer Schaden in verdeckter Ziel-/Nachansicht (105 gedruckte Zellen, null Kreuze), Random mit identischen 105 Farben nach Neuladen, Sechser-Bonus mit kompakter gemeinsamer Meldung. Fünf bestätigte Ausstiege lassen die letzte Person trotz −20 gegenüber −10 gewinnen. Zweierfall zeigt −22 als Sieg, einen einmaligen −10-Ausstieg sowie getrennten Siegerdatensatz im gemeinsamen Verlauf; Neuladen/wiederholter Datensatz verdoppelt nichts. Handy-/Tablet-Messungen erfolgen in einem real gerenderten eingebetteten CSS-Viewport, keine physische Telefonemulation. Physische Android-Touch-/WLAN-/Hotspot-, Hostrelay- und Balanceabnahme bleiben separat.



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
