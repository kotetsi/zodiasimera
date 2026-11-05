// Ρυθμίσεις του site. Ό,τι μένει κενό απλώς δεν εμφανίζεται.
export default {
  siteName: 'Ζώδια Σήμερα',
  tagline: 'Ημερήσιες αστρολογικές προβλέψεις από τις πραγματικές θέσεις των πλανητών',
  // Πλήρες URL χωρίς / στο τέλος, π.χ. 'https://www.example.gr'. Χρειάζεται για sitemap και canonical.
  siteUrl: 'https://zodiasimera.com',
  // Google AdSense publisher ID, π.χ. 'ca-pub-1234567890123456'. Κενό = καμία διαφήμιση.
  adsenseClient: '',
  // Google Analytics 4 measurement ID, π.χ. 'G-XXXXXXX'. Κενό = χωρίς analytics.
  gaId: 'G-NMC44TGESS',
  // Υπεύθυνος του site (πολιτική απορρήτου, όροι, επικοινωνία)
  company: {
    name: 'SPORT FANATICS ΜΟΝΟΠΡΟΣΩΠΗ Ι.Κ.Ε.',
    address: 'Ξανθίππου 7, 155 61 Χολαργός, Αττική',
    email: 'info@zodiasimera.com',
  },
  // Προϊόντα/affiliate ανά ζώδιο: { krios: [{ title, url, note }] , ... }. Κενό = δεν εμφανίζεται ενότητα.
  products: {},
  // Σελίδα προϊόντος στο sellyourmerch.gr όπου ο πελάτης ανεβάζει το PNG του χάρτη (αφίσα/μπλουζάκι). Κενό = δεν εμφανίζεται.
  merchUrl: '',
  // MailerLite: το URL της φόρμας εγγραφής (π.χ. 'https://assets.mailerlite.com/jsonp/123/forms/456/subscribe'). Κενό = δεν εμφανίζεται.
  newsletterAction: '',
};
