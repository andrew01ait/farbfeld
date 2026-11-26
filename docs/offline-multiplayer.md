# Offline auf zwei bis sechs Handys

<!-- farbfeld-version: 1.34.2 -->

## Luftangriff in neuen Direktpartien

Beim Start vergleicht das Gastgebergerät die bestätigten Fähigkeiten der verbundenen Geräte. Mit mindestens Farbfeld 1.33.0 auf allen Geräten hat der optionale Luftangriff zwei Freigabebedingungen. Bei gemischten Versionen gilt die bisherige Farbfreigabe. Die laufende Partie behält ihre gewählte Regel auch nach dem erneuten Verbinden. [Angriffsregeln](mines.md)

## Versteckte Minen, Schatzsuche und Revanche · 1.25.0

Bei Schiffsboni zusammen mit versteckten Minen folgt auf die eigene Flotte direkt die eigene Minenaufstellung. Dann wird ein gemeinsames Handy weitergegeben. Direkt verbundene Handys stellen unabhängig voneinander auf. War eine App beim Ende oder beim Neustart nicht verbunden, liefert der Gastgeber nach Kopplung das vorige Ergebnis zusammen mit der laufenden Revanche. **Letztes Ergebnis ansehen** bleibt auch im gespeicherten Direktstand verfügbar. Persönliche Schatztemperaturen und der Fünferverlauf synchronisieren nur zum jeweiligen Platz.

Der gespeicherte Endstand lässt sich über den Pokal neben dem Namen der Direktpartie öffnen. Bei Flotte, Minen und im Wartestatus steht der Pokal bei der Navigation.

## Flottenraster vollständig einpassen · 1.22.3

Die eigene Flottenaufstellung startet vollständig sichtbar und bietet eigenen Pinch sowie −/+/Einpassen. Zoom verändert keine Position, Aktion oder Synchronisationsversion; normale Platzierungen/Bestätigungen bleiben autoritativ. Private Übergabe an einem Handy und deaktivierte Netzwerkfelder bei ausstehender Bestätigung bleiben erhalten. Erst nach den nötigen eigenen Vorbereitungsschritten wird weitergegeben beziehungsweise gewartet. Das aktiviert keine versteckten Minen für Menschen; deren separate Freigabe bleibt offen.


## Alle umgesetzten Varianten · 1.21.0

Ein Handy bietet bei der Einrichtung Schiffsboni, Entdecken, Aufträge und Mischen an; Flottenaufstellung erfolgt mit geheimer Übergabe. Schiffe nur zu zweit, andere Varianten bis sechs. Direktgruppen koppeln zuerst vollständig; dann wählt ausschließlich der Gastgeber die Varianten mit derselben Grenze. Alle Handys müssen variants-v1 im authentifizierten hello bestätigen.

Direktprotokoll 2 bleibt erhalten: optionale variants-Lobbyflags, eigene fleet-Aktionen und redigierte Spielprojektionen laufen über den vorhandenen geordneten Kanal. Wiederkopplung erhält Flotten, Bereitflags, Funde, Fristen und individuelle Farbpläne. Eine verlorene bestätigte Aktion wird nach gespeicherter ID abgeglichen, nicht doppelt angewendet. Der ursprüngliche Host hält den vollständigen Autoritätsstand; Gäste erhalten nur die eigene Flotte und bei Verdeckung nur den eigenen Farbplan. Neue Varianten mit synthetischen Kanälen und Browser-Renderern geprüft, keine neue physische WLAN-/Hotspot-Abnahme behauptet.


## Beitreten und lokale Entfernung

Direktpartie beitreten zeigt zuerst den eigenen Namen und Angebots-QR scannen. Mit Kopplungscode · Internet nötig und WLAN & Hilfe lassen sich bei Bedarf öffnen. Auch nach einer gescheiterten Kopplung steht das Verwerfen eines gespeicherten Direktzugangs zur Verfügung. Im Spiel Beenden → Auf diesem Gerät verwerfen → nochmals bestätigen. Dies funktioniert ohne andere Handys und entfernt nur den Stand/Zugang dieses Geräts. Andere Partien und Statistiken bleiben erhalten. Auf anderen Handys wird keine gemeinsame Partie beendet; bei lokalem Verwerfen des Gastgebers kann dessen laufende Gruppe nicht weiter synchronisieren.


## Direktwurf sofort sichtbar

Die kompakte nicht bedienbare Vorschau zeigt bereits vor der ersten Wahl alle sechs gemeinsam gewürfelten Werte. Die aktive Person bleibt zuerst berechtigt. Nach ihrer Bestätigung werden die normalen eigenen Würfelaktionen verfügbar. Die Vorschau liegt im normalen Spielfluss oberhalb der Punkte, ohne schwebendes gesperrtes Bedienfeld. Bei bestätigtem eigenem Zug, Pause, ausstehender Bestätigung und Blattinspektion erscheint sie nicht.


## Kompakte Direktkarte

Die gespeicherte Direktpartie verwendet dieselbe schmale Kartenfläche wie Internet-Räume. Offline steht mit Handyzahl/Wurf in einer Metazeile. Namen, ursprünglicher Gastgeber und Kanalstatus bleiben sichtbar. Öffnen verwendet denselben gespeicherten Direktplatz; keine neue Kopplung oder Spieländerung durch das Layout.


## Direktpartie in der Übersicht

Direktpartien erscheinen als Offline · Direktpartie mit gespeichertem Namen und Teilnehmerliste. Der ursprüngliche Gastgeber ist fett mit ♛. Sie teilen sich die auf drei Karten begrenzte Startvorschau mit anderen Partien; bekannte eigene Züge werden vorgezogen, alle übrigen bleiben in Alle Räume über Offline-Filter und Namen-/Personensuche erreichbar. Pausierte Direktpartien bleiben Offline-Modus und werden nicht fälschlich als spielbereite eigene Zuggelegenheit sortiert.


## Name der Direktpartie und Beenden

Vor Spiel erstellen kann der Gastgeber optional einen Namen mit bis zu 48 Zeichen vergeben, z. B. Sofa-Runde. In der Lobby Name der Direktpartie ändern oder im Spiel die Überschrift mit Stift wählen. Gäste sehen den bestätigten Namen; der Host kann eine pausierte Sitzung benennen und synchronisiert ihn beim Wiederverbinden. Leeren stellt die Standardüberschrift wieder her. Namen verändern keine Würfel, Runde oder eigene Auswahl. Die Direktkarte auf der Startseite zeigt Name/Status und Öffnen. Verlassen erfolgt im Spiel über Beenden mit ausdrücklicher −10-Punkte-Bestätigung. Pausierte Spiele benötigen für den gemeinsamen Ausstieg eine wiederhergestellte Verbindung.

## WLAN-Test und Wiederkopplung 1.17.4

Nutzerbestätigt am 10.11.2026: OnePlus Open als A/Gastgeber, OnePlus 7T als B/Gast, beide Chrome 157/PWA 1.17.3. QR-Angebot mit drei Teilen und Gegenantwort erfolgreich; drei gemeinsame WLAN-Runden, beidseitig gleicher Stand bei Wurf 4. Nach B-WLAN-Abbruch pausieren beide sicher bei Revision 12. A konnte zuvor keinen neuen QR vorbereiten, weil Android trotz vorhandener Host-/UDP-Kandidaten weiter gathering meldete. 1.17.4 bevorzugt vollständige Sammlung und verwendet nach höchstens 20 Sekunden ersatzweise eine feste Beschreibung mit vorhandenen lokalen UDP-Kandidaten; ohne nutzbare Daten bleibt der Fehler. Ein neuer QR-Vorgang koppelt den bestehenden Platz, keine neue Partie. Der manuelle Antwortscan startet keinen künstlichen Host-Timeout mehr. Am 11.11.2026 hat der Nutzer die Wiederkopplung einer bestehenden Partie bestätigt; genaue Appversion nicht angegeben. Kopplung und Erstellung einer Sitzung per Hotspot ohne Internet wurden später am 11.11.2026 vom Nutzer bestätigt; vollständige Partie, Hintergrund und die neuen Varianten bleiben physisch separat.

## Neue Partien mit Zusatzregeln

Ein Handy: **Zusammen → Ein Handy weitergeben**, dann Personen, Brett und optionale Minen/Schatzsuche wählen. Mehrere Handys: erst koppeln, danach wählt der Gastgeber Brett (einschließlich Random), Minen und Schatzsuche in der Direkt-Lobby. Eine wartende Kopplung ist kein Nachweis einer veralteten App; die Anzeige trennt Koppeln von fehlenden Fähigkeiten. Die Optionen lassen sich für 2–6 Personen kombinieren, auch bei verdeckten Punkten. Gemeinsamer Plan und Regeln bleiben über Wiederverbindung erhalten. Physische Hotspot-/Android-Abnahme weiterhin separat.

## Neu 1.17.0: Schatzsuche, Random und gemeinsame Minen

Drei geheime **Schatzsuche** vergeben je +2 an alle ersten Finder desselben Wurfs; Bekanntgabe erst nach der gemeinsamen Wertung, Punkte bleiben trotz Minen erhalten. **Random** erzeugt bei jedem neuen Start ein gemeinsames, gespeichert fortsetzbares Brett. Die optionale **Mine** trifft ein gewähltes Zielfeld bei allen aktiven Gegnern, einmal pro Person für insgesamt fünf Punkte. Die Explosion dauert drei Sekunden; Schadensmarkierungen bleiben bis Ende des nächsten Wurfs. Leere Ziele verursachen beim jeweiligen Gegner keinerlei Schaden.

**Partie verlassen** gibt sofort einen einmaligen Verlaufseintrag mit −10 Punkten und Niederlage. Die anderen spielen weiter; die letzte aktive Person gewinnt sofort. Im Internet wandert die Gastgeberrolle weiter. Offline bleibt das ursprüngliche Gastgeber-Handy als Zuschauer und Verbindung geöffnet; Verbindungsverlust pausiert sicher, ohne neue Autorität zu erfinden. Alle beteiligten Apps für neue Regeln auf 1.17.0 aktualisieren. [Schatzsuche](bonus-fields.md) · [Minen](mines.md) · [Random](random-board.md) · [Aussteigen](leaving.md).


## Offline-Testprotokoll

Das freiwillige lokale A/B-Testprotokoll unterstützt Kopplungs- und Abgleichstests. [Anleitung](offline-diagnostics.md).

Farbfeld bleibt eine öffentliche PWA. Nach dem offiziellen [Schmidt-Regelheft](https://www.schmidtspiele.de/files/Produkte/4/49327%20-%20Noch%20mal!/49327_Noch_Mal_DE.pdf) sind maximal sechs Personen vorgesehen; auf mehreren Handys werden Gruppen von zwei bis sechs unterstützt. Vorher auf jedem Handy die aktuelle App laden, **Offline bereit** abwarten und gegebenenfalls **Einstellungen → Auf Updates prüfen → Aktualisieren** wählen. Aktuelle Clientversion: version.json.

## Gemeinsames Netz herstellen

Alle Geräte mit demselben WLAN verbinden. Alternativ auf einem Android-Handy einen Hotspot in den Systemeinstellungen aktivieren und die anderen Handys mit dessen WLAN-Namen und Kennwort verbinden. Ein Hotspot kann auch ohne mobile Daten funktionieren; die konkrete Android-/Netzwerkunterstützung entscheidet. Eine PWA kann den Hotspot nicht selbst einschalten oder ein WLAN erstellen.

Bei einem Gäste-WLAN kann Client-Isolation direkte Verbindungen verhindern. Ein VPN, Netzwerkberechtigungen, mDNS-Verhalten und Hotspot-Gerätelimits können ebenfalls eine Rolle spielen. Bei sechs Handys braucht der Hotspot fünf Gastplätze. Die App zeigt den tatsächlichen Datenkanalzustand; `navigator.onLine` beweist keine Direktverbindung.

## Ohne Internet per QR koppeln

1. Gastgeber: **Zusammen → Offline – mehrere Handys → Spiel erstellen**, Namen eingeben und Verbindungsangebot vorbereiten.
2. Gast: **Beitreten**, Namen eingeben und das Angebot vom Gastgeber scannen.
3. Gast erzeugt eine Antwort; der Gastgeber scannt diese auf dem Gäste-Handy.
4. Nach bestätigtem Datenkanal wird der nächste Gast über **Weitere Person einladen** gekoppelt, bis alle verbunden sind.
5. Gastgeber wählt **Classic**, **Flusslauf** oder **Mosaik** und die offene/verdeckte Spielart und startet.

Angebot und Antwort enthalten eine feste Kopie der lokalen ICE-Kandidaten. Vollständiger Abschluss bleibt bevorzugt; der begrenzte UDP-Ausweichpfad aus 1.17.4 gilt auch hier. Bei größeren Daten können mehrere QR-Bilder Teil desselben Kopplungsvorgangs sein. Während der Partie wird nicht wiederholt gescannt. Die Kamera stoppt nach Scan, Schließen, Abbruch und Verlassen. Ein QR-Darstellungsfehler lässt die manuelle Datenalternative und gegebenenfalls den vorbereiteten Kopplungscode bestehen.

## Mit Internet per Kopplungscode

**Mit Internet: Spiel mit Kopplungscode erstellen** bereitet Angebot und kurzlebigen Code vor. Jeder weitere Gast erhält einen eigenen Code bzw. Spielerplatz. Der Dienst vermittelt nur Angebot und Antwort. Nach erfolgreicher direkter Verbindung laufen Züge und Punkte über WebRTC im lokalen Netz weiter, auch wenn Internet entfällt.

Dieser Kopplungscode ist vom **Internet-Spielraum** zu unterscheiden: Beim bisherigen Internet-Spielraum synchronisiert der Server alle laufenden Züge; er benötigt während der Partie Internet.

## Abgrenzung zu benannten Internet-Spielräumen

Raumnamen und das Entfernen von Gästen in der Lobby ab 1.8.0 gehören zum servergestützten Internet-Spielraum. Sein achtstelliger Beitrittscode bleibt unverändert; Einladungen und weitere Partien können denselben Raum nutzen. Dieser Raumname ändert weder lokale QR-Daten noch Direktprotokoll oder Offline-Kopplung. Anleitung: [internet-rooms.md](internet-rooms.md).

Der neue Update-Banner kann im Direktspiel angeboten werden, sobald alle neuen Dateien geladen sind. Neuladen trennt allerdings die Datenkanäle; die bestehende Rückfrage erklärt die nötige erneute Kopplung. Offline wird kein Download erzwungen.

## Züge und Wiederverbindung

Der Gastgeber erzeugt Würfe einmal und verwaltet den verbindlichen Spielstand. Jeder Gast hat einen festen Platz und einen persönlichen Schlüssel. Der Gastgeber verteilt nur bestätigte Stände. Sitzungs-, Spiel-, Runden-, Versions- und Aktionskennungen verhindern doppelte oder veraltete Züge. Gleichzeitige passive Züge desselben Wurfs sind zulässig und individuell regelgeprüft.

Fehlt ein Handy, pausiert die gesamte Gruppe. Auf dem ursprünglichen Gastgeber das fehlende Mitglied gezielt **Erneut koppeln**; andere Kanäle bleiben bestehen. Nach einem vollständigen Neustart die gespeicherte Direktpartie auf dem ursprünglichen Gastgeber fortsetzen und die bisherigen Gäste erneut koppeln. Neuere gespeicherte Stände werden nicht mit älteren Gast-/Hostkopien überschrieben.

Bestätigte Direktstände bleiben auf jedem Handy unter `farbfeld.direct.v1`, Schema 1. Solo-, Computer- und Ein-Handy-Daten bleiben separat erhalten. Der lokale Backup-Export enthält keine Direkt- oder Raumzugänge. Während einer Partie bedeutet × freiwilliges Aussteigen mit −10 Punkten; die Gruppe spielt weiter. Ausgestiegene Gäste dürfen ihre App schließen, der ursprüngliche Gastgeber bleibt als Relay geöffnet. Einen gespeicherten Gastgeberzugang währenddessen zu löschen wird verhindert. Wartende Kopplungen lassen sich ohne Ergebnis abbrechen. Für eine neue kleinere Offline-Gruppe nach Spielende neu koppeln; die vorhandene Sternverbindung migriert keine Gastgeberrolle.

## Punkte, Varianten und Reaktionen

**Σ** öffnet die aktuelle Aufschlüsselung. Im offenen Spiel können alle Blätter und Punkte angesehen werden. Bei **Verdeckter Punktestand** bleiben auch eigene Gesamtpunkte und Formeln bis zum Spielende verborgen; eigenes Blatt, Fortschritt und benötigte Joker bleiben spielbar. Fremde Daten werden für Gäste aus der Übertragung entfernt; der Gastgeber bleibt die vertrauenswürdige Instanz mit vollständigem Zustand.

Spalten werden unabhängig vom Erst-/Späterbonus grün, einschließlich null Punkten in H. Gelb bedeutet vollständig, aber noch nicht gemeinsam gewertet. Farbabschlüsse werden nach der gemeinsamen Rundenwertung angezeigt. Classic bleibt unverändert. Flusslauf/Mosaik und Reaktionen benötigen passende neue Clients ab 1.6.0. Fehlende Brettkennung in alten Ständen bedeutet Classic.

Zehn Taps auf die Versionsnummer aktivieren lokal **☺ / Emoji senden** neben Einpassen. Nur 😘, 💩 und 😂, gezielt oder an alle anderen. Empfänger müssen nicht freischalten. Der Gastgeber verteilt Reaktionen über bestehende Kanäle, ohne HTTP, neuen QR-Vorgang oder Änderung der Zugversion. Reaktionen werden nicht als ausstehende Spielzüge gespeichert.

## Benachrichtigungen

Ab 1.7.0 sind Benachrichtigungen ein separater, standardmäßig ausgeschalteter Opt-in. Der Offline-Direktmodus kann nur dann lokal an eine neue Spielgelegenheit erinnern, wenn Android App und Verbindung noch ausführt. Kein verlässliches Aufwecken einer geschlossenen App durch die lokale Verbindung. Ein Hintergrundhinweis baut keine unterbrochene Direktverbindung wieder auf. Details: [notifications.md](notifications.md).

## Geräteprüfung und Abnahmestand

**Offline-Verbindung prüfen** untersucht HTTPS, Cache, lokales QR-Testbild, Kamera-Unterstützung/Freigabe, abfragbare lokale Netzwerkfreigabe und temporäre lokale RTC-Adressen. Es fordert keine Kamera an und nutzt keine Internet-/STUN-/TURN-Server. Das kopierbare Ergebnis enthält keine IP-Adressen oder Zugangsschlüssel. Eine erfolgreiche Adresssuche bestätigt noch keine Verbindung zu einem zweiten Handy.

Automatisiert geprüft: Gruppen bis sechs, vollständige Partien, Rollen-/Aktionsschutz, Unterbrechung/gezielte Wiederkopplung, gespeicherter Neustart, Code-Zuordnung und Ablauf, QR-Bildpixel, Scannerlebenszyklus, Offline-Dateien, neue Bretter und Reaktionen. Teile der direkten Netzwerktests verwenden simulierte Session-Transporte. Die Cloudumgebung konnte keine erfolgreiche reale WebRTC-/Hotspot-Verbindung mit lokalen ICE-Kandidaten bestätigen.

**Physischer WLAN-Grundtest und erneute Kopplung einer bestehenden Partie auf zwei OnePlus-Handys sind durch den Nutzer bestätigt. Automatische Erholung nach WLAN-Verlust gelang unterschiedlich; Hotspot ohne Internet bleibt offen.** Das betrifft lokale Direktverbindung, Wiederkopplung, Installation und Hintergrundbetrieb. Der getrennte Internet-Push-Selbsttest wurde inzwischen auf dem Android-Handy vom Nutzer bestätigt; daraus folgt keine Offline-WebRTC-Abnahme. [Push-Prüfumfang](notifications.md). Historische Prüfstände und Screenshots sind im [CHANGELOG](../CHANGELOG.md) erhalten; datierte Recherche mit Primärquellen in [offline-research-2026-10-30.md](offline-research-2026-10-30.md).

## Verbindungsindikator ab 1.9.0

Der Punkt neben jedem Namen kommt aus der authentifizierten direkten Verbindung, nicht aus `navigator.onLine`. Ein Internet-Ausfall bei funktionierendem WLAN/Hotspot schaltet diese Punkte nicht auf offline. Es gibt keinen zusätzlichen HTTP-Abfragekreis für den Direktstatus. Spiel-/Speicherprotokoll bleibt unverändert. Details: [Raumstatus](room-status.md).

Die Wiederanzeige verpasster Reaktionen ab 1.9.10 betrifft Internet-Spielräume mit Serverzustand. Der Direktmodus bleibt bei Live-Reaktionen über die bestehende Verbindung; ein komplett geschlossenes/abgetrenntes Ziel bekommt dadurch keine neue Server-Warteschlange. [Abgrenzung](reactions.md).

Ab 1.10.0 werden begrenzte Größe und Bewegung mit einer Direktreaktion über den bestehenden Kanal übertragen. Neue Gastgeber prüfen die Zusätze; das Spiel-/Snapshotformat und Protokoll 2 bleiben unverändert. Ältere Beteiligte fallen auf die bisherige normale Darstellung zurück. Die lokale Geste arbeitet ohne HTTP.

1.10.1: Die Touch-Korrektur startet den Versand direkt beim Loslassen statt erst auf einen Folge-Klick zu warten. Derselbe Controller versorgt auch den bestehenden Direktkanal; dessen Live-Verbindung, Effektdaten und Wiederverbindungsregeln bleiben unverändert. Keine Zusatzabfrage oder neue Kopplung nötig.

1.11.0 ergänzt mehrere gespeicherte **Internet-Spielräume**, nicht mehrere gleichzeitig aktive WebRTC-Gruppen. Direkt-Protokoll, Hostautorität, QR-Kopplung und bestätigte Offline-Stände bleiben unverändert. Die Übersicht der gespeicherten Internet-Zugänge ist lokal lesbar; deren laufender Spielstand und Erneuerung der Inaktivitätsfrist benötigen Internet.

Ab 1.12.3 stehen die gespeicherte Direktverbindung und die laufende lokale Solo-/Computer-/Ein-Handy-Partie auf der Startseite vor der großen Illustration, unmittelbar nach den Internet-Räumen. Dasselbe gilt für noch nicht abgeschlossene Kopplungen. Speicher und Fortsetzen-/Abbruchabläufe unverändert.
