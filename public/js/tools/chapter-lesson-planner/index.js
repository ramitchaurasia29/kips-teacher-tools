/* Chapter lesson planner - registration + routes (setup -> period map -> generating -> preview) */
registerTool({
  id: 'chapter-lesson-planner', name: 'Chapter lesson planner', cat: 'Plan', icon: 'book', cost: 10, isNew: true, ready: true,
  desc: 'Plan a whole chapter as connected periods: review the period map, then get classroom-ready period plans with a Word and PDF download.',
  base: '/chapter-lesson-planner',
  matches: r => r.startsWith('/chapter-lesson-planner'),
  books: clpBooks, pickBook: clpPickBook, form: () => clpFormView(), bind: () => clpBindForm(),
  routes: [
    ['/chapter-lesson-planner', () => bpEnter('chapter-lesson-planner')],                                                                     // INPUT
    ['/chapter-lesson-planner/map', () => { if (!clpMaps.length) { navigate('#/chapter-lesson-planner'); return 'redirect'; } $('#view').innerHTML = clpMapView(); clpBindMap(); }], // INPUT: period map review
    ['/chapter-lesson-planner/generating', () => { if (!clpMaps.some(x => x.approved)) { navigate('#/chapter-lesson-planner/map'); return 'redirect'; } clpGeneratingView(); }],  // INPUT -> OUTPUT
    ['/chapter-lesson-planner/output', () => { if (!clpPlans.length) { navigate('#/chapter-lesson-planner'); return 'redirect'; } $('#view').innerHTML = clpOutputView(); clpBindOutput(); }], // OUTPUT
    ['/chapter-lesson-planner/sample',() => { clpForm = clpSample(); clpMaps = clpForm.chapters.map(c => clpBuildMap(clpForm, c)); clpMaps.forEach(m => m.approved = true); clpPlans = clpMaps.map(m => clpBuildPlan(clpForm, m)); clpTab = 0; navigate('#/chapter-lesson-planner/output'); return 'redirect'; }],
  ],
});
