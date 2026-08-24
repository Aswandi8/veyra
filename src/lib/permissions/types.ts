import type { AuthUserStatus } from "@/lib/auth/types";
export type AdminRoleScope = "GLOBAL" | "WEBSITE";
export type AdminWebsiteStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE";

// ============================================================
// SESSION
// ============================================================

export interface AdminAccessSession {
  id: string;
  userId: string;
  expiresAt: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================
// USER
// ============================================================

export interface AdminAccessUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  status: AuthUserStatus;
  banned: boolean;
}

// ============================================================
// ROLE
// ============================================================

export interface AdminRole {
  id: string;
  name: string;
  description: string | null;
  scope: AdminRoleScope;
}

// ============================================================
// WEBSITE
// ============================================================

export interface AdminWebsiteAccess {
  id: string;
  name: string;
  slug: string;
  status: AdminWebsiteStatus;

  role: AdminRole;

  permissions: string[];
}

// ============================================================
// ACCESS
// ============================================================

export interface AdminAccess {
  session: AdminAccessSession;

  user: AdminAccessUser;

  superAdmin: boolean;

  globalRoles: AdminRole[];

  globalPermissions: string[];

  websites: AdminWebsiteAccess[];
}

// ============================================================
// API RESPONSE
// ============================================================

export interface AdminAccessResponse {
  success: boolean;

  session?: AdminAccessSession;

  user?: AdminAccessUser;

  superAdmin?: boolean;

  globalRoles?: AdminRole[];

  globalPermissions?: string[];

  websites?: AdminWebsiteAccess[];

  error?: string;

  code?: string;
}
