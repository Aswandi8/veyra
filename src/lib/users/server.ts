import { cache } from "react";

import { fetchCentralApiServer } from "@/lib/api/server";
import type { UsersQuery } from "@/lib/users/schema";
import type { UserDetailResponse, UsersResponse } from "@/lib/users/types";

export const getServerUsers = cache(
  async (
    q: string,
    page: number,
    limit: number,
    sort: UsersQuery["sort"],
    order: UsersQuery["order"],
    status?: UsersQuery["status"],
    verified?: UsersQuery["verified"],
    banned?: UsersQuery["banned"],
    role?: UsersQuery["role"],
  ): Promise<UsersResponse> => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sort,
      order,
    });

    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (verified) params.set("verified", verified);
    if (banned) params.set("banned", banned);
    if (role) params.set("role", role);

    const response = await fetchCentralApiServer(
      `/api/v1/admin/users?${params.toString()}`,
    );

    if (!response.ok) {
      throw new Error(`Unable to load users (${response.status})`);
    }

    return (await response.json()) as UsersResponse;
  },
);

export const getServerUser = cache(
  async (userId: string): Promise<UserDetailResponse> => {
    const response = await fetchCentralApiServer(
      `/api/v1/admin/users/${encodeURIComponent(userId)}`,
    );

    if (response.status === 404) {
      return {
        success: false,
        error: "User not found",
      };
    }

    if (!response.ok) {
      throw new Error(`Unable to load user (${response.status})`);
    }

    return (await response.json()) as UserDetailResponse;
  },
);
