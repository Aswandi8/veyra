import { proxyAdminRequest } from "@/lib/api/admin-proxy";

export async function POST(request: Request) {
  return proxyAdminRequest(request, {
    path: "/api/v1/admin/websites",
    method: "POST",
    forwardSearch: false,
    label: "WEBSITE POST PROXY",
  });
}
