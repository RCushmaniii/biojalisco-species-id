# BioJalisco Species Identifier

## Project Overview
AI-powered species identification web app for Jalisco biodiversity research. Built for Veronica Rosas and her small research team.

## Tech Stack
- **Framework**: Next.js 15 (App Router) + TypeScript
- **Auth**: Clerk (invite-only, no public sign-up)
- **Database**: Neon Postgres + Drizzle ORM
- **Storage**: Vercel Blob (image uploads)
- **AI**: OpenAI GPT-4o Vision
- **Deploy**: Vercel
- **Package Manager**: pnpm
- **Styling**: CSS variables + CSS Modules (NO Tailwind)

## Key Architecture Decisions
- Single `observations` table — identification data stored inline (1:1 in Phase 1)
- Images compressed with `sharp` before Blob upload (~1MB JPEG target)
- System prompt ported character-for-character from PoC — do NOT modify
- All routes behind Clerk auth except `/sign-in`

## File Structure
- `app/` — Next.js App Router pages and API routes
- `app/(protected)/` — Auth-required pages (dashboard, identify, observation detail)
- `app/api/` — API routes (identify, observations CRUD)
- `components/` — React components ported from PoC
- `components/tab-panels/` — 6 result tab panel components
- `lib/` — Server utilities (db, openai, blob, auth, types)
- `contexts/` — React contexts (language)
- `hooks/` — Custom hooks (language, geolocation)

## Environment Variables
See `.env.local.example` for required variables.

## Commands
- `pnpm dev` — Start dev server
- `pnpm build` — Production build
- `pnpm db:push` — Push schema to Neon
- `pnpm db:studio` — Open Drizzle Studio
