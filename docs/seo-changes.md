# SEO updates

## Search metadata and content

- Titles use route-specific templates; the brand is appended only when the complete title fits 60 characters.
- Descriptions have a 155-character guard and short templates for the main search landing pages.
- The home H1 describes daily predictions, with a direct link to the sign selector.
- Weekly/monthly H1s describe the forecast period. Sign pages link directly to today, tomorrow and characteristics.
- The ascendant tool includes visible answers about missing birth times, birthplace and daylight saving time. Personal forecasts and synastry include static reading guidance without invented chart results.
- Compatibility pages link to the synastry tool and explain that scores are not probabilities.

## URL retention

Year forecasts, Mercury and full-moon pages are regenerated from 2026 onward, rather than dropped as the current year advances. `/arxeio/` links to retained years. The ephemeris keeps a permanent URL for every month from `config.archiveStart` through the next 11 months, with `/efimerida/` as its index.

Existing URLs are retained. The ephemeris index now links to the current month instead of duplicating its full table. No redirects or hosting configuration changes are needed.

## Dates and assets

The requested build date controls navigation, metadata and the featured year. Unknown publication dates are omitted from Article markup. Year/event articles no longer claim a daily edit. Static pages without a recorded modification date omit sitemap `lastmod`; rolling daily pages use their build date. The future day in the daily archive does not claim a future modification date.

Shared styles are served from `/assets/site.css` so browsers can reuse them between pages. The standalone preview keeps embedded styles. Navigation uses native disclosure controls with keyboard focus and a mobile layout.

## Verification

`npm test` builds 2026-11-09, 2026-12-31 and 2027-01-01. It checks metadata lengths, title uniqueness, one H1, canonical URLs, every rendered internal page link and fragment, sitemap membership/dates, JSON-LD parsing, JavaScript syntax, shared styles and retention of all URLs across those builds. A pull-request workflow runs the same checks on Node 22.

Browser checks cover the home page and navigation on desktop and a 390px viewport. Source files and metadata cannot establish real Core Web Vitals, indexed-page counts, query demand or ranking changes. Check the deployed domain and Search Console after publication. Existing image assets are unchanged.

## Remaining editorial decisions

Validate query priorities with Search Console before expanding compatibility and birthday content. Add the real editor's identity and primary calculation-validation sources only when supplied and verified. No author credentials, search volumes or performance improvements have been invented. FAQ sections are visible reader content; no new FAQ rich-result claims are made.
