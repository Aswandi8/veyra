import { NextResponse } from "next/server";

import {
  createProxyHeaders,
  forwardSetCookies,
  getCentralApiUrl,
} from "@/lib/auth/proxy";

export async function POST(request: Request) {
  try {
    const body = await request.text();

    const headers = createProxyHeaders(request, {
      includeCookie: false,
    });

    headers.set("Content-Type", "application/json");

    const response = await fetch(
      `${getCentralApiUrl()}/api/auth/invitations/verify`,
      {
        method: "POST",
        headers,
        body,
        cache: "no-store",
      },
    );

    const result = new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
    });

    const contentType = response.headers.get("content-type");

    if (contentType) {
      result.headers.set("Content-Type", contentType);
    }

    result.headers.set("Cache-Control", "private, no-store, max-age=0");

    forwardSetCookies(response, result.headers);

    return result;
  } catch (error) {
    console.error("[INVITATION VERIFY PROXY]", error);

    return NextResponse.json(
      {
        success: false,
        error: "Invitation service is unavailable",
      },
      {
        status: 503,
      },
    );
  }
}
