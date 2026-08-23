import { NextResponse } from "next/server";

import {
  createProxyHeaders,
  forwardSetCookies,
  getCentralApiUrl,
} from "@/lib/auth/proxy";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    const response = await fetch(
      `${getCentralApiUrl()}/api/v1/admin/users/export${url.search}`,
      {
        method: "GET",
        headers: createProxyHeaders(request, {
          includeCookie: true,
        }),
        cache: "no-store",
      },
    );

    const result = new NextResponse(response.body, {
      status: response.status,
    });

    const contentType = response.headers.get("content-type");
    const contentDisposition = response.headers.get("content-disposition");
    const cacheControl = response.headers.get("cache-control");

    if (contentType) result.headers.set("Content-Type", contentType);
    if (contentDisposition)
      result.headers.set("Content-Disposition", contentDisposition);
    if (cacheControl) result.headers.set("Cache-Control", cacheControl);

    forwardSetCookies(response, result.headers);

    return result;
  } catch (error) {
    console.error("[USERS EXPORT PROXY]", error);

    return NextResponse.json(
      {
        success: false,
        error: "Central API unavailable",
      },
      {
        status: 503,
      },
    );
  }
}
