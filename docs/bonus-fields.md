# Versteckte Bonusfelder

<!-- farbfeld-version: 1.17.0 -->

**Bonusfelder** ist eine freiwillige Startregel für Solo, Computer, mehrere Personen an einem Handy, Offline-Direktpartien und Internet-Räume. Die Vorgabe für eine neue Einrichtung ist aus. Bei einer Revanche kann die vorige Wahl übernommen und vor dem Start geändert werden. Die Regel steht während einer laufenden Partie fest. Alle vier Brettwahlen und zwei bis sechs Mehrspielerplätze werden unterstützt. In jeder Mehrspielerpartie lassen sich Bonusfelder und Minen unabhängig kombinieren. Siehe [Minen](mines.md) und [Random](random-board.md).

## Regeln und Bekanntgabe

Beim Erzeugen jeder neuen Partie werden genau drei unterschiedliche Koordinaten gleichverteilt ohne Zurücklegen aus den 105 Feldern gewählt. Alle Spieler spielen um dieselben drei Positionen. Jedes Feld ist **+2 Punkte je berechtigter Person** wert. Die Orte werden im Spielfeld nicht markiert und auch durch Hinweise oder Computerplanung nicht bevorzugt.

Ein bestätigter Zug reserviert einen bislang unentdeckten Treffer. Erst nachdem alle Personen ihre Auswahl oder Passen für diesen Wurf bestätigt haben, wird gewertet und die Entdeckung für alle bekanntgegeben. Alle Personen, die dasselbe Feld in diesem ersten Trefferwurf markiert haben, erhalten jeweils die vollen zwei Punkte; die Reihenfolge innerhalb des Wurfs entscheidet nicht. Ein Zug kann mehrere Bonusfelder treffen. Spätere Würfe vergeben für ein bereits entdecktes Feld keine Punkte mehr. Im Solo zählt der eigene abgeschlossene Zug als gemeinsamer Wurf. Auch der letzte Wurf vor dem Spielende wird vollständig gewertet.

Die Spielansicht meldet, wer ein Bonusfeld entdeckt hat, und zeigt dauerhaft, wie viele der drei Felder gefunden wurden. Die genauen Koordinaten bleiben auch in der Bekanntgabe verborgen, damit verdeckte Gegnerblätter keine Positionshinweise liefern. Bei verdeckten Punkten nennt die Meldung nur die Entdeckung; Gesamtsummen und Aufschlüsselungen bleiben bis zum Spielende verborgen. Dies ist eine Nachricht innerhalb der Partie über den bestehenden Spielabgleich, keine zusätzliche Internet-Push-Art und kein neuer Netzwerk- oder Hintergrundtimer.

Bereits verdiente Bonuspunkte bleiben dauerhaft erhalten, auch wenn eine Mine das betreffende Kreuz oder Nachbarfeld entfernt. Dasselbe gilt für einen im aktuellen Wurf bestätigten, noch nicht ausgewerteten Bonustreffer. Erneutes Markieren, Wiederverbindung, Import, Neuladen oder eine wiederholte Bestätigung vergibt keinen weiteren Bonus. Bonuspunkte werden weder entzogen noch auf den Gegner übertragen. Die sonstigen Spalten-/Farbbonuswechsel und der Mineneinsatz werden unabhängig berechnet. Jede Person kann höchstens sechs Bonuspunkte verdienen.

## Einrichtung und Kompatibilität

Lokale Startdialoge haben eine beschriftete Checkbox **Bonusfelder**. In einer Direkt-/Internet-Lobby wählt der Gastgeber den Schalter vor dem Start. Alle Beteiligten müssen die Fähigkeit `bonus-fields-v1` mit einem Client ab 1.17.0 tatsächlich bestätigen. Alte Clients können Standardpartien weiter spielen, aber keine Bonuspartie starten, verändern oder als solche fortsetzen. Ein neuer Raumaufruf meldet nur die eigene Unterstützung an. Fehlende Unterstützung wird über die vorhandenen Fähigkeiten-/Versionsregeln behandelt, ohne fremde Registrierungen zu erfinden.

Neue Partien/Revanchen erzeugen neue Zufallspositionen und beginnen ohne Bonusgewinne. Bestehende Schema-1-Spiele ohne `bonuses` verwenden unverändert die Standardwertung. Der gesamte optionale Bonuszustand bleibt in Schema-1-Spielständen; Bonusstände benötigen zum Fortsetzen mindestens 1.17.0. Die bestehenden JSON-Dateinamen und Exporte bleiben erhalten. Keine Datenbankmigration oder neue Laufzeitkonfiguration.

## Zustandsgrenzen

`bonus-fields.js` hält auf dem Server bzw. Direkt-Gastgeber drei geheime Felder mit `index`, einer einmaligen `claim` aus Wurf und Gewinnerplätzen sowie noch nicht veröffentlichten `pending`-Treffern. Die gemeinsame Engine erfasst bestätigte Züge und schließt die Bonuswertung am Ende des Wurfs ab. `score()`/Rangliste/Statistik/Ergebnisfreigabe addieren ausschließlich bereits ausgewertete Prämien, in der Punkteübersicht separat als **Bonusfelder**.

Jede Netzwerkprojektion, auch für offene Spiele und Gastgeber eines Internet-Raums, ersetzt diese Daten durch `awards` (nur Slot, Wurf und Gewinnerplätze) und `remaining`. Kein API-/WebRTC-Zustand an Gäste enthält geheime oder bereits entdeckte Koordinaten oder vorzeitige Treffer. Verdeckte Spielblätter bleiben zusätzlich redigiert. Die Validierung unterscheidet vollständige autoritative Spielstände und öffentliche Gästeprojektionen; ein Gastgeber kann nicht mit einer unvollständigen Projektion weiterwerten.

Computerplanung arbeitet ohne die geheimen Bonusdaten, auch bei hypothetischen schweren Zügen. Bereits bekannte Prämien dürfen in einer offenen Endwertung berücksichtigt werden; unbekannte Positionen werden nicht gelesen und kein Zukunftszufall verbraucht. Die üblichen Grenzen lokaler Speicherung gelten: eine lokale App bzw. der Direkt-Gastgeber muss den vollständigen Zustand zum Weiterwerten speichern. Das ist keine kryptographische Geheimhaltung gegen Zugriff auf den eigenen Gerätespeicher. Diagnoseexporte enthalten weiterhin weder Bonuspositionen noch Spielblätter oder Punktesummen.

## Prüfung

Regressionen decken eindeutige Auswahl, alle Bretter und Spielerzahlen, ausgeschaltete Altstände, sechs gleichzeitige Treffer in unterschiedlicher Reihenfolge, Reservierung bis Wurfende, spätere Treffer ohne erneute Auszahlung, mehrere Boni in einem Zug, letzten Solo-/Mehrspielerwurf, Minenschaden vor und nach Wertung, Sicherung/Neuladen, öffentliche und verdeckte Projektionen, Eingabevalidierung, XSS-sichere Texte und geheime Computeranalyse ab. Direktprotokoll und Raum-API prüfen Hostrechte, Lobbybindung, tatsächliche Fähigkeit, alte Clients, Wiederverbindung, verlorene Quittungen, Deduplizierung und neue Revanchen. Gerenderte Handy-/Tablet-/Desktop-Prüfung und verbleibende Gerätebedingungen werden in [Responsive QA](responsive-qa.md) festgehalten. Physische Zwei-Handy-/Hotspot- und subjektive Balanceprüfung bleiben separat.
