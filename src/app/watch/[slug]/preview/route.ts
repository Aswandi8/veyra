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

/*
 * Defensive fallback untuk data lama yang tidak memiliki
 * metadata dimensions.
 *
 * Data ShortLink baru seharusnya menggunakan ukuran
 * thumbnail/poster asli.
 */
const FALLBACK_WIDTH = 1200;
const FALLBACK_HEIGHT = 630;

function normalizeDimension(value: number | null | undefined): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  return Math.round(value);
}

function getPreviewDimensions(
  thumbnailWidth: number | null | undefined,
  thumbnailHeight: number | null | undefined,
  videoWidth: number | null | undefined,
  videoHeight: number | null | undefined,
): PreviewDimensions {
  const imageWidth = normalizeDimension(thumbnailWidth);

  const imageHeight = normalizeDimension(thumbnailHeight);

  if (imageWidth && imageHeight) {
    return {
      width: imageWidth,
      height: imageHeight,
    };
  }

  const normalizedVideoWidth = normalizeDimension(videoWidth);

  const normalizedVideoHeight = normalizeDimension(videoHeight);

  if (normalizedVideoWidth && normalizedVideoHeight) {
    return {
      width: normalizedVideoWidth,

      height: normalizedVideoHeight,
    };
  }

  return {
    width: FALLBACK_WIDTH,

    height: FALLBACK_HEIGHT,
  };
}

function normalizeTitle(value: string | null): string {
  const normalized = value?.trim();

  return normalized ? normalized.slice(0, 120) : "ShortLink";
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

    const media = getShortLinkSocialMedia(shortLink);

    if (!media.sourceImageUrl) {
      return imageErrorResponse(404);
    }

    const dimensions = getPreviewDimensions(
      shortLink.thumbnailWidth,
      shortLink.thumbnailHeight,
      shortLink.previewVideoWidth,
      shortLink.previewVideoHeight,
    );

    return new ImageResponse(
      ShortLinkSocialPreview({
        imageUrl: media.sourceImageUrl,

        title: normalizeTitle(shortLink.title),

        /*
         * Renderer sekarang mengetahui ukuran canvas asli
         * agar seluruh overlay dapat melakukan scaling.
         */
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
