// Σελίδα συναστρίας (στον browser).
import { SIGNS, BODY_NAMES, ASPECT_NAMES } from './content/signs.js';
import * as ST from './content/synastry-texts.js';
import { natalChart } from './natal.js';
import { synastry } from './synastry.js';
import { initFields, fillFields, readFields, loadSavedBirth, toInput } from './birth-form.js';
import { fmtDeg } from './chart-svg.js';

export function startSynastryPage(root) {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const g = (s) => `<span class="g">${s}︎</span>`;
  const pname = (p) => (p === 'asc' ? 'Ωροσκόπος' : p === 'mc' ? 'Μεσουράνημα' : BODY_NAMES[p].short);
  const pglyph = (p) => (BODY_NAMES[p] ? g(BODY_NAMES[p].glyph) + ' ' : '');
  const dots = (n) => `<span class="dots" aria-label="${n} από 5">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`;
  const pairSlug = (i, j) => (i <= j ? `${SIGNS[i].slug}-${SIGNS[j].slug}` : `${SIGNS[j].slug}-${SIGNS[i].slug}`);

  initFields('sa');
  initFields('sb');
  const saved = loadSavedBirth();
  if (saved && saved.date && saved.place) fillFields('sa', { ...saved, name: saved.name || 'Εγώ' });

  function text(asp) {
    const key = [asp.a, asp.b].sort().join('-');
    const kind = asp.hard ? 'hard' : 'good';
    return ST.PAIR_TEXT[key] ? ST.PAIR_TEXT[key][kind] : ST.GENERIC[kind](asp.a, asp.b);
  }
  // σημαντικότητα: πρώτα όψεις προσωπικών πλανητών, μετά οι υπόλοιπες
  const rank = (asp) => {
    const personal = ['sun', 'moon', 'venus', 'mars', 'asc'];
    const n = [asp.a, asp.b].filter((x) => personal.includes(x)).length;
    return n * 10 - asp.orb;
  };

  function render(A, B) {
    const ca = natalChart({ date: A.instant, lat: A.place.lat, lon: A.place.lon, timeKnown: A.timeKnown });
    const cb = natalChart({ date: B.instant, lat: B.place.lat, lon: B.place.lon, timeKnown: B.timeKnown });
    const syn = synastry(ca, cb);
    const nameA = A.name || 'Α', nameB = B.name || 'Β';
    const sa = ca.pos.sun.sign, sb = cb.pos.sun.sign;

    const scoreHtml = Object.entries(syn.scores).map(([k, v]) => `<div class="score-row"><span>${ST.AREA_NAMES[k]}</span>${dots(v)}</div>`).join('');
    // χωρίς επανάληψη του ίδιου κειμένου (π.χ. Αφροδίτη–Άρης και προς τις δύο κατευθύνσεις)
    const used = new Set();
    const top = [...syn.aspects].sort((x, y) => rank(y) - rank(x)).filter((a) => { const t = text(a); if (used.has(t)) return false; used.add(t); return true; }).slice(0, 12);
    const aspHtml = top.map((a) => `<li class="event"><span class="when">${esc(nameA)}: ${pglyph(a.a)}${pname(a.a)}<br>${g(ASPECT_NAMES[a.aspect].glyph)} ${ASPECT_NAMES[a.aspect].name}<br>${esc(nameB)}: ${pglyph(a.b)}${pname(a.b)}</span><div class="stack"><h3>${pname(a.a)} ${g(ASPECT_NAMES[a.aspect].glyph)} ${pname(a.b)} <span class="tone tone-${a.hard ? 'hard' : 'good'}">${a.hard ? 'πρόκληση' : 'αρμονία'}</span></h3><p>${esc(text(a))}</p><p class="muted">Απόκλιση ${fmtDeg(a.orb)}</p></div></li>`).join('');

    const overlay = (list, from, to) => `<div class="stack"><h3>${esc(from)} ${g('→')} ${esc(to)}</h3><p class="muted">Πού πέφτουν οι πλανήτες του πρώτου στους οίκους του δεύτερου.</p>${list
      ? `<ul class="plain">${list.map((o) => `<li>${pglyph(o.body)}<strong>${BODY_NAMES[o.body].short}</strong> ${ST.OVERLAY_AREA[o.house - 1]}.</li>`).join('')}</ul>`
      : `<p>Χρειάζεται η ώρα γέννησης (${esc(to)}) για τους οίκους.</p>`}</div>`;

    const posTable = (ch) => ['sun', 'moon', 'mercury', 'venus', 'mars'].map((b) => `${pglyph(b)}${SIGNS[ch.pos[b].sign].name}`).join(' · ') + (ch.houses ? ` · Ωροσκόπος ${SIGNS[Math.floor(ch.houses.asc / 30)].name}` : ' · χωρίς ώρα γέννησης, η Σελήνη υπολογίζεται για το μεσημέρι');

    $('syn-result').innerHTML = `
<section class="stack">
  <p class="eyebrow">Συναστρία</p>
  <h2>${esc(nameA)} ${g(SIGNS[sa].symbol)} και ${esc(nameB)} ${g(SIGNS[sb].symbol)}</h2>
  <p class="muted">${esc(nameA)}: ${posTable(ca)}</p>
  <p class="muted">${esc(nameB)}: ${posTable(cb)}</p>
</section>
<section class="split">
  <div class="panel stack"><h3>Η σχέση με μια ματιά</h3>${scoreHtml}<p class="muted" style="font-size:.85rem">Οι βαθμολογίες βγαίνουν από τις όψεις των πλανητών που αφορούν κάθε πτυχή της σχέσης.</p></div>
  <div class="stack"><h3>Τα ζώδια του Ήλιου</h3><p>${SIGNS[sa].name} και ${SIGNS[sb].name}. Η συμβατότητα των ζωδίων είναι μόνο η αρχή· οι όψεις των πλανητών λένε πολύ περισσότερα.</p><p><a href="${root}symvatotita/${pairSlug(sa, sb)}/index.html">Συμβατότητα ${SIGNS[sa].name} και ${SIGNS[sb].name}</a></p></div>
</section>
<section class="stack-lg"><h2>Οι σημαντικότερες όψεις</h2>${aspHtml ? `<ul class="events">${aspHtml}</ul>` : '<p class="muted">Δεν βρέθηκαν στενές όψεις ανάμεσα στους χάρτες.</p>'}</section>
<section class="stack-lg"><h2>Ο ένας στον χάρτη του άλλου</h2><div class="split">${overlay(syn.overlaysAinB, nameA, nameB)}${overlay(syn.overlaysBinA, nameB, nameA)}</div></section>`;
  }

  $('syn-form').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const ra = readFields('sa'), rb = readFields('sb');
    const err = ra.error ? `Πρόσωπο Α: ${ra.error}` : rb.error ? `Πρόσωπο Β: ${rb.error}` : '';
    $('syn-error').textContent = err;
    $('syn-error').hidden = !err;
    if (err) return;
    render(toInput(ra.value), toInput(rb.value));
    $('syn-result').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  });
}
