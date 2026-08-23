import type { DataTableFilter } from "@/lib/data-table/types";

export function getRolesFilters(): readonly DataTableFilter[] {
  return [
    {
      key: "scope",
      label: "Scope",
      options: [
        { label: "Global", value: "GLOBAL" },
        { label: "Website", value: "WEBSITE" },
      ],
    },
    {
      key: "type",
      label: "Type",
      options: [
        { label: "System", value: "SYSTEM" },
        { label: "Custom", value: "CUSTOM" },
      ],
    },
  ];
}
