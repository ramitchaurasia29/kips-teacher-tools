/* Assignment generator - state: INPUT values, current OUTPUT assignment, My assignments */
const asgStore = createStore('kips.assignments.v2');

const asgDefaults = () => ({
  bookId: '', chapterId: '', topicId: '', subtopic: '', contentChoice: '', fileName: '',
  type: 'practice_worksheet', dueDate: '', objective: '', difficulty: 'Medium', time: asgType('practice_worksheet').time, timeCustom: false,
  formats: [], blooms: [], taskCount: 'ai', marksMode: 'custom', marks: asgType('practice_worksheet').marks, rubric: asgType('practice_worksheet').rubric, studentMarks: true, extra: '',
});
let asgForm = asgDefaults();   // INPUT - kept if generation fails or the teacher changes settings
let asgDoc = null;             // OUTPUT - { id, data, form, edits, version, published, savedAt, dirty }
let asgView = 'teacher';       // Teacher View / Student View
let asgPlain = false;          // true while rendering the flat (Word) copy

const asgNewDoc = (data, form) => ({ id: data.id, data, form: { ...form, formats: [...form.formats], blooms: [...(form.blooms || [])] }, edits: {}, version: 1, published: null, savedAt: null, dirty: false });
function asgSaveDoc() {
  asgDoc.savedAt = new Date().toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); asgDoc.dirty = false;
  asgStore.put(JSON.parse(JSON.stringify(asgDoc)));
}
function asgDuplicate(id) {
  const rec = asgStore.get(id); if (!rec) return null;
  const copy = JSON.parse(JSON.stringify(rec)), nid = 'a' + Date.now().toString(36) + Math.floor(Math.random() * 1e3);
  Object.assign(copy, { id: nid, version: 1, published: null, savedAt: null }); copy.data.id = nid; copy.data.metadata.topic += ' (copy)';
  asgStore.put(copy); return nid;
}

/* PRD reference: Class 6 Science, Living and Non-Living Things, Practice worksheet, Medium, 30 min, 20 marks */
function asgSample() {
  return { ...asgDefaults(), bookId: 'b6s', topicId: 't_live', dueDate: asgDate(asgToday(), 7), objective: 'Explain the differences between living and non-living things.', rubric: true, extra: 'Include examples from everyday life.' };
}
