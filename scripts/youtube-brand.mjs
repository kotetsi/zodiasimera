import { createRequire } from 'node:module'; import { writeFileSync } from 'node:fs'; import { execFileSync } from 'node:child_process';
const req = createRequire(import.meta.url); const { chromium } = req(execFileSync('npm',['root','-g']).toString().trim()+'/@playwright/mcp/node_modules/playwright');
const F = 'file://' + process.cwd() + '/static/assets/fonts/';
const css = `@font-face{font-family:C;src:url(${F}commissioner.woff2)}@font-face{font-family:D;src:url(${F}comfortaa.woff2)}@font-face{font-family:S;src:url(${F}noto-sans-symbols.woff2)}*{margin:0}html,body{height:100%}body{background:radial-gradient(120% 90% at 80% 0%,#3a1f8f,#160e45 70%);overflow:hidden;color:#f6f2ff;font-family:C}`;
let seed=7; const r=()=>((seed=(seed*16807)%2147483647)/2147483647);
const stars=(w,h,n)=>`<svg style="position:absolute;inset:0" width="${w}" height="${h}">${Array.from({length:n},()=>`<circle cx="${r()*w|0}" cy="${r()*h|0}" r="${(0.8+r()*2.2).toFixed(1)}" fill="#fff" opacity="${(0.2+r()*0.6).toFixed(2)}"/>`).join('')}</svg>`;
const signs='♈♉♊♋♌♍♎♏♐♑♒♓'; const col=['#ff7d5c','#3fd394','#ffcf4a','#6aa5ff'];
const ring=(cx,cy,R,fs)=>[...signs].map((g,i)=>{const a=i/12*2*Math.PI-Math.PI/2;return `<div style="position:absolute;left:${cx+Math.cos(a)*R-fs/2}px;top:${cy+Math.sin(a)*R-fs*0.62}px;width:${fs}px;text-align:center;font-family:S;font-size:${fs}px;color:${col[i%4]}">${g}&#xFE0E;</div>`}).join('');
const setC = async (html) => { writeFileSync('/tmp/brand.html', '<!doctype html><meta charset=utf-8>' + html); await p.goto('file:///tmp/brand.html'); };
const b = await chromium.launch({executablePath:'/usr/bin/google-chrome'}); const p = await b.newPage();
// Εικόνα προφίλ 800x800 (κύκλος)
await p.setViewportSize({width:800,height:800});
await setC(`<style>${css}</style>${stars(800,800,70)}<div style="position:absolute;left:150px;top:150px;width:500px;height:500px;border-radius:50%;border:4px solid #ffffff30"></div>${ring(400,400,250,64)}<div style="position:absolute;left:0;right:0;top:250px;text-align:center"><div style="display:inline-block;width:170px;height:170px;border-radius:50%;border:18px solid #ffd166;position:relative"><div style="position:absolute;left:58px;top:58px;width:54px;height:54px;border-radius:50%;background:#ffd166"></div></div><div style="font-family:D;font-weight:700;font-size:62px;margin-top:22px;color:#fff">Ζώδια</div></div>`);
await p.evaluate(()=>document.fonts.ready); await p.screenshot({path:'docs/youtube/avatar.png'});
// Banner 2560x1440 (ασφαλής ζώνη κέντρο 1546x423)
await p.setViewportSize({width:2560,height:1440});
await setC(`<style>${css}</style>${stars(2560,1440,260)}${ring(2230,720,270,78)}<div style="position:absolute;left:507px;top:520px;width:1546px;height:423px;display:flex;flex-direction:column;justify-content:center"><div style="font-family:D;font-weight:700;font-size:150px;line-height:1"><span style="color:#ffd166">☉</span> Ζώδια Σήμερα</div><div style="font-size:58px;color:#c9bff0;margin-top:30px">Τα ζώδια της ημέρας, από τον πραγματικό ουρανό</div><div style="font-size:52px;color:#ff6fb2;margin-top:22px;font-weight:700">Κάθε μέρα νέο βίντεο · zodiasimera.com</div></div>`);
await p.evaluate(()=>document.fonts.ready); await p.screenshot({path:'docs/youtube/banner.png'});
await b.close();
