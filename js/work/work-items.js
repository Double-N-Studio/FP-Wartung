// Arbeitsmodell: Standard-, Jahres- und eigene Arbeiten samt Fortschritt
const groups = ["Flügel", "Rumpf", "Höhenleitwerk", "Anhänger"];
function task(i, k) {
  return (
    state.winter[i + ":" + k] ||
    (state.winter[i + ":" + k] = {
      stage: "open",
      by: "",
      note: "",
      verifiedBy: "",
    })
  );
}
function annualYear() {
  return Number(state.annualYear) || Number(today().slice(0, 4));
}
function workItems(i, scope = "winter", year = annualYear()) {
  const standard =
    scope === "winter" && i === 3
      ? expanded().map((t, k) => ({ ...t, key: k, scope: "winter" }))
      : [];
  const wax =
    scope === "annual"
      ? [
          {
            key: "annual:wax:" + year,
            title: "Im laufenden Jahr erneut wachsen",
            text: "Flugzeug zusätzlich zur Winterwartung im laufenden Jahr wachsen. Durchführung bis zum 30. Juni dokumentieren.",
            group: "Jährliche Pflege",
            scope: "annual",
            year,
            dueDate: year + "-06-30",
          },
        ]
      : [];
  const custom = (state.customWork?.[i] || [])
    .filter(
      (t) =>
        (t.scope || "winter") === scope &&
        (scope !== "annual" || Number(t.year) === Number(year)),
    )
    .map((t) => ({ ...t, scope: t.scope || "winter", key: "custom:" + t.id }));
  return [...standard, ...wax, ...custom];
}
function findWorkItem(i, k) {
  if (typeof k === "number")
    return workItems(i, "winter").find((t) => t.key === k);
  if (k.startsWith("annual:wax:"))
    return workItems(i, "annual", Number(k.split(":")[2])).find(
      (t) => t.key === k,
    );
  const t = (state.customWork?.[i] || []).find((t) => "custom:" + t.id === k);
  return t ? { ...t, scope: t.scope || "winter", key: k } : null;
}
function workProgress(i, scope = "winter", year = annualYear()) {
  const items = workItems(i, scope, year),
    total = items.length;
  let done = 0,
    checked = 0,
    active = 0,
    units = 0;
  items.forEach((t) => {
    const r = task(i, t.key);
    if (r.stage === "checked") {
      checked++;
      done++;
      units += 100;
    } else if (r.stage === "done") {
      done++;
      units += 100;
    } else if (r.stage === "work") {
      active++;
      units += Math.max(0, Math.min(99, Number(r.percent) || 0));
    }
  });
  return {
    total,
    done,
    checked,
    active,
    workedPct: total ? Math.round(units / total) : 0,
    donePct: total ? Math.round((done / total) * 100) : 0,
    checkedPct: total ? Math.round((checked / total) * 100) : 0,
  };
}
function progress(i) {
  return workProgress(i).checkedPct;
}
let workView = null,
  workDraft = null,
  workFormReturn = null;
function customWorks(i) {
  if (!state.customWork) state.customWork = {};
  return state.customWork[i] || (state.customWork[i] = []);
}
function makeCustomWork(
  title,
  text,
  group = "Zusätzliche Arbeiten",
  sourceIssueId = null,
  sourceTaskKey = null,
  options = {},
) {
  return {
    scope: options.scope || "winter",
    year: options.year || annualYear(),
    dueDate: options.dueDate || "",
    id: newId(),
    title: title.trim(),
    text: text.trim(),
    group: group.trim() || "Zusätzliche Arbeiten",
    sourceIssueId,
    sourceTaskKey,
    createdAt: new Date().toISOString(),
  };
}
function expanded() {
  return DATA.winter.flatMap((t) =>
    t.group === "Flügel"
      ? [
          { ...t, title: t.title + " · links" },
          { ...t, title: t.title + " · rechts" },
        ]
      : [t],
  );
}
