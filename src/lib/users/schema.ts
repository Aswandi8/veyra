import { z } from "zod";

export const usersQuerySchema = z.object({
  q: z.string().trim().max(100).default(""),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z
    .enum(["name", "email", "status", "createdAt", "updatedAt"])
    .default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "BANNED"]).optional(),
  verified: z.enum(["true", "false"]).optional(),
  banned: z.enum(["true", "false"]).optional(),
  role: z.string().trim().min(1).optional(),
});

export const bulkUserStatusSchema = z.object({
  ids: z.array(z.string().trim().min(1)).min(1).max(100),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]),
});

export const bulkUserDeleteSchema = z.object({
  ids: z.array(z.string().trim().min(1)).min(1).max(100),
});

export type UsersQuery = z.infer<typeof usersQuerySchema>;
export type BulkUserStatusValues = z.infer<typeof bulkUserStatusSchema>;
export type BulkUserDeleteValues = z.infer<typeof bulkUserDeleteSchema>;
