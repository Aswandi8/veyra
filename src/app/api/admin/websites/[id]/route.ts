import { proxyAdminRequest } from "@/lib/api/admin-proxy";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;

  return proxyAdminRequest(request, {
    path: `/api/v1/admin/websites/${encodeURIComponent(id)}`,
    method: "PUT",
    forwardSearch: false,
    label: "WEBSITE PUT PROXY",
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;

  return proxyAdminRequest(request, {
    path: `/api/v1/admin/websites/${encodeURIComponent(id)}`,
    method: "DELETE",
    forwardSearch: false,
    label: "WEBSITE DELETE PROXY",
  });
}
