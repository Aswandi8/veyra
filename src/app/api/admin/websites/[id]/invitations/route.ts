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

async function proxyResponse(response: Response) {
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
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const sourceUrl = new URL(request.url);

    const response = await fetch(
      `${getCentralApiUrl()}/api/v1/admin/websites/${encodeURIComponent(
        id,
      )}/invitations${sourceUrl.search}`,
      {
        method: "GET",

        headers: createProxyHeaders(request, {
          includeCookie: true,
        }),

        cache: "no-store",
      },
    );

    return proxyResponse(response);
  } catch (error) {
    console.error("[INVITATIONS GET PROXY]", error);

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

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const body = await request.text();

    const response = await fetch(
      `${getCentralApiUrl()}/api/v1/admin/websites/${encodeURIComponent(
        id,
      )}/invitations`,
      {
        method: "POST",

        headers: createProxyHeaders(request, {
          includeCookie: true,
        }),

        body,

        cache: "no-store",
      },
    );

    return proxyResponse(response);
  } catch (error) {
    console.error("[INVITATIONS POST PROXY]", error);

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
