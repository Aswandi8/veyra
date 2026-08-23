"use client";

import { usePathname } from "next/navigation";

import { DashboardNavItem } from "@/components/common/dashboard/dashboard-nav-item";
import { TypographyCaption } from "@/components/ui/typography";

import { DASHBOARD_NAVIGATION } from "@/lib/dashboard/navigation";

import {
  hasAnyWebsitePermission,
  hasGlobalPermission,
} from "@/lib/permissions/access";

import type { AdminAccess } from "@/lib/permissions/types";

interface DashboardNavProps {
  access: AdminAccess;
}

function canSeeNavigationItem(
  access: AdminAccess,
  permission?: string,
  permissionScope?: "GLOBAL" | "WEBSITE",
): boolean {
  if (!permission) {
    return true;
  }

  if (permissionScope === "WEBSITE") {
    return hasAnyWebsitePermission(access, permission);
  }

  return hasGlobalPermission(access, permission);
}

export function DashboardNav({ access }: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <nav className="space-y-6">
      {DASHBOARD_NAVIGATION.map((group) => {
        const items = group.items.filter((item) =>
          canSeeNavigationItem(access, item.permission, item.permissionScope),
        );

        if (items.length === 0) {
          return null;
        }

        return (
          <div key={group.label} className="space-y-2">
            <TypographyCaption className="px-3 font-semibold uppercase tracking-wider">
              {group.label}
            </TypographyCaption>

            <div className="space-y-1">
              {items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(`${item.href}/`));

                return (
                  <DashboardNavItem
                    key={item.href}
                    item={item}
                    active={active}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
