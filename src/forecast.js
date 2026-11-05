// Μακροπρόθεσμες προβλέψεις (έτος, μήνας, εβδομάδα) από τις πραγματικές κινήσεις των πλανητών.
// Οίκοι = ηλιακοί οίκοι (ένα ζώδιο ανά οίκο, με αφετηρία το ζώδιο του αναγνώστη).
import * as E from './ephemeris.js';
import { athensTime } from './horoscope.js';

const SLOW = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
export const houseOf = (signIdx, bodySign) => (bodySign - signIdx + 12) % 12;

// Απόσταση της Σελήνης από τον άξονα των Δεσμών (0–90°)
function nodeDistance(date) {
  const p = E.positions(date);
  let d = Math.abs(p.moon.lon - p.node.lon) % 180;
  return Math.min(d, 180 - d);
}

// Όρια εκλείψεων (γεωκεντρικά, με ασφάλεια): ηλιακή αν η Νέα Σελήνη απέχει < 18,5° από Δεσμό,
// σεληνιακή (έστω παρασκιώδης) αν η Πανσέληνος απέχει < 17°.
export function eclipses(from, to) {
  return E.lunarPhases(from, to)
    .filter((p) => (p.kind === 'new' && nodeDistance(p.date) < 18.5) || (p.kind === 'full' && nodeDistance(p.date) < 17))
    .map((p) => ({ ...p, type: p.kind === 'new' ? 'solar' : 'lunar' }));
}

// Διαστήματα όπου ένα σώμα μένει σε ένα ζώδιο: [{ sign, from, to }]
export function signSpans(body, from, to) {
  const ing = E.ingresses(body, from, to);
  const spans = [];
  let cur = { sign: E.positions(from)[body].sign, from };
  for (const i of ing) { spans.push({ ...cur, to: i.date }); cur = { sign: i.sign, from: i.date }; }
  spans.push({ ...cur, to });
  return spans;
}

// Ανάδρομες περίοδοι που τέμνουν το διάστημα: [{ body, from, to, signFrom, signTo }]
export function retroSpans(body, from, to) {
  // ψάχνουμε λίγο πριν και μετά, για να πιάσουμε περιόδους που ξεκινούν/τελειώνουν εκτός διαστήματος
  const pad = 150 * 86400000;
  const st = E.stations(body, new Date(from.getTime() - pad), new Date(to.getTime() + pad));
  const out = [];
  for (let k = 0; k < st.length; k++) {
    if (st[k].kind !== 'retrograde') continue;
    const end = st.slice(k + 1).find((s) => s.kind === 'direct');
    if (!end) continue;
    if (end.date < from || st[k].date > to) continue;
    out.push({ body, from: st[k].date, to: end.date, signFrom: st[k].sign, signTo: end.sign });
  }
  return out;
}

// Ό,τι χρειάζεται για ένα έτος (ίδιο για όλα τα ζώδια)
export function yearSky(year) {
  const from = athensTime(year, 1, 1), to = athensTime(year + 1, 1, 1);
  const spans = Object.fromEntries(['sun', ...SLOW].map((b) => [b, signSpans(b, from, to)]));
  const months = Array.from({ length: 12 }, (_, m) => {
    const a = athensTime(year, m + 1, 1), b = athensTime(year, m + 2, 1);
    return { m, from: a, to: b, mid: athensTime(year, m + 1, 15, 12), pos: E.positions(athensTime(year, m + 1, 15, 12)) };
  });
  return {
    year, from, to, spans, months,
    eclipses: eclipses(from, to),
    retro: { mercury: retroSpans('mercury', from, to), venus: retroSpans('venus', from, to), mars: retroSpans('mars', from, to) },
    stations: SLOW.flatMap((b) => E.stations(b, from, to)),
  };
}
