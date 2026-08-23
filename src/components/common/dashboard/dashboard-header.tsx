"use client";

import { Menu } from "lucide-react";

import { MobileSidebar } from "@/components/common/dashboard/mobile-sidebar";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { UserMenu } from "@/components/common/dashboard/user-menu";

import { Button } from "@/components/ui/button";

import type { AdminAccess } from "@/lib/permissions/types";

interface DashboardHeaderProps {
  access: AdminAccess;

  sidebarOpen: boolean;

  onOpenSidebar: () => void;
}

export function DashboardHeader({
  access,
  sidebarOpen,
  onOpenSidebar,
}: DashboardHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center border-b border-border bg-background px-4 sm:px-6">
      {/* ====================================================
          LEFT
      ==================================================== */}

      <div className="flex items-center">
        {/* Mobile / Tablet
            Selalu tampil di bawah breakpoint lg.
            Tombol ini membuka Sheet mobile sidebar.
        */}

        <MobileSidebar access={access} />

        {/* Desktop
            Hanya tampil ketika desktop sidebar ditutup.
        */}

        {!sidebarOpen && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onOpenSidebar}
            aria-label="Open sidebar"
            className="hidden lg:inline-flex"
          >
            <Menu className="size-5" />
          </Button>
        )}
      </div>

      {/* ====================================================
          RIGHT
      ==================================================== */}

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />

        <UserMenu user={access.user} superAdmin={access.superAdmin} />
      </div>
    </header>
  );
}
