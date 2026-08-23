"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

interface DataTableExportProps {
  href: string;
  label?: string;
  disabled?: boolean;
}

export function DataTableExport({
  href,
  label = "Export",
  disabled = false,
}: DataTableExportProps) {
  if (disabled) {
    return (
      <Button type="button" variant="outline" disabled>
        <Download className="mr-2 size-4" />
        {label}
      </Button>
    );
  }

  return (
    <Button nativeButton={false} render={<a href={href} />} variant="outline">
      <Download className="mr-2 size-4" />
      {label}
    </Button>
  );
}
