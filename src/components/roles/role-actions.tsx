"use client";

import { useEffect, useId, useState } from "react";

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

import type { RoleDeleteResponse, RoleListItem } from "@/lib/roles/types";

interface RoleActionsProps {
  role: RoleListItem;
  canUpdate: boolean;
  canDelete: boolean;
}

async function parseDeleteResponse(
  response: Response,
): Promise<RoleDeleteResponse> {
  const text = await response.text();

  if (!text) {
    return {
      success: false,
      error: `Server returned an empty response (${response.status})`,
    };
  }

  try {
    return JSON.parse(text) as RoleDeleteResponse;
  } catch {
    console.error("[ROLE DELETE INVALID RESPONSE]", {
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

function formatRoleName(name: string): string {
  return name.replaceAll("_", " ");
}

export function RoleActions({ role, canUpdate, canDelete }: RoleActionsProps) {
  const router = useRouter();

  const titleId = useId();
  const descriptionId = useId();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canEdit = canUpdate && role.name !== "SUPER_ADMIN";

  const canDeleteRole = canDelete && !role.system;

  useEffect(() => {
    if (!deleteOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !deleting) {
        setDeleteOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      document.body.style.overflow = previousOverflow;
    };
  }, [deleteOpen, deleting]);

  async function handleDelete() {
    if (deleting) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/admin/roles/${role.id}`, {
        method: "DELETE",
        credentials: "include",
        cache: "no-store",
      });

      const result = await parseDeleteResponse(response);

      if (!response.ok || !result.success) {
        toast.error(
          result.error ?? `Unable to delete role (${response.status}).`,
        );

        return;
      }

      toast.success(result.message ?? "Role deleted successfully.");

      setDeleteOpen(false);

      router.refresh();
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
                disabled={deleting}
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
                    disabled={deleting}
                    onClick={() => setDeleteOpen(false)}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    variant="destructive"
                    disabled={deleting}
                    onClick={handleDelete}
                  >
                    {deleting ? (
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
