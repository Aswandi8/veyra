const CENTRAL_API_URL = process.env.CENTRAL_API_URL;

export function getCentralApiUrl(): string {
  if (!CENTRAL_API_URL) {
    throw new Error("CENTRAL_API_URL is not defined");
  }

  return CENTRAL_API_URL.replace(/\/+$/, "");
}

interface CreateProxyHeadersOptions {
  includeCookie?: boolean;
}

export function createProxyHeaders(
  request: Request,
  options: CreateProxyHeadersOptions = {},
): Headers {
  const headers = new Headers();

  const contentType = request.headers.get("content-type");

  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  /*
   * Untuk POST login/logout biasanya kita memang menggunakan JSON.
   */
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  /*
   * Cookie browser diteruskan ke Central API.
   *
   * Ini sangat penting untuk:
   * - session
   * - logout
   * - authenticated request
   */
  if (options.includeCookie) {
    const cookie = request.headers.get("cookie");

    if (cookie) {
      headers.set("Cookie", cookie);
    }
  }

  /*
   * Forward beberapa header yang relevan dengan Better Auth.
   */
  const userAgent = request.headers.get("user-agent");

  if (userAgent) {
    headers.set("User-Agent", userAgent);
  }

  const origin = request.headers.get("origin");

  if (origin) {
    headers.set("Origin", origin);
  }

  const referer = request.headers.get("referer");

  if (referer) {
    headers.set("Referer", referer);
  }

  return headers;
}

export interface ProxyResponse {
  body: string;
  contentType: string | null;
}

export async function readProxyResponse(
  response: Response,
): Promise<ProxyResponse> {
  const contentType = response.headers.get("content-type");

  const body = await response.text();

  return {
    body,
    contentType,
  };
}

/**
 * Forward seluruh Set-Cookie dari Central API ke browser.
 *
 * Jangan menggunakan:
 *
 * response.headers.get("set-cookie")
 *
 * saja karena response bisa memiliki lebih dari satu Set-Cookie.
 */
export function forwardSetCookies(
  response: Response,
  targetHeaders: Headers,
): void {
  /*
   * Modern Fetch API / Next.js mendukung getSetCookie().
   */
  const responseHeaders = response.headers as Headers & {
    getSetCookie?: () => string[];
  };

  const cookies = responseHeaders.getSetCookie?.() ?? [];

  if (cookies.length > 0) {
    for (const cookie of cookies) {
      targetHeaders.append("Set-Cookie", cookie);
    }

    return;
  }

  /*
   * Fallback apabila getSetCookie() tidak tersedia.
   */
  const setCookie = response.headers.get("set-cookie");

  if (setCookie) {
    targetHeaders.set("Set-Cookie", setCookie);
  }
}
