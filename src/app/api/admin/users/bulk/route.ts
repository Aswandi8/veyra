import { NextResponse } from "next/server";

import {
  createProxyHeaders,
  forwardSetCookies,
  getCentralApiUrl,
  readProxyResponse,
} from "@/lib/auth/proxy";
import { bulkUserDeleteSchema, bulkUserStatusSchema } from "@/lib/users/schema";

async function proxyRequest(request: Request, method: "PATCH" | "DELETE") {
  try {
    const body = await request.json();
    const parsed =
      method === "PATCH"
        ? bulkUserStatusSchema.safeParse(body)
        : bulkUserDeleteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid bulk user request" },
        { status: 400 },
      );
    }

    const response = await fetch(
      `${getCentralApiUrl()}/api/v1/admin/users/bulk`,
      {
        method,
        headers: createProxyHeaders(request, { includeCookie: true }),
        body: JSON.stringify(parsed.data),
        cache: "no-store",
      },
    );

    const responseData = await readProxyResponse(response);
    const result = new NextResponse(responseData.body, {
      status: response.status,
    });

    if (responseData.contentType)
      result.headers.set("Content-Type", responseData.contentType);

    forwardSetCookies(response, result.headers);

    return result;
  } catch (error) {
    console.error("[USERS BULK PROXY]", error);

    return NextResponse.json(
      { success: false, error: "Central API unavailable" },
      { status: 503 },
    );
  }
}

export async function PATCH(request: Request) {
  return proxyRequest(request, "PATCH");
}

export async function DELETE(request: Request) {
  return proxyRequest(request, "DELETE");
}
