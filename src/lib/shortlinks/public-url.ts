const configuredBaseUrl =
  process.env.NEXT_PUBLIC_SHORTLINK_BASE_URL?.trim().replace(/\/+$/, "");

export function getPublicShortLinkUrl(slug: string): string {
  const normalizedSlug = slug.trim();
  if (!normalizedSlug) return "";

  const path = `/watch/${encodeURIComponent(normalizedSlug)}`;

  if (configuredBaseUrl) {
    return `${configuredBaseUrl}${path}`;
  }

  if (typeof window !== "undefined") {
    return `${window.location.origin}${path}`;
  }

  return path;
}
