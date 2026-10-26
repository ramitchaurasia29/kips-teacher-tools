/* Homework generator - OUTPUT: one homework JSON, two views.
   Student view = A4 paper (Assessment heading + name/roll/class/section/time/subject block, questions only).
   Teacher view = the same content as an open page (no paper sheet), with an answer box under each question.
   Editing follows the Assessment generator: values only (structure fixed), pale-blue boxes, per-block pencil, "+ Add line", blank length, replace (never delete) an image. */

/* an editable VALUE inside fixed structure: g = block id, p = path into the homework, ml = may wrap over several lines */
const hwEd = (g, p, v, ml) => `<span class="ed${ml ? ' ml' : ''}" data-g="${g}" data-p="${p}">${esc(v)}</span>`;
const hwLines = n => Array.from({ length: n }, () => '<div class="hw-line"></div>').join('');
const hwPen = (g, ex) => ex ? '' : `<button type="button" class="hw-pen icon-btn no-print" data-edit="${g}" title="Edit" aria-label="Edit this part">${ic('edit', 's')}</button>`;
const hwFileName = (D, view) => `Homework_Class${D.meta.class}_${D.meta.subject.replace(/\s+/g, '')}_${view === 'teacher' ? 'Teacher' : 'Student'}`;
const hwAns = (g, p, v, label = 'Answer:') => `<div class="hw-ans"><span class="hw-al">${label}</span> ${hwEd(g, p, v, true)}</div>`;

/* answer lines + the edit-time "+ Add line" */
const hwLinesBlock = (p, n, ex) => `<div class="hw-lines" data-lines="${p}" data-n="${n}">${hwLines(n)}</div>${ex ? '' : `<div class="ed-tools no-print"><button type="button" class="ed-link" data-line="1" data-lp="${p}">+ Add line</button></div>`}`;

const HW_ROMAN = ['i', 'ii', 'iii', 'iv', 'v'];
const hwOffset = (D, si) => D.sections.slice(0, si).reduce((n, s) => n + s.items.length, 0);   // question numbers run on across sections

function hwItemHTML(D, si, i, teacher, ex) {
  const s = D.sections[si], it = s.items[i], g = `s${si}i${i}`, P = `sections.${si}.items.${i}`, n = hwOffset(D, si) + i + 1;
  const qn = `<span class="hw-qn">${n}</span>`;
  const wrap = body => `<div class="hw-q hw-blk" data-gp="${g}">${body}${hwPen(g, ex)}</div>`;
  const text = `<p class="hw-qt">${hwEd(g, `${P}.text`, it.text, true)}</p>`;
  if (s.type === 'mcq') {
    const html = `<div class="hw-opts${it.options.every(o => String(o).length <= 22) ? '' : ' one'}">${it.options.map((o, k) => { const right = teacher && it.ans === k;
      return `<span class="hw-opt${right ? ' right' : ''}"><i class="hw-bub">${'ABCD'[k]}</i>${hwEd(g, `${P}.options.${k}`, o)}${right ? ' ✓' : ''}</span>`; }).join('')}</div>`;
    const ans = teacher ? `<div class="hw-ans"><span class="hw-al">Answer:</span> ${hwEd(g, `${P}.ansL`, 'ABCD'[it.ans])} <span class="hw-ax">${esc(it.options[it.ans] ?? '')}</span></div>` : '';
    return wrap(`${qn}<div class="hw-qb">${text}${html}${ans}</div>`);
  }
  if (s.type === 'tf') {
    const pills = `<div class="hw-tf">${['True', 'False'].map((o, k) => `<span class="hw-pill${teacher && it.ans === k ? ' right' : ''}">${o}</span>`).join('')}</div>`;
    const ans = teacher ? `<div class="hw-ans"><span class="hw-al">Answer:</span> ${hwEd(g, `${P}.ansTF`, ['True', 'False'][it.ans])}</div>` : '';
    return wrap(`${qn}<div class="hw-qb">${text}${pills}${ans}</div>`);
  }
  if (s.type === 'fill') {
    const blank = !ex && /_{3,}/.test(it.text) ? `<div class="ed-tools no-print"><span>Blank length</span><button type="button" class="ed-link" data-blank="-1" data-bp="${P}.text" aria-label="Shorter blank">−</button><button type="button" class="ed-link" data-blank="1" data-bp="${P}.text" aria-label="Longer blank">+</button></div>` : '';
    return wrap(`${qn}<div class="hw-qb">${text}${blank}${teacher ? hwAns(g, `${P}.ans`, it.ans) : ''}</div>`);
  }
  if (s.type === 'short' || s.type === 'vshort' || s.type === 'long') return wrap(`${qn}<div class="hw-qb">${text}${teacher ? hwAns(g, `${P}.ans`, it.ans) : hwLinesBlock(`${P}.lines`, it.lines, ex)}</div>`);
  if (s.type === 'case') {
    return wrap(`${qn}<div class="hw-qb"><div class="hw-passage">${hwEd(g, `${P}.passage`, it.passage, true)}</div>
      <p class="hw-read">Read the passage below and answer the questions that follow</p>
      ${it.subs.map((b, k) => `<div class="hw-sub"><p class="hw-qt">(${HW_ROMAN[k]}) ${hwEd(g, `${P}.subs.${k}.text`, b.text, true)}</p>${teacher ? hwAns(g, `${P}.subs.${k}.ans`, b.ans) : hwLinesBlock(`${P}.subs.${k}.lines`, b.lines, ex)}</div>`).join('')}</div>`);
  }
  return '';
}
/* matching: one table (Column A / Column B) */
function hwMatchHTML(D, si, gi, teacher, ex) {
  const s = D.sections[si], G = s.items[gi], g = `s${si}i${gi}`, P = `sections.${si}.items.${gi}`, n = hwOffset(D, si) + gi + 1;
  const rows = G.left.map((l, k) => `<div class="hw-mrow"><span class="hw-mc"><em>${k + 1}.</em>${hwEd(g, `${P}.left.${k}`, l)}</span><span class="hw-mc"><em>${'ABCDEFGHIJ'[k]}.</em>${hwEd(g, `${P}.right.${k}`, G.right[k])}</span></div>`).join('');
  const key = teacher ? `<div class="hw-ans"><span class="hw-al">Answer:</span> ${G.key.map((k, i) => `${i + 1} → ${'ABCDEFGHIJ'[k]}`).join('; ')}</div>` : '';
  return `<div class="hw-q hw-blk" data-gp="${g}"><span class="hw-qn">${n}</span><div class="hw-qb"><p class="hw-qt">${hwEd(g, `${P}.text`, G.text, true)}</p>
    <div class="hw-table"><div class="hw-mrow hw-mh"><b>${hwEd(g, `${P}.headA`, G.headA)}</b><b>${hwEd(g, `${P}.headB`, G.headB)}</b></div>${rows}</div>${key}</div>${hwPen(g, ex)}</div>`;
}
function hwSectionHTML(D, si, teacher, ex) {
  const s = D.sections[si], N = s.items.length;
  const items = s.type === 'match' ? s.items.map((_, gi) => hwMatchHTML(D, si, gi, teacher, ex)).join('') : s.items.map((_, i) => hwItemHTML(D, si, i, teacher, ex)).join('');
  return `<section class="hw-sec"><div class="hw-shead"><h2 class="hw-stitle">${esc(s.label)}</h2><span class="hw-count">${N} question${N === 1 ? '' : 's'}</span></div>${items}</section>`;
}
/* the page's top block: Homework heading, the student details, then the Instructions */
function hwHeadHTML(D, ex) {
  const m = D.meta;
  return `<header class="hw-ph hw-blk" data-gp="hd"><h1 class="hw-ptitle">${hwEd('hd', 'title', D.title)}</h1>
    <div class="hw-prow"><span>Name of the student: ____________________</span><span>Roll No. ________</span></div>
    <div class="hw-prow three"><span>Class: ${hwEd('hd', 'meta.class', m.class)}</span><span>Section: ______</span><span>Date: ${m.date ? hwEd('hd', 'meta.date', m.date) : '__________'}</span></div>
    <div class="hw-prow"><span>Subject: ${hwEd('hd', 'meta.subject', m.subject)}</span></div>${hwPen('hd', ex)}</header>
    <div class="hw-ins hw-blk" data-gp="ins"><b>Instructions</b><p>${hwEd('ins', 'instruction', D.instruction, true)}</p>${hwPen('ins', ex)}</div>`;
}
/* Teacher view top block: what was chosen on the input (no student details) */
function hwSummaryHTML(D) {
  const I = D.info, row = (k, v) => `<div class="hw-trow"><span class="hw-tk">${k}</span><span class="hw-tv">${v}</span></div>`;
  const chips = a => a.map(x => `<span class="hw-tchip">${esc(x)}</span>`).join('');
  return `<header class="hw-tsum"><h1 class="hw-ttitle">${esc(D.title)}</h1>
    <div class="hw-tgrid">${row('Class', esc(D.meta.class))}${row('Subject', esc(D.meta.subject))}${row('Questions', I.questions)}${row('Difficulty', esc(I.difficulty))}</div>
    ${row('Chapters', chips(I.chapters))}${row('Topics', chips(I.topics))}${row('Bloom’s levels', chips(I.blooms))}${row('Question types', chips(I.types))}</header>`;
}
const hwSectionsHTML = (D, teacher, ex) => D.sections.map((_, si) => hwSectionHTML(D, si, teacher, ex)).join('');
/* ex = export copy (Word / print): the same homework without edit tools */
function hwPageHTML(D, teacher, ex) {
  return `<article class="hw-paper${teacher ? ' open' : ''}">${teacher ? hwSummaryHTML(D) : hwHeadHTML(D, ex)}${hwSectionsHTML(D, teacher, ex)}</article>`;
}

function hwOutputView() {
  const D = hwDoc, t = hwView === 'teacher';
  return `<div class="toolbar"><div class="toolbar-in">
    <button class="icon-btn round" id="hwBack" aria-label="Change settings">${ic('back')}</button>
    <div class="tb-title"><small>Homework generator</small><b>Class ${esc(D.meta.class)} ${esc(D.meta.subject)} · Homework</b></div>
    <div class="mode" role="tablist"><button class="${t ? '' : 'on'}" data-view="student" role="tab">Student view</button><button class="${t ? 'on' : ''}" data-view="teacher" role="tab">Teacher view</button></div>
    <div class="acts"><button class="btn" id="hwEdit">${ic('edit', 's')}<span class="lb">Edit</span></button>${printBtn('hwPrint')}<button class="btn primary" id="hwDl" aria-haspopup="dialog">${ic('download', 's')}<span class="lb">Download</span></button></div></div></div>
  <div class="hw-out" id="hwOut">${hwPageHTML(D, t)}</div>`;
}

function hwBindOutput() {
  const view = $('#view'); view.classList.add('bg-white', 'view-hw'); view.classList.remove('is-editing');
  const out = $('#hwOut'), pendingImg = {};   // images chosen during this edit are kept until Save (a re-draw without saving drops them, like text edits)
  const rerender = () => { const y = view.scrollTop; view.innerHTML = hwOutputView(); hwBindOutput(); view.scrollTop = y; };
  const norm = s => String(s ?? '').replace(/\s+/g, ' ').trim();
  const open = () => !!$('.ed[contenteditable="true"]', out);
  const syncTop = () => window.editUI.top($('#hwEdit'), open());
  /* write the changed values (all blocks, or one) back into the homework; returns how many things changed */
  const commit = gid => {
    let n = 0;
    $$('.ed[data-p]', out).forEach(el => {
      if (gid && el.dataset.g !== gid) return;
      const raw = (el.classList.contains('ml') ? el.innerText : el.textContent).trim(), before = hwGet(hwDoc, el.dataset.p);
      if (!raw || norm(raw) === norm(before)) return;
      hwSet(hwDoc, el.dataset.p, raw); if (norm(hwGet(hwDoc, el.dataset.p)) !== norm(before)) n++;
    });
    $$('[data-lines]', out).forEach(el => { if (gid && !el.closest(`[data-gp="${gid}"]`)) return; const p = el.dataset.lines; if (+el.dataset.n !== hwGet(hwDoc, p)) { hwSet(hwDoc, p, +el.dataset.n); n++; } });
    Object.entries(pendingImg).forEach(([p, im]) => { if (gid && !out.querySelector(`[data-gp="${gid}"] [data-dg="${p}"]`)) return; hwSet(hwDoc, p, im); delete pendingImg[p]; n++; });
    return n;
  };
  const keepEdits = () => { if (open() || Object.keys(pendingImg).length) commit(); };   // leaving, printing or downloading keeps the edits

  $('#hwBack').onclick = () => { keepEdits(); navigate('#/homework-generator'); };
  $$('[data-view]').forEach(b => b.onclick = async () => {
    if (hwView === b.dataset.view) return;
    if (open()) { const r = await unsavedModal(); if (r === 'cancel') return; if (r === 'save') commit(); }   // discard: the re-render rebuilds from the saved homework
    hwView = b.dataset.view; rerender();
  });
  bindPrint('hwPrint', { run: v => { keepEdits(); hwDownload(v, 'print'); } });
  $('#hwDl').onclick = () => { keepEdits(); downloadModal({ view: hwView, file: v => hwFileName(hwDoc, v), run: hwDownload, formats: ['word', 'pdf'] }); };

  const setOpen = (els, on) => els.forEach(el => { el.contentEditable = on ? 'true' : 'false'; el.classList.toggle('editing', on); });
  $('#hwEdit').onclick = () => { // Edit -> Save: every block opens; Save writes the values back and closes everything
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
    if (l) { const box = out.querySelector(`[data-lines="${l.dataset.lp}"]`), n = Math.max(1, Math.min(20, +box.dataset.n + +l.dataset.line)); box.dataset.n = n; box.innerHTML = hwLines(n); }
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
        const cur = hwGet(hwDoc, p); pendingImg[p] = { kind: 'upload', src: rd.result, alt: cur ? cur.alt : f.name, background: 'white' };
        out.querySelector(`[data-dg="${p}"] .dg-img`).innerHTML = diagramSVG(pendingImg[p]); };
      img.src = rd.result; };
    rd.readAsDataURL(f);
  });
}

/* ---------- Download: the view that is open ---------- */
function hwStudentIsClean(html) { return !html.includes('hw-ans') && !html.includes('class="hw-opt right"') && !html.includes('hw-pill right'); }   // the student copy never carries teacher content
async function hwDownload(view, fmt) {
  const teacher = view === 'teacher', html = hwPageHTML(hwDoc, teacher, true), name = hwFileName(hwDoc, view);
  if (!teacher && !hwStudentIsClean(html)) return toast('Download blocked: the student homework contains teacher content.');
  if (fmt === 'word' || fmt === 'both') {
    const css = 'body{font-family:Arial;font-size:12pt}.hw-ptitle{text-align:center;font-size:18pt}.hw-prow{margin-top:6pt;font-weight:bold}.hw-shead{border-bottom:1px solid #ccc;margin-top:16pt}.hw-stitle{font-size:14pt;display:inline}.hw-count{float:right;font-size:9pt;color:#777}.hw-ins p{margin:2pt 0}.hw-pill{display:inline-block;border:1px solid #bbb;border-radius:6pt;padding:3pt 18pt;margin-right:6pt}.hw-passage{border-left:3pt solid #E5384F;font-style:italic;color:#555}.hw-table{border:1px solid #ccc}.hw-qn{color:#E5384F;font-weight:bold}.hw-qt{font-weight:bold;margin:8pt 0 4pt}.hw-line{border-bottom:1px dashed #999;height:20pt}.hw-passage{background:#F4F4F5;padding:8pt}.hw-ans{border-left:3pt solid #1E6B5C;background:#F4F9F7;padding:4pt 8pt;margin:4pt 0}.hw-al{color:#1E6B5C;font-weight:bold}.right{font-weight:bold}.hw-draw{border:1px dashed #999;height:120pt}.hw-mrow{margin:3pt 0}.hw-opts span{display:inline-block;width:48%}table{border-collapse:collapse}';
    const blob = new Blob([`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${esc(name)}</title><style>@page{size:A4;margin:20mm}${css}</style></head><body>${html}</body></html>`], { type: 'application/msword' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name + '.doc'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  if (fmt === 'pdf' || fmt === 'both' || fmt === 'print') { // PDF and Print both come from the print dialog, so the chosen view is shown first, then the open view is restored
    const t0 = document.title, back = hwView, show = () => { $('#view').innerHTML = hwOutputView(); hwBindOutput(); }; document.title = name;
    if (view !== hwView) { hwView = view; show(); }
    const undo = () => { document.title = t0; if (hwView !== back) { hwView = back; show(); } window.removeEventListener('afterprint', undo); };
    window.addEventListener('afterprint', undo); setTimeout(() => window.print(), fmt === 'both' ? 400 : 80);
  }
}
