# Computer-Stärken

<!-- farbfeld-version: 1.16.0 -->

## Neu 1.16.0: Offline-Testprotokoll und optionale Computer-Minen

Ein freiwilliges lokales A/B-Testprotokoll hilft bei Offline-Kopplung und Spielabgleich; es ist aus Einstellungen und Kopplungsdialogen exportierbar. [Testanleitung und Datenschema](offline-diagnostics.md). Die neue Startoption **Minenangriff testen** gilt vorerst nur gegen den Computer: gegnerischer Farbabschluss schaltet einen einmaligen Angriff für fünf Punkte frei. Ein leeres Zielfeld ist ein vollständiger Fehlschlag ohne Nachbarschaden. [Regeln, verdeckte Zielwahl und Wertung](mines.md).


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

Veröffentlichte Oberfläche einschließlich Stärkewechsel mit erhaltenem Entwurf und Fortsetzen nach Neuladen geprüft; Bildnachweis (private QA screenshot omitted). Eigene Testpartie danach abgebrochen. Gerenderte Handy-/Tablet- und physische Android-Prüfung bleiben offen.


1.13.1: Veröffentlichter PWA-Updateweg und Titel-Zugang zum Stärkewechsel Mittel → Schwer bei unverändertem Wurf 1 auf Desktop geprüft. Eigene Testpartie anschließend abgebrochen. Desktop-Nachweis (private QA screenshot omitted). Handy-/Tablet-Rendering und physisches Android bleiben offen.

