# Versteckte Minen

<!-- farbfeld-version: 1.34.2 -->

Die Animationsvorschau unter **Hilfe & Diagnose** kann eine einzelne Bodenexplosion und zwei gleichzeitige Minen abspielen. [Animationsvorschau](offline-diagnostics.md#animationsvorschau)

## Aufstellung für 2–6 Personen · 1.25.0

**Varianten → Versteckte Minen** ist für Computer-, Ein-Handy-, Direkt- und Internetpartien verfügbar. In Netzwerkpartien bestätigen alle Apps die Fähigkeit hidden-mines-v1. Kombiniert mit Schiffsboni führt der erste Schritt **Flotte bestätigen und Minen auslegen** sofort in Schritt 2. Wer beide Schritte erledigt hat, wartet auf die übrigen aktiven Plätze. In Gruppen mit zwei oder drei Personen gibt es je zwei Minen, ab vier je eine. Im verdeckten Spiel sieht der Besitzer im eigenen Bericht die Zahl der entfernten gegnerischen Kreuze. Fremde Mine und Position bleiben für unbeteiligte Geräte verborgen.

## Dauerhafter Schadensbericht im eigenen Panel · 1.23.1

Eine automatische Mine wechselt nicht mehr zum gegnerischen Dashboard. Das aktuell betrachtete Blatt bleibt erhalten, insbesondere dein eigenes während deines Spiels. Unter **Versteckte Minen** steht geschlossen höchstens eine kurze Zeile, etwa „1/2 scharf · Computer: 6 entfernt“. Der Schadensbericht steht in den Details.

Aufklappen zeigt Berichte mit **Deine Mine → Computer** beziehungsweise eingehendem Schaden, **6 Kreuze entfernt** und Wurf. Im offenen Spiel kommen **Ausgelöst auf H1** und die vollständige Liste tatsächlich entfernter Felder hinzu. Auch kein Schaden wird ausdrücklich mit null dokumentiert. Im verdeckten Spiel ist die Schadensanzahl gemäß Nutzerwunsch sichtbar, der Ort bleibt „Position verdeckt“; keine fremden Koordinaten werden dafür gelesen/ausgegeben. Nach Ende ist die Aufdeckung wie bisher möglich.

Der Verlauf stammt aus vorhandenen permanenten Minenereignissen, überlebt Neuladen und den Ablauf der kurzzeitigen Brett-Schadensmarkierungen. Mehrere gleichzeitig ausgelöste Minen erhalten einzelne Berichte; ihre tatsächlichen Entfernungen werden nicht doppelt gezählt. Der Hinweis oben verweist bei fremdem Schaden auf die eigene Minenkarte. Animationen bleiben auf dem tatsächlich sichtbaren betroffenen Brett; Schadensrechnung und automatische Zugfolge bleiben unverändert. Im Querformat nutzt die offene Karte eine volle Zeile mit Bereitschaft links und Bericht rechts. Berichtsdetail.

## Vollständig eingepasste Aufstellung · 1.22.3

Dasselbe Raster und dieselbe Pinch-/−/+/Einpassen-Bedienung wie bei der Flotte. Bei 100 Prozent alle A–O-Spalten und sieben Zeilen sichtbar; bis 260 Prozent zum genauen Platzieren vergrößern. Die eigene Flottenbestätigung führt direkt zur eigenen Minenaufstellung. Erst nach den nötigen eigenen Schritten kommt gegebenenfalls Warten, der erste Wurf bleibt global gesperrt. Koordinaten, Positionen und Punkte bleiben durch Ansichtsaktionen unverändert. Seit 1.25.0 gilt dieselbe Aufstellung auch im Mehrspielermodus. Minenansicht.


Versteckte Minen nutzt dieselbe native Aufklappkarte: eigene Punkte rechts, geschlossen höchstens eine kurze Statuszeile (2/2 scharf · 0 ausgelöst). Erklärung/eigene Sicherheit liegen in den Details; der Öffnungszustand bleibt beim nächsten Rendern erhalten.


## Gemeinsame Aufstellung 1.22.1

Die Minenvorbereitung verwendet dieselbe Struktur wie Flotte auslegen: Auswahlkarten, A–O/1–7-Raster, Spalte/Zeile, Zufällig verteilen und Minen bestätigen. Bei Kombination folgt sie weiterhin auf die Flottenbestätigung. Zwei eigene Minen, geheime Gegnerpositionen und gespeicherte Vorbereitung bleiben erhalten.


Die optionale Regel steht unter **Varianten → Versteckte Minen**. Der manuelle Angriff steht separat unter [Luftangriff](mines.md).

## Vor dem ersten Wurf

| Zahl der Personen | Minen pro Person | Aktuelle Freigabe |
| --- | --- | --- |
| 2 | 2 | Computer und menschliche Mehrspieler |
| 3 | 2 | Menschliche Mehrspieler |
| 4–6 | 1 | Menschliche Mehrspieler |

Jede Mine belegt eine feste Koordinate A–O/1–7. Eigene Minen müssen auf verschiedenen Feldern liegen; kein Mindestabstand. Minen verschiedener Besitzer dürfen dieselbe Koordinate haben. Schiffe, Sterne, Bonus- oder Entdeckerfelder sperren keine Position. Die Regeln werden vor dem Ankreuzen gewählt und verändern ein laufendes Standardspiel nicht.

Der Computer platziert und bestätigt seine zwei Minen zu Beginn, ohne deine Positionen zu kennen. Deine gültigen Vorschläge kannst du verschieben: Mine 1 oder 2 wählen, Feld antippen oder Spalte/Zeile einstellen und **hier platzieren** wählen. Alternativ **Zufällig verteilen**. Jede Änderung wird gespeichert; Zur Startseite und Neuladen behalten den Stand. **Minen bestätigen · losspielen** fixiert beide Positionen. Mit Schiffsboni wird zuerst die eigene Flotte vorbereitet; der erste Wurf wartet auf beide Vorbereitungen.

## Wann eine Mine explodiert

Nur ein **neu bestätigtes normales Kreuz**, einschließlich des Zusatzfelds, kann eine gegnerische Mine auslösen. Vorschau, Tipp, Passen oder bloßes Anklicken lösen nichts aus. Deine eigenen Minen sind für dich ungefährlich. Auf deinem Blatt steht dort ein kleines Minensymbol, bis der Gegner die Mine auslöst. Fremde unentdeckte Minen bleiben verborgen, auch bei offenen Punkten.

Eine Mine wird genau einmal für die Partie verbraucht. Ihr Besitzer ist geschützt; die Explosion wirkt auf die anderen aktiven Blätter mit derselben Schadensregel wie der Luftangriff. Bei belegtem Zentrum werden das Kreuz und zufällig drei bis fünf belegte achtfach benachbarte Kreuze entfernt; Diagonalen zählen, bei weniger vorhandenen Nachbarn nur diese. Ein leeres Zentrum entfernt nichts und zieht keinen Schadenszufall.

Bestätigt ein Zug beide Minenfelder, werden beide Minen vor der ersten Explosion als getroffen erfasst und genau einmal verbraucht. Ist das zweite Zentrum nach der ersten Explosion schon leer, verursacht die zweite keinen weiteren Schaden. Der Hinweis zeigt beide Koordinaten und die eindeutige Anzahl entfernter Kreuze. Explosionen und manuelle Luftangriffe lösen selbst keine weiteren Minen aus. Wiederauffüllen einer verbrauchten Mine ist sicher. Neue Minen erst in einer neuen Partie.

## Punkte und Kombinationen

Es gibt **keinen zusätzlichen Fünf-Punkte-Einsatz** bei automatischer Auslösung. Die bezahlte Luftangriffsaktion wird nicht verbraucht. Der bestätigte normale Zug zählt weiterhin genau einmal; Runde, Jokerkosten und Abgabe bleiben normal.

Normale Spalten- und Farbabschlüsse werden sofort aus dem tatsächlichen Blatt korrigiert. Der früheste überlebende aktive Abschluss einschließlich Gleichständen erhält den Erstbonus, spätere erhalten den kleineren; ohne Halter wird der Bonus frei. Entfernte Sterne kosten wieder zwei Punkte. Noch nicht gemeinsam gewertete Kreuze erhalten keinen vorzeitigen Abschlussbonus. Wiedervervollständigen erhält einen neuen Abschlusszeitpunkt.

Bestätigte Schüsse/Versenkungen, exklusive Funde/Ladungen, Bonusfeldfunde und mit dem Zug erfüllte Aufträge sind vor der Explosion erfasst und bleiben erhalten, auch vor der gemeinsamen Rundenwertung. Wiederauffüllen belohnt sie nicht doppelt. Nach jeder fünften abgeschlossenen Runde mischen weiterhin nur freie Farben in Gruppen; Minenkoordinaten bleiben fix. Normales Spielende nach der gemeinsamen Wertung bleibt unverändert.

Beispiel aus dem unabhängigen Regressionstest: Versenkung/Fund/Stern auf H1, gegnerische Mine explodiert sofort. Normales Kreuz weg, Versenkungsbonus bleibt; Auftrag und Bonusfeld werden am Rundenende gewertet. Punktestand −22 → −17 → −10; erneutes Ankreuzen stellt nur den Stern wieder her, Endstand −8. Kein zusätzlicher Minen-/Luftangriffseinsatz.

## Anzeige und Animation

Eine eigene neutrale Box über dem Brett zeigt scharfe eigene Minen und eingehende Schäden. Im verdeckten Modus bleiben alle eigenen Punkte bis zum Spielende verborgen. Die Mine vergibt keine unmittelbaren Bonuspunkte; die tatsächliche Schadens-Neubewertung steckt im normalen Punktestand.

Die bestätigte Bodenexplosion verwendet einen kurzen Sternblitz mit hellem Kern, acht Splitter und Druckwellen direkt an der Koordinate; nur tatsächlich entfernte Kreuze verschwinden. Zellrelative SVGs bleiben bei Hoch-/Querformat und beim Zoomen am richtigen Ort. Zwei Zentren eines Zuges werden zusammen angezeigt. Das Banner oben bleibt bis zu sechs Sekunden sichtbar. Die Zelleffekte enden nach drei Sekunden. Reduzierte Bewegung zeigt das statische Banner.

Ein sichtbarer Treffer auf dem angezeigten Spielfeld kommt vor der Explosion ins Bild. Der Zoom und das ausgewählte Spielfeld bleiben erhalten. Wenn Minenexplosion und Schiffsfeuer zusammenfallen, hat der sichtbare Minentreffer Vorrang beim Scrollen.

Rote gestrichelte Minusfelder zeigen entfernte Kreuze. Grüne durchgehende Konturen markieren wieder angekreuzte Felder. In der geöffneten Karte **Versteckte Minen** stehen Anzahl und Frist der Markierungen des betrachteten Spielfelds. Verdeckte fremde Schadenslisten und Ergebnisse werden nicht gerendert. Platzierung, echte Animation, [vollständiger Prüfumfang](responsive-qa.md).

## Speicherung und Grenzen

Optionales `variants.hiddenMines` in Schema 1: je Besitzer Positionen, Bereitschaft und Verbrauch, bestätigte Ereignisse mit stabiler ID. Abschlussregister ist entweder das vorhandene Luftangriffsregister oder ein eigenes nur bei fehlendem Luftangriff; keine doppelte Punktebuchführung. Neue Minenstände benötigen Client 1.22.0. Alle alten Stände ohne diese Option bleiben gültig.

Projizierte Stände enthalten unbekannte gegnerische Positionen als null, keine privaten Abschlussregister und im verdeckten Modus eigene Schäden und die Anzahl entfernter Kreuze für eigene Explosionen. Alle drei Computerstärken planen ohne gegnerische Minenpositionen und ohne Zufallsverbrauch. Die lokale Computerautorität besitzt aus technischen Gründen den vollständigen Spielstand; keine kryptographische Abschottung vom lokalen Gerät. Online- und Direktpartien prüfen die Fähigkeit hidden-mines-v1 auf den Geräten. Die optionale Regel verwendet das bestehende Datenbankschema und die bisherigen Push-Ereignisse.
