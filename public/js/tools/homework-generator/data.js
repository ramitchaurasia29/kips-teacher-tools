/* Homework generator - content. hwBuild() reuses the Assessment generator's engine (buildPaper: answers and working are always right)
   and reshapes it into ONE homework with 8 fixed sections. Replace with the real service later; the shape below is what the output screen renders. */

const HW_SECTIONS = [
  { type: 'mcq', label: 'Multiple Choice Question (Single option)' },
  { type: 'fill', label: 'Fill in the Blanks' },
  { type: 'match', label: 'Matching' },
  { type: 'tf', label: 'True False' },
  { type: 'vshort', label: 'Very Short Answer' },
  { type: 'long', label: 'Long Answer' },
  { type: 'case', label: 'Paragraph based questions' },
  { type: 'short', label: 'Short Answer' },
];
const HW_INSTRUCTION = 'Answer all questions based on your understanding of the chapter.';
/* the Question types dropdown (the order of the create modal) and the other choices */
const HW_TYPES = [['mcq', 'Multiple Choice Question (Single option)'], ['fill', 'Fill in the Blanks'], ['tf', 'True False'], ['match', 'Matching'], ['vshort', 'Very Short Answer'], ['short', 'Short Answer'], ['long', 'Long Answer'], ['case', 'Paragraph based questions']];
const HW_COUNT = [5, 100], HW_MATCH_ROWS = 3;
/* how each type is asked of buildPaper: [engine type, marks used to tell the rows apart, rows per question, marks per question] */
const HW_MAP = { mcq: ['mcq', 1, 1, 1], fill: ['fill', 1, 1, 1], tf: ['tf', 1, 1, 1], match: ['match', 1, HW_MATCH_ROWS, HW_MATCH_ROWS], vshort: ['short', 2, 1, 2], short: ['short', 3, 1, 3], long: ['short', 4, 1, 4], case: ['short', 5, 2, 5] };

function hwBuild(form) {
  const chosen = form.types.length ? HW_TYPES.map(t => t[0]).filter(t => form.types.includes(t)) : HW_TYPES.map(t => t[0]);
  const share = largestRemainder(chosen.map(() => 1), +form.count || 20), per = {};
  chosen.forEach((t, i) => { if (share[i] > 0) per[t] = share[i]; });
  const kinds = Object.keys(per);
  const paper = buildPaper({ grade: form.grade, subject: form.subject, assessment: 'Other', otherName: 'Homework', school: '', time: 30, chapters: form.chapters, topics: form.topics,
    uploadedChapters: form.uploadedChapters, rows: kinds.map(t => ({ type: HW_MAP[t][0], count: per[t] * HW_MAP[t][2], marks: HW_MAP[t][1] })), difficulty: form.difficulty || 'Mixed', blooms: form.blooms || [], diagramPercent: 0 });
  const find = t => paper.sections.find(s => s.type === HW_MAP[t][0] && s.marks_each === HW_MAP[t][1]).questions;
  const maths = agIsMaths(form.subject), r = rngFrom(paper.metadata.seed);
  const text = s => String(s || '').replace(/\n+/g, ' ').trim();
  const stem = s => String(s || '').replace(/^Explain in a sentence\.\s*/, '');
  const sections = [];
  const label = t => HW_SECTIONS.find(x => x.type === t);
  const add = (t, items) => { sections.push({ ...label(t), items }); };
  const made = {
    mcq: () => find('mcq').map(q => ({ text: q.text, options: q.options.slice(), ans: q.answer_option - 1 })),
    fill: () => find('fill').map(q => ({ text: q.text, ans: q.answer })),
    tf: () => find('tf').map(q => ({ text: q.text, ans: q.answer === 'True' ? 0 : 1 })),
    match: () => { const ms = find('match'), out = [];   // one table of 3 pairs per question; Column B is shuffled inside it
      for (let g = 0; g < ms.length; g += HW_MATCH_ROWS) { const part = ms.slice(g, g + HW_MATCH_ROWS), right = shuffle(r, part.map(q => q.answer));
        out.push({ text: 'Match the items in Column A with their correct matches in Column B.', headA: 'Column A', headB: 'Column B', left: part.map(q => q.text), right, key: part.map(q => right.indexOf(q.answer)) }); }
      return out; },
    vshort: () => find('vshort').map(q => ({ text: stem(q.text), ans: text(q.answer), lines: 1 })),
    short: () => find('short').map(q => ({ text: stem(q.text), ans: text(q.answer), lines: 3 })),
    long: () => find('long').map(q => ({ text: stem(q.text), ans: uniq([text(q.answer), text(q.solution)].filter(Boolean)).join('. '), lines: 6 })),
    case: () => { const cs = find('case'), out = [];   // a passage and two questions about it
      for (let g = 0; g + 1 < cs.length; g += 2) { const c = cs.slice(g, g + 2);
        out.push(maths
          ? { passage: stem(c[0].text), subs: [{ text: 'Solve the problem. Show your working.', ans: `${text(c[0].answer)}. ${text(c[0].solution)}`, lines: 2 }, { text: stem(c[1].text), ans: text(c[1].answer), lines: 2 }] }
          : { passage: uniq(c.map(q => text(q.solution))).join(' '), subs: c.map(q => ({ text: stem(q.text), ans: text(q.answer), lines: 2 })) }); }
      return out; },
  };
  HW_SECTIONS.forEach(s => { if (per[s.type]) add(s.type, made[s.type]()); });

  const m = paper.metadata, chs = agChapters(form.grade, form.subject).filter(c => form.chapters.includes(c.id));
  const info = { chapters: chs.map(c => c.title), topics: chs.flatMap(c => c.topics.filter(t => form.topics.includes(t.id)).map(t => t.title)),
    blooms: form.blooms && form.blooms.length ? form.blooms.slice() : ['Mixed'], difficulty: form.difficulty || 'Mixed', questions: sections.reduce((n, x) => n + x.items.length, 0), types: sections.map(x => x.label) };
  return { id: 'hw' + m.seed, title: 'Homework', instruction: HW_INSTRUCTION, meta: { class: String(form.grade), subject: form.subject, date: '' }, info, sections, chapters: paper.chapters.map(c => c.title) };
}

const hwGet = (o, path) => { const ks = path.split('.'), last = ks.pop(), host = ks.reduce((a, k) => a?.[k], o); return HW_VIRTUAL[last] ? HW_VIRTUAL[last].get(host) : host?.[last]; };
const hwSet = (o, path, v) => { const ks = path.split('.'), last = ks.pop(), host = ks.reduce((a, k) => a[k], o); HW_VIRTUAL[last] ? HW_VIRTUAL[last].set(host, v) : host[last] = v; };

/* two answers are edited as text but stored as an option number: path ends in ansL (MCQ letter A-D) or ansTF (True / False) */
const HW_VIRTUAL = {
  ansL: { get: o => 'ABCD'[o.ans], set: (o, v) => { const k = 'ABCD'.indexOf(String(v).trim()[0]?.toUpperCase()); if (k >= 0 && k < o.options.length) o.ans = k; } },
  ansTF: { get: o => ['True', 'False'][o.ans], set: (o, v) => { const c = String(v).trim()[0]?.toLowerCase(); if (c === 't') o.ans = 0; else if (c === 'f') o.ans = 1; } },
};
