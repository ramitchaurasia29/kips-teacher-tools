/* Practice test - INPUT on the shared input panel: book, locked grade, chapters, topics. The 3 sections (long answer, short answer, MCQ) are fixed. */

function ptIssues(f) {
  const out = [], chs = agChapters(f.grade, f.subject);
  if (!f.chapters.length) out.push(['chapters', 'Select at least one chapter.']);
  chs.filter(c => f.chapters.includes(c.id)).forEach(c => {
    if (!c.content && !f.uploadedChapters.includes(c.id)) out.push(['chapters', `“${c.title}” has no textbook content. Remove it or upload its pages.`]);
    if (!c.topics.some(t => f.topics.includes(t.id))) out.push(['chapters', `Select at least one topic in “${c.title}”.`]);
  });
  return out;
}
const ptFirstIssue = f => (ptIssues(f)[0] || [])[1] || '';

function ptFormView() {
  const f = ptForm, chs = agChapters(f.grade, f.subject), issues = ptIssues(f);
  const err = k => issues.filter(i => i[0] === k).map(i => `<div class="errline">${esc(i[1])}</div>`).join('');
  const picked = chs.filter(c => f.chapters.includes(c.id));
  /* only a chapter with no textbook content gets a row: remove it or upload its pages */
  const statusRows = picked.filter(c => !c.content).map(c => { const up = f.uploadedChapters.includes(c.id);
    return `<div class="irow"><span class="itxt">${esc(c.title)}</span>
      <span class="avail ${up ? 'ok' : 'no'}">${up ? 'Pages uploaded' : 'No textbook content'}</span>
      ${!up ? `<label class="btn sm up-btn">${ic('upload', 'xs')} Upload pages<input type="file" data-up="${c.id}" accept=".pdf,.doc,.docx,.txt,image/*" hidden></label>` : ''}</div>`; }).join('');
  const chapterDrop = idropHTML({ id: 'ptCh', multi: true, placeholder: 'Select chapters', searchPlaceholder: 'Search chapters', allLabel: 'Select all chapters', options: chs.map(c => ({ value: c.id, label: c.title })), selected: f.chapters,
    onChange: ids => { const add = ids.filter(i => !f.chapters.includes(i)); f.chapters = ids;
      f.topics = f.topics.filter(t => chs.some(c => ids.includes(c.id) && c.topics.some(x => x.id === t))); // drop topics of removed chapters
      chs.filter(c => add.includes(c.id)).forEach(c => c.topics.forEach(t => f.topics.push(t.id))); ptRedraw(); } });
  const topicDrop = idropHTML({ id: 'ptTopic', multi: true, placeholder: 'Select topics', searchPlaceholder: 'Search topics', allLabel: 'Select all topics', options: picked.flatMap(c => c.topics.map(t => ({ value: t.id, label: t.title, group: c.title }))), selected: f.topics,
    onChange: ids => { f.topics = ids; ptRedraw(); } });
  const body = [
    ibook(`Class ${f.grade} ${f.subject}`, `${f.subject} · KIPS`) + ilocked('Grade', 'Grade ' + f.grade),
    ifield('Chapters', `${chapterDrop}${statusRows ? `<div class="ilist">${statusRows}</div>` : ''}${err('chapters')}`, { req: 1 }),
    f.chapters.length ? ifield('Topics', topicDrop, { opt: 1 }) : '',
  ].join('');
  return ipanel({ formId: 'ptForm', title: 'Practice test', body, issue: ptFirstIssue(f), genId: 'ptGen', genLabel: 'Generate practice test', wide: false, tool: 'practice-test' });
}

const ptBooks = () => agBooks();
function ptPickBook(b) {
  if (ptForm.grade === b.grade && ptForm.subject === b.subject) return;
  Object.assign(ptForm, { grade: b.grade, subject: b.subject, chapters: [], topics: [], uploadedChapters: [] });
}

function ptRedraw() { ipRedraw(ptFormView(), ptBindForm); }
function ptBindForm() {
  const f = ptForm;
  bindNav($('#view'));
  $$('[data-up]').forEach(u => u.onchange = () => { if (u.files[0]) { f.uploadedChapters.push(u.dataset.up); toast(`Pages uploaded: ${u.files[0].name}`); ptRedraw(); } });
  $('#ptForm').onsubmit = e => { e.preventDefault(); const m = ptFirstIssue(f); if (m) return toast(m); if (tokens < 5) return toast('Not enough tokens'); navigate('#/practice-test/generating'); };
}

function ptGeneratingView() {
  const steps = ['Resolving the book and topics', 'Retrieving topic content', 'Writing questions for all 3 sections', 'Writing answers', 'Running checks'];
  $('#view').innerHTML = `<div class="page"><div class="card gen"><div class="orb"></div><h2>Creating your practice test…</h2><p class="muted" style="margin:6px 0 0">Your inputs are kept safe if anything goes wrong.</p><ul class="pipe">${steps.map(s => `<li><span class="dot">${ic('tick')}</span>${s}</li>`).join('')}</ul></div></div>`;
  let i = 0;
  (function tick() {
    if (location.hash !== '#/practice-test/generating') return;
    $$('.pipe li').forEach((li, k) => li.className = k < i ? 'done' : k === i ? 'now' : '');
    if (i++ < steps.length) return void setTimeout(tick, 500);
    try { ptDoc = ptBuild(ptForm); ptView = 'student'; tokens -= 5; navigate('#/practice-test/output'); }
    catch (e) { console.error(e); toast('Generation failed – your inputs are saved. Please try again.'); navigate('#/practice-test'); }
  })();
}
