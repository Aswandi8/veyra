"use client";

import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

import { DataTableFilters } from "@/components/common/data-table/data-table-filters";
import { DataTablePageSize } from "@/components/common/data-table/data-table-page-size";
import { useDataTableNavigation } from "@/components/common/data-table/data-table-provider";
import { DataTableSearch } from "@/components/common/data-table/data-table-search";

import { TypographyMuted } from "@/components/ui/typography";

import type { DataTableFilter } from "@/lib/data-table/types";

interface DataTableToolbarProps {
  searchValue?: string;
  searchPlaceholder?: string;
  limit: number;
  filters?: readonly DataTableFilter[];
  filterValues?: Record<string, string | undefined>;
  actions?: ReactNode;
}

export function DataTableToolbar({
  searchValue = "",
  searchPlaceholder = "Search...",
  limit,
  filters = [],
  filterValues = {},
  actions,
}: DataTableToolbarProps) {
  const { isPending } = useDataTableNavigation();

  return (
    <div className="space-y-3">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <DataTableSearch value={searchValue} placeholder={searchPlaceholder} />

        <div className="flex flex-wrap items-center gap-3">
          {isPending ? (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              <TypographyMuted>Updating...</TypographyMuted>
            </div>
          ) : null}

          <DataTablePageSize value={limit} />

          {actions}
        </div>
      </div>

      <DataTableFilters filters={filters} values={filterValues} />
    </div>
  );
}
