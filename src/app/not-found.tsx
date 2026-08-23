import { SessionLifecycle } from "@/components/auth/session-lifecycle";

import { DashboardShell } from "@/components/common/dashboard/dashboard-shell";

import { HttpStatusState } from "@/components/common/state/http-status-state";

import { getServerSession } from "@/lib/auth/session";

import { getServerAdminAccess } from "@/lib/permissions/server";

export default async function NotFound() {
  const session = await getServerSession();

  /*
   * Guest.
   */
  if (!session) {
    return (
      <HttpStatusState
        status={404}
        title="Page not found"
        description="The page you're looking for doesn't exist, has been moved, or is no longer available."
        fullScreen
        showDashboardButton={false}
      />
    );
  }

  const access = await getServerAdminAccess();

  /*
   * Session ada tapi dashboard access
   * tidak tersedia.
   */
  if (!access) {
    return (
      <HttpStatusState
        status={404}
        title="Page not found"
        description="The page you're looking for doesn't exist, has been moved, or is no longer available."
        fullScreen
        showDashboardButton={false}
      />
    );
  }

  /*
   * Logged-in dashboard user.
   */
  return (
    <DashboardShell access={access}>
      <SessionLifecycle expiresAt={session.session.expiresAt} />

      <HttpStatusState
        status={404}
        title="Page not found"
        description="The page you're looking for doesn't exist, has been moved, or is no longer available."
      />
    </DashboardShell>
  );
}
