import type { PublicShortLink } from "@/lib/shortlinks/public-server";

interface SocialHtmlOptions {
  shortLink: PublicShortLink;
  canonicalUrl: string;
}

interface SocialImage {
  url: string | null;
  mimeType: string | null;
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
  if (!value) return null;

  try {
    const pathname = new URL(value).pathname.toLowerCase();

    const match = pathname.match(/\.([a-z0-9]+)$/);

    return match?.[1] ?? null;
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

  url.pathname = url.pathname.replace(
    "/image/upload/",
    "/image/upload/f_jpg,q_auto/",
  );

  return url.toString();
}

function getSocialImage(shortLink: PublicShortLink): SocialImage {
  const sourceUrl = normalizeHttpUrl(shortLink.thumbnailUrl);

  if (!sourceUrl) {
    return {
      url: null,
      mimeType: null,
    };
  }

  const sourceMime =
    shortLink.thumbnailMimeType?.trim().toLowerCase() ||
    inferImageMimeType(sourceUrl);

  const isSvg =
    sourceMime === "image/svg+xml" || getExtension(sourceUrl) === "svg";

  /*
   * SVG Cloudinary:
   *
   * Asset asli tetap SVG.
   * Social delivery menggunakan derived JPEG.
   */
  if (isSvg && isCloudinaryUploadImage(sourceUrl)) {
    return {
      url: createCloudinarySocialJpeg(sourceUrl),

      mimeType: "image/jpeg",
    };
  }

  /*
   * SVG di provider lain tidak otomatis
   * kita ubah karena Veyra tidak boleh
   * mengasumsikan transform API provider.
   *
   * Lebih aman tidak mengirim og:image
   * daripada menjanjikan SVG yang tidak
   * kompatibel di sebagian crawler.
   */
  if (isSvg) {
    return {
      url: null,
      mimeType: null,
    };
  }

  return {
    url: sourceUrl,
    mimeType: sourceMime,
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

export function createShortLinkSocialHtml({
  shortLink,
  canonicalUrl,
}: SocialHtmlOptions): string {
  const normalizedCanonical = normalizeHttpUrl(canonicalUrl) ?? canonicalUrl;

  const title = cleanText(shortLink.title, "Watch", 200);

  const description = cleanText(shortLink.description, title, 500);

  const socialImage = getSocialImage(shortLink);

  const videoUrl =
    shortLink.previewType === "VIDEO"
      ? normalizeHttpUrl(shortLink.previewVideoUrl)
      : null;

  const videoMimeType =
    shortLink.previewVideoMimeType?.trim().toLowerCase() ||
    inferVideoMimeType(videoUrl);

  const ogType = videoUrl ? "video.other" : "website";

  const tags = [
    meta("name", "robots", "noindex,nofollow,noarchive"),

    meta("property", "og:title", title),

    meta("property", "og:description", description),

    meta("property", "og:type", ogType),

    meta("property", "og:url", normalizedCanonical),

    meta("property", "og:image", socialImage.url),

    meta("property", "og:image:secure_url", socialImage.url),

    meta("property", "og:image:type", socialImage.mimeType),

    numberMeta(
      "og:image:width",
      socialImage.url ? shortLink.thumbnailWidth : null,
    ),

    numberMeta(
      "og:image:height",
      socialImage.url ? shortLink.thumbnailHeight : null,
    ),

    meta("property", "og:image:alt", socialImage.url ? title : null),

    meta("property", "og:video", videoUrl),

    meta("property", "og:video:secure_url", videoUrl),

    meta("property", "og:video:type", videoMimeType),

    numberMeta("og:video:width", videoUrl ? shortLink.previewVideoWidth : null),

    numberMeta(
      "og:video:height",
      videoUrl ? shortLink.previewVideoHeight : null,
    ),

    meta(
      "name",
      "twitter:card",
      socialImage.url ? "summary_large_image" : "summary",
    ),

    meta("name", "twitter:title", title),

    meta("name", "twitter:description", description),

    meta("name", "twitter:image", socialImage.url),

    meta("name", "twitter:image:alt", socialImage.url ? title : null),
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
