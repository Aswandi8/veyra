"use client";

import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

import { useDataTableNavigation } from "@/components/common/data-table/data-table-provider";
import { Button } from "@/components/ui/button";
import type { DataTableSortOrder } from "@/lib/data-table/types";

interface DataTableSortHeaderProps {
  label: string;
  sortKey: string;
  currentSort?: string;
  currentOrder?: DataTableSortOrder;
}

export function DataTableSortHeader({
  label,
  sortKey,
  currentSort,
  currentOrder,
}: DataTableSortHeaderProps) {
  const { updateQuery } = useDataTableNavigation();

  const active = currentSort === sortKey;

  function handleSort() {
    const nextOrder: DataTableSortOrder =
      active && currentOrder === "asc" ? "desc" : "asc";

    updateQuery({
      sort: sortKey,
      order: nextOrder,
      page: 1,
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="-ml-3 gap-1"
      onClick={handleSort}
    >
      {label}
      {!active ? (
        <ChevronsUpDown className="size-3.5" />
      ) : currentOrder === "desc" ? (
        <ArrowDown className="size-3.5" />
      ) : (
        <ArrowUp className="size-3.5" />
      )}
    </Button>
  );
}
