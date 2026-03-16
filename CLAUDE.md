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
- `app/page.tsx` -- Public home page (onboarding, mission, pipeline, testimonials, academic foundation)
- `app/faq/page.tsx` -- Public FAQ page (10 bilingual Q&A items)
- `app/terms/page.tsx` -- Terms of Use (10 sections)
- `app/privacy/page.tsx` -- Privacy Policy (11 sections)
- `app/species-guide/page.tsx` -- Protected species guide (20 Jalisco vertebrates, filterable)
- `app/observations/page.tsx` -- Public community observation gallery (masonry grid + lightbox)
- `app/observations/[id]/page.tsx` -- Public single observation detail
- `app/not-found.tsx` -- Custom 404 page
- `app/(protected)/page.tsx` -- Redirects to /dashboard
- `app/(protected)/dashboard/page.tsx` -- Dashboard (stats, observation history, contribution banner)
- `app/(protected)/identify/page.tsx` -- Camera/upload + AI identification
- `app/(protected)/review/page.tsx` -- Reviewer-only observation approval queue
- `app/sign-in/[[...sign-in]]/page.tsx` -- Clerk sign-in page
- `app/api/identify/route.ts` -- Main identification pipeline (iNat + GPT-4o + GBIF + EncicloVida)
- `app/api/observations/route.ts` -- Observation list API
- `app/api/observations/[id]/route.ts` -- Single observation API (GET, PATCH, DELETE)
- `app/api/review/route.ts` -- Review queue API (GET pending list, GET count)
- `app/api/review/[id]/route.ts` -- Review action API (PATCH: approve/reject/correct)
- `components/` -- React components (onboarding-section, testimonial-carousel, dashboard-stats, contribution-banner, public-nav, site-footer, nav-brand, nav-links, capture-area, result-tabs, gallery-lightbox, observation-list, observation-card, observation-detail, review-queue, theme-toggle, language-toggle, icons, pwa-register, etc.)
- `components/tab-panels/` -- 6 result panels (overview, taxonomy, ecology, geography, conservation, similar)
- `lib/openai.ts` -- GPT-4o Vision integration with system prompt (includes image_orientation)
- `lib/inaturalist.ts` -- iNaturalist regional species context
- `lib/gbif.ts` -- GBIF enrichment (verified taxonomy, IUCN, distributions)
- `lib/enciclovida.ts` -- EncicloVida/CONABIO enrichment (endemic status, NOM-059, indigenous names, Wikipedia)
- `lib/db/schema.ts` -- Single `observations` table with JSONB columns + featured + imageOrientation + approval workflow fields (status, reviewerNotes, reviewedBy, reviewedAt, originalAiIdentification)
- `lib/types.ts` -- All TypeScript interfaces including GBIFData, EncicloVidaData
- `lib/species-data.ts` -- Bilingual species data for 20 protected Jalisco vertebrates
- `docs/` -- Project documentation (API.md, ARCHITECTURE.md, FEATURES.md, FUNDING.md, ROADMAP.md, APPROVAL-WORKFLOW.md)
- `contexts/` -- React contexts (language EN/ES, theme dark/light)
- `hooks/` -- Custom hooks (useLanguage, useTheme, useGeolocation)
- `public/images/` -- Frog silhouette logo (logo.png)

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
- **No Tailwind** -- all styling via CSS variables in `globals.css`. Dark/light themes via `[data-theme="light"]` CSS variable swap.
- **System prompt** -- `lib/openai.ts` contains the GPT-4o system prompt. Tuned for geographic context awareness (prioritizes Neotropical fauna when GPS indicates Mexico). Also returns `image_orientation` based on subject composition.
- **Graceful degradation** -- App works with just OPENAI_API_KEY. Auth (Clerk), persistence (Neon + Blob), and enrichment (iNat + GBIF + EncicloVida) are all optional layers.
- **Lazy service init** -- `lib/db/index.ts` and `lib/openai.ts` use lazy initialization so builds succeed without env vars.
- **Server components for data** -- Dashboard, observation detail, and gallery are server components. Identify page is a client component (camera access).
- **Bilingual** -- `LanguageContext` provides `lang`, `setLang`, and `t(en, es)` helper throughout the app. Gallery lightbox fully bilingual.
- **Theme** -- `ThemeContext` provides dark/light toggle. Persists in localStorage, respects prefers-color-scheme.
- **Grid-stacked panels** -- Tab panels AND testimonial carousel use same CSS grid stacking technique (grid-row: 1, grid-column: 1). Container height = tallest item. Switching toggles opacity/visibility, never changes layout height.
- **Sticky tab bar** -- Tab navigation sticks to top of viewport when scrolling long panel content.
- **Two content widths** -- 1200px for home/dashboard/FAQ/gallery, 780px for identify/observation detail.
- **Navigation** -- Public pages use `PublicNav` component; protected pages use shared layout. Mobile hamburger drawer at < 768px. Logo always links to home.
- **Gallery layout** -- AI-driven orientation metadata determines grid cell sizing. Featured observations sort first. Click-outside-to-close lightbox.
- **Approval workflow** -- New observations save as `status: 'pending'`. Public gallery only shows `status: 'approved'`. Reviewer role set via Clerk `publicMetadata.role = 'reviewer'`. Review queue at `/review` with approve/reject/correct actions. Corrections snapshot original AI data to `originalAiIdentification` JSONB before overwriting. See `docs/APPROVAL-WORKFLOW.md` for full documentation.
- **Upload validation** -- JPEG/PNG/WebP/HEIC only, 20MB client + server limit, bilingual error feedback.
- **SiteFooter** -- Data sources (GBIF, iNaturalist, EncicloVida), partners (UdeG, CONABIO), legal links.
- **Blob storage** -- Public access (URLs are unguessable random strings, app access gated by Clerk auth).

## Current Focus
Phase 1 complete + PWA conversion + approval workflow. Four-API pipeline, Clerk auth, Neon database, Vercel Blob storage, community gallery, theme system, mobile nav, SEO, PWA all deployed. Current priorities:
- Deploy approval workflow schema migration (`pnpm db:push` + SQL to approve existing rows)
- Set reviewer role on Dr. Rosas's Clerk account
- Phase 2 planning (species dashboards, geographic heatmaps)
- Production testing with research team

## Known Issues
- Vercel free tier has 10s function timeout; full pipeline (iNat + GPT-4o + GBIF + EncicloVida) can take 8-20s. Vercel Pro recommended.
- iNaturalist CV API is NOT publicly available (fee-based access only). We use their public observations API for species context instead.
- No offline support -- requires network for identification.
- No image cropping/rotation UI -- relies on device camera orientation.
- Blob storage uses public access -- URLs are unguessable but technically accessible without auth.
- Observations page heading not yet bilingual (server component, would need client wrapper).

## Environment Setup
Copy `.env.local.example` to `.env.local`. Only `OPENAI_API_KEY` is required for basic operation.

| Variable | Required | Source |
|----------|----------|--------|
| `OPENAI_API_KEY` | Yes | OpenAI platform |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | No | Clerk dashboard |
| `CLERK_SECRET_KEY` | No | Clerk dashboard |
| `DATABASE_URL` | No | Neon dashboard |
| `BLOB_READ_WRITE_TOKEN` | No | Vercel project settings > Storage |
