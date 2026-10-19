// Arbeiten im laufenden Jahr (u. a. Wachsen bis 30. Juni)
function annualDeadline(t, r) {
  if (r.stage === "checked")
    return '<span class="badge green">Geprüft abgeschlossen</span>';
  if (r.stage === "done")
    return '<span class="badge gold">Durchgeführt · Prüfung offen</span>';
  if (!t.dueDate) return '<span class="small muted">Ohne festen Termin</span>';
  const overdue = t.dueDate < today();
  return `<span class="badge ${overdue ? "red" : ""}">${t.dueDate.split("-").reverse().join(".")}</span>${overdue ? "<small>Erledigung noch nicht dokumentiert</small>" : ""}`;
}
function renderAnnualWork() {
  if (!$("#annualWork")) return;
  const year = annualYear(),
    openBlockers = DATA.fleet.flatMap((f, i) =>
      issues(i)
        .map((x, k) => ({ i, k, x }))
        .filter(({ x }) => impact(x) === "blocking"),
    ),
    items = DATA.fleet.flatMap((f, i) =>
      workItems(i, "annual", year).map((t) => ({ i, t, r: task(i, t.key) })),
    ),
    done = items.filter(({ r }) => r.stage === "checked").length;
  items.sort(
    (a, b) =>
      (a.r.stage === "checked") - (b.r.stage === "checked") ||
      (a.t.dueDate || "9999").localeCompare(b.t.dueDate || "9999") ||
      a.i - b.i,
  );
  $("#annualWork").innerHTML =
    `<div class="top"><div><div class="eyebrow">Flugbetrieb / Arbeiten während des Jahres</div><h2>Was im Jahr noch ansteht</h2><p class="muted">Mängel beheben, laufende Arbeiten und zusätzliche Pflege.</p></div><div class="annual-actions"><label>Jahr<select aria-label="Jahr für laufende Arbeiten" onchange="state.annualYear=Number(this.value);save();renderAnnualWork()">${[year - 1, year, year + 1].map((y) => `<option ${y === year ? "selected" : ""}>${y}</option>`).join("")}</select></label><button class="primary" onclick="openWorkForm(null,null,null,'annual')">＋ Jahresarbeit hinzufügen</button></div></div>${openBlockers.length ? `<div class="annual-blockers"><h3>Flugzeuge unklar · ${openBlockers.length} sperrende Mängel</h3>${openBlockers.map(({ i, k, x }) => `<div class="annual-blocker"><div><strong>${DATA.fleet[i].name}</strong><p>${esc(x.text)}</p></div>${x.workId ? `<button onclick="openLinkedWork(${i},'${esc(x.workId)}')">Arbeit ansehen →</button>` : `<button onclick="annualWorkFromIssue(${i},${k})">＋ Behebung als Arbeit erfassen</button>`}</div>`).join("")}</div>` : ""}<div class="annual-summary"><strong>Zusätzliches Wachsen bis 30. Juni ${year}</strong><span>Für jedes der acht Flugzeuge jährlich separat dokumentiert.</span><span class="badge">${done} / ${items.length} Jahresarbeiten geprüft</span></div><div class="annual-table"><div class="annual-table-head"><span>Flugzeug / Arbeit</span><span>Termin</span><span>Arbeitsstand</span><span></span></div>${items.map(({ i, t, r }) => `<div class="annual-work-row"><div><strong>${DATA.fleet[i].name}</strong><p>${esc(t.title)}</p></div><div class="annual-due">${annualDeadline(t, r)}</div><div><span class="badge ${r.stage === "checked" ? "green" : r.stage === "done" ? "gold" : ""}">${{ open: "Offen", work: "In Arbeit · " + (Number(r.percent) || 0) + "%", done: "Durchgeführt", checked: "Geprüft" }[r.stage]}</span></div><button onclick="openAnnualTask(${i},${esc(JSON.stringify(t.key))})">${r.stage === "checked" ? "Ansehen" : "Bearbeiten"}</button></div>`).join("")}</div><p class="small muted">Jahresarbeiten werden unabhängig von der Winterwartung geführt. Das Abschließen einer Arbeit ändert die Einstufung eines verknüpften Mangels nicht automatisch.</p>`;
}
