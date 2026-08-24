"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TypographyMuted } from "@/components/ui/typography";

import { parseApiResponse } from "@/lib/api/response";
import {
  invitationFormSchema,
  type InvitationFormValues,
} from "@/lib/invitations/schema";
import type {
  InvitationMutationResponse,
  InvitationRoleOption,
} from "@/lib/invitations/types";

interface InvitationFormProps {
  websiteId: string;
  roles: InvitationRoleOption[];
}

function formatRoleName(name: string): string {
  return name
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function InvitationForm({ websiteId, roles }: InvitationFormProps) {
  const router = useRouter();
  const [isNavigating, startNavigation] = useTransition();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InvitationFormValues>({
    resolver: zodResolver(invitationFormSchema),
    defaultValues: {
      name: "",
      email: "",
      roleId: "",
    },
  });

  const pending = isSubmitting || isNavigating;

  const roleItems = roles.map((role) => ({
    value: role.id,
    label: formatRoleName(role.name),
  }));

  async function onSubmit(values: InvitationFormValues) {
    try {
      const response = await fetch(
        `/api/admin/websites/${websiteId}/invitations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          cache: "no-store",
          body: JSON.stringify({
            name: values.name.trim(),
            email: values.email.trim().toLowerCase(),
            roleId: values.roleId,
          }),
        },
      );

      const result = await parseApiResponse<InvitationMutationResponse>(
        response,
        "INVITATION CREATE",
      );

      if (!response.ok || !result.success) {
        toast.error(
          result.error ?? `Unable to send invitation (${response.status}).`,
        );
        return;
      }

      toast.success(result.message ?? "Invitation sent successfully.");

      startNavigation(() => {
        router.replace(`/websites/${websiteId}/invitations`);
      });
    } catch (error) {
      console.error("[INVITATION FORM]", error);
      toast.error("Central API is unavailable.");
    }
  }

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Invite member</CardTitle>
        <CardDescription>
          Send an invitation to join this website with a specific role.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          id="invitation-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              disabled={pending}
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              disabled={pending}
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />

            {errors.email?.message ? (
              <TypographyMuted className="text-destructive">
                {errors.email.message}
              </TypographyMuted>
            ) : null}
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
          onClick={() => router.push(`/websites/${websiteId}/invitations`)}
        >
          Cancel
        </Button>

        <Button type="submit" form="invitation-form" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="size-4" />
              Send invitation
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
