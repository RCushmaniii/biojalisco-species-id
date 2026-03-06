# CLAUDE.md -- BioJalisco Species Identifier

## Project Overview
AI-powered species identification web app for Jalisco biodiversity research. Built for Dr. Veronica Rosas and her small research team. Phase 1 MVP -- core identify flow, persistent observations, invite-only auth.

## Tech Stack
- **Framework**: Next.js 15.5 (App Router) + TypeScript 5.9
- **Auth**: Clerk (invite-only, sign-up disabled)
- **Database**: Neon Postgres + Drizzle ORM 0.38
- **Storage**: Vercel Blob (image uploads, compressed with sharp)
- **AI**: OpenAI GPT-4o Vision
- **Deploy**: Vercel (GitHub integration)
- **Package Manager**: pnpm
- **Styling**: CSS variables (NO Tailwind -- dark theme ported from PoC)

## Project Structure
- `app/` -- Next.js App Router pages and API routes
- `app/(protected)/` -- Auth-required pages (dashboard, identify, observation detail)
- `app/api/` -- API routes (identify, observations CRUD)
- `components/` -- React components ported from PoC
- `components/tab-panels/` -- 6 result panels (overview, taxonomy, ecology, geography, conservation, similar)
- `lib/` -- Server utilities (db, openai, blob, auth, types)
- `lib/db/schema.ts` -- Single `observations` table with JSONB columns
- `contexts/` -- React contexts (language EN/ES)
- `hooks/` -- Custom hooks (useLanguage, useGeolocation)
- `middleware.ts` -- Clerk route protection

## Development Commands
```powershell
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Production build
pnpm build

# Push database schema to Neon
pnpm db:push

# Open Drizzle Studio (DB browser)
pnpm db:studio
```

## Key Patterns & Conventions
- **No Tailwind** -- all styling via CSS variables in `globals.css`, ported from PoC
- **System prompt is sacred** -- `lib/openai.ts` contains the GPT-4o system prompt ported character-for-character from the PoC. Do NOT modify it.
- **Lazy service init** -- `lib/db/index.ts` and `lib/openai.ts` use lazy initialization so builds succeed without env vars
- **Server components for data** -- Dashboard and observation detail are server components (direct DB queries). Identify page is a client component (camera access).
- **Single table schema** -- `observations` table stores identification data inline via JSONB columns. No separate identifications table in Phase 1.
- **User scoping** -- All DB queries filter by Clerk `userId`. Observations belong to the authenticated user only.
- **Bilingual** -- `LanguageContext` provides `lang`, `setLang`, and `t(en, es)` helper throughout the app

## Current Focus
Phase 1 complete. Needs external service setup:
- Clerk app creation + API keys
- Neon database creation + `pnpm db:push`
- OpenAI API key
- Vercel Blob token
- Vercel deployment with env vars

## Known Issues
- Vercel free tier has 10s function timeout; GPT-4o vision can take 5-15s. Vercel Pro recommended.
- No offline support -- requires network for identification
- No image cropping/rotation UI -- relies on device camera orientation

## Environment Setup
Copy `.env.local.example` to `.env.local` and fill in:

| Variable | Source |
|----------|--------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk dashboard |
| `CLERK_SECRET_KEY` | Clerk dashboard |
| `DATABASE_URL` | Neon dashboard (connection string) |
| `OPENAI_API_KEY` | OpenAI platform |
| `BLOB_READ_WRITE_TOKEN` | Vercel project settings > Storage |
