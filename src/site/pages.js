import * as E from '../ephemeris.js';
import { SIGNS, BODY_NAMES, ASPECT_NAMES, ELEMENTS, MODALITIES, PHASE_NAMES } from '../content/signs.js';
import * as C from '../content/compatibility-texts.js';
import { horoscopeFor, fmtTime, fmtDate, fmtIsoLong } from '../horoscope.js';
import config from '../config.js';
import { page, esc, glyph, adSlot } from './layout.js';
import { fmtDeg, wheelSvg as drawWheel } from '../chart-svg.js';

export { fmtDeg };
const wheelSvg = (pos) => drawWheel(pos, {
  aspects: E.aspectsBetween(pos, ['sun', ...PLANETS], 0.6),
  label: 'Ζωδιακός τροχός με τις σημερινές θέσεις του Ήλιου, της Σελήνης και των πλανητών',
});

const PLANETS = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
const ALL = ['sun', 'moon', ...PLANETS, 'node'];

const fmtWhen = (d) => `${fmtDate(d, { weekday: 'short', day: 'numeric', month: 'short' })}, ${fmtTime(d)}`;
const dots = (n) => `<span class="dots" aria-label="${n} από 5">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`;
const retroPill = (b) => (b.retro ? ' <span class="pill" title="Ανάδρομος">R</span>' : '');
const signLink = (root, s) => `${root}zodia/${s.slug}/index.html`;
const pairSlug = (i, j) => (i <= j ? `${SIGNS[i].slug}-${SIGNS[j].slug}` : `${SIGNS[j].slug}-${SIGNS[i].slug}`);
const fem = (b) => b === 'venus' || b === 'moon';


function upcomingEvents(from, days, allPhases = false) {
  const to = new Date(from.getTime() + days * 86400000);
  const ev = [];
  const phaseGlyph = { new: '●', first: '◐', full: '○', last: '◑' };
  for (const p of E.lunarPhases(from, to)) if (allPhases && (p.kind === 'first' || p.kind === 'last')) ev.push({ date: p.date, text: `${glyph(phaseGlyph[p.kind])} ${PHASE_NAMES[p.kind]} ${SIGNS[p.sign].inSign}` });
  for (const p of E.lunarPhases(from, to)) if (p.kind === 'new' || p.kind === 'full') ev.push({ date: p.date, text: `${glyph(p.kind === 'new' ? '●' : '○')} ${PHASE_NAMES[p.kind]} ${SIGNS[p.sign].inSign} (${fmtDeg(p.deg)})` });
  for (const b of PLANETS) for (const s of E.stations(b, from, to)) ev.push({ date: s.date, text: `${glyph(BODY_NAMES[b].glyph)} ${BODY_NAMES[b].nom[0].toUpperCase() + BODY_NAMES[b].nom.slice(1)} γίνεται ${s.kind === 'retrograde' ? (fem(b) ? 'ανάδρομη' : 'ανάδρομος') : 'ορθός'.replace('ός', fem(b) ? 'ή' : 'ός')} ${SIGNS[s.sign].inSign}` });
  for (const b of ['sun', ...PLANETS]) for (const i of E.ingresses(b, from, to)) ev.push({ date: i.date, text: `${glyph(BODY_NAMES[b].glyph)} ${BODY_NAMES[b].nom[0].toUpperCase() + BODY_NAMES[b].nom.slice(1)} μπαίνει ${SIGNS[i.sign].inSign}${i.retro ? ' (ανάδρομα)' : ''}` });
  return ev.sort((a, b) => a.date - b.date);
}

function moonFacts(sky) {
  const m = sky.pos.moon;
  const phase = (() => {
    const e = E.elongation(sky.noon);
    if (e < 10 || e > 350) return 'Νέα Σελήνη';
    if (e < 80) return 'Αύξων μηνίσκος';
    if (e < 100) return 'Πρώτο τέταρτο';
    if (e < 170) return 'Αύξουσα Σελήνη';
    if (e < 190) return 'Πανσέληνος';
    if (e < 260) return 'Φθίνουσα Σελήνη';
    if (e < 280) return 'Τελευταίο τέταρτο';
    return 'Φθίνων μηνίσκος';
  })();
  return { m, phase, lit: Math.round(sky.illumination * 100) };
}

function ratingsHtml(r) {
  return `<div class="ratings"><span class="rating r-love">Αγάπη ${dots(r.love)}</span><span class="rating r-work">Δουλειά ${dots(r.work)}</span><span class="rating r-mood">Διάθεση ${dots(r.mood)}</span></div>`;
}

// ── Αρχική ───────────────────────────────────────────────────────────────
export function homePage(sky, skyTomorrow) {
  const path = 'index.html';
  const root = '';
  const { m, phase, lit } = moonFacts(sky);
  const retros = PLANETS.filter((b) => sky.pos[b].retro);
  const events = upcomingEvents(sky.start, 30).slice(0, 10);
  const cards = SIGNS.map((s, i) => {
    const h = horoscopeFor(i, sky);
    return `<a class="sign-card el-${s.element}" href="${signLink(root, s)}">${glyph(s.symbol)}<strong>${s.name}</strong><small>${s.dates}</small><span></span>${ratingsHtml(h.ratings)}</a>`;
  }).join('');
  const content = `
<section class="split night">
  <div class="stack-lg">
    <div class="stack">
      <p class="eyebrow">${esc(fmtIsoLong(sky.iso))}</p>
      <h1>Ο ουρανός σήμερα</h1>
      <p class="lede">Η Σελήνη βρίσκεται ${SIGNS[m.sign].inSign}${sky.moonIngress ? ` και στις ${fmtTime(sky.moonIngress.date)} περνά ${SIGNS[sky.moonIngress.sign].inSign}` : ''}. ${retros.length ? `Ανάδρομοι: ${retros.map((b) => BODY_NAMES[b].short).join(', ')}.` : 'Κανένας πλανήτης δεν είναι ανάδρομος.'}</p>
    </div>
    <dl class="facts">
      <div><dt>Ήλιος</dt><dd>${glyph('☉')} ${fmtDeg(sky.pos.sun.deg)} ${SIGNS[sky.pos.sun.sign].name}</dd></div>
      <div><dt>Σελήνη</dt><dd>${glyph('☽')} ${fmtDeg(m.deg)} ${SIGNS[m.sign].name}</dd></div>
      <div><dt>Φάση</dt><dd>${phase} · φωτισμένη κατά <span class="num">${lit}%</span></dd></div>
      <div><dt>Ανάδρομοι</dt><dd>${retros.length ? retros.map((b) => `${glyph(BODY_NAMES[b].glyph)} ${BODY_NAMES[b].short}`).join(', ') : '—'}</dd></div>
    </dl>
    <p class="muted" style="font-size:.85rem">Θέσεις για τις 12:00 ώρα Αθήνας. <a href="ouranos/index.html">Όλες οι θέσεις και οι όψεις</a></p>
  </div>
  ${wheelSvg(sky.pos)}
</section>
${adSlot()}
<section class="stack-lg">
  <div class="stack"><h2>Ζώδια σήμερα</h2><p class="muted">Διάλεξε το ζώδιό σου για την πρόβλεψη της ημέρας και της αυριανής.</p></div>
  <div class="signs">${cards}</div>
</section>
<section class="stack-lg">
  <h2>Επόμενες 30 ημέρες</h2>
  <div class="table-wrap"><table><thead><tr><th>Πότε</th><th>Γεγονός</th></tr></thead><tbody>
  ${events.map((e) => `<tr><td class="num" style="white-space:nowrap">${fmtWhen(e.date)}</td><td>${e.text}</td></tr>`).join('')}
  </tbody></table></div>
</section>`;
  return { path, ...page({ path, title: '', description: `Ημερήσιες προβλέψεις για τα 12 ζώδια, ${fmtIsoLong(sky.iso)}. Σελήνη ${SIGNS[m.sign].inSign}, φάση και ανάδρομοι πλανήτες.`, content }) };
}

// ── Σελίδα ζωδίου ────────────────────────────────────────────────────────
export function signPage(i, sky, skyTomorrow) {
  const s = SIGNS[i];
  const path = `zodia/${s.slug}/index.html`;
  const root = '../../';
  const today = horoscopeFor(i, sky);
  const tomorrow = horoscopeFor(i, skyTomorrow);
  // τα κείμενα είναι γραμμένα για «σήμερα»· για την αυριανή πρόβλεψη αλλάζει η λέξη
  const toTomorrow = (t) => t.replaceAll('Σήμερα', 'Αύριο').replaceAll('σήμερα', 'αύριο');
  tomorrow.paras = tomorrow.paras.map(toTomorrow);
  tomorrow.advice = toTomorrow(tomorrow.advice);
  const day = (h, label, iso) => `
<article class="panel stack-lg">
  <div class="day-head"><h2>${label}</h2><span class="muted">${esc(fmtIsoLong(iso))}</span></div>
  ${ratingsHtml(h.ratings)}
  <div class="reading">${h.paras.map((p) => `<p>${esc(p)}</p>`).join('')}<p class="advice">${esc(h.advice)}</p></div>
</article>`;
  const others = SIGNS.map((o, j) => `<a class="chip" href="${root}symvatotita/${pairSlug(i, j)}/index.html">${glyph(o.symbol)} ${o.name}</a>`).join('');
  const products = (config.products[s.slug] || []);
  const content = `
<section class="hero-sign el-${s.element}">${glyph(s.symbol)}<h1>${s.name}</h1><p class="muted">${s.dates} · ${ELEMENTS[s.element].name} · ${MODALITIES[s.modality].name} · Κυβερνήτης: ${BODY_NAMES[s.ruler].short}</p></section>
${day(today, 'Σήμερα', sky.iso)}
${adSlot()}
${day(tomorrow, 'Αύριο', skyTomorrow.iso)}
<section class="stack-lg">
  <h2>Ο χαρακτήρας ${s.gen}</h2>
  <div class="reading"><p>${esc(s.intro)}</p></div>
  <div class="split">
    <div class="stack"><h3>Στον έρωτα</h3><p>${esc(s.love)}</p></div>
    <div class="stack"><h3>Στη δουλειά</h3><p>${esc(s.work)}</p></div>
  </div>
  <div class="split">
    <div class="stack"><h3>Δυνατά σημεία</h3><ul class="plain">${s.strengths.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
    <div class="stack"><h3>Προκλήσεις</h3><ul class="plain">${s.challenges.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
  </div>
</section>
${products.length ? `<section class="stack"><h2>Για ${s.acc}</h2><ul class="plain">${products.map((p) => `<li><a href="${esc(p.url)}" rel="sponsored noopener" target="_blank">${esc(p.title)}</a>${p.note ? ` · <span class="muted">${esc(p.note)}</span>` : ''}</li>`).join('')}</ul></section>` : ''}
<section class="stack">
  <h2>Συμβατότητα ${s.gen}</h2>
  <div class="chips">${others}</div>
</section>`;
  const first = today.paras[0].split('. ')[0];
  return { path, ...page({ path, title: `${s.name} σήμερα: ημερήσια πρόβλεψη`, description: `${s.name} σήμερα, ${fmtIsoLong(sky.iso)}: ${first}.`, content }) };
}

// ── Ο ουρανός (θέσεις & όψεις) ───────────────────────────────────────────
export function skyPage(sky) {
  const path = 'ouranos/index.html';
  const rows = ALL.map((b) => {
    const p = sky.pos[b];
    return `<tr><td>${glyph(BODY_NAMES[b].glyph)} ${BODY_NAMES[b].short}</td><td>${glyph(SIGNS[p.sign].symbol)} ${SIGNS[p.sign].name}</td><td class="num">${fmtDeg(p.deg)}</td><td class="num">${p.speed >= 0 ? '+' : '−'}${Math.abs(p.speed).toFixed(3)}°</td><td>${b === 'node' ? '<span class="muted">πάντα ανάδρομος</span>' : p.retro ? '<span class="pill">Ανάδρομος</span>' : ''}</td></tr>`;
  }).join('');
  const asps = E.aspectsBetween(sky.pos, ['sun', ...PLANETS], 0.75)
    .map((a) => `<tr><td>${glyph(BODY_NAMES[a.a].glyph)} ${BODY_NAMES[a.a].short}</td><td>${glyph(ASPECT_NAMES[a.aspect].glyph)} ${ASPECT_NAMES[a.aspect].name}</td><td>${glyph(BODY_NAMES[a.b].glyph)} ${BODY_NAMES[a.b].short}</td><td class="num">${fmtDeg(a.orb)}</td></tr>`).join('');
  const content = `
<section class="stack"><p class="eyebrow">${esc(fmtIsoLong(sky.iso))} · 12:00 ώρα Αθήνας</p><h1>Οι θέσεις των πλανητών σήμερα</h1>
<p class="lede">Τροπικός ζωδιακός, γεωκεντρικές θέσεις. Η ημερήσια κίνηση δείχνει πόσες μοίρες διανύει κάθε σώμα σε 24 ώρες· όταν είναι αρνητική, ο πλανήτης είναι ανάδρομος.</p></section>
<section class="split">
  <div class="table-wrap"><table><thead><tr><th>Σώμα</th><th>Ζώδιο</th><th>Μοίρες</th><th>Κίνηση/ημέρα</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
  ${wheelSvg(sky.pos)}
</section>
${adSlot()}
<section class="stack-lg"><h2>Όψεις μεταξύ πλανητών</h2>
<div class="table-wrap"><table><thead><tr><th>Πλανήτης</th><th>Όψη</th><th>Πλανήτης</th><th>Απόκλιση</th></tr></thead><tbody>${asps || '<tr><td colspan="4" class="muted">Καμία κύρια όψη σε στενή απόκλιση.</td></tr>'}</tbody></table></div>
<p class="muted">Η απόκλιση δείχνει πόσο απέχει η όψη από το ακριβές. Όσο μικρότερη, τόσο πιο ισχυρή θεωρείται.</p></section>`;
  return { path, ...page({ path, title: 'Θέσεις πλανητών σήμερα', description: `Οι θέσεις του Ήλιου, της Σελήνης και των πλανητών σήμερα, ${fmtIsoLong(sky.iso)}, με μοίρες, ανάδρομους και όψεις.`, content }) };
}

// ── Σελήνη: ημερολόγιο φάσεων ────────────────────────────────────────────
export function moonPage(sky) {
  const path = 'selini/index.html';
  const from = sky.start, to = new Date(from.getTime() + 380 * 86400000);
  const phases = E.lunarPhases(from, to);
  const { m, phase, lit } = moonFacts(sky);
  const nextFull = phases.find((p) => p.kind === 'full');
  const nextNew = phases.find((p) => p.kind === 'new');
  const rows = phases.map((p) => `<tr${p.kind === 'new' || p.kind === 'full' ? '' : ' class="muted"'}><td class="num" style="white-space:nowrap">${fmtDate(p.date, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</td><td class="num">${fmtTime(p.date)}</td><td>${PHASE_NAMES[p.kind]}</td><td>${glyph(SIGNS[p.sign].symbol)} ${SIGNS[p.sign].name} ${fmtDeg(p.deg)}</td></tr>`).join('');
  const content = `
<section class="stack"><p class="eyebrow">Ημερολόγιο Σελήνης</p><h1>Φάσεις της Σελήνης</h1>
<p class="lede">Σήμερα η Σελήνη είναι ${SIGNS[m.sign].inSign}, ${phase.toLowerCase()}, φωτισμένη κατά ${lit}%. Επόμενη Πανσέληνος: ${fmtWhen(nextFull.date)} ${SIGNS[nextFull.sign].inSign}. Επόμενη Νέα Σελήνη: ${fmtWhen(nextNew.date)} ${SIGNS[nextNew.sign].inSign}.</p></section>
${adSlot()}
<section class="stack-lg"><h2>Οι επόμενοι 12 μήνες</h2>
<div class="table-wrap"><table><thead><tr><th>Ημερομηνία</th><th>Ώρα</th><th>Φάση</th><th>Ζώδιο</th></tr></thead><tbody>${rows}</tbody></table></div>
<p class="muted">Ώρες Ελλάδας. Η Νέα Σελήνη ευνοεί τα ξεκινήματα και η Πανσέληνος την ολοκλήρωση και το ξεκαθάρισμα.</p></section>`;
  return { path, ...page({ path, title: 'Πανσέληνος και Νέα Σελήνη: ημερολόγιο', description: `Πότε είναι η επόμενη Πανσέληνος: ${fmtWhen(nextFull.date)} ${SIGNS[nextFull.sign].inSign}. Όλες οι φάσεις της Σελήνης για τους επόμενους 12 μήνες σε ώρα Ελλάδας.`, content }) };
}

// ── Ανάδρομοι πλανήτες ───────────────────────────────────────────────────
export function retroPage(sky) {
  const path = 'anadromoi/index.html';
  const year = +sky.iso.slice(0, 4);
  const from = new Date(Date.UTC(year - 1, 9, 1)), to = new Date(Date.UTC(year + 2, 0, 1));
  const sections = PLANETS.map((b) => {
    const st = E.stations(b, from, to);
    const periods = [];
    for (let k = 0; k < st.length; k++) {
      if (st[k].kind === 'retrograde') periods.push({ start: st[k], end: st[k + 1] && st[k + 1].kind === 'direct' ? st[k + 1] : null });
    }
    const relevant = periods.filter((p) => (p.end ? p.end.date : to) >= new Date(Date.UTC(year, 0, 1)));
    if (!relevant.length) return '';
    return `<tr><th scope="rowgroup" colspan="3" style="padding-top:18px">${glyph(BODY_NAMES[b].glyph)} ${BODY_NAMES[b].short}${sky.pos[b].retro ? ' <span class="pill">Ανάδρομος τώρα</span>' : ''}</th></tr>${relevant.map((p) => `<tr><td class="num">${fmtDate(p.start.date)}</td><td class="num">${p.end ? fmtDate(p.end.date) : '—'}</td><td>${fmtDeg(p.start.deg)} ${SIGNS[p.start.sign].name} → ${p.end ? `${fmtDeg(p.end.deg)} ${SIGNS[p.end.sign].name}` : ''}</td></tr>`).join('')}`;
  }).join('');
  const now = PLANETS.filter((b) => sky.pos[b].retro);
  const content = `
<section class="stack"><p class="eyebrow">${year}–${year + 1}</p><h1>Ανάδρομοι πλανήτες</h1>
<p class="lede">Ένας πλανήτης λέγεται ανάδρομος όταν, όπως φαίνεται από τη Γη, μοιάζει να κινείται προς τα πίσω στον ζωδιακό. Στην αστρολογία οι περίοδοι αυτές θεωρούνται κατάλληλες για αναθεώρηση. ${now.length ? `Σήμερα ανάδρομοι είναι: ${now.map((b) => BODY_NAMES[b].short).join(', ')}.` : ''}</p></section>
${adSlot()}
<section class="stack-lg"><div class="table-wrap"><table><thead><tr><th>Ανάδρομος από</th><th>Ορθή φορά από</th><th>Από → Έως</th></tr></thead><tbody>${sections}</tbody></table></div>
<p class="muted">Ημερομηνίες σε ώρα Ελλάδας. Ο ανάδρομος Ερμής, τρεις φορές τον χρόνο, συνδέεται με καθυστερήσεις στην επικοινωνία, τα ταξίδια και την τεχνολογία.</p></section>`;
  return { path, ...page({ path, title: `Ανάδρομος Ερμής ${year} και ανάδρομοι πλανήτες`, description: `Πότε είναι ο ανάδρομος Ερμής ${year} και ${year + 1}; Ημερομηνίες και μοίρες για όλους τους ανάδρομους πλανήτες σε ώρα Ελλάδας.`, content }) };
}

// ── Συμβατότητα ──────────────────────────────────────────────────────────
export function compatScores(i, j) {
  const k = Math.min(Math.abs(i - j), 12 - Math.abs(i - j));
  return { k, ...C.DISTANCE[k].scores };
}

export function compatIndexPage() {
  const path = 'symvatotita/index.html';
  const root = '../';
  const head = `<tr><th></th>${SIGNS.map((s) => `<th title="${s.name}">${glyph(s.symbol)}</th>`).join('')}</tr>`;
  const body = SIGNS.map((a, i) => `<tr><th style="text-align:left;white-space:nowrap">${glyph(a.symbol)} ${a.name}</th>${SIGNS.map((b, j) => {
    const sc = compatScores(i, j);
    return `<td><a href="${pairSlug(i, j)}/index.html" title="${a.name} και ${b.name}: αγάπη ${sc.love}/5"><span class="score num">${sc.love}</span></a></td>`;
  }).join('')}</tr>`).join('');
  const content = `
<section class="stack"><p class="eyebrow">Ζώδια και σχέσεις</p><h1>Συμβατότητα ζωδίων</h1>
<p class="lede">Η συμβατότητα βασίζεται στην παραδοσιακή γεωμετρία του ζωδιακού: στην απόσταση των δύο ζωδίων, στο στοιχείο και στην ποιότητά τους. Ο αριθμός είναι η βαθμολογία στην αγάπη από 1 έως 5. Πάτησε έναν συνδυασμό για την ανάλυση.</p></section>
<section class="compat-grid"><table><thead>${head}</thead><tbody>${body}</tbody></table></section>
${adSlot()}
<section class="stack"><h2>Όλα τα ζώδια</h2><div class="chips">${SIGNS.map((s) => `<a class="chip" href="${root}zodia/${s.slug}/index.html">${glyph(s.symbol)} ${s.name}</a>`).join('')}</div></section>`;
  return { path, ...page({ path, title: 'Συμβατότητα ζωδίων', description: 'Ποια ζώδια ταιριάζουν; Πίνακας συμβατότητας για όλους τους 78 συνδυασμούς ζωδίων στην αγάπη, τη φιλία και τη δουλειά.', content }) };
}

export function compatPairPage(i, j) {
  const a = SIGNS[i], b = SIGNS[j];
  const slug = pairSlug(i, j);
  const path = `symvatotita/${slug}/index.html`;
  const root = '../../';
  const sc = compatScores(i, j);
  const el = [a.element, b.element].sort().join('-');
  const mo = (() => { const order = ['cardinal', 'fixed', 'mutable']; return [a.modality, b.modality].sort((x, y) => order.indexOf(x) - order.indexOf(y)).join('-'); })();
  const same = i === j;
  const title = same ? `${a.name} και ${a.name}` : `${a.name} και ${b.name}`;
  const rulers = same
    ? `Και οι δύο έχουν κυβερνήτη ${BODY_NAMES[a.ruler].acc}, οπότε μοιράζονται τον ίδιο τρόπο να κινούνται στη ζωή.`
    : a.ruler === b.ruler
      ? `Και τα δύο ζώδια κυβερνώνται από ${BODY_NAMES[a.ruler].acc}, κάτι που τους δίνει μια κοινή βάση παρά τις διαφορές.`
      : `${BODY_NAMES[a.ruler].nom[0].toUpperCase() + BODY_NAMES[a.ruler].nom.slice(1)} ${a.gen} συναντά ${BODY_NAMES[b.ruler].acc} ${b.gen}: δύο διαφορετικές ενέργειες που, όταν συνεργάζονται, συμπληρώνουν η μία την άλλη.`;
  const content = `
<section class="stack"><p class="eyebrow">Συμβατότητα · ${C.DISTANCE[sc.k].title}</p>
<h1>${glyph(a.symbol)} ${title} ${glyph(b.symbol)}</h1>
<div class="ratings"><span class="rating">Αγάπη ${dots(sc.love)}</span><span class="rating">Φιλία ${dots(sc.friendship)}</span><span class="rating">Δουλειά ${dots(sc.work)}</span></div></section>
<section class="reading">
<p>${esc(C.DISTANCE[sc.k].text)}</p>
<h2>Τα στοιχεία: ${ELEMENTS[a.element].name}${same || a.element === b.element ? '' : ` και ${ELEMENTS[b.element].name}`}</h2>
<p>${esc(C.ELEMENT_PAIR[el])}</p>
<h2>Οι ποιότητες</h2>
<p>${esc(C.MODALITY_PAIR[mo])}</p>
<h2>Οι κυβερνήτες</h2>
<p>${esc(rulers)}</p>
</section>
${adSlot()}
<section class="split">
  <div class="stack"><h3><a href="${root}zodia/${a.slug}/index.html">${a.name}</a></h3><p class="muted">${a.dates}</p><p>${esc(a.love)}</p></div>
  ${same ? '' : `<div class="stack"><h3><a href="${root}zodia/${b.slug}/index.html">${b.name}</a></h3><p class="muted">${b.dates}</p><p>${esc(b.love)}</p></div>`}
</section>
<p><a href="../index.html">Όλοι οι συνδυασμοί ζωδίων</a></p>`;
  return { path, ...page({ path, title: `${title}: συμβατότητα`, description: `Ταιριάζουν ${title.replace(' και ', ' με ')}; Συμβατότητα στην αγάπη (${sc.love}/5), τη φιλία και τη δουλειά.`, content }) };
}

export function aboutPage() {
  const path = 'sxetika/index.html';
  const content = `
<section class="stack"><p class="eyebrow">Πώς δουλεύουμε</p><h1>Σχετικά με τις προβλέψεις</h1></section>
<section class="reading">
<p>Κάθε μέρα υπολογίζουμε τις πραγματικές θέσεις του Ήλιου, της Σελήνης και των πλανητών για την ώρα Αθήνας, με αστρονομικά μοντέλα του Jet Propulsion Laboratory της NASA για τους πλανήτες και του Jean Meeus για τη Σελήνη. Οι φάσεις της Σελήνης και οι ανάδρομοι πλανήτες βγαίνουν από τους ίδιους υπολογισμούς.</p>
<p>Οι ημερήσιες προβλέψεις στηρίζονται στους ηλιακούς οίκους: το ζώδιό σου θεωρείται πρώτος οίκος και κάθε επόμενο ζώδιο ο επόμενος οίκος. Όταν η Σελήνη ή ένας πλανήτης περνά από έναν οίκο, ενεργοποιεί τον αντίστοιχο τομέα της ζωής. Οι βαθμολογίες για την αγάπη, τη δουλειά και τη διάθεση προκύπτουν από τις όψεις της Σελήνης προς την Αφροδίτη, τον Ερμή, τον Δία, τον Κρόνο και τον Άρη.</p>
<p>Η αστρολογία δεν είναι επιστήμη. Οι προβλέψεις του site έχουν ψυχαγωγικό χαρακτήρα και δεν υποκαθιστούν επαγγελματικές συμβουλές για υγεία, οικονομικά ή νομικά θέματα.</p>
</section>`;
  return { path, ...page({ path, title: 'Σχετικά', description: 'Πώς υπολογίζονται οι θέσεις των πλανητών και οι ημερήσιες προβλέψεις.', content }) };
}

// ── Φόρμα στοιχείων γέννησης (κοινή) ─────────────────────────────────────
// Πεδία γέννησης με πρόθεμα (nc για ένα πρόσωπο, sa/sb για συναστρία)
const birthFields = (px, nameLabel = 'Όνομα <small class="muted">(προαιρετικά)</small>') => `
  <label class="field wide"><span>${nameLabel}</span><input id="${px}-name" type="text" autocomplete="off" maxlength="60"></label>
  <label class="field"><span>Ημερομηνία γέννησης</span><input id="${px}-date" type="date" min="1800-01-01" max="2050-12-31" required></label>
  <label class="field"><span>Ώρα γέννησης</span><input id="${px}-time" type="time" step="60"></label>
  <label class="check"><input id="${px}-notime" type="checkbox"> Δεν ξέρω την ώρα</label>
  <label class="field wide"><span>Τόπος γέννησης</span><input id="${px}-place" type="text" list="${px}-cities" placeholder="Γράψε πόλη, π.χ. Θεσσαλονίκη" autocomplete="off"><datalist id="${px}-cities"></datalist></label>
  <details id="${px}-custom" class="wide"><summary>Άλλος τόπος (με συντεταγμένες)</summary>
    <div class="custom-grid">
      <label class="field"><span>Γεωγραφικό πλάτος</span><input id="${px}-lat" type="text" inputmode="decimal" placeholder="π.χ. 38.25"></label>
      <label class="field"><span>Γεωγραφικό μήκος</span><input id="${px}-lon" type="text" inputmode="decimal" placeholder="π.χ. 21.73"></label>
      <label class="field"><span>Ζώνη ώρας</span><select id="${px}-tz"></select></label>
    </div>
    <p class="muted" style="font-size:.85rem">Βόρεια και ανατολικά με θετικό πρόσημο, νότια και δυτικά με αρνητικό. Η αλλαγή θερινής ώρας στη χρονιά γέννησης υπολογίζεται αυτόματα.</p>
  </details>`;

const birthFormHtml = (button) => `
<form id="nc-form" class="panel natal-form" novalidate>${birthFields('nc')}
  <p id="nc-error" class="error wide" role="alert" hidden></p>
  <label class="check wide"><input id="nc-remember" type="checkbox" checked> Θυμήσου τα στοιχεία μου σε αυτή τη συσκευή</label>
  <div class="wide"><button type="submit" class="btn">${button}</button></div>
</form>`;

// ── Γενέθλιος χάρτης (υπολογίζεται στον browser) ─────────────────────────
export function natalPage(script) {
  const path = 'xartis/index.html';
  const content = `
<section class="stack"><p class="eyebrow">Δωρεάν υπολογισμός</p><h1>Γενέθλιος χάρτης</h1>
<p class="lede">Βάλε ημερομηνία, ώρα και τόπο γέννησης για να δεις πού βρίσκονταν ο Ήλιος, η Σελήνη και οι πλανήτες τη στιγμή που γεννήθηκες, τον ωροσκόπο και τους οίκους σου. Ο υπολογισμός γίνεται στη συσκευή σου· τα στοιχεία σου δεν στέλνονται πουθενά.</p></section>
${birthFormHtml('Υπολόγισε τον χάρτη')}
${adSlot()}
<div id="nc-result" class="stack-lg"><noscript><p>Ο υπολογισμός του χάρτη χρειάζεται JavaScript.</p></noscript></div>
<script>${script}</script>`;
  return { path, ...page({ path, title: 'Γενέθλιος χάρτης δωρεάν', description: 'Υπολόγισε δωρεάν τον γενέθλιο χάρτη σου: ωροσκόπος, Σελήνη, θέσεις πλανητών, οίκοι και όψεις, με ερμηνείες στα ελληνικά.', content }) };
}

// ── Προσωπικό ημερήσιο ωροσκόπιο (υπολογίζεται στον browser) ─────────────
export function dailyPage(script) {
  const path = 'prosopiko/index.html';
  const content = `
<section class="stack"><p class="eyebrow">Από τον δικό σου χάρτη</p><h1>Προσωπικό ωροσκόπιο</h1>
<p class="lede">Η πρόβλεψη αυτή δεν βγαίνει από το ζώδιο, αλλά από το πώς κινούνται σήμερα η Σελήνη και οι πλανήτες σε σχέση με τις θέσεις τους τη στιγμή που γεννήθηκες. Βάλε μία φορά τα στοιχεία σου και η σελίδα θα σε θυμάται σε αυτή τη συσκευή.</p></section>
<details id="nc-details" class="birth-details"><summary>Τα στοιχεία γέννησής σου</summary>
${birthFormHtml('Δες το ωροσκόπιό μου')}
</details>
${adSlot()}
<div id="nc-result" class="stack-lg"><div class="panel stack"><h2>Ξεκίνα από τα στοιχεία γέννησης</h2><p>Συμπλήρωσε ημερομηνία, ώρα και τόπο γέννησης. Θα δεις τις ώρες της ημέρας που η Σελήνη αγγίζει τον χάρτη σου, τις επιρροές των γρήγορων πλανητών και τις μεγάλες περιόδους από τον Δία, τον Κρόνο και τους εξωτερικούς πλανήτες.</p><p class="muted">Ο υπολογισμός γίνεται στη συσκευή σου· τα στοιχεία σου δεν στέλνονται πουθενά.</p></div><noscript><p>Το ωροσκόπιο χρειάζεται JavaScript.</p></noscript></div>
<script>${script}</script>`;
  return { path, ...page({ path, title: 'Προσωπικό ημερήσιο ωροσκόπιο', description: 'Δωρεάν προσωπικό ωροσκόπιο από τον γενέθλιο χάρτη σου: οι όψεις της Σελήνης και των πλανητών με τον χάρτη σου, ώρα προς ώρα.', content }) };
}

// ── Συναστρία (υπολογίζεται στον browser) ────────────────────────────────
export function synastryPage(script) {
  const path = 'synastria/index.html';
  const content = `
<section class="stack"><p class="eyebrow">Δύο χάρτες μαζί</p><h1>Συναστρία</h1>
<p class="lede">Η συναστρία συγκρίνει τους γενέθλιους χάρτες δύο ανθρώπων: πώς ο Ήλιος, η Σελήνη, η Αφροδίτη και ο Άρης του ενός συναντούν τους πλανήτες του άλλου. Δείχνει πού υπάρχει έλξη, πού κατανόηση και πού χρειάζεται δουλειά.</p></section>
<form id="syn-form" class="syn-form" novalidate>
  <fieldset class="panel natal-form"><legend>Πρόσωπο Α</legend>${birthFields('sa', 'Όνομα')}</fieldset>
  <fieldset class="panel natal-form"><legend>Πρόσωπο Β</legend>${birthFields('sb', 'Όνομα')}</fieldset>
  <p id="syn-error" class="error wide" role="alert" hidden></p>
  <div class="wide"><button type="submit" class="btn">Σύγκρινε τους χάρτες</button> <span class="muted" style="font-size:.85rem">Ο υπολογισμός γίνεται στη συσκευή σου· τα στοιχεία δεν στέλνονται πουθενά.</span></div>
</form>
${adSlot()}
<div id="syn-result" class="stack-lg"><div class="panel stack"><h2>Συμπλήρωσε τα στοιχεία και των δύο</h2><p>Θα δεις βαθμολογίες για την έλξη, τη συναισθηματική σύνδεση, την επικοινωνία και τη σταθερότητα, τις σημαντικότερες όψεις ανάμεσα στους δύο χάρτες με ερμηνεία, και σε ποιους οίκους του ενός πέφτουν οι πλανήτες του άλλου.</p><p class="muted">Χωρίς ώρα γέννησης η συναστρία γίνεται κανονικά, απλώς χωρίς ωροσκόπο και οίκους.</p></div><noscript><p>Η συναστρία χρειάζεται JavaScript.</p></noscript></div>
<script>${script}</script>`;
  return { path, ...page({ path, title: 'Συναστρία: ταιριάζουμε;', description: 'Δωρεάν συναστρία δύο γενέθλιων χαρτών: έλξη, συναισθηματική σύνδεση, επικοινωνία και σταθερότητα στη σχέση, με ερμηνείες στα ελληνικά.', content }) };
}

// ── Εφημερίδα πλανητών (ανά μήνα) ────────────────────────────────────────
const MONTHS = ['Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'];
const MONTHS_GEN = ['Ιανουαρίου', 'Φεβρουαρίου', 'Μαρτίου', 'Απριλίου', 'Μαΐου', 'Ιουνίου', 'Ιουλίου', 'Αυγούστου', 'Σεπτεμβρίου', 'Οκτωβρίου', 'Νοεμβρίου', 'Δεκεμβρίου'];
const WEEKDAYS = ['Κυ', 'Δε', 'Τρ', 'Τε', 'Πε', 'Πα', 'Σα'];

export function ephemerisMonths(iso, count = 12) {
  const [y, m] = iso.split('-').map(Number);
  return Array.from({ length: count }, (_, k) => { const d = new Date(Date.UTC(y, m - 1 + k, 1)); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1 }; });
}
const monthPath = (mo, first) => (first ? 'efimerida/index.html' : `efimerida/${mo.y}-${String(mo.m).padStart(2, '0')}/index.html`);

export function ephemerisPage(months, k) {
  const mo = months[k];
  const path = monthPath(mo, k === 0);
  const root = k === 0 ? '../' : '../../';
  const days = new Date(Date.UTC(mo.y, mo.m, 0)).getUTCDate();
  const cell = (p) => `<td class="num${p.retro ? ' rx' : ''}">${Math.floor(p.deg)}${glyph(SIGNS[p.sign].symbol)}${String(Math.floor((p.deg % 1) * 60)).padStart(2, '0')}${p.retro ? '<sup>R</sup>' : ''}</td>`;
  const rows = [];
  for (let d = 1; d <= days; d++) {
    const date = new Date(Date.UTC(mo.y, mo.m - 1, d, 0, 0));
    const pos = E.positions(date);
    rows.push(`<tr><th scope="row" class="num">${d} <span class="muted">${WEEKDAYS[date.getUTCDay()]}</span></th>${ALL.map((b) => cell(pos[b])).join('')}</tr>`);
  }
  const start = new Date(Date.UTC(mo.y, mo.m - 1, 1)), end = new Date(Date.UTC(mo.y, mo.m, 1));
  const events = upcomingEvents(start, (end - start) / 86400000, true);
  const nav = (j, label) => (months[j] ? `<a href="${root}${monthPath(months[j], j === 0)}">${label}</a>` : '<span></span>');
  const title = `${MONTHS[mo.m - 1]} ${mo.y}`;
  const content = `
<section class="stack"><p class="eyebrow">Εφημερίδα πλανητών</p><h1>${title}</h1>
<p class="lede">Οι θέσεις του Ήλιου, της Σελήνης, των πλανητών και του Βόρειου Δεσμού για κάθε μέρα του ${MONTHS_GEN[mo.m - 1]} ${mo.y}, στις 00:00 παγκόσμια ώρα (${mo.m === 3 || mo.m === 10 ? '02:00 ή 03:00, ανάλογα με τη θερινή ώρα' : mo.m >= 4 && mo.m <= 9 ? '03:00' : '02:00'} ώρα Ελλάδας). Το R σημαίνει ανάδρομη κίνηση.</p>
<div class="month-nav">${nav(k - 1, `‹ ${months[k - 1] ? MONTHS[months[k - 1].m - 1] : ''}`)}${nav(k + 1, `${months[k + 1] ? MONTHS[months[k + 1].m - 1] : ''} ›`)}</div></section>
<section class="table-wrap eph"><table><thead><tr><th>Ημέρα</th>${ALL.map((b) => `<th title="${BODY_NAMES[b].short}">${glyph(BODY_NAMES[b].glyph)}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></section>
${adSlot()}
<section class="stack-lg"><h2>Τα γεγονότα του μήνα</h2>
<div class="table-wrap"><table><thead><tr><th>Πότε</th><th>Γεγονός</th></tr></thead><tbody>
${events.map((e) => `<tr><td class="num" style="white-space:nowrap">${fmtWhen(e.date)}</td><td>${e.text}</td></tr>`).join('')}
</tbody></table></div><p class="muted">Ώρες Ελλάδας.</p></section>
<section class="stack"><h2>Άλλοι μήνες</h2><div class="chips">${months.map((x, j) => `<a class="chip"${j === k ? ' aria-current="page"' : ''} href="${root}${monthPath(x, j === 0)}">${MONTHS[x.m - 1]} ${x.y}</a>`).join('')}</div></section>`;
  return { path, ...page({ path, title: `Εφημερίδα πλανητών ${title}`, description: `Θέσεις πλανητών ${MONTHS_GEN[mo.m - 1]} ${mo.y}: Ήλιος, Σελήνη, Ερμής, Αφροδίτη, Άρης, Δίας, Κρόνος, Ουρανός, Ποσειδώνας, Πλούτωνας και Δεσμός για κάθε μέρα, με ανάδρομους, φάσεις Σελήνης και εισόδους σε ζώδια.`, content }) };
}

// ── Νομικές σελίδες και επικοινωνία ──────────────────────────────────────
const C_ = () => config.company;

export function privacyPage() {
  const path = 'apporito/index.html';
  const c = C_();
  const content = `
<section class="stack"><p class="eyebrow">Τελευταία ενημέρωση: 5 Νοεμβρίου 2026</p><h1>Πολιτική απορρήτου</h1>
<p class="lede">Πώς χειριζόμαστε τα δεδομένα σου όταν χρησιμοποιείς το ${esc(config.siteName)}.</p></section>
<section class="reading legal">
<h2>Υπεύθυνος επεξεργασίας</h2>
<p>${esc(c.name)}, ${esc(c.address)}. Email: <strong>${esc(c.email)}</strong></p>
<h2>Στοιχεία γέννησης</h2>
<p>Ο γενέθλιος χάρτης, το προσωπικό ωροσκόπιο και η συναστρία υπολογίζονται μέσα στον browser σου. Η ημερομηνία, η ώρα και ο τόπος γέννησης που συμπληρώνεις δεν στέλνονται σε κανέναν server και δεν τα βλέπουμε. Αν επιλέξεις «Θυμήσου τα στοιχεία μου», αποθηκεύονται μόνο στη συσκευή σου (στη μνήμη του browser) και μπορείς να τα σβήσεις όποτε θέλεις, ξετσεκάροντας την επιλογή ή διαγράφοντας τα δεδομένα του site από τον browser. Τα στοιχεία του δεύτερου προσώπου στη συναστρία δεν αποθηκεύονται ποτέ.</p>
<h2>Google Analytics</h2>
<p>Αν πατήσεις «Αποδοχή» στη μπάρα cookies, χρησιμοποιούμε το Google Analytics της Google Ireland Ltd για να μετράμε ανώνυμα την επισκεψιμότητα: ποιες σελίδες διαβάζονται, από ποια χώρα και συσκευή, πώς έφτασες στο site. Το Google Analytics χρησιμοποιεί cookies και επεξεργάζεται τη διεύθυνση IP σου. Νομική βάση είναι η συγκατάθεσή σου. Αν πατήσεις «Απόρριψη», δεν αποθηκεύεται κανένα cookie μέτρησης. Μπορείς να αλλάξεις την επιλογή σου οποιαδήποτε στιγμή από τον σύνδεσμο «Ρυθμίσεις cookies» στο κάτω μέρος κάθε σελίδας.</p>
<h2>Φιλοξενία</h2>
<p>Το site φιλοξενείται στο GitHub Pages της GitHub, Inc. Όπως κάθε server, καταγράφει τεχνικά στοιχεία των επισκέψεων (διεύθυνση IP, browser) για λόγους ασφάλειας και λειτουργίας, σύμφωνα με τη δική του πολιτική απορρήτου.</p>
<h2>Διαφημίσεις</h2>
<p>Στο μέλλον το site ενδέχεται να προβάλλει διαφημίσεις μέσω του Google AdSense. Πριν συμβεί αυτό θα ενημερωθεί η παρούσα πολιτική και θα σου ζητηθεί ξεχωριστή συγκατάθεση για εξατομικευμένες διαφημίσεις.</p>
<h2>Τα δικαιώματά σου</h2>
<p>Σύμφωνα με τον Γενικό Κανονισμό Προστασίας Δεδομένων (ΓΚΠΔ), έχεις δικαίωμα πρόσβασης, διόρθωσης, διαγραφής, περιορισμού, φορητότητας και εναντίωσης, καθώς και δικαίωμα να ανακαλέσεις τη συγκατάθεσή σου. Για οτιδήποτε, γράψε μας στο ${esc(c.email)}. Έχεις επίσης δικαίωμα να υποβάλεις καταγγελία στην Αρχή Προστασίας Δεδομένων Προσωπικού Χαρακτήρα (www.dpa.gr).</p>
</section>`;
  return { path, ...page({ path, title: 'Πολιτική απορρήτου', description: `Πολιτική απορρήτου και cookies του ${config.siteName}.`, content }) };
}

export function termsPage() {
  const path = 'oroi/index.html';
  const c = C_();
  const content = `
<section class="stack"><p class="eyebrow">Τελευταία ενημέρωση: 5 Νοεμβρίου 2026</p><h1>Όροι χρήσης</h1></section>
<section class="reading legal">
<h2>Ποιος είμαστε</h2>
<p>Το ${esc(config.siteName)} λειτουργεί από την ${esc(c.name)}, ${esc(c.address)}.</p>
<h2>Ψυχαγωγικός χαρακτήρας</h2>
<p>Οι αστρολογικές προβλέψεις, οι ερμηνείες, οι βαθμολογίες και η συμβατότητα ζωδίων παρέχονται αποκλειστικά για ψυχαγωγία. Η αστρολογία δεν είναι επιστήμη. Το περιεχόμενο δεν αποτελεί συμβουλή για υγεία, οικονομικά, νομικά θέματα, σχέσεις ή οποιαδήποτε απόφαση, και δεν φέρουμε ευθύνη για αποφάσεις που παίρνονται με βάση αυτό.</p>
<h2>Ακρίβεια υπολογισμών</h2>
<p>Οι θέσεις των πλανητών υπολογίζονται με αστρονομικά μοντέλα υψηλής ακρίβειας, χωρίς όμως εγγύηση ότι είναι απαλλαγμένες από λάθη. Οι χρόνοι αναφέρονται σε ώρα Ελλάδας, εκτός αν σημειώνεται διαφορετικά.</p>
<h2>Πνευματικά δικαιώματα</h2>
<p>Τα κείμενα, ο σχεδιασμός και ο κώδικας του site ανήκουν στην ${esc(c.name)}. Επιτρέπεται η κοινοποίηση συνδέσμων. Η αναδημοσίευση κειμένων επιτρέπεται μόνο με αναφορά και σύνδεσμο προς την πηγή.</p>
<h2>Σύνδεσμοι προς τρίτους</h2>
<p>Το site μπορεί να περιέχει συνδέσμους προς καταστήματα ή άλλα sites, ορισμένοι από τους οποίους είναι συνεργατικοί (affiliate): αν αγοράσεις κάτι μέσα από αυτούς, ενδέχεται να λάβουμε προμήθεια, χωρίς επιβάρυνση για σένα. Δεν ευθυνόμαστε για το περιεχόμενο των sites τρίτων.</p>
<h2>Επικοινωνία</h2>
<p>Για ερωτήσεις σχετικά με τους όρους: ${esc(c.email)}.</p>
</section>`;
  return { path, ...page({ path, title: 'Όροι χρήσης', description: `Όροι χρήσης του ${config.siteName}.`, content }) };
}

export function contactPage() {
  const path = 'epikoinonia/index.html';
  const c = C_();
  const content = `
<section class="stack"><p class="eyebrow">Είμαστε εδώ</p><h1>Επικοινωνία</h1>
<p class="lede">Για ερωτήσεις, παρατηρήσεις, προτάσεις ή συνεργασίες, γράψε μας.</p></section>
<section class="panel stack">
<p><strong>Email:</strong> <span class="num" style="user-select:all">${esc(c.email)}</span></p>
<p><strong>Εταιρεία:</strong> ${esc(c.name)}</p>
<p><strong>Διεύθυνση:</strong> ${esc(c.address)}</p>
</section>
<p class="muted">Οι προβλέψεις υπολογίζονται αυτόματα από τις θέσεις των πλανητών, οπότε δεν μπορούμε να απαντάμε σε προσωπικές αστρολογικές ερωτήσεις. Για τον δικό σου χάρτη δοκίμασε τον <a href="../xartis/index.html">γενέθλιο χάρτη</a> και το <a href="../prosopiko/index.html">προσωπικό ωροσκόπιο</a>.</p>`;
  return { path, ...page({ path, title: 'Επικοινωνία', description: `Επικοινωνία με το ${config.siteName}.`, content }) };
}
