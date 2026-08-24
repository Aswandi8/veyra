import { cache } from "react";
import { fetchCentralApiServer } from "@/lib/api/server";
import type { RolesQuery } from "@/lib/roles/schema";
import type {
  PermissionsResponse,
  RoleDetailResponse,
  RolesResponse,
} from "@/lib/roles/types";

export const getServerRoles = cache(
  async (
    q = "",
    page = 1,
    limit = 20,
    sort: RolesQuery["sort"] = "name",
    order: RolesQuery["order"] = "asc",
    scope?: RolesQuery["scope"],
    type?: RolesQuery["type"],
  ): Promise<RolesResponse> => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sort,
      order,
    });

    const search = q.trim();

    if (search) params.set("q", search);
    if (scope) params.set("scope", scope);
    if (type) params.set("type", type);

    const response = await fetchCentralApiServer(
      `/api/v1/admin/roles?${params.toString()}`,
      { method: "GET" },
    );

    if (!response.ok) {
      throw new Error(`Unable to load roles (${response.status})`);
    }

    const result = (await response.json()) as RolesResponse;

    if (!result.success || !Array.isArray(result.data) || !result.pagination) {
      throw new Error(result.error ?? "Invalid roles response");
    }

    return result;
  },
);

export const getServerRole = cache(
  async (roleId: string): Promise<RoleDetailResponse> => {
    const response = await fetchCentralApiServer(
      `/api/v1/admin/roles/${encodeURIComponent(roleId)}`,
      { method: "GET" },
    );

    if (!response.ok) {
      throw new Error(`Unable to load role (${response.status})`);
    }

    return (await response.json()) as RoleDetailResponse;
  },
);

export const getServerPermissions = cache(
  async (): Promise<PermissionsResponse> => {
    const response = await fetchCentralApiServer("/api/v1/admin/permissions", {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Unable to load permissions (${response.status})`);
    }

    return (await response.json()) as PermissionsResponse;
  },
);
