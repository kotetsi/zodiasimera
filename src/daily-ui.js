// Προσωπικό ημερήσιο ωροσκόπιο: διελεύσεις της ημέρας πάνω στον γενέθλιο χάρτη (στον browser).
import { SIGNS, BODY_NAMES, ASPECT_NAMES } from './content/signs.js';
import * as TT from './content/transit-texts.js';
import { natalChart, zonedTime } from './natal.js';
import { transitsForDay } from './transits.js';
import { setupBirthForm } from './birth-form.js';

export function startDailyPage(root) {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const g = (s) => `<span class="g">${s}︎</span>`;
  const TZ = 'Europe/Athens';
  const fmt = (d, o) => new Intl.DateTimeFormat('el-GR', { timeZone: TZ, ...o }).format(d);
  const time = (d) => fmt(d, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const dateShort = (d) => fmt(d, { day: 'numeric', month: 'short', year: 'numeric' });
  const todayIso = () => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const shift = (iso, n) => { const [y, m, d] = iso.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10); };

  let input = null;
  let day = todayIso();

  const pointName = (p) => TT.POINT_NAMES[p] || BODY_NAMES[p].short;
  const pointGlyph = (p) => (BODY_NAMES[p] ? g(BODY_NAMES[p].glyph) + ' ' : '');
  const kind = (a) => (a === 'conjunction' ? 'conj' : a === 'trine' || a === 'sextile' ? 'good' : 'hard');
  const advice = (t) => (t.transit === 'moon'
    ? TT.MOON_TARGET_ADVICE[t.natal][kind(t.aspect) === 'hard' ? 'hard' : 'good']
    : TT.ADVICE[t.transit][kind(t.aspect)]);
  const sentence = (t) => `${TT.ACTOR[t.transit]} ${TT.VERB[t.aspect]} ${TT.TARGET[t.natal]}. ${advice(t)}`;
  const heading = (t) => `${g(BODY_NAMES[t.transit].glyph)} ${BODY_NAMES[t.transit].short} ${g(ASPECT_NAMES[t.aspect].glyph)} ${pointGlyph(t.natal)}${pointName(t.natal)} σου`;
  const tone = (t) => `<span class="tone tone-${kind(t.aspect)}">${ASPECT_NAMES[t.aspect].name}</span>`;

  function render() {
    if (!input) return;
    const chart = natalChart({ date: input.instant, lat: input.place.lat, lon: input.place.lon, timeKnown: input.timeKnown });
    const [y, m, d] = day.split('-').map(Number);
    const start = zonedTime(y, m, d, 0, 0, TZ), end = zonedTime(y, m, d + 1, 0, 0, TZ);
    const tr = transitsForDay(chart, start, end);
    const moonSign = Math.floor(tr.moonLon / 30);
    const isToday = day === todayIso();
    const label = isToday ? 'Σήμερα' : day === shift(todayIso(), 1) ? 'Αύριο' : day === shift(todayIso(), -1) ? 'Χθες' : '';

    let moonHouse, moonNote = '';
    if (tr.houses.moon) moonHouse = tr.houses.moon;
    else {
      moonHouse = ((moonSign - chart.pos.sun.sign + 12) % 12) + 1;
      moonNote = '<p class="muted">Χωρίς ώρα γέννησης, οι οίκοι μετριούνται από το ζώδιο του Ήλιου σου.</p>';
    }

    const moments = tr.moon.map((t) => `<li class="event"><span class="when num">${time(t.exact)}</span><div class="stack"><h3>${heading(t)} ${tone(t)}</h3><p>${esc(sentence(t))}</p></div></li>`).join('');
    const fast = tr.fast.map((t) => `<li class="event"><span class="when num">${t.orb < 0.5 ? 'Κορύφωση' : 'Ενεργή'}</span><div class="stack"><h3>${heading(t)} ${tone(t)}</h3><p>${esc(sentence(t))}</p></div></li>`).join('');
    const slow = tr.slow.map((t) => `<li class="event"><span class="when num">${dateShort(t.start)} – ${dateShort(t.end)}</span><div class="stack"><h3>${heading(t)} ${tone(t)}</h3><p>${esc(sentence(t))}</p><p class="muted">Πιο έντονη γύρω στις ${dateShort(t.exact)}.</p></div></li>`).join('');

    $('nc-result').innerHTML = `
<section class="stack">
  <p class="eyebrow">Προσωπικό ωροσκόπιο${input.name ? ` · ${esc(input.name)}` : ''}</p>
  <div class="day-head"><h2>${label ? `${label}, ` : ''}${fmt(start, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h2>
  <div class="day-nav" role="group" aria-label="Αλλαγή ημέρας"><button type="button" class="btn-ghost" id="pd-prev">‹ Προηγούμενη</button><button type="button" class="btn-ghost" id="pd-today"${isToday ? ' disabled' : ''}>Σήμερα</button><button type="button" class="btn-ghost" id="pd-next">Επόμενη ›</button></div></div>
  <p class="muted">Για ${esc(input.place.name)}, γέννηση ${String(input.d).padStart(2, '0')}/${String(input.m).padStart(2, '0')}/${input.y}${input.timeKnown ? ` ${String(input.h).padStart(2, '0')}:${String(input.min).padStart(2, '0')}` : ''} · <a href="${root}xartis/index.html">Ο γενέθλιος χάρτης σου</a></p>
</section>
<section class="panel stack">
  <h3>${g('☽')} Η Σελήνη ${SIGNS[moonSign].inSign}</h3>
  <p>${esc(TT.MOON_IN_NATAL_HOUSE[moonHouse - 1])}</p>${moonNote}
</section>
<section class="stack-lg"><h2>Οι στιγμές της ημέρας</h2>
  ${moments ? `<ul class="events">${moments}</ul>` : '<p class="muted">Η Σελήνη δεν σχηματίζει ακριβή όψη με τον χάρτη σου αυτή την ημέρα: μια πιο ήρεμη μέρα.</p>'}
  <p class="muted" style="font-size:.85rem">Ώρες Ελλάδας. Οι όψεις της Σελήνης κρατούν λίγες ώρες γύρω από την ώρα που αναφέρεται.</p>
</section>
<section class="stack-lg"><h2>Επιρροές αυτών των ημερών</h2>
  ${fast ? `<ul class="events">${fast}</ul>` : '<p class="muted">Ο Ήλιος, ο Ερμής, η Αφροδίτη και ο Άρης δεν σχηματίζουν στενές όψεις με τον χάρτη σου αυτές τις μέρες.</p>'}
</section>
<section class="stack-lg"><h2>Μεγάλες περίοδοι</h2>
  ${slow ? `<ul class="events">${slow}</ul>` : '<p class="muted">Αυτή την περίοδο οι αργοί πλανήτες δεν σχηματίζουν στενές όψεις με τον χάρτη σου.</p>'}
  <p class="muted" style="font-size:.85rem">Οι διελεύσεις του Δία, του Κρόνου, του Ουρανού, του Ποσειδώνα και του Πλούτωνα διαρκούν εβδομάδες ή μήνες και χρωματίζουν όλη την περίοδο.</p>
</section>`;
    $('pd-prev').addEventListener('click', () => { day = shift(day, -1); render(); });
    $('pd-next').addEventListener('click', () => { day = shift(day, 1); render(); });
    $('pd-today').addEventListener('click', () => { day = todayIso(); render(); });
  }

  const shown = setupBirthForm({
    onSubmit: (i) => { input = i; day = todayIso(); render(); },
    onLoadSaved: (i) => { input = i; render(); $('nc-details').open = false; },
  });
  if (!shown) $('nc-details').open = true;
}
