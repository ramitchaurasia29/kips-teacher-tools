/* Assignment generator - OUTPUT (PRD §10)
   Teacher View: sections 1-7 as cards.  Student View: A4 sheets (§6.3).
   Edit / regenerate per section and per question, save, share with versions, export. */

const asgTitle = d => d.metadata.topic;   // title = topic only; the assignment type sits in the line under the heading
const asgFile = (d, view) => `${d.metadata.topic.replace(/[^A-Za-z0-9]+/g, '_')}_Assignment_${view === 'teacher' ? 'Teacher' : 'Student'}_View`;
const alist = a => a.map(x => `<li>${esc(x)}</li>`).join('');
const alines = n => Array.from({ length: n }, () => '<div class="asg-line"></div>').join('');
const asgPill = (m, show) => show && m ? `<span class="asg-m">${m} mark${m === 1 ? '' : 's'}</span>` : '';
const asgSrcText = { textbook: 'Source: textbook content', teacher_content: 'Source: your topic content', unverified: 'Unverified: not checked against the textbook' };
const asgTbl = (headers, rows, cls = '') => `<div class="asg-tw"><table class="asg-t ${cls}"><thead><tr>${headers.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;

/* ---------- Tasks (shared by both views; teacher-only fields never reach the student renderer) ---------- */
function asgTaskHTML(t, teacher, d, tools) {
  const show = teacher ? d.metadata.marks_enabled : d.metadata.marks_in_student_view;
  const rows = t.table ? t.table.rows.map((r, i) => `<tr>${r.map((c, j) => `<td class="${j === 0 && c ? 'lab' : ''}">${esc(c)}</td>`).join('')}</tr>`) : [];
  const tbl = t.table ? asgTbl(t.table.headers, rows, 'in') : '';
  const opts = t.options ? `<div class="asg-opts">${t.options.map((o, i) => `<span><i>${'abcd'[i]}</i>${esc(o)}</span>`).join('')}</div>` : '';
  const tool = '';
  const done = t.milestone ? (teacher ? `<span class="asg-date">by ${asgFmtDate(t.date)}</span>` : `<div class="asg-done"><i></i> Done. Finish by <b>${asgFmtDate(t.date)}</b></div>`) : '';
  const space = teacher ? '' : t.draw ? '<div class="asg-draw"><span>Draw here</span></div>' : alines(t.answer_lines);
  return `<div class="asg-q"><div class="asg-ql"><b class="asg-qn">Q${t.n}</b><span class="asg-qt">${esc(t.text)}${teacher && t.milestone ? ' ' + done : ''}</span>${asgPill(t.marks, show)}${teacher && t.bloom ? `<span class="asg-m asg-bl">${esc(t.bloom)}</span>` : ''}${tool}</div>${opts}${tbl}${!teacher && t.milestone ? done : ''}${space}</div>`;
}
function asgTasksHTML(d, teacher, tools) {
  const m = d.metadata, B = d.type_blocks, show = teacher ? m.marks_enabled : m.marks_in_student_view; let h = '';
  if (B.research) h += `<div class="asg-box"><b>Research question</b><p>${esc(B.research.question)}</p>${teacher ? `<div class="asg-sh first">Allowed sources</div><ul>${alist(B.research.allowed_sources)}</ul><div class="asg-sh">Report format</div><p>Headings: ${B.research.report_headings.map(esc).join(', ')}. About ${B.research.word_limit} words.</p><p class="asg-safe">${esc(B.research.safety)}</p>` : ''}</div>`;
  if (B.project) h += `<div class="asg-box"><b>Driving question</b><p>${esc(B.project.driving_question)}</p><b>Product</b><p>Make ${esc(B.project.product)}.</p>${teacher ? `<div class="asg-sh">Materials</div><ul>${alist(B.project.materials)}</ul>` : ''}<div class="asg-sh">Steps</div><ol>${alist(B.project.steps)}</ol></div>`;
  if (B.writing) h += `<div class="asg-box"><b>${B.writing.prompts.length > 1 ? 'Choose one prompt' : 'Prompt'}</b><ol>${alist(B.writing.prompts)}</ol><p class="asg-meta3"><span><b>Form</b> ${esc(B.writing.form)}</span><span><b>Audience</b> ${esc(B.writing.audience)}</span><span><b>Word limit</b> ${B.writing.word_limit}</span></p></div>`;
  d.sections.forEach((s, si) => {
    const c = B.case && B.case[si], hide = d.sections.length === 1 && (B.research || B.project || B.writing);
    h += `<div class="asg-sub">${hide ? '' : `<div class="asg-sub-h"><b>${esc(teacher ? s.teacher_title : s.student_title)}</b>${show ? `<span class="asg-m">${s.marks} marks</span>` : ''}</div>`}
      ${c ? `<div class="asg-case"><b>${esc(c.title)}</b><p>${esc(c.text)}</p>${c.data_table ? asgTbl(c.data_table.headers, c.data_table.rows.map(r => `<tr><td class="lab">${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`), 'in') : ''}</div>` : ''}
      ${s.tasks.map(t => asgTaskHTML(t, teacher, d, tools)).join('')}${!teacher && m.assignment_type === 'chapter_revision' ? '<div class="asg-self">Self-check: <i></i> I found this easy <i></i> I found this hard</div>' : ''}</div>`;
  });
  return h;
}

/* ---------- Teacher sections 1-7 (§10.2) ---------- */
function asgOverviewHTML(d) {
  const m = d.metadata, used = ASG_BLOOMS.filter(b => d.sections.some(s => s.tasks.some(t => t.bloom === b))), missed = (m.blooms || []).filter(b => !used.includes(b));
  const bloomTxt = (used.join(', ') || 'None') + (missed.length ? `. Not covered: ${missed.join(', ')}.` : '');   // PRD 10.2 #1: levels used, and any chosen level with no question
  const kv = [['Title', asgTitle(d)], ['Difficulty', cap(m.difficulty)], ['Bloom’s levels', bloomTxt], ['Questions / tasks', m.task_count], ['Completion time', `${m.completion_minutes} minutes`], ['Submission date', asgFmtDate(m.due_date)], ['Total marks', m.marks_enabled ? m.total_marks : 'No marks']];
  return `<dl class="asg-kv">${kv.map(r => `<div><dt>${r[0]}</dt><dd>${esc(r[1])}</dd></div>`).join('')}<div class="wide"><dt>Objective</dt><dd>${esc(m.objective)}</dd></div></dl><div class="asg-sh">Expected learning outcomes</div><ul class="asg-ticks">${alist(d.outcomes)}</ul>`;
}
const asgDeliverableHTML = d => `<p>${esc(d.deliverable.text)}</p>${d.deliverable.length_guide.length ? asgTbl(['Part', 'Length'], d.deliverable.length_guide.map(x => `<tr><td class="lab">${esc(x.item)}</td><td>${esc(x.length)}</td></tr>`)) : ''}`;
function asgGuidanceHTML(d) {                 // §10.2 #5: per question, expected answer or key points, accept also, marking points
  const tasks = d.sections.flatMap(s => s.tasks), on = d.metadata.marks_enabled;
  const tm = d.metadata.assignment_type === 'chapter_revision' ? Object.fromEntries(d.type_blocks.revision.topic_map.map(x => [x.task, x.topic])) : null;   // Chapter revision: question -> topic, so the teacher sees what to reteach
  if (!on) return `<ul class="asg-checklist">${tasks.map(t => `<li><b>Q${t.n}</b>${tm ? ` <i>(${esc(tm[t.n])})</i>` : ''} ${esc(t.answer)}${t.accept_also ? ` <i>Accept also: ${esc(t.accept_also)}</i>` : ''}</li>`).join('')}</ul>`;
  return asgTbl(['Q', ...(tm ? ['Topic'] : []), 'Expected answer / key points', 'Accept also', 'Marking points'], tasks.map(t => {
    const ans = t.table?.answers ? t.table.answers.map((a, i) => `<div>${esc(t.table.rows[i][0])}: ${esc(a)}</div>`).join('') : esc(t.answer);
    return `<tr><td class="lab">Q${t.n}</td>${tm ? `<td>${esc(tm[t.n])}</td>` : ''}<td>${ans}${t.format === 'mcq' && t.explain ? `<div class="asg-why">${esc(t.explain)}</div>` : ''}</td><td>${esc(t.accept_also || '–')}</td><td>${t.marking_points.map(p => `${esc(p.point)} (${p.marks})`).join('; ')}${t.partial_credit ? `<div class="asg-why">${esc(t.partial_credit)}</div>` : ''}</td></tr>`;
  }), 'gd');
}function asgEvaluationHTML(d) {
  const ev = d.evaluation, m = d.metadata;
  return `${asgTbl(['Section', 'Questions', 'Marks'], [...ev.distribution.map(x => `<tr><td class="lab">${esc(x.section)}</td><td>${x.tasks.map(n => 'Q' + n).join(', ')}</td><td class="num">${x.marks}</td></tr>`), `<tr class="tot"><td class="lab">Total</td><td></td><td class="num">${m.total_marks}</td></tr>`])}
  ${ev.rubric.length ? `<div class="asg-sh">Rubric</div>${asgTbl(['Criterion', 'Questions', 'Marks', 'Full', 'Partial', 'Not yet'], ev.rubric.map(r => `<tr><td class="lab">${esc(r.criterion)}</td><td>${r.tasks.length > 6 ? `Q${r.tasks[0]} to Q${r.tasks[r.tasks.length - 1]}` : r.tasks.map(n => 'Q' + n).join(', ')}</td><td class="num">${r.marks}</td><td>${esc(r.full)}</td><td>${esc(r.partial)}</td><td>${esc(r.not_yet)}</td></tr>`), 'rb')}` : ''}`;
}
function asgNotesHTML(d) {
  const n = d.teacher_notes;
  return `<div class="asg-sh first">Preparation</div><p>${esc(n.preparation)}</p>
    <div class="asg-sh">Likely misconceptions</div>${asgTbl(['Misconception', 'How to address it'], n.misconceptions.map(x => `<tr><td class="lab">${esc(x.misconception)}</td><td>${esc(x.address)}</td></tr>`))}
    <div class="asg-sh">Differentiation</div><div class="asg-diff"><div><b>Needs support</b>${esc(n.needs_support)}</div><div><b>Ready for more</b>${esc(n.ready_for_more)}</div></div>
    <div class="asg-sh">Type-specific notes</div><ul>${alist(n.type_notes)}</ul>`;
}

/* ---------- Student extras by type (§6.3) ---------- */
function asgStudentExtra(d) {
  const m = d.metadata, B = d.type_blocks, t = m.assignment_type, show = m.marks_in_student_view;
  const rub = show && d.evaluation.rubric.length ? `<div class="asg-sh">How it will be marked</div>${asgTbl(['Criterion', 'Marks'], d.evaluation.rubric.map(r => `<tr><td class="lab">${esc(r.criterion)}</td><td class="num">${r.marks}</td></tr>`))}` : '';
  const boxes = a => `<div class="asg-planner">${a.map(h => `<div><b>${esc(h)}</b></div>`).join('')}</div>`;
  if (t === 'research_task') return `<div class="asg-sh first">Source record</div>${asgTbl(['Source', 'What I found'], [1, 2, 3].map(() => '<tr><td class="lab"></td><td></td></tr>'), 'in')}<div class="asg-sh">Report planner</div>${boxes(B.research.report_headings)}<p><b>Word limit:</b> about ${B.research.word_limit} words.</p><p class="asg-safe">${esc(B.research.safety)}</p>${rub}`;
  if (t === 'project') return `<div class="asg-sh first">Materials you need</div><ul class="asg-chk">${alist(B.project.materials)}</ul><div class="asg-sh">Final product checklist</div><ul class="asg-checks"><li>It answers the driving question</li><li>It uses the key ideas correctly</li><li>It is neat and complete</li></ul>${rub}`;
  if (t === 'essay_creative_writing') return `<div class="asg-sh first">Planner</div>${boxes(B.writing.planner)}<div class="asg-sh">Success criteria</div><ul class="asg-checks">${alist(B.writing.success_criteria)}</ul><div class="asg-wc">Word count: ______ / ${B.writing.word_limit}</div>${rub}`;
  return rub.replace(/^<div class="asg-sh">How it will be marked<\/div>/, '');
}
function asgStudentLearn(d) {
  const rev = d.metadata.assignment_type === 'chapter_revision' ? `<p><b>Topics covered:</b> ${[...new Set(d.type_blocks.revision.topic_map.map(x => x.topic))].map(esc).join(', ')}</p>` : '';
  return `${rev}<p>${esc(d.student_intro)}</p>`;
}

/* ---------- Section lists ---------- */
const ASG_T_EMOJI = { t1: '📋', t2: '📝', t3: '🧩', t4: '📦', t5: '✅', t6: '📊', t7: '💡' };   // on the Teacher View section headings only (not in the Word copy)
const ASG_T_TITLES = { t1: 'Assignment overview', t2: 'Student instructions', t3: 'Detailed tasks', t4: 'Expected deliverable', t5: 'Answer guidance', t6: 'Evaluation', t7: 'Teacher notes' };
function asgTeacherSections(d) {
  const secs = [['t1', asgOverviewHTML(d)], ['t2', `<ol class="asg-bul">${alist(d.instructions)}</ol>`], ['t3', asgTasksHTML(d, true, true)], ['t4', asgDeliverableHTML(d)], ['t5', asgGuidanceHTML(d)]];
  if (d.metadata.marks_enabled) secs.push(['t6', asgEvaluationHTML(d)]);
  secs.push(['t7', asgNotesHTML(d)]);
  return secs.map(s => [s[0], ASG_T_TITLES[s[0]], s[1]]);
}
function asgStudentSections(d) {
  const secs = [['s_learn', 'What will you learn?', asgStudentLearn(d)], ['s_instr', 'Instructions', `<ul class="asg-bul">${alist(d.instructions)}</ul>`], ['s_handin', 'What to hand in', asgDeliverableHTML(d)], ['s_tasks', 'Your tasks', asgTasksHTML(d, false, true)]];
  const ex = asgStudentExtra(d); if (ex) secs.push(['s_extra', { project: 'Your project', research_task: 'Your research', essay_creative_writing: 'Plan your writing' }[d.metadata.assignment_type] || 'How it will be marked', ex]);
  secs.push(['s_submit', 'Submission', `<p>Hand in your work to your teacher by <b>${asgFmtDate(d.metadata.due_date)}</b>.</p>`]);
  secs.push(['s_check', 'Before you submit', `<ul class="asg-checks">${alist(d.student_checklist)}</ul>`]);
  return secs;
}
const asgBodyHTML = (key, html) => asgDoc.edits[key] ?? html;
const asgTools = (key, title) => asgNoTools ? '' : `<div class="asg-tools no-print"><button class="icon-btn" data-edit="${key}" title="Edit" aria-label="Edit ${esc(title)}">${ic('edit', 's')}</button></div>`;
const CHECK_SECTION = { T1: 't3', T2: 't3', T3: 't3', T4: 't3', T5: 't3', T6: 't3', A1: 't5', M1: 't3', M2: 't5', M3: 't6' };

/* ---------- Teacher View (cards) ---------- */
function asgTeacherHTML(d) {
  const m = d.metadata, bad = asgFailed(d), warn = d.generation_notes.warnings.filter(w => !w.startsWith('Unverified'));
  const hero = `<header class="asg-hero"><h1>${esc(asgTitle(d))}</h1><p>${esc(m.book)} › ${esc(m.topic)} · ${esc(m.type_label)}</p>${m.source_status === 'unverified' ? `<span class="asg-srcs warn">${asgSrcText.unverified}</span>` : ''}</header>`;
  const summary = asgPlain || !(bad.length || warn.length) ? '' : `<div class="asg-sum no-print ${bad.length || warn.length ? 'warn' : ''}">${ic(bad.length || warn.length ? 'alert' : 'tick', 's')}<span>${bad.length ? `${bad.length} check${bad.length > 1 ? 's' : ''} need attention.` : ''}${warn.map(w => ' ' + esc(w)).join('')}</span></div>`;
  return `<article class="asg-teacher">${hero}${summary}${asgTeacherSections(d).map((s, i) => {
    const notes = bad.filter(c => CHECK_SECTION[c.id] === s[0]).map(c => `<div class="asg-secnote">${esc(c.note)}</div>`).join('');
    return `<section class="asg-card" data-sec="${s[0]}"><div class="asg-ch"><span class="asg-n">${s[0].slice(1)}</span><h2>${asgPlain ? '' : `<span class="asg-em" aria-hidden="true">${ASG_T_EMOJI[s[0]] || ''}</span>`}${esc(s[1])}</h2>${asgTools(s[0], s[1])}</div>${notes}<div class="asg-cb" data-body="${s[0]}">${asgBodyHTML(s[0], s[2])}</div></section>`;
  }).join('')}<div class="asg-tfoot">Teacher View | ${esc(asgTitle(d))}</div></article>`;
}

/* ---------- Student View (flat document, split into A4 sheets on screen) ---------- */
function asgStudentHTML(d) {
  const m = d.metadata, show = m.marks_in_student_view;
  const head = `<div class="asg-dh"><h1>${esc(asgTitle(d))}</h1><p>${esc(m.book)} › ${esc(m.topic)} · ${esc(m.type_label)}</p></div>`;
  const strip = asgPlain
    ? `<p>Name: ____________________ &nbsp; Class / Section: ________ &nbsp; Date: ________</p><p>${show && m.total_marks ? `Total marks: <b>${m.total_marks}</b> &nbsp; ` : ''}Time: <b>${m.completion_minutes} min</b> &nbsp; Submit by: <b>${asgFmtDate(m.due_date)}</b></p>`
    : `<div class="asg-fields">${['Name', 'Class / Section', 'Date'].map(l => `<div><span>${l}</span><i></i></div>`).join('')}</div><div class="asg-metas">${show && m.total_marks ? `<div><span>Total marks</span><b>${m.total_marks}</b></div>` : ''}<div><span>Time</span><b>${m.completion_minutes} min</b></div><div><span>Submit by</span><b>${asgFmtDate(m.due_date)}</b></div></div>`;
  const secs = asgStudentSections(d).map((s, i) => `<section class="asg-sec" data-sec="${s[0]}"><div class="asg-ash"><span class="asg-sn">${i + 1}</span><h2>${esc(s[1])}</h2>${asgTools(s[0], s[1])}</div><div class="asg-body ${s[0] === 's_check' ? 'asg-checkbox' : ''}" data-body="${s[0]}">${asgBodyHTML(s[0], s[2])}</div></section>`).join('');
  return `<article class="asg-doc student">${head}${strip}${secs}<div class="asg-dfoot" data-foot="Student View | ${esc(asgTitle(d))}">Student View | ${esc(asgTitle(d))} | Page X</div></article>`;
}
/* mode: undefined = on screen; 'plain' = flat copy for Word and the share check; 'share' = sheets without edit tools */
let asgNoTools = false;
function asgDocHTML(d, view, mode) { asgPlain = mode === 'plain'; asgNoTools = !!mode; try { return view === 'teacher' ? asgTeacherHTML(d) : asgStudentHTML(d); } finally { asgPlain = asgNoTools = false; } }

/* ---------- A4 pagination of the Student View (screen + print) ----------
   Tasks, tables, case boxes and checklists stay whole; headings stay with the next block (R1);
   a table taller than a page continues on the next sheet with its header row repeated. */
const ASG_KEEP = new Set(['s_learn', 's_instr', 's_handin', 's_submit', 's_check']);
const asgGlue = el => el.classList.contains('asg-sh') || el.classList.contains('asg-sub-h');
function asgPaginate(out) {
  const src = out && out.querySelector('.asg-doc'); if (!src) return;
  const foot = src.querySelector('.asg-dfoot').dataset.foot, units = [], shells = {};
  [...src.children].forEach(ch => {
    if (ch.classList.contains('asg-dfoot')) return;
    if (!ch.matches('section.asg-sec') || ASG_KEEP.has(ch.dataset.sec)) return units.push({ el: ch });
    const key = ch.dataset.sec, body = ch.querySelector(':scope > .asg-body'), kids = [];
    [...body.childNodes].forEach(n => {
      if (n.nodeType === 3 && n.textContent.trim()) { const p = document.createElement('p'); p.textContent = n.textContent; kids.push(p); }
      else if (n.nodeType === 1) kids.push(...(n.classList.contains('asg-sub') ? [...n.children] : [n]));
    });
    if (!kids.length) return units.push({ el: ch });
    shells[key] = body.cloneNode(false);
    const head = [ch.querySelector(':scope > .asg-ash')];
    kids.forEach((el, i) => units.push({ el, key, head: i === 0 ? head : null, glue: asgGlue(el) }));
  });
  const pages = document.createElement('div'); pages.className = 'asg-pages'; src.before(pages);
  let page = null;
  const newPage = () => { const el = document.createElement('div'); el.className = 'asg-page'; el.innerHTML = '<div class="asg-pbody"></div><div class="asg-pfoot"><span></span><span></span></div>'; pages.appendChild(el); page = { body: el.firstChild, cur: null }; };
  const fits = () => page.body.scrollHeight <= page.body.clientHeight + 1;
  const attach = u => {                       // returns an undo function
    const prev = page.cur; let wrap = null;
    if (!u.key) { page.body.appendChild(u.el); page.cur = null; return () => { u.el.remove(); page.cur = prev; }; }
    if (u.head || !prev || prev.key !== u.key) {
      const w = document.createElement('section'); w.className = 'asg-sec' + (u.head ? '' : ' cont'); w.dataset.sec = u.key;
      if (u.head) w.append(...u.head);
      const b = shells[u.key].cloneNode(false); w.appendChild(b); page.body.appendChild(w); wrap = w; page.cur = { key: u.key, b };
    }
    page.cur.b.appendChild(u.el);
    return () => { u.el.remove(); wrap?.remove(); page.cur = prev; };
  };
  const splitTable = u => {                   // u is attached on an otherwise empty page and overflows it
    const tbody = u.el.querySelector('tbody'), rows = [...tbody.rows]; let cur = tbody; tbody.innerHTML = '';
    rows.forEach(r => {
      cur.appendChild(r);
      if (!fits() && cur.rows.length > 1) {
        cur.removeChild(r); newPage();
        const el = u.el.cloneNode(true); cur = el.querySelector('tbody'); cur.innerHTML = '';
        attach({ el, key: u.key }); cur.appendChild(r);
      }
    });
  };
  newPage();
  for (let i = 0; i < units.length; i++) {
    const group = [units[i]]; while (group[group.length - 1].glue && units[i + 1]) group.push(units[++i]);
    const wasEmpty = !page.body.children.length, undo = []; group.forEach(u => undo.push(attach(u)));
    if (fits()) continue;
    if (!wasEmpty) { undo.reverse().forEach(f => f()); newPage(); group.forEach(u => attach(u)); if (fits()) continue; }
    const last = group[group.length - 1];
    if (last.el.classList.contains('asg-tw') && last.el.querySelector('tbody')) splitTable(last);
  }
  [...pages.children].forEach((p, i) => { const s = p.querySelectorAll('.asg-pfoot span'); s[0].textContent = foot; s[1].textContent = `Page ${i + 1}`; });
  src.remove(); asgFitPages();
}
function asgFitPages() {                      // narrow screens: scale the sheets down instead of scrolling sideways
  $$('.asg-pages').forEach(p => { const w = p.parentElement.clientWidth - 24; p.style.zoom = w > 0 ? Math.min(1, w / 794) : 1; });
}
window.addEventListener('resize', asgFitPages);

/* ---------- Screen ---------- */
const asgBadge = () => `Assignment generator · Draft v${asgDoc.version}${asgDoc.published ? ` · Shared v${asgDoc.published.version}` : ''}`;
function asgOutputView() {
  const D = asgDoc, d = D.data, m = d.metadata, t = asgView === 'teacher';
  return `<div class="toolbar"><div class="toolbar-in">
    <button class="icon-btn round" id="asgBack" aria-label="Change settings">${ic('back')}</button>
    <div class="tb-title"><small id="asgBadge">${asgBadge()}</small><b>Class ${esc(m.grade)} ${esc(m.subject)} · ${esc(m.topic)}</b></div>
    <div class="mode" role="tablist"><button class="${t ? '' : 'on'}" data-view="student" role="tab">Student View</button><button class="${t ? 'on' : ''}" data-view="teacher" role="tab">Teacher View</button></div>
    <div class="acts"><button class="btn" id="asgEdit">${ic('edit', 's')}<span class="lb">Edit</span></button>${printBtn('asgPrint')}<button class="btn primary" id="asgExport">${ic('download', 's')}<span class="lb">Download</span></button></div></div></div>
  <div class="asg-out" id="asgOut">${asgDocHTML(d, asgView)}</div>`;
}
const asgSerialize = el => el.innerHTML.replace(/ contenteditable="(true|false)"/g, '');
function asgChanged() { if (!asgDoc.changed) { asgDoc.version++; asgDoc.changed = true; const s = $('#asgBadge'); if (s) s.textContent = asgBadge(); } asgDoc.dirty = true; }
const asgSig = () => JSON.stringify([asgDoc.data.sections, asgDoc.data.type_blocks, asgDoc.data.instructions, asgDoc.data.deliverable, asgDoc.data.evaluation, asgDoc.data.student_checklist, asgDoc.data.outcomes, asgDoc.edits]);

function asgBindOutput() {
  $('#view').classList.add('bg-white', 'view-asg'); $('#view').classList.toggle('asg-stu', asgView === 'student');
  asgPaginate($('#asgOut'));
  const D = asgDoc, rerender = () => { const y = $('#view').scrollTop; $('#view').innerHTML = asgOutputView(); asgBindOutput(); $('#view').scrollTop = y; };
  const autosave = () => { if ($('[data-body][contenteditable="true"]')) { D.changed = false; asgSaveDoc(); } }; // leaving while editing keeps the edits
  $('#asgBack').onclick = () => { autosave(); navigate('#/assignment-generator'); };
  let snap = null;   // the document as it was when edit mode opened, so Discard can restore it (edits are written live on input)
  const markOpen = () => { if (!editing()) snap = { edits: JSON.stringify(D.edits), version: D.version, changed: D.changed, dirty: D.dirty }; };
  $$('[data-view]').forEach(b => b.onclick = async () => {
    if (asgView === b.dataset.view) return;
    if (editing()) {
      const r = await unsavedModal(); if (r === 'cancel') return;
      if (r === 'save') autosave(); else if (snap) Object.assign(D, { edits: JSON.parse(snap.edits), version: snap.version, changed: snap.changed, dirty: snap.dirty });
    }
    asgView = b.dataset.view; rerender(); $('#view').scrollTo(0, 0);
  });
  const bodies = k => $$(`[data-body="${k}"]`);   // a Student View section can continue over several sheets
  /* Editing changes the CONTENT only: marks, Q numbers, section bars, option letters, table headers/labels and answer spaces stay fixed */
  const FIXED = '.asg-m,.asg-qn,.asg-sub-h,.asg-opts i,.asg-line,.asg-draw,.asg-done,.asg-date,th,td.lab';
  const lock = (el, on) => { $$(FIXED, el).forEach(x => on ? x.setAttribute('contenteditable', 'false') : x.removeAttribute('contenteditable')); el.contentEditable = on ? 'true' : 'false'; };
  const open = (el, on) => { lock(el, on); el.closest('[data-sec]').classList.toggle('editing', on); };
  /* top button and section buttons stay in sync: the top one reads Save while ANY section is open */
  const editing = () => !!$('[data-body][contenteditable="true"]');
  const syncTop = () => window.editUI.top($('#asgEdit'), editing());
  $('#view').classList.remove('is-editing');
  $('#asgEdit').onclick = () => { // Edit -> Save: every section opens; Save stores the assignment and closes every open section
    if (editing()) { D.changed = false; asgSaveDoc(); rerender(); toast('Saved to My assignments'); return; }
    markOpen(); $$('[data-body]').forEach(el => open(el, true));
    $('#view').classList.add('is-editing'); syncTop(); $('[data-body]')?.focus();
  };
  $$('[data-body]').forEach(el => el.addEventListener('keydown', e => { // one-line values (question text, options) stay one line so the layout cannot break
    if (e.key !== 'Enter') return; const n = getSelection().anchorNode, p = n && (n.nodeType === 3 ? n.parentNode : n);
    if (p?.closest('.asg-qt,.asg-opts span')) e.preventDefault();
  }));
  $$('[data-body]').forEach(el => el.addEventListener('input', () => { const k = el.dataset.body; D.edits[k] = bodies(k).map(asgSerialize).join(''); asgChanged(); }));
  $$('[data-edit]').forEach(b => b.onclick = () => { // pencil -> "tick Done" for that section
    const els = bodies(b.dataset.edit), on = els[0].contentEditable !== 'true';
    if (on) markOpen();
    els.forEach(el => open(el, on));
    window.editUI.sec(b, on);
    if (on) els[0].focus();
    else if (!editing()) { D.changed = false; asgSaveDoc(); rerender(); return; } // last open section closed: keep the edits and re-flow the sheets
    syncTop();
  });
  $('#asgExport').onclick = asgDownloadModal;
  bindPrint('asgPrint', { run: view => asgExport(view, 'print') });
}

/* ---------- §10.5 Share student version: review tick, link, revoke, publish updated version ---------- */
function asgStudentClean(html, d) { // V1: nothing from a teacher-only field may appear in the student copy
  const t = d.teacher_notes, bag = [...d.sections.flatMap(s => s.tasks.flatMap(x => [x.accept_also, x.partial_credit, ...x.marking_points.map(p => p.point)])), d.type_blocks.writing?.model_response, d.type_blocks.project?.sample_product, t.preparation, t.needs_support, t.ready_for_more, ...t.type_notes, ...t.misconceptions.flatMap(x => [x.misconception, x.address])];
  return !html.includes('TEACHER VIEW') && !bag.some(s => s && s.length >= 15 && html.includes(esc(s)));
}
function asgShareModal() {
  const D = asgDoc, link = () => `${location.origin}${location.pathname}#/assignment-generator/s/${D.id}`;
  const draw = () => {
    const p = D.published, un = p && (p.sig !== asgSig());
    $('#modalRoot').innerHTML = `<div class="overlay" id="ov"><div class="modal" role="dialog" aria-modal="true"><h3>Share student version</h3><p class="muted" style="margin:0">Students see only the Student View. Answers and teacher notes are never included.</p>
      ${p ? `<div class="row"><input class="input" readonly value="${link()}"><button class="btn primary" id="cp">${ic('link', 's')} Copy</button></div>
      <div class="asg-ver ${un ? 'dirty' : ''}">${ic(un ? 'alert' : 'tick')}<div style="flex:1"><b>Version ${p.version} is shared</b><div class="muted" style="font-size:13px">${un ? `Your draft is v${D.version}. Students still see v${p.version} until you publish.` : 'Students see your latest version.'}</div></div></div>`
        : `<label class="asg-keep" style="margin:16px 0 4px"><input type="checkbox" id="rev"> I’ve reviewed the Student View</label>`}
      <div style="display:flex;gap:10px;margin-top:16px;justify-content:space-between;flex-wrap:wrap">${p ? '<button class="btn danger" id="revoke">Revoke link</button>' : '<span></span>'}<span style="display:flex;gap:8px"><button class="btn" id="cl">Close</button>${p ? (un ? '<button class="btn primary" id="pub">Publish updated version</button>' : '') : '<button class="btn primary pill-dis" id="mk" disabled>Create link</button>'}</span></div></div></div>`;
    const close = () => $('#modalRoot').innerHTML = ''; $('#cl').onclick = close; $('#ov').onclick = e => { if (e.target.id === 'ov') close(); };
    $('#rev')?.addEventListener('change', e => $('#mk').disabled = !e.target.checked);
    const publish = () => {
      if (!asgStudentClean(asgDocHTML(D.data, 'student', 'plain'), D.data)) return toast('Blocked: the student version contains teacher content.');
      D.changed = false; D.published = { version: D.version, sig: asgSig(), data: JSON.parse(JSON.stringify(D.data)), edits: { ...D.edits } }; asgSaveDoc(); draw(); const s = $('#asgBadge'); if (s) s.textContent = asgBadge();
    };
    $('#mk')?.addEventListener('click', () => { publish(); toast('Link created'); }); $('#pub')?.addEventListener('click', () => { publish(); toast(`Version ${D.published.version} published`); });
    $('#cp')?.addEventListener('click', () => { navigator.clipboard?.writeText(link()); toast('Link copied'); });
    $('#revoke')?.addEventListener('click', () => { D.published = null; asgSaveDoc(); draw(); const s = $('#asgBadge'); if (s) s.textContent = asgBadge(); toast('Link revoked'); });
  };
  draw();
}
/* student link: shows the published version only (V3) */
function asgSharedView(id) {
  const rec = asgStore.get(id);
  if (!rec || !rec.published) return `<div class="page"><div class="card gen">${ic('lock')}<h2 style="margin-top:10px">This assignment isn’t available</h2><p class="muted">The link has been turned off or is invalid.</p></div></div>`;
  const keep = asgDoc; asgDoc = { ...rec, data: rec.published.data, edits: rec.published.edits }; const html = asgDocHTML(asgDoc.data, 'student', 'share'); asgDoc = keep;
  return `<div class="page asg-share view-asg"><div class="asg-out" id="asgOut">${html}</div><div class="no-print" style="text-align:center;margin-top:6px"><button class="btn primary" onclick="window.print()">${ic('print', 's')} Print</button></div></div>`;
}

/* ---------- §10.5 Download: the shared modal opens on the view on screen; Word, PDF or print ---------- */
const asgDownloadModal = () => downloadModal({ view: asgView, file: v => asgFile(asgDoc.data, v), run: asgExport, formats: ['word', 'pdf'] });
function asgExport(view, fmt) {
  const d = asgDoc.data, html = asgDocHTML(d, view, 'plain'), name = asgFile(d, view);
  if (view === 'student' && !asgStudentClean(html, d)) return toast('Export blocked: the student version contains teacher content.'); // V1
  if (fmt === 'word') {
    const css = 'body{font-family:Calibri,Arial;font-size:11pt}h1{font-size:20pt;margin:2pt 0}h2{font-size:13pt;color:#23262F;border-bottom:1px solid #ccc}table{border-collapse:collapse;width:100%}th{background:#23262F;color:#fff;padding:4pt;text-align:left}td{border:1px solid #bbb;padding:4pt}td.lab{background:#F3F4F7}.asg-line{border-bottom:1px solid #999;height:18pt}.asg-checkbox{background:#FFF1F3;padding:6pt}.asg-case,.asg-box{background:#F3F4F7;padding:6pt;margin:4pt 0}.asg-m{color:#555}.asg-dfoot,.asg-tfoot{font-size:9pt;color:#555}.asg-brand,.asg-tag{font-size:9pt;color:#555}';
    const blob = new Blob([`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${esc(name)}</title><style>@page{size:A4;margin:20mm}${css}</style></head><body>${html}</body></html>`], { type: 'application/msword' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name + '.doc'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    return;
  }
  const back = asgView, t0 = document.title; asgView = view; $('#view').innerHTML = asgOutputView(); asgBindOutput(); document.title = name;
  const undo = () => { document.title = t0; asgView = back; $('#view').innerHTML = asgOutputView(); asgBindOutput(); window.removeEventListener('afterprint', undo); };
  window.addEventListener('afterprint', undo); setTimeout(() => window.print(), 80);
}
