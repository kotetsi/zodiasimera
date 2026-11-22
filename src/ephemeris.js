// Θέσεις ουρανίων σωμάτων με το Astronomy Engine (Don Cross, άδεια MIT,
// https://github.com/cosinekitty/astronomy): μοντέλα VSOP87 για τους πλανήτες, NOVAS C 3.1
// για τις μετατροπές, ακρίβεια ±1′. Φαινόμενα γεωκεντρικά μήκη στην αληθή εκλειπτική της
// ημερομηνίας (τροπικός ζωδιακός), με χρόνο φωτός, αποπλάνηση, μετάπτωση και ζύγιση.
// Στον browser η βιβλιοθήκη φορτώνεται από το /assets/astronomy.min.js (βλ. site/bundle.js).
import * as Astro from './vendor/astronomy.js';

const DEG = Math.PI / 180;
const norm = (x) => ((x % 360) + 360) % 360;
const cosd = (x) => Math.cos(x * DEG);

// Ημερομηνία JS (UT) → Ιουλιανή ημέρα σε Γήινο Χρόνο (TT = UT + ΔT, ΔT ≈ 69 δευτ.)
// Χρησιμοποιείται από τους οίκους/ωροσκόπο (natal.js)· οι θέσεις έχουν δικό τους ΔT.
const DELTA_T = 69.2;
export function julianDay(date) {
  return (date.getTime() / 1000 + DELTA_T) / 86400 + 2440587.5;
}
const centuries = (jd) => (jd - 2451545.0) / 36525;

const AE_BODY = {
  sun: Astro.Body.Sun, moon: Astro.Body.Moon, mercury: Astro.Body.Mercury, venus: Astro.Body.Venus,
  mars: Astro.Body.Mars, jupiter: Astro.Body.Jupiter, saturn: Astro.Body.Saturn,
  uranus: Astro.Body.Uranus, neptune: Astro.Body.Neptune, pluto: Astro.Body.Pluto,
};

// Μέσος Βόρειος Δεσμός της Σελήνης (Meeus κεφ. 47)
const meanNode = (T) => norm(125.0445479 - 1934.1362891 * T + 0.0020754 * T * T);

export const BODIES = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'node'];

export function longitude(body, date) {
  if (body === 'node') return meanNode(centuries(julianDay(date)));
  const vec = Astro.GeoVector(AE_BODY[body], Astro.MakeTime(date), true);
  return norm(Astro.Ecliptic(vec).elon);
}

// Ημερήσια κίνηση (μοίρες/ημέρα) — αρνητική = ανάδρομη φορά
export function speed(body, date) {
  const h = 6 * 3600000;
  const a = longitude(body, new Date(date.getTime() - h));
  const b = longitude(body, new Date(date.getTime() + h));
  let d = b - a;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d * 2;
}

export function positions(date) {
  const out = {};
  for (const b of BODIES) {
    const lon = longitude(b, date);
    const sp = speed(b, date);
    out[b] = {
      lon,
      sign: Math.floor(lon / 30),
      deg: lon % 30,
      speed: sp,
      retro: b !== 'node' && b !== 'sun' && b !== 'moon' && sp < 0,
    };
  }
  return out;
}

// Επιμήκυνση Σελήνης από Ήλιο (0 = νέα σελήνη, 180 = πανσέληνος)
export function elongation(date) {
  return norm(longitude('moon', date) - longitude('sun', date));
}

// Ποσοστό φωτισμένου δίσκου της Σελήνης (προσέγγιση)
export function illumination(date) {
  return (1 - cosd(elongation(date))) / 2;
}

const signedDiff = (a, b) => { let d = norm(a - b); return d > 180 ? d - 360 : d; };

// Γενική εύρεση στιγμής όπου f(t) διασχίζει το 0 μέσα στο [t0, t1] (διχοτόμηση)
function bisect(f, t0, t1, iterations = 40) {
  let a = t0, b = t1, fa = f(a);
  for (let i = 0; i < iterations; i++) {
    const m = (a + b) / 2, fm = f(m);
    if ((fa <= 0 && fm <= 0) || (fa > 0 && fm > 0)) { a = m; fa = fm; } else { b = m; }
  }
  return new Date((a + b) / 2);
}

// Φάσεις Σελήνης (νέα, α' τέταρτο, πανσέληνος, τελευταίο τέταρτο) στο διάστημα
export function lunarPhases(from, to) {
  const out = [];
  const step = 6 * 3600000;
  const targets = [[0, 'new'], [90, 'first'], [180, 'full'], [270, 'last']];
  for (let t = from.getTime(); t < to.getTime(); t += step) {
    const e0 = elongation(new Date(t)), e1 = elongation(new Date(t + step));
    for (const [angle, kind] of targets) {
      const d0 = signedDiff(e0, angle), d1 = signedDiff(e1, angle);
      if (d0 < 0 && d1 >= 0) {
        const when = bisect((x) => signedDiff(elongation(new Date(x)), angle), t, t + step);
        const lon = longitude('moon', when);
        out.push({ kind, date: when, lon, sign: Math.floor(lon / 30), deg: lon % 30 });
      }
    }
  }
  return out;
}

// Είσοδοι ενός σώματος σε νέο ζώδιο στο διάστημα
export function ingresses(body, from, to, stepHours = body === 'moon' ? 2 : 12) {
  const out = [];
  const step = stepHours * 3600000;
  let prev = Math.floor(longitude(body, from) / 30);
  for (let t = from.getTime(); t < to.getTime(); t += step) {
    const s = Math.floor(longitude(body, new Date(t + step)) / 30);
    if (s !== prev) {
      const boundary = (body === 'node' || speed(body, new Date(t)) < 0 ? prev : s) * 30;
      const when = bisect((x) => signedDiff(longitude(body, new Date(x)), boundary === 0 && s === 11 ? 360 : boundary), t, t + step);
      out.push({ body, date: when, from: prev, sign: s, retro: speed(body, when) < 0 });
      prev = s;
    }
  }
  return out;
}

// Στάσεις (ανάδρομος / ορθή φορά) ενός πλανήτη στο διάστημα
export function stations(body, from, to) {
  const out = [];
  const step = 12 * 3600000;
  let prev = speed(body, from);
  for (let t = from.getTime(); t < to.getTime(); t += step) {
    const s = speed(body, new Date(t + step));
    if ((prev >= 0) !== (s >= 0)) {
      const when = bisect((x) => -speed(body, new Date(x)) * (prev >= 0 ? 1 : -1), t, t + step, 30);
      const lon = longitude(body, when);
      out.push({ body, date: when, kind: prev >= 0 ? 'retrograde' : 'direct', lon, sign: Math.floor(lon / 30), deg: lon % 30 });
    }
    prev = s;
  }
  return out;
}

export const ASPECTS = [
  { angle: 0, name: 'conjunction', orb: 8 },
  { angle: 60, name: 'sextile', orb: 4 },
  { angle: 90, name: 'square', orb: 6 },
  { angle: 120, name: 'trine', orb: 6 },
  { angle: 180, name: 'opposition', orb: 8 },
];

// Όψεις μεταξύ θέσεων (επιστρέφει ταξινομημένες κατά ακρίβεια)
export function aspectsBetween(pos, bodies, orbScale = 1) {
  const out = [];
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i], b = bodies[j];
      let sep = Math.abs(pos[a].lon - pos[b].lon);
      if (sep > 180) sep = 360 - sep;
      for (const asp of ASPECTS) {
        const off = Math.abs(sep - asp.angle);
        if (off <= asp.orb * orbScale) out.push({ a, b, aspect: asp.name, orb: off });
      }
    }
  }
  return out.sort((x, y) => x.orb - y.orb);
}

// Απόσταση Γης–Σελήνης σε km (για υπερπανσελήνους)
export function moonDistanceKm(date) {
  return Astro.GeoMoon(Astro.MakeTime(date)).Length() * Astro.KM_PER_AU;
}
