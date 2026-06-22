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
