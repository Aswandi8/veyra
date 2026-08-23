import { z } from "zod";

export const rolesQuerySchema = z.object({
  q: z.string().trim().max(100).default(""),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z
    .enum(["name", "scope", "type", "permissions", "users", "updatedAt"])
    .default("name"),
  order: z.enum(["asc", "desc"]).default("asc"),
  scope: z.enum(["GLOBAL", "WEBSITE"]).optional(),
  type: z.enum(["SYSTEM", "CUSTOM"]).optional(),
});

export type RolesQuery = z.infer<typeof rolesQuerySchema>;

export const roleFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Role name must be at least 2 characters.")
    .max(50, "Role name must not exceed 50 characters.")
    .regex(
      /^[A-Za-z0-9 _-]+$/,
      "Role name may only contain letters, numbers, spaces, underscores, and hyphens.",
    ),

  description: z
    .string()
    .trim()
    .max(255, "Description must not exceed 255 characters.")
    .optional(),

  permissions: z.array(z.string()),
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;
