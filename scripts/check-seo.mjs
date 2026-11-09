import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
import { Script } from 'node:vm';
import { fileURLToPath } from 'node:url';
import { setBuildDate, featuredYear, metadata } from '../src/site/seo.js';
import { retainedYears, retainedMonths } from '../src/site/archive.js';

const root = new URL('../', import.meta.url);
const dates = process.argv.slice(2);
if (!dates.length) dates.push('2026-11-09', '2026-12-31', '2027-01-01');
assert.throws(() => setBuildDate('2027-02-30'));
setBuildDate('2027-01-01'); assert.equal(featuredYear, 2027);
setBuildDate('2027-10-01'); assert.equal(featuredYear, 2028);
assert.deepEqual(retainedYears('2027-01-01', 2027), [2026, 2027]);
assert(retainedMonths('2027-01-01').some(m => m.y === 2026 && m.m === 11));
setBuildDate('2026-11-09');
assert.equal(metadata('anadromos-ermis-2027/index.html', '', '').title, 'Ανάδρομος Ερμής 2027: Ημερομηνίες και ζώδια');

const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);
const decode = s => s.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
let previous = new Set();
for (const iso of dates) {
  const run = spawnSync(process.execPath, ['src/build.js', iso], { cwd: root, encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr || run.stdout);
  const dist = new URL('../dist/', import.meta.url);
  const distPath = fileURLToPath(dist);
  const files = walk(distPath).filter(f => f.endsWith('.html'));
  const paths = new Set(files.map(f => relative(distPath, f).replaceAll('\\', '/')));
  for (const p of previous) assert(paths.has(p), `URL disappeared on ${iso}: ${p}`);
  previous = paths;
  const titles = new Set();
  let longestTitle = 0, longestDescription = 0, truncatedTitles = 0;
  for (const f of files) {
    const html = readFileSync(f, 'utf8');
    const path = relative(distPath, f).replaceAll('\\', '/');
    const title = decode(html.match(/<title>(.*?)<\/title>/s)?.[1] || '');
    const description = decode(html.match(/<meta name="description" content="([^"]*)">/)?.[1] || '');
    assert(title.length && title.length <= 60, `Title length ${title.length}: ${path}`);
    assert(description.length && description.length <= 155, `Description length ${description.length}: ${path}`);
    assert(!titles.has(title), `Duplicate title: ${title}`); titles.add(title);
    longestTitle = Math.max(longestTitle, title.length); longestDescription = Math.max(longestDescription, description.length);
    if (title.includes('…')) truncatedTitles++;
    const rendered = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
    assert.equal([...rendered.matchAll(/<h1\b/g)].length, 1, `H1: ${path}`);
    assert(html.includes(`<link rel="canonical" href="https://zodiasimera.com/${path.replace(/index\.html$/, '')}">`), `Canonical: ${path}`);
    for (const m of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
      if (m[1].includes('application/ld+json')) {
        const ld = JSON.parse(m[2]);
        for (const key of ['datePublished', 'dateModified']) if (ld[key]) assert(ld[key].slice(0, 10) <= iso, `Future ${key}: ${path}`);
      } else if (m[2].trim()) new Script(m[2], { filename: path });
    }
    for (const m of rendered.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
      const url = new URL(decode(m[1]), `https://zodiasimera.com/${path}`);
      if (url.origin !== 'https://zodiasimera.com') continue;
      const target = decodeURIComponent(url.pathname.slice(1));
      const targetPath = target.endsWith('/') || !target ? `${target}index.html` : target;
      assert(paths.has(targetPath), `Broken link ${path} -> ${targetPath}`);
      if (url.hash) {
        const body = readFileSync(join(distPath, targetPath), 'utf8');
        assert(body.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `Missing anchor ${path} -> ${url.href}`);
      }
    }
    const css = html.match(/<link rel="stylesheet" href="([^"]*assets\/site\.css)">/)?.[1];
    assert(css && existsSync(new URL(css, new URL(path, dist))), `Missing stylesheet ${path}`);
  }
  const sitemap = readFileSync(new URL('sitemap.xml', dist), 'utf8');
  const locations = [...sitemap.matchAll(/<loc>https:\/\/zodiasimera\.com\/([^<]*)<\/loc>/g)].map(m => `${m[1]}index.html`);
  assert.equal(locations.length, paths.size);
  assert.equal(new Set(locations).size, paths.size);
  for (const p of locations) assert(paths.has(p), `Sitemap URL ${p}`);
  for (const m of sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)) assert(m[1] <= iso, `Future sitemap date ${m[1]}`);
  assert(!/<lastmod>/.test(sitemap.match(/<url><loc>https:\/\/zodiasimera.com\/oroi\/<\/loc>[\s\S]*?<\/url>/)?.[0] || ''), 'Static terms must not claim daily updates');
  assert(!readFileSync(new URL('zodia-2027/krios/index.html', dist), 'utf8').includes('"datePublished":"2026-10-01"'));
  assert.equal(truncatedTitles, 0, 'Use an explicit title template instead of clipping a heading');
  assert(readFileSync(new URL('../preview-index.html', dist), 'utf8').includes('<style>'));
  console.log(JSON.stringify({ date: iso, pages: paths.size, longestTitle, longestDescription, truncatedTitles, internalLinks: 'passed', scripts: 'parsed', sitemap: 'passed', retainedURLs: 'passed' }));
}
