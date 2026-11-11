# Internet-Spielräume

<!-- farbfeld-version: 1.19.1 -->

## Kompakte Karten 1.19.1

Online steht zusammen mit Code und bestätigter Spielerzahl in der Metazeile. Raum- und Teilnehmernamen umbrechen vollständig; der aktuelle Gastgeber bleibt fett mit ♛. Neutrale Kartenfläche und kleine Aktionen ersetzen die großen Farbflächen. Zugang entfernen in Alle Räume bleibt bestätigt und gerätelokal; Raumabrufe und Berechtigungen bleiben gleich.


## Viele Räume und Teilnehmer

Die Startseite zeigt höchstens drei gespeicherte Partien, bekannte eigene Zuggelegenheiten zuerst. Alle Räume enthält alle Zugänge mit Online-/Offline-Filter, Suche nach Raumname/Code/Person und zehn Einträgen pro Seite. Karten zeigen Online · Internet-Raum und die Teilnehmer; der aktuelle Host ist fett mit ♛, auch nach Gastgeberwechsel. Teilnehmernamen kommen im bestehenden authentifizierten Index, ausschließlich nach Prüfung des jeweiligen Raumtokens. Keine neuen Polls, keine verlorenen Zugänge durch Filtern.


## Direktnamen 1.18.0

Direktpartien verwenden nun dieselbe kontextuelle Beenden-/Verlassen-Bestätigung wie Internet-Gruppenräume. Ihr optionaler Name bleibt eigene lokal synchronisierte Direktmetadaten; Internet-Raumcode, Hostrechte, Datenbank und Statusabrufe bleiben unverändert.


## Neue Partien mit Zusatzregeln

Nach Erstellen/Beitreten wählt der Gastgeber in der Lobby **Random**, **Minenangriff** und **Bonusfelder** vor **Partie starten**; die drei Optionen sind kombinierbar für 2–6 Personen und offene/verdeckte Punkte. Im Erstellungsdialog steht jetzt ausdrücklich, dass die Wahl anschließend im Raum erfolgt. Bei einer alten App aktualisieren und diesen Raum auf jedem Handy erneut öffnen; vorhandene Fähigkeitsregistrierung bleibt authentifiziert pro Mitglied. Laufende Partien behalten ihre Regeln. Der verdeckte Modus erlaubt währenddessen nur das eigene Blatt, keine fremden Blätter oder Punktestände.

## Neu 1.17.0: Bonusfelder, Random und gemeinsame Minen

Drei geheime **Bonusfelder** vergeben je +2 an alle ersten Finder desselben Wurfs; Bekanntgabe erst nach der gemeinsamen Wertung, Punkte bleiben trotz Minen erhalten. **Random** erzeugt bei jedem neuen Start ein gemeinsames, gespeichert fortsetzbares Brett. Die optionale **Mine** trifft ein gewähltes Zielfeld bei allen aktiven Gegnern, einmal pro Person für insgesamt fünf Punkte. Die Explosion dauert drei Sekunden; Schadensmarkierungen bleiben bis Ende des nächsten Wurfs. Leere Ziele verursachen beim jeweiligen Gegner keinerlei Schaden.

**Partie verlassen** gibt sofort einen einmaligen Verlaufseintrag mit −10 Punkten und Niederlage. Die anderen spielen weiter; die letzte aktive Person gewinnt sofort. Im Internet wandert die Gastgeberrolle weiter. Offline bleibt das ursprüngliche Gastgeber-Handy als Zuschauer und Verbindung geöffnet; Verbindungsverlust pausiert sicher, ohne neue Autorität zu erfinden. Alle beteiligten Apps für neue Regeln auf 1.17.0 aktualisieren. [Bonusfelder](bonus-fields.md) · [Minen](mines.md) · [Random](random-board.md) · [Aussteigen](leaving.md).



Bei einer Revanche ist **Noch einmal spielen** nur der Weg zurück in die Lobby. Erst der nächste bestätigte Start informiert die anderen Teilnehmenden einmal per Push, auch wenn sie noch nicht dran sind. Benachrichtigungen müssen aktiviert und beide Apps auf 1.15.0 aktualisiert sein. Eigene Züge haben Vorrang, sichtbare Apps bleiben still und das Minutenlimit gilt. Derselbe Raumcode und persönliche Zugänge bleiben erhalten.

## Mehrere Räume behalten und wieder öffnen

Ab 1.11.0 zeigt **Deine Räume** alle auf diesem Gerät gespeicherten Internet-Zugänge. Bis zu 50 reguläre Zugänge speichern; auf der Startseite höchstens vier kompakte Karten, eigene Spielgelegenheiten zuerst, alle weiteren unter „Alle Räume“. **Raum hinzufügen** erstellt einen weiteren Raum oder tritt mit Code bei. Ein Raum enthält eine laufende Partie; mehrere Räume können unabhängig gleichzeitig spielen. Nach Spielende „Noch einmal spielen“ im gleichen Raum wählen. Für jeden Raum bleiben Name, Code und Spielerzugang getrennt.

Der bisherige einzelne Zugang wird automatisch übernommen. Raumwechsel merken sich unbestätigte Würfel-/Feldauswahl lokal, sofern dieselbe eigene Spielgelegenheit noch besteht. Eine inzwischen fortgeschrittene Runde oder neue Partie verwirft den alten Entwurf. Abgeschlossene Ergebnisse werden weiterhin einmalig im lokalen Profil erfasst, auch über die kompakte Raumübersicht. Keine Spielblätter oder verdeckten Punkte in deren laufenden Statusantworten.

**Aufräumregel:** Nach 14 Tagen ohne ausdrückliches Öffnen/Rückkehr in den Raum oder gültige Aktion ist ein Raum zur Bereinigung freigegeben. Das gilt auch für verlassene unfertige Partien. Automatische Statusabfragen, Präsenz, Push-Prüfungen und das bloße Anzeigen der Raumliste verlängern die Frist nicht. Bereinigung läuft bei normalem Erstellen, Beitreten oder Öffnen, global höchstens alle sechs Stunden und mit höchstens 20 Löschungen je Durchlauf. Ohne solche Nutzung kann ein alter Raum länger gespeichert bleiben. Solange er tatsächlich noch vorhanden ist, darf sein gespeicherter Spielerzugang ihn wieder öffnen, die vorhandene Partie fortsetzen und eine neue volle Frist setzen. Eine alte Frist allein sperrt keinen Zugriff.

Bestandsräume erhalten einmalig eine volle vierzehntägige Schonfrist, statt den alten Erstellungstermin als letzte Nutzung auszulegen. Bereinigung entfernt Raum und zugehörige Status-/Reaktions-/Push-Zuordnungen. Lokale Statistik bleibt erhalten. Ein bereits gelöschter Raum samt Spielstand kann darüber nicht wiederhergestellt werden.

**Zugänge bleiben gerätegebunden, ohne Account:** Die Liste kennt nur auf diesem Gerät gespeicherte Schlüssel. Vor 1.11.0 bereits überschriebene oder gelöschte Zugänge können nicht allein anhand eines Namens rekonstruiert werden. Mit bekanntem Code kann man einer Lobby als neue Person beitreten; für eine laufende Partie ist der bisherige Spielerzugang nötig. „Zugang auf diesem Gerät entfernen“ entfernt nur den gewählten Eintrag und seine Hinweise, nicht andere Räume oder die Partie für Mitspielende.

Beim App-Start/Rückkehren zur Startseite liefert ein einzelner Sammelabruf die Statuswerte aller gespeicherten Räume. Automatisch höchstens einmal pro Minute bei bekannten laufenden Spielen, im Hintergrund/ohne Internet pausiert; reine Lobbys starten keine dauernde Schleife. „Status aktualisieren“ ist eine manuelle Abfrage. Für den geöffneten Raum gilt weiter das adaptive bestehende Polling.

Hinweise können für alle erfolgreich zugeordneten Räume kommen. Weiterhin ein globales Minutenlimit, ein gemeinsamer Benachrichtigungseintrag, keine Erinnerungswiederholung und keine Vordergrundmeldung. Alle Apps auf 1.11.0 aktualisieren; der Worker prüft die tatsächlich in der Meldung genannte Raumzuordnung. Hinweise aus sichtbaren Raumübersichten werden gesammelt als gesehen gespeichert.

## Namen und Einladungen

Farbfeld benötigt keinen Account. Die Hinweise in Lobby, Raumdialog und geteilten Einladungen verwenden diese allgemeine Formulierung. Für Internet-Spielräume brauchen alle eine Internetverbindung.

**Zusammen → Internet – Spielraum** öffnen. Den persönlichen Namen angeben und beim Erstellen optional **Name des Spielraums** ausfüllen, etwa „Entenrunde 🦆“. Namen dürfen bis zu 48 Zeichen umfassen; Leerraum wird normalisiert. Der achtstellige Raumcode bleibt die Kennung zum Beitreten. Ein Raumname ist kein zusätzliches Kennwort.

Der Gastgeber öffnet **Raumnamen ändern** in der Lobby oder tippt während des Spiels auf die Überschrift mit Stift. Alle sehen den bestätigten Namen automatisch. Leeren stellt den Standardnamen wieder her. Die Einladung über **Einladen** bzw. **Spiel teilen** im laufenden Raum enthält Namen und Code, keine persönlichen Zugänge. Umbenennen verändert keine laufenden Würfel oder eine schon getroffene unbestätigte Auswahl.

## Personen verwalten

Vor dem Start können bis zu sechs Personen mit demselben Code beitreten. Nur der Gastgeber sieht **Entfernen** neben anderen Personen. Eine Rückfrage in der App erklärt, dass der bisherige Zugang ungültig wird. Das Entfernen ist keine dauerhafte Sperre: Mit Code darf die Person erneut beitreten und erhält einen neuen Zugang. Der Gastgeber bleibt im Raum.

Während einer Partie kommen keine neuen Personen hinzu. Freiwilliges Aussteigen zählt −10 und lässt die übrigen weiterspielen. Der aktuelle Gastgeber öffnet nach Spielende mit **Noch einmal spielen** die Lobby. Ausgestiegene werden dabei entfernt; ihre alten Zugänge autorisieren nicht mehr. [Details](leaving.md).

## Spielbrett für die nächste Partie

Der Gastgeber wählt in der Lobby **Classic**, **Flusslauf** oder **Mosaik**, anschließend **Partie starten**. Gäste sehen die Wahl synchronisiert, ihre Auswahl ist gesperrt. Nach **Noch einmal spielen** lässt sich erneut wählen; Raumcode und übrige Zugänge bleiben erhalten.

Zusätzliche Bretter setzen passende Brettfähigkeiten ab 1.6.0 voraus. Das Erstellungsdatum des Raums spielt keine Rolle. Die Lobby nennt die Personen, deren Unterstützung noch nicht bestätigt ist; sie behauptet damit nicht, die installierte Versionsnummer geprüft zu haben.

Die genannte Person öffnet den **gespeicherten Raum auf dem eigenen Handy** und lässt ihn kurz im Vordergrund. Seit dem Serverfix 1.8.2 erneuert jeder normale authentifizierte Abruf ihre aktuelle Fähigkeitsmeldung. Der einmalige frühere Anmeldeaufruf ist dafür nicht mehr nötig. Das funktioniert auch mit 1.7.0-Clients, die den entsprechenden Header bereits senden. Beim Gastgeber wird die Auswahl danach automatisch frei. **Raum neu prüfen** aktualisiert die Ansicht des aufrufenden Handys; es kann keine Fähigkeiten für andere Personen bestätigen.

Falls die Unterstützung weiterhin fehlt, auf dem betroffenen Handy **Einstellungen → Auf Updates prüfen → Aktualisieren**, danach denselben Raum öffnen. Kein neuer Raum, Entfernen/Wiederbeitreten oder Deinstallieren erforderlich. Neue Spielbrettwahl und Start bleiben Gastgeberaktionen. Ohne unterstützendes Gerät bleibt die Sperre bestehen.

## Online-Punkte, Startkarte und fehlende Personen

Neben den Namen erscheinen Verbindungsindikatoren. Die kompakte Startkarte nennt den Raumnamen, unmittelbar darunter Code und Spielerzahl in einer Zeile, danach die eigene Spielgelegenheit; ein Öffnen-Pfeil steht rechts neben dem Text, auch auf schmalen Handys. Bei fehlender Rückmeldung bleibt der Status vorsichtig. Status kommt mit adaptiven Spielstandabfragen, ohne zusätzlichen API-Timer; im Hintergrund pausiert dieser. Nur der Raumersteller kann nach mindestens 24 Stunden ohne Spielaktion eine fehlende Person als Passen werten. Präsenzabrufe oder Umbenennen verschieben diese Frist nicht. Details und genaue Intervalle: [Raumstatus](room-status.md).

## Updates

Ab 1.8.0 prüft eine sichtbare App regelmäßig auf Updates (alle fünf Minuten, zusätzlich bei Rückkehr und neuer Internetverbindung). Erst vollständig geladene Offline-Dateien lösen den Banner aus. **Jetzt aktualisieren** lädt auf Wunsch neu; **Später** blendet den Banner für diese Sitzung aus, die Einstellung bleibt erreichbar. Bei unbestätigter Auswahl erfolgt vor dem Neuladen eine Rückfrage. Gespeicherte Züge bleiben erhalten, Deinstallation ist nicht nötig. Für den ersten Wechsel von einer älteren Version einmal manuell prüfen.

## Profil nach einer Partie

Auf jedem Handy wird nur dessen eigene Rolle für das lokale Profil erfasst. Abgeschlossene Ergebnisse ergänzen die Gegnerbilanz nach Namen, unabhängig vom Raumcode; eine weitere Partie im gleichen Raum zählt separat. Statistik und Sicherung: [statistics.md](statistics.md).

## Prüfung

1.8.2: Reproduktion eines älteren Raums mit aktueller Gastgeber- und veralteter Gastregistrierung. Ein normaler authentifizierter Gast-GET ohne `hello` gibt die Bretter frei; Host-GET allein bestätigt keinen Gast. Wiederholte gleiche Meldungen schreiben nicht. Tests umfassen fremde Zugänge, fehlende Header, unbekannte Fähigkeiten, echte ältere Clients, parallel gespeicherte Züge/Namen, Gastentfernung, begrenzte Versionskonflikte und fehlende Räume. Keine Push-Ausgabe für diese Aktualisierung. Die Browser-Vorschau für 1.8.2 war trotz gemeldetem Start nicht erreichbar (Verbindung abgelehnt); der Übergang wurde daher über die echte API-Route mit SQLite-Testdaten geprüft, nicht im Browser abgenommen. Physische Android-Prüfung bleibt offen.

API-Integration prüft vollständige Partien, optionale und alte unbenannte Räume, Normalisierung/Grenzen, Hostrechte, Versionskonflikte, unveränderte Enginezustände beim Umbenennen, nachträgliche Brettfähigkeiten, nächste Partie mit anderem Brett, Lobby-Entfernen, ungültige alte Zugänge und erneuten Beitritt. Browser-QA verwendet getrennte Clients gegen die echte lokale Raum-API und prüft Anzeige, Umbenennen, offene Auswahl, Gästeansicht und Querformat. Updateausgaben mit einem simulierten fertigen Worker sind gesonderte UI-Tests. Browser-Ergebnis: 51 Würfe bis Spielende, danach im selben Code Mosaik gewählt, Gast entfernt, verständlicher Zugangswechsel und erneuter Beitritt. Eigene und Gästeauswahl blieben beim Umbenennen jeweils mit fünf markierten Feldern erhalten. Langer Name im Querformat: Bildnachweis (private QA screenshot omitted). Der Update-Banner (private QA screenshot omitted) zeigt eine simulierte neuere Worker-Version; „Später“ und die Rückfrage bei offener Auswahl wurden geprüft. Echte Android-/Push-/Hotspot-Abnahme bleibt offen.

Neue eigene Spielgelegenheiten werden bei aktiviertem Web Push auch an länger geschlossene Apps gemeldet. Ab 1.9.8 kann die Nachricht bis zu 24 Stunden auf ein nicht erreichbares Handy warten; vor der Anzeige muss der Zug noch aktuell und ungelesen sein. Beide Geräte aktualisieren. Keine periodischen Erinnerungen und keine zusätzlichen Hintergrundabrufe. [Regeln und offene Geräteprüfung](notifications.md).

Im Handy-Spielkopf stehen ab 1.9.9 Wurfzähler, Punkteübersicht und Beenden in einer voll genutzten Steuerungszeile; am Spielende nur Wurf und Punkte. Der vorher links freie Bereich entfällt. Titel und Raumcode mit Personenanzahl bleiben unmittelbar darüber. Layoutprüfung: [Responsive-Matrix](responsive-qa.md).

Ab 1.9.10 verdrängt der Zughinweis im niedrigen Querformat nicht mehr die Würfel. Die rechte Box scrollt bei knapper Höhe vollständig; der kurze Hinweis öffnet über **i** weiterhin die gesamte Erklärung. Gilt für eigene aktive und passive Spielgelegenheiten.

Emoji-Reaktionen bleiben ab 1.9.10 je Absender als neueste passende Reaktion bis zu 24 Stunden in derselben Partie verfügbar. Auch beim ersten Öffnen wird sie angezeigt; der Empfang braucht keine Easter-Egg-Freischaltung. Ein lokaler Anzeigecursor verhindert Wiederholung beim Neustart. Es gibt keine Push-Meldung und keinen zusätzlichen Raumabruf. Beide Geräte für den vollständigen Fix aktualisieren. [Details](reactions.md).

Ab 1.10.0 lässt sich die Emoji-Größe durch Halten wählen. Größe und Bewegung bleiben im Raum mit der Reaktion gespeichert und werden beim späteren Öffnen genauso dargestellt. Pro Absender weiterhin nur die neueste Reaktion, keine Emoji-Pushs. [Bedienung](reactions.md).

1.10.1: Die sendende App verschickt beim Loslassen direkt und zeigt die laufende Anfrage. Ein fehlender Folge-Klick verhindert den Versand nicht mehr; eventuelle Folge-Klicks erzeugen keine zweite Reaktion. Kein Wechsel von API, Rate-Limit, Spielversion, Uhr oder Abfragen.

229 Tests, Raum-/Kopplungsintegration, JavaScript, TypeScript und Dokumentationsprüfung bestanden. Drei Lebensdauer-Regressionen schlugen vor der Korrektur fehl. Neue Fälle prüfen volle Partie und anschließenden Rematch im gleichen Raum nach zwei simulierten Jahren, Zugriff auf alte gespeicherte aktive Räume, unabhängige Präsenzbereinigung sowie Bindung und einmaligen Push an eine aktuelle Spielgelegenheit trotz alter Raumfrist. Die Zeit wird kontrolliert simuliert, kein jahrelanger Realbetrieb und keine echte Android-Push-Abnahme.

Produktionsprüfung am 5.11.2026: Ein erhaltener Bestandsraum mit bereits verstrichener Frist lieferte vor der Veröffentlichung authentifiziert HTTP 404 und danach HTTP 200. Laufende Partie und zwei Mitglieder vorhanden; die gespeicherte Spielversion blieb unverändert. Die Prüfung nutzte ausschließlich den regulären Lese-Endpunkt; keine Partie wurde gestartet, zurückgesetzt oder ersetzt. Produktions-Zugangsschlüssel, Namen und Spielblätter wurden nicht ins Repository übernommen. Browser- und Android-Oberfläche nicht zusätzlich abgenommen.

1.11.0 ersetzt die dauerhafte Aufbewahrung aus 1.10.2 durch echte Inaktivitäts-Bereinigung, ohne den alten Fehler einer festen Frist ab Erstellung wieder einzuführen. Tests simulieren Kalendergrenzen; reale Android-/Hotspot-/Push-Abnahme bleibt eigenständig.

253 Tests einschließlich 24 neuer Prüfungen für Raumregister, Entwürfe, Cleanup/Rennen, parallele Spiele und Mehrraum-Benachrichtigungen bestanden. Raum- und Kopplungs-API-Integrationen, JavaScript, TypeScript und Dokumentationsprüfung erfolgreich. Die neue Migration ist mit frischer SQLite-Datenbank geprüft; Kalendergrenzen werden kontrolliert simuliert. Kein realer Zweiwochenbetrieb und keine neue physische Android-/Push-/Hotspot-Abnahme.

