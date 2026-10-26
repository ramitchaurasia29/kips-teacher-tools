/* Practice test - registration + routes */
registerTool({
  id: 'practice-test', name: 'Practice test', cat: 'Assess', icon: 'award', cost: 5, isNew: true, ready: true,
  desc: 'Create a practice test with long answer, short answer and MCQ sections: a Student view with questions only and a Teacher view with answers.',
  base: '/practice-test',
  matches: r => r.startsWith('/practice-test'),
  books: ptBooks, pickBook: ptPickBook, form: () => ptFormView(), bind: () => ptBindForm(),
  routes: [
    ['/practice-test', () => bpEnter('practice-test')],                                          // BOOK PICKER -> INPUT modal
    ['/practice-test/generating', () => ptGeneratingView()],                                             // INPUT -> OUTPUT
    ['/practice-test/output', () => { if (!ptDoc) { navigate('#/practice-test'); return 'redirect'; } $('#view').innerHTML = ptOutputView(); ptBindOutput(); }],
    ['/practice-test/sample', () => { ptForm = { ...ptDefaults(), chapters: ['C1', 'C2'], topics: ['T1', 'T2', 'T3', 'T4', 'T5'] }; ptDoc = ptBuild(ptForm); ptView = 'student'; navigate('#/practice-test/output'); return 'redirect'; }],
  ],
});
