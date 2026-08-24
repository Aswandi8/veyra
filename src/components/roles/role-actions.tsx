"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TypographyMuted, TypographyP } from "@/components/ui/typography";

import { parseApiResponse } from "@/lib/api/response";
import type { RoleDeleteResponse, RoleListItem } from "@/lib/roles/types";

interface RoleActionsProps {
  role: RoleListItem;
  canUpdate: boolean;
  canDelete: boolean;
}

function formatRoleName(name: string): string {
  return name.replaceAll("_", " ");
}

export function RoleActions({ role, canUpdate, canDelete }: RoleActionsProps) {
  const router = useRouter();
  const titleId = useId();
  const descriptionId = useId();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isRefreshing, startRefresh] = useTransition();

  const pending = deleting || isRefreshing;
  const canEdit = canUpdate && role.name !== "SUPER_ADMIN";
  const canDeleteRole = canDelete && !role.system;

  useEffect(() => {
    if (!deleteOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) setDeleteOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [deleteOpen, pending]);

  async function handleDelete() {
    if (pending) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/admin/roles/${role.id}`, {
        method: "DELETE",
        credentials: "include",
        cache: "no-store",
      });

      const result = await parseApiResponse<RoleDeleteResponse>(
        response,
        "ROLE DELETE",
      );

      if (!response.ok || !result.success) {
        toast.error(
          result.error ?? `Unable to delete role (${response.status}).`,
        );
        return;
      }

      toast.success(result.message ?? "Role deleted successfully.");
      setDeleteOpen(false);

      startRefresh(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("[ROLE DELETE]", error);
      toast.error("Central API is unavailable.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Open actions for ${role.name}`}
            />
          }
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-40">
          <DropdownMenuItem
            nativeButton={false}
            render={<Link href={`/roles/${role.id}`} />}
          >
            <Eye className="size-4" />
            View
          </DropdownMenuItem>

          {canEdit ? (
            <DropdownMenuItem
              nativeButton={false}
              render={<Link href={`/roles/${role.id}/edit`} />}
            >
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
          ) : null}

          {canDeleteRole ? (
            <>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {deleteOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              role="presentation"
            >
              <button
                type="button"
                aria-label="Close delete confirmation"
                className="absolute inset-0 bg-black/50"
                disabled={pending}
                onClick={() => setDeleteOpen(false)}
              />

              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={descriptionId}
                className="relative z-10 w-full max-w-md rounded-xl border bg-background p-6 shadow-lg"
              >
                <div className="space-y-2">
                  <h2
                    id={titleId}
                    className="font-display text-lg font-semibold tracking-tight"
                  >
                    Delete role?
                  </h2>

                  <TypographyMuted id={descriptionId}>
                    This action cannot be undone.
                  </TypographyMuted>
                </div>

                <div className="mt-5 rounded-lg border bg-muted/30 p-4">
                  <TypographyP className="font-medium">
                    {formatRoleName(role.name)}
                  </TypographyP>

                  <TypographyMuted className="mt-1">
                    {role.description || "No description"}
                  </TypographyMuted>
                </div>

                {role.userCount > 0 || role.invitationCount > 0 ? (
                  <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                    <TypographyMuted className="text-destructive">
                      This role is currently in use. The Central API will
                      prevent deletion until all user assignments and invitation
                      references are removed.
                    </TypographyMuted>
                  </div>
                ) : null}

                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={pending}
                    onClick={() => setDeleteOpen(false)}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    variant="destructive"
                    disabled={pending}
                    onClick={handleDelete}
                  >
                    {pending ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="size-4" />
                        Delete role
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
