/* Activity Designer - OUTPUT
   Teacher View = PRD §6 sections A-I.  Student View = PRD §7 sections A-I.
   Actions = §6 "Teacher View actions" + §9 save / share / print & export. Nothing else. */

const SECTIONS = ['overview', 'objectives', 'materials', 'steps', 'tasksheet', 'outcomes', 'answers', 'rubric', 'diff']; // A..I
const li = arr => arr.map(x => `<li>${esc(x)}</li>`).join('');

/* Student worksheet sections B-I (A = title). Shared by Student View and Teacher section E. */
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
function wsSections(a, roman = false) { // roman: worksheet sections are numbered I-VIII (Student View and the Teacher View task sheet)
  const w = a.worksheet, L = (c, t) => `<h3><i>${roman ? ROMAN['BCDEFGHI'.indexOf(c)] : c}</i>${t}</h3>`;
  return `<div class="ws">${L('B', 'What will you learn?')}<p>${esc(w.learn)}</p></div>
  <div class="ws">${L('C', 'What you need')}<ul class="chk">${a.materials.map(m => `<li>${esc(m.name)}</li>`).join('')}</ul></div>
  <div class="ws">${L('D', 'Your task')}<div class="box">${esc(w.task)}</div></div>
  <div class="ws">${L('E', 'Follow these steps')}<ol>${li(w.steps)}</ol></div>
  <div class="ws">${L('F', 'Record your observations')}
    <div class="tbl"><table><thead><tr><th>What to observe</th><th>Your observation</th></tr></thead><tbody>${w.table.map(r => `<tr><td>${esc(r)}</td><td></td></tr>`).join('')}</tbody></table></div>
    ${w.mcq ? `<div class="mcq"><b>${esc(w.mcq.q)}</b><div class="opts-row">${w.mcq.options.map((o, i) => `<span>${'ABCD'[i]}. ${esc(o)}</span>`).join('')}</div></div>` : ''}
    <div class="drawbox"><span>${esc(w.draw)}</span></div></div>
  <div class="ws">${L('G', 'Think and explain')}<ol>${w.questions.map(q => `<li>${esc(q)}<span class="line"></span><span class="line"></span></li>`).join('')}</ol></div>
  <div class="ws">${L('H', 'Reflection / exit ticket')}<ul>${li(w.reflect)}</ul><div class="exit"><b>Exit ticket</b>${esc(w.exit)}<span class="line"></span></div></div>
  <div class="ws">${L('I', 'Safety instructions')}<div class="safety">${ic('alert')}<div>${esc(w.safety)}</div></div></div>`;
}

const bodies = {
  /* A. Activity overview: title, book/topic, type, duration, grouping & level, short description */
  overview: a => `<h3 class="act-title">${esc(a.title)}</h3><p>${esc(a.description)}</p>
    <div class="derived"><span class="dchip">Book <b>${esc(a.meta.book)}</b></span><span class="dchip">Topic <b>${esc(a.meta.topic)}</b></span><span class="dchip">Activity type <b>${esc(a.meta.type)}</b></span><span class="dchip">Duration <b>${a.meta.duration} min</b></span><span class="dchip">Grouping <b>${esc(a.meta.grouping)}</b></span><span class="dchip">Learning level <b>${esc(a.meta.level)}</b></span></div>
    ${a.notes.map(n => `<div class="notice warn">${ic('alert', 's')}<div>${esc(n)}</div></div>`).join('')}`,
  /* B. Learning objectives */
  objectives: a => `<div class="two"><div class="note"><b class="t">What students should learn</b>${esc(a.objective.learn)}</div><div class="note"><b class="t">What students should be able to demonstrate</b>${esc(a.objective.demonstrate)}</div></div>`,
  /* C. Materials (with quantities, alternatives), preparation, classroom setup */
  materials: a => `<div class="sub-h" style="margin-top:0">Materials${a.meta.grouping.startsWith('Groups') ? ' (per group)' : ''}</div><ul class="mats">${a.materials.map(m => `<li><span><b>${esc(m.name)}</b>${m.alt ? `<small>Alternative: ${esc(m.alt)}</small>` : ''}</span><span class="qty">${esc(m.qty)}</span></li>`).join('')}</ul>
    <div class="sub-h">Teacher preparation</div><ol class="prep">${li(a.prep)}</ol><div class="sub-h">Classroom setup</div><p>${esc(a.setup)}</p>`,
  /* D. Steps: number, title, time, teacher instructions, student actions, questions to ask, expected observations */
  steps: a => `<ol class="tl">${a.steps.map(s => `<li><div class="rl"><span class="nm">${s.n}</span><span class="ln"></span></div><div class="stp"><div class="stp-h"><h3>${esc(s.title)}</h3><span class="dur">${ic('clock', 'xs')} ${s.min} min</span></div>
      <div class="stp-b"><div><div class="k tc">Teacher instructions</div>${esc(s.teacher)}</div><div><div class="k sd">Student actions</div>${esc(s.student)}</div></div>
      <div class="stp-f"><div class="ask"><div class="k">Questions to ask</div>“${esc(s.ask)}”</div><div class="look"><div class="k">Expected observations</div>${esc(s.look)}</div></div></div></li>`).join('')}</ol>`,
  /* E. Student task sheet (same content the student receives) */
  tasksheet: a => `<div class="sheet-note">Edit the worksheet in <a data-go-student>Student view</a>.</div><div class="sheet">${wsSections(a, true)}</div>`,
  /* F. Expected outcomes: observations, correct concepts/results, learning evidence */
  outcomes: a => `<div class="sub-h" style="margin-top:0">Expected student observations</div><ul class="ticks">${li(a.outcomes.obs)}</ul><div class="sub-h">Correct concepts or results</div><ul class="ticks">${li(a.outcomes.concepts)}</ul><div class="sub-h">Learning evidence</div><ul class="ticks">${li(a.outcomes.evidence)}</ul>`,
  /* G. Answer key: model answers, acceptable alternatives, explanations */
  answers: a => `<ol class="ans-list">${a.answers.map((x, i) => `<li><div class="q"><span>Q${i + 1}</span>${esc(x.q)}</div><div class="a"><b>Model answer:</b> ${esc(x.a)}</div>${x.alt ? `<div class="alt"><b>Acceptable alternative:</b> ${esc(x.alt)}</div>` : ''}<div class="alt"><b>Explanation:</b> ${esc(x.why)}</div></li>`).join('')}</ol>`,
  /* H. Assessment rubric: criteria, performance descriptions, marks, total */
  rubric: a => `<div class="tbl"><table><thead><tr><th>Criterion</th><th>Performance description</th><th style="text-align:center">Marks</th></tr></thead><tbody>${a.rubric.map(r => `<tr><td><b>${esc(r.name)}</b></td><td>${esc(r.desc)}</td><td class="pts">${r.pts}</td></tr>`).join('')}</tbody><tfoot><tr><td colspan="2">Total score</td><td class="pts">${marksTotal(a)}</td></tr></tfoot></table></div>`,
  /* I. Differentiation (support / standard / extension) + safety and accessibility */
  diff: a => `<div class="diff"><div class="dcol"><b>Needs additional support</b>${esc(a.diff.support)}</div><div class="dcol"><b>Standard task</b>${esc(a.diff.standard)}</div><div class="dcol"><b>Extension task</b>${esc(a.diff.extension)}</div></div>
    <div class="two" style="margin-top:12px"><div class="safety">${ic('alert')}<div><b>Safety</b><ul>${li(a.safety)}</ul></div></div><div class="access">${ic('users')}<div><b>Accessibility</b><ul>${li(a.access)}</ul></div></div></div>`,
};
const TITLES = { overview: 'Activity overview', objectives: 'Learning objectives', materials: 'Materials & preparation', steps: 'Step-by-step instructions', tasksheet: 'Student task sheet', outcomes: 'Expected outcomes', answers: 'Answer key', rubric: 'Assessment rubric', diff: 'Differentiation & safety' };
const body = id => cur.edits[id] ?? bodies[id](cur.data);

function block(id, i) {
  const ro = id === 'tasksheet', title = TITLES[id];
  const tools = ro ? '' : `<div class="blk-tools"><button class="icon-btn" data-edit="${id}" title="Edit this section" aria-label="Edit ${title}">${ic('edit', 's')}</button></div>`;
  return `<section class="blk" id="sec-${id}" data-id="${id}"><div class="blk-h"><span class="blk-n">${String.fromCharCode(65 + i)}</span><h2>${title}</h2>${tools}</div>
    <div class="blk-body" data-body="${id}" ${ro ? 'data-ro="1"' : ''}>${body(id)}</div></section>`;
}

/* Student View – title (A) + sections B-I */
function paperHTML(a, editable = false) {
  const m = a.meta, chip = (k, v) => `<span><small>${k}</small>${esc(v)}</span>`; // what a student needs to place the activity in the book
  const info = [chip('Class', String(m.grade).replace(/^Grade\s*/i, '')), chip('Subject', m.subject), chip('Topic', m.topic)].join('');
  return `<article class="paper"><div class="paper-top"><h1>${esc(a.title)}</h1><div class="paper-info">${info}</div></div><div class="paper-body" id="ws-body" ${editable ? 'contenteditable="true"' : ''}>
  <div class="meta"><div>Name:</div><div>Class / Section:</div><div>Date:</div><div>Time required: ${a.meta.duration} min</div></div>${wsSections(a, true)}</div></article>`;
}

const hasUnpublished = () => !cur.published || cur.published.editsStr !== JSON.stringify(cur.edits);

function outputView() {
  const a = cur.data, m = a.meta, student = cur.mode === 'student';
  const failed = validate(a).filter(x => !x.ok && !x.label.startsWith('Source')); // PRD §10.11 – only surface problems
  return `<div class="toolbar"><div class="toolbar-in">
    <button class="icon-btn round" id="backBtn" aria-label="Back to inputs">${ic('back')}</button>
    <div class="tb-title"><small>Activity designer</small><b>${esc(m.subject)} (${esc(m.grade)}) · ${esc(m.topic)}</b></div>
    <div class="mode" role="tablist"><button class="${student ? 'on' : ''}" data-mode="student" role="tab">Student View</button><button class="${student ? '' : 'on'}" data-mode="teacher" role="tab">Teacher View</button></div>
    <div class="acts"><button class="btn ${cur.editing ? 'soft' : ''}" id="editAll">${ic(cur.editing ? 'save' : 'edit', 's')}<span class="lb">${cur.editing ? 'Save' : 'Edit'}</span></button>
      ${printBtn('adPrint')}<button class="btn primary" id="dlBtn" aria-haspopup="dialog">${ic('download', 's')}<span class="lb">Download</span></button></div></div></div>
  <div class="out" id="out">
    <div id="pane-teacher" ${student ? 'hidden' : ''}>
      ${a.source.verified ? '' : `<div class="src-line warn">${ic('alert', 's')} ${esc(a.source.note)}</div>`}
      ${failed.map(f => `<div class="notice warn">${ic('alert', 's')}<div><b>${esc(f.label)}:</b> ${esc(f.note)}</div></div>`).join('')}
      ${SECTIONS.map((id, i) => block(id, i)).join('')}</div>
    <div id="pane-student" ${student ? '' : 'hidden'}><div data-body="ws">${cur.edits.ws ?? paperHTML(a)}</div></div></div>`;
}

/* ---------- Edit / save ---------- */
const serialize = el => el.innerHTML.replace(/ contenteditable="(true|false)"/g, '');
function saveDraft(silent) {
  cur.savedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); cur.dirty = false;
  store.put({ id: cur.id, data: cur.data, edits: cur.edits, savedAt: cur.savedAt, published: cur.published, form: cur.form });
  if (!silent) toast('Draft saved');
}
function setEditing(id, on) {
  const el = $(`[data-body="${id}"]`); if (!el) return;
  (id === 'ws' ? $('#ws-body') : el).contentEditable = on; el.closest('.blk')?.classList.toggle('editing', on);
}
function setAllEditing(on) {
  cur.editing = on; $('#view').classList.toggle('is-editing', on); const ids = cur.mode === 'student' ? ['ws'] : SECTIONS;
  ids.forEach(id => { const el = $(`[data-body="${id}"]`); if (!el || el.dataset.ro) return; (id === 'ws' ? $('#ws-body') : el).contentEditable = on; el.closest('.blk')?.classList.toggle('editing', on); });
}

function bindOutput() {
  $('#view').classList.add('bg-white', 'view-ad'); $('#view').classList.toggle('is-editing', !!cur.editing);
  const rerender = () => { const y = $('#view').scrollTop; $('#view').innerHTML = outputView(); bindOutput(); $('#view').scrollTop = y; };
  $('#backBtn').onclick = () => { if (cur.editing) { cur.editing = false; saveDraft(true); } navigate('#/activity-designer'); };
  /* leaving a view with edits open: ask first (Save keeps them, Discard restores the text from when edit mode opened, Cancel stays) */
  const markOpen = () => { if (!anyOpen()) cur._snap = { edits: JSON.stringify(cur.edits), dirty: cur.dirty }; };
  const confirmLeave = async () => {
    if (!anyOpen()) return true;
    const r = await unsavedModal(); if (r === 'cancel') return false;
    if (r === 'save') saveDraft(true); else if (cur._snap) { cur.edits = JSON.parse(cur._snap.edits); cur.dirty = cur._snap.dirty; }
    return true;
  };
  $$('[data-mode]').forEach(b => b.onclick = async () => { if (cur.mode === b.dataset.mode) return; if (!await confirmLeave()) return; cur.mode = b.dataset.mode; cur.editing = false; rerender(); $('#view').scrollTo(0, 0); });
  $('#dlBtn').onclick = () => downloadModal({ view: cur.mode, file: adFileName, run: adDownload, ...AD_DL });
  bindPrint('adPrint', { run: view => adDownload(view, 'print') });
  $$('[data-go-student]').forEach(a => a.onclick = async () => { if (!await confirmLeave()) return; cur.editing = false; cur.mode = 'student'; rerender(); });
  /* top button and section buttons stay in sync: the top one reads Save while ANY section is open */
  const anyOpen = () => !!$('#view [contenteditable="true"]');
  const syncTop = () => { cur.editing = anyOpen(); window.editUI.top($('#editAll'), cur.editing); };
  $('#editAll').onclick = () => { // Edit -> Save: opens every section; Save stores the draft and closes every open section
    if (anyOpen()) { setAllEditing(false); $$('[data-edit]').forEach(b => window.editUI.sec(b, false)); saveDraft(); }
    else { markOpen(); setAllEditing(true); }
    syncTop();
  };
  $$('[data-body]').forEach(el => el.addEventListener('input', () => { el.dataset.touched = 1; cur.edits[el.dataset.body] = serialize(el); cur.dirty = true; }));
  $$('[data-edit]').forEach(b => b.onclick = () => { // pencil -> "tick Done" for that section; Done closes it and keeps the draft saved
    const id = b.dataset.edit, el = $(`[data-body="${id}"]`), on = el.contentEditable !== 'true';
    if (on) markOpen();
    setEditing(id, on); window.editUI.sec(b, on); if (on) el.focus(); else saveDraft(true);
    syncTop();
  });
}

/* ---------- Print and export (PRD §9) – two separate files: Teacher Guide and Student Worksheet (no answer key); PDF or Print ---------- */
const AD_DL = { formats: ['word', 'pdf'] }; // View choices stay "Teacher View" / "Student View" (modal default); each still exports its own file. Print is its own toolbar button
const adFileName = view => { const m = cur.data.meta; return [m.subject, m.grade, m.topic, 'Activity', view === 'teacher' ? 'Teacher_Guide' : 'Student_Worksheet'].join('_').replace(/[^\w]+/g, '_').replace(/_+/g, '_'); };
function adDownload(view, fmt) {
  const name = adFileName(view);
  if (fmt === 'word') { // only the chosen view's pane, without edit tools or notes meant for the screen
    const pane = $(view === 'teacher' ? '#pane-teacher' : '#pane-student').cloneNode(true);
    pane.querySelectorAll('.blk-tools,.no-print,.sheet-note,button,[contenteditable]').forEach(x => x.matches('[contenteditable]') ? x.removeAttribute('contenteditable') : x.remove());
    return downloadWord(name, pane.innerHTML, 'h1,h2,h3{color:#23262F}h2{border-bottom:1px solid #ccc}');
  }
  const t = $('#pane-teacher'), s = $('#pane-student'), prev = [t.hidden, s.hidden], title = document.title;
  document.body.classList.add('print-' + view); t.hidden = s.hidden = false; if (fmt === 'pdf') document.title = name; // the PDF file name comes from the page title
  const undo = () => { document.body.classList.remove('print-' + view); t.hidden = prev[0]; s.hidden = prev[1]; document.title = title; window.removeEventListener('afterprint', undo); };
  window.addEventListener('afterprint', undo); setTimeout(() => window.print(), 60);
}

/* ---------- Share Student Activity (§9): student-only link, revocable, versioned ---------- */
function shareModal() {
  const link = () => `${location.origin}${location.pathname}#/s/${cur.id}`;
  const draw = () => {
    const p = cur.published, un = hasUnpublished();
    $('#modalRoot').innerHTML = `<div class="overlay" id="ov"><div class="modal" role="dialog" aria-modal="true"><h3>Share student activity</h3><p class="muted" style="margin:0">Students only see the worksheet – never the Teacher View or answer key.</p>
      ${p ? `<div class="row"><input class="input" readonly value="${link()}" id="lnk"><button class="btn primary" id="cp">${ic('link', 's')} Copy</button></div>` : ''}
      <div class="ver ${p && un ? 'dirty' : ''}">${ic(p ? (un ? 'alert' : 'tick') : 'info')}<div style="flex:1"><b>${p ? `Version ${p.version} is live` : 'Not published yet'}</b><div class="muted" style="font-size:13px">${p ? (un ? 'You edited after publishing. Students still see the earlier version until you publish.' : 'Students see your latest version.') : 'Publish to create a student link.'}</div></div></div>
      <div style="display:flex;gap:10px;margin-top:16px;justify-content:space-between;flex-wrap:wrap">${p ? '<button class="btn danger" id="rev">Revoke access</button>' : '<span></span>'}<span style="display:flex;gap:8px"><button class="btn" id="cl">Close</button>${!p || un ? `<button class="btn primary" id="pub">${p ? `Publish v${p.version + 1}` : 'Publish & get link'}</button>` : ''}</span></div></div></div>`;
    const close = () => { $('#modalRoot').innerHTML = ''; };
    $('#cl').onclick = close; $('#ov').onclick = e => e.target.id === 'ov' && close();
    $('#cp')?.addEventListener('click', () => { navigator.clipboard?.writeText(link()); toast('Link copied'); });
    $('#pub')?.addEventListener('click', () => { const v = (cur.published?.version || 0) + 1; cur.published = { version: v, at: Date.now(), editsStr: JSON.stringify(cur.edits), data: cur.data, edits: { ...cur.edits } }; saveDraft(true); draw(); toast(`Version ${v} published`); });
    $('#rev')?.addEventListener('click', () => { cur.published = null; saveDraft(true); draw(); toast('Access revoked'); });
  };
  draw();
}

/* Student-facing page opened from a shared link – student content only */
function sharedView(id) {
  const rec = store.get(id);
  if (!rec?.published) return `<div class="page"><div class="card gen">${ic('lock')}<h2 style="margin-top:10px">This activity isn’t available</h2><p class="muted">Access has been revoked or the link is invalid.</p></div></div>`;
  const p = rec.published;
  return `<div class="page" style="max-width:900px">${(p.edits.ws ?? paperHTML(p.data)).replace(/ contenteditable="true"/g, '')}<div style="text-align:center;margin-top:18px"><button class="btn primary" onclick="window.print()">${ic('print', 's')} Print</button></div></div>`;
}
