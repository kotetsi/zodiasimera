// RSS με τις ημερήσιες προβλέψεις: ένα για όλα τα ζώδια και ένα ανά ζώδιο.
// Χρησιμεύουν για newsletter (MailerLite RSS campaigns) και για όποιον θέλει να τις διαβάζει σε reader.
import { SIGNS } from '../content/signs.js';
import { horoscopeFor, fmtIsoLong, athensTime } from '../horoscope.js';
import config from '../config.js';

const x = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const channel = (title, link, desc, items) => `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>
<title>${x(title)}</title><link>${link}</link><description>${x(desc)}</description><language>el</language>
${items.join('\n')}
</channel></rss>`;

export function feeds(sky) {
  const base = config.siteUrl;
  const [y, m, d] = sky.iso.split('-').map(Number);
  const pub = athensTime(y, m, d, 6).toUTCString();
  const item = (i) => {
    const s = SIGNS[i], h = horoscopeFor(i, sky);
    const url = `${base}/zodia/${s.slug}/`;
    const html = h.paras.map((p) => `<p>${x(p)}</p>`).join('') + `<p><strong>${x(h.advice)}</strong></p><p><a href="${url}">Διάβασε και την αυριανή πρόβλεψη</a></p>`;
    return `<item><title>${x(`${s.name}: ${fmtIsoLong(sky.iso)}`)}</title><link>${url}</link><guid isPermaLink="false">${s.slug}-${sky.iso}</guid><pubDate>${pub}</pubDate><description><![CDATA[${html}]]></description></item>`;
  };
  const out = { 'rss/zodia.xml': channel(`${config.siteName}: ημερήσιες προβλέψεις`, `${base}/`, 'Οι ημερήσιες προβλέψεις για τα 12 ζώδια', SIGNS.map((_, i) => item(i))) };
  SIGNS.forEach((s, i) => { out[`rss/${s.slug}.xml`] = channel(`${s.name} σήμερα | ${config.siteName}`, `${base}/zodia/${s.slug}/`, `Η ημερήσια πρόβλεψη για ${s.acc}`, [item(i)]); });
  return out;
}
