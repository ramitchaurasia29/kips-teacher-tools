/* Quiz Builder 2.0 - OUTPUT: Student view (questions only) and Teacher view (questions + answers) of ONE quiz document.
   Editing follows the other tools: values only (structure fixed), every value is a span.ed with a path into the document. Print and Download (Word / PDF) sit in the toolbar. */

const qb2Get = (o, path) => path.split('.').reduce((a, k) => a?.[k], o);
const qb2Set = (o, path, v) => { const ks = path.split('.'), last = ks.pop(); ks.reduce((a, k) => a[k], o)[last] = v; };
/* an editable VALUE inside fixed structure: p = path into the document, ml = may wrap over several lines */
const qb2ed = (p, v, ml) => `<span class="ed${ml ? ' ml' : ''}" data-p="${p}">${esc(v)}</span>`;
const QB2_L = 'ABCD';
const QB2_TAG = { mcq: 'Multiple choice', tf: 'True or false', fill: 'Fill in the blank', ar: 'Assertion and reason', case: 'Case study', long: 'Long answer', ordering: 'Ordering', match: 'Match the following', error: 'Error correction' };
/* Teacher view only: the kind of question, so a teacher can see the mix at a glance */
const qb2Tag = (q, t) => t ? `<span class="qb2-tag">${QB2_TAG[q.type] || ''}</span>` : '';
const qb2FileName = view => `Quiz_${qb2Doc.subject}_Grade${qb2Doc.grade}_${qb2Doc.chapter}_${view === 'teacher' ? 'Teacher' : 'Student'}`.replace(/[^A-Za-z0-9]+/g, '_').replace(/_+$/, '').slice(0, 80);

/* ---------- Figures ---------- */
function qb2LineSVG(f) {
  const n = f.end - f.start, W = 640, x0 = 40, step = (W - 2 * x0) / n, X = v => x0 + (v - f.start) * step, ink = '#1b1e2b', a = X(f.from), b = X(f.to), m = (a + b) / 2;
  let o = `<line x1="14" x2="${W - 14}" y1="100" y2="100" stroke="${ink}" stroke-width="2.5"/><path d="M12 100l10-5.5v11zM${W - 12} 100l-10-5.5v11z" fill="${ink}"/>`;
  for (let v = f.start; v <= f.end; v++) o += `<line x1="${X(v)}" x2="${X(v)}" y1="92" y2="108" stroke="${ink}" stroke-width="2"/><text x="${X(v)}" y="134" text-anchor="middle" font-size="17" font-weight="600" fill="${ink}">${v}</text>`;
  o += `<path d="M${a} 92 Q${m} 8 ${b - 2} 90" fill="none" stroke="#D35400" stroke-width="2.5"/><path d="M${b} 94l-3-13 12 6z" fill="#D35400"/><text x="${m}" y="38" text-anchor="middle" font-size="18" font-weight="700" fill="#D35400">?</text>`;
  o += [f.from, f.to].map(v => `<circle cx="${X(v)}" cy="100" r="8" fill="#D98CB3" stroke="${ink}" stroke-width="2"/><text x="${X(v)}" y="${v === f.from ? 66 : 66}" text-anchor="middle" font-size="19" font-weight="700" fill="${ink}" stroke="#fff" stroke-width="4" paint-order="stroke">${v}</text>`).join('');
  return `<svg class="qb2-svg" viewBox="0 0 ${W} 146" role="img" aria-label="${esc(f.title)}">${o}</svg>`;
}
const qb2Lines = n => Array.from({ length: n }, () => '<div class="qb2-line"></div>').join('');
function qb2Fig(q, p, ex) {
  const f = q.figure; if (!f) return '';
  const body = f.img ? `<img class="qb2-img" src="${f.img.src}" alt="${esc(f.img.alt)}">` : f.kind === 'numberline' ? qb2LineSVG(f)
    : `<div class="qb2-ftw"><table class="qb2-ft"><thead><tr>${f.headers.map((h, c) => `<th>${qb2ed(`${p}.figure.headers.${c}`, h)}</th>`).join('')}</tr></thead><tbody>${f.rows.map((r, ri) => `<tr>${r.map((c, ci) => `<td>${c === '' ? '' : qb2ed(`${p}.figure.rows.${ri}.${ci}`, c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  /* edit mode only: a hover pencil on the figure replaces its image (never removes it) */
  const pick = ex ? '' : `<button type="button" class="dg-edit no-print" data-pick="${p}.figure" aria-label="Edit image">${ic('edit', 's')}</button><input type="file" accept="image/*" data-newimg="${p}.figure" hidden>`;
  return `<figure class="qb2-fig"><div class="qb2-fcard"><div class="qb2-fh">${qb2ed(`${p}.figure.title`, f.title)}</div><div class="qb2-fbody" data-dg="${p}.figure">${body}</div>${pick}</div><figcaption>${qb2ed(`${p}.figure.caption`, f.caption)}</figcaption></figure>`;
}

/* ---------- Answers (Teacher view) ---------- */
function qb2Ans(q, p, ex) {
  const choice = q.options && q.correct != null && q.type !== 'tf';
  const lines = choice ? `<div class="qb2-al"><b>${QB2_L[q.correct]})&nbsp; ${esc(q.options[q.correct])}</b></div>`
    : (q.ans || []).map((l, i) => `<div class="qb2-al"><b>${q.type === 'ordering' ? `${i + 1}.&nbsp; ` : ''}${qb2ed(`${p}.ans.${i}`, l, true)}</b></div>`).join('');
  if (!lines && !q.explanation) return '';
  return `<div class="qb2-answ"><div class="qb2-ans">${lines}${q.explanation ? `<p>${qb2ed(`${p}.explanation`, q.explanation, true)}</p>` : ''}</div></div>`;
}

/* ---------- Questions ---------- */
function qb2Opts(q, p, t) {
  return `<div class="qb2-opts">${q.options.map((o, i) => { const ok = t && q.correct === i; return `<div class="qb2-o${ok ? ' ok' : ''}"><span class="qb2-l">${ok ? ic('tick', 'xs') : QB2_L[i]}</span>${qb2ed(`${p}.options.${i}`, o, true)}</div>`; }).join('')}</div>`;
}
/* the question itself, without its answer (also used for the parts of a case study) */
function qb2Body(q, p, t, ex) {
  let h = '';
  if (q.type === 'ar') h += `<p class="qb2-t">Assertion: ${esc(q.assertion)} Reason: ${esc(q.reason)}</p>`;
  else h += `<p class="qb2-t">${qb2ed(`${p}.text`, q.text, true)}</p>`;
  h += qb2Fig(q, p, ex);
  if (q.type === 'tf' && !t) h += '<div class="qb2-tfa"><span class="qb2-blank"></span></div>';
  if (q.type === 'mcq') h += qb2Opts(q, p, t);
  if (q.type === 'error') h += `<p class="qb2-stmt">${qb2ed(`${p}.statement`, q.statement, true)}</p><p class="qb2-ins">${qb2ed(`${p}.instruction`, q.instruction, true)}</p>`;
  if (q.type === 'case') h += `<p class="qb2-stmt plain">${qb2ed(`${p}.passage`, q.passage, true)}</p>`;
  if (q.type === 'ordering') h += `<ol class="qb2-ord">${q.items.map((x, i) => `<li><span class="qb2-l">${i + 1}</span>${qb2ed(`${p}.items.${i}`, x, true)}</li>`).join('')}</ol>`;
  if (q.type === 'match') h += `<div class="qb2-match"><div><h4>Column A</h4>${q.colA.map((x, i) => `<div class="qb2-mr">${t ? '' : '<span class="qb2-blank"></span>'}<span class="qb2-ml">${i + 1}</span>${qb2ed(`${p}.colA.${i}`, x, true)}</div>`).join('')}</div><div><h4>Column B</h4>${q.colB.map((x, i) => `<div class="qb2-mr"><span class="qb2-ml">${QB2_L[i]}</span>${qb2ed(`${p}.colB.${i}`, x, true)}</div>`).join('')}</div></div>`;
  if (q.type === 'ar') h += `<dl class="qb2-ar"><div><dt>Assertion (A)</dt><dd>${qb2ed(`${p}.assertion`, q.assertion, true)}</dd></div><div><dt>Reason (R)</dt><dd>${qb2ed(`${p}.reason`, q.reason, true)}</dd></div></dl>${qb2Opts(q, p, t)}`;
  if (q.type === 'ordering' && !t) h += `<div class="qb2-ordbox">${q.items.map(() => '<span></span>').join('')}</div>`;
  if (q.lines && !t) h += `<div class="qb2-lines" data-lines="${p}" data-n="${q.lines}">${qb2Lines(q.lines)}</div>${ex ? '' : `<div class="ed-tools no-print"><button type="button" class="ed-link" data-line="1" data-lq="${p}">+ Add line</button></div>`}`;
  return h;
}
function qb2Q(q, i, t, ex) {
  const p = `questions.${i}`;
  const subs = q.subs ? q.subs.map((s, k) => { const sp = `${p}.subs.${k}`;
    return `<div class="qb2-sub"><span class="qb2-sl">${'abcdefgh'[k]}.</span><div class="qb2-sbd"><span class="qb2-m">${qb2Marks(s.marks)}</span>${qb2Tag(s, t)}${qb2Body(s, sp, t, ex)}${t ? qb2Ans(s, sp, ex) : ''}</div></div>`; }).join('') : '';
  return `<li class="qb2-q" id="qb2-q${q.number}" data-n="${q.number}"><span class="qb2-n">${q.number}</span><div class="qb2-b"><span class="qb2-m">${qb2Marks(q.marks)}</span>${qb2Tag(q, t)}${qb2Body(q, p, t, ex)}${subs}${t && !q.subs ? qb2Ans(q, p, ex) : ''}</div></li>`;
}

/* the quiz document: header sheet, (screen only) question chips, then every question. ex = export copy (Word) without screen-only parts */
function qb2PaperHTML(D, t, ex) {
  const n = D.questions.length;
  const head = ex || !t ? '' : `<div class="qb2-qchips no-print">${D.questions.map(q => `<button type="button" class="qb2-qc" data-go="${q.number}" aria-label="Go to question ${q.number}">${q.number}</button>`).join('')}</div>`;
  /* what was asked for in the input form: chapter, topics, difficulty, Bloom's level and question types */
  const tl = Object.fromEntries(QB2_TYPES), sec = (l, vals) => `<div><span>${l}</span><p>${vals.map(v => `<i>${esc(v)}</i>`).join('')}</p></div>`;
  const info = `<div class="qb2-info">${sec('Chapter', [D.chapter])}${sec('Topics', D.topics)}${sec('Difficulty', [D.difficulty])}${D.blooms?.length ? sec('Bloom’s levels', D.blooms) : ''}${D.types?.length ? sec('Question types', D.types.map(k => tl[k])) : ''}</div>`;
  const sheet = `<div class="qb2-sheet"><div class="r1"><span>Name of the student: <i class="qb2-ul w1"></i></span><span>Roll No. <i class="qb2-ul w2"></i></span></div>
    <div class="r2"><span>Class: ${esc(D.grade)}</span><span>Section: <i class="qb2-ul w3"></i></span><span>Time: ${qb2ed('time', D.time)}</span></div>
    <div class="r3"><span>Subject: ${esc(D.subject)}</span><span>Number of Questions: ${n}</span><span>Marks: ${D.total_marks}</span></div></div>`;
  return `<article class="qb2-doc${!t && !ex ? ' stu' : ''}"><div class="qb2-hd"><h1 class="qb2-qh">Quiz</h1>${t ? '' : sheet}${t ? info : ''}${D.school ? `<p class="qb2-school">${esc(D.school)}</p>` : ''}</div>${head}<ol class="qb2-qs">${D.questions.map((q, i) => qb2Q(q, i, t, ex)).join('')}</ol></article>`;
}

/* ---------- Screen ---------- */
function qb2OutputView() {
  const D = qb2Doc, t = qb2View === 'teacher';
  return `<div class="toolbar"><div class="toolbar-in">
    <button class="icon-btn round" id="qb2Back" aria-label="Change settings">${ic('back')}</button>
    <div class="tb-title"><small>Quiz Builder 2.0</small><b>${esc(D.title)}</b></div>
    <div class="mode" role="tablist"><button class="${t ? '' : 'on'}" data-view="student" role="tab">Student view</button><button class="${t ? 'on' : ''}" data-view="teacher" role="tab">Teacher view</button></div>
    <div class="acts"><button class="btn" id="qb2Edit">${ic('edit', 's')}<span class="lb">Edit</span></button>${printBtn('qb2Print')}<button class="btn primary" id="qb2Dl" aria-haspopup="dialog">${ic('download', 's')}<span class="lb">Download</span></button></div></div></div>
  <div class="qb2-wrap${t ? '' : ' paper'}" id="qb2Out">${qb2PaperHTML(D, t)}</div>`;
}

/* Student view as A4 sheets (like the Assignment generator): the header block opens page 1, then every question is placed on the
   first sheet it fits; a question is never split across two sheets. Runs after every draw, before anything binds to the questions. */
function qb2Paginate(out, D) {
  const art = $('.qb2-doc.stu', out); if (!art) return;
  const hd = $('.qb2-hd', art), qs = $$('.qb2-q', art), pages = document.createElement('div'); pages.className = 'qb2-pages';
  art.replaceWith(pages);
  let body, list;
  const add = () => {
    const pg = document.createElement('section'); pg.className = 'qb2-page'; pg.innerHTML = '<div class="qb2-pbody fix"></div><div class="qb2-pfoot"><span></span><span></span></div>';
    pages.append(pg); body = pg.firstChild; if (pages.children.length === 1) body.append(hd);
    list = document.createElement('ol'); list.className = 'qb2-qs'; body.append(list);
  };
  add();
  qs.forEach(li => { list.append(li); if (body.scrollHeight > body.clientHeight + 1 && list.children.length > 1) { add(); list.append(li); } });
  const all = $$('.qb2-page', pages);
  all.forEach((pg, i) => { const f = pg.querySelectorAll('.qb2-pfoot span'); f[0].textContent = `${D.subject} · Class ${D.grade}`; f[1].textContent = `Page ${i + 1} of ${all.length}`; $('.qb2-pbody', pg).classList.remove('fix'); });
}

function qb2BindOutput() {
  const view = $('#view'); view.classList.add('bg-white', 'view-qb2'); view.classList.remove('is-editing');
  const out = $('#qb2Out'), D = () => qb2Doc, pendingImg = {};
  qb2Paginate(out, D());   // images chosen during this edit, kept until Save
  const rerender = () => { const y = view.scrollTop; view.innerHTML = qb2OutputView(); qb2BindOutput(); view.scrollTop = y; };
  const norm = s => String(s ?? '').replace(/\s+/g, ' ').trim();
  const open = () => !!$('.ed[contenteditable="true"]', out);
  const syncTop = () => window.editUI.top($('#qb2Edit'), open());
  const commit = () => { // writes the changed values back into the quiz; returns how many values changed
    let n = 0;
    $$('.ed[data-p]', out).forEach(el => {
      const raw = (el.classList.contains('ml') ? el.innerText : el.textContent).trim();
      if (!raw || norm(raw) === norm(qb2Get(D(), el.dataset.p))) return;
      qb2Set(D(), el.dataset.p, raw); n++;
    });
    $$('[data-lines]', out).forEach(el => { const q = qb2Get(D(), el.dataset.lines); if (+el.dataset.n !== q.lines) { q.lines = +el.dataset.n; n++; } });
    Object.entries(pendingImg).forEach(([p, im]) => { qb2Get(D(), p).img = im; delete pendingImg[p]; n++; });
    return n;
  };
  const keepEdits = () => { if (open() || Object.keys(pendingImg).length) commit(); };   // leaving, printing or downloading keeps the edits

  $('#qb2Back').onclick = () => { keepEdits(); navigate('#/quiz-builder-2'); };
  $$('[data-view]').forEach(b => b.onclick = async () => {
    if (qb2View === b.dataset.view) return;
    if (open()) { const r = await unsavedModal(); if (r === 'cancel') return; if (r === 'save') commit(); }   // discard: the re-render rebuilds from the saved quiz
    qb2View = b.dataset.view; rerender();
  });
  $('#qb2Edit').onclick = () => { // Edit -> Save: every value opens; Save writes them back and closes everything
    if (open()) { const n = commit(); rerender(); toast(n ? `Saved – ${n} change${n === 1 ? '' : 's'}` : 'Saved'); return; }
    $$('.ed', out).forEach(el => { el.contentEditable = 'true'; el.classList.add('editing'); });
    view.classList.add('is-editing'); syncTop(); $('.ed', out)?.focus();
  };
  $$('.ed:not(.ml)', out).forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') e.preventDefault(); }));   // one-line values stay one line

  out.addEventListener('click', e => {
    const l = e.target.closest('[data-line]'), pk = e.target.closest('[data-pick]');
    if (pk) out.querySelector(`[data-newimg="${pk.dataset.pick}"]`).click();
    if (l) { const box = out.querySelector(`[data-lines="${l.dataset.lq}"]`), n = Math.max(1, Math.min(20, +box.dataset.n + +l.dataset.line)); box.dataset.n = n; box.innerHTML = qb2Lines(n); }
    const g = e.target.closest('[data-go]');
    if (g) { const el = $('#qb2-q' + g.dataset.go), top = el.getBoundingClientRect().top - view.getBoundingClientRect().top + view.scrollTop - (($('.qb2-qchips', out)?.offsetHeight || 0) + (tb ? tb.offsetHeight : 64) + 12); view.scrollTo({ top, behavior: 'smooth' }); }
  });

  /* replace (never remove) a figure's image - an empty, invalid or unreadable file keeps the current one */
  out.addEventListener('change', e => {
    const inp = e.target.closest('[data-newimg]'); if (!inp) return;
    const path = inp.dataset.newimg, f = inp.files && inp.files[0]; inp.value = '';
    const fail = why => toast(`${why} The current image is kept.`);
    if (!f || !f.size) return fail('That file is empty.');
    if (!/^image\//.test(f.type)) return fail('Please choose an image file.');
    if (f.size > 4 * 1024 * 1024) return fail('That image is over 4 MB.');
    const rd = new FileReader();
    rd.onerror = () => fail('That image could not be read.');
    rd.onload = () => { const img = new Image(); img.onerror = () => fail('That image could not be opened.');
      img.onload = () => { if (!img.naturalWidth || !img.naturalHeight) return fail('That image has no content.');
        pendingImg[path] = { src: rd.result, alt: qb2Get(D(), path).title };
        out.querySelector(`[data-dg="${path}"]`).innerHTML = `<img class="qb2-img" src="${rd.result}" alt="${esc(pendingImg[path].alt)}">`; };
      img.src = rd.result; };
    rd.readAsDataURL(f);
  });

  /* the question chips bar sticks just under the toolbar; a click scrolls its question into view below it */
  const tb = $('.toolbar'); out.style.setProperty('--qb2-top', (tb ? tb.offsetHeight : 64) + 'px');

  /* print / download of the chosen view */
  bindPrint('qb2Print', { run: v => { keepEdits(); qb2Download(v, 'print'); } });
  $('#qb2Dl').onclick = () => { keepEdits(); downloadModal({ view: qb2View, file: qb2FileName, run: qb2Download, formats: ['word', 'pdf'] }); };
}

function qb2Download(view, fmt) {
  const teacher = view === 'teacher', name = qb2FileName(view), html = qb2PaperHTML(qb2Doc, teacher, true);
  if (!teacher && html.includes('qb2-ans')) return toast('Download blocked: the student quiz contains teacher content.');
  if (fmt === 'word') return downloadWord(name, html, 'h1{font-size:22pt;color:#B01E3A}.qb2-count{color:#555}.qb2-info{margin-bottom:12pt}.qb2-info div{margin:4pt 0}.qb2-info span{color:#666;font-size:8pt;text-transform:uppercase;display:block}.qb2-info p{margin:2pt 0}.qb2-info i{font-style:normal;background:#EEEEF3;padding:2pt 8pt;margin-right:5pt}.qb2-qh{text-align:center;font-size:22pt;margin:0 0 14pt}.qb2-sheet{font-weight:bold;margin-bottom:14pt}.qb2-sheet div{margin:5pt 0}.qb2-ul{display:inline-block;border-bottom:1px solid #000;width:120pt}.qb2-qs{list-style:none;padding:0}.qb2-q{margin:14pt 0}.qb2-n{font-weight:bold;color:#E04158;padding-right:8pt}.qb2-m{color:#555;font-size:9pt}.qb2-t{font-weight:bold}.qb2-o,.qb2-mr,.qb2-ord li{margin:3pt 0}.qb2-l,.qb2-ml,.qb2-sl{font-weight:bold;color:#555;padding-right:6pt}.qb2-ft{border-collapse:collapse;width:100%}.qb2-ft th{background:#0A6FB5;color:#fff;padding:5pt}.qb2-ft td{border:1px solid #ccc;padding:5pt;text-align:center}.qb2-ans{background:#FDE7EA;border-left:3pt solid #ED4459;padding:6pt 10pt;margin:6pt 0}.qb2-svg{width:480pt}.qb2-line{border-bottom:1px solid #999;height:22pt}.qb2-blank{display:inline-block;width:60pt;border-bottom:1px solid #555}.qb2-ordbox span{display:inline-block;width:26pt;height:22pt;border:1px solid #777;margin-right:6pt}.qb2-img{max-width:100%}');
  /* PDF and Print both come from the print dialog: show the chosen view first, then restore the open one */
  const t0 = document.title, back = qb2View, show = () => { $('#view').innerHTML = qb2OutputView(); qb2BindOutput(); }; document.title = name;
  if (view !== qb2View) { qb2View = view; show(); }
  const undo = () => { document.title = t0; if (qb2View !== back) { qb2View = back; show(); } window.removeEventListener('afterprint', undo); };
  window.addEventListener('afterprint', undo); setTimeout(() => window.print(), 80);
}
