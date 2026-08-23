import { NextRequest, NextResponse } from "next/server";

import { fetchCentralApiServer } from "@/lib/api/server";

// ============================================================
// POST
// ============================================================

export async function POST(request: NextRequest) {
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
    const response = await fetchCentralApiServer(
      "/api/v1/admin/social-shares",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(body),
      },
    );

    let result: unknown;

    try {
      result = await response.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Central API returned an invalid response.",
        },
        {
          status: 502,
        },
      );
    }

    return NextResponse.json(result, {
      status: response.status,
    });
  } catch (error) {
    console.error("[SOCIAL SHARE CREATE]", error);

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
