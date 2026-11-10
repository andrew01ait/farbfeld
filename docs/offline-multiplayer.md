# Offline auf zwei bis sechs Handys

<!-- farbfeld-version: 1.18.0 -->

## Name der Direktpartie und Beenden

Vor Spiel erstellen kann der Gastgeber optional einen Namen mit bis zu 48 Zeichen vergeben, z. B. Sofa-Runde. In der Lobby Name der Direktpartie ändern oder im Spiel die Überschrift mit Stift wählen. Gäste sehen den bestätigten Namen; der Host kann eine pausierte Sitzung benennen und synchronisiert ihn beim Wiederverbinden. Leeren stellt die Standardüberschrift wieder her. Namen verändern keine Würfel, Runde oder eigene Auswahl. Die Direktkarte auf der Startseite zeigt Name/Status und Öffnen. Verlassen erfolgt im Spiel über Beenden mit ausdrücklicher −10-Punkte-Bestätigung. Pausierte Spiele benötigen für den gemeinsamen Ausstieg eine wiederhergestellte Verbindung.

## Android recovery 1.17.4

When Android leaves gathering open despite local UDP host candidates, QR preparation freezes those available candidates after the 20-second deadline. Normal gathering completion stays preferred. Without usable local UDP data, show an error rather than a false ready state. Re-pair the existing saved player/game. The host connection timeout starts only after accepting the return QR answer; manual scan time is excluded. Physical recovery/hotspot verification remains separate from automated tests.

## Neue Partien mit Zusatzregeln

Ein Handy: **Zusammen → Ein Handy weitergeben**, dann Personen, Brett und optionale Minen/Bonusfelder wählen. Mehrere Handys: erst koppeln, danach wählt der Gastgeber Brett (einschließlich Random), Minen und Bonusfelder in der Direkt-Lobby. Eine wartende Kopplung ist kein Nachweis einer veralteten App; die Anzeige trennt Koppeln von fehlenden Fähigkeiten. Die Optionen lassen sich für 2–6 Personen kombinieren, auch bei verdeckten Punkten. Gemeinsamer Plan und Regeln bleiben über Wiederverbindung erhalten. Physische Hotspot-/Android-Abnahme weiterhin separat.

## Neu 1.17.0: Bonusfelder, Random und gemeinsame Minen

Drei geheime **Bonusfelder** vergeben je +2 an alle ersten Finder desselben Wurfs; Bekanntgabe erst nach der gemeinsamen Wertung, Punkte bleiben trotz Minen erhalten. **Random** erzeugt bei jedem neuen Start ein gemeinsames, gespeichert fortsetzbares Brett. Die optionale **Mine** trifft ein gewähltes Zielfeld bei allen aktiven Gegnern, einmal pro Person für insgesamt fünf Punkte. Die Explosion dauert drei Sekunden; Schadensmarkierungen bleiben bis Ende des nächsten Wurfs. Leere Ziele verursachen beim jeweiligen Gegner keinerlei Schaden.

**Partie verlassen** gibt sofort einen einmaligen Verlaufseintrag mit −10 Punkten und Niederlage. Die anderen spielen weiter; die letzte aktive Person gewinnt sofort. Im Internet wandert die Gastgeberrolle weiter. Offline bleibt das ursprüngliche Gastgeber-Handy als Zuschauer und Verbindung geöffnet; Verbindungsverlust pausiert sicher, ohne neue Autorität zu erfinden. Alle beteiligten Apps für neue Regeln auf 1.17.0 aktualisieren. [Bonusfelder](bonus-fields.md) · [Minen](mines.md) · [Random](random-board.md) · [Aussteigen](leaving.md).



## Neu 1.16.0: Offline-Testprotokoll und optionale Computer-Minen

Ein freiwilliges lokales A/B-Testprotokoll hilft bei Offline-Kopplung und Spielabgleich; es ist aus Einstellungen und Kopplungsdialogen exportierbar. [Testanleitung und Datenschema](offline-diagnostics.md). Die neue Startoption **Minenangriff testen** wurde in 1.16.0 zunächst gegen den Computer erprobt; ab 1.17.0 gilt sie für alle Mehrspielerarten: gegnerischer Farbabschluss schaltet einen einmaligen Angriff für fünf Punkte frei. Ein leeres Zielfeld ist ein vollständiger Fehlschlag ohne Nachbarschaden. [Regeln, verdeckte Zielwahl und Wertung](mines.md).


Farbfeld bleibt eine öffentliche PWA. Nach dem offiziellen [Schmidt-Regelheft](https://www.schmidtspiele.de/files/Produkte/4/49327%20-%20Noch%20mal!/49327_Noch_Mal_DE.pdf) sind maximal sechs Personen vorgesehen; auf mehreren Handys werden Gruppen von zwei bis sechs unterstützt. Vorher auf jedem Handy die aktuelle App laden, **Offline bereit** abwarten und gegebenenfalls **Einstellungen → Auf Updates prüfen → Aktualisieren** wählen. Aktuelle Clientversion: [version.json](../public/version.json).

## Gemeinsames Netz herstellen

Alle Geräte mit demselben WLAN verbinden. Alternativ auf einem Android-Handy einen Hotspot in den Systemeinstellungen aktivieren und die anderen Handys mit dessen WLAN-Namen und Kennwort verbinden. Ein Hotspot kann auch ohne mobile Daten funktionieren; die konkrete Android-/Netzwerkunterstützung entscheidet. Eine PWA kann den Hotspot nicht selbst einschalten oder ein WLAN erstellen.

Bei einem Gäste-WLAN kann Client-Isolation direkte Verbindungen verhindern. Ein VPN, Netzwerkberechtigungen, mDNS-Verhalten und Hotspot-Gerätelimits können ebenfalls eine Rolle spielen. Bei sechs Handys braucht der Hotspot fünf Gastplätze. Die App zeigt den tatsächlichen Datenkanalzustand; `navigator.onLine` beweist keine Direktverbindung.

## Ohne Internet per QR koppeln

1. Gastgeber: **Zusammen → Offline – mehrere Handys → Spiel erstellen**, Namen eingeben und Verbindungsangebot vorbereiten.
2. Gast: **Beitreten**, Namen eingeben und das Angebot vom Gastgeber scannen.
3. Gast erzeugt eine Antwort; der Gastgeber scannt diese auf dem Gäste-Handy.
4. Nach bestätigtem Datenkanal wird der nächste Gast über **Weitere Person einladen** gekoppelt, bis alle verbunden sind.
5. Gastgeber wählt **Classic**, **Flusslauf** oder **Mosaik** und die offene/verdeckte Spielart und startet.

Angebot und Antwort enthalten vollständige lokale ICE-Kandidaten. Bei größeren Daten können mehrere QR-Bilder Teil desselben Kopplungsvorgangs sein. Während der Partie wird nicht wiederholt gescannt. Die Kamera stoppt nach Scan, Schließen, Abbruch und Verlassen. Ein QR-Darstellungsfehler lässt die manuelle Datenalternative und gegebenenfalls den vorbereiteten Kopplungscode bestehen.

## Mit Internet per Kopplungscode

**Mit Internet: Spiel mit Kopplungscode erstellen** bereitet Angebot und kurzlebigen Code vor. Jeder weitere Gast erhält einen eigenen Code bzw. Spielerplatz. Der Dienst vermittelt nur Angebot und Antwort. Nach erfolgreicher direkter Verbindung laufen Züge und Punkte über WebRTC im lokalen Netz weiter, auch wenn Internet entfällt.

Dieser Kopplungscode ist vom **Internet-Spielraum** zu unterscheiden: Beim bisherigen Internet-Spielraum synchronisiert der Server alle laufenden Züge; er benötigt während der Partie Internet.

## Abgrenzung zu benannten Internet-Spielräumen

Raumnamen und das Entfernen von Gästen in der Lobby ab 1.8.0 gehören zum servergestützten Internet-Spielraum. Sein achtstelliger Beitrittscode bleibt unverändert; Einladungen und weitere Partien können denselben Raum nutzen. Dieser Raumname ändert weder lokale QR-Daten noch Direktprotokoll oder Offline-Kopplung. Anleitung: [internet-rooms.md](internet-rooms.md).

Der neue Update-Banner kann im Direktspiel angeboten werden, sobald alle neuen Dateien geladen sind. Neuladen trennt allerdings die Datenkanäle; die bestehende Rückfrage erklärt die nötige erneute Kopplung. Offline wird kein Download erzwungen.

## Züge und Wiederverbindung

Der Gastgeber erzeugt Würfe einmal und verwaltet den verbindlichen Spielstand. Jeder Gast hat einen festen Platz und einen persönlichen Schlüssel. Der Gastgeber verteilt nur bestätigte Stände. Sitzungs-, Spiel-, Runden-, Versions- und Aktionskennungen verhindern doppelte oder veraltete Züge. Gleichzeitige passive Züge desselben Wurfs sind zulässig und individuell regelgeprüft.

Fehlt ein Handy, pausiert die gesamte Gruppe. Auf dem ursprünglichen Gastgeber das fehlende Mitglied gezielt **Erneut koppeln**; andere Kanäle bleiben bestehen. Nach einem vollständigen Neustart die gespeicherte Direktpartie auf dem ursprünglichen Gastgeber fortsetzen und die bisherigen Gäste erneut koppeln. Neuere gespeicherte Stände werden nicht mit älteren Gast-/Hostkopien überschrieben.

Bestätigte Direktstände bleiben auf jedem Handy unter `farbfeld.direct.v1`, Schema 1. Solo-, Computer- und Ein-Handy-Daten bleiben separat erhalten. Der lokale Backup-Export enthält keine Direkt- oder Raumzugänge. Die Ausstiegsaktion gibt −10 Punkte, während die übrigen weiterspielen. Ausgestiegene Gäste dürfen schließen; der ursprüngliche Gastgeber bleibt als Zuschauer/Relay geöffnet. Wartende Kopplungen können ohne Ergebnis verworfen werden. Für eine neue kleinere Gruppe nach dem Ende neu koppeln. [Details](leaving.md).

## Punkte, Varianten und Reaktionen

**Σ** öffnet die aktuelle Aufschlüsselung. Im offenen Spiel können alle Blätter und Punkte angesehen werden. Bei **Verdeckter Punktestand** bleiben auch eigene Gesamtpunkte und Formeln bis zum Spielende verborgen; eigenes Blatt, Fortschritt und benötigte Joker bleiben spielbar. Fremde Daten werden für Gäste aus der Übertragung entfernt; der Gastgeber bleibt die vertrauenswürdige Instanz mit vollständigem Zustand.

Spalten werden unabhängig vom Erst-/Späterbonus grün, einschließlich null Punkten in H. Gelb bedeutet vollständig, aber noch nicht gemeinsam gewertet. Farbabschlüsse werden nach der gemeinsamen Rundenwertung angezeigt. Classic bleibt unverändert. Flusslauf/Mosaik und Reaktionen benötigen passende neue Clients ab 1.6.0. Fehlende Brettkennung in alten Ständen bedeutet Classic.

Zehn Taps auf die Versionsnummer aktivieren lokal **☺ / Emoji senden** neben Einpassen. Nur 😘, 💩 und 😂, gezielt oder an alle anderen. Empfänger müssen nicht freischalten. Der Gastgeber verteilt Reaktionen über bestehende Kanäle, ohne HTTP, neuen QR-Vorgang oder Änderung der Zugversion. Reaktionen werden nicht als ausstehende Spielzüge gespeichert.

## Benachrichtigungen

Ab 1.7.0 sind Benachrichtigungen ein separater, standardmäßig ausgeschalteter Opt-in. Der Offline-Direktmodus kann nur dann lokal an eine neue Spielgelegenheit erinnern, wenn Android App und Verbindung noch ausführt. Kein verlässliches Aufwecken einer geschlossenen App durch die lokale Verbindung. Ein Hintergrundhinweis baut keine unterbrochene Direktverbindung wieder auf. Details: [notifications.md](notifications.md).

## Geräteprüfung und Abnahmestand

**Offline-Verbindung prüfen** untersucht HTTPS, Cache, lokales QR-Testbild, Kamera-Unterstützung/Freigabe, abfragbare lokale Netzwerkfreigabe und temporäre lokale RTC-Adressen. Es fordert keine Kamera an und nutzt keine Internet-/STUN-/TURN-Server. Das kopierbare Ergebnis enthält keine IP-Adressen oder Zugangsschlüssel. Eine erfolgreiche Adresssuche bestätigt noch keine Verbindung zu einem zweiten Handy.

Automatisiert geprüft: Gruppen bis sechs, vollständige Partien, Rollen-/Aktionsschutz, Unterbrechung/gezielte Wiederkopplung, gespeicherter Neustart, Code-Zuordnung und Ablauf, QR-Bildpixel, Scannerlebenszyklus, Offline-Dateien, neue Bretter und Reaktionen. Teile der direkten Netzwerktests verwenden simulierte Session-Transporte. Die Cloudumgebung konnte keine erfolgreiche reale WebRTC-/Hotspot-Verbindung mit lokalen ICE-Kandidaten bestätigen.

## Verbindungsindikator ab 1.9.0

Der Punkt neben jedem Namen kommt aus der authentifizierten direkten Verbindung, nicht aus `navigator.onLine`. Ein Internet-Ausfall bei funktionierendem WLAN/Hotspot schaltet diese Punkte nicht auf offline. Es gibt keinen zusätzlichen HTTP-Abfragekreis für den Direktstatus. Spiel-/Speicherprotokoll bleibt unverändert. Details: [Raumstatus](room-status.md).

Die Wiederanzeige verpasster Reaktionen ab 1.9.10 betrifft Internet-Spielräume mit Serverzustand. Der Direktmodus bleibt bei Live-Reaktionen über die bestehende Verbindung; ein komplett geschlossenes/abgetrenntes Ziel bekommt dadurch keine neue Server-Warteschlange. [Abgrenzung](reactions.md).

Ab 1.10.0 werden begrenzte Größe und Bewegung mit einer Direktreaktion über den bestehenden Kanal übertragen. Neue Gastgeber prüfen die Zusätze; das Spiel-/Snapshotformat und Protokoll 2 bleiben unverändert. Ältere Beteiligte fallen auf die bisherige normale Darstellung zurück. Die lokale Geste arbeitet ohne HTTP.

1.10.1: Die Touch-Korrektur startet den Versand direkt beim Loslassen statt erst auf einen Folge-Klick zu warten. Derselbe Controller versorgt auch den bestehenden Direktkanal; dessen Live-Verbindung, Effektdaten und Wiederverbindungsregeln bleiben unverändert. Keine Zusatzabfrage oder neue Kopplung nötig.

1.11.0 ergänzt mehrere gespeicherte **Internet-Spielräume**, nicht mehrere gleichzeitig aktive WebRTC-Gruppen. Direkt-Protokoll, Hostautorität, QR-Kopplung und bestätigte Offline-Stände bleiben unverändert. Die Übersicht der gespeicherten Internet-Zugänge ist lokal lesbar; deren laufender Spielstand und Erneuerung der Inaktivitätsfrist benötigen Internet.

Ab 1.12.3 stehen die gespeicherte Direktverbindung und die laufende lokale Solo-/Computer-/Ein-Handy-Partie auf der Startseite vor der großen Illustration, unmittelbar nach den Internet-Räumen. Dasselbe gilt für noch nicht abgeschlossene Kopplungen. Speicher und Fortsetzen-/Abbruchabläufe unverändert.

