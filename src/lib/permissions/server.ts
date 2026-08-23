import { cache } from "react";

import { redirect } from "next/navigation";

import { fetchCentralApiServer, getServerCookieHeader } from "@/lib/api/server";

import { AUTH_ROUTES } from "@/lib/auth/constants";

import type { AdminAccess, AdminAccessResponse } from "@/lib/permissions/types";

/* ============================================================
   ADMIN ACCESS
   ============================================================ */

export const getServerAdminAccess = cache(
  async (): Promise<AdminAccess | null> => {
    /*
     * Tidak ada cookie sama sekali:
     *
     * user belum authenticated.
     *
     * Kita return null tanpa melakukan
     * request Central API.
     */

    const cookieHeader = await getServerCookieHeader();

    if (!cookieHeader) {
      return null;
    }

    /* ======================================================
         REQUEST
         ====================================================== */

    const response = await fetchCentralApiServer("/api/v1/admin/me", {
      method: "GET",
    });

    /* ======================================================
         401
         ====================================================== */

    if (response.status === 401) {
      return null;
    }

    /* ======================================================
         403
         ====================================================== */

    if (response.status === 403) {
      redirect(AUTH_ROUTES.forbidden);
    }

    /* ======================================================
         SERVER ERROR
         ====================================================== */

    if (!response.ok) {
      console.error(
        "[GET SERVER ADMIN ACCESS] Central API returned:",
        response.status,
      );

      throw new Error(`Unable to load admin access (${response.status})`);
    }

    /* ======================================================
         JSON
         ====================================================== */

    let data: AdminAccessResponse;

    try {
      data = (await response.json()) as AdminAccessResponse;
    } catch (error) {
      console.error("[GET SERVER ADMIN ACCESS] Invalid JSON:", error);

      throw new Error("Invalid admin access response");
    }

    /* ======================================================
         VALIDATION
         ====================================================== */

    if (!data.success || !data.user) {
      throw new Error("Invalid admin access response");
    }

    /* ======================================================
         NORMALIZE
         ====================================================== */

    const globalRoles = Array.isArray(data.globalRoles) ? data.globalRoles : [];

    const globalPermissions = Array.isArray(data.globalPermissions)
      ? data.globalPermissions
      : [];

    const websites = Array.isArray(data.websites)
      ? data.websites.map((website) => ({
          ...website,

          permissions: Array.isArray(website.permissions)
            ? website.permissions
            : [],
        }))
      : [];

    /* ======================================================
         RESULT
         ====================================================== */

    return {
      user: {
        ...data.user,

        banned: data.user.banned ?? false,
      },

      superAdmin: data.superAdmin === true,

      globalRoles,

      globalPermissions,

      websites,
    };
  },
);
