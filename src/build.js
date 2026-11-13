// Χτίζει όλο το site στον φάκελο dist/ για τη σημερινή ημέρα (ώρα Αθήνας).
// Χρήση: node src/build.js [YYYY-MM-DD]
import { mkdirSync, writeFileSync, rmSync, cpSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { skyForDay, todayInAthens, addDays } from './horoscope.js';
import { SIGNS } from './content/signs.js';
import { fullDocument, CSS } from './site/layout.js';
import * as P from './site/pages.js';
import config from './config.js';
import { bundle } from './site/bundle.js';
import { yearSky } from './forecast.js';
import { yearIndexPage, yearSignPage } from './site/year-pages.js';
import { feeds } from './site/feeds.js';
import { chinesePages } from './site/chinese-pages.js';
import { numerologyPages } from './site/numerology-pages.js';
import { mercuryYear, mercuryPage } from './site/mercury-pages.js';
import { moonYears, fullMoonPage, fullMoonIndexPage } from './site/moon-pages.js';
import { weekOf, monthOf, periodSky, periodSignPage, periodIndexPage } from './site/period-pages.js';
import { archiveDayPage, archiveIndexPage, tomorrowPage } from './site/daily-pages.js';
import { birthdayPage, birthdayIndexPage, allBirthdays } from './site/birthday-pages.js';
import { eclipseYear, eclipsePage } from './site/eclipse-pages.js';
import { tarotPages } from './site/tarot-pages.js';
import { merchPage } from './site/merch.js';
import { setBuildDate, featuredYear } from './site/seo.js';
import { retainedYears, retainedMonths, archivePage } from './site/archive.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// Κείμενα «στον έρωτα / γυναίκα / άντρας» (αν υπάρχουν)
const profFile = join(ROOT, 'src/content/sign-profiles.js');
const PROFILES = existsSync(profFile) ? (await import('./content/sign-profiles.js')).PROFILES : null;
P.setProfilesAvailable(!!PROFILES);
const OUT = join(ROOT, 'dist');
const iso = process.argv[2] || todayInAthens();
setBuildDate(iso);

const sky = skyForDay(iso);
const skyTomorrow = skyForDay(addDays(iso, 1));

const pages = [
  P.homePage(sky, skyTomorrow),
  merchPage(),
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
  P.ascPage(bundle(join(ROOT, 'src'), 'asc-ui.js', `__m['asc-ui'].startAscPage('../', ${featuredYear});`)),
  P.sunSignPage(bundle(join(ROOT, 'src'), 'sunsign-ui.js', `__m['sunsign-ui'].startSunSignPage('../', ${featuredYear});`)),
  P.synastryPage(bundle(join(ROOT, 'src'), 'synastry-ui.js', "__m['synastry-ui'].startSynastryPage('../');")),
];
for (let i = 0; i < 12; i++) for (let j = i; j < 12; j++) pages.push(P.compatPairPage(i, j));
if (PROFILES) pages.push(...P.profilePages(PROFILES));
// Ετήσιες προβλέψεις: τρέχον έτος, και από τον Οκτώβριο και το επόμενο
const [curY, curM] = iso.split('-').map(Number);
const years = retainedYears(iso, curM >= 10 ? curY + 1 : curY);
const eventYears = retainedYears(iso, curY + 1);
for (const y of years) { const ys = yearSky(y); pages.push(yearIndexPage(ys), ...SIGNS.map((_, i) => yearSignPage(ys, i))); }
for (const ps of [periodSky(weekOf(iso)), periodSky(monthOf(iso))]) pages.push(periodIndexPage(ps), ...SIGNS.map((_, i) => periodSignPage(ps, i)));
pages.push(...chinesePages(), ...numerologyPages(curY));
for (const y of eventYears) pages.push(mercuryPage(y, mercuryYear(y), sky.noon));
{ const my = moonYears(eventYears); pages.push(fullMoonIndexPage(my), ...my.full.map((_, k) => fullMoonPage(my, k))); }
// Αρχείο ημερήσιων: μία σελίδα ανά ημέρα από το config.archiveStart έως αύριο, και «Ζώδια αύριο»
{
  const first = config.archiveStart && config.archiveStart <= iso ? config.archiveStart : iso;
  const last = addDays(iso, 1);
  const days = [];
  for (let d = first; d <= last; d = addDays(d, 1)) days.push(d);
  for (const d of days) pages.push(archiveDayPage(d === iso ? sky : d === last ? skyTomorrow : skyForDay(d), { first, last, asOf: iso }));
  pages.push(archiveIndexPage(days, iso), tomorrowPage(skyTomorrow));
}
// Εκλείψεις: από το 2026 έως το επόμενο έτος
// (κρατάμε και τα προηγούμενα έτη από το 2026, για να μη χαθούν σελίδες που έχουν ήδη μπει στο Google)
{ const ys = []; for (let y = Math.min(2026, curY); y <= curY + 1; y++) ys.push(y); for (const y of ys) pages.push(eclipsePage(y, eclipseYear(y), ys)); }
// Ταρώ ημέρας και οι 22 κάρτες
pages.push(...tarotPages(iso));
// Γεννημένοι μέρα προς μέρα (366 σελίδες)
pages.push(birthdayIndexPage(), ...allBirthdays().map(([m, d]) => birthdayPage(m, d)));
const months = retainedMonths(iso);
pages.push(P.ephemerisIndexPage(months, iso), archivePage(years, eventYears));
months.forEach((_, k) => pages.push(P.ephemerisPage(months, k)));

rmSync(OUT, { recursive: true, force: true });
for (const pg of pages) {
  const file = join(OUT, pg.path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, fullDocument(pg));
}

// Χωρίς domain δεν φτιάχνουμε sitemap (χρειάζεται απόλυτα URL)
if (config.siteUrl) {
  const urls = pages.map((p) => `<url><loc>${config.siteUrl}/${p.path.replace(/index\.html$/, '')}</loc>${p.lastmod ? `<lastmod>${p.lastmod}</lastmod>` : ''}</url>`).join('');
  writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
  writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${config.siteUrl}/sitemap.xml\n`);
}
mkdirSync(join(OUT, 'assets'), { recursive: true });
writeFileSync(join(OUT, 'assets/site.css'), CSS);
writeFileSync(join(OUT, '.nojekyll'), '');
// ads.txt για το AdSense (ca-pub-123 → pub-123)
if (config.adsenseClient) writeFileSync(join(OUT, 'ads.txt'), `google.com, ${config.adsenseClient.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0\n`);
if (config.siteUrl) for (const [f, xml] of Object.entries(feeds(sky))) { mkdirSync(dirname(join(OUT, f)), { recursive: true }); writeFileSync(join(OUT, f), xml); }
// Στατικά αρχεία (εικόνες οδηγών κ.λπ.)
if (existsSync(join(ROOT, 'static'))) cpSync(join(ROOT, 'static'), OUT, { recursive: true });
if (config.siteUrl) writeFileSync(join(OUT, 'CNAME'), new URL(config.siteUrl).host + '\n');

// Αρχική χωρίς πλαίσιο εγγράφου, για προεπισκόπηση ως artifact
const home = pages[0];
writeFileSync(join(ROOT, 'preview-index.html'), `${home.head.replace(/<link rel="stylesheet" href="assets\/site\.css">/, `<style>${CSS}</style>`)}\n${home.body}\n`);

console.log(`Χτίστηκαν ${pages.length} σελίδες για ${iso} στο ${OUT}`);

