// Tagesstatus pro Flugzeug: offene Mängel, Tageskontrolle, KLAR/UNKLAR
function issues(i) {
  return (state.issues[i] || []).filter((x) => x.open);
}
function record(i) {
  const k = today() + ":" + i;
  return (
    state.daily[k] ||
    (state.daily[k] = { checks: [], note: "", student: "", signed: null })
  );
}
function impact(x) {
  return ["blocking", "advisory", "cosmetic"].includes(x.impact)
    ? x.impact
    : "blocking";
}
function blockers(i) {
  return issues(i).filter((x) => impact(x) === "blocking");
}
function status(i) {
  return blockers(i).length ? "red" : record(i).signed ? "green" : "gray";
}
function statusText(i) {
  return { red: "UNKLAR", green: "KLAR", gray: "CHECK OFFEN" }[status(i)];
}
