import { cache } from "react";

import { fetchCentralApiServer } from "@/lib/api/server";

import type { SocialSharesQuery } from "@/lib/social-shares/schema";

import type {
  SocialShareDetailResponse,
  SocialSharesResponse,
} from "@/lib/social-shares/types";

// ============================================================
// LIST
// ============================================================

export const getServerSocialShares = cache(
  async (
    q: string,
    page: number,
    limit: number,
    sort: SocialSharesQuery["sort"],
    order: SocialSharesQuery["order"],
    status?: SocialSharesQuery["status"],
    websiteId?: string,
  ): Promise<SocialSharesResponse> => {
    const searchParams = new URLSearchParams({
      page: String(page),

      limit: String(limit),

      sort,

      order,
    });

    if (q) {
      searchParams.set("q", q);
    }

    if (status) {
      searchParams.set("status", status);
    }

    if (websiteId) {
      searchParams.set("websiteId", websiteId);
    }

    const response = await fetchCentralApiServer(
      `/api/v1/admin/social-shares?${searchParams.toString()}`,
      {
        method: "GET",
      },
    );

    if (!response.ok) {
      throw new Error(`Unable to load social shares (${response.status})`);
    }

    const result = (await response.json()) as SocialSharesResponse;

    if (
      !result.success ||
      !Array.isArray(result.data) ||
      !result.pagination ||
      !result.scope
    ) {
      throw new Error(result.error ?? "Invalid social shares response");
    }

    return result;
  },
);

// ============================================================
// DETAIL
// ============================================================

export const getServerSocialShare = cache(
  async (id: string, websiteId: string): Promise<SocialShareDetailResponse> => {
    const searchParams = new URLSearchParams({
      websiteId,
    });

    const response = await fetchCentralApiServer(
      `/api/v1/admin/social-shares/${encodeURIComponent(
        id,
      )}?${searchParams.toString()}`,
      {
        method: "GET",
      },
    );

    if (response.status === 404) {
      return {
        success: false,
        error: "Social share not found",
      };
    }

    if (!response.ok) {
      throw new Error(`Unable to load social share (${response.status})`);
    }

    const result = (await response.json()) as SocialShareDetailResponse;

    if (!result.success || !result.data) {
      return {
        success: false,

        error: result.error ?? "Social share not found",
      };
    }

    return result;
  },
);
