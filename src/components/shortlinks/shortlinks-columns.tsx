"use client";

import Link from "next/link";
import { ImageIcon, Link2, Video } from "lucide-react";

import { StatusBadge } from "@/components/common/status/status-badge";
import { ShortLinkActions } from "@/components/shortlinks/shortlink-actions";
import { TypographyMuted } from "@/components/ui/typography";

import type { DataTableColumn } from "@/lib/data-table/types";
import { formatDateTime } from "@/lib/format/date";
import type { ShortLinkListItem } from "@/lib/shortlinks/types";

interface CreateShortLinksColumnsOptions {
  canUpdate: boolean;
  canDelete: boolean;
}

function PreviewIcon({ type }: { type: ShortLinkListItem["previewType"] }) {
  if (type === "VIDEO") return <Video className="size-4" />;
  if (type === "IMAGE") return <ImageIcon className="size-4" />;
  return <Link2 className="size-4" />;
}

export function createShortLinksColumns({
  canUpdate,
  canDelete,
}: CreateShortLinksColumnsOptions): readonly DataTableColumn<ShortLinkListItem>[] {
  return [
    {
      id: "shortlink",
      header: "ShortLink",
      sortable: true,
      sortKey: "slug",
      cell: (shortLink) => (
        <div className="flex min-w-52 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
            <PreviewIcon type={shortLink.previewType} />
          </div>

          <div className="min-w-0">
            <Link
              href={`/shortlinks/${shortLink.id}`}
              className="block truncate font-medium hover:underline"
            >
              /{shortLink.slug}
            </Link>

            <TypographyMuted className="max-w-72 truncate">
              {shortLink.title || shortLink.destinationUrl}
            </TypographyMuted>
          </div>
        </div>
      ),
    },

    {
      id: "previewType",
      header: "Preview",
      sortable: true,
      sortKey: "previewType",
      cell: (shortLink) => <StatusBadge status={shortLink.previewType} />,
    },

    {
      id: "status",
      header: "Status",
      sortable: true,
      sortKey: "status",
      cell: (shortLink) => <StatusBadge status={shortLink.status} />,
    },

    {
      id: "clickCount",
      header: "Clicks",
      sortable: true,
      sortKey: "clickCount",
      cell: (shortLink) => (
        <span className="font-medium tabular-nums">
          {shortLink.clickCount.toLocaleString()}
        </span>
      ),
    },

    {
      id: "destination",
      header: "Destination",
      cell: (shortLink) => (
        <TypographyMuted className="block max-w-72 truncate">
          {shortLink.destinationUrl}
        </TypographyMuted>
      ),
    },

    {
      id: "createdAt",
      header: "Created",
      sortable: true,
      sortKey: "createdAt",
      cell: (shortLink) => (
        <TypographyMuted className="whitespace-nowrap">
          {formatDateTime(shortLink.createdAt)}
        </TypographyMuted>
      ),
    },

    {
      id: "actions",
      header: <span className="sr-only">Actions</span>,
      headerClassName: "w-12 text-right",
      cellClassName: "w-12 text-right",
      cell: (shortLink) => (
        <ShortLinkActions
          shortLink={shortLink}
          canUpdate={canUpdate}
          canDelete={canDelete}
        />
      ),
    },
  ];
}
