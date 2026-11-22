// Καθημερινό YouTube Short «Ζώδια σήμερα» (1080×1920, ~55″, με μουσική).
// Χρήση: node scripts/short-video.mjs [ΕΕΕΕ-ΜΜ-ΗΗ] [έξοδος.mp4]
// Χρειάζεται: google-chrome + Playwright (global npm, π.χ. από @playwright/mcp), ffmpeg, python3 με numpy.
// Γράφει δίπλα στο mp4 και ένα .json με τίτλο, περιγραφή και tags για το ανέβασμα.
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { skyForDay, horoscopeFor, todayInAthens, fmtTime, fmtIsoLong } from '../src/horoscope.js';
import { SIGNS } from '../src/content/signs.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const iso = process.argv[2] || todayInAthens();
const out = resolve(process.argv[3] || `zodia-simera-${iso}.mp4`);
const TMP = join(tmpdir(), `zs-short-${iso}`);
rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });

// Playwright από όπου υπάρχει (το repo δεν έχει dependencies)
function loadPlaywright() {
  const req = createRequire(import.meta.url);
  const tries = ['playwright', ...[process.env.NODE_PATH, execFileSync('npm', ['root', '-g']).toString().trim()]
    .filter(Boolean).flatMap((p) => [join(p, 'playwright'), join(p, '@playwright/mcp/node_modules/playwright')])];
  for (const t of tries) { try { return req(t); } catch { /* επόμενο */ } }
  throw new Error('Δεν βρέθηκε το Playwright');
}

const sky = skyForDay(iso);
const dateLong = fmtIsoLong(iso).replace(/ \d{4}$/, '');
const EL = { fire: ['#ff7d5c', '#4a2018'], earth: ['#3fd394', '#12382a'], air: ['#ffcf4a', '#3f3214'], water: ['#6aa5ff', '#172c55'] };
const VS = '︎';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const fonts = (f) => pathToFileURL(join(ROOT, 'static/assets/fonts', f)).href;

const moon = sky.pos.moon;
const ing = sky.moonIngress;
const moonLine = ing ? `Η Σελήνη ${SIGNS[ing.from].inSign}, στις ${fmtTime(ing.date)} μπαίνει ${SIGNS[ing.sign].inSign}`
  : `Η Σελήνη ${SIGNS[moon.sign].inSign}`;
const phase = `${Math.round(sky.illumination * 100)}% φωτισμένη · ${sky.waxing ? 'αύξουσα' : 'φθίνουσα'}`;

const css = `
@font-face{font-family:C;src:url(${fonts('commissioner.woff2')});font-weight:400 700}
@font-face{font-family:D;src:url(${fonts('comfortaa.woff2')});font-weight:500 700}
@font-face{font-family:S;src:url(${fonts('noto-sans-symbols.woff2')})}
*{box-sizing:border-box;margin:0}
body{width:1080px;height:1920px;overflow:hidden;font-family:C,sans-serif;color:#f6f2ff;
 background:radial-gradient(120% 90% at 80% 0%,#3a1f8f 0%,#1a1050 55%,#0e0830 100%)}
.stars{position:absolute;inset:0}
.wrap{position:absolute;left:90px;right:150px;top:250px;bottom:460px;display:flex;flex-direction:column;justify-content:center;gap:42px}
.kick{font-weight:700;font-size:40px;letter-spacing:4px;color:#ff6fb2;text-transform:uppercase}
.brand{position:absolute;left:90px;top:130px;font-family:D;font-weight:700;font-size:44px;color:#ffd166}
.url{position:absolute;left:90px;bottom:330px;font-size:40px;color:#c9bff0}
h1{font-family:D;font-weight:700;font-size:120px;line-height:1.05}
.big{font-family:D;font-weight:700;font-size:150px;line-height:1}
.sym{font-family:S;flex-shrink:0;width:300px;height:300px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:190px;border:8px solid}
.dates{font-size:42px;color:#c9bff0}
.rate{display:grid;grid-template-columns:auto 1fr;gap:14px 30px;font-size:44px;align-items:center}
.dots{letter-spacing:10px;font-size:46px}
.adv{font-size:56px;line-height:1.35;font-weight:500}
.p{font-size:54px;line-height:1.35}
.moon{width:220px;height:220px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#fffbea,#f3e6b6 70%,#d8c58a);box-shadow:0 0 90px #fff3c470}
`;
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const stars = `<svg class="stars" width="1080" height="1920">${Array.from({ length: 160 }, () => `<circle cx="${(rnd() * 1080).toFixed(0)}" cy="${(rnd() * 1920).toFixed(0)}" r="${(0.8 + rnd() * 2).toFixed(1)}" fill="#fff" opacity="${(0.2 + rnd() * 0.6).toFixed(2)}"/>`).join('')}</svg>`;
const doc = (inner) => `<!doctype html><html lang="el"><head><meta charset="utf-8"><style>${css}</style></head><body>${stars}<div class="brand">☉ Ζώδια Σήμερα</div>${inner}<div class="url">zodiasimera.com</div></body></html>`;
const dots = (n) => `<span class="dots">${'●'.repeat(n)}<span style="opacity:.25">${'●'.repeat(5 - n)}</span></span>`;

const frames = [];
frames.push({ dur: 3.5, html: doc(`<div class="wrap"><div class="kick">${esc(dateLong)}</div><h1>Ζώδια<br>σήμερα</h1><div class="moon"></div><div class="p">${esc(moonLine)}</div><div class="dates">${esc(phase)}</div></div>`) });
const lines = [];
SIGNS.forEach((s, i) => {
  const h = horoscopeFor(i, sky);
  const [c, soft] = EL[s.element];
  // Η πρώτη παράγραφος αλλάζει ανά ζώδιο (οίκος της Σελήνης): 1–2 προτάσεις
  const sent = h.paras[0].split(/(?<=[.!;])\s/);
  const text = sent[0].length < 90 && sent[1] ? `${sent[0]} ${sent[1]}` : sent[0];
  lines.push(`${s.symbol} ${s.name}: ${text}`);
  frames.push({ dur: 5.5, html: doc(`<div class="wrap">
<div style="display:flex;align-items:center;gap:50px"><div class="sym" style="background:${soft};border-color:${c};color:${c}">${s.symbol}${VS}</div>
<div><div class="big" style="font-size:124px;white-space:nowrap">${esc(s.name)}</div><div class="dates" style="margin-top:16px">${esc(s.dates)}</div></div></div>
<div class="rate"><span>Έρωτας</span>${dots(h.ratings.love)}<span>Δουλειά</span>${dots(h.ratings.work)}<span>Διάθεση</span>${dots(h.ratings.mood)}</div>
<div class="adv" style="font-size:${text.length > 170 ? 48 : 54}px">${esc(text)}</div></div>`) });
});
frames.push({ dur: 4, html: doc(`<div class="wrap"><h1 style="font-size:96px">Όλη η πρόβλεψη<br>για το ζώδιό σου</h1><div class="p" style="color:#ffd166;font-weight:700">zodiasimera.com</div><div class="p">Γίνε συνδρομητής για τα ζώδια κάθε μέρα ✨</div></div>`) });

// Καρέ με Chrome
const { chromium } = loadPlaywright();
const browser = await chromium.launch({ executablePath: existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
for (const [k, f] of frames.entries()) {
  const file = join(TMP, `f${k}.html`);
  writeFileSync(file, f.html);
  await page.goto(pathToFileURL(file).href);
  await page.evaluate(() => document.fonts.ready);
  // Το όνομα του ζωδίου να χωρά πριν από τη ζώνη των κουμπιών του YouTube (δεξιά 150px)
  await page.evaluate(() => { for (const el of document.querySelectorAll('.big')) { let fs = parseFloat(getComputedStyle(el).fontSize); while (el.getBoundingClientRect().right > 930 && fs > 60) { fs -= 2; el.style.fontSize = fs + 'px'; } } });
  await page.screenshot({ path: join(TMP, `f${k}.png`) });
}
await browser.close();

// Βίντεο: κάθε καρέ ως clip, crossfade 0,5″, μουσική
const X = 0.5;
const total = frames.reduce((a, f) => a + f.dur, 0) - X * (frames.length - 1);
const music = join(TMP, 'music.wav');
execFileSync('python3', [join(ROOT, 'scripts/short-music.py'), music, String(Math.ceil(total) + 1)]);
const args = ['-y'];
frames.forEach((f, k) => args.push('-loop', '1', '-t', String(f.dur), '-i', join(TMP, `f${k}.png`)));
args.push('-i', music);
let chain = '', last = '[0:v]', offset = 0;
frames.forEach((f, k) => { chain += `[${k}:v]fps=30,format=yuv420p,setsar=1[v${k}];`; });
last = '[v0]';
for (let k = 1; k < frames.length; k++) {
  offset += frames[k - 1].dur - X;
  chain += `${last}[v${k}]xfade=transition=fade:duration=${X}:offset=${offset.toFixed(2)}[x${k}];`;
  last = `[x${k}]`;
}
chain += `[${frames.length}:a]atrim=0:${total.toFixed(2)},afade=t=out:st=${(total - 2).toFixed(2)}:d=2[a]`;
args.push('-filter_complex', chain, '-map', last, '-map', '[a]', '-c:v', 'libx264', '-preset', 'veryfast', '-tune', 'stillimage', '-crf', '27', '-maxrate', '350k', '-bufsize', '700k', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', '-t', total.toFixed(2), out);
execFileSync('ffmpeg', ['-v', 'error', ...args], { stdio: ['ignore', 'ignore', 'inherit'] });

// Τίτλος / περιγραφή για το YouTube
const [y, mo, d] = iso.split('-').map(Number);
const MONTHS = ['Ιανουαρίου', 'Φεβρουαρίου', 'Μαρτίου', 'Απριλίου', 'Μαΐου', 'Ιουνίου', 'Ιουλίου', 'Αυγούστου', 'Σεπτεμβρίου', 'Οκτωβρίου', 'Νοεμβρίου', 'Δεκεμβρίου'];
const meta = {
  title: `Ζώδια σήμερα ${d} ${MONTHS[mo - 1]} ${y} ✨ Προβλέψεις για τα 12 ζώδια #shorts`,
  description: `Τα ζώδια σήμερα, ${fmtIsoLong(iso)}: έρωτας, δουλειά και διάθεση για τα 12 ζώδια. ${moonLine}.\n\nΟλόκληρη η πρόβλεψη για το ζώδιό σου: https://zodiasimera.com/\n\n${lines.join('\n')}\n\nΟι προβλέψεις υπολογίζονται από τις πραγματικές θέσεις των πλανητών και είναι για ψυχαγωγικούς σκοπούς.\n\n#ζώδια #ζωδιασημερα #ωροσκόπιο #αστρολογία #shorts`,
  tags: ['ζώδια', 'ζώδια σήμερα', 'ωροσκόπιο', 'αστρολογία', 'προβλέψεις ζωδίων', 'zodia simera'],
  duration: +total.toFixed(1),
};
writeFileSync(out.replace(/\.mp4$/, '.json'), JSON.stringify(meta, null, 2));
rmSync(TMP, { recursive: true, force: true });
console.log(`Έτοιμο: ${out} (${meta.duration}″)`);
