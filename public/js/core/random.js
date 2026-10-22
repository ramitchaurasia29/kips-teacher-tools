/* Shared helpers for generation engines: seeded randomness and exact-total rounding */
const hashStr = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
function rngFrom(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const ri = (r, a, b) => a + Math.floor(r() * (b - a + 1));
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
function shuffle(r, arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const uniq = a => [...new Set(a.map(String))];
const cap = s => s[0].toUpperCase() + s.slice(1);

/* Split `total` across weights as whole numbers that add up exactly (largest remainder); every share >= 1 when total >= count */
function largestRemainder(weights, total) {
  const sum = weights.reduce((a, b) => a + b, 0) || 1, raw = weights.map(w => w * total / sum), out = raw.map(Math.floor);
  let left = total - out.reduce((a, b) => a + b, 0);
  raw.map((x, i) => [x - Math.floor(x), i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (left > 0) { out[i]++; left--; } });
  if (total >= weights.length) for (let i = 0; i < out.length; i++) if (out[i] === 0) { const m = out.indexOf(Math.max(...out)); out[m]--; out[i]++; }
  return out;
}
