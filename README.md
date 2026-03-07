# BioJalisco Species Identifier

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![GPT-4o](https://img.shields.io/badge/GPT--4o-Vision-412991?logo=openai)
![iNaturalist](https://img.shields.io/badge/iNaturalist-Data-74ac00?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PGNpcmNsZSBjeD0iOCIgY3k9IjgiIHI9IjgiIGZpbGw9IiM3NGFjMDAiLz48L3N2Zz4=)
![GBIF](https://img.shields.io/badge/GBIF-Verified-4e9a06)
![CONABIO](https://img.shields.io/badge/CONABIO-EncicloVida-00695c)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)

> AI-powered species identification for Jalisco biodiversity research. Four-API pipeline delivers verified taxonomy, IUCN status, Mexico-specific conservation data (NOM-059), and endemic classification in seconds.

## Overview

BioJalisco Species Identifier is a field research tool built for Dr. Veronica Rosas and her conservation biology team in Jalisco, Mexico. Researchers photograph any vertebrate animal and the app returns a comprehensive identification powered by a four-API pipeline:

1. **iNaturalist** provides regional species context -- what's actually been observed near the GPS coordinates
2. **GPT-4o Vision** identifies the species from the photo, informed by local species data
3. **GBIF** overlays verified taxonomy, IUCN Red List status, and authoritative distribution data
4. **EncicloVida (CONABIO)** adds Mexico-specific data: endemic/native/exotic classification, NOM-059-SEMARNAT protection status, indigenous language names, and Wikipedia summaries in Spanish

No other tool combines all four of these sources in a single identification flow. Results are bilingual (English/Spanish) with confidence scoring, presented in a tabbed interface covering taxonomy, ecology, geographic range, conservation status, and similar species.

## The Challenge

Conservation biologists working in Jalisco face a practical identification bottleneck. Field teams encounter thousands of species across diverse ecosystems, and traditional identification requires reference materials, expert consultation, or lab work -- all of which slow down data collection.

A proof-of-concept (Flask + vanilla HTML) proved AI-assisted identification works, but GPT-4o Vision alone frequently misidentifies species when it lacks geographic context. A European Adder looks like a Mexican Brown Snake in a photo, but only one of them exists in Mexico. Without regional awareness, AI vision models default to the most globally common lookalike.

## The Solution

**Four-API identification pipeline:**
Rather than relying on a single AI model, the app chains four independent data sources. iNaturalist's public observations API provides a "regional field guide" of species documented within 50km of the user's GPS coordinates. GPT-4o Vision performs the visual identification with this geographic context. GBIF validates the result with authoritative taxonomy, IUCN conservation status, and verified distribution data. EncicloVida (CONABIO) adds Mexico-specific enrichment -- endemic/native/exotic classification, NOM-059-SEMARNAT protection status, and common names in indigenous languages (Nahuatl, Maya, etc.).

**Verified data, not AI guesses:**
Taxonomy and IUCN Red List status come from GBIF's backbone taxonomy (Catalogue of Life, IUCN, ITIS). Endemic status and NOM-059 protection come from CONABIO's authoritative catalog. The app shows "Verified" badges so researchers know which data is authoritative vs. AI-generated.

**Bilingual by default:**
A language toggle switches all UI text and species descriptions between English and Spanish instantly. EncicloVida provides Wikipedia summaries in Spanish and CONABIO-verified common names.

**Graceful degradation:**
The app works with just an OpenAI API key. Authentication (Clerk), persistence (Neon + Blob), and enrichment (iNat + GBIF + EncicloVida) are optional layers that enhance the experience when configured.

## Technical Highlights

- **Four-API pipeline**: iNaturalist (regional context) + GPT-4o Vision (identification) + GBIF (verification) + EncicloVida (Mexico-specific data) -- each with independent timeouts and graceful fallbacks
- **Grid-stacked tab panels**: All 6 content panels occupy the same CSS grid cell, so switching tabs never changes layout height -- eliminates the common tab-content jumping problem
- **Sticky tab navigation**: Tab bar pins to viewport top when scrolling long panel content
- **Image pipeline**: Client capture -> base64 -> sharp compression (~1MB JPEG) -> Vercel Blob storage -> GPT-4o analysis
- **JSONB schema design**: Single observations table with JSONB columns for taxonomy, ecology, geography, and conservation -- avoids premature normalization
- **Lazy initialization**: Database and OpenAI clients initialize on first use, enabling builds without environment variables
- **CushLabs design language**: Glass-morphism cards with backdrop-filter blur, gold accent system, scanning border animations, DM Sans + Playfair Display typography
- **Drag-and-drop upload**: Photo capture via camera, file picker, or drag-and-drop with visual feedback

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm
- OpenAI API key (with GPT-4o access)
- Optional: Clerk account, Neon account, Vercel account

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

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key with GPT-4o access |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | No | Clerk publishable key (enables auth) |
| `CLERK_SECRET_KEY` | No | Clerk secret key |
| `DATABASE_URL` | No | Neon Postgres connection string (enables persistence) |
| `BLOB_READ_WRITE_TOKEN` | No | Vercel Blob token (enables image storage) |

After setting `DATABASE_URL`, push the schema:

```powershell
pnpm db:push
```

Then start the dev server:

```powershell
pnpm dev
```

## Live Demo

**[biojalisco-species-id.vercel.app](https://biojalisco-species-id.vercel.app)**

Try it with:
- A photo of any bird, mammal, reptile, or amphibian
- Grant location permission for better regional accuracy
- Switch between English and Spanish with the language toggle

## Project Structure

```
biojalisco-species-id/
├── app/
│   ├── layout.tsx                       # Root layout (Clerk + Language providers)
│   ├── globals.css                      # Design system (glass cards, gold accents)
│   ├── icon.svg                         # Favicon (golden eye + viewfinder)
│   ├── (protected)/                     # Auth-required routes
│   │   ├── page.tsx                     # Dashboard (observation list)
│   │   ├── identify/page.tsx            # Camera/upload + AI identification
│   │   └── observations/[id]/page.tsx   # Single observation detail
│   └── api/
│       └── identify/route.ts            # POST: iNat + GPT-4o + GBIF + EncicloVida pipeline
├── components/
│   ├── hero-section.tsx                 # Landing page with species icons
│   ├── capture-area.tsx                 # Camera/upload/drag-drop with preview
│   ├── result-tabs.tsx                  # Grid-stacked tabbed results
│   └── tab-panels/                      # 6 result panels
├── lib/
│   ├── openai.ts                        # GPT-4o Vision integration
│   ├── inaturalist.ts                   # iNaturalist regional species API
│   ├── gbif.ts                          # GBIF enrichment (taxonomy, IUCN, range)
│   ├── enciclovida.ts                   # EncicloVida/CONABIO (endemic status, NOM-059)
│   ├── types.ts                         # All TypeScript interfaces
│   ├── db/                              # Neon + Drizzle (optional)
│   └── blob.ts                          # Vercel Blob upload/delete (optional)
├── contexts/language-context.tsx         # EN/ES toggle context
├── hooks/                               # useLanguage, useGeolocation
├── public/images/                        # Species illustrations
└── middleware.ts                         # Clerk route protection (optional)
```

## Deployment

The app deploys to Vercel via GitHub integration:

1. Connect the repo to Vercel
2. Set `OPENAI_API_KEY` in Vercel project settings (minimum required)
3. Push to `main` -- Vercel builds and deploys automatically

Vercel Pro is recommended. The full pipeline (iNat context + GPT-4o Vision + GBIF enrichment) can take 8-20 seconds, exceeding the free tier's 10-second function timeout.

## Security

- [x] Clerk authentication on all protected routes (when configured)
- [x] Sign-up disabled -- invite-only access via Clerk dashboard
- [x] All database queries scoped to authenticated user ID
- [x] Observation delete verifies user ownership before removal
- [x] No secrets in client bundle -- all API keys server-side only
- [x] Image data discarded server-side after Blob upload
- [x] External API calls (iNat, GBIF, EncicloVida) use timeouts and graceful degradation

## Results

| Metric | Value |
|--------|-------|
| Identification latency | 8-20s (full four-API pipeline) |
| Image compression | ~1MB per photo (sharp) |
| Supported organisms | Vertebrates: mammals, birds, reptiles, amphibians |
| Languages | English + Spanish (bilingual toggle) |
| Data sources | 4 APIs (iNaturalist, GPT-4o, GBIF, EncicloVida) |
| Verified data | Taxonomy, IUCN status (GBIF) + NOM-059, endemic status (CONABIO) |
| Regional context | 50km radius species observations (via iNaturalist) |
| Mexico-specific data | Endemic/native/exotic classification, NOM-059 protection (via CONABIO) |

## Contact

**Robert Cushman**
Business Solution Architect & Full-Stack Developer
Guadalajara, Mexico

info@cushlabs.ai
[GitHub](https://github.com/RCushmaniii) | [LinkedIn](https://linkedin.com/in/robertcushman) | [Portfolio](https://cushlabs.ai)

## License

(c) 2026 Robert Cushman. All rights reserved.

---

*Last Updated: 2026-03-07*
