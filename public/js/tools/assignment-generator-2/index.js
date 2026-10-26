/* Assignment generator 2.0 - registration + routes */
registerTool({
  id: 'assignment-generator-2', name: 'Assignment generator 2.0', cat: 'Create', icon: 'pencil', cost: 5, isNew: true, ready: true,
  desc: 'Create a practice sheet, case, research task, project, writing task or revision sheet as one clear student document with tasks and a rubric.',
  base: '/assignment-generator-2',
  matches: r => r.startsWith('/assignment-generator-2'),
  books: asgBooks, pickBook: asg2PickBook, form: () => asg2FormView(), bind: () => asg2BindForm(),
  routes: [
    ['/assignment-generator-2', () => bpEnter('assignment-generator-2')],                                          // BOOK PICKER -> INPUT modal
    ['/assignment-generator-2/generating', () => asg2GeneratingView()],                                            // INPUT -> OUTPUT
    ['/assignment-generator-2/output', () => { if (!asg2Doc) { navigate('#/assignment-generator-2'); return 'redirect'; } $('#view').innerHTML = asg2OutputView(); asg2BindOutput(); }],
    ['/assignment-generator-2/sample', () => { asg2Form = asgSample(); asg2Doc = asg2NewDoc(asg2Build(asg2Form), asg2Form); navigate('#/assignment-generator-2/output'); return 'redirect'; }],
  ],
});
