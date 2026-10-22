/* Shared EDIT formatting toolbar - every tool, every future tool.
   Appears under the top header whenever any [contenteditable="true"] exists inside #view
   (i.e. whenever a tool's Edit mode is on) and hides when editing ends. No per-tool wiring needed:
   a tool only has to make its content editable. Layout: undo/redo | block style | font | size |
   B I U S | align | lists | colour, highlight | link, image, table, quote, rule, code, clear. */
(() => {
  const FONTS = ['Inter', 'Plus Jakarta Sans', 'Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana'];
  const SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36];
  const BLOCKS = [['P', 'Paragraph'], ['H1', 'Heading 1'], ['H2', 'Heading 2'], ['H3', 'Heading 3']];
  const ICONS = {
    undo: '<path d="M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3"/>', redo: '<path d="m15 14 5-5-5-5M20 9H10a6 6 0 0 0 0 12h3"/>',
    bold: '<path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z"/>', italic: '<path d="M14 5h-4M14 19h-4M15 5l-6 14"/>',
    underline: '<path d="M7 4v7a5 5 0 0 0 10 0V4M5 20h14"/>', strike: '<path d="M5 12h14M16 7a4 3 0 0 0-4-2c-2.5 0-4 1.2-4 3 0 4 8 2.5 8 6.500 0 1.800-1.800 3-4 3a5 4 0 0 1-4.500-2.500"/>',
    left: '<path d="M4 6h16M4 10h10M4 14h16M4 18h10"/>', center: '<path d="M4 6h16M7 10h10M4 14h16M7 18h10"/>',
    right: '<path d="M4 6h16M10 10h10M4 14h16M10 18h10"/>', justify: '<path d="M4 6h16M4 10h16M4 14h16M4 18h16"/>',
    ul: '<path d="M9 6h11M9 12h11M9 18h11M4.500 6h.01M4.500 12h.01M4.500 18h.01"/>', ol: '<path d="M10 6h10M10 12h10M10 18h10M4 5l1-1v4M4 13.500h2l-2 3h2"/>',
    color: '<path d="m6 15 6-11 6 11M8 11h8"/>', hilite: '<path d="m4 20 1-4 9-9 3 3-9 9zM13 6l3-3 4 4-3 3"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.700 0l3-3a4 4 0 0 0-5.700-5.700l-1 1M14 10a4 4 0 0 0-5.700 0l-3 3A4 4 0 0 0 11 18.700l1-1"/>',
    image: '<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.500"/><path d="m4 17 5-4 4 3 3-2 4 3"/>',
    table: '<rect x="4" y="5" width="16" height="14" rx="1.500"/><path d="M4 10h16M4 14.500h16M10 5v14M15 5v14"/>',
    quote: '<path d="M7 7h4v5c0 3-2 4.500-4 5M14 7h4v5c0 3-2 4.500-4 5"/>', rule: '<path d="M5 12h14"/>',
    code: '<path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 5l-4 14"/>', clear: '<path d="m5 17 9-11 5 5-6 7H8zM9 21h11"/>',
    chev: '<path d="m6 9 6 6 6-6"/>',
  };
  const svg = n => `<svg class="i s" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`;
  const btn = (cmd, ic, title) => `<button type="button" class="et-b" data-cmd="${cmd}" title="${title}" aria-label="${title}">${svg(ic)}</button>`;
  const sep = '<span class="et-sep"></span>';
  const dd = (id, label, w) => `<div class="et-dd" id="${id}" style="width:${w}px"><button type="button" class="et-dd-b" aria-haspopup="listbox"><span class="et-dd-l">${label}</span>${svg('chev')}</button><div class="et-pop" role="listbox"></div></div>`;
  const colorBtn = (cmd, ic, title, def) => `<label class="et-b et-col" title="${title}" aria-label="${title}">${svg(ic)}<i style="background:${def}"></i><input type="color" data-color="${cmd}" value="${def}"></label>`;

  const bar = document.createElement('div');
  bar.id = 'editToolbar'; bar.className = 'edit-toolbar'; bar.hidden = true; bar.setAttribute('role', 'toolbar'); bar.setAttribute('aria-label', 'Text formatting');
  bar.innerHTML = [
    btn('undo', 'undo', 'Undo'), btn('redo', 'redo', 'Redo'), sep,
    dd('etBlock', 'Paragraph', 130), dd('etFont', 'Inter', 150), dd('etSize', '16', 84), sep,
    btn('bold', 'bold', 'Bold'), btn('italic', 'italic', 'Italic'), btn('underline', 'underline', 'Underline'), btn('strikeThrough', 'strike', 'Strikethrough'), sep,
    btn('justifyLeft', 'left', 'Align left'), btn('justifyCenter', 'center', 'Align centre'), btn('justifyRight', 'right', 'Align right'), btn('justifyFull', 'justify', 'Justify'), sep,
    btn('insertUnorderedList', 'ul', 'Bulleted list'), btn('insertOrderedList', 'ol', 'Numbered list'), sep,
    colorBtn('foreColor', 'color', 'Text colour', '#1d2140'), colorBtn('hiliteColor', 'hilite', 'Highlight', '#fff3a3'), sep,
    btn('link', 'link', 'Link'), btn('image', 'image', 'Image'), btn('table', 'table', 'Table'), btn('quote', 'quote', 'Quote'), btn('rule', 'rule', 'Divider'), btn('code', 'code', 'Code'), btn('clear', 'clear', 'Clear formatting'),
    '<input type="file" accept="image/*" hidden id="etFile">',
  ].join('');

  const mask = document.createElement('div'); mask.className = 'edit-toolbar-mask'; mask.hidden = true;
  let active = null, saved = null;                // last editable the user was in + its saved selection
  const view = () => document.getElementById('view');
  const editables = () => view() ? [...view().querySelectorAll('[contenteditable="true"]')] : [];
  const within = n => n && editables().find(e => e.contains(n.nodeType === 3 ? n.parentNode : n));

  function mount() {
    if (!view() || bar.isConnected) return;
    document.body.append(mask, bar);
    new MutationObserver(sync).observe(view(), { subtree: true, childList: true, attributes: true, attributeFilter: ['contenteditable'] });
    addEventListener('resize', place); view().addEventListener('scroll', place, { passive: true });
    sync();
  }
  /* floats just below the tool's own action toolbar (back | title | views | Save/Edit/Share), centred over the content */
  function place() {
    if (bar.hidden) return;
    const c = view().getBoundingClientRect(), tb = view().querySelector('.toolbar');
    const top = Math.max(tb ? tb.getBoundingClientRect().bottom : 0, c.top);
    bar.style.top = top + 10 + 'px'; bar.style.left = c.left + c.width / 2 + 'px'; bar.style.maxWidth = Math.max(280, c.width - 32) + 'px';
    /* reserve the strip the bar occupies so content starts below it and never scrolls underneath it */
    const h = bar.offsetHeight + 20, bg = getComputedStyle(view()).backgroundColor;
    view().style.setProperty('--et-space', h + 'px');
    mask.style.cssText = `top:${top}px;left:${c.left}px;width:${view().clientWidth}px;height:${h}px;background:${bg === 'rgba(0, 0, 0, 0)' ? getComputedStyle(document.body).backgroundColor : bg}`;
  }
  function sync() {
    const on = editables().length > 0; bar.hidden = mask.hidden = !on; view().classList.toggle('et-on', on);
    bar.classList.toggle('inline', editables().some(e => e.dataset.et === 'inline')); // inline mode: text styling only, no structural buttons (lists, headings, tables ...)
    if (!on) { active = saved = null; closePops(); view().style.removeProperty('--et-space'); } else place();
  }

  document.addEventListener('selectionchange', () => {
    const s = getSelection(); if (!s.rangeCount) return;
    const host = within(s.anchorNode); if (!host) return;
    active = host; saved = s.getRangeAt(0).cloneRange(); refreshState();
  });
  document.addEventListener('focusin', e => { const h = within(e.target); if (h) active = h; });

  function restore() {
    if (!active || !active.isConnected) return false;
    const s = getSelection(); if (within(s.anchorNode) === active) return true;
    active.focus(); if (saved) { s.removeAllRanges(); s.addRange(saved); }
    return true;
  }
  const notify = () => active && active.dispatchEvent(new Event('input', { bubbles: true }));
  const exec = (c, v) => { if (!restore()) return; document.execCommand('styleWithCSS', false, c === 'hiliteColor' || c === 'foreColor'); document.execCommand(c, false, v); notify(); refreshState(); };

  /* font size in px: execCommand only knows 1-7, so mark with size 7 then swap for a styled span */
  function setSize(px) {
    if (!restore()) return;
    document.execCommand('fontSize', false, '7');
    active.querySelectorAll('font[size="7"]').forEach(f => { const sp = document.createElement('span'); sp.style.fontSize = px + 'px'; sp.innerHTML = f.innerHTML; f.replaceWith(sp); });
    notify(); refreshState();
  }
  const html = h => exec('insertHTML', h);

  const actions = {
    link: () => { const u = prompt('Link address (https://...)'); if (u) exec('createLink', u); },
    image: () => bar.querySelector('#etFile').click(),
    table: () => html('<table style="border-collapse:collapse;width:100%"><tbody>' + '<tr>' + '<td style="border:1px solid #ccc;padding:8px">&nbsp;</td>'.repeat(3) + '</tr>'.repeat(1) + ('<tr>' + '<td style="border:1px solid #ccc;padding:8px">&nbsp;</td>'.repeat(3) + '</tr>').repeat(2) + '</tbody></table><p><br></p>'),
    quote: () => exec('formatBlock', 'BLOCKQUOTE'),
    rule: () => exec('insertHorizontalRule'),
    code: () => { const t = getSelection().toString(); html(`<code style="background:#f1f1f5;padding:1px 5px;border-radius:4px;font-family:ui-monospace,Consolas,monospace">${(t || 'code').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))}</code>&nbsp;`); },
    clear: () => { exec('removeFormat'); exec('formatBlock', 'P'); },
  };

  function refreshState() {
    if (bar.hidden) return;
    ['bold', 'italic', 'underline', 'strikeThrough', 'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull', 'insertUnorderedList', 'insertOrderedList'].forEach(c => {
      const b = bar.querySelector(`[data-cmd="${c}"]`); let on = false; try { on = document.queryCommandState(c); } catch (e) { }
      b.classList.toggle('on', on);
    });
    const set = (id, t) => bar.querySelector(`#${id} .et-dd-l`).textContent = t;
    let blk = ''; try { blk = String(document.queryCommandValue('formatBlock')).toUpperCase().replace(/[<>]/g, ''); } catch (e) { }
    set('etBlock', (BLOCKS.find(b => b[0] === blk) || BLOCKS[0])[1]);
    const n = getSelection().anchorNode, el = n && (n.nodeType === 3 ? n.parentNode : n);
    if (el && within(el)) { const cs = getComputedStyle(el); set('etSize', Math.round(parseFloat(cs.fontSize))); set('etFont', cs.fontFamily.split(',')[0].replace(/["']/g, '').trim()); }
  }

  function fill(id, items, pick, style) {
    const pop = bar.querySelector(`#${id} .et-pop`);
    pop.innerHTML = items.map(i => `<button type="button" role="option" data-v="${i[0]}" ${style ? `style="${style(i)}"` : ''}>${i[1]}</button>`).join('');
    pop.onmousedown = e => e.preventDefault();
    pop.onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; closePops(); pick(b.dataset.v); };
  }
  const closePops = () => bar.querySelectorAll('.et-dd.open').forEach(d => d.classList.remove('open'));
  fill('etBlock', BLOCKS, v => exec('formatBlock', v), i => i[0] === 'P' ? '' : `font-weight:700;font-size:${{ H1: 20, H2: 17, H3: 15 }[i[0]]}px`);
  fill('etFont', FONTS.map(f => [f, f]), v => exec('fontName', v), i => `font-family:'${i[0]}'`);
  fill('etSize', SIZES.map(s => [s, s]), v => setSize(+v));

  bar.addEventListener('mousedown', e => { if (!e.target.closest('input[type=color]')) e.preventDefault(); }); // keep the text selection
  bar.addEventListener('click', e => {
    const d = e.target.closest('.et-dd-b');
    if (d) { const box = d.parentNode, open = !box.classList.contains('open'); closePops(); box.classList.toggle('open', open); return; }
    const b = e.target.closest('[data-cmd]'); if (!b) return;
    const c = b.dataset.cmd; closePops();
    actions[c] ? actions[c]() : exec(c);
  });
  bar.addEventListener('input', e => {
    const c = e.target.dataset?.color; if (!c) return;
    e.target.parentNode.querySelector('i').style.background = e.target.value;
    exec(c, e.target.value);
  });
  bar.addEventListener('change', e => {
    if (e.target.id !== 'etFile' || !e.target.files[0]) return;
    const r = new FileReader(); r.onload = () => { exec('insertImage', r.result); }; r.readAsDataURL(e.target.files[0]); e.target.value = '';
  });
  document.addEventListener('mousedown', e => { if (!bar.contains(e.target)) closePops(); });

  /* Shared look of the edit buttons so every tool stays in sync:
     sec(btn,on) - a section's pencil turns into a red "save Save" pill while that section is open;
     top(btn,on) - the top Edit button turns into a red "save Save" button while anything is open. */
  window.editUI = {
    sec(b, on) { b.dataset.sz ||= b.querySelector('svg.xs') ? 'xs' : 's'; b.classList.toggle('on', on); b.innerHTML = on ? `${ic('save', 's')}<span class="lb">Save</span>` : ic('edit', b.dataset.sz); b.title = on ? 'Save this section' : 'Edit'; },
    top(b, on) { b.className = 'btn' + (on ? ' soft' : ''); b.innerHTML = `${ic(on ? 'save' : 'edit', 's')}<span class="lb">${on ? 'Save' : 'Edit'}</span>`; },
  };

  /* locked parts: while any part is open for editing, hovering or clicking a fixed element with its own text says it cannot be edited.
     Nothing is blocked or changed here (the tools already keep those parts non-editable); controls and editable text are skipped. */
  const tip = document.createElement('div'); tip.className = 'et-lock-tip'; tip.hidden = true; tip.textContent = 'This element cannot be edited';
  let tipTimer = 0;
  const hideTip = () => { clearTimeout(tipTimer); tip.hidden = true; };
  const lockedTarget = t => {
    const v = view(); if (!v || !v.classList.contains('et-on') || !(t instanceof Element) || !v.contains(t)) return null;
    if (t.closest('[contenteditable="true"],button,a,input,select,textarea,label,[data-edit],.toolbar,.edit-toolbar,.no-print')) return null;
    return [...t.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) ? t : null;
  };
  const showTip = (e, auto) => {
    if (!tip.isConnected) document.body.append(tip);
    tip.hidden = false; tip.style.left = Math.min(e.clientX + 12, innerWidth - tip.offsetWidth - 8) + 'px'; tip.style.top = e.clientY + 16 + 'px';
    clearTimeout(tipTimer); if (auto) tipTimer = setTimeout(hideTip, 1500);
  };
  document.addEventListener('mouseover', e => { clearTimeout(tipTimer); if (lockedTarget(e.target)) tipTimer = setTimeout(() => showTip(e), 350); else hideTip(); });
  document.addEventListener('mouseout', hideTip);
  document.addEventListener('click', e => { if (lockedTarget(e.target)) showTip(e, true); });
  document.addEventListener('scroll', hideTip, true);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
