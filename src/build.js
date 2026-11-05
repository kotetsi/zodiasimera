// Χτίζει όλο το site στον φάκελο dist/ για τη σημερινή ημέρα (ώρα Αθήνας).
// Χρήση: node src/build.js [YYYY-MM-DD]
import { mkdirSync, writeFileSync, rmSync, cpSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { skyForDay, todayInAthens, addDays } from './horoscope.js';
import { SIGNS } from './content/signs.js';
import { fullDocument } from './site/layout.js';
import * as P from './site/pages.js';
import config from './config.js';
import { bundle } from './site/bundle.js';
import { yearSky } from './forecast.js';
import { yearIndexPage, yearSignPage } from './site/year-pages.js';
import { weekOf, monthOf, periodSky, periodSignPage, periodIndexPage } from './site/period-pages.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'dist');
const iso = process.argv[2] || todayInAthens();

const sky = skyForDay(iso);
const skyTomorrow = skyForDay(addDays(iso, 1));

const pages = [
  P.homePage(sky, skyTomorrow),
  ...SIGNS.map((_, i) => P.signPage(i, sky, skyTomorrow)),
  P.skyPage(sky),
  P.moonPage(sky),
  P.retroPage(sky),
  P.compatIndexPage(),
  P.aboutPage(),
  P.privacyPage(),
  P.termsPage(),
  P.contactPage(),
  P.guideNatalPage(),
  P.natalPage(bundle(join(ROOT, 'src'), 'natal-ui.js', "__m['natal-ui'].startNatalPage('../');")),
  P.dailyPage(bundle(join(ROOT, 'src'), 'daily-ui.js', "__m['daily-ui'].startDailyPage('../');")),
  P.ascPage(bundle(join(ROOT, 'src'), 'asc-ui.js', `__m['asc-ui'].startAscPage('../', ${new Date().getUTCMonth() >= 9 ? new Date().getUTCFullYear() + 1 : new Date().getUTCFullYear()});`)),
  P.synastryPage(bundle(join(ROOT, 'src'), 'synastry-ui.js', "__m['synastry-ui'].startSynastryPage('../');")),
];
for (let i = 0; i < 12; i++) for (let j = i; j < 12; j++) pages.push(P.compatPairPage(i, j));
// Ετήσιες προβλέψεις: τρέχον έτος, και από τον Οκτώβριο και το επόμενο
const [curY, curM] = iso.split('-').map(Number);
const years = curM >= 10 ? [curY, curY + 1] : [curY];
for (const y of years) { const ys = yearSky(y); pages.push(yearIndexPage(ys), ...SIGNS.map((_, i) => yearSignPage(ys, i))); }
for (const ps of [periodSky(weekOf(iso)), periodSky(monthOf(iso))]) pages.push(periodIndexPage(ps), ...SIGNS.map((_, i) => periodSignPage(ps, i)));
const months = P.ephemerisMonths(iso, 12);
months.forEach((_, k) => pages.push(P.ephemerisPage(months, k)));

rmSync(OUT, { recursive: true, force: true });
for (const pg of pages) {
  const file = join(OUT, pg.path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, fullDocument(pg));
}

// Χωρίς domain δεν φτιάχνουμε sitemap (χρειάζεται απόλυτα URL)
if (config.siteUrl) {
  const urls = pages.map((p) => `<url><loc>${config.siteUrl}/${p.path.replace(/index\.html$/, '')}</loc><lastmod>${iso}</lastmod></url>`).join('');
  writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
  writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${config.siteUrl}/sitemap.xml\n`);
}
writeFileSync(join(OUT, '.nojekyll'), '');
// Στατικά αρχεία (εικόνες οδηγών κ.λπ.)
if (existsSync(join(ROOT, 'static'))) cpSync(join(ROOT, 'static'), OUT, { recursive: true });
if (config.siteUrl) writeFileSync(join(OUT, 'CNAME'), new URL(config.siteUrl).host + '\n');

// Αρχική χωρίς πλαίσιο εγγράφου, για προεπισκόπηση ως artifact
const home = pages[0];
writeFileSync(join(ROOT, 'preview-index.html'), `${home.head}\n${home.body}\n`);

console.log(`Χτίστηκαν ${pages.length} σελίδες για ${iso} στο ${OUT}`);
