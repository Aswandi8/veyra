import { NextResponse } from "next/server";

import {
  createProxyHeaders,
  forwardSetCookies,
  getCentralApiUrl,
  readProxyResponse,
} from "@/lib/auth/proxy";

export async function POST(request: Request) {
  try {
    const body = await request.text();

    if (!body) {
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_REQUEST",
          error: "Request body is required",
        },
        {
          status: 400,
        },
      );
    }

    /**
     * Veyra
     *   ↓
     * Central API /api/auth/login
     *
     * Jangan langsung memanggil:
     * /api/auth/sign-in/email
     *
     * karena endpoint /login Central API bertugas
     * melakukan validasi:
     *
     * USER_NOT_FOUND
     * ACCOUNT_INACTIVE
     * ACCOUNT_SUSPENDED
     * ACCOUNT_BANNED
     * EMAIL_NOT_VERIFIED
     * INVALID_PASSWORD
     */
    const response = await fetch(`${getCentralApiUrl()}/api/auth/login`, {
      method: "POST",

      headers: createProxyHeaders(request, {
        includeCookie: false,
      }),

      body,

      cache: "no-store",
    });

    /**
     * Baca response Central API tanpa mengubah
     * status / body JSON yang diberikan.
     */
    const responseData = await readProxyResponse(response);

    const result = new NextResponse(responseData.body, {
      status: response.status,
    });

    /**
     * Forward Content-Type.
     */
    if (responseData.contentType) {
      result.headers.set("Content-Type", responseData.contentType);
    }

    /**
     * Sangat penting:
     *
     * Central API → Better Auth
     * Better Auth → Set-Cookie
     * Central API → Veyra
     * Veyra → Browser
     *
     * Tanpa ini login berhasil tetapi session
     * tidak tersimpan di browser.
     */
    forwardSetCookies(response, result.headers);

    return result;
  } catch (error) {
    console.error("[AUTH LOGIN PROXY]", error);

    return NextResponse.json(
      {
        success: false,
        code: "AUTH_SERVER_UNAVAILABLE",
        error: "Unable to connect to authentication server",
      },
      {
        status: 503,
      },
    );
  }
}
