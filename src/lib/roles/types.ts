export type RoleScope = "GLOBAL" | "WEBSITE";

export interface RolePermissionItem {
  id: string;
  name: string;
  description: string | null;
}

export interface PermissionListItem {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RoleListItem {
  id: string;
  name: string;
  description: string | null;
  scope: RoleScope;
  system: boolean;
  globalUserCount: number;
  websiteUserCount: number;
  userCount: number;
  invitationCount: number;
  permissionCount: number;
  permissions: RolePermissionItem[];
  createdAt: string;
  updatedAt: string;
}

export interface RolesPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type RoleDetail = RoleListItem;

export interface RolesResponse {
  success: boolean;
  data: RoleListItem[];
  pagination: RolesPagination;
  error?: string;
}

export interface RoleDetailResponse {
  success: boolean;
  data: RoleDetail;
  error?: string;
}

export interface PermissionsResponse {
  success: boolean;
  data: PermissionListItem[];
  error?: string;
}

export interface RoleMutationResponse {
  success: boolean;
  message?: string;
  data?: RoleListItem;
  error?: string;
}

export interface RoleDeleteResponse {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    name: string;
  };
  error?: string;
}
