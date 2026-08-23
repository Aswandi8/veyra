import { z } from "zod";

// ============================================================
// CONSTANTS
// ============================================================

export const SOCIAL_SHARE_STATUSES = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;

// ============================================================
// URL HELPERS
// ============================================================

function isPrivateIpv4(hostname: string): boolean {
  const parts = hostname.split(".").map(Number);

  if (
    parts.length !== 4 ||
    parts.some((value) => !Number.isInteger(value) || value < 0 || value > 255)
  ) {
    return false;
  }

  const [a, b] = parts;

  if (a === 10 || a === 127 || a === 0) {
    return true;
  }

  if (a === 169 && b === 254) {
    return true;
  }

  if (a === 172 && b >= 16 && b <= 31) {
    return true;
  }

  if (a === 192 && b === 168) {
    return true;
  }

  return false;
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isRemoteMediaUrl(value: string): boolean {
  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return false;
    }

    if (url.username || url.password) {
      return false;
    }

    const hostname = url.hostname.toLowerCase().replace(/\.$/, "");

    if (
      !hostname ||
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal")
    ) {
      return false;
    }

    if (isPrivateIpv4(hostname)) {
      return false;
    }

    if (hostname === "::1" || hostname === "[::1]") {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

// ============================================================
// DURATION HELPERS
// ============================================================

function isNonNegativeInteger(value: string): boolean {
  if (!value) {
    return true;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed >= 0;
}

function isMinuteSecond(value: string): boolean {
  if (!value) {
    return true;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 59;
}

function isDisplayHour(value: string): boolean {
  if (!value) {
    return true;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 999;
}

// ============================================================
// GENERIC URL
// ============================================================

const requiredHttpUrlSchema = z
  .string()
  .trim()
  .min(1, "URL is required")
  .max(2048, "URL must not exceed 2048 characters")
  .refine(isHttpUrl, {
    message: "Enter a valid http or https URL",
  });

// ============================================================
// MEDIA URL
// ============================================================

const requiredRemoteMediaUrlSchema = z
  .string()
  .trim()
  .min(1, "Media URL is required")
  .max(2048, "Media URL must not exceed 2048 characters")
  .refine(isRemoteMediaUrl, {
    message: "Enter a public http or https media URL",
  });

const optionalRemoteMediaUrlSchema = z
  .string()
  .trim()
  .max(2048, "Media URL must not exceed 2048 characters")
  .refine((value) => !value || isRemoteMediaUrl(value), {
    message: "Enter a public http or https media URL",
  });

// ============================================================
// SLUG
// ============================================================

export const socialShareSlugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required")
  .max(200, "Slug must not exceed 200 characters")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug may only contain lowercase letters, numbers, and hyphens",
  );

// ============================================================
// LIST QUERY
// ============================================================

export const socialSharesQuerySchema = z.object({
  q: z.string().trim().max(100).default(""),

  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),

  sort: z
    .enum(["title", "slug", "status", "createdAt", "updatedAt"])
    .default("createdAt"),

  order: z.enum(["asc", "desc"]).default("desc"),

  status: z.enum(SOCIAL_SHARE_STATUSES).optional(),

  website: z.string().trim().min(1).optional(),
});

// ============================================================
// TYPES
// ============================================================

export type SocialSharesQuery = z.infer<typeof socialSharesQuerySchema>;

// ============================================================
// DURATION PARTS
// ============================================================

const durationHourSchema = z.string().trim().refine(isNonNegativeInteger, {
  message: "Hours must be a non-negative whole number",
});

const displayHourSchema = z.string().trim().refine(isDisplayHour, {
  message: "Hours must be between 0 and 999",
});

const minuteSecondSchema = z.string().trim().refine(isMinuteSecond, {
  message: "Value must be between 0 and 59",
});

// ============================================================
// FORM
// ============================================================

export const socialShareFormSchema = z.object({
  websiteId: z.string().trim().min(1, "Website is required"),

  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must not exceed 200 characters"),

  slug: socialShareSlugSchema,

  description: z
    .string()
    .trim()
    .max(10000, "Description must not exceed 10000 characters"),

  /*
   * Provider agnostic:
   *
   * Cloudinary / R2 / S3 / Bunny /
   * arbitrary public CDN.
   */
  videoUrl: requiredRemoteMediaUrlSchema,

  thumbnail: requiredRemoteMediaUrlSchema,

  shareThumbnail: optionalRemoteMediaUrlSchema,

  actualHours: durationHourSchema,

  actualMinutes: minuteSecondSchema,

  actualSeconds: minuteSecondSchema,

  displayHours: displayHourSchema,

  displayMinutes: minuteSecondSchema,

  displaySeconds: minuteSecondSchema,

  /*
   * Target redirect is not fetched as media.
   */
  targetUrl: requiredHttpUrlSchema,

  status: z.enum(SOCIAL_SHARE_STATUSES),
});

export type SocialShareFormValues = z.infer<typeof socialShareFormSchema>;
