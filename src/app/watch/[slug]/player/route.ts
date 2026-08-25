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

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeDimension(value: number | null | undefined): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  return Math.round(value);
}

function unavailableResponse(status: number, message: string): Response {
  return new Response(
    `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow,noarchive">
<title>Video unavailable</title>
</head>
<body>
<p>${escapeHtml(message)}</p>
</body>
</html>`,
    {
      status,

      headers: {
        "Content-Type": "text/html; charset=utf-8",

        "Cache-Control": "no-store",

        "X-Robots-Tag": "noindex, nofollow, noarchive",

        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
    },
  );
}

function playerResponse(
  videoUrl: string,
  posterUrl: string | null,
  videoMimeType: string | null,
  title: string,
  width: number,
  height: number,
): Response {
  const escapedVideoUrl = escapeHtml(videoUrl);

  const escapedPosterUrl = posterUrl ? escapeHtml(posterUrl) : null;

  const escapedVideoMimeType = videoMimeType ? escapeHtml(videoMimeType) : null;

  const escapedTitle = escapeHtml(title);

  const posterAttribute = escapedPosterUrl
    ? ` poster="${escapedPosterUrl}"`
    : "";

  const sourceTypeAttribute = escapedVideoMimeType
    ? ` type="${escapedVideoMimeType}"`
    : "";

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta
  name="viewport"
  content="width=device-width,initial-scale=1,maximum-scale=1"
>
<meta name="robots" content="noindex,nofollow,noarchive">
<title>${escapedTitle}</title>

<style>
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000;
}

body {
  display: flex;
  align-items: center;
  justify-content: center;
}

video {
  display: block;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  background: #000;
  object-fit: contain;
}
</style>
</head>

<body>
<video
  controls
  playsinline
  preload="metadata"
  width="${width}"
  height="${height}"${posterAttribute}
>
  <source
    src="${escapedVideoUrl}"${sourceTypeAttribute}
  >
</video>
</body>
</html>`;

  return new Response(html, {
    status: 200,

    headers: {
      "Content-Type": "text/html; charset=utf-8",

      /*
       * Player boleh di-embed oleh X.
       *
       * Karena itu jangan menambahkan:
       *
       * X-Frame-Options: DENY
       * frame-ancestors 'none'
       */
      "Cache-Control":
        "public, max-age=60, s-maxage=300, stale-while-revalidate=3600",

      "X-Robots-Tag": "noindex, nofollow, noarchive",

      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  });
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;

  const normalizedSlug = slug.trim().toLowerCase();

  if (!normalizedSlug) {
    return unavailableResponse(404, "ShortLink not found.");
  }

  try {
    /*
     * Player tidak memakai tracking endpoint.
     *
     * Membuka iframe/player social tidak boleh
     * dihitung sebagai HUMAN click.
     */
    const shortLink = await getPublicShortLink(normalizedSlug);

    if (shortLink.previewType !== "VIDEO") {
      return unavailableResponse(
        404,
        "Video preview is not available for this ShortLink.",
      );
    }

    const media = getShortLinkSocialMedia(shortLink);

    if (!media.videoUrl) {
      return unavailableResponse(404, "Video source is unavailable.");
    }

    /*
     * Tidak boleh fallback ke 16:9 / portrait / square.
     *
     * Untuk Player Card, dimensi VIDEO asli wajib tersedia.
     */
    const width = normalizeDimension(shortLink.previewVideoWidth);

    const height = normalizeDimension(shortLink.previewVideoHeight);

    if (!width || !height) {
      return unavailableResponse(422, "Video dimensions are unavailable.");
    }

    const title = shortLink.title?.trim().slice(0, 200) || "Watch";

    return playerResponse(
      media.videoUrl,
      media.sourceImageUrl,
      media.videoMimeType,
      title,
      width,
      height,
    );
  } catch (error) {
    if (error instanceof PublicShortLinkError) {
      if (error.status === 404 || error.status === 410) {
        return unavailableResponse(
          error.status,
          error.status === 410
            ? "This ShortLink is currently inactive."
            : "This ShortLink does not exist.",
        );
      }
    }

    console.error("[SHORTLINK PLAYER]", error);

    return unavailableResponse(500, "Video player is temporarily unavailable.");
  }
}
