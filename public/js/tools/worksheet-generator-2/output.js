/* Worksheet generator 2.0 - OUTPUT: one worksheet JSON, two views.
   Student view = A4 paper (Assessment heading + name/roll/class/section/time/subject/marks block, questions only).
   Teacher view = the same section cards with answers, NO paper.
   Editing follows the Assessment generator: values only (structure fixed), pale-blue boxes, per-block pencil, "+ Add line", blank length, replace (never delete) an image. */

/* an editable VALUE inside fixed structure: g = block id, p = path into the worksheet, ml = may wrap over several lines */
const wsEd = (g, p, v, ml) => `<span class="ed${ml ? ' ml' : ''}" data-g="${g}" data-p="${p}">${esc(v)}</span>`;
const wsLines = n => Array.from({ length: n }, () => '<div class="ws2-line"></div>').join('');
const wsPen = (g, ex) => ex ? '' : `<button type="button" class="ws2-pen icon-btn no-print" data-edit="${g}" title="Edit" aria-label="Edit this part">${ic('edit', 's')}</button>`;
const wsFileName = (D, view) => `Worksheet_Class${D.meta.class}_${D.meta.subject.replace(/\s+/g, '')}_${view === 'teacher' ? 'Teacher' : 'Student'}`;
const wsAns = (g, p, v, label = 'Answer:') => `<div class="ws2-ans"><span class="ws2-al">${label}</span> ${wsEd(g, p, v, true)}</div>`;

/* answer lines + the edit-time "+ Add line" */
const wsLinesBlock = (p, n, ex) => `<div class="ws2-lines" data-lines="${p}" data-n="${n}">${wsLines(n)}</div>${ex ? '' : `<div class="ed-tools no-print"><button type="button" class="ed-link" data-line="1" data-lp="${p}">+ Add line</button></div>`}`;

function wsItemHTML(D, si, i, teacher, ex) {
  const s = D.sections[si], it = s.items[i], g = `s${si}i${i}`, P = `sections.${si}.items.${i}`;
  const qn = `<span class="ws2-qn">${i + 1}.</span>`;
  const wrap = body => `<div class="ws2-q ws2-blk" data-gp="${g}">${body}${wsPen(g, ex)}</div>`;
  const text = `<p class="ws2-qt">${wsEd(g, `${P}.text`, it.text, true)}</p>`;
  if (s.type === 'mcq' || s.type === 'tf') {
    const opts = s.type === 'mcq' ? it.options : ['True', 'False'];
    const html = `<div class="ws2-opts${opts.every(o => String(o).length <= 22) ? '' : ' one'}">${opts.map((o, k) => { const right = teacher && it.ans === k;
      return `<span class="ws2-opt${right ? ' right' : ''}"><i class="ws2-bub">${'ABCD'[k]}</i>${s.type === 'mcq' ? wsEd(g, `${P}.options.${k}`, o) : esc(o)}${right ? ' ✓' : ''}</span>`; }).join('')}</div>`;
    const ans = teacher ? `<div class="ws2-ans"><span class="ws2-al">Answer:</span> ${wsEd(g, `${P}.${s.type === 'mcq' ? 'ansL' : 'ansTF'}`, s.type === 'mcq' ? 'ABCD'[it.ans] : ['True', 'False'][it.ans])}${s.type === 'mcq' ? ` <span class="ws2-ax">${esc(it.options[it.ans] ?? '')}</span>` : ''}</div>` : '';
    return wrap(`${qn}<div class="ws2-qb">${text}${html}${ans}</div>`);
  }
  if (s.type === 'fill') {
    const blank = !ex && /_{3,}/.test(it.text) ? `<div class="ed-tools no-print"><span>Blank length</span><button type="button" class="ed-link" data-blank="-1" data-bp="${P}.text" aria-label="Shorter blank">−</button><button type="button" class="ed-link" data-blank="1" data-bp="${P}.text" aria-label="Longer blank">+</button></div>` : '';
    return wrap(`${qn}<div class="ws2-qb">${text}${blank}${teacher ? wsAns(g, `${P}.ans`, it.ans) : ''}</div>`);
  }
  if (s.type === 'short' || s.type === 'long') return wrap(`${qn}<div class="ws2-qb">${text}${teacher ? wsAns(g, `${P}.ans`, it.ans) : wsLinesBlock(`${P}.lines`, it.lines, ex)}</div>`);
  if (s.type === 'case') {
    return wrap(`<div class="ws2-qb full"><div class="ws2-passage">${wsEd(g, `${P}.passage`, it.passage, true)}</div>
      ${it.subs.map((b, k) => `<div class="ws2-sub"><span class="ws2-qn a">${'abcd'[k]}.</span><div class="ws2-qb"><p class="ws2-qt">${wsEd(g, `${P}.subs.${k}.text`, b.text, true)}</p>${teacher ? wsAns(g, `${P}.subs.${k}.ans`, b.ans) : wsLinesBlock(`${P}.subs.${k}.lines`, b.lines, ex)}</div></div>`).join('')}</div>`);
  }
  if (s.type === 'diagram') {
    const img = it.diagram ? `<div class="dgwrap" data-dg="${P}.diagram"><span class="dg-img">${diagramSVG(it.diagram)}</span>${ex ? '' : `<button type="button" class="dg-edit no-print" data-pick="${P}.diagram" aria-label="Edit image">${ic('edit', 's')}</button><input type="file" accept="image/*" data-newimg="${P}.diagram" hidden>`}</div>` : '';
    return wrap(`<div class="ws2-qb full">${img}<div class="ws2-qrow">${qn}<div class="ws2-qb">${text}${teacher ? wsAns(g, `${P}.ans`, it.ans) : '<div class="ws2-draw"><span>DRAW AND LABEL HERE</span></div>'}</div></div></div>`);
  }
  return '';
}
/* matching: one table per group, each with its own two headers */
function wsMatchHTML(D, si, gi, teacher, ex) {
  const s = D.sections[si], G = s.items[gi], g = `s${si}i${gi}`, P = `sections.${si}.items.${gi}`;
  const rows = G.left.map((l, k) => `<div class="ws2-mrow"><span class="ws2-mc"><em>${k + 1}</em>${wsEd(g, `${P}.left.${k}`, l)}</span><span class="ws2-mc"><em>${'ABCDEFGHIJ'[k]}</em>${wsEd(g, `${P}.right.${k}`, G.right[k])}</span></div>`).join('');
  const key = teacher ? `<div class="ws2-ans"><span class="ws2-al">Answer:</span> ${G.key.map((k, n) => `${n + 1} → ${'ABCDEFGHIJ'[k]}`).join('; ')}</div>` : '';
  return `<div class="ws2-q ws2-match ws2-blk" data-gp="${g}"><div class="ws2-mrow ws2-mh"><b>${wsEd(g, `${P}.headA`, G.headA)}</b><b>${wsEd(g, `${P}.headB`, G.headB)}</b></div>${rows}${key}${wsPen(g, ex)}</div>`;
}
function wsSectionHTML(D, si, teacher, ex) {
  const s = D.sections[si], g = `s${si}h`;
  const items = s.type === 'match' ? s.items.map((_, gi) => wsMatchHTML(D, si, gi, teacher, ex)).join('') : s.items.map((_, i) => wsItemHTML(D, si, i, teacher, ex)).join('');
  return `<section class="ws2-sec"><div class="ws2-shead"><span class="ws2-sn">${si + 1}</span><h2 class="ws2-stitle">${esc(s.label)}</h2></div>
    <div class="ws2-ins ws2-blk" data-gp="${g}"><p>${wsEd(g, `sections.${si}.instruction`, s.instruction, true)}</p>${wsPen(g, ex)}</div>${items}</section>`;
}
/* the paper's top block: Assessment heading, then the six lines of the student details */
function wsHeadHTML(D, ex) {
  const m = D.meta;
  return `<header class="ws2-ph ws2-blk" data-gp="hd"><h1 class="ws2-ptitle">${wsEd('hd', 'title', D.title)}</h1>
    <div class="ws2-prow"><span>Name of the student: ____________________</span><span>Roll No. ________</span></div>
    <div class="ws2-prow three"><span>Class: ${wsEd('hd', 'meta.class', m.class)}</span><span>Section: ______</span><span>Time: ${wsEd('hd', 'meta.time', m.time)} min</span></div>
    <div class="ws2-prow"><span>Subject: ${wsEd('hd', 'meta.subject', m.subject)}</span><span>Marks: ${wsEd('hd', 'meta.marks', m.marks)}</span></div>${wsPen('hd', ex)}</header>`;
}
/* Teacher view only: the worksheet name and what the teacher chose on the input screen (never Total marks). Empty optionals are skipped. */
const WS_INFO = [['textbook', 'Textbook'], ['grade', 'Grade'], ['chapter', 'Chapter'], ['topics', 'Topics'], ['date', 'Submission date'], ['difficulty', 'Difficulty'], ['formats', 'Question formats'], ['blooms', 'Bloom’s levels'], ['rubric', 'Include rubric'], ['reference', 'Reference document']];
function wsInfoHTML(D, ex) {
  const rows = WS_INFO.filter(([k]) => D.info[k]).map(([k, l]) => `<div class="ws2-irow"><dt>${l}</dt><dd>${wsEd('info', `info.${k}`, D.info[k], true)}</dd></div>`).join('');
  return `<section class="ws2-info ws2-blk" data-gp="info"><h1 class="ws2-iname">${wsEd('info', 'title', D.title)}</h1><dl class="ws2-idl">${rows}</dl>${wsPen('info', ex)}</section>`;
}
const wsSectionsHTML = (D, teacher, ex) => D.sections.map((_, si) => wsSectionHTML(D, si, teacher, ex)).join('');
/* ex = export copy (Word / print): the same worksheet without edit tools */
function wsPageHTML(D, teacher, ex) {
  return teacher ? `<div class="ws2-cards">${wsInfoHTML(D, ex)}${wsSectionsHTML(D, true, ex)}</div>`
    : `<article class="ws2-paper">${wsHeadHTML(D, ex)}${wsSectionsHTML(D, false, ex)}</article>`;
}

function wsOutputView() {
  const D = wsDoc, t = wsView === 'teacher';
  return `<div class="toolbar"><div class="toolbar-in">
    <button class="icon-btn round" id="wsBack" aria-label="Change settings">${ic('back')}</button>
    <div class="tb-title"><small>Worksheet generator 2.0</small><b>Class ${esc(D.meta.class)} ${esc(D.meta.subject)} · Worksheet</b></div>
    <div class="mode" role="tablist"><button class="${t ? '' : 'on'}" data-view="student" role="tab">Student view</button><button class="${t ? 'on' : ''}" data-view="teacher" role="tab">Teacher view</button></div>
    <div class="acts"><button class="btn" id="wsEdit">${ic('edit', 's')}<span class="lb">Edit</span></button>${printBtn('wsPrint')}<button class="btn primary" id="wsDl" aria-haspopup="dialog">${ic('download', 's')}<span class="lb">Download</span></button></div></div></div>
  <div class="ws2-out" id="wsOut">${wsPageHTML(D, t)}</div>`;
}

function wsBindOutput() {
  const view = $('#view'); view.classList.add('bg-white', 'view-ws2'); view.classList.remove('is-editing');
  const out = $('#wsOut'), pendingImg = {};   // images chosen during this edit are kept until Save (a re-draw without saving drops them, like text edits)
  const rerender = () => { const y = view.scrollTop; view.innerHTML = wsOutputView(); wsBindOutput(); view.scrollTop = y; };
  const norm = s => String(s ?? '').replace(/\s+/g, ' ').trim();
  const open = () => !!$('.ed[contenteditable="true"]', out);
  const syncTop = () => window.editUI.top($('#wsEdit'), open());
  /* write the changed values (all blocks, or one) back into the worksheet; returns how many things changed */
  const commit = gid => {
    let n = 0;
    $$('.ed[data-p]', out).forEach(el => {
      if (gid && el.dataset.g !== gid) return;
      const raw = (el.classList.contains('ml') ? el.innerText : el.textContent).trim(), before = wsGet(wsDoc, el.dataset.p);
      if (!raw || norm(raw) === norm(before)) return;
      wsSet(wsDoc, el.dataset.p, raw); if (norm(wsGet(wsDoc, el.dataset.p)) !== norm(before)) n++;
    });
    $$('[data-lines]', out).forEach(el => { if (gid && !el.closest(`[data-gp="${gid}"]`)) return; const p = el.dataset.lines; if (+el.dataset.n !== wsGet(wsDoc, p)) { wsSet(wsDoc, p, +el.dataset.n); n++; } });
    Object.entries(pendingImg).forEach(([p, im]) => { if (gid && !out.querySelector(`[data-gp="${gid}"] [data-dg="${p}"]`)) return; wsSet(wsDoc, p, im); delete pendingImg[p]; n++; });
    return n;
  };
  const keepEdits = () => { if (open() || Object.keys(pendingImg).length) commit(); };   // leaving, printing or downloading keeps the edits

  $('#wsBack').onclick = () => { keepEdits(); navigate('#/worksheet-generator-2'); };
  $$('[data-view]').forEach(b => b.onclick = async () => {
    if (wsView === b.dataset.view) return;
    if (open()) { const r = await unsavedModal(); if (r === 'cancel') return; if (r === 'save') commit(); }   // discard: the re-render rebuilds from the saved worksheet
    wsView = b.dataset.view; rerender();
  });
  bindPrint('wsPrint', { run: v => { keepEdits(); wsDownload(v, 'print'); } });
  $('#wsDl').onclick = () => { keepEdits(); downloadModal({ view: wsView, file: v => wsFileName(wsDoc, v), run: wsDownload, formats: ['word', 'pdf'] }); };

  const setOpen = (els, on) => els.forEach(el => { el.contentEditable = on ? 'true' : 'false'; el.classList.toggle('editing', on); });
  $('#wsEdit').onclick = () => { // Edit -> Save: every block opens; Save writes the values back and closes everything
    if (open()) { const n = commit(); rerender(); toast(n ? `Saved – ${n} change${n === 1 ? '' : 's'}` : 'Saved'); return; }
    setOpen($$('.ed', out), true); view.classList.add('is-editing'); syncTop(); $('.ed', out)?.focus();
  };
  $$('.ed:not(.ml)', out).forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') e.preventDefault(); }));   // one-line values stay one line
  $$('[data-edit]', out).forEach(b => b.onclick = () => { // pencil -> "save Save" for that block only
    const id = b.dataset.edit, els = $$('.ed', out).filter(x => x.dataset.g === id), on = els[0].contentEditable !== 'true';
    if (on) { setOpen(els, true); window.editUI.sec(b, true); els[0].focus(); syncTop(); return; }
    const n = commit(id); setOpen(els, false); window.editUI.sec(b, false);
    if (!open()) { rerender(); if (n) toast('Saved'); } else syncTop();
  });

  /* edit-time helpers: more answer lines, longer/shorter blank, replace an image (an empty, invalid or unreadable file keeps the current image) */
  out.addEventListener('click', e => {
    const l = e.target.closest('[data-line]'), b = e.target.closest('[data-blank]'), pk = e.target.closest('[data-pick]');
    if (pk) out.querySelector(`[data-newimg="${pk.dataset.pick}"]`).click();
    if (l) { const box = out.querySelector(`[data-lines="${l.dataset.lp}"]`), n = Math.max(1, Math.min(20, +box.dataset.n + +l.dataset.line)); box.dataset.n = n; box.innerHTML = wsLines(n); }
    if (b) { const sp = out.querySelector(`.ed[data-p="${b.dataset.bp}"]`); if (sp) sp.textContent = sp.textContent.replace(/_{3,}/, m => '_'.repeat(Math.max(4, Math.min(30, m.length + 2 * +b.dataset.blank)))); }
  });
  out.addEventListener('change', e => {
    const inp = e.target.closest('[data-newimg]'); if (!inp) return;
    const p = inp.dataset.newimg, f = inp.files && inp.files[0]; inp.value = '';
    const fail = why => toast(`${why} The current image is kept.`);
    if (!f || !f.size) return fail('That file is empty.');
    if (!/^image\//.test(f.type)) return fail('Please choose an image file.');
    if (f.size > 4 * 1024 * 1024) return fail('That image is over 4 MB.');
    const rd = new FileReader();
    rd.onerror = () => fail('That image could not be read.');
    rd.onload = () => { const img = new Image(); img.onerror = () => fail('That image could not be opened.');
      img.onload = () => { if (!img.naturalWidth || !img.naturalHeight) return fail('That image has no content.');
        const cur = wsGet(wsDoc, p); pendingImg[p] = { kind: 'upload', src: rd.result, alt: cur ? cur.alt : f.name, background: 'white' };
        out.querySelector(`[data-dg="${p}"] .dg-img`).innerHTML = diagramSVG(pendingImg[p]); };
      img.src = rd.result; };
    rd.readAsDataURL(f);
  });
}

/* ---------- Download: the view that is open ---------- */
function wsStudentIsClean(html) { return !html.includes('ws2-ans') && !html.includes('class="ws2-opt right"'); }   // the student copy never carries teacher content
async function wsDownload(view, fmt) {
  const teacher = view === 'teacher', html = wsPageHTML(wsDoc, teacher, true), name = wsFileName(wsDoc, view);
  if (!teacher && !wsStudentIsClean(html)) return toast('Download blocked: the student worksheet contains teacher content.');
  if (fmt === 'word' || fmt === 'both') {
    const css = 'body{font-family:Arial;font-size:12pt}.ws2-ptitle{text-align:center;font-size:18pt}.ws2-prow{margin-top:6pt;font-weight:bold}.ws2-sn{color:#E5384F;font-size:18pt;font-weight:bold}.ws2-type{display:none}.ws2-stitle{font-size:16pt;border-bottom:1px solid #ccc}.ws2-ins{font-style:italic;color:#555}.ws2-qn{color:#E5384F;font-weight:bold}.ws2-qt{font-weight:bold;margin:8pt 0 4pt}.ws2-line{border-bottom:1px dashed #999;height:20pt}.ws2-passage{background:#F4F4F5;padding:8pt}.ws2-ans{border-left:3pt solid #1E6B5C;background:#F4F9F7;padding:4pt 8pt;margin:4pt 0}.ws2-al{color:#1E6B5C;font-weight:bold}.right{font-weight:bold}.ws2-draw{border:1px dashed #999;height:120pt}.ws2-mrow{margin:3pt 0}.ws2-opts span{display:inline-block;width:48%}table{border-collapse:collapse}';
    const blob = new Blob([`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${esc(name)}</title><style>@page{size:A4;margin:20mm}${css}</style></head><body>${html}</body></html>`], { type: 'application/msword' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name + '.doc'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  if (fmt === 'pdf' || fmt === 'both' || fmt === 'print') { // PDF and Print both come from the print dialog, so the chosen view is shown first, then the open view is restored
    const t0 = document.title, back = wsView, show = () => { $('#view').innerHTML = wsOutputView(); wsBindOutput(); }; document.title = name;
    if (view !== wsView) { wsView = view; show(); }
    const undo = () => { document.title = t0; if (wsView !== back) { wsView = back; show(); } window.removeEventListener('afterprint', undo); };
    window.addEventListener('afterprint', undo); setTimeout(() => window.print(), fmt === 'both' ? 400 : 80);
  }
}
