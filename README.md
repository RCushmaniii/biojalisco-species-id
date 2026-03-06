# BioJalisco Species Identifier

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![GPT-4o](https://img.shields.io/badge/GPT--4o-Vision-412991?logo=openai)
![Neon](https://img.shields.io/badge/Neon-Postgres-00e599?logo=postgresql)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)

> AI-powered species identification for Jalisco biodiversity research. Point your camera at any living thing and get a detailed identification in seconds.

## Overview

BioJalisco Species Identifier is a field research tool built for Dr. Veronica Rosas and her conservation biology team in Jalisco, Mexico. Researchers photograph any organism -- plant, animal, insect, or fungus -- and the app returns a comprehensive identification including taxonomy, ecology, geographic range, conservation status, and similar species.

The app uses GPT-4o Vision for identification, producing bilingual results (English/Spanish) with confidence scoring. All observations persist to a database with geotagged photos, building a searchable record of the team's fieldwork.

This is the productionized version of a successful proof-of-concept that demonstrated AI-assisted species identification during the Atlas de Biodiversidad de Jalisco pitch.

## The Challenge

Conservation biologists working in Jalisco face a practical identification bottleneck. Field teams encounter thousands of species across diverse ecosystems, and traditional identification requires reference materials, expert consultation, or lab work -- all of which slow down data collection.

The existing proof-of-concept (Flask + vanilla HTML) proved the concept works, but lacked persistence, authentication, and the reliability needed for real fieldwork. Observations were lost on page refresh, there was no way to review past identifications, and no access control for the research team.

## The Solution

A production-grade web app that preserves everything researchers valued about the PoC -- the dark-themed UI, bilingual support, comprehensive species cards -- while adding the infrastructure needed for real use:

**Persistent observations** -- Every identification is stored in Neon Postgres with the original photo in Vercel Blob storage, geotagged with GPS coordinates from the device.

**Invite-only access** -- Clerk authentication with sign-up disabled. Only authorized researchers can access the tool, with Veronica's team added manually.

**Faithful AI identification** -- The GPT-4o system prompt is ported character-for-character from the proven PoC. It identifies all living organisms (wild and domestic) with structured JSON output covering taxonomy, ecology, geography, and conservation.

## Technical Highlights

- **GPT-4o Vision integration** with a carefully tuned system prompt that returns structured JSON across 8 data categories
- **Image pipeline**: client capture -> base64 -> sharp compression (~1MB JPEG) -> Vercel Blob storage -> GPT-4o analysis
- **Single-table schema** with JSONB columns for flexible nested data (taxonomy, ecology, geography, conservation) -- avoids premature normalization
- **Lazy service initialization** -- database and OpenAI clients initialize on first use, not at import time, enabling builds without env vars
- **Bilingual throughout** -- React context-based EN/ES toggle affects all UI text and species descriptions
- **CSS ported from PoC** -- 200+ lines of carefully tuned dark theme CSS variables, no Tailwind, preserving the proven look and feel

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm
- Clerk account (for authentication)
- Neon account (for Postgres database)
- OpenAI API key (with GPT-4o access)
- Vercel account (for Blob storage and deployment)

### Installation

```powershell
git clone https://github.com/RCushmaniii/biojalisco-species-id.git
cd biojalisco-species-id
pnpm install
```

### Environment Variables

Copy the example file and fill in your values:

```powershell
cp .env.local.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Sign-in route (`/sign-in`) |
| `DATABASE_URL` | Neon Postgres connection string |
| `OPENAI_API_KEY` | OpenAI API key with GPT-4o access |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob read/write token |

After setting `DATABASE_URL`, push the schema:

```powershell
pnpm db:push
```

Then start the dev server:

```powershell
pnpm dev
```

## Project Structure

```
biojalisco-species-id/
├── app/
│   ├── layout.tsx                       # Root layout (Clerk + Language providers)
│   ├── globals.css                      # Dark theme CSS (ported from PoC)
│   ├── sign-in/[[...sign-in]]/          # Clerk sign-in page
│   ├── (protected)/                     # Auth-required routes
│   │   ├── page.tsx                     # Dashboard (observation list)
│   │   ├── identify/page.tsx            # Camera/upload + AI identification
│   │   └── observations/[id]/page.tsx   # Single observation detail
│   └── api/
│       ├── identify/route.ts            # POST: image -> Blob + GPT-4o -> DB
│       ├── observations/route.ts        # GET: list user observations
│       └── observations/[id]/route.ts   # GET + DELETE single observation
├── components/
│   ├── capture-area.tsx                 # Camera/upload with preview
│   ├── confidence-gauge.tsx             # SVG circular gauge
│   ├── result-tabs.tsx                  # Tabbed result container
│   ├── tab-panels/                      # 6 result panels
│   ├── observation-card.tsx             # Dashboard list item
│   └── observation-detail.tsx           # Full observation view
├── lib/
│   ├── db/schema.ts                     # Drizzle schema
│   ├── db/index.ts                      # Neon + Drizzle client
│   ├── openai.ts                        # GPT-4o integration
│   ├── blob.ts                          # Vercel Blob upload/delete
│   └── auth.ts                          # Clerk helpers
├── contexts/language-context.tsx         # EN/ES toggle context
├── hooks/                               # useLanguage, useGeolocation
└── middleware.ts                         # Clerk route protection
```

## Deployment

The app deploys to Vercel via GitHub integration:

1. Connect the repo to Vercel
2. Set all environment variables in Vercel project settings
3. Push to `main` -- Vercel builds and deploys automatically

Vercel Pro is recommended due to GPT-4o response latency (5-15s per identification). The free tier's 10s function timeout may not be sufficient.

## Security

- [x] Clerk authentication on all routes except `/sign-in`
- [x] Sign-up disabled -- invite-only access via Clerk dashboard
- [x] All database queries scoped to authenticated user ID
- [x] Observation delete verifies user ownership before removal
- [x] No secrets in client bundle -- all API keys server-side only
- [x] Image data discarded server-side after Blob upload

## Results

This is a Phase 1 MVP built for a team of 3-5 researchers. Success is measured by whether the team actually uses it in the field.

| Metric | Target |
|--------|--------|
| Identification latency | < 15s (GPT-4o dependent) |
| Image compression | < 1MB per photo (sharp) |
| Supported organisms | All -- wild, domestic, plant, animal, insect, fungus |
| Languages | English + Spanish (bilingual toggle) |
| Mobile support | Responsive web with native camera capture |

## Contact

**Robert Cushman**
Business Solution Architect & Full-Stack Developer
Guadalajara, Mexico

info@cushlabs.ai
[GitHub](https://github.com/RCushmaniii) | [LinkedIn](https://linkedin.com/in/robertcushman) | [Portfolio](https://cushlabs.ai)

## License

(c) 2026 Robert Cushman. All rights reserved.

---

*Last Updated: 2026-03-06*
