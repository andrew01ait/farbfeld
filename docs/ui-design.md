# Gemeinsame Gestaltung der Spielhinweise

<!-- farbfeld-version: 1.34.2 -->

## Spielanleitung

Die Themen stehen im Desktop-Dialog neben dem Clip. Bis 620 CSS-Pixeln steht ein Auswahlfeld über dem Kapitel. Das Kapitel nennt oben das Ziel und zeigt drei oder vier nummerierte Schritte. Die aktive Schrittposition bleibt beim Wechsel ablesbar. Die Vorschau startet auf Wunsch und lässt sich pausieren. Bedienhinweis, Wertung und aufklappbare Regeln stehen beim Clip. Ab 1000 CSS-Pixeln zeigt eine eigene Spalte rechts die Wertung.

## Beschriftung beim Brett-Zoom

Im Hauptbrett verwenden Spaltenbuchstaben und beide Punktzahlen eine gemeinsame Grundgröße, abgeleitet aus der aktuellen Feldbreite. Die Zeilen oben und unten erhalten entsprechend Platz. Der H-Pfeil sitzt neben dem mittigen Buchstaben und wird bei wenig Platz kleiner. Die Zeilennummern links bleiben in ihrem 20-Pixel-Rand und auf der Höhe ihres Feldes.

## Animationsvorschau

Die PC-Vorschau zeigt links die Spielansicht und rechts die Bedienelemente und die scrollbare Zeitleiste. Die Beispiele nutzen reguläre Scrollwechsel, Moduskarten, Zellanimationen, Banner oben und Toasts unten. Der kompakte Ausschnitt stellt die Bewegungen auf einem nummerierten Beispielbrett oder der Schusskarte dar. [Szenen](offline-diagnostics.md#animationsvorschau)

Jede aufklappbare Zeile zeigt Zeit, Ereignis und gegebenenfalls Sichtbarkeit oder gemessene Bewegung. Beim Öffnen ersetzt das Standbild die linke Vorschau. Es behält Seiten- und Brettposition. Die Zeichnung der Markierungen folgt der Skalierung des Ausschnitts.

## Spielhinweise und nummerierte Schusskarte · 1.25.0

Die Glocke bei „Deine Räume“ zeigt seit 1.25.1 offene eigene Züge und die Zahl ungesehener Ergebnisse. Der Dialog nennt zusätzlich die gesamte Zahl laufender Partien. Ihr Dialog trennt nach Partien, mit klarer Ergebnisaktion und 44 Pixel Antippfläche. Die Schusskarte reserviert links eine schmale Nummernspur für Zeile 1–7 in derselben eingepassten Gesamtbreite. Bei gemeinsamer Startvorbereitung benennen die Überschriften die beiden aufeinanderfolgenden Schritte.

## Koordinaten, echte Punkte und Vergleich · 1.24.0

Die Spalten A–O sind kräftig und in der Schriftfarbe des Designs beschriftet. Ihre Größe folgt der Feldbreite. Zeilen 1–7 sitzen in einer festen 20px-Spur innerhalb der Brettbreite. Die Startspalte H bleibt hervorgehoben und ihr Pfeil schrumpft bei sehr kleinen Zellen. Alle Zell- und Punktpositionen bleiben bei Einpassen und Zoom ausgerichtet.

Discovery, Mischung und geheime Minen sind keine Prämienkategorien und erhalten keinen 0-Punkte-Badge. Luftangriff zeigt angefallene Kosten; echte Bonusfunktionen behalten 0 als noch nicht verdienten Punktestand. Fertige aufklappbare Karten schließen einmal, danach ist freies Wiederöffnen möglich.

Ergebnisvergleich: dieselbe eigene Person bleibt Basis, andere Personen sind über 44px-Tasten auswählbar. Semantische Tabelle mit Kategorie, Du, Name und Differenz; Kosten/Sternabzüge sind negativ, Gesamtwerte entsprechen der Engine. Lange Namen umbrechen, keine horizontale Seitenausdehnung auf 320px. Ausgestiegene zeigen −10 statt erfundener regulärer Beiträge.


## Schatzslots und Suchverlauf · 1.23.2

Drei gleich breite, themeabhängige Kästchen stehen für die tatsächlichen Schätze. Offen: Raute und Noch offen. Eigener/gleichzeitiger Fund: grünes Häkchen und Dein Fund. Fremder Alleinfund: gestrichelter Rand, Kreuz, durchgestrichener Schatzname und öffentlicher Gewinnername; nicht verfügbar auch im zugänglichen Namen. Die letzten fünf Suchzüge stehen neueste zuerst als kompakte unverschachtelte Liste mit Temperatur/Fokusfeld und Wurf/allen eigenen Feldern darunter oder daneben. Die Historie bleibt im bestehenden nativen Details-Panel ohne zusätzliches Aufklappen oder inneren Scrollbereich. Keine Punkte in verdeckten laufenden Partien.


## Weniger Leerflächen in Handyformaten · 1.23.1

Kurze Featurekarten teilen ab 681px sowie im kurzen Handyquerformat ab 560px weiterhin zwei Spalten. Offene versteckte Minen, Schatzdetails und Schiffsboni bekommen jetzt in beiden Breakpoints eine volle Zeile, öffentliche Aufträge ebenfalls. So erzeugt ein langer Bericht keine große leere Nachbarhälfte. Im offenen Minenbericht stehen Bereitschaft/Sicherheit links, Ereignisse rechts; schmale Hochformat-Handys bleiben einspaltig. Kompakte Karten stehen im Zweispaltenraster vor offenen Details wie im bisherigen Querformatmuster.

Auftragsfortschritt und Fristchips teilen umbrechenden Platz direkt unter dem Titel, ohne zusätzliche obere Chipzeile. Es bleiben durchgehend rechts eigene Punkte, 44px Hilfeziel mit kleinem sichtbaren Ring und reservierter separater Pfeilplatz. Native Aufklappzustände, versteckte Punkte und Zoom der beiden Bretter bleiben erhalten. Hochformat, Querformat.

Schatztemperaturen nennen tatsächliche eigene Suchfelder; die offene Karte enthält eine knappe sichtbare Schrittlegende. Der permanente Minenbericht zeigt Person und Schaden im eigenen Panel, offene Positionen als ergänzende Metadaten. Keine großflächige neue Schadenskarte oder automatische Blattnavigation.

## Schatzkarte 1.23.0

Die Schatzsuche verwendet dieselbe neutrale Bonusfläche mit 32px Geschenk, rechts eigenen gewerteten Punkten, einer knappen Statuszeile und separater 44px Regelhilfe. Native Details enthalten die drei Fundschritte, historische Messung, grobe Spur und Verlauf. Temperaturpunkte sind zusätzlich beschriftet (blau/ocker/orange); keine reine Farbcodierung, rote Flächen bleiben Schäden/Fehlern vorbehalten. Geöffnete Bonusdetails bleiben bei normalen Neudarstellungen desselben Match-/Teilnehmerkontexts erhalten. Keine zusätzlichen dauerhaften großen Spielflächen oder Bewegung.

## Einheitliche rechte Spalten · 1.22.5

Jede Spielkarte reserviert rechts die identischen Spalten für eigene Punkte, 44-Pixel-Hilfe und 18-Pixel-Aufklapppfeil. Fehlt der Pfeil, bleibt sein Platz frei. Das hält Fragezeichen und Punkte bei Luftangriff, versteckten Minen, Schatzsuche, Schiffsboni, Entdeckermodus, Aufträgen und Mischung bündig. Die Auftragsfristen bleiben unterhalb der Titelzeile; Hilfe und Aufklappen bleiben getrennt. Schatzsuche ersetzt die Beschriftung Bonusfelder in Einrichtung, Lobby, Karte, Hilfe, Ergebnis und zugänglichen Namen. Geprüfte Originalkarten.

Beim Luftangriff gehören die kompakten Statuschips auch in schmalen Ansichten in die Statuszeile unter dem Titel. Die eigenen Chips stehen vor der horizontal verschiebbaren Liste der Mitspielenden. Die aktive Zielwahl bekommt eine eigene Zeile unter dem Kartenkopf.

## Anker vollständig innerhalb der Grafik · 1.22.4

Schiffsboni nutzt denselben Anker in Bestätigungsbutton, Spielpanel, Auswahl und Ergebnis. Der untere Bogen endet innerhalb der 24×24-SVG-Fläche einschließlich Strichstärke. Kein overflow-Trick und keine vergrößerten Buttons; bestehende Themenfarben und Symbolgrößen bleiben erhalten. Geprüfte Originaldarstellung.

## Beide Aufstellraster einpassen · 1.22.3

Flotte und Minen verwenden denselben eigenen Karten-Viewport: vollständige 15 Spielspalten plus Zeilenlabels, alle sieben Zeilen sichtbar, −/Prozent/+/Einpassen über dem Raster und ein kurzer Zwei-Finger-Hinweis darunter. Die Aufstellung hat keine feste Mindestbreite mehr. Auch im niedrigen Querformat begrenzt die Höhe das eingepasste Raster. Kleine Rasterzellen sind im Fit-Modus zulässig; Zoom und 44-Pixel-Koordinatenalternativen dienen der genauen Bedienung. Buttons bleiben 44 Pixel hoch. Vergrößerung/Ausschnitt bleiben bei einer Auswahl-Neudarstellung erhalten, der nächste Vorbereitungsschritt startet eingepasst. Schiffsansicht, Minenansicht.


## Schusskarte und gemeinsame Hilfe · 1.22.2

Kartenkopf: Symbol, Titel, eigene Punkte, 44-Pixel-Regelhilfe und separater Aufklapppfeil. Die Hilfe für öffentliche Aufträge bleibt in der Titelzeile; Fristen weiter darunter. Auch Bonusfelder ohne bisherigen Fund haben ein Fragezeichen.

Die Schusskarte verwendet die tatsächlich verfügbare Breite und passt alle 15 Spalten zunächst ein. Vier kompakte Kontrollen (−, Prozent, +, Einpassen), darunter nur bei Vergrößerung horizontaler Scrollbedarf. Zellen, Treffer-/Wassersymbole und Spaltenbuchstaben wachsen gemeinsam. Im niedrigen Querformat bleibt der Kartenblock rechts von den Schiffsmetadaten. Beim Versenken bewegt sich wieder ein ganzer horizontaler oder vertikaler SVG-Rumpf durch eine Wasserlinie, innerhalb exakt seiner Grid-Fläche; reduzierte Bewegung blendet nur aus.


Schuss- und Versenkungsimpulse sind zellgebundene SVGs mit relativer Größe; feste Bildschirmkoordinaten und große Textsymbole entfallen. Permanente eigene Treffer verwenden einen klaren roten Ring mit Kreuz. Im verdeckten Spiel erscheinen weder gegnerische Orte/Animationen noch Trefferlabels auf dem eigenen Blatt.


Versteckte Minen nutzt dieselbe native Aufklappkarte: eigene Punkte rechts, geschlossen höchstens eine kurze Statuszeile (2/2 scharf · 0 ausgelöst). Erklärung/eigene Sicherheit liegen in den Details; der Öffnungszustand bleibt beim nächsten Rendern erhalten.


## Weniger Leerraum, gemeinsame Aufstellung · 1.22.1

Spielkarten verwenden 6/8-Pixel-Innenabstände und zwei eng verbundene Textzeilen: Titel/eigene Punkte, darunter Fortschritt. 32-Pixel-Symbol und 44-Pixel-Hilfe liegen neben beiden Zeilen. Luftangriffsstatus ist direkt unter dem Titel, mit kompakten lesbaren Zustandschips; Ziel wählen bleibt 44 Pixel hoch. Auftragsfristen behalten ihre eigene volle Zeile und alle drei Gültigkeiten. Neutrale Flächen und offene Detailzustände bleiben erhalten.

Flotten und geheime Minen teilen Auswahlkarten, A–O/1–7-Raster, Spalte/Zeile, Zufällig verteilen und denselben Bestätigungsknopf. Das Schiffsraster zeigt jetzt ebenfalls Zeilennummern und Brettfarben/Sterne. Karte und Einstellungen stehen auf breiten Ansichten nebeneinander, auf schmalen untereinander. Schiffsdrehung bleibt eine zusätzliche fachliche Aktion. Kleine Rasterfelder haben 44-Pixel-Koordinatenalternativen; keine neue Spielregel.


## Zwei unterscheidbare Angriffe · 1.22.0

Luftangriff verwendet das gemeinsame Flugzeug-Symbol in Einrichtung, Lobby, Status, Hilfe und Ergebnis. Der kurze zellgebundene Überflug mit Abwurf führt zum bestehenden bestätigten Einschlag. Versteckte Minen haben ein eigenes SVG, eine geheime kompakte Platzierungsseite, zwei Slot-Karten sowie dieselben A–O/1–7-Koordinatenalternativen. Die eigene ungefährliche Mine wird klein rechts unten im Feld markiert; fremde unentdeckte Positionen werden nicht gerendert.

Die neue Minenbox verwendet dieselbe neutrale feature-panel-Fläche, dieselben 32-Pixel-Symbole und kompakten Hilfezeichen. +0 P rechts, eigene scharfe Minen und gegnerische Auslösungen darunter; verdeckte Punkte bleiben unsichtbar. Bodenexplosion: einmaliger heller Sternblitz, acht auswärts fliegende Splitter, Druckwellen und verschwindende tatsächliche Kreuze. Alles liegt in relativen SVG-Schichten der Zelle, auch im Querformat und bei 30–260 Prozent Brett-Zoom. Keine bildschirmfüllende Explosion. Reduzierte Bewegung zeigt nur die ruhige Meldung. [Browseransichten](responsive-qa.md).


## Minen 1.21.2

Das Raster führt den Dialog; kurze Anweisung, klare Spalten/Zeilen und zielgenaue Bestätigung mit Einsatz. Regeln sind eingeklappt. Im niedrigen Querformat stehen Koordinaten und kurze Fakten neben dem vollständigen Raster, die Zündaktion bleibt sichtbar. Alle sechs Designs verwenden vorhandene neutrale Statusflächen.

Kein großer Explosionskreis vor dem ganzen Spiel. Der bestätigte Einschlag wächst als lokale SVG-Welle am Ziel, nur tatsächlich entfernte Kreuze lösen sich auf; ein leeres Ziel zeigt eine blaue Welle. Ein kleiner Hinweis oben lässt die unteren Spielaktionen frei. Rote gestrichelte Konturen plus ein proportionaler Minus-Kreis unterscheiden verlorene Kreuze von normalen gesetzten Symbolen; grüne durchgehende Konturen kennzeichnen Wiederauffüllen. Die kompakte Legende nennt den tatsächlichen letzten Anzeigewurf. Beibehaltene Schiffstreffer/Funde sind davon unabhängig. Verdeckte fremde Schäden werden weder gelesen noch dargestellt.


## Variantenlobbys und private Flotten 1.21.0

Alle vier Varianten nutzen die bestehenden ruhigen Symbol-/Text-/Switch-Zeilen in Direkt- und Internetlobby; nur Gastgeber erhalten Schalter. Die sichtbare kleine Switchgrafik liegt in einer 44×44-Pixel-Fläche. Unbestätigte Geräte und noch ungekoppelte Handys werden unterschiedlich erklärt. Schiffsboni bei mehr als zwei Personen gesperrt, übrige Zeilen weiter bedienbar. Ein-Handy-Einrichtung verwendet dieselben nativen Symbol-/Checkboxkarten wie Computer.

Private Aufstellung: kompakter 24–32-Pixel-Titel mit eigenem Namen, eigene Flotte und Koordinatenauswahl. Nach Bestätigung bleibt eine klare Warteseite; am gemeinsamen Handy verdeckt die Übergabeseite beide Flotten. Normale Karten, Punkte rechts, Fortschritt darunter und Animationen verwenden den aktuellen eigenen Index statt fester Person 0. Gegnerische Konturen erscheinen beim offenen Blattwechsel nicht. Physische Hardwareprüfung bleibt separat.


## Punkte rechts, Fortschritt darunter und deutliches Spielende 1.20.6

Jeder Regelkopf nutzt Symbol, Titel, eigene bestätigte Punkte mit P und dieselbe 44-Pixel-Aktionsspalte. Fortschritt liegt in einer eigenen Zeile darunter: keine erledigten Aufgaben im Punkteplatz. Minen zeigen +0/−5, Bonusfelder nur eigene Prämien, Schiffe nur Versenkungspunkte, Aufträge nur gewertete Prämien; Entdecken/Mischen +0. Verdeckung entfernt Werte vollständig auch aus zugänglichen Namen. Der vollbreite Schiffskopf bleibt im niedrigen Querformat über Metadaten/Karte, damit Punkte am rechten Kartenrand stehen.

Ende: dunkler Kopf im bestehenden Ink-Ton, Pokal, klare Überschrift und Endstand; gemeinsame Siege mit mehr als zwei Personen erhalten eine kurze Überschrift und vollständige Namen in der Rangliste. Gemeinsame Symbolzellen erklären Spalten, Farben, Joker, offene Sterne, Bonus, Schiffe, Aufträge und Minen. Native scrollbar begrenzte Modalfläche mit deutlichem Hintergrund, fester Titelzeile und großen Aktionen; zusätzlich Ergebnis über den Regelkarten. Aufträge zeigen für alle drei Aufgaben Restzeit auch geschlossen und explizite inklusive Rundengrenzen geöffnet.


## Schiffsrahmen und Treffer beim Zoom 1.20.5

Der feste 21-Pixel-Trefferstern wurde durch ein Inline-SVG ersetzt. Schiffsrahmen erhalten zellabhängigen Abstand, Konturstärke und Radius; der Stern bleibt mittig mit zehn Prozent Innenabstand innerhalb dieses Rahmens. Das SVG behält sein Seitenverhältnis auch bei flachen Querformatzellen. Keine Schrift-Linebox kann in Nachbarzellen überlaufen. Markierungen sind dekorativ und fangen keine Eingabe ab; der zugängliche Zellname behält „getroffen“.


## Niedriges Handy-Querformat 1.20.4

Bei Querformat ab 560 Pixel Breite bis einschließlich 650 Pixel Höhe folgen vollbreite aufgeklappte Karten auf die kompakte zweispaltige Statusübersicht. Für Schiffsboni: mindestens 180 Pixel breite linke Metadatenspalte; vollständiges 15-spaltiges Angriffsraster und Legende rechts. Zellhöhe 18–25 Pixel abhängig von der Fensterhöhe, klare Wasser-Ringe bleiben erhalten. Der Kartenkopf und die eigene Flotte teilen sich die linke Spalte mit ausreichendem Textabstand. Die explizite Inhaltsgruppe vermeidet browserspezifische anonyme Details-Raster. Hochformat und höhere Ansichten behalten ihre bisherigen Karten und Scrollmöglichkeiten.


## Kompakte Hilfe und sichtbare Fehlschüsse 1.20.3

Fragezeichen bei Minen, Entdecken und Mischen: 13-Pixel-Zeichen mit 24-Pixel-Kreis in unveränderter 44×44-Pixel-Antippfläche, weiterhin mit zugänglichem Hilfetext und Tastaturfokus. Bestätigte Fehlschüsse erhalten hellblaue Felder, dunkle Zwei-Pixel-Kontur und einen 16-Pixel-SVG-Ring. Unbeschossene Felder behalten ihre graue Schraffur, Treffer den roten Stern und versenkte Schiffe den Anker. Die Legende und der Koordinatenname nennen „Fehlschuss (Wasser)“.


## Statusboxen und freie Farbwahl 1.20.2

Alle aktiven Spielelemente stehen je einmal als neutrale Statuskarte oberhalb des Spielfelds. Gleiche Flächen/Konturen/Radien wie Minen und Bonusfelder; SVG-Symbol links, Titel und kurzer Fortschritt daneben. Schiffsboni und Aufträge lassen sich aufklappen, die offene Ansicht bleibt beim Setzen erhalten. Entdeckerkarte zeigt offene Fundorte und bereite/spätere Ladungen; Mischkarte nennt den nächsten Rundenwechsel. Verdeckte tatsächliche Prämien bleiben verborgen.

Farbwahl zeigt alle fünf Farben in einer eigenen durchgehenden Zeile unter den Würfelgruppen. Der zu ersetzende verfügbare Farbwürfel ist automatisch zugeordnet und sichtbar; die Bedienung erfordert keinen zusätzlichen Farbwürfel-Klick. Kopftexte bleiben bei allen sechs Designs lesbar, Statuskarten stehen auch aufgeklappt vollständig vor dem Blatt.


## Auswahlkarten 1.20.1

Alle Optionen verwenden ein Dreispaltenraster: 32-Pixel-Symbol, flexibel umbrechender Text, 24-Pixel-Häkchen. Unter 360 Pixeln werden Symbol/Abstände auf 28/9 Pixel und das Häkchen auf 22 Pixel reduziert. Die gesamte Karte ist eine große Antippfläche. Gleichmäßige neutrale Flächen, dünne Kontur bei Auswahl und klare weiße Haken auf dunklem Grund; gleiche Linien-SVGs auch für verdeckten Punktestand, Minen und Bonusfelder. Keyboardfokus bleibt sichtbar, bei erzwungenen Systemfarben erscheint die native Checkbox. Keine gestapelten Rieseneingaben aus allgemeinen Dialogstilen.


## Computer-Varianten 1.20.0

Je eine kompakte Statuskarte pro aktiver Regel oberhalb des Blatts, drei kurze Fähigkeitsschalter im Würfelbereich und aufklappbare Schiffs-/Auftragsdetails. Sichtbare öffentliche Fundsymbole unterscheiden frei, selbst gefunden und vom Gegner vergeben. Die eigene Flotte nutzt eine schmale Kontur; keine Schiffskoordinate auf dem offenen Computerblatt. Vorbereitung bietet fünf Schiffswahlen, Drehen, Zufall und Koordinatenauswahl neben dem horizontal scrollbaren Raster. Treffer als kurzer Impuls, Versenkung als sinkende Silhouette mit Blasen; bei verdeckten Punkten ohne Prämienzahl, bei reduzierter Bewegung als Blende. Rendering und Effekte mutieren keine Regeln. Nur neue bestätigte Ereignisse werden abgespielt; Laden wiederholt keine Animation.


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

## Direktspiel und Einstellungen

Direktpartien verwenden auf schmalen Handys dieselbe eigene Titel-/Steuerungsstruktur wie Internet-Räume. Der Titel darf zwischen Wörtern umbrechen; er teilt seine Zeile nicht mit Wurf/Punkte/Beenden. Die geschlossene Verbindungszeile steht oberhalb der Spielernamen; Details enthalten Trennen, eine nötige Wiederkopplung bleibt direkt sichtbar. Startkarte kompakt mit einem 44-Pixel-Öffnen-Pfeil. Beschriftungen der Punktkarten dürfen umbrechen. Spiel verlassen/abbrechen bleibt in den Spielaktionen, ohne Duplikate auf der Direkt-Startkarte oder in Einstellungen. Installation/Sicherung sowie Hilfe/Diagnose sind native aufklappbare Bereiche; Version/Update bleiben sofort erreichbar.

## Dauerhafte Farbhinweise

Farbabschlüsse bleiben mit Spielername und Farbe während der gesamten Partie sichtbar, auch nach weiteren Würfen, Blattwechsel und Wiederaufnahme. Die Anzeige liest alle gespeicherten bestätigten Abschlüsse ohne Rundengrenze. Minen entfernen verlorene Abschlüsse und aktualisieren übertragene Farbprämien. Die Karten zeigen den aktuellen Stand. Neu gewertete Abschlüsse erscheinen im Ereignisbanner mit einem animierten Häkchen in der abgeschlossenen Farbe. Gleichzeitige Abschlüsse teilen sich einen kompakten Eintrag. Im verdeckten Spiel bleiben Prämienwerte und fremde Blätter verborgen.

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
| Ergebnis | dunkler Ink-Kopf mit Pokal, klare Gewinnerzeile; neutrale Aufschlüsselungen mit lokalen Symbolen |

## Kurze Sprache, vollständige Details

Farbabschluss: **Du hast Grün abgeschlossen · +5**, bei benannter Person **Computer hat …**. Derselbe Formatter gilt für Toast und Karte. Bonus: **Du · +2**, Gleichstand **Du & Computer · je +2**. Zähler **1/3** mit zugänglicher Vollbeschreibung. Ein nativer Details-Schalter öffnet den Wurf-/Gewinnerverlauf; keine zusätzliche große Text-/Linkzeile. Sechsergleichstände erhalten eine kompakte Anzahl und vollständige Namen im Verlauf. Nur lange Namen werden in der geschlossenen Bonuszeile gekürzt; Prämien bleiben sichtbar.

## Verdeckung und Bedienung

**Nur dein Blatt sichtbar · alle Punkte erst am Spielende.** Fremde Blätter, eigene/fremde Totale und Prämienwerte bleiben bis zum Ende verborgen. Keine geheimen Bonuskoordinaten, vorläufigen Treffer oder versteckten Schadensdetails in UI, Tooltip oder zugänglichen Labels. Statusbilder lesen nur die bereits erlaubten Projektionen.

Touch-Aktionen sind mindestens 44 Pixel hoch; Details sind per Tastatur und Fokusrahmen bedienbar. Mine/Bonus/Farbhinweise bleiben bei 320 Pixeln enthalten, Gruppennamen scrollen separat. Querformat darf das ganze Seitenpanel scrollen; Würfelaktionen bleiben im normalen Fluss. Drei Sekunden Explosion, Folge-Runden-Schaden und Mine-bereit-Signal bleiben erhalten; reduzierte Bewegung wird respektiert.

[Prüfumfang](responsive-qa.md) · [Minen](mines.md) · [Bonusfelder](bonus-fields.md) · [Mehrspielerabläufe](flows.md).
