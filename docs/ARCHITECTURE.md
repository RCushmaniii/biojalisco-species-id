# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Client (Next.js App Router)                                    │
│                                                                 │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────────────┐ │
│  │  Hero /   │  │ Capture Area │  │  Result Tabs (6 panels)   │ │
│  │  Landing  │  │ Camera/Upload│  │  Grid-stacked, sticky nav │ │
│  └──────────┘  └──────┬───────┘  └───────────────────────────┘ │
│                       │                                         │
│              base64 image + GPS                                 │
│                       │                                         │
└───────────────────────┼─────────────────────────────────────────┘
                        │
                  POST /api/identify
                        │
┌───────────────────────▼─────────────────────────────────────────┐
│  API Route (app/api/identify/route.ts)                          │
│                                                                 │
│  Step 1: iNaturalist ─── Regional species context (50km)        │
│              │                                                  │
│  Step 2: GPT-4o Vision ─ Visual ID + regional context           │
│              │                                                  │
│  Step 3: ┌───┴───┐                                              │
│           │       │                                             │
│         GBIF   EncicloVida ─── Parallel enrichment              │
│           │       │            (Promise.allSettled)              │
│           └───┬───┘                                             │
│               │                                                 │
│  Step 4: Persist (optional) ── Clerk + Neon + Blob              │
│               │                                                 │
│          JSON Response                                          │
└─────────────────────────────────────────────────────────────────┘
```

## Identification Pipeline

The pipeline runs in strict sequence, except Steps 3a and 3b which run in parallel.

### Step 1: iNaturalist Regional Context

**File:** `lib/inaturalist.ts`

- Queries `/v1/observations/species_counts` near GPS coordinates
- 50km radius, vertebrates only, research-grade observations
- Returns species list formatted as a "regional field guide" string
- **Requires:** GPS latitude + longitude
- **Skipped when:** No GPS coordinates provided
- **Failure mode:** Silent skip; pipeline continues without regional context

### Step 2: GPT-4o Vision Identification

**File:** `lib/openai.ts`

- Sends base64 image + GPS coordinates + regional species list to GPT-4o
- System prompt tuned for geographic context awareness (prioritizes Neotropical fauna when GPS indicates Mexico)
- Regional species list labeled as "supplementary" to prevent GPT-4o from treating it as a whitelist
- Returns structured JSON matching `IdentifySuccessResponse`
- **Requires:** OPENAI_API_KEY, base64 image
- **Failure mode:** Returns error response; pipeline stops

### Step 3a: GBIF Enrichment (Parallel)

**File:** `lib/gbif.ts`

- Matches scientific name via `/v1/species/match` (fuzzy matching)
- Fetches IUCN Red List status from species profile
- Retrieves verified distribution localities and vernacular names
- **Overwrites** AI-generated taxonomy with GBIF backbone data when matched
- **Overwrites** AI-generated IUCN status with verified status
- **Failure mode:** Silent skip; AI-generated taxonomy/conservation used as-is

### Step 3b: EncicloVida Enrichment (Parallel)

**File:** `lib/enciclovida.ts`

- Queries `api.enciclovida.mx` for Mexico-specific species data
- Returns endemic/native/exotic classification, NOM-059 status, indigenous names
- **Overwrites** AI-generated Spanish common name with CONABIO authoritative name
- **Failure mode:** Silent skip; no `enciclovida` field in response

### Step 4: Persistence (Optional)

**Files:** `lib/blob.ts`, `lib/db/index.ts`, `lib/db/schema.ts`

- Only runs when all three conditions met: authenticated user + DATABASE_URL + BLOB_READ_WRITE_TOKEN
- Compresses image via sharp -> uploads to Vercel Blob -> inserts observation row
- **Failure mode:** Logged error; identification still returned to client

## Graceful Degradation

The app is designed to work with minimal configuration and progressively enhance.

```
Minimum viable:
  OPENAI_API_KEY only
  → GPT-4o identification works (no regional context, no verification, no persistence)

+ GPS permission:
  → iNaturalist regional context activates (Step 1)

+ Internet (always needed, but external APIs are optional):
  → GBIF verification activates (Step 3a)
  → EncicloVida enrichment activates (Step 3b)

+ Clerk keys:
  → Authentication and route protection activate
  → User ID available for observation ownership

+ DATABASE_URL + BLOB_READ_WRITE_TOKEN:
  → Observations persist to Neon Postgres
  → Images stored in Vercel Blob
```

## Authentication

**File:** `middleware.ts`

- Clerk middleware activates only when `CLERK_SECRET_KEY` is present
- Without Clerk keys, middleware passes all requests through (no auth)
- Sign-up is disabled in Clerk dashboard (invite-only)
- All protected routes are under `app/(protected)/`
- Public route: `/sign-in`

## Frontend Architecture

### Page Types

| Page | Type | Location |
|------|------|----------|
| Landing / Hero | Server component | `app/(protected)/page.tsx` |
| Identify | Client component (camera access) | `app/(protected)/identify/page.tsx` |
| Observation detail | Server component | `app/(protected)/observations/[id]/page.tsx` |

### Tab Panel System

**File:** `components/result-tabs.tsx` + `components/tab-panels/`

All 6 tab panels (Overview, Taxonomy, Ecology, Geography, Conservation, Similar Species) are rendered simultaneously in the same CSS grid cell:

```css
.tab-panel {
  grid-row: 1;
  grid-column: 1;
}
```

- Container height = tallest panel (no layout jumping)
- Active panel shown via visibility/opacity toggle
- Tab bar sticks to viewport top on scroll

### Bilingual System

**File:** `contexts/language-context.tsx`

- `LanguageContext` provides `lang` (EN/ES), `setLang`, and `t(en, es)` helper
- All UI text and species descriptions available in both languages
- Language toggle persists in component state (not URL or cookie)

## Design System

- No Tailwind -- CSS variables in `globals.css`
- Glass-morphism cards: `backdrop-filter: blur()` with semi-transparent backgrounds
- Gold accent: `#F0C040`
- Background: `#0E0C08`
- Content max-width: `780px`
- Typography: DM Sans (body) + Playfair Display (headings) + Cormorant Garamond (accents)
- Scanning border animation on identification cards
- Pill-shaped buttons with hover transitions

## Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| **JSONB columns** | Taxonomy/ecology/geography/conservation stored as JSON. Avoids premature normalization; schema evolves without migrations. |
| **Lazy service init** | `lib/db/index.ts` and `lib/openai.ts` initialize clients on first call. Builds succeed without env vars. |
| **Promise.allSettled** | GBIF + EncicloVida run in parallel. Neither blocks the other; both are optional. |
| **No Tailwind** | Custom CSS variables for glass-morphism design system. Tailwind would fight the design language. |
| **Single observations table** | Research team of 3-5 people. No need for normalized tables until Phase 2 dashboards. |
| **Server-side only API keys** | All external API calls happen in the API route. No secrets in client bundle. |
| **Optional auth** | Clerk activates only when keys are present. App works as a standalone tool without it. |
