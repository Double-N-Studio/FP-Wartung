// Gemeinsamer Detaildialog
function showDialog(title, sub, body, foot = "") {
  $("#dialogContent").innerHTML =
    `<div class="dhead"><div><div class="eyebrow">${sub}</div><h2>${title}</h2></div><div class="header-actions">${sub === "Flugbetrieb" && ["checks", "sign"].includes(step) ? '<button class="report-always" onclick="openIssueReport()">＋ Mangel melden</button>' : ""}<button aria-label="Schließen" onclick="closeDialog()">✕</button></div></div><div class="dbody">${body}</div>${foot ? `<div class="dfoot">${foot}</div>` : ""}`;
  if (!$("#detail").open) $("#detail").showModal();
}
function closeDialog() {
  $("#detail").close();
  render();
}
