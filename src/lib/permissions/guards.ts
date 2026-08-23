import { notFound, redirect } from "next/navigation";

import { AUTH_ROUTES } from "@/lib/auth/constants";

import {
  hasGlobalPermission,
  hasWebsitePermission,
} from "@/lib/permissions/access";

import { getServerAdminAccess } from "@/lib/permissions/server";

import type { AdminAccess } from "@/lib/permissions/types";

/* ============================================================
   ADMIN ACCESS
   ============================================================ */

export async function requireAdminAccess(): Promise<AdminAccess> {
  const access = await getServerAdminAccess();

  if (!access) {
    redirect(AUTH_ROUTES.unauthorized);
  }

  return access;
}

/* ============================================================
   GLOBAL PERMISSION
   ============================================================ */

export function requireGlobalPermission(
  access: AdminAccess,
  permission: string,
): void {
  if (!hasGlobalPermission(access, permission)) {
    redirect(AUTH_ROUTES.forbidden);
  }
}

/* ============================================================
   WEBSITE PERMISSION
   ============================================================ */

export function requireWebsitePermission(
  access: AdminAccess,
  websiteId: string,
  permission: string,
): void {
  if (!hasWebsitePermission(access, websiteId, permission)) {
    redirect(AUTH_ROUTES.forbidden);
  }
}

/* ============================================================
   RESOURCE
   ============================================================ */

export function requireResource<T>(resource: T | null | undefined): T {
  if (resource === null || resource === undefined) {
    notFound();
  }

  return resource;
}
