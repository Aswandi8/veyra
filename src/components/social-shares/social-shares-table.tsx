"use client";

import { DataTable } from "@/components/common/data-table/data-table";

import { getSocialSharesColumns } from "@/components/social-shares/social-shares-columns";

import type { DataTableSortOrder } from "@/lib/data-table/types";

import type { SocialShareListItem } from "@/lib/social-shares/types";

interface SocialSharesTableProps {
  socialShares: SocialShareListItem[];

  limit: number;

  emptyMessage?: string;

  currentSort?: string;

  currentOrder?: DataTableSortOrder;

  canUpdateWebsiteIds: string[];

  canDeleteWebsiteIds: string[];
}

export function SocialSharesTable({
  socialShares,
  limit,
  emptyMessage = "No social shares found.",
  currentSort,
  currentOrder,
  canUpdateWebsiteIds,
  canDeleteWebsiteIds,
}: SocialSharesTableProps) {
  const columns = getSocialSharesColumns({
    canUpdate: (websiteId) => canUpdateWebsiteIds.includes(websiteId),

    canDelete: (websiteId) => canDeleteWebsiteIds.includes(websiteId),
  });

  return (
    <DataTable
      data={socialShares}
      columns={columns}
      getRowKey={(socialShare) => socialShare.id}
      emptyMessage={emptyMessage}
      currentSort={currentSort}
      currentOrder={currentOrder}
      loadingRows={limit}
      selectable={false}
    />
  );
}
