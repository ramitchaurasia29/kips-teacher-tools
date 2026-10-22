/* Shared DOWNLOAD modal - used wherever a tool offers a Student / Teacher view in Word, PDF or Print.
   downloadModal({ view: 'teacher'|'student', file: view => 'File_name', run: (view, fmt) => {...} })
   fmt is 'word' | 'pdf' | 'print'. The tool decides how to produce each format; the modal and its CTA ("Download") stay identical. */
/* Optional: views = { teacher: 'Teacher Guide', student: 'Student Worksheet' } (labels), formats = ['word','pdf','print'] (the formats that tool's PRD allows) */
/* views: false hides the View row (tools with a single document); defaultFormat picks the pre-selected format (default: the first) */
function downloadModal({ view, file, run, views = { teacher: 'Teacher View', student: 'Student View' }, formats = ['word', 'pdf', 'print'], defaultFormat }) {
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

/* Saves HTML as a Word-openable .doc file */
function downloadWord(name, bodyHTML, css = '') {
  const blob = new Blob([`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${esc(name)}</title><style>@page{size:A4;margin:20mm}body{font-family:Calibri,Arial;font-size:11pt}table{border-collapse:collapse;width:100%}th,td{border:1px solid #bbb;padding:4pt;text-align:left;vertical-align:top}${css}</style></head><body>${bodyHTML}</body></html>`], { type: 'application/msword' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name + '.doc'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
