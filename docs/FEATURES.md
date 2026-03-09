# BioJalisco Species Identifier -- Features & Differentiation

## Overview

**BioJalisco** is a field-ready species identification tool that combines AI vision with regional biodiversity databases to deliver **fast, geographically accurate, and scientifically verified species identifications for Mexico.**

Unlike most species identification tools that rely on either AI vision or community verification, BioJalisco integrates **four independent data systems** into a single automated identification pipeline. This combines the **speed of AI** with the **authority of scientific biodiversity databases**, producing results that are faster than community-based platforms and more reliable than standalone AI models.

To our knowledge, no current species identification platform integrates all four of these data sources within a single identification workflow.

---

## Who It's For

### Primary Users

Dr. Veronica Rosas and her conservation biology research team at the **University of Guadalajara**, conducting biodiversity surveys across Jalisco's ecosystems.

Typical use cases:

- Rapid field identification during biodiversity surveys
- Verification of visually similar species
- Access to conservation status during fieldwork
- Recording geotagged observations for later analysis

### Secondary Users

- Field biologists and naturalists
- Conservation researchers and environmental consultants
- Graduate students conducting ecological surveys in Mexico

---

## The Four-API Identification Pipeline

BioJalisco chains four independent data sources into a single identification workflow.

```
User Photo + GPS
       ↓
 ┌─────────────┐
 │ iNaturalist  │  Regional species filtering (50km radius)
 └──────┬──────┘
        ↓
 ┌─────────────┐
 │ GPT-4o      │  Visual classification + bilingual descriptions
 │ Vision      │
 └──────┬──────┘
        ↓
 ┌──────┴──────┐
 │             │
 ▼             ▼
┌──────┐  ┌──────────┐
│ GBIF │  │EncicloVida│  Parallel enrichment (Promise.allSettled)
└──┬───┘  └────┬─────┘
   │           │
   └─────┬─────┘
         ↓
  Enriched species profile
```

Each stage adds **context, verification, or regional data** to improve reliability.

---

## Accuracy Strategy

BioJalisco improves identification reliability through three complementary mechanisms:

### 1. Regional Species Filtering

The system queries species recorded near the observation location before visual classification, reducing the candidate species pool and preventing cross-continent misidentification.

### 2. AI Visual Classification

GPT-4o analyzes the image informed by the regional species list, identifying likely species from visual features within a geographically plausible set.

### 3. Authoritative Data Replacement

Taxonomy and conservation metadata from the AI are **replaced** with verified records from biodiversity databases (GBIF, CONABIO). The app visually distinguishes AI-generated content from verified data using badges.

This layered approach addresses the most common failure modes of standalone AI vision tools: geographic confusion, taxonomic hallucination, and unverified conservation status.

---

## The Four Data Sources

### 1. iNaturalist -- Regional Species Intelligence

Before the AI model analyzes the image, BioJalisco queries the **iNaturalist public API** for vertebrate species documented within **50 km of the user's GPS coordinates**. The resulting species list acts as a **regional field guide** that informs the visual classification step.

**Why this matters:** Without geographic context, visual AI models confuse species that look similar but occur on different continents. A gray snake with zigzag markings photographed in Jalisco could be misclassified as a European Adder by a model trained on global data. Regional filtering ensures the AI prioritizes **species documented in the local ecosystem**.

---

### 2. GPT-4o Vision -- Visual Identification and Descriptions

OpenAI's GPT-4o vision model performs the **initial visual classification**. It receives the user's image, the regional species list from iNaturalist, and structured prompting instructions tuned for Neotropical fauna.

It returns structured data including:

- Scientific name and common names (EN/ES)
- Habitat, diet, size, lifespan, behavior
- Similar species with distinguishing features
- Narrative descriptions and ecological facts

**Why this matters:** The AI enables species identification in seconds rather than the hours or days required for community verification. However, taxonomy and conservation data are **not trusted from AI alone** -- they are verified in later pipeline stages.

---

### 3. GBIF -- Global Verification Layer

The **Global Biodiversity Information Facility (GBIF)** provides authoritative biodiversity records aggregated from the Catalogue of Life, IUCN Red List, ITIS, museum collections, and national databases.

BioJalisco queries GBIF to retrieve verified taxonomy (7 Linnaean ranks), IUCN conservation status, known distribution records, and vernacular names.

**Why this matters:** AI models can generate incorrect taxonomy or conservation status. GBIF **replaces** these values with authoritative scientific records. The app marks verified fields with badges so users know which data is authoritative vs. AI-generated.

---

### 4. EncicloVida (CONABIO) -- Mexico's National Biodiversity Database

EncicloVida is the public biodiversity platform maintained by **CONABIO (Comision Nacional para el Conocimiento y Uso de la Biodiversidad)**. It provides Mexico-specific data unavailable in global systems:

- **Endemic / native / exotic classification**
- **NOM-059-SEMARNAT conservation status**
- **Authoritative Spanish common names**
- **Indigenous-language names** (Nahuatl, Maya, etc.)
- **Spanish Wikipedia summaries**
- **CONABIO-verified photos from NaturaLista**
- **SNIB specimen records and geodata**

**Why this matters:** A species may be listed as Least Concern globally yet still be protected under Mexico's NOM-059 conservation law. CONABIO data provides **policy-relevant conservation information** that global databases miss entirely.

---

## Feature Comparison

| Feature | BioJalisco | iNaturalist | EncicloVida | Google Lens |
|---|---|---|---|---|
| Instant AI identification | 10-20s | Community (hours-days) | No ID feature | ~2s |
| Regional species filtering before AI | Yes | Built-in observation context | No | No |
| Verified taxonomy | Yes (GBIF) | Community supplied | Partial | No |
| IUCN conservation status | Yes (verified) | Community supplied | Yes | No |
| NOM-059 Mexican protection status | Yes | No | Yes | No |
| Endemic / native / exotic classification | Yes | No | Yes | No |
| Bilingual English / Spanish | Yes | Partial | Spanish only | Auto-translate |
| Ecology and behavior descriptions | Yes | Community notes | Reference text | No |
| Narrative explanations | Yes | No | No | No |
| Persistent observations | Yes | Yes | No | No |
| GPS geotagging | Yes | Yes | No | No |
| Offline support | No | Partial (Seek app) | App only | No |
| Open biodiversity contributions | Planned | Yes | Yes | No |

---

## Key Features

### Bilingual by Default

All text is available in **both English and Spanish**: UI elements, species descriptions, ecological information, narrative explanations, fun facts, gallery lightbox content, and dates. A single toggle switches languages instantly across the entire app, including the observation gallery and lightbox viewer.

### Verified Data Badges

The interface clearly distinguishes **AI-generated content** from **verified scientific data**:

- "Taxonomy Verified by GBIF"
- "IUCN Status Verified"
- "CONABIO Source"
- "NOM-059-SEMARNAT Protection Status"

Each badge links directly to the source database for further research.

### Dark / Light Theme

Animated sun/moon toggle switches between dark field mode (reduces glare outdoors) and light mode (better readability in bright environments). Theme persists in localStorage and respects `prefers-color-scheme` on first visit. All glass-morphism cards, buttons, badges, and the logo adapt automatically via CSS variables.

### Community Observation Gallery

Public gallery page (`/observations`) displays all species identifications in a dense CSS grid masonry layout with:

- **AI-driven image orientation** -- GPT-4o analyzes subject composition (not pixel dimensions) and tags each image as `landscape` or `portrait`. Portrait subjects get tall grid cells; landscape subjects stay single-row. No more random modulo-based sizing.
- **Featured observations** -- Admin-flagged observations sort first, with a gold star badge. Featured + date sub-sort.
- **Lightbox viewer** -- Click any image for full-screen view with species info, nav arrows, keyboard shortcuts (Escape, arrow keys), and **click-outside-to-close** for users who don't see the X button.
- **IUCN status badges** -- Color-coded conservation status (LC/NT/VU/EN/CR) on every gallery cell.
- **Fully bilingual** -- Gallery cells, lightbox species names, descriptions, dates, and confidence labels all respect the language toggle.

### Testimonial Carousel

"Voices from the Field" section on the home page with 4 bilingual testimonials from researchers, students, and citizen scientists. Auto-advances every 7 seconds, pauses on hover, dot navigation. Uses CSS grid stacking (same technique as tab panels) to prevent layout height shifting between slides.

### Jalisco Protected Species Guide

Interactive reference page (`/species-guide`) with 20 protected vertebrate species from Jalisco, filterable by taxonomic group (mammals, birds, reptiles, amphibians). Shows NOM-059 status, IUCN status, and endemic classification for each species. Bilingual throughout.

### Upload Validation

Client-side file type allowlist (JPEG, PNG, WebP, HEIC only) with 20MB size limit and bilingual error messages. Rejects SVG, BMP, TIFF, and other formats that GPT-4o can't process well. Server enforces the same 20MB limit via base64 length validation.

### Admin Observation Management

`PATCH /api/observations/[id]` endpoint allows toggling `featured` status and overriding `imageOrientation` on any observation. Enables curation of the community gallery without direct database access.

### Graceful Degradation

Each external data source is optional. If a service is unavailable, identification continues with remaining sources.

**Minimum configuration:** OpenAI API key only.

| Dependency | Function |
|---|---|
| GPS permission | Enables regional species filtering |
| Internet connectivity | Allows GBIF and CONABIO enrichment |
| Clerk authentication | Invite-only user access |
| Neon database | Persistent observation storage |
| Blob storage | Image storage |

A single API failure never blocks the identification workflow.

### Designed for Field Use

- Dark/light theme toggle for different lighting conditions
- Large touch targets for mobile devices
- Mobile hamburger nav with slide-out drawer
- Camera capture, file upload, and drag-and-drop
- Sticky tab navigation during scrolling
- Grid-based layout that prevents layout shifting between tabs
- File type validation with bilingual error feedback

---

## Technology Stack

| Component | Technology | Role |
|---|---|---|
| Framework | Next.js 15 (App Router) | Server/client hybrid architecture |
| Language | TypeScript | Type-safe application code |
| AI Vision | GPT-4o | Visual classification and narrative generation |
| Regional data | iNaturalist API | Species documented near observation location |
| Taxonomy verification | GBIF API | Authoritative biodiversity records |
| Mexico data | EncicloVida API | National conservation and taxonomy context |
| Authentication | Clerk | Invite-only access control |
| Database | Neon Postgres + Drizzle ORM | Persistent observations |
| Image storage | Vercel Blob + sharp | Compressed image storage |
| Hosting | Vercel | Edge deployment |
| Design | CSS variables | Glass-morphism interface |
| Typography | DM Sans + Playfair Display | CushLabs design system |

---

## Pages & Navigation

| Page | Route | Access | Description |
|------|-------|--------|-------------|
| Home | `/` | Public | Onboarding, pipeline, mission, testimonials, CTA |
| FAQ | `/faq` | Public | 10 bilingual Q&A items with accordion |
| Species Guide | `/species-guide` | Public | 20 protected Jalisco vertebrates, filterable |
| Observations | `/observations` | Public | Community gallery with masonry grid + lightbox |
| Observation Detail | `/observations/[id]` | Public | Full species profile from a single observation |
| Terms of Use | `/terms` | Public | 10-section legal terms |
| Privacy Policy | `/privacy` | Public | 11-section privacy policy with data sharing table |
| Dashboard | `/dashboard` | Auth | Stats, observation history, contribution banner |
| Identify | `/identify` | Auth | Camera/upload + AI identification pipeline |
| Sign In | `/sign-in` | Public | Clerk sign-in (invite-only) |
| 404 | Not found | Public | Custom error page |

**Navigation:**
- Public pages: inline nav bar with logo link to home
- Protected pages: shared layout with NavLinks component
- Mobile: hamburger button with slide-out drawer (theme + language toggles inside)
- Logo always links to home (`/`)

---

## Current Limitations

- Identification accuracy depends on photo quality and subject visibility
- Species outside the regional iNaturalist dataset may be underrepresented
- AI classification remains probabilistic and should be confirmed during formal research workflows
- Offline identification is not currently supported
- Full pipeline can take 10-20s, exceeding Vercel free tier's 10s function timeout

BioJalisco is designed to **assist field identification**, not replace expert taxonomic verification.

---

## Planned Enhancements

- Open biodiversity data export compatible with GBIF and iNaturalist
- Offline identification mode for remote fieldwork
- Confidence scoring across pipeline stages
- Expanded taxonomic coverage beyond vertebrates
- Optional integration with institutional biodiversity databases
- Admin UI for featured/orientation management (currently API-only)

---

*Built by CushLabs AI Services -- [info@cushlabs.ai](mailto:info@cushlabs.ai)*

*Last updated: 2026-03-09*
