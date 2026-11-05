// Διελεύσεις: όψεις των πλανητών μιας ημέρας προς τις θέσεις του γενέθλιου χάρτη.
import { longitude } from './ephemeris.js';
import { houseOf } from './natal.js';

const ANGLES = [
  { angle: 0, name: 'conjunction' }, { angle: 60, name: 'sextile' }, { angle: 90, name: 'square' },
  { angle: 120, name: 'trine' }, { angle: 180, name: 'opposition' },
];
const FAST = ['sun', 'mercury', 'venus', 'mars'];
const SLOW = ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
// Απόκλιση (μοίρες) μέσα στην οποία μετράει μια διέλευση
const ORB = { sun: 1.5, mercury: 1.5, venus: 1.5, mars: 1.5, jupiter: 1.5, saturn: 1.5, uranus: 1, neptune: 1, pluto: 1 };

const sep = (a, b) => { let d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

// Σημεία του χάρτη που δέχονται διελεύσεις
export function natalPoints(chart) {
  const pts = {};
  for (const b of ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']) pts[b] = chart.pos[b].lon;
  if (chart.houses) { pts.asc = chart.houses.asc; pts.mc = chart.houses.mc; }
  return pts;
}

function aspectAt(tLon, nLon, orb) {
  const s = sep(tLon, nLon);
  for (const a of ANGLES) if (Math.abs(s - a.angle) <= orb) return { aspect: a.name, orb: Math.abs(s - a.angle) };
  return null;
}

// Περίοδος όπου η διέλευση μένει εντός απόκλισης (μπορεί να περιλαμβάνει ανάδρομη επιστροφή)
function period(body, nLon, aspectName, orb, day) {
  const angle = ANGLES.find((a) => a.name === aspectName).angle;
  const inside = (t) => Math.abs(sep(longitude(body, new Date(t)), nLon) - angle) <= orb;
  const step = 86400000;
  let start = day.getTime(), end = day.getTime();
  for (let i = 0; i < 500 && inside(start - step); i++) start -= step;
  for (let i = 0; i < 500 && inside(end + step); i++) end += step;
  // ακριβέστερη ημέρα κορύφωσης μέσα στην περίοδο
  let exact = start, best = 99;
  for (let t = start; t <= end; t += step / 2) {
    const off = Math.abs(sep(longitude(body, new Date(t)), nLon) - angle);
    if (off < best) { best = off; exact = t; }
  }
  return { start: new Date(start), end: new Date(end), exact: new Date(exact) };
}

// Ακριβής στιγμή όψης της Σελήνης μέσα στο [from, to]
function moonExact(nLon, angle, from, to) {
  const f = (t) => {
    // απόσταση από την ακριβή όψη με πρόσημο, για τις δύο πλευρές
    let d = ((longitude('moon', new Date(t)) - nLon) % 360 + 360) % 360;
    const targets = angle === 0 ? [0, 360] : angle === 180 ? [180] : [angle, 360 - angle];
    let best = null;
    for (const tg of targets) { const v = d - tg; if (best === null || Math.abs(v) < Math.abs(best)) best = v; }
    return best;
  };
  const step = 30 * 60000;
  for (let t = from.getTime(); t < to.getTime(); t += step) {
    const a = f(t), b = f(t + step);
    if (Math.abs(a) < 20 && Math.abs(b) < 20 && ((a <= 0 && b > 0) || (a >= 0 && b < 0))) {
      let lo = t, hi = t + step;
      for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if ((f(lo) <= 0) === (f(m) <= 0)) lo = m; else hi = m; }
      return new Date((lo + hi) / 2);
    }
  }
  return null;
}

// Όλες οι διελεύσεις μιας ημέρας [dayStart, dayEnd)
export function transitsForDay(chart, dayStart, dayEnd) {
  const pts = natalPoints(chart);
  const noon = new Date((dayStart.getTime() + dayEnd.getTime()) / 2);
  const moon = [];
  for (const [p, lon] of Object.entries(pts)) {
    for (const a of ANGLES) {
      const when = moonExact(lon, a.angle, dayStart, dayEnd);
      if (when) moon.push({ transit: 'moon', natal: p, aspect: a.name, exact: when });
    }
  }
  moon.sort((x, y) => x.exact - y.exact);

  const fast = [], slow = [];
  for (const body of [...FAST, ...SLOW]) {
    const tLon = longitude(body, noon);
    for (const [p, lon] of Object.entries(pts)) {
      const hit = aspectAt(tLon, lon, ORB[body]);
      if (!hit) continue;
      const item = { transit: body, natal: p, aspect: hit.aspect, orb: hit.orb };
      if (SLOW.includes(body)) slow.push({ ...item, ...period(body, lon, hit.aspect, ORB[body], noon) });
      else fast.push(item);
    }
  }
  fast.sort((a, b) => a.orb - b.orb);
  slow.sort((a, b) => SLOW.indexOf(b.transit) - SLOW.indexOf(a.transit) || a.orb - b.orb);

  // σε ποιους οίκους του χάρτη βρίσκονται σήμερα Σελήνη και γρήγοροι πλανήτες
  const houses = {};
  if (chart.houses) for (const b of ['moon', ...FAST]) houses[b] = houseOf(longitude(b, noon), chart.houses.cusps);
  return { moon, fast, slow, houses, moonLon: longitude('moon', noon) };
}
