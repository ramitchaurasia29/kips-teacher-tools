/* Worksheet generator 2.0 - content. wsBuild() reuses the Assessment generator's engine (buildPaper: answers and working are always right)
   and reshapes it into ONE worksheet with 8 fixed sections. Replace with the real service later; the shape below is what the output screen renders. */

const WS_SECTIONS = [
  { type: 'mcq', label: 'MCQ', instruction: 'Choose the correct answer.' },
  { type: 'tf', label: 'True or False', instruction: 'Read each statement and choose True or False.' },
  { type: 'fill', label: 'Fill in the Blanks', instruction: 'Complete the sentences with the correct words.' },
  { type: 'short', label: 'Short Answer', instruction: 'Answer the following questions in one or two sentences.' },
  { type: 'long', label: 'Long Answer', instruction: 'Answer the following questions in detail.' },
  { type: 'case', label: 'Case Study', instruction: 'Read the passage and answer the questions that follow.' },
  { type: 'diagram', label: 'Diagram-Based', instruction: 'Look at the diagram and answer the question.' },
  { type: 'match', label: 'Matching', instruction: 'Match the items in Column A with their correct matches in Column B.' },
];
/* the input's "Question Formats" chips: [id, label]. Only the chosen ones become sections (in the order of WS_SECTIONS). */
const WS_FORMATS = [['mcq', 'Multiple Choice'], ['tf', 'True/False'], ['fill', 'Fill-in-the-blanks'], ['short', 'Short Answer'], ['long', 'Long Answer'], ['case', 'Case Study'], ['diagram', 'Diagram Based'], ['match', 'Matching']];
const WS_DIFFS = ['Easy', 'Medium', 'Hard'];
const WS_BLOOMS = ['Remember', 'Understand', 'Apply', 'Analyse', 'Evaluate', 'Create'];
/* rows handed to buildPaper: [type, count, marks]. Short, long and case study are all "short" rows told apart by their marks. */
const WS_ROWS = { mcq: ['mcq', 5, 1], tf: ['tf', 3, 1], fill: ['fill', 5, 1], short: ['short', 3, 2], long: ['short', 3, 4], case: ['short', 3, 3], diagram: ['diagram', 1, 2], match: ['match', 8, 1] };
const WS_MARKS = { mcq: 5, tf: 3, fill: 5, short: 6, long: 12, case: 6, diagram: 2 };   // marks a section adds to the worksheet (matching: one per pair)
const wsFmtDate = iso => iso ? new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
const wsChapter = f => agChapters(f.grade, f.subject).find(c => c.id === f.chapterId);

function wsBuild(form) {
  const chosen = WS_SECTIONS.filter(s => form.formats.includes(s.type)).map(s => s.type);
  const paper = buildPaper({ grade: form.grade, subject: form.subject, assessment: 'Other', otherName: 'Worksheet', school: '', time: 40, chapters: [form.chapterId], topics: form.topics,
    uploadedChapters: form.fileName ? [form.chapterId] : [], rows: chosen.map(t => { const [type, count, marks] = WS_ROWS[t]; return { type, count, marks }; }), difficulty: form.difficulty || 'Mixed', blooms: form.blooms.slice(), diagramPercent: 0 });
  const find = (type, marks) => paper.sections.find(s => s.type === type && (marks == null || s.marks_each === marks))?.questions || [];
  const maths = agIsMaths(form.subject), r = rngFrom(paper.metadata.seed);
  const text = s => String(s || '').replace(/\n+/g, ' ').trim();
  const stem = s => String(s || '').replace(/^Explain in a sentence\.\s*/, '');   // the engine's short-answer lead-in; the section instruction already says it
  const built = {
    mcq: () => find('mcq').map(q => ({ text: q.text, options: q.options.slice(), ans: q.answer_option - 1 })),
    tf: () => find('tf').map(q => ({ text: q.text, ans: q.answer === 'True' ? 0 : 1 })),
    fill: () => find('fill').map(q => ({ text: q.text, ans: q.answer })),
    short: () => find('short', 2).map(q => ({ text: stem(q.text), ans: text(q.answer), lines: 2 })),
    long: () => find('short', 4).map(q => ({ text: stem(q.text), ans: uniq([text(q.answer), text(q.solution)].filter(Boolean)).join('. '), lines: 5 })),
    case: () => { const cs = find('short', 3);   // case study: a passage and two questions about it
      return [maths
        ? { passage: stem(cs[0].text), subs: [{ text: 'Solve the problem. Show your working.', ans: `${text(cs[0].answer)}. ${text(cs[0].solution)}`, lines: 2 }, { text: stem(cs[1].text), ans: text(cs[1].answer), lines: 2 }] }
        : { passage: uniq(cs.map(q => text(q.solution))).join(' '), subs: cs.map(q => ({ text: stem(q.text), ans: text(q.answer), lines: 2 })) }]; },
    diagram: () => { const d = find('diagram')[0]; return [{ text: d.text, ans: text(d.answer), diagram: d.diagram, box: true }]; },
    match: () => { const ms = find('match'), groups = [];   // groups of 4, each with its own headers; Column B is shuffled inside the group
      for (let g = 0; g < ms.length; g += 4) {
        const part = ms.slice(g, g + 4), right = shuffle(r, part.map(q => q.answer));
        groups.push({ headA: 'Column A (Term)', headB: 'Column B (Match)', left: part.map(q => q.text), right, key: part.map(q => right.indexOf(q.answer)) });
      }
      return groups; },
  };
  let marks = 0;
  const sections = chosen.map(t => { const items = built[t](); marks += t === 'match' ? items.reduce((n, g) => n + g.left.length, 0) : WS_MARKS[t]; return { ...WS_SECTIONS.find(s => s.type === t), items }; });

  const ch = wsChapter(form), tps = ch.topics.filter(t => form.topics.includes(t.id)).map(t => t.title);
  const info = { textbook: form.subject, grade: 'Grade ' + form.grade, chapter: ch.title, topics: tps.join(', '), date: wsFmtDate(form.dueDate), difficulty: form.difficulty || 'Mixed',
    formats: chosen.map(t => WS_FORMATS.find(f => f[0] === t)[1]).join(', '), blooms: form.blooms.join(', '), rubric: form.rubric ? 'Yes' : 'No', reference: form.fileName };
  return { id: 'ws' + paper.metadata.seed, title: 'Worksheet', meta: { class: String(form.grade), subject: form.subject, time: '40', marks: String(marks) }, info, sections };
}

const wsGet = (o, path) => { const ks = path.split('.'), last = ks.pop(), host = ks.reduce((a, k) => a?.[k], o); return WS_VIRTUAL[last] ? WS_VIRTUAL[last].get(host) : host?.[last]; };
const wsSet = (o, path, v) => { const ks = path.split('.'), last = ks.pop(), host = ks.reduce((a, k) => a[k], o); WS_VIRTUAL[last] ? WS_VIRTUAL[last].set(host, v) : host[last] = v; };

/* two answers are edited as text but stored as an option number: path ends in ansL (MCQ letter A-D) or ansTF (True / False) */
const WS_VIRTUAL = {
  ansL: { get: o => 'ABCD'[o.ans], set: (o, v) => { const k = 'ABCD'.indexOf(String(v).trim()[0]?.toUpperCase()); if (k >= 0 && k < o.options.length) o.ans = k; } },
  ansTF: { get: o => ['True', 'False'][o.ans], set: (o, v) => { const c = String(v).trim()[0]?.toLowerCase(); if (c === 't') o.ans = 0; else if (c === 'f') o.ans = 1; } },
};
