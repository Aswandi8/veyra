"use client";

import { useState } from "react";

import { Ban } from "lucide-react";

import { useRouter } from "next/navigation";

import { ConfirmDialog } from "@/components/common/dialog/confirm-dialog";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

import type { WebsiteInvitation } from "@/lib/invitations/types";

interface RevokeInvitationDialogProps {
  websiteId: string;

  invitation: WebsiteInvitation;
}

interface MutationResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export function RevokeInvitationDialog({
  websiteId,
  invitation,
}: RevokeInvitationDialogProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  async function revokeInvitation() {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/websites/${encodeURIComponent(
          websiteId,
        )}/invitations/${encodeURIComponent(invitation.id)}`,
        {
          method: "DELETE",
        },
      );

      const result = (await response.json()) as MutationResponse;

      if (!response.ok || !result.success) {
        console.error(result.error ?? "Unable to revoke invitation.");

        setOpen(false);

        return;
      }

      setOpen(false);

      router.refresh();
    } catch (error) {
      console.error("[REVOKE INVITATION]", error);

      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <DropdownMenuItem variant="destructive" onClick={() => setOpen(true)}>
        <Ban />
        Revoke invitation
      </DropdownMenuItem>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Revoke invitation"
        description={`Revoke the invitation for ${invitation.email}? The existing invitation link will no longer be valid.`}
        confirmLabel="Revoke invitation"
        destructive
        loading={loading}
        onConfirm={() => void revokeInvitation()}
      />
    </>
  );
}
