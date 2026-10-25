// Gerätekarte, gemeinsame Mängelverwaltung und Dienstbeginn.
function renderWinchOverview() {
  const el = $("#equipment");
  if (!el) return;
  const device = DATA.winch, st = winchStatus();
  el.innerHTML = `<div class="top"><div><div class="eyebrow">Bodenbetrieb</div><h2>ACL-Winde</h2></div></div><article class="winch-card status-${st}"><img src="${device.img}" alt="Doppeltrommelwinde des Aero-Clubs Langenselbold"><div><strong class="badge ${st === "red" ? "red" : st === "green" ? "green" : ""}">${winchStatusText()}</strong><h3>${device.name}</h3><p>Trommel 1 · Trommel 2</p><p>${issues("winch").length} offene Mängel · ${blockers("winch").length} sperrend</p><div class="issue-actions"><button onclick="openWinch()">Mängel und Tagesprotokoll</button><button class="primary" onclick="openWinch('start')">Dienstbeginn →</button><button onclick="openWinch('end')">Dienstende →</button></div></div></article>`;
}
function openWinch(phase = null) {
  if (photoBusy) { toast("Bitte warten, bis die Fotos vorbereitet sind."); return; }
  selected = "winch";
  workView = null;
  winchActiveDate = today();
  issueDraft = { text: "", category: "Unklar / Sonstiges", location: "", priority: priorities[0], impact: "blocking", photos: [] };
  step = phase ? "winch-" + phase : "winch-overview";
  drawWinch();
}
function winchWarnings() {
  return issues("winch").filter(x => impact(x) !== "cosmetic").map(x => `<div class="check-alert ${impact(x)}"><strong>${impactLabels[impact(x)]}</strong><p>${esc(x.text)}</p></div>`).join("");
}
function winchIssuesHTML() {
  const entries = issues("winch").map((x, k) => ({ x, k }));
  return `<div class="aircraft-status ${winchStatus()}"><strong>${winchStatusText()}</strong></div>${entries.filter(({x}) => impact(x) !== "cosmetic").sort((a,b) => (impact(a.x) !== "blocking") - (impact(b.x) !== "blocking")).map(({x,k}) => issueCard(x,k)).join("") || '<p class="info">Keine sperrenden Mängel oder wichtigen Hinweise hinterlegt.</p>'}<details><summary>Weitere Mängel / Lackschäden (${entries.filter(({x}) => impact(x) === "cosmetic").length})</summary>${entries.filter(({x}) => impact(x) === "cosmetic").map(({x,k}) => issueCard(x,k)).join("")}</details>${closedIssuesHTML("winch")}`;
}
function drawWinch() {
  const phase = step === "winch-start" ? "start" : step === "winch-end" ? "end" : null;
  if (phase === "end") winchLaunchDirty = false;
  const body = phase === "end" ? winchEndHTML() : phase ? winchChecklistHTML(phase) : winchIssuesHTML() + winchHistoryHTML();
  const foot = phase ? `<button onclick="step='winch-overview';drawWinch()">← Übersicht</button><span id="winchCount"></span><button class="primary" id="winchConfirm" onclick="openWinchSignature('${phase}')">Zur Bestätigung →</button>` : `<button onclick="openIssueReport()">＋ Mangel melden</button><button class="primary" onclick="step='winch-start';drawWinch()">Dienstbeginn →</button><button onclick="step='winch-end';drawWinch()">Dienstende →</button>`;
  showDialog(DATA.winch.name, "Windenbetrieb", body, foot);
  if (phase) updateWinchCount(phase);
  if (phase === "end") $("#winchLaunchForm").onsubmit = event => {
    event.preventDefault();
    saveWinchLaunches($("#drum1").value, $("#drum2").value);
  };
}
function winchChecklistHTML(phase) {
  const list = winchChecklist(phase), r = winchRecord(winchActiveDate)[phase];
  let k = 0;
  return `<div class="eyebrow">${esc(list.title)} · ${winchActiveDate}</div><div id="winchWarnings">${winchWarnings()}</div>${!winchChecklistReady(phase) ? '<p class="info">Die Vereinsvorlage für diese Checkliste fehlt noch. Die Bestätigung ist bis zur Übernahme der Prüfpunkte gesperrt.</p>' : `<p><a href="${esc(list.source)}" target="_blank" rel="noopener">Originalcheckliste ↗</a> · ${esc(list.revision)}</p>`}${list.groups.map(g => `<h3>${esc(g.title)}</h3>${g.items.map(text => { const index = k++; return `<div class="row"><input type="checkbox" id="winch-check-${index}" ${r.checks[index] ? "checked" : ""} ${r.signed ? "disabled" : ""} onchange="if(!setWinchCheck('${phase}',${index},this.checked))this.checked=!this.checked"><label for="winch-check-${index}">${esc(text)}</label></div>`; }).join("")}`).join("")}<label>Bemerkungen<textarea ${r.signed ? "disabled" : ""} onchange="saveWinchNote('${phase}',this.value)">${esc(r.note)}</textarea></label>${r.signed ? `<p class="info">Bestätigt von ${esc(r.signed.name)} · ${esc(r.signed.timestamp)}</p>` : ""}`;
}
function updateWinchCount(phase) {
  const r = winchRecord(winchActiveDate)[phase], count = winchCheckCount(phase);
  $("#winchCount").textContent = `${r.checks.slice(0, count).filter(Boolean).length} / ${count} erledigt`;
  $("#winchConfirm").disabled = !winchCanConfirm(phase, winchActiveDate);
}
function openWinchSignature(phase) {
  if (!winchCanConfirm(phase, winchActiveDate)) return;
  step = "winch-sign-" + phase;
  showDialog(DATA.winch.name, "Windenbetrieb", `<h2>${esc(winchChecklist(phase).title)} bestätigen</h2><div id="winchWarnings">${winchWarnings()}</div><p class="info">Demo: Name, PIN 1234 und Unterschrift dokumentieren nur den Ablauf.</p><div class="fields"><label>Windenfahrer / bestätigende Person<input id="signer" autocomplete="name"></label><label>Demo-PIN<input id="pin" type="password" inputmode="numeric"></label></div><canvas id="sig" class="signature" width="900" height="240"></canvas><button onclick="clearSig()">Unterschrift löschen</button>`, `<button onclick="step='winch-${phase}';drawWinch()">← Zurück</button><button class="primary" onclick="signWinchPhase('${phase}')">Testprotokoll bestätigen</button>`);
  setupSig();
}
function signWinchPhase(phase) {
  if (!winchDayEditable() || !winchCanConfirm(phase, winchActiveDate)) return false;
  const name = $("#signer").value.trim(), r = winchRecord(winchActiveDate)[phase];
  if (r.signed || !name || $("#pin").value !== "1234" || !signature) { toast("Name, Demo-PIN 1234 und Unterschrift erforderlich."); return false; }
  r.signed = { name, timestamp: new Date().toISOString(), date: winchActiveDate, revision: winchChecklist(phase).revision, image: $("#sig").toDataURL(), checks: [...r.checks], ...(phase === "end" ? { launches: { ...r.launches } } : {}) };
  if (!save()) { r.signed = null; return false; }
  step = "winch-overview";
  drawWinch();
  render();
  return true;
}
function refreshWinchIssues() {
  if (step === "winch-overview") drawWinch();
  else if ($("#winchWarnings")) {
    $("#winchWarnings").innerHTML = winchWarnings();
    if (["winch-start", "winch-end"].includes(step)) updateWinchCount(step === "winch-start" ? "start" : "end");
  }
}
