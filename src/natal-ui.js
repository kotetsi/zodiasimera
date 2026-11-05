// Σελίδα γενέθλιου χάρτη: τρέχει μέσα στον browser του επισκέπτη (ο υπολογισμός δεν φεύγει από τη συσκευή του).
import { SIGNS, BODY_NAMES, ASPECT_NAMES } from './content/signs.js';
import { HOUSE_AREA } from './content/daily-texts.js';
import { setupBirthForm } from './birth-form.js';
import * as NT from './content/natal-texts.js';
import { natalChart, utcOffsetLabel } from './natal.js';
import { wheelSvg, fmtDeg } from './chart-svg.js';
import { whatIs } from './content/glossary.js';

export function startNatalPage(root) {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const g = (s) => `<span class="g">${s}︎</span>`;
  const fem = (b) => b === 'venus' || b === 'moon';
  const cap = (s) => s[0].toUpperCase() + s.slice(1);

  function render(input, isExample) {
    const ch = natalChart({ date: input.instant, lat: input.place.lat, lon: input.place.lon, timeKnown: input.timeKnown });
    const by = Object.fromEntries(ch.bodies.map((b) => [b.body, b]));
    const pos = Object.fromEntries(ch.bodies.map((b) => [b.body, b]));
    const sun = by.sun, moon = by.moon;
    const ascSign = ch.houses ? Math.floor(ch.houses.asc / 30) : null;
    const when = `${String(input.d).padStart(2, '0')}/${String(input.m).padStart(2, '0')}/${input.y}${input.timeKnown ? `, ${String(input.h).padStart(2, '0')}:${String(input.min).padStart(2, '0')}` : ''}`;
    const offset = utcOffsetLabel(input.instant, input.place.tz);

    const big = [
      `<div class="panel stack"><p class="eyebrow">Ήλιος</p><h3>${g(SIGNS[sun.sign].symbol)} ${SIGNS[sun.sign].name}</h3><p>${esc(NT.PLANET_IN_SIGN.sun)} ${esc(NT.SIGN_STYLE[sun.sign])}.</p><p><a href="${root}zodia/${SIGNS[sun.sign].slug}/index.html">Η σημερινή πρόβλεψη για ${SIGNS[sun.sign].acc}</a></p></div>`,
      `<div class="panel stack"><p class="eyebrow">Σελήνη</p><h3>${g(SIGNS[moon.sign].symbol)} ${SIGNS[moon.sign].name}</h3><p>${esc(NT.MOON_SIGN[moon.sign])}</p>${!input.timeKnown && moon.deg < 7 || !input.timeKnown && moon.deg > 23 ? '<p class="muted">Χωρίς ώρα γέννησης, η Σελήνη μπορεί να βρισκόταν στο διπλανό ζώδιο.</p>' : ''}</div>`,
      ch.houses
        ? `<div class="panel stack"><div class="eyebrow">Ωροσκόπος ${whatIs('asc')}</div><h3>${g(SIGNS[ascSign].symbol)} ${SIGNS[ascSign].name}</h3><p>${esc(NT.ASC_SIGN[ascSign])}</p></div>`
        : '<div class="panel stack"><div class="eyebrow">Ωροσκόπος ' + whatIs('asc') + '</div><h3>Χρειάζεται ώρα</h3><p>Ο ωροσκόπος και οι οίκοι αλλάζουν κάθε λίγα λεπτά, οπότε υπολογίζονται μόνο με την ώρα γέννησης. Θα τη βρεις στη ληξιαρχική πράξη γέννησης.</p></div>',
    ].join('');

    const rows = ch.bodies.map((b) => `<tr><td>${g(BODY_NAMES[b.body].glyph)} ${BODY_NAMES[b.body].short}${b.body === 'node' ? ' ' + whatIs('node') : ''}</td><td>${g(SIGNS[b.sign].symbol)} ${SIGNS[b.sign].name}</td><td class="num">${fmtDeg(b.deg)}</td><td class="num">${b.house ?? '—'}</td><td>${b.retro ? '<span class="pill">R</span>' : ''}</td></tr>`).join('')
      + (ch.houses ? `<tr><td>Ωροσκόπος ${whatIs('asc')}</td><td>${g(SIGNS[ascSign].symbol)} ${SIGNS[ascSign].name}</td><td class="num">${fmtDeg(ch.houses.asc % 30)}</td><td></td><td></td></tr><tr><td>Μεσουράνημα</td><td>${g(SIGNS[Math.floor(ch.houses.mc / 30)].symbol)} ${SIGNS[Math.floor(ch.houses.mc / 30)].name}</td><td class="num">${fmtDeg(ch.houses.mc % 30)}</td><td></td><td></td></tr>` : '');

    const cusps = ch.houses ? ch.houses.cusps.map((c, i) => `<tr><td class="num">${i + 1}</td><td>${g(SIGNS[Math.floor(c / 30)].symbol)} ${SIGNS[Math.floor(c / 30)].name}</td><td class="num">${fmtDeg(c % 30)}</td></tr>`).join('') : '';

    const readings = ch.bodies.filter((b) => b.body !== 'sun' && b.body !== 'moon').map((b) => {
      const signIn = SIGNS[b.sign].inSign;
      const signLine = NT.PLANET_IN_SIGN[b.body] ? `${NT.PLANET_IN_SIGN[b.body]} ${NT.SIGN_STYLE[b.sign]}.` : NT.GENERATIONAL[b.body](signIn);
      const houseLine = b.house ? ` ${NT.PLANET_IN_HOUSE[b.body]} ${HOUSE_AREA[b.house - 1]}.` : '';
      const retro = b.retro ? ` ${cap(BODY_NAMES[b.body].nom)} ήταν ${fem(b.body) ? 'ανάδρομη' : 'ανάδρομος'} όταν γεννήθηκες, κάτι που στρέφει αυτή την ενέργεια περισσότερο προς τα μέσα.` : '';
      return `<div class="stack"><h3>${g(BODY_NAMES[b.body].glyph)} ${cap(BODY_NAMES[b.body].nom)} ${signIn}${b.house ? `, ${b.house}ος οίκος` : ''}</h3><p>${esc(signLine + houseLine + retro)}</p></div>`;
    }).join('');
    const sunHouse = sun.house ? `<div class="stack"><h3>${g('☉')} Ο Ήλιος στον ${sun.house}ο οίκο</h3><p>${esc(`${NT.PLANET_IN_HOUSE.sun} ${HOUSE_AREA[sun.house - 1]}.`)}</p></div>` : '';
    const moonHouse = moon.house ? `<div class="stack"><h3>${g('☽')} Η Σελήνη στον ${moon.house}ο οίκο</h3><p>${esc(`${NT.PLANET_IN_HOUSE.moon} ${HOUSE_AREA[moon.house - 1]}.`)}</p></div>` : '';

    const nameOf = (k) => (k === 'asc' ? 'Ωροσκόπος' : k === 'mc' ? 'Μεσουράνημα' : BODY_NAMES[k].short);
    const glyphOf = (k) => (k === 'asc' || k === 'mc' ? '' : g(BODY_NAMES[k].glyph) + ' ');
    const asps = ch.aspects.map((a) => `<tr><td>${glyphOf(a.a)}${nameOf(a.a)}</td><td>${g(ASPECT_NAMES[a.aspect].glyph)} ${ASPECT_NAMES[a.aspect].name}</td><td>${glyphOf(a.b)}${nameOf(a.b)}</td><td class="num">${fmtDeg(a.orb)}</td><td class="muted">${NT.ASPECT_MEANING[a.aspect]}</td></tr>`).join('');

    $('nc-result').innerHTML = `
<section class="stack">
  <p class="eyebrow">${isExample ? 'Παράδειγμα: ο ουρανός τη στιγμή που άνοιξες τη σελίδα' : 'Γενέθλιος χάρτης'}</p>
  <h2>${esc(input.name || (isExample ? 'Αυτή τη στιγμή' : 'Ο χάρτης σου'))}</h2>
  <p class="muted">${esc(when)} · ${esc(input.place.name)} · ${esc(offset)} · ${fmtDeg(Math.abs(input.place.lat))} ${input.place.lat >= 0 ? 'Β' : 'Ν'}, ${fmtDeg(Math.abs(input.place.lon))} ${input.place.lon >= 0 ? 'Α' : 'Δ'}${ch.houses ? ` · Οίκοι ${ch.houses.system === 'placidus' ? 'Placidus' : 'ίσοι'}` : ''}</p>
  <p><a href="${root}odigos/pos-diavazo-genethlio-xarti/index.html">Πώς διαβάζω τον χάρτη μου; Οδηγός βήμα βήμα</a></p>
</section>
<section class="split">
  ${wheelSvg(pos, { houses: ch.houses, aspects: ch.aspects, label: 'Γενέθλιος χάρτης' })}
  <div class="stack-lg">
    <div class="table-wrap"><table><thead><tr><th>Σώμα</th><th>Ζώδιο</th><th>Μοίρες</th><th>Οίκος ${whatIs('house')}</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
    ${ch.bodies.some((b) => b.retro) ? `<div class="muted legend"><span class="pill">R</span> = ανάδρομος ${whatIs('retro')}</div>` : ''}
    ${cusps ? `<details><summary>Ακμές οίκων</summary><div class="table-wrap"><table><thead><tr><th>Οίκος</th><th>Ζώδιο</th><th>Μοίρες</th></tr></thead><tbody>${cusps}</tbody></table></div></details>` : ''}
  </div>
</section>
<section class="stack-lg"><h2>Τα τρία βασικά</h2><div class="trio">${big}</div></section>
<section class="stack-lg"><h2>Οι πλανήτες σου</h2><div class="readings">${sunHouse}${moonHouse}${readings}</div></section>
<section class="stack-lg"><h2>Όψεις ${whatIs('aspect')}</h2>
  ${asps ? `<div class="table-wrap"><table><thead><tr><th>Από</th><th>Όψη</th><th>Προς</th><th>Απόκλιση ${whatIs('orb')}</th><th>Σημασία</th></tr></thead><tbody>${asps}</tbody></table></div>` : '<p class="muted">Δεν βρέθηκαν κύριες όψεις.</p>'}
</section>`;
  }

  const shown = setupBirthForm({ onSubmit: (input) => render(input, false), onLoadSaved: (input) => render(input, false) });
  if (shown) return;

  // Αρχική εικόνα: ο χάρτης αυτής της στιγμής για την Αθήνα
  const now = new Date();
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Athens', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(now).map((x) => [x.type, x.value]));
  render({ name: '', y: +p.year, m: +p.month, d: +p.day, h: +p.hour, min: +p.minute, timeKnown: true, place: { name: 'Αθήνα, Αττική', lat: 37.98, lon: 23.73, tz: 'Europe/Athens' }, instant: now }, true);
}
