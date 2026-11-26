# Priorisierte Spielideen

<!-- farbfeld-version: 1.34.2 -->

## Freigabe am 18. November 2026

Der Nutzer hat die bereits eingeführte Schatzsuche mit Hinweisen und versteckte Minen für echte Mehrspielerpartien freigegeben. Schiffe und Minen werden pro Person unmittelbar nacheinander vorbereitet. Die Computer-zuerst-Regel gilt weiterhin für künftige Mechaniken.

## Bestätigte Erweiterung 1.23.0 · versteckte Bonusfelder

Am 12. November 2026 akzeptiert: Warm/kalt-Hinweise plus Schatzketten für die drei versteckten +2-Bonusfelder. Umsetzung zunächst in neu erstellten Computerpartien: minimale orthogonale Entfernung, grobe Fünfspalten-Spur nach einem Fund und +3 zusätzlich bei drei eigenen Funden. Dies ist von der bereits implementierten Priorität 2, den sechs sichtbaren Fähigkeitsfeldern, getrennt. Keine neue menschliche Freigabe; bestehende Multiplayer-Bonusregeln bleiben erhalten. [Verbindliche Regeln](bonus-fields.md).

Stand: 11. November 2026. Prioritäten 1–4 wurden mit Client 1.20.0 gegen Computer erprobt und nach ausdrücklichem Nutzer-OK mit 1.21.0 für menschliche Mehrspieler freigegeben: Schiffsboni, Entdeckermodus, öffentliche Aufträge und Neumischung. [Verbindliche Implementierungsregeln und gewählte Standardwerte](computer-variants.md). Die übrigen Ideen bleiben für später dokumentiert. Die folgende ursprüngliche Planung wird für die zurückgestellten Konzepte erhalten.

## Weitere neue Mechaniken: zuerst gegen den Computer

Alle neuen Spielfeatures werden zuerst ausschließlich im Modus gegen den Computer angeboten und dort ausprobiert. Erst nach ausdrücklichem Nutzer-OK folgt die Freigabe für echte Mehrspielerpartien, einschließlich gemeinsamem Handy, Direktverbindung und Internet-Räumen. Dies gilt auch für Battleship: zunächst Mensch gegen Computer, genau zwei Teilnehmer. Keine automatische Mehrspielerfreigabe aus erfolgreicher Implementierung oder Tests ableiten. Bereits bestehende Mehrspielerfunktionen wie Minen und versteckte Bonusfelder bleiben erhalten.

| Priorität | Idee | Grundgedanke |
| --- | --- | --- |
| 1 | Battleship-Modus (#5) | Schiffe unterschiedlicher Größen auf dem Raster platzieren; Zusatzpunkte für versenkte gegnerische Schiffe. |
| 2 | Entdeckermodus (#1) | Fähigkeiten erst durch Finden auf dem Spielfeld freischalten. |
| 3 | Öffentliche Aufträge (#2) | Zusätzliche gemeinsame Ziele pro Partie. |
| 4 | Regelmäßiger Farbwechsel (#8) | Noch freie Farbfelder nach jeweils fünf vollständig abgeschlossenen Runden neu mischen. |
| 5 | Color Swap (#4) | Die benötigte Farbe des Gegners durch eine begrenzte Fähigkeit verändern. |
| 8 | Farbbrücken (#6) | Besondere verbundene Felder erschließen weitere Bereiche. |
| 9 | Kooperative Expedition (#9) | Als Gruppe Ziele erfüllen, zu denen jede Person beiträgt. |
| 10 | Wachsendes Raster (#7) | Das Spielfeld erweitert sich während der Partie. |

Die Plätze **6 und 7 sind unbesetzt**. Die vergebenen Rangnummern werden beibehalten.

## Neue bestätigte Minenregel und ausgeschlossene Idee

- **Nicht umsetzen:** Challenge-Code (#10).
- **Jetzt spezifiziert und als Nächstes umgesetzt, ohne nachträglich erfundene Rangnummer:** Versteckte Minen (#3), zunächst ausschließlich gegen Computer in 1.22.0. Vor Spielbeginn je zwei Minen bei zwei bis drei Personen, eine je Person bei vier bis sechs. Eigener Besitzer geschützt, bestätigter gegnerischer Zug löst denselben Schaden und dieselbe Neubewertung wie ein Luftangriff aus. Die verfügbare erste Fassung ist die Zweier-Computerpartie; spätere menschliche Freigabe benötigt ein eigenes OK. [Verbindliche aktuelle Regeln](hidden-mines.md).
- Die bisherige Minenfunktion bleibt als **Luftangriff** mit Fluganimation und unveränderten Regeln erhalten.

## Bisher bestätigte Regeln

### 1. Battleship

- Ausschließlich zwei Teilnehmer; Einführung zuerst Mensch gegen Computer.
- Fünf Schiffe pro Teilnehmer, je eines mit 1, 2, 3, 4 und 5 Feldern. Bonus beim vollständigen Versenken entsprechend 5, 4, 3, 2 und 1 Punkt, höchstens 15 Punkte. Einzelne Treffer geben keine Punkte.
- Schiffe liegen gerade, waagrecht oder senkrecht. Keine Überlappung, aber seitliche und diagonale Berührung erlaubt; kein vorgeschriebener Abstand.
- Jedes neu markierte Feld eines bestätigten regulären Farbfeld-Zugs greift dieselbe Koordinate beim Gegner an. Auswahlvorschauen geben keine Trefferinformationen.
- Normale Farbfeld-Wertung und normales Farbfeld-Spielende bleiben maßgeblich. Alle Schiffe zu versenken beendet die Partie nicht vorzeitig.
- Gute, unterscheidbare Treffer- und Versenkt-Animationen gehören zur Umsetzung; erst nach Bestätigung. Versenkte Schiffe bleiben erkennbar.
- Manuelle Aufstellung mit optionaler Zufallsaufstellung und Fixierung nach beiderseitiger Bereitschaft wurden als Bedienung vorgeschlagen; in 1.20.0 umgesetzt.

### 2. Entdeckermodus

- Sechs von Anfang an sichtbare und gezielt ansteuerbare Spezialfelder, je zwei für die drei Fähigkeiten. Gemeinsame Positionen und Belohnungen für die Teilnehmer.
- Jeder Fund ist exklusiv: die erste gültige Zugbestätigung sichert eine Ladung. Für Gegner ist dieses Spezialfeld danach nicht mehr sammelbar. Das normale Farbfeld bleibt dort bespielbar.
- Insgesamt sechs verfügbare Ladungen pro Partie, nicht sechs je Teilnehmer. Gesammelte Ladungen dürfen aufgehoben und gleiche Fähigkeiten gesammelt werden.
- Einsatz frühestens im nächsten eigenen Zug nach dem Fund; höchstens eine Fähigkeit pro Zug. Verbrauch erst mit Zugbestätigung, vorher sichtbare Vorschau.
- **Freie Farbwahl:** Farbe frei wählen, gewählte Würfelzahl bleibt bestehen.
- **Zahl anpassen:** gewählte Zahl um eins erhöhen oder verringern, innerhalb 1 bis 5.
- **Zusatzfeld:** nach dem regulären Zug ein weiteres freies Feld beliebiger Farbe markieren, waagrecht oder senkrecht angrenzend an ein gerade neu markiertes Feld. Normale Wertung. Dort gefundene Fähigkeiten sind ebenfalls erst später nutzbar.
- Keine eigenen Fundpunkte; die Ladung ist die Belohnung.

### 3. Öffentliche Aufträge

- Gemeinsame, ab Beginn sichtbare Aufgaben; drei Aufgaben wurden für die erste Version vorgeschlagen. Der implementierte Katalog steht im Variantenleitfaden.
- Gewählte Wertung: Wettlauf. Erste Erfüllung gibt 5 Punkte, spätere Erfüllung desselben Auftrags durch andere gibt je 2 Punkte. Pro Teilnehmer und Auftrag einmalig.
- Mehrere erste Erfüllungen in derselben Runde erhalten jeweils 5 Punkte.
- Einzelne Aufträge haben eigene, von Anfang an sichtbare Fristen, etwa bis Runde 12; andere können bis Spielende gelten. Der letzte erlaubte Wurf zählt vollständig für alle Teilnehmer. Danach keine weiteren Punkte aus diesem Auftrag; verdiente Punkte bleiben erhalten.
- Fortschritt, verbleibende Runden sowie erfüllt/abgelaufen sollen klar erkennbar sein.

### 4. Regelmäßige Neumischung

- Gewählt ist Neumischung der freien Farben, kein bloßer Tausch zweier Farben.
- Alle fünf vollständig abgeschlossenen Runden, also nach Runde 5, 10, 15 usw.; nicht nach fünf einzelnen Aktionen. Ankündigung/Countdown und kurze Animation wurden vorgeschlagen.
- Markierte Felder behalten ihre Farbe. Sterne, Schiffe und Spezialfelder behalten ihre Koordinaten. Bestehender Fortschritt soll durch das Mischen nicht verloren gehen; freie Farbanzahlen je Brett erhalten.
- Bestätigt: identischer Farbplan beim Start, danach eigener Farbplan je Teilnehmer. Durch die Neumischung dürfen sich die Farbverteilungen zwischen Mensch und Computer unterscheiden. Jeweils alle eigenen freien Felder nehmen teil; markierte Farben und freie Farbanzahlen je Farbe bleiben erhalten. Auch Schaden und Farbwertung müssen den jeweiligen individuellen Plan verwenden. Siehe Minenprüfung unten.

Für Color Swap, Farbbrücken, kooperative Expedition und wachsendes Raster bleiben konkrete Regeln offen. Frühere Aufwandsschätzungen und Beispiele sind keine feststehenden Regeln.

## Minenprüfung zur Kombination mit den neuen Varianten

Die Vorrangregeln für die ersten vier Varianten wurden für den Computertest in 1.20.0 übernommen; die Zeilen zu zurückgestellten Ideen bleiben Vorschläge. Die damalige Bezeichnung Minenangriff meint hier den seit 1.22.0 unveränderten bezahlten Luftangriff; die neue automatische Minenregel steht separat oben. Grundlage sind [bestehende Luftangriffsregeln](mines.md), [Bonusfeldregeln](bonus-fields.md), die gemeinsame [Engine](../public/game/engine.js) und [Brettauflösung](../public/game/boards.js).

### Tatsächlicher Bestand

Eine gewertete vollständige Farbe schaltet die einmalige Mine der anderen aktiven Teilnehmer frei. Ein Angriff vor dem eigenen normalen Bestätigen kostet insgesamt 5 Punkte und prüft dieselbe Zielkoordinate bei allen aktiven Gegnern. Nur ein markiertes Zentrum wird beschädigt: sein Kreuz sowie drei bis fünf zufällig gewählte belegte Nachbarn einschließlich Diagonalen werden entfernt, soweit vorhanden. Leeres Zentrum bedeutet dort keinerlei Schaden. Das eigene Blatt und der normale Zug bleiben erhalten.

Spalten-/Farbabschlüsse werden nach Schaden sofort neu bewertet; Erstboni können auf verbleibende vollständige Halter übergehen. Entfernte Sterne zählen wieder negativ. Freigeschaltete Minen bleiben freigeschaltet und verbrauchte Minen verbraucht. Die drei bisherigen versteckten Bonusfelder sind ein separates Modul: ihre bestätigten Funde und Punkte bleiben auch bei Minenschaden im Fundwurf erhalten. Dies darf nicht stillschweigend auf die neuen exklusiven Entdeckerregeln umgestellt werden.

### Vorrangregeln: erste vier umgesetzt, weitere offen

| Kombination | Vorschlag oder nötige Klärung |
| --- | --- |
| Battleship | Minen löschen reguläre Kreuze, greifen aber nicht die Flotte an. Bestätigte Schüsse/Treffer und Versenkungsboni dauerhaft separat speichern. Entfernte Kreuze und erneutes Markieren dürfen weder Schiffe reparieren noch eine zweite Versenkungsprämie erzeugen. Ein bestätigtes Zusatzfeld löst ebenfalls einen Schuss aus (Implementierungsstandard für den Computertest). |
| Entdeckerfelder | Exklusive Funde und gesammelte/verwendete Ladungen bleiben trotz entferntem Kreuz erhalten. Erneutes Markieren vergibt keine weitere Ladung und macht den Fund nicht für Gegner frei. |
| Öffentliche Aufträge | Vor Erfüllung zählt der aktuelle Brettzustand, damit Wiederauffüllen nicht mehrfach Fortschritt erzeugt. Eine mit dem Zug bestätigte Erfüllung wird bis Rundenende vorgemerkt und bleibt durch späteren Minenschaden erhalten. Einmalige Punkte bleiben; dieselbe Aufgabe wird nicht erneut ausgezahlt. |
| Farbneumischung | Eine Mine entfernt nur die Markierung; die aktuelle Zellfarbe bleibt. Nachfolgende Farbbewertung muss den tatsächlichen Plan des betroffenen Teilnehmers verwenden. Durch die Mine frei gewordene Felder dürfen bei der nächsten vorgesehenen Mischung teilnehmen. Keine zusätzliche Mischung oder Rundenfortschaltung durch Zünden. |
| Color Swap | Die bestehende Mine bleibt eine getrennte Zusatzaktion. Ob Color Swap mit einer Entdeckerfähigkeit im selben Zug kombinierbar sein soll, hängt von der noch offenen Fähigkeitsregel ab. Bestätigte Züge dürfen nicht rückwirkend ungültig werden. |
| Farbbrücken | Noch zu klären: Schaden an einem Brückenfeld. Vorschlag: weitere Brückennutzung erfordert Wiederherstellung; bereits markierte Bereiche hinter der Brücke werden nicht zusätzlich gelöscht. |
| Wachsendes Raster | Ziel und Schaden auf bereits freigeschaltete Gebiete begrenzen; stabile Koordinaten und Zeitpunkt der Erweiterung festlegen. |
| Kooperative Expedition | Bestehendes Zünden gegen alle Gegner passt nicht auf Verbündete. Vorschlag: offensiven Minenangriff im reinen Koopmodus ausschalten; Umweltminen wären ein eigenes, noch offenes Szenariokonzept. |

Ein vorgeschlagener gemeinsamer Ablauf ist: zulässiger Minenangriff mit bestehender Schaden-/Kostenwertung; normaler bestätigter Zug einschließlich etwaiger Fähigkeit und einmaliger Erfolge; gemeinsame Rundenwertung einschließlich noch fristgerechter Aufträge; Spielende prüfen; nur bei laufender Partie fristgerecht abgelaufene Aufträge schließen und nach jeder fünften Runde mischen. Erfüllungen der letzten erlaubten Runde werden vor Fristablauf gewertet. Minen erhöhen den Aktionszähler, nicht die Rundenzahl. Die bestehende Drei-Sekunden-Explosion und neue Treffer-/Versenkt-/Mischanimationen benötigen eine geordnete Darstellung ohne doppelte Spielaktionen oder Verlust der Auswahl.

### Grundsatzentscheidung zum Farbplan

Die bestehende Engine liest einen gemeinsamen unveränderlichen Farbplan über `boardFor(game)`. Mensch und Computer haben aber unterschiedliche freie Felder. Alle jeweils eigenen freien Farben zu mischen und alle eigenen markierten Farben zu erhalten erfordert deshalb eigene Farbpläne pro Teilnehmer. Das betrifft Validierung, Hinweise, Computerplanung, Minenzielansicht, Schaden-/Farbwertung, Speichern und später die Netzwerkprojektionen.

Nutzerentscheidung vom 11. November 2026: Die Farbverteilungen dürfen durch das Mischen unterschiedlich werden. Beide starten identisch; danach besitzt jeder Teilnehmer einen eigenen gespeicherten Farbplan. Es wird nicht auf die Schnittmenge der bei allen freien Felder eingeschränkt. Damit lassen sich alle eigenen freien Felder mischen und gegnerische Markierungen weiterhin verbergen. Diese bestätigte Planentscheidung ist von den für den Computertest übernommenen Minen-Vorrangregeln oben zu unterscheiden. Die damalige Einführung war ausschließlich gegen Computer; die vier implementierten Varianten sind seit ausdrücklichem OK mit 1.21.0 für menschliche Mehrspieler freigegeben. Neue versteckte Minen bleiben dagegen in 1.22.0 ausschließlich gegen Computer.

### Prüfungen für den Computer-Test

- Normale Punkteverluste durch Minen von dauerhaften einmaligen neuen Erfolgen trennen; Wiederauffüllen darf keine Belohnung verdoppeln.
- Minenschaden an einem Fund oder bestätigten Auftrag vor gemeinsamer Rundenwertung prüfen, insbesondere in der letzten erlaubten Runde und im letzten Spielwurf.
- Reihenfolge um Runde 5/10/15, Minenfreigabe/-verbrauch, Wiederaufnahme, gespeicherte Zufallsverteilungen, getrennte Pläne und Entwürfe prüfen. Mischen erst nach der endgültigen Rundenwertung und nicht mehr nach Spielende.
- Computer darf sichtbare Entdeckerfelder und Aufträge nutzen, aber keine gegnerischen Schiffe, geheimen bisherigen Bonuspositionen, verdeckten Markierungen oder künftige Zufallsverteilungen lesen. Bestehende Stärken und deterministische Suchgrenzen erhalten.
- Neue Optionen zunächst nur gegen Computer freigeben. Erst nach Nutzerabnahme technische Mehrspielerunterstützung und Freigabe gesondert umsetzen.

Bei dieser Quellenprüfung am 11. November 2026 bestanden alle 54 vorhandenen Tests aus `mines.test.mjs`, `bonus-fields.test.mjs`, `multiplayer-rules.test.mjs` und `color-notices.test.mjs`. Das belegt die beschriebenen bestehenden Regeln; dieser ältere Nachweis beschreibt nur den damaligen Bestand. Die neue Implementierung und aktuelle Prüfungen stehen im Variantenleitfaden und QA-Protokoll.
