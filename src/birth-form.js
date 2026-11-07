// Κοινή φόρμα στοιχείων γέννησης (γενέθλιος χάρτης, προσωπικό ωροσκόπιο).
// Τα στοιχεία μένουν μόνο στον browser του επισκέπτη (localStorage), αν το επιλέξει.
import { CITIES } from './content/cities.js';
import { zonedTime } from './natal.js';

const KEY = 'zodiasimera-birth';
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const cityLabel = (c) => `${c.name}, ${c.region}`;

// ── Αναζήτηση τόπου ──────────────────────────────────────────────────────
// 1) Πρώτα στη λίστα πόλεων του site (χωρίς τόνους/κεφαλαία, π.χ. «μαρουσι»).
// 2) Αν δεν υπάρχει, αναζήτηση στο Open-Meteo Geocoding (δωρεάν, χωρίς κλειδί):
//    στέλνεται ΜΟΝΟ το όνομα του τόπου, όχι ημερομηνία ή ώρα γέννησης.
const norm = (s) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/ς/g, 'σ').replace(/[.,;·]/g, ' ').replace(/\s+/g, ' ').trim();
const LOCAL = CITIES.map((c) => ({ c, n: norm(c.name), l: norm(cityLabel(c)) }));
const GREEKLISH = { α: 'a', β: 'v', γ: 'g', δ: 'd', ε: 'e', ζ: 'z', η: 'i', θ: 'th', ι: 'i', κ: 'k', λ: 'l', μ: 'm', ν: 'n', ξ: 'x', ο: 'o', π: 'p', ρ: 'r', σ: 's', τ: 't', υ: 'y', φ: 'f', χ: 'ch', ψ: 'ps', ω: 'o' };
const toLatin = (s) => norm(s).replace(/ου/g, 'ou').replace(/αι/g, 'ai').replace(/ει|οι/g, 'i').split('').map((ch) => GREEKLISH[ch] ?? ch).join('');

function findLocal(typed) {
  const t = norm(typed);
  if (!t) return null;
  const hit = LOCAL.find((x) => x.l === t) || LOCAL.find((x) => x.n === t) || LOCAL.find((x) => t.startsWith(`${x.n} `));
  if (hit) return hit.c;
  const pre = LOCAL.filter((x) => x.n.startsWith(t));
  return pre.length === 1 ? pre[0].c : null;
}
const localPlace = (c) => ({ name: cityLabel(c), lat: c.lat, lon: c.lon, tz: c.tz });

const geoCache = new Map();
async function geocode(q) {
  const key = norm(q);
  if (geoCache.has(key)) return geoCache.get(key);
  const ask = async (name) => {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=8&language=el&format=json`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`geocoding ${r.status}`);
    const j = await r.json();
    return (j.results || []).filter((x) => x.timezone && Number.isFinite(x.latitude) && Number.isFinite(x.longitude)).map((x) => ({
      name: [x.name, x.admin1 && x.admin1 !== x.name ? x.admin1 : null, x.country_code !== 'GR' ? x.country : null].filter(Boolean).join(', '),
      lat: Math.round(x.latitude * 1e4) / 1e4,
      lon: Math.round(x.longitude * 1e4) / 1e4,
      tz: x.timezone,
    }));
  };
  let res = await ask(q.trim());
  if (!res.length && /[α-ω]/.test(key)) res = await ask(toLatin(q));
  // ίδια ονόματα από την ίδια περιοχή εμφανίζονται μία φορά
  const seen = new Set();
  res = res.filter((p) => (seen.has(p.name) ? false : seen.add(p.name)));
  geoCache.set(key, res);
  return res;
}

const fmtCoord = (p) => `${Math.abs(p.lat).toFixed(2)}° ${p.lat >= 0 ? 'Β' : 'Ν'}, ${Math.abs(p.lon).toFixed(2)}° ${p.lon >= 0 ? 'Α' : 'Δ'}`;
const state = {}; // ανά πρόθεμα: { typed, place, pending, results }

function setInfo(px, html) {
  const el = $(`${px}-placeinfo`);
  if (el) el.innerHTML = html;
}
function showResolved(px, place, guessed) {
  setInfo(px, `📍 ${esc(place.name)} <span class="muted">· ${fmtCoord(place)} · ${esc(place.tz)}</span>${guessed ? '<br><span class="muted">Αν δεν είναι αυτός ο τόπος, διάλεξε άλλον από τη λίστα.</span>' : ''}`);
}

// Βρίσκει τον τόπο για ό,τι έχει γραφτεί στο πεδίο και ενημερώνει λίστα και ένδειξη
function lookup(px) {
  const input = $(`${px}-place`);
  const typed = input.value.trim();
  const st = state[px] || (state[px] = {});
  if (st.typed === typed && (st.place || st.pending)) return st.pending || Promise.resolve(st.place);
  st.typed = typed;
  st.place = null;
  st.pending = null;
  const list = $(`${px}-cities`);
  const t = norm(typed);
  const localMatches = t ? LOCAL.filter((x) => x.n.includes(t) || x.l.includes(t)).slice(0, 6).map((x) => cityLabel(x.c)) : [];
  const fillList = (remote) => {
    const labels = [...new Set([...localMatches, ...remote.map((p) => p.name)])];
    list.innerHTML = (labels.length ? labels : CITIES.map(cityLabel)).map((l) => `<option value="${esc(l)}"></option>`).join('');
  };
  if (!typed) { setInfo(px, ''); fillList([]); return Promise.resolve(null); }

  const c = findLocal(typed);
  if (c) {
    st.place = localPlace(c);
    showResolved(px, st.place, false);
    fillList([]);
    return Promise.resolve(st.place);
  }
  // από προηγούμενη αναζήτηση (π.χ. επιλογή από τη λίστα)
  for (const res of geoCache.values()) {
    const p = res.find((x) => norm(x.name) === t);
    if (p) { st.place = p; showResolved(px, p, false); return Promise.resolve(p); }
  }
  if (t.length < 3) { setInfo(px, '<span class="muted">Γράψε τουλάχιστον 3 γράμματα.</span>'); fillList([]); return Promise.resolve(null); }

  setInfo(px, '<span class="muted">Αναζήτηση τόπου…</span>');
  st.pending = geocode(typed).then((res) => {
    if (state[px].typed !== typed) return state[px].pending || state[px].place;
    st.pending = null;
    st.results = res;
    fillList(res);
    if (!res.length) {
      setInfo(px, `Δεν βρέθηκε τόπος «${esc(typed)}». Δοκίμασε άλλη γραφή ή άνοιξε «Άλλος τόπος» για συντεταγμένες.`);
      return null;
    }
    const exact = res.find((p) => norm(p.name) === t || norm(p.name.split(',')[0]) === t);
    st.place = exact || res[0];
    showResolved(px, st.place, !exact || res.length > 1);
    return st.place;
  }).catch(() => {
    st.pending = null;
    setInfo(px, 'Η αναζήτηση τόπου δεν είναι διαθέσιμη αυτή τη στιγμή. Διάλεξε πόλη από τη λίστα ή άνοιξε «Άλλος τόπος».');
    return null;
  });
  return st.pending;
}

// Περιμένει να ολοκληρωθεί η αναζήτηση τόπου πριν από τον υπολογισμό
export async function ensurePlace(px) {
  if ($(`${px}-custom`).open) return;
  await lookup(px);
}

function loadSaved() {
  try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; }
}
function save(v) {
  try { if (v) localStorage.setItem(KEY, JSON.stringify(v)); else localStorage.removeItem(KEY); } catch (e) { /* αποκλεισμένη αποθήκευση */ }
}

// Μετατρέπει αποθηκευμένα/πεδία σε στοιχεία υπολογισμού
export function toInput(v) {
  const [y, m, d] = v.date.split('-').map(Number);
  const [h, min] = v.timeKnown ? v.time.split(':').map(Number) : [12, 0];
  return { name: v.name || '', y, m, d, h, min, timeKnown: v.timeKnown, place: v.place, instant: zonedTime(y, m, d, h, min, v.place.tz) };
}

// Πεδία με πρόθεμα (π.χ. 'nc', 'sa', 'sb'), ώστε να υπάρχουν πολλές ομάδες στην ίδια σελίδα
export function initFields(px) {
  const f = (id) => $(`${px}-${id}`);
  f('cities').innerHTML = CITIES.map((c) => `<option value="${esc(cityLabel(c))}"></option>`).join('');
  const label = f('place').closest('label') || f('place');
  if (!f('placeinfo')) {
    const info = document.createElement('p');
    info.id = `${px}-placeinfo`;
    info.className = 'place-info wide';
    info.setAttribute('aria-live', 'polite');
    label.insertAdjacentElement('afterend', info);
  }
  let timer;
  f('place').addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => lookup(px), 400); });
  f('place').addEventListener('change', () => { clearTimeout(timer); lookup(px); });
  let zones = ['Europe/Athens', 'UTC'];
  try { zones = Intl.supportedValuesOf('timeZone'); } catch (e) { /* παλιοί browsers */ }
  f('tz').innerHTML = zones.map((z) => `<option${z === 'Europe/Athens' ? ' selected' : ''}>${esc(z)}</option>`).join('');
  f('notime').addEventListener('change', () => { f('time').disabled = f('notime').checked; });
}

export function fillFields(px, v) {
  const f = (id) => $(`${px}-${id}`);
  f('name').value = v.name || '';
  f('date').value = v.date;
  f('time').value = v.time || '';
  f('notime').checked = !v.timeKnown;
  f('time').disabled = !v.timeKnown;
  f('place').value = v.place.name;
  if (!v.custom) {
    state[px] = { typed: v.place.name.trim(), place: v.place };
    showResolved(px, v.place, false);
  }
  if (v.custom) {
    f('custom').open = true;
    f('lat').value = v.place.lat;
    f('lon').value = v.place.lon;
    f('tz').value = v.place.tz;
  }
}

export function readFields(px) {
  const f = (id) => $(`${px}-${id}`);
  const date = f('date').value;
  if (!date) return { error: 'Συμπλήρωσε την ημερομηνία γέννησης.' };
  const y = +date.slice(0, 4);
  if (y < 1800 || y > 2050) return { error: 'Ο υπολογισμός καλύπτει γεννήσεις από το 1800 έως το 2050.' };
  const timeKnown = !f('notime').checked;
  const time = f('time').value;
  if (timeKnown && !/^\d{2}:\d{2}/.test(time)) return { error: 'Συμπλήρωσε την ώρα γέννησης ή τσέκαρε «Δεν ξέρω την ώρα».' };
  let place;
  const custom = f('custom').open;
  if (custom) {
    const lat = parseFloat(f('lat').value.replace(',', '.')), lon = parseFloat(f('lon').value.replace(',', '.'));
    if (!(lat >= -90 && lat <= 90) || !(lon >= -180 && lon <= 180)) return { error: 'Το γεωγραφικό πλάτος πρέπει να είναι από −90 έως 90 και το μήκος από −180 έως 180.' };
    place = { name: f('place').value.trim() || `${lat.toFixed(2)}, ${lon.toFixed(2)}`, lat, lon, tz: f('tz').value };
  } else {
    const typed = f('place').value.trim();
    if (!typed) return { error: 'Γράψε τον τόπο γέννησης.' };
    const c = findLocal(typed);
    const st = state[px];
    if (c) place = localPlace(c);
    else if (st && st.typed === typed && st.place) place = st.place;
    else return { error: `Δεν βρέθηκε ο τόπος «${typed}». Δοκίμασε άλλη γραφή ή άνοιξε «Άλλος τόπος» για να βάλεις συντεταγμένες.` };
  }
  return { value: { name: f('name').value.trim(), date, time: timeKnown ? time.slice(0, 5) : '', timeKnown, place, custom } };
}

export const loadSavedBirth = loadSaved;
export const saveBirth = save;

export function setupBirthForm({ onSubmit, onLoadSaved }) {
  initFields('nc');
  $('nc-form').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    await ensurePlace('nc');
    const r = readFields('nc');
    $('nc-error').textContent = r.error || '';
    $('nc-error').hidden = !r.error;
    if (r.error) return;
    save($('nc-remember').checked ? r.value : null);
    onSubmit(toInput(r.value), r.value);
    $('nc-result').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  });
  const saved = loadSaved();
  if (saved && saved.date && saved.place) {
    fillFields('nc', saved);
    $('nc-remember').checked = true;
    onLoadSaved(toInput(saved), saved);
    return true;
  }
  return false;
}
