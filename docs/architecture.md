# Architektur

<!-- farbfeld-version: 1.34.2 -->

## Öffentliche Website

`app/page.tsx` rendert die Spielvorstellung mit Metadaten, kanonischer URL und strukturierten Spieldaten. Die Sitemap enthält die Startseite. `/play` bleibt der eigenständige Einstieg mit Manifest und atomarem Offline-Cache. Der Service Worker fragt für `/` zuerst das Netz ab und liefert das gespeicherte Spiel, wenn der Netzabruf fehlschlägt.

Die Route `/impressum` liefert die Kontaktdaten aus der Laufzeitkonfiguration erst nach einem gleichursprünglichen POST mit passendem Formular- und Cookie-Token. Die Antwort wird weder im Service Worker gespeichert noch zur Indexierung freigegeben.

## Spielanleitung ab 1.34.0

`tutorial.js` enthält acht Kapitel mit 27 Schritten und je einem lokalen Standbild und H.264-Clip pro Schritt. Der ausgewählte Clip liest die vollständige Datei aus dem Offline-Cache, bevor der native Player innerhalb der Datei sucht. Themen- und Schrittwechsel beenden die alte Wiedergabe, geben ihre Quelle frei und laden nur den neu gewählten Clip. Aufnahmen zeigen Ausschnitte aus gerendertem Farbfeld mit Beispieldaten.

## Luftangriff ab 1.33.0

`game.mines.schema` bestimmt die Freischaltungen. Schema 1 führt wie bisher die Farbfreischaltung. Schema 2 ergänzt `coverage.unlocked` und `coverage.used`. Autoritativ prüft die Engine 70 bestätigte Kreuze des Zugspielers nach Minenauflösung. Andere aktive Personen behalten ihre Freigabe auch bei späterem Schaden. Angriffskosten ergeben sich aus der Summe der eigenen verbrauchten Freigaben. `airstrike-coverage-v1` wird bei Internet und Direkt beim Start geprüft. In einer verdeckten Projektion ist ungenutzte fremde Flächenbereitschaft verborgen. Die Kennung der einzelnen Freigabe bindet den Angriff an die Auswahl. Das äußere Spielschema bleibt 1, Direktprotokoll 2 bleibt gültig.

## Brett-Zoom und Spaltenbeschriftung

`BoardView` teilt die Spaltenbreite und Schriftmaße zwischen Zoom und Einpassen. Die Querformatberechnung erhält die Höhe beider Beschriftungszeilen aus der Zielbreite. Buchstaben, Punktzahlen und Felder verwenden gemeinsame Rasterspalten. Schusskarte und Aufstellungen haben ihre eigene Rastergeometrie.

## Sichtbare Minen- und Luftangriffseffekte

`playMineBlast` ermittelt die betroffenen Felder auf dem gerenderten Brett. Vor dem Einfügen der Effekte berücksichtigt der Scrollbefehl die Breite des Brettrahmens, das feste Ereignisbanner und die Oberkante der festen Würfelleiste. Bei gleichzeitigen Schüssen wird der Minentreffer zuletzt in den Ausschnitt geholt. Im Direktspiel rendert die vorhandene Zustandsrückmeldung die bestätigte Aktion einmal.

## Zeitentwurf in der PC-Diagnose

Die Aufnahme teilt einen DOM-Zustand über mehrere Bilder. Animierte Stile sowie Dokument- und Brettpositionen werden während des Durchlaufs separat abgetastet. Die Wiedergabe bildet den eingestellten Ablauf auf diese Zeitpunkte ab. Sie nutzt einen eigenen Frame ohne Spielscript. Standbilder und Markierungen beziehen sich auf die erfassten Ansichten. Die Aufnahme und der Zeitentwurf befinden sich im Arbeitsspeicher der Diagnose-Instanz.

## Auftragsfortschritt und archivierter Endstand

Auftragsübersicht und Detailkarten lesen einmal je Auftrag denselben Wert der Engine vom bestätigten eigenen Blatt. Die Wertung nutzt weiterhin die gespeicherten Vormerkungen und erfüllten Ansprüche. Der Pokal öffnet den bereits für den aktuellen Platz bereitgestellten archivierten Endstand.

## Versionshinweise und Offline-Update

`public/version.json` hält Kurzfassung und Details unter der jeweiligen Version. Der Service Worker meldet die Hinweise zur installierten oder angebotenen Version mit `OFFLINE_STATUS` aus ihrem vollständigen Offline-Cache. Im Browser ohne verfügbaren Worker-Status liest die App die Datei einmal beim Start der Update-Prüfung. Wenn ältere Worker allein die Version melden, bleibt das Update über den bestehenden Hinweis erreichbar.

## Zeitleiste in der Debug-Spielansicht

Nur der Debug-Frame importiert `animation-review.js`. Er beobachtet DOM-Zustände und sichtbare Bereiche in jedem abgetasteten Bild. Ein kurzzeitiger Beobachter am eigenen Frame-Prototyp erfasst tatsächliche `scrollIntoView`-Aufrufe. Bei einem Scrollereignis werden Ziel, Ausgangsposition und gemessener Versatz protokolliert. Toast-Mutationen halten auch Nachrichten fest, die von einer zweiten Meldung im selben Renderdurchgang ersetzt werden. Standbilder verwenden die tatsächlich gerenderten Knoten, Positionen und Animationsstile in einem Frame ohne Spielscript. Die Aufzeichnung lebt im Arbeitsspeicher der Debug-Szene. Beim Kopieren wird nur der gewählte Eintrag als Text ausgegeben.

Die Vorschau bindet die seitliche Zeitleiste im gleichursprünglichen Elterndokument ein. Der Spielframe behält seine Größe beim Wechsel zum Standbild. Markierungen verwenden pro Eintrag die sichtbaren Rechtecke des erfassten Moments und liegen als passive Ebene über dem Standbild. Die gemessene Geometrie bleibt im Speicher der Debug-Instanz.

Der Online-Einstieg `/diagnose` lädt Spiel-HTML und Module auch unter einem aktiven älteren Service Worker aus derselben aktuellen Version. Neue Module und Stylesheets liegen unter `/diagnose/assets/<version>/`. Spielframe und Standbild übernehmen diesen Pfad. Die Diagnose liest Darstellungseinstellungen und hält die Beispielpartien lokal im Arbeitsspeicher.

## Animierte Spielszenen 1.27.0

Die Vollansicht lädt den normalen Spielcontroller in einem Frame derselben Website. Der Diagnose-Dialog gibt die gewählte Szene vor. `animation-game.js` erzeugt feste Beispieldaten und berechnet die Übergänge mit der regulären Spielengine. Rendern, Ereignisbeobachter, Zielauswahl, Brettwechsel, Moduskarten, Toast und Ergebnisdialog laufen im Frame. Die Instanz übernimmt Darstellungseinstellungen und bleibt von Spielspeicher und Verbindungen getrennt. Die Rückkehr prüft Herkunft und konkreten Frame.

## Animationsvorschau 1.26.0

Das Modul animation-preview.js baut beim Abspielen einen eigenen Beispielsatz im Diagnose-Dialog auf. Minenmeldungen und Brettanimationen erhalten den Zielbereich der Vorschau. Das Hauptspiel übergibt seinen Anwendungsbereich an dieselben Renderer. Jede Wiederholung baut das Beispiel neu auf. Beim Schließen werden die Vorschau-Animationen und ihre Minenmeldung beendet. Die Beispiele laufen aus dem Offline-Cache und benötigen keine Raumdaten.

## Revanche, private Spielvarianten und Startseitenhinweise 1.25.0

Der bestätigte Wechsel in die Revanche schreibt im selben CAS-Commit bzw. bestätigten Direkt-Snapshot das vorige fertige Spiel als lastResult. Das Ergebnis verwendet die bereits ausgewerteten Punktefakten. Ein Raumzugang sieht es nur mit passender früherer Spieler-ID. Der autorisierte Raumindex liefert kompakte Endstände des aktuellen und des archivierten Spiels, soweit die Person jeweils teilgenommen hat. Die Autorität erfasst das Spielende einmal als optionales finishedAt. Die Glocke zeigt aus der bestehenden lokalen Historie bis zu 20 bestätigte Abschlüsse nach Ende- oder ursprünglicher Erfassungszeit. Eine aktuell im Raum verfügbare Spiel-ID öffnet die ausführliche Ansicht. Die Historie enthält die Platzierung und Punkte auch nach einer weiteren Revanche. Die Anzeigequittung erfasst den geöffneten Endstand auf diesem Gerät. Der separate Zugzähler nutzt denselben bestätigten Zugstatus wie die gespeicherten Raumkarten.

Die Schatzautorität führt je Person bis zu fünf bestätigte Proben. Die Projektion hat öffentliche Fund-/Kettenwertung und höchstens das Hinweisobjekt des authentifizierten Platzes. Schatzkoordinaten und ausstehende fremde Funde bleiben server- bzw. hostseitig. Die Minenvorbereitung nutzt denselben Teilnehmer, Wurf und dieselbe Spiel-ID/Revision wie die Flottenaufstellung. Die Engine prüft eigene Bestätigung und aktive Bereitschaft vor dem ersten Wurf. Im verdeckten Spiel bleiben bei eigenen Explosionen nur Schadensanzahlen der Gegner sichtbar. Von fremden Minen erhält ein Platz nur die tatsächlich eigenen entfernten Zellen. Kein eigenes Schadensregister in der Projektion.

## Aufgabenpool und lokale Darstellung · 1.24.0

OBJECTIVE_POOL definiert 40 Kombinationen aus vorhandenen Typen, Zielwert, ggf. Farbe und Frist. makeTasks zieht einmal autoritativ eine Familie pro Frist aus einer zufälligen Familienreihenfolge. Die ausgewählten drei vollständigen Definitionen bleiben im bisherigen objectives.tasks-Format gespeichert und projiziert. Kein Client-/Render-RNG und keine Rekonstruktion laufender Ziele.

view-state.completedFeaturePanels/FeatureCompletionNotice merken die einmalige Fertigmeldung lokal je Kontext/Partie/Person. Der Controller schließt vorhandene native Details, spätere manuelle Öffnung bleibt erhalten. Kein Spielzustandsfeld. game-info.resultComparison liefert nur nach Abschluss signierte Kategorien und ausgewählte-minus-eigene Differenzen; die reine HTML-Ansicht aktualisiert nur den Vergleich und lässt Brett/Personenzuordnung unverändert.

Das Hauptbrett erhält einen 20px-Rand für Zeilen 1–7 innerhalb derselben gemessenen Gesamtbreite. 16 CSS-Spuren = Nummernrand plus 15 Spielspalten, 15 Zwischenräume; BoardView zieht beide vor der Zellberechnung ab. Explizite Gridpositionen und ein zusätzlicher Spaltenversatz der Versenkungseffekte verhindern Zellverschiebungen. Schuss-/Aufstellkarten und Datenkoordinaten bleiben unverändert.


## Begrenzter eigener Suchverlauf · 1.23.2

noteBonusMove erweitert hunt optional um history:[own0,own1], je maximal fünf bestätigte Messungen. Alte readings werden erst beim nächsten Probe-Commit übernommen. Nach Vergabe aller Schätze bleiben reading/history eingefroren. validBonusState prüft alle Einträge, chronologische Reihenfolge und identische jüngste reading. treasureHuntView gibt defensive eigene history sowie aus bonusAwards abgeleitete open/earned/taken-Slots zurück; der Renderer liest keine geheimen Feldpositionen oder fremden Verläufe. Schema 1 und die bisherigen Netzwerkprojektionen bleiben erhalten, neue history-Backups benötigen Client 1.23.2. Keine neue Offline-Datei oder Hintergrundarbeit.

## Berichte und kompatible Suchmessungen · 1.23.1

view-state.mineInspectionChange trennt die bisherigen bezahlten Luftangriffe von kind:hidden, bevor Opfer gelesen werden. Automatische Minen ändern inspectPid nicht. hiddenMineReports leitet dauerhafte betroffene Personen/Entfernungszahlen aus hiddenMines.blasts ab; im verdeckten laufenden Spiel ausschließlich cells.length, keine Ziel-/Schadensindizes. Kein neuer Ereignisspeicher oder Ablauf-Timer.

noteBonusMove initialisiert fehlendes hunt ausschließlich in laufenden Zweier-Computerpartien bei einem bestätigten normalen/Extra-Zug mit chainBonus:false. Ursprüngliche Wertungsgrenze sechs bleibt unabhängig von Hinweisen erhalten; neue Kettenpartien bleiben neun. refreshTreasureClues setzt vorhandene verdiente Spuren. reading.focus speichert nur die nächsten tatsächlichen eigenen Suchfelder, nie Schatzpositionen; validBonusState akzeptiert den optionalen eindeutigen Teilbereich sowie alte Lesungen ohne focus. treasureHuntView liefert nur eigene Hinweise und passende chainReward. Netzwerkprojektionen bleiben ohne sämtliche hunt-Daten. Keine Laden-/Render-/Pass-Mutation.

Die beiden vorhandenen Feature-Grid-Breakpoints teilen nun dieselben Vollzeilen für offene Minen-/Bonus-/Schiffsdetails sowie Aufträge. Kurze Karten bleiben paarweise, Portrait einspaltig; Auftragsmetadaten verwenden umbrechendes Flexlayout. Keine Änderung an Hauptbrett/Schusskarte, Zoom, Aktionsrechten oder Spielwertungen.

## Schatzsuche 1.23.0

Der optionale bonus-fields-Zustand ergänzt in neuen Computerpartien hunt.schema=1, readings und clues mit je zwei Plätzen. noteBonusMove misst nach validiertem Commit vor Schaden die kleinste Manhattan-Distanz zu noch verfügbaren Feldern. settleBonusFields setzt die grobe Spaltenband-Spur nach der gemeinsamen Wertung; bonusPoints addiert beim dritten eigenen gewerteten Fund einmalig drei Punkte. Der Bonus wird aus unverlierbaren Claims abgeleitet.

UI und mittlere/schwere Planung lesen ausschließlich treasureHuntView mit eigenen historischen Suchfeldern, Temperatur, grobem Band und gewerteten Fundzahlen. Die Planung kombiniert Temperatur und Band nur beim letzten Schatz, weil sie vorher verschiedene Schätze meinen können. Keine zukünftigen Zufallswerte oder fremden Hinweise. Netzwerkprojektionen bleiben unverändert und enthalten weder hunt noch geheime Positionen. Legacy-/menschliche Bonusstände ohne hunt bleiben bei maximal sechs Punkten.

## Feste Hilfespalten und kompatible Benennung · 1.22.5

Alle Kartenköpfe verwenden dieselben letzten Grid-Spalten: eigene Punkte, 44-Pixel-Hilfe, 18-Pixel-Pfeilplatz mit 6-Pixel-Zwischenräumen. Auch ohne Pfeil bleibt dessen Spalte bestehen. Schatzsuche ersetzt nur sichtbare deutsche Texte der bisherigen Bonusfelder-Funktion; bonusFields, bonuses, bonus-fields-v1 und Aktions-/DOM-IDs bleiben identisch. Vorhandene Saves, Projektionen, Wertungsfakten, Gleichstände und Transportvalidierung werden weiter verwendet.

## Gemeinsamer SVG-Anker · 1.22.4

setupOptionIcon verwendet für battleship eine einzige lokale SVG-Geometrie für Flottenbestätigung, Spielpanel, Variantenkarte und Ergebnis. Der untere Bogen endet bei y22 innerhalb der 24×24-viewBox, statt bisher y26; auch die Kontur hat ausreichenden Abstand. Bestehende Größen und CSS bleiben unverändert. Kein Spielzustand, RNG, Scoring, Transport oder neuer Offline-Eintrag.

## Eigener Aufstell-Viewport und Bereitschaftsschritte · 1.22.3

PlacementView erweitert ShotMapView in der vorhandenen board-view.js-Datei. Die Basisbreite berücksichtigt die 15 Spielspalten, Zeilenlabelspalte, Grid-Abstände und die begrenzte Viewport-Höhe; bei 100 Prozent liegen alle 105 Felder im eigenen Scrollport. Zoom nutzt dieselben eigenen AbortController/Touch-/Wheel-Listener, separate Beschriftung und Regler. Die vertikale Pinch-Verankerung verändert scrollTop des Kartencontainers, nicht window.scrollY. Snapshots behalten beide inneren Scrollachsen über Neudarstellungen. Match, tatsächlicher Teilnehmer und Aufstellungsart bilden den Zustandsschlüssel; Hauptblatt und Schusskarte bleiben unabhängig.

preparationStep prüft zuerst unbestätigte eigene Schiffe, danach eigene Minen und zeigt erst anschließend Warten auf andere. Die globale gemeinsame Bereitschaft in der Engine bleibt maßgeblich für den ersten Wurf. Lokale Übergaben finden erst nach den nötigen eigenen Schritten statt. Die Darstellung erteilt keine neue Spielberechtigung: versteckte Minen bleiben ausschließlich gegen Computer, öffentliche Optionen und Server-/Direktvalidierung unverändert. Keine Punkte-, RNG-, Speicher- oder Transportänderung.


## Eigener Schusskarten-Viewport · 1.22.2

ShotMapView erweitert die vorhandene BoardView in derselben Offline-Datei. Es verwendet dieselben Touch-/Wheel-Listener mit eigenem AbortController, aber eine separate, an den Kartencontainer gebundene Basisbreite und eigene Anzeige/Regler. Der Hauptbrett-Zoom bleibt unabhängig; Match-/Viewer-Schlüssel begrenzen flüchtigen Zustand. Das native Öffnen löst die Breitenmessung aus; normale Neudarstellung bindet erneut und behält die gewählte Vergrößerung. Kein neuer Datensatz, Netzaufruf, Cache-Eintrag oder Timerpoll.

featureHeading ergänzt gemeinsame Regeln-Hilfen in nativen Summarys. Der Klick wird vor dem asynchronen Aktionshandler vom nativen Toggle getrennt; Regeln bleiben nach Merkmal gefiltert. Vollständige sinkende Schiffe liegen absolut in ihrer CSS-Grid-Fläche und bewegen nur den inneren SVG-Rumpf. Damit folgen Fläche und Silhouette Brett-/Kartenzoom und Größenwechsel, ohne Pixelgeometrie des Bildschirmfensters.


## Gemeinsame Vorbereitungsansicht · 1.22.1

placementSetupHTML und placementGridHTML in variant-ui.js liefern dieselbe Struktur für fleetSetupHTML und hiddenMineSetupHtml. Beide behalten ihre bestehenden Aktionskennungen und unabhängigen autoritativen Bestätigungen. Kein neues Modul oder Offline-Asset. Die Luftangriffsstatuszeile ist jetzt Teil des gemeinsamen zweizeiligen Kartenkopfs; Bewertung, Projektionen, Spielstände und Transport sind unverändert.


## Luftangriff und versteckte Minen · 1.22.0

Der historische mines-Pfad bleibt für den bezahlten Luftangriff kompatibel. damageAt ist die gemeinsame autoritative Routine für tatsächliche Entfernungen und Neuverteilung normaler Boni. damageEnabled/damageRounds verwenden entweder das bestehende game.mines-Register oder, nur ohne bezahlte Luftangriffe, variants.hiddenMines.rounds. Es gibt niemals zwei widersprechende Abschlussregister. mineBlasts bleibt ausdrücklich die bezahlte Historie; damageBlasts vereinigt sie ausschließlich für Schadensanzeige und Ereignisbeobachtung.

Die private hiddenMines-Option wird nur von enableComputerVariants akzeptiert. Öffentliche VARIANT_KEYS und normalizeVariantOptions bleiben auf die vier genehmigten Varianten begrenzt. Positionen, Bereitschaft und Verbrauch sind je Besitzer gespeichert; bestätigte Ereignisse haben dauerhafte IDs hidden:owner:slot. applyHiddenMineAction ist nur vor dem ersten Wurf für die menschliche Computerrolle zulässig. variantsReady verlangt beide vorbereitenden Bestätigungen einschließlich optionaler Flotten.

applyMove erfasst zuerst reguläre Funde, Schüsse und vorgemerkte Aufträge, erhöht den normalen Aktionszähler und prüft danach alle neu bestätigten Normal-/Zusatzfelder auf gegnerische Minen. Alle getroffenen Minen werden vor der ersten Explosion vorgemerkt. Jede löst einmal dieselbe Schadensroutine aus; ein durch den ersten Einschlag bereits leeres zweites Zentrum verbraucht keinen Schadenszufall. Erst anschließend folgt gegebenenfalls finishRound. Keine Zusatzgebühr, Kettenreaktion oder zusätzliche Runde. Planung liest keine fremden Minenpositionen; Zufall gehört ausschließlich zur tatsächlichen Platzierung/Bestätigung des Schadens.

projectVariants maskiert jede ungezündete fremde Mine, entfernt Abschlussregister und filtert verdeckte fremde Schadenslisten vor Zellzugriffen. Vollständige und projizierte Stände werden strikt getrennt validiert. Die neue Regel ist lokal/computer-only; kein Netzwerk-Optionsflag, DB-Feld, Push oder zusätzlicher Hintergrundabruf. Cell-relative SVGs unterscheiden Bodenblitz/Splitter von Flugzeug/Abwurf; mineEffect vereinigt Doppelereignisse ohne doppelte Kreuze. Bestehende drei Sekunden, Reduced Motion und Ergebnisaufschub bleiben erhalten.


## Minenoberfläche 1.21.2

Die Engine und das Minenschema bleiben unverändert. mineTargetHtml rendert die sichere mineTargetView mit Zeilen-/Spaltenlabels, Zielkreuz und möglichen Nachbarn. Markierte Gegnerzellen bleiben im verdeckten oder gemeinsamen Gruppenraster unsichtbar. Das neue Layout setzt Raster und Koordinaten zuerst; Details sind eingeklappt. selectMineTarget erhält Fokus, waagrechte Position und geöffnete Regeln. Solange busy/direct.pending gilt, werden Zieländerungen gesperrt und die Bestätigung zeigt Wird bestätigt …; derselbe autorisierte Request bleibt maßgeblich.

playMineBlast filtert zunächst auf zulässige sichtbare Opfer und verwendet ausschließlich deren aktuelle, bestätigte blast.cells. Lokale SVG-Ringe und verschwindende Kreuze sind Kinder der tatsächlichen Zellen; kein geometrisch geratenes Schadensfeld. Ein kleiner Hinweis oben ersetzt die Bildschirmmittenexplosion. Ein Timer entfernt Hinweis/Dekorationen nach 3000 ms; derselbe bestehende Computer-/Ergebnisaufschub bleibt. Reduzierte Bewegung erzeugt keine Zellanimation. mineControlsHtml zeigt den eigenen letzten Angriff aus dem bestehenden Ledger, verdeckt ohne fremde Schadensauswertung. Kein neues Asset, Speicher-/APIformat, Timer für Netzabrufe oder Push.


## Gruppierte Mischung 1.21.1

`shuffleFreeColors` ermittelt je aktivem Blatt waagrecht/senkrecht zusammenhängende **freie** Farbgruppen; markierte Felder sind Barrieren. Höchstens 180 Versuche tauschen ganze gleich große Gruppen verschiedener Farben. Dadurch bleiben freie Farbbudgets exakt und vorhandene spielbare Gruppen zusammenhängend. Kleine Gruppen dürfen verschmelzen, sofern keine neue freie Region größer als sechs entsteht; größere Altregionen bleiben ungeteilt erhalten. Der gespeicherte Kandidat bevorzugt mehr Felder in Gruppen ab drei, dann weniger Einzelne, dann mehr tatsächliche Farbwechsel. Einzelne Lücken und fehlende Tauschpartner sind zulässige begrenzte Fälle.

Nur die gemeinsame Autorität mischt am bisherigen Rundenabschluss. Projizierte Gaststände erzeugen keinen Zufall. Bestehende layouts/mixing-Felder, Farbwertung, API-/Direktformat und Variantenfähigkeit bleiben erhalten; keine neue Cachedatei. Unabhängige Geometrie-, Farbanzahl-, Punkte- und Wiederaufnahmetests in tests/color-mixing.test.mjs.


## Menschliche Varianten · 1.21.0

variantsEnabled/enableVariants generalisieren discovery, objectives und mixing auf die vorhandenen Modi mit 2–6 Personen; Battleship validiert exakt zwei. createGame nimmt options.variants entgegen, die Computerfabrik behält ihre bekannte Zweierrolle. Bestehende Schema-1-Stände ohne Varianten und bestehende Computerstände bleiben gültig. Alle Farbzugriffe verwenden boardFor(game,pid). Flotten werden nur zu Spielbeginn erzeugt, Zufall nur bei autoritativen Aktionen/Rundenabschluss.

Raum-/Direktlobbys speichern optionale variants-Flags im bereits vorhandenen JSON. variants-v1 muss für alle Teilnehmer wirklich registriert sein. Internet-Registrierung erneuert nur der eigene authentifizierte Abruf; Direktgeräte werben im authentifizierten hello. fleet mit kind place/random/ready bindet den Actor an sein Token beziehungsweise seinen Direktplatz sowie Spiel, Runde und Revision. Beide Bestätigungen sperren unabhängige Flotten vor dem ersten Wurf. Room-CAS weist Konflikte zurück; der Direktkanal dedupliziert gespeicherte Action-IDs und akzeptiert unabhängige gültige Aktionen derselben Runde.

projectVariants liefert markierte Projektionen mit viewer. Gegnerische fleets sind bis zum Ende null, auch im offenen Spiel; Zielrenderer lesen nur bestätigte eigene Schüsse/Wracks. Im verdeckten Spiel sind fremde layouts null, fremde mixing.changed leer, fremde pending-Aufträge null und alle gegnerischen Schüsse einschließlich Treffern und Wracks entfernt. Fremde shots/sunk/revealed verwenden die bisherigen Arrayformen mit neutralen Einträgen; fremde lastVolley ist null. Auch eingehende Treffer auf der eigenen Flotte bleiben bis Spielende verborgen. Fertige Spiele decken auf. validVariantState trennt vollständige Autorität und geprüfte Projektion; Gaststände müssen zur eigenen viewer-ID gehören, projizierte Stände können keine Engine-/Flottenaktionen bestätigen. Ursprünglicher Direkthost bleibt die vertraute Autorität mit vollständigem Stand, Gäste erhalten nur ihre Projektion. Keine kryptographische Abschottung vom Spielleiter behaupten.


## Ergebnispräsentation 1.20.6

ResultNotice in view-state.js merkt die tatsächlich gezeigte Endmeldung je Spiel-ID und Kontext. app.js öffnet erst auf sichtbarer Spielseite, nach letzten Effekten und ohne einen anderen Dialog zu verdrängen. Verspätete Timer prüfen Kontext/Identität erneut; Blattwechsel und Polls öffnen nach dem Schließen nicht erneut. Der gemeinsame scoreBreakdownHTML-Renderer liest ausschließlich engine.score; keine zusätzliche Punkteberechnung. Fristen sind inklusive deadline − round + 1, während die Autorität unverändert über Erfolg entscheidet.


## Skalierende Treffermarkierungen 1.20.5

`cellVariantHTML` rendert den vorhandenen bestätigten eigenen Schiffstreffer als dekoratives Inline-SVG. Die Zellbeschriftung benennt den Treffer weiterhin. CSS nutzt die bereits von `BoardView.applyWidth` gesetzte Variable `--board-cell` für Schiffsabstand und Rahmen; das SVG liegt proportional innerhalb dieses Rahmens. Kein neuer Zoomzustand, Listener, Transport, Engineeingriff oder Asset-Abruf.


## Responsive Schiffskarte 1.20.4

`battlePanelHTML` gruppiert die vorhandenen Karteninhalte in `.battle-details`. Ausschließlich das Layout ändert sich: native Details behalten ihre Toggle-Semantik; niedrige Landschaftsfenster verwenden eine kompakte vollständige Kartenzeile mit Metadaten links und 15-spaltigem Raster rechts. Koordinaten, Rollen, gespeicherte Zustände, Animationselemente und Engine-Commits bleiben unverändert.


## Lokale Wiederaufnahme 1.20.3

Die gemeinsame Aktion `continue` schließt den aktiven Dialog nach der bestehenden Zustandswahl und vor dem Rendern. Lokale Übergabe und menschlicher Computerindex bleiben erhalten. Der bestehende Dialog-close-Listener und Renderpfad koordinieren weiter den Computer-Timer. Kein Transport-, Speicher-, Engine- oder Punkteformat geändert. Die Schiffskarte rendert den Ring ausschließlich für bestätigten Schusszustand 1.


## Farbwahl und Statuskarten 1.20.2

`view-state.selectMoveColor` vervollständigt nur den lokalen Auswahlentwurf. Bei der Farbwahl bleibt ein gültiger gewählter Farbindex erhalten; andernfalls wird der erste Index aus `availableDice(game,pid)` verwendet. Damit stimmen Oberflächenprüfung und die unveränderte Engine überein. Keine andere Berechtigung, Würfelentfernung, Ladung oder Jokerregel wird umgangen.

`gameHTML` gruppiert existierende Minen-/Bonusrenderer sowie `battlePanelHTML`, `discoveryPanelHTML`, `objectivesHTML` und `mixingPanelHTML` einmalig vor dem Spielfeld in `.game-features`. Schiffe/Aufträge sind native Details mit nur lokalem geöffnet/geschlossen-UI-Zustand. Zwei Spalten ab 681 Pixeln nur bei Computer-Varianten, sonst eine Spalte; Inhalt wächst beim Aufklappen in normalem Fluss. Animationen verwenden weiter die bestätigten gespeicherten Schüsse und die tatsächliche Zielkarte.


## Gemeinsame Auswahlkarten 1.20.1

`variant-ui.js` exportiert `setupOptionHTML` und `setupOptionIcon`, wiederverwendet von `app.js`, `mine-ui.js` und `bonus-ui.js`. Ein echtes Checkbox-Input bleibt innerhalb des Labels; `aria-labelledby` und `aria-describedby` verweisen auf Titel/Beschreibung. Das zusätzliche Häkchen und die SVG-Symbole sind dekorativ. Spezifische Dialogselektoren schützen das Dreispaltenraster vor den allgemeinen Formularregeln. Keine Engine-/Speicher-/API-Änderung und keine weitere Cachedatei.


## Computer-Varianten 1.20.0

`variants.js` hält optionale schema-1-Fakten für zwei Computerteilnehmer: private Flotten, getrennte bestätigte Schüsse, exklusive Entdeckerfunde/Ladungen, vorgemerkte und gewertete Aufträge sowie individuelle gespeicherte Farbpläne. `variant-ui.js` rendert die Einrichtung, öffentliche Funde, Fähigkeitswahl, Fristen und die ausschließlich aus bestätigten Schüssen aufgebaute Zielkarte. Nur die eigene Flotte ist vor Spielende sichtbar; offene Gegnerblätter geben keine Flotte preis.

Die Engine prüft Fähigkeit und Zusatzfeld vor jeder Mutation, bestätigt normale und zusätzliche Felder atomar, verbraucht eine Ladung, speichert Erfolge und wertet nach beiden Zügen. Minenschaden ändert diese dauerhaften Fakten nicht. Nach Wertung und Spielendeprüfung mischt `shuffleFreeColors` nur freie Farben nach Runde 5/10/15. `boardFor(game,pid)` löst den individuellen Plan für UI, Validierung, Hinweise, Computer, Minenziel und Farbwertung auf. RNG wird nur beim tatsächlichen Start/Mischen verwendet, nicht in Suchsimulationen. Die schwere Varianten-KI liest eigene Lage und öffentliche Ziele/Schüsse; am Mischrand entfällt die unbekannte Zukunft. [Regeln](computer-variants.md).


## Menüreihenfolge 1.19.4

Im Menü Zusammen steht Internet – Spielraum zuerst, danach Offline – mehrere Handys und Ein Handy weitergeben. Die drei bestehenden Ziele, Beschriftungen und Abläufe bleiben erhalten. Reine DOM-Reihenfolge; keine zusätzliche Anfrage, Spiel-/Push- oder Speicheränderung.


## Lokales Verwerfen und Beitritt

DirectUi.joinEntry führt Name/QR zuerst und trennt native Details für Kopplungscode und Hilfe. discard-direct-local öffnet die vorhandene gerätelokale Löschlogik mit ausdrücklicher Bestätigung, unabhängig von DirectSession.ready. Die Bestätigung bindet Generation, Sitzung und Spiel; bei Wechsel wird neu bestätigt. DirectSession.forget speichert null vor dem Schließen/Löschen der Sitzung, Fehler lassen Zugang und Spielstand erhalten. Keine leave-/abort-Nachricht, Engine-Wertung, Hostübernahme oder Statistik wird für lokale Entfernung erfunden.


## Direktwurf-Vorschau

directRollPreviewHTML liest ausschließlich g.dice aus dem bereits autoritativ synchronisierten Zustand. DirectGame verteilt den bestätigten roll-Zustand schon vor der ersten move-Aktion an alle authentifizierten Gäste. Die bisherige Darstellung blendete wartende Würfel aus. Die neue Vorschau verwendet statische, zugänglich beschriftete Elemente vor der Punktezeile; sie verändert keine Engine, Revision, Nachricht, eigenen Entwurf oder versteckten Daten.


## Renderer 1.19.1

savedGameMetaHTML fasst den vorhandenen Modus und bereits bekannte Raum-/Spielinformationen in einer Metazeile zusammen. roomResumeHTML, directResumeHTML und localResumeHTML verwenden dieselbe kompakte Oberfläche. Geändert werden nur DOM/CSS und sichtbare Kurzbeschriftungen; Index, Berechtigungen, Namenscache, Sortierung und Zehnerseiten bleiben unverändert.


## Übersichtsmodell 1.19.0

savedGameItems verbindet vorhandene Raumzugänge mit lokalem und direktem Spielstand ausschließlich zur Darstellung. savedGamesPreview sortiert bekannte eigene Spielgelegenheiten vor zuletzt geöffnete Räume und begrenzt auf drei. filterSavedGames filtert/sucht denselben Index lokal und liefert maximal zehn Einträge pro Seite. Der bestehende tokengeprüfte Sammelabruf ergänzt participants mit name und host; keine IDs, Tokens, Blätter oder verdeckten Werte. RoomBook übernimmt optional höchstens sechs Namen à 24 Zeichen und verwirft Teilnehmerlisten bei fehlendem/verweigertem Zugang. Kein neuer Timer, keine Migration.


## Direktnamen 1.18.0

Optionale Snapshot-Felder roomName und roomNameRevision sind additive Sitzungsmetadaten. Namen werden auf 48 Zeichen begrenzt und Leerraum normalisiert. Der Host ändert sie unabhängig von snapshot.version und dem Enginezustand; vorhandene State-Nachrichten verteilen die Änderung. Gäste behalten neuere Namensrevisionen bei verspätetem älteren Text, ohne eine gültige Zugbestätigung zu verlieren. QR-Angebote tragen dieselben optionalen Felder. Keine neue Verbindung, HTTP-Abfrage, Migration oder Push-Art.

## Direkt-Wiederkopplung 1.17.4

Die bestehende lokale WebRTC-Sternverbindung und Hostautorität bleiben erhalten. ICE-Abschluss bleibt bevorzugt; nach maximal 20 Sekunden darf ein fest kopierter SDP-Stand mit lokalen UDP-Hostkandidaten die QR-Erstellung freigeben. Keine Adressen gelangen in Diagnosen. Keine Änderung an Spiel-/Backupschema 1, Direktprotokoll 2, Datenbank, Fähigkeiten oder den 40 Offline-Dateien. Verbindungszeitlimit erst nach Antwortübernahme auf dem Host.

## Farbabschlussanzeige

Farbabschlüsse bleiben mit Spielername und Farbe während der gesamten Partie sichtbar, auch nach weiteren Würfen, Blattwechsel und Wiederaufnahme. Die Anzeige liest alle gespeicherten bestätigten Abschlüsse ohne Rundengrenze. Minen entfernen verlorene Abschlüsse und aktualisieren übertragene Farbprämien bereits in der gemeinsamen Engine; die Karten übernehmen diesen aktuellen Stand. Im verdeckten Spiel bleiben Prämienwerte und fremde Blätter verborgen. Kein zusätzlicher Timer, Push, Datenabruf oder neues Speicherformat.

## Gemeinsame UI-Bausteine

`style.css` definiert gemeinsame `--status-*`-Tokens für Flächen, Konturen, kleine Symbolfelder und semantische Akzente. Minen, Bonusfelder, Farbabschluss, Punkte und Ergebnis bleiben dadurch über alle sechs Designs konsistent. Die Brettfarben und der dunkle aktuelle Spieler bleiben funktional unterscheidbar. `game-info.js` formatiert Farbabschluss-Grammatik nach der vorhandenen Verdeckungsprojektion; `bonus-ui.js` rendert kompakte Prämien und nativen Details-Verlauf aus ausschließlich gewerteten Bonusereignissen. Kein neuer Spielzustand, Transport, Timer oder Push-Ereignistyp. [UI-Vertrag](ui-design.md).

## Neu 1.17.0: Bonusfelder, Random und gemeinsame Minen

Drei geheime **Bonusfelder** vergeben je +2 an alle ersten Finder desselben Wurfs; Bekanntgabe erst nach der gemeinsamen Wertung, Punkte bleiben trotz Minen erhalten. **Random** erzeugt bei jedem neuen Start ein gemeinsames, gespeichert fortsetzbares Brett. Die optionale **Mine** trifft ein gewähltes Zielfeld bei allen aktiven Gegnern, einmal pro Person für insgesamt fünf Punkte. Die Explosion dauert drei Sekunden; Schadensmarkierungen bleiben bis Ende des nächsten Wurfs. Leere Ziele verursachen beim jeweiligen Gegner keinerlei Schaden.

**Partie verlassen** gibt sofort einen einmaligen Verlaufseintrag mit −10 Punkten und Niederlage. Die anderen spielen weiter; die letzte aktive Person gewinnt sofort. Im Internet wandert die Gastgeberrolle weiter. Offline bleibt das ursprüngliche Gastgeber-Handy als Zuschauer und Verbindung geöffnet; Verbindungsverlust pausiert sicher, ohne neue Autorität zu erfinden. Alle beteiligten Apps für neue Regeln auf 1.17.0 aktualisieren. [Bonusfelder](bonus-fields.md) · [Minen](mines.md) · [Random](random-board.md) · [Aussteigen](leaving.md).


## Offline-Testprotokoll

Das freiwillige lokale A/B-Testprotokoll unterstützt Kopplungs- und Abgleichstests. [Anleitung](offline-diagnostics.md).

## Revanche-Ereignis 1.15.0

Nur der bestätigte Host-Rematch hinterlegt die alte Spielkennung in der Lobby. Der folgende Start übernimmt `rematchOf` und `rematchBy` in die neue Partie. Die gemeinsame Policy erzeugt für wartende andere Mitglieder `gameId:rematch`; eigene Züge haben Vorrang. Neue Worker melden `rematch-push-v1` authentifiziert in Registrierung/Präsenz, D1 merkt nur das boolesche `rematch_ready` (Migration 0009). Alte Geräte erhalten keine unbekannte Art. Aufgeschobene Startaufträge benutzen dieselbe Outbox und Wartung; konkrete Eventprüfung akzeptiert sie nur bis zur ersten eigenen Auswahl in Wurf 1. Ein bereits angenommener erster Zug macht den Startauftrag überflüssig. Keine freie Nachrichten-API, Timer, neue Secrets oder Backend-Lesezugriffe auf Nutzerblätter.

## Zustellverlauf und Wiederherstellung ab 1.14.0

**Push-Status prüfen** lädt zusätzlich die letzten höchstens zwanzig Versände dieses Geräts. Sie zeigen Ereignisart, Zeit, Versuchszahl und Provider-/Browserstatus; nach einem registrierten Antippen außerdem den Klick. Die Daten enthalten keine Namen, Punkte, Abonnements oder Geheimnisse. Eine Browserquittung bestätigt weiterhin kein menschliches Lesen oder eine sichtbare Sperrbildschirmdarstellung.

Neue automatische Hinweise werden vor der Antwort an die spielende Person als eigener Auftrag gespeichert. Bis zu drei kurze Versuche laufen nach dem gespeicherten Spielzug; insgesamt höchstens vier. Erneut versucht werden nur Netzwerk-/Zeitfehler, HTTP 429/5xx oder ausdrücklich quittierte Prüf-/Anzeigefehler vor einer Anzeige. Retry-After wird eingehalten. Eine Providerannahme ohne Browserquittung führt nicht zum erneuten Versand. Vor jedem Versuch gewinnen ein überholter Zug, entfernter Zugang, abgeschaltete Hinweise, ersetztes Abonnement oder Ablauf. Testmeldungen behalten ihren einmaligen Versand und ihre Minute Frist.

Der feste Wartungsaufruf **POST /api/notifications/maintenance** mit leerem JSON-Objekt kann ausschließlich solche gespeicherten Aufträge wiederaufnehmen; keine Ziele oder Inhalte lassen sich angeben. Eine globale Minuten-Lease und höchstens zwölf Aufträge pro Lauf begrenzen ihn. Der eingerichtete stündliche Check ist eine langsame Rückfallebene für abgebrochene oder länger aufgeschobene Versuche, keine Zusage sekundengenauer Zustellung. Auch normale neue Spielaktionen nehmen fällige Arbeit auf. Die PWA erhält keine Hintergrund-Abfrageschleife. GET derselben Route zeigt nur Bereitschaft und Zeitpunkt des letzten Wartungslaufs. Ob die Aufgabe tatsächlich eingerichtet ist, steht im Deployment.

Der Service Worker darf die aktuelle Gelegenheit zweimal mit jeweils fünf Sekunden Frist prüfen, nur innerhalb des einzelnen Push-Ereignisses. Er zeigt bei nicht verifizierbarem Zustand keinen alten Hinweis. Eine Anzeige-Reservierung verhindert konkurrierende Anzeigen; erst erfolgreicher showNotification-Aufruf setzt „verarbeitet“ und das Minutenlimit. Ablehnung gibt die Reservierung frei. Beim Neustart wird eine vorhandene Meldung desselben Ereignisses erkannt. Eine während der Prüfung sichtbare App bleibt still.

Migration 0008 ergänzt notification_dispatches mit Geräte-/Raum-Cascade, Versuchszähler, Leasing und bereinigter Diagnose. Nicht mehr wartende Einträge werden auf zwanzig pro Gerät und sieben Tage begrenzt. Wartende Hinweise bleiben nur innerhalb ihrer 24-Stunden-Frist versendbar. Bestehende Geräte, Schlüssel, Backups und Spielregeln bleiben verwendbar; neue Worker-Funktionen benötigen das normale PWA-Update.



## Computer-Spielkopf ab 1.13.1

`gameHTML` gruppiert Zurück und Computerüberschrift in `computer-heading-row`. Im Handy-Hochformat belegt diese Gruppe eine eigene Rasterzeile, die drei Steuerungen eine weitere; der fertige Zustand nutzt zwei Spalten. Außerhalb davon ist die Gruppe mit `display: contents` transparent. Der Titeltext liegt in einem eigenen Span mit wortweisem Umbruch, das vorhandene Einstellungssymbol bleibt separat. Keine Änderung an Spielzustand, Transport oder Hintergrundarbeit.

## Computer-Stärken ab 1.13.0

`computer.js` kapselt drei Strategien bei unveränderter gemeinsamer Regelengine. Leicht ruft das bisherige findMove auf. Mittel enumeriert verbundene Gruppen und bewertet Bonusfortschritt, Anschlussmöglichkeiten und knappe Joker. Schwer betrachtet bis zu acht Kandidaten plus Passen, die Wahrscheinlichkeiten künftiger Zwei-/Dreierwürfel und bei offenen Punkten eine gegnerische Antwort einschließlich Endwertung. Keine tatsächlichen zukünftigen Würfe oder RNG-Aufrufe beim Entscheiden. Bei verdeckten Punkten wird die fremde Analyseposition vollständig neutralisiert. `computerDifficulty` ergänzt den Schema-1-Spielstand optional; fehlend bedeutet Leicht. Die Gerätepräferenz betrifft neue Partien. Stärkewechsel ersetzt nur dieses Metadatum, ohne Würfel-/Zug-/Draftänderung. Alle Module sind bereits Teil des 36-Dateien-Caches. Details: [computer.md](computer.md).

## JSON-Exportnamen ab 1.12.5

`exportData()` erzeugt den bestehenden Schema-1-Backupinhalt und den Dateinamen aus demselben erfassten Zeitpunkt. Der Name verwendet das lokale Kalenderdatum des Geräts als `YYYYMMDD_`, gefolgt von `Farbfeld` und dem Inhaltstyp: `YYYYMMDD_Farbfeld_Spielstand.json`. `exportedAt` bleibt ein ISO-Zeitpunkt. Import prüft den Inhalt, keinen bestimmten Dateinamen; alte Sicherungen bleiben kompatibel. Diese Benennung gilt auch für künftige JSON-Downloads. Keine neue Datei, Speicherung, Abhängigkeit oder API.

## Komponenten und Zuständigkeiten

```mermaid
flowchart TD
  UI["PWA: app.js / Ansichten"] --> Rules["Deterministische Engine / Bretter"]
  UI --> SW["Service Worker / Offline-Dateien / Hinweise"]
  UI --> API["Spielraum- und Kopplungs-API"]
  API --> DB["D1: Räume, Kopplungen, Reaktionen, Push-Geräte"]
  API --> Push["Browser-Push-Dienst"]
  Push --> SW
  UI --> RTC["WebRTC zum Gastgeber"]
  RTC --> Rules
```

`public/play.html` lädt den statischen ESM-Client. `app.js` verbindet Oberfläche und Abläufe, `view-state.js` trennt Spielerrolle und betrachtetes Blatt, `board-view.js` verwaltet Einpassen und Pinch-Zoom. `boards.js` enthält unveränderliche Brettdefinitionen; `engine.js` prüft Züge und wertet deterministisch. `computer.js` nutzt dieselbe Engine. `themes.js` enthält sechs unveränderliche gerätelokale Designs mit Namen, Symbol und Hauptüberschrift. Die ausschließlich lokal definierten Überschriftentexte markieren den Akzent mit `<em>`; dunkler Grundtext und Design-Akzent bleiben getrennt. Einstellungen zeigen kompakte Kacheln in zwei Spalten und drei Reihen; Beschreibungen bleiben als zugängliche Namen/Tooltips. Derselbe Symbolgeber liefert Spielfeldmarkierungen. Das Hunde-Design verwendet für Kachel und Markierung die lokale `paw.svg` (eine braune Pfote mit dunklem Rand); die Hero-Dekoration referenziert dieselbe Datei statt eines plattformabhängigen Emojis. Keine Theme-Metadaten im gemeinsamen Spielzustand. Die Kopfzeile und Ladeansicht verwenden stets das bereits offline gecachte `/icon.svg` als Farbfeld-Logo. Das Theme verändert weder Motiv noch Farben oder Umrandung dieses Markenzeichens.

`reactions-extra-v1` ergänzt das bestehende Emoji-Protokoll nur als Fähigkeit: 👍/😲 benötigen aktualisierte Empfänger und beim Direktspiel einen aktualisierten Gastgeber. Alte Reaktionen/gespeicherte Effekte und Direktprotokoll 2 bleiben gültig. Der Notification-Worker darf neue ersetzende Hinweise nur mit ausdrücklicher Tonwahl erneut hörbar ankündigen; alle übrigen Limits gelten davor.

Die Startseite rendert Fortsetzen-Karten in dieser Reihenfolge vor dem Hero: gespeicherte Internet-Räume, laufender lokaler Spielstand (Solo/Computer/Ein-Handy), gespeicherte Direktverbindung einschließlich Kopplung. Es werden dieselben Zustände und Aktionen verwendet; reine DOM-Reihenfolge ohne zusätzliche Netzwerkzugriffe.

## Spielzustand und Transporte

| Modus | Verbindlicher Zustand | Übertragung |
| --- | --- | --- |
| Solo, Computer, ein Handy | lokaler Client | keine |
| Internet-Spielraum | D1-Raum mit Versionsnummer | HTTP-Aktionen und Polling |
| Direktspiel | ursprüngliches Gastgeber-Handy | zuverlässige, geordnete WebRTC-Kanäle in Sternform |

Internetaktionen prüfen Spielerzugang, Rolle, Spielregeln und erwartete Raumversion. Das abschließende D1-Update ist ein Compare-and-swap. Direktaktionen tragen Protokoll, Sitzung, Aktions-ID, Spiel und Runde; der Gastgeber autorisiert den festen Kanalplatz und speichert Deduplizierungsdaten. Passive Personen dürfen im selben Wurf unabhängig bestätigen. Gespeicherte Direktstände erlauben nach nötiger erneuter Kopplung die Fortsetzung; eine alte Gastkopie überschreibt keinen neueren Gastgeberstand.

Der optionale Raumname ist Metadatum im D1-Raum-JSON, kein Bestandteil der Engine. Erstellung und `rename` normalisieren Leerraum und begrenzen auf 48 Zeichen. Nur der Gastgeber darf umbenennen oder in der Lobby über `remove` ein Mitglied entfernen; der Gastgeber selbst und laufende Spielergruppen bleiben erhalten. Entfernte Tokens autorisieren keine weiteren API-Aufrufe. Raumansichten enthalten außerdem `boardUpdateNeeded`, damit der Client veraltete Brettfähigkeiten zuordnen kann. Alle Änderungen verwenden denselben Versions-/CAS-Schutz; Code und persönliche Zugänge der übrigen Mitglieder bleiben unverändert. Eine Metadatenänderung erzeugt weder Würfel noch Push.

Ab 1.8.2 erneuert ein authentifizierter `GET /api/rooms` die explizit per `X-Farbfeld-Features` gemeldeten Fähigkeiten des aufrufenden Mitglieds. Die einmalige `hello`-Registrierung bleibt kompatibel, ist aber keine Voraussetzung für die Freigabe alter Räume. Ein fehlender Header überschreibt keine gespeicherte Registrierung; unbekannte Fähigkeiten werden ignoriert. Nur eine tatsächliche Änderung erhöht die Raumversion. Drei begrenzte CAS-Versuche lesen bei Konflikten den aktuellen Stand und die Mitgliedschaft erneut. Parallele Züge/Namen werden nicht überschrieben, entfernte Gäste nicht wieder eingesetzt. Laufende Varianten prüfen weiterhin die tatsächlichen Fähigkeiten des Clients.

`farbfeld.rooms.v1` enthält die gespeicherten Raumzugänge und begrenzte Zusammenfassungen. `farbfeld.room.v1` bleibt als kompatibler Zeiger auf den ausgewählten Raum erhalten. Beide übernehmen optional den zuletzt bestätigten Namen für die Wiederaufnahmekarte. Der Client übernimmt Namen aus autorisierten API-Antworten und gibt sie ausschließlich als escapten Text aus. Eine Umbenennung löscht keine unbestätigte Auswahl. Andere Spielarten und gespeicherte Engineformate bleiben unverändert.

QR-Daten enthalten vollständige Angebote/Antworten mit lokalen ICE-Kandidaten. Keine externen STUN-/TURN-Server. Optional vermittelt `/api/direct-pairing` einmalig per kurzlebigem Raumcode. Danach braucht der Direktmodus keine Signalisierung oder Internetverbindung. Browser/Hotspot-Isolation kann die lokale Verbindung verhindern.

## Speicherung

| Speicher | Zweck | Zugriff |
| --- | --- | --- |
| `farbfeld.stats.v1` | kompakter abgeschlossener Ergebnisverlauf / Profil, Schema 1 | dieses Gerät, im lokalen Export |
| `farbfeld.game.v1` | lokale Partie, Schema 1 | dieses Gerät |
| `farbfeld.rooms.v1` | mehrere persönliche Raumzugänge und begrenzte Zusammenfassungen | dieses Gerät, nicht im Export |
| `farbfeld.room.v1` | ausgewählter Raum und kompatibler einzelner Zugang | dieses Gerät, nicht im Export |
| `farbfeld.direct.v1` | Direktstand und persönliche Kopplungsdaten | dieses Gerät, nicht im Export |
| `farbfeld.reactions.seen.v1` | begrenzte Anzeigecursor für Raumreaktionen | dieses Gerät, außerhalb der Spielbackups |
| `farbfeld.prefs.v1`, `farbfeld.history.v1` | Design/Optionen, kompakte Ergebnisse mit optionaler Endezeit | dieses Gerät, lokaler Export |
| Offline-Cache `farbfeld-v<Version>` | 101 statische Dateien | atomarer Service-Worker-Cache |
| IndexedDB `farbfeld.notifications.v1` | Opt-in, Gerätegeheimnis, Deduplizierung | Notification-Worker, nicht im Export |
| D1 `room_presence` | gedrosselte Rückmeldungen je Raum/Mitglied, getrennt von Zugversionen | authentifizierter Raumzugang |
| D1 `rooms` | Raumzustand, Version, letzte Nutzung und Bereinigungstermin | autorisierte Spieler-API |
| D1 `direct_pairings` | kurzlebige Kopplungsangebote/-antworten | getrennte Host-/Gastzugänge |
| D1 `room_reactions` | Emoji-Ereignisse, höchstens 24 Stunden verfügbar | authentifizierter Sender / erlaubte Empfänger |
| D1 `notification_devices` | Abonnement, primäre Zuordnung, Präsenz, Versandgrenzen und letzte begrenzte Diagnose | gehashter Gerätezugang plus Raumtoken beim Binden |
| D1 `notification_room_bindings` | mehrere bestätigte persönliche Raumzuordnungen und Ereigniscursor | eigener Gerätezugang plus jeweiliges Raumtoken |
| D1 `room_maintenance` | global begrenzte Bereinigungs-Lease | ausschließlich serverintern |

## Benachrichtigungen als Nebenwirkung

`notification-policy.js` definiert ausschließlich eigene Spielgelegenheit und Spielende. Würfeln und die folgende Auswahl sind ein Ereignis. `lib/notifications.js` prüft nach einem erfolgreichen Raum-Commit Abonnement, Vordergrund-Lease, Ereignis und Minutenlimit, prüft den aktuellen Raum erneut und erzeugt verschlüsselte, VAPID-signierte Push-Nachrichten. `waitUntil` hält die Zustellung außerhalb der Antwort auf den Spielzug. Netzwerkfehler ändern keine Spielstände. Ab 1.9.8 wartet der Push-Dienst bei fehlender Geräteverbindung bis zu 24 Stunden (`TTL: 86400`); dafür läuft auf dem Handy kein Timer. Das zusätzliche `deliveryExpiresAt` erlaubt neuen Workern verzögerte Nachrichten, während die ursprüngliche `expiresAt`-Minute sofortige Zustellung an alte Worker kompatibel erhält. Lokale Direkt-/Testmeldungen behalten ihre kurze Frist. Vor der Anzeige prüft der Worker den aktuellen authentifizierten Raum erneut; es gibt weder erneuten Anwendungsversand desselben Ereignisses noch regelmäßige Erinnerungen.

`notification-worker.js` ist ein klassisches Service-Worker-Modul, geladen über `importScripts`. Es prüft Zustimmung, sichtbare Clients, Ablauf, Deduplizierung und den aktuellen Raum, bevor eine Benachrichtigung erscheint. Offline-Direktmeldungen verwenden dieselbe lokale Ausgabelogik. `notifications.js` verbindet explizite Zustimmung, Einstellungen, Präsenz und Benachrichtigungsklicks mit dem Client.

Die Notification-Initialisierung startet erst nach gemeldeter Offline-Bereitschaft. Gleichzeitige oder bereits erfolgreiche Initialisierungen werden nicht wiederholt; ein später erfolgreicher Start entfernt einen überholten Vorbereitungsfehler. Ab 1.12.4 sendet ein unsichtbarer Start kein `clear`. Zusätzlich prüft der Worker beim Verarbeiten dieser Aktion die tatsächlichen sichtbaren Fenster, damit auch ältere Clients oder verzögert abgearbeitete Nachrichten keine ungelesene Meldung im Hintergrund entfernen. Bewusstes Ausschalten räumt weiterhin sofort auf; keine neue Netzwerkabfrage und kein neuer Timer.

Ab 1.9.3 bestätigt `GameNotifications` nur tatsächlich quittierte Raumzuordnungen und verwendet konsistente Code-/Token-Snapshots. Raumwechsel während Registrierung/Binden werden mit höchstens drei seriellen Durchläufen nachgeführt, ohne zusätzlichen Timer. Manuelle Diagnose verwendet den vorhandenen authentifizierten Status-GET und versendet nichts. Die Oberfläche unterscheidet **Geräteanzeige testen**, **Internet-Push testen** und **Push-Status prüfen**. Nur der ausdrückliche Internet-Test erzeugt eine serverseitige Testnachricht; die manuelle Statusprüfung sendet keinen Push. Erlaubte Web-Push-Nachrichten verwenden hohe Zustellpriorität bei unveränderten Zeit-/Mengenlimits; Fehlerprotokolle enthalten nur Kategorien/Statuscodes.

## Raumstatus und Akkulast

`room-status.js` enthält Frische-/Verbindungszustände, die eigene Zugbeschreibung für die Startkarte, die 24-Stunden-Regel und einen einzelnen adaptiven `RoomPollScheduler`. `lib/room-presence.js` schreibt authentifizierte Rückmeldungen höchstens alle 30 Sekunden und liest nur Status der aktuellen Raummitglieder. Dies verändert keine Raum-Zugversion, Punkte oder Push-Ereignisse. Nach 90 Sekunden ohne Rückmeldung gilt ein Mitglied als offline; bei eigener Verbindungsstörung sind fremde Angaben unbekannt. Im Direktmodus wird `DirectGame.connected(pid)` verwendet.

`lastActionAt` im Raum-JSON wird ausschließlich durch Start/Wurf/Zug/Skip erneuert. Die API bietet `canSkip` nur dem Gastgeber nach 24 Stunden an und prüft das beim Schreiben erneut. Altpartien ohne Uhr bekommen einen sicheren initialen Zeitanker. Das Heim-Polling erfasst fertige Ergebnisse anhand der tatsächlichen Mitgliedskennung, unabhängig vom aktuell sichtbaren Bildschirm.

Der adaptive Timer stoppt im Hintergrund, offline und in anderen Spielarten. Er prüft bekannte aktive Heimkarten alle 60 Sekunden, eigene Züge alle 30 Sekunden und wartende Situationen zunächst nach sechs Sekunden mit stufenweiser Verlangsamung. Fehler erhalten Backoff, Requests einen Timeout. Änderungen an Statuspunkten aktualisieren nur die Anzeige und erhalten die offene Auswahl/Zoomposition. Intervalle, Grenzen und Tests: [room-status.md](room-status.md).

Die Heimkarte rendert Raumname, darunter Code mit Mitgliederzahl und anschließend den Zugstatus. `roomHomeMeta` nutzt ausschließlich die bereits gelesene Mitgliederliste; ohne diese wird nur der Code gezeigt. Besetzungsänderungen erhöhen die bestehende Raumversion und rendern damit auch die neue Anzahl. `roomTurnHTML` formatiert ausschließlich die Anzeige; `homeRoomStatus` bleibt die Quelle der Zugberechtigung. Ein Statusschlüssel verhindert unnötigen Austausch des Status-Markups. Ein zweispaltiges CSS-Raster hält einen 44-Pixel-Pfeil rechts neben den Angaben, auch auf schmalen Ansichten. Seine visuell verborgene Beschriftung wird weiterhin beim Statuswechsel aktualisiert. Kleinere Innenabstände sparen Höhe ohne gekürzte Namen. Diese Layoutkorrektur verändert weder API-Abfragen noch Spiel-/Speicherformate.

`room-game-top`/`room-game-chrome` reservieren in schmalen bzw. kompakten Ansichten eigene Rasterbereiche für Überschrift und Steuerung. Die Überschrift fasst Titel und unmittelbar folgende Metazeile (Code und Spielerzahl) in einem gemeinsamen Rasterbereich zusammen; die Metazeile bleibt auch im Querformat sichtbar. `room-heading-row` fasst Zurück und Überschrift zusammen: im Handy-Hochformat als Flexzeile oberhalb von drei gleich breiten Steuerungsbereichen, sonst mit `display: contents` im bestehenden Kopf. Die Handyzeile enthält keine reservierten leeren Felder; ohne Abbruchknopf werden es zwei Spalten. Sichtbare Textzusätze für Punkte/Beenden sind nur im schmalen Hochformat aktiv, die zugänglichen Aktionsnamen und Bestätigungsdialoge bleiben erhalten. `gameHTML` verkürzt nur die sichtbare Bestätigung; `turnDescription` und die zugrunde liegenden Rollen bleiben unverändert, einschließlich vollständigem zugänglichem Status. `awaiting-game` kennzeichnet ausschließlich selbst bestätigte Netzwerkzüge: `diceHTML` blendet dann gesperrte Würfel aus, CSS entfernt deren festen Platzhalter. Keine neue Zustandsmaschine oder Speicherung.

## Geräteprofil

`stats.js` bereinigt minimale Ergebnisdatensätze, führt sie anhand der Spiel-ID zusammen und berechnet Siege/Serien und direkte Gegnervergleiche. `statsCategory` trennt Menschen (`local`, `room`, `direct`), Computer und Solo vor jeder Aggregation. `summarizeStats` berechnet ausschließlich den gewählten Bereich; `summarizeOpponent` liefert pro normalisiertem Gegnernamen direkte Siege/Remis/Niederlagen, eigene Punktwerte, Serien und maximal fünf jüngste Duelle. Computer und Solo beeinflussen keine Menschenbilanz. Die Profilansicht und die sichtbare Ergebnisliste filtern denselben Bereich, Wertungstexte bleiben eingeklappt. `recordResult` erfasst nur fertige Spiele mit `ownPid`; der lokale Statistikverlauf bleibt unabhängig von den 100 sichtbaren Ergebnissen. Migration alter Listen rät bei uneindeutiger eigener Rolle nicht. Profil und Gegnerzuordnung bleiben gerätelokal; Namen sind keine kontobasierten Identitäten. Schema-1-Backups ergänzen optional `statistics`, Importe führen die Daten ohne Doppelzählung zusammen. Verdeckte Spiele fließen erst nach gemeinsamer Aufdeckung ein. Details: [statistics.md](statistics.md).

## Automatische Updateprüfung

`pwa.js` prüft den aktiven atomaren Cache zuerst. Zusätzliche Prüfungen laufen bei Internet-Rückkehr, beim Sichtbarwerden (mindestens eine Minute Abstand) und alle fünf Minuten in einer sichtbaren, online gemeldeten App. Sie sind serialisiert; ein Hotspot ohne Internet kann weiter aus dem vorhandenen Cache spielen. Erst ein als vollständig bestätigter neuer Worker löst den Update-Banner aus. Netzwerkfehler erhalten bereits fertige Updates und vorhandene Offlinebereitschaft. Die Seite wird erst auf Nutzerwunsch neu geladen; eine offene Auswahl wird vorher angekündigt. „Später“ blendet dieselbe Version für die aktuelle Ansichtssitzung aus, Einstellungen bieten das Update weiter an.

## Sicherheits- und Datenschutzgrenzen

Die Site ist öffentlich, Spielzugänge sind zufällige persönliche Schlüssel. Fremde Token werden nie in Raumansichten mitgeliefert. Bei verdeckten Partien entfernt die API/der direkte Gastgeber fremde Blätter und Details. Alle Gesamtpunkte und Aufschlüsselungen bleiben bis zum Ende verborgen. Der Gastgeber bleibt im Direktspiel die vertrauenswürdige Instanz mit vollständigem Zustand.

API-Antworten werden nicht offline gecacht. Backup-Dateien enthalten nur lokale Partie, Einstellungen und Verlauf. Push-Daten enthalten keine Punkte, Namen, Blätter oder Zugangsschlüssel. Private VAPID-Werte bleiben native Sites-Runtime-Secrets. Push-Endpunkte sind kein beliebiger ausgehender HTTP-Proxy.

Versionen und Datenformat-Kompatibilität stehen in [versions.md](versions.md), konkrete Abläufe in [flows.md](flows.md).

Die [Responsive-Prüfmatrix](responsive-qa.md) ist Bestandteil der Release-Anleitung und wird durch den Dokumentationsguard auf Version und vorhandene Links geprüft. Dieser Guard ist keine Browser-Layoutprüfung.

## Würfelbox im niedrigen Querformat

Ab 1.9.10 hat `.side-area` im kompakten Querformat eine natürliche Höhe mit viewportabhängiger Maximalhöhe und vertikalem Scrollen. Die Würfelkarte und `.choice-options` schrumpfen nicht; Würfel, Hinweis und Aktionen bleiben im normalen Fluss. Die frühere Aufteilung in einen beliebig zusammendrückbaren Würfel-Scrollbereich und unflexible Aktionsfläche entfällt. Der Hinweis zeigt den kurzen Titel plus **i**, dessen bestehender Dialog die vollständige Erklärung enthält. Das doppelte Informationssymbol entfällt nur für gewöhnliche Infohinweise im Querformat; Warn-/Fehlerzustände behalten ihre Kennzeichnung. Die bestehende Messung von `--side-area-height` und alle Spielzustände bleiben unverändert.

## Verpasste Raumreaktionen

Seit 1.9.10 liest der vorhandene authentifizierte Raum-GET höchstens die neueste passende Reaktion je Absender für den aktuellen Empfänger, die aktuelle Partie und die letzten 24 Stunden. Die vorhandene Tabelle wird weiterverwendet; ein SQL-Fenster ordnet je Absender nach Zeit/ID. `senderId` ergänzt die Antwort um eine bereits in der Mitgliederansicht öffentliche Kennung, ohne Tokens. Der Versand bereinigt abgelaufene Einträge, ändert aber weder Zugversion noch Aktivitätsuhr.

`RoomReactionInbox` speichert höchstens 64 aktuelle Anzeigecursor (Raum/Partie/Empfänger/Absender, Ereignis-ID und Zeit) lokal. Keine Namen, Würfel, Züge oder Zugangsschlüssel. Der erste sichtbare Abruf wird verarbeitet; eine beim Verbergen eintreffende Antwort wird nicht ungesehen verbraucht. `ReactionOverlay` zeigt höchstens drei Flüge zugleich und lässt weitere neueste Absenderreaktionen nach frei werdenden Plätzen folgen. Erst das tatsächliche Erzeugen eines Flugs setzt den Anzeigecursor. Speicherfehler fallen auf sitzungslokale Deduplizierung zurück, ohne das Spiel zu blockieren. Die vorhandenen Animationstimer werden genutzt, keine neue HTTP-Schleife oder Push-Nachricht. [Verhalten und Grenzen](reactions.md).

## Emoji-Größe und Flugbahn ab 1.10.0

`bindReactionPress` bindet Pointer-/Tastaturereignisse einmal delegiert an das Dokument. Die lokale Vorschau nutzt während des Haltens genau eine AnimationFrame-Kette, die bei Obergrenze, Loslassen oder Abbruch endet. Seit 1.10.1 ruft `pointerup` bzw. `keyup` die Sendeaktion direkt mit der Haltegröße auf. Kein nachfolgender Klick ist erforderlich. Ein Capture-Handler verbraucht eventuelle Kompatibilitätsklicks, auch wenn das geschlossene Dialogfenster den Klick auf den Hintergrund umleitet. Eine neue Pointer-Eingabe entfernt die alte Klicksperre. Reine Bedienhilfen-Klicks ohne vorausgehende Geste bleiben möglich. `sendPressedEmoji` serialisiert offene Sendungen, sperrt die Auswahl vorübergehend und zeigt Versand bzw. Fehler an; es gibt keine wiederholten Versand-Timer. `reactionEffect` validiert Größe 1–2,5 und ausschließlich `fly`, `bounce`, `loop`, mit kompatiblen Defaults. Die sendende App wählt eine Bewegung, die sich nicht unmittelbar wiederholt.

Migration 0005 ergänzt `scale_percent` und `motion` mit konstanten Defaults. Die Raumantwort liefert diese optionalen Effektdaten, die auch bei späterem Abruf erhalten bleiben. Direkte Gastgeber prüfen und verteilen dieselben Daten ohne Änderung von Snapshot oder Protokollkennung. Ältere Clients ignorieren Zusätze und zeigen weiter normale Reaktionen; neue Apps bleiben mit alten Daten kompatibel. CSS zeigt etwa 3,2 Sekunden Flug, Hüpfen oder Looping; `REACTION_DURATION` räumt nach 3,4 Sekunden auf. Größe wird zusätzlich an die Bildschirmfläche begrenzt. Bei reduzierter Bewegung erscheint das Emoji stationär.

## Raumliste und Inaktivität ab 1.11.0

`room-book.js` speichert getrennte Gerätezugänge in `farbfeld.rooms.v1`, migriert den einzelnen Legacy-Zugang und behält `farbfeld.room.v1` als ausgewählten Raum. Metadaten sind kompakt, ohne Spielblätter oder laufende Punkte. Entfernen hat einen begrenzten lokalen Merker gegen Wiederimport alter Legacy-Zeiger. Parallele Tabs ergänzen gespeicherte Räume; Metadaten eines alten Tokens ersetzen keinen neueren Zugang. `RoomDrafts` hält Entwürfe nur im Arbeitsspeicher, getrennt nach Raum/Spieler und mit dem tatsächlichen eigenen Zugschlüssel. Ein Sitzungszähler verhindert verspätete Antworten über A–B–A-Wechsel.

Ein vorhandener `RoomPollScheduler` steuert alle Raumabfragen: Startseite über einen kompakten POST `index` für bis zu 50 autorisierte Zugänge (höchstens ein automatischer Abruf/Minute, ohne Idle-Lobby-Timer), geöffnetes Spiel weiter adaptiv per GET. Der Index liefert Name, Mitgliederzahl, eigenen Zugstatus, Runde, Aufräumzeit und bei beendetem Spiel eine kompakte Ergebniszusammenfassung. Keine Blätter, Zugangsschlüssel oder laufenden Punkte. Nur Reaktionen des aktuell gewählten Raums werden auf der Startseite zusätzlich gelesen; andere bleiben bis zum Öffnen innerhalb ihrer bisherigen 24 Stunden verfügbar.

Migration 0006 ergänzt `rooms.last_used_at` mit 0, einen Index auf `expires_at`, `room_maintenance` und `notification_room_bindings`. `expires_at` ist jetzt ausschließlich der früheste Bereinigungstermin, kein Zugangsfilter. Erstellen und akzeptierte Aktionen setzen letzte Nutzung und Termin atomar mit dem vorhandenen Zustands-CAS; ausdrückliches `open`/Legacy-`hello` erneuert nur Nutzungsmetadaten, ohne den Spielstand oder die Skip-Uhr umzuschreiben. Die Rückkehr in eine sichtbare Raumansicht ersetzt den nächsten GET durch `open`, ohne einen zusätzlichen HTTP-Timer. Passive GET/Index-/Push-/Präsenzprüfungen erneuern nicht.

`cleanupRooms` wird nach Erstellen/Beitreten/Öffnen geplant, mit globalem Sechs-Stunden-Lease. Bis zu 50 Legacy-Zeilen erhalten eine vollständige neue Schonfrist. Bis zu 20 tatsächlich inaktive Räume werden mit erneut geprüfter SQL-Bedingung in einer D1-Transaktion bereinigt; nachgeordnetes Presence-/Binding-Cascade, Reaktionsbereinigung und Zurücksetzen alter primärer Notification-Verweise. Gleichzeitige neue Nutzung gewinnt, sofern sie vor der Löschtransaktion committed wurde. Gewinnt die Löschung zuerst, kann Öffnen keinen nur scheinbar vorhandenen Raum bestätigen. Es gibt keine automatische Neuerstellung und keine dauernden Cleanup-Abfragen.

Mehrere `notification_room_bindings` verknüpfen eine bestehende Geräte-Subscription mit autorisierten Raum-/Spielerkennungen und eigener Ereignis-Deduplizierung. Die bisherige primäre Gerätezuordnung bleibt für ältere Clients und manuelle Anzeige bestehen. Die neue Sammelbindung prüft jeden Spielerzugang, speichert keine Raumtokens und entfernt vergessene Zuordnungen. Globales Minutenlimit, ein Tag und stille Opt-in-Regeln bleiben geräteweit. Der Worker validiert den konkreten Meldungsraum über `status=1&room=...`; Sichtbarkeit und lokal gesehene Ereignisse schützen zusätzlich. `seen-list` speichert sichtbare Indexereignisse zusammen, ohne neue Netzwerkabfrage.

Präsenz bleibt unabhängig: 90 Sekunden Online, höchstens alle 30 Sekunden ein Schreibvorgang, eigene siebentägige Aufbewahrung. Die 24-Stunden-Skip-Uhr, Reaktionsfrist, Push-Frist und Direkt-Kopplungscodes haben eigene unveränderte Regeln. Keine Änderung an deterministischen Spielregeln, Classic, Protokoll 2 oder Backupformat 1.

## Push-Transport ab 1.11.1

Der bestehende Worker erzeugt nach einem bestätigten Spielereignis denselben verschlüsselten Schema-1-Push. Der HTTP-Aufruf verwendet `manual` als Redirect-Modus; eine 3xx-Antwort ist eine Ablehnung und wird nicht verfolgt. `error` ist in workerd unzulässig und hatte vor Netz-I/O abgebrochen. Bestehende Claim-/Deduplizierungs- und Cooldown-Regeln, API-Endpunkte und VAPID-Konfiguration bleiben erhalten. Die Regression umfasst erstmals D1 und den unveränderten Default-`fetch` im tatsächlichen Worker-Runtime-Typ mit lokalem Push-Dienst-Ersatz.

## Push-Diagnose ab 1.11.2

`sendDevicePush` ist der gemeinsame verschlüsselte Transport für Spielereignisse und den ausdrücklich angeforderten Selbsttest. `test-push` benötigt den bestehenden Gerätezugang, ein aktiviertes Gerät und eine atomare globale Minutensperre. Es akzeptiert keine Zieladresse oder Texte. `delivery` speichert ausschließlich das jüngste begrenzte Transportobjekt. `receipt` erlaubt nur feste Ergebnisse für dieselbe Installation und dieselbe aktuelle Ereigniskennung; atomare erste Quittung, getrennte JSON-Patches erhalten frühe Quittungen bei später Providerantwort. Der Status-GET projiziert nur erlaubte Diagnosefelder und validiert Testkennungen/Frist für den Worker. Eine Providerannahme bleibt von Geräteanzeige und menschlichem Lesen getrennt.

Der Service Worker führt eine Statusprüfung und höchstens einen Quittungs-POST pro empfangenem Push aus. Kein Timer und keine automatische Wiederholung. Lokale Worker-Nachrichten aktualisieren offene Einstellungen; spätere Diagnose erfolgt per bestehendem manuellem Statusknopf. Migration 0007 ergänzt nur eine optionale Textspalte; Cache-Dateizahl und Spiel-/Direktformate bleiben erhalten.

## Gemeinsamer Regelzustand ab 1.17.0

`engine.js` ist weiterhin alleinige Regelautorität. Bonuskoordinaten und reservierte Treffer bleiben vollständig beim Server/Offlinehost; alle Gäste sehen nur veröffentlichte Bonusgewinne. `boards.js` erzeugt und prüft ein geteiltes Random-Layout bei Start. `boardFor(game)` nutzt diesen gespeicherten Plan für UI, Hinweise, Computer und Wertung. Minen werden vor der normalen Auswahl als eigene atomare Aktion mit per-Gegner-Ergebnissen gespeichert; Abschlussrunden erlauben korrekte Erst-/Späterboni bei mehr als zwei Personen.

`leaveGame` markiert statt zu löschen: stabile Plätze, keine nachträgliche Würfeländerung, beendete Beiträge blockieren keinen Rundenabschluss. Eine aktive Person beendet die Partie unmittelbar. Internet überträgt `hostId` im selben CAS-Commit; erst Revanche entfernt Ausgestiegene aus der Mitgliedsliste. Direkt bleibt Platz 0 dauerhafte Autorität und Relay, auch als Zuschauer; die Bereitschaft verlangt nur noch aktive Gäste plus Relay. Keine hostlose Fortsetzung bei Verbindungsabbruch. Lokale Ausstiegs- und Endresultate werden getrennt dedupliziert, unbekannte verdeckte Gegnersummen bleiben absent. Neue additive Fähigkeiten erlauben sichere Mischversionserkennung ohne Schema-/Protokollwechsel.

## Brettwahl und feste Minenkennzeichnung 1.17.1

Die gemeinsame `boardPicker`-Ausgabe bleibt unverändert. CSS entfernt die kollidierende alte 420-Pixel-Zeilenregel und definiert pro Kachel eine einzelne Vorschau-/Namensspalte mit begrenzten Grid-Tracks. Bis 540 Pixel zwei Kacheln je Zeile, darüber vier. Vorschauzellen bleiben im Seitenverhältnis 15:7 innerhalb der eigenen Kachel; Random nutzt dieselbe Größe und runde Würfelpunkte.

`mine-ui.js` zeichnet ein lokales gefülltes Minesweeper-SVG. `mine-feature-icon` ist eine eigene feste Grid-Spalte vor `mine-state-list`; weder kleine Breiten noch seitliches Scrollen können das Symbol ausblenden. Statuswörter ergänzen Farbe und Symbole. Die bisherigen Klassen für Bereit-Puls, zulässige Aktion und reduzierte Bewegung bleiben erhalten. Keine Regel-/Transportänderung und kein neues Offline-Asset.
