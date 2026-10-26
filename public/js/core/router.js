/* App shell: sidebar + hash router. Tools contribute their own routes via registerTool(). */
function renderSidebar(r) {
  const toolsActive = r.startsWith('/tools') || TOOLS.some(t => t.matches && t.matches(r));
  const items = [['#/tools', 'wrench', 'Teacher tools', toolsActive], ['#/books', 'book', 'Books'], ['#/assess', 'check', 'Assessments'], ['#/tasks', 'list', 'My tasks'], ['#/learn', 'open', 'Learn'], ['#/library', 'cube', 'My library'], ['#/history', 'history', 'History']];
  $('#sidebar').innerHTML = `<div class="sb-logo">K</div>` + items.map(([h, i, t, on], k) => `<button class="sb-btn ${on ? 'active' : ''} ${k > 3 ? 'sb-hide-m' : ''}" data-href="${h}" data-tip="${t}" aria-label="${t}">${ic(i)}</button>`).join('') + `<div class="sb-spacer"></div>`;
  $$('.sb-btn[data-href]').forEach(b => b.onclick = () => b.dataset.href === '#/tools' ? navigate('#/tools') : toast('Coming soon'));
}

function route() {
  const r = location.hash.replace('#', '') || '/tools', v = $('#view');
  v.classList.remove('bg-white', 'view-ag', 'view-asg', 'view-dlp', 'view-clp', 'view-ad', 'view-asg2', 'view-qb2', 'view-cs2', 'view-ws2', 'view-hw', 'view-pt', 'is-editing'); renderSidebar(r); document.onclick = null; window.scrollObs?.disconnect();
  if (r === '/tools') { v.innerHTML = hubView(); bindHub(); }
  else {
    let handled = false;
    for (const t of TOOLS) {
      for (const [pat, fn] of t.routes || []) {
        const m = typeof pat === 'string' ? (pat === r ? [r] : null) : r.match(pat);
        if (m) { handled = true; if (fn(m) === 'redirect') return; break; }
      }
      if (handled) break;
    }
    if (!handled) return navigate('#/tools');
  }
  $$('[data-nav]', v).forEach(b => b.onclick = () => navigate(b.dataset.nav)); // generic "go to hash" links
  $('#tokenCount').textContent = tokens; v.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);
