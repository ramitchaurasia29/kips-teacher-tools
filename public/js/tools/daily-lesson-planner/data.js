/* =========================================================
   Daily lesson planner - catalogue + generation engine
   PRD v1.3 / Output format v2.0: §3 inputs, §4 precedence, §5 output blocks,
   §8 schema, §9 teaching styles, §10 pedagogies, §14 checks, §15 timing fix.
   dlpBuild() is a local mock of the LLM pipeline (§6); swap it for the real service.
   ========================================================= */

const DLP_STYLES = ['AI Recommended', 'Lecture Mode', 'Socratic Method', 'Story Mode', 'Example First Approach', 'Step-by-Step Guided Learning', 'Demonstration-Based Teaching'];
const DLP_PEDS = ['AI Recommended', 'Constructivist Approach', 'Collaborative Learning', 'Inquiry-Based Learning', 'Direct Instruction', 'Project-Based Learning'];
const DLP_BLOOMS = ['Remembering', 'Understanding', 'Applying', 'Analyzing', 'Evaluating', 'Creating'];
const DLP_DURATIONS = [15, 20, 30, 40, 45, 60];
/* §21: option lists for Engagement Activity and Homework are configuration; these are placeholders */
const DLP_ENGAGE = ['Picture/card sort', 'Think-pair-share', 'Quick quiz', 'Role play', 'Group chart'];
const DLP_HOMEWORK = ['No homework', 'Optional observation task', 'Short practice', 'Reading task'];

const DLP_CATALOGUE = [
  { id: 'g3sci', grade: 3, subject: 'General Science', chapters: [{ title: 'Living Things Around Us', topics: ['Living and Non-living Things'] }, { title: 'Plants Around Us', topics: ['Roots and Stems', 'Leaves and Flowers'] }] },
  { id: 'g4eng', grade: 4, subject: 'English', chapters: [{ title: 'Nouns', topics: ['Common and proper nouns', 'Singular and plural'] }] },
  { id: 'g5mat', grade: 5, subject: 'Maths', chapters: [{ title: 'Money', topics: ['Money and Shopping', 'Profit and loss basics'] }] },
  { id: 'g7sci', grade: 7, subject: 'Science', chapters: [{ title: 'Nutrition in Plants', topics: ['Photosynthesis', 'Modes of nutrition'] }] },
];
function dlpTopics(grade, bookId) {
  return DLP_CATALOGUE.filter(b => (!grade || b.grade === +grade) && (!bookId || b.id === bookId)).flatMap(b => b.chapters.flatMap((c, ci) => c.topics.map((t, ti) => ({ key: `${b.id}|${ci}|${ti}`, grade: b.grade, subject: b.subject, chapter: c.title, title: t }))));
}
const dlpTopicByKey = k => dlpTopics().find(t => t.key === k);

/* ---------- Topic knowledge for the mock (the real tool retrieves this from the book / reference document) ---------- */
const DLP_KB = {
  'Living and Non-living Things': {
    concepts: [
      { name: 'Living things', explanation: 'Living things grow, need food, water and air, respond to the world around them and make more of their own kind.', points: ['They grow and change over time.', 'They need food, water and air.', 'They respond to light, touch or sound.', 'They reproduce.'], example: 'A puppy grows into a dog and needs food and water every day.', analogy: 'A living thing is like a clock that keeps running by itself.', questions: ['What does a plant need to stay alive?', 'How can we tell that a puppy is living?'] },
      { name: 'Non-living things', explanation: 'Non-living things do not grow, eat, breathe or make more of their own kind, even when they move.', points: ['They do not grow on their own.', 'They do not need food, water or air.', 'They can move only when something pushes or pulls them.'], example: 'A toy car rolls when pushed but does not grow or need food.', analogy: 'A non-living thing is like a stopped clock: it does nothing by itself.', questions: ['Can a toy car grow?', 'What makes a toy car move?'] },
    ],
    keyConcepts: ['Living things grow, breathe, need food and reproduce', 'Non-living things do not grow or reproduce', 'Movement alone does not make something living'],
    prereqs: ['Names of common animals, plants and everyday objects', 'Comparing two things by what they do'],
    misconceptions: [['Anything that moves is living.', 'Show a rolling toy car and a still seed. Ask what each can do on its own, then sort again using the signs of life.'], ['Plants are not living because they do not move.', 'Show photos of a seedling over several days and ask students to find the signs of growth.'], ['Fire is living because it grows and needs air.', 'Ask whether fire eats food, reproduces or responds, and compare it with a living thing.']],
    resources: ['Picture cards of living and non-living things', 'Sorting chart with two columns', 'A toy car', 'A small potted plant (or a picture)'],
    demo: 'a toy car pushed across the desk beside a seed in a cup of damp cotton', demoResources: ['A toy car', 'A small potted plant (or a picture)'],
    investigation: 'Which of these things are living, and how do we know?', groupTask: 'sort 8 picture cards into living and non-living and give one reason for each', driving: 'Make a one-page “Living or Non-living?” chart for the class corner',
    story: 'a child named Asha who finds a puppy, a stone and a toy car in the park', final: 'A wind-up toy moves and makes a noise. Is it living? Give one reason.',
    takeaways: ['Living things grow, need food, water and air, and reproduce.', 'Non-living things do not grow or reproduce.', 'Moving alone does not make something living.'],
    homework: { title: 'Living or non-living at home', minutes: 10, instructions: 'With an adult, find three living and three non-living things at home and write one reason for each.' },
  },
  'Roots and Stems': {
    concepts: [
      { name: 'Roots', explanation: 'Roots hold the plant in the soil and take in water and minerals.', points: ['Roots grow down into the soil.', 'They take in water and minerals.', 'Some roots store food, like a carrot.'], example: 'A carrot is a root that stores food.', analogy: 'Roots are like straws that drink water from the soil.', questions: ['Where do roots grow?', 'What do roots take in?'] },
      { name: 'Stems', explanation: 'The stem holds the plant upright and carries water from the roots to the leaves.', points: ['The stem holds the plant up.', 'It carries water and food through the plant.', 'Stems can be thin, thick or woody.'], example: 'Celery in coloured water shows water climbing up the stem.', analogy: 'The stem is like a pipe with a long straw inside.', questions: ['What does the stem do for a plant?', 'How does water reach the leaves?'] },
    ],
    keyConcepts: ['Roots hold the plant and take in water', 'Stems hold the plant upright and carry water', 'Different plants have different roots and stems'],
    prereqs: ['Names of common plants', 'Parts of a plant: leaf, flower'],
    misconceptions: [['Roots only hold the plant in the soil.', 'Show roots drawing up coloured water and ask what else roots do.'], ['All stems are green and thin.', 'Show a tree trunk and a rose stem, and ask what they have in common.']],
    resources: ['Real plants with roots (or pictures)', 'Celery stalk and coloured water', 'Chart paper and markers'],
    demo: 'a celery stalk standing in coloured water', demoResources: ['Celery stalk', 'Coloured water in a glass'],
    investigation: 'How does water get from the soil to the leaves?', groupTask: 'label the roots and stem on a plant picture and say what each part does', driving: 'Make a labelled poster of a plant’s roots and stem',
    story: 'a seed named Beeju that grows roots and a stem', final: 'What would happen to a plant if its roots were cut?',
    takeaways: ['Roots hold the plant and take in water and minerals.', 'The stem holds the plant up and carries water.', 'Plants need both roots and stems to grow.'],
    homework: { title: 'Look at roots and stems', minutes: 10, instructions: 'With an adult, look at a plant at home and draw its root (if you can see it) and its stem. Write one job for each.' },
  },
  'Photosynthesis': {
    concepts: [
      { name: 'Photosynthesis', explanation: 'Photosynthesis is how green plants make their own food using sunlight, water and carbon dioxide.', points: ['It happens mainly in the leaves.', 'Plants need sunlight, water and carbon dioxide.', 'It makes food (sugar) and releases oxygen.'], example: 'A plant kept in sunlight makes more food than one kept in a dark cupboard.', analogy: 'A leaf is like a small kitchen that cooks food using sunlight.', questions: ['What does a plant need to make food?', 'What gas is released?'] },
      { name: 'Chlorophyll', explanation: 'Chlorophyll is the green pigment in leaves that traps sunlight.', points: ['It gives leaves their green colour.', 'It traps energy from sunlight.', 'Most of it is in the leaves.'], example: 'Leaves of a plant kept in the dark turn pale because there is less chlorophyll.', analogy: 'Chlorophyll is like a solar panel for the leaf.', questions: ['Why are leaves green?', 'What does chlorophyll trap?'] },
    ],
    keyConcepts: ['Photosynthesis makes food for the plant', 'Sunlight, water and carbon dioxide are needed', 'Oxygen is released'],
    prereqs: ['Parts of a plant', 'Plants need sunlight and water'],
    misconceptions: [['Plants get food from the soil.', 'Compare a plant grown in water in sunlight with one in the dark, and ask where the food comes from.'], ['Photosynthesis happens at night.', 'Ask what is needed for photosynthesis and when it is available.']],
    resources: ['Two potted plants (or pictures)', 'A green leaf', 'Chart paper and markers'],
    demo: 'a leaf and a diagram of the inputs and outputs of photosynthesis', demoResources: ['A green leaf', 'Chart showing inputs and outputs'],
    investigation: 'What does a plant need to make its food?', groupTask: 'complete a chart of what goes into and comes out of a leaf', driving: 'Make a poster that explains photosynthesis to a younger class',
    story: 'a leaf named Lila that makes lunch with sunlight', final: 'What would happen to a plant that gets no sunlight for a week?',
    takeaways: ['Photosynthesis is how plants make food.', 'Sunlight, water and carbon dioxide are needed.', 'Oxygen is released.'],
    homework: { title: 'Plant in the sun', minutes: 10, instructions: 'With an adult, look at two plants, one in sun and one in shade, and write what you notice about the leaves.' },
  },
  'Money and Shopping': {
    concepts: [
      { name: 'Rupees and paise', explanation: 'One rupee is made of 100 paise. We use notes and coins to pay.', points: ['₹1 = 100 paise.', 'Coins and notes have different values.', 'We add values to find the total.'], example: '3 pens at ₹12 each cost 3 × 12 = ₹36.', analogy: 'Rupees and paise are like metres and centimetres.', questions: ['How many paise make one rupee?', 'What is the cost of 3 pens at ₹12 each?'] },
      { name: 'Making change', explanation: 'Change is the money given back: the money paid minus the cost.', points: ['Change = money paid − cost.', 'Count up from the cost to the money paid.', 'Check by adding the change to the cost.'], example: 'A notebook costs ₹45 and you pay ₹50, so the change is ₹5.', analogy: 'Change is the part of your money that comes back to you.', questions: ['What is the change from ₹50 for a ₹45 notebook?', 'How can we check the change?'] },
    ],
    keyConcepts: ['₹1 = 100 paise', 'Total cost = number of items × price', 'Change = money paid − cost'],
    prereqs: ['Addition and subtraction up to 1000', 'Multiplication tables up to 10'],
    misconceptions: [['The bigger note is always worth more to carry.', 'Compare amounts by value, not by size, using a few play notes.'], ['Change is the money you pay.', 'Act out a shop: show that change is paid minus cost.']],
    resources: ['Play money notes and coins', 'Price tags for 5 items', 'Chart paper and markers'],
    demo: 'a mini shop with price tags and play money', demoResources: ['Play money notes and coins', 'Price tags for 5 items'],
    investigation: 'How much change should we get when we pay with a bigger note?', groupTask: 'buy two items from the class shop and work out the total and the change', driving: 'Set up a class shop and write bills for three customers',
    story: 'a child named Ravi who goes to buy stationery with ₹100', final: 'Ravi buys a ruler for ₹15 and an eraser for ₹5 and pays ₹50. How much change should he get?',
    takeaways: ['₹1 is 100 paise.', 'Total cost is items × price.', 'Change is money paid minus cost.'],
    homework: { title: 'A shopping bill at home', minutes: 10, instructions: 'With an adult, look at a real shop bill, add up two items and find the change from a ₹100 note.' },
  },
};
function dlpGenericKB(t) {
  const T = t.title;
  return {
    concepts: [{ name: T, explanation: `Explain the main idea of “${T}” in simple words, using the textbook explanation.`, points: ['Define the key term.', 'Give one everyday example.', 'Link it to what students already know.'], example: `An everyday situation that shows ${T}.`, analogy: `Compare ${T} with something familiar to the students.`, questions: [`What is ${T}?`, `Where have you seen ${T}?`] }],
    keyConcepts: [`The main idea of ${T}`, `An everyday example of ${T}`], prereqs: [`What students already know about ${t.chapter}`],
    misconceptions: [[`${T} is only something we learn for exams.`, `Show where ${T} appears in everyday life and ask students for examples.`]],
    resources: ['Board and markers', `Examples of ${T} from the classroom`], demo: `a simple demonstration of ${T} using classroom objects`, demoResources: ['Simple objects from the classroom'],
    investigation: `What can we find out about ${T}?`, groupTask: `list and explain three examples of ${T}`, driving: `Make a one-page poster that explains ${T}`, story: `a child who meets ${T} on the way to school`,
    final: `In one sentence, what is ${T}?`, takeaways: [`The main idea of ${T}.`, `An everyday example of ${T}.`], homework: { title: `Spot ${T} at home`, minutes: 10, instructions: `With an adult, find one example of ${T} at home and write one sentence about it.` },
  };
}
function dlpMergeKB(topics) {
  const kbs = topics.map(t => DLP_KB[t.title] || dlpGenericKB(t)), first = kbs[0];
  const take = (f, n) => [...new Set(kbs.flatMap(k => k[f]))].slice(0, n);
  return { ...first, concepts: kbs.flatMap(k => k.concepts.slice(0, topics.length > 1 ? 1 : 2)).slice(0, 3), keyConcepts: take('keyConcepts', 5), prereqs: take('prereqs', 4), misconceptions: kbs.flatMap(k => k.misconceptions).slice(0, 3), resources: take('resources', 5) };
}

/* ---------- §4 AI Recommended resolution ---------- */
function dlpResolve(form, subject, duration) {
  const rec = { science: ['Example First Approach', 'Inquiry-Based Learning'], maths: ['Step-by-Step Guided Learning', 'Direct Instruction'], english: ['Story Mode', 'Collaborative Learning'] };
  const k = /math/i.test(subject) ? 'maths' : /english|hindi/i.test(subject) ? 'english' : /sci|evs/i.test(subject) ? 'science' : null;
  let [s, p] = rec[k] || ['Lecture Mode', 'Collaborative Learning'];
  if (form.pedagogy !== 'AI Recommended') { if (form.style === 'AI Recommended') s = ({ 'Inquiry-Based Learning': 'Example First Approach', 'Direct Instruction': 'Step-by-Step Guided Learning', 'Project-Based Learning': 'Story Mode', 'Collaborative Learning': 'Lecture Mode', 'Constructivist Approach': 'Socratic Method' })[form.pedagogy] || s; }
  else if (form.style !== 'AI Recommended') p = ({ 'Socratic Method': 'Constructivist Approach', 'Story Mode': 'Collaborative Learning', 'Demonstration-Based Teaching': 'Inquiry-Based Learning', 'Step-by-Step Guided Learning': 'Direct Instruction', 'Lecture Mode': 'Direct Instruction', 'Example First Approach': 'Inquiry-Based Learning' })[form.style] || p;
  else if (duration <= 25) p = 'Direct Instruction';
  return { style: form.style === 'AI Recommended' ? s : form.style, pedagogy: form.pedagogy === 'AI Recommended' ? p : form.pedagogy };
}

/* ---------- Stage writers (style = how it is taught, pedagogy = how students learn) ---------- */
const DLP_STAGE_PLANS = {
  4: [['hook', 15], ['introduce', 30], ['explore', 40], ['close', 15]],
  5: [['hook', 12], ['introduce', 28], ['explore', 32], ['apply', 18], ['close', 10]],
  6: [['hook', 10], ['introduce', 22], ['explore', 28], ['explain', 15], ['apply', 15], ['close', 10]],
  7: [['hook', 8], ['introduce', 18], ['guided', 12], ['explore', 22], ['explain', 12], ['apply', 20], ['close', 8]],
};
const dlpStageCount = d => d <= 20 ? 4 : d <= 35 ? 5 : d <= 60 ? 6 : 7;

function dlpStyleStage(c, r) {
  const k = c.kb, a = k.concepts[0], b = k.concepts[1] || a, T = c.T;
  switch (c.style) {
    case 'Lecture Mode': return { title: 'Explain the key ideas', purpose: `Teach the key ideas of ${T} clearly in short steps with checks.`, t: [`Write the learning goal on the board and read it aloud.`, `Explain ${a.name}: ${a.explanation} Pause after each point and ask one quick check question.`, `Show the example: ${a.example}`], s: ['Listen and copy the key words into notebooks.', 'Answer each quick check question in one sentence.'], res: ['Board and markers'], ev: ['Quick check answers are correct'] };
    case 'Socratic Method': return { title: 'Question and reason', purpose: `Draw out students’ reasoning about ${T} through a sequence of questions.`, t: [`Ask: “${a.questions[0]}” and let three students answer before you respond.`, `Follow up with “Why do you think so?” and “Can you give an example?”`, `Pull the answers together and state the idea clearly: ${a.explanation}`], s: ['Share and justify ideas with a partner, then with the class.', 'Change or keep their answer after hearing others.'], res: ['Board and markers'], ev: ['Students give reasons, not only answers'] };
    case 'Story Mode': return { title: 'Story: meet the idea', purpose: `Introduce ${T} through a short story, then name the idea clearly.`, t: [`Tell a short story about ${k.story}. Stop twice and ask what the child should notice.`, `Link the story to the key idea: ${a.explanation}`], s: ['Listen, predict what happens next and name what the child notices.', 'Retell the key idea of the story in one sentence.'], res: ['Story prompts read aloud by the teacher'], ev: ['Retelling includes the key idea'] };
    case 'Example First Approach': return { title: 'Look at examples first', purpose: `Let students notice a pattern in concrete examples of ${T} before the idea is named.`, t: [`Show three concrete examples, such as ${a.example.charAt(0).toLowerCase() + a.example.slice(1)} Do not name the concept yet.`, 'Ask: “What is the same? What is different?” and record the answers.', `Name the concept and explain it: ${a.explanation}`], s: ['Look closely at each example and say what they notice.', 'Suggest the pattern in their own words before the term is given.'], res: [k.resources[0], 'Board and markers'], ev: ['Students describe the pattern before the term is given'] };
    case 'Step-by-Step Guided Learning': return { title: 'Learn it step by step', purpose: `Break ${T} into small steps and release the steps gradually to students.`, t: [`Break the idea into steps: ${a.points.slice(0, 3).join('; ')}.`, 'Model step 1 aloud, guide the class through step 2, then check step 3 with a thumbs-up.'], s: ['Follow each step with the teacher.', 'Try the last step on their own and show an answer.'], res: ['Board and markers', 'Worked-example cards'], ev: ['Students complete the last step correctly'] };
    default: return { title: 'Watch and predict', purpose: `Use a short demonstration to show ${T} and connect what is seen to the idea.`, t: [`Set up a safe demonstration: ${k.demo}.`, 'Ask students to predict, run the demonstration and ask what they observe.', `Explain the result and connect it to ${a.name}. If materials are not available, use pictures and describe the steps aloud.`], s: ['Predict what will happen and write it down.', 'Observe and say what changed.'], res: k.demoResources, ev: ['Predictions are compared with what was observed'] };
  }
}
function dlpPedStage(c, r) {
  const k = c.kb, T = c.T;
  switch (c.ped) {
    case 'Constructivist Approach': return { title: 'Build and compare ideas', purpose: `Let students compare their own ideas about ${T} with examples and revise them.`, t: [`Ask students to write what they already think about ${T}.`, 'Give pairs four examples to compare with their ideas.', 'Bring ideas together and revisit the first ideas: what changed?'], s: ['Compare the examples with their own first ideas.', 'Revise or confirm their ideas and explain why.'], res: ['Notebooks or sticky notes', k.resources[0]], ev: ['Students explain how their idea changed'] };
    case 'Collaborative Learning': return { title: 'Group task', purpose: `Students work in roles on a shared task about ${T}, with individual accountability.`, t: ['Form groups of four with roles: reader, recorder, speaker and checker.', `Give each group a shared task: ${k.groupTask}.`, 'Walk around, ask each member to explain one answer, and hold a two-minute debrief.'], s: ['Do their role and complete the shared task.', 'Each member explains one answer to the group.'], res: ['Group task sheet', 'Role cards'], ev: ['Each member can explain one answer'] };
    case 'Inquiry-Based Learning': return { title: 'Investigate', purpose: `Students investigate a question about ${T} and explain what the evidence shows.`, t: [`Pose the question: “${k.investigation}”`, 'Ask students to predict, observe or sort the examples and record what they find.', 'Ask groups to explain what the evidence shows and what they would test next.'], s: ['Predict, observe and record what they find.', 'Explain their answer using the evidence.'], res: [...k.demoResources, 'Recording sheet'], ev: ['Explanations use the recorded evidence'] };
    case 'Direct Instruction': return { title: 'Guided and independent practice', purpose: `Practise ${T} with teacher feedback, moving from guided to independent work.`, t: [`State the goal and model one worked example on ${T} aloud.`, 'Run guided practice with three items, checking each answer.', 'Give three items for independent practice and give feedback.'], s: ['Follow the worked example and try the guided items.', 'Complete three items independently.'], res: ['Practice questions (3 guided, 3 independent)'], ev: ['Independent items are mostly correct'] };
    default: return { title: 'Make a mini product', purpose: `Students make a small product about ${T} within the lesson.`, t: [`Give the challenge: “${k.driving}”. Show a model of a one-page product.`, 'Set three short milestones inside the lesson: plan, make and share.', 'Check each product against a three-point checklist.'], s: ['Plan, make and share a one-page product.', 'Use the checklist to improve it.'], res: ['Chart paper and markers', 'Product checklist'], ev: ['Product meets the three-point checklist'] };
  }
}
function dlpStage(c, kind, r) {
  const k = c.kb, T = c.T, m0 = k.misconceptions[0];
  if (kind === 'hook') {
    const v = pick(r, [0, 1, 2]);
    return [{ title: 'Hook and prior knowledge', purpose: `Find out what students already know about ${T}.`, t: [`Greet the class and ask: “What do you already know about ${T}?”`, 'Write three ideas on the board.'], s: ['Share what they know with a partner.', 'Add one idea to the class list.'], res: ['Board and markers'], ev: ['Students share at least one prior idea'] },
      { title: 'Hook and prior knowledge', purpose: `Spark interest in ${T} with a picture or object.`, t: [`Show ${k.resources[0] ? k.resources[0].toLowerCase() : 'a picture'} and ask: “What do you notice?”`, 'Record two or three observations.'], s: ['Look closely and say what they notice.', 'Ask one question of their own.'], res: [k.resources[0] || 'A picture or object'], ev: ['Students ask or answer one question about the topic'] },
      { title: 'Hook and prior knowledge', purpose: `Start with a puzzling question about ${T}.`, t: [`Ask: “${k.investigation}” and take quick answers.`, 'Tell students they will find out during the lesson.'], s: ['Give a quick guess and a reason.', 'Listen to others’ guesses.'], res: ['Board and markers'], ev: ['Students give a guess with a reason'] }][v];
  }
  if (kind === 'introduce') return dlpStyleStage(c, r);
  if (kind === 'guided') return { title: 'Guided practice: try it together', purpose: `Practise the new idea about ${T} together with teacher support.`, t: ['Work through one item with the class, thinking aloud.', 'Give a similar item and check answers on mini boards or fingers.'], s: ['Try the item with a partner.', 'Show the answer and explain it.'], res: ['Mini boards or notebooks'], ev: ['Most students show a correct answer'] };
  if (kind === 'explore') {
    const s = dlpPedStage(c, r);
    if (c.engage) { s.t = [...s.t, `Include the engagement activity: ${c.engage}, adapted to the time available.`]; s.s = [...s.s, `Take part in the activity: ${c.engage}.`]; s.res = [...s.res, `Materials for: ${c.engage}`]; }
    return s;
  }
  if (kind === 'explain') return { title: 'Explain and consolidate', purpose: `Pull the learning about ${T} together and correct common mistakes.`, t: [`Summarise the key ideas: ${k.keyConcepts.join('; ')}.`, `Address the common misconception: “${m0[0]}” ${m0[1]}`], s: ['Write a short summary in their notebooks.', 'Correct any earlier idea that was wrong.'], res: ['Board and markers'], ev: ['Summaries include the key ideas'] };
  if (kind === 'apply') return { title: 'Apply and check', purpose: `Check that students can use ${T} on their own.`, t: ['Give three questions: one to recall, one to explain and one to use in everyday life.', 'Check answers and note who needs more support.'], s: ['Answer the three questions on their own.', 'Swap with a partner and check.'], res: ['Question slips (3 questions)'], ev: ['Correct answers to the three questions'] };
  return { title: 'Closure', purpose: `Bring the lesson to a close and check the main idea of ${T}.`, t: ['Ask students to say the key takeaways.', `Ask the final question: “${k.final}”`], s: ['State one thing they learned.', 'Answer the final question.'], res: [], ev: ['Students answer the final question correctly'] };
}

/* ---------- Lesson plan JSON (§8) ---------- */
function dlpWeights(durations, weights) { return largestRemainder(weights, durations); }
const dlpStamp = () => 'v1.3';
function dlpBuild(form, opts = {}) {
  const topics = form.topics.map(dlpTopicByKey).filter(Boolean), seed = opts.seed ?? hashStr(JSON.stringify([form, Date.now()])), r = rngFrom(seed);
  const T0 = topics[0] || { title: 'the topic', subject: 'General', chapter: '', grade: +form.grade || '' };
  const subjects = [...new Set(topics.map(t => t.subject))], chapters = [...new Set(topics.map(t => t.chapter))];
  const grade = form.grade ? +form.grade : T0.grade, subject = subjects.join(' / ') || '', duration = +form.duration || 45, durationSource = +form.duration ? 'user' : 'ai_suggested';
  const res = dlpResolve(form, subjects[0] || '', duration), kb = topics.length ? dlpMergeKB(topics) : dlpGenericKB(T0), T = topics.map(t => t.title).join(' and ') || T0.title;
  const engage = (form.engage || '').trim(), blooms = form.blooms.length ? form.blooms : [];
  // objectives: honour the teacher's own, otherwise write measurable ones
  const verbs = { Remembering: ['Name', 'the key terms in'], Understanding: ['Explain', 'the main ideas of'], Applying: ['Use', 'what they learned about'], Analyzing: ['Compare', 'examples of'], Evaluating: ['Judge', 'a claim about'], Creating: ['Design', 'something that shows'] };
  const userObj = (form.objectives || '').split('\n').map(x => x.trim()).filter(Boolean);
  const levels = blooms.length ? blooms : ['Remembering', 'Understanding', 'Applying'];
  const alt = { Remembering: `Recall examples of ${T}.`, Understanding: `Describe ${T} using their own examples.`, Applying: `Solve a new problem using ${T}.`, Analyzing: `Find what is the same and different in examples of ${T}.`, Evaluating: `Decide whether a statement about ${T} is correct and say why.`, Creating: `Make a new example of ${T}.` }, seen = {};
  const objectives = (userObj.length ? userObj : [0, 1, 2].map(i => { const lv = levels[i % levels.length], v = verbs[lv]; seen[lv] = (seen[lv] || 0) + 1; return seen[lv] > 1 ? alt[lv] : `${v[0]} ${v[1]} ${T}${lv === 'Applying' || lv === 'Creating' ? ' in an everyday example' : ''}.`; })).map((text, i) => ({ id: 'LO' + (i + 1), text, bloom_level: levels[i % levels.length] }));
  const ids = objectives.map(o => o.id);
  // stages and exact timing
  const plan = DLP_STAGE_PLANS[dlpStageCount(duration)], mins = largestRemainder(plan.map(p => p[1]), duration);
  const ctx = { kb, T, style: res.style, ped: res.pedagogy, engage };
  let at = 0;
  const flow = plan.map(([kind], i) => { const s = dlpStage(ctx, kind, rngFrom(seed + i * 131)), d = mins[i]; const st = { stage_number: i + 1, title: s.title, start_minute: at, end_minute: at + d, duration_minutes: d, purpose: s.purpose, teacher_actions: s.t, student_actions: s.s, resources: [...new Set(s.res.filter(Boolean))], assessment_evidence: s.ev, objective_ids: [ids[i % ids.length]], _kind: kind }; at += d; return st; });
  flow.forEach(s => { if (['introduce', 'explore'].includes(s._kind)) s.objective_ids = [...new Set([...s.objective_ids, ids[(s.stage_number) % ids.length]])]; });
  const explore = flow.find(s => s._kind === 'explore'); ids.forEach(id => { if (!flow.some(s => s.objective_ids.includes(id))) explore.objective_ids.push(id); });
  const apply = flow.find(s => s._kind === 'apply') || flow[flow.length - 2];
  // activities (each sits inside its stage's time, §14 check 15)
  const act = (title, type, st, share, text) => ({ title, type, stage_number: st.stage_number, duration_minutes: Math.max(1, Math.min(st.duration_minutes, Math.round(st.duration_minutes * share))), instructions: text, serves_objective_ids: st.objective_ids.slice() });
  const activities = [];
  if (engage) activities.push(act(engage, 'Engagement activity', explore, .4, `Do the activity “${engage}” as shown by your teacher, and be ready to say what you learned.`));
  activities.push(act(explore.title, res.pedagogy, explore, .6, explore.student_actions.join(' ')));
  activities.push(act('Three-question check', 'Independent check', apply, .7, 'Answer the three questions on your own, then swap with a partner and check.'));
  // teaching resources traced to stages (must match stage resources exactly)
  const resMap = new Map(); flow.forEach(s => s.resources.forEach(x => resMap.set(x, [...(resMap.get(x) || []), s.stage_number])));
  const hwText = (form.homework || '').trim(), noHw = /^no homework|^none$/i.test(hwText);
  const homework = noHw ? { included: false, optional: false, title: '', estimated_minutes: 0, instructions: '' } : { included: true, optional: true, title: hwText && !DLP_HOMEWORK.includes(hwText) ? hwText : kb.homework.title, estimated_minutes: kb.homework.minutes, instructions: hwText && !DLP_HOMEWORK.includes(hwText) ? `${hwText}. ${kb.homework.instructions}` : kb.homework.instructions };
  const q = { warm_up: [`What do you already know about ${T}?`, kb.concepts[0].questions[0]], during_lesson: [kb.concepts[0].questions[1] || kb.concepts[0].questions[0], `Why do you think so?`], concept_check: [kb.concepts[(1) % kb.concepts.length].questions[0], `Can you give an example of ${kb.concepts[0].name.toLowerCase()}?`], closure: [kb.final, 'What is one thing you learned today?'] };
  const plan2 = {
    metadata: { title: `${T}`, chapter: chapters.join(', '), topic: T, grade: grade ? String(grade) : '', subject, duration_minutes: duration, duration_source: durationSource, stage_count: flow.length, blooms_level: blooms.length ? blooms.join(' and ') : 'Balanced progression', teaching_style_selected: form.style, teaching_style_resolved: res.style, pedagogy_selected: form.pedagogy, pedagogy_resolved: res.pedagogy, plan_version: '1', prompt_version: dlpStamp(), renderer_version: dlpStamp(), seed },
    learning_objectives: objectives, key_concepts: kb.keyConcepts, prerequisites: kb.prereqs, lesson_flow: flow,
    teacher_guidance: kb.concepts.map(c => ({ concept: c.name, explanation: c.explanation, points: c.points, real_life_example: c.example, analogy: c.analogy, questions_to_ask: c.questions })),
    student_activities: activities, questions_to_ask: q,
    common_misconceptions: kb.misconceptions.map(m => ({ misconception: m[0], intervention: m[1] })),
    teaching_resources: [...resMap].map(([item, st]) => ({ item, used_in_stages: st })),
    assessment: { methods: ['Observe responses during the lesson', 'Check the three-question exercise', 'Listen to the final question answers'], objective_checks: objectives.map(o => ({ objective_id: o.id, objective_text: o.text, how_to_check: o.id === ids[0] ? 'Ask students to share ideas and examples aloud.' : o.id === ids[1] ? 'Check their explanation in the notebook summary.' : 'Check the answer to the application question.' })) },
    homework, differentiation: { needs_support: ['Give picture cards and sentence starters.', 'Pair with a partner and let them answer orally first.'], standard: ['Complete the stage tasks and the three-question check.', 'Explain one answer in their own words.'], advanced: ['Give a second example and say why it fits.', 'Make up one new question for the class.'] },
    lesson_closure: { key_takeaways: kb.takeaways, final_question: kb.final }, generation_notes: { assumptions: [], warnings: [] },
  };
  if (durationSource === 'ai_suggested') plan2.generation_notes.assumptions.push(`No duration supplied; ${duration} minutes suggested.`);
  dlpFix(plan2); plan2._form = form; return plan2;
}

/* §15: deterministic timing fix, §14 checks 7 and 16 */
function dlpFix(p) {
  const f = p.lesson_flow; let at = 0, sum = f.reduce((a, s) => a + s.duration_minutes, 0);
  if (sum !== p.metadata.duration_minutes) { const big = f.reduce((m, s) => s.duration_minutes > m.duration_minutes ? s : m); big.duration_minutes += p.metadata.duration_minutes - sum; }
  f.forEach(s => { s.start_minute = at; at += s.duration_minutes; s.end_minute = at; });
  const clean = a => a.map(x => String(x).trim()).filter(Boolean);
  f.forEach(s => { s.teacher_actions = clean(s.teacher_actions); s.student_actions = clean(s.student_actions); s.resources = clean(s.resources); s.assessment_evidence = clean(s.assessment_evidence); });
  p.key_concepts = clean(p.key_concepts); p.prerequisites = clean(p.prerequisites);
}
function dlpChecks(p) {
  const f = p.lesson_flow, out = [], ok = (id, v, note) => out.push({ id, status: v ? 'pass' : 'fail', note: v ? '' : note });
  ok(7, f.length >= 4 && f.length <= 7 && f[0].start_minute === 0 && f.every((s, i) => i === 0 || s.start_minute === f[i - 1].end_minute) && f[f.length - 1].end_minute === p.metadata.duration_minutes, 'Stage timing is not contiguous or does not match the duration.');
  const ids = p.learning_objectives.map(o => o.id);
  ok(6, ids.every(id => f.some(s => s.objective_ids.includes(id)) && p.assessment.objective_checks.some(c => c.objective_id === id)), 'An objective has no stage or assessment check.');
  ok(8, f.every(s => s.teacher_actions.join() !== s.student_actions.join()), 'Teacher and student actions are the same.');
  const stageRes = new Set(f.flatMap(s => s.resources)), listed = new Set(p.teaching_resources.map(r => r.item));
  ok(9, stageRes.size === listed.size && [...stageRes].every(x => listed.has(x)), 'Resource list does not match stage resources.');
  ok(10, p.common_misconceptions.every(m => m.misconception && m.intervention), 'A misconception has no intervention.');
  ok(15, p.student_activities.every(a => { const s = f.find(x => x.stage_number === a.stage_number); return s && a.duration_minutes <= s.duration_minutes; }), 'An activity does not fit inside its stage.');
  const empty = JSON.stringify(p).includes('""') && /"(teacher_actions|student_actions|resources|key_concepts)":\[[^\]]*""/.test(JSON.stringify(p));
  ok(16, !empty, 'A list has an empty item.');
  return out;
}

