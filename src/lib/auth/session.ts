import { cache } from "react";

import { cookies } from "next/headers";

import { getCentralApiUrl } from "@/lib/auth/proxy";

import type { AuthSessionData } from "@/lib/auth/types";

export const getServerSession = cache(
  async (): Promise<AuthSessionData | null> => {
    const cookieStore = await cookies();

    const cookieHeader = cookieStore
      .getAll()
      .map(({ name, value }) => `${name}=${value}`)
      .join("; ");

    /*
     * Tidak ada cookie:
     * memang belum login.
     */
    if (!cookieHeader) {
      return null;
    }

    let response: Response;

    try {
      response = await fetch(`${getCentralApiUrl()}/api/auth/get-session`, {
        method: "GET",

        headers: {
          Cookie: cookieHeader,

          Accept: "application/json",
        },

        cache: "no-store",
      });
    } catch (error) {
      console.error("[GET SERVER SESSION] Connection error:", error);

      /*
       * Jangan return null.
       *
       * null = unauthenticated.
       * Network failure = server error.
       */
      throw new Error("Authentication service unavailable");
    }

    /*
     * Session memang invalid / expired.
     */
    if (response.status === 401) {
      return null;
    }

    /*
     * Semua kegagalan server lain
     * jangan dianggap logout.
     */
    if (!response.ok) {
      console.error(
        "[GET SERVER SESSION] Central API returned:",
        response.status,
      );

      throw new Error(`Authentication service error (${response.status})`);
    }

    let data: AuthSessionData | null;

    try {
      data = (await response.json()) as AuthSessionData | null;
    } catch (error) {
      console.error("[GET SERVER SESSION] Invalid JSON:", error);

      throw new Error("Invalid authentication response");
    }

    if (!data?.user || !data?.session) {
      return null;
    }

    return data;
  },
);
