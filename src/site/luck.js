// Η «τύχη της ημέρας» ανά ζώδιο: ποσοστό, τυχερός αριθμός, χρώμα.
// Το ποσοστό ακολουθεί τις βαθμολογίες της ημέρας (αγάπη, δουλειά, διάθεση), οπότε συμφωνεί με την πρόβλεψη.
// Αριθμός και χρώμα βγαίνουν σταθερά από ημερομηνία και ζώδιο: ίδια για όλους, όλη τη μέρα.
import { SIGNS } from '../content/signs.js';
import { esc } from './layout.js';

function hash(str) {
  let h = 2166136261;
  for (const c of str) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

const COLORS = {
  fire: [['Κόκκινο', '#e0312b'], ['Πορτοκαλί', '#f28c28'], ['Χρυσό', '#d4a017'], ['Κοραλλί', '#ff6f61'], ['Μπορντό', '#7b1e3a']],
  earth: [['Πράσινο', '#2e8b57'], ['Καφέ', '#8b5a2b'], ['Μπεζ', '#d8c3a5'], ['Λαδί', '#708238'], ['Σμαραγδί', '#0f9d73']],
  air: [['Γαλάζιο', '#6cb4ee'], ['Κίτρινο', '#f5c518'], ['Λιλά', '#b19cd9'], ['Ασημί', '#b8bec6'], ['Τιρκουάζ', '#2ab7b0']],
  water: [['Θαλασσί', '#1f6fff'], ['Ασημί', '#b8bec6'], ['Μωβ', '#7a3fb0'], ['Τιρκουάζ', '#2ab7b0'], ['Λευκό', '#f4f4f4']],
};

export function luckFor(signIdx, iso, ratings) {
  const s = SIGNS[signIdx];
  const h = hash(`${iso}:${s.slug}:luck`);
  const avg = (ratings.love + ratings.work + ratings.mood) / 3;
  const percent = Math.max(35, Math.min(98, Math.round(38 + (avg - 1) * 13 + (h % 9))));
  const number = 1 + (hash(`${iso}:${s.slug}:n`) % 49);
  const [colorName, colorHex] = COLORS[s.element][hash(`${iso}:${s.slug}:c`) % 5];
  return { percent, number, colorName, colorHex };
}

export function luckHtml(l) {
  return `<dl class="lucky">
  <div><dt>Τύχη ημέρας</dt><dd class="num">${l.percent}%</dd><div class="luckbar" aria-hidden="true"><i style="width:${l.percent}%"></i></div></div>
  <div><dt>Τυχερός αριθμός</dt><dd class="num">${l.number}</dd></div>
  <div><dt>Τυχερό χρώμα</dt><dd><span class="swatch" style="background:${l.colorHex}"></span>${esc(l.colorName)}</dd></div>
</dl>`;
}
