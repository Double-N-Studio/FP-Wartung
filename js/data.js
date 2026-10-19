const DATA = {
  daily: [
    {
      title: "Außen-Check",
      items: [
        "Rumpf, Flügelober- u. Unterseite, sowie Leitwerk auf Beschädigung prüfen (Risse, Beulen etc.).",
        "Hauptfahrwerk auf Freigängigkeit, Lagerspiel und Beschädigung prüfen. Rutschmarken und Luftdruck kontrollieren.",
        "Entwässerungslöcher auf Sauberkeit und Dichtheit prüfen.",
        "Haube u. Haubenfenster auf Beschädigung (Risse) prüfen, richtigen Sitz und Sauberkeit kontrollieren, ggf. reinigen.",
        "Linkes Querruder auf Beschädigungen, Leichtgängigkeit u. Lagerspiel prüfen.",
        "Statische Druckabnahme (Rumpf links) auf freien Zugang prüfen.",
        "Kompensationsdüse ins Leitwerk eingesteckt.",
        "Staurohr auf Beschädigungen prüfen.",
        "Höhenruder auf richtigen Sitz und korrekten Anschluss prüfen. Spielfreiheit u. Leichtgängigkeit kontrollieren. Rändelschraube auf festen Sitz prüfen und Anschlussloch abkleben.",
        "Seitenruder auf Beschädigung u. Freigängigkeit der Lager prüfen. Steuerseilanschlüsse auf richtigen Anschluss und die Anschlussschrauben kontrollieren.",
        "Schleifsporn auf festen Sitz kontrollieren.",
        "Statische Druckabnahme (Rumpf rechts) auf freien Zugang prüfen.",
        "Rechtes Querruder auf Beschädigungen, Leichtgängigkeit u. Lagerspiel prüfen.",
      ],
    },
    {
      title: "Cockpit · von außen",
      items: [
        "Steuerknüppel auf Spielfreiheit und festen Sitz prüfen.",
        "Kunststoffrohre in der S-Förmigen Rohren der Seitenruderpedale auf festen Sitz prüfen.",
        "Hauptbolzensicherung auf richtigen Sitz prüfen.",
        "Hotelier-Anschlüsse der Querruder und Bremsklappen prüfen. Sicherungshülsen auf richtigen Sitz prüfen.",
        "Batterien fest, sicher eingebaut und mit dem Bordnetz verbunden.",
        "Fremdkörperkontrolle, Sauberkeit des Cockpits prüfen (ggf. aussaugen)",
        "Gültige Bordpapiere (Bordbuch, Betriebshandbuch) vorhanden.",
      ],
    },
    {
      title: "Cockpit · von innen",
      items: [
        "Funktion der Instrumente prüfen, Sprechprobe durchführen.",
        "Ruderkontrolle Durchführen.",
        "Radbremse prüfen.",
        "Zustand und Funktion der Schleppkupplung prüfen. Ausklinkproben.",
      ],
    },
  ],
  winter: [
    {
      group: "Flügel",
      title: "Putzen",
      text: "Putzen mit Spüliwasser. Auch die Bremsklappen und der Bremsklappenkasten.",
    },
    {
      group: "Flügel",
      title: "Entfetten/ Klebereste",
      text: "Entfetten und Klebereste entfernen mit Waschbenzin",
    },
    {
      group: "Flügel",
      title: "Zustand prüfen\nInkl. Querruder und Bremsklappen",
      text: "Die Gesamte Tragfläche auf Lackzustand, Beschädigungen und andere Fehler prüfen! Wenn vorhanden, dann erst beheben vor weiteren Schritten.\nDie Querruder-Sandwichschale ist besonders druckempfindlich. \nBei Druckstellen Wartungshandbuch konsultieren.\nKontrolle der Lagerung auf Korrosion und Verklemmen unter Last. Dazu an jedem Hebel mit 25 kg nach hinten ziehen und dabei einfahren",
    },
    {
      group: "Flügel",
      title: "Polieren",
      text: "Polieren mit Rotationsmaschine und feiner Schleifpolitur",
    },
    {
      group: "Flügel",
      title: "Bänder",
      text: "Gewebeband und Abdichtbänder kontrollieren ggf. erneuern.\nSiehe Wartungshandbuch Abschnitt 4.2.2.1.\nZackenband auf Flügelunterseite kontrollieren und ggf. erneuern",
    },
    {
      group: "Flügel",
      title: "Wachsen",
      text: "Mit Watte wachs auftragen. Nach Ablüftzeit mit Mikrofasertuch abpolieren.",
    },
    {
      group: "Flügel",
      title: "Buchsen fetten",
      text: "Hauptbolzenbuchsen und Querkraftbolzen fetten. \nKugeln der Ruderanschlüsse fetten.",
    },
    {
      group: "Flügel",
      title: "Wassersäcke",
      text: "Wassersäcke auf Dichtigkeit prüfen",
    },
    {
      group: "Rumpf",
      title: "Putzen",
      text: "Rumpf Aussaugen. Schwerpunkt- und Bugkupplung mit Druckluft ausblasen.\nLack und Innenraum mit Spüliwasser wischen. Hydraulikölflecken mit Waschbenzin entfernen. Sitzwanne ausbauen",
    },
    {
      group: "Rumpf",
      title: "Entfetten/ Klebereste",
      text: "Hauptbolzen, Querkraftbuchsen und Kupplung der Ruderanschlüsse entfetten.\nAlle Klebereste entfernen.\nAlles mit Waschbenzin! KEIN Aceton auf Lack!",
    },
    {
      group: "Rumpf",
      title: "Zustand prüfen\nInkl. Haubennotabwurf\nSl Bänder",
      text: "Die Gesamte Tragfläche auf Lackzustand, Beschädigungen und andere Fehler prüfen! Wenn vorhanden, dann muss es erst behoben werden. \nHaubennotabwurf und Rögerhaken gemäß Abschnitt 4.9 im Wartungshandbuch überprüfen\nSpaltabklebungen am Höhen- und Seitenrudern auf Vorhandensein\nund Beschädigungen überprüfen und gegebenenfalls gemäß\nAbschnitten 4.2.3 und 4.2.4 erneuern.",
    },
    {
      group: "Rumpf",
      title: "Fahrwerk",
      text: "Dreck aus Fahrwerkskasten entfernen.\nAlle Gelenke am Fahrwerk mit Maschinenöl schmieren.\nVerknievorspannung sollte 12-15kg sein.\nGummi-Federelemente auf Verformung sowie Verbindung zwischen Gummi und Metall auf Ablösung oder Risse kontrollieren.",
    },
    {
      group: "Rumpf",
      title: "Polieren",
      text: "Polieren mit Rotationsmaschine und feiner Schleifpolitur",
    },
    {
      group: "Rumpf",
      title: "Wachsen",
      text: "Mit Watte wachs auftragen. Nach Ablüftzeit mit Mikrofasertuch abpolieren.",
    },
    {
      group: "Rumpf",
      title: "Fetten/Schmieren",
      text: "Hauptbolzen und Querkraftbuchsen fetten. \nKupplung der Ruderanschlüsse fetten.\nBug- und Schwerpunktkupplung mit Sprühöl schmieren.",
    },
    {
      group: "Rumpf",
      title: "Batterien/Avionik",
      text: "Stromsystem durchtesten.LX Update Flarm Update. Batteriekapazitäten mit Messgerät messen und mit Labelmaker Zustand aufkleben",
    },
    {
      group: "Rumpf",
      title: "Sitzwanne einbauen",
      text: "Nach Fremdkörperkontrolle durch befugtes Personal kann die Sitzwanne wieder eingebaut werden",
    },
    {
      group: "Höhenleitwerk",
      title: "Putzen",
      text: "Putzen mit Spüliwasser.",
    },
    {
      group: "Höhenleitwerk",
      title: "Entfetten/\nKlebereste",
      text: "Alle Klebereste und Fett in Buchsen entfernen entfernen.\nAlles mit Waschbenzin! KEIN Aceton auf Lack!\nBuchsen neu fetten!",
    },
    {
      group: "Höhenleitwerk",
      title: "Bänder",
      text: "Spaltabklebungen am Höhen- und Seitenrudern auf Vorhandensein\nund Beschädigungen überprüfen und gegebenenfalls gemäß\nAbschnitten 4.2.3 und 4.2.4 erneuern.",
    },
    {
      group: "Höhenleitwerk",
      title: "Polieren und wachsen",
      text: "Polieren mit Rotationsmaschine und feiner Schleifpolitur.\nMit Watte wachs auftragen. Nach Ablüftzeit mit Mikrofasertuch abpolieren.",
    },
    {
      group: "Anhänger",
      title: "Aussaugen/\nAuswischen",
      text: "Anhänger und Teppich aussaugen.\nDanach Hänger auswischen",
    },
    {
      group: "Anhänger",
      title: "Teppich kontrollieren/erneuern",
      text: "Gesamten Teppich kontrollieren und ggf erneuern.",
    },
    {
      group: "Anhänger",
      title: "Stauraum kontrollieren/ Gasfedern",
      text: "Stauraum vorne aussaugen auswischen.\nDort sollten folgende Dinge lagern: Kopie Fahrzeugschein, Ersatzreifen, Wagenheber und Radmutterschlüssel",
    },
    {
      group: "Anhänger",
      title: "Putzen/Schwabbeln",
      text: "Anhänger außen mit <Hochdruckreiniger abdampfen und mit Schwamm und wasser restlichen Dreck entfernen.",
    },
    {
      group: "Anhänger",
      title: "Wachsen",
      text: "Mit Autowachs von außen versiegeln",
    },
    {
      group: "Anhänger",
      title: "Reifen",
      text: "Reifendruck in allen Reifen überprüfen. Alter von Reifen checken. Bei 100er Hänger darf er nicht älter als 6 Jahre sein. Bei 80er Hänger sollten sie alle 10 Jahre getauscht werden.",
    },
  ],
  fleet: [
    {
      name: "ASK 21 B",
      reg: "Kennzeichen ergänzen",
      img: "assets/images/fleet/plane-0.jpg",
    },
    {
      name: "Ka 6 E",
      reg: "Kennzeichen ergänzen",
      img: "assets/images/fleet/plane-1.jpg",
    },
    {
      name: "Astir CS",
      reg: "Kennzeichen ergänzen",
      img: "assets/images/fleet/plane-2.jpg",
    },
    { name: "LS 4 a", reg: "D-5104", img: "assets/images/fleet/plane-3.jpg" },
    {
      name: "Discus 2b",
      reg: "Kennzeichen ergänzen",
      img: "assets/images/fleet/plane-4.jpg",
    },
    {
      name: "ASH 26 E",
      reg: "Kennzeichen ergänzen",
      img: "assets/images/fleet/plane-5.jpg",
    },
    {
      name: "ASK 21 Mi",
      reg: "Kennzeichen ergänzen",
      img: "assets/images/fleet/plane-6.jpg",
    },
    {
      name: "Dynamic WT9",
      reg: "Kennzeichen ergänzen",
      img: "assets/images/fleet/plane-7.jpg",
    },
  ],
};
