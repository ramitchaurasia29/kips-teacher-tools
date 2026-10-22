/* Shared helpers used by every tool */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const navigate = h => { location.hash = h; };

let tokens = 98; // demo balance – replace with account API

/* Tiny localStorage-backed collection. Each tool creates its own: createStore('kips.<tool>') */
function createStore(key) {
  return {
    all() { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } },
    put(rec) { const l = this.all().filter(x => x.id !== rec.id); l.unshift(rec); try { localStorage.setItem(key, JSON.stringify(l.slice(0, 30))); } catch { } },
    get(id) { return this.all().find(x => x.id === id); },
  };
}

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2400);
}

function confirmModal({ title, body, ok = 'Continue', cancel = 'Cancel' }) {
  return new Promise(res => {
    $('#modalRoot').innerHTML = `<div class="overlay" id="ov"><div class="modal" role="dialog" aria-modal="true"><h3>${title}</h3><p class="muted" style="margin:6px 0 20px">${body}</p>
      <div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn" id="mn">${cancel}</button><button class="btn primary" id="my">${ok}</button></div></div></div>`;
    const done = v => { $('#modalRoot').innerHTML = ''; res(v); };
    $('#mn').onclick = () => done(false); $('#my').onclick = () => done(true); $('#ov').onclick = e => e.target.id === 'ov' && done(false);
  });
}

/* wire every [data-nav] link inside root (the router only does it once per route; forms that redraw call this) */
const bindNav = root => $$('[data-nav]', root || document).forEach(b => b.onclick = () => navigate(b.dataset.nav));
