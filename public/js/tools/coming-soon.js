/* Placeholder tools shown on the hub. Replace an entry with a real tools/<tool>/ folder when built. */
[
  { id: 'quiz-generator', name: 'Quiz Generator', cat: 'Assess', icon: 'check', cost: 3, desc: 'Generate MCQs, short and long questions with answer keys.' },
  { id: 'rubric-builder', name: 'Rubric Builder', cat: 'Assess', icon: 'award', cost: 3, desc: 'Build clear assessment rubrics for any task.' },
  { id: 'worksheet-maker', name: 'Worksheet Maker', cat: 'Create', icon: 'doc', cost: 3, desc: 'Printable practice worksheets in seconds.' },
  { id: 'homework-activity', name: 'Homework Activity', cat: 'Create', icon: 'pencil', cost: 3, desc: 'Meaningful at-home activities for learners.' },
].forEach(t => registerTool({ ...t, ready: false, routes: [] }));
