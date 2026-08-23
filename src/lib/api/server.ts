import { cookies } from "next/headers";

import { getCentralApiUrl } from "@/lib/auth/proxy";

interface CentralApiServerFetchOptions extends Omit<RequestInit, "headers"> {
  headers?: HeadersInit;

  requireAuth?: boolean;
}

/* ============================================================
   COOKIE
   ============================================================ */

export async function getServerCookieHeader(): Promise<string> {
  const cookieStore = await cookies();

  return cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");
}

/* ============================================================
   CENTRAL API FETCH
   ============================================================ */

export async function fetchCentralApiServer(
  path: string,
  options: CentralApiServerFetchOptions = {},
): Promise<Response> {
  const {
    headers: customHeaders,
    requireAuth = true,
    ...requestInit
  } = options;

  const cookieHeader = await getServerCookieHeader();

  if (requireAuth && !cookieHeader) {
    throw new Error("Authentication required");
  }

  const headers = new Headers(customHeaders);

  /*
   * Default response format.
   */
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  /*
   * Forward session cookie.
   */
  if (cookieHeader) {
    headers.set("Cookie", cookieHeader);
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  try {
    return await fetch(`${getCentralApiUrl()}${normalizedPath}`, {
      ...requestInit,

      headers,

      cache: requestInit.cache ?? "no-store",
    });
  } catch (error) {
    console.error("[CENTRAL API SERVER FETCH]", error);

    throw new Error("Central API unavailable");
  }
}
