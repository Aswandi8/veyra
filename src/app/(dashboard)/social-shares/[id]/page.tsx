import { ExternalLink, Pencil, Play } from "lucide-react";

import { notFound } from "next/navigation";

import { AppImage } from "@/components/common/app-image";

import { PageBreadcrumb } from "@/components/common/dashboard/page-breadcrumb";

import { StatusBadge } from "@/components/common/status/status-badge";

import { SocialShareDeleteButton } from "@/components/social-shares/social-share-actions";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";

import {
  TypographyMuted,
  TypographyP,
  TypographySmall,
} from "@/components/ui/typography";

import { hasWebsitePermission } from "@/lib/permissions/access";

import { PERMISSIONS } from "@/lib/permissions/constants";

import {
  requireAdminAccess,
  requireWebsitePermission,
} from "@/lib/permissions/guards";

import { getServerSocialShare } from "@/lib/social-shares/server";

// ============================================================
// PROPS
// ============================================================

interface SocialShareDetailPageProps {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    website?: string | string[];
  }>;
}

// ============================================================
// HELPERS
// ============================================================

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

function formatActualDuration(duration: number | null): string {
  if (duration === null) {
    return "Not specified";
  }

  const hours = Math.floor(duration / 3600);

  const minutes = Math.floor((duration % 3600) / 60);

  const seconds = duration % 60;

  if (hours > 0) {
    return [
      String(hours).padStart(2, "0"),

      String(minutes).padStart(2, "0"),

      String(seconds).padStart(2, "0"),
    ].join(":");
  }

  return [
    String(minutes).padStart(2, "0"),

    String(seconds).padStart(2, "0"),
  ].join(":");
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",

    timeStyle: "short",
  }).format(new Date(value));
}

// ============================================================
// PAGE
// ============================================================

export default async function SocialShareDetailPage({
  params,
  searchParams,
}: SocialShareDetailPageProps) {
  // ==========================================================
  // ACCESS
  // ==========================================================

  const access = await requireAdminAccess();

  const { id } = await params;

  const query = await searchParams;

  const websiteId = first(query.website);

  if (!websiteId) {
    notFound();
  }

  requireWebsitePermission(access, websiteId, PERMISSIONS.socialShare.read);

  const canUpdate = hasWebsitePermission(
    access,
    websiteId,
    PERMISSIONS.socialShare.update,
  );

  const canDelete = hasWebsitePermission(
    access,
    websiteId,
    PERMISSIONS.socialShare.delete,
  );

  // ==========================================================
  // DATA
  // ==========================================================

  const response = await getServerSocialShare(id, websiteId);

  if (!response.success || !response.data) {
    notFound();
  }

  const socialShare = response.data;

  /*
   * Defense in depth:
   * response must belong to requested website.
   */
  if (socialShare.websiteId !== websiteId) {
    notFound();
  }

  const previewThumbnail = socialShare.shareThumbnail ?? socialShare.thumbnail;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        title={socialShare.title}
        subtitle="View Social Share information, media, duration, and destination."
        items={[
          {
            label: "Dashboard",

            href: "/dashboard",
          },

          {
            label: "Social Shares",

            href: `/social-shares?website=${encodeURIComponent(websiteId)}`,
          },

          {
            label: socialShare.title,
          },
        ]}
        action={
          canUpdate
            ? {
                label: "Edit",

                href: `/social-shares/${socialShare.id}/edit?website=${encodeURIComponent(
                  websiteId,
                )}`,

                icon: Pencil,
              }
            : undefined
        }
      />

      {/* =====================================================
          INFORMATION + PREVIEW
      ===================================================== */}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle>Social share information</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div>
              <TypographyMuted>Title</TypographyMuted>

              <TypographyP className="mt-1 font-medium">
                {socialShare.title}
              </TypographyP>
            </div>

            <Separator />

            <div>
              <TypographyMuted>Website</TypographyMuted>

              <TypographyP className="mt-1 font-medium">
                {socialShare.website.name}
              </TypographyP>

              <TypographyMuted className="mt-1">
                {socialShare.website.domain ?? "No domain configured"}
              </TypographyMuted>
            </div>

            <Separator />

            <div>
              <TypographyMuted>Status</TypographyMuted>

              <div className="mt-2">
                <StatusBadge status={socialShare.status} />
              </div>
            </div>

            <Separator />

            <div>
              <TypographyMuted>Slug</TypographyMuted>

              <TypographyP className="mt-1">
                /watch/
                {socialShare.slug}
              </TypographyP>
            </div>

            <Separator />

            <div>
              <TypographyMuted>Share URL</TypographyMuted>

              {socialShare.shareUrl ? (
                <a
                  href={socialShare.shareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex max-w-full items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
                >
                  <span className="break-all">{socialShare.shareUrl}</span>

                  <ExternalLink className="size-4 shrink-0" />
                </a>
              ) : (
                <TypographyMuted className="mt-1">
                  Public share URL is unavailable because this website has no
                  domain.
                </TypographyMuted>
              )}
            </div>

            <Separator />

            <div>
              <TypographyMuted>Description</TypographyMuted>

              <TypographyP className="mt-1 whitespace-pre-wrap">
                {socialShare.description || "No description"}
              </TypographyP>
            </div>
          </CardContent>
        </Card>

        {/* ===================================================
            PREVIEW
        =================================================== */}

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Social preview</CardTitle>

            <CardDescription>
              Thumbnail and visual display duration.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
              <AppImage
                src={previewThumbnail}
                alt={socialShare.title}
                width={640}
                height={360}
                unoptimized
                className="size-full object-cover"
              />

              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-black/70 text-white shadow-sm">
                  <Play className="ml-0.5 size-5 fill-current" />
                </div>
              </div>

              {socialShare.displayDuration ? (
                <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-1 text-xs font-medium leading-none text-white">
                  {socialShare.displayDuration}
                </span>
              ) : null}
            </div>

            <div>
              <TypographySmall className="block">
                {socialShare.title}
              </TypographySmall>

              <TypographyMuted className="mt-1 break-all">
                {socialShare.shareUrl ?? `/watch/${socialShare.slug}`}
              </TypographyMuted>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* =====================================================
          MEDIA
      ===================================================== */}

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Media</CardTitle>

          <CardDescription>
            External CDN assets referenced by this Social Share.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div>
            <TypographyMuted>Video URL</TypographyMuted>

            <a
              href={socialShare.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex max-w-full items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
            >
              <span className="break-all">{socialShare.videoUrl}</span>

              <ExternalLink className="size-4 shrink-0" />
            </a>
          </div>

          <Separator />

          <div>
            <TypographyMuted>Thumbnail URL</TypographyMuted>

            <a
              href={socialShare.thumbnail}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex max-w-full items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
            >
              <span className="break-all">{socialShare.thumbnail}</span>

              <ExternalLink className="size-4 shrink-0" />
            </a>
          </div>

          <Separator />

          <div>
            <TypographyMuted>Share thumbnail URL</TypographyMuted>

            {socialShare.shareThumbnail ? (
              <a
                href={socialShare.shareThumbnail}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex max-w-full items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
              >
                <span className="break-all">{socialShare.shareThumbnail}</span>

                <ExternalLink className="size-4 shrink-0" />
              </a>
            ) : (
              <TypographyMuted className="mt-1">
                Regular thumbnail is used.
              </TypographyMuted>
            )}
          </div>
        </CardContent>
      </Card>

      {/* =====================================================
          DURATION + DESTINATION
      ===================================================== */}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Duration</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div>
              <TypographyMuted>Actual duration</TypographyMuted>

              <TypographyP className="mt-1 font-medium tabular-nums">
                {formatActualDuration(socialShare.duration)}
              </TypographyP>

              {socialShare.duration !== null ? (
                <TypographyMuted className="mt-1">
                  {socialShare.duration} seconds
                </TypographyMuted>
              ) : null}
            </div>

            <Separator />

            <div>
              <TypographyMuted>Display duration</TypographyMuted>

              <TypographyP className="mt-1 font-medium tabular-nums">
                {socialShare.displayDuration ?? "Not specified"}
              </TypographyP>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Destination</CardTitle>

            <CardDescription>
              Final destination configured for this share.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <TypographyMuted>Target URL</TypographyMuted>

            <a
              href={socialShare.targetUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex max-w-full items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
            >
              <span className="break-all">{socialShare.targetUrl}</span>

              <ExternalLink className="size-4 shrink-0" />
            </a>
          </CardContent>
        </Card>
      </div>

      {/* =====================================================
          METADATA
      ===================================================== */}

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div>
            <TypographyMuted>Created</TypographyMuted>

            <TypographyP className="mt-1">
              {formatDateTime(socialShare.createdAt)}
            </TypographyP>
          </div>

          <div>
            <TypographyMuted>Updated</TypographyMuted>

            <TypographyP className="mt-1">
              {formatDateTime(socialShare.updatedAt)}
            </TypographyP>
          </div>
        </CardContent>
      </Card>

      {/* =====================================================
          DANGER ZONE
      ===================================================== */}

      {canDelete ? (
        <Card className="border-destructive/30 shadow-none">
          <CardHeader>
            <CardTitle className="text-destructive">Danger zone</CardTitle>

            <CardDescription>
              Permanently delete this Social Share from Veyra.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <TypographyP className="font-medium">
                Delete this Social Share
              </TypographyP>

              <TypographyMuted className="mt-1">
                CDN video and thumbnail assets are external and will not be
                deleted.
              </TypographyMuted>
            </div>

            <SocialShareDeleteButton
              socialShare={socialShare}
              redirectAfterDelete
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
