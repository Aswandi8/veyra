import { cache } from "react";

import { fetchCentralApiServer } from "@/lib/api/server";

import type {
  PermissionsResponse,
  RoleDetailResponse,
  RolesResponse,
} from "@/lib/roles/types";

export const getServerRoles = cache(async (): Promise<RolesResponse> => {
  const response = await fetchCentralApiServer("/api/v1/admin/roles", {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`Unable to load roles (${response.status})`);
  }

  return (await response.json()) as RolesResponse;
});

export const getServerRole = cache(
  async (roleId: string): Promise<RoleDetailResponse> => {
    const response = await fetchCentralApiServer(
      `/api/v1/admin/roles/${encodeURIComponent(roleId)}`,
      {
        method: "GET",
      },
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
