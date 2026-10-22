/* Activity designer - INPUT: shared input panel, validation, feasibility prompt, generating screen */

/* Saved activities row (also shown on the hub) */
function draftsHTML(limit = 6) {
  const l = store.all().slice(0, limit); if (!l.length) return '';
  return `<div class="section-title"><h3>Saved activities</h3></div><div class="draft-row">${l.map(d => `<button class="card draft" data-nav="#/activity-designer/open/${d.id}"><span class="ti">${ic('doc')}</span><span><b>${esc(d.data.title)}</b><small>${esc(d.data.meta.subject)} · ${esc(d.data.meta.grade)} · ${d.data.meta.duration} min${d.published ? ' · Shared' : ''}</small></span></button>`).join('')}</div>`;
}

const REQ = [['book', 'Book'], ['topic', 'Topic'], ['type', 'Activity type'], ['grouping', 'Grouping'], ['materials', 'Materials'], ['level', 'Learning level']];
const filled = k => k === 'materials' ? form.materials.length > 0 : !!form[k];

/* first thing still missing (shown in the panel footer; Generate stays disabled until it is '') */
function adIssue(f = form) {
  if (!f.book) return 'Please select a book';
  if (!f.topic) return 'Please select a topic';
  if (BOOKS[f.book].noSource && !f.unverified && !f.fileName) return 'Please upload content or continue with unverified generation';
  if (!f.type) return 'Please select an activity type';
  if (!f.grouping) return 'Please select how students will work';
  if (!f.materials.length) return 'Please select the materials you have';
  if (!f.level) return 'Please select a learning level';
  return '';
}

function formView() {
  const f = form, b = BOOKS[f.book], topics = b ? b.topics : [];
  const src = !b ? null
    : b.noSource ? ['warn', 'alert', `Source content for this book isn’t available yet. Upload your own material below, or continue with <b>unverified general knowledge</b> – the result won’t be marked as textbook-aligned.<label style="display:flex;gap:8px;margin-top:8px;font-weight:600"><input type="checkbox" id="unverified" ${f.unverified ? 'checked' : ''}> Continue with unverified generation</label>`]
      : null;
  const typeDesc = (TYPES.find(t => t[0] === f.type) || [])[2];
  const body = [
    b ? ibook(f.book, `${b.subject} · ${b.board}`) + ilocked('Grade', b.grade) : '',
    idrField('Topic', { id: 'adTopic', placeholder: 'Select a topic', searchPlaceholder: 'Search topics', options: topics.map(t => ({ value: t, label: t })), selected: f.topic ? [f.topic] : [], empty: 'No topics for this book',
      onChange: ([t]) => { form.topic = t; adRedraw(); } }, { req: 1 }),
    src ? `<div class="source ${src[0]}">${ic(src[1])}<div>${src[2]}</div></div>` : '',
    ifield('Activity type', iselect('type', TYPES.map(t => t[0]), f.type, 'Select activity type'), { req: 1, for: 'type', hint: typeDesc }),
    ifield('Grouping', iselect('grouping', GROUPING, f.grouping, 'Select grouping'), { req: 1, for: 'grouping' }),
    f.grouping === 'Groups' ? ifield('Group size', iselect('groupSize', ['2–3 students', '4–5 students', '6–8 students'], f.groupSize), { opt: 1, for: 'groupSize' }) : '',
    ifield('Duration', iselect('duration', DURATIONS.map(d => [d, d + ' minutes']), f.duration, 'Select duration'), { req: 1, for: 'duration' }),
    ifield('Available materials', ilist(MATERIALS.map(m => ({ label: m, checked: f.materials.includes(m), attrs: `data-mat="${esc(m)}"` }))), { req: 1, hint: 'Select all that apply' }),
    ifield('Learning level', iselect('level', LEVELS, f.level, 'Select learning level'), { req: 1, for: 'level' }),
    idrField('Bloom’s levels', { id: 'adBloom', multi: true, placeholder: 'Select Bloom’s levels', searchPlaceholder: 'Search levels', options: AD_BLOOMS.map(x => ({ value: x, label: x })), selected: f.blooms || [], onChange: ids => { form.blooms = ids; } }, { opt: 1, hint: 'None selected: AI recommends from the activity type and grade.' }),
    ifield('Learning objective', `<textarea id="objective" class="input" placeholder="Optional: e.g. Understand how filtration separates insoluble solids from liquids">${esc(f.objective)}</textarea>${f.topic ? `<div class="asg-sug">${adSuggestions(f).map((s, i) => `<button type="button" class="asg-chip" data-sug="${i}">${esc(s)}</button>`).join('')}</div>` : ''}`, { opt: 1, for: 'objective' }),
    ifield('Additional instructions', `<textarea id="extra" class="input" placeholder="Optional: e.g. Avoid heating or special equipment">${esc(f.extra)}</textarea>`, { opt: 1, for: 'extra' }),
    ifield('Upload your own content', `<label class="drop"><input type="file" id="file" accept=".pdf,.doc,.docx,.txt">${ic('upload')}<b>${f.fileName ? esc(f.fileName) : 'Click to upload'}</b><div class="hint">PDF, DOCX or TXT – the activity will be built from your document.</div></label>`, { opt: 1 }),
  ].join('');
  return ipanel({ formId: 'form', title: 'Activity designer', body, issue: adIssue(f), genId: 'genBtn', genLabel: 'Generate activity', tool: 'activity-designer' });
}

/* book picker: the books that have a topic catalogue */
const adBooks = () => Object.entries(BOOKS).map(([k, b]) => ({ id: k, grade: +b.grade.replace(/\D/g, ''), subject: b.subject, title: k, board: b.board }));
function adPickBook(b) {
  if (form.book === b.id) return;
  form.book = b.id; form.topic = ''; form.unverified = false;
}

function adRedraw() { ipRedraw(formView(), bindForm); }
function bindForm() {
  const rerender = adRedraw;
  bindNav($('#view'));
  $('#type').onchange = e => { form.type = e.target.value; rerender(); };
  $('#grouping').onchange = e => { form.grouping = e.target.value; rerender(); };
  $('#groupSize')?.addEventListener('change', e => form.groupSize = e.target.value);
  $('#duration').onchange = e => { form.duration = +e.target.value; };
  $('#level').onchange = e => { form.level = e.target.value; rerender(); };
  $$('[data-mat]').forEach(i => i.onchange = () => { const v = i.dataset.mat, a = form.materials; i.checked ? (form.materials = v === 'No materials' ? [v] : a.filter(x => x !== 'No materials').concat(v)) : (form.materials = a.filter(x => x !== v)); rerender(); });
  $$('[data-sug]').forEach(b => b.onclick = () => { form.objective = adSuggestions(form)[+b.dataset.sug]; rerender(); });
  $('#objective').oninput = e => form.objective = e.target.value;
  $('#extra').oninput = e => form.extra = e.target.value;
  $('#file').onchange = e => { form.fileName = e.target.files[0]?.name || ''; rerender(); };
  $('#unverified')?.addEventListener('change', e => { form.unverified = e.target.checked; rerender(); });
  $('#form').onsubmit = e => { e.preventDefault(); generate(); };
}

async function generate() {
  if (adIssue()) return toast(adIssue());
  if (tokens < 5) return toast('Not enough tokens');
  // PRD §16: explain the limitation and offer a feasible adjustment instead of silently ignoring it
  const fixable = feasibility(form).find(x => x.fix);
  if (fixable) {
    const apply = await confirmModal({ title: 'This may not work in class', body: `${esc(fixable.msg)} Suggested adjustment: <b>${esc(fixable.fixLabel)}</b>.`, ok: fixable.fixLabel, cancel: 'Keep my choice' });
    if (apply) { Object.assign(form, fixable.fix); adRedraw(); toast('Adjusted – review and press Generate'); return; }
  }
  navigate('#/activity-designer/generating');
}

/* INPUT -> OUTPUT transition */
function generatingView() {
  const steps = ['Retrieving topic content', 'Identifying concepts & outcomes', 'Designing the activity', 'Planning timed steps', 'Writing teacher & student versions', 'Validating safety, timing & answers'];
  $('#view').innerHTML = `<div class="page"><div class="card gen"><div class="orb"></div><h2>Designing your activity…</h2><p class="muted" style="margin:6px 0 0">Your inputs are kept safe if anything goes wrong.</p><ul class="pipe">${steps.map(s => `<li><span class="dot">${ic('tick')}</span>${s}</li>`).join('')}</ul></div></div>`;
  let i = 0;
  (function tick() {
    if (location.hash !== '#/activity-designer/generating') return;
    $$('.pipe li').forEach((li, k) => li.className = k < i ? 'done' : k === i ? 'now' : '');
    if (i++ < steps.length) return void setTimeout(tick, 600);
    try { startSession(buildActivity(form, feasibility(form).map(x => x.msg))); tokens -= 5; navigate('#/activity-designer/output'); }
    catch (e) { console.error(e); toast('Generation failed – your inputs are saved. Please try again.'); navigate('#/activity-designer'); }
  })();
}
