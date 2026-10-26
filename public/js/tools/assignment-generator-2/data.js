/* Assignment generator 2.0 - content. asg2Build() reuses the original generator (asgBuild) and reshapes its result into the one
   student-facing document shown on the output screen: title, "Submit as", overview, numbered tasks (with figures) and a 4-level rubric.
   Replace with the real service later; the shape below is what the output screen renders. */

const ASG2_LEVELS = ['Excellent', 'Good', 'Developing', 'Needs Improvement'];
const ASG2_SUBMIT = { practice_worksheet: 'Worksheet answers', real_life_application: 'Worksheet answers', research_task: 'Written report', project: 'Physical Poster', essay_creative_writing: 'Written piece', chapter_revision: 'Worksheet answers' };
const ASG2_INTRO = {
  practice_worksheet: t => `Complete the tasks below to practise ${t}.`,
  real_life_application: t => `Read each case carefully and use what you know about ${t} to answer the questions.`,
  research_task: t => `Research ${t} using the sources your teacher allows, then write up what you find.`,
  project: t => `Create a project to show your understanding of ${t}. Your work should clearly explain and illustrate each task.`,
  essay_creative_writing: t => `Write about ${t}, using ideas from the chapter and checking your work against the success criteria.`,
  chapter_revision: t => `Revise ${t} by answering the mixed questions below.`,
};
/* criterion name -> what the descriptor talks about; type sets match the original generator's rubric criteria */
const ASG2_CRITERIA = {
  research_task: [['Content and accuracy', 'facts and explanations'], ['Use of sources', 'sources and the notes taken from them'], ['Organisation', 'headings and order of ideas'], ['Presentation', 'neatness and layout']],
  project: [['Concept accuracy', 'concepts and steps'], ['Process and milestones', 'milestones and the steps followed'], ['Creativity', 'ideas and the way they are shown'], ['Presentation', 'neatness and layout']],
  essay_creative_writing: [['Content and ideas', 'ideas'], ['Organisation', 'order of ideas'], ['Language and vocabulary', 'words and sentences'], ['Grammar and spelling', 'grammar, spelling and full stops']],
  _default: [['Content accuracy', 'answers and working'], ['Clarity and explanation', 'explanations'], ['Use of the details given', 'details taken from the question or case'], ['Presentation', 'neatness and layout']],
};
function asg2Rubric(type, topic) {
  const set = ASG2_CRITERIA[type] || ASG2_CRITERIA._default, t = topic.toLowerCase();
  return { levels: ASG2_LEVELS.slice(), criteria: set.map(([name, focus]) => ({ name, cells: [
    `All ${focus} are correct, complete and clearly shown. Work shows a secure grasp of ${t}.`,
    `Most ${focus} are correct and complete, with only minor errors or gaps in ${t}.`,
    `Some ${focus} are correct, but several errors or missing parts show ${t} is only partly understood.`,
    `The ${focus} are largely incorrect or missing, and little understanding of ${t} is shown.`] })) };
}

function asg2Build(form) {
  const d = asgBuild(form), m = d.metadata, B = d.type_blocks, due = asgFmtDate(m.due_date);
  const brief = [];
  if (B.research) brief.push(['Research question', B.research.question]);
  if (B.project) brief.push(['Driving question', B.project.driving_question], ['Product', `Make ${B.project.product}.`]);
  if (B.writing) B.writing.prompts.forEach((p, i) => brief.push([B.writing.prompts.length > 1 ? `Prompt ${i + 1}` : 'Prompt', p]));
  const tasks = d.sections.flatMap((s, si) => s.tasks.map((t, ti) => {
    const task = { text: t.milestone && t.date ? `${t.text} Finish by ${asgFmtDate(t.date)}.` : t.text, options: t.options ? t.options.slice() : null, lines: t.milestone || t.draw || t.format === 'mcq' || t.format === 'table' ? 0 : (t.answer_lines || 0), figure: null, caseCard: null };
    if (t.table) task.figure = { title: `${m.topic}: table`, caption: t.table.answers ? 'Complete every row.' : 'Fill in the table.', headers: t.table.headers.slice(), rows: t.table.rows.map(r => r.slice()), img: null };
    const c = B.case && B.case[si];
    if (c && ti === 0) task.caseCard = { title: c.title, text: c.text };
    return task;
  }));
  return {
    id: d.id, type: m.assignment_type, topic: m.topic,
    title: `${m.topic} ${m.type_label}`,
    submit_as: ASG2_SUBMIT[m.assignment_type] || 'Worksheet answers',
    overview: `${ASG2_INTRO[m.assignment_type](m.topic.toLowerCase())} ${m.objective}${m.objective.endsWith('.') ? '' : '.'} Submit by ${due}.`,
    brief, tasks, rubric: asg2Rubric(m.assignment_type, m.topic),
  };
}
