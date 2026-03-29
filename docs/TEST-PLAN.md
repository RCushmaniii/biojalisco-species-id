# Functional Test Plan — BioJalisco Species Identifier

**Last Updated:** 2026-03-29
**Production URL:** https://biojalisco-species-id.vercel.app
**Status:** Ready for functional testing

---

## Roles

The app has three distinct user roles. All three must be tested independently.

| Role | How to Configure | Pages Accessible |
|------|-----------------|-----------------|
| **Visitor** (unauthenticated) | No login required | Home, Observations, Observation Detail, Species Guide, FAQ, Terms, Privacy |
| **User** (authenticated) | Sign in via Clerk | All visitor pages + Dashboard, Identify, own observation history |
| **Reviewer** (authenticated + role) | Clerk Dashboard > Users > select user > Metadata > set `publicMetadata` to `{"role": "reviewer"}` | All user pages + Review Queue (`/review`) with approve/reject/correct actions |

### Setting Up Reviewer Role

1. Go to https://dashboard.clerk.com
2. Navigate to **Users** > select the user (e.g., Dr. Rosas)
3. Scroll to **Metadata** section
4. In **Public metadata**, enter: `{"role": "reviewer"}`
5. Save — the user now sees the Review link in their nav bar

---

## Test Cases

### 1. Visitor — Public Pages

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 1.1 | Home page loads | Navigate to `/` | Hero section, pipeline section, testimonials, academic foundation all render. No console errors. |
| 1.2 | Observations gallery | Navigate to `/observations` | Masonry grid of approved observations loads. Images render with correct orientation. |
| 1.3 | Gallery lightbox | Click any observation card | Lightbox opens with full image, species name, scientific name, location, date. Bilingual text. |
| 1.4 | Lightbox close | Press Escape, click X, or click outside | Lightbox closes cleanly. |
| 1.5 | Observation detail | Click "View Details" in lightbox or navigate to `/observations/[id]` | Full observation page with all data tabs, image, and metadata. |
| 1.6 | Species guide | Navigate to `/species-guide` | 20 protected Jalisco vertebrates display. Filter by category (mammals, birds, reptiles, amphibians) works. |
| 1.7 | FAQ page | Navigate to `/faq` | 10 bilingual Q&A items. Accordion expand/collapse works. Only one open at a time. |
| 1.8 | Terms of Use | Navigate to `/terms` | 10 sections render. Title shows "Terms of Use — BioJalisco" (no double suffix). |
| 1.9 | Privacy Policy | Navigate to `/privacy` | 11 sections render. Title shows "Privacy Policy — BioJalisco" (no double suffix). |
| 1.10 | 404 page | Navigate to `/nonexistent-page` | Custom 404 page renders (not default Next.js error). |
| 1.11 | Theme toggle | Click sun/moon toggle in nav | Dark/light theme switches. Persists on reload (localStorage). Respects system preference on first visit. |
| 1.12 | Language toggle | Click EN/ES toggle in nav | All visible text switches between English and Spanish. Persists on reload. |
| 1.13 | Mobile navigation | Resize to < 768px, tap hamburger menu | Drawer opens with all nav links. Drawer closes on link click or outside tap. |
| 1.14 | Footer links | Scroll to footer | Data source links (GBIF, iNaturalist, EncicloVida), partner links (UdeG, CONABIO), legal links all work. Open in new tabs. |
| 1.15 | Protected route redirect | Navigate to `/dashboard` while signed out | Redirects to `/sign-in`. |
| 1.16 | PWA install prompt (mobile) | Visit on mobile Chrome/Safari, wait 5 seconds | Install banner appears. Android: shows Install button. iOS: shows Add to Home Screen instructions. Dismiss persists 14 days. |

### 2. Authenticated User — Dashboard & Identification

**Prerequisite:** Sign in via Clerk at `/sign-in`.

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 2.1 | Sign in flow | Go to `/sign-in`, authenticate | Redirects to `/dashboard`. User button appears in nav. |
| 2.2 | Dashboard stats | View `/dashboard` | Shows total observations count, latest observation, and contribution banner. |
| 2.3 | Dashboard history | Scroll down on dashboard | Lists user's past observations with status badges (pending/approved/rejected). |
| 2.4 | Navigate to identify | Click "Identify" in nav | `/identify` page loads with camera/upload interface. |
| 2.5 | Upload photo | Click Upload, select a JPEG/PNG/WebP photo | Preview displays. Location auto-detected (GPS from EXIF or browser geolocation). |
| 2.6 | Camera capture | Click Camera (mobile with camera permission) | Camera viewfinder opens. Capture button takes photo. Preview displays. |
| 2.7 | Location search | Type a location in the search box | Autocomplete suggestions appear. Selecting one updates the map pin. |
| 2.8 | Environment notes | Type habitat description in textarea | Text accepted, max 300 characters enforced. |
| 2.9 | Run identification | Click Identify button | Loading spinner appears. 4-API pipeline runs (may take 8-20s on free tier). Results display in tabbed interface. |
| 2.10 | Result tabs — Overview | Click Overview tab (or default) | Common name, scientific name, confidence score, bilingual description, AI-detected orientation. |
| 2.11 | Result tabs — Taxonomy | Click Taxonomy tab | Full taxonomic hierarchy (kingdom through species). GBIF-verified if enrichment succeeded. |
| 2.12 | Result tabs — Ecology | Click Ecology tab | Size, diet, lifespan, habitat description, behavioral notes. |
| 2.13 | Result tabs — Geography | Click Geography tab | Range description, elevation, ecoregion. Distribution data from GBIF if available. |
| 2.14 | Result tabs — Conservation | Click Conservation tab | IUCN status, NOM-059 status (from EncicloVida), endemic/native/exotic classification, threats. |
| 2.15 | Result tabs — Similar | Click Similar Species tab | 2-3 visually similar species with distinguishing features. |
| 2.16 | Save observation | Click Save button after identification | Observation saved. "Submitted for expert review" notice appears. Status = pending. |
| 2.17 | Invalid file type | Try uploading a .gif or .pdf | Bilingual error message: only JPEG/PNG/WebP/HEIC accepted. |
| 2.18 | Oversized file | Try uploading a file > 20MB | Bilingual error message: file too large. |
| 2.19 | Sign out | Click user button > Sign Out | Redirects to home page. Protected routes no longer accessible. |

### 3. Reviewer — Approval Workflow

**Prerequisite:** Signed in as a user with `publicMetadata.role = 'reviewer'` in Clerk.

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 3.1 | Review nav link | Sign in as reviewer | "Review" link appears in nav with pending count badge (e.g., "Review (3)"). |
| 3.2 | Review queue | Navigate to `/review` | List of pending observations with photo thumbnail, species name, submitter, date. |
| 3.3 | Approve observation | Click Approve on a pending observation | Observation status changes to `approved`. Appears in public gallery. Removed from queue. |
| 3.4 | Reject observation | Click Reject, enter reviewer notes | Observation status changes to `rejected`. Does NOT appear in gallery. Notes saved. |
| 3.5 | Correct observation | Click Correct, modify species name/taxonomy | Original AI identification snapshotted to `originalAiIdentification`. New data overwrites. Status = approved. |
| 3.6 | Re-review blocked | Try to approve/reject an already-processed observation | 409 Conflict response. Cannot re-review. |
| 3.7 | Non-reviewer blocked | Sign in as regular user, navigate to `/review` | Redirected away. API returns 403 Forbidden for review actions. |
| 3.8 | Count endpoint for non-reviewer | Sign in as regular user, check browser console | No 403 errors. `/api/review?count=true` returns `{ count: 0, isReviewer: false }`. Review link hidden. |

### 4. Cross-Cutting — Security, Performance, Responsiveness

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 4.1 | Mobile responsive — 320px | Chrome DevTools > 320px width | All pages usable. No horizontal scroll. Text readable. |
| 4.2 | Mobile responsive — 375px | Chrome DevTools > 375px (iPhone SE) | All pages usable. Gallery cards stack single column. |
| 4.3 | Tablet responsive — 768px | Chrome DevTools > 768px (iPad) | Gallery shows 2-column grid. Nav switches to desktop. |
| 4.4 | Desktop — 1440px | Full desktop width | Gallery shows multi-column masonry. Content centered at max-width. |
| 4.5 | Rate limiting | Submit > 10 identifications in 15 minutes | Rate limit error returned after 10th request. |
| 4.6 | API timeout handling | Identify with slow network (or large image) | If pipeline exceeds Vercel timeout, graceful error message (not blank screen). |
| 4.7 | Offline behavior | Disconnect network after initial load | Service worker serves cached static pages. Identification requires network (expected). |
| 4.8 | OG social preview | Paste URL into Facebook/Twitter/LinkedIn share debugger | BioJalisco OG image (1200x630) renders with frog logo and branding. |
| 4.9 | Dark mode contrast | Switch to dark mode, review all pages | Text readable against dark backgrounds. No invisible text. |
| 4.10 | Light mode contrast | Switch to light mode, review all pages | Text readable. Tabs, labels, secondary text all legible. |
| 4.11 | Keyboard navigation | Tab through identify page and gallery | Focus rings visible (gold outline). All interactive elements reachable. Escape closes modals. |
| 4.12 | Reduced motion | Enable "Reduce motion" in OS settings | All animations suppressed (CSS `prefers-reduced-motion` respected). |

---

## API Endpoints

For direct API testing (e.g., via curl or Postman):

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `POST /api/identify` | POST | Required | Run identification pipeline. Body: multipart form with image + location. Rate limited (10/15min). |
| `GET /api/observations` | GET | None | List approved observations. Supports `?limit=` and `?offset=` pagination. |
| `GET /api/observations/[id]` | GET | None | Single observation detail (approved only for public, any for owner). |
| `PATCH /api/observations/[id]` | PATCH | Required | Update observation (owner only). Toggle `featured` (reviewer only). |
| `DELETE /api/observations/[id]` | DELETE | Required | Delete observation (owner only). |
| `GET /api/review?count=true` | GET | Required | Pending count. Returns `{ count, isReviewer }`. Non-reviewers get `{ count: 0, isReviewer: false }`. |
| `GET /api/review` | GET | Reviewer | List pending observations for review queue. |
| `PATCH /api/review/[id]` | PATCH | Reviewer | Approve, reject, or correct an observation. Body: `{ action, reviewerNotes?, corrections? }` |

---

## Known Limitations

- **Vercel free tier** has 10s function timeout. Full 4-API pipeline can take 8-20s. Vercel Pro recommended for production use.
- **No offline identification** — requires network for AI pipeline.
- **No image cropping/rotation UI** — relies on device camera orientation + EXIF data.
- **Blob storage** uses public access — URLs are unguessable random strings but technically accessible without auth.
- **iNaturalist CV API** is fee-based. App uses their public observations API for species context instead.

---

## Pre-Test Checklist

- [ ] Verify Vercel deployment is READY (latest commit deployed)
- [ ] Verify environment variables set on Vercel: `OPENAI_API_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`
- [ ] Set reviewer role on test account via Clerk Dashboard
- [ ] Have test images ready: clear animal photo (JPEG), blurry photo, non-animal photo, oversized file (>20MB), wrong format (.gif)
- [ ] Test on both mobile device and desktop browser
- [ ] Test in both Chrome and Safari (PWA behavior differs)
