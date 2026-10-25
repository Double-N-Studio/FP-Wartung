// Bestätigte Kontrollen ansehen, ohne gespeicherte Ergebnisse zu verändern.
function dailyProtocolsHTML(i) {
  const entries = state.archive.map((r, k) => ({ r, k })).filter(({r}) => r.aircraft === DATA.fleet[i].name);
  return `<details><summary>Abgeschlossene Kontrollen (${entries.length})</summary>${entries.reverse().map(({r,k}) => `<p><button onclick="openDailyProtocol(${i},${k})">${esc(r.signed?.date || '')} · ${esc(r.signed?.name || '')} · Protokoll ansehen</button></p>`).join('')}</details>`;
}
function openDailyProtocol(i, archiveIndex = null) {
  const r = archiveIndex === null ? record(i) : state.archive[archiveIndex];
  if (!r?.signed || (archiveIndex !== null && r.aircraft !== DATA.fleet[i].name)) return;
  selected = i;
  step = 'protocol';
  const groups = r.checklistSnapshot || dailyChecklist(i)?.groups || [];
  let n = 0;
  showDialog(`${DATA.fleet[i].name} · Kontrollprotokoll`, 'Abgeschlossene Kontrolle',
    `<p>${esc(r.signed.date)} · ${esc(r.signed.time)} · bestätigt von <strong>${esc(r.signed.name)}</strong></p><p class="info">Gespeichertes Protokoll · schreibgeschützt</p>${groups.map(g => `<h3>${esc(g.title)}</h3>${g.items.map(t => `<div class="row"><input type="checkbox" disabled ${r.checks[n++] ? 'checked' : ''}><span>${esc(t)}</span></div>`).join('')}`).join('')}<h3>Ausführende Person</h3><p>${esc(r.student || '—')}</p><h3>Bemerkungen</h3><p>${esc(r.note || 'Keine')}</p><h3>Unterschrift</h3>${r.signed.image ? `<img class="signature" src="${esc(r.signed.image)}" alt="Gespeicherte Unterschrift">` : '<p>Keine Bildunterschrift gespeichert.</p>'}`,
    `<button onclick="openDaily(${i})">← Zum Flugzeug</button>`);
}
