/* Lesson Planner 2.0 - OUTPUT: opens straight on the lesson plan (no input, no Student/Teacher view).
   Edit changes the CONTENT only (text values); tabs, headings, labels, stage bar, numbering and layout stay fixed. */

const LP2_TABS = ['Lesson flow', 'Teaching notes', 'Questions and activities', 'Assess and close'];
let lp2Tab = 0;   // active tab (kept across Edit/Save re-renders)
let lp2Q = 0;     // active question group pill

const lp2Txt = h => { const t = document.createElement('template'); t.innerHTML = h; return t.content.textContent; };
const lp2Ed = (p, v) => `<span class="ed" data-p="${p}" data-et="inline">${v}</span>`;
const lp2Title = () => `${lp2Doc.subject} (Grade ${lp2Doc.grade}) · ${lp2Doc.topics} topics`;
const lp2FileName = () => 'Lesson_Plan_' + lp2Doc.subject.replace(/[^\w]+/g, '');
const lp2Mins = () => lp2Doc.stages[lp2Doc.stages.length - 1].end;

/* keep only simple text formatting coming from the edit toolbar; drop everything else */
function lp2Clean(html) {
  const t = document.createElement('template'); t.innerHTML = html;
  const KEEP = { B: 1, STRONG: 1, I: 1, EM: 1, U: 1, S: 1, STRIKE: 1, SUB: 1, SUP: 1, MARK: 1, SPAN: 1, FONT: 1 };
  const PROPS = ['color', 'backgroundColor', 'fontWeight', 'fontStyle', 'textDecoration', 'fontSize'];
  const walk = n => [...n.childNodes].forEach(c => {
    if (c.nodeType === 3) return;
    if (c.nodeType !== 1) { c.remove(); return; }
    walk(c);
    if (c.tagName === 'BR') { c.replaceWith(' '); return; }
    if (!KEEP[c.tagName]) { c.replaceWith(...c.childNodes); return; }
    if (c.tagName === 'SPAN' || c.tagName === 'FONT') {
      const css = PROPS.filter(k => c.style[k]).map(k => `${k.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}:${c.style[k]}`);
      if (c.tagName === 'FONT' && c.getAttribute('color')) css.push('color:' + c.getAttribute('color'));
      if (!css.length) { c.replaceWith(...c.childNodes); return; }
      const sp = document.createElement('span'); sp.setAttribute('style', css.join(';')); sp.append(...c.childNodes); c.replaceWith(sp);
    } else [...c.attributes].forEach(a => c.removeAttribute(a.name));
  });
  walk(t.content);
  const d = document.createElement('div'); d.append(t.content);
  return d.innerHTML.replace(/&nbsp;| /g, ' ');
}

/* ---------- tab panes. ex = export copy (Word / print): same markup without edit hooks ---------- */
function lp2Flow(ex) {
  const E = (p, v) => ex ? v : lp2Ed(p, v);
  return `<div class="lp2-flow">${lp2Doc.stages.map((s, i) => `<article class="lp2-stage">
    <div class="lp2-time"><b>${s.start}–${s.end}</b> min</div>
    <div class="lp2-sbody"><h3>${E(`stages.${i}.title`, s.title)}</h3><p class="lp2-purpose">${E(`stages.${i}.purpose`, s.purpose)}</p>
      <div class="lp2-lab">Teacher</div><p class="lp2-teach">${E(`stages.${i}.teacher`, s.teacher)}</p>
      ${s.resources.length ? `<p class="lp2-res"><b>Resources:</b> ${s.resources.map((r, j) => E(`stages.${i}.resources.${j}`, r)).join(' · ')}</p>` : ''}</div></article>`).join('')}</div>`;
}

function lp2Notes(ex) {
  const E = (p, v) => ex ? v : lp2Ed(p, v);
  return `<h2 class="lp2-h2">Concept notes</h2>${lp2Doc.concepts.map((c, i) => `<section class="lp2-concept">
    <h3>${c.name}</h3><p class="lp2-desc">${E(`concepts.${i}.desc`, c.desc)}</p>
    <ul class="lp2-dots">${c.points.map((p, j) => `<li>${E(`concepts.${i}.points.${j}`, p)}</li>`).join('')}</ul>
    <div class="lp2-kv"><span class="lp2-k">Example</span><span class="lp2-v">${E(`concepts.${i}.example`, c.example)}</span></div>
    <div class="lp2-kv"><span class="lp2-k">Analogy</span><span class="lp2-v">${E(`concepts.${i}.analogy`, c.analogy)}</span></div>
    <div class="lp2-kv"><span class="lp2-k">Ask</span><ul class="lp2-dots lp2-v">${c.ask.map((a, j) => `<li>${E(`concepts.${i}.ask.${j}`, a)}</li>`).join('')}</ul></div></section>`).join('')}`;
}

function lp2QList(gi, ex) {
  const g = lp2Doc.questions[gi];
  return `<ol class="lp2-ql">${g.items.map((q, j) => `<li><span class="lp2-n">${j + 1}</span><span class="lp2-qt">${ex ? q : lp2Ed(`questions.${gi}.items.${j}`, q)}</span></li>`).join('')}</ol>`;
}

function lp2QA(ex) {
  const E = (p, v) => ex ? v : lp2Ed(p, v);
  const qs = ex
    ? lp2Doc.questions.map((g, gi) => `<h3 class="lp2-sub">${g.group}</h3>${lp2QList(gi, true)}`).join('')
    : `<div class="lp2-pills no-print" role="tablist">${lp2Doc.questions.map((g, gi) => `<button type="button" class="lp2-pill${gi === lp2Q ? ' on' : ''}" data-q="${gi}" role="tab" aria-selected="${gi === lp2Q}">${g.group} <i>${g.items.length}</i></button>`).join('')}</div>${lp2QList(lp2Q)}`;
  return `<h2 class="lp2-h2 lp2-h2n">Questions to ask</h2>${qs}
    <h2 class="lp2-h2 lp2-gap">Student activities</h2>${lp2Doc.activities.map((a, i) => `<article class="lp2-act">
      <div class="lp2-ah"><h3>${E(`activities.${i}.title`, a.title)}</h3><span class="lp2-am">${a.type} · ${a.mins} min</span></div>
      <p class="lp2-adesc">${E(`activities.${i}.desc`, a.desc)}</p><p class="lp2-res"><b>Serves:</b> ${E(`activities.${i}.serves`, a.serves)}</p></article>`).join('')}`;
}

function lp2Assess(ex) {
  const E = (p, v) => ex ? v : lp2Ed(p, v);
  const a = lp2Doc.assess;
  return `<h2 class="lp2-h2 lp2-h2n">Check for understanding</h2>
    <ol class="lp2-ql">${a.checks.map((c, j) => `<li><span class="lp2-n">${j + 1}</span><span class="lp2-qt">${E(`assess.checks.${j}`, c)}</span></li>`).join('')}</ol>
    <h2 class="lp2-h2 lp2-gap">Homework</h2><p class="lp2-desc lp2-pad">${E('assess.homework', a.homework)}</p>
    <h2 class="lp2-h2 lp2-gap">Differentiation</h2>
    <div class="lp2-kvs"><div class="lp2-kv"><span class="lp2-k">Support</span><span class="lp2-v">${E('assess.support', a.support)}</span></div>
    <div class="lp2-kv"><span class="lp2-k">Extension</span><span class="lp2-v">${E('assess.extension', a.extension)}</span></div></div>
    <h2 class="lp2-h2 lp2-gap">Lesson closure</h2>
    <div class="lp2-kvs"><div class="lp2-kv"><span class="lp2-k">Summary</span><span class="lp2-v">${E('assess.summary', a.summary)}</span></div>
    <div class="lp2-kv"><span class="lp2-k">Recap</span><span class="lp2-v">${E('assess.recap', a.recap)}</span></div></div>`;
}

const LP2_PANES = [lp2Flow, lp2Notes, lp2QA, lp2Assess];

function lp2OutputView() {
  const d = lp2Doc, total = lp2Mins();
  return `<div class="toolbar"><div class="toolbar-in">
    <button class="icon-btn round" id="lp2Back" aria-label="Back to tools">${ic('back')}</button>
    <div class="tb-title"><b>${esc(lp2Title())}</b></div>
    <div class="acts"><button class="btn" id="lp2Edit" type="button">${ic('edit', 's')}<span class="lb">Edit</span></button>${printBtn('lp2Print')}<button class="btn primary" id="lp2Dl" type="button" aria-haspopup="dialog">${ic('download', 's')}<span class="lb">Download</span></button></div></div></div>
  <div class="lp2-out" id="lp2Out">
    <header class="lp2-hero"><h1>${lp2Ed('title', d.title)}</h1>
      <p class="lp2-meta">${esc(d.subject)} · Grade ${d.grade} · ${lp2Ed('chapter', d.chapter)} · ${total} min</p>
      <p class="lp2-by">By the end, students can</p>
      <ul class="lp2-dots lp2-obj">${d.objectives.map((o, i) => `<li>${lp2Ed(`objectives.${i}`, o)}</li>`).join('')}</ul></header>
    <div class="lp2-bar" id="lp2Bar">${d.stages.map((s, i) => `<span class="lp2-seg s${i}" style="flex:${s.end - s.start}" data-tip="${esc(lp2Txt(s.title) + ': ' + (s.end - s.start) + ' min')}"></span>`).join('')}</div>
    <p class="lp2-cap">${d.stages.length} stages</p>
    <nav class="lp2-tabs no-print" role="tablist">${LP2_TABS.map((t, i) => `<button type="button" class="lp2-tab${i === lp2Tab ? ' on' : ''}" data-tab="${i}" role="tab" aria-selected="${i === lp2Tab}">${t}</button>`).join('')}</nav>
    <section class="lp2-pane" id="lp2Pane">${LP2_PANES[lp2Tab]()}</section></div>
  <div class="lp2-tip no-print" id="lp2Tip" role="tooltip"></div>
  <div class="lp2-all" id="lp2All" aria-hidden="true"></div>`;
}

function lp2BindOutput() {
  const view = $('#view'); view.classList.add('bg-white', 'view-lp2'); view.classList.remove('is-editing');
  const out = $('#lp2Out');
  const norm = s => String(s ?? '').replace(/\s+/g, ' ').trim();
  const open = () => !!$('.ed[contenteditable="true"]', out);
  const rerender = () => { const y = view.scrollTop; view.innerHTML = lp2OutputView(); lp2BindOutput(); view.scrollTop = y; };
  const enterEdit = () => {
    $$('.ed', out).forEach(el => { el.contentEditable = 'true'; el.classList.add('editing'); });
    view.classList.add('is-editing'); window.editUI.top($('#lp2Edit'), true);
  };
  /* write changed text back; an emptied value keeps its old text. Returns how many changed */
  const commit = () => {
    let n = 0;
    $$('.ed[data-p]', out).forEach(el => {
      if (!el.textContent.trim()) return;
      const clean = lp2Clean(el.innerHTML);
      if (norm(clean) === norm(lp2Get(lp2Doc, el.dataset.p))) return;
      lp2Set(lp2Doc, el.dataset.p, clean.trim()); n++;
    });
    return n;
  };
  const keepEdits = () => { if (open()) commit(); };

  $('#lp2Back').onclick = async () => {
    if (open()) { const r = await unsavedModal(); if (r === 'cancel') return; if (r === 'save') commit(); }
    navigate('#/tools');
  };

  $('#lp2Edit').onclick = () => {   // Edit document -> Save
    if (open()) { const n = commit(); rerender(); toast(n ? `Saved – ${n} change${n === 1 ? '' : 's'}` : 'Saved'); return; }
    enterEdit(); $('.ed', out)?.focus();
  };

  /* tabs and question pills: edits are kept and Edit mode stays on */
  const swap = fn => { const editing = open(); if (editing) commit(); fn(); rerender(); if (editing) enterEdit(); };
  out.addEventListener('click', e => {
    const tb = e.target.closest('[data-tab]'), pl = e.target.closest('[data-q]');
    if (tb && +tb.dataset.tab !== lp2Tab) swap(() => { lp2Tab = +tb.dataset.tab; });
    else if (pl && +pl.dataset.q !== lp2Q) swap(() => { lp2Q = +pl.dataset.q; });
  });

  /* content only: a value stays one paragraph, pasted text is plain, nothing can be dropped in */
  out.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.closest('.ed')) e.preventDefault(); });
  out.addEventListener('paste', e => {
    if (!e.target.closest('.ed')) return;
    e.preventDefault(); document.execCommand('insertText', false, (e.clipboardData.getData('text/plain') || '').replace(/\s+/g, ' '));
  });
  out.addEventListener('drop', e => { if (e.target.closest('.ed')) e.preventDefault(); });

  /* stage bar tooltip */
  const tip = $('#lp2Tip'), bar = $('#lp2Bar');
  bar.addEventListener('mousemove', e => {
    const seg = e.target.closest('.lp2-seg'); if (!seg) { tip.classList.remove('on'); return; }
    tip.textContent = seg.dataset.tip; tip.classList.add('on');
    tip.style.left = Math.min(e.clientX - 8, window.innerWidth - tip.offsetWidth - 12) + 'px'; tip.style.top = (e.clientY + 18) + 'px';
  });
  bar.addEventListener('mouseleave', () => tip.classList.remove('on'));

  bindPrint('lp2Print', { views: false, run: () => { keepEdits(); lp2Download('print'); } });
  $('#lp2Dl').onclick = () => { keepEdits(); downloadModal({ view: 'plan', views: false, file: lp2FileName, run: (v, fmt) => lp2Download(fmt), formats: ['word', 'pdf'] }); };
}

/* ---------- Download ---------- */
function lp2AllHTML() {
  const d = lp2Doc;
  return `<h1>${d.title}</h1><p class="lp2-meta">${esc(d.subject)} · Grade ${d.grade} · ${d.chapter} · ${lp2Mins()} min</p>
    <p class="lp2-by">By the end, students can</p><ul class="lp2-dots lp2-obj">${d.objectives.map(o => `<li>${o}</li>`).join('')}</ul>`
    + LP2_TABS.map((t, i) => `<section class="lp2-ex"><h2 class="lp2-tabh">${t}</h2>${LP2_PANES[i](true)}</section>`).join('');
}

function lp2Download(fmt) {
  const name = lp2FileName();
  if (fmt === 'word') return downloadWord(name, `<h2 style="color:#6E0A27">${esc(lp2Title())}</h2>` + lp2AllHTML(),
    'h1{font-size:22pt;color:#AE1F3E}h2{font-size:15pt;color:#E5384F;margin:16pt 0 6pt}h3{font-size:12pt;margin:10pt 0 2pt}.lp2-lab,.lp2-time{color:#666;font-size:9pt}.lp2-res,.lp2-purpose{color:#555;font-size:10pt}');
  $('#lp2All').innerHTML = `<div class="lp2-doc">${lp2AllHTML()}</div>`;   // PDF: whole plan via the print dialog
  const t0 = document.title; document.title = name;
  const undo = () => { document.title = t0; window.removeEventListener('afterprint', undo); };
  window.addEventListener('afterprint', undo); setTimeout(() => window.print(), 80);
}
