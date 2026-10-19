// Aufgabenliste pro Flugzeug und Bearbeitung einzelner Arbeiten
function openWinter(i, scope = "winter", year = annualYear()) {
  selected = i;
  workView = { type: "list", i, scope, year };
  const f = DATA.fleet[i],
    items = workItems(i, scope, year),
    wp = workProgress(i, scope, year),
    sections = [...new Set([...groups, ...items.map((t) => t.group)])];
  showDialog(
    `${f.name}${f.reg === "Kennzeichen ergänzen" ? "" : " · " + f.reg}`,
    scope === "annual"
      ? "Arbeiten im laufenden Jahr / " + year
      : "Winterwartung / Aufgabenpakete",
    `${i === 3 && scope === "winter" ? '<div class="links"><a href="assets/docs/winter-ls4.docx">Originalvorlage herunterladen</a><span>V1.0 · 16.10.2026</span></div>' : ""}<div class="top"><div><strong>${wp.workedPct}% bearbeitet · ${wp.checkedPct}% geprüft</strong><p class="small muted">${wp.done} von ${wp.total} durchgeführt · ${wp.active} in Arbeit</p></div><button class="primary" onclick="openWorkForm(${i},null,null,'${scope}')">＋ Arbeit hinzufügen</button></div><div class="work-progress-track"><span class="worked-fill" style="width:${wp.workedPct}%"></span><span class="checked-fill" style="width:${wp.checkedPct}%"></span></div>${!items.length ? '<div class="info">Noch keine Checkliste hinterlegt. Hier kannst du eigene Arbeiten anlegen.</div>' : ""}${sections
      .filter((g) => items.some((t) => t.group === g))
      .map(
        (g) =>
          `<details open><summary class="sectiontitle">${esc(g)}</summary>${items
            .filter((t) => t.group === g)
            .map((t) => {
              const r = task(i, t.key);
              return `<div class="row"><div class="tasktext"><details><summary>${esc(t.title)}</summary>${t.dueDate ? `<p class="small">Termin: ${esc(t.dueDate.split("-").reverse().join("."))}</p>` : ""}<p>${esc(t.text)}</p>${t.sourceIssueId ? sourceIssueHTML(i, t.sourceIssueId) : ""}${t.sourceTaskKey !== null && t.sourceTaskKey !== undefined ? '<span class="badge">Befund aus einer Wartungsarbeit</span>' : ""}</details><span class="badge ${r.stage === "checked" ? "green" : r.stage === "done" ? "gold" : ""}">${{ open: "Offen", work: "In Arbeit", done: "Durchgeführt · zur Kontrolle", checked: "Geprüft" }[r.stage]}${r.stage === "work" ? " · " + (Number(r.percent) || 0) + "%" : ""}</span>${r.by ? `<div class="small muted">Durchgeführt: ${esc(r.by)}${r.verifiedBy ? " · Geprüft: " + esc(r.verifiedBy) : ""}</div>` : ""}${r.note ? `<p>${esc(r.note)}</p>` : ""}</div><button onclick="editTask(${esc(JSON.stringify(t.key))})">${r.stage === "checked" ? "Ansehen" : "Bearbeiten"}</button></div>`;
            })
            .join("")}</details>`,
      )
      .join("")}`,
    `<span class="small muted">Automatisch lokal gespeichert</span><button onclick="closeDialog()">Zur Übersicht</button>`,
  );
}
function sourceIssueHTML(i, id) {
  const x = (state.issues[i] || []).find((x) => x.id === id);
  return x
    ? `<div class="info"><strong>Verknüpfter Mangel</strong><p>${esc(x.text)}</p>${x.location ? `<p class="small">${esc(x.location)}</p>` : ""}<div class="issue-photos">${(x.photos || []).map((p) => `<a href="${p.data}" target="_blank" rel="noopener"><img src="${p.data}" alt="Foto des verknüpften Mangels"></a>`).join("")}</div></div>`
    : '<p class="small muted">Verknüpfte Mängelmeldung nicht verfügbar.</p>';
}
function editTask(k) {
  const i = selected,
    t = findWorkItem(i, k);
  if (!t) return;
  workView = {
    type: "edit",
    i,
    key: k,
    scope: t.scope,
    year: t.year || annualYear(),
  };
  const r = task(i, k),
    locked = r.stage === "checked";
  showDialog(
    esc(t.title),
    DATA.fleet[i].name + " / " + esc(t.group),
    `<p style="white-space:pre-line">${esc(t.text)}</p>${t.dueDate ? `<p class="info">Termin: ${esc(t.dueDate.split("-").reverse().join("."))}</p>` : ""}${t.sourceIssueId ? sourceIssueHTML(i, t.sourceIssueId) : ""}<div class="work-date-planning"><label>Geplant für (optional)<input id="workPlanDate" type="date" value="${r.plannedDate || ""}" ${locked ? "disabled" : ""}></label><button ${locked ? "disabled" : ""} onclick="$('#workPlanDate').value=nextWeekend().saturday">Für nächstes Wochenende vormerken</button></div><div class="fields"><label>Status<select id="stage" ${locked ? "disabled" : ""} onchange="$('#partialField').hidden=this.value!=='work'"><option value="open">Offen</option><option value="work">In Arbeit</option><option value="done">Durchgeführt · zur Kontrolle</option><option value="checked" ${r.stage === "done" || locked ? "" : "disabled"}>Geprüft · abgeschlossen</option></select></label><label id="partialField" ${r.stage === "work" ? "" : "hidden"}>Teilfortschritt dieser Arbeit (%)<input id="taskpercent" type="number" min="0" max="99" value="${Number(r.percent) || 0}" ${locked ? "disabled" : ""}></label><label>Person für diese Bestätigung<input id="worker" value="${locked ? esc(r.verifiedBy) : ""}" ${locked ? "disabled" : ""} placeholder="Name"></label></div><label>Bemerkungen / Messwerte<textarea id="tasknote" ${locked ? "disabled" : ""}>${esc(r.note)}</textarea></label><div class="fields"><label>Demo-PIN bei Durchführung oder Prüfung<input id="taskpin" type="password" placeholder="1234" inputmode="numeric" ${locked ? "disabled" : ""}></label></div><p class="small muted">Teilfortschritt kann ohne PIN gespeichert werden. Durchführung und Prüfung werden persönlich bestätigt.</p><button onclick="openWorkForm(${i},null,${esc(JSON.stringify(k))})">＋ Befund / weitere Arbeit hinzufügen</button>`,
    `<button onclick="openWinter(${i},'${t.scope}',${t.year || annualYear()})">← Aufgaben</button><button class="primary" ${locked ? "disabled" : ""} onclick="saveTask(${esc(JSON.stringify(k))})">Speichern</button>`,
  );
  $("#stage").value = r.stage;
}
function saveTask(k) {
  const i = selected,
    t = findWorkItem(i, k);
  if (!t) return;
  const r = task(i, k),
    stage = $("#stage").value,
    name = $("#worker").value.trim(),
    percent = Number($("#taskpercent").value);
  if (r.stage === "checked") return;
  if (!["open", "work", "done", "checked"].includes(stage)) return;
  if (
    stage === "work" &&
    (!Number.isFinite(percent) || percent < 0 || percent > 99)
  ) {
    toast("Bitte einen Teilfortschritt von 0 bis 99 Prozent angeben.");
    return;
  }
  if (
    ["done", "checked"].includes(stage) &&
    (!name || $("#taskpin").value !== "1234")
  ) {
    toast("Zum Abschluss Name und Demo-PIN 1234 eingeben.");
    return;
  }
  if (stage === "checked" && r.stage !== "done") return;
  const old = { ...r };
  r.plannedDate = $("#workPlanDate").value || "";
  r.stage = stage;
  r.percent =
    stage === "work"
      ? Math.round(percent)
      : ["done", "checked"].includes(stage)
        ? 100
        : 0;
  r.note = $("#tasknote").value;
  if (stage === "done") r.by = name;
  if (stage === "checked") r.verifiedBy = name;
  if (!save()) {
    if (old.plannedDate === undefined) delete r.plannedDate;
    Object.assign(r, old);
    return;
  }
  openWinter(i, t.scope, t.year || annualYear());
  render();
  toast(
    t.scope === "annual"
      ? "Jahresarbeit aktualisiert"
      : "Arbeitsstand gespeichert · Gantt aktualisiert",
  );
}
