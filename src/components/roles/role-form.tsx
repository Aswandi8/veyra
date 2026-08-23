"use client";

import { useMemo } from "react";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TypographyMuted } from "@/components/ui/typography";

import { roleFormSchema, type RoleFormValues } from "@/lib/roles/schema";

import type {
  PermissionListItem,
  RoleDetail,
  RoleMutationResponse,
} from "@/lib/roles/types";

type RoleFormMode = "create" | "edit";

interface RoleFormProps {
  mode: RoleFormMode;
  permissions: PermissionListItem[];
  role?: RoleDetail;
}

interface PermissionGroup {
  name: string;
  permissions: PermissionListItem[];
}

function formatPermissionGroup(value: string): string {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

async function parseMutationResponse(
  response: Response,
): Promise<RoleMutationResponse> {
  const text = await response.text();

  if (!text) {
    return {
      success: false,
      error: `Server returned an empty response (${response.status})`,
    };
  }

  try {
    return JSON.parse(text) as RoleMutationResponse;
  } catch {
    console.error("[ROLE MUTATION INVALID RESPONSE]", {
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

export function RoleForm({ mode, permissions, role }: RoleFormProps) {
  const router = useRouter();

  const isEdit = mode === "edit";

  const isSystemRole = Boolean(role?.system);

  const selectedRolePermissions =
    role?.permissions.map((permission) => permission.name) ?? [];

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),

    defaultValues: {
      name: role?.name ?? "",
      description: role?.description ?? "",
      permissions: selectedRolePermissions,
    },
  });

  const selectedPermissions =
    useWatch({
      control,
      name: "permissions",
    }) ?? [];

  const groups = useMemo<PermissionGroup[]>(() => {
    const map = new Map<string, PermissionListItem[]>();

    for (const permission of permissions) {
      const group = permission.name.split(".")[0] ?? "other";

      const current = map.get(group) ?? [];

      current.push(permission);

      map.set(group, current);
    }

    return [...map.entries()].map(([name, groupPermissions]) => ({
      name,
      permissions: groupPermissions,
    }));
  }, [permissions]);

  function togglePermission(permissionName: string, checked: boolean) {
    const next = checked
      ? [...new Set([...selectedPermissions, permissionName])]
      : selectedPermissions.filter(
          (permission) => permission !== permissionName,
        );

    setValue("permissions", next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function toggleGroup(group: PermissionGroup, checked: boolean) {
    const names = group.permissions.map((permission) => permission.name);

    const next = checked
      ? [...new Set([...selectedPermissions, ...names])]
      : selectedPermissions.filter((permission) => !names.includes(permission));

    setValue("permissions", next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  async function onSubmit(values: RoleFormValues) {
    const payload = {
      name: values.name.trim(),

      description: values.description?.trim() || null,

      permissions: values.permissions,
    };

    const endpoint =
      isEdit && role ? `/api/admin/roles/${role.id}` : "/api/admin/roles";

    const method = isEdit ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
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
              ? `Unable to update role (${response.status}).`
              : `Unable to create role (${response.status}).`),
        );

        return;
      }

      toast.success(
        result.message ??
          (isEdit
            ? "Role updated successfully."
            : "Role created successfully."),
      );

      const roleId = result.data?.id ?? role?.id;

      if (roleId) {
        router.replace(`/roles/${roleId}`);
      } else {
        router.replace("/roles");
      }

      router.refresh();
    } catch (error) {
      console.error("[ROLE FORM]", error);

      toast.error("Central API is unavailable.");
    }
  }

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit role" : "Role information"}</CardTitle>

        <CardDescription>
          {isEdit
            ? "Update role information and permissions."
            : "Create a website-scoped role and assign its permissions."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          id="role-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-6"
        >
          {isEdit && role ? (
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={role.scope} />

              <StatusBadge status={role.system ? "SYSTEM" : "CUSTOM"} />

              {role.system ? <StatusBadge status={role.name} /> : null}
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="name">Role name</Label>

            <Input
              id="name"
              disabled={isSubmitting || (isEdit && isSystemRole)}
              placeholder="CONTENT_REVIEWER"
              aria-invalid={Boolean(errors.name)}
              {...register("name")}
            />

            {errors.name?.message ? (
              <TypographyMuted className="text-destructive">
                {errors.name.message}
              </TypographyMuted>
            ) : null}

            {isEdit && isSystemRole ? (
              <TypographyMuted>
                System role names cannot be changed.
              </TypographyMuted>
            ) : (
              <TypographyMuted>
                The Central API normalizes role names to uppercase.
              </TypographyMuted>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>

            <Textarea
              id="description"
              rows={4}
              disabled={isSubmitting}
              placeholder="Describe what this role is responsible for..."
              aria-invalid={Boolean(errors.description)}
              {...register("description")}
            />

            {errors.description?.message ? (
              <TypographyMuted className="text-destructive">
                {errors.description.message}
              </TypographyMuted>
            ) : null}
          </div>

          <div className="space-y-4">
            <div>
              <Label>Permissions</Label>

              <TypographyMuted className="mt-1">
                Select the permissions granted to this website role.
              </TypographyMuted>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {groups.map((group) => {
                const names = group.permissions.map(
                  (permission) => permission.name,
                );

                const selectedCount = names.filter((name) =>
                  selectedPermissions.includes(name),
                ).length;

                const allSelected =
                  names.length > 0 && selectedCount === names.length;

                return (
                  <div key={group.name} className="rounded-lg border p-4">
                    <div className="mb-4 flex items-center gap-3">
                      <Checkbox
                        checked={allSelected}
                        disabled={isSubmitting}
                        onCheckedChange={(checked) =>
                          toggleGroup(group, checked === true)
                        }
                      />

                      <div>
                        <div className="font-medium">
                          {formatPermissionGroup(group.name)}
                        </div>

                        <TypographyMuted>
                          {selectedCount} of {group.permissions.length} selected
                        </TypographyMuted>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {group.permissions.map((permission) => {
                        const checked = selectedPermissions.includes(
                          permission.name,
                        );

                        return (
                          <label
                            key={permission.id}
                            className="flex cursor-pointer items-start gap-3 rounded-md p-2 transition-colors hover:bg-muted/50"
                          >
                            <Checkbox
                              checked={checked}
                              disabled={isSubmitting}
                              onCheckedChange={(value) =>
                                togglePermission(
                                  permission.name,
                                  value === true,
                                )
                              }
                            />

                            <span className="min-w-0">
                              <span className="block text-sm font-medium">
                                {permission.name}
                              </span>

                              {permission.description ? (
                                <TypographyMuted className="mt-0.5 block">
                                  {permission.description}
                                </TypographyMuted>
                              ) : null}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {errors.permissions?.message ? (
              <TypographyMuted className="text-destructive">
                {errors.permissions.message}
              </TypographyMuted>
            ) : null}
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => {
            if (isEdit && role) {
              router.push(`/roles/${role.id}`);

              return;
            }

            router.push("/roles");
          }}
        >
          Cancel
        </Button>

        <Button type="submit" form="role-form" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />

              {isEdit ? "Saving..." : "Creating..."}
            </>
          ) : (
            <>
              <Save className="size-4" />

              {isEdit ? "Save changes" : "Create role"}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
