/* Quiz Builder 2.0 - registration + routes */
registerTool({
  id: 'quiz-builder-2', name: 'Quiz Builder 2.0', cat: 'Assess', icon: 'check', cost: 3, isNew: true, ready: true,
  desc: 'Build a quiz from a chapter and its topics, with question types, difficulty and Bloom’s levels, as a Student view and a Teacher view with answers.',
  base: '/quiz-builder-2',
  matches: r => r.startsWith('/quiz-builder-2'),
  books: qb2Books, pickBook: qb2PickBook, form: () => qb2FormView(), bind: () => qb2BindForm(),
  routes: [
    ['/quiz-builder-2', () => bpEnter('quiz-builder-2')],                                        // BOOK PICKER -> INPUT modal
    ['/quiz-builder-2/generating', () => qb2GeneratingView()],                                   // INPUT -> OUTPUT
    ['/quiz-builder-2/output', () => { if (!qb2Doc) { navigate('#/quiz-builder-2'); return 'redirect'; } $('#view').innerHTML = qb2OutputView(); qb2BindOutput(); }],
    ['/quiz-builder-2/sample', () => { qb2Form = qb2Sample(); qb2Doc = qb2Build(qb2Form, 7); qb2View = 'student'; navigate('#/quiz-builder-2/output'); return 'redirect'; }],
  ],
});
