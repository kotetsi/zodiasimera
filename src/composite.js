// Σύνθετος χάρτης (composite) με τη μέθοδο των μεσοσημείων.
//
// Κάθε σύνθετη θέση είναι το μεσοσημείο των δύο αντίστοιχων θέσεων (π.χ. Ήλιος Α + Ήλιος Β)
// πάνω στο ΣΥΝΤΟΜΟΤΕΡΟ τόξο του κύκλου. Έτσι 350° και 10° δίνουν 0°, όχι 180°.
//
// Ακριβής αντίθεση (τόξο ακριβώς 180°): τα δύο υποψήφια μεσοσημεία απέχουν εξίσου και το
// «συντομότερο τόξο» δεν ορίζεται. Κανόνας: παίρνουμε τον αριθμητικό μέσο όρο των δύο μηκών
// στην κλίμακα 0–360° ((α+β)/2). Ο κανόνας είναι ντετερμινιστικός και συμμετρικός (δεν αλλάζει
// αν αντιστρέψουμε τα πρόσωπα Α και Β). Επειδή κοντά στις 180° ένα κλάσμα μοίρας αλλάζει το
// μεσοσημείο κατά 180°, κάθε θέση με τόξο πάνω από 178° σημειώνεται ως «ευαίσθητη».
//
// Ωροσκόπος και οίκοι (μόνο όταν είναι γνωστές ΚΑΙ οι δύο ώρες γέννησης): μέθοδος «παράγωγου
// ωροσκόπου» (R. Hand, Planets in Composite): σύνθετο μεσουράνημα = μεσοσημείο των δύο
// μεσουρανημάτων· από αυτό βρίσκουμε τον αστρικό χρόνο (RAMC) και υπολογίζουμε ωροσκόπο και
// οίκους Placidus για γεωγραφικό πλάτος = μέσος όρος των πλατών των δύο τόπων γέννησης.
// Το μεσοσημείο των δύο ωροσκόπων ΔΕΝ χρησιμοποιείται, γιατί μπορεί να βγει ασύμβατο με το
// μεσουράνημα (π.χ. ωροσκόπος πάνω από τον ορίζοντα).
import { aspectsBetween } from './ephemeris.js';
import { placidusFromRamc, lonToRa, obliquityAt, houseOf } from './natal.js';

const norm = (x) => ((x % 360) + 360) % 360;

// Υπογεγραμμένη απόσταση β − α στο (−180, 180]
export const signedArc = (a, b) => { let d = norm(b - a); if (d > 180) d -= 360; return d; };

export function midpoint(a, b) {
  const d = signedArc(a, b);
  if (Math.abs(Math.abs(d) - 180) < 1e-9) return { lon: norm((norm(a) + norm(b)) / 2), arc: 180, ambiguous: true };
  return { lon: norm(a + d / 2), arc: Math.abs(d), ambiguous: Math.abs(d) > 178 };
}

export const COMPOSITE_BODIES = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'node'];
const ASPECT_BODIES = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

// chartA/B: αποτέλεσμα natalChart. latA/latB: γεωγραφικά πλάτη των τόπων γέννησης.
export function compositeChart(chartA, chartB, latA, latB) {
  const pos = {};
  for (const b of COMPOSITE_BODIES) {
    const m = midpoint(chartA.pos[b].lon, chartB.pos[b].lon);
    pos[b] = { lon: m.lon, sign: Math.floor(m.lon / 30), deg: m.lon % 30, retro: false, arc: m.arc, ambiguous: m.ambiguous,
      from: [chartA.pos[b].lon, chartB.pos[b].lon] };
  }

  // Αβεβαιότητα από άγνωστη ώρα: οι θέσεις υπολογίζονται για το μεσημέρι.
  // Η Σελήνη κινείται έως ~15°/ημέρα, άρα ±7,5° στο ένα πρόσωπο → ±3,75° στο μεσοσημείο ανά πρόσωπο.
  const unknown = [!chartA.timeKnown, !chartB.timeKnown].filter(Boolean).length;
  const uncertainty = { moon: 3.75 * unknown, mercury: 0.5 * unknown, sun: 0.25 * unknown, venus: 0.3 * unknown, mars: 0.2 * unknown };

  let houses = null;
  if (chartA.houses && chartB.houses) {
    const mc = midpoint(chartA.houses.mc, chartB.houses.mc).lon;
    const eps = (obliquityAt(chartA.date) + obliquityAt(chartB.date)) / 2;
    const lat = (latA + latB) / 2;
    const ramc = lonToRa(mc, eps);
    houses = placidusFromRamc(ramc, eps, lat);
    if (houses) houses.lat = lat;
    for (const b of COMPOSITE_BODIES) pos[b].house = houses ? houseOf(pos[b].lon, houses.cusps) : null;
  }

  const aspects = aspectsBetween(pos, ASPECT_BODIES, 1)
    .filter((a) => ['sun', 'moon'].includes(a.a) || ['sun', 'moon'].includes(a.b) || a.orb <= 6)
    .map((a) => ({ ...a, uncertain: (uncertainty[a.a] || 0) + (uncertainty[a.b] || 0) >= 1 }));

  return { pos, houses, aspects, unknown, uncertainty };
}
