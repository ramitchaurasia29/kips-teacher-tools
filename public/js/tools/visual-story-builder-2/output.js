/* Visual Story Builder 2.0 - OUTPUT: opens straight on the story (no input, no Student/Teacher view).
   Edit changes the CONTENT only (dialogue text + scene images); scenes, speakers, character names and layout stay fixed. */

const VSB2_PER_PAGE = 5;   // speech bubbles per right-hand page
let vsb2Page = 0;          // current page (kept across Edit/Save re-renders)

const vsb2Ed = (p, v) => `<span class="ed" data-p="${p}">${esc(v)}</span>`;
const vsb2Pad = n => String(n).padStart(2, '0');
const vsb2FileName = () => 'Visual_Story_' + vsb2Doc.subject.replace(/[^\w]+/g, '');
const vsb2Title = () => `${vsb2Doc.subject} (Grade ${vsb2Doc.grade}) · ${vsb2Doc.scenes.length} topics`;

/* flat list of book spreads: a scene with more than 5 lines continues on a second spread */
function vsb2Pages() {
  const pages = [];
  vsb2Doc.scenes.forEach((s, si) => {
    const parts = Math.max(1, Math.ceil(s.lines.length / VSB2_PER_PAGE));
    for (let k = 0; k < parts; k++) pages.push({ si, part: k, from: k * VSB2_PER_PAGE, lines: s.lines.slice(k * VSB2_PER_PAGE, (k + 1) * VSB2_PER_PAGE) });
  });
  return pages;
}

const vsb2Char = n => vsb2Doc.characters.find(c => c.name === n);

/* one book spread. ex = export copy (Word / print): same markup without edit hooks */
function vsb2SpreadHTML(pg, ex) {
  const s = vsb2Doc.scenes[pg.si];
  const ed = (p, v) => ex ? esc(v) : vsb2Ed(p, v);
  const pick = ex ? '' : `<button type="button" class="dg-edit no-print" data-pick="scenes.${pg.si}.img" aria-label="Edit image">${ic('edit', 's')}</button><input type="file" accept="image/*" data-newimg="scenes.${pg.si}.img" hidden>`;
  const strip = s.intro ? `<div class="vsb2-cast">${vsb2Doc.characters.map(c => `<span class="vsb2-who"><img src="${c.img}" alt=""><b>${esc(c.name)}</b></span>`).join('')}</div>` : '';
  const bubbles = pg.lines.map((l, i) => `<div class="vsb2-bub ${vsb2Doc.characters[0].name === l.who ? 'a' : 'b'}"><span class="vsb2-sp">${esc(l.who)}</span><p>${ed(`scenes.${pg.si}.lines.${pg.from + i}.text`, l.text)}</p></div>`).join('');
  return `<div class="vsb2-book"><div class="vsb2-spine"></div>
    <section class="vsb2-pl"><div class="vsb2-hd"><span class="vsb2-red">KIPS COMICS</span><span>SCENE ${vsb2Pad(pg.si + 1)}</span></div>
      <div class="vsb2-art${s.intro ? ' has-cast' : ''}" data-art="scenes.${pg.si}.img"><img src="${s.img}" alt="Scene ${pg.si + 1}">${pick}${strip}</div></section>
    <section class="vsb2-pr"><div class="vsb2-hd"><span class="vsb2-red">THE STORY${pg.part ? ' · CONTINUED' : ''}</span></div><div class="vsb2-bubs">${bubbles}</div></section></div>`;
}

const vsb2PageLabel = pg => `Scene ${pg.si + 1} / ${vsb2Doc.scenes.length}${pg.part ? ` · continued ${pg.part + 1}` : ''}`;

function vsb2OutputView() {
  const pages = vsb2Pages(); vsb2Page = Math.min(vsb2Page, pages.length - 1); const pg = pages[vsb2Page];
  return `<div class="toolbar"><div class="toolbar-in">
    <button class="icon-btn round" id="vsb2Back" aria-label="Back to tools">${ic('back')}</button>
    <div class="tb-title"><small>Visual Story Builder 2.0</small><b>${esc(vsb2Title())}</b></div>
    <div class="acts"><button class="btn" id="vsb2Edit" type="button">${ic('edit', 's')}<span class="lb">Edit</span></button>${printBtn('vsb2Print')}<button class="btn" id="vsb2Share" type="button">${ic('share', 's')}<span class="lb">Share</span></button><button class="btn primary" id="vsb2Dl" type="button" aria-haspopup="dialog">${ic('download', 's')}<span class="lb">Download</span></button></div></div></div>
  <div class="vsb2-out" id="vsb2Out"><p class="vsb2-hint">Turn the pages. Follow the story.</p>
    <div class="vsb2-stage"><span class="vsb2-side">KIPS · VISUAL STORIES</span><div id="vsb2Spread">${vsb2SpreadHTML(pg)}</div></div>
    <div class="vsb2-nav"><button type="button" id="vsb2Prev" ${vsb2Page === 0 ? 'disabled' : ''}><span class="vsb2-l">${ic('chevr', 'xs')}</span>Previous</button><span class="vsb2-lb">${vsb2PageLabel(pg)}</span><button type="button" id="vsb2Next" ${vsb2Page >= pages.length - 1 ? 'disabled' : ''}>Next${ic('chevr', 'xs')}</button></div></div>
  <div class="vsb2-all" id="vsb2All" aria-hidden="true"></div>`;
}

function vsb2BindOutput() {
  const view = $('#view'); view.classList.add('bg-white', 'view-vsb2'); view.classList.remove('is-editing');
  const out = $('#vsb2Out'), pendingImg = {};
  const norm = s => String(s ?? '').replace(/\s+/g, ' ').trim();
  const open = () => !!$('.ed[contenteditable="true"]', out);
  const rerender = () => { const y = view.scrollTop; view.innerHTML = vsb2OutputView(); vsb2BindOutput(); view.scrollTop = y; };
  const enterEdit = () => {
    $$('.ed', out).forEach(el => { el.contentEditable = 'true'; el.classList.add('editing'); });
    view.classList.add('is-editing'); window.editUI.top($('#vsb2Edit'), true); $('.ed', out)?.focus();
  };
  /* write changed dialogue / images back; an emptied line keeps its old text. Returns how many changed */
  const commit = () => {
    let n = 0;
    $$('.ed[data-p]', out).forEach(el => {
      const raw = el.textContent.trim(), before = vsb2Get(vsb2Doc, el.dataset.p);
      if (!raw || norm(raw) === norm(before)) return;
      vsb2Set(vsb2Doc, el.dataset.p, raw); n++;
    });
    Object.entries(pendingImg).forEach(([p, src]) => { vsb2Set(vsb2Doc, p, src); delete pendingImg[p]; n++; });
    return n;
  };
  const keepEdits = () => { if (open() || Object.keys(pendingImg).length) commit(); };
  /* unsaved = Edit mode is still open on this page (even if nothing changed yet, or only formatting did) or an image was replaced */
  const dirty = () => open() || Object.keys(pendingImg).length > 0;

  $('#vsb2Back').onclick = async () => {
    if (dirty()) { const r = await unsavedModal(); if (r === 'cancel') return; if (r === 'save') commit(); }
    navigate('#/tools');
  };

  /* page turning: unsaved edits on this page must be saved (or discarded) first - same modal as leaving the tool */
  const go = async d => {
    const nx = vsb2Page + d;
    if (nx < 0 || nx >= vsb2Pages().length) return;
    if (dirty()) {
      const r = await unsavedModal(); if (r === 'cancel') return;
      if (r === 'save') { const n = commit(); toast(`Saved – ${n} change${n === 1 ? '' : 's'}`); }
    }
    vsb2Page = nx; rerender();   // Edit mode closes on the new page
  };
  $('#vsb2Prev').onclick = () => go(-1);
  $('#vsb2Next').onclick = () => go(1);

  $('#vsb2Edit').onclick = () => {   // Edit document -> Save
    if (open()) { const n = commit(); rerender(); toast(n ? `Saved – ${n} change${n === 1 ? '' : 's'}` : 'Saved'); return; }
    enterEdit();
  };
  $$('.ed', out).forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') e.preventDefault(); }));   // a bubble stays one paragraph

  /* scene image replace */
  out.addEventListener('click', e => { const pk = e.target.closest('[data-pick]'); if (pk) out.querySelector(`[data-newimg="${pk.dataset.pick}"]`).click(); });
  out.addEventListener('change', e => {
    const inp = e.target.closest('[data-newimg]'); if (!inp) return;
    const f = inp.files[0], path = inp.dataset.newimg; inp.value = '';
    if (!f) return;
    if (!f.type.startsWith('image/')) return toast('Please choose an image file');
    if (f.size > 4 * 1024 * 1024) return toast('Image must be under 4 MB');
    const rd = new FileReader();
    rd.onerror = () => toast('Could not read that image');
    rd.onload = () => {
      const im = new Image();
      im.onerror = () => toast('Could not read that image');
      im.onload = () => { pendingImg[path] = rd.result; const a = out.querySelector(`[data-art="${path}"] > img`); if (a) a.src = rd.result; };
      im.src = rd.result;
    };
    rd.readAsDataURL(f);
  });

  bindPrint('vsb2Print', { views: false, run: () => { keepEdits(); vsb2Download('print'); } });
  $('#vsb2Share').onclick = async () => {   // copies this story's link
    try { await navigator.clipboard.writeText(location.href); toast('Link copied'); } catch { toast('Could not copy the link'); }
  };
  $('#vsb2Dl').onclick = () => { keepEdits(); downloadModal({ view: 'story', views: false, file: vsb2FileName, run: (v, fmt) => vsb2Download(fmt), formats: ['word', 'pdf'] }); };
}

/* ---------- Download ---------- */
function vsb2AllHTML() {
  const base = location.href.replace(/[#?].*$/, '').replace(/[^/]*$/, '');
  return vsb2Pages().map(pg => {
    const s = vsb2Doc.scenes[pg.si];
    return `<section class="vsb2-ex"><h2>SCENE ${vsb2Pad(pg.si + 1)}${pg.part ? ' (continued)' : ''}</h2><p><img src="${s.img.startsWith('data:') ? s.img : base + s.img}" width="360" alt=""></p>${pg.lines.map(l => `<p><b>${esc(l.who.toUpperCase())}:</b> ${esc(l.text)}</p>`).join('')}</section>`;
  }).join('');
}

function vsb2Download(fmt) {
  const name = vsb2FileName();
  if (fmt === 'word') return downloadWord(name, `<h1>${esc(vsb2Title())}</h1>` + vsb2AllHTML(), 'h1{font-size:20pt;color:#A4123A}h2{font-size:13pt;color:#E5384F;margin:14pt 0 4pt}');
  $('#vsb2All').innerHTML = `<h1>${esc(vsb2Title())}</h1>` + vsb2AllHTML();   // PDF: every scene, via the print dialog
  const t0 = document.title; document.title = name;
  const undo = () => { document.title = t0; window.removeEventListener('afterprint', undo); };
  window.addEventListener('afterprint', undo); setTimeout(() => window.print(), 80);
}
