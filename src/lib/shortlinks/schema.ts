import { z } from "zod";

export const shortLinkStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);

export const shortLinkPreviewTypeSchema = z.enum(["IMAGE", "VIDEO"]);

export const shortLinksQuerySchema = z.object({
  q: z.string().trim().max(100).default(""),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),

  sort: z
    .enum([
      "slug",
      "title",
      "status",
      "previewType",
      "clickCount",
      "createdAt",
      "updatedAt",
    ])
    .default("createdAt"),

  order: z.enum(["asc", "desc"]).default("desc"),

  status: shortLinkStatusSchema.optional(),

  previewType: shortLinkPreviewTypeSchema.optional(),
});

export const shortLinkFormSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .max(100)
      .refine(
        (value) => !value || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
        "Slug may only contain lowercase letters, numbers, and hyphens.",
      ),

    destinationUrl: z
      .string()
      .trim()
      .url("Enter a valid destination URL.")
      .refine(
        (value) => value.startsWith("http://") || value.startsWith("https://"),
        "Destination URL must use http or https.",
      ),

    status: shortLinkStatusSchema,

    previewType: shortLinkPreviewTypeSchema,

    title: z.string().trim().max(200).optional(),

    description: z.string().trim().max(1000).optional(),

    thumbnailUrl: z.string().trim().optional(),

    previewVideoUrl: z.string().trim().optional(),

    showPlayButton: z.boolean(),

    displayDuration: z
      .string()
      .trim()
      .refine(
        (value) => !value || /^(?:\d{1,2}:)?[0-5]\d:[0-5]\d$/.test(value),
        "Duration must use MM:SS or HH:MM:SS.",
      )
      .optional(),
  })
  .superRefine((value, context) => {
    if (!value.thumbnailUrl) {
      context.addIssue({
        code: "custom",
        path: ["thumbnailUrl"],
        message:
          value.previewType === "VIDEO"
            ? "Thumbnail/poster URL is required for VIDEO preview."
            : "Image URL is required for IMAGE preview.",
      });
    }

    if (value.previewType === "VIDEO" && !value.previewVideoUrl) {
      context.addIssue({
        code: "custom",
        path: ["previewVideoUrl"],
        message: "Video URL is required for VIDEO preview.",
      });
    }
  });

export type ShortLinksQuery = z.infer<typeof shortLinksQuerySchema>;

export type ShortLinkFormValues = z.infer<typeof shortLinkFormSchema>;
