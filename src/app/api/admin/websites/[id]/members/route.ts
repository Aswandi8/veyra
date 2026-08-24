import { proxyAdminRequest } from "@/lib/api/admin-proxy";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;

  return proxyAdminRequest(request, {
    path: `/api/v1/admin/websites/${encodeURIComponent(id)}/users`,
    method: "GET",
    label: "WEBSITE MEMBERS GET PROXY",
  });
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;

  return proxyAdminRequest(request, {
    path: `/api/v1/admin/websites/${encodeURIComponent(id)}/users`,
    method: "PUT",
    forwardSearch: false,
    label: "WEBSITE MEMBER PUT PROXY",
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;

  return proxyAdminRequest(request, {
    path: `/api/v1/admin/websites/${encodeURIComponent(id)}/users`,
    method: "DELETE",
    forwardSearch: false,
    label: "WEBSITE MEMBER DELETE PROXY",
  });
}
