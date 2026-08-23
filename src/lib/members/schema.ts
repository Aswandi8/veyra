import { z } from "zod";

export const membersQuerySchema = z.object({
  q: z.string().trim().max(100).default(""),

  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),

  sort: z
    .enum(["name", "email", "role", "status", "createdAt"])
    .default("name"),

  order: z.enum(["asc", "desc"]).default("asc"),

  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "BANNED"]).optional(),

  verified: z.enum(["VERIFIED", "UNVERIFIED"]).optional(),
});

export const memberRoleFormSchema = z.object({
  roleId: z.string().trim().min(1, "Role is required."),
});

export type MembersQuery = z.infer<typeof membersQuerySchema>;

export type MemberRoleFormValues = z.infer<typeof memberRoleFormSchema>;
