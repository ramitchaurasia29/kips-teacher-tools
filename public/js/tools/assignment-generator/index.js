/* Assignment generator - registration + routes */
registerTool({
  id: 'assignment-generator', name: 'Assignment generator', cat: 'Create', icon: 'pencil', cost: 5, isNew: true, ready: true,
  desc: 'Create a practice sheet, case, research task, project, writing task or revision sheet with a Student View and a Teacher View.',
  base: '/assignment-generator',
  matches: r => r.startsWith('/assignment-generator'),
  recent: limit => asgRecentHTML(limit),
  books: asgBooks, pickBook: asgPickBook, form: () => asgFormView(), bind: () => asgBindForm(),
  routes: [
    ['/assignment-generator', () => bpEnter('assignment-generator')],                                            // BOOK PICKER -> INPUT modal
    ['/assignment-generator/generating', () => asgGeneratingView()],                                             // INPUT -> OUTPUT
    ['/assignment-generator/output', () => { if (!asgDoc) { navigate('#/assignment-generator'); return 'redirect'; } $('#view').innerHTML = asgOutputView(); asgBindOutput(); }], // OUTPUT
    ['/assignment-generator/mine', () => { $('#view').innerHTML = asgMineView(); asgBindMine(); }],              // My assignments
    ['/assignment-generator/sample', () => { asgForm = asgSample(); asgDoc = asgNewDoc(asgBuild(asgForm), asgForm); asgView = 'teacher'; navigate('#/assignment-generator/output'); return 'redirect'; }],
    [/^\/assignment-generator\/open\/(.+)$/, m => { const rec = asgStore.get(m[1]); if (rec) { asgDoc = { ...rec, dirty: false }; asgForm = { ...rec.form }; asgView = 'teacher'; navigate('#/assignment-generator/output'); } else navigate('#/assignment-generator'); return 'redirect'; }],
    [/^\/assignment-generator\/s\/(.+)$/, m => { $('#view').innerHTML = asgSharedView(m[1]); asgPaginate($('#asgOut')); }],   // student link (published version only)
  ],
});
