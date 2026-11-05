// Εξαγωγή του τροχού σε PNG (στον browser): αφίσα για εκτύπωση, διάφανο φόντο για μπλουζάκι,
// και κάθετη εικόνα για Instagram Stories. Δεν στέλνεται τίποτα πουθενά.
const LIGHT = {
  paper: '#fbf8ff', surface: '#ffffff', ink: '#1d1640', muted: '#655d8c', line: '#d9d0f0',
  brass: '#d81b73', violet: '#6236ff', sun: '#ffb703', fire: '#f0441c', earth: '#12925c', air: '#b77900', water: '#1f6fff',
  'violet-soft': '#ece6ff', chip: '#f2edff',
};
const DARK = {
  paper: '#120d2b', surface: '#1c1542', ink: '#f4f0ff', muted: '#b3aad8', line: '#4a3f85',
  brass: '#ff5ca8', violet: '#a184ff', sun: '#ffc93c', fire: '#ff7d5c', earth: '#3fd394', air: '#ffcf4a', water: '#6aa5ff',
  'violet-soft': '#2d2263', chip: '#281f55',
};
const FONTS = {
  sym: "'Noto Sans Symbols','Segoe UI Symbol','Apple Symbols',sans-serif",
  body: "'Commissioner','Segoe UI',system-ui,sans-serif",
  display: "'Comfortaa','Commissioner',system-ui,sans-serif",
};

function svgImage(svgEl, pal, surface) {
  const clone = svgEl.cloneNode(true);
  clone.querySelectorAll('.wpl-bg').forEach((n) => n.remove());
  clone.querySelectorAll('[class]').forEach((n) => n.removeAttribute('class'));
  clone.removeAttribute('class');
  let src = new XMLSerializer().serializeToString(clone);
  src = src.replace(/var\(--([\w-]+)\)/g, (_, k) => (FONTS[k] || (k === 'surface' ? surface : pal[k]) || pal.ink));
  if (!/xmlns=/.test(src)) src = src.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  src = src.replace(/(<svg[^>]*>)/, `$1<style>text{fill:${pal.ink}}</style>`);
  return new Promise((ok, fail) => {
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = fail;
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(src);
  });
}

const fit = (ctx, text, max, size, weight, family) => {
  let s = size;
  do { ctx.font = `${weight} ${s}px ${family}`; s -= 2; } while (ctx.measureText(text).width > max && s > 10);
  return s + 2;
};

// kind: 'poster' (λευκό φόντο), 'transparent' (χωρίς φόντο), 'story' (1080×1920, σκούρο)
export async function renderChartPng(svgEl, { kind = 'poster', title = '', subtitle = '', lines = [] } = {}) {
  const story = kind === 'story';
  const W = story ? 1080 : 2400, H = story ? 1920 : 3000;
  const pal = story ? DARK : LIGHT;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (document.fonts && document.fonts.ready) await document.fonts.ready;

  if (story) {
    const gr = ctx.createLinearGradient(0, 0, W, H);
    gr.addColorStop(0, '#0c0822'); gr.addColorStop(0.55, '#231660'); gr.addColorStop(1, '#3a1f8f');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    for (let k = 0; k < 90; k++) { // αστεράκια σε σταθερές θέσεις
      const x = (k * 977) % W, y = (k * 571) % H, r = (k % 3) + 1;
      ctx.fillStyle = `rgba(255,255,255,${0.15 + (k % 5) / 12})`; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
  } else if (kind === 'poster') {
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
  }

  const img = await svgImage(svgEl, pal, kind === 'transparent' ? 'none' : story ? 'rgba(28,21,66,0.85)' : '#ffffff');
  const pad = story ? 60 : 160;
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  let y = story ? 170 : 300;
  if (story) {
    ctx.fillStyle = pal.sun; ctx.font = `700 40px ${FONTS.display}`; ctx.fillText('☉ Ζώδια Σήμερα', W / 2, 120); y = 250;
  }
  if (title) {
    ctx.fillStyle = pal.ink;
    fit(ctx, title, W - pad * 2, story ? 76 : 150, 700, FONTS.display);
    ctx.fillText(title, W / 2, y); y += story ? 70 : 130;
  }
  if (subtitle) {
    ctx.fillStyle = pal.muted;
    fit(ctx, subtitle, W - pad * 2, story ? 36 : 64, 500, FONTS.body);
    ctx.fillText(subtitle, W / 2, y); y += story ? 40 : 60;
  }
  // ο τροχός (viewBox 444×420)
  const ww = W - pad * 2, wh = ww * 420 / 444;
  ctx.drawImage(img, pad, y, ww, wh);
  y += wh + (story ? 80 : 140);
  ctx.fillStyle = pal.ink;
  for (const l of lines) {
    fit(ctx, l, W - pad * 2, story ? 46 : 84, 600, FONTS.body);
    ctx.fillText(l, W / 2, y); y += story ? 66 : 120;
  }
  ctx.fillStyle = story ? pal.sun : pal.muted;
  ctx.font = `${story ? 700 : 500} ${story ? 40 : 56}px ${FONTS.body}`;
  ctx.fillText(story ? 'Φτιάξε τον δικό σου στο zodiasimera.com' : 'zodiasimera.com', W / 2, H - (story ? 110 : 120));
  return new Promise((ok) => canvas.toBlob(ok, 'image/png'));
}

export async function downloadChart(svgEl, opts, filename) {
  const blob = await renderChartPng(svgEl, opts);
  const file = new File([blob], filename, { type: 'image/png' });
  // Στο κινητό, η εικόνα για Stories ανοίγει απευθείας το μενού κοινοποίησης
  if (opts.kind === 'story' && navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: opts.title }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

// Κουμπιά εξαγωγής (HTML) — merchUrl: σελίδα προϊόντος στο sellyourmerch (αν έχει οριστεί)
export const exportButtons = (id, merchUrl) => `
<div class="export-row" id="${id}">
  <p class="eyebrow">Κράτησέ τον</p>
  <div class="chips">
    <button type="button" class="chip-btn" data-export="poster">Κατέβασε PNG για εκτύπωση</button>
    <button type="button" class="chip-btn" data-export="transparent">PNG με διάφανο φόντο</button>
    <button type="button" class="chip-btn" data-export="story">Εικόνα για Stories</button>
  </div>
  ${merchUrl ? `<p class="merch-cta"><a class="btn" href="${merchUrl}" target="_blank" rel="noopener">Τύπωσέ τον σε αφίσα ή μπλουζάκι</a> <span class="muted" style="font-size:.85rem">Κατέβασε πρώτα το PNG και ανέβασέ το στη σελίδα του προϊόντος.</span></p>` : ''}
</div>`;
