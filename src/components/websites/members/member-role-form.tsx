"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TypographyMuted, TypographyP } from "@/components/ui/typography";

import { parseApiResponse } from "@/lib/api/response";
import {
  memberRoleFormSchema,
  type MemberRoleFormValues,
} from "@/lib/members/schema";
import type {
  MemberListItem,
  MemberMutationResponse,
  WebsiteRoleOption,
} from "@/lib/members/types";

interface MemberRoleFormProps {
  websiteId: string;
  member: MemberListItem;
  roles: WebsiteRoleOption[];
}

function formatRoleName(name: string): string {
  return name
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function MemberRoleForm({
  websiteId,
  member,
  roles,
}: MemberRoleFormProps) {
  const router = useRouter();
  const [isNavigating, startNavigation] = useTransition();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MemberRoleFormValues>({
    resolver: zodResolver(memberRoleFormSchema),
    defaultValues: { roleId: member.role.id },
  });

  const pending = isSubmitting || isNavigating;

  const roleItems = roles.map((role) => ({
    value: role.id,
    label: formatRoleName(role.name),
  }));

  async function onSubmit(values: MemberRoleFormValues) {
    try {
      const response = await fetch(`/api/admin/websites/${websiteId}/members`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          userId: member.userId,
          roleId: values.roleId,
        }),
      });

      const result = await parseApiResponse<MemberMutationResponse>(
        response,
        "MEMBER ROLE",
      );

      if (!response.ok || !result.success) {
        toast.error(
          result.error ?? `Unable to update member role (${response.status}).`,
        );
        return;
      }

      toast.success(result.message ?? "Member role updated successfully.");

      startNavigation(() => {
        router.replace(`/websites/${websiteId}/members`);
      });
    } catch (error) {
      console.error("[MEMBER ROLE FORM]", error);
      toast.error("Central API is unavailable.");
    }
  }

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Edit member role</CardTitle>
        <CardDescription>
          Change this member&apos;s role for this website.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          id="member-role-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="rounded-lg border bg-muted/30 p-4">
            <TypographyP className="font-medium">{member.name}</TypographyP>
            <TypographyMuted className="mt-1">{member.email}</TypographyMuted>

            <div className="mt-3">
              <StatusBadge status={member.role.name} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Website role</Label>

            <Controller
              control={control}
              name="roleId"
              render={({ field }) => (
                <Select
                  items={roleItems}
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={pending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>

                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={role.name} />

                          {role.description ? (
                            <span className="text-muted-foreground">
                              {role.description}
                            </span>
                          ) : null}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />

            {errors.roleId?.message ? (
              <TypographyMuted className="text-destructive">
                {errors.roleId.message}
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
          onClick={() => router.push(`/websites/${websiteId}/members`)}
        >
          Cancel
        </Button>

        <Button type="submit" form="member-role-form" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="size-4" />
              Save changes
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
