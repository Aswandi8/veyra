export type WebsiteStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE";

export interface WebsiteStatistics {
  members: number;
  videos: number;
  categories: number;
  views: number;
  apiClients: number;
}

export interface WebsiteListItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  domain: string | null;
  status: WebsiteStatus;
  statistics: WebsiteStatistics;
  createdAt: string;
  updatedAt: string;
}

export type WebsiteDetail = WebsiteListItem;

export interface WebsitesResponse {
  success: boolean;
  data: WebsiteListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

export interface WebsiteDetailResponse {
  success: boolean;
  data?: WebsiteDetail;
  error?: string;
}

export interface WebsiteMutationResponse {
  success: boolean;
  message?: string;
  data?: WebsiteDetail;
  error?: string;
}

export interface WebsiteDeleteResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    id: string;
    name: string;
  };
}

export interface WebsiteMemberRole {
  id: string;
  name: string;
  description: string | null;
  scope: "WEBSITE";
}

export interface WebsiteMember {
  userId: string;
  websiteId: string;
  name: string;
  email: string;
  image: string | null;
  status: string;
  emailVerified: boolean;
  role: WebsiteMemberRole;
  createdAt: string;
  updatedAt: string;
}

export interface WebsiteMembersResponse {
  success: boolean;
  data: WebsiteMember[];
  error?: string;
}

export interface WebsiteMemberMutationResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: WebsiteMember;
}
