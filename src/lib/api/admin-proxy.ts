import { NextResponse } from "next/server";

import {
  createProxyHeaders,
  forwardSetCookies,
  getCentralApiUrl,
} from "@/lib/auth/proxy";

interface AdminProxyOptions {
  path: string;
  method?: string;
  forwardSearch?: boolean;
  label?: string;
}

function createAdminProxyResponse(response: Response): NextResponse {
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

export async function proxyAdminRequest(
  request: Request,
  options: AdminProxyOptions,
): Promise<NextResponse> {
  const {
    path,
    method = request.method,
    forwardSearch = true,
    label = "ADMIN PROXY",
  } = options;

  try {
    const sourceUrl = new URL(request.url);
    const search = forwardSearch ? sourceUrl.search : "";
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    const headers = createProxyHeaders(request, {
      includeCookie: true,
    });

    const upperMethod = method.toUpperCase();

    let body: string | undefined;

    if (upperMethod !== "GET" && upperMethod !== "HEAD") {
      const requestBody = await request.text();

      if (requestBody) {
        body = requestBody;
      }
    }

    const response = await fetch(
      `${getCentralApiUrl()}${normalizedPath}${search}`,
      {
        method: upperMethod,
        headers,
        body,
        cache: "no-store",
      },
    );

    return createAdminProxyResponse(response);
  } catch (error) {
    console.error(`[${label}]`, error);

    return NextResponse.json(
      {
        success: false,
        error: "Central API unavailable",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
        },
      },
    );
  }
}
