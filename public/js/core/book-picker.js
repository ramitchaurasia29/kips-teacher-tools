/* =========================================================
   Shared BOOK PICKER - the first screen of every tool.
   Grade / Subject / Search filters, textbook cards grouped by grade, Create / My Creations tabs.
   Choosing a book opens the tool's own input panel as a modal.

   A tool opts in by adding to registerTool():
     books:    () => [{ id, grade (number), subject, title, board? }]   the books this tool can work from
     pickBook: book => void                                             copy the book into the tool's form state
     form:     () => html                                               the input panel (its ipanel() call passes tool: id)
     bind:     () => void                                               wires that panel
   ========================================================= */
const bpState = {};
const bpS = id => bpState[id] || (bpState[id] = { tab: 'create', grade: '', subject: '', q: '', open: false });
const bpTool = id => TOOLS.find(t => t.id === id);
const bpHue = s => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 360, 7);

function bpCover(b) {
  return `<span class="bp-cover" style="--h:${bpHue(b.subject)}"><span class="bp-cls">Class ${b.grade}</span><span class="bp-sub">${esc(b.subject)}</span><span class="bp-gb">${b.grade}</span><span class="bp-nm"><i></i><i></i><i></i></span><span class="bp-pub">KIPS LEARNING</span></span>`;
}

/* the filtered, grouped cards */
function bpResults(id) {
  const t = bpTool(id), s = bpS(id), q = s.q.trim().toLowerCase();
  const list = t.books().filter(b => (s.grade === 'all' || b.grade === +s.grade) && (!s.subject || b.subject === s.subject) && (!q || `${b.title} ${b.subject} ${b.board || ''}`.toLowerCase().includes(q)));
  if (!list.length) return '<div class="bp-empty">No books match your filters.</div>';
  return [...new Set(list.map(b => b.grade))].sort((a, b) => a - b).map(g => {
    const rows = list.filter(b => b.grade === g);
    return `<section class="bp-group"><h2>Grade ${g} <small>(${rows.length} book${rows.length === 1 ? '' : 's'})</small></h2><div class="bp-grid">${rows.map(b => `<button type="button" class="bp-book" data-book="${esc(b.id)}" aria-label="${esc(b.title)}">${bpCover(b)}<span class="bp-name">${esc(b.subject)}</span></button>`).join('')}</div></section>`;
  }).join('');
}

function bpPage(id) {
  const t = bpTool(id), s = bpS(id), all = t.books(), grades = [...new Set(all.map(b => b.grade))].sort((a, b) => a - b);
  if (s.grade !== 'all' && !grades.includes(+s.grade)) s.grade = grades[0] ?? 'all';
  const subjects = [...new Set(all.filter(b => s.grade === 'all' || b.grade === +s.grade).map(b => b.subject))];
  if (s.subject && !subjects.includes(s.subject)) s.subject = '';
  const mine = s.tab === 'mine' ? (t.recent ? t.recent(60) : '') : '';
  const body = s.tab === 'mine'
    ? (mine || `<div class="bp-empty">Nothing saved yet. Your creations will appear here.</div>`)
    : `<div class="bp-filters">
        <div class="bp-f"><label for="bpGrade">GRADE</label><select id="bpGrade" class="bp-sel">${[['all', 'All grades'], ...grades.map(g => [g, 'Grade ' + g])].map(([v, l]) => `<option value="${v}" ${String(v) === String(s.grade) ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
        <div class="bp-f"><label for="bpSubject">SUBJECT</label><select id="bpSubject" class="bp-sel"><option value="">All Subjects</option>${subjects.map(x => `<option ${x === s.subject ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></div>
        <div class="bp-f bp-fs"><label for="bpSearch">SEARCH</label><span class="bp-search">${ic('search', 's')}<input id="bpSearch" placeholder="Search books by title, author, or keyword..." value="${esc(s.q)}" autocomplete="off"></span></div>
      </div><div id="bpResults">${bpResults(id)}</div>`;
  return `<div class="page bp-page"><div class="bp-head"><button type="button" class="bp-back" data-nav="#/tools" aria-label="Back to tools">${ic('back')}</button><h1>${esc(t.name)}</h1></div>
    <p class="bp-desc">${esc(t.pickerDesc || t.desc)}</p>
    <div class="bp-tabs" role="tablist"><button type="button" role="tab" class="${s.tab === 'create' ? 'on' : ''}" data-bptab="create" aria-selected="${s.tab === 'create'}">${ic('book', 's')} Create</button><button type="button" role="tab" class="${s.tab === 'mine' ? 'on' : ''}" data-bptab="mine" aria-selected="${s.tab === 'mine'}">${ic('clock', 's')} My Creations</button></div>
    ${body}</div>`;
}

function bpBindCards(id) {
  const t = bpTool(id);
  $$('.bp-book').forEach(c => c.onclick = () => bpPick(id, t.books().find(b => String(b.id) === c.dataset.book)));
}
function bpBind(id) {
  const s = bpS(id), redraw = () => bpRender(id);
  $$('[data-bptab]').forEach(b => b.onclick = () => { s.tab = b.dataset.bptab; redraw(); });
  $('#bpGrade')?.addEventListener('change', e => { s.grade = e.target.value; redraw(); });
  $('#bpSubject')?.addEventListener('change', e => { s.subject = e.target.value; redraw(); });
  $('#bpSearch')?.addEventListener('input', e => { s.q = e.target.value; $('#bpResults').innerHTML = bpResults(id); bpBindCards(id); });
  bpBindCards(id);
}
function bpRender(id) { const v = $('#view'); idrState.open = null; v.classList.add('bg-white'); v.innerHTML = bpPage(id); bpBind(id); bindNav(v); }

/* open the tool's input panel for a book */
function bpPick(id, book) {
  const t = bpTool(id); if (!book) return;
  t.pickBook(book); bpS(id).open = true;
  $('#view').innerHTML = t.form(); t.bind();
}
function bpClose(id) { bpS(id).open = false; bpRender(id); }

/* a tool's input panel on top of the picker (called from ipanel when it is given `tool`) */
const bpShell = (id, formHtml) => `${bpPage(id)}<div class="bp-overlay" data-bp="${id}">${formHtml}</div>`;

/* route entry for a tool's base path */
function bpEnter(id) { bpS(id).open = false; bpRender(id); }

$('#view').addEventListener('click', e => { const c = e.target.closest('[data-bpclose]'); if (c) bpClose(c.dataset.bpclose); });
document.addEventListener('keydown', e => { if (e.key !== 'Escape') return; const o = $('.bp-overlay'); if (o && !$('#modalRoot').innerHTML) bpClose(o.dataset.bp); });
