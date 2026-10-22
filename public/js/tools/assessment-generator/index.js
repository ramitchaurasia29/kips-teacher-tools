/* Assessment generator - registration + routes */
registerTool({
  id: 'assessment-generator', name: 'Assessment generator', cat: 'Assess', icon: 'award', cost: 5, isNew: true, ready: true,
  desc: 'Build a balanced question paper with a solved teacher copy, ready to print in Word or PDF.',
  pickerDesc: 'Build a print-ready question paper and separate answer key for Grades 3–8 from your textbook chapters.',
  base: '/assessment-generator',
  matches: r => r.startsWith('/assessment-generator'),
  books: agBooks, pickBook: agPickBook, form: agFormView, bind: agBindForm,
  routes: [
    ['/assessment-generator', () => bpEnter('assessment-generator')],                                          // BOOK PICKER -> INPUT modal
    ['/assessment-generator/generating', () => agGeneratingView()],                                           // INPUT -> OUTPUT
    ['/assessment-generator/output', () => { if (!agPaper) { navigate('#/assessment-generator'); return 'redirect'; } $('#view').innerHTML = agOutputView(); agBindOutput(); }], // OUTPUT
    ['/assessment-generator/sample', () => { agForm = agSample(); agPaper = buildPaper(agForm); agView = 'student'; navigate('#/assessment-generator/output'); return 'redirect'; }],
  ],
});
