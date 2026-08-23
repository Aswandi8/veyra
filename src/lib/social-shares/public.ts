import "server-only";

// ============================================================
// TYPES
// ============================================================

export interface PublicSocialShareWebsite {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
}

export interface PublicSocialShare {
  id: string;

  title: string;
  slug: string;
  description: string | null;

  videoUrl: string;

  thumbnail: string;
  shareThumbnail: string | null;
  socialThumbnail: string;

  duration: number | null;
  displayDuration: string | null;

  targetUrl: string;
  shareUrl: string | null;

  website: PublicSocialShareWebsite;

  createdAt: string;
  updatedAt: string;
}

interface PublicSocialShareResponse {
  success: boolean;

  data?: PublicSocialShare;

  error?: string;
}

// ============================================================
// CONFIG
// ============================================================

const CENTRAL_API_URL = process.env.CENTRAL_API_URL;

if (!CENTRAL_API_URL) {
  throw new Error("CENTRAL_API_URL is not configured");
}

// ============================================================
// DOMAIN
// ============================================================

export function normalizePublicDomain(value: string): string {
  return value.trim().toLowerCase().split(",")[0].trim().split(":")[0];
}

// ============================================================
// GET SOCIAL SHARE
// ============================================================

export async function getPublicSocialShare(
  slug: string,
  domain: string,
): Promise<PublicSocialShare | null> {
  const normalizedDomain = normalizePublicDomain(domain);

  if (!slug.trim() || !normalizedDomain) {
    return null;
  }

  const url = new URL(
    `/api/v1/public/social-shares/${encodeURIComponent(slug)}`,
    CENTRAL_API_URL,
  );

  url.searchParams.set("domain", normalizedDomain);

  const response = await fetch(url, {
    method: "GET",

    headers: {
      Accept: "application/json",
    },

    /*
     * Jangan cache terlalu lama.
     * Social Share dapat di-edit dari Veyra.
     */
    next: {
      revalidate: 60,
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    console.error("[PUBLIC SOCIAL SHARE]", {
      status: response.status,

      slug,

      domain: normalizedDomain,
    });

    return null;
  }

  let result: PublicSocialShareResponse;

  try {
    result = (await response.json()) as PublicSocialShareResponse;
  } catch {
    return null;
  }

  if (!result.success || !result.data) {
    return null;
  }

  return result.data;
}
