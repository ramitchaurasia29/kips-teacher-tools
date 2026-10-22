/* Activity Designer - registration + routes */
registerTool({
  id: 'activity-designer', name: 'Activity designer', cat: 'Plan', icon: 'flask', cost: 5, isNew: true, ready: true,
  desc: 'Turn a textbook topic into a classroom-ready activity with a Teacher Guide and a Student Worksheet.',
  base: '/activity-designer',
  matches: r => r.startsWith('/activity-designer') || r.startsWith('/s/'),
  recent: limit => draftsHTML(limit),
  books: adBooks, pickBook: adPickBook, form: () => formView(), bind: () => bindForm(),
  routes: [
    ['/activity-designer', () => bpEnter('activity-designer')],                                            // BOOK PICKER -> INPUT modal
    ['/activity-designer/generating', () => generatingView()],                                             // INPUT -> OUTPUT
    ['/activity-designer/output', () => { if (!cur) return navigate('#/activity-designer'), 'redirect'; $('#view').innerHTML = outputView(); bindOutput(); }], // OUTPUT
    ['/activity-designer/sample', () => { form = SAMPLE(); startSession(buildActivity(form)); navigate('#/activity-designer/output'); return 'redirect'; }],
    [/^\/activity-designer\/open\/(.+)$/, m => {
      const rec = store.get(m[1]);
      if (rec) { cur = { ...rec, mode: 'teacher', editing: false, dirty: false }; form = rec.form || form; navigate('#/activity-designer/output'); } else navigate('#/activity-designer');
      return 'redirect';
    }],
    [/^\/s\/(.+)$/, m => { $('#view').innerHTML = sharedView(m[1]); }],                                    // student share link
  ],
});
