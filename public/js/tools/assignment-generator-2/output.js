/* Assignment generator 2.0 - OUTPUT: one student-facing document (title, Submit as, Overview, numbered tasks with figures, 4-level rubric)
   with a sticky section nav. Editing follows the Assessment generator: values only (structure fixed), pale-blue boxes, per-block pencil,
   "+ Add line" under answer lines, a hover pencil to replace (never delete) a figure's image. Print and Download (PDF / Word) sit in the toolbar. */

const a2Get = (o, path) => path.split('.').reduce((a, k) => a?.[k], o);
const a2Set = (o, path, v) => { const ks = path.split('.'), last = ks.pop(); ks.reduce((a, k) => a[k], o)[last] = v; };
/* an editable VALUE inside fixed structure: g = block id, p = path into the document, ml = may wrap over several lines */
const a2ed = (g, p, v, ml) => `<span class="ed${ml ? ' ml' : ''}" data-g="${g}" data-p="${p}">${esc(v)}</span>`;
const a2lines = n => Array.from({ length: n }, () => '<div class="a2-line"></div>').join('');
const a2pen = (g, ex) => ex ? '' : `<button type="button" class="a2-pen icon-btn no-print" data-edit="${g}" title="Edit" aria-label="Edit this part">${ic('edit', 's')}</button>`;
const a2fileName = D => `Assignment_${D.topic}`.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 80);

function a2FigHTML(f, i, g, ex) {
  const body = f.img ? `<img class="a2-img" src="${f.img.src}" alt="${esc(f.img.alt)}">`
    : `<div class="a2-ftw"><table class="a2-ft"><thead><tr>${f.headers.map((h, c) => `<th>${a2ed(g, `tasks.${i}.figure.headers.${c}`, h)}</th>`).join('')}</tr></thead><tbody>${f.rows.map((r, ri) => `<tr>${r.map((c, ci) => `<td>${c === '' ? '' : a2ed(g, `tasks.${i}.figure.rows.${ri}.${ci}`, c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const pick = ex ? '' : `<button type="button" class="dg-edit no-print" data-pick="${i}" aria-label="Edit image">${ic('edit', 's')}</button><input type="file" accept="image/*" data-newimg="${i}" hidden>`;
  return `<figure class="a2-fig"><div class="a2-fcard"><div class="a2-fh">${a2ed(g, `tasks.${i}.figure.title`, f.title)}</div><div class="a2-fbody" data-dg="${i}">${body}</div>${pick}</div><figcaption>${a2ed(g, `tasks.${i}.figure.caption`, f.caption)}</figcaption></figure>`;
}
function a2TaskHTML(t, i, ex) {
  const g = 't' + i;
  const lines = t.lines ? `<div class="a2-lines" data-lines="${i}" data-n="${t.lines}">${a2lines(t.lines)}</div>${ex ? '' : `<div class="ed-tools no-print"><button type="button" class="ed-link" data-line="1" data-lq="${i}">+ Add line</button></div>`}` : '';
  return `<li class="a2-task a2-blk" data-gp="${g}"><span class="a2-n">${i + 1}</span><div class="a2-tb">
    ${t.caseCard ? `<div class="a2-case"><b>${a2ed(g, `tasks.${i}.caseCard.title`, t.caseCard.title)}</b><p>${a2ed(g, `tasks.${i}.caseCard.text`, t.caseCard.text, true)}</p></div>` : ''}
    <p class="a2-tt">${a2ed(g, `tasks.${i}.text`, t.text, true)}</p>
    ${t.options ? `<ul class="a2-opts">${t.options.map((o, j) => `<li>(${'abcd'[j]}) ${a2ed(g, `tasks.${i}.options.${j}`, o)}</li>`).join('')}</ul>` : ''}
    ${t.figure ? a2FigHTML(t.figure, i, g, ex) : ''}${lines}</div>${a2pen(g, ex)}</li>`;
}
function a2RubricHTML(R, ex) {
  const bars = k => `<span class="a2-bars" aria-hidden="true">${[0, 1, 2, 3].map(b => `<i class="${b < 4 - k ? 'on' : ''}"></i>`).join('')}</span>`;
  return `<div class="a2-rub-card"><table class="a2-rub" id="a2Rub"><thead><tr><th class="a2-crit">Criterion</th>${R.levels.map((l, k) => `<th class="l${k}" data-lv="${k}" tabindex="0"><b>${esc(l)}</b>${bars(k)}</th>`).join('')}</tr></thead>
    <tbody>${R.criteria.map((c, r) => `<tr class="a2-blk" data-gp="r${r}"><th scope="row">${a2ed('r' + r, `rubric.criteria.${r}.name`, c.name)}${a2pen('r' + r, ex)}</th>${c.cells.map((v, k) => `<td class="l${k}">${a2ed('r' + r, `rubric.criteria.${r}.cells.${k}`, v, true)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
/* ex = export copy (Word): same document without edit tools */
function a2DocHTML(D, ex) {
  return `<article class="a2-doc">
    <header class="a2-head a2-blk" data-gp="head"><h1>${a2ed('head', 'title', D.title, true)}</h1>${a2pen('head', ex)}
      <div class="a2-meta"><span>Submit as</span><b>${a2ed('head', 'submit_as', D.submit_as)}</b></div>
      <div class="a2-stu">${['Name', 'Roll no.', 'Class & Section', 'Date'].map(l => `<div class="a2-sf"><span>${l}</span><i></i></div>`).join('')}</div></header>
    <section class="a2-sec a2-blk" id="a2-ov" data-gp="ov"><h2>Overview</h2><p class="a2-ovt">${a2ed('ov', 'overview', D.overview, true)}</p>
      ${D.brief.length ? `<dl class="a2-brief">${D.brief.map((b, k) => `<div><dt>${esc(b[0])}</dt><dd>${a2ed('ov', `brief.${k}.1`, b[1], true)}</dd></div>`).join('')}</dl>` : ''}${a2pen('ov', ex)}</section>
    <section class="a2-sec" id="a2-tasks"><h2>What students need to do</h2><ol class="a2-tasks">${D.tasks.map((t, i) => a2TaskHTML(t, i, ex)).join('')}</ol></section>
    <section class="a2-sec" id="a2-rub"><div class="a2-rh"><h2>Rubric</h2><span class="a2-hint">Select a level to compare it across criteria</span></div>${a2RubricHTML(D.rubric, ex)}</section></article>`;
}

function asg2OutputView() {
  const D = asg2Doc.doc;
  return `<div class="toolbar"><div class="toolbar-in">
    <button class="icon-btn round" id="a2Back" aria-label="Change settings">${ic('back')}</button>
    <div class="tb-title"><small>Assignment generator 2.0</small><b>${esc(D.topic)}</b></div>
    <div class="acts"><button class="btn" id="a2Edit">${ic('edit', 's')}<span class="lb">Edit</span></button>${printBtn('a2Print')}<button class="btn primary" id="a2Dl" type="button" aria-haspopup="menu" aria-expanded="false">${ic('download', 's')}<span class="lb">Download</span></button></div></div></div>
  <div class="a2-wrap" id="a2Out"><nav class="a2-nav no-print" aria-label="Sections"><a href="#a2-ov" data-go="a2-ov" class="on"><i></i>Overview</a><a href="#a2-tasks" data-go="a2-tasks"><i></i>Tasks<span>${D.tasks.length}</span></a><a href="#a2-rub" data-go="a2-rub"><i></i>Rubric<span>${D.rubric.criteria.length}</span></a></nav>${a2DocHTML(D)}</div>`;
}

let asg2Spy = null;
function asg2BindOutput() {
  const view = $('#view'); view.classList.add('bg-white', 'view-asg2'); view.classList.remove('is-editing');
  const out = $('#a2Out'), D = () => asg2Doc.doc, pendingImg = {};
  const rerender = () => { const y = view.scrollTop; view.innerHTML = asg2OutputView(); asg2BindOutput(); view.scrollTop = y; };
  const norm = s => String(s ?? '').replace(/\s+/g, ' ').trim();
  const open = () => !!$('.ed[contenteditable="true"]', out);
  const syncTop = () => window.editUI.top($('#a2Edit'), open());
  /* write the changed values (all blocks, or one) back into the document; returns how many things changed */
  const commit = gid => {
    let n = 0;
    $$('.ed[data-p]', out).forEach(el => {
      if (gid && el.dataset.g !== gid) return;
      const raw = (el.classList.contains('ml') ? el.innerText : el.textContent).trim();
      if (!raw || norm(raw) === norm(a2Get(D(), el.dataset.p))) return;
      a2Set(D(), el.dataset.p, raw); n++;
    });
    $$('[data-lines]', out).forEach(el => { const i = +el.dataset.lines; if (gid && 't' + i !== gid) return; if (+el.dataset.n !== D().tasks[i].lines) { D().tasks[i].lines = +el.dataset.n; n++; } });
    Object.entries(pendingImg).forEach(([i, im]) => { if (gid && 't' + i !== gid) return; D().tasks[i].figure.img = im; delete pendingImg[i]; n++; });
    return n;
  };
  const keepEdits = () => { if (open() || Object.keys(pendingImg).length) commit(); };   // leaving, printing or downloading keeps the edits

  $('#a2Back').onclick = () => { keepEdits(); navigate('#/assignment-generator-2'); };
  const setOpen = (els, on) => els.forEach(el => { el.contentEditable = on ? 'true' : 'false'; el.classList.toggle('editing', on); });
  $('#a2Edit').onclick = () => { // Edit -> Save: every block opens; Save writes the values back and closes everything
    if (open()) { const n = commit(); rerender(); toast(n ? `Saved – ${n} change${n === 1 ? '' : 's'}` : 'Saved'); return; }
    setOpen($$('.ed', out), true); view.classList.add('is-editing'); syncTop(); $('.ed', out)?.focus();
  };
  $$('.ed:not(.ml)', out).forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') e.preventDefault(); }));   // one-line values stay one line
  $$('[data-edit]', out).forEach(b => b.onclick = () => { // pencil -> "save Save" for that block only
    const id = b.dataset.edit, els = $$('.ed', out).filter(x => x.dataset.g === id), on = els[0].contentEditable !== 'true';
    if (on) { setOpen(els, true); window.editUI.sec(b, true); els[0].focus(); syncTop(); return; }
    const n = commit(id); setOpen(els, false); window.editUI.sec(b, false);
    if (!open()) { rerender(); if (n) toast('Saved'); } else syncTop();
  });

  /* edit-time helpers: more answer lines; replace (never delete) a figure's image - an empty, invalid or unreadable file keeps the current one */
  out.addEventListener('click', e => {
    const l = e.target.closest('[data-line]'), pk = e.target.closest('[data-pick]');
    if (pk) out.querySelector(`[data-newimg="${pk.dataset.pick}"]`).click();
    if (l) { const box = out.querySelector(`[data-lines="${l.dataset.lq}"]`), n = Math.max(1, Math.min(20, +box.dataset.n + +l.dataset.line)); box.dataset.n = n; box.innerHTML = a2lines(n); }
    const lv = e.target.closest('th[data-lv]'); if (lv) { const t = $('#a2Rub'); t.dataset.lv = t.dataset.lv === lv.dataset.lv ? '' : lv.dataset.lv; }
  });
  out.addEventListener('keydown', e => { const lv = e.target.closest?.('th[data-lv]'); if (lv && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); lv.click(); } });
  out.addEventListener('change', e => {
    const inp = e.target.closest('[data-newimg]'); if (!inp) return;
    const i = inp.dataset.newimg, f = inp.files && inp.files[0]; inp.value = '';
    const fail = why => toast(`${why} The current image is kept.`);
    if (!f || !f.size) return fail('That file is empty.');
    if (!/^image\//.test(f.type)) return fail('Please choose an image file.');
    if (f.size > 4 * 1024 * 1024) return fail('That image is over 4 MB.');
    const rd = new FileReader();
    rd.onerror = () => fail('That image could not be read.');
    rd.onload = () => { const img = new Image(); img.onerror = () => fail('That image could not be opened.');
      img.onload = () => { if (!img.naturalWidth || !img.naturalHeight) return fail('That image has no content.');
        pendingImg[i] = { src: rd.result, alt: D().tasks[i].figure.title };
        out.querySelector(`[data-dg="${i}"]`).innerHTML = `<img class="a2-img" src="${rd.result}" alt="${esc(pendingImg[i].alt)}">`; };
      img.src = rd.result; };
    rd.readAsDataURL(f);
  });

  /* sticky nav: jump to a section, and follow the scroll */
  const jump = id => { const el = $('#' + id), top = el.getBoundingClientRect().top - view.getBoundingClientRect().top + view.scrollTop - 90; view.scrollTo({ top, behavior: 'smooth' }); };
  $$('[data-go]', out).forEach(a => a.onclick = e => { e.preventDefault(); jump(a.dataset.go); });
  if (asg2Spy) view.removeEventListener('scroll', asg2Spy);
  asg2Spy = () => {
    if (!document.body.contains(out)) return;
    const vt = view.getBoundingClientRect().top; let cur = 'a2-ov';
    ['a2-ov', 'a2-tasks', 'a2-rub'].forEach(id => { if ($('#' + id).getBoundingClientRect().top - vt < 140) cur = id; });
    if (view.scrollTop + view.clientHeight >= view.scrollHeight - 4) cur = 'a2-rub';
    $$('[data-go]', out).forEach(a => a.classList.toggle('on', a.dataset.go === cur));
  };
  view.addEventListener('scroll', asg2Spy, { passive: true });

  /* print / download */
  const printNow = (name) => { keepEdits(); const t0 = document.title; if (name) document.title = name; const undo = () => { document.title = t0; window.removeEventListener('afterprint', undo); }; window.addEventListener('afterprint', undo); setTimeout(() => window.print(), 80); };
  bindPrint('a2Print', { views: false, run: () => printNow() });
  bindMenu('a2Dl', { items: [['pdf', 'PDF'], ['word', 'Word']], run: k => {
    keepEdits();
    if (k === 'pdf') return printNow(a2fileName(D()));   // PDF comes from the print dialog (Save as PDF); the page title names the file
    downloadWord(a2fileName(D()), a2DocHTML(D(), true), 'h1{font-size:22pt;color:#B01E3A}h2{font-size:14pt;margin-top:16pt}dt{font-weight:bold}.a2-n{font-weight:bold;color:#E04158;padding-right:8pt}table{border-collapse:collapse;width:100%}th{background:#F3F4F7;text-align:left}.a2-line{border-bottom:1px solid #999;height:18pt}.a2-bars{display:none}.a2-stu{width:100%;margin-top:12pt}.a2-sf{display:inline-block;width:48%;padding:6pt 0}.a2-sf span{color:#626778}.a2-sf i{display:inline-block;width:55%;border-bottom:1px solid #999}');
  } });
}
