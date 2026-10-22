/* Assessment generator - INPUT (PRD §4.1 steps 1-5, §5 inputs, §6 total marks) on the shared input panel */

/* Everything that must be fixed before Generate is enabled (§6 validation, §4.1 step 2) */
function agIssues(f) {
  const out = [], chs = agChapters(f.grade, f.subject);
  if (f.assessment === 'Other' && !f.otherName.trim()) out.push(['other', 'Enter a name for this assessment.']);
  if (!f.chapters.length) out.push(['chapters', 'Select at least one chapter.']);
  chs.filter(c => f.chapters.includes(c.id)).forEach(c => {
    if (!c.content && !f.uploadedChapters.includes(c.id)) out.push(['chapters', `“${c.title}” has no textbook content. Remove it or upload its pages.`]);
    if (!c.topics.some(t => f.topics.includes(t.id))) out.push(['chapters', `Select at least one topic in “${c.title}”.`]);
  });
  if (!f.rows.length) out.push(['rows', 'Add at least one question type.']);
  f.rows.forEach((r, i) => { const e = rowError(r, f.subject); if (e) out.push(['row' + i, e]); });
  return out;
}
const agFirstIssue = f => (agIssues(f)[0] || [])[1] || '';

function agPanelHTML() {
  const f = agForm, t = agTotals(f.rows), a = agAssessment(f.assessment), usual = agUsualTotal(f.assessment);
  const differs = t.marks !== usual && t.marks > 0;
  return `<div class="total-panel" id="totalPanel" aria-live="polite">
    <div class="tp-label">Total marks</div><div class="tp-num">${t.marks}</div><div class="tp-sub">${t.marks} marks · ${t.questions} question${t.questions === 1 ? '' : 's'}</div>
    ${differs ? `<div class="tp-note">${esc(a.family)} papers are usually ${usual} marks. This paper is ${t.marks} marks.</div>` : ''}</div>`;
}
function agDiagramLine() {
  const f = agForm, p = +f.diagramPercent || 0, dp = diagramPlan(f.rows, p);
  if (!p) return dp.inherent ? `${dp.inherent} diagram question${dp.inherent === 1 ? '' : 's'} from picture / diagram rows` : 'Off: only picture-based and image/diagram-based rows get diagrams.';
  return `${p}% = ${dp.count} of ${dp.questions} questions` + (dp.raised ? `. Picture / diagram rows already need ${dp.inherent}, so ${dp.inherent} is used.` : '');
}

function agFormView() {
  const f = agForm, chs = agChapters(f.grade, f.subject), types = agTypesFor(f.subject), issues = agIssues(f);
  const err = k => issues.filter(i => i[0] === k).map(i => `<div class="errline">${esc(i[1])}</div>`).join('');
  const picked = chs.filter(c => f.chapters.includes(c.id));
  /* the per-chapter list now only appears for a chapter that still has no textbook content (PRD: remove it or upload its pages) */
  const statusRows = picked.filter(c => !c.content).map(c => { const up = f.uploadedChapters.includes(c.id);
    return `<div class="irow"><span class="itxt">${esc(c.title)}</span>
      <span class="avail ${c.content || up ? 'ok' : 'no'}">${c.content ? 'Textbook content available' : up ? 'Pages uploaded' : 'No textbook content'}</span>
      ${!c.content && !up ? `<label class="btn sm up-btn">${ic('upload', 'xs')} Upload pages<input type="file" data-up="${c.id}" accept=".pdf,.doc,.docx,.txt,image/*" hidden></label>` : ''}</div>`; }).join('');
  const chapterDrop = idropHTML({ id: 'agCh', multi: true, placeholder: 'Select chapters', searchPlaceholder: 'Search chapters', allLabel: 'Select all chapters', options: chs.map(c => ({ value: c.id, label: c.title })), selected: f.chapters,
    onChange: ids => { const add = ids.filter(i => !f.chapters.includes(i)); f.chapters = ids;
      f.topics = f.topics.filter(t => chs.some(c => ids.includes(c.id) && c.topics.some(x => x.id === t))); // drop topics of removed chapters
      chs.filter(c => add.includes(c.id)).forEach(c => c.topics.forEach(t => f.topics.push(t.id))); agRedraw(); } });
  const topicDrop = idropHTML({ id: 'agTopic', multi: true, placeholder: 'Select topics', searchPlaceholder: 'Search topics', allLabel: 'Select all topics', options: picked.flatMap(c => c.topics.map(t => ({ value: t.id, label: t.title, group: c.title }))), selected: f.topics,
    onChange: ids => { f.topics = ids; agRedraw(); } });
  const body = [
    ibook(`Class ${f.grade} ${f.subject}`, `${f.subject} · KIPS`),
    `<div class="irow2">${ifield('School name', `<input id="school" class="input" maxlength="80" value="${esc(f.school)}" placeholder="Printed at the top of the paper">`, { opt: 1, for: 'school' })}${ifield('Time (minutes)', `<input id="time" class="input" type="number" min="1" value="${f.time}">`, { opt: 1, for: 'time' })}</div>`,
    `<div class="irow2">${ilocked('Grade', 'Grade ' + f.grade)}${ilocked('Subject', f.subject)}</div>`,
    `<div class="irow2">${ifield('Assessment name', iselect('assessment', AG_ASSESSMENTS.map(a => a.id), f.assessment), { req: 1, for: 'assessment' })}${f.assessment === 'Other' ? ifield('Name', `<input id="otherName" class="input" maxlength="60" value="${esc(f.otherName)}">${err('other')}`, { req: 1, for: 'otherName' }) : '<div></div>'}</div>`,
    ifield('Chapters', `${chapterDrop}${statusRows ? `<div class="ilist">${statusRows}</div>` : ''}${err('chapters')}`, { req: 1 }),
    f.chapters.length ? ifield('Topics', topicDrop, { opt: 1 }) : '',
    isec('Questions and marks'),
    `<div class="blue-wrap"><div class="rows" id="rowsBox">
      <div class="rowhead"><span>Question type</span><span>Questions</span><span>Marks each</span><span>Subtotal</span><span></span></div>
      ${f.rows.map((r, i) => `<div class="qrow"><select class="input isel" data-r="type" data-i="${i}" aria-label="Question type">${types.some(t => t.id === r.type) ? '' : `<option value="${r.type}" selected>${esc(agType(r.type).label)}</option>`}${types.map(t => `<option value="${t.id}" ${t.id === r.type ? 'selected' : ''}>${esc(t.label)}</option>`).join('')}</select>
        <input class="input" type="number" min="1" max="30" value="${r.count}" data-r="count" data-i="${i}" aria-label="Number of questions">
        <input class="input" type="number" min="1" max="20" value="${r.marks}" data-r="marks" data-i="${i}" aria-label="Marks each">
        <span class="sub" id="sub${i}">${rowSubtotal(r)}</span><button type="button" class="icon-btn" data-rm="${i}" aria-label="Remove row">${ic('trash', 's')}</button>
        <div class="rowerr" id="re${i}">${err('row' + i)}</div></div>`).join('')}
      <button type="button" class="btn sm" id="addRow">${ic('plus', 'xs')} Add row</button>${err('rows')}</div>
      <div id="panelSlot">${agPanelHTML()}</div></div>`,
    isec('Fine-tune'),
    `<div class="irow2">${ifield('Difficulty', iselect('difficulty', DIFFICULTIES, f.difficulty), { opt: 1, for: 'difficulty', hint: 'Mixed: 30% easy, 50% medium, 20% hard.' })}${ifield('Diagram-based questions (%)', `<input id="diag" class="input" type="number" min="0" max="50" step="5" value="${f.diagramPercent}"><span class="ihint" id="diagLine">${esc(agDiagramLine())}</span>`, { opt: 1, for: 'diag' })}</div>`,
    idrField('Bloom’s levels', { id: 'agBloom', multi: true, placeholder: 'Select Bloom’s levels', search: false, options: BLOOMS.map(b => ({ value: b, label: b })), selected: f.blooms, onChange: ids => { f.blooms = ids; } }, { opt: 1, hint: 'None chosen: a grade-appropriate mix is used.' }),
  ].join('');
  return ipanel({ formId: 'agForm', title: 'Assessment generator', body, issue: agFirstIssue(f), genId: 'agGen', genLabel: 'Generate paper', wide: true, tool: 'assessment-generator' });
}

/* book picker: every grade × subject the paper can be built for */
const agBooks = () => AG_GRADES.flatMap(g => agSubjects(g).map(s => ({ id: `${g}|${s}`, grade: g, subject: s, title: `Class ${g} ${s}`, board: 'KIPS' })));
function agPickBook(b) {
  if (agForm.grade === b.grade && agForm.subject === b.subject) return;
  Object.assign(agForm, { grade: b.grade, subject: b.subject, chapters: [], topics: [], uploadedChapters: [] });
}

function agRedraw() { ipRedraw(agFormView(), agBindForm); }
function agBindForm() {
  const f = agForm, redraw = agRedraw;
  const live = () => { // update total, subtotals, errors and footer without losing input focus
    f.rows.forEach((r, i) => { const s = $('#sub' + i), e = $('#re' + i); if (s) s.textContent = rowSubtotal(r); if (e) { const m = rowError(r, f.subject); e.innerHTML = m ? `<div class="errline">${esc(m)}</div>` : ''; } });
    $('#panelSlot').innerHTML = agPanelHTML(); $('#diagLine').textContent = agDiagramLine(); ipRefresh(agFirstIssue(f), 'agGen');
  };
  bindNav($('#view'));
  $('#school').oninput = e => f.school = e.target.value;
  $('#time').oninput = e => f.time = +e.target.value;
  $('#assessment').onchange = e => { f.assessment = e.target.value; f.rows = agRowsFor(f.assessment); f.time = agAssessment(f.assessment).time; redraw(); };
  $('#otherName')?.addEventListener('input', e => { f.otherName = e.target.value; ipRefresh(agFirstIssue(f), 'agGen'); });
  $$('[data-up]').forEach(u => u.onchange = () => { if (u.files[0]) { f.uploadedChapters.push(u.dataset.up); toast(`Pages uploaded: ${u.files[0].name}`); redraw(); } });
  $$('[data-r]').forEach(el => el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', () => { const r = f.rows[+el.dataset.i], k = el.dataset.r; r[k] = k === 'type' ? el.value : el.value === '' ? '' : +el.value; k === 'type' ? redraw() : live(); }));
  $$('[data-rm]').forEach(b => b.onclick = () => { f.rows.splice(+b.dataset.rm, 1); redraw(); });
  $('#addRow').onclick = () => { const used = f.rows.map(r => r.type), t = agTypesFor(f.subject).find(x => !used.includes(x.id)) || agTypesFor(f.subject)[0]; f.rows.push({ type: t.id, count: 1, marks: 1 }); redraw(); };
  $('#difficulty').onchange = e => f.difficulty = e.target.value;
  $('#diag').oninput = e => { f.diagramPercent = Math.max(0, Math.min(50, +e.target.value || 0)); live(); };
  $('#agForm').onsubmit = e => { e.preventDefault(); if (!agIssues(f).length) navigate('#/assessment-generator/generating'); };
}

/* §4.1 step 5 – visible progress */
function agGeneratingView() {
  const steps = ['Building the marks blueprint', 'Allocating topics, difficulty and Bloom’s levels', 'Writing questions with answers and solutions', 'Drawing diagrams', 'Running checks'];
  $('#view').innerHTML = `<div class="page"><div class="card gen"><div class="orb"></div><h2>Generating your paper…</h2><p class="muted" style="margin:6px 0 0">Your inputs are kept safe if anything goes wrong.</p><ul class="pipe">${steps.map(s => `<li><span class="dot">${ic('tick')}</span>${s}</li>`).join('')}</ul></div></div>`;
  let i = 0;
  (function tick() {
    if (location.hash !== '#/assessment-generator/generating') return;
    $$('.pipe li').forEach((li, k) => li.className = k < i ? 'done' : k === i ? 'now' : '');
    if (i++ < steps.length) return void setTimeout(tick, 550);
    try { agSchool.set(agForm.school.trim()); agPaper = buildPaper(agForm); agView = 'student'; tokens -= 5; navigate('#/assessment-generator/output'); }
    catch (e) { console.error(e); toast('Generation failed – your inputs are saved. Please try again.'); navigate('#/assessment-generator'); }
  })();
}
