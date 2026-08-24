import type { DataTableFilter } from "@/lib/data-table/types";

export function getShortLinksFilters(): readonly DataTableFilter[] {
  return [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Active", value: "ACTIVE" },
        { label: "Inactive", value: "INACTIVE" },
      ],
    },
    {
      key: "previewType",
      label: "Preview",
      options: [
        { label: "Image", value: "IMAGE" },
        { label: "Video", value: "VIDEO" },
      ],
    },
  ];
}
