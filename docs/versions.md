# Versionen und Kompatibilität

<!-- farbfeld-version: 1.34.2 -->

## 1.34.2 · Website und Impressum

Die Hauptadresse zeigt online die Spielvorstellung. Eine installierte App startet über `/play` aus dem atomaren Cache mit 101 Dateien. Alte Lesezeichen unter `/` erreichen bei Netzfehlern weiterhin das gecachte Spiel. Bereits installierte Apps übernehmen die neue Navigation mit dem regulären Update.

## 1.34.0 · Schrittfolgen der Spielanleitung

Das Grundspiel und sieben Zusatzregeln haben drei oder vier Schritte einschließlich Spielziel und Wertung. Die Videos und Vorschaubilder bleiben Teil des vollständigen Offline-Downloads. Die Videos zeigen lokale Beispielszenen und eine Beispiel-Lobby. Spielstände und Direktprotokoll verwenden ihre bestehenden Formate.

## 1.33.0 · Spielanleitung und Luftangriff

Die Spielanleitung spielt acht stumme Spielclips mit Regeln ab. Je ein MP4 und ein JPEG pro Thema sowie das Anleitungsmodul erweitern den atomaren Offline-Cache auf 63 Dateien. Farbabschluss und 70 bestätigte Kreuze auf einem Gegnerbrett können je einen Luftangriff kostenpflichtig freischalten. Das beim Start gewählte innere Luftangriff-Schema und die bestätigte Unterstützung aller Netzwerk-Apps bestimmen die Regel. [Luftangriff](mines.md) · [Größenprüfung](responsive-qa.md#spielanleitung-und-luftangriff--1330)

## 1.31.0 · Zeitentwurf in der PC-Diagnose

Jeder Zeitleistenschritt zeigt einen Zeitabstand in Millisekunden. Die aufgenommene Spielansicht lässt sich damit erneut abspielen. Der atomare Offline-Cache umfasst 46 Dateien.

## 1.30.1 · Auftragsfortschritt und Pokal

Die Auftragsübersicht zeigt eigene bestätigte Zähler. Der Endstand der vorherigen Partie ist beim Raumnamen oder in der Navigation der Aufstellung erreichbar.

## 1.30.0 · Versionshinweise in der App

Die Einstellungen zeigen die Änderungen der installierten Version und der jeweiligen Vorversion. Ein verfügbares Update erscheint mit eigener Kurzfassung auf der Startseite und ausführlichen Hinweisen in den Einstellungen. Die Kurzfassung ist ab der installierten 1.30.0 für spätere Updates sichtbar.

## 1.29.1 · Direkter Einstieg in die PC-Diagnose

`/diagnose` lädt die aktuelle Animationsvorschau und ihre Dateien zusätzlich online unter eigenen Pfaden. Der reguläre PWA-Cache umfasst 45 Dateien.

## 1.29.0 · Debug-Zeitleiste am PC

Die Zeitleiste sitzt neben dem Spielframe. Ein Klick auf einen Eintrag zeigt das Standbild mit der Markierung am sichtbaren Element.

## 1.28.0 · Zeitleiste für Beispielszenen

Die Debug-Spielansicht ergänzt die Wiedergabe um Sichtbarkeitsstatus, Scrollweg und einzeln prüfbare Momente. Der PWA-Cache umfasst 45 Dateien.

## 1.27.0 · Spielansicht für Animationen

24 feste Beispielszenen zeigen das Spiel mit Overlay, Toasts, Moduskarten und Scrollwechseln. Die App lädt 44 Offline-Dateien.

## 1.26.0 · Animationen testen

Elf feste Beispiele unter **Hilfe & Diagnose**. Die Vorschau verwendet die Spieleffekte sowie die Bewegungspräferenz des Geräts und gehört zu den 43 Offline-Dateien.

## 1.25.3 · Raumübersicht

Der Zugzähler steht unter dem Titel. Die Raumaktionen stehen auf einer Höhe und bieten mindestens 44 Pixel Antippfläche.

## 1.25.2 · Ergebnisse

Abgeschlossene Partien erhalten eine optionale Endezeit in Spielschema 1. Der Raumindex liefert zusätzlich den archivierten Endstand, wenn zugleich ein neuerer Endstand vorliegt. Ältere Spielstände bleiben lesbar. Die Ergebnisliste wird lokal aus den vorhandenen Ergebnisdaten aufgebaut.

## 1.25.1 · Offene Züge an der Glocke

Die Startseite zählt Partien mit offenem eigenem Zug. Das Update verwendet die vorhandenen 42 Offline-Dateien sowie den bestehenden Raumstatus und das bestehende Spielschema.

## 1.25.0 · Mehrspieler-Schatzsuche und versteckte Minen

Bestehendes Spielschema 1, Direktprotokoll 2 und 42 Offline-Dateien. Neue Schatzketten und versteckte Minen im Netzwerk prüfen die tatsächliche Fähigkeit aller Geräte. Bestehende normale Partien bleiben mit ihrem bisherigen Regelstand spielbar. Laufende Schatzpartien ohne Kettenbonus erhalten private Suchhinweise nach der nächsten bestätigten Aktion unter derselben Wertung. Online- und Direktpartien archivieren beim Rückspielwechsel das letzte fertige Ergebnis. Die Browser-Glocke zeigt laufende Partien und ungesehene Ergebnisse. Mehr zum Update und den Prüfungen steht im [Änderungsprotokoll](../CHANGELOG.md).

## Veröffentlichung 1.24.0 — 12. November 2026

Im bestehenden Cloudbrowser den normalen PWA-Weg **Einstellungen → Auf Updates prüfen → Version 1.24.0 bereit → Aktualisieren** tatsächlich bestätigt. Danach dieselbe gespeicherte Computerpartie in Wurf 2 fortgesetzt, regulär **Einpassen** betätigt: **A–O, Zeilen 1–7, 105 Felder und 16px Spaltenbuchstaben** sichtbar, bisherige vier Kreuze und −21 Punkte unverändert. Offline bereit. Keine neue Produktivpartie, kein weiterer Produktivzug und kein Push für die Prüfung. Veröffentlichtes Raster. Auftragsauswahl, Kartenschluss und Sechser-Ergebnisvergleich wurden separat in der verwalteten Vorschau geprüft, wie im Prüfumfang beschrieben.

Die anschließende reine Quellenfortschreibung ergänzt den Nachweis. Ausgeliefert bleibt Sites-Version 117 aus dem genannten Commit; keine zusätzliche Appveröffentlichung oder unabhängige GitHub-Übernahme für Nachweisdokumentation.

## 1.24.0: Aufträge, Vergleich und nummeriertes Brett

Bestehendes Schema 1, Direktprotokoll 2, variants-v1 und 42 Offline-Dateien. Neue Aufträge verwenden ausschließlich bisher erlaubte Kriterien, Ziele und Fristen. Laufende/alte gleiche Auftragsarten bleiben valide. Kartenzustand, Ergebnisvergleich und Achsenbeschriftung sind lokale Anzeigeänderungen, keine Netzwerk- oder Spielstandserweiterung.


## Veröffentlichung 1.23.2 — 12. November 2026

Im vorhandenen Cloudbrowser den regulären Weg **Einstellungen → Version 1.23.2 bereit → Aktualisieren** tatsächlich bestätigt. Danach **1.23.2 / Offline bereit**, dieselbe gespeicherte Computerpartie in Wurf 2 fortgesetzt: tatsächlicher eigener **Schatz 3 ✓**, zwei offene Slots, bisheriger Suchzug unter **Deine letzten 5 Suchzüge**, grobe Spur und unverändert +2 Punkte. Keine neue Produktivpartie und kein weiterer Produktivzug gestartet. Der echte Fünferverlauf/Verdrängen des ältesten Eintrags wurde getrennt in der verwalteten Vorschau geprüft. Live-Nachweis.

Die anschließende reine Quellenfortschreibung ergänzt den Nachweis. Ausgeliefert bleibt Sites-Version 116 aus dem genannten Commit; keine weitere Appveröffentlichung oder unabhängige GitHub-Übernahme für die Nachweisdokumentation.

## 1.23.2: vergebene Schatzslots und fünf Messungen

Optionales hunt.history mit zwei eigenen Listen und maximal fünf Einträgen ergänzt Schema 1. Alte Dateien ohne history bleiben lesbar; deren einzelne reading wird beim nächsten Suchzug übernommen. Neue history-Spielstände benötigen 1.23.2 für die streng validierte Wiederherstellung. Kein anderer Wertungs-, Protokoll-, Capability-, D1- oder Offline-Dateizahlwechsel. Kompakte Statuszeile bleibt; aufgeklappt stehen die letzten fünf Messungen und echte Slotzustände.

## Veröffentlichung 1.23.1 — 12. November 2026

Im bestehenden Cloudbrowser regulär **Einstellungen → Auf Updates prüfen → Version 1.23.1 bereit → Aktualisieren** ausgeführt. Danach **1.23.1 / Offline bereit**, dieselbe gespeicherte Computerpartie in Wurf 2 geöffnet: **1/3 eigene · Warm: H4, G4 +2**, aufgeklappt alle vier eigenen bisherigen Suchfelder, grobe Spur F–J, sichtbare Schrittlegende und unverändert +2 Punkte. Eigenes Brett bleibt Index 0. Hier wird der sichere Rückfall für vor 1.23.1 gespeicherte Messungen tatsächlich live geprüft; kein weiterer Zug und keine neue Produktivpartie gestartet. Live-Nachweis, Beobachtete Werte.

Die folgende reine Quellenfortschreibung ergänzt diese Nachweise. Der ausgelieferte Anwendungsstand bleibt Sites-Version 115 aus dem genannten Commit; keine zusätzliche Appveröffentlichung oder unabhängige GitHub-Übernahme für Nachweisdokumentation.

## 1.23.1: kompatible Hinweise und dauerhafte Minenberichte

Schema-1-Backups und Schlüssel bleiben erhalten. Laufende ältere Zweier-Computer-Bonusstände dürfen beim nächsten bestätigten normalen/Extra-Zug hunt mit chainBonus:false erhalten; ihre bisherigen sechs Maximalpunkte bleiben erhalten. Neue Kettenpartien bleiben bei neun. Keine Erweiterung beim Laden/Rendern/Passen, in fertigen Legacy-Spielen oder Solo-/menschlichen Partien. Optionales reading.focus ist eine streng geprüfte eindeutige Teilmenge der eigenen Suchfelder; ältere Messungen ohne focus bleiben akzeptiert. Neue optionale Felder benötigen Client 1.23.1 beim Import.

Minenberichte werden aus bestehenden Ereignissen abgeleitet, ohne neue Speicherstruktur. Verdeckte Berichte dürfen nur die ausdrücklich gewünschte Schadensanzahl zeigen, keine Koordinaten. Keine neue Capability, DB-Migration, Push-Art oder Protokolländerung; weiterhin 42 Offline-Dateien. Alle Geräte regulär über Einstellungen → Auf Updates prüfen → Aktualisieren aktualisieren; offene Spielstände bleiben erhalten. 540 Regressionen, 448 vollständige Kombinationen, TypeScript/beide API-Integrationen und die in responsive-qa.md getrennt dokumentierten Browserprüfungen erfolgreich.

## Veröffentlichung 1.23.0 — 12. November 2026

Der kombinierte Stand besteht erneut **530/530 Regressionen**, TypeScript und beide API-Integrationen. Im Cloudbrowser den normalen Updateweg **1.22.4 → Auf Updates prüfen → Version 1.23.0 bereit → Aktualisieren → 1.23.0 / Offline bereit** tatsächlich bestätigt. In der veröffentlichten Einrichtung steht Schatzsuche mit Warm/kalt, nächster Spur und Kettenbonus. Keine Produktivpartie oder Push gestartet. Veröffentlichte Einrichtung. Vollständige responsive Browser-/Android-Abnahme dieser neuen Mechanik bleibt wie oben beschrieben offen.

Diese anschließende reine Quellenfortschreibung hält den Nachweis fest; der ausgelieferte Anwendungsstand bleibt Sites-Version 114 aus dem oben genannten Commit. Keine zusätzliche Appveröffentlichung für diese Dokumentation.

## Zusätzlicher Live-Test mit bestätigtem Suchzug · 1.23.0

Zusätzliche echte Live-Bedienung: Updatebanner **1.22.5 → Jetzt aktualisieren → 1.23.0**, neue Computerpartie mit ausschließlich Schatzsuche, regulär würfeln und per Tipp einen gültigen Zug wählen. Vor Bestätigung noch „Auf Suche“; nach Bestätigung zunächst eigener vorgemerkter Fund, nach Computer-/Wurfwertung **1/3 eigene · Warm · W1**, **+2 P**, Suchzug **H4, G4, H5, G5** und **Nächste Spur: Spalten F–J**. Nach Neuladen über die gespeicherte Computerpartie fortgesetzt: Temperatur, Spaltenhinweis, Fund und Punkte unverändert. Echter Live-Nachweis.

Die zwölf Schatzsuche-Regressionsprüfungen wurden zusätzlich erfolgreich ausgeführt. Die dokumentierte vorherige vollständige Prüfung von 530 Regressionen/448 Kombinationen bleibt davon getrennt; die offene Gesamt-Browsermatrix wird mit dieser einzelnen echten Live-Prüfung nicht als vollständig bestanden erklärt. Keine neue Spielfreigabe oder nachträgliche Veränderung alter Partien. Diese Quellenfortschreibung ergänzt nur Nachweise; ausgeliefert bleibt die genannte Sites-Version 114, ohne zusätzliche Appveröffentlichung.

## 1.23.0: neue Computer-Schatzsuche

Neue Computerpartien mit Bonusfeldern speichern zusätzlich bonuses.hunt mit Schema 1, eigenen Messungen und groben Spaltenband-Hinweisen. Fortsetzen solcher neuen Stände erfordert Client 1.23.0. Beim Öffnen bleiben ältere Computerstände ohne hunt unverändert; seit 1.23.1 erhalten sie beim nächsten bestätigten Zug kompatible Hinweise ohne Kettenbonus. Solo-/menschliche Bonusstände bleiben beim vorhandenen bonus-fields-v1 und maximal sechs Punkten. Die neue Schatzsuche ist noch nicht für menschliche Spiele freigegeben.

Backupformat und Speicherschlüssel bleiben Schema 1. Strikte Validierung begrenzt Hinweisform, Wurf, Suchkoordinaten und Spaltenband und lehnt hunt in menschlichen/projizierten Ständen ab. Keine öffentliche Capability, Direktprotokolländerung oder Migration; 42 Offline-Dateien. Regulär Einstellungen → Auf Updates prüfen → Aktualisieren.

## Veröffentlichung 1.22.5 — 12. November 2026

Im vorhandenen Cloudbrowser den normalen PWA-Updateweg tatsächlich bestätigt: **1.22.4 → Einstellungen → Auf Updates prüfen → Version 1.22.5 bereit → Aktualisieren → 1.22.5 / Offline bereit**. In der veröffentlichten Computer-Spielauswahl den Namen **Schatzsuche** und die drei versteckten Schätze mit je +2 Punkten bestätigt, anschließend ohne Partiestart geschlossen. Live-Nachweis.

Die anschließende Quellenfortschreibung hält nur diesen Nachweis fest. Ausgeliefert bleibt Sites-Version 113 aus dem genannten Quellcommit; keine weitere Appveröffentlichung für die Nachweisdokumentation und keine unabhängige GitHub-Veröffentlichung behauptet.

## Client 1.22.5 · 12. November 2026

Fragezeichen und Punktespalten aller Spielelemente bündig, unabhängig vom Aufklapppfeil. Bonusfelder heißt jetzt Schatzsuche in sämtlichen sichtbaren App-Oberflächen und Fehlerhilfen; interne Schlüssel/Saves bleiben kompatibel. 518 Regressionen, TypeScript, beide API-Integrationen und 84 tatsächliche Komponentenansichten erfolgreich. 42 Offline-Dateien, Schema 1, Direktprotokoll 2; keine neue Spielfreigabe.

## Veröffentlichung 1.22.4 — 12. November 2026

Im frischen Cloudbrowser **1.22.4** und in den Einstellungen **Offline bereit ✓** tatsächlich bestätigt. Keine Produktivpartie, Designeinstellung oder Push verändert. Live-Nachweis. Die frühere Prüfung des regulären Updatewegs 1.22.2 → 1.22.3 ist separat dokumentiert; für 1.22.4 wurde hier ein frischer Aufruf geprüft.

19 fokussierte Regressionen, TypeScript und Pflichtdokumentation erfolgreich; Build und Paketierung erfolgreich. 36 gerenderte Komponentenansichten/144 Konturen geprüft. Diese anschließende Quellenfortschreibung ergänzt nur den Veröffentlichungsnachweis. Der ausgelieferte Stand bleibt Sites-Version 112 aus dem oben genannten Quellcommit; keine zusätzliche Appveröffentlichung für diese Dokumentation.

## Client 1.22.4 · 12. November 2026

Gemeinsamer Schiffsanker mit vollständig sichtbarem unterem Bogen in Buttons, Panel, Auswahl und Ergebnis. 19 fokussierte Regressionen bestanden; 36 tatsächliche Komponentenansichten/144 Anker einschließlich Konturen geprüft. Keine Regel-, Punkte-, Schema- oder Protokolländerung; 42 Offline-Dateien. Die 518 Gesamtregressionen/448 Wertungskombinationen und API-Integrationen wurden für den unveränderten Spielstand 1.22.3 ausgeführt, nicht als neuer Gesamtlauf für diese reine SVG-Korrektur behauptet.

## Veröffentlichung 1.22.3 — 12. November 2026

Im vorhandenen Cloudbrowser den regulären PWA-Updateweg **1.22.2 → Einstellungen → Auf Updates prüfen → Aktualisieren → 1.22.3 / Offline bereit** tatsächlich bestätigt. Keine Produktivpartie oder Push verändert. Bestätigte Offline-Bereitschaft.

Diese anschließende Quellenfortschreibung hält nur den Veröffentlichungsnachweis fest. Der ausgelieferte Anwendungsstand bleibt Sites-Version 111 aus dem oben genannten Quellcommit; keine zusätzliche Appveröffentlichung für diese Dokumentation.


## 1.22.3: Aufstellung einpassen und eigene Schritte abschließen

Bestehende Schema-1-Partien, Flotten-/Minenpositionen, Bestätigungen, Direktprotokoll 2 und öffentliche Fähigkeiten bleiben gültig. PlacementView befindet sich in einer bereits atomar gespeicherten Datei; weiter 42 Offline-Dateien. Zoom/Ausschnitt sind rein flüchtige Ansichten mit Match-/Teilnehmer-/Aufstellungsart-Schlüssel. Neue Minen sind weiterhin ausschließlich gegen Computer verfügbar. Reguläres PWA-Update auf 1.22.3, keine neue Kopplung allein für diese Korrektur.


## 1.22.2: Schusskarte, Hilfen und Versenkungsanimation

Reine UI-Erweiterung: an Bildschirmbreite angepasste Schusskarte mit eigenem 100–260-Prozent-Zoom, Regelhilfe für alle Spielelemente und wieder vollständig sinkende Schiffe. Keine Änderung an Spielstand, Spielregeln, Autorität, Projektion oder Netzwerkfähigkeiten gegenüber 1.22.1; weiterhin 42 atomare Offline-Dateien.


Die bestehende Projektion verdeckt gegnerische Schüsse nun vollständig, einschließlich Treffer/Wracks/Salve. Schlüssel und Arrayformen bleiben kompatibel; die vertrauenswürdige Autorität behält den Originalstand. Zellgebundene SVG-Rückmeldung und Concealment ändern keine Wertung.


## 1.22.1: kompakte Spielkarten und gemeinsame Vorbereitung

Reine Darstellungsänderung. Flotte/Minen verwenden dieselbe Aufstellung; bestehende Aktionskennungen, Speicherstände, Protokolle, Regeln und Computer-only-Freigabe neuer Minen unverändert. Der reguläre PWA-Updateweg liefert wieder 42 atomare Offline-Dateien.


## 1.22.0: Luftangriff und neue geheime Minen

Die bestehende bezahlte Mine wird ausschließlich in der Oberfläche Luftangriff genannt; historische Exporte, mines-v1, gespeicherte Daten und Regeln bleiben kompatibel. Die optionale neue Computerregel ist unter variants.hiddenMines in Schema 1 gespeichert. Alte Stände ohne dieses Objekt ändern sich nicht. Für das Fortsetzen eines neuen Minenstands ist Client 1.22.0 erforderlich; ältere Clients kennen das neue optionale Feld nicht. Kein neues Optionsflag oder Capability für menschliche Spiele: deren neue Minenfreigabe steht noch aus. Vier bereits genehmigte Varianten und Direktprotokoll 2 bleiben erhalten. 42 Offline-Dateien; reguläres PWA-Update ohne automatische Neuladung. Der geprüfte Quellschritt 1.21.3 wurde nicht separat veröffentlicht.


## Veröffentlichung 1.21.2 — 11. November 2026

Diese anschließende Quellenfortschreibung hält nur den Veröffentlichungsnachweis fest. Der ausgelieferte Anwendungsstand bleibt Sites-Version 107 aus dem oben genannten Quellcommit; keine zusätzliche Appveröffentlichung für diese Dokumentation.


## 1.21.2: Minen klar wählen und verfolgen

Darstellungs- und Bedienkorrektur für alle bestehenden Minenmodi. Neues Zielraster/kurze Bestätigung, zellgebundene Explosion, skalierendes Minus für verlorene Kreuze und eigener letzter Angriff. Spiel-/Backupschema 1, Direktprotokoll 2, mines-v1/variants-v1, sämtliche Kosten/Schadensregeln und 42 Offline-Dateien bleiben erhalten. Bestehende Ledger liefern die Anzeige; kein neues Speicherfeld und keine erneute Kopplung allein für diese UI nötig. Normales PWA-Update auf 1.21.2.


## 1.21.1: freie Farbgruppen beim Mischen erhalten

Reguläre Fünf-Runden-Mischungen tauschen ganze freie Gruppen statt einzelne Felder. Einzelne sind erlaubt; größere Gruppen bleiben spielbar. Bestehende Farbpläne werden beim Laden nicht neu erzeugt. Variante/Spiel-/Backupschema 1, Direktprotokoll 2, variants-v1 und 42 Offline-Dateien bleiben erhalten. 1.21.0 kann das gespeicherte Ergebnis weiter lesen; das verbesserte Verfahren läuft beim aktualisierten Server, Direktgastgeber beziehungsweise lokalen/Computergerät. Alle Apps regulär auf 1.21.1 aktualisieren; keine neue Kopplung allein für diese Korrektur erforderlich.


## 1.21.0: genehmigte Varianten für menschliche Mehrspieler

Alle vier bestehenden Varianten nun in local, room und direct; Schiffe exakt zwei, übrige 2–6. Optionales variants-Optionsobjekt im bisherigen Raum-/Direkt-JSON, capability variants-v1 und fleet-Aktion. Schema 1, variants.schema 1, Direktprotokoll 2 und 42 Offline-Dateien erhalten. Alte Clients können Standardpartien weiterführen, neue Varianten verlangen bestätigte Unterstützung aller Apps ab 1.21.0; Wiederaufnahme einer Variantenpartie durch ältere Clients wird gesperrt. Vollständige Computerstände weiter gültig; neue Projektionen mit projected/viewer sind kein importierbarer lokaler Autoritätsstand.


## 1.20.6

Präsentationsversion: deutliches Ergebnis, gemeinsame Symbole und eigene Punkte rechts an jedem Regelkopf; Aufgaben-/Fristdetails darunter. Schema 1, Direktprotokoll 2, Fähigkeiten, 42 Offline-Dateien und Enginewertung unverändert. Native PWA-Aktualisierung für laufende Partien. Die anschließend genehmigte menschliche Variantenfreigabe ist noch nicht Bestandteil dieser UI-Version.


## 1.20.5

Schiffstreffer folgen dem Brett-Zoom: skalierender SVG-Stern, zellabhängiger Rahmen, kein Überlaufen bei kleinen Zellen. Normales PWA-Update auch für laufende Partien. Keine Regel-, Punkte- oder Speicheränderung.


## 1.20.4

Kompakte, vollbreite Schiffsboni im niedrigen Handy-Querformat statt einer hohen halben Spalte mit großem Leerraum. Alle Angriffsspalten A–O sichtbar; Metadaten links, Karte rechts. Normale PWA-Aktualisierung, kein Eingriff in Regeln, Wertung oder laufende Spielstände.


## 1.20.3

Lokale Wiederaufnahme schließt Alle Räume zuverlässig. Kompakte Fragezeichen mit großer Antippfläche sowie kontrastreiche Schiff-Fehlschüsse mit Ring, Legende und zugänglicher Koordinatenbeschriftung. Laufende Partien regulär aktualisierbar, keine neue Multiplayerfreigabe.


## 1.20.2: Farbwahl-Bedienung und Statuskarten

Korrigiert den fehlenden Farbindex im lokalen Entwurf bei direkter freier Farbwahl. Das bestätigte Zugformat, Engine, Punkte, verfügbaren Würfel und Ladungsregeln bleiben gleich. Native Details-/Kartenanzeige nur Präsentationszustand. Gleiche 42 Offline-Dateien, Schema 1, Direktprotokoll 2 und bisherige Netzwerkfähigkeiten. Neue Varianten bleiben computerexklusiv.


## 1.20.1: Einheitliche Optionen

Nur HTML/CSS/SVG der bestehenden Auswahloberfläche geändert. Gleiche lokalen Options-IDs und Checkboxwerte, gleiche Lobby-Switch-Aktionen, gleiche 42 Offline-Dateien. Keine Regel-, Schema-, API-, Protokoll-, Push- oder Datenbankänderung. Computer-Varianten werden weiterhin nicht im menschlichen Mehrspieler angeboten.


## 1.20.0: Computer-Varianten

Optionaler `variants.schema: 1`-Zustand nur für `mode: computer` mit genau zwei Personen. Alte schema-1-Spielstände ohne Varianten bleiben gültig, Exportnamen und Geräteschlüssel bleiben gleich. Ein Variantenstand muss mit 1.20.0 oder neuer geöffnet werden; ältere Clients kennen seine Regeln nicht. Kein Netzwerk-Feature hinzugefügt; lokale Mehrspieler-, Direkt- und Raum-Konfiguration bieten die neuen Optionen nicht an. 42 atomare Offline-Dateien. [Regeln](computer-variants.md).


## Menüreihenfolge 1.19.4

Im Menü Zusammen steht Internet – Spielraum zuerst, danach Offline – mehrere Handys und Ein Handy weitergeben. Die drei bestehenden Ziele, Beschriftungen und Abläufe bleiben erhalten. Reine DOM-Reihenfolge; keine zusätzliche Anfrage, Spiel-/Push- oder Speicheränderung.


## Kompatibilität 1.19.3

Bestehender Direktprotokoll-2-/Schema-1-Stand, gleiche 40 Offline-Dateien, keine neue Fähigkeit. Lokales Verwerfen benötigt nur die aktualisierte App auf dem betroffenen Handy. Die anderen Geräte müssen dafür nicht erreichbar sein.


## Kompatibilität 1.19.2

Reines Client-Rendering mit Direktprotokoll 2, bestehenden Fähigkeiten und 40 atomaren Offline-Dateien. Alte Handys spielen weiter; für die sofort sichtbare Wurfvorschau das anzeigende Handy aktualisieren. Kein Daten-/Speichermigrationsschritt.


## Kompatibilität 1.19.1

Client-Update mit unveränderten Schema-1-Zugängen, Direktprotokoll 2 und 40 Offline-Dateien. Renderer-/CSS-Anpassung; keine neue Fähigkeit oder API-Erweiterung. Beide Geräte regulär aktualisieren.


## Kompatibilität 1.19.0

Normaler PWA-Updateweg, weiterhin 40 atomar gecachte Dateien und Schema 1. Optionales participants-Feld im vorhandenen Index/Übersichtscache; alte Zugänge ohne Namensliste bleiben gültig. Ältere Clients ignorieren die Ergänzung. Keine Migration oder Runtime-Variable; Spielstand und Zuordnungen bleiben erhalten.


## Kompatibilität 1.18.0

Optionale roomName/roomNameRevision-Felder ergänzen vorhandene Schema-1-Direktstände und Protokoll-2-Angebote. Alte unbenannte Sitzungen bleiben gültig; zum Anzeigen/Ändern des Namens beide Apps regulär aktualisieren. 40 Offline-Dateien, keine neue Fähigkeit, Migration oder Runtime-Konfiguration. Wiederkopplung setzt die gespeicherte Sitzung mit Namen fort.

## Kompatibilität 1.17.4

Normales PWA-Update auf beiden Handys. Bestehende Direktpartie bleibt lokal gespeichert; nach dem Neuladen beide bisherigen Spielerplätze erneut koppeln. Die feste lokale UDP-Beschreibung ist ein unverändertes Protokoll-2-Angebot/Antwort. Keine neue Fähigkeit, Migration, Secret oder Offline-Datei (weiterhin 40). Spiel-/Backupschema bleibt 1. Ältere Clients erhalten den Wiederkopplungs-Fix erst nach eigenem Update.

## Kompatibilität 1.17.3

Farbabschlüsse bleiben mit Spielername und Farbe während der gesamten Partie sichtbar, auch nach weiteren Würfen, Blattwechsel und Wiederaufnahme. Die Anzeige liest alle gespeicherten bestätigten Abschlüsse ohne Rundengrenze. Minen entfernen verlorene Abschlüsse und aktualisieren übertragene Farbprämien bereits in der gemeinsamen Engine; die Karten übernehmen diesen aktuellen Stand. Im verdeckten Spiel bleiben Prämienwerte und fremde Blätter verborgen. Kein zusätzlicher Timer, Push, Datenabruf oder neues Speicherformat.

## Kompatibilität 1.17.2

Darstellung, kurze deutsche Hinweise und klare Regelwahl vor dem Mehrspielerstart. Keine neue Fähigkeit, Migration, Abhängigkeit oder Speicherform; weiterhin Schema 1, Direktprotokoll 2 und 40 Offline-Dateien. Minen, Bonusfelder und Random bleiben an tatsächlich bestätigte Fähigkeiten ab 1.17.0 gebunden. Bei Raumspielen auf beiden/allen Handys aktualisieren und den Raum erneut öffnen. Nur das eigene Blatt bleibt im verdeckten Spiel während der Partie sichtbar; auch eigene Punkte erst am Ende.

## Kompatibilität 1.17.1

Layout-/Symbolkorrektur, unveränderte Spielregeln, Schema 1, Direktprotokoll 2, Fähigkeiten und 40 Offline-Dateien. Keine Migration oder neue Konfiguration. Installierte Apps regulär aktualisieren; begonnene Partien bleiben erhalten.

## Neu 1.17.0: Bonusfelder, Random und gemeinsame Minen

Drei geheime **Bonusfelder** vergeben je +2 an alle ersten Finder desselben Wurfs; Bekanntgabe erst nach der gemeinsamen Wertung, Punkte bleiben trotz Minen erhalten. **Random** erzeugt bei jedem neuen Start ein gemeinsames, gespeichert fortsetzbares Brett. Die optionale **Mine** trifft ein gewähltes Zielfeld bei allen aktiven Gegnern, einmal pro Person für insgesamt fünf Punkte. Die Explosion dauert drei Sekunden; Schadensmarkierungen bleiben bis Ende des nächsten Wurfs. Leere Ziele verursachen beim jeweiligen Gegner keinerlei Schaden.

**Partie verlassen** gibt sofort einen einmaligen Verlaufseintrag mit −10 Punkten und Niederlage. Die anderen spielen weiter; die letzte aktive Person gewinnt sofort. Im Internet wandert die Gastgeberrolle weiter. Offline bleibt das ursprüngliche Gastgeber-Handy als Zuschauer und Verbindung geöffnet; Verbindungsverlust pausiert sicher, ohne neue Autorität zu erfinden. Alle beteiligten Apps für neue Regeln auf 1.17.0 aktualisieren. [Bonusfelder](bonus-fields.md) · [Minen](mines.md) · [Random](random-board.md) · [Aussteigen](leaving.md).


## Datenformat 1.17.0

Spiel-/Backupschema 1 und Direktprotokoll 2 bleiben erhalten. Neue optionale Felder: geheime Bonuszustände, gespeichertes Random-Layout, Minen-Abschlussrunden/Angriffsliste und Spielerflags `left`, `forfeit: -10`, `leftRound`. Netzwerkprojektionen entfernen geheime Bonuskoordinaten und Minenregister, verdeckte Gegnerblätter bleiben verborgen. Neue Regeln erfordern bestätigte Fähigkeiten `bonus-fields-v1`, `random-board-v1`, `mines-v1`, `leave-game-v1`; Altstände ohne die jeweilige Option funktionieren weiter. 40 atomare Offline-Dateien, keine Migration oder Secrets. Ausstiegsstatistiken können verborgene unbekannte Gegnerwerte enthalten.

## Offline-Testprotokoll

Das freiwillige lokale A/B-Testprotokoll unterstützt Kopplungs- und Abgleichstests. [Anleitung](offline-diagnostics.md).

## Kompatibilität 1.15.0

Neue Internet-Push-Art `kind:rematch`, Ereignis `gameId:rematch`, Schema 1 mit unveränderten Gerätezugängen. Der aktive Worker muss `rematch-push-v1` melden. Additive Migration `0009_unique_stryfe.sql` ergänzt `rematch_ready INTEGER NOT NULL DEFAULT 0`; bestehende Worker bleiben bei Zug/Spielende. Neu: optionale Eventprüfung beim authentifizierten Status-GET. Reguläres PWA-Update auf beiden Geräten plus einmaliges Öffnen genügt. Weiterhin 36 Offline-Dateien, Spiel-/Backupschema 1, Direktprotokoll 2 und unveränderte VAPID-Secrets.

1.14.0 ergänzt additive Migration 0008, eigene Versandhistorie und das optionale Push-Feld dispatchAttempt. Schema 1 und alte Worker bleiben kompatibel; alte Quittungen ohne attempt gehören zum ersten Versuch. Neue Anzeige-/Prüfkorrekturen erfordern das normale PWA-Update. Kein neues Geheimnis, unveränderte 36 Offline-Dateien.

## Kompatibilität 1.13.0

`computerDifficulty` (easy/medium/hard) ist ein optionales Feld bestehender lokaler Computerpartien, Schema 1. Fehlend bedeutet alte Stärke Leicht; neue Partien verwenden standardmäßig Mittel. Die optionale Gerätepräferenz wird mit bisherigen Einstellungen exportiert. Unbekannte Stufen in importierten Computerpartien werden als ungültig abgewiesen. Ältere Clients kennen die neuen Strategien nicht; für deren Nutzung auf 1.13.0 aktualisieren. Räume, Regelengine, Direktprotokoll 2 und 36 Offline-Dateien bleiben unverändert. Keine Migration oder neuen Secrets.

## Kompatibilität 1.12.5

Neue JSON-Dateinamen: `YYYYMMDD_Farbfeld_Spielstand.json` mit lokalem Kalenderdatum. Backup-/Spielschema 1, Dateninhalt, Import, Datenbank und Direktprotokoll bleiben unverändert. Weiterhin 36 Offline-Dateien. Bestehende Sicherungen benötigen keine Umbenennung oder Konvertierung. Reguläres PWA-Update genügt.

## Kompatibilität 1.12.4

36 Offline-Dateien, unverändertes Push-Schema 1 und unveränderte Datenbank. Client und Worker gemeinsam aktualisieren, um Hintergrundstarts vor dem vorzeitigen Schließen ungelesener Hinweise zu schützen. Der neue Worker schützt auch `clear` von alten Clients. Keine Rotation von VAPID, keine Neuinstallation oder Migration. Die Diagnose unterscheidet Browser-Anzeigeanforderung von tatsächlicher sichtbarer Android-Ausgabe.

Die aktuelle maschinenlesbare Code-Version steht in public/version.json, alle Releases im [CHANGELOG](../CHANGELOG.md). Ein Sites-Speicherversionszähler ist nicht die Clientversion: Er identifiziert das gespeicherte Quell-/Build-Artefakt; die Clientversion versioniert die Offline-App.

| Gegenstand | Vertrag |
| --- | --- |
| Client | aktuell 1.18.0; semantische Version, Benachrichtigungen ab 1.7.0 |
| Direktprotokoll | 2, Gruppenunterstützung ab 1.4.0 |
| Lokale Spiele / Backup | Schema bzw. Backupversion 1 |
| Direkt-Speicher | `farbfeld.direct.v1`, Schema 1 |
| Neue Bretter / Reaktionen | zusätzliche Fähigkeiten ab 1.6.0; 👍/😲 benötigen `reactions-extra-v1` ab 1.12.0 auf Empfängern und Direkt-Gastgeber |
| Verdeckte Variante | Fähigkeit `hidden-scores-v1`; eigene Punkte ebenfalls verborgen ab 1.5.2 |
| Geräteprofil | ab 1.8.0, `farbfeld.stats.v1`, Schema 1; optionales `statistics` in bisherigen Backups |
| Internet-Raumname / Besetzung | ab 1.8.0; optionale JSON-Metadaten und hostautorisierte Lobby-Aktion, keine SQL-Migration |
| Update-Banner | ab 1.8.0 automatische Vordergrundprüfung, vollständig geladener Cache, freiwilliges Neuladen |
| Benachrichtigungen | Schema 1; automatische Raum-Pushs bis 24 Stunden, lokale/explizite Tests 60 Sekunden, eigener IndexedDB-Speicher |
| Manifest | ID `/play.html`, Start `/play`, Scope `/` |
| Internet-Raumregister | `farbfeld.rooms.v1`, kompatibler Auswahlzeiger `farbfeld.room.v1` |
| Datenbank | additive Drizzle-Migrationen bis 0009; zuletzt Workerfähigkeit `notification_devices.rematch_ready`, davor Zustell-Outbox/Verlauf 0008 |

Alte Spielstände ohne `boardId` sind Classic. Neue Bretter werden in Multiplayer nur mit entsprechend fähigen Clients gestartet; keine stillschweigende Umdeutung auf Classic. Direktnachrichten alter Protokolle erhalten eine verständliche Updatehilfe. Benachrichtigungen benötigen kein neues Spielprotokoll und ändern die Raum-Zugversion nicht.

Alte Internet-Räume ohne `roomName` zeigen den Standardnamen. Neue Antworten ergänzen `roomName` und `boardUpdateNeeded`; ältere Clients dürfen diese Felder ignorieren. `farbfeld.room.v1` bleibt unter demselben Schlüssel mit optionalem Namen erhalten. Eine Umbenennung erhöht die Raumversion, verändert aber nicht die Engine oder die Zugreihenfolge; abgelehnte veraltete Aktionen müssen mit dem aktuellen Stand wiederholt werden. Nur Mitglieder ohne laufende Partie können entfernt werden. Der alte Zugang eines entfernten Mitglieds ist sofort ungültig.

Ab 1.8.1 werden vorhandene Statistikeinträge nach Menschen, Computer und Solo getrennt ausgewertet; das Datenformat bleibt unverändert. Gegnerdetails werden aus denselben Einträgen berechnet, es entstehen keine neuen Konten, Identitäten oder Netzwerkdaten.

Neue Ergebnisse ergänzen `ownPid`; alte Einträge bleiben lesbar. Statistikmigration nutzt nur eindeutige Altzuordnungen, und Import führt Ergebnis-IDs ohne Doppelzählung zusammen. Die serverseitige Engine und ihre Speicherformate ändern sich nicht.

Ab 1.8.2 aktualisiert der Server die explizite Fähigkeitsmeldung bei jedem authentifizierten Raumabruf, falls sie vom gespeicherten Stand abweicht. Das greift auch für bestehende Clients ab 1.6.0/1.7.0, die diesen Header bereits senden, und für ältere Räume ohne neue Erstellung. Der neue Client verbessert den Hinweis und ergänzt „Raum neu prüfen“. Keine SQL-Migration; die Raumversion steigt nur bei geänderten Fähigkeiten.

Die automatische Updateprüfung selbst benötigt zunächst den neuen Client. Wer noch eine ältere PWA offen hat, aktualisiert für diesen Versionswechsel einmal über Einstellungen. Danach reicht der Banner; keine Deinstallation. Geräte-/Hotspot- und native Update-Abnahme bleiben getrennt von automatisierten und simulierten Browserprüfungen.

Ab 1.9.0 sind Präsenzdaten eine zusätzliche optionale GET-Eigenschaft; ältere Clients ignorieren sie. Die Daten liegen getrennt vom Spielstand. Neue Clients cachen ein zusätzliches Modul (33 Dateien). `lastActionAt`, `skipAvailableAt` und hostbezogenes `canSkip` sind zusätzliche Raum-Metadaten. Die 24-Stunden-Sperre gilt serverseitig auch für alte Oberflächen. Die Startkarte fragt nur bei bekannter laufender Partie automatisch weiter ab. Persönliche Ergebnisse verwenden auch beim Heimabruf die Mitglieds-ID.

Version 1.9.2 trennt das feste Farbfeld-Logo von den saisonalen Symbolen. Die vorhandene Offline-Datei `/icon.svg` wird wiederverwendet; weiterhin 33 Dateien, Schema 1 und Direktprotokoll 2. Keine Datenmigration oder neuen Abhängigkeiten. Installierte Apps erhalten die Korrektur über den normalen Updateweg.

Version 1.9.3 korrigiert asynchrone Push-Raumzuordnungen und ergänzt eine manuelle Statusprüfung. Die bestehende authentifizierte Statusantwort erhält nur optionale Diagnosefelder; alte Worker bleiben kompatibel. Push-Schema 1, Gültigkeit 60 Sekunden, Minutenlimit, Speicherformate, 33 Offline-Dateien und VAPID-Schlüssel bleiben erhalten. Keine Migration, neuen Abhängigkeiten oder zusätzlichen Poll-Timer. Höhere Web-Push-Zustellpriorität gilt nur für die unveränderten erlaubten Ereignisse.

Version 1.9.4 korrigiert nur die Darstellung der Raumkarte und ihre Statusaktualisierung. Weiterhin 33 Offline-Dateien; keine neue Fähigkeit, SQL-Migration, Abhängigkeit, API-Änderung oder zusätzlicher Timer. Bestehende Räume und installierte Spielstände bleiben kompatibel.

Version 1.9.5 ergänzt die Raumkarten-Korrektur um vollständige Namen im Spielkopf, kompakte Bestätigungszeilen und das Ausblenden gesperrter Würfel nach bestätigten Netzwerkzügen. Regeln, Zugzustände, Speicherschlüssel, Transport und 33 Offline-Dateien bleiben unverändert. Keine Migration oder zusätzliche API-Aufrufe.

## Releasepflege

1. `node scripts/release.mjs <neue-version>` ausführen. Es führt Clientversion, Manifest-Metadatum, Paketversion, `version.json` und Dokumentationsmarker nach und legt einen neuen Changelog-Abschnitt an.
2. Den neuen Changelog-Abschnitt ausfüllen, aktuelle Dokumentation inhaltlich aktualisieren und neue Offline-Dateien prüfen. Der erzeugte Platzhalter darf nicht veröffentlicht werden.
3. `npm run check:docs` prüfen: alle Pflichtunterlagen, Versionsgleichheit, Changelog-Eintrag, Assetzahl und lokale Dokumentlinks.
4. Relevante Tests/TypeScript ausführen und über [deployment.md](../deployment.md) veröffentlichen. Der Framework-Build führt die Dokumentationsprüfung automatisch vor dem Build aus.

Die Prüfung erkennt fehlende Dateien und inkonsistente Metadaten. Sie kann nicht entscheiden, ob jede Erklärung fachlich aktuell ist; diese Inhaltsprüfung ist gemäß [AGENTS.md](../AGENTS.md) Teil jeder Änderung.

Version 1.9.6 reduziert die Höhe der Startseiten-Raumkarte: Öffnen-Pfeil rechts statt separatem Button darunter, kleinere Abstände und weiterhin lesbare Raumdaten. Die Schaltfläche bleibt zugänglich beschriftet. Weiterhin 33 Offline-Dateien, unveränderte Speicherformate, API und Benachrichtigungen; keine Migration.

Version 1.9.7 ergänzt in der kompakten Raumkarte die bereits geladene Mitgliederzahl neben dem Code, direkt unter dem Namen. Im laufenden Spielraum gehören Name und unmittelbar folgende Metazeile nun zur selben Überschriftengruppe; die Zeile bleibt auch im Querformat sichtbar. Ohne geladene Liste bleibt die Zahl zunächst weg. Keine API-, Schema-, Cachelisten- oder Timeränderung.

Version 1.9.8 verlängert ausschließlich Server-Push beim Dienst auf bis zu 24 Stunden. Schema 1 ergänzt optional `deliveryExpiresAt`; das bisherige `expiresAt` bleibt eine Minute, damit ältere Worker sofortige Meldungen weiterhin anzeigen können. Die längere Frist benötigt den aktualisierten Worker. Direkte lokale Hinweise, Opt-in, Vordergrundsperre, Minutenlimit, Tag, Deduplizierung, Speicher- und Datenbankschemas bleiben unverändert. Weiterhin 33 Cache-Dateien; kein zusätzliches Polling, keine neue Bibliothek oder Migration.

Version 1.9.9 korrigiert leere Bereiche im Handy-Spielkopf mit gemeinsamer Titelzeile und voll genutzter Steuerungszeile. Die neue Responsive-Prüfanleitung gehört zur versionsgeprüften Dokumentation. 33 Offline-Dateien, alle Speicher-/Transportformate und Benachrichtigungen bleiben unverändert; keine neue Abhängigkeit oder Migration.

Version 1.9.10 korrigiert schrumpfende Würfelbereiche im niedrigen Querformat durch normalen Fluss und gemeinsames Scrollen der rechten Box. Kurzer Hinweis, vollständige Hilfe über **i**. Unverändert 33 Offline-Dateien, Speicher-/Transportformate, Regeln und Push; keine neue Abhängigkeit oder Migration.

Die Reaktionskorrektur in 1.9.10 ergänzt `senderId` in bestehenden Ereignissen und einen lokalen Anzeigecursor `farbfeld.reactions.seen.v1`. Featurekennung `reactions-v1` und SQL-Schema bleiben kompatibel; ältere Empfänger blenden den ersten Abruf weiterhin aus und müssen für den Fix aktualisieren. Der Server liefert nur die neueste passende Reaktion je Absender bis zu 24 Stunden zurück. Keine Änderung an Zug-/Backupformaten, 33 Offline-Dateien, Push oder Polling; Direktreaktionen bleiben live.

Version 1.10.0 ergänzt optionale Reaktionsfelder `scale` (1–2,5) und `motion` (`fly`, `bounce`, `loop`). Feature `reactions-v1`, Direktprotokoll 2, Spiel-/Backupschema 1, Push und 33 Offline-Dateien bleiben erhalten. Additive Migration 0005 ergänzt zwei Spalten in `room_reactions` mit Normalgrößen-/Flugdefaults. Alte Clients/Worker bleiben kompatibel; für Haltegeste und vollständige Effekte alle beteiligten Apps aktualisieren. Keine neuen Abhängigkeiten, Secrets oder Bindings.

1.10.1 ersetzt die Klick-Abhängigkeit beim Emoji-Loslassen durch direkte Pointer-/Tastaturaktivierung mit Schutz vor Folge-Klicks. Keine Änderung an Nutzdaten, Features, Protokollen, Schemata, 33 Cache-Dateien oder Server; Sender aktualisieren. Bestehende Raum-/Direktpartner empfangen unverändert.

1.10.2: Internet-Räume ohne automatische Ablaufzeit. Bestehende Zeilen mit alter sieben Tage nach Erstellung gesetzter Frist bleiben erreichbar. `rooms.expires_at` bleibt unverändert im Schema, neue Räume schreiben 0; keine Migration oder Backfill. Spiel-/Backupschema 1, Direktprotokoll 2 und Featurekennungen unverändert; 33 Cache-Dateien. Neue Clients korrigieren den bisherigen 404-Text. Ältere Server wenden ihre Frist wieder an und würden neue Räume mit Wert 0 sperren; für einen Rollback ausschließlich eine Version mit dieser Korrektur verwenden.

1.11.0 führt `farbfeld.rooms.v1` für mehrere Gerätezugänge ein; der einzelne `farbfeld.room.v1`-Eintrag wird übernommen und als Auswahlzeiger erhalten. Keine Raumtokens in Schema-1-Backups. Migration 0006 ergänzt eine Nutzungszeitspalte mit konstantem Default 0, zwei Tabellen und passende Indizes. Historische Migrationen bleiben unverändert. Bestehende Räume erhalten bei der ersten Erfassung durch die Bereinigung eine volle Schonfrist; neue Räume setzen 14 Tage nach letzter echter Nutzung. Kein Zugangsfilter anhand dieses Termins.

API-Ergänzungen: `open`, kompakter `index` für maximal 50 eigene Zugänge, Notification-`bind-rooms` und raumspezifisches `status`. Meldungsschema 1 und Direktprotokoll 2 unverändert; Worker-`seen-list` neu. Ältere Clients können ihre einzelne Raumansicht weiter nutzen; mehrere Räume und zielraumspezifische Push-Prüfung benötigen das Update. Ein Server-Rollback vor 1.11.0 unterstützt die neuen Endpunkte nicht; nur entsprechend kompatibel reparierte Versionen einsetzen. PWA: 34 atomar gecachte Dateien, einschließlich `room-book.js`; keine neue CDN-Abhängigkeit.

1.11.1 korrigiert ausschließlich den Server-Push-Transport und seine Regression/Fehlerklassen. `manual` statt des in workerd ungültigen `error`-Redirect-Modus; 3xx bleibt gesperrt. Push-Schema 1, API, Spiel-/Backupschema 1, Direktprotokoll 2, Migrationen und 34 Offline-Dateien bleiben erhalten. Der Serverfix benötigt keine erneute Anmeldung, Subscription oder VAPID-Rotation; normale Aktualisierung bietet Client 1.11.1 an. Vor 1.11.1 wieder veröffentlichte Sender mit `redirect: "error"` würden den Fehler erneut einführen.

1.11.2 ergänzt additive Migration 0007 (`notification_devices.delivery`, nullable) sowie authentifizierte Notification-Aktionen `test-push` und `receipt`. Status-GET enthält ausschließlich projizierte letzte Diagnose und eine kurzlebige persönliche Testfreigabe. Normale Pushs behalten Schema 1; explizite Tests verwenden `kind:test, mode:test` mit 60-Sekunden-Frist und benötigen die neue Workerfähigkeit `push-test-v1`. Gerätegeheimnisse und Subscriptions bleiben gültig; keine Schlüsselrotation oder Neuinstallation. Spiel-/Backupschema 1, Direktprotokoll 2, 34 Offline-Dateien und bisherige API-Aktionen erhalten.

Prüfstand 1.11.2 am 05.11.2026: `physicalAndroidPushVerified:true` mit explizitem Scope `internet-self-test`, Nutzerbestätigung und gespeicherter Gerätequittung. `automaticBackgroundTurnVerified:false` kennzeichnet den noch offenen Hintergrund-Zugtest. Reine Evidenzkorrektur ohne neue Clientfunktionen oder geänderte Benachrichtigungsregeln; Versionsnummer bleibt 1.11.2.

1.12.0: Hunde/Pfote und Geburtstag/Ballon ergänzen bestehende lokale Design-IDs; alte Backups bleiben gültig. Das lokale Designmodul ist im Cache enthalten (35 Dateien). Keine SQL-Migration oder Änderung von Spiel-/Push-Schema und Direktprotokoll. Explizite Tonwahl erlaubt ersetzende neue Hinweise; kein zusätzlicher Versand.

1.12.1: Kompakterer Startseitenabstand und zweifarbige Überschriften. Reine Darstellung; Offline-Dateizahl, Speicherformate, Server-API und Protokolle unverändert.

1.12.2: Eine lokale braune Einzelpfote ersetzt das Hunde-Emoji. 36 atomare Offline-Dateien inklusive `paw.svg`; alle Speicherformate, Protokolle und Server-APIs unverändert.

1.12.3: Lokale und Offline-Direktpartien werden oben nach Internet-Räumen und vor dem Hero angeordnet. Keine Änderung an Speicherung, Protokollen, Server-API oder den 36 Offline-Dateien.
