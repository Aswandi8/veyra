import { NextResponse } from "next/server";

import {
  createProxyHeaders,
  forwardSetCookies,
  getCentralApiUrl,
  readProxyResponse,
} from "@/lib/auth/proxy";

export async function POST(request: Request) {
  try {
    const response = await fetch(`${getCentralApiUrl()}/api/auth/sign-out`, {
      method: "POST",
      headers: createProxyHeaders(request, {
        includeCookie: true,
      }),
      body: JSON.stringify({}),
      cache: "no-store",
    });

    const responseData = await readProxyResponse(response);

    const result = new NextResponse(responseData.body, {
      status: response.status,
    });

    if (responseData.contentType) {
      result.headers.set("Content-Type", responseData.contentType);
    }

    /*
     * Penting:
     *
     * Better Auth mengirim Set-Cookie untuk menghapus session.
     * Cookie tersebut harus diteruskan kembali ke browser.
     */
    forwardSetCookies(response, result.headers);

    return result;
  } catch (error) {
    console.error("[AUTH LOGOUT PROXY]", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to connect to authentication server",
      },
      {
        status: 503,
      },
    );
  }
}
