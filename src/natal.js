// Γενέθλιος χάρτης: αστρικός χρόνος, ωροσκόπος, μεσουράνημα, οίκοι Placidus.
// Τρέχει και στον Node (build) και στον browser (σελίδα χάρτη).
import { positions, aspectsBetween } from './ephemeris.js';

const DEG = Math.PI / 180;
const norm = (x) => ((x % 360) + 360) % 360;
const sind = (x) => Math.sin(x * DEG);
const cosd = (x) => Math.cos(x * DEG);
const tand = (x) => Math.tan(x * DEG);
const atan2d = (y, x) => Math.atan2(y, x) / DEG;

// Τοπική ώρα σε ζώνη IANA → στιγμή UTC. Ο browser/Node ξέρει τις ιστορικές αλλαγές ώρας.
export function zonedTime(y, m, d, h, min, timeZone) {
  const offset = (date) => {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
      .formatToParts(date).map((x) => [x.type, x.value]));
    return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - date.getTime();
  };
  const wall = Date.UTC(y, m - 1, d, h, min);
  let t = wall - offset(new Date(wall));
  t = wall - offset(new Date(t));
  return new Date(t);
}

export function utcOffsetLabel(date, timeZone) {
  const p = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' }).formatToParts(date).find((x) => x.type === 'timeZoneName');
  return p ? p.value.replace('GMT', 'UTC') : '';
}

// Μέσος αστρικός χρόνος Γκρίνουιτς σε μοίρες (από UT)
function gmst(date) {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const T = (jd - 2451545) / 36525;
  return norm(280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * T * T - T ** 3 / 38710000);
}

function obliquity(date) {
  const T = (date.getTime() / 86400000 + 2440587.5 - 2451545) / 36525;
  return 23.439291 - 0.0130042 * T;
}

// Εκλειπτικό μήκος του σημείου της εκλειπτικής με ορθή αναφορά ra
const raToLon = (ra, eps) => norm(atan2d(sind(ra), cosd(ra) * cosd(eps)));

export function angles(date, lat, lon) {
  return anglesFromRamc(norm(gmst(date) + lon), obliquity(date), lat);
}

// Ωροσκόπος και μεσουράνημα από αστρικό χρόνο (RAMC), λόξωση και γεωγραφικό πλάτος
export function anglesFromRamc(ramc, eps, lat) {
  const mc = raToLon(ramc, eps);
  const asc = norm(atan2d(cosd(ramc), -(sind(ramc) * cosd(eps) + tand(lat) * sind(eps))));
  return { ramc, eps, asc, mc };
}

// Ορθή αναφορά σημείου της εκλειπτικής (αντίστροφο του raToLon)
export const lonToRa = (lon, eps) => norm(atan2d(sind(lon) * cosd(eps), cosd(lon)));

// Οίκοι Placidus από RAMC (επαναληπτικά, με τα ημι-τόξα κάθε σημείου). Πάνω από ~66° πλάτος δεν ορίζονται.
export function placidusFromRamc(ramc, eps, lat) {
  const { asc, mc } = anglesFromRamc(ramc, eps, lat);
  if (Math.abs(lat) > 66) return null;
  const cusp = (fraction, above) => {
    let ra = above ? ramc + fraction * 90 : ramc + 180 - fraction * 90;
    for (let i = 0; i < 50; i++) {
      const lonP = raToLon(ra, eps);
      const decl = Math.asin(sind(eps) * sind(lonP)) / DEG;
      const x = tand(lat) * tand(decl);
      if (Math.abs(x) >= 1) return null;
      const ad = Math.asin(x) / DEG;
      const next = above ? ramc + fraction * (90 + ad) : ramc + 180 - fraction * (90 - ad);
      if (Math.abs(next - ra) < 1e-7) { ra = next; break; }
      ra = next;
    }
    return raToLon(ra, eps);
  };
  const c11 = cusp(1 / 3, true), c12 = cusp(2 / 3, true), c2 = cusp(2 / 3, false), c3 = cusp(1 / 3, false);
  if ([c11, c12, c2, c3].some((c) => c === null)) return null;
  const cusps = [asc, c2, c3, norm(mc + 180), norm(c11 + 180), norm(c12 + 180), norm(asc + 180), norm(c2 + 180), norm(c3 + 180), mc, c11, c12];
  return { asc, mc, cusps, system: 'placidus' };
}

export function placidus(date, lat, lon) {
  return placidusFromRamc(norm(gmst(date) + lon), obliquity(date), lat);
}

export const obliquityAt = obliquity;

// Ίσοι οίκοι από τον ωροσκόπο (εφεδρικά για πολύ μεγάλα γεωγραφικά πλάτη)
export function equalHouses(date, lat, lon) {
  const { asc, mc } = angles(date, lat, lon);
  return { asc, mc, cusps: Array.from({ length: 12 }, (_, i) => norm(asc + i * 30)), system: 'equal' };
}

// Σε ποιον οίκο πέφτει ένα εκλειπτικό μήκος
export function houseOf(lon, cusps) {
  for (let i = 0; i < 12; i++) {
    const a = cusps[i], b = cusps[(i + 1) % 12];
    const span = norm(b - a), off = norm(lon - a);
    if (off < span) return i + 1;
  }
  return 1;
}

export const NATAL_BODIES = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'node'];

// Πλήρης χάρτης. timeKnown=false: θέσεις για το μεσημέρι, χωρίς οίκους και ωροσκόπο.
export function natalChart({ date, lat, lon, timeKnown = true }) {
  const pos = positions(date);
  let houses = null;
  if (timeKnown) houses = placidus(date, lat, lon) || equalHouses(date, lat, lon);
  const bodies = NATAL_BODIES.map((b) => ({ body: b, ...pos[b], house: houses ? houseOf(pos[b].lon, houses.cusps) : null }));
  const forAspects = { ...pos };
  if (houses) { forAspects.asc = { lon: houses.asc }; forAspects.mc = { lon: houses.mc }; }
  const aspectBodies = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', ...(houses ? ['asc', 'mc'] : [])];
  const aspects = aspectsBetween(forAspects, aspectBodies, 1)
    .filter((a) => !(a.a === 'asc' && a.b === 'mc'))
    // πιο στενή απόκλιση όταν δεν συμμετέχει φωτεινός (Ήλιος/Σελήνη)
    .filter((a) => ['sun', 'moon'].includes(a.a) || ['sun', 'moon'].includes(a.b) || a.orb <= 6);
  return { date, lat, lon, timeKnown, pos, houses, bodies, aspects };
}
