// Tagesstarts pro Seil/Trommel. Speichern ersetzt Tageswerte, addiert sie nicht.
let winchLaunchDirty = false;
function parseWinchLaunches(value) {
  const text = String(value).trim();
  if (!/^\d+$/.test(text)) return null;
  const number = Number(text);
  return Number.isSafeInteger(number) && number >= 0 ? number : null;
}
function winchLaunchesValid(launches) {
  return !!launches && [launches.drum1, launches.drum2].every(n => Number.isSafeInteger(n) && n >= 0)
    && Number.isSafeInteger(launches.drum1 + launches.drum2);
}
function saveWinchLaunches(drum1, drum2) {
  if (!winchDayEditable()) return false;
  const r = winchRecord(winchActiveDate).end;
  if (r.signed) { toast("Das Dienstende ist bereits bestätigt."); return false; }
  const launches = { drum1: parseWinchLaunches(drum1), drum2: parseWinchLaunches(drum2) };
  if (!winchLaunchesValid(launches)) { toast("Für beide Trommeln eine ganze, nicht negative Startzahl eingeben. Null ist möglich."); return false; }
  const before = r.launches;
  r.launches = launches;
  if (!save()) { r.launches = before; return false; }
  winchLaunchDirty = false;
  $("#launchCountState").textContent = `${launches.drum1 + launches.drum2} Tagesstarts gespeichert`;
  updateWinchCount("end");
  toast("Startzahlen für Trommel 1 und 2 gespeichert");
  return true;
}
function winchLaunchTotals() {
  return Object.values(state.winch?.days || {}).reduce((total, day) => {
    const launches = day.end?.signed?.launches;
    if (winchLaunchesValid(launches)) {
      total.drum1 += launches.drum1;
      total.drum2 += launches.drum2;
    }
    return total;
  }, { drum1: 0, drum2: 0 });
}
function winchEndHTML() {
  const r = winchRecord(winchActiveDate).end;
  return `${winchChecklistHTML("end")}<form id="winchLaunchForm"><h3>Starts heute pro Seil</h3><p class="small muted">Tagesanzahl, kein fortlaufender Zählerstand. Beide Trommeln ausfüllen; auch 0 ist ein gültiger Wert.</p><div class="fields">${[1, 2].map(n => `<label>Trommel ${n} / Seil ${n}<input id="drum${n}" name="drum${n}" type="text" inputmode="numeric" pattern="[0-9]+" required value="${r.launches?.['drum'+n] ?? ""}" ${r.signed ? "disabled" : ""} oninput="winchLaunchDirty=true;$('#winchConfirm').disabled=true;$('#launchCountState').textContent='Änderung noch nicht gespeichert'"></label>`).join("")}</div><p id="launchCountState" role="status" class="small">${winchLaunchesValid(r.launches) ? `${r.launches.drum1 + r.launches.drum2} Tagesstarts gespeichert` : "Startzahlen noch nicht gespeichert"}</p>${!r.signed ? '<button type="submit">Startzahlen speichern</button>' : ""}</form>${!winchRecord(winchActiveDate).start.signed ? '<p class="info">Für den Abschluss muss der heutige Dienstbeginn bestätigt sein. Startzahlen können vorab gespeichert werden.</p>' : ""}`;
}
function winchHistoryHTML() {
  const totals = winchLaunchTotals();
  const days = Object.entries(state.winch?.days || {}).filter(([, r]) => r.start?.signed || r.end?.launches || r.end?.signed).sort(([a], [b]) => b.localeCompare(a));
  return `<details class="winch-history"><summary>Tagesprotokolle und Starts (${days.length})</summary><p class="small">Summe bestätigter Dienstenden: Trommel 1: ${totals.drum1} · Trommel 2: ${totals.drum2}. Entwürfe zählen nicht zur Summe.</p><div class="winch-history-scroll"><table><thead><tr><th>Tag</th><th>Dienstbeginn</th><th>Trommel 1</th><th>Trommel 2</th><th>Dienstende</th></tr></thead><tbody>${days.map(([date, r]) => `<tr><td>${esc(date)}</td><td>${esc(r.start?.signed?.name || "Offen")}</td><td>${r.end?.launches?.drum1 ?? "—"}</td><td>${r.end?.launches?.drum2 ?? "—"}</td><td>${esc(r.end?.signed ? `Bestätigt · ${r.end.signed.name}` : "Entwurf")}</td></tr>`).join("")}</tbody></table></div></details>`;
}
