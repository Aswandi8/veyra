"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Ban, Loader2, MoreHorizontal } from "lucide-react";
import toast from "react-hot-toast";

import { StatusBadge } from "@/components/common/status/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TypographyMuted, TypographyP } from "@/components/ui/typography";

import { parseApiResponse } from "@/lib/api/response";
import type {
  InvitationListItem,
  InvitationRevokeResponse,
} from "@/lib/invitations/types";

interface InvitationActionsProps {
  websiteId: string;
  invitation: InvitationListItem;
  canRevoke: boolean;
}

export function InvitationActions({
  websiteId,
  invitation,
  canRevoke,
}: InvitationActionsProps) {
  const router = useRouter();
  const titleId = useId();
  const descriptionId = useId();

  const [open, setOpen] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [isRefreshing, startRefresh] = useTransition();

  const pending = revoking || isRefreshing;

  const canRevokeInvitation = canRevoke && invitation.status === "PENDING";

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) setOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, pending]);

  async function handleRevoke() {
    if (pending) return;

    setRevoking(true);

    try {
      const response = await fetch(
        `/api/admin/websites/${websiteId}/invitations/${invitation.id}`,
        {
          method: "DELETE",
          credentials: "include",
          cache: "no-store",
        },
      );

      const result = await parseApiResponse<InvitationRevokeResponse>(
        response,
        "INVITATION REVOKE",
      );

      if (!response.ok || !result.success) {
        toast.error(
          result.error ?? `Unable to revoke invitation (${response.status}).`,
        );
        return;
      }

      toast.success(result.message ?? "Invitation revoked successfully.");
      setOpen(false);

      startRefresh(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("[INVITATION REVOKE]", error);
      toast.error("Central API is unavailable.");
    } finally {
      setRevoking(false);
    }
  }

  if (!canRevokeInvitation) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Open actions for ${invitation.email}`}
            />
          }
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => setOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Ban className="size-4" />
            Revoke
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <button
                type="button"
                className="absolute inset-0 bg-black/50"
                aria-label="Close revoke confirmation"
                disabled={pending}
                onClick={() => setOpen(false)}
              />

              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={descriptionId}
                className="relative z-10 w-full max-w-md rounded-xl border bg-background p-6 shadow-lg"
              >
                <h2 id={titleId} className="font-display text-lg font-semibold">
                  Revoke invitation?
                </h2>

                <TypographyMuted id={descriptionId} className="mt-1">
                  The invitation link will no longer be usable.
                </TypographyMuted>

                <div className="mt-5 rounded-lg border bg-muted/30 p-4">
                  <TypographyP className="font-medium">
                    {invitation.name}
                  </TypographyP>

                  <TypographyMuted className="mt-1">
                    {invitation.email}
                  </TypographyMuted>

                  <div className="mt-3 flex gap-2">
                    <StatusBadge status={invitation.role.name} />
                    <StatusBadge status={invitation.status} />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={pending}
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    variant="destructive"
                    disabled={pending}
                    onClick={handleRevoke}
                  >
                    {pending ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Revoking...
                      </>
                    ) : (
                      <>
                        <Ban className="size-4" />
                        Revoke
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
