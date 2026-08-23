import type { DataTableFilter } from "@/lib/data-table/types";
import type { RoleListItem } from "@/lib/roles/types";

export function getUsersFilters(
  roles: readonly RoleListItem[] = [],
): readonly DataTableFilter[] {
  const filters: DataTableFilter[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Active", value: "ACTIVE" },
        { label: "Inactive", value: "INACTIVE" },
        { label: "Suspended", value: "SUSPENDED" },
        { label: "Banned", value: "BANNED" },
      ],
    },
    {
      key: "verified",
      label: "Verification",
      options: [
        { label: "Verified", value: "true" },
        { label: "Unverified", value: "false" },
      ],
    },
    {
      key: "banned",
      label: "Ban status",
      options: [
        { label: "Banned", value: "true" },
        { label: "Not banned", value: "false" },
      ],
    },
  ];

  if (roles.length > 0) {
    filters.push({
      key: "role",
      label: "Role",
      options: roles.map((role) => ({
        label: role.name,
        value: role.id,
      })),
    });
  }

  return filters;
}
