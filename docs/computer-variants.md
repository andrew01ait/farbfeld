# Spielvarianten für Computer und Menschen

<!-- farbfeld-version: 1.34.2 -->

Treffer, Fehlschuss, beide Versenkungsrichtungen und der Farbwechsel lassen sich unter **Hilfe & Diagnose → Animationen testen** ausprobieren. [Animationsvorschau](offline-diagnostics.md#animationsvorschau)

## Freigabe für menschliche Mehrspieler · 1.25.0

Die versteckten Minen und die echte Schatzsuche erweitern die bestehenden Varianten in Ein-Handy-, Direkt- und Internetpartien. Bei Kombination mit Schiffsboni folgen Flotte und Minen pro Person direkt aufeinander. Die Netzwerkprojektion liefert je Platz nur seine eigenen Schatzhinweise und geheimen Aufstellungen. Die vorhandenen Wertungsregeln für offene Aufträge, Fähigkeiten, Schiffe und Mischung greifen gemeinsam mit Minenschäden und Schatzfunden.

## Kombinationen und kompakte Spielkarten · 1.23.1

Versteckte Minen dokumentieren ihren Schaden ohne automatischen Gegnerblattwechsel. Suchhinweise nennen eigene Felder plus Abstandserklärung; ältere laufende Computer-Bonuspartien erhalten Hinweise beim nächsten bestätigten Zug mit unverändert sechs Punkten maximal. Neue Schatzketten bleiben neun. [Suchregeln](bonus-fields.md), [Minenberichte](hidden-mines.md).

Die unabhängige Wertungsprüfung unterscheidet ausdrücklich chainBonus:false von neuen Ketten, einschließlich Beschädigung/Wiederauffüllen, beiderseitigen Funden, Fähigkeiten, Schiffen, Fristen und Mischung. 448 vollständige Kombinationen sind Bestandteil der 540 Regressionen. Keine neue menschliche Freigabe für versteckte Minen oder Suchhinweise. Handy-Karten nutzen kompakte Ein-/Zweispalten und volle offene Detailzeilen; Hauptblatt/Schusskarte behalten eigenes Einpassen/Zoom.

## Schatzsuche 1.23.0: getrennt vom Fähigkeitsmodus

Die drei optionalen **versteckten Bonusfelder** werden in neuen Computerpartien zur Schatzsuche: Warm/kalt nach bestätigten Zügen, grobe Fundspur und +3 zusätzlich für alle drei eigenen Funde. Das ist ein separates Bonusmodul, keine Änderung der folgenden sechs sichtbaren Entdecker-/Fähigkeitsfelder. Menschliche Varianten erhalten die neue Suchregel nicht; ältere laufende Computerpartien erhalten seit 1.23.1 Hinweise mit unveränderter alter Wertung. [Vollständige Regeln und Punkte](bonus-fields.md). Die unabhängige Kombinationswertung berücksichtigt maximal 9 statt 6 Bonuspunkte ausschließlich bei solchen neuen Computerständen.

## Schatzsuche und Hilfespalten · 1.22.5

Die optionale Suche nach drei versteckten Bonuspositionen heißt jetzt **Schatzsuche**, mit denselben Punkten und Regeln. Der Entdeckermodus mit sichtbaren Fundorten/Fähigkeiten bleibt eine separate Variante. Einheitliche reservierte Pfeil-/Hilfespalten halten alle Fragenzeichen und eigenen Punkte bündig. Keine neue Mechanik oder menschliche Minenfreigabe.

## Schiffsanker · 1.22.4

Das gemeinsame Schiffssymbol ist in Flottenbestätigung, Schiffsboni-Panel, Variantenwahl und Ergebnis vollständig sichtbar. Spielregeln, Punkte, Verdeckung und die 1.22.3-Aufstellung bleiben erhalten. Die neue geheime Mine bleibt zunächst gegen Computer.

## Schiffe und Minen vollständig aufstellen · 1.22.3

Beide Aufstellraster starten mit A–O/1–7 vollständig im verfügbaren Kartenbereich. Pinch und −/+ vergrößern bis 260 Prozent; Einpassen zeigt wieder alle Felder. Unterschiedliche Bildschirmausrichtungen, private eigene Rolle, Koordinaten, Drehung und bestehende Bestätigung bleiben erhalten. Die eigene Flotte und anschließend eigene Minen können direkt nacheinander vorbereitet werden; Warten kommt erst nach den erforderlichen eigenen Schritten. Die gemeinsame Startfreigabe bleibt unverändert. Versteckte Minen bleiben zunächst gegen Computer.


## Schiffsboni: ganze Karte und sinkende Schiffe · 1.22.2

Die ausgeklappte Zielkarte passt vollständig in die Bildschirmbreite. Pinch und −/+ vergrößern unabhängig vom eigentlichen Spielblatt; Einpassen setzt auf 100 Prozent der verfügbaren Kartenbreite zurück. Eigene bestätigte Schüsse/Wracks bleiben die einzige Informationsquelle. Vollständige versenkte Schiffe sinken wieder sichtbar innerhalb ihrer Zellen. Verdeckte gegnerische Schüsse einschließlich Versenkungsorten bleiben verborgen. Regelhilfe **?** und Aufklappen sind getrennte Aktionen.


Versteckte Minen nutzt dieselbe native Aufklappkarte: eigene Punkte rechts, geschlossen höchstens eine kurze Statuszeile (2/2 scharf · 0 ausgelöst). Erklärung/eigene Sicherheit liegen in den Details; der Öffnungszustand bleibt beim nächsten Rendern erhalten.


## Einheitliche Vorbereitung und kompakte Karten 1.22.1

Flotte und versteckte Minen teilen jetzt eine gemeinsame Oberfläche. Bestehende Flottendrehung, Koordinaten, private Bestätigung und Reihenfolge bleiben erhalten. Alle laufenden Variantenkarten zeigen Fortschritt kompakt unter dem Titel und eigene Punkte rechts; Auftragsfristen bleiben immer sichtbar. Keine Wertungs-/Regeländerung.


## Versteckte Minen und Luftangriff · 1.22.0

Eine fünfte neue Regel steht zunächst **nur gegen Computer** bereit: [Versteckte Minen](hidden-mines.md). Beide Seiten legen je zwei geheime Minen vor Spielbeginn aus. Eigene Minen sind ungefährlich, bestätigte gegnerische Kreuze einschließlich Zusatzfeld lösen sie einmalig aus. Die Explosion verwendet dieselben tatsächlichen Nachbarschäden und dieselbe normale Neuverteilung wie ein Luftangriff, ohne dessen Einsatzgebühr oder Verbrauch. Keine Kettenreaktionen durch Explosionen oder Luftangriffe. Bereits verdiente Funde, Schüsse, Versenkungen, Bonusfelder und Auftragserfüllungen bleiben erhalten; Wiederauffüllen belohnt sie nicht erneut. Minepositionen bleiben beim Mischen fest. Bei gleichzeitiger Landung auf beiden Minen werden beide einmal verbraucht.

Menschliche Ein-Handy-/Direkt-/Internetpartien behalten die vier ausdrücklich freigegebenen Varianten. Die neue Regel wird erst nach einem weiteren Nutzer-OK dort ergänzt. Der bisherige manuelle Minenangriff heißt jetzt Luftangriff und behält seine bisherigen Mehrspielerregeln.


## Minenfeedback 1.21.2

Die Kombinationen und Wertung bleiben erhalten. Die neue Zielwahl bestätigt Koordinate/Einsatz, zeigt mögliche statt behauptete Zufallsnachbarn und hält Detailregeln eingeklappt. Nur tatsächlicher bestätigter Schaden animiert am richtigen Blatt. Verlorene normale Kreuze unterscheiden sich als rote Minusfelder von dauerhaften Schiffstreffern/Entdeckerfunden; Wiederauffüllen wird grün markiert. Eigener Zugentwurf bleibt nach einem eigenen Angriff erhalten. Verdeckte fremde Ergebnisse bleiben verborgen.


## Punkte, Auftragsfristen und Ergebnis 1.20.6

Rechts im Kopf stehen nur eigene bestätigte Punkte; Treffer, Versenkungen, Fähigkeiten, erfüllte Aufgaben und Mischfortschritt stehen darunter. Entdecken und Mischen vergeben direkt null Punkte. Verdeckte Partien zeigen Werte erst am Ende. Alle drei Auftragsfristen bleiben geschlossen sichtbar; Runde 12 ist bei Frist 12 die letzte gültige Runde, erst Runde 13 ist abgelaufen. Bereits erhaltene Punkte bleiben nach Fristende erhalten. Ergebnis und Punktevergleich zeigen die jeweiligen lokalen Symbole.

Am 11.11.2026 wurde die Freigabe dieser vier Varianten für echte Mehrspieler nach der aktuellen UI ausdrücklich genehmigt. Mit 1.21.0 ist diese Freigabe umgesetzt; Schiffe weiterhin genau zwei Personen, übrige Varianten 2–6.


## Schiffstreffer und Zoom 1.20.5

Bestätigte Treffer auf der eigenen Flotte werden zellabhängig als roter Vektorstern samt Rahmen gezeichnet. Heraus-/Hineinzoomen und Einpassen ändern weder Angriffszustand noch Punkte; die Anzeige bleibt innerhalb des betroffenen Feldes. Die separate Angriffskarte und Treffer-/Versenkungsanimationen bleiben erhalten.


## Schiffsboni auf niedrigen Querformat-Bildschirmen 1.20.4

Geöffnet erscheinen Schiffsboni als ganze Zeile unter den kompakten Statuskarten. Eigene Treffer/Versenkungen und Erklärung links, komplette Angriffskarte plus Legende rechts. Umschalten und Orientierungswechsel erhalten den aktuellen Zug und geöffnete Details. Spielbrett, Würfel und Angriffe verwenden dieselben bestätigten Daten und unveränderte Regeln wie bisher.


## Schiffskarte und Hilfezeichen 1.20.3

Wasser nach bestätigten Angriffen erscheint als kontrastreiches blaues Feld mit Ring und ist in Legende/Screenreader als „Fehlschuss (Wasser)“ bezeichnet. Darstellung liest weiter nur bestätigte Schussergebnisse; verdeckte Schiffe werden während der Partie nicht ausgewertet. Kleine Hilfezeichen behalten die große Antippfläche. Keine Änderung an Flotte, Angriffen, Minenfolgen, Prämien oder Computer-only-Freigabe.


## Bedienung und Übersicht ab 1.20.2

**Farbwahl** aktivieren, gewünschte Farbe und einen Zahlenwürfel wählen, dann Felder markieren und bestätigen. Die Reihenfolge von Farbe/Zahl ist frei. Ein tatsächlich verfügbarer Farbwürfel wird als ersetzter Würfel zugeordnet, wenn noch keiner gültig gewählt ist. Eine manuell gewählte gültige Position bleibt erhalten. Die normale Würfelentfernung für die andere Person, Zahl, Anschluss und Joker-/Ladungsprüfung gelten weiter. Die Fähigkeit verbraucht keinen Farb-Joker; ein verwendeter Zahlenjoker kostet weiter.

Minen, Bonusfelder, Schiffsboni, Entdeckermodus, öffentliche Aufträge und Neumischung stehen jeweils in einer eigenen Box oberhalb des Spielfelds. Die Schiffs-/Auftragsbox ist zunächst eingeklappt; geöffnete Details bleiben beim unbestätigten Auswählen erhalten. Fähigkeiten lassen sich weiterhin direkt bei den Würfeln einsetzen. Bestätigen, Punkte und Fristen bleiben unverändert.


## Auswahloberfläche ab 1.20.1

Einheitliche kompakte Karten für die vier Varianten und die bisherigen Optionen. Symbole links, lesbare Beschreibungen und deutliches Häkchen rechts; ganze Karte antippbar, Tastatur und native Checkbox erhalten. Die Regeln und Kombinationen aus 1.20.0 bleiben unverändert.


Vier optionale Varianten stehen gegen Computer und für menschliche Mehrspieler bereit. Ein Handy wählt bei der Einrichtung, Direkt-/Internetgruppen durch den Gastgeber in der Lobby. Jede Variante kann mit den anderen sowie Minen und Bonusfeldern kombiniert werden. Schiffe genau zwei, andere Varianten 2–6 Personen; neue Netzwerkpartien verlangen variants-v1 ab 1.21.0 auf jedem Gerät.

## Schiffsboni

Genau zwei Teilnehmer, fünf Schiffe pro Blatt. Gerade waagrecht/senkrecht, ohne Überlappung; seitliche und diagonale Berührung ist erlaubt, kein Mindestabstand. Die menschliche Anfangsflotte lässt sich manuell verschieben/drehen, per Koordinatenauswahl setzen oder neu zufällig verteilen. Jede menschliche Person stellt nur ihre eigene Flotte auf. Nach eigener Bestätigung bleibt sie fixiert; gewürfelt wird erst nach beiden Bestätigungen. Am gemeinsamen Handy trennt eine verdeckende Übergabe die Personen. Der Computer bestätigt seine zufällige Flotte zu Beginn. Zufallsplatzierung ist begrenzt und kann nicht endlos auf eine Anordnung warten.

| Schiffslänge | Bonus nur vollständig versenkt |
| --- | --- |
| 1 | 5 |
| 2 | 4 |
| 3 | 3 |
| 4 | 2 |
| 5 | 1 |

Jedes bestätigte neue Kreuz, einschließlich Zusatzfeld, schießt auf dieselbe gegnerische Koordinate. Auswahl und Vorschau verraten keine Treffer. Schon beschossene Felder lösen nach Minenschaden beim Wiederauffüllen keinen neuen Schuss aus. Treffer sind dauerhaft; nur vollständiges Versenken bringt Punkte, maximal 15. Alle Schiffe zu versenken beendet die Partie nicht: normale zweite vollständige Farbe und gemeinsame Rundenwertung bleiben maßgeblich. Die Bonuspunkte fließen in das Ergebnis ein.

Die Zielkarte enthält vor Spielende ausschließlich bestätigte eigene Schüsse und bekannt gewordene Wracks. Ein offen einsehbares Gegnerblatt zeigt keine gegnerischen Schiffe. Netzwerkantworten enthalten vor dem Ende ausschließlich die eigene Flotte; verdeckte Antworten entfernen zusätzlich alle fremden Schuss-/Treffer-/Wrackkoordinaten und Salvenereignisse, ungewertete Auftragsmeldungen und Farbpläne. Eigene Schiffskonturen bleiben sichtbar; eingehende Treffer und ihre Orts-/Statushinweise erscheinen nur im offenen Spiel oder nach Spielende. Bestätigte eigene/offene Treffer und Versenkungen erhalten zellgebundene SVG-Impulse; reduzierte Bewegung verwendet eine kurze Blende. Verdeckte Partien zeigen keine Bonuszahl in Karte/Animation.

## Entdeckermodus

Sechs von Anfang an sichtbare Fundorte, zwei pro Fähigkeit. Wer den Ort zuerst gültig bestätigt, bekommt exklusiv eine Ladung. Für alle anderen bleibt das normale Feld spielbar, aber ohne weitere Ladung. Insgesamt sechs Ladungen pro Partie; keine Fundpunkte. Die Positionen bleiben auch beim Mischen erhalten.

| Fähigkeit | Wirkung |
| --- | --- |
| Freie Farbwahl ✳ | Frei gewählte Farbe statt Farbwürfel; gewählte Zahl bleibt. Kein Farb-Jokerverbrauch, ein verwendeter Zahlenjoker kostet weiter. |
| Zahl anpassen ±1 | Gewählte Zahl um genau eins erhöhen oder senken; Ergebnis bleibt 1–5. Ein verwendeter Zahlenjoker kostet weiter. |
| Zusatzfeld +1 | Nach der normalen Gruppe ein weiteres freies Feld beliebiger Farbe direkt waagrecht/senkrecht daneben. Normale Wertung, Schuss und Fund gelten auch dort. |

Eine Ladung ist frühestens ab der nächsten Runde verfügbar, also dem nächsten eigenen Zug. Beliebig aufbewahren, gleiche Fähigkeiten sammeln; maximal eine Fähigkeit pro Zug. Nur gültiges Bestätigen verbraucht die Ladung. Vorschau, Wechsel, Abbruch und Passen verbrauchen nichts. Neu im Zug gefundene Ladungen können nicht sofort eingesetzt werden. Ein bestätigter Fund bleibt trotz Mine vergeben; das Markieren desselben Felds erzeugt keine neue Ladung.

## Öffentliche Aufträge

Jede Karte zeigt den eigenen bestätigten Stand im Format **4/10 Grün**, **2/6 Sterne** oder **1/3 Spalten**. Beim Aufklappen bleibt der Zähler gleich. Bereits vorgemerkte oder gewertete Aufträge bleiben vollständig markiert, auch wenn Kreuze später entfernt werden.

Drei gemeinsame Aufträge, Fortschritt aus dem aktuellen eigenen Blatt. Erste Erfüllung 5 Punkte; später 2; gleiche erste Runde für alle jeweils 5. Pro Person/Auftrag einmalig. Eine Zugbestätigung merkt die Erfüllung dauerhaft vor, gewertet wird nach allen normalen Zügen. Frist einschließlich des vollständigen letzten erlaubten Wurfs. Abgelaufene unerfüllte Ziele geben nichts, verdiente Prämien bleiben.

Seit 1.24.0 gibt es **40 mögliche Aufgaben**. Für jede neue aktivierte Partie zieht die Autorität genau drei: einen Spalten-, einen Stern- und einen Farbauftrag. Die Arten werden zufällig auf die drei Fristen verteilt; innerhalb der passenden Art/Frist wird ein Ziel gezogen. Keine drei verschachtelten Aufgaben derselben Art. Die konkreten Ziele werden gemeinsam gespeichert und beim Fortsetzen nicht neu gezogen; laufende ältere Partien behalten ihre bisherigen Ziele.

| Frist | Spaltenziele | Sternziele | Farbziele, jeweils für alle fünf Farben |
| --- | --- | --- | --- |
| Wurf 12 einschließlich | 1 volle Spalte | 3 oder 4 Sterne | 8 oder 10 Felder einer Farbe |
| Wurf 20 einschließlich | 2 volle Spalten | 5 oder 6 Sterne | 12 oder 14 Felder einer Farbe |
| Spielende | 3 oder 4 volle Spalten | 8 oder 10 Sterne | 16 oder 18 Felder einer Farbe |

Das ergibt 4 Spalten-, 6 Stern- und 30 Farbaufträge. Unter Aufträge → ? → Alle 40 Aufträge ansehen steht der vollständige Pool. Es gelten die bisherigen Kriterien und Punkte auch in lokalen, direkten und Internetpartien. Zwei neue Partien können zufällig dieselbe Kombination erhalten; eine garantierte Ausschlussliste vorheriger Partien wird nicht geführt.

Vor der Erfüllung zählt nur der aktuelle Zustand, kein kumulatives Wiederauffüllen. Eine bestätigte Erfüllung bleibt selbst bei Minenschaden vor Rundenende erhalten. Fristen, Status, eigene Fortschrittsbalken und bestätigte Erfüllungsrunden sind sichtbar; tatsächliche Prämienzahlen im verdeckten Spiel erst am Ende.

## Farben neu mischen

Nach jeder fünften vollständig abgeschlossenen Runde: 5, 10, 15 usw. Nur die jeweils eigenen unmarkierten Farben werden neu verteilt. Alle Farbanzahlen bleiben erhalten, insgesamt 21 pro Farbe. Markierte Farben, Sterne, Schiffe und Spezialfelder behalten ihre Koordinaten. Alle Blätter starten identisch und dürfen danach unterschiedlich aussehen. Auch Minenschaden, Hinweise, KI und Farbwertung verwenden den tatsächlich gespeicherten eigenen Plan.

Ab **1.21.1** wechseln ganze zusammenhängende freie Gruppen ihre Farbe, jeweils im Tausch mit gleich vielen freien Feldern einer anderen Gruppe. Vorhandene spielbare Gruppen zerfallen dabei nicht. Kleinere Inseln können sich zu Gruppen bis sechs verbinden; vorhandene größere Altgruppen bleiben erhalten. Einzelne Felder sind ausdrücklich erlaubt, beispielsweise wenn bereits gesetzte Kreuze eine Lücke isolieren. Gibt es keine passenden Tauschpartner, können Gruppen ihre Farbe behalten. Das Verfahren bevorzugt größere Gruppen, ohne Farbanzahlen oder belegte Felder anzutasten. Es ist keine Gleichverteilung aller Einzelpermutationen und keine Garantie auf eine bestimmte Anzahl neuer Gruppen.

Nach Spielende keine weitere Mischung. Mineneinsatz ist eine Aktion, keine Runde. Er entfernt die Markierung, nicht die aktuelle Farbe; dadurch freie Felder nehmen erst an der nächsten planmäßigen Mischung teil. Bestätigte Punkte gehen allein durch Mischen nicht verloren. Countdown und kurze Farbanimation erklären den Wechsel.

## Reihenfolge und Wertung mit Minen/Bonusfeldern

1. Optionaler freigeschalteter Mineneinsatz vor der eigenen normalen Bestätigung, bisherige Kosten insgesamt 5 Punkte.
2. Normalen Zug samt höchstens einer Fähigkeit prüfen und atomar bestätigen. Schüsse/Funde und erreichte Aufträge speichern.
3. Nach allen Zügen versteckte Bonusfelder und Auftragsprämien werten, normale Spalten/Farben einschließlich Gleichstand werten.
4. Normales Spielende prüfen; erst bei weiterlaufender Partie ggf. freie Farben mischen und nächste Runde beginnen.

Minen korrigieren normale Spalten-/Farbboni und offene Sterne. Dauerhafte Schüsse, Versenkungen, Funde/Ladungen sowie erreichte Aufträge und versteckte Bonusfunde bleiben erhalten. Die bisherigen versteckten Bonusfelder bleiben ein separates System: gemeinsamer Fundwurf kann alle Gleichzeitigen belohnen. Die neuen exklusiven Entdeckerregeln werden nicht darauf übertragen.

Gesamtpunkte = Spalten + Farben + verbleibende Joker − 2 × offene Sterne − Minenkosten + versteckte Bonuspunkte + Schiffsboni + Auftragsprämien. Unbestätigte Aufträge erscheinen erst nach Rundenabschluss im Punktestand. Verdeckte Partien verbergen alle tatsächlichen Totale und Aufschlüsselungen bis Spielende.

## Speicherung, Fairness und Prüfungen

Optionales `variants.schema: 1` innerhalb der bestehenden schema-1-Partie, gleiche Geräteschlüssel und JSON-Dateinamen. Import prüft Flotten/Schüsse/Erfolge/Ladungen/Fristen/Farbverteilungen; fehlende Varianten bleiben alte Regeln. Wiederaufnahme erzeugt keine neue Flotte, keinen erneuten Fund und keine doppelte Mischung. Optionale Variantenflags und die eigene Flottenaktion verwenden den bisherigen Direkt-/Raumtransport und JSON-Serverzustand. variants-v1 schützt vor inkompatiblen Apps; kein neuer SQL-Schritt oder Push-Typ. Gastprojektionen sind als projected/viewer markiert und nicht als Autoritätsstand importierbar.

Die KI liest eigene Felder und öffentliche Funde/Aufträge/bestätigte eigene Schüsse. Keine gegnerische Flotte, geheime Bonusposition, verdeckte Gegnerdaten oder künftige Zufallszahl. Leicht bleibt ohne Varianten unverändert. Mit Varianten nutzen Mittel und Schwer öffentliche Ziele; Schwer bleibt auf acht eigene Kandidaten begrenzt und lässt Zukunftsbewertung vor einer Mischung weg. Keine bisher gemessene Siegquote für die neue Variantenbalance behaupten.

`color-mixing.test.mjs` prüft mit fünf Fällen 768 einzelne Ausgangsblätter auf allen vier Brettern mit verschiedenen markierten Lücken und alten zerstreuten Verteilungen, ungeteilte größere Gruppen, exakte freie Farbbudgets, unveränderte Punkte, Wiederaufnahme, alle Autoritätsmodi und begrenzte unmögliche Fälle. `computer-variants.test.mjs` enthält 19 gezielte Regel-/Persistenz-/Geheimhaltungsfälle und komplette kombinierte Partien auf allen vier Brettern/drei Stärken. `scoring-combinations.test.mjs` spielt alle 128 Kombinationen der vier Varianten mit Minen, Bonusfeldern und verdeckten Punkten vollständig, rechnet Komponenten unabhängig aus gespeicherten Fakten nach und prüft tatsächliche Schäden, Wiederaufnahme und Mischung. Zusätzlich 192 vollständige menschliche Zweier-/Sechserkombinationen auf allen vier Brettern und allen drei Modi; Akteure wählen nur aus ihrer eigenen Projektion. tests/human-variants.test.mjs prüft alle Gruppengrößen, Platzierung, Rollen, Verdeckung, Wiederaufnahme und Direktkonflikte. Aktuelle vollständige Regression, API-/Build- und Browsernachweise stehen in [responsive-qa.md](responsive-qa.md).

Weitere Ideen bleiben in der [Roadmap](roadmap.md): Color Swap, Farbbrücken, Koop und wachsendes Raster werden jetzt nicht umgesetzt; vorab platzierte Minen bleiben offen, Challenge-Code ausgeschlossen.
