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
    sourceImageUrl = null;

    sourceImageMimeType = null;
  }

  /*
   * IMAGE tidak memiliki video metadata.
   *
   * VIDEO tetap mengirim video asli sebagai
   * og:video sambil generated preview image
   * menjadi static fallback.
   */
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

function numberMeta(property: string, value: number | null): string {
  if (value === null || !Number.isFinite(value) || value <= 0) {
    return "";
  }

  return meta("property", property, String(value));
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

export function createShortLinkSocialHtml({
  shortLink,
  canonicalUrl,
}: SocialHtmlOptions): string {
  const normalizedCanonical = normalizeHttpUrl(canonicalUrl) ?? canonicalUrl;

  const title = cleanText(shortLink.title, "Watch", 200);

  const description = cleanText(shortLink.description, title, 500);

  const media = getShortLinkSocialMedia(shortLink);

  /*
   * IMAGE dan VIDEO sekarang selalu mempunyai
   * image/poster sehingga tidak ada NONE branch.
   */
  const generatedPreviewUrl = media.sourceImageUrl
    ? getGeneratedPreviewUrl(normalizedCanonical, shortLink.updatedAt)
    : null;

  const ogType = media.videoUrl ? "video.other" : "website";

  const tags = [
    meta("name", "robots", "noindex,follow"),

    meta("property", "og:title", title),

    meta("property", "og:description", description),

    meta("property", "og:type", ogType),

    meta("property", "og:url", normalizedCanonical),

    meta("property", "og:image", generatedPreviewUrl),

    meta("property", "og:image:secure_url", generatedPreviewUrl),

    meta("property", "og:image:type", generatedPreviewUrl ? "image/png" : null),

    numberMeta("og:image:width", generatedPreviewUrl ? 1200 : null),

    numberMeta("og:image:height", generatedPreviewUrl ? 630 : null),

    meta("property", "og:image:alt", generatedPreviewUrl ? title : null),

    /*
     * VIDEO-only metadata.
     */
    meta("property", "og:video", media.videoUrl),

    meta("property", "og:video:secure_url", media.videoUrl),

    meta("property", "og:video:type", media.videoMimeType),

    numberMeta(
      "og:video:width",
      media.videoUrl ? shortLink.previewVideoWidth : null,
    ),

    numberMeta(
      "og:video:height",
      media.videoUrl ? shortLink.previewVideoHeight : null,
    ),

    /*
     * X image fallback tetap generated preview.
     */
    meta(
      "name",
      "twitter:card",
      generatedPreviewUrl ? "summary_large_image" : "summary",
    ),

    meta("name", "twitter:title", title),

    meta("name", "twitter:description", description),

    meta("name", "twitter:image", generatedPreviewUrl),

    meta("name", "twitter:image:alt", generatedPreviewUrl ? title : null),
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
