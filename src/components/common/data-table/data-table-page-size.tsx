"use client";

import { useDataTableNavigation } from "@/components/common/data-table/data-table-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TypographyMuted } from "@/components/ui/typography";
import { DATA_TABLE_PAGE_SIZES } from "@/lib/data-table/constants";

interface DataTablePageSizeProps {
  value: number;
}

export function DataTablePageSize({ value }: DataTablePageSizeProps) {
  const { updateQuery } = useDataTableNavigation();

  const items = DATA_TABLE_PAGE_SIZES.map((size) => ({
    value: String(size),
    label: String(size),
  }));

  function handleValueChange(nextValue: string | null) {
    if (!nextValue) return;

    updateQuery({ limit: nextValue, page: 1 });
  }

  return (
    <div className="flex items-center gap-2">
      <TypographyMuted className="whitespace-nowrap">
        Rows per page
      </TypographyMuted>

      <Select
        items={items}
        value={String(value)}
        onValueChange={handleValueChange}
      >
        <SelectTrigger className="w-20">
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
    </div>
  );
}
