import "server-only";

import { getCentralApiUrl } from "@/lib/auth/proxy";

export type PublicShortLinkStatus = "ACTIVE" | "INACTIVE";

export type PublicShortLinkPreviewType = "IMAGE" | "VIDEO";

export interface PublicShortLink {
  id: string;

  slug: string;

  destinationUrl: string;

  status: PublicShortLinkStatus;

  previewType: PublicShortLinkPreviewType;

  title: string | null;

  description: string | null;

  thumbnailUrl: string | null;
  thumbnailWidth: number | null;
  thumbnailHeight: number | null;
  thumbnailMimeType: string | null;
  thumbnailSizeBytes: number | null;

  previewVideoUrl: string | null;
  previewVideoWidth: number | null;
  previewVideoHeight: number | null;
  previewVideoDurationMs: number | null;
  previewVideoMimeType: string | null;
  previewVideoSizeBytes: number | null;

  showPlayButton: boolean;

  displayDuration: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface PublicShortLinkTrackData {
  destinationUrl: string;

  visitorType: "HUMAN" | "CRAWLER" | "BOT" | "UNKNOWN";

  socialCrawler: boolean;

  crawlerName: string | null;

  tracked: boolean;

  duplicate: boolean;

  counted: boolean;

  clickCount: number | null;

  shortLink: PublicShortLink | null;
}

interface TrackResponse {
  success: boolean;

  data?: PublicShortLinkTrackData;

  code?: string;

  error?: string;
}

interface ResolveResponse {
  success: boolean;

  data?: PublicShortLink;

  code?: string;

  error?: string;
}

export class PublicShortLinkError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);

    this.name = "PublicShortLinkError";
  }
}

function getInternalKey(): string {
  const key = process.env.SHORTLINK_INTERNAL_KEY?.trim();

  if (!key) {
    throw new Error("SHORTLINK_INTERNAL_KEY is required");
  }

  return key;
}

function firstForwardedIp(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const first = value
    .split(",")
    .map((part) => part.trim())
    .find(Boolean);

  if (!first) {
    return null;
  }

  if (first.startsWith("::ffff:")) {
    return first.slice(7);
  }

  return first;
}

function getVisitorIp(headers: Headers): string | null {
  const candidates = [
    headers.get("cf-connecting-ip"),

    headers.get("x-vercel-forwarded-for"),

    headers.get("x-real-ip"),

    headers.get("x-forwarded-for"),
  ];

  for (const candidate of candidates) {
    const ip = firstForwardedIp(candidate);

    if (ip) {
      return ip;
    }
  }

  return null;
}

function getVisitorCountry(headers: Headers): string | null {
  const candidates = [
    headers.get("cf-ipcountry"),

    headers.get("x-vercel-ip-country"),

    headers.get("x-country-code"),
  ];

  for (const candidate of candidates) {
    const value = candidate?.trim().toUpperCase();

    if (value && /^[A-Z]{2}$/.test(value) && value !== "XX") {
      return value;
    }
  }

  return null;
}

function setOptionalHeader(
  headers: Headers,
  name: string,
  value: string | null,
) {
  const normalized = value?.trim();

  if (normalized) {
    headers.set(name, normalized);
  }
}

function createTrackingHeaders(request: Request): Headers {
  const headers = new Headers();

  headers.set("x-shortlink-internal-key", getInternalKey());

  setOptionalHeader(
    headers,
    "x-shortlink-user-agent",
    request.headers.get("user-agent"),
  );

  setOptionalHeader(
    headers,
    "x-shortlink-referrer",
    request.headers.get("referer"),
  );

  setOptionalHeader(
    headers,
    "x-shortlink-client-ip",
    getVisitorIp(request.headers),
  );

  setOptionalHeader(
    headers,
    "x-shortlink-country",
    getVisitorCountry(request.headers),
  );

  return headers;
}

async function parseJsonResponse<T>(response: Response): Promise<T | null> {
  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return null;
  }

  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function trackPublicShortLinkRequest(
  slug: string,
  request: Request,
): Promise<PublicShortLinkTrackData> {
  const response = await fetch(
    `${getCentralApiUrl()}/api/v1/public/shortlinks/${encodeURIComponent(
      slug,
    )}/track`,
    {
      method: "POST",

      headers: createTrackingHeaders(request),

      cache: "no-store",
    },
  );

  const result = await parseJsonResponse<TrackResponse>(response);

  if (!response.ok || !result?.success || !result.data) {
    throw new PublicShortLinkError(
      response.status,

      result?.code ?? "SHORTLINK_TRACK_FAILED",

      result?.error ?? `Unable to resolve ShortLink (${response.status})`,
    );
  }

  return result.data;
}

export async function getPublicShortLink(
  slug: string,
): Promise<PublicShortLink> {
  const response = await fetch(
    `${getCentralApiUrl()}/api/v1/public/shortlinks/${encodeURIComponent(
      slug,
    )}`,
    {
      method: "GET",

      cache: "no-store",
    },
  );

  const result = await parseJsonResponse<ResolveResponse>(response);

  if (!response.ok || !result?.success || !result.data) {
    throw new PublicShortLinkError(
      response.status,

      result?.code ?? "SHORTLINK_RESOLVE_FAILED",

      result?.error ?? `Unable to resolve ShortLink (${response.status})`,
    );
  }

  return result.data;
}
