"use client";

import { useState, type ReactNode } from "react";

import { DashboardHeader } from "@/components/common/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/common/dashboard/dashboard-sidebar";

import type { AdminAccess } from "@/lib/permissions/types";

interface DashboardShellProps {
  access: AdminAccess;
  children: ReactNode;
}

export function DashboardShell({ access, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-dvh min-h-0 w-full overflow-hidden bg-background">
      {/* ====================================================
          DESKTOP SIDEBAR
      ==================================================== */}

      {sidebarOpen && (
        <DashboardSidebar
          access={access}
          onClose={() => {
            setSidebarOpen(false);
          }}
        />
      )}

      {/* ====================================================
          MAIN AREA
      ==================================================== */}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* ==================================================
            HEADER
        ================================================== */}

        <DashboardHeader
          access={access}
          sidebarOpen={sidebarOpen}
          onOpenSidebar={() => {
            setSidebarOpen(true);
          }}
        />

        {/* ==================================================
            CONTENT
        ================================================== */}

        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto bg-background">
          <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
