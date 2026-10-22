/* Daily lesson planner - OUTPUT: the lesson-plan document in the order of PRD §5.1 (blocks 1-15),
   preview before export, one-stage regeneration (§21), and one-action DOCX + PDF download (§17). */

const dli = a => a.map(x => `<li>${esc(x)}</li>`).join('');
const dlRange = s => `${s.start_minute}–${s.end_minute} min`;
const dlLO = id => String(id).replace(/^LO\s*(\d+)$/, 'Objective $1');   // shown as "Objective 1"; the data keeps LO1
const dlIds = a => a.map(dlLO).join(', ');

const dlpSecId = t => t.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');
const dlpPencil = (id, t) => `<button type="button" class="icon-btn dlp-sedit no-print" data-edit="${id}" title="Edit this section" aria-label="Edit ${esc(t)}" contenteditable="false">${ic('edit', 's')}</button>`;
function dlpDocHTML(p, plain = false) {
  const m = p.metadata, f = p.lesson_flow, hw = p.homework, tools = !plain;
  const hwStatus = hw.included ? (hw.optional ? 'Optional' : 'Included') : 'None';
  const cell = (k, v) => `<div class="mc"><span class="ml">${k}</span><b>${esc(v)}</b></div>`;
  const tbl = (head, rows, cls = '') => `<div class="tw"><table class="dt ${cls}"><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((c, i) => `<td class="${i === 0 ? 'lab' : ''}">${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const S = (t, body, cls = '') => `<section class="dsec ${cls}" data-sec="${dlpSecId(t)}"><h2 class="dh2">${t}${tools && t !== 'Lesson at a glance' ? dlpPencil(dlpSecId(t), t) : ''}</h2>${body}</section>`;   // every section but the derived time bar has its own Edit pencil
  const glance = `<div class="glance"><div class="gbar" role="img" aria-label="Lesson at a glance">${f.map((s, i) => `<div class="gseg sc${i % 7}${i % 2 ? ' alt' : ''}" style="flex:${s.duration_minutes}" title="${esc(s.title)} · ${dlRange(s)}">${s.stage_number}</div>`).join('')}</div><div class="gticks"><span>0 min</span><span>${m.duration_minutes} min</span></div>
    <ul class="gl">${f.map(s => `<li><span>${s.stage_number}. ${esc(s.title)}</span><i class="lead"></i><span>${dlRange(s)}</span></li>`).join('')}</ul></div>`;
  const stage = s => `<div class="stage sc${(s.stage_number - 1) % 7}${s.stage_number % 2 ? '' : ' alt'}" data-stage="${s.stage_number}"><div class="sbar"><span class="snum">${s.stage_number}</span><b>${esc(s.title)}</b><span class="stime">${dlRange(s)}</span></div>
    <div class="srow"><span class="ml ml-n">🎯 Purpose</span>${esc(s.purpose)}</div>
    <div class="scols"><div><span class="ml t">Teacher</span><ul>${dli(s.teacher_actions)}</ul></div><div><span class="ml s">Students</span><ul>${dli(s.student_actions)}</ul></div></div>
    <div class="srow"><span class="ml ml-n">📚 Resources</span>${s.resources.length ? `<span class="rchips">${s.resources.map(x => `<span class="rchip">${esc(x)}</span>`).join('')}</span>` : 'None needed'}</div>
    <div class="srow cfl"><span class="ml ml-n">✅ Check for learning</span>${s.assessment_evidence.map(esc).join('; ')} <em>(${dlIds(s.objective_ids)})</em></div></div>`;
  return `<article class="dlp-doc">
    <header class="dhead dsec"><div class="eyebrow">LESSON PLAN | ${esc((m.subject || '').toUpperCase())} | ${m.grade ? 'GRADE ' + esc(m.grade) + ' | ' : ''}${m.duration_minutes} MIN${m.duration_source === 'ai_suggested' ? ' (SUGGESTED)' : ''}</div><h1>${esc(m.title)}</h1><div class="dchap">${m.chapter ? `Chapter: ${esc(m.chapter)} · ` : ''}${m.stage_count} stages</div>
      <div class="dmeta"><div class="dmrow r2">${cell('Teaching style', m.teaching_style_resolved)}${cell('Pedagogy', m.pedagogy_resolved)}${cell("Bloom's level", m.blooms_level)}${cell('Homework', hwStatus)}</div></div></header>
    ${S('Lesson at a glance', glance)}
    ${S('Learning Objectives', tbl(['S.no', 'Objective', "Bloom's level"], p.learning_objectives.map(o => [esc(dlLO(o.id)),esc(o.text), esc(o.bloom_level)])))}
    <div class="dpair">${S('Key concepts', `<ul class="dul">${dli(p.key_concepts)}</ul>`)}${S('Prerequisites', `<ul class="dul">${dli(p.prerequisites)}</ul>`)}</div>
    ${S('Lesson Flow', f.map(stage).join(''), 'flow')}
    ${S('Teacher Guidance', p.teacher_guidance.map(g => `<div class="guide"><h3>${esc(g.concept)}</h3><p>${esc(g.explanation)}</p><ul class="dul">${dli(g.points)}</ul><div class="callouts"><div class="co"><span class="ml">Real-life example</span>${esc(g.real_life_example)}</div><div class="co a"><span class="ml">Analogy</span>${esc(g.analogy)}</div></div><div class="ask"><span class="ml">Ask questions</span><ul class="dul">${dli(g.questions_to_ask)}</ul></div></div>`).join(''))}
    ${S('Student Activities', tbl(['Activity and type', 'Stage and minutes', 'Instructions', 'Objectives'], p.student_activities.map(a => [`${esc(a.title)}<br><small>${esc(a.type)}</small>`, `Stage ${a.stage_number} · ${a.duration_minutes} min`, esc(a.instructions), esc(dlIds(a.serves_objective_ids))])))}
    ${S('Questions to Ask', `<div class="qgrid">${[['Warm-up', 'warm_up'], ['During the lesson', 'during_lesson'], ['Concept check', 'concept_check'], ['Closure', 'closure']].map(([l, k], i) => `<div class="qbox q${i}"><span class="ml">${l}</span><ul class="dul">${dli(p.questions_to_ask[k])}</ul></div>`).join('')}</div>`)}
    ${S('Common Misconceptions', tbl(['Students may think', 'What to do'], p.common_misconceptions.map(x => [esc(x.misconception), esc(x.intervention)]), 'warm'))}
    ${S('Teaching Resources', tbl(['Resource', 'Used in stage'], p.teaching_resources.map(r => [esc(r.item), r.used_in_stages.join(', ')])))}
    ${S('Assessment', `<ul class="dul">${dli(p.assessment.methods)}</ul>${tbl(['S.no', 'Objective', 'How to check'], p.assessment.objective_checks.map(c => [esc(dlLO(c.objective_id)),esc(c.objective_text), esc(c.how_to_check)]))}`)}
    ${S('Homework', hw.included ? `<div class="hwbox"><div class="hwh"><b>${esc(hw.title)}</b>${hw.optional ? '<span class="tag">Optional</span>' : ''}<span class="tag">${hw.estimated_minutes} min</span></div><p>${esc(hw.instructions)}</p></div>` : '<div class="hwbox"><p>No homework for this lesson</p></div>')}
    ${S('Differentiation', `<div class="dcols">${[['Needs support', 'needs_support'], ['Standard', 'standard'], ['Advanced', 'advanced']].map(([l, k], i) => `<div class="dcl d${i}"><span class="ml">${l}</span><ul class="dul">${dli(p.differentiation[k])}</ul></div>`).join('')}</div>`)}
    ${S('Lesson Closure', `<ul class="dul">${dli(p.lesson_closure.key_takeaways)}</ul><div class="final"><span class="ml">Final check question</span>${esc(p.lesson_closure.final_question)}</div>`)}
  </article>`;
}

function dlpOutputView() {
  const p = dlpPlan, m = p.metadata;
  return `<div class="toolbar"><div class="toolbar-in">
    <button class="icon-btn round" id="dlpBack" aria-label="Change settings">${ic('back')}</button>
    <div class="tb-title"><small>Daily lesson planner</small><b>${m.grade ? 'Grade ' + esc(m.grade) + ' · ' : ''}${esc(m.subject)} · ${esc(m.topic)}</b></div>
    <div class="acts"><button class="btn" id="dlpEdit">${ic('edit', 's')}<span class="lb">Edit</span></button><button class="btn primary" id="dlpDl" aria-haspopup="dialog">${ic('download', 's')}<span class="lb">Download</span></button></div></div></div>
  <div class="dlp-out" id="dlpOut">${p._edited || dlpDocHTML(p)}</div>`;   // _edited = the saved, teacher-edited document (lives on this plan, so a new plan starts clean)
}

/* Editing changes the CONTENT only. The document is never one big editable region: just the text-holding leaves are editable
   (a bullet, a paragraph, a table cell, a title, a chip), each as its own small editor. Labels, headings, stage bars, times, the time bar,
   table headers and ID columns are not editable. Enter, paste of formatting, drag and drop and the structural toolbar buttons are blocked,
   so rows, bullets, tables and sections can be neither added nor removed: the structure stays exactly as generated. */
const DLP_FIXED = '.eyebrow,.ml,.snum,.stime,.sbar,.dh2,.dmeta,.glance,.tag,th';
const DLP_LEAF = 'h1,h3,.dchap,li,p,td,.srow,.final,.co,.hwh b,.rchip';
const DLP_REF = /^(Objective \d+(,\s*Objective \d+)*|Stage \d+ · \d+ min)$/;   // objective ids and stage references are structure, not content
const dlpLeaves = d => $$(DLP_LEAF, d).filter(el => !el.closest(DLP_FIXED) && !el.querySelector(DLP_LEAF) && !(el.tagName === 'TD' && DLP_REF.test(el.textContent.trim())));   // innermost text holders only
/* the saved document keeps every section's pencil in its idle state and carries no editing markers */
const dlpSerialize = el => el.outerHTML.replace(/<button[^>]*data-edit="([^"]+)"[^>]*>[\s\S]*?<\/button>/g, (m, id) => dlpPencil(id, id.replace(/-/g, ' ')))
  .replace(/ contenteditable="(true|false)"/g, '').replace(/ data-et="inline"/g, '').replace(/(class="[^"]*?)\s+(?:sec-)?editing(?=[\s"])/g, '$1');
function dlpBindOutput() {
  $('#view').classList.add('bg-white', 'view-dlp'); $('#view').classList.remove('is-editing');
  const rerender = () => { const y = $('#view').scrollTop; $('#view').innerHTML = dlpOutputView(); dlpBindOutput(); $('#view').scrollTop = y; };
  const doc = () => $('.dlp-doc'), editing = () => !!$('[contenteditable="true"]', doc());   // true while ANY part is open
  /* open or close the editable leaves of one root (the whole document or one section); labels inside an editable leaf (PURPOSE ...) stay fixed */
  const setLeaves = (root, on) => {
    dlpLeaves(root).forEach(el => { if (on) { el.setAttribute('contenteditable', 'true'); el.dataset.et = 'inline'; } else { el.removeAttribute('contenteditable'); delete el.dataset.et; } });
    $$(DLP_FIXED, root).forEach(x => on ? x.setAttribute('contenteditable', 'false') : x.removeAttribute('contenteditable'));
    $$('.dlp-sedit', root).forEach(b => b.setAttribute('contenteditable', 'false'));
  };
  const syncTop = () => window.editUI.top($('#dlpEdit'), editing());
  const commit = () => { if (editing()) dlpPlan._edited = dlpSerialize(doc()); };   // keeps edits when leaving or downloading mid-edit
  /* block everything that would change the structure */
  const out = $('#dlpOut');
  out.addEventListener('keydown', e => { if (editing() && e.key === 'Enter') e.preventDefault(); });
  out.addEventListener('beforeinput', e => { if (editing() && /^(insertParagraph|insertLineBreak|insertFromDrop|insertFromPaste|insertFromYank)$/.test(e.inputType)) e.preventDefault(); });
  out.addEventListener('paste', e => { if (!editing()) return; e.preventDefault(); const t = (e.clipboardData?.getData('text/plain') || '').replace(/\s+/g, ' '); if (t) document.execCommand('insertText', false, t); });   // plain text only
  ['drop', 'dragstart'].forEach(ev => out.addEventListener(ev, e => { if (editing()) e.preventDefault(); }));
  /* top button and section buttons stay in sync: the top one reads Save while ANY part is open */
  $('#dlpEdit').onclick = () => { // Edit -> Save: every section opens (section pencils hide); Save keeps the edited document for the preview, Word and PDF
    if (editing()) { commit(); rerender(); toast('Changes saved'); return; }
    setLeaves(doc(), true); doc().classList.add('editing'); $('#view').classList.add('is-editing'); syncTop(); dlpLeaves(doc())[0]?.focus();
  };
  $$('[data-edit]').forEach(b => b.onclick = () => { // pencil -> "save Save" for that section only
    const sec = b.closest('.dsec'), on = !b.classList.contains('on');
    setLeaves(sec, on); sec.classList.toggle('sec-editing', on); window.editUI.sec(b, on); b.setAttribute('contenteditable', 'false');
    if (on) { dlpLeaves(sec)[0]?.focus(); syncTop(); return; }
    dlpPlan._edited = dlpSerialize(doc());                          // closing a section keeps its edits
    if (!editing()) { rerender(); toast('Changes saved'); } else syncTop();
  });
  $('#dlpBack').onclick = () => { commit(); navigate('#/daily-lesson-planner'); };
  /* PRD §3/§17: Word (editable master) and PDF come from the same lesson data. One document, so no View row. */
  $('#dlpDl').onclick = () => { if (editing()) { commit(); rerender(); } downloadModal({ views: false, file: () => dlpFileName(dlpPlan), formats: ['word', 'pdf'], run: (v, fmt) => dlpDownload(fmt) }); };
}

/* §17: both files from the same lesson data in one action; file name Grade-Subject-Lesson-Title */
const dlpFileName = p => `${p.metadata.grade ? 'Grade-' + p.metadata.grade + '-' : ''}${p.metadata.subject}-${p.metadata.title}`.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90);
function dlpDownload(fmt = 'both') { // fmt: 'word' | 'pdf' | 'both' (both = the PRD's one-action default)
  const p = dlpPlan, name = dlpFileName(p), html = p._edited ? p._edited.replace(/<button[\s\S]*?<\/button>/g, '') : dlpDocHTML(p, true), results = [], wantWord = fmt !== 'pdf', wantPdf = fmt !== 'word';
  if (wantWord) try {
    const css = 'body{font-family:Arial;font-size:10pt;color:#1F2A37}h1{font-size:20pt;color:#1F3A5F}h2{font-size:13pt;color:#2A7F7A}table{border-collapse:collapse;width:100%}th{background:#1F3A5F;color:#fff;text-align:left;padding:4pt}td{border:1px solid #CBD5DF;padding:4pt;vertical-align:top}td.lab{background:#EAF1F6}.sbar{background:#1F3A5F;color:#fff;padding:4pt}.warm th{background:#B9771A}.hwbox,.final{background:#FDF3E7;border:1px solid #E8A33D;padding:6pt}.ml{font-size:7.5pt;text-transform:uppercase;color:#5B6470;display:block}.ml-n{text-transform:none;font-size:9.5pt}';
    const blob = new Blob([`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${esc(name)}</title><style>@page{size:A4;margin:19mm}${css}</style></head><body>${html}<p style="font-size:8pt;color:#5B6470">${esc(p.metadata.title)} | ${esc((p.metadata.grade ? 'Grade ' + p.metadata.grade + ' ' : '') + p.metadata.subject)}</p></body></html>`], { type: 'application/msword' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name + '.doc'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); results.push('Word');
  } catch (e) { console.error(e); }
  if (wantPdf) {
    const foot = `${p.metadata.title} | ${(p.metadata.grade ? 'Grade ' + p.metadata.grade + ' ' : '') + p.metadata.subject}`.replace(/["\\]/g, '');
    let st = $('#dlpFootStyle'); if (!st) { st = document.createElement('style'); st.id = 'dlpFootStyle'; document.head.appendChild(st); }
    st.textContent = `@media print{@page{@bottom-left{content:"${foot}";font:8pt Arial;color:#5B6470}@bottom-right{content:"Page " counter(page) " of " counter(pages);font:8pt Arial;color:#5B6470}}}`;
    const t0 = document.title; document.title = name; setTimeout(() => { try { window.print(); } finally { document.title = t0; } }, wantWord ? 400 : 60);
  }
  if (wantWord && !results.length) toast('Word file could not be created. Try again.'); // §17: only report files that exist
}
