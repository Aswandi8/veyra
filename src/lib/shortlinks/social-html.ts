import type { PublicShortLink } from "@/lib/shortlinks/public-server";

interface SocialHtmlOptions {
  shortLink: PublicShortLink;
  canonicalUrl: string;
}

export interface ShortLinkSocialMedia {
  sourceImageUrl: string | null;
  sourceImageMimeType: string | null;
  videoUrl: string | null;
  videoMimeType: string | null;
}

interface PreviewDimensions {
  width: number | null;
  height: number | null;
}

interface PlayerDimensions {
  width: number;
  height: number;
}

function cleanText(
  value: string | null | undefined,
  fallback: string,
  maxLength: number,
): string {
  const normalized = value
    ?.replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return (normalized || fallback).slice(0, maxLength);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeHttpUrl(value: string | null | undefined): string | null {
  const normalized = value?.trim();

  if (!normalized) {
    return null;
  }

  try {
    const url = new URL(normalized);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

function normalizeDimension(value: number | null | undefined): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  return Math.round(value);
}

function getPreviewDimensions(shortLink: PublicShortLink): PreviewDimensions {
  const thumbnailWidth = normalizeDimension(shortLink.thumbnailWidth);

  const thumbnailHeight = normalizeDimension(shortLink.thumbnailHeight);

  if (thumbnailWidth && thumbnailHeight) {
    return {
      width: thumbnailWidth,
      height: thumbnailHeight,
    };
  }

  /*
   * Fallback khusus VIDEO apabila metadata poster
   * belum tersedia tetapi dimensi video tersedia.
   */
  if (shortLink.previewType === "VIDEO") {
    const videoWidth = normalizeDimension(shortLink.previewVideoWidth);

    const videoHeight = normalizeDimension(shortLink.previewVideoHeight);

    if (videoWidth && videoHeight) {
      return {
        width: videoWidth,
        height: videoHeight,
      };
    }
  }

  return {
    width: null,
    height: null,
  };
}

function getPlayerDimensions(
  shortLink: PublicShortLink,
): PlayerDimensions | null {
  if (shortLink.previewType !== "VIDEO") {
    return null;
  }

  /*
   * Untuk X Player Card kita TIDAK memakai
   * dimensi thumbnail.
   *
   * Rasio player harus mengikuti video asli.
   */
  const width = normalizeDimension(shortLink.previewVideoWidth);

  const height = normalizeDimension(shortLink.previewVideoHeight);

  if (!width || !height) {
    return null;
  }

  return {
    width,
    height,
  };
}

function getExtension(value: string | null): string | null {
  if (!value) {
    return null;
  }

  try {
    return (
      new URL(value).pathname.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] ?? null
    );
  } catch {
    return null;
  }
}

function inferImageMimeType(url: string | null): string | null {
  switch (getExtension(url)) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";

    case "png":
      return "image/png";

    case "webp":
      return "image/webp";

    case "gif":
      return "image/gif";

    case "avif":
      return "image/avif";

    case "svg":
      return "image/svg+xml";

    default:
      return null;
  }
}

function inferVideoMimeType(url: string | null): string | null {
  switch (getExtension(url)) {
    case "mp4":
      return "video/mp4";

    case "webm":
      return "video/webm";

    case "mov":
      return "video/quicktime";

    case "m4v":
      return "video/x-m4v";

    default:
      return null;
  }
}

function isCloudinaryUploadImage(value: string): boolean {
  try {
    const url = new URL(value);

    return (
      url.hostname === "res.cloudinary.com" &&
      url.pathname.includes("/image/upload/")
    );
  } catch {
    return false;
  }
}

function createCloudinarySocialJpeg(value: string): string {
  const url = new URL(value);

  url.pathname = url.pathname
    .replace("/image/upload/", "/image/upload/f_jpg,q_auto/")
    .replace(/\.svg$/i, ".jpg");

  return url.toString();
}

export function getShortLinkSocialMedia(
  shortLink: PublicShortLink,
): ShortLinkSocialMedia {
  const originalImageUrl = normalizeHttpUrl(shortLink.thumbnailUrl);

  let sourceImageUrl = originalImageUrl;

  let sourceImageMimeType =
    shortLink.thumbnailMimeType?.trim().toLowerCase() ||
    inferImageMimeType(originalImageUrl);

  const isSvg =
    sourceImageMimeType === "image/svg+xml" ||
    getExtension(originalImageUrl) === "svg";

  if (originalImageUrl && isSvg && isCloudinaryUploadImage(originalImageUrl)) {
    sourceImageUrl = createCloudinarySocialJpeg(originalImageUrl);

    sourceImageMimeType = "image/jpeg";
  } else if (isSvg) {
    /*
     * SVG non-Cloudinary tidak digunakan sebagai
     * source social preview.
     */
    sourceImageUrl = null;
    sourceImageMimeType = null;
  }

  const videoUrl =
    shortLink.previewType === "VIDEO"
      ? normalizeHttpUrl(shortLink.previewVideoUrl)
      : null;

  const videoMimeType =
    shortLink.previewVideoMimeType?.trim().toLowerCase() ||
    inferVideoMimeType(videoUrl);

  return {
    sourceImageUrl,
    sourceImageMimeType,
    videoUrl,
    videoMimeType,
  };
}

function meta(
  attribute: "property" | "name",
  key: string,
  value: string | null | undefined,
): string {
  const normalized = value?.trim();

  if (!normalized) {
    return "";
  }

  return `<meta ${attribute}="${escapeHtml(key)}" content="${escapeHtml(
    normalized,
  )}">`;
}

function numberMeta(
  attribute: "property" | "name",
  key: string,
  value: number | null | undefined,
): string {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return "";
  }

  return meta(attribute, key, String(Math.round(value)));
}

function getPreviewVersion(updatedAt: string): string {
  const timestamp = new Date(updatedAt).getTime();

  if (Number.isFinite(timestamp)) {
    return String(timestamp);
  }

  return encodeURIComponent(updatedAt);
}

function getGeneratedPreviewUrl(
  canonicalUrl: string,
  updatedAt: string,
): string {
  const base = canonicalUrl.replace(/\/+$/, "");

  const version = getPreviewVersion(updatedAt);

  return `${base}/preview?v=${version}`;
}

function getPlayerUrl(canonicalUrl: string): string {
  return `${canonicalUrl.replace(/\/+$/, "")}/player`;
}

export function createShortLinkSocialHtml({
  shortLink,
  canonicalUrl,
}: SocialHtmlOptions): string {
  const normalizedCanonical = normalizeHttpUrl(canonicalUrl) ?? canonicalUrl;

  const title = cleanText(shortLink.title, "Watch", 200);

  const description = cleanText(shortLink.description, title, 500);

  const media = getShortLinkSocialMedia(shortLink);

  const previewDimensions = getPreviewDimensions(shortLink);

  const playerDimensions = getPlayerDimensions(shortLink);

  const generatedPreviewUrl = media.sourceImageUrl
    ? getGeneratedPreviewUrl(normalizedCanonical, shortLink.updatedAt)
    : null;

  /*
   * ==========================================================
   * VIDEO
   * ==========================================================
   *
   * X:
   * twitter:card   = player
   * twitter:player = /watch/[slug]/player
   *
   * Width/height selalu berasal dari dimensi VIDEO asli.
   *
   * Facebook / Open Graph:
   * tetap mendapatkan og:video + og:image fallback.
   */
  const validVideo =
    shortLink.previewType === "VIDEO" && Boolean(media.videoUrl);

  const validPlayer = validVideo && Boolean(playerDimensions);

  const playerUrl = validPlayer ? getPlayerUrl(normalizedCanonical) : null;

  const ogType = validVideo ? "video.other" : "website";

  const tags = [
    meta("name", "robots", "noindex,follow"),

    // ========================================================
    // OPEN GRAPH
    // ========================================================

    meta("property", "og:title", title),

    meta("property", "og:description", description),

    meta("property", "og:type", ogType),

    meta("property", "og:url", normalizedCanonical),

    // ========================================================
    // IMAGE / POSTER FALLBACK
    // ========================================================

    meta("property", "og:image", generatedPreviewUrl),

    meta("property", "og:image:secure_url", generatedPreviewUrl),

    meta("property", "og:image:type", generatedPreviewUrl ? "image/png" : null),

    numberMeta(
      "property",
      "og:image:width",
      generatedPreviewUrl ? previewDimensions.width : null,
    ),

    numberMeta(
      "property",
      "og:image:height",
      generatedPreviewUrl ? previewDimensions.height : null,
    ),

    meta("property", "og:image:alt", generatedPreviewUrl ? title : null),

    // ========================================================
    // ORIGINAL VIDEO
    // ========================================================

    meta("property", "og:video", validVideo ? media.videoUrl : null),

    meta("property", "og:video:secure_url", validVideo ? media.videoUrl : null),

    meta("property", "og:video:type", validVideo ? media.videoMimeType : null),

    numberMeta(
      "property",
      "og:video:width",
      validVideo ? shortLink.previewVideoWidth : null,
    ),

    numberMeta(
      "property",
      "og:video:height",
      validVideo ? shortLink.previewVideoHeight : null,
    ),

    // ========================================================
    // X PLAYER CARD — VIDEO ONLY
    // ========================================================

    meta("name", "twitter:card", validPlayer ? "player" : null),

    meta("name", "twitter:title", validPlayer ? title : null),

    meta("name", "twitter:description", validPlayer ? description : null),

    /*
     * Poster fallback X.
     *
     * Generated preview memakai rasio media asli,
     * bukan 1200×630.
     */
    meta("name", "twitter:image", validPlayer ? generatedPreviewUrl : null),

    meta(
      "name",
      "twitter:image:alt",
      validPlayer && generatedPreviewUrl ? title : null,
    ),

    meta("name", "twitter:player", playerUrl),

    numberMeta("name", "twitter:player:width", playerDimensions?.width),

    numberMeta("name", "twitter:player:height", playerDimensions?.height),
  ]
    .filter(Boolean)
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
${tags}
<link rel="canonical" href="${escapeHtml(normalizedCanonical)}">
</head>
<body>
<p>${escapeHtml(title)}</p>
</body>
</html>`;
}
