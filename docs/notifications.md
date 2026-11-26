# Benachrichtigungen

<!-- farbfeld-version: 1.34.2 -->

## Hinweise in der Beispielpartie

Die Animationsvorschau in der vollständigen Spielansicht zeigt Toasts, Angriffs- und Minenbanner sowie den Ergebnisdialog über den regulären Spielcontroller. Die Vollansicht nutzt feste Beispieldaten und startet keine Spielraumabfragen oder Push-Nachrichten.

Die Debug-Zeitleiste erfasst auch Toasts, die durch die nächste Meldung ersetzt werden. Kopierbare Einträge verwenden ausschließlich Meldungstexte aus den Beispielszenen.

## Glocke bei „Deine Räume“

Die Glocke markiert ungesehene Abschlüsse. Beim Antippen öffnet sie **Ergebnisse** mit bis zu 20 auf diesem Gerät gespeicherten Abschlüssen, neueste zuerst. Die Zeilen zeigen Uhrzeit, Datum und eigenen Ausgang. Ältere Ergebnisse ohne gespeicherte Endezeit sind mit **Erfasst** gekennzeichnet. Jeder Eintrag öffnet den passenden Endstand und gilt danach auf diesem Gerät als gesehen. Die Zahl der eigenen offenen Züge steht unter **Deine Räume** und aktualisiert sich nach einer Zugbestätigung. Die Glocke nutzt lokale Partien, den Direkt-Snapshot und den autorisierten Raumindex auch ohne Push-Freigabe.

## Aufgaben und Ergebnisvergleich · 1.24.0

Katalogauswahl, lokale Kartenschließung, Ergebnisvergleich und Brettkoordinaten erzeugen keine zusätzlichen Nachrichten oder Hintergrundabrufe. Die bestehenden Spielende-/Zug-Pushregeln bleiben unverändert.


## Suchverlauf · 1.23.2

Die fünf gespeicherten Suchzüge und durchgestrichenen vergebenen Schätze sind lokale Anzeigen der Computerpartie. Die vorhandene eigene Zugmeldung bleibt unverändert; Historieneinträge erzeugen beim Anzeigen oder Laden keine zusätzlichen Meldungen, Push-Aufträge oder Netzabrufe.

## Minenbericht und Feldhinweise · 1.23.1

Automatische versteckte Minen verweisen lokal auf den dauerhaften Bericht im eigenen Featurepanel; sie wählen kein Gegnerblatt. Konkrete Suchfelder und ihre Abstandserklärung sind lokale Anzeigen gespeicherter bestätigter Fakten. Keine Push-Art, zusätzliche Empfänger, Hintergrundabfrage oder neue Benachrichtigung. Verdeckte Minenberichte zeigen gemäß Nutzerwunsch nur die Schadensanzahl, keine Koordinaten. Bestehende Push-/Gerätenachweise bleiben unabhängig von den 120 neuen Layoutansichten.

## Schatzsuche 1.23.0

Temperatur, Fundspur und Kettenbonus sind lokale Hinweise innerhalb der Computerpartie. Die vorhandene Toastanzeige meldet den eigenen neuen Suchzug bzw. den erstmals gewerteten Kettenabschluss. Kein Web Push, neuer Nachrichtentyp, zusätzlicher Netzwerkabruf oder Hintergrundtimer. Die bestehende Push-Sicherung und deren belegter Geräteumfang bleiben getrennt.

## Schatzsuche ist eine Anzeigebenennung · 1.22.5

Die lokale Fundmeldung heißt „Schatz gefunden“, die zugehörige Spielkarte/Hilfe Schatzsuche. Kein neuer Push-Typ, Empfänger oder Versand: eigene Runde, Spielende und Revanche behalten ihre bisherigen Regeln. Diese Layout-/Textprüfung ist kein neuer physischer Android-Pushnachweis.

## SVG-Korrektur · 1.22.4

Nur der gemeinsame Schiffsanker wurde korrigiert. Benachrichtigungsereignisse, Opt-in, Pushtransport, Zustellnachweise und Updateablauf bleiben erhalten. Die Browserprüfung dieser Version belegt SVG-Darstellung, keine neue physische Android-Pushzustellung.

## Aufstellraster und eigene Schritte · 1.22.3

Einpassen, Zoom und eigene Vorbereitungsschritte sind lokale Darstellungsaktionen. Sie erzeugen keinen Push, zusätzlichen Abruf oder neuen Ereignistyp. Die bestehende serverseitige Flottenbestätigung und ihre Zuggelegenheit bleiben unverändert; neue versteckte Minen bleiben auf Computerpartien begrenzt. Keine geänderten Empfänger oder Sperrbildschirmtexte.


1.22.1 verdichtet ausschließlich Spielkarten und Vorbereitungsoberflächen; Push-Arten, Zustellung und Hintergrundverhalten bleiben unverändert.

## Lokale Luftangriffs-/Minenhinweise · 1.22.0

Überflug und automatische Bodenexplosion sind lokale Anzeigen bestätigter Spieldaten. Sie versenden keine Push-Nachricht und erzeugen keinen Netzabruf. Versteckte Minen sind ausschließlich Teil lokaler Computerpartien; ihre Vorbereitung ist keine neue Netzwerk-Zuggelegenheit. Drei Sekunden für Effektbereinigung sowie Computer-/Ergebnisaufschub bleiben unverändert. Bestehende Raum-/Direktbenachrichtigungen und ihre Empfänger bleiben erhalten.


## Minenfeedback 1.21.2

Der kompakte Einschlaghinweis ist eine lokale Anzeige des bereits bestätigten Angriffs. Er erzeugt keinen Push, zusätzlichen Netzabruf oder neuen Ereignistyp. Die drei Sekunden bestehen wie zuvor ausschließlich für Animation, Bereinigung und den Computer-/Ergebnisaufschub. Die neue Zielwahl und ihr letzter Angriffsstatus ändern keine Empfänger, Fristen oder Sperrbildschirmtexte.


## Gruppierte Mischung 1.21.1

Die Verbindung freier Farbgruppen geschieht nur beim bestehenden autoritativen Rundenabschluss. Sie erzeugt keinen eigenen Push, Hintergrundabruf oder zusätzlichen Hinweisversand. Bestehende Zug-/Ende-Gelegenheiten, Empfänger, Sperrfristen und die getrennte physische Push-Abnahme bleiben erhalten.


## Flottenaufstellung als vorhandene Zuggelegenheit · 1.21.0

Beide noch unbestätigten Flotten zählen zur bestehenden turn-Gelegenheit in Runde 1; der Text lautet Stelle deine Flotte auf. Nach eigener Bestätigung entfällt diese Aufstellungsgelegenheit. Event-ID bleibt game:1:turn, kein neuer Push-Typ und keine zusätzliche Erinnerung. Revanche, globale Minutenbegrenzung, Sichtbarkeit, Verifikation und Datensparsamkeit bleiben erhalten. Kein Name, Punktestand oder Schiffsfeld auf dem Sperrbildschirm; keine Produktiv-Pushs für diese Tests verschickt.


## Ergebnisdialog 1.20.6

Die neue Endmeldung ist eine lokale Präsentation des bereits synchronisierten fertigen Spielstands. Kein neuer Web-Push-Typ, Versand, Timer für Netzwerkanfragen oder geänderte Empfängerregel. Verdeckte Punkte werden erst nach dem bestehenden Spielende angezeigt.


## Menüreihenfolge 1.19.4

Im Menü Zusammen steht Internet – Spielraum zuerst, danach Offline – mehrere Handys und Ein Handy weitergeben. Die drei bestehenden Ziele, Beschriftungen und Abläufe bleiben erhalten. Reine DOM-Reihenfolge; keine zusätzliche Anfrage, Spiel-/Push- oder Speicheränderung.


## Direktzugang verwerfen

Die neue gerätelokale Entfernung sendet keine Spiel- oder Push-Nachricht. Internet-Raumbindungen bleiben bestehen; kein neuer Poller.


## Direktwurf 1.19.2

Die passive Wurfvorschau verwendet vorhandene Direktdaten. Keine zusätzliche Push-Nachricht, HTTP-Abfrage oder periodische Aktualisierung.


## Layout 1.19.1

Die schlankeren Raumkarten ändern weder Ereignisse noch Zustellung, Hintergrundverhalten oder Push-Abfragen. Keine zusätzliche Netzwerkaktivität durch Renderer oder CSS.


## Abgrenzung Übersicht 1.19.0

Neue Modus-/Teilnehmeranzeigen und Suche/Filter/Seitennavigation erzeugen keinen Push und keine zusätzlichen Statusabfragen. Bekannte eigene Zuggelegenheiten bestimmen nur die Kartenreihenfolge. Die vorhandenen Benachrichtigungsarten und Deduplizierung bleiben unverändert.


## Abgrenzung 1.18.0

Direktnamen sind lokale Sitzungsmetadaten. Umbenennen und die veränderte Startkarte lösen weder Push noch Erinnerungen oder zusätzliche Statusabfragen aus. Die bereits erlaubten Internet-Ereignisse bleiben unverändert.

## Abgrenzung 1.17.4

Diese Version korrigiert die lokale QR-Wiederkopplung und Oberfläche. Push-Zustellung, erlaubte Ereignisse, Wartungsaufgabe, VAPID und Opt-in bleiben unverändert. Die Verbindungszeile aufklappen, um lokal zu trennen; ein offener Android-Adresssuchlauf ist kein Push-Fehler.

## Dauerhafte Karten ab 1.17.3

Farbabschlusskarten bleiben während der Partie sichtbar. Der kurze Toast erscheint weiterhin nur bei einem neuen Abschluss; Wiederaufnahme erzeugt keine alten Toasts. Farbe bleibt ein reiner Spielhinweis und erzeugt keinen Push. Verdeckte Prämien bleiben auch in zugänglichen Labels verborgen.

## Visuelle Spielhinweise 1.17.2

Kurze Bonus-/Farbabschlussmeldungen sind ausschließlich sichtbare Spiel-UI. Die neue gemeinsame Gestaltung und Du-Grammatik ändern keine Push-Erlaubnis, Versandart, Wiederholungen oder Quittungsauswertung. Verdeckte Bonus-/Abschlusspunkte bleiben auch im Toast verborgen; Farbe/Bonus erzeugen weiterhin keinen Push.

Ab 1.17.0 erhalten ausgestiegene Personen keine neuen Zug-, End- oder Revanchehinweise für die verlassene Partie. Ein letzter aktiver Sieger kann den bestehenden Endhinweis erhalten. Bonusfelder, Mine und Gastgeberwechsel erzeugen keine neue Push-Art; globale Begrenzung und erneute Prüfung bestehender Ereignisse bleiben erhalten.

Prüfabschluss 1.15.0: 309 automatisierte Tests einschließlich tatsächlicher workerd/D1-Transportprüfung erfolgreich; Raum- und Kopplungs-API-Integration, TypeScript und Dokumentationsprüfung bestanden. Alle zehn Migrationen auf einer frischen lokalen D1 angewendet, erneuter Lauf ohne offene Migrationen. Verwaltete Vorschau meldete eine URL, der Cloudbrowser erhielt jedoch ERR_CONNECTION_REFUSED; Vorschau beendet, keine gerenderte Browser- oder physische Android-Revanche-Abnahme behauptet. Keine Nachricht an Nutzergeräte versandt und keine Nutzerpartie verändert.

## Revanche-Push ab 1.15.0

Nach Spielende führt **Noch einmal spielen** zunächst nur in die Lobby. Erst der bestätigte nächste **Start** markiert die neue Partie als Revanche. Die übrigen autorisierten Mitglieder mit aktivierten Hinweisen erhalten einmal **„Farbfeld · Revanche gestartet“**; die startende Person erhält keinen zusätzlichen Start-Push. Ein bereits eigener Zug hat Vorrang. Erste Partien, reine Lobbyänderungen, Solo/Computer und Offline-Direktmodus erzeugen diesen neuen Internet-Hinweis nicht.

Der Worker muss `rematch-push-v1` ausdrücklich unterstützen. Das wird beim normalen Abgleich authentifiziert gemeldet; Migration `0009_unique_stryfe.sql` ergänzt dafür `notification_devices.rematch_ready` mit Standard 0. Alte Worker erhalten weiterhin ihre bisherigen Zug-/Ende-Pushs. Zum Aktivieren der neuen Art beide Apps regulär auf 1.15.0 aktualisieren und einmal öffnen, ohne Neuinstallation oder erneute Berechtigungsanfrage.

Der neue Hinweis trägt ein eigenes Ereignis pro Partie und verwendet den bestehenden Tag, lautlose Einstellung, Vordergrundsperre und das globale Minutenlimit. Eine schnelle Revanche nach dem Spielende wird bis nach der laufenden Minute vorgemerkt. Fällige Arbeit wird durch normale Serveraktionen und den bestehenden stündlichen Wartungslauf aufgenommen; ohne weitere Aktionen kann der Rückfall entsprechend später kommen. Kein neuer Clienttimer und keine Zusage eines Versands exakt nach 60 Sekunden.

Server und Worker prüfen vor Versand bzw. Anzeige das konkrete Ereignis im autorisierten Raum (`status=1&room=...&event=...`). Die Startmeldung bleibt nur bis zur ersten eigenen Auswahl in Wurf 1 gültig, auch wenn der erste eigene Zug inzwischen freigegeben wurde. Abbruch, nächste Partie, erledigte erste Auswahl und entfernte Bindung machen sie ungültig. Ein bereits angenommener erster Zug ersetzt eine noch wartende Startmeldung. Ereignis-Deduplizierung und Minutenlimit schützen vor doppelten Start-/Zuganzeigen.

Aktueller Geräteprüfstand: Am 08.11.2026 bestätigt der Nutzer sichtbare automatische Pushs auf seinem Handy und anschließend auch auf dem zweiten Handy. Das sind Nutzerbeobachtungen, keine aus `shown` abgeleiteten Sichtbarkeitsbehauptungen. Die neue Revanche-Art ist automatisiert geprüft; ihre physische Android-Abnahme steht noch aus.

## Zustellverlauf und Wiederherstellung ab 1.14.0

**Push-Status prüfen** lädt zusätzlich die letzten höchstens zwanzig Versände dieses Geräts. Sie zeigen Ereignisart, Zeit, Versuchszahl und Provider-/Browserstatus; nach einem registrierten Antippen außerdem den Klick. Die Daten enthalten keine Namen, Punkte, Abonnements oder Geheimnisse. Eine Browserquittung bestätigt weiterhin kein menschliches Lesen oder eine sichtbare Sperrbildschirmdarstellung.

Neue automatische Hinweise werden vor der Antwort an die spielende Person als eigener Auftrag gespeichert. Bis zu drei kurze Versuche laufen nach dem gespeicherten Spielzug; insgesamt höchstens vier. Erneut versucht werden nur Netzwerk-/Zeitfehler, HTTP 429/5xx oder ausdrücklich quittierte Prüf-/Anzeigefehler vor einer Anzeige. Retry-After wird eingehalten. Eine Providerannahme ohne Browserquittung führt nicht zum erneuten Versand. Vor jedem Versuch gewinnen ein überholter Zug, entfernter Zugang, abgeschaltete Hinweise, ersetztes Abonnement oder Ablauf. Testmeldungen behalten ihren einmaligen Versand und ihre Minute Frist.

Der feste Wartungsaufruf **POST /api/notifications/maintenance** mit leerem JSON-Objekt kann ausschließlich solche gespeicherten Aufträge wiederaufnehmen; keine Ziele oder Inhalte lassen sich angeben. Eine globale Minuten-Lease und höchstens zwölf Aufträge pro Lauf begrenzen ihn. Der eingerichtete stündliche Check ist eine langsame Rückfallebene für abgebrochene oder länger aufgeschobene Versuche, keine Zusage sekundengenauer Zustellung. Auch normale neue Spielaktionen nehmen fällige Arbeit auf. Die PWA erhält keine Hintergrund-Abfrageschleife. GET derselben Route zeigt nur Bereitschaft und Zeitpunkt des letzten Wartungslaufs. Ob die Aufgabe tatsächlich eingerichtet ist, steht im Deployment.

Der Service Worker darf die aktuelle Gelegenheit zweimal mit jeweils fünf Sekunden Frist prüfen, nur innerhalb des einzelnen Push-Ereignisses. Er zeigt bei nicht verifizierbarem Zustand keinen alten Hinweis. Eine Anzeige-Reservierung verhindert konkurrierende Anzeigen; erst erfolgreicher showNotification-Aufruf setzt „verarbeitet“ und das Minutenlimit. Ablehnung gibt die Reservierung frei. Beim Neustart wird eine vorhandene Meldung desselben Ereignisses erkannt. Eine während der Prüfung sichtbare App bleibt still.

Migration 0008 ergänzt notification_dispatches mit Geräte-/Raum-Cascade, Versuchszähler, Leasing und bereinigter Diagnose. Nicht mehr wartende Einträge werden auf zwanzig pro Gerät und sieben Tage begrenzt. Wartende Hinweise bleiben nur innerhalb ihrer 24-Stunden-Frist versendbar. Bestehende Geräte, Schlüssel, Backups und Spielregeln bleiben verwendbar; neue Worker-Funktionen benötigen das normale PWA-Update.



## Diagnose und Hintergrund-Aufräumkorrektur 1.12.4 · 07.11.2026

Produktionsdaten ausschließlich gelesen, keine Testnachricht an Nutzergeräte verschickt und keine Nutzerpartie verändert. Der jüngste automatische Zughinweis für die bekannte Android-Installation wurde am **07.11.2026 um 23:53:59 Wiener Zeit** mit HTTP 201 angenommen und um **23:54:01** vom Browser mit `outcome:shown` quittiert. Beide vorhandenen Geräte haben weiterhin `sound:0`. Die Datenbank hält nur den jüngsten Versuch; daraus entsteht kein vollständiges Tagesprotokoll. Eine Annahme oder Quittung bestätigt keine sichtbare Android-Ausgabe. Der Nutzer berichtet weiterhin fehlende Hinweise; eine menschlich bestätigte automatische Hintergrund-/Sperrbildschirm-Abnahme liegt nicht vor.

Unabhängig davon in zwei Regressionen nachgewiesen: `init()` sendete auch im Hintergrund `clear`, und der Worker schloss daraufhin vorhandene Hinweise ohne Prüfung eines sichtbaren Fensters. Korrektur auf beiden Seiten: Client prüft Sichtbarkeit, Worker prüft beim Abarbeiten tatsächliche Fenster. Der Test simuliert zusätzlich Worker-Neustart mit demselben persistenten Einstellungs- und Notification-Bestand. Der konkrete Produktionshinweis lässt sich diesem Fehler nicht zuordnen.

Die Diagnose nennt `shown` jetzt **„Browser hat die Anzeige angefordert.“** und erklärt ausdrücklich die fehlende Zusage einer sichtbaren Android-Meldung. Bei **Lautlos** bleiben Ton und erneute Ankündigung eines ersetzten Eintrags aus; für Ton ist die vorhandene ausdrückliche Wahl **Ton und Vibration** nötig. Keine automatische Änderung dieser Einstellung, neue Reminder, Push-Ereignisse, API-Schleifen oder erhöhte Menge. Nur neue eigene Gelegenheiten und Spielende erzeugen Hinweise; bloßer Tageswechsel oder längeres Warten erzeugen keine Erinnerung.

Update auf 1.12.4 ohne Deinstallation. Beide neuen Regressionen scheiterten vor der Reparatur und bestehen danach; gesamte Suite 276 Tests einschließlich realer workerd/D1-Transportprüfung erfolgreich. Physische Android-Anzeige und OS-Einstellungen können hier nicht geprüft werden.

## Bedienung und Begrenzung

Aktueller Geräteprüfstand: Internet-Selbsttest und sichtbare automatische Hinweise wurden vom Nutzer bestätigt, zuletzt am 08.11.2026 auf beiden Handys. Für die neue Revanche-Art steht die physische Abnahme noch aus. Siehe [Dokumentationsübersicht](README.md).

Einstellungen → Benachrichtigungen → Einrichten. Erst **Aktivieren** löst die Geräte-Berechtigungsanfrage aus. Ablehnen bleibt respektiert; ein blockierter Zustand erklärt die Website-Einstellung. Benachrichtigungen sind standardmäßig aus, nach Aktivierung lautlos. Ton/Vibration sind eine gesonderte ausdrückliche Wahl und folgen anschließend den verfügbaren Gerätefunktionen.

Beim ersten Aufruf werden die gespeicherten Einstellungen erst nach Bereitschaft des Offline-Service-Workers gelesen. Eine erfolgreich wiederholte Initialisierung entfernt eine vorherige Vorbereitungsmeldung und löst keine erneute Berechtigungsanfrage aus. Ein unsichtbarer Start schließt ab 1.12.4 keine ungelesene Meldung. Der Worker prüft zusätzlich beim Verarbeiten von `clear`, ob tatsächlich ein Farbfeld-Fenster sichtbar ist. Auch verspätete Aufräumaktionen oder ältere Clients sind damit geschützt; bewusstes Ausschalten schließt weiterhin sofort.

- Eigene Spielgelegenheit: einmal für Würfeln und anschließende Auswahl; passive Personen nach Freigabe ihres Zuges.
- Spielende: neutraler Hinweis ohne Ergebnis, Namen oder Punkte auf dem Sperrbildschirm.
- Internet-Revanche: einmal beim tatsächlichen Neustart an die anderen Mitglieder, nach Update auf 1.15.0.
- Keine Hinweise für Joins, Raumumbenennungen, geänderte Lobbybesetzung, einzelne gegnerische Aktionen, Farben, Spalten oder Emojis. Raumnamen erscheinen auch nicht im Sperrbildschirmtext.
- Der Update-Banner ist ein Hinweis innerhalb der geöffneten App und benötigt keine Notification-Berechtigung. Er löst keinen Push aus.
- Keine Spielhinweise bei sichtbarer Farbfeld-App. Gelesene Ereignisse werden nicht beim späteren Verbergen wiederholt.
- Höchstens ein Hinweis pro Minute auf diesem Gerät; alle Hinweise nutzen denselben Tag und ersetzen den bisherigen Eintrag. Keine wiederholten Erinnerungen oder späteren Sammelzustellungen.
- Ab 1.9.8 darf der Push-Dienst eine Servernachricht bis zu 24 Stunden für ein vorübergehend nicht erreichbares Handy vorhalten. Vor Anzeige werden Opt-in, Raumzugang, aktuelle eigene Gelegenheit und Deduplizierung erneut geprüft; erledigte oder gelesene Züge bleiben still. Lokale Direkt-/Testmeldungen gelten weiterhin nur 60 Sekunden.
- **Ausschalten** deaktiviert zuerst lokal, schließt Hinweise, entfernt den Serverzugang und meldet das Push-Abonnement nach Möglichkeit ab. Eine fehlende Internetverbindung darf das lokale Ausschalten nicht verhindern.
- **Geräteanzeige testen** zeigt nur auf ausdrücklichen Wunsch einen lokalen Hinweis und unterliegt ebenfalls dem Minutenlimit. Er prüft weder Internet-Push noch die Raumzuordnung.

## Wann eine Spielmeldung entsteht

| Ereignis | Meldung |
| --- | --- |
| Neue eigene Würfelgelegenheit | Einmal „Du bist dran“ |
| Auswahl direkt nach dem eigenen Würfeln | Keine zweite Meldung für denselben Wurf |
| Würfelnde Person hat gewählt; eigene passive Auswahl ist jetzt erlaubt | Einmal „Du bist dran“, sofern diese Gelegenheit noch nicht gesehen wurde |
| Revanche wird tatsächlich gestartet | Einmaliger neutraler Start-Hinweis an die anderen Mitglieder, mit Minutenlimit |
| Partie wird beendet | Ein neutraler Spielende-Hinweis, ebenfalls mit Minutenlimit |
| App ist sichtbar, Zug war bereits sichtbar oder beim Aktivieren schon verfügbar | Keine nachträgliche Meldung |
| Gegneraktion ohne neue eigene Gelegenheit, Farbe/Spalte, Emoji, Raumname oder Beitritt | Keine Meldung |

### Prüfen ohne Meldungsflut

1. Den gespeicherten Internet-Spielraum auf diesem Gerät öffnen. In den Benachrichtigungseinstellungen muss die Zuordnung zu diesem Raum bestätigt werden; „Internet-Push ist eingerichtet“ allein bestätigt noch keinen Spielraum.
2. **Push-Status prüfen** gleicht die Bindung mit dem persönlichen Zugang neu ab und liest einmal den authentifizierten Serverstatus. Das sendet keinen Test-Push und startet keinen weiteren Timer.
3. Nach einem lokalen Anzeigetest mindestens eine Minute warten. Farbfeld schließen oder in den Hintergrund legen, bevor das Gegenüber eine neue eigene Spielgelegenheit auslöst. Ein bereits gesehener Zug wird beim Verlassen nicht nachgeholt.
4. Beide Handys für die längere Zustellfrist auf mindestens 1.9.8 aktualisieren, ohne Neuinstallation. Einen neuen Zug freigeben, nachdem das empfangende Handy seit mindestens einer Stunde geschlossen ist; die App muss hierfür keine Hintergrund-Abrufe ausführen. Bei zunächst fehlender Verbindung darf nur der weiterhin aktuelle, ungelesene Zug nach Wiedererreichbarkeit erscheinen. Auch einen inzwischen erledigten Zug, Duplikate und Fristablauf prüfen.
5. Ist die Meldung weiterhin ausständig, Browser-/Android-Freigabe und den neuen Versuch prüfen. Der lokale Test beweist keine Zustellung durch den Push-Dienst.

## Transporte

Internet-Spielräume nutzen standardisierten Web Push. Der Server erstellt RFC-8291-verschlüsselte, RFC-8292/VAPID-signierte Nachrichten mit `aes128gcm`; der Browser-Push-Dienst liefert sie an den Service Worker. Spielaktionen werden vorher verbindlich gespeichert. Benachrichtigungsfehler werden unabhängig behandelt.

Ab 1.9.3 verwenden ausschließlich die bereits erlaubten Spielhinweise `Urgency: high`, damit der Push-Dienst eine zeitnahe Zustellung versuchen kann. Das ist kein neuer Meldungstyp und keine Garantie gegen Android-Energiesparen. Der gemeinsame Tag, Vordergrundunterdrückung, Deduplizierung und Minutenlimit bleiben bestehen. Seit 1.9.8 beträgt die maximale Zustellfrist beim Push-Dienst 24 Stunden; `deliveryExpiresAt` ergänzt Schema 1, während `expiresAt` für ältere installierte Worker weiterhin die ursprüngliche Minute enthält. So zeigen auch ältere Worker sofort zugestellte neue Nachrichten weiterhin an; die längere Zustellfrist erfordert das PWA-Update. Fehlgeschlagene Versandversuche werden nur mit einer allgemeinen Kategorie bzw. einem HTTP-Status protokolliert, ohne Endpunkte, Schlüssel oder Spielernamen. Die begrenzte Wiederherstellung ab 1.14.0 behandelt vorübergehende Fehler; die Zustellpriorität selbst erzeugt keine Wiederholung.

Im Offline-Direktmodus kann ein laufender Client eine neue eigene Gelegenheit an den lokalen Notification-Worker melden. Das benötigt keinen Internetdienst, hält aber weder Android noch WebRTC unbegrenzt im Hintergrund am Leben. Eine geschlossene/angehaltene App kann durch diese lokale Direktverbindung nicht zuverlässig geweckt werden. Kein neu eingeführter nativer Dienst oder STUN/TURN-Fallback. Solo, Computer und ein Handy benötigen keine externen Spielhinweise.

Profilstatistiken sind rein lokal und erzeugen keine weiteren Benachrichtigungen. Die bisherige Spielende-Meldung bleibt neutral; Siege, Serien und Gegnernamen gelangen nicht in Push-Daten.

## Daten und Lebenszyklus

IndexedDB enthält gerätelokales Opt-in, Tonwahl, Geräte-ID/-geheimnis, letzte Anzeigezeit und höchstens 128 Ereigniskennungen. Der Service Worker serialisiert die Änderungen und prüft das Minutenlimit atomar. Dadurch schützt auch ein Worker-Neustart vor doppelten Hinweisen. Die Daten stehen außerhalb des lokalen Spieleexports.

D1 speichert Push-Abonnement, Hash des Gerätegeheimnisses, bestätigte persönliche Raumzuordnungen, Vordergrund-Lease, zuletzt beanspruchtes Ereignis, letzte Transport-/Gerätequittung und den begrenzten Versandverlauf samt wartenden Aufträgen. Präsenz wird nur nach Opt-in aktualisiert. Jeder Raum verlangt beim Binden sein persönliches Raumtoken. Der primäre Raumwechsel entfernt keine weiteren gespeicherten Raumzuordnungen; vergessene oder nicht mehr autorisierte Zugänge werden entfernt. Sichtbare Clients verlängern eine kurze Lease; beim Verbergen wird sie nach Möglichkeit aufgehoben. Der Worker prüft sichtbare Fenster zusätzlich selbst.

Registrierung und Binden verwenden eine feste Momentaufnahme von Raumcode und passendem Token. Nur die tatsächlich bestätigte Zuordnung gilt als gebunden. Ein Raumwechsel während einer laufenden Anfrage wird seriell mit höchstens drei Durchläufen abgeglichen, ohne zusätzlichen Timer. Ein erfolgreicher Abgleich entfernt alte Fehler. Die manuelle Statusantwort ergänzt Raumzugang, Vordergrund-Lease und Zeitpunkt des letzten beanspruchten Versandversuchs. Letzterer ist kein Zustellbeleg. Die Diagnose enthält keine Abonnements, Schlüssel oder fremden Daten und wird nur auf Wunsch zusätzlich abgerufen.

Nach einem Synchronisationsfehler pausieren weitere Notification-API-Abgleiche fünf Minuten, auch wenn das Push-Abonnement bereits besteht. Manuelle Prüfung, Internet-Rückkehr oder ein echter Raumwechsel dürfen sofort einen neuen Versuch auslösen. Bestehende Nachrichtenlimits bleiben unabhängig davon aktiv.

Abgelaufene Push-Endpunkte (404/410) werden entfernt. Für neue automatische Hinweise werden Geräte mit mehr als sieben Tagen ohne Aktualisierung nicht berücksichtigt. Die eigenständige Raumbereinigung folgt 14 Tagen ohne echte Nutzung; solange eine Raumzeile noch vorhanden ist, wird sie nicht allein wegen des Termins vom Zugriff oder Push ausgeschlossen. Private VAPID-Schlüssel liegen nur in Sites-Runtime-Secrets. Konfigurationsabruf gibt ausschließlich Bereitschaft und den öffentlichen Schlüssel aus. Die API nimmt keine beliebigen Ziel-URLs oder Nachrichtentexte zum Versenden entgegen.

## Prüfung und verbleibende Grenzen

Automatisiert: genau ein Ereignis je Gelegenheit, keine lokalen Solo-Hinweise, Zustimmung/Abschalten, bekannte HTTPS-Push-Ziele, Geräte-/Raumautorisierung, Vordergrund-Leases, veraltete Ereignisse, persistente und parallele Deduplizierung, Minutenlimit, Testbutton, Fokus ohne Neuladen, fehlendes Netz, entfernte Endpunkte, unveränderte Raumversion sowie unabhängige RFC-Entschlüsselung und VAPID-Signaturprüfung.

Regressionen ab 1.9.3 reproduzieren einen Raumwechsel während Registrierung bzw. Binden, überprüfen passende Zugangssnapshots, Fehlerbereinigung, sofortiges Ausschalten während einer Bindung, manuelle Serverbestätigung ohne Test-Push und geheimnisfreie Fehlerprotokolle. Produktionsdaten wurden bei der Diagnose nur gelesen; es wurden keine Spielzüge oder Testmeldungen für die laufende Nutzerpartie erzeugt. Die gelesene Vordergrund-Lease erklärt eine Unterdrückung zum Prüfzeitpunkt, rekonstruiert aber nicht jedes zuvor fehlende Ereignis.

Browser: echte Oberfläche und IndexedDB-Lebenszyklus mit **simulierter Notification-Ausgabe**. Die HTTP-Vorschau meldet für native Benachrichtigungen korrekt fehlendes HTTPS. Die produktive Site nutzt HTTPS.

Browser-QA der Einstellungen: Screenshot. Die dortige Ausgabe ist simuliert; sie ist kein Nachweis einer nativen Android-Zustellung.

Version 1.9.3 wurde auf der veröffentlichten Site erfolgreich über den normalen PWA-Updateweg geladen. Die angezeigten Ereignisregeln und der unveränderte ausgeschaltete/blockierte Zustand im Testbrowser wurden geprüft, ohne dort eine Freigabe zu erzwingen. Veröffentlichte Version. Diese Browserprüfung testet keine Android-Push-Zustellung und sagt nichts über die Freigabe auf dem Handy des Nutzers aus.

**Android-Teilabnahme bestätigt:** Der Internet-Selbsttest wurde am 05.11.2026 vom Nutzer auf seinem echten Android-Handy empfangen; Provider HTTP 201 und Gerätequittung `shown` sind serverseitig bestätigt. **Ein automatischer Produktionshinweis wurde am 06.11.2026 zusätzlich vom Gerät mit `shown` quittiert; längere Abwesenheit und Sperrbildschirmdarstellung bleiben als Geräteabnahme offen.** Native Berechtigung, echte Browser-Push-Zustellung, Sperrbildschirmdarstellung und Akkuoptimierung müssen auf realen Handys geprüft werden. Browser können Hintergrundarbeit beenden, Zustellungen verzögern und verworfene Push-Ereignisse selbst mit generischen Hinweisen behandeln. Die Anwendung reduziert unnötige Zustellungen bereits vor dem Versand; eine plattformübergreifende Garantie jeder sichtbaren Android-Benachrichtigung wird nicht behauptet.

Primärdokumentation: [MDN Notifications](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API), [MDN Push](https://developer.mozilla.org/en-US/docs/Web/API/Push_API), [Cloudflare waitUntil](https://developers.cloudflare.com/changelog/post/2025-08-08-add-waituntil-cloudflare-workers/), [Web-Push-Bibliothek](https://github.com/block65/webcrypto-web-push).

Priorität und Ablauf: [RFC 8030, Urgency](https://www.rfc-editor.org/rfc/rfc8030.html#section-5.3), [Firebase-Zustellpriorität](https://firebase.google.com/docs/cloud-messaging/customize-messages/setting-message-priority). Die Dokumentation beschreibt mögliche Verzögerungen im Hintergrund; daraus folgt keine Diagnose des konkreten Android-Geräts.

## Abgrenzung zum Verbindungsindikator

Die neuen Online-Punkte verwenden die bereits nötigen Raumabrufe bzw. direkte WebRTC-Zustände. Sie aktivieren keine Benachrichtigungen, erzeugen keine Push-Ereignisse und erhöhen die Notification-Abfragehäufigkeit nicht. Startkarten zeigen eigene Spielgelegenheiten auch ohne Notification-Freigabe. Das bestehende Opt-in, Minutenlimit und die Sperrbildschirm-Privatsphäre bleiben erhalten. [Raumstatus und Akku](room-status.md).

Die kompaktere Raumkarte ab 1.9.6 verändert nur Darstellung und Öffnen-Schaltfläche. Ereignisse, Deduplizierung, Abfrageintervalle und Benachrichtigungslimits bleiben unverändert.

Version 1.9.7 ergänzt nur die Spielerzahl unter dem Raumnamen aus dem vorhandenen Raumstand; dafür entstehen weder neue Abrufe noch Benachrichtigungen.

## Prüfung der längeren Abwesenheit ab 1.9.8

Automatisierte Server-/Worker-Tests simulieren eine Stunde ohne Geräte-Präsenz bzw. eine Stunde Transportverzögerung bei vollständig geschlossenem Fenster und neu gestartetem Worker. Sie prüfen verschlüsselten Versand, Zustellfrist, erneute aktuelle Raumprüfung, dauerhafte Deduplizierung, erledigte/gelesene Ereignisse, Fristgrenzen und unveränderte sofortige Anzeige mit einem archivierten 1.9.7-Worker. Die verspätete Anzeige scheiterte vor der Korrektur. Es gibt keine periodische Erinnerung nach einer Stunde und keine neue Abfrageschleife. Die App muss für neue Internet-Raumzüge nicht geöffnet sein; vollständig netzlose Geräte können erst nach Wiedererreichbarkeit Push empfangen. Bereits vorher gesehene Gelegenheiten werden weiterhin nicht erneut angemahnt. Dies ist eine Simulation der Protokoll-/Ausgabelogik, kein Test der Android-Weckfunktion.

Hintergrund zur Zustellfrist: [Firebase, Lebensdauer einer Nachricht](https://firebase.google.com/docs/cloud-messaging/customize-messages/setting-message-lifespan) und [RFC 8030, TTL](https://www.rfc-editor.org/rfc/rfc8030.html#section-5.2). Die kurze bisherige Frist war eine nachgewiesene Einschränkung; daraus folgt kein Beweis für die Ursache einer bestimmten ausgebliebenen Android-Anzeige.

1.9.8: 197 Tests einschließlich fünf neuer Abwesenheits-/Verzögerungs-/Kompatibilitätsfälle sowie Raum- und Kopplungs-API-Integrationen bestanden. JavaScript, TypeScript und Dokumentation geprüft. Keine echte Push-Nachricht für die Prüfung an einen Nutzer geschickt; die tatsächliche Android-Zustellung bleibt offen.

Die Kopfzeilen-Korrektur in 1.9.9 betrifft nur Darstellung und Aktionsbeschriftungen. Push-Gültigkeit, Opt-in, Ereignisse, Deduplizierung und Abfrageintervalle bleiben unverändert.

Version 1.9.10 korrigiert die Querformat-Würfelbox und zeigt verpasste Raumreaktionen beim nächsten sichtbaren Raumabruf. Dafür entstehen ausdrücklich keine Emoji-Pushs. Keine Änderungen an Spiel-Push-Ereignissen, Zustellfrist, Freigaben, Minutenlimit oder Hintergrundabrufen. [Emoji-Regeln](reactions.md).

Größen-Vorschau und neue Emoji-Bewegungen in 1.10.0 bleiben App-Animationen. Sie starten weder Push noch Erinnerungen oder zusätzliche Serverabfragen.

1.10.1 ändert ausschließlich den Auslöser der Emoji-Sendeaktion und deren Rückmeldung. Emoji-Reaktionen erzeugen weiterhin keine Push-Benachrichtigung; keine zusätzlichen Polls oder Versand-Timer.

1.10.2: Gerätebindung und serverseitige Prüfung des aktuellen Zugs hängen nicht mehr von der alten sieben Tage nach Raumerstellung gesetzten Frist ab. Die Räume selbst laufen nicht ab. Opt-in, Präsenzsperre, Geräteaktivitätsfilter (sieben Tage), Minutenlimit, ein gemeinsamer Tag, Ereignis-Deduplizierung und 24-Stunden-Transportfrist bleiben unverändert. Wiederhergestellter Raumzugriff löst keine gesammelten alten Pushs aus. Eine neue berechtigte Spielgelegenheit wird nach den bestehenden Regeln geprüft.

## Mehrere Räume ab 1.11.0

Eine Subscription kann Hinweise für mehrere gespeicherte, je einzeln authentifizierte Räume erhalten. Die primäre Zuordnung dient nur der aktuell gewählten Ansicht; Wechsel entfernt andere Zuordnungen nicht. Die gespeicherte Zugangsliste wird bei Änderung/Initialisierung in einem begrenzten Aufruf abgeglichen, nicht separat dauerhaft pro Raum gepollt. Vergessene/entfernte Mitgliedschaften werden nicht weiter autorisiert. Entfernen eines Geräts kaskadiert alle seine Raumzuordnungen.

Der Server prüft Ereignis und Mitgliedschaft im Zielraum erneut, der Worker fragt genau diesen Raum ab. Alle Räume teilen weiter ein globales Minutenlimit und einen Tag; mehrere schnelle Züge erzeugen keinen Rückstau späterer Erinnerungen. Laufende Punkte, Blätter und Namen bleiben vom Sperrbildschirm fern. Sichtbare Statusübersichten merken relevante Ereignisse gesammelt lokal. Alle beteiligten Apps/Worker für die vollständige Funktion auf 1.11.0 aktualisieren; ältere Worker prüfen weiter nur ihre primäre Zuordnung. Physische Android-Zustellung ist weiterhin separat zu prüfen.

Raumbereinigung nach 14 Tagen echter Nichtnutzung entfernt zugehörige Zuordnungen und lässt keine veralteten Raumhinweise anzeigen. Subscription-Aktivitätsfilter und 24-Stunden-Transportfrist bleiben eigene Grenzen; Push-Prüfungen erhalten einen inaktiven Raum nicht künstlich am Leben.

## Diagnose und Korrektur 1.11.1

Am 05.11.2026 um 10:27 Uhr Wiener Zeit meldete der Produktionsserver einen fehlgeschlagenen automatischen Versand für einen echten Spielzug. Beide Geräte waren registriert; ein Anzeigetest im Menü benutzt dagegen nur `showNotification` auf dem Gerät und prüft keinen Serverversand. Die konkrete Ursache wurde anschließend in workerd reproduziert: `redirect: "error"` wirft einen `TypeError`, bevor die HTTP-Anfrage den Push-Dienst erreicht. Node akzeptiert diese Option, deshalb hatten die bisherigen Node-Tests den Transportfehler nicht erkannt.

Der Sender nutzt jetzt `redirect: "manual"` und behandelt Weiterleitungen als Ablehnung, ohne ihnen zu folgen. [Cloudflare Request-Referenz](https://developers.cloudflare.com/workers/runtime-apis/request/) und [Runtime-Implementierung](https://github.com/cloudflare/workerd/blob/main/src/workerd/api/http.c%2B%2B). Fehlerprotokolle enthalten nur feste Fehlerklassen sowie HTTP-Status bei Ablehnung; niemals rohe Fehlermeldungen, Schlüssel oder Push-Adressen. Die automatische Folge wird nicht erneut in einer Schleife versendet.

Der vorhandene Serverfix gilt auch für bereits registrierte, kompatible Apps. Kein Wechsel der VAPID-Schlüssel, keine neue Geräteberechtigung und keine erneute Registrierung erforderlich. Die neue sichtbare App-Version ist 1.11.1. Zuvor verbrauchte oder bereits sichtbare Ereignisse werden nicht nachgemeldet. Für einen aussagekräftigen Gerätetest mindestens 60 Sekunden nach einem lokalen Test warten, alle sichtbaren Farbfeld-Fenster auf dem empfangenden Handy verbergen und dann über einen gültigen gegnerischen Zug eine **neue** eigene Gelegenheit auslösen. Ein Wurf und die anschließende Auswahl der aktiven Person sind weiterhin ein gemeinsames Ereignis. Internet-Räume melden nur eigene Gelegenheiten und das Spielende, lautlos nach bestehender Einstellung, mit einem gemeinsamen Tag/Minutenlimit.

`tests/push-runtime.test.mjs` führt die echte Sendefunktion mit workerd, Produktions-Kompatibilitätsdatum und D1 aus. Verschlüsselter POST, Redirect-Ablehnung und Deduplizierung laufen gegen einen lokalen Testempfänger. Dies belegt die behobene Runtime-Störung, nicht die reale Google-/Android-Zustellung. Physische Android-Abnahme bleibt offen; die laufenden Nutzerpartien und bestehenden Geräte wurden zur Diagnose nur gelesen.

## Echter Internet-Test und Diagnose ab 1.11.2

Die Diagnose der weiterhin fehlenden Hinweise ergab in den gespeicherten Datensätzen keinen neuen Versandversuch seit dem früheren Fehler. `last_sent` war bisher eine beanspruchte Sendestelle, kein Nachweis von Providerannahme oder Anzeige. Bereits verbrauchte Ereignisse werden nicht erneut zugestellt. Aus diesen Altdaten wird keine erfolgreiche Zustellung abgeleitet und kein Android-Fehler geraten.

Unter Einstellungen → Benachrichtigungen gibt es nun zwei getrennte Tests: **Geräteanzeige testen** bleibt lokal. **Internet-Push testen** sendet genau eine serverseitig erzeugte, verschlüsselte Testnachricht an die durch Geräte-ID und Gerätegeheimnis authentifizierte Installation. Kein frei wählbares Ziel, keine Nachricht an Mitspielende, kein Spielraum oder eigener Spielzug nötig. Der absichtlich ausgelöste Test darf auch bei sichtbarer App angezeigt werden; automatische Hinweise behalten ihre Vordergrundsperre. Beide Anzeigen teilen das lokale Minutenlimit; der Internetversand teilt zusätzlich das serverweite Minutenlimit/Tag der Installation. Die Testfrist beträgt 60 Sekunden, kein Nachsenden.

**Push-Status prüfen** ist eine ausdrückliche Einzelabfrage. Die Oberfläche unterscheidet Vorbereitung, Netz-/Zeitüberschreitung, HTTP-Ablehnung, abgelaufenen Endpunkt und Providerannahme ohne Gerätequittung. Ein angenommener Request ist weiterhin kein Zustellbeweis. Der aktualisierte Service Worker prüft die persönliche Testfreigabe bzw. die aktuelle Spielgelegenheit, fordert die Anzeige an und schickt einmalig eine authentifizierte Quittung mit festem Ergebnis: angezeigt, sichtbare App, schon verarbeitet, Minutenlimit, nicht mehr aktuell, Prüfnetzfehler, deaktiviert, Gerätezuordnung, ungültig oder Anzeigeaufruf fehlgeschlagen. Eine Quittung bestätigt keinen menschlichen Blick auf die Meldung.

Es wird nur das jüngste Diagnoseobjekt in einer optionalen `notification_devices.delivery`-Spalte gespeichert. Keine Abonnements, Schlüssel, Namen, Punkte oder Spielblätter im Objekt oder in dessen Statusantwort. Die erste passende Gerätequittung gewinnt atomar und bleibt erhalten, wenn sie vor der Providerantwort eintrifft. Veraltete/andere Ereignisse und fremde Geräteschlüssel ändern nichts. Fehler beim Quittieren verhindern keine Anzeige und führen zu keiner Wiederholung. Bei offenem Fenster aktualisiert eine lokale Worker-Nachricht die Diagnose ohne zusätzlichen HTTP-Abruf; bei geschlossenem Fenster ist die Quittung später manuell lesbar.

Migration 0007 ist additiv, bestehende Subscriptions und VAPID-Secrets bleiben erhalten. Alte Worker empfangen weiterhin normale Spielhinweise; für den neuen Test prüft der Client explizit die Fähigkeit `push-test-v1` und verlangt mindestens 1.11.2. Der Test-POST hat einen längeren begrenzten Clienttimeout als der Servertransport, damit die Antwort nach einer Netz-Zeitüberschreitung noch angezeigt werden kann. Keine neue automatische Statusschleife, Hintergrundaufgabe oder wiederholte Erinnerung.

Für die Geräteprüfung auf 1.11.2 aktualisieren, eine Minute nach einem anderen Hinweis warten, **Internet-Push testen** drücken und die neue Diagnose ansehen. Falls noch keine Quittung vorliegt, später einmal **Push-Status prüfen**. Erfolgreicher Anzeigetest ist noch keine Abnahme einer länger geschlossenen Android-App; diese anschließend separat mit einer neuen Spielgelegenheit prüfen. Physische Android-/Sperrbildschirmprüfung bleibt offen.

Live-Backendprüfung 05.11.2026: Der neue authentifizierte Selbsttest wurde mit einer ausschließlich eigenen künstlichen Registrierung und absichtlich unzugeteilter FCM-Adresse ausgeführt. Google antwortete HTTP 410; die API zeigte korrekt `expired`, entfernte nur diese Registrierung und erhielt beide vorhandenen Nutzergeräte. Das prüft echte Serververschlüsselung und den HTTP-Weg zum Provider; es wurde keinem realen Gerät eine Nachricht zugestellt. Der normale Updateweg auf 1.11.2 ist im Browser geprüft, dessen eigene Freigabe bereits blockiert war und unverändert blieb. Der Geräte-Selbsttest auf dem tatsächlichen Android-Handy steht noch aus.

## Bestätigter Android-Selbsttest am 05.11.2026

Der Nutzer bestätigt den Empfang von „Internet-Push testen“ auf seinem Android-Handy. Zusätzlich wurde der bestehende Produktionsdatensatz ausschließlich gelesen: `kind:test`, Providerannahme HTTP 201, Gerätequittung `outcome:shown`. Zwischen serverseitigem Start und gespeicherter Quittung lagen rund 0,85 Sekunden; dieser Einzelwert ist keine Latenzgarantie. Keine zusätzliche Nachricht für die Nachprüfung verschickt. Damit ist erstmals der vollständige Internet-Selbsttest bis zur vom Gerät bestätigten Anzeige belegt, einschließlich menschlicher Empfangsbestätigung durch den Nutzer.

Nicht daraus abgeleitet werden automatische eigene-Zug-/Spielende-Hinweise bei länger geschlossener App, Sperrbildschirm-/Doze-Verhalten oder andere Android-Geräte. Diese Abnahme bleibt separat offen. `physicalAndroidPushVerified` ist nun wahr und wird durch `androidPushVerification.scope:internet-self-test` und `automaticBackgroundTurnVerified:false` präzisiert. Keine Freigaben, Subscriptions, Spielstände oder Benachrichtigungsregeln geändert.

## Erneute Produktionsprüfung und Tonkorrektur 1.12.0 · 06.11.2026

Nur lesend geprüft, keine Nutzerpartie verändert und keine zusätzliche Testnachricht versandt. Für das bekannte Android-Gerät wurde um **08:12:41 Wiener Zeit** ein echter `kind:turn`-Hinweis vom Provider mit HTTP 201 angenommen und um **08:12:42** vom Gerät mit `outcome:shown` quittiert (rund 1,08 Sekunden nach Versandbeginn). Das ist ein automatischer Hinweis und kein Internet-Selbsttest. Die Quittung belegt den erfolgreichen Anzeigeaufruf, keinen menschlichen Blick oder Sperrbildschirmtest. Für einen späteren Hinweis an das andere Gerät um 08:37 lag Providerannahme HTTP 201, aber noch keine Gerätequittung vor. Fehlende Quittung erlaubt keine Aussage, ob Android verzögert, das Gerät offline ist oder eine alte Worker-Version die Quittung nicht liefert. In den aktuellen Push-Logs waren drei Annahmen und keine neuen Transportfehler sichtbar.

Ein davon unabhängig nachgewiesener Optionsfehler wurde korrigiert: Der gemeinsame Tag ersetzt einen vorhandenen Eintrag, `renotify:false` unterdrückte dabei die erneute Ankündigung selbst bei aktivierter Tonwahl. Jetzt gilt **`renotify:state.sound===true`**, zusammen mit `silent:!state.sound`. Ohne explizite Tonwahl bleibt es lautlos. Native Geräteeinstellungen entscheiden weiter über die tatsächliche Ausgabe. [MDN showNotification, renotify/silent](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification). Das kann unauffällige Ersatzmeldungen erklären, ist aber kein Beweis für den konkreten vom Nutzer vermissten Hinweis.

Die Diagnosekarte nennt **Internet-Test**, **Automatischer Zughinweis** oder **Automatisches Spielende** und Datum/Uhrzeit des Versuchs. „Push-Status prüfen“ bleibt eine manuelle Einzelabfrage. Keine neuen Push-Ereignisse, Erinnerungen, Timer oder API-Schleifen. Lautloser Standard, ein globales Minutenlimit und ein Eintrag, Vordergrundsperre, aktuelle Raumprüfung und persistente Deduplizierung unverändert. Für die Anzeige-/Tonkorrektur normal auf 1.12.0 aktualisieren, keine Neuinstallation. Automatisierte Workerprüfung deckt Tonwahl und Ersatz plus schnelle/duplizierte Ereignisse ab; neue physische Android-Abnahme wurde nicht durchgeführt.

## Offline-Testprotokoll und Minen

Das lokale Testprotokoll lädt keine Daten hoch und versendet keine Hinweise. Die optionale Computer-Mine ist eine lokale Spielvariante ohne neue Push-Art oder automatische Nachricht. Offline-Direktverbindungen behalten ihre bisherigen Hintergrundgrenzen.

Bonusfelder ab 1.17.0 werden ausschließlich in der geöffneten Partie über den vorhandenen Spielabgleich bekanntgegeben. Keine zusätzliche Push-Art, Freigabe, Diagnoseübertragung oder Abfrage.
