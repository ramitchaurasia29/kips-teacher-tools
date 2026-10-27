/* Practice test - content. ptBuild() reuses the Assessment generator's engine (buildPaper: answers and working are always right)
   and reshapes it into ONE practice test with 3 fixed sections: A long answer (3 marks), B short answer (2 marks), C MCQ (1 mark).
   Replace with the real service later; the shape below is what the output screen renders. */

const PT_SECTIONS = [
  { letter: 'A', type: 'long', label: 'Long Answer', tag: 'Long Answer', marks: 3, lines: 5 },
  { letter: 'B', type: 'short', label: 'Short Answer', tag: 'Short Answer', marks: 2, lines: 3 },
  { letter: 'C', type: 'mcq', label: 'MCQ', tag: 'MCQ', marks: 1, lines: 0 },
];
/* rows handed to buildPaper: [type, count, marks]. Long and short answer are both "short" rows told apart by their marks. */
const PT_ROWS = [['short', 4, 3], ['short', 6, 2], ['mcq', 6, 1]];

function ptBuild(form) {
  const paper = buildPaper({ grade: form.grade, subject: form.subject, assessment: 'Other', otherName: 'Practice test', school: '', time: 40, chapters: form.chapters, topics: form.topics,
    uploadedChapters: form.uploadedChapters, rows: PT_ROWS.map(([type, count, marks]) => ({ type, count, marks })), difficulty: 'Mixed', blooms: [], diagramPercent: 0 });
  const find = (type, marks) => paper.sections.find(s => s.type === type && (marks == null || s.marks_each === marks)).questions;
  const maths = agIsMaths(form.subject);
  const text = s => String(s || '').replace(/\n+/g, ' ').trim();
  const stem = s => String(s || '').replace(/^Explain in a sentence\.\s*/, '');
  const meta = q => ({ bloom: q.bloom, difficulty: q.difficulty });
  const written = (q, sec) => ({ text: stem(q.text), ans: maths && sec.marks > 2 ? uniq([text(q.answer), text(q.solution)].filter(Boolean)).join('. ') : text(q.answer), lines: sec.lines, ...meta(q) });

  const sections = PT_SECTIONS.map(sec => {
    const qs = find(sec.type === 'mcq' ? 'mcq' : 'short', sec.marks);
    const items = sec.type === 'mcq' ? qs.map(q => ({ text: q.text, options: q.options.slice(), ans: q.answer_option - 1, ...meta(q) })) : qs.map(q => written(q, sec));
    return { ...sec, items };
  });

  const total = sections.reduce((n, s) => n + s.items.length * s.marks, 0);
  return { id: 'pt' + paper.metadata.seed, title: 'Practice Test', meta: { class: String(form.grade), subject: form.subject, date: '', marks: String(total), time: '' }, sections, chapters: paper.chapters.map(c => c.title), topics: paper.chapters.flatMap(c => c.topics.map(t => t.title)) };
}

const ptGet = (o, path) => { const ks = path.split('.'), last = ks.pop(), host = ks.reduce((a, k) => a?.[k], o); return PT_VIRTUAL[last] ? PT_VIRTUAL[last].get(host) : host?.[last]; };
const ptSet = (o, path, v) => { const ks = path.split('.'), last = ks.pop(), host = ks.reduce((a, k) => a[k], o); PT_VIRTUAL[last] ? PT_VIRTUAL[last].set(host, v) : host[last] = v; };

/* the MCQ answer is edited as a letter but stored as an option number: path ends in ansL (A-D) */
const PT_VIRTUAL = {
  ansL: { get: o => 'ABCD'[o.ans], set: (o, v) => { const k = 'ABCD'.indexOf(String(v).trim()[0]?.toUpperCase()); if (k >= 0 && k < o.options.length) o.ans = k; } },
};
