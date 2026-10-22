/* Chapter lesson planner - OUTPUT: the chapter plan document in PRD §10 order
   (overview page · each period A-J · Assess period · chapter summary), a term index for several chapters,
   one-action Word + PDF download (zip for several chapters) and "Expand to daily plan" per period (§10.8). */

const cli = a => (a || []).map(x => `<li>${esc(x)}</li>`).join('');
const clpTbl = (head, rows, cls = '') => `<div class="tw"><table class="dt ${cls}"><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((c, i) => `<td class="${i === 0 && !cls.includes('nolab') ? 'lab' : ''}">${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const clpRange = s => `${s.start_minute}–${s.end_minute} min`;
const clpGradeSubject = M => (M.grade ? 'Grade ' + M.grade + ' ' : '') + (M.subject || '');
const clpChapterTitle = M => (M.chapter_number != null ? `Chapter ${M.chapter_number}: ` : '') + M.chapter_title;

/* Chapter overview (page 1, §10.2) */
function clpOverviewHTML(plan) {
  const M = plan.metadata, cell = (k, v) => `<div class="mc"><span class="ml">${k}</span><b>${esc(v)}</b></div>`, hw = { optional: 'Optional, selected periods', none: 'None', every: 'After every period' }[M.homework_policy];
  const styleTxt = M.style_mode === 'varies' ? 'Varies by period' : plan.period_map[0]?.teaching_style, pedTxt = M.pedagogy_mode === 'varies' ? 'Varies by period' : plan.period_map[0]?.pedagogy;
  return `<section class="clp-page clp-ov"><header class="dhead"><div class="eyebrow">CHAPTER LESSON PLAN | ${esc((M.subject || '').toUpperCase())} | ${M.grade ? 'GRADE ' + esc(M.grade) : ''}</div><h1>${esc(clpChapterTitle(M))}</h1>${M.book ? `<div class="dchap">${esc(M.book)}</div>` : ''}
    <div class="dmeta"><div class="dmrow">${cell('Grade', M.grade || '–')}${cell('Subject', M.subject || '–')}${cell('Periods', `${M.period_count} × ${M.period_minutes} min`)}${cell('Total time', `${(M.period_count * M.period_minutes / 60).toFixed(1).replace(/\.0$/, '')} hours`)}</div>
      <div class="dmrow r2">${cell('Teaching style', styleTxt)}${cell('Pedagogy', pedTxt)}${cell('Bloom’s range', M.blooms_range)}${cell('Homework', hw)}</div></div></header>
    ${plan.generation_notes.warnings.length ? `<div class="clp-note no-print">${ic('alert', 's')}<div>${plan.generation_notes.warnings.map(esc).join('<br>')}</div></div>` : ''}
    <h2 class="dh2">Chapter objectives</h2>${clpTbl(['ID', 'Objective', 'Bloom’s level'], plan.chapter_objectives.map(o => [esc(o.id), esc(o.text), esc(o.bloom_level)]))}
    <div class="dpair"><div><h2 class="dh2">Prerequisites</h2><ul class="dul">${cli(plan.prerequisites)}</ul></div><div><h2 class="dh2">Key concepts</h2><ul class="dul">${cli(plan.key_concepts)}</ul></div></div>
    <h2 class="dh2">Period map</h2>${clpTbl(['Period', 'Type and style', 'Title and topics', 'Objectives', 'Main activity', 'Checkpoint'], plan.period_map.map(r => [r.period, `<b>${esc(clpTypeName(r.type))}</b><br><small>${esc(r.teaching_style)}</small>`, `<b>${esc(r.title)}</b><br><small>${esc(r.topics.join('; '))}</small>`, esc(r.objective_ids.join(', ')), esc(r.main_activity), esc(r.checkpoint)]), 'clp-map')}</section>`;
}

/* One stage block: time and title, purpose, Teacher and Students side by side, Ask, Check (§10.3 D) */
const clpStageHTML = (s, k) => `<div class="stage sc${k % 7}${k % 2 ? ' alt' : ''}"><div class="sbar"><span class="snum">${k + 1}</span><b>${esc(s.title)}</b><span class="stime">${clpRange(s)}</span></div>
  <div class="srow"><span class="ml">Purpose</span>${esc(s.purpose)}</div>
  <div class="scols"><div><span class="ml t">Teacher</span><ul>${cli(s.teacher)}</ul></div><div><span class="ml s">Students</span><ul>${cli(s.students)}</ul></div></div>
  ${s.questions.length ? `<div class="srow ask"><span class="ml">Ask</span><ul class="dul">${s.questions.map(q => `<li>“${esc(q)}”</li>`).join('')}</ul></div>` : ''}
  <div class="srow cfl"><span class="ml">Check</span>${esc(s.check)}</div></div>`;
const clpTimeBar = (p, len) => `<div class="glance"><div class="gbar" role="img" aria-label="Time bar">${p.stages.map((s, i) => `<div class="gseg sc${i % 7}${i % 2 ? ' alt' : ''}" style="flex:${s.end_minute - s.start_minute}" title="${esc(s.title)} · ${clpRange(s)}">${i + 1}</div>`).join('')}</div><div class="gticks"><span>0 min</span><span>${len} min</span></div></div>`;
const clpHead = (p, plan, row, tools) => `<div class="clp-pbar"><div><span class="clp-pk">Period ${p.period} of ${plan.periods.length} · ${esc(clpTypeName(p.type))} · ${plan.metadata.period_minutes} min</span><h2>${esc(p.title)}</h2><span class="clp-ps">${esc(row.teaching_style)} · ${esc(row.pedagogy)}</span></div>${tools ? `<button class="btn no-print" data-expand="${p.period}" title="Open this period as a full Daily lesson plan">${ic('open', 's')}<span class="lb">Expand to daily plan</span></button>` : ''}</div>`;
const clpGlance = p => `<h3 class="dh3">At a glance</h3><div class="clp-gl"><div><span class="ml">Aim</span><p>${esc(p.aim)}</p><span class="ml">Objectives</span><ul class="dul">${p.objectives.map(o => `<li><b>${esc(o.id)}</b> ${esc(o.text)}</li>`).join('')}</ul>${p.recap ? `<span class="ml">Recap of the previous period</span><p>${esc(p.recap)}</p>` : ''}</div>
  <div>${p.key_vocabulary.length ? `<span class="ml">Key words</span><ul class="dul">${p.key_vocabulary.map(v => `<li><b>${esc(v.term)}</b>: ${esc(v.meaning)}</li>`).join('')}</ul>` : ''}<span class="ml">Materials</span><span class="rchips">${p.materials.map(x => `<span class="rchip">${esc(x)}</span>`).join('')}</span><span class="ml" style="margin-top:10px">Before class</span><ul class="dul">${cli(p.preparation)}</ul></div></div>`;

/* Teaching period (§10.3 blocks A-J) */
function clpPeriodHTML(p, plan, tools) {
  const row = plan.period_map[p.period - 1], len = plan.metadata.period_minutes, a = p.activity, nx = plan.periods[p.period];
  if (p.type === 'assess') return clpAssessHTML(p, plan, row, tools);
  return `<section class="clp-page clp-period" id="clp-p${p.period}">${clpHead(p, plan, row, tools)}${clpGlance(p)}${clpTimeBar(p, len)}
    <h3 class="dh3">Lesson flow</h3>${p.stages.map(clpStageHTML).join('')}
    <h3 class="dh3">Teacher notes</h3><div class="clp-tn"><p>${esc(p.teacher_notes.explanation)}</p><div class="dpair"><div><span class="ml">Teaching points</span><ul class="dul">${cli(p.teacher_notes.points)}</ul></div><div><span class="ml">Board plan</span><ul class="dul">${cli(p.teacher_notes.board_plan)}</ul></div></div></div>
    <h3 class="dh3">Student activity</h3><div class="clp-act"><div class="clp-acth"><b>${esc(a.title)}</b><span class="tag">${esc(a.type)}</span><span class="tag">${a.duration_minutes} min</span></div><p>${esc(a.instructions)}</p><ol class="clp-items">${cli(a.items)}</ol></div>
    <div class="clp-key"><span class="ml">Answer key</span><ol>${cli(a.answer_key)}</ol></div>
    <h3 class="dh3">Watch out for</h3>${clpTbl(['Students may think', 'What to do'], p.misconceptions.map(m => [esc(m.misconception), esc(m.intervention)]), 'warm')}
    <h3 class="dh3">Differentiation</h3><div class="dcols2"><div class="dcl d0"><span class="ml">Needs support</span><ul class="dul">${cli(p.differentiation.needs_support)}</ul></div><div class="dcl d2"><span class="ml">Ready for more</span><ul class="dul">${cli(p.differentiation.advanced)}</ul></div></div>
    <h3 class="dh3">Exit ticket</h3>${clpTbl(['Question', 'Expected answer'], p.exit_ticket.map(e => [esc(e.question), esc(e.answer)]), 'nolab')}
    <h3 class="dh3">Homework and next period</h3><div class="hwbox"><p><b>Homework:</b> ${p.homework ? `${p.homework.optional ? '<span class="tag">Optional</span> ' : ''}${esc(p.homework.text)}` : 'None'}</p>${p.bridge ? `<p><b>Next:</b> ${esc(p.bridge.replace(/^Next period: /, ''))}</p>` : ''}</div></section>`;
}

/* Assess period (§10.4): running the period, test paper, answer key, rubric, follow-up, test conditions, student copy */
function clpAssessHTML(p, plan, row, tools) {
  const A = p.assessment, M = plan.metadata, len = M.period_minutes; let n = 0;
  const paper = A.sections.map(s => `<div class="clp-sec"><div class="clp-secl"><b>${esc(s.title)}</b><span>${s.marks} marks</span></div>${s.questions.map(q => `<div class="clp-q"><span class="clp-qn">${++n}.</span><span>${esc(q.q)}</span><span class="clp-qm">[${q.marks}]</span></div>`).join('')}</div>`).join('');
  const copy = (() => { let k = 0; return A.sections.map(s => `<div class="clp-sec"><div class="clp-secl"><b>${esc(s.title)}</b><span>${s.marks} marks</span></div>${s.questions.map(q => `<div class="clp-q"><span class="clp-qn">${++k}.</span><span>${esc(q.q)}</span><span class="clp-qm">[${q.marks}]</span></div>${'<div class="aline"></div>'.repeat(q.lines)}`).join('')}</div>`).join(''); })();
  return `<section class="clp-page clp-period clp-assess" id="clp-p${p.period}">${clpHead(p, plan, row, tools)}${clpGlance(p)}${clpTimeBar(p, len)}
    <h3 class="dh3">Running the period</h3>${p.stages.map(clpStageHTML).join('')}
    <h3 class="dh3">Test paper (teacher copy)</h3><p class="muted">${esc(A.instructions)}</p>${paper}<div class="clp-total">Total: ${A.total_marks} marks · ${A.duration_minutes} minutes</div>
    <h3 class="dh3">Answer key and marking guide</h3><div class="clp-key"><ol>${cli(A.answer_key)}</ol></div>
    <h3 class="dh3">Rubric for open answers</h3>${clpTbl(['Criterion', 'Level 1 (1)', 'Level 2 (2)', 'Level 3 (3)', 'Level 4 (4)'], A.rubric.map(r => [esc(r.criterion), ...r.levels.map(esc)]))}
    <h3 class="dh3">Follow-up plan</h3>${clpTbl(['If results show…', 'Then plan…'], A.follow_up.map(f => [esc(f.if), esc(f.then)]), 'warm')}
    <h3 class="dh3">Differentiation for test conditions</h3><div class="dcols2"><div class="dcl d0"><span class="ml">Test conditions</span><ul class="dul">${cli(A.test_conditions)}</ul></div><div class="dcl d2"><span class="ml">Needs support</span><ul class="dul">${cli(p.differentiation.needs_support)}</ul></div></div>
    <div class="clp-copy"><div class="clp-copyh"><b>${esc(clpChapterTitle(M))}</b><span>Student copy</span></div><div class="clp-fields"><span>Name: ____________________</span><span>Class: ________</span><span>Date: ________</span><span>Time: ${A.duration_minutes} min</span><span>Marks: ____ / ${A.total_marks}</span></div><p>${esc(A.instructions)}</p>${copy}</div></section>`;
}

/* Chapter summary (last page, §10.5) */
function clpSummaryHTML(plan) {
  const ps = plan.periods.map(p => p.period);
  return `<section class="clp-page clp-sumpg"><h2 class="dh2">Chapter summary</h2><h3 class="dh3">Assessment plan</h3>
    ${clpTbl(['Objective', ...ps.map(n => 'P' + n)], plan.toolkit.assessment_plan.map(a => [`<b>${esc(a.objective_id)}</b> ${esc(plan.chapter_objectives.find(o => o.id === a.objective_id).text)}`, ...ps.map(n => a.checked_in_periods.includes(n) ? '✓' : '')]), 'clp-grid')}
    <h3 class="dh3">Teaching resources</h3>${clpTbl(['Resource', 'Periods'], plan.toolkit.resources.map(r => [esc(r.item), r.periods.join(', ')]))}</section>`;
}
const clpDocHTML = (plan, tools = true) => `<article class="clp-doc" data-ch="${esc(plan.metadata.chapter_title)}">${clpOverviewHTML(plan)}${plan.periods.map(p => clpPeriodHTML(p, plan, tools)).join('')}${clpSummaryHTML(plan)}</article>`;

/* Term index for several chapters (§10.7) */
function clpTermHTML(plans) {
  const hrs = plans.reduce((a, p) => a + p.metadata.period_count * p.metadata.period_minutes / 60, 0), tot = plans.reduce((a, p) => a + p.metadata.period_count, 0), M = plans[0].metadata;
  return `<article class="clp-doc"><section class="clp-page"><header class="dhead"><div class="eyebrow">TERM INDEX | ${esc((M.subject || '').toUpperCase())} | ${M.grade ? 'GRADE ' + esc(M.grade) : ''}</div><h1>Term index</h1><div class="dchap">${plans.length} chapters · ${tot} periods · ${hrs.toFixed(1).replace(/\.0$/, '')} teaching hours</div></header>
    ${clpTbl(['Chapter', 'Periods', 'Period types', 'Teaching hours', 'Warnings'], plans.map(p => { const c = {}; p.periods.forEach(x => c[x.type] = (c[x.type] || 0) + 1); return [esc(clpChapterTitle(p.metadata)), p.metadata.period_count, Object.entries(c).map(([k, v]) => `${v} ${clpTypeName(k)}`).join(', '), (p.metadata.period_count * p.metadata.period_minutes / 60).toFixed(1).replace(/\.0$/, ''), p.generation_notes.warnings.length ? esc(p.generation_notes.warnings.join(' ')) : '–']; }))}</section></article>`;
}

function clpOutputView() {
  const many = clpPlans.length > 1, onIndex = many && clpTab === clpPlans.length, plan = clpPlans[Math.min(clpTab, clpPlans.length - 1)], M = plan.metadata;
  return `<div class="toolbar"><div class="toolbar-in">
    <button class="icon-btn round" id="clpBack" aria-label="Back to the period map">${ic('back')}</button>
    <div class="tb-title"><small>Chapter lesson planner</small><b>${esc(clpGradeSubject(M))}${many ? ` · ${clpPlans.length} chapters` : ` · ${esc(clpChapterTitle(M))}`}</b></div>
    <div class="acts"><button class="btn primary" id="clpDl">${ic('download', 's')}<span class="lb">Download</span></button></div></div></div>
  <div class="clp-out" id="clpOut">${many ? `<div class="clp-tabs no-print" role="tablist">${clpPlans.map((p, k) => `<button class="${k === clpTab ? 'on' : ''}" data-ptab="${k}" role="tab">${p.metadata.chapter_number != null ? 'Ch ' + p.metadata.chapter_number + ' · ' : ''}${esc(p.metadata.chapter_title)}</button>`).join('')}<button class="${onIndex ? 'on' : ''}" data-ptab="${clpPlans.length}" role="tab">Term index</button></div>` : ''}
    ${onIndex ? clpTermHTML(clpPlans) : clpDocHTML(plan)}</div>`;
}
function clpBindOutput() {
  $('#view').classList.add('bg-white', 'view-clp');
  const rerender = () => { const y = $('#view').scrollTop; $('#view').innerHTML = clpOutputView(); clpBindOutput(); $('#view').scrollTop = y; };
  $('#clpBack').onclick = () => navigate(clpMaps.length ? '#/chapter-lesson-planner/map' : '#/chapter-lesson-planner');
  $$('[data-ptab]').forEach(b => b.onclick = () => { clpTab = +b.dataset.ptab; rerender(); $('#view').scrollTo(0, 0); });
  $$('[data-expand]').forEach(b => b.onclick = () => clpExpand(clpPlans[Math.min(clpTab, clpPlans.length - 1)], +b.dataset.expand));
  $('#clpDl').onclick = clpDownload;
}

/* §10.8 Expand: the Daily lesson planner gets the period's topics, objectives, type, length, style, pedagogy and a context note.
   The result is a separate document; the chapter plan is not changed. */
function clpExpand(plan, n) {
  const M = plan.metadata, p = plan.periods[n - 1], row = plan.period_map[n - 1], id = 'clp-' + hashStr(M.chapter_title + M.grade + M.subject);
  let b = DLP_CATALOGUE.find(x => x.id === id);
  if (!b) { b = { id, grade: +M.grade || 1, subject: M.subject || 'General', chapters: [{ title: M.chapter_title, topics: [] }] }; DLP_CATALOGUE.push(b); }
  row.topics.forEach(t => { if (!b.chapters[0].topics.includes(t)) b.chapters[0].topics.push(t); });
  const keys = dlpTopics().filter(t => t.key.startsWith(id + '|') && row.topics.includes(t.title)).map(t => t.key);
  dlpForm = { ...dlpDefaults(), grade: M.grade ? String(+M.grade || 1) : '', topics: keys, duration: M.period_minutes, style: DLP_STYLES.includes(row.teaching_style) ? row.teaching_style : 'AI Recommended', pedagogy: DLP_PEDS.includes(row.pedagogy) ? row.pedagogy : 'AI Recommended',
    objectives: p.objectives.map(o => o.text).join('\n'), details: `From ${clpChapterTitle(M)}, period ${p.period} of ${plan.periods.length} (${clpTypeName(p.type)}): ${p.title}.${p.recap ? ' Recap: ' + p.recap : ''}${p.bridge ? ' ' + p.bridge : ''}` };
  navigate('#/daily-lesson-planner/generating');
}

/* ---------- §10.7 / §3 Download: Word and PDF from the same JSON in one action; several chapters -> zip + term index ---------- */
const clpSlug = s => String(s).replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
const clpFile = M => `${M.grade ? 'Grade-' + M.grade + '-' : ''}${clpSlug(M.subject || 'Subject')}-${M.chapter_number != null ? 'Ch' + String(M.chapter_number).padStart(2, '0') + '-' : ''}${clpSlug(M.chapter_title)}`;
const CLP_WORD_CSS = 'body{font-family:Arial;font-size:10pt;color:#1F2A37}h1{font-size:20pt;color:#1F3A5F}h2{font-size:13pt;color:#1F3A5F}h3{font-size:11pt;color:#2A7F7A;border-bottom:1.5px solid #2A7F7A}table{border-collapse:collapse;width:100%}th{background:#1F3A5F;color:#fff;text-align:left;padding:4pt}td{border:1px solid #CBD5DF;padding:4pt;vertical-align:top}td.lab{background:#EAF1F6}.clp-period,.clp-copy{page-break-before:always}.sbar{background:#1F3A5F;color:#fff;padding:4pt}.ml{font-size:7.5pt;text-transform:uppercase;color:#5B6470;display:block}.clp-act{border:1.5px dashed #2A7F7A;padding:6pt}.clp-key,.hwbox{background:#FDF3E7;padding:6pt}.aline{border-bottom:1px solid #999;height:20pt}.no-print{display:none}';
const clpWordHTML = (html, M) => `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${esc(M.chapter_title)}</title><style>@page{size:A4;margin:19mm}${CLP_WORD_CSS}</style></head><body>${html}<p style="font-size:8pt;color:#5B6470">${esc(M.chapter_title)} | ${esc(clpGradeSubject(M))}</p></body></html>`;
function clpSave(name, blob) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
/* store-only zip (no compression), enough for a handful of Word files */
function clpZip(files) {
  const enc = new TextEncoder(), crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = d => { let c = ~0; for (const b of d) c = crcT[(c ^ b) & 255] ^ (c >>> 8); return ~c >>> 0; };
  const d = new Date(), time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1), date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  const parts = [], central = []; let off = 0;
  files.forEach(([name, text]) => {
    const n = enc.encode(name), data = enc.encode(text), c = crc(data), h = new DataView(new ArrayBuffer(30));
    [[0, 0x04034b50, 4], [4, 20, 2], [6, 0x0800, 2], [8, 0, 2], [10, time, 2], [12, date, 2], [14, c, 4], [18, data.length, 4], [22, data.length, 4], [26, n.length, 2], [28, 0, 2]].forEach(([o, v, s]) => s === 4 ? h.setUint32(o, v, true) : h.setUint16(o, v, true));
    parts.push(h.buffer, n, data);
    const e = new DataView(new ArrayBuffer(46));
    [[0, 0x02014b50, 4], [4, 20, 2], [6, 20, 2], [8, 0x0800, 2], [10, 0, 2], [12, time, 2], [14, date, 2], [16, c, 4], [20, data.length, 4], [24, data.length, 4], [28, n.length, 2], [30, 0, 2], [32, 0, 2], [34, 0, 2], [36, 0, 2], [38, 0, 4], [42, off, 4]].forEach(([o, v, s]) => s === 4 ? e.setUint32(o, v, true) : e.setUint16(o, v, true));
    central.push(e.buffer, n); off += 30 + n.length + data.length;
  });
  const size = central.reduce((a, b) => a + (b.byteLength ?? b.length), 0), end = new DataView(new ArrayBuffer(22));
  [[0, 0x06054b50, 4], [4, 0, 2], [6, 0, 2], [8, files.length, 2], [10, files.length, 2], [12, size, 4], [16, off, 4], [20, 0, 2]].forEach(([o, v, s]) => s === 4 ? end.setUint32(o, v, true) : end.setUint16(o, v, true));
  return new Blob([...parts, ...central, end.buffer], { type: 'application/zip' });
}
function clpDownload() {
  const plans = clpPlans, many = plans.length > 1, M = plans[0].metadata, done = [];
  try {
    if (many) {
      const day = new Date().toISOString().slice(0, 10), name = `${M.grade ? 'Grade-' + M.grade + '-' : ''}${clpSlug(M.subject || 'Subject')}-Chapter-Plans-${day}`;
      clpSave(name + '.zip', clpZip([...plans.map(p => [clpFile(p.metadata) + '.doc', clpWordHTML(clpDocHTML(p, false), p.metadata)]), ['Term-index.doc', clpWordHTML(clpTermHTML(plans), M)]])); done.push('Word');
    } else { clpSave(clpFile(M) + '.doc', new Blob([clpWordHTML(clpDocHTML(plans[0], false), M)], { type: 'application/msword' })); done.push('Word'); }
  } catch (e) { console.error(e); }
  if (!done.length) toast('Word files could not be created. Try again.'); // only report files that exist
  // PDF: the print dialog shows every chapter (and the term index) so one PDF holds the whole plan
  const out = $('#clpOut'), keep = out.innerHTML, name = many ? `${clpSlug(M.subject || 'Subject')}-Chapter-Plans` : clpFile(M), t0 = document.title;
  out.innerHTML = (many ? clpTermHTML(plans) : '') + plans.map(p => clpDocHTML(p, false)).join('');
  const foot = `${many ? 'Chapter plans' : M.chapter_title} | ${clpGradeSubject(M)}`.replace(/["\\]/g, '');
  let st = $('#clpFootStyle'); if (!st) { st = document.createElement('style'); st.id = 'clpFootStyle'; document.head.appendChild(st); }
  st.textContent = `@media print{@page{@bottom-left{content:"${foot}";font:8pt Arial;color:#5B6470}@bottom-right{content:"Page " counter(page) " of " counter(pages);font:8pt Arial;color:#5B6470}}}`;
  const undo = () => { document.title = t0; out.innerHTML = keep; clpBindOutput(); window.removeEventListener('afterprint', undo); };
  window.addEventListener('afterprint', undo); document.title = name; setTimeout(() => window.print(), 300);
}
