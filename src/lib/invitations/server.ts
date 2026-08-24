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

  status?: InvitationStatus;
}

interface RawInvitationsResponse {
  success: boolean;
  data?: RawInvitation[];

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
  data?: InvitationRoleOption[];
  error?: string;
}

function getInvitationStatus(invitation: RawInvitation): InvitationStatus {
  if (invitation.status) return invitation.status;
  if (invitation.revokedAt) return "REVOKED";
  if (invitation.usedAt) return "USED";

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
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sort,
      order,
    });

    const search = q.trim();

    if (search) params.set("q", search);
    if (status) params.set("status", status);

    const response = await fetchCentralApiServer(
      `/api/v1/admin/websites/${encodeURIComponent(
        websiteId,
      )}/invitations?${params.toString()}`,
      { method: "GET" },
    );

    if (!response.ok) {
      throw new Error(`Unable to load invitations (${response.status})`);
    }

    const result = (await response.json()) as RawInvitationsResponse;

    if (!result.success || !Array.isArray(result.data) || !result.pagination) {
      throw new Error(result.error ?? "Invalid invitations response");
    }

    return {
      success: true,
      data: result.data.map(normalizeInvitation),
      pagination: result.pagination,
    };
  },
);

export const getServerInvitationRoles = cache(
  async (websiteId: string): Promise<InvitationRoleOption[]> => {
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

    return result.data.filter(
      (role): role is InvitationRoleOption => role.scope === "WEBSITE",
    );
  },
);
