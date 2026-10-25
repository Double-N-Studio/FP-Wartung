// Flottenübersicht (Kacheln, Filter, Suche)
function renderDaily() {
  const count = (c) => DATA.fleet.filter((_, i) => status(i) === c).length;
  $("#app").innerHTML =
    `<section class="fleet-overview"><div class="overview-head"><div><div class="eyebrow">Flugbetrieb / Tagesübersicht</div><h1>Unsere Flotte</h1></div><div class="overview-summary"><span class="badge green">${count("green")} KLAR</span><span class="badge red">${count("red")} UNKLAR</span><span class="badge">${count("gray")} CHECK OFFEN</span><span class="small muted">${new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeZone: "Europe/Berlin" }).format(new Date())}</span></div></div><div class="toolbar overview-toolbar">${[
      ["all", "Alle 8 Flugzeuge"],
      ["gray", "Check offen"],
      ["red", "Unklar"],
      ["green", "Klar"],
    ]
      .map(
        ([k, t]) =>
          `<button class="${filter === k ? "selected" : ""}" onclick="filter='${k}';renderDaily()">${t}</button>`,
      )
      .join(
        "",
      )}<input aria-label="Flugzeug suchen" placeholder="Flugzeug suchen …" value="${esc(query)}" oninput="query=this.value;renderCards()"></div><div class="grid fleet-grid" id="cards"></div><p class="overview-note">KLAR = heutige Kontrolle unterschrieben, keine sperrenden Mängel in der Demo. CHECK OFFEN = noch nicht bestätigt. UNKLAR = sperrender oder noch nicht bewerteter Mangel. <a href="#annualWork">↓ Arbeiten im laufenden Jahr</a></p></section><section id="equipment" aria-label="Bodengeräte"></section><section id="annualWork" aria-label="Arbeiten im laufenden Jahr"></section>`;
  renderCards();
  renderWinchOverview();
  renderAnnualWork();
}
function renderCards() {
  $("#cards").innerHTML =
    DATA.fleet
      .map((f, i) => ({ f, i }))
      .filter(
        ({ f, i }) =>
          (filter === "all" || status(i) === filter) &&
          `${f.name} ${f.reg}`.toLowerCase().includes(query.toLowerCase()),
      )
      .map(({ f, i }) => {
        const st = status(i),
          r = record(i),
          n = issues(i).length;
        return `<article class="card fleet-card status-${st}"><button class="aircraft-open" onclick="openDaily(${i})" aria-label="${esc(f.name)}: ${statusText(i)}"><div class="fleet-status"><span>${st === "red" ? "!" : st === "green" ? "✓" : "○"}</span> ${statusText(i)}</div><div class="photo"><img src="${f.img}" alt="${esc(f.name)} des Aero-Clubs Langenselbold"></div><div class="cardbody"><div class="cardline"><h3>${f.name}</h3><span class="reg">${f.reg === "Kennzeichen ergänzen" ? "" : f.reg}</span></div><div class="cardnote" title="${esc(n ? issues(i)[0].text : "")}">${n ? `${blockers(i).length ? blockers(i).length + " sperrend · " : ""}${issues(i).filter((x) => impact(x) === "advisory").length} Piloteninfo · ${issues(i).filter((x) => impact(x) === "cosmetic").length} weitere` : r.signed ? `Unterschrieben · ${esc(r.signed.name)} · ${r.signed.time}` : r.checks.some(Boolean) ? `${completedDailyCount(i)}/${dailyCheckCount(i)} Punkte · Unterschrift fehlt` : dailyChecklist(i) ? "Tageskontrolle starten →" : "Checkliste noch ergänzen"}</div></div></button><button class="quick-check ${dailyChecklist(i) && !r.signed ? "primary" : ""}" onclick="startDaily(${i})" ${!dailyChecklist(i) ? "disabled" : ""}>${r.signed ? "✓ Kontrollprotokoll ansehen" : !dailyChecklist(i) ? "Checkliste folgt" : r.checks.some(Boolean) ? "Vorflugkontrolle fortsetzen →" : "Vorflugkontrolle starten →"}</button></article>`;
      })
      .join("") || '<p class="empty">Kein passendes Flugzeug.</p>';
}
