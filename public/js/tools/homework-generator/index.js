/* Homework generator - registration + routes */
registerTool({
  id: 'homework-generator', name: 'Homework generator', cat: 'Create', icon: 'doc', cost: 5, isNew: true, ready: true,
  desc: 'Create homework with eight question types: a Student view with questions only and a Teacher view with answers.',
  base: '/homework-generator',
  matches: r => r.startsWith('/homework-generator'),
  books: hwBooks, pickBook: hwPickBook, form: () => hwFormView(), bind: () => hwBindForm(),
  routes: [
    ['/homework-generator', () => bpEnter('homework-generator')],                                          // BOOK PICKER -> INPUT modal
    ['/homework-generator/generating', () => hwGeneratingView()],                                             // INPUT -> OUTPUT
    ['/homework-generator/output', () => { if (!hwDoc) { navigate('#/homework-generator'); return 'redirect'; } $('#view').innerHTML = hwOutputView(); hwBindOutput(); }],
    ['/homework-generator/sample', () => { hwForm = { ...hwDefaults(), chapters: ['C1', 'C2'], topics: ['T1', 'T2', 'T3', 'T4', 'T5'] }; hwDoc = hwBuild(hwForm); hwView = 'student'; navigate('#/homework-generator/output'); return 'redirect'; }],
  ],
});
