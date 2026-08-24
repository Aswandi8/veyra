import { proxyAdminRequest } from "@/lib/api/admin-proxy";

export async function GET(request: Request) {
  return proxyAdminRequest(request, {
    path: "/api/v1/admin/shortlinks/analytics",
    method: "GET",
    label: "SHORTLINK ANALYTICS PROXY",
  });
}
