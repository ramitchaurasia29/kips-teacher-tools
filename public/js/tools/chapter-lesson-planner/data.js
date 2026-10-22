/* =========================================================
   Chapter lesson planner - catalogue + generation engine
   PRD v2.0: §5 inputs, §6 period count, §7 options, §8 period types, §9 map rules,
   §10 output blocks, §11 schema, §14 checks.
   clpBuildMap() = pass 1 and clpBuildPlan() = pass 2, both local mocks of the LLM pipeline (§12);
   swap them for the real service. Style / pedagogy / topic knowledge come from the Daily lesson planner engine.
   ========================================================= */

const CLP_TYPES = [['introduce', 'Introduce'], ['explore', 'Explore'], ['practice', 'Practice'], ['lab', 'Lab / Activity'], ['revise', 'Revise'], ['assess', 'Assess']];
const clpTypeName = k => (CLP_TYPES.find(t => t[0] === k) || [, k])[1];
const CLP_MINUTES = [30, 35, 40, 45, 50, 60];
const CLP_GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const CLP_SUBJECTS = ['English', 'Science', 'Mathematics', 'Social Science', 'Hindi', 'EVS'];
const CLP_HOMEWORK = [['optional', 'Optional, on selected periods'], ['none', 'None'], ['every', 'After every period']];
/* §8 typical patterns: [stage name, weight, role]; minutes are scaled so they sum exactly to the period length */
const CLP_PATTERNS = {
  introduce: [['Warm-up', 5, 'hook'], ['Predict', 7, 'predict'], ['Teach and read', 15, 'teach'], ['Practise', 9, 'practise'], ['Close', 4, 'close']],
  explore: [['Recap', 5, 'recap'], ['Investigate', 12, 'teach'], ['Discuss', 15, 'practise'], ['Share', 8, 'close']],
  practice: [['Recap', 5, 'recap'], ['Model', 10, 'teach'], ['Practise', 15, 'practise'], ['Check', 10, 'check']],
  lab: [['Recap', 4, 'recap'], ['Brief', 6, 'brief'], ['Activity', 20, 'practise'], ['Debrief', 10, 'close']],
  revise: [['Recall', 8, 'recap'], ['Fix-up', 12, 'fix'], ['Mixed review', 12, 'practise'], ['Check', 8, 'check']],
  assess: [['Instructions', 5, 'instr'], ['Test', 30, 'test'], ['Review', 5, 'review']],
};
/* §7 "varies" mode: the AI picks a style / pedagogy that suits each period type */
const CLP_STYLE_BY_TYPE = { introduce: 'Story Mode', explore: 'Socratic Method', practice: 'Step-by-Step Guided Learning', lab: 'Demonstration-Based Teaching', revise: 'Example First Approach', assess: 'Lecture Mode' };
const CLP_PED_BY_TYPE = { introduce: 'Constructivist Approach', explore: 'Inquiry-Based Learning', practice: 'Direct Instruction', lab: 'Collaborative Learning', revise: 'Collaborative Learning', assess: 'Direct Instruction' };

const clpWords = s => String(s ?? '').trim().split(/\s+/).filter(Boolean);
const clpCut = (s, n) => { const w = clpWords(s); return w.length > n ? w.slice(0, n).join(' ') : w.join(' '); };
const clpLc = s => s ? s.charAt(0).toLowerCase() + s.slice(1) : s;
const clpSubjectKey = s => /math/i.test(s) ? 'maths' : /engl|hindi/i.test(s) ? 'english' : /sci|evs/i.test(s) ? 'science' : /social|history|geog/i.test(s) ? 'social' : 'other';

/* ---------- §5 chapters field: one per line -> number + title; duplicates ignored; sorted by number ---------- */
function clpParseChapters(text) {
  const seen = new Set(), out = [];
  String(text || '').split('\n').map(x => x.trim()).filter(Boolean).forEach((line, i) => {
    const m = /^(?:ch(?:apter)?\.?\s*(?=\d))?(?:(\d+)\s*[:.\-–)]?\s*)?(.+)$/i.exec(line), title = (m[2] || line).trim(), key = title.toLowerCase().replace(/\s+/g, ' ');
    if (!title || seen.has(key)) return; seen.add(key); out.push({ key, num: m[1] ? +m[1] : null, title, order: i });
  });
  return out.sort((a, b) => (a.num ?? 1e6) - (b.num ?? 1e6) || a.order - b.order);
}
/* topics are loaded from the book catalogue when the chapter is known; otherwise the teacher types them (§5) */
function clpSuggestTopics(title) {
  const t = title.toLowerCase(), hit = DLP_CATALOGUE.flatMap(b => b.chapters.map(c => ({ b, c }))).find(x => x.c.title.toLowerCase() === t);
  return hit ? hit.c.topics.slice() : [];
}
const clpDefaults = () => ({ grade: '', subject: '', minutes: 40, periods: 'ai', styleMode: 'single', style: 'AI Recommended', pedMode: 'single', pedagogy: 'AI Recommended', revision: 'auto', assessment: false, homework: 'optional', blooms: [], details: '', chaptersText: '', chapters: [] });
const clpChapterCard = (c, prev) => prev || { key: c.key, num: c.num, title: c.title, topics: clpSuggestTopics(c.title), objectives: '', reference: '', fileName: '', periods: 'shared' };

/* ---------- §6 period count: chapter number > shared number > AI Recommended ---------- */
function clpPeriodCount(form, ch, topicN) {
  if (ch.periods !== 'shared' && ch.periods !== 'ai') return { n: +ch.periods, source: 'chapter', reason: '' };
  if (ch.periods === 'shared' && form.periods !== 'ai') return { n: +form.periods, source: 'shared', reason: '' };
  const sk = clpSubjectKey(form.subject), skill = sk === 'english' ? 'reading, vocabulary, grammar and writing each need time' : sk === 'science' ? 'practical work needs time' : sk === 'maths' ? 'worked examples need practice time' : 'discussion and sources need time';
  const teaching = Math.max(2, Math.round(topicN * 1.5) + 1), assess = form.assessment ? 1 : 0;
  const revise = form.revision === 'on' || (form.revision === 'auto' && teaching + assess >= 5) ? 1 : 0;
  const n = Math.min(12, Math.max(2, teaching + revise + assess));
  return { n, source: 'ai_recommended', reason: `${topicN} topic${topicN === 1 ? '' : 's'}; ${skill}. About ${n - revise - assess} teaching period${n - revise - assess === 1 ? '' : 's'}${revise ? ', 1 revision' : ''}${assess ? ', 1 assessment' : ''}.` };
}

/* ---------- Pass 1: chapter objectives, prerequisites, key concepts and the period map (§9, §13.6) ---------- */
function clpBuildMap(form, ch, seed = 1) {
  const topics = ch.topics.map(t => t.trim()).filter(Boolean), list = topics.length ? topics : [ch.title];
  const sk = clpSubjectKey(form.subject), minutes = +form.minutes || 40, count = clpPeriodCount(form, ch, list.length), warnings = [];
  const kb = dlpMergeKB(list.map(t => ({ title: t, chapter: ch.title })));
  // objectives: honour the teacher's own (LO1, LO2...), otherwise write measurable ones from the topics
  const levels = form.blooms.length ? DLP_BLOOMS.filter(b => form.blooms.includes(b)) : ['Remembering', 'Understanding', 'Applying', 'Analyzing'];
  const verbs = { Remembering: ['Name', 'the key terms in'], Understanding: ['Explain', 'the main ideas of'], Applying: ['Use', 'what they learned about'], Analyzing: ['Compare', 'examples of'], Evaluating: ['Judge', 'a claim about'], Creating: ['Design', 'something that shows'] };
  const own = ch.objectives.split('\n').map(x => x.trim()).filter(Boolean), O = own.length || Math.min(6, Math.max(2, list.length));
  const lvl = j => levels[Math.min(levels.length - 1, Math.floor(j * levels.length / O))];
  const objectives = Array.from({ length: O }, (_, j) => { const L = lvl(j), v = verbs[L]; return { id: 'LO' + (j + 1), text: own[j] || `${v[0]} ${v[1]} ${list[j % list.length]}${L === 'Applying' || L === 'Creating' ? ' in an everyday example' : ''}.`, bloom_level: L }; });
  // how many periods of each kind (§9: Introduce first, Revise before Assess, Assess last)
  let n = count.n, assess = form.assessment ? 1 : 0, revise = form.revision === 'on' || (form.revision === 'auto' && n >= 5) ? 1 : 0;
  if (n - assess - revise < 1) { revise = 0; if (n - assess < 1) assess = 0; }
  if (n < 2) n = 2;
  const teaching = n - assess - revise, cycle = { maths: ['explore', 'practice', 'practice', 'practice', 'explore'], science: ['explore', 'lab', 'practice', 'explore', 'lab'], english: ['explore', 'practice', 'practice', 'lab', 'practice'], social: ['explore', 'explore', 'practice', 'explore'], other: ['explore', 'practice', 'explore', 'practice'] }[sk];
  const types = Array.from({ length: teaching }, (_, i) => i === 0 ? 'introduce' : cycle[(i - 1) % cycle.length]);
  if (revise) types.push('revise'); if (assess) types.push('assess');
  if (n < list.length) warnings.push(`${n} periods for ${list.length} topics: coverage is compressed.`);
  // topics follow book order; a topic may span consecutive periods
  const L = list.length, perTopics = i => { const a = Math.floor(i * L / teaching), b = Math.max(Math.floor((i + 1) * L / teaching), a + 1); return list.slice(a, b); };
  const objFor = i => { const ids = objectives.filter((_, j) => Math.floor(j * teaching / O) === i).map(o => o.id); return ids.length ? ids : [objectives[i % O].id]; };
  const short = (s, k) => clpWords(s).slice(0, k).join(' ');
  const verb = { introduce: 'Meet', explore: 'Explore', practice: 'Practise', lab: 'Try out' };
  const hw = (type, topicsHere) => form.homework === 'none' || type === 'assess' ? 'None' : form.homework === 'every' || (type === 'practice' || type === 'lab') ? dlpMergeKB(topicsHere.map(t => ({ title: t, chapter: ch.title }))).homework.title : 'None';
  const res = dlpResolve({ style: form.styleMode === 'varies' ? 'AI Recommended' : form.style, pedagogy: form.pedMode === 'varies' ? 'AI Recommended' : form.pedagogy }, form.subject, minutes);
  const usedTitles = new Set(), topicUse = {};
  const rows = types.map((type, i) => {
    const here = type === 'revise' || type === 'assess' ? list : perTopics(i), kbh = dlpMergeKB(here.map(t => ({ title: t, chapter: ch.title })));
    const teachingType = type !== 'revise' && type !== 'assess', use = teachingType ? (topicUse[here[0]] = (topicUse[here[0]] ?? -1) + 1) : 0;
    let title = type === 'revise' ? `Revise ${short(ch.title, 3)}` : type === 'assess' ? 'Show what you know' : kbh.periodTitles?.[use] || `${verb[type]} ${short(here[0], 4)}`;
    if (usedTitles.has(title)) title = `${title} again`; usedTitles.add(title);
    const act = { introduce: `Hook and prior-knowledge talk on ${here[0]}, then a prediction`, explore: `Investigate: ${kbh.investigation}`, practice: `Practise: ${kbh.groupTask}`, lab: `Hands-on: ${kbh.demo}`, revise: 'Mixed recall questions and fix-up of common mistakes', assess: 'Chapter test, review and follow-up' }[type];
    const chk = { introduce: 'Students share one prior idea and make one prediction', explore: `Students answer: ${kbh.concepts[0].questions[0]}`, practice: 'Students complete the exit ticket with mostly correct answers', lab: 'Each group records one observation and explains it', revise: 'Students correct one earlier mistake and explain it', assess: 'Marks recorded against each chapter objective' }[type];
    return { period: i + 1, type, title: clpCut(title, 6), topics: here.slice(), objective_ids: type === 'revise' || type === 'assess' ? objectives.map(o => o.id) : objFor(i), main_activity: clpCut(act, 15), checkpoint: clpCut(chk, 18), homework: hw(type, here),
      teaching_style: form.styleMode === 'varies' ? CLP_STYLE_BY_TYPE[type] : res.style, pedagogy: form.pedMode === 'varies' ? CLP_PED_BY_TYPE[type] : res.pedagogy, locked: false };
  });
  return {
    id: ch.key, approved: false, topics: list.slice(), warnings,
    metadata: { book: '', chapter_number: ch.num, chapter_title: ch.title, grade: form.grade ? String(form.grade) : '', subject: form.subject || '', period_count: n, period_count_source: count.source, period_count_reason: count.reason, period_minutes: minutes,
      style_mode: form.styleMode, teaching_style_selected: form.style, pedagogy_mode: form.pedMode, pedagogy_selected: form.pedagogy, blooms_range: form.blooms.length ? form.blooms.join(', ') : 'Lower to higher order across the chapter', homework_policy: form.homework, template: 'yolearn_detailed_period', plan_version: '1', prompt_version: 'v2.0', renderer_version: 'v2.0' },
    chapter_objectives: objectives, prerequisites: kb.prereqs.slice(0, 4), key_concepts: kb.keyConcepts.slice(0, 4), period_map: rows,
  };
}
const clpRenumber = m => { m.period_map.forEach((r, i) => r.period = i + 1); m.metadata.period_count = m.period_map.length; };

/* ---------- §9 / §14 live map checks (they block approval) ---------- */
function clpMapChecks(m, form) {
  const rows = m.period_map, ids = new Set(m.chapter_objectives.map(o => o.id)), out = [], ok = (id, v, label, note) => out.push({ id, ok: v, label, note });
  const unplaced = m.topics.filter(t => !rows.some(r => r.topics.includes(t)));
  const taught = new Set(rows.filter(r => r.type !== 'assess').flatMap(r => r.objective_ids));
  const missing = m.chapter_objectives.filter(o => !taught.has(o.id));
  const iAssess = rows.findIndex(r => r.type === 'assess'), iRev = rows.findIndex(r => r.type === 'revise'), lastNon = rows.length - (iAssess >= 0 ? 2 : 1);
  ok('M1', rows.length >= 2 && rows.length <= 12, 'Number of periods', `A chapter needs 2 to 12 periods; it has ${rows.length}.`);
  ok('M2', !unplaced.length, 'Every topic is placed', unplaced.length ? `Place: ${unplaced.join(', ')}.` : '');
  ok('M3', !missing.length && rows.every(r => r.objective_ids.every(x => ids.has(x))), 'Every objective is taught', missing.length ? `Not taught yet: ${missing.map(o => o.id).join(', ')}.` : 'A period uses an objective that no longer exists.');
  ok('M4', rows[0]?.type === 'introduce' && (iAssess < 0 || (iAssess === rows.length - 1 && rows.filter(r => r.type === 'assess').length === 1)) && (iRev < 0 || (rows.filter(r => r.type === 'revise').length === 1 && iRev === lastNon)), 'Introduce first, Revise before Assess, Assess last', 'The first period must be Introduce; Revise comes just before Assess (or last); Assess is last.');
  ok('M6', form.styleMode === 'varies' || form.style === 'AI Recommended' || rows.every(r => r.teaching_style === form.style), 'Chosen style is kept', 'A period no longer uses the teaching style you selected.');
  return out;
}

const c0Meaning = c => c.explanation.split('. ')[0].replace(/\.$/, '') + '.';
/* ---------- Pass 2: one period per call, in order (§12 E, §13.7) ---------- */
function clpFit(parts, min, max) { // 80 to 150 words of teacher knowledge (§13.2)
  const filler = ['Keep the language simple and ask students to restate each idea in their own words.', 'Use real objects or pictures wherever you can, and check understanding before you move on.', 'Watch for students who copy an answer without understanding it, and ask them to explain why.', 'Connect each new idea to something students have already seen in class or at home.'];
  const sentences = parts.filter(Boolean).map(s => /[.!?]$/.test(s) ? s : s + '.');
  filler.forEach(f => { if (clpWords(sentences.join(' ')).length < min) sentences.push(f); });
  while (sentences.length > 1 && clpWords(sentences.join(' ')).length > max) sentences.pop();
  return sentences.join(' ');
}
const CLP_HELPER = { hook: 'hook', introduce: 'introduce', teach: 'introduce', practise: 'explore', close: 'close', check: 'apply', fix: 'explain' };

function clpStageContent(role, ctx, prev, row, qs, r) {
  const k = ctx.kb, a = k?.concepts[0], T = ctx.T; // the Assess steps (instr/test/review) need no topic knowledge
  const ask = n => [qs[n % qs.length], qs[(n + 1) % qs.length]].filter((v, i, x) => v && x.indexOf(v) === i).slice(0, 2);
  switch (role) {
    case 'recap': return { title: 'Recap', purpose: prev ? `Bring back what happened in “${prev.title}” so today builds on it.` : `Bring back what students already know about ${T}.`, t: [prev ? `Recap last period: ${prev.aim}` : `Ask what students already know about ${T}.`, `Ask: “${prev?.exit_ticket?.[0]?.question || a.questions[0]}” and take two answers.`], s: ['Answer the recap questions from memory.', 'Add one thing they remember to the class list.'], q: ask(0), ev: ['Students recall at least one idea from before'] };
    case 'predict': return { title: 'Predict', purpose: `Students make a prediction about ${T} before they learn it.`, t: [`Pose the puzzle: “${k.investigation}”`, 'Ask students to write a prediction and a reason, then share with a partner.'], s: ['Write a prediction and one reason.', 'Share it with a partner.'], q: [k.investigation], ev: ['Every student has a written prediction'] };
    case 'brief': return { title: 'Brief', purpose: `Set up the activity safely and make roles and success criteria clear.`, t: ['Show the materials and explain the safety rules in two sentences.', 'Hand out roles and read the success criteria aloud.', `If materials are missing, use pictures and describe the steps aloud: ${k.demo}.`], s: ['Listen and repeat the safety rules.', 'Take a role and read the success criteria with the group.'], q: ['What must we do to stay safe?'], ev: ['Each group can say its role and the success criteria'] };
    case 'instr': return { title: 'Instructions', purpose: 'Explain how the test works so every student starts calmly.', t: ['Read the test instructions aloud, including time and marks.', 'Remind students to read every question twice.'], s: ['Listen and ask any question about the instructions.', 'Write name and date on the answer sheet.'], q: ['Does everyone understand how the test works?'], ev: ['No student is waiting for instructions when the test starts'] };
    case 'test': return { title: 'Test', purpose: 'Students show what they know on their own.', t: ['Hand out the student copy and start the timer.', 'Walk around quietly and read questions aloud for students who need it.'], s: ['Answer every question on their own.', 'Check answers if time is left.'], q: [], ev: ['All students attempt every section'] };
    case 'review': return { title: 'Review', purpose: 'Go over the answers together and note what to reteach.', t: ['Read the answers aloud and let students mark their own work.', 'Ask which question was hardest and note it for the follow-up plan.'], s: ['Mark their own work and note mistakes.', 'Say which question they found hardest.'], q: ['Which question was the hardest, and why?'], ev: ['Students can name one question to improve'] };
  }
  const s = dlpStage(ctx, CLP_HELPER[role] || 'explain', r);
  return { title: s.title, purpose: s.purpose, t: s.t.slice(0, 3), s: s.s.slice(0, 3), q: ask(role === 'check' ? 1 : role === 'teach' ? 0 : 1), ev: s.ev, res: s.res };
}

function clpBuildPeriod(form, map, i, prev, seed) {
  const row = map.period_map[i], total = map.period_map.length, M = map.metadata, minutes = M.period_minutes, r = rngFrom(seed + i * 977);
  const objs = map.chapter_objectives.filter(o => row.objective_ids.includes(o.id));
  const here = (row.topics.length ? row.topics : map.topics).map(t => ({ title: t, chapter: M.chapter_title })), kb = dlpMergeKB(here), T = here.map(t => t.title).join(' and ');
  if (row.type === 'assess') return clpBuildAssess(map, i, prev, kb, T, objs);
  const ctx = { kb, T, style: row.teaching_style, ped: row.pedagogy, engage: '' }, pattern = CLP_PATTERNS[row.type].filter(p => !(i === 0 && p[2] === 'recap'));
  const mins = largestRemainder(pattern.map(p => p[1]), minutes), qs = kb.concepts.flatMap(c => c.questions), qsOf = qs.length ? qs : [`What did we learn about ${T}?`];
  let at = 0;
  const stages = pattern.map(([name, , role], si) => {
    const c = clpStageContent(role, ctx, prev, row, qsOf, rngFrom(seed + i * 131 + si)), st = { start_minute: at, end_minute: at + mins[si], title: name === c.title ? name : `${name}: ${c.title}`, purpose: c.purpose, teacher: c.t, students: c.s, questions: (c.q && c.q.length ? c.q : [qsOf[si % qsOf.length]]).slice(0, 2), check: c.ev[0], _res: c.res || [], _role: role };
    at += mins[si]; return st;
  });
  const practiseStage = stages.find(s => s._role === 'practise') || stages[stages.length - 1], conc = kb.concepts, c0 = conc[0], c1 = conc[1] || conc[0];
  const aim = `Students ${clpLc(objs[0]?.text || `understand ${T}.`)}`.replace(/\.?$/, '.');
  const materials = [...new Set([...stages.flatMap(s => s._res), ...kb.resources.slice(0, 3), 'Copies of the student activity'].filter(Boolean))].slice(0, 7);
  const vocab = []; conc.forEach(c => vocab.push({ term: c.name, meaning: c0Meaning(c) }));
  if (vocab.length < 3) vocab.push({ term: 'Example', meaning: conc[0].example });
  const keyVocab = vocab.filter((v, k, a) => a.findIndex(x => x.term.toLowerCase() === v.term.toLowerCase()) === k).slice(0, 5);
  if (keyVocab.length < 3) keyVocab.push({ term: 'Example', meaning: conc[0].example });
  while (keyVocab.length < 3) keyVocab.push({ term: `Key word ${keyVocab.length + 1}`, meaning: `A word students need for ${T}.` });
  const explanation = clpFit(conc.flatMap(c => [c.explanation, `For example, ${clpLc(c.example)}`, `A useful comparison: ${clpLc(c.analogy)}`]), 80, 150);
  const points = [...new Set(conc.flatMap(c => c.points))].slice(0, 3);
  while (points.length < 3) points.push(`Check that students can say the idea about ${T} in their own words.`);
  // student activity: real items + a complete answer key (§16.1)
  const items = [], key = [];
  const add = (q, a) => { items.push(q); key.push(a); };
  add(c0.questions[0], c0.points[0]); add(c0.questions[1] || `Why is ${c0.name} important?`, c0.points[1] || c0.explanation);
  add(`True or False: ${c0.points[0]}`, `True. ${c0.explanation}`); add(`Give one example of ${c0.name.toLowerCase()}.`, c0.example);
  if (c1 !== c0) add(c1.questions[0], c1.points[0]); else add(`Use the words “${c0.name}” in a sentence of your own.`, `Sample answer: ${c0.example} Accept any correct sentence that uses the words.`);
  add(`Tell a partner why this is true: ${c0.analogy}`, 'Success criteria: uses the key word and gives one clear reason.');
  const actName = { introduce: 'Picture and prediction cards', explore: 'Investigation sheet', practice: 'Graded practice set', lab: 'Hands-on activity sheet', revise: 'Mixed review quiz' }[row.type];
  const act = { title: actName, type: row.pedagogy, duration_minutes: Math.max(3, Math.min(practiseStage.end_minute - practiseStage.start_minute, Math.round((practiseStage.end_minute - practiseStage.start_minute) * .8))), instructions: `With your partner, work through the ${items.length} items about ${T}. Read each one carefully, write your answer, and be ready to explain it.`, items, answer_key: key };
  const exit = [{ question: c0.questions[0], answer: c0.points[0] }, { question: c1 !== c0 ? c1.questions[0] : `What is one thing you learned about ${T}?`, answer: c1 !== c0 ? c1.points[0] : kb.takeaways[0] }, { question: kb.final, answer: kb.takeaways[kb.takeaways.length - 1] }].slice(0, 3);
  const nxt = map.period_map[i + 1];
  const hw = row.homework && !/^none$/i.test(row.homework) ? { optional: M.homework_policy !== 'every', text: `${row.homework}. ${kb.homework.instructions}` } : null;
  return {
    period: i + 1, title: row.title, type: row.type, aim, objective_ids: row.objective_ids.slice(), objectives: objs.map(o => ({ id: o.id, text: o.text })),
    recap: prev ? `Last period, “${prev.title}”: ${prev.aim} Our last step was “${prev.stages[prev.stages.length - 1].title.split(': ')[0]}”.` : '',
    key_vocabulary: keyVocab, materials, preparation: [`Collect: ${materials.slice(0, 3).join('; ')}.`, `Copy the student activity (one per pair).`, `Write the aim and key words on the board before class.`],
    stages: stages.map(({ _res, _role, ...s }) => s), teacher_notes: { explanation, points, board_plan: [`Aim: ${aim}`, `Key words: ${keyVocab.map(v => v.term).join(', ')}`, `Check question: ${c0.questions[0]}`] }, activity: act,
    misconceptions: kb.misconceptions.slice(0, 2).map(m => ({ misconception: m[0], intervention: m[1] })),
    differentiation: { needs_support: [`Give picture cards or a word bank for ${c0.name.toLowerCase()}.`, 'Pair with a partner and let them answer orally first.', 'Reduce the activity to the first three items.'], advanced: [`Ask for a second example of ${c0.name.toLowerCase()} and a reason why it fits.`, 'Ask students to write one new question for the class.'] },
    exit_ticket: exit, homework: hw, bridge: nxt ? `Next period: “${nxt.title}”. We will build on today by ${clpLc(nxt.main_activity.replace(/\.$/, ''))}.` : '',
  };
}

/* §10.4: the Assess period - full test paper, answer key, rubric, follow-up plan and a student copy */
function clpBuildAssess(map, i, prev, kb, T, objs) {
  const M = map.metadata, row = map.period_map[i], O = map.chapter_objectives, minutes = M.period_minutes, mins = largestRemainder([5, 30, 5], minutes);
  const kbOf = o => { const j = O.indexOf(o), topic = map.topics[j % map.topics.length]; return dlpMergeKB([{ title: topic, chapter: M.chapter_title }]); };
  const lines = marks => marks <= 1 ? 1 : marks <= 4 ? 2 : 6;
  const sections = [], key = [];
  let qn = 0;
  const q = (sec, text, marks, answer) => { qn++; sec.questions.push({ q: text, marks, lines: lines(marks) }); key.push(`Q${qn} (${marks}): ${answer}`); sec.marks += marks; };
  O.forEach(o => {
    const k = kbOf(o), c = k.concepts[0], sec = { title: `${o.id}: ${o.text.replace(/\.$/, '')}`, objective_ids: [o.id], marks: 0, questions: [] };
    if (O.length > 6) q(sec, `Explain in your own words: ${c.name}. Give one example.`, 3, `${c.explanation} Example: ${c.example}`);
    else { q(sec, c.questions[0], 1, c.points[0]); q(sec, `Explain in your own words: ${c.name}.`, 2, c.explanation); q(sec, `Give an example of ${c.name.toLowerCase()} from everyday life and say why it fits.`, 3, c.example); }
    sections.push(sec);
  });
  let total = sections.reduce((a, s) => a + s.marks, 0);
  const open = O.length <= 3, c0 = kbOf(O[0]).concepts[0];
  if (open) { const sec = { title: 'Open task', objective_ids: O.map(o => o.id), marks: 0, questions: [] }, m = Math.max(6, 20 - total); q(sec, `Write a short paragraph that explains what you learned in this chapter about ${T}. Use at least two key words.`, m, `Look for: ${c0.explanation} Use the rubric below.`); sections.push(sec); total += m; }
  const rubric = [{ criterion: 'Content: correct, relevant ideas', levels: ['Few ideas, mostly incorrect', 'Some correct ideas', 'Mostly correct ideas with an example', 'Complete, accurate ideas with examples'] }, { criterion: 'Use of key words', levels: ['No key words', 'One key word', 'Two key words used correctly', 'Key words used correctly and precisely'] }, { criterion: 'Clarity and organisation', levels: ['Hard to follow', 'Some order', 'Clear order', 'Clear, well-organised and complete sentences'] }];
  const focus = O[Math.min(1, O.length - 1)];
  const follow = [{ if: `students score below half on ${O[0].id}`, then: `reteach ${O[0].text.replace(/\.$/, '').toLowerCase()} with a short worked example next period.` }, { if: `students score well on recall but lose marks on the 3-mark questions`, then: 'add one more application task from the practice set.' }, { if: `the open or explain questions are left blank`, then: 'practise writing one explanation in pairs before the next chapter.' }, { if: `most students score above 80%`, then: `give an extension task on ${focus.id} and move on.` }];
  const stages = []; let at = 0;
  ['instr', 'test', 'review'].forEach((role, si) => { const c = clpStageContent(role, {}, prev, row, [], rngFrom(7 + si)); stages.push({ start_minute: at, end_minute: at + mins[si], title: ['Instructions', 'Test', 'Review'][si], purpose: c.purpose, teacher: c.t, students: c.s, questions: c.q.slice(0, 2), check: c.ev[0] }); at += mins[si]; });
  return {
    period: i + 1, title: row.title, type: 'assess', aim: `Students show what they know about ${M.chapter_title}.`, objective_ids: O.map(o => o.id), objectives: O.map(o => ({ id: o.id, text: o.text })),
    recap: prev ? `Last period, “${prev.title}”: ${prev.aim}` : '', key_vocabulary: [], materials: ['Student copy of the test (one per student)', 'Pens or pencils', 'Marking guide'], preparation: ['Print the student copy, one per student.', 'Arrange seating so students work on their own.', 'Keep the answer key and rubric on your desk.'],
    stages, teacher_notes: { explanation: '', points: [], board_plan: [] }, activity: null, misconceptions: [], differentiation: { needs_support: ['Read questions aloud to students who need it.', 'Allow extra time and a quiet corner.'], advanced: [] }, exit_ticket: [], homework: null, bridge: '',
    assessment: { duration_minutes: mins[1], total_marks: total, instructions: `Answer every question. Write your answers in the space given. The test is ${mins[1]} minutes and carries ${total} marks.`, sections, answer_key: key, rubric, follow_up: follow, test_conditions: ['Read reading-heavy questions aloud for students who need it.', 'Give extra time or a separate space where agreed.'] },
  };
}

function clpBuildPlan(form, map, opts = {}) {
  const seed = opts.seed ?? hashStr(JSON.stringify([form.subject, map.metadata.chapter_title, Date.now()])), periods = [];
  map.period_map.forEach((_, i) => periods.push(clpBuildPeriod(form, map, i, periods[i - 1] || null, seed)));
  const resMap = new Map(); periods.forEach(p => p.materials.forEach(x => resMap.set(x, [...(resMap.get(x) || []), p.period])));
  const O = map.chapter_objectives, notes = { assumptions: [], warnings: [...map.warnings] };
  if (map.metadata.period_count_source === 'ai_recommended') notes.assumptions.push(`Number of periods chosen by AI Recommended. ${map.metadata.period_count_reason}`);
  const plan = {
    metadata: { ...map.metadata }, chapter_objectives: O, prerequisites: map.prerequisites, key_concepts: map.key_concepts, period_map: map.period_map.map(r => ({ ...r })), periods,
    toolkit: { resources: [...resMap].map(([item, ps]) => ({ item, periods: ps })), assessment_plan: O.map(o => ({ objective_id: o.id, checked_in_periods: periods.filter(p => p.type === 'assess' || (p.objective_ids.includes(o.id) && p.exit_ticket.length)).map(p => p.period) })) },
    generation_notes: notes,
  };
  clpPlanChecks(plan).filter(c => !c.ok).forEach(c => notes.warnings.push(`${c.id}: ${c.note}`));
  return plan;
}

/* §14 period checks (code) */
function clpPlanChecks(plan) {
  const out = [], ok = (id, v, note) => out.push({ id, ok: v, note });
  plan.periods.forEach(p => {
    const T = `Period ${p.period}`, st = p.stages, len = plan.metadata.period_minutes;
    ok('P2', st[0].start_minute === 0 && st.every((s, i) => i === 0 || s.start_minute === st[i - 1].end_minute) && st[st.length - 1].end_minute === len, `${T}: stage times do not add up to ${len} minutes.`);
    ok('P3', (p.period === 1 || !!p.recap) && (p.period === plan.periods.length || !!p.bridge), `${T}: recap or bridge is missing.`);
    if (p.type !== 'assess') {
      ok('P4', st.length >= 4 && st.length <= 5 && st.every(s => s.teacher.length && s.students.length && s.questions.length && s.check), `${T}: stages are incomplete.`);
      ok('P5', p.activity.items.length > 0 && p.activity.items.length === p.activity.answer_key.length, `${T}: the activity answer key does not match its items.`);
      const w = clpWords(p.teacher_notes.explanation).length; ok('P6', w >= 80 && w <= 150 && p.exit_ticket.length >= 2 && p.exit_ticket.every(e => e.answer), `${T}: teacher notes or exit ticket are out of range.`);
    } else {
      const a = p.assessment, sum = a.sections.reduce((t, s) => t + s.questions.reduce((u, q) => u + q.marks, 0), 0);
      ok('A1', sum === a.total_marks && plan.chapter_objectives.every(o => a.sections.some(s => s.objective_ids.includes(o.id))), `${T}: test marks or objective coverage do not add up.`);
      ok('A2', a.answer_key.length === a.sections.reduce((t, s) => t + s.questions.length, 0), `${T}: the answer key does not cover every question.`);
    }
    ok('P7', !/TBD|teacher asks questions/i.test(JSON.stringify(p)), `${T}: contains a placeholder.`);
  });
  return out;
}

/* ---------- Mock topic knowledge (the real tool retrieves this from the book / reference document) ----------
   Added to the shared knowledge base of the Daily lesson planner so the sample chapters read like real plans. */
const clpMock = (o) => ({ ...o, homework: o.homework });
Object.assign(DLP_KB, {
  'Reading the story': clpMock({
    concepts: [
      { name: 'Characters and setting', explanation: 'Characters are the people or animals in a story, and the setting is where and when the story happens.', points: ['The two main characters are a lion and a mouse.', 'The setting is a forest.', 'We find characters and setting by asking who acts and where it happens.'], example: 'In the story, a tiny mouse runs over a sleeping lion in the forest.', analogy: 'The setting is the stage and the characters are the actors.', questions: ['Who are the two main characters in the story?', 'Where does the story take place?'] },
      { name: 'Beginning, middle and end', explanation: 'Every story has a beginning that starts it, a middle where the problem grows, and an end where the problem is solved.', points: ['Beginning: the mouse wakes the lion, and the lion lets it go.', 'Middle: the lion is caught in a hunter’s net.', 'End: the mouse gnaws the ropes and sets the lion free.'], example: 'The lion roars for help in the net, and the little mouse hears him.', analogy: 'A story is like a journey with a start, a road and a finish.', questions: ['What happens first in the story?', 'How is the lion’s problem solved at the end?'] },
    ],
    keyConcepts: ['A story has characters and a setting', 'A story has a beginning, a middle and an end', 'A fable teaches a lesson called a moral'],
    prereqs: ['Reading short sentences aloud', 'Names of common animals and where they live'],
    misconceptions: [['The biggest character is always the strongest one.', 'Ask who saved the lion and why size did not matter, then list what each character did well.'], ['The moral is only the last line of the story.', 'Ask students to say the lesson in their own words, then compare it with the printed moral.']],
    resources: ['Printed copies of the fable', 'Picture cards of the lion, mouse and hunter', 'Six story-strip cards', 'Chart paper and markers'],
    demo: 'a read-aloud of the fable while picture cards are held up for each part', demoResources: ['Picture cards of the lion, mouse and hunter'],
    investigation: 'What does the story teach us about small and big friends?', groupTask: 'put six story cards in order and say what happens on each card', driving: 'Make a four-picture strip of the story with one sentence under each picture',
    story: 'a mouse who learns that even the smallest friend can help a king', final: 'What lesson does the story teach? Say it in one sentence.',
    takeaways: ['A story has characters, a setting, a beginning, a middle and an end.', 'The lion and the mouse help each other.', 'The moral is: kindness is never wasted.'],
    homework: { title: 'Tell it at home', minutes: 10, instructions: 'Tell the story of the lion and the mouse to someone at home in three parts: beginning, middle and end.' },
  }),
  'Vocabulary from the story': clpMock({
    concepts: [
      { name: 'New words from the story', explanation: 'New words help us understand what happens in a story and let us say it more clearly.', points: ['“Roar” is the loud, deep sound a lion makes.', '“Pounce” means to jump on something suddenly.', '“Tangled” means twisted up, like the lion in the ropes.', '“Gnaw” means to bite again and again.', '“Grateful” means thankful.'], example: 'The mouse gnawed the tangled ropes and the grateful lion was free.', analogy: 'New words are tools in a toolbox: the more you have, the better you can build a sentence.', questions: ['What does “gnaw” mean?', 'Which word means the same as “thankful”?'] },
      { name: 'Context clues', explanation: 'Context clues are the words around a hard word that help us guess what it means.', points: ['Read the sentence before and after the new word.', 'Look for a word that means the opposite or the same.', 'Check that your guess makes sense in the sentence.'], example: 'The lion was tangled in the net and could not move, so “tangled” must mean stuck in ropes.', analogy: 'Context clues are like footprints that lead you to the meaning.', questions: ['Which words in the sentence help you guess “tangled”?', 'How can you check that your guess is right?'] },
    ],
    keyConcepts: ['New words are learnt from the story', 'Context clues help us guess meanings', 'We use new words in our own sentences'],
    prereqs: ['Reading the story once', 'Writing a simple sentence'],
    misconceptions: [['A word has only one meaning.', 'Show “roar” for a lion and for loud laughter, and ask where each fits.'], ['Guessing a meaning is cheating.', 'Show how context clues make a good guess, then check in a picture dictionary.']],
    resources: ['Word cards: roar, pounce, tangled, gnaw, grateful', 'Picture dictionary or pictures of each word', 'Sentence strips', 'Chart paper and markers'],
    demo: 'acting out “pounce”, “gnaw” and “tangled” with simple movements', demoResources: ['Word cards: roar, pounce, tangled, gnaw, grateful'],
    investigation: 'How can the words around a new word tell us what it means?', groupTask: 'match five word cards to their meanings and write one sentence for each word', driving: 'Make a “Words from the story” poster with a picture and a sentence for each word',
    story: 'a young mouse who collects new words in a little notebook', final: 'Use the word “grateful” in a sentence about the story.',
    takeaways: ['Roar, pounce, tangled, gnaw and grateful are new words from the story.', 'Context clues help us guess what a word means.', 'We can use new words in sentences of our own.'],
    homework: { title: 'Two new sentences', minutes: 10, instructions: 'Write two sentences at home using two of the new words from the story.' },
  }),
  'Grammar: simple past tense': clpMock({
    concepts: [
      { name: 'Simple past tense', explanation: 'The simple past tense tells about something that has already happened, and most verbs add -ed.', points: ['Add -ed to most verbs: jump becomes jumped.', 'Words like yesterday and last night often show the past.', 'We use the same past form for I, you, he, she and they.'], example: 'The mouse jumped on the lion and ran away.', analogy: 'The past tense is a photo of something that has already happened.', questions: ['What is the past form of “walk”?', 'Which word in “Yesterday we played” shows the past?'] },
      { name: 'Irregular verbs', explanation: 'Irregular verbs do not take -ed in the past and have to be remembered.', points: ['go becomes went.', 'see becomes saw.', 'catch becomes caught.'], example: 'The hunter caught the lion in a net.', analogy: 'Irregular verbs are like special guests who do not follow the house rules.', questions: ['What is the past form of “catch”?', 'What is the past form of “see”?'] },
    ],
    keyConcepts: ['The simple past tense tells what already happened', 'Most verbs add -ed', 'Irregular verbs change in other ways'],
    prereqs: ['Knowing what a verb is', 'Reading the story'],
    misconceptions: [['Every past verb ends in -ed.', 'Show went, saw and caught in the story and ask students to find the verbs that do not end in -ed.'], ['Past tense is only for stories.', 'Ask students to say what they did yesterday using past verbs.']],
    resources: ['Verb cards (jump, walk, play, go, see, catch)', 'Sorting chart: -ed verbs and irregular verbs', 'Printed story paragraph', 'Mini boards'],
    demo: 'a verb hunt in the printed story paragraph with highlighters', demoResources: ['Printed story paragraph', 'Highlighters or coloured pencils'],
    investigation: 'Which verbs in the story tell us what already happened?', groupTask: 'find eight verbs in the story and sort them into -ed verbs and irregular verbs', driving: 'Make a “Then and now” chart with present and past forms of ten verbs',
    story: 'a mouse who tells her friends what happened yesterday', final: 'Write the past form of “run”, “jump” and “see”.',
    takeaways: ['The simple past tense tells what already happened.', 'Most verbs add -ed to make the past.', 'Went, saw and caught are irregular past forms.'],
    homework: { title: 'Yesterday sentences', minutes: 10, instructions: 'Write three sentences about what you did yesterday, using past tense verbs.' },
  }),
  'Speaking: retelling the story': clpMock({
    concepts: [
      { name: 'Retelling in order', explanation: 'To retell a story, we say what happened in order using our own words, not by reading it again.', points: ['Start with who and where.', 'Use words like first, then, next and finally.', 'End with the lesson of the story.'], example: 'First, a mouse woke a lion. Then the lion let him go. Finally, the mouse saved the lion.', analogy: 'Retelling is like walking someone through a map you have already travelled.', questions: ['Which word would you use to start your retelling?', 'How does the story end?'] },
      { name: 'Speaking clearly', explanation: 'Clear speaking means a loud enough voice, a steady speed and looking at the people you are talking to.', points: ['Speak loudly enough for the back of the room.', 'Do not rush. Pause after each sentence.', 'Look at your listeners.'], example: 'A student speaks slowly and looks at the class while telling the story of the lion and the mouse.', analogy: 'A clear voice is like a clear window: the message comes straight through.', questions: ['What makes a speaker easy to understand?', 'Why should we pause between sentences?'] },
    ],
    keyConcepts: ['A retelling keeps events in order', 'Sequence words help us retell', 'Clear speaking needs voice, speed and eye contact'],
    prereqs: ['Reading the story', 'Using new words from the story'],
    misconceptions: [['Retelling means remembering every word.', 'Model a retelling in your own words and show it is shorter than the story.'], ['Speaking well means speaking fast.', 'Compare a rushed and a steady retelling and ask which was easier to follow.']],
    resources: ['Story-strip cards', 'Sequence word cards: first, then, next, finally', 'Speaking checklist', 'A timer'],
    demo: 'a teacher retelling with the story-strip cards on the board', demoResources: ['Story-strip cards'],
    investigation: 'How can we tell a story so that everyone understands it?', groupTask: 'retell the story in groups of four, one part each, using sequence words and the speaking checklist', driving: 'Perform a two-minute group retelling for the class',
    story: 'a young mouse who tells the forest the story of the lion', final: 'Retell the story in three sentences using first, then and finally.',
    takeaways: ['A retelling keeps the events in order.', 'First, then, next and finally help us retell.', 'Speak loudly, steadily and look at your listeners.'],
    homework: { title: 'Retell to a family member', minutes: 10, instructions: 'Retell the story at home in your own words and ask a family member to say what they liked.' },
  }),
  'Writing: your own fable': clpMock({
    concepts: [
      { name: 'Planning a fable', explanation: 'A fable has animal characters, a small problem that is solved, and a moral that teaches a lesson.', points: ['Choose two animal characters.', 'Decide on a problem and how it is solved.', 'End with a moral in one sentence.'], example: 'A tortoise and a hare race, and the slow tortoise wins, teaching that steady work wins.', analogy: 'A fable plan is like a recipe: characters, problem and moral are the ingredients.', questions: ['Which two animals will be in your fable?', 'What lesson will your fable teach?'] },
      { name: 'Writing a paragraph', explanation: 'A good paragraph starts with a capital letter, has sentences in order and ends with a full stop.', points: ['Begin the story with who and where.', 'Use past tense verbs.', 'Check capital letters and full stops at the end.'], example: 'Once, a crow found a jug with a little water at the bottom.', analogy: 'A paragraph is like a train: each sentence is a carriage that follows the one before.', questions: ['How does your story begin?', 'Which words show that it happened in the past?'] },
    ],
    keyConcepts: ['A fable has animal characters and a moral', 'We plan before we write', 'We check our writing for capital letters, full stops and past tense'],
    prereqs: ['Simple past tense', 'Retelling a story in order'],
    misconceptions: [['A fable needs a long story.', 'Show that the lion and the mouse fits on one page and still has a problem and a moral.'], ['The moral comes first.', 'Plan the problem first, then ask what lesson it teaches.']],
    resources: ['Fable planner sheet', 'Success criteria checklist', 'Lined paper', 'Pencils and erasers'],
    demo: 'a teacher thinking aloud while filling in the fable planner on the board', demoResources: ['Fable planner sheet'],
    investigation: 'What do we need to write a short fable of our own?', groupTask: 'plan a fable together: choose characters, a problem, a solution and a moral', driving: 'Write a short fable of five to six sentences with a moral',
    story: 'a crow who writes a fable about a clever friend', final: 'What is the moral of your fable?',
    takeaways: ['A fable has animal characters, a problem and a moral.', 'We plan first and then write.', 'We check capital letters, full stops and past tense.'],
    homework: { title: 'Finish your fable', minutes: 15, instructions: 'Finish writing your fable at home and read it aloud to someone. Check that it ends with a moral.' },
  }),
  'Common and proper nouns': clpMock({
    concepts: [
      { name: 'Common nouns', explanation: 'A common noun is the general name of a person, place, animal or thing.', points: ['It does not begin with a capital letter unless it starts a sentence.', 'Examples are girl, city, dog and book.', 'We can count or point to most common nouns.'], example: 'The girl read a book in the library.', analogy: 'A common noun is like a family name for a whole group.', questions: ['Which word in “The dog ran home” is a common noun?', 'Can you give a common noun for a place?'] },
      { name: 'Proper nouns', explanation: 'A proper noun is the special name of one person, place or thing, and it always begins with a capital letter.', points: ['Names of people, cities, rivers and days are proper nouns.', 'Examples are Asha, Delhi, Ganga and Monday.', 'Always start a proper noun with a capital letter.'], example: 'Asha visited Delhi on Monday.', analogy: 'A proper noun is like a name tag on one special person.', questions: ['Which word in “Ravi lives in Jaipur” is a proper noun?', 'Why do we use a capital letter for Delhi?'] },
    ],
    keyConcepts: ['A common noun names any person, place, animal or thing', 'A proper noun names one special person, place or thing', 'Proper nouns start with a capital letter'],
    prereqs: ['Knowing what a noun is', 'Reading simple sentences'],
    misconceptions: [['A capital letter makes a word a proper noun.', 'Show a sentence-starting common noun and ask whether it names one special thing.'], ['Days and months are common nouns.', 'Show the calendar and explain they are special names, so they take capital letters.']],
    resources: ['Noun cards (girl, Asha, city, Delhi, river, Ganga)', 'Two-column sorting chart', 'Sentence strips', 'Chart paper and markers'],
    demo: 'sorting noun cards into common and proper on the board', demoResources: ['Noun cards (girl, Asha, city, Delhi, river, Ganga)'],
    investigation: 'How can we tell a common noun from a proper noun?', groupTask: 'sort twelve noun cards into common and proper and give one reason for each', driving: 'Make a class noun wall with a common noun and a matching proper noun for each',
    story: 'a girl named Asha who visits places with special names', final: 'Write one sentence that has a common noun and a proper noun.',
    takeaways: ['A common noun is a general name.', 'A proper noun is a special name with a capital letter.', 'People, places and days can all have proper nouns.'],
    homework: { title: 'Noun hunt at home', minutes: 10, instructions: 'Find three common nouns and three proper nouns at home and write them in two columns.' },
  }),
  'Singular and plural': clpMock({
    concepts: [
      { name: 'Singular and plural', explanation: 'A singular noun names one thing and a plural noun names more than one.', points: ['Most nouns add -s to make the plural: cat becomes cats.', 'Nouns ending in s, x, ch or sh add -es: box becomes boxes.', 'Say “a” or “one” with singular nouns and “some” or “many” with plurals.'], example: 'One bus and two buses stopped at the school.', analogy: 'Singular is one apple and plural is a basket of apples.', questions: ['What is the plural of “dog”?', 'What is the plural of “box”?'] },
      { name: 'Irregular plurals', explanation: 'Some nouns change completely in the plural instead of adding -s.', points: ['child becomes children.', 'man becomes men.', 'mouse becomes mice.'], example: 'The mice ran away from the children.', analogy: 'Irregular plurals are like nicknames that you just have to know.', questions: ['What is the plural of “child”?', 'What is the plural of “mouse”?'] },
    ],
    keyConcepts: ['Singular means one and plural means more than one', 'Most nouns add -s or -es', 'Some plurals are irregular'],
    prereqs: ['Knowing what a noun is', 'Counting objects'],
    misconceptions: [['All plurals end in -s.', 'Show child, children and mouse, mice and ask which letters change.'], ['Add -s to every word.', 'Show bus and box and say the words aloud with -s to hear why they need -es.']],
    resources: ['Picture cards of single and many objects', 'Plural rule chart', 'Mini boards', 'Chart paper and markers'],
    demo: 'showing one pencil and then three pencils and writing both words on the board', demoResources: ['Pencils or picture cards'],
    investigation: 'What happens to a noun when there is more than one?', groupTask: 'sort twelve picture cards into rule groups: add -s, add -es and irregular', driving: 'Make a “One and many” poster with six singular and plural pairs',
    story: 'a child counting animals at a farm', final: 'Write the plural of “bus”, “child” and “book”.',
    takeaways: ['Singular means one; plural means more than one.', 'Most nouns add -s or -es.', 'Child, man and mouse have irregular plurals.'],
    homework: { title: 'One and many at home', minutes: 10, instructions: 'Write five things at home in singular and plural form, for example one chair and four chairs.' },
  }),
  'Modes of nutrition': clpMock({
    concepts: [
      { name: 'Autotrophs and heterotrophs', explanation: 'Autotrophs make their own food, while heterotrophs depend on other living things for food.', points: ['Green plants are autotrophs because they make food by photosynthesis.', 'Animals are heterotrophs because they eat plants or other animals.', 'Heterotrophs cannot make food from sunlight, water and carbon dioxide.'], example: 'A mango tree makes its own food, but a goat eats the grass.', analogy: 'An autotroph is a cook in its own kitchen; a heterotroph is a visitor who needs a meal.', questions: ['Which group of organisms makes its own food?', 'Is a cow an autotroph or a heterotroph?'] },
      { name: 'Parasites and saprotrophs', explanation: 'A parasite feeds on a living host, while a saprotroph feeds on dead and decaying matter.', points: ['A parasite such as a tick lives on a living host and harms it.', 'A saprotroph such as bread mould feeds on dead matter.', 'Saprotrophs help recycle nutrients into the soil.'], example: 'Mould grows on old bread because it feeds on the dead bread.', analogy: 'A parasite is like a guest who never leaves and takes food from the host.', questions: ['What does a parasite feed on?', 'Why are saprotrophs useful in nature?'] },
    ],
    keyConcepts: ['Autotrophs make their own food', 'Heterotrophs depend on others for food', 'Parasites feed on living hosts; saprotrophs feed on dead matter'],
    prereqs: ['Photosynthesis in green plants', 'Food chains'],
    misconceptions: [['All plants make their own food.', 'Show a plant that is a parasite, such as Cuscuta, and ask how it gets food.'], ['Mould on bread is a plant that makes food.', 'Ask what the mould is growing on and where its food comes from.']],
    resources: ['Pictures of a tree, a goat, a tick and bread mould', 'Sorting chart with four columns', 'A magnifying glass', 'Chart paper and markers'],
    demo: 'moist bread kept in a clear bag for several days, or photos of it', demoResources: ['Moist bread in a clear bag (or photos)', 'A magnifying glass'],
    investigation: 'How do different living things get their food?', groupTask: 'sort eight organisms into autotroph, heterotroph, parasite and saprotroph and give a reason for each', driving: 'Make a poster that shows the four ways living things get food',
    story: 'a forest where a tree, a goat, a tick and mould each get food in their own way', final: 'Name one organism for each of the four modes of nutrition.',
    takeaways: ['Autotrophs make their own food.', 'Heterotrophs depend on others for food.', 'Parasites feed on living hosts and saprotrophs on dead matter.'],
    homework: { title: 'Who eats what', minutes: 10, instructions: 'Write the names of three organisms you know and say how each gets its food.' },
  }),
  'Leaves and Flowers': clpMock({
    concepts: [
      { name: 'Leaves', explanation: 'Leaves are the flat green parts of a plant that make food using sunlight, air and water.', points: ['Leaves are green because of chlorophyll.', 'They have veins that carry water and food.', 'Leaves come in many shapes and sizes.'], example: 'A mango leaf is long and pointed, while a banana leaf is very wide.', analogy: 'A leaf is like a small kitchen of the plant.', questions: ['What do leaves help a plant do?', 'Why are most leaves green?'] },
      { name: 'Flowers', explanation: 'Flowers are the colourful parts of a plant that make seeds and fruits.', points: ['Petals are the coloured parts of a flower.', 'Insects visit flowers for sweet nectar.', 'Seeds grow inside fruits that come from flowers.'], example: 'A bee visits a hibiscus flower to drink nectar.', analogy: 'A flower is like the plant’s birthday invitation to insects.', questions: ['What are the coloured parts of a flower called?', 'Why do bees visit flowers?'] },
    ],
    keyConcepts: ['Leaves make food for the plant', 'Flowers make seeds and fruits', 'Insects help flowers make seeds'],
    prereqs: ['Names of common plants', 'Roots and stems'],
    misconceptions: [['All leaves look the same.', 'Collect leaves and ask students to describe how they differ.'], ['Flowers are only for decoration.', 'Follow a flower to a fruit with pictures and ask where the seeds come from.']],
    resources: ['A few fresh leaves and flowers (or pictures)', 'A magnifying glass', 'Leaf-sorting sheet', 'Chart paper and markers'],
    demo: 'looking at a leaf and a flower with a magnifying glass', demoResources: ['Fresh leaves and a flower (or pictures)', 'A magnifying glass'],
    investigation: 'How are leaves and flowers different, and what does each do for the plant?', groupTask: 'sort six leaves by shape and label the parts of one flower', driving: 'Make a leaf-and-flower display with labels',
    story: 'a bee who visits flowers and leaves in a garden', final: 'Say one job of a leaf and one job of a flower.',
    takeaways: ['Leaves make food for the plant.', 'Flowers make seeds and fruits.', 'Bees and other insects help flowers.'],
    homework: { title: 'Leaf rubbing', minutes: 10, instructions: 'With an adult, collect a leaf, place paper over it and rub with a crayon. Write one thing you notice.' },
  }),
  'Profit and loss basics': clpMock({
    concepts: [
      { name: 'Profit', explanation: 'There is a profit when something is sold for more than it cost to buy.', points: ['Profit = selling price − cost price.', 'Selling price must be greater than cost price.', 'Profit is always a positive amount of money.'], example: 'A shop buys a pen for ₹8 and sells it for ₹10, so the profit is ₹2.', analogy: 'Profit is the extra rupees you keep after you pay back what you spent.', questions: ['What is the profit if the cost is ₹8 and the selling price is ₹10?', 'When do we make a profit?'] },
      { name: 'Loss', explanation: 'There is a loss when something is sold for less than it cost to buy.', points: ['Loss = cost price − selling price.', 'Selling price is smaller than cost price.', 'Loss is the money that is lost on the sale.'], example: 'A shop buys a bag for ₹100 and sells it for ₹90, so the loss is ₹10.', analogy: 'A loss is like a hole in your pocket: some money has gone.', questions: ['What is the loss if the cost is ₹100 and the selling price is ₹90?', 'When do we make a loss?'] },
    ],
    keyConcepts: ['Profit = selling price − cost price', 'Loss = cost price − selling price', 'Cost price and selling price are not the same'],
    prereqs: ['Subtraction up to 1000', 'Money and shopping'],
    misconceptions: [['The seller always makes a profit.', 'Show a sale below cost and ask who loses money.'], ['Profit is the selling price.', 'Show that profit is only the extra amount after subtracting the cost price.']],
    resources: ['Play money notes and coins', 'Price tags with cost and selling price', 'Profit and loss word cards', 'Chart paper and markers'],
    demo: 'a mini shop where students buy at one price and sell at another', demoResources: ['Play money notes and coins', 'Price tags with cost and selling price'],
    investigation: 'How can we tell if a shopkeeper gained or lost money on a sale?', groupTask: 'work out profit or loss for six sales using the cost price and selling price cards', driving: 'Run a class shop for ten minutes and record profit or loss for three items',
    story: 'a shopkeeper named Meena who buys fruit in the morning and sells it in the evening', final: 'A book costs ₹60 and is sold for ₹75. What is the profit?',
    takeaways: ['Profit is selling price minus cost price.', 'Loss is cost price minus selling price.', 'We compare cost price and selling price to decide.'],
    homework: { title: 'Shop at home', minutes: 10, instructions: 'With an adult, look at one item with a price tag. Pretend to buy it for ₹5 less and sell it at the tag price. Find the profit.' },
  }),
});

/* student-friendly period titles (3 to 6 words, §9): the first period on a topic uses the first title, a second period the second */
Object.entries({
  'Reading the story': ['Meet the story', 'Read and find the answers'], 'Vocabulary from the story': ['Words that make the story', 'Using our new words'],
  'Grammar: simple past tense': ['Telling what happened', 'Past tense practice'], 'Speaking: retelling the story': ['Retell it aloud', 'Speak with confidence'],
  'Writing: your own fable': ['Write your own fable', 'Polish your fable'], 'Common and proper nouns': ['Special names for things', 'Capital letters for names'],
  'Singular and plural': ['One and many', 'Plurals that surprise us'], 'Modes of nutrition': ['How living things eat', 'Four ways to get food'],
  'Leaves and Flowers': ['Leaves and flowers', 'Parts of a flower'], 'Profit and loss basics': ['Profit and loss', 'Working out gains and losses'],
  'Money and Shopping': ['Money and shopping', 'Making change'], 'Photosynthesis': ['How plants make food', 'Inputs and outputs'], 'Roots and Stems': ['Roots and stems', 'Water on the move'],
  'Living and Non-living Things': ['Living or not living?', 'Signs of life'],
}).forEach(([k, v]) => { if (DLP_KB[k]) DLP_KB[k].periodTitles = v; });

/* Sample for the preview: Grade 4 English with two chapters. Chapter 4 follows the PRD §23 reference plan (7 periods, assessment on); Nouns is a shorter chapter. */
function clpSample() {
  return { ...clpDefaults(), grade: '4', subject: 'English', minutes: 40, periods: 7, assessment: true, revision: 'auto', homework: 'optional', blooms: ['Remembering', 'Understanding', 'Applying'],
    chaptersText: 'Ch 4: The Lion and the Mouse\nCh 5: Nouns',
    chapters: [
      { key: 'the lion and the mouse', num: 4, title: 'The Lion and the Mouse', topics: ['Reading the story', 'Vocabulary from the story', 'Grammar: simple past tense', 'Speaking: retelling the story', 'Writing: your own fable'], objectives: 'Identify the characters, setting and sequence of events in the story.\nUse five new words from the story in sentences of their own.\nUse the simple past tense correctly in sentences about the story.\nRetell the story aloud in order using sequence words.\nWrite a short fable with a problem and a moral.', reference: '', fileName: '', periods: 'shared' },
      { key: 'nouns', num: 5, title: 'Nouns', topics: ['Common and proper nouns', 'Singular and plural'], objectives: 'Tell common nouns from proper nouns and begin proper nouns with a capital letter.\nWrite the singular and plural forms of common nouns, including irregular plurals.', reference: '', fileName: '', periods: '4' },
    ] };
}
