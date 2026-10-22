/* Assessment generator - state (INPUT values + OUTPUT paper) */
const agSchool = { get() { try { return localStorage.getItem('kips.assessment.school') || ''; } catch { return ''; } }, set(v) { try { localStorage.setItem('kips.assessment.school', v); } catch { } } };

const agDefaults = () => ({
  school: agSchool.get(), grade: 2, subject: 'Maths', assessment: 'FA 1', otherName: '', time: agAssessment('FA 1').time,
  chapters: [], topics: [], uploadedChapters: [],
  rows: agRowsFor('FA 1'), difficulty: 'Mixed', blooms: [], diagramPercent: 0,
});
let agForm = agDefaults();   // INPUT – kept when generation fails or the teacher changes settings
let agPaper = null;          // OUTPUT – the canonical paper JSON (§11)
let agView = 'student';      // the paper opens in Student view (§4.1 step 6)

/* PRD reference paper: Grade 2 Maths FA 1 */
function agSample() {
  const f = agDefaults(), ch = agChapters(2, 'Maths');
  return { ...f, school: '', chapters: ch.map(c => c.id), topics: ch.flatMap(c => c.topics.map(t => t.id)), diagramPercent: 15 };
}
