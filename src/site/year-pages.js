// Ετήσιες προβλέψεις: /zodia-YYYY/ και /zodia-YYYY/<ζώδιο>/
import { SIGNS, BODY_NAMES } from '../content/signs.js';
import { HOUSE_AREA, HOUSE_TOPIC, MERCURY_RX_HOUSE } from '../content/daily-texts.js';
import * as Y from '../content/year-texts.js';
import { houseOf } from '../forecast.js';
import { fmtDate, todayInAthens } from '../horoscope.js';
import { page, esc, glyph, adSlot, articleLd, ogImage } from './layout.js';

const MONTHS = ['Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'];
const day = (d) => fmtDate(d, { day: 'numeric', month: 'long' });
// «τις 5 Μαρτίου» / «την 1η Μαρτίου»
const at = (d) => { const t = day(d); return t.startsWith('1 ') ? `την 1η${t.slice(1)}` : `τις ${t}`; };
let Y0 = null, Y1 = null; // όρια του έτους που χτίζεται (για «έως…» / «ως το τέλος της χρονιάς»)
const range = (a, b) => (Y0 && a <= Y0 ? `Έως ${at(b)}` : Y1 && b >= Y1 ? `Από ${at(a)} και ως το τέλος της χρονιάς` : `Από ${at(a)} έως ${at(b)}`);
const span = (a, b) => (Y0 && a <= Y0 ? `έως ${day(b)}` : Y1 && b >= Y1 ? `από ${day(a)}` : `${day(a)} – ${day(b)}`);
const list = (xs) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} και ${xs[xs.length - 1]}`);
const cap = (x) => x[0].toUpperCase() + x.slice(1);
const monthOf = (d) => +fmtDate(d, { month: 'numeric' }) - 1;
export const yearPath = (year, s) => (s ? `zodia-${year}/${s.slug}/index.html` : `zodia-${year}/index.html`);

// Διαστήματα που ένα σώμα περνά από συγκεκριμένους οίκους του ζωδίου
const spansIn = (ys, body, i, houses) => ys.spans[body].filter((s) => houses.includes(houseOf(i, s.sign)) && s.to > ys.from && s.from < ys.to)
  .map((s) => ({ ...s, from: s.from < ys.from ? ys.from : s.from, to: s.to > ys.to ? ys.to : s.to, house: houseOf(i, s.sign) }));

export function yearForecast(ys, i) {
  const h = (b, m) => houseOf(i, ys.months[m].pos[b].sign);
  const score = { love: [], work: [] };
  const care = new Map();
  const addCare = (m, why) => { if (!care.has(m)) care.set(m, []); care.get(m).push(why); };
  for (let m = 0; m < 12; m++) {
    let love = 0, work = 0;
    const v = h('venus', m), ma = h('mars', m), su = h('sun', m), ju = h('jupiter', m);
    if ([0, 4, 6].includes(v)) love += 2; else if ([10, 8].includes(v)) love += 1;
    if ([4, 6].includes(ma)) love += 1;
    if (su === 4) love += 1;
    if (su === 9) work += 2; if (su === 0) work += 1;
    if ([9, 5].includes(ma)) work += 1;
    if ([1, 9].includes(v)) work += 1;
    if ([1, 5, 9].includes(ju)) work += 1;
    score.love.push(love); score.work.push(work);
  }
  for (const r of ys.retro.mercury) addCare(monthOf(r.from), `Ερμής ανάδρομος ${HOUSE_AREA[houseOf(i, r.signFrom)]}`);
  for (const r of ys.retro.mars) addCare(monthOf(r.from), `Άρης ανάδρομος ${HOUSE_AREA[houseOf(i, r.signFrom)]}`);
  for (const e of ys.eclipses) if ([0, 6, 9, 3].includes(houseOf(i, e.sign))) addCare(monthOf(e.date), `έκλειψη ${e.type === 'solar' ? 'Ηλίου' : 'Σελήνης'} ${HOUSE_AREA[houseOf(i, e.sign)]}`);
  // Καλύτεροι μήνες: οι 3 με την υψηλότερη βαθμολογία (ισοπαλία → νωρίτερος μήνας), με ελάχιστο 2
  const best = (arr) => arr.map((v, m) => [v, m]).filter(([v]) => v >= 2).sort((a, b) => b[0] - a[0] || a[1] - b[1]).slice(0, 3).map(([, m]) => m).sort((a, b) => a - b);
  return { best: { love: best(score.love), work: best(score.work) }, care: [...care.entries()].sort((a, b) => a[0] - b[0]) };
}

function sections(ys, i) {
  Y0 = ys.from; Y1 = ys.to;
  const s = SIGNS[i];
  const jup = ys.spans.jupiter, sat = ys.spans.saturn;
  const fc = yearForecast(ys, i);

  // Η μεγάλη εικόνα
  const big = [];
  jup.forEach((sp, k) => {
    const hh = houseOf(i, sp.sign);
    const when = jup.length === 1 ? 'Όλη τη χρονιά' : k === 0 ? `Έως ${at(sp.to)}` : `Από ${at(sp.from)}`;
    big.push(`<div class="stack"><h3>${glyph('♃')} ${when}: ο Δίας ${SIGNS[sp.sign].inSign}</h3><p>${esc(Y.JUPITER_YEAR[hh])}</p></div>`);
  });
  sat.forEach((sp) => {
    const hh = houseOf(i, sp.sign);
    big.push(`<div class="stack"><h3>${glyph('♄')} ${sat.length === 1 ? 'Όλη τη χρονιά' : range(sp.from, sp.to)}: ο Κρόνος ${SIGNS[sp.sign].inSign}</h3><p>${esc(Y.SATURN_YEAR[hh])}</p></div>`);
  });
  const outer = ['uranus', 'neptune', 'pluto'].map((b) => {
    const sp = ys.spans[b];
    const main = sp.reduce((a, x) => ((x.to - x.from) > (a.to - a.from) ? x : a));
    return Y.OUTER[b](HOUSE_AREA[houseOf(i, main.sign)]);
  });

  // Έρωτας
  const venusLove = spansIn(ys, 'venus', i, [4, 6]);
  const marsLove = spansIn(ys, 'mars', i, [4, 6]);
  const love = [];
  if (venusLove.length) love.push(`Η Αφροδίτη, ο πλανήτης του έρωτα, περνά από ${list(venusLove.map((v) => `${v.house === 4 ? 'τον τομέα του έρωτα' : 'τον τομέα των σχέσεων'} (${span(v.from, v.to)})`))}. Αυτές είναι οι περίοδοι με τη μεγαλύτερη ζεστασιά: ιδανικές για γνωριμίες, ραντεβού και για να δώσεις χρόνο στη σχέση σου.`);
  const vSelf = spansIn(ys, 'venus', i, [0]);
  if (vSelf.length) love.push(`${range(vSelf[0].from, vSelf[0].to)} η Αφροδίτη βρίσκεται στο ζώδιό σου και σε κάνει πιο ελκυστικό και κοινωνικό.`);
  if (marsLove.length) love.push(`${range(marsLove[0].from, marsLove[0].to)} ο Άρης ${marsLove[0].house === 4 ? 'στον τομέα του έρωτα ανάβει το πάθος' : 'στον τομέα των σχέσεων φέρνει πάθος αλλά και αντιπαραθέσεις'}· διάλεξε με προσοχή τις μάχες σου.`);
  const eclLove = ys.eclipses.filter((e) => [4, 6].includes(houseOf(i, e.sign)));
  if (eclLove.length) love.push(eclLove.length === 1 ? `Η έκλειψη ${at(eclLove[0].date).replace(/^τ(ις|ην)/, (x) => (x === 'την' ? 'στην' : 'στις'))} αγγίζει τα αισθηματικά: μια σχέση μπορεί να περάσει σε νέα φάση.` : `Οι εκλείψεις ${list(eclLove.map((e) => `στις ${day(e.date)}`))} αγγίζουν τα αισθηματικά: μια σχέση μπορεί να περάσει σε νέα φάση.`);
  if (ys.retro.venus.length) love.push(...ys.retro.venus.map((r) => `${range(r.from, r.to)} η Αφροδίτη είναι ανάδρομη: δεν είναι η καλύτερη στιγμή για βιαστικές δεσμεύσεις.`));

  // Δουλειά & χρήματα
  const work = [];
  const sun10 = spansIn(ys, 'sun', i, [9]);
  if (sun10.length) work.push(`${range(sun10[0].from, sun10[0].to)} ο Ήλιος περνά από τον τομέα της καριέρας σου: η πιο φωτεινή περίοδος της χρονιάς για να φανεί η δουλειά σου.`);
  const marsWork = spansIn(ys, 'mars', i, [9, 5]);
  marsWork.slice(0, 2).forEach((m) => work.push(`${range(m.from, m.to)} ο Άρης ${m.house === 9 ? 'στον τομέα της καριέρας σού δίνει φιλοδοξία και ώθηση' : 'στον τομέα της καθημερινής δουλειάς σε κάνει παραγωγικό, αλλά και κουρασμένο αν δεν κάνεις διαλείμματα'}.`));
  const venusMoney = spansIn(ys, 'venus', i, [1, 7]);
  if (venusMoney.length) work.push(`Για τα οικονομικά, ευνοϊκές περίοδοι είναι ${list(venusMoney.map((v) => `${span(v.from, v.to)} (${v.house === 1 ? 'έσοδα' : 'κοινά οικονομικά'})`))}, όταν η Αφροδίτη περνά από τους τομείς των χρημάτων.`);
  const mercWork = ys.retro.mercury.filter((r) => [9, 5, 1, 2].includes(houseOf(i, r.signFrom)));
  if (mercWork.length) work.push(`Προσοχή ${list(mercWork.map((r) => span(r.from, r.to)))}: ο ανάδρομος Ερμής αγγίζει τη δουλειά ή τα οικονομικά, οπότε έλεγξε συμβόλαια, πληρωμές και email δύο φορές.`);

  // Προσωπικά
  const personal = [];
  const birth = spansIn(ys, 'sun', i, [0]);
  if (birth.length) personal.push(`${range(birth[0].from, birth[0].to)} ο Ήλιος βρίσκεται στο ζώδιό σου: είναι ο μήνας των γενεθλίων σου και η αρχή του προσωπικού σου νέου χρόνου.`);
  const marsSelf = spansIn(ys, 'mars', i, [0]);
  if (marsSelf.length) personal.push(`${range(marsSelf[0].from, marsSelf[0].to)} ο Άρης στο ζώδιό σου σού δίνει ενέργεια και θάρρος· πρόσεξε μόνο τον τόνο και τη βιασύνη.`);
  ys.retro.mars.forEach((r) => personal.push(Y.MARS_RX(range(r.from, r.to), HOUSE_AREA[houseOf(i, r.signFrom)]) + (r.signTo !== r.signFrom ? ` Προς το τέλος της περιόδου επιστρέφει ${SIGNS[r.signTo].inSign}, ${HOUSE_AREA[houseOf(i, r.signTo)]}.` : '')));

  // Μήνα μήνα
  const monthly = ys.months.map((mo) => {
    const m = mo.m, lines = [], dated = [];
    const sunIn = ys.spans.sun.find((sp) => sp.from > ys.from && sp.from >= mo.from && sp.from < mo.to);
    if (sunIn) lines.push(`Από ${at(sunIn.from)} ${Y.MONTH_LINE.sun(HOUSE_TOPIC[houseOf(i, sunIn.sign)])}`);
    if (sunIn && houseOf(i, sunIn.sign) === 0) lines.push(Y.MONTH_LINE.birthday);
    ys.eclipses.filter((e) => e.date >= mo.from && e.date < mo.to).forEach((e) => dated.push([e.date, `${day(e.date)}: ${(e.type === 'solar' ? Y.MONTH_LINE.solarEclipse : Y.MONTH_LINE.lunarEclipse)(HOUSE_AREA[houseOf(i, e.sign)])}`]));
    ys.retro.mercury.filter((r) => r.from >= mo.from && r.from < mo.to).forEach((r) => dated.push([r.from, `${day(r.from)}: ${Y.MONTH_LINE.mercuryRx(HOUSE_AREA[houseOf(i, r.signFrom)])}`]));
    ys.retro.mars.filter((r) => r.from >= mo.from && r.from < mo.to).forEach((r) => dated.push([r.from, `${day(r.from)}: ${Y.MONTH_LINE.marsRx(HOUSE_AREA[houseOf(i, r.signFrom)])}`]));
    jup.slice(1).filter((sp) => sp.from >= mo.from && sp.from < mo.to).forEach((sp) => dated.push([sp.from, `${day(sp.from)}: ${Y.MONTH_LINE.jupiterIn(HOUSE_AREA[houseOf(i, sp.sign)])}`]));
    lines.push(...dated.sort((a, b) => a[0] - b[0]).map((x) => x[1]));
    const v = houseOf(i, mo.pos.venus.sign), ma = houseOf(i, mo.pos.mars.sign);
    if ([4, 6, 0].includes(v)) lines.push(Y.MONTH_LINE.venusLove); else if ([1, 7].includes(v)) lines.push(Y.MONTH_LINE.venusMoney);
    if (ma === 0) lines.push(Y.MONTH_LINE.marsSelf); else if (ma === 9) lines.push(Y.MONTH_LINE.marsWork); else if (ma === 6) lines.push(Y.MONTH_LINE.marsLove);
    return { m, lines };
  });

  return { s, fc, big, outer, love, work, personal, monthly };
}

export function yearSignPage(ys, i) {
  const { s, fc, big, outer, love, work, personal, monthly } = sections(ys, i);
  const path = yearPath(ys.year, s);
  const root = '../../';
  const P = (xs) => xs.map((x) => `<p>${esc(x)}</p>`).join('');
  const mNames = (ms) => (ms.length ? ms.map((m) => `<span class="chip">${MONTHS[m]}</span>`).join('') : '<span class="muted">Καμία περίοδος δεν ξεχωρίζει ιδιαίτερα.</span>');
  const others = SIGNS.map((o) => `<a class="chip"${o === s ? ' aria-current="page"' : ''} href="${root}${yearPath(ys.year, o)}">${glyph(o.symbol)} ${o.name}</a>`).join('');
  const eclRows = ys.eclipses.map((e) => `<li><strong>${day(e.date)}</strong> · ${e.type === 'solar' ? 'Έκλειψη Ηλίου' : 'Έκλειψη Σελήνης'} ${SIGNS[e.sign].inSign} ${glyph(SIGNS[e.sign].symbol)}<br>${esc((e.type === 'solar' ? Y.ECLIPSE.solar : Y.ECLIPSE.lunar)(HOUSE_AREA[houseOf(i, e.sign)]))}</li>`).join('');
  const rx = ys.retro.mercury.map((r) => `<li><strong>${day(r.from)} – ${day(r.to)}</strong> · ${esc(MERCURY_RX_HOUSE[houseOf(i, r.signFrom)])}</li>`).join('');
  const careHtml = fc.care.map(([m, why]) => `<li><strong>${MONTHS[m]}</strong>: ${esc(list(why))}</li>`).join('');
  const content = `
<section class="hero-sign el-${s.element}">${glyph(s.symbol)}<h1>${s.name} ${ys.year}</h1><p class="muted">Ετήσια πρόβλεψη · ${s.dates}</p></section>
<section class="stack-lg">
  <p class="lede">Τι φέρνει το ${ys.year} ${s.inSign}: η πρόβλεψη βασίζεται στις πραγματικές κινήσεις των πλανητών μέσα στη χρονιά, μετρημένες από το ζώδιό σου (ηλιακοί οίκοι).</p>
  <div class="trio">
    <div class="panel stack"><h3>${Y.BEST.love}</h3><div class="chips">${mNames(fc.best.love)}</div></div>
    <div class="panel stack"><h3>${Y.BEST.work}</h3><div class="chips">${mNames(fc.best.work)}</div></div>
    <div class="panel stack"><h3>${Y.BEST.care}</h3>${careHtml ? `<ul class="plain">${careHtml}</ul>` : '<p class="muted">Καμία περίοδος δεν ξεχωρίζει ιδιαίτερα.</p>'}</div>
  </div>
</section>
<section class="stack-lg"><h2>Η μεγάλη εικόνα του ${ys.year}</h2><div class="readings">${big.join('')}</div><div class="reading">${P(outer)}</div></section>
${adSlot()}
<section class="split">
  <div class="stack"><h2>Έρωτας και σχέσεις</h2><div class="reading">${P(love.length ? love : ['Η χρονιά δεν φέρνει μεγάλες πλανητικές κινήσεις στον τομέα του έρωτα· οι αλλαγές θα έρθουν κυρίως από τις δικές σου επιλογές.'])}</div></div>
  <div class="stack"><h2>Δουλειά και χρήματα</h2><div class="reading">${P(work)}</div></div>
</section>
<section class="stack"><h2>Εσύ και η ενέργειά σου</h2><div class="reading">${P(personal)}</div></section>
<section class="stack-lg"><h2>Το ${ys.year} μήνα μήνα</h2>
  <div class="months-grid">${monthly.map((mo) => `<div class="panel stack"><h3>${MONTHS[mo.m]}</h3><ul class="plain">${mo.lines.map((l) => `<li>${esc(cap(l))}</li>`).join('')}</ul></div>`).join('')}</div>
</section>
${adSlot()}
<section class="split">
  <div class="stack"><h2>Οι εκλείψεις του ${ys.year}</h2><ul class="plain stack">${eclRows}</ul></div>
  <div class="stack"><h2>Ο ανάδρομος Ερμής το ${ys.year}</h2><ul class="plain stack">${rx}</ul></div>
</section>
<section class="stack">
  <h2>Οι προβλέψεις ${ys.year} για όλα τα ζώδια</h2><div class="chips">${others}</div>
  <p><a href="${root}zodia/${s.slug}/index.html">${s.name}: η ημερήσια πρόβλεψη</a> · <a href="${root}xartis/index.html">Ο γενέθλιος χάρτης σου</a></p>
  <p class="muted" style="font-size:.85rem">Οι ετήσιες προβλέψεις αφορούν το ηλιακό ζώδιο. Για πιο προσωπική εικόνα, ο ωροσκόπος σου δίνει μια δεύτερη ανάγνωση: διάβασε και την πρόβλεψη του ζωδίου του ωροσκόπου σου.</p>
</section>`;
  const firstJ = big.length ? Y.JUPITER_YEAR[houseOf(i, ys.spans.jupiter[0].sign)].split('. ')[0] : '';
  return { path, ...page({
    path, title: `${s.name} ${ys.year}: ετήσια πρόβλεψη για έρωτα, δουλειά και χρήματα`,
    description: `Ζώδια ${ys.year}: τι φέρνει η χρονιά ${s.inSign}. Καλύτεροι μήνες για έρωτα και δουλειά, εκλείψεις, ανάδρομος Ερμής και πρόβλεψη μήνα μήνα. ${firstJ}.`.slice(0, 300),
    content,
    jsonLd: articleLd({ path, headline: `${s.name} ${ys.year}: ετήσια πρόβλεψη για έρωτα, δουλειά και χρήματα`, description: `Ζώδια ${ys.year}: τι φέρνει η χρονιά ${s.inSign}.`, published: `${ys.year - 1}-10-01`, modified: todayInAthens(), image: ogImage(s.slug) }),
  }) };
}

export function yearIndexPage(ys) {
  const path = yearPath(ys.year);
  const root = '../';
  const cards = SIGNS.map((s, i) => {
    const fc = yearForecast(ys, i);
    return `<a class="sign-card el-${s.element}" href="${root}${yearPath(ys.year, s)}">${glyph(s.symbol)}<strong>${s.name} ${ys.year}</strong><small>${s.dates}</small><span class="muted" style="font-size:.8rem">Έρωτας: ${fc.best.love.map((m) => MONTHS[m].slice(0, 3)).join(', ') || '—'}</span></a>`;
  }).join('');
  const jup = ys.spans.jupiter.map((sp, k) => `${k === 0 ? (ys.spans.jupiter.length > 1 ? `έως ${at(sp.to)}` : 'όλη τη χρονιά') : `από ${at(sp.from)}`} ${SIGNS[sp.sign].inSign}`).join(' και ');
  const sat = ys.spans.saturn.map((sp) => SIGNS[sp.sign].inSign).join(' και ');
  const ecl = ys.eclipses.map((e) => `<li><strong>${day(e.date)}</strong> · ${e.type === 'solar' ? 'Έκλειψη Ηλίου' : 'Έκλειψη Σελήνης'} ${SIGNS[e.sign].inSign}</li>`).join('');
  const rx = [...ys.retro.mercury.map((r) => ['Ερμής', r]), ...ys.retro.venus.map((r) => ['Αφροδίτη', r]), ...ys.retro.mars.map((r) => ['Άρης', r])]
    .map(([n, r]) => `<li><strong>${n}</strong> · ${day(r.from)} – ${day(r.to)} (${SIGNS[r.signFrom].name}${r.signTo !== r.signFrom ? ` → ${SIGNS[r.signTo].name}` : ''})</li>`).join('');
  const content = `
<section class="stack"><p class="eyebrow">Ετήσιες προβλέψεις</p><h1>Ζώδια ${ys.year}</h1>
<p class="lede">Τι φέρνει το ${ys.year} σε κάθε ζώδιο, από τις πραγματικές κινήσεις των πλανητών: ο Δίας ${jup}, ο Κρόνος ${sat}, ${ys.eclipses.length} εκλείψεις και ${ys.retro.mercury.length} περίοδοι ανάδρομου Ερμή.</p></section>
<section class="stack-lg"><h2>Διάλεξε το ζώδιό σου</h2><div class="signs">${cards}</div></section>
${adSlot()}
<section class="split">
  <div class="stack"><h2>Οι εκλείψεις του ${ys.year}</h2><ul class="plain stack">${ecl}</ul></div>
  <div class="stack"><h2>Ανάδρομοι πλανήτες το ${ys.year}</h2><ul class="plain stack">${rx}</ul><p class="muted" style="font-size:.85rem">Οι αργοί πλανήτες (Δίας έως Πλούτωνας) γυρίζουν ανάδρομοι κάθε χρόνο για μερικούς μήνες· δες την <a href="${root}efimerida/index.html">Εφημερίδα</a> για όλες τις ημερομηνίες.</p></div>
</section>`;
  return { path, ...page({ path, title: `Ζώδια ${ys.year}: ετήσιες προβλέψεις για όλα τα ζώδια`, description: `Ζώδια ${ys.year}: ετήσια πρόβλεψη για τα 12 ζώδια, καλύτεροι μήνες για έρωτα και δουλειά, οι εκλείψεις και ο ανάδρομος Ερμής του ${ys.year}.`, content }) };
}
