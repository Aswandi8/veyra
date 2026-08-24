import { proxyAdminRequest } from "@/lib/api/admin-proxy";

export async function POST(request: Request) {
  return proxyAdminRequest(request, {
    path: "/api/v1/admin/roles",
    method: "POST",
    forwardSearch: false,
    label: "ROLE POST PROXY",
  });
}
