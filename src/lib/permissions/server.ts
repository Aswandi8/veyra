import { cache } from "react";

import { redirect } from "next/navigation";

import { fetchCentralApiServer, getServerCookieHeader } from "@/lib/api/server";

import { AUTH_ROUTES } from "@/lib/auth/constants";

import type { AdminAccess, AdminAccessResponse } from "@/lib/permissions/types";

// ============================================================
// ADMIN ACCESS
// ============================================================

export const getServerAdminAccess = cache(
  async (): Promise<AdminAccess | null> => {
    const cookieHeader = await getServerCookieHeader();

    if (!cookieHeader) {
      return null;
    }

    // ========================================================
    // REQUEST
    // ========================================================

    const response = await fetchCentralApiServer("/api/v1/admin/me", {
      method: "GET",
    });

    // ========================================================
    // UNAUTHENTICATED
    // ========================================================

    if (response.status === 401) {
      return null;
    }

    // ========================================================
    // JSON
    // ========================================================

    let data: AdminAccessResponse;

    try {
      data = (await response.json()) as AdminAccessResponse;
    } catch (error) {
      console.error("[GET SERVER ADMIN ACCESS] Invalid JSON:", error);

      throw new Error("Invalid admin access response");
    }

    // ========================================================
    // ACCOUNT / ACCESS ERROR
    // ========================================================

    if (response.status === 403) {
      const accountErrors = new Set([
        "account-banned",
        "account-suspended",
        "account-inactive",
        "email-not-verified",
      ]);

      if (data.code && accountErrors.has(data.code)) {
        redirect(`${AUTH_ROUTES.login}?error=${encodeURIComponent(data.code)}`);
      }

      redirect(AUTH_ROUTES.forbidden);
    }

    // ========================================================
    // SERVER ERROR
    // ========================================================

    if (!response.ok) {
      console.error(
        "[GET SERVER ADMIN ACCESS] Central API returned:",
        response.status,
      );

      throw new Error(`Unable to load admin access (${response.status})`);
    }

    // ========================================================
    // VALIDATION
    // ========================================================

    if (!data.success || !data.session || !data.user) {
      throw new Error("Invalid admin access response");
    }

    // ========================================================
    // NORMALIZE
    // ========================================================

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

    // ========================================================
    // RESULT
    // ========================================================

    return {
      session: data.session,

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
