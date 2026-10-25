// Bearbeiten, Abschließen und Wiederöffnen; Mängel bleiben nachvollziehbar erhalten.
let issueEdit = null;
function refreshIssueViews() {
  if (selected === "winch") refreshWinchIssues();
  else if ($("#detail").open && step === "issues") drawDaily();
  else if ($("#checkWarnings")) $("#checkWarnings").innerHTML = checkWarnings();
  render();
}
function openIssueEdit(k, action = "edit", closed = false) {
  const issue = closed ? (state.issues[selected] || [])[k] : issues(selected)[k];
  if (!issue || !["edit", "close", "reopen"].includes(action)) return;
  issueEdit = { issue, target: selected, action };
  const edit = action === "edit";
  $("#issueEditContent").innerHTML = `<div class="dhead"><h2>${{ edit: "Mangel bearbeiten", close: "Mangel abschließen", reopen: "Mangel wieder öffnen" }[action]}</h2><button aria-label="Schließen" onclick="$('#issueEditDialog').close()">✕</button></div><form id="issueEditForm"><div class="dbody"><p>${esc(issue.text)}</p>${edit ? `<label>Beschreibung<textarea name="text" required>${esc(issue.text)}</textarea></label><div class="fields"><label>Einstufung<select name="impact">${impactOptions(impact(issue))}</select></label><label>Kategorie<select name="category">${[...new Set([...categories, issue.category || "Unklar / Sonstiges"])].map(c => `<option ${c === (issue.category || "Unklar / Sonstiges") ? "selected" : ""}>${esc(c)}</option>`).join("")}</select></label><label>Position<input name="location" value="${esc(issue.location || "")}"></label><label>Priorität<select name="priority">${priorities.map(p => `<option ${p === (issue.priority || priorities[0]) ? "selected" : ""}>${esc(p)}</option>`).join("")}</select></label></div><p class="small muted">Vorhandene Fotos und verknüpfte Arbeiten bleiben erhalten.</p>` : `<p class="info">${action === "close" ? "Der Mangel bleibt im Verlauf sichtbar. Verknüpfte Arbeiten werden separat abgeschlossen." : "Der Mangel wird wieder in die offenen Mängel aufgenommen. Sperrende Mängel setzen den Status auf unklar."}</p>`}<label>${edit ? "Grund der Änderung" : action === "close" ? "Behebung / Abschlussvermerk" : "Grund für das Wiederöffnen"}<textarea name="reason" required></textarea></label><label>Dokumentiert von<input name="actor" autocomplete="name" required></label></div><div class="dfoot"><button type="button" onclick="$('#issueEditDialog').close()">Abbrechen</button><button class="primary" type="submit">${edit ? "Änderung speichern" : action === "close" ? "Mangel abschließen" : "Wieder öffnen"}</button></div></form>`;
  $("#issueEditForm").onsubmit = event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    saveIssueEdit(Object.fromEntries(form));
  };
  $("#issueEditDialog").showModal();
}
function saveIssueEdit(values) {
  if (!issueEdit) return false;
  const { issue, target, action } = issueEdit;
  if (!(state.issues[target] || []).includes(issue)) return false;
  const actor = String(values.actor || "").trim(), reason = String(values.reason || "").trim();
  if (!actor || !reason || (action === "edit" && (!String(values.text || "").trim() || !Object.hasOwn(impactLabels, values.impact)))) {
    toast("Bitte Name, Vermerk und gültige Mängeldaten eingeben.");
    return false;
  }
  const before = { ...issue }, timestamp = new Date().toISOString();
  issue.id ||= newId();
  issue.history = [...(issue.history || []), {
    action, actor, reason, timestamp,
    before: { text: issue.text, category: issue.category, location: issue.location, priority: issue.priority, impact: impact(issue), open: issue.open },
  }];
  if (action === "edit") Object.assign(issue, {
    text: values.text.trim(), impact: values.impact,
    category: values.category || "Unklar / Sonstiges",
    location: String(values.location || "").trim(),
    priority: priorities.includes(values.priority) ? values.priority : priorities[0],
    updatedAt: timestamp, updatedBy: actor,
  });
  else if (action === "close") Object.assign(issue, { open: false, closedAt: timestamp, closedBy: actor, resolution: reason });
  else Object.assign(issue, { open: true, reopenedAt: timestamp, reopenedBy: actor });
  if (!save()) {
    for (const key of Object.keys(issue)) delete issue[key];
    Object.assign(issue, before);
    return false;
  }
  $("#issueEditDialog").close();
  issueEdit = null;
  refreshIssueViews();
  toast("Mangel gespeichert");
  return true;
}
function issueAudit(issue) {
  return (issue.history || []).length ? `<details class="issue-history"><summary>Änderungsverlauf (${issue.history.length})</summary>${issue.history.map(event => `<div><strong>${esc({ edit: "Bearbeitet", close: "Abgeschlossen", reopen: "Wieder geöffnet" }[event.action] || event.action)}</strong><p class="small">${esc(event.actor)} · ${esc(event.timestamp)}<br>${esc(event.reason)}</p>${event.before ? `<p class="small muted">Vorher: ${esc(event.before.text)} · ${esc(impactLabels[event.before.impact] || "")} · ${esc(event.before.location || "")}</p>` : ""}</div>`).join("")}</details>` : "";
}
function closedIssuesHTML(i) {
  const closed = (state.issues[i] || []).map((x, k) => ({ x, k })).filter(({ x }) => x.open === false);
  return `<details class="closed-issues"><summary>Abgeschlossene Mängel (${closed.length})</summary>${closed.map(({ x, k }) => `<div class="issue"><strong>Abgeschlossen · ${esc(x.closedBy || "")}</strong><p>${esc(x.text)}</p><p class="small">${esc(x.resolution || "")} · ${esc(x.closedAt || "")}</p>${issueAudit(x)}<button onclick="openIssueEdit(${k},'reopen',true)">Wieder öffnen</button></div>`).join("") || '<p class="small muted">Noch keine abgeschlossenen Mängel.</p>'}</details>`;
}
