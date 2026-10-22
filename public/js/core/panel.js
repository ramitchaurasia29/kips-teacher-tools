/* =========================================================
   Shared INPUT panel – every tool's input screen uses this layout:
   header (icon, title, subtitle, close) · scrollable body · sticky footer
   (warning banner + Cancel + Generate). Field helpers keep labels,
   required / optional markers and controls identical across tools.
   ========================================================= */
const ipReq = '<span class="req" aria-hidden="true">*</span>', ipOpt = '<span class="opt">(Optional)</span>';
const ipOptions = (opts, value, placeholder) => (placeholder != null ? `<option value="">${esc(placeholder)}</option>` : '') + opts.map(o => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(v)}" ${String(v) === String(value) ? 'selected' : ''}>${esc(l)}</option>`; }).join('');

/* A labelled field. o: { req, opt, hint, for, cls } */
function ifield(label, inner, o = {}) {
  return `<div class="ifld ${o.cls || ''}">${label ? `<label ${o.for ? `for="${o.for}"` : ''}>${label}${o.req ? ' ' + ipReq : ''}${o.opt ? ' ' + ipOpt : ''}</label>` : ''}${inner}${o.hint ? `<span class="ihint">${o.hint}</span>` : ''}</div>`;
}
const iselect = (id, opts, value, placeholder, extra = '') => `<select id="${id}" class="input isel" ${extra}>${ipOptions(opts, value, placeholder)}</select>`;

/* Bordered, scrollable list of checkbox / radio rows.
   rows: [{ label, checked, attrs, badge, group, disabled }]; a row with only `group` is a heading. */
function ilist(rows, { type = 'checkbox', name = '', empty = '', cols = 1 } = {}) {
  if (!rows.length) return `<div class="ilist empty">${esc(empty)}</div>`;
  return `<div class="ilist ${cols > 1 ? 'cols' : ''}" role="${type === 'radio' ? 'radiogroup' : 'group'}">${rows.map(r => r.heading
    ? `<div class="ihead">${esc(r.heading)}</div>`
    : `<label class="irow ${r.checked ? 'on' : ''}"><input type="${type}" ${name ? `name="${name}"` : ''} ${r.attrs || ''} ${r.checked ? 'checked' : ''} ${r.disabled ? 'disabled' : ''}><span class="itxt">${esc(r.label)}</span>${r.badge || ''}</label>`).join('')}</div>`;
}

/* "Selected textbook" card + locked (derived) field */
const ibook = (title, line) => `<div class="ibookc"><span class="icover" aria-hidden="true"></span><span><span class="ibl">SELECTED TEXTBOOK</span><b>${esc(title)}</b><small>${esc(line)}</small></span></div>`;
const ilocked = (label, value) => `<div class="ifld"><label>${label}</label><div class="ilock"><span>${esc(value)}</span>${ic('lock', 's')}</div></div>`;
const isec = t => `<div class="isec">${t}</div>`;

/* The panel. Wrap body fields; `issue` is the first thing still missing ('' when ready). */
function ipanel({ formId, title, body, issue = '', genId, genLabel, wide = false, tool = '' }) {
  const away = tool ? `data-bpclose="${tool}"` : 'data-nav="#/tools"'; // with `tool` the panel is a modal over the book picker; closing returns to it
  const form = `<div class="page ipage"><form id="${formId}" class="ipanel ${wide ? 'wide' : ''}" novalidate aria-labelledby="ipTitle">
    <header class="iph"><div class="iht"><h1 id="ipTitle">${esc(title)}</h1></div><button type="button" class="icon-btn" ${away} aria-label="Close">${ic('x')}</button></header>
    <div class="ipb">${body}</div>
    <footer class="ipf"><div id="ipIssue">${issue ? ipWarn(issue) : ''}</div><div class="ibtns"><button type="button" class="btn pill" ${away}>Cancel</button><button class="btn primary pill" id="${genId}" type="submit" ${issue ? 'disabled' : ''}>${ic('sparkle', 's')} ${genLabel}</button></div></footer></form></div>`;
  return tool ? bpShell(tool, form) : form;
}
/* =========================================================
   Searchable dropdown for chapters, topics and any other long list.
   multi: tick several (with a "Select all" row on top); single: pick one and it closes.
   options: [{ value, label, group? }]  (a new `group` value starts a heading)
   selected: array of values. onChange(values) is called after every change; the tool then redraws.
   Open state, search text and scroll survive that redraw (idrState + the observer below).
   ========================================================= */
const idrState = { open: null, q: {}, scroll: {}, pending: null }, idrCfg = {};
const idrVisible = c => { const q = (idrState.q[c.id] || '').trim().toLowerCase(); return c.options.filter(o => !q || `${o.label} ${o.group || ''}`.toLowerCase().includes(q)); };
const idrLabel = c => {
  const sel = c.selected.map(String), by = v => (c.options.find(o => String(o.value) === v) || {}).label;
  if (!sel.length) return c.placeholder;
  if (!c.multi) return by(sel[0]) || c.placeholder;
  return sel.length === 1 ? by(sel[0]) : sel.length === c.options.length ? `All selected (${sel.length})` : `${sel.length} selected`;
};
const idrBox = st => `<span class="idr-box ${st}" aria-hidden="true"></span>`;
function idrAllHTML(c) {
  const vis = idrVisible(c), n = vis.filter(o => c.selected.map(String).includes(String(o.value))).length, st = !vis.length || !n ? '' : n === vis.length ? 'on' : 'part';
  return `<div class="idr-row idr-all" data-idr-all="${c.id}" role="option" aria-selected="${st === 'on'}">${idrBox(st)}<span class="idr-t">${esc(c.allLabel)}</span><small>${c.selected.length} of ${c.options.length}</small></div>`;
}
function idrListHTML(c) {
  const vis = idrVisible(c), sel = c.selected.map(String); let last = null;
  if (!vis.length) return `<div class="idr-none">${esc(c.options.length ? 'No matches' : c.empty)}</div>`;
  return vis.map(o => {
    const head = o.group && o.group !== last ? `<div class="idr-head">${esc(o.group)}</div>` : ''; last = o.group || last;
    const on = sel.includes(String(o.value));
    return `${head}<div class="idr-row ${on ? 'on' : ''}" data-idr-v="${esc(o.value)}" data-idr="${c.id}" role="option" aria-selected="${on}">${c.multi ? idrBox(on ? 'on' : '') : ''}<span class="idr-t">${esc(o.label)}</span>${!c.multi && on ? ic('tick', 's') : ''}</div>`;
  }).join('');
}
function idropHTML(c) {
  c = { multi: false, selected: [], placeholder: 'Select', searchPlaceholder: 'Search', allLabel: 'Select all', empty: 'Nothing to choose from yet', disabled: false, ...c };
  idrCfg[c.id] = c;
  const open = idrState.open === c.id && !c.disabled;
  return `<div class="idr ${open ? 'open' : ''}" data-idr-root="${c.id}"><button type="button" class="input isel idr-btn ${c.selected.length ? '' : 'idr-ph'}" data-idr-toggle="${c.id}" aria-haspopup="listbox" aria-expanded="${open}" ${c.disabled ? 'disabled' : ''}><span>${esc(idrLabel(c))}</span></button>
    ${open ? `<div class="idr-pop"><label class="idr-search">${ic('search', 's')}<input type="text" data-idr-q="${c.id}" value="${esc(idrState.q[c.id] || '')}" placeholder="${esc(c.searchPlaceholder)}" autocomplete="off"></label>
      ${c.multi && c.options.length ? idrAllHTML(c) : ''}<div class="idr-list" data-idr-list="${c.id}" role="listbox" ${c.multi ? 'aria-multiselectable="true"' : ''}>${idrListHTML(c)}</div></div>` : ''}</div>`;
}
/* the field wrapper used by tools: label, control, hint */
const idrField = (label, c, o = {}) => ifield(label, idropHTML(c), o);

function idrRefresh(id) { const r = $(`[data-idr-root="${id}"]`); if (r && idrCfg[id]) { idrState.pending = id; r.outerHTML = idropHTML(idrCfg[id]); } }
function idrClose() { const id = idrState.open; idrState.open = null; if (id) { idrState.q[id] = ''; idrRefresh(id); } }
function idrSet(c, vals) { c.selected = vals; idrRefresh(c.id); c.onChange && c.onChange(vals); }

document.addEventListener('click', e => {
  const tg = e.target.closest('[data-idr-toggle]');
  if (tg) { const id = tg.dataset.idrToggle, was = idrState.open; if (was && was !== id) idrClose(); idrState.open = was === id ? null : id; idrState.q[id] = ''; idrState.scroll[id] = 0; idrRefresh(id); return; }
  const c = idrCfg[idrState.open], inside = e.target.closest('.idr-pop');
  const row = e.target.closest('[data-idr-v]'), all = e.target.closest('[data-idr-all]');
  if (row && c) {
    const v = row.dataset.idrV, was = c.selected.map(String);
    if (!c.multi) { idrState.open = null; idrState.q[c.id] = ''; return idrSet(c, [v]); }
    idrState.scroll[c.id] = $('[data-idr-list]')?.scrollTop || 0;
    return idrSet(c, c.options.map(o => String(o.value)).filter(x => x === v ? !was.includes(x) : was.includes(x)));
  }
  if (all && c) {
    const vis = idrVisible(c).map(o => String(o.value)), was = c.selected.map(String), every = vis.length && vis.every(v => was.includes(v));
    return idrSet(c, c.options.map(o => String(o.value)).filter(x => vis.includes(x) ? !every : was.includes(x)));
  }
  if (idrState.open && !inside) idrClose();
});
document.addEventListener('input', e => {
  const q = e.target.closest('[data-idr-q]'); if (!q) return;
  const c = idrCfg[q.dataset.idrQ]; idrState.q[c.id] = q.value;
  const l = $(`[data-idr-list="${c.id}"]`), a = $(`[data-idr-all="${c.id}"]`);
  if (l) l.innerHTML = idrListHTML(c); if (a) a.outerHTML = idrAllHTML(c);
});
/* Esc closes an open dropdown first (and stops there), so it doesn't also close the modal */
document.addEventListener('keydown', e => { if (e.key === 'Escape' && idrState.open) { e.stopImmediatePropagation(); idrClose(); } });
/* after any redraw: put the open dropdown's scroll and typing focus back, and keep it in view */
new MutationObserver(() => {
  const id = idrState.pending; if (!id || !idrState.open) { idrState.pending = null; return; }
  idrState.pending = null;
  const l = $(`[data-idr-list="${id}"]`), q = $(`[data-idr-q="${id}"]`); if (!l) return;
  l.scrollTop = idrState.scroll[id] || 0;
  if (q) { q.focus({ preventScroll: true }); q.setSelectionRange(q.value.length, q.value.length); }
  $(`[data-idr-root="${id}"] .idr-pop`)?.scrollIntoView({ block: 'nearest' });
}).observe(document.body, { childList: true, subtree: true });

/* Redraw a tool's input panel in place: only the body and footer are swapped, so the modal, the picker behind it
   and the scroll position stay put (no reload / fade flash). html = the tool's form view, bind = its bind function. */
function ipRedraw(html, bind) {
  const body = $('.ipb'), foot = $('.ipf'); if (!body || !foot) return;
  const t = document.createElement('div'); t.innerHTML = html;
  const nb = t.querySelector('.ipb'), nf = t.querySelector('.ipf'); if (!nb || !nf) return;
  const y = body.scrollTop;
  body.innerHTML = nb.innerHTML; foot.innerHTML = nf.innerHTML; body.scrollTop = y;
  bind();
}

const ipWarn = m =>`<div class="iwarn" role="alert">${ic('info', 's')}<span>${esc(m)}</span></div>`;
/* update the footer without redrawing the form (keeps typing focus) */
function ipRefresh(issue, genId) { const s = $('#ipIssue'); if (s) s.innerHTML = issue ? ipWarn(issue) : ''; const b = $('#' + genId); if (b) b.disabled = !!issue; }
