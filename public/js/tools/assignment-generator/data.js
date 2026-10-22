/* =========================================================
   Assignment generator - catalogue, type rules, mock generation engine, checks.
   Replace asgBuild() with the real AI service later: it must return the same canonical object,
   which renders BOTH the Teacher View and the Student View (PRD §10-§11).
   ========================================================= */

const ASG_DIFFS = ['Easy', 'Medium', 'Hard', 'Mixed'];
const ASG_TIMES = [15, 30, 45, 60];
const ASG_FORMATS = [['short', 'Short answer'], ['long', 'Long answer'], ['mcq', 'MCQ'], ['case', 'Case study'], ['diagram', 'Diagram-based'], ['open', 'Open-ended'], ['practical', 'Practical task'], ['mixed', 'Mixed format']];

/* §6.1 type catalogue: defaults for time, marks and rubric */
const ASG_TYPES = [
  { id: 'practice_worksheet', label: 'Practice worksheet', desc: 'Students answer questions that practise one topic.', time: 30, marks: 20, rubric: false, rec: 'MCQ, short answer and long answer' },
  { id: 'real_life_application', label: 'Real-life application', desc: 'Students answer questions about a real-life situation, case or data.', time: 30, marks: 20, rubric: false, rec: 'Case study with short and long answers' },
  { id: 'research_task', label: 'Research task', desc: 'Students write a short report that answers a research question, with sources.', time: 60, marks: 20, rubric: true, rec: 'Open-ended guiding questions' },
  { id: 'project', label: 'Project', desc: 'Students make a model, chart, poster, booklet or presentation over several days.', time: 180, marks: 25, rubric: true, rec: 'Practical task with milestones' },
  { id: 'essay_creative_writing', label: 'Essay / creative writing', desc: 'Students write a paragraph, essay, story, letter, diary entry or poem.', time: 45, marks: 20, rubric: true, rec: 'Open-ended writing task' },
  { id: 'chapter_revision', label: 'Chapter revision', desc: 'Students answer mixed questions that cover the whole chapter.', time: 45, marks: 30, rubric: false, rec: 'MCQ, short answer and long answer' },
];
const asgType = id => ASG_TYPES.find(t => t.id === id) || ASG_TYPES[0];
const asgTypeLabel = (id, grade) => id === 'research_task' && grade < 5 ? 'Ask and find out' : asgType(id).label;

/* ---------- Catalogue: book > chapter > topic ---------- */
const ASG_BOOKS = [
  { id: 'b6s', title: 'Class 6 Science – NCERT', grade: 6, subject: 'Science', board: 'NCERT', chapters: [
    { id: 'c1', title: 'Living and Non-Living Things', topics: [
      { id: 't_live', title: 'Living and Non-Living Things', subs: ['Signs of life', 'Needs of living things'] }, { id: 't_needs', title: 'Needs of Living Things', subs: [] },
      { id: 't_signs', title: 'Signs of Life', subs: [] }, { id: 't_repro', title: 'Growth and Reproduction', subs: [] }, { id: 't_resp', title: 'Response to Surroundings', subs: [] }] },
    { id: 'c2', title: 'Separation of Substances', topics: [{ id: 't_filt', title: 'Filtration', subs: [] }, { id: 't_evap', title: 'Evaporation', subs: [] }] }] },
  { id: 'b5m', title: 'Class 5 Mathematics – KIPS', grade: 5, subject: 'Mathematics', board: 'KIPS', chapters: [
    { id: 'c1', title: 'Money', topics: [{ id: 't_price', title: 'Reading Prices', subs: ['Rupees and paise'] }, { id: 't_change', title: 'Making Change', subs: [] }, { id: 't_bill', title: 'Bills and Budgets', subs: [] }] }] },
  { id: 'b7s', title: 'Class 7 Science – NCERT', grade: 7, subject: 'Science', board: 'NCERT', chapters: [
    { id: 'c1', title: 'Nutrition in Plants', topics: [{ id: 't_photo', title: 'Photosynthesis', subs: [] }, { id: 't_modes', title: 'Modes of Nutrition', subs: [] }] }] },
  { id: 'b3e', title: 'Class 3 EVS – KIPS', grade: 3, subject: 'EVS', board: 'KIPS', chapters: [
    { id: 'c1', title: 'Plants Around Us', topics: [{ id: 't_parts', title: 'Parts of a Plant', subs: [] }, { id: 't_seeds', title: 'Seeds and Growth', subs: [] }] }] },
  { id: 'b8e', title: 'Class 8 English – KIPS', grade: 8, subject: 'English', board: 'KIPS', chapters: [
    { id: 'c1', title: 'Writing About People', topics: [{ id: 't_desc', title: 'Describing a Person', subs: [] }, { id: 't_letter', title: 'Writing a Letter', subs: [] }] }] },
  { id: 'b5e', title: 'Class 5 EVS – KIPS (content pending)', grade: 5, subject: 'EVS', board: 'KIPS', noSource: true, chapters: [
    { id: 'c1', title: 'Our Water Sources', topics: [{ id: 't_rivers', title: 'Rivers', subs: [] }, { id: 't_wells', title: 'Wells', subs: [] }] }] },
];
const asgBook = id => ASG_BOOKS.find(b => b.id === id);
function asgFind(book, topicId) { for (const ch of book.chapters) { const tp = ch.topics.find(t => t.id === topicId); if (tp) return { chapter: ch, topic: tp }; } return null; }

/* key terms per topic: [term, short definition] */
const ASG_TERMS = {
  t_live: [['Living thing', 'A thing that grows, breathes, needs food and can make more of its kind.'], ['Non-living thing', 'A thing that does not grow, breathe or need food.'], ['Needs of living things', 'Food, water and air.'], ['Signs of life', 'Growing, breathing, needing food, responding and reproducing.']],
  t_needs: [['Food', 'Gives living things energy to grow and work.'], ['Water', 'Helps living things stay healthy and do their life processes.'], ['Air', 'Gives the oxygen that most living things breathe.'], ['Shelter', 'A safe place to live and rest.']],
  t_signs: [['Growth', 'Becoming bigger over time.'], ['Movement', 'Changing place or position.'], ['Breathing', 'Taking in air to get oxygen.'], ['Response', 'Reacting to light, sound, touch or heat.']],
  t_repro: [['Reproduction', 'Making more living things of the same kind.'], ['Seed', 'A part of a plant that grows into a new plant.'], ['Egg', 'A part laid by some animals from which the young hatch.'], ['Offspring', 'The young one of a plant or animal.']],
  t_resp: [['Stimulus', 'A change around us that makes us react.'], ['Sense organs', 'Body parts that help us notice our surroundings.'], ['Adaptation', 'A feature that helps a living thing live in its home.'], ['Habitat', 'The natural home of a plant or animal.']],
  t_filt: [['Filtration', 'Separating an insoluble solid from a liquid using a filter.'], ['Residue', 'The solid left behind on the filter.'], ['Filtrate', 'The liquid that passes through the filter.'], ['Insoluble', 'Does not dissolve in water.']],
  t_evap: [['Evaporation', 'A liquid slowly changing into vapour.'], ['Vapour', 'The gas form of a liquid.'], ['Solution', 'A mixture in which one substance dissolves in another.'], ['Saturated solution', 'A solution that cannot dissolve any more of the substance.']],
  t_price: [['Rupee', 'The unit of money used in India.'], ['Paise', '100 paise make one rupee.'], ['Price', 'The amount of money asked for something.'], ['Total', 'All the amounts added together.']],
  t_change: [['Change', 'The money given back when you pay more than the price.'], ['Cost', 'The amount paid to buy something.'], ['Subtract', 'Take one amount away from another.'], ['Notes and coins', 'The pieces of money used to pay.']],
  t_bill: [['Bill', 'A paper that lists what was bought and the total to pay.'], ['Budget', 'A plan for how much money to spend and save.'], ['Saving', 'Keeping some money for later.'], ['Expense', 'Money spent on something.']],
  t_photo: [['Photosynthesis', 'Plants make food using sunlight, water and carbon dioxide.'], ['Chlorophyll', 'The green pigment that traps sunlight in leaves.'], ['Stomata', 'Tiny pores in leaves that let gases in and out.'], ['Autotroph', 'An organism that makes its own food.']],
  t_modes: [['Heterotroph', 'An organism that depends on others for food.'], ['Parasite', 'An organism that feeds on a living host.'], ['Saprotroph', 'An organism that feeds on dead and decaying matter.'], ['Symbiosis', 'Two organisms living together and helping each other.']],
  t_parts: [['Root', 'Holds the plant in the soil and takes in water.'], ['Stem', 'Carries water and food to all parts of the plant.'], ['Leaf', 'Makes food for the plant using sunlight.'], ['Flower', 'The part that makes seeds and fruits.']],
  t_seeds: [['Seed', 'A small part that can grow into a new plant.'], ['Germination', 'A seed starting to grow into a seedling.'], ['Seedling', 'A very young plant.'], ['Sunlight', 'Light from the sun that plants need to grow.']],
  t_desc: [['Adjective', 'A word that describes a person or thing.'], ['Appearance', 'How a person looks.'], ['Personality', 'The qualities that make a person who they are.'], ['Anecdote', 'A short story that shows what a person is like.']],
  t_letter: [['Greeting', 'The opening words, such as "Dear Meera,".'], ['Body', 'The main part of the letter.'], ['Closing', 'The ending words, such as "Yours sincerely,".'], ['Formal letter', 'A letter written to a person in authority.']],
  t_rivers: [['River', 'A large stream of water that flows towards the sea.'], ['Source', 'The place where a river begins.'], ['Mouth', 'The place where a river ends.'], ['Tributary', 'A smaller stream that joins a river.']],
  t_wells: [['Well', 'A hole dug in the ground to reach water.'], ['Groundwater', 'Water stored under the ground.'], ['Water table', 'The level below which the ground is full of water.'], ['Bucket and rope', 'Used to draw water from a well.']],
};

/* richer content for a few topics; every other topic uses the generic builders below */
const ASG_RICH = {
  t_live: {
    case: { title: 'A walk in the park', text: 'Asha goes to a park. She sees a mango tree, a dog, a stone bench, a swing and a butterfly. She also finds a dry leaf on the ground.',
      qs: [['Name two living things Asha saw.', 'Mango tree, dog or butterfly (any two).', 'Any living thing from the case.'], ['Which things in the park are non-living?', 'The stone bench and the swing.', 'The dry leaf, because it no longer shows signs of life.'], ['The mango tree cannot walk. Why is it still a living thing?', 'It grows, needs food, water and air, and makes seeds.', ''], ['Asha says the swing is alive because it moves. Is she right? Give a reason.', 'No. A swing moves only when pushed. It does not grow, breathe or need food.', '']],
      table: { headers: ['Thing in the park', 'Living or non-living?'], rows: [['Mango tree', 'Living'], ['Stone bench', 'Non-living'], ['Dog', 'Living'], ['Swing', 'Non-living']] } },
    research: { q: 'How do living things in our neighbourhood show signs of life?', guide: ['Which living things can you find near your home or school?', 'How do they get food, water and air?', 'How do you know a plant is alive?', 'How is a living thing different from a non-living thing?'], headings: ['Introduction', 'Living things I found', 'Signs of life', 'Conclusion'], findings: ['A list of real living things with their signs of life.', 'Food, water and air named as needs.', 'A clear difference between living and non-living things.'] },
    project: { drive: 'How can we show the difference between living and non-living things?', product: 'a poster that sorts 10 everyday things into living and non-living', mats: ['Chart paper', 'Pencils and colours', 'Old magazines for pictures', 'Glue stick', 'Scissors (use with an adult)'], steps: ['Choose 10 things you see every day.', 'Decide if each is living or non-living and why.', 'Draw or paste a picture of each thing.', 'Sort the pictures into two columns on the chart.', 'Write one sign of life next to each living thing.', 'Add a title and your name.'], reflect: ['Which thing was hardest to sort, and why?', 'What is one new thing you learned about living things?'], sample: 'A chart with two labelled columns, ten pictures and one sign of life beside each living thing.' },
    writing: { prompts: ['Write a paragraph called "A day in the life of a seed".', 'Write a short piece about a living thing you see every day and how you know it is alive.'], form: 'Short explanatory paragraph', audience: 'A younger child' },
    misc: [['Things that move, like clouds or cars, are alive.', 'Ask: does it grow, need food or make more of its kind? Test each sign of life.'], ['Plants are not alive because they do not move.', 'Grow a seed over a week and list its signs of life.'], ['A dry leaf is a living thing.', 'Explain that it once lived but no longer grows or needs food.']],
  },
  t_price: {
    case: { title: 'At the school stationery shop', text: 'Ravi buys a notebook for ₹45, a pencil box for ₹30 and two pens for ₹10 each. He pays with a ₹100 note.',
      qs: [['What is the total cost of the notebook and the pencil box?', '₹45 + ₹30 = ₹75.', '75 rupees'], ['How much do the two pens cost together?', '₹10 + ₹10 = ₹20.', ''], ['What is the total Ravi has to pay?', '₹45 + ₹30 + ₹20 = ₹95.', ''], ['How much change should Ravi get back from ₹100?', '₹100 − ₹95 = ₹5.', '5 rupees'], ['Ravi says he should get ₹10 back. Is he right? Show your working.', 'No. ₹100 − ₹95 = ₹5, not ₹10.', '']],
      table: { headers: ['Item', 'Price (₹)'], rows: [['Notebook', '45'], ['Pencil box', '30'], ['Pen (each)', '10']] } },
    research: { q: 'How do prices of the same item differ in different shops, and why?', guide: ['Which three items will you compare?', 'What is the price of each item in two different shops?', 'Which shop gives the lowest total, and by how much?', 'Why might the prices be different?'], headings: ['Introduction', 'Prices I found', 'Comparison', 'Conclusion'], findings: ['A table of items with prices from two shops.', 'Correct totals and difference using addition and subtraction.', 'Reasons such as shop size, brand or transport cost.'] },
    project: { drive: 'How can we run a small play shop fairly?', product: 'a play shop with price tags and a bill book', mats: ['Old cardboard boxes', 'Paper and pencils', 'Empty packets or small items', 'Play notes and coins or paper cut-outs'], steps: ['List six items for your shop.', 'Write a price in rupees on a tag for each item.', 'Make play notes and coins.', 'Make a bill book with item, price and total.', 'Play shopkeeper and customer with a family member.'], reflect: ['How did you check that the change was correct?', 'What would you do differently next time?'], sample: 'A play shop with six priced items and a bill book with correct totals and change.' },
    writing: { prompts: ['Write a letter to a friend explaining how to check change after shopping.'], form: 'Letter', audience: 'A friend' },
    misc: [['Students add the prices but forget to subtract from the amount paid.', 'Ask: how much did I pay, and how much do I owe? Then subtract.'], ['Students mix up rupees and paise.', 'Change both to paise first. 100 paise make 1 rupee.']],
  },
  t_photo: {
    case: { title: 'A plant on the window', text: 'Meena keeps two identical plants. She puts one on a sunny window and the other in a dark cupboard. She waters both every day. After a week, the plant in the cupboard has pale, yellow leaves.',
      qs: [['Why did the plant in the cupboard turn pale?', 'It got no sunlight, so it could not make food by photosynthesis.', ''], ['Which two things did both plants get equally?', 'Water and air.', 'Carbon dioxide'], ['What does the plant on the window use to make its food?', 'Sunlight, water and carbon dioxide.', 'Light, water and air'], ['Name the green pigment that traps sunlight in leaves.', 'Chlorophyll.', ''], ['What will happen if Meena moves the pale plant back to the window?', 'It will start making food again and the leaves will slowly turn green.', '']] },
    research: { q: 'Why do plants need sunlight, and what happens if they do not get it?', guide: ['What is photosynthesis?', 'Which things does a plant need to make food?', 'What happens to a plant kept in the dark?', 'Which plants near you get the most sunlight?'], headings: ['Introduction', 'How plants make food', 'Without sunlight', 'Conclusion'], findings: ['Photosynthesis explained with sunlight, water and carbon dioxide.', 'Chlorophyll named as the green pigment.', 'Plants kept in the dark turn pale and weak.'] },
    project: { drive: 'How can we show that plants need sunlight?', product: 'a two-pot plant experiment with a record chart', mats: ['Two small pots with soil', 'Bean or gram seeds', 'Water', 'A sunny window and a dark cupboard', 'Notebook and pencil'], steps: ['Plant three seeds in each pot.', 'Put one pot in sunlight and one in a dark cupboard.', 'Water both pots equally each day.', 'Draw both plants every two days.', 'Write what you notice in a chart.', 'Explain the difference using the word "photosynthesis".'], reflect: ['What did the plant in the dark look like at the end?', 'How did your result show that plants need sunlight?'], sample: 'Two pots, a dated drawing chart and a clear explanation using photosynthesis.' },
    writing: { prompts: ['Explain in a short essay how a leaf makes food for the plant.', 'Write a short story called "The Leaf That Made Dinner".'], form: 'Short explanatory piece', audience: 'Class 6 students' },
    misc: [['Plants take their food from the soil.', 'The soil gives water and minerals. The leaves make the food.'], ['Photosynthesis happens at night too.', 'Photosynthesis needs light, so it stops in the dark.']],
  },
  t_parts: {
    case: { title: "Grandma's kitchen garden", text: 'Grandma grows tomato plants in her garden. Her granddaughter sees that each plant has roots in the soil, a green stem, leaves and small yellow flowers. Later the flowers turn into tomatoes.',
      qs: [['Which part of the tomato plant is inside the soil?', 'The root.', ''], ['Which part holds the plant up and carries water?', 'The stem.', ''], ['What do the leaves do for the plant?', 'They make food using sunlight.', ''], ['What do the flowers turn into?', 'Fruits (tomatoes).', 'Tomatoes']] },
    research: { q: 'Which parts of plants do we eat at home?', guide: ['Ask someone at home which plant parts they eat. Write two.', 'Look at one vegetable. Is it a root, stem, leaf, flower or fruit?', 'Draw your favourite plant part.'], headings: ['What I asked', 'What I found', 'My drawing'], findings: ['Two correct plant parts that we eat.', 'The vegetable matched to the correct plant part.', 'A neat drawing of one plant part.'] },
    project: { drive: 'What parts does a plant have, and what does each part do?', product: 'a paper and card model of a plant with its parts labelled', mats: ['Coloured paper', 'Card', 'Glue stick', 'Crayons', 'Safe scissors (use with an adult)'], steps: ['Draw a big plant on card.', 'Cut out a root, stem, leaves and a flower.', 'Stick the parts in the right places.', 'Write the name of each part.', 'Write one job for each part.'], reflect: ['Which part did you like making most?', 'What does a plant need to grow?'], sample: 'A card plant with four labelled parts and one job written for each.' },
    writing: { prompts: ['Write three sentences about your favourite plant.', 'Write about a day in the life of a seed.'], form: 'Short piece', audience: 'A friend' },
    misc: [['Only the flower is a part of a plant.', 'Name all four parts: root, stem, leaf and flower.'], ['Roots are only for holding the plant.', 'Roots also take in water from the soil.']],
  },
  t_desc: {
    writing: { prompts: ['Describe a person you admire. Say how they look, what they are like, and tell one short story about them.', 'Write a diary entry about a day you spent with someone you admire.'], form: 'Descriptive essay', audience: 'Your classmates', planner: ['Introduction', 'Body', 'Conclusion'],
      criteria: ['I described how the person looks.', 'I showed their personality with an example.', 'I used at least five adjectives.', 'I checked my spelling and full stops.'],
      model: 'My grandmother is the person I admire most. She is short, with silver hair and kind brown eyes. She is patient, hardworking and always ready to help. Once, when our neighbour was ill, she cooked meals for the whole family for a week. That showed me how generous she is. I want to be as caring as her when I grow up.' },
    misc: [['Students list adjectives without showing personality.', 'Ask for a short story or example that proves each quality.'], ['Students mix up appearance and personality.', 'Sort adjectives into "how they look" and "what they are like".']],
  },
};

/* ---------- Helpers ---------- */
const asgFmtDate = iso => iso ? new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
const asgDate = (iso, plus) => { const d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate() + plus); return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };
const asgToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };
const asgDaysTo = iso => Math.round((new Date(iso + 'T00:00:00') - new Date(asgToday() + 'T00:00:00')) / 864e5);
const asgLow = s => s.charAt(0).toLowerCase() + s.slice(1);

function asgSuggestions(book, tp) { // §5 #5: AI suggestion chips for the learning objective
  const t = (ASG_TERMS[tp.id] || [[tp.title]]); const a = t[0][0];
  return [`Explain what "${a}" means and give an example.`, `Use the ideas of ${tp.title} in an everyday situation.`, `Recall the key terms in ${tp.title}.`];
}

/* ---------- Context and resolved settings (§5, §9) ---------- */
function asgCtx(f, salt = 0) {
  const book = asgBook(f.bookId), found = asgFind(book, f.topicId), terms = ASG_TERMS[found.topic.id] || [[found.topic.title, `The main idea of ${found.topic.title}.`]];
  const T = asgType(f.type), marksOn = f.marksMode !== 'none' && +f.marks > 0;
  return { f, book, ch: found.chapter, tp: found.topic, terms, rich: ASG_RICH[found.topic.id] || {}, T, grade: book.grade, subject: book.subject, marksOn, total: marksOn ? +f.marks : 0, minutes: +f.time || T.time, salt,
    r: rngFrom(hashStr(`${f.bookId}|${f.topicId}|${f.type}|${f.difficulty}|${salt}`)), fm: new Set(f.formats.filter(x => x !== 'mixed')), due: f.dueDate, used: new Set() };
}
function asgCount(c) { // task count: teacher's number, otherwise type default and time
  const { f, T } = c, set = f.taskCount !== 'ai' && +f.taskCount > 0, n = set ? Math.max(1, Math.min(40, Math.round(+f.taskCount))) : 0;
  const auto = { practice_worksheet: Math.max(6, Math.min(12, Math.round(c.minutes / 3))), real_life_application: c.minutes >= 45 ? 10 : 5, research_task: 5, project: 5, essay_creative_writing: 2, chapter_revision: Math.max(12, Math.min(20, c.ch.topics.length * 3)) }[f.type];
  let v = set ? n : auto;
  if (f.type === 'chapter_revision') v = Math.max(v, c.ch.topics.length);
  if (f.type === 'project') v = Math.max(3, Math.min(8, v));
  if (f.type === 'research_task') v = Math.max(2, Math.min(8, v));
  if (f.type === 'essay_creative_writing') v = Math.min(6, v);
  if (f.type === 'real_life_application') v = Math.max(v, 2);
  return { count: v, source: set ? 'teacher' : 'ai' };
}
function asgWordLimit(c) {
  const m = /(\d{2,3})\s*words?/i.exec(c.f.extra || ''); if (m) return +m[1];
  return c.grade <= 3 ? 60 : c.grade <= 5 ? 100 : c.grade <= 8 ? 150 : 200;
}
function asgMeta(c, cnt) {
  const { f, book } = c, status = book.noSource ? (f.contentChoice === 'uploaded' ? 'teacher_content' : 'unverified') : 'textbook';
  return { book: book.title, board: book.board, grade: book.grade, subject: book.subject, chapter: c.ch.title, topic: c.tp.title, subtopic: f.subtopic || null,
    assignment_type: f.type, type_label: asgTypeLabel(f.type, book.grade), objective: f.objective.trim() || asgSuggestions(book, c.tp)[0], difficulty: f.difficulty.toLowerCase(),
    completion_minutes: c.minutes, due_date: f.dueDate, task_formats: f.formats.slice(), task_count: cnt.count, task_count_source: cnt.source,
    marks_enabled: c.marksOn, total_marks: c.total, rubric: c.marksOn && !!f.rubric, marks_in_student_view: c.marksOn && !!f.studentMarks,
    additional_instructions: f.extra.trim(), source_status: status, assignment_version: 1 };
}

/* ---------- Task building blocks ---------- */
const asgMk = o => ({ n: 0, text: '', format: 'short', difficulty: 'medium', objective_id: 'LO1', concepts: [], w: 1, marks: 0, options: null, correct: null, table: null, draw: false, answer: '', accept_also: '', explain: '', partial_credit: '', lines: null, ...o });
const ASG_W = { mcq: 1, short: 1.6, long: 3, open: 3, table: 2.6, diagram: 2.4, practical: 3, case: 2 };
function asgDiffList(diff, n) {
  if (diff === 'Mixed') { const e = Math.round(n * .3), h = Math.round(n * .2); return [...Array(e).fill('easy'), ...Array(Math.max(0, n - e - h)).fill('medium'), ...Array(h).fill('hard')].slice(0, n); }
  return Array(n).fill(diff.toLowerCase());
}
function asgPicker(c) { // cycles through the topic's terms; repeats get a different wording
  const order = shuffle(c.r, c.terms.map((_, i) => i)); let k = 0;
  return () => { const i = order[k % order.length], round = Math.floor(k / order.length); k++; return { t: c.terms[i], i, round }; };
}
function asgWord(c, diff, t, round) {
  const v = { easy: [`What is meant by "${t}"?`, `Write what "${t}" means.`, `Say in your own words what "${t}" is.`], medium: [`Explain "${t}" in your own words. Give one example.`, `What do we mean by "${t}"? Give an example from everyday life.`, `Describe "${t}" and name one place you can see it.`], hard: [`Explain "${t}" and show how it differs from a related idea. Give a reason.`, `Why is "${t}" important? Explain with an example.`, `Compare "${t}" with another term from this topic and justify your answer.`] }[diff];
  for (let k = 0; k < v.length; k++) { const s = v[(round + k) % v.length]; if (!c.used.has(s)) return asgUniq(c, s); }
  return asgUniq(c, v[round % v.length]);
}
function asgUniq(c, text) { let s = text, k = 2; while (c.used.has(s)) s = `${text} (another example, ${k++})`; c.used.add(s); return s; }
function asgMcq(c, term, diff) {
  const [t, d] = term, own = c.grade <= 2 ? 3 : 4, pool = ASG_BOOKS.flatMap(b => b.chapters.flatMap(ch => ch.topics.flatMap(tp => ASG_TERMS[tp.id] || []))).filter(x => x[1] !== d && !d.includes(x[1]));
  const near = c.terms.filter(x => x[1] !== d), far = shuffle(c.r, pool).filter(x => !near.includes(x)), dist = uniq([...shuffle(c.r, near).map(x => x[1]), ...far.map(x => x[1])]).slice(0, own - 1);
  const opts = shuffle(c.r, [d, ...dist]), ci = opts.indexOf(d);
  return asgMk({ format: 'mcq', difficulty: diff, concepts: [t], w: ASG_W.mcq, text: asgUniq(c, `Which of these best describes "${t}"?`), options: opts, correct: ci, answer: `(${'abcd'[ci]}) ${d}`, explain: `"${t}": ${d}` });
}
function asgRecall(c, term, diff, round) { const [t, d] = term; return asgMk({ format: 'short', difficulty: diff, concepts: [t], w: ASG_W.short, text: asgWord(c, diff, t, round), answer: d, accept_also: 'Any correct everyday examples.' }); }
function asgExplain(c, term, diff, round, long = false) { const [t, d] = term; return asgMk({ format: long ? 'long' : 'short', difficulty: diff, concepts: [t], w: long ? ASG_W.long : ASG_W.short, text: long ? asgUniq(c, `Explain "${t}". Give examples from everyday life.`) : asgWord(c, diff, t, round + 1), answer: d, accept_also: 'Any correct everyday examples.' }); }
function asgTable(c, terms, diff) {
  return asgMk({ format: 'table', difficulty: diff, concepts: terms.map(x => x[0]), w: ASG_W.table, text: 'Complete the table. Write what each term means.', table: { headers: ['Term', 'What it means'], rows: terms.map(x => [x[0], '']), answers: terms.map(x => x[1]) }, answer: 'Each row matches the meaning given for the term.', accept_also: 'Meanings in the student’s own correct words.' });
}
function asgDraw(c, term, diff) { const [t, d] = term; return asgMk({ format: 'diagram', difficulty: diff, concepts: [t], w: ASG_W.diagram, draw: true, text: `Draw a picture to show "${t}". Add two labels.`, answer: `A clear drawing with two correct labels. Key idea: ${d}`, accept_also: 'Any drawing that shows the idea correctly.' }); }
function asgPractical(c, term, diff) { const [t, d] = term; return asgMk({ format: 'practical', difficulty: diff, concepts: [t], w: ASG_W.practical, text: `With an adult, find three examples of "${t}" at home or school. Fill in the table.`, table: { headers: ['Example', 'What I noticed'], rows: [['', ''], ['', ''], ['', '']], answers: null }, answer: `Three correct examples with a note on each. Key idea: ${d}`, accept_also: 'Any safe, correct examples from the student’s surroundings.' }); }
function asgPara(c, diff) {
  const t = c.tp.title, x = c.f.extra.trim(), base = 'use examples from everyday life', extra = x && !x.toLowerCase().includes('examples from everyday life') ? ` ${x}` : '';
  return asgMk({ format: c.fm.size && !c.fm.has('long') && c.fm.has('open') ? 'open' : 'long', difficulty: diff, concepts: c.terms.slice(0, 2).map(x => x[0]), w: ASG_W.long + 1, text: `Write a short paragraph about "${t}". Use examples from everyday life.${extra}`, answer: `A paragraph that explains ${t.toLowerCase()} correctly. Key ideas: ${c.terms.slice(0, 2).map(x => `${x[0]} – ${asgLow(x[1])}`).join(' ')}`, accept_also: 'Any correct everyday examples.', partial_credit: 'Give marks for each correct point.' });
}

/* ---------- Sections by type (§6) ---------- */
const ASG_SEC = (id, teacher, student, tasks) => ({ id, teacher_title: teacher, student_title: student, marks: 0, tasks });

function asgPractice(c, n, diffs) {
  if (n < 4) { const nx = asgPicker(c), t = []; for (let i = 0; i < n; i++) { const x = nx(); t.push(i === n - 1 && n > 1 ? asgPara(c, diffs[i]) : i === 0 && (!c.fm.size || c.fm.has('mcq')) ? asgMcq(c, x.t, diffs[i]) : asgRecall(c, x.t, diffs[i], x.round)); } return { sections: [ASG_SEC('A', 'Questions', 'Your questions', t)], blocks: {} }; }
  const next = asgPicker(c), nC = n >= 6 ? 2 : 1, nA = Math.max(2, Math.round(n * .4)), nB = Math.max(1, n - nA - nC), A = [], B = [], C = []; let k = 0;
  const useMcq = !c.fm.size || c.fm.has('mcq'), useShort = !c.fm.size || c.fm.has('short');
  for (let i = 0; i < nA; i++) { const x = next(), d = diffs[k++]; A.push(useMcq && (i < Math.ceil(nA / 2) || !useShort) ? asgMcq(c, x.t, d) : asgRecall(c, x.t, d, x.round)); }
  for (let i = 0; i < nB; i++) { const x = next(), d = diffs[k++]; B.push(asgExplain(c, x.t, d, x.round, i === nB - 1 && (!c.fm.size || c.fm.has('long') || !c.fm.has('short')))); }
  if (nC === 2) { const x = next(), d = diffs[k++]; C.push(c.fm.has('diagram') ? asgDraw(c, x.t, d) : c.fm.has('practical') ? asgPractical(c, x.t, d) : asgTable(c, c.terms.slice(0, 4), d)); }
  C.push(asgPara(c, diffs[k++]));
  return { sections: [ASG_SEC('A', 'Section A: Recall', 'Section A: Remember', A), ASG_SEC('B', 'Section B: Explain', 'Section B: Explain', B), ASG_SEC('C', 'Section C: Apply', 'Section C: Use it', C)], blocks: {} };
}

function asgGenericCase(c, i) {
  const t = c.terms, a = t[i % t.length], b = t[(i + 1) % t.length], d = t[(i + 2) % t.length], e = t[(i + 3) % t.length], name = i ? 'Arjun' : 'Riya';
  return { title: `${c.tp.title} at home`, text: `${name} is learning about ${asgLow(c.tp.title)}. At home, ${name} notices ideas such as "${a[0]}" and "${b[0]}" in everyday life. The teacher asks ${name} to explain them to the class.`,
    qs: [[`How would ${name} explain "${a[0]}"?`, a[1], ''], [`How would ${name} explain "${b[0]}"?`, b[1], ''], [`Give one example from ${name}'s home that shows "${d[0]}".`, `Any correct example. Key idea: ${d[1]}`, ''], [`Why is it useful for ${name} to understand "${e[0]}"?`, `Key idea: ${e[1]} Accept any sensible reason.`, '']], table: null };
}
function asgRealLife(c, n, diffs) {
  const cases = Math.min(6, Math.max(n >= 8 ? 2 : 1, Math.ceil(n / 7))), list = [], secs = []; let k = 0, left = n;
  for (let ci = 0; ci < cases; ci++) {
    const cs = ci === 0 && c.rich.case ? c.rich.case : asgGenericCase(c, ci + (c.rich.case ? 1 : 0)), want = Math.ceil(left / (cases - ci)), tasks = []; left -= want;
    const fill = Array.from({ length: 12 }, (_, j) => { const t = c.terms[(j + ci) % c.terms.length]; return [`Write one fact about "${t[0]}" that the case helps you understand (fact ${j + 1}).`, `Key idea: ${t[1]}`, 'Any correct fact linked to the case.']; });
    [...cs.qs, ...fill].slice(0, Math.max(1, want - 1)).forEach(q => tasks.push(asgMk({ format: 'case', difficulty: diffs[k++] || 'medium', concepts: [cs.title], w: ASG_W.case, text: q[0], answer: q[1], accept_also: q[2] })));
    const diff = diffs[k++] || 'medium', term = c.terms[(ci + 1) % c.terms.length];
    tasks.push(asgMk({ format: 'long', difficulty: diff, concepts: [term[0]], w: ASG_W.long, text: { easy: `Name one more example of "${term[0]}" that you can see at home.`, medium: `How would you explain "${term[0]}" to a friend using the case? Give an example.`, hard: `Do you agree with the conclusion drawn in the case? Give two reasons using the case and "${term[0]}".` }[diff] || `Use the case to explain "${term[0]}".`, answer: `A reason or example that uses the case. Key idea: ${term[1]}`, accept_also: 'Any answer that uses details from the case correctly.', partial_credit: 'Give marks for each correct point.' }));
    list.push({ title: cs.title, text: cs.text, data_table: cs.table || null, picture: null }); secs.push(ASG_SEC(String.fromCharCode(65 + ci), `Case ${ci + 1}: ${cs.title}`, `Case ${ci + 1}: ${cs.title}`, tasks));
  }
  return { sections: secs, blocks: { case: list } };
}

function asgGenericResearch(c) {
  const t = c.terms, tp = c.tp.title;
  return { q: `What should we know about ${asgLow(tp)}, and where can we see it around us?`, guide: [`What is "${t[0][0]}"?`, `What is "${t[1][0]}"?`, `Where do you see ${asgLow(tp)} around you?`, 'What is one question you still have?'], headings: ['Introduction', 'What I found', 'Examples near me', 'Conclusion'], findings: [t[0][1], t[1][1], 'Examples taken from the student’s own surroundings.'] };
}
function asgResearch(c, n, diffs) {
  const R = c.rich.research || asgGenericResearch(c), low = c.grade < 5, k = n - 1, words = low ? 40 : asgWordLimit(c) * 2, guide = []; let i = 0;
  while (guide.length < k) { guide.push(R.guide[guide.length] || `Write one more fact about ${asgLow(c.tp.title)} that you found (fact ${guide.length + 1}).`); }
  const tasks = guide.map((q, j) => asgMk({ format: 'open', difficulty: diffs[i++] || 'medium', concepts: [c.terms[j % c.terms.length][0]], w: ASG_W.open - .5, text: q, answer: R.findings[j % R.findings.length], accept_also: 'Any accurate finding supported by a source.', lines: 3 }));
  tasks.push(asgMk({ format: 'long', difficulty: diffs[i++] || 'medium', concepts: [c.tp.title], w: ASG_W.long + 2, text: low ? 'Show what you found. Draw and write about it.' : `Write your report on the research question. Use the headings given and write about ${words} words.`, answer: 'A report that answers the research question using the findings, with sources named.', accept_also: 'Any well-organised report with accurate facts.', partial_credit: 'Give marks for each criterion in the rubric.', lines: Math.min(14, Math.round(words / 12)) }));
  const src = low ? ['Ask a family member', `Look at the chapter on ${c.tp.title} in your textbook`] : [`The chapter on ${c.tp.title} in your textbook`, 'A family member or neighbour', 'A library book', 'A website your teacher approves, with an adult beside you'];
  return { sections: [ASG_SEC('A', 'Research question and guiding questions', low ? 'Ask and find out' : 'Your research', tasks)], blocks: { research: { question: R.q, guiding_questions: guide, allowed_sources: src, report_headings: R.headings, word_limit: words, safety: low ? 'Ask an adult for help before you look for anything.' : 'Ask an adult before using the internet. Use only the websites your teacher allows.' } } };
}

function asgProject(c, n, diffs) {
  const P = c.rich.project || { drive: `How can we show what we know about ${asgLow(c.tp.title)}?`, product: `a poster about ${asgLow(c.tp.title)}`, mats: ['Chart paper', 'Pencils and colours', 'Glue stick', 'Old magazines or newspapers'], steps: [`Find out three facts about ${asgLow(c.tp.title)}.`, 'Plan your poster on rough paper.', 'Draw or stick pictures.', 'Write a label and one fact for each picture.', 'Add a title and your name.'], reflect: ['What was the most interesting thing you learned?', 'What would you improve next time?'], sample: `A neat poster with a title, pictures and a correct fact for each idea about ${asgLow(c.tp.title)}.` };
  const m = Math.max(1, Math.min(6, n - 2)), titles = ['Plan and collect materials', 'Make a first draft', 'Build the main part', 'Add labels and finishing touches', 'Check your work', 'Practise showing it'], days = Math.max(m + 1, asgDaysTo(c.due)), today = asgToday(), due1 = asgDate(c.due, -1), ms = [];
  for (let i = 0; i < m; i++) { let d = asgDate(today, Math.round(days * (i + 1) / (m + 1))); if (d > due1) d = due1; if (d < today) d = today; ms.push({ title: titles[i], date: d }); }
  const tasks = ms.map((x, j) => asgMk({ format: 'practical', difficulty: diffs[j] || 'medium', concepts: [c.tp.title], w: 2, text: `Milestone ${j + 1}: ${x.title}.`, answer: `Shows clear progress on ${P.product}.`, accept_also: 'Any sensible evidence of progress, such as a draft, a list or a photo.', lines: 0, milestone: true, date: x.date }));
  tasks.push(asgMk({ format: 'practical', difficulty: diffs[m] || 'medium', concepts: c.terms.slice(0, 3).map(x => x[0]), w: 8, text: `Hand in your finished project: ${P.product}.`, answer: `A finished product that answers "${P.drive}" and uses the key ideas correctly.`, accept_also: 'Any neat, complete product that shows the key concepts.', partial_credit: 'Mark with the rubric.', lines: 0, milestone: true, date: c.due }));
  tasks.push(asgMk({ format: 'open', difficulty: diffs[m + 1] || 'medium', concepts: [c.tp.title], w: 3, text: 'Reflection: ' + P.reflect[0] + (P.reflect[1] ? ' ' + P.reflect[1] : ''), answer: 'An honest reflection that names what was learned and one improvement.', accept_also: 'Any thoughtful answer.', lines: 4 }));
  return { sections: [ASG_SEC('A', 'Project brief and milestones', 'Your project', tasks)], blocks: { project: { driving_question: P.drive, product: P.product, materials: P.mats, steps: P.steps, milestones: ms, roles: [], reflection: P.reflect, sample_product: P.sample } } };
}

function asgEssay(c, n, diffs) {
  const W = c.rich.writing, tp = c.tp.title, sci = !/English|Hindi|Language/i.test(c.subject), words = asgWordLimit(c);
  const prompts = W ? W.prompts : sci ? [`Write a short explanation of ${asgLow(tp)} for a friend who has not studied it. Use at least two ideas from the chapter.`, `Write a short piece called "A day in the life of ${asgLow(c.terms[0][0])}".`] : [`Write about ${asgLow(tp)} in about ${words} words.`, `Write a diary entry that uses ideas from ${asgLow(tp)}.`];
  const form = W ? W.form : sci ? 'Short explanatory piece' : 'Essay', audience = W ? W.audience : 'Your classmates', planner = W?.planner || ['Beginning', 'Middle', 'End'];
  const crit = W?.criteria || ['I answered the prompt.', 'My ideas are in a clear order.', `I used words from the chapter, such as "${c.terms[0][0]}".`, 'I checked my spelling and full stops.'];
  const model = W?.model || `${tp} is about ${asgLow(c.terms[0][1]).replace(/\.$/, '')}. For example, "${c.terms[0][0]}" helps us understand it. Another important idea is "${c.terms[1][0]}", which means ${asgLow(c.terms[1][1]).replace(/\.$/, '')}. This shows why ${asgLow(tp)} matters in our everyday life.`;
  const tasks = [];
  for (let i = 0; i < n - 1; i++) { const t = c.terms[i % c.terms.length]; tasks.push(asgMk({ format: 'short', difficulty: diffs[i] || 'easy', concepts: [t[0]], w: 1.4, text: i ? `Pre-writing: write one fact about "${t[0]}".` : 'Pre-writing: list 5 words or ideas you may use.', answer: `Relevant words or ideas, such as ${c.terms.slice(0, 3).map(x => x[0]).join(', ')}.`, accept_also: 'Any relevant words or ideas.', lines: 2 })); }
  tasks.push(asgMk({ format: 'open', difficulty: diffs[n - 1] || 'medium', concepts: [tp], w: 12, text: prompts.length > 1 ? 'Write on ONE of the prompts above.' : 'Write on the prompt above.', answer: model, accept_also: 'Any response that covers the key ideas in a clear order and in the right form.', partial_credit: 'Mark with the rubric.', lines: Math.min(16, Math.round(words / 12)) }));
  return { sections: [ASG_SEC('A', 'Writing task', 'Your writing task', tasks)], blocks: { writing: { prompts, form, audience, word_limit: words, planner, success_criteria: crit, model_response: model } } };
}

function asgRevision(c, n, diffs) {
  const tops = c.ch.topics, A = [], B = [], C = [], map = []; let k = 0;
  const nA = Math.round(n * .4), nC = Math.max(2, Math.round(n * .25)), nB = n - nA - nC, rounds = {};
  const take = i => { const tp = tops[i % tops.length], ts = ASG_TERMS[tp.id] || [[tp.title, `The main idea of ${tp.title}.`]], r = rounds[tp.id] = (rounds[tp.id] ?? -1) + 1; return { tp, term: ts[r % ts.length], round: Math.floor(r / ts.length), terms: ts }; };
  const cx = x => ({ ...c, terms: x.terms, r: c.r });
  let i = 0;
  for (let j = 0; j < nA; j++, i++) { const x = take(i), t = asgMcq(cx(x), x.term, diffs[k++]); t.topic = x.tp.title; A.push(t); }
  for (let j = 0; j < nB; j++, i++) { const x = take(i), t = asgRecall(cx(x), x.term, diffs[k++], x.round); t.topic = x.tp.title; B.push(t); }
  for (let j = 0; j < nC; j++, i++) {
    const x = take(i), last = j === nC - 1, y = take(i + 1);
    const t = last ? asgMk({ format: 'long', difficulty: diffs[k++], concepts: [x.term[0], y.term[0]], w: ASG_W.long + 1, text: `Asha says "${x.term[0]}" and "${y.term[0]}" mean the same thing. Do you agree? Use ideas from the chapter to explain.`, answer: `No. "${x.term[0]}": ${asgLow(x.term[1])} "${y.term[0]}": ${asgLow(y.term[1])}`, accept_also: 'Any correct comparison using both ideas.', partial_credit: 'Give marks for each correct point.' }) : asgExplain(cx(x), x.term, diffs[k++], x.round, true);
    t.topic = x.tp.title; C.push(t);
  }
  [...A, ...B, ...C].forEach(t => map.push(t.topic));
  return { sections: [ASG_SEC('A', 'Section A: Objective questions', 'Section A: Choose the answer', A), ASG_SEC('B', 'Section B: Short answers', 'Section B: Short answers', B), ASG_SEC('C', 'Section C: Explain and apply', 'Section C: Explain and use it', C)], blocks: { revision: { topic_map: [] }, _map: map } };
}

function asgSections(c, cnt) {
  const d = asgDiffList(c.f.difficulty, cnt.count + 4), n = cnt.count;
  return { practice_worksheet: asgPractice, real_life_application: asgRealLife, research_task: asgResearch, project: asgProject, essay_creative_writing: asgEssay, chapter_revision: asgRevision }[c.f.type](c, n, d);
}

/* ---------- Marks, marking points, answer lines (§9, §10.4) ---------- */
function asgPoints(t) {
  const m = t.marks; if (!m) return [];
  if (t.format === 'mcq') return [{ point: 'Chooses the correct option', marks: m }];
  if (t.milestone) return [{ point: 'Work shown on or before the date', marks: m }];
  if (t.format === 'table') return t.table.answers ? t.table.answers.map((x, i) => ({ point: `Row ${i + 1} correct`, marks: 0 })).map((p, i, a) => ({ ...p, marks: Math.floor(m / a.length) + (i < m % a.length ? 1 : 0) })).filter(p => p.marks > 0) : [{ point: 'Three correct examples', marks: m }];
  if (m === 1) return [{ point: 'Correct answer', marks: 1 }];
  if (m === 2) return [{ point: 'Correct meaning', marks: 1 }, { point: 'Clear sentence', marks: 1 }];
  if (m === 3) return [{ point: 'Explains the idea correctly', marks: 2 }, { point: 'Gives a correct example', marks: 1 }];
  return [{ point: 'Explains the main idea correctly', marks: m - 2 }, { point: 'Gives correct examples', marks: 1 }, { point: 'Writes clearly in own words', marks: 1 }];
}
function asgLines(t, marksOn) {
  if (t.lines != null) return t.lines;
  if (t.format === 'mcq' || t.format === 'table' || t.draw) return 0;
  if (!marksOn) return t.format === 'long' || t.format === 'open' ? 6 : 2;
  return t.marks <= 2 ? Math.max(1, t.marks) : t.marks === 3 ? 4 : Math.min(10, t.marks * 2);
}
function asgFinish(d, c) {
  const all = []; let n = 0;
  d.sections.forEach(s => s.tasks.forEach(t => { t.n = ++n; t.objective_id = 'LO1'; all.push(t); }));
  if (c.marksOn) { const ms = largestRemainder(all.map(t => t.w), c.total); all.forEach((t, i) => t.marks = ms[i]); }
  all.forEach(t => { t.marking_points = asgPoints(t); t.answer_lines = asgLines(t, c.marksOn); delete t.w; });
  d.sections.forEach(s => s.marks = s.tasks.reduce((a, t) => a + t.marks, 0));
  if (c.marksOn && c.total < all.length) d.generation_notes.warnings.push(`Marks (${c.total}) are fewer than tasks (${all.length}), so some tasks carry no marks.`);
}

/* ---------- Everything else in the canonical object ---------- */
function asgOutcomes(c) { const tp = c.tp.title; return [`Recall the key terms in “${tp}”.`, `Explain the main ideas of “${tp}” in their own words.`, 'Use these ideas in an everyday situation.']; }
function asgInstructions(c, d) {
  const B = d.type_blocks, tp = c.f.type, words = B.writing?.word_limit || B.research?.word_limit, low = c.grade < 5;
  const base = { practice_worksheet: ['Read each question carefully.', 'Answer all the questions in the space given.', 'Write neatly in full sentences where asked.', 'Check your answers before you hand in.'],
    real_life_application: ['Read the case carefully.', 'Use the information in the case to answer each question.', 'Write your working or reasons where asked.', 'Check your answers before you hand in.'],
    research_task: low ? ['Read the question.', 'Ask a family member and look in your book.', 'Write what you find.', 'Draw and write about what you found.'] : ['Read the research question.', 'Use only the sources your teacher allows.', 'Write what you find in the source record.', 'Plan your report with the headings given.', `Write your report in about ${words} words.`, 'Ask an adult before using the internet.'],
    project: ['Read the project brief.', 'Collect your materials.', 'Follow the steps and finish each milestone by its date.', 'Tick the final product checklist.', 'Answer the reflection and hand in your project by the submit-by date.'],
    essay_creative_writing: ['Read the prompt. Choose one if two are given.', 'Fill in the planner before you write.', `Write about ${words} words.`, 'Use the success criteria to check your work.'],
    chapter_revision: ['Read each question carefully.', 'Answer every question in the space given.', 'Tick how easy or hard you found each section.', 'Check your answers before you hand in.'] }[tp].slice();
  if (c.f.extra.trim()) base.splice(base.length - 1, 0, c.f.extra.trim().replace(/\.?$/, '.'));
  return base;
}
function asgDeliverable(c, d) {
  const B = d.type_blocks, fm = new Set(d.sections.flatMap(s => s.tasks.map(t => t.format))), rows = [];
  const labels = { mcq: ['Multiple choice', 'Choose one option'], short: ['Short answers', '1 to 2 lines'], long: ['Long answers', '3 to 4 lines'], open: ['Open answers', 'A short paragraph'], table: ['Table', 'Fill every row'], diagram: ['Drawing', 'A neat picture with two labels'], practical: ['Practical work', 'As described in the task'], case: ['Case answers', '1 to 2 lines'] };
  Object.keys(labels).forEach(k => fm.has(k) && rows.push({ item: labels[k][0], length: labels[k][1] }));
  const t = c.f.type;
  if (t === 'research_task') return { text: c.grade < 5 ? 'Your “ask and find out” sheet.' : 'Your source record and a short report that answers the research question.', length_guide: [{ item: 'Source record', length: 'At least 2 sources' }, { item: 'Report', length: c.grade < 5 ? 'A few sentences and a drawing' : `About ${B.research.word_limit} words` }] };
  if (t === 'project') return { text: 'Your finished project and your reflection answers.', length_guide: [{ item: 'Final product', length: 'As described in the project brief' }, { item: 'Reflection', length: '2 to 3 lines for each question' }] };
  if (t === 'essay_creative_writing') return { text: 'Your planner and your finished piece of writing.', length_guide: [{ item: 'Planner', length: 'Notes in every box' }, { item: 'Writing', length: `About ${B.writing.word_limit} words` }] };
  if (t === 'real_life_application') return { text: 'Your answers to all the case questions.', length_guide: rows };
  if (t === 'chapter_revision') return { text: 'Your completed revision sheet.', length_guide: rows };
  return { text: 'Your completed worksheet.', length_guide: rows };
}
function asgNotes(c, d) {
  const t = c.f.type, tp = c.tp.title, T = c.terms, B = d.type_blocks;
  const misc = (c.rich.misc || [[`Students may mix up "${T[0][0]}" and "${T[1][0]}".`, 'Put one example of each side by side and ask what makes them different.'], [`Students may know the word "${T[2 % T.length][0]}" but not use it in a sentence.`, 'Ask them to say it aloud in a sentence before they write.']]).map(x => ({ misconception: x[0], address: x[1] }));
  const type_notes = {
    practice_worksheet: [`Common errors in Section A: choosing the option that sounds familiar. Quick fix: ask students to say why the other options are wrong.`, `Common errors in Section B: writing only the term. Quick fix: ask for one example as well.`, 'Common errors in Section C: filling the table with examples instead of meanings. Quick fix: read the heading aloud first.'],
    real_life_application: [`Why the case fits: it needs the ideas of ${asgLow(tp)} to answer every question.`, 'Discussion points: ask where students have seen something similar at home or in the market.', 'To adapt the case, change the names, places or objects to ones from your own town or school.'],
    research_task: [`Suggested sources by type: the chapter on ${tp} in the textbook, a family member, a library book, a supervised website. No page numbers are given.`, `Safety: ${B.research?.safety}`, 'Time plan: Day 1 read and ask questions, Day 2 fill the source record, Day 3 write the report.'],
    project: [`Materials are low-cost and available at home: ${B.project?.materials.join(', ')}.`, `Check milestones on: ${B.project?.milestones.map(m => asgFmtDate(m.date)).join(', ')}.`, `Sample product: ${B.project?.sample_product}`, 'Safety: scissors, glue and heat only with an adult nearby.'],
    essay_creative_writing: ['Common writing errors: missing full stops, repeating one word, no clear ending.', 'Vocabulary bank for support: ' + T.map(x => x[0]).join(', ') + '.', `Extension prompt: write the same piece again for a different audience.`],
    chapter_revision: ['Use the topic map in the answer guidance to see which topics need reteaching.', 'Revision tips: mix quick quizzes with one explain-it-aloud round per topic.', 'Ask students to mark the self-check boxes first, then compare them with their marks.'],
  }[t];
  const prep = { project: 'Check that students can find the materials at home and share the milestone dates with parents.', research_task: 'Tell students which sources are allowed and remind them about internet safety.', chapter_revision: 'Revise each topic briefly before handing out the sheet.' }[t] || `Go through the instructions with the class and show one solved example on ${tp}.`;
  return { preparation: prep, misconceptions: misc, needs_support: 'Read the questions aloud, let students answer orally first, and give a word bank of the key terms.', ready_for_more: `Ask students to add one new example of their own for each question or explain the idea to a partner.`, type_notes };
}
function asgChecklist(c) {
  return { practice_worksheet: ['I read every instruction.', 'I answered every question.', 'I wrote my name, class and date.', 'My work is neat and easy to read.'], real_life_application: ['I read the case carefully.', 'I used the case in my answers.', 'I answered every question.', 'I wrote my name, class and date.'], research_task: ['I wrote my research question.', 'I filled in my source record.', 'I used my report headings.', 'I wrote my name, class and date.'], project: ['My project answers the driving question.', 'I finished every milestone.', 'I answered the reflection.', 'I wrote my name, class and date.'], essay_creative_writing: ['I filled in my planner.', 'I used the success criteria.', 'I checked my spelling and full stops.', 'I wrote my name, class and date.'], chapter_revision: ['I answered every question.', 'I ticked easy or hard for each section.', 'I wrote my name, class and date.', 'My work is neat and easy to read.'] }[c.f.type].concat(`I will hand it in by ${asgFmtDate(c.f.dueDate)}.`);
}
function asgStudentIntro(c, d) { return `You will practise and show what you know about ${c.tp.title}. ${d.metadata.objective}`; }

/* evaluation: marks distribution and rubric (criteria × levels, marks that total the assignment) */
function asgEval(d, c) {
  const m = d.metadata, all = d.sections.flatMap(s => s.tasks), dist = d.sections.map(s => ({ section: s.id, tasks: s.tasks.map(t => t.n), marks: s.marks }));
  if (!m.marks_enabled || !m.rubric) return { distribution: m.marks_enabled ? dist : [], rubric: [] };
  const sets = { research_task: ['Content and accuracy', 'Use of sources', 'Organisation', 'Presentation'], project: ['Concept accuracy', 'Process and milestones', 'Creativity', 'Presentation'], essay_creative_writing: ['Content and ideas', 'Organisation', 'Language and vocabulary', 'Grammar and spelling'] }[c.f.type] || ['Accuracy of concepts', 'Use of the details given', 'Clarity of explanation'];
  const ms = largestRemainder(sets.map((_, i) => [4, 3, 2, 1][i] + (sets.length === 3 ? 1 : 0)), m.total_marks), ns = all.map(t => t.n);
  const rubric = sets.map((name, i) => ({ criterion: name, tasks: sets.length === 3 ? ns.filter((n, j) => j % 3 === i) : ns, marks: ms[i], full: `${name}: complete, accurate and clear.`, partial: `${name}: partly correct or missing detail.`, not_yet: `${name}: not shown yet.` }));
  return { distribution: dist, rubric };
}

/* ---------- Canonical builder ---------- */
function asgBuild(f, o = {}) {
  const c = asgCtx(f, o.salt || 0), cnt = asgCount(c), sec = asgSections(c, cnt);
  const d = { id: o.id || 'a' + Date.now().toString(36) + Math.floor(Math.random() * 1e3), metadata: asgMeta(c, cnt), outcomes: asgOutcomes(c), instructions: [], deliverable: null, student_intro: '', sections: sec.sections,
    type_blocks: { case: null, research: null, project: null, writing: null, revision: null, ...sec.blocks }, evaluation: null, teacher_notes: null, student_checklist: [], validation: { checks: [] }, generation_notes: { assumptions: [], warnings: [] } };
  const map = d.type_blocks._map; delete d.type_blocks._map;
  asgFinish(d, c);
  if (map) d.type_blocks.revision.topic_map = d.sections.flatMap(s => s.tasks).map((t, i) => ({ task: t.n, topic: map[i] }));
  d.instructions = asgInstructions(c, d); d.deliverable = asgDeliverable(c, d); d.student_intro = asgStudentIntro(c, d);
  d.evaluation = asgEval(d, c); d.teacher_notes = asgNotes(c, d); d.student_checklist = asgChecklist(c);
  if (c.f.extra.trim()) d.generation_notes.assumptions.push(`Additional instruction applied: ${c.f.extra.trim()}`);
  if (f.type === 'project' && c.minutes < 60) d.generation_notes.warnings.push('A project in under an hour was adapted into a mini-project.');
  if (asgDaysTo(c.due) < 0) d.generation_notes.warnings.push('The submission date is in the past.');
  if (d.metadata.source_status === 'unverified') d.generation_notes.warnings.push('Unverified: this assignment is not checked against the textbook.');
  d.validation.checks = asgChecks(d, c.f);
  return d;
}

/* ---------- §14 validation (code checks) ---------- */
function asgChecks(d, f) {
  const m = d.metadata, all = d.sections.flatMap(s => s.tasks), out = [], add = (id, ok, location, note) => out.push({ id, status: ok ? 'pass' : 'fail', location, note });
  const chosen = { practice_worksheet: null, real_life_application: 'case', research_task: 'research', project: 'project', essay_creative_writing: 'writing', chapter_revision: 'revision' }[m.assignment_type];
  const revCount = asgFind(asgBook(f.bookId), f.topicId).chapter.topics.length;
  add('T1', all.length === m.task_count, 't3', `This assignment has ${all.length} tasks; ${m.task_count} were expected.`);
  add('T2', Object.entries(d.type_blocks).every(([k, v]) => (k === chosen ? !!v : !v)), 't3', 'The type block does not match the selected type.');
  add('T3', all.every(t => t.text && t.objective_id), 't3', 'A task has no instruction or objective.');
  const seen = new Set(); add('T4', all.every(t => { const k = t.text.toLowerCase().replace(/\W+/g, ' '); if (seen.has(k)) return false; seen.add(k); return true; }), 't3', 'Two tasks are almost the same.');
  if (chosen === 'revision') add('T5', new Set(d.type_blocks.revision.topic_map.map(x => x.topic)).size >= revCount, 't3', 'Not every chapter topic has a question.');
  if (chosen === 'project') add('T6', d.type_blocks.project.milestones.every(x => x.date < m.due_date), 't3', 'A milestone date is not before the submission date.');
  add('A1', all.every(t => t.answer), 't5', 'A question has no answer guidance.');
  if (m.marks_enabled) {
    add('M1', all.reduce((a, t) => a + t.marks, 0) === m.total_marks && d.sections.every(s => s.marks === s.tasks.reduce((a, t) => a + t.marks, 0)), 't3', 'Task or section marks do not add up to the total.');
    add('M2', all.every(t => t.marking_points.reduce((a, p) => a + p.marks, 0) === t.marks), 't5', 'Marking points do not add up to a question’s marks.');
    if (m.rubric) add('M3', d.evaluation.rubric.reduce((a, r) => a + r.marks, 0) === m.total_marks && d.evaluation.rubric.every(r => r.tasks.length), 't6', 'Rubric marks do not add up to the total.');
  }
  return out;
}
const asgFailed = d => d.validation.checks.filter(c => c.status === 'fail');
