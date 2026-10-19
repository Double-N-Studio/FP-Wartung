// Wochenendübersicht der anstehenden Arbeiten
let weekendOffset = 0;
function nextWeekend(reference = today(), offset = weekendOffset) {
  const base = dateMS(reference),
    day = new Date(base).getUTCDay(),
    start = base + (((6 - day + 7) % 7) + offset * 7) * DAY;
  return {
    start,
    end: start + 2 * DAY,
    saturday: isoDate(start),
    sunday: isoDate(start + DAY),
  };
}
function weekendWork(reference = today(), offset = weekendOffset) {
  const weekend = nextWeekend(reference, offset),
    plan = schedule(),
    year = new Date(weekend.start).getUTCFullYear(),
    rows = [];
  DATA.fleet.forEach((f, i) => {
    if (!winterFleet().includes(i)) return;
    const slot = plan.rows.find((r) => r.i === i),
      scheduled = slot && slot.start < weekend.end && slot.end > weekend.start,
      overdue = slot && slot.end <= weekend.start;
    const candidates = [
      ...(slot ? workItems(i, "winter") : []),
      ...workItems(i, "annual", year),
    ];
    const items = candidates
      .map((t) => ({ t, r: task(i, t.key) }))
      .filter(({ t, r }) => {
        if (r.stage === "checked") return false;
        if (r.plannedDate) return dateMS(r.plannedDate) < weekend.end;
        if (t.scope === "annual") return false;
        return scheduled || overdue || r.stage === "work" || r.stage === "done";
      });
    items.sort((a, b) => {
      const rank = (x) => {
        const issue = x.t.sourceIssueId
          ? (state.issues[i] || []).find((y) => y.id === x.t.sourceIssueId)
          : null;
        return issue?.open && impact(issue) === "blocking"
          ? 0
          : x.r.stage === "done"
            ? 1
            : x.r.stage === "work"
              ? 2
              : 3;
      };
      return rank(a) - rank(b);
    });
    if (scheduled || items.length)
      rows.push({ i, slot, scheduled: !!scheduled, overdue: !!overdue, items });
  });
  rows.sort(
    (a, b) =>
      Number(b.scheduled) - Number(a.scheduled) ||
      plan.rows.findIndex((r) => r.i === a.i) -
        plan.rows.findIndex((r) => r.i === b.i),
  );
  return { weekend, rows };
}
function weekendTaskHTML(i, { t, r }) {
  return `<div class="weekend-task"><div><strong>${esc(t.title)}</strong><div class="small muted">${esc(t.group)} · ${t.scope === "annual" ? "Jahresarbeit" : "Winterwartung"}</div></div><span class="badge ${r.stage === "done" ? "gold" : ""}">${{ open: "Offen", work: "Fortsetzen · " + (Number(r.percent) || 0) + "%", done: "Prüfung offen" }[r.stage] || "Offen"}</span><button onclick="openAnnualTask(${i},${esc(JSON.stringify(t.key))})">Öffnen →</button></div>`;
}
function weekendHTML() {
  const { weekend, rows } = weekendWork(),
    total = rows.reduce((n, row) => n + row.items.length, 0),
    plan = schedule();
  return `<section class="panel weekend-panel"><div class="top"><div><div class="eyebrow">${weekendOffset ? "Wochenendvorschau" : "Nächstes Wochenende"}</div><h2>${shortDate(weekend.start)} – ${shortDate(weekend.end - DAY)}${new Date(weekend.start).getUTCFullYear()}</h2><p class="small muted">${total} offene Arbeiten · ${rows.filter((r) => r.scheduled).length} Flugzeug(e) im Planzeitraum</p></div><div class="weekend-nav"><button aria-label="Vorheriges Wochenende" ${weekendOffset === 0 ? "disabled" : ""} onclick="weekendOffset=Math.max(0,weekendOffset-1);renderWinter()">←</button><button onclick="weekendOffset=0;renderWinter()">Nächstes Wochenende</button><button aria-label="Folgendes Wochenende" onclick="weekendOffset++;renderWinter()">→</button></div></div><p class="small muted">Aus dem Flugzeugplan abgeleitet. Begonnene Arbeiten und ausstehende Prüfungen bleiben sichtbar. Einzelne Arbeiten können über „Geplant für“ ausdrücklich einem Wochenende zugeordnet werden.</p>${
    !rows.length
      ? `<div class="info">Für dieses Wochenende sind keine Winterarbeiten vorgesehen.${weekend.end <= plan.start ? " Wartungsbeginn: " + shortDate(plan.start) + new Date(plan.start).getUTCFullYear() + "." : ""}</div>`
      : rows
          .map(
            (row) =>
              `<div class="weekend-aircraft"><div class="top"><div><h3>${DATA.fleet[row.i].name}</h3><span class="badge ${row.overdue ? "gold" : ""}">${row.scheduled ? "Laut Winterplan an der Reihe" : row.overdue ? "Offene Arbeiten aus früherem Zeitraum" : "Vorgemerkt / in Bearbeitung"}</span></div><button onclick="openWinter(${row.i})">Alle Arbeiten →</button></div>${
                row.items.length
                  ? row.items
                      .slice(0, 5)
                      .map((item) => weekendTaskHTML(row.i, item))
                      .join("")
                  : workItems(row.i).length
                    ? '<p class="small muted">Keine offenen Arbeiten für dieses Wochenende. Bereits geprüfte Arbeiten sind ausgeblendet.</p>'
                    : '<p class="small muted">Für dieses Flugzeug sind noch keine Wartungsarbeiten hinterlegt.</p>'
              }${
                row.items.length > 5
                  ? `<details class="weekend-more"><summary>Weitere ${row.items.length - 5} offene Arbeiten</summary>${row.items
                      .slice(5)
                      .map((item) => weekendTaskHTML(row.i, item))
                      .join("")}</details>`
                  : ""
              }</div>`,
          )
          .join("")
  }</section>`;
}
