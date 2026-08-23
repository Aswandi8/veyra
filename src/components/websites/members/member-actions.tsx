"use client";

import { useEffect, useId, useState } from "react";

import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Eye, Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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

import type { MemberListItem, MemberRemoveResponse } from "@/lib/members/types";

interface MemberActionsProps {
  websiteId: string;
  member: MemberListItem;
  canUpdate: boolean;
  canRemove: boolean;
}

async function parseRemoveResponse(
  response: Response,
): Promise<MemberRemoveResponse> {
  const text = await response.text();

  if (!text) {
    return {
      success: false,
      error: `Server returned an empty response (${response.status})`,
    };
  }

  try {
    return JSON.parse(text) as MemberRemoveResponse;
  } catch {
    console.error("[MEMBER REMOVE INVALID RESPONSE]", {
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

function RemoveMemberDialog({
  websiteId,
  member,
  open,
  onOpenChange,
}: {
  websiteId: string;
  member: MemberListItem;
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  const router = useRouter();

  const titleId = useId();

  const descriptionId = useId();

  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !removing) {
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
  }, [open, removing, onOpenChange]);

  async function handleRemove() {
    if (removing) {
      return;
    }

    setRemoving(true);

    try {
      const response = await fetch(`/api/admin/websites/${websiteId}/members`, {
        method: "DELETE",

        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",

        cache: "no-store",

        body: JSON.stringify({
          userId: member.userId,
        }),
      });

      const result = await parseRemoveResponse(response);

      if (!response.ok || !result.success) {
        toast.error(
          result.error ?? `Unable to remove member (${response.status}).`,
        );

        return;
      }

      toast.success(result.message ?? "Member removed successfully.");

      onOpenChange(false);

      router.refresh();
    } catch (error) {
      console.error("[MEMBER REMOVE]", error);

      toast.error("Central API is unavailable.");
    } finally {
      setRemoving(false);
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
        aria-label="Close remove member confirmation"
        className="absolute inset-0 bg-black/50"
        disabled={removing}
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
            Remove member?
          </h2>

          <TypographyMuted id={descriptionId}>
            This user will lose access to this website.
          </TypographyMuted>
        </div>

        <div className="mt-5 rounded-lg border bg-muted/30 p-4">
          <TypographyP className="font-medium">{member.name}</TypographyP>

          <TypographyMuted className="mt-1">{member.email}</TypographyMuted>

          <div className="mt-3">
            <StatusBadge status={member.role.name} />
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <TypographyMuted className="text-destructive">
            Removing this member only removes their access to this website.
            Their user account will not be deleted.
          </TypographyMuted>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={removing}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            disabled={removing}
            onClick={handleRemove}
          >
            {removing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Removing...
              </>
            ) : (
              <>
                <Trash2 className="size-4" />
                Remove member
              </>
            )}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function MemberActions({
  websiteId,
  member,
  canUpdate,
  canRemove,
}: MemberActionsProps) {
  const [removeOpen, setRemoveOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Open actions for ${member.name}`}
            />
          }
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-40">
          <DropdownMenuItem
            nativeButton={false}
            render={<Link href={`/users/${member.userId}`} />}
          >
            <Eye className="size-4" />
            View user
          </DropdownMenuItem>

          {canUpdate ? (
            <DropdownMenuItem
              nativeButton={false}
              render={
                <Link
                  href={`/websites/${websiteId}/members/${member.userId}/edit`}
                />
              }
            >
              <Pencil className="size-4" />
              Edit role
            </DropdownMenuItem>
          ) : null}

          {canRemove ? (
            <>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => setRemoveOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="size-4" />
                Remove
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <RemoveMemberDialog
        websiteId={websiteId}
        member={member}
        open={removeOpen}
        onOpenChange={setRemoveOpen}
      />
    </>
  );
}
