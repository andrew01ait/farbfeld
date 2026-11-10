# Optionaler Minenangriff

<!-- farbfeld-version: 1.17.3 -->

## Darstellung 1.17.2

Die Minenleiste teilt neutrale Fläche, Kontur, 14-Pixel-Radius und 32-Pixel-Symbolfeld mit Bonus-/Farbhinweisen. Nur das Bereitschaftssymbol und die Bereit-Chips erhalten einen grünen Akzent; die gesamte Karte bleibt neutral. Hilfe und Zünden bleiben 44 Pixel hoch, die eigene Bereitschaftsanimation und die Drei-Sekunden-Explosion bestehen weiter. Rötliche Tönung bleibt tatsächlichem Schaden vorbehalten. [Gestaltung](ui-design.md).

**Minenangriff** ist eine freiwillige Startregel für zwei bis sechs Personen: Computer, gemeinsam an einem Handy, Internet-Raum und Offline-Direktgruppe. Kein Solo. Vor dem neuen Start wählen; in Netzwerk-Lobbys entscheidet der Gastgeber. Classic, Flusslauf, Mosaik und Random sowie offene/verdeckte Punkte werden unterstützt. Alte Spiele ohne Minen bleiben Standardpartien. Die frühere Beschränkung auf zwei Computergegner wurde auf ausdrücklichen Nutzerwunsch ab 1.17.0 aufgehoben.

## Ein Angriff gegen alle Gegner

- Ein gemeinschaftlich gewerteter Farbabschluss schaltet die einmaligen Minen **aller anderen aktiven Personen** frei. Die eigene Mine wird dadurch nicht freigeschaltet. Eine Freigabe bleibt trotz späteren Schadens bestehen.
- Eine Mine pro Person und Partie. Zusätzliche Aktion in der eigenen Auswahl vor dem normalen Bestätigen; Würfel, Joker und normaler Zug bleiben erhalten. Nach Spielende kein Angriff.
- **Insgesamt fünf Punkte Einsatz**, auch bei einem Fehlschlag gegen alle Gegner. Keine Kosten pro Gegner und keine Mindestpunktzahl.
- Ein gemeinsames Zielfeld A–O/1–7 wählen. Es wird unabhängig auf jedem aktiven Gegnerblatt geprüft, das eigene Blatt bleibt intakt. Ausgestiegene werden nicht mehr angegriffen.
- Ist das Zentrum bei einem Gegner leer, entfernt der Angriff bei diesem Gegner **überhaupt nichts**, auch keine belegten Nachbarn. Andere Gegner können mit derselben Koordinate getroffen werden.
- Bei belegtem Zentrum: dieses Kreuz sowie zufällig drei bis fünf belegte achtfach angrenzende Nachbarn ohne Zurücklegen entfernen. Diagonalen zählen; bei weniger belegten Nachbarn nur diese. Keine Zeilenumbrüche an Kanten.
- Bei mehr als zwei Personen zeigt die Zielwahl das gemeinsame unmarkierte Raster. In einer offenen Zweierpartie darf das eine Gegnerblatt sichtbar sein. Bei verdeckten Punkten niemals gegnerische Kreuze, Schadenspositionen oder Trefferzahlen offenlegen; der eigene empfangene Schaden bleibt sichtbar.

## Wertung nach Schaden

Nicht mehr vollständige Spalten/Farben verlieren sofort ihre Punkte; entfernte Sterne kosten wieder zwei Punkte. Die früheste noch aktive Person mit bereits gewertetem vollständigem Abschluss erhält den Erstbonus. Mehrere Halter aus demselben frühesten Wurf erhalten ihn alle. Spätere vollständige Halter erhalten den niedrigeren Bonus. Ohne verbleibenden Halter wird der Erstbonus wieder frei. Wiedervervollständigen erzeugt einen neuen Abschlusszeitpunkt. Noch nicht gemeinsam gewertete Kreuze erhalten durch einen Angriff keine vorzeitigen Punkte.

**Bonusfeld-Punkte bleiben immer erhalten**, auch bereits bestätigte, im aktuellen Wurf noch nicht veröffentlichte Bonustreffer. Kein erneuter Bonus durch Wiederauffüllen. Der Einsatz wird unabhängig von diesen Neubewertungen abgezogen. Das normale Ende nach zwei vollständigen Farben einer aktiven Person gilt nach gemeinsamer Rundenwertung weiter.

## Kompakte Bedienung und sichtbarer Schaden

Die kleine Leiste zeigt ab 1.17.1 dauerhaft ein gefülltes Minesweeper-Symbol, auch auf dem kleinsten Handy. Der eigene Status lautet **Gesperrt**, **Bereit** oder **Verbraucht**, ergänzt durch Schloss/Grünhaken/verbraucht und neutrale/grüne Farben. Weitere Namen lassen sich in einem getrennten Bereich seitlich ansehen; das Minensymbol bleibt dabei stehen. Das Fragezeichen erklärt die Symbole. Beim Freischalten erscheinen **Mine bereit**, ein kurzer Puls und die dauerhaft grüne Bereitschaft; **Zünden · −5** ist nur im erlaubten eigenen Moment bedienbar. Im Ziel-Dialog stehen eine kurze Anweisung und drei Regeln, weitere Details sind eingeklappt. Große Spalten-/Zeilenauswahlen ergänzen das feine Raster.

Nach autoritativ bestätigtem Einsatz läuft die Explosion **drei Sekunden**. Sichtbarer Schaden wird ins Blickfeld gescrollt; betroffene Zellen leuchten langsamer auf. Anschließend bleiben rote gestrichelte Felder und verlorene Kreuze bis einschließlich Ende des nächsten vollen Wurfs markiert. Wieder gefüllte Stellen erscheinen grün gestrichelt. Mehrere Angriffe werden mit ihrer jeweiligen Frist vereinigt. In offenen Partien kann das betroffene Blatt nach eigenem Angriff geprüft und mit **Zu meinem Spielfeld** verlassen werden; die eigene unbestätigte Auswahl bleibt erhalten. Verdeckte gegnerische Schäden erscheinen weder im Effekt noch im Raster. Reduzierte Bewegung wird berücksichtigt.

Der Computer nutzt seine Mine vor seinem normalen Zug und wartet nach dem Angriff auf das Ende des Effekts. Offen wählt er anhand bekannter Kreuze/Sterne/Boni, verdeckt blind ohne Lesen menschlicher Kreuze oder Punkte. Der nächste Zufallsschaden wird nicht vorweggenommen.

## Zustand, Autorisierung und Kompatibilität

`game.mines` bleibt Schema 1. Arrays `unlocked`/`used` passen zur Spielerzahl. Vollständige Autorität führt Abschlusswürfe pro Spalte/Farbe und höchstens eine Angriffshistorie pro Person. Alte Zweierstände ohne Rundenregister werden aus den vorhandenen Abschlüssen abgeleitet. Gästen wird eine getrennte Projektion ohne Abschlussregister gegeben; verborgen werden nur die eigenen Schadenszellen übertragen. Öffentliche Projektionen lassen sich nicht als vollständige Autorität zum Weiterrechnen verwenden.

Server/Direkt-Gastgeber prüfen authentifizierte Person, Spielkennung, Wurf und Version; Schaden an allen Gegnern und fünf Punkte Einsatz werden zusammen gespeichert. Wiederholung kostet keine zweite Mine. Netzwerkpartien benötigen tatsächlich bestätigtes `mines-v1` auf allen Apps ab 1.17.0. Neue Gruppenstände nicht mit 1.16.0 fortsetzen. Keine neue Datenbankmigration, Push-Art oder Hintergrundabfrage. Spielstatistik enthält die abschließende Wertung; freiwilliger Ausstieg ersetzt sie mit −10, siehe [Aussteigen](leaving.md).

## Prüfung

Regressionen für alle Modi/Bretter, zwei bis sechs Personen, unabhängige Treffer/Leerziele, unveränderten Schützen, einmalige Kosten, Freigaben, Grenzen/Zufall, Sterne, chronologischen Erstbonus und Gleichstände, spätere Wiedervervollständigung, Bonusfeldbeständigkeit, Projektionen, geheime Computeranalyse, falsche/alte Aktionen, Wiederaufnahme und verlorene Quittungen. Effektlaufzeit, reduzierte Bewegung und Schadensfristen sind separat geprüft. [Responsive QA](responsive-qa.md) dokumentiert gerenderte Ansichten; echte Android-/Hotspot- und subjektive Balanceprüfung bleiben separat.
