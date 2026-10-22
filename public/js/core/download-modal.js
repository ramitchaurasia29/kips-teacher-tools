/* Shared DOWNLOAD modal - used wherever a tool offers a Student / Teacher view in Word, PDF or Print.
   downloadModal({ view: 'teacher'|'student', file: view => 'File_name', run: (view, fmt) => {...} })
   fmt is 'word' | 'pdf' | 'print'. The tool decides how to produce each format; the modal and its CTA ("Download") stay identical. */
/* Optional: views = { teacher: 'Teacher Guide', student: 'Student Worksheet' } (labels), formats = ['word','pdf','print'] (the formats that tool's PRD allows) */
/* views: false hides the View row (tools with a single document); defaultFormat picks the pre-selected format (default: the first) */
function downloadModal({ view, file, run, views = { teacher: 'Teacher View', student: 'Student View' }, formats = ['word', 'pdf'], defaultFormat }) {
  /* View = radio cards (real radio inputs, css/download-modal.css); Format = chips (toggle buttons, shared .chip style) */
  const card = (attr, v, label, on) => `<label class="dl-opt ${on ? 'on' : ''}"><input type="radio" name="dl-${attr}" data-${attr}="${v}" ${on ? 'checked' : ''}><span class="dl-dot" aria-hidden="true"></span><span class="dl-tx"><b>${label}</b></span></label>`;
  const chip = (v, label, on) => `<button type="button" class="chip ${on ? 'on' : ''}" data-xf="${v}" aria-pressed="${on}">${label}</button>`;
  if (formats.length === 1) return run(view, formats[0]); // the PRD gives one output format: download straight away, no modal
  const FMT = { word: ['Word', '.doc'], pdf: ['PDF', '.pdf'], print: ['Print', ''], both: ['Word and PDF', '.doc + .pdf'] };
  let fmt = defaultFormat || formats[0];
  $('#modalRoot').innerHTML = `<div class="overlay" id="ov"><div class="modal" role="dialog" aria-modal="true" aria-label="Download"><h3>Download</h3>
    ${views ? `<div class="field" style="margin-top:12px"><span class="lbl">View</span><div class="dl-opts">${card('xv', 'teacher', views.teacher, view === 'teacher')}${card('xv', 'student', views.student, view === 'student')}</div></div>` : ''}
    <div class="field" ${views ? '' : 'style="margin-top:12px"'}><span class="lbl">Format</span><div class="seg">${formats.map(f => chip(f, FMT[f][0], f === fmt)).join('')}</div></div>
    <p class="hint" id="xname"></p><div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px"><button class="btn" id="mn">Cancel</button><button class="btn primary" id="my">Download</button></div></div></div>`;
  const label = () => $('#xname').textContent = file(view) + FMT[fmt][1];
  const close = () => { $('#modalRoot').innerHTML = ''; };
  $('#mn').onclick = close; $('#ov').onclick = e => { if (e.target.id === 'ov') close(); }; label();
  $$('[data-xv]').forEach(b => b.onchange = () => { view = b.dataset.xv; $$('[data-xv]').forEach(x => x.closest('.dl-opt').classList.toggle('on', x === b)); label(); });
  $$('[data-xf]').forEach(b => b.onclick = () => { fmt = b.dataset.xf; $$('[data-xf]').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); }); label(); });
  $('#my').onclick = () => { close(); run(view, fmt); };
}

/* Shared PRINT button for every output toolbar: sits just left of Download.
   printBtn(id) gives the markup; bindPrint(id, { views, run }) wires it.
   views: true  -> a small dropdown (Student view / Teacher view); run(view) prints the one chosen
   views: false -> single-document tool: run() prints straight away */
const printBtn = id => `<button class="btn" id="${id}" type="button" aria-haspopup="menu" aria-expanded="false">${ic('print', 's')}<span class="lb">Print</span></button>`;
function bindPrint(id, { views = true, run }) {
  const btn = $('#' + id); if (!btn) return;
  if (!views) { btn.onclick = () => run(); return; }
  const close = () => { btn.parentNode.querySelector('.print-menu')?.remove(); btn.setAttribute('aria-expanded', 'false'); document.removeEventListener('mousedown', away, true); document.removeEventListener('keydown', key, true); };
  const away = e => { if (!e.target.closest('.print-menu') && e.target.closest('#' + id) !== btn) close(); };
  const key = e => { if (e.key === 'Escape') { e.stopImmediatePropagation(); close(); btn.focus(); } };
  btn.onclick = () => {
    if (btn.getAttribute('aria-expanded') === 'true') return close();
    btn.setAttribute('aria-expanded', 'true');
    btn.insertAdjacentHTML('afterend', `<div class="print-menu" role="menu"><button type="button" role="menuitem" data-pv="student">Student view</button><button type="button" role="menuitem" data-pv="teacher">Teacher view</button></div>`);
    const menu = btn.parentNode.querySelector('.print-menu'); menu.style.right = btn.parentNode.clientWidth - btn.offsetLeft - btn.offsetWidth + 'px';   // line the menu up under the Print button
    btn.parentNode.querySelectorAll('.print-menu [data-pv]').forEach(b => b.onclick = () => { close(); run(b.dataset.pv); });
    document.addEventListener('mousedown', away, true); document.addEventListener('keydown', key, true);
  };
}

/* Saves HTML as a Word-openable .doc file */
function downloadWord(name, bodyHTML, css = '') {
  const blob = new Blob([`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${esc(name)}</title><style>@page{size:A4;margin:20mm}body{font-family:Calibri,Arial;font-size:11pt}table{border-collapse:collapse;width:100%}th,td{border:1px solid #bbb;padding:4pt;text-align:left;vertical-align:top}${css}</style></head><body>${bodyHTML}</body></html>`], { type: 'application/msword' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name + '.doc'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
