# BioJalisco Species Identifier — Features & Differentiation

## What Makes This Different

Most species identification apps rely on a single AI model or a single database. BioJalisco chains **four independent data sources** into one pipeline, producing results that are both faster than community-based platforms and more accurate than standalone AI.

No other tool we've found combines all four of these in a single identification flow.

## The Four-API Pipeline

### 1. iNaturalist — Regional Species Intelligence
Before the AI even sees the photo, we query iNaturalist's public API for vertebrate species documented within 50km of the user's GPS coordinates. This gives GPT-4o a "regional field guide" — dramatically reducing misidentifications where visually similar species exist on different continents.

**Why it matters:** A gray snake with zigzag markings photographed in Jalisco is a Mexican Brown Snake, not a European Adder. Without geographic context, AI vision models default to the most globally common lookalike.

### 2. GPT-4o Vision — Visual Identification + Rich Narratives
OpenAI's most capable vision model identifies the species from the photo, informed by the regional species context. Returns structured data across 8 categories plus bilingual descriptions, ecology, and fun facts.

**Why it matters:** No other API produces this depth of narrative content per identification — habitat, diet, behavior, similar species, fun facts — all in both English and Spanish, in seconds.

### 3. GBIF — Global Verification Layer
The Global Biodiversity Information Facility validates the identification with authoritative data from the Catalogue of Life, IUCN Red List, and ITIS. Verified taxonomy, IUCN conservation status, and distribution localities replace AI-generated guesses.

**Why it matters:** AI can hallucinate taxonomy and conservation status. GBIF data comes from the actual scientific record. The app shows "Verified" badges so researchers know which data is authoritative.

### 4. EncicloVida (CONABIO) — Mexico's National Species Encyclopedia
CONABIO's API provides Mexico-specific data that no global database offers:
- **Endemic/Native/Exotic classification** — Is this species endemic to Mexico?
- **NOM-059-SEMARNAT status** — Mexico's own endangered species law, separate from IUCN
- **Spanish common names** from CONABIO's authoritative catalog
- **Common names in indigenous languages** (Nahuatl, Maya, etc. when available)
- **Wikipedia summaries in Spanish** — ready-made descriptions
- **CONABIO-verified photos** from NaturaLista observations
- **SNIB specimen records** and geodata links

**Why it matters:** For Mexican conservation research, CONABIO's data is often more relevant than global databases. A species can be "Least Concern" globally but protected under NOM-059 in Mexico.

## Feature Comparison

| Capability | BioJalisco | iNaturalist | EncicloVida | Google Lens |
|---|---|---|---|---|
| Instant AI identification | 10-20s | Hours-days (community) | No ID feature | ~2s |
| Regional species awareness | Yes (iNat data) | Built-in | No | No |
| Verified taxonomy (GBIF) | Yes | No | Partial | No |
| IUCN conservation status | Yes (verified) | Community-added | Yes | No |
| NOM-059 Mexican protection | Yes (CONABIO) | No | Yes | No |
| Endemic/native/exotic status | Yes (CONABIO) | No | Yes | No |
| Bilingual EN/ES | Yes (native) | Partial | Spanish only | Auto-translate |
| Ecology + behavior data | Yes (AI-generated) | Community notes | Reference only | No |
| Fun facts + narratives | Yes | No | No | No |
| Persistent observations | Yes (with DB) | Yes | No | No |
| GPS geotagging | Yes | Yes | No | No |
| Offline support | No | Partial (Seek) | App only | No |
| Open data contribution | Planned | Yes | Yes | No |

## Key Features

### Bilingual by Default
Every piece of text — UI, descriptions, species names, fun facts — works in both English and Spanish. A single toggle switches instantly. Built for Mexican research teams who work across both languages.

### Graceful Degradation
The app works with just an OpenAI API key. Each layer is optional:
- **Minimum:** OPENAI_API_KEY → AI identification works
- **+ GPS permission:** iNaturalist regional context activates → better accuracy
- **+ Internet:** GBIF and EncicloVida enrichment → verified data with badges
- **+ Clerk:** Authentication → invite-only access
- **+ Neon + Blob:** Persistence → observations saved with photos

If any external API is slow or down, the pipeline continues without it. No single point of failure.

### Verified Data Badges
The UI clearly distinguishes:
- **"Taxonomy verified by GBIF"** — green banner on taxonomy tab
- **"IUCN Verified"** — badge on conservation status
- **"CONABIO"** — badge on endemic/native classification
- **"NOM-059-SEMARNAT"** — Mexico's endangered species law status
- Source links to GBIF and EncicloVida for deeper research

### Design for Field Use
- Dark theme reduces eye strain in outdoor conditions
- Large touch targets for mobile use with gloves
- Camera capture, file upload, and drag-and-drop
- Sticky tab navigation during scroll
- Grid-stacked panels eliminate layout jumping

## Who It's For

**Primary:** Dr. Veronica Rosas and her conservation biology team at the University of Guadalajara. 3-5 researchers conducting biodiversity surveys across Jalisco's diverse ecosystems.

**Secondary:** Any field biologist, naturalist, or conservation researcher working in Mexico who needs rapid, verified species identification with Mexico-specific regulatory data.

## Technology

| Component | Technology | Purpose |
|---|---|---|
| Framework | Next.js 15 (App Router) | Server/client hybrid |
| Language | TypeScript | Type safety across the stack |
| AI | GPT-4o Vision | Visual identification + narratives |
| Regional data | iNaturalist API | Species observed nearby |
| Global verification | GBIF API | Taxonomy, IUCN, distributions |
| Mexico data | EncicloVida API | Endemic status, NOM-059, CONABIO |
| Auth | Clerk | Invite-only access |
| Database | Neon Postgres + Drizzle | Persistent observations |
| Storage | Vercel Blob + sharp | Compressed image storage |
| Hosting | Vercel | Edge deployment |
| Design | CSS variables | Glass-morphism, gold accents |
| Fonts | DM Sans + Playfair Display | CushLabs design language |

---

*Built by CushLabs AI Services — info@cushlabs.ai*
