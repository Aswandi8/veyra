import { NextResponse } from "next/server";

import {
  createProxyHeaders,
  forwardSetCookies,
  getCentralApiUrl,
  readProxyResponse,
} from "@/lib/auth/proxy";

export async function GET(request: Request) {
  try {
    const cookie = request.headers.get("cookie");

    /**
     * Tidak ada cookie berarti browser belum memiliki session.
     */
    if (!cookie) {
      return NextResponse.json(
        {
          session: null,
          user: null,
        },
        {
          status: 401,
        },
      );
    }

    const response = await fetch(`${getCentralApiUrl()}/api/auth/get-session`, {
      method: "GET",
      headers: createProxyHeaders(request, {
        includeCookie: true,
      }),
      cache: "no-store",
    });

    const responseData = await readProxyResponse(response);

    const result = new NextResponse(responseData.body, {
      status: response.status,
    });

    if (responseData.contentType) {
      result.headers.set("Content-Type", responseData.contentType);
    }

    /**
     * Jika Better Auth mengirim Set-Cookie,
     * teruskan cookie tersebut ke browser.
     */
    forwardSetCookies(response, result.headers);

    return result;
  } catch (error) {
    console.error("[AUTH SESSION PROXY]", error);

    return NextResponse.json(
      {
        session: null,
        user: null,
        error: "Authentication server unavailable",
      },
      {
        status: 503,
      },
    );
  }
}
