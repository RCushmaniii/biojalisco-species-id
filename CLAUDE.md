# CLAUDE.md -- BioJalisco Species Identifier

## Project Overview
AI-powered species identification web app for Jalisco biodiversity research. Built for Dr. Veronica Rosas and her conservation biology team. Uses a four-API pipeline: iNaturalist (regional species context) + GPT-4o Vision (visual identification) + GBIF (verified taxonomy and conservation data) + EncicloVida/CONABIO (Mexico-specific endemic status, NOM-059 protection, indigenous names). Deployed and working on Vercel.

## Tech Stack
- **Framework**: Next.js 15 (App Router) + TypeScript
- **Auth**: Clerk (invite-only, sign-up disabled) -- optional, app works without it
- **Database**: Neon Postgres + Drizzle ORM 0.38 -- optional, observations persist only when configured
- **Storage**: Vercel Blob (image uploads, compressed with sharp)
- **AI**: OpenAI GPT-4o Vision (identification + bilingual descriptions)
- **Data APIs**: iNaturalist public API (regional species context), GBIF (verified taxonomy/IUCN/distributions), EncicloVida/CONABIO (Mexico endemic status, NOM-059, indigenous names)
- **Deploy**: Vercel (GitHub integration) -- biojalisco-species-id.vercel.app
- **Package Manager**: pnpm
- **Styling**: CSS variables + DM Sans/Playfair Display/Cormorant Garamond (NO Tailwind)

## Project Structure
- `app/page.tsx` -- Public home page (onboarding, mission, pipeline, academic foundation)
- `app/faq/page.tsx` -- Public FAQ page (10 bilingual Q&A items)
- `app/(protected)/page.tsx` -- Redirects to /dashboard
- `app/(protected)/dashboard/page.tsx` -- Dashboard (stats, observation history, contribution banner)
- `app/(protected)/identify/page.tsx` -- Camera/upload + AI identification
- `app/(protected)/observations/[id]/page.tsx` -- Single observation detail
- `app/sign-in/[[...sign-in]]/page.tsx` -- Clerk sign-in page
- `app/api/identify/route.ts` -- Main identification pipeline (iNat + GPT-4o + GBIF + EncicloVida)
- `app/api/observations/route.ts` -- Observation list API
- `app/api/observations/[id]/route.ts` -- Single observation API (GET, DELETE)
- `components/` -- React components (onboarding-section, dashboard-stats, contribution-banner, site-footer, nav-links, capture-area, result-tabs, observation-list, observation-card, observation-detail, icons, etc.)
- `components/tab-panels/` -- 6 result panels (overview, taxonomy, ecology, geography, conservation, similar)
- `lib/openai.ts` -- GPT-4o Vision integration with system prompt
- `lib/inaturalist.ts` -- iNaturalist regional species context
- `lib/gbif.ts` -- GBIF enrichment (verified taxonomy, IUCN, distributions)
- `lib/enciclovida.ts` -- EncicloVida/CONABIO enrichment (endemic status, NOM-059, indigenous names, Wikipedia)
- `lib/db/schema.ts` -- Single `observations` table with JSONB columns
- `lib/types.ts` -- All TypeScript interfaces including GBIFData, EncicloVidaData
- `docs/` -- Project documentation (API.md, ARCHITECTURE.md, FEATURES.md, FUNDING.md, ROADMAP.md)
- `contexts/` -- React contexts (language EN/ES)
- `hooks/` -- Custom hooks (useLanguage, useGeolocation)
- `public/images/` -- Species illustrations (motmot, bearded lizard)

## Development Commands
```powershell
pnpm install      # Install dependencies
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm db:push      # Push schema to Neon (requires DATABASE_URL)
pnpm db:studio    # Open Drizzle Studio
```

## Identification Pipeline
The `/api/identify` route runs this sequence:
1. **iNaturalist** -- queries `/v1/observations/species_counts` near GPS coords for vertebrate species list (50km radius, research-grade). Feeds this as "regional field guide" context to GPT-4o.
2. **GPT-4o Vision** -- identifies the species from the photo + location + species context. Returns structured JSON with taxonomy, ecology, geography, conservation, similar species, bilingual descriptions.
3. **GBIF + EncicloVida** (parallel via `Promise.allSettled()`) -- GBIF matches the scientific name via `/v1/species/match`, fetches verified IUCN status, distributions, and vernacular names. EncicloVida (`api.enciclovida.mx`) provides Mexico-specific data: endemic/native/exotic classification, NOM-059-SEMARNAT protection status, Spanish common names, indigenous language names, Wikipedia summaries, and CONABIO-verified photos.

All four APIs are best-effort with independent timeouts. If any external API is slow/down, identification still works with AI-only data.

## Key Patterns & Conventions
- **No Tailwind** -- all styling via CSS variables in `globals.css`. Dark theme with glass-morphism cards, gold accents, pill buttons.
- **System prompt** -- `lib/openai.ts` contains the GPT-4o system prompt. It's been tuned for geographic context awareness (prioritizes Neotropical fauna when GPS indicates Mexico).
- **Graceful degradation** -- App works with just OPENAI_API_KEY. Auth (Clerk), persistence (Neon + Blob), and enrichment (iNat + GBIF + EncicloVida) are all optional layers.
- **Lazy service init** -- `lib/db/index.ts` and `lib/openai.ts` use lazy initialization so builds succeed without env vars.
- **Server components for data** -- Dashboard and observation detail are server components. Identify page is a client component (camera access).
- **Bilingual** -- `LanguageContext` provides `lang`, `setLang`, and `t(en, es)` helper throughout the app.
- **Grid-stacked tab panels** -- All tab panels occupy the same CSS grid cell (grid-row: 1, grid-column: 1). Container height = tallest panel. Switching tabs toggles visibility, never changes layout height.
- **Sticky tab bar** -- Tab navigation sticks to top of viewport when scrolling long panel content.
- **Two content widths** -- 1200px for home/dashboard/FAQ, 780px for identify/observation detail.
- **Public vs protected nav** -- Public pages (/, /faq) have inline nav; protected pages use shared layout with NavLinks component.
- **SiteFooter** -- Data sources (GBIF, iNaturalist, EncicloVida) and partners (UdeG, CONABIO).
- **Blob storage** -- Public access (URLs are unguessable random strings, app access gated by Clerk auth).

## Current Focus
Phase 1 complete. Four-API pipeline, Clerk auth, Neon database, Vercel Blob storage all deployed and working. Page structure: public home + FAQ, authenticated dashboard + identify + observation detail. Current priorities:
- Mobile polish
- Documentation updates
- Production testing

## Known Issues
- Vercel free tier has 10s function timeout; full pipeline (iNat + GPT-4o + GBIF + EncicloVida) can take 8-20s. Vercel Pro recommended.
- iNaturalist CV API is NOT publicly available (fee-based access only). We use their public observations API for species context instead.
- No offline support -- requires network for identification.
- No image cropping/rotation UI -- relies on device camera orientation.

## Environment Setup
Copy `.env.local.example` to `.env.local`. Only `OPENAI_API_KEY` is required for basic operation.

| Variable | Required | Source |
|----------|----------|--------|
| `OPENAI_API_KEY` | Yes | OpenAI platform |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | No | Clerk dashboard |
| `CLERK_SECRET_KEY` | No | Clerk dashboard |
| `DATABASE_URL` | No | Neon dashboard |
| `BLOB_READ_WRITE_TOKEN` | No | Vercel project settings > Storage |
