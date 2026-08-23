"use client";

import { DataTable } from "@/components/common/data-table/data-table";
import { createWebsitesColumns } from "@/components/websites/websites-columns";

import type { DataTableSortOrder } from "@/lib/data-table/types";
import type { WebsiteListItem } from "@/lib/websites/types";

interface WebsitesTableProps {
  websites: WebsiteListItem[];
  limit: number;
  canUpdate: boolean;
  canDelete: boolean;
  emptyMessage?: string;
  currentSort?: string;
  currentOrder?: DataTableSortOrder;
}

export function WebsitesTable({
  websites,
  limit,
  canUpdate,
  canDelete,
  emptyMessage = "No websites found.",
  currentSort,
  currentOrder,
}: WebsitesTableProps) {
  const columns = createWebsitesColumns({
    canUpdate,
    canDelete,
  });

  return (
    <DataTable
      data={websites}
      columns={columns}
      getRowKey={(website) => website.id}
      loadingRows={limit}
      emptyMessage={emptyMessage}
      currentSort={currentSort}
      currentOrder={currentOrder}
      selectable={false}
    />
  );
}
