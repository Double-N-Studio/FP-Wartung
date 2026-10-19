// Winterplanung: Zeitraum, Reihenfolge, Überschneidung und Zeitplan
function winterFleet() {
  return DATA.fleet
    .map((_, i) => i)
    .filter((i) => DATA.fleet[i].name !== "Dynamic WT9");
}
function planning() {
  const eligible = winterFleet();
  if (!state.planning)
    state.planning = { order: [...eligible], overlap: 2, year: 2026 };
  const p = state.planning;
  p.order = [
    ...new Set(
      (p.order || []).filter(
        (i) => Number.isInteger(i) && eligible.includes(i),
      ),
    ),
  ];
  eligible.forEach((i) => {
    if (!p.order.includes(i)) p.order.push(i);
  });
  p.overlap = Math.max(0, Math.min(5, Math.round(Number(p.overlap) || 0)));
  if (!p.startDate) p.startDate = `${p.year}-11-01`;
  if (!p.endDate) p.endDate = `${p.year + 1}-03-31`;
  return p;
}
function schedule() {
  const p = planning(),
    start = dateMS(p.startDate),
    end = dateMS(p.endDate) + DAY,
    days = (end - start) / DAY,
    n = p.order.length,
    total = days + p.overlap * (n - 1),
    viewStart = Math.min(
      Date.UTC(p.year, 9, 1),
      Date.UTC(
        new Date(start).getUTCFullYear(),
        new Date(start).getUTCMonth(),
        1,
      ),
    ),
    endDate = new Date(end - DAY),
    viewEnd = Math.max(
      Date.UTC(p.year + 1, 4, 1),
      Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth() + 1, 1),
    ),
    viewDays = (viewEnd - viewStart) / DAY;
  return {
    start,
    end,
    days,
    viewStart,
    viewEnd,
    viewDays,
    rows: p.order.map((i, k) => {
      const from = Math.round((k * total) / n) - k * p.overlap,
        to = Math.round(((k + 1) * total) / n) - k * p.overlap;
      return { i, from, to, start: start + from * DAY, end: start + to * DAY };
    }),
  };
}
function calendarMonths(plan) {
  const months = [];
  for (let ms = plan.viewStart; ms < plan.viewEnd; ) {
    const d = new Date(ms),
      m = d.getUTCMonth(),
      next = Date.UTC(d.getUTCFullYear(), m + 1, 1);
    months.push({
      start: ms,
      end: next,
      label: [
        "JAN",
        "FEB",
        "MÄR",
        "APR",
        "MAI",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OKT",
        "NOV",
        "DEZ",
      ][m],
      reserve: m === 9 || m === 3,
      left: ((ms - plan.viewStart) / DAY / plan.viewDays) * 100,
      width: ((next - ms) / DAY / plan.viewDays) * 100,
    });
    ms = next;
  }
  return months;
}
function monthBackground(plan) {
  return calendarMonths(plan)
    .map(
      (m) =>
        `<span aria-hidden="true" class="month-grid ${m.reserve ? "reserve-month" : ""}" style="left:${m.left}%;width:${m.width}%"></span>`,
    )
    .join("");
}
function applyPlanningPeriod(startValue, endValue) {
  const start = dateMS(startValue),
    end = dateMS(endValue),
    p = planning();
  if (
    !startValue ||
    !endValue ||
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    end < start
  ) {
    toast("Bitte einen gültigen Beginn und ein späteres Ende wählen.");
    return false;
  }
  const days = (end - start) / DAY + 1,
    minDays = p.order.length * (p.overlap + 1) + p.overlap;
  if (days < minDays) {
    toast(
      `Für sieben Flugzeuge und ${p.overlap} Tage Überschneidung sind mindestens ${minDays} Kalendertage nötig.`,
    );
    return false;
  }
  if (days > 366) {
    toast("Bitte einen Wartungszeitraum von höchstens einem Jahr wählen.");
    return false;
  }
  const old = { startDate: p.startDate, endDate: p.endDate, year: p.year };
  p.startDate = startValue;
  p.endDate = endValue;
  const d = new Date(start);
  p.year = d.getUTCMonth() >= 6 ? d.getUTCFullYear() : d.getUTCFullYear() - 1;
  if (!save()) {
    Object.assign(p, old);
    return false;
  }
  renderWinter();
  toast("Zeitraum und Flugzeugtermine aktualisiert");
  return true;
}
function resetPlanningPeriod() {
  const p = planning();
  applyPlanningPeriod(`${p.year}-11-01`, `${p.year + 1}-03-31`);
}
function planDate() {
  return state.planningDate || today();
}
function setOverlap(v) {
  const p = planning(),
    value = Number(v),
    days = (dateMS(p.endDate) - dateMS(p.startDate)) / DAY + 1;
  if (days < p.order.length * (value + 1) + value) {
    toast("Für diese Überschneidung ist der Zeitraum zu kurz.");
    renderWinter();
    return;
  }
  const old = p.overlap;
  p.overlap = value;
  if (!save()) {
    p.overlap = old;
    return;
  }
  renderWinter();
}
function moveAircraft(from, to) {
  const p = planning();
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= p.order.length ||
    to >= p.order.length
  )
    return;
  const old = [...p.order];
  p.order.splice(to, 0, p.order.splice(from, 1)[0]);
  if (!save()) {
    p.order = old;
    return;
  }
  renderWinter();
  toast("Reihenfolge und Zeiträume aktualisiert");
}
