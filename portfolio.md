---
# =============================================================================
# PORTFOLIO.MD — BioJalisco Species Identifier
# =============================================================================
portfolio_enabled: true
portfolio_priority: 3
portfolio_featured: true
portfolio_last_reviewed: "2026-03-06"

title: "BioJalisco Species Identifier"
tagline: "AI-powered species identification for Jalisco biodiversity research"
slug: "biojalisco-species-id"

category: "AI Automation"
target_audience: "Conservation biologists and field researchers needing rapid species identification"
tags:
  - "ai-vision"
  - "species-identification"
  - "conservation"
  - "biodiversity"
  - "gpt-4o"
  - "nextjs"
  - "bilingual"
  - "field-research"

thumbnail: ""
hero_images: []
demo_video_url: ""

live_url: "https://biojalisco-species-id.vercel.app"
demo_url: ""
case_study_url: ""

problem_solved: |
  Conservation biologists in Jalisco encounter thousands of species during fieldwork
  but lack rapid identification tools. Traditional methods require reference materials,
  expert consultation, or lab work -- slowing data collection and limiting the scope
  of biodiversity surveys. This tool puts GPT-4o Vision in their pocket.

key_outcomes:
  - "Identifies any organism in under 15 seconds with structured taxonomy data"
  - "Bilingual output (EN/ES) for Mexican research teams"
  - "Persistent geotagged observations build a searchable field record"
  - "Invite-only access keeps the tool secure for authorized researchers"
  - "Full conservation status and similar species data per identification"

tech_stack:
  - "Next.js 15 (App Router)"
  - "TypeScript"
  - "GPT-4o Vision"
  - "Clerk Authentication"
  - "Neon Postgres"
  - "Drizzle ORM"
  - "Vercel Blob Storage"
  - "sharp (image processing)"
  - "Vercel"

complexity: "Production"
---

## Overview

BioJalisco Species Identifier is a production web app that lets field researchers photograph any living organism and receive a comprehensive AI-powered identification. Built for Dr. Veronica Rosas and her conservation biology team in Jalisco, Mexico, it transforms a proven proof-of-concept into a reliable research tool.

The app captures photos via camera or upload, compresses them through sharp, stores them in Vercel Blob, and sends them to GPT-4o Vision for analysis. Results include common and scientific names, full taxonomy, ecology data, geographic range, IUCN conservation status, and similar species -- all in both English and Spanish.

Every identification persists as a geotagged observation in Neon Postgres, building a searchable record of the team's fieldwork over time.

## The Challenge

- **Identification bottleneck:** Field teams encounter diverse species across Jalisco's ecosystems. Traditional identification requires reference books, expert consultation, or specimens sent to labs -- all of which slow data collection during time-limited field surveys.
- **No persistent record:** The working proof-of-concept (Flask + vanilla HTML) proved AI identification works, but observations were lost on page refresh. No way to review past identifications or build a cumulative dataset.
- **Language barrier:** Research teams work in Spanish, but most identification resources are English-only. A bilingual tool removes friction for Mexican researchers.
- **Access control:** A public-facing tool isn't appropriate for a small research team. The tool needs invite-only access without the overhead of building custom auth.

## The Solution

**AI-powered identification:**
The GPT-4o system prompt was ported character-for-character from the proven PoC. It handles all living organisms -- wild jaguars, domestic dogs, garden plants, aquarium fish -- returning structured JSON with confidence scoring across 8 data categories.

**Persistent observations:**
Every identification saves to Neon Postgres with the compressed photo in Vercel Blob. GPS coordinates from the device are captured automatically. Researchers can browse, review, and delete past observations from a dashboard.

**Bilingual by default:**
A React context-based language toggle switches all UI text and species descriptions between English and Spanish instantly.

**Invite-only access:**
Clerk authentication with sign-up disabled. New researchers are added manually through the Clerk dashboard -- zero custom auth code, maximum security.

## Technical Highlights

- **Faithful PoC port:** System prompt, CSS theme, and UI components ported directly from the 630-line vanilla HTML proof-of-concept -- preserving proven UX
- **Image pipeline:** Client capture -> base64 -> sharp compression (~1MB JPEG) -> Vercel Blob -> GPT-4o Vision -- handles the full lifecycle server-side
- **JSONB schema design:** Single observations table with JSONB columns for taxonomy, ecology, geography, and conservation -- avoids premature normalization while keeping queries simple
- **Lazy initialization pattern:** Database and OpenAI clients initialize on first use via Proxy, enabling builds without environment variables
- **Dark theme CSS variables:** 200+ lines of hand-tuned CSS ported from the PoC, no Tailwind dependency
- **Server components for data pages:** Dashboard and observation detail use Next.js server components for zero-JS data fetching; identify page is client-side for camera access

## Results

**For the Research Team:**
- Rapid species identification available on any mobile device with a camera
- Persistent, geotagged observation history builds over time
- Bilingual interface removes language friction for the Mexican team
- Invite-only access means zero onboarding overhead

**Technical Demonstration:**
- End-to-end AI vision integration with structured output parsing
- Production deployment pipeline (GitHub -> Vercel) with database migrations
- Faithful port from prototype to production without losing the UX that made the PoC compelling
- Clean separation of server and client concerns in Next.js App Router architecture
