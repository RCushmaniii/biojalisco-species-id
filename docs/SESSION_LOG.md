# Session Log — biojalisco-species-id

Entries are newest-first. Each entry documents one Claude Code working session.

---

## Session: 2026-06-22

### Accomplished

- Fixed public gallery images broken for signed-out visitors — removed both the handler auth gate (#18) and the Clerk middleware protection (#24) on `/api/image`; `auth.protect()` was returning 404 to anonymous requests.
- Added profile/sign-out `UserButton` to the public nav (#19).
- Custom domain **biojalisco.cushlabs.ai** live: Vercel domain + Cloudflare CNAME (DNS-only) + SSL. Repointed SEO/canonical/OG/sitemap/JSON-LD + README badge + portfolio `live_url` (#20, #21) and the CushLabs portfolio "live demo" button (cushlabs #126).
- Migrated rate limiting to **Upstash Redis** distributed sliding window with in-memory fallback (#22), with `KV_*` env-name support (#23); provisioned `biojalisco-ratelimit`; verified global 300/min cap enforced across parallel requests.
- Resolved **all 48 Dependabot vulnerabilities → 0** (#25): in-major bumps of clerk/next/@vercel/blob/drizzle + scoped `pnpm.overrides`.
- Context-aware bilingual back link on observation detail (dashboard vs observations) (#26).
- Fixed flash of dark theme on refresh via blocking inline `<head>` script (#27).
- cushlabs: added `.prettierignore` for generator-owned JSON (#127).

### Decisions Made

- Domain = `biojalisco.cushlabs.ai` (portfolio/demo positioning); standalone domain deferred.
- Stayed in-major on dep bumps (Clerk 6, Next 15) to avoid breaking changes.
- Upstash limiter fails open to in-memory on Redis error — never hard-blocks traffic.
- Edited committed `projects.generated.json` surgically rather than full regen (Vercel uses the committed file; regen re-fetches ~40 repos).

### Immediate Next Steps

- [ ] Verify Drizzle **write** path (create observation via `/api/identify` while signed in) — only the read/query path was verified after the 0.38→0.45 bump.
- [ ] Sanity-check the gallery in an incognito window (anonymous images should now load).

### Technical Debt

- Local `.env.local` was rewritten by `vercel link`; run `vercel env pull .env.local` if local dev breaks (Vercel is source of truth).

### Open Questions / Blockers

- None. (Hit the Vercel Hobby 100-deploy/day cap on 2026-06-21; reset next day. Watch deploy batching going forward.)

---

<!-- New entries go above this line -->
