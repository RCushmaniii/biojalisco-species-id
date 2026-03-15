# BioJalisco Species Identifier -- Data & Roadmap

## What a Single Photo Generates

Each identification triggers a four-API pipeline that produces 30+ structured data fields, all persisted in Postgres with GPS coordinates and timestamps.

### Data Collected Per Observation

| Category | Fields | Source |
|----------|--------|--------|
| **Identity** | Common name (EN), common name (ES), scientific name, breed/subspecies | GPT-4o, overridden by CONABIO when available |
| **Confidence** | 0-100% score | GPT-4o |
| **Taxonomy** | Kingdom, phylum, class, order, family, genus, species | GPT-4o, verified/overridden by GBIF backbone |
| **Ecology** | Habitat, diet, size, lifespan, behavior | GPT-4o |
| **Geography** | Native range, found-in-Jalisco flag, found-in-Mexico flag, invasive flag, verified distribution localities | GPT-4o + GBIF distributions |
| **Conservation** | IUCN status, population trend, threats | GPT-4o, verified by GBIF Red List data |
| **Mexico-Specific** | Endemic/native/exotic classification, NOM-059-SEMARNAT protection status, common names in indigenous languages (Nahuatl, Maya, etc.) | EncicloVida/CONABIO |
| **Similar Species** | Array of lookalikes with scientific names + distinguishing features | GPT-4o |
| **Narratives** | Full description (EN), full description (ES), fun fact, Wikipedia summary (ES) | GPT-4o + EncicloVida |
| **Source Links** | GBIF species page URL, EncicloVida species page URL | GBIF + EncicloVida |
| **Photo** | Compressed JPEG (max 1920px, ~80% quality), stored in private Vercel Blob | Device camera + sharp |
| **Location** | Latitude, longitude | EXIF GPS (priority) > user-provided location search > browser geolocation (fallback) |
| **Metadata** | User ID, observation timestamp, creation timestamp | Clerk + system |

### Data Verification Layers

| Data Point | AI-Generated | Verified Source |
|-----------|-------------|-----------------|
| Taxonomy (7 ranks) | GPT-4o initial | GBIF backbone (Catalogue of Life) |
| IUCN conservation status | GPT-4o initial | GBIF Red List integration |
| Distribution localities | GPT-4o narrative | GBIF occurrence records |
| Endemic/native/exotic | Not generated | CONABIO authoritative catalog |
| NOM-059 protection | Not generated | CONABIO/SEMARNAT |
| Spanish common name | GPT-4o initial | CONABIO authoritative name |
| Ecology, behavior, diet | GPT-4o | No external verification (Phase 2 candidate) |

---

## Tech Stack Advantages

### Why Four APIs Instead of One

| Problem | How We Solve It |
|---------|----------------|
| AI misidentifies across continents | iNaturalist regional context (50km radius) grounds identification in local reality |
| AI halluccinates taxonomy | GBIF backbone taxonomy overwrites AI-generated ranks with authoritative data |
| AI guesses conservation status | GBIF provides actual IUCN Red List status, not training-data approximations |
| Global databases miss Mexico-specific protections | EncicloVida provides NOM-059 status and endemic classification that IUCN doesn't track |
| Single API failure kills the workflow | Each API is independent with its own timeout; pipeline degrades gracefully |

### Why This Stack

| Choice | Rationale |
|--------|-----------|
| **Private Vercel Blob** | Research photos are sensitive field data, not public social media posts |
| **JSONB columns** | Taxonomy, ecology, geography, conservation stored as structured JSON -- queryable without schema migrations as data model evolves |
| **Clerk invite-only** | Research team of 3-5 people; no public sign-up prevents unauthorized API cost |
| **Server-side signed URLs** | Private blob images served through expiring signed URLs; no direct public access to storage |
| **Neon Postgres** | Serverless Postgres scales to zero when team isn't in the field; no idle database costs |
| **GPS + timestamps on every observation** | Enables geographic analysis, seasonal patterns, and survey coverage mapping |

---

## Phase 1.5 -- PWA & Mobile Distribution

### Completed (v1.1)

- Progressive Web App (PWA) conversion with offline-capable service worker
- Full manifest with maskable icons (72-512px) for Android and iOS home screen install
- Apple-specific meta tags for iOS standalone mode
- Service worker: cache-first for static assets, network-first for pages, bypass for API routes
- Pre-caches home page and logo for instant offline launch

### GPS Location Priority Chain

Photos uploaded to BioJalisco resolve location through a three-tier fallback:

1. **EXIF GPS** -- extracted client-side via `exifr` before upload (highest accuracy, from the photo itself)
2. **User-provided location** -- text search with geocoding, shown when EXIF GPS is absent
3. **Browser geolocation** -- device's current position (fallback; inaccurate if uploading from a different location than where the photo was taken)

Note: Photos shared via messaging apps, email, or social media typically have GPS stripped for privacy. Original photos taken directly on the device or downloaded from Google Photos retain EXIF GPS.

### Planned -- Capacitor Native Wrapper

If PWA testing reveals limitations with GPS accuracy, camera EXIF handling, or offline reliability, the upgrade path is **Capacitor** (Ionic):

- Wraps the existing Next.js app in a native Android/iOS shell
- `@capacitor/geolocation` provides native GPS (more reliable than browser geolocation)
- `@capacitor/camera` provides native camera with full EXIF preservation
- Same codebase, no rewrite required
- Android first (Google Play, $25 one-time), iOS later if needed ($99/year)

---

## Phase 2 -- Monitoring & Dashboards

All data below is already being collected. These features are views on top of existing structured data.

### Species Inventory Dashboard

- Total unique species identified, grouped by taxonomic class (birds, mammals, reptiles, amphibians)
- Species accumulation curve over time -- how fast are new species being discovered?
- Most frequently observed species with photo thumbnails
- Filter by date range, location area, or researcher

### Conservation Monitoring

- All observations filtered by IUCN status (Endangered, Vulnerable, Near Threatened)
- All observations filtered by NOM-059 status (species legally protected under Mexican law)
- Population trend breakdown -- how many documented species are declining vs. stable vs. increasing?
- Alert when a Critically Endangered or NOM-059 protected species is identified

### Geographic Heatmaps

- Plot all observations on a map using stored lat/lng coordinates
- Cluster by species, by conservation status, by endemic classification
- Survey coverage visualization -- where has the team surveyed, where are the gaps?
- Overlay with protected area boundaries (Jalisco biosphere reserves, national parks)

### Endemic Species Tracker

- Dashboard filtered to CONABIO-classified endemic species only
- Track how many of Mexico's endemic vertebrate species the team has documented
- Flag any exotic or invasive species detected in field survey areas
- Compare endemic species density across survey locations

### Team Activity & Quality

- Observations per researcher per week/month
- Identification confidence trends over time
- Survey effort by location (observations per GPS cluster)
- Error rate tracking (how often does identification fail?)

### Export & Reporting

- CSV/Excel export of all observations with full structured data
- Generate survey reports for specific date ranges or geographic areas
- Data formatted for submission to iNaturalist or GBIF (contribute back to open data)
- PDF species checklists per survey site

---

## Phase 3 -- Advanced Features (Future)

- **Enhanced offline mode**: Queue identifications taken offline and process when connectivity returns (PWA service worker provides basic offline page caching in Phase 1.5)
- **Batch upload**: Process multiple photos from a day's fieldwork at once
- **Species comparison**: Side-by-side comparison of similar species with distinguishing features
- **Seasonal patterns**: When are specific species most frequently observed?
- **Citizen science integration**: Contribute verified observations back to iNaturalist/GBIF
- **Multi-team support**: Separate workspaces for different research groups sharing the platform

---

*Built by CushLabs AI Services -- info@cushlabs.ai*
