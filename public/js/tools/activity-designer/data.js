/* =========================================================
   Mock data + canonical activity builder
   Replace buildActivity() with the real AI service later.
   Output follows PRD §19.2 – ONE canonical package renders both
   Teacher View (§6, sections A–I) and Student View (§7, sections A–I).
   ========================================================= */

const BOOKS = {
  'Class 3 General Science – KIPS': { grade: 'Grade 3', subject: 'General Science', board: 'KIPS',
    chapters: [{ title: 'Plants Around Us', topics: ['Roots', 'Stem', 'Leaves, Flowers & Fruits'] }, { title: 'Animals Around Us', topics: ['Habitats', 'Food Habits'] }] },
  'Class 6 Science – NCERT': { grade: 'Grade 6', subject: 'Science', board: 'NCERT',
    chapters: [{ title: 'Separation of Substances', topics: ['Filtration', 'Evaporation', 'Sedimentation & Decantation'] }, { title: 'Fibre to Fabric', topics: ['Types of Fibres', 'Spinning'] }] },
  'Class 8 Mathematics – NCERT': { grade: 'Grade 8', subject: 'Mathematics', board: 'NCERT',
    chapters: [{ title: 'Mensuration', topics: ['Area of Trapezium', 'Surface Area'] }, { title: 'Data Handling', topics: ['Probability'] }] },
  'Class 5 EVS – KIPS (content pending)': { grade: 'Grade 5', subject: 'EVS', board: 'KIPS', noSource: true,
    chapters: [{ title: 'Our Water Sources', topics: ['Rivers', 'Wells'] }] },
};
Object.values(BOOKS).forEach(b => b.topics = b.chapters.flatMap(c => c.topics));   // the flat topic list the rest of the tool uses
const TYPES = [
  ['Hands-on experiment', 'flask', 'Do, observe and record'],
  ['Group discussion', 'chat', 'Talk, debate, reason'],
  ['Collaborative project', 'users', 'Build or make together'],
  ['Game / quiz', 'puzzle', 'Learn through play'],
  ['Observation walk', 'eye', 'Explore the surroundings'],
  ['Worksheet task', 'pencil', 'Paper-based practice'],
];
const MATERIALS = ['Low-cost household items', 'Lab equipment', 'Stationery only', 'Digital devices', 'No materials'];
const LEVELS = ['Needs support', 'Grade-level', 'Mixed ability', 'Advanced'];
const GROUPING = ['Individual', 'Pairs', 'Groups', 'Whole class'];
const DURATIONS = [15, 20, 30, 40, 45, 60];

/* Bloom's levels (optional multi-select). None chosen: recommended from the activity type and grade. */
const AD_BLOOMS = ['Remembering', 'Understanding', 'Applying', 'Analyzing', 'Evaluating', 'Creating'];
const AD_BLOOM_BY_TYPE = { 'Hands-on experiment': ['Understanding', 'Applying', 'Analyzing'], 'Group discussion': ['Understanding', 'Analyzing', 'Evaluating'], 'Collaborative project': ['Applying', 'Analyzing', 'Creating'],
  'Game / quiz': ['Remembering', 'Understanding', 'Applying'], 'Observation walk': ['Remembering', 'Understanding', 'Analyzing'], 'Worksheet task': ['Remembering', 'Understanding', 'Applying'] };
function adBloomsFor(f, grade) {
  if (f.blooms && f.blooms.length) return { levels: AD_BLOOMS.filter(x => f.blooms.includes(x)), source: 'teacher' };
  const rec = AD_BLOOM_BY_TYPE[f.type] || ['Understanding', 'Applying'];
  let lv = grade <= 3 ? rec.filter(x => AD_BLOOMS.indexOf(x) <= 2) : rec; // young learners: no Analyzing, Evaluating, Creating by default
  if (lv.length < 2) lv = ['Understanding', 'Applying'];
  return { levels: lv, source: 'ai_recommended' };
}
/* AI suggestion chips for the learning objective */
function adSuggestions(f) {
  const t = f.topic; if (!t) return [];
  return [`Understand ${t} by doing the activity and explaining what happens.`, `Use the ideas of ${t} in an everyday situation.`, `Recall and use the key terms of ${t}.`];
}


/* ---------- Rich content for known topics (from PRD samples) ----------
   steps: [minutes, title, teacher, student, ask, lookFor]
   answers: [question, model answer, acceptable alternative, explanation]
   Every student-facing question MUST have a matching answers[] entry (checked by validate()). */
const CONTENT = {
  'Filtration': {
    title: 'Separate It! A Filtration Experiment',
    learn: 'Students will understand filtration and identify how it separates an insoluble solid from a liquid.',
    demonstrate: 'Students will be able to explain filtration, perform a basic filtration experiment, and identify the role of the filter and residue.',
    description: 'Groups pour muddy water through a cloth-lined funnel and discover what stays behind and what passes through.',
    materials: [
      ['Muddy water', '1 glass (200 ml)', 'Mix a spoon of soil in water'],
      ['Transparent glass or container', '1', ''],
      ['Funnel', '1', 'Cut the top off a plastic bottle'],
      ['Filter paper or clean cotton cloth', '1 piece', 'A clean handkerchief works well'],
      ['Empty glass for filtered water', '1', ''],
      ['Spoon', '1', ''],
    ],
    prep: ['Prepare a small quantity of muddy water.', 'Arrange one set of materials for each group.', 'Explain that the filtered water is for observation only and must not be consumed.'],
    setup: 'Seat groups around tables covered with newspaper to catch spills. Keep a damp cloth near each group.',
    steps: [
      [2, 'Hook & predict', 'Show the muddy water and ask how the mud could be separated.', 'Suggest possible methods.', 'How could we get the mud out of this water?', 'Ideas such as picking it out, letting it settle, or using a cloth.'],
      [3, 'Set up the filter', 'Demonstrate placing the filter paper or cloth inside the funnel.', 'Observe the setup and copy it.', 'Why do you think we use a cloth or paper here?', 'Funnel sits over the empty glass; cloth fits snugly.'],
      [5, 'Filter the water', 'Ask each group to pour the muddy water slowly through the filter.', 'Perform the experiment and observe the result.', 'What do you see happening to the water?', 'Mud stays on the cloth; clearer water drips into the glass.'],
      [3, 'Name what you see', 'Ask students to identify what remains on the filter and what passes through.', 'Identify the residue and the filtrate.', 'What do we call the solid left behind? And the liquid that passed?', 'Use of the words “residue” and “filtrate”.'],
      [2, 'Explain & wrap up', 'Review the concept and ask students to explain why filtration worked.', 'Explain their observations aloud.', 'Why did the mud stay on the filter but the water went through?', 'Particles are too big to pass through the tiny holes.'],
    ],
    obs: ['Mud particles remain on the filter.', 'Water passes through the filter.', 'The collected liquid may still contain dissolved substances or microorganisms.'],
    concepts: ['Filtration separates insoluble solid particles from a liquid using a filter.', 'The solid left on the filter is the residue; the liquid that passes through is the filtrate.', 'Filtered water is not necessarily safe to drink.'],
    evidence: ['Students name the residue and filtrate correctly during discussion.', 'The observation table is completed accurately.', 'Students explain why the mud stayed on the filter.'],
    answers: [
      ['What is filtration?', 'A method used to separate insoluble solid particles from a liquid using a filter.', 'Separating solid particles from a liquid by passing it through a filter.', 'Defines the process by what is separated (an insoluble solid) and how (a filter).'],
      ['What do we call the solid left on the filter?', 'The residue, such as mud particles.', 'The residue / the mud.', 'Particles too large to pass through the tiny holes stay behind.'],
      ['What do we call the liquid that passes through the filter?', 'The filtrate – the liquid that passes through.', 'Filtered water.', 'Water particles are small enough to pass through the filter.'],
      ['Can filtration separate dissolved salt from water? Explain your answer.', 'No. Salt dissolves in water and is small enough to pass through the filter with the water.', 'No – dissolved particles are too small to be caught.', 'Filtration removes only insoluble particles; dissolved substances pass through.'],
      ['Can filtration make muddy water safe to drink? (Observation table)', 'No. It does not necessarily remove dissolved substances or microorganisms.', 'No – it may still contain germs.', 'Filtration removes only visible, insoluble particles.'],
    ],
    mcq: { q: 'Which part of the setup holds back the mud?', options: ['Funnel', 'Filter paper or cloth', 'Collecting glass', 'Spoon'], answer: 'Filter paper or cloth', explain: 'The filter has tiny holes that let water through but stop the mud.' },
    exit: { q: 'In one sentence, explain why the mud stayed on the filter.', answer: 'The mud particles are too big to pass through the tiny holes in the filter.', alt: 'Any answer linking particle size to the filter.' },
    rubric: [['Setup', 'Uses the materials correctly.', 1], ['Procedure', 'Performs filtration carefully.', 1], ['Observation', 'Correctly identifies residue and filtrate.', 1], ['Explanation', 'Explains how filtration separates the mixture.', 1]],
    diff: ['Provide a labelled diagram of the funnel, filter, residue and filtrate.', 'Ask students to explain the separation process in their own words.', 'Ask whether filtration can separate salt dissolved in water, and why.'],
    safety: ['Do not drink the water used in the experiment.', 'Handle glass containers carefully and clean up spills at once.'],
    access: ['Place materials within easy reach for students with limited mobility.', 'Read instructions aloud and pair students who need reading support with a buddy.', 'Offer the labelled diagram to students who benefit from visual cues.'],
    ws: {
      learn: 'You will learn how filtration separates insoluble solid particles from a liquid.',
      task: 'Work in your group to separate mud from water using filtration.',
      steps: ['Observe the muddy water carefully.', 'Place the filter paper or clean cloth inside the funnel.', 'Keep the funnel over an empty container.', 'Slowly pour the muddy water through the filter.', 'Observe what remains on the filter and what collects in the container.', 'Record your observations below.'],
      table: ['What did the muddy water look like before filtration?', 'What remained on the filter?', 'What passed through the filter?', 'Did the filtered water become completely safe to drink?'],
      draw: 'Draw your filtration setup. Label the residue and the filtrate.',
      questions: ['What is filtration?', 'What do we call the solid left on the filter?', 'What do we call the liquid that passes through the filter?', 'Can filtration separate dissolved salt from water? Explain your answer.'],
      reflect: ['Today, I learned that filtration ______________.', 'One thing I observed was ______________.', 'One question I still have is ______________.'],
      safety: 'Do not drink the water used in this experiment.',
    },
  },
  'Parts of a Plant': {
    title: "My Plant Explorer's Journal",
    learn: 'Learners will identify and label the main parts of a plant (root, stem, leaves, flowers, fruits, seeds), describe their functions, and tell taproots from fibrous roots.',
    demonstrate: 'Learners will draw a plant, label its parts, write one job for each, and sort two roots into taproot or fibrous.',
    description: 'Learners observe real plants around the school, then record what they see in a neat explorer’s journal.',
    materials: [
      ['Notebook or chart paper', '1 per learner', ''], ['Pencil, eraser and ruler', '1 set', ''],
      ['Colouring materials', '1 set', 'Crayons or colour pencils'], ['Old magazines (optional)', '2–3', 'For cutting out plant pictures'],
    ],
    prep: ['Choose 2–3 safe plants in the school garden or classroom.', 'Check the area for thorns, insects or allergens.', 'Draw a blank journal page on the board as an example.'],
    setup: 'Take the class outside in small groups with an adult at every plant. Keep a clipboard or notebook for each learner.',
    steps: [
      [4, 'Plant hook', 'Show a potted plant and ask learners to name parts they already know.', 'Name parts aloud.', 'Which parts of this plant can you name?', 'Root, stem and leaf are usually named first.'],
      [10, 'Observe & identify', 'Guide groups around 2–3 plants and prompt careful looking.', 'Look closely and point to each part.', 'Where is the plant holding on to the soil?', 'Learners point to roots, stem, leaves, flowers or fruit.'],
      [8, 'Draw & label', 'Model one journal entry, then let learners create their own.', 'Draw the plant, label parts and write one job for each.', 'What is this part’s main job?', 'Stem: keeps the plant upright. Leaf: makes food.'],
      [5, 'Root detective', 'Show a taproot (carrot) and a fibrous root (grass) example.', 'Draw and decide which type each root is.', 'How are these two roots different?', 'One thick main root versus many thin roots.'],
      [3, 'Share & wrap up', 'Invite a few learners to share their journal page.', 'Present one entry and tell one new fact.', 'What did you discover today?', 'Correct use of part names in sentences.'],
    ],
    obs: ['Learners can point to and name root, stem, leaf, flower, fruit and seed.', 'Roots of the sample plants show either one thick main root or many thin roots.'],
    concepts: ['A plant has root, stem, leaves, flowers, fruits and seeds.', 'Each part has a main job: roots absorb water, the stem supports, leaves make food.', 'Taproots have one thick main root; fibrous roots are many thin roots.'],
    evidence: ['Journal entry has correct labels.', 'Each label has a matching function.', 'Two roots are sorted correctly with an example.'],
    answers: [
      ['Which part keeps the plant upright?', 'The stem.', 'The stem / trunk.', 'The stem holds the plant up and carries water to the leaves.'],
      ['Which part takes in water from the soil?', 'The root.', 'Roots / root hairs.', 'Roots grow in the soil and absorb water and minerals.'],
      ['Which part makes food for the plant?', 'The leaves.', 'Leaf.', 'Leaves use sunlight, air and water to make food.'],
      ['Name one plant with a taproot and one with a fibrous root.', 'Taproot: carrot, radish, mustard. Fibrous: grass, wheat, onion.', 'Any correct example from the textbook.', 'A taproot is one thick main root; a fibrous root is a bunch of thin roots.'],
    ],
    mcq: { q: 'Which part of the plant later becomes the fruit?', options: ['Flower', 'Root', 'Stem', 'Leaf'], answer: 'Flower', explain: 'After pollination the flower develops into the fruit that holds the seeds.' },
    exit: { q: 'Name one part of a plant and write its main job.', answer: 'Any correct pair, e.g. “Stem – keeps the plant upright”.', alt: 'Root – absorbs water; Leaf – makes food.' },
    rubric: [['Identification', 'Correctly names the observed plant parts.', 2], ['Labelling & function', 'Writes one correct function for each label.', 1], ['Root type', 'Distinguishes taproot and fibrous root with examples.', 1], ['Neatness', 'Journal is neat, colourful and easy to understand.', 1]],
    diff: ['Give a pre-labelled plant outline and a word bank of part names.', 'Learners draw, label and write one function per part.', 'Learners compare two plants and explain why their roots differ.'],
    safety: ['Do not taste or smell unknown plants.', 'Avoid thorny or poisonous plants; check with an adult first.', 'Wash hands with soap after touching plants or soil.'],
    access: ['Bring a plant to the classroom for learners who cannot go outdoors.', 'Provide large-print word cards and pre-printed outlines.', 'Allow learners to dictate labels to an adult or a partner.'],
    ws: {
      learn: 'You will find the parts of a plant and learn what each part does.',
      task: 'Choose a plant, draw it, label its parts and write one job for each part.',
      steps: ['Choose a plant with an adult.', 'Look carefully at its root, stem, leaves, flowers, fruits and seeds.', 'Draw the plant in your journal.', 'Label every part you can find.', 'Write one main job next to each label.', 'Colour your journal neatly.'],
      table: ['Root – what is its job?', 'Stem – what is its job?', 'Leaf – what is its job?', 'Flower / Fruit / Seed – what is its job?'],
      draw: 'Draw your plant here. Label its parts.',
      questions: ['Which part keeps the plant upright?', 'Which part takes in water from the soil?', 'Which part makes food for the plant?', 'Name one plant with a taproot and one with a fibrous root.'],
      reflect: ['Today, I learned that plants ______________.', 'My favourite part of the plant is ______________ because ______________.', 'One question I still have is ______________.'],
      safety: 'Never taste unknown plants. Wash your hands after the activity.',
    },
  },
};

/* ---------- Generic scaffold when no rich content exists ---------- */
function genericContent(topic, f) {
  const t = topic;
  return {
    title: `Explore It! ${t} in Action`,
    learn: `Students will understand the key ideas of ${t} and apply them through a ${f.type.toLowerCase()}.`,
    demonstrate: `Students will be able to explain ${t} in their own words and give one example from the activity.`,
    description: `Students investigate ${t} through a short, guided ${f.type.toLowerCase()}.`,
    materials: [['Notebook or paper', '1 per student', ''], ['Pencil and eraser', '1 set', ''], [`Items related to ${t}`, '1 set per group', 'Choose low-cost alternatives']],
    prep: ['Review the topic content in the textbook.', 'Gather and test the materials.', 'Write the key question on the board.'],
    setup: 'Arrange seating so groups can work together and the teacher can move between them.',
    steps: [
      [2, 'Hook', `Ask a curiosity question about ${t}.`, 'Share predictions.', `What do you already know about ${t}?`, 'Everyday examples.'],
      [3, 'Set up', 'Demonstrate the task and assign roles.', 'Arrange materials and take roles.', 'What will each person do?', 'Clear roles in every group.'],
      [5, 'Investigate', 'Circulate and prompt careful observation.', 'Carry out the task and record findings.', 'What do you notice?', 'Accurate observations.'],
      [3, 'Discuss', 'Ask groups to share findings.', 'Compare with other groups.', 'Did every group find the same thing?', 'Findings linked to the concept.'],
      [2, 'Wrap up', 'Connect findings to the concept.', 'Complete the exit ticket.', `How would you explain ${t} to a friend?`, 'Concept used correctly.'],
    ],
    obs: ['Students record what they see at the start and what changes.', 'Observations are specific, not general.'],
    concepts: [`${t}: key definition from the textbook (add after review).`, 'Observations are linked to the concept.'],
    evidence: [`Students describe ${t} accurately.`, 'The observation table is complete.', 'Students give one example from the activity.'],
    answers: [
      [`What is ${t}?`, `A short definition of ${t} based on the textbook.`, 'Any accurate paraphrase.', 'Checks recall of the core idea.'],
      ['Give one example you saw today.', 'Any valid observation from the activity.', '', 'Checks that students connect the concept to what they saw.'],
      ['Why do you think this happened?', 'Links the observation to the concept.', '', 'Checks reasoning, not just recall.'],
    ],
    mcq: null,
    exit: { q: `Explain ${t} in one sentence.`, answer: `A one-sentence explanation of ${t} that uses the key term.`, alt: 'Any accurate paraphrase.' },
    rubric: [['Setup', 'Uses the materials correctly.', 1], ['Procedure', 'Carries out the task carefully.', 1], ['Observation', 'Records observations accurately.', 1], ['Explanation', 'Explains the concept clearly.', 1]],
    diff: ['Provide a labelled diagram and sentence starters.', 'Ask students to explain the process in their own words.', 'Ask students to predict what changes if one variable changes.'],
    safety: ['Supervise all hands-on work.', 'Handle materials carefully and clean up spills at once.'],
    access: ['Give instructions both aloud and in writing.', 'Allow extra time or a buddy where needed.'],
    ws: {
      learn: `You will learn about ${t} by doing and observing.`, task: `Work with your group to explore ${t} and record what you find.`,
      steps: ['Read all the instructions.', 'Collect your materials.', 'Carry out the activity step by step.', 'Observe carefully.', 'Record what you see below.'],
      table: ['What did you see at the start?', 'What changed?', 'What surprised you?'],
      draw: 'Draw what you observed. Label the important parts.',
      questions: [`What is ${t}?`, 'Give one example you saw today.', 'Why do you think this happened?'],
      reflect: ['Today, I learned that ______________.', 'One thing I observed was ______________.', 'One question I still have is ______________.'],
      safety: 'Follow your teacher’s instructions and handle all materials carefully.',
    },
    generic: true,
  };
}

/* PRD §16 – explain limitations and offer a feasible adjustment instead of silently ignoring them */
function feasibility(f) {
  const out = [], m = f.materials || [];
  if (f.type === 'Hands-on experiment' && m.length && m.every(x => x === 'No materials'))
    out.push({ msg: 'A hands-on experiment needs at least simple materials, but you selected “No materials”.', fixLabel: 'Switch to Group discussion', fix: { type: 'Group discussion' } });
  if (f.type === 'Hands-on experiment' && m.length && m.every(x => x === 'Digital devices'))
    out.push({ msg: 'Digital devices alone can’t support a hands-on experiment.', fixLabel: 'Switch to Worksheet task', fix: { type: 'Worksheet task' } });
  if (f.type === 'Collaborative project' && f.duration < 30)
    out.push({ msg: `A collaborative project is hard to finish in ${f.duration} minutes.`, fixLabel: 'Use 40 minutes', fix: { duration: 40 } });
  if (f.type === 'Group discussion' && f.grouping === 'Individual')
    out.push({ msg: 'A group discussion needs more than one student.', fixLabel: 'Use Pairs', fix: { grouping: 'Pairs' } });
  if (/heat|flame|fire|knife|blade|chemical|acid/i.test(f.extra || ''))
    out.push({ msg: 'Your instructions mention a safety-sensitive item. Those steps become a teacher demonstration; students won’t handle them.', fix: null });
  return out;
}

/* Largest-remainder scaling so step minutes ALWAYS sum to the chosen duration */
function scaleSteps(steps, total) {
  const base = steps.reduce((a, s) => a + s[0], 0);
  const raw = steps.map(s => s[0] * total / base);
  const out = raw.map(r => Math.max(1, Math.floor(r)));
  let diff = total - out.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => [r - Math.floor(r), i]).sort((a, b) => b[0] - a[0]).map(x => x[1]);
  for (let k = 0; diff !== 0 && k < 200; k++) {
    const i = diff > 0 ? order[k % order.length] : order[order.length - 1 - (k % order.length)];
    if (diff > 0) { out[i]++; diff--; } else if (out[i] > 1) { out[i]--; diff++; }
  }
  return out;
}

const marksTotal = a => a.rubric.reduce((s, r) => s + r.pts, 0);

/* Canonical activity package (PRD §19.2) */
function buildActivity(f, notes = []) {
  const b = BOOKS[f.book];
  const key = f.topic;
  const c = CONTENT[key] || CONTENT[f.topic] || genericContent(key, f);
  const mins = scaleSteps(c.steps, f.duration);
  const verified = !b.noSource || !!f.fileName;
  const groupText = f.grouping === 'Groups' ? `Groups of ${f.groupSize.replace(' students', '')}` : f.grouping;
  const ws = { ...c.ws }, bl = adBloomsFor(f, +String(b.grade).replace(/\D/g, ''));
  // answer key must also cover the MCQ and exit ticket shown to students
  const answers = c.answers.map(a => ({ q: a[0], a: a[1], alt: a[2], why: a[3] }));
  if (c.mcq) answers.push({ q: c.mcq.q, a: c.mcq.answer, alt: '', why: c.mcq.explain });
  answers.push({ q: c.exit.q, a: c.exit.answer, alt: c.exit.alt, why: 'Exit ticket – checks the main idea in one sentence.' });
  return {
    id: 'a' + Date.now().toString(36),
    meta: { book: f.book, grade: b.grade, subject: b.subject, board: b.board, topic: f.topic, type: f.type, duration: f.duration,
            grouping: groupText, level: f.level, blooms: bl.levels, bloomsSource: bl.source, materialsAvail: f.materials.join(', '), extra: f.extra, file: f.fileName },
    source: { verified, note: f.fileName ? `Built from your upload: ${f.fileName}` : verified ? `Grounded in “${f.book}”` : 'Unverified general knowledge – not textbook-aligned' },
    notes,
    title: c.title, generic: !!c.generic,
    objective: { learn: f.objective || c.learn, demonstrate: c.demonstrate },
    description: c.description,
    materials: c.materials.map(m => ({ name: m[0], qty: m[1], alt: m[2] })),
    prep: c.prep, setup: c.setup,
    steps: c.steps.map((s, i) => ({ n: i + 1, min: mins[i], title: s[1], teacher: s[2], student: s[3], ask: s[4], look: s[5] })),
    outcomes: { obs: c.obs, concepts: c.concepts, evidence: c.evidence },
    answers,
    rubric: c.rubric.map(r => ({ name: r[0], desc: r[1], pts: r[2] })),
    diff: { support: c.diff[0], standard: c.diff[1], extension: c.diff[2] },
    safety: c.safety, access: c.access,
    worksheet: { ...ws, mcq: c.mcq, exit: c.exit.q },
  };
}

/* Real validations – drive the "Quality checks" panel (PRD §17 step 7) */
function validate(a) {
  const sum = a.steps.reduce((s, x) => s + x.min, 0);
  const w = a.worksheet, wsText = JSON.stringify(w).toLowerCase();
  // the MCQ's correct option legitimately appears in the worksheet, so it is not a leak
  const leaked = a.answers.filter(x => x.a.length > 18 && !(w.mcq && x.a === w.mcq.answer) && wsText.includes(x.a.toLowerCase()));
  const studentQs = [...w.questions, ...(w.mcq ? [w.mcq.q] : []), w.exit];
  const uncovered = studentQs.filter(q => !a.answers.some(x => x.q === q));
  return [
    { ok: a.source.verified, label: a.source.verified ? 'Source grounded' : 'Source not verified', note: a.source.verified ? a.source.note : 'Not marked as textbook-aligned. Upload content to verify.' },
    { ok: sum === a.meta.duration, label: 'Timing matches', note: `Steps add up to ${sum} of ${a.meta.duration} min` },
    { ok: a.notes.length === 0, label: 'Feasible with your settings', note: a.notes.length ? a.notes[0] : `Uses ${a.meta.materialsAvail.toLowerCase()}` },
    { ok: a.safety.length > 0 && a.access.length > 0, label: 'Safety & accessibility', note: `${a.safety.length} safety · ${a.access.length} accessibility notes` },
    { ok: uncovered.length === 0, label: 'Answer key covers every question', note: uncovered.length ? `Missing: ${uncovered[0]}` : `${studentQs.length} student questions · ${marksTotal(a)} marks` },
    { ok: leaked.length === 0, label: 'Student view is private', note: leaked.length ? 'Teacher answers detected in worksheet' : 'No teacher-only content found' },
  ];
}
