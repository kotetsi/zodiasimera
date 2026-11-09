import config from '../config.js';
import { page } from './layout.js';

// Regenerate each published year from 2026 so the daily clean build retains old URLs.
export function retainedYears(iso, throughYear) {
  const first = Math.min(2026, +iso.slice(0, 4));
  return Array.from({ length: throughYear - first + 1 }, (_, i) => first + i);
}
export function retainedMonths(iso) {
  const [y, m] = iso.split('-').map(Number);
  const start = config.archiveStart.slice(0, 7) + '-01';
  const first = new Date(`${start}T12:00:00Z`);
  const current = new Date(Date.UTC(y, m - 1, 1, 12));
  if (first > current) first.setTime(current.getTime());
  const last = new Date(Date.UTC(y, m + 10, 1, 12));
  const out = [];
  for (const d = new Date(first); d <= last; d.setUTCMonth(d.getUTCMonth() + 1)) out.push({ y: d.getUTCFullYear(), m: d.getUTCMonth() + 1 });
  return out;
}
export function archivePage(years, eventYears) {
  const path = 'arxeio/index.html';
  const content = `<section class="stack"><h1>Αρχείο προβλέψεων και αστρολογικών ημερολογίων</h1><p class="lede">Διάλεξε έτος ή ημερομηνία. Οι παλιές σελίδες παραμένουν διαθέσιμες ως αρχείο και αφορούν την περίοδο που αναγράφουν.</p></section>
<section class="stack"><h2>Ετήσιες προβλέψεις</h2><div class="chips">${years.map(y => `<a class="chip" href="../zodia-${y}/index.html">Ζώδια ${y}</a>`).join('')}</div></section>
<section class="stack"><h2>Ανάδρομος Ερμής και εκλείψεις ανά έτος</h2><div class="chips">${eventYears.map(y => `<a class="chip" href="../anadromos-ermis-${y}/index.html">Ανάδρομος Ερμής ${y}</a><a class="chip" href="../ekleipseis-${y}/index.html">Εκλείψεις ${y}</a>`).join('')}</div></section>
<section class="stack"><h2>Περισσότερα ημερολόγια</h2><p><a href="../panselinoi/index.html">Πανσέληνοι ανά ημερομηνία</a> · <a href="../efimerida/index.html">Εφημερίδα πλανητών ανά μήνα</a> · <a href="../zodia-simera/index.html">Αρχείο ημερήσιων προβλέψεων</a></p></section>`;
  return { path, ...page({ path, title: 'Αρχείο ζωδίων, προβλέψεων και ημερολογίων', description: 'Προβλέψεις ζωδίων ανά έτος, ανάδρομος Ερμής, εκλείψεις, Πανσέληνοι και εφημερίδα πλανητών. Βρες παλιές ημερήσιες προβλέψεις στο αρχείο.', content }) };
}
