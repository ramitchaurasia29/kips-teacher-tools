/* Quiz Builder 2.0 - state. Own input form and the current quiz document. */
const qb2Defaults = () => ({
  bookId: '', chapterId: '', topics: [], count: 20, diagramPct: 30,
  types: ['mcq', 'tf', 'fill', 'ar', 'case', 'long', 'ordering', 'match', 'error'],
  difficulty: 'Intermediate', blooms: ['Understand'], school: '',
});
let qb2Form = qb2Defaults();   // INPUT - kept if generation fails
let qb2Doc = null;             // OUTPUT - the quiz shown on the output screen; edits are written straight into it on Save
let qb2View = 'student';       // 'student' | 'teacher'
