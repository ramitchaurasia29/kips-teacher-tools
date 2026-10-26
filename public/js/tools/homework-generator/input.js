/* Homework generator - INPUT on the shared input panel: book, locked grade, chapters, topics. Bloom's, difficulty, count and question types are optional. */

function hwIssues(f) {
  const out = [], chs = agChapters(f.grade, f.subject);
  if (!f.chapters.length) out.push(['chapters', 'Select at least one chapter.']);
  chs.filter(c => f.chapters.includes(c.id)).forEach(c => {
    if (!c.content && !f.uploadedChapters.includes(c.id)) out.push(['chapters', `“${c.title}” has no textbook content. Remove it or upload its pages.`]);
    if (!c.topics.some(t => f.topics.includes(t.id))) out.push(['chapters', `Select at least one topic in “${c.title}”.`]);
  });
  if (!(+f.count >= HW_COUNT[0] && +f.count <= HW_COUNT[1])) out.push(['count', `Enter a number of questions between ${HW_COUNT[0]} and ${HW_COUNT[1]}.`]);
  return out;
}
const hwFirstIssue = f => (hwIssues(f)[0] || [])[1] || '';

const hwStep = (val, [min, max]) => `<div class="hw-step"><button type="button" class="hw-sb" data-d="-1" aria-label="Decrease" ${val <= min ? 'disabled' : ''}>−</button><input id="hwCount" class="input" type="number" min="${min}" max="${max}" value="${val}" inputmode="numeric"><button type="button" class="hw-sb" data-d="1" aria-label="Increase" ${val >= max ? 'disabled' : ''}>+</button><span class="hw-range">${min}–${max}</span></div>`;

function hwFormView() {
  const f = hwForm, chs = agChapters(f.grade, f.subject), issues = hwIssues(f);
  const err = k => issues.filter(i => i[0] === k).map(i => `<div class="errline">${esc(i[1])}</div>`).join('');
  const picked = chs.filter(c => f.chapters.includes(c.id));
  /* only a chapter with no textbook content gets a row: remove it or upload its pages */
  const statusRows = picked.filter(c => !c.content).map(c => { const up = f.uploadedChapters.includes(c.id);
    return `<div class="irow"><span class="itxt">${esc(c.title)}</span>
      <span class="avail ${up ? 'ok' : 'no'}">${up ? 'Pages uploaded' : 'No textbook content'}</span>
      ${!up ? `<label class="btn sm up-btn">${ic('upload', 'xs')} Upload pages<input type="file" data-up="${c.id}" accept=".pdf,.doc,.docx,.txt,image/*" hidden></label>` : ''}</div>`; }).join('');
  const chapterDrop = idropHTML({ id: 'hwCh', multi: true, placeholder: 'Select chapters', searchPlaceholder: 'Search chapters', allLabel: 'Select all chapters', options: chs.map(c => ({ value: c.id, label: c.title })), selected: f.chapters,
    onChange: ids => { const add = ids.filter(i => !f.chapters.includes(i)); f.chapters = ids;
      f.topics = f.topics.filter(t => chs.some(c => ids.includes(c.id) && c.topics.some(x => x.id === t))); // drop topics of removed chapters
      chs.filter(c => add.includes(c.id)).forEach(c => c.topics.forEach(t => f.topics.push(t.id))); hwRedraw(); } });
  const topicDrop = idropHTML({ id: 'hwTopic', multi: true, placeholder: 'Select topics', searchPlaceholder: 'Search topics', allLabel: 'Select all topics', options: picked.flatMap(c => c.topics.map(t => ({ value: t.id, label: t.title, group: c.title }))), selected: f.topics,
    onChange: ids => { f.topics = ids; hwRedraw(); } });
  const body = [
    ibook(`Class ${f.grade} ${f.subject}`, `${f.subject} · KIPS`) + ilocked('Grade', 'Grade ' + f.grade),
    ifield('Chapters', `${chapterDrop}${statusRows ? `<div class="ilist">${statusRows}</div>` : ''}${err('chapters')}`, { req: 1 }),
    f.chapters.length ? ifield('Topics', topicDrop, { req: 1 }) : '',
    idrField('Bloom’s Taxonomy', { id: 'hwBloom', multi: true, placeholder: 'Select Bloom’s levels', search: false, allLabel: 'Select all levels', options: BLOOMS.map(b => ({ value: b, label: b })), selected: f.blooms, onChange: ids => { f.blooms = ids; } }, { opt: 1, hint: 'None chosen: a mix of levels is used.' }),
    ifield('Difficulty Level', iselect('hwDiff', DIFFICULTIES, f.difficulty), { opt: 1, for: 'hwDiff' }),
    ifield('Question Count', hwStep(f.count, HW_COUNT) + err('count'), { opt: 1 }),
    idrField('Question Types', { id: 'hwTypes', multi: true, placeholder: 'Select question types', search: false, allLabel: 'Select all types', options: HW_TYPES.map(t => ({ value: t[0], label: t[1] })), selected: f.types, onChange: ids => { f.types = ids; } }, { opt: 1, hint: 'Leave empty and we will choose a mix. Questions are shared evenly between the types you pick.' }),
  ].join('');
  return ipanel({ formId: 'hwForm', title: 'Create your homework', body, issue: hwFirstIssue(f), genId: 'hwGen', genLabel: 'Generate Homework', wide: false, tool: 'homework-generator' });
}

const hwBooks = () => agBooks();
function hwPickBook(b) {
  if (hwForm.grade === b.grade && hwForm.subject === b.subject) return;
  Object.assign(hwForm, { grade: b.grade, subject: b.subject, chapters: [], topics: [], uploadedChapters: [] });
}

function hwRedraw() { ipRedraw(hwFormView(), hwBindForm); }
function hwBindForm() {
  const f = hwForm;
  bindNav($('#view'));
  $$('[data-up]').forEach(u => u.onchange = () => { if (u.files[0]) { f.uploadedChapters.push(u.dataset.up); toast(`Pages uploaded: ${u.files[0].name}`); hwRedraw(); } });
  const touch = () => ipRefresh(hwFirstIssue(f), 'hwGen');
  $('#hwDiff').onchange = e => { f.difficulty = e.target.value; };
  $$('.hw-sb').forEach(b => b.onclick = () => { f.count = Math.max(HW_COUNT[0], Math.min(HW_COUNT[1], (+f.count || HW_COUNT[0]) + +b.dataset.d)); hwRedraw(); });
  $('#hwCount').oninput = e => { f.count = e.target.value === '' ? '' : +e.target.value; touch(); };
  $('#hwCount').onchange = () => { f.count = Math.max(HW_COUNT[0], Math.min(HW_COUNT[1], +f.count || HW_COUNT[0])); hwRedraw(); };
  $('#hwForm').onsubmit = e => { e.preventDefault(); const m = hwFirstIssue(f); if (m) return toast(m); if (tokens < 5) return toast('Not enough tokens'); navigate('#/homework-generator/generating'); };
}

function hwGeneratingView() {
  const steps = ['Resolving the book and topics', 'Retrieving topic content', 'Writing questions for your chosen types', 'Writing answers', 'Running checks'];
  $('#view').innerHTML = `<div class="page"><div class="card gen"><div class="orb"></div><h2>Creating your homework…</h2><p class="muted" style="margin:6px 0 0">Your inputs are kept safe if anything goes wrong.</p><ul class="pipe">${steps.map(s => `<li><span class="dot">${ic('tick')}</span>${s}</li>`).join('')}</ul></div></div>`;
  let i = 0;
  (function tick() {
    if (location.hash !== '#/homework-generator/generating') return;
    $$('.pipe li').forEach((li, k) => li.className = k < i ? 'done' : k === i ? 'now' : '');
    if (i++ < steps.length) return void setTimeout(tick, 500);
    try { hwDoc = hwBuild(hwForm); hwView = 'student'; tokens -= 5; navigate('#/homework-generator/output'); }
    catch (e) { console.error(e); toast('Generation failed – your inputs are saved. Please try again.'); navigate('#/homework-generator'); }
  })();
}
