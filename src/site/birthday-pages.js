// «Γεννημένοι στις …»: μία σελίδα για κάθε ημέρα του χρόνου (366), με ζώδιο, δεκαήμερο,
// αριθμό γενεθλίων και ταίριασμα. Το ζώδιο υπολογίζεται από τη θέση του Ήλιου για κάθε χρονιά 1950–2030,
// ώστε οι μέρες «στα όρια» να εξηγούνται σωστά.
import * as E from '../ephemeris.js';
import { SIGNS, BODY_NAMES, ELEMENTS, MODALITIES } from '../content/signs.js';
import { DISTANCE } from '../content/compatibility-texts.js';
import { LIFE_PATH } from '../content/numerology-texts.js';
import { athensTime } from '../horoscope.js';
import { page, esc, glyph, adSlot, ogImage, articleLd, breadcrumbLd, crumbs } from './layout.js';

const MONTHS_GEN = ['Ιανουαρίου', 'Φεβρουαρίου', 'Μαρτίου', 'Απριλίου', 'Μαΐου', 'Ιουνίου', 'Ιουλίου', 'Αυγούστου', 'Σεπτεμβρίου', 'Οκτωβρίου', 'Νοεμβρίου', 'Δεκεμβρίου'];
const MONTHS_NOM = ['Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'];
const MONTH_SLUG = ['ianouariou', 'fevrouariou', 'martiou', 'apriliou', 'maiou', 'iouniou', 'iouliou', 'avgoustou', 'septemvriou', 'oktovriou', 'noemvriou', 'dekemvriou'];
const DAYS_IN = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const ORD = ['πρώτο', 'δεύτερο', 'τρίτο'];
export const bdayPath = (m, d) => `genethlia/${d}-${MONTH_SLUG[m]}/index.html`;
// «ο Κριός», «η Παρθένος», «οι Δίδυμοι»
const theName = (s) => `${{ τον: 'ο', την: 'η', τους: 'οι' }[s.acc.split(' ')[0]]} ${s.name}`;
const signOf = (lon) => Math.floor((((lon % 360) + 360) % 360) / 30);

// Το ζώδιο κατά τον πίνακα ημερομηνιών του site (ίδιο με τις σελίδες ζωδίων)
const RANGES = SIGNS.map((z) => z.dates.split(' – ').map((t) => { const [dd, mm] = t.split(' '); return [MONTHS_GEN.indexOf(mm), +dd]; }));
const inRange = (m, d, [[m1, d1], [m2, d2]]) => { const v = m * 100 + d, a = m1 * 100 + d1, b = m2 * 100 + d2; return a <= b ? v >= a && v <= b : v >= a || v <= b; };

// Για μια ημερομηνία: το ζώδιο, αν ο Ήλιος αλλάζει ζώδιο εκείνη τη μέρα σε κάποια χρονιά 1950–2030 (00:00–24:00 ώρα Ελλάδας),
// και η μέση μοίρα του Ήλιου στο μεσημέρι μέσα στο ζώδιο
function sunFor(m, d) {
  const sign = RANGES.findIndex((r) => inRange(m, d, r));
  const seen = new Set();
  let degSum = 0, n = 0;
  for (let y = 1950; y <= 2030; y++) {
    if (m === 1 && d === 29 && !((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0)) continue;
    for (const [h, mi] of [[0, 0], [12, 0], [23, 59]]) {
      const lon = E.longitude('sun', athensTime(y, m + 1, d, h, mi));
      seen.add(signOf(lon));
      if (h === 12) { let rel = ((lon - sign * 30) % 360 + 360) % 360; if (rel > 180) rel = 0; degSum += Math.min(29.9, rel); n++; }
    }
  }
  seen.delete(sign);
  return { sign, cuspWith: [...seen][0] ?? null, deg: degSum / n };
}

const reduce = (n) => { while (n > 9 && n !== 11 && n !== 22) n = String(n).split('').reduce((a, c) => a + +c, 0); return n; };
const dayOfYear = (m, d) => DAYS_IN.slice(0, m).reduce((a, b) => a + b, 0) + d;

function bestMatches(i) {
  return SIGNS.map((_, j) => {
    const k = Math.min(Math.abs(i - j), 12 - Math.abs(i - j));
    return { j, ...DISTANCE[k].scores };
  }).filter((x) => x.j !== i).sort((a, b) => b.love - a.love || b.friendship - a.friendship || a.j - b.j).slice(0, 3);
}

const pairSlug = (i, j) => (i <= j ? `${SIGNS[i].slug}-${SIGNS[j].slug}` : `${SIGNS[j].slug}-${SIGNS[i].slug}`);

export function birthdayPage(m, d) {
  const path = bdayPath(m, d);
  const root = '../../';
  const { sign: i, cuspWith, deg } = sunFor(m, d);
  const s = SIGNS[i];
  const decan = Math.min(2, Math.floor(deg / 10));
  const co = SIGNS[(i + 4 * decan) % 12];
  const num = reduce(d);
  const L = LIFE_PATH[num];
  const label = `${d === 1 ? '1η' : d} ${MONTHS_GEN[m]}`;
  const onDay = `${d === 1 ? 'την' : 'στις'} ${label}`;
  const matches = bestMatches(i);
  const prevM = d > 1 ? m : (m + 11) % 12, prevD = d > 1 ? d - 1 : DAYS_IN[(m + 11) % 12];
  const nextM = d < DAYS_IN[m] ? m : (m + 1) % 12, nextD = d < DAYS_IN[m] ? d + 1 : 1;
  const cusp = cuspWith != null ? SIGNS[cuspWith] : null;
  const decanText = decan === 0
    ? `Στο πρώτο δεκαήμερο το ζώδιο εκφράζεται πιο «καθαρό», με κυβερνήτη ${BODY_NAMES[s.ruler].acc}: ${s.keywords.slice(0, 3).join(', ')} είναι τα πρώτα πράγματα που βλέπουν οι άλλοι σε σένα.`
    : `Κατά την παράδοση των δεκαημέρων, εδώ ${s.inSign} μπαίνει και μια πινελιά ${co.gen}, με συγκυβερνήτη ${BODY_NAMES[co.ruler].acc}. Στα γνωρίσματα ${s.gen} (${s.keywords[0]}, ${s.keywords[1]}) προστίθενται ${co.keywords[0]} και ${co.keywords[1]}.`;
  const trail = [['Ζώδια Σήμερα', 'index.html'], ['Γενέθλια', 'genethlia/index.html'], [`${d} ${MONTHS_GEN[m]}`, path]];
  const content = `
${crumbs(trail, root)}
<section class="hero-sign el-${s.element}">${glyph(s.symbol)}<h1>Γεννημένοι ${label}</h1><p class="muted">Ζώδιο: ${s.name}${cusp ? ` (στα όρια με ${cusp.acc})` : ''} · ${ELEMENTS[s.element].name} · ${MODALITIES[s.modality].name} · Κυβερνήτης: ${BODY_NAMES[s.ruler].short}</p></section>
<section class="stack">
  <p class="lede">Αν γεννήθηκες ${onDay}, το ζώδιό σου είναι ${theName(s).split(' ')[0]} <a href="${root}zodia/${s.slug}/index.html">${s.name}</a> ${glyph(s.symbol)}, ${ELEMENTS[s.element].adj} ζώδιο με κυβερνήτη ${BODY_NAMES[s.ruler].acc}. Τα γενέθλιά σου πέφτουν την ${dayOfYear(m, d)}η ημέρα του χρόνου${m === 1 && d === 29 ? ' και έρχονται μόνο στα δίσεκτα χρόνια' : ''}.</p>
  ${cusp ? `<p class="note">${onDay[0].toUpperCase() + onDay.slice(1)} ο Ήλιος αλλάζει ζώδιο, και η ώρα της αλλαγής διαφέρει από χρονιά σε χρονιά. Συνήθως θεωρείται μέρα ${s.gen}, αλλά ανάλογα με τη χρονιά και την ώρα γέννησης μπορεί να είσαι ${cusp.name}. Βρες το σίγουρα στο <a href="${root}ti-zodio-eimai/index.html">«Τι ζώδιο είμαι;»</a>.</p>` : ''}
</section>
<section class="split">
  <div class="panel stack el-${s.element}">
    <h2>Ο χαρακτήρας σου</h2>
    <p>${esc(s.intro.split('. ').slice(0, 2).join('. '))}.</p>
    <div class="split"><div class="stack"><h3>Δυνατά σημεία</h3><ul class="plain">${s.strengths.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
    <div class="stack"><h3>Προκλήσεις</h3><ul class="plain">${s.challenges.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div></div>
  </div>
  <div class="panel stack">
    <h2>Το ${ORD[decan]} δεκαήμερο ${s.gen}</h2>
    <p>Ο Ήλιος βρίσκεται περίπου στις ${Math.round(deg)} μοίρες ${s.gen}, δηλαδή στο ${ORD[decan]} δεκαήμερο του ζωδίου.</p>
    <p>${esc(decanText)}</p>
  </div>
</section>
${adSlot()}
<section class="split">
  <div class="panel stack">
    <h2>Ο αριθμός των γενεθλίων σου: ${num}</h2>
    <p>Στην αριθμολογία, η ημέρα γέννησης ${d > 9 && num !== d ? `(${String(d).split('').join(' + ')} = ${num})` : ''} δίνει τον «αριθμό γενεθλίων», ένα ταλέντο που φέρνεις μαζί σου. Ο ${num} συνδέεται με: ${L.keywords.join(', ')}.</p>
    <p class="muted">Ο αριθμός ζωής βγαίνει από ολόκληρη την ημερομηνία γέννησης. <a href="${root}arithmologia/index.html">Υπολόγισε τον αριθμό ζωής σου</a>.</p>
  </div>
  <div class="panel stack">
    <h2>Με ποια ζώδια ταιριάζεις</h2>
    <p>Στον έρωτα, ${theName(s)} βρίσκ${s.pluralName ? 'ουν' : 'ει'} συνήθως πιο εύκολα κοινό ρυθμό με:</p>
    <ul class="plain">${matches.map((x) => `<li><a href="${root}symvatotita/${pairSlug(i, x.j)}/index.html">${glyph(SIGNS[x.j].symbol)} ${SIGNS[x.j].name}</a></li>`).join('')}</ul>
    <p><a href="${root}synastria/index.html">Δες τη συναστρία με τον σύντροφό σου</a></p>
  </div>
</section>
<section class="stack">
  <h2>Πέρα από το ζώδιο</h2>
  <p>Το ζώδιο δείχνει πού βρισκόταν ο Ήλιος τη μέρα που γεννήθηκες. Η Σελήνη, ο ωροσκόπος και οι πλανήτες συμπληρώνουν την εικόνα, και εξαρτώνται από τη χρονιά και την ώρα γέννησης.</p>
  <p class="chips"><a class="chip" href="${root}xartis/index.html">Ο γενέθλιος χάρτης μου</a><a class="chip" href="${root}oroskopos/index.html">Ο ωροσκόπος μου</a><a class="chip" href="${root}zodia/${s.slug}/index.html">${s.name} σήμερα</a><a class="chip" href="${root}zodia/${s.slug}/erotas/index.html">${s.name} στον έρωτα</a></p>
</section>
<nav class="month-nav" aria-label="Άλλες ημέρες"><a href="${root}${bdayPath(prevM, prevD)}">← ${prevD} ${MONTHS_GEN[prevM]}</a><a href="${root}genethlia/index.html">Όλες οι ημέρες</a><a href="${root}${bdayPath(nextM, nextD)}">${nextD} ${MONTHS_GEN[nextM]} →</a></nav>`;
  const title = `Γεννημένοι ${label}: ζώδιο, χαρακτήρας και αριθμολογία`;
  const description = `Γεννημένοι ${label}: το ζώδιό σου είναι ${s.name}${cusp ? ` (ή ${cusp.name}, ανάλογα με τη χρονιά)` : ''}, ${ORD[decan]} δεκαήμερο. Χαρακτήρας, αριθμός γενεθλίων ${num} και ταίριασμα.`;
  return { path, lastmod: '2026-11-07', ...page({ path, title, description, content, image: ogImage(s.slug), jsonLd: [articleLd({ path, headline: title, description, published: '2026-11-07', image: ogImage(s.slug) }), breadcrumbLd(trail)] }) };
}

export function birthdayIndexPage() {
  const path = 'genethlia/index.html';
  const root = '../';
  const months = MONTHS_NOM.map((name, m) => `<section class="panel stack"><h2>${name}</h2><div class="cal" style="grid-template-columns:repeat(7,minmax(0,1fr))">${Array.from({ length: DAYS_IN[m] }, (_, k) => `<a href="${root}${bdayPath(m, k + 1)}" aria-label="Γεννημένοι ${k + 1} ${MONTHS_GEN[m]}">${k + 1}</a>`).join('')}</div></section>`).join('');
  const trail = [['Ζώδια Σήμερα', 'index.html'], ['Γενέθλια', path]];
  const content = `
${crumbs(trail, root)}
<section class="stack"><h1>Γεννημένοι μέρα προς μέρα</h1>
<p class="lede">Διάλεξε την ημέρα των γενεθλίων σου: ζώδιο, δεκαήμερο, αριθμός γενεθλίων και με ποια ζώδια ταιριάζεις.</p></section>
<div class="months-grid">${months}</div>`;
  return { path, ...page({ path, title: 'Γεννημένοι μέρα προς μέρα: ζώδιο για κάθε ημερομηνία', description: 'Τι ζώδιο είναι όποιος γεννήθηκε σε κάθε ημερομηνία του χρόνου: χαρακτήρας, δεκαήμερο, αριθμολογία και ταίριασμα, για όλες τις 366 ημέρες.', content, jsonLd: breadcrumbLd(trail) }) };
}

// Οι ημέρες ενός ζωδίου (για εσωτερικά links από τη σελίδα του ζωδίου)
export function signBirthdays(i) {
  const out = [];
  for (let m = 0; m < 12; m++) for (let d = 1; d <= DAYS_IN[m]; d++) {
    // γρήγορος έλεγχος με το μεσημέρι του 2001
    const lon = E.longitude('sun', athensTime(2001, m + 1, d === 29 && m === 1 ? 28 : d, 12, 0));
    if (signOf(lon) === i) out.push([m, d, `${d} ${MONTHS_GEN[m]}`]);
  }
  return out;
}

export const allBirthdays = () => MONTHS_NOM.flatMap((_, m) => Array.from({ length: DAYS_IN[m] }, (_, k) => [m, k + 1]));
