// Mängelmeldungen mit Einstufung und Fotos
let issueDraft = {
    text: "",
    category: "Unklar / Sonstiges",
    location: "",
    priority: "Bewertung erforderlich",
    impact: "blocking",
    photos: [],
  },
  photoBusy = false;
const categories = [
  "Lack / Oberfläche",
  "Struktur / Riss / Verformung",
  "Steuerung / Ruder",
  "Fahrwerk / Bremse",
  "Haube / Cockpit",
  "Instrumente / Elektrik",
  "Antrieb",
  "Unklar / Sonstiges",
];
const priorities = [
  "Bewertung erforderlich",
  "Zeitnah bearbeiten",
  "Dringend prüfen",
];
const impactLabels = {
  blocking: "Sperrend / unklar",
  advisory: "Wichtiger Pilotenhinweis",
  cosmetic: "Weitere Mängel / Lackschäden",
};
function impactOptions(value) {
  return Object.entries(impactLabels)
    .map(
      ([v, t]) =>
        `<option value="${v}" ${v === value ? "selected" : ""}>${t}</option>`,
    )
    .join("");
}
function issueForm() {
  return `<div class="fields"><label>Bedeutung für den Flugbetrieb<select id="issueImpact" onchange="issueDraft.impact=this.value">${impactOptions(issueDraft.impact || "blocking")}</select></label><label>Kategorie<select id="issueCategory" onchange="issueDraft.category=this.value">${categories.map((t) => `<option ${t === issueDraft.category ? "selected" : ""}>${esc(t)}</option>`).join("")}</select></label><label>Dringlichkeit der Meldung<select id="issuePriority" onchange="issueDraft.priority=this.value">${priorities.map((t) => `<option ${t === issueDraft.priority ? "selected" : ""}>${esc(t)}</option>`).join("")}</select></label><label>Position / Bauteil<input id="issueLocation" placeholder="z. B. linker Flügel, Unterseite am Randbogen" value="${esc(issueDraft.location)}" oninput="issueDraft.location=this.value"></label></div><label>Beschreibung<textarea id="issueText" placeholder="Was ist aufgefallen? Größe und Aussehen des Schadens beschreiben." oninput="issueDraft.text=this.value">${esc(issueDraft.text)}</textarea></label><div class="sectiontitle">Fotos zum Mangel</div><p class="small muted">Bei Lackschäden am besten eine Übersicht und eine Nahaufnahme. Bis zu 4 Fotos pro Meldung.</p><div class="photo-actions"><button onclick="$('#cameraInput').click()">Foto aufnehmen</button><button onclick="$('#galleryInput').click()">Bilder auswählen</button><input hidden id="cameraInput" type="file" accept="image/*" capture="environment" onchange="addPhotos(this)"><input hidden id="galleryInput" type="file" accept="image/*" multiple onchange="addPhotos(this)"></div><div id="draftPhotos" class="issue-photos">${draftPhotosHTML()}</div><p id="photoStatus" role="status" class="small muted"></p><p class="small muted">Die Bedeutung steuert den Status: sperrend macht das Flugzeug unklar; Pilotenhinweise bleiben sichtbar; weitere Mängel erscheinen aufklappbar. Nicht bewertete Meldungen gelten zunächst als sperrend.</p>${selected !== "winch" ? `<div class="create-work-from-report"><label><input type="checkbox" ${issueDraft.createWork ? "checked" : ""} onchange="issueDraft.createWork=this.checked;$('#reportWorkFields').hidden=!this.checked"> Arbeit im laufenden Jahr zu diesem Mangel anlegen</label><div id="reportWorkFields" ${issueDraft.createWork ? "" : "hidden"}><label>Titel der Arbeit<input value="${esc(issueDraft.workTitle || "")}" placeholder="z. B. Lackschaden am linken Flügel ausbessern" oninput="issueDraft.workTitle=this.value"></label><p class="small muted">Die Beschreibung und der Verweis auf die Schadensfotos werden übernommen.</p></div></div>` : ""}<button id="saveIssue" class="primary" onclick="addIssue()">Mangel mit Fotos speichern</button>`;
}
function draftPhotosHTML() {
  return issueDraft.photos
    .map(
      (p, k) =>
        `<figure><img src="${p.data}" alt="Foto ${k + 1} zum neuen Mangel"><button aria-label="Foto ${k + 1} entfernen" onclick="issueDraft.photos.splice(${k},1);$('#draftPhotos').innerHTML=draftPhotosHTML()">✕ Entfernen</button></figure>`,
    )
    .join("");
}
function issueCard(x, k) {
  const level = impact(x);
  return `<div class="issue issue-${level}"><strong>${impactLabels[level]} · ${esc(x.date)}</strong><div class="issue-tags"><span class="badge">${esc(x.category || "Nicht klassifiziert")}</span><span class="badge">${esc(x.priority || "Bewertung erforderlich")}</span></div>${x.location ? `<div class="small"><b>Position:</b> ${esc(x.location)}</div>` : ""}<p>${esc(x.text)}</p><div class="issue-photos">${(x.photos || []).map((p, j) => `<button class="photo-thumb" onclick="viewIssuePhoto(${k},${j})" aria-label="Schadensfoto ${j + 1} vergrößern"><img src="${p.data}" alt="Schadensfoto ${j + 1}"></button>`).join("")}</div>${selected === "winch" ? "" : x.workId ? `<span class="badge green">✓ Zusätzliche Arbeit erfasst</span>` : `<button class="small" onclick="workFromIssue(${k})">＋ Arbeit aus diesem Mangel</button>`}<div class="issue-actions"><button onclick="openIssueEdit(${k})">Bearbeiten</button><button onclick="openIssueEdit(${k},'close')">Mangel abschließen</button></div>${issueAudit(x)}</div>`;
}
function viewIssuePhoto(k, j) {
  const x = issues(selected)[k],
    p = x.photos[j];
  $("#photoViewContent").innerHTML =
    `<div class="dhead"><div><h2>Schadensfoto ${j + 1}</h2><span class="small">${esc(x.location || x.category || "Mangel")}</span></div><button onclick="$('#photoView').close()" aria-label="Foto schließen">✕</button></div><img class="full-photo" src="${p.data}" alt="Vergrößertes Schadensfoto"><p style="padding:0 20px">${esc(x.text)}</p>`;
  $("#photoView").showModal();
}
async function compressPhoto(file) {
  if (!file.type.startsWith("image/"))
    throw Error("Bitte eine Bilddatei auswählen.");
  if (file.size > 25 * 1024 * 1024)
    throw Error("Das Bild ist größer als 25 MB.");
  const url = URL.createObjectURL(file);
  try {
    const im = new Image();
    im.src = url;
    await im.decode();
    const scale = Math.min(
        1,
        1400 / Math.max(im.naturalWidth, im.naturalHeight),
      ),
      c = document.createElement("canvas");
    c.width = Math.round(im.naturalWidth * scale);
    c.height = Math.round(im.naturalHeight * scale);
    const ctx = c.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(im, 0, 0, c.width, c.height);
    return { name: file.name, data: c.toDataURL("image/jpeg", 0.72) };
  } catch (e) {
    throw Error(
      "Bild konnte nicht gelesen werden. Bitte JPEG, PNG oder WebP verwenden.",
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}
async function addPhotos(input) {
  if (photoBusy) return;
  photoBusy = true;
  const draft = issueDraft,
    files = Array.from(input.files || []),
    messages = [];
  const saveButton = $("#saveIssue");
  if (saveButton) saveButton.disabled = true;
  $("#photoStatus").textContent = "Fotos werden vorbereitet …";
  try {
    for (const f of files) {
      if (draft.photos.length >= 4) {
        messages.push("Maximal 4 Fotos pro Meldung.");
        break;
      }
      try {
        const photo = await compressPhoto(f);
        draft.photos.push(photo);
      } catch (e) {
        messages.push(e.message);
      }
    }
  } finally {
    photoBusy = false;
    input.value = "";
    if (draft === issueDraft && $("#draftPhotos")) {
      $("#draftPhotos").innerHTML = draftPhotosHTML();
      $("#photoStatus").textContent =
        messages.join(" ") || `${draft.photos.length} Foto(s) hinzugefügt.`;
      $("#saveIssue").disabled = false;
    }
  }
}
function openIssueReport() {
  if (photoBusy) {
    toast("Fotos werden noch vorbereitet. Bitte kurz warten.");
    return;
  }
  const aircraft = issueTarget();
  $("#reportContent").innerHTML =
    `<div class="dhead"><div><div class="eyebrow">${aircraft.name} · ${aircraft.reg}</div><h2>Mangel melden</h2></div><button aria-label="Zur Kontrolle zurück" onclick="$('#reportDialog').close()">✕</button></div><div class="dbody">${issueForm()}</div><div class="dfoot"><button onclick="$('#reportDialog').close()">← ${step === "checks" || step === "sign" ? "Zur Kontrolle" : selected === "winch" ? "Zur Winde" : "Zum Flugzeug"}</button><span class="small muted">Deine bisherigen Eingaben bleiben erhalten.</span></div>`;
  $("#reportDialog").showModal();
}
function addIssue() {
  if (photoBusy) {
    toast("Bitte warten, bis die Fotos geladen sind.");
    return;
  }
  const t = issueDraft.text.trim();
  if (!t) {
    toast("Bitte den Mangel beschreiben.");
    return;
  }
  const list = (state.issues[selected] ??= []),
    issue = {
      id: newId(),
      text: t,
      date: today(),
      open: true,
      impact: issueDraft.impact || "blocking",
      category: issueDraft.category,
      location: issueDraft.location.trim(),
      priority: issueDraft.priority,
      photos: issueDraft.photos.map((p) => ({ ...p })),
    };
  list.push(issue);
  let work = null;
  if (selected !== "winch" && issueDraft.createWork) {
    work = makeCustomWork(
      issueDraft.workTitle?.trim() || "Befund beheben: " + t.slice(0, 90),
      t,
      "Zusätzliche Arbeiten",
      issue.id,
      null,
      { scope: "annual", year: Number(issue.date.slice(0, 4)) },
    );
    customWorks(selected).push(work);
    issue.workId = work.id;
  }
  if (!save()) {
    list.pop();
    if (work) customWorks(selected).pop();
    toast(
      "Speichern fehlgeschlagen. Meldung und Arbeit wurden nicht übernommen.",
    );
    return;
  }
  issueDraft = {
    text: "",
    category: "Unklar / Sonstiges",
    location: "",
    priority: "Bewertung erforderlich",
    impact: "blocking",
    photos: [],
  };
  if ($("#reportDialog").open) $("#reportDialog").close();
  refreshIssueViews();
  toast(
    work
      ? "Mangel und zusätzliche Arbeit gespeichert"
      : "Mangel gespeichert · Kontrolle kann fortgesetzt werden",
  );
}
