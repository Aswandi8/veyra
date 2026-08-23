export type InvitationStatus = "PENDING" | "USED" | "EXPIRED" | "REVOKED";

export interface InvitationRole {
  id: string;
  name: string;
  description: string | null;
  scope: "WEBSITE";
}

export interface InvitationWebsite {
  id: string;
  name: string;
  slug: string;
  domain?: string | null;
  status?: string;
}

export interface InvitationInviter {
  id: string;
  name: string;
  email: string;
}

export interface InvitationUser {
  id: string;
  name: string;
  email: string;
  emailVerified?: boolean;
  status?: string;
}

export interface InvitationListItem {
  id: string;

  userId: string | null;
  websiteId: string;

  name: string;
  email: string;

  role: InvitationRole;

  expiresAt: string;

  usedAt: string | null;
  revokedAt: string | null;

  invitedBy: InvitationInviter | null;

  createdAt: string;
  updatedAt: string;

  status: InvitationStatus;
}

/**
 * Compatibility type for the existing invitation components.
 *
 * components/invitations/*
 * still imports WebsiteInvitation.
 */
export type WebsiteInvitation = InvitationListItem;

export interface InvitationsResponse {
  success: boolean;
  data: InvitationListItem[];
  error?: string;
}

export interface InvitationsPaginatedResponse {
  success: boolean;

  data: InvitationListItem[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  error?: string;
}

// ============================================================
// CREATE INVITATION
// ============================================================

export interface InvitationMutationResponse {
  success: boolean;
  message?: string;
  error?: string;

  data?: InvitationListItem;
}

/**
 * Compatibility with the previous invitation UI.
 */
export interface CreateInvitationResponse {
  success: boolean;

  message?: string;
  error?: string;
  code?: string;

  data?: InvitationListItem;

  invitation?: InvitationListItem;

  invitationUrl?: string;
  token?: string;
}

// ============================================================
// REVOKE INVITATION
// ============================================================

export interface InvitationRevokeResponse {
  success: boolean;
  message?: string;
  error?: string;

  data?: {
    id: string;
    revokedAt: string;
  };
}

// ============================================================
// ROLE OPTION
// ============================================================

export interface InvitationRoleOption {
  id: string;
  name: string;
  description: string | null;
  scope: "WEBSITE";
  system?: boolean;
}

// ============================================================
// VERIFY INVITATION
// ============================================================

export interface VerifyInvitationData {
  id?: string;

  invitationId?: string;

  name: string;
  email: string;

  expiresAt: string;

  existingUser: boolean;

  requiresLogin: boolean;
  requiresPassword: boolean;

  alreadyMember?: boolean;

  website: InvitationWebsite;

  role: InvitationRole;

  user?: InvitationUser | null;
}

export interface VerifyInvitationResponse {
  success: boolean;

  code?: string;
  message?: string;
  error?: string;

  data?: VerifyInvitationData;
}

// ============================================================
// ACTIVATE INVITATION
// ============================================================

export interface ActivateInvitationData {
  invitationId?: string;

  user: InvitationUser;

  website: InvitationWebsite;

  role: InvitationRole;

  redirectUrl?: string;
}

export interface ActivateInvitationResponse {
  success: boolean;

  code?: string;
  message?: string;
  error?: string;

  data?: ActivateInvitationData;

  user?: InvitationUser;

  website?: InvitationWebsite;

  role?: InvitationRole;

  redirectUrl?: string;
}
