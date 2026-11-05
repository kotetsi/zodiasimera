// Κοινή φόρμα στοιχείων γέννησης (γενέθλιος χάρτης, προσωπικό ωροσκόπιο).
// Τα στοιχεία μένουν μόνο στον browser του επισκέπτη (localStorage), αν το επιλέξει.
import { CITIES } from './content/cities.js';
import { zonedTime } from './natal.js';

const KEY = 'zodiasimera-birth';
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const cityLabel = (c) => `${c.name}, ${c.region}`;

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
    const c = CITIES.find((x) => cityLabel(x) === typed) || CITIES.find((x) => x.name === typed);
    if (!c) return { error: 'Διάλεξε πόλη από τη λίστα ή άνοιξε «Άλλος τόπος» για να βάλεις συντεταγμένες.' };
    place = { name: cityLabel(c), lat: c.lat, lon: c.lon, tz: c.tz };
  }
  return { value: { name: f('name').value.trim(), date, time: timeKnown ? time.slice(0, 5) : '', timeKnown, place, custom } };
}

export const loadSavedBirth = loadSaved;
export const saveBirth = save;

export function setupBirthForm({ onSubmit, onLoadSaved }) {
  initFields('nc');
  $('nc-form').addEventListener('submit', (ev) => {
    ev.preventDefault();
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
