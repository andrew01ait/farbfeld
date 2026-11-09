# Optionaler Minenangriff gegen den Computer

<!-- farbfeld-version: 1.16.0 -->

Die experimentelle Variante wird ausschließlich vor einer neuen Computerpartie über **Minenangriff testen** gewählt. Sie ist optional, gilt für beide Personen und ist vorerst nicht für Solo, Ein-Handy-Mehrspieler, Internet-Räume oder Offline-Direktpartien freigeschaltet. Bestehende Computerstände ohne das optionale Feld spielen die Standardregeln weiter. Alle drei Bretter und Computerstärken sowie offene/verdeckte Punkte sind unterstützt.

## Regeln

- Schließt eine Person eine Farbe vollständig ab, wird nach der gemeinsamen Rundenwertung die einmalige Mine des Gegners freigeschaltet. Ein eigener Farbabschluss gibt nicht die eigene Mine frei. Die Freigabe bleibt erhalten, wenn der Farbabschluss später zerstört wird.
- Jede Person kann genau einen Angriff je Partie einsetzen. Er ist eine zusätzliche Aktion während der eigenen Auswahl, vor dem Bestätigen des normalen Zuges. Erst würfeln bzw. auf die aktive Person warten. Der normale Zug, gewählte Würfel und Jokerbudget werden nicht verbraucht.
- Ein Angriff kostet dem Angreifer immer fünf Punkte, auch bei einem Fehlschlag. Es gibt keine Mindestpunktzahl; negative Ergebnisse sind möglich. Joker werden weder ausgegeben noch zurückerstattet.
- Ein beliebiges Zielfeld des Gegnerblatts wählen. Bei verdeckten Punkten zeigt die Zielwahl nur das unmarkierte gedruckte Raster mit Koordinaten und Farben, keine gegnerischen Kreuze oder Erfolgsrückmeldung. Spalte A–O und Zeile 1–7 sind zusätzlich als größere Auswahlfelder erreichbar.
- **Ist das Zielfeld beim Auslösen leer, passiert am Gegnerblatt überhaupt nichts: auch keine Nachbarfelder werden entfernt.** Die Mine und die fünf Punkte sind trotzdem verbraucht.
- Bei einem Treffer wird das belegte Zielfeld entfernt. Zusätzlich wird gleichverteilt eine Anzahl von drei, vier oder fünf Nachbarfeldern ausgelost. Aus den zu diesem Zeitpunkt belegten acht direkt angrenzenden Feldern, einschließlich Diagonalen, werden entsprechend viele ohne Zurücklegen zufällig entfernt. Sind weniger belegt, werden nur diese entfernt. Kein Zeilenumbruch an Bretträndern.
- Nicht mehr vollständige Spalten und Farben verlieren ihren aktuellen Bonus sofort. Wieder offene Sterne kosten wieder zwei Punkte. Bleibt die entsprechende Spalte oder Farbe des anderen Spielers vollständig und bereits gewertet, steigt dieser sofort auf den vollen Erstbonus auf (Spalte laut oberer Wertung, Farbe fünf statt drei). Die fünf Punkte Einsatz werden davon unabhängig abgezogen. Wird die zerstörte Spalte/Farbe später wieder vervollständigt, gibt es den niedrigeren Späterbonus, solange der andere sie weiterhin hält. Hält niemand mehr eine gewertete vollständige Spalte/Farbe, ist ihr voller Bonus wieder frei; gleichzeitige neue Abschlüsse in derselben Rundenwertung erhalten beide den Erstbonus. Noch nicht gemeinsam gewertete Kreuze werden durch den Angriff nicht vorzeitig bepunktet. Zusätzliche oder erneute Minen entstehen dadurch nicht.
- Eine beendete Partie bleibt beendet; danach sind keine Angriffe möglich. Das reguläre Ende nach zwei vollständigen Farben gilt weiter nach gemeinsamer Rundenwertung.

## Bedienung und Computer

Die Minenleiste erklärt die Freigabe und zeigt die verfügbare Zusatzaktion. **Ziel wählen · −5 P** öffnet die Zielwahl; ein Rasterfeld oder Spalte/Zeile auswählen, dann **Mine zünden · −5 Punkte**. Schließen vor dem Auslösen kostet nichts. Die Bestätigung prüft Partie, Zugstand und Berechtigung erneut. Die kleine Explosion zeigt keine tatsächlich getroffenen Nachbarpositionen oder Trefferzahl auf verdeckten Blättern; reduzierte Bewegung wird respektiert.

Der Computer verwendet seine freigeschaltete Mine einmal vor seinem normalen Zug, als eigenen gespeicherten Schritt. Bei offenen Punkten wählt er nach bekannten markierten Nachbarn, Sternen und gefährdeten Boni, ohne den kommenden Zufallsschaden vorauszusehen. Bei verdeckten Punkten wählt er blind eine gleichverteilte Koordinate, ohne die menschlichen Kreuze, Boni oder Joker zur Zielentscheidung zu lesen. Der Angriff und tatsächliche Würfe dürfen Zufall verbrauchen; die normale Zugplanung liest weiterhin keine zukünftigen Würfe.

## Zustand und Kompatibilität

Das optionale `game.mines` enthält Schema 1, `enabled`, je zwei `unlocked`-/`used`-Werte und die letzte Explosion. Aktuelle Spalten-/Farbboni und ihre freien/belegten Ansprüche werden in den bestehenden Spielfeldern unmittelbar neu zugeteilt. Das Spielformat/Backup bleibt Schema 1; Minenstände benötigen einen Client ab 1.16.0 und dürfen nicht mit älteren Clients weitergespielt werden. Import prüft die Metadaten; reguläres Neuladen erhält Einsatz, Freigabe, Schaden und Punktabzug. Eine neue Partie beginnt ohne verbrauchte Minen. Kein Server-Schema, keine Multiplayer-Fähigkeit und keine Push-Art werden ergänzt.

Die gemeinsame Engine bleibt für Angriffsberechtigung, Schaden, Bonusentzug, Kosten und Endwertung zuständig. Die Zielansicht erhält eine separate Projektion ohne verdeckte Kreuze. Spielstatistiken verwenden die normale abschließende Regelwertung einschließlich der fünf Punkte; sie bleiben im Bereich Computerpartien.

## Prüfziele

Regressionen: Startoption/Legacy, Freigabe des Gegners, 3–5 belegte Nachbarn/Ränder, vollständiger Fehlschlag bei leerem Ziel, genau einmalige Kosten, unveränderte Würfel/Zug/Joker, sofortige Bonus-/Sternkorrektur, sofortige Beförderung des verbleibenden Halters, spätere Wiedervervollständigung, erneute Freigabe wenn beide Abschlüsse verloren gehen, Gleichstände und keine vorzeitige Wertung, gültige Sicherung, keine nachträglichen Angriffe nach Spielende, identische verdeckte Zielansichten für unterschiedliche private Blätter und blinde Computer-Zielwahl mit gesperrtem Zugriff auf menschliche Daten. Vollständige simulierte Variantenpartien auf allen Brettern ergänzen die Regressionen; Balance und subjektive Spielwirkung werden anschließend im Computerprototyp getestet.
