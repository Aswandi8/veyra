"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";

import { StatusBadge } from "@/components/common/status/status-badge";
import { ShortLinkPreviewCard } from "@/components/shortlinks/shortlink-preview-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TypographyMuted } from "@/components/ui/typography";

import { parseApiResponse } from "@/lib/api/response";
import { getPublicShortLinkUrl } from "@/lib/shortlinks/public-url";
import {
  shortLinkFormSchema,
  type ShortLinkFormValues,
} from "@/lib/shortlinks/schema";
import type {
  ShortLinkDetail,
  ShortLinkMutationResponse,
  ShortLinkPreviewType,
  ShortLinkStatus,
} from "@/lib/shortlinks/types";

type ShortLinkFormMode = "create" | "edit";

interface ShortLinkFormProps {
  mode: ShortLinkFormMode;
  shortLink?: ShortLinkDetail;
}

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

export function ShortLinkForm({ mode, shortLink }: ShortLinkFormProps) {
  const router = useRouter();

  const [isNavigating, startNavigation] = useTransition();

  const [imageMetadata, setImageMetadata] = useState<ImageMetadata | null>(
    shortLink?.thumbnailUrl &&
      shortLink.thumbnailWidth &&
      shortLink.thumbnailHeight
      ? {
          url: shortLink.thumbnailUrl,
          width: shortLink.thumbnailWidth,
          height: shortLink.thumbnailHeight,
        }
      : null,
  );

  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(
    shortLink?.previewVideoUrl &&
      shortLink.previewVideoWidth &&
      shortLink.previewVideoHeight
      ? {
          url: shortLink.previewVideoUrl,
          width: shortLink.previewVideoWidth,
          height: shortLink.previewVideoHeight,
          durationMs: shortLink.previewVideoDurationMs,
        }
      : null,
  );

  const isEdit = mode === "edit";

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ShortLinkFormValues>({
    resolver: zodResolver(shortLinkFormSchema),

    defaultValues: {
      slug: shortLink?.slug ?? "",
      destinationUrl: shortLink?.destinationUrl ?? "",
      status: shortLink?.status ?? "ACTIVE",

      /*
       * Tidak ada lagi NONE.
       * New ShortLink mulai dari IMAGE.
       */
      previewType: shortLink?.previewType ?? "IMAGE",

      title: shortLink?.title ?? "",
      description: shortLink?.description ?? "",

      thumbnailUrl: shortLink?.thumbnailUrl ?? "",
      previewVideoUrl: shortLink?.previewVideoUrl ?? "",

      showPlayButton: shortLink?.showPlayButton ?? false,

      displayDuration: shortLink?.displayDuration ?? "",
    },
  });

  const slug =
    useWatch({
      control,
      name: "slug",
    }) ?? "";

  const status = useWatch({
    control,
    name: "status",
  });

  const previewType = useWatch({
    control,
    name: "previewType",
  });

  const title =
    useWatch({
      control,
      name: "title",
    }) ?? "";

  const description =
    useWatch({
      control,
      name: "description",
    }) ?? "";

  const destinationUrl =
    useWatch({
      control,
      name: "destinationUrl",
    }) ?? "";

  const thumbnailUrl =
    useWatch({
      control,
      name: "thumbnailUrl",
    }) ?? "";

  const previewVideoUrl =
    useWatch({
      control,
      name: "previewVideoUrl",
    }) ?? "";

  const showPlayButton = useWatch({
    control,
    name: "showPlayButton",
  });

  const displayDuration =
    useWatch({
      control,
      name: "displayDuration",
    }) ?? "";

  const pending = isSubmitting || isNavigating;

  const normalizedSlug = slug.trim();

  const previewSlug = normalizedSlug || shortLink?.slug || "auto-generated";

  const publicUrl = getPublicShortLinkUrl(previewSlug);

  const savedSlugMatches =
    isEdit &&
    Boolean(shortLink) &&
    normalizedSlug.length > 0 &&
    normalizedSlug === shortLink?.slug;

  const shareUrl =
    savedSlugMatches && shortLink ? getPublicShortLinkUrl(shortLink.slug) : "";

  const currentThumbnailUrl = thumbnailUrl.trim();

  const currentVideoUrl = previewVideoUrl.trim();

  const activeImageMetadata =
    imageMetadata?.url === currentThumbnailUrl ? imageMetadata : null;

  const activeVideoMetadata =
    videoMetadata?.url === currentVideoUrl ? videoMetadata : null;

  async function onSubmit(values: ShortLinkFormValues) {
    const payload = {
      slug: values.slug.trim(),

      destinationUrl: values.destinationUrl.trim(),

      status: values.status,

      previewType: values.previewType,

      title: values.title?.trim() || null,

      description: values.description?.trim() || null,

      /*
       * IMAGE dan VIDEO sama-sama wajib
       * mempunyai image/poster.
       */
      thumbnailUrl: values.thumbnailUrl?.trim() || null,

      thumbnailWidth: activeImageMetadata?.width ?? null,

      thumbnailHeight: activeImageMetadata?.height ?? null,

      /*
       * Hanya VIDEO yang mengirim video fields.
       * IMAGE selalu membersihkannya.
       */
      previewVideoUrl:
        values.previewType === "VIDEO"
          ? values.previewVideoUrl?.trim() || null
          : null,

      previewVideoWidth:
        values.previewType === "VIDEO"
          ? (activeVideoMetadata?.width ?? null)
          : null,

      previewVideoHeight:
        values.previewType === "VIDEO"
          ? (activeVideoMetadata?.height ?? null)
          : null,

      previewVideoDurationMs:
        values.previewType === "VIDEO"
          ? (activeVideoMetadata?.durationMs ?? null)
          : null,

      showPlayButton: values.showPlayButton,

      displayDuration: values.displayDuration?.trim() || null,
    };

    const endpoint =
      isEdit && shortLink
        ? `/api/admin/shortlinks/${shortLink.id}`
        : "/api/admin/shortlinks";

    try {
      const response = await fetch(endpoint, {
        method: isEdit ? "PUT" : "POST",

        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",

        cache: "no-store",

        body: JSON.stringify(payload),
      });

      const result = await parseApiResponse<ShortLinkMutationResponse>(
        response,
        "SHORTLINK MUTATION",
      );

      if (!response.ok || !result.success) {
        toast.error(
          result.error ??
            (isEdit
              ? `Unable to update shortlink (${response.status}).`
              : `Unable to create shortlink (${response.status}).`),
        );

        return;
      }

      toast.success(
        result.message ??
          (isEdit
            ? "Shortlink updated successfully."
            : "Shortlink created successfully."),
      );

      const id = result.data?.id ?? shortLink?.id;

      startNavigation(() => {
        router.replace(id ? `/shortlinks/${id}` : "/shortlinks");
      });
    } catch (error) {
      console.error("[SHORTLINK FORM]", error);

      toast.error("Central API is unavailable.");
    }
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>
            {isEdit ? "Edit ShortLink" : "ShortLink information"}
          </CardTitle>

          <CardDescription>
            Configure the destination and social preview. Original media
            dimensions, aspect ratio, and video duration are preserved.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            id="shortlink-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-8"
          >
            <section className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold">Basic information</h3>

                <TypographyMuted className="mt-1">
                  Configure the ShortLink destination, slug, and status.
                </TypographyMuted>
              </div>

              <div className="space-y-2">
                <Label htmlFor="destinationUrl">Destination URL</Label>

                <Input
                  id="destinationUrl"
                  type="url"
                  placeholder="https://vidviral.site/article"
                  disabled={pending}
                  aria-invalid={Boolean(errors.destinationUrl)}
                  {...register("destinationUrl")}
                />

                {errors.destinationUrl?.message ? (
                  <TypographyMuted className="text-destructive">
                    {errors.destinationUrl.message}
                  </TypographyMuted>
                ) : null}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>

                  <Input
                    id="slug"
                    placeholder="viral-video"
                    disabled={pending}
                    aria-invalid={Boolean(errors.slug)}
                    {...register("slug")}
                  />

                  {errors.slug?.message ? (
                    <TypographyMuted className="text-destructive">
                      {errors.slug.message}
                    </TypographyMuted>
                  ) : (
                    <TypographyMuted>
                      Leave empty when creating to generate automatically.
                    </TypographyMuted>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>

                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(value) =>
                          field.onChange(value as ShortLinkStatus)
                        }
                        disabled={pending}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="ACTIVE">
                            <StatusBadge status="ACTIVE" />
                          </SelectItem>

                          <SelectItem value="INACTIVE">
                            <StatusBadge status="INACTIVE" />
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-5 border-t pt-8">
              <div>
                <h3 className="text-sm font-semibold">Social preview</h3>

                <TypographyMuted className="mt-1">
                  Choose how the ShortLink should appear when shared.
                </TypographyMuted>
              </div>

              <div className="space-y-2">
                <Label>Preview type</Label>

                <Controller
                  control={control}
                  name="previewType"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) =>
                        field.onChange(value as ShortLinkPreviewType)
                      }
                      disabled={pending}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="IMAGE">
                          <StatusBadge status="IMAGE" />
                        </SelectItem>

                        <SelectItem value="VIDEO">
                          <StatusBadge status="VIDEO" />
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>

                <Input
                  id="title"
                  placeholder="Video Viral Hari Ini"
                  disabled={pending}
                  {...register("title")}
                />

                {errors.title?.message ? (
                  <TypographyMuted className="text-destructive">
                    {errors.title.message}
                  </TypographyMuted>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>

                <Textarea
                  id="description"
                  rows={4}
                  placeholder="Description shown in social metadata..."
                  disabled={pending}
                  {...register("description")}
                />

                {errors.description?.message ? (
                  <TypographyMuted className="text-destructive">
                    {errors.description.message}
                  </TypographyMuted>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnailUrl">
                  {previewType === "VIDEO"
                    ? "Thumbnail / poster URL"
                    : "Image URL"}
                </Label>

                <Input
                  id="thumbnailUrl"
                  type="url"
                  placeholder="https://res.cloudinary.com/.../image.jpg"
                  disabled={pending}
                  {...register("thumbnailUrl")}
                />

                {errors.thumbnailUrl?.message ? (
                  <TypographyMuted className="text-destructive">
                    {errors.thumbnailUrl.message}
                  </TypographyMuted>
                ) : activeImageMetadata ? (
                  <TypographyMuted>
                    Original image: {activeImageMetadata.width} ×{" "}
                    {activeImageMetadata.height}px
                  </TypographyMuted>
                ) : (
                  <TypographyMuted>
                    Use a public direct image URL.
                  </TypographyMuted>
                )}
              </div>

              {previewType === "VIDEO" ? (
                <div className="space-y-2">
                  <Label htmlFor="previewVideoUrl">Video URL</Label>

                  <Input
                    id="previewVideoUrl"
                    type="url"
                    placeholder="https://res.cloudinary.com/.../video.mp4"
                    disabled={pending}
                    {...register("previewVideoUrl")}
                  />

                  {errors.previewVideoUrl?.message ? (
                    <TypographyMuted className="text-destructive">
                      {errors.previewVideoUrl.message}
                    </TypographyMuted>
                  ) : activeVideoMetadata ? (
                    <TypographyMuted>
                      Original video: {activeVideoMetadata.width} ×{" "}
                      {activeVideoMetadata.height}px
                      {activeVideoMetadata.durationMs !== null
                        ? ` • ${(activeVideoMetadata.durationMs / 1000).toFixed(
                            2,
                          )}s`
                        : ""}
                    </TypographyMuted>
                  ) : (
                    <TypographyMuted>
                      Use a public direct video URL.
                    </TypographyMuted>
                  )}
                </div>
              ) : null}

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="displayDuration">Displayed duration</Label>

                  <Input
                    id="displayDuration"
                    placeholder="12:46"
                    disabled={pending}
                    {...register("displayDuration")}
                  />

                  {errors.displayDuration?.message ? (
                    <TypographyMuted className="text-destructive">
                      {errors.displayDuration.message}
                    </TypographyMuted>
                  ) : (
                    <TypographyMuted>
                      Visual/fake duration only. Original video is unchanged.
                    </TypographyMuted>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Play button</Label>

                  <Controller
                    control={control}
                    name="showPlayButton"
                    render={({ field }) => (
                      <label className="flex min-h-8 cursor-pointer items-center gap-3 rounded-lg border px-3">
                        <Checkbox
                          checked={field.value}
                          disabled={pending}
                          onCheckedChange={(value) =>
                            field.onChange(value === true)
                          }
                        />

                        <span className="text-sm font-medium">
                          Show play button overlay
                        </span>
                      </label>
                    )}
                  />
                </div>
              </div>
            </section>
          </form>
        </CardContent>

        <CardFooter className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() =>
              router.push(
                isEdit && shortLink
                  ? `/shortlinks/${shortLink.id}`
                  : "/shortlinks",
              )
            }
          >
            Cancel
          </Button>

          <Button type="submit" form="shortlink-form" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {isEdit ? "Saving..." : "Creating..."}
              </>
            ) : (
              <>
                <Save className="size-4" />
                {isEdit ? "Save changes" : "Create ShortLink"}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <ShortLinkPreviewCard
        previewType={previewType}
        status={status}
        slug={previewSlug}
        title={title}
        description={description}
        destinationUrl={destinationUrl}
        thumbnailUrl={thumbnailUrl}
        previewVideoUrl={previewVideoUrl}
        showPlayButton={showPlayButton}
        displayDuration={displayDuration}
        publicUrl={publicUrl}
        shareUrl={shareUrl}
        shareDisabled={!savedSlugMatches}
        onImageMetadata={setImageMetadata}
        onVideoMetadata={setVideoMetadata}
      />
    </div>
  );
}
