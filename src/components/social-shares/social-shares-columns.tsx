"use client";

import { ExternalLink, Play } from "lucide-react";

import { AppImage } from "@/components/common/app-image";

import { StatusBadge } from "@/components/common/status/status-badge";

import { SocialShareActions } from "@/components/social-shares/social-share-actions";

import { TypographyMuted } from "@/components/ui/typography";

import type { DataTableColumn } from "@/lib/data-table/types";

import { formatDateTime } from "@/lib/format/date";

import type { SocialShareListItem } from "@/lib/social-shares/types";

// ============================================================
// TYPES
// ============================================================

interface SocialSharesColumnsOptions {
  canUpdate: (websiteId: string) => boolean;

  canDelete: (websiteId: string) => boolean;
}

// ============================================================
// HELPERS
// ============================================================

function getHostname(value: string): string {
  try {
    return new URL(value).hostname;
  } catch {
    return value;
  }
}

// ============================================================
// COLUMNS
// ============================================================

export function getSocialSharesColumns({
  canUpdate,
  canDelete,
}: SocialSharesColumnsOptions): readonly DataTableColumn<SocialShareListItem>[] {
  return [
    {
      id: "socialShare",

      header: "Social Share",

      sortable: true,

      sortKey: "title",

      cell: (socialShare) => {
        const thumbnail = socialShare.shareThumbnail ?? socialShare.thumbnail;

        return (
          <div className="flex min-w-60 items-center gap-3">
            <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg border bg-muted">
              <AppImage
                src={thumbnail}
                alt={socialShare.title}
                width={96}
                height={56}
                unoptimized
                className="size-full object-cover"
              />

              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/15">
                <div className="flex size-7 items-center justify-center rounded-full bg-black/65 text-white">
                  <Play className="size-3.5 fill-current" />
                </div>
              </div>

              {socialShare.displayDuration ? (
                <span className="absolute bottom-1 right-1 rounded bg-black/75 px-1 py-0.5 text-[10px] font-medium leading-none text-white">
                  {socialShare.displayDuration}
                </span>
              ) : null}
            </div>

            <div className="min-w-0">
              <p className="truncate font-medium">{socialShare.title}</p>

              <TypographyMuted className="truncate">
                /watch/
                {socialShare.slug}
              </TypographyMuted>
            </div>
          </div>
        );
      },
    },

    {
      id: "website",

      header: "Website",

      cell: (socialShare) => (
        <div className="min-w-36">
          <p className="font-medium">{socialShare.website.name}</p>

          <TypographyMuted className="max-w-48 truncate">
            {socialShare.website.domain ?? "No domain"}
          </TypographyMuted>
        </div>
      ),
    },

    {
      id: "target",

      header: "Target",

      cell: (socialShare) => (
        <a
          href={socialShare.targetUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex max-w-56 items-center gap-1.5 transition-colors hover:text-primary"
        >
          <span className="truncate">{getHostname(socialShare.targetUrl)}</span>

          <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
        </a>
      ),
    },

    {
      id: "status",

      header: "Status",

      sortable: true,

      sortKey: "status",

      cell: (socialShare) => <StatusBadge status={socialShare.status} />,
    },

    {
      id: "updatedAt",

      header: "Updated",

      sortable: true,

      sortKey: "updatedAt",

      cell: (socialShare) => (
        <TypographyMuted className="whitespace-nowrap">
          {formatDateTime(socialShare.updatedAt)}
        </TypographyMuted>
      ),
    },

    {
      id: "actions",

      header: <span className="sr-only">Actions</span>,

      headerClassName: "w-12 text-right",

      cellClassName: "w-12 text-right",

      cell: (socialShare) => (
        <SocialShareActions
          socialShare={socialShare}
          canUpdate={canUpdate(socialShare.websiteId)}
          canDelete={canDelete(socialShare.websiteId)}
        />
      ),
    },
  ];
}
