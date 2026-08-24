import { cache } from "react";

import { fetchCentralApiServer } from "@/lib/api/server";

import type { WebsitesQuery } from "@/lib/websites/schema";

import type {
  WebsiteDetailResponse,
  WebsiteListItem,
  WebsitesResponse,
} from "@/lib/websites/types";

interface WebsiteApiStatistics {
  users?: number;
  members?: number;
  videos?: number;
  categories?: number;
  views?: number;
  apiClients?: number;
}

interface RawWebsite {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  domain: string | null;

  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";

  statistics?: WebsiteApiStatistics;

  createdAt: string;
  updatedAt: string;
}

interface RawWebsitePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface RawWebsiteListResponse {
  success: boolean;

  data?: RawWebsite[];

  pagination?: RawWebsitePagination;

  error?: string;
}

interface RawWebsiteDetailResponse {
  success: boolean;

  data?: RawWebsite;

  error?: string;
}

function normalizeWebsite(website: RawWebsite): WebsiteListItem {
  return {
    id: website.id,
    name: website.name,
    slug: website.slug,
    description: website.description,
    domain: website.domain,
    status: website.status,

    statistics: {
      members: website.statistics?.members ?? website.statistics?.users ?? 0,

      videos: website.statistics?.videos ?? 0,

      categories: website.statistics?.categories ?? 0,

      views: website.statistics?.views ?? 0,

      apiClients: website.statistics?.apiClients ?? 0,
    },

    createdAt: website.createdAt,
    updatedAt: website.updatedAt,
  };
}

// ============================================================
// WEBSITE LIST
// ============================================================

export const getServerWebsites = cache(
  async (
    q: string,
    page: number,
    limit: number,
    sort: WebsitesQuery["sort"],
    order: WebsitesQuery["order"],
    status?: WebsitesQuery["status"],
  ): Promise<WebsitesResponse> => {
    // ========================================================
    // QUERY PARAMS
    // ========================================================

    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sort,
      order,
    });

    const search = q.trim();

    if (search) {
      params.set("q", search);
    }

    if (status) {
      params.set("status", status);
    }

    // ========================================================
    // REQUEST
    // ========================================================

    const response = await fetchCentralApiServer(
      `/api/v1/admin/websites?${params.toString()}`,
      {
        method: "GET",
      },
    );

    if (!response.ok) {
      throw new Error(`Unable to load websites (${response.status})`);
    }

    // ========================================================
    // RESPONSE
    // ========================================================

    const result = (await response.json()) as RawWebsiteListResponse;

    if (!result.success || !Array.isArray(result.data) || !result.pagination) {
      throw new Error(result.error ?? "Invalid website response");
    }

    // ========================================================
    // NORMALIZE
    // ========================================================

    return {
      success: true,

      data: result.data.map(normalizeWebsite),

      pagination: {
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages,
      },
    };
  },
);

// ============================================================
// WEBSITE DETAIL
// ============================================================

export const getServerWebsite = cache(
  async (websiteId: string): Promise<WebsiteDetailResponse> => {
    const response = await fetchCentralApiServer(
      `/api/v1/admin/websites/${encodeURIComponent(websiteId)}`,
      {
        method: "GET",
      },
    );

    if (response.status === 404) {
      return {
        success: false,
        error: "Website not found",
      };
    }

    if (!response.ok) {
      throw new Error(`Unable to load website (${response.status})`);
    }

    const result = (await response.json()) as RawWebsiteDetailResponse;

    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error ?? "Website not found",
      };
    }

    return {
      success: true,
      data: normalizeWebsite(result.data),
    };
  },
);
