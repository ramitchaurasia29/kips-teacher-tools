/* Case Study Builder 2.0 - OUTPUT: Student view (questions only, on A4 paper) and Teacher view (questions + answers) of ONE case study document.
   Sections: A - Scenario (scenario + instructions), B - Questions. Editing follows the other tools: values only (structure fixed),
   every value is a span.ed with a path into the document. Print and Download (Word / PDF) sit in the toolbar. */

const cs2Get = (o, path) => path.split('.').reduce((a, k) => a?.[k], o);
const cs2Set = (o, path, v) => { const ks = path.split('.'), last = ks.pop(); ks.reduce((a, k) => a[k], o)[last] = v; };
/* an editable VALUE inside fixed structure: p = path into the document, ml = may wrap over several lines */
const cs2ed = (p, v, ml) => `<span class="ed${ml ? ' ml' : ''}" data-p="${p}">${esc(v)}</span>`;
const CS2_L = 'ABCD';
const cs2FileName = view => `CaseStudy_${cs2Doc.subject}_Grade${cs2Doc.grade}_${cs2Doc.title}_${view === 'teacher' ? 'Teacher' : 'Student'}`.replace(/[^A-Za-z0-9]+/g, '_').replace(/_+$/, '').slice(0, 80);
const cs2Lines = n => Array.from({ length: n }, () => '<div class="cs2-line"></div>').join('');
const cs2Sec = (letter, name) => `<h2 class="cs2-st"><span>Section ${letter}:</span> ${name}</h2>`;

/* ---------- Answers (Teacher view) ---------- */
function cs2Ans(q, p) {
  const lines = q.type === 'mcq' ? `<div class="cs2-al"><b>${CS2_L[q.correct]})&nbsp; ${esc(q.options[q.correct])}</b></div>`
    : q.ans.map((l, i) => `<div class="cs2-al"><b>${cs2ed(`${p}.ans.${i}`, l, true)}</b></div>`).join('');
  return `<div class="cs2-answ"><div class="cs2-ans">${lines}${q.explanation ? `<p>${cs2ed(`${p}.explanation`, q.explanation, true)}</p>` : ''}</div></div>`;
}

/* ---------- Questions ---------- */
function cs2Q(q, i, t, ex) {
  const p = `questions.${i}`;
  let h = `<p class="cs2-t">${cs2ed(`${p}.text`, q.text, true)}</p>`;
  if (q.type === 'mcq') h += `<div class="cs2-opts">${q.options.map((o, k) => { const ok = t && q.correct === k; return `<div class="cs2-o${ok ? ' ok' : ''}"><span class="cs2-l">${ok ? ic('tick', 'xs') : CS2_L[k]}</span>${cs2ed(`${p}.options.${k}`, o, true)}</div>`; }).join('')}</div>`;
  if (q.type === 'short' && !t) h += `<div class="cs2-lines" data-lines="${p}" data-n="${q.lines}">${cs2Lines(q.lines)}</div>${ex ? '' : `<div class="ed-tools no-print"><button type="button" class="ed-link" data-line="1" data-lq="${p}">+ Add line</button></div>`}`;
  return `<li class="cs2-q" id="cs2-q${q.number}" data-n="${q.number}"><span class="cs2-n">${q.number}</span><div class="cs2-b"><span class="cs2-m">${cs2Marks(q.marks)}</span>${t ? `<span class="cs2-tag">${q.type === 'mcq' ? 'Multiple choice' : 'Short answer'}</span>` : ''}${h}${t ? cs2Ans(q, p) : ''}</div></li>`;
}

/* the case study: heading, student details, title + skills, Section A (scenario + instructions), Section B (questions). ex = export copy (Word) without screen-only parts */
function cs2PaperHTML(D, t, ex) {
  const n = D.questions.length;
  const sheet = `<div class="cs2-sheet"><div class="r1"><span>Name of the student: <i class="cs2-ul w1"></i></span><span>Roll No. <i class="cs2-ul w2"></i></span></div>
    <div class="r2"><span>Class: ${esc(D.grade)}</span><span>Section: <i class="cs2-ul w3"></i></span><span>Time: ${cs2ed('time', D.time)} min</span></div>
    <div class="r3"><span>Subject: ${esc(D.subject)}</span><span>Number of Questions: ${n}</span><span>Marks: ${D.total_marks}</span></div></div>`;
  /* Teacher view: what this case study was built from, as chip groups (replaces the student details block) */
  const grp = (label, vals) => vals.length ? `<div class="cs2-sg"><div class="cs2-sl">${label}</div><div class="cs2-chips">${vals.map(v => `<span class="cs2-sc">${esc(v)}</span>`).join('')}</div></div>` : '';
  const summary = `<div class="cs2-sum">${grp('Topics', D.topics)}${grp('Difficulty', [D.difficulty])}${grp('Bloom’s levels', D.blooms)}${grp('Case study type', [D.typeLabel])}${grp('Length', [D.length])}${grp('Language', [D.lang])}${grp('Learning objective', D.objective ? [D.objective] : [])}</div>`;
  const head = `<div class="cs2-hd"><h1 class="cs2-qh">Case Study</h1>${t ? summary : sheet}

    <h2 class="cs2-title">${cs2ed('title', D.title)}</h2>
    <p class="cs2-meta">${n} question${n === 1 ? '' : 's'} · Skills: ${D.skills.map((s, i) => cs2ed(`skills.${i}`, s)).join(', ')}</p></div>`;
  const secA = `<section class="cs2-sec cs2-a">${cs2Sec('A', 'Scenario')}<div class="cs2-scn">${D.scenario.map((s, i) => `<p>${cs2ed(`scenario.${i}`, s, true)}</p>`).join('')}</div>
    <div class="cs2-ins"><span class="cs2-il">Instructions</span><p>${cs2ed('instruction', D.instruction, true)}</p></div></section>`;
  const chips = t && !ex ? `<div class="cs2-qchips no-print">${D.questions.map(q => `<button type="button" class="cs2-qc" data-go="${q.number}" aria-label="Go to question ${q.number}">${q.number}</button>`).join('')}</div>` : '';
  const barB = `<div class="cs2-bar">${cs2Sec('B', 'Questions')}${t ? `<span class="cs2-cnt">${n} question${n === 1 ? '' : 's'} · ${D.total_marks} marks</span>` : ''}</div>${chips}`;
  return `<article class="cs2-doc${!t && !ex ? ' stu' : ''}">${head}${secA}<section class="cs2-sec cs2-b">${barB}<ol class="cs2-qs">${D.questions.map((q, i) => cs2Q(q, i, t, ex)).join('')}</ol></section></article>`;
}

/* ---------- Screen ---------- */
function cs2OutputView() {
  const D = cs2Doc, t = cs2View === 'teacher';
  return `<div class="toolbar"><div class="toolbar-in">
    <button class="icon-btn round" id="cs2Back" aria-label="Change settings">${ic('back')}</button>
    <div class="tb-title"><small>Case Study Builder 2.0</small><b>${esc(D.title)}</b></div>
    <div class="mode" role="tablist"><button class="${t ? '' : 'on'}" data-view="student" role="tab">Student view</button><button class="${t ? 'on' : ''}" data-view="teacher" role="tab">Teacher view</button></div>
    <div class="acts"><button class="btn" id="cs2Edit">${ic('edit', 's')}<span class="lb">Edit</span></button>${printBtn('cs2Print')}<button class="btn primary" id="cs2Dl" aria-haspopup="dialog">${ic('download', 's')}<span class="lb">Download</span></button></div></div></div>
  <div class="cs2-wrap${t ? '' : ' paper'}" id="cs2Out">${cs2PaperHTML(D, t)}</div>`;
}

/* Student view as A4 sheets: the heading block and Section A open page 1, then every question is placed on the first sheet it fits;
   a question is never split across two sheets and the Section B bar never ends a sheet on its own. Runs after every draw, before anything binds. */
function cs2Paginate(out, D) {
  const art = $('.cs2-doc.stu', out); if (!art) return;
  const hd = $('.cs2-hd', art), secA = $('.cs2-a', art), bar = $('.cs2-bar', art), qs = $$('.cs2-q', art), pages = document.createElement('div'); pages.className = 'cs2-pages';
  art.replaceWith(pages);
  let body, list;
  const over = () => body.scrollHeight > body.clientHeight + 1;
  const add = () => {
    const pg = document.createElement('section'); pg.className = 'cs2-page'; pg.innerHTML = '<div class="cs2-pbody fix"></div><div class="cs2-pfoot"><span></span><span></span></div>';
    pages.append(pg); body = pg.firstChild;
    list = null;
  };
  const newList = () => { list = document.createElement('ol'); list.className = 'cs2-qs'; body.append(list); };
  add();
  [hd, secA, bar].forEach(el => { body.append(el); if (over() && body.children.length > 1) { add(); body.append(el); } });
  qs.forEach(li => {
    if (!list || list.parentNode !== body) newList();
    list.append(li);
    if (over() && (list.children.length > 1 || body.children.length > 1)) {
      const lone = list.children.length === 1 && list.previousElementSibling === bar;
      if (lone) list.remove();
      add(); if (lone) body.append(bar);
      newList(); list.append(li);
    }
  });
  const all = $$('.cs2-page', pages);
  all.forEach((pg, i) => { const f = pg.querySelectorAll('.cs2-pfoot span'); f[0].textContent = `${D.subject} · Class ${D.grade}`; f[1].textContent = `Page ${i + 1} of ${all.length}`; $('.cs2-pbody', pg).classList.remove('fix'); });
}

function cs2BindOutput() {
  const view = $('#view'); view.classList.add('bg-white', 'view-cs2'); view.classList.remove('is-editing');
  const out = $('#cs2Out'), D = () => cs2Doc;
  cs2Paginate(out, D());
  const rerender = () => { const y = view.scrollTop; view.innerHTML = cs2OutputView(); cs2BindOutput(); view.scrollTop = y; };
  const norm = s => String(s ?? '').replace(/\s+/g, ' ').trim();
  const open = () => !!$('.ed[contenteditable="true"]', out);
  const syncTop = () => window.editUI.top($('#cs2Edit'), open());
  const commit = () => { // writes the changed values back into the case study; returns how many values changed
    let n = 0;
    $$('.ed[data-p]', out).forEach(el => {
      const raw = (el.classList.contains('ml') ? el.innerText : el.textContent).trim();
      if (!raw || norm(raw) === norm(cs2Get(D(), el.dataset.p))) return;
      cs2Set(D(), el.dataset.p, raw); n++;
    });
    $$('[data-lines]', out).forEach(el => { const q = cs2Get(D(), el.dataset.lines); if (+el.dataset.n !== q.lines) { q.lines = +el.dataset.n; n++; } });
    return n;
  };
  const keepEdits = () => { if (open()) commit(); };   // leaving, printing or downloading keeps the edits

  $('#cs2Back').onclick = () => { keepEdits(); navigate('#/case-study-builder-2'); };
  $$('[data-view]').forEach(b => b.onclick = async () => {
    if (cs2View === b.dataset.view) return;
    if (open()) { const r = await unsavedModal(); if (r === 'cancel') return; if (r === 'save') commit(); }   // discard: the re-render rebuilds from the saved case study
    cs2View = b.dataset.view; rerender();
  });
  $('#cs2Edit').onclick = () => { // Edit -> Save: every value opens; Save writes them back and closes everything
    if (open()) { const n = commit(); rerender(); toast(n ? `Saved – ${n} change${n === 1 ? '' : 's'}` : 'Saved'); return; }
    $$('.ed', out).forEach(el => { el.contentEditable = 'true'; el.classList.add('editing'); });
    view.classList.add('is-editing'); syncTop(); $('.ed', out)?.focus();
  };
  $$('.ed:not(.ml)', out).forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') e.preventDefault(); }));   // one-line values stay one line

  out.addEventListener('click', e => {
    const g = e.target.closest('[data-go]');   // question chip: scroll that question just below the toolbar and the chips bar
    if (g) { const el = $('#cs2-q' + g.dataset.go), top = el.getBoundingClientRect().top - view.getBoundingClientRect().top + view.scrollTop - (($('.cs2-qchips', out)?.offsetHeight || 0) + ($('.toolbar')?.offsetHeight || 64) + 12); return view.scrollTo({ top, behavior: 'smooth' }); }
    const l = e.target.closest('[data-line]'); if (!l) return;
    const box = out.querySelector(`[data-lines="${l.dataset.lq}"]`), n = Math.max(1, Math.min(20, +box.dataset.n + +l.dataset.line)); box.dataset.n = n; box.innerHTML = cs2Lines(n);
  });

  out.style.setProperty('--cs2-top', ($('.toolbar')?.offsetHeight || 64) + 'px');   // the question chips bar sticks just under the toolbar

  /* print / download of the chosen view */
  bindPrint('cs2Print', { run: v => { keepEdits(); cs2Download(v, 'print'); } });
  $('#cs2Dl').onclick = () => { keepEdits(); downloadModal({ view: cs2View, file: cs2FileName, run: cs2Download, formats: ['word', 'pdf'] }); };
}

function cs2Download(view, fmt) {
  const teacher = view === 'teacher', name = cs2FileName(view), html = cs2PaperHTML(cs2Doc, teacher, true);
  if (!teacher && html.includes('cs2-ans')) return toast('Download blocked: the student case study contains teacher content.');
  if (fmt === 'word') return downloadWord(name, html, 'h1{font-size:22pt;text-align:center}.cs2-sheet{font-weight:bold;margin-bottom:14pt}.cs2-sheet div{margin:5pt 0}.cs2-ul{display:inline-block;border-bottom:1px solid #000;width:120pt}.cs2-title{font-size:18pt;color:#B01E3A}.cs2-meta{color:#555;font-size:10pt}.cs2-st{font-size:14pt;border-bottom:1px solid #ccc}.cs2-st span{color:#E04158}.cs2-scn{background:#F4F4F4;padding:10pt}.cs2-il{font-weight:bold;color:#555}.cs2-qs{list-style:none;padding:0}.cs2-q{margin:14pt 0}.cs2-n{font-weight:bold;color:#E04158;padding-right:8pt}.cs2-m{color:#555;font-size:9pt}.cs2-t{font-weight:bold}.cs2-o{margin:3pt 0}.cs2-l{font-weight:bold;color:#555;padding-right:6pt}.cs2-ans{background:#FDE7EA;border-left:3pt solid #ED4459;padding:6pt 10pt;margin:6pt 0}.cs2-line{border-bottom:1px solid #999;height:22pt}');
  /* PDF and Print both come from the print dialog: show the chosen view first, then restore the open one */
  const t0 = document.title, back = cs2View, show = () => { $('#view').innerHTML = cs2OutputView(); cs2BindOutput(); }; document.title = name;
  if (view !== cs2View) { cs2View = view; show(); }
  const undo = () => { document.title = t0; if (cs2View !== back) { cs2View = back; show(); } window.removeEventListener('afterprint', undo); };
  window.addEventListener('afterprint', undo); setTimeout(() => window.print(), 80);
}
