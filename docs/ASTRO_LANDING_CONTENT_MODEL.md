# Astro Landing Content Model

## Purpose
This file is a working implementation spec for future sessions.

Use it together with:

- [ASTRO_LANDING_REBUILD_TASK.md](/Users/aleksejs/Desktop/LocalPDF_V6/docs/ASTRO_LANDING_REBUILD_TASK.md)

Goal:

- avoid repeating discovery from scratch
- keep one stable page architecture
- keep one stable content model
- make Astro implementation predictable

## Public Product Naming
- Brand: `LocalPDF`
- Product naming in public copy: `LocalPDF`
- Internal version labels like `V6` must not appear in public page titles, H1s, metadata, or schema

## Final Route Model

### Core pages
- `/`
- `/faq`
- `/security`
- `/about`
- `/privacy`
- `/terms`
- `/extension`

### Feature pages
- `/features/edit-pdf`
- `/features/merge-pdf`
- `/features/ocr-pdf`
- `/features/compress-pdf`
- `/features/split-pdf`
- `/features/sign-pdf`
- `/features/convert-pdf`

## Canonical Intent Map
- `/` -> product/entity intent
- `/faq` -> answer-engine + objection handling intent
- `/security` -> trust + technical validation intent
- `/about` -> company/product context intent
- `/extension` -> extension install intent
- `/features/edit-pdf` -> edit pdf intent
- `/features/merge-pdf` -> merge pdf intent
- `/features/ocr-pdf` -> ocr pdf intent
- `/features/compress-pdf` -> compress pdf intent
- `/features/split-pdf` -> split pdf intent
- `/features/sign-pdf` -> sign pdf intent
- `/features/convert-pdf` -> conversion intent

## Astro Structure Recommendation

### Suggested folders
- `website/src/pages/`
- `website/src/pages/features/`
- `website/src/components/marketing/`
- `website/src/layouts/`
- `website/src/content/marketing/`
- `website/src/content/config.ts`
- `website/src/lib/seo/`
- `website/src/lib/content/`
- `website/public/og/`

### Suggested content collections
- `marketingPages`
- `features`
- `faqs`

Optional later:
- `comparisons`
- `solutions`
- `blog`

## Content Collections Schema

### `marketingPages`
Use for:
- homepage blocks if content-driven
- FAQ
- Security
- About
- Extension

Recommended fields:
- `title`
- `metaTitle`
- `metaDescription`
- `description`
- `slug`
- `pageType`
- `hero`
- `sections`
- `schemaType`
- `cta`

### `features`
Use for:
- edit-pdf
- merge-pdf
- ocr-pdf
- compress-pdf
- split-pdf
- sign-pdf
- convert-pdf

Recommended fields:
- `title`
- `metaTitle`
- `metaDescription`
- `slug`
- `primaryKeyword`
- `secondaryKeywords`
- `hero`
- `capabilities`
- `useCases`
- `howItWorks`
- `faqIds`
- `relatedFeatures`
- `primaryCta`
- `proofPoints`
- `schemaType`

### `faqs`
Recommended fields:
- `id`
- `question`
- `answer`
- `category`
- `appliesTo`

## Required Page Templates

### 1. Product Page Template
Use for `/`

Sections:
1. Hero
2. Trust strip
3. Core capabilities
4. Why local processing matters
5. Studio/product proof
6. Use cases
7. FAQ preview
8. Final CTA

Primary CTA:
- `Open LocalPDF`

Secondary CTA:
- `See How It Works`

### 2. Feature Page Template
Use for all `/features/*`

Sections:
1. Hero
2. What this feature does
3. Why local matters for this workflow
4. Key capabilities
5. How it works
6. Real use cases
7. FAQ
8. Related features
9. Final CTA

### 3. Trust Page Template
Use for:
- `/faq`
- `/security`
- `/about`
- `/extension`

Sections vary, but all must be high-clarity and low-noise.

## Component Inventory
Build reusable components only for stable blocks.

Recommended:
- `SEOHead.astro`
- `MarketingLayout.astro`
- `SiteHeader.astro`
- `SiteFooter.astro`
- `HeroSection.astro`
- `TrustStrip.astro`
- `CapabilityGrid.astro`
- `ProofSection.astro`
- `HowItWorks.astro`
- `UseCaseList.astro`
- `FaqList.astro`
- `FinalCta.astro`
- `Breadcrumbs.astro`
- `SchemaBlock.astro`
- `OgImageFrame.astro`

Do not keep giant all-in-one page components like the current tool template.

## Metadata Rules

### Titles
Preferred patterns:
- `Private PDF editing that stays on your device | LocalPDF`
- `Merge PDF locally | LocalPDF`
- `OCR PDF locally | LocalPDF`

Avoid:
- `Sanctuary`
- `Reference`
- excessive punctuation
- exaggerated claims

### Meta descriptions
Target:
- 140-160 characters
- clear use case
- privacy angle only if relevant

Good pattern:
- action + local/privacy proof + product name

### Canonicals
- one canonical per route
- no duplicate route variants
- prefer directory-style route model

### H1
- one H1 per page
- must match page intent directly

## Schema Rules

### Allowed by page type
- Homepage: `WebSite`, optionally `Organization`
- Feature pages: `SoftwareApplication` only if accurate, otherwise simpler product page schema usage
- FAQ page: `FAQPage`
- Security/About: usually no forced product schema
- Breadcrumbs: `BreadcrumbList`
- Learn/blog later: `Article` or `BlogPosting`

### Forbidden
- fake ratings
- fake reviews
- fake reviewer names
- merchant return policy for SaaS/software landing pages
- shipping details for software landing pages
- global schema injected into every page

## Messaging Rules

### Core language to repeat consistently
- local PDF app
- privacy-first
- no upload workflow
- runs on your device
- sensitive documents
- edit, organize, convert, sign, protect

### Avoid
- `ultimate`
- `revolutionary`
- `sanctuary`
- `zero-knowledge` unless technically defended
- `AI-powered` unless there is direct, user-visible value and proof

## CTA Rules

Primary CTA sitewide:
- `Open LocalPDF`

Secondary CTA options:
- `See How It Works`
- `Read Security Details`
- `Install Extension`

Do not vary CTA language randomly page to page.

## Internal Linking Rules

Homepage should link to:
- edit
- merge
- ocr
- compress
- split
- sign
- convert
- faq
- security
- extension

Each feature page should link to:
- homepage
- faq
- security
- 2-3 related features

FAQ should link back into:
- relevant feature pages
- security
- privacy

## Localization Rules
Localization is phase 2, not phase 1.

Until English rebuild is stable:
- do not expand translated page count
- do not preserve legacy localization sprawl by default
- do not create new localized routes

When localization resumes:
- translate only the final route map
- every localized page must have a one-to-one English source page
- metadata must be manually reviewed
- hreflang must map equivalent pages only

## Suggested Build Order
1. Create new `MarketingLayout.astro`
2. Create `SEOHead.astro`
3. Create content collection schema
4. Build homepage from the new model
5. Build feature page template
6. Build the 7 feature pages
7. Build FAQ
8. Build Security
9. Build About
10. Build Extension
11. Review metadata and schema
12. Only then revisit localization

## Definition of Done
A page is complete only if:
- message is clear in first screen
- title/H1/meta are aligned
- schema is valid and minimal
- CTA is explicit
- internal links are intentional
- no decorative brand drift
- no fake trust signals

## Session Handoff Rule
In future sessions, do not restart from broad audit.

Start from:
1. `docs/ASTRO_LANDING_REBUILD_TASK.md`
2. `docs/ASTRO_LANDING_CONTENT_MODEL.md`

Then move directly into implementation work against the final 14-page architecture.
