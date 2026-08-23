"use client";

import { Search } from "lucide-react";
import { useEffect, useRef } from "react";

import { useDataTableNavigation } from "@/components/common/data-table/data-table-provider";
import { Input } from "@/components/ui/input";
import { DATA_TABLE_SEARCH_DEBOUNCE_MS } from "@/lib/data-table/constants";

interface DataTableSearchProps {
  value?: string;
  placeholder?: string;
}

export function DataTableSearch({
  value = "",
  placeholder = "Search...",
}: DataTableSearchProps) {
  const { updateQuery } = useDataTableNavigation();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function handleChange(search: string) {
    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      updateQuery({ q: search.trim() || null, page: 1 });
    }, DATA_TABLE_SEARCH_DEBOUNCE_MS);
  }

  return (
    <div className="relative w-full sm:max-w-sm">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        key={value}
        type="search"
        defaultValue={value}
        placeholder={placeholder}
        className="pl-8"
        onChange={(event) => handleChange(event.target.value)}
      />
    </div>
  );
}
