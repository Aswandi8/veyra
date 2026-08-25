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

/*
 * Digunakan hanya jika metadata media benar-benar tidak tersedia.
 *
 * Ini bukan lagi ukuran preview utama.
 */
const FALLBACK_WIDTH = 1200;
const FALLBACK_HEIGHT = 630;

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

function getPreviewDimensions(
  thumbnailWidth: number | null | undefined,
  thumbnailHeight: number | null | undefined,
  videoWidth: number | null | undefined,
  videoHeight: number | null | undefined,
): PreviewDimensions {
  /*
   * Generated preview memakai thumbnail sebagai visual source.
   *
   * Karena itu dimensi thumbnail adalah sumber utama.
   */
  const imageWidth = normalizeDimension(thumbnailWidth);

  const imageHeight = normalizeDimension(thumbnailHeight);

  if (imageWidth && imageHeight) {
    return {
      width: imageWidth,
      height: imageHeight,
    };
  }

  /*
   * VIDEO fallback.
   *
   * Jika metadata thumbnail lama belum mempunyai dimensions,
   * gunakan dimensions video.
   */
  const normalizedVideoWidth = normalizeDimension(videoWidth);

  const normalizedVideoHeight = normalizeDimension(videoHeight);

  if (normalizedVideoWidth && normalizedVideoHeight) {
    return {
      width: normalizedVideoWidth,

      height: normalizedVideoHeight,
    };
  }

  /*
   * Defensive fallback untuk data lama/corrupt.
   *
   * Data baru idealnya tidak pernah sampai sini karena
   * thumbnailWidth + thumbnailHeight sudah tersedia.
   */
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

  /*
   * Versioned preview:
   *
   * /preview?v=<updatedAt>
   *
   * URL berubah setiap ShortLink berubah,
   * sehingga aman menggunakan immutable cache.
   */
  if (requestedVersion && requestedVersion === currentVersion) {
    return "public, max-age=31536000, s-maxage=31536000, immutable";
  }

  /*
   * Unversioned preview tetap short-cache.
   */
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

    /*
     * Tidak ada lagi fixed social canvas 1200 × 630.
     *
     * Preview mengikuti dimensions media asli.
     */
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
