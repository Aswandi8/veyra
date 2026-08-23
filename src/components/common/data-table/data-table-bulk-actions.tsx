"use client";

import type { ReactNode } from "react";

import { TypographyMuted } from "@/components/ui/typography";

interface DataTableBulkActionsProps {
  selectedCount: number;
  children?: ReactNode;
}

export function DataTableBulkActions({
  selectedCount,
  children,
}: DataTableBulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/40 px-3 py-2">
      <TypographyMuted>{selectedCount} selected</TypographyMuted>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}
