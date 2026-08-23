"use client";

import Link from "next/link";

import { Globe2 } from "lucide-react";

import { StatusBadge } from "@/components/common/status/status-badge";
import { WebsiteActions } from "@/components/websites/website-actions";

import { TypographyMuted } from "@/components/ui/typography";

import type { DataTableColumn } from "@/lib/data-table/types";
import { formatDateTime } from "@/lib/format/date";
import type { WebsiteListItem } from "@/lib/websites/types";

interface CreateWebsitesColumnsOptions {
  canUpdate: boolean;
  canDelete: boolean;
}

export function createWebsitesColumns({
  canUpdate,
  canDelete,
}: CreateWebsitesColumnsOptions): readonly DataTableColumn<WebsiteListItem>[] {
  return [
    {
      id: "website",
      header: "Website",
      sortable: true,
      sortKey: "name",
      cell: (website) => (
        <div className="flex min-w-48 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
            <Globe2 className="size-4 text-muted-foreground" />
          </div>

          <div className="min-w-0">
            <Link
              href={`/websites/${website.id}`}
              className="block truncate font-medium transition-colors hover:text-primary"
            >
              {website.name}
            </Link>

            <TypographyMuted className="truncate">
              /{website.slug}
            </TypographyMuted>
          </div>
        </div>
      ),
    },
    {
      id: "domain",
      header: "Domain",
      sortable: true,
      sortKey: "domain",
      cell: (website) =>
        website.domain ? (
          <span className="whitespace-nowrap">{website.domain}</span>
        ) : (
          <TypographyMuted>—</TypographyMuted>
        ),
    },
    {
      id: "status",
      header: "Status",
      sortable: true,
      sortKey: "status",
      cell: (website) => <StatusBadge status={website.status} />,
    },
    {
      id: "members",
      header: "Members",
      sortable: true,
      sortKey: "members",
      cell: (website) => (
        <span className="font-medium tabular-nums">
          {website.statistics.members}
        </span>
      ),
    },
    {
      id: "videos",
      header: "Videos",
      sortable: true,
      sortKey: "videos",
      cell: (website) => (
        <span className="font-medium tabular-nums">
          {website.statistics.videos}
        </span>
      ),
    },
    {
      id: "createdAt",
      header: "Created",
      sortable: true,
      sortKey: "createdAt",
      cell: (website) => (
        <TypographyMuted className="whitespace-nowrap">
          {formatDateTime(website.createdAt)}
        </TypographyMuted>
      ),
    },
    {
      id: "actions",
      header: <span className="sr-only">Actions</span>,
      headerClassName: "w-12 text-right",
      cellClassName: "w-12 text-right",
      cell: (website) => (
        <WebsiteActions
          website={website}
          canUpdate={canUpdate}
          canDelete={canDelete}
        />
      ),
    },
  ];
}
