"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";

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
import { Textarea } from "@/components/ui/textarea";
import { TypographyMuted } from "@/components/ui/typography";

import { parseApiResponse } from "@/lib/api/response";
import {
  websiteFormSchema,
  type WebsiteFormValues,
} from "@/lib/websites/schema";
import type {
  WebsiteDetail,
  WebsiteMutationResponse,
  WebsiteStatus,
} from "@/lib/websites/types";

type WebsiteFormMode = "create" | "edit";

interface WebsiteFormProps {
  mode: WebsiteFormMode;
  website?: WebsiteDetail;
}

const WEBSITE_STATUSES: readonly WebsiteStatus[] = [
  "ACTIVE",
  "INACTIVE",
  "MAINTENANCE",
];

export function WebsiteForm({ mode, website }: WebsiteFormProps) {
  const router = useRouter();
  const [isNavigating, startNavigation] = useTransition();
  const isEdit = mode === "edit";

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<WebsiteFormValues>({
    resolver: zodResolver(websiteFormSchema),
    defaultValues: {
      name: website?.name ?? "",
      slug: website?.slug ?? "",
      description: website?.description ?? "",
      domain: website?.domain ?? "",
      status: website?.status ?? "ACTIVE",
    },
  });

  const status = useWatch({ control, name: "status" });
  const pending = isSubmitting || isNavigating;

  async function onSubmit(values: WebsiteFormValues) {
    const payload = {
      name: values.name.trim(),
      slug: values.slug.trim(),
      description: values.description?.trim() || null,
      domain: values.domain?.trim() || null,
      status: values.status,
    };

    const endpoint =
      isEdit && website
        ? `/api/admin/websites/${website.id}`
        : "/api/admin/websites";

    try {
      const response = await fetch(endpoint, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify(payload),
      });

      const result = await parseApiResponse<WebsiteMutationResponse>(
        response,
        "WEBSITE MUTATION",
      );

      if (!response.ok || !result.success) {
        toast.error(
          result.error ??
            (isEdit
              ? `Unable to update website (${response.status}).`
              : `Unable to create website (${response.status}).`),
        );
        return;
      }

      toast.success(
        result.message ??
          (isEdit
            ? "Website updated successfully."
            : "Website created successfully."),
      );

      const websiteId = result.data?.id ?? website?.id;

      startNavigation(() => {
        router.replace(websiteId ? `/websites/${websiteId}` : "/websites");
      });
    } catch (error) {
      console.error("[WEBSITE FORM]", error);
      toast.error("Central API is unavailable.");
    }
  }

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit website" : "Website information"}</CardTitle>
        <CardDescription>
          {isEdit
            ? "Update website information and status."
            : "Create a new website connected to Veyra."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          id="website-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-6"
        >
          {isEdit && website ? (
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={website.status} />
            </div>
          ) : null}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Website name</Label>
              <Input
                id="name"
                disabled={pending}
                placeholder="Arvane"
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />

              {errors.name?.message ? (
                <TypographyMuted className="text-destructive">
                  {errors.name.message}
                </TypographyMuted>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                disabled={pending}
                placeholder="arvane"
                aria-invalid={Boolean(errors.slug)}
                {...register("slug")}
              />

              {errors.slug?.message ? (
                <TypographyMuted className="text-destructive">
                  {errors.slug.message}
                </TypographyMuted>
              ) : (
                <TypographyMuted>
                  Lowercase letters, numbers, and hyphens only.
                </TypographyMuted>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain"
              disabled={pending}
              placeholder="arvane.com"
              aria-invalid={Boolean(errors.domain)}
              {...register("domain")}
            />

            {errors.domain?.message ? (
              <TypographyMuted className="text-destructive">
                {errors.domain.message}
              </TypographyMuted>
            ) : (
              <TypographyMuted>
                Optional. Enter the domain without protocol.
              </TypographyMuted>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              disabled={pending}
              placeholder="Describe this website..."
              aria-invalid={Boolean(errors.description)}
              {...register("description")}
            />

            {errors.description?.message ? (
              <TypographyMuted className="text-destructive">
                {errors.description.message}
              </TypographyMuted>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Status</Label>

            <Select
              value={status}
              onValueChange={(value) =>
                setValue("status", value as WebsiteStatus, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              disabled={pending}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {WEBSITE_STATUSES.map((item) => (
                  <SelectItem key={item} value={item}>
                    <StatusBadge status={item} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {errors.status?.message ? (
              <TypographyMuted className="text-destructive">
                {errors.status.message}
              </TypographyMuted>
            ) : null}
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() =>
            router.push(
              isEdit && website ? `/websites/${website.id}` : "/websites",
            )
          }
        >
          Cancel
        </Button>

        <Button type="submit" form="website-form" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {isEdit ? "Saving..." : "Creating..."}
            </>
          ) : (
            <>
              <Save className="size-4" />
              {isEdit ? "Save changes" : "Create website"}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
