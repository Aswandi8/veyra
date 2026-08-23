import { NextResponse } from "next/server";

import {
  createProxyHeaders,
  forwardSetCookies,
  getCentralApiUrl,
} from "@/lib/auth/proxy";

function createProxyResponse(response: Response) {
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
}

export async function POST(request: Request) {
  try {
    const body = await request.text();

    const headers = createProxyHeaders(request, {
      includeCookie: true,
    });

    headers.set("Content-Type", "application/json");

    const response = await fetch(
      `${getCentralApiUrl()}/api/v1/admin/websites`,
      {
        method: "POST",
        headers,
        body,
        cache: "no-store",
      },
    );

    return createProxyResponse(response);
  } catch (error) {
    console.error("[WEBSITE POST PROXY]", error);

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
