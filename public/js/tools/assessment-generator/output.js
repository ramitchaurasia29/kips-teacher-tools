/* Assessment generator - OUTPUT (PRD §10): Student view / Teacher view of ONE paper JSON,
   edit (values only, structure fixed) and download of the chosen view. */

/* ---------- Diagrams on white / transparent backgrounds only (§10.6) ---------- */
function diagramSVG(d) {
  if (d.kind === 'upload') return `<img class="dg up" src="${d.src}" alt="${esc(d.alt)}">`;   // an image the teacher uploaded in place of the generated one
  const S = '#222', bg = d.background === 'white' ? '<rect width="100%" height="100%" fill="#fff"/>' : '', sp = d.spec;
  const wrap = (w, h, inner) => `<svg class="dg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(d.alt)}">${bg}${inner}</svg>`;
  if (d.kind === 'base_ten') {
    let x = 12, out = '';
    for (let i = 0; i < sp.tens; i++, x += 16) { out += `<rect x="${x}" y="10" width="12" height="80" fill="none" stroke="${S}" stroke-width="1.5"/>`; for (let k = 1; k < 10; k++) out += `<line x1="${x}" x2="${x + 12}" y1="${10 + k * 8}" y2="${10 + k * 8}" stroke="${S}" stroke-width="1"/>`; }
    x += 16; const x0 = x;
    for (let i = 0; i < sp.ones; i++) out += `<rect x="${x0 + (i % 5) * 16}" y="${10 + Math.floor(i / 5) * 16}" width="12" height="12" fill="none" stroke="${S}" stroke-width="1.5"/>`;
    return wrap(Math.max(x0 + 5 * 16 + 6, 160), 100, out);
  }
  if (d.kind === 'number_line') {
    const n = sp.end - sp.start, W = Math.max(300, n * 38 + 40), step = (W - 40) / n; let out = `<line x1="20" x2="${W - 20}" y1="50" y2="50" stroke="${S}" stroke-width="1.8"/>`;
    for (let i = 0; i <= n; i++) {
      const v = sp.start + i, x = 20 + i * step; out += `<line x1="${x}" x2="${x}" y1="42" y2="58" stroke="${S}" stroke-width="1.5"/>`;
      if (sp.missing.includes(v)) out += `<rect x="${x - 13}" y="64" width="26" height="22" fill="none" stroke="${S}" stroke-width="1.5"/><text x="${x}" y="80" text-anchor="middle" font-size="14" font-family="Arial">?</text>`;
      else if (sp.labelled.includes(v)) out += `<text x="${x}" y="80" text-anchor="middle" font-size="13" font-family="Arial" fill="${S}">${v}</text>`;
    }
    return wrap(W, 96, out);
  }
  if (d.kind === 'bundles') {
    let x = 10, out = '';
    sp.groups.forEach((g, gi) => {
      if (gi) { out += `<text x="${x + 2}" y="52" font-size="22" font-family="Arial">+</text>`; x += 30; }
      for (let b = 0; b < g.bundles; b++, x += 22) { for (let k = 0; k < 10; k++) out += `<line x1="${x + k * 1.8}" x2="${x + k * 1.8}" y1="10" y2="80" stroke="${S}" stroke-width="1.3"/>`; out += `<rect x="${x - 2}" y="38" width="22" height="8" fill="#fff" stroke="${S}" stroke-width="1.3"/>`; }
      x += 6; for (let l = 0; l < g.loose; l++, x += 7) out += `<line x1="${x}" x2="${x}" y1="10" y2="80" stroke="${S}" stroke-width="1.5"/>`; x += 14;
    });
    return wrap(Math.max(x, 140), 92, out);
  }
  return wrap(260, 120, `<rect x="6" y="6" width="248" height="108" rx="6" fill="none" stroke="${S}" stroke-width="1.6"/><text x="130" y="58" text-anchor="middle" font-size="13" font-family="Arial" fill="${S}">Diagram from textbook library</text><text x="130" y="78" text-anchor="middle" font-size="12" font-family="Arial" fill="${S}">${esc(sp.caption)}</text>`);
}

/* ---------- Paper rendering (one JSON, two views) ---------- */
const lines = n => Array.from({ length: n }, () => '<div class="aline"></div>').join('');

/* An editable VALUE inside fixed structure (labels, letters, marks, boxes stay as they are). f = field, i = index, ml = multi-line */
const ed = (qid, f, v, i, ml) => `<span class="ed${ml ? ' ml' : ''}" data-qid="${qid}" data-f="${f}"${i == null ? '' : ` data-i="${i}"`}>${esc(v)}</span>`;
function teacherBox(q, extra = '') {
  const marking = q.marking_points.length ? q.marking_points.map((p, i) => `${ed(q.id, 'mp', p.point, i)} (${p.marks})`).join('; ') + (q.partial_credit ? `. ${ed(q.id, 'pc', q.partial_credit)}` : '') : '';
  const alts = q.alternatives.length ? ` Accept: ${q.alternatives.map((a, i) => ed(q.id, 'alt', a, i)).join(', ')}.` : '';
  return `<div class="tbox"><div><span class="tlab">Answer:</span> ${ed(q.id, 'answer', q.answer, null, true)}${alts}</div><div><span class="tlab">Solution:</span> ${ed(q.id, 'solution', q.solution, null, true)}</div>${marking ? `<div><span class="tlab">Marking:</span> ${marking}</div>` : ''}${extra}${q.check_note ? `<div class="tnote">${esc(q.check_note)}</div>` : ''}</div>`;
}
function optionsHTML(q, teacher) {
  const short = q.options.every(o => String(o).length <= 16);
  return `<div class="mopts ${short ? 'two' : ''}">${q.options.map((o, i) => { const right = teacher && q.answer_option === i + 1; return `<span class="${right ? 'right' : ''}">(${'abcd'[i]}) ${ed(q.id, 'opt', o, i)}${right ? ' ✓' : ''}</span>`; }).join('')}</div>`;
}
function questionHTML(s, q, teacher, paper) {
  const topic = paper.chapters.flatMap(c => c.topics).find(t => t.id === q.topic_id);
  const tools = `<div class="qtools no-print"><button class="icon-btn" data-edit="${q.id}" title="Edit" aria-label="Edit question ${q.number}">${ic('edit', 's')}</button></div>`;
  /* edit-time helpers, shown only while this question is open for editing and never printed: change the image (replace only), lengthen the blank, add answer lines */
  const dia = q.diagram ? `<div class="dgwrap" data-dg="${q.id}"><span class="dg-img">${diagramSVG(q.diagram)}</span><button type="button" class="dg-edit no-print" data-pick="${q.id}" aria-label="Edit image">${ic('edit', 's')}</button><input type="file" accept="image/*" data-newimg="${q.id}" hidden></div>` : '';   // hover pencil on the image (edit mode only): replace it, never remove it
  if (s.type === 'match') return ''; // rendered as a table
  const blankTool = s.type === 'fill' && /_{3,}/.test(q.text) ? `<div class="ed-tools no-print"><span>Blank length</span><button type="button" class="ed-link" data-blank="-1" data-bq="${q.id}" aria-label="Shorter blank">−</button><button type="button" class="ed-link" data-blank="1" data-bq="${q.id}" aria-label="Longer blank">+</button></div>` : '';
  const lineTool = `<div class="ed-tools no-print"><button type="button" class="ed-link" data-line="1" data-lq="${q.id}">+ Add line</button></div>`;
  const tail = teacher ? teacherBox(q) : (q.lines ? `<div class="alines" data-lines="${q.id}" data-n="${q.lines}">${lines(q.lines)}</div>${lineTool}` : '');
  return `<div class="q" data-q="${q.id}">${tools}<div class="qrowp"><span class="qn">${q.number}.</span><div class="qbody">${dia}<div class="qtext">${ed(q.id, 'text', q.text)}${s.type === 'tf' ? ' &nbsp;(True / False)' : ''}</div>${blankTool}${s.type === 'mcq' ? optionsHTML(q, teacher) : ''}${tail}</div></div></div>`;
}
function matchHTML(s, teacher, paper) {
  const qs = s.questions;
  const rows = qs.map((q, i) => `<tr data-q="${q.id}"><td>${q.number}. ${ed(q.id, 'text', q.text)}<span class="qtools inl no-print"><button class="icon-btn" data-edit="${q.id}" aria-label="Edit">${ic('edit', 'xs')}</button></span></td><td class="gap"></td><td>(${'abcdefghij'[i]}) ${ed(q.id, 'colb', s.column_b[i])}</td></tr>`).join('');
  const notes = qs.filter(q => q.check_note).map(q => `<div class="tnote">${q.number}: ${esc(q.check_note)}</div>`).join('');
  return `<table class="mt"><thead><tr><th>Column A</th><th class="gap"></th><th>Column B</th></tr></thead><tbody>${rows}</tbody></table>
  ${teacher ? `<div class="tbox"><div><span class="tlab">Answer:</span> ${qs.map(q => `${q.number} → (${'abcdefghij'[s.column_b.indexOf(q.answer)]}) ${esc(q.answer)}`).join('; ')}</div><div><span class="tlab">Solution:</span> ${qs.map(q => `${q.number}. ${esc(q.text)} → ${esc(q.answer)}`).join('<br>')}</div>${notes}</div>` : ''}`;
}
/* Teacher view only: the inputs the paper was built from, shown as chips under the header */
function teacherInputsHTML(paper) {
  const m = paper.metadata, group = (label, items) => items.length ? `<div class="tin-g"><div class="tin-l">${label}</div><div class="tin-c">${items.map(i => `<span class="tin-chip">${esc(i)}</span>`).join('')}</div></div>` : '';
  const blooms = m.blooms_selected.length ? m.blooms_selected : Object.keys(m.blooms_resolved).filter(b => m.blooms_resolved[b] > 0);
  return `<div class="tin">${group('Chapters', paper.chapters.map(c => c.title))}${group('Topics', paper.chapters.flatMap(c => c.topics.map(t => t.title)))}${group('Bloom’s levels', blooms)}${group('Question types', [...new Set(paper.sections.map(s => agType(s.type)?.label).filter(Boolean))])}</div>`;
}
function agPaperHTML(paper, teacher) {
  const m = paper.metadata;
  const head = `<div class="ph">${m.school ? `<div class="ph-school">${esc(m.school)}</div>` : ''}<div class="ph-title">${esc(m.title)}</div>${teacher ? '<div class="ph-teacher">Teacher view: answers and solutions</div>' : `
    <div class="ph-row"><span>Name of the student: ____________________</span><span>Roll No. ________</span></div>
    <div class="ph-row"><span>Class: ${esc(m.grade)}</span><span>Section: ______</span><span>Time: ${m.time_minutes} min</span></div>
    <div class="ph-row"><span>Subject: ${esc(m.subject)}</span><span>Marks: ${m.total_marks}</span></div>`}</div>${teacher ? teacherInputsHTML(paper) : ''}`;
  const secs = paper.sections.map(s => `<section class="psec"><div class="sec-line"><b>${s.letter}. ${esc(s.instruction)}</b><b>${s.notation}</b></div>
    ${s.help_box ? `<div class="help-box">${s.help_box.map(esc).join(' &nbsp;·&nbsp; ')}</div>` : ''}
    ${s.type === 'match' ? matchHTML(s, teacher, paper) : s.questions.map(q => questionHTML(s, q, teacher, paper)).join('')}</section>`).join('');
  return `<article class="sheet-paper ${teacher ? 'teacher' : 'student'}">${head}${secs}${teacher ? '' : `<div class="pclose">All the best!</div>
    <div class="pfoot">${esc(m.subject)} · Class ${esc(m.grade)} · ${esc(m.title)} · Student view</div>`}</article>`;
}

/* ---------- Screen ---------- */
function agOutputView() {
  const p = agPaper, m = p.metadata, t = agView === 'teacher';
  return `<div class="toolbar"><div class="toolbar-in">
    <button class="icon-btn round" id="agBack" aria-label="Change settings">${ic('back')}</button>
    <div class="tb-title"><small>Assessment generator</small><b>Class ${esc(m.grade)} ${esc(m.subject)} · ${esc(m.assessment_name === 'Other' ? m.title : m.assessment_name)}</b></div>
    <div class="mode" role="tablist"><button class="${t ? '' : 'on'}" data-view="student" role="tab">Student view</button><button class="${t ? 'on' : ''}" data-view="teacher" role="tab">Teacher view</button></div>
    <div class="acts"><button class="btn" id="agEdit">${ic('edit', 's')}<span class="lb">Edit</span></button>${printBtn('agPrint')}<button class="btn primary" id="agDl" aria-haspopup="dialog">${ic('download', 's')}<span class="lb">Download</span></button></div></div></div>
  <div class="ag-out" id="agOut">${agPaperHTML(p, t)}</div>`;
}

function agBindOutput() {
  $('#view').classList.add('bg-white', 'view-ag');
  const rerender = () => { const y = $('#view').scrollTop; $('#view').innerHTML = agOutputView(); agBindOutput(); $('#view').scrollTop = y; };
  const keepEdits = () => { if ($('.ed[contenteditable="true"]')) commitEdits(); }; // leaving while editing keeps the edits
  $('#agBack').onclick = () => { keepEdits(); navigate('#/assessment-generator'); };
  $$('[data-view]').forEach(b => b.onclick = async () => {
    if (agView === b.dataset.view) return;
    if (open()) { const r = await unsavedModal(); if (r === 'cancel') return; if (r === 'save') commitEdits(); }   // discard: the re-render rebuilds from the saved paper
    agView = b.dataset.view; rerender();
  });
  bindPrint('agPrint', { run: view => { keepEdits(); agDownload(view, 'print'); } });
  $('#agDl').onclick = () => { keepEdits(); downloadModal({ view: agView, file: agFileName, run: agDownload, formats: ['word', 'pdf'] }); }; // PRD §10.5: Word or PDF
  /* every value (question text, options, answer, solution, marking points, Column B...) is a span.ed inside fixed structure */
  const norm = s => String(s ?? '').replace(/\s+/g, ' ').trim();
  const pendingImg = {};   // images chosen during this edit, kept until Save (a re-draw without saving drops them, like text edits)
  const commitEdits = qid => { // writes the changed values back (all questions, or one) and re-checks the question; returns how many questions changed
    const patches = {};
    $$('[data-lines]').forEach(el => { const id = el.dataset.lines; if (qid && id !== qid) return; const q = findQS(agPaper, id)[1]; if (+el.dataset.n !== q.lines) (patches[id] ||= {}).lines = +el.dataset.n; });
    Object.entries(pendingImg).forEach(([id, im]) => { if (qid && id !== qid) return; (patches[id] ||= {}).diagram = im; delete pendingImg[id]; });
    $$('.ed').forEach(el => {
      const id = el.dataset.qid, f = el.dataset.f, i = el.dataset.i; if (qid && id !== qid) return;
      const raw = (el.classList.contains('ml') ? el.innerText : el.textContent).trim();
      if (!raw || norm(raw) === norm(questionValue(agPaper, id, f, i))) return;
      const p = patches[id] ||= {};
      if (i == null) p[f] = raw; else (p[f] ||= {})[i] = raw;
    });
    Object.entries(patches).forEach(([id, p]) => editQuestion(agPaper, id, p));
    return Object.keys(patches).length;
  };
  /* top button and question buttons stay in sync: the top one reads Save while ANY question is open */
  const open = () => !!$('.ed[contenteditable="true"]');
  const syncTop = () => window.editUI.top($('#agEdit'), open());
  $('#view').classList.remove('is-editing');
  $('#agEdit').onclick = () => { // Edit -> Save: every question opens; Save commits the edits and closes every open question
    if (open()) { const n = commitEdits(); rerender(); toast(n ? `Saved – ${n} edited, answers and solutions re-checked` : 'Saved'); return; }
    $$('.ed').forEach(el => { el.contentEditable = 'true'; el.classList.add('editing'); });
    $('#view').classList.add('is-editing'); syncTop(); $('.ed')?.focus();
  };
  /* edit-time helpers: more answer lines, longer/shorter blank, replace an image (an empty, invalid or unreadable file keeps the current image) */
  const out = $('#agOut');
  out.addEventListener('click', e => {
    const l = e.target.closest('[data-line]'), b = e.target.closest('[data-blank]'), pk = e.target.closest('[data-pick]');
    if (pk) out.querySelector(`[data-newimg="${pk.dataset.pick}"]`).click();
    if (l) { const box = out.querySelector(`[data-lines="${l.dataset.lq}"]`), n = Math.max(1, Math.min(20, +box.dataset.n + +l.dataset.line)); box.dataset.n = n; box.innerHTML = lines(n); }
    if (b) { const sp = out.querySelector(`.ed[data-qid="${b.dataset.bq}"][data-f="text"]`); if (sp) sp.textContent = sp.textContent.replace(/_{3,}/, m => '_'.repeat(Math.max(4, Math.min(30, m.length + 2 * +b.dataset.blank)))); }
  });
  out.addEventListener('change', e => {
    const inp = e.target.closest('[data-newimg]'); if (!inp) return;
    const id = inp.dataset.newimg, f = inp.files && inp.files[0]; inp.value = '';
    const fail = why => toast(`${why} The current image is kept.`);
    if (!f || !f.size) return fail('That file is empty.');
    if (!/^image\//.test(f.type)) return fail('Please choose an image file.');
    if (f.size > 4 * 1024 * 1024) return fail('That image is over 4 MB.');
    const rd = new FileReader();
    rd.onerror = () => fail('That image could not be read.');
    rd.onload = () => { const img = new Image(); img.onerror = () => fail('That image could not be opened.');
      img.onload = () => { if (!img.naturalWidth || !img.naturalHeight) return fail('That image has no content.');
        const q = findQS(agPaper, id)[1]; pendingImg[id] = { src: rd.result, alt: q.diagram ? q.diagram.alt : f.name };
        out.querySelector(`[data-dg="${id}"] .dg-img`).innerHTML = diagramSVG({ kind: 'upload', src: rd.result, alt: pendingImg[id].alt }); };
      img.src = rd.result; };
    rd.readAsDataURL(f);
  });
  $$('.ed:not(.ml)').forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') e.preventDefault(); })); // one-line values stay one line
  $$('[data-edit]').forEach(b => b.onclick = () => { // pencil -> "save Save" for that question; structure stays, only its values open
    const id = b.dataset.edit, els = $$('.ed').filter(x => x.dataset.qid === id), on = els[0].contentEditable !== 'true';
    if (on) { els.forEach(el => { el.contentEditable = 'true'; el.classList.add('editing'); }); window.editUI.sec(b, true); els[0].focus(); syncTop(); return; }
    const changed = commitEdits(id);
    els.forEach(el => { el.contentEditable = 'false'; el.classList.remove('editing'); }); window.editUI.sec(b, false);
    if (!open()) { rerender(); if (changed) toast('Edited – answer and solution re-checked'); } else syncTop(); // the last open question closing re-draws the paper
  });
}

/* ---------- Download: the view that is open (§10.5) ---------- */
const agFileName = view => { const m = agPaper.metadata; return `Class${m.grade}_${m.subject.replace(/\s+/g, '')}_${m.assessment_name.replace(/\s+/g, '')}_${view === 'teacher' ? 'Teacher' : 'Student'}`; };
function agStudentIsClean(html) { return !html.includes('class="tbox"') && !html.includes('class="tlab"') && !html.includes('class="right"'); } // V1
async function agDownload(view, fmt) {
  const teacher = view === 'teacher', html = agPaperHTML(agPaper, teacher), name = agFileName(view);
  if (!teacher && !agStudentIsClean(html)) return toast('Download blocked: the student paper contains teacher content.');
  if (fmt === 'word' || fmt === 'both') {
    const css = 'body{font-family:Arial;font-size:12pt}.ph{text-align:center;font-weight:bold}.ph-school{font-size:16pt}.ph-title{font-size:14pt}.ph-row{margin-top:6pt}.psec{margin-top:22pt}.sec-line{margin:0 0 10pt}.q{margin-bottom:14pt}.ml{white-space:pre-line}.aline{border-bottom:1px solid #999;height:20pt}.tbox{border-left:3pt solid #1E6B5C;padding:4pt 8pt;margin:4pt 0;background:#F4F9F7}.tl{color:#1E6B5C;font-weight:bold}.right{font-weight:bold}.qtools,.pfoot{display:none}table{border-collapse:collapse;width:100%}td,th{padding:4pt}';
    const blob = new Blob([`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${esc(name)}</title><style>@page{size:A4;margin:20mm}${css}</style></head><body>${html}</body></html>`], { type: 'application/msword' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name + '.doc'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  if (fmt === 'pdf' || fmt === 'both' || fmt === 'print') { // PDF and Print both come from the print dialog, so the chosen view is shown first, then the open view is restored
    const t0 = document.title, back = agView, show = () => { $('#view').innerHTML = agOutputView(); agBindOutput(); }; document.title = name;
    if (view !== agView) { agView = view; show(); }
    const undo = () => { document.title = t0; if (agView !== back) { agView = back; show(); } window.removeEventListener('afterprint', undo); };
    window.addEventListener('afterprint', undo); setTimeout(() => window.print(), fmt === 'both' ? 400 : 80);
  }
}
