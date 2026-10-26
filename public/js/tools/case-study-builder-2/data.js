/* Case Study Builder 2.0 - catalogue + content. cs2Build() is a stand-in for the real generation service; the document shape below is what the output screen renders:
   { id, title, subject, grade, difficulty, topics[], skills[], scenario[], instruction, time, total_marks, questions[] }
   question: { number, type: 'mcq' | 'short', marks, text, options?, correct?, lines?, ans[], explanation } */

const CS2_DIFFS = ['Easy', 'Medium', 'Hard'];
const CS2_BLOOMS = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];
const CS2_TYPES = [['ai', 'AI Recommended'], ['story', 'Story-based'], ['real', 'Real-life situation'], ['problem', 'Problem-solving']];
const CS2_LENGTHS = ['Short', 'Medium', 'Long'];
const CS2_LANGS = ['English'];
const CS2_COUNT = [1, 20];
const CS2_PARAS = { Short: 2, Medium: 4, Long: 5 };   // scenario paragraphs per length
const CS2_LINES = 3;                                   // answer lines printed in the Student view

/* ---------- Catalogue: book > chapter > topic (the Assignment generator's books plus a Class 4 Computer book) ---------- */
const CS2_BOOKS = [
  { id: 'c4c', title: 'Class 4 Computer – KIPS', grade: 4, subject: 'Computer', board: 'KIPS', chapters: [
    { id: 'c1', title: 'MS Word: Formatting Text', topics: [{ id: 'cw_intro', title: 'Introduction' }, { id: 'cw_font', title: 'The Font Group' }, { id: 'cw_sub', title: 'Subscript and Superscript' }, { id: 'cw_case', title: 'Change Case' }, { id: 'cw_fx', title: 'Text Effects' }, { id: 'cw_fp', title: 'Format Painter' }, { id: 'cw_spell', title: 'Check Spelling and Grammar' }, { id: 'cw_thes', title: 'Using a Thesaurus' }] }] },
  ...ASG_BOOKS.filter(b => !b.noSource).map(b => ({ id: b.id, title: b.title, grade: b.grade, subject: b.subject, board: b.board,
    chapters: b.chapters.map(c => ({ id: c.id, title: c.title, topics: c.topics.map(t => ({ id: t.id, title: t.title })) })) })),
];
const cs2Book = id => CS2_BOOKS.find(b => b.id === id);
const cs2Books = () => CS2_BOOKS.map(b => ({ id: b.id, grade: b.grade, subject: b.subject, title: b.title, board: b.board }));
const cs2Sample = () => ({ ...cs2Defaults(), bookId: 'c4c', topics: ['cw_intro', 'cw_case', 'cw_fx', 'cw_spell'] });
/* every topic of the picked book, in book order, with the chapter it belongs to */
const cs2AllTopics = b => (b ? b.chapters.flatMap(c => c.topics.map(t => ({ ...t, chapter: c.title }))) : []);

/* ---------- Small helpers ---------- */
function cs2Rng(seed) { let s = (seed >>> 0) || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
const cs2Marks = n => `${n} mark${n === 1 ? '' : 's'}`;
const CS2_NAMES = ['Rina', 'Aarav', 'Meera', 'Kabir', 'Anaya', 'Dev'];
const CS2_PLACES = ['a school project', 'the class magazine', 'a trip report', 'a science fair poster', 'a story for the school library'];

/* ---------- Content ---------- */
function cs2Scenario(c) {
  const { name, topics, place, kind, n, subject } = c, list = topics.length > 1 ? `${topics.slice(0, -1).join(', ')} and ${topics[topics.length - 1]}` : topics[0];
  const paras = [
    `${name} is working on ${place} for ${subject} class. ${name} wants the work to look neat and be easy for friends to understand.`,
    `${name} remembers what the teacher taught about ${list}. These ideas help turn a rough first attempt into good work, like decorating a school project with colourful pens and neat writing.`,
    kind === 'problem' ? `While working, ${name} meets a few problems and must decide which idea from the lesson solves each one.` : `While working, ${name} notices a few things that need to be changed and must decide which idea from the lesson to use.`,
    `${name} looks at the first topic, ${topics[0]}, and thinks carefully about how it can be used. ${name} also checks the finished work again for mistakes.`,
    `At the end, ${name} shows the work to the class and explains why each choice was made.`,
  ];
  return paras.slice(0, n);
}

/* one question about topic t; i = position, bloom = the Bloom level asked for */
function cs2Question(i, c) {
  const { ri, topic, name, bloom } = c, tp = topic.title, L = 'ABCD';
  const mcq = i % 2 === 0, marks = mcq ? 1 : (c.hard ? 3 : 2);
  const stem = { Remember: `What is the main purpose of “${tp}” in ${name}'s work?`, Understand: `Why does ${name} use “${tp}” in this case study?`, Apply: `${name} wants to use “${tp}” on the work. What should ${name} do first?`,
    Analyze: `${name} used “${tp}” but the result did not look right. What is the most likely reason?`, Evaluate: `${name} must decide whether “${tp}” is the best choice here. Which reason supports the choice?`, Create: `${name} plans to combine “${tp}” with another idea. Which plan is best?` }[bloom];
  if (mcq) {
    const right = `To make the work clear, correct and easy to read by using “${tp}”`, wrong = ['To make the computer run faster', 'To save the work in another folder', 'To draw a picture that is not needed'];
    const at = ri(0, 3), options = [...wrong]; options.splice(at, 0, right);
    return { type: 'mcq', marks, text: stem, options, correct: at, ans: [], explanation: `“${tp}” helps ${name} improve the work, so the best answer is: ${right.charAt(0).toLowerCase() + right.slice(1)}.` };
  }
  const ans = [`${name} should use “${tp}” because it improves the work.`, `A good answer names “${tp}”, says what it does, and links it to ${name}'s situation.`];
  return { type: 'short', marks, text: `${stem} Explain your answer in your own words.`, lines: CS2_LINES, ans, explanation: `Award full marks for naming “${tp}”, explaining what it does and linking it to the case study; part marks for any one of these.` };
}

function cs2Build(f, seed = Date.now()) {
  const b = cs2Book(f.bookId), rnd = cs2Rng(seed), ri = (a, z) => a + Math.floor(rnd() * (z - a + 1));
  const all = cs2AllTopics(b), picked = f.topics.map(id => all.find(t => t.id === id)).filter(Boolean), titles = picked.map(t => t.title);
  const name = CS2_NAMES[ri(0, CS2_NAMES.length - 1)], place = CS2_PLACES[ri(0, CS2_PLACES.length - 1)], kind = f.type === 'ai' ? ['story', 'real', 'problem'][ri(0, 2)] : f.type;
  const blooms = f.blooms.length ? f.blooms : ['Remember', 'Understand', 'Apply'], count = Math.max(CS2_COUNT[0], Math.min(CS2_COUNT[1], +f.count || 5));
  const questions = Array.from({ length: count }, (_, i) => ({ number: i + 1, ...cs2Question(i, { ri, topic: picked[i % picked.length], name, bloom: blooms[i % blooms.length], hard: f.difficulty === 'Hard' }) }));
  const suffix = { story: 'Story', real: 'Case', problem: 'Challenge' }[kind];
  const skills = titles.slice(0, 4).map(t => `Understanding ${t}`);
  return {
    id: 'cs' + seed, title: `${name}'s ${picked[0].title} ${suffix}`, subject: b.subject, grade: b.grade, difficulty: f.difficulty, chapter: picked[0].chapter, topics: titles, skills,
    /* the settings it was built from, shown as chips at the top of the Teacher view */
    blooms, typeLabel: CS2_TYPES.find(x => x[0] === f.type)[1], length: f.length, lang: f.lang, objective: f.objective.trim(),
    scenario: cs2Scenario({ name, topics: titles, place, kind, n: CS2_PARAS[f.length] || 4, subject: b.subject }),
    instruction: `Read ${name}'s case study carefully. Then answer the questions that follow.${f.objective ? ` Goal: ${f.objective}` : ''}`,
    time: String(Math.max(10, count * 3)), total_marks: questions.reduce((s, q) => s + q.marks, 0), questions,
  };
}
