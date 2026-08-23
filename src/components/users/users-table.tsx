"use client";

import { DataTable } from "@/components/common/data-table/data-table";

import { UsersBulkActions } from "@/components/users/users-bulk-actions";
import { getUsersColumns } from "@/components/users/users-columns";

import type { DataTableSortOrder } from "@/lib/data-table/types";
import type { UserListItem } from "@/lib/users/types";

interface UsersTableProps {
  users: UserListItem[];
  limit: number;
  canUpdate: boolean;
  canDelete: boolean;
  emptyMessage?: string;
  currentSort?: string;
  currentOrder?: DataTableSortOrder;
}

function isSuperAdmin(user: UserListItem): boolean {
  return user.roles.some((role) => role.name === "SUPER_ADMIN");
}

export function UsersTable({
  users,
  limit,
  canUpdate,
  canDelete,
  emptyMessage = "No users found.",
  currentSort,
  currentOrder,
}: UsersTableProps) {
  const selectable = canUpdate || canDelete;

  const columns = getUsersColumns({
    canUpdate,
  });

  return (
    <DataTable
      data={users}
      columns={columns}
      getRowKey={(user) => user.id}
      canSelectRow={(user) => !isSuperAdmin(user)}
      emptyMessage={emptyMessage}
      currentSort={currentSort}
      currentOrder={currentOrder}
      loadingRows={limit}
      selectable={selectable}
      renderBulkActions={
        selectable
          ? (selectedIds, clearSelection) => (
              <UsersBulkActions
                selectedIds={selectedIds}
                canUpdate={canUpdate}
                canDelete={canDelete}
                onSuccess={clearSelection}
              />
            )
          : undefined
      }
    />
  );
}
