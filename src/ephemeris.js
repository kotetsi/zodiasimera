// Υπολογισμός θέσεων ουρανίων σωμάτων χωρίς εξωτερικές βιβλιοθήκες.
// Πλανήτες: κεπλέρια στοιχεία JPL (E. M. Standish, "Approximate Positions of the
// Planets", Πίνακας 1, ισχύς 1800–2050). Σελήνη: J. Meeus, Astronomical
// Algorithms, κεφ. 47 (κύριοι όροι). Ακρίβεια: κλάσματα της μοίρας — αρκετή
// για ζώδια, μοίρες, όψεις, ανάδρομους και φάσεις της Σελήνης.

const DEG = Math.PI / 180;
const norm = (x) => ((x % 360) + 360) % 360;
const sind = (x) => Math.sin(x * DEG);
const cosd = (x) => Math.cos(x * DEG);

// a, e, I, L, ϖ (long. perihelion), Ω  και ρυθμοί ανά αιώνα
const ELEMENTS = {
  mercury: [[0.38709927, 0.20563593, 7.00497902, 252.2503235, 77.45779628, 48.33076593],
            [0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081]],
  venus:   [[0.72333566, 0.00677672, 3.39467605, 181.9790995, 131.60246718, 76.67984255],
            [0.0000039, -0.00004107, -0.0007889, 58517.81538729, 0.00268329, -0.27769418]],
  earth:   [[1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0.0],
            [0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0.0]],
  mars:    [[1.52371034, 0.0933941, 1.84969142, -4.55343205, -23.94362959, 49.55953891],
            [0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343]],
  jupiter: [[5.202887, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909],
            [-0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106]],
  saturn:  [[9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448],
            [-0.0012506, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794]],
  uranus:  [[19.18916464, 0.04725744, 0.77263783, 313.23810451, 170.9542763, 74.01692503],
            [-0.00196176, -0.00004397, -0.00242939, 428.48202785, 0.40805281, 0.04240589]],
  neptune: [[30.06992276, 0.00859048, 1.77004347, -55.12002969, 44.96476227, 131.78422574],
            [0.00026291, 0.00005105, 0.00035372, 218.45945325, -0.32241464, -0.00508664]],
  pluto:   [[39.48211675, 0.2488273, 17.14001206, 238.92903833, 224.06891629, 110.30393684],
            [-0.00031596, 0.0000517, 0.00004818, 145.20780515, -0.04062942, -0.01183482]],
};

// Ημερομηνία JS (UT) → Ιουλιανή ημέρα σε Γήινο Χρόνο (TT = UT + ΔT, ΔT ≈ 69 δευτ.)
const DELTA_T = 69.2;
export function julianDay(date) {
  return (date.getTime() / 1000 + DELTA_T) / 86400 + 2440587.5;
}
const centuries = (jd) => (jd - 2451545.0) / 36525;

function solveKepler(Mdeg, e) {
  const M = norm(Mdeg + 180) - 180; // σε [-180,180)
  let E = M + (e * 180 / Math.PI) * sind(M);
  for (let i = 0; i < 30; i++) {
    const dM = M - (E - (e * 180 / Math.PI) * sind(E));
    const dE = dM / (1 - e * cosd(E));
    E += dE;
    if (Math.abs(dE) < 1e-9) break;
  }
  return E;
}

// Ηλιοκεντρικές ορθογώνιες συντεταγμένες (εκλειπτική & ισημερία J2000), σε AU
function heliocentric(body, T) {
  const [el, rate] = ELEMENTS[body];
  const [a, e, I, L, wbar, Om] = el.map((v, i) => v + rate[i] * T);
  const w = wbar - Om;
  const E = solveKepler(L - wbar, e);
  const xp = a * (cosd(E) - e);
  const yp = a * Math.sqrt(1 - e * e) * sind(E);
  const cw = cosd(w), sw = sind(w), cO = cosd(Om), sO = sind(Om), cI = cosd(I), sI = sind(I);
  return [
    (cw * cO - sw * sO * cI) * xp + (-sw * cO - cw * sO * cI) * yp,
    (cw * sO + sw * cO * cI) * xp + (-sw * sO + cw * cO * cI) * yp,
    sw * sI * xp + cw * sI * yp,
  ];
}

// Μετάπτωση των ισημεριών: J2000 → ισημερία της ημερομηνίας (τροπικός ζωδιακός)
const precession = (T) => (5028.796195 * T + 1.1054348 * T * T) / 3600;

function geocentricLongitude(body, T) {
  const earth = heliocentric('earth', T);
  let x, y;
  if (body === 'sun') {
    x = -earth[0]; y = -earth[1];
  } else {
    // διόρθωση χρόνου φωτός (μία επανάληψη)
    let p = heliocentric(body, T);
    const dist = Math.hypot(p[0] - earth[0], p[1] - earth[1], p[2] - earth[2]);
    p = heliocentric(body, T - (dist * 0.0057755183) / 36525);
    x = p[0] - earth[0]; y = p[1] - earth[1];
  }
  return norm(Math.atan2(y, x) / DEG + precession(T));
}

// Σελήνη — Meeus κεφ. 47: [D, M, M', F, συντελεστής ×1e-6 μοίρες]
const MOON_TERMS = [
  [0, 0, 1, 0, 6288774], [2, 0, -1, 0, 1274027], [2, 0, 0, 0, 658314], [0, 0, 2, 0, 213618],
  [0, 1, 0, 0, -185116], [0, 0, 0, 2, -114332], [2, 0, -2, 0, 58793], [2, -1, -1, 0, 57066],
  [2, 0, 1, 0, 53322], [2, -1, 0, 0, 45758], [0, 1, -1, 0, -40923], [1, 0, 0, 0, -34720],
  [0, 1, 1, 0, -30383], [2, 0, 0, -2, 15327], [0, 0, 1, 2, -12528], [0, 0, 1, -2, 10980],
  [4, 0, -1, 0, 10675], [0, 0, 3, 0, 10034], [4, 0, -2, 0, 8548], [2, 1, -1, 0, -7888],
  [2, 1, 0, 0, -6766], [1, 0, -1, 0, -5163], [1, 1, 0, 0, 4987], [2, -1, 1, 0, 4036],
  [2, 0, 2, 0, 3994], [4, 0, 0, 0, 3861], [2, 0, -3, 0, 3665], [0, 1, -2, 0, -2689],
  [2, 0, -1, 2, -2602], [2, -1, -2, 0, 2390], [1, 0, 1, 0, -2348], [2, -2, 0, 0, 2236],
  [0, 1, 2, 0, -2120], [0, 2, 0, 0, -2069], [2, -2, -1, 0, 2048], [2, 0, 1, -2, -1773],
  [2, 0, 0, 2, -1595], [4, -1, -1, 0, 1215], [0, 0, 2, 2, -1110], [3, 0, -1, 0, -892],
  [2, 1, 1, 0, -810], [4, -1, -2, 0, 759], [0, 2, -1, 0, -713], [2, 2, -1, 0, -700],
  [2, 1, -2, 0, 691], [2, -1, 0, -2, 596], [4, 0, 1, 0, 549], [0, 0, 4, 0, 537],
  [4, -1, 0, 0, 520], [1, 0, -2, 0, -487], [2, 1, 0, -2, -399], [0, 0, 2, -2, -381],
  [1, 1, 1, 0, 351], [3, 0, -2, 0, -340], [4, 0, -3, 0, 330], [2, -1, 2, 0, 327],
  [0, 2, 1, 0, -323], [1, 1, -1, 0, 299], [2, 0, 3, 0, 294],
];

function moonLongitude(T) {
  const Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T ** 3 / 538841 - T ** 4 / 65194000;
  const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + T ** 3 / 545868 - T ** 4 / 113065000;
  const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + T ** 3 / 24490000;
  const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T ** 3 / 69699 - T ** 4 / 14712000;
  const F = 93.272095 + 483202.0175233 * T - 0.0036539 * T * T - T ** 3 / 3526000 + T ** 4 / 863310000;
  const E = 1 - 0.002516 * T - 0.0000074 * T * T;
  const A1 = 119.75 + 131.849 * T;
  const A2 = 53.09 + 479264.29 * T;
  let sum = 0;
  for (const [d, m, mp, f, c] of MOON_TERMS) {
    const ef = Math.abs(m) === 1 ? E : Math.abs(m) === 2 ? E * E : 1;
    sum += c * ef * sind(d * D + m * M + mp * Mp + f * F);
  }
  sum += 3958 * sind(A1) + 1962 * sind(Lp - F) + 318 * sind(A2);
  return norm(Lp + sum / 1e6);
}

// Μέσος Βόρειος Δεσμός της Σελήνης
const meanNode = (T) => norm(125.0445479 - 1934.1362891 * T + 0.0020754 * T * T);

export const BODIES = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'node'];

export function longitude(body, date) {
  const T = centuries(julianDay(date));
  if (body === 'moon') return moonLongitude(T);
  if (body === 'node') return meanNode(T);
  return geocentricLongitude(body, T);
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
