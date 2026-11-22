// Φτιάχνει τις εικόνες κοινοποίησης (og:image, 1200×630) στο static/og/.
// Τρέχει τοπικά όταν αλλάζει το design· οι PNG μπαίνουν στο repo, οπότε το build δεν τις χρειάζεται.
// Χρήση: node scripts/og-images.mjs   (θέλει rsvg-convert και γραμματοσειρά DejaVu Sans)
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { SIGNS } from '../src/content/signs.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'static/og');
const TMP = join(tmpdir(), 'zs-og');
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

const EL = { fire: ['#ff7d5c', '#4a2018'], earth: ['#3fd394', '#12382a'], air: ['#ffcf4a', '#3f3214'], water: ['#6aa5ff', '#172c55'] };
const VS = '︎'; // σύμβολο κειμένου, όχι emoji
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

// Σταθερά «αστέρια» (ίδια σε κάθε εικόνα)
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const stars = Array.from({ length: 90 }, () => `<circle cx="${(rnd() * 1200).toFixed(1)}" cy="${(rnd() * 630).toFixed(1)}" r="${(0.6 + rnd() * 1.6).toFixed(2)}" fill="#fff" opacity="${(0.25 + rnd() * 0.6).toFixed(2)}"/>`).join('');

const frame = (inner, brand = true) => `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs><radialGradient id="bg" cx="85%" cy="0%" r="120%"><stop offset="0" stop-color="#3a1f8f"/><stop offset="1" stop-color="#160e45"/></radialGradient></defs>
<rect width="1200" height="630" fill="url(#bg)"/>${stars}
${inner}
${brand ? '' : '<!--'}<text x="80" y="566" font-family="DejaVu Sans" font-weight="bold" font-size="34" fill="#ffd166">☉${VS} Ζώδια Σήμερα</text>${brand ? '' : '-->'}
<text x="1120" y="566" text-anchor="end" font-family="DejaVu Sans" font-size="28" fill="#c9bff0">zodiasimera.com</text>
</svg>`;

function signSvg(s) {
  const [c, soft] = EL[s.element];
  const title = s.name;
  const size = title.length > 8 ? 92 : 108;
  return frame(`
<circle cx="290" cy="275" r="170" fill="${soft}" stroke="${c}" stroke-width="6"/>
<text x="290" y="345" text-anchor="middle" font-family="DejaVu Sans" font-size="190" fill="${c}">${s.symbol}${VS}</text>
<text x="520" y="235" font-family="DejaVu Sans" font-weight="bold" font-size="${size}" fill="#f6f2ff">${esc(title)}</text>
<text x="524" y="315" font-family="DejaVu Sans" font-size="46" fill="#ff6fb2">σήμερα και αύριο</text>
<text x="524" y="385" font-family="DejaVu Sans" font-size="32" fill="#c9bff0">${esc(s.dates)}</text>`);
}

function defaultSvg() {
  const ring = SIGNS.map((s, i) => {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const x = 900 + Math.cos(a) * 190, y = 285 + Math.sin(a) * 190;
    return `<text x="${x.toFixed(1)}" y="${(y + 19).toFixed(1)}" text-anchor="middle" font-family="DejaVu Sans" font-size="54" fill="${EL[s.element][0]}">${s.symbol}${VS}</text>`;
  }).join('');
  return frame(`
<circle cx="900" cy="285" r="235" fill="none" stroke="#ffffff33" stroke-width="2"/>
<circle cx="900" cy="285" r="140" fill="none" stroke="#ffffff22" stroke-width="2"/>
<text x="900" y="285" text-anchor="middle" dominant-baseline="central" font-family="DejaVu Sans" font-size="110" fill="#ffd166">☉${VS}</text>
${ring}
<text x="80" y="220" font-family="DejaVu Sans" font-weight="bold" font-size="92" fill="#f6f2ff">Ζώδια</text>
<text x="80" y="320" font-family="DejaVu Sans" font-weight="bold" font-size="92" fill="#f6f2ff">Σήμερα</text>
<text x="84" y="395" font-family="DejaVu Sans" font-size="34" fill="#ff6fb2">Προβλέψεις για τα 12 ζώδια</text>
<text x="84" y="443" font-family="DejaVu Sans" font-size="28" fill="#c9bff0">από τις πραγματικές θέσεις των πλανητών</text>`, false);
}

// Εικόνα για χειρόγραφο άρθρο Πανσελήνου (π.χ. υπερπανσέληνος)
function moonSvg({ kicker, title, line1, line2 }) {
  const craters = [[-60, -40, 34], [55, 20, 26], [-15, 70, 20], [40, -75, 16], [-80, 45, 14], [10, -10, 12]]
    .map(([x, y, r]) => `<circle cx="${990 + Math.round(x * .85)}" cy="${300 + Math.round(y * .85)}" r="${Math.round(r * .85)}" fill="#d9cfa8" opacity=".55"/>`).join('');
  return frame(`
<defs><radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset=".55" stop-color="#fff3c4" stop-opacity=".45"/><stop offset="1" stop-color="#fff3c4" stop-opacity="0"/></radialGradient>
<radialGradient id="moon" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#fffbea"/><stop offset=".7" stop-color="#f3e6b6"/><stop offset="1" stop-color="#d8c58a"/></radialGradient></defs>
<circle cx="990" cy="300" r="255" fill="url(#glow)"/>
<circle cx="990" cy="300" r="175" fill="url(#moon)"/>${craters}
<text x="80" y="140" font-family="DejaVu Sans" font-weight="bold" font-size="30" fill="#ff6fb2" letter-spacing="2">${esc(kicker)}</text>
<text x="80" y="235" font-family="DejaVu Sans" font-weight="bold" font-size="64" fill="#f6f2ff">${esc(title[0])}</text>
<text x="80" y="315" font-family="DejaVu Sans" font-weight="bold" font-size="64" fill="#f6f2ff">${esc(title[1])}</text>
<text x="82" y="395" font-family="DejaVu Sans" font-size="32" fill="#ffd166">${esc(line1)}</text>
<text x="82" y="443" font-family="DejaVu Sans" font-size="27" fill="#c9bff0">${esc(line2)}</text>`);
}

const jobs = [['zodia-simera', defaultSvg()], ...SIGNS.map((s) => [s.slug, signSvg(s)]),
  ['panselinos-dekemvriou-2026', moonSvg({ kicker: 'ΠΕΜΠΤΗ 24 ΔΕΚΕΜΒΡΙΟΥ 2026', title: ['Υπερπανσέληνος', 'των Χριστουγέννων'], line1: 'Η πιο κοντινή Πανσέληνος της χρονιάς', line2: '03:28 ώρα Ελλάδας · Σελήνη στον Καρκίνο' })]];
for (const [name, svg] of jobs) {
  const svgFile = join(TMP, `${name}.svg`);
  writeFileSync(svgFile, svg);
  execFileSync('rsvg-convert', ['-w', '1200', '-h', '630', '-o', join(OUT, `${name}.png`), svgFile]);
}
rmSync(TMP, { recursive: true, force: true });
console.log(`Έγιναν ${jobs.length} εικόνες στο ${OUT}`);
