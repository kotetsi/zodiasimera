// «Ανάδρομος Ερμής YYYY»: περίοδοι, σκιές και τι σημαίνει για κάθε ζώδιο.
import * as E from '../ephemeris.js';
import { SIGNS } from '../content/signs.js';
import { MERCURY_RX_HOUSE } from '../content/daily-texts.js';
import { retroSpans, houseOf } from '../forecast.js';
import { athensTime, fmtDate, fmtTime } from '../horoscope.js';
import { fmtDeg } from '../chart-svg.js';
import { page, esc, glyph, adSlot } from './layout.js';

const day = (d) => fmtDate(d, { weekday: 'short', day: 'numeric', month: 'long' });
const diff = (a, b) => ((a - b + 540) % 360) - 180;

// Πρώτη στιγμή στο [from,to] που ο Ερμής περνά από το μήκος lon (βήμα 6 ωρών + διχοτόμηση)
function crossing(lon, from, to, dir) {
  const step = 6 * 3600000 * dir;
  let t = from.getTime();
  const end = to.getTime();
  let prev = diff(E.longitude('mercury', new Date(t)), lon);
  while (dir > 0 ? t < end : t > end) {
    const n = t + step;
    const cur = diff(E.longitude('mercury', new Date(n)), lon);
    if ((prev <= 0) !== (cur <= 0) && Math.abs(cur - prev) < 90) {
      let a = t, b = n;
      for (let k = 0; k < 40; k++) { const m = (a + b) / 2; const v = diff(E.longitude('mercury', new Date(m)), lon); if ((v <= 0) === (prev <= 0)) a = m; else b = m; }
      return new Date((a + b) / 2);
    }
    prev = cur; t = n;
  }
  return null;
}

export function mercuryYear(year) {
  const from = athensTime(year, 1, 1), to = athensTime(year + 1, 1, 1);
  return retroSpans('mercury', from, to).map((r) => {
    const lr = E.longitude('mercury', r.from), ld = E.longitude('mercury', r.to);
    const pre = crossing(ld, new Date(r.from.getTime() - 40 * 86400000), r.from, 1);
    const post = crossing(lr, r.to, new Date(r.to.getTime() + 40 * 86400000), 1);
    return { ...r, lr, ld, pre, post };
  });
}

export function mercuryPage(year, spans, todayDate) {
  const path = `anadromos-ermis-${year}/index.html`;
  const root = '../';
  const now = spans.find((r) => todayDate >= r.from && todayDate <= r.to);
  const nextR = spans.find((r) => r.from > todayDate);
  const status = now ? `<p class="note"><strong>Αυτή τη στιγμή ο Ερμής είναι ανάδρομος</strong> ${SIGNS[now.signFrom].inSign}, έως τις ${fmtDate(now.to, { day: 'numeric', month: 'long' })}.</p>`
    : nextR ? `<p class="muted">Ο Ερμής δεν είναι ανάδρομος σήμερα. Η επόμενη ανάδρομη περίοδος ξεκινά στις ${fmtDate(nextR.from, { day: 'numeric', month: 'long', year: 'numeric' })}.</p>` : '';
  const cards = spans.map((r, k) => `<div class="panel stack"><p class="eyebrow">${k + 1}η περίοδος</p><h3>${day(r.from)} – ${day(r.to)}</h3>
<p>${glyph(SIGNS[r.signFrom].symbol)} ${SIGNS[r.signFrom].inSign}${r.signTo !== r.signFrom ? ` → ${glyph(SIGNS[r.signTo].symbol)} ${SIGNS[r.signTo].inSign}` : ''}: πηγαίνει πίσω από τις ${fmtDeg(r.lr % 30)} ${SIGNS[r.signFrom].gen} στις ${fmtDeg(r.ld % 30)} ${SIGNS[r.signTo].gen}.</p>
<ul class="plain"><li><strong>Γυρίζει ανάδρομος:</strong> ${day(r.from)}, ${fmtTime(r.from)}</li><li><strong>Γυρίζει ορθός:</strong> ${day(r.to)}, ${fmtTime(r.to)}</li>${r.pre ? `<li><strong>Σκιά πριν:</strong> από ${day(r.pre)}</li>` : ''}${r.post ? `<li><strong>Σκιά μετά:</strong> έως ${day(r.post)}</li>` : ''}</ul></div>`).join('');
  const per = SIGNS.map((s, i) => `<div class="stack"><h3>${glyph(s.symbol)} ${s.name}</h3>${spans.map((r) => `<p><strong>${day(r.from)} – ${day(r.to)}:</strong> ${esc(MERCURY_RX_HOUSE[houseOf(i, r.signFrom)])}</p>`).join('')}</div>`).join('');
  const content = `
<section class="stack"><p class="eyebrow">Ανάδρομοι πλανήτες</p><h1>Ανάδρομος Ερμής ${year}</h1>
<p class="lede">Το ${year} ο Ερμής γυρίζει ανάδρομος ${spans.length} φορές. Δες τις ακριβείς ημερομηνίες και ώρες Ελλάδας, τις περιόδους «σκιάς» πριν και μετά, και τι σημαίνει κάθε περίοδος για το ζώδιό σου.</p>${status}</section>
<section class="trio">${cards}</section>
${adSlot()}
<section class="split">
  <div class="stack"><h2>Τι είναι ο ανάδρομος Ερμής</h2><div class="reading"><p>Τρεις με τέσσερις φορές τον χρόνο ο Ερμής μοιάζει, από τη Γη, να σταματά και να κινείται προς τα πίσω στον ζωδιακό για περίπου τρεις εβδομάδες. Είναι οπτικό φαινόμενο, αλλά στην αστρολογία συνδέεται με καθυστερήσεις, παρεξηγήσεις και τεχνικά προβλήματα, καθώς και με την ευκαιρία να ξαναδείς ό,τι άφησες στη μέση.</p><p>Οι περίοδοι «σκιάς» είναι οι εβδομάδες πριν και μετά, όταν ο Ερμής περνά από τις ίδιες μοίρες. Πολλοί τις λογαριάζουν ως προετοιμασία και ως ήπια επιστροφή στην κανονικότητα.</p></div></div>
  <div class="stack"><h2>Συμβουλές για την περίοδο</h2><ul class="plain stack"><li>Ξαναδιάβασε μηνύματα και συμβόλαια πριν τα στείλεις ή τα υπογράψεις.</li><li>Κράτα αντίγραφα ασφαλείας στο κινητό και στον υπολογιστή.</li><li>Επιβεβαίωσε ραντεβού, κρατήσεις και δρομολόγια.</li><li>Ιδανική περίοδος για «ξανά»: ξαναδούλεψε, ξανασκέψου, ξαναβρές παλιούς φίλους.</li><li>Αν μπορείς, άφησε μεγάλες αγορές ηλεκτρονικών για μετά.</li></ul></div>
</section>
<section class="stack-lg"><h2>Τι φέρνει σε κάθε ζώδιο</h2><div class="readings">${per}</div></section>
<p><a href="${root}anadromoi/index.html">Όλοι οι ανάδρομοι πλανήτες τώρα</a> · <a href="${root}efimerida/index.html">Εφημερίδα πλανητών</a></p>`;
  return { path, ...page({ path, title: `Ανάδρομος Ερμής ${year}: ημερομηνίες, σκιές και τι σημαίνει για κάθε ζώδιο`, description: `Πότε είναι ανάδρομος ο Ερμής το ${year}: ${spans.map((r) => `${fmtDate(r.from, { day: 'numeric', month: 'long' })} – ${fmtDate(r.to, { day: 'numeric', month: 'long' })}`).join(', ')}. Ώρες Ελλάδας, σκιές και επίδραση σε κάθε ζώδιο.`, content }) };
}
