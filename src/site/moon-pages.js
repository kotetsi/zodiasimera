// Σελίδες Πανσελήνων και ημερολόγιο Σελήνης ανά έτος.
import * as E from '../ephemeris.js';
import { SIGNS } from '../content/signs.js';
import { FULL_MOON_HOUSE, NEW_MOON_HOUSE } from '../content/daily-texts.js';
import { FULL_MOON_SIGN, NEW_MOON_SIGN_SHORT } from '../content/moon-texts.js';
import { eclipses, houseOf } from '../forecast.js';
import { athensTime, fmtDate, fmtTime, todayInAthens } from '../horoscope.js';
import { fmtDeg } from '../chart-svg.js';
import { page, esc, glyph, adSlot, articleLd } from './layout.js';

const MONTHS_GEN = ['Ιανουαρίου', 'Φεβρουαρίου', 'Μαρτίου', 'Απριλίου', 'Μαΐου', 'Ιουνίου', 'Ιουλίου', 'Αυγούστου', 'Σεπτεμβρίου', 'Οκτωβρίου', 'Νοεμβρίου', 'Δεκεμβρίου'];
const MONTH_SLUG = ['ianouariou', 'fevrouariou', 'martiou', 'apriliou', 'maiou', 'iouniou', 'iouliou', 'avgoustou', 'septemvriou', 'oktovriou', 'noemvriou', 'dekemvriou'];
const ym = (d) => [+fmtDate(d, { year: 'numeric' }), +fmtDate(d, { month: 'numeric' }) - 1];
const long = (d) => fmtDate(d, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export function moonYears(years) {
  const from = athensTime(years[0], 1, 1), to = athensTime(years[years.length - 1] + 1, 1, 1);
  const ecl = eclipses(from, to);
  const all = E.lunarPhases(from, to).filter((p) => p.kind === 'full' || p.kind === 'new')
    .map((p) => ({ ...p, eclipse: ecl.find((e) => Math.abs(e.date - p.date) < 3600000) || null }));
  const full = all.filter((p) => p.kind === 'full');
  // slug ανά μήνα· δεύτερη Πανσέληνος στον ίδιο μήνα = «Μπλε Φεγγάρι»
  const count = {};
  for (const f of full) {
    const [y, m] = ym(f.date); const k = `${y}-${m}`;
    count[k] = (count[k] || 0) + 1;
    f.y = y; f.m = m; f.blue = count[k] === 2;
    f.slug = `panselinos-${MONTH_SLUG[m]}-${y}${f.blue ? '-2' : ''}`;
  }
  return { years, all, full };
}

export const fullPath = (f) => `panselinos/${f.slug}/index.html`;

export function fullMoonPage(my, k) {
  const f = my.full[k];
  const path = fullPath(f);
  const root = '../../';
  const prev = my.full[k - 1], next = my.full[k + 1];
  const title = `Πανσέληνος ${MONTHS_GEN[f.m]} ${f.y}${f.blue ? ' (Μπλε Φεγγάρι)' : ''}`;
  const per = SIGNS.map((s, i) => `<div class="stack"><h3>${glyph(s.symbol)} ${s.name}</h3><p>${esc(FULL_MOON_HOUSE[houseOf(i, f.sign)])}</p></div>`).join('');
  const content = `
<section class="stack"><p class="eyebrow">Ημερολόγιο Σελήνης</p><h1>${title}</h1>
<p class="lede">Η ${f.blue ? 'δεύτερη ' : ''}Πανσέληνος ${MONTHS_GEN[f.m]} πέφτει ${/^(Κυριακή|Δευτέρα|Τρίτη|Τετάρτη|Πέμπτη|Παρασκευή)/.test(long(f.date)) ? 'την' : 'το'} ${esc(long(f.date))}, στις ${fmtTime(f.date)} ώρα Ελλάδας, ${SIGNS[f.sign].inSign} ${glyph(SIGNS[f.sign].symbol)} (${fmtDeg(f.deg)}).${f.eclipse ? ' Είναι ταυτόχρονα <strong>έκλειψη Σελήνης</strong>.' : ''}${f.blue ? ' Επειδή είναι η δεύτερη Πανσέληνος μέσα στον ίδιο μήνα, ονομάζεται «Μπλε Φεγγάρι».' : ''}</p></section>
<section class="split">
  <div class="panel stack el-${SIGNS[f.sign].element}"><h2>Τι σημαίνει</h2><p>${esc(FULL_MOON_SIGN[f.sign])}</p>${f.eclipse ? '<p class="note">Οι εκλείψεις θεωρούνται πιο δυνατές από μια απλή Πανσέληνο: φέρνουν ολοκληρώσεις και αλλαγές που φαίνονται και τους επόμενους μήνες.</p>' : ''}</div>
  <div class="stack"><h3>Πότε να τη δεις</h3><p>Η Σελήνη είναι γεμάτη από το βράδυ της παραμονής έως το βράδυ της επόμενης μέρας. Ανατέλλει περίπου την ώρα που δύει ο ήλιος και φαίνεται όλη τη νύχτα.</p>
  <p><a href="${root}selini/index.html">Όλες οι φάσεις της Σελήνης</a> · <a href="${root}panselinoi/index.html">Όλες οι Πανσέληνοι</a></p></div>
</section>
${adSlot()}
<section class="stack-lg"><h2>Τι φέρνει σε κάθε ζώδιο</h2><div class="readings">${per}</div></section>
<nav class="chips" aria-label="Άλλες Πανσέληνοι">${prev ? `<a class="chip" href="${root}${fullPath(prev)}">← ${MONTHS_GEN[prev.m]} ${prev.y}</a>` : ''}${next ? `<a class="chip" href="${root}${fullPath(next)}">${MONTHS_GEN[next.m]} ${next.y} →</a>` : ''}</nav>`;
  return { path, ...page({
    path, title: `${title}: ημερομηνία, ώρα και τι σημαίνει για κάθε ζώδιο`,
    description: `${title}: ${long(f.date)}, ${fmtTime(f.date)} ώρα Ελλάδας, ${SIGNS[f.sign].inSign}.${f.eclipse ? ' Έκλειψη Σελήνης.' : ''} Τι σημαίνει και τι φέρνει σε κάθε ζώδιο.`,
    content,
    jsonLd: articleLd({ path, headline: `${title}: ημερομηνία, ώρα και τι σημαίνει για κάθε ζώδιο`, description: `${title}: ${long(f.date)}, ${fmtTime(f.date)} ώρα Ελλάδας, ${SIGNS[f.sign].inSign}.`, published: `${f.y - 1}-11-01`, modified: todayInAthens() }),
  }) };
}

export function fullMoonIndexPage(my) {
  const path = 'panselinoi/index.html';
  const root = '../';
  const sec = my.years.map((y) => {
    const rows = my.all.filter((p) => +fmtDate(p.date, { year: 'numeric' }) === y).map((p) => {
      const f = p.kind === 'full' ? my.full.find((x) => x.date === p.date) : null;
      const what = p.kind === 'full' ? (p.eclipse ? 'Πανσέληνος · έκλειψη Σελήνης' : 'Πανσέληνος') : (p.eclipse ? 'Νέα Σελήνη · έκλειψη Ηλίου' : 'Νέα Σελήνη');
      const means = p.kind === 'full' ? '' : `<span class="muted"> · ${NEW_MOON_SIGN_SHORT[p.sign]}</span>`;
      return `<tr${p.kind === 'new' ? ' class="muted-row"' : ''}><td class="num" style="white-space:nowrap">${fmtDate(p.date, { weekday: 'short', day: 'numeric', month: 'long' })}</td><td class="num">${fmtTime(p.date)}</td><td>${f ? `<a href="${root}${fullPath(f)}">${what}</a>` : what}${f && f.blue ? ' (Μπλε Φεγγάρι)' : ''}</td><td>${glyph(SIGNS[p.sign].symbol)} ${SIGNS[p.sign].name}${means}</td></tr>`;
    }).join('');
    return `<section class="stack-lg"><h2>Πανσέληνοι και Νέες Σελήνες ${y}</h2><div class="table-wrap"><table><thead><tr><th>Ημερομηνία</th><th>Ώρα</th><th>Φάση</th><th>Ζώδιο</th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
  }).join(adSlot());
  const content = `
<section class="stack"><p class="eyebrow">Ημερολόγιο Σελήνης</p><h1>Πανσέληνοι ${my.years.join(' και ')}</h1>
<p class="lede">Όλες οι Πανσέληνοι και οι Νέες Σελήνες με ημερομηνία και ώρα Ελλάδας, το ζώδιο όπου πέφτουν και τις εκλείψεις. Πάτησε σε μια Πανσέληνο για να δεις τι σημαίνει και τι φέρνει σε κάθε ζώδιο.</p></section>
${sec}`;
  return { path, ...page({ path, title: `Πανσέληνοι ${my.years.join(' και ')}: ημερομηνίες, ώρες και ζώδια`, description: `Πότε είναι η Πανσέληνος: όλες οι Πανσέληνοι και Νέες Σελήνες ${my.years.join(' και ')} με ώρα Ελλάδας, ζώδιο και εκλείψεις.`, content }) };
}
