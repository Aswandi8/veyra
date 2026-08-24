import { proxyAdminRequest } from "@/lib/api/admin-proxy";

export async function GET(request: Request) {
  return proxyAdminRequest(request, {
    path: "/api/v1/admin/shortlinks",
    method: "GET",
    label: "SHORTLINK GET PROXY",
  });
}

export async function POST(request: Request) {
  return proxyAdminRequest(request, {
    path: "/api/v1/admin/shortlinks",
    method: "POST",
    forwardSearch: false,
    label: "SHORTLINK POST PROXY",
  });
}
