// «Τι ζώδιο είμαι;» — βρίσκει το ζώδιο του Ήλιου από την ημερομηνία (και την ώρα, αν χρειάζεται).
import { SIGNS } from './content/signs.js';
import { longitude, ingresses } from './ephemeris.js';
import { zonedTime } from './natal.js';

export function startSunSignPage(root, year) {
  const $ = (id) => document.getElementById(id);
  const g = (s) => `<span class="g">${s}︎</span>`;
  const hm = (d, tz) => new Intl.DateTimeFormat('el-GR', { timeZone: tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(d);
  const card = (k, extra = '') => {
    const s = SIGNS[k];
    return `<div class="panel stack el-${s.element}"><p class="eyebrow">Το ζώδιό σου</p><h2>${g(s.symbol)} ${s.name}</h2><p class="muted">${s.dates}</p><p>${s.intro.split('. ').slice(0, 2).join('. ')}.</p>${extra}
<div class="chips"><a class="chip" href="${root}zodia/${s.slug}/index.html">${s.name} σήμερα</a><a class="chip" href="${root}zodia/${s.slug}/evdomada/index.html">Η εβδομάδα</a><a class="chip" href="${root}zodia-${year}/${s.slug}/index.html">${s.name} ${year}</a><a class="chip" href="${root}zodia/${s.slug}/erotas/index.html">Στον έρωτα</a></div></div>`;
  };
  $('ss-form').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const date = $('ss-date').value, time = $('ss-time').value, tz = $('ss-tz').value;
    const err = $('ss-error');
    if (!date) { err.textContent = 'Συμπλήρωσε την ημερομηνία γέννησης.'; err.hidden = false; return; }
    const [y, m, d] = date.split('-').map(Number);
    if (y < 1800 || y > 2050) { err.textContent = 'Ο υπολογισμός καλύπτει τα έτη 1800 έως 2050.'; err.hidden = false; return; }
    err.hidden = true;
    const start = zonedTime(y, m, d, 0, 0, tz), end = new Date(start.getTime() + 86400000);
    const ing = ingresses('sun', start, end)[0];
    let html;
    if (ing && !/^\d{2}:\d{2}/.test(time)) {
      html = `<div class="note stack"><p><strong>Γεννήθηκες τη μέρα που ο Ήλιος άλλαξε ζώδιο.</strong> Στις ${hm(ing.date, tz)} (τοπική ώρα) πέρασε από ${SIGNS[ing.from].acc} ${SIGNS[ing.sign].inSign}. Αν γεννήθηκες πριν από αυτή την ώρα είσαι ${SIGNS[ing.from].name}, αλλιώς ${SIGNS[ing.sign].name}. Βάλε την ώρα γέννησης για ακριβή απάντηση.</p></div><div class="split">${card(ing.from)}${card(ing.sign)}</div>`;
    } else {
      const [h, mi] = /^\d{2}:\d{2}/.test(time) ? time.split(':').map(Number) : [12, 0];
      const k = Math.floor(longitude('sun', zonedTime(y, m, d, h, mi, tz)) / 30);
      const cusp = ing ? `<p class="muted">Εκείνη τη μέρα ο Ήλιος άλλαξε ζώδιο στις ${hm(ing.date, tz)}· με την ώρα που έβαλες είσαι ${SIGNS[k].name}.</p>` : '';
      html = card(k, cusp);
    }
    $('ss-result').innerHTML = html;
    $('ss-result').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
  });
}
