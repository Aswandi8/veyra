import { z } from "zod";

// ============================================================
// CONSTANTS
// ============================================================

export const SOCIAL_SHARE_STATUSES = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;

// ============================================================
// HELPERS
// ============================================================

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

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
// URL
// ============================================================

const requiredHttpUrlSchema = z
  .string()
  .trim()
  .min(1, "URL is required")
  .max(2048, "URL must not exceed 2048 characters")
  .refine(isHttpUrl, {
    message: "Enter a valid http or https URL",
  });

const optionalHttpUrlSchema = z
  .string()
  .trim()
  .max(2048, "URL must not exceed 2048 characters")
  .refine((value) => !value || isHttpUrl(value), {
    message: "Enter a valid http or https URL",
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

  videoUrl: requiredHttpUrlSchema,

  thumbnail: requiredHttpUrlSchema,

  shareThumbnail: optionalHttpUrlSchema,

  // --------------------------------------------------------
  // ACTUAL DURATION
  // --------------------------------------------------------

  actualHours: durationHourSchema,

  actualMinutes: minuteSecondSchema,

  actualSeconds: minuteSecondSchema,

  // --------------------------------------------------------
  // DISPLAY DURATION
  // --------------------------------------------------------

  displayHours: displayHourSchema,

  displayMinutes: minuteSecondSchema,

  displaySeconds: minuteSecondSchema,

  // --------------------------------------------------------
  // DESTINATION
  // --------------------------------------------------------

  targetUrl: requiredHttpUrlSchema,

  status: z.enum(SOCIAL_SHARE_STATUSES),
});

export type SocialShareFormValues = z.infer<typeof socialShareFormSchema>;
