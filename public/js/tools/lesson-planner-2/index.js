/* Lesson Planner 2.0 - registration + routes. No book picker / input form: the tool opens straight on the lesson plan. */
registerTool({
  id: 'lesson-planner-2', name: 'Lesson planner 2.0', cat: 'Plan', icon: 'book', cost: 5, isNew: true, ready: true,
  desc: 'Open a complete lesson plan directly: stages, teaching notes, questions, activities and assessment, with editable content.',
  base: '/lesson-planner-2',
  matches: r => r.startsWith('/lesson-planner-2'),
  routes: [
    [/^\/lesson-planner-2(\/output)?$/, () => { lp2Tab = 0; lp2Q = 0; $('#view').innerHTML = lp2OutputView(); lp2BindOutput(); }],
  ],
});
