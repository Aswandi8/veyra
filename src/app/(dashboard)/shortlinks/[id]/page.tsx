import { Pencil } from "lucide-react";
import { notFound } from "next/navigation";

import { PageBreadcrumb } from "@/components/common/dashboard/page-breadcrumb";
import { StatusBadge } from "@/components/common/status/status-badge";
import { DetailShortLinkAnalytics } from "@/components/shortlinks/shortlink-analytics";
import { ShortLinkDeleteButton } from "@/components/shortlinks/shortlink-actions";
import { ShortLinkPreviewCard } from "@/components/shortlinks/shortlink-preview-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TypographyMuted, TypographyP } from "@/components/ui/typography";

import { formatDateTime } from "@/lib/format/date";
import { hasGlobalPermission } from "@/lib/permissions/access";
import { PERMISSIONS } from "@/lib/permissions/constants";
import {
  requireAdminAccess,
  requireGlobalPermission,
} from "@/lib/permissions/guards";
import { getPublicShortLinkUrl } from "@/lib/shortlinks/public-url";
import {
  getServerShortLink,
  getServerShortLinkAnalytics,
} from "@/lib/shortlinks/server";

interface ShortLinkDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return "—";

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kb = bytes / 1024;

  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  return `${(kb / 1024).toFixed(1)} MB`;
}

function formatDuration(durationMs: number | null): string {
  if (!durationMs) return "—";

  const totalSeconds = Math.floor(durationMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0",
  )}`;
}

function Information({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <TypographyMuted>{label}</TypographyMuted>

      <TypographyP className="mt-1 break-all">{value}</TypographyP>
    </div>
  );
}

export default async function ShortLinkDetailPage({
  params,
}: ShortLinkDetailPageProps) {
  const access = await requireAdminAccess();

  requireGlobalPermission(access, PERMISSIONS.shortlink.read);

  const canUpdate = hasGlobalPermission(access, PERMISSIONS.shortlink.update);

  const canDelete = hasGlobalPermission(access, PERMISSIONS.shortlink.delete);

  const { id } = await params;

  const [response, analyticsResponse] = await Promise.all([
    getServerShortLink(id),
    getServerShortLinkAnalytics(id, 30),
  ]);

  if (!response.success || !response.data) {
    notFound();
  }

  const shortLink = response.data;
  const publicUrl = getPublicShortLinkUrl(shortLink.slug);

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        title={`/${shortLink.slug}`}
        subtitle="View ShortLink configuration, preview, media information, and analytics."
        items={[
          {
            label: "Dashboard",
            href: "/dashboard",
          },
          {
            label: "ShortLinks",
            href: "/shortlinks",
          },
          {
            label: `/${shortLink.slug}`,
          },
        ]}
        action={
          canUpdate
            ? {
                label: "Edit",
                href: `/shortlinks/${shortLink.id}/edit`,
                icon: Pencil,
              }
            : undefined
        }
      />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>ShortLink information</CardTitle>

            <CardDescription>
              Configuration and destination information for this ShortLink.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <Information label="Slug" value={`/${shortLink.slug}`} />

            <Separator />

            <Information label="Public ShortLink" value={publicUrl} />

            <Separator />

            <Information
              label="Destination URL"
              value={shortLink.destinationUrl}
            />

            <Separator />

            <Information label="Title" value={shortLink.title || "—"} />

            <Separator />

            <Information
              label="Description"
              value={shortLink.description || "—"}
            />

            <Separator />

            <div>
              <TypographyMuted>Status</TypographyMuted>

              <div className="mt-2 flex flex-wrap gap-2">
                <StatusBadge status={shortLink.status} />
                <StatusBadge status={shortLink.previewType} />
              </div>
            </div>

            <Separator />

            <Information
              label="Displayed duration"
              value={shortLink.displayDuration || "—"}
            />

            <Separator />

            <Information
              label="Play button"
              value={shortLink.showPlayButton ? "Enabled" : "Disabled"}
            />

            <Separator />

            <Information
              label="Recorded clicks"
              value={shortLink.clickCount.toLocaleString()}
            />
          </CardContent>
        </Card>

        <ShortLinkPreviewCard
          previewType={shortLink.previewType}
          status={shortLink.status}
          slug={shortLink.slug}
          title={shortLink.title}
          description={shortLink.description}
          destinationUrl={shortLink.destinationUrl}
          thumbnailUrl={shortLink.thumbnailUrl ?? ""}
          previewVideoUrl={shortLink.previewVideoUrl ?? ""}
          showPlayButton={shortLink.showPlayButton}
          displayDuration={shortLink.displayDuration}
          publicUrl={publicUrl}
          shareUrl={publicUrl}
          shareDisabled={false}
        />
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Media & ownership</CardTitle>

          <CardDescription>
            Original media metadata and ShortLink ownership information.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-5">
              <Information label="Preview type" value={shortLink.previewType} />

              <Separator />

              <Information
                label="Image / poster URL"
                value={shortLink.thumbnailUrl || "—"}
              />

              <Separator />

              <Information
                label="Image dimensions"
                value={
                  shortLink.thumbnailWidth && shortLink.thumbnailHeight
                    ? `${shortLink.thumbnailWidth} × ${shortLink.thumbnailHeight}px`
                    : "—"
                }
              />

              <Separator />

              <Information
                label="Image MIME"
                value={shortLink.thumbnailMimeType || "—"}
              />

              <Separator />

              <Information
                label="Image size"
                value={formatBytes(shortLink.thumbnailSizeBytes)}
              />

              {shortLink.previewType === "VIDEO" ? (
                <>
                  <Separator />

                  <Information
                    label="Video URL"
                    value={shortLink.previewVideoUrl || "—"}
                  />

                  <Separator />

                  <Information
                    label="Video dimensions"
                    value={
                      shortLink.previewVideoWidth &&
                      shortLink.previewVideoHeight
                        ? `${shortLink.previewVideoWidth} × ${shortLink.previewVideoHeight}px`
                        : "—"
                    }
                  />

                  <Separator />

                  <Information
                    label="Original duration"
                    value={formatDuration(shortLink.previewVideoDurationMs)}
                  />

                  <Separator />

                  <Information
                    label="Video MIME"
                    value={shortLink.previewVideoMimeType || "—"}
                  />

                  <Separator />

                  <Information
                    label="Video size"
                    value={formatBytes(shortLink.previewVideoSizeBytes)}
                  />
                </>
              ) : null}
            </div>

            <div className="space-y-5">
              <Information
                label="Created by"
                value={shortLink.createdBy?.name || "Unknown"}
              />

              <Separator />

              <Information
                label="Creator email"
                value={shortLink.createdBy?.email || "—"}
              />

              <Separator />

              <Information
                label="Created"
                value={formatDateTime(shortLink.createdAt)}
              />

              <Separator />

              <Information
                label="Updated"
                value={formatDateTime(shortLink.updatedAt)}
              />

              <Separator />

              <Information
                label="Analytics events"
                value={String(shortLink.eventCount ?? shortLink.clickCount)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {analyticsResponse.success && analyticsResponse.data ? (
        <div className="space-y-4">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Analytics</CardTitle>

              <CardDescription>
                Traffic analytics for the last 30 days.
              </CardDescription>
            </CardHeader>
          </Card>

          <DetailShortLinkAnalytics analytics={analyticsResponse.data} />
        </div>
      ) : null}

      {canDelete ? (
        <Card className="border-destructive/30 shadow-none">
          <CardHeader>
            <CardTitle className="text-destructive">Danger zone</CardTitle>

            <CardDescription>
              Deleting this ShortLink also deletes all analytics events linked
              to it.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <TypographyP className="font-medium">
                Delete this ShortLink
              </TypographyP>

              <TypographyMuted className="mt-1">
                This action cannot be undone.
              </TypographyMuted>
            </div>

            <ShortLinkDeleteButton shortLink={shortLink} redirectAfterDelete />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
