import type { AuthUserStatus } from "@/lib/auth/types";
import type { PaginationData } from "@/lib/data-table/types";

export interface UserRole {
  id: string;
  name: string;
  description: string | null;
}

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  status: AuthUserStatus;
  role: string | null;
  banned: boolean;
  banReason: string | null;
  banExpires: string | null;
  createdAt: string;
  updatedAt: string;
  roles: UserRole[];
}

export interface UsersResponse {
  success: boolean;
  data: UserListItem[];
  pagination: PaginationData;
}

export interface UserMutationResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    count?: number;
    status?: string;
  };
}

export interface UserDetailRole {
  id: string;
  name: string;
  description: string | null;
  scope: string;
}

export interface UserWebsiteAccess {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  status: string;
  role: UserDetailRole;
  assignedAt: string;
}

export interface UserStatistics {
  sessions: number;
  accounts: number;
  globalRoles: number;
  websites: number;
  auditLogs: number;
  invitations: number;
}

export interface UserDetail {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  status: AuthUserStatus;
  role: string | null;
  banned: boolean;
  banReason: string | null;
  banExpires: string | null;
  createdAt: string;
  updatedAt: string;
  protected: boolean;
  roles: UserDetailRole[];
  globalRoles: UserDetailRole[];
  websites: UserWebsiteAccess[];
  statistics: UserStatistics;
}

export interface UserDetailResponse {
  success: boolean;
  data?: UserDetail;
  error?: string;
}
