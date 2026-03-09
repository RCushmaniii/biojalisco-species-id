---
# =============================================================================
# PORTFOLIO.MD — BioJalisco Species Identifier
# =============================================================================
portfolio_enabled: true
portfolio_priority: 3
portfolio_featured: true
portfolio_last_reviewed: "2026-03-09"

title: "BioJalisco Species Identifier"
tagline: "Five-API species identification pipeline with EXIF GPS extraction, reverse geocoding, and Mexico-specific conservation data"
slug: "biojalisco-species-id"

category: "AI Automation"
target_audience: "Conservation biologists and field researchers needing rapid, verified species identification"
tags:
  - "ai-vision"
  - "species-identification"
  - "conservation"
  - "biodiversity"
  - "gpt-4o"
  - "inaturalist"
  - "gbif"
  - "conabio"
  - "nextjs"
  - "bilingual"

thumbnail: "/images/portfolio/biojalisco-thumb.webp"
hero_images:
  - "/images/portfolio/biojalisco-slide-01.webp"
  - "/images/portfolio/biojalisco-slide-02.webp"
  - "/images/portfolio/biojalisco-slide-03.webp"
  - "/images/portfolio/biojalisco-slide-04.webp"
  - "/images/portfolio/biojalisco-slide-05.webp"
  - "/images/portfolio/biojalisco-slide-06.webp"
  - "/images/portfolio/biojalisco-slide-07.webp"
  - "/images/portfolio/biojalisco-slide-08.webp"
  - "/images/portfolio/biojalisco-slide-09.webp"
  - "/images/portfolio/biojalisco-slide-10.webp"
demo_video_url: "/video/biojalisco-brief.mp4"
demo_video_poster: "/images/portfolio/biojalisco-brief-poster.webp"

live_url: "https://biojalisco-species-id.vercel.app"
demo_url: "https://biojalisco-species-id.vercel.app"
case_study_url: ""

problem_solved: |
  Conservation biologists in Jalisco encounter thousands of species during fieldwork
  but lack rapid identification tools with verified data. GPT-4o Vision alone
  frequently misidentifies species without geographic context. No existing tool
  combines AI vision, regional species data, global taxonomy verification, and
  Mexico-specific conservation status (NOM-059, endemic classification) in one flow.

key_outcomes:
  - "Five-API pipeline: iNaturalist context + GPT-4o Vision + GBIF verification + EncicloVida/CONABIO enrichment + Nominatim reverse geocoding"
  - "EXIF GPS extraction from photo metadata for precise location-aware identification (proven: corrected Broad-billed Hummingbird to Cinnamon Hummingbird with accurate coordinates)"
  - "Reverse geocoding via OpenStreetMap Nominatim: country, state, region, municipality, city displayed in Data Sources"
  - "Verified IUCN Red List status and taxonomy from GBIF backbone (not AI-generated)"
  - "Mexico-specific data from CONABIO: endemic/native/exotic classification, NOM-059 protection status, indigenous language names"
  - "Explore/Research dual-mode tab system: casual users see About + Habitat + Similar Species; scientists see Taxonomy + Conservation + Data Sources"
  - "Bilingual (EN/ES) with dark/light theme, community observation gallery, and EXIF privacy stripping"
  - "Graceful degradation: works with just an OpenAI key, enriched with optional services"

tech_stack:
  - "Next.js 15 (App Router)"
  - "TypeScript"
  - "GPT-4o Vision"
  - "iNaturalist API"
  - "GBIF API"
  - "EncicloVida/CONABIO API"
  - "OpenStreetMap Nominatim (reverse geocoding)"
  - "exifr (EXIF GPS/metadata extraction)"
  - "Clerk Authentication"
  - "Neon Postgres"
  - "Drizzle ORM"
  - "Vercel Blob Storage"
  - "sharp (image processing)"
  - "Vercel"

complexity: "Production"
---

## Overview

BioJalisco Species Identifier is a production web app that lets field researchers photograph any vertebrate animal and receive a comprehensive, verified identification. Built for Dr. Veronica Rosas and her conservation biology team in Jalisco, Mexico, it chains five independent data sources into a single identification pipeline.

The app extracts GPS coordinates from photo EXIF metadata (stripping it for privacy), then reverse geocodes via OpenStreetMap Nominatim to get the exact city, municipality, region, and state. iNaturalist's public API provides a regional species list based on those coordinates. GPT-4o Vision performs the visual identification informed by both the regional species context and the human-readable location name (e.g. "San Sebastián del Oeste, Jalisco, México"). GBIF overlays verified taxonomy, IUCN Red List status, and authoritative distribution data. EncicloVida (CONABIO) adds Mexico-specific enrichment: endemic/native/exotic classification, NOM-059-SEMARNAT protection status, common names in indigenous languages, and Wikipedia summaries in Spanish.

Results are presented through an Explore/Research dual-mode tab system: casual users see About, Habitat & Range, and Similar Species; scientists see Taxonomy, Conservation, and a consolidated Data Sources panel with full location metadata, GBIF match data, and EncicloVida enrichment. The entire interface is bilingual (English/Spanish) with dark/light theme support.

## The Challenge

- **AI misidentification without context:** GPT-4o Vision identifies species based on visual similarity alone, frequently confusing lookalikes across continents. A Mexican Brown Snake gets identified as a European Adder because they share similar markings -- but only one exists in the Americas.
- **Inaccurate location data:** Browser geolocation gives the user's current position, not where the photo was taken. A researcher uploading field photos from their office in Guadalajara gets species lists for the city, not the Sierra Madre Occidental where they actually photographed the animal.
- **No verification layer:** AI-generated taxonomy and conservation data can be hallucinated. Researchers need to know which data is authoritative and which is AI-generated.
- **Information overload on mobile:** Six tabs of dense scientific data overwhelm casual users while hiding the details researchers need behind extra clicks.
- **No persistent record:** The working proof-of-concept (Flask + vanilla HTML) proved AI identification works, but observations were lost on page refresh.
- **Language barrier:** Research teams work in Spanish, but most identification resources are English-only.

## The Solution

**EXIF GPS extraction + reverse geocoding** solves the location accuracy problem. The app reads GPS coordinates directly from the photo's EXIF metadata (then strips it for privacy via canvas re-render), reverse geocodes via OpenStreetMap Nominatim, and passes the human-readable location name to GPT-4o. Proven impact: a hummingbird misidentified as Broad-billed Hummingbird from Guadalajara coordinates was correctly identified as Cinnamon Hummingbird when given the actual photo location of San Sebastián del Oeste.

**Five-API pipeline** eliminates the single-model accuracy problem. iNaturalist grounds the identification in regional reality, GPT-4o does the visual analysis informed by location context, GBIF provides global verification, EncicloVida adds Mexico-specific regulatory data, and Nominatim delivers structured location metadata.

**Explore/Research dual-mode tabs** serve both audiences. Casual users see About (description + ecology), Habitat & Range, and Similar Species. Scientists toggle to Research mode for Taxonomy, Conservation, and a consolidated Data Sources panel showing GBIF match confidence, EncicloVida enrichment, image metadata, and full location breakdown (country, state, region, municipality, city, GPS).

**Verified data badges** clearly distinguish authoritative data from AI-generated content. IUCN status comes from GBIF. Endemic classification and NOM-059 protection come from CONABIO.

**Mexico-specific enrichment** from EncicloVida provides data no global database offers: whether a species is endemic to Mexico, its status under NOM-059-SEMARNAT (Mexico's own endangered species law, separate from IUCN), common names in indigenous languages, and CONABIO-verified photos from NaturaLista.

**Graceful degradation architecture** means the app works with just an OpenAI API key. Auth, persistence, and data enrichment are optional layers that activate when configured.

## Technical Highlights

- Five-API pipeline with independent timeouts, `Promise.allSettled()` parallel execution, and graceful fallbacks at each stage
- Client-side EXIF extraction via `exifr` with privacy-preserving canvas re-render before upload
- Server-side reverse geocoding via OpenStreetMap Nominatim (free, no API key)
- Explore/Research dual-mode tab system with segmented toggle control
- Grid-stacked tab panels (CSS grid-row: 1, grid-column: 1) eliminate layout shift when switching between content of different heights
- Sticky tab navigation pins to viewport during scroll
- Community observation gallery with AI-driven orientation metadata and admin-flaggable featured observations
- CushLabs design language: glass-morphism cards, scanning border animations, gold accent system
- Dark/light theme with CSS variable swap via `[data-theme="light"]`
- Drag-and-drop image upload with camera capture, HEIC support, and 20MB validation
- DM Sans + Playfair Display + Cormorant Garamond typography system
- Fluid type scale with 8-step clamp() system for responsive text
- All images optimized to WebP (91% size reduction from PNG)

## Results

**For the Research Team:**
- Accurate species identification grounded in regional observation data and precise photo GPS coordinates
- EXIF-based location proven to correct misidentifications (Broad-billed Hummingbird → Cinnamon Hummingbird with accurate Sierra Occidental coordinates)
- Verified taxonomy and IUCN status from authoritative sources, not AI guesswork
- Dual-mode interface serves both casual explorers and working scientists
- Bilingual interface removes language friction
- Works on any mobile device with a camera

**Technical Demonstration:**
- Five-API orchestration with graceful degradation at each layer
- EXIF GPS extraction → reverse geocoding → location-aware AI identification pipeline
- Real-world problem solving: geographic context dramatically improves AI vision accuracy
- Production deployment with zero-config minimum viable setup (just needs OPENAI_API_KEY)
- Clean separation of AI generation vs. verified data with visual distinction in the UI
- Community observation gallery with featured curation and AI-driven layout orientation
