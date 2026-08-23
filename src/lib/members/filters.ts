import type { DataTableFilter } from "@/lib/data-table/types";

export function getMembersFilters(): readonly DataTableFilter[] {
  return [
    {
      key: "status",
      label: "Status",
      options: [
        {
          label: "Active",
          value: "ACTIVE",
        },
        {
          label: "Inactive",
          value: "INACTIVE",
        },
        {
          label: "Suspended",
          value: "SUSPENDED",
        },
        {
          label: "Banned",
          value: "BANNED",
        },
      ],
    },
    {
      key: "verified",
      label: "Verification",
      options: [
        {
          label: "Verified",
          value: "VERIFIED",
        },
        {
          label: "Unverified",
          value: "UNVERIFIED",
        },
      ],
    },
  ];
}
