import type { DataTableFilter } from "@/lib/data-table/types";

import type { SocialShareWebsiteOption } from "@/lib/social-shares/types";

export function getSocialSharesFilters(
  websites: readonly SocialShareWebsiteOption[],
): readonly DataTableFilter[] {
  return [
    {
      key: "website",

      /*
       * DataTableFilters akan otomatis membuat:
       *
       * All Websites
       */
      label: "Websites",

      options: websites.map((website) => ({
        label: website.name,

        value: website.id,
      })),
    },

    {
      key: "status",
      label: "Status",

      options: [
        {
          label: "Draft",
          value: "DRAFT",
        },
        {
          label: "Active",
          value: "ACTIVE",
        },
        {
          label: "Archived",
          value: "ARCHIVED",
        },
      ],
    },
  ];
}
