import type { ReactNode } from "react";

import { redirect } from "next/navigation";

import { SessionLifecycle } from "@/components/auth/session-lifecycle";

import { DashboardShell } from "@/components/common/dashboard/dashboard-shell";

import { getAuthAccessError } from "@/lib/auth/access";

import { AUTH_ROUTES } from "@/lib/auth/constants";

import { getServerSession } from "@/lib/auth/session";

import { getServerAdminAccess } from "@/lib/permissions/server";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  /*
   * =========================================================
   * SESSION
   * =========================================================
   */

  const session = await getServerSession();

  if (!session) {
    redirect(AUTH_ROUTES.unauthorized);
  }

  /*
   * =========================================================
   * ACCOUNT STATE
   * =========================================================
   */

  const accessError = getAuthAccessError(session);

  if (accessError) {
    redirect(`${AUTH_ROUTES.login}?error=${encodeURIComponent(accessError)}`);
  }

  /*
   * =========================================================
   * ADMIN ACCESS
   * =========================================================
   */

  const adminAccess = await getServerAdminAccess();

  if (!adminAccess) {
    redirect(AUTH_ROUTES.unauthorized);
  }

  /*
   * =========================================================
   * DASHBOARD
   * =========================================================
   */

  return (
    <DashboardShell access={adminAccess}>
      <SessionLifecycle expiresAt={session.session.expiresAt} />

      {children}
    </DashboardShell>
  );
}
