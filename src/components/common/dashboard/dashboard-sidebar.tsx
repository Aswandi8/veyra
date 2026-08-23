"use client";

import { X } from "lucide-react";

import { AppImage } from "@/components/common/app-image";

import { DashboardNav } from "@/components/common/dashboard/dashboard-nav";

import { SidebarScrollArea } from "@/components/common/dashboard/sidebar-scroll-area";

import { Button } from "@/components/ui/button";

import type { AdminAccess } from "@/lib/permissions/types";

interface DashboardSidebarProps {
  access: AdminAccess;
  onClose: () => void;
}

export function DashboardSidebar({ access, onClose }: DashboardSidebarProps) {
  return (
    <aside className="hidden h-dvh w-64 shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
      {/* ====================================================
          LOGO
      ==================================================== */}

      <div className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border px-4">
        <AppImage
          src="/logo.png"
          alt="Veyra"
          width={180}
          height={72}
          priority
          className="h-auto w-32 object-contain"
        />

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onClose}
          aria-label="Close sidebar"
          className="size-8 shrink-0"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* ====================================================
          NAVIGATION
      ==================================================== */}

      <SidebarScrollArea className="px-3 py-4">
        <DashboardNav access={access} />
      </SidebarScrollArea>
    </aside>
  );
}
