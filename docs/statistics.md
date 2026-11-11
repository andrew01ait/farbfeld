# Geräteprofil und Statistik

<!-- farbfeld-version: 1.19.3 -->

## Dateinamen beim Sichern

Die Statistik bleibt Bestandteil des bestehenden lokalen Schema-1-Backups. Ab 1.12.5 trägt jeder neue Download den Namen `YYYYMMDD_Farbfeld_Spielstand.json`, mit dem Exporttag auf diesem Gerät. Der Import verwendet den Backupinhalt und akzeptiert auch alte Dateinamen; keine Änderung der Zusammenführung oder Zählung.

## Ansicht

Auf der Startseite **Statistik** (Diagramm-Icon) oder in den Einstellungen **Profil & Statistik → Ansehen** öffnen. Kennzahlen und Gegnerbilanz stehen im Vordergrund; Erklärungen sind unter **Zur Wertung** eingeklappt.

| Bereich | Enthält | Kennzahlen |
| --- | --- | --- |
| Mit anderen | Ein Handy, Internet-Raum, Direktspiel gegen Menschen | Partien, Siege/Niederlagen, geteilte Siege, Serien, Bestwert, Punktedurchschnitt, Gegnerbilanz |
| Computer | ausschließlich Computerpartien | eigene Partien, Siege/Niederlagen, geteilte Siege, Serien, Bestwert, Punktedurchschnitt |
| Solo | ausschließlich Solopartien | Partien, Bestwert, Punktedurchschnitt |

Die Bereiche beeinflussen einander nicht. Eine Computerniederlage unterbricht beispielsweise keine Siegesserie gegen Menschen; ein Solo-Bestwert überschreibt keinen anderen Bestwert. **Ergebnisse** öffnet nur die letzten sichtbaren Ergebnisse des ausgewählten Bereichs; **Zur Statistik** kehrt dorthin zurück. Die sichtbare Liste bleibt auf 100 Ergebnisse insgesamt begrenzt, der kompakte Statistikverlauf nicht.

Abgeschlossene Partien und ausdrücklich bestätigte Mehrspieler-Ausstiege zählen. Ein Ausstieg zählt sofort einmal als feste −10-Punkte-Niederlage, selbst wenn verbleibende Personen weniger Punkte haben. Solo-Abbruch, verworfene Kopplungen und bloß laufende Spiele zählen nicht. Verdeckte fremde Werte bleiben im frühen Ausstiegsdatensatz unbekannt. [Regeln und gemeinsame Handyhistorie](leaving.md).  Innerhalb eines Bereichs verlängern geteilte Gesamtsiege die Serie. Ein unbekannter alter Ausgang unterbricht die belegbare Bereichsserie. Bestwert und Durchschnitt verwenden den eigenen gespeicherten Punktestand.

## Eine bestimmte Person

Unter **Mit anderen → Gegnerbilanz** einen Namen antippen. Die eigene Detailansicht zeigt:

- Direkte Siege, Remis, Niederlagen und Anzahl der Begegnungen.
- Siegquote (direkte Siege / Begegnungen), aktuelle und längste Siegesserie gegen diesen Namen.
- Eigenen Bestwert und eigenen Punktedurchschnitt in diesen Begegnungen.
- Die letzten fünf Duelle mit Datum, Brett, eigenen/gegnerischen Punkten und übrigen Jokern. Eigene Werte stehen links.

Punkte entscheiden, bei Gleichstand übrige Joker. Sind beide gleich, ist der direkte Vergleich ein Remis. Remis und Niederlage unterbrechen die direkte Siegesserie; Partien gegen andere Namen, Computer und Solo beeinflussen sie nicht.

In einer Gruppe kann man das gesamte Spiel verlieren und trotzdem gegen eine niedriger platzierte Person gewinnen. Deshalb kann die direkte Bilanz von der Gesamtbilanz abweichen. Gleiche normalisierte Namen werden zusammengefasst; kommen sie im selben Gruppenspiel mehrfach vor, zählt jede Begegnung einzeln. Computer werden nach dem Spielmodus getrennt, auch wenn ein Mensch „Computer“ heißt.

## Zuordnung und Grenzen

Es gibt keine Benutzerkonten. Das Profil gehört zu diesem Gerät und dieser Webadresse. Gegner werden nach ihrem normalisierten Namen zusammengefasst; Großschreibung und zusätzlicher Leerraum werden ignoriert. Personen mit demselben Namen sind nicht unterscheidbar, ein Namenswechsel kann einen neuen Eintrag erzeugen. Es gibt keine Cloud- oder geräteübergreifende Profilsynchronisierung.

Neue Ergebnisdatensätze speichern `ownPid`, sodass auch auf dem zweiten bis sechsten Handy die eigene Rolle eindeutig bleibt. Bei „Ein Handy weitergeben“ zählt die erste Person. Alte Solo-/Computer-/Ein-Handy-Ergebnisse gehören zur ersten Person; bei alten Raum-/Direktergebnissen kann ein eindeutiger eigener Punktwert die Zuordnung ermöglichen. Bei uneindeutigen alten Gleichständen werden Siege und Gegnerbilanzen nicht geraten. Der betroffene Bereich nennt diese Anzahl; solche Ergebnisse fehlen in Gegnerdetails.

Verdeckte Partien fließen ausschließlich nach Spielende und gemeinsamer Aufdeckung ein. Profile verraten keine laufenden Gegnerpunkte.

## Speichern und Sichern

`farbfeld.stats.v1`, Schema 1, speichert einen kompakten Ergebnisverlauf unabhängig von den letzten 100 sichtbaren Ergebnissen. Ein Eintrag enthält ID, Datum, Modus, Brett, eigenen Punktwert/Rolle sowie Namen, Punkte und Joker der Beteiligten. Keine Spielblätter, Raum-/Direktzugänge oder Push-Abonnements. Ergebnis-IDs verhindern doppelte Zählung nach erneutem Öffnen oder Import.

Beim ersten Start werden vorhandene lokale Ergebnisse übernommen. Bereits vor dieser Funktion aus der 100er-Liste entfernte Partien können ohne Sicherung nicht rekonstruiert werden. Ab jetzt bleibt die Statistik darüber hinaus erhalten, solange der Browser genügend Gerätespeicher bereitstellt. Ab 1.8.1 werden dieselben vorhandenen Einträge getrennt ausgewertet; keine Daten werden dafür gelöscht oder migriert.

**Einstellungen → Lokale Spielstände exportieren** enthält zusätzlich die Statistik. Format/Backupversion bleibt 1 mit optionalem Feld `statistics`; alte Backups funktionieren weiterhin. Import führt vorhandene und importierte Statistiken ohne doppelte IDs zusammen. Vor Löschen von Browserdaten oder Geräte-/Webadresswechsel exportieren; es gibt keine automatische Übertragung.

## Prüfung

Automatisiert: Gastrolle, Gruppenvergleiche, Joker-Tiebreak, geteilte Gesamtsiege, direkte Remis, chronologische Serien, vollständige Modustrennung einschließlich Mittel-/Bestwerten, negative Werte, über 100 Ergebnisse, über fünf Duelle, wiederholte Erfassung/Import, normalisierte/gleiche Gegnernamen, unbekannte Gegner, mehrdeutige Altrollen und Ausschluss von Zugangsdaten/Blättern.

Browser-QA für 1.8.1 verwendet Beispiel-Endstände und die echte Oberfläche: Bereiche/Ergebnisfilter, Menschen namens „Computer“, Gegnerdetails mit Joker-Tiebreak, Rücksprung, leere Profile und lange Namen in Hoch-/Querformat. Diese Prüfung ist keine neue reale Partie auf Android. Bildnachweis 1.8.1 mit Beispieldaten (private QA screenshot omitted).

Historische Integrationsprüfung 1.8.0: vollständige lokale Serverpartie mit zwei getrennten Clients nach 51 Würfen (Alex 38, Bea 28), passende eigene Rollen und gegenseitige Bilanz sowie echter Browser-Export ohne Raumzugänge. Bildnachweis 1.8.0 (private QA screenshot omitted). Physische Android-Abnahme bleibt offen.

1.11.0: Beendete Partien aus der autorisierten Sammelübersicht werden mit tatsächlichem eigenen Spielerindex und Spiel-ID erfasst, auch wenn gerade ein anderer Raum gewählt ist. Es gibt keine laufenden Punktestände im Index. Deduplizierung über Spiel-ID, getrennte Spielarten und namensbasierte Gegnerbilanz bleiben erhalten. Raumwechsel/Bereinigung löschen keine lokalen Statistiken. Bereits überschriebene serverseitige Endstände werden dadurch nicht nachträglich rekonstruiert.
