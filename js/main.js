// Einstiegspunkt: Ansicht umschalten und erste Darstellung
function render() {
  document.body.classList.toggle("daily-mode", mode === "daily");
  $("#dailyTab").classList.toggle("active", mode === "daily");
  $("#winterTab").classList.toggle("active", mode === "winter");
  mode === "daily" ? renderDaily() : renderWinter();
}
render();
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && !$("#detail").open) render();
});
