import { SIGNS } from '../content/signs.js';
import { todayInAthens } from '../horoscope.js';

// One clock for all build output, including historical and year-boundary builds.
export let buildDate = todayInAthens();
export let featuredYear;
export function setBuildDate(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso) || new Date(`${iso}T12:00:00Z`).toISOString().slice(0, 10) !== iso) throw new Error('Invalid build date');
  buildDate = iso;
  const [y, m] = iso.split('-').map(Number);
  featuredYear = m >= 10 ? y + 1 : y;
}
setBuildDate(buildDate);

const fit = (value, max) => {
  const s = String(value || '').replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  const part = s.slice(0, max - 1);
  return `${part.slice(0, part.lastIndexOf(' ')).replace(/[,:;·–-]+$/, '').trim()}…`;
};
const shortDate = iso => iso.split('-').reverse().map(Number).join('/');
function weekLabel() {
  const start = new Date(`${buildDate}T12:00:00Z`);
  const wd = start.getUTCDay();
  start.setUTCDate(start.getUTCDate() + (wd === 0 ? 1 : 1 - wd));
  const end = new Date(start); end.setUTCDate(end.getUTCDate() + 6);
  return `${start.getUTCDate()}/${start.getUTCMonth() + 1}–${end.getUTCDate()}/${end.getUTCMonth() + 1}/${end.getUTCFullYear()}`;
}

// Explicit templates for search landing pages. The final guard handles unusually long source text.
export function metadata(path, title, description) {
  const parts = path.split('/');
  const sign = SIGNS.find(s => s.slug === parts[1]);
  const year = buildDate.slice(0, 4);
  const month = new Intl.DateTimeFormat('el-GR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${buildDate}T12:00:00Z`));
  let match;
  if (path === 'index.html') {
    title = `Ζώδια σήμερα ${shortDate(buildDate)}: Ημερήσιες προβλέψεις`;
    description = 'Διάβασε τις προβλέψεις για τα 12 ζώδια σήμερα και αύριο. Βρες εβδομαδιαίο και μηνιαίο ωροσκόπιο, ωροσκόπο και γενέθλιο χάρτη.';
  } else if (parts[0] === 'zodia' && sign) {
    if (parts.length === 3) {
      title = `${sign.name} σήμερα ${shortDate(buildDate)}: Πρόβλεψη`;
      description = `${sign.name} σήμερα και αύριο: αστρολογική πρόβλεψη για έρωτα, δουλειά και διάθεση. Δες επίσης εβδομαδιαίες και μηνιαίες προβλέψεις.`;
    } else if (parts[2] === 'evdomada' || parts[2] === 'minas') {
      const weekly = parts[2] === 'evdomada';
      title = weekly ? `${sign.name}: Εβδομαδιαίες προβλέψεις ${weekLabel()}` : `${sign.name}: Μηνιαίες προβλέψεις ${month}`;
      description = `${sign.name}: ${weekly ? `εβδομαδιαίες προβλέψεις ${weekLabel()}` : `μηνιαίες προβλέψεις ${month}`}. Έρωτας, δουλειά και σημαντικά αστρολογικά γεγονότα.`;
    } else {
      title = title.split(':')[0] + ': Χαρακτήρας και σχέσεις';
      description = `${title}. Διάβασε για την αστρολογική προσέγγιση στον έρωτα, τις ανάγκες στη σχέση και τη συμβατότητα.`;
    }
  } else if ((match = /^zodia-(\d{4})\//.exec(path))) {
    title = sign ? `${sign.name} ${match[1]}: Ετήσιες προβλέψεις` : `Ζώδια ${match[1]}: Ετήσιες προβλέψεις για τα 12 ζώδια`;
    description = `${sign ? sign.name : 'Ζώδια'} ${match[1]}: αστρολογικές προβλέψεις για έρωτα και δουλειά. Δες τους μήνες της χρονιάς, τις εκλείψεις και τους ανάδρομους.`;
  } else if ((match = /^anadromos-ermis-(\d{4})\//.exec(path))) {
    title = `Ανάδρομος Ερμής ${match[1]}: Ημερομηνίες και ζώδια`;
    description = `Πότε είναι ανάδρομος ο Ερμής το ${match[1]}; Δες τις περιόδους, τις ώρες Ελλάδας και τις αστρολογικές ερμηνείες για κάθε ζώδιο.`;
  } else if (/^genethlia\/[^/]+\//.test(path)) {
    title = title.split(':')[0] + ': Ζώδιο και χαρακτηριστικά';
    description = description.split('. Χαρακτήρας')[0] + '. Δες χαρακτηριστικά, αριθμό γενεθλίων και συμβατότητα.';
  } else if ((match = /^zodia-simera\/(\d{4}-\d{2}-\d{2})\//.exec(path))) {
    title = `Ζώδια ${shortDate(match[1])}: Ημερήσιες προβλέψεις`;
    description = `Οι ημερήσιες προβλέψεις της ${shortDate(match[1])} για τα 12 ζώδια σε έρωτα, δουλειά και διάθεση. Σελίδα από το αρχείο προβλέψεων.`;
  } else if (path === 'zodia-avrio/index.html') {
    const d = new Date(`${buildDate}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + 1);
    title = `Ζώδια αύριο ${shortDate(d.toISOString().slice(0, 10))}: Προβλέψεις`;
    description = 'Δες τις αυριανές αστρολογικές προβλέψεις για τα 12 ζώδια σε έρωτα, δουλειά και διάθεση, με συνδέσμους στην αναλυτική πρόβλεψη.';
  } else if (path === 'panselinoi/index.html') {
    title = 'Πανσέληνοι: Ημερολόγιο, ημερομηνίες και ώρες';
    description = 'Πανσέληνοι και Νέες Σελήνες με ημερομηνίες, ώρες Ελλάδας και ζώδιο. Δες τα επόμενα γεγονότα και το αρχείο προηγούμενων ετών.';
  } else if (path.startsWith('panselinos/')) {
    title = title.split(':')[0].replace(' (Μπλε Φεγγάρι)', ': Μπλε Φεγγάρι');
    if (!title.includes('Μπλε Φεγγάρι')) title += ': Ημερομηνία και ώρα';
    description = description.split(' Τι σημαίνει')[0] + ' Αστρολογικές ερμηνείες για τα 12 ζώδια.';
  } else if (path === 'evdomadiaia/index.html') {
    title = `Εβδομαδιαίες προβλέψεις ζωδίων ${weekLabel()}`;
    description = `Εβδομαδιαίες προβλέψεις ${weekLabel()} για τα 12 ζώδια. Έρωτας, δουλειά και τα σημαντικά αστρολογικά γεγονότα της εβδομάδας.`;
  } else if (path === 'miniaia/index.html') {
    title = `Μηνιαίες προβλέψεις ζωδίων: ${month}`;
    description = `Μηνιαίες προβλέψεις για τα 12 ζώδια, ${month}. Δες έρωτα, δουλειά και το ημερολόγιο σημαντικών αστρολογικών γεγονότων.`;
  } else if (path === 'taro/index.html') {
    title = `Ταρώ ημέρας ${shortDate(buildDate)}: ${title.split(': ')[1].split(',')[0]}`;
    description = 'Δες την κάρτα ταρώ της ημέρας και την κάρτα για κάθε ζώδιο. Συμβολικές ερμηνείες για έρωτα και δουλειά, με ψυχαγωγικό χαρακτήρα.';
  } else if (path.startsWith('taro/')) {
    title = title.split(':')[0] + ': Ερμηνεία και συμβολισμός';
  } else if (path === 'ti-zodio-eimai/index.html') {
    title = 'Τι ζώδιο είμαι; Υπολογισμός από ημερομηνία γέννησης';
    description = 'Βρες το ζώδιό σου από την ημερομηνία γέννησης. Δες τον πίνακα ημερομηνιών και τον υπολογισμό για όσους γεννήθηκαν στην αλλαγή ζωδίου.';
  } else if (path === 'synastria/index.html') {
    title = 'Συναστρία δωρεάν και σύνθετος Χάρτης Σχέσης';
    description = 'Σύγκρινε δύο γενέθλιους χάρτες με τη δωρεάν συναστρία. Δες όψεις, αστρολογικές ερμηνείες και σύνθετο Χάρτη Σχέσης στα ελληνικά.';
  } else if (path === 'oroskopos/index.html') {
    title = 'Υπολογισμός ωροσκόπου δωρεάν: Βρες τον ωροσκόπο σου';
    description = 'Υπολόγισε τον ωροσκόπο σου από ημερομηνία, ώρα και τόπο γέννησης. Διάβασε ερμηνείες και απαντήσεις για την ώρα και τον τόπο γέννησης.';
  } else if (path.startsWith('efimerida/')) {
    description = `Εφημερίδα πλανητών${parts[1] === 'index.html' ? '' : ` ${parts[1]}`}: ημερήσιες θέσεις, φάσεις Σελήνης και ανάδρομοι. Πίνακες στις 00:00 UTC και γεγονότα σε ώρα Ελλάδας.`;
  } else if (path.startsWith('kinezika-zodia/') && parts.length > 2) {
    title = title.split(':')[0] + ': Κινέζικο ζώδιο και χαρακτήρας';
  } else if (path === 'anadromoi/index.html') {
    title = `Ανάδρομοι πλανήτες ${year}: Ημερομηνίες και περίοδοι`;
  }
  return { title: fit(title, 60), description: fit(description, 155) };
}
