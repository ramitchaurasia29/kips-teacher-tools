/* Worksheet generator 2.0 - state. Own input form (never shared with the Assessment generator) and the current worksheet. */
const wsDefaults = () => ({ grade: 2, subject: 'Maths', chapterId: 'C1', topics: [], dueDate: '', formats: [], difficulty: '', rubric: false, fileName: '', blooms: [] });
let wsForm = wsDefaults();   // INPUT - kept if generation fails
let wsDoc = null;            // OUTPUT - the worksheet JSON shown on the output screen; edits are written straight into it on Save
let wsView = 'student';      // 'student' | 'teacher'
