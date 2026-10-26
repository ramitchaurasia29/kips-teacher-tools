/* Case Study Builder 2.0 - INPUT: book picker first, then the "Case Study Builder" modal.
   Fields: topics, learning objective, number of questions; Advanced options: difficulty, Bloom's level, case study type, length, language, additional instructions. */

/* first thing still missing; Generate stays disabled until this is '' */
function cs2Issue(f = cs2Form) {
  if (!cs2Book(f.bookId)) return 'Please select a book';
  if (!f.topics.length) return 'Please select at least one topic';
  if (!(+f.count >= CS2_COUNT[0] && +f.count <= CS2_COUNT[1])) return `Enter a number of questions between ${CS2_COUNT[0]} and ${CS2_COUNT[1]}`;
  return '';
}

function cs2FormView() {
  const f = cs2Form, b = cs2Book(f.bookId), multi = b && b.chapters.length > 1, rows = [];
  if (b) b.chapters.forEach(c => { if (multi) rows.push({ heading: c.title }); c.topics.forEach(t => rows.push({ label: t.title, checked: f.topics.includes(t.id), attrs: `data-ct="${t.id}"` })); });
  const body = [
    b ? ibook(b.title, `${b.subject} · ${b.board}`) + ilocked('Grade', 'Grade ' + b.grade) : '',
    ifield('Topics', ilist(rows, { empty: 'Select a book first' }), { req: 1 }),
    ifield('Learning objective', `<textarea id="cs2Obj" class="input" placeholder="Optional: what should students be able to do after this case study?">${esc(f.objective)}</textarea>`, { for: 'cs2Obj' }),
    ifield('Number of questions', `<input id="cs2Count" class="input" type="number" min="${CS2_COUNT[0]}" max="${CS2_COUNT[1]}" value="${f.count}" inputmode="numeric">`, { for: 'cs2Count' }),
    `<details class="more" id="cs2More" ${cs2MoreOpen ? 'open' : ''}><summary>Advanced options</summary>
      ${ifield('Difficulty', iselect('cs2Diff', CS2_DIFFS, f.difficulty), { for: 'cs2Diff' })}
      ${ifield('Bloom’s level', `<div class="cs2-chips">${CS2_BLOOMS.map(v => `<button type="button" class="cs2-chip${f.blooms.includes(v) ? ' on' : ''}" data-cbloom="${v}" aria-pressed="${f.blooms.includes(v)}">${v}</button>`).join('')}</div>`)}
      ${ifield('Case study type', iselect('cs2Type', CS2_TYPES, f.type), { for: 'cs2Type' })}
      ${ifield('Length', iselect('cs2Len', CS2_LENGTHS, f.length), { for: 'cs2Len' })}
      ${ifield('Language', iselect('cs2Lang', CS2_LANGS, f.lang), { for: 'cs2Lang' })}
      ${ifield('Additional instructions', `<textarea id="cs2Extra" class="input">${esc(f.extra)}</textarea>`, { for: 'cs2Extra' })}</details>`,
  ].join('');
  return ipanel({ formId: 'cs2Form', title: 'Case Study Builder', body, issue: cs2Issue(f), genId: 'cs2Gen', genLabel: 'Generate Case Study', wide: false, tool: 'case-study-builder-2' });
}

function cs2PickBook(b) {
  if (cs2Form.bookId === b.id) return;
  Object.assign(cs2Form, { bookId: b.id, topics: [] });
}

function cs2Redraw() { ipRedraw(cs2FormView(), cs2BindForm); }
function cs2BindForm() {
  const f = cs2Form, touch = () => ipRefresh(cs2Issue(f), 'cs2Gen'), toggle = (arr, v) => arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];
  bindNav($('#view'));
  $('#cs2More').addEventListener('toggle', e => cs2MoreOpen = e.target.open);
  $$('[data-ct]').forEach(el => el.onchange = () => { f.topics = toggle(f.topics, el.dataset.ct); el.closest('.irow').classList.toggle('on', el.checked); touch(); });
  $('#cs2Obj').oninput = e => f.objective = e.target.value;
  $('#cs2Count').oninput = e => { f.count = e.target.value === '' ? '' : +e.target.value; touch(); };
  $('#cs2Count').onchange = () => { f.count = Math.max(CS2_COUNT[0], Math.min(CS2_COUNT[1], +f.count || CS2_COUNT[0])); cs2Redraw(); };
  $('#cs2Diff').onchange = e => f.difficulty = e.target.value;
  $$('[data-cbloom]').forEach(b => b.onclick = () => { f.blooms = toggle(f.blooms, b.dataset.cbloom); cs2Redraw(); });
  $('#cs2Type').onchange = e => f.type = e.target.value;
  $('#cs2Len').onchange = e => f.length = e.target.value;
  $('#cs2Lang').onchange = e => f.lang = e.target.value;
  $('#cs2Extra').oninput = e => f.extra = e.target.value;
  $('#cs2Form').onsubmit = e => { e.preventDefault(); const m = cs2Issue(f); if (m) return toast(m); if (tokens < 3) return toast('Not enough tokens'); navigate('#/case-study-builder-2/generating'); };
}

/* visible progress while the case study is built */
function cs2GeneratingView() {
  const steps = ['Resolving the book and topics', 'Retrieving topic content', 'Writing the scenario', 'Writing questions', 'Writing answers and explanations', 'Running checks'];
  $('#view').innerHTML = `<div class="page"><div class="card gen"><div class="orb"></div><h2>Creating your case study…</h2><p class="muted" style="margin:6px 0 0">Your inputs are kept safe if anything goes wrong.</p><ul class="pipe">${steps.map(s => `<li><span class="dot">${ic('tick')}</span>${s}</li>`).join('')}</ul></div></div>`;
  let i = 0;
  (function tick() {
    if (location.hash !== '#/case-study-builder-2/generating') return;
    $$('.pipe li').forEach((li, k) => li.className = k < i ? 'done' : k === i ? 'now' : '');
    if (i++ < steps.length) return void setTimeout(tick, 480);
    try { cs2Doc = cs2Build(cs2Form); cs2View = 'student'; tokens -= 3; navigate('#/case-study-builder-2/output'); }
    catch (e) { console.error(e); toast('Generation failed – your inputs are saved. Please try again.'); navigate('#/case-study-builder-2'); }
  })();
}
