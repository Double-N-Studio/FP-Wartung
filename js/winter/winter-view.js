// Winterwartungsansicht mit Gantt-Diagramm
function renderWinter() {
  const p = planning(),
    plan = schedule(),
    date = Date.parse(planDate() + "T00:00:00Z"),
    offset = (date - plan.start) / DAY,
    line =
      date >= plan.viewStart && date < plan.viewEnd
        ? ((date - plan.viewStart) / DAY / plan.viewDays) * 100
        : null;
  $("#app").innerHTML =
    `<div class="top"><div><div class="eyebrow">Winterwartung / Saison ${p.year}–${String(p.year + 1).slice(2)}</div><h1>Nacheinander durch den Winter.</h1><p class="muted">Sieben Segelflugzeuge – die Zeiträume passen sich der Reihenfolge an.</p></div><div class="winter-top-actions"><button class="primary" onclick="openWorkForm()">＋ Arbeit hinzufügen</button><span class="badge">${shortDate(plan.start)}${new Date(plan.start).getUTCFullYear()} – ${shortDate(plan.end - DAY)}${new Date(plan.end - DAY).getUTCFullYear()}</span></div></div>${weekendHTML()}<div class="panel"><div class="top"><div><h2>Winterfahrplan</h2><p class="muted small">Am Griff ziehen oder mit ↑ / ↓ verschieben. Die verfügbare Zeit wird gleichmäßig verteilt.</p></div><div class="legend"><span><b></b>Geplanter Zeitraum</span><span><b class="worked"></b>Bearbeitet</span><span><b class="actual"></b>Geprüft / abgeschlossen</span></div></div><details class="plan-settings"><summary>⚙ Planung einstellen</summary><div class="period-controls"><label>Wartungsbeginn<input id="planningStart" type="date" value="${p.startDate}"></label><label>Wartungsende einschließlich<input id="planningEnd" type="date" value="${p.endDate}"></label><button class="primary" onclick="applyPlanningPeriod($('#planningStart').value,$('#planningEnd').value)">Zeitraum übernehmen</button><button onclick="resetPlanningPeriod()">Standard: November – März</button></div><p class="small muted">Oktober und April sind schattierte Randmonate. Regulär wird nur von November bis März geplant; ein abweichender Zeitraum lässt sich ausdrücklich einstellen.</p>${plan.start < Date.UTC(p.year, 10, 1) || plan.end > Date.UTC(p.year + 1, 3, 1) ? '<p class="period-exception">Abweichender Zeitraum: Die Planung nutzt Tage außerhalb von November bis März.</p>' : ""}<div class="plan-controls"><label>Überschneidung zwischen zwei Flugzeugen<select aria-label="Überschneidung in Tagen" onchange="setOverlap(this.value)">${[0, 1, 2, 3, 4, 5].map((n) => `<option value="${n}" ${n === p.overlap ? "selected" : ""}>${n === 0 ? "Keine Überschneidung" : n + " Tage · Werkstatt / Nebenraum"}</option>`).join("")}</select></label><label>Stichtag für Soll / Ist<input type="date" value="${planDate()}" onchange="if(this.value){state.planningDate=this.value;save();renderWinter()}"></label><button onclick="delete state.planningDate;save();renderWinter()">Heute</button></div></details><div class="gantt"><div class="timeline sequential"><div class="ghead"><span>REIHENFOLGE / FLUGZEUG</span><div class="calendar-months">${calendarMonths(
      plan,
    )
      .map(
        (m) =>
          `<span class="${m.reserve ? "reserve-header" : ""}" style="left:${m.left}%;width:${m.width}%">${m.label}${m.reserve ? "<small>Randmonat</small>" : ""}</span>`,
      )
      .join("")}</div><span>FORTSCHRITT</span></div>${plan.rows
      .map((row, k) => {
        const f = DATA.fleet[row.i],
          wp = workProgress(row.i),
          progressValue = wp.workedPct,
          expected = Math.max(
            0,
            Math.min(
              100,
              Math.round(((offset - row.from) / (row.to - row.from)) * 100),
            ),
          ),
          late = progressValue < expected;
        return `<div class="grow plan-row" data-order="${k}"><div class="plan-name"><div class="reorder-controls"><button class="drag-handle" aria-label="${esc(f.name)} verschieben; Pfeiltasten nach oben oder unten" onpointerdown="startReorder(event,${k})" onpointermove="updateReorder(event)" onpointerup="finishReorder(event)" onpointercancel="dragging=null;renderWinter()" onkeydown="if(event.key==='ArrowUp'||event.key==='ArrowDown'){event.preventDefault();moveAircraft(${k},${k}+(event.key==='ArrowUp'?-1:1))}">⠿</button><div><button aria-label="${esc(f.name)} nach oben" ${k === 0 ? "disabled" : ""} onclick="moveAircraft(${k},${k - 1})">↑</button><button aria-label="${esc(f.name)} nach unten" ${k === plan.rows.length - 1 ? "disabled" : ""} onclick="moveAircraft(${k},${k + 1})">↓</button></div></div><button class="gname" onclick="openWinter(${row.i})"><span class="order-number">${k + 1}.</span> ${f.name}<div class="reg">${shortDate(row.start)} – ${shortDate(row.end - DAY)} · ${row.to - row.from} Tage</div></button></div><div class="track">${monthBackground(plan)}${line !== null ? `<div class="today" style="left:${line}%"></div>` : ""}<div class="bar" style="left:${((row.start - plan.viewStart) / DAY / plan.viewDays) * 100}%;width:${((row.to - row.from) / plan.viewDays) * 100}%"></div><div class="bar worked" style="left:${((row.start - plan.viewStart) / DAY / plan.viewDays) * 100}%;width:${((row.to - row.from) / plan.viewDays) * progressValue}%"></div><div class="bar actual verified" style="left:${((row.start - plan.viewStart) / DAY / plan.viewDays) * 100}%;width:${((row.to - row.from) / plan.viewDays) * wp.checkedPct}%"></div>${wp.active ? `<span class="working-marker" title="${wp.active} Arbeit(en) in Bearbeitung" style="left:${((row.start - plan.viewStart) / DAY / plan.viewDays) * 100}%"></span>` : ""}</div><div class="gstatus"><strong>${progressValue}% bearbeitet</strong><span>${wp.checkedPct}% geprüft · Soll ${expected}%</span><span class="activity-text">${wp.active ? wp.active + " in Arbeit · " : ""}${wp.done}/${wp.total} durchgeführt</span></div></div>`;
      })
      .join(
        "",
      )}</div></div><p class="small muted">${line === null ? (offset < 0 ? "Stichtag liegt vor dem Wartungsbeginn." : "Stichtag liegt nach dem Saisonende.") : "Senkrechte Linie: gewählter Stichtag."} ${p.overlap ? `Nur aufeinanderfolgende Flugzeuge überschneiden sich um ${p.overlap} Tage.` : "Jedes Flugzeug beginnt direkt nach dem vorherigen."} Soll: gleichmäßiger Fortschritt im jeweiligen Zeitraum. Orange: bearbeiteter Anteil einschließlich eingetragenem Teilfortschritt. Grün: geprüft und abgeschlossen. Aufgaben sind zunächst gleich gewichtet.</p><div class="info">Planentwurf · Zeitraum, Termine und Reihenfolge werden lokal gespeichert. Standardcheckliste: LS4a. Eigene Arbeiten können für alle sieben Segelflugzeuge ergänzt werden.</div></div><div class="top"><h2>Arbeitsbereiche</h2><button class="primary" onclick="openWinter(3)">LS4a-Wartung öffnen →</button></div><div class="stats">${groups.map((g) => `<div class="stat"><span class="eyebrow">LS 4 a</span><h3>${g}</h3><p class="small muted">${expanded().filter((t) => t.group === g).length} Teilaufgaben</p></div>`).join("")}</div>`;
}
