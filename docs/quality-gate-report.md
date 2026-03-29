# Site Quality Gate Report — BioJalisco Species Identifier

**Date:** 2026-03-29
**URL:** https://biojalisco-species-id.vercel.app
**Framework:** Next.js 15 | **Bilingual:** Yes (EN/ES client-side toggle) | **Deploy:** Vercel

---

```
╔══════════════════════════════════════════════════════╗
║  SITE QUALITY GATE — biojalisco-species-id           ║
║  Framework: Next.js 15  |  Bilingual: Yes  |  Vercel ║
╠══════════════════════════════════════════════════════╣
║                                                      ║
║  SEO & Meta ............... 9/11  ██████████░░  82%  ║
║  Bilingual / i18n ......... 6/8   ██████████░░  75%  ║
║  Visual Identity .......... 5/6   ██████████░░  83%  ║
║  Performance & Assets ..... 7/9   ██████████░░  78%  ║
║  Accessibility ............ 6/9   █████████░░░  67%  ║
║  Security ................. 6/8   ██████████░░  75%  ║
║  Cleanup .................. 5/7   █████████░░░  71%  ║
║                                                      ║
║  OVERALL: 44/58  ━━━━━━━━━━━━━━━━━━━━━━━━━━━  76%   ║
║  VERDICT: CONDITIONAL PASS — 9 items to fix          ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
```

---

## MUST FIX (before next release)

1. **Double title suffix on Terms/Privacy pages** — `title: 'Terms of Use — BioJalisco'` + template `%s — BioJalisco` = "Terms of Use — BioJalisco — BioJalisco". Fix: use just `'Terms of Use'` and `'Privacy Policy'`.

2. **Canonical URL wrong on Terms/Privacy** — Both inherit root canonical `/` instead of their own paths. Fix: add `alternates: { canonical: '/terms' }` and `/privacy`.

3. **Missing aria-label on form inputs** — Location search input (`capture-area.tsx:322`) and environment notes textarea (`:382`) lack label association. Screen readers can't identify these fields.

4. **Missing rel="noopener noreferrer"** on CushLabs link — `site-footer.tsx:53` has `<a href="https://cushlabs.ai">` without security attributes.

5. **Missing preconnect for Google Fonts** — No `<link rel="preconnect" href="https://fonts.googleapis.com">` in root layout. Delays font loading.

## SHOULD FIX (before launch marketing)

6. **8 console.log/warn statements in API routes** — `app/api/identify/route.ts` lines 108, 121, 125, 165, 167, 189, 191, 256 and `lib/inaturalist.ts` lines 64, 81. Server-side only but should be cleaned for production.

7. **Missing loading="lazy" on observation cards** — `observation-card.tsx` img tags don't specify lazy loading. Gallery images below fold should defer.

8. **Observation detail button missing aria-label** — `observation-detail.tsx:56` has `role="button" tabIndex={0}` but no descriptive label.

## NICE TO HAVE

9. **No SVG favicon** — Using PNG/ICO only. SVG favicon scales better across devices.

10. **CSP uses unsafe-eval** — Required by Clerk SDK, but should be documented as known trade-off.

11. **Sitemap missing hreflang alternates** — No `xhtml:link` alternates per URL in sitemap.xml (bilingual site uses client-side toggle, so this is a design choice, not a bug).

12. **FAQ accordion missing aria-controls** — Buttons have `aria-expanded` but no `aria-controls` linking to answer panels.

---

## RUNTIME CHECKS RECOMMENDED

1. **Lighthouse** — Target >90 on Performance, Accessibility, SEO, Best Practices
2. **axe DevTools** — Test homepage, observations gallery, identify page, FAQ
3. **Google Rich Results Test** — Verify JSON-LD renders (Organization, WebSite, FAQ, Breadcrumb)
4. **Social Share Preview** — opengraph.xyz to verify OG image at 1200x630
5. **Mobile Responsiveness** — Test at 320px, 375px, 768px, 1024px, 1440px

---

## POSITIVE FINDINGS

- Zero runtime errors in last hour (403 fix confirmed working)
- Comprehensive JSON-LD structured data (Organization, WebSite, FAQ, Breadcrumb)
- Full OG + Twitter Card meta on all public pages
- Dynamic sitemap with observation pages
- PWA manifest with full icon set (72-512px + maskable)
- OG image generating correctly as PNG
- All images under 500KB, mostly WebP
- prefers-reduced-motion respected globally
- Focus-visible styles on all interactive elements
- No exposed secrets, no .env in git history
- HSTS, X-Frame-Options, X-Content-Type-Options headers configured
- Rate limiting on identify endpoint
- No TODO/FIXME comments, no commented-out code blocks
