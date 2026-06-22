import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Generous per-IP limit: the public gallery legitimately loads up to ~100
// images in a single page view, so the cap bounds abusive floods without
// breaking normal browsing. Bandwidth-only endpoint (no paid API behind it).
const RATE_LIMIT_MAX = 300;
const RATE_LIMIT_WINDOW = 60 * 1000;

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

function isAllowedBlobUrl(raw: string): boolean {
  try {
    const parsed = new URL(raw);
    // Must be HTTPS and hostname must end with .blob.vercel-storage.com
    return (
      parsed.protocol === "https:" &&
      parsed.hostname.endsWith(".blob.vercel-storage.com")
    );
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  // Public proxy: the community observations gallery is public and only lists
  // approved observations. Blob URLs are unguessable, and isAllowedBlobUrl below
  // restricts fetches to Vercel Blob hosts (SSRF protection). No auth gate here —
  // an auth requirement breaks images for unauthenticated visitors (see commit 16c9b5f).
  const rateCheck = checkRateLimit(
    `image:${getClientIp(request)}`,
    RATE_LIMIT_MAX,
    RATE_LIMIT_WINDOW,
  );
  if (!rateCheck.allowed) {
    return new NextResponse("Too many requests", {
      status: 429,
      headers: { "Retry-After": String(Math.ceil(rateCheck.resetMs / 1000)) },
    });
  }

  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return new NextResponse("Missing url param", { status: 400 });
  }

  if (!isAllowedBlobUrl(url)) {
    return new NextResponse("Invalid URL", { status: 400 });
  }

  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return new NextResponse("Image not found", { status: 404 });
    }

    // Validate response is actually an image
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      return new NextResponse("Not an image", { status: 400 });
    }

    const body = await response.arrayBuffer();
    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (err) {
    console.error(
      "Image proxy error:",
      err instanceof Error ? err.message : err,
    );
    return new NextResponse("Failed to fetch image", { status: 500 });
  }
}
