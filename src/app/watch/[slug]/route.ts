import {
  PublicShortLinkError,
  trackPublicShortLinkRequest,
} from "@/lib/shortlinks/public-server";
import { getPublicShortLinkUrl } from "@/lib/shortlinks/public-url";
import { createShortLinkSocialHtml } from "@/lib/shortlinks/social-html";

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

function socialHtmlResponse(html: string, status = 200): Response {
  return new Response(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",

      /*
       * Jangan public-cache response ini di edge.
       *
       * URL yang sama:
       * social crawler → HTML
       * human          → redirect
       *
       * Preview image sendiri menggunakan cache kuat.
       */
      "Cache-Control": "no-store, no-cache, must-revalidate",

      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  });
}

function unavailableHtmlResponse(html: string, status: number): Response {
  return new Response(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",

      "Cache-Control": "no-store, no-cache, must-revalidate",

      "X-Robots-Tag": "noindex, nofollow, noarchive",

      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  });
}

function simpleHtml(title: string, message: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow,noarchive">
<title>${title}</title>
</head>
<body>
<h1>${title}</h1>
<p>${message}</p>
</body>
</html>`;
}

function redirectResponse(destinationUrl: string): Response {
  return new Response(null, {
    status: 302,
    headers: {
      Location: destinationUrl,

      "Cache-Control": "no-store, no-cache, must-revalidate",

      "X-Robots-Tag": "noindex, nofollow, noarchive",

      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  });
}

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;

  const normalizedSlug = slug.trim().toLowerCase();

  if (!normalizedSlug) {
    return unavailableHtmlResponse(
      simpleHtml("Not Found", "ShortLink not found."),
      404,
    );
  }

  try {
    /*
     * Hanya SATU Central API request.
     *
     * Central API:
     * - resolve ShortLink
     * - classify visitor
     * - track event
     * - return ShortLink data untuk social crawler
     */
    const tracking = await trackPublicShortLinkRequest(normalizedSlug, request);

    if (tracking.socialCrawler) {
      const shortLink = tracking.shortLink;

      /*
       * Ini seharusnya selalu tersedia untuk
       * socialCrawler=true. Guard tetap ada
       * agar response tidak rusak jika contract
       * Central API berubah.
       */
      if (!shortLink) {
        console.error("[WATCH SHORTLINK] Missing social ShortLink payload");

        return unavailableHtmlResponse(
          simpleHtml(
            "Link Unavailable",
            "This ShortLink is temporarily unavailable.",
          ),
          503,
        );
      }

      const configuredUrl = getPublicShortLinkUrl(shortLink.slug);

      const canonicalUrl = new URL(configuredUrl, request.url).toString();

      return socialHtmlResponse(
        createShortLinkSocialHtml({
          shortLink,
          canonicalUrl,
        }),
      );
    }

    return redirectResponse(tracking.destinationUrl);
  } catch (error) {
    if (error instanceof PublicShortLinkError) {
      if (error.status === 404) {
        return unavailableHtmlResponse(
          simpleHtml("Not Found", "This ShortLink does not exist."),
          404,
        );
      }

      if (error.status === 410) {
        return unavailableHtmlResponse(
          simpleHtml(
            "Link Unavailable",
            "This ShortLink is currently inactive.",
          ),
          410,
        );
      }

      console.error("[WATCH SHORTLINK]", error.code, error.message);
    } else {
      console.error("[WATCH SHORTLINK]", error);
    }

    return unavailableHtmlResponse(
      simpleHtml(
        "Link Unavailable",
        "This ShortLink is temporarily unavailable.",
      ),
      503,
    );
  }
}
