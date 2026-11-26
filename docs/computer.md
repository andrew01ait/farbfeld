# Computer-Stärken

<!-- farbfeld-version: 1.34.2 -->

## Schatzsuche 1.23.0

Neue optionale Bonuspartien enthalten Warm/kalt-Hinweise, grobe Fundspuren und den einmaligen Kettenbonus. Leicht behält die bisherige Zugwahl. Mittel/Schwer berücksichtigen ausschließlich ihre eigenen bereits erhaltenen Temperatur-/Spaltenband-Hinweise als begrenzten Erwartungswert für die vorhandenen legalen Kandidaten. Ohne Hinweis gibt es keinen Suchbonus. Unbekannte Positionen, fremde Hinweise, vorzeitige fremde Funde und künftige Zufallswerte bleiben unzugänglich. Die hypothetische schwere Engine-Simulation entfernt weiterhin die gesamten privaten Bonusdaten. Geheime Positionen mit werfenden Gettern sind auch nach Hinweisen regressionsgeprüft.

## Neue geheime Minen · 1.22.0

Der Computer platziert vor dem ersten Wurf seine zwei Minen zufällig und bestätigt nur seine Seite. Die menschliche Aufstellung bleibt editierbar bis zur eigenen Bestätigung; Flotte und Minen blockieren gemeinsam den Start. Easy/Medium/Hard lesen keine menschlichen Minenpositionen bei der Zugwahl und verwenden dabei keinen Zufall. Tatsächliche bestätigte Computerzüge können menschliche Minen auslösen und werden mit derselben Engine korrigiert. Kein neues Verhalten für Partien ohne gewählte Minen. Der bisherige Mineneinsatz vor dem normalen Computerzug heißt Luftangriff, mit unveränderter Fünf-Punkte-Gebühr. [Regeln](hidden-mines.md).


## Gruppierte Mischung 1.21.1

Alle drei Stärken und menschliche Züge lesen weiterhin ausschließlich den tatsächlichen eigenen Plan. Die neue gruppierte Mischung läuft nur beim echten Fünf-Runden-Abschluss; Suche und Hinweise ziehen keine zukünftigen Zufallszahlen und simulieren keine geheime Mischung. Größere freie Farbgruppen bleiben spielbar; Punkte und Farbbudgets ändern sich durch den Gruppentausch nicht.


## Variantenfreigabe 1.21.0

Die vier zuvor gegen Computer erprobten Varianten sind nach ausdrücklichem Nutzer-OK auch für menschliche Mehrspieler freigegeben. Computerrolle 0/1, drei Stärken, private Flottengrenzen und bekannte Speicherung bleiben erhalten. Gemeinsame Regeln verwenden nun variantsEnabled; die Computerfabrik bleibt genau zwei Personen. Neue spätere Mechaniken weiterhin zuerst nur gegen Computer.


## Varianten ab 1.20.0

Vier optionale Regeln in der Computer-Einrichtung, auch kombinierbar mit Minen/Bonusfeldern. [Vollständige Regeln](computer-variants.md). Leicht bleibt ohne Varianten die bisherige Suche; mit Varianten nutzt er Fähigkeiten als Ausweg, wenn kein normaler Zug möglich ist. Mittel bewertet öffentliche Fundorte/Aufträge und die eigenen bestätigten Schüsse mit. Schwer nutzt dafür einen begrenzten eigenen Zukunftsblick ohne Simulation oder Lesen der geheimen Gegnerflotte; unmittelbar vor einer Neumischung entfällt die unbekannte Zukunft. Die frühere 216er-Stärkenprobe beschreibt Partien ohne die neuen Varianten, keine bewiesene Balance mit Varianten.

Keine geheime Bonusposition, verdeckte fremde Markierung, fremder Jokerstand, gegnerische Flotte oder künftige Zufallszahl darf die Entscheidung beeinflussen. Die Varianten-Suche ist RNG-frei; nur echte Rundenabschlüsse mischen. `scoring-combinations.test.mjs` prüft komplette Partien aller 128 Kombinationen aus vier Varianten, Minen, Bonusfeldern und verdeckten Punkten. Physische Android-Balance und Nutzerabnahme bleiben separat.


## Hinweise und verdeckte Ansicht

Farbanzeigen verwenden korrekt **Du hast**, Bonusanzeigen kurze Namen/Prämien mit aufklappbarem Wurfverlauf. Die neutrale Statusgestaltung gilt auch für Ergebnis und Auswahlhinweis. Die Startoption beschreibt den verdeckten Modus ausdrücklich: nur eigenes Blatt sichtbar, Gegnerblätter und alle Punkte erst am Ende. Computerplanung und Schwierigkeitslogik bleiben unverändert.

## Neu 1.17.0: Bonusfelder, Random und gemeinsame Minen

Drei geheime **Bonusfelder** vergeben je +2 an alle ersten Finder desselben Wurfs; Bekanntgabe erst nach der gemeinsamen Wertung, Punkte bleiben trotz Minen erhalten. **Random** erzeugt bei jedem neuen Start ein gemeinsames, gespeichert fortsetzbares Brett. Die optionale **Mine** trifft ein gewähltes Zielfeld bei allen aktiven Gegnern, einmal pro Person für insgesamt fünf Punkte. Die Explosion dauert drei Sekunden; Schadensmarkierungen bleiben bis Ende des nächsten Wurfs. Leere Ziele verursachen beim jeweiligen Gegner keinerlei Schaden.

**Partie verlassen** gibt sofort einen einmaligen Verlaufseintrag mit −10 Punkten und Niederlage. Die anderen spielen weiter; die letzte aktive Person gewinnt sofort. Im Internet wandert die Gastgeberrolle weiter. Offline bleibt das ursprüngliche Gastgeber-Handy als Zuschauer und Verbindung geöffnet; Verbindungsverlust pausiert sicher, ohne neue Autorität zu erfinden. Alle beteiligten Apps für neue Regeln auf 1.17.0 aktualisieren. [Bonusfelder](bonus-fields.md) · [Minen](mines.md) · [Random](random-board.md) · [Aussteigen](leaving.md).


## Offline-Testprotokoll

Das freiwillige lokale A/B-Testprotokoll unterstützt Kopplungs- und Abgleichstests. [Anleitung](offline-diagnostics.md).

## Spielen

Startseite → Gegen den Computer → **Computer-Stärke** → **Leicht**, **Mittel** oder **Schwer** → Brett/Punkte wählen → starten. Neue Partien beginnen standardmäßig mit Mittel. Die zuletzt verwendete Wahl bleibt auf diesem Gerät gespeichert.

Während einer Partie den Titel **Du gegen Computer.** mit dem Einstellungssymbol antippen oder Einstellungen → Computer-Stärke → Ändern. Auswahl mit **Stärke übernehmen** bestätigen. Der nächste Computerzug verwendet die neue Stärke. Würfel, Runde, bestätigte Kreuze, Joker und eigene unbestätigte Auswahl bleiben erhalten. Das funktioniert auch offline und im Querformat über den Spieltitel.

Im Handy-Hochformat erhält der Titel ab 1.13.1 die volle Breite neben Zurück; Wurf, Punkte und Beenden stehen darunter. Der Titel bleibt der direkte Zugang zur Stärkenauswahl, ohne „Computer“ mitten im Wort zu trennen.

## Unterschiedliche Entscheidungen

| Stärke | Strategie |
| --- | --- |
| Leicht | Bisheriges `findMove`: große Gruppen, Sterne und unmittelbar vollständige Spalten; feste Jokerkosten. |
| Mittel | Durchsucht legale verbundene Gruppen, bewertet tatsächliche Erst-/Späterboni, Fortschritt zu Farben und Spalten sowie neue Anschlussmöglichkeiten. Spart knappe Joker stärker und darf einen ungünstigen Jokerzug auslassen. |
| Schwer | Vergleicht bis zu acht aussichtsreiche Züge und Passen. Gewichtet die nächste eigene Spielgelegenheit nach den Wahrscheinlichkeiten möglicher Würfelkombinationen. Bei offenen Punkten schätzt es deine Antwort auf die übrig gebliebenen Würfel und berücksichtigt Gewinn/Verlust bei einem möglichen Spielende. |

Schwer bewertet bei der Vorausplanung zwei verfügbare Würfel je Art für eine passive Person ab Wurf vier, sonst drei. Die spätere Auswahl des Gegenübers ist unbekannt; dies ist eine begrenzte Näherung. Es wird weder der tatsächliche nächste Wurf erzeugt noch der Zufallszustand gelesen. Die Endwertung und jeder ausgeführte Zug stammen weiterhin aus der gemeinsamen Regelengine. Schwer ist eine stärkere Heuristik, kein perfekter oder unschlagbarer Spieler.

## Fairness, Speicherung und Akku

Alle Stärken verwenden dieselben sechs tatsächlich gewürfelten Werte, Felder, Regeln und acht Joker. Nur ein echter Würfelschritt verwendet den Zufallszahlengenerator. Leicht bleibt identisch zur bisherigen Strategie. Hinweise für Menschen und andere Spielmodi wurden nicht verändert.

Bei verdeckten Punkten nutzt auch Schwer kein menschliches Blatt, keine menschlichen Punkte oder Joker. Der Analysezustand ersetzt die gegnerischen Felder durch ein leeres Blatt, damit auch eine simulierte Endwertung keine versteckten Informationen liefert. Bekannte eigene Felder, gemeinsame Würfel und öffentliche Bonusansprüche bleiben nutzbar.

Die Berechnung erfolgt nur bei einem tatsächlichen Computerzug, nicht beim Warten oder im Hintergrund. Der bestehende 700-ms-Spielschritt und die Pause bei unsichtbarer App oder offenem Dialog bleiben erhalten. Keine API, zusätzlichen Timer, Server-KI oder neuen Offline-Dateien. Der Suchraum ist auf das 105-Felder-Blatt, Gruppen bis fünf und den kleinen Kandidatenkreis begrenzt.

`computerDifficulty` ist ein optionales Feld des bestehenden Schema-1-Spielstands. Fehlend bedeutet **Leicht**, sodass laufende ältere Spiele ihre Stärke behalten. Neue Spiele speichern den gewählten Wert. Lokale JSON-Sicherungen behalten das bestehende Format und den Namen `YYYYMMDD_Farbfeld_Spielstand.json`; alte Dateien bleiben importierbar. Die Gerätepräferenz ist ebenfalls im vorhandenen Einstellungen-Backup enthalten. Computerstatistiken bleiben getrennt von Menschenspielen; Stärken werden innerhalb der Computerstatistik zusammengefasst.

## Reproduzierbare Prüfung

`node scripts/benchmark-computer.mjs 24` spielt 24 feste Seeds je Brett und Stärke, insgesamt 216 Partien, gegen den bisherigen leichten Spieler auf dem menschlichen/ersten Platz. Beide erhalten dieselbe Würfelfolge. Die Messung nutzt einen lokalen Host und simulierte Gegner, keine Menschen oder Android-Hardware.

| Stärke | Siege / 72 | Remis | Mittlere Punktedifferenz |
| --- | ---: | ---: | ---: |
| Leicht | 24 | 1 | −4,00 |
| Mittel | 31 | 4 | −0,87 |
| Schwer | 54 | 2 | +6,54 |

Schwer benötigte im Host-Lauf durchschnittlich etwa 3,7–3,9 ms pro Zug und maximal rund 24 ms. Das ist keine Zeit- oder Siegquotengarantie für Android. Die begrenzte Stichprobe zeigt die gewünschte Reihenfolge und ersetzt keine spätere Spielbalance-Rückmeldung.

Regressionen prüfen gespeicherte/alte Stärken, Änderung ohne Zustandsverlust, identische Würfe ohne Vorausschauen, unabhängige verdeckte Gegnerdaten, einen sicheren Sieg durch die zweite Farbe, Jokergrenzen, unverändertes Leicht und vollständige Partien auf allen drei Brettern. Responsive und veröffentlichte Prüfung stehen in [responsive-qa.md](responsive-qa.md), Releasechecks in [deployment.md](../deployment.md).

Veröffentlichte Oberfläche einschließlich Stärkewechsel mit erhaltenem Entwurf und Fortsetzen nach Neuladen geprüft; Bildnachweis. Eigene Testpartie danach abgebrochen. Gerenderte Handy-/Tablet- und physische Android-Prüfung bleiben offen.


1.13.1: Veröffentlichter PWA-Updateweg und Titel-Zugang zum Stärkewechsel Mittel → Schwer bei unverändertem Wurf 1 auf Desktop geprüft. Eigene Testpartie anschließend abgebrochen. Desktop-Nachweis. Handy-/Tablet-Rendering und physisches Android bleiben offen.
