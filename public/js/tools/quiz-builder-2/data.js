/* Quiz Builder 2.0 - catalogue + content. qb2Build() is a stand-in for the real generation service; the document shape below is what the output screen renders:
   { id, title, subject, grade, school, difficulty, chapter, topics[], questions[] }
   question: { id, number, type, bloom, marks, text, figure?, options?, correct?, items?, colA?, colB?, passage?, statement?, instruction?, assertion?, reason?, subs?, ans[], explanation } */

const QB2_TYPES = [['mcq', 'MCQ'], ['tf', 'True / False'], ['fill', 'Fill in the Blank'], ['ar', 'Assertion & Reason'], ['case', 'Case Study'], ['long', 'Long Answer'], ['ordering', 'Ordering'], ['match', 'Match the Following'], ['error', 'Error Correction']];
const QB2_DIFFS = ['Beginner', 'Intermediate', 'Advanced'];
const QB2_BLOOMS = ['Remember', 'Understand', 'Apply', 'Analyse', 'Evaluate', 'Create'];
const QB2_MARKS = { mcq: 1, tf: 1, fill: 1, ar: 2, case: 2, long: 5, ordering: 3, match: 2, error: 3 };
const QB2_LINES = { long: 5, error: 2 };   // answer lines printed in the Student view
const QB2_DIAGRAM_TYPES = ['fill', 'case', 'long', 'error'];   // types that can carry a figure

/* ---------- Catalogue: book > chapter > topic (the Assignment generator's books plus a Class 3 Mathematics book) ---------- */
const QB2_BOOKS = [
  { id: 'q3m', title: 'Class 3 Mathematics – KIPS', grade: 3, subject: 'Mathematics', board: 'KIPS', chapters: [
    { id: 'c1', title: 'Addition', topics: [{ id: 'q_intro', title: 'Introduction' }, { id: 'q_add', title: 'Addition' }, { id: 'q_add3', title: 'Addition of 3-digit Numbers' }, { id: 'q_add4', title: 'Addition of 4-digit Numbers' }, { id: 'q_est', title: 'Estimating the Sum' }, { id: 'q_prob', title: 'Problem Solving' }] },
    { id: 'c2', title: 'Subtraction', topics: [{ id: 'q_sub', title: 'Subtraction' }, { id: 'q_sub3', title: 'Subtraction of 3-digit Numbers' }, { id: 'q_subw', title: 'Subtraction Word Problems' }] }] },
  ...ASG_BOOKS.filter(b => !b.noSource).map(b => ({ id: b.id, title: b.title, grade: b.grade, subject: b.subject, board: b.board,
    chapters: b.chapters.map(c => ({ id: c.id, title: c.title, topics: c.topics.map(t => ({ id: t.id, title: t.title })) })) })),
];
const qb2Book = id => QB2_BOOKS.find(b => b.id === id);
const qb2Books = () => QB2_BOOKS.map(b => ({ id: b.id, grade: b.grade, subject: b.subject, title: b.title, board: b.board }));
const qb2Sample = () => ({ ...qb2Defaults(), bookId: 'q3m', chapterId: 'c1', topics: ['q_add', 'q_add3', 'q_add4'], blooms: ['Remember', 'Understand'] });

/* ---------- Small helpers ---------- */
function qb2Rng(seed) { let s = (seed >>> 0) || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
const qb2Marks = n => `${n} mark${n === 1 ? '' : 's'}`;
const qb2Plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

/* place-value table for a + b */
function qb2Table(a, b, title, caption, extra) {
  const heads = { 2: ['T', 'O'], 3: ['H', 'T', 'O'], 4: ['Th', 'H', 'T', 'O'] }, d = Math.max(String(a).length, String(b).length, 2), pad = n => String(n).padStart(d, ' ').split('').map(x => x.trim());
  return { kind: 'table', title, caption, headers: heads[Math.min(d, 4)], rows: [pad(a), pad(b), ...(extra ? [extra] : [])] };
}

/* ---------- Question writers ---------- */
/* Mathematics - addition chapters: real numbers, real working */
function qb2MathQ(type, c) {
  const { ri, digits, k, diag } = c, num = d => ri(10 ** (d - 1), 10 ** d - 1), L = 'ABCD';
  const a = num(digits), b = num(digits), s = a + b;
  const why = (x, y) => `Add the digits column by column, starting from the ones, and regroup whenever a column makes 10 or more. So ${x} + ${y} = ${x + y}.`;
  if (type === 'mcq') {
    const v = k % 3, W = (right, wrong, text, explanation) => { const at = (k + 1) % 4, options = wrong.map(String); options.splice(at, 0, String(right)); return { text, options, correct: at, ans: [], explanation }; };
    if (v === 0) return W(s, [s + 10, s - 1, s + 1], `What is the sum of ${a} and ${b}?`, why(a, b));
    if (v === 1) return W('It gives the successor of the number.', ['It gives the previous number.', 'It makes the number zero.', 'It doubles the number.'], 'Which of the following statements is true about adding 1 to a number?', 'Adding 1 to a number gives us the successor of the number.');
    return W(a, [0, a + 1, a - 1], `What is the sum of ${a} and 0?`, 'When we add 0 to a number, we get the same number as the sum.');
  }
  if (type === 'tf') {
    const P = [['Changing the order of numbers being added changes the sum.', false, 'According to the commutative property, even if the order of numbers being added is changed, the sum remains the same. For example, 5 + 3 = 8 and 3 + 5 = 8.'],
      ['When adding 3-digit numbers, if the sum of the ones column is 10 or more, we regroup to the tens column.', true, 'This is the definition of regrouping (carrying over) in addition. If the sum of a place value column is 10 or more, we carry over to the next higher place value.'],
      ['Adding 0 to a number gives 0.', false, 'Adding 0 to any number leaves the number unchanged, so the sum is the number itself.'],
      ['The sum of two 3-digit numbers can be a 4-digit number.', true, `For example, 900 + 200 = 1100, which has four digits.`]][k % 4];
    return { text: 'True or False: ' + P[0], ans: [String(P[1])], explanation: P[2] };
  }
  if (type === 'fill') {
    if (diag) { const st = ri(8, 14), f = st + ri(1, 3), t = f + ri(2, 4);
      return { text: `Look at the number line. What number should be in the blank to complete the addition? ${f} + ________ = ${t}`, figure: { kind: 'numberline', title: 'Addition on Number Line', caption: 'Number Line Addition', start: st, end: st + 10, from: f, to: t }, ans: [String(t - f)], explanation: `The number line shows a jump from ${f} to ${t}. The difference between ${t} and ${f} is ${t - f}, so ${t - f} should be in the blank.` }; }
    return { text: k % 2 ? `Fill in the blank: ${a} + ________ = ${s}` : `Fill in the blank: ${a} + ${b} = ________`, ans: [String(k % 2 ? b : s)], explanation: why(a, b) };
  }
  if (type === 'ordering') {
    const x = ri(2, 12), y = ri(2, 9), z = ri(2, 9), sum = x + y + z, steps = [`Add ${x} and ${y} first, then add ${z}`, `Add ${y} and ${z} first, then add ${x}`, `The final sum is ${sum}`];
    return { text: `Arrange the steps to show the associative property of addition for ${x} + ${y} + ${z}.`, items: [steps[2], steps[0], steps[1]], ans: steps, explanation: `The associative property states that when adding three or more numbers, the way the numbers are grouped does not affect the sum. So, (${x} + ${y}) + ${z} = ${x + y} + ${z} = ${sum} and ${x} + (${y} + ${z}) = ${x} + ${y + z} = ${sum}. Both groupings result in the same sum.` };
  }
  if (type === 'error') {
    const wrong = k % 2 ? s + 10 : a;
    return { text: `Find and correct the error in the following addition problem${diag ? ' shown in the table' : ''}.`, figure: diag ? { kind: 'table', title: 'Addition Problem', caption: 'Addition Problem', headers: ['Number 1', 'Number 2', 'Sum'], rows: [[String(a), String(b), String(wrong)]] } : null,
      statement: `The sum of ${a} and ${b} is ${wrong}.`, instruction: 'Identify the incorrect sum and provide the correct sum.', ans: [`The sum of ${a} and ${b} is ${s}.`], explanation: `The sum of ${a} and ${b} is found by adding the numbers together, which equals ${s}, not ${wrong}.` };
  }
  if (type === 'match') {
    const pairs = [['5 + 0 = 5', 'Identity Property of Addition'], ['7 + 3 = 3 + 7', 'Commutative Property'], ['(2 + 4) + 1 = 2 + (4 + 1)', 'Associative Property']];
    return { text: 'Match the addition fact with its property.', colA: pairs.map(p => p[0]), colB: [pairs[1][1], pairs[0][1], pairs[2][1]], ans: pairs.map(p => `${p[0]}  →  ${p[1]}`),
      explanation: 'The Identity Property of Addition states that adding zero to any number results in the same number. The Commutative Property states that changing the order of addends does not change the sum. The Associative Property states that the grouping of addends does not change the sum.' };
  }
  if (type === 'case') {
    const o = (a % 10) + (b % 10), t = Math.floor(a / 10) % 10 + Math.floor(b / 10) % 10 + (o >= 10 ? 1 : 0), opts = [o, o - 2, o + 2, o + 5].map(String), at = (k + 1) % 4, rest = opts.slice(1); rest.splice(at, 0, opts[0]);
    return { text: `${diag ? 'Look at the diagram. ' : ''}Read the following addition problem and answer the questions.`, figure: diag ? qb2Table(a, b, `Add ${a} and ${b}`, 'Addition Problem') : null, passage: `A student is asked to add the numbers ${a} and ${b}.`,
      subs: [{ type: 'mcq', marks: 1, text: 'What is the sum of the digits in the ones column?', options: rest, correct: at, ans: [], explanation: '' },
        { type: 'tf', marks: 1, text: 'Is regrouping needed when adding the tens column?', ans: [String(t >= 10)], explanation: '' }], ans: [], explanation: '' };
  }
  if (type === 'ar') {
    const P = [['When adding 3-digit numbers, if the sum of the hundreds column is 10 or more, we carry over to the thousands column.', 'This process is called regrouping.', 'Both statements are true. Regrouping is the process of carrying over a group of ten from one place value to the next higher place value. When the sum of hundreds is 10 or more, it forms a thousand, which is carried over to the thousands column.'],
      ['Adding zero to a number does not change the number.', 'Zero is the identity element of addition.', 'Both statements are true. Zero is called the identity of addition because adding it to any number leaves that number unchanged.']][k % 2];
    return { text: '', assertion: P[0], reason: P[1], options: AR_OPTS(), correct: 0, ans: [], explanation: P[2] };
  }
  /* long */
  return { text: `Explain the steps to add ${a} and ${b} using regrouping.${diag ? ' Use the provided image to illustrate your explanation.' : ''}`, figure: diag ? qb2Table(a, b, `Add ${a} and ${b}`, 'Addition Problem') : null,
    ans: ['Step 1: Write the numbers one below the other, matching place values.', 'Step 2: Add the ones. If the sum is 10 or more, write the ones digit and carry 1 to the tens.', 'Step 3: Add the tens, including any carry, and regroup again if needed.', 'Step 4: Add the hundreds (and thousands) in the same way.', `Step 5: Read the answer: ${a} + ${b} = ${s}.`], explanation: '' };
}
const AR_OPTS = () => ['Both A and R are true and R is the correct explanation of A', 'Both A and R are true but R is not the correct explanation of A', 'A is true but R is false', 'A is false but R is true'];

/* Any other subject: topic-based questions built from the chapter and topic names */
function qb2GenericQ(type, c) {
  const { topic, chapter, subject, k, diag, ri } = c, t = topic, T = t.toLowerCase();
  if (type === 'mcq') { const at = (k + 1) % 4, o = [`It is a key idea in the chapter “${chapter}”.`, `It is not part of ${subject}.`, `It is only used outside the classroom.`]; o.splice(at, 0, `It is studied under ${t} in ${subject}.`); return { text: `Which of the following is true about ${T}?`, options: o, correct: at, ans: [], explanation: `${t} is a topic of the chapter “${chapter}”, so the statement that links it to the chapter is correct.` }; }
  if (type === 'tf') return { text: `True or False: ${t} is part of the chapter “${chapter}”.`, ans: ['true'], explanation: `${t} is one of the topics covered in “${chapter}”.` };
  if (type === 'fill') return { text: `The topic ________ is part of the chapter “${chapter}”.`, ans: [t], explanation: `${t} is studied in “${chapter}”.` };
  if (type === 'ordering') { const s = [`Read the topic ${t}`, 'Note down the key terms', `Answer the questions on ${T}`]; return { text: `Arrange the steps to study ${T} in the correct order.`, items: [s[2], s[0], s[1]], ans: s, explanation: 'First read, then note the key terms, then practise with questions.' }; }
  if (type === 'error') return { text: 'Find and correct the error in the statement below.', figure: null, statement: `${t} has nothing to do with the chapter “${chapter}”.`, instruction: 'Identify the incorrect part and correct it.', ans: [`${t} is a topic of the chapter “${chapter}”.`], explanation: `${t} is studied within “${chapter}”.` };
  if (type === 'match') { const ts = c.topics.slice(0, 3); while (ts.length < 3) ts.push(`${t} (part ${ts.length + 1})`); const defs = ['Studied first in the chapter', 'Builds on the first idea', 'Used to apply the ideas']; return { text: 'Match each topic with how it is used in the chapter.', colA: ts, colB: [defs[1], defs[2], defs[0]], ans: ts.map((x, i) => `${x}  →  ${defs[i]}`), explanation: `Each topic of “${chapter}” has its own place in how the chapter builds up.` }; }
  if (type === 'case') return { text: `${diag ? 'Look at the diagram. ' : ''}Read the following situation and answer the questions.`, figure: diag ? { kind: 'table', title: t, caption: `${t} – overview`, headers: ['Chapter', 'Topic'], rows: [[chapter, t]] } : null, passage: `A class is revising ${T} from the chapter “${chapter}”.`,
    subs: [{ type: 'mcq', marks: 1, text: 'Which chapter is the class revising?', options: [chapter, 'Another chapter', 'None of these', 'All chapters'], correct: 0, ans: [], explanation: '' }, { type: 'tf', marks: 1, text: `The class is revising ${T}.`, ans: ['true'], explanation: '' }], ans: [], explanation: '' };
  if (type === 'ar') return { text: '', assertion: `${t} is a topic of the chapter “${chapter}”.`, reason: `The chapter “${chapter}” covers ${T}.`, options: AR_OPTS(), correct: 0, ans: [], explanation: 'Both statements are true, and the reason explains why the assertion holds.' };
  return { text: `Explain ${T} in your own words, with examples from the chapter “${chapter}”.${diag ? ' Use the provided image to illustrate your explanation.' : ''}`, figure: diag ? { kind: 'table', title: t, caption: `${t} – overview`, headers: ['Chapter', 'Topic'], rows: [[chapter, t]] } : null,
    ans: [`State what ${T} means.`, 'Give one or two examples from the textbook.', 'Link the idea to the chapter.'], explanation: '' };
}

/* ---------- Build the quiz ---------- */
function qb2Build(form, seed) {
  const b = qb2Book(form.bookId), chap = b.chapters.find(c => c.id === form.chapterId), topics = chap.topics.filter(t => form.topics.includes(t.id));
  const r = qb2Rng(seed ?? (Date.now() % 1e9)), ri = (x, y) => x + Math.floor(r() * (y - x + 1));
  const math = b.subject === 'Mathematics' && /add/i.test(chap.title), n = Math.max(1, Math.min(50, +form.count || 20));
  const order = QB2_TYPES.map(t => t[0]).filter(t => form.types.includes(t)), others = order.filter(t => t !== 'mcq');
  /* the type of every slot: MCQ is the most common when it is chosen, the rest rotate */
  let o = 0; const slots = Array.from({ length: n }, (_, i) => order.includes('mcq') && (!others.length || i % 5 === 0 || i % 5 === 3) ? 'mcq' : others[o++ % others.length]);
  /* diagram-based questions: spread evenly over the types that can carry a figure */
  const capable = slots.map((t, i) => QB2_DIAGRAM_TYPES.includes(t) ? i : -1).filter(i => i >= 0), want = Math.min(capable.length, Math.round(n * (+form.diagramPct || 0) / 100));
  const diagAt = new Set(Array.from({ length: want }, (_, j) => capable[Math.floor(j * capable.length / want)]));
  const blooms = (form.blooms.length ? QB2_BLOOMS.filter(x => form.blooms.includes(x)) : ['Remember', 'Understand']);
  const bl = i => blooms.length === 2 && !form.blooms.length ? (i % 4 === 0 ? 'Remember' : 'Understand') : blooms[i % blooms.length];
  const used = {}, questions = slots.map((type, i) => {
    const topic = topics[i % topics.length], k = used[type] = (used[type] ?? -1) + 1;
    const digits = /4-digit/i.test(topic.title) ? 4 : /3-digit/i.test(topic.title) ? 3 : 2;
    const c = { ri, digits, k, diag: diagAt.has(i), topic: topic.title, topics: topics.map(t => t.title), chapter: chap.title, subject: b.subject };
    const q = (math ? qb2MathQ : qb2GenericQ)(type, c);
    const marks = q.subs ? q.subs.reduce((a, s) => a + s.marks, 0) : QB2_MARKS[type];
    return { id: 'q' + (i + 1), number: i + 1, type, bloom: bl(i), marks, figure: null, lines: QB2_LINES[type] || 0, ...q };
  });
  const total = questions.reduce((n, q) => n + q.marks, 0);
  return { id: 'quiz-' + Date.now(), total_marks: total, time: Math.max(5, Math.round(total * 1.5 / 5) * 5) + ' min', title: `${b.subject} (Grade ${b.grade}) · ${qb2Plural(topics.length, 'Topic')}`, subject: b.subject, grade: b.grade, school: form.school.trim(), difficulty: form.difficulty, chapter: chap.title, topics: topics.map(t => t.title), blooms: QB2_BLOOMS.filter(x => form.blooms.includes(x)), types: order, questions };
}
