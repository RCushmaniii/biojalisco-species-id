---
# =============================================================================
# PORTFOLIO.MD — BioJalisco Species Identifier
# =============================================================================
portfolio_enabled: true
portfolio_priority: 3
portfolio_featured: true
portfolio_last_reviewed: "2026-03-07"

title: "BioJalisco Species Identifier"
tagline: "Four-API species identification pipeline with verified biodiversity data and Mexico-specific conservation status"
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

thumbnail: ""
hero_images: []
demo_video_url: ""

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
  - "Four-API pipeline: iNaturalist context + GPT-4o identification + GBIF verification + EncicloVida/CONABIO enrichment"
  - "Verified IUCN Red List status and taxonomy from GBIF backbone (not AI-generated)"
  - "Mexico-specific data from CONABIO: endemic/native/exotic classification, NOM-059 protection status, indigenous language names"
  - "Regional species awareness via iNaturalist observations within 50km of GPS coordinates"
  - "Bilingual output (EN/ES) with confidence scoring across 6 data categories"
  - "Graceful degradation: works with just an OpenAI key, enriched with optional services"

tech_stack:
  - "Next.js 15 (App Router)"
  - "TypeScript"
  - "GPT-4o Vision"
  - "iNaturalist API"
  - "GBIF API"
  - "EncicloVida/CONABIO API"
  - "Clerk Authentication"
  - "Neon Postgres"
  - "Drizzle ORM"
  - "Vercel Blob Storage"
  - "sharp (image processing)"
  - "Vercel"

complexity: "Production"
---

## Overview

BioJalisco Species Identifier is a production web app that lets field researchers photograph any vertebrate animal and receive a comprehensive, verified identification. Built for Dr. Veronica Rosas and her conservation biology team in Jalisco, Mexico, it chains four independent data sources into a single identification pipeline.

iNaturalist's public API provides a regional species list based on GPS coordinates. GPT-4o Vision performs the visual identification informed by that regional context. GBIF overlays verified taxonomy, IUCN Red List status, and authoritative distribution data. EncicloVida (CONABIO) adds Mexico-specific enrichment: endemic/native/exotic classification, NOM-059-SEMARNAT protection status, common names in indigenous languages, and Wikipedia summaries in Spanish.

No other tool combines all four of these sources in a single identification flow. Results are bilingual (English/Spanish), with "Verified" badges distinguishing authoritative data from AI-generated content.

## The Challenge

- **AI misidentification without context:** GPT-4o Vision identifies species based on visual similarity alone, frequently confusing lookalikes across continents. A Mexican Brown Snake gets identified as a European Adder because they share similar markings -- but only one exists in the Americas.
- **No verification layer:** AI-generated taxonomy and conservation data can be hallucinated. Researchers need to know which data is authoritative and which is AI-generated.
- **No persistent record:** The working proof-of-concept (Flask + vanilla HTML) proved AI identification works, but observations were lost on page refresh.
- **Language barrier:** Research teams work in Spanish, but most identification resources are English-only.

## The Solution

**Four-API pipeline** eliminates the single-model accuracy problem. iNaturalist grounds the identification in regional reality, GPT-4o does the visual analysis, GBIF provides global verification, and EncicloVida adds Mexico-specific regulatory and conservation data. Each API has independent timeouts and graceful fallbacks.

**Verified data badges** on the Taxonomy, Conservation, and Range tabs clearly distinguish authoritative data from AI-generated content. IUCN status comes from GBIF. Endemic classification and NOM-059 protection come from CONABIO.

**Mexico-specific enrichment** from EncicloVida provides data no global database offers: whether a species is endemic to Mexico, its status under NOM-059-SEMARNAT (Mexico's own endangered species law, separate from IUCN), common names in indigenous languages, and CONABIO-verified photos from NaturaLista.

**Graceful degradation architecture** means the app works with just an OpenAI API key. Auth, persistence, and data enrichment are optional layers that activate when configured.

## Technical Highlights

- Four-API pipeline with independent timeouts and graceful fallbacks at each stage
- Grid-stacked tab panels (CSS grid-row: 1, grid-column: 1) eliminate layout shift when switching between tabs of different heights
- Sticky tab navigation pins to viewport during scroll
- CushLabs design language: glass-morphism cards, scanning border animations, gold accent system
- Drag-and-drop image upload with camera capture and file picker
- DM Sans + Playfair Display + Cormorant Garamond typography system
- Fluid type scale with 8-step clamp() system for responsive text

## Results

**For the Research Team:**
- Accurate species identification grounded in regional observation data
- Verified taxonomy and IUCN status from authoritative sources, not AI guesswork
- Bilingual interface removes language friction
- Works on any mobile device with a camera

**Technical Demonstration:**
- Multi-API orchestration with graceful degradation at each layer
- Real-world problem solving: geographic context dramatically improves AI vision accuracy
- Production deployment with zero-config minimum viable setup (just needs OPENAI_API_KEY)
- Clean separation of AI generation vs. verified data with visual distinction in the UI
