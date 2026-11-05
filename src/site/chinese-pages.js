// Κινέζικο ωροσκόπιο: υπολογιστής, 12 ζώα, έτος.
import { ANIMALS, ELEMENTS_CN, YEAR_2027 } from '../content/chinese-texts.js';
import { chineseNewYear, yearInfo } from '../chinese.js';
import { page, esc, adSlot } from './layout.js';

const fmt = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Intl.DateTimeFormat('el-GR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, d))); };
const YEARS = Array.from({ length: 2051 - 1900 + 1 }, (_, k) => 1900 + k);
let TABLE = null;
const table = () => (TABLE ||= Object.fromEntries(YEARS.map((y) => [y, chineseNewYear(y)])));
const byKey = Object.fromEntries(ANIMALS.map((a, i) => [a.key, i]));
const animalPath = (a) => `kinezika-zodia/${a.slug}/index.html`;
const yinWord = (yin) => (yin ? 'Γιν' : 'Γιανγκ');
const elName = (e) => ELEMENTS_CN[e].name;

// έτη ενός ζώου (κινέζικο έτος → [αρχή, τέλος])
function yearsOf(i) {
  const t = table();
  return YEARS.slice(0, -1).filter((y) => yearInfo(y).animal === i && y >= 1924 && y <= 2043).map((y) => {
    const end = new Date(Date.parse(t[y + 1]) - 86400000).toISOString().slice(0, 10);
    return { y, start: t[y], end, el: yearInfo(y).element };
  });
}

export function chineseIndexPage() {
  const path = 'kinezika-zodia/index.html';
  const root = '../';
  const data = { t: table(), a: ANIMALS.map((a) => [a.name, a.slug, a.gen]), e: Object.fromEntries(Object.entries(ELEMENTS_CN).map(([k, v]) => [k, v.name])) };
  const cards = ANIMALS.map((a, i) => `<a class="sign-card" href="${root}${animalPath(a)}"><strong>${a.name}</strong><small>${yearsOf(i).slice(-4).map((x) => x.y).join(', ')}</small><span class="muted" style="font-size:.8rem">${esc(a.keywords.slice(0, 2).join(', '))}</span></a>`).join('');
  const content = `
<section class="stack"><p class="eyebrow">Κινέζικη αστρολογία</p><h1>Κινέζικο ωροσκόπιο</h1>
<p class="lede">Στην κινέζικη αστρολογία κάθε χρονιά έχει ένα από τα 12 ζώα και ένα από τα 5 στοιχεία. Η χρονιά όμως δεν αλλάζει την 1η Ιανουαρίου αλλά με την Κινέζικη Πρωτοχρονιά, ανάμεσα σε 21 Ιανουαρίου και 20 Φεβρουαρίου. Βάλε την ημερομηνία γέννησής σου για να βρεις το ζώο σου.</p></section>
<form id="cz-form" class="panel natal-form" novalidate>
  <label class="field"><span>Ημερομηνία γέννησης</span><input id="cz-date" type="date" min="1900-01-31" max="2051-12-31" required></label>
  <div class="wide"><button type="submit" class="btn">Βρες το ζώο μου</button></div>
  <p id="cz-error" class="error wide" role="alert" hidden></p>
</form>
<div id="cz-result" aria-live="polite"></div>
<section class="panel stack"><h2>${esc(YEAR_2027.title)}</h2><p>${esc(YEAR_2027.intro)}</p><p><a class="btn-ghost" href="${root}kinezika-zodia-2027/index.html">Τι φέρνει το 2027 σε κάθε ζώο</a></p></section>
${adSlot()}
<section class="stack-lg"><h2>Τα 12 ζώα</h2><div class="signs">${cards}</div></section>
<section class="stack"><h2>Τα 5 στοιχεία</h2><div class="readings">${Object.values(ELEMENTS_CN).map((e) => `<div class="stack"><h3>${e.name}</h3><p>${esc(e.text)}</p></div>`).join('')}</div>
<p class="muted" style="font-size:.85rem">Το στοιχείο της χρονιάς βγαίνει από το τελευταίο ψηφίο του έτους: 0–1 Μέταλλο, 2–3 Νερό, 4–5 Ξύλο, 6–7 Φωτιά, 8–9 Γη.</p></section>
<script>(function(){var D=${JSON.stringify(data)};var S=['wood','wood','fire','fire','earth','earth','metal','metal','water','water'];
document.getElementById('cz-form').addEventListener('submit',function(ev){ev.preventDefault();var v=document.getElementById('cz-date').value,er=document.getElementById('cz-error');document.getElementById('cz-result').innerHTML='';
if(!v){er.textContent='Συμπλήρωσε την ημερομηνία γέννησης.';er.hidden=false;return}var y=+v.slice(0,4);if(!D.t[y]||!D.t[y+1]&&v>=D.t[y]){er.textContent='Ο υπολογισμός καλύπτει τα έτη 1900 έως 2050.';er.hidden=false;return}er.hidden=true;
var cy=v<D.t[y]?y-1:y;if(!D.t[cy]){er.textContent='Ο υπολογισμός ξεκινά από τις 31 Ιανουαρίου 1900.';er.hidden=false;return}
var a=((cy-4)%12+12)%12,e=S[((cy-4)%10+10)%10],yin=((cy-4)%2+2)%2===1,an=D.a[a];
var note=v<D.t[y]?'<p class="note">Γεννήθηκες πριν από την Κινέζικη Πρωτοχρονιά του '+y+', οπότε ανήκεις στην κινέζικη χρονιά '+cy+'.</p>':'';
document.getElementById('cz-result').innerHTML='<div class="panel stack"><p class="eyebrow">Το κινέζικο ζώδιό σου</p><h2>'+an[0]+'</h2><p>'+D.e[e]+' '+an[0]+' · '+(yin?'Γιν':'Γιανγκ')+' · κινέζικη χρονιά '+cy+'</p>'+note+'<p><a class="btn-ghost" href="'+an[1]+'/index.html">Όλα για το έτος '+an[2]+'</a></p></div>';});})();</script>`;
  return { path, ...page({ path, title: 'Κινέζικο ωροσκόπιο: βρες το κινέζικο ζώδιό σου', description: 'Κινέζικο ωροσκόπιο: βρες το ζώο και το στοιχείο σου από την ημερομηνία γέννησης, με σωστή ημερομηνία Κινέζικης Πρωτοχρονιάς για κάθε χρονιά. Τα 12 ζώα και το 2027, έτος της Φωτιάς Κατσίκας.', content }) };
}

export function animalPage(i) {
  const a = ANIMALS[i];
  const path = animalPath(a);
  const root = '../../';
  const ys = yearsOf(i);
  const link = (k) => { const b = ANIMALS[byKey[k]]; return `<a class="chip" href="${root}${animalPath(b)}">${b.name}</a>`; };
  const rows = ys.map((x) => `<tr><td class="num">${x.y}</td><td>${elName(x.el)} ${a.name}</td><td>${fmt(x.start)} – ${fmt(x.end)}</td></tr>`).join('');
  const content = `
<section class="stack"><p class="eyebrow">Κινέζικο ωροσκόπιο · ${elName(a.fixedElement)} · ${yinWord(a.yinYang === 'yin')}</p><h1>${a.name}</h1>
<p class="lede">${esc(a.intro)}</p><div class="chips">${a.keywords.map((k) => `<span class="chip">${esc(k)}</span>`).join('')}</div></section>
<section class="split">
  <div class="stack"><h2>Στον έρωτα</h2><p>${esc(a.love)}</p><h2>Στη δουλειά</h2><p>${esc(a.work)}</p></div>
  <div class="stack"><h3>Δυνατά σημεία</h3><ul class="plain">${a.strengths.map((x) => `<li>${esc(x)}</li>`).join('')}</ul><h3>Προκλήσεις</h3><ul class="plain">${a.challenges.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
  <h3>Ταιριάζει με</h3><div class="chips">${a.bestMatch.map(link).join('')}</div><h3>Δύσκολο ταίρι</h3><div class="chips">${link(a.clash)}</div>
  <p class="muted">Τυχερά χρώματα: ${esc(a.luckyColors.join(', '))} · Τυχεροί αριθμοί: ${a.luckyNumbers.join(', ')}</p></div>
</section>
${adSlot()}
<section class="panel stack"><h2>${a.name} το 2027</h2><p>${esc(YEAR_2027.forAnimal[a.key])}</p><p><a href="${root}kinezika-zodia-2027/index.html">${esc(YEAR_2027.title)}</a></p></section>
<section class="stack-lg"><h2>Ποια χρόνια είναι έτη ${a.gen}</h2><p class="muted">Με τις ακριβείς ημερομηνίες: όποιος γεννήθηκε πριν από την Κινέζικη Πρωτοχρονιά ανήκει στο προηγούμενο ζώο.</p>
<div class="table-wrap"><table><thead><tr><th>Έτος</th><th>Ζώο και στοιχείο</th><th>Διάρκεια</th></tr></thead><tbody>${rows}</tbody></table></div></section>
<section class="stack"><h2>Τα άλλα ζώα</h2><div class="chips">${ANIMALS.filter((b) => b !== a).map((b) => `<a class="chip" href="${root}${animalPath(b)}">${b.name}</a>`).join('')}</div><p><a href="${root}kinezika-zodia/index.html">Βρες το κινέζικο ζώδιό σου</a></p></section>`;
  return { path, ...page({ path, title: `${a.name}: κινέζικο ζώδιο, χαρακτήρας και χρονιές ${a.gen}`, description: `Κινέζικο ωροσκόπιο, ${a.name}: χαρακτήρας, έρωτας, δουλειά, με ποια ζώα ταιριάζει, ποια χρόνια είναι έτη ${a.gen} και τι φέρνει το 2027.`, content }) };
}

export function chineseYearPage() {
  const path = 'kinezika-zodia-2027/index.html';
  const root = '../';
  const t = table();
  const per = ANIMALS.map((a) => `<div class="stack"><h3><a href="${root}${animalPath(a)}">${a.name}</a></h3><p>${esc(YEAR_2027.forAnimal[a.key])}</p></div>`).join('');
  const info = yearInfo(2027);
  const content = `
<section class="stack"><p class="eyebrow">Κινέζικο ωροσκόπιο</p><h1>${esc(YEAR_2027.title)}</h1>
<p class="lede">Η Κινέζικη Πρωτοχρονιά του 2027 είναι στις ${fmt(t[2027])} και η χρονιά κρατά έως τις ${fmt(new Date(Date.parse(t[2028]) - 86400000).toISOString().slice(0, 10))}. Είναι χρονιά ${elName(info.element) === 'Φωτιά' ? 'της Φωτιάς' : elName(info.element)} Κατσίκας (${yinWord(info.yin)}).</p></section>
<section class="reading"><p>${esc(YEAR_2027.intro)}</p>${YEAR_2027.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}</section>
${adSlot()}
<section class="stack-lg"><h2>Τι φέρνει σε κάθε ζώο</h2><div class="readings">${per}</div></section>
<p><a class="btn-ghost" href="${root}kinezika-zodia/index.html">Βρες το κινέζικο ζώδιό σου</a></p>`;
  return { path, ...page({ path, title: 'Κινέζικο ωροσκόπιο 2027: έτος της Φωτιάς Κατσίκας', description: `Κινέζικο ωροσκόπιο 2027: η χρονιά της Φωτιάς Κατσίκας ξεκινά στις ${fmt(t[2027])}. Τι φέρνει σε καθένα από τα 12 ζώα.`, content }) };
}

export const chinesePages = () => [chineseIndexPage(), chineseYearPage(), ...ANIMALS.map((_, i) => animalPage(i))];
