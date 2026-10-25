// Zuordnung zur bestehenden Flottenreihenfolge; LS4a-Daten bleiben unverändert.
const DAILY_CHECKLISTS = {
  0: {
    groups: ASK21B_DAILY,
    document: "assets/docs/daily-ask21b.pdf",
    revision: "1.0 / 25.05.2020",
  },
  3: {
    groups: DATA.daily,
    document: "assets/docs/daily-ls4.pdf",
    revision: "1.0 / 25.05.2020",
  },
};
function dailyChecklist(i) {
  return DAILY_CHECKLISTS[i] || null;
}
function dailyCheckCount(i) {
  return (
    dailyChecklist(i)?.groups.reduce((n, group) => n + group.items.length, 0) || 0
  );
}
function completedDailyCount(i) {
  return record(i).checks.slice(0, dailyCheckCount(i)).filter(Boolean).length;
}
function dailyComplete(i) {
  const total = dailyCheckCount(i);
  return total > 0 && completedDailyCount(i) === total;
}
