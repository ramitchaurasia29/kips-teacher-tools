/* Chapter lesson planner - INPUT (PRD §5 setup on the shared input panel), then the period map review (§9) and generation progress (§4.1 step 4) */

const clpHasContent = c => c.topics.some(t => t.trim()) || c.objectives.trim() || c.reference.trim() || c.fileName;
const clpIssue = f => !f.chapters.length ? 'Select at least one chapter.' : f.chapters.some(clpHasContent) ? '' : 'Add at least one chapter with topics, objectives or reference text.';
const CLP_PERIODS = [['ai', 'AI Recommended'], ...Array.from({ length: 11 }, (_, i) => [i + 2, String(i + 2)])];
const CLP_CH_PERIODS = [['shared', 'As shared setting'], ['ai', 'AI Recommended'], ...Array.from({ length: 11 }, (_, i) => [String(i + 2), String(i + 2)])];

/* one card per chapter line: topics, optional objectives, reference text, per-chapter period override */
function clpCardsHTML(f) {
  if (!f.chapters.length) return '<div class="ilist empty">Chapters you select above appear here as cards.</div>';
  return f.chapters.map((c, ci) => `<div class="clp-card" data-ci="${ci}">
    <div class="clp-ch"><span class="clp-chn">${c.num ?? ci + 1}</span><b>${esc(c.title)}</b>${clpHasContent(c) ? '' : `<span class="clp-need">${ic('info', 'xs')} Needs topics, objectives or reference text</span>`}</div>
    ${ifield('Topics', `<div class="clp-topics">${c.topics.map((t, ti) => `<div class="clp-trow"><input class="input" data-topic="${ci}:${ti}" value="${esc(t)}" placeholder="Topic name" aria-label="Topic ${ti + 1}"><button type="button" class="icon-btn" data-rmtopic="${ci}:${ti}" aria-label="Remove topic">${ic('x', 's')}</button></div>`).join('')}<button type="button" class="btn clp-add" data-addtopic="${ci}">${ic('plus', 's')} Add topic</button></div>`, { opt: 1, hint: c.topics.length ? 'Topics are in book order.' : 'Type the topics of this chapter, or add reference text below.' })}
    <div class="irow2">${ifield('Learning Objectives', `<textarea class="input" data-obj="${ci}" placeholder="One per line. Leave blank and measurable objectives are written for you">${esc(c.objectives)}</textarea>`, { opt: 1 })}
      ${ifield('Reference Text', `<textarea class="input" data-ref="${ci}" placeholder="Paste text from the chapter. Used as the primary source for facts">${esc(c.reference)}</textarea><label class="clp-file">${ic('upload', 's')}<span>${c.fileName ? esc(c.fileName) : 'Or upload a file'}</span><input type="file" data-cfile="${ci}" accept=".pdf,.doc,.docx,.txt"></label>`, { opt: 1 })}</div>
    ${ifield('Number of Periods for this Chapter', iselect('', CLP_CH_PERIODS, c.periods).replace('id="" ', `data-cper="${ci}" `), { opt: 1 })}</div>`).join('');
}

/* a labelled on/off switch (PRD §5: Revision and Assessment are toggles) */
const clpSwitch = (id, label, hint, on) => `<label class="clp-sw ${on ? 'on' : ''}" for="${id}"><span class="clp-swt"><b>${label}</b><small>${hint}</small></span><input type="checkbox" role="switch" id="${id}" ${on ? 'checked' : ''}><i aria-hidden="true"></i></label>`;
function clpFormView() {
  const f = clpForm, varies = k => f[k] === 'varies', customMin = f.minCustom || !CLP_MINUTES.includes(+f.minutes);
  const cat = agChapters(f.grade, f.subject);
  const body = [
    ibook(`Class ${f.grade} ${f.subject}`, `${f.subject} · KIPS`) + ilocked('Grade', 'Grade ' + f.grade),
    `<div class="irow2">${ifield('Period Length', iselect('minutes', [...CLP_MINUTES.map(m => [m, m + ' minutes']), ['custom', 'Custom']], customMin ? 'custom' : f.minutes), { for: 'minutes', hint: 'Same for every period of a chapter.' })}
      ${ifield('Number of Periods', iselect('periods', CLP_PERIODS, f.periods), { for: 'periods', hint: f.periods === 'ai' ? 'The period map shows the reason for the number chosen.' : 'Shared by every chapter unless a chapter sets its own.' })}</div>`,
    customMin ? ifield('Custom Minutes', `<input id="customMin" class="input" type="number" min="10" max="120" value="${f.minutes}" placeholder="Minutes per period">`, { for: 'customMin' }) : '',
    `<div class="irow2">${ifield('Teaching Style Mode', iselect('styleMode', [['single', 'One for the chapter'], ['varies', 'AI varies by period']], f.styleMode), { for: 'styleMode' })}
      ${ifield('Teaching Style', iselect('style', DLP_STYLES, f.style, null, varies('styleMode') ? 'disabled' : ''), { for: 'style' })}</div>`,
    `<div class="irow2">${ifield('Pedagogy Mode', iselect('pedMode', [['single', 'One for the chapter'], ['varies', 'AI varies by period']], f.pedMode), { for: 'pedMode' })}
      ${ifield('Pedagogy Approach', iselect('pedagogy', DLP_PEDS, f.pedagogy, null, varies('pedMode') ? 'disabled' : ''), { for: 'pedagogy' })}</div>`,
    `<div class="irow2">${clpSwitch('revision', 'Revision period', 'On by default when the chapter has 5 or more periods. It comes just before the assessment.', f.revision !== 'off')}
      ${clpSwitch('assessment', 'Assessment period', 'Off by default. When on, the last period is a full test with an answer key.', f.assessment)}</div>`,
    ifield('Homework', iselect('homework', CLP_HOMEWORK, f.homework), { for: 'homework' }),
    idrField('Bloom’s Range', { id: 'clpBloom', multi: true, placeholder: 'Select Bloom’s levels', search: false, options: DLP_BLOOMS.map(b => ({ value: b, label: b })), selected: f.blooms, onChange: ids => { f.blooms = ids; } }, { opt: 1, hint: 'None chosen: lower to higher order across the chapter.' }),
    ifield('Additional Details', `<textarea id="details" class="input" placeholder="Class size, resources, language level and other constraints">${esc(f.details)}</textarea>`, { opt: 1, for: 'details' }),
    idrField('Chapters', { id: 'clpCh', multi: true, placeholder: 'Select chapters', searchPlaceholder: 'Search chapters', allLabel: 'Select all chapters', options: cat.map(c => ({ value: c.id, label: c.title })), selected: f.chapters.map(c => c.key),
      onChange: ids => { f.chapters = cat.filter(c => ids.includes(c.id)).map((c, i) => f.chapters.find(x => x.key === c.id) || { ...clpChapterCard({ key: c.id, num: cat.indexOf(c) + 1, title: c.title }), topics: c.topics.map(t => t.title) }); clpRedraw(); } }, { req: 1, hint: 'Each chapter becomes a card below, with its topics.' }),
    `<div id="clpCards" class="clp-cards">${clpCardsHTML(f)}</div>`,
  ].join('');
  return ipanel({ formId: 'clpFormEl', title: 'Chapter lesson planner', body, issue: clpIssue(f), genId: 'clpGen', genLabel: 'Create period map', wide: true, tool: 'chapter-lesson-planner' });
}

/* book picker: every grade × subject a chapter plan can be made for */
const clpBooks = () => CLP_GRADES.flatMap(g => (g <= 5 ? ['English', 'Mathematics', 'EVS', 'Hindi'] : ['English', 'Mathematics', 'Science', 'Social Science', 'Hindi']).map(s => ({ id: `${g}|${s}`, grade: g, subject: s, title: `Class ${g} ${s}`, board: 'KIPS' })));
function clpPickBook(b) { if (clpForm.grade === String(b.grade) && clpForm.subject === b.subject) return; Object.assign(clpForm, { grade: String(b.grade), subject: b.subject, chapters: [] }); }

function clpRedraw() { ipRedraw(clpFormView(), clpBindForm); }
function clpBindForm() {
  const f = clpForm, refresh = () => ipRefresh(clpIssue(f), 'clpGen');
  const redraw = clpRedraw;
  bindNav($('#view'));
  $('#minutes').onchange = e => { if (e.target.value === 'custom') f.minCustom = true; else { f.minCustom = false; f.minutes = +e.target.value; } redraw(); };
  $('#customMin')?.addEventListener('input', e => { const v = +e.target.value; if (v >= 10 && v <= 120) f.minutes = v; });
  $('#periods').onchange = e => { f.periods = e.target.value === 'ai' ? 'ai' : +e.target.value; redraw(); };
  $('#styleMode').onchange = e => { f.styleMode = e.target.value; redraw(); }; $('#style').onchange = e => f.style = e.target.value;
  $('#pedMode').onchange = e => { f.pedMode = e.target.value; redraw(); }; $('#pedagogy').onchange = e => f.pedagogy = e.target.value;
  /* Revision keeps its "automatic" default until the teacher touches it: off = never, on = always, untouched = on for 5 or more periods */
  $('#revision').onchange = e => { f.revision = e.target.checked ? (f.revision === 'off' ? 'on' : f.revision) : 'off'; e.target.closest('.clp-sw').classList.toggle('on', e.target.checked); };
  $('#assessment').onchange = e => { f.assessment = e.target.checked; e.target.closest('.clp-sw').classList.toggle('on', e.target.checked); };
  $('#homework').onchange = e => f.homework = e.target.value;
  $('#details').oninput = e => f.details = e.target.value;
  /* chapters field -> cards (only the cards are redrawn, so typing keeps its focus) */
  const cards = $('#clpCards'), drawCards = () => { cards.innerHTML = clpCardsHTML(f); refresh(); };
  cards.addEventListener('input', e => {
    const d = e.target.dataset, c = i => f.chapters[+i];
    if (d.topic) { const [ci, ti] = d.topic.split(':'); c(ci).topics[+ti] = e.target.value; } else if (d.obj) c(d.obj).objectives = e.target.value; else if (d.ref) c(d.ref).reference = e.target.value; else return;
    ipRefresh(clpIssue(f), 'clpGen'); const card = e.target.closest('.clp-card'), need = card.querySelector('.clp-need'), has = clpHasContent(c(card.dataset.ci));
    if (has && need) need.remove(); else if (!has && !need) card.querySelector('.clp-ch').insertAdjacentHTML('beforeend', `<span class="clp-need">${ic('info', 'xs')} Needs topics, objectives or reference text</span>`);
  });
  cards.addEventListener('change', e => { const d = e.target.dataset; if (d.cper != null) f.chapters[+d.cper].periods = e.target.value; else if (d.cfile != null) { f.chapters[+d.cfile].fileName = e.target.files[0]?.name || ''; drawCards(); } });
  cards.addEventListener('click', e => {
    const add = e.target.closest('[data-addtopic]'), rm = e.target.closest('[data-rmtopic]');
    if (add) { f.chapters[+add.dataset.addtopic].topics.push(''); drawCards(); cards.querySelectorAll(`[data-topic^="${add.dataset.addtopic}:"]`).forEach((el, i, a) => i === a.length - 1 && el.focus()); }
    if (rm) { const [ci, ti] = rm.dataset.rmtopic.split(':'); f.chapters[+ci].topics.splice(+ti, 1); drawCards(); }
  });
  $('#clpFormEl').onsubmit = e => {
    e.preventDefault(); if (clpIssue(f)) return;
    clpMaps = f.chapters.filter(clpHasContent).map(c => clpBuildMap(f, c)); clpMapTab = 0; navigate('#/chapter-lesson-planner/map');
  };
}

/* ---------- Period map review: edit, lock, merge, add, remove; live checks block approval (§9, §14 M1-M6) ---------- */
const clpTotal = () => clpMaps.reduce((a, m) => a + m.period_map.length, 0);
const clpGenLabel = () => { const n = clpMaps.filter(x => x.approved).length; return clpMaps.length > 1 ? `Generate ${n} approved chapter${n === 1 ? '' : 's'}` : 'Generate chapter plan'; };
function clpMapHead(m) {
  const M = m.metadata, rows = m.period_map, src = { chapter: 'Set for this chapter', shared: 'Shared setting', ai_recommended: 'AI Recommended', pacing: 'Syllabus pacing' }[M.period_count_source];
  return `<div class="clp-sum"><div class="eyebrow">CHAPTER ${M.chapter_number ?? ''} · PERIOD MAP</div><h1>${esc(M.chapter_title)}</h1>
    <div class="clp-chips"><span>${rows.length} periods × ${M.period_minutes} min</span><span>${(rows.length * M.period_minutes / 60).toFixed(1).replace(/\.0$/, '')} hours</span><span>Count: ${src}</span>${M.grade ? `<span>Grade ${esc(M.grade)}</span>` : ''}${M.subject ? `<span>${esc(M.subject)}</span>` : ''}</div>
    ${M.period_count_reason ? `<p class="clp-why">${ic('sparkle', 's')} ${esc(M.period_count_reason)}</p>` : ''}${m.warnings.map(w => `<p class="clp-warn">${ic('alert', 's')} ${esc(w)}</p>`).join('')}</div>`;
}
function clpPeriodCard(m, r, i) {
  const f = clpForm, dis = r.locked ? 'disabled' : '', last = i === m.period_map.length - 1;
  const styles = DLP_STYLES.slice(1), peds = DLP_PEDS.slice(1), sel = (name, list, v, shown) => shown ? ifield(name === 'teaching_style' ? 'Teaching style' : 'Pedagogy', `<select class="input isel" data-f="${name}" ${dis}>${ipOptions(list, v)}</select>`) : '';
  return `<section class="clp-pc ${r.locked ? 'locked' : ''}" data-pi="${i}">
    <div class="clp-pch"><span class="clp-pn">${r.period}</span>
      <select class="input isel clp-type" data-f="type" ${dis} aria-label="Period type">${CLP_TYPES.map(([k, l]) => `<option value="${k}" ${k === r.type ? 'selected' : ''}>${l}</option>`).join('')}</select>
      <input class="input clp-ttl" data-f="title" value="${esc(r.title)}" ${dis} aria-label="Period title" placeholder="Period title (3 to 6 words)">
      <span class="clp-pa"><button type="button" class="icon-btn ${r.locked ? 'on' : ''}" data-lock title="${r.locked ? 'Unlock this period' : 'Lock this period'}" aria-label="${r.locked ? 'Unlock' : 'Lock'} period ${r.period}">${ic(r.locked ? 'lock' : 'unlock', 's')}</button>
        <button type="button" class="btn clp-sm" data-merge ${r.locked || last || m.period_map[i + 1].locked ? 'disabled' : ''}>Merge with next</button>
        <button type="button" class="icon-btn" data-rm ${r.locked ? 'disabled' : ''} title="Remove this period" aria-label="Remove period ${r.period}">${ic('trash', 's')}</button></span></div>
    <div class="clp-pcb"><div>${ifield('Topics', ilist(m.topics.map((t, ti) => ({ label: t, checked: r.topics.includes(t), attrs: `data-top="${i}" value="${ti}"`, disabled: r.locked })), { empty: 'No topics.' }), { hint: 'A topic may span consecutive periods.' })}</div>
      <div>${ifield('Objectives taught', `<div class="clp-objs">${m.chapter_objectives.map(o => `<label class="clp-chip ${r.objective_ids.includes(o.id) ? 'on' : ''}" title="${esc(o.text)}"><input type="checkbox" data-pobj="${i}" value="${o.id}" ${r.objective_ids.includes(o.id) ? 'checked' : ''} ${dis}>${o.id}</label>`).join('')}</div>`)}
        ${ifield('Main activity', `<input class="input" data-f="main_activity" value="${esc(r.main_activity)}" ${dis}>`)}${ifield('Checkpoint', `<input class="input" data-f="checkpoint" value="${esc(r.checkpoint)}" ${dis}>`)}${ifield('Homework', `<input class="input" data-f="homework" value="${esc(r.homework)}" ${dis}>`)}
        <div class="irow2">${sel('teaching_style', styles, r.teaching_style, f.styleMode === 'varies')}${sel('pedagogy', peds, r.pedagogy, f.pedMode === 'varies')}</div></div></div></section>`;
}
function clpMapView() {
  const m = clpMaps[clpMapTab], checks = clpMapChecks(m, clpForm), pass = checks.every(c => c.ok), many = clpMaps.length > 1, approved = clpMaps.filter(x => x.approved).length;
  return `<div class="toolbar"><div class="toolbar-in">
    <button class="icon-btn round" id="clpBack" aria-label="Back to settings">${ic('back')}</button>
    <div class="tb-title"><small>Chapter lesson planner</small><b>Period map · ${clpMaps.length} chapter${many ? 's' : ''} · ${clpTotal()} periods</b></div>
    <div class="acts">${many ? `<button class="btn" id="clpApproveAll">Approve all that pass</button>` : ''}<button class="btn primary" id="clpGenerate" ${approved ? '' : 'disabled'}>${ic('sparkle', 's')}<span class="lb">${clpGenLabel()}</span></button></div></div></div>
  <div class="clp-out" id="clpMapBody">
    ${many ? `<div class="clp-tabs" role="tablist">${clpMaps.map((x, k) => `<button class="${k === clpMapTab ? 'on' : ''}" data-mtab="${k}" role="tab">${x.approved ? ic('tick', 'xs') : ''} ${esc(x.metadata.chapter_title)} <small>${x.period_map.length}</small></button>`).join('')}</div>` : ''}
    ${clpMapHead(m)}
    <section class="clp-box"><h2>Chapter objectives</h2>${m.chapter_objectives.map((o, j) => `<div class="clp-lo"><span class="clp-chip on">${o.id}</span><input class="input" data-lo="${j}" value="${esc(o.text)}" aria-label="Objective ${o.id}"><small>${esc(o.bloom_level)}</small></div>`).join('')}</section>
    <section class="clp-box clp-checks ${pass ? 'ok' : ''}"><h2>Checks</h2><ul>${checks.map(c => `<li class="${c.ok ? 'ok' : 'bad'}">${ic(c.ok ? 'tick' : 'alert', 's')}<span><b>${c.label}</b>${c.ok ? '' : `<small>${esc(c.note)}</small>`}</span></li>`).join('')}</ul>
      <div class="clp-appr"><button class="btn ${m.approved ? '' : 'primary'}" id="clpApprove" ${pass ? '' : 'disabled'}>${m.approved ? 'Approved. Click to edit again' : 'Approve this map'}</button>${pass ? '' : '<span class="muted">Fix the checks above to approve.</span>'}</div></section>
    ${m.period_map.map((r, i) => clpPeriodCard(m, r, i)).join('')}
    <button class="btn clp-addp" id="clpAdd">${ic('plus', 's')} Add a period</button>
  </div>`;
}
function clpBindMap() {
  $('#view').classList.add('bg-white', 'view-clp');
  const m = clpMaps[clpMapTab], redraw = () => { const y = $('#view').scrollTop; $('#view').innerHTML = clpMapView(); clpBindMap(); $('#view').scrollTop = y; };
  const edited = () => { // any edit un-approves the map; keep the buttons honest without redrawing (typing keeps its focus)
    m.approved = false; const a = $('#clpApprove'), g = $('#clpGenerate'); if (a) { a.textContent = 'Approve this map'; a.classList.add('primary'); }
    if (g) { g.disabled = !clpMaps.some(x => x.approved); g.querySelector('.lb').textContent = clpGenLabel(); }
  }, setCount = () => { clpRenumber(m); m.metadata.period_count_source = 'chapter'; m.metadata.period_count_reason = ''; const card = clpForm.chapters.find(c => c.key === m.id); if (card) card.periods = String(m.period_map.length); };
  $('#clpBack').onclick = () => navigate('#/chapter-lesson-planner');
  $$('[data-mtab]').forEach(b => b.onclick = () => { clpMapTab = +b.dataset.mtab; redraw(); $('#view').scrollTo(0, 0); });
  $('#clpApprove').onclick = () => { m.approved = !m.approved; redraw(); };
  $('#clpApproveAll')?.addEventListener('click', () => { clpMaps.forEach(x => { if (clpMapChecks(x, clpForm).every(c => c.ok)) x.approved = true; }); redraw(); });
  $('#clpGenerate').onclick = () => navigate('#/chapter-lesson-planner/generating');
  $('#clpAdd').onclick = () => {
    if (m.period_map.length >= 12) return toast('A chapter can have at most 12 periods.');
    const at = m.period_map.findIndex(r => r.type === 'revise' || r.type === 'assess'), src = m.period_map[at < 0 ? m.period_map.length - 1 : at - 1] || m.period_map[0];
    m.period_map.splice(at < 0 ? m.period_map.length : at, 0, { period: 0, type: 'practice', title: 'New period', topics: [], objective_ids: [], main_activity: '', checkpoint: '', homework: 'None', teaching_style: src.teaching_style, pedagogy: src.pedagogy, locked: false });
    setCount(); edited(); redraw();
  };
  $$('[data-lo]').forEach(i => i.oninput = () => { m.chapter_objectives[+i.dataset.lo].text = i.value; edited(); });
  $$('.clp-pc').forEach(sec => {
    const i = +sec.dataset.pi, r = m.period_map[i];
    $$('[data-f]', sec).forEach(el => { const k = el.dataset.f; if (el.tagName === 'SELECT') el.onchange = () => { r[k] = el.value; if (k === 'type' && el.value === 'assess') r.homework = 'None'; edited(); redraw(); }; else el.oninput = () => { r[k] = el.value; edited(); }; });
    $$('[data-top]', sec).forEach(el => el.onchange = () => { const t = m.topics[+el.value]; r.topics = m.topics.filter(x => x === t ? el.checked : r.topics.includes(x)); edited(); redraw(); });
    $$('[data-pobj]', sec).forEach(el => el.onchange = () => { r.objective_ids = m.chapter_objectives.map(o => o.id).filter(id => id === el.value ? el.checked : r.objective_ids.includes(id)); edited(); redraw(); });
    $('[data-lock]', sec).onclick = () => { r.locked = !r.locked; redraw(); };
    $('[data-rm]', sec).onclick = () => { if (m.period_map.length <= 2) return toast('A chapter needs at least 2 periods.'); m.period_map.splice(i, 1); setCount(); edited(); redraw(); };
    $('[data-merge]', sec).onclick = () => { const nx = m.period_map[i + 1]; r.topics = m.topics.filter(t => r.topics.includes(t) || nx.topics.includes(t)); r.objective_ids = m.chapter_objectives.map(o => o.id).filter(id => r.objective_ids.includes(id) || nx.objective_ids.includes(id)); if (nx.type === 'assess' || nx.type === 'revise') r.type = nx.type; m.period_map.splice(i + 1, 1); setCount(); edited(); redraw(); };
  });
}

/* ---------- Pass 2 progress: one period at a time, in order (§4.1 step 4, §12 E) ---------- */
function clpGeneratingView() {
  const maps = clpMaps.filter(x => x.approved);
  if (!maps.length) { navigate('#/chapter-lesson-planner/map'); return; }
  $('#view').innerHTML = `<div class="page"><div class="card gen"><div class="orb"></div><h2>Planning your chapter…</h2><p class="muted" style="margin:6px 0 0">Periods are written one at a time so each recap uses the real period before it.</p><ul class="pipe clp-pipe">${maps.map((x, k) => `<li id="clpP${k}"><span class="dot">${ic('tick')}</span><span class="clp-pl">${esc(x.metadata.chapter_title)}</span></li>`).join('')}</ul></div></div>`;
  const steps = maps.flatMap((x, k) => x.period_map.map((_, p) => [k, p + 1, x.period_map.length])); let i = 0;
  (function tick() {
    if (location.hash !== '#/chapter-lesson-planner/generating') return;
    if (i < steps.length) {
      const [k, p, n] = steps[i++];
      $$('.clp-pipe li').forEach((li, j) => li.className = j < k ? 'done' : j === k ? 'now' : '');
      $(`#clpP${k} .clp-pl`).textContent = `${maps[k].metadata.chapter_title} · Writing period ${p} of ${n}`;
      return void setTimeout(tick, 170);
    }
    try { clpPlans = maps.map(x => clpBuildPlan(clpForm, x)); tokens -= 10; clpTab = 0; navigate('#/chapter-lesson-planner/output'); }
    catch (e) { console.error(e); toast('Generation failed – your map is saved. Please try again.'); navigate('#/chapter-lesson-planner/map'); }
  })();
}
