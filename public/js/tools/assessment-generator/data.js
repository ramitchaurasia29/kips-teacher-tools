/* =========================================================
   Assessment generator - catalogue + generation engine
   Follows PRD v2.0: §5 inputs, §6 total marks, §7-§9 blueprint/allocation,
   §8 question types, §11 paper JSON, §14 validation.
   buildPaper() is a local mock of the LLM pipeline (§12); swap it for the real service.
   ========================================================= */

/* ---------- Inputs (§5) ---------- */
const AG_GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const agSubjects = g => g <= 5 ? ['English', 'Maths', 'EVS', 'Hindi'] : ['English', 'Mathematics', 'Science', 'Social Science', 'Hindi'];
const agIsMaths = s => s === 'Maths' || s === 'Mathematics';
const agIsLang = s => s === 'English' || s === 'Hindi';

/* §8 question types. `only` limits a type to a subject group. rank = section order (§9). */
const AG_TYPES = [
  { id: 'mcq', label: 'MCQ (tick the correct option)', rank: 0, instruction: 'Tick (✓) the correct option.' },
  { id: 'fill', label: 'Fill in the blanks', rank: 1, instruction: 'Fill in the blanks.' },
  { id: 'tf', label: 'True/false', rank: 2, instruction: 'Write True or False.' },
  { id: 'match', label: 'Match the following', rank: 3, instruction: 'Match the following.' },
  { id: 'oneword', label: 'One-word answer', rank: 4, instruction: 'Answer in one word.' },
  { id: 'picture', label: 'Picture-based', rank: 5, instruction: 'Look at the picture and answer.' },
  { id: 'diagram', label: 'Image/diagram-based', rank: 6, instruction: 'Look at the diagram and answer.' },
  { id: 'word_skills', label: 'Word skills', rank: 7, only: 'lang', instruction: 'Do as directed.' },
  { id: 'short', label: 'Short answer', rank: 8, instruction: 'Answer the following questions.' },
  { id: 'story', label: 'Story sums / word problems', rank: 9, only: 'maths', instruction: 'Solve the story sums.' },
  { id: 'long', label: 'Long answer', rank: 10, instruction: 'Answer in detail.' },
  { id: 'creative', label: 'Creative writing', rank: 11, only: 'lang', instruction: 'Write on the following.' },
];
const agType = id => AG_TYPES.find(t => t.id === id);
const agTypesFor = subject => AG_TYPES.filter(t => !t.only || (t.only === 'maths' && agIsMaths(subject)) || (t.only === 'lang' && agIsLang(subject)));

/* §5 #4 and §6 suggested blueprints */
const AG_ASSESSMENTS = [
  { id: 'Monthly Test', title: 'Monthly Test', family: 'Monthly Test', rows: [['mcq', 5, 1], ['fill', 5, 1], ['diagram', 1, 2], ['short', 4, 2]], time: 30 },
  { id: 'Unit Test', title: 'Unit Test', family: 'Unit Test', rows: [['mcq', 5, 1], ['fill', 5, 1], ['diagram', 1, 2], ['short', 4, 2]], time: 30 },
  { id: 'FA 1', title: 'Formative Assessment 1', family: 'FA', rows: [['mcq', 6, 1], ['fill', 4, 1], ['match', 3, 1], ['short', 6, 2]], time: 40 },
  { id: 'FA 2', title: 'Formative Assessment 2', family: 'FA', rows: [['mcq', 6, 1], ['fill', 4, 1], ['match', 3, 1], ['short', 6, 2]], time: 40 },
  { id: 'SA 1', title: 'Summative Assessment 1', family: 'SA', rows: [['mcq', 6, 1], ['fill', 6, 1], ['match', 4, 1], ['tf', 5, 1], ['short', 13, 2], ['long', 1, 3]], time: 90 },
  { id: 'SA 2', title: 'Summative Assessment 2', family: 'SA', rows: [['mcq', 6, 1], ['fill', 6, 1], ['match', 4, 1], ['tf', 5, 1], ['short', 13, 2], ['long', 1, 3]], time: 90 },
  { id: 'Term 1', title: 'Term 1', family: 'Term 1', rows: [['mcq', 10, 1], ['fill', 5, 1], ['match', 5, 1], ['tf', 5, 1], ['short', 10, 2], ['short', 5, 3], ['long', 4, 5]], time: 150 },
  { id: 'Term 2', title: 'Term 2', family: 'Term 2', rows: [['mcq', 10, 1], ['fill', 5, 1], ['match', 5, 1], ['tf', 5, 1], ['short', 10, 2], ['short', 5, 3], ['long', 4, 5]], time: 150 },
  { id: 'Mid Term', title: 'Mid Term', family: 'Mid Term', rows: [['mcq', 10, 1], ['fill', 5, 1], ['match', 5, 1], ['tf', 5, 1], ['short', 10, 2], ['short', 5, 3], ['long', 4, 5]], time: 150 },
  { id: 'Final Exam', title: 'Final Exam', family: 'Final Exam', rows: [['mcq', 10, 1], ['fill', 5, 1], ['match', 5, 1], ['tf', 5, 1], ['short', 10, 2], ['short', 5, 3], ['long', 4, 5]], time: 150 },
  { id: 'Other', title: '', family: 'This kind of', rows: [['mcq', 6, 1], ['fill', 4, 1], ['match', 3, 1], ['short', 6, 2]], time: 40 },
];
const agAssessment = id => AG_ASSESSMENTS.find(a => a.id === id);
const agRowsFor = id => agAssessment(id).rows.map(r => ({ type: r[0], count: r[1], marks: r[2] }));
const agUsualTotal = id => agAssessment(id).rows.reduce((s, r) => s + r[1] * r[2], 0);
const BLOOMS = ['Remember', 'Understand', 'Apply', 'Analyse', 'Evaluate', 'Create'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Mixed'];

/* ---------- §6 total marks: ALWAYS calculated, never typed ---------- */
const rowSubtotal = r => (+r.count || 0) * (+r.marks || 0);
const agTotals = rows => ({ marks: rows.reduce((s, r) => s + rowSubtotal(r), 0), questions: rows.reduce((s, r) => s + (+r.count || 0), 0) });
function rowError(r, subject) {
  if (!agTypesFor(subject).some(t => t.id === r.type)) return 'This question type is not available for this subject.';
  if (!(r.count >= 1 && r.count <= 30) || !Number.isInteger(+r.count)) return 'Number of questions must be 1 to 30.';
  if (!(r.marks >= 1 && r.marks <= 20) || !Number.isInteger(+r.marks)) return 'Marks each must be 1 to 20.';
  return '';
}
/* §5 #12 diagram share */
function diagramPlan(rows, percent) {
  const { questions } = agTotals(rows);
  const inherent = rows.filter(r => r.type === 'diagram' || r.type === 'picture').reduce((s, r) => s + (+r.count || 0), 0);
  const share = percent > 0 ? Math.max(1, Math.round(percent / 100 * questions)) : 0;
  return { questions, share, inherent, count: Math.max(share, inherent), raised: inherent > share && percent > 0 };
}

/* ---------- Textbook catalogue (mock of the existing book catalogue) ---------- */
const FACTS = {
  Filtration: [
    { q: 'Which method separates insoluble solid particles from a liquid?', a: 'Filtration', wrong: ['Evaporation', 'Winnowing', 'Handpicking'], fill: 'Filtration separates insoluble ______ particles from a liquid.', fa: 'solid', stmt: 'Filtration separates insoluble solid particles from a liquid.', fals: 'Filtration separates dissolved salt from water.', term: 'Filtration', def: 'Separating an insoluble solid from a liquid with a filter', expl: 'A filter lets the liquid pass and holds back the insoluble solid.' },
    { q: 'What is the solid left on the filter called?', a: 'Residue', wrong: ['Filtrate', 'Vapour', 'Solution'], fill: 'The solid left on the filter is called the ______.', fa: 'residue', stmt: 'The solid left on the filter is called the residue.', fals: 'The solid left on the filter is called the filtrate.', term: 'Residue', def: 'The solid left on the filter', expl: 'Particles too large to pass through the filter stay behind as residue.' },
    { q: 'What is the liquid that passes through the filter called?', a: 'Filtrate', wrong: ['Residue', 'Sediment', 'Crystal'], fill: 'The liquid that passes through the filter is called the ______.', fa: 'filtrate', stmt: 'The liquid that passes through the filter is called the filtrate.', fals: 'The liquid that passes through the filter is called the residue.', term: 'Filtrate', def: 'The liquid that passes through the filter', expl: 'The liquid is made of particles small enough to pass through the filter.' },
    { q: 'Which material can be used as a filter?', a: 'Clean cotton cloth', wrong: ['Plastic sheet', 'Iron plate', 'Wooden board'], fill: 'A clean ______ cloth can be used as a filter.', fa: 'cotton', stmt: 'A clean cotton cloth can be used as a filter.', fals: 'A plastic sheet can be used as a filter for muddy water.', term: 'Filter', def: 'A material with tiny holes that holds back solids', expl: 'Cotton cloth has tiny holes that let water through but stop mud.' },
  ],
  Evaporation: [
    { q: 'Which process changes water into water vapour on heating or in sunlight?', a: 'Evaporation', wrong: ['Filtration', 'Sedimentation', 'Decantation'], fill: 'Water changes into vapour by ______.', fa: 'evaporation', stmt: 'Water changes into vapour by evaporation.', fals: 'Water changes into vapour by filtration.', term: 'Evaporation', def: 'Change of a liquid into vapour', expl: 'Heat or sunlight turns the liquid into water vapour.' },
    { q: 'Which method is used to get salt from sea water?', a: 'Evaporation', wrong: ['Filtration', 'Handpicking', 'Winnowing'], fill: 'Salt is obtained from sea water by ______.', fa: 'evaporation', stmt: 'Salt is obtained from sea water by evaporation.', fals: 'Salt is obtained from sea water by winnowing.', term: 'Sea water', def: 'Salt is got from it by evaporation', expl: 'The water evaporates and the salt is left behind.' },
    { q: 'When salt solution is heated, what is left behind after the water evaporates?', a: 'Salt', wrong: ['Sand', 'Mud', 'Nothing'], fill: 'After the water evaporates, ______ is left behind.', fa: 'salt', stmt: 'After the water evaporates from salt solution, salt is left behind.', fals: 'After the water evaporates from salt solution, nothing is left behind.', term: 'Salt solution', def: 'Leaves salt behind when water evaporates', expl: 'Salt does not evaporate with the water.' },
    { q: 'In which weather does evaporation happen fastest?', a: 'Hot, dry and windy', wrong: ['Cold and damp', 'Cloudy and calm', 'Rainy'], fill: 'Evaporation is fastest in hot, dry and ______ weather.', fa: 'windy', stmt: 'Evaporation is fastest in hot, dry and windy weather.', fals: 'Evaporation is fastest in cold and damp weather.', term: 'Fast evaporation', def: 'Happens in hot, dry and windy weather', expl: 'Heat and moving air carry the vapour away quickly.' },
  ],
  'Sedimentation and decantation': [
    { q: 'What is it called when heavy particles settle at the bottom of a liquid?', a: 'Sedimentation', wrong: ['Evaporation', 'Filtration', 'Winnowing'], fill: 'Heavy particles settling at the bottom is called ______.', fa: 'sedimentation', stmt: 'Heavy particles settling at the bottom of a liquid is called sedimentation.', fals: 'Heavy particles settling at the bottom of a liquid is called evaporation.', term: 'Sedimentation', def: 'Heavy particles settling at the bottom', expl: 'Heavier particles sink and settle when the liquid is left alone.' },
    { q: 'Pouring out the clear liquid without disturbing the settled solid is called', a: 'Decantation', wrong: ['Sedimentation', 'Evaporation', 'Threshing'], fill: 'Pouring off the clear liquid is called ______.', fa: 'decantation', stmt: 'Pouring off the clear liquid without disturbing the sediment is called decantation.', fals: 'Pouring off the clear liquid is called evaporation.', term: 'Decantation', def: 'Pouring off the clear liquid from the sediment', expl: 'The sediment stays at the bottom while the clear liquid is poured out.' },
    { q: 'Which mixture can be separated by sedimentation and decantation?', a: 'Muddy water', wrong: ['Salt solution', 'Sugar solution', 'Air'], fill: 'Muddy water can be separated by sedimentation and ______.', fa: 'decantation', stmt: 'Muddy water can be separated by sedimentation and decantation.', fals: 'Salt solution can be separated by sedimentation and decantation.', term: 'Muddy water', def: 'Separated by sedimentation and decantation', expl: 'Mud is an insoluble solid that settles in water.' },
    { q: 'In sedimentation, where do the heavier particles collect?', a: 'At the bottom', wrong: ['At the top', 'On the sides only', 'They disappear'], fill: 'In sedimentation, heavier particles collect at the ______.', fa: 'bottom', stmt: 'In sedimentation, heavier particles collect at the bottom.', fals: 'In sedimentation, heavier particles collect at the top.', term: 'Sediment', def: 'The heavy particles collected at the bottom', expl: 'Gravity pulls the heavier particles down.' },
  ],
};
const AG_CATALOGUE = {
  '2|Maths': [
    { id: 'C1', title: 'Numbers up to 100', content: true, topics: [{ id: 'T1', title: 'Place value (tens and ones)', pages: 4 }, { id: 'T2', title: 'Number names and sequence', pages: 3 }, { id: 'T3', title: 'Comparing and ordering numbers', pages: 3 }] },
    { id: 'C2', title: 'Addition', content: true, topics: [{ id: 'T4', title: 'Addition without carrying', pages: 3 }, { id: 'T5', title: 'Addition with carrying', pages: 4 }] },
    { id: 'C3', title: 'Subtraction', content: true, topics: [{ id: 'T6', title: 'Subtraction with borrowing', pages: 4 }, { id: 'T7', title: 'Story sums', pages: 4 }] },
  ],
  '2|English': [
    { id: 'C1', title: 'Nouns', content: true, topics: [{ id: 'T1', title: 'Naming words', pages: 3 }, { id: 'T2', title: 'Singular and plural', pages: 3 }] },
    { id: 'C2', title: 'Verbs', content: true, topics: [{ id: 'T3', title: 'Action words', pages: 3 }] },
    { id: 'C3', title: 'Reading', content: true, topics: [{ id: 'T4', title: 'Short passages', pages: 4 }] },
  ],
  '2|EVS': [
    { id: 'C1', title: 'My Family', content: true, topics: [{ id: 'T1', title: 'Family members', pages: 3 }, { id: 'T2', title: 'Community helpers', pages: 3 }] },
    { id: 'C2', title: 'Water Around Us', content: false, topics: [{ id: 'T3', title: 'Uses of water', pages: 4 }] },
  ],
  '6|Science': [
    { id: 'C1', title: 'Separation of Substances', content: true, topics: [{ id: 'T1', title: 'Filtration', pages: 4 }, { id: 'T2', title: 'Evaporation', pages: 3 }, { id: 'T3', title: 'Sedimentation and decantation', pages: 3 }] },
    { id: 'C2', title: 'Fibre to Fabric', content: true, topics: [{ id: 'T4', title: 'Types of fibres', pages: 4 }, { id: 'T5', title: 'Spinning', pages: 3 }] },
    { id: 'C3', title: 'Materials Around Us', content: false, topics: [{ id: 'T6', title: 'Properties of materials', pages: 4 }] },
  ],
  '6|Mathematics': [
    { id: 'C1', title: 'Whole Numbers', content: true, topics: [{ id: 'T1', title: 'Place value', pages: 4 }, { id: 'T2', title: 'Comparing numbers', pages: 3 }] },
    { id: 'C2', title: 'Basic Operations', content: true, topics: [{ id: 'T3', title: 'Addition', pages: 3 }, { id: 'T4', title: 'Subtraction', pages: 3 }, { id: 'T5', title: 'Story sums', pages: 4 }] },
  ],
};
function agChapters(grade, subject) {
  const hit = AG_CATALOGUE[`${grade}|${subject}`];
  if (hit) return hit.map(c => ({ ...c, topics: c.topics.map(t => ({ ...t })) }));
  return [1, 2, 3].map(i => ({ id: 'C' + i, title: `Chapter ${i}`, content: true, topics: [{ id: `T${i * 2 - 1}`, title: `${subject} topic ${i}A`, pages: 3 }, { id: `T${i * 2}`, title: `${subject} topic ${i}B`, pages: 4 }] }));
}

/* ---------- Maths items (computed, so answers and working are always right: §14 S3) ---------- */
const NAMES = ['Asha', 'Ravi', 'Meera', 'Kabir', 'Anu', 'Rohan'];
const THINGS = [['mangoes', 'mango'], ['pencils', 'pencil'], ['marbles', 'marble'], ['stickers', 'sticker'], ['balloons', 'balloon']];
function mathsKind(title) {
  const t = title.toLowerCase();
  if (/place value/.test(t)) return 'place';
  if (/compar|order/.test(t)) return 'compare';
  if (/sequence|number name|numbers up/.test(t)) return 'sequence';
  if (/addition|adding/.test(t)) return 'add';
  if (/subtract/.test(t)) return 'sub';
  if (/story|word problem/.test(t)) return 'story';
  return 'mix';
}
function addNums(r, d, M) {
  const s = M > 99 ? 10 : 1;
  for (let i = 0; i < 60; i++) {
    const a = ri(r, 11, Math.floor(M * .8)), b = ri(r, 2, d === 'easy' ? 9 : 60 * s);
    const carry = (a % 10) + (b % 10) >= 10;
    if (a + b <= M && (d === 'hard' ? carry : !carry)) return [a, b];
  }
  return [23, 14];
}
function subNums(r, d, M) {
  for (let i = 0; i < 60; i++) {
    const a = ri(r, 20, M), b = ri(r, 2, Math.min(a - 1, d === 'easy' ? 9 : a));
    const borrow = (a % 10) < (b % 10);
    if (b < a && (d === 'hard' ? borrow : !borrow)) return [a, b];
  }
  return [57, 23];
}
function addSteps(a, b) {
  const o = (a % 10) + (b % 10), carry = o >= 10 ? 1 : 0, t = Math.floor(a / 10) + Math.floor(b / 10) + carry;
  return [`Add the ones: ${a % 10} + ${b % 10} = ${o}.${carry ? ` Write ${o % 10} and carry 1.` : ''}`, `Add the tens: ${Math.floor(a / 10)} + ${Math.floor(b / 10)}${carry ? ' + 1' : ''} = ${t}.`, `So ${a} + ${b} = ${a + b}.`];
}
function subSteps(a, b) {
  const bo = (a % 10) < (b % 10), o = (a % 10) + (bo ? 10 : 0) - (b % 10), t = Math.floor(a / 10) - (bo ? 1 : 0) - Math.floor(b / 10);
  return [`Subtract the ones: ${bo ? `borrow 1 ten, so ${(a % 10) + 10}` : a % 10} - ${b % 10} = ${o}.`, `Subtract the tens: ${Math.floor(a / 10)}${bo ? ' - 1' : ''} - ${Math.floor(b / 10)} = ${t}.`, `So ${a} - ${b} = ${a - b}.`];
}
function nearby(r, n, M) { return uniq([n + 10, n - 10, n + 1, n - 1, n + 2, n * 2].filter(x => x > 0 && x !== n && x <= M * 2)); }

function mathsItem(kind, r, grade, d, withDiagram) {
  const M = grade <= 2 ? 99 : grade <= 5 ? 999 : 9999;
  if (kind === 'mix') kind = pick(r, ['add', 'sub', 'place', 'compare']);
  if (kind === 'place') {
    const n = ri(r, 11, Math.min(M, 99)), tens = Math.floor(n / 10), ones = n % 10;
    const base = {
      stem: `In ${n}, how many tens are there?`, ans: String(tens), wrong: uniq([ones, tens + 1, tens - 1 > 0 ? tens - 1 : tens + 2, ones + 1]).filter(x => x !== String(tens)),
      steps: [`${n} = ${tens} tens + ${ones} ones.`, `So ${n} has ${tens} tens.`], fill: `In ${n}, the digit in the ones place is ______.`, fa: String(ones),
      tf: t => ({ text: `In ${n}, the digit in the tens place is ${t ? tens : ones}.`, truth: t, fix: `In ${n}, the digit in the tens place is ${tens}.` }), pair: [`${tens} tens and ${ones} ones`, String(n)],
    };
    if (!withDiagram) return base;
    return { ...base, stem: 'Look at the blocks. Which number do they show?', ans: String(n), wrong: uniq([tens + ones * 10, n + 10, n - 1, n + 1]).filter(x => x !== String(n)), fill: 'The blocks show the number ______.', fa: String(n), steps: [`The blocks show ${tens} tens and ${ones} ones.`, `${tens} tens + ${ones} ones = ${n}.`], diagram: { kind: 'base_ten', spec: { tens, ones }, alt: 'Blocks: rods for tens and small cubes for ones' } };
  }
  if (kind === 'sequence') {
    const n = ri(r, 12, M - 2), base = {
      stem: `The number just after ${n} is`, ans: String(n + 1), wrong: uniq([n - 1, n + 2, n + 10]).filter(x => x !== String(n + 1)), steps: ['Just after means one more.', `${n} + 1 = ${n + 1}.`],
      fill: `The number just after ${n} is ______.`, fa: String(n + 1), tf: t => ({ text: `The number just before ${n} is ${t ? n - 1 : n + 1}.`, truth: t, fix: `The number just before ${n} is ${n - 1}.` }), pair: [`Just after ${n}`, String(n + 1)],
    };
    if (!withDiagram) return base;
    return { ...base, stem: 'Look at the number line. Which number is missing?', ans: String(n), wrong: uniq([n - 1, n + 1, n + 2]).filter(x => x !== String(n)), fill: 'The missing number on the number line is ______.', fa: String(n), steps: [`The numbers go up by 1 each step.`, `After ${n - 1} comes ${n}.`], diagram: { kind: 'number_line', spec: { start: n - 3, end: n + 3, step: 1, labelled: [n - 2, n - 1, n + 1, n + 2], missing: [n] }, alt: 'A number line with one missing number' } };
  }
  if (kind === 'compare') {
    const lo = ri(r, 20, Math.min(M - 10, 90)), hi = lo + ri(r, 1, 8), swap = r() < .5, a = swap ? hi : lo, b = swap ? lo : hi;
    const sym = a > b ? '>' : '<';
    const base = {
      stem: `Which is greater: ${a} or ${b}?`, ans: String(hi), wrong: uniq([lo, hi + 10, lo - 10]).filter(x => x !== String(hi)), steps: [`Compare the digits from the left.`, `${hi} is greater than ${lo}.`],
      fill: `${a} ______ ${b}  (write > or <)`, fa: sym, tf: t => ({ text: `${a} ${t ? sym : (sym === '>' ? '<' : '>')} ${b}`, truth: t, fix: `${a} ${sym} ${b}` }), pair: [`Greater of ${a} and ${b}`, String(hi)],
    };
    if (!withDiagram) return base;
    return { ...base, stem: 'Look at the number line. Which of the two marked numbers is greater?', diagram: { kind: 'number_line', spec: { start: lo - 2, end: hi + 2, step: 1, labelled: [lo, hi], missing: [] }, alt: 'A number line with two marked numbers' } };
  }
  if (kind === 'add') {
    const [a, b] = addNums(r, d, M), s = a + b;
    const base = {
      stem: `${a} + ${b} = ?`, ans: String(s), wrong: uniq([s + 10, s - 1, s + 1, s - 10]).filter(x => +x > 0 && x !== String(s)), steps: addSteps(a, b), fill: `${a} + ${b} = ______`, fa: String(s),
      tf: t => ({ text: `${a} + ${b} = ${t ? s : s + (r() < .5 ? 10 : 1)}`, truth: t, fix: `${a} + ${b} = ${s}` }), pair: [`${a} + ${b}`, String(s)],
    };
    if (!withDiagram) return base;
    const sp = n => ({ bundles: Math.floor(n / 10), loose: n % 10 });
    return { ...base, stem: 'Count the sticks in both pictures together. How many sticks are there in all?', ans: String(s), fill: 'There are ______ sticks in all.', diagram: { kind: 'bundles', spec: { bundle_size: 10, groups: [sp(a), sp(b)] }, alt: 'Two pictures of sticks tied in bundles of ten with some loose sticks' } };
  }
  if (kind === 'sub') {
    const [a, b] = subNums(r, d, M), s = a - b;
    const base = {
      stem: `${a} - ${b} = ?`, ans: String(s), wrong: uniq([s + 10, s - 1, s + 1, a + b]).filter(x => +x > 0 && x !== String(s)), steps: subSteps(a, b), fill: `${a} - ${b} = ______`, fa: String(s),
      tf: t => ({ text: `${a} - ${b} = ${t ? s : s + (r() < .5 ? 10 : 1)}`, truth: t, fix: `${a} - ${b} = ${s}` }), pair: [`${a} - ${b}`, String(s)],
    };
    if (!withDiagram) return base;
    return { ...base, stem: `Start at ${a} on the number line. Jump back ${Math.min(b, 9)} steps. Where do you land?`, ...(b <= 9 && a <= M ? { ans: String(a - b), steps: [`Jumping back ${b} steps means ${a} - ${b}.`, `${a} - ${b} = ${a - b}.`], diagram: { kind: 'number_line', spec: { start: a - 10, end: a, step: 1, labelled: [a], missing: [a - b] }, alt: 'A number line with a starting number and a missing landing number' } } : { stem: 'Look at the picture. How many sticks are there?', ans: String(a), steps: [`${Math.floor(a / 10)} bundles of ten and ${a % 10} loose sticks make ${a}.`], diagram: { kind: 'bundles', spec: { bundle_size: 10, groups: [{ bundles: Math.floor(a / 10), loose: a % 10 }] }, alt: 'Sticks tied in bundles of ten with some loose sticks' } }) };
  }
  // story sums
  const add = r() < .5, name = pick(r, NAMES), [pl, sg] = pick(r, THINGS);
  const [a, b] = add ? addNums(r, d, M) : subNums(r, d, M), s = add ? a + b : a - b;
  const text = add ? `${name} has ${a} ${pl}. A friend gives ${b} more. How many ${pl} does ${name} have now?` : `${name} has ${a} ${pl}. ${name} gives ${b} ${pl} to a friend. How many ${pl} are left?`;
  const base = {
    stem: text, ans: `${s} ${pl}`, wrong: uniq([s + 10, s + 1, s - 1, add ? a - b : a + b]).filter(x => +x > 0 && +x !== s).map(x => `${x} ${pl}`),
    steps: [`Number sentence: ${a} ${add ? '+' : '-'} ${b} = ?`, ...(add ? addSteps(a, b) : subSteps(a, b)).slice(0, 2), `Answer: ${s} ${pl}.`], fill: `${text.split('?')[0]}? Answer: ______ ${pl}.`, fa: String(s),
    tf: t => ({ text: `${text.split('?')[0]}? Answer: ${t ? s : s + 1} ${pl}.`, truth: t, fix: `The answer is ${s} ${pl}.` }), pair: [`${a} ${add ? '+' : '-'} ${b} (${pl})`, `${s} ${pl}`], unit: pl,
  };
  if (!withDiagram) return base;
  return { ...base, stem: `${name} has the ${pl} shown in the picture and ${add ? 'gets' : 'gives away'} ${Math.min(b, 9)} more. ${add ? 'How many in all?' : 'How many are left?'}`, ...(b <= 9 ? { ans: `${add ? a + b : a - b} ${pl}`, steps: [`Count the picture: ${a}.`, `${a} ${add ? '+' : '-'} ${b} = ${add ? a + b : a - b}.`], wrong: uniq([a, a + 10, a - b, a + b + 1]).filter(x => +x !== (add ? a + b : a - b)).map(x => `${x} ${pl}`), diagram: { kind: 'bundles', spec: { bundle_size: 10, groups: [{ bundles: Math.floor(a / 10), loose: a % 10 }] }, alt: `Picture of ${pl} tied in tens with some loose` } } : { diagram: { kind: 'bundles', spec: { bundle_size: 10, groups: [{ bundles: Math.floor(a / 10), loose: a % 10 }] }, alt: `Picture of ${pl}` } }) };
}

/* ---------- Fact-based items (non-Maths). Generic facts use only the catalogue structure, never invented content (§13.10) ---------- */
function factItems(topic, chapter, allTopics, allChapters) {
  const bank = FACTS[topic.title];
  if (bank) return bank;
  const otherCh = allChapters.filter(c => c.title !== chapter.title).map(c => c.title);
  const otherTp = allTopics.filter(t => t.title !== topic.title).map(t => t.title);
  return [
    { q: `"${topic.title}" is a topic in which chapter?`, a: chapter.title, wrong: otherCh.length >= 3 ? otherCh.slice(0, 3) : [...otherCh, 'Revision', 'Project', 'Activities'].slice(0, 3), fill: `"${topic.title}" is a topic in the chapter ______.`, fa: chapter.title, stmt: `"${topic.title}" is a topic in the chapter ${chapter.title}.`, fals: `"${topic.title}" is a topic in the chapter ${otherCh[0] || 'Revision'}.`, term: topic.title, def: `A topic in ${chapter.title}`, expl: `${topic.title} is taught in the chapter ${chapter.title}.` },
    { q: `Which of these is a topic in the chapter "${chapter.title}"?`, a: topic.title, wrong: otherTp.length >= 3 ? otherTp.slice(0, 3) : [...otherTp, 'Revision', 'Project', 'Activities'].slice(0, 3), fill: `______ is a topic in the chapter ${chapter.title}.`, fa: topic.title, stmt: `${topic.title} is a topic in the chapter ${chapter.title}.`, fals: `${otherTp[0] || 'Revision'} is a topic in the chapter ${chapter.title}.`, term: chapter.title, def: `Includes the topic ${topic.title}`, expl: `${topic.title} belongs to ${chapter.title}.` },
  ];
}
const WORD_SKILLS = {
  English: [['Write the plural of: cat', 'cats', 'Add -s to most naming words.'], ['Write the plural of: box', 'boxes', 'Words ending in x add -es.'], ['Write the opposite of: big', 'small', 'Opposites have the opposite meaning.'], ['Write the opposite of: hot', 'cold', 'Opposites have the opposite meaning.'], ['Write a rhyming word for: cat', 'hat', 'Rhyming words end with the same sound.']],
  Hindi: [['इसका विलोम शब्द लिखिए: बड़ा', 'छोटा', 'विलोम शब्द का अर्थ उल्टा होता है।'], ['इसका विलोम शब्द लिखिए: दिन', 'रात', 'विलोम शब्द का अर्थ उल्टा होता है।'], ['इसका विलोम शब्द लिखिए: गरम', 'ठंडा', 'विलोम शब्द का अर्थ उल्टा होता है।']],
};

/* ---------- Question writers (§8). item -> question fields ---------- */
function splitMarks(total, labels) {
  const n = Math.min(labels.length, total), base = Math.floor(total / n), extra = total - base * n;
  return labels.slice(0, n).map((p, i) => ({ point: p, marks: base + (i < extra ? 1 : 0) }));
}
const linesFor = (type, marks) => ({ mcq: 0, fill: 0, tf: 0, match: 0, oneword: 1, picture: marks, diagram: marks, short: Math.min(marks, 4), story: Math.max(2, marks * 2), word_skills: 1, long: Math.max(4, marks * 2), creative: Math.max(4, marks * 2) }[type] ?? 1);

function writeQuestion(ctx, slot, seed) {
  const r = rngFrom(seed), g = ctx.grade, topic = ctx.topicById[slot.topicId], ch = ctx.chapterOfTopic[slot.topicId];
  const maths = agIsMaths(ctx.subject), d = slot.difficulty.toLowerCase();
  const wantD = slot.diagram;
  const mk = (dg) => {
    if (maths) return mathsItem(mathsKind(topic.title), r, g, d, dg);
    const pool = factItems(topic, ch, ctx.allTopics, ctx.chapters), used = (ctx.used[slot.type + topic.id] ||= new Set());
    let cands = pool.filter(x => !used.has(x.q)); if (!cands.length) { used.clear(); cands = pool; }
    const f = pick(r, cands); used.add(f.q);
    const lead = { short: 'Explain in a sentence. ', oneword: '', story: '' }[slot.type] || '';
    const base = { stem: lead + f.q + (slot.type === 'oneword' ? ' (one word)' : ''), ans: f.a, wrong: f.wrong, steps: [f.expl], fill: f.fill, fa: f.fa || f.a, tf: t => ({ text: t ? f.stmt : f.fals, truth: t, fix: f.stmt }), pair: [f.term, f.def] };
    return dg ? { ...base, stem: `Look at the diagram of "${topic.title}". ${f.q}`, diagram: { kind: 'library', spec: { caption: topic.title }, alt: `Diagram from the textbook on ${topic.title}` } } : base;
  };
  const q = { id: slot.id, number: 0, text: '', options: [], lines: linesFor(slot.type, slot.marks), topic_id: slot.topicId, difficulty: slot.difficulty.toLowerCase(), bloom: slot.bloom, marks: slot.marks, diagram: null, answer: '', answer_option: null, solution: '', marking_points: [], partial_credit: '', alternatives: [], edited_by_teacher: false, check_note: null, type: slot.type };
  const attach = it => { if (it.diagram) q.diagram = { ...it.diagram, background: 'white', width_mm: 90, file: '' }; };
  const type = slot.type, nOpt = g <= 2 ? 3 : 4;
  const needD = wantD || type === 'picture' || type === 'diagram';
  let it = mk(needD);
  if (needD && !it.diagram) it = mk(true);
  attach(it);
  switch (type) {
    case 'mcq': {
      const opts = shuffle(r, uniq([it.ans, ...it.wrong]).slice(0, nOpt));
      if (!opts.includes(String(it.ans))) opts[0] = String(it.ans);
      q.text = it.stem; q.options = shuffle(r, opts); q.answer_option = q.options.indexOf(String(it.ans)) + 1;
      q.answer = `(${'abcd'[q.answer_option - 1]}) ${it.ans}`; q.solution = `${it.steps.join(' ')} The other options do not match this result.`; break;
    }
    case 'fill': q.text = it.fill; q.answer = it.fa; q.solution = it.steps.join(' '); break;
    case 'tf': {
      const truth = r() < .5, s = it.tf(truth);
      q.text = s.text; q.answer = truth ? 'True' : 'False'; q.solution = truth ? 'The statement is correct.' : `The statement is false. Correct statement: ${s.fix}`; break;
    }
    case 'match': q.text = it.pair[0]; q.answer = it.pair[1]; q.solution = `${it.pair[0]} → ${it.pair[1]}`; break;
    case 'oneword': q.text = it.stem; q.answer = String(it.ans); q.alternatives = []; q.solution = it.steps.join(' '); break;
    case 'picture': case 'diagram': q.text = it.stem; q.answer = String(it.ans); q.solution = it.steps.join(' '); q.marking_points = slot.marks > 1 ? splitMarks(slot.marks, ['Reads the diagram correctly', 'Gives the correct answer']) : []; break;
    case 'short': case 'story': {
      q.text = it.stem; q.answer = String(it.ans); q.solution = it.steps.join('\n');
      q.marking_points = slot.marks > 1 ? splitMarks(slot.marks, maths ? ['Correct number sentence or method', 'Correct working', 'Correct answer with unit'] : ['Correct answer', 'Reason or explanation', 'Clear sentence']) : [];
      q.partial_credit = slot.marks > 1 ? 'Give the marks for each correct step even if the final answer is wrong.' : ''; break;
    }
    case 'long': {
      const parts = Math.min(3, Math.max(2, slot.marks - 1)), items = [it];
      for (let i = 1; i < parts; i++) items.push(mk(false));
      q.text = 'Answer the following: ' + items.map((x, i) => `(${'abc'[i]}) ${x.stem}`).join('  ');
      q.answer = items.map((x, i) => `(${'abc'[i]}) ${x.ans}`).join('  '); q.solution = items.map((x, i) => `(${'abc'[i]}) ${x.steps.join(' ')}`).join('\n');
      q.marking_points = splitMarks(slot.marks, items.map((x, i) => `Part (${'abc'[i]}) correct`)); q.partial_credit = 'Award each part separately; give method marks where the working is right.'; break;
    }
    case 'word_skills': { const w = pick(r, WORD_SKILLS[ctx.subject] || WORD_SKILLS.English); q.text = w[0]; q.answer = w[1]; q.solution = w[2]; break; }
    case 'creative': {
      q.text = `Write a short paragraph (4 to 5 lines) about "${topic.title}".`; q.answer = `A paragraph of 4 to 5 lines about ${topic.title}, using words from the chapter.`;
      q.solution = 'Check content, organisation, language and presentation using the rubric below.'; q.marking_points = splitMarks(slot.marks, ['Content: relevant ideas about the topic', 'Language: correct sentences and spelling', 'Organisation: ideas in order', 'Presentation: neat handwriting']); break;
    }
  }
  q._item = undefined;
  return q;
}

/* ---------- §9 allocation ---------- */
const BLOOM_DEFAULT = g => g <= 3 ? { Remember: .5, Understand: .35, Apply: .15 } : g <= 7 ? { Remember: .3, Understand: .35, Apply: .25, Analyse: .1 } : { Remember: .2, Understand: .3, Apply: .3, Analyse: .15, Evaluate: .05 };

function allocate(sections, topics, form, dPlan, notes) {
  const slots = sections.flatMap(s => s.rows.map((_, i) => ({ id: s.letter + (i + 1), type: s.type, marks: s.marks_each, section: s.letter })));
  const N = slots.length;
  // topics in proportion to pages, interleaved so each section is spread across topics
  const counts = largestRemainder(topics.map(t => t.pages), N), pool = counts.slice(), seq = [];
  while (seq.length < N) topics.forEach((t, i) => { if (pool[i] > 0) { seq.push(t.id); pool[i]--; } });
  slots.forEach((s, i) => s.topicId = seq[i]);
  // difficulty
  const byMarks = slots.map((s, i) => i).sort((a, b) => slots[b].marks - slots[a].marks || a - b);
  const mix = form.difficulty === 'Mixed' ? { easy: Math.round(.3 * N), hard: Math.round(.2 * N) } : form.difficulty === 'Easy' ? { easy: N, hard: 0 } : form.difficulty === 'Hard' ? { easy: 0, hard: N } : { easy: 0, hard: 0 };
  slots.forEach(s => s.difficulty = 'Medium');
  byMarks.slice(0, mix.hard).forEach(i => slots[i].difficulty = 'Hard');
  byMarks.slice().reverse().filter(i => slots[i].difficulty !== 'Hard').slice(0, mix.easy).forEach(i => slots[i].difficulty = 'Easy');
  // Bloom's
  const sel = form.blooms.length ? BLOOMS.filter(b => form.blooms.includes(b)) : null;
  const dist = sel ? Object.fromEntries(sel.map(b => [b, 1])) : BLOOM_DEFAULT(+form.grade), lv = Object.keys(dist);
  const bc = largestRemainder(lv.map(l => dist[l]), N), resolved = Object.fromEntries(lv.map((l, i) => [l, bc[i]]));
  let k = 0; const order = lv.slice().reverse(); const lvlSeq = [];
  order.forEach(l => { for (let i = 0; i < resolved[l]; i++) lvlSeq.push(l); });
  byMarks.forEach((i, n) => slots[i].bloom = lvlSeq[n]);
  const objective = ['mcq', 'tf', 'match', 'fill', 'oneword'], allowed = lv.filter(l => l !== 'Evaluate' && l !== 'Create');
  slots.forEach(s => { if (objective.includes(s.type) && (s.bloom === 'Evaluate' || s.bloom === 'Create')) { if (allowed.length) { notes.push(`${s.id}: ${s.bloom} does not suit ${agType(s.type).label}; used ${allowed[allowed.length - 1]}.`); s.bloom = allowed[allowed.length - 1]; } } });
  // diagram flags
  slots.forEach(s => s.diagram = s.type === 'diagram' || s.type === 'picture');
  const extra = Math.max(0, dPlan.count - dPlan.inherent), elig = slots.filter(s => !s.diagram && ['mcq', 'fill', 'oneword', 'short', 'long'].includes(s.type));
  for (let i = 0; i < Math.min(extra, elig.length); i++) elig[Math.floor((i + .5) * elig.length / Math.min(extra, elig.length))].diagram = true;
  return { slots, resolved };
}

/* ---------- §10.3 section structure ---------- */
function sectionsFromRows(rows) {
  return rows.map((r, i) => ({ ...r, order: i })).sort((a, b) => agType(a.type).rank - agType(b.type).rank || a.marks - b.marks || a.order - b.order)
    .map((r, i) => ({ letter: String.fromCharCode(65 + i), type: r.type, marks_each: +r.marks, count: +r.count, rows: Array.from({ length: +r.count }) }));
}
const notation = (count, marks) => `${count}X${marks}M=${count * marks}M`;
const catTitle = f => { const a = agAssessment(f.assessment); return a.id === 'Other' ? f.otherName : a.title; };

/* ---------- Paper JSON v2.0 (§11) ---------- */
function buildPaper(form, opts = {}) {
  const seed = opts.seed ?? hashStr(JSON.stringify([form.grade, form.subject, form.assessment, form.chapters, form.rows, Date.now()]));
  const chapters = agChapters(form.grade, form.subject).filter(c => form.chapters.includes(c.id)).map(c => ({ ...c, topics: c.topics.filter(t => form.topics.includes(t.id)) }));
  const topics = chapters.flatMap(c => c.topics), ctx = {
    grade: +form.grade, subject: form.subject, chapters, allTopics: topics, used: {}, topicById: Object.fromEntries(topics.map(t => [t.id, t])),
    chapterOfTopic: Object.fromEntries(chapters.flatMap(c => c.topics.map(t => [t.id, c]))),
  };
  const rows = form.rows.map(r => ({ type: r.type, count: +r.count, marks: +r.marks }));
  const dPlan = diagramPlan(rows, +form.diagramPercent || 0), notes = [];
  if (dPlan.raised) notes.push(`Picture-based and image/diagram-based rows already include ${dPlan.inherent} diagram questions, more than ${form.diagramPercent}% (${dPlan.share}). Using ${dPlan.inherent}.`);
  const sections = sectionsFromRows(rows), { slots, resolved } = allocate(sections, topics, form, dPlan, notes);
  let n = 0;
  const out = sections.map(s => {
    const mine = slots.filter(x => x.section === s.letter);
    const questions = mine.map((slot, i) => { const q = writeQuestion(ctx, slot, seed + hashStr(slot.id)); q.number = i + 1; return q; });
    const sec = { letter: s.letter, type: s.type, instruction: agType(s.type).instruction, count: s.count, marks_each: s.marks_each, notation: notation(s.count, s.marks_each), help_box: null, column_b: null, part: null, questions };
    return sec;
  });
  const paper = {
    metadata: { school: form.school.trim(), title: `${catTitle(form)} - ${new Date().getFullYear()}`, assessment_name: form.assessment, grade: String(form.grade), subject: form.subject, time_minutes: +form.time || 0,
      total_marks: agTotals(rows).marks, total_marks_source: 'calculated', question_count: agTotals(rows).questions, difficulty: form.difficulty.toLowerCase(), blooms_selected: form.blooms.slice(), blooms_resolved: resolved,
      diagram_percent: +form.diagramPercent || 0, diagram_count: dPlan.count, source_status: form.uploadedChapters.length ? 'teacher_upload' : 'textbook', template: 'yolearn_default', seed },
    chapters: chapters.map(c => ({ id: c.id, title: c.title, topics: c.topics.map(t => ({ id: t.id, title: t.title, pages: t.pages })) })),
    blueprint: rows.map((r, i) => ({ row: i + 1, type: r.type, count: r.count, marks_each: r.marks, subtotal: r.count * r.marks })),
    allocation: slots.map(s => ({ question_id: s.id, topic_id: s.topicId, difficulty: s.difficulty.toLowerCase(), bloom: s.bloom, diagram: s.diagram })),
    sections: out, validation: { checks: [] }, generation_notes: { assumptions: [], warnings: notes },
  };
  finishSections(paper, ctx);
  runChecks(paper, ctx, seed);
  paper._ctx = ctx; paper._form = form;
  return paper;
}
/* help box, Column B */
function finishSections(paper, ctx) {
  paper.sections.forEach(s => refreshSection(s));
}
function refreshSection(s) {
  const r = rngFrom(hashStr(s.letter + s.questions.map(q => q.id + q.answer).join('|')));
  if (s.type === 'fill') s.help_box = shuffle(r, uniq(s.questions.map(q => q.answer)));
  if (s.type === 'match') {
    let b = shuffle(r, s.questions.map(q => q.answer));
    for (let t = 0; t < 8 && b.some((x, i) => x === s.questions[i].answer) && s.questions.length > 1; t++) b = shuffle(r, b);
    s.column_b = b;
  }
}

/* ---------- §14 validation. Failed checks become notes on the question (Teacher view only) ---------- */
function questionIssues(q, s, grade, allStems) {
  const issues = [];
  if (!q.answer || !q.solution) issues.push('S1 answer or solution missing');
  if (q.marks >= 2 && ['short', 'long', 'story', 'diagram', 'picture', 'creative'].includes(s.type) && q.marking_points.reduce((a, p) => a + p.marks, 0) !== q.marks) issues.push('S2 marking points do not add up to the marks');
  if (s.type === 'mcq') { const n = grade <= 2 ? 3 : 4; if (q.options.length !== n || new Set(q.options).size !== q.options.length || q.answer_option < 1) issues.push('Q5 MCQ options invalid'); }
  if (allStems.filter(x => x === q.text).length > 1) issues.push('Q4 duplicate question');
  if (q.diagram && q.diagram.background !== 'white' && q.diagram.background !== 'transparent') issues.push('D2 image background');
  return issues;
}
function runChecks(paper, ctx, seed) {
  const grade = +paper.metadata.grade, checks = [];
  for (let pass = 0; pass < 5; pass++) {
    const stems = paper.sections.flatMap(s => s.questions.map(q => q.text));
    let failed = 0;
    paper.sections.forEach(s => s.questions.forEach((q, i) => {
      if (q.edited_by_teacher) return;
      if (questionIssues(q, s, grade, stems).length) {
        failed++; const slot = paper.allocation.find(a => a.question_id === q.id);
        const nq = writeQuestion(ctx, { id: q.id, type: s.type, marks: q.marks, topicId: q.topic_id, difficulty: cap(q.difficulty), bloom: q.bloom, diagram: !!slot.diagram }, seed + hashStr(q.id) + pass * 7919 + 1);
        nq.number = q.number; s.questions[i] = nq;
      }
    }));
    paper.sections.forEach(refreshSection);
    if (!failed) break;
  }
  const stems = paper.sections.flatMap(s => s.questions.map(q => q.text));
  paper.sections.forEach(s => s.questions.forEach(q => { const is = questionIssues(q, s, grade, stems); if (!q.edited_by_teacher) q.check_note = is.length ? `Check failed: ${is.join('; ')}.` : null; }));
  const rows = paper.blueprint, sum = rows.reduce((a, r) => a + r.subtotal, 0);
  checks.push({ id: 'B1', status: sum === paper.metadata.total_marks ? 'pass' : 'fail' });
  checks.push({ id: 'Q1', status: paper.sections.every(s => s.questions.length === s.count) ? 'pass' : 'fail' });
  checks.push({ id: 'D1', status: paper.sections.flatMap(s => s.questions).filter(q => q.diagram).length === paper.metadata.diagram_count ? 'pass' : 'fail' });
  paper.validation.checks = checks;
}

/* ---------- Review operation (§9): edit changes values only; type, marks, topic and difficulty never change ---------- */
const findQS = (paper, qid) => { const s = paper.sections.find(x => x.questions.some(q => q.id === qid)); return [s, s.questions.find(q => q.id === qid)]; };
/* current stored value of an editable field (f = text | opt | answer | solution | alt | mp | pc | colb) */
function questionValue(paper, qid, f, i) {
  const [s, q] = findQS(paper, qid);
  return { text: q.text, opt: q.options[i], answer: q.answer, solution: q.solution, alt: q.alternatives[i], mp: q.marking_points[i]?.point, pc: q.partial_credit, colb: s.column_b?.[s.questions.indexOf(q)] }[f];
}
function editQuestion(paper, qid, patch) {
  const [s, q] = findQS(paper, qid), has = v => v != null && String(v).trim() !== '', each = (o, fn) => Object.entries(o || {}).forEach(([i, v]) => has(v) && fn(+i, String(v).trim()));
  if (has(patch.text)) { q.text = patch.text.trim(); if (s.type === 'match') q.solution = `${q.text} → ${q.answer}`; }
  if (Number.isInteger(patch.lines) && patch.lines >= 1 && patch.lines <= 20 && q.lines) q.lines = patch.lines;   // student answer lines: the teacher can add lines
  if (patch.diagram && q.diagram && /^data:image\//.test(patch.diagram.src || '')) q.diagram = { ...q.diagram, kind: 'upload', src: patch.diagram.src, alt: patch.diagram.alt || q.diagram.alt, background: 'white' };   // replace only; an image is never left empty
  each(patch.opt, (i, v) => { q.options[i] = v; });
  each(patch.alt, (i, v) => { q.alternatives[i] = v; });
  each(patch.mp, (i, v) => { q.marking_points[i].point = v; });
  if (has(patch.pc)) q.partial_credit = patch.pc.trim();
  if (has(patch.solution)) q.solution = patch.solution.trim();
  let picked = false; // MCQ: the teacher named a different correct option, e.g. "(c) ..."
  if (has(patch.answer)) {
    q.answer = patch.answer.trim();
    const m = s.type === 'mcq' && /^\(?([a-d])\)?/i.exec(q.answer), k = m ? 'abcd'.indexOf(m[1].toLowerCase()) : -1;
    if (k >= 0 && k < q.options.length) { q.answer_option = k + 1; picked = true; }
  }
  if (s.type === 'mcq' && q.answer_option >= 1 && (patch.opt || picked)) q.answer = `(${'abcd'[q.answer_option - 1]}) ${q.options[q.answer_option - 1]}`; // keep "(b) text" in step with the options
  if (s.type === 'match' && has(patch.colb)) { // Column B cell: the question that owns that answer takes the new value; the shuffled order is kept
    const at = s.questions.indexOf(q), old = s.column_b[at], owner = s.questions.find(x => x.answer === old), v = patch.colb.trim();
    s.column_b[at] = v; if (owner) { owner.answer = v; owner.solution = `${owner.text} → ${v}`; owner.edited_by_teacher = true; }
  }
  if (s.type === 'fill') refreshSection(s);
  q.edited_by_teacher = true;
  const issues = questionIssues(q, s, +paper.metadata.grade, paper.sections.flatMap(x => x.questions.map(y => y.text)));
  q.check_note = issues.length ? `Check failed: ${issues.join('; ')}.` : 'You edited this question. Answer and solution re-checked.';
}
