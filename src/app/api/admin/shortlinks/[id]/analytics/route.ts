import { proxyAdminRequest } from "@/lib/api/admin-proxy";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;

  return proxyAdminRequest(request, {
    path: `/api/v1/admin/shortlinks/${encodeURIComponent(id)}/analytics`,
    method: "GET",
    label: "SHORTLINK DETAIL ANALYTICS PROXY",
  });
}
