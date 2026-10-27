/* Activity Designer 2.0 - registration + routes. No book picker / input form: the tool opens straight on the output. */
registerTool({
  id: 'activity-designer-2', name: 'Activity designer 2.0', cat: 'Plan', icon: 'flask', cost: 5, isNew: true, ready: true,
  desc: 'Open a classroom-ready activity directly: objective, instructions, materials, expected output and assessment criteria, with editable content.',
  base: '/activity-designer-2',
  matches: r => r.startsWith('/activity-designer-2'),
  routes: [
    [/^\/activity-designer-2(\/output)?$/, () => { $('#view').innerHTML = ad2OutputView(); ad2BindOutput(); }],
  ],
});
