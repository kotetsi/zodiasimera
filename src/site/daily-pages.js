// Ημερήσιες σελίδες «όλα τα ζώδια»:
//  - zodia-simera/YYYY-MM-DD/  μία σελίδα ανά ημέρα με την πλήρη πρόβλεψη και των 12 ζωδίων (μόνιμο αρχείο)
//  - zodia-simera/             ημερολόγιο του αρχείου
//  - zodia-avrio/              σύντομη πρόβλεψη της αυριανής για όλα τα ζώδια
import { SIGNS, BODY_NAMES, PHASE_NAMES } from '../content/signs.js';
import { horoscopeFor, fmtTime, fmtDate, fmtIsoLong, athensTime, addDays } from '../horoscope.js';
import { page, esc, glyph, adSlot, ogImage, articleLd, breadcrumbLd, crumbs } from './layout.js';
import { luckFor, luckHtml } from './luck.js';

const cap = (x) => x[0].toUpperCase() + x.slice(1);
const dm = (iso) => { const [, m, d] = iso.split('-').map(Number); return `${d}/${m}`; };
const dayMonth = (iso) => { const [y, m, d] = iso.split('-').map(Number); return fmtDate(athensTime(y, m, d, 12), { day: 'numeric', month: 'long' }); };
const dots = (n) => `<span class="dots" aria-label="${n} από 5">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`;
const ratingsHtml = (r) => `<div class="ratings"><span class="rating r-love">Αγάπη ${dots(r.love)}</span><span class="rating r-work">Δουλειά ${dots(r.work)}</span><span class="rating r-mood">Διάθεση ${dots(r.mood)}</span></div>`;
const fem = (b) => b === 'venus' || b === 'moon';
export const dayPath = (iso) => `zodia-simera/${iso}/index.html`;

// Το «θέμα» της ημέρας για τίτλο και εισαγωγή, από το πιο σημαντικό γεγονός του ουρανού
export function dayHook(sky) {
  const ph = sky.phases.find((p) => p.kind === 'new' || p.kind === 'full');
  if (ph) return `${PHASE_NAMES[ph.kind]} ${SIGNS[ph.sign].inSign}`;
  const st = sky.stations[0];
  if (st) {
    const w = st.kind === 'retrograde' ? (fem(st.body) ? 'ανάδρομη' : 'ανάδρομος') : (fem(st.body) ? 'ορθή' : 'ορθός');
    return `${cap(BODY_NAMES[st.body].nom)} γίνεται ${w} ${SIGNS[st.sign].inSign}`;
  }
  const ing = sky.ingresses[0];
  if (ing) return `${cap(BODY_NAMES[ing.body].nom)} μπαίνει ${SIGNS[ing.sign].inSign}`;
  const q = sky.phases[0];
  if (q) return `${PHASE_NAMES[q.kind]} ${SIGNS[q.sign].inSign}`;
  // Η πιο ακριβής όψη της Σελήνης δίνει τον τόνο της ημέρας
  const a = [...sky.moonAspects].sort((x, y) => x.orb - y.orb)[0];
  const moonIn = `Η Σελήνη ${SIGNS[sky.pos.moon.sign].inSign}`;
  if (a) {
    const verb = { conjunction: 'συναντά', trine: 'σε αρμονία με', sextile: 'συνεργάζεται με', square: 'σε ένταση με', opposition: 'απέναντι από' }[a.aspect];
    const retro = sky.pos[a.b]?.retro ? (fem(a.b) ? 'ανάδρομη ' : 'ανάδρομο ') : '';
    const acc = BODY_NAMES[a.b].acc.replace(/^(τον|την|το) /, `$1 ${retro}`);
    return `${moonIn} ${verb} ${acc}`;
  }
  return moonIn;
}

// Όλα τα γεγονότα της ημέρας σε μία πρόταση
function dayEvents(sky) {
  const out = [];
  for (const p of sky.phases) out.push(`${PHASE_NAMES[p.kind]} ${SIGNS[p.sign].inSign} στις ${fmtTime(p.date)}`);
  for (const st of sky.stations) out.push(`${BODY_NAMES[st.body].nom} γίνεται ${st.kind === 'retrograde' ? (fem(st.body) ? 'ανάδρομη' : 'ανάδρομος') : (fem(st.body) ? 'ορθή' : 'ορθός')} στις ${fmtTime(st.date)}`);
  for (const i of sky.ingresses) out.push(`${BODY_NAMES[i.body].nom} μπαίνει ${SIGNS[i.sign].inSign} στις ${fmtTime(i.date)}`);
  if (sky.moonIngress) out.push(`η Σελήνη περνά ${SIGNS[sky.moonIngress.sign].inSign} στις ${fmtTime(sky.moonIngress.date)}`);
  return out;
}

const PLANETS = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

export function archiveDayPage(sky, { first, last }) {
  const iso = sky.iso;
  const path = dayPath(iso);
  const root = '../../';
  const hook = dayHook(sky);
  const ev = dayEvents(sky);
  const retros = PLANETS.filter((b) => sky.pos[b].retro);
  const trail = [['Ζώδια Σήμερα', 'index.html'], ['Αρχείο', 'zodia-simera/index.html'], [`Ζώδια ${dayMonth(iso)}`, path]];
  const items = SIGNS.map((s, i) => {
    const h = horoscopeFor(i, sky);
    return `<article class="panel stack el-${s.element}" id="${s.slug}">
  <div class="day-head"><h2>${glyph(s.symbol)} ${s.name}</h2><span class="muted">${s.dates}</span></div>
  ${ratingsHtml(h.ratings)}
  <div class="reading">${h.paras.map((p) => `<p>${esc(p)}</p>`).join('')}<p class="advice">${esc(h.advice)}</p></div>
  ${luckHtml(luckFor(i, iso, h.ratings))}
  <p class="ev-links"><a href="${root}zodia/${s.slug}/index.html">${s.name}: η πρόβλεψη της ημέρας και της αυριανής →</a></p>
</article>`;
  });
  const prev = iso > first ? addDays(iso, -1) : null;
  const next = iso < last ? addDays(iso, 1) : null;
  const content = `
${crumbs(trail, root)}
<section class="stack">
  <p class="eyebrow">${esc(fmtIsoLong(iso))}</p>
  <h1>Ζώδια σήμερα ${dayMonth(iso)}: ${esc(hook)}</h1>
  <p class="lede">Η Σελήνη βρίσκεται ${SIGNS[sky.pos.moon.sign].inSign} και ο Ήλιος ${SIGNS[sky.pos.sun.sign].inSign}. ${ev.length ? `Σήμερα ${ev.join(', ')}.` : ''} ${retros.length ? `Ανάδρομοι: ${retros.map((b) => BODY_NAMES[b].short).join(', ')}.` : 'Κανένας πλανήτης δεν είναι ανάδρομος.'}</p>
  <nav class="chips" aria-label="Ζώδια">${SIGNS.map((s) => `<a class="chip" href="#${s.slug}">${glyph(s.symbol)} ${s.name}</a>`).join('')}</nav>
</section>
<div class="day-list">${items.slice(0, 6).join('')}${adSlot()}${items.slice(6).join('')}</div>
<nav class="month-nav" aria-label="Άλλες ημέρες">${prev ? `<a href="${root}${dayPath(prev)}">← ${dayMonth(prev)}</a>` : '<span></span>'}<a href="${root}zodia-simera/index.html">Όλες οι ημέρες</a>${next ? `<a href="${root}${dayPath(next)}">${dayMonth(next)} →</a>` : '<span></span>'}</nav>`;
  const title = `Ζώδια σήμερα ${dm(iso)}: ${hook}`;
  const description = `Ζώδια ${dayMonth(iso)}: ${hook}. Η πρόβλεψη για όλα τα ζώδια σε έρωτα, δουλειά και διάθεση.`;
  const jsonLd = [articleLd({ path, headline: title, description, published: iso, image: ogImage() }), breadcrumbLd(trail)];
  return { path, lastmod: iso, ...page({ path, title, description, content, ogType: 'article', jsonLd }) };
}

const MONTHS = ['Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'];
const WEEK = ['Δε', 'Τρ', 'Τε', 'Πε', 'Πα', 'Σα', 'Κυ'];

export function archiveIndexPage(days, today) {
  const path = 'zodia-simera/index.html';
  const root = '../';
  const byMonth = new Map();
  for (const iso of days) { const k = iso.slice(0, 7); if (!byMonth.has(k)) byMonth.set(k, []); byMonth.get(k).push(iso); }
  const months = [...byMonth.entries()].reverse().map(([ym, list]) => {
    const [y, m] = ym.split('-').map(Number);
    const firstWd = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
    const daysIn = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const have = new Set(list);
    const cells = [...WEEK.map((w) => `<span class="muted">${w}</span>`), ...Array(firstWd).fill('<span></span>')];
    for (let d = 1; d <= daysIn; d++) {
      const iso = `${ym}-${String(d).padStart(2, '0')}`;
      cells.push(have.has(iso) ? `<a href="${root}${dayPath(iso)}"${iso === today ? ' aria-current="date"' : ''} aria-label="Ζώδια ${d} ${MONTHS[m - 1]}">${d}</a>` : `<span class="muted">${d}</span>`);
    }
    return `<section class="panel stack"><h2>${MONTHS[m - 1]} ${y}</h2><div class="cal">${cells.join('')}</div></section>`;
  }).join('');
  const trail = [['Ζώδια Σήμερα', 'index.html'], ['Αρχείο', path]];
  const content = `
${crumbs(trail, root)}
<section class="stack"><h1>Αρχείο ημερήσιων προβλέψεων</h1>
<p class="lede">Όλες οι ημερήσιες προβλέψεις για τα 12 ζώδια, ημέρα προς ημέρα. Διάλεξε ημερομηνία για να δεις τι έλεγαν τα άστρα.</p>
<p class="chips"><a class="chip" href="${root}${dayPath(today)}">Ζώδια σήμερα ${dm(today)}</a><a class="chip" href="${root}zodia-avrio/index.html">Ζώδια αύριο</a></p></section>
<div class="months-grid">${months}</div>`;
  return { path, ...page({ path, title: 'Αρχείο ημερήσιων προβλέψεων ζωδίων', description: 'Το αρχείο με τις ημερήσιες προβλέψεις για όλα τα ζώδια, ημέρα προς ημέρα, από τις πραγματικές θέσεις των πλανητών.', content, jsonLd: breadcrumbLd(trail) }) };
}

export function tomorrowPage(sky) {
  const iso = sky.iso;
  const path = 'zodia-avrio/index.html';
  const root = '../';
  const toTomorrow = (t) => t.replaceAll('Σήμερα', 'Αύριο').replaceAll('σήμερα', 'αύριο');
  const hook = dayHook(sky);
  const ev = dayEvents(sky);
  const items = SIGNS.map((s, i) => {
    const h = horoscopeFor(i, sky);
    return `<article class="panel stack el-${s.element}" id="${s.slug}">
  <div class="day-head"><h2>${glyph(s.symbol)} ${s.name} αύριο</h2><span class="muted">${s.dates}</span></div>
  ${ratingsHtml(h.ratings)}
  <div class="reading"><p>${esc(toTomorrow(h.paras[0]))}</p><p class="advice">${esc(toTomorrow(h.advice))}</p></div>
  ${luckHtml(luckFor(i, iso, h.ratings))}
  <p class="ev-links"><a href="${root}${dayPath(iso)}#${s.slug}">Ολόκληρη η πρόβλεψη ${s.gen} για ${dayMonth(iso)} →</a></p>
</article>`;
  });
  const trail = [['Ζώδια Σήμερα', 'index.html'], ['Ζώδια αύριο', path]];
  const content = `
${crumbs(trail, root)}
<section class="stack">
  <p class="eyebrow">${esc(fmtIsoLong(iso))}</p>
  <h1>Ζώδια αύριο ${dayMonth(iso)}: ${esc(hook)}</h1>
  <p class="lede">Αύριο η Σελήνη βρίσκεται ${SIGNS[sky.pos.moon.sign].inSign}. ${ev.length ? `${cap(ev.join(', '))}.` : ''} Δες τι φέρνει η αυριανή μέρα σε κάθε ζώδιο.</p>
  <nav class="chips" aria-label="Ζώδια">${SIGNS.map((s) => `<a class="chip" href="#${s.slug}">${glyph(s.symbol)} ${s.name}</a>`).join('')}</nav>
</section>
<div class="day-list">${items.slice(0, 6).join('')}${adSlot()}${items.slice(6).join('')}</div>
<p class="chips"><a class="chip" href="${root}index.html">Ζώδια σήμερα</a><a class="chip" href="${root}zodia-simera/index.html">Αρχείο προβλέψεων</a><a class="chip" href="${root}evdomadiaia/index.html">Η εβδομάδα</a></p>`;
  const title = `Ζώδια αύριο ${dm(iso)}: ${hook}`;
  const description = `Ζώδια αύριο ${dayMonth(iso)}: ${hook}. Τι φέρνει η αυριανή μέρα σε κάθε ζώδιο, με τυχερό αριθμό και χρώμα.`;
  return { path, lastmod: addDays(iso, -1), ...page({ path, title, description, content, ogType: 'article', jsonLd: [articleLd({ path, headline: title, description, published: addDays(iso, -1) }), breadcrumbLd(trail)] }) };
}
