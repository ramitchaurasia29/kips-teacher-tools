/* Practice test - OUTPUT: one practice test JSON, two views.
   Student view = heading + student details + question cards (number badge, type, marks pill; NO bloom / difficulty), questions only.
   Teacher view = the same cards with Bloom / difficulty in the card header and an answer box under each question.
   Editing follows the Homework generator: values only (structure fixed), pale-blue boxes, per-card pencil, "+ Add line". */

/* an editable VALUE inside fixed structure: g = block id, p = path into the test, ml = may wrap over several lines */
const ptEd = (g, p, v, ml) => `<span class="ed${ml ? ' ml' : ''}" data-g="${g}" data-p="${p}">${esc(v)}</span>`;
const ptLines = n => Array.from({ length: n }, () => '<div class="pt-line"></div>').join('');
const ptPen = (g, ex) => ex ? '' : `<button type="button" class="pt-pen icon-btn no-print" data-edit="${g}" title="Edit" aria-label="Edit this part">${ic('edit', 's')}</button>`;
const ptFileName = (D, view) => `PracticeTest_Class${D.meta.class}_${D.meta.subject.replace(/\s+/g, '')}_${view === 'teacher' ? 'Teacher' : 'Student'}`;
const ptAns = (g, p, v, label = 'Answer:') => `<div class="pt-ans"><span class="pt-al">${label}</span> ${ptEd(g, p, v, true)}</div>`;
const ptLinesBlock = (p, n, ex) => `<div class="pt-lines" data-lines="${p}" data-n="${n}">${ptLines(n)}</div>${ex ? '' : `<div class="ed-tools no-print"><button type="button" class="ed-link" data-line="1" data-lp="${p}">+ Add line</button></div>`}`;
const ptMarks = n => `${n} MARK${n === 1 ? '' : 'S'}`;
const ptOffset = (D, si) => D.sections.slice(0, si).reduce((n, s) => n + s.items.length, 0);   // question numbers run on across sections

function ptItemHTML(D, si, i, teacher, ex) {
  const s = D.sections[si], it = s.items[i], g = `s${si}i${i}`, P = `sections.${si}.items.${i}`, n = ptOffset(D, si) + i + 1;
  /* pill first in the markup so the Word copy can float it right; the screen layout puts it last */
  const meta = `<span class="pt-m">${ptMarks(s.marks)}</span><span class="pt-qn">${n}</span><span class="pt-meta"><b>${esc(s.tag)}</b>${teacher ? `<i></i><span>${esc(it.bloom)}</span><i></i><span class="pt-d ${esc(it.difficulty)}">${esc(it.difficulty)}</span>` : ''}</span>`;
  const text = `<p class="pt-qt">${ptEd(g, `${P}.text`, it.text, true)}</p>`;
  let body;
  if (s.type === 'mcq') {
    body = `${text}<div class="pt-opts">${it.options.map((o, k) => { const right = teacher && it.ans === k;
      return `<span class="pt-opt${right ? ' right' : ''}"><b>${'ABCD'[k]}</b>${ptEd(g, `${P}.options.${k}`, o)}${right ? ' ✓' : ''}</span>`; }).join('')}</div>`
      + (teacher ? `<div class="pt-ans"><span class="pt-al">Answer:</span> ${ptEd(g, `${P}.ansL`, 'ABCD'[it.ans])} <span class="pt-ax">${esc(it.options[it.ans] ?? '')}</span></div>` : '');
  } else body = text + (teacher ? ptAns(g, `${P}.ans`, it.ans) : ptLinesBlock(`${P}.lines`, it.lines, ex));
  return `<div class="pt-q pt-blk" data-gp="${g}"><div class="pt-qh">${meta}${ptPen(g, ex)}</div><div class="pt-qb">${body}</div></div>`;
}
function ptSectionHTML(D, si, teacher, ex) {
  const s = D.sections[si];
  return `<section class="pt-sec"><h2 class="pt-stitle">Section ${s.letter} — ${esc(s.label)} (${s.marks} mark${s.marks === 1 ? '' : 's'} each)</h2>${s.items.map((_, i) => ptItemHTML(D, si, i, teacher, ex)).join('')}</section>`;
}
/* the page's top block: Practice Test heading, then the student details */
function ptHeadHTML(D, ex, teacher) {
  const m = D.meta;
  if (teacher) { // Teacher view: no student details - the chapters and topics the test was built from, as chips
    const group = (label, items) => items?.length ? `<div class="pt-tg"><div class="pt-tl">${label}</div><div class="pt-tc">${items.map(i => `<span class="pt-chip">${esc(i)}</span>`).join('')}</div></div>` : '';
    return `<header class="pt-ph"><h1 class="pt-ptitle">${esc(D.title)}</h1><div class="pt-tin">${group('Chapters', D.chapters)}${group('Topics', D.topics)}</div></header>`;
  }
  return `<header class="pt-ph pt-blk" data-gp="hd"><h1 class="pt-ptitle">${ptEd('hd', 'title', D.title)}</h1>
    <div class="pt-prow"><span>Name of the student: ____________________</span><span>Roll No. ________</span></div>
    <div class="pt-prow three"><span>Class: ${ptEd('hd', 'meta.class', m.class)}</span><span>Section: ______</span><span>Date: ${m.date ? ptEd('hd', 'meta.date', m.date) : '__________'}</span></div>
    <div class="pt-prow three"><span>Subject: ${ptEd('hd', 'meta.subject', m.subject)}</span><span>Time: ${m.time ? ptEd('hd', 'meta.time', m.time) : '__________'}</span><span>Marks: ${ptEd('hd', 'meta.marks', m.marks)}</span></div>${ptPen('hd', ex)}</header>`;
}
/* ex = export copy (Word / print): the same test without edit tools */
const ptPageHTML = (D, teacher, ex) => `<article class="pt-paper pt-sheet">${ptHeadHTML(D, ex, teacher)}${D.sections.map((_, si) => ptSectionHTML(D, si, teacher, ex)).join('')}</article>`;

function ptOutputView() {
  const D = ptDoc, t = ptView === 'teacher';
  return `<div class="toolbar"><div class="toolbar-in">
    <button class="icon-btn round" id="ptBack" aria-label="Change settings">${ic('back')}</button>
    <div class="tb-title"><small>Practice test</small><b>Class ${esc(D.meta.class)} ${esc(D.meta.subject)} · Practice Test</b></div>
    <div class="mode" role="tablist"><button class="${t ? '' : 'on'}" data-view="student" role="tab">Student view</button><button class="${t ? 'on' : ''}" data-view="teacher" role="tab">Teacher view</button></div>
    <div class="acts"><button class="btn" id="ptEdit">${ic('edit', 's')}<span class="lb">Edit</span></button>${printBtn('ptPrint')}<button class="btn primary" id="ptDl" aria-haspopup="dialog">${ic('download', 's')}<span class="lb">Download</span></button></div></div></div>
  <div class="pt-out" id="ptOut">${ptPageHTML(D, t)}</div>`;
}

function ptBindOutput() {
  const view = $('#view'); view.classList.add('bg-white', 'view-pt'); view.classList.remove('is-editing');
  const out = $('#ptOut');
  const rerender = () => { const y = view.scrollTop; view.innerHTML = ptOutputView(); ptBindOutput(); view.scrollTop = y; };
  const norm = s => String(s ?? '').replace(/\s+/g, ' ').trim();
  const open = () => !!$('.ed[contenteditable="true"]', out);
  const syncTop = () => window.editUI.top($('#ptEdit'), open());
  /* write the changed values (all blocks, or one) back into the test; returns how many things changed */
  const commit = gid => {
    let n = 0;
    $$('.ed[data-p]', out).forEach(el => {
      if (gid && el.dataset.g !== gid) return;
      const raw = (el.classList.contains('ml') ? el.innerText : el.textContent).trim(), before = ptGet(ptDoc, el.dataset.p);
      if (!raw || norm(raw) === norm(before)) return;
      ptSet(ptDoc, el.dataset.p, raw); if (norm(ptGet(ptDoc, el.dataset.p)) !== norm(before)) n++;
    });
    $$('[data-lines]', out).forEach(el => { if (gid && !el.closest(`[data-gp="${gid}"]`)) return; const p = el.dataset.lines; if (+el.dataset.n !== ptGet(ptDoc, p)) { ptSet(ptDoc, p, +el.dataset.n); n++; } });
    return n;
  };
  const keepEdits = () => { if (open()) commit(); };   // leaving, printing or downloading keeps the edits

  $('#ptBack').onclick = () => { keepEdits(); navigate('#/practice-test'); };
  $$('[data-view]').forEach(b => b.onclick = async () => {
    if (ptView === b.dataset.view) return;
    if (open()) { const r = await unsavedModal(); if (r === 'cancel') return; if (r === 'save') commit(); }   // discard: the re-render rebuilds from the saved test
    ptView = b.dataset.view; rerender();
  });
  bindPrint('ptPrint', { run: v => { keepEdits(); ptDownload(v, 'print'); } });
  $('#ptDl').onclick = () => { keepEdits(); downloadModal({ view: ptView, file: v => ptFileName(ptDoc, v), run: ptDownload, formats: ['word', 'pdf'] }); };

  const setOpen = (els, on) => els.forEach(el => { el.contentEditable = on ? 'true' : 'false'; el.classList.toggle('editing', on); });
  $('#ptEdit').onclick = () => { // Edit -> Save: every block opens; Save writes the values back and closes everything
    if (open()) { const n = commit(); rerender(); toast(n ? `Saved – ${n} change${n === 1 ? '' : 's'}` : 'Saved'); return; }
    setOpen($$('.ed', out), true); view.classList.add('is-editing'); syncTop(); $('.ed', out)?.focus();
  };
  $$('.ed:not(.ml)', out).forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') e.preventDefault(); }));   // one-line values stay one line
  $$('[data-edit]', out).forEach(b => b.onclick = () => { // pencil -> "save Save" for that card only
    const id = b.dataset.edit, els = $$('.ed', out).filter(x => x.dataset.g === id), on = els[0].contentEditable !== 'true';
    if (on) { setOpen(els, true); window.editUI.sec(b, true); els[0].focus(); syncTop(); return; }
    const n = commit(id); setOpen(els, false); window.editUI.sec(b, false);
    if (!open()) { rerender(); if (n) toast('Saved'); } else syncTop();
  });
  out.addEventListener('click', e => { // edit-time helper: more / fewer answer lines
    const l = e.target.closest('[data-line]');
    if (l) { const box = out.querySelector(`[data-lines="${l.dataset.lp}"]`), n = Math.max(1, Math.min(20, +box.dataset.n + +l.dataset.line)); box.dataset.n = n; box.innerHTML = ptLines(n); }
  });
}

/* ---------- Download: the view that is open ---------- */
function ptStudentIsClean(html) { return !html.includes('pt-ans') && !html.includes('class="pt-opt right"') && !html.includes('pt-d '); }   // the student copy never carries teacher content (answers, bloom, difficulty)
async function ptDownload(view, fmt) {
  const teacher = view === 'teacher', html = ptPageHTML(ptDoc, teacher, true), name = ptFileName(ptDoc, view);
  if (!teacher && !ptStudentIsClean(html)) return toast('Download blocked: the student practice test contains teacher content.');
  if (fmt === 'word' || fmt === 'both') {
    const css = 'body{font-family:Arial;font-size:12pt}.pt-ptitle{text-align:center;font-size:18pt}.pt-prow{margin-top:6pt;font-weight:bold}.pt-stitle{font-size:10pt;color:#E5384F;text-transform:uppercase;margin:18pt 0 6pt}.pt-q{border:1px solid #ddd;margin:8pt 0;padding:8pt}.pt-qh{border-bottom:1px solid #eee;padding-bottom:4pt}.pt-m{float:right;font-size:8pt;font-weight:bold;color:#777}.pt-qn{color:#E5384F;font-weight:bold;font-size:12pt}.pt-meta{font-size:8pt;color:#888;text-transform:uppercase}.pt-meta i{display:none}.pt-meta span:before{content:" \\2022  "}.pt-qt{font-weight:bold;margin:8pt 0 4pt}.pt-line{border-bottom:1px dashed #999;height:20pt}.pt-opt{display:inline-block;width:48%;margin:2pt 0}.pt-opt b{color:#888}.pt-ans{border-left:3pt solid #1E6B5C;background:#F4F9F7;padding:4pt 8pt;margin:4pt 0}.pt-al{color:#1E6B5C;font-weight:bold}.right{font-weight:bold}';
    const blob = new Blob([`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${esc(name)}</title><style>@page{size:A4;margin:20mm}${css}</style></head><body>${html}</body></html>`], { type: 'application/msword' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name + '.doc'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  if (fmt === 'pdf' || fmt === 'both' || fmt === 'print') { // PDF and Print both come from the print dialog, so the chosen view is shown first, then the open view is restored
    const t0 = document.title, back = ptView, show = () => { $('#view').innerHTML = ptOutputView(); ptBindOutput(); }; document.title = name;
    if (view !== ptView) { ptView = view; show(); }
    const undo = () => { document.title = t0; if (ptView !== back) { ptView = back; show(); } window.removeEventListener('afterprint', undo); };
    window.addEventListener('afterprint', undo); setTimeout(() => window.print(), fmt === 'both' ? 400 : 80);
  }
}
