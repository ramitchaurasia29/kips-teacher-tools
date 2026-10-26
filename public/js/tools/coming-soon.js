/* Placeholder tools shown on the hub. Replace an entry with a real tools/<tool>/ folder when built. */
[
  { id: 'rubric-builder', name: 'Rubric Builder', cat: 'Assess', icon: 'award', cost: 3, desc: 'Build clear assessment rubrics for any task.' },
].forEach(t => registerTool({ ...t, ready: false, routes: [] }));
