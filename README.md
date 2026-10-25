# ACL Technik – Wartungs-Web-App (Prototyp)

Tablet-optimierte Web-App für den **Aero-Club Langenselbold**: Vorflugkontrolle und Mängelmeldungen im
Flugbetrieb, Planung der Winterwartung und Arbeiten im laufenden Jahr – für die gesamte Vereinsflotte.

> **Status: klickbarer Prototyp.** Alle Daten liegen nur im Browser (LocalStorage). Kein Backend, keine
> echte Anmeldung, keine Anbindung an Vereinsflieger. Nicht als Freigabe- oder Wartungsnachweissystem
> verwenden.

## Funktionen

**Flugbetrieb**

- Flottenübersicht mit Status pro Flugzeug: `KLAR`, `CHECK OFFEN`, `UNKLAR`; Filter und Suche
- Tageskontrolle in drei Schritten: Mängelübersicht → Checkliste (ASK 21 B: 26 Punkte, LS4a: 24 Punkte) → Bestätigung mit
  Unterschrift (Finger/Stift) und Demo-PIN
- Mängelmeldungen mit Einstufung (sperrend / Pilotenhinweis / kosmetisch), Kategorie, Position und bis zu
  vier komprimierten Fotos
- Mängel bearbeiten, mit Name und Behebungsvermerk abschließen und mit Begründung wieder öffnen;
  ursprüngliche Angaben und Änderungen bleiben im Verlauf erhalten
- Sperrende Mängel setzen das Flugzeug automatisch auf `UNKLAR`

**ACL-Winde**

- Separate Gerätekarte mit Vereinsfoto; gehört nicht zur Flugzeugflotte oder Winterplanung
- Gemeinsame Mängelverwaltung einschließlich Fotos, Bearbeiten, Abschluss und Verlauf
- Tagesprotokoll und Ablauf für Dienstbeginn in `js/winch/`; Prüfpunkte separat unter
  `js/winch/checklists/start.js`
- **Vereinsvorlage für Dienstbeginn fehlt noch:** keine erfundenen Prüfpunkte;
  Bestätigung bleibt gesperrt, bis Revision, Originalquelle und Prüfpunkte hinterlegt sind
- Fotoquelle: <https://ac-langenselbold.de/flugzeuge/> (Winde, Vereinsfoto)

**Winterwartung**

- Gantt-Plan für sieben Segelflugzeuge (ohne Dynamic WT9), Reihenfolge per Drag-and-drop oder ↑/↓
- Einstellbarer Zeitraum (Standard November – März) und Überschneidung zwischen Flugzeugen
- Soll-/Ist-Vergleich zu einem Stichtag, Fortschritt „bearbeitet“ und „geprüft“
- Wochenendübersicht der anstehenden Arbeiten
- Aufgabenpakete (Flügel, Rumpf, Höhenleitwerk, Anhänger) mit Vier-Augen-Prinzip: durchgeführt → geprüft

**Arbeiten im laufenden Jahr**

- Jahresarbeiten pro Flugzeug, inkl. erneutem Wachsen bis 30. Juni
- Arbeiten direkt aus Mängeln oder Befunden anlegen (mit Verknüpfung und Fotos)

**Sonstiges**

- Export aller Testdaten als JSON, Zurücksetzen der Demo
- Installierbar als Web-App (Manifest + Icons); kein Service Worker, also kein Offlinebetrieb

## Schnellstart

Kein Build-Schritt, keine Abhängigkeiten – ein beliebiger statischer Webserver genügt:

```bash
python3 -m http.server 8000
```

Danach <http://localhost:8000> öffnen. Für die Installation auf Tablets muss die App über HTTPS
ausgeliefert werden.

Demo-PIN für alle Bestätigungen: **1234** (nur Ablaufdemo, keine Authentifizierung).

## Projektstruktur

```
.
├── index.html               Einstieg, App-Gerüst und Dialoge
├── manifest.webmanifest     Web-App-Metadaten
├── css/                     Styles (Ladereihenfolge in index.html ist relevant)
│   ├── base.css             Variablen, Grundlayout, Komponenten, Basis-Responsive
│   ├── issues.css           Mängelfotos
│   ├── fleet-overview.css   Flottenkacheln, Tablet-Layout der Tagesübersicht
│   ├── status-and-gantt.css Flugzeugstatus, Mängel-Einstufung, Gantt-Zeilen
│   ├── daily-check.css      Kachel-Aktionen, Warnhinweise in der Kontrolle
│   ├── planning-period.css  Zeitraumwahl und Kalendermonate im Gantt
│   ├── work-progress.css    Planungseinstellungen, Fortschrittsbalken, Arbeitsformulare
│   ├── annual-work.css      Arbeiten im laufenden Jahr
│   └── weekend.css          Wochenendübersicht
├── js/
│   ├── data.js              Flotte, LS4a-Tageskontrolle und Wintercheckliste
│   ├── core/
│   │   ├── utils.js         DOM-, Datums- und Formatierungshilfen, Toast
│   │   ├── state.js         LocalStorage-Zustand, Export, Reset
│   │   ├── ui-state.js      Flüchtiger UI-Zustand (Ansicht, Filter, Auswahl)
│   │   └── dialog.js        Gemeinsamer Detaildialog
│   ├── daily/               Flugbetrieb
│   │   ├── checklists/ask21b.js  ASK-21B-Tageskontrolle aus dem Original-PDF
│   │   ├── checklists.js     Zuordnung, Dokumente und Anzahl der Prüfpunkte
│   │   ├── status.js        Statuslogik pro Flugzeug
│   │   ├── fleet-overview.js
│   │   ├── daily-check.js   Ablauf der Tageskontrolle
│   │   ├── issues.js        Mängelmeldungen und Fotos
│   │   ├── issue-lifecycle.js Bearbeitung, Abschluss und Änderungsverlauf
│   │   └── signature.js     Unterschrift und Abschluss
│   ├── work/                Arbeitsmodell (Winter- und Jahresarbeiten)
│   │   ├── work-items.js    Aufgaben, Fortschritt, eigene Arbeiten
│   │   ├── task-dialog.js   Aufgabenliste und Bearbeitung
│   │   └── work-form.js     Neue Arbeit anlegen
│   ├── winter/              Winterwartung
│   │   ├── planning.js      Zeitraum, Reihenfolge, Zeitplan
│   │   ├── reorder.js       Drag-and-drop im Gantt
│   │   ├── weekend.js       Wochenendübersicht
│   │   └── winter-view.js   Hauptansicht mit Gantt
│   ├── annual/
│   │   └── annual-work.js   Arbeiten im laufenden Jahr
│   └── main.js              Einstiegspunkt (render), wird zuletzt geladen
└── assets/
    ├── images/fleet/        Vereinsfotos der Flugzeuge (plane-0 … plane-7)
    ├── icons/               App-Icons
    └── docs/                Originalvorlagen (Tageskontrollen PDF, Winterwartung DOCX)
```

### Architektur-Hinweise

- **Vanilla JS, kein Framework, kein Bundler.** Die Skripte sind klassische `<script>`-Dateien mit
  gemeinsamem globalem Gültigkeitsbereich, weil die Oberfläche Inline-Handler (`onclick="…"`) nutzt.
  Neue Dateien in `index.html` vor `js/main.js` einbinden.
- **Rendering** erfolgt über Template-Strings in `innerHTML`; Benutzereingaben laufen immer durch
  `esc()` (`js/core/utils.js`).
- **Zustand** ist ein einzelnes Objekt `state`, das mit `save()` unter dem Schlüssel
  `acl-tech-demo-v1` im LocalStorage abgelegt wird. Fotos und Unterschriften werden als Data-URLs
  gespeichert – das LocalStorage-Limit (≈ 5 MB) ist schnell erreicht.
- **CSS-Reihenfolge**: Die Stylesheets überschreiben teilweise frühere Regeln; die Reihenfolge der
  `<link>`-Tags nicht ändern, ohne das Ergebnis zu prüfen.

### Windenbetrieb erweitern

Die Winde liegt unter `DATA.winch`, ihr Mängelschlüssel ist `winch`.
Tagesprotokolle werden unter `state.winch.days[Datum]` gespeichert. So bleiben die acht
Flugzeuge, ihre bisherigen Indizes, Winterreihenfolge und Jahreswachspflichten unverändert.
Winden-Prüfpunkte werden ausschließlich aus der konkreten Vereinsvorlage in das getrennte
Checklistenmodul übernommen. Ohne Vorlage kann kein Dienstbeginn bestätigt werden.
Ein neuer Tag erhält ein eigenes Protokoll; alte Mängel bleiben offen, bis sie beendet werden.

### Daten anpassen

Flotte, LS4a-Tagescheckliste und Winteraufgaben stehen in [`js/data.js`](js/data.js).
Die Tageskontrolle der **ASK 21 B (D-7209)** steht separat in
[`js/daily/checklists/ask21b.js`](js/daily/checklists/ask21b.js). Die Zuordnung zu Flugzeugen,
Originaldokumenten und Revisionen erfolgt in [`js/daily/checklists.js`](js/daily/checklists.js).
Die Anzahl der Prüfpunkte wird daraus für Fortschrittsanzeige und Abschlussprüfung berechnet.

- ASK 21 B: 26 Prüfpunkte (15 Außen-Check, 7 Cockpit von außen, 4 Cockpit von innen),
  Rev. 1.0 vom 25.05.2020; Quelle: [`assets/docs/daily-ask21b.pdf`](assets/docs/daily-ask21b.pdf).
  Die beiden PDF-Seiten enthalten dieselbe Checkliste, die nur einmal übernommen wurde.
- LS 4 a (D-5104): 24 Prüfpunkte; bestehende Inhalte und gespeicherte Eingaben bleiben erhalten.
- Winter-Originalcheckliste weiterhin nur für die LS4a vorhanden.

### Prüfungen

Mit Node.js (ohne zusätzliche Pakete):

```bash
node --test tests/*.test.cjs
```

Geprüft werden Checklisten-Zuordnung, Prüfpunkte, Abschlussprüfung, Dokumentlinks und
die bestehende LS4a-Kontrolle. Eine manuelle Prüfung im Browser ergänzt diese Logiktests.

### Formatierung

```bash
npx prettier --write "js/**/*.js" "css/*.css"
```

## Bekannte Einschränkungen

- Daten nur lokal im jeweiligen Browser – keine gemeinsame Datenbank, kein Abgleich zwischen Geräten
- Feste Demo-PIN statt Benutzerverwaltung
- Tageschecklisten für ASK 21 B und LS4a; Wintercheckliste nur für LS4a
- Kein Offlinebetrieb (kein Service Worker)

## Geplante Integration

- Anbindung an den vereinseigenen Server und die bestehende Technik-Website
- Gemeinsame Datenhaltung, fest eingerichtete Vereinstablets und Vereinslogin für Mitglieder zu Hause
- Persönliche Bestätigung beim Abschluss von Kontrollen und Arbeiten

Serverumgebung und bestehende Anmeldung sind noch zu prüfen.

## Rechte

Vereinsfotos und Dokumente gehören dem Aero-Club Langenselbold. Mit diesem Repository wird keine
allgemeine Nutzungs- oder Veröffentlichungslizenz erteilt; das Repository sollte privat bleiben.
