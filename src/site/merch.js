import config from '../config.js';
import { SIGNS } from '../content/signs.js';
import { breadcrumbLd, crumbs, esc, page } from './layout.js';

const slogans = {
  krios: 'Πρώτα πάω. Μετά ρωτάω.',
  tavros: 'Έχω σχέδιο: δεν κουνιέμαι.',
  didymoi: 'Έχω κι άλλη εκδοχή.',
  karkinos: 'Νιώθω και για τους δυο μας.',
  leon: 'Το φως με βρίσκει μόνο του.',
  parthenos: 'Το έχω ήδη στη λίστα.',
  zygos: 'Μια απόφαση. Δώσ’ μου λίγο.',
  skorpios: 'Το πρόσεξα. Δεν το είπα.',
  toxotis: 'Πάμε κι όπου μας βγάλει.',
  aigokeros: 'Το έβαλα στο πρόγραμμα.',
  ydrochoos: 'Έχω μια περίεργη ιδέα.',
  ichthyes: 'Εδώ είμαι. Κάπου αλλού.',
};

function storefrontUrl(value) {
  if (!value) return '';
  const url = new URL(value);
  const hosts = ['sellyourmerch.gr', 'www.sellyourmerch.gr'];
  if (url.protocol !== 'https:' || !hosts.includes(url.hostname) || url.username || url.password || url.port) {
    throw new Error('Expected a public HTTPS SellYourMerch URL');
  }
  return url.href;
}

export function merchPage() {
  const path = 'eshop/index.html';
  const trail = [['Ζώδια Σήμερα', 'index.html'], ['E-shop', path]];
  const collection = storefrontUrl(config.merchStoreUrl);
  const products = SIGNS.map((sign) => ({
    ...sign,
    url: storefrontUrl(config.merchProducts[sign.slug]),
  }));
  const available = collection || products.some(({ url }) => url);
  const cards = products.map(({ name, slug, url }) => `
    <article class="panel merch-card">
      <img src="../merch/${slug}.webp" alt="Μακέτα μαύρου μπλουζιού για το ζώδιο ${esc(name)}" width="660" height="720" loading="lazy" decoding="async">
      <div class="merch-card-copy">
        <h2>${esc(name)}</h2>
        <p>${esc(slogans[slug])}</p>
        ${url ? `<a class="chip" href="${esc(url)}" rel="sponsored">Δες το μπλουζάκι ${esc(name)}</a>` : ''}
      </div>
    </article>`).join('');
  const content = `
    ${crumbs(trail, '../')}
    <section class="night merch-hero stack">
      <h1>Μπλουζάκια για τα 12 ζώδια</h1>
      <p class="lede">Φόρα το ζώδιό σου. Δώδεκα σύμβολα και δώδεκα ελληνικές ατάκες σε μαύρα T-shirts.</p>
      <p>${available ? 'Η αγορά γίνεται στο SellYourMerch.' : 'Προεπισκόπηση συλλογής. Οι αγορές θα ανοίξουν όταν τα προϊόντα δημοσιευτούν στο SellYourMerch.'}</p>
      ${collection ? `<p><a class="btn" href="${esc(collection)}" rel="sponsored">Συλλογή στο SellYourMerch</a></p>` : ''}
    </section>
    <section class="merch-grid" aria-label="Σχέδια ανά ζώδιο">${cards}</section>`;
  return { path, ...page({
    path,
    title: 'Μπλουζάκια ζωδίων: 12 σχέδια με ελληνικές ατάκες',
    description: 'Δες 12 σχέδια για μαύρα μπλουζάκια με σύμβολα ζωδίων και ελληνικές ατάκες από το Ζώδια Σήμερα.',
    content,
    jsonLd: breadcrumbLd(trail),
  }) };
}
