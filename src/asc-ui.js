// Σελίδα «Υπολόγισε τον ωροσκόπο σου» (στον browser).
import { SIGNS } from './content/signs.js';
import { ASC_SIGN, SIGN_STYLE } from './content/natal-texts.js';
import { setupBirthForm } from './birth-form.js';
import { natalChart } from './natal.js';
import { fmtDeg } from './chart-svg.js';

export function startAscPage(root, year) {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const g = (s) => `<span class="g">${s}︎</span>`;
  const ascAt = (input, minutes) => {
    const ch = natalChart({ date: new Date(input.instant.getTime() + minutes * 60000), lat: input.place.lat, lon: input.place.lon, timeKnown: true });
    return ch.houses ? ch.houses.asc : null;
  };

  function render(input) {
    const box = $('nc-result');
    if (!input.timeKnown) {
      box.innerHTML = '<div class="panel stack"><h2>Χρειάζεται η ώρα γέννησης</h2><p>Ο ωροσκόπος αλλάζει ζώδιο περίπου κάθε δύο ώρες, οπότε χωρίς ώρα δεν μπορεί να υπολογιστεί. Θα τη βρεις στη ληξιαρχική πράξη γέννησης ή στο βιβλιάριο υγείας.</p></div>';
      return;
    }
    const ch = natalChart({ date: input.instant, lat: input.place.lat, lon: input.place.lon, timeKnown: true });
    if (!ch.houses) { box.innerHTML = '<div class="panel"><p>Δεν μπορεί να υπολογιστεί ωροσκόπος για αυτό το γεωγραφικό πλάτος.</p></div>'; return; }
    const asc = ch.houses.asc, sg = Math.floor(asc / 30), s = SIGNS[sg];
    const sun = SIGNS[ch.pos.sun.sign], moon = SIGNS[ch.pos.moon.sign];
    // Ευαισθησία στην ώρα: τι ωροσκόπο θα είχες με ±15 λεπτά
    const alt = [-15, 15].map((m) => Math.floor(ascAt(input, m) / 30)).filter((x) => x !== sg);
    const altNote = alt.length ? `<p class="note">Ο ωροσκόπος σου είναι κοντά στο όριο ${alt.map((x) => `με ${SIGNS[x].acc}`).join(' και ')}: αν η ώρα γέννησής σου διαφέρει έστω και 15 λεπτά, μπορεί να είναι ${alt.map((x) => SIGNS[x].name).join(' ή ')}. Δες και εκείνη την περιγραφή.</p>` : '';
    box.innerHTML = `
<section class="split">
  <div class="panel stack hero-asc el-${s.element}">
    <p class="eyebrow">Ο ωροσκόπος σου</p>
    <h2>${g(s.symbol)} ${s.name} <span class="muted num" style="font-size:.6em">${fmtDeg(asc % 30)}</span></h2>
    <p>${esc(ASC_SIGN[sg])}</p>
    ${altNote}
  </div>
  <div class="stack">
    <h3>Ήλιος, Σελήνη και ωροσκόπος</h3>
    <p>${g(sun.symbol)} <strong>Ήλιος ${sun.inSign}:</strong> ο πυρήνας σου, αυτό που είσαι.</p>
    <p>${g(moon.symbol)} <strong>Σελήνη ${moon.inSign}:</strong> τι χρειάζεσαι για να νιώθεις ασφάλεια.</p>
    <p>${g(s.symbol)} <strong>Ωροσκόπος ${s.inSign}:</strong> πώς σε βλέπουν και πώς ξεκινάς κάτι νέο, ${esc(SIGN_STYLE[sg])}.</p>
    <p>${sun === s ? 'Ο Ήλιος και ο ωροσκόπος σου είναι στο ίδιο ζώδιο, οπότε η εικόνα που δίνεις ταιριάζει πολύ με αυτό που είσαι.' : `Πολλοί σε γνωρίζουν πρώτα ως ${s.acc.replace(/^(τον|την|τη|τους|τις) /, '')} και αργότερα ανακαλύπτουν ${sun.acc} μέσα σου.`}</p>
    <p><a href="${root}zodia/${s.slug}/index.html">Διάβασε και την πρόβλεψη ${s.gen}</a>: οι αστρολόγοι προτείνουν να διαβάζεις και το ζώδιο του ωροσκόπου σου. · <a href="${root}zodia-${year}/${s.slug}/index.html">${s.name} ${year}</a></p>
    <p><a class="btn-ghost" href="${root}xartis/index.html">Δες ολόκληρο τον γενέθλιο χάρτη σου</a></p>
  </div>
</section>`;
  }
  setupBirthForm({ onSubmit: (i) => render(i), onLoadSaved: (i) => render(i) });
}
