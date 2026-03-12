# Astro Landing Rebuild Task

## Goal
Rebuild the current LocalPDF marketing site into a compact, high-clarity Astro landing architecture focused on:

- search visibility
- AI discoverability
- message clarity
- privacy trust
- product understanding
- conversion into the LocalPDF app

Important:

- Do not use `V6` in page naming or public-facing product naming.
- `V6` is an internal version reference only.
- Public brand name is `LocalPDF`.

## Core Product Positioning
LocalPDF is a privacy-first local PDF application.

Core message:

- edit, organize, convert, sign, and protect PDFs locally
- no upload workflow for sensitive documents
- local processing on the user's device
- product-first experience, not a loose directory of disconnected tools

Avoid:

- `Sanctuary`
- `Reference`
- inflated wording like `ultimate`, `revolutionary`, `AI-powered` unless technically essential

## Final Recommended Page Map
Build around these 14 pages.

### Core
1. `/`
2. `/faq`
3. `/security`
4. `/about`
5. `/privacy`
6. `/terms`
7. `/extension`

### Feature pages
8. `/features/edit-pdf`
9. `/features/merge-pdf`
10. `/features/ocr-pdf`
11. `/features/compress-pdf`
12. `/features/split-pdf`
13. `/features/sign-pdf`
14. `/features/convert-pdf`

## Consolidation Rules
Consolidate weak or overlapping pages into stronger canonical pages.

- `edit-text-pdf` + `add-text-pdf` -> `/features/edit-pdf`
- `pdf-to-word` + `word-to-pdf` + `images-to-pdf` + `pdf-to-images` -> `/features/convert-pdf`

Do not create separate landing pages in the first rebuild phase for:

- `protect-pdf`
- `flatten-pdf`
- `watermark-pdf`
- `rotate-pdf`
- `extract-pages-pdf`
- `extract-images-pdf`
- `organize-pdf`
- `tables-pdf`
- industry pages
- comparison pages
- blog expansion

These can exist later as secondary content only if supported by real search demand.

## Information Architecture Rules
Each page must have a clear canonical role.

- `/` = product/entity page
- `/features/edit-pdf` = editor intent
- `/features/merge-pdf` = merge intent
- `/features/ocr-pdf` = OCR intent
- `/features/compress-pdf` = compression intent
- `/features/split-pdf` = split intent
- `/features/sign-pdf` = sign intent
- `/features/convert-pdf` = conversion intent
- `/faq` and `/security` = trust + AI answer intent

## SEO Rules
- Use one brand consistently: `LocalPDF`
- Remove fake or risky schema signals:
  - fake ratings
  - fake reviews
  - merchant return policy for software pages
  - shipping data for software pages
- Do not inject `SoftwareApplication` schema globally into all pages
- Use page-type-aware schema only where valid
- Keep meta descriptions tight and CTR-oriented
- Avoid overlapping pages targeting the same intent
- Prefer directory-style URLs

## GEO Rules
- Make content factual, not decorative
- Add stable fact blocks:
  - what LocalPDF is
  - what it does
  - how local processing works
  - what data is and is not uploaded
  - where limitations exist
- `/faq` and `/security` are mandatory because they serve both users and answer engines
- `llm.txt` or `llms.txt` must be updated to match the final architecture and entity definition

## SMM Rules
- Build page-specific social cards
- Use proof-oriented messaging instead of abstract branding
- Primary hooks:
  - no uploads
  - local processing
  - privacy-first workflows
  - sensitive-document friendly

## Content Rules
- English is the source language
- Public copy must not mention internal version labels
- Avoid decorative sub-brands
- Every feature page should explain:
  - what the feature does
  - why local processing matters for this workflow
  - how it works
  - when to use it
  - CTA into app

## Localization Strategy
Localization is not phase 1 priority.

Rules:

- Keep English as the only canonical build target for the first rebuild phase
- Do not expand DE/JA while architecture and messaging are still changing
- Freeze current localized marketing expansion
- Remove or noindex low-quality localized pages if they are thin, broken, or mistranslated
- Only restore localization after the English architecture is stable

Localization relaunch criteria:

1. English page map is final
2. Metadata patterns are final
3. Brand system is final
4. Copy is reviewed manually
5. hreflang mapping is exact

When localization resumes:

- localize only the final 14-page architecture
- do not localize legacy page sprawl
- use native review, not raw machine output
- each localized page must map to an equivalent English canonical source

## Recommended Navigation
- Product
- Features
- Security
- FAQ
- About
- Extension

Do not expose a giant tools directory in primary navigation.

## Priority Execution Order
1. Fix brand and message consistency
2. Remove invalid schema and metadata debt
3. Replace current sprawling route set with the final compact route map
4. Rebuild homepage
5. Rebuild the 7 feature pages
6. Rebuild FAQ and Security pages
7. Revisit localization only after English is stable

## Success Criteria
- Clear product understanding in under 5 seconds
- Stronger trust and privacy credibility
- Fewer but stronger landing pages
- Better crawl clarity
- Better AI answer quality
- Cleaner maintenance model for future sessions
