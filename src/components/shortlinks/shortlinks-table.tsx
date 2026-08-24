"use client";

import { DataTable } from "@/components/common/data-table/data-table";
import { createShortLinksColumns } from "@/components/shortlinks/shortlinks-columns";

import type { DataTableSortOrder } from "@/lib/data-table/types";
import type { ShortLinkListItem } from "@/lib/shortlinks/types";

interface ShortLinksTableProps {
  shortLinks: ShortLinkListItem[];
  limit: number;
  canUpdate: boolean;
  canDelete: boolean;
  emptyMessage?: string;
  currentSort?: string;
  currentOrder?: DataTableSortOrder;
}

export function ShortLinksTable({
  shortLinks,
  limit,
  canUpdate,
  canDelete,
  emptyMessage = "No shortlinks found.",
  currentSort,
  currentOrder,
}: ShortLinksTableProps) {
  return (
    <DataTable
      data={shortLinks}
      columns={createShortLinksColumns({ canUpdate, canDelete })}
      getRowKey={(shortLink) => shortLink.id}
      loadingRows={limit}
      emptyMessage={emptyMessage}
      currentSort={currentSort}
      currentOrder={currentOrder}
      selectable={false}
    />
  );
}
