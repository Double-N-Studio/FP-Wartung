// Formular für neue Arbeiten (auch aus Mängeln und Befunden)
function workFromIssue(k) {
  const x = issues(selected)[k];
  if (!x) return;
  if (x.workId) {
    toast("Zu diesem Mangel ist bereits eine Arbeit erfasst.");
    return;
  }
  openWorkForm(selected, x);
}
function openWorkForm(
  i = null,
  issue = null,
  sourceTaskKey = null,
  requestedScope = null,
) {
  workFormReturn = $("#detail").open && workView ? { ...workView } : null;
  const hasAircraft = Number.isInteger(i) && DATA.fleet[i],
    originTask =
      hasAircraft && sourceTaskKey !== null
        ? findWorkItem(i, sourceTaskKey)
        : null,
    scope =
      requestedScope ||
      originTask?.scope ||
      (issue
        ? "annual"
        : workFormReturn?.scope || (mode === "winter" ? "winter" : "annual"));
  workDraft = {
    i: hasAircraft ? i : scope === "winter" ? winterFleet()[0] : 0,
    title: issue ? "Befund beheben: " + issue.text.slice(0, 90) : "",
    text: issue
      ? issue.text
      : originTask
        ? "Befund bei „" + originTask.title + "“: "
        : "",
    group: "Zusätzliche Arbeiten",
    issue,
    sourceTaskKey,
    scope,
    year: originTask?.year || workFormReturn?.year || annualYear(),
    dueDate: "",
  };
  $("#workContent").innerHTML =
    `<div class="dhead"><div><div class="eyebrow">${issue ? "Aus Mängelmeldung" : originTask ? "Befund bei Kontrolle" : "Neue Arbeit"}</div><h2>Arbeit hinzufügen</h2></div><button aria-label="Schließen" onclick="$('#workDialog').close()">✕</button></div><div class="dbody"><div class="fields"><label>Flugzeug<select onchange="workDraft.i=Number(this.value)" ${hasAircraft ? "disabled" : ""}>${(hasAircraft ? [i] : DATA.fleet.map((_, i) => i)).map((a) => `<option value="${a}" ${a === workDraft.i ? "selected" : ""}>${DATA.fleet[a].name}</option>`).join("")}</select></label><label>Zuordnung<select onchange="workDraft.scope=this.value;$('#workYearField').hidden=this.value!=='annual'"><option value="annual" ${scope === "annual" ? "selected" : ""}>Arbeit im laufenden Jahr</option><option value="winter" ${scope === "winter" ? "selected" : ""}>Winterwartung</option></select></label><label id="workYearField" ${scope === "annual" ? "" : "hidden"}>Jahr<input type="number" min="2020" max="2100" value="${workDraft.year}" oninput="workDraft.year=Number(this.value)"></label><label>Termin (optional)<input type="date" value="${workDraft.dueDate}" oninput="workDraft.dueDate=this.value"></label><label>Aufgabenpaket<select onchange="workDraft.group=this.value">${[...groups, "Zusätzliche Arbeiten"].map((g) => `<option ${g === workDraft.group ? "selected" : ""}>${g}</option>`).join("")}</select></label></div><label>Titel der Arbeit<input class="work-title-input" value="${esc(workDraft.title)}" placeholder="z. B. Lackschaden ausbessern" oninput="workDraft.title=this.value"></label><label>Beschreibung / Befund<textarea oninput="workDraft.text=this.value">${esc(workDraft.text)}</textarea></label>${issue ? '<p class="info">Die Arbeit wird mit dem Mangel und dessen Fotos verknüpft. Die Einstufung des Mangels bleibt bestehen.</p>' : ""}</div><div class="dfoot"><button onclick="$('#workDialog').close()">Abbrechen</button><button class="primary" onclick="saveCustomWork()">Arbeit anlegen</button></div>`;
  $("#workDialog").showModal();
}
function saveCustomWork() {
  if (!workDraft?.title.trim()) {
    toast("Bitte einen Titel für die Arbeit eingeben.");
    return;
  }
  const d = workDraft;
  if (!DATA.fleet[d.i] || !["annual", "winter"].includes(d.scope)) {
    toast("Bitte eine gültige Zuordnung wählen.");
    return;
  }
  if (d.scope === "winter" && !winterFleet().includes(d.i)) {
    toast(
      "Die Dynamic nimmt nicht an der Winterwartung teil. Bitte eine Jahresarbeit anlegen.",
    );
    return;
  }
  if (
    d.scope === "annual" &&
    (!Number.isInteger(d.year) || d.year < 2020 || d.year > 2100)
  ) {
    toast("Bitte ein gültiges Jahr eingeben.");
    return;
  }
  if (
    d.dueDate &&
    d.scope === "annual" &&
    Number(d.dueDate.slice(0, 4)) !== d.year
  ) {
    toast("Der Termin muss im gewählten Jahr liegen.");
    return;
  }
  if (d.issue?.workId) {
    toast("Zu diesem Mangel gibt es bereits eine Arbeit.");
    return;
  }
  const previousIssueId = d.issue?.id;
  if (d.issue && !d.issue.id) d.issue.id = newId();
  const work = makeCustomWork(
    d.title,
    d.text,
    d.group,
    d.issue?.id || null,
    d.sourceTaskKey,
    { scope: d.scope, year: d.year, dueDate: d.dueDate },
  );
  customWorks(d.i).push(work);
  if (d.issue) d.issue.workId = work.id;
  const oldAnnualYear = state.annualYear;
  if (d.scope === "annual") state.annualYear = d.year;
  if (!save()) {
    customWorks(d.i).pop();
    if (oldAnnualYear === undefined) delete state.annualYear;
    else state.annualYear = oldAnnualYear;
    if (d.issue) {
      delete d.issue.workId;
      if (previousIssueId === undefined) delete d.issue.id;
      else d.issue.id = previousIssueId;
    }
    return;
  }
  $("#workDialog").close();
  if (d.scope === "annual") state.annualYear = d.year;
  if (workFormReturn?.type === "list")
    openWinter(
      workFormReturn.i,
      workFormReturn.scope || "winter",
      workFormReturn.year || annualYear(),
    );
  else if (workFormReturn?.type === "edit") {
  } else if ($("#detail").open && step === "issues") drawDaily();
  render();
  toast(
    d.scope === "annual"
      ? "Arbeit im laufenden Jahr angelegt"
      : "Zusätzliche Winterarbeit angelegt",
  );
}
function annualWorkFromIssue(i, k) {
  selected = i;
  workView = null;
  workFromIssue(k);
}
function openLinkedWork(i, id) {
  selected = i;
  const key = "custom:" + id;
  if (findWorkItem(i, key)) editTask(key);
  else toast("Die verknüpfte Arbeit wurde nicht gefunden.");
}
function openAnnualTask(i, key) {
  selected = i;
  editTask(key);
}
