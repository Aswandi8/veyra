import { ImageResponse } from "next/og";

import { ShortLinkSocialPreview } from "@/components/shortlinks/shortlink-social-preview";
import {
  getPublicShortLink,
  PublicShortLinkError,
} from "@/lib/shortlinks/public-server";
import { getShortLinkSocialMedia } from "@/lib/shortlinks/social-html";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

const WIDTH = 1200;
const HEIGHT = 630;

function getBaseHostname(requestUrl: string): string {
  try {
    const configured = process.env.NEXT_PUBLIC_SHORTLINK_BASE_URL?.trim();

    return new URL(configured || requestUrl).hostname.replace(/^www\./i, "");
  } catch {
    return "ShortLink";
  }
}

function normalizeDuration(value: string | null): string | null {
  const normalized = value?.trim();

  return normalized ? normalized.slice(0, 12) : null;
}

function getVersion(updatedAt: string): string {
  const timestamp = new Date(updatedAt).getTime();

  if (Number.isFinite(timestamp)) {
    return String(timestamp);
  }

  return updatedAt;
}

function imageErrorResponse(status: number): Response {
  return new Response("Preview unavailable", {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function getPreviewCacheControl(request: Request, updatedAt: string): string {
  const requestUrl = new URL(request.url);

  const requestedVersion = requestUrl.searchParams.get("v");

  const currentVersion = getVersion(updatedAt);

  /*
   * Versioned URL:
   *
   * /preview?v=<updatedAt>
   *
   * Aman di-cache sangat lama karena ShortLink edit
   * menghasilkan URL version baru.
   */
  if (requestedVersion && requestedVersion === currentVersion) {
    return "public, max-age=31536000, s-maxage=31536000, immutable";
  }

  /*
   * Direct/unversioned preview tetap boleh dibuka
   * admin/user, tetapi jangan cache terlalu lama.
   */
  return "public, max-age=60, s-maxage=300, stale-while-revalidate=3600";
}

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;

  try {
    const shortLink = await getPublicShortLink(slug);

    if (shortLink.previewType === "NONE") {
      return imageErrorResponse(404);
    }

    const media = getShortLinkSocialMedia(shortLink);

    if (!media.sourceImageUrl) {
      return imageErrorResponse(404);
    }

    return new ImageResponse(
      ShortLinkSocialPreview({
        imageUrl: media.sourceImageUrl,

        hostname: getBaseHostname(request.url),

        showPlayButton: shortLink.showPlayButton,

        displayDuration: normalizeDuration(shortLink.displayDuration),
      }),
      {
        width: WIDTH,
        height: HEIGHT,

        headers: {
          "Cache-Control": getPreviewCacheControl(request, shortLink.updatedAt),
        },
      },
    );
  } catch (error) {
    if (error instanceof PublicShortLinkError) {
      if (error.status === 404 || error.status === 410) {
        return imageErrorResponse(error.status);
      }
    }

    console.error("[SHORTLINK SOCIAL PREVIEW]", error);

    return imageErrorResponse(500);
  }
}
