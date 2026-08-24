export type ShortLinkStatus = "ACTIVE" | "INACTIVE";
export type ShortLinkPreviewType = "IMAGE" | "VIDEO";

export interface ShortLinkCreator {
  id: string;
  name: string;
  email: string;
}

export interface ShortLinkListItem {
  id: string;
  slug: string;
  destinationUrl: string;
  status: ShortLinkStatus;
  previewType: ShortLinkPreviewType;

  title: string | null;
  description: string | null;

  thumbnailUrl: string | null;
  thumbnailWidth: number | null;
  thumbnailHeight: number | null;
  thumbnailMimeType: string | null;
  thumbnailSizeBytes: number | null;

  previewVideoUrl: string | null;
  previewVideoWidth: number | null;
  previewVideoHeight: number | null;
  previewVideoDurationMs: number | null;
  previewVideoMimeType: string | null;
  previewVideoSizeBytes: number | null;

  showPlayButton: boolean;
  displayDuration: string | null;

  clickCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: ShortLinkCreator | null;
}

export interface ShortLinkDetail extends ShortLinkListItem {
  eventCount?: number;
}

export interface ShortLinksResponse {
  success: boolean;
  data: ShortLinkListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

export interface ShortLinkDetailResponse {
  success: boolean;
  data?: ShortLinkDetail;
  error?: string;
}

export interface ShortLinkMutationResponse {
  success: boolean;
  message?: string;
  data?: ShortLinkDetail;
  error?: string;
}

export interface ShortLinkDeleteResponse {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    slug: string;
    title: string | null;
    clickCount: number;
  };
  error?: string;
}

export interface ShortLinkAnalyticsItem {
  value: string | null;
  clicks: number;
}

export interface ShortLinkClicksByDay {
  date: string;
  clicks: number;
}

export interface ShortLinkAnalyticsRange {
  days: number;
  start: string;
  end: string;
}

export interface ShortLinkGlobalAnalytics {
  range: ShortLinkAnalyticsRange;

  summary: {
    totalShortLinks: number;
    activeShortLinks: number;
    inactiveShortLinks: number;
    totalClicks: number;
    rangeClicks: number;
    uniqueVisitors: number;
  };

  clicksByDay: ShortLinkClicksByDay[];

  topLinks: Array<{
    id: string;
    slug: string;
    title: string | null;
    status: ShortLinkStatus;
    previewType: ShortLinkPreviewType;
    destinationUrl: string;
    clickCount: number;
  }>;

  topReferrers: ShortLinkAnalyticsItem[];
  topCountries: ShortLinkAnalyticsItem[];
  topDevices: ShortLinkAnalyticsItem[];
  topBrowsers: ShortLinkAnalyticsItem[];
  topOperatingSystems: ShortLinkAnalyticsItem[];
}

export interface ShortLinkDetailAnalytics {
  shortLink: {
    id: string;
    slug: string;
    title: string | null;
    destinationUrl: string;
    status: ShortLinkStatus;
    previewType: ShortLinkPreviewType;
    clickCount: number;
    createdAt: string;
    updatedAt: string;
  };

  range: ShortLinkAnalyticsRange;

  summary: {
    totalClicks: number;
    rangeClicks: number;
    todayClicks: number;
    uniqueVisitors: number;
  };

  visitorTypes: {
    HUMAN: number;
    CRAWLER: number;
    BOT: number;
    UNKNOWN: number;
  };

  clicksByDay: ShortLinkClicksByDay[];

  topReferrers: ShortLinkAnalyticsItem[];
  topCountries: ShortLinkAnalyticsItem[];
  topDevices: ShortLinkAnalyticsItem[];
  topBrowsers: ShortLinkAnalyticsItem[];
  topOperatingSystems: ShortLinkAnalyticsItem[];
}

export interface ShortLinkGlobalAnalyticsResponse {
  success: boolean;
  data?: ShortLinkGlobalAnalytics;
  error?: string;
}

export interface ShortLinkDetailAnalyticsResponse {
  success: boolean;
  data?: ShortLinkDetailAnalytics;
  error?: string;
}
