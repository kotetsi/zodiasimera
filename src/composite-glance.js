// Επιλογή όψεων για τις κάρτες «Η σχέση σας με μια ματιά».
// Χρησιμοποιούνται ΜΟΝΟ όψεις που έχει ήδη υπολογίσει ο compositeChart.
//
// Σταθερός κανόνας όταν υπάρχουν πολλές σχετικές όψεις:
//   1. προτεραιότητα του ζεύγους πλανητών για το θέμα της κάρτας (σειρά στις λίστες παρακάτω)
//   2. όψεις με βέβαιες θέσεις πριν από τις ενδεικτικές (άγνωστη ώρα γέννησης)
//   3. μικρότερη απόκλιση από την ακριβή γωνία
//   4. (ισοπαλία) αλφαβητική σειρά του αναγνωριστικού της όψης
// Μια όψη δεν εμφανίζεται σε δύο κάρτες: οι «Σημεία τριβής» παραλείπουν όψη που ήδη πήρε
// άλλη κάρτα, αν υπάρχει εναλλακτική.
// Ο κανόνας δεν εξαρτάται από τη σειρά των προσώπων Α/Β, αφού τα κλειδιά ταξινομούνται.

const key = (a) => [a.a, a.b].sort().join('-');
const HARD = ['square', 'opposition'];

export const RULES = {
  // χημεία και οικειότητα: Αφροδίτη–Άρης πρώτα, μετά Πλούτωνας, μετά φωτεινοί με Αφροδίτη/Άρη
  attraction: {
    pairs: ['mars-venus', 'pluto-venus', 'mars-pluto', 'moon-venus', 'sun-venus', 'mars-moon', 'mars-sun', 'uranus-venus', 'neptune-venus', 'jupiter-venus', 'mars-uranus', 'mars-neptune', 'moon-pluto'],
    accept: () => true,
  },
  // επικοινωνία: όψεις του Ερμή, πρώτα με προσωπικούς πλανήτες
  communication: {
    pairs: ['mercury-moon', 'mercury-sun', 'mercury-venus', 'mars-mercury', 'mercury-saturn', 'jupiter-mercury', 'mercury-uranus', 'mercury-neptune', 'mercury-pluto'],
    accept: () => true,
  },
  // τριβή: μόνο τετράγωνα/αντιθέσεις, πρώτα του Άρη (διεκδίκηση) και της Σελήνης (αντίδραση)
  friction: {
    pairs: ['mars-moon', 'mars-sun', 'mars-venus', 'mars-mercury', 'mars-saturn', 'mars-pluto', 'mars-uranus', 'moon-saturn', 'moon-sun', 'moon-venus', 'mercury-moon', 'moon-pluto', 'moon-uranus', 'saturn-sun', 'saturn-venus', 'mercury-saturn', 'pluto-sun', 'pluto-venus', 'sun-uranus', 'uranus-venus', 'jupiter-mars', 'mars-neptune', 'moon-neptune', 'jupiter-moon'],
    accept: (a) => HARD.includes(a.aspect),
  },
};

export function pickAspect(aspects, card, exclude = []) {
  const r = RULES[card];
  const id = (a) => `${a.a}|${a.aspect}|${a.b}`;
  const cands = aspects.filter((a) => r.pairs.includes(key(a)) && r.accept(a));
  cands.sort((x, y) => r.pairs.indexOf(key(x)) - r.pairs.indexOf(key(y))
    || (x.uncertain ? 1 : 0) - (y.uncertain ? 1 : 0)
    || x.orb - y.orb
    || (id(x) < id(y) ? -1 : 1));
  const free = cands.filter((a) => !exclude.includes(a));
  return { pick: (free[0] || cands[0]) || null, count: cands.length };
}

export function glance(aspects) {
  const attraction = pickAspect(aspects, 'attraction');
  const communication = pickAspect(aspects, 'communication');
  const friction = pickAspect(aspects, 'friction', [attraction.pick, communication.pick].filter(Boolean));
  return { attraction, communication, friction };
}
