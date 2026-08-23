import { ROLE_NAMES } from "@/lib/permissions/constants";

import type { AdminAccess, AdminWebsiteAccess } from "@/lib/permissions/types";

/* ============================================================
   INTERNAL NORMALIZERS
   ============================================================ */

function getGlobalRoles(access: AdminAccess) {
  return Array.isArray(access.globalRoles) ? access.globalRoles : [];
}

function getGlobalPermissions(access: AdminAccess): string[] {
  return Array.isArray(access.globalPermissions)
    ? access.globalPermissions
    : [];
}

function getWebsites(access: AdminAccess): AdminWebsiteAccess[] {
  return Array.isArray(access.websites) ? access.websites : [];
}

function getWebsiteAccess(
  access: AdminAccess,
  websiteId: string,
): AdminWebsiteAccess | null {
  return (
    getWebsites(access).find((website) => website.id === websiteId) ?? null
  );
}

/* ============================================================
   SUPER ADMIN
   ============================================================ */

export function isSuperAdmin(access: AdminAccess): boolean {
  /*
   * Primary source of truth.
   */

  if (access.superAdmin === true) {
    return true;
  }

  /*
   * Defensive fallback.
   */

  return getGlobalRoles(access).some(
    (role) => role.name === ROLE_NAMES.superAdmin,
  );
}

/* ============================================================
   GLOBAL PERMISSION
   ============================================================ */

export function hasGlobalPermission(
  access: AdminAccess,
  permission: string,
): boolean {
  if (isSuperAdmin(access)) {
    return true;
  }

  return getGlobalPermissions(access).includes(permission);
}

/* ============================================================
   WEBSITE PERMISSION
   ============================================================ */

export function hasWebsitePermission(
  access: AdminAccess,
  websiteId: string,
  permission: string,
): boolean {
  if (isSuperAdmin(access)) {
    return true;
  }

  const website = getWebsiteAccess(access, websiteId);

  if (!website) {
    return false;
  }

  const permissions = Array.isArray(website.permissions)
    ? website.permissions
    : [];

  return permissions.includes(permission);
}

/* ============================================================
   ANY WEBSITE PERMISSION
   ============================================================ */

export function hasAnyWebsitePermission(
  access: AdminAccess,
  permission: string,
): boolean {
  if (isSuperAdmin(access)) {
    return true;
  }

  return getWebsites(access).some((website) => {
    const permissions = Array.isArray(website.permissions)
      ? website.permissions
      : [];

    return permissions.includes(permission);
  });
}
