/* Lesson Planner 2.0 - DATA: the lesson plan shown on open (no input form; the output is provided).
   Structure is fixed (stages, concepts, question groups, activities); only the text values are editable.
   Text values are stored as sanitized HTML so formatting from the edit toolbar survives Save. */
let lp2Doc = lp2Sample();

const lp2Get = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
function lp2Set(o, p, v) {
  const ks = p.split('.'), last = ks.pop();
  ks.reduce((a, k) => a[k], o)[last] = v;
}

function lp2Sample() {
  return {
    subject: 'General Science', grade: 3, topics: 4,
    title: 'Exploring Our Green Friends: Parts of a Plant and Their Jobs',
    chapter: 'Plants – Our Green Friends', minutes: 60,
    objectives: [
      'Students will be able to identify the main parts of a plant (roots, stem, leaves, flowers, fruits).',
      'Students will be able to describe the basic function of each main plant part.',
      'Students will be able to label the parts of a plant on a diagram.',
    ],
    stages: [
      { start: 0, end: 5, title: 'Warm-up: What do you see?',
        purpose: 'Engage students and activate prior knowledge about plants, setting the stage for deeper inquiry.',
        teacher: "Begin by asking students what they notice about the plants outside the classroom or in their gardens. 'What do you see when you look at a plant?' Encourage them to think beyond just 'green'.",
        resources: [] },
      { start: 5, end: 15, title: 'Inquiry Launch: Unpacking a Plant',
        purpose: 'Introduce the concept that plants have distinct parts and prompt students to wonder about their individual roles, fostering an inquiry-based mindset.',
        teacher: "Present a small, potted plant (or a plant specimen carefully uprooted with roots intact). 'Look closely at this plant. What different parts can you identify? Do you think all these parts do the same thing?' Guide students to point out different sections.",
        resources: ['A small, real potted plant or a carefully uprooted plant specimen'] },
      { start: 15, end: 30, title: "Exploring Roots and Stem: The Plant's Foundation",
        purpose: 'Help students understand the structure and fundamental functions of roots and stem through direct observation and Socratic questioning.',
        teacher: "Focus on the roots. 'What part of the plant is usually hidden underground? Why do you think it's hidden?' Gently rinse the roots of the specimen to show them clearly. 'What do these roots look like? What do you think their job is?' Guide discussion towards anchoring and absorbing water. Then move to the stem. 'What is this main part holding the plant up? What do you think its job is?' Guide towards support and transport. Use simple analogies like a 'straw' for the stem.",
        resources: ['Real plant specimen with roots visible', 'Diagram of plant parts (optional, for visual aid)'] },
      { start: 30, end: 45, title: 'Exploring Leaves, Flowers and Fruits: Food, Seeds and Beyond',
        purpose: 'Guide students to discover how leaves make food and how flowers and fruits help the plant make and protect new seeds.',
        teacher: "Hold up a leaf. 'What are these green parts? What do you think is special about their colour?' Guide students towards the idea that leaves make food using sunlight. Then show a flower and a fruit. 'What about these colourful parts? Why do plants have them?' Guide towards making seeds. 'What do we often find inside them?' Lead students towards protecting seeds. Show examples if available.",
        resources: ['Real plant specimen', 'Pictures/examples of leaves, flowers, and fruits (e.g., an apple, a flower)'] },
      { start: 45, end: 55, title: 'Consolidation &amp; Application: Plant Part Puzzle',
        purpose: 'Reinforce learning by having students apply their knowledge to a labeling task and consider the interdependence of plant parts.',
        teacher: "Distribute a simple worksheet with a blank plant diagram. 'Now that we've talked about all the parts, can you label them and write one word about their job?' Circulate to provide support and ask probing questions. 'What would happen if a plant had no roots? Or no leaves?'",
        resources: ['Worksheet: Blank plant diagram for labeling'] },
      { start: 55, end: 60, title: 'Lesson Closure: Our Green Friends Recap',
        purpose: 'Summarize key learning points, check for overall understanding, and connect back to the lesson objectives.',
        teacher: "Bring the class together. 'What new thing did you learn about plants today? Can you tell me one part of a plant and its special job?' Briefly recap the main parts and their functions. Introduce homework.",
        resources: [] },
    ],
    concepts: [
      { name: 'Roots',
        desc: 'Roots are the parts of the plant that usually grow under the ground. They are like anchors and also like tiny straws.',
        points: ['Hold the plant firmly in the soil.', 'Absorb water and nutrients from the soil.'],
        example: 'Think of a tree during a strong wind – its roots hold it down.',
        analogy: 'Roots are like the feet of the plant, holding it steady, and also like tiny drinking straws soaking up water from the ground.',
        ask: ['Where do roots usually grow?', "What would happen if a plant didn't have roots?", 'How do you think plants get water from the soil?'] },
      { name: 'Stem',
        desc: 'The stem is the main body of the plant that grows above the ground. It holds up the leaves, flowers, and fruits.',
        points: ['Supports the plant, helping it stand tall.', 'Carries water and nutrients from the roots to the leaves.'],
        example: 'Think of a tall sunflower standing straight – its stem holds the flower up to the sun.',
        analogy: 'The stem is like a pole and a straw in one: it holds the plant up and carries water to the leaves.',
        ask: ['What does the stem do for the plant?', 'What would happen if the stem was weak?', 'How does water from the roots reach the leaves?'] },
      { name: 'Leaves',
        desc: 'Leaves are usually green and flat parts of the plant. They are very important because they make food for the plant.',
        points: ['Make food for the plant using sunlight, air, and water (photosynthesis).', 'Often green due to chlorophyll.'],
        example: "Think of a chef in a kitchen – leaves are like the plant's kitchen!",
        analogy: 'Leaves are like tiny solar panels and kitchens for the plant, soaking up sun and making food.',
        ask: ['What colour are most leaves? Why do you think that is?', 'What do you think leaves need to make food?', 'If leaves make food, what would happen if a plant lost all its leaves?'] },
      { name: 'Flowers',
        desc: 'Flowers are often colourful and fragrant parts of the plant. Their main job is to help the plant make new seeds.',
        points: ['Help the plant to reproduce (make new plants).', 'Develop into fruits that contain seeds.'],
        example: 'Think of a tiny baby plant starting from a seed – the flower helps make that seed.',
        analogy: "Flowers are like the plant's 'baby factory' where new seeds are made.",
        ask: ['What colours of flowers have you seen?', 'Why do you think flowers are colourful and smell nice?', 'What do flowers turn into after a while?'] },
      { name: 'Fruits',
        desc: 'Fruits are the parts of the plant that grow from flowers and hold the seeds inside.',
        points: ['Protect the seeds while they grow.', 'Help the seeds to spread to new places.'],
        example: 'Think of an apple – the seeds are safely inside the fruit.',
        analogy: 'A fruit is like a safe box that keeps the seeds protected until they are ready to grow.',
        ask: ['What do we often find inside fruits?', 'Which fruits do you eat at home?', 'What would happen to the seeds if there was no fruit?'] },
    ],
    questions: [
      { group: 'Warm-up', items: ['What do you see when you look at a plant?', 'Are all parts of a plant the same?', 'What do plants need to grow?'] },
      { group: 'During the lesson', items: [
        'What part of the plant is usually hidden underground?', 'Why do you think roots are important?',
        'What is this main part holding the plant up? What do you think its job is?',
        'What are these green parts? What do you think is special about their colour?',
        'What important job do leaves do for the plant?', 'What about these colourful parts? Why do plants have them?',
        'What do these yummy parts do for the plant? What do we often find inside them?'] },
      { group: 'Concept check', items: [
        'Can you name one part of the plant and tell me its job?', "What would happen if a plant didn't have roots?",
        'If leaves make food, what would happen if a plant lost all its leaves?', 'Why is it important for a plant to have flowers?'] },
      { group: 'Closure', items: ['What new thing did you learn about plants today?', 'Can someone tell me one part of a plant and its special job?'] },
    ],
    activities: [
      { title: 'Observation and Discussion', type: 'Observation activity', mins: 10,
        desc: 'Observe the real plant specimen carefully. Discuss with your partner what different parts you can see and what you think they might do.',
        serves: 'Students will be able to identify the main parts of a plant (roots, stem, leaves, flowers, fruits).' },
      { title: 'Guided Inquiry on Plant Parts', type: 'Discussion', mins: 30,
        desc: "Participate in the class discussion, answering the teacher's questions about roots, stem, leaves, flowers, and fruits. Share your ideas about what each part does.",
        serves: 'Students will be able to describe the basic function of each main plant part.' },
      { title: 'Label the Plant Worksheet', type: 'Worksheet', mins: 10,
        desc: 'On the provided worksheet, label the main parts of the plant diagram. Next to each label, write one word or a very short sentence describing its job.',
        serves: 'Students will be able to label the parts of a plant on a diagram.' },
    ],
    assess: {
      checks: [
        'Can students name the main parts of a plant (roots, stem, leaves, flowers, fruits)?',
        'Can students say one job for each plant part?',
        'Can students label the parts correctly on the plant diagram?',
      ],
      homework: 'Draw a plant at home and label its roots, stem, leaves, flowers, and fruits. Write one sentence about the job of each part.',
      support: 'Give students a diagram with the labels already written and ask them to match each label to the correct part.',
      extension: 'Ask students to explain what would happen to a plant if one of its parts was missing, and why.',
      summary: 'Plants have roots, stem, leaves, flowers, and fruits, and each part has its own special job.',
      recap: 'Revisit the three lesson objectives with the class and ask students to show a thumbs up if they can do each one.',
    },
  };
}
