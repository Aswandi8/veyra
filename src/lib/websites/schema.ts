import { z } from "zod";

const websiteStatusSchema = z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE"]);

export const websitesQuerySchema = z.object({
  q: z.string().trim().max(100).default(""),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z
    .enum(["name", "domain", "status", "members", "videos", "createdAt"])
    .default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  status: websiteStatusSchema.optional(),
});

export const websiteFormSchema = z.object({
  name: z.string().trim().min(1, "Website name is required.").max(100),
  slug: z
    .string()
    .trim()
    .min(1, "Website slug is required.")
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug may only contain lowercase letters, numbers, and hyphens.",
    ),
  description: z.string().trim().max(1000).optional(),
  domain: z.string().trim().max(255).optional(),
  status: websiteStatusSchema,
});

export type WebsitesQuery = z.infer<typeof websitesQuerySchema>;
export type WebsiteFormValues = z.infer<typeof websiteFormSchema>;
