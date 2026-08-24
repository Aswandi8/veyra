import { proxyAdminRequest } from "@/lib/api/admin-proxy";

interface RouteContext {
  params: Promise<{
    id: string;
    invitationId: string;
  }>;
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id, invitationId } = await context.params;

  return proxyAdminRequest(request, {
    path: `/api/v1/admin/websites/${encodeURIComponent(
      id,
    )}/invitations/${encodeURIComponent(invitationId)}`,
    method: "DELETE",
    forwardSearch: false,
    label: "INVITATION REVOKE PROXY",
  });
}
