import config from '../config.js';

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Σύμβολα σε μορφή κειμένου (όχι emoji)
export const glyph = (g) => `<span class="g">${g}︎</span>`;

const CSS = `
/* Ζωντανή, νεανική παλέτα: ματζέντα και βιολετί για τόνο, κίτρινο ήλιου, χρώμα ανά στοιχείο ζωδίου (φωτιά, γη, αέρας, νερό) */
:root {
  --paper: #fbf8ff; --surface: #ffffff; --ink: #1d1640; --muted: #655d8c; --line: #e8e2f6;
  --brass: #d81b73; --brass-soft: #ffe2ef; --violet: #6236ff; --violet-soft: #ece6ff; --sun: #ffb703;
  --chip: #f2edff; --danger: #c8264b;
  --fire: #f0441c; --fire-soft: #ffe7df; --earth: #12925c; --earth-soft: #daf5e7;
  --air: #b77900; --air-soft: #fff0c2; --water: #1f6fff; --water-soft: #e0ebff;
  --night: #241763; --night-2: #3a1f8f;
  --display: 'Comfortaa', 'Commissioner', system-ui, sans-serif;
  --body: 'Commissioner', 'Segoe UI', system-ui, sans-serif;
  --sym: 'Noto Sans Symbols', 'Segoe UI Symbol', 'Apple Symbols', sans-serif;
  --step-0: 1rem; --step-1: 1.2rem; --step-2: 1.5rem; --step-3: 2rem; --step-4: 2.75rem;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --paper: #120d2b; --surface: #1c1542; --ink: #f4f0ff; --muted: #b3aad8; --line: #33295f;
  --brass: #ff5ca8; --brass-soft: #4b1b3c; --violet: #a184ff; --violet-soft: #2d2263; --sun: #ffc93c;
  --chip: #281f55; --danger: #ff7c95;
  --fire: #ff7d5c; --fire-soft: #4a2018; --earth: #3fd394; --earth-soft: #12382a;
  --air: #ffcf4a; --air-soft: #3f3214; --water: #6aa5ff; --water-soft: #172c55;
  --night: #0c0822; --night-2: #231660; color-scheme: dark; } }
:root[data-theme="dark"] {
  --paper: #120d2b; --surface: #1c1542; --ink: #f4f0ff; --muted: #b3aad8; --line: #33295f;
  --brass: #ff5ca8; --brass-soft: #4b1b3c; --violet: #a184ff; --violet-soft: #2d2263; --sun: #ffc93c;
  --chip: #281f55; --danger: #ff7c95;
  --fire: #ff7d5c; --fire-soft: #4a2018; --earth: #3fd394; --earth-soft: #12382a;
  --air: #ffcf4a; --air-soft: #3f3214; --water: #6aa5ff; --water-soft: #172c55;
  --night: #0c0822; --night-2: #231660; color-scheme: dark; }
.el-fire { --el: var(--fire); --el-soft: var(--fire-soft); }
.el-earth { --el: var(--earth); --el-soft: var(--earth-soft); }
.el-air { --el: var(--air); --el-soft: var(--air-soft); }
.el-water { --el: var(--water); --el-soft: var(--water-soft); }
* { box-sizing: border-box; }
body { margin: 0; background: var(--paper); color: var(--ink); font: 400 var(--step-0)/1.65 var(--body);
  padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
a { color: inherit; text-decoration-color: var(--brass); text-underline-offset: 3px; }
a:hover { color: var(--brass); }
a:focus-visible, button:focus-visible { outline: 2px solid var(--brass); outline-offset: 2px; border-radius: 2px; }
.g { font-family: var(--sym); font-style: normal; color: var(--brass); }
.wrap { max-width: 68rem; margin: 0 auto; }
header.site { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 24px;
  padding-block: 20px 14px; border-bottom: 1px solid var(--line); }
.brand { font-family: var(--display); font-weight: 700; font-size: var(--step-3); line-height: 1; text-decoration: none; color: var(--violet); }
.brand:hover { color: var(--brass); }
.brand .g { font-size: .8em; margin-right: .2em; color: var(--sun); }
nav.main { display: flex; flex-wrap: wrap; gap: 6px; font-size: .9rem; }
nav.main a { text-decoration: none; color: var(--muted); padding: 4px 11px; border-radius: 999px; font-weight: 500; }
nav.main a:hover { color: var(--violet); background: var(--violet-soft); }
nav.main a[aria-current] { color: #fff; background: var(--violet); }
main { padding-block: 28px 48px; display: grid; gap: 40px; }
h1, h2, h3 { font-family: var(--display); font-weight: 700; line-height: 1.2; letter-spacing: -.01em; text-wrap: balance; margin: 0; }
h1 { font-size: var(--step-4); }
h2 { font-size: var(--step-3); }
h3 { font-size: var(--step-2); font-weight: 600; }
p { margin: 0; max-width: 65ch; }
.eyebrow { font-size: .76rem; letter-spacing: .12em; text-transform: uppercase; color: var(--brass); font-weight: 600; }
.lede { font-size: var(--step-1); color: var(--muted); max-width: 60ch; }
.stack { display: grid; gap: 14px; }
.stack-lg { display: grid; gap: 24px; }
.num { font-variant-numeric: tabular-nums; }
.muted { color: var(--muted); }
.panel { background: var(--surface); border: 1px solid var(--line); border-radius: 18px; padding: 22px; }
.split { display: grid; gap: 32px; grid-template-columns: minmax(0, 1fr); }
@media (min-width: 860px) { .split { grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); align-items: start; } }
.wheel { width: 100%; max-width: 460px; height: auto; display: block; margin-inline: auto; }
.wheel text { fill: var(--ink); }
.facts { display: grid; gap: 0; margin: 0; }
.facts > div { display: grid; grid-template-columns: 9.5rem minmax(0, 1fr); gap: 12px; padding: 9px 0; border-bottom: 1px solid var(--line); }
.facts dt { color: var(--muted); font-size: .9rem; }
.facts dd { margin: 0; }
.signs { display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 15rem), 1fr)); }
.sign-card { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 4px 14px; align-items: center; text-decoration: none;
  padding: 16px; background: var(--surface); border: 1px solid var(--line); border-radius: 18px; }
.sign-card:hover { border-color: var(--el, var(--brass)); color: inherit; transform: translateY(-2px); box-shadow: 0 8px 24px -12px var(--el, var(--brass)); }
.sign-card .g { font-size: 1.7rem; grid-row: span 2; line-height: 1; width: 3.1rem; height: 3.1rem; display: grid; place-items: center; border-radius: 50%; color: var(--el); background: var(--el-soft); }
.sign-card strong { font-family: var(--display); font-size: var(--step-1); font-weight: 700; line-height: 1.1; }
.sign-card small { color: var(--muted); font-size: .82rem; }
.ratings { display: flex; flex-wrap: wrap; gap: 8px 22px; font-size: .9rem; }
.rating { display: inline-flex; align-items: center; gap: 8px; }
.dots { display: inline-flex; gap: 3px; }
.dots i { width: 9px; height: 9px; border-radius: 50%; background: var(--chip); }
.dots i.on { background: var(--dot, var(--brass)); }
.r-love { --dot: var(--brass); } .r-work { --dot: var(--violet); } .r-mood { --dot: var(--sun); }
table { border-collapse: collapse; width: 100%; font-variant-numeric: tabular-nums; }
.table-wrap { overflow-x: auto; }
th, td { text-align: left; padding: 8px 12px 8px 0; border-bottom: 1px solid var(--line); vertical-align: top; }
th { font-weight: 500; color: var(--muted); font-size: .82rem; letter-spacing: .06em; text-transform: uppercase; }
.pill { display: inline-block; font-size: .75rem; padding: 1px 8px; border-radius: 999px; background: var(--brass-soft); color: var(--brass); font-weight: 700; letter-spacing: .03em; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip { font-size: .85rem; padding: 5px 12px; border-radius: 999px; background: var(--chip); text-decoration: none; font-weight: 500; }
.chip:hover { background: var(--violet-soft); color: var(--violet); }
.reading { display: grid; gap: 14px; font-size: 1.06rem; }
.advice { background: var(--violet-soft); border-radius: 14px; padding: 12px 16px; font-weight: 500; }
.day-head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 6px 16px; }
.hero-sign { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 4px 18px; align-items: center; }
.hero-sign .g { font-size: 3.4rem; line-height: 1; grid-row: span 2; width: 5.4rem; height: 5.4rem; display: grid; place-items: center; border-radius: 50%; color: var(--el); background: var(--el-soft); }
ul.plain { margin: 0; padding-left: 1.1em; display: grid; gap: 4px; }
.compat-grid { overflow-x: auto; }
.compat-grid table { min-width: 640px; }
.compat-grid td, .compat-grid th { text-align: center; padding: 6px 4px; }
.compat-grid a { text-decoration: none; display: block; border-radius: 3px; }
.score { font-weight: 600; }
.ad { margin-block: 8px; min-height: 0; }
details summary { cursor: pointer; color: var(--muted); }
.natal-form { display: grid; gap: 14px 18px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr)); align-items: end; }
.natal-form .wide { grid-column: 1 / -1; }
.field { display: grid; gap: 6px; font-size: .9rem; }
.field > span { color: var(--muted); }
.field input, .field select { font: inherit; color: var(--ink); background: var(--paper); border: 1.5px solid var(--line); border-radius: 12px; padding: 9px 10px; width: 100%; min-width: 0; }
.field input:focus, .field select:focus { outline: 2px solid var(--brass); outline-offset: 1px; }
.field input:disabled { opacity: .5; }
.check { display: flex; gap: 8px; align-items: center; font-size: .9rem; padding-bottom: 10px; }
.check input { accent-color: var(--brass); width: 18px; height: 18px; }
.custom-grid { display: grid; gap: 12px 18px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr)); margin-block: 12px; }
.btn { font: 700 1rem var(--body); color: #fff; background: var(--brass); border: 0; border-radius: 999px; padding: 12px 24px; cursor: pointer; box-shadow: 0 6px 18px -8px var(--brass); }
.btn:hover { background: var(--violet); box-shadow: 0 6px 18px -8px var(--violet); }
.error { color: var(--danger); font-weight: 500; }
.trio { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr)); }
.trio h3 .g { font-size: .9em; }
.readings { display: grid; gap: 22px 32px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr)); }
.readings h3 { font-size: var(--step-1); font-family: var(--display); }
.birth-details > summary { font-weight: 500; color: var(--ink); padding-block: 6px; }
.birth-details[open] > summary { margin-bottom: 12px; }
.day-nav { display: flex; flex-wrap: wrap; gap: 6px; }
.btn-ghost { font: 600 .88rem var(--body); color: var(--violet); background: var(--violet-soft); border: 0; border-radius: 999px; padding: 6px 12px; cursor: pointer; }
.btn-ghost:hover:not(:disabled) { background: var(--violet); color: #fff; }
.btn-ghost:disabled { opacity: .45; cursor: default; }
.events { list-style: none; margin: 0; padding: 0; display: grid; }
.event { display: grid; grid-template-columns: 9.5rem minmax(0, 1fr); gap: 6px 20px; padding-block: 16px; border-bottom: 1px solid var(--line); }
.event .when { color: var(--violet); font-weight: 600; font-size: .9rem; padding-top: 3px; }
.event h3 { font-size: var(--step-1); }
@media (max-width: 560px) { .event { grid-template-columns: minmax(0, 1fr); } }
.tone { font: 600 .7rem var(--body); letter-spacing: .06em; text-transform: uppercase; padding: 2px 7px; border-radius: 999px; vertical-align: middle; margin-left: 6px; }
.tone-good, .tone-conj { background: var(--earth-soft); color: var(--earth); }
.tone-hard { background: var(--fire-soft); color: var(--fire); }
.syn-form { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 24rem), 1fr)); }
.syn-form .wide { grid-column: 1 / -1; }
.syn-form fieldset { margin: 0; min-width: 0; }
.syn-form legend { font-family: var(--display); font-size: var(--step-2); padding: 0 6px; }
.score-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--line); }
.eph table { font-size: .82rem; min-width: 760px; }
.eph th, .eph td { padding: 5px 8px 5px 0; white-space: nowrap; }
.eph thead th { position: sticky; top: 0; background: var(--paper); font-size: 1rem; text-transform: none; letter-spacing: 0; }
.eph td .g { font-size: .95em; margin-inline: 1px; }
.eph td.rx { color: var(--brass); }
.eph sup { font-size: .65em; font-weight: 600; margin-left: 1px; }
.month-nav { display: flex; justify-content: space-between; gap: 12px; font-weight: 500; }
.chip[aria-current] { background: var(--violet); color: #fff; }
footer.site { border-top: 1px solid var(--line); padding-block: 20px 36px; font-size: .85rem; color: var(--muted); display: grid; gap: 8px; }
@media (prefers-reduced-motion: no-preference) { .sign-card { transition: border-color .15s, transform .15s, box-shadow .15s; } }
/* Νυχτερινό πάνελ της αρχικής: ο ουρανός της ημέρας σε βαθύ μπλε-μωβ με αστεράκια */
.night { --surface: rgba(255,255,255,.06); --ink: #f6f2ff; --muted: #c9bff0; --line: rgba(255,255,255,.16);
  --brass: #ff6fb2; --violet: #b79bff; --sun: #ffd166; --fire: #ff8a6b; --earth: #4fe0a1; --air: #ffd75e; --water: #7fb2ff;
  color: var(--ink); border-radius: 28px; padding: clamp(20px, 4vw, 40px);
  background:
    radial-gradient(1.5px 1.5px at 12% 18%, #fff8 50%, transparent 51%), radial-gradient(1px 1px at 32% 72%, #fff7 50%, transparent 51%),
    radial-gradient(1.5px 1.5px at 58% 12%, #fff6 50%, transparent 51%), radial-gradient(1px 1px at 78% 40%, #fff8 50%, transparent 51%),
    radial-gradient(1px 1px at 90% 85%, #fff6 50%, transparent 51%), radial-gradient(1.5px 1.5px at 45% 92%, #fff5 50%, transparent 51%),
    radial-gradient(120% 90% at 85% 0%, var(--night-2), var(--night)); }
.night .eyebrow { color: var(--sun); }
.night .lede { color: var(--muted); }
.night a { color: var(--ink); }
`;

const NAV = [
  ['index.html', 'Σήμερα'],
  ['prosopiko/index.html', 'Προσωπικό ωροσκόπιο'],
  ['xartis/index.html', 'Γενέθλιος χάρτης'],
  ['synastria/index.html', 'Συναστρία'],
  ['ouranos/index.html', 'Ο ουρανός'],
  ['efimerida/index.html', 'Εφημερίδα'],
  ['selini/index.html', 'Σελήνη'],
  ['anadromoi/index.html', 'Ανάδρομοι'],
  ['symvatotita/index.html', 'Συμβατότητα'],
  ['sxetika/index.html', 'Σχετικά'],
];

export function adSlot() {
  if (!config.adsenseClient) return '';
  return `<div class="ad"><ins class="adsbygoogle" style="display:block" data-ad-client="${esc(config.adsenseClient)}" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});</script></div>`;
}

// Επιστρέφει { head, body } — η build τα τυλίγει σε πλήρες έγγραφο
export function page({ path, title, description, content, jsonLd }) {
  const depth = path.split('/').length - 1;
  const root = depth ? '../'.repeat(depth) : '';
  const fullTitle = title ? `${title} | ${config.siteName}` : `${config.siteName} | ${config.tagline}`;
  const canonical = config.siteUrl ? `${config.siteUrl}/${path.replace(/index\.html$/, '')}` : '';
  const head = [
    `<title>${esc(fullTitle)}</title>`,
    '<meta name="claude:viewport-fit-sides" content="cover">',
    `<meta name="description" content="${esc(description)}">`,
    canonical ? `<link rel="canonical" href="${esc(canonical)}">` : '',
    `<meta property="og:title" content="${esc(fullTitle)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    '<meta property="og:locale" content="el_GR">',
    '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@500;600;700&family=Commissioner:wght@400;500;600;700&family=Noto+Sans+Symbols&display=swap">',
    config.adsenseClient ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${esc(config.adsenseClient)}" crossorigin="anonymous"></script>` : '',
    config.gaId ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(config.gaId)}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${esc(config.gaId)}');</script>` : '',
    jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : '',
    `<style>${CSS}</style>`,
  ].filter(Boolean).join('\n');
  const nav = NAV.map(([href, label]) => `<a href="${root}${href}"${href === path ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  const body = `<div class="wrap">
<header class="site"><a class="brand" href="${root}index.html">${glyph('☉')}${esc(config.siteName)}</a><nav class="main" aria-label="Κύριο μενού">${nav}</nav></header>
<main>${content}</main>
<footer class="site"><p>${esc(config.siteName)} · Οι θέσεις των πλανητών υπολογίζονται καθημερινά για ώρα Αθήνας. Οι προβλέψεις είναι για ψυχαγωγικούς σκοπούς.</p><p><a href="${root}sxetika/index.html">Σχετικά με τις προβλέψεις</a></p></footer>
</div>`;
  return { head, body, root };
}

export function fullDocument({ head, body }) {
  return `<!doctype html>\n<html lang="el">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${head}\n</head>\n<body>\n${body}\n</body>\n</html>\n`;
}
