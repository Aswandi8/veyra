import type { AuthUserStatus } from "@/lib/auth/types";

export type AdminRoleScope = "GLOBAL" | "WEBSITE";

export type AdminWebsiteStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE";

export interface AdminAccessUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  status: AuthUserStatus;
  banned: boolean;
}

export interface AdminRole {
  id: string;
  name: string;
  description: string | null;
  scope: AdminRoleScope;
}

export interface AdminWebsiteAccess {
  id: string;
  name: string;
  slug: string;
  status: AdminWebsiteStatus;

  role: AdminRole;

  permissions: string[];
}

export interface AdminAccess {
  user: AdminAccessUser;

  superAdmin: boolean;

  globalRoles: AdminRole[];

  globalPermissions: string[];

  websites: AdminWebsiteAccess[];
}

export interface AdminAccessResponse {
  success: boolean;

  user?: AdminAccessUser;

  superAdmin?: boolean;

  globalRoles?: AdminRole[];

  globalPermissions?: string[];

  websites?: AdminWebsiteAccess[];

  error?: string;
}
