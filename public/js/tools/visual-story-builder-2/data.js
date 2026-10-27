/* Visual Story Builder 2.0 - DATA: the story shown on open (no input form; the output is provided).
   Structure is fixed (scenes, characters, number of lines); only dialogue text and scene images are editable. */
let vsb2Doc = vsb2Sample();

function vsb2Sample() {
  const N = 'Nemo', T = 'Tiko';
  return {
    subject: 'General Science', grade: 3,
    characters: [{ name: N, img: 'img/visual-story-builder-2/nemo.png' }, { name: T, img: 'img/visual-story-builder-2/tiko.png' }],
    scenes: [
      { img: 'img/visual-story-builder-2/scene-1.png', intro: true, lines: [
        { who: N, text: 'Hi, I am Nemo!' }, { who: T, text: 'I am Tiko!' }, { who: N, text: 'Look at these plants.' },
        { who: T, text: 'They are living things.' }, { who: N, text: 'Plants give us food.' },
        { who: T, text: 'They keep air fresh.' }, { who: N, text: 'Each part has a job.' } ] },
      { img: 'img/visual-story-builder-2/scene-2.png', lines: [
        { who: N, text: 'See the plant parts.' }, { who: T, text: 'Roots grow below ground.' }, { who: N, text: 'Roots hold plants tight.' },
        { who: T, text: 'They drink water for plants.' }, { who: N, text: 'The shoot grows above ground.' } ] },
      { img: 'img/visual-story-builder-2/scene-1.png', lines: [
        { who: T, text: 'What do plants need?' }, { who: N, text: 'Plants need sunlight.' }, { who: T, text: 'They also need water.' },
        { who: N, text: 'Air helps them too.' }, { who: T, text: 'Then they grow strong.' } ] },
      { img: 'img/visual-story-builder-2/scene-2.png', lines: [
        { who: N, text: 'Plants start as seeds.' }, { who: T, text: 'A seed grows into a seedling.' }, { who: N, text: 'The seedling becomes a plant.' },
        { who: T, text: 'Let us take care of plants!' }, { who: N, text: 'Yes, they help us all.' } ] },
    ],
  };
}

/* path helpers for the editable values ("scenes.0.lines.1.text") */
function vsb2Get(o, p) { return p.split('.').reduce((a, k) => (a == null ? a : a[k]), o); }
function vsb2Set(o, p, v) { const ks = p.split('.'), last = ks.pop(); ks.reduce((a, k) => a[k], o)[last] = v; }
