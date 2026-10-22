/* Assignment generator - INPUT (PRD §4 steps 1-5, §5 inputs) on the shared input panel */
let asgMoreOpen = false;

/* first thing still missing; Generate stays disabled until this is '' */
function asgIssue(f = asgForm) {
  const b = asgBook(f.bookId);
  if (!b) return 'Please select a book';
  if (!f.topicId) return f.chapterId ? 'Please select a topic' : 'Please select a chapter';
  if (b.noSource && !f.contentChoice) return 'Please add topic content or continue with unverified generation';
  if (!f.type) return 'Please select an assignment type';
  if (!f.dueDate) return 'Please choose a submission date';
  if (f.dueDate < asgToday()) return 'The submission date can’t be in the past';
  if (!(+f.time > 0)) return 'Please enter the completion time in minutes';
  if (f.taskCount !== 'ai' && !(+f.taskCount >= 1 && +f.taskCount <= 40)) return 'Enter a number of tasks between 1 and 40';
  if (f.marksMode === 'custom' && !(+f.marks >= 1)) return 'Enter the total marks or choose No marks';
  return '';
}

/* Recently saved assignments (also shown on the hub) */
function asgRecentHTML(limit = 6) {
  const l = asgStore.all().slice(0, limit); if (!l.length) return '';
  return `<div class="section-title"><h3>Saved assignments</h3></div><div class="draft-row">${l.map(d => `<button class="card draft" data-nav="#/assignment-generator/open/${d.id}"><span class="ti">${ic('doc')}</span><span><b>${esc(d.data.metadata.topic)}</b><small>${esc(d.data.metadata.type_label)} · Class ${esc(d.data.metadata.grade)} ${esc(d.data.metadata.subject)}${d.published ? ' · Shared' : ''}</small></span></button>`).join('')}</div>`;
}

const asgToggle = (id, label, desc, on) => `<label class="asg-tog"><span><b>${label}</b><small>${desc}</small></span><input type="checkbox" id="${id}" ${on ? 'checked' : ''} role="switch"></label>`;

function asgFormView() {
  const f = asgForm, b = asgBook(f.bookId), T = asgType(f.type), found = b && f.topicId ? asgFind(b, f.topicId) : null, tp = found?.topic;
  const src = !b ? null
    : b.noSource ? ['warn', 'alert', `Textbook content for this book isn’t available yet. Add your own topic content, or continue with <b>unverified</b> generation. The assignment will carry an “Unverified” label.
        <span class="asg-src-acts"><label class="btn sm">${ic('upload', 'xs')} ${f.fileName ? esc(f.fileName) : 'Add topic content'}<input type="file" id="asgFile" accept=".pdf,.doc,.docx,.txt" hidden></label><label class="asg-unv"><input type="checkbox" id="asgUnv" ${f.contentChoice === 'unverified' ? 'checked' : ''}> Continue unverified</label></span>`]
      : null;
  const sug = tp ? asgSuggestions(b, tp) : [];
  const lowRes = f.type === 'research_task' && b && b.grade < 5;
  const chapId = found?.chapter.id || f.chapterId, chap = b?.chapters.find(c => c.id === chapId);
  const marksOn = f.marksMode === 'custom';
  const body = [
    b ? ibook(b.title, `${b.subject} · ${b.board}`) + ilocked('Grade', 'Grade ' + b.grade) : '',
    idrField('Chapter', { id: 'asgChapter', placeholder: 'Select a chapter', searchPlaceholder: 'Search chapters', options: (b?.chapters || []).map(c => ({ value: c.id, label: c.title })), selected: chapId ? [chapId] : [], empty: 'No chapters for this book',
      onChange: ([c]) => { if (c !== asgForm.chapterId) Object.assign(asgForm, { chapterId: c, topicId: '', subtopic: '' }); asgRedraw(); } }, { req: 1, hint: f.type === 'chapter_revision' && chap ? 'The whole chapter is covered.' : '' }),
    idrField('Topic', { id: 'asgTopicDd', placeholder: chap ? 'Select a topic' : 'Select a chapter first', searchPlaceholder: 'Search topics', disabled: !chap, options: (chap?.topics || []).map(t => ({ value: t.id, label: t.title })), selected: f.topicId ? [f.topicId] : [], empty: 'No topics in this chapter',
      onChange: ([t]) => { asgForm.topicId = t; asgForm.subtopic = ''; asgRedraw(); } }, { req: 1 }),
    tp?.subs.length ? ifield('Subtopic', iselect('asgSub', tp.subs, f.subtopic, 'Whole topic'), { opt: 1, for: 'asgSub' }) : '',
    src ? `<div class="asg-src ${src[0]}">${ic(src[1])}<div>${src[2]}</div></div>` : '',
    ifield('Assignment type', iselect('asgType', ASG_TYPES.map(t => [t.id, t.label]), f.type), { req: 1, for: 'asgType', hint: lowRes ? 'For students below Grade 5 this becomes “Ask and find out” with family and book sources.' : T.desc }),
    ifield('Submission date', `<input id="asgDue" class="input" type="date" min="${asgToday()}" value="${f.dueDate}">`, { req: 1, for: 'asgDue', hint: 'Printed on the Student View as “Submit by”.' }),
    `<div class="irow2">${ifield('Completion time', iselect('asgTime', [...ASG_TIMES.map(t => [t, t + ' minutes']), ['custom', 'Custom']], f.timeCustom ? 'custom' : f.time), { req: 1, for: 'asgTime', hint: f.type === 'project' ? 'For a project this is the total working time across days.' : '' })}${ifield('Difficulty', iselect('asgDiff', ASG_DIFFS, f.difficulty), { for: 'asgDiff', hint: f.difficulty === 'Mixed' ? 'About 30% easy, 50% medium, 20% hard.' : '' })}</div>`,
    f.timeCustom ? ifield('Custom time (minutes)', `<input id="asgTimeN" class="input" type="number" min="5" max="600" value="${f.time}">`, { req: 1, for: 'asgTimeN' }) : '',
    ifield('Learning objective', `<textarea id="asgObj" class="input" placeholder="Leave blank and we will write one from the topic">${esc(f.objective)}</textarea>${sug.length ? `<div class="asg-sug">${sug.map((s, i) => `<button type="button" class="asg-chip" data-sug="${i}">${esc(s)}</button>`).join('')}</div>` : ''}`, { opt: 1, for: 'asgObj' }),
    `<details class="more" id="asgMore" ${asgMoreOpen ? 'open' : ''}><summary>More options</summary>
      ${idrField('Task formats', { id: 'asgFormats', multi: true, placeholder: 'Select task formats', search: false, allLabel: 'Select all formats', options: ASG_FORMATS.map(x => ({ value: x[0], label: x[1] })), selected: f.formats, onChange: ids => { f.formats = ids; } }, { opt: 1, hint:`Recommended for this type: ${T.rec}. Leave all unticked to use it.` })}
      <div class="irow2 asg-in${f.taskCount !== 'ai' ? '' : ' one'}">${ifield('Number of tasks', iselect('asgCountMode', [['ai', 'AI recommends'], ['set', 'Set a number']], f.taskCount === 'ai' ? 'ai' : 'set'), { opt: 1, for: 'asgCountMode' })}${f.taskCount !== 'ai' ? ifield('Tasks (1 to 40)', `<input id="asgCountN" class="input" type="number" min="1" max="40" value="${f.taskCount}">`, { for: 'asgCountN' }) : ''}</div>
      <div class="irow2 asg-in${marksOn ? '' : ' one'}">${ifield('Marks', iselect('asgMarksMode', [['custom', 'Custom marks'], ['none', 'No marks']], f.marksMode), { opt: 1, for: 'asgMarksMode' })}${marksOn ? ifield('Total marks', `<input id="asgMarks" class="input" type="number" min="1" max="200" value="${f.marks}">`, { for: 'asgMarks' }) : ''}</div>
      ${marksOn ? asgToggle('asgRubric', 'Include rubric', 'Criteria with full, partial and not yet levels.', f.rubric) + asgToggle('asgStuMarks', 'Show marks in Student View', 'Off hides marks and the rubric from students.', f.studentMarks) : ''}
      ${ifield('Additional instructions', `<textarea id="asgExtra" class="input" placeholder="Word limit, formatting, examples, restrictions, materials">${esc(f.extra)}</textarea>`, { opt: 1, for: 'asgExtra' })}
      ${idrField('Bloom’s levels', { id: 'asgBloom', multi: true, placeholder: 'Select Bloom’s levels', search: false, options: ASG_BLOOMS.map(b => ({ value: b, label: b })), selected: f.blooms || [], onChange: ids => { f.blooms = ids; } }, { opt: 1, hint: 'None chosen: levels are recommended from the assignment type and grade.' })}</details>`,
  ].join('');
  return ipanel({ formId: 'asgForm', title: 'Assignment generator', body, issue: asgIssue(f), genId: 'asgGen', genLabel: 'Generate assignment', wide: false,
    tool: 'assignment-generator' });
}

/* book picker: the books that have a chapter and topic catalogue */
const asgBooks = () => ASG_BOOKS.map(b => ({ id: b.id, grade: b.grade, subject: b.subject, title: b.title, board: b.board }));
function asgPickBook(b) {
  if (asgForm.bookId === b.id) return;
  const bk = asgBook(b.id);
  Object.assign(asgForm, { bookId: b.id, chapterId: bk.chapters.length === 1 ? bk.chapters[0].id : '', topicId: '', subtopic: '', contentChoice: '', fileName: '' });
}

function asgRedraw() { ipRedraw(asgFormView(), asgBindForm); }
function asgBindForm() {
  const f = asgForm, redraw = asgRedraw;
  const touch = () => ipRefresh(asgIssue(f), 'asgGen');
  bindNav($('#view'));
  $('#asgMore').addEventListener('toggle', e => asgMoreOpen = e.target.open);
  $('#asgSub')?.addEventListener('change', e => { f.subtopic = e.target.value; redraw(); });
  $('#asgFile')?.addEventListener('change', e => { if (e.target.files[0]) { f.fileName = e.target.files[0].name; f.contentChoice = 'uploaded'; redraw(); } });
  $('#asgUnv')?.addEventListener('change', e => { f.contentChoice = e.target.checked ? 'unverified' : (f.fileName ? 'uploaded' : ''); redraw(); });
  $('#asgType').onchange = e => { f.type = e.target.value; const T = asgType(f.type); f.time = T.time; f.timeCustom = !ASG_TIMES.includes(T.time); if (f.marksMode === 'custom') { f.marks = T.marks; f.rubric = T.rubric; } redraw(); };
  $('#asgDue').oninput = e => { f.dueDate = e.target.value; touch(); };
  $('#asgObj').oninput = e => f.objective = e.target.value;
  $$('[data-sug]').forEach(b => b.onclick = () => { f.objective = sugText(+b.dataset.sug); redraw(); });
  const sugText = i => asgSuggestions(asgBook(f.bookId), asgFind(asgBook(f.bookId), f.topicId).topic)[i];
  $('#asgDiff').onchange = e => { f.difficulty = e.target.value; redraw(); };
  $('#asgTime').onchange = e => { if (e.target.value === 'custom') f.timeCustom = true; else { f.timeCustom = false; f.time = +e.target.value; } redraw(); };
  $('#asgTimeN')?.addEventListener('input', e => { f.time = +e.target.value; touch(); });
  $('#asgCountMode').onchange = e => { f.taskCount = e.target.value === 'ai' ? 'ai' : 8; redraw(); };
  $('#asgCountN')?.addEventListener('input', e => { f.taskCount = e.target.value; touch(); });
  $('#asgMarksMode').onchange = e => { // PRD rows 10-12: turning marks on starts from the type's marks and rubric default, and shows marks in the Student View
    f.marksMode = e.target.value;
    if (f.marksMode === 'custom') { const T = asgType(f.type); f.marks = T.marks; f.rubric = T.rubric; f.studentMarks = true; }
    redraw();
  };
  $('#asgMarks')?.addEventListener('input', e => { f.marks = e.target.value; touch(); });
  $('#asgRubric')?.addEventListener('change', e => f.rubric = e.target.checked);
  $('#asgStuMarks')?.addEventListener('change', e => f.studentMarks = e.target.checked);
  $('#asgExtra').oninput = e => f.extra = e.target.value;
  $('#asgForm').onsubmit = e => { e.preventDefault(); const m = asgIssue(f); if (m) return toast(m); if (tokens < 5) return toast('Not enough tokens'); navigate('#/assignment-generator/generating'); };
}

/* §4 step 5 - visible progress */
function asgGeneratingView() {
  const steps = ['Resolving the book and topic', 'Retrieving topic content', 'Mapping concepts to the objective', 'Planning the assignment for its type', 'Writing tasks and deliverables', 'Writing answer guidance and marks', 'Building the Student View and Teacher View', 'Running checks'];
  $('#view').innerHTML = `<div class="page"><div class="card gen"><div class="orb"></div><h2>Creating your assignment…</h2><p class="muted" style="margin:6px 0 0">Your inputs are kept safe if anything goes wrong.</p><ul class="pipe">${steps.map(s => `<li><span class="dot">${ic('tick')}</span>${s}</li>`).join('')}</ul></div></div>`;
  let i = 0;
  (function tick() {
    if (location.hash !== '#/assignment-generator/generating') return;
    $$('.pipe li').forEach((li, k) => li.className = k < i ? 'done' : k === i ? 'now' : '');
    if (i++ < steps.length) return void setTimeout(tick, 480);
    try { asgDoc = asgNewDoc(asgBuild(asgForm), asgForm); asgView = 'teacher'; tokens -= 5; navigate('#/assignment-generator/output'); }
    catch (e) { console.error(e); toast('Generation failed – your inputs are saved. Please try again.'); navigate('#/assignment-generator'); }
  })();
}

/* ---------- My assignments (§4 step 7): reopen or duplicate ---------- */
function asgMineView() {
  const l = asgStore.all();
  return `<div class="page asg-mine"><div class="asg-mine-h"><button class="icon-btn round" data-nav="#/assignment-generator" aria-label="Back">${ic('back')}</button><div><h1>My assignments</h1><p class="muted">Open a saved assignment or duplicate it to reuse.</p></div></div>
  ${l.length ? `<div class="asg-mine-list">${l.map(d => { const m = d.data.metadata; return `<div class="card asg-mine-row"><span class="ti">${ic('doc')}</span><div class="asg-mine-t"><b>${esc(m.topic)}</b><small>${esc(m.type_label)} · Class ${esc(m.grade)} ${esc(m.subject)} · ${m.marks_enabled ? m.total_marks + ' marks · ' : ''}saved ${esc(d.savedAt || '')}${d.published ? ' · Shared v' + d.published.version : ''}</small></div>
    <button class="btn sm" data-dup="${d.id}">Duplicate</button><button class="btn sm primary" data-nav="#/assignment-generator/open/${d.id}">Open</button></div>`; }).join('')}</div>`
    : `<div class="card asg-empty">${ic('doc')}<b>No saved assignments yet</b><span class="muted">Generate an assignment and press Save. It will appear here.</span><button class="btn primary" data-nav="#/assignment-generator">Create an assignment</button></div>`}</div>`;
}
function asgBindMine() {
  bindNav($('#view'));
  $$('[data-dup]').forEach(b => b.onclick = () => { asgDuplicate(b.dataset.dup); $('#view').innerHTML = asgMineView(); asgBindMine(); toast('Duplicated'); });
}
