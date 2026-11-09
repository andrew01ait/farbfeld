# Gemeinsame Gestaltung der Spielhinweise

<!-- farbfeld-version: 1.17.2 -->

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
