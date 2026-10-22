/* Daily lesson planner - registration + routes */
registerTool({
  id: 'daily-lesson-planner', name: 'Daily lesson planner', cat: 'Plan', icon: 'open', cost: 5, isNew: true, ready: true,
  desc: 'Create a one-day lesson plan with timed stages, activities, assessment and a Word and PDF download.',
  base: '/daily-lesson-planner',
  matches: r => r.startsWith('/daily-lesson-planner'),
  books: dlpBooks, pickBook: dlpPickBook, form: () => dlpFormView(), bind: () => dlpBindForm(),
  routes: [
    ['/daily-lesson-planner', () => bpEnter('daily-lesson-planner')],                                              // BOOK PICKER -> INPUT modal
    ['/daily-lesson-planner/generating', () => dlpGeneratingView()],                                               // INPUT -> OUTPUT
    ['/daily-lesson-planner/output', () => { if (!dlpPlan) { navigate('#/daily-lesson-planner'); return 'redirect'; } $('#view').innerHTML = dlpOutputView(); dlpBindOutput(); }], // OUTPUT
    ['/daily-lesson-planner/sample', () => { dlpForm = dlpSample(); dlpPlan = dlpBuild(dlpForm); navigate('#/daily-lesson-planner/output'); return 'redirect'; }],
  ],
});
