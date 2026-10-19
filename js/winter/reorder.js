// Drag-and-drop-Sortierung der Flugzeuge im Gantt
let dragging = null;
function startReorder(e, k) {
  if (e.button !== 0) return;
  e.preventDefault();
  dragging = { from: k, to: k, y: e.clientY, moved: false };
  e.currentTarget.setPointerCapture(e.pointerId);
  e.currentTarget.classList.add("dragging");
}
function updateReorder(e) {
  if (!dragging) return;
  if (Math.abs(e.clientY - dragging.y) < 6 && !dragging.moved) return;
  dragging.moved = true;
  const rows = [...document.querySelectorAll(".plan-row")];
  let best = dragging.from,
    distance = Infinity;
  rows.forEach((row, k) => {
    const b = row.getBoundingClientRect(),
      d = Math.abs(e.clientY - (b.top + b.height / 2));
    if (d < distance) {
      distance = d;
      best = k;
    }
    row.classList.remove("drop-target");
  });
  dragging.to = best;
  rows[best]?.classList.add("drop-target");
}
function finishReorder(e) {
  if (!dragging) return;
  const d = dragging;
  dragging = null;
  e.currentTarget.classList.remove("dragging");
  document
    .querySelectorAll(".drop-target")
    .forEach((x) => x.classList.remove("drop-target"));
  if (d.moved) moveAircraft(d.from, d.to);
}
