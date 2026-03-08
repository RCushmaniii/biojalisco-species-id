# API Reference

## POST `/api/identify`

Identifies a species from a photo using the four-API pipeline (iNaturalist + GPT-4o Vision + GBIF + EncicloVida).

### Authentication

- **With Clerk configured:** Requires authenticated session (protected by middleware)
- **Without Clerk:** Open access (no auth required)

### Request

**Content-Type:** `application/json`

```json
{
  "image_data": "string (required) -- base64-encoded image or data URI",
  "latitude": "number (optional) -- GPS latitude for regional species context",
  "longitude": "number (optional) -- GPS longitude for regional species context"
}
```

**Notes:**
- `image_data` accepts raw base64 or `data:image/jpeg;base64,...` format (prefix is stripped automatically)
- GPS coordinates enable iNaturalist regional filtering (50km radius). Without them, the pipeline skips Step 1 and relies on GPT-4o alone.

### Response (Success)

**Status:** `200 OK`

```json
{
  "identification": {
    "common_name": "Turquoise-browed Motmot",
    "nombre_comun": "Momoto Cejiceleste",
    "scientific_name": "Eumomota superciliosa",
    "breed": null
  },
  "confidence": 92,
  "taxonomy": {
    "kingdom": "Animalia",
    "phylum": "Chordata",
    "class": "Aves",
    "order": "Coraciiformes",
    "family": "Momotidae",
    "genus": "Eumomota",
    "species": "Eumomota superciliosa"
  },
  "ecology": {
    "habitat": "Tropical dry forests, forest edges, and semi-open areas",
    "diet": "Insects, small reptiles, and fruits",
    "size": "34 cm (13 in)",
    "lifespan": "12-14 years",
    "behavior": "Perches motionless then sallies out to catch prey; distinctive pendulum tail-wagging"
  },
  "geography": {
    "native_range": "Southern Mexico to Costa Rica",
    "found_in_jalisco": true,
    "found_in_mexico": true,
    "invasive": false
  },
  "conservation": {
    "iucn_status": "LC",
    "population_trend": "Stable",
    "threats": "Habitat loss from deforestation"
  },
  "similar_species": [
    {
      "name": "Russet-crowned Motmot",
      "scientific_name": "Momotus mexicanus",
      "distinction": "Lacks the turquoise brow stripe; has a rufous crown"
    }
  ],
  "description": "The Turquoise-browed Motmot is one of...",
  "descripcion": "El Momoto Cejiceleste es una de las...",
  "fun_fact": "Motmots create their distinctive racquet-shaped tail...",
  "gbif": {
    "taxonomy": { "kingdom": "Animalia", "..." : "..." },
    "iucnStatus": "Least Concern",
    "iucnCategory": "LC",
    "distributions": ["Mexico", "Guatemala", "Honduras", "..."],
    "establishmentMeans": null,
    "vernacularNames": { "en": "Turquoise-browed Motmot", "es": "Momoto Cejiceleste" },
    "gbifUrl": "https://www.gbif.org/species/2475290",
    "matchConfidence": 99
  },
  "enciclovida": {
    "speciesId": 12345,
    "commonNameEs": "Momoto cejiceleste",
    "allCommonNames": ["Momoto cejiceleste", "Pájaro reloj"],
    "distributionTypes": ["Nativa residente"],
    "characteristics": [],
    "nom059Status": null,
    "photoUrl": "https://...",
    "wikipediaSummary": "Eumomota superciliosa es una especie de...",
    "geodataSources": ["SNIB"],
    "enciclovidaUrl": "https://enciclovida.mx/especies/12345"
  },
  "id": "uuid (only if persisted)",
  "imageUrl": "https://... (only if persisted)"
}
```

### Response (Error -- Bad Request)

**Status:** `400 Bad Request`

```json
{
  "error": "No image provided"
}
```

### Response (Error -- Server Error)

**Status:** `500 Internal Server Error`

```json
{
  "error": "Error message",
  "suggestion": "Check server logs for details. Make sure OPENAI_API_KEY is configured."
}
```

### Response (Identification Failed)

**Status:** `200 OK` (pipeline ran but couldn't identify)

```json
{
  "error": "Unable to identify species",
  "suggestion": "Try a clearer photo with better lighting"
}
```

### Pipeline Behavior

| Step | Source | Condition | Failure Mode |
|------|--------|-----------|-------------|
| 1. Regional context | iNaturalist | GPS coords provided | Skipped silently; GPT-4o runs without context |
| 2. Visual ID | GPT-4o Vision | Always runs | Returns error response |
| 3. Taxonomy verification | GBIF | Successful identification | Skipped; AI taxonomy used as-is |
| 4. Mexico enrichment | EncicloVida | Successful identification | Skipped; no `enciclovida` field in response |

Steps 3 and 4 run in parallel via `Promise.allSettled()`. Each has independent timeouts. A failure in any enrichment step does not block the response.

### Persistence

If all three conditions are met, the observation is automatically saved:
1. User is authenticated (Clerk)
2. `DATABASE_URL` is configured
3. `BLOB_READ_WRITE_TOKEN` is configured

When persisted, the response includes `id` (UUID) and `imageUrl` (Vercel Blob signed URL).

---

## Data Types

### Identification

| Field | Type | Description |
|-------|------|-------------|
| `common_name` | string | English common name |
| `nombre_comun` | string | Spanish common name (overridden by CONABIO when available) |
| `scientific_name` | string | Binomial nomenclature |
| `breed` | string \| null | Subspecies or breed if applicable |

### Taxonomy

All 7 Linnaean ranks: `kingdom`, `phylum`, `class`, `order`, `family`, `genus`, `species`. Initially from GPT-4o, overridden by GBIF backbone when matched.

### GBIFData

| Field | Type | Description |
|-------|------|-------------|
| `taxonomy` | Taxonomy \| null | GBIF backbone taxonomy (Catalogue of Life) |
| `iucnStatus` | string \| null | Full IUCN status name (e.g., "Least Concern") |
| `iucnCategory` | string \| null | IUCN category code (e.g., "LC", "VU", "EN") |
| `distributions` | string[] | Known distribution localities |
| `establishmentMeans` | string \| null | Native, introduced, etc. |
| `vernacularNames` | object | `{ en: string, es: string }` |
| `gbifUrl` | string \| null | Link to GBIF species page |
| `matchConfidence` | number | 0-100 match confidence from GBIF fuzzy matching |

### EncicloVidaData

| Field | Type | Description |
|-------|------|-------------|
| `speciesId` | number | CONABIO internal species ID |
| `commonNameEs` | string \| null | Authoritative Spanish common name |
| `allCommonNames` | string[] | All registered common names (including indigenous languages) |
| `distributionTypes` | string[] | e.g., ["Endémica", "Nativa residente"] |
| `characteristics` | string[] | Species characteristics from CONABIO |
| `nom059Status` | string \| null | NOM-059-SEMARNAT protection status (e.g., "P" = endangered, "A" = threatened) |
| `photoUrl` | string \| null | CONABIO-verified photo URL |
| `wikipediaSummary` | string \| null | Spanish Wikipedia summary |
| `geodataSources` | string[] | Available geodata (SNIB records, etc.) |
| `enciclovidaUrl` | string | Link to EncicloVida species page |

---

## Database Schema

Single `observations` table. JSONB columns store structured data without rigid normalization.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key, auto-generated |
| `user_id` | TEXT | Clerk user ID, indexed |
| `image_url` | TEXT | Vercel Blob signed URL |
| `image_blob_pathname` | TEXT | Blob storage path for deletion |
| `latitude` / `longitude` | REAL | GPS coordinates from device |
| `common_name` | TEXT | English common name |
| `nombre_comun` | TEXT | Spanish common name |
| `scientific_name` | TEXT | Indexed for species queries |
| `breed` | TEXT | Subspecies/breed |
| `confidence` | INTEGER | 0-100 |
| `taxonomy` | JSONB | 7-rank Linnaean taxonomy |
| `ecology` | JSONB | Habitat, diet, size, lifespan, behavior |
| `geography` | JSONB | Range, Jalisco/Mexico flags, invasive flag |
| `conservation` | JSONB | IUCN status, population trend, threats |
| `similar_species` | JSONB | Array of similar species with distinctions |
| `description` | TEXT | English narrative description |
| `descripcion` | TEXT | Spanish narrative description |
| `fun_fact` | TEXT | Interesting ecological fact |
| `error` | TEXT | Error message if identification failed |
| `suggestion` | TEXT | Suggestion if identification failed |
| `identified_at` | TIMESTAMPTZ | When identification occurred |
| `created_at` | TIMESTAMPTZ | Row creation time |

**Indexes:** `user_id`, `created_at`, `scientific_name`
