export type MemberStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "BANNED";

export interface MemberRole {
  id: string;
  name: string;
  description: string | null;
  scope: "WEBSITE";
}

export interface MemberListItem {
  userId: string;
  websiteId: string;

  name: string;
  email: string;
  image: string | null;

  status: MemberStatus;
  emailVerified: boolean;

  role: MemberRole;

  createdAt: string;
  updatedAt: string;
}

export interface MembersResponse {
  success: boolean;
  data: MemberListItem[];
  error?: string;
}

export interface MembersPaginatedResponse {
  success: boolean;
  data: MemberListItem[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MemberMutationResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: MemberListItem;
}

export interface WebsiteRoleOption {
  id: string;
  name: string;
  description: string | null;
  scope: "WEBSITE";
  system?: boolean;
}

export interface MemberRemoveResponse {
  success: boolean;
  message?: string;
  error?: string;

  data?: {
    userId: string;
    websiteId: string;

    user?: {
      id: string;
      name: string;
      email: string;
    };

    role?: {
      id: string;
      name: string;
    };
  };
}
