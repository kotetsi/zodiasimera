// Συναστρία: σύγκριση δύο γενέθλιων χαρτών.
import { houseOf } from './natal.js';

const ANGLES = [
  { angle: 0, name: 'conjunction' }, { angle: 60, name: 'sextile' }, { angle: 90, name: 'square' },
  { angle: 120, name: 'trine' }, { angle: 180, name: 'opposition' },
];
const PERSONAL = ['sun', 'moon', 'mercury', 'venus', 'mars'];
const SOCIAL = ['jupiter', 'saturn'];
const OUTER = ['uranus', 'neptune', 'pluto'];
const sep = (a, b) => { let d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

function orbFor(p, q) {
  if ([p, q].some((x) => x === 'sun' || x === 'moon')) return 6;
  if ([p, q].some((x) => PERSONAL.includes(x) || x === 'asc' || x === 'mc')) return 5;
  return 3;
}

function points(chart) {
  const pts = {};
  for (const b of [...PERSONAL, ...SOCIAL, ...OUTER]) pts[b] = chart.pos[b].lon;
  if (chart.houses) { pts.asc = chart.houses.asc; pts.mc = chart.houses.mc; }
  return pts;
}

// Πόσο μετρά κάθε ζεύγος για κάθε πτυχή της σχέσης
const WEIGHTS = {
  attraction: { 'venus-mars': 3, 'sun-mars': 1.5, 'mars-moon': 1.5, 'mars-mars': 1, 'pluto-venus': 1.5, 'mars-pluto': 1, 'asc-venus': 1.5, 'asc-mars': 1 },
  emotion: { 'moon-sun': 3, 'moon-moon': 2, 'moon-venus': 2, 'asc-moon': 1.5, 'moon-neptune': 1, 'moon-saturn': 1.5 },
  communication: { 'mercury-mercury': 2.5, 'mercury-sun': 1.5, 'mercury-moon': 1.5, 'mercury-venus': 1, 'jupiter-mercury': 1, 'mercury-saturn': 1, 'mars-mercury': 1 },
  stability: { 'saturn-sun': 2, 'moon-saturn': 2, 'saturn-venus': 2, 'jupiter-sun': 1.5, 'jupiter-moon': 1.5, 'jupiter-venus': 1, 'saturn-saturn': 1, 'asc-saturn': 1 },
};

const pairKey = (a, b) => [a, b].sort().join('-');
const isHard = (aspect, a, b) => aspect === 'square' || aspect === 'opposition'
  || (aspect === 'conjunction' && ['saturn', 'pluto'].some((x) => x === a || x === b));

export function synastry(chartA, chartB) {
  const pa = points(chartA), pb = points(chartB);
  const aspects = [];
  for (const [a, la] of Object.entries(pa)) {
    for (const [b, lb] of Object.entries(pb)) {
      if (OUTER.includes(a) && OUTER.includes(b)) continue; // κοινό σε όλη τη γενιά, όχι στη σχέση
      if ((a === 'mc' || a === 'asc') && (b === 'mc' || b === 'asc')) continue;
      const s = sep(la, lb), orb = orbFor(a, b);
      for (const asp of ANGLES) {
        const off = Math.abs(s - asp.angle);
        if (off <= orb) aspects.push({ a, b, aspect: asp.name, orb: off, hard: isHard(asp.name, a, b), weight: 1 - off / (orb + 1) });
      }
    }
  }
  aspects.sort((x, y) => x.orb - y.orb);

  // βαθμολογίες 1–5: ξεκινούν από 3 και κινούνται με τις σημαντικές όψεις
  const scores = {};
  for (const [area, table] of Object.entries(WEIGHTS)) {
    let s = 0;
    for (const asp of aspects) {
      const w = table[pairKey(asp.a, asp.b)];
      if (!w) continue;
      // στην έλξη και η ένταση μετρά θετικά· αλλού οι τεταμένες όψεις αφαιρούν, λιγότερο απ' όσο προσθέτουν οι αρμονικές
      const sign = area === 'attraction' ? (asp.hard ? 0.7 : 1) : (asp.hard ? -0.55 : 1);
      s += sign * w * asp.weight;
    }
    scores[area] = Math.max(1, Math.min(5, Math.round((area === 'attraction' ? 2 : 3) + s / 2.2)));
  }

  // πλανήτες του ενός στους οίκους του άλλου
  const overlay = (from, to) => (to.houses ? ['sun', 'moon', 'venus', 'mars'].map((b) => ({ body: b, house: houseOf(from.pos[b].lon, to.houses.cusps) })) : null);
  return { aspects, scores, overlaysAinB: overlay(chartA, chartB), overlaysBinA: overlay(chartB, chartA) };
}
