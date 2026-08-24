import { cache } from "react";

import { fetchCentralApiServer } from "@/lib/api/server";

import type { MembersQuery } from "@/lib/members/schema";
import type {
  MemberListItem,
  MembersPaginatedResponse,
  WebsiteRoleOption,
} from "@/lib/members/types";

interface RawMember {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "BANNED";
    banned: boolean;
  };

  role: {
    id: string;
    name: string;
    description: string | null;
    scope: "WEBSITE";
  };

  assignedAt: string;
  updatedAt: string;
}

interface RawMembersResponse {
  success: boolean;
  data?: RawMember[];

  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  error?: string;
}

interface WebsiteRolesResponse {
  success: boolean;
  data?: WebsiteRoleOption[];
  error?: string;
}

function normalizeMember(websiteId: string, member: RawMember): MemberListItem {
  return {
    userId: member.user.id,
    websiteId,
    name: member.user.name,
    email: member.user.email,
    image: member.user.image,
    status: member.user.status,
    emailVerified: member.user.emailVerified,
    role: {
      id: member.role.id,
      name: member.role.name,
      description: member.role.description,
      scope: member.role.scope,
    },
    createdAt: member.assignedAt,
    updatedAt: member.updatedAt,
  };
}

export const getServerMembers = cache(
  async (
    websiteId: string,
    q: string,
    page: number,
    limit: number,
    sort: MembersQuery["sort"],
    order: MembersQuery["order"],
    status?: MembersQuery["status"],
    verified?: MembersQuery["verified"],
  ): Promise<MembersPaginatedResponse> => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sort,
      order,
    });

    const search = q.trim();

    if (search) params.set("q", search);
    if (status) params.set("status", status);
    if (verified) params.set("verified", verified);

    const response = await fetchCentralApiServer(
      `/api/v1/admin/websites/${encodeURIComponent(
        websiteId,
      )}/users?${params.toString()}`,
      { method: "GET" },
    );

    if (!response.ok) {
      throw new Error(`Unable to load members (${response.status})`);
    }

    const result = (await response.json()) as RawMembersResponse;

    if (!result.success || !Array.isArray(result.data) || !result.pagination) {
      throw new Error(result.error ?? "Invalid members response");
    }

    return {
      success: true,
      data: result.data.map((member) => normalizeMember(websiteId, member)),
      pagination: result.pagination,
    };
  },
);

export const getServerMember = cache(
  async (websiteId: string, userId: string): Promise<MemberListItem | null> => {
    /*
     * Untuk sekarang tetap menggunakan endpoint list,
     * tetapi query dibuat spesifik ke email/name belum cukup
     * karena kita membutuhkan exact userId.
     *
     * Endpoint detail member bisa kita buat di Phase 4
     * bila ingin menghilangkan ini sepenuhnya.
     */
    const response = await fetchCentralApiServer(
      `/api/v1/admin/websites/${encodeURIComponent(
        websiteId,
      )}/users?page=1&limit=100`,
      { method: "GET" },
    );

    if (!response.ok) {
      throw new Error(`Unable to load member (${response.status})`);
    }

    const result = (await response.json()) as RawMembersResponse;

    if (!result.success || !Array.isArray(result.data)) {
      throw new Error(result.error ?? "Invalid members response");
    }

    const member = result.data.find((item) => item.user.id === userId);

    return member ? normalizeMember(websiteId, member) : null;
  },
);

export const getServerMemberRoles = cache(
  async (websiteId: string): Promise<WebsiteRoleOption[]> => {
    const response = await fetchCentralApiServer(
      `/api/v1/admin/websites/${encodeURIComponent(websiteId)}/roles`,
      { method: "GET" },
    );

    if (!response.ok) {
      throw new Error(`Unable to load website roles (${response.status})`);
    }

    const result = (await response.json()) as WebsiteRolesResponse;

    if (!result.success || !Array.isArray(result.data)) {
      throw new Error(result.error ?? "Invalid website roles response");
    }

    return result.data;
  },
);
