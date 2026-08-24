import { proxyAdminRequest } from "@/lib/api/admin-proxy";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;

  return proxyAdminRequest(request, {
    path: `/api/v1/admin/shortlinks/${encodeURIComponent(id)}`,
    method: "GET",
    forwardSearch: false,
    label: "SHORTLINK DETAIL PROXY",
  });
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;

  return proxyAdminRequest(request, {
    path: `/api/v1/admin/shortlinks/${encodeURIComponent(id)}`,
    method: "PUT",
    forwardSearch: false,
    label: "SHORTLINK PUT PROXY",
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;

  return proxyAdminRequest(request, {
    path: `/api/v1/admin/shortlinks/${encodeURIComponent(id)}`,
    method: "DELETE",
    forwardSearch: false,
    label: "SHORTLINK DELETE PROXY",
  });
}
