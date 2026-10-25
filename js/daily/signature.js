// Unterschriftsfeld und Abschluss der Tageskontrolle
function setupSig() {
  signature = false;
  const c = $("#sig"),
    ctx = c.getContext("2d");
  ctx.strokeStyle = "#123c35";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  const pt = (e) => {
    let b = c.getBoundingClientRect();
    return [
      ((e.clientX - b.left) * c.width) / b.width,
      ((e.clientY - b.top) * c.height) / b.height,
    ];
  };
  c.onpointerdown = (e) => {
    pen = true;
    c.setPointerCapture(e.pointerId);
    ctx.beginPath();
    ctx.moveTo(...pt(e));
  };
  c.onpointermove = (e) => {
    if (!pen) return;
    signature = true;
    ctx.lineTo(...pt(e));
    ctx.stroke();
  };
  c.onpointerup = c.onpointercancel = () => (pen = false);
}
function clearSig() {
  $("#sig").getContext("2d").clearRect(0, 0, 900, 240);
  signature = false;
}
function signRecord() {
  const name = $("#signer").value.trim();
  if (!name || $("#pin").value !== "1234" || !signature) {
    toast("Name, Demo-PIN 1234 und Unterschrift erforderlich.");
    return;
  }
  const r = record(selected);
  if (!dailyComplete(selected)) return;
  const signed = {
    name,
    time: new Intl.DateTimeFormat("de-DE", {
      timeStyle: "short",
      timeZone: "Europe/Berlin",
    }).format(new Date()),
    date: today(),
    image: $("#sig").toDataURL(),
  };
  r.signed = signed;
  state.archive.push({
    aircraft: DATA.fleet[selected].name,
    revision: dailyChecklist(selected).revision,
    ...JSON.parse(JSON.stringify(r)),
  });
  if (save()) {
    closeDialog();
    toast("Testprotokoll gespeichert");
  }
}
