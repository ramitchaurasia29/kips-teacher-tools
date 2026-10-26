/* Practice test - state. Own input form (never shared with the Assessment generator) and the current practice test. */
const ptDefaults = () => ({ grade: 2, subject: 'Maths', chapters: [], topics: [], uploadedChapters: [] });
let ptForm = ptDefaults();   // INPUT - kept if generation fails
let ptDoc = null;            // OUTPUT - the practice test JSON shown on the output screen; edits are written straight into it on Save
let ptView = 'student';      // 'student' | 'teacher'
