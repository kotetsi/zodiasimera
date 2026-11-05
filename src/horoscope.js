// Γεννήτρια ημερήσιων δεδομένων ουρανού και προβλέψεων ανά ζώδιο.
import * as E from './ephemeris.js';
import { SIGNS, BODY_NAMES } from './content/signs.js';
import * as T from './content/daily-texts.js';

export const TZ = 'Europe/Athens';
const PLANETS = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

// Διαφορά ώρας Αθήνας από UTC (λεπτά) για μια στιγμή
function tzOffset(date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
      .formatToParts(date).map((p) => [p.type, p.value]),
  );
  const asUTC = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return (asUTC - date.getTime()) / 60000;
}

// Τοπική ώρα Αθήνας → στιγμή UTC
export function athensTime(y, m, d, h = 0, min = 0) {
  let guess = Date.UTC(y, m - 1, d, h, min);
  for (let i = 0; i < 2; i++) guess = Date.UTC(y, m - 1, d, h, min) - tzOffset(new Date(guess)) * 60000;
  return new Date(guess);
}

export function todayInAthens(now = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}`;
}

export function addDays(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return t.toISOString().slice(0, 10);
}

export const fmtTime = (date) => new Intl.DateTimeFormat('el-GR', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date);
export const fmtDate = (date, opts = { day: 'numeric', month: 'long', year: 'numeric' }) => new Intl.DateTimeFormat('el-GR', { timeZone: TZ, ...opts }).format(date);
export const fmtIsoLong = (iso) => { const [y, m, d] = iso.split('-').map(Number); return fmtDate(athensTime(y, m, d, 12), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); };

function hash(str) {
  let h = 2166136261;
  for (const c of str) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// Όλα όσα συμβαίνουν στον ουρανό μέσα σε μια ημέρα (ώρα Αθήνας)
export function skyForDay(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const start = athensTime(y, m, d, 0, 0);
  const end = athensTime(y, m, d + 1, 0, 0);
  const noon = athensTime(y, m, d, 12, 0);
  const pos = E.positions(noon);
  const moonIngress = E.ingresses('moon', start, end)[0] || null;
  const phases = E.lunarPhases(start, end);
  const stations = PLANETS.flatMap((p) => E.stations(p, start, end));
  const ingresses = ['sun', ...PLANETS].flatMap((p) => E.ingresses(p, start, end));
  const elong = E.elongation(noon);
  const moonAspects = E.aspectsBetween(pos, ['moon', 'sun', ...PLANETS], 1)
    .filter((a) => a.a === 'moon' && a.orb <= 5);
  return {
    iso, start, end, noon, pos, moonIngress, phases, stations, ingresses,
    waxing: elong < 180,
    illumination: E.illumination(noon),
    moonAspects,
  };
}

const houseOf = (signIdx, bodySign) => ((bodySign - signIdx + 12) % 12);

// Βαθμολογίες 1–5 από τις πραγματικές θέσεις της ημέρας
function ratings(signIdx, sky) {
  const h = (b) => houseOf(signIdx, sky.pos[b].sign) + 1;
  const asp = (planet) => sky.moonAspects.find((a) => a.b === planet);
  const harm = (a) => (!a ? 0 : a.aspect === 'trine' || a.aspect === 'sextile' ? 1 : a.aspect === 'square' || a.aspect === 'opposition' ? -1 : 0.5);
  const moonH = h('moon');
  let love = 3, work = 3, mood = 3;
  if ([5, 7].includes(moonH)) love += 1;
  if ([5, 7, 1].includes(h('venus'))) love += 0.5;
  love += harm(asp('venus'));
  if (sky.pos.venus.retro) love -= 0.5;
  if ([6, 10, 2].includes(moonH)) work += 1;
  work += harm(asp('jupiter')) * 0.5 + harm(asp('saturn')) * 0.5 + harm(asp('mercury')) * 0.5;
  if (sky.pos.mercury.retro) work -= 0.5;
  if ([1, 5, 9, 11].includes(moonH)) mood += 1;
  if ([8, 12].includes(moonH)) mood -= 1;
  mood += harm(asp('sun')) * 0.5 + harm(asp('jupiter')) * 0.5 + (asp('mars') && harm(asp('mars')) < 0 ? -0.5 : 0) + (asp('saturn') && harm(asp('saturn')) < 0 ? -0.5 : 0);
  const clamp = (x) => Math.max(1, Math.min(5, Math.round(x)));
  return { love: clamp(love), work: clamp(work), mood: clamp(mood) };
}

export function horoscopeFor(signIdx, sky) {
  const sign = SIGNS[signIdx];
  const seed = hash(`${sky.iso}:${sign.slug}`);
  const paras = [];

  // 1. Σελήνη: θέμα της ημέρας (στη θέση του μεσημεριού)
  const moonHouse = houseOf(signIdx, sky.pos.moon.sign);
  paras.push(T.MOON_HOUSE[moonHouse][seed % 2]);
  if (sky.moonIngress) {
    const nh = houseOf(signIdx, sky.moonIngress.sign);
    const t = fmtTime(sky.moonIngress.date);
    const before = sky.moonIngress.date < sky.noon;
    paras[0] = T.MOON_HOUSE[before ? nh : moonHouse][seed % 2];
    const other = before ? houseOf(signIdx, sky.moonIngress.from) : nh;
    paras.push(before
      ? `Μέχρι τις ${t} η Σελήνη βρίσκεται ακόμα ${SIGNS[sky.moonIngress.from].inSign}, οπότε το πρωί η προσοχή σου είναι ακόμα στραμμένη ${T.HOUSE_TOPIC[other]}.`
      : `Στις ${t} η Σελήνη μπαίνει ${SIGNS[sky.moonIngress.sign].inSign} και η έμφαση περνά ${T.HOUSE_TOPIC[other]}.`);
  }

  // 2. Φάση της Σελήνης
  const exact = sky.phases.find((p) => p.kind === 'new' || p.kind === 'full');
  if (exact) {
    const hh = houseOf(signIdx, exact.sign);
    paras.unshift(`${(exact.kind === 'new' ? T.NEW_MOON_HOUSE : T.FULL_MOON_HOUSE)[hh]} (${exact.kind === 'new' ? 'Νέα Σελήνη' : 'Πανσέληνος'} ${SIGNS[exact.sign].inSign}, ${fmtTime(exact.date)})`);
  }

  // 3. Στάσεις πλανητών σήμερα
  for (const st of sky.stations) {
    const area = T.HOUSE_AREA[houseOf(signIdx, st.sign)];
    paras.push(T.STATION_TEXT[st.kind](BODY_NAMES[st.body].nom, area, st.body === 'venus'));
  }

  // 4. Πλανήτης της ημέρας
  const fh = (b) => houseOf(signIdx, sky.pos[b].sign);
  const rotation = ['mercury', 'venus', 'mars'];
  let featured = rotation[(Math.floor(sky.noon.getTime() / 86400000) + signIdx) % 3];
  // ο ανάδρομος Ερμής εναλλάσσεται με τους άλλους, για να μην επαναλαμβάνεται το ίδιο κείμενο κάθε μέρα
  if (sky.pos.mercury.retro && (Math.floor(sky.noon.getTime() / 86400000) + signIdx) % 2 === 0) featured = 'mercury-rx';
  else if (sky.pos.mercury.retro && featured === 'mercury') featured = 'venus';
  // να μη λέει το ίδιο θέμα με τη Σελήνη: διάλεξε άλλον πλανήτη αν πέφτει στον ίδιο οίκο
  const sameAsMoon = (f) => fh(f === 'mercury-rx' ? 'mercury' : f) === moonHouse;
  if (sameAsMoon(featured)) featured = rotation.find((r) => r !== featured.replace('-rx', '') && !sameAsMoon(r)) || featured;
  let planetLine;
  if (featured === 'mercury-rx') planetLine = T.MERCURY_RX_HOUSE[fh('mercury')];
  if (featured === 'mercury') planetLine = T.MERCURY_HOUSE[fh('mercury')];
  if (featured === 'venus') planetLine = T.VENUS_HOUSE[fh('venus')] + (sky.pos.venus.retro ? ' ' + T.VENUS_RX_NOTE : '');
  if (featured === 'mars') planetLine = T.MARS_HOUSE[fh('mars')];
  paras.push(planetLine);

  // 5. Συμβουλή από την ισχυρότερη όψη της Σελήνης
  const top = sky.moonAspects[0];
  let advice;
  if (top) {
    const pair = T.MOON_ASPECT_ADVICE[top.b];
    const kind = top.aspect === 'trine' || top.aspect === 'sextile' ? 'good'
      : top.aspect === 'square' || top.aspect === 'opposition' ? 'hard'
      : ['venus', 'jupiter', 'sun'].includes(top.b) ? 'good' : 'hard';
    advice = pair[kind];
  } else {
    advice = T.PHASE_GENERIC[sky.waxing ? 'waxing' : 'waning'][seed % 2];
  }

  return {
    sign, paras, advice,
    ratings: ratings(signIdx, sky),
    moonHouse: moonHouse + 1,
    featured,
  };
}
