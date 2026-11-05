// Κινέζικο ημερολόγιο: ημερομηνία Κινέζικης Πρωτοχρονιάς και ζώο/στοιχείο έτους.
// Κανόνας: η Νέα Σελήνη (ώρα Πεκίνου) που αρχίζει τον 11ο μήνα περιέχει ή προηγείται του χειμερινού ηλιοστασίου·
// η Πρωτοχρονιά είναι δύο Νέες Σελήνες αργότερα. Εξαιρέσεις λόγω εμβόλιμου μήνα: 2033 και 2034.
import * as E from './ephemeris.js';

const cnDate = (d) => new Date(d.getTime() + 8 * 3600000).toISOString().slice(0, 10); // ημερομηνία στο Πεκίνο
const OVERRIDE = { 2033: '2033-01-31', 2034: '2034-02-19' };

export function chineseNewYear(y) {
  if (OVERRIDE[y]) return OVERRIDE[y];
  // χειμερινό ηλιοστάσιο του y-1
  const sol = E.ingresses('sun', new Date(Date.UTC(y - 1, 11, 15)), new Date(Date.UTC(y - 1, 11, 28))).find((i) => i.sign === 9).date;
  const solDay = cnDate(sol);
  const news = E.lunarPhases(new Date(Date.UTC(y - 1, 10, 15)), new Date(Date.UTC(y, 2, 1))).filter((p) => p.kind === 'new');
  const k11 = news.filter((n) => cnDate(n.date) <= solDay).pop();
  const idx = news.indexOf(k11);
  return cnDate(news[idx + 2].date);
}

export const STEMS = ['wood', 'wood', 'fire', 'fire', 'earth', 'earth', 'metal', 'metal', 'water', 'water'];
// έτος (κινέζικο) → { animal: 0..11 (0 = Ποντίκι), element, yin }
export function yearInfo(cy) {
  return { animal: ((cy - 4) % 12 + 12) % 12, element: STEMS[((cy - 4) % 10 + 10) % 10], yin: ((cy - 4) % 2 + 2) % 2 === 1 };
}
