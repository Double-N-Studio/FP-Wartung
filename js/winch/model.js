// Tagesprotokolle und Checklistenstatus der Winde, getrennt von aircraft daily.
let winchActiveDate = null;
function winchRecord(date = today()) {
  state.winch ||= { days: {} };
  state.winch.days ||= {};
  return state.winch.days[date] ||= { start: { checks: [], note: "", signed: null } };
}
function winchChecklist(phase) {
  return phase === "start" ? WINCH_START_CHECKLIST : null;
}
function winchChecklistReady(phase) {
  const list = winchChecklist(phase);
  return !!(list?.revision && list.source && list.groups.length &&
    list.groups.every(g => g.items.length && g.items.every(t => typeof t === "string" && t.trim())));
}
function winchCheckCount(phase) {
  return winchChecklist(phase)?.groups.reduce((n, g) => n + g.items.length, 0) || 0;
}
function winchChecksComplete(phase, date = today()) {
  const r = winchRecord(date)[phase], count = winchCheckCount(phase);
  return winchChecklistReady(phase) && !!r &&
    Array.from({ length: count }, (_, k) => !!r.checks[k]).every(Boolean);
}
function winchCanConfirm(phase, date = today()) {
  return winchChecksComplete(phase, date) && !winchRecord(date)[phase].signed && !blockers("winch").length;
}
function winchStatus() {
  return blockers("winch").length ? "red" : winchRecord().start.signed ? "green" : "gray";
}
function winchStatusText() {
  return { red: "UNKLAR", green: "DIENSTBEGINN BESTÄTIGT", gray: "DIENSTBEGINN OFFEN" }[winchStatus()];
}
function winchDayEditable() {
  if (winchActiveDate !== today()) {
    toast("Der Tag hat gewechselt. Bitte die Winde erneut öffnen.");
    return false;
  }
  return true;
}
function setWinchCheck(phase, k, checked) {
  if (!winchDayEditable() || !winchChecklistReady(phase)) return false;
  const r = winchRecord(winchActiveDate)[phase];
  if (!r || r.signed || !Number.isInteger(k) || k < 0 || k >= winchCheckCount(phase)) return false;
  const before = [...r.checks];
  r.checks[k] = !!checked;
  if (!save()) { r.checks = before; return false; }
  updateWinchCount(phase);
  return true;
}
function saveWinchNote(phase, value) {
  if (!winchDayEditable()) return false;
  const r = winchRecord(winchActiveDate)[phase];
  if (!r || r.signed) return false;
  const before = r.note;
  r.note = value;
  if (!save()) { r.note = before; return false; }
  return true;
}
