import { proxyAdminRequest } from "@/lib/api/admin-proxy";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;

  return proxyAdminRequest(request, {
    path: `/api/v1/admin/websites/${encodeURIComponent(id)}/invitations`,
    method: "GET",
    label: "INVITATIONS GET PROXY",
  });
}

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;

  return proxyAdminRequest(request, {
    path: `/api/v1/admin/websites/${encodeURIComponent(id)}/invitations`,
    method: "POST",
    forwardSearch: false,
    label: "INVITATIONS POST PROXY",
  });
}
