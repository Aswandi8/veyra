"use client";

import { useMemo, useState, type ReactNode } from "react";

import { useDataTableNavigation } from "@/components/common/data-table/data-table-provider";
import { DataTableSortHeader } from "@/components/common/data-table/data-table-sort-header";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TypographyMuted } from "@/components/ui/typography";
import type {
  DataTableColumn,
  DataTableSortOrder,
} from "@/lib/data-table/types";
import { cn } from "@/lib/utils";

interface DataTableProps<T> {
  data: readonly T[];
  columns: readonly DataTableColumn<T>[];
  getRowKey: (item: T) => string;
  canSelectRow?: (item: T) => boolean;
  emptyMessage?: string;
  className?: string;
  selectable?: boolean;
  currentSort?: string;
  currentOrder?: DataTableSortOrder;
  loadingRows?: number;
  renderBulkActions?: (
    selectedIds: readonly string[],
    clearSelection: () => void,
  ) => ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  getRowKey,
  canSelectRow,
  emptyMessage = "No data found.",
  className,
  selectable = false,
  currentSort,
  currentOrder,
  loadingRows = 20,
  renderBulkActions,
}: DataTableProps<T>) {
  const { isPending } = useDataTableNavigation();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectablePageIds = useMemo(
    () =>
      data
        .filter((item) => !canSelectRow || canSelectRow(item))
        .map((item) => getRowKey(item)),
    [canSelectRow, data, getRowKey],
  );

  const selectedPageIds = useMemo(
    () => selectedIds.filter((id) => selectablePageIds.includes(id)),
    [selectablePageIds, selectedIds],
  );

  const allSelected =
    selectablePageIds.length > 0 &&
    selectedPageIds.length === selectablePageIds.length;

  const partiallySelected = selectedPageIds.length > 0 && !allSelected;

  const skeletonRows =
    data.length > 0
      ? Math.min(data.length, loadingRows, 10)
      : Math.min(Math.max(loadingRows, 1), 10);

  function toggleAll(checked: boolean) {
    setSelectedIds(checked ? selectablePageIds : []);
  }

  function toggleRow(id: string, checked: boolean) {
    setSelectedIds((current) => {
      if (checked) {
        return current.includes(id) ? current : [...current, id];
      }

      return current.filter((value) => value !== id);
    });
  }

  return (
    <div className="space-y-3">
      {!isPending &&
        renderBulkActions?.(selectedPageIds, () => setSelectedIds([]))}

      <div
        className={cn("overflow-hidden rounded-xl border bg-card", className)}
        aria-busy={isPending}
      >
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-10">
                  {isPending ? (
                    <Skeleton className="size-4 rounded" />
                  ) : (
                    <Checkbox
                      checked={allSelected}
                      indeterminate={partiallySelected}
                      disabled={selectablePageIds.length === 0}
                      onCheckedChange={toggleAll}
                      aria-label="Select current page"
                    />
                  )}
                </TableHead>
              )}

              {columns.map((column) => (
                <TableHead key={column.id} className={column.headerClassName}>
                  {column.sortable && column.sortKey ? (
                    <DataTableSortHeader
                      label={String(column.header)}
                      sortKey={column.sortKey}
                      currentSort={currentSort}
                      currentOrder={currentOrder}
                    />
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {isPending ? (
              Array.from({
                length: skeletonRows,
              }).map((_, rowIndex) => (
                <TableRow key={`skeleton-${rowIndex}`}>
                  {selectable && (
                    <TableCell className="w-10">
                      <Skeleton className="size-4 rounded" />
                    </TableCell>
                  )}

                  {columns.map((column, columnIndex) => (
                    <TableCell key={column.id}>
                      <Skeleton
                        className={cn(
                          "h-4",
                          columnIndex === 0
                            ? "w-full max-w-56"
                            : "w-full max-w-28",
                        )}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length > 0 ? (
              data.map((item) => {
                const id = getRowKey(item);

                const rowSelectable = !canSelectRow || canSelectRow(item);

                const selected = rowSelectable && selectedPageIds.includes(id);

                return (
                  <TableRow
                    key={id}
                    data-state={selected ? "selected" : undefined}
                  >
                    {selectable && (
                      <TableCell className="w-10">
                        <Checkbox
                          checked={selected}
                          disabled={!rowSelectable}
                          onCheckedChange={(checked) => toggleRow(id, checked)}
                          aria-label={
                            rowSelectable
                              ? `Select row ${id}`
                              : `Row ${id} cannot be selected`
                          }
                        />
                      </TableCell>
                    )}

                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        className={column.cellClassName}
                      >
                        {column.cell(item)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="h-32 text-center"
                >
                  <TypographyMuted>{emptyMessage}</TypographyMuted>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
