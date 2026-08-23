import { NextResponse } from "next/server";

import {
  createProxyHeaders,
  forwardSetCookies,
  getCentralApiUrl,
} from "@/lib/auth/proxy";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const response = await fetch(
      `${getCentralApiUrl()}/api/v1/admin/websites/${encodeURIComponent(
        id,
      )}/roles`,
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

    if (contentType) {
      result.headers.set("Content-Type", contentType);
    }

    result.headers.set("Cache-Control", "private, no-store, max-age=0");

    forwardSetCookies(response, result.headers);

    return result;
  } catch (error) {
    console.error("[WEBSITE ROLES PROXY]", error);

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
