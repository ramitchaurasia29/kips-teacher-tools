/* Case Study Builder 2.0 - state. Own input form and the current case study document. */
const cs2Defaults = () => ({
  bookId: '', topics: [], objective: '', count: 5,
  difficulty: 'Medium', blooms: [], type: 'ai', length: 'Medium', lang: 'English', extra: '',
});
let cs2Form = cs2Defaults();   // INPUT - kept if generation fails
let cs2Doc = null;             // OUTPUT - the case study shown on the output screen; edits are written straight into it on Save
let cs2View = 'student';       // 'student' | 'teacher'
let cs2MoreOpen = true;        // "Advanced options" stays open across redraws
