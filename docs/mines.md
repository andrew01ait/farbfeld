# Optionaler Luftangriff

<!-- farbfeld-version: 1.34.2 -->

Treffer, leeres Ziel und Freigabeimpuls lassen sich unter **Hilfe & Diagnose → Animationen testen** abspielen. [Animationsvorschau](offline-diagnostics.md#animationsvorschau)

## Karte und Hilfe

Der gemeinsame Kartenkopf zeigt Statuschips linksbündig unter dem Titel und die Hilfe in derselben Spalte wie die anderen Spielkarten. Die eigenen Freischaltungen bleiben sichtbar, die Mitspielenden lassen sich bei Platzmangel seitlich durchsehen. **Ziel wählen** steht bei Bereitschaft unter dem Kopf. Hilfe und Zielwahl haben mindestens 44 Pixel Antippfläche.

Das **?** erklärt die Freischaltungen der aktuellen Partie, die Zielwahl, die Punkte und die Markierungen. Bei einer Partie mit einzelnem Luftangriff steht nur die Freigabe nach dem Farbabschluss darin. Mit zwei möglichen Angriffen führt die Hilfe auch die Schwelle **70 Felder** auf.


Seit 1.22.0 heißt der bisherige **Minenangriff** in der Oberfläche **Luftangriff**. Flugzeugsymbol und Überflug mit anschließendem Einschlag unterscheiden ihn von den neuen [versteckten Minen](hidden-mines.md). Alle bisherigen Regeln, Kosten, Freischaltungen und gespeicherten Spielstände bleiben erhalten. Historische technische Namen wie game.mines, applyMineAttack und mines-v1 sind absichtlich unverändert.

## Vor einer neuen Partie wählen

Freiwillige Startregel für zwei bis sechs Personen: Computer, gemeinsam an einem Handy, Internet-Raum und Offline-Direktgruppe. Kein Solo. Bei Netzwerkpartien entscheidet der Gastgeber in der Lobby. Classic, Flusslauf, Mosaik und Random sowie offene/verdeckte Punkte werden unterstützt. Alte Spiele ohne diese Option bleiben Standardpartien. Die frühere Begrenzung auf Computerpartien wurde auf ausdrücklichen Nutzerwunsch ab 1.17.0 aufgehoben.

## Zwei mögliche Freischaltungen gegen alle Gegner

- Ein gemeinschaftlich gewerteter Farbabschluss schaltet für **alle anderen aktiven Personen** je einen Angriff frei. Sobald eine Person nach einem bestätigten Zug mindestens 70 von 105 Kreuzen auf ihrem eigenen Brett hat, schaltet sie unabhängig davon für dieselben Gegner je einen weiteren frei. Die Freischaltungen bleiben auch bei späterem Schaden bestehen. Ausgelöste versteckte Minen werden vor dem Zählen abgewickelt.
- Pro Bedingung steht jeder Person einmal ein Angriff zur Verfügung. Angriffe sind zusätzliche Aktionen in der eigenen Auswahl vor dem normalen Bestätigen. Würfel, Joker und normaler Zug bleiben erhalten. Nach Spielende sind keine Angriffe mehr möglich.
- **Fünf Punkte je Angriff**, auch bei einem Fehlschlag gegen alle Gegner. Die Kosten werden pro Einsatz abgezogen. Es gibt keine Mindestpunktzahl.
- Ein gemeinsames Zielfeld A–O/1–7 wählen. Es wird unabhängig auf jedem aktiven Gegnerblatt geprüft; das eigene Blatt bleibt intakt. Ausgestiegene werden nicht mehr angegriffen.
- Ist das Zentrum bei einem Gegner leer, entfernt der Angriff dort **überhaupt nichts**, auch keine belegten Nachbarn. Andere Gegner können mit derselben Koordinate getroffen werden.
- Bei belegtem Zentrum: dieses Kreuz und zufällig drei bis fünf belegte achtfach angrenzende Nachbarn ohne Zurücklegen entfernen. Diagonalen zählen; bei weniger belegten Nachbarn nur diese. Keine Zeilenumbrüche an Kanten.
- Bei mehr als zwei Personen zeigt die Zielwahl das gemeinsame unmarkierte Raster. In einer offenen Zweierpartie darf das eine Gegnerblatt sichtbar sein. Bei verdeckten Punkten niemals gegnerische Kreuze, Schadenspositionen oder Trefferzahlen offenlegen; eigener empfangener Schaden bleibt sichtbar.

## Wertung nach Schaden

Nicht mehr vollständige Spalten/Farben verlieren sofort ihre Punkte; entfernte Sterne kosten wieder zwei Punkte. Die früheste noch aktive Person mit bereits gewertetem vollständigem Abschluss erhält den Erstbonus. Mehrere Halter aus demselben frühesten Wurf erhalten ihn alle. Spätere vollständige Halter erhalten den niedrigeren Bonus. Ohne verbleibenden Halter wird der Erstbonus wieder frei. Wiedervervollständigen erzeugt einen neuen Abschlusszeitpunkt. Noch nicht gemeinsam gewertete Kreuze erhalten durch einen Angriff keine vorzeitigen Punkte.

**Bonusfeld-Punkte bleiben erhalten**, einschließlich bestätigter, im aktuellen Wurf noch nicht veröffentlichter Funde. Kein erneuter Bonus durch Wiederauffüllen. Der Einsatz wird unabhängig von dieser Neubewertung abgezogen. Das normale Ende nach zwei vollständigen Farben einer aktiven Person gilt nach gemeinsamer Rundenwertung weiter.

Bestätigte Schüsse/Versenkungen, exklusive Funde/Ladungen und mit einem Zug erfüllte Aufträge bleiben ebenfalls erhalten, auch vor der gemeinsamen Wertung. Bei individuellen gemischten Farbplänen verwenden Zielansicht und Schaden boardFor(game,pid). Beschädigte Felder behalten zunächst ihre Farbe und nehmen erst an der nächsten planmäßigen Mischung teil. Dort bleiben freie Gruppen zusammenhängend; markierte Felder verbinden sie nicht. Der Luftangriff erhöht den Aktionszähler, nicht Runde/Mischintervall. Eine Entdeckerfähigkeit darf danach im normalen Zug verwendet werden. [Kombinationen](computer-variants.md).

## Zielwahl und Fluganimation

Die neutrale Box mit 32-Pixel-Flugzeugsymbol zeigt rechts die bisher eingesetzten eigenen Punkte. Der Abzug beträgt −5 P nach einem und −10 P nach zwei Angriffen und bleibt verdeckt, wenn die Punkte verdeckt sind. Die beiden Freischaltungen zeigen Gesperrt, Bereit oder Verbraucht mit Schloss, grünem Häkchen oder durchgestrichenem Kreis. Hilfe und Zielwahl behalten mindestens 44 Pixel Antippfläche; nur Bereitschaft erhält den grünen Akzent.

**Ziel wählen** öffnet **Luftangriff einsetzen.** Raster zuerst: A–O, Zeilen 1–7, Antippen oder große Spalten-/Zeilenfelder in beliebiger Reihenfolge. Ein Zielkreuz markiert die gewählte Koordinate. Gestrichelte Nachbarn zeigen nur den möglichen Bereich; bei bekannt leerem offenem Ziel gibt es keinen Nachbarbereich. Niemand sagt die zufälligen Schadensnachbarn voraus. **H4 angreifen · −5 P** bestätigt das genaue Ziel; Abbrechen kostet nichts. Regeln stehen eingeklappt unter **So wirkt der Angriff**. Fokus, Rasterposition und geöffnete Regeln bleiben bei Zielwechsel erhalten. Während ausstehender Quittierung bleibt das Ziel fix und der Knopf zeigt Wird bestätigt ….

Erst die autoritative Bestätigung schließt den Dialog. Ein zellgebundenes Flugzeug fliegt 2,2 Sekunden diagonal über das Ziel. Die Bombe erreicht das Feld, bevor sich die Druckwellen ausbreiten. Nur bestätigte Felder animieren. Ein leeres Ziel zeigt eine blaue Welle und Kein Schaden. Die Zelleffekte enden nach drei Sekunden. Das obere Banner bleibt bis zu sechs Sekunden sichtbar. Bei reduzierter Bewegung bleibt die Meldung statisch.

Liegt das sichtbare Ziel außerhalb des freien Brettbereichs, scrollt Farbfeld vor dem Anflug dorthin. Auf schmalen Geräten zählt auch der waagrecht sichtbare Ausschnitt. In Ansichten mit fester Würfelleiste liegt das Ziel oberhalb der Leiste und unter dem Banner.

Entfernte Kreuze sind leere Farbflächen mit roter gestrichelter Kontur und zellabhängigem Minus-Kreis. Später wieder angekreuzte Zellen tragen einen grünen durchgehenden Rand. Die Karte **Luftangriff** zeigt die Zahl der entfernten und wieder angekreuzten Kreuze des sichtbaren Spielfelds und das Ende der jeweiligen Markierung. Jede Markierung bleibt bis zum Ende des nächsten vollen Wurfs. Die Karte dokumentiert auch das Ziel, die Runde und das bestätigte Ergebnis des eigenen letzten bezahlten Angriffs. In Gruppen steht dort die Gesamtzahl der entfernten Kreuze. Bei verdeckten Punkten bleibt der fremde Schaden verborgen.

In offenen Partien lässt sich das betroffene Blatt ansehen und mit **Zu meinem Spielfeld** verlassen. Eigene Würfel/Feldwahl bleiben erhalten. Der Computer verwendet seinen bestehenden Luftangriff vor dem normalen Zug und wartet den Effekt ab; offene Auswahl anhand bekannter Fakten, verdeckte Auswahl blind ohne fremde Daten oder zukünftigen Zufall.

## Zustand und Kompatibilität

`game.mines` Schema 1 behält die ursprüngliche Farbfreigabe. Schema 2 führt für die Flächenfreigabe zusätzlich `coverage.unlocked` und `coverage.used`. Vollständige Autorität führt Abschlusswürfe pro Spalte/Farbe und höchstens einen Angriff je Freischaltung und Person. Alte Zweierstände ohne Rundenregister werden aus vorhandenen Abschlüssen abgeleitet. Gäste erhalten eine getrennte Projektion ohne Abschlussregister; verborgen werden ausschließlich eigene Schadenszellen übertragen. Öffentliche Projektionen lassen sich nicht als vollständige Autorität weiterrechnen.

Server/Direkt-Gastgeber prüfen authentifizierte Person, Spielkennung, Wurf und Version; Schaden an allen Gegnern, verwendete Freischaltung und fünf Punkte Einsatz werden zusammen gespeichert. Ein wiederholter Befehl für eine verbrauchte Freischaltung verändert die Partie nicht. Neue Netzwerkpartien verwenden beide Freigaben mit bestätigtem `airstrike-coverage-v1` ab 1.33.0 auf allen Geräten. Die bisherige Regel bleibt mit bestätigtem `mines-v1` ab 1.17.0 spielbar. Neue Gruppenstände nicht mit 1.16.0 fortsetzen. Die Umbenennung allein erfordert keine neue Fähigkeit oder Kopplung. Keine DB-Migration, Push-Art oder Hintergrundabfrage. Statistik enthält die abschließende Wertung; freiwilliger Ausstieg ersetzt sie mit −10, siehe [Aussteigen](leaving.md).

Versteckte Minen stehen auch im Mehrspielerspiel zur Wahl. Wenn beide Regeln gewählt sind, teilen sie dieselbe Schadensroutine und dasselbe vorhandene Abschlussregister. Die automatische Mine verursacht keinen zusätzlichen Fünf-Punkte-Einsatz, verbraucht den Luftangriff nicht und löst keine Kettenreaktion aus. [Minenregeln und aktueller Freigabestand](hidden-mines.md), [Browser-/Testnachweise](responsive-qa.md).
