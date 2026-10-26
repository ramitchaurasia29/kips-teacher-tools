/* Worksheet generator 2.0 - INPUT ("Create your worksheet") on the shared input panel:
   textbook card + locked grade, topics, submission date, question formats, difficulty, rubric switch, reference document, Bloom's levels. */

/* first thing still missing; Generate stays disabled until this is '' */
function wsIssue(f = wsForm) {
  const ch = wsChapter(f);
  if (!f.topics.length) return 'Please select at least one topic';
  if (!f.dueDate) return 'Please enter submission date';
  if (f.dueDate < asgToday()) return 'The submission date can’t be in the past';
  if (!f.formats.length) return 'Please select at least one question format';
  if (ch && !ch.content && !f.fileName) return 'This chapter has no textbook content. Please upload a reference document';
  return '';
}

const wsChips = (id, opts, sel, cls = '') => `<div class="ws2-chips ${cls}" id="${id}">${opts.map(([v, l]) => `<button type="button" class="ws2-chip${sel.includes(v) ? ' on' : ''}" data-v="${esc(v)}" aria-pressed="${sel.includes(v)}">${esc(l)}</button>`).join('')}</div>`;
const WS_CAL = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M8 3v4M16 3v4M4 10h16"/></svg>';

function wsFormView() {
  const f = wsForm, chs = agChapters(f.grade, f.subject), ch = wsChapter(f);
  const refLabel = `Reference Document <span class="opt">(Optional)</span> <span class="ws2-tip" title="Add your own material and the worksheet is written from it" tabindex="0">${ic('info', 's')}</span>`;
  const body = [
    ibook(f.subject, `Chapter: ${ch.title}`),
    ilocked('Grade ' + ipReq, 'Grade ' + f.grade),
    chs.length > 1 ? idrField('Chapter', { id: 'wsChapter', placeholder: 'Select a chapter', searchPlaceholder: 'Search chapters', options: chs.map(c => ({ value: c.id, label: c.title })), selected: [f.chapterId],
      onChange: ([c]) => { if (c && c !== wsForm.chapterId) Object.assign(wsForm, { chapterId: c, topics: [], fileName: '' }); wsRedraw(); } }, { req: 1 }) : '',
    ifield('Topics', ilist(ch.topics.map(t => ({ label: t.title, checked: f.topics.includes(t.id), attrs: `data-topic="${t.id}"` })), { empty: 'No topics in this chapter' }), { req: 1 }),
    ifield('Submission Date', `<label class="ws2-date"><span class="ws2-dtile">${WS_CAL}</span><span class="ws2-dtxt${f.dueDate ? ' set' : ''}">${f.dueDate ? esc(wsFmtDate(f.dueDate)) : 'Select date'}</span><input id="wsDue" type="date" min="${asgToday()}" value="${f.dueDate}" aria-label="Submission date"></label>`, { req: 1 }),
    ifield('Question Formats', wsChips('wsFormats', WS_FORMATS, f.formats, 'two'), { req: 1 }),
    ifield('Difficulty Level', wsChips('wsDiff', WS_DIFFS.map(d => [d, d]), f.difficulty ? [f.difficulty] : [], 'three big'), { opt: 1 }),
    `<div class="ws2-sw"><div><b>Include Rubric</b><small>Show grading criteria for this worksheet</small></div><label class="ws2-switch"><input type="checkbox" id="wsRubric" ${f.rubric ? 'checked' : ''} role="switch" aria-label="Include rubric"><i></i></label></div>`,
    ifield(refLabel, `<label class="ws2-up">${ic('doc', 's')}<span>${f.fileName ? esc(f.fileName) : 'Upload Document'}</span><input type="file" id="wsFile" accept=".pdf,.doc,.docx,.txt" hidden></label>`),
    ifield('Bloom’s Level', wsChips('wsBloom', WS_BLOOMS.map(b => [b, b]), f.blooms, 'two'), { opt: 1 }),
  ].join('');
  return ipanel({ formId: 'wsForm', title: 'Create your worksheet', body, issue: wsIssue(f), genId: 'wsGen', genLabel: 'Generate Worksheet', wide: false, tool: 'worksheet-generator-2' });
}

const wsBooks = () => agBooks();
function wsPickBook(b) {
  if (wsForm.grade === b.grade && wsForm.subject === b.subject) return;
  Object.assign(wsForm, { grade: b.grade, subject: b.subject, chapterId: agChapters(b.grade, b.subject)[0].id, topics: [], fileName: '' });
}

function wsRedraw() { ipRedraw(wsFormView(), wsBindForm); }
function wsBindForm() {
  const f = wsForm, touch = () => ipRefresh(wsIssue(f), 'wsGen');
  bindNav($('#view'));
  $$('[data-topic]').forEach(c => c.onchange = () => { f.topics = c.checked ? [...f.topics, c.dataset.topic] : f.topics.filter(t => t !== c.dataset.topic); c.closest('.irow')?.classList.toggle('on', c.checked); touch(); });
  const due = $('#wsDue');
  due.onclick = () => { try { due.showPicker?.(); } catch { } };
  due.onchange = () => { f.dueDate = due.value; const t = $('.ws2-dtxt'); t.textContent = f.dueDate ? wsFmtDate(f.dueDate) : 'Select date'; t.classList.toggle('set', !!f.dueDate); touch(); };
  const chips = (id, key, single) => $$(`#${id} .ws2-chip`).forEach(b => b.onclick = () => {
    const v = b.dataset.v; f[key] = single ? (f[key] === v ? '' : v) : (f[key].includes(v) ? f[key].filter(x => x !== v) : [...f[key], v]);
    $$(`#${id} .ws2-chip`).forEach(x => { const on = single ? f[key] === x.dataset.v : f[key].includes(x.dataset.v); x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); }); touch();
  });
  chips('wsFormats', 'formats'); chips('wsDiff', 'difficulty', true); chips('wsBloom', 'blooms');
  $('#wsRubric').onchange = e => f.rubric = e.target.checked;
  $('#wsFile').onchange = e => { if (e.target.files[0]) { f.fileName = e.target.files[0].name; wsRedraw(); } };
  $('#wsForm').onsubmit = e => { e.preventDefault(); const m = wsIssue(f); if (m) return toast(m); if (tokens < 5) return toast('Not enough tokens'); navigate('#/worksheet-generator-2/generating'); };
}

function wsGeneratingView() {
  const steps = ['Resolving the book and topics', 'Retrieving topic content', 'Writing questions for the chosen formats', 'Writing answers', 'Running checks'];
  $('#view').innerHTML = `<div class="page"><div class="card gen"><div class="orb"></div><h2>Creating your worksheet…</h2><p class="muted" style="margin:6px 0 0">Your inputs are kept safe if anything goes wrong.</p><ul class="pipe">${steps.map(s => `<li><span class="dot">${ic('tick')}</span>${s}</li>`).join('')}</ul></div></div>`;
  let i = 0;
  (function tick() {
    if (location.hash !== '#/worksheet-generator-2/generating') return;
    $$('.pipe li').forEach((li, k) => li.className = k < i ? 'done' : k === i ? 'now' : '');
    if (i++ < steps.length) return void setTimeout(tick, 500);
    try { wsDoc = wsBuild(wsForm); wsView = 'student'; tokens -= 5; navigate('#/worksheet-generator-2/output'); }
    catch (e) { console.error(e); toast('Generation failed – your inputs are saved. Please try again.'); navigate('#/worksheet-generator-2'); }
  })();
}
