// Persistenter Zustand im LocalStorage, Export und Reset
const KEY = "acl-tech-demo-v1";
let state;
try {
  state = JSON.parse(localStorage.getItem(KEY));
} catch {}
function initial() {
  return {
    issues: {
      0: [
        {
          text: "Beispiel: Auffälligkeit am Haubenverschluss – technische Bewertung steht aus.",
          date: today(),
          open: true,
        },
      ],
    },
    daily: {},
    winter: {},
    archive: [],
  };
}
state = state || initial();
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    toast("Speichern fehlgeschlagen. Testdaten bitte exportieren.");
    return false;
  }
}
function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    }),
    a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "acl-technik-testdaten.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function resetData() {
  if (confirm("Alle lokalen Demo-Eingaben und Testprotokolle zurücksetzen?")) {
    state = initial();
    save();
    render();
  }
}
