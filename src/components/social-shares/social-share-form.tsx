"use client";

import { useMemo } from "react";

import { zodResolver } from "@hookform/resolvers/zod";

import { ExternalLink, Loader2, Play, Save } from "lucide-react";

import { useRouter } from "next/navigation";

import { Controller, useForm, useWatch } from "react-hook-form";

import toast from "react-hot-toast";

import { AppImage } from "@/components/common/app-image";

import { StatusBadge } from "@/components/common/status/status-badge";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Separator } from "@/components/ui/separator";

import { Textarea } from "@/components/ui/textarea";

import { TypographyMuted, TypographySmall } from "@/components/ui/typography";

import {
  socialShareFormSchema,
  type SocialShareFormValues,
} from "@/lib/social-shares/schema";

import type {
  SocialShareDetail,
  SocialShareMutationResponse,
} from "@/lib/social-shares/types";

// ============================================================
// TYPES
// ============================================================

type SocialShareFormMode = "create" | "edit";

interface WebsiteOption {
  id: string;
  name: string;
  domain: string | null;
}

interface SocialShareFormProps {
  mode?: SocialShareFormMode;

  socialShare?: SocialShareDetail;

  websites: WebsiteOption[];

  defaultWebsiteId: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const STATUS_ITEMS = [
  {
    value: "DRAFT",
    label: "Draft",
  },
  {
    value: "ACTIVE",
    label: "Active",
  },
  {
    value: "ARCHIVED",
    label: "Archived",
  },
] as const;

// ============================================================
// SLUG
// ============================================================

function createSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ============================================================
// DURATION PARSE
// ============================================================

function parseDurationPart(value: string | undefined): number {
  if (!value) {
    return 0;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function splitActualDuration(duration: number | null | undefined) {
  if (duration === null || duration === undefined) {
    return {
      hours: "",
      minutes: "",
      seconds: "",
    };
  }

  const hours = Math.floor(duration / 3600);

  const minutes = Math.floor((duration % 3600) / 60);

  const seconds = duration % 60;

  return {
    hours: String(hours),

    minutes: String(minutes),

    seconds: String(seconds),
  };
}

function splitDisplayDuration(duration: string | null | undefined) {
  if (!duration) {
    return {
      hours: "",
      minutes: "",
      seconds: "",
    };
  }

  const parts = duration.split(":");

  if (parts.length === 3) {
    return {
      hours: String(Number(parts[0])),

      minutes: String(Number(parts[1])),

      seconds: String(Number(parts[2])),
    };
  }

  if (parts.length === 2) {
    return {
      hours: "0",

      minutes: String(Number(parts[0])),

      seconds: String(Number(parts[1])),
    };
  }

  return {
    hours: "",
    minutes: "",
    seconds: "",
  };
}

// ============================================================
// DURATION BUILD
// ============================================================

function getActualDuration(
  hours: string,
  minutes: string,
  seconds: string,
): number | null {
  const hasValue =
    Boolean(hours.trim()) || Boolean(minutes.trim()) || Boolean(seconds.trim());

  if (!hasValue) {
    return null;
  }

  return (
    parseDurationPart(hours) * 3600 +
    parseDurationPart(minutes) * 60 +
    parseDurationPart(seconds)
  );
}

function padDuration(value: number): string {
  return String(value).padStart(2, "0");
}

function getDisplayDuration(
  hours: string,
  minutes: string,
  seconds: string,
): string | null {
  const hasValue =
    Boolean(hours.trim()) || Boolean(minutes.trim()) || Boolean(seconds.trim());

  if (!hasValue) {
    return null;
  }

  const hour = parseDurationPart(hours);

  const minute = parseDurationPart(minutes);

  const second = parseDurationPart(seconds);

  if (hour > 0) {
    return [padDuration(hour), padDuration(minute), padDuration(second)].join(
      ":",
    );
  }

  return [padDuration(minute), padDuration(second)].join(":");
}

// ============================================================
// URL
// ============================================================

function getWebsiteBaseUrl(domain: string | null): string | null {
  const value = domain?.trim();

  if (!value) {
    return null;
  }

  const baseUrl = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  return baseUrl.replace(/\/+$/, "");
}

function getShareUrl(domain: string | null, slug: string): string | null {
  const baseUrl = getWebsiteBaseUrl(domain);

  if (!baseUrl) {
    return null;
  }

  return `${baseUrl}/watch/${encodeURIComponent(slug || "video-slug")}`;
}

function getHostname(value: string): string | null {
  if (!value.trim()) {
    return null;
  }

  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
}

// ============================================================
// RESPONSE
// ============================================================

async function parseMutationResponse(
  response: Response,
): Promise<SocialShareMutationResponse> {
  const text = await response.text();

  if (!text) {
    return {
      success: false,

      error: `Server returned an empty response (${response.status})`,
    };
  }

  try {
    return JSON.parse(text) as SocialShareMutationResponse;
  } catch {
    console.error("[SOCIAL SHARE MUTATION INVALID RESPONSE]", {
      status: response.status,

      contentType: response.headers.get("content-type"),

      body: text.slice(0, 500),
    });

    return {
      success: false,

      error: `Server returned an invalid response (${response.status})`,
    };
  }
}

// ============================================================
// DURATION FIELDS
// ============================================================

interface DurationFieldsProps {
  prefix: "actual" | "display";

  register: ReturnType<typeof useForm<SocialShareFormValues>>["register"];

  errors: ReturnType<
    typeof useForm<SocialShareFormValues>
  >["formState"]["errors"];

  disabled: boolean;
}

function DurationFields({
  prefix,
  register,
  errors,
  disabled,
}: DurationFieldsProps) {
  const isActual = prefix === "actual";

  const hoursName = isActual ? "actualHours" : "displayHours";

  const minutesName = isActual ? "actualMinutes" : "displayMinutes";

  const secondsName = isActual ? "actualSeconds" : "displaySeconds";

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="space-y-2">
        <Label htmlFor={hoursName}>Hours</Label>

        <Input
          id={hoursName}
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          disabled={disabled}
          placeholder="0"
          aria-invalid={Boolean(errors[hoursName])}
          {...register(hoursName)}
        />

        {errors[hoursName]?.message ? (
          <TypographyMuted className="text-destructive">
            {errors[hoursName]?.message}
          </TypographyMuted>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor={minutesName}>Minutes</Label>

        <Input
          id={minutesName}
          type="number"
          min={0}
          max={59}
          step={1}
          inputMode="numeric"
          disabled={disabled}
          placeholder="0"
          aria-invalid={Boolean(errors[minutesName])}
          {...register(minutesName)}
        />

        {errors[minutesName]?.message ? (
          <TypographyMuted className="text-destructive">
            {errors[minutesName]?.message}
          </TypographyMuted>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor={secondsName}>Seconds</Label>

        <Input
          id={secondsName}
          type="number"
          min={0}
          max={59}
          step={1}
          inputMode="numeric"
          disabled={disabled}
          placeholder="0"
          aria-invalid={Boolean(errors[secondsName])}
          {...register(secondsName)}
        />

        {errors[secondsName]?.message ? (
          <TypographyMuted className="text-destructive">
            {errors[secondsName]?.message}
          </TypographyMuted>
        ) : null}
      </div>
    </div>
  );
}

// ============================================================
// COMPONENT
// ============================================================

export function SocialShareForm({
  mode = "create",
  socialShare,
  websites,
  defaultWebsiteId,
}: SocialShareFormProps) {
  const router = useRouter();

  const isEdit = mode === "edit" && Boolean(socialShare);

  const actual = splitActualDuration(socialShare?.duration);

  const display = splitDisplayDuration(socialShare?.displayDuration);

  const websiteItems = useMemo(
    () =>
      websites.map((website) => ({
        value: website.id,

        label: website.name,
      })),
    [websites],
  );

  const {
    control,
    register,
    handleSubmit,
    setValue,

    formState: { errors, isSubmitting },
  } = useForm<SocialShareFormValues>({
    resolver: zodResolver(socialShareFormSchema),

    defaultValues: {
      websiteId: socialShare?.websiteId ?? defaultWebsiteId,

      title: socialShare?.title ?? "",

      slug: socialShare?.slug ?? "",

      description: socialShare?.description ?? "",

      videoUrl: socialShare?.videoUrl ?? "",

      thumbnail: socialShare?.thumbnail ?? "",

      shareThumbnail: socialShare?.shareThumbnail ?? "",

      actualHours: actual.hours,

      actualMinutes: actual.minutes,

      actualSeconds: actual.seconds,

      displayHours: display.hours,

      displayMinutes: display.minutes,

      displaySeconds: display.seconds,

      targetUrl: socialShare?.targetUrl ?? "",

      status: socialShare?.status ?? "DRAFT",
    },
  });

  const websiteId =
    useWatch({
      control,
      name: "websiteId",
    }) ?? "";

  const title =
    useWatch({
      control,
      name: "title",
    }) ?? "";

  const slug =
    useWatch({
      control,
      name: "slug",
    }) ?? "";

  const thumbnail =
    useWatch({
      control,
      name: "thumbnail",
    }) ?? "";

  const shareThumbnail =
    useWatch({
      control,
      name: "shareThumbnail",
    }) ?? "";

  const displayHours =
    useWatch({
      control,
      name: "displayHours",
    }) ?? "";

  const displayMinutes =
    useWatch({
      control,
      name: "displayMinutes",
    }) ?? "";

  const displaySeconds =
    useWatch({
      control,
      name: "displaySeconds",
    }) ?? "";

  const targetUrl =
    useWatch({
      control,
      name: "targetUrl",
    }) ?? "";

  const status =
    useWatch({
      control,
      name: "status",
    }) ?? "DRAFT";

  const selectedWebsite = useMemo(
    () => websites.find((website) => website.id === websiteId) ?? null,
    [websites, websiteId],
  );

  const previewThumbnail = shareThumbnail.trim() || thumbnail.trim();

  const previewDisplayDuration = useMemo(
    () => getDisplayDuration(displayHours, displayMinutes, displaySeconds),
    [displayHours, displayMinutes, displaySeconds],
  );

  const shareUrl = useMemo(
    () =>
      getShareUrl(
        selectedWebsite?.domain ?? null,

        slug,
      ),
    [selectedWebsite, slug],
  );

  const targetHostname = useMemo(() => getHostname(targetUrl), [targetUrl]);

  function handleTitleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;

    const previousGeneratedSlug = createSlug(title);

    setValue("title", value, {
      shouldDirty: true,

      shouldValidate: true,
    });

    if (!slug || slug === previousGeneratedSlug) {
      setValue("slug", createSlug(value), {
        shouldDirty: true,

        shouldValidate: true,
      });
    }
  }

  function handleSlugChange(event: React.ChangeEvent<HTMLInputElement>) {
    setValue("slug", createSlug(event.target.value), {
      shouldDirty: true,

      shouldValidate: true,
    });
  }

  async function onSubmit(values: SocialShareFormValues) {
    const duration = getActualDuration(
      values.actualHours,
      values.actualMinutes,
      values.actualSeconds,
    );

    const displayDuration = getDisplayDuration(
      values.displayHours,
      values.displayMinutes,
      values.displaySeconds,
    );

    const payload = {
      /*
       * websiteId hanya dibutuhkan POST.
       * Central API PUT memakai websiteId dari query.
       */
      ...(isEdit
        ? {}
        : {
            websiteId: values.websiteId,
          }),

      title: values.title.trim(),

      slug: values.slug.trim(),

      description: values.description.trim() || null,

      videoUrl: values.videoUrl.trim(),

      thumbnail: values.thumbnail.trim(),

      shareThumbnail: values.shareThumbnail.trim() || null,

      duration,

      displayDuration,

      targetUrl: values.targetUrl.trim(),

      status: values.status,
    };

    const endpoint =
      isEdit && socialShare
        ? `/api/admin/social-shares/${encodeURIComponent(
            socialShare.id,
          )}?website=${encodeURIComponent(socialShare.websiteId)}`
        : "/api/admin/social-shares";

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

      const result = await parseMutationResponse(response);

      if (!response.ok || !result.success) {
        toast.error(
          result.error ??
            (isEdit
              ? `Unable to update social share (${response.status}).`
              : `Unable to create social share (${response.status}).`),
        );

        return;
      }

      toast.success(
        result.message ??
          (isEdit
            ? "Social share updated successfully."
            : "Social share created successfully."),
      );

      const resultId = result.data?.id ?? socialShare?.id;

      const resultWebsiteId =
        result.data?.websiteId ?? socialShare?.websiteId ?? values.websiteId;

      if (resultId) {
        router.replace(
          `/social-shares/${encodeURIComponent(
            resultId,
          )}?website=${encodeURIComponent(resultWebsiteId)}`,
        );
      } else {
        router.replace(
          `/social-shares?website=${encodeURIComponent(resultWebsiteId)}`,
        );
      }

      router.refresh();
    } catch (error) {
      console.error("[SOCIAL SHARE FORM]", error);

      toast.error("Central API is unavailable.");
    }
  }

  return (
    <form
      id="social-share-form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-6"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>
                {isEdit ? "Edit social share" : "Social share information"}
              </CardTitle>

              <CardDescription>
                {isEdit
                  ? "Update Social Share information and public configuration."
                  : "Configure the website, title, public URL, and description."}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="websiteId">Website</Label>

                <Controller
                  control={control}
                  name="websiteId"
                  render={({ field }) => (
                    <Select
                      items={websiteItems}
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting || isEdit}
                    >
                      <SelectTrigger
                        id="websiteId"
                        className="w-full"
                        aria-invalid={Boolean(errors.websiteId)}
                      >
                        <SelectValue placeholder="Select website" />
                      </SelectTrigger>

                      <SelectContent>
                        {websites.map((website) => (
                          <SelectItem key={website.id} value={website.id}>
                            {website.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />

                {isEdit ? (
                  <TypographyMuted>
                    A Social Share cannot be moved to another website.
                  </TypographyMuted>
                ) : null}

                {errors.websiteId?.message ? (
                  <TypographyMuted className="text-destructive">
                    {errors.websiteId.message}
                  </TypographyMuted>
                ) : null}
              </div>

              <Separator />

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>

                  <Input
                    id="title"
                    value={title}
                    disabled={isSubmitting}
                    placeholder="Video 123"
                    aria-invalid={Boolean(errors.title)}
                    onChange={handleTitleChange}
                  />

                  {errors.title?.message ? (
                    <TypographyMuted className="text-destructive">
                      {errors.title.message}
                    </TypographyMuted>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>

                  <Input
                    id="slug"
                    value={slug}
                    disabled={isSubmitting}
                    placeholder="video-123"
                    aria-invalid={Boolean(errors.slug)}
                    onChange={handleSlugChange}
                  />

                  {errors.slug?.message ? (
                    <TypographyMuted className="text-destructive">
                      {errors.slug.message}
                    </TypographyMuted>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Share URL</Label>

                <div className="rounded-lg border bg-muted/30 px-3 py-2.5">
                  {shareUrl ? (
                    <TypographySmall className="break-all">
                      {shareUrl}
                    </TypographySmall>
                  ) : (
                    <TypographyMuted>
                      The selected website does not have a domain.
                    </TypographyMuted>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>

                <Textarea
                  id="description"
                  disabled={isSubmitting}
                  placeholder="Optional description..."
                  rows={4}
                  aria-invalid={Boolean(errors.description)}
                  {...register("description")}
                />

                {errors.description?.message ? (
                  <TypographyMuted className="text-destructive">
                    {errors.description.message}
                  </TypographyMuted>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Media</CardTitle>

              <CardDescription>External CDN URLs only.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL</Label>

                <Input
                  id="videoUrl"
                  type="url"
                  disabled={isSubmitting}
                  placeholder="https://cdn.example.com/videos/video.mp4"
                  aria-invalid={Boolean(errors.videoUrl)}
                  {...register("videoUrl")}
                />

                {errors.videoUrl?.message ? (
                  <TypographyMuted className="text-destructive">
                    {errors.videoUrl.message}
                  </TypographyMuted>
                ) : null}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail URL</Label>

                <Input
                  id="thumbnail"
                  type="url"
                  disabled={isSubmitting}
                  placeholder="https://cdn.example.com/thumbnails/video.jpg"
                  aria-invalid={Boolean(errors.thumbnail)}
                  {...register("thumbnail")}
                />

                {errors.thumbnail?.message ? (
                  <TypographyMuted className="text-destructive">
                    {errors.thumbnail.message}
                  </TypographyMuted>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="shareThumbnail">Share thumbnail URL</Label>

                <Input
                  id="shareThumbnail"
                  type="url"
                  disabled={isSubmitting}
                  placeholder="Optional"
                  aria-invalid={Boolean(errors.shareThumbnail)}
                  {...register("shareThumbnail")}
                />

                {errors.shareThumbnail?.message ? (
                  <TypographyMuted className="text-destructive">
                    {errors.shareThumbnail.message}
                  </TypographyMuted>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Duration</CardTitle>

              <CardDescription>
                Actual and display durations are configured separately.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div>
                  <TypographySmall>Actual duration</TypographySmall>

                  <TypographyMuted className="mt-1">
                    Real duration of the video.
                  </TypographyMuted>
                </div>

                <DurationFields
                  prefix="actual"
                  register={register}
                  errors={errors}
                  disabled={isSubmitting}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <div>
                  <TypographySmall>Display duration</TypographySmall>

                  <TypographyMuted className="mt-1">
                    Visual duration label shown on the thumbnail.
                  </TypographyMuted>
                </div>

                <DurationFields
                  prefix="display"
                  register={register}
                  errors={errors}
                  disabled={isSubmitting}
                />

                {previewDisplayDuration ? (
                  <TypographyMuted>
                    Displayed as{" "}
                    <span className="font-medium text-foreground">
                      {previewDisplayDuration}
                    </span>
                  </TypographyMuted>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Destination</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="targetUrl">Target URL</Label>

                <Input
                  id="targetUrl"
                  type="url"
                  disabled={isSubmitting}
                  placeholder="https://web-bb.com/watch/video-123"
                  aria-invalid={Boolean(errors.targetUrl)}
                  {...register("targetUrl")}
                />

                {errors.targetUrl?.message ? (
                  <TypographyMuted className="text-destructive">
                    {errors.targetUrl.message}
                  </TypographyMuted>
                ) : null}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>

                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select
                      items={STATUS_ITEMS}
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="status" className="w-full">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>

                        <SelectItem value="ACTIVE">Active</SelectItem>

                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />

                {errors.status?.message ? (
                  <TypographyMuted className="text-destructive">
                    {errors.status.message}
                  </TypographyMuted>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="shadow-none xl:sticky xl:top-6">
            <CardHeader>
              <CardTitle>Social preview</CardTitle>

              <CardDescription>
                Preview the configured social card.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
                {previewThumbnail ? (
                  <AppImage
                    src={previewThumbnail}
                    alt={title || "Social share preview"}
                    width={640}
                    height={360}
                    unoptimized
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <TypographyMuted>Thumbnail preview</TypographyMuted>
                  </div>
                )}

                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-black/70 text-white shadow-sm">
                    <Play className="ml-0.5 size-5 fill-current" />
                  </div>
                </div>

                {previewDisplayDuration ? (
                  <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-1 text-xs font-medium leading-none text-white">
                    {previewDisplayDuration}
                  </span>
                ) : null}
              </div>

              <div className="min-w-0">
                <TypographySmall className="block truncate">
                  {title || "Social share title"}
                </TypographySmall>

                {shareUrl ? (
                  <TypographyMuted className="mt-1 break-all">
                    {shareUrl}
                  </TypographyMuted>
                ) : (
                  <TypographyMuted className="mt-1">
                    No public share URL
                  </TypographyMuted>
                )}
              </div>

              <Separator />

              <div>
                <TypographyMuted>Destination</TypographyMuted>

                {targetUrl ? (
                  <a
                    href={targetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 flex min-w-0 items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary"
                  >
                    <span className="truncate">
                      {targetHostname ?? targetUrl}
                    </span>

                    <ExternalLink className="size-3.5 shrink-0" />
                  </a>
                ) : (
                  <TypographySmall className="mt-1">
                    No target URL
                  </TypographySmall>
                )}
              </div>

              <Separator />

              <div>
                <TypographyMuted>Status</TypographyMuted>

                <div className="mt-2">
                  <StatusBadge status={status} />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => {
                  if (isEdit && socialShare) {
                    router.push(
                      `/social-shares/${socialShare.id}?website=${encodeURIComponent(
                        socialShare.websiteId,
                      )}`,
                    );

                    return;
                  }

                  router.back();
                }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                form="social-share-form"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />

                    {isEdit ? "Saving..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save className="size-4" />

                    {isEdit ? "Save changes" : "Create"}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </form>
  );
}
