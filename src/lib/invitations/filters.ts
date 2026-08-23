import type { DataTableFilter } from "@/lib/data-table/types";

export function getInvitationsFilters(): readonly DataTableFilter[] {
  return [
    {
      key: "status",
      label: "Status",

      options: [
        {
          label: "Pending",
          value: "PENDING",
        },
        {
          label: "Used",
          value: "USED",
        },
        {
          label: "Expired",
          value: "EXPIRED",
        },
        {
          label: "Revoked",
          value: "REVOKED",
        },
      ],
    },
  ];
}
