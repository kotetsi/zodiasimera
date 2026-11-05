// Σελίδα συναστρίας και Χάρτη Σχέσης (στον browser).
import { SIGNS, BODY_NAMES, ASPECT_NAMES } from './content/signs.js';
import * as ST from './content/synastry-texts.js';
import * as CT from './content/composite-texts.js';
import { natalChart } from './natal.js';
import { synastry } from './synastry.js';
import { compositeChart, COMPOSITE_BODIES } from './composite.js';
import { glance } from './composite-glance.js';
import { initFields, fillFields, readFields, loadSavedBirth, toInput } from './birth-form.js';
import { fmtDeg, wheelSvg } from './chart-svg.js';
import { exportButtons, downloadChart } from './chart-export.js';
import config from './config.js';

export function startSynastryPage(root) {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const g = (s) => `<span class="g">${s}︎</span>`;
  const cap = (s) => s[0].toUpperCase() + s.slice(1);
  const pname = (p) => (p === 'asc' ? 'Ωροσκόπος' : p === 'mc' ? 'Μεσουράνημα' : BODY_NAMES[p].short);
  const pglyph = (p) => (BODY_NAMES[p] ? g(BODY_NAMES[p].glyph) + ' ' : '');
  const dots = (n) => `<span class="dots" aria-label="${n} από 5">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`;
  const pairSlug = (i, j) => (i <= j ? `${SIGNS[i].slug}-${SIGNS[j].slug}` : `${SIGNS[j].slug}-${SIGNS[i].slug}`);
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  // ── Συναστρία (όπως πριν) ─────────────────────────────────────────────
  function synastryHtml(ca, cb, nameA, nameB) {
    const syn = synastry(ca, cb);
    const sa = ca.pos.sun.sign, sb = cb.pos.sun.sign;
    const scoreHtml = Object.entries(syn.scores).map(([k, v]) => `<div class="score-row"><span>${ST.AREA_NAMES[k]}</span>${dots(v)}</div>`).join('');
    // χωρίς επανάληψη του ίδιου κειμένου (π.χ. Αφροδίτη–Άρης και προς τις δύο κατευθύνσεις)
    const used = new Set();
    const top = [...syn.aspects].sort((x, y) => rank(y) - rank(x)).filter((a) => { const t = text(a); if (used.has(t)) return false; used.add(t); return true; }).slice(0, 12);
    const aspHtml = top.map((a) => `<li class="event"><span class="when">${esc(nameA)}: ${pglyph(a.a)}${pname(a.a)}<br>${g(ASPECT_NAMES[a.aspect].glyph)} ${ASPECT_NAMES[a.aspect].name}<br>${esc(nameB)}: ${pglyph(a.b)}${pname(a.b)}</span><div class="stack"><h3>${pname(a.a)} ${g(ASPECT_NAMES[a.aspect].glyph)} ${pname(a.b)} <span class="tone tone-${a.hard ? 'hard' : 'good'}">${a.hard ? 'πρόκληση' : 'αρμονία'}</span></h3><p>${esc(text(a))}</p><p class="muted">Απόκλιση ${fmtDeg(a.orb)}</p></div></li>`).join('');
    const overlay = (list, from, to) => `<div class="stack"><h3>${esc(from)} ${g('→')} ${esc(to)}</h3><p class="muted">Πού πέφτουν οι πλανήτες του πρώτου στους οίκους του δεύτερου.</p>${list
      ? `<ul class="plain">${list.map((o) => `<li>${pglyph(o.body)}<strong>${BODY_NAMES[o.body].short}</strong> ${ST.OVERLAY_AREA[o.house - 1]}.</li>`).join('')}</ul>`
      : `<p>Χρειάζεται η ώρα γέννησης (${esc(to)}) για τους οίκους.</p>`}</div>`;
    return `
<section class="split">
  <div class="panel stack"><h3>Η σχέση με μια ματιά</h3>${scoreHtml}<p class="muted" style="font-size:.85rem">Οι βαθμολογίες βγαίνουν από τις όψεις των πλανητών που αφορούν κάθε πτυχή της σχέσης.</p></div>
  <div class="stack"><h3>Τα ζώδια του Ήλιου</h3><p>${SIGNS[sa].name} και ${SIGNS[sb].name}. Η συμβατότητα των ζωδίων είναι μόνο η αρχή· οι όψεις των πλανητών λένε πολύ περισσότερα.</p><p><a href="${root}symvatotita/${pairSlug(sa, sb)}/index.html">Συμβατότητα ${SIGNS[sa].name} και ${SIGNS[sb].name}</a></p></div>
</section>
<section class="stack-lg"><h2>Οι σημαντικότερες όψεις</h2>${aspHtml ? `<ul class="events">${aspHtml}</ul>` : '<p class="muted">Δεν βρέθηκαν στενές όψεις ανάμεσα στους χάρτες.</p>'}</section>
<section class="stack-lg"><h2>Ο ένας στον χάρτη του άλλου</h2><div class="split">${overlay(syn.overlaysAinB, nameA, nameB)}${overlay(syn.overlaysBinA, nameB, nameA)}</div></section>`;
  }

  // ── Χάρτης Σχέσης (σύνθετος χάρτης) ──────────────────────────────────
  let comp = null, compNames = null;
  const lonOf = (k) => (k === 'asc' ? comp.houses.asc : k === 'mc' ? comp.houses.mc : comp.pos[k].lon);
  const signOf = (k) => Math.floor(lonOf(k) / 30);
  const where = (k) => `${g(SIGNS[signOf(k)].symbol)} ${fmtDeg(lonOf(k) % 30)} ${SIGNS[signOf(k)].name}`;
  const aspId = (a) => `${a.a}|${a.aspect}|${a.b}`;
  const aspTitle = (a) => `${pname(a.a)} ${CT.ASPECT_PHRASE[a.aspect]} ${BODY_NAMES[a.b].acc.replace(/^(τον|την|τη|το) /, '')}`;
  const aspTone = (a) => (a.aspect === 'conjunction' ? 'σύντηξη' : ASPECT_NAMES[a.aspect].harmony > 0 ? 'αρμονία' : 'πρόκληση');
  const aspToneCls = (a) => (a.aspect === 'conjunction' ? 'tone-mid' : ASPECT_NAMES[a.aspect].harmony > 0 ? 'tone-good' : 'tone-hard');

  function aspText(a) {
    const key = [a.a, a.b].sort().join('-');
    const kind = a.aspect === 'conjunction' ? 'conj' : ASPECT_NAMES[a.aspect].harmony > 0 ? 'good' : 'hard';
    return CT.PAIR[key] ? CT.PAIR[key][kind] : CT.GENERIC[a.aspect](CT.ROLE[a.a], CT.ROLE[a.b]);
  }

  function overviewHtml() {
    const s = (k) => SIGNS[signOf(k)];
    const line = (k) => `<p>${pglyph(k)}<strong>${pname(k)} ${s(k).inSign}:</strong> ${esc(CT.ROLE[k])}, ${esc(CT.SIGN_TONE[signOf(k)])}.</p>`;
    return `<p class="eyebrow">Η ταυτότητα της σχέσης</p>
<h3>${esc(compNames[0])} &amp; ${esc(compNames[1])}</h3>
${line('sun')}${line('moon')}${line('venus')}
${comp.houses ? `<p><strong>Ωροσκόπος ${s('asc').inSign}:</strong> ${esc(CT.ROLE.asc)}, ${esc(CT.SIGN_TONE[signOf('asc')])}.</p>` : ''}
<p class="muted">Πάτησε έναν πλανήτη στον τροχό ή διάλεξε ένα σημείο ή μια όψη από τις λίστες για να δεις τι σημαίνει.</p>`;
  }

  function pointHtml(k) {
    const sg = signOf(k);
    const isAngle = k === 'asc' || k === 'mc';
    const p = isAngle ? null : comp.pos[k];
    const house = p && p.house;
    const title = `${isAngle ? '' : pglyph(k)}${isAngle ? (k === 'asc' ? 'Σύνθετος ωροσκόπος' : 'Σύνθετο μεσουράνημα') : pname(k)} ${SIGNS[sg].inSign}${house ? `, ${house}ος οίκος` : ''}`;
    const parts = [`<p>${esc(CT.INTRO[k])} ${esc(CT.ROLE[k])}.</p>`, `<p>${esc(cap(SIGNS[sg].inSign))} αυτό εκφράζεται ${esc(CT.SIGN_TONE[sg])}.</p>`];
    if (house) parts.push(`<p>Στον ${house}ο οίκο, το θέμα ζωντανεύει κυρίως ${esc(CT.HOUSE_FOCUS[house - 1])}.</p>`);
    if (CT.SLOW.includes(k)) parts.push('<p class="muted">Κινείται αργά, οπότε το ζώδιό του είναι κοινό σε πολλά ζευγάρια της ίδιας γενιάς· για εσάς μετράνε περισσότερο ο οίκος και οι όψεις του.</p>');
    if (isAngle) parts.push('<p class="muted">Υπολογίζεται από το μεσοσημείο των δύο μεσουρανημάτων, για γεωγραφικό πλάτος στο μέσο των δύο τόπων γέννησης (μέθοδος παράγωγου ωροσκόπου).</p>');
    if (p) {
      const [la, lb] = p.from;
      const fmt = (lon) => `${fmtDeg(lon % 30)} ${SIGNS[Math.floor(lon / 30)].name}`;
      parts.push(`<p class="muted">Μεσοσημείο από: ${esc(compNames[0])} ${fmt(la)} και ${esc(compNames[1])} ${fmt(lb)}.</p>`);
      if (p.ambiguous) parts.push('<p class="note">Οι δύο θέσεις είναι σχεδόν απέναντι. Σε αυτή την περίπτωση το μεσοσημείο είναι ευαίσθητο: μια μικρή διαφορά θα το μετέφερε στην αντίθετη πλευρά του τροχού. Δες το ως ενδεικτικό.</p>');
      const unc = comp.uncertainty[k] || 0;
      if (unc >= 1) {
        const deg = p.lon % 30;
        const edge = deg < unc || deg > 30 - unc;
        parts.push(`<p class="note">Χωρίς ώρα γέννησης η θέση είναι κατά προσέγγιση (περίπου ±${Math.round(unc)}°)${edge ? ' και μπορεί να βρίσκεται στο διπλανό ζώδιο' : ''}.</p>`);
      }
    }
    const mine = comp.aspects.filter((a) => a.a === k || a.b === k);
    if (mine.length) parts.push(`<div class="stack"><p><strong>Όψεις:</strong></p><div class="chips">${mine.map((a) => `<button type="button" class="chip-btn" data-sel="${aspId(a)}">${esc(aspTitle(a))}</button>`).join('')}</div></div>`);
    return `<p class="eyebrow">${isAngle ? 'Γωνία του χάρτη' : 'Πλανήτης στον Χάρτη Σχέσης'}</p><h3>${title}</h3><p class="muted">${where(k)}</p>${parts.join('')}`;
  }

  function aspectHtml(a) {
    return `<p class="eyebrow">Όψη στον Χάρτη Σχέσης</p>
<h3>${pglyph(a.a)}${esc(aspTitle(a))} ${pglyph(a.b).trim()}</h3>
<p><span class="tone ${aspToneCls(a)}">${aspTone(a)}</span> <span class="muted">Απόκλιση ${fmtDeg(a.orb)}</span></p>
<p>${esc(aspText(a))}</p>
${a.uncertain ? '<p class="note">Χωρίς ώρα γέννησης αυτή η όψη είναι ενδεικτική: η Σελήνη (ή ο γρήγορος πλανήτης) μπορεί να απέχει μερικές μοίρες.</p>' : ''}
<p class="muted">${pglyph(a.a)}${pname(a.a)} ${where(a.a)} · ${pglyph(a.b)}${pname(a.b)} ${where(a.b)}</p>`;
  }

  function select(key, scroll = true) {
    const box = $('comp-detail');
    const wheel = document.querySelector('#pane-comp .wheel');
    let html, hit = new Set(), lines = new Set();
    if (!key) html = overviewHtml();
    else if (key.includes('|')) {
      const a = comp.aspects.find((x) => aspId(x) === key);
      if (!a) return;
      html = aspectHtml(a); hit = new Set([a.a, a.b]); lines.add(key);
    } else {
      html = pointHtml(key); hit.add(key);
      comp.aspects.forEach((a) => { if (a.a === key || a.b === key) lines.add(aspId(a)); });
    }
    box.innerHTML = html;
    wheel.classList.toggle('has-sel', !!key);
    wheel.querySelectorAll('.wpl').forEach((el) => el.classList.toggle('is-sel', hit.has(el.dataset.key)));
    wheel.querySelectorAll('.wasp').forEach((el) => el.classList.toggle('is-sel', lines.has(el.dataset.key)));
    document.querySelectorAll('#pane-comp .sel-list [data-sel]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.sel === key)));
    const r = box.getBoundingClientRect();
    if (scroll && key && (r.top < 0 || r.top > innerHeight - 80)) box.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' });
  }

  // ── «Η σχέση σας με μια ματιά» ──────────────────────────────────────
  const kindOf = (a) => (a.aspect === 'conjunction' ? 'conj' : ASPECT_NAMES[a.aspect].harmony > 0 ? 'good' : 'hard');
  function glanceHtml() {
    const gl = glance(comp.aspects);
    const card = (id, res) => {
      const T = CT.GLANCE[id], a = res.pick;
      let text, question;
      if (!a) { text = T.none; question = T.noneQuestion; }
      else if (id === 'friction') {
        const dom = CT.FRICTION_DOMAIN.find(([b]) => b === a.a || b === a.b) || [null, 'αντιδράτε ο καθένας', CT.GLANCE.friction.noneQuestion];
        text = T.text(dom[1]); question = dom[2];
      } else { text = T.text[kindOf(a)]; question = T.question[kindOf(a)]; }
      const why = a ? `
  <button type="button" class="btn-ghost glance-why-btn" aria-expanded="false" aria-controls="why-${id}" data-why="${aspId(a)}">Δες γιατί</button>
  <div id="why-${id}" class="glance-why stack" hidden>
    <p><strong>${pglyph(a.a)}${esc(aspTitle(a))} ${pglyph(a.b).trim()}</strong> <span class="tone ${aspToneCls(a)}">${aspTone(a)}</span></p>
    <p>${esc(aspText(a))}</p>
    ${a.uncertain ? '<p class="muted">Ενδεικτική όψη: χωρίς ώρα γέννησης η θέση της Σελήνης είναι κατά προσέγγιση.</p>' : ''}
    <p class="muted">${res.count > 1 ? `Υπολογίστηκαν ${res.count} σχετικές όψεις. Επιλέγουμε πρώτα το ζεύγος πλανητών που αφορά πιο άμεσα ${T.theme}, και μετά την πιο ακριβή όψη (απόκλιση ${fmtDeg(a.orb)}).` : `Είναι η μόνη σχετική όψη που υπολογίστηκε (απόκλιση ${fmtDeg(a.orb)}).`}</p>
    <button type="button" class="chip-btn" data-goto="${aspId(a)}">Δες τη στον χάρτη</button>
  </div>` : '';
      return `<article class="panel stack glance-card glance-${id}">
  <h3>${T.title}</h3>
  <p>${esc(text)}</p>${why}
  <div class="glance-q"><span class="eyebrow">Για συζήτηση</span><p>${esc(question)}</p></div>
</article>`;
    };
    return `<section class="stack-lg glance" aria-labelledby="glance-h">
  <h2 id="glance-h">Η σχέση σας με μια ματιά</h2>
  <div class="trio">${card('attraction', gl.attraction)}${card('communication', gl.communication)}${card('friction', gl.friction)}</div>
</section>`;
  }

  function compositeHtml(ca, cb, A, B, nameA, nameB) {
    comp = compositeChart(ca, cb, A.place.lat, B.place.lat);
    compNames = [nameA, nameB];
    const missing = [!A.timeKnown && nameA, !B.timeKnown && nameB].filter(Boolean);
    const keys = [...COMPOSITE_BODIES, ...(comp.houses ? ['asc', 'mc'] : [])];
    const pointBtns = keys.map((k) => `<li><button type="button" class="sel-btn" data-sel="${k}" aria-pressed="false"><span class="sel-name">${pglyph(k)}${pname(k)}</span><span class="sel-meta">${where(k)}${k !== 'asc' && k !== 'mc' && comp.pos[k].house ? ` · ${comp.pos[k].house}ος οίκος` : ''}${(comp.uncertainty[k] || 0) >= 1 ? ' · ≈' : ''}</span></button></li>`).join('');
    const aspBtns = comp.aspects.map((a) => `<li><button type="button" class="sel-btn" data-sel="${aspId(a)}" aria-pressed="false"><span class="sel-name">${g(ASPECT_NAMES[a.aspect].glyph)} ${esc(aspTitle(a))}</span><span class="sel-meta"><span class="tone ${aspToneCls(a)}">${aspTone(a)}</span> ${fmtDeg(a.orb)}${a.uncertain ? ' · ενδεικτική' : ''}</span></button></li>`).join('');
    const amb = COMPOSITE_BODIES.filter((k) => comp.pos[k].ambiguous);
    return `${glanceHtml()}
<section class="stack">
  <p>Ο Χάρτης Σχέσης (σύνθετος χάρτης) φτιάχνεται από τα μεσοσημεία των δύο χαρτών: για κάθε πλανήτη παίρνουμε το σημείο ακριβώς στη μέση ανάμεσα στις δύο θέσεις (${esc(nameA)} και ${esc(nameB)}), πάνω στο κοντινότερο τόξο. Το αποτέλεσμα περιγράφει τη σχέση σαν τρίτη οντότητα: τι χαρακτήρα έχει, τι τη δυναμώνει και τι τη δοκιμάζει.</p>
  ${missing.length ? `<p class="note">Λείπει η ώρα γέννησης (${missing.map(esc).join(', ')}). Δείχνουμε μόνο ό,τι υπολογίζεται αξιόπιστα: πλανήτες και όψεις, χωρίς ωροσκόπο και οίκους. Η Σελήνη είναι κατά προσέγγιση (περίπου ±${Math.round(comp.uncertainty.moon)}°), οπότε οι όψεις της σημειώνονται ως ενδεικτικές.</p>` : ''}
  ${amb.length ? `<p class="note">Για ${amb.map((k) => pname(k)).join(', ')} οι δύο θέσεις είναι σχεδόν απέναντι, οπότε το μεσοσημείο είναι ευαίσθητο. Δες τις λεπτομέρειες πατώντας πάνω τους.</p>` : ''}
</section>
<section class="comp-grid">
  <div class="comp-wheel stack">${wheelSvg(comp.pos, { houses: comp.houses, aspects: comp.aspects, label: `Χάρτης Σχέσης: ${nameA} και ${nameB}`, interactive: true })}${exportButtons('comp-export', config.merchUrl)}</div>
  <div id="comp-detail" class="panel stack comp-detail" aria-live="polite"></div>
</section>
<section class="split sel-list">
  <div class="stack"><h3>Σημεία του χάρτη</h3><ul class="sel-ul">${pointBtns}</ul></div>
  <div class="stack"><h3>Όψεις</h3>${aspBtns ? `<ul class="sel-ul">${aspBtns}</ul>` : '<p class="muted">Δεν βρέθηκαν κύριες όψεις.</p>'}</div>
</section>
<p class="muted" style="font-size:.85rem">Ο Χάρτης Σχέσης δεν βγάζει ποσοστό συμβατότητας· είναι ανάγνωση του χαρακτήρα της σχέσης. ${comp.houses ? 'Ωροσκόπος και οίκοι: μέθοδος παράγωγου ωροσκόπου από το σύνθετο μεσουράνημα, οίκοι Placidus.' : ''}</p>`;
  }

  // ── Καρτέλες ─────────────────────────────────────────────────────────
  function showTab(which, focus) {
    ['syn', 'comp'].forEach((t) => {
      const on = t === which;
      $(`tab-${t}`).setAttribute('aria-selected', String(on));
      $(`tab-${t}`).tabIndex = on ? 0 : -1;
      $(`pane-${t}`).hidden = !on;
    });
    if (focus) $(`tab-${which}`).focus();
  }

  function render(A, B, opts = {}) {
    const ca = natalChart({ date: A.instant, lat: A.place.lat, lon: A.place.lon, timeKnown: A.timeKnown });
    const cb = natalChart({ date: B.instant, lat: B.place.lat, lon: B.place.lon, timeKnown: B.timeKnown });
    const nameA = A.name || 'Α', nameB = B.name || 'Β';
    const sa = ca.pos.sun.sign, sb = cb.pos.sun.sign;
    const posTable = (ch) => ['sun', 'moon', 'mercury', 'venus', 'mars'].map((b) => `${pglyph(b)}${SIGNS[ch.pos[b].sign].name}`).join(' · ') + (ch.houses ? ` · Ωροσκόπος ${SIGNS[Math.floor(ch.houses.asc / 30)].name}` : ' · χωρίς ώρα γέννησης, η Σελήνη υπολογίζεται για το μεσημέρι');

    $('syn-result').innerHTML = `
<section class="stack">
  <p class="eyebrow">${opts.example ? 'Παράδειγμα με φανταστικά πρόσωπα' : 'Δύο χάρτες μαζί'}</p>
  <h2>${esc(nameA)} ${g(SIGNS[sa].symbol)} και ${esc(nameB)} ${g(SIGNS[sb].symbol)}</h2>
  <p class="muted">${esc(nameA)}: ${posTable(ca)}</p>
  <p class="muted">${esc(nameB)}: ${posTable(cb)}</p>
</section>
<div class="rel-tabs" role="tablist" aria-label="Τρόπος σύγκρισης">
  <button type="button" role="tab" id="tab-syn" aria-controls="pane-syn" aria-selected="true">Συναστρία</button>
  <button type="button" role="tab" id="tab-comp" aria-controls="pane-comp" aria-selected="false" tabindex="-1">Χάρτης Σχέσης</button>
</div>
<div id="pane-syn" role="tabpanel" aria-labelledby="tab-syn" class="stack-lg">
  <p class="muted">Η συναστρία βάζει τον έναν χάρτη πάνω στον άλλον: πώς οι πλανήτες του ενός συναντούν τους πλανήτες του άλλου.</p>
  ${synastryHtml(ca, cb, nameA, nameB)}
</div>
<div id="pane-comp" role="tabpanel" aria-labelledby="tab-comp" class="stack-lg" hidden>${compositeHtml(ca, cb, A, B, nameA, nameB)}</div>`;

    const tabs = ['syn', 'comp'];
    tabs.forEach((t, i) => {
      $(`tab-${t}`).addEventListener('click', () => showTab(t));
      $(`tab-${t}`).addEventListener('keydown', (ev) => {
        if (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') { ev.preventDefault(); showTab(tabs[(i + (ev.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length], true); }
        if (ev.key === 'Home' || ev.key === 'End') { ev.preventDefault(); showTab(ev.key === 'Home' ? 'syn' : 'comp', true); }
      });
    });
    const pane = $('pane-comp');
    pane.addEventListener('click', (ev) => {
      const wb = ev.target.closest('[data-why]');
      if (wb) {
        const open = wb.getAttribute('aria-expanded') !== 'true';
        wb.setAttribute('aria-expanded', String(open));
        $(wb.getAttribute('aria-controls')).hidden = !open;
        if (open) select(wb.dataset.why, false);
        return;
      }
      const ex = ev.target.closest('[data-export]');
      if (ex) {
        const s1 = SIGNS[comp.pos.sun.sign], m1 = SIGNS[comp.pos.moon.sign], v1 = SIGNS[comp.pos.venus.sign];
        downloadChart(pane.querySelector('.wheel'), { kind: ex.dataset.export, title: `${compNames[0]} & ${compNames[1]}`, subtitle: 'Ο Χάρτης Σχέσης μας', lines: [`☉ ${s1.name} · ☽ ${m1.name} · ♀ ${v1.name}`] }, `xartis-sxesis-${ex.dataset.export}.png`);
        return;
      }
      const gt = ev.target.closest('[data-goto]');
      if (gt) {
        select(gt.dataset.goto, false);
        pane.querySelector('.comp-grid').scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
        return;
      }
      const b = ev.target.closest('[data-sel]');
      if (b) { select(b.getAttribute('aria-pressed') === 'true' ? null : b.dataset.sel); return; }
      const w = ev.target.closest('.wpl, .wasp');
      if (w) select(w.dataset.key);
    });
    select(null);
    showTab(opts.tab || 'syn');
  }

  function go(A, B, opts) {
    render(A, B, opts);
    $('syn-result').scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
  }

  $('syn-form').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const ra = readFields('sa'), rb = readFields('sb');
    const err = ra.error ? `Πρόσωπο Α: ${ra.error}` : rb.error ? `Πρόσωπο Β: ${rb.error}` : '';
    $('syn-error').textContent = err;
    $('syn-error').hidden = !err;
    if (err) return;
    go(toInput(ra.value), toInput(rb.value), { tab: location.hash === '#xartis-sxesis' ? 'comp' : 'syn' });
  });

  // Παράδειγμα με συνθετικά στοιχεία (δεν αποθηκεύεται και δεν αλλάζει τη φόρμα)
  const ex = $('syn-example');
  if (ex) ex.addEventListener('click', () => {
    const A = toInput({ name: 'Μαρία', date: '1988-03-12', time: '14:20', timeKnown: true, place: { name: 'Πάτρα, Δυτική Ελλάδα', lat: 38.25, lon: 21.73, tz: 'Europe/Athens' } });
    const B = toInput({ name: 'Νίκος', date: '1985-06-24', time: '08:30', timeKnown: true, place: { name: 'Θεσσαλονίκη, Κεντρική Μακεδονία', lat: 40.64, lon: 22.94, tz: 'Europe/Athens' } });
    go(A, B, { tab: 'comp', example: true });
  });
}
