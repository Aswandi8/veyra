import { cache } from "react";

import { fetchCentralApiServer } from "@/lib/api/server";

import type { InvitationsQuery } from "@/lib/invitations/schema";
import type {
  InvitationListItem,
  InvitationRoleOption,
  InvitationsPaginatedResponse,
  InvitationStatus,
} from "@/lib/invitations/types";

interface RawInvitation {
  id: string;

  userId: string | null;
  websiteId: string;

  name: string;
  email: string;

  role: {
    id: string;
    name: string;
    description: string | null;
    scope: "WEBSITE";
  };

  expiresAt: string;

  usedAt: string | null;
  revokedAt: string | null;

  invitedBy: {
    id: string;
    name: string;
    email: string;
  } | null;

  createdAt: string;
  updatedAt: string;
}

interface RawInvitationsResponse {
  success: boolean;
  data?: RawInvitation[];
  error?: string;
}

interface WebsiteRolesResponse {
  success: boolean;
  data?: InvitationRoleOption[];
  error?: string;
}

function getInvitationStatus(invitation: RawInvitation): InvitationStatus {
  if (invitation.revokedAt) {
    return "REVOKED";
  }

  if (invitation.usedAt) {
    return "USED";
  }

  const expiresAt = new Date(invitation.expiresAt).getTime();

  if (Number.isFinite(expiresAt) && expiresAt <= Date.now()) {
    return "EXPIRED";
  }

  return "PENDING";
}

function normalizeInvitation(invitation: RawInvitation): InvitationListItem {
  return {
    id: invitation.id,

    userId: invitation.userId,

    websiteId: invitation.websiteId,

    name: invitation.name,

    email: invitation.email,

    role: {
      id: invitation.role.id,

      name: invitation.role.name,

      description: invitation.role.description,

      scope: invitation.role.scope,
    },

    expiresAt: invitation.expiresAt,

    usedAt: invitation.usedAt,

    revokedAt: invitation.revokedAt,

    invitedBy: invitation.invitedBy,

    createdAt: invitation.createdAt,

    updatedAt: invitation.updatedAt,

    status: getInvitationStatus(invitation),
  };
}

function compareInvitations(
  a: InvitationListItem,
  b: InvitationListItem,
  sort: InvitationsQuery["sort"],
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

    case "expiresAt":
      return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();

    default:
      return 0;
  }
}

export const getServerInvitations = cache(
  async (
    websiteId: string,
    q: string,
    page: number,
    limit: number,
    sort: InvitationsQuery["sort"],
    order: InvitationsQuery["order"],
    status?: InvitationsQuery["status"],
  ): Promise<InvitationsPaginatedResponse> => {
    const response = await fetchCentralApiServer(
      `/api/v1/admin/websites/${encodeURIComponent(websiteId)}/invitations`,
      {
        method: "GET",
      },
    );

    if (!response.ok) {
      throw new Error(`Unable to load invitations (${response.status})`);
    }

    const result = (await response.json()) as RawInvitationsResponse;

    if (!result.success || !Array.isArray(result.data)) {
      throw new Error(result.error ?? "Invalid invitations response");
    }

    let invitations = result.data.map(normalizeInvitation);

    const search = q.trim().toLowerCase();

    if (search) {
      invitations = invitations.filter(
        (invitation) =>
          invitation.name.toLowerCase().includes(search) ||
          invitation.email.toLowerCase().includes(search) ||
          invitation.role.name.toLowerCase().includes(search),
      );
    }

    if (status) {
      invitations = invitations.filter(
        (invitation) => invitation.status === status,
      );
    }

    invitations.sort((a, b) => {
      const comparison = compareInvitations(a, b, sort);

      return order === "asc" ? comparison : -comparison;
    });

    const total = invitations.length;

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    const safePage = totalPages === 0 ? 1 : Math.min(page, totalPages);

    const start = (safePage - 1) * limit;

    return {
      success: true,

      data: invitations.slice(start, start + limit),

      pagination: {
        page: safePage,

        limit,

        total,

        totalPages,
      },
    };
  },
);

export const getServerInvitationRoles = cache(
  async (websiteId: string): Promise<InvitationRoleOption[]> => {
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

    return result.data.filter(
      (role): role is InvitationRoleOption => role.scope === "WEBSITE",
    );
  },
);
