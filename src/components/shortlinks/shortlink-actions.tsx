"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  Loader2,
  MoreHorizontal,
  Pencil,
  Share2,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

import { StatusBadge } from "@/components/common/status/status-badge";
import { ShortLinkShareMenuItems } from "@/components/shortlinks/shortlink-share-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TypographyMuted, TypographyP } from "@/components/ui/typography";

import { parseApiResponse } from "@/lib/api/response";
import { getPublicShortLinkUrl } from "@/lib/shortlinks/public-url";
import type {
  ShortLinkDeleteResponse,
  ShortLinkListItem,
} from "@/lib/shortlinks/types";

interface ShortLinkActionsProps {
  shortLink: ShortLinkListItem;
  canUpdate: boolean;
  canDelete: boolean;
}

interface ShortLinkDeleteButtonProps {
  shortLink: ShortLinkListItem;
  redirectAfterDelete?: boolean;
}

function DeleteDialog({
  shortLink,
  open,
  onOpenChange,
  redirectAfterDelete,
}: {
  shortLink: ShortLinkListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectAfterDelete: boolean;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [isNavigating, startNavigation] = useTransition();
  const pending = deleting || isNavigating;

  async function handleDelete() {
    if (pending) return;
    setDeleting(true);

    try {
      const response = await fetch(`/api/admin/shortlinks/${shortLink.id}`, {
        method: "DELETE",
        credentials: "include",
        cache: "no-store",
      });

      const result = await parseApiResponse<ShortLinkDeleteResponse>(
        response,
        "SHORTLINK DELETE",
      );

      if (!response.ok || !result.success) {
        toast.error(
          result.error ?? `Unable to delete shortlink (${response.status}).`,
        );
        return;
      }

      toast.success(result.message ?? "Shortlink deleted successfully.");
      onOpenChange(false);

      startNavigation(() => {
        if (redirectAfterDelete) {
          router.replace("/shortlinks");
          return;
        }

        router.refresh();
      });
    } catch (error) {
      console.error("[SHORTLINK DELETE]", error);
      toast.error("Central API is unavailable.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => !pending && onOpenChange(value)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete shortlink?</DialogTitle>

          <DialogDescription>
            The shortlink and all of its analytics events will be permanently
            deleted.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/30 p-4">
          <TypographyP className="font-medium">/{shortLink.slug}</TypographyP>

          <TypographyMuted className="mt-1 break-all">
            {shortLink.destinationUrl}
          </TypographyMuted>

          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge status={shortLink.status} />
            <StatusBadge status={shortLink.previewType} />
          </div>

          <TypographyMuted className="mt-3">
            {shortLink.clickCount.toLocaleString()} recorded clicks will also be
            removed.
          </TypographyMuted>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => onOpenChange(false)}
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
                Delete shortlink
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ShortLinkDeleteButton({
  shortLink,
  redirectAfterDelete = true,
}: ShortLinkDeleteButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="destructive" onClick={() => setOpen(true)}>
        <Trash2 className="size-4" />
        Delete
      </Button>

      <DeleteDialog
        shortLink={shortLink}
        open={open}
        onOpenChange={setOpen}
        redirectAfterDelete={redirectAfterDelete}
      />
    </>
  );
}

export function ShortLinkActions({
  shortLink,
  canUpdate,
  canDelete,
}: ShortLinkActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const publicUrl = getPublicShortLinkUrl(shortLink.slug);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Open actions for ${shortLink.slug}`}
            />
          }
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-52">
          <DropdownMenuGroup>
            <DropdownMenuItem
              nativeButton={false}
              render={<Link href={`/shortlinks/${shortLink.id}`} />}
            >
              <Eye className="size-4" />
              View
            </DropdownMenuItem>

            {canUpdate ? (
              <DropdownMenuItem
                nativeButton={false}
                render={<Link href={`/shortlinks/${shortLink.id}/edit`} />}
              >
                <Pencil className="size-4" />
                Edit
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuLabel className="flex items-center gap-1.5">
              <Share2 className="size-3.5" />
              Share
            </DropdownMenuLabel>

            <ShortLinkShareMenuItems
              url={publicUrl}
              title={shortLink.title}
              description={shortLink.description}
            />
          </DropdownMenuGroup>

          {canDelete ? (
            <>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteDialog
        shortLink={shortLink}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        redirectAfterDelete={false}
      />
    </>
  );
}
