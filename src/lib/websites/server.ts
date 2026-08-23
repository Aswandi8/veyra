import { cache } from "react";

import { fetchCentralApiServer } from "@/lib/api/server";
import type { WebsitesQuery } from "@/lib/websites/schema";
import type {
  WebsiteDetailResponse,
  WebsiteListItem,
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

interface RawWebsiteListResponse {
  success: boolean;
  data?: RawWebsite[];
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

export const getServerWebsites = cache(
  async (
    q: string,
    page: number,
    limit: number,
    sort: WebsitesQuery["sort"],
    order: WebsitesQuery["order"],
    status?: WebsitesQuery["status"],
  ) => {
    const response = await fetchCentralApiServer("/api/v1/admin/websites", {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Unable to load websites (${response.status})`);
    }

    const result = (await response.json()) as RawWebsiteListResponse;

    if (!result.success || !Array.isArray(result.data)) {
      throw new Error(result.error ?? "Invalid website response");
    }

    let websites = result.data.map(normalizeWebsite);

    const search = q.trim().toLowerCase();

    if (search) {
      websites = websites.filter(
        (website) =>
          website.name.toLowerCase().includes(search) ||
          website.slug.toLowerCase().includes(search) ||
          website.domain?.toLowerCase().includes(search),
      );
    }

    if (status) {
      websites = websites.filter((website) => website.status === status);
    }

    websites = [...websites].sort((a, b) => {
      let comparison = 0;

      switch (sort) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "domain":
          comparison = (a.domain ?? "").localeCompare(b.domain ?? "");
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "members":
          comparison = a.statistics.members - b.statistics.members;
          break;
        case "videos":
          comparison = a.statistics.videos - b.statistics.videos;
          break;
        case "createdAt":
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return order === "asc" ? comparison : -comparison;
    });

    const total = websites.length;
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    const safePage = totalPages === 0 ? 1 : Math.min(page, totalPages);

    const start = (safePage - 1) * limit;

    return {
      success: true,
      data: websites.slice(start, start + limit),
      pagination: {
        page: safePage,
        limit,
        total,
        totalPages,
      },
    };
  },
);

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
