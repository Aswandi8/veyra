"use client";

import { useEffect, useId, useState } from "react";

import { createPortal } from "react-dom";

import Link from "next/link";

import { useRouter } from "next/navigation";

import {
  ExternalLink,
  Eye,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
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
  SocialShareDeleteResponse,
  SocialShareListItem,
} from "@/lib/social-shares/types";

// ============================================================
// TYPES
// ============================================================

interface SocialShareActionsProps {
  socialShare: SocialShareListItem;

  canUpdate: boolean;
  canDelete: boolean;
}

interface SocialShareDeleteButtonProps {
  socialShare: SocialShareListItem;

  redirectAfterDelete?: boolean;

  disabled?: boolean;
}

// ============================================================
// DELETE RESPONSE
// ============================================================

async function parseDeleteResponse(
  response: Response,
): Promise<SocialShareDeleteResponse> {
  const text = await response.text();

  if (!text) {
    return {
      success: false,

      error: `Server returned an empty response (${response.status})`,
    };
  }

  try {
    return JSON.parse(text) as SocialShareDeleteResponse;
  } catch {
    console.error("[SOCIAL SHARE DELETE INVALID RESPONSE]", {
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
// DELETE DIALOG
// ============================================================

function SocialShareDeleteDialog({
  socialShare,
  open,
  onOpenChange,
  redirectAfterDelete,
}: {
  socialShare: SocialShareListItem;

  open: boolean;

  onOpenChange: (open: boolean) => void;

  redirectAfterDelete: boolean;
}) {
  const router = useRouter();

  const titleId = useId();

  const descriptionId = useId();

  const [deleting, setDeleting] = useState(false);

  // ==========================================================
  // DIALOG EFFECT
  // ==========================================================

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

  // ==========================================================
  // DELETE
  // ==========================================================

  async function handleDelete() {
    if (deleting) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(
        `/api/admin/social-shares/${encodeURIComponent(
          socialShare.id,
        )}?website=${encodeURIComponent(socialShare.websiteId)}`,
        {
          method: "DELETE",

          credentials: "include",

          cache: "no-store",
        },
      );

      const result = await parseDeleteResponse(response);

      if (!response.ok || !result.success) {
        toast.error(
          result.error ?? `Unable to delete social share (${response.status}).`,
        );

        return;
      }

      toast.success(result.message ?? "Social share deleted successfully.");

      onOpenChange(false);

      if (redirectAfterDelete) {
        router.replace(
          `/social-shares?website=${encodeURIComponent(socialShare.websiteId)}`,
        );
      }

      router.refresh();
    } catch (error) {
      console.error("[SOCIAL SHARE DELETE]", error);

      toast.error("Central API is unavailable.");
    } finally {
      setDeleting(false);
    }
  }

  // ==========================================================
  // CLOSED
  // ==========================================================

  if (!open || typeof document === "undefined") {
    return null;
  }

  // ==========================================================
  // PORTAL
  // ==========================================================

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      {/* BACKDROP */}

      <button
        type="button"
        aria-label="Close delete confirmation"
        className="absolute inset-0 bg-black/50"
        disabled={deleting}
        onClick={() => onOpenChange(false)}
      />

      {/* DIALOG */}

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative z-10 w-full max-w-md rounded-xl border bg-background p-6 shadow-lg"
      >
        {/* HEADER */}

        <div className="space-y-2">
          <h2
            id={titleId}
            className="font-display text-lg font-semibold tracking-tight"
          >
            Delete social share?
          </h2>

          <TypographyMuted id={descriptionId}>
            This action cannot be undone.
          </TypographyMuted>
        </div>

        {/* SOCIAL SHARE INFO */}

        <div className="mt-5 rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center justify-between gap-3">
            <TypographyP className="font-medium">
              {socialShare.title}
            </TypographyP>

            <StatusBadge status={socialShare.status} />
          </div>

          <TypographyMuted className="mt-1">
            /watch/
            {socialShare.slug}
          </TypographyMuted>

          <TypographyMuted className="mt-1">
            {socialShare.website.name}
          </TypographyMuted>

          {socialShare.website.domain ? (
            <TypographyMuted className="mt-1">
              {socialShare.website.domain}
            </TypographyMuted>
          ) : null}
        </div>

        {/* WARNING */}

        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <TypographyMuted className="text-destructive">
            This Social Share record will be permanently removed. External CDN
            video and thumbnail files will not be deleted.
          </TypographyMuted>
        </div>

        {/* ACTIONS */}

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
                Delete social share
              </>
            )}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ============================================================
// DETAIL DELETE BUTTON
// ============================================================

export function SocialShareDeleteButton({
  socialShare,
  redirectAfterDelete = true,
  disabled = false,
}: SocialShareDeleteButtonProps) {
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

      <SocialShareDeleteDialog
        socialShare={socialShare}
        open={open}
        onOpenChange={setOpen}
        redirectAfterDelete={redirectAfterDelete}
      />
    </>
  );
}

// ============================================================
// TABLE ACTIONS
// ============================================================

export function SocialShareActions({
  socialShare,
  canUpdate,
  canDelete,
}: SocialShareActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  const detailHref = `/social-shares/${encodeURIComponent(
    socialShare.id,
  )}?website=${encodeURIComponent(socialShare.websiteId)}`;

  const editHref = `/social-shares/${encodeURIComponent(
    socialShare.id,
  )}/edit?website=${encodeURIComponent(socialShare.websiteId)}`;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Open actions for ${socialShare.title}`}
            />
          }
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-48">
          {/* =================================================
              VIEW
          ================================================= */}

          <DropdownMenuItem
            nativeButton={false}
            render={<Link href={detailHref} />}
          >
            <Eye className="size-4" />
            View
          </DropdownMenuItem>

          {/* =================================================
              EDIT
          ================================================= */}

          {canUpdate ? (
            <DropdownMenuItem
              nativeButton={false}
              render={<Link href={editHref} />}
            >
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
          ) : null}

          {/* =================================================
              EXTERNAL
          ================================================= */}

          <DropdownMenuSeparator />

          {socialShare.shareUrl ? (
            <DropdownMenuItem
              nativeButton={false}
              render={
                <a
                  href={socialShare.shareUrl}
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >
              <ExternalLink className="size-4" />
              Open share URL
            </DropdownMenuItem>
          ) : null}

          <DropdownMenuItem
            nativeButton={false}
            render={
              <a
                href={socialShare.targetUrl}
                target="_blank"
                rel="noreferrer"
              />
            }
          >
            <ExternalLink className="size-4" />
            Open target
          </DropdownMenuItem>

          {/* =================================================
              DELETE
          ================================================= */}

          {canDelete ? (
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

      <SocialShareDeleteDialog
        socialShare={socialShare}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        redirectAfterDelete={false}
      />
    </>
  );
}
