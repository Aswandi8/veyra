"use client";

import { Menu } from "lucide-react";

import { AppImage } from "@/components/common/app-image";

import { DashboardNav } from "@/components/common/dashboard/dashboard-nav";

import { SidebarScrollArea } from "@/components/common/dashboard/sidebar-scroll-area";

import { Button } from "@/components/ui/button";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import type { AdminAccess } from "@/lib/permissions/types";

interface MobileSidebarProps {
  access: AdminAccess;
}

export function MobileSidebar({ access }: MobileSidebarProps) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0 lg:hidden"
            aria-label="Open navigation"
          />
        }
      >
        <Menu className="size-4" />

        <span className="sr-only">Open navigation</span>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="flex h-dvh w-72 flex-col overflow-hidden p-0"
      >
        {/* ==================================================
            LOGO
        ================================================== */}

        <SheetHeader className="flex h-16 shrink-0 flex-row items-center border-b border-sidebar-border px-4">
          <SheetTitle className="sr-only">Veyra Navigation</SheetTitle>

          <AppImage
            src="/logo.png"
            alt="Veyra"
            width={180}
            height={72}
            priority
            className="h-auto w-32 object-contain"
          />
        </SheetHeader>

        {/* ==================================================
            NAVIGATION
        ================================================== */}

        <SidebarScrollArea className="px-3 py-4">
          <DashboardNav access={access} />
        </SidebarScrollArea>
      </SheetContent>
    </Sheet>
  );
}
