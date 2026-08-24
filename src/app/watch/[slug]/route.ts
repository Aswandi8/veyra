import {
  getPublicShortLink,
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
       * Social metadata dapat berubah setelah ShortLink diedit,
       * jadi jangan cache permanen.
       */
      "Cache-Control": "no-store, no-cache, must-revalidate",

      /*
       * Tidak memakai X-Robots-Tag nofollow/noarchive di sini.
       * Social crawler perlu bebas mengambil image/video metadata.
       */
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

      /*
       * Human redirect tidak perlu diindeks.
       */
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
     * Central API tetap menjadi satu-satunya
     * visitor classifier.
     */
    const tracking = await trackPublicShortLinkRequest(normalizedSlug, request);

    /*
     * Hanya known social crawler menerima
     * HTML metadata.
     */
    if (tracking.socialCrawler) {
      const shortLink = await getPublicShortLink(normalizedSlug);

      const configuredUrl = getPublicShortLinkUrl(shortLink.slug);

      const canonicalUrl = new URL(configuredUrl, request.url).toString();

      const html = createShortLinkSocialHtml({
        shortLink,
        canonicalUrl,
      });

      return socialHtmlResponse(html);
    }

    /*
     * HUMAN / BOT / UNKNOWN / regular crawler
     * tetap menuju destination.
     *
     * Hanya HUMAN yang menaikkan clickCount
     * karena keputusan itu dilakukan di Central API.
     */
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
