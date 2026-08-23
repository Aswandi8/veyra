"use client";

import { DataTable } from "@/components/common/data-table/data-table";
import { createInvitationsColumns } from "@/components/websites/invitations/invitations-columns";

import type { DataTableSortOrder } from "@/lib/data-table/types";
import type { InvitationListItem } from "@/lib/invitations/types";

interface InvitationsTableProps {
  websiteId: string;

  invitations: InvitationListItem[];

  limit: number;

  canRevoke: boolean;

  emptyMessage?: string;

  currentSort?: string;
  currentOrder?: DataTableSortOrder;
}

export function InvitationsTable({
  websiteId,
  invitations,
  limit,
  canRevoke,
  emptyMessage = "No invitations found.",
  currentSort,
  currentOrder,
}: InvitationsTableProps) {
  const columns = createInvitationsColumns({
    websiteId,
    canRevoke,
  });

  return (
    <DataTable
      data={invitations}
      columns={columns}
      getRowKey={(invitation) => invitation.id}
      loadingRows={limit}
      emptyMessage={emptyMessage}
      currentSort={currentSort}
      currentOrder={currentOrder}
      selectable={false}
    />
  );
}
