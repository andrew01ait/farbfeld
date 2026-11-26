# Schatzsuche

<!-- farbfeld-version: 1.34.2 -->

## Schatzhinweise in allen Mehrspielerarten · 1.25.0

Ein Handy, Direktpartien und Internet-Räume bieten dieselben drei Schatzslots, Heiß/Warm/Kalt, eine Folge-Spur und bis zu fünf bestätigte eigene Suchzüge wie gegen Computer. In neuen Kettenpartien bringt jeder Fund zwei Punkte. Drei eigene Funde bringen einmalig drei Extrapunkte. Bereits laufende Partien mit der bisherigen Wertung erhalten Hinweise ab dem nächsten bestätigten normalen oder Extra-Zug. Ihre Wertung beträgt weiterhin maximal sechs Punkte. In Solo bleibt die klassische Fundwertung. Aktuelle Netzwerkpartien prüfen treasure-hunt-v1 auf den Geräten. Im Snapshot erhält nur der authentifizierte Platz seine eigene Historie und Spur.

## Verfügbarkeit und letzte fünf Suchzüge · 1.23.2

Die drei Kästchen stehen jetzt für die tatsächlichen Schatzslots, nicht für eine bloße eigene Fortschrittsleiter. Noch verfügbare Schätze heißen **Noch offen**. Eigene oder gleichzeitige Funde haben ein Häkchen und **Dein Fund**. Ausschließlich von der anderen Seite gefundene Schätze werden durchgestrichen, benennen die gewinnende Person und sind als nicht verfügbar markiert. Sobald ein fremder Alleinfund die Dreierkette unmöglich macht, weist die Karte darauf hin. Das verwendet ausschließlich bereits veröffentlichte Fundprämien, keine geheimen Positionen.

Aufgeklappt bleiben **die letzten fünf eigenen Suchzüge** sichtbar, neueste zuerst: Wurf, eigene Felder und damalige Temperatur. Auch zusätzliche bestätigte Züge desselben Wurfs bleiben einzelne Einträge. Die Temperaturen werden nicht nachträglich neu gemessen, wenn ein anderer einen Schatz gewinnt; die Karte erklärt diesen historischen Bezug. Nach Vergabe aller Schätze bleibt der Verlauf bestehen, spätere normale Züge überschreiben ihn nicht. Funde und Temperatur haben weiterhin ihre bisherigen Regeln.

Optionales hunt.history speichert zwei Listen mit je maximal fünf Messungen. Alte Spielstände ohne diese Eigenschaft werden unverändert gelesen. Beim nächsten tatsächlichen Suchzug wird die bisherige einzelne Messung übernommen und der neue Eintrag angehängt; frühere nicht gespeicherte Messungen sind nicht rekonstruierbar. Passen, Laden und Anzeigen ändern nichts. Reihenfolge, Datenform, Begrenzung und Übereinstimmung des letzten Eintrags mit reading werden validiert. treasureHuntView liefert nur eigene defensive Kopien; sämtliche hunt-Daten bleiben aus Netzwerkprojektionen entfernt. Spielstände mit history benötigen Client 1.23.2. Alte Sechs-/neue Neun-Punkte-Grenzen bleiben unverändert.

## Konkrete Suchfelder und ältere Computerpartien · 1.23.1

Die kompakte Statuszeile nennt jetzt die eigenen Felder zur Messung, etwa **Heiß: H1**, statt nur „Heiß · W4“. Bei mehreren gleich nahen neuen Kreuzen werden diese gemeinsam genannt; lange Listen stehen vollständig aufgeklappt. Die Wurfnummer bleibt dort ergänzend als historischer Suchzug. Für Messungen aus 1.23.0 ohne focus werden die gespeicherten eigenen Suchfelder angezeigt, ohne geheime Positionen nachträglich auszulesen.

Die aufgeklappte Karte erklärt sichtbar **Heiß: 1 Schritt · Warm: 2–3 · Kalt: ab 4**. Es zählt der kürzeste Weg von einem Suchfeld zum nächsten offenen Schatz waagrecht/senkrecht; diagonal benötigt zwei Schritte. Die Temperatur ist der Stand des bestätigten Zugs, keine laufende Ortung.

Fehlte hunt in einer laufenden älteren Computerpartie, erscheint zunächst „Hinweis nach Zug“. Beim nächsten bestätigten normalen/Extra-Zug wird die Hinweissuche mit chainBonus:false ergänzt, vorhandene Positionen/Funde/Punkte bleiben erhalten: **weiterhin maximal 6 Punkte**, ohne nachträglichen +3-Kettenbonus. Laden, Anzeigen, Passen und ungültige Entwürfe initialisieren nichts. Neue 1.23.0/1.23.1-Kettenpartien behalten maximal 9. Fertige ältere Partien, Solo und menschliche Spiele erhalten keine neue Hinweissuche.

focus ist optional, eindeutig und Teil der eigenen committed cells; alte vierteilige Messungen bleiben gültig. Neue Messungen/Legacy-Hinweisstände benötigen 1.23.1 zum erneuten Import. Hinweisansicht, tatsächlicher Controller-Test.

## Schatzsuche mit Warm/kalt und Schatzkette · 1.23.0

Die bestätigte Erweiterung betrifft diese **drei versteckten Bonusfelder mit je +2**, nicht die sechs sichtbaren Fähigkeitsfelder des Entdeckermodus. Wähle **Gegen Computer → Schatzsuche** für eine neue Partie. Solo-/menschliche Bonuspartien behalten die bisherige Regel. Laufende ältere Computerpartien erhalten seit 1.23.1 kompatible Hinweise ohne Kettenbonus, wie oben beschrieben.

Nach jedem bestätigten normalen Zug einschließlich Zusatzfeld zeigt die Karte die Nähe der neuen Kreuze zum nächsten noch verfügbaren Schatz: **Heiß** bei einem waagrechten/senkrechten Schritt, **Warm** bei zwei bis drei, **Kalt** ab vier. Es zählt die kürzeste Entfernung von irgendeinem der neuen Kreuze; Diagonalen benötigen zwei Schritte. Bereits im selben Zug selbst berührte Schätze werden für die Temperatur ausgelassen. Die Wurfnummer und eigene Suchkoordinaten kennzeichnen die Messung als historisch; Gegner können inzwischen einen Schatz gewonnen haben. Bloße Entwürfe, ungültige Züge und Passen liefern keine neuen Hinweise.

Nach einem gewerteten eigenen Fund gibt es eine grobe Spur zum nächsten unentdeckten Schatz: **links (A–E)**, **Mitte (F–J)** oder **rechts (K–O)**. Sie verrät keine Zeile oder genaue Position. Wird der betreffende Schatz von der anderen Seite gewonnen, wird die Spur nach der Wertung erneuert; nach allen Funden endet die Suche. Jeder Fund bleibt +2 wert. **Alle drei eigenen Funde ergeben einmalig +3 zusätzlich, insgesamt 9 Punkte.** Der erste gemeinsame Fundwurf und Gleichstände bleiben erhalten; beide können dieselbe vollständige Kette verdienen. Gewinnt die andere Seite einen Schatz allein, ist die eigene Dreierkette nicht mehr vollständig erreichbar.

Die native kompakte Karte zeigt eigene Fundzahl, letzte Temperatur mit eigenen Suchfeldern und eigene gewertete Punkte rechts. Aufgeklappt stehen Dreierkette, Zusatzbonus, Suchzug, nächste Spur und Verlauf. Verdeckte Punkte bleiben bis Spielende auch in zugänglichen Namen verborgen. Hinweis und Prämien überleben Speichern, Import und Neuladen. Luftangriffe/Minen können Kreuze entfernen, aber keine Messung oder verdiente Prämie widerrufen oder beim Wiederauffüllen erneut vergeben.

Der optionale gespeicherte Zustand bonuses.hunt enthält Schema 1 sowie je zwei eigene readings/clues. Nur die Autorität liest geheime Feldpositionen zum Messen; Darstellung und Botplanung verwenden treasureHuntView ohne geheime Koordinaten oder fremde Hinweise. Mittel/Schwer dürfen ihre eigenen groben Hinweise nutzen, Leicht bleibt unverändert. Kein neuer Netzwerkzustand: projectBonuses lässt die gesamte Suche weg, da sie ausschließlich gegen Computer verfügbar ist. Neue Suchstände benötigen Client 1.23.0. Keine neue Push-Art, Migration oder Hintergrundabfrage.

## Benennung Schatzsuche · 1.22.5

Die bisherige Funktion Bonusfelder heißt in der App jetzt **Schatzsuche**. Drei geheime Schätze, je +2 Punkte beim ersten Trefferwurf, Gleichstände für alle und permanente erhaltene Punkte bleiben unverändert. Die internen bonusFields-/bonuses-Schlüssel, bonus-fields-v1-Capability, Bonus-IDs und das Schema bleiben kompatibel; keine Neuerzeugung bestehender Positionen durch die Umbenennung. Die Hilfe behält dieselbe rechte Spalte, bevor und nachdem der Fundverlauf aufklappbar wird.

## Kompakte Anzeige 1.22.1

Die Schatzsuche verwendet dieselben engen Titel-/Fortschrittszeilen wie die übrigen Spielelemente. Der vollständige Verlauf bleibt über die bestehende native Aufklappfunktion erreichbar. Verdeckte Punkte und vollständige Gewinnernamen im Verlauf bleiben erhalten.


## Zusammen mit versteckten Minen · 1.22.0

Versteckte Minen sind ab 1.25.0 auch in Mehrspielerpartien verfügbar. Der reguläre Zug reserviert seinen Bonusfund vor der automatischen Explosion. Das Wiederentfernen des Kreuzes widerruft weder vorgemerkte noch bereits veröffentlichte Bonuspunkte; Wiederauffüllen gibt keine weiteren Punkte. Die bisherige bezahlte Minenaktion heißt Luftangriff, mit denselben Regeln. Der exakte kombinierte Regressionstest belegt Stern + Versenkung + Fund + Auftrag + Bonus, sofortige Explosion, Rundenwertung, Mischung und Wiederauffüllen.


## Kombinationen mit menschlichen Varianten 1.21.0

Die Schätze behalten ihren ersten gemeinsamen Fundwurf: alle Gleichzeitigen erhalten je +2, auch bei vorherigem Minenschaden. Die sechs sichtbaren Entdeckerfunde sind dagegen jeweils exklusiv vergeben und werden nicht erneut sammelbar. Beide Systeme bleiben getrennt in lokalen, direkten und Internetpartien. Netzwerkansichten enthalten weiter nur gewertete Bonusprämien; keine Koordinaten oder vorgemerkten Finder.


## Statuskopf 1.20.6

Rechts steht ausschließlich die Summe der eigenen bereits gewerteten Bonusprämien, mit P. Der globale Fundzähler und letzte Finder stehen darunter; der Verlauf bleibt aufklappbar. Bei betrachteter fremder Person bleibt der Kopf bei den eigenen Punkten. Verdeckung entfernt Prämienwerte aus Text und zugänglichen Namen bis Spielende. Ergebnis zeigt das Geschenksymbol.


## Auswahloberfläche 1.20.1

Die Schatzsuche verwendet die gemeinsame Auswahlkarte mit Geschenk-Symbol und rechtem Häkchen in Solo-, Computer- und Ein-Handy-Einrichtung. Dasselbe Symbol ergänzt den vorhandenen Lobby-Switch. Auswahl-ID, Regeln und Berechtigungen bleiben unverändert.


## Kompakte Anzeige

Ab 1.17.2 zeigt die Karte Geschenk-Symbol, **Schatzsuche**, letzte gewertete Prämie (z. B. **Du · +2** oder **Du & Computer · je +2**) und **1/3**. Die ganze Kopfzeile öffnet den kurzen Verlauf **W10 · Du · +2**. Bei mehr als zwei gleichzeitigen Gewinnern steht kompakt die Anzahl, im Verlauf stehen alle Namen. Lange Namen kürzen nur in der geschlossenen Zeile; die Prämie bleibt sichtbar. Im verdeckten Spiel werden keine Prämienwerte gezeigt, auch nicht in zugänglichen Beschriftungen. 0/3 heißt **Noch unentdeckt**. [Gemeinsame Gestaltung](ui-design.md).

**Schatzsuche** ist eine freiwillige Startregel für Solo, Computer, mehrere Personen an einem Handy, Offline-Direktpartien und Internet-Räume. Die Vorgabe für eine neue Einrichtung ist aus. Bei einer Revanche kann die vorige Wahl übernommen und vor dem Start geändert werden. Die Regel steht während einer laufenden Partie fest. Alle vier Brettwahlen und zwei bis sechs Mehrspielerplätze werden unterstützt. In jeder Mehrspielerpartie lassen sich Schatzsuche und Minen unabhängig kombinieren. Siehe [Minen](mines.md) und [Random](random-board.md).

## Regeln und Bekanntgabe

Beim Erzeugen jeder neuen Partie werden genau drei unterschiedliche Koordinaten gleichverteilt ohne Zurücklegen aus den 105 Feldern gewählt. Alle Spieler spielen um dieselben drei Positionen. Jedes Feld ist **+2 Punkte je berechtigter Person** wert. Die Orte werden im Spielfeld nicht markiert und auch durch Hinweise oder Computerplanung nicht bevorzugt.

Ein bestätigter Zug reserviert einen bislang unentdeckten Treffer. Erst nachdem alle Personen ihre Auswahl oder Passen für diesen Wurf bestätigt haben, wird gewertet und die Entdeckung für alle bekanntgegeben. Alle Personen, die dasselbe Feld in diesem ersten Trefferwurf markiert haben, erhalten jeweils die vollen zwei Punkte; die Reihenfolge innerhalb des Wurfs entscheidet nicht. Ein Zug kann mehrere Schätze finden. Spätere Würfe vergeben für ein bereits entdecktes Feld keine Punkte mehr. Im Solo zählt der eigene abgeschlossene Zug als gemeinsamer Wurf. Auch der letzte Wurf vor dem Spielende wird vollständig gewertet.

Die Spielansicht meldet, wer einen Schatz entdeckt hat, und zeigt dauerhaft, wie viele der drei Felder gefunden wurden. Die genauen Koordinaten bleiben auch in der Bekanntgabe verborgen, damit verdeckte Gegnerblätter keine Positionshinweise liefern. Bei verdeckten Punkten nennt die Meldung nur die Entdeckung; Gesamtsummen und Aufschlüsselungen bleiben bis zum Spielende verborgen. Dies ist eine Nachricht innerhalb der Partie über den bestehenden Spielabgleich, keine zusätzliche Internet-Push-Art und kein neuer Netzwerk- oder Hintergrundtimer.

Bereits verdiente Bonuspunkte bleiben dauerhaft erhalten, auch wenn eine Mine das betreffende Kreuz oder Nachbarfeld entfernt. Dasselbe gilt für einen im aktuellen Wurf bestätigten, noch nicht ausgewerteten Bonustreffer. Erneutes Markieren, Wiederverbindung, Import, Neuladen oder eine wiederholte Bestätigung vergibt keinen weiteren Bonus. Bonuspunkte werden weder entzogen noch auf den Gegner übertragen. Die sonstigen Spalten-/Farbbonuswechsel und der Mineneinsatz werden unabhängig berechnet. Die bisherige Bonusregel ohne Schatzsuche erlaubt höchstens sechs Bonuspunkte je Person; neue Computer-Schatzsuchen erlauben einschließlich Kettenbonus höchstens neun.

## Einrichtung und Kompatibilität

Lokale Startdialoge haben eine beschriftete Checkbox **Schatzsuche**. In einer Direkt-/Internet-Lobby wählt der Gastgeber den Schalter vor dem Start. Alle Beteiligten bestätigen die Basisfähigkeit `bonus-fields-v1`. Die vollständige Schatzsuche mit Kettenbonus erfordert zusätzlich `treasure-hunt-v1` ab 1.25.0. Alte Clients können Standardpartien weiter spielen, aber keine Bonuspartie starten, verändern oder als solche fortsetzen. Ein neuer Raumaufruf meldet nur die eigene Unterstützung an. Fehlende Unterstützung wird über die vorhandenen Fähigkeiten-/Versionsregeln behandelt, ohne fremde Registrierungen zu erfinden.

Neue Partien/Revanchen erzeugen neue Zufallspositionen und beginnen ohne Bonusgewinne. Bestehende Schema-1-Spiele ohne `bonuses` verwenden unverändert die Standardwertung. Der gesamte optionale Bonuszustand bleibt in Schema-1-Spielständen; Bonusstände benötigen zum Fortsetzen mindestens 1.17.0. Die bestehenden JSON-Dateinamen und Exporte bleiben erhalten. Keine Datenbankmigration oder neue Laufzeitkonfiguration.

## Zustandsgrenzen

`bonus-fields.js` hält auf dem Server bzw. Direkt-Gastgeber drei geheime Felder mit `index`, einer einmaligen `claim` aus Wurf und Gewinnerplätzen sowie noch nicht veröffentlichten `pending`-Treffern. Die gemeinsame Engine erfasst bestätigte Züge und schließt die Bonuswertung am Ende des Wurfs ab. `score()`/Rangliste/Statistik/Ergebnisfreigabe addieren ausschließlich bereits ausgewertete Prämien, in der Punkteübersicht separat als **Schatzsuche**.

Jede Netzwerkprojektion, auch für offene Spiele und Gastgeber eines Internet-Raums, ersetzt diese Daten durch `awards` (nur Slot, Wurf und Gewinnerplätze) und `remaining`. Kein API-/WebRTC-Zustand an Gäste enthält geheime oder bereits entdeckte Koordinaten oder vorzeitige Treffer. Verdeckte Spielblätter bleiben zusätzlich redigiert. Die Validierung unterscheidet vollständige autoritative Spielstände und öffentliche Gästeprojektionen; ein Gastgeber kann nicht mit einer unvollständigen Projektion weiterwerten.

Computerplanung arbeitet ohne die geheimen Bonuspositionen, auch bei hypothetischen schweren Zügen. In neuen Schatzsuchen dürfen Mittel/Schwer ausschließlich eigene bereits erhaltene grobe Hinweise berücksichtigen. Bereits bekannte Prämien dürfen in einer offenen Endwertung berücksichtigt werden; unbekannte Positionen werden nicht gelesen und kein Zukunftszufall verbraucht. Die üblichen Grenzen lokaler Speicherung gelten: eine lokale App bzw. der Direkt-Gastgeber muss den vollständigen Zustand zum Weiterwerten speichern. Das ist keine kryptographische Geheimhaltung gegen Zugriff auf den eigenen Gerätespeicher. Diagnoseexporte enthalten weiterhin weder Bonuspositionen noch Spielblätter oder Punktesummen.

## Prüfung

Regressionen decken eindeutige Auswahl, alle Bretter und Spielerzahlen, ausgeschaltete Altstände, sechs gleichzeitige Treffer in unterschiedlicher Reihenfolge, Reservierung bis Wurfende, spätere Treffer ohne erneute Auszahlung, mehrere Boni in einem Zug, letzten Solo-/Mehrspielerwurf, Minenschaden vor und nach Wertung, Sicherung/Neuladen, öffentliche und verdeckte Projektionen, Eingabevalidierung, XSS-sichere Texte und geheime Computeranalyse ab. Direktprotokoll und Raum-API prüfen Hostrechte, Lobbybindung, tatsächliche Fähigkeit, alte Clients, Wiederverbindung, verlorene Quittungen, Deduplizierung und neue Revanchen. Gerenderte Handy-/Tablet-/Desktop-Prüfung und verbleibende Gerätebedingungen werden in [Responsive QA](responsive-qa.md) festgehalten. Physische Zwei-Handy-/Hotspot- und subjektive Balanceprüfung bleiben separat.
