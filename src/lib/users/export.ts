import type { UsersQuery } from "@/lib/users/schema";

export function getUsersExportHref(query: UsersQuery): string {
  const params = new URLSearchParams({
    sort: query.sort,
    order: query.order,
  });

  if (query.q) params.set("q", query.q);
  if (query.status) params.set("status", query.status);
  if (query.verified) params.set("verified", query.verified);
  if (query.banned) params.set("banned", query.banned);
  if (query.role) params.set("role", query.role);

  return `/api/admin/users/export?${params.toString()}`;
}
