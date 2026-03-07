# CLAUDE.md -- BioJalisco Species Identifier

## Project Overview
AI-powered species identification web app for Jalisco biodiversity research. Built for Dr. Veronica Rosas and her conservation biology team. Uses a three-API pipeline: iNaturalist (regional species context) + GPT-4o Vision (visual identification) + GBIF (verified taxonomy and conservation data). Deployed and working on Vercel.

## Tech Stack
- **Framework**: Next.js 15 (App Router) + TypeScript
- **Auth**: Clerk (invite-only, sign-up disabled) -- optional, app works without it
- **Database**: Neon Postgres + Drizzle ORM 0.38 -- optional, observations persist only when configured
- **Storage**: Vercel Blob (image uploads, compressed with sharp)
- **AI**: OpenAI GPT-4o Vision (identification + bilingual descriptions)
- **Data APIs**: iNaturalist public API (regional species context), GBIF (verified taxonomy/IUCN/distributions)
- **Deploy**: Vercel (GitHub integration) -- biojalisco-species-id.vercel.app
- **Package Manager**: pnpm
- **Styling**: CSS variables + DM Sans/Playfair Display/Cormorant Garamond (NO Tailwind)

## Project Structure
- `app/` -- Next.js App Router pages and API routes
- `app/(protected)/` -- Auth-required pages (dashboard, identify, observation detail)
- `app/api/identify/route.ts` -- Main identification pipeline (iNat + GPT-4o + GBIF)
- `components/` -- React components (hero, capture area, result tabs)
- `components/tab-panels/` -- 6 result panels (overview, taxonomy, ecology, geography, conservation, similar)
- `lib/openai.ts` -- GPT-4o Vision integration with system prompt
- `lib/inaturalist.ts` -- iNaturalist regional species context
- `lib/gbif.ts` -- GBIF enrichment (verified taxonomy, IUCN, distributions)
- `lib/db/schema.ts` -- Single `observations` table with JSONB columns
- `lib/types.ts` -- All TypeScript interfaces including GBIFData
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
3. **GBIF** -- matches the scientific name via `/v1/species/match`, then fetches verified IUCN status, distributions, and vernacular names in parallel. Overlays verified data onto AI response.

All three APIs are best-effort with timeouts. If iNat or GBIF are slow/down, identification still works with AI-only data.

## Key Patterns & Conventions
- **No Tailwind** -- all styling via CSS variables in `globals.css`. Dark theme with glass-morphism cards, gold accents, pill buttons.
- **System prompt** -- `lib/openai.ts` contains the GPT-4o system prompt. It's been tuned for geographic context awareness (prioritizes Neotropical fauna when GPS indicates Mexico).
- **Graceful degradation** -- App works with just OPENAI_API_KEY. Auth (Clerk), persistence (Neon + Blob), and enrichment (iNat + GBIF) are all optional layers.
- **Lazy service init** -- `lib/db/index.ts` and `lib/openai.ts` use lazy initialization so builds succeed without env vars.
- **Server components for data** -- Dashboard and observation detail are server components. Identify page is a client component (camera access).
- **Bilingual** -- `LanguageContext` provides `lang`, `setLang`, and `t(en, es)` helper throughout the app.
- **Grid-stacked tab panels** -- All tab panels occupy the same CSS grid cell (grid-row: 1, grid-column: 1). Container height = tallest panel. Switching tabs toggles visibility, never changes layout height.
- **Sticky tab bar** -- Tab navigation sticks to top of viewport when scrolling long panel content.

## Current Focus
Phase 1 complete and deployed. Core identification pipeline working (iNat + GPT-4o + GBIF). Next priorities:
- Set up Clerk for invite-only auth
- Set up Neon database + `pnpm db:push` for persistent observations
- Set up Vercel Blob for image storage
- Consider iNaturalist CV API access for direct species identification (requires fee-based arrangement with iNat staff)

## Known Issues
- Vercel free tier has 10s function timeout; full pipeline (iNat + GPT-4o + GBIF) can take 8-20s. Vercel Pro recommended.
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
