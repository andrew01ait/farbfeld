# Random-Spielbrett

<!-- farbfeld-version: 1.17.1 -->

**Random** ist die vierte Brettwahl neben Classic, Flusslauf und Mosaik, für alle Spielarten. Erst beim bestätigten neuen Start wird das tatsächliche Blatt erzeugt. Der Server bzw. Direkt-Gastgeber erzeugt genau einen Plan; alle Personen erhalten denselben. Neuladen, Fortsetzen und Wiederverbinden erhalten den Plan. Jede neue Partie/Revanche erzeugt einen frischen Zufallsplan; eine zufällige Wiederholung ist nicht mathematisch ausgeschlossen.

## Eigenschaften

105 Felder in 15 Spalten und sieben Zeilen, pro Farbe 21 Felder mit zusammenhängenden Gruppen der Größen eins bis sechs. Jede Farbe ist in Startspalte H erreichbar. 15 Sterne, genau einer pro Spalte und drei pro Farbe. Classic bleibt unverändert. Ein begrenzter Generator variiert validierte Grundbretter durch Farbpermutation, Spiegelung sowie geprüfte Gruppen-/Zellwechsel; Sterne werden über eine begrenzte Zuordnung verteilt. Das Ergebnis erfüllt dieselben Invarianten, ist aber keine Gleichverteilung über alle denkbaren Bretter oder Garantie gleicher subjektiver Schwierigkeit.

## Speicherung und Schutz

Schema 1 ergänzt `boardId: random` und `boardLayout: {schema,rows,stars}` im vorhandenen Spielzustand. Die vollständige öffentliche Brettdefinition wird gespeichert und an alle projiziert; geheime Bonuskoordinaten und gegnerische verdeckte Kreuze bleiben separat geschützt. Vor Import/Abgleich werden Form, Farben, Gruppen, H-Erreichbarkeit und Sternverteilung geprüft. Unbekannte oder beschädigte Pläne werden abgewiesen. Ein immutable Cache vermeidet wiederholte Berechnung; Änderungen am Layout werden erneut geprüft.

Netzwerkpartien benötigen `boards-v1` und tatsächlich bestätigtes `random-board-v1` auf allen Handys ab 1.17.0. Ältere Apps können feste Standardbretter weiter nutzen. Keine Migration, kein Seed mit Zukunftswürfeln, keine neue Netzverbindung. Computer und Hinweise verwenden den gespeicherten Plan über dieselbe Engine. Statistiken speichern nur die Brettkennung, keine Layouts oder Spielblätter.

## Prüfung

Seeded Generatorprüfungen, entarteter Zufall mit begrenzter Laufzeit, vollständige Regeln, alle Spielarten mit bis zu sechs Personen, alle Computerstärken mit offenen/verdeckten Punkten, Bonusfeldern und Minen sowie gemeinsame Raum-/Direktpläne, Neuladen und falsche/fehlende Fähigkeiten. [Layoutprüfung](responsive-qa.md) · [Architektur](architecture.md).
