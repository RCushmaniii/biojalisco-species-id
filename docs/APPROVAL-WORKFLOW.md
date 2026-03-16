# Observation Approval Workflow

## Overview

All species identifications go through an expert review process before appearing in the public community gallery. This ensures data quality and scientific accuracy — similar to iNaturalist's "research grade" system, but using direct expert review instead of community consensus.

## How It Works

### For Researchers (Field Team)

1. **Take a photo** — Use the Identify page to photograph or upload an animal
2. **AI identifies the species** — The four-API pipeline (iNaturalist + GPT-4o + GBIF + EncicloVida) runs and returns results
3. **Results appear immediately** — You see the full identification with taxonomy, ecology, conservation data, and similar species
4. **Observation is saved as "Pending"** — Your observation is saved to the database but is NOT yet visible in the public gallery
5. **Check your Dashboard** — Your Dashboard shows all your observations with status badges:
   - **Pending Review** (orange) — Awaiting expert review
   - **Approved** — Verified and visible in the community gallery
   - **Rejected** (red) — Not approved, with reviewer notes explaining why
6. **No action needed from you** — The research lead reviews and approves observations on their own schedule

### For the Research Lead (Reviewer)

The reviewer (Dr. Veronica Rosas) has a dedicated **Review Queue** accessible from the navigation bar.

#### Accessing the Review Queue

1. Log in with your Clerk account (must have `reviewer` role set — see Setup below)
2. Click **"Review"** in the navigation bar — a badge shows the number of pending observations
3. The Review Queue page shows all pending observations, oldest first

#### Reviewing an Observation

Click any observation in the queue to expand it. You'll see:

- **Full-size photo** of the animal
- **AI identification** — species name, scientific name, confidence score
- **AI description** — what the AI thinks about the species
- **Taxonomy** — order, family, genus classification
- **IUCN conservation status**
- **Field notes** — any environment/habitat notes the researcher added
- **Location** — GPS coordinates or place name

#### Review Actions

You have three options for each observation:

**Approve** — One click. The observation appears in the public community gallery immediately. Use this when the AI identification is correct.

**Correct & Approve** — If the AI got the species wrong but you know what it is:
1. Click **"Correct"**
2. Edit the Common Name (EN), Common Name (ES), and/or Scientific Name
3. Click **"Correct & Approve"**
4. The original AI identification is preserved in the database for audit purposes
5. The corrected identification is what appears in the gallery

**Reject** — If the photo is unusable, not an animal, or otherwise unsuitable:
1. Click **"Reject"**
2. Enter a reason (required) — e.g., "Photo too blurry to identify" or "Not a vertebrate"
3. Click **"Confirm Rejection"**
4. The observation stays in the researcher's dashboard with the rejection reason visible

## Roles

| Role | Who | What They Can Do |
|------|-----|-----------------|
| **Researcher** | Field team members | Submit photos, view their own observations (all statuses), browse approved gallery |
| **Reviewer** | Dr. Veronica Rosas | Everything researchers can do + access Review Queue, approve/reject/correct observations |

## Setup: Assigning the Reviewer Role

The reviewer role is managed through Clerk's user metadata. No code changes needed to add or remove reviewers.

### Steps:

1. Go to the [Clerk Dashboard](https://dashboard.clerk.com/)
2. Navigate to **Users**
3. Find Dr. Rosas's account and click on it
4. Click **"Edit metadata"** (or find the Public Metadata section)
5. Set the public metadata to:
   ```json
   {
     "role": "reviewer"
   }
   ```
6. Save

To add additional reviewers in the future, set the same metadata on their Clerk user accounts.

## Data Flow

```
Researcher takes photo
        |
        v
  AI Pipeline runs (iNat + GPT-4o + GBIF + EncicloVida)
        |
        v
  Observation saved (status: "pending")
        |
        v
  Researcher sees results + "Pending Review" badge
        |
        v
  Reviewer sees observation in Review Queue
        |
        +---> Approve ---> status: "approved" ---> Visible in public gallery
        |
        +---> Correct & Approve ---> Original AI data archived,
        |                            corrected data saved,
        |                            status: "approved" ---> Visible in gallery
        |
        +---> Reject ---> status: "rejected" ---> NOT in gallery,
                          rejection notes saved     visible in researcher's dashboard
```

## Database Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | text | `'pending'`, `'approved'`, or `'rejected'` |
| `reviewer_notes` | text | Optional notes from the reviewer (required for rejections) |
| `reviewed_by` | text | Clerk userId of the reviewer who took action |
| `reviewed_at` | timestamp | When the review action was taken |
| `original_ai_identification` | jsonb | Snapshot of original AI-generated fields before any corrections |

## API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/review` | GET | Reviewer | List pending observations |
| `/api/review?count=true` | GET | Reviewer | Get pending count (for nav badge) |
| `/api/review/[id]` | PATCH | Reviewer | Approve, reject, or correct an observation |

### PATCH `/api/review/[id]` Body

**Approve:**
```json
{ "action": "approve" }
```

**Approve with notes:**
```json
{ "action": "approve", "notes": "Confirmed in field guide" }
```

**Correct and approve:**
```json
{
  "action": "approve",
  "notes": "Corrected by reviewer",
  "corrections": {
    "commonName": "Cinnamon Hummingbird",
    "scientificName": "Amazilia rutila",
    "nombreComun": "Colibri Canela"
  }
}
```

**Reject:**
```json
{
  "action": "reject",
  "notes": "Photo too blurry to make a reliable identification"
}
```

## Migration Notes

When this feature is first deployed, all existing observations in the database will have `status = 'pending'` (the column default). Run this SQL query to approve all existing observations so the gallery doesn't go blank:

```sql
UPDATE observations SET status = 'approved' WHERE status = 'pending';
```

After running this query, only new submissions will enter the pending review queue.

---

*Built by CushLabs AI Services — info@cushlabs.ai*
