/* eslint-disable @next/next/no-img-element */

"use client";

import {
  useDeferredValue,
  useState,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import { AlertTriangle, ImageIcon, Play, Video } from "lucide-react";

import { StatusBadge } from "@/components/common/status/status-badge";
import { ShortLinkShareButton } from "@/components/shortlinks/shortlink-share-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TypographyMuted, TypographyP } from "@/components/ui/typography";

import type {
  ShortLinkPreviewType,
  ShortLinkStatus,
} from "@/lib/shortlinks/types";

interface ImageMetadata {
  url: string;
  width: number;
  height: number;
}

interface VideoMetadata {
  url: string;
  width: number;
  height: number;
  durationMs: number | null;
}

interface ShortLinkPreviewCardProps {
  previewType: ShortLinkPreviewType;
  status: ShortLinkStatus;

  slug: string;

  title?: string | null;
  description?: string | null;

  destinationUrl?: string | null;

  thumbnailUrl?: string | null;
  previewVideoUrl?: string | null;

  showPlayButton: boolean;
  displayDuration?: string | null;

  publicUrl?: string | null;

  shareUrl?: string | null;
  shareDisabled?: boolean;

  onImageMetadata?: (metadata: ImageMetadata) => void;
  onVideoMetadata?: (metadata: VideoMetadata) => void;
}

interface MediaPlaceholderProps {
  icon: ReactNode;
  title: string;
  description: string;
}

type MediaState = {
  url: string;
  status: "loaded" | "error";
};

function MediaPlaceholder({ icon, title, description }: MediaPlaceholderProps) {
  return (
    <div className="flex min-h-64 w-full flex-col items-center justify-center gap-2 p-6 text-center">
      <div className="flex size-11 items-center justify-center rounded-full border bg-background">
        {icon}
      </div>

      <TypographyP className="font-medium">{title}</TypographyP>

      <TypographyMuted>{description}</TypographyMuted>
    </div>
  );
}

function isPublicHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function ShortLinkPreviewCard({
  previewType,
  status,

  slug,

  title,
  description,

  destinationUrl,

  thumbnailUrl,
  previewVideoUrl,

  showPlayButton,
  displayDuration,

  publicUrl,

  shareUrl,
  shareDisabled = false,

  onImageMetadata,
  onVideoMetadata,
}: ShortLinkPreviewCardProps) {
  /*
   * Field API tertentu boleh null.
   * Normalisasi sebelum .trim().
   */
  const rawImageUrl = thumbnailUrl?.trim() ?? "";

  const rawVideoUrl = previewVideoUrl?.trim() ?? "";

  const normalizedDisplayDuration = displayDuration?.trim() ?? "";

  const normalizedDestinationUrl = destinationUrl?.trim() ?? "";

  const normalizedPublicUrl = publicUrl?.trim() ?? "";

  const normalizedShareUrl = shareUrl?.trim() ?? "";

  /*
   * URL dari form dapat berubah beberapa kali ketika user
   * mengetik / paste.
   *
   * Deferred value mencegah media mencoba URL intermediate
   * terlalu agresif.
   */
  const deferredImageUrl = useDeferredValue(rawImageUrl);

  const deferredVideoUrl = useDeferredValue(rawVideoUrl);

  const imageUrl = isPublicHttpUrl(deferredImageUrl) ? deferredImageUrl : "";

  const videoUrl = isPublicHttpUrl(deferredVideoUrl) ? deferredVideoUrl : "";

  const imageChanging = rawImageUrl !== deferredImageUrl;

  const videoChanging = rawVideoUrl !== deferredVideoUrl;

  const [imageState, setImageState] = useState<MediaState>({
    url: "",
    status: "error",
  });

  const [videoState, setVideoState] = useState<MediaState>({
    url: "",
    status: "error",
  });

  const imageStatus = !rawImageUrl
    ? "empty"
    : imageChanging || !imageUrl || imageState.url !== imageUrl
      ? "loading"
      : imageState.status;

  const videoStatus = !rawVideoUrl
    ? "empty"
    : videoChanging || !videoUrl || videoState.url !== videoUrl
      ? "loading"
      : videoState.status;

  const previewSlug = slug.trim() || "auto-generated";

  const previewTitle = title?.trim() || "ShortLink preview";

  const previewDescription =
    description?.trim() || "Your social preview description will appear here.";

  function handleImageLoad(event: SyntheticEvent<HTMLImageElement>) {
    const image = event.currentTarget;

    /*
     * Abaikan event URL lama apabila user
     * sudah mengganti input.
     */
    if (imageUrl !== rawImageUrl) {
      return;
    }

    const width = image.naturalWidth;

    const height = image.naturalHeight;

    if (width <= 0 || height <= 0) {
      setImageState({
        url: imageUrl,
        status: "error",
      });

      return;
    }

    setImageState({
      url: imageUrl,
      status: "loaded",
    });

    onImageMetadata?.({
      url: imageUrl,
      width,
      height,
    });
  }

  function handleImageError() {
    if (imageUrl !== rawImageUrl) {
      return;
    }

    setImageState({
      url: imageUrl,
      status: "error",
    });
  }

  function handleVideoMetadata(event: SyntheticEvent<HTMLVideoElement>) {
    const video = event.currentTarget;

    if (videoUrl !== rawVideoUrl) {
      return;
    }

    const width = video.videoWidth;

    const height = video.videoHeight;

    if (width <= 0 || height <= 0) {
      setVideoState({
        url: videoUrl,
        status: "error",
      });

      return;
    }

    setVideoState({
      url: videoUrl,
      status: "loaded",
    });

    onVideoMetadata?.({
      url: videoUrl,

      width,

      height,

      durationMs:
        Number.isFinite(video.duration) && video.duration > 0
          ? Math.round(video.duration * 1000)
          : null,
    });
  }

  function handleVideoCanPlay(event: SyntheticEvent<HTMLVideoElement>) {
    if (videoUrl !== rawVideoUrl) {
      return;
    }

    setVideoState({
      url: videoUrl,
      status: "loaded",
    });

    void event.currentTarget.play().catch(() => {
      /*
       * Autoplay dapat diblokir browser.
       * Itu bukan berarti URL video invalid.
       */
    });
  }

  function handleVideoError() {
    if (videoUrl !== rawVideoUrl) {
      return;
    }

    setVideoState({
      url: videoUrl,
      status: "error",
    });
  }

  const posterAvailable = imageStatus === "loaded";

  return (
    <Card className="shadow-none xl:sticky xl:top-6">
      <CardHeader>
        <CardTitle>Live preview</CardTitle>

        <CardDescription>
          Preview updates automatically while you edit the ShortLink.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/*
         * =====================================================
         * MEDIA PREVIEW
         *
         * Ini CARD milik dashboard Veyra.
         *
         * Media di dalamnya tetap mempertahankan rasio asli:
         *
         * - tidak ada aspect-video
         * - tidak ada aspect-square
         * - tidak ada object-cover
         * - tidak ada rasio 1200/630
         *
         * max-width / max-height hanya membatasi ukuran visual
         * di dashboard, tidak mengubah aspect ratio media.
         * =====================================================
         */}
        <div className="relative flex min-h-64 items-center justify-center overflow-hidden rounded-lg border bg-muted/30">
          {previewType === "IMAGE" ? (
            <>
              {!rawImageUrl ? (
                <MediaPlaceholder
                  icon={<ImageIcon className="size-5 text-muted-foreground" />}
                  title="No image"
                  description="Enter a public image URL to preview it here."
                />
              ) : null}

              {imageStatus === "loading" ? (
                <MediaPlaceholder
                  icon={
                    <ImageIcon className="size-5 animate-pulse text-muted-foreground" />
                  }
                  title="Loading image..."
                  description="Checking the image URL."
                />
              ) : null}

              {imageStatus === "error" ? (
                <MediaPlaceholder
                  icon={<ImageIcon className="size-5 text-destructive" />}
                  title="Unable to load image"
                  description="Make sure this is a public direct image URL."
                />
              ) : null}

              {imageUrl ? (
                <div
                  className={
                    imageStatus === "loaded"
                      ? "relative inline-block max-w-full"
                      : "pointer-events-none absolute size-px opacity-0"
                  }
                >
                  <img
                    key={imageUrl}
                    src={imageUrl}
                    alt={previewTitle}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    className="block h-auto max-h-[32rem] w-auto max-w-full"
                  />

                  {imageStatus === "loaded" && showPlayButton ? (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="flex size-12 items-center justify-center rounded-full bg-black/70 text-white shadow-sm">
                        <Play className="ml-0.5 size-5 fill-current" />
                      </div>
                    </div>
                  ) : null}

                  {imageStatus === "loaded" && normalizedDisplayDuration ? (
                    <span className="pointer-events-none absolute right-2 bottom-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
                      {normalizedDisplayDuration}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </>
          ) : null}

          {previewType === "VIDEO" ? (
            <>
              {/*
               * Poster hidden hanya untuk membaca
               * naturalWidth/naturalHeight.
               */}
              {imageUrl ? (
                <img
                  key={`poster-metadata-${imageUrl}`}
                  src={imageUrl}
                  alt=""
                  aria-hidden="true"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  className="pointer-events-none absolute size-px opacity-0"
                />
              ) : null}

              {!rawVideoUrl && !rawImageUrl ? (
                <MediaPlaceholder
                  icon={<Video className="size-5 text-muted-foreground" />}
                  title="No video"
                  description="Enter a poster and video URL to preview it here."
                />
              ) : null}

              {rawVideoUrl && videoStatus === "loading" ? (
                <>
                  {posterAvailable ? (
                    <img
                      src={imageUrl}
                      alt={previewTitle}
                      className="mx-auto h-auto max-h-[32rem] w-auto max-w-full"
                    />
                  ) : (
                    <MediaPlaceholder
                      icon={
                        <Video className="size-5 animate-pulse text-muted-foreground" />
                      }
                      title="Loading video..."
                      description="Reading the original video metadata."
                    />
                  )}
                </>
              ) : null}

              {rawVideoUrl && videoStatus === "error" ? (
                <>
                  {posterAvailable ? (
                    <>
                      <img
                        src={imageUrl}
                        alt={previewTitle}
                        className="mx-auto h-auto max-h-[32rem] w-auto max-w-full"
                      />

                      <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded bg-black/75 px-2 py-1 text-xs text-white">
                        <AlertTriangle className="size-3.5" />
                        Video preview unavailable
                      </div>
                    </>
                  ) : (
                    <MediaPlaceholder
                      icon={<Video className="size-5 text-destructive" />}
                      title="Unable to load video"
                      description="Make sure this is a public direct video URL."
                    />
                  )}
                </>
              ) : null}

              {videoUrl ? (
                <video
                  key={videoUrl}
                  src={videoUrl}
                  poster={imageUrl || undefined}
                  muted
                  autoPlay
                  loop
                  playsInline
                  preload="metadata"
                  onLoadedMetadata={handleVideoMetadata}
                  onCanPlay={handleVideoCanPlay}
                  onError={handleVideoError}
                  className={
                    videoStatus === "loaded"
                      ? "mx-auto h-auto max-h-[32rem] w-auto max-w-full"
                      : "pointer-events-none absolute size-px opacity-0"
                  }
                />
              ) : null}

              {!rawVideoUrl && rawImageUrl ? (
                <>
                  {imageStatus === "loading" ? (
                    <MediaPlaceholder
                      icon={
                        <ImageIcon className="size-5 animate-pulse text-muted-foreground" />
                      }
                      title="Loading poster..."
                      description="Checking the poster URL."
                    />
                  ) : null}

                  {imageStatus === "error" ? (
                    <MediaPlaceholder
                      icon={<ImageIcon className="size-5 text-destructive" />}
                      title="Unable to load poster"
                      description="Make sure this is a public direct image URL."
                    />
                  ) : null}

                  {imageStatus === "loaded" ? (
                    <img
                      src={imageUrl}
                      alt={previewTitle}
                      className="mx-auto h-auto max-h-[32rem] w-auto max-w-full"
                    />
                  ) : null}
                </>
              ) : null}

              {showPlayButton ? (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-black/70 text-white shadow-sm">
                    <Play className="ml-0.5 size-5 fill-current" />
                  </div>
                </div>
              ) : null}

              {normalizedDisplayDuration ? (
                <span className="pointer-events-none absolute right-2 bottom-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
                  {normalizedDisplayDuration}
                </span>
              ) : null}
            </>
          ) : null}
        </div>

        <div className="space-y-2">
          <TypographyP className="font-semibold">{previewTitle}</TypographyP>

          <TypographyMuted className="line-clamp-2">
            {previewDescription}
          </TypographyMuted>

          <TypographyMuted className="break-all">
            {normalizedPublicUrl || `/watch/${previewSlug}`}
          </TypographyMuted>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusBadge status={status} />

          <StatusBadge status={previewType} />
        </div>

        {normalizedDestinationUrl ? (
          <div className="rounded-lg border bg-muted/30 p-3">
            <TypographyMuted>Destination</TypographyMuted>

            <TypographyP className="mt-1 break-all text-sm">
              {normalizedDestinationUrl}
            </TypographyP>
          </div>
        ) : null}

        <ShortLinkShareButton
          url={normalizedShareUrl}
          title={title}
          description={description}
          disabled={shareDisabled}
        />

        {shareDisabled ? (
          <TypographyMuted>
            Save this ShortLink before sharing it.
          </TypographyMuted>
        ) : null}
      </CardContent>
    </Card>
  );
}
