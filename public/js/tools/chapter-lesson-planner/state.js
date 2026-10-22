/* Chapter lesson planner - state */
let clpForm = clpDefaults();   // INPUT - shared settings + chapter cards (kept if generation fails)
let clpMaps = [];              // pass 1: one editable period map per chapter (§9)
let clpPlans = [];             // pass 2: one canonical chapter plan JSON per approved chapter (§11)
let clpMapTab = 0;             // chapter shown on the map review screen
let clpTab = 0;                // chapter shown in the preview (clpPlans.length = the term index)
