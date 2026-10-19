# ACL Technik – Web-App-Prototyp

Stand: 19.10.2026. Snapshot des aktuellen Prototyps.

## Technik

HTML, CSS und JavaScript ohne Framework und ohne Build-Schritt.
Installations-Metadaten im Web-App-Manifest, Icons und responsive Tablet-Oberfläche.
Kein Service Worker: kein vollständig umgesetzter Offlinebetrieb.

## Lokal starten

ZIP entpacken, in den Projektordner wechseln und mit Python starten:

```sh
python -m http.server 8000
```

Danach http://localhost:8000 öffnen. Je nach Installation heißt der Befehl python3.
Für die Installation als Web-App auf Tablets später über HTTPS bereitstellen.

## Dateien

- index.html: Einstieg und Dialoge
- style.css: Layout und Tabletansichten
- app.js: Abläufe, Zustände, Wartungsplanung, Mängel und Checklisten
- data.js: Flotte und aus den LS4a-Vorlagen übernommene Checklisten
- manifest.webmanifest: Web-App-Metadaten
- assets/: Vereinsfotos, Icons und ursprüngliche LS4a-Vorlagen

## Funktionen

Flottenkacheln mit Vorflugkontrolle und Status; klassifizierte Mängel mit Fotos;
Unterschriftsdemo; Winterplanung für sieben Segelflugzeuge, ohne Dynamic;
Gantt mit einstellbarem Zeitraum und Reihenfolge; Wochenendübersicht;
Zusatzarbeiten und Jahresarbeiten einschließlich erneutem Wachsen bis 30. Juni.

## Aktueller Entwicklungsstand

Alle Eingaben liegen ausschließlich im LocalStorage des jeweiligen Browsers
(Schlüssel acl-tech-demo-v1). Es gibt keine gemeinsame Datenbank, kein Backend,
keine echte Benutzerverwaltung und keine Anbindung an Vereinsflieger.
Die feste PIN 1234 dient nur der Ablaufdemo und ist keine Authentifizierung.
Nur für die LS4a sind Originalchecklisten hinterlegt.
Keine Nutzung als produktives Freigabe- oder Wartungsnachweissystem ohne die
noch ausstehende fachliche und technische Fertigstellung.

## Geplante Integration

Anbindung an den vereinseigenen Server und Vlads Technikwebsite.
Gemeinsame Datenhaltung, dauerhaft eingerichtete Vereinstablets und vorhandener
Vereinslogin für Mitglieder zu Hause; persönliche Bestätigung beim Abschluss.
Die Serverumgebung und bestehende Anmeldung sind noch zu prüfen.

## Weitergabe

Zum gemeinsamen Entwickeln zunächst ein privates GitHub-Repository verwenden.
Vereinsfotos und Dokumente sind enthalten; keine allgemeine Veröffentlichungslizenz
wird mit diesem Snapshot erteilt. Browser-Testdaten sind nicht enthalten.
Git-Metadaten und ChatGPT-Sites-Deploymentkonfiguration sind nicht enthalten.
