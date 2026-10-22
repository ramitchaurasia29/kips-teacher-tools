/* Daily lesson planner - state */
const dlpDefaults = () => ({
  bookId: '', grade: '', topics: [], style: 'AI Recommended', pedagogy: 'AI Recommended', duration: '', blooms: [],
  engage: '', homework: '', objectives: '', details: '', fileName: '',
});
let dlpForm = dlpDefaults();   // INPUT – kept if generation fails
let dlpPlan = null;            // OUTPUT – the canonical lesson JSON (§8)
let dlpAsk = false;            // show the one-line clarification (§2)

/* PRD reference: Grade 3 Science, Living and Non-living Things, Example First + Inquiry-Based, 45 minutes */
function dlpSample() {
  const t = dlpTopics(3).find(x => x.title === 'Living and Non-living Things');
  return { ...dlpDefaults(), grade: '3', topics: [t.key], style: 'Example First Approach', pedagogy: 'Inquiry-Based Learning', duration: 45, blooms: ['Understanding', 'Applying'], engage: 'Picture/card sort', homework: 'Optional observation task' };
}
