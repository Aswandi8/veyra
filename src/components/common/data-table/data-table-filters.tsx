"use client";

import { useDataTableNavigation } from "@/components/common/data-table/data-table-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DataTableFilter } from "@/lib/data-table/types";

interface DataTableFiltersProps {
  filters: readonly DataTableFilter[];
  values?: Record<string, string | undefined>;
}

export function DataTableFilters({
  filters,
  values = {},
}: DataTableFiltersProps) {
  const { updateQuery } = useDataTableNavigation();

  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((filter) => {
        const items = [
          { value: "__all__", label: `All ${filter.label}` },
          ...filter.options,
        ];

        return (
          <Select
            key={filter.key}
            items={items}
            value={values[filter.key] ?? "__all__"}
            onValueChange={(value) =>
              updateQuery({
                [filter.key]: !value || value === "__all__" ? null : value,
                page: 1,
              })
            }
          >
            <SelectTrigger className="min-w-40">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      })}
    </div>
  );
}
