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
    status: MemberListItem["status"];
    banned?: boolean | null;
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

function compareMembers(
  a: MemberListItem,
  b: MemberListItem,
  sort: MembersQuery["sort"],
): number {
  switch (sort) {
    case "name":
      return a.name.localeCompare(b.name);

    case "email":
      return a.email.localeCompare(b.email);

    case "role":
      return a.role.name.localeCompare(b.role.name);

    case "status":
      return a.status.localeCompare(b.status);

    case "createdAt":
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

    default:
      return 0;
  }
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
    const response = await fetchCentralApiServer(
      `/api/v1/admin/websites/${encodeURIComponent(websiteId)}/users`,
      {
        method: "GET",
      },
    );

    if (!response.ok) {
      throw new Error(`Unable to load members (${response.status})`);
    }

    const result = (await response.json()) as RawMembersResponse;

    if (!result.success || !Array.isArray(result.data)) {
      throw new Error(result.error ?? "Invalid members response");
    }

    let members = result.data.map((member) =>
      normalizeMember(websiteId, member),
    );

    const search = q.trim().toLowerCase();

    if (search) {
      members = members.filter(
        (member) =>
          member.name.toLowerCase().includes(search) ||
          member.email.toLowerCase().includes(search) ||
          member.role.name.toLowerCase().includes(search),
      );
    }

    if (status) {
      members = members.filter((member) => member.status === status);
    }

    if (verified) {
      const expected = verified === "VERIFIED";

      members = members.filter((member) => member.emailVerified === expected);
    }

    members.sort((a, b) => {
      const comparison = compareMembers(a, b, sort);

      return order === "asc" ? comparison : -comparison;
    });

    const total = members.length;

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    const safePage = totalPages === 0 ? 1 : Math.min(page, totalPages);

    const start = (safePage - 1) * limit;

    return {
      success: true,

      data: members.slice(start, start + limit),

      pagination: {
        page: safePage,
        limit,
        total,
        totalPages,
      },
    };
  },
);

export const getServerMember = cache(
  async (websiteId: string, userId: string): Promise<MemberListItem | null> => {
    const response = await fetchCentralApiServer(
      `/api/v1/admin/websites/${encodeURIComponent(websiteId)}/users`,
      {
        method: "GET",
      },
    );

    if (!response.ok) {
      throw new Error(`Unable to load member (${response.status})`);
    }

    const result = (await response.json()) as RawMembersResponse;

    if (!result.success || !Array.isArray(result.data)) {
      throw new Error(result.error ?? "Invalid members response");
    }

    const members = result.data.map((member) =>
      normalizeMember(websiteId, member),
    );

    return members.find((member) => member.userId === userId) ?? null;
  },
);

export const getServerMemberRoles = cache(
  async (websiteId: string): Promise<WebsiteRoleOption[]> => {
    const response = await fetchCentralApiServer(
      `/api/v1/admin/websites/${encodeURIComponent(websiteId)}/roles`,
      {
        method: "GET",
      },
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
