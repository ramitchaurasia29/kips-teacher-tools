/* Tools hub – the central screen listing every registered tool */
let hubFilter = 'All', hubQuery = '';

function hubView() {
  const cats = ['All', ...new Set(TOOLS.map(t => t.cat))];
  const list = TOOLS.filter(t => (hubFilter === 'All' || t.cat === hubFilter) && (t.name + t.desc).toLowerCase().includes(hubQuery.toLowerCase()));
  const recent = TOOLS.map(t => (t.recent ? t.recent(6) : '')).join('');
  return `<div class="page"><div class="hub-hero"><div class="eyebrow">Teacher AI Tools</div><h1>What would you like to create today?</h1><p>Pick a tool, fill in a few inputs, and get classroom-ready material you can edit, print and share.</p></div>
  <div class="hub-tools"><div class="chips">${cats.map(c => `<button class="chip ${c === hubFilter ? 'on' : ''}" data-cat="${c}">${c}</button>`).join('')}</div><label class="search">${ic('search')}<input id="hubSearch" placeholder="Search tools" value="${esc(hubQuery)}" aria-label="Search tools"></label></div>
  <div class="tool-grid">${list.map(t => `<button class="card tool ${t.ready ? '' : 'soon'}" data-tool="${t.id}"><div style="display:flex;justify-content:space-between"><span class="tool-ico">${ic(t.icon)}</span>${t.isNew ? '<span class="pill new">NEW</span>' : t.ready ? '' : '<span class="pill">Coming soon</span>'}</div><h3>${t.name}</h3><p>${t.desc}</p><div class="tool-foot"><span>${t.cat}</span><span class="cost"><span class="coin"></span>${t.cost} tokens</span></div></button>`).join('') || '<p class="muted">No tools match your search.</p>'}</div>${recent}</div>`;
}

function bindHub() {
  const redraw = () => { $('#view').innerHTML = hubView(); bindHub(); };
  $$('[data-cat]').forEach(b => b.onclick = () => { hubFilter = b.dataset.cat; redraw(); });
  $('#hubSearch').oninput = e => { hubQuery = e.target.value; const p = e.target.selectionStart; redraw(); const i = $('#hubSearch'); i.focus(); i.setSelectionRange(p, p); };
  $$('.tool').forEach(b => b.onclick = () => { const t = TOOLS.find(x => x.id === b.dataset.tool); t.ready ? navigate('#' + t.base) : toast(t.name + ' is coming soon'); });
}
