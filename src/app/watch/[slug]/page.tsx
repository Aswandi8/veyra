import type { Metadata } from "next";

import { headers } from "next/headers";

import { notFound } from "next/navigation";

import { SocialShareRedirect } from "@/components/social-shares/social-share-redirect";

import {
  getPublicSocialShare,
  normalizePublicDomain,
} from "@/lib/social-shares/public";

// ============================================================
// PROPS
// ============================================================

interface WatchPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// ============================================================
// DOMAIN
// ============================================================

async function getRequestDomain(): Promise<string> {
  const requestHeaders = await headers();

  /*
   * Production behind reverse proxy / Vercel / Cloudflare.
   */
  const forwardedHost = requestHeaders.get("x-forwarded-host");

  const host = forwardedHost ?? requestHeaders.get("host") ?? "";

  return normalizePublicDomain(host);
}

// ============================================================
// DATA
// ============================================================

async function loadSocialShare(slug: string) {
  const domain = await getRequestDomain();

  if (!domain) {
    return null;
  }

  return getPublicSocialShare(slug, domain);
}

// ============================================================
// METADATA
// ============================================================

export async function generateMetadata({
  params,
}: WatchPageProps): Promise<Metadata> {
  const { slug } = await params;

  const socialShare = await loadSocialShare(slug);

  if (!socialShare) {
    return {
      title: "Video not found",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description = socialShare.description ?? socialShare.title;

  const image = socialShare.socialThumbnail;

  const shareUrl = socialShare.shareUrl ?? undefined;

  return {
    title: socialShare.title,

    description,

    alternates: shareUrl
      ? {
          canonical: shareUrl,
        }
      : undefined,

    openGraph: {
      type: "video.other",

      title: socialShare.title,

      description,

      url: shareUrl,

      siteName: socialShare.website.name,

      images: [
        {
          url: image,

          alt: socialShare.title,
        },
      ],

      videos: [
        {
          url: socialShare.videoUrl,

          /*
           * Kalau CDN kamu memang MP4,
           * ini membantu crawler.
           */
          type: "video/mp4",
        },
      ],
    },

    twitter: {
      card: "player",

      title: socialShare.title,

      description,

      images: [image],
    },

    robots: {
      index: false,
      follow: false,
    },
  };
}

// ============================================================
// PAGE
// ============================================================

export default async function WatchPage({ params }: WatchPageProps) {
  const { slug } = await params;

  const socialShare = await loadSocialShare(slug);

  if (!socialShare) {
    notFound();
  }

  return (
    <>
      <SocialShareRedirect targetUrl={socialShare.targetUrl} />

      {/*
       * Fallback minimal.
       *
       * Biasanya user tidak sempat melihat ini karena
       * location.replace() langsung berjalan.
       *
       * Tetapi halaman tetap valid kalau JavaScript
       * terlambat atau dinonaktifkan.
       */}
      <main className="flex min-h-screen items-center justify-center p-6">
        <a
          href={socialShare.targetUrl}
          className="text-sm text-muted-foreground underline underline-offset-4"
        >
          Continue
        </a>
      </main>
    </>
  );
}
