# Eine Partie freiwillig verlassen

<!-- farbfeld-version: 1.19.3 -->

## Gerätelokal verwerfen ohne Verbindung

Beenden einer Direktpartie bietet unabhängig von Erreichbarkeit eine zusätzliche ausdrücklich bestätigte Option Auf diesem Gerät verwerfen. Sie löscht nur den gespeicherten Direktstand samt Zugang und schließt lokale Kopplung/Kanäle. Andere Handys behalten ihre Kopie. Kein gemeinsamer Ausstieg, −10-Ergebnis, Sieg oder Gastgeberwechsel wird daraus abgeleitet. Der normale verbundene Verlassen-Zug mit −10 Punkten bleibt unverändert. Pausierte, ausstehende und bereits verlassene Direktpartien lassen sich lokal entfernen; Rückkehr aus dem Bestätigungsdialog verändert nichts. Veraltete Bestätigungen entfernen keine ersetzte Sitzung, Speicherausfälle lassen den bisherigen Zugang erhalten.


## Ort der Aktion

Direktpartie, Internet-Gruppenraum und Ein-Handy-Mehrspieler: im laufenden Spiel **Beenden** wählen, danach **Verlassen · −10 Punkte** bestätigen. Die Startkarte einer Direktpartie öffnet nur die Sitzung und bietet keinen Ausstieg an. Rollen, einmaliger −10-Verlauf, letzter aktiver Sieger und Relaypflicht des ursprünglichen Direkt-Gastgebers bleiben unverändert.

In einer laufenden Mehrspielerpartie öffnet × **Partie verlassen?**. Erst **Verlassen · −10 Punkte** bestätigt den Ausstieg. Die Person erhält sofort einen einmaligen negativen Verlaufseintrag mit **fest −10 Punkten** und einer Niederlage. Der Wert ersetzt ihren Spielpunktestand; es ist kein Abzug von der vorherigen Summe. Die übrigen spielen mit ihren bestehenden Blättern, Würfeln und Regeln weiter. Solo-Abbruch und verworfene Kopplungen erzeugen keinen solchen Eintrag.

## Spielregeln und letzte Person

Ausgestiegene haben keine weiteren Würfe, Züge oder Minenaktionen und blockieren keinen Rundenabschluss. Beim Ausstieg vor dem Würfeln rückt die aktive Person weiter. Während einer Auswahl gilt der fehlende Beitrag als erledigt; bereits bestätigte Züge und reservierte Bonusfelder bleiben erhalten und werden höchstens einmal gewertet. Kein neuer Würfelwurf, keine Rücknahme anderer Züge. Minen treffen nur noch aktive Gegner. In einer Minenpartie werden vorhandene Erstansprüche anhand der frühesten noch aktiven vollständigen Halter neu verteilt.

Bleibt genau eine aktive Person, endet die Partie sofort mit ihr als Sieger. Das gilt auch bei −22 Punkten gegenüber −10 eines Ausgestiegenen. Ein bereits beendetes Spiel akzeptiert keinen weiteren Ausstieg, sodass nie eine leere laufende Gruppe entstehen kann. Ausgestiegene stehen in der Rangliste hinter aktiven Personen und erhalten keinen geteilten Sieg.

## Internet: Gastgeberwechsel

Die autorisierte Aktion gehört zur aktuellen Spielkennung und Version. Gleichzeitig konkurrierende Aktionen können einen begrenzten Versionskonflikt melden; anschließend den aktuellen Stand erneut bestätigen. Authentifizierter Spielerzugang bestimmt die Person, niemals ein mitgesendeter Name/Index. Beim Gastgeberausstieg geht `hostId` atomar an die erste verbliebene aktive Person. Das gilt auch bei zwei rasch aufeinanderfolgenden Ausstiegen. Die laufende Partie behält feste Spielerindizes.

Beim nächsten Lobbywechsel werden Ausgestiegene aus der Raumgruppe entfernt. Ihre alten Zugangsschlüssel verlieren dann die Berechtigung; ein erneuter Beitritt mit demselben Raumcode ist in der Lobby als neuer Platz möglich. Die letzte Person kann in der Lobby weitere Personen einladen, aber allein keine neue Multiplayerpartie starten. Ausgestiegene erhalten keine neuen Zug-/End-/Revanchehinweise für die verlassene Partie.

## Offline: ursprünglicher Gastgeber als Verbindung

Die Direktverbindung bleibt eine Sternstruktur. Der ursprüngliche Gastgeber kann spielerisch aussteigen und als Zuschauer bleiben, sein Handy muss Farbfeld jedoch bis zum Spielende geöffnet halten. Der Bestätigungsdialog und die Zuschaueransicht sagen dies ausdrücklich. Es findet **keine automatische Übernahme der Offline-Gastgeberrolle** statt. Bei Unterbrechung dieses Relays pausiert die Gruppe sicher; erneutes Koppeln mit dem ursprünglichen Gastgeber setzt denselben autoritativen Stand fort. Bestätigte Aktionen bleiben dedupliziert gespeichert, keine selbstgewählte zweite Autorität.

Ausgestiegene Gäste dürfen ihre Verbindung schließen und blockieren die übrigen dann nicht mehr. Alle noch aktiven Handys müssen weiterhin verbunden sein. Nach dem Ende für eine neue kleinere Offline-Gruppe neu koppeln. [Zwei-Handy-Testprotokoll](offline-diagnostics.md).

## Verlauf und verdeckte Punkte

Einzelne Geräte verwenden die vorhandene Spiel-ID zur Deduplizierung. Am gemeinsam weitergegebenen Handy bekommen Ausstiege eigene IDs mit Spielerplatz; das spätere Gruppenergebnis bleibt ein gesonderter Datensatz für eine verbliebene Person. Das ist ein Geräteverlauf ohne Konten, keine Identitätszuordnung. Bei verdeckten noch laufenden Partien werden unbekannte Gegnerwerte als verborgen gespeichert, niemals als erfundene Null. Die Ausstiegsniederlage bleibt auch nach Neuladen/Import einmalig. Die normale Statistik enthält keine Spielblätter oder Zugänge.

Alle aktiven Netzwerkclients müssen `leave-game-v1` ab 1.17.0 tatsächlich bestätigen, bevor die neue Ausstiegsaktion angeboten/angenommen wird. Altstände ohne Ausstieg bleiben kompatibel; bereits ausgestiegene Partien lassen sich nicht mit einem älteren Client weiterspielen. Keine Datenbankmigration, neue Push-Art oder Hintergrundabfrage.

## Prüfung

Regel-, Sechsergruppen-, Direktprotokoll- und Raum-API-Prüfungen decken Gastgeberübergabe, letzten Spieler, Reihenfolge in Wurf-/Auswahlphasen, bestätigte Bonusfelder, alte Clients, falsche Identität/Partie, Deduplizierung, verlorene Quittung, Gastverbindungsende, Relayverlust und exakte Wiederaufnahme ab. Negative Siegerwerte und verdeckte sofortige Verlaufseinträge sind getrennte Regressionen. Physische Android-/Hotspot-Abnahme bleibt separat.
