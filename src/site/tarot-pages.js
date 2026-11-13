// Ταρώ ημέρας: μία κάρτα των Μεγάλων Αρκάνων για τη μέρα και μία για κάθε ζώδιο,
// σταθερή για όλους όλη τη μέρα, και μία μόνιμη σελίδα για κάθε κάρτα.
import { SIGNS } from '../content/signs.js';
import { TAROT } from '../content/tarot-texts.js';
import { fmtIsoLong } from '../horoscope.js';
import { page, esc, glyph, adSlot, articleLd, breadcrumbLd, crumbs } from './layout.js';

function hash(str) {
  let h = 2166136261;
  for (const c of str) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
export const cardOfDay = (iso, key = 'day') => TAROT[hash(`${iso}:tarot:${key}`) % TAROT.length];
const cardPath = (c) => `taro/${c.slug}/index.html`;
const cardFace = (c, h = 'h3') => `<div class="tarot-card"><span class="num">${c.num}</span><span class="g">${c.sym}︎</span><${h}>${esc(c.name)}</${h}><p class="muted" style="color:#c9bff0">${c.keywords.join(' · ')}</p></div>`;

export function tarotIndexPage(iso) {
  const path = 'taro/index.html';
  const root = '../';
  const day = cardOfDay(iso);
  const perSign = SIGNS.map((s) => {
    const c = cardOfDay(iso, s.slug);
    return `<article class="panel stack el-${s.element}"><h3>${glyph(s.symbol)} ${s.name}: <a href="${root}${cardPath(c)}">${esc(c.name)}</a></h3><p>${esc(c.advice)}</p></article>`;
  }).join('');
  const all = TAROT.map((c) => `<a class="sign-card" href="${root}${cardPath(c)}"><span class="g">${c.sym}︎</span><strong>${esc(c.name)}</strong><small>${c.num} · ${c.keywords[0]}</small></a>`).join('');
  const trail = [['Ζώδια Σήμερα', 'index.html'], ['Ταρώ ημέρας', path]];
  const content = `
${crumbs(trail, root)}
<section class="split">
  <div class="stack">
    <p class="eyebrow">${esc(fmtIsoLong(iso))}</p>
    <h1>Ταρώ ημέρας: ${esc(day.name)}</h1>
    <p class="lede">${esc(day.meaning)}</p>
    <p><strong>Στον έρωτα:</strong> ${esc(day.love)}</p>
    <p><strong>Στη δουλειά:</strong> ${esc(day.work)}</p>
    <p class="advice">${esc(day.advice)}</p>
  </div>
  ${cardFace(day, 'h2')}
</section>
${adSlot()}
<section class="stack-lg"><h2>Η κάρτα της ημέρας για κάθε ζώδιο</h2><div class="readings">${perSign}</div></section>
<section class="stack"><h2>Πώς λειτουργεί</h2><p>Κάθε μέρα «τραβάμε» μία κάρτα από τα 22 Μεγάλα Αρκάνα για τη μέρα και μία για κάθε ζώδιο. Η κάρτα μένει ίδια για όλους μέχρι τα μεσάνυχτα. Η ταρώ εδώ είναι για ψυχαγωγία και για λίγο αναστοχασμό: μια αφορμή να σκεφτείς τη μέρα σου από άλλη οπτική.</p>
<p class="chips"><a class="chip" href="${root}index.html">Ζώδια σήμερα</a><a class="chip" href="${root}zodia-avrio/index.html">Ζώδια αύριο</a></p></section>
<section class="stack-lg"><h2>Οι 22 κάρτες των Μεγάλων Αρκάνων</h2><div class="signs">${all}</div></section>`;
  const title = `Ταρώ ημέρας: ${day.name}, η κάρτα για σήμερα και για κάθε ζώδιο`;
  const description = `Ταρώ ημέρας, ${fmtIsoLong(iso)}: ${day.name} (${day.keywords.join(', ')}). Τι σημαίνει για έρωτα και δουλειά, και η κάρτα της ημέρας για κάθε ζώδιο.`;
  return { path, ...page({ path, title, titleExact: false, description, content, ogType: 'article', jsonLd: [articleLd({ path, headline: title, description, modified: iso }), breadcrumbLd(trail)] }) };
}

export function tarotCardPage(k) {
  const c = TAROT[k];
  const path = cardPath(c);
  const root = '../../';
  const prev = TAROT[(k + TAROT.length - 1) % TAROT.length], next = TAROT[(k + 1) % TAROT.length];
  const trail = [['Ζώδια Σήμερα', 'index.html'], ['Ταρώ', 'taro/index.html'], [c.name, path]];
  const content = `
${crumbs(trail, root)}
<section class="split">
  <div class="stack">
    <p class="eyebrow">Μεγάλα Αρκάνα · ${c.num}</p>
    <h1>${esc(c.name)}: η σημασία της κάρτας στην ταρώ</h1>
    <p class="lede">${esc(c.meaning)}</p>
  </div>
  ${cardFace(c, 'h2')}
</section>
<section class="trio">
  <div class="panel stack"><h2>Στον έρωτα</h2><p>${esc(c.love)}</p></div>
  <div class="panel stack"><h2>Στη δουλειά</h2><p>${esc(c.work)}</p></div>
  <div class="panel stack"><h2>Η συμβουλή</h2><p>${esc(c.advice)}</p></div>
</section>
${adSlot()}
<section class="stack"><h2>Λέξεις-κλειδιά</h2><p class="chips">${c.keywords.map((w) => `<span class="chip">${esc(w)}</span>`).join('')}</p>
<p><a href="${root}taro/index.html">Ποια κάρτα βγήκε σήμερα; Δες την ταρώ ημέρας</a></p></section>
<nav class="month-nav" aria-label="Άλλες κάρτες"><a href="${root}${cardPath(prev)}">← ${esc(prev.name)}</a><a href="${root}taro/index.html">Όλες οι κάρτες</a><a href="${root}${cardPath(next)}">${esc(next.name)} →</a></nav>`;
  const title = `${c.name} στην ταρώ: σημασία για έρωτα, δουλειά και συμβουλή`;
  const description = `${c.name} (${c.num}) στην ταρώ: ${c.keywords.join(', ')}. Τι σημαίνει η κάρτα γενικά, στον έρωτα και στη δουλειά, και ποια είναι η συμβουλή της.`;
  return { path, lastmod: '2026-11-07', ...page({ path, title, description, content, ogType: 'article', jsonLd: [articleLd({ path, headline: title, description, published: '2026-11-07' }), breadcrumbLd(trail)] }) };
}

export const tarotPages = (iso) => [tarotIndexPage(iso), ...TAROT.map((_, k) => tarotCardPage(k))];

