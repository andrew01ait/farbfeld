# Offline-PWA und Mehrspieler: Prüfung vom 30.10.2026

Farbfeld bleibt eine normale installierbare Android-PWA. Für eine Partie ohne Internet zwischen mehreren Handys bleibt WebRTC DataChannel im gemeinsamen WLAN/Hotspot der passende verfügbare Transport. Das Netz muss die Geräte untereinander erreichen lassen. QR tauscht nur die einmaligen Verbindungsinformationen aus; es überträgt keine laufenden Spielzüge.

## Verbindungswege

| Weg | Eignung für Farbfeld | Automatisierbar / Grenze |
| --- | --- | --- |
| WebRTC DataChannel im WLAN/Hotspot | Implementiert, zuverlässige/geordnete Kanäle zum Gastgeber, 2–6 Personen | Ab erfolgreicher Kopplung laufen Würfe, Bestätigungen, Punkte und Abgleich automatisch. Leere ICE-Serverliste: kein STUN/TURN und keine Internetabhängigkeit des Spielkanals. Browser muss lokale Kandidaten liefern. |
| QR in beide Richtungen | Vollständig lokaler Austausch von Angebot/Antwort mit allen gesammelten Kandidaten | Komprimierung, Bildwechsel und Einsammeln mehrerer Bilder automatisch. Zwei einmalige Scanrichtungen pro Gast bleiben nötig. Nach einem vollständigen App-Neustart neue Kopplung zur gespeicherten Partie. |
| Kurzer Direkt-Kopplungscode | Implementiert, kurzlebiger Server vermittelt ausschließlich Angebot/Antwort | Antwort und Übernahme automatisch, kein Rückscan nötig. Ab 1.5.1 kann der Gastgeber Spiel und Code mit einem Knopf vorbereiten. Internet während der Kopplung und dasselbe lokale Netz nötig. Nach erfolgreicher Verbindung kein Signalisierungsdienst für die Partie. |
| Internet-Spielraum | Bestehender separater Modus, auch in verschiedenen Netzen | Durchgehend Server/Internet erforderlich; wechselt bei Internetverlust nicht automatisch in einen lokalen Direktkanal. |
| Web Bluetooth | Kein geeigneter zweiter Transport zwischen zwei normalen PWA-Handys | Browser ist BLE-GATT-Client/Central; die PWA kann nicht selbst den benötigten Peripherie-/GATT-Server auf dem anderen Handy anbieten. Das Vorhandensein von navigator.bluetooth allein reicht deshalb nicht. |
| Web NFC | Kein direkter Handy-zu-Handy-Spielkanal | NDEF-Tags, keine Peer-to-Peer-Kommunikation und keine Host Card Emulation. |
| Web Share / Android Quick Share | Mögliche spätere Hilfe für den einmaligen Datenaustausch | Website kann Text/Dateien ans System-Teilen übergeben. Nutzer wählt das Ziel; die PWA kann weder Quick Share erzwingen noch daraus einen dauerhaften Spielkanal machen. Derzeit kein neuer Dateikopplungsmodus implementiert. Kopieren/Einfügen besteht als Alternative. |
| WebSocket, HTTP, WebTransport | Mit erreichbarem Server möglich | Kein allgemeiner lokaler Server-/Discovery-Ersatz innerhalb einer normalen Android-PWA. Ein zusätzliches Servergerät wäre eine neue Voraussetzung. |
| Direct Sockets / UDP-Discovery | Kein Ersatz im bestehenden PWA-Modell | Chrome dokumentiert diese API für gesonderte Isolated Web Apps; nicht die normale über eine URL installierte Android-PWA. |
| Hotspot/Wi-Fi Direct selbst starten | Über native Android-APIs möglich, für diese PWA nicht verfügbar | Hotspot und Beitritt bleiben Android-Systemschritte. Die PWA kann weder SSID/Passwort zuverlässig auslesen noch bestätigen, dass zwei Geräte im selben WLAN sind. |

Weitere mögliche Automatisierung wäre, in einem Internet-Spielraum vorsorglich direkte Kanäle aufzubauen und nach Internetverlust den Gastgeber als verbindliche Instanz weiterführen zu lassen. Dafür wären neue Übergabe-/Versionsregeln und Vorabtests der direkten Erreichbarkeit nötig; ein bestehender Server-Spielraum bekommt diese Fähigkeit nicht allein durch einen QR- oder Code-Button. Diese Umstellung ist in 1.5.1 nicht implementiert. Ein Screen Wake Lock könnte außerdem das Abdunkeln in sichtbaren QR-/Spielansichten verringern; er hält eine in den Hintergrund gelegte PWA nicht zuverlässig am Leben.

Ein lokales Netz allein garantiert keine Verbindung. Client-Isolation im Gäste-WLAN, VPN, geschützte .local-Adressen/mDNS, Hotspot-Konfiguration und Browserrichtlinien können die direkte Erreichbarkeit verhindern. Browserberechtigungen unterscheiden sich nach Version; insbesondere ist eine nicht unterstützte local-network-Berechtigungsabfrage kein Beweis für einen Fehler. Die Prüfung öffnet keinen willkürlichen Router-Endpunkt und fordert keine Kamera an, um eine vermeintliche Netzwerkfreigabe zu erzwingen.

## Quellcodeprüfung und Korrekturen in 1.5.1

- Reproduzierter Einstiegsfehler: Die neue verdeckte-Punkte-Lobby las beim ersten Erstellen hiddenScores aus einem noch nicht vorhandenen Spielstand. Der Nullzustand wird nun korrekt gerendert. Das erklärt eine konkrete Variante „keine QR-Vorbereitung bei frischem Zugang, anderer Verlauf bei gespeichertem Zugang“; auf den beiden Nutzer-Handys noch nicht verifiziert.

- Sichtbare dünne schwarze Kontur für Enten, Kürbisse, Weihnachtsbäume und Standardkreuze. Bestätigte Zellen hellen nur den Hintergrund auf; das Symbol wird nicht zusammen mit der gesamten Zelle ausgeblendet.
- QR-SVGs bekommen explizite intrinsische Breite/Höhe und quadratische Darstellung. Ein Darstellungsfehler zeigt einen bleibenden Hinweis statt einer leeren Fläche.
- Defekte optionale Komprimierung fällt auf das vorhandene unkomprimierte QR-Format zurück.
- Ein QR-Kapazitäts-/Erzeugungsfehler verwirft nicht mehr das bereits erzeugte RTC-Angebot oder die Antwort. Kopplungscode und manuelle Rohdaten bleiben nutzbar. Manuell übernommene Rohdaten durchlaufen dieselbe Handshake-Validierung.
- Fehler bei der lokalen Adresssammlung bleiben in einem Dialog mit Wiederholen/Prüfen sichtbar. Ein Angebots-QR kann erst nach erfolgreicher Adresssammlung entstehen; Kamerafreigabe ist für seine Erzeugung nicht erforderlich.
- **Offline-Verbindung prüfen** im Direkteinstieg, QR-Dialog und Fehlerdialog: HTTPS, vollständiger Offline-Cache, Kamerafähigkeit/Freigabe, QR-Bildpixel-Selbsttest, abfragbare Netzwerkfreigabe, temporäre lokale ICE-Sammlung. Keine Kamera-Aufnahme, kein HTTP/STUN/TURN, keine Änderung einer bestehenden Sitzung. Temporärer Kanal/Peer werden auch bei Abbruch geschlossen.
- Das kopierbare Prüfergebnis enthält Status und Kandidatenanzahl, keine IP-Adressen, SDP, Namen, Sitzungskennungen oder Zugangsschlüssel. Es bestätigt ausdrücklich nur dieses eine Gerät, nicht die tatsächliche Verbindung zum zweiten Handy.
- **Mit Internet: Spiel mit Kopplungscode erstellen** automatisiert Angebot und Code-Erstellung; bei Codefehler bleiben QR/Rohdaten und ein sichtbarer Fehler erhalten.
- App-Navigation liefert sofort die vollständig gespeicherte App-Version. Ein Hotspot, der verbunden erscheint, dessen Internet aber hängt, blockiert den Start dadurch nicht mehr. Ein vorhandener Cache wird vor einer möglicherweise hängenden Updateanfrage geprüft und bestätigt. Updates laufen weiterhin über atomare Service-Worker-Installation; laufende Züge werden nicht automatisch neu geladen.
- 25 lokale Cache-Dateien einschließlich beider QR-Bibliotheken, Scanner und neuer Geräteprüfung. Spielstände/Speicherformate bleiben erhalten; Protokoll bleibt 2.

## Was damit nicht als behoben gilt

Die konkrete Ursache für unterschiedliche QR-Anzeigen auf Alexs und Beas Android-Handy wurde ohne diese Geräte nicht reproduziert. Möglich sind unterschiedliche Versionen/alte App-Adresse, fehlende Kandidaten oder ein QR-Darstellungs-/Erzeugungsfehler. Diese Fälle sind nun getrennt prüfbar; eine Ursache wird nicht ohne Befund behauptet. Das lokale QR-Testbild ist kein Beleg für Kamera-/Hotspot-Kompatibilität.

## Verifikation

Automatisierte Regel-/UI-/Computer-/QR-/PWA-/Direkt-Tests und beide API-Integrationen, inklusive Sechser-Partie, verdeckter Variante, doppelter/veralteter Aktionen, Wiederanlauf und Internetverlust nach Kopplung. Neue Regressionen prüfen Kompressionsfehler, fehlendes SVG, getrennte Fehlerursachen, Code-Alternative trotz QR-Kapazitätsfehler, Abbruch des Gerätechecks, keine Kamera-/HTTP-Zugriffe und App-Start bei hängendem Internet.

Browserprüfung: tatsächlich gerenderte Enten-/Kürbis-/Baummarkierungen; tatsächlicher QR-Testbild-Generator und lokaler Bildpixel-Decoder. Der Cloudbrowser liefert weiterhin keine lokalen ICE-Kandidaten. Diese Umgebung kann deshalb die neue Fehleranzeige, aber keine reale Android-WLAN-/Hotspot-Verbindung bestätigen. Zwei echte Android-Handys stehen nicht zur Verfügung.

## Primärquellen

Abgerufen am 30.10.2026; Browserunterstützung kann sich verändern.

1. [MDN: RTCPeerConnection-Konfiguration](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/RTCPeerConnection) – keine ICE-Server begrenzt die Verbindung auf lokale Peers.
2. [Chrome: Web Bluetooth](https://developer.chrome.com/docs/capabilities/bluetooth) – Central-Rolle und Verbindung zu entfernten GATT-Servern.
3. [Chrome: Web NFC](https://developer.chrome.com/docs/capabilities/nfc) – keine Peer-to-Peer-Kommunikation/HCE.
4. [Chrome: Direct Sockets](https://developer.chrome.com/docs/iwa/direct-sockets) – API für Isolated Web Apps.
5. [Android: Local-only Hotspot](https://developer.android.com/develop/connectivity/wifi/localonlyhotspot) – native API und Android-Berechtigungen.
6. [MDN: Web Share](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API) – systemgesteuerter, nutzerinitiierter Text-/Dateiaustausch.
7. [MDN: Local network access](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Local_network_access) – Browserfreigaben und versionsabhängige Umsetzung.
8. [Chrome: Local Network Access](https://developer.chrome.com/blog/local-network-access) – Einführung und damalige Einschränkungen; nicht pauschal als heutiger WebRTC-Kompatibilitätsnachweis verwendet.
9. [MDN: Caching für PWAs](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching) – vorab gespeicherte Dateien und Cache-first.
10. [MDN: Screen Wake Lock](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API) – weitere mögliche Automatisierung für sichtbare QR-/Spielansichten; verhindert keine Betriebssystem-Suspendierung nach App-Wechsel. In dieser Version nicht neu implementiert.

