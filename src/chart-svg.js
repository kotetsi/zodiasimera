// Σχέδιο ζωδιακού τροχού σε SVG. Χρησιμοποιείται στο build και στον browser.
import { SIGNS, BODY_NAMES, ASPECT_NAMES } from './content/signs.js';

export const fmtDeg = (deg) => {
  const total = Math.floor(deg * 60 + 1e-9);
  return `${Math.floor(total / 60)}°${String(total % 60).padStart(2, '0')}′`;
};

const f = (n) => n.toFixed(1);

// pos: { body: { lon, sign, deg, retro } }
// options.houses: { asc, mc, cusps } → ο τροχός στρέφεται ώστε ο ωροσκόπος να είναι αριστερά
// options.aspects: λίστα όψεων { a, b, aspect } για τις γραμμές στο κέντρο
// options.interactive: τα σύμβολα και οι γραμμές παίρνουν data-key για επιλογή με κλικ
export function wheelSvg(pos, { houses = null, aspects = [], label = 'Ζωδιακός τροχός', interactive = false } = {}) {
  const cx = 200, cy = 200;
  const rot = houses ? houses.asc : 0;
  const pt = (lon, r) => [cx - r * Math.cos((lon - rot) * Math.PI / 180), cy + r * Math.sin((lon - rot) * Math.PI / 180)];
  const line = (a, b, attrs) => `<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}" ${attrs}/>`;
  const parts = [];
  parts.push(`<circle cx="${cx}" cy="${cy}" r="190" fill="var(--surface)" stroke="var(--line)"/>`);
  parts.push(`<circle cx="${cx}" cy="${cy}" r="150" fill="none" stroke="var(--line)"/>`);
  parts.push(`<circle cx="${cx}" cy="${cy}" r="88" fill="none" stroke="var(--line)"/>`);
  for (let i = 0; i < 12; i++) {
    parts.push(line(pt(i * 30, 150), pt(i * 30, 190), 'stroke="var(--line)"'));
    const [gx, gy] = pt(i * 30 + 15, 170);
    parts.push(`<text x="${f(gx)}" y="${f(gy)}" text-anchor="middle" dominant-baseline="central" font-size="19" style="font-family:var(--sym);fill:var(--${SIGNS[i].element})">${SIGNS[i].symbol}︎</text>`);
  }
  for (let d = 0; d < 360; d += 5) parts.push(line(pt(d, 150), pt(d, d % 10 === 0 ? 144 : 147), 'stroke="var(--line)"'));

  if (houses) {
    houses.cusps.forEach((c, i) => {
      const axis = i === 0 || i === 3 || i === 6 || i === 9;
      parts.push(line(pt(c, 88), pt(c, axis ? 196 : 150), `stroke="${axis ? 'var(--ink)' : 'var(--line)'}" stroke-width="${axis ? 1.4 : 1}"`));
      const next = houses.cusps[(i + 1) % 12];
      const mid = c + (((next - c) % 360) + 360) % 360 / 2;
      const [hx, hy] = pt(mid, 96);
      parts.push(`<text x="${f(hx)}" y="${f(hy)}" text-anchor="middle" dominant-baseline="central" font-size="8.5" style="fill:var(--muted);font-family:var(--body)">${i + 1}</text>`);
    });
    const [ax, ay] = pt(houses.asc, 198), [mx, my] = pt(houses.mc, 198);
    const ang = (key, txt, x, y, anchor) => {
      const t = `<text x="${f(x)}" y="${f(y)}" text-anchor="${anchor}" font-size="10" style="fill:var(--ink);font-family:var(--body);font-weight:600">${txt}</text>`;
      return interactive ? `<g class="wpl" data-key="${key}"><circle cx="${f(anchor === 'end' ? x - 8 : x + 8)}" cy="${f(y - 3)}" r="11" fill="transparent"/>${t}</g>` : t;
    };
    parts.push(ang('asc', 'ΩΡ', ax - 2, ay - 6, 'end'));
    parts.push(ang('mc', 'ΜΟ', mx + 6, my + 2, 'start'));
  }

  // απλώνουμε τα σύμβολα που πέφτουν πολύ κοντά
  const items = Object.keys(pos).filter((b) => BODY_NAMES[b]).map((b) => ({ b, lon: pos[b].lon, show: pos[b].lon })).sort((a, b) => a.lon - b.lon);
  for (let pass = 0; pass < 40; pass++) {
    for (let i = 0; i < items.length; i++) {
      const a = items[i], n = items[(i + 1) % items.length];
      if (items.length < 2) break;
      // υπογεγραμμένη απόσταση: αν δύο σύμβολα «διασταυρωθούν», ξαναχωρίζουν αντί να κολλήσουν
      const gap = ((n.show - a.show + 540) % 360) - 180;
      if (gap < 10) { a.show -= (10 - gap) / 2; n.show += (10 - gap) / 2; }
    }
  }
  for (const it of items) {
    parts.push(line(pt(it.lon, 150), pt(it.lon, 137), 'stroke="var(--violet)" stroke-width="1.5"'));
    const [px, py] = pt(it.show, 121);
    const p = pos[it.b];
    if (interactive) parts.push(`<g class="wpl" data-key="${it.b}"><circle cx="${f(px)}" cy="${f(py)}" r="10.5" class="wpl-bg"/>`);
    parts.push(`<text x="${f(px)}" y="${f(py)}" text-anchor="middle" dominant-baseline="central" font-size="20" style="font-family:var(--sym)"><title>${BODY_NAMES[it.b].short} ${fmtDeg(p.deg)} ${SIGNS[p.sign].name}${p.retro ? ' (ανάδρομος)' : ''}</title>${BODY_NAMES[it.b].glyph}︎</text>`);
    if (p.retro) {
      const [rx, ry] = pt(it.show, 106);
      parts.push(`<text x="${f(rx)}" y="${f(ry)}" text-anchor="middle" dominant-baseline="central" font-size="8" style="fill:var(--brass);font-family:var(--body);font-weight:600">R</text>`);
    }
    if (interactive) parts.push('</g>');
  }
  for (const a of aspects) {
    if (a.aspect === 'conjunction' || !pos[a.a] || !pos[a.b]) continue;
    const hard = ASPECT_NAMES[a.aspect].harmony < 0;
    const key = interactive ? ` class="wasp" data-key="${a.a}|${a.aspect}|${a.b}"` : '';
    parts.push(line(pt(pos[a.a].lon, 88), pt(pos[a.b].lon, 88), `stroke="${hard ? 'var(--brass)' : 'var(--violet)'}" stroke-opacity="0.8"${hard ? ' stroke-dasharray="4 3"' : ''}${key}`));
  }
  return `<svg class="wheel${interactive ? ' wheel-live' : ''}" viewBox="-22 -10 444 420" role="img" aria-label="${label}">${parts.join('')}</svg>`;
}
