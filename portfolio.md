---
# =============================================================================
# PORTFOLIO.MD — BioJalisco Species Identifier
# =============================================================================
portfolio_enabled: true
portfolio_priority: 3
portfolio_featured: true
portfolio_last_reviewed: "2026-03-07"

title: "BioJalisco Species Identifier"
tagline: "Three-API species identification pipeline with verified biodiversity data for Jalisco field research"
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
  - "nextjs"
  - "bilingual"
  - "field-research"

thumbnail: ""
hero_images: []
demo_video_url: ""

live_url: "https://biojalisco-species-id.vercel.app"
demo_url: "https://biojalisco-species-id.vercel.app"
case_study_url: ""

problem_solved: |
  Conservation biologists in Jalisco encounter thousands of species during fieldwork
  but lack rapid identification tools with verified data. GPT-4o Vision alone
  frequently misidentifies species without geographic context -- confusing lookalikes
  across continents. This tool chains three APIs to deliver accurate, region-aware
  identification backed by authoritative biodiversity databases.

key_outcomes:
  - "Three-API pipeline: iNaturalist context + GPT-4o identification + GBIF verification"
  - "Verified IUCN Red List status and taxonomy from GBIF backbone (not AI-generated)"
  - "Regional species awareness via iNaturalist observations within 50km of GPS coordinates"
  - "Bilingual output (EN/ES) with confidence scoring across 6 data categories"
  - "Persistent geotagged observations build a searchable field record"
  - "Graceful degradation: works with just an OpenAI key, enriched with optional services"

tech_stack:
  - "Next.js 15 (App Router)"
  - "TypeScript"
  - "GPT-4o Vision"
  - "iNaturalist API"
  - "GBIF API"
  - "Clerk Authentication"
  - "Neon Postgres"
  - "Drizzle ORM"
  - "Vercel Blob Storage"
  - "sharp (image processing)"
  - "Vercel"

complexity: "Production"
---

## Overview

BioJalisco Species Identifier is a production web app that lets field researchers photograph any vertebrate animal and receive a comprehensive, verified identification. Built for Dr. Veronica Rosas and her conservation biology team in Jalisco, Mexico, it chains three data sources into a single identification pipeline.

iNaturalist's public API provides a regional species list based on GPS coordinates -- a "field guide" of what's actually been documented nearby. GPT-4o Vision performs the visual identification informed by that regional context. GBIF then overlays verified taxonomy, IUCN Red List status, and authoritative distribution data from the Catalogue of Life and ITIS.

Results are bilingual (English/Spanish), presented in a tabbed interface with "Verified" badges distinguishing authoritative GBIF data from AI-generated content.

## The Challenge

- **AI misidentification without context:** GPT-4o Vision identifies species based on visual similarity alone, frequently confusing lookalikes across continents. A Mexican Brown Snake gets identified as a European Adder because they share similar markings -- but only one exists in the Americas.
- **No verification layer:** AI-generated taxonomy and conservation data can be hallucinated. Researchers need to know which data is authoritative and which is AI-generated.
- **No persistent record:** The working proof-of-concept (Flask + vanilla HTML) proved AI identification works, but observations were lost on page refresh.
- **Language barrier:** Research teams work in Spanish, but most identification resources are English-only.

## The Solution

**Three-API pipeline** eliminates the single-model accuracy problem. iNaturalist grounds the identification in regional reality, GPT-4o does the visual analysis, and GBIF provides the verification layer. Each API has independent timeouts and graceful fallbacks -- if GBIF is slow, the AI data still shows without verified badges.

**Verified data badges** on the Taxonomy, Conservation, and Range tabs clearly distinguish GBIF-verified information from AI-generated content. IUCN Red List status comes from the actual Red List via GBIF, not from GPT-4o's training data.

**GBIF distribution data** shows specific localities from authoritative sources (e.g., "Mexico: Oaxaca, San Luis Potosi, Jalisco, Guerrero...") with establishment means (native/introduced).

**Graceful degradation architecture** means the app works with just an OpenAI API key. Auth, persistence, and data enrichment are optional layers that activate when configured.

## Technical Highlights

- Three-API pipeline with independent timeouts and graceful fallbacks at each stage
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
