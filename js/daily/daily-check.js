// Tageskontrolle: Mängelübersicht → Checkliste → Unterschrift
function openDaily(i) {
  workView = null;
  selected = i;
  issueDraft = {
    text: "",
    category: "Unklar / Sonstiges",
    location: "",
    priority: "Bewertung erforderlich",
    impact: "blocking",
    photos: [],
  };
  step = "issues";
  drawDaily();
}
function startDaily(i) {
  openDaily(i);
  if (dailyChecklist(i) && !record(i).signed) {
    step = "checks";
    drawDaily();
  }
}
function checkWarnings() {
  const entries = issues(selected).filter((x) => impact(x) !== "cosmetic");
  return entries.length
    ? `<details class="check-alerts" open><summary>Vor dem Flug beachten: ${blockers(selected).length} sperrend · ${entries.filter((x) => impact(x) === "advisory").length} Pilotenhinweise</summary>${entries.map((x) => `<div class="check-alert ${impact(x)}"><strong>${impactLabels[impact(x)]}</strong><p>${esc(x.text)}</p></div>`).join("")}</details>`
    : "";
}
function drawDaily() {
  const i = selected,
    f = DATA.fleet[i],
    r = record(i),
    checklist = dailyChecklist(i);
  let body = "",
    foot = "";
  if (step === "issues") {
    const list = issues(i).map((x, k) => ({ x, k })),
      blocking = list.filter(({ x }) => impact(x) === "blocking"),
      advisory = list.filter(({ x }) => impact(x) === "advisory"),
      other = list.filter(({ x }) => impact(x) === "cosmetic");
    body = `<div class="aircraft-status ${status(i)}"><strong>${statusText(i)}</strong><span>${blockers(i).length ? "Sperrender Mangel / Bewertung ausstehend" : r.signed ? "Heutige Kontrolle unterschrieben" : "Heutige Kontrolle noch offen"}</span></div><div class="issue-summary"><span class="badge red">${blocking.length} sperrend</span><span class="badge pilot-badge">${advisory.length} Pilotenhinweise</span><span class="badge">${other.length} weitere</span></div>${blocking.length ? `<h3 class="sectiontitle">Sperrende Mängel</h3>${blocking.map(({ x, k }) => issueCard(x, k)).join("")}` : ""}${advisory.length ? `<h3 class="sectiontitle">Wichtig für den Piloten</h3>${advisory.map(({ x, k }) => issueCard(x, k)).join("")}` : ""}${!blocking.length && !advisory.length ? '<div class="info">Keine sperrenden Mängel oder wichtigen Pilotenhinweise hinterlegt.</div>' : ""}<details class="additional-issues"><summary>Weitere Mängel / Lackschäden (${other.length})</summary>${other.length ? other.map(({ x, k }) => issueCard(x, k)).join("") : '<p class="muted small">Keine weiteren Mängel hinterlegt.</p>'}</details>${closedIssuesHTML(i)}${!checklist ? '<p class="muted small">Die Tagescheckliste für dieses Flugzeug wird noch ergänzt.</p>' : ""}${r.signed ? `<p class="small muted">Heute bestätigt: ${esc(r.signed.name)} · ${r.signed.time}</p>` : ""}`;
    foot = `<button onclick="openIssueReport()">＋ Neuen Mangel melden</button><button class="primary" ${!checklist || r.signed ? "disabled" : ""} onclick="step='checks';drawDaily()">${r.checks.some(Boolean) ? "Tageskontrolle fortsetzen" : "Tageskontrolle starten"} →</button>`;
  }
  if (step === "checks" && checklist) {
    let n = 0;
    body = `<div class="eyebrow">02 / Tageskontrolle</div><div id="checkWarnings">${checkWarnings()}</div><div class="links"><a href="${checklist.document}" target="_blank">Originalcheckliste ↗</a><span>Rev. ${esc(checklist.revision)}</span></div><p class="info">Originalinhalt übernommen. Eingaben bleiben beim Schließen lokal erhalten.</p>${checklist.groups
      .map(
        (g) =>
          `<div class="sectiontitle">${g.title}</div>${g.items
            .map((t) => {
              const k = n++;
              return `<div class="row"><input type="checkbox" id="check-${k}" ${r.checks[k] ? "checked" : ""} onchange="record(selected).checks[${k}]=this.checked;save();updateCount()"><label for="check-${k}">${esc(t)}</label></div>`;
            })
            .join("")}`,
      )
      .join(
        "",
      )}<div class="fields"><label>Flugschüler / ausführende Person<input value="${esc(r.student)}" onchange="record(selected).student=this.value;save()" placeholder="Name"></label></div><label>Beanstandungen / Bemerkungen<textarea onchange="record(selected).note=this.value;save()" placeholder="Beanstandungen zusätzlich als Mangel erfassen">${esc(r.note)}</textarea></label><button onclick="openIssueReport()">Mangel erfassen</button>`;
    foot = `<span id="checkCount"></span><button class="primary" id="toSign" onclick="step='sign';drawDaily()">Zur Bestätigung →</button>`;
  }
  if (step === "sign" && checklist) {
    body = `<div class="eyebrow">03 / Persönlicher Abschluss</div><h2>Kontrolle bestätigen</h2><div id="checkWarnings">${checkWarnings()}</div><p>${completedDailyCount(i)} von ${dailyCheckCount(i)} Punkten erledigt. ${blockers(i).length ? "Sperrende Mängel halten den Flugzeugstatus weiterhin rot." : ""}</p><div class="info">Demo: Die PIN 1234 prüft nur den Ablauf. Es findet noch keine echte Identitätsprüfung statt.</div><div class="fields"><label>Fluglehrer / bestätigende Person<input id="signer" autocomplete="off" placeholder="Vor- und Nachname"></label><label>Demo-PIN<input id="pin" type="password" inputmode="numeric" placeholder="1234" autocomplete="off"></label></div><label>Unterschrift mit Finger oder Stift<canvas id="sig" class="signature" width="900" height="240"></canvas></label><button onclick="clearSig()">Unterschrift löschen</button>`;
    foot = `<button onclick="step='checks';drawDaily()">← Zurück</button><button class="primary" onclick="signRecord()">Testprotokoll unterschreiben</button>`;
  }
  showDialog(`${f.name} · ${f.reg}`, "Flugbetrieb", body, foot);
  if (step === "checks") updateCount();
  if (step === "sign") setupSig();
}
function updateCount() {
  const n = completedDailyCount(selected),
    total = dailyCheckCount(selected);
  $("#checkCount").textContent = `${n} / ${total} erledigt · lokal gespeichert`;
  $("#toSign").disabled = !dailyComplete(selected);
}
