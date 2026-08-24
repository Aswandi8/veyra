import { cache } from "react";

import { fetchCentralApiServer } from "@/lib/api/server";
import type { ShortLinksQuery } from "@/lib/shortlinks/schema";
import type {
  ShortLinkDetailAnalyticsResponse,
  ShortLinkDetailResponse,
  ShortLinkGlobalAnalyticsResponse,
  ShortLinksResponse,
} from "@/lib/shortlinks/types";

export const getServerShortLinks = cache(
  async (
    q: string,
    page: number,
    limit: number,
    sort: ShortLinksQuery["sort"],
    order: ShortLinksQuery["order"],
    status?: ShortLinksQuery["status"],
    previewType?: ShortLinksQuery["previewType"],
  ): Promise<ShortLinksResponse> => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sort,
      order,
    });

    const search = q.trim();

    if (search) params.set("q", search);
    if (status) params.set("status", status);
    if (previewType) params.set("previewType", previewType);

    const response = await fetchCentralApiServer(
      `/api/v1/admin/shortlinks?${params.toString()}`,
      { method: "GET" },
    );

    if (!response.ok) {
      throw new Error(`Unable to load shortlinks (${response.status})`);
    }

    const result = (await response.json()) as ShortLinksResponse;

    if (!result.success || !Array.isArray(result.data) || !result.pagination) {
      throw new Error(result.error ?? "Invalid shortlink response");
    }

    return result;
  },
);

export const getServerShortLink = cache(
  async (id: string): Promise<ShortLinkDetailResponse> => {
    const response = await fetchCentralApiServer(
      `/api/v1/admin/shortlinks/${encodeURIComponent(id)}`,
      { method: "GET" },
    );

    if (response.status === 404) {
      return { success: false, error: "Shortlink not found" };
    }

    if (!response.ok) {
      throw new Error(`Unable to load shortlink (${response.status})`);
    }

    return (await response.json()) as ShortLinkDetailResponse;
  },
);

export const getServerShortLinkGlobalAnalytics = cache(
  async (days = 30): Promise<ShortLinkGlobalAnalyticsResponse> => {
    const response = await fetchCentralApiServer(
      `/api/v1/admin/shortlinks/analytics?days=${days}`,
      { method: "GET" },
    );

    if (!response.ok) {
      throw new Error(
        `Unable to load shortlink analytics (${response.status})`,
      );
    }

    return (await response.json()) as ShortLinkGlobalAnalyticsResponse;
  },
);

export const getServerShortLinkAnalytics = cache(
  async (id: string, days = 30): Promise<ShortLinkDetailAnalyticsResponse> => {
    const response = await fetchCentralApiServer(
      `/api/v1/admin/shortlinks/${encodeURIComponent(id)}/analytics?days=${days}`,
      { method: "GET" },
    );

    if (!response.ok) {
      throw new Error(
        `Unable to load shortlink detail analytics (${response.status})`,
      );
    }

    return (await response.json()) as ShortLinkDetailAnalyticsResponse;
  },
);
