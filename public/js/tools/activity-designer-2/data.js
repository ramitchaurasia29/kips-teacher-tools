/* Activity Designer 2.0 - DATA: the activity shown on open (no input form; the output is provided).
   Structure is fixed; only the text values below are editable in Edit mode. */
let ad2Doc = ad2Sample();

function ad2Sample() {
  return {
    type: 'Homework Activity',
    duration: 'One Class',
    title: 'Number Detectives: Place Value, Face Value, and Expanded Form',
    objective: 'Students will be able to identify the place value and face value of digits in 3-digit and 4-digit numbers and write these numbers in their expanded form.',
    instructions: [
      { lead: 'Introduction (Teacher-led, 10 minutes):', text: 'The teacher will begin by briefly revisiting the \'Warm Up\' poem, highlighting the numbers mentioned (10, 25, 48, 60, 90). Explain that these numbers were used for counting, which are called cardinal numbers. Introduce the concepts of place value, face value, and expanded form using simple 2-digit and 3-digit examples on the whiteboard. Clearly define place value as the value of a digit based on its position, and face value as the digit\'s inherent value. Demonstrate how to write numbers in expanded form by adding the place values of each digit. For instance, for 3736, the expanded form is 3000 + 700 + 30 + 6. Discuss the importance of these concepts for understanding larger numbers, especially 4-digit numbers.', subs: [] },
      { lead: 'Pair Formation (5 minutes):', text: 'Students will be divided into pairs.', subs: [] },
      { lead: 'Homework Assignment - Part 1: Number Analysis (Individual/Pair preparation at home):', text: 'Each pair will receive a worksheet containing a list of 3-digit and 4-digit numbers (e.g., 345, 1289, 507, 4321). For each number, the pairs must:', subs: ['Identify the place value of each digit.', 'Identify the face value of each digit.', 'Write the number in its expanded form.'] },
      { lead: 'Homework Assignment - Part 2: Creative Number Story (Pair preparation at home):', text: 'Each pair will create a short story, similar to the \'Warm Up\' poem, that includes at least two different 4-digit numbers. For each of these 4-digit numbers from their story, they must also:', subs: ['Identify the place value of each digit.', 'Identify the face value of each digit.', 'Write the number in its expanded form.'] },
      { lead: 'In-Class Review and Discussion (One Class - 40 minutes):', text: 'On the designated day, pairs will exchange their completed worksheets and stories with another pair for peer review. The teacher will then facilitate a class discussion. Selected pairs will share their stories and present their analysis of the numbers on the whiteboard, explaining their reasoning for place value, face value, and expanded form. The teacher will use the whiteboard to illustrate correct examples and clarify any misconceptions.', subs: [] },
    ],
    materials: ['Whiteboard', 'Paper', 'Pencils/Pens', 'Worksheet with practice numbers (e.g., 345, 1289, 507, 4321)'],
    criteria: [
      { name: 'Accuracy in identifying place value for numbers on the worksheet.', pts: '5' },
      { name: 'Accuracy in identifying face value for numbers on the worksheet.', pts: '5' },
      { name: 'Accuracy in writing expanded form for numbers on the worksheet.', pts: '5' },
      { name: 'Creativity of the story and correct inclusion/analysis of two 4-digit numbers.', pts: '5' },
      { name: 'Clarity and organization of the submitted work.', pts: '5' },
    ],
    expected: ['A completed worksheet for number analysis.', 'A short story incorporating at least two 4-digit numbers.', 'A written analysis (place value, face value, expanded form) for the numbers in their story.'],
    keepInMind: 'The teacher will observe student participation during the in-class discussion and peer review. For the homework component, the teacher will collect and review the completed worksheets and stories, marking them based on the assessment criteria. Specific attention will be given to common errors in identifying place/face values or writing expanded forms.',
  };
}

/* path helpers for the editable values ("instructions.0.subs.1") */
function ad2Get(o, p) { return p.split('.').reduce((a, k) => (a == null ? a : a[k]), o); }
function ad2Set(o, p, v) { const ks = p.split('.'), last = ks.pop(); ks.reduce((a, k) => a[k], o)[last] = v; }
