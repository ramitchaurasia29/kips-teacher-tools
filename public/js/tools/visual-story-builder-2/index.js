/* Visual Story Builder 2.0 - registration + routes. No book picker / input form: the tool opens straight on the story. */
registerTool({
  id: 'visual-story-builder-2', name: 'Visual story builder 2.0', cat: 'Plan', icon: 'sparkle', cost: 5, isNew: true, ready: true,
  desc: 'Open a comic-style visual story directly: scene pictures with Nemo and Tiko dialogue, with editable content.',
  base: '/visual-story-builder-2',
  matches: r => r.startsWith('/visual-story-builder-2'),
  routes: [
    [/^\/visual-story-builder-2(\/output)?$/, () => { $('#view').innerHTML = vsb2OutputView(); vsb2BindOutput(); }],
  ],
});
