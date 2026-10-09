import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// NOTE: /api/image is intentionally NOT protected. The public observations
// gallery (anonymous visitors) renders images through it. Clerk's
// auth.protect() returns 404 for unauthenticated API requests, so listing it
// here silently breaks all gallery images for signed-out users. The route is
// safe to expose: it has its own SSRF allowlist + per-IP rate limiting and
// only serves unguessable blob URLs for approved observations.
const isProtectedRoute = createRouteMatcher([
  "/dashboard",
  "/identify",
  "/review",
  "/api/identify",
  "/api/observations(.*)",
  "/api/review(.*)",
  "/api/geocode",
]);

// Kept as middleware.ts on purpose. Next 16 deprecates this name in favour of
// proxy.ts, but under proxy.ts (Node runtime) Clerk 7 auth.protect() classifies
// every request as a page navigation, so signed-out fetch() calls to the
// protected API routes get a 307 to /sign-in (an HTML page) instead of a 404.
// Verified locally on 2026-10-09 with Next 16.3.8 + @clerk/nextjs 7.9.11.
// Re-test before renaming.
const hasClerkKey = !!process.env.CLERK_SECRET_KEY;

export default hasClerkKey
  ? clerkMiddleware(async (auth, request) => {
      if (isProtectedRoute(request)) {
        await auth.protect();
      }
    })
  : () => NextResponse.next();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
