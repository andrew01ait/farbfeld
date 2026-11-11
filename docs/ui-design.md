# Gemeinsame Gestaltung der Spielhinweise

<!-- farbfeld-version: 1.19.3 -->

## Ruhiger Direktbeitritt

Kurze gemeinsame WLAN-Zeile, Namensfeld und eine neutrale QR-Karte mit 28-Pixel-Symbol. Internetcode und Hilfe in getrennten nativen Details, 44-Pixel-Aktionen, kompakter kontextueller Footer statt langer vollständiger Anleitung vor dem Namen. Lokales Verwerfen wird ausdrücklich beschriftet und bestätigt; keine Löschaktion auf der Startkarte.


## Passive Direktwurf-Vorschau

Kleine neutrale Fläche vor der Punktezeile, vollständiger aktiver Name, drei Farb- und drei Zahlenwürfel als nicht interaktive Elemente mit zugänglichen Wertbezeichnungen. Flexible Gruppen umbrechen auf schmalen Handys. Kein gesperrtes schwebendes Würfelpanel; normale Auswahl und Aktionen bleiben ausschließlich der berechtigten Person vorbehalten.


## Schlanke Raumkarten 1.19.1

Raumkarten folgen den ruhigen Spielflächen: var(--card), dünner var(--line)-Rand, 12-Pixel-Radius, kein Schatten, 9×10 Pixel Innenabstand und sechs Pixel Abstand zwischen Karten. Titel 14 Pixel, vollständige Namen/Status 11 Pixel. Modus ist normaler Text in derselben Metazeile wie Code/Personenzahl bzw. Wurf; keine Kapsel über dem Titel. Öffnen und Zugang entfernen sind klare 44-Pixel-Symbolaktionen, Entfernen nur in der Gesamtübersicht und weiterhin bestätigt. Suche/Filter/Seiten bleiben; redundante Sortier- und Zusammenfassungszeilen entfallen.


## Ruhige Raumübersicht

Eine gemeinsame Sektion zählt alle gespeicherten Partien. Maximal drei Startkarten; bekannte eigene Zuggelegenheiten zuerst und weitere als kompakter Hinweis. Alle Räume bietet eine vollständige Übersicht mit Suchfeld, drei 44-Pixel-Modusfiltern und zehn Einträgen pro Seite in einem begrenzt scrollenden Listenbereich. Modus steht als ruhiger Text in der gemeinsamen Metazeile unter dem Namen. Unter Code/Spielerzahl stehen alle Teilnehmer; Host fett mit ♛ und zugänglicher Gastgeberbeschriftung. Lange Raum-/Teilnehmernamen umbrechen vollständig; Öffnen-Pfeil bleibt mindestens 44 Pixel.


## Direktname und Aktionen

Direkte Startkarten dienen ausschließlich dem Wiederöffnen. Kein Verlassen-Menü und kein Strafpunktehinweis auf der Startseite. Beenden im Spiel öffnet die gemeinsame Verlassen-Bestätigung. Optionale Direktnamen stehen vollständig in Startkarte, Lobby und Spielkopf; Gastgeber können über die vorhandene Stift-Sprache umbenennen, Gäste sehen reinen Titeltext. Eigenständiger Spielername und gemeinsamer Partiename erhalten getrennte beschriftete Felder.

## Direct matches and settings

On narrow phones, direct match titles have their own row above equal-width round/score/exit controls. Compact connection details are above player names; expand them to disconnect. A paused connection exposes recovery directly. Saved direct cards use 44-pixel open/manage controls. Score labels wrap. Settings have no duplicate game-exit buttons; installation/backups and help/diagnostics are collapsed native sections. Version/update remains directly available. Hidden connection labels are anchored to their status dot.

## Dauerhafte Farbhinweise

Farbabschlüsse bleiben mit Spielername und Farbe während der gesamten Partie sichtbar, auch nach weiteren Würfen, Blattwechsel und Wiederaufnahme. Die Anzeige liest alle gespeicherten bestätigten Abschlüsse ohne Rundengrenze. Minen entfernen verlorene Abschlüsse und aktualisieren übertragene Farbprämien bereits in der gemeinsamen Engine; die Karten übernehmen diesen aktuellen Stand. Im verdeckten Spiel bleiben Prämienwerte und fremde Blätter verborgen. Kein zusätzlicher Timer, Push, Datenabruf oder neues Speicherformat.

Minen, Bonusfelder, Farbabschluss, Punkte und Ergebnis folgen derselben ruhigen Kartensprache. Die gedruckten Brettfarben vermitteln das Spiel; zusätzliche Flächenfarben vermitteln nur einen konkreten Zustand.

| Element | Vertrag |
|---|---|
| Grundfläche / Kontur | `--status-surface` aus `--card`, `--status-border` aus `--line`, daher passend zu allen sechs Designs |
| Kleine Statuskarte | 14 Pixel Radius, 8–10 Pixel Innenabstand, 32-Pixel-Symbolfeld |
| Symbole | lokale SVGs mit 22–24 Pixeln; Mine bleibt außerhalb der seitlich scrollbaren Namen |
| Bereitschaft / Prämie | dunkelgrüner Text oder kleines sanftgrünes Symbol-/Wertfeld; nie nur Farbe als Signal |
| Schaden / Fehler | gedämpftes Rot mit erklärendem Text, gestrichelten betroffenen Kreuzen und zugänglicher Zellbeschreibung |
| Handlungswarnung | Bernstein nur bei tatsächlich nötiger Korrektur, nicht für normale Spielinfos |
| Zug / Betrachtetes Blatt | dunkler aktiver Spieler, Kontur/Unterstrich für betrachtetes Blatt; Rollen bleiben textlich erhalten |
| Ergebnis | neutrale Fläche, Gewinnerzeile mit kleinem grünen Textakzent; Aufschlüsselungen im selben Flächensystem |

Minen, Bonusfelder, Farbabschluss, Punkte und Ergebnis folgen derselben ruhigen Kartensprache. Die gedruckten Brettfarben vermitteln das Spiel; zusätzliche Flächenfarben vermitteln nur einen konkreten Zustand.

| Element | Vertrag |
|---|---|
| Grundfläche / Kontur | `--status-surface` aus `--card`, `--status-border` aus `--line`, daher passend zu allen sechs Designs |
| Kleine Statuskarte | 14 Pixel Radius, 8–10 Pixel Innenabstand, 32-Pixel-Symbolfeld |
| Symbole | lokale SVGs mit 22–24 Pixeln; Mine bleibt außerhalb der seitlich scrollbaren Namen |
| Bereitschaft / Prämie | dunkelgrüner Text oder kleines sanftgrünes Symbol-/Wertfeld; nie nur Farbe als Signal |
| Schaden / Fehler | gedämpftes Rot mit erklärendem Text, gestrichelten betroffenen Kreuzen und zugänglicher Zellbeschreibung |
| Handlungswarnung | Bernstein nur bei tatsächlich nötiger Korrektur, nicht für normale Spielinfos |
| Zug / Betrachtetes Blatt | dunkler aktiver Spieler, Kontur/Unterstrich für betrachtetes Blatt; Rollen bleiben textlich erhalten |
| Ergebnis | neutrale Fläche, Gewinnerzeile mit kleinem grünen Textakzent; Aufschlüsselungen im selben Flächensystem |

## Kurze Sprache, vollständige Details

Farbabschluss: **Du hast Grün abgeschlossen · +5**, bei benannter Person **Computer hat …**. Derselbe Formatter gilt für Toast und Karte. Bonus: **Du · +2**, Gleichstand **Du & Computer · je +2**. Zähler **1/3** mit zugänglicher Vollbeschreibung. Ein nativer Details-Schalter öffnet den Wurf-/Gewinnerverlauf; keine zusätzliche große Text-/Linkzeile. Sechsergleichstände erhalten eine kompakte Anzahl und vollständige Namen im Verlauf. Nur lange Namen werden in der geschlossenen Bonuszeile gekürzt; Prämien bleiben sichtbar.

## Verdeckung und Bedienung

**Nur dein Blatt sichtbar · alle Punkte erst am Spielende.** Fremde Blätter, eigene/fremde Totale und Prämienwerte bleiben bis zum Ende verborgen. Keine geheimen Bonuskoordinaten, vorläufigen Treffer oder versteckten Schadensdetails in UI, Tooltip oder zugänglichen Labels. Statusbilder lesen nur die bereits erlaubten Projektionen.

Touch-Aktionen sind mindestens 44 Pixel hoch; Details sind per Tastatur und Fokusrahmen bedienbar. Mine/Bonus/Farbhinweise bleiben bei 320 Pixeln enthalten, Gruppennamen scrollen separat. Querformat darf das ganze Seitenpanel scrollen; Würfelaktionen bleiben im normalen Fluss. Drei Sekunden Explosion, Folge-Runden-Schaden und Mine-bereit-Signal bleiben erhalten; reduzierte Bewegung wird respektiert.

[Prüfumfang](responsive-qa.md) · [Minen](mines.md) · [Bonusfelder](bonus-fields.md) · [Mehrspielerabläufe](flows.md).
