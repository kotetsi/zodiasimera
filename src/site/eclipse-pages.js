// «Εκλείψεις YYYY»: όλες οι εκλείψεις Ηλίου και Σελήνης της χρονιάς, με ζώδιο, μοίρα,
// ορατότητα από την Ελλάδα και τι φέρνουν σε κάθε ζώδιο.
import * as E from '../ephemeris.js';
import { SIGNS } from '../content/signs.js';
import { HOUSE_AREA } from '../content/daily-texts.js';
import * as Y from '../content/year-texts.js';
import { eclipses, houseOf } from '../forecast.js';
import { athensTime, fmtDate, fmtTime, todayInAthens } from '../horoscope.js';
import { fmtDeg } from '../chart-svg.js';
import { page, esc, glyph, adSlot, articleLd, breadcrumbLd, crumbs } from './layout.js';

export const eclipsePath = (y) => `ekleipseis-${y}/index.html`;

// Είδος κάθε έκλειψης (από τους καταλόγους της NASA). Ο υπολογισμός του site βρίσκει την ημερομηνία·
// το αν είναι ολική/δακτυλιοειδής/μερική χρειάζεται τη γεωμετρία της σκιάς, γι' αυτό το κρατάμε σε πίνακα.
const KIND = {
  '2026-02-17': 'δακτυλιοειδής', '2026-03-03': 'ολική', '2026-08-12': 'ολική', '2026-08-28': 'μερική',
  '2027-02-06': 'δακτυλιοειδής', '2027-02-20': 'παρασκιώδης', '2027-07-18': 'παρασκιώδης', '2027-08-02': 'ολική', '2027-08-17': 'παρασκιώδης',
  '2028-01-12': 'μερική', '2028-01-26': 'δακτυλιοειδής', '2028-07-06': 'μερική', '2028-07-22': 'ολική', '2028-12-31': 'ολική',
};
// Σημειώσεις ορατότητας για εκλείψεις Ηλίου (για τις σεληνιακές υπολογίζεται)
const SOLAR_NOTE = {
  '2026-02-17': 'Ορατή μόνο από την Ανταρκτική και το νότιο ημισφαίριο· όχι από την Ελλάδα.',
  '2026-08-12': 'Ολική σε Γροιλανδία, Ισλανδία και Ισπανία, κοντά στη δύση του ήλιου. Στην Ελλάδα, αν φανεί, θα είναι πολύ μικρή μερική χαμηλά στον ορίζοντα.',
  '2027-02-06': 'Δακτυλιοειδής στη Νότια Αμερική και τον Ατλαντικό· όχι από την Ελλάδα.',
  '2027-08-02': 'Η μεγάλη ολική έκλειψη της δεκαετίας για τη Μεσόγειο: ολική σε νότια Ισπανία, Βόρεια Αφρική και Αίγυπτο. Από την Ελλάδα φαίνεται ως βαθιά μερική έκλειψη το μεσημέρι.',
};

// Ύψος του Ήλιου πάνω από τον ορίζοντα της Αθήνας (μοίρες)
function sunAltitudeAthens(date) {
  const rad = Math.PI / 180;
  const lam = E.longitude('sun', date) * rad;
  const eps = 23.4393 * rad;
  const dec = Math.asin(Math.sin(eps) * Math.sin(lam));
  const ra = Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam));
  const jd = date.getTime() / 86400000 + 2440587.5;
  const gmst = (280.46061837 + 360.98564736629 * (jd - 2451545)) % 360;
  const ha = ((gmst + 23.7275) * rad) - ra;
  const lat = 37.98 * rad;
  return Math.asin(Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(ha)) / rad;
}

const isoOf = (d) => fmtDate(d, { year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-');
const utcIso = (d) => d.toISOString().slice(0, 10);
const longDay = (d) => fmtDate(d, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

function visibility(e) {
  if (e.type === 'solar') return SOLAR_NOTE[utcIso(e.date)] || 'Η ορατότητα εξαρτάται από τη διαδρομή της σκιάς της Σελήνης.';
  // Η Σελήνη είναι απέναντι από τον Ήλιο: φαίνεται όταν ο Ήλιος είναι κάτω από τον ορίζοντα
  const up = sunAltitudeAthens(e.date) < -1;
  const pen = KIND[utcIso(e.date)] === 'παρασκιώδης';
  if (!up) return 'Τη στιγμή του μεγίστου είναι μέρα στην Ελλάδα, οπότε η έκλειψη δεν φαίνεται από εδώ.';
  return pen ? 'Τη στιγμή του μεγίστου η Σελήνη είναι πάνω από τον ορίζοντα της Ελλάδας. Ως παρασκιώδης, φαίνεται μόνο σαν ελαφρύ σκούρεμα του δίσκου.'
    : 'Τη στιγμή του μεγίστου η Σελήνη είναι πάνω από τον ορίζοντα της Ελλάδας, οπότε με καθαρό ουρανό η έκλειψη φαίνεται με γυμνό μάτι.';
}

export function eclipseYear(y) {
  return eclipses(athensTime(y, 1, 1), athensTime(y + 1, 1, 1));
}

export function eclipsePage(y, list, years) {
  const path = eclipsePath(y);
  const root = '../';
  const solar = list.filter((e) => e.type === 'solar').length;
  const lunar = list.length - solar;
  const cards = list.map((e) => {
    const kind = KIND[utcIso(e.date)];
    const name = `${kind ? `${kind[0].toUpperCase()}${kind.slice(1)} έ` : 'Έ'}κλειψη ${e.type === 'solar' ? 'Ηλίου' : 'Σελήνης'} ${SIGNS[e.sign].inSign}`;
    const per = SIGNS.map((s, i) => `<li><a href="${root}zodia/${s.slug}/index.html">${glyph(s.symbol)} ${s.name}</a>: ${esc((e.type === 'solar' ? Y.ECLIPSE.solar : Y.ECLIPSE.lunar)(HOUSE_AREA[houseOf(i, e.sign)]))}</li>`).join('');
    return `<article class="panel stack el-${SIGNS[e.sign].element}" id="${isoOf(e.date)}">
  <p class="ev-when num">${esc(longDay(e.date))} · ${fmtTime(e.date)} ώρα Ελλάδας</p>
  <h2>${glyph(e.type === 'solar' ? '●' : '○')} ${esc(name)} <span class="muted ev-deg">${fmtDeg(e.deg)} ${SIGNS[e.sign].gen}</span></h2>
  <p><strong>Από την Ελλάδα:</strong> ${esc(visibility(e))}</p>
  <p><strong>Τι σημαίνει:</strong> ${e.type === 'solar'
    ? `Νέα Σελήνη με ένταση: ξεκινήματα και αλλαγές πορείας στα θέματα ${SIGNS[e.sign].gen} (${SIGNS[e.sign].keywords.slice(0, 3).join(', ')}).`
    : `Πανσέληνος με ένταση: κορύφωση, αποκαλύψεις και κλείσιμο κύκλων στα θέματα ${SIGNS[e.sign].gen} (${SIGNS[e.sign].keywords.slice(0, 3).join(', ')}).`}</p>
  <details><summary>Τι φέρνει σε κάθε ζώδιο</summary><ul class="plain" style="margin-top:10px">${per}</ul></details>
</article>`;
  }).join('');
  const rows = list.map((e) => `<tr><td class="num" style="white-space:nowrap"><a href="#${isoOf(e.date)}">${fmtDate(e.date, { day: 'numeric', month: 'long' })}</a></td><td>${e.type === 'solar' ? 'Ηλίου' : 'Σελήνης'}${KIND[utcIso(e.date)] ? ` (${KIND[utcIso(e.date)]})` : ''}</td><td>${glyph(SIGNS[e.sign].symbol)} ${SIGNS[e.sign].name}</td></tr>`).join('');
  const trail = [['Ζώδια Σήμερα', 'index.html'], [`Εκλείψεις ${y}`, path]];
  const content = `
${crumbs(trail, root)}
<section class="stack"><p class="eyebrow">Ημερολόγιο ${y}</p><h1>Εκλείψεις ${y}</h1>
<p class="lede">Το ${y} έχει ${list.length} εκλείψεις: ${solar} Ηλίου και ${lunar} Σελήνης. Δες πότε πέφτουν, σε ποιο ζώδιο, αν φαίνονται από την Ελλάδα και τι φέρνουν στο δικό σου ζώδιο.</p></section>
<div class="table-wrap"><table><thead><tr><th>Ημερομηνία</th><th>Έκλειψη</th><th>Ζώδιο</th></tr></thead><tbody>${rows}</tbody></table></div>
${adSlot()}
<div class="stack-lg">${cards}</div>
<section class="stack">
  <h2>Τι είναι οι εκλείψεις</h2>
  <div class="reading">
    <p>Έκλειψη Ηλίου γίνεται όταν η Σελήνη περνά ανάμεσα στη Γη και τον Ήλιο, πάντα σε Νέα Σελήνη. Έκλειψη Σελήνης γίνεται όταν η Γη μπαίνει ανάμεσα στον Ήλιο και τη Σελήνη, πάντα σε Πανσέληνο. Για να συμβεί, η Σελήνη πρέπει να βρίσκεται κοντά στους Δεσμούς της, γι' αυτό οι εκλείψεις έρχονται σε «εποχές» περίπου κάθε έξι μήνες.</p>
    <p>Στην αστρολογία οι εκλείψεις θεωρούνται πιο δυνατές από μια απλή Νέα Σελήνη ή Πανσέληνο. Οι εκλείψεις Ηλίου ανοίγουν νέα κεφάλαια, ενώ οι εκλείψεις Σελήνης κλείνουν κύκλους. Τα αποτελέσματα λέγεται ότι φαίνονται και τους επόμενους μήνες, ιδιαίτερα για τα ζώδια όπου πέφτουν.</p>
    <p class="muted">Μην κοιτάς ποτέ τον Ήλιο χωρίς ειδικά γυαλιά έκλειψης, ούτε όταν είναι μερικά καλυμμένος. Τις εκλείψεις Σελήνης μπορείς να τις δεις με ασφάλεια με γυμνό μάτι.</p>
  </div>
  <p class="chips">${years.filter((x) => x !== y).map((x) => `<a class="chip" href="${root}${eclipsePath(x)}">Εκλείψεις ${x}</a>`).join('')}<a class="chip" href="${root}panselinoi/index.html">Πανσέληνοι</a><a class="chip" href="${root}selini/index.html">Ημερολόγιο Σελήνης</a><a class="chip" href="${root}zodia-${y}/index.html">Ζώδια ${y}</a></p>
</section>`;
  const title = `Εκλείψεις ${y}: ημερομηνίες, ζώδια και τι σημαίνουν`;
  const description = `Οι ${list.length} εκλείψεις του ${y} (${list.map((e) => fmtDate(e.date, { day: 'numeric', month: 'numeric' })).join(', ')}): ώρες Ελλάδας, ζώδιο, αν φαίνονται από την Ελλάδα και τι φέρνουν σε κάθε ζώδιο.`;
  return { path, ...page({ path, title, description, content, ogType: 'article', jsonLd: [articleLd({ path, headline: title, description, published: `${y - 1}-11-07`, modified: todayInAthens() }), breadcrumbLd(trail)] }) };
}
