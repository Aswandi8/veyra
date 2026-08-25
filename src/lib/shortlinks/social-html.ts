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

function getImageDimensions(shortLink: PublicShortLink): PreviewDimensions {
  return {
    width: normalizeDimension(shortLink.thumbnailWidth),
    height: normalizeDimension(shortLink.thumbnailHeight),
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

  /*
   * Social crawler tidak selalu menerima SVG sebagai poster.
   *
   * Jika source merupakan Cloudinary image, gunakan representasi JPG.
   */
  if (originalImageUrl && isSvg && isCloudinaryUploadImage(originalImageUrl)) {
    sourceImageUrl = createCloudinarySocialJpeg(originalImageUrl);
    sourceImageMimeType = "image/jpeg";
  } else if (isSvg) {
    sourceImageUrl = null;
    sourceImageMimeType = null;
  }

  const videoUrl =
    shortLink.previewType === "VIDEO"
      ? normalizeHttpUrl(shortLink.previewVideoUrl)
      : null;

  const videoMimeType = videoUrl
    ? shortLink.previewVideoMimeType?.trim().toLowerCase() ||
      inferVideoMimeType(videoUrl)
    : null;

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

export function createShortLinkSocialHtml({
  shortLink,
  canonicalUrl,
}: SocialHtmlOptions): string {
  const normalizedCanonical = normalizeHttpUrl(canonicalUrl) ?? canonicalUrl;

  const title = cleanText(shortLink.title, "Watch", 200);
  const description = cleanText(shortLink.description, title, 500);

  const media = getShortLinkSocialMedia(shortLink);

  const isImage = shortLink.previewType === "IMAGE";
  const isVideo = shortLink.previewType === "VIDEO";

  const imageDimensions = getImageDimensions(shortLink);

  /*
   * IMAGE
   *
   * Generated preview tetap menggunakan canvas dengan dimensi
   * thumbnail asli.
   *
   * Tidak ada hardcode 1200x630.
   * Tidak ada hardcode 16:9.
   * Tidak ada perubahan portrait / landscape / square.
   */
  const generatedImagePreviewUrl =
    isImage && media.sourceImageUrl
      ? getGeneratedPreviewUrl(normalizedCanonical, shortLink.updatedAt)
      : null;

  /*
   * VIDEO tetap seperti implementasi sebelumnya.
   */
  const validVideo = isVideo && Boolean(media.videoUrl);

  const videoWidth = validVideo
    ? normalizeDimension(shortLink.previewVideoWidth)
    : null;

  const videoHeight = validVideo
    ? normalizeDimension(shortLink.previewVideoHeight)
    : null;

  const twitterVideoImageUrl = validVideo ? media.sourceImageUrl : null;

  const tags = [
    meta("name", "robots", "noindex,follow"),

    // ========================================================
    // OPEN GRAPH CORE
    // ========================================================

    meta("property", "og:title", title),

    meta("property", "og:description", description),

    meta("property", "og:type", validVideo ? "video.other" : "website"),

    meta("property", "og:url", normalizedCanonical),

    // ========================================================
    // IMAGE
    //
    // Source = generated /preview.
    // Dimensions = thumbnail asli.
    // ========================================================

    meta("property", "og:image", generatedImagePreviewUrl),

    meta("property", "og:image:secure_url", generatedImagePreviewUrl),

    meta(
      "property",
      "og:image:type",
      generatedImagePreviewUrl ? "image/png" : null,
    ),

    numberMeta(
      "property",
      "og:image:width",
      generatedImagePreviewUrl ? imageDimensions.width : null,
    ),

    numberMeta(
      "property",
      "og:image:height",
      generatedImagePreviewUrl ? imageDimensions.height : null,
    ),

    meta("property", "og:image:alt", generatedImagePreviewUrl ? title : null),

    // ========================================================
    // VIDEO
    //
    // TIDAK DIUBAH.
    // ========================================================

    meta("property", "og:video", validVideo ? media.videoUrl : null),

    meta("property", "og:video:secure_url", validVideo ? media.videoUrl : null),

    meta("property", "og:video:type", validVideo ? media.videoMimeType : null),

    numberMeta("property", "og:video:width", videoWidth),

    numberMeta("property", "og:video:height", videoHeight),

    // ========================================================
    // X / TWITTER - IMAGE
    //
    // Card meminta X menggunakan image presentation besar.
    //
    // Yang diberikan kepada X tetap /preview dengan ukuran
    // thumbnail asli. Veyra tidak mengubahnya menjadi 16:9.
    // ========================================================

    meta(
      "name",
      "twitter:card",
      generatedImagePreviewUrl
        ? "summary_large_image"
        : validVideo
          ? "player"
          : null,
    ),

    meta(
      "name",
      "twitter:title",
      generatedImagePreviewUrl || validVideo ? title : null,
    ),

    meta(
      "name",
      "twitter:description",
      generatedImagePreviewUrl || validVideo ? description : null,
    ),

    /*
     * IMAGE:
     * /preview dengan dimensi asli.
     *
     * VIDEO:
     * poster seperti implementasi sebelumnya.
     */
    meta(
      "name",
      "twitter:image",
      generatedImagePreviewUrl ?? twitterVideoImageUrl,
    ),

    meta(
      "name",
      "twitter:image:alt",
      generatedImagePreviewUrl || twitterVideoImageUrl ? title : null,
    ),

    /*
     * Untuk IMAGE kita juga menyatakan dimensi source sebenarnya.
     *
     * Contoh fokus-image:
     * 1178 x 2071
     */
    numberMeta(
      "name",
      "twitter:image:width",
      generatedImagePreviewUrl ? imageDimensions.width : null,
    ),

    numberMeta(
      "name",
      "twitter:image:height",
      generatedImagePreviewUrl ? imageDimensions.height : null,
    ),
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
