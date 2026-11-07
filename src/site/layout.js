import config from '../config.js';
import { SIGNS } from '../content/signs.js';

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
.place-info { margin: -4px 0 0; font-size: .85rem; min-height: 1.2em; }
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
.consent { position: fixed; z-index: 20; left: 0; right: 0; bottom: 0; margin: 0 auto; max-width: 44rem;
  display: flex; flex-wrap: wrap; align-items: center; gap: 12px 18px; background: var(--surface); color: var(--ink);
  border: 1px solid var(--line); border-radius: 18px 18px 0 0; box-shadow: 0 -8px 30px -12px rgba(30,10,80,.35);
  padding: 16px max(16px, env(safe-area-inset-right, 0px)) calc(16px + env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left, 0px)); font-size: .9rem; }
[hidden], .consent[hidden] { display: none !important; }
.consent p { flex: 1 1 18rem; }
.consent-btns { display: flex; gap: 8px; }
.consent .btn { padding: 9px 18px; font-size: .9rem; }
.footer-links { display: flex; flex-wrap: wrap; gap: 6px 16px; }
.linkish { font: inherit; color: inherit; background: none; border: 0; padding: 0; text-decoration: underline; text-decoration-color: var(--brass); text-underline-offset: 3px; cursor: pointer; }
.legal h2 { font-size: var(--step-2); margin-top: 8px; }
.whatis { display: inline-block; position: relative; vertical-align: middle; text-transform: none; letter-spacing: 0; font-weight: 400; }
.whatis > summary { list-style: none; cursor: pointer; display: inline-grid; place-items: center; width: 1.25rem; height: 1.25rem; border-radius: 50%;
  font: 700 .72rem/1 var(--body); color: var(--violet); background: var(--violet-soft); margin-left: 4px; }
.whatis > summary::-webkit-details-marker { display: none; }
.whatis[open] > summary { color: #fff; background: var(--violet); }
.whatis-pop { display: block; position: absolute; z-index: 15; top: calc(100% + 6px); left: -8px; width: min(18rem, 80vw); padding: 12px 14px; border-radius: 14px;
  background: var(--surface); color: var(--ink); border: 1px solid var(--line); box-shadow: 0 12px 30px -12px rgba(30,10,80,.4);
  font: 400 .88rem/1.5 var(--body); text-align: left; white-space: normal; }
.whatis-pop strong { display: block; margin-bottom: 2px; color: var(--violet); }
th .whatis-pop, .legend .whatis-pop { left: auto; right: -8px; }
.legend { font-size: .85rem; }
.ev-filters { display: flex; flex-wrap: wrap; gap: 8px; }
.ev-filter { font: 600 .9rem var(--body); color: var(--violet); background: var(--violet-soft); border: 0; border-radius: 999px; padding: 8px 14px; cursor: pointer; }
.ev-filter .num { opacity: .7; margin-left: 2px; }
.ev-filter.is-on { color: #fff; background: var(--violet); }
.ev-filter:disabled { opacity: .4; cursor: default; }
.ev-list { display: grid; gap: 14px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 21rem), 1fr)); }
.ev-card { display: grid; gap: 8px; align-content: start; padding: 18px; border-radius: 18px; background: var(--surface); border: 1px solid var(--line); }
.ev-card[hidden] { display: none; }
.ev-card h3 { font-size: var(--step-1); }
.ev-deg { font: 400 .85rem var(--body); }
.ev-when { color: var(--violet); font-weight: 600; font-size: .88rem; }
.ev-tag { display: inline-block; font: 700 .72rem var(--body); letter-spacing: .05em; text-transform: uppercase; padding: 3px 9px; border-radius: 999px; }
.cat-moon .ev-tag { background: var(--water-soft); color: var(--water); }
.cat-retro .ev-tag { background: var(--brass-soft); color: var(--brass); }
.cat-ingress .ev-tag { background: var(--earth-soft); color: var(--earth); }
.ev-card p { font-size: .95rem; }
.ev-links { font-size: .88rem; }
.guide { max-width: 46rem; }
.guide .panel { border-radius: 18px; }
.shot { margin: 6px 0 0; display: grid; gap: 8px; }
.shot img { width: 100%; height: auto; border-radius: 14px; border: 1px solid var(--line); background: #fff; }
.shot figcaption { font-size: .86rem; color: var(--muted); }
a.btn { display: inline-block; text-decoration: none; }
.crumbs { font-size: .85rem; color: var(--muted); display: flex; flex-wrap: wrap; gap: 4px 6px; }
.crumbs a { color: var(--muted); }
.lucky { display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 9rem), 1fr)); margin: 0; }
.lucky > div { background: var(--chip); border-radius: 14px; padding: 10px 14px; }
.lucky dt { font-size: .78rem; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; }
.lucky dd { margin: 2px 0 0; font-weight: 700; font-family: var(--display); font-size: var(--step-1); }
.swatch { display: inline-block; width: .9em; height: .9em; border-radius: 50%; vertical-align: -.1em; margin-right: 6px; border: 1px solid var(--line); }
.luckbar { height: 8px; border-radius: 999px; background: var(--chip); overflow: hidden; margin-top: 6px; }
.luckbar i { display: block; height: 100%; background: linear-gradient(90deg, var(--violet), var(--brass)); }
.day-list { display: grid; gap: 22px; }
.day-list article h2 { font-size: var(--step-2); }
.cal { display: grid; gap: 6px; grid-template-columns: repeat(7, minmax(0, 1fr)); text-align: center; }
.cal a, .cal span { display: block; padding: 8px 0; border-radius: 10px; text-decoration: none; font-variant-numeric: tabular-nums; }
.cal a { background: var(--chip); font-weight: 600; }
.cal a:hover, .cal a[aria-current] { background: var(--violet); color: #fff; }
.tarot-card { display: grid; gap: 10px; justify-items: center; text-align: center; padding: 22px 16px; border-radius: 18px;
  background: linear-gradient(160deg, var(--night-2), var(--night)); color: #f6f2ff; border: 2px solid var(--sun); }
.tarot-card .num { color: var(--sun); font-family: var(--display); font-weight: 700; letter-spacing: .1em; }
.tarot-card h3 { font-size: var(--step-2); }
.tarot-card .g { font-size: 2.6rem; color: var(--sun); }
.tone-mid { background: var(--violet-soft); color: var(--violet); }
.note { background: var(--brass-soft); border-radius: 12px; padding: 10px 14px; font-size: .92rem; }
.syn-actions { display: flex; flex-wrap: wrap; gap: 10px 14px; align-items: center; }
.rel-tabs { display: flex; gap: 6px; padding: 5px; background: var(--chip); border-radius: 999px; width: fit-content; max-width: 100%; }
.rel-tabs [role=tab] { font: 700 .95rem var(--body); color: var(--ink); background: transparent; border: 0; border-radius: 999px; padding: 10px 18px; cursor: pointer; }
.rel-tabs [role=tab][aria-selected=true] { background: var(--violet); color: #fff; }
.rel-tabs [role=tab]:focus-visible, .sel-btn:focus-visible, .chip-btn:focus-visible { outline: 3px solid var(--sun); outline-offset: 2px; }
.comp-grid { display: grid; gap: 24px; grid-template-columns: minmax(0, 1fr); }
@media (min-width: 860px) { .comp-grid { grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); align-items: start; } .comp-detail { position: sticky; top: 16px; } }
.comp-detail { min-height: 220px; }
.comp-detail h3 { font-size: 1.15rem; }
.wheel-live .wpl { cursor: pointer; }
.wheel-live .wpl-bg { fill: transparent; transition: fill .15s; }
.wheel-live .wpl:hover .wpl-bg { fill: var(--violet-soft); }
.wheel-live .wpl.is-sel .wpl-bg { fill: var(--sun); }
.wheel-live .wasp { cursor: pointer; stroke-width: 1.4; transition: opacity .15s; }
.wheel-live.has-sel .wasp { opacity: .15; }
.wheel-live.has-sel .wasp.is-sel { opacity: 1; stroke-width: 2.6; }
.wheel-live.has-sel .wpl:not(.is-sel) text { opacity: .45; }
.sel-ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
.sel-btn { width: 100%; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 2px 10px; text-align: left; font: 500 .95rem var(--body); color: var(--ink); background: var(--surface); border: 1px solid var(--line); border-radius: 12px; padding: 10px 14px; cursor: pointer; min-height: 44px; }
.sel-btn:hover { border-color: var(--violet); }
.sel-btn[aria-pressed=true] { border-color: var(--violet); background: var(--violet-soft); }
.sel-name { font-weight: 600; }
.sel-meta { color: var(--muted); font-size: .88rem; }
.sel-meta .tone { margin-left: 0; }
.chip-btn { font: 600 .85rem var(--body); color: var(--violet); background: var(--violet-soft); border: 0; border-radius: 999px; padding: 7px 12px; cursor: pointer; }
.chip-btn:hover { background: var(--violet); color: #fff; }
.trio > .panel { align-content: start; }
.newsletter form { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr)); align-items: end; }
.newsletter .wide { grid-column: 1 / -1; }
details.faq { border-bottom: 1px solid var(--line); padding: 10px 0; }
details.faq summary { font-weight: 600; cursor: pointer; }
details.faq p { margin: 8px 0 0; }
.hero-sign h1 { overflow-wrap: break-word; min-width: 0; }
.export-row { display: grid; gap: 8px; justify-items: center; text-align: center; }
.export-row .chips { justify-content: center; }
.merch-cta { display: grid; gap: 6px; justify-items: center; }
.chips { align-items: flex-start; align-content: flex-start; }
.months-grid { display: grid; gap: 14px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 15rem), 1fr)); }
.months-grid ul { font-size: .93rem; display: grid; gap: 6px; }
.glance-card { align-content: start; }
.glance-card h3 { font-family: var(--display); font-size: var(--step-1); }
.glance-attraction h3 { color: var(--brass); } .glance-communication h3 { color: var(--violet); } .glance-friction h3 { color: var(--fire); }
.glance-why-btn { justify-self: start; }
.glance-why-btn[aria-expanded=true] { background: var(--violet); color: #fff; }
.glance-why-btn:focus-visible { outline: 3px solid var(--sun); outline-offset: 2px; }
.glance-why { background: var(--violet-soft); border-radius: 12px; padding: 12px 14px; font-size: .93rem; }
.glance-why .chip-btn { justify-self: start; background: var(--surface); }
.glance-q { border-top: 1px dashed var(--line); padding-top: 10px; }
.glance-q p { font-style: italic; margin-top: 4px; }
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

// Από τον Οκτώβριο προβάλλεται η επόμενη χρονιά
export const FEATURED_YEAR = (() => { const d = new Date(); return d.getUTCMonth() >= 9 ? d.getUTCFullYear() + 1 : d.getUTCFullYear(); })();
const NAV = [
  ['index.html', 'Σήμερα'],
  ['zodia-avrio/index.html', 'Αύριο'],
  [`zodia-${FEATURED_YEAR}/index.html`, `Ζώδια ${FEATURED_YEAR}`],
  ['prosopiko/index.html', 'Προσωπικό ωροσκόπιο'],
  ['xartis/index.html', 'Γενέθλιος χάρτης'],
  ['oroskopos/index.html', 'Ωροσκόπος'],
  ['kinezika-zodia/index.html', 'Κινέζικα ζώδια'],
  ['arithmologia/index.html', 'Αριθμολογία'],
  ['synastria/index.html', 'Συναστρία'],
  ['ouranos/index.html', 'Ο ουρανός'],
  ['efimerida/index.html', 'Εφημερίδα'],
  ['selini/index.html', 'Σελήνη'],
  ['anadromoi/index.html', 'Ανάδρομοι'],
  ['symvatotita/index.html', 'Συμβατότητα'],
  ['taro/index.html', 'Ταρώ'],
  ['sxetika/index.html', 'Σχετικά'],
];

// Φόρμα newsletter (MailerLite). Εμφανίζεται μόνο όταν έχει οριστεί config.newsletterAction.
export function newsletterBox(signSlug = '') {
  if (!config.newsletterAction) return '';
  return `<section class="panel stack newsletter">
  <h2>Η πρόβλεψή σου κάθε πρωί στο email</h2>
  <p class="muted">Δωρεάν, μία φορά την ημέρα. Μπορείς να διαγραφείς όποτε θέλεις.</p>
  <form class="nl-form" action="${esc(config.newsletterAction)}" method="post" target="nl-frame">
    <label class="field"><span>Email</span><input type="email" name="fields[email]" required autocomplete="email"></label>
    <label class="field"><span>Ζώδιο</span><select name="fields[zodio]">${SIGNS.map((x) => `<option value="${x.slug}"${x.slug === signSlug ? ' selected' : ''}>${x.name}</option>`).join('')}</select></label>
    <label class="check wide"><input type="checkbox" required> Συμφωνώ να λαμβάνω το newsletter και έχω διαβάσει την <a href="/apporito/">πολιτική απορρήτου</a>.</label>
    <input type="hidden" name="ml-submit" value="1"><input type="hidden" name="anticsrf" value="true">
    <div class="wide"><button type="submit" class="btn">Γράψου</button></div>
    <p class="nl-ok wide" role="status" hidden>Ευχαριστούμε! Έλεγξε το email σου για να επιβεβαιώσεις την εγγραφή.</p>
  </form>
  <iframe name="nl-frame" title="newsletter" hidden></iframe>
  <script>document.querySelectorAll('.nl-form').forEach(function(f){f.addEventListener('submit',function(){setTimeout(function(){f.querySelector('.nl-ok').hidden=false;f.querySelector('button').disabled=true},600)})});</script>
</section>`;
}

export function adSlot() {
  if (!config.adsenseClient) return '';
  return `<div class="ad"><ins class="adsbygoogle" style="display:block" data-ad-client="${esc(config.adsenseClient)}" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});</script></div>`;
}

// Επιστρέφει { head, body } — η build τα τυλίγει σε πλήρες έγγραφο
// Εικόνα κοινοποίησης: ανά ζώδιο (static/og/<slug>.png) ή η γενική
export const ogImage = (slug = 'zodia-simera') => `${config.siteUrl}/og/${slug}.png`;
export const ORG_LD = () => ({ '@type': 'Organization', '@id': `${config.siteUrl}/#org`, name: config.siteName, url: `${config.siteUrl}/`, logo: ogImage(), legalName: config.company.name, email: config.company.email,
  address: { '@type': 'PostalAddress', streetAddress: 'Ξανθίππου 7', postalCode: '155 61', addressLocality: 'Χολαργός', addressRegion: 'Αττική', addressCountry: 'GR' } });
// Δομημένα δεδομένα: άρθρο (με ημερομηνίες) και διαδρομή (breadcrumbs)
export function articleLd({ path, headline, description, published, modified, image }) {
  const url = `${config.siteUrl}/${path.replace(/index\.html$/, '')}`;
  return { '@context': 'https://schema.org', '@type': 'Article', headline: headline.slice(0, 110), description, inLanguage: 'el', url, mainEntityOfPage: url,
    image: [image || ogImage()], datePublished: published, dateModified: modified || published,
    author: { '@type': 'Organization', name: config.siteName, url: `${config.siteUrl}/sxetika/` }, publisher: ORG_LD() };
}
export function breadcrumbLd(items) {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([name, path], k) => ({ '@type': 'ListItem', position: k + 1, name, item: `${config.siteUrl}/${path.replace(/index\.html$/, '')}` })) };
}
// Ορατή διαδρομή πάνω από τον τίτλο (ταιριάζει με το breadcrumbLd)
export function crumbs(items, root) {
  return `<nav class="crumbs" aria-label="Διαδρομή">${items.map(([name, path], k) => k === items.length - 1 ? `<span aria-current="page">${esc(name)}</span>` : `<a href="${root}${path}">${esc(name)}</a>`).join(' <span aria-hidden="true">›</span> ')}</nav>`;
}

export function page({ path, title, titleExact = false, description, content, jsonLd, image, ogType = 'website', noindex = false }) {
  const depth = path.split('/').length - 1;
  const root = depth ? '../'.repeat(depth) : '';
  const fullTitle = titleExact ? title : title ? `${title} | ${config.siteName}` : `${config.siteName} | ${config.tagline}`;
  const canonical = config.siteUrl ? `${config.siteUrl}/${path.replace(/index\.html$/, '')}` : '';
  // Σελίδες που αφορούν ένα ζώδιο παίρνουν την εικόνα του αυτόματα
  if (!image) { const seg = path.split('/').find((x) => SIGNS.some((z) => z.slug === x)); if (seg) image = ogImage(seg); }
  const head = [
    `<title>${esc(fullTitle)}</title>`,
    '<meta name="claude:viewport-fit-sides" content="cover">',
    `<meta name="description" content="${esc(description)}">`,
    canonical ? `<link rel="canonical" href="${esc(canonical)}">` : '',
    `<meta property="og:title" content="${esc(fullTitle)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    '<meta property="og:locale" content="el_GR">',
    `<meta property="og:type" content="${ogType}">`,
    `<meta property="og:site_name" content="${esc(config.siteName)}">`,
    canonical ? `<meta property="og:url" content="${esc(canonical)}">` : '',
    config.siteUrl ? `<meta property="og:image" content="${esc(image || ogImage())}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${esc(fullTitle)}">` : '',
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="robots" content="${noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1'}">`,
    config.siteUrl ? `<link rel="icon" href="${config.siteUrl}/favicon.svg" type="image/svg+xml">` : '',
    config.siteUrl ? `<link rel="alternate" type="application/rss+xml" title="${esc(config.siteName)}" href="${config.siteUrl}/rss/zodia.xml">` : '',
    config.gscVerification ? `<meta name="google-site-verification" content="${esc(config.gscVerification)}">` : '',
    '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@500;600;700&family=Commissioner:wght@400;500;600;700&family=Noto+Sans+Symbols&display=swap">',
    config.adsenseClient ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${esc(config.adsenseClient)}" crossorigin="anonymous"></script>` : '',
    // Google Analytics με Consent Mode: τίποτα δεν αποθηκεύεται πριν ο επισκέπτης πατήσει «Αποδοχή»
    config.gaId ? `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied'});
try{if(localStorage.getItem('zs-consent')==='yes')gtag('consent','update',{analytics_storage:'granted'})}catch(e){}
gtag('js',new Date());gtag('config','${esc(config.gaId)}');</script><script async src="https://www.googletagmanager.com/gtag/js?id=${esc(config.gaId)}"></script>` : '',
    ...[].concat(jsonLd || []).map((ld) => `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`),
    `<style>${CSS}</style>`,
  ].filter(Boolean).join('\n');
  const nav = NAV.map(([href, label]) => `<a href="${root}${href}"${href === path ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  const body = `<div class="wrap">
<header class="site"><a class="brand" href="${root}index.html">${glyph('☉')}${esc(config.siteName)}</a><nav class="main" aria-label="Κύριο μενού">${nav}</nav></header>
<main>${content}</main>
${config.gaId ? `<div class="consent" id="zs-consent" hidden role="dialog" aria-label="Cookies"><p>Χρησιμοποιούμε cookies του Google Analytics για να μετράμε την επισκεψιμότητα. Η ημερομηνία και η ώρα γέννησης που βάζεις στα εργαλεία μας δεν στέλνονται πουθενά.</p><div class="consent-btns"><button type="button" class="btn-ghost" id="zs-no">Απόρριψη</button><button type="button" class="btn" id="zs-yes">Αποδοχή</button></div></div>
<script>(function(){var b=document.getElementById('zs-consent'),v=null;try{v=localStorage.getItem('zs-consent')}catch(e){}if(!v)b.hidden=false;function set(x){try{localStorage.setItem('zs-consent',x)}catch(e){}b.hidden=true;if(x==='yes'&&window.gtag)gtag('consent','update',{analytics_storage:'granted'})}document.getElementById('zs-yes').onclick=function(){set('yes')};document.getElementById('zs-no').onclick=function(){set('no')};document.addEventListener('click',function(e){if(e.target&&e.target.id==='zs-reopen')b.hidden=false});})();</script>` : ''}
<footer class="site"><p>${esc(config.siteName)} · Οι θέσεις των πλανητών υπολογίζονται καθημερινά για ώρα Αθήνας. Οι προβλέψεις είναι για ψυχαγωγικούς σκοπούς.</p>
<p class="footer-links"><a href="${root}sxetika/index.html">Σχετικά</a><a href="${root}epikoinonia/index.html">Επικοινωνία</a><a href="${root}apporito/index.html">Πολιτική απορρήτου</a><a href="${root}oroi/index.html">Όροι χρήσης</a>${config.gaId ? '<button type="button" class="linkish" id="zs-reopen">Ρυθμίσεις cookies</button>' : ''}</p>
<p>© ${new Date().getFullYear()} ${esc(config.company.name)}</p></footer>
<script>document.addEventListener('click',function(e){document.querySelectorAll('details.whatis[open]').forEach(function(d){if(!d.contains(e.target))d.open=false})});document.addEventListener('keydown',function(e){if(e.key==='Escape')document.querySelectorAll('details.whatis[open]').forEach(function(d){d.open=false})});</script>
</div>`;
  return { head, body, root };
}

// Καθαρά URL: κάθε link σε «…/index.html» γίνεται «…/», ώστε να ταιριάζει με το canonical
export const cleanLinks = (html) => html.replace(/href="([^"]*?)index\.html(#[^"]*)?"/g, (_, pre, hash = '') => `href="${pre || './'}${hash}"`);

export function fullDocument({ head, body }) {
  head = cleanLinks(head); body = cleanLinks(body);
  return `<!doctype html>\n<html lang="el">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${head}\n</head>\n<body>\n${body}\n</body>\n</html>\n`;
}
