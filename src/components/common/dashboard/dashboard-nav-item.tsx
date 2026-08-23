"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { DashboardNavigationItem } from "@/lib/dashboard/navigation";

interface DashboardNavItemProps {
  item: DashboardNavigationItem;
  active: boolean;
}

export function DashboardNavItem({ item, active }: DashboardNavItemProps) {
  const Icon = item.icon;

  return (
    <Button
      nativeButton={false}
      render={<Link href={item.href} />}
      variant={active ? "secondary" : "ghost"}
      className="w-full justify-start gap-3"
    >
      <Icon className="size-4 shrink-0" />
      <span className="truncate">{item.label}</span>
    </Button>
  );
}
