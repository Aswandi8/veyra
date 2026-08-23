import { NextRequest, NextResponse } from "next/server";

import { fetchCentralApiServer } from "@/lib/api/server";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// ============================================================
// WEBSITE
// ============================================================

function getWebsiteId(request: NextRequest): string {
  return request.nextUrl.searchParams.get("website")?.trim() ?? "";
}

// ============================================================
// PROXY RESPONSE
// ============================================================

async function proxyJsonResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    return NextResponse.json(
      {
        success: false,

        error: `Central API returned an empty response (${response.status})`,
      },
      {
        status: response.status >= 400 ? response.status : 502,
      },
    );
  }

  let result: unknown;

  try {
    result = JSON.parse(text);
  } catch {
    console.error("[SOCIAL SHARE PROXY INVALID RESPONSE]", {
      status: response.status,

      contentType: response.headers.get("content-type"),

      body: text.slice(0, 500),
    });

    return NextResponse.json(
      {
        success: false,

        error: `Central API returned an invalid response (${response.status})`,
      },
      {
        status: 502,
      },
    );
  }

  return NextResponse.json(result, {
    status: response.status,
  });
}

// ============================================================
// PUT
// ============================================================

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const websiteId = getWebsiteId(request);

  if (!websiteId) {
    return NextResponse.json(
      {
        success: false,
        error: "website is required",
      },
      {
        status: 400,
      },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid JSON body",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const params = new URLSearchParams({
      websiteId,
    });

    const response = await fetchCentralApiServer(
      `/api/v1/admin/social-shares/${encodeURIComponent(
        id,
      )}?${params.toString()}`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(body),
      },
    );

    return proxyJsonResponse(response);
  } catch (error) {
    console.error("[SOCIAL SHARE PUT PROXY]", error);

    return NextResponse.json(
      {
        success: false,

        error: "Unable to connect to Central API.",
      },
      {
        status: 502,
      },
    );
  }
}

// ============================================================
// DELETE
// ============================================================

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const websiteId = getWebsiteId(request);

  if (!websiteId) {
    return NextResponse.json(
      {
        success: false,

        error: "website is required",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const params = new URLSearchParams({
      websiteId,
    });

    const response = await fetchCentralApiServer(
      `/api/v1/admin/social-shares/${encodeURIComponent(
        id,
      )}?${params.toString()}`,
      {
        method: "DELETE",
      },
    );

    return proxyJsonResponse(response);
  } catch (error) {
    console.error("[SOCIAL SHARE DELETE PROXY]", error);

    return NextResponse.json(
      {
        success: false,

        error: "Unable to connect to Central API.",
      },
      {
        status: 502,
      },
    );
  }
}
