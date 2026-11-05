// Εβδομαδιαίες και μηνιαίες προβλέψεις ανά ζώδιο (ξαναχτίζονται κάθε μέρα).
import * as E from '../ephemeris.js';
import { SIGNS, BODY_NAMES } from '../content/signs.js';
import * as T from '../content/daily-texts.js';
import { JUPITER_YEAR, SATURN_YEAR } from '../content/year-texts.js';
import { skyForDay, horoscopeFor, addDays, athensTime, fmtDate, fmtTime } from '../horoscope.js';
import { houseOf, eclipses } from '../forecast.js';
import { page, esc, glyph, adSlot, FEATURED_YEAR } from './layout.js';

const MONTHS = ['Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'];
const WD = ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο'];
const isoDate = (iso) => { const [y, m, d] = iso.split('-').map(Number); return athensTime(y, m, d, 12); };
const dayLabel = (iso) => fmtDate(isoDate(iso), { weekday: 'short', day: 'numeric', month: 'short' });
const when = (d) => fmtDate(d, { weekday: 'long', day: 'numeric', month: 'long' });
const dots = (n) => `<span class="dots" aria-label="${n} από 5">${[1, 2, 3, 4, 5].map((k) => `<i class="${k <= n ? 'on' : ''}"></i>`).join('')}</span>`;
const fem = (b) => b === 'venus' || b === 'moon';
const MOVERS = ['sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
const RETRO = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

// Η εβδομάδα (Δευτέρα–Κυριακή) που αφορά την ημέρα· την Κυριακή δείχνουμε την επόμενη
export function weekOf(iso) {
  const wd = isoDate(iso).getUTCDay();
  const monday = wd === 0 ? addDays(iso, 1) : addDays(iso, 1 - wd);
  return { kind: 'week', start: monday, days: 7 };
}
export function monthOf(iso) {
  const [y, m] = iso.split('-').map(Number);
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { kind: 'month', start: `${y}-${String(m).padStart(2, '0')}-01`, days, y, m };
}

// Κοινά δεδομένα περιόδου (ίδια για όλα τα ζώδια)
export function periodSky(p) {
  const isos = Array.from({ length: p.days }, (_, k) => addDays(p.start, k));
  const skies = isos.map(skyForDay);
  const from = skies[0].start, to = skies[skies.length - 1].end;
  const ecl = eclipses(from, to);
  const lunations = E.lunarPhases(from, to).filter((x) => x.kind === 'new' || x.kind === 'full')
    .map((x) => ({ ...x, eclipse: ecl.find((e) => Math.abs(e.date - x.date) < 3600000) || null }));
  const ingresses = MOVERS.flatMap((b) => E.ingresses(b, from, to));
  const stations = RETRO.flatMap((b) => E.stations(b, from, to));
  const startPos = E.positions(from);
  return { ...p, isos, skies, from, to, lunations, ingresses, stations, startPos };
}

export function periodForecast(ps, i) {
  const daily = ps.skies.map((sky) => horoscopeFor(i, sky).ratings);
  const avg = (k) => Math.max(1, Math.min(5, Math.round(daily.reduce((a, r) => a + r[k], 0) / daily.length)));
  const good = (k) => daily.map((r, n) => [r[k], n]).filter(([v]) => v >= 4).sort((a, b) => b[0] - a[0] || a[1] - b[1]).slice(0, 4).map(([, n]) => n).sort((a, b) => a - b).map((n) => ps.isos[n]);

  const events = [];
  for (const l of ps.lunations) {
    const h = houseOf(i, l.sign);
    const label = l.eclipse ? (l.kind === 'new' ? 'Έκλειψη Ηλίου (Νέα Σελήνη)' : 'Έκλειψη Σελήνης (Πανσέληνος)') : (l.kind === 'new' ? 'Νέα Σελήνη' : 'Πανσέληνος');
    events.push({ date: l.date, title: `${label} ${SIGNS[l.sign].inSign}`, text: (l.kind === 'new' ? T.NEW_MOON_HOUSE : T.FULL_MOON_HOUSE)[h] + (l.eclipse ? ' Επειδή είναι έκλειψη, τα αποτελέσματα μπορεί να φανούν και τους επόμενους μήνες.' : '') });
  }
  for (const g of ps.ingresses) {
    const h = houseOf(i, g.sign);
    const name = BODY_NAMES[g.body];
    const text = g.body === 'sun' ? `Η έμφαση περνά ${T.HOUSE_TOPIC[h]}.`
      : g.body === 'mercury' ? T.MERCURY_HOUSE[h]
      : g.body === 'venus' ? T.VENUS_HOUSE[h]
      : g.body === 'mars' ? T.MARS_HOUSE[h]
      : g.body === 'jupiter' ? JUPITER_YEAR[h].split('. ')[0] + '.'
      : SATURN_YEAR[h].split('. ')[0] + '.';
    events.push({ date: g.date, title: `${name.nom[0].toUpperCase()}${name.nom.slice(1)} μπαίνει ${SIGNS[g.sign].inSign}${g.retro ? ` (${fem(g.body) ? 'ανάδρομη' : 'ανάδρομος'})` : ''}`, text });
  }
  for (const s of ps.stations) {
    const txt = T.STATION_TEXT[s.kind](BODY_NAMES[s.body].nom, T.HOUSE_AREA[houseOf(i, s.sign)], fem(s.body)).replace(/^Σήμερα /, '');
    events.push({ date: s.date, title: `${BODY_NAMES[s.body].short} ${s.kind === 'retrograde' ? (fem(s.body) ? 'ανάδρομη' : 'ανάδρομος') : 'σε ορθή φορά'}`, text: txt[0].toUpperCase() + txt.slice(1) });
  }
  events.sort((a, b) => a.date - b.date);

  // Ανάδρομοι από την αρχή της περιόδου (προσωπικοί πλανήτες)
  const ongoing = ['mercury', 'venus', 'mars'].filter((b) => ps.startPos[b].retro && !ps.stations.some((s) => s.body === b && s.kind === 'retrograde'))
    .map((b) => (b === 'mercury' ? T.MERCURY_RX_HOUSE[houseOf(i, ps.startPos.mercury.sign)]
      : `${BODY_NAMES[b].nom[0].toUpperCase()}${BODY_NAMES[b].nom.slice(1)} είναι ${fem(b) ? 'ανάδρομη' : 'ανάδρομος'} ${T.HOUSE_AREA[houseOf(i, ps.startPos[b].sign)]}: εποχή για αναθεώρηση, όχι για βιαστικά ξεκινήματα.`));

  const sunH = houseOf(i, ps.startPos.sun.sign);
  const venusH = houseOf(i, ps.startPos.venus.sign), marsH = houseOf(i, ps.startPos.mars.sign);
  return {
    ratings: { love: avg('love'), work: avg('work'), mood: avg('mood') },
    best: { love: good('love'), work: good('work'), mood: good('mood') },
    events, ongoing, sunH, venusH, marsH,
  };
}

const periodLabel = (ps) => (ps.kind === 'month'
  ? `${MONTHS[ps.m - 1]} ${ps.y}`
  : `${fmtDate(isoDate(ps.start), { day: 'numeric', month: 'long' })} – ${fmtDate(isoDate(ps.isos[6]), { day: 'numeric', month: 'long', year: 'numeric' })}`);
export const periodPath = (kind, s) => (s ? `zodia/${s.slug}/${kind === 'week' ? 'evdomada' : 'minas'}/index.html` : `${kind === 'week' ? 'evdomadiaia' : 'miniaia'}/index.html`);

export function periodSignPage(ps, i) {
  const s = SIGNS[i];
  const fc = periodForecast(ps, i);
  const root = '../../../';
  const path = periodPath(ps.kind, s);
  const word = ps.kind === 'week' ? 'την εβδομάδα' : 'τον μήνα';
  const label = periodLabel(ps);
  const intro = [
    `${ps.kind === 'week' ? 'Αυτή την εβδομάδα' : `Τον ${MONTHS[ps.m - 1].replace(/ος$/, 'ο')}`} ο Ήλιος βρίσκεται ${SIGNS[ps.startPos.sun.sign].inSign}, οπότε η έμφαση είναι ${T.HOUSE_TOPIC[fc.sunH]}.`,
    T.VENUS_HOUSE[fc.venusH],
    T.MARS_HOUSE[fc.marsH],
    ...fc.ongoing,
  ];
  const days = (list) => (list.length ? list.map((x) => `<span class="chip">${esc(dayLabel(x))}</span>`).join('') : '<span class="muted">Καμία μέρα δεν ξεχωρίζει ιδιαίτερα.</span>');
  const ev = fc.events.map((e) => `<li class="event"><span class="when">${esc(when(e.date))}<br>${fmtTime(e.date)}</span><div class="stack"><h3>${esc(e.title)}</h3><p>${esc(e.text)}</p></div></li>`).join('');
  const tabs = `<nav class="chips" aria-label="Προβλέψεις ${s.gen}"><a class="chip" href="${root}zodia/${s.slug}/index.html">Σήμερα</a><a class="chip"${ps.kind === 'week' ? ' aria-current="page"' : ''} href="${root}${periodPath('week', s)}">Εβδομάδα</a><a class="chip"${ps.kind === 'month' ? ' aria-current="page"' : ''} href="${root}${periodPath('month', s)}">Μήνας</a><a class="chip" href="${root}zodia-${FEATURED_YEAR}/${s.slug}/index.html">${FEATURED_YEAR}</a></nav>`;
  const others = SIGNS.map((o) => `<a class="chip"${o === s ? ' aria-current="page"' : ''} href="${root}${periodPath(ps.kind, o)}">${glyph(o.symbol)} ${o.name}</a>`).join('');
  const content = `
<section class="hero-sign el-${s.element}">${glyph(s.symbol)}<h1>${s.name}: ${ps.kind === 'week' ? 'εβδομαδιαία' : 'μηνιαία'} πρόβλεψη</h1><p class="muted">${esc(label)}</p></section>
${tabs}
<section class="split">
  <div class="panel stack"><h2>${ps.kind === 'week' ? 'Η εβδομάδα' : 'Ο μήνας'} με μια ματιά</h2>
    <div class="score-row"><span>Έρωτας</span>${dots(fc.ratings.love)}</div>
    <div class="score-row"><span>Δουλειά</span>${dots(fc.ratings.work)}</div>
    <div class="score-row"><span>Διάθεση</span>${dots(fc.ratings.mood)}</div>
    <p class="muted" style="font-size:.85rem">Μέσος όρος των ημερήσιων βαθμολογιών για ${word}.</p></div>
  <div class="stack">
    <h3>Καλές μέρες για τον έρωτα</h3><div class="chips">${days(fc.best.love)}</div>
    <h3>Καλές μέρες για τη δουλειά</h3><div class="chips">${days(fc.best.work)}</div>
    <h3>Μέρες με καλή διάθεση</h3><div class="chips">${days(fc.best.mood)}</div>
  </div>
</section>
<section class="stack"><h2>Τι φέρνει ${word}</h2><div class="reading">${intro.map((p) => `<p>${esc(p)}</p>`).join('')}</div></section>
${adSlot()}
<section class="stack-lg"><h2>Τα σημαντικά γεγονότα</h2>${ev ? `<ul class="events">${ev}</ul>` : `<p class="muted">Κανένα μεγάλο πλανητικό γεγονός ${word}· οι αλλαγές έρχονται κυρίως από την κίνηση της Σελήνης. Δες την <a href="${root}zodia/${s.slug}/index.html">ημερήσια πρόβλεψη</a>.</p>`}</section>
<section class="stack"><h2>${ps.kind === 'week' ? 'Εβδομαδιαίες' : 'Μηνιαίες'} προβλέψεις για όλα τα ζώδια</h2><div class="chips">${others}</div></section>`;
  const first = intro[0];
  return { path, ...page({
    path,
    title: ps.kind === 'week' ? `${s.name} εβδομαδιαία πρόβλεψη ${label}` : `${s.name} ${label}: μηνιαία πρόβλεψη`,
    description: `${s.name}: ${ps.kind === 'week' ? 'εβδομαδιαία' : 'μηνιαία'} πρόβλεψη για ${label}. ${first} Καλές μέρες για έρωτα και δουλειά.`.slice(0, 300),
    content,
  }) };
}

export function periodIndexPage(ps) {
  const path = periodPath(ps.kind);
  const root = '../';
  const label = periodLabel(ps);
  const cards = SIGNS.map((s, i) => {
    const fc = periodForecast(ps, i);
    return `<a class="sign-card el-${s.element}" href="${root}${periodPath(ps.kind, s)}">${glyph(s.symbol)}<strong>${s.name}</strong><small>${s.dates}</small><span></span><span class="ratings-mini">${dots(fc.ratings.love)}</span></a>`;
  }).join('');
  const ev = periodForecast(ps, 0).events.map((e) => `<tr><td class="num" style="white-space:nowrap">${esc(fmtDate(e.date, { weekday: 'short', day: 'numeric', month: 'short' }))}, ${fmtTime(e.date)}</td><td>${esc(e.title)}</td></tr>`).join('');
  const content = `
<section class="stack"><p class="eyebrow">${esc(label)}</p><h1>${ps.kind === 'week' ? 'Εβδομαδιαίες προβλέψεις' : `Μηνιαίες προβλέψεις: ${MONTHS[ps.m - 1]}`}</h1>
<p class="lede">Η πρόβλεψη ${ps.kind === 'week' ? 'της εβδομάδας' : 'του μήνα'} για κάθε ζώδιο, από τις πραγματικές κινήσεις των πλανητών: Νέες Σελήνες και Πανσέληνοι, αλλαγές ζωδίων και ανάδρομοι, με τις καλύτερες μέρες για έρωτα και δουλειά.</p></section>
<section class="stack-lg"><h2>Διάλεξε το ζώδιό σου</h2><div class="signs">${cards}</div><p class="muted" style="font-size:.85rem">Οι τελείες δείχνουν τη μέση βαθμολογία για τον έρωτα.</p></section>
${adSlot()}
${ev ? `<section class="stack-lg"><h2>Τα γεγονότα ${ps.kind === 'week' ? 'της εβδομάδας' : 'του μήνα'}</h2><div class="table-wrap"><table><thead><tr><th>Πότε</th><th>Γεγονός</th></tr></thead><tbody>${ev}</tbody></table></div></section>` : ''}`;
  return { path, ...page({ path, title: ps.kind === 'week' ? `Εβδομαδιαίες προβλέψεις ζωδίων ${label}` : `Μηνιαίες προβλέψεις ζωδίων ${label}`, description: `${ps.kind === 'week' ? 'Εβδομαδιαία' : 'Μηνιαία'} πρόβλεψη για τα 12 ζώδια, ${label}: τα σημαντικά πλανητικά γεγονότα και οι καλύτερες μέρες για έρωτα και δουλειά.`, content }) };
}
