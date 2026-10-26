/* Worksheet generator 2.0 - registration + routes */
registerTool({
  id: 'worksheet-generator-2', name: 'Worksheet generator 2.0', cat: 'Create', icon: 'doc', cost: 5, isNew: true, ready: true,
  desc: 'Create a printable worksheet with eight question types: a paper-style Student view and a Teacher view with answers.',
  base: '/worksheet-generator-2',
  matches: r => r.startsWith('/worksheet-generator-2'),
  books: wsBooks, pickBook: wsPickBook, form: () => wsFormView(), bind: () => wsBindForm(),
  routes: [
    ['/worksheet-generator-2', () => bpEnter('worksheet-generator-2')],                                          // BOOK PICKER -> INPUT modal
    ['/worksheet-generator-2/generating', () => wsGeneratingView()],                                             // INPUT -> OUTPUT
    ['/worksheet-generator-2/output', () => { if (!wsDoc) { navigate('#/worksheet-generator-2'); return 'redirect'; } $('#view').innerHTML = wsOutputView(); wsBindOutput(); }],
    ['/worksheet-generator-2/sample', () => { wsForm = { ...wsDefaults(), chapterId: 'C2', topics: ['T4', 'T5'], dueDate: asgToday(), formats: WS_FORMATS.map(x => x[0]), difficulty: 'Medium', rubric: true, blooms: ['Remember', 'Apply'] }; wsDoc = wsBuild(wsForm); wsView = 'student'; navigate('#/worksheet-generator-2/output'); return 'redirect'; }],
  ],
});
