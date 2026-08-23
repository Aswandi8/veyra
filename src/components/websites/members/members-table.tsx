"use client";

import { DataTable } from "@/components/common/data-table/data-table";
import { createMembersColumns } from "@/components/websites/members/members-columns";

import type { DataTableSortOrder } from "@/lib/data-table/types";
import type { MemberListItem } from "@/lib/members/types";

interface MembersTableProps {
  websiteId: string;

  members: MemberListItem[];

  limit: number;

  canUpdate: boolean;
  canRemove: boolean;

  emptyMessage?: string;

  currentSort?: string;
  currentOrder?: DataTableSortOrder;
}

export function MembersTable({
  websiteId,
  members,
  limit,
  canUpdate,
  canRemove,
  emptyMessage = "No members found.",
  currentSort,
  currentOrder,
}: MembersTableProps) {
  const columns = createMembersColumns({
    websiteId,
    canUpdate,
    canRemove,
  });

  return (
    <DataTable
      data={members}
      columns={columns}
      getRowKey={(member) => member.userId}
      loadingRows={limit}
      emptyMessage={emptyMessage}
      currentSort={currentSort}
      currentOrder={currentOrder}
      selectable={false}
    />
  );
}
