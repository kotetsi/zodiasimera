// Αριθμολογία: αριθμός ζωής και προσωπικό έτος.
import { LIFE_PATH, PERSONAL_YEAR, INTRO } from '../content/numerology-texts.js';
import { page, esc, adSlot } from './layout.js';

export const NUMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];
const numPath = (n) => `arithmologia/arithmos-zois-${n}/index.html`;

export function numerologyIndexPage(year) {
  const path = 'arithmologia/index.html';
  const data = { t: Object.fromEntries(NUMS.map((n) => [n, LIFE_PATH[n].title])), py: PERSONAL_YEAR };
  const cards = NUMS.map((n) => `<a class="sign-card" href="arithmos-zois-${n}/index.html"><strong style="font-size:1.6rem">${n}</strong><small>${esc(LIFE_PATH[n].title.split(':').pop().trim())}</small></a>`).join('');
  const content = `
<section class="stack"><p class="eyebrow">Αριθμολογία</p><h1>Ο αριθμός ζωής σου</h1>
<p class="lede">${esc(INTRO.lifePath)}</p></section>
<form id="nm-form" class="panel natal-form" novalidate>
  <label class="field"><span>Ημερομηνία γέννησης</span><input id="nm-date" type="date" min="1900-01-01" max="2050-12-31" required></label>
  <div class="wide"><button type="submit" class="btn">Υπολόγισε</button></div>
  <p id="nm-error" class="error wide" role="alert" hidden></p>
</form>
<div id="nm-result" class="stack-lg" aria-live="polite"></div>
${adSlot()}
<section class="stack"><h2>Πώς υπολογίζεται</h2><div class="reading"><p>${esc(INTRO.howTo)}</p><p>${esc(INTRO.personalYear)}</p></div></section>
<section class="stack-lg"><h2>Οι αριθμοί ζωής</h2><div class="signs">${cards}</div></section>
<script>(function(){var D=${JSON.stringify(data)},Y=${year};
function sum(s){return String(s).split('').reduce(function(a,c){return a+(+c||0)},0)}
function red(n,keep){while(n>9&&!(keep&&(n===11||n===22||n===33)))n=sum(n);return n}
document.getElementById('nm-form').addEventListener('submit',function(ev){ev.preventDefault();var v=document.getElementById('nm-date').value,er=document.getElementById('nm-error'),out=document.getElementById('nm-result');out.innerHTML='';
if(!v){er.textContent='Συμπλήρωσε την ημερομηνία γέννησης.';er.hidden=false;return}er.hidden=true;
var p=v.split('-'),digits=p[2]+p[1]+p[0],total=sum(digits),lp=red(total,true),py=red(sum(p[2])+sum(p[1])+sum(Y),false);
var steps=digits.split('').join(' + ')+' = '+total+(total!==lp?' → '+String(total).split('').join(' + ')+(red(sum(total),true)!==lp?' → …':'')+' = '+lp:'');
out.innerHTML='<div class="split"><div class="panel stack"><p class="eyebrow">Αριθμός ζωής</p><h2 style="font-size:3rem">'+lp+'</h2><p><strong>'+D.t[lp]+'</strong></p><p class="muted num">'+steps+'</p><p><a class="btn-ghost" href="arithmos-zois-'+lp+'/index.html">Διάβασε τι σημαίνει</a></p></div>'+
'<div class="panel stack"><p class="eyebrow">Προσωπικό έτος '+Y+'</p><h2 style="font-size:3rem">'+py+'</h2><p>'+D.py[py]+'</p></div></div>';});})();</script>`;
  return { path, ...page({ path, title: 'Αριθμολογία: υπολόγισε τον αριθμό ζωής σου', description: 'Δωρεάν αριθμολογία: υπολόγισε τον αριθμό ζωής από την ημερομηνία γέννησης και δες τι σημαίνει για τον χαρακτήρα, τον έρωτα και τη δουλειά, μαζί με το προσωπικό σου έτος.', content }) };
}

export function lifePathPage(n) {
  const L = LIFE_PATH[n];
  const path = numPath(n);
  const root = '../../';
  const content = `
<section class="stack"><p class="eyebrow">Αριθμολογία${[11, 22, 33].includes(n) ? ' · Κύριος Αριθμός' : ''}</p><h1>${esc(L.title)}</h1>
<p class="lede">${esc(L.intro)}</p><div class="chips">${L.keywords.map((k) => `<span class="chip">${esc(k)}</span>`).join('')}</div></section>
<section class="split">
  <div class="stack"><h2>Στον έρωτα</h2><p>${esc(L.love)}</p><h2>Στη δουλειά</h2><p>${esc(L.work)}</p></div>
  <div class="panel stack"><h3>Η πρόκληση</h3><p>${esc(L.challenge)}</p><p class="advice">${esc(L.tip)}</p></div>
</section>
${adSlot()}
<section class="stack"><h2>Οι άλλοι αριθμοί ζωής</h2><div class="chips">${NUMS.filter((x) => x !== n).map((x) => `<a class="chip" href="${root}${numPath(x)}">${x}</a>`).join('')}</div>
<p><a class="btn-ghost" href="${root}arithmologia/index.html">Υπολόγισε τον αριθμό ζωής σου</a></p></section>`;
  return { path, ...page({ path, title: `Αριθμός ζωής ${n}: χαρακτήρας, έρωτας και δουλειά`, description: `${L.title}. ${L.intro.split('. ')[0]}. Τι σημαίνει ο αριθμός ζωής ${n} στον έρωτα και στη δουλειά.`.slice(0, 300), content }) };
}

export const numerologyPages = (year) => [numerologyIndexPage(year), ...NUMS.map(lifePathPage)];
