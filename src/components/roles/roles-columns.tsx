"use client";

import Link from "next/link";

import { StatusBadge } from "@/components/common/status/status-badge";
import { RoleActions } from "@/components/roles/role-actions";

import { TypographyMuted } from "@/components/ui/typography";

import type { DataTableColumn } from "@/lib/data-table/types";
import { formatDateTime } from "@/lib/format/date";
import type { RoleListItem } from "@/lib/roles/types";

function formatRoleName(name: string): string {
  return name.replaceAll("_", " ");
}

interface GetRolesColumnsOptions {
  canUpdate: boolean;
  canDelete: boolean;
}

export function getRolesColumns({
  canUpdate,
  canDelete,
}: GetRolesColumnsOptions): readonly DataTableColumn<RoleListItem>[] {
  return [
    {
      id: "role",
      header: "Role",
      sortable: true,
      sortKey: "name",
      cell: (role) => (
        <div className="min-w-44">
          <Link
            href={`/roles/${role.id}`}
            className="font-medium transition-colors hover:text-primary"
          >
            {formatRoleName(role.name)}
          </Link>

          {role.description ? (
            <TypographyMuted className="mt-1 line-clamp-1">
              {role.description}
            </TypographyMuted>
          ) : (
            <TypographyMuted className="mt-1">No description</TypographyMuted>
          )}
        </div>
      ),
    },
    {
      id: "scope",
      header: "Scope",
      sortable: true,
      sortKey: "scope",
      cell: (role) => <StatusBadge status={role.scope} />,
    },
    {
      id: "type",
      header: "Type",
      sortable: true,
      sortKey: "type",
      cell: (role) => (
        <StatusBadge status={role.system ? "SYSTEM" : "CUSTOM"} />
      ),
    },
    {
      id: "permissions",
      header: "Permissions",
      sortable: true,
      sortKey: "permissions",
      cell: (role) => (
        <div className="font-medium tabular-nums">{role.permissionCount}</div>
      ),
    },
    {
      id: "users",
      header: "Users",
      sortable: true,
      sortKey: "users",
      cell: (role) => (
        <div className="font-medium tabular-nums">{role.userCount}</div>
      ),
    },
    {
      id: "invitations",
      header: "Invitations",
      cell: (role) => (
        <div className="font-medium tabular-nums">{role.invitationCount}</div>
      ),
    },
    {
      id: "updatedAt",
      header: "Updated",
      sortable: true,
      sortKey: "updatedAt",
      cell: (role) => (
        <TypographyMuted className="whitespace-nowrap">
          {formatDateTime(role.updatedAt)}
        </TypographyMuted>
      ),
    },
    {
      id: "actions",
      header: "",
      headerClassName: "w-12",
      cellClassName: "w-12 text-right",
      cell: (role) => (
        <RoleActions role={role} canUpdate={canUpdate} canDelete={canDelete} />
      ),
    },
  ];
}
