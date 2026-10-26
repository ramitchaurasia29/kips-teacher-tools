/* Case Study Builder 2.0 - registration + routes */
registerTool({
  id: 'case-study-builder-2', name: 'Case Study Builder 2.0', cat: 'Assess', icon: 'book', cost: 3, isNew: true, ready: true,
  desc: 'Build a scenario-based case study from topics, with questions, as a Student view on paper and a Teacher view with answers.',
  base: '/case-study-builder-2',
  matches: r => r.startsWith('/case-study-builder-2'),
  books: cs2Books, pickBook: cs2PickBook, form: () => cs2FormView(), bind: () => cs2BindForm(),
  routes: [
    ['/case-study-builder-2', () => bpEnter('case-study-builder-2')],                              // BOOK PICKER -> INPUT modal
    ['/case-study-builder-2/generating', () => cs2GeneratingView()],                               // INPUT -> OUTPUT
    ['/case-study-builder-2/output', () => { if (!cs2Doc) { navigate('#/case-study-builder-2'); return 'redirect'; } $('#view').innerHTML = cs2OutputView(); cs2BindOutput(); }],
    ['/case-study-builder-2/sample', () => { cs2Form = cs2Sample(); cs2Doc = cs2Build(cs2Form, 7); cs2View = 'student'; navigate('#/case-study-builder-2/output'); return 'redirect'; }],
  ],
});
