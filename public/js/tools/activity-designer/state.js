/* Activity Designer - state + persistence (shared by input.js and output.js) */
const store = createStore('kips.activities');

const defaults = () => ({ book: '', topic: '', type: '', duration: 30, grouping: '', groupSize: '4–5 students', materials: [], level: '', blooms: [], objective: '', extra: '', fileName: '', unverified: false });
let form = defaults(); // INPUT values – kept if generation fails
let cur = null;        // current OUTPUT session: data, edits, mode, published version…

const SAMPLE = () => ({ ...defaults(), book: 'Class 6 Science – NCERT', topic: 'Filtration', type: 'Hands-on experiment', duration: 15, grouping: 'Groups', groupSize: '4–5 students', materials: ['Low-cost household items'], level: 'Grade-level', objective: 'Understand how filtration separates insoluble solids from liquids' });

function startSession(data) { cur = { id: data.id, data, edits: {}, mode: 'teacher', editing: false, dirty: false, savedAt: null, published: null, form: { ...form } }; }
