"use client";

import { useEffect, useId, useState } from "react";

import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Eye,
  Loader2,
  Mail,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";

import { StatusBadge } from "@/components/common/status/status-badge";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TypographyMuted, TypographyP } from "@/components/ui/typography";

import type {
  WebsiteDeleteResponse,
  WebsiteListItem,
} from "@/lib/websites/types";

interface WebsiteActionsProps {
  website: WebsiteListItem;
  canUpdate: boolean;
  canDelete: boolean;
}

interface WebsiteDeleteButtonProps {
  website: WebsiteListItem;
  redirectAfterDelete?: boolean;
  disabled?: boolean;
}

async function parseDeleteResponse(
  response: Response,
): Promise<WebsiteDeleteResponse> {
  const text = await response.text();

  if (!text) {
    return {
      success: false,
      error: `Server returned an empty response (${response.status})`,
    };
  }

  try {
    return JSON.parse(text) as WebsiteDeleteResponse;
  } catch {
    console.error("[WEBSITE DELETE INVALID RESPONSE]", {
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

function WebsiteDeleteDialog({
  website,
  open,
  onOpenChange,
  redirectAfterDelete,
}: {
  website: WebsiteListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectAfterDelete: boolean;
}) {
  const router = useRouter();
  const titleId = useId();
  const descriptionId = useId();
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !deleting) {
        onOpenChange(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, deleting, onOpenChange]);

  async function handleDelete() {
    if (deleting) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/admin/websites/${website.id}`, {
        method: "DELETE",
        credentials: "include",
        cache: "no-store",
      });

      const result = await parseDeleteResponse(response);

      if (!response.ok || !result.success) {
        toast.error(
          result.error ?? `Unable to delete website (${response.status}).`,
        );
        return;
      }

      toast.success(result.message ?? "Website deleted successfully.");

      onOpenChange(false);

      if (redirectAfterDelete) {
        router.replace("/websites");
      }

      router.refresh();
    } catch (error) {
      console.error("[WEBSITE DELETE]", error);
      toast.error("Central API is unavailable.");
    } finally {
      setDeleting(false);
    }
  }

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close delete confirmation"
        className="absolute inset-0 bg-black/50"
        disabled={deleting}
        onClick={() => onOpenChange(false)}
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
            Delete website?
          </h2>

          <TypographyMuted id={descriptionId}>
            This action cannot be undone.
          </TypographyMuted>
        </div>

        <div className="mt-5 rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center justify-between gap-3">
            <TypographyP className="font-medium">{website.name}</TypographyP>

            <StatusBadge status={website.status} />
          </div>

          <TypographyMuted className="mt-1">/{website.slug}</TypographyMuted>

          {website.domain ? (
            <TypographyMuted className="mt-1">{website.domain}</TypographyMuted>
          ) : null}
        </div>

        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <TypographyMuted className="text-destructive">
            This website will be permanently removed.
          </TypographyMuted>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={deleting}
            onClick={() => onOpenChange(false)}
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
                Delete website
              </>
            )}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function WebsiteDeleteButton({
  website,
  redirectAfterDelete = true,
  disabled = false,
}: WebsiteDeleteButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        <Trash2 className="size-4" />
        Delete
      </Button>

      <WebsiteDeleteDialog
        website={website}
        open={open}
        onOpenChange={setOpen}
        redirectAfterDelete={redirectAfterDelete}
      />
    </>
  );
}

export function WebsiteActions({
  website,
  canUpdate,
  canDelete,
}: WebsiteActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  const hasBlockingData =
    website.statistics.videos > 0 ||
    website.statistics.categories > 0 ||
    website.statistics.views > 0 ||
    website.statistics.apiClients > 0;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Open actions for ${website.name}`}
            />
          }
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuItem
            nativeButton={false}
            render={<Link href={`/websites/${website.id}`} />}
          >
            <Eye className="size-4" />
            View
          </DropdownMenuItem>

          {canUpdate ? (
            <DropdownMenuItem
              nativeButton={false}
              render={<Link href={`/websites/${website.id}/edit`} />}
            >
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
          ) : null}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            nativeButton={false}
            render={<Link href={`/websites/${website.id}/members`} />}
          >
            <Users className="size-4" />
            Members
          </DropdownMenuItem>

          <DropdownMenuItem
            nativeButton={false}
            render={<Link href={`/websites/${website.id}/invitations`} />}
          >
            <Mail className="size-4" />
            Invitations
          </DropdownMenuItem>

          {canDelete ? (
            <>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                disabled={hasBlockingData}
                onClick={() => {
                  if (!hasBlockingData) {
                    setDeleteOpen(true);
                  }
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <WebsiteDeleteDialog
        website={website}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        redirectAfterDelete={false}
      />
    </>
  );
}
