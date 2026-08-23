"use client";

import { DataTable } from "@/components/common/data-table/data-table";
import { getRolesColumns } from "@/components/roles/roles-columns";

import type { DataTableSortOrder } from "@/lib/data-table/types";
import type { RoleListItem } from "@/lib/roles/types";

interface RolesTableProps {
  roles: RoleListItem[];
  limit: number;
  canUpdate: boolean;
  canDelete: boolean;
  emptyMessage?: string;
  currentSort?: string;
  currentOrder?: DataTableSortOrder;
}

export function RolesTable({
  roles,
  limit,
  canUpdate,
  canDelete,
  emptyMessage = "No roles found.",
  currentSort,
  currentOrder,
}: RolesTableProps) {
  const columns = getRolesColumns({
    canUpdate,
    canDelete,
  });

  return (
    <DataTable
      data={roles}
      columns={columns}
      getRowKey={(role) => role.id}
      emptyMessage={emptyMessage}
      currentSort={currentSort}
      currentOrder={currentOrder}
      loadingRows={limit}
      selectable={false}
    />
  );
}
