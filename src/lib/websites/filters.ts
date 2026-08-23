import type { DataTableFilter } from "@/lib/data-table/types";

export function getWebsitesFilters(): readonly DataTableFilter[] {
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
          label: "Maintenance",
          value: "MAINTENANCE",
        },
      ],
    },
  ];
}
