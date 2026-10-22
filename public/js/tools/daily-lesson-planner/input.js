/* Daily lesson planner - INPUT (PRD §3: every field is optional; AI Recommended is a valid choice) on the shared input panel */

/* §2: with nothing to go on, ask one concise clarification instead of generating */
const dlpIssue = f => !f.chapters.length ? 'Select at least one chapter to generate the lesson plan.' : !f.topics.length ? 'Select at least one topic to generate the lesson plan.' : '';

function dlpFormView() {
  const f = dlpForm, list = dlpTopics(f.grade, f.bookId), bk = DLP_CATALOGUE.find(b => b.id === f.bookId), customTime = f.duration && !DLP_DURATIONS.includes(+f.duration);
  /* Chapters first (required); Topics then lists only the topics of the chosen chapters, grouped by chapter */
  const chapters = dlpChapters(f.grade, f.bookId), topicOpts = list.filter(t => f.chapters.includes(t.chapterKey));
  const chapterDrop = idrField('Chapters', { id: 'dlpChapter', multi: true, placeholder: 'Select chapters', searchPlaceholder: 'Search chapters', allLabel: 'Select all chapters',
    options: chapters.map(c => ({ value: c.key, label: c.title })), selected: f.chapters, empty: 'No chapters for this book',
    onChange: ids => { f.chapters = ids; f.topics = f.topics.filter(k => ids.some(c => k.startsWith(c + '|'))); dlpRedraw(); } }, { req: 1 });   // drop topics of removed chapters
  const topicDrop = idrField('Topics', { id: 'dlpTopic', multi: true, placeholder: f.chapters.length ? 'Select topics' : 'Select a chapter first', searchPlaceholder: 'Search topics', allLabel: 'Select all topics', disabled: !f.chapters.length,
    options: topicOpts.map(t => ({ value: t.key, label: t.title, group: t.chapter })), selected: f.topics, empty: 'No topics in these chapters',
    onChange: ids => { f.topics = ids; dlpRedraw(); } }, { req: 1 });
  const body = [
    bk ? ibook(`Class ${bk.grade} ${bk.subject}`, bk.subject) + ilocked('Grade', 'Grade ' + bk.grade) : '',
    chapterDrop, topicDrop,
    `<div class="irow2">${ifield('Teaching Style', iselect('style', DLP_STYLES, f.style), { for: 'style' })}${ifield('Pedagogy Approach', iselect('pedagogy', DLP_PEDS, f.pedagogy), { for: 'pedagogy' })}</div>`,
    `<div class="irow2">${ifield('Lesson Duration', iselect('duration', [...DLP_DURATIONS.map(m => [m, m + ' minutes']), ['custom', 'Custom']], customTime ? 'custom' : f.duration, 'Not set (a duration is suggested)'), { opt: 1, for: 'duration' })}${idrField('Bloom’s Levels', { id: 'dlpBloom', multi: true, placeholder: 'Select Bloom’s levels', search: false, options: DLP_BLOOMS.map(b => ({ value: b, label: b })), selected: f.blooms, onChange: ids => { f.blooms = ids; } }, { opt: 1, hint: 'None chosen: a balanced progression is used.' })}</div>`,
    customTime || f.durCustom ? ifield('Custom minutes', `<input id="customDur" class="input" type="number" min="5" max="180" placeholder="Minutes" value="${customTime ? f.duration : ''}">`, { opt: 1, for: 'customDur' }) : '',
    `<div class="irow2">${ifield('Engagement Activity', `<input id="engage" class="input" list="engageList" value="${esc(f.engage)}" placeholder="Choose or type your own"><datalist id="engageList">${DLP_ENGAGE.map(x => `<option value="${esc(x)}">`).join('')}</datalist>`, { opt: 1, for: 'engage' })}
      ${ifield('Homework', `<input id="homework" class="input" list="hwList" value="${esc(f.homework)}" placeholder="Choose or type your own"><datalist id="hwList">${DLP_HOMEWORK.map(x => `<option value="${esc(x)}">`).join('')}</datalist>`, { opt: 1, for: 'homework' })}</div>`,
    ifield('Learning Objectives', `<textarea id="objectives" class="input" placeholder="One per line. Leave blank and measurable objectives are written for you">${esc(f.objectives)}</textarea>`, { opt: 1, for: 'objectives' }),
    ifield('Additional Details', `<textarea id="details" class="input" placeholder="Constraints such as available materials or class size">${esc(f.details)}</textarea>`, { opt: 1, for: 'details' }),
    ifield('Upload Reference Document', `<label class="drop"><input type="file" id="file" accept=".pdf,.doc,.docx,.txt">${ic('upload')}<b>${f.fileName ? esc(f.fileName) : 'Click to upload'}</b><div class="hint">The document is used as the primary source when supplied.</div></label>`, { opt: 1 }),
  ].join('');
  return ipanel({ formId: 'dlpFormEl', title: 'Daily lesson planner', body, issue: dlpIssue(f), genId: 'dlpGen', genLabel: 'Generate lesson plan', wide: true, tool: 'daily-lesson-planner' });
}

/* book picker: the grade and subject entries that have a chapter and topic catalogue */
const dlpBooks = () => DLP_CATALOGUE.map(b => ({ id: b.id, grade: b.grade, subject: b.subject, title: `Class ${b.grade} ${b.subject}` }));
function dlpPickBook(b) {
  if (dlpForm.bookId === b.id) return;
  Object.assign(dlpForm, { bookId: b.id, grade: String(b.grade), chapters: [], topics: [] });
}

function dlpRedraw() { ipRedraw(dlpFormView(), dlpBindForm); }
function dlpBindForm() {
  const f = dlpForm, redraw = dlpRedraw;
  const refresh = () => ipRefresh(dlpIssue(f), 'dlpGen');
  bindNav($('#view'));
  $('#duration').onchange = e => { if (e.target.value === 'custom') { f.durCustom = true; f.duration = ''; } else { f.durCustom = false; f.duration = e.target.value ? +e.target.value : ''; } redraw(); };
  $('#customDur')?.addEventListener('input', e => { f.duration = e.target.value ? +e.target.value : ''; });
  $('#style').onchange = e => f.style = e.target.value; $('#pedagogy').onchange = e => f.pedagogy = e.target.value;
  $('#engage').oninput = e => f.engage = e.target.value; $('#homework').oninput = e => f.homework = e.target.value;
  $('#objectives').oninput = e => f.objectives = e.target.value;
  $('#details').oninput = e => { f.details = e.target.value; refresh(); };
  $('#file').onchange = e => { f.fileName = e.target.files[0]?.name || ''; redraw(); };
  $('#dlpFormEl').onsubmit = e => { e.preventDefault(); if (!dlpIssue(f)) navigate('#/daily-lesson-planner/generating'); };
}

/* §6 pipeline progress */
function dlpGeneratingView() {
  const steps = ['Normalising your inputs', 'Choosing teaching style and pedagogy', 'Drafting the lesson plan', 'Checking timing and sections', 'Preparing the preview'];
  $('#view').innerHTML = `<div class="page"><div class="card gen"><div class="orb"></div><h2>Planning your lesson…</h2><p class="muted" style="margin:6px 0 0">Your inputs are kept safe if anything goes wrong.</p><ul class="pipe">${steps.map(s => `<li><span class="dot">${ic('tick')}</span>${s}</li>`).join('')}</ul></div></div>`;
  let i = 0;
  (function tick() {
    if (location.hash !== '#/daily-lesson-planner/generating') return;
    $$('.pipe li').forEach((li, k) => li.className = k < i ? 'done' : k === i ? 'now' : '');
    if (i++ < steps.length) return void setTimeout(tick, 480);
    try { dlpPlan = dlpBuild(dlpForm); tokens -= 5; navigate('#/daily-lesson-planner/output'); }
    catch (e) { console.error(e); toast('Generation failed – your inputs are saved. Please try again.'); navigate('#/daily-lesson-planner'); }
  })();
}
