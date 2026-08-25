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

interface PreviewDimensions {
  width: number;
  height: number;
}

function normalizeDimension(value: number | null | undefined): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  return Math.round(value);
}

function getImageDimensions(
  width: number | null | undefined,
  height: number | null | undefined,
): PreviewDimensions | null {
  const normalizedWidth = normalizeDimension(width);

  const normalizedHeight = normalizeDimension(height);

  if (!normalizedWidth || !normalizedHeight) {
    return null;
  }

  return {
    width: normalizedWidth,
    height: normalizedHeight,
  };
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

function imageErrorResponse(status: number, message = "Preview unavailable") {
  return new Response(message, {
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

  if (requestedVersion && requestedVersion === currentVersion) {
    return "public, max-age=31536000, s-maxage=31536000, immutable";
  }

  return "public, max-age=60, s-maxage=300, stale-while-revalidate=3600";
}

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;

  const normalizedSlug = slug.trim().toLowerCase();

  if (!normalizedSlug) {
    return imageErrorResponse(404);
  }

  try {
    const shortLink = await getPublicShortLink(normalizedSlug);

    /*
     * /preview pada tahap ini khusus generated IMAGE preview.
     */
    if (shortLink.previewType !== "IMAGE") {
      return imageErrorResponse(404);
    }

    const media = getShortLinkSocialMedia(shortLink);

    if (!media.sourceImageUrl) {
      return imageErrorResponse(404);
    }

    /*
     * Dimensi canvas WAJIB berasal dari thumbnail asli.
     *
     * Tidak ada:
     *
     * - 1200x630
     * - 16:9
     * - fallback dimensi VIDEO
     * - fallback ukuran lainnya
     */
    const dimensions = getImageDimensions(
      shortLink.thumbnailWidth,
      shortLink.thumbnailHeight,
    );

    if (!dimensions) {
      return imageErrorResponse(
        422,
        "Original image dimensions are unavailable",
      );
    }

    return new ImageResponse(
      ShortLinkSocialPreview({
        imageUrl: media.sourceImageUrl,
        title: shortLink.title,
        width: dimensions.width,

        height: dimensions.height,

        showPlayButton: shortLink.showPlayButton,

        displayDuration: normalizeDuration(shortLink.displayDuration),
      }),

      {
        width: dimensions.width,

        height: dimensions.height,

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
