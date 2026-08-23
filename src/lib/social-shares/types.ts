import type { PaginationData } from "@/lib/data-table/types";

export type SocialShareStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export interface SocialShareWebsite {
  id: string;
  name: string;
  slug: string;
  domain: string | null;

  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
}

export interface SocialShareListItem {
  id: string;
  websiteId: string;

  title: string;
  slug: string;
  description: string | null;

  videoUrl: string;
  thumbnail: string;
  shareThumbnail: string | null;

  duration: number | null;
  displayDuration: string | null;

  targetUrl: string;

  status: SocialShareStatus;

  shareUrl: string | null;

  website: SocialShareWebsite;

  createdAt: string;
  updatedAt: string;
}

export type SocialShareDetail = SocialShareListItem;

export interface SocialShareScope {
  mode: "ALL" | "WEBSITE";

  websiteId: string | null;

  websiteCount: number;
}

export interface SocialSharesResponse {
  success: boolean;

  data: SocialShareListItem[];

  pagination: PaginationData;

  website: SocialShareWebsite | null;

  scope: SocialShareScope;

  error?: string;
}

export interface SocialShareDetailResponse {
  success: boolean;

  data?: SocialShareDetail;

  error?: string;
}

export interface SocialShareMutationResponse {
  success: boolean;

  message?: string;
  error?: string;

  data?: SocialShareDetail;
}

export interface SocialShareDeleteResponse {
  success: boolean;

  message?: string;
  error?: string;

  data?: {
    id: string;
    websiteId: string;
    title: string;
    slug: string;
  };
}

export interface SocialShareWebsiteOption {
  id: string;
  name: string;

  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
}
