/* Quiz Builder 2.0 - INPUT: book picker first, then the "Create your quiz" modal.
   Fields: selected textbook, grade (locked), chapter, topics, number of questions, diagram-based %, question types, difficulty, Bloom's level, school name. */

const QB2_COUNT = [1, 50], QB2_DIAG = [30, 100];

/* first thing still missing; Generate stays disabled until this is '' */
function qb2Issue(f = qb2Form) {
  if (!qb2Book(f.bookId)) return 'Please select a book';
  if (!f.chapterId) return 'Please select a chapter';
  if (!f.topics.length) return 'Please select at least one topic';
  if (!(+f.count >= QB2_COUNT[0] && +f.count <= QB2_COUNT[1])) return `Enter a number of questions between ${QB2_COUNT[0]} and ${QB2_COUNT[1]}`;
  if (!f.types.length) return 'Please select at least one question type';
  if (!f.difficulty) return 'Please select a difficulty level';
  return '';
}

const qb2Step = (id, val, [min, max]) => `<div class="qb2-step"><button type="button" class="qb2-sb" data-step="${id}" data-d="-1" aria-label="Decrease" ${val <= min ? 'disabled' : ''}>−</button><input id="${id}" class="input" type="number" min="${min}" max="${max}" value="${val}" inputmode="numeric"><button type="button" class="qb2-sb" data-step="${id}" data-d="1" aria-label="Increase" ${val >= max ? 'disabled' : ''}>+</button><span class="qb2-range">${min}–${max}</span></div>`;
const qb2Chip = (attr, v, label, on, check = true) => `<button type="button" class="qb2-chip${on ? ' on' : ''}" data-${attr}="${v}" aria-pressed="${on}">${on && check ? ic('tick', 'xs') : ''}${label}</button>`;

function qb2FormView() {
  const f = qb2Form, b = qb2Book(f.bookId), chap = b?.chapters.find(c => c.id === f.chapterId);
  const body = [
    b ? ibook(b.subject, chap ? 'Chapter: ' + chap.title : b.board) + ilocked('Grade', 'Grade ' + b.grade) : '',
    idrField('Chapter', { id: 'qb2Chapter', placeholder: 'Select a chapter', searchPlaceholder: 'Search chapters', options: (b?.chapters || []).map(c => ({ value: c.id, label: c.title })), selected: f.chapterId ? [f.chapterId] : [], empty: 'No chapters for this book',
      onChange: ([c]) => { if (c !== qb2Form.chapterId) { const ch = qb2Book(qb2Form.bookId).chapters.find(x => x.id === c); Object.assign(qb2Form, { chapterId: c, topics: ch.topics.map(t => t.id) }); } qb2Redraw(); } }, { req: 1 }),
    ifield('Topics', ilist((chap?.topics || []).map(t => ({ label: t.title, checked: f.topics.includes(t.id), attrs: `data-qt="${t.id}"` })), { empty: chap ? 'No topics in this chapter' : 'Select a chapter first' }), { req: 1 }),
    ifield('Number of Questions', qb2Step('qb2Count', f.count, QB2_COUNT), { req: 1, cls: 'qb2-f' }),
    ifield('Diagram-based questions (%)', qb2Step('qb2Diag', f.diagramPct, QB2_DIAG), { opt: 1, cls: 'qb2-f' }),
    ifield('Question Types', `<div class="qb2-chips">${QB2_TYPES.map(([v, l]) => qb2Chip('qtype', v, l, f.types.includes(v))).join('')}</div>`, { req: 1 }),
    ifield('Difficulty Level', `<div class="qb2-diffs">${QB2_DIFFS.map(d => `<button type="button" class="qb2-diff${f.difficulty === d ? ' on' : ''}" data-diff="${d}" aria-pressed="${f.difficulty === d}">${d}</button>`).join('')}</div>`, { req: 1 }),
    ifield('Bloom’s Level', `<div class="qb2-chips">${QB2_BLOOMS.map(v => qb2Chip('qbloom', v, v, f.blooms.includes(v))).join('')}</div>`, { opt: 1 }),
    ifield('School Name', `<input id="qb2School" class="input" type="text" placeholder="e.g. International Science Academy" value="${esc(f.school)}">`, { opt: 1, for: 'qb2School' }),
  ].join('');
  return ipanel({ formId: 'qb2Form', title: 'Create your quiz', body, issue: qb2Issue(f), genId: 'qb2Gen', genLabel: 'Generate Quiz', wide: false, tool: 'quiz-builder-2' });
}

function qb2PickBook(b) {
  if (qb2Form.bookId === b.id) return;
  const bk = qb2Book(b.id), one = bk.chapters.length === 1 ? bk.chapters[0] : null;
  Object.assign(qb2Form, { bookId: b.id, chapterId: one ? one.id : '', topics: one ? one.topics.map(t => t.id) : [] });
}

function qb2Redraw() { ipRedraw(qb2FormView(), qb2BindForm); }
function qb2BindForm() {
  const f = qb2Form, touch = () => ipRefresh(qb2Issue(f), 'qb2Gen'), toggle = (arr, v) => arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];
  bindNav($('#view'));
  $$('[data-qt]').forEach(el => el.onchange = () => { f.topics = toggle(f.topics, el.dataset.qt); el.closest('.irow').classList.toggle('on', el.checked); touch(); });
  $$('[data-step]').forEach(b => b.onclick = () => {
    const id = b.dataset.step, [min, max] = id === 'qb2Count' ? QB2_COUNT : QB2_DIAG, key = id === 'qb2Count' ? 'count' : 'diagramPct', step = id === 'qb2Count' ? 1 : 10;
    f[key] = Math.max(min, Math.min(max, (+f[key] || min) + step * +b.dataset.d)); qb2Redraw();
  });
  $('#qb2Count').oninput = e => { f.count = e.target.value === '' ? '' : +e.target.value; touch(); };
  $('#qb2Count').onchange = () => { f.count = Math.max(QB2_COUNT[0], Math.min(QB2_COUNT[1], +f.count || QB2_COUNT[0])); qb2Redraw(); };
  $('#qb2Diag').onchange = e => { f.diagramPct = Math.max(QB2_DIAG[0], Math.min(QB2_DIAG[1], +e.target.value || QB2_DIAG[0])); qb2Redraw(); };
  $$('[data-qtype]').forEach(b => b.onclick = () => { f.types = toggle(f.types, b.dataset.qtype); qb2Redraw(); });
  $$('[data-diff]').forEach(b => b.onclick = () => { f.difficulty = b.dataset.diff; qb2Redraw(); });
  $$('[data-qbloom]').forEach(b => b.onclick = () => { f.blooms = toggle(f.blooms, b.dataset.qbloom); qb2Redraw(); });
  $('#qb2School').oninput = e => f.school = e.target.value;
  $('#qb2Form').onsubmit = e => { e.preventDefault(); const m = qb2Issue(f); if (m) return toast(m); if (tokens < 3) return toast('Not enough tokens'); navigate('#/quiz-builder-2/generating'); };
}

/* visible progress while the quiz is built */
function qb2GeneratingView() {
  const steps = ['Resolving the book, chapter and topics', 'Retrieving topic content', 'Choosing question types and difficulty', 'Writing questions', 'Preparing diagrams', 'Writing answers and explanations', 'Running checks'];
  $('#view').innerHTML = `<div class="page"><div class="card gen"><div class="orb"></div><h2>Creating your quiz…</h2><p class="muted" style="margin:6px 0 0">Your inputs are kept safe if anything goes wrong.</p><ul class="pipe">${steps.map(s => `<li><span class="dot">${ic('tick')}</span>${s}</li>`).join('')}</ul></div></div>`;
  let i = 0;
  (function tick() {
    if (location.hash !== '#/quiz-builder-2/generating') return;
    $$('.pipe li').forEach((li, k) => li.className = k < i ? 'done' : k === i ? 'now' : '');
    if (i++ < steps.length) return void setTimeout(tick, 480);
    try { qb2Doc = qb2Build(qb2Form); qb2View = 'student'; tokens -= 3; navigate('#/quiz-builder-2/output'); }
    catch (e) { console.error(e); toast('Generation failed – your inputs are saved. Please try again.'); navigate('#/quiz-builder-2'); }
  })();
}
