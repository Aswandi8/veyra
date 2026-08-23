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

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const response = await fetch(
      `${getCentralApiUrl()}/api/v1/admin/websites/${encodeURIComponent(
        id,
      )}/users`,
      {
        method: "GET",

        headers: createProxyHeaders(request, {
          includeCookie: true,
        }),

        cache: "no-store",
      },
    );

    return createProxyResponse(response);
  } catch (error) {
    console.error("[WEBSITE MEMBERS GET PROXY]", error);

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

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const body = await request.text();

    const headers = createProxyHeaders(request, {
      includeCookie: true,
    });

    headers.set("Content-Type", "application/json");

    const response = await fetch(
      `${getCentralApiUrl()}/api/v1/admin/websites/${encodeURIComponent(
        id,
      )}/users`,
      {
        method: "PUT",
        headers,
        body,
        cache: "no-store",
      },
    );

    return createProxyResponse(response);
  } catch (error) {
    console.error("[WEBSITE MEMBER PUT PROXY]", error);

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

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const body = await request.text();

    const headers = createProxyHeaders(request, {
      includeCookie: true,
    });

    headers.set("Content-Type", "application/json");

    const response = await fetch(
      `${getCentralApiUrl()}/api/v1/admin/websites/${encodeURIComponent(
        id,
      )}/users`,
      {
        method: "DELETE",
        headers,
        body,
        cache: "no-store",
      },
    );

    return createProxyResponse(response);
  } catch (error) {
    console.error("[WEBSITE MEMBER DELETE PROXY]", error);

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
