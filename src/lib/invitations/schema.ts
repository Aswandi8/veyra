import { z } from "zod";

export const invitationsQuerySchema = z.object({
  q: z.string().trim().max(100).default(""),

  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),

  sort: z
    .enum(["name", "email", "role", "status", "createdAt", "expiresAt"])
    .default("createdAt"),

  order: z.enum(["asc", "desc"]).default("desc"),

  status: z.enum(["PENDING", "USED", "EXPIRED", "REVOKED"]).optional(),
});

export const invitationFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(100, "Name must not exceed 100 characters."),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(255, "Email must not exceed 255 characters."),

  roleId: z.string().trim().min(1, "Role is required."),
});

export type InvitationsQuery = z.infer<typeof invitationsQuerySchema>;

export type InvitationFormValues = z.infer<typeof invitationFormSchema>;
