/* Activity Designer 2.0 - OUTPUT: opens straight on the activity (no input, no Student/Teacher view).
   Edit changes the CONTENT only (text values); the structure - sections, steps, cards, counts - stays fixed. */

/* an editable VALUE inside the fixed structure: p = path into the activity, ml = may wrap over several lines */
const ad2Ed = (p, v, ml) => `<span class="ed${ml ? ' ml' : ''}" data-p="${p}">${esc(v)}</span>`;
const ad2Letter = k => 'abcdefghij'[k];
const ad2FileName = D => 'Activity_' + D.title.split(':')[0].trim().replace(/[^\w]+/g, '');

/* ex = export copy (Word / print): the same activity as plain text, without edit hooks */
function ad2PageHTML(D, ex) {
  const ed = (p, v, ml) => ex ? esc(v) : ad2Ed(p, v, ml);
  /* a step is ONE editable box: bold lead-in + paragraph (split back into lead / text on save) */
  const stepBody = (s, i) => ex ? `<b>${esc(s.lead)}</b> ${esc(s.text)}` : `<span class="ed ml" data-step="${i}"><b>${esc(s.lead)}</b> ${esc(s.text)}</span>`;
  const steps = D.instructions.map((s, i) => `<li>${stepBody(s, i)}${s.subs.map((t, k) => `<div class="ad2-sub">${ad2Letter(k)}. ${ed(`instructions.${i}.subs.${k}`, t, true)}</div>`).join('')}</li>`).join('');
  const crit = D.criteria.map((c, i) => `<div class="ad2-crit"><div class="ad2-crit-h"><span>${ed(`criteria.${i}.pts`, c.pts)} PTS TOTAL</span><i>•</i><span>CRITERIA WEIGHT</span></div>
      <div class="ad2-crit-b"><p>${ed(`criteria.${i}.name`, c.name, true)}</p><div class="ad2-bar"><span></span></div></div></div>`).join('');
  return `<article class="ad2-page">
    <div class="ad2-meta"><span class="ad2-badge">${ed('type', D.type)}</span><span class="ad2-dur">${ic('clock', 's')}${ed('duration', D.duration)}</span></div>
    <h1 class="ad2-title">${ed('title', D.title, true)}</h1>
    <div class="ad2-obj"><span class="ad2-ol">LEARNING OBJECTIVE</span><span class="ad2-oi">${ic('target', 's')}</span><p>${ed('objective', D.objective, true)}</p></div>
    <div class="ad2-grid">
      <div class="ad2-main">
        <section class="ad2-card"><h2 class="ad2-h"><span class="ad2-hi">${ic('doc', 's')}</span>Activity Instructions</h2><ol class="ad2-steps">${steps}</ol></section>
        <section class="ad2-exp"><h2 class="ad2-eh">${ic('doc', 's')}EXPECTED OUTPUT</h2><ul>${D.expected.map((t, i) => `<li><span class="ad2-ck">${ic('tick', 'xs')}</span>${ed(`expected.${i}`, t, true)}</li>`).join('')}</ul></section>
        <section class="ad2-keep"><h2>POINTS TO KEEP IN MIND</h2><span class="ad2-ki">${ic('info', 's')}</span><p>${ed('keepInMind', D.keepInMind, true)}</p></section>
      </div>
      <aside class="ad2-side">
        <section class="ad2-card"><h2 class="ad2-h"><span class="ad2-hi">${ic('list', 's')}</span>Materials Needed</h2><ul class="ad2-mats">${D.materials.map((t, i) => `<li><span class="ad2-ck">${ic('tick', 'xs')}</span>${ed(`materials.${i}`, t, true)}</li>`).join('')}</ul></section>
        <section class="ad2-card"><h2 class="ad2-h"><span class="ad2-hi ad2-hi-o">${ic('award', 's')}</span>Assessment Criteria</h2>${crit}</section>
      </aside>
    </div></article>`;
}

function ad2OutputView() {
  return `<div class="toolbar"><div class="toolbar-in">
    <button class="icon-btn round" id="ad2Back" aria-label="Back to tools">${ic('back')}</button>
    <div class="tb-title"><small>Activity Designer 2.0</small><b>${esc(ad2Doc.title)}</b></div>
    <div class="acts"><button class="btn" id="ad2Edit">${ic('edit', 's')}<span class="lb">Edit</span></button>${printBtn('ad2Print')}<button class="btn" id="ad2Share" aria-haspopup="dialog">${ic('share', 's')}<span class="lb">Share</span></button><button class="btn primary" id="ad2Dl" aria-haspopup="dialog">${ic('download', 's')}<span class="lb">Download</span></button></div></div></div>
  <div class="ad2-out" id="ad2Out">${ad2PageHTML(ad2Doc)}</div>`;
}

function ad2BindOutput() {
  const view = $('#view'); view.classList.add('bg-white', 'view-ad2'); view.classList.remove('is-editing');
  const out = $('#ad2Out');
  const rerender = () => { const y = view.scrollTop; view.innerHTML = ad2OutputView(); ad2BindOutput(); view.scrollTop = y; };
  const norm = s => String(s ?? '').replace(/\s+/g, ' ').trim();
  const open = () => !!$('.ed[contenteditable="true"]', out);
  /* write the changed values back into the activity; an emptied value keeps its old text. Returns how many changed */
  const commit = () => {
    let n = 0;
    $$('.ed[data-step]', out).forEach(el => {
      const s = ad2Doc.instructions[el.dataset.step], c = el.cloneNode(true), b = c.querySelector('b');
      const lead = b ? b.textContent.trim() : s.lead; if (b) b.remove();
      const text = c.innerText.trim() || c.textContent.trim();
      if (!lead || !text || (norm(lead) === norm(s.lead) && norm(text) === norm(s.text))) return;
      s.lead = lead; s.text = text; n++;
    });
    $$('.ed[data-p]', out).forEach(el => {
      const raw = (el.classList.contains('ml') ? el.innerText : el.textContent).trim(), before = ad2Get(ad2Doc, el.dataset.p);
      if (!raw || norm(raw) === norm(before)) return;
      ad2Set(ad2Doc, el.dataset.p, raw); n++;
    });
    return n;
  };
  const keepEdits = () => { if (open()) commit(); };   // leaving, printing or downloading keeps the edits

  $('#ad2Back').onclick = async () => {
    if (open()) { const r = await unsavedModal(); if (r === 'cancel') return; if (r === 'save') commit(); }
    navigate('#/tools');
  };
  bindPrint('ad2Print', { views: false, run: () => { keepEdits(); ad2Download('print'); } });
  $('#ad2Share').onclick = () => { keepEdits(); ad2ShareModal(); };
  $('#ad2Dl').onclick =() => { keepEdits(); downloadModal({ view: 'activity', views: false, file: () => ad2FileName(ad2Doc), run: (v, fmt) => ad2Download(fmt), formats: ['word', 'pdf'] }); };

  $('#ad2Edit').onclick = () => { // Edit -> Save: every value opens; Save writes them back and closes
    if (open()) { const n = commit(); rerender(); toast(n ? `Saved – ${n} change${n === 1 ? '' : 's'}` : 'Saved'); return; }
    $$('.ed', out).forEach(el => { el.contentEditable = 'true'; el.classList.add('editing'); });
    view.classList.add('is-editing'); window.editUI.top($('#ad2Edit'), true); $('.ed', out)?.focus();
  };
  $$('.ed:not(.ml)', out).forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') e.preventDefault(); }));   // one-line values stay one line
}

/* ---------- Share: link to this activity, with Copy ---------- */
function ad2ShareModal() {
  const link = `${location.origin}${location.pathname}#/activity-designer-2`;
  $('#modalRoot').innerHTML = `<div class="overlay" id="ov"><div class="modal" role="dialog" aria-modal="true" aria-label="Share"><h3>Share</h3>
    <div class="row" style="margin-top:12px"><input class="input" readonly value="${esc(link)}" id="ad2Lnk"><button class="btn primary" id="ad2Cp">${ic('link', 's')} Copy</button></div>
    <div style="display:flex;justify-content:flex-end;margin-top:16px"><button class="btn" id="ad2Cl">Close</button></div></div></div>`;
  const close = () => { $('#modalRoot').innerHTML = ''; };
  $('#ad2Cl').onclick = close; $('#ov').onclick = e => { if (e.target.id === 'ov') close(); };
  $('#ad2Cp').onclick = () => { navigator.clipboard?.writeText(link); toast('Link copied'); };
}

/* ---------- Download / Print ---------- */
function ad2Download(fmt) {
  const name = ad2FileName(ad2Doc);
  if (fmt === 'word') {
    const css = 'body{font-family:Arial;font-size:11pt}.ad2-badge{font-weight:bold;color:#E5384F}.ad2-title{color:#A4123A;font-size:18pt}.ad2-obj{border:1px solid #FAC5CE;background:#FFF1F3;padding:6pt}.ad2-ol,.ad2-h,.ad2-eh{font-weight:bold}.ad2-h,.ad2-eh,.ad2-keep h2{font-size:13pt;margin:12pt 0 4pt}.ad2-sub{margin-left:14pt}.ad2-crit{border:1px solid #E07000;margin:6pt 0;padding:4pt}.ad2-crit-h{color:#E07000;font-weight:bold;font-size:9pt}.ad2-keep{background:#FFE0E5;padding:6pt;font-style:italic}svg,.ad2-ck,.ad2-ki,.ad2-oi,.ad2-hi,.ad2-bar{display:none}';
    return downloadWord(name, ad2PageHTML(ad2Doc, true), css);
  }
  const t0 = document.title; document.title = name;   // PDF and Print both come from the print dialog
  const undo = () => { document.title = t0; window.removeEventListener('afterprint', undo); };
  window.addEventListener('afterprint', undo); setTimeout(() => window.print(), 80);
}
