/* Homework generator - state. Own input form (never shared with the Assessment generator) and the current homework. */
const hwDefaults = () => ({ grade: 2, subject: 'Maths', chapters: [], topics: [], uploadedChapters: [], blooms: [], difficulty: 'Mixed', count: 20, types: [] });
let hwForm = hwDefaults();   // INPUT - kept if generation fails
let hwDoc = null;            // OUTPUT - the homework JSON shown on the output screen; edits are written straight into it on Save
let hwView = 'student';      // 'student' | 'teacher'
